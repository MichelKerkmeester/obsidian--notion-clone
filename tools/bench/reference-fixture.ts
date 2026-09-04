// ───────────────────────────────────────────────────────────────────
// MODULE:    reference-fixture
// COMPONENT: converts our bench rows into the vendored reference plugin's own Task/Project shape
// ───────────────────────────────────────────────────────────────────
//
// The reference captures photograph the vendored Project Manager plugin
// (specs/context/obsidian-pm-main) rendering the SAME project our constructed captures
// photograph: the same titles, statuses, dates, progress, milestone, dependencies,
// priority, assignees, tags and hours, expressed in each plugin's own shape. The rows are
// built through the benches' real exports (the same makeColumns/makeRows the harness's
// captureData path mounts), and every field is converted through the mapping table below —
// the table the parity test (reference-fixture.test.mjs) asserts field-for-field.
//
// | bench row field                       | reference Task field      | mapping |
// |---------------------------------------|---------------------------|---------|
// | file.basename (`row-N`)               | title / id / filePath     | identity |
// | frontmatter[board_status] (kanban)    | status                    | identity (the project's own status config declares these ids, and labels them with the id itself, which is the badge text our board draws) |
// | (no status column on the timeline)    | gantt config.statuses      | empty — our timeline has no status colour to map; the reference fills the gap with its own FALLBACK_COLOR, which is a difference the comparison records, not one the fixture invents |
// | frontmatter[priority] urgent/high/medium/low (the tier vocabulary the harness writes) | priority critical/high/medium/low | urgent -> critical (each plugin's own top tier), rest identity |
// | frontmatter[people] (the option vocabulary the harness writes: Backlog/Doing/...) | assignees | identity — the mapped people column is the only multi-valued field our board reads |
// | (no equivalent)                       | tags                       | empty — `getReferenceCardFields` matches a tags column by name and the bench has none, so our own card draws no tag row; giving the reference one would read as a gap in our copy |
// | first date-typed column               | due (kanban) / start AND due (gantt) | identity — our rows carry ONE date and the timeline bench sets no `timelineEndDateField`, so every event's end key equals its start key and both plugins draw the same one-day bar |
// | frontmatter.progress (60 on i%4===0)  | progress                   | identity |
// | frontmatter.milestone === "milestone" | type === "milestone"       | flag -> enum |
// | frontmatter.dependencies (note paths) | dependencies (task ids)    | path -> basename |
// | first number-typed column (i*37+0.5)  | timeLogs[0].hours          | identity — our card's time chip renders that column as the LOGGED hours (`board-renderer.ts:485`, the estimate has no RowData equivalent), so the estimate stays 0 and the reference's chip reads the same `<n>h` ours does |
//
// The reference's kanban and gantt read different benches (board rows for the kanban, which
// carry statuses; timeline rows for the gantt, which carry the milestone/dependency/progress
// fields), so `view` picks the bench and the vocabulary each one already carries.
//
// The reference's own shapes are imported as types only: the vendored tree's runtime
// modules pull in `temporal-polyfill`, which this repository does not install, and this
// module is also loaded by vitest where no bundle alias exists. Values that mirror the
// reference's DEFAULT_SETTINGS palette (status/priority colors) are transcribed here with
// that source named, exactly as the reference's own default exports define them.

// ───────────────────────────────────────────────────────────────────
// 1. IMPORTS
// ───────────────────────────────────────────────────────────────────

import type { Project, Task } from "../../specs/context/obsidian-pm-main/src/types";
import type { RowData, ColumnDef } from "../../src/data/types";
import {
  makeColumns as makeBoardColumns,
  makeRows as makeBoardRows,
  GROUP_FIELD,
} from "./board-render-bench";
import {
  makeColumns as makeTimelineColumns,
  makeRows as makeTimelineRows,
} from "./timeline-render-bench";

// ───────────────────────────────────────────────────────────────────
// 2. THE VOCABULARY
// ───────────────────────────────────────────────────────────────────

// The capture-sized row count, the same 18 rows the harness's captureData path mounts.
export const REFERENCE_ROWS = 18;

// The five status ids the board bench's rows actually carry (its GROUP_KEYS, re-derived
// from the rows in the parity test rather than imported, so the assertion reads the real
// emitted data). The reference project's own config declares these ids so its columns
// line up with our board's lanes one-to-one.
export const REFERENCE_STATUSES = ["backlog", "todo", "doing", "review", "done"];

// The reference's own four named tiers. Our constructed board paints its card-top strip
// from the harness's urgent/high/medium/low vocabulary; urgent has no reference twin, so
// the fixture maps it to critical — the reference's own top tier (its DEFAULT_PRIORITIES
// order: critical, high, medium, low).
export const REFERENCE_PRIORITIES = ["critical", "high", "medium", "low"];

// The option vocabulary the harness's captureData path writes into every select and
// multi-select column (its CAPTURE_OPTIONS values, in order). The reference rows carry the
// same values so the two plugins' pills and avatars read the same names.
export const REFERENCE_OPTION_VALUES = ["Backlog", "Doing", "Review", "Done", "Blocked"];

// The tier vocabulary the harness's captureData path writes into the renamed priority
// column (its PRIORITY_OPTIONS values, in order). The bench rows themselves carry
// `priority-N` placeholders, so the fixture rewrites the column the same way before
// converting — the row's own priority column then drives the task's tier.
export const REFERENCE_TIER_VOCABULARY = ["urgent", "high", "medium", "low"];

// Status palette: ids the reference has defaults for keep their own DEFAULT_STATUSES
// colors; the two ids without one borrow the palette's muted and in-progress colors.
const STATUS_COLORS: Record<string, string> = {
  backlog: "#767491",
  todo: "#8a94a0",
  doing: "#8b72be",
  review: "#b8a06b",
  done: "#79b58d",
  blocked: "#c47070",
};

// Priority colors transcribed from the reference's own DEFAULT_PRIORITIES.
const PRIORITY_COLORS: Record<string, string> = {
  critical: "#c47070",
  high: "#b8a06b",
  medium: "#8a94a0",
  low: "#79b58d",
};

// Mirrors the reference's own DEFAULT_PROJECT_COLOR / DEFAULT_PROJECT_ICON.
const PROJECT_COLOR = "#8b72be";
const PROJECT_ICON = "📋";

// ───────────────────────────────────────────────────────────────────
// 3. THE FIELD MAPPING
// ───────────────────────────────────────────────────────────────────

/** The tier mapping half of the priority row of the table: urgent -> critical, rest identity. */
export function referencePriority(benchTier: string): string {
  return benchTier.toLowerCase() === "urgent" ? "critical" : benchTier.toLowerCase();
}

/** The dependency transform: a note path becomes the task id the reference links by. */
export function referenceTaskIdFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  return base.endsWith(".md") ? base.slice(0, -3) : base;
}

function firstOf(columns: ColumnDef[], predicate: (column: ColumnDef) => boolean): ColumnDef | undefined {
  return columns.find(predicate);
}

/** The bench columns the card/bars read, matched by the same conventions our board port uses. */
function referenceColumns(columns: ColumnDef[]) {
  return {
    date: firstOf(columns, (col) => col.type === "date" || col.type === "datetime"),
    priority: firstOf(columns, (col) => col.type === "select" && /^priority$/i.test(col.key)),
    people: firstOf(columns, (col) => col.type === "multi-select" && /people|person|assignee|owner/i.test(col.key)),
    number: firstOf(columns, (col) => col.type === "number"),
  };
}

function optionValues(row: RowData, column: ColumnDef | undefined, i: number): string[] {
  if (!column || !(column.key in row.frontmatter)) return [];
  return [REFERENCE_OPTION_VALUES[i % REFERENCE_OPTION_VALUES.length],
    REFERENCE_OPTION_VALUES[(i + 2) % REFERENCE_OPTION_VALUES.length]];
}

function referenceTaskFromRow(row: RowData, columns: ColumnDef[], i: number, opts: {
  view: "kanban" | "gantt";
  statuses: string[];
}): Task {
  const { date, priority, people, number } = referenceColumns(columns);
  const frontmatter = row.frontmatter;
  const dateValue = date && typeof frontmatter[date.key] === "string" ? frontmatter[date.key] as string : "";
  // The gantt reads a span, and our rows carry one date: start and due both take it, which is
  // the reference's own one-day task (`GanttTaskBarRenderer` draws start..due+1day) and the
  // same single unit our timeline draws when no end field is configured. Leaving due empty
  // would instead drop every dependency arrow, which `renderDependencyArrows` skips without a
  // resolvable dep due.
  const start = opts.view === "gantt" ? dateValue : "";
  const due = dateValue;
  const tier = priority && typeof frontmatter[priority.key] === "string"
    ? referencePriority(frontmatter[priority.key] as string)
    : REFERENCE_PRIORITIES[i % REFERENCE_PRIORITIES.length];
  const values = optionValues(row, people, i);
  const isMilestone = referenceTaskFromRowMilestone(frontmatter);
  // The card's time chip reads logged hours against an estimate; our port has no estimate to
  // map, so the bench number lands where our own card puts it — the logged side — and both
  // chips read the same `<n>h`.
  const logged = number && typeof frontmatter[number.key] === "number"
    ? frontmatter[number.key] as number
    : 0;
  const timeLogs = logged > 0 ? [{ date: dateValue, hours: logged, note: "" }] : [];

  return {
    id: referenceTaskIdFromPath(row.file.path),
    title: row.file.basename,
    description: "",
    type: isMilestone ? "milestone" : "task",
    status: typeof frontmatter[GROUP_FIELD] === "string"
      ? frontmatter[GROUP_FIELD] as string
      : opts.statuses[i % opts.statuses.length],
    priority: tier,
    start,
    due,
    progress: typeof frontmatter.progress === "number" ? frontmatter.progress : 0,
    completed: "",
    assignees: values,
    tags: [],
    subtasks: [],
    dependencies: Array.isArray(frontmatter.dependencies)
      ? (frontmatter.dependencies as string[]).map(referenceTaskIdFromPath)
      : [],
    customFields: {},
    collapsed: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    filePath: row.file.path,
    timeEstimate: 0,
    ...(timeLogs.length ? { timeLogs } : {}),
  };
}

function referenceTaskFromRowMilestone(frontmatter: Record<string, unknown>): boolean {
  const value = frontmatter.milestone;
  return value === true || (typeof value === "string" && value.trim().toLowerCase() === "milestone");
}

/**
 * The lane config. The label is the id itself because that is what our own board draws: its
 * badge reads the group value through `formatGroupKeyDisplay`, and the bench's select column
 * carries no per-option label to read instead — so "To Do" for `todo` would be a value neither
 * plugin's data holds. The colour is the one place the two sides cannot be made equal: ours
 * resolves an option's palette NAME through `--status-color-fg-*`, a token defined in our
 * styles.css, which this page deliberately does not load. The reference keeps its own
 * DEFAULT_STATUSES palette, and the comparison reads lane colour as a known fixture difference
 * rather than a fidelity gap.
 */
function referenceStatusConfig(ids: string[]): { id: string; label: string; color: string; icon: string; complete: boolean }[] {
  return ids.map((id) => ({
    id,
    label: id,
    color: STATUS_COLORS[id] ?? "#8a94a0",
    icon: "",
    complete: id === "done",
  }));
}

// ───────────────────────────────────────────────────────────────────
// 4. THE PROJECT BUILDER
// ───────────────────────────────────────────────────────────────────

export interface ReferenceProjectOptions {
  /** Which constructed capture this project mirrors: kanban reads the board bench rows
   *  (which carry statuses), gantt the timeline bench rows (which carry the milestone,
   *  dependency and progress fields). */
  view: "kanban" | "gantt";
  /** Wires the first three rows into a parent with two children — the same relation the
   *  harness's captureData subtask-tree option builds. */
  subtask?: boolean;
}

/**
 * The bench rows converted into one reference project. The taskIndex is left to the
 * mount driver (it needs the reference's own TaskIndex builder, which is runtime code
 * this module deliberately does not load).
 */
export function makeReferenceProject(rows: RowData[], columns: ColumnDef[], opts: ReferenceProjectOptions): Project {
  const statuses = opts.view === "kanban" ? REFERENCE_STATUSES : REFERENCE_OPTION_VALUES;

  // The harness's captureData path rewrites the bench's option columns in place before
  // mounting (its applyCapturePriorityTiers writes the four tier values by row index);
  // the fixture applies the same rewrite so the conversion reads what the constructed
  // captures actually show, not the bench's raw `priority-N` placeholders.
  const tierColumn = referenceColumns(columns).priority;
  if (tierColumn) {
    rows.forEach((row, i) => {
      if (tierColumn.key in row.frontmatter) {
        row.frontmatter[tierColumn.key] = REFERENCE_TIER_VOCABULARY[i % REFERENCE_TIER_VOCABULARY.length];
      }
    });
  }

  let tasks = rows.map((row, i) => referenceTaskFromRow(row, columns, i, { view: opts.view, statuses }));

  if (opts.subtask) {
    const [parent, first, second] = tasks;
    // The children ride the parent's lane, exactly as the harness's applyCaptureSubtaskTree
    // copies the parent's group value onto both children. A task nested under a parent is
    // a subtask in the reference's own enum, which is what draws its Sub chip and parent
    // chip — except a milestone, which keeps its own type and draws its diamond instead.
    first.status = parent.status;
    second.status = parent.status;
    if (first.type !== "milestone") first.type = "subtask";
    if (second.type !== "milestone") second.type = "subtask";
    parent.progress = 62;
    parent.collapsed = false;
    parent.subtasks = [first, second];
    tasks = [parent, ...tasks.slice(3)];
  }

  return {
    id: "bench",
    title: "Bench",
    description: "",
    color: PROJECT_COLOR,
    icon: PROJECT_ICON,
    tasks,
    customFields: [],
    teamMembers: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    filePath: "Projects/Bench.md",
    savedViews: [],
    config: {
      // The gantt gets NO status config, which is what our timeline actually carries: its bench
      // has no status column at all. The reference never reaches its own no-status fallbacks
      // from here — `resolveProjectConfig` runs `withInUseExtras`, which mints a config for
      // every in-use id at its FALLBACK_COLOR (#8a94a0), so every reference bar, milestone and
      // label dot takes that one neutral grey while ours takes `--interactive-accent` for the
      // bar and `--text-muted` for the dot. Supplying a colour here would fix the bar and break
      // the dot, since the reference paints both from the one status colour and we do not; the
      // difference is structural and is recorded rather than papered over. The kanban keeps its
      // config: there the lanes ARE the statuses.
      statuses: opts.view === "kanban" ? referenceStatusConfig(statuses) : [],
      priorities: REFERENCE_PRIORITIES.map((id) => ({
        id,
        label: id[0].toUpperCase() + id.slice(1),
        color: PRIORITY_COLORS[id] ?? "#8a94a0",
        icon: "",
      })),
    },
    taskIndex: new Map() as Project["taskIndex"],
  };
}

/** The board bench rows the kanban mount photographs, built through the bench's real exports. */
export function makeReferenceBoardRows(): { rows: RowData[]; columns: ColumnDef[] } {
  const columns = makeBoardColumns(21, "mixed");
  return { rows: makeBoardRows(REFERENCE_ROWS, columns, 1, 5), columns };
}

/** The timeline bench rows the gantt mount photographs. */
export function makeReferenceTimelineRows(): { rows: RowData[]; columns: ColumnDef[] } {
  const columns = makeTimelineColumns(21, "mixed");
  return { rows: makeTimelineRows(REFERENCE_ROWS, columns, 1), columns };
}
