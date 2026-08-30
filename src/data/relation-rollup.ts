// ───────────────────────────────────────────────────────────────────
// MODULE:    relation-rollup
// COMPONENT: computes rollup column values by aggregating across a relation
// ───────────────────────────────────────────────────────────────────
//
// A rollup's relationField usually names a local relation column, but can
// also name a column that only exists on the *other* side — in that case
// this falls back to the inverse relation index (built lazily, once per
// call) to find inbound records instead of failing. Numeric coercion goes
// through toChartNumber rather than a regex strip-and-parse: the old
// approach pulled numbers out of note titles/wikilinks (`[[Task 42]]` → 42)
// and treated `Number("")` as a real zero, silently corrupting sums.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { App } from "obsidian";
import { evaluateComputedFields } from "./computed-evaluator";
import { getRowFileFieldValue, isFileFieldKey } from "./file-fields";
import { parseRelationValues } from "./relation-links";
import { toChartNumber } from "./chart-aggregation";
import { toDateTimestamp } from "./date-time-format";
import { earliest, latest, max, median, min, percentEmpty, percentFilled, range } from "./aggregate";
import { stringifyValue } from "./stringify";
import { buildRelationInverse } from "./relation-inverse";
import type { ColumnDef, DatabaseConfig } from "./types";
import type { NoteRecord } from "./data-source";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface RelationRollupContext {
  app: App;
  sourceRecords: NoteRecord[];
  sourceDatabase: DatabaseConfig;
  databases: DatabaseConfig[];
  getRecordsForDatabase(database: DatabaseConfig): NoteRecord[];
}

export interface RelationRollupResult {
  valuesByPath: Map<string, Record<string, unknown>>;
  /** Valid target paths referenced by the source rows, used to scope refreshes. */
  targetPaths: Set<string>;
  sourceDatabaseIds: Set<string>;
}

// ───────────────────────────────────────────────────────────────────
// 3. BUILD ROLLUPS
// ───────────────────────────────────────────────────────────────────

export function buildRelationRollups(context: RelationRollupContext): RelationRollupResult {
  const valuesByPath = new Map<string, Record<string, unknown>>();
  const targetPaths = new Set<string>();
  const sourceDatabaseIds = new Set<string>();
  const databaseById = new Map(context.databases.map((database) => [database.id, database]));
  const relationColumns = new Map(
    context.sourceDatabase.schema.columns
      .filter((column) => column.type === "relation" && column.relationConfig?.targetDatabaseId)
      .map((column) => [column.key, column])
  );
  const rollupColumns = context.sourceDatabase.schema.columns.filter(
    (column) => column.type === "rollup" && column.rollupConfig
  );
  if (rollupColumns.length === 0) return { valuesByPath, targetPaths, sourceDatabaseIds };

  let inverseResult: ReturnType<typeof buildRelationInverse> | undefined;

  const targetCache = new Map<string, {
    database: DatabaseConfig;
    recordsByPath: Map<string, NoteRecord>;
  }>();

  const getTarget = (relation: ColumnDef) => {
    const targetDatabaseId = relation.relationConfig?.targetDatabaseId;
    if (!targetDatabaseId) return null;
    const cached = targetCache.get(targetDatabaseId);
    if (cached) return cached;
    const database = databaseById.get(targetDatabaseId);
    if (!database) return null;
    const recordsByPath = new Map(
      context.getRecordsForDatabase(database).map((record) => [record.file.path, record])
    );
    const target = { database, recordsByPath };
    targetCache.set(targetDatabaseId, target);
    return target;
  };

  for (const sourceRecord of context.sourceRecords) {
    const derived: Record<string, unknown> = {};
    for (const rollup of rollupColumns) {
      const config = rollup.rollupConfig!;
      const relation = relationColumns.get(config.relationField);
      if (!relation) {
        inverseResult ??= buildRelationInverse(context);
        const inboundEdges = (inverseResult.inboundByPath.get(sourceRecord.file.path) || [])
          .filter((edge) => (
            edge.relationColumn.key === config.relationField
            && edge.relationColumn.type === "relation"
            && edge.relationColumn.relationConfig?.targetDatabaseId === context.sourceDatabase.id
          ));
        if (inboundEdges.length === 0) {
          derived[rollup.key] = emptyRollupValue(config.aggregation);
          continue;
        }
        const relatedRecords: NoteRecord[] = [];
        const seenPaths = new Set<string>();
        for (const edge of inboundEdges) {
          sourceDatabaseIds.add(edge.sourceDatabase.id);
          const path = edge.sourceRecord.file.path;
          if (seenPaths.has(path)) continue;
          seenPaths.add(path);
          targetPaths.add(path);
          relatedRecords.push(edge.sourceRecord);
        }
        derived[rollup.key] = aggregateRollup(
          relatedRecords,
          inboundEdges[0].sourceDatabase,
          config.targetField,
          config.aggregation,
          context.app
        );
        continue;
      }
      const target = getTarget(relation);
      if (!target) {
        derived[rollup.key] = emptyRollupValue(config.aggregation);
        continue;
      }
      const relatedRecords: NoteRecord[] = [];
      const seenPaths = new Set<string>();
      for (const link of parseRelationValues(sourceRecord.frontmatter[relation.key])) {
        const resolved = context.app.metadataCache.getFirstLinkpathDest(link.target, sourceRecord.file.path);
        if (!resolved || seenPaths.has(resolved.path)) continue;
        const record = target.recordsByPath.get(resolved.path);
        if (!record) continue;
        seenPaths.add(resolved.path);
        targetPaths.add(resolved.path);
        relatedRecords.push(record);
      }
      derived[rollup.key] = aggregateRollup(
        relatedRecords,
        target.database,
        config.targetField,
        config.aggregation,
        context.app
      );
    }
    valuesByPath.set(sourceRecord.file.path, derived);
  }
  return { valuesByPath, targetPaths, sourceDatabaseIds };
}

// ───────────────────────────────────────────────────────────────────
// 4. AGGREGATION HELPERS
// ───────────────────────────────────────────────────────────────────

function aggregateRollup(
  records: NoteRecord[],
  database: DatabaseConfig,
  targetField: string,
  aggregation: NonNullable<ColumnDef["rollupConfig"]>["aggregation"],
  app: App
): unknown {
  if (aggregation === "count") return records.length;
  const column = database.schema.columns.find((candidate) => candidate.key === targetField);
  if (column?.type === "rollup") return emptyRollupValue(aggregation);
  if (aggregation === "percentEmpty" || aggregation === "percentFilled") {
    if (!column && !isFileFieldKey(targetField)) return emptyRollupValue(aggregation);
    const emptyCount = records.filter((record) => isEmptyRollupValue(
      getTargetFieldValue(record, database, column, targetField, app)
    )).length;
    return aggregation === "percentEmpty"
      ? percentEmpty(records.length, emptyCount)
      : percentFilled(records.length, emptyCount);
  }
  const values = records.flatMap((record) => {
    const value = getTargetFieldValue(record, database, column, targetField, app);
    return Array.isArray(value)
      ? value.map((entry: unknown) => entry)
      : value == null || value === ""
        ? []
        : [value];
  });
  if (aggregation === "list") {
    const seen = new Set<string>();
    const result: unknown[] = [];
    for (const value of values) {
      const key = stringifyValue(value);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(value);
    }
    return result;
  }
  if (aggregation === "earliest" || aggregation === "latest") {
    const timestamps = values
      .map((value) => toDateTimestamp(value))
      .filter((value): value is number => value != null);
    return aggregation === "earliest" ? earliest(timestamps) : latest(timestamps);
  }
  // 原先 Number(replace(/[^0-9.-]/)) 会从笔记名/wikilink 随意提取数字（[[Task 42]]→42），
  // 且 Number("")===0 把无数字值当 0 累加。改用 toChartNumber：直接 Number(value)，非数字→null 被过滤。
  const numbers = values
    .map((value) => toChartNumber(value))
    .filter((value): value is number => value != null);
  if (numbers.length === 0) return null;
  switch (aggregation) {
    case "min": return min(numbers);
    case "max": return max(numbers);
    case "median": return median(numbers);
    case "range": return range(numbers);
  }
  const sum = numbers.reduce((total, value) => total + value, 0);
  if (aggregation === "avg") return sum / numbers.length;
  return aggregation === "sum" ? sum : null;
}

function getTargetFieldValue(
  record: NoteRecord,
  database: DatabaseConfig,
  column: ColumnDef | undefined,
  targetField: string,
  app: App
): unknown {
  if (isFileFieldKey(targetField)) {
    return getRowFileFieldValue({
      app,
      file: record.file,
      frontmatter: record.frontmatter,
      cache: app.metadataCache.getFileCache(record.file),
      computed: {},
    }, targetField);
  }
  if (column?.type === "computed") {
    const computed = evaluateComputedFields(
      database.schema.computedFields,
      database.schema.columns,
      record.frontmatter,
      { app, file: record.file }
    );
    return computed[column.computedKey || column.key];
  }
  return record.frontmatter[targetField];
}

function isEmptyRollupValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim().length === 0;
  return Array.isArray(value) && (value.length === 0 || value.every((item) => isEmptyRollupValue(item)));
}

function emptyRollupValue(aggregation: NonNullable<ColumnDef["rollupConfig"]>["aggregation"]): unknown {
  return aggregation === "count" ? 0 : aggregation === "list" ? [] : null;
}
