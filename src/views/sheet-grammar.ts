// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-grammar
// COMPONENT: the seven-element phone sheet contract, as checkable predicates
// ───────────────────────────────────────────────────────────────────
//
// Three operator reports named the same defect from three surfaces: the
// phone's sheets do not share one grammar. The grammar existed only as a set
// of calls a surface might or might not make, so conformance was built, never
// enforced, and a bare strip shipped beside fully-chromed sheets.
//
// This module is the grammar written down once, as predicates over a mounted
// surface, so a lane can ask "which elements does this surface satisfy" and
// fail on the answer rather than on an operator's screenshot. The class names
// below are the contract: a producer that draws an element under a different
// class has not drawn that element. Two surfaces carry legacy synonyms the
// phase did not re-dress — the record sheet's own header and row classes,
// which were operator-verified before this module existed — and the
// predicates accept exactly those, never a growing list.
//
// The predicates are structural: they read the DOM a renderer built. They do
// not measure, so geometry floors (the 44px close target, the safe-area
// inset) belong to the measurement lanes, and the touch-target ratchet is
// where the close floor is enforced.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { hasSheetDrag } from "./mobile-bottom-sheet";

// ───────────────────────────────────────────────────────────────────
// 2. ELEMENTS
// ───────────────────────────────────────────────────────────────────

export interface SheetGrammarElement {
  /** Stable key, used by the lane as the column name. */
  key: string;
  /** Human-readable row label. */
  label: string;
  satisfies(panel: HTMLElement): boolean;
}

function hasSheetSurface(panel: HTMLElement): boolean {
  const doc = panel.ownerDocument;
  return panel.hasClass("db-mobile-bottom-sheet")
    && panel.parentElement === doc.body
    && Boolean(doc.body.querySelector(".db-mobile-sheet-scrim"));
}

function hasSheetHandle(panel: HTMLElement): boolean {
  // The bar and the gesture are one element: the gesture draws the bar, so a
  // bar without a gesture cannot exist and a gesture without a bar is a sheet
  // that cannot be pulled down. Both halves are required because a rebuild
  // can restore the bar while the drag was never re-wired.
  return Boolean(panel.querySelector(".db-mobile-bottom-sheet-handle")) && hasSheetDrag(panel);
}

function hasSheetHeader(panel: HTMLElement): boolean {
  const header = panel.querySelector<HTMLElement>(".db-panel-header, .db-record-detail-header");
  if (!header) return false;
  const title = header.querySelector<HTMLElement>(".db-panel-title, .db-record-detail-title");
  const titleText = title?.textContent?.trim() ?? "";
  const close = header.querySelector<HTMLElement>(".db-sheet-close, .db-cell-edit-close");
  return titleText.length > 0 && close !== null;
}

function hasPaddedRows(panel: HTMLElement): boolean {
  // The record sheet's field rows predate the shared row class and were
  // verified on a device before this contract existed; everything else uses
  // the shared row.
  return Boolean(panel.querySelector(".db-panel-row, .db-record-detail-field"));
}

function hasSharedDropdownRows(panel: HTMLElement): boolean {
  // A native select renders the OS picker, which is a second dropdown grammar
  // — the one that shipped on the Add view's key-field row. The shared
  // dropdown's trigger and listbox carry their own classes, so any dropdown
  // a conforming surface builds is a shared one by construction.
  return !panel.querySelector("select");
}

function hasSegmentedToggleRows(panel: HTMLElement): boolean {
  // Choice groups are a segmented control or the shared checkbox; a bare
  // checkbox or radio is the second grammar this element exists to catch.
  const checkboxes = Array.from(panel.querySelectorAll<HTMLInputElement>("input[type='checkbox']"));
  if (checkboxes.some((input) => !input.classList.contains("db-checkbox"))) return false;
  if (panel.querySelector("input[type='radio']")) return false;
  const segmented = panel.querySelector<HTMLElement>(".db-segmented");
  if (!segmented) return true;
  return Array.from(segmented.children).every((child) =>
    child.classList.contains("db-segmented-option"));
}

function hasKeyboardAvoidance(panel: HTMLElement): boolean {
  // The placement loop publishes the keyboard figure to this variable on
  // every viewport event while the sheet is open; a sheet that never went
  // through placement carries no inset and stays docked behind the keyboard.
  const declared = panel.style.getPropertyValue("--db-keyboard-inset");
  return declared.length > 0 && Number.isFinite(Number.parseFloat(declared));
}

/**
 * The seven elements, in the order the lane prints them.
 */
export const SHEET_GRAMMAR_ELEMENTS: readonly SheetGrammarElement[] = [
  { key: "surface", label: "sheet surface", satisfies: hasSheetSurface },
  { key: "handle", label: "handle with drag-to-close", satisfies: hasSheetHandle },
  { key: "header", label: "header with title and close", satisfies: hasSheetHeader },
  { key: "rows", label: "padded rows", satisfies: hasPaddedRows },
  { key: "dropdown", label: "dropdowns via the shared dropdown", satisfies: hasSharedDropdownRows },
  { key: "segmented", label: "segmented/toggle rows", satisfies: hasSegmentedToggleRows },
  { key: "keyboard", label: "keyboard avoidance", satisfies: hasKeyboardAvoidance },
];

export interface SheetGrammarReport {
  [key: string]: boolean;
}

/**
 * Which of the seven elements a mounted surface satisfies.
 *
 * The caller decides what a surface is; this reports on the element itself.
 * A surface that does not carry the sheet class satisfies only what its own
 * markup happens to match, which is how a lane shows a non-sheet as red on
 * the surface element rather than as an unclassifiable blank.
 */
export function describeSheetGrammar(panel: HTMLElement): SheetGrammarReport {
  const report: SheetGrammarReport = {};
  for (const element of SHEET_GRAMMAR_ELEMENTS) {
    report[element.key] = element.satisfies(panel);
  }
  return report;
}
