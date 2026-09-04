// ───────────────────────────────────────────────────────────────────
// MODULE:    reference-fixture.test
// COMPONENT: field-for-field parity between the reference fixture's tasks and the bench rows
// ───────────────────────────────────────────────────────────────────
//
// The reference captures exist to be read beside our constructed captures, so the data
// they render must be the same project. This suite builds the rows through the benches'
// REAL exports (the same makeColumns/makeRows the harness's captureData path mounts) and
// asserts every field of every reference task equals the bench row's field through the
// mapping table in reference-fixture.ts's header — identity where the shapes overlap, the
// named transform where they do not (priority tier names, the note-path-to-task-id
// transform), and the reference's own default where our rows carry no equivalent field.
//
// Two projects are asserted, one per paired view:
//
//   constructed-board          <- reference-kanban           (board bench rows)
//   constructed-timeline       <- reference-gantt            (timeline bench rows)
//   constructed-board-subtask  <- reference-kanban-subtask   (board rows, tree wired)
//   constructed-timeline-subtask <- reference-gantt-subtask  (timeline rows, tree wired)
//
// A row that fails a field is reported by index so a drift in one field cannot hide in a
// bulk "18 tasks OK".

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import { describe, expect, it } from "vitest";
import { GROUP_FIELD } from "./board-render-bench";
import {
  makeReferenceProject,
  makeReferenceBoardRows,
  makeReferenceTimelineRows,
  referencePriority,
  referenceTaskIdFromPath,
  REFERENCE_ROWS,
  REFERENCE_STATUSES,
  REFERENCE_PRIORITIES,
  REFERENCE_OPTION_VALUES,
  REFERENCE_TIER_VOCABULARY,
} from "./reference-fixture";

// ───────────────────────────────────────────────────────────────────
// 2. SHARED HELPERS
// ───────────────────────────────────────────────────────────────────

function columnOf(columns, predicate) {
  return columns.find(predicate);
}

// The same vocabulary the harness's captureData path writes into select/multi-select
// columns (its CAPTURE_OPTIONS values) — declared here so the test can assert the fixture
// applies it, and kept equal to REFERENCE_OPTION_VALUES by construction.
const OPTION_VOCABULARY = ["Backlog", "Doing", "Review", "Done", "Blocked"];

// ───────────────────────────────────────────────────────────────────
// 3. THE KANBAN PROJECT — BOARD BENCH ROWS
// ───────────────────────────────────────────────────────────────────

describe("reference fixture — kanban project mirrors the board bench rows", () => {
  const { rows, columns } = makeReferenceBoardRows();
  const project = makeReferenceProject(rows, columns, { view: "kanban" });
  const dateColumn = columnOf(columns, (col) => col.type === "date" || col.type === "datetime");
  const priorityColumn = columnOf(columns, (col) => col.type === "select" && /^priority$/i.test(col.key));
  const peopleColumn = columnOf(columns, (col) => col.type === "multi-select" && /people|person|assignee|owner/i.test(col.key));
  const numberColumn = columnOf(columns, (col) => col.type === "number");

  it("keeps one task per bench row, in row order", () => {
    expect(project.tasks).toHaveLength(REFERENCE_ROWS);
    expect(project.tasks.map((task) => task.title)).toEqual(rows.map((row) => row.file.basename));
    expect(project.tasks.map((task) => task.id)).toEqual(rows.map((row) => referenceTaskIdFromPath(row.file.path)));
  });

  it("carries the board bench's own statuses as the project's lanes, in lane order", () => {
    const laneIds = [...new Set(rows.map((row) => row.frontmatter[GROUP_FIELD]))];
    expect(laneIds).toEqual(REFERENCE_STATUSES);
    expect(project.config.statuses.map((status) => status.id)).toEqual(REFERENCE_STATUSES);
    // Our board's badge draws the raw group value, so the reference's lane label is the id.
    expect(project.config.statuses.map((status) => status.label)).toEqual(REFERENCE_STATUSES);
    rows.forEach((row, i) => {
      expect(project.tasks[i].status).toBe(row.frontmatter[GROUP_FIELD]);
    });
  });

  it("maps the priority tier vocabulary through the named transform", () => {
    // The tier vocabulary the fixture rewrites the column with is the one the harness
    // writes, and the transform is the documented tier mapping.
    expect(REFERENCE_TIER_VOCABULARY).toEqual(["urgent", "high", "medium", "low"]);
    expect(REFERENCE_TIER_VOCABULARY.map(referencePriority)).toEqual(REFERENCE_PRIORITIES);
    rows.forEach((row, i) => {
      expect(project.tasks[i].priority).toBe(referencePriority(row.frontmatter[priorityColumn.key]));
      expect(project.tasks[i].priority).toBe(REFERENCE_PRIORITIES[i % REFERENCE_PRIORITIES.length]);
    });
  });

  it("maps the date column to the due field by identity", () => {
    expect(dateColumn).toBeDefined();
    rows.forEach((row, i) => {
      expect(project.tasks[i].due).toBe(row.frontmatter[dateColumn.key]);
      expect(project.tasks[i].start).toBe("");
    });
  });

  it("maps the multi-select column's option vocabulary into assignees, and leaves tags empty", () => {
    expect(peopleColumn).toBeDefined();
    // Our card reads the mapped people column and matches a tags column by name; the bench
    // carries none, so our own capture draws no tag row and the reference must not either.
    expect(columnOf(columns, (col) => col.type === "multi-select" && /tag/i.test(col.key))).toBeUndefined();
    rows.forEach((row, i) => {
      if (!(peopleColumn.key in row.frontmatter)) return;
      const expected = [OPTION_VOCABULARY[i % OPTION_VOCABULARY.length],
        OPTION_VOCABULARY[(i + 2) % OPTION_VOCABULARY.length]];
      expect(project.tasks[i].assignees).toEqual(expected);
      expect(project.tasks[i].tags).toEqual([]);
    });
  });

  it("lands the number column on logged hours by identity, with no estimate", () => {
    expect(numberColumn).toBeDefined();
    rows.forEach((row, i) => {
      const value = row.frontmatter[numberColumn.key];
      expect(project.tasks[i].timeEstimate ?? 0).toBe(0);
      if (typeof value === "number" && value > 0) {
        expect(project.tasks[i].timeLogs).toHaveLength(1);
        expect(project.tasks[i].timeLogs[0].hours).toBe(value);
      } else {
        expect(project.tasks[i].timeLogs).toBeUndefined();
      }
    });
  });

  it("keeps the milestone/dependency/progress fields at the board rows' own values", () => {
    rows.forEach((row, i) => {
      expect(project.tasks[i].type).toBe("task");
      expect(project.tasks[i].dependencies).toEqual([]);
      expect(project.tasks[i].progress).toBe(typeof row.frontmatter.progress === "number" ? row.frontmatter.progress : 0);
    });
  });
});

// ───────────────────────────────────────────────────────────────────
// 4. THE GANTT PROJECT — TIMELINE BENCH ROWS
// ───────────────────────────────────────────────────────────────────

describe("reference fixture — gantt project mirrors the timeline bench rows", () => {
  const { rows, columns } = makeReferenceTimelineRows();
  const project = makeReferenceProject(rows, columns, { view: "gantt" });
  const dateColumn = columnOf(columns, (col) => col.type === "date" || col.type === "datetime");

  it("keeps one task per bench row, in row order", () => {
    expect(project.tasks).toHaveLength(REFERENCE_ROWS);
    expect(project.tasks.map((task) => task.title)).toEqual(rows.map((row) => row.file.basename));
  });

  it("maps the event date to start AND due by identity, the one-day bar our timeline draws", () => {
    expect(dateColumn).toBeDefined();
    rows.forEach((row, i) => {
      const date = row.frontmatter[dateColumn.key];
      expect(project.tasks[i].start).toBe(date);
      expect(project.tasks[i].due).toBe(date);
    });
  });

  it("maps the milestone flag to the milestone type on the same row", () => {
    rows.forEach((row, i) => {
      const flagged = row.frontmatter.milestone === "milestone";
      expect(project.tasks[i].type).toBe(flagged ? "milestone" : "task");
    });
    expect(project.tasks[1].type).toBe("milestone");
  });

  it("maps dependencies from note paths to task ids", () => {
    rows.forEach((row, i) => {
      const deps = Array.isArray(row.frontmatter.dependencies) ? row.frontmatter.dependencies : [];
      expect(project.tasks[i].dependencies).toEqual(deps.map(referenceTaskIdFromPath));
    });
    expect(project.tasks[5].dependencies).toEqual(["row-4"]);
  });

  it("maps the progress field by identity", () => {
    rows.forEach((row, i) => {
      expect(project.tasks[i].progress).toBe(typeof row.frontmatter.progress === "number" ? row.frontmatter.progress : 0);
    });
    expect(project.tasks[0].progress).toBe(60);
  });

  it("applies the option vocabulary as the statuses the timeline rows never carry", () => {
    rows.forEach((_row, i) => {
      expect(project.tasks[i].status).toBe(REFERENCE_OPTION_VALUES[i % REFERENCE_OPTION_VALUES.length]);
    });
  });

  it("leaves the gantt status config empty, the colour source our timeline has none of", () => {
    expect(project.config.statuses).toEqual([]);
  });

  it("maps the priority tier vocabulary through the named transform", () => {
    rows.forEach((_row, i) => {
      expect(project.tasks[i].priority).toBe(REFERENCE_PRIORITIES[i % REFERENCE_PRIORITIES.length]);
    });
  });
});

// ───────────────────────────────────────────────────────────────────
// 5. THE SUBTASK VARIANTS — THE TREE WIRING
// ───────────────────────────────────────────────────────────────────

describe("reference fixture — the subtask tree variant", () => {
  const { rows, columns } = makeReferenceBoardRows();
  const project = makeReferenceProject(rows, columns, { view: "kanban", subtask: true });

  it("nests the first three rows into a parent with two children", () => {
    expect(project.tasks).toHaveLength(REFERENCE_ROWS - 2);
    expect(project.tasks[0].title).toBe(rows[0].file.basename);
    expect(project.tasks[0].subtasks.map((task) => task.id)).toEqual(["row-1", "row-2"]);
    expect(project.tasks[0].collapsed).toBe(false);
  });

  it("rides the children on the parent's lane with the parent's own progress", () => {
    expect(project.tasks[0].subtasks[0].status).toBe(project.tasks[0].status);
    expect(project.tasks[0].subtasks[1].status).toBe(project.tasks[0].status);
    expect(project.tasks[0].progress).toBe(62);
  });

  it("types the children as subtasks except the milestone row, which keeps its type", () => {
    const [first, second] = project.tasks[0].subtasks;
    expect(first.type).toBe(first.title === rows[1].file.basename && rows[1].frontmatter.milestone === "milestone"
      ? "milestone"
      : "subtask");
    expect(second.type).toBe(second.title === rows[2].file.basename && rows[2].frontmatter.milestone === "milestone"
      ? "milestone"
      : "subtask");
    expect(project.tasks[0].subtasks.filter((task) => task.type === "subtask").length).toBeGreaterThanOrEqual(1);
  });

  it("keeps every other row a top-level task", () => {
    expect(project.tasks.slice(1).map((task) => task.title))
      .toEqual(rows.slice(3).map((row) => row.file.basename));
  });
});

// ───────────────────────────────────────────────────────────────────
// 6. THE TRANSFORMS THEMSELVES
// ───────────────────────────────────────────────────────────────────

describe("reference fixture — the named transforms", () => {
  it("referencePriority maps only the top tier", () => {
    expect(referencePriority("urgent")).toBe("critical");
    expect(referencePriority("high")).toBe("high");
    expect(referencePriority("medium")).toBe("medium");
    expect(referencePriority("low")).toBe("low");
  });

  it("referenceTaskIdFromPath strips the folder and extension", () => {
    expect(referenceTaskIdFromPath("notes/row-4.md")).toBe("row-4");
  });
});
