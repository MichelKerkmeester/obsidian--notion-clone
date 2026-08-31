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
import { applySheetChrome } from "../../src/views/mobile-bottom-sheet";
import { installPopoverAutoClose } from "../../src/views/popover-auto-close";

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
  const bare = doc.createElement("div");
  doc.body.appendChild(bare);
  applySheetChrome(bare, true);
  const barBefore = Boolean(bare.querySelector(HANDLE));
  bare.empty();
  const barAfterBareEmpty = Boolean(bare.querySelector(HANDLE));

  applySheetChrome(bare, true);
  const barAfterReassert = Boolean(bare.querySelector(HANDLE));
  applySheetChrome(bare, false);
  bare.remove();

  return [
    {
      surface: "emptying a sheet panel (the mechanism)",
      rebuildShape: "empty-only",
      barBeforeRebuild: barBefore,
      barAfterRebuild: barAfterBareEmpty,
      // Inverted on purpose: the bar MUST be gone here, or the producer case above is
      // green for a reason that has nothing to do with the re-assert it is meant to check.
      pass: barBefore && !barAfterBareEmpty,
      detail: !barBefore
        ? "no bar was created, so nothing was measured"
        : barAfterBareEmpty
          ? "emptying left the bar in place — the whole premise of the re-assert is wrong"
          : "emptying destroyed the bar, as the producer case assumes",
    },
    {
      surface: "re-asserting chrome after emptying",
      rebuildShape: "empty-then-rechrome",
      barBeforeRebuild: barBefore,
      barAfterRebuild: barAfterReassert,
      pass: barAfterReassert,
      detail: barAfterReassert ? "the bar came back" : "re-asserting did not restore the bar",
    },
  ];
}

export function runSheetRebuildParity(doc: Document = document): RebuildResult[] {
  return [runGroupSheet(doc), ...runChromeContract(doc)];
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
  if (view) view.__sheetClosed = false;

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
  return {
    ready: true,
    handleBox: { x: box.x, y: box.y, width: box.width, height: box.height },
    detail: "sheet open and rebuilt, bar ready to drag",
  };
}
