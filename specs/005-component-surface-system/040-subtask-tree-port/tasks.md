---
title: "Tasks: Subtask Tree Port"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases: ["040 tasks", "subtask tree port tasks"]
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/040-subtask-tree-port"
    last_updated_at: "2026-09-02T23:59:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Task breakdown authored from plan.md's gate order"
    next_safe_action: "T001"
    blockers: []
    key_files: ["tasks.md", "plan.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-040-tasks"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Tasks: Subtask Tree Port

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Add the 3-level task-tree frontmatter fixture and a Vitest file asserting relation hydrate
  returns correct depth/ancestors; run it and record the failing value (`src/data/subtask-relation.test.ts`)
  — red first: `Cannot find module '/src/data/subtask-relation'` (3 failed suites, no tests run, 2026-09-03);
  green after implementation: 47/47 in `subtask-relation|hydrate|serialize.test.ts`
- [x] T002 Re-verify the reference `file:line` citations this phase depends on
  (`YamlHydrator.ts:80-113,127-138`; `YamlSerializer.ts:80-105,126-141`; `TaskTreeOps.ts:12-25,38-68,108-121`;
  `TaskIndex.ts:10-19`; `SubtasksPanel.ts:23-48,75-89`) against current disk state in
  `specs/context/obsidian-pm-main` — all six ranges read and confirmed this session
- [x] T003 [P] Confirm the pre-change baseline: `rg -n "parentId|subtaskIds" src/data/` returns zero
  hits — confirmed 2026-09-03; the only `parentId` occurrences in `src/` are the overlay stack's
  unrelated parent-id concept (`src/views/overlay-stack.ts`, `src/views/popover-auto-close.ts`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Implement `src/data/subtask-relation.ts` (pure derivation: parentId/subtaskIds/depth/
  ancestors/visibility/cycle diagnostics) until T001's test passes (`src/data/subtask-relation.ts`)
  — `buildSubtaskRelation` at `src/data/subtask-relation.ts:37-230`
- [x] T005 Implement `src/data/subtask-hydrate.ts` and a hydrate round-trip test
  (`src/data/subtask-hydrate.ts`, `src/data/subtask-hydrate.test.ts`)
  — `readRelationFields` at `src/data/subtask-hydrate.ts:28-35`; round-trip test at
  `src/data/subtask-hydrate.test.ts:120-150`
- [x] T006 Implement `src/data/subtask-serialize.ts`'s atomic move/reorder transaction; write SC-002's
  atomic-move test and SC-003's cycle-rejection test as failing-red first
  (`src/data/subtask-serialize.ts`, `src/data/subtask-serialize.test.ts`)
  — `planSubtaskMove` at `src/data/subtask-serialize.ts:88-207`; SC-002 at
  `src/data/subtask-serialize.test.ts:79-149`, SC-003 at `src/data/subtask-serialize.test.ts:197-218`;
  both red first (module-not-found), green now
- [x] T007 Wire the relation/index stage into `src/data/row-pipeline.ts`, keeping
  `RowPipelineDiagnostics`'s shape intact (`src/data/row-pipeline.ts`)
  — optional `options.includeRelation` stage at `src/data/row-pipeline.ts:89-96,185-201`;
  diagnostics shape untouched (`RowPipelineDiagnostics` at `:44-53`)
- [x] T008 Add the explicit-vs-derived progress distinction and SC-004's test asserting derived never
  overwrites explicit (`src/data/subtask-relation.ts` or a dedicated progress module)
  — progress derivation at `src/data/subtask-relation.ts:233-258`; distinction test at
  `src/data/subtask-relation.test.ts:135-150`
- [x] T009 Adapt `src/views/board-renderer.ts`'s move/order action contract (`:90-99`) and card
  extension point (`:750-789`) to carry parent updates through the transaction helper
  (`src/views/board-renderer.ts`)
  — action contract at `src/views/board-renderer.ts:92-120`; transaction handoff at
  `src/views/board-renderer.ts:1458-1475`
- [x] T010 Adapt `src/views/calendar-timeline-renderer.ts`'s lane/visible-event flattening (`:391-445`)
  for subtask depth/visibility, keeping the existing group collapse (`:704-738`) state separate
  (`src/views/calendar-timeline-renderer.ts`)
  — relation visibility at `src/views/calendar-timeline-renderer.ts:307-310`; group collapse remains
  separate at `src/views/calendar-timeline-renderer.ts:1146`
- [x] T011 Implement depth and expand/collapse UI scoped to the subtask relation
  (adapted from `ExpandCell.ts:3-17`, `TitleCell.ts:22-48`)
  — board affordance at `src/views/board-renderer.ts:1028-1046`; timeline affordance at
  `src/views/calendar-timeline-renderer.ts:978-998`
- [x] T012 Implement inline add on Enter, extending `RowCreateContext` with parent path/id
  (adapted from `SubtasksPanel.ts:75-89`; `src/data/types.ts`)
  — context fields at `src/data/types.ts:256-267`; Enter handler at `src/views/board-renderer.ts:1074-1119`
- [x] T013 [P] Acquire the `styles.css` lane (`tools/lane/css-lane.json`); add depth-indentation and
  expand/collapse affordance styling
  — lane history at `tools/lane/css-lane.json:1394,1401,1408,1415`; rules at
  `styles.css:9413-9513,18001-18029`
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T014 `npm run screenshots`; read the recaptures for the depth/expand/progress UI on phone and
  desktop frames
  — 268 captured, 0 errors, run detached. All 21 captures git reports as changed were opened. The
  eight new tree captures (`screenshots/views/board-subtask-tree-*`,
  `screenshots/views/timeline-subtask-tree-*`) show depth on the card's own outline, the toggle and
  the inline add row on the expanded parent only, and both progress values. The first read was red:
  every board capture truncated the label to `1/2 subtasks complete · Explicit…`, so the author-set
  percentage — the half REQ-004 exists to keep distinct — was invisible at every card width; fixed by
  wrapping the label (`styles.css:9473-9479`) and re-read green. The other 13 are encoder noise: the
  modified set differs between two consecutive runs over identical sources, deltas run 2-479 bytes,
  and `timeline-view-day-mobile-light` and `calendar-month-view-mobile-dark` read indistinguishable
  from their HEAD copies
- [x] T015 Release the `styles.css` lane with a `reviewed` array naming the changed captures
  — release at `tools/lane/css-lane.json:1415`, `reviewed` names all 21; `node
  tools/lane/check-lane.mjs` reads `release names all 21 changed capture(s)`, exit 0 both bare and
  with `SURFACE_PHASE=040-subtask-tree-port` (a bare run was exit 1 while the lane was held)
- [x] T016 `npm run test` (Vitest) for the full new-test set; fix any red before proceeding
  — `npm run test`: 87 files/864 tests passed. Red first on each new check, observed not assumed:
  reverting `src/data/subtask-relation.ts` to `HEAD` fails 2 of 18 (`expected { explicit: 25, … } to
  be undefined`); reverting `src/data/data-source.ts` fails the collapse round-trip (`expected
  undefined to deeply equal { 'Tasks/Parent.md': true }`); deleting one span from the board fixture
  fails `db-subtask-progress-fill is in its fixture`; putting a `subtask` field back on `TL_LANES`
  fails `business/Figma carries no subtask state`
- [x] T017 `npm run gate`; confirm `gate: PASS` and exit 0; read `tools/lane/gate-logs/` for any red
  lane
  — `gate: PASS` 25/25 green, exit 0, run both bare and with `SURFACE_PHASE=040-subtask-tree-port`.
  Was red twice on the way: `evidence` reported 11 of 16 artefacts stale against the moved
  stylesheet (re-measured by the eight census/audit tools the gate does not itself re-stamp), and
  `operator-list` reported this file reworded without a regenerate
- [x] T018 Fresh in-runtime agent re-runs T016/T017 itself if any step ran through an external CLI
  lane (D3/D14: a delegate's report is a claim, not a result)
  — the display leg came from a `cli-codex` lane, so every number above was re-run in-runtime from
  this worktree's own state rather than read from its report. `npx tsc --noEmit` exit 0;
  `npm run lint` 169 problems (156 errors, 13 warnings), identical to `HEAD` — the two logs differ
  only in the line numbers of pre-existing findings, no new rule and no new file;
  `npm run lint:tools` exit 0; `node tools/naming/scan-comments.mjs` PASS over 374 files;
  `node tools/live/engine-parity.mjs` 51 differences, the same count as `HEAD` (fixtures 66 -> 68 for
  the two new scenarios), none naming a subtask class
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] `acceptance-criteria.md` rows all `Met`, `Waived` or `Superseded`
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|--------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented (orphan `parentId`, cycle rejection)
- [ ] CHK-013 [P1] Code follows project patterns (MODULE banners, numbered sections)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete (screenshots read)
- [ ] CHK-022 [P1] Edge cases tested (orphan reference, empty subtree, mismatched parent/child ids)
- [ ] CHK-023 [P1] Error scenarios validated (cycle rejection, concurrent-write serialization)
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Finding class recorded for each part of the port (new capability, not a bug fix)
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for `RowPipelineDiagnostics`, board and timeline
  action contracts
- [ ] CHK-FIX-005 [P1] Matrix axes and row count listed before completion is claimed (plan.md FIX
  ADDENDUM)
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation implemented (frontmatter parentId/subtaskIds sanitized on read)
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/acceptance-criteria synchronized
- [ ] CHK-041 [P1] Code comments adequate (durable why only; no spec paths or ids)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | [ ]/9 |
| P1 Items | 8 | [ ]/8 |
| P2 Items | 0 | [ ]/0 |

**Verification Date**: TBD
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] Both ADRs have status (Proposed/Accepted)
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
<!-- /ANCHOR:arch-verify -->
