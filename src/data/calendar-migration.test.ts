// ───────────────────────────────────────────────────────────────────
// MODULE:    calendar-migration.test
// COMPONENT: what opening an existing calendar view does to it, and what it must not do
// ───────────────────────────────────────────────────────────────────
//
// Calendar's target is the unknown-type fallback (table), but unlike chart it has one field
// worth carrying: `calendarStartDateField`, onto the table's own sort column, so the redirected
// view keeps the date-order it had as a calendar. An existing `sortColumn` wins, the same way
// gallery-migration.ts lets an existing `boardImageField` win over the gallery's own.

// ───────────────────────────────────────────────────────────────────
// 1. THE FIXTURE
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { applyCalendarMigration, planCalendarMigration } from "./calendar-migration";
import type { ViewConfig } from "./types";

const calendar = (extra: Partial<ViewConfig> = {}): ViewConfig => ({
  id: "v1",
  name: "Calendar",
  viewType: "calendar",
  calendarStartDateField: "due",
  ...extra,
} as ViewConfig);

// ───────────────────────────────────────────────────────────────────
// 2. WHAT MIGRATES
// ───────────────────────────────────────────────────────────────────

describe("an existing calendar becomes a table", () => {
  it("plans the move and carries the date field to the property the table sorts by", () => {
    const plan = planCalendarMigration(calendar());
    expect(plan).toEqual({ from: "calendar", to: "table", sortColumn: "due" });
  });

  it("applies once and reports that it did", () => {
    const view = calendar();
    const plan = planCalendarMigration(view)!;
    expect(applyCalendarMigration(view, plan)).toBe(true);
    expect(view.viewType).toBe("table");
    expect(view.sortColumn).toBe("due");
  });

  it("refuses to apply a second time, so a re-render cannot re-migrate", () => {
    const view = calendar();
    const plan = planCalendarMigration(view)!;
    applyCalendarMigration(view, plan);
    expect(applyCalendarMigration(view, plan)).toBe(false);
  });

  it("plans nothing for a calendar with no start-date field, rather than nothing at all", () => {
    const plan = planCalendarMigration(calendar({ calendarStartDateField: undefined }));
    expect(plan).toEqual({ from: "calendar", to: "table", sortColumn: undefined });
  });

  it("plans nothing for every view that is not a calendar", () => {
    for (const viewType of ["table", "board", "gallery", "list", "chart", "timeline"] as const) {
      expect(planCalendarMigration({ ...calendar(), viewType } as ViewConfig)).toBeNull();
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. AN EXISTING SORT CHOICE WINS
// ───────────────────────────────────────────────────────────────────

describe("the migration does not overwrite an existing sort choice", () => {
  it("does not overwrite a sort column the view already carries", () => {
    const view = calendar({ calendarStartDateField: "due", sortColumn: "priority" } as Partial<ViewConfig>);
    const plan = planCalendarMigration(view)!;
    expect(plan.sortColumn).toBe("priority");
    applyCalendarMigration(view, plan);
    expect(view.sortColumn).toBe("priority");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. WHAT IS LEFT ALONE, WHICH IS WHAT MAKES IT REVERSIBLE
// ───────────────────────────────────────────────────────────────────

describe("the migration leaves the way back intact", () => {
  it("keeps the calendar's own fields on the view, undeleted", () => {
    const view = calendar({ calendarTitleField: "name", calendarColorField: "status" } as Partial<ViewConfig>);
    applyCalendarMigration(view, planCalendarMigration(view)!);
    expect((view as { calendarTitleField?: string }).calendarTitleField).toBe("name");
    expect((view as { calendarColorField?: string }).calendarColorField).toBe("status");
    expect(view.calendarStartDateField).toBe("due");
  });
});
