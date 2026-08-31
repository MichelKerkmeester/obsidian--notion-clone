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
import { applySheetChrome, attachSheetDragToDismiss, hasSheetDrag } from "../../src/views/mobile-bottom-sheet";
import { installPopoverAutoClose } from "../../src/views/popover-auto-close";
import { overlayStack } from "../../src/views/overlay-stack";

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

export function runSheetRebuildParity(doc: Document = document): RebuildResult[] {
  return [runGroupSheet(doc), ...runChromeContract(doc), ...runHandleWiring(doc), ...runBindingAblation(doc)];
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
