// ───────────────────────────────────────────────────────────────────
// MODULE:    view-config-panel-renderer
// COMPONENT: View-settings popover — view type, source rules, conditional formatting, per-view-type sections
// ───────────────────────────────────────────────────────────────────
//
// Every setter here mutates the passed-in config object directly (e.g.
// `config.viewType = next`) and then calls `actions.onChange(label)`; the
// mutation is an optimistic in-memory write and the callback is what
// actually persists and labels the undo step. renderDatabaseGlobals is
// shared by the live settings popover (onDatabaseChange persists
// immediately) and the "new database" creation modal (onDatabaseChange is a
// no-op there — changes only take effect once the modal's own Create step
// reads the accumulated config).

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App, Notice, setIcon, setTooltip } from "obsidian";
import { ColumnDef, ComputedSyncMode, ConditionalFormatRule, DatabaseConfig, DatabaseViewType, FilterOperator, FilterRule, NO_TITLE_FIELD, SourceRule, SourceRuleGroup, SourceRuleNode, SourceRuleOperator, StatusColor, StatusPresetDef, ViewConfig, generateId } from "../data/types";
import { normalizeComputedSyncMode } from "../data/computed-sync";
import { getColumnOptions, isObsidianAliasesKey, isObsidianTagsKey } from "../data/column-types";
import { getColumnDisplayType } from "../data/column-display";
import { isDateLikeColumnType } from "../data/date-time-format";
import { BASE_FILE_FIELD_KEYS, getBaseFileFieldType, isBaseFileField } from "../data/file-fields";
import { getSourceRuleTree, isSourceRuleExpression, isSourceRuleGroup, isSourceRuleLeaf, isSourceRuleNot } from "../data/source-rules";
import { getVaultProperties, VaultProperty } from "../data/vault-properties";
import { createConditionalFormatLeaf, getConditionalFormatCondition, isConditionalFormatOperator } from "../data/conditional-format-editor";
import { t } from "../i18n";
import { COMPACT_MENU_POPOVER, isMobileBottomSheet, positionToolbarPopover } from "./popover-position";
import { carrySheetEntrance } from "./mobile-bottom-sheet";
import { overlayStack } from "./overlay-stack";
import { confirmWithModal } from "./modals/confirm-modal";
import { createDropdownField, DropdownOption, openDropdownMenu } from "./dropdown-field";
import { createCheckbox } from "./checkbox";
import { getPropertyDropdownIcon, isPropertyDropdownIcon, renderDropdownPropertyTypeIcon, renderPropertyTypeIcon } from "./property-type-icon";
import { getOrderedRecordIconColumns, getRecordIconFieldLabel, parseRecordIconToken, resolveRecordIconField } from "../data/record-icon";
import { getValidRecordIconIds, renderRecordIcon } from "./record-icon-renderer";
import { ImageFileSuggestModal } from "./image-file-suggest-modal";
import { openIconPickerPopover } from "./icon-picker-popover";
import { openOptionColorPicker } from "./option-color-picker";
import { MarkdownFileSuggestModal } from "./markdown-file-suggest-modal";
import { getFilterOperatorsForColumn } from "./filter-panel-renderer";
import { closeActiveDateValuePicker, renderDateValuePicker } from "./date-value-picker";
import { boardCardPropertiesContext, renderBoardCardProperties } from "./board-card-properties-panel";

// ───────────────────────────────────────────────────────────────────
// 2. SOURCE RULE MODEL
// ───────────────────────────────────────────────────────────────────

const CUSTOM_SOURCE_RULE_FIELD = "__custom__";

interface SourceRuleFieldOption {
  value: string;
  label: string;
  type: ColumnDef["type"];
}

interface SourceRuleFieldGroup {
  label: string;
  options: SourceRuleFieldOption[];
}

interface SourceRuleOperatorGroup {
  label: string;
  operators: SourceRuleOperator[];
}

const SOURCE_RULE_OPERATOR_LABEL_KEYS: Record<string, string> = {
  file: "viewConfig.sourceRules.opGroup.file",
  value: "viewConfig.sourceRules.opGroup.value",
  text: "viewConfig.sourceRules.opGroup.text",
  compare: "viewConfig.sourceRules.opGroup.compare",
  presence: "viewConfig.sourceRules.opGroup.presence",
  type: "viewConfig.sourceRules.opGroup.type",
  current: "viewConfig.sourceRules.opGroup.current",
};

const VALUE_OPERATORS: SourceRuleOperator[] = ["eq", "neq"];
const TEXT_OPERATORS: SourceRuleOperator[] = ["contains", "startsWith", "endsWith", "matches"];
const RANGE_OPERATORS: SourceRuleOperator[] = ["gt", "gte", "lt", "lte"];
const PRESENCE_OPERATORS: SourceRuleOperator[] = ["empty", "notempty"];
const TYPE_OPERATORS: SourceRuleOperator[] = ["isType"];
const BASE_IS_TYPE_VALUES = ["string", "number", "boolean", "date", "list", "object", "null"] as const;
const IS_TYPE_VALUE_ALIASES: Record<string, string> = {
  bool: "boolean",
  checkbox: "boolean",
  array: "list",
};

export function getSourceRuleOperatorGroupsForField(
  database: DatabaseConfig,
  field: string,
  currentOp?: SourceRuleOperator
): SourceRuleOperatorGroup[] {
  const groups = getRecommendedSourceRuleOperatorGroups(database, field);
  if (currentOp && !groups.some((group) => group.operators.includes(currentOp))) {
    return [{ label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.current), operators: [currentOp] }, ...groups];
  }
  return groups;
}

export function getDefaultSourceRuleOperatorForField(database: DatabaseConfig, field: string): SourceRuleOperator {
  if (isFolderSourceRuleField(field)) return "inFolder";
  if (isTagSourceRuleField(field)) return "hasTag";
  if (isLinkSourceRuleField(field)) return "hasLink";
  return getRecommendedSourceRuleOperatorGroups(database, field).some((group) => group.operators.includes("eq")) ? "eq" : "empty";
}

export function getDefaultSourceRuleIsTypeValue(database: DatabaseConfig, field: string): string {
  const displayType = getSourceRuleFieldDisplayType(database, field);
  if (displayType === "checkbox") return "boolean";
  if (displayType === "multi-select" || displayType === "relation") return "list";
  if (isDateLikeColumnType(displayType)) return "date";
  if (displayType === "number" || displayType === "currency") return "number";
  return "string";
}

export function getSourceRuleIsTypeValueOptions(currentValue: string | undefined): string[] {
  const normalized = normalizeSourceRuleIsTypeValue(currentValue || "");
  const values = [...BASE_IS_TYPE_VALUES];
  return normalized && !values.includes(normalized as typeof BASE_IS_TYPE_VALUES[number])
    ? [normalized, ...values]
    : values;
}

export function createEditableSourceRuleRoot(tree: SourceRuleNode | undefined): SourceRuleNode | undefined {
  if (!tree || isSourceRuleGroup(tree)) return tree;
  return { type: "group", logic: "and", rules: [tree] };
}

function normalizeSourceRuleIsTypeValue(value: string): string {
  const normalized = value.trim().toLowerCase();
  return IS_TYPE_VALUE_ALIASES[normalized] || normalized;
}

function getRecommendedSourceRuleOperatorGroups(database: DatabaseConfig, field: string): SourceRuleOperatorGroup[] {
  const displayType = getSourceRuleFieldDisplayType(database, field);
  const groups: SourceRuleOperatorGroup[] = [];
  const fileOps: SourceRuleOperator[] = [];
  if (isFolderSourceRuleField(field)) fileOps.push("inFolder");
  if (isTagSourceRuleField(field)) fileOps.push("hasTag");
  if (isLinkSourceRuleField(field)) fileOps.push("hasLink");
  if (isPropertyPresenceRuleField(field)) fileOps.push("hasProperty");
  if (fileOps.length > 0) groups.push({ label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.file), operators: fileOps });

  if (displayType === "number" || displayType === "currency" || isDateLikeColumnType(displayType)) {
    groups.push(
      { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.value), operators: VALUE_OPERATORS },
      { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.compare), operators: RANGE_OPERATORS },
      { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.presence), operators: PRESENCE_OPERATORS },
      { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.type), operators: TYPE_OPERATORS }
    );
    return groups;
  }

  if (displayType === "checkbox") {
    groups.push(
      { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.value), operators: VALUE_OPERATORS },
      { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.presence), operators: ["truthy", ...PRESENCE_OPERATORS] },
      { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.type), operators: TYPE_OPERATORS }
    );
    return groups;
  }

  if (displayType === "multi-select" || displayType === "relation") {
    groups.push(
      { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.value), operators: ["contains", "eq", "neq"] },
      { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.presence), operators: PRESENCE_OPERATORS },
      { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.type), operators: TYPE_OPERATORS }
    );
    return groups;
  }

  groups.push(
    { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.value), operators: VALUE_OPERATORS },
    { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.text), operators: TEXT_OPERATORS },
    { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.presence), operators: ["truthy", ...PRESENCE_OPERATORS] },
    { label: t(SOURCE_RULE_OPERATOR_LABEL_KEYS.type), operators: TYPE_OPERATORS }
  );
  return groups;
}

function getSourceRuleFieldDisplayType(database: DatabaseConfig, field: string): ColumnDef["type"] {
  if (isBaseFileField(field)) return getBaseFileFieldType(field);
  if (isObsidianAliasesKey(field)) return "multi-select";
  const formulaKey = field.startsWith("formula.") ? field.slice("formula.".length) : undefined;
  const column = getSourceRuleColumns(database).find((candidate) => (
    candidate.key === field ||
    (formulaKey && candidate.type === "computed" && (candidate.computedKey || candidate.key) === formulaKey)
  ));
  return column ? getColumnDisplayType(column, getSourceRuleComputedFields(database)) : "text";
}

function getSourceRuleColumns(database: DatabaseConfig): ColumnDef[] {
  const seen = new Set<string>();
  const columns: ColumnDef[] = [];
  const add = (candidate: ColumnDef | undefined) => {
    if (!candidate || seen.has(candidate.key)) return;
    seen.add(candidate.key);
    columns.push(candidate);
  };
  for (const col of database.schema?.columns || []) add(col);
  for (const view of database.views || []) {
    for (const col of view.schema?.columns || []) add(col);
  }
  return columns;
}

function getSourceRuleComputedFields(database: DatabaseConfig): DatabaseConfig["schema"]["computedFields"] {
  const seen = new Set<string>();
  const fields: DatabaseConfig["schema"]["computedFields"] = [];
  const add = (field: DatabaseConfig["schema"]["computedFields"][number] | undefined) => {
    if (!field || seen.has(field.key)) return;
    seen.add(field.key);
    fields.push(field);
  };
  for (const field of database.schema?.computedFields || []) add(field);
  for (const view of database.views || []) {
    for (const field of view.schema?.computedFields || []) add(field);
  }
  return fields;
}

function isFolderSourceRuleField(field: string): boolean {
  return field === "folder" || field === "file.file" || field === "file.folder" || field === "file.path";
}

function isTagSourceRuleField(field: string): boolean {
  return field === "file.tags" || isObsidianTagsKey(field);
}

function isLinkSourceRuleField(field: string): boolean {
  return field === "file.links" || field === "file.backlinks" || field === "file.embeds";
}

function isPropertyPresenceRuleField(field: string): boolean {
  return Boolean(field) && !field.startsWith("formula.") && !field.startsWith("file.") && field !== "folder";
}

// ───────────────────────────────────────────────────────────────────
// 3. TYPES
// ───────────────────────────────────────────────────────────────────

export interface ViewConfigPanelActions {
  app: App;
  onChange(label?: string): void;
  onViewTypeChange?(viewType: DatabaseViewType): void;
  onOpenLayoutOptions?(anchorEl: HTMLElement): void;
  onDatabaseChange?(label?: string): void;
  createRecordIconField?(target: "database" | "view"): void;
  createProperty?(options?: { applyReference?: (column: ColumnDef) => void; rollbackReference?: () => void }): void;
  onComputedSyncModeChange?(): void;
  onComputedFrontmatterCleanup?(): void;
  database?: DatabaseConfig;
  statusPresets?: StatusPresetDef[];
  defaultStatusPresetId?: string;
  statusPresetHelpText?: string;
  managedStatusPresetCount?: number;
  onDefaultStatusPresetChange?(presetId: string): void;
  onManageStatusPresets?(): void;
  viewStatusPresets?: StatusPresetDef[];
  defaultViewStatusPresetId?: string;
  viewStatusPresetHelpText?: string;
  managedViewStatusPresetCount?: number;
  onDefaultViewStatusPresetChange?(presetId: string): void;
  onManageViewStatusPresets?(): void;
  readonly isDatabaseReadOnly?: boolean;
  readonly isViewReadOnly?: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 4. VIEW CONFIG PANEL RENDERER
// ───────────────────────────────────────────────────────────────────

export class ViewConfigPanelRenderer {
  // Hold the panel, because on a phone it does not stay where it was built.
  //
  // This is created inside the view container and then portalled onto the body, so a container-
  // scoped `querySelector` — which is how this used to find its own panel — matches nothing from
  // the moment it becomes a sheet. Measured on a phone viewport: reopening left TWO panels on the
  // body and closing removed NEITHER, with the backdrop still up over the whole app. The same
  // sequence on desktop was clean, because there the panel never leaves the container. That is the
  // shape of a defect no desktop pass can see.
  private panelEl: HTMLElement | null = null;

  /** The live panel, wherever it currently is. Callers must not go looking for it by selector. */
  getPanel(): HTMLElement | null {
    return this.panelEl?.isConnected ? this.panelEl : null;
  }

  /**
   * Whichever element currently scrolls this panel's content.
   *
   * The answer differs by presentation and cannot be assumed: the anchored panel scrolls itself,
   * and the sheet hands that job to the body region so the grab bar and the header stay put. Asked
   * of the DOM rather than tracked in a flag, because a rebuild replaces both nodes.
   */
  private getScrollHost(): HTMLElement | null {
    const panel = this.panelEl;
    if (!panel) return null;
    const body = panel.querySelector<HTMLElement>(".db-view-config-body");
    return body && body.scrollHeight > body.clientHeight ? body : panel;
  }

  /** Put the scroll position back on whichever element took over the scrolling. */
  private restoreScroll(savedScroll: number): void {
    if (!savedScroll) return;
    const host = this.getScrollHost();
    if (host) host.scrollTop = savedScroll;
  }

  /**
   * The sheet's own way out, beside its title.
   *
   * A phone sheet closes by a drag from a band at its very top, and that is the whole of it on this
   * surface today. It is the wrong sole affordance for a form this long: the band is the only
   * dismissal, it is 48px of a 760px sheet, and the operator reported the sheet as one they could
   * not close. A button in the header is the answer every other sheet grammar already reaches for.
   *
   * Dismissal is not reinvented here. It is handed to the overlay stack, which is the same close
   * the backdrop, Escape and the drag gesture all run through, so a surface with an owner is closed
   * by that owner rather than by this button deciding what closing means. A surface that registered
   * nothing has no owner to ask, and removing the panel is then the honest answer — the sheet
   * module takes the backdrop down with it.
   *
   * Only on a sheet. The anchored panel has an anchor to press again and a backdrop-free surface
   * that never trapped anybody, and adding a control there would change a surface nobody reported.
   *
   * Carries `db-sheet-close` alongside its own `db-view-config-close`, additively: the sheet-grammar
   * contract (`sheet-grammar.ts`'s `hasSheetHeader`) checks for that shared class, and this control's
   * own 44px sizing and dismissal already satisfy the same floor under its own name — the second
   * class makes that conformance legible to the lane rather than changing what the button does.
   */
  private renderSheetClose(header: HTMLElement, panel: HTMLElement): void {
    const actionsEl = header.createDiv({ cls: "db-panel-header-actions" });
    const close = actionsEl.createEl("button", {
      cls: "db-icon-only-button db-view-config-close db-sheet-close",
      attr: { type: "button", "aria-label": t("common.close") },
    });
    setIcon(close, "x");
    close.onclick = () => {
      if (overlayStack.dismissPanel(panel, "programmatic")) return;
      panel.remove();
    };
  }

  render(
    containerEl: HTMLElement,
    visible: boolean,
    config: ViewConfig | undefined,
    actions: ViewConfigPanelActions,
    anchorEl?: HTMLElement
  ): void {
    const wasOpen = Boolean(this.panelEl?.isConnected);
    // Read from whichever element is the scroller. On desktop that is the panel; presented as a
    // sheet the panel stops scrolling and the body region below takes over, and a save that only
    // knew about one of them would silently stop restoring on the other.
    const savedScroll = this.getScrollHost()?.scrollTop ?? 0;
    // Removing it is enough to take the backdrop with it: the sheet module drops the backdrop once
    // the last live sheet leaves the document, so this does not have to remember to say so.
    this.panelEl?.remove();
    this.panelEl = null;
    if (!visible || !config) return;

    const panel = containerEl.createDiv({ cls: "db-view-config-panel", attr: { id: "db-view-config-panel" } });
    this.panelEl = panel;
    // A replacement node for a surface that is already open is a rebuild, not an opening. Saying so
    // is what keeps the sheet from replaying its rise and moving out from under the thumb.
    if (wasOpen) carrySheetEntrance(panel);
    const asSheet = isMobileBottomSheet(panel.ownerDocument);
    const header = panel.createDiv({ cls: "db-panel-header" });
    header.createDiv({ cls: "db-panel-title", text: t("toolbar.settings") });
    if (asSheet) this.renderSheetClose(header, panel);

    // Everything below the header scrolls; the header and the grab bar above it do not.
    //
    // This is the shape the record sheet already uses, and the settings sheet is the surface that
    // needed it most: it is the one toolbar panel whose content always overflows — 1461px of it in
    // a 760px sheet, measured — and while the panel itself was the scroller, the grab bar and this
    // header were ordinary in-flow children being carried off the top edge with the content. The
    // grab band shrank a pixel per pixel of scroll and reached zero at 48px, after which no press
    // anywhere could start the dismissal gesture and no title was left to say what the sheet was.
    //
    // The region exists on desktop too, with no overflow of its own, so the anchored panel keeps
    // scrolling exactly as it did and only the sheet's rules move the scroller into here.
    const body = panel.createDiv({ cls: "db-view-config-body" });

    if (actions.database) {
      this.renderSectionTitle(body, t("viewConfig.databaseSection"), "database");
      if (actions.isDatabaseReadOnly) {
        body.createDiv({ cls: "db-view-config-readonly-note", text: t("viewConfig.databaseReadonly") });
      }
      this.renderDatabaseSettings(body, actions.database, actions);
    }

    this.renderSectionTitle(body, t("viewConfig.viewSection"), "view");
    this.renderViewType(body, config, actions);
    if (actions.onOpenLayoutOptions && ["chart", "calendar", "timeline"].includes(config.viewType || "")) {
      const label = config.viewType === "chart" ? t("chart.options") : config.viewType === "timeline" ? t("timeline.options") : t("calendar.options");
      const layoutOptions = body.createEl("button", {
        cls: "db-view-config-layout-options db-panel-button",
        attr: { type: "button", "aria-label": label },
      });
      setIcon(layoutOptions.createSpan({ cls: "db-panel-button-icon" }), config.viewType === "chart" ? "bar-chart-3" : config.viewType === "timeline" ? "chart-gantt" : "calendar-days");
      layoutOptions.createSpan({ cls: "db-panel-button-label", text: label });
      layoutOptions.onclick = () => actions.onOpenLayoutOptions?.(layoutOptions);
    }
    this.renderViewSourceRulesSection(body, config, actions);
    if (["table", "board", "gallery", "list", "calendar", "timeline"].includes(config.viewType || "table") && actions.database) {
      this.renderRecordIconSettings(body, actions.database, config, actions);
    }
    if (config.viewType !== "chart" && actions.database) {
      this.renderConditionalFormatting(body, config, actions.database, actions, actions.isDatabaseReadOnly);
    }
    const showViewStatusPresets = config.viewType !== "chart" && config.viewType !== "calendar" && config.viewType !== "timeline";
    if (showViewStatusPresets) {
      this.renderStatusPresetSettings(body, {
        presets: actions.viewStatusPresets || [],
        defaultPresetId: actions.defaultViewStatusPresetId,
        helpText: actions.viewStatusPresetHelpText,
        managedPresetCount: actions.managedViewStatusPresetCount,
        onDefaultPresetChange: (presetId) => actions.onDefaultViewStatusPresetChange?.(presetId),
        onManagePresets: () => actions.onManageViewStatusPresets?.(),
      });
    }
    const isCalendarTimelineView = config.viewType === "calendar" || config.viewType === "timeline";
    if (config.viewType !== "chart" && !isCalendarTimelineView) {
      this.renderDefaultColumnWidth(body, config, actions);
      if (config.viewType === "table") {
        this.renderSelect(body, t("viewConfig.rowDensity"), [
          { value: "compact", text: t("viewConfig.rowDensity.compact") },
          { value: "default", text: t("viewConfig.rowDensity.default") },
          { value: "comfortable", text: t("viewConfig.rowDensity.comfortable") },
        ], config.rowDensity || "default", (value) => {
          config.rowDensity = value === "compact" || value === "comfortable" ? value : undefined;
          actions.onChange(t("undo.rowDensityConfig"));
        });
      }
      this.renderSelect(body, t("viewConfig.yearDisplayMode"), [
        { value: "always", text: t("viewConfig.yearDisplayMode.always") },
        { value: "smart", text: t("viewConfig.yearDisplayMode.smart") },
        { value: "never", text: t("viewConfig.yearDisplayMode.never") },
      ], config.yearDisplayMode || "always", (value) => {
        config.yearDisplayMode = value === "always" || value === "smart" || value === "never" ? value : undefined;
        actions.onChange(t("undo.yearDisplayModeConfig"));
      });
    }
    if (config.viewType !== "table" && config.viewType !== "chart" && !isCalendarTimelineView) {
      this.renderTitleField(body, config, actions);
      this.renderSwitch(body, t("viewConfig.showEmptyFields"), config.showEmptyFields === true, (value) => {
        config.showEmptyFields = value || undefined;
        actions.onChange(t("undo.showEmptyFieldsConfig"));
      });
      if (config.viewType === "list") {
        this.renderSwitch(body, t("viewConfig.listCompactFields"), config.listCompactFields === true, (value) => {
          config.listCompactFields = value || undefined;
          actions.onChange(t("undo.listCompactFieldsConfig"));
        });
      }
    }
    if (config.viewType === "gallery") {
      this.renderGallerySettings(body, config, actions);
      positionToolbarPopover(panel, anchorEl, COMPACT_MENU_POPOVER);
      this.restoreScroll(savedScroll);
      return;
    }
    if (config.viewType === "board") {
      this.renderBoardSettings(body, config, actions);
      positionToolbarPopover(panel, anchorEl, COMPACT_MENU_POPOVER);
      this.restoreScroll(savedScroll);
      return;
    }
    if (config.viewType === "calendar") {
      positionToolbarPopover(panel, anchorEl, COMPACT_MENU_POPOVER);
      this.restoreScroll(savedScroll);
      return;
    }
    if (config.viewType === "timeline") {
      positionToolbarPopover(panel, anchorEl, COMPACT_MENU_POPOVER);
      this.restoreScroll(savedScroll);
      return;
    }
    positionToolbarPopover(panel, anchorEl, COMPACT_MENU_POPOVER);
    this.restoreScroll(savedScroll);
  }

  private renderSectionTitle(panel: HTMLElement, text: string, scope: "database" | "view"): void {
    panel.createDiv({ cls: `db-view-config-section-title db-view-config-section-${scope}`, text, attr: { "data-scope": scope } });
  }

  private renderViewType(panel: HTMLElement, config: ViewConfig, actions: ViewConfigPanelActions): void {
    this.renderSelect(
      panel,
      t("viewConfig.viewType"),
      // The gallery and the list are withdrawn from the picker but kept for a database that
      // already is one — otherwise its own type control would display a value it does not list.
      // Deprecated rather than deleted because the types are persisted in vault files.
      [
        { value: "table", text: t("common.tableView"), icon: "table" },
        { value: "board", text: t("common.boardView"), icon: "layout-grid" },
        { value: "gallery", text: t("common.galleryView"), icon: "image" },
        { value: "list", text: t("common.listView"), icon: "list" },
        { value: "chart", text: t("common.chartView"), icon: "bar-chart" },
        { value: "calendar", text: t("common.calendarView"), icon: "calendar-days" },
        { value: "timeline", text: t("common.timelineView"), icon: "chart-gantt" },
      ].filter((option) => (option.value !== "gallery" || config.viewType === "gallery") && (option.value !== "list" || config.viewType === "list")),
      config.viewType || "table",
      (value) => {
        const next = value as DatabaseViewType;
        if (actions.onViewTypeChange) {
          actions.onViewTypeChange(next);
          return;
        }
        config.viewType = next;
        actions.onChange(t("undo.viewTypeConfig"));
      }
    );
  }

  /** Per-view source rules (from embeds / .base conversion). The switch ENABLES/DISABLES the
   *  rules at runtime (getEffectiveConfig combines view.sourceRuleTree only when ON), not just
   *  show/hide. OFF → rules not applied; ON → rules applied + editor shown. Deleting all nodes
   *  does not auto-collapse (switch stays ON). */
  private renderViewSourceRulesSection(panel: HTMLElement, config: ViewConfig, actions: ViewConfigPanelActions): void {
    const enabled = config.viewSourceRulesEnabled === true;
    this.renderSwitch(panel, t("viewConfig.viewSourceRules"), enabled, (value) => {
      config.viewSourceRulesEnabled = value;
      actions.onChange(t("undo.viewSourceRulesConfig"));
    });
    if (enabled) {
      panel.createDiv({ cls: "db-view-config-help", text: t("viewConfig.viewSourceRulesHint") });
      this.renderSourceRules(panel, config as unknown as DatabaseConfig, actions, actions.isDatabaseReadOnly);
    }
  }

  /** Render the core database-global settings shared by the settings popover and the
   *  new-database modal: name, description, source folder, source rules, and the
   *  new-record folder. Status presets (and, in the popover, computed-sync mode) are
   *  rendered separately so the creation modal can omit computed-sync mode, which is a
   *  no-op before any formula column exists. `actions.onDatabaseChange` persists in the
   *  popover and is a no-op in the creation modal, where changes accumulate in the temp
   *  config until "Create". */
  renderDatabaseGlobals(panel: HTMLElement, database: DatabaseConfig, actions: ViewConfigPanelActions): void {
    const readOnly = actions.isDatabaseReadOnly;
    const syncSourceFolder = (value: string) => {
      database.sourceFolder = value;
    };
    this.renderText(panel, t("viewConfig.databaseName"), database.name || "", t("settings.databaseName"), (value) => {
      database.name = value || t("common.untitledDatabase");
      actions.onDatabaseChange?.(t("undo.databaseNameConfig"));
    }, readOnly, undefined, (value) => {
      database.name = value || t("common.untitledDatabase");
    });
    this.renderTextarea(panel, t("viewConfig.databaseDescription"), database.description || "", t("viewConfig.descriptionPlaceholder"), (value) => {
      database.description = value || undefined;
      actions.onDatabaseChange?.(t("undo.databaseDescriptionConfig"));
    }, readOnly, (value) => {
      database.description = value || undefined;
    });
    this.renderDatabaseCoverSetting(panel, database, actions, readOnly);
    this.renderText(panel, t("viewConfig.sourceFolder"), database.sourceFolder || "", t("settings.sourceFolder.placeholder"), (value) => {
      syncSourceFolder(value);
      actions.onDatabaseChange?.(t("undo.sourceFolderConfig"));
    }, readOnly, t("settings.sourceFolder.desc"), (value) => {
      syncSourceFolder(value);
    });
    this.renderSourceRules(panel, database, actions, readOnly);
    this.renderNewRecordFolderSetting(panel, database, actions, readOnly);
    this.renderNewRecordTemplateSetting(panel, database, actions, readOnly);
  }

  private renderNewRecordTemplateSetting(
    panel: HTMLElement,
    database: DatabaseConfig,
    actions: ViewConfigPanelActions,
    readOnly?: boolean,
  ): void {
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: t("template.label") });
    const field = row.createDiv({ cls: "db-view-config-field db-view-config-field-stack" });
    const controls = field.createDiv({ cls: "db-template-setting-controls" });
    const pathRow = controls.createDiv({ cls: "db-template-path-row" });
    pathRow.createDiv({
      cls: `db-view-config-readonly-value${database.newRecordTemplate?.path ? "" : " is-empty"}`,
      text: database.newRecordTemplate?.path || t("common.notSet"),
      attr: { title: database.newRecordTemplate?.path || t("common.notSet") },
    });
    if (readOnly) return;

    const engineRow = controls.createDiv({ cls: "db-template-engine-row" });
    engineRow.createDiv({ cls: "db-template-engine-label", text: t("template.engine.label") });
    createDropdownField({
      parent: engineRow,
      label: t("template.engine.label"),
      value: database.newRecordTemplate?.engine || "markdown",
      options: [
        { value: "markdown", text: t("template.engine.markdown") },
        { value: "core", text: t("template.engine.core") },
        { value: "templater", text: t("template.engine.templater") },
      ],
      hideLabel: true,
      disabled: !database.newRecordTemplate?.path,
      onChange: (value) => {
        if (!database.newRecordTemplate) return;
        database.newRecordTemplate.engine = value === "core"
          ? "core"
          : value === "templater"
            ? "templater"
            : "markdown";
        actions.onDatabaseChange?.(t("undo.newRecordTemplateConfig"));
      },
    });

    const choose = pathRow.createEl("button", { cls: "db-icon-only-button", attr: { type: "button", "aria-label": t("template.choose") } });
    setIcon(choose, "file-plus-2");
    choose.onclick = () => {
      new MarkdownFileSuggestModal(actions.app, (file) => {
        database.newRecordTemplate = {
          path: file.path,
          engine: database.newRecordTemplate?.engine || "markdown",
        };
        actions.onDatabaseChange?.(t("undo.newRecordTemplateConfig"));
      }, t("template.choose")).open();
    };
    if (database.newRecordTemplate?.path) {
      const remove = pathRow.createEl("button", { cls: "db-icon-only-button", attr: { type: "button", "aria-label": t("template.remove") } });
      setIcon(remove, "x");
      remove.onclick = () => {
        database.newRecordTemplate = undefined;
        actions.onDatabaseChange?.(t("undo.newRecordTemplateConfig"));
      };
    }
    field.createDiv({ cls: "db-view-config-help", text: t("template.help") });
  }

  private renderDatabaseCoverSetting(
    panel: HTMLElement,
    database: DatabaseConfig,
    actions: ViewConfigPanelActions,
    readOnly?: boolean,
  ): void {
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: t("databaseCover.label") });
    const field = row.createDiv({ cls: "db-view-config-field db-database-cover-setting" });
    field.createDiv({
      cls: `db-view-config-readonly-value${database.coverImage ? "" : " is-empty"}`,
      text: database.coverImage || t("common.notSet"),
      attr: { title: database.coverImage || t("common.notSet") },
    });
    if (readOnly) return;

    const choose = field.createEl("button", {
      cls: "db-icon-only-button",
      attr: { type: "button", "aria-label": t("databaseCover.choose") },
    });
    setIcon(choose, database.coverImage ? "image-up" : "image-plus");
    setTooltip(choose, t("databaseCover.choose"), { delay: 100 });
    choose.onclick = () => {
      new ImageFileSuggestModal(actions.app, (file) => {
        database.coverImage = file.path;
        database.coverImagePositionY = 50;
        actions.onDatabaseChange?.(t("undo.databaseCoverConfig"));
      }, t("databaseCover.choose")).open();
    };

    if (database.coverImage) {
      const remove = field.createEl("button", {
        cls: "db-icon-only-button",
        attr: { type: "button", "aria-label": t("databaseCover.remove") },
      });
      setIcon(remove, "x");
      setTooltip(remove, t("databaseCover.remove"), { delay: 100 });
      remove.onclick = () => {
        database.coverImage = undefined;
        database.coverImagePositionY = undefined;
        actions.onDatabaseChange?.(t("undo.databaseCoverConfig"));
      };
    }
  }

  private renderDatabaseSettings(panel: HTMLElement, database: DatabaseConfig, actions: ViewConfigPanelActions): void {
    this.renderDatabaseGlobals(panel, database, actions);
    const iconFields = getOrderedRecordIconColumns(database.views[0] || { ...database, name: database.name }, database.recordIconField);
    if (actions.isDatabaseReadOnly) {
      const column = database.schema.columns.find((candidate) => candidate.key === database.recordIconField);
      this.renderText(panel, t("recordIcon.field"), column?.label || column?.key || "", "", () => {}, true);
    } else {
      this.renderSelect(panel, t("recordIcon.field"), [
        { value: "", text: t("common.notSet") },
        ...iconFields.map((column) => ({ value: column.key, text: column.label || column.key, icon: getPropertyDropdownIcon(getColumnDisplayType(column, database.views[0]?.schema.computedFields ?? [])) })),
        ...(actions.createRecordIconField ? [{ value: "__create_record_icon_field__", text: t("recordIcon.createField"), icon: "plus", preserveValueOnSelect: true }] : []),
      ], database.recordIconField || "", (value) => {
        if (value === "__create_record_icon_field__") { actions.createRecordIconField?.("database"); return; }
        database.recordIconField = value || undefined;
        actions.onDatabaseChange?.(t("recordIcon.field"));
      }, true);
    }
    this.renderComputedSyncMode(panel, database, actions, actions.isDatabaseReadOnly);
    this.renderStatusPresetSettings(panel, {
      presets: actions.statusPresets || [],
      defaultPresetId: actions.defaultStatusPresetId,
      helpText: actions.statusPresetHelpText,
      managedPresetCount: actions.managedStatusPresetCount,
      onDefaultPresetChange: (presetId) => actions.onDefaultStatusPresetChange?.(presetId),
      onManagePresets: () => actions.onManageStatusPresets?.(),
    }, actions.isDatabaseReadOnly);
  }

  private renderConditionalFormatting(
    panel: HTMLElement,
    config: ViewConfig,
    database: DatabaseConfig,
    actions: ViewConfigPanelActions,
    readOnly?: boolean,
  ): void {
    const section = panel.createDiv({ cls: "db-conditional-format-settings" });
    const renderRules = () => {
      closeActiveDateValuePicker(section.ownerDocument);
      section.empty();
      const heading = section.createDiv({ cls: "db-conditional-format-heading" });
      heading.createSpan({ text: t("conditionalFormat.title") });
      if (!readOnly) {
        const add = heading.createEl("button", {
          cls: "db-conditional-format-add db-icon-only-button",
          attr: { type: "button", "aria-label": t("conditionalFormat.add") },
        });
        setIcon(add, "plus");
        add.onclick = () => {
          const firstField = database.schema.columns[0]?.key || "file.name";
          const rule: ConditionalFormatRule = {
            id: generateId(),
            condition: { field: firstField, op: "eq", value: "" },
            valueSource: "literal",
            target: "record",
            color: "red",
          };
          config.conditionalFormats = [...(config.conditionalFormats || []), rule];
          actions.onChange(t("undo.conditionalFormatConfig"));
          renderRules();
        };
      }
      const rules = config.conditionalFormats || [];
      if (rules.length === 0) {
        section.createDiv({ cls: "db-view-config-help", text: t("conditionalFormat.empty") });
        return;
      }

      const defaultCondition = (): FilterRule => ({
        field: database.schema.columns[0]?.key || "file.name",
        op: "eq",
        value: "",
      });
      const persist = (rerender = false) => {
        config.conditionalFormats = [...rules];
        actions.onChange(t("undo.conditionalFormatConfig"));
        if (rerender) renderRules();
      };
      const removeRule = (rule: ConditionalFormatRule) => {
        config.conditionalFormats = rules.filter((candidate) => candidate.id !== rule.id);
        actions.onChange(t("undo.conditionalFormatConfig"));
        renderRules();
      };
      const replaceTree = (rule: ConditionalFormatRule, next: SourceRuleNode | undefined) => {
        if (!next) {
          removeRule(rule);
          return;
        }
        rule.conditionTree = next;
        const condition = getConditionalFormatCondition(next);
        if (condition) rule.condition = condition;
        persist(true);
      };
      const createTreeButton = (
        parent: HTMLElement,
        icon: string,
        label: string,
        onClick: () => void,
      ): HTMLButtonElement => {
        const button = parent.createEl("button", {
          cls: "db-source-rule-icon-button",
          attr: { type: "button", "aria-label": label },
        });
        setIcon(button, icon);
        setTooltip(button, label, { delay: 100 });
        button.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        };
        return button;
      };

      const renderLeaf = (
        parent: HTMLElement,
        leaf: SourceRule,
        rule: ConditionalFormatRule,
        onReplace: (next: SourceRuleNode | undefined) => void,
        showTreeActions: boolean,
      ) => {
        const currentColumn = database.schema.columns.find((col) => col.key === leaf.field);
        const operators = getFilterOperatorsForColumn(currentColumn);
        if (!operators.some(([op]) => op === leaf.op)) {
          leaf.op = operators[0]?.[0] || "eq";
          leaf.value = "";
          if (!showTreeActions) {
            const condition = getConditionalFormatCondition(leaf);
            if (condition) rule.condition = condition;
          }
        }
        if (!isDateLikeColumnType(currentColumn?.type) && rule.valueSource === "today") {
          rule.valueSource = "literal";
        }
        const commitLeaf = (rerender = false) => {
          if (!isConditionalFormatOperator(leaf.op)) return;
          const condition = getConditionalFormatCondition(leaf);
          if (!condition) return;
          rule.condition = condition;
          if (showTreeActions) {
            onReplace(leaf);
            return;
          }
          persist(rerender);
        };
        createDropdownField({
          parent,
          label: t("filter.field"),
          value: leaf.field,
          options: database.schema.columns.map((col) => ({
            value: col.key,
            text: col.label || col.key,
            icon: getPropertyDropdownIcon(getColumnDisplayType(col, database.schema.computedFields)),
          })),
          hideLabel: true,
          disabled: Boolean(readOnly),
          className: "db-conditional-format-dropdown db-conditional-format-field",
          renderIcon: renderDropdownPropertyTypeIcon,
          onChange: (next) => {
            leaf.field = next;
            const nextColumn = database.schema.columns.find((col) => col.key === next);
            leaf.op = getFilterOperatorsForColumn(nextColumn)[0]?.[0] || "eq";
            leaf.value = "";
            if (!isDateLikeColumnType(nextColumn?.type)) rule.valueSource = "literal";
            commitLeaf(true);
          },
        });
        createDropdownField({
          parent,
          label: t("filter.operator"),
          value: leaf.op,
          options: operators.map(([value, text]) => ({ value, text })),
          hideLabel: true,
          disabled: Boolean(readOnly),
          className: "db-conditional-format-dropdown",
          onChange: (next) => {
            leaf.op = next as FilterOperator;
            if (next === "empty" || next === "notempty") leaf.value = "";
            commitLeaf(true);
          },
        });
        const valueDisabled = Boolean(readOnly) || leaf.op === "empty" || leaf.op === "notempty";
        if (valueDisabled) {
          parent.createSpan({ cls: "db-conditional-format-empty-value", text: "—" });
        } else if (currentColumn && ["select", "status", "multi-select"].includes(currentColumn.type)) {
          createDropdownField({
            parent,
            label: t("filter.value"),
            value: leaf.value || "",
            options: [
              { value: "", text: t("filter.value") },
              ...getColumnOptions(currentColumn).map((option) => ({ value: option.value, text: option.value })),
            ],
            hideLabel: true,
            disabled: Boolean(readOnly),
            className: "db-conditional-format-dropdown db-conditional-format-value",
            onChange: (next) => {
              leaf.value = next;
              commitLeaf();
            },
          });
        } else if (isDateLikeColumnType(currentColumn?.type)) {
          renderDateValuePicker({
            parent,
            value: leaf.value || "",
            placeholder: t("filter.value"),
            disabled: Boolean(readOnly),
            includeTime: currentColumn?.type === "datetime",
            displayText: rule.valueSource === "today" ? t("conditionalFormat.dynamicToday") : undefined,
            className: "db-conditional-format-value db-conditional-format-date-field",
            onChange: (next) => {
              rule.valueSource = "literal";
              leaf.value = next;
              commitLeaf(true);
            },
            footerAction: {
              label: t("conditionalFormat.dynamicToday"),
              onSelect: () => {
                rule.valueSource = "today";
                leaf.value = "";
                commitLeaf(true);
              },
            },
          });
        } else {
          const value = parent.createEl("input", {
            cls: "db-view-config-text db-conditional-format-value",
            attr: {
              type: currentColumn?.type === "number" || currentColumn?.type === "currency" ? "number" : "text",
              placeholder: t("filter.value"),
              "aria-label": t("filter.value"),
            },
          });
          value.value = leaf.value || "";
          value.disabled = Boolean(readOnly);
          value.onchange = () => {
            leaf.value = value.value;
            commitLeaf();
          };
        }
        if (showTreeActions && !readOnly) {
          const leafActions = parent.createDiv({ cls: "db-source-rule-actions" });
          createTreeButton(leafActions, "folder-plus", t("conditionalFormat.group"), () => {
            onReplace({ type: "group", logic: "and", rules: [leaf] });
          });
          createTreeButton(leafActions, "trash-2", t("common.delete"), () => onReplace(undefined));
        }
      };

      const renderConditionNode = (
        parent: HTMLElement,
        node: SourceRuleNode,
        rule: ConditionalFormatRule,
        onReplace: (next: SourceRuleNode | undefined) => void,
      ): void => {
        if (isSourceRuleGroup(node)) {
          const wrap = parent.createDiv({ cls: "db-source-rule-node db-source-rule-group" });
          const header = wrap.createDiv({ cls: "db-source-rule-header" });
          createDropdownField({
            parent: header,
            label: t("conditionalFormat.group"),
            options: [
              { value: "and", text: t("panel.and") },
              { value: "or", text: t("panel.or") },
            ],
            value: node.logic,
            className: "db-source-rule-dropdown db-source-rule-logic",
            hideLabel: true,
            disabled: Boolean(readOnly),
            onChange: (value) => onReplace({ ...node, logic: value === "or" ? "or" : "and" }),
          });
          if (!readOnly) {
            const groupActions = header.createDiv({ cls: "db-source-rule-actions" });
            createTreeButton(groupActions, "plus", t("panel.addCondition"), () => {
              onReplace({ ...node, rules: [...node.rules, createConditionalFormatLeaf(defaultCondition())] });
            });
            createTreeButton(groupActions, "folder-plus", t("conditionalFormat.group"), () => {
              onReplace({
                ...node,
                rules: [...node.rules, { type: "group", logic: "and", rules: [createConditionalFormatLeaf(defaultCondition())] }],
              });
            });
            createTreeButton(groupActions, "trash-2", t("common.delete"), () => onReplace(undefined));
          }
          const children = wrap.createDiv({ cls: "db-source-rule-children" });
          if (node.rules.length === 0) {
            children.createDiv({ cls: "db-source-rules-empty", text: t("conditionalFormat.group") });
          }
          for (let index = 0; index < node.rules.length; index += 1) {
            renderConditionNode(children, node.rules[index], rule, (next) => {
              const rules = [...node.rules];
              if (next) rules[index] = next;
              else rules.splice(index, 1);
              onReplace(rules.length > 0 ? { ...node, rules } : undefined);
            });
          }
          return;
        }
        if (!isSourceRuleLeaf(node)) return;
        const wrap = parent.createDiv({ cls: "db-source-rule-node db-source-rule-leaf" });
        const controls = wrap.createDiv({ cls: "db-source-rule-leaf-controls" });
        renderLeaf(controls, node, rule, onReplace, true);
      };

      rules.forEach((rule, index) => {
        const row = section.createDiv({ cls: "db-conditional-format-rule" });
        const conditionTree = rule.conditionTree;
        if (conditionTree && isSourceRuleGroup(conditionTree)) {
          const group = row.createDiv({ cls: "db-conditional-format-condition-group" });
          group.style.gridColumn = "1 / -1";
          renderConditionNode(group, conditionTree, rule, (next) => replaceTree(rule, next));
        } else {
          renderLeaf(row, createConditionalFormatLeaf(rule.condition), rule, () => persist(), false);
        }

        createDropdownField({
          parent: row,
          label: t("conditionalFormat.target"),
          value: rule.target,
          options: [
            { value: "record", text: t("conditionalFormat.record") },
            { value: "field", text: t("conditionalFormat.field") },
          ],
          hideLabel: true,
          disabled: Boolean(readOnly),
          className: "db-conditional-format-dropdown",
          onChange: (next) => {
            rule.target = next === "field" ? "field" : "record";
            persist(true);
          },
        });

        const color = row.createEl("button", {
          cls: "db-conditional-format-color",
          attr: { type: "button", "aria-label": t("conditionalFormat.color") },
        });
        color.createSpan({
          cls: `db-conditional-format-color-swatch db-option-color-${rule.color || "gray"}`,
        });
        color.disabled = Boolean(readOnly);
        color.onclick = () => {
          openOptionColorPicker(color, rule.color || "gray", (next: StatusColor) => {
            rule.color = next;
            persist(true);
          });
        };

        const validIconIds = new Set(getValidRecordIconIds());
        const icon = row.createEl("button", {
          cls: "db-icon-only-button db-conditional-format-icon-button",
          attr: { type: "button", "aria-label": t("conditionalFormat.icon") },
        });
        const currentIcon = rule.icon && parseRecordIconToken(rule.icon, validIconIds) ? rule.icon : undefined;
        renderRecordIcon(icon, currentIcon, { defaultIcon: "smile" });
        icon.disabled = Boolean(readOnly);
        icon.onclick = () => {
          if (readOnly) return;
          openIconPickerPopover({
            anchor: icon,
            current: currentIcon,
            onSelect: (value) => {
              if (value !== null && !parseRecordIconToken(value, validIconIds)) return;
              rule.icon = value || undefined;
              persist(true);
            },
          });
        };

        const bold = row.createEl("button", {
          cls: `db-icon-only-button db-conditional-format-bold-toggle${rule.bold ? " is-active" : ""}`,
          attr: {
            type: "button",
            "aria-label": t("conditionalFormat.bold"),
            "aria-pressed": String(rule.bold === true),
          },
        });
        setIcon(bold, "bold");
        bold.disabled = Boolean(readOnly);
        bold.onclick = () => {
          if (readOnly) return;
          rule.bold = rule.bold !== true;
          persist(true);
        };

        if (!readOnly) {
          const controls = row.createDiv({ cls: "db-conditional-format-controls" });
          if (!conditionTree || !isSourceRuleGroup(conditionTree)) {
            const group = controls.createEl("button", {
              cls: "db-icon-only-button",
              attr: { type: "button", "aria-label": t("conditionalFormat.group") },
            });
            setIcon(group, "folder-plus");
            setTooltip(group, t("conditionalFormat.group"), { delay: 100 });
            group.onclick = (event) => {
              event.preventDefault();
              event.stopPropagation();
              rule.conditionTree = {
                type: "group",
                logic: "and",
                rules: [createConditionalFormatLeaf(rule.condition)],
              };
              persist(true);
            };
          }
          const up = controls.createEl("button", { cls: "db-icon-only-button", attr: { type: "button", "aria-label": t("common.moveUp") } });
          setIcon(up, "chevron-up");
          up.disabled = index === 0;
          up.onclick = () => {
            if (index <= 0) return;
            [rules[index - 1], rules[index]] = [rules[index], rules[index - 1]];
            persist(true);
          };
          const down = controls.createEl("button", { cls: "db-icon-only-button", attr: { type: "button", "aria-label": t("common.moveDown") } });
          setIcon(down, "chevron-down");
          down.disabled = index === rules.length - 1;
          down.onclick = () => {
            if (index >= rules.length - 1) return;
            [rules[index], rules[index + 1]] = [rules[index + 1], rules[index]];
            persist(true);
          };
          const remove = controls.createEl("button", { cls: "db-icon-only-button", attr: { type: "button", "aria-label": t("common.delete") } });
          setIcon(remove, "trash-2");
          remove.onclick = () => removeRule(rule);
        }
      });
    };
    renderRules();
  }

  private renderRecordIconSettings(
    panel: HTMLElement,
    database: DatabaseConfig,
    config: ViewConfig,
    actions: ViewConfigPanelActions,
  ): void {
    this.renderSwitch(panel, t("recordIcon.show"), config.showRecordIcon === true, (value) => {
      config.showRecordIcon = value || undefined;
      if (value && !resolveRecordIconField(database, config) && !database.recordIconField) {
        config.recordIconFieldOverrideEnabled = true;
      }
      actions.onChange(t("recordIcon.show"));
    });
    if (config.showRecordIcon !== true) return;
    this.renderSwitch(panel, t("recordIcon.override"), config.recordIconFieldOverrideEnabled === true, (value) => {
      config.recordIconFieldOverrideEnabled = value || undefined;
      actions.onChange(t("recordIcon.override"));
    });
    if (config.recordIconFieldOverrideEnabled !== true) {
      const fieldKey = database.recordIconField || "";
      const column = fieldKey ? config.schema.columns.find((c) => c.key === fieldKey) : undefined;
      this.renderSelect(panel, t("recordIcon.field"), [{ value: fieldKey, text: getRecordIconFieldLabel(database, config) || t("common.notSet"), icon: column ? getPropertyDropdownIcon(getColumnDisplayType(column, config.schema.computedFields)) : undefined }], fieldKey, () => {}, false, true);
      return;
    }
    const fields = getOrderedRecordIconColumns(config, config.recordIconField);
    this.renderSelect(panel, t("recordIcon.field"), [
      { value: "", text: t("common.notSet") },
      ...fields.map((column) => this.toFieldDropdownOption(config, column)),
      ...(actions.createRecordIconField ? [{ value: "__create_record_icon_field__", text: t("recordIcon.createField"), icon: "plus", preserveValueOnSelect: true }] : []),
    ], config.recordIconField || "", (value) => {
      if (value === "__create_record_icon_field__") { actions.createRecordIconField?.("view"); return; }
      config.recordIconField = value || undefined;
      actions.onChange(t("recordIcon.field"));
    }, true);
  }

  private renderSourceRules(
    panel: HTMLElement,
    database: DatabaseConfig,
    actions: ViewConfigPanelActions,
    readOnly?: boolean
  ): void {
    const row = panel.createDiv({ cls: "db-view-config-row db-source-rules-setting" });
    row.createDiv({ cls: "db-view-config-label", text: t("viewConfig.sourceRules") });
    const field = row.createDiv({ cls: "db-view-config-field db-view-config-field-stack" });
    field.createDiv({ cls: "db-view-config-help db-source-rules-help", text: t("viewConfig.sourceRules.help") });
    const editor = field.createDiv({ cls: "db-source-rules-editor" });
    const tree = createEditableSourceRuleRoot(getSourceRuleTree(database.sourceRuleTree, database.sourceRules, database.sourceLogic));
    if (tree && (!database.sourceRuleTree || database.sourceRuleTree !== tree) && !readOnly) {
      database.sourceRuleTree = tree;
      database.sourceRules = undefined;
      database.sourceLogic = undefined;
    }
    const commit = (next: SourceRuleNode | undefined) => {
      database.sourceRuleTree = next;
      database.sourceRules = undefined;
      database.sourceLogic = undefined;
      actions.onDatabaseChange?.(t("undo.sourceRulesConfig"));
    };
    if (tree) {
      this.renderSourceRuleNode(editor, tree, commit, !!readOnly, database, getVaultProperties(actions.app));
    } else {
      editor.createDiv({ cls: "db-source-rules-empty", text: t("viewConfig.sourceRules.empty") });
    }
    if (!readOnly && !tree) {
      const buttons = editor.createDiv({ cls: "db-source-rule-actions" });
      this.createSourceRuleIconButton(buttons, "plus", t("viewConfig.sourceRules.addRule"), () => {
        commit({ field: "file.name", op: "eq", value: "" });
      });
      this.createSourceRuleIconButton(buttons, "folder-plus", t("viewConfig.sourceRules.addGroup"), () => {
        commit({ type: "group", logic: "and", rules: [] });
      });
      this.createSourceRuleIconButton(buttons, "terminal", t("viewConfig.sourceRules.addExpression"), () => {
        commit({ type: "expression", expression: "" });
      });
    }
  }

  private renderSourceRuleNode(
    parent: HTMLElement,
    node: SourceRuleNode,
    onReplace: (node: SourceRuleNode | undefined) => void,
    readOnly: boolean,
    database: DatabaseConfig,
    vaultProperties: VaultProperty[]
  ): void {
    if (isSourceRuleGroup(node)) {
      this.renderSourceRuleGroup(parent, node, onReplace, readOnly, database, vaultProperties);
      return;
    }
    if (isSourceRuleNot(node)) {
      const wrap = parent.createDiv({ cls: "db-source-rule-node db-source-rule-not" });
      const header = wrap.createDiv({ cls: "db-source-rule-header" });
      header.createSpan({ cls: "db-source-rule-not-label", text: t("viewConfig.sourceRules.not") });
      if (!readOnly) {
        const actions = header.createDiv({ cls: "db-source-rule-actions" });
        this.createSourceRuleIconButton(actions, "undo-2", t("viewConfig.sourceRules.removeNot"), () => onReplace(node.rule));
        this.createSourceRuleIconButton(actions, "trash-2", t("viewConfig.sourceRules.remove"), () => onReplace(undefined));
      }
      const content = wrap.createDiv({ cls: "db-source-rule-children" });
      this.renderSourceRuleNode(content, node.rule, (next) => next ? onReplace({ ...node, rule: next }) : onReplace(undefined), readOnly, database, vaultProperties);
      return;
    }
    if (isSourceRuleExpression(node)) {
      this.renderSourceRuleExpression(parent, node, onReplace, readOnly);
      return;
    }
    this.renderSourceRuleLeaf(parent, node, onReplace, readOnly, database, vaultProperties);
  }

  private renderSourceRuleGroup(
    parent: HTMLElement,
    group: SourceRuleGroup,
    onReplace: (node: SourceRuleNode | undefined) => void,
    readOnly: boolean,
    database: DatabaseConfig,
    vaultProperties: VaultProperty[]
  ): void {
    const wrap = parent.createDiv({ cls: "db-source-rule-node db-source-rule-group" });
    const header = wrap.createDiv({ cls: "db-source-rule-header" });
    createDropdownField({
      parent: header,
      label: t("viewConfig.sourceRules.logic"),
      options: [
        { value: "and", text: t("viewConfig.sourceRules.and") },
        { value: "or", text: t("viewConfig.sourceRules.or") },
      ],
      value: group.logic,
      className: "db-source-rule-dropdown db-source-rule-logic",
      hideLabel: true,
      disabled: readOnly,
      onChange: (value) => onReplace({ ...group, logic: value === "or" ? "or" : "and" }),
    });
    if (!readOnly) {
      const actions = header.createDiv({ cls: "db-source-rule-actions" });
      this.createSourceRuleIconButton(actions, "plus", t("viewConfig.sourceRules.addRule"), () => {
        onReplace({ ...group, rules: [...group.rules, { field: "file.name", op: "eq", value: "" }] });
      });
      this.createSourceRuleIconButton(actions, "folder-plus", t("viewConfig.sourceRules.addGroup"), () => {
        onReplace({ ...group, rules: [...group.rules, { type: "group", logic: "and", rules: [] }] });
      });
      this.createSourceRuleIconButton(actions, "terminal", t("viewConfig.sourceRules.addExpression"), () => {
        onReplace({ ...group, rules: [...group.rules, { type: "expression", expression: "" }] });
      });
      this.createSourceRuleIconButton(actions, "circle-slash-2", t("viewConfig.sourceRules.addNot"), () => {
        onReplace({ type: "not", rule: group });
      });
      this.createSourceRuleIconButton(actions, "trash-2", t("viewConfig.sourceRules.remove"), () => onReplace(undefined));
    }
    const children = wrap.createDiv({ cls: "db-source-rule-children" });
    if (group.rules.length === 0) {
      children.createDiv({ cls: "db-source-rules-empty", text: t("viewConfig.sourceRules.emptyGroup") });
    }
    for (let index = 0; index < group.rules.length; index += 1) {
      this.renderSourceRuleNode(children, group.rules[index], (next) => {
        const rules = [...group.rules];
        if (next) rules[index] = next;
        else rules.splice(index, 1);
        onReplace({ ...group, rules });
      }, readOnly, database, vaultProperties);
    }
  }

  private renderSourceRuleLeaf(
    parent: HTMLElement,
    rule: SourceRule,
    onReplace: (node: SourceRuleNode | undefined) => void,
    readOnly: boolean,
    database: DatabaseConfig,
    vaultProperties: VaultProperty[]
  ): void {
    const wrap = parent.createDiv({ cls: "db-source-rule-node db-source-rule-leaf" });
    const controls = wrap.createDiv({ cls: "db-source-rule-leaf-controls" });
    const fieldGroups = this.getSourceRuleFieldGroups(database);
    const knownFields = new Set(fieldGroups.flatMap((group) => group.options.map((option) => option.value)));
    const isKnownField = knownFields.has(rule.field);
    // When the vault property cache has entries, the custom-property slot is a
    // searchable picker (with type icons) instead of a free-text input. Empty registry
    // (e.g. fresh vault) falls back to the text input.
    const usePicker = vaultProperties.length > 0 && !readOnly;
    let selectedFieldValue = isKnownField ? rule.field : CUSTOM_SOURCE_RULE_FIELD;
    createDropdownField({
      parent: controls,
      label: t("panel.field"),
      options: [
        ...this.getSourceRuleFieldOptions(fieldGroups),
        { value: CUSTOM_SOURCE_RULE_FIELD, text: t("viewConfig.sourceRules.customField"), section: t("viewConfig.sourceRules.fieldGroup.custom") },
      ],
      value: selectedFieldValue,
      className: "db-source-rule-dropdown db-source-rule-field",
      hideLabel: true,
      disabled: readOnly,
      renderIcon: renderDropdownPropertyTypeIcon,
      onChange: (nextValue) => {
        selectedFieldValue = nextValue;
        const custom = nextValue === CUSTOM_SOURCE_RULE_FIELD;
        customField.style.display = custom ? "" : "none";
        if (custom) {
          // The text-input fallback is focused; the property picker opens on click.
          if (!usePicker) (customField as HTMLInputElement).focus();
        } else {
          rule.field = nextValue;
          refreshOperators(rule.op, false);
          refreshTypeValues();
          updateValueDisabled();
          commit();
        }
      },
    });
    const customField: HTMLElement = usePicker
      ? this.createCustomPropertyPicker(controls, rule, vaultProperties, knownFields, () => {
          refreshOperators(rule.op, false);
          refreshTypeValues();
          updateValueDisabled();
          commit();
        })
      : controls.createEl("input", {
          cls: "db-view-config-text db-source-rule-custom-field",
          attr: { type: "text", placeholder: t("viewConfig.sourceRules.fieldPlaceholder"), "aria-label": t("viewConfig.sourceRules.fieldPlaceholder") },
        });
    if (!usePicker) {
      const customInput = customField as HTMLInputElement;
      customInput.value = isKnownField ? "" : rule.field;
      customInput.disabled = readOnly;
    }
    customField.style.display = isKnownField ? "none" : "";
    const value = controls.createEl("input", {
      cls: "db-view-config-text db-source-rule-value",
      attr: { type: "text", placeholder: t("viewConfig.sourceRules.valuePlaceholder"), "aria-label": t("viewConfig.sourceRules.valuePlaceholder") },
    });
    value.value = rule.value || "";
    let selectedOperator: SourceRuleOperator = rule.op;
    let selectedTypeValue = normalizeSourceRuleIsTypeValue(rule.value || "") || getDefaultSourceRuleIsTypeValue(database, rule.field);
    let typeValueButton: HTMLElement | undefined;
    const updateValueDisabled = () => {
      const noValue = selectedOperator === "empty" || selectedOperator === "notempty" || selectedOperator === "truthy" || selectedOperator === "hasProperty";
      const isType = selectedOperator === "isType";
      value.style.display = isType ? "none" : "";
      if (typeValueButton) typeValueButton.style.display = isType ? "" : "none";
      value.disabled = readOnly || isType || noValue;
    };
    const getFieldValue = () => (
      // For the text-input fallback, read the live typed value (may be "" right after
      // switching to custom). The picker writes `rule.field` directly, so use that.
      selectedFieldValue === CUSTOM_SOURCE_RULE_FIELD && customField.style.display !== "none" && !usePicker
        ? (customField as HTMLInputElement).value.trim()
        : rule.field
    );
    const getOperatorOptions = (selectedOp: SourceRuleOperator, preserveUnsupported = true): DropdownOption[] => {
      const groups = getSourceRuleOperatorGroupsForField(database, getFieldValue(), preserveUnsupported ? selectedOp : undefined);
      return groups.flatMap((group) => group.operators.map((op) => ({
        value: op,
        text: t(`viewConfig.sourceRules.op.${op}`),
        section: group.label,
      })));
    };
    const getRecommendedOperator = (selectedOp: SourceRuleOperator, preserveUnsupported = true): SourceRuleOperator => {
      const groups = getSourceRuleOperatorGroupsForField(database, getFieldValue(), preserveUnsupported ? selectedOp : undefined);
      const recommended = groups.flatMap((group) => group.operators);
      return recommended.includes(selectedOp) ? selectedOp : getDefaultSourceRuleOperatorForField(database, getFieldValue());
    };
    const operatorDropdown = createDropdownField({
      parent: controls,
      label: t("panel.operator"),
      options: getOperatorOptions(rule.op),
      value: getRecommendedOperator(rule.op),
      className: "db-source-rule-dropdown db-source-rule-operator",
      hideLabel: true,
      disabled: readOnly,
      onChange: (nextValue) => {
        selectedOperator = nextValue as SourceRuleOperator;
        refreshTypeValues();
        updateValueDisabled();
        commit();
      },
    });
    controls.insertBefore(operatorDropdown.button, value);
    selectedOperator = getRecommendedOperator(rule.op);
    const refreshOperators = (selectedOp: SourceRuleOperator, preserveUnsupported = true) => {
      selectedOperator = getRecommendedOperator(selectedOp, preserveUnsupported);
      operatorDropdown.button.remove();
      const replacement = createDropdownField({
        parent: controls,
        label: t("panel.operator"),
        options: getOperatorOptions(selectedOperator, preserveUnsupported),
        value: selectedOperator,
        className: "db-source-rule-dropdown db-source-rule-operator",
        hideLabel: true,
        disabled: readOnly,
        onChange: (nextValue) => {
          selectedOperator = nextValue as SourceRuleOperator;
          refreshTypeValues();
          updateValueDisabled();
          commit();
        },
      });
      controls.insertBefore(replacement.button, value);
      operatorDropdown.button = replacement.button;
      operatorDropdown.valueEl = replacement.valueEl;
    };
    const createTypeValueDropdown = () => {
      const existing = typeValueButton;
      const dropdown = createDropdownField({
        parent: controls,
        label: t("panel.value"),
        options: getSourceRuleIsTypeValueOptions(selectedTypeValue).map((option) => ({ value: option, text: option })),
        value: selectedTypeValue,
        className: "db-source-rule-dropdown db-source-rule-value db-source-rule-type-value",
        hideLabel: true,
        disabled: readOnly,
        onChange: (nextValue) => {
          selectedTypeValue = nextValue;
          value.value = selectedTypeValue;
          rule.value = selectedTypeValue;
          commit();
        },
      });
      typeValueButton = dropdown.button;
      if (existing) existing.replaceWith(dropdown.button);
      else controls.insertBefore(dropdown.button, value.nextSibling);
    };
    const refreshTypeValues = () => {
      const current = normalizeSourceRuleIsTypeValue(selectedTypeValue || value.value || rule.value || "");
      const fallback = getDefaultSourceRuleIsTypeValue(database, getFieldValue());
      selectedTypeValue = current || fallback;
      createTypeValueDropdown();
      if (selectedOperator === "isType") {
        value.value = selectedTypeValue;
        rule.value = selectedTypeValue;
      }
    };
    refreshTypeValues();
    updateValueDisabled();
    const commit = () => {
      const op = selectedOperator;
      const keepsValueType = op === "eq" || op === "neq" || op === "strictEq" || op === "strictNeq" || op === "contains";
      const nextValue = op === "isType" ? selectedTypeValue : value.value;
      onReplace({
        field: getFieldValue(),
        op,
        value: op === "empty" || op === "notempty" || op === "truthy" || op === "hasProperty" ? undefined : nextValue,
        valueType: keepsValueType ? rule.valueType : undefined,
      });
    };
    if (!usePicker) {
      const customInput = customField as HTMLInputElement;
      customInput.oninput = () => {
        rule.field = customInput.value.trim();
        refreshOperators(rule.op, false);
        refreshTypeValues();
        updateValueDisabled();
      };
      customInput.onchange = () => {
        refreshOperators(rule.op, false);
        refreshTypeValues();
        updateValueDisabled();
        commit();
      };
    }
    value.oninput = () => { rule.value = value.value; };
    value.onchange = commit;
    if (!readOnly) {
      const actions = controls.createDiv({ cls: "db-source-rule-actions" });
      this.createSourceRuleIconButton(actions, "circle-slash-2", t("viewConfig.sourceRules.addNot"), () => {
        onReplace({ type: "not", rule });
      });
      this.createSourceRuleIconButton(actions, "trash-2", t("viewConfig.sourceRules.remove"), () => onReplace(undefined));
    }
  }

  /** A searchable picker for the custom-property slot of a source-rule leaf. Lists every
   *  frontmatter property from the plugin-owned vault property cache (passed in as
   *  `vaultProperties`) except those already offered by the main field dropdown
   *  (`knownFields`) — each row prefixed with its type icon. Replaces the old free-text
   *  input so users don't have to remember exact property names. */
  private createCustomPropertyPicker(
    parent: HTMLElement,
    rule: SourceRule,
    vaultProperties: VaultProperty[],
    knownFields: Set<string>,
    onPick: () => void
  ): HTMLButtonElement {
    const button = parent.createEl("button", {
      cls: "db-dropdown-field db-source-rule-dropdown db-source-rule-custom-field db-source-rule-property-picker",
      attr: { type: "button", "aria-haspopup": "listbox" },
    });
    const renderContent = () => {
      button.empty();
      const selectedKey = knownFields.has(rule.field) ? "" : rule.field;
      const propType = selectedKey ? vaultProperties.find((p) => p.key === selectedKey)?.type : undefined;
      button.toggleClass("has-current-icon", Boolean(propType));
      if (propType) {
        renderPropertyTypeIcon(button, { key: selectedKey, type: propType, label: selectedKey }, "db-dropdown-field-icon");
      }
      const text = button.createSpan({ cls: "db-dropdown-field-text" });
      text.createSpan({ cls: "db-dropdown-field-value", text: selectedKey || t("viewConfig.sourceRules.pickProperty") });
      setIcon(button.createSpan({ cls: "db-dropdown-field-chevron" }), "chevron-down");
    };
    renderContent();
    button.onclick = () => {
      const options: DropdownOption[] = vaultProperties
        .filter((p) => !knownFields.has(p.key))
        .map((p) => ({ value: p.key, text: p.key, icon: getPropertyDropdownIcon(p.type) }));
      if (options.length === 0) {
        options.push({ value: "", text: t("viewConfig.sourceRules.noProperties"), disabled: true });
      }
      openDropdownMenu({
        anchor: button,
        label: t("viewConfig.sourceRules.customField"),
        value: knownFields.has(rule.field) ? "" : rule.field,
        searchable: true,
        searchPlaceholder: t("viewConfig.sourceRules.searchProperties"),
        options,
        renderIcon: renderDropdownPropertyTypeIcon,
        onChange: (key) => {
          rule.field = key;
          renderContent();
          onPick();
        },
      });
    };
    return button;
  }

  private getSourceRuleFieldGroups(database: DatabaseConfig): SourceRuleFieldGroup[] {
    const seen = new Set<string>();
    const unique = (options: SourceRuleFieldOption[]) => options.filter((option) => {
      if (!option.value || seen.has(option.value)) return false;
      seen.add(option.value);
      return true;
    });
    const columns = getSourceRuleColumns(database);
    const noteProperties = unique(columns
      .filter((col) => col.type !== "computed" && col.type !== "rollup" && !isBaseFileField(col.key) && !isObsidianAliasesKey(col.key))
      .map((col) => ({
        value: col.key,
        label: col.label && col.label !== col.key ? `${col.label} (${col.key})` : col.key,
        type: getColumnDisplayType(col, database.schema.computedFields),
      })));
    const formulaProperties = unique(columns
      .filter((col) => col.type === "computed")
      .map((col) => {
        const key = col.computedKey || (col.key.startsWith("formula.") ? col.key.slice("formula.".length) : col.key);
        const value = `formula.${key}`;
        return {
          value,
          label: col.label && col.label !== value ? `${col.label} (${value})` : value,
          type: getColumnDisplayType(col, database.schema.computedFields),
        };
      }));
    const fileProperties = unique([
      // aliases is a built-in Obsidian list property (like file.tags); offer it alongside
      // the file.* fields so it is directly selectable, not buried in the custom picker.
      { value: "aliases", label: "aliases", type: "multi-select" },
      ...Array.from(BASE_FILE_FIELD_KEYS).map((key) => ({
        value: key,
        label: key,
        type: getBaseFileFieldType(key),
      })),
    ]);
    return [
      { label: t("viewConfig.sourceRules.fieldGroup.noteProperties"), options: noteProperties },
      { label: t("viewConfig.sourceRules.fieldGroup.formulaProperties"), options: formulaProperties },
      { label: t("viewConfig.sourceRules.fieldGroup.fileProperties"), options: fileProperties },
    ].filter((group) => group.options.length > 0);
  }

  private getSourceRuleFieldOptions(groups: SourceRuleFieldGroup[]): DropdownOption[] {
    return groups.flatMap((group) => group.options.map((option) => ({
      value: option.value,
      text: option.label,
      section: group.label,
      icon: getPropertyDropdownIcon(option.type),
    })));
  }

  private renderSourceRuleExpression(
    parent: HTMLElement,
    rule: { type: "expression"; expression: string },
    onReplace: (node: SourceRuleNode | undefined) => void,
    readOnly: boolean
  ): void {
    const wrap = parent.createDiv({ cls: "db-source-rule-node db-source-rule-expression" });
    const controls = wrap.createDiv({ cls: "db-source-rule-leaf-controls" });
    const expression = controls.createEl("textarea", {
      cls: "db-view-config-text db-source-rule-expression-input",
      attr: { rows: "2", placeholder: t("viewConfig.sourceRules.expressionPlaceholder") },
    });
    expression.value = rule.expression;
    expression.disabled = readOnly;
    expression.oninput = () => { rule.expression = expression.value.trim(); };
    expression.onchange = () => onReplace({ type: "expression", expression: expression.value.trim() });
    if (!readOnly) {
      const actions = controls.createDiv({ cls: "db-source-rule-actions" });
      this.createSourceRuleIconButton(actions, "circle-slash-2", t("viewConfig.sourceRules.addNot"), () => {
        onReplace({ type: "not", rule });
      });
      this.createSourceRuleIconButton(actions, "trash-2", t("viewConfig.sourceRules.remove"), () => onReplace(undefined));
    }
  }

  private createSourceRuleIconButton(parent: HTMLElement, icon: string, title: string, onClick: () => void): void {
    const button = parent.createEl("button", { cls: "db-source-rule-icon-button", attr: { type: "button" } });
    setIcon(button, icon);
    setTooltip(button, title, { delay: 100 });
    button.onclick = onClick;
  }

  private renderComputedSyncMode(
    panel: HTMLElement,
    database: DatabaseConfig,
    actions: ViewConfigPanelActions,
    readOnly?: boolean
  ): void {
    const mode = normalizeComputedSyncMode(database.computedSyncMode);
    const options: Array<{ value: ComputedSyncMode; title: string; desc: string }> = [
      {
        value: "display-only",
        title: t("viewConfig.computedSync.displayOnly"),
        desc: t("viewConfig.computedSync.displayOnlyDesc"),
      },
      {
        value: "manual",
        title: t("viewConfig.computedSync.manual"),
        desc: t("viewConfig.computedSync.manualDesc"),
      },
      {
        value: "automatic",
        title: t("viewConfig.computedSync.automatic"),
        desc: t("viewConfig.computedSync.automaticDesc"),
      },
    ];
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: t("viewConfig.computedSyncMode") });
    const field = row.createDiv({ cls: "db-view-config-field db-view-config-field-stack" });
    if (readOnly) {
      field.createDiv({
        cls: "db-view-config-readonly-value",
        text: options.find((option) => option.value === mode)?.title || t("viewConfig.computedSync.displayOnly"),
      });
      field.createDiv({ cls: "db-view-config-help", text: t("viewConfig.computedSync.help") });
      return;
    }

    const cards = field.createDiv({ cls: "db-computed-sync-cards" });
    const syncActiveCard = () => {
      const activeMode = normalizeComputedSyncMode(database.computedSyncMode);
      for (const card of cards.querySelectorAll<HTMLElement>(".db-computed-sync-card")) {
        const input = card.querySelector<HTMLInputElement>("input");
        const active = input?.value === activeMode;
        if (input) input.checked = active;
        card.toggleClass("is-active", active);
      }
    };
    const changeMode = async (rawNextMode: ComputedSyncMode): Promise<boolean> => {
      const nextMode = normalizeComputedSyncMode(rawNextMode);
      const previousMode = normalizeComputedSyncMode(database.computedSyncMode);
      if (nextMode === previousMode) return true;
      if (previousMode === "display-only" && nextMode === "automatic") {
        const confirmed = await confirmWithModal(actions.app, {
          title: t("viewConfig.saveComputedResults"),
          message: t("viewConfig.computedSync.confirmAutomatic"),
          confirmText: t("common.save"),
        });
        if (!confirmed) return false;
      }
      database.computedSyncMode = nextMode;
      actions.onDatabaseChange?.(t("undo.computedSyncModeConfig"));
      actions.onComputedSyncModeChange?.();
      if (previousMode === "display-only" && nextMode === "manual") {
        new Notice(t("viewConfig.computedSync.manualHint"));
      } else if (nextMode === "display-only" && previousMode !== "display-only") {
        new Notice(t("viewConfig.computedSync.displayOnlyHint"));
      }
      syncActiveCard();
      return true;
    };
    for (const option of options) {
      const card = cards.createEl("label", {
        cls: `db-computed-sync-card${option.value === mode ? " is-active" : ""}`,
      });
      const radio = card.createEl("input", {
        attr: { type: "radio", name: "computed-sync-mode", value: option.value },
      });
      radio.checked = option.value === mode;
      radio.onchange = async () => {
        if (!radio.checked) return;
        if (!await changeMode(option.value)) syncActiveCard();
      };
      const body = card.createDiv({ cls: "db-computed-sync-card-body" });
      body.createDiv({ cls: "db-computed-sync-card-title", text: option.title });
      body.createDiv({ cls: "db-computed-sync-card-desc", text: option.desc });
    }
    field.createDiv({ cls: "db-view-config-help", text: t("viewConfig.computedSync.help") });
    if ((database.schema?.columns || []).some((col) => col.type === "computed")) {
      const cleanup = field.createEl("button", {
        cls: "db-computed-cleanup-button",
        text: t("viewConfig.computedCleanup.button"),
        attr: { type: "button" },
      });
      cleanup.onclick = () => actions.onComputedFrontmatterCleanup?.();
      field.createDiv({ cls: "db-view-config-help", text: t("viewConfig.computedCleanup.help") });
    }
  }

  renderStatusPresetSettings(
    panel: HTMLElement,
    options: {
      presets: StatusPresetDef[];
      defaultPresetId?: string;
      helpText?: string;
      managedPresetCount?: number;
      onDefaultPresetChange?(presetId: string): void;
      onManagePresets?(): void;
    },
    readOnly?: boolean
  ): void {
    const presets = options.presets || [];
    if (presets.length === 0 && !options.onManagePresets) return;
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: t("viewConfig.statusPreset") });
    const field = row.createDiv({ cls: "db-view-config-field db-view-config-inline-controls" });
    if (readOnly) {
      const current = presets.find((preset) => preset.id === options.defaultPresetId) || presets[0];
      field.createDiv({ cls: "db-view-config-readonly-value", text: current?.name || t("common.notSet") });
      if (options.helpText) field.createDiv({ cls: "db-view-config-help", text: options.helpText });
      return;
    }
    if (presets.length > 0) {
      createDropdownField({
        parent: field,
        label: t("viewConfig.statusPreset"),
        options: presets.map((preset) => ({ value: preset.id, text: preset.name })),
        value: options.defaultPresetId || presets[0]?.id || "",
        className: "db-view-config-dropdown db-status-preset-setting-dropdown",
        hideLabel: true,
        onChange: (value) => options.onDefaultPresetChange?.(value),
      });
    } else {
      field.createDiv({ cls: "db-view-config-readonly-value", text: t("statusPresets.none") });
    }
    const button = field.createEl("button", {
      text: t("statusPresets.manage"),
      attr: {
        type: "button",
        "aria-label": `${t("statusPresets.manage")} (${options.managedPresetCount ?? presets.length})`,
      },
    });
    button.onclick = () => options.onManagePresets?.();
    if (options.helpText) field.createDiv({ cls: "db-view-config-help", text: options.helpText });
  }

  private renderNewRecordFolderSetting(
    panel: HTMLElement,
    database: DatabaseConfig,
    actions: ViewConfigPanelActions,
    readOnly?: boolean
  ): void {
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: t("viewConfig.newRecordFolder") });
    const field = row.createDiv({ cls: "db-view-config-field db-view-config-field-stack" });

    if (readOnly) {
      field.createDiv({
        cls: "db-view-config-readonly-value",
        text: database.newRecordFolder || t("common.untitled"),
      });
      return;
    }
    const input = field.createEl("input", {
      cls: "db-view-config-text",
      attr: { type: "text", placeholder: t("settings.sourceFolder.placeholder"), "aria-label": t("settings.sourceFolder.placeholder") },
    });
    input.value = database.newRecordFolder || "";
    input.oninput = () => {
      database.newRecordFolder = input.value.trim() || undefined;
    };
    input.onchange = () => {
      database.newRecordFolder = input.value.trim() || undefined;
      actions.onDatabaseChange?.(t("undo.newRecordFolderConfig"));
    };
    field.createDiv({ cls: "db-view-config-help", text: t("viewConfig.newRecordFolderLocked") });
  }

  private renderCoverSettings(
    panel: HTMLElement,
    config: ViewConfig,
    actions: ViewConfigPanelActions,
    fieldKey: "galleryImageField" | "boardImageField",
    fitKey: "galleryImageFit" | "boardImageFit",
    ratioKey: "galleryImageAspectRatio" | "boardImageAspectRatio",
    undoField: string,
    undoFit: string,
    undoRatio: string,
  ): void {
    this.renderSelect(
      panel,
      t("viewConfig.coverField"),
      [
        { value: "", text: t("viewConfig.noCover") },
        ...config.schema.columns
          .filter((col) => col.key !== "file.name")
          .map((col) => this.toFieldDropdownOption(config, col)),
        ...(actions.createProperty ? [{ value: "__create_property__", text: t("panel.createProperty"), icon: "plus", preserveValueOnSelect: true }] : []),
      ],
      config[fieldKey] || "",
      (value) => {
        if (value === "__create_property__") {
          const prevCover = config[fieldKey];
          actions.createProperty?.({
            applyReference: (col) => { config[fieldKey] = col.key; },
            rollbackReference: () => { config[fieldKey] = prevCover; },
          });
          return;
        }
        config[fieldKey] = value || undefined;
        actions.onChange(undoField);
      }
    );

    this.renderSelect(
      panel,
      t("viewConfig.imageFit"),
      [
        { value: "cover", text: t("viewConfig.cover") },
        { value: "contain", text: t("viewConfig.contain") },
      ],
      config[fitKey] || "cover",
      (value) => {
        config[fitKey] = value === "contain" ? "contain" : "cover";
        actions.onChange(undoFit);
      }
    );

    const ratioOptions = [
      { value: "0.6", text: t("viewConfig.ratioPortrait") },
      { value: "0.75", text: t("viewConfig.ratioClassic") },
      { value: "1", text: t("viewConfig.ratioSquare") },
      { value: "1.333", text: t("viewConfig.ratioLandscape") },
      { value: "1.777", text: t("viewConfig.ratioWide") },
    ];
    const ratio = String(config[ratioKey] || 0.75);
    if (!ratioOptions.some((item) => item.value === ratio)) {
      ratioOptions.push({ value: ratio, text: t("viewConfig.ratioCurrent", { ratio }) });
    }
    this.renderSelect(panel, t("viewConfig.coverRatio"), ratioOptions, ratio, (value) => {
      const next = Number(value);
      if (Number.isFinite(next)) {
        config[ratioKey] = next;
        actions.onChange(undoRatio);
      }
    });
  }

  private renderGallerySettings(panel: HTMLElement, config: ViewConfig, actions: ViewConfigPanelActions): void {
    this.renderCoverSettings(panel, config, actions, "galleryImageField", "galleryImageFit", "galleryImageAspectRatio", t("undo.galleryCoverFieldConfig"), t("undo.galleryImageFitConfig"), t("undo.galleryCoverRatioConfig"));

    const aspectPresets = panel.createDiv({ cls: "db-gallery-aspect-presets" });
    aspectPresets.createDiv({ cls: "db-view-config-label", text: t("viewConfig.galleryAspectPresets") });
    const aspectButtons = aspectPresets.createDiv({ cls: "db-gallery-preset-buttons", attr: { role: "group" } });
    const aspectOptions: Array<{ value: "square" | "banner" | "portrait" | "landscape"; ratio: number; label: string }> = [
      { value: "square", ratio: 1, label: t("viewConfig.aspectSquare") },
      { value: "banner", ratio: 1.777, label: t("viewConfig.aspectBanner") },
      { value: "portrait", ratio: 0.75, label: t("viewConfig.aspectPortrait") },
      { value: "landscape", ratio: 1.333, label: t("viewConfig.aspectLandscape") },
    ];
    for (const option of aspectOptions) {
      const button = aspectButtons.createEl("button", {
        cls: `db-gallery-preset-button${config.galleryImageAspectRatioPreset === option.value ? " is-active" : ""}`,
        text: option.label,
        attr: { type: "button", "aria-pressed": config.galleryImageAspectRatioPreset === option.value ? "true" : "false" },
      });
      button.onclick = () => {
        config.galleryImageAspectRatioPreset = option.value;
        config.galleryImageAspectRatio = option.ratio;
        actions.onChange(t("undo.galleryCoverRatioConfig"));
        aspectButtons.querySelectorAll("button").forEach((candidate) => candidate.toggleClass("is-active", candidate === button));
      };
    }

    const setGalleryCardSize = (value: number) => {
      config.galleryCardSize = value;
    };
    this.renderRange(panel, t("viewConfig.cardSize"), config.galleryCardSize || 250, 160, 420, 10, (value) => {
      setGalleryCardSize(value);
      config.galleryCardSizePreset = undefined;
      actions.onChange(t("undo.cardSizeConfig"));
    }, setGalleryCardSize);

    const sizePresets = panel.createDiv({ cls: "db-gallery-size-presets" });
    sizePresets.createDiv({ cls: "db-view-config-label", text: t("viewConfig.gallerySizePresets") });
    const sizeButtons = sizePresets.createDiv({ cls: "db-gallery-preset-buttons", attr: { role: "group" } });
    const sizeOptions: Array<{ value: "small" | "medium" | "large"; width: number; label: string }> = [
      { value: "small", width: 180, label: t("viewConfig.gallerySizeSmall") },
      { value: "medium", width: 260, label: t("viewConfig.gallerySizeMedium") },
      { value: "large", width: 360, label: t("viewConfig.gallerySizeLarge") },
    ];
    for (const option of sizeOptions) {
      const button = sizeButtons.createEl("button", {
        cls: `db-gallery-preset-button${config.galleryCardSizePreset === option.value ? " is-active" : ""}`,
        text: option.label,
        attr: { type: "button", "aria-pressed": config.galleryCardSizePreset === option.value ? "true" : "false" },
      });
      button.onclick = () => {
        config.galleryCardSizePreset = option.value;
        config.galleryCardSize = option.width;
        actions.onChange(t("undo.cardSizeConfig"));
        sizeButtons.querySelectorAll("button").forEach((candidate) => candidate.toggleClass("is-active", candidate === button));
      };
    }
  }

  private renderTitleField(panel: HTMLElement, config: ViewConfig, actions: ViewConfigPanelActions): void {
    this.renderSelect(
      panel,
      t("viewConfig.titleField"),
      [
        { value: "", text: t("viewConfig.titleAuto") },
        { value: NO_TITLE_FIELD, text: t("viewConfig.noTitle") },
        ...config.schema.columns.map((col) => this.toFieldDropdownOption(config, col)),
        ...(actions.createProperty ? [{ value: "__create_property__", text: t("panel.createProperty"), icon: "plus", preserveValueOnSelect: true }] : []),
      ],
      config.titleField || "",
      (value) => {
        if (value === "__create_property__") {
          const prevTitle = config.titleField;
          actions.createProperty?.({
            applyReference: (col) => { config.titleField = col.key; },
            rollbackReference: () => { config.titleField = prevTitle; },
          });
          return;
        }
        config.titleField = value || undefined;
        actions.onChange(t("undo.titleFieldConfig"));
      },
      true
    );
  }

  private renderBoardSettings(panel: HTMLElement, config: ViewConfig, actions: ViewConfigPanelActions): void {
    const groupField = config.boardGroupField || config.groupByField || "";
    this.renderSelect(
      panel,
      t("viewConfig.boardSubgroupField"),
      [
        { value: "", text: t("viewConfig.noSubgroup") },
        ...config.schema.columns
          .filter((col) => col.key !== "file.name" && col.key !== groupField)
          .map((col) => this.toFieldDropdownOption(config, col)),
        ...(actions.createProperty ? [{ value: "__create_property__", text: t("panel.createProperty"), icon: "plus", preserveValueOnSelect: true }] : []),
      ],
      config.boardSubgroupEnabled === true || config.boardSubgroupField ? config.boardSubgroupField || "" : "",
      (value) => {
        if (value === "__create_property__") {
          const prevEnabled = config.boardSubgroupEnabled;
          const prevField = config.boardSubgroupField;
          actions.createProperty?.({
            applyReference: (col) => { config.boardSubgroupEnabled = true; config.boardSubgroupField = col.key; },
            rollbackReference: () => { config.boardSubgroupEnabled = prevEnabled; config.boardSubgroupField = prevField; },
          });
          return;
        }
        config.boardSubgroupEnabled = Boolean(value);
        config.boardSubgroupField = value || undefined;
        actions.onChange(t("undo.boardSubgroupConfig"));
      }
    );
    const setBoardColumnWidth = (value: number) => {
      config.boardColumnWidth = value;
    };
    this.renderRange(panel, t("viewConfig.boardColumnWidth"), config.boardColumnWidth || 280, 220, 520, 10, (value) => {
      setBoardColumnWidth(value);
      actions.onChange(t("undo.boardColumnWidthConfig"));
    }, setBoardColumnWidth);

    this.renderCoverSettings(panel, config, actions, "boardImageField", "boardImageFit", "boardImageAspectRatio", t("undo.boardCoverFieldConfig"), t("undo.boardImageFitConfig"), t("undo.boardCoverRatioConfig"));
    renderBoardCardProperties(panel, config, {
      onChange: (label) => actions.onChange(label),
      readOnly: actions.isViewReadOnly,
    }, boardCardPropertiesContext(config));
  }

  private renderReadonlyField(panel: HTMLElement, label: string, value: string): void {
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: label });
    row.createDiv({ cls: "db-view-config-field" }).createDiv({
      cls: "db-view-config-readonly-value",
      text: value,
    });
  }

  private renderDefaultColumnWidth(panel: HTMLElement, config: ViewConfig, actions: ViewConfigPanelActions): void {
    // In card views, cap the default field width below the card width so the control never
    // offers a value larger than the card (board/gallery). table/list have no card width.
    const cardWidth = config.viewType === "board" ? (config.boardColumnWidth || 280)
      : config.viewType === "gallery" ? (config.galleryCardSize || 250)
      : 0;
    // Align maxWidth to the slider step (10) so the range thumb's rightmost value equals the
    // number input's max — otherwise the slider snaps to a lower step value than max allows.
    const maxWidth = cardWidth > 0 ? Math.max(80, Math.floor((cardWidth - 1) / 10) * 10) : 800;
    const setDefaultColumnWidth = (value: number) => {
      const next = Math.max(80, Math.min(maxWidth, Math.round(value)));
      config.defaultColumnWidth = next;
      const columnWidths = { ...(config.columnWidths || {}) };
      for (const col of config.schema.columns) {
        if (col.key === "file.name") continue;
        columnWidths[col.key] = next;
      }
      config.columnWidths = columnWidths;
    };
    const current = Math.min(this.getDefaultColumnWidth(config), maxWidth);
    this.renderRange(panel, t("viewConfig.defaultColumnWidth"), current, 80, maxWidth, 10, (value) => {
      setDefaultColumnWidth(value);
      actions.onChange(t("undo.defaultColumnWidthConfig"));
    }, setDefaultColumnWidth);
  }

  private getDefaultColumnWidth(config: ViewConfig): number {
    if (config.defaultColumnWidth) return config.defaultColumnWidth;
    const columns = config.schema.columns.filter((col) => col.key !== "file.name");
    if (columns.length === 0) return 150;
    const total = columns.reduce((sum, col) => sum + (config.columnWidths?.[col.key] || col.width || 150), 0);
    return Math.round(total / columns.length);
  }

  private renderSelect(
    panel: HTMLElement,
    label: string,
    options: DropdownOption[],
    value: string,
    onChange: (value: string) => void,
    searchable = false,
    disabled = false
  ): void {
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: label });
    const field = row.createDiv({ cls: "db-view-config-field" });
    const hasPropertyIcons = options.some((option) => isPropertyDropdownIcon(option.icon));
    createDropdownField({
      parent: field,
      label,
      options,
      value,
      onChange,
      className: `db-view-config-dropdown${hasPropertyIcons ? " db-view-config-field-dropdown" : ""}`,
      popoverClassName: "db-view-config-dropdown-popover",
      placeholder: t("common.notSet"),
      hideLabel: true,
      searchable,
      disabled,
      renderIcon: hasPropertyIcons ? (parent, icon) => {
        if (!renderDropdownPropertyTypeIcon(parent, icon)) setIcon(parent, icon);
      } : undefined,
    });
  }

  private toFieldDropdownOption(config: ViewConfig, col: ColumnDef): DropdownOption {
    return {
      value: col.key,
      text: col.label || col.key,
      icon: getPropertyDropdownIcon(getColumnDisplayType(col, config.schema.computedFields)),
    };
  }

  private renderText(
    panel: HTMLElement,
    label: string,
    value: string,
    placeholder: string,
    onChange: (value: string) => void,
    disabled = false,
    helpText?: string,
    onInput?: (value: string) => void
  ): void {
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: label });
    const field = row.createDiv({ cls: "db-view-config-field db-view-config-field-stack" });
    if (disabled) {
      field.createDiv({ cls: "db-view-config-readonly-value", text: value || t("common.notSet") });
      if (helpText) field.createDiv({ cls: "db-view-config-help", text: helpText });
      return;
    }
    const input = field.createEl("input", {
      cls: "db-view-config-text",
      // The row's own label, which is a div beside the field and names nothing on its own.
      attr: { type: "text", placeholder, "aria-label": label },
    });
    input.value = value;
    input.oninput = () => onInput?.(input.value.trim());
    input.onchange = () => onChange(input.value.trim());
    if (helpText) field.createDiv({ cls: "db-view-config-help", text: helpText });
  }

  private renderTextarea(
    panel: HTMLElement,
    label: string,
    value: string,
    placeholder: string,
    onChange: (value: string) => void,
    disabled = false,
    onInput?: (value: string) => void
  ): void {
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: label });
    if (disabled) {
      row.createDiv({ cls: "db-view-config-readonly-value db-view-config-readonly-multiline", text: value || t("common.notSet") });
      return;
    }
    const textarea = row.createEl("textarea", {
      cls: "db-view-config-textarea",
      attr: { placeholder, rows: "3" },
    });
    textarea.value = value;
    textarea.oninput = () => onInput?.(textarea.value.trim());
    textarea.onchange = () => onChange(textarea.value.trim());
  }

  private renderCheckbox(
    panel: HTMLElement,
    label: string,
    value: boolean,
    onChange: (value: boolean) => void,
    disabled = false,
    helpText?: string
  ): void {
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: label });
    const field = row.createDiv({ cls: "db-view-config-field" });
    if (disabled) {
      field.createDiv({ cls: "db-view-config-readonly-value", text: value ? t("common.true") : t("common.false") });
      if (helpText) field.createDiv({ cls: "db-view-config-help", text: helpText });
      return;
    }
    const input = createCheckbox(field, { role: "field" });
    input.checked = value;
    input.onchange = () => onChange(input.checked);
    if (helpText) field.createDiv({ cls: "db-view-config-help", text: helpText });
  }

  private renderSwitch(
    panel: HTMLElement,
    label: string,
    value: boolean,
    onChange: (value: boolean) => void,
    disabled = false,
    helpText?: string
  ): void {
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: label });
    const field = row.createDiv({ cls: "db-view-config-field" });
    if (disabled) {
      field.createDiv({ cls: "db-view-config-readonly-value", text: value ? t("common.true") : t("common.false") });
      if (helpText) field.createDiv({ cls: "db-view-config-help", text: helpText });
      return;
    }
    // The visible text is a div beside the control, not a label element, so it names nothing to a
    // screen reader. Carried explicitly rather than restructured: the class sets no display, so
    // turning that div into a label would flip it from block to inline and move the row.
    const input = field.createEl("input", { cls: "db-toggle-switch", attr: { type: "checkbox", role: "switch", "aria-label": label } });
    input.checked = value;
    input.onchange = () => onChange(input.checked);
    if (helpText) field.createDiv({ cls: "db-view-config-help", text: helpText });
  }

  private renderRange(
    panel: HTMLElement,
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    onChange: (value: number) => void,
    onInput?: (value: number) => void
  ): void {
    const row = panel.createDiv({ cls: "db-view-config-row" });
    row.createDiv({ cls: "db-view-config-label", text: label });
    const controls = row.createDiv({ cls: "db-view-config-range" });
    // Named from the row's own label. The visible text is a div beside them, so without this a
    // screen reader announces "slider" and "spin button" with nothing to say which setting they are
    // — and this row emits two controls, so it announces it twice.
    const range = controls.createEl("input", {
      attr: { type: "range", min: String(min), max: String(max), step: String(step), "aria-label": label },
    });
    const number = controls.createEl("input", {
      cls: "db-view-config-number",
      attr: { type: "number", min: String(min), max: String(max), step: String(step), "aria-label": label },
    });
    const clamped = Math.max(min, Math.min(max, Math.round(value)));
    range.value = String(clamped);
    number.value = String(clamped);
    const clamp = (next: number): number => Math.max(min, Math.min(max, Math.round(next)));
    range.oninput = () => {
      number.value = range.value;
      onInput?.(clamp(Number(range.value)));
    };
    range.onchange = () => onChange(Number(range.value));
    number.oninput = () => {
      const raw = Number(number.value);
      if (!Number.isFinite(raw)) return;
      const next = clamp(raw);
      range.value = String(next);
      onInput?.(next);
    };
    number.onchange = () => {
      const next = clamp(Number(number.value) || value);
      number.value = String(next);
      range.value = String(next);
      onChange(next);
    };
  }
}
