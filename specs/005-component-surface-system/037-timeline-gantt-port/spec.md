---
title: "Feature Specification: Timeline/Gantt Port [template:level-2/spec.md]"
description: "Port obsidian-pm's timeline/Gantt geometry, scale controls, header/grid, bars, drag and dependency-link UX near one-to-one into calendar-timeline-renderer.ts, rewritten to this repo's RowData/ViewConfig/action contracts and db-* CSS lane."
trigger_phrases:
  - "timeline gantt port"
  - "037 timeline port"
  - "obsidian pm timeline harvest"
  - "timeline renderer port"
importance_tier: "important"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Timeline/Gantt Port

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | **Reopened 2026-09-04 for a 1:1 gantt copy at the operator's request** — the landed legs (`0262386`, `55bff9b`) and their open-row fixes rewrote the reference's behavior contract into local geometry rather than reproducing `GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/`TimelineConfig.ts`'s DOM structure and class vocabulary, which the operator judged not close enough on a side-by-side comparison against obsidian-pm 2.1.0 installed beside this plugin ("Same for timeline", same minute as the board directive). REQ-007 below supersedes the prior rewrite-only disposition for structure and visual language; local extensions now default off. Prior state: landed and verified in `0262386` + `55bff9b`, release 1.4.4 released, then 1.4.9/1.4.10 resolved all four open defect rows found in verification round nine (header/axis mismatch, zero-width mount fallback, span-in-button nesting, overlapping link dots, low-contrast progress-fill meta, milestone-label overpaint, clipped leading axis label, unusable day/year scale at phone width, a harness padding note, and the pre-existing duplicated `.is-all-day` CSS block), per `goal.md` §3. A DOM-structure parity test against the reference's `GanttView` output shape is owed before any port line lands (plan.md). Not operator-confirmed. |
| **Created** | 2026-09-02 |
| **Branch** | none (skip-branch) |
| **Parent Spec** | `../spec.md` |
| **Phase** | 37 of the component surface system's numbered children |
| **Predecessor** | `../036-obsidian-pm-ui-harvest/spec.md` |
| **Successor** | `038-board-kanban-port` (not yet opened) |
| **Handoff Criteria** | The catalog's adoption-plan row 1 (`research/research.md` "Final adoption plan") names this packet the first of five surface ports; its own gate must pass green independently before `038` starts. |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is the first landing packet named by `036-obsidian-pm-ui-harvest`'s adoption plan. `research/research.md`
"1. TIMELINE / GANTT" and its "Final adoption plan" row 1 are the source of every citation below.

**Scope Boundary**: Only the timeline/Gantt surface — `src/views/calendar-timeline-renderer.ts`, the timeline
data adapter (`src/data/calendar-timeline-model.ts`), the shared date transaction
(`src/data/calendar-interaction-model.ts`), and `styles.css`'s `db-timeline-*` rules. Board, calendar, subtask
and shared-UI ports are `038`-`041`, opened separately.

**Dependencies**:
- `036-obsidian-pm-ui-harvest/research/research.md` — module map, module map effort table, and adoption plan
  row 1, all cited by `file:line` in Section 3 and Section 4 below.
- `specs/context/obsidian-pm-main` stays present and read-only for the duration of this port; it is the
  citation source, never a write target.

**Deliverables**:
- Rewritten `calendar-timeline-renderer.ts` geometry, controls, header/grid, bar/milestone rendering, and
  save-on-release drag, matching the reference's behavior contract while keeping every local requirement
  named in Section 3 "Must differ / keep local".
- A cycle-safe dependency-link data seam (none exists locally yet; Section 3 names the new seam).
- `styles.css` `db-timeline-*` rules reconciled against the reference's visual hierarchy, under the lane
  protocol in `plan.md` §4.

**Changelog**:
- When this phase closes, refresh the matching file in `../changelog/` using the parent packet number plus
  this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

`src/views/calendar-timeline-renderer.ts` (2,390 lines) already owns an action contract, CSS-unit geometry,
visible-window rendering, and teardown, but its zoom-level controls, header band language, milestone/due-only
bar treatment, and save-on-release drag/link interactions were built without a systematic reference to
`obsidian-pm-main`'s Gantt view, which the operator has already flagged as solving the same problems well.
`036-obsidian-pm-ui-harvest` closed with a cited module map for this surface; nothing has yet ported it.

### Purpose

Rewrite the reference's timeline/Gantt behavior contract — geometry constants, five-level scale controls,
header/grid bands, due-only/milestone/progress bars, save-on-release drag, and cycle-safe dependency
linking — into `calendar-timeline-renderer.ts`'s existing `RowData`/`ViewConfig`/action pipeline, keeping
every local strength (visible-window rendering, unscheduled backlog, invalid-event repair, group/limit
handling, touch menu, keyboard, teardown) that the reference does not have or does worse.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope — module map (ref file:line -> local file:line, disposition)

Source: `specs/005-component-surface-system/036-obsidian-pm-ui-harvest/research/research.md:91-109` (Timeline
module map table) and `:45-71` (verified source contract). Local file:line confirmed by direct read on
2026-09-02.

| Ref file:line | Local file:line | Disposition |
|---|---|---|
| `obsidian-pm-main/src/views/gantt/TimelineConfig.ts:5-9` (`ROW_HEIGHT`, `HEADER_HEIGHT`, `LABEL_WIDTH`) | `src/views/calendar-timeline-renderer.ts:317-318` (`--db-timeline-units`, `--db-timeline-unit-width`) | Rewrite constants as local CSS custom properties; preserve scale geometry |
| `TimelineConfig.ts:36-45` (collect task start/due dates) | `src/data/calendar-timeline-model.ts` `buildTimelineModel` (invoked at `calendar-timeline-renderer.ts:300-304`) | Extend local model with reference padding/min-span semantics; keep visible-window measurement |
| `TimelineConfig.ts:79-85` (date<->x conversion) | `calendar-timeline-renderer.ts:647-655` region (exact offset/width CSS props, see `getTimelineTimedPositionStyle` at `:80-101`) | Rewrite into local unit math; preserve minimum usable width |
| `GanttView.ts:75-84` (cleanup, cancel link, empty, render) | `calendar-timeline-renderer.ts:254-274` | Merge lifecycle; local teardown wins |
| `GanttView.ts:95-106` (five-level controls) | `calendar-timeline-renderer.ts:832-854` | Rewrite controls into local i18n/navigation contract |
| `GanttView.ts:124-135` (left panel and resizer) | `calendar-timeline-renderer.ts:312-345` (root, status, axis/body build) | Extend local shell; do not introduce a second view class |
| `GanttView.ts:185-190` (eager SVG height for all rows) | `calendar-timeline-renderer.ts:391-445` (lane/visible-event window build, confirmed by direct read) | Drop eager strategy; retain local visible counts/lanes and accessibility |
| `GanttRenderer.ts:30-40` (weekend/Monday/month grid decisions) | `calendar-timeline-renderer.ts:344-389` (axis bands/ticks/current marks, confirmed) | Rewrite grid into local tick DOM/CSS |
| `GanttRenderer.ts:90-109` (today line and sticky cap) | `calendar-timeline-renderer.ts:447-452` (today marker, confirmed by direct read) | Merge today marker with local visible-window positioning |
| `GanttHeaderRenderer.ts:48-75` (day headers/weekend fills/day labels) | `calendar-timeline-renderer.ts:865-885` (scale buttons/pressed state) | Rewrite header labels through local timeline header and i18n |
| `GanttTaskBarRenderer.ts:20-27` (empty row target when no dates) | `calendar-timeline-renderer.ts:306-309` (no-events then backlog, confirmed) | Merge unscheduled affordance; keep local backlog |
| `GanttTaskBarRenderer.ts:51-58` (due-only one-day width) | `calendar-timeline-renderer.ts:647-655` (minimum unit/width) | Rewrite date adapter; retain usable minimum |
| `GanttTaskBarRenderer.ts:76-117` (progress fill and metadata title) | `calendar-timeline-renderer.ts:586-614` | Map status/progress/assignee/date metadata; keep calculated values local |
| `GanttTaskBarRenderer.ts:119-146` (edge handles) | `calendar-timeline-renderer.ts:1430-1440, :1443-1460` (`beginTimelineTimeDrag` dispatch and drag start, confirmed) | Rewrite handles as local buttons/ARIA; retain touch alternative |
| `GanttDragHandler.ts:48-58` (save once on release) | `calendar-timeline-renderer.ts:1443-1460` and `src/data/calendar-interaction-model.ts:50-80` (`resolveTimedDragRange`, confirmed) | Share release-time date transaction; local source owns persistence/rollback |
| `GanttLinkHandler.ts:56-67`, `:77-97` (two-click finish-to-start link, cycle rejection) | `calendar-timeline-renderer.ts:158-170` (date/reorder action seam) | Extend data graph/action layer; no direct local dependency renderer exists yet — new seam |
| `gantt.css:1-17`, `:237-277` | `styles.css:16759-16760` (`--db-timeline-unit-width`, `--db-timeline-content-width` definitions, confirmed by direct read; corrects the catalog's `:17126-17133` citation, which resolves to unrelated group-toggle hover CSS) | Rewrite CSS into the styles lane and local tokens |

### Must differ / keep local (binding, from `research/research.md:81-87`)

Adopt near 1:1: five zoom levels, padded date range, date-boundary labels, split label/time hierarchy,
sticky axis, weekend/grid/today language, due-only/milestone/progress/label affordances, save-on-release
move/resize, cycle-safe dependency linking.

Keep local, never drop: `Task` -> `RowData` adapter and plugin-store writes -> local action/data pipeline
(rewrite, not replace); visible-window rendering (`calendar-timeline-renderer.ts:391-445`), unscheduled
backlog (`:306-309`, `:345`), invalid-date repair, group/WIP-like limits (`getGroupVisibleCount`, `:412-414`),
touch menu, keyboard, and observer teardown (`:254-274`). The reference has no virtualization; local viewport
and lane limits are not to be dropped.

### Out of Scope

- Table view, bottom sheets, and formulas/rollups/calcs — the program-wide do-not-borrow list
  (`036-obsidian-pm-ui-harvest/research/research.md:404-419`). Our implementation stays authoritative for all
  three.
- Board, calendar, subtask and shared-UI ports (`038-board-kanban-port` through `041-shared-ui-ux-port`) —
  separate packets per the adoption plan's ordering.
- Eager SVG height-for-all-rows rendering (`GanttView.ts:185-190`) — explicit `drop` disposition in
  `research/research.md:375`; conflicts with local virtualization.
- Editing `specs/context/obsidian-pm-main` — read-only citation source.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/calendar-timeline-renderer.ts` | Modify | Rewrite controls, header/grid, bar/milestone rendering, drag/resize handles, and link seam per the module map above |
| `src/data/calendar-timeline-model.ts` | Modify | Extend `buildTimelineModel` with reference padding/min-span semantics; add dependency-link data shape |
| `src/data/calendar-interaction-model.ts` | Modify | Extend the shared drag/resize transaction with cycle-safe link resolution (finish-to-start, same-side/duplicate/missing-task/cycle rejection) |
| `styles.css` | Modify | Reconcile `db-timeline-*` rules against reference visual hierarchy, under the `css-lane` protocol |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Every module-map row in Section 3 is rewritten (never copied) into `calendar-timeline-renderer.ts`, `calendar-timeline-model.ts`, or `calendar-interaction-model.ts`, preserving the ref behavior named in `research/research.md:45-71` and the local seams confirmed at the file:lines above. |
| REQ-002 | The dependency-link seam (`GanttLinkHandler.ts:56-67`, `:77-97`) is implemented as a new local data/action seam off `calendar-timeline-renderer.ts:158-170`, rejecting same-side, duplicate, missing-task, and cycle links, with no direct local dependency renderer existing before this packet. |
| REQ-003 | Visible-window rendering (`calendar-timeline-renderer.ts:391-445`), unscheduled backlog, invalid-event repair, and group/lane limits are unchanged in behavior after the port; the reference's eager-SVG strategy (`GanttView.ts:185-190`) is not adopted. |
| REQ-004 | No spec path, phase number, task id, or requirement id appears in any code comment this phase writes (Comment Hygiene HARD BLOCK). |
| REQ-007 | **Amendment 2026-09-04 (operator directive, verbatim: "Same for timeline", following the same-minute board directive).** The timeline view renders as a one-to-one copy of obsidian-pm's gantt: the same DOM structure and class vocabulary as `src/views/gantt/GanttView.ts`, `GanttHeaderRenderer.ts`, `GanttTaskBarRenderer.ts` and `TimelineConfig.ts` (mapped to `RowData`), the same visual language as `src/styles/gantt.css` copied verbatim where the reference's rules apply (MIT notice attached to the copied block), the same header/scale language, bars, milestones, progress, dependency arrows, drag and resize behaviour, and the same defaults for row height and unit widths. Local extensions (visible-window rendering, unscheduled backlog, invalid-event repair, group/lane limits, touch menu, keyboard link buttons, the viewport-centred window) stay in the code but render only where the reference has an equivalent or behind a setting, **default off** — so the default timeline is indistinguishable from the reference apart from data. This supersedes the prior "rewrite (never copied)" disposition (REQ-001 above and every module-map row in §3) for structure and visual language specifically; REQ-002 (dependency-link seam) and REQ-003 (local-extension preservation, now behind a default-off setting) are unchanged. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | `styles.css` `db-timeline-*` rules are reconciled against `gantt.css:1-17`, `:237-277` visual hierarchy through the `css-lane` acquire/release protocol, with a recapture read before release. |
| REQ-006 | `npm run gate` passes green for this packet independently, without depending on `038`-`041` landing first. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `calendar-timeline-renderer.ts`'s zoom controls, header/grid, bar/milestone rendering, and
  save-on-release drag match the reference's behavior contract (Section 3), verified by placement/teardown,
  keyboard/touch, and screenshot checks at all five scales.
- **SC-002**: The dependency-link seam rejects same-side, duplicate, missing-task, and cycle links, matching
  `GanttLinkHandler.ts:56-67`, `:77-97`.
- **SC-003**: `npm run gate` reports `gate: PASS` and exit 0 for this packet's changed files.
- **SC-004** (REQ-007, added 2026-09-04): A DOM-structure parity test that walks the reference's
  `GanttView` output shape passes against our timeline renderer, and every local extension named
  in REQ-007 renders default-off unless a setting is turned on.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `036-obsidian-pm-ui-harvest/research/research.md` staying accurate | A stale citation propagates into product code | Every claim in Section 3 was independently re-verified by direct read on 2026-09-02; one citation (`gantt.css` -> `styles.css:17126-17133`) was found wrong and corrected here to `:16759-16760` |
| Risk | `styles.css` is lane-held | An unclaimed edit is refused by gate lane `css-lane` | Acquire `tools/lane/css-lane.json` before editing, release after a read recapture, per `plan.md` §4 |
| Risk | No local dependency-link renderer exists yet | The link seam is new surface, not a like-for-like port | REQ-002 scopes it explicitly as a new seam, tested against the reference's four rejection cases |
| Dependency | `specs/context/obsidian-pm-main` staying present and unedited | Citations become unverifiable if the source moves | Read-only reference tree; this packet never writes to `specs/context/` |
| Risk (added 2026-09-04) | REQ-007's verbatim CSS copy narrows the local action contract's *visibility* by default while the code stays present | An operator or a downstream reader could mistake "default off" for "removed" | REQ-007 states explicitly that every named local extension stays in the code and gains a setting; `acceptance-criteria.md` AC-007 checks the setting exists and defaults off |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The reference has no virtualization (`GanttView.ts:185-190` is eager). Local visible-window
  rendering and lane limits must not regress at any of the five scales after the port.

### Security
- **NFR-S01**: No code from `obsidian-pm-main` lands verbatim without its MIT notice; this packet's
  disposition is `rewrite` for every row, per `research/research.md:373-375`.

### Reliability
- **NFR-R01**: Save-on-release drag (REQ-001) must not leave a partial date write on interrupted drag;
  the reference commits dates once on release (`GanttDragHandler.ts:48-58`), and local source owns
  persistence/rollback.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A row with only a due date (no start): render as a due-only one-day bar, per `GanttTaskBarRenderer.ts:51-58`
  and the local minimum-width guard at `calendar-timeline-renderer.ts:647-655`.
- A dependency link attempted same-side, duplicate, to a missing task, or forming a cycle: rejected, per
  `GanttLinkHandler.ts:77-97`.

### Error Scenarios
- Invalid-date events (start >= end): must still be hidden from the timeline and surfaced for repair, matching
  existing local behavior (`isInvalidEventRange` in `calendar-timeline-model.ts`); the reference has no
  equivalent, so this stays a local-only requirement, not a port target.
- Concurrent styles.css edit from a sibling lane: refused by `css-lane` gate; acquire before editing.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 20/25 | 4 files, ~1,100-1,500 LOC estimated (`research/research.md:111-113`) |
| Risk | 15/25 | Lane-held CSS file, new dependency-link seam, no existing local renderer for links |
| Research | 10/20 | Module map and behavior contract already cited by `036`; this packet verifies, not discovers |
| **Total** | **45/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 10. OPEN QUESTIONS

- Whether the dependency-link seam persists as note frontmatter or a derived/computed field — left to
  `plan.md`'s adapter step, since neither obsidian-pm-main nor this repo's current `RowData` shape commits to
  one; the answer must not block the port of geometry/controls/bars, which have no such ambiguity.
- Whether `040-subtask-tree-port`'s relation/index work overlaps the dependency-link seam enough to share a
  data structure — flagged for the packet author of `040` to check against this packet's link seam once both
  exist; not a blocker for this phase, since this phase's link seam is scoped to timeline-only edges.
<!-- /ANCHOR:questions -->
