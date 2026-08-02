import { ColumnDef, DatabaseConfig, RowData, SourceRule, ViewConfig } from "./types";
import { DatabaseViewState } from "../views/ViewStateStore";
import { isOptionColumnType } from "./ColumnTypes";
import { getRowFileFieldValue, isBaseFileField } from "./FileFields";
import { FORMULA_BUILTIN_CONSTANTS, scanFormulaSegments } from "./FormulaTokenizer";
import { updateSourceRuleTreeKeyReferences } from "./SourceRules";

/**
 * After JSON deserialization, db.schema and each view.schema can become
 * independent objects. The database-level schema is canonical so stale view
 * schema copies cannot resurrect renamed/deleted columns.
 */
export function linkDatabaseSchemas(databases: DatabaseConfig[]): void {
  for (const db of databases) {
    linkDatabaseSchema(db);
  }
}

export function linkDatabaseSchema(db: DatabaseConfig): void {
  if (!db.schema || !Array.isArray(db.schema.columns)) {
    db.schema = db.views?.find((view) => Array.isArray(view.schema?.columns))?.schema || {
      columns: [],
      computedFields: [],
    };
  }
  if (!Array.isArray(db.schema.computedFields)) db.schema.computedFields = [];

  if (db.schema.columns.length === 0) {
    const firstViewSchema = db.views?.find((view) => Array.isArray(view.schema?.columns) && view.schema.columns.length > 0)?.schema;
    if (firstViewSchema) {
      db.schema = {
        columns: firstViewSchema.columns || [],
        computedFields: firstViewSchema.computedFields || [],
      };
      if (!Array.isArray(db.schema.computedFields)) db.schema.computedFields = [];
    }
  }

  for (const view of db.views || []) {
    view.schema = db.schema;
  }
}

export function ensureColumnOrder(config: ViewConfig): void {
  if (!config.columnOrder || config.columnOrder.length === 0) {
    config.columnOrder = config.schema.columns.map((col) => col.key);
    return;
  }
  normalizeColumnOrder(config);
}

export function normalizeColumnOrder(config: ViewConfig): void {
  if (!config.columnOrder) return;
  const validKeys = new Set(config.schema.columns.map((col) => col.key));
  const normalized = config.columnOrder.filter((key, index, arr) =>
    validKeys.has(key) && arr.indexOf(key) === index
  );
  for (const col of config.schema.columns) {
    if (!normalized.includes(col.key)) normalized.push(col.key);
  }
  config.columnOrder = normalized;
}

export function getColumnsInOrder(config: ViewConfig): ColumnDef[] {
  if (!config.columnOrder || config.columnOrder.length === 0) {
    return config.schema.columns;
  }
  normalizeColumnOrder(config);
  const orderMap = new Map(config.columnOrder.map((key, index) => [key, index]));
  return [...config.schema.columns].sort((a, b) => {
    const ai = orderMap.get(a.key) ?? Number.MAX_SAFE_INTEGER;
    const bi = orderMap.get(b.key) ?? Number.MAX_SAFE_INTEGER;
    return ai - bi;
  });
}

export function getVisibleColumns(
  config: ViewConfig,
  rows: RowData[],
  state: DatabaseViewState,
  pendingShowColumns: Set<string>
): ColumnDef[] {
  const autoHidden = new Set<string>();
  const explicitlyOrderedKeys = new Set(config.columnOrder || []);
  const allCols = getColumnsInOrder(config);
  for (const col of allCols) {
    if (rows.length === 0) continue;
    if (col.type === "computed" || col.type === "rollup" || col.key === "file.name" || isOptionColumnType(col.type) || col.type === "checkbox") continue;
    if (pendingShowColumns.has(col.key)) continue;
    if (explicitlyOrderedKeys.has(col.key)) continue;
    const hasValue = rows.some((row) => {
      const val = isBaseFileField(col.key)
        ? getRowFileFieldValue(row, col.key)
        : col.computedKey ? row.computed[col.computedKey] : row.frontmatter[col.key];
      return val != null && val !== "" && val !== undefined;
    });
    if (!hasValue) autoHidden.add(col.key);
  }

  const hiddenColumns = state.hiddenColumns;
  return allCols.filter((col) => !hiddenColumns.has(col.key) && !autoHidden.has(col.key));
}

export function createUniqueColumnKey(config: ViewConfig, base: string): string {
  const keys = new Set(config.schema.columns.map((col) => col.key));
  if (!keys.has(base)) return base;
  let i = 1;
  let key = `${base}_${i}`;
  while (keys.has(key)) {
    i += 1;
    key = `${base}_${i}`;
  }
  return key;
}

export function updateColumnKeyReferences(
  config: ViewConfig,
  state: DatabaseViewState | undefined,
  oldKey: string,
  newKey: string,
  oldLabel?: string,
  newLabel?: string
): boolean {
  if (oldKey === newKey) {
    return updateComputedFormulaReferences(config, oldKey, newKey, oldLabel, newLabel);
  }
  let changed = false;
  const replaceValue = (value: string | undefined): string | undefined => {
    if (value !== oldKey) return value;
    changed = true;
    return newKey;
  };
  const replaceKeys = (keys: string[] | undefined): string[] | undefined => {
    if (!keys?.includes(oldKey)) return keys;
    changed = true;
    return keys.map((key) => key === oldKey ? newKey : key);
  };
  config.columnOrder = replaceKeys(config.columnOrder);
  config.titleField = replaceValue(config.titleField);
  config.recordIconField = replaceValue(config.recordIconField);
  config.galleryImageField = replaceValue(config.galleryImageField);
  config.boardImageField = replaceValue(config.boardImageField);
  config.boardGroupField = replaceValue(config.boardGroupField);
  config.boardSubgroupField = replaceValue(config.boardSubgroupField);
  config.chartGroupField = replaceValue(config.chartGroupField);
  config.chartStackField = replaceValue(config.chartStackField);
  config.chartSeriesField = replaceValue(config.chartSeriesField);
  config.chartValueField = replaceValue(config.chartValueField);
  config.chartSecondaryValueField = replaceValue(config.chartSecondaryValueField);
  config.calendarStartDateField = replaceValue(config.calendarStartDateField);
  config.calendarEndDateField = replaceValue(config.calendarEndDateField);
  config.calendarTitleField = replaceValue(config.calendarTitleField);
  config.calendarColorField = replaceValue(config.calendarColorField);
  config.timelineStartDateField = replaceValue(config.timelineStartDateField);
  config.timelineEndDateField = replaceValue(config.timelineEndDateField);
  config.timelineGroupField = replaceValue(config.timelineGroupField);
  config.timelineTitleField = replaceValue(config.timelineTitleField);
  config.timelineColorField = replaceValue(config.timelineColorField);
  config.groupByField = replaceValue(config.groupByField);
  config.sortColumn = replaceValue(config.sortColumn);
  config.sortColumnOrder = replaceValue(config.sortColumnOrder);
  changed = updateSourceRuleKeyReferences(config.sourceRules, oldKey, newKey) || changed;
  changed = updateSourceRuleTreeKeyReferences(config.sourceRuleTree, oldKey, newKey) || changed;
  for (const rule of config.filters || []) {
    if (rule.field === oldKey) {
      rule.field = newKey;
      changed = true;
    }
  }
  for (const rule of config.sortRules || []) {
    if (rule.field === oldKey) {
      rule.field = newKey;
      changed = true;
    }
  }

  config.hiddenColumns = replaceKeys(config.hiddenColumns);
  if (config.groupOrders?.[oldKey]) {
    config.groupOrders[newKey] = config.groupOrders[oldKey];
    delete config.groupOrders[oldKey];
    changed = true;
  }
  if (config.showEmptyGroups && oldKey in config.showEmptyGroups) {
    config.showEmptyGroups[newKey] = config.showEmptyGroups[oldKey];
    delete config.showEmptyGroups[oldKey];
    changed = true;
  }
  if (config.collapsedGroups?.[oldKey]) {
    config.collapsedGroups[newKey] = config.collapsedGroups[oldKey];
    delete config.collapsedGroups[oldKey];
    changed = true;
  }
  if (config.dateGroupModes && oldKey in config.dateGroupModes) {
    config.dateGroupModes[newKey] = config.dateGroupModes[oldKey];
    delete config.dateGroupModes[oldKey];
    changed = true;
  }
  if (config.expandedGroupRows && oldKey in config.expandedGroupRows) {
    config.expandedGroupRows[newKey] = config.expandedGroupRows[oldKey];
    delete config.expandedGroupRows[oldKey];
    changed = true;
  }
  if (config.boardCardOrders?.[oldKey]) {
    config.boardCardOrders[newKey] = config.boardCardOrders[oldKey];
    delete config.boardCardOrders[oldKey];
    changed = true;
  }
  for (const rule of config.summaryRules || []) {
    if (rule.field === oldKey) {
      rule.field = newKey;
      changed = true;
    }
  }
  for (const viewState of Object.values(config.viewStates || {})) {
    if (!viewState) continue;
    viewState.sortColumn = replaceValue(viewState.sortColumn);
    viewState.groupByField = replaceValue(viewState.groupByField);
    viewState.hiddenColumns = replaceKeys(viewState.hiddenColumns);
    for (const rule of viewState.sortRules || []) {
      if (rule.field === oldKey) {
        rule.field = newKey;
        changed = true;
      }
    }
    for (const rule of viewState.filters || []) {
      if (rule.field === oldKey) {
        rule.field = newKey;
        changed = true;
      }
    }
  }
  if (state) {
    const hiddenChanged = state.hiddenColumns.delete(oldKey);
    if (hiddenChanged) {
      state.hiddenColumns.add(newKey);
      changed = true;
    }
    state.groupByField = replaceValue(state.groupByField) || "";
    state.sortColumn = replaceValue(state.sortColumn);
    for (const rule of state.sortRules) {
      if (rule.field === oldKey) {
        rule.field = newKey;
        changed = true;
      }
    }
    for (const rule of state.filters) {
      if (rule.field === oldKey) {
        rule.field = newKey;
        changed = true;
      }
    }
  }
  return updateComputedFormulaReferences(config, oldKey, newKey, oldLabel, newLabel) || changed;
}

export function updateSourceRuleKeyReferences(
  rules: SourceRule[] | undefined,
  oldKey: string,
  newKey: string
): boolean {
  let changed = false;
  for (const rule of rules || []) {
    if (rule.field !== oldKey) continue;
    rule.field = newKey;
    changed = true;
  }
  return changed;
}

export function updateComputedFormulaReferences(
  config: ViewConfig,
  oldKey: string,
  newKey: string,
  oldLabel?: string,
  _newLabel?: string
): boolean {
  const names = new Set([oldKey, oldLabel].filter((value): value is string => !!value && value !== newKey));
  if (names.size === 0) return false;
  let changed = false;
  for (const def of config.schema.computedFields || []) {
    const next = replaceFormulaFieldReferences(def.expression || "", names, newKey);
    if (next !== def.expression) {
      def.expression = next;
      changed = true;
    }
  }
  return changed;
}

export function updateSummaryFormulaReferences(
  database: Pick<DatabaseConfig, "summaryFormulas">,
  oldKey: string,
  newKey: string,
  oldLabel?: string,
  _newLabel?: string
): boolean {
  const names = new Set([oldKey, oldLabel].filter((value): value is string => !!value && value !== newKey));
  if (names.size === 0 || !database.summaryFormulas) return false;
  let changed = false;
  for (const [summaryName, expression] of Object.entries(database.summaryFormulas)) {
    const next = replaceFormulaFieldReferences(expression || "", names, newKey);
    if (next !== expression) {
      database.summaryFormulas[summaryName] = next;
      changed = true;
    }
  }
  return changed;
}

export function replaceFormulaFieldReferences(expression: string, names: Set<string>, newKey: string): string {
  // 全部走 scanFormulaSegments（跳过字符串/注释/正则、递归模板、member-ref 由扫描器产生），
  // 不再对原始表达式跑正则。修复 GPT 复核：① 字符串内引用不改写；② [多词标签] 不破坏；
  // ③ 内置/语言字面量不随同名列改写；④ 字符串内 note.price 不被正则误改。
  const segments = scanFormulaSegments(expression);
  const replacements: Array<{ start: number; end: number; text: string }> = [];
  for (const seg of segments) {
    if (seg.kind === "bracket-ref") {
      if (names.has(seg.name)) replacements.push({ start: seg.start, end: seg.end, text: `[${newKey}]` });
    } else if (seg.kind === "field-call") {
      if (names.has(seg.name)) replacements.push({ start: seg.start, end: seg.end, text: `field(${seg.quote}${newKey}${seg.quote})` });
    } else if (seg.kind === "member-ref") {
      // formula.total 的重命名集合用完整键 formula.total，需匹配 object.name；其余（note.x/properties.x）按 name。
      const fullKey = seg.object === "formula" ? `formula.${seg.name}` : seg.name;
      if (seg.object === "formula" ? names.has(fullKey) : names.has(seg.name)) {
        const text = seg.object === "formula"
          ? `formula[${JSON.stringify(newKey.startsWith("formula.") ? newKey.slice("formula.".length) : newKey)}]`
          : `${seg.object}[${JSON.stringify(newKey)}]`;
        replacements.push({ start: seg.start, end: seg.end, text });
      }
    } else if (seg.kind === "identifier" && !seg.isCall && !seg.isMember && !FORMULA_BUILTIN_CONSTANTS.has(seg.text) && names.has(seg.text)) {
      const replacement = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(newKey) ? newKey : `note[${JSON.stringify(newKey)}]`;
      replacements.push({ start: seg.start, end: seg.end, text: replacement });
    }
  }
  let result = expression;
  for (let i = replacements.length - 1; i >= 0; i -= 1) {
    result = result.slice(0, replacements[i].start) + replacements[i].text + result.slice(replacements[i].end);
  }
  return result;
}
