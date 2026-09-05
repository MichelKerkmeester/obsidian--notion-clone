// ───────────────────────────────────────────────────────────────────
// MODULE:    toolbar-collapse-sweep
// COMPONENT: measures the embedded toolbar's collapse ladder across a width sweep
// ───────────────────────────────────────────────────────────────────
//
// Mounts the real ToolbarRenderer in the codeblock-embedded shape —
// showDatabaseChrome false, hideDatabaseTitle true, the shape that arms
// installMeasuredToolbarCollapse — inside a container whose width this
// steps upward from 250px. At each width it reads whether the toolbar
// still overflows its own container (scrollWidth vs clientWidth) and
// which rung of the collapse ladder is currently engaged, so a caller can
// both assert zero overflow across the sweep and report the widths where
// each rung switches.
//
// Chrome rather than a hand-rolled element: the collapse is driven by a
// real ResizeObserver reading real layout, and a mock box would decide
// the overflow answer by what it chose not to implement.

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

export interface SweepReading {
  width: number;
  overflow: boolean;
  scrollWidth: number;
  clientWidth: number;
  newClusterVisible: boolean;
  queryClusterVisible: boolean;
  propertiesClusterVisible: boolean;
  addTabVisible: boolean;
  tabRowIsDropdown: boolean;
}

// ───────────────────────────────────────────────────────────────────
// 3. HELPERS
// ───────────────────────────────────────────────────────────────────

function isVisible(el: Element | null): boolean {
  if (!el) return false;
  return (el as HTMLElement).style.display !== "none";
}

/**
 * A real timeout ahead of two frames, not two frames alone.
 *
 * ResizeObserver notifications are delivered once per frame and coalesced when several
 * resizes land inside the same one — a sweep stepping the width every couple of frames can
 * outrun that delivery and read a collapse computed for an earlier width, which shows up as
 * the ladder appearing to un-collapse at a wider step than a narrower one already passed.
 * The timeout gives the browser a full frame boundary to actually deliver and apply before
 * the next step moves the target again.
 */
function settle(view: Window): Promise<void> {
  return new Promise((resolve) => {
    view.setTimeout(() => {
      view.requestAnimationFrame(() => view.requestAnimationFrame(() => resolve()));
    }, 30);
  });
}

// ───────────────────────────────────────────────────────────────────
// 4. SWEEP
// ───────────────────────────────────────────────────────────────────

export async function runToolbarCollapseSweep(host: HTMLElement, widths: number[]): Promise<SweepReading[]> {
  const columns = makeTableColumns(8, "mixed");
  // A descriptive view name, not the bench's four-letter placeholder: an embed's tab genuinely
  // carries whatever the author named the view, and a one-word name would let the tab strip fit
  // comfortably at every width in the sweep — never reaching the rung this sweep exists to prove.
  const config = { ...makeTableConfig(columns), viewType: "table", name: "Q4 Planning And Review Board" } as ViewConfig;
  const db = makeSurfaceDatabase(columns, config);
  const state = makeSurfaceState();
  const actions = {
    ...makeToolbarActions(),
    // The codeblock-embed shape: no page-style heading, a compact title row
    // suppressed, chrome present — the combination that arms the measured
    // collapse (database-view.ts / embedded-database-renderer.ts's own
    // persistMode === "codeblock" wiring).
    showDatabaseChrome: false,
    hideDatabaseTitle: true,
    hideHeaderChrome: false,
  };
  const viewEntries: ToolbarViewEntry[] = [{ config: db, sourcePath: "notes" }];

  const outer = host.createDiv({ cls: "note-database-container" });
  const renderer = new ToolbarRenderer();
  renderer.render(outer, viewEntries, 0, 0, state, actions);
  const toolbar = outer.querySelector<HTMLElement>(".db-toolbar");
  if (!toolbar) throw new Error("toolbar-collapse-sweep: .db-toolbar never rendered");

  const view = host.ownerDocument.defaultView;
  if (!view) throw new Error("toolbar-collapse-sweep: no window on the host document");

  const readings: SweepReading[] = [];
  for (const width of widths) {
    outer.style.width = `${width}px`;
    await settle(view);
    readings.push({
      width,
      overflow: toolbar.scrollWidth > toolbar.clientWidth + 1,
      scrollWidth: toolbar.scrollWidth,
      clientWidth: toolbar.clientWidth,
      newClusterVisible: isVisible(toolbar.querySelector(".db-toolbar-creation-cluster")),
      queryClusterVisible: isVisible(toolbar.querySelector(".db-toolbar-query-cluster")),
      propertiesClusterVisible: isVisible(toolbar.querySelector(".db-toolbar-properties-cluster")),
      addTabVisible: isVisible(toolbar.querySelector(".db-view-tab-add")),
      tabRowIsDropdown: Boolean(toolbar.querySelector(".db-view-tab-collapsed-trigger")),
    });
  }
  // outer.remove();
  return readings;
}
