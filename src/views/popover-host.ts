// ───────────────────────────────────────────────────────────────────
// MODULE:    popover-host
// COMPONENT: shared plumbing for the picker family — one search filter,
//            one create-affordance ordering
// ───────────────────────────────────────────────────────────────────
//
// Four pickers each invented their own answer to the same two questions: how a typed query narrows
// the visible rows, and where the "create a new one" row sits relative to the results. Four search
// implementations and a create row that lands wherever its caller's array happens to put it are the
// same drift repeated with different variable names.
//
// This module is the shared answer, extracted from the picker that already had the cleanest
// version of it rather than invented fresh — its search-filter logic is lifted unchanged, so the
// dropdown's own behaviour cannot be told apart from before this module existed by anything that
// only watches its rows, its sections or its empty state.
//
// The family's third shared question — which picker closes when another opens — is answered below
// by one registry, written against the consumer that needed the most from it: the date picker
// stores its trigger alongside its close callback to decide whether a second click on the same
// anchor toggles the picker closed or re-opens it elsewhere, so the shared shape carries an anchor
// from the start rather than being widened by its first real adopter.
//
// The fourth shared question — which cell of a keyboard grid an arrow key moves to — is answered
// once here too: the colour and icon pickers each measured their own grid geometrically (nearest
// swatch or icon by on-screen position, not by index), and the two measurers turned out to compute
// the identical thing.

// ───────────────────────────────────────────────────────────────────
// 0. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { buildShellHeader } from "./surface-shell";
import { isMobileBottomSheet, type ToolbarPopoverPositionOptions } from "./popover-position";

// ───────────────────────────────────────────────────────────────────
// 1. SEARCH FILTER
// ───────────────────────────────────────────────────────────────────

/** The minimum shape a row needs to be searched and hidden — a picker's own row type carries more
 * than this and passes straight through the generic unchanged. */
export interface PickerSearchRow {
  row: HTMLElement;
  section?: HTMLElement;
}

/**
 * Narrows a picker's rows to the ones matching a typed query, toggling each row's and each
 * section's visibility and the shared empty row along with them.
 *
 * Lifted verbatim from the dropdown's own filter rather than rewritten: the query is matched
 * against each row's own `data-search-text` attribute (never recomputed here, so a caller decides
 * what text a row answers to), a row's visibility follows a match, a section hides once every row
 * under it is hidden, and the empty row shows only when nothing survived the filter. Generic over
 * the caller's own row type so the filtered result keeps every field the caller already relies on
 * (a value, an option, a colour) rather than narrowing to just this interface's two fields.
 */
export function filterPickerRows<T extends PickerSearchRow>(
  rows: T[],
  query: string,
  emptyRow?: HTMLElement,
): T[] {
  const normalized = query.trim().toLowerCase();
  const visibleRows: T[] = [];
  for (const item of rows) {
    const matches = !normalized || (item.row.getAttribute("data-search-text") || "").includes(normalized);
    item.row.toggleClass("is-hidden", !matches);
    if (matches && !(item.row as HTMLButtonElement).disabled) visibleRows.push(item);
  }
  const sections = Array.from(new Set(rows.map((item) => item.section).filter((item): item is HTMLElement => item != null)));
  for (const section of sections) {
    const hasVisibleRow = rows.some((item) => item.section === section && !item.row.hasClass("is-hidden"));
    section.toggleClass("is-hidden", !hasVisibleRow);
  }
  if (emptyRow) emptyRow.toggleAttribute("hidden", visibleRows.length > 0);
  return visibleRows;
}

// ───────────────────────────────────────────────────────────────────
// 2. CREATE-AFFORDANCE ORDERING
// ───────────────────────────────────────────────────────────────────

/** The two fields this ordering reads — a picker's own option type carries more and is returned
 * with every other field intact, in the same relative order within each of the two groups. */
export interface OrderableOption {
  preserveValueOnSelect?: boolean;
  section?: string;
}

/**
 * Moves every unsectioned create-affordance option ahead of the picker's ordinary results, stably.
 *
 * A caller's own array puts a "create a new one" action wherever building that array happened to
 * put it, which today means last — appended after every real option. Reachable while the list is
 * short, and the first thing scrolled past once it is not, which is backwards for the one row whose
 * whole purpose is to be found while a search is still narrowing toward nothing. Moving it directly
 * under the search field, ahead of the results, keeps it in view exactly when a query is about to
 * come up empty. Both groups keep their own internal order — this only interleaves the two groups,
 * it does not otherwise resort either one.
 *
 * A create row that carries its own `section` is left where it is. A section header renders once,
 * at the point its first row appears; a picker with two create rows in two different sections
 * relies on that to group its rows into those sections at all, and pulling both rows to the front
 * would split each section across two non-adjacent places in the list instead. This ordering is
 * only for the flat, single-affordance shape it was measured against — a sectioned create row keeps
 * its section's own grouping.
 */
export function moveCreateOptionsFirst<T extends OrderableOption>(options: T[]): T[] {
  const creates: T[] = [];
  const rest: T[] = [];
  for (const option of options) {
    (option.preserveValueOnSelect && !option.section ? creates : rest).push(option);
  }
  return creates.length ? [...creates, ...rest] : options;
}

// ───────────────────────────────────────────────────────────────────
// 3. ACTIVE-PICKER REGISTRY
// ───────────────────────────────────────────────────────────────────

/** What the registry needs to answer both questions a picker asks it: is a picker already open on
 * this document, and is it the one anchored to the element about to be clicked again. */
export interface ActivePicker {
  anchor: HTMLElement;
  close(commit?: boolean): void;
}

const activePickers = new WeakMap<Document, ActivePicker>();

/** The picker currently open on `doc`, if any. */
export function getActivePicker(doc: Document): ActivePicker | undefined {
  return activePickers.get(doc);
}

/** Records `picker` as the open one for `doc`, replacing whatever was there without closing it —
 * the caller closes the previous picker itself, before it has built the next one to replace it. */
export function setActivePicker(doc: Document, picker: ActivePicker): void {
  activePickers.set(doc, picker);
}

/** Removes `picker` from the registry, but only if it is still the current entry — a picker that
 * already lost the slot to a newer one must not delete that newer one's entry on its own delayed
 * cleanup. */
export function clearActivePickerIfCurrent(doc: Document, picker: ActivePicker): void {
  if (activePickers.get(doc) === picker) activePickers.delete(doc);
}

/** Closes whichever picker is open on `doc`, if any. Returns whether one was open to close. */
export function closeActivePicker(doc: Document, commit = false): boolean {
  const picker = activePickers.get(doc);
  if (!picker) return false;
  picker.close(commit);
  return true;
}

// ───────────────────────────────────────────────────────────────────
// 4. PHONE SHEET HEADER
// ───────────────────────────────────────────────────────────────────

/**
 * Adds the phone sheet's title-and-close header ahead of a picker's own content, and hands back the
 * element to build that content into.
 *
 * Three pickers built this same three-line dance independently — check `isMobileBottomSheet`, call
 * the shell header builder, wrap the rest in a body div for the padded-row grammar to measure. Called
 * before any other content is added (as the desktop branch already implicitly is, since there is
 * nothing to prepend it ahead of), the header lands first with no separate reordering step.
 */
export function mountPickerSheetHeader(
  panel: HTMLElement,
  doc: Document,
  options: { title: string; onClose(): void; bodyCls: string },
): HTMLElement {
  if (!isMobileBottomSheet(doc)) return panel;
  buildShellHeader(panel, { title: options.title, onClose: options.onClose });
  return panel.createDiv({ cls: options.bodyCls });
}

// ───────────────────────────────────────────────────────────────────
// 5. GEOMETRIC GRID NAVIGATION
// ───────────────────────────────────────────────────────────────────

/**
 * Finds the grid item an arrow key should move focus to, by on-screen position rather than index —
 * so navigation stays correct however many columns a row holds, and however that count changes with
 * the panel's width.
 *
 * The colour picker's fixed-column swatch grid and the icon picker's width-dependent icon grid each
 * had their own copy of this, written independently for grids of different shapes, and the two
 * turned out to be the same algorithm: find the row within a vertical tolerance of the current
 * item's centre for a horizontal move, or the nearest item strictly above/below for a vertical one.
 * Nothing here is keyed by a declared column count or row length — a caller with a laid-out grid of
 * any shape gets correct behaviour from the same function.
 */
export function getGridNavigationTarget<T extends HTMLElement>(
  items: T[],
  index: number,
  key: string,
): number | undefined {
  const current = items[index];
  if (!current) return undefined;
  const rect = current.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const positions = items.map((item) => {
    const itemRect = item.getBoundingClientRect();
    return { item, x: itemRect.left + itemRect.width / 2, y: itemRect.top + itemRect.height / 2 };
  });
  if (key === "ArrowLeft" || key === "ArrowRight") {
    const row = positions.filter((candidate) => Math.abs(candidate.y - centerY) <= Math.max(8, rect.height));
    row.sort((a, b) => a.x - b.x);
    const rowIndex = row.findIndex((candidate) => candidate.item === current);
    const next = row[rowIndex + (key === "ArrowLeft" ? -1 : 1)];
    return next ? items.indexOf(next.item) : undefined;
  }
  const direction = key === "ArrowUp" ? -1 : key === "ArrowDown" ? 1 : 0;
  if (!direction) return undefined;
  const candidates = positions
    .filter((candidate) => direction < 0 ? candidate.y < centerY - 2 : candidate.y > centerY + 2)
    .sort((a, b) => Math.abs(a.y - centerY) - Math.abs(b.y - centerY) || Math.abs(a.x - centerX) - Math.abs(b.x - centerX));
  return candidates[0] ? items.indexOf(candidates[0].item) : undefined;
}

// ───────────────────────────────────────────────────────────────────
// 6. WIDTH ROLES
// ───────────────────────────────────────────────────────────────────

/** The date picker's segmented-input-plus-calendar panel — the content floor its three/five
 * segments and the mini calendar below them need, not a rounder number. */
export const DATE_PICKER_POPOVER: ToolbarPopoverPositionOptions = {
  minWidth: 252,
  preferredWidth: 252,
  maxWidth: 252,
};

/** The colour picker's labelled list, at Anytype's own measured panel width (`052`'s
 * `anytype-menu-grammar.md` G15) — not the 124 a 4x4 swatch grid used to need. */
export const SWATCH_PICKER_POPOVER: ToolbarPopoverPositionOptions = {
  minWidth: 224,
  preferredWidth: 224,
  maxWidth: 224,
};

/** The icon/emoji grid picker — the content floor of its own tab/category/search chrome plus grid. */
export const GRID_PICKER_POPOVER: ToolbarPopoverPositionOptions = {
  minWidth: 318,
  preferredWidth: 318,
  maxWidth: 318,
};

/** The relation editor's row carries a record icon, a title and a trailing check on one line —
 * wider than a plain select option needs, which is why this role is its own rather than reusing
 * a narrower one. */
export const RELATION_PICKER_POPOVER: ToolbarPopoverPositionOptions = {
  minWidth: 360,
  preferredWidth: 420,
  maxWidth: 520,
};
