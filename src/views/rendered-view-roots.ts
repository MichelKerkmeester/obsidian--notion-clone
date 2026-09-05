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
  "db-table",
  "db-table-wrap",
  "db-grouped-table",
  "db-board",
  "pm-kanban-board",
  "db-gallery",
  "db-gallery-grouped",
  "db-gallery-total-header",
  "db-list",
  "db-list-grouped",
  "db-list-total-header",
  "db-chart",
  "db-chart-empty",
  "db-chart-number",
  "db-calendar",
  "db-timeline",
  "db-summary",
  "db-selection-status-bar",
  "db-empty",
];

/** Classes a view puts on the container itself rather than on its root, and
 *  which therefore outlive the root unless they come off with it. */
const VIEW_CONTAINER_CLASSES = ["pm-kanban-view"];

// ───────────────────────────────────────────────────────────────────
// 2. TEARDOWN
// ───────────────────────────────────────────────────────────────────

export function clearRenderedViewRoots(container: HTMLElement): void {
  for (const child of Array.from(container.children)) {
    if (VIEW_ROOT_CLASSES.some((cls) => child.classList.contains(cls))) child.remove();
  }
  for (const cls of VIEW_CONTAINER_CLASSES) container.classList.remove(cls);
}
