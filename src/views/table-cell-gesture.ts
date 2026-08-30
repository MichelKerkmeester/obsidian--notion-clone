// ───────────────────────────────────────────────────────────────────
// MODULE:    table-cell-gesture
// COMPONENT: routes a table press — cell or row checkbox — by the input that made it
// ───────────────────────────────────────────────────────────────────
//
// A press on a cell means two different things depending on what pressed it.
// A mouse drops an anchor that shift and drag extend into a rectangle. A
// finger picks one cell and opens it, because none of the surrounding
// grammar — shift, drag, copy a block — has a touch equivalent here.
//
// No device predicate can tell those apart, and this plugin already has two
// that try. `isTouchDevice` is true for a mouse-driven split pane narrower
// than 760px; `isMobileBottomSheet` is false for a tablet held in a hand at
// 1024px. Each is right about the question it was written for, layout and
// presentation, and wrong as a proxy for input.
//
// The event knows. `pointerdown` carries `pointerType`, and the browser
// dispatches it on the same target before the compatibility mouse events it
// synthesises for that press, so reading it there answers the question by
// the time a mouse handler runs. That keeps a mouse on the pointer grammar
// at every width, on every device, including ones that measure as touch.
//
// Both cell-selection owners share this module rather than each carrying
// their own copy of the branch, because the branch is what drifted: two
// files independently decided that touch means "shift is held", and the
// screenshot that opened this work is what those two lines produce.
//
// The row checkbox carried the identical branch, in the identical pair of
// files, and outlived the cell repair — so touch obeyed two contradictory
// rules at once. Its rule now sits in this file beside the cell rule, for
// the same reason the cell rule is here: two copies of one decision is what
// produced the defect both times.
//
// Range selection has to stay reachable from a thumb, because it is the only
// way to act on many rows at once. Touch has no shift, so it needs a second
// gesture rather than a second meaning for the first one. A held press is
// that gesture: it is already the plugin's touch equivalent of a secondary
// press, it is unreachable from a mouse by the same pointer-type guard used
// above, and on a checkbox it was inert — no call site could fire anything
// from one, so nothing had to be taken away to make room.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { applyRangeSelection } from "../data/range-selection";
import { attachLongPress } from "../data/touch-environment";
import { isHTMLElement } from "./dom-guards";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

/** Which class of input produced a press. Pen is grouped with touch: it is a direct-manipulation
 *  device with no modifier keys, so the pointer grammar is unreachable from it. */
export type CellGesture = "touch" | "mouse";

/** What a press should do, once the gesture and the cell are both known. */
export type CellTapAction = "open-record" | "edit-cell" | "select-cell";

/** The column holding the note's own name, which is the row's main item wherever it is visible. */
export const TITLE_COLUMN_KEY = "file.name";

export interface CellAddressLike {
  rowPath: string;
  colKey: string;
}

export interface CellRangeLike {
  anchor: CellAddressLike;
  focus: CellAddressLike;
  active?: CellAddressLike;
}

export interface CellTapInput {
  gesture: CellGesture;
  /** The row's main item — the note-name column, or the first visible column when it is hidden. */
  isTitleCell: boolean;
  /** False for computed, rollup and the read-only file fields, which have no editor to open. */
  isEditable: boolean;
}

export interface CellRangeInput {
  gesture: CellGesture;
  shiftKey: boolean;
}

/**
 * The two ways a press on a row's selection checkbox can ask for a range.
 *
 * Neither field is a device question, which is the whole point. `shiftKey` needs a keyboard and
 * `heldPress` needs a finger, so each names the grammar that can produce it instead of asking what
 * kind of screen this is.
 */
export interface RowRangeInput {
  shiftKey: boolean;
  /** A press held past the long-press threshold. Only touch and pen can arm one. */
  heldPress: boolean;
}

export interface RowSelectionPress extends RowRangeInput {
  orderedIds: readonly string[];
  selectedIds: Set<string>;
  anchorId: string | null | undefined;
  targetId: string;
  selected: boolean;
}

export interface RowRangeGestureOptions {
  /** Fired when a held press on the row's own checkbox asks to extend the selection to this row. */
  onExtendRange: (event: PointerEvent) => void;
}

// ───────────────────────────────────────────────────────────────────
// 3. GESTURE DETECTION
// ───────────────────────────────────────────────────────────────────

function gestureOfPointer(pointerType: string): CellGesture {
  return pointerType === "touch" || pointerType === "pen" ? "touch" : "mouse";
}

/**
 * Watch one cell and report which input made the press currently being handled.
 *
 * The returned reader is meant to be called from inside a `mousedown` handler.
 * A synthesised `mousedown` is indistinguishable from a real click on its own —
 * it carries no `pointerType` and no touch flag — but the `pointerdown` that
 * preceded it on this same element does, and that is what this records.
 *
 * It defaults to `"mouse"` deliberately. If pointer events are ever missing the
 * fallback is the desktop grammar, which is merely wrong about a phone; the
 * opposite default would be wrong about every desktop.
 */
export function trackCellGesture(td: HTMLElement): () => CellGesture {
  let gesture: CellGesture = "mouse";
  td.addEventListener(
    "pointerdown",
    (event: PointerEvent) => {
      gesture = gestureOfPointer(event.pointerType);
    },
    true,
  );
  return () => gesture;
}

// ───────────────────────────────────────────────────────────────────
// 4. PRESS SEMANTICS
// ───────────────────────────────────────────────────────────────────

/**
 * The selection a press produces.
 *
 * A tap always collapses to the cell under the finger. That single rule is the
 * whole repair: the previous behaviour preserved the old anchor on every touch
 * press, which is shift-click with no way to not hold shift, and a second tap
 * anywhere painted the rectangle between the two.
 *
 * Extending stays reachable exactly where it has a grammar to support it — a
 * mouse, holding shift, with a selection already open.
 */
export function nextCellRange(
  current: CellRangeLike | null,
  address: CellAddressLike,
  input: CellRangeInput,
): CellRangeLike {
  const extend = input.gesture === "mouse" && input.shiftKey && current !== null;
  if (extend && current) {
    return { anchor: current.anchor, focus: address, active: address };
  }
  return { anchor: address, focus: address, active: address };
}

/**
 * Whether a press on a row's selection checkbox extends the selection from the anchor.
 *
 * The row counterpart of `nextCellRange`, kept next to it on purpose. Both answer the same
 * question about the same table, and when they lived apart they disagreed: this one used to read
 * `shiftKey || isTouchDevice(container)`, which is shift held down with no way to let go, so on a
 * phone every second checkbox painted the whole span between it and the last one.
 *
 * What replaces the predicate is not a narrower predicate. It is two named grammars, neither of
 * which a device can be mistaken for — a modifier key, or a held press. A mouse in a 700px split
 * pane measures as touch and still reaches only the first one.
 */
export function shouldExtendRowRange(input: RowRangeInput): boolean {
  return input.shiftKey || input.heldPress;
}

/**
 * Apply one press on a row checkbox to the selection set, and report the new anchor.
 *
 * Both table owners call this rather than reaching for `applyRangeSelection` themselves, because
 * reaching for it themselves is exactly how the two of them ended up with one copy each of a rule
 * that then only got fixed once.
 */
export function applyRowSelectionPress(press: RowSelectionPress): string | null {
  return applyRangeSelection({
    orderedIds: press.orderedIds,
    selectedIds: press.selectedIds,
    anchorId: press.anchorId,
    targetId: press.targetId,
    selected: press.selected,
    range: shouldExtendRowRange(press),
  });
}

/** True when a press landed on a row's own selection checkbox, not on a boolean field's checkbox. */
export function isRowSelectionCheckbox(target: EventTarget | null): boolean {
  return isHTMLElement(target) && target.matches("input.db-checkbox-row[type='checkbox']");
}

/**
 * Give a row's checkbox the held-press gesture that extends the selection.
 *
 * Built on `attachLongPress` rather than beside it, so the threshold, the movement tolerance, the
 * haptic and the touch-or-pen guard are the same objects the row menu uses — one gesture
 * vocabulary because there is one implementation, not because two of them were tuned to match.
 *
 * The row menu keeps its own `attachLongPress` on this same row, and the two cannot both fire: the
 * menu ignores presses that land on a control, and this ignores presses that do not land on the
 * checkbox.
 *
 * The extension is applied when the hold completes, not when the finger lifts, so the buzz and the
 * painted rows arrive together. That leaves a click still to come from the release, which would
 * toggle the row straight back off, so the first click after a completed hold is swallowed.
 */
export function attachRowRangeGesture(tr: HTMLElement, options: RowRangeGestureOptions): () => void {
  let swallowClick = false;

  const onPointerDownCapture = () => {
    swallowClick = false;
  };
  const onClickCapture = (event: Event) => {
    if (!swallowClick) return;
    swallowClick = false;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  };

  tr.addEventListener("pointerdown", onPointerDownCapture, true);
  tr.addEventListener("click", onClickCapture, true);
  const detachLongPress = attachLongPress(tr, {
    ignoreTarget: (event) => !isRowSelectionCheckbox(event.target),
    onLongPress: (event) => {
      swallowClick = true;
      options.onExtendRange(event);
    },
  });

  return () => {
    detachLongPress();
    tr.removeEventListener("pointerdown", onPointerDownCapture, true);
    tr.removeEventListener("click", onClickCapture, true);
  };
}

/**
 * What a press on a cell should do.
 *
 * The operator's sentence, made decidable: a tap in a cell opens that column's
 * editor, and a tap on the row's main item opens the record sheet instead.
 *
 * A mouse press always resolves to `select-cell`, which is what a click on a
 * cell does today. Opening an editor stays behind the double-click and the
 * per-type click the cell renderer already owns, so the desktop path through
 * this function adds nothing and removes nothing.
 */
export function resolveCellTapAction(input: CellTapInput): CellTapAction {
  if (input.gesture !== "touch") return "select-cell";
  if (input.isTitleCell) return "open-record";
  return input.isEditable ? "edit-cell" : "select-cell";
}

/**
 * Which column carries the row's main item.
 *
 * The note-name column when it is on screen; otherwise the first column that is, because a row
 * still has a main item when its name is hidden and the tap has to land somewhere.
 *
 * Exported because three callers need the same answer and had no shared way to get it: the table
 * view, the embedded renderer, and the cell renderer that decides whether a tap opens an editor.
 * The cell renderer answered `false` unconditionally, so in the one configuration where the main
 * item is not the note name, a tap opened that column's editor and the record sheet at once.
 */
export function isMainItemColumn(colKey: string, visibleColumnKeys: readonly string[]): boolean {
  if (colKey === TITLE_COLUMN_KEY) return true;
  if (visibleColumnKeys.includes(TITLE_COLUMN_KEY)) return false;
  return colKey === visibleColumnKeys[0];
}
