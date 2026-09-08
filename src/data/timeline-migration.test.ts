// ───────────────────────────────────────────────────────────────────
// MODULE:    timeline-migration.test
// COMPONENT: what opening an existing timeline view does to it, and what it must not do
// ───────────────────────────────────────────────────────────────────
//
// Timeline is the one type of the three whose target (board) differs from the unknown-type
// fallback (table), the same reason gallery routes through a real migration instead of the bare
// coercion. The lane field (`timelineGroupField`) maps structurally onto the board's own grouping
// field, and an existing `boardGroupField` wins over it, mirroring gallery-migration.ts's
// `boardImageField` precedent.

// ───────────────────────────────────────────────────────────────────
// 1. THE FIXTURE
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { applyTimelineMigration, planTimelineMigration } from "./timeline-migration";
import type { ViewConfig } from "./types";

const timeline = (extra: Partial<ViewConfig> = {}): ViewConfig => ({
  id: "v1",
  name: "Timeline",
  viewType: "timeline",
  timelineGroupField: "assignee",
  ...extra,
} as ViewConfig);

// ───────────────────────────────────────────────────────────────────
// 2. WHAT MIGRATES
// ───────────────────────────────────────────────────────────────────

describe("an existing timeline becomes a board", () => {
  it("plans the move and carries the lane field to the property the board groups by", () => {
    const plan = planTimelineMigration(timeline());
    expect(plan).toEqual({ from: "timeline", to: "board", groupField: "assignee" });
  });

  it("applies once and reports that it did", () => {
    const view = timeline();
    const plan = planTimelineMigration(view)!;
    expect(applyTimelineMigration(view, plan)).toBe(true);
    expect(view.viewType).toBe("board");
    expect(view.boardGroupField).toBe("assignee");
  });

  it("refuses to apply a second time, so a re-render cannot fight an undo", () => {
    const view = timeline();
    const plan = planTimelineMigration(view)!;
    applyTimelineMigration(view, plan);
    expect(applyTimelineMigration(view, plan)).toBe(false);
  });

  it("plans nothing for a timeline with no lane field, rather than nothing at all", () => {
    const plan = planTimelineMigration(timeline({ timelineGroupField: undefined }));
    expect(plan).toEqual({ from: "timeline", to: "board", groupField: undefined });
  });

  it("plans nothing for every view that is not a timeline", () => {
    for (const viewType of ["table", "board", "gallery", "list", "chart", "calendar"] as const) {
      expect(planTimelineMigration({ ...timeline(), viewType } as ViewConfig)).toBeNull();
    }
  });
});

// ───────────────────────────────────────────────────────────────────
// 3. AN EXISTING BOARD GROUP FIELD WINS
// ───────────────────────────────────────────────────────────────────

describe("the migration does not overwrite an existing board group field", () => {
  it("does not overwrite a board group field the view already carries", () => {
    const view = timeline({ timelineGroupField: "assignee", boardGroupField: "status" } as Partial<ViewConfig>);
    const plan = planTimelineMigration(view)!;
    expect(plan.groupField).toBe("status");
    applyTimelineMigration(view, plan);
    expect(view.boardGroupField).toBe("status");
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. WHAT IS LEFT ALONE, WHICH IS WHAT MAKES IT REVERSIBLE
// ───────────────────────────────────────────────────────────────────

describe("the migration leaves the way back intact", () => {
  it("keeps the timeline's own fields on the view, including title and color, which have no board equivalent", () => {
    const view = timeline({ timelineTitleField: "name", timelineColorField: "status" } as Partial<ViewConfig>);
    applyTimelineMigration(view, planTimelineMigration(view)!);
    expect((view as { timelineTitleField?: string }).timelineTitleField).toBe("name");
    expect((view as { timelineColorField?: string }).timelineColorField).toBe("status");
    expect(view.timelineGroupField).toBe("assignee");
  });
});
