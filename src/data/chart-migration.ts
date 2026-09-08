// ───────────────────────────────────────────────────────────────────
// MODULE:    chart-migration
// COMPONENT: what an existing chart view becomes when it is opened
// ───────────────────────────────────────────────────────────────────
//
// `chart` is withdrawn from every picker, so nothing new can be made one. That leaves the views
// already written into people's vault files, and "withdrawn" does nothing for them: the type
// string sits on disk, and deleting the renderer later would coerce those views to whatever the
// unknown-type fallback does — which is `table`, the same target this migration chooses on
// purpose rather than by accident.
//
// THE TARGET IS `table` because a chart is an aggregation OVER records — no surviving type
// aggregates, so the lossless residual is the records themselves. Every chart-only setting
// (aggregation, bucketing, palette, reference lines) has no table equivalent and is a declared
// loss, not a silent one: the caller's notice says so. The migration is a type-string rewrite,
// not a mapping, because there is nothing left to carry.
//
// PURE ON PURPOSE. It takes a view and returns what to write, so the decision can be checked
// without an Obsidian `App`, a vault or a rendered surface.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { ViewConfig } from "./types";

// ───────────────────────────────────────────────────────────────────
// 2. THE DECISION
// ───────────────────────────────────────────────────────────────────

export interface ChartMigration {
  /** The type the view had, so a message can name it. */
  from: "chart";
  to: "table";
}

/**
 * What opening this view should change, or `null` when it should change nothing.
 *
 * Returns the description rather than mutating, so a caller that is only inspecting — a check, a
 * preview, a read-only render — can ask without writing to the user's file.
 */
export function planChartMigration(view: ViewConfig): ChartMigration | null {
  if (view.viewType !== "chart") return null;
  return { from: "chart", to: "table" };
}

/**
 * Apply a plan to the view, in place, and report whether anything moved.
 *
 * Nothing else moves: the chart-only fields (aggregation, bucketing, palette, reference lines)
 * stay on the view rather than being deleted, which costs nothing and is what an undo needs to
 * restore the surface exactly.
 */
export function applyChartMigration(view: ViewConfig, plan: ChartMigration): boolean {
  if (view.viewType !== plan.from) return false;
  view.viewType = plan.to;
  return true;
}
