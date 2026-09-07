// ───────────────────────────────────────────────────────────────────
// MODULE:    cell-editor-number
// COMPONENT: the number/currency inline editor, extracted behind CellRenderer.startEdit
// ───────────────────────────────────────────────────────────────────
//
// Body moved unchanged from `CellRenderer.editNumber`: it is a thin validation wrapper
// around the shared single-line-popover primitive (`cell-editor-text.ts`'s `openSingleLineEditor`),
// which is why this module is the smallest of the extraction.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { safeString } from "../../data/safe-string";
import { ColumnDef, RowData } from "../../data/types";
import { t } from "../../i18n";
import { clearTransientClass, showValidationError, type CellEditorContext, type CellEditSession } from "./cell-editor-shared";
import { openSingleLineEditor } from "./cell-editor-text";

// ───────────────────────────────────────────────────────────────────
// 2. THE EDITOR
// ───────────────────────────────────────────────────────────────────

/** Opens the number/currency editor. Moved unchanged from `CellRenderer.editNumber`. Needs the
 *  display-mode number renderer (`ctx.renderNumberValue`) to restore the cell's read view when the
 *  value did not actually change. */
export function openNumberEditor(
  ctx: CellEditorContext,
  td: HTMLElement,
  row: RowData,
  col: ColumnDef,
  currentValue: unknown,
  session?: CellEditSession,
  initialDraft?: string,
): void {
  const placeholder = session?.mixed ? (session?.placeholder ?? "") : undefined;
  const initial = initialDraft ?? (session?.mixed ? "" : safeString(currentValue));
  openSingleLineEditor(ctx, td, row, col, initial, "number", async (inputValue) => {
    const raw = inputValue;
    const newVal = raw ? parseFloat(raw) : "";
    if (raw && (typeof newVal !== "number" || !Number.isFinite(newVal))) {
      showValidationError(td, t("validation.invalidNumber"));
      return "validation";
    }
    if (String(newVal) !== String(currentValue) || session?.mixed) {
      const success = await ctx.commitEditedValue(row, col, newVal, session, raw ? "replace" : "clear");
      if (!success) return false;
    } else {
      ctx.renderNumberValue(td, undefined, col, currentValue);
    }
    clearTransientClass(td, "obnotion-cell-editing");
  }, () => {
    ctx.renderNumberValue(td, undefined, col, currentValue);
    clearTransientClass(td, "obnotion-cell-editing");
  }, session, placeholder, initialDraft === undefined);
}
