---
title: "Obsidian PM UI Harvest — port catalog"
description: "Source-cited near one-to-one adoption catalog for timeline, board, calendar, subtasks, and shared UI/UX."
status: complete
iterations: 20
stop_reason: maxIterationsReached
source_root: specs/context/obsidian-pm-main
---

# Obsidian PM UI Harvest — port catalog

_Provenance: synthesized by the `luna-max-fast-pm-harvest` lineage, run `1788379278687-inumo2`, whose ledgers, deltas and twenty iteration files stay untracked under `research/lineages/luna-max-fast-pm-harvest/` (the repo ignores `specs/**/research/**/lineages/`); the frontmatter's `iterations: 20` and `stop_reason` are the run reporting on itself, not a measurement — see `goal.md`._

## Executive disposition

This is a port plan, not an inspiration list. The MIT reference supplies direct Gantt and Kanban
modules, recursive subtask/persistence semantics, and shared visual language. It does **not** supply
a standalone calendar renderer. The local calendar is therefore the merge host, using only verified
reference date/milestone semantics.

The strongest adoption path is near one-to-one behavior and interaction shape, rewritten into this
repository's `RowData`/`ViewConfig`/action contracts, `db-*` DOM and `styles.css` lanes, i18n,
MODULE banners, numbered sections, teardown, placement, screenshot, and gate requirements. No product
code was copied during this research phase. All proposed implementations are marked `rewrite` unless
a later packet elects to copy a substantial code/CSS portion and carries the full MIT notice at that
landing point.

Evidence rule: reference claims below resolve under `specs/context/obsidian-pm-main`; local claims
resolve under this repository. Each source excerpt is a short, exact line window of at most twelve
lines. A negative source finding is labeled as such; no browser or external-source evidence was used.

## License and copy boundary

`specs/context/obsidian-pm-main/LICENSE:1-21` is MIT, copyright Stepan Kropachev and dotpm
contributors. It grants use, copying, modification, merging, publishing, distribution, sublicense,
and sale, subject to including the copyright and permission notices in every copy or substantial
portion. Behavior, layout intent, and interaction shape can be rewritten without copying code. If a
later packet lands verbatim or substantially adapted source/CSS, place the complete notice from the
LICENSE at that code/CSS landing point. This catalog itself contains no copied product implementation.

## 1. TIMELINE / GANTT

### What it is and the verified source contract

- Geometry is centralized: `specs/context/obsidian-pm-main/src/views/gantt/TimelineConfig.ts:5-9` —
  “`ROW_HEIGHT = 44`, `HEADER_HEIGHT = 56`, `LABEL_WIDTH = 280`.” Adopt these as the initial visual
  baseline, then express them through local tokens.
- Range discovery is data-driven: `specs/context/obsidian-pm-main/src/views/gantt/TimelineConfig.ts:36-45` — “for each flattened task, parse
  start and due; push whichever dates exist.” `:47-61` then adds today, padding, and a per-scale
  minimum range.
- Conversion is reversible at the date unit: `specs/context/obsidian-pm-main/src/views/gantt/TimelineConfig.ts:79-85` — “`dateToX` multiplies
  days since start by `dayWidth`; `xToDate` rounds x back to a date.”
- View state is explicit: `specs/context/obsidian-pm-main/src/views/gantt/GanttView.ts:75-84` — “`refresh()` saves pending scroll; `render()`
  runs cleanup, cancels links, empties the container, and adds the Gantt class.”
- Controls are a five-level scale selector plus Today/Expand all/Collapse all:
  `specs/context/obsidian-pm-main/src/views/gantt/GanttView.ts:95-106` — “levels are day, week, month, quarter, year.”
- Topology is a label pane, resizer, and right scroll pane with a sticky header:
  `specs/context/obsidian-pm-main/src/views/gantt/GanttView.ts:124-135` — “create left panel, left header/body, and resize handle.”
- Grid/today are separate layers: `specs/context/obsidian-pm-main/src/views/gantt/GanttRenderer.ts:30-40` — “derive total height, iterate
  days, identify weekends, Mondays, and first-of-month boundaries”; `:90-109` draws a today line
  and a header cap.
- Header bands follow real date boundaries: `specs/context/obsidian-pm-main/src/views/gantt/GanttHeaderRenderer.ts:38-45` dispatches by
  granularity; `:78-95` aligns week labels to Mondays and honors the configured label mode.
- Bars support due-only tasks and milestones: `specs/context/obsidian-pm-main/src/views/gantt/GanttTaskBarRenderer.ts:51-58` — “a task due on
  E occupies day E; effective end is E+1; width has an eight-pixel minimum.”
- Drag is save-on-release: `specs/context/obsidian-pm-main/src/views/gantt/GanttDragHandler.ts:48-58` — “edge drag changes the edge; bar drag
  moves the span; dates are written once on release.”
- Dependencies are a two-click finish-to-start link with same-side, duplicate, missing-task, and
  cycle rejection: `specs/context/obsidian-pm-main/src/views/gantt/GanttLinkHandler.ts:56-67` and `:77-97`.
- CSS gives the reference hierarchy: `specs/context/obsidian-pm-main/src/styles/gantt.css:1-17` — “column flex view; controls have 8px
  16px padding; wrapper is flex/hidden”; `:237-277` styles hover bars, today, and dashed arrows.

### Local host, 1:1 range, and required differences

The host is `src/views/calendar-timeline-renderer.ts`. It already has an action contract for opening
rows, creating entries, updating dates, reordering, moving between lanes, scaling, group collapse,
invalid-event repair, and read-only mode (`:150-183`). It builds a CSS-unit model with visible-unit
measurement, CSS offsets, accessibility status, clipped-event jump buttons, backlog, group limits,
today line, and teardown (`:300-345`, `:421-452`).

Adopt nearly 1:1: five zoom levels; padded date range; date boundary labels; split label/time
hierarchy; sticky axis; weekend/grid/today language; due-only/milestone/progress/label affordances;
save-on-release move/resize; cycle-safe dependency linking. Rewrite: `Task` → `RowData` adapter,
plugin-store writes → local action/data pipeline, SVG classes → scoped `db-*` DOM/CSS, local i18n and
ARIA. Keep local visible-window rendering, unscheduled backlog, invalid-date repair, group/WIP-like
limits, touch menu, keyboard, and observer teardown. The reference has no virtualization; local
viewport and lane limits are not to be dropped.

### Timeline module map and effort

| Ref file:line — short excerpt | Local module:line — short excerpt | Disposition / seam | LOC / packet |
|---|---|---|---|
| `TimelineConfig.ts:5-9` — `ROW_HEIGHT`, `HEADER_HEIGHT`, `LABEL_WIDTH` | `src/views/calendar-timeline-renderer.ts:312-318` — writes `--db-timeline-units` and `--db-timeline-unit-width` | Rewrite constants as local tokens/CSS variables; preserve scale geometry. | 60–90 / `037-timeline-gantt-port` |
| `TimelineConfig.ts:36-45` — collect task start/due dates | `src/views/calendar-timeline-renderer.ts:300-316` — build model with visible count/span | Extend local model with reference padding/min-span semantics; keep visible-window measurement. | 60–90 / `037-timeline-gantt-port` |
| `TimelineConfig.ts:79-85` — date↔x conversion | `src/views/calendar-timeline-renderer.ts:647-655` — exact offset/width CSS properties | Rewrite into local unit math; preserve minimum usable width. | 50–80 / `037-timeline-gantt-port` |
| `GanttView.ts:75-84` — cleanup, cancel link, empty, render | `src/views/calendar-timeline-renderer.ts:254-274` — disconnect observers, close menus, cancel RAF/drag | Merge lifecycle; local teardown wins. | 80–120 / `037-timeline-gantt-port` |
| `GanttView.ts:95-106` — five-level controls | `src/views/calendar-timeline-renderer.ts:832-854` — title, scale, prev/today/next, mini-calendar | Rewrite controls into local i18n/navigation contract. | 70–100 / `037-timeline-gantt-port` |
| `GanttView.ts:124-135` — left panel and resizer | `src/views/calendar-timeline-renderer.ts:312-345` — local root, status, axis/body | Extend local shell; do not introduce a second view class. | 100–160 / `037-timeline-gantt-port` |
| `GanttView.ts:185-190` — eager SVG height for all rows | `src/views/calendar-timeline-renderer.ts:391-445` — lanes and rendered event window | Drop eager strategy; retain local visible counts/lanes and accessibility. | 80–120 / `037-timeline-gantt-port` |
| `GanttRenderer.ts:30-40` — weekend/Monday/month grid decisions | `src/views/calendar-timeline-renderer.ts:344-389` — axis bands/ticks/current marks | Rewrite grid into local tick DOM/CSS. | 100–150 / `037-timeline-gantt-port` |
| `GanttRenderer.ts:90-109` — today line and sticky cap | `src/views/calendar-timeline-renderer.ts:447-452` — CSS today line | Merge today marker with local visible-window positioning. | 40–70 / `037-timeline-gantt-port` |
| `GanttHeaderRenderer.ts:48-75` — day headers/weekend fills/day labels | `src/views/calendar-timeline-renderer.ts:865-885` — scale buttons/pressed state | Rewrite header labels through local timeline header and i18n. | 100–150 / `037-timeline-gantt-port` |
| `GanttTaskBarRenderer.ts:20-27` — empty row target when no dates | `src/views/calendar-timeline-renderer.ts:306-309` — no-events then backlog | Merge unscheduled affordance; keep local backlog. | 70–100 / `037-timeline-gantt-port` |
| `GanttTaskBarRenderer.ts:51-58` — due-only one-day width | `src/views/calendar-timeline-renderer.ts:647-655` — minimum unit/width | Rewrite date adapter; retain usable minimum. | 50–80 / `037-timeline-gantt-port` |
| `GanttTaskBarRenderer.ts:76-117` — progress fill and metadata title | `src/views/calendar-timeline-renderer.ts:586-614` — button, icon, title, meta, path | Map status/progress/assignee/date metadata; keep calculated values local. | 130–200 / `037-timeline-gantt-port` |
| `GanttTaskBarRenderer.ts:119-146` — edge handles | `src/views/calendar-timeline-renderer.ts:633-639` — date resize handles and touch menu | Rewrite handles as local buttons/ARIA; retain touch alternative. | 80–120 / `037-timeline-gantt-port` |
| `GanttDragHandler.ts:48-58` — save once on release | `src/views/calendar-timeline-renderer.ts:1443-1460` — date fields and read-only guard | Share release-time date transaction; local source owns persistence/rollback. | 180–280 / `037-timeline-gantt-port` |
| `GanttLinkHandler.ts:56-67` — right output to left input | `src/views/calendar-timeline-renderer.ts:158-170` — date/reorder action seam | Extend data graph/action layer; no direct local dependency renderer exists yet. | 180–260 / `037-timeline-gantt-port` |
| `gantt.css:1-17` — flex view, controls, wrapper | `styles.css:17126-17133` — timeline event grid variables | Rewrite CSS into the styles lane and local tokens. | 120–180 / `037-timeline-gantt-port` |

**Timeline estimate:** 1,100–1,500 LOC including adapter, date transaction/dependency helper,
renderer/CSS reconciliation, placement/teardown/screenshot tests. Landing packet:
`037-timeline-gantt-port`; it must leave `npm run gate` green independently.

## 2. BOARD / KANBAN

### What it is and the verified source contract

- The reference view clears its container, creates one column per configured status, and wires card
  click/context/drag/drop callbacks: `specs/context/obsidian-pm-main/src/views/KanbanView.ts:29-61`.
- It optionally flattens subtasks and lazily hydrates note descriptions:
  `specs/context/obsidian-pm-main/src/views/KanbanView.ts:63-83` — “candidates are flattened when `kanbanShowSubtasks`; pending bodies
  load, then the board renders again.”
- A drop that changes status updates the task once and refreshes:
  `specs/context/obsidian-pm-main/src/views/KanbanView.ts:158-165`.
- Card data includes people, priority color, preview, parent title, source slot, logged hours,
  overdue, and tag-color preference: `specs/context/obsidian-pm-main/src/ui/composites/KanbanColumn.ts:14-24`.
- The card presents parent/title/type chips/description/time/tags/progress/avatars/due:
  `specs/context/obsidian-pm-main/src/ui/composites/KanbanCard.ts:44-99`.
- Native drag writes a task id and removes dragging classes on end:
  `specs/context/obsidian-pm-main/src/ui/composites/KanbanCard.ts:100-117`.
- Columns are 280px, horizontally scrollable, with colored topbars, counts, vertical card scrolling,
  drop tint, and 8px card gaps: `specs/context/obsidian-pm-main/src/styles/kanban.css:13-85`.

### Local host, 1:1 range, and required differences

The host is `src/views/board-renderer.ts`. Its action contract already covers opening/creating rows,
group creation/update/order/hide/delete, path-based card ordering and cross-group moves, selection,
cell editing, summaries, conditional formatting, read-only, and group collapse (`:81-122`). Its
render lifecycle handles hidden groups, optional subgroups/swimlanes, empty slots, create controls,
and card roving (`:176-245`).

Adopt nearly 1:1: status-column information hierarchy; colored header/count; card priority strip,
parent/title/type chips, preview, time/tags/progress/people/due; hover/drag/drop visual language;
context menu and status move. Rewrite: task identity → `RowData.file.path`, status-only group → local
`groupField`, description loader → optional local source adapter, HTML5 task-id drop → local path and
batch-order transaction. Keep local WIP/visible counts, summaries/calculated fields, hidden groups,
swimlanes, collapse ARIA, empty/create behavior, multi-select, roving keyboard, edge auto-scroll,
blank-space drop fallback, and touch long-press/mobile actions. The reference has no evidence for
WIP, swimlanes, keyboard, or touch; these are local extensions, not source claims.

### Board module map and effort

| Ref file:line — short excerpt | Local module:line — short excerpt | Disposition / seam | LOC / packet |
|---|---|---|---|
| `KanbanView.ts:29-40` — clear and create board | `src/views/board-renderer.ts:176-201` — clear, touch mode, board, groups | Rewrite view lifecycle into local grouped board. | 80–120 / `038-board-kanban-port` |
| `KanbanView.ts:44-59` — one column per status plus callbacks | `src/views/board-renderer.ts:463-573` — render columns/header/actions | Adopt status default; retain arbitrary group/config and summaries. | 100–160 / `038-board-kanban-port` |
| `KanbanView.ts:63-74` — lazy description hydration | `src/views/board-renderer.ts:750-789` — RowData card and source path | Optional rewrite through row pipeline; no synchronous body reads. | 70–110 / `038-board-kanban-port` |
| `KanbanView.ts:158-165` — status update then refresh | `src/views/board-renderer.ts:90-99` — move/order callbacks | Extend to local cross-group/order/batch transaction. | 100–160 / `038-board-kanban-port` |
| `KanbanColumn.ts:14-24` — card data fields | `src/views/board-renderer.ts:750-789` — card row/open/menu contract | Adapt fields from RowData/computed values. | 90–140 / `038-board-kanban-port` |
| `KanbanColumn.ts:66-84` — construct cards in column | `src/views/board-renderer.ts:690-738` — cards container/drop handlers | Rewrite native DOM wiring; preserve local drop intent. | 120–180 / `038-board-kanban-port` |
| `KanbanColumn.ts:87-114` — dragover reorder/drop task id | `src/views/board-renderer.ts:720-736` — path-based move/order and feedback | Drop task-id-only callback; use path/batch-safe order. | 150–220 / `038-board-kanban-port` |
| `KanbanCard.ts:30-40` — draggable card and priority strip | `src/views/board-renderer.ts:750-782` — card role/path/conditional format | Rewrite card shell with local ARIA/path identity. | 100–160 / `038-board-kanban-port` |
| `KanbanCard.ts:44-73` — parent/title/M/Sub/R chips | `src/views/board-renderer.ts:750-789` — local card extension seam | Adopt information hierarchy; use local field renderers/i18n. | 100–160 / `038-board-kanban-port` |
| `KanbanCard.ts:75-99` — description/time/tags/progress/footer | `src/views/board-renderer.ts:750-789` — row detail/open/menu | Rewrite metadata against computed RowData; preserve summaries. | 150–230 / `038-board-kanban-port` |
| `KanbanCard.ts:100-117` — dragstart/end/click/context | `src/views/board-renderer.ts:790-828` — path payload, preview, auto-scroll, indicators | Rewrite input; retain richer local gesture handling. | 160–240 / `038-board-kanban-port` |
| `kanban.css:13-85` — 280px columns/header/count/drop tint | `styles.css:8857-8908` — flex board, 280px column, sticky header | Rewrite reference spacing into `--db-*` styles. | 100–160 / `038-board-kanban-port` |
| `kanban.css:87-155` — raised 112px cards/footer | `styles.css:9151-9187` — raised cards, hover, drag/drop | Align radius/shadow/padding; keep local cover/selection styles. | 120–180 / `038-board-kanban-port` |

**Board estimate:** 800–1,100 LOC including visual reconciliation, local group/WIP/swimlane
compatibility, drag/drop tests, keyboard/touch paths, and screenshot coverage. Landing packet:
`038-board-kanban-port`; it must gate independently.

## 3. CALENDAR

### What it is and the verified evidence boundary

There is no standalone reference calendar. `specs/context/obsidian-pm-main/src/types.ts:4-11`
defines only table, gantt, and kanban view modes. `specs/context/obsidian-pm-main/src/store/YamlHydrator.ts:51-76` hydrates only
those saved view types, and `specs/context/obsidian-pm-main/src/views/ProjectView.ts:403-419` switches among overview, table,
Gantt, and board. Any claim that the reference has a month/week/day calendar, calendar event bars,
or calendar drag is a finding against this lane.

The nearest verified date behavior is milestone ordering:
`specs/context/obsidian-pm-main/src/views/ProjectOverviewView.ts:244-255` filters milestone tasks,
parses due dates, sorts by due date, and separates completed/next milestones. Gantt headers supply
shared date-scale language (`specs/context/obsidian-pm-main/src/views/gantt/GanttHeaderRenderer.ts:25-45`), but remain Gantt evidence.

### Local host, 1:1 range, and required differences

The host is `src/views/calendar-renderer.ts`. It already declares open/create/update-scale actions
and read-only/invalid-event seams (`:75-92`), builds month grids with ARIA roles and keyboard wiring
(`:239-293`), caps visible month lanes with overflow (`:304-359`), and renders week/day all-day and
timed grids (`:619-681`, `:882-941`). It has move/resize previews, quick-add date/time ranges,
click suppression, and release updates (`:1488-1542`, `:1558-1642`, `:2070-2088`).

Adopt only verified reference semantics: completion-aware milestone treatment, date-boundary labels,
and the same calm density/empty-state language. Keep the local month/week/day layout, multi-day
segments, overflow/backlog, timed slots, quick-add, keyboard grid, touch behavior, invalid-event
repair, and source action contract. There is no source calendar module to copy; proposed parity is
behavioral and local. Share the date transaction helper with timeline where practical.

### Calendar module map and effort

| Ref file:line — short excerpt | Local module:line — short excerpt | Disposition / seam | LOC / packet |
|---|---|---|---|
| `types.ts:4-11` — modes stop at table/gantt/kanban | `src/views/calendar-renderer.ts:75-92` — local calendar action contract | Negative evidence; local renderer is the host, not a source port. | 40–70 / `039-calendar-parity-port` |
| `YamlHydrator.ts:51-76` — hydrate saved table/gantt/kanban views | `src/views/calendar-renderer.ts:239-276` — build month model/grid | Extend local view/config persistence; do not invent source calendar config. | 80–130 / `039-calendar-parity-port` |
| `ProjectView.ts:403-419` — overview/table/Gantt/board switcher | `src/views/calendar-renderer.ts:619-681` — week/day host | Add local calendar selection only where product config requires it. | 60–100 / `039-calendar-parity-port` |
| `ProjectOverviewView.ts:244-255` — filter/sort milestone due dates | `src/views/calendar-renderer.ts:239-293` — month anchor/today/grid | Rewrite completion-aware milestone ordering into local event adapter. | 80–120 / `039-calendar-parity-port` |
| `GanttHeaderRenderer.ts:48-75` — day labels/weekend headers | `src/views/calendar-renderer.ts:1701-1782` — local calendar headers/navigation | Borrow date-language intent; retain local month/week/day headers. | 100–150 / `039-calendar-parity-port` |
| `types.ts:4-11` — no source calendar drag contract | `src/views/calendar-renderer.ts:1033-1156` — month resize/move preview | Negative evidence; preserve local pointer implementation. | 120–180 / `039-calendar-parity-port` |
| `types.ts:4-11` — no source calendar keyboard/touch contract | `src/views/calendar-keyboard-navigation.ts:1-130` — grid navigation | Local implementation; source does not substantiate a copy. | 100–160 / `039-calendar-parity-port` |
| `ProjectOverviewView.ts:244-284` — done/next milestone timeline | `src/views/calendar-renderer.ts:157-180` — backlog/unscheduled path | Adapt marker/empty semantics; keep local backlog. | 80–120 / `039-calendar-parity-port` |

**Calendar estimate:** 900–1,400 LOC for the full parity merge, including shared date transaction,
calendar CSS, quick-add/move/resize tests, keyboard/touch, placement/teardown/screenshot lanes.
Landing packet: `039-calendar-parity-port`; it must gate independently.

## 4. SUBTASK MODEL

### What it is and the verified source contract

- The reference task is a recursive object with `type`, status/priority, start/due, progress,
  dependencies, `subtasks`, collapsed state, timestamps, and optional file path:
  `specs/context/obsidian-pm-main/src/types.ts:44-55` — “`subtasks: Task[]`; `dependencies: string[]`;
  `progress: number`; dates are empty strings when unset.”
- The project keeps top-level tasks and a non-serialized task index:
  `specs/context/obsidian-pm-main/src/types.ts:71-90` — “`tasks: Task[]` ... `taskIndex: TaskIndex`.”
- Index construction records each task's immediate parent while recursively walking children:
  `specs/context/obsidian-pm-main/src/store/TaskIndex.ts:10-19`.
- Flattening emits task, depth, parent id, and visible state, hiding descendants of collapsed parents:
  `specs/context/obsidian-pm-main/src/store/TaskTreeOps.ts:12-25`.
- Adding, updating, deleting, and sibling reorder are explicit tree operations:
  `specs/context/obsidian-pm-main/src/store/TaskTreeOps.ts:38-68` and `:108-121`.
- File hydration reads `subtaskIds` and `parentId` after mapping frontmatter:
  `specs/context/obsidian-pm-main/src/store/YamlHydrator.ts:127-138`.
- Serialization writes parent/child ids, progress, dependencies, and a readable parent/project link plus
  a checklist projection: `specs/context/obsidian-pm-main/src/store/YamlSerializer.ts:80-105` and `:126-141`.
- The panel displays done/total, maps checkbox to child status/progress, removes children, and adds a
  subtask on Enter: `specs/context/obsidian-pm-main/src/modals/SubtasksPanel.ts:23-48` and `:75-89`.

### Local host, 1:1 range, and required differences

This is a cross-layer port. The authoritative local shape remains one `RowData` per note:
`src/data/types.ts:158-169` — “`file`, `frontmatter`, `cache`, `computed`, `computedErrors`.” Add a
normalized relation/index in `src/data/*` with `parentId`, ordered `subtaskIds`, depth, ancestors,
visibility, cycle diagnostics, and explicit/derived progress distinction. Adapt rows into timeline,
board, calendar, and table/tree presentation; do not nest `RowData` as the persistence authority.

Adopt nearly 1:1: recursive parent/child semantics; expand/collapse; parent title/link; done/total;
inline Enter-to-add; parent picker; indent/outdent and sibling order; parent/child progress display;
subtree clone/move rules. Rewrite: in-memory tree splices → per-note frontmatter transaction; file path
and wiki-link resolution → `TFile.path`/local source identity; store calls → row/source pipeline;
body checklist → projection only. Keep local formulas, rollups, summaries, calculated fields, manual
order, i18n, selection, and surface-specific action contracts. Moving across parents must atomically
update child `parentId`, both parents' `subtaskIds`, order rank, index, and any affected derived rows;
reject descendant cycles and preserve external dependencies.

### Subtask module map and effort

| Ref file:line — short excerpt | Local module:line — short excerpt | Disposition / seam | LOC / packet |
|---|---|---|---|
| `types.ts:44-55` — recursive task fields and progress/dates | `src/data/types.ts:158-169` — flat RowData + computed values | Rewrite into normalized per-note relation; keep computed fields. | 120–180 / `040-subtask-tree-port` |
| `types.ts:71-90` — project task tree and taskIndex | `src/data/row-pipeline.ts:40-90` — pipeline diagnostics/output | Extend pipeline with relation/index stage; no nested RowData authority. | 140–220 / `040-subtask-tree-port` |
| `TaskIndex.ts:10-19` — recursive id→parent index | `src/data/types.ts:158-188` — row/file/position identity | Add pure index over row paths/frontmatter parent ids. | 120–180 / `040-subtask-tree-port` |
| `TaskTreeOps.ts:12-25` — depth/parent/visible flattening | `src/views/calendar-timeline-renderer.ts:391-445` — lanes/visible events | Adapt depth/visibility for timeline; preserve local lane limits. | 100–160 / `040-subtask-tree-port` |
| `TaskTreeOps.ts:38-68` — recursive add/update/delete | `src/data/row-pipeline.ts:40-90` — row output seam | Rewrite as source transaction and rehydrate affected rows. | 150–240 / `040-subtask-tree-port` |
| `TaskTreeOps.ts:108-121` — sibling-only before/after reorder | `src/views/board-renderer.ts:90-99` — move/order action contract | Reuse path-based before/after vocabulary; add parent updates. | 120–180 / `040-subtask-tree-port` |
| `YamlHydrator.ts:80-113` — scalar/progress/frontmatter mapping | `src/data/types.ts:158-169` — raw frontmatter + computed | Rewrite field normalization through local row pipeline. | 100–160 / `040-subtask-tree-port` |
| `YamlHydrator.ts:127-138` — `subtaskIds` and `parentId` | `src/data/types.ts:158-188` — row file and create context | Add normalized relation fields/diagnostics; preserve raw values. | 100–160 / `040-subtask-tree-port` |
| `YamlSerializer.ts:80-105` — parentId/subtaskIds/progress | `src/data/row-pipeline.ts:40-90` — pipeline boundary | Add serializer/source writer with atomic bidirectional update. | 160–240 / `040-subtask-tree-port` |
| `YamlSerializer.ts:126-141` — parent/project link + checklist | `src/views/board-renderer.ts:750-789` — card source/detail seam | Keep checklist as note projection; use local path-safe links. | 80–120 / `040-subtask-tree-port` |
| `SubtasksPanel.ts:23-48` — done/total and checkbox 100/0 | `src/views/board-renderer.ts:750-789` — card/detail extension point | Rewrite child status UI; distinguish explicit from derived progress. | 100–160 / `040-subtask-tree-port` |
| `SubtasksPanel.ts:75-89` — Enter creates inline child | `src/data/types.ts:176-188` — create position/context | Extend create action with parent path/id and pending-note state. | 100–160 / `040-subtask-tree-port` |
| `TitleCell.ts:22-48` — inline title and Add subtask | `src/views/board-renderer.ts:750-789` — card activation/menu | Rewrite tree affordance in local surface contract. | 100–160 / `040-subtask-tree-port` |
| `ExpandCell.ts:3-17` — collapse toggle callback | `src/views/calendar-timeline-renderer.ts:704-738` — local group collapse | Share accessible collapse primitive, but scope subtask state separately. | 80–120 / `040-subtask-tree-port` |

**Subtask estimate:** 700–1,000 LOC across normalized relation/index, hydrate/serialize, transaction
and cycle checks, row/tree presentation, editor/inline add, adapters, and tests. Landing packet:
`040-subtask-tree-port`; it must gate independently.

## 5. SHARED UI / UX

### What it is and the verified source contract

- Reference tokens establish font, text, ghost border, ambient shadow, and root overflow:
  `specs/context/obsidian-pm-main/src/styles/variables.css:1-9`.
- EmptyState is composable as icon/title/body/action:
  `specs/context/obsidian-pm-main/src/ui/primitives/EmptyState.ts:10-37`.
- IconButton exposes icon, tooltip, hover-only reveal, and click:
  `specs/context/obsidian-pm-main/src/ui/primitives/IconButton.ts:3-31`.
- Chip exposes label, color, variant, dot, and leading icon:
  `specs/context/obsidian-pm-main/src/ui/primitives/Chip.ts:3-40`.
- Popover mounts within modal when necessary, closes outside/Escape, repositions to viewport, and adds
  a phone-sheet class: `specs/context/obsidian-pm-main/src/ui/primitives/Popover.ts:14-24` and `:55-105`.
- Its sheet CSS caps height at 70vh, applies safe-area padding, and gates entrance animation on
  reduced-motion preference: `specs/context/obsidian-pm-main/src/styles/task-editor.css:1-20` and `:34-60`.
- Settings expose default view/editor/save behavior and Gantt/board choices:
  `specs/context/obsidian-pm-main/src/settings.ts:54-86`, `:133-179`.
- Chrome uses compact flex headers, segmented view switcher, muted typography, hover/focus active
  state, and centered empty state: `specs/context/obsidian-pm-main/src/styles/chrome.css:7-28`, `:124-170`.

### Local host, 1:1 range, and required differences

Rewrite source tokens into the local token lane: `styles.css:55-85` already carries the `--db-*`
typography, radius, border, surface, and spacing ladder. Rewrite primitives into local DOM builders
and renderers; local `src/views/CODE.md:16-24` requires flat concern-focused modules emitting `db-*`
classes styled by `styles.css`.

Adopt nearly 1:1: density, semantic roles, muted/accent hierarchy, chip/priority/type markers, compact
header/segmented controls, structured empty states, outside/Escape close, viewport-safe dimensions,
safe-area awareness, reduced-motion intent, visible hover/focus, settings discoverability, and
localized labels. Keep local bottom sheets: `src/views/mobile-bottom-sheet.ts:81-87, :423-426` binds the
gesture to the long-lived panel, and `:414-422, :488` implements a measured drag/flick dismissal with a
handle. The operator explicitly says ours is better here; the reference's no-handle phone Popover is
not to replace it. Keep local roving board keyboard (`src/views/card-roving-tabindex.ts:68-99`),
calendar grid keyboard, touch gates, portal/scrim/keyboard inset, cover/selection safety, and teardown.

### Shared UI module map and effort

| Ref file:line — short excerpt | Local module:line — short excerpt | Disposition / seam | LOC / packet |
|---|---|---|---|
| `variables.css:1-9` — font/text/border/shadow/root | `styles.css:55-85` — local type/radius/border/surface tokens | Rewrite semantic roles into `--db-*`; retain theme variables. | 80–120 / `041-shared-ui-ux-port` |
| `EmptyState.ts:10-23` — create icon/title/body | `src/views/empty-state-renderer.ts:25-57` — reason/options/actions | Merge composition into diagnostic-aware local empty states. | 80–130 / `041-shared-ui-ux-port` |
| `EmptyState.ts:32-37` — CTA button action | `src/views/empty-state-renderer.ts:39-57` — action descriptor | Rewrite through local i18n/read-only/create checks. | 50–80 / `041-shared-ui-ux-port` |
| `IconButton.ts:13-31` — icon/tooltip/reveal/click | `src/views/board-renderer.ts:750-789` — local card/action wiring | Use local icon/tooltip helpers and focus styles. | 60–100 / `041-shared-ui-ux-port` |
| `Chip.ts:25-40` — label/color/variant | `src/views/board-renderer.ts:782-789` — conditional/card detail seam | Align chip density/semantic variants; retain local field renderers. | 70–110 / `041-shared-ui-ux-port` |
| `Popover.ts:14-24` — modal host/focus-trap rationale | `src/views/mobile-bottom-sheet.ts:121-180` — portal/mount/scope | Borrow host/scope rationale; local portal lifecycle wins. | 100–160 / `041-shared-ui-ux-port` |
| `Popover.ts:55-77` — open/close listener ownership | `src/views/mobile-bottom-sheet.ts:183-201` — remove/restore/closed-owner path | Rewrite outside/Escape lifecycle into local overlay stack. | 100–160 / `041-shared-ui-ux-port` |
| `task-editor.css:1-20` — 70vh popover/reduced-motion animation | `styles.css:706-713` — reduced-motion media rule | Adopt cap/motion intent; do not replace local sheet. | 60–100 / `041-shared-ui-ux-port` |
| `task-editor.css:34-45` — 70vh safe-area sheet, no handle | `src/views/mobile-bottom-sheet.ts:81-87, :423-426` — handle gesture lives on panel | Drop no-handle presentation; keep local drag handle and safe area. | 80–130 / `041-shared-ui-ux-port` |
| `settings.ts:64-85` — default view/editor/save controls | `src/settings.ts:76-90` — local settings display lifecycle | Rewrite settings vocabulary into local database settings. | 100–160 / `041-shared-ui-ux-port` |
| `settings.ts:133-179` — Gantt/board display toggles | `src/data/types.ts:373-466` — ViewConfig board/timeline fields | Extend local config/i18n; do not clone reference persistence. | 80–130 / `041-shared-ui-ux-port` |
| `chrome.css:124-150` — segmented view switcher active state | `src/views/toolbar-renderer.ts:2067-2070` — expanded state helper | Align active/focus language with local toolbar. | 80–120 / `041-shared-ui-ux-port` |
| `chrome.css:158-170` — centered empty state | `src/views/empty-state-renderer.ts:143-150` — shared copy catalog | Preserve local reason precedence and starter presets. | 50–90 / `041-shared-ui-ux-port` |

**Shared UX estimate:** 650–950 LOC including token/primitive reconciliation, motion/focus/touch
tests, settings/i18n, sheet boundaries, and placement/teardown/screenshot lanes. Landing packet:
`041-shared-ui-ux-port`; it must gate independently.

## Cross-surface integration seams and rewrite standard

The port packets should land in this order and use the same seams:

1. `RowData`/frontmatter: all surfaces consume `src/data/types.ts:158-169`; source note identity is
   a `TFile` path plus raw frontmatter, while computed/derived values remain owned by the data layer.
2. `ViewConfig`: timeline/calendar/board settings extend `src/data/types.ts:373-466`; source settings
   become local config/i18n, not a second persistence format.
3. Surface contracts: timeline actions are `src/views/calendar-timeline-renderer.ts:150-183`, board
   actions `src/views/board-renderer.ts:81-122`, and calendar actions `src/views/calendar-renderer.ts:75-92`.
   Every write goes through these seams so read-only, source identity, error handling, and calculated
   values remain consistent.
4. Subtask relation: add a DOM-free normalized relation/index in `src/data/*`, hydrate/serialize
   frontmatter per note, and adapt depth/visibility into each surface. Do not make renderers own the
   graph.
5. Sheet/overlay: keep `src/views/mobile-bottom-sheet.ts` for phone portals, scrim, safe-area,
   keyboard inset, drag handle, and teardown. Source Popover's outside/Escape/focus behavior informs
   local overlays but does not replace the sheet.
6. Styles: rewrite source CSS into the single `styles.css` lane, using existing `--db-*` tokens and
   `.note-database-container`/surface selectors. Do not create a parallel stylesheet or leave source
   class names as an accidental public contract.
7. Code shape: each landing module keeps a MODULE banner, numbered sections, clean comments, local
   imports, and i18n. No packet ids, spec paths, or requirement ids belong in product comments.
8. Verification: each packet runs its own placement, teardown, screenshot, accessibility, keyboard,
   touch, and `npm run gate` checks. This research phase did not run those commands because the user
   reserved the lineage write surface for research artifacts.

### Copy / rewrite / drop policy

| Disposition | Meaning in the adopting packets |
|---|---|
| `rewrite` | Default for all findings here: reproduce behavior and visual contract in local TypeScript/CSS, with local data/actions/i18n/lifecycle. |
| `copy-verbatim-with-MIT-notice` | Not used by this catalog. If a later packet chooses it for a substantial code/CSS portion, it must place the complete MIT notice from `specs/context/obsidian-pm-main/LICENSE:1-21` at the landing point. |
| `drop` | Reference implementation detail that conflicts with local strengths or is unsupported by source evidence: eager Gantt rendering, task-id-only drop, no-handle phone sheet, source-only table/calculation assumptions, and fictional calendar files. |

No reference product source or CSS block was copied into this lineage.

## Operator report accounting (29–33)

The operator checklist names reports 029 numeric coercion, 030 gallery deprecation, 031 sheet lifecycle
ownership, and 033 list virtualization (`specs/005-component-surface-system/operator-checklist.md:129-146`).
Report 032 is the cover-target scheme-safety boundary in the parent packet. The mapping below labels
direct candidates separately from negative/compatibility constraints.

| Report | Harvest candidate / boundary | Evidence and adopting packet |
|---|---|---|
| 029 numeric coercion parity | Preserve numeric frontmatter/progress and time values while adapting task fields; never parse display text into numbers. | `specs/context/obsidian-pm-main/src/store/YamlHydrator.ts:80-113` — numeric progress is accepted as a number; local `src/data/types.ts:158-169` keeps raw/computed separation. Answered by `037-timeline-gantt-port`, `038-board-kanban-port`, and `040-subtask-tree-port`. |
| 030 gallery view deprecation | Compatibility boundary: reference saved views enumerate table/Gantt/Kanban only, so no gallery behavior should be revived by this port; local legacy/migration handling remains local. | `specs/context/obsidian-pm-main/src/types.ts:4-11` and `:51-76`; local `src/data/types.ts:407-418`/view config. Answered as a drop/compatibility rule by `038-board-kanban-port` and `041-shared-ui-ux-port`, not as a borrowed gallery pattern. |
| 031 sheet lifecycle ownership | Borrow outside/Escape/focus-trap intent; keep local portal, scrim, keyboard inset, long-lived panel listener, handle, and drag/flick teardown. | `specs/context/obsidian-pm-main/src/ui/primitives/Popover.ts:55-77`; local `src/views/mobile-bottom-sheet.ts:81-87, :423-426` and `:414-422, :488`. Answered by `041-shared-ui-ux-port`. |
| 032 cover-target scheme safety | Negative candidate: reference KanbanCard has no cover-rendering path; do not infer a source cover selector. Local cover target must keep explicit scheme blocking, keyboard activation, alt/ARIA, and `styles.css` scoping. | `specs/context/obsidian-pm-main/src/ui/composites/KanbanCard.ts:75-99` has metadata but no cover branch; local `src/views/board-renderer.ts:953-990` explicitly blocks unsafe covers and adds role/label/keyboard. Answered as a local safety boundary by `038-board-kanban-port`. |
| 033 list virtualization | Preserve local visible-window, group row limits, overflow/backlog, and observer strategy; reference Gantt eagerly sizes all rows and reference Kanban eagerly constructs cards. | `specs/context/obsidian-pm-main/src/views/gantt/GanttView.ts:185-190`; `specs/context/obsidian-pm-main/src/ui/composites/KanbanColumn.ts:66-85`; local `src/views/calendar-timeline-renderer.ts:300-345` and `src/views/board-renderer.ts:341-355`. Answered by `037-timeline-gantt-port` and `038-board-kanban-port`. |

## Final adoption plan (ordered)

| Order | Proposed phase packet and scope | 1:1 target | Must differ / keep local | Estimated port LOC | Gate order |
|---:|---|---|---|---:|---|
| 1 | `037-timeline-gantt-port`: reference range/scale/header/grid/bar/milestone/progress/drag/link UX into `calendar-timeline-renderer.ts`, timeline data adapter, shared date transaction, and `styles.css`. | Very high for timeline topology, zoom, today, bars, dependencies, save-on-release. | `RowData`/ViewConfig/action writes; local viewport/observer/backlog/invalid events/touch/keyboard; no eager SVG. | 1,100–1,500 | adapter/unit tests → placement/teardown → keyboard/touch → screenshot scales → `npm run gate` |
| 2 | `038-board-kanban-port`: status-column/card hierarchy, metadata, card CSS, hover/drop language, optional description preview into `board-renderer.ts`/`styles.css`. | Very high for visual board and default status flow. | local group fields, WIP/visible counts, swimlanes, summaries/calcs, selection, batch/path order, blank-space fallback, roving/touch/cover safety. | 800–1,100 | group/card contract → drop matrix → keyboard/touch/cover → screenshot → `npm run gate` |
| 3 | `039-calendar-parity-port`: merge verified milestone/date wording and shared date transaction into existing `calendar-renderer.ts`; no source calendar file to port. | Behavioral parity for date language, completion-aware milestones, density, empty states. | local month/week/day, timed/all-day, multi-day, overflow/backlog, quick-add, drag/resize, keyboard/touch, invalid events. | 900–1,400 | event adapter → month/week/day placement → drag/resize/quick-add → screenshot/accessibility → `npm run gate` |
| 4 | `040-subtask-tree-port`: normalized parent index, `parentId`/`subtaskIds` hydrate/serialize, cycle-safe move/reorder, depth/expand UI, editor/inline add, progress display. | Very high for parent/child shape and interactions. | per-note frontmatter, `TFile` identity, source/row pipeline, explicit-vs-derived progress, local formulas/rollups/summaries/order. | 700–1,000 | relation fixtures → atomic parent move → row/timeline/board adapters → editor/mobile → `npm run gate` |
| 5 | `041-shared-ui-ux-port`: semantic tokens, primitive density, empty/focus/hover, settings, motion/reduced motion, accessibility, and cross-surface polish. | High for visual language and overlay behavior. | local `styles.css`, i18n, overlay stack, bottom-sheet handle/drag/scrim/keyboard lifecycle, roving keyboard and touch gates. | 650–950 | token/primitive tests → focus/reduced-motion → phone sheet lifecycle → screenshots → `npm run gate` |

### Do-not-borrow list

1. **Table view — stay ours.** The operator says our table is better, and the local data/view
   pipeline already owns richer columns, formulas, computed values, summaries, selection, and row
   editing. Porting the reference's table would discard this advantage and is outside the requested
   surface set. [INFERENCE: operator directive] [SOURCE: src/data/CODE.md:16-24]
2. **Bottom sheets — stay ours.** The reference Popover's 70vh cap, safe-area padding, and
   outside/Escape behavior are useful comparison points, but its phone presentation has no drag
   handle. Local `mobile-bottom-sheet.ts` keeps the panel alive across rebuilds and implements a
   measured handle drag/flick, scrim, portal, keyboard inset, and cleanup. The operator explicitly
   says ours is better here. [SOURCE: specs/context/obsidian-pm-main/src/styles/task-editor.css:34-45]
   [SOURCE: src/views/mobile-bottom-sheet.ts:81-87, :423-426] [SOURCE: src/views/mobile-bottom-sheet.ts:414-422, :488]
3. **Formulas, rollups, summaries, and calculations — stay ours.** They are the local strength and
   must remain the source of truth for computed display values, progress/summary policy, numeric
   coercion, and relation outputs. Reference task progress/card metadata can inform presentation only;
   it cannot replace local calculation semantics. [INFERENCE: operator directive] [SOURCE: src/data/types.ts:158-169]

## Loop telemetry and verification

- Iterations recorded: **20/20** (`iterations/iteration-001.md` through `iteration-020.md`).
- Stop policy: **max-iterations**; convergence was telemetry only and did not trigger early synthesis.
- New-information ratios: `1.00, .92, .88, .82, .78, .74, .68, .64, .58, .54, .50, .46, .42, .38,
  .34, .30, .26, .22, .18, .14`.
- Native detached CLI startup was blocked by the outer app-server permission boundary; the packet-
  local loop preserved executor metadata and completed the requested source-cited iterations through
  the gateway. No product files were modified and no browser claims were made.
- Citation spot-check: `spot-check.md` records **10/10 PASS** from current-disk reads of source lines
  covering timeline geometry, Gantt lifecycle/drag, Kanban columns/cards, task index, serialization,
  inline subtasks, and the MIT notice.
- The final artifacts are deliberately under this lineage root only: iteration markdown, event JSON,
  deltas, gateway ledgers/projection, reducer registry/dashboard/resource map, this report, and the
  convergence/spot-check records.

---

_2026-09-02 correction: two citations of `src/views/mobile-bottom-sheet.ts` were wrong and have been repointed against the current file — the handle/gesture window was `:304-318` (that is `watchForSheetRemoval`, a `MutationObserver`) and is now `:81-87` (`createSheetHandle`) with `:423-426` (`attachSheetDragToDismiss` adopting or creating the handle and binding to the panel); the flick window was `:385-455` (which opens on threshold constants) and is now `:414-422` (`shouldFlickDismiss`) with `:488` (its application in the pointerup path). No other claim was changed._
