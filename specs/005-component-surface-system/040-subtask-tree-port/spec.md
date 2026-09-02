---
title: "Feature Specification: Subtask Tree Port"
description: "Port obsidian-pm-main's recursive subtask model - normalized parent index, parentId/subtaskIds hydrate and serialize, cycle-safe move and reorder, depth and expand UI, inline add, progress display - into this repo's per-note frontmatter model, near one-to-one."
trigger_phrases: ["subtask tree port", "040 subtask", "parentId subtaskIds", "cycle safe reorder", "subtask progress display"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/040-subtask-tree-port"
    last_updated_at: "2026-09-02T23:59:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Packet opened from 036's adoption plan row 4"
    next_safe_action: "Write the relation-fixture check that fails on the current renderer (plan.md step 1)"
    blockers: []
    key_files: ["spec.md", "goal.md", "plan.md", "acceptance-criteria.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-040"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Subtask Tree Port

> Phase chain: parent [`../spec.md`](../spec.md). Sibling research
> [`../036-obsidian-pm-ui-harvest/research/research.md`](../036-obsidian-pm-ui-harvest/research/research.md)
> §4 SUBTASK MODEL, promoted from the `luna-max-fast-pm-harvest` lineage. Predecessor in the adoption
> order: [`../039-calendar-parity-port`](../039-calendar-parity-port) (order 3, not yet opened).
> Successor: [`../041-shared-ui-ux-port`](../041-shared-ui-ux-port) (order 5, not yet opened).

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

This phase ports `obsidian-pm-main`'s recursive subtask model near one-to-one into this repo's per-note
frontmatter model, per `../goal.md` D4 (port, not inspiration) and D5 (our formulas, rollups, summaries
and calculations stay ours). The reference keeps a nested `Task.subtasks: Task[]` tree in memory plus a
derived `TaskIndex`; this repo keeps one `RowData` per note, so the port adds a normalized parent
index in `src/data/*` — `parentId`, ordered `subtaskIds`, depth, ancestors, visibility and cycle
diagnostics — hydrated from and serialized back to per-note frontmatter, never a second persistence
authority. `RowData` itself does not gain a nested `subtasks` field.

**Key decisions**: the relation is a derived index over `RowData[]`, not a field nested on `RowData`
(REQ-001); every write goes through a single transaction helper that updates both parents' `subtaskIds`,
the child's `parentId`, order rank and affected derived rows atomically, and rejects a move that would
create a cycle (REQ-002, REQ-003); explicit progress (author-set) and derived progress (computed from
children) are tracked as distinct fields, never conflated (REQ-004); local formulas, rollups, summaries,
calculated fields, manual order, i18n, selection and each surface's own action contract are unmodified
by this port (REQ-007).

**Critical dependencies**: `src/data/types.ts` (`RowData`, `ViewConfig`), `src/data/row-pipeline.ts`
(row build/diagnostics pipeline this phase extends with a relation stage), `src/data/manual-order.ts`
(the base62 rank scheme sibling reorder reuses), and the three consuming renderers
(`src/views/board-renderer.ts`, `src/views/calendar-timeline-renderer.ts`, table/tree presentation)
that adapt depth/visibility without owning the graph (research §"Cross-surface integration seams").

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-02 |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | `../039-calendar-parity-port/spec.md` (not yet opened) |
| **Successor** | `../041-shared-ui-ux-port/spec.md` (not yet opened) |

**On the declared level.** `recommend-level.sh --loc 850 --files 8` returns **Level 1** at 43/100,
confidence 80% (LOC +33, files +10, no auth/api/db/architectural flag) — see the run transcript in
`plan.md` §1. The adoption plan's own estimate for this packet is **700-1,000 LOC**
(`../036-obsidian-pm-ui-harvest/research/research.md:279-281`, "Subtask estimate"), which sits inside
folder-structure.md §3's own Level 3 bucket (>= 500 LOC), not Level 1's (< 100 LOC). The scorer's
100-point formula under-weights LOC in this band; per the dispatch instruction ("when its answer and
your judgment differ, go higher") and per folder-structure.md's own threshold table, this packet
declares **Level 3**. The work also crosses an architectural seam — a new normalized relation/index
lives beside the existing per-note `RowData` model and is consumed by three renderers under one
atomic-transaction contract — which is exactly the class of change `decision-record.md` exists to
record.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

This repo has no subtask/hierarchy concept today: `grep -rn "parentId\|subtaskIds\|hierarchy" src/data/`
returns zero matches, and `RowData` (`src/data/types.ts:158-169`) is a flat `{ file, frontmatter, cache,
computed, computedErrors }` per note with no parent/child relation, depth, or cycle protection. The
reference plugin at `specs/context/obsidian-pm-main` solves recursive parent/child tasks, sibling
reorder, expand/collapse, inline add and done/total progress display, and the operator's own rescope
(`../036-obsidian-pm-ui-harvest/spec.md` EXECUTIVE SUMMARY) directs porting that model near one-to-one.

### Purpose

Add a normalized, cycle-safe parent/child relation over `RowData`, hydrated from and serialized to
per-note frontmatter, so the timeline, board and table/tree presentations can each render depth,
expand/collapse, inline add and progress consistently, without any surface owning the graph itself.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- A normalized relation/index module in `src/data/*` (new file(s)): `parentId`, ordered `subtaskIds`,
  depth, ancestor chain, visibility (hidden under a collapsed ancestor), and cycle diagnostics, built
  as a pure derivation over `RowData[]` — ported from `TaskIndex.ts:10-19`'s recursive id-to-parent
  index and `TaskTreeOps.ts:12-25`'s depth/parent/visible flattening.
- Frontmatter hydrate: read `parentId` and an ordered child-id list from a note's frontmatter and
  normalized fields, adapted from `YamlHydrator.ts:80-113` and `:127-138`, landing in `RowData`'s
  existing `frontmatter`/`computed` split (`src/data/types.ts:158-169`) rather than a new persisted
  shape.
- Frontmatter serialize: write parent/child ids and progress back to the moved/updated notes'
  frontmatter, atomically across both affected parents, adapted from `YamlSerializer.ts:80-105` and
  `:126-141`, landing through the row/source pipeline seam (`src/data/row-pipeline.ts:40-90`).
- Tree transaction operations — add, update, delete, sibling reorder, cross-parent move — adapted from
  `TaskTreeOps.ts:38-68` and `:108-121`, reusing the existing base62 manual-rank scheme
  (`src/data/manual-order.ts`) for sibling order and rejecting any move that would create a descendant
  cycle.
- Depth and expand/collapse UI adapted from `ExpandCell.ts:3-17` and `TitleCell.ts:22-48`, scoped to
  the subtask relation rather than sharing state with the calendar/timeline's own group collapse
  (`src/views/calendar-timeline-renderer.ts:704-738`).
- Inline add on Enter, adapted from `SubtasksPanel.ts:75-89`, extending the existing row-create context
  (`src/data/types.ts:176-188`) with a parent id/path.
- Progress display distinguishing explicit (author-set) from derived (computed from children) values,
  adapted from `SubtasksPanel.ts:23-48` (done/total, checkbox-to-status mapping).
- Adapters that let the timeline (`src/views/calendar-timeline-renderer.ts:391-445`) and board
  (`src/views/board-renderer.ts:90-99`, `:750-789`) surfaces read depth/visibility/progress from the
  relation without owning it.
- `styles.css` additions for depth indentation and the expand/collapse affordance, under the
  `tools/lane/css-lane.json` lane protocol.
- Tests for the relation/index, hydrate/serialize round-trip, transaction atomicity and cycle rejection.

### Out of Scope

- The reference's table view, bottom sheets, and formulas/rollups/calcs — the do-not-borrow list in
  `../036-obsidian-pm-ui-harvest/research/research.md:404-419` names why each stays ours; nothing in
  this phase touches `src/data/computed-evaluator.ts`, the aggregate/rollup pipeline, or
  `mobile-bottom-sheet.ts`'s own lifecycle.
- Timeline, board and calendar surface ports themselves (`037-timeline-gantt-port`,
  `038-board-kanban-port`, `039-calendar-parity-port`) — this phase only adapts each surface's
  consumption of the new relation, not its own rendering logic.
- Shared UI/UX tokens, primitives, motion and overlay polish — `041-shared-ui-ux-port`'s scope.
- A nested `subtasks: Task[]` field on `RowData` or any second in-memory tree that could drift from
  frontmatter — `RowData` stays one flat shape per note (research §"Local host, 1:1 range").
- Gallery view and any gallery-adjacent compatibility work — `030-gallery-view-deprecation`'s scope.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `src/data/subtask-relation.ts` | Create | Normalized parent index: `parentId`, `subtaskIds`, depth, ancestors, visibility, cycle diagnostics |
| `src/data/subtask-hydrate.ts` | Create | Frontmatter to relation hydration, adapted from `YamlHydrator.ts:80-113`, `:127-138` |
| `src/data/subtask-serialize.ts` | Create | Relation to frontmatter serialization and atomic move transaction, adapted from `YamlSerializer.ts:80-105`, `:126-141` |
| `src/data/types.ts` | Modify | Add relation-adjacent optional fields/types consumed by the new modules; no change to `RowData`'s own shape |
| `src/data/row-pipeline.ts` | Modify | Add an optional relation/index stage after row build, diagnostics unchanged in shape |
| `src/data/manual-order.ts` | Modify (if needed) | Reuse or extend base62 rank helpers for parent-scoped sibling order |
| `src/views/board-renderer.ts` | Modify | Card depth/expand affordance and move/reorder action contract extension (`:90-99`, `:750-789`) |
| `src/views/calendar-timeline-renderer.ts` | Modify | Depth/visibility adaptation for lanes/visible events (`:391-445`), scoped collapse (`:704-738`) |
| `styles.css` | Modify | Depth indentation and expand/collapse affordance styling (css-lane protocol) |
| `src/views/*.test.ts` or new test files | Create/Modify | Relation, hydrate/serialize, transaction and cycle-rejection tests |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | A normalized parent index exists in `src/data/*` as a pure derivation over `RowData[]` — `parentId`, ordered `subtaskIds`, depth, ancestor chain, visibility under collapsed ancestors — and does not add a nested `subtasks` field to `RowData` (`src/data/types.ts:158-169` stays the flat authoritative shape). |
| REQ-002 | Hydrate reads `parentId` and an ordered child-id list from a note's frontmatter into the relation, adapted from `specs/context/obsidian-pm-main/src/store/YamlHydrator.ts:127-138`; serialize writes parent/child ids and progress back to frontmatter, adapted from `specs/context/obsidian-pm-main/src/store/YamlSerializer.ts:80-105`. |
| REQ-003 | A single move/reorder transaction atomically updates the moved child's `parentId`, both old and new parents' `subtaskIds`, its sibling rank, and any affected derived rows in one pass; a move that would create a descendant cycle is rejected and the relation is left unchanged. |
| REQ-004 | Explicit (author-set) progress and derived (computed-from-children) progress are represented and displayed as distinct values; derived progress never overwrites an explicit value. |
| REQ-005 | Depth and expand/collapse UI is scoped to the subtask relation and does not share mutable state with the calendar/timeline's own group collapse (`src/views/calendar-timeline-renderer.ts:704-738`). |
| REQ-006 | Inline add on Enter creates a child row with the correct `parentId`/path context, adapted from `specs/context/obsidian-pm-main/src/modals/SubtasksPanel.ts:75-89` and this repo's `RowCreateContext` (`src/data/types.ts:176-188`). |
| REQ-007 | No product code in this phase modifies `src/data/computed-evaluator.ts`, the aggregate/rollup pipeline, `manualOrder` semantics beyond scoping ranks per parent, i18n strings, selection state, or `mobile-bottom-sheet.ts`'s own lifecycle. |
| REQ-008 | No spec path, phase number, task id or requirement id appears in any code comment this phase writes (Comment Hygiene HARD BLOCK); a landed MIT-notice comment, if any substantial code/CSS is copied verbatim, names only the license and copyright holder per `../036-obsidian-pm-ui-harvest/research/research.md:32-39`. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-009 | Board and timeline surfaces read depth/visibility/progress from the relation through the seams named in scope, without either surface owning the graph. |
| REQ-010 | `npm run gate` and the `styles.css` lane's recapture-and-read protocol both pass before this phase claims completion. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A relation fixture with a 3-level tree hydrates from frontmatter, exposes correct depth
  and ancestor chains for every node, and round-trips through serialize with no field loss.
- **SC-002**: A cross-parent move updates both parents' `subtaskIds`, the moved child's `parentId`, and
  sibling ranks atomically in one transaction, observed via a before/after diff of the relation state.
- **SC-003**: A move that would create a cycle (moving a node under its own descendant) is rejected and
  leaves the relation byte-for-byte unchanged, observed by re-reading the fixture after the rejected
  call.
- **SC-004**: Explicit and derived progress are asserted as distinct fields on a row where both are
  present and differ, with derived progress never overwriting the explicit value.
- **SC-005**: `npm run gate` prints `gate: PASS` and exits 0 on the final state.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `predecessor` phases `037`-`039` may not yet exist when this opens | Board/timeline adapters (REQ-009) may target renderer shapes that shift under a concurrent port | Scope this phase's renderer touches to the seam contracts named in scope (`:90-99`, `:391-445`, `:750-789`); re-verify those line ranges before editing if a sibling phase lands first |
| Risk | Nesting a second in-memory tree that drifts from frontmatter | A relation that disagrees with the note on disk is a silent data-loss bug | REQ-001 forbids a nested `subtasks` field; the relation is always a derivation, rebuilt from `RowData[]`, never mutated in place |
| Risk | A non-atomic move leaves one parent updated and the other stale | Orphaned or duplicated child references | REQ-003's single transaction helper is the only write path; no surface writes `parentId`/`subtaskIds` directly |
| Risk | `styles.css` lane held by a concurrent phase | Depth-indentation styling blocked or reverted | Acquire the lane (holder + history entry) before editing per `tools/lane/css-lane.json`; release only after a read recapture |
| Dependency | `specs/context/obsidian-pm-main` staying present and unedited | Cited `file:line` sources could move | Read-only reference tree; re-verify a citation before relying on it if it has not been read this session |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Relation rebuild over a fixture of at least 500 rows (33's own tested scale,
  `src/views/calendar-timeline-renderer.ts:300-345`) completes without a measured regression in the
  existing row-pipeline diagnostics timing.

### Security
- **NFR-S01**: No code from `obsidian-pm-main` lands without its MIT notice at the landing point, per
  `../036-obsidian-pm-ui-harvest/research/research.md:32-39`; this phase's default disposition is
  `rewrite`, not `copy-verbatim-with-MIT-notice`.

### Reliability
- **NFR-R01**: A rejected cycle-creating move never partially applies; the relation is either fully
  updated or fully unchanged, verified by SC-003.
<!-- /ANCHOR:nfr -->

---

## 8. EDGE CASES

### Data Boundaries
- A note with `parentId` pointing at a non-existent file: the relation marks it an orphan reference and
  surfaces it in diagnostics rather than throwing or silently dropping the row.
- A note listed in a parent's `subtaskIds` but whose own `parentId` disagrees or is absent: hydrate
  resolves this in favor of the authoritative per-note `parentId` field and records the mismatch.
- Empty subtree (a parent with an empty `subtaskIds` list): renders with no expand affordance and
  `done/total` of `0/0`, not hidden.

### Error Scenarios
- Move target is a descendant of the moved node: REQ-003 rejects it before any write, returning a
  named cycle error rather than partially mutating state.
- Concurrent edit to the same parent's `subtaskIds` from two callers in one tick: the transaction helper
  serializes through the existing pipeline's write path; this phase does not add new concurrency
  primitives beyond what `src/data/row-pipeline.ts` already provides.

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 18/25 | Files: ~10, LOC: 700-1,000, Systems: data model + 2 renderers + styles.css |
| Risk | 14/25 | Auth: N, API: N, Breaking: possible (new relation/index, atomic transaction contract) |
| Research | 15/20 | Catalog already cited; port-time re-verification of moved citations still required |
| Multi-Agent | 6/15 | Single-lane port with in-runtime verification per D14 |
| Coordination | 9/15 | Depends on sibling ports' renderer shapes staying stable; css-lane coordination |
| **Total** | **62/100** | **Level 3** |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | A second in-memory tree drifts from frontmatter | H | L | REQ-001 forbids nested `subtasks`; relation is always derived |
| R-002 | Non-atomic parent move corrupts relation state | H | M | Single transaction helper (REQ-003), tested with SC-002/SC-003 |
| R-003 | css-lane held by a sibling port when this phase needs it | M | M | Acquire/release protocol; coordinate before editing `styles.css` |
| R-004 | Cited `file:line` moved since the catalog was written | L | M | Re-verify citations at port time, not synthesis time |

---

## 11. USER STORIES

### US-001: Cycle-safe subtask reorder (Priority: P0)

**As a** note-database user, **I want** to move a subtask under a different parent, or reorder it among
siblings, **so that** the tree stays correct without me being able to accidentally nest a task under
itself.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-002, AC-003).

### US-002: Progress that trusts my own numbers (Priority: P1)

**As a** note-database user, **I want** an explicit progress value I set myself to stay put even when
my subtasks' derived progress would suggest a different number, **so that** the display never silently
overrides what I typed.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-004).

---

## 12. OPEN QUESTIONS

- Whether the relation/index lives as one module (`subtask-relation.ts`) or splits further once the
  hydrate/serialize transaction shape is drafted — left to `plan.md`'s implementation step, not
  pre-decided here.
- Whether `039-calendar-parity-port` and `037`/`038` land before this phase opens for real work; if not,
  the renderer seam line ranges cited in scope must be re-verified against current disk state before
  editing (see R-004).

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `tasks.md`
- **Decision Records**: See `decision-record.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Durable Directive**: See `goal.md`
