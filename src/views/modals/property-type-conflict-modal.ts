// ───────────────────────────────────────────────────────────────────
// MODULE:    property-type-conflict-modal
// COMPONENT: cross-database resolver for a frontmatter key observed with conflicting Obsidian property types
// ───────────────────────────────────────────────────────────────────
//
// A conflict is "resolved" when every writer's *draft* type maps to the
// same observable type, computed live from `writerStates` rather than
// stored per-card — so retyping one writer can flip several conflict
// cards' resolved state at once without an explicit dependency graph.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { App } from "obsidian";
import {
  filterDraftChangesToResolvedConflicts,
  getDraftObservableType,
  getPropertyTypeConflictTypeLabel,
  isPropertyTypeConflictResolvedWithDrafts,
  mapColumnTypeToObservablePropertyType,
  ObservablePropertyType,
  PropertyTypeConflict,
  PropertyTypeConflictDraftChange,
  PropertyWriter,
} from "../../data/property-type-conflict";
import { ColumnDef, ComputedFieldDef } from "../../data/types";
import { t } from "../../i18n";
import { createDropdownField } from "../dropdown-field";
import { renderDropdownPropertyTypeIcon } from "../property-type-icon";
import { buildTypePickerOptions, conflictWriterGate } from "../record-surface/type-picker";
import { DbModal } from "./obnotion-modal";
import type { SurfaceShellRole } from "../surface-shell";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface PropertyTypeConflictModalOptions {
  conflicts: PropertyTypeConflict[];
  activeConflictKey?: string;
  mode?: "confirm-change" | "notice";
  confirmText?: string;
  ignoreText?: string;
  cancelText?: string;
}

export type PropertyTypeConflictChange = PropertyTypeConflictDraftChange;

export type PropertyTypeConflictModalResult =
  | { action: "cancel" }
  | { action: "ignore" }
  | { action: "resolve"; changes: PropertyTypeConflictChange[] };

interface EditableWriterState {
  writer: PropertyWriter;
  type: ColumnDef["type"] | ComputedFieldDef["type"];
  rowEl?: HTMLElement;
  targetTypeEl?: HTMLElement;
}

interface ConflictCardState {
  conflict: PropertyTypeConflict;
  itemEl: HTMLElement;
  bodyEl: HTMLElement;
  statusEl: HTMLElement;
  toggleEl: HTMLButtonElement;
  changed: boolean;
}

interface PropertyTypeConflictModalCallbacks {
  resolve?: (result: PropertyTypeConflictModalResult) => void;
  onClosed?: () => void;
}

// ───────────────────────────────────────────────────────────────────
// 3. MODAL
// ───────────────────────────────────────────────────────────────────

export class PropertyTypeConflictModal extends DbModal {
  private closed = false;
  private readonly writerStates: EditableWriterState[] = [];
  private readonly cardStates = new Map<string, ConflictCardState>();
  private confirmButton?: HTMLButtonElement;
  private validationEl?: HTMLElement;

  constructor(
    app: App,
    private options: PropertyTypeConflictModalOptions,
    private callbacks: PropertyTypeConflictModalCallbacks = {}
  ) {
    // A conflict resolution list is an ordinary dialog-sized surface with no reason to
    // keep a third presentation the way the formula workbench does.
    super(app, "sheet");
    for (const conflict of options.conflicts) {
      for (const writer of conflict.writers) {
        if (this.writerStates.some((state) => sameWriter(state.writer, writer))) continue;
        this.writerStates.push({ writer, type: writer.pluginType });
      }
    }
  }

  protected getDeclaredTitle(): string {
    return t("propertyConflict.title");
  }

  protected getShellRole(): SurfaceShellRole {
    return "dialog";
  }

  openAndWait(): Promise<PropertyTypeConflictModalResult> {
    return new Promise((resolve) => {
      this.callbacks.resolve = resolve;
      super.open();
    });
  }

  onOpen(): void {
    super.onOpen();
    const { contentEl } = this;
    contentEl.empty();
    this.modalEl.addClass("property-conflict-modal-host");
    contentEl.addClass("obnotion-modal", "obnotion-property-conflict-modal");
    contentEl.createEl("h3", { text: t("propertyConflict.title") });
    contentEl.createDiv({
      cls: "obnotion-modal-help",
      text: t("propertyConflict.desc", { count: this.options.conflicts.length }),
    });

    const list = contentEl.createDiv({ cls: "obnotion-property-conflict-list" });
    for (const conflict of this.options.conflicts) {
      this.renderConflictCard(list, conflict);
    }
    this.validationEl = contentEl.createDiv({ cls: "obnotion-property-conflict-validation" });

    const actions = contentEl.createDiv({ cls: "obnotion-modal-actions" });
    actions.createEl("button", {
      text: this.options.cancelText || t("common.cancel"),
      attr: { type: "button" },
    }).onclick = () => this.finish({ action: "cancel" });
    actions.createEl("button", {
      text: this.options.ignoreText || t("propertyConflict.ignoreAndApply"),
      attr: { type: "button" },
    }).onclick = () => {
      this.finish({ action: "ignore" });
    };
    this.confirmButton = actions.createEl("button", {
      cls: "mod-cta",
      text: this.options.confirmText || t("propertyConflict.applyResolvedTypes"),
      attr: { type: "button" },
    });
    this.confirmButton.onclick = () => {
      const changes = this.getResolvedDraftChanges();
      if (changes.length === 0) return;
      this.finish({
        action: "resolve",
        changes,
      });
    };
    this.updateValidation();
  }

  onClose(): void {
    super.onClose();
    this.modalEl.removeClass("property-conflict-modal-host");
    this.contentEl.empty();
    if (this.closed) return;
    this.closed = true;
    this.callbacks.resolve?.({ action: "cancel" });
    this.callbacks.resolve = undefined;
    this.callbacks.onClosed?.();
  }

  private renderConflictCard(parent: HTMLElement, conflict: PropertyTypeConflict): void {
    const item = parent.createDiv({ cls: "obnotion-property-conflict-item" });
    const header = item.createEl("button", {
      cls: "obnotion-property-conflict-header",
      attr: { type: "button", "aria-expanded": "false" },
    });
    header.createSpan({ cls: "obnotion-property-conflict-key", text: conflict.key });
    const summary = header.createSpan({ cls: "obnotion-property-conflict-header-summary" });
    this.renderObservableTypeCounts(summary, conflict.writers);
    const status = header.createSpan({ cls: "obnotion-property-conflict-status" });
    const body = item.createDiv({ cls: "obnotion-property-conflict-body" });
    body.createDiv({ cls: "obnotion-property-conflict-instruction", text: t("propertyConflict.resolveInstruction") });
    body.createDiv({
      cls: "obnotion-property-conflict-writers-title",
      text: t("propertyConflict.affectedFiles", { count: conflict.writers.length }),
    });
    this.renderWriterTable(body, conflict.writers);
    if (conflict.kind === "date-precision") {
      body.createDiv({ cls: "obnotion-property-conflict-note", text: t("propertyConflict.datePrecisionHint") });
    }
    if (conflict.involvesComputed) {
      body.createDiv({ cls: "obnotion-property-conflict-note", text: t("propertyConflict.computedHint") });
    }
    const cardState: ConflictCardState = {
      conflict,
      itemEl: item,
      bodyEl: body,
      statusEl: status,
      toggleEl: header,
      changed: false,
    };
    this.cardStates.set(conflict.key, cardState);
    header.onclick = () => this.setCardExpanded(cardState, body.hasClass("is-collapsed"));
    this.setCardExpanded(cardState, conflict.key === this.options.activeConflictKey);
    this.updateConflictCardState(cardState);
  }

  private renderObservableTypeCounts(parent: HTMLElement, writers: PropertyWriter[]): void {
    parent.empty();
    parent.createSpan({
      cls: "obnotion-property-conflict-types-label",
      text: t("propertyConflict.detectedTypesSummary", { count: getObservableTypeCounts(writers).length }),
    });
    for (const countItem of getObservableTypeCounts(writers)) {
      const wrap = parent.createSpan({ cls: "obnotion-property-conflict-type-count" });
      wrap.createSpan({ cls: "obnotion-property-conflict-type", text: getObservableTypeLabel(countItem.type) });
      wrap.createSpan({ cls: "obnotion-property-conflict-type-count-text", text: t("propertyConflict.fileCount", { count: countItem.count }) });
    }
  }

  private setCardExpanded(card: ConflictCardState, expanded: boolean): void {
    card.bodyEl.toggleClass("is-collapsed", !expanded);
    card.toggleEl.setAttr("aria-expanded", expanded ? "true" : "false");
    card.itemEl.toggleClass("is-collapsed", !expanded);
  }

  private renderWriterTable(parent: HTMLElement, writers: PropertyWriter[]): void {
    const table = parent.createDiv({ cls: "obnotion-property-conflict-table" });
    const header = table.createDiv({ cls: "obnotion-property-conflict-table-row obnotion-property-conflict-table-header" });
    header.createDiv({ cls: "obnotion-property-conflict-table-cell is-name", text: t("propertyConflict.columnDatabaseName") });
    header.createDiv({ cls: "obnotion-property-conflict-table-cell is-path", text: t("propertyConflict.columnDatabasePath") });
    header.createDiv({ cls: "obnotion-property-conflict-table-cell is-obsidian-type", text: t("propertyConflict.columnObsidianType") });
    header.createDiv({ cls: "obnotion-property-conflict-table-cell is-plugin-type", text: t("propertyConflict.columnPluginType") });
    header.createDiv({ cls: "obnotion-property-conflict-table-cell is-target-type", text: t("propertyConflict.columnTargetStorageType") });
    for (const writer of writers) {
      this.renderWriterRow(table, writer);
    }
  }

  private renderWriterRow(parent: HTMLElement, writer: PropertyWriter): void {
    const row = parent.createDiv({ cls: "obnotion-property-conflict-table-row" });
    const state = this.writerStates.find((candidate) => sameWriter(candidate.writer, writer));
    const nameCell = row.createDiv({ cls: "obnotion-property-conflict-table-cell is-name" });
    nameCell.createSpan({ cls: "obnotion-property-conflict-mobile-label", text: t("propertyConflict.columnDatabaseName") });
    nameCell.createSpan({ cls: "obnotion-property-conflict-db", text: writer.databaseName });
    const pathCell = row.createDiv({ cls: "obnotion-property-conflict-table-cell is-path" });
    pathCell.createSpan({ cls: "obnotion-property-conflict-mobile-label", text: t("propertyConflict.columnDatabasePath") });
    pathCell.createSpan({ cls: "obnotion-property-conflict-path", text: writer.databasePath || "" });
    const obsidianTypeCell = row.createDiv({ cls: "obnotion-property-conflict-table-cell is-obsidian-type" });
    obsidianTypeCell.createSpan({ cls: "obnotion-property-conflict-mobile-label", text: t("propertyConflict.columnObsidianType") });
    obsidianTypeCell.createSpan({
      cls: "obnotion-property-conflict-observable-type",
      text: getObservableTypeLabel(writer.observableType),
    });
    const pluginTypeCell = row.createDiv({ cls: "obnotion-property-conflict-table-cell is-plugin-type" });
    pluginTypeCell.createSpan({ cls: "obnotion-property-conflict-mobile-label", text: t("propertyConflict.columnPluginType") });
    createDropdownField({
      parent: pluginTypeCell,
      label: t("propertyConflict.changeTypeFor", { key: writer.key, database: writer.databaseName }),
      // The shared property-format list, gated rather than filtered: a computed writer's draft
      // can only resolve to a plain type, and no writer here can become a relation, rollup,
      // computed value or files column — disabled with a reason instead of omitted.
      options: buildTypePickerOptions(conflictWriterGate(writer.sourceKind, {
        notAWriterTarget: t("propertyConflict.typeNotAvailable"),
        computedOnlyPlainTypes: t("propertyConflict.computedOnlyPlainTypes"),
      })),
      value: writer.pluginType,
      className: "obnotion-property-conflict-type-dropdown",
      hideLabel: true,
      searchable: true,
      renderIcon: (parentEl, icon) => {
        renderDropdownPropertyTypeIcon(parentEl, icon);
      },
      onChange: (value) => {
        if (!state) return;
        state.type = value as ColumnDef["type"] | ComputedFieldDef["type"];
        state.targetTypeEl?.setText(getTargetObservableTypeLabel(state.type, writer.observableType));
        const card = this.cardStates.get(writer.key);
        if (card) {
          card.changed = true;
          this.setCardExpanded(card, true);
          this.updateConflictCardState(card);
        }
        this.updateValidation();
      },
    });
    const targetTypeCell = row.createDiv({ cls: "obnotion-property-conflict-table-cell is-target-type" });
    targetTypeCell.createSpan({ cls: "obnotion-property-conflict-mobile-label", text: t("propertyConflict.columnTargetStorageType") });
    const targetTypeEl = targetTypeCell.createSpan({
      cls: "obnotion-property-conflict-target-type",
      text: getTargetObservableTypeLabel(state?.type || writer.pluginType, writer.observableType),
    });
    if (state) {
      state.rowEl = row;
      state.targetTypeEl = targetTypeEl;
    }
  }

  private updateValidation(): void {
    for (const card of this.cardStates.values()) {
      this.updateConflictCardState(card);
    }
    const resolvedCount = this.getResolvedConflictCount();
    const unresolvedCount = this.options.conflicts.length - resolvedCount;
    if (this.confirmButton) this.confirmButton.disabled = resolvedCount === 0;
    if (!this.validationEl) return;
    const text = resolvedCount === 0
      ? t("propertyConflict.unresolved")
      : unresolvedCount === 0
        ? t("propertyConflict.resolved")
        : t("propertyConflict.partialResolved", { resolved: resolvedCount, unresolved: unresolvedCount });
    this.validationEl.setText(text);
    this.validationEl.toggleClass("is-resolved", resolvedCount > 0);
    this.validationEl.toggleClass("is-unresolved", unresolvedCount > 0);
  }

  private updateConflictCardState(card: ConflictCardState): void {
    const drafts = this.getDraftChanges();
    const resolved = isPropertyTypeConflictResolvedWithDrafts(card.conflict, drafts);
    const primaryType = getPrimaryDraftObservableType(card.conflict, drafts);
    card.itemEl.toggleClass("is-resolved", resolved);
    card.itemEl.toggleClass("is-unresolved", !resolved);
    card.statusEl.setText(resolved ? t("propertyConflict.statusResolved") : t("propertyConflict.statusUnresolved"));
    card.statusEl.toggleClass("is-resolved", resolved);
    card.statusEl.toggleClass("is-unresolved", !resolved);
    for (const state of this.writerStates) {
      if (!card.conflict.writers.some((writer) => sameWriter(writer, state.writer))) continue;
      const observable = getDraftObservableType(state.writer, drafts);
      const isConflict = !resolved && primaryType != null && observable !== primaryType;
      state.rowEl?.toggleClass("is-conflict", isConflict);
      state.targetTypeEl?.setText(observable ? getObservableTypeLabel(observable) : "");
      state.targetTypeEl?.toggleClass("is-current-conflict", isConflict);
    }
  }

  private getResolvedConflictCount(): number {
    return this.options.conflicts.filter((conflict) =>
      isPropertyTypeConflictResolvedWithDrafts(conflict, this.getDraftChanges())
    ).length;
  }

  private getDraftChanges(): PropertyTypeConflictDraftChange[] {
    return this.writerStates.map((state) => ({
      databaseId: state.writer.databaseId,
      databasePath: state.writer.databasePath,
      key: state.writer.key,
      sourceKind: state.writer.sourceKind,
      type: state.type,
    }));
  }

  private getResolvedDraftChanges(): PropertyTypeConflictDraftChange[] {
    return filterDraftChangesToResolvedConflicts(this.options.conflicts, this.getDraftChanges());
  }

  private finish(result: PropertyTypeConflictModalResult): void {
    const resolve = this.callbacks.resolve;
    this.callbacks.resolve = undefined;
    resolve?.(result);
    if (this.modalEl.isShown()) this.close();
  }
}

// ───────────────────────────────────────────────────────────────────
// 4. HELPERS
// ───────────────────────────────────────────────────────────────────

function getObservableTypeLabel(type: ObservablePropertyType): string {
  const key = `propertyConflict.observable.${type}`;
  const label = t(key);
  return label === key ? getPropertyTypeConflictTypeLabel(type) : label;
}

function getTargetObservableTypeLabel(
  type: ColumnDef["type"] | ComputedFieldDef["type"],
  fallback: ObservablePropertyType
): string {
  const observable = mapColumnTypeToObservablePropertyType(type) || fallback;
  return getObservableTypeLabel(observable);
}

function getPrimaryDraftObservableType(
  conflict: PropertyTypeConflict,
  drafts: PropertyTypeConflictDraftChange[]
): ObservablePropertyType | null {
  const counts = new Map<ObservablePropertyType, number>();
  for (const writer of conflict.writers) {
    const observable = getDraftObservableType(writer, drafts);
    if (!observable) continue;
    counts.set(observable, (counts.get(observable) || 0) + 1);
  }
  let primary: ObservablePropertyType | null = null;
  let primaryCount = 0;
  let tied = false;
  for (const [type, count] of counts.entries()) {
    if (count > primaryCount) {
      primary = type;
      primaryCount = count;
      tied = false;
    } else if (count === primaryCount) {
      tied = true;
    }
  }
  return tied ? null : primary;
}

function getObservableTypeCounts(writers: PropertyWriter[]): Array<{ type: ObservablePropertyType; count: number }> {
  const counts = new Map<ObservablePropertyType, number>();
  for (const writer of writers) {
    counts.set(writer.observableType, (counts.get(writer.observableType) || 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((left, right) => right.count - left.count || left.type.localeCompare(right.type));
}

function sameWriter(left: PropertyWriter, right: PropertyWriter): boolean {
  return left.databaseId === right.databaseId &&
    left.databasePath === right.databasePath &&
    left.key === right.key &&
    left.sourceKind === right.sourceKind;
}
