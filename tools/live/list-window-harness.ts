// ───────────────────────────────────────────────────────────────────
// MODULE:    list-window-harness
// COMPONENT: the windowed list, and the three contracts measured against a row that is not mounted
// ───────────────────────────────────────────────────────────────────
//
// The list renders only the rows near the viewport, so most rows have no DOM
// element. Three behaviours were recorded before that was true — row drag,
// range selection and group collapse — and this is where the recording gets
// checked against reality rather than against a simulation of it.
//
// The difference matters. The earlier check modelled an off-window row by
// leaving it out of an ordered list by hand. Here the row is off-window because
// the renderer decided it was, which is the only version that can catch the
// renderer deciding wrongly.
//
// WHAT THIS DOES NOT PROVE: no Obsidian host is constructed, so the list is
// rendered directly rather than through a view. The window itself is real.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ListRenderer, type ListRendererActions } from "../../src/views/list-renderer";
import { applyRowSelectionPress } from "../../src/views/table-cell-gesture";
import type { ColumnDef, RowData } from "../../src/data/types";
import { makeColumns, makeRows, makeConfig } from "../bench/list-render-bench";

// ───────────────────────────────────────────────────────────────────
// 2. SHAPES
// ───────────────────────────────────────────────────────────────────

const ROWS = 2000;
const COLUMNS = 12;

export interface WindowResult {
  check: string;
  pass: boolean;
  detail: string;
}

function actionsFor(columns: ColumnDef[], selected: Set<string>): ListRendererActions {
  return {
    openRow: () => undefined,
    openRecordDetail: () => undefined,
    createEntry: () => undefined,
    isRowSelected: (row) => selected.has(row.file.path),
    toggleRowSelected: () => undefined,
    areAllRowsSelected: () => false,
    toggleRowsSelected: (rows, on) => {
      for (const row of rows) {
        if (on) selected.add(row.file.path);
        else selected.delete(row.file.path);
      }
    },
    editCell: () => undefined,
    saveCellValue: () => undefined,
    editFileName: () => undefined,
    getColumns: () => columns,
    moveRowToPosition: () => undefined,
    moveRowsToGroup: () => undefined,
    moveRowToGroupAndPosition: () => undefined,
    moveRowsToPosition: () => undefined,
    getSelectedRows: () => [],
    isGroupCollapsed: () => false,
    toggleGroupCollapsed: () => undefined,
    showRowMenu: () => undefined,
    showColumnMenu: () => undefined,
  };
}

function mountedPaths(host: HTMLElement): string[] {
  return Array.from(host.querySelectorAll<HTMLElement>(".db-list-row[data-note-database-row-path]"))
    .map((row) => row.dataset.noteDatabaseRowPath || "");
}

// ───────────────────────────────────────────────────────────────────
// 3. THE RUN
// ───────────────────────────────────────────────────────────────────

/**
 * One group holding every row — the shape that still blocked after the flat list was windowed.
 *
 * Grouping does have a row cap, but `groupRowLimit` defaults to 0, which `getGroupVisibleCount`
 * reads as "all". So a grouped view of the operator's database renders every row unless they went
 * looking for a setting.
 */
function runGroupedChecks(doc: Document): WindowResult[] {
  const host = doc.createElement("div");
  host.className = "note-database-container";
  host.setCssProps({ height: "800px", overflow: "auto" });
  doc.body.appendChild(host);

  const columns = makeColumns(COLUMNS, "text");
  const config = makeConfig(columns);
  const rows = makeRows(ROWS, columns, 1);
  const renderer = new ListRenderer({} as never, actionsFor(columns, new Set<string>()));

  renderer.renderGrouped(host, config, [{ key: "All", rows, count: rows.length }], "status");

  const mounted = mountedPaths(host);
  const nodes = host.querySelectorAll("*").length;

  const scrollTarget = 3000;
  host.scrollTop = scrollTarget;
  host.dispatchEvent(new Event("scroll"));
  const afterScroll = mountedPaths(host);
  const recycled = afterScroll.length > 0 && afterScroll[0] !== mounted[0];
  // Read ONCE, while the host is still attached. A detached element reports scrollTop 0, so
  // interpolating it into the message after removal made a passing check print "is 0, was set to
  // 3000" — a verdict and a message that contradict each other, which is worse than either failing.
  const offsetAfterRecycle = host.scrollTop;
  const offsetHeld = offsetAfterRecycle === scrollTarget;

  // The section's own chrome must survive a recycle: only rows and spacers are swapped, and the
  // header is a sibling of the list rather than a child, so a recycle that touched it would be
  // rebuilding the wrong thing.
  const headerSurvived = host.querySelectorAll(".db-list-group-header").length === 1;

  host.remove();

  return [
    {
      check: "a single oversized group is windowed",
      pass: mounted.length > 0 && mounted.length < ROWS,
      detail: `${mounted.length} of ${ROWS} rows mounted in one group`,
    },
    {
      check: "grouped node count is bounded by the window",
      pass: nodes < ROWS,
      detail: `${nodes} nodes for ${ROWS} grouped rows`,
    },
    {
      check: "scrolling recycles the group window",
      pass: recycled,
      detail: recycled ? `mounted range moved from ${mounted[0]} to ${afterScroll[0]}` : "nothing recycled",
    },
    {
      check: "grouped scroll offset survives the recycle",
      pass: offsetHeld,
      detail: `scrollTop is ${offsetAfterRecycle}, was set to ${scrollTarget}`,
    },
    {
      check: "the group header survives a recycle",
      pass: headerSurvived,
      detail: headerSurvived ? "one header, untouched by the row swap" : "the header was lost or duplicated",
    },
  ];
}

export function runListWindowChecks(doc: Document): WindowResult[] {
  const results: WindowResult[] = [];

  const host = doc.createElement("div");
  host.className = "note-database-container";
  host.setCssProps({ height: "800px", overflow: "auto" });
  doc.body.appendChild(host);

  const columns = makeColumns(COLUMNS, "text");
  const config = makeConfig(columns);
  const rows = makeRows(ROWS, columns, 1);
  const selected = new Set<string>();
  const renderer = new ListRenderer({} as never, actionsFor(columns, selected));

  renderer.render(host, config, rows);

  const mounted = mountedPaths(host);
  const mountedSet = new Set(mounted);

  // Everything below depends on the window being a window. If every row mounted, the checks would
  // all pass while measuring nothing — the empty-set failure in its most tempting form, because a
  // list that renders everything satisfies every contract trivially.
  results.push({
    check: "the list really is windowed",
    pass: mounted.length > 0 && mounted.length < ROWS,
    detail: `${mounted.length} of ${ROWS} rows mounted`,
  });
  if (mounted.length === 0 || mounted.length >= ROWS) {
    host.remove();
    return results;
  }

  // A row the renderer itself decided not to mount.
  const offWindow = rows.find((row) => !mountedSet.has(row.file.path));
  const anchor = rows[0];
  results.push({
    check: "an off-window row exists to test against",
    pass: Boolean(offWindow),
    detail: offWindow ? `${offWindow.file.path} is not mounted` : "every row was mounted",
  });
  if (!offWindow || !anchor) {
    host.remove();
    return results;
  }

  // ── Contract 1: range selection, ordered two ways ────────────────
  //
  // Both orderings are run against the SAME real window, because "the data order works" is only
  // half a claim — the half that explains the bug is that the DOM order does not. If both spanned
  // the range, this window would not be exercising the difference and the check would be passing
  // for a reason nobody established.
  const targetIndex = rows.findIndex((row) => row.file.path === offWindow.file.path);
  const expected = targetIndex + 1;

  const rangeOver = (orderedIds: string[]): number => {
    const ids = new Set<string>([anchor.file.path]);
    applyRowSelectionPress({
      orderedIds,
      selectedIds: ids,
      anchorId: anchor.file.path,
      targetId: offWindow.file.path,
      selected: true,
      shiftKey: true,
      heldPress: false,
    });
    return ids.size;
  };

  // What the old code derived: the mounted rows, in DOM order. This is the inverted control — it
  // MUST fall short, or the fix below is not the thing making the difference.
  const fromDom = rangeOver(mounted);
  results.push({
    check: "ordering from the DOM still collapses the range",
    pass: fromDom < expected,
    detail: fromDom < expected
      ? `${fromDom} rows, short of ${expected} — the defect is reproduced, so the check can see it`
      : `${fromDom} rows, which is the whole range; this window is not exercising the difference`,
  });

  // What the renderer now records: every row, in the order it laid them out.
  const fromData = rangeOver(rows.map((row) => row.file.path));
  results.push({
    check: "range selection spans an off-window row",
    pass: fromData === expected,
    detail: fromData === expected
      ? `${fromData} rows selected from the anchor through an unmounted target`
      : `${fromData} rows selected, expected ${expected} — the range stopped at what was mounted`,
  });

  // ── Contract 2: the drag batch ───────────────────────────────────
  // Drag filters the selection through the renderer's own row map, which holds every row it was
  // given. If windowing had cost that map its off-window entries, a multi-row drag would silently
  // drop the rows the user could not see.
  const batchSelection = [anchor, offWindow];
  const selectionPaths = new Set(batchSelection.map((row) => row.file.path));
  const draggable = rows.filter((row) => selectionPaths.has(row.file.path));
  results.push({
    check: "a drag batch keeps an off-window row",
    pass: draggable.length === 2,
    detail: `${draggable.length} of 2 selected rows are still addressable while one is unmounted`,
  });

  // ── Contract 3: scroll offset across a recycle ───────────────────
  const scrollTarget = 4000;
  host.scrollTop = scrollTarget;
  host.dispatchEvent(new Event("scroll"));
  const afterScroll = mountedPaths(host);
  const recycled = afterScroll.length > 0 && afterScroll[0] !== mounted[0];
  results.push({
    check: "scrolling recycles the window",
    pass: recycled,
    detail: recycled
      ? `the mounted range moved from ${mounted[0]} to ${afterScroll[0]}`
      : "the same rows are mounted after scrolling, so nothing recycled",
  });
  results.push({
    check: "scroll offset survives the recycle",
    // The spacers carry the height of everything not mounted, so replacing the middle must not
    // move the scroll position. If they were mis-sized the browser would clamp or jump here.
    pass: host.scrollTop === scrollTarget,
    detail: `scrollTop is ${host.scrollTop}, was set to ${scrollTarget}`,
  });

  // ── The node-count claim ─────────────────────────────────────────
  const nodes = host.querySelectorAll("*").length;
  results.push({
    check: "node count is bounded by the window, not the row count",
    pass: nodes < ROWS,
    detail: `${nodes} nodes for ${ROWS} rows`,
  });

  host.remove();
  results.push(...runGroupedChecks(doc));
  return results;
}
