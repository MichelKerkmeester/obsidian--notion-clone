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
// The family's third shared question — which picker closes when another opens — is deliberately
// NOT answered here yet. Three pickers each keep their own registry, and the one this module would
// have been modelled on stores an `anchor` alongside its close callback to decide whether a second
// click on the same trigger is a toggle or a re-open. A registry written before that consumer is
// migrated would be a shape nothing had to fit, which is how a shared module ends up rewritten by
// its own first adopter. It arrives with the leg that migrates the three.

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
