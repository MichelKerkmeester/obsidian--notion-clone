// ───────────────────────────────────────────────────────────────────
// MODULE:    panel-refresh-bench
// COMPONENT: counts full view rebuilds across one sort/filter panel round trip
// ───────────────────────────────────────────────────────────────────
//
// The other benches in this folder measure how long one render takes. This one
// measures how many renders a single user interaction asks for, which is a
// different defect with a different fix: a render can be perfectly fast and the
// interaction still cost three of them.
//
// It drives the real routing methods — DatabaseView.toggleHeaderPopover,
// closeHeaderPopovers, renderSortPanel, renderFilterPanel and refresh itself,
// plus the real SortPanelRenderer and FilterPanelRenderer — and replaces only
// DatabaseView.render with a counter. That split is deliberate: render is the
// cost, and everything above it is the decision about how often to pay it. This
// harness is about the decision, so the cost is the one thing safe to stub.
//
// The instance is built with Object.create rather than `new` because the
// constructor reaches Obsidian's FileView, a vault and a metadata cache, none of
// which exist outside the app. Every method under test is the shipped prototype
// method; the assigned fields are collaborators, not behaviour.
//
// Counting alone would pass a coalescer that simply drops the last update, so
// every scenario also records the state each render observed and compares the
// final one against the state left behind. A round trip that ends with fewer
// rebuilds but a stale view is a worse outcome than the defect it replaced, and
// has to read as a failure here.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { DatabaseView } from "../../src/views/database-view";
import { SortPanelRenderer } from "../../src/views/sort-panel-renderer";
import { FilterPanelRenderer } from "../../src/views/filter-panel-renderer";
import type { ColumnDef, ViewConfig } from "../../src/data/types";
import type { DatabaseViewState } from "../../src/views/view-state-store";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface Scenario {
  /** Scenario id, stable enough to assert against. */
  name: string;
  /** Which panel the round trip drives. */
  panel: "sort" | "filter";
  /** How the panel was dismissed. */
  dismissal: string;
  /** Distinct changes the round trip made, which is what bounds a fair rebuild count. */
  changes: number;
  /**
   * Rebuilds this round trip may cost, or null when it is deliberately not
   * budgeted. One rebuild per change is the whole claim: repeating the row build
   * to produce an identical result is the defect, doing it once per change is not.
   */
  budget: number | null;
  /** Full DatabaseView.render() invocations across the whole round trip. */
  renders: number;
  /** render() invocations attributed to each leg of the round trip. */
  legs: { open: number; change: number; dismiss: number };
  /** The view state the last render observed. */
  lastRenderedState: string;
  /** The view state left behind once the round trip finished. */
  finalState: string;
  /** False when the view was left painting something other than the final state. */
  paintsFinalState: boolean;
  /**
   * Set on the scenarios whose whole point is that a rebuild still happens. The
   * skip is deliberately narrow, and a check that only ever pushed the count down
   * would applaud widening it past the panels that were shown to be safe.
   */
  requiresRebuild?: boolean;
}

interface Harness {
  view: DatabaseView;
  state: DatabaseViewState;
  container: HTMLElement;
  doc: Document;
  renders: number;
  renderedStates: string[];
  anchor: HTMLElement;
}

// ───────────────────────────────────────────────────────────────────
// 3. FIXTURES
// ───────────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  { key: "file.name", label: "Name", type: "text" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "category", label: "Category", type: "text" },
];

function makeConfig(): ViewConfig {
  return {
    name: "Bench",
    viewType: "list",
    sourceFolder: "notes",
    schema: { columns: COLUMNS, computedFields: [] },
    columns: COLUMNS,
  } as unknown as ViewConfig;
}

function makeState(): DatabaseViewState {
  return {
    sortRules: [],
    sortColumn: undefined,
    sortDirection: "asc",
    filters: [],
    filterTree: undefined,
    hiddenColumns: new Set<string>(),
    searchText: "",
    groupByField: "",
  } as unknown as DatabaseViewState;
}

/**
 * What a render would have painted: everything these panels can change about the
 * rows. Hidden columns are in here because the column manager is the panel whose
 * mutations are not all self-painting, and a snapshot that could not see a hidden
 * column would report its dismissal as fresh no matter what the dismissal did.
 */
function snapshotState(state: DatabaseViewState): string {
  return JSON.stringify({
    sortRules: state.sortRules,
    filters: (state.filters || []).map((rule) => ({ ...rule })),
    hiddenColumns: Array.from(state.hiddenColumns ?? []).sort(),
  });
}

// ───────────────────────────────────────────────────────────────────
// 4. HARNESS
// ───────────────────────────────────────────────────────────────────

/**
 * A DatabaseView whose routing methods are the shipped ones and whose render is
 * a counter. Everything assigned below is a collaborator the routing methods
 * call through; none of it decides how many times render is asked for.
 */
function makeHarness(host: HTMLElement): Harness {
  const container = host.createDiv({ cls: "note-database-container" });
  const toolbar = container.createDiv({ cls: "db-toolbar" });
  const anchor = toolbar.createEl("button", { cls: "db-sort-btn" });
  toolbar.createEl("button", { cls: "db-filter-btn" });

  const config = makeConfig();
  const state = makeState();
  const view = Object.create(DatabaseView.prototype) as DatabaseView;

  const harness: Harness = {
    view,
    state,
    container,
    doc: container.ownerDocument,
    renders: 0,
    renderedStates: [],
    anchor,
  };

  Object.assign(view, {
    // ── Under test: left as the shipped prototype methods ──
    // refresh, toggleHeaderPopover, closeHeaderPopovers, renderSortPanel,
    // renderFilterPanel, isHeaderPopoverVisible, clearHeaderPopover,
    // persistVisibleHeaderPopoverState, installHeaderPopoverAutoClose,
    // getHeaderPopoverAnchor.

    // ── The instrument ──
    render: () => {
      harness.renders += 1;
      harness.renderedStates.push(snapshotState(state));
    },

    // ── Real collaborators ──
    sortPanelRenderer: new SortPanelRenderer(),
    filterPanelRenderer: new FilterPanelRenderer(),

    // ── State the routing methods read ──
    containerEl_: container,
    rows: [],
    lastRenderedViewType: "list",
    configSaveTimer: null,
    showFilterPanel: false,
    showSortPanel: false,
    showColumnManager: false,
    showViewConfigPanel: false,
    activeHeaderPopover: undefined,
    headerPopoverAnchorEl: undefined,
    removeHeaderPopoverAutoClose: undefined,
    pendingUndoLabel: "",
    cellSelection: undefined,

    // ── Stubs: reached by the methods under test, but never a render decision ──
    getConfig: () => config,
    vs: () => state,
    hasActiveDatabase: () => true,
    captureInteractionSnapshot: () => ({}),
    restoreInteractionSnapshot: () => undefined,
    showSkeletonLoader: () => undefined,
    hideSkeletonLoader: () => undefined,
    updateRefreshIndicator: () => undefined,
    updateStickyOffsets: () => undefined,
    updateToolbarIndicators: () => undefined,
    renderColumnManager: () => undefined,
    renderViewConfigPanel: () => undefined,
    scheduleViewStateSave: () => undefined,
    saveConfigImmediatelyInBackground: () => undefined,
    closeGroupOrderPopover: () => undefined,
    activeRulePopoverRenderer: { close: () => undefined },
    chartToolbarRenderer: { closePopover: () => undefined },
    calendarToolbarRenderer: { closePopover: () => undefined },
    toolbarRenderer: { closePopovers: () => undefined },
  });

  return harness;
}

// Private on the class, ordinary prototype methods at runtime. The bench drives
// the same entry points a toolbar click and an outside click reach.
type Routing = {
  toggleHeaderPopover(kind: "filter" | "sort" | "columns" | "view", anchorEl: HTMLElement): void;
  closeHeaderPopovers(): void;
  renderSortPanel(): void;
  renderFilterPanel(): void;
  refresh(options?: { viewport?: string }): void;
};

const routing = (view: DatabaseView): Routing => view as unknown as Routing;

// ───────────────────────────────────────────────────────────────────
// 5. INTERACTION LEGS
// ───────────────────────────────────────────────────────────────────

/**
 * Click a control the real panel renderer built.
 *
 * Scoped to the document rather than the view container because at phone width
 * the panel is portalled out to `body` as a bottom sheet. A container-scoped
 * query finds nothing there, and reads as "the panel never rendered" when in
 * fact it rendered somewhere else.
 */
function clickIn(harness: Harness, selector: string, index = 0): boolean {
  const targets = Array.from(harness.doc.querySelectorAll<HTMLElement>(selector));
  const target = targets[index];
  if (!target) return false;
  target.click();
  return true;
}

/**
 * A missing target usually means a panel silently declined to render rather than
 * that the selector drifted, and the two need different fixes. Reporting what the
 * document does hold keeps the harness from failing opaquely.
 */
function describeDoc(harness: Harness): string {
  const classes = Array.from(harness.doc.querySelectorAll<HTMLElement>("*"))
    .map((el) => (typeof el.className === "string" ? el.className : ""))
    .filter(Boolean);
  return classes.length === 0 ? "<empty>" : Array.from(new Set(classes)).join(" | ");
}

/**
 * Click the panel's add-a-rule button.
 *
 * Matched as a direct child of the panel rather than by ordinal, because both
 * panels put other `.db-panel-button` controls inside nested rows — the filter
 * panel's AND/OR toggle is the first one in document order, and clicking it
 * changes the rule tree instead of adding a rule.
 */
function clickAddRule(harness: Harness, panel: "sort" | "filter"): boolean {
  const root = harness.doc.querySelector<HTMLElement>(panel === "sort" ? ".db-sort-panel" : ".db-filter-panel");
  if (!root) return false;
  const button = root.querySelector<HTMLElement>(":scope > .db-panel-button");
  if (!button) return false;
  button.click();
  return true;
}

/**
 * Let a deferred paint land before the round trip is judged.
 *
 * Coalescing to a microtask or a frame is a legitimate way to solve this, and a
 * harness that read its numbers synchronously would record those mechanisms as
 * stale views and rule them out for being asynchronous rather than for being
 * wrong. The wait also outlasts the filter panel's 220ms keystroke debounce, so
 * a refresh that is merely late still counts as one that happened.
 */
function settle(view: Window): Promise<void> {
  return new Promise((done) => {
    view.setTimeout(() => {
      view.requestAnimationFrame(() => view.requestAnimationFrame(() => done()));
    }, 300);
  });
}

/** Drop everything this harness put in the document, portalled sheets included. */
function teardown(harness: Harness): void {
  harness.container.remove();
  harness.doc.querySelectorAll(".db-sort-panel, .db-filter-panel, .db-overlay-backdrop")
    .forEach((el) => el.remove());
}

/** The dismissals a user actually has: the toolbar button, an outside click, and the panel's own close. */
function dismiss(harness: Harness, panel: "sort" | "filter", how: string): void {
  const view = harness.view;
  if (how === "toolbar-button") {
    routing(view).toggleHeaderPopover(panel, harness.anchor);
    return;
  }
  if (how === "outside-click") {
    // What overlayStack invokes when a pointerdown lands outside the panel.
    routing(view).closeHeaderPopovers();
    return;
  }
  if (how === "panel-close") {
    // The panel's own close affordance, which on a phone is the sheet's dismiss.
    clickIn(harness, panel === "sort" ? ".db-panel-close" : ".db-filter-panel-close");
    // Not every panel exposes one; fall back to the same action the close wires.
    if (harness.doc.querySelector(panel === "sort" ? ".db-sort-panel" : ".db-filter-panel")) {
      routing(view).closeHeaderPopovers();
    }
    return;
  }
  throw new Error(`unknown dismissal: ${how}`);
}

// ───────────────────────────────────────────────────────────────────
// 6. SCENARIOS
// ───────────────────────────────────────────────────────────────────

/** open → add a sort rule → dismiss. The interaction from report 2 and report 3. */
async function sortRoundTrip(host: HTMLElement, how: string): Promise<Scenario> {
  const harness = makeHarness(host);
  const view = harness.view;

  const before = harness.renders;
  routing(view).toggleHeaderPopover("sort", harness.anchor);
  const open = harness.renders - before;

  const beforeChange = harness.renders;
  const clicked = clickAddRule(harness, "sort");
  if (!clicked) throw new Error(`sort panel add-rule button never rendered; container holds: ${describeDoc(harness)}`);
  const change = harness.renders - beforeChange;

  const beforeDismiss = harness.renders;
  dismiss(harness, "sort", how);
  const dismissCount = harness.renders - beforeDismiss;

  await settle(harness.doc.defaultView as Window);
  const finalState = snapshotState(harness.state);
  const lastRendered = harness.renderedStates[harness.renderedStates.length - 1] ?? "";
  teardown(harness);

  return {
    name: `sort/${how}`,
    panel: "sort",
    dismissal: how,
    changes: 1,
    budget: 1,
    renders: harness.renders,
    legs: { open, change, dismiss: dismissCount },
    lastRenderedState: lastRendered,
    finalState,
    paintsFinalState: lastRendered === finalState,
  };
}

/**
 * open → add a filter rule → dismiss. The filter panel is wired to the same two
 * close paths, so it should move with the sort panel or the fix is partial.
 */
async function filterRoundTrip(host: HTMLElement, how: string): Promise<Scenario> {
  const harness = makeHarness(host);
  const view = harness.view;

  const before = harness.renders;
  routing(view).toggleHeaderPopover("filter", harness.anchor);
  const open = harness.renders - before;

  const beforeChange = harness.renders;
  const clicked = clickAddRule(harness, "filter");
  if (!clicked) throw new Error(`filter panel add-rule button never rendered; container holds: ${describeDoc(harness)}`);
  const change = harness.renders - beforeChange;

  const beforeDismiss = harness.renders;
  dismiss(harness, "filter", how);
  const dismissCount = harness.renders - beforeDismiss;

  await settle(harness.doc.defaultView as Window);
  const finalState = snapshotState(harness.state);
  const lastRendered = harness.renderedStates[harness.renderedStates.length - 1] ?? "";
  teardown(harness);

  return {
    name: `filter/${how}`,
    panel: "filter",
    dismissal: how,
    changes: 1,
    budget: 1,
    renders: harness.renders,
    legs: { open, change, dismiss: dismissCount },
    lastRenderedState: lastRendered,
    finalState,
    paintsFinalState: lastRendered === finalState,
  };
}

/**
 * open → change nothing → dismiss. A panel that was only looked at has nothing
 * to paint, but a dismissal must never be the thing that strands a change, so
 * this is recorded rather than budgeted: it is the fail-safe direction.
 */
async function noChangeRoundTrip(host: HTMLElement): Promise<Scenario> {
  const harness = makeHarness(host);
  const view = harness.view;

  const before = harness.renders;
  routing(view).toggleHeaderPopover("sort", harness.anchor);
  const open = harness.renders - before;

  const beforeDismiss = harness.renders;
  routing(view).toggleHeaderPopover("sort", harness.anchor);
  const dismissCount = harness.renders - beforeDismiss;

  await settle(harness.doc.defaultView as Window);
  const finalState = snapshotState(harness.state);
  const lastRendered = harness.renderedStates[harness.renderedStates.length - 1] ?? finalState;
  teardown(harness);

  return {
    name: "sort/no-change",
    panel: "sort",
    dismissal: "toolbar-button",
    changes: 0,
    // Unbudgeted on purpose. A dismissal that rebuilds a view nobody changed is
    // wasteful; one that skips a rebuild a change needed is a stale view. Only
    // the second is a defect, so the fail-safe direction is left free to stay.
    budget: null,
    renders: harness.renders,
    legs: { open, change: 0, dismiss: dismissCount },
    lastRenderedState: lastRendered,
    finalState,
    paintsFinalState: lastRendered === finalState,
  };
}

/**
 * The case that makes the dismissal load-bearing: the filter panel debounces a
 * typed value by 220ms, and hiding the panel cancels that timer. If the change
 * is not painted somewhere, dismissing inside the debounce window silently
 * discards what the user typed.
 */
async function typedValueRoundTrip(host: HTMLElement, how: string): Promise<Scenario> {
  const harness = makeHarness(host);
  const view = harness.view;

  const before = harness.renders;
  routing(view).toggleHeaderPopover("filter", harness.anchor);
  const open = harness.renders - before;

  const beforeChange = harness.renders;
  if (!clickAddRule(harness, "filter")) {
    throw new Error(`filter panel add-rule button never rendered; container holds: ${describeDoc(harness)}`);
  }
  // First keystroke, then let its debounce land, so a later change cannot ride
  // on a paint that never happened.
  const input = harness.doc.querySelector<HTMLInputElement>(".db-filter-panel input[type='text']");
  if (!input) {
    const panel = harness.doc.querySelector(".db-filter-panel");
    throw new Error(`filter panel value input never rendered; panel: ${panel ? panel.innerHTML.slice(0, 1200) : "absent"}`);
  }
  input.value = "a";
  input.oninput?.(new Event("input") as never);
  const change = harness.renders - beforeChange;

  const beforeDismiss = harness.renders;
  // Second keystroke, dismissed inside the 220ms window it scheduled.
  input.value = "ab";
  input.oninput?.(new Event("input") as never);
  dismiss(harness, "filter", how);
  const dismissCount = harness.renders - beforeDismiss;

  await settle(harness.doc.defaultView as Window);
  const finalState = snapshotState(harness.state);
  const lastRendered = harness.renderedStates[harness.renderedStates.length - 1] ?? "";
  teardown(harness);

  return {
    name: `filter-typed/${how}`,
    panel: "filter",
    dismissal: how,
    // Adding the rule and typing its value are two changes, so two rebuilds is
    // the honest budget. This scenario earns its place on the freshness check
    // rather than the count: it is the one where the dismissal is load-bearing.
    changes: 2,
    budget: 2,
    renders: harness.renders,
    legs: { open, change, dismiss: dismissCount },
    lastRenderedState: lastRendered,
    finalState,
    paintsFinalState: lastRendered === finalState,
  };
}


/**
 * open sort → add a rule → press the filter button, which dismisses sort and
 * opens filter in one click → dismiss.
 *
 * The composite path. Switching panels runs the dismissal decision for one panel
 * and the open for another in the same call, and getting the order wrong there
 * either rebuilds for nothing or skips a rebuild the next panel needed.
 */
async function panelSwitchRoundTrip(host: HTMLElement): Promise<Scenario> {
  const harness = makeHarness(host);
  const view = harness.view;

  const before = harness.renders;
  routing(view).toggleHeaderPopover("sort", harness.anchor);
  const open = harness.renders - before;

  const beforeChange = harness.renders;
  if (!clickAddRule(harness, "sort")) throw new Error("sort panel add-rule button never rendered");
  // Dismisses sort and opens filter in the same click.
  routing(view).toggleHeaderPopover("filter", harness.anchor);
  const change = harness.renders - beforeChange;

  const beforeDismiss = harness.renders;
  routing(view).closeHeaderPopovers();
  const dismissCount = harness.renders - beforeDismiss;

  await settle(harness.doc.defaultView as Window);
  const finalState = snapshotState(harness.state);
  const lastRendered = harness.renderedStates[harness.renderedStates.length - 1] ?? finalState;
  teardown(harness);

  return {
    name: "sort-then-filter/switch",
    panel: "sort",
    dismissal: "panel-switch",
    changes: 1,
    // Two panel sessions, so two rebuilds: one for the sort rule, and one for
    // dismissing a filter panel that was opened and not changed. The second is
    // the fail-safe — opening a panel marks the view as owing a repaint, and
    // only a panel proven to repaint its own mutations may clear that without
    // rendering. Driving it to 1 means trusting every panel to self-paint, which
    // is the audit this deliberately does not assume.
    budget: 2,
    renders: harness.renders,
    legs: { open, change, dismiss: dismissCount },
    lastRenderedState: lastRendered,
    finalState,
    paintsFinalState: lastRendered === finalState,
  };
}

/**
 * open the column manager → dismiss.
 *
 * The exclusion, asserted rather than assumed. The column manager's mutations are
 * not all self-painting, so its dismissal must keep rebuilding unconditionally.
 * A change that quietly widened the sort and filter skip to cover this panel
 * would leave a hidden column still on screen, and this is what would catch it.
 */
async function columnManagerRoundTrip(host: HTMLElement): Promise<Scenario> {
  const harness = makeHarness(host);
  const view = harness.view;

  const before = harness.renders;
  routing(view).toggleHeaderPopover("columns", harness.anchor);
  const open = harness.renders - before;

  const beforeChange = harness.renders;
  // Something already painted while the panel was open — a self-painting
  // mutation, or a background data refresh. Without this the panel still owes a
  // repaint from being opened, and the dismissal rebuilds for that reason alone,
  // which would let this scenario pass no matter what the exclusion did.
  routing(view).refresh();
  // Then a mutation that does not paint itself, which is the case the column
  // manager's dismissal exists to cover.
  harness.state.hiddenColumns.add("amount");
  const change = harness.renders - beforeChange;

  const beforeDismiss = harness.renders;
  routing(view).closeHeaderPopovers();
  const dismissCount = harness.renders - beforeDismiss;

  await settle(harness.doc.defaultView as Window);
  const finalState = snapshotState(harness.state);
  const lastRendered = harness.renderedStates[harness.renderedStates.length - 1] ?? finalState;
  teardown(harness);

  return {
    name: "columns/dismiss",
    panel: "sort",
    dismissal: "outside-click",
    changes: 1,
    // The stand-in paint plus the dismissal rebuild the hidden column needs.
    budget: 2,
    requiresRebuild: true,
    renders: harness.renders,
    legs: { open, change, dismiss: dismissCount },
    lastRenderedState: lastRendered,
    finalState,
    paintsFinalState: lastRendered === finalState,
  };
}

// ───────────────────────────────────────────────────────────────────
// 7. ENTRY POINT
// ───────────────────────────────────────────────────────────────────

export async function runPanelRefresh(host: HTMLElement): Promise<Scenario[]> {
  const dismissals = ["toolbar-button", "outside-click"];
  const scenarios: Scenario[] = [];
  for (const how of dismissals) scenarios.push(await sortRoundTrip(host, how));
  for (const how of dismissals) scenarios.push(await filterRoundTrip(host, how));
  scenarios.push(await noChangeRoundTrip(host));
  for (const how of dismissals) scenarios.push(await typedValueRoundTrip(host, how));
  scenarios.push(await panelSwitchRoundTrip(host));
  scenarios.push(await columnManagerRoundTrip(host));
  return scenarios;
}
