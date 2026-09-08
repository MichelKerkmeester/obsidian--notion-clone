// ───────────────────────────────────────────────────────────────────
// MODULE:    phone-toolbar-scroll
// COMPONENT: measures the full phone toolbar's labelled-button row at a fixed viewport
// ───────────────────────────────────────────────────────────────────
//
// Mounts the real ToolbarRenderer in the full-view phone shape — showDatabaseChrome
// true, is-phone on the body — with every optional control enabled (table view type,
// so filter/sort/group/columns/settings/more all render), then reads whether the row:
// stays a single line, carries a visible text label beside every control's icon, meets
// the 44px control-height floor, and — when the labelled row no longer fits — scrolls
// horizontally with the last control still reachable rather than wrapping or clipping.
//
// Chrome rather than a hand-rolled fixture, the same reasoning toolbar-collapse-sweep.ts
// gives: the scroll and wrap answers come from a real ResizeObserver-free layout pass
// over the real component, not a mock box that decided the answer by omission.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { ToolbarRenderer, type ToolbarViewEntry } from "../../src/views/toolbar-renderer";
import { makeToolbarActions, makeSurfaceDatabase, makeSurfaceState } from "./render-assertion-harness";
import { makeColumns as makeTableColumns, makeConfig as makeTableConfig } from "../bench/table-render-bench";
import type { ViewConfig } from "../../src/data/types";

// ───────────────────────────────────────────────────────────────────
// 2. TYPES
// ───────────────────────────────────────────────────────────────────

export interface PhoneToolbarScrollReading {
  /** `.obnotion-toolbar-right`'s own box height. */
  rowHeight: number;
  /** Every measured control shares one `offsetTop` — nothing wrapped to a second line. */
  singleLine: boolean;
  scrollWidth: number;
  clientWidth: number;
  overflowsHorizontally: boolean;
  /** After scrolling the row to its end, the last control's box sits inside the visible track. */
  lastControlReachable: boolean;
  everyControlLabelled: boolean;
  /** Class list of any control whose label read empty or zero-width. */
  missingLabels: string[];
  everyControlAtLeast44: boolean;
  /** `{ className, height }` for any control under the 44px floor. */
  shortControls: { className: string; height: number }[];
  /** `getComputedStyle(...).scrollbarWidth === "none"` — the edge-only scrollbar ruling. */
  scrollbarWidthNone: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

const CONTROL_SELECTOR = [
  ".obnotion-filter-btn",
  ".obnotion-sort-btn",
  ".obnotion-group-btn",
  ".obnotion-col-manager-btn",
  ".obnotion-toolbar-settings-btn",
  ".obnotion-toolbar-more-btn",
].join(",");

/** A real timeout ahead of two frames — see toolbar-collapse-sweep.ts's `settle` for why a bare
 *  rAF pair can read a layout computed before the DOM settles. */
function settle(view: Window): Promise<void> {
  return new Promise((resolve) => {
    view.setTimeout(() => {
      view.requestAnimationFrame(() => view.requestAnimationFrame(() => resolve()));
    }, 30);
  });
}

// ───────────────────────────────────────────────────────────────────
// 4. MEASURE
// ───────────────────────────────────────────────────────────────────

export async function measurePhoneToolbarScroll(host: HTMLElement): Promise<PhoneToolbarScrollReading> {
  const doc = host.ownerDocument;
  doc.body.classList.add("is-phone");

  const columns = makeTableColumns(8, "mixed");
  // A descriptive view name so the tab strip takes real room, the same reasoning
  // toolbar-collapse-sweep.ts gives for its own fixture name.
  const config = { ...makeTableConfig(columns), viewType: "table", name: "Q4 Planning And Review Board" } as ViewConfig;
  const db = makeSurfaceDatabase(columns, config);
  const state = makeSurfaceState();
  const actions = {
    ...makeToolbarActions(),
    // The full phone view's own shape (database-view.ts): chrome shown, title not hidden,
    // header chrome present — distinct from the embedded/codeblock shape toolbar-collapse-sweep
    // measures, which never arms this file's phone-labelled-row CSS at all.
    showDatabaseChrome: true,
    hideDatabaseTitle: false,
    hideHeaderChrome: false,
  };
  const viewEntries: ToolbarViewEntry[] = [{ config: db, sourcePath: "notes" }];

  const outer = host.createDiv({ cls: "obnotion-container" });
  // A bare `<body><script>` harness carries none of the real Obsidian view pane's own width
  // constraint — a leaf's content is wrapped in panes with a definite width, but this harness's
  // body is a plain block element whose shrink-to-fit ancestors (the flex chain the toolbar
  // renders into) grow to their content's intrinsic width and scroll the whole page instead of
  // this row alone. run-toolbar-collapse-sweep.mjs's own sweep hits the same gap and sets the
  // container's width explicitly for the same reason; this pins it to the page viewport width
  // the runner opens, so `.obnotion-toolbar-right`'s own overflow — not the page's — is what
  // this measures.
  outer.style.width = `${doc.defaultView?.innerWidth || 402}px`;
  const renderer = new ToolbarRenderer();
  renderer.render(outer, viewEntries, 0, 0, state, actions);
  const right = outer.querySelector<HTMLElement>(".obnotion-toolbar-right");
  if (!right) throw new Error("phone-toolbar-scroll: .obnotion-toolbar-right never rendered");

  const view = doc.defaultView;
  if (!view) throw new Error("phone-toolbar-scroll: no window on the host document");
  await settle(view);

  const controls = Array.from(right.querySelectorAll<HTMLElement>(CONTROL_SELECTOR));
  if (controls.length < 6) {
    throw new Error(`phone-toolbar-scroll: expected 6 controls (filter/sort/group/columns/settings/more), found ${controls.length}`);
  }

  const missingLabels: string[] = [];
  const shortControls: { className: string; height: number }[] = [];
  for (const control of controls) {
    const label = control.querySelector<HTMLElement>(".obnotion-toolbar-control-label");
    const labelVisible = Boolean(label)
      && (label as HTMLElement).getBoundingClientRect().width > 0
      && ((label as HTMLElement).textContent ?? "").trim().length > 0;
    if (!labelVisible) missingLabels.push(control.className);
    const rect = control.getBoundingClientRect();
    if (rect.height < 44) shortControls.push({ className: control.className, height: Math.round(rect.height) });
  }

  const tops = controls.map((control) => Math.round(control.getBoundingClientRect().top));
  const singleLine = new Set(tops).size <= 1;
  const rowHeight = Math.round(right.getBoundingClientRect().height);
  const scrollbarWidth = view.getComputedStyle(right).scrollbarWidth;

  const originalScrollLeft = right.scrollLeft;
  right.scrollLeft = right.scrollWidth;
  await new Promise<void>((resolve) => view.requestAnimationFrame(() => resolve()));
  const lastControl = controls[controls.length - 1];
  const lastRect = lastControl.getBoundingClientRect();
  const containerRect = right.getBoundingClientRect();
  const lastControlReachable = lastRect.right <= containerRect.right + 1 && lastRect.left >= containerRect.left - 1;
  right.scrollLeft = originalScrollLeft;

  return {
    rowHeight,
    singleLine,
    scrollWidth: right.scrollWidth,
    clientWidth: right.clientWidth,
    overflowsHorizontally: right.scrollWidth > right.clientWidth + 1,
    lastControlReachable,
    everyControlLabelled: missingLabels.length === 0,
    missingLabels,
    everyControlAtLeast44: shortControls.length === 0,
    shortControls,
    scrollbarWidthNone: scrollbarWidth === "none",
  };
}
