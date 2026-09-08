// ───────────────────────────────────────────────────────────────────
// MODULE:    timeline-migration
// COMPONENT: what an existing timeline view becomes when it is opened
// ───────────────────────────────────────────────────────────────────
//
// `timeline` is withdrawn from every picker, so nothing new can be made one. That leaves the
// views already written into people's vault files, and "withdrawn" does nothing for them: the
// type string sits on disk, and deleting the renderer later would turn those views into whatever
// the unknown-type coercion does — which is `table`, a lane chart becoming a spreadsheet with no
// warning.
//
// So the deprecation migrates instead of waiting. THE TARGET IS `board`, not `table`, because
// timeline is the only one of the three whose config already carries a grouping dimension: lanes
// (`timelineGroupField`) map structurally onto board groups (`boardGroupField`) — both are
// optional property-name strings naming the field records are grouped by. An existing
// `boardGroupField` wins over the timeline's own, the same reasoning gallery-migration.ts uses
// for `boardImageField`: a view that has been a board before carries a deliberate choice, and a
// migration that overwrote it would undo that choice on the way past.
//
// `timelineTitleField` and `timelineColorField` have no board equivalent at all — a board's title
// is always the record's own title, and its coloring comes from the group itself, not a separate
// field — so both stay on the view (nothing here is deleted, see below) so an undo restores them,
// but neither migration function invents a board field for them. The time axis itself and the
// start/end date fields are the same kind of declared loss: named in the caller's notice, not
// silently dropped.
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

export interface TimelineMigration {
  /** The type the view had, so an undo and a message can both name it. */
  from: "timeline";
  to: "board";
  /** The board group field carried across, or undefined when the timeline declared no lane field. */
  groupField?: string;
}

/**
 * What opening this view should change, or `null` when it should change nothing.
 *
 * Returns the description rather than mutating, so a caller that is only inspecting — a check, a
 * preview, a read-only render — can ask without writing to the user's file.
 *
 * An existing `boardGroupField` wins over the timeline's own.
 */
export function planTimelineMigration(view: ViewConfig): TimelineMigration | null {
  if (view.viewType !== "timeline") return null;
  return {
    from: "timeline",
    to: "board",
    groupField: view.boardGroupField ?? view.timelineGroupField,
  };
}

/**
 * Apply a plan to the view, in place, and report whether anything moved.
 *
 * The timeline's own fields are LEFT ON THE VIEW rather than deleted. They cost nothing, they are
 * what an undo needs to restore the surface exactly, and stripping them would make the migration
 * one-way in a phase whose whole premise is that it is reversible.
 */
export function applyTimelineMigration(view: ViewConfig, plan: TimelineMigration): boolean {
  if (view.viewType !== plan.from) return false;
  view.viewType = plan.to;
  if (plan.groupField) view.boardGroupField = plan.groupField;
  return true;
}
