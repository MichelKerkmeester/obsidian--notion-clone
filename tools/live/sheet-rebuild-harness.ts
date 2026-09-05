// ───────────────────────────────────────────────────────────────────
// MODULE:    sheet-rebuild-harness
// COMPONENT: asserts a sheet that rebuilds its contents in place keeps its grab bar
// ───────────────────────────────────────────────────────────────────
//
// The grab bar is chrome the sheet module adds as a CHILD of the panel. Every
// surface that refreshes itself does so by emptying that panel and repopulating
// it — so a refresh destroys a node it did not create and cannot see. The bar
// goes, and with it the only visible affordance for the drag that dismisses the
// sheet. The surface is still open, still covering the screen, and now advertises
// no way out.
//
// It is worst where the refresh is the point of the surface. Changing the group
// field rebuilds the group sheet, so using that sheet for its one purpose was
// enough to strip its bar.
//
// WHY THIS DRIVES THE REAL PRODUCER. Every other check in this repo that touches
// a renderer reads its source as text, and a source grep cannot tell a call that
// runs from a call sitting behind a condition that is never true. This one
// constructs the actual ToolbarRenderer, opens the actual group popover through
// the actual positioner, and calls the actual rebuild — so what it measures is
// what the surface does, not what the file says.
//
// THE EMPTY-SET GUARD. The bar is asserted present BEFORE the rebuild as well as
// after. Without that, a run where the surface never became a sheet at all would
// report "no bar was lost" and pass while proving nothing — the failure mode that
// makes an absence look like a success.
//
// WHAT THIS DOES NOT PROVE: no Obsidian host is constructed, so the surface is
// opened directly rather than through a real toolbar click. A rebuild path that a
// device reaches by some route not modelled here is not covered.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ToolbarRenderer } from "../../src/views/toolbar-renderer";
import { COMPACT_MENU_POPOVER, positionToolbarPopover } from "../../src/views/popover-position";
import { applySheetChrome, attachSheetDragToDismiss, hasSheetDrag, isInsideOpenSheet } from "../../src/views/mobile-bottom-sheet";
import { installPopoverAutoClose } from "../../src/views/popover-auto-close";
import { SortPanelRenderer } from "../../src/views/sort-panel-renderer";
import { FilterPanelRenderer } from "../../src/views/filter-panel-renderer";
import { ViewConfigPanelRenderer } from "../../src/views/view-config-panel-renderer";
import { overlayStack } from "../../src/views/overlay-stack";
import { isHTMLElement } from "../../src/views/dom-guards";

// ───────────────────────────────────────────────────────────────────
// 2. SHAPES
// ───────────────────────────────────────────────────────────────────

const HANDLE = ".db-mobile-bottom-sheet-handle";
const SHEET = "db-mobile-bottom-sheet";

export interface RebuildResult {
  surface: string;
  /** How this surface refreshes itself. */
  rebuildShape: string;
  barBeforeRebuild: boolean;
  barAfterRebuild: boolean;
  pass: boolean;
  detail: string;
}

interface Harness {
  root: HTMLElement;
  anchor: HTMLElement;
}

// ───────────────────────────────────────────────────────────────────
// 3. THE REAL PRODUCER
// ───────────────────────────────────────────────────────────────────

function makeHarness(doc: Document): Harness {
  const root = doc.createElement("div");
  root.className = "note-database-container";
  doc.body.appendChild(root);
  const anchor = doc.createElement("button");
  anchor.className = "db-group-btn";
  root.appendChild(anchor);
  return { root, anchor };
}

/** A schema small enough to read and real enough to render rows from. */
function makeConfig(): unknown {
  return {
    schema: {
      columns: [
        { key: "status", label: "Status", type: "text" },
        { key: "owner", label: "Owner", type: "text" },
      ],
    },
  };
}

/**
 * Open the group popover the way the plugin does, then rebuild it the way the plugin does.
 *
 * The private fields are set directly rather than by clicking a toolbar button, because the
 * button needs a whole view. The rebuild itself is the real method: it reads exactly these
 * fields, and it is the code path a group change runs.
 */
function runGroupSheet(doc: Document): RebuildResult {
  const { root, anchor } = makeHarness(doc);
  const renderer = new ToolbarRenderer();
  const internals = renderer as unknown as Record<string, unknown>;

  const panel = doc.createElement("div");
  panel.className = "db-group-popover";
  root.appendChild(panel);

  const config = makeConfig();
  const actions = { setGroupByField: () => undefined };
  const state = { groupByField: "" };

  internals.groupPopover = panel;
  internals.groupPopoverConfig = config;
  internals.groupPopoverViewType = "list";
  internals.groupPopoverActions = actions;
  internals.groupPopoverState = state;

  (internals.populateGroupPopover as (...args: unknown[]) => void)
    .call(renderer, panel, config, "list", "", actions);
  // The positioner is what turns a panel into a sheet on a phone, and it is what adds the bar.
  positionToolbarPopover(panel, anchor, COMPACT_MENU_POPOVER);

  const becameSheet = panel.classList.contains(SHEET);
  const barBeforeRebuild = Boolean(panel.querySelector(HANDLE));

  (internals.rebuildGroupPopover as () => void).call(renderer);

  const barAfterRebuild = Boolean(panel.querySelector(HANDLE));
  const pass = becameSheet && barBeforeRebuild && barAfterRebuild;

  panel.remove();
  root.remove();

  return {
    surface: "group sheet (real ToolbarRenderer)",
    rebuildShape: "empty-then-repopulate",
    barBeforeRebuild,
    barAfterRebuild,
    pass,
    detail: !becameSheet
      ? "the panel never became a sheet, so this run proves nothing about its bar"
      : !barBeforeRebuild
        ? "the sheet had no grab bar even before the rebuild — the surface, not the rebuild, is broken"
        : barAfterRebuild
          ? "the bar survived the rebuild"
          : "the rebuild destroyed the grab bar — the sheet is open, covering the screen,"
            + " and now shows no way out",
  };
}

// ───────────────────────────────────────────────────────────────────
// 4. THE CONTRACT THE PRODUCER DEPENDS ON
// ───────────────────────────────────────────────────────────────────

/**
 * Emptying a sheet panel really does destroy its bar, and re-asserting really does bring it back.
 *
 * This is the mechanism the case above depends on, checked directly so that a green run there
 * cannot be read as "rebuilds are harmless". If this case ever passes without the re-assert, the
 * producer case is passing for a reason nobody has established.
 */
function runChromeContract(doc: Document): RebuildResult[] {
  // A panel given chrome and nothing else. Under the rule this file exists to pin, it gets NO bar:
  // the gesture draws the bar, so an unwired one has nowhere to come from.
  const bare = doc.createElement("div");
  doc.body.appendChild(bare);
  applySheetChrome(bare, true);
  const barFromChromeAlone = Boolean(bare.querySelector(HANDLE));

  // Attaching the gesture is what produces it.
  const release = attachSheetDragToDismiss(bare, () => undefined);
  const barAfterAttach = Boolean(bare.querySelector(HANDLE));

  // The rebuild path: emptying destroys the bar, and re-asserting chrome restores it — but only
  // because a gesture is still attached to the panel. That guard is the whole difference between
  // restoring a bar and minting an unwired one.
  bare.empty();
  const barAfterEmpty = Boolean(bare.querySelector(HANDLE));
  applySheetChrome(bare, true);
  const barAfterReassert = Boolean(bare.querySelector(HANDLE));

  release();
  applySheetChrome(bare, false);
  bare.remove();

  return [
    {
      surface: "chrome alone draws no bar",
      rebuildShape: "the guarantee",
      barBeforeRebuild: barFromChromeAlone,
      barAfterRebuild: barFromChromeAlone,
      // Inverted deliberately. If chrome drew a bar on its own, an unwired affordance would be
      // representable again and every other case here would be measuring a weaker rule.
      pass: !barFromChromeAlone,
      detail: barFromChromeAlone
        ? "chrome drew a bar with no gesture attached — an unwired affordance is possible again"
        : "no bar without a gesture, so an unwired one cannot be built",
    },
    {
      surface: "attaching the gesture draws it",
      rebuildShape: "gesture-owns-the-bar",
      barBeforeRebuild: barFromChromeAlone,
      barAfterRebuild: barAfterAttach,
      pass: barAfterAttach,
      detail: barAfterAttach ? "the bar appeared with the gesture" : "no bar even with a gesture attached",
    },
    {
      surface: "emptying a sheet panel (the mechanism)",
      rebuildShape: "empty-only",
      barBeforeRebuild: barAfterAttach,
      barAfterRebuild: barAfterEmpty,
      // Also inverted: the bar MUST be gone, or the re-assert below is proving nothing.
      pass: barAfterAttach && !barAfterEmpty,
      detail: barAfterEmpty
        ? "emptying left the bar in place — the whole premise of the re-assert is wrong"
        : "emptying destroyed the bar, as the producer case assumes",
    },
    {
      surface: "re-asserting chrome restores it while the gesture lives",
      rebuildShape: "empty-then-rechrome",
      barBeforeRebuild: barAfterEmpty,
      barAfterRebuild: barAfterReassert,
      pass: barAfterReassert,
      detail: barAfterReassert ? "the bar came back" : "re-asserting did not restore the bar",
    },
  ];
}

/**
 * D4, stated as a measurement: a sheet that draws a grab bar must have a gesture on it.
 *
 * A bar with no drag is worse than no bar. It says the sheet can be pulled down, then ignores the
 * thumb — which reads as a frozen app rather than as a missing feature, and is exactly how the
 * modals presented before this.
 *
 * WHAT THIS DOES NOT DO. It enumerates the paths it knows, so it cannot catch a NEW producer that
 * draws a bar and wires nothing. Making that structurally impossible — having the gesture create
 * the bar, so one cannot exist without the other — was considered and rejected: the group sheet's
 * fix depends on `applySheetChrome` re-creating a bar destroyed by a rebuild, and moving creation
 * into the gesture would break that path. The enumeration is the honest compromise, and this note
 * is here so the limit is not mistaken for a guarantee.
 */
function runHandleWiring(doc: Document): RebuildResult[] {
  const cases: RebuildResult[] = [];

  // The positioner path, which every toolbar sheet reaches.
  const root = doc.createElement("div");
  root.className = "note-database-container";
  doc.body.appendChild(root);
  const anchor = doc.createElement("button");
  root.appendChild(anchor);
  const panel = doc.createElement("div");
  panel.className = "db-group-popover";
  root.appendChild(panel);
  positionToolbarPopover(panel, anchor, COMPACT_MENU_POPOVER);

  const positionedBar = Boolean(panel.querySelector(HANDLE));
  const positionedDrag = hasSheetDrag(panel);
  panel.remove();
  root.remove();

  cases.push({
    surface: "positioner-mounted sheet",
    rebuildShape: "bar implies gesture",
    barBeforeRebuild: positionedBar,
    barAfterRebuild: positionedBar,
    pass: positionedBar && positionedDrag,
    detail: !positionedBar
      ? "no bar was drawn, so this proves nothing about wiring"
      : positionedDrag
        ? "the bar it drew has a gesture attached"
        : "it drew a bar and attached nothing — a control that says drag me and does not",
  });

  return cases;
}

/**
 * Why the gesture binds to the PANEL and not to the bar, shown rather than asserted.
 *
 * The fix for a dead sheet drag had two halves, and a phase recorded that only prose established
 * the second one was necessary: re-assert the chrome after a rebuild, AND bind the gesture to the
 * panel. Restoring the bar alone leaves the drag dead while making the sheet look repaired — the
 * worst of the three states, because it removes the visible symptom and keeps the defect.
 *
 * The necessity is a fact about node identity, so it can be measured without reverting anything.
 * A rebuild empties the panel: the bar node it held is destroyed and a different one takes its
 * place, so any listener bound to the first is orphaned on a node no press can reach. The panel is
 * the same object throughout. That asymmetry IS the argument, and it is checked here in the same
 * run as the working drag.
 */
function runBindingAblation(doc: Document): RebuildResult[] {
  const panel = doc.createElement("div");
  doc.body.appendChild(panel);
  applySheetChrome(panel, true);
  const release = attachSheetDragToDismiss(panel, () => undefined);

  const barBefore = panel.querySelector<HTMLElement>(HANDLE);
  // The rebuild a group change performs.
  panel.empty();
  applySheetChrome(panel, true);
  const barAfter = panel.querySelector<HTMLElement>(HANDLE);

  const barWasReplaced = Boolean(barBefore && barAfter && barBefore !== barAfter);
  const oldBarOrphaned = Boolean(barBefore && !barBefore.isConnected);
  const panelSurvived = panel.isConnected && hasSheetDrag(panel);

  release();
  applySheetChrome(panel, false);
  panel.remove();

  return [
    {
      surface: "a rebuild replaces the bar node, so a bar-bound listener would die",
      rebuildShape: "ablation",
      barBeforeRebuild: Boolean(barBefore),
      barAfterRebuild: Boolean(barAfter),
      pass: barWasReplaced && oldBarOrphaned,
      detail: !barWasReplaced
        ? "the same bar node survived the rebuild, so binding to it would have been safe and this argument is wrong"
        : oldBarOrphaned
          ? "the bar the gesture would have bound to is detached after the rebuild — a listener on it reaches nothing"
          : "the old bar is still connected, so it was not really replaced",
    },
    {
      surface: "the panel is the same object across the rebuild",
      rebuildShape: "ablation",
      barBeforeRebuild: true,
      barAfterRebuild: true,
      pass: panelSurvived,
      detail: panelSurvived
        ? "the panel and its gesture registration both survive, which is why the drag still works"
        : "the panel lost its gesture across the rebuild",
    },
  ];
}

/**
 * A tap that lands inside a panel this rebuild just replaced must not read as an outside tap.
 *
 * The sort and filter panels used to replace their node outright on every add/toggle/remove, and
 * the overlay stack's outside-pointerdown check tested `surface.panel.contains(target)` against
 * whatever node it registered — so the first change to either panel left the stack holding a
 * detached node no live tap could ever be "inside" again, and the very next tap read as outside and
 * closed the sheet mid-edit. Both ends of that have since moved: the stack re-resolves through
 * `getPanel()`, and the panels refill the node they already have.
 *
 * The case still runs, and still on the same subject, because either end alone would let it back.
 * What the staging guard reads had to change with the producer: node identity USED to mean "a
 * rebuild happened", and now means the opposite, so the guard asks whether the panel's CONTENT was
 * rebuilt instead. A guard that still demanded a new node would silently stop staging anything and
 * report a green run as a proof.
 *
 * WHY THIS DRIVES THE REAL REGISTRATION PATH. `installHeaderPopoverAutoClose` in database-view.ts
 * is what wires these panels to the stack, and it does so through `installPopoverAutoClose`
 * against the renderer's own `getPanel()`. This mirrors that exact call shape rather than a
 * bespoke registration, so a fix to the registration contract is exercised the same way the real
 * caller uses it — not just the way this file imagines it.
 */
function runOverlayRegistrationAfterRebuild(doc: Document): RebuildResult[] {
  const rowLabel = (rebuilt: boolean, stillOpen: boolean): RebuildResult["detail"] =>
    !rebuilt
      ? "the add action never rebuilt the panel's contents, so this run proves nothing about registration"
      : stillOpen
        ? "a tap inside the rebuilt panel stayed inside the sheet"
        : "a tap inside the panel the rebuild just created read as OUTSIDE and closed the sheet"
          + " — the stack was still holding the node the rebuild replaced";

  const runSort = (): RebuildResult => {
    const { root, anchor } = makeHarness(doc);
    const renderer = new SortPanelRenderer();
    const config = { viewType: "table", schema: { columns: [{ key: "status", label: "Status", type: "text" }] } } as unknown as Parameters<SortPanelRenderer["render"]>[2];
    const state = { sortRules: [], sortColumn: undefined, sortDirection: "asc" } as unknown as Parameters<SortPanelRenderer["render"]>[3];
    let closed = false;
    const actions = {
      save: () => undefined,
      refresh: () => undefined,
      close: () => { closed = true; },
    };

    renderer.render(root, true, config, state, actions, anchor);
    const openPanel = renderer.getPanel();
    installPopoverAutoClose({
      panel: openPanel as HTMLElement,
      anchorEl: anchor,
      getPanel: () => renderer.getPanel(),
      close: () => { actions.close(); renderer.render(root, false, config, state, actions, anchor); },
    });

    // The tap the operator reports first: it lands inside the panel the stack actually registered,
    // so it works and rebuilds the panel underneath the still-open sheet.
    const addBtn = openPanel?.querySelector<HTMLButtonElement>(".db-panel-button");
    const rowsBefore = openPanel?.querySelectorAll(".db-panel-row").length ?? 0;
    addBtn?.click();
    const rebuiltPanel = renderer.getPanel();
    const rebuilt = Boolean(rebuiltPanel)
      && (rebuiltPanel?.querySelectorAll(".db-panel-row").length ?? 0) > rowsBefore;

    // The tap that follows: anywhere inside the panel the rebuild just created. A real device
    // delivers this as pointerdown before click, and the stack's outside-pointerdown listener runs
    // on that capture-phase pointerdown — so this is the event that decides whether the tap ever
    // reaches the button underneath it.
    const secondTarget = rebuiltPanel?.querySelector<HTMLButtonElement>(".db-panel-button") || rebuiltPanel;
    secondTarget?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));

    const stillOpen = !closed && Boolean(renderer.getPanel()?.isConnected);
    root.remove();
    return {
      surface: "sort sheet (real SortPanelRenderer, add-sort)",
      rebuildShape: "refill-in-place",
      barBeforeRebuild: rebuilt,
      barAfterRebuild: stillOpen,
      pass: rebuilt && stillOpen,
      detail: rowLabel(rebuilt, stillOpen),
    };
  };

  const runFilter = (): RebuildResult => {
    const { root, anchor } = makeHarness(doc);
    const renderer = new FilterPanelRenderer();
    const config = { viewType: "table", schema: { columns: [{ key: "status", label: "Status", type: "text" }] } } as unknown as Parameters<FilterPanelRenderer["render"]>[3];
    const state = {
      filters: [], filterTree: undefined, filterLogic: "and", sortRules: [], sortDirection: "asc",
    } as unknown as Parameters<FilterPanelRenderer["render"]>[2];
    let closed = false;
    const actions = {
      saveState: () => undefined,
      refresh: () => undefined,
      close: () => { closed = true; },
    };

    renderer.render(root, true, state, config, actions, anchor);
    const openPanel = renderer.getPanel();
    installPopoverAutoClose({
      panel: openPanel as HTMLElement,
      anchorEl: anchor,
      getPanel: () => renderer.getPanel(),
      close: () => { actions.close(); renderer.render(root, false, state, config, actions, anchor); },
    });

    const addBtn = Array.from(openPanel?.querySelectorAll<HTMLButtonElement>(".db-panel-button") || [])
      .find((btn) => /condition/i.test(btn.textContent || "")) || openPanel?.querySelector<HTMLButtonElement>(".db-panel-button");
    const rowsBefore = openPanel?.querySelectorAll(".db-panel-row").length ?? 0;
    addBtn?.click();
    const rebuiltPanel = renderer.getPanel();
    const rebuilt = Boolean(rebuiltPanel)
      && (rebuiltPanel?.querySelectorAll(".db-panel-row").length ?? 0) > rowsBefore;

    const secondTarget = rebuiltPanel?.querySelector<HTMLButtonElement>(".db-panel-button") || rebuiltPanel;
    secondTarget?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));

    const stillOpen = !closed && Boolean(renderer.getPanel()?.isConnected);
    root.remove();
    return {
      surface: "filter sheet (real FilterPanelRenderer, add-condition)",
      rebuildShape: "refill-in-place",
      barBeforeRebuild: rebuilt,
      barAfterRebuild: stillOpen,
      pass: rebuilt && stillOpen,
      detail: rowLabel(rebuilt, stillOpen),
    };
  };

  /**
   * The embedded call site registered by a selector scoped to its own container — the shape
   * `embedded-database-renderer.ts:1806-1821` had before this case existed. On a phone the panel
   * is portalled onto `document.body` (mobile-bottom-sheet.ts), which is never a descendant of
   * that container, so the very first lookup finds nothing and dismissal registration never runs
   * at all — worse than the rebuild-only staleness the sibling cases above prove, and root cause
   * for report 36 covering "a lot of sheets" on the embedded surface specifically. Fixed the same
   * way as the two cases above: ask the renderer for its own live panel instead of querying for it.
   */
  const runEmbeddedFilter = (): RebuildResult => {
    const { root, anchor } = makeHarness(doc);
    const renderer = new FilterPanelRenderer();
    const config = { viewType: "table", schema: { columns: [{ key: "status", label: "Status", type: "text" }] } } as unknown as Parameters<FilterPanelRenderer["render"]>[3];
    const state = {
      filters: [], filterTree: undefined, filterLogic: "and", sortRules: [], sortDirection: "asc",
    } as unknown as Parameters<FilterPanelRenderer["render"]>[2];
    let closed = false;
    const actions = {
      saveState: () => undefined,
      refresh: () => undefined,
      close: () => { closed = true; },
    };

    renderer.render(root, true, state, config, actions, anchor);

    // The renderer's own live-panel getter, exactly as the fixed call site now uses it.
    const openPanel = renderer.getPanel();
    if (openPanel) {
      installPopoverAutoClose({
        panel: openPanel,
        getPanel: () => renderer.getPanel(),
        anchorEl: anchor,
        close: () => { actions.close(); renderer.render(root, false, state, config, actions, anchor); },
      });
    }

    const addBtn = Array.from(openPanel?.querySelectorAll<HTMLButtonElement>(".db-panel-button") || [])
      .find((btn) => /condition/i.test(btn.textContent || "")) || openPanel?.querySelector<HTMLButtonElement>(".db-panel-button");
    const rowsBefore = openPanel?.querySelectorAll(".db-panel-row").length ?? 0;
    addBtn?.click();
    const rebuiltPanel = renderer.getPanel();
    const rebuilt = Boolean(rebuiltPanel)
      && (rebuiltPanel?.querySelectorAll(".db-panel-row").length ?? 0) > rowsBefore;

    const secondTarget = rebuiltPanel?.querySelector<HTMLButtonElement>(".db-panel-button") || rebuiltPanel;
    secondTarget?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));

    const stillOpen = !closed && Boolean(renderer.getPanel()?.isConnected);
    root.remove();
    return {
      surface: "embedded filter sheet (real FilterPanelRenderer, portalled on phone)",
      rebuildShape: "refill-in-place",
      barBeforeRebuild: rebuilt,
      barAfterRebuild: stillOpen,
      pass: rebuilt && stillOpen,
      detail: rowLabel(rebuilt, stillOpen),
    };
  };

  return [runSort(), runFilter(), runEmbeddedFilter()];
}


// ───────────────────────────────────────────────────────────────────
// 4b. THE CHROME HAS TO STAY REACHABLE, NOT MERELY EXIST
// ───────────────────────────────────────────────────────────────────

/**
 * A grab bar that is present in the DOM but off the screen is the same defect as a missing one.
 *
 * Every case above asks whether the bar SURVIVES. None of them asks whether a thumb can still
 * reach it, and those are different questions the moment a sheet's content is taller than the
 * sheet. `positionToolbarPopover` makes the panel itself the scroll container, and the bar and the
 * header are ordinary in-flow children of it — so scrolling the content carries the chrome off the
 * top edge. The grab band shrinks one pixel per pixel of scroll and reaches zero, at which point no
 * press anywhere on the screen can start the gesture and the header carrying the title has gone
 * with it.
 *
 * The settings sheet is where this bites, because it is the one toolbar panel whose content always
 * overflows: the database section alone is longer than the 90svh cap on any phone. The menu sheets
 * fit, which is why four rounds of sheet work never saw it.
 *
 * SPLIT IN TWO ON PURPOSE. The sheet rises from below the fold over an animated entrance, so a box
 * measured in the same turn as the render is a box that is still off-screen — the flake this lane's
 * gesture cases already document and gate on. Setup and measurement are separate calls so the
 * driver can wait for the entrance to settle between them, and the measurement is a sweep with
 * `elementFromPoint` down the sheet's centre line rather than a reading of the source.
 */
let settingsReach: {
  root: HTMLElement;
  renderer: ViewConfigPanelRenderer;
  actions: Parameters<ViewConfigPanelRenderer["render"]>[3];
  config: Parameters<ViewConfigPanelRenderer["render"]>[2];
  anchor: HTMLElement;
} | null = null;

/** Build the real settings sheet and leave it on screen for the measurement that follows. */
export function openSettingsSheetForReach(doc: Document): DragSetup {
  for (const stale of Array.from(doc.body.querySelectorAll(".note-database-container, .db-view-config-panel"))) {
    stale.remove();
  }
  const { root, anchor } = makeHarness(doc);
  const renderer = new ViewConfigPanelRenderer();
  const database = {
    id: "db1",
    name: "Testbed",
    description: "Mock database exercising every column type and view on desktop and phone.",
    sourceFolder: "Database Testbed/Records",
    schema: { columns: [{ key: "status", label: "Status", type: "text" }], computedFields: [] },
    views: [{ id: "v1", name: "Table", viewType: "table", schema: { columns: [{ key: "status", label: "Status", type: "text" }], computedFields: [] } }],
  };
  const config = database.views[0] as unknown as Parameters<ViewConfigPanelRenderer["render"]>[2];
  const actions = {
    app: {},
    database,
    onChange: () => undefined,
    onDatabaseChange: () => undefined,
  } as unknown as Parameters<ViewConfigPanelRenderer["render"]>[3];

  renderer.render(root, true, config, actions, anchor);
  const panel = renderer.getPanel();
  if (!panel) {
    root.remove();
    return { ready: false, handleBox: null, detail: "the settings panel never rendered" };
  }
  settingsReach = { root, renderer, actions, config, anchor };
  const handle = panel.querySelector<HTMLElement>(HANDLE);
  if (!handle) return { ready: false, handleBox: null, detail: "the settings sheet has no grab bar at all" };
  const box = handle.getBoundingClientRect();
  return {
    ready: true,
    handleBox: { x: box.x, y: box.y, width: box.width, height: box.height },
    detail: "settings sheet open, waiting for its entrance to settle",
  };
}

/** Sweep the grab band before and after the sheet scrolls its own content, then tear down. */
export function measureSettingsSheetReach(doc: Document): RebuildResult[] {
  const view = doc.defaultView;
  const panel = settingsReach?.renderer.getPanel();
  if (!settingsReach || !panel || !view) {
    return [{
      surface: "settings sheet chrome survives its own scroll",
      rebuildShape: "the sheet scrolls its own content",
      barBeforeRebuild: false,
      barAfterRebuild: false,
      pass: false,
      detail: "the settings sheet was never staged, so this run proves nothing",
    }];
  }

  /** How many pixels down from the sheet's own top edge answer a press with the grab bar. */
  const bandDepth = (): number => {
    const box = panel.getBoundingClientRect();
    const x = box.x + box.width / 2;
    let depth = 0;
    for (let dy = 0; dy <= 96; dy += 1) {
      const hit = doc.elementFromPoint(x, box.y + dy);
      const isBar = hit instanceof view.HTMLElement && hit.classList.contains("db-mobile-bottom-sheet-handle");
      if (isBar) depth = dy + 1;
      else if (depth > 0) break;
    }
    return depth;
  };

  // The region the sheet actually scrolls. The panel is the scroller until the chrome is lifted out
  // of it and a body region takes over, so this is asked rather than assumed — the case then
  // measures the same surface before and after the fix instead of two different ones.
  const body = panel.querySelector<HTMLElement>(".db-view-config-body");
  const scroller = body && body.scrollHeight > body.clientHeight ? body : panel;
  const contentPx = scroller.scrollHeight;
  const sheetPx = scroller.clientHeight;
  const overflows = contentPx > sheetPx;

  const panelTop = panel.getBoundingClientRect().top;
  const bandAtTop = bandDepth();
  const headerAtTop = (panel.querySelector<HTMLElement>(".db-panel-header")?.getBoundingClientRect().top ?? panelTop) - panelTop;

  // Far enough that the bar cannot merely be clipped: the whole chrome is above the fold by here.
  scroller.scrollTop = 200;
  const bandAfterScroll = bandDepth();
  const headerAfterScroll = (panel.querySelector<HTMLElement>(".db-panel-header")?.getBoundingClientRect().top ?? panelTop) - panelTop;

  settingsReach.renderer.render(settingsReach.root, false, settingsReach.config, settingsReach.actions, settingsReach.anchor);
  settingsReach.root.remove();
  settingsReach = null;

  return [{
    surface: "settings sheet chrome survives its own scroll",
    rebuildShape: `${contentPx}px of content in a ${sheetPx}px sheet`,
    barBeforeRebuild: bandAtTop > 0,
    barAfterRebuild: bandAfterScroll > 0,
    pass: overflows && bandAtTop > 0 && bandAfterScroll > 0 && headerAfterScroll <= headerAtTop + 1,
    detail: !overflows
      ? "the settings sheet did not overflow, so the scroll this case is about never happened"
      : bandAtTop === 0
        ? "no grab band even at rest — the surface, not the scroll, is broken"
        : bandAfterScroll === 0
          ? `the grab band went from ${bandAtTop}px to ZERO after a 200px scroll, and the header went`
            + ` from ${Math.round(headerAtTop)}px to ${Math.round(headerAfterScroll)}px relative to the`
            + " sheet's top edge — the sheet is open, covering the screen, and nothing on it can close it"
          : `the band held at ${bandAfterScroll}px through a 200px scroll (${bandAtTop}px at rest)`
            + `, and the header stayed put at ${Math.round(headerAfterScroll)}px from the sheet's top edge`,
  }];
}

export function runSheetRebuildParity(doc: Document = document): RebuildResult[] {
  return [
    runGroupSheet(doc),
    ...runChromeContract(doc),
    ...runHandleWiring(doc),
    ...runBindingAblation(doc),
    ...runOverlayRegistrationAfterRebuild(doc),
  ];
}

// ───────────────────────────────────────────────────────────────────
// 5. THE GESTURE ITSELF
// ───────────────────────────────────────────────────────────────────

export interface DragSetup {
  ready: boolean;
  handleBox: { x: number; y: number; width: number; height: number } | null;
  detail: string;
}

/**
 * Open the group sheet, rebuild it, and leave it on screen for a real drag.
 *
 * A present grab bar is not the claim that matters — the claim is that the sheet can still be
 * dismissed by dragging it, which is what the operator does and what a restored-but-inert bar
 * would fail. So this registers with the overlay stack exactly as the real open does, because
 * dismissal is the stack's to perform, and then hands the bar's box to the caller to drive with a
 * real pointer. Synthetic PointerEvents cannot do it: the gesture calls `setPointerCapture`, which
 * rejects a pointer id no real input device owns.
 */
export function openGroupSheetForDrag(doc: Document): DragSetup {
  const view = doc.defaultView as (Window & { __sheetClosed?: boolean }) | null;

  // Take the previous run's surface out of the overlay stack before building a new one.
  //
  // Registering a surface closes the one beneath it, and that close is the previous run's callback
  // — which sets the "was it dismissed" flag. Resetting the flag at the TOP of this function and
  // then registering was enough to make every gesture after the first report a dismissal it never
  // performed: a zero-distance tap "passed". The flick looked correct and the slow-drag control
  // looked broken, and both readings were the harness reporting its own leftovers.
  while (overlayStack.size() > 0) {
    const top = overlayStack.getTopSurface()?.panel;
    if (!top || !overlayStack.dismissPanel(top, "programmatic")) break;
  }
  // Sheets are fixed-position and stack, so a leftover panel would also take the press meant for
  // this one and the run would measure the wrong surface.
  for (const stale of Array.from(doc.body.querySelectorAll(".note-database-container, .db-group-popover"))) {
    stale.remove();
  }

  const { root, anchor } = makeHarness(doc);
  const renderer = new ToolbarRenderer();
  const internals = renderer as unknown as Record<string, unknown>;

  const panel = doc.createElement("div");
  panel.className = "db-group-popover";
  root.appendChild(panel);

  const config = makeConfig();
  const actions = { setGroupByField: () => undefined };
  const state = { groupByField: "" };

  internals.groupPopover = panel;
  internals.groupPopoverConfig = config;
  internals.groupPopoverViewType = "list";
  internals.groupPopoverActions = actions;
  internals.groupPopoverState = state;

  (internals.populateGroupPopover as (...args: unknown[]) => void)
    .call(renderer, panel, config, "list", "", actions);
  positionToolbarPopover(panel, anchor, COMPACT_MENU_POPOVER);
  installPopoverAutoClose({
    panel,
    anchorEl: anchor,
    close: () => {
      if (view) view.__sheetClosed = true;
      (view as unknown as { __closeTrace?: string }).__closeTrace = new Error("close").stack || "no stack";
      panel.remove();
    },
  });

  // The rebuild is the whole point: the drag has to work on the sheet AFTER it refreshed itself.
  (internals.rebuildGroupPopover as () => void).call(renderer);

  const handle = panel.querySelector<HTMLElement>(HANDLE);
  if (!handle) return { ready: false, handleBox: null, detail: "no grab bar after the rebuild" };

  const box = handle.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) {
    return { ready: false, handleBox: null, detail: "the grab bar has no hit area" };
  }
  // Last, deliberately: everything above can fire a close of its own, and the flag must describe
  // only what the gesture that follows does.
  if (view) view.__sheetClosed = false;
  return {
    ready: true,
    handleBox: { x: box.x, y: box.y, width: box.width, height: box.height },
    detail: "sheet open and rebuilt, bar ready to drag",
  };
}

// ───────────────────────────────────────────────────────────────────
// 6. AN EDIT INSIDE AN OPEN SHEET
// ───────────────────────────────────────────────────────────────────

/**
 * The sort and filter sheets, wired the way the view wires them, so a real tap can be aimed at
 * "+ Add" twice.
 *
 * The cases in section 4 above register the same way this does and prove the stack follows a
 * rebuilt node. They cannot see what this one is for, because they dispatch `click()` on a node
 * they looked up AFTER the rebuild — a real thumb aims at a screen COORDINATE before the rebuild
 * and lands on whatever is there afterwards. Those are different questions, and only the second
 * one notices a surface that moves between the two taps.
 *
 * Two things the real view does are modelled here because both bear on where the sheet is when the
 * second tap lands: `refresh()` rebuilds the toolbar, so the anchor the panel opened against is
 * destroyed and re-resolved, and it re-renders the open panel, so one tap on "+ Add" replaces the
 * panel node twice rather than once.
 */
interface AddRowScenario {
  root: HTMLElement;
  kind: "sort" | "filter";
  rules(): number;
  panel(): HTMLElement | null;
  /** Rebuild the toolbar and nothing else, the way a background view refresh does. */
  rebuildToolbar(): void;
  /** Take the surface down, the way the view's own outside-press dismissal does. */
  dismiss(): void;
  open: boolean;
}

let activeAddRow: AddRowScenario | null = null;
let topTrack: number[] = [];

export interface AddRowSetup {
  ready: boolean;
  detail: string;
}

export function openHeaderSheetForAddRow(doc: Document, kind: "sort" | "filter"): AddRowSetup {
  // Same reason as the drag setup above: a leftover surface takes the press meant for this one.
  while (overlayStack.size() > 0) {
    const top = overlayStack.getTopSurface()?.panel;
    if (!top || !overlayStack.dismissPanel(top, "programmatic")) break;
  }
  for (const stale of Array.from(doc.body.querySelectorAll(".note-database-container, .db-sort-panel, .db-filter-panel"))) {
    stale.remove();
  }
  activeAddRow?.root.remove();
  activeAddRow = null;
  topTrack = [];

  const root = doc.createElement("div");
  root.className = "note-database-container";
  doc.body.appendChild(root);
  const header = root.createDiv({ cls: "db-header" });
  const toolbar = header.createDiv({ cls: "db-toolbar" });
  const buildToolbar = (): void => {
    toolbar.empty();
    toolbar.createEl("button", { cls: "db-sort-btn", text: "sort" });
    toolbar.createEl("button", { cls: "db-filter-btn", text: "filter" });
  };
  buildToolbar();
  root.createDiv({ cls: "db-table-wrapper", text: "rows" });

  const sortRenderer = new SortPanelRenderer();
  const filterRenderer = new FilterPanelRenderer();
  const config = {
    viewType: "table",
    schema: { columns: [{ key: "status", label: "Status", type: "text" }, { key: "owner", label: "Owner", type: "text" }] },
  } as unknown as Parameters<SortPanelRenderer["render"]>[2];
  const state = {
    sortRules: [] as unknown[], sortColumn: undefined, sortDirection: "asc",
    filters: [] as unknown[], filterTree: undefined, filterLogic: "and",
  } as unknown as Parameters<SortPanelRenderer["render"]>[3];

  const scenario: AddRowScenario = {
    root,
    kind,
    open: true,
    rebuildToolbar: () => buildToolbar(),
    dismiss: () => { scenario.open = false; renderPanel(); },
    rules: () => {
      const held = state as unknown as { sortRules: unknown[]; filters: unknown[] };
      return kind === "sort" ? held.sortRules.length : held.filters.length;
    },
    panel: () => (kind === "sort" ? sortRenderer.getPanel() : filterRenderer.getPanel()),
  };

  const anchor = (): HTMLElement | undefined =>
    (root.querySelector(kind === "sort" ? ".db-sort-btn" : ".db-filter-btn") as HTMLElement) || undefined;

  const renderPanel = (): void => {
    if (kind === "sort") {
      sortRenderer.render(root, scenario.open, config, state, {
        save: () => undefined,
        refresh: () => refresh(),
        close: () => { scenario.open = false; renderPanel(); },
      }, anchor());
      return;
    }
    filterRenderer.render(
      root,
      scenario.open,
      state as unknown as Parameters<FilterPanelRenderer["render"]>[2],
      config as unknown as Parameters<FilterPanelRenderer["render"]>[3],
      {
        saveState: () => undefined,
        refresh: () => refresh(),
        close: () => { scenario.open = false; renderPanel(); },
      },
      anchor(),
    );
  };

  const refresh = (): void => {
    buildToolbar();
    if (scenario.open) renderPanel();
  };

  renderPanel();
  const panel = scenario.panel();
  if (!panel) return { ready: false, detail: `the ${kind} panel never rendered` };
  installPopoverAutoClose({
    panel,
    getPanel: () => scenario.panel(),
    anchorEl: anchor(),
    close: () => { scenario.open = false; renderPanel(); },
  });

  panel.setAttribute("data-probe-panel", PANEL_IDENTITY);
  activeAddRow = scenario;
  return { ready: true, detail: `${kind} sheet open` };
}

// ───────────────────────────────────────────────────────────────────
// 6b. THE VIEW'S OWN OUTSIDE-PRESS DISMISSAL
// ───────────────────────────────────────────────────────────────────

/**
 * The surfaces a press may land in without counting as a press outside the view.
 *
 * Mirrored from `handleOutsideClick` in database-view.ts and embedded-database-renderer.ts, which
 * is the whole point: the list is not what was wrong, so copying it keeps this focused on the part
 * that was.
 */
const HEADER_SURFACE_SELECTOR = ".db-filter-panel, .db-sort-panel, .db-column-manager,"
  + " .db-view-config-panel, .db-dropdown-popover, .db-date-value-popover, .db-toolbar, .db-header";

let removeViewDismissal: (() => void) | null = null;

/**
 * Install the SECOND dismissal path the real view carries, which no case above models.
 *
 * The overlay stack is not the only thing that can close these panels. Both views also hold a
 * document-level capture listener on `mousedown` that decides for itself whether a press was
 * outside — and every case in this file registers only the stack, so the whole of that second path
 * has been invisible to phone emulation. It is invisible in the other direction too: it is a
 * `mousedown`, and every check here that drives an event drives a click or a pointerdown.
 *
 * The two shapes are the before and after of the same decision, and both must run. `containerOnly`
 * is what the views asked before a surface could leave the container: does my container hold the
 * pressed node. A sheet is portalled onto the body precisely so it can cover the host's navigation
 * bar, so the answer for a thumb on the sheet's own button is no — and the surface is torn down on
 * the `mousedown` a tap produces, which is before the `click` it produces can reach the control.
 * Keeping that shape as a control is what stops this case going quietly vacuous: if a future change
 * makes the tap survive it too, the case is no longer measuring anything and says so.
 *
 * The sheet-aware shape asks the sheet module instead, through the real exported predicate rather
 * than a local reimplementation of it, so the decision under test is the shipped one.
 */
export function installViewOutsideDismissal(doc: Document, containerOnly: boolean): boolean {
  removeViewDismissal?.();
  removeViewDismissal = null;
  const scenario = activeAddRow;
  if (!scenario) return false;
  const handler = (event: Event): void => {
    const target = event.target;
    if (!isHTMLElement(target)) return;
    if (scenario.root.contains(target) || (!containerOnly && isInsideOpenSheet(target))) {
      if (target.closest(HEADER_SURFACE_SELECTOR)) return;
    }
    scenario.dismiss();
  };
  doc.addEventListener("mousedown", handler, true);
  removeViewDismissal = () => doc.removeEventListener("mousedown", handler, true);
  return true;
}

export function removeViewOutsideDismissal(): void {
  removeViewDismissal?.();
  removeViewDismissal = null;
}

/**
 * What wins the hit test at the add control's centre, named structurally.
 *
 * The backdrop is a body sibling of the sheet and one z-index tier below it, so a press at this
 * point should reach the button. Asserting it directly retires the theory that WebKit stacks the
 * two the other way round and hands the press to the backdrop — a theory that is otherwise
 * indistinguishable from the real cause, because both end with the sheet closing on a tap aimed at
 * a control inside it.
 */
export function hitTestAt(doc: Document, x: number, y: number): string {
  const el = doc.elementFromPoint(x, y);
  if (!el) return "nothing";
  if (el.classList.contains("db-mobile-sheet-scrim")) return "backdrop";
  if (!el.closest(".db-mobile-bottom-sheet")) return `outside-sheet:${el.tagName.toLowerCase()}`;
  return el.classList.contains("db-panel-button") ? "add-control" : `in-sheet:${el.tagName.toLowerCase()}`;
}

/**
 * What a press on the sheet's own control answers for the cell-selection question, in both shapes.
 *
 * `shouldClearCellSelectionFromPointer` in both views forks on the same containment test the
 * dismissal above did, and it fails the same way: a sheet is portalled off the container, so a
 * press on its own control takes the OUTSIDE branch — which clears the selection unless the target
 * is a modal or a menu, and a sheet is neither. Desktop keeps the selection, because its panel
 * never moves and the inside branch names every control that must not clear it. So the phone
 * silently drops a selection the user never left.
 *
 * Both shapes are evaluated from ONE press rather than from two runs. The control cannot drift
 * from the case it is controlling for when they are answering about the same node.
 */
export interface SelectionPressResult {
  pressed: string | null;
  /** What the shape without the predicate answers: true means the selection is cleared. */
  containerOnly: boolean | null;
  /** What the shipped shape answers. */
  sheetAware: boolean | null;
}

const INSIDE_CONTAINER_KEEPS = "td[data-note-database-row-path][data-note-database-column-key],"
  + " .db-selection-status-bar, .db-cell-editing, input, textarea, select, button, a,"
  + " .db-filter-panel, .db-sort-panel, .db-column-manager, .db-view-config-panel,"
  + " .db-dropdown-popover, .db-date-value-popover, .db-group-order-popover, .menu";

let selectionPress: SelectionPressResult = { pressed: null, containerOnly: null, sheetAware: null };
let removeSelectionProbe: (() => void) | null = null;

export function armSelectionPressProbe(doc: Document): boolean {
  removeSelectionProbe?.();
  removeSelectionProbe = null;
  const scenario = activeAddRow;
  if (!scenario) return false;
  selectionPress = { pressed: null, containerOnly: null, sheetAware: null };
  const decide = (target: HTMLElement, sheetAware: boolean): boolean => {
    if (!scenario.root.contains(target) && !(sheetAware && isInsideOpenSheet(target))) {
      return !target.closest(".modal, .menu");
    }
    return !target.closest(INSIDE_CONTAINER_KEEPS);
  };
  const handler = (event: Event): void => {
    const target = event.target;
    if (!isHTMLElement(target)) return;
    selectionPress = {
      pressed: `${target.tagName.toLowerCase()}.${target.className}`,
      containerOnly: decide(target, false),
      sheetAware: decide(target, true),
    };
  };
  doc.addEventListener("mousedown", handler, true);
  removeSelectionProbe = () => doc.removeEventListener("mousedown", handler, true);
  return true;
}

export function readSelectionPressProbe(): SelectionPressResult {
  removeSelectionProbe?.();
  removeSelectionProbe = null;
  return selectionPress;
}

/**
 * Can a wheel raised inside a sheet reach the handler the view binds to its container's PARENT?
 *
 * It cannot, and pinning that is worth more than a guard would be. `forwardOuterWheelScroll` uses
 * the same bare containment test as the two call sites above, which reads like the same defect —
 * but the listener is bound to `containerEl_.parentElement`, and a sheet portalled onto the body is
 * not a descendant of it, so no event from a sheet ever propagates through. Routing it through the
 * predicate would be a guard on an impossible path, and the row proving that would never be able to
 * go red.
 *
 * This measures the binding instead. If anyone ever moves that listener to the document — where the
 * dismissal listeners already are — the sheet becomes reachable, the test becomes wrong the way the
 * others were, and this goes red and says so. That is the guard, and it costs no shipped code.
 *
 * The nesting is the whole measurement. The harness mounts its root directly on the body, where a
 * sheet IS a descendant of the root's parent and a wheel does reach; the view mounts its content
 * inside the workspace leaf. Measuring the harness's own ancestry rather than the view's would
 * report the opposite answer with equal confidence.
 */
export function measureWheelReachFromSheet(doc: Document): { nested: boolean; reached: boolean } {
  const scenario = activeAddRow;
  const sheet = doc.body.querySelector<HTMLElement>(".db-mobile-bottom-sheet");
  const button = sheet?.querySelector<HTMLElement>(".db-panel-button");
  if (!scenario || !sheet || !button) return { nested: false, reached: false };

  const leaf = doc.createElement("div");
  leaf.className = "workspace-leaf";
  doc.body.appendChild(leaf);
  leaf.appendChild(scenario.root);

  const parent = scenario.root.parentElement;
  const nested = parent === leaf && !leaf.contains(sheet);
  let reached = false;
  const onWheel = (): void => { reached = true; };
  parent?.addEventListener("wheel", onWheel);
  button.dispatchEvent(new WheelEvent("wheel", { bubbles: true, deltaY: 40 }));
  parent?.removeEventListener("wheel", onWheel);

  doc.body.appendChild(scenario.root);
  leaf.remove();
  return { nested, reached };
}

export interface AddRowProbe {
  /** Centre of the "+ Add" control, in viewport coordinates. */
  addButton: { x: number; y: number } | null;
  rules: number;
  open: boolean;
  sheets: number;
  scrims: number;
  panelTop: number | null;
  /** Whether the panel is still presenting as a sheet, and whether it can still be seen. */
  isSheet: boolean;
  visibility: string | null;
  onBody: boolean;
  /**
   * The mark put on the panel node when the sheet opened, read back from whatever node the owner
   * now calls its panel.
   *
   * Null means the owner replaced the node rather than refilling it. That is not cosmetic on a
   * touch device: the compatibility click a tap produces is delivered to the element the touch
   * started on, and when that element has left the document the engine retargets it — with the
   * panel gone there is no ancestor left inside the surface to retarget to, so a press that began
   * inside the sheet arrives somewhere outside it.
   */
  panelIdentity: string | null;
}

/** The mark, so a replaced node is distinguishable from a refilled one. */
const PANEL_IDENTITY = "sheet-open-1";

/**
 * Rebuild the toolbar behind an open surface, changing nothing else.
 *
 * The view does this on roughly two dozen paths, most of them background refreshes with no
 * interaction behind them, and only some of them re-render the open panel afterwards. The button
 * the panel opened against is destroyed and an identical one takes its place, so the panel's owner
 * is left holding a node that is no longer in the document — while the surface on screen has not
 * changed at all and the operator has no way to know anything happened.
 *
 * Nothing here reaches into the panel. That is the point: this is the event the sheet is supposed
 * to be indifferent to.
 */
export function rebuildToolbarBehindSheet(doc: Document): boolean {
  if (!activeAddRow) return false;
  activeAddRow.rebuildToolbar();
  // The rebuild alone is inert; a placement has to run before anything reads the anchor again. On a
  // phone that is not a rare event to wait for — a scroll, a rotation, or the keyboard is enough.
  doc.defaultView?.dispatchEvent(new Event("resize"));
  return true;
}

export function readAddRowProbe(doc: Document): AddRowProbe {
  const panel = activeAddRow?.panel() ?? null;
  const add = panel
    ? Array.from(panel.querySelectorAll<HTMLButtonElement>(".db-panel-button")).find((btn) => (btn.textContent || "").startsWith("+"))
    : undefined;
  const box = add?.getBoundingClientRect();
  return {
    addButton: box && box.width > 0 ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : null,
    rules: activeAddRow?.rules() ?? -1,
    open: Boolean(activeAddRow?.open && panel?.isConnected),
    sheets: doc.body.querySelectorAll(".db-mobile-bottom-sheet").length,
    scrims: doc.body.querySelectorAll(".db-mobile-sheet-scrim").length,
    panelTop: panel ? panel.getBoundingClientRect().top : null,
    panelIdentity: panel?.getAttribute("data-probe-panel") ?? null,
    isSheet: Boolean(panel?.classList.contains("db-mobile-bottom-sheet")),
    visibility: panel && doc.defaultView
      ? doc.defaultView.getComputedStyle(panel).visibility
      : null,
    onBody: panel?.parentElement === doc.body,
  };
}

/**
 * Sample the sheet's top edge every frame, so a surface that moves cannot do it unobserved.
 *
 * The first sample is taken SYNCHRONOUSLY rather than on the first frame. An entrance commits its
 * start state during the call that begins it, and the surface leaves that state on the very next
 * frame — so a tracker that waits for one has already missed the deepest point it exists to see.
 * Measured: 830 on a first-frame tracker against 844 taken synchronously, on the same 844px screen.
 */
export function trackSheetTop(doc: Document, durationMs: number): void {
  const view = doc.defaultView;
  if (!view) return;
  topTrack = [];
  const sample = (): void => {
    const panel = activeAddRow?.panel();
    if (panel) topTrack.push(panel.getBoundingClientRect().top);
  };
  sample();
  const started = view.performance.now();
  const step = (): void => {
    sample();
    if (view.performance.now() - started < durationMs) view.requestAnimationFrame(step);
  };
  view.requestAnimationFrame(step);
}

/**
 * Open a sheet and begin tracking it in the same turn.
 *
 * Two round trips from the driver leave frames between the open and the first sample, which is
 * exactly the window the entrance lives in. The control case that asserts an opening sheet still
 * rises cannot be staged any other way.
 */
export function openHeaderSheetTracked(doc: Document, kind: "sort" | "filter", durationMs: number): AddRowSetup {
  const setup = openHeaderSheetForAddRow(doc, kind);
  if (setup.ready) trackSheetTop(doc, durationMs);
  return setup;
}

export function readSheetTrack(): number[] {
  return topTrack.slice();
}
