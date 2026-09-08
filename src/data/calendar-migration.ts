// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-migration
// COMPONENT: what an existing calendar view becomes when it is opened
// ───────────────────────────────────────────────────────────────────
//
// `calendar` is withdrawn from every picker, so nothing new can be made one. That leaves the
// views already written into people's vault files, and "withdrawn" does nothing for them: the
// type string sits on disk, and deleting the renderer later would coerce those views to whatever
// the unknown-type fallback does — which is `table`, the same target this migration chooses on
// purpose rather than by accident.
//
// THE TARGET IS `table` because a calendar's essence is records arranged by a date property, and
// a table sorted by that same property retains every record and every property — board is not
// the target, because a calendar config carries no grouping property for a board to use.
//
// The one thing this migration carries is `calendarStartDateField`, onto the table's own sort
// column, so the redirected view keeps the same date-order it had as a calendar. An existing
// `sortColumn` wins over it — a view that has been sorted before carries a deliberate choice, and
// a migration that overwrote it would undo that choice on the way past. The grid arrangement,
// end-date spans and title/color formatting have no table equivalent at all and are a declared
// loss, not a silent one: the caller's notice says so.
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

export interface CalendarMigration {
  /** The type the view had, so a message can name it. */
  from: "calendar";
  to: "table";
  /** The sort column carried across, or undefined when the calendar declared no date field. */
  sortColumn?: string;
}

/**
 * What opening this view should change, or `null` when it should change nothing.
 *
 * Returns the description rather than mutating, so a caller that is only inspecting — a check, a
 * preview, a read-only render — can ask without writing to the user's file.
 *
 * An existing `sortColumn` wins over the calendar's own date field.
 */
export function planCalendarMigration(view: ViewConfig): CalendarMigration | null {
  if (view.viewType !== "calendar") return null;
  return {
    from: "calendar",
    to: "table",
    sortColumn: view.sortColumn ?? view.calendarStartDateField,
  };
}

/**
 * Apply a plan to the view, in place, and report whether anything moved.
 *
 * The calendar's own fields are LEFT ON THE VIEW rather than deleted. They cost nothing, they are
 * what an undo needs to restore the surface exactly, and stripping them would make the migration
 * one-way in a phase whose whole premise is that it is reversible.
 */
export function applyCalendarMigration(view: ViewConfig, plan: CalendarMigration): boolean {
  if (view.viewType !== plan.from) return false;
  view.viewType = plan.to;
  if (plan.sortColumn) view.sortColumn = plan.sortColumn;
  return true;
}
