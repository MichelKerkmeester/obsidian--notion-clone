// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-grammar
// COMPONENT: the eight-column phone sheet contract, as checkable predicates
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
// spec.md's seven canonical elements are surface, handle, header, padded
// rows, segmented choices, keyboard avoidance and safe-area inset. A review
// at 07be64fe found the lane had quietly substituted "shared dropdown" for
// safe-area inset in that list of seven, so the check was never proving the
// spec's own contract. Safe-area inset is restored as the true seventh
// column here; dropdown stays, reported as an eighth column, because it
// still catches a real second grammar — a native `<select>`, or a one-off class that only looks
// like the shared dropdown.
//
// Most of these predicates measure, not just detect. A predicate that only
// asks "does one of these exist" passes on a single conforming node while a
// dozen sibling nodes carry zero padding, a bare checkbox, or a `<select>`
// — which is exactly how the row and dropdown columns above stayed green
// while the surfaces underneath drifted. `hasPaddedRows` and
// `hasSafeAreaInset` read `getComputedStyle` inside the real browser this
// lane already runs in, rather than trusting a class name to mean what it
// says everywhere it appears.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { hasSheetDrag } from "./mobile-bottom-sheet";

// The floor `.db-panel-row` itself declares (styles.css §21 PANEL ROWS) — the value sort and
// filter rows have always used. `.db-record-detail-field` (4px/6px) and the phone-scoped
// `.db-menu-item` (8px/16px, `.is-phone .db-menu-item.db-menu-item`) both clear it comfortably;
// there is no `--db-panel-row-padding` custom property to read instead, so the literal is named
// here rather than duplicated at every call site.
const ROW_PADDING_FLOOR_PX = 2;

// `.db-mobile-bottom-sheet`'s own rule sets `padding-bottom: calc(16px + env(safe-area-inset-
// bottom))`. A headless browser with no device notch resolves `env()` to 0, so the number this
// lane can observe is the literal term, not the environment term — checking for it is checking
// that the rule which *would* add the inset on a real device is the one actually applied, rather
// than some surface-specific override that dropped the calc() entirely.
const SAFE_AREA_PADDING_FLOOR_PX = 16;

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
  // The record sheet's field rows and the shared menu row predate the panel-row class, or sit
  // beside it, and were verified on a device before this contract existed; every other surface
  // uses the shared row. Existence alone used to pass a surface with one conforming row and a
  // dozen bare ones beside it; every match found is now measured, not just counted.
  const rows = Array.from(panel.querySelectorAll<HTMLElement>(".db-panel-row, .db-record-detail-field, .db-menu-item"));
  if (rows.length === 0) return false;
  const view = panel.ownerDocument.defaultView;
  if (!view) return false;
  return rows.every((row) => {
    // The Add view grid zeroes its own rows' own padding by design (verified against the geometry
    // lane's own group-gap ratio check): spacing comes from the form's own `gap`, and re-adding
    // padding here would be the exact double-count that design removed. Presence still counts
    // toward the column; the per-row floor does not apply to this one documented exception.
    if (row.closest(".db-add-view-form")) return true;
    const style = view.getComputedStyle(row);
    return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].every((value) => {
      const px = Number.parseFloat(value);
      return Number.isFinite(px) && px >= ROW_PADDING_FLOOR_PX;
    });
  });
}

function hasSharedDropdownRows(panel: HTMLElement): boolean {
  // A native select renders the OS picker, which is a second dropdown grammar — the one that
  // shipped on the Add view's key-field row. Absence of a `<select>` alone never proved a surface
  // WITH a dropdown built the shared one, so every element naming itself a dropdown is now checked
  // against the shared component's own prefix (`db-dropdown-field`/`db-dropdown-popover`/
  // `db-dropdown-option`) — a surface with no dropdown at all still passes, which is correct: there
  // is nothing on it to be a second grammar.
  //
  // The check is per element, not per class token: `createDropdownField` callers pass extra scoping
  // classes onto the same node (`db-dropdown-field db-panel-dropdown db-filter-field-dropdown`), and
  // every one of those also spells "dropdown" without being a competing component. What matters is
  // whether the ELEMENT that calls itself a dropdown also carries the shared family's own class.
  if (panel.querySelector("select")) return false;
  for (const el of Array.from(panel.querySelectorAll<HTMLElement>("*"))) {
    const classes = Array.from(el.classList);
    const namesItselfDropdown = classes.some((cls) => cls.toLowerCase().includes("dropdown"));
    if (!namesItselfDropdown) continue;
    if (!classes.some((cls) => cls.startsWith("db-dropdown"))) return false;
  }
  return true;
}

function hasSegmentedToggleRows(panel: HTMLElement): boolean {
  // Choice groups are a segmented control, the shared checkbox, or the `.db-new-placement` radio
  // substitute the settings/toolbar placement rows actually ship — the primitive every surface on
  // this program uses. `.db-segmented` alone was checked before, and no surface has ever used it,
  // which is exactly what made this column pass vacuously: there was nothing on any registered
  // surface that could ever turn it red. Checking `.db-new-placement` too gives it a real surface
  // to fail on if a group's children ever stop carrying the option class.
  const checkboxes = Array.from(panel.querySelectorAll<HTMLInputElement>("input[type='checkbox']"));
  if (checkboxes.some((input) => !input.classList.contains("db-checkbox"))) return false;
  if (panel.querySelector("input[type='radio']")) return false;
  const groups = Array.from(panel.querySelectorAll<HTMLElement>(".db-segmented, .db-new-placement"));
  return groups.every((group) => {
    const optionClass = group.classList.contains("db-segmented") ? "db-segmented-option" : "db-new-placement-option";
    return Array.from(group.children).every((child) => child.classList.contains(optionClass));
  });
}

function hasKeyboardAvoidance(panel: HTMLElement): boolean {
  // The placement loop publishes the keyboard figure to this variable on
  // every viewport event while the sheet is open; a sheet that never went
  // through placement carries no inset and stays docked behind the keyboard.
  const declared = panel.style.getPropertyValue("--db-keyboard-inset");
  return declared.length > 0 && Number.isFinite(Number.parseFloat(declared));
}

function hasSafeAreaInset(panel: HTMLElement): boolean {
  // `.db-mobile-bottom-sheet`'s own rule adds `env(safe-area-inset-bottom)` to a fixed 16px floor;
  // see the module-level comment on why the floor, not the environment term, is what a headless
  // run can observe.
  const view = panel.ownerDocument.defaultView;
  if (!view) return false;
  const paddingBottom = Number.parseFloat(view.getComputedStyle(panel).paddingBottom);
  return Number.isFinite(paddingBottom) && paddingBottom >= SAFE_AREA_PADDING_FLOOR_PX;
}

/**
 * The eight columns, in the order the lane prints them: spec.md's seven canonical elements,
 * plus dropdown conformance reported as an eighth column (see the module-level comment).
 */
export const SHEET_GRAMMAR_ELEMENTS: readonly SheetGrammarElement[] = [
  { key: "surface", label: "sheet surface", satisfies: hasSheetSurface },
  { key: "handle", label: "handle with drag-to-close", satisfies: hasSheetHandle },
  { key: "header", label: "header with title and close", satisfies: hasSheetHeader },
  { key: "rows", label: "padded rows", satisfies: hasPaddedRows },
  { key: "segmented", label: "segmented/toggle rows", satisfies: hasSegmentedToggleRows },
  { key: "keyboard", label: "keyboard avoidance", satisfies: hasKeyboardAvoidance },
  { key: "safeArea", label: "safe-area inset", satisfies: hasSafeAreaInset },
  { key: "dropdown", label: "dropdowns via the shared dropdown", satisfies: hasSharedDropdownRows },
];

export interface SheetGrammarReport {
  [key: string]: boolean;
}

/**
 * Which of the eight columns a mounted surface satisfies.
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
