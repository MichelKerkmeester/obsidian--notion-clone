// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-editor-shared
// COMPONENT: the host context and the stateless helpers every extracted cell editor shares
// ───────────────────────────────────────────────────────────────────
//
// Each editor's body moved unchanged out of `CellRenderer` into its own module, as a function
// taking an options object carrying the same dependencies the method read from `this` before the
// move. Most of that is either a constructor-injected collaborator (the data source, the app) or a
// save/refresh/close callback that only `CellRenderer` can serialize correctly, because one editor
// session at a time is active across the whole table. That subset is `CellEditorContext` below,
// built fresh per call by `CellRenderer` from its own private state.
//
// Everything else the moved bodies call is a pure function of its arguments — no `this` at all —
// and lives here once instead of once per editor: measuring a bulk-edit session's anchor rect,
// showing a validation flash, rendering the retry/discard failure row, and normalizing a value for
// save. A function that reads no instance state is not a dependency to inject; it is a helper to
// import.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { App } from "obsidian";
import { toMultiSelectValuesForKey, toValidObsidianTagValues, normalizeOptionValueForKey } from "../../data/column-types";
import type { DataSource } from "../../data/data-source";
import * as FilesColumn from "../../data/files-column";
import { ColumnDef, RowData, StatusOptionDef } from "../../data/types";
import { t } from "../../i18n";
import type { TableCellNavigationIntent } from "../../data/table-keyboard-navigation";

// ───────────────────────────────────────────────────────────────────
// 2. THE SHARED EDIT-SESSION CONTRACT
// ───────────────────────────────────────────────────────────────────
//
// Canonical home for the types every extracted editor and `CellRenderer` itself share. Defined
// here rather than in `cell-renderer.ts` because this folder's own boundary rule forbids a
// primitive importing from a consumer file — `cell-renderer.ts` re-exports these for its own
// existing callers instead.

export type CellEditCommitIntent = "replace" | "clear";

export interface CellOptionTransaction {
  previousOptions?: StatusOptionDef[];
  nextOptions?: StatusOptionDef[];
  cleanupRemovedValues?: string[];
  renameValues?: Array<{ from: string; to: string }>;
  setValue?: boolean;
  value?: unknown;
}

export interface CellEditSession {
  mixed?: boolean;
  placeholder?: string;
  anchorEl?: () => HTMLElement | null;
  commitValue(value: unknown, intent?: CellEditCommitIntent): Promise<void>;
  commitOptionTransaction?(transaction: CellOptionTransaction): Promise<void>;
  onClose?(): void;
}

// ───────────────────────────────────────────────────────────────────
// 3. THE HOST CONTEXT
// ───────────────────────────────────────────────────────────────────

/**
 * The dependencies every extracted editor reads from `CellRenderer`, gathered once rather than
 * declared once per editor: the ones that genuinely need the class's own state (the single active
 * editor slots, the serialized save path) or its constructor-injected collaborators. A field an
 * editor never reads is simply left unused by that editor's call site — one shared shape reads
 * easier than five near-identical ones for five callers that already overlap this heavily.
 */
export interface CellEditorContext {
  app?: App;
  dataSource: DataSource;
  commitEditedValue(
    row: RowData,
    col: ColumnDef,
    value: unknown,
    session: CellEditSession | undefined,
    intent?: CellEditCommitIntent,
  ): Promise<boolean>;
  refreshAfterSave(): Promise<void>;
  finishInlineEdit(row: RowData, col: ColumnDef, session: CellEditSession | undefined, intent: TableCellNavigationIntent): void;
  commitCellOptionTransaction?(row: RowData, col: ColumnDef, transaction: CellOptionTransaction): Promise<void>;
  /** Runs `task` on the option-commit serial queue so two overlapping option-set writes never race. */
  enqueueOptionCommit<T>(task: () => Promise<T>): Promise<T>;
  getActiveOptionPopoverClose(): (() => void) | undefined;
  setActiveOptionPopoverClose(close: (() => void) | undefined): void;
  getActiveInlineEditorCancel(): (() => void) | undefined;
  setActiveInlineEditorCancel(cancel: (() => void) | undefined): void;
  getActiveTextEditClose(): (() => void) | undefined;
  setActiveTextEditClose(close: (() => void) | undefined): void;
  closeActiveOptionPopover(): boolean;
  /** The display-mode number renderer, needed only to restore a cell's read view on a no-op save. */
  renderNumberValue(td: HTMLElement, row: RowData | undefined, col: ColumnDef, value: unknown): void;
}

// ───────────────────────────────────────────────────────────────────
// 4. STATELESS HELPERS
// ───────────────────────────────────────────────────────────────────

/** The bulk-edit session's own anchor, when it is still connected — the same rect every editor
 *  measures from in place of the cell's own box, so a multi-cell selection edits relative to the
 *  chip that represents it rather than whichever cell happened to start the session. */
export function bulkAnchorRect(session: CellEditSession | undefined): DOMRect | null {
  const el = session?.anchorEl?.();
  return el?.isConnected ? el.getBoundingClientRect() : null;
}

/** Flashes the shared validation-error animation on `element` and sets its title/aria state. */
export function showValidationError(element: HTMLElement, message: string): void {
  element.setAttribute("aria-invalid", "true");
  element.title = message;
  element.removeClass("obnotion-validation-error");
  void element.offsetWidth;
  element.addClass("obnotion-validation-error");
  element.addEventListener("animationend", () => element.removeClass("obnotion-validation-error"), { once: true });
}

/** Renders the retry/discard row a failed save shows beside the still-open editor. */
export function renderDraftFailure(
  host: HTMLElement,
  input: HTMLInputElement | HTMLTextAreaElement,
  retry: () => void,
  discard: () => void,
): void {
  host.querySelector<HTMLElement>(".obnotion-draft-failure")?.remove();
  const failure = host.createDiv({ cls: "obnotion-draft-failure", attr: { role: "alert" } });
  failure.createSpan({ cls: "obnotion-draft-failure-text", text: t("editor.saveFailed") });
  const retryButton = failure.createEl("button", { cls: "obnotion-draft-action", text: t("editor.retry"), attr: { type: "button" } });
  retryButton.onclick = (event) => {
    event.preventDefault();
    retry();
  };
  const discardButton = failure.createEl("button", { cls: "obnotion-draft-action", text: t("editor.discard"), attr: { type: "button" } });
  discardButton.onclick = (event) => {
    event.preventDefault();
    discard();
  };
  input.setAttribute("aria-invalid", "true");
  input.title = t("editor.saveFailed");
}

/** Removes a transient CSS class from `el`. A one-line wrapper kept as a named function because
 *  every editor that moved out from behind `CellRenderer` was already calling it as one. */
export function clearTransientClass(el: HTMLElement, className: string): void {
  el.removeClass(className);
}

/** The value shape each column type expects on save — files parsed and normalized, tags validated,
 *  multi-select and single-select values coerced through the column's own key. Read by both
 *  `CellRenderer.saveValue` and the option editor's local commit path, which is why it lives here
 *  rather than inside either caller. */
export function normalizeCellValueForSave(col: ColumnDef, value: unknown): unknown {
  if (value == null) return value;
  if (col.type === "files") return FilesColumn.normalize(FilesColumn.parseEdit(value));
  if (col.key === "file.tags") return toValidObsidianTagValues(value);
  if (col.type === "multi-select") return toMultiSelectValuesForKey(col.key, value);
  if (col.type === "select" || col.type === "status") return normalizeOptionValueForKey(col.key, value);
  return value;
}
