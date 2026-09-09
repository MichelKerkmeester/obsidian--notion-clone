// ───────────────────────────────────────────────────────────────────
// MODULE:    rendered-view-roots
// COMPONENT: removes the previous view's rendered root before a re-render
// ───────────────────────────────────────────────────────────────────
//
// Every view type renders its own root into the same container, and each
// render rebuilds from scratch. Nothing else clears the container, so a root
// this list does not name survives a switch to another view type and the next
// view stacks underneath it.
//
// Only top-level roots are removed; panels manage their own contents.

// ───────────────────────────────────────────────────────────────────
// 1. ROOTS
// ───────────────────────────────────────────────────────────────────

const VIEW_ROOT_CLASSES = [
  "obnotion-table",
  "obnotion-table-wrap",
  "obnotion-grouped-table",
  "obnotion-board",
  "obnotion-kanban-board",
  "obnotion-gallery",
  "obnotion-gallery-grouped",
  "obnotion-gallery-total-header",
  "obnotion-list",
  "obnotion-list-grouped",
  "obnotion-list-total-header",
  "obnotion-summary",
  "obnotion-selection-status-bar",
  "obnotion-empty",
];

/** Classes a view puts on the container itself rather than on its root, and
 *  which therefore outlive the root unless they come off with it. */
const VIEW_CONTAINER_CLASSES = ["obnotion-kanban-view"];

// ───────────────────────────────────────────────────────────────────
// 2. TEARDOWN
// ───────────────────────────────────────────────────────────────────

export function clearRenderedViewRoots(container: HTMLElement): void {
  for (const child of Array.from(container.children)) {
    if (VIEW_ROOT_CLASSES.some((cls) => child.classList.contains(cls))) child.remove();
  }
  for (const cls of VIEW_CONTAINER_CLASSES) container.classList.remove(cls);
}
