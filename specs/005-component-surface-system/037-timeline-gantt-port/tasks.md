---
title: "Tasks: Timeline/Gantt Port [template:level-2/tasks.md]"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "timeline gantt port tasks"
  - "037 tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Timeline/Gantt Port

<!-- SPECKIT_LEVEL: 2 -->

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

- [ ] T001 Observe the current renderer's dependency-link seam failing (no seam exists) and record the exact
      failing value — D3 red-before-green (`src/views/calendar-timeline-renderer.ts`)
- [ ] T002 Acquire `tools/lane/css-lane.json` before any `styles.css` edit begins (`tools/lane/css-lane.json`)
- [ ] T003 [P] Read `cli-devin`'s and `cli-codex`'s `SKILL.md` before composing the first external-lane prompt
      (`.opencode/skills/cli-external-orchestration/cli-devin/SKILL.md`, `cli-codex/SKILL.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 Extend `buildTimelineModel` with reference padding/min-span semantics from `TimelineConfig.ts:36-45`,
      `:47-61` (`src/data/calendar-timeline-model.ts`)
- [ ] T005 Add a `resolveTimelineLinkChange`-shaped pure function rejecting same-side, duplicate, missing-task,
      and cycle links, matching `GanttLinkHandler.ts:56-67`, `:77-97` (`src/data/calendar-interaction-model.ts`)
- [ ] T006 Rewrite the five-level scale controls into the local i18n/navigation contract, matching
      `GanttView.ts:95-106` (`src/views/calendar-timeline-renderer.ts:832-854`)
- [ ] T007 Rewrite header/grid bands (weekend/Monday/month boundaries, today line) matching
      `GanttRenderer.ts:30-40`, `:90-109` and `GanttHeaderRenderer.ts:48-75`
      (`src/views/calendar-timeline-renderer.ts:344-389`, `:447-452`, `:865-885`)
- [ ] T008 Rewrite due-only/milestone/progress bar rendering matching `GanttTaskBarRenderer.ts:51-58`, `:76-117`
      (`src/views/calendar-timeline-renderer.ts:586-614`, `:647-655`)
- [ ] T009 Rewrite drag/resize edge handles as local buttons/ARIA, keeping the touch alternative, matching
      `GanttTaskBarRenderer.ts:119-146` and `GanttDragHandler.ts:48-58`
      (`src/views/calendar-timeline-renderer.ts:1430-1460`)
- [ ] T010 Wire the new link seam into `calendar-timeline-renderer.ts:158-170`'s action contract; no direct
      local dependency renderer existed before this task
- [ ] T011 Reconcile `styles.css` `db-timeline-*` rules against `gantt.css:1-17`, `:237-277`, under the
      acquired `css-lane` hold (`styles.css:16759-16760` region)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T012 Run unit tests for padding/min-span and link-rejection cases; observe green after T004/T005
- [ ] T013 Verify placement and observer/DOM teardown unchanged after the port
- [ ] T014 Verify keyboard and touch-menu equivalents exist for every rewritten drag/resize/link affordance
- [ ] T015 Recapture and read screenshots at all five zoom levels (day/week/month/quarter/year)
- [ ] T016 Release the `css-lane` hold with a `reviewed` array naming the recaptured screenshots
- [ ] T017 Run `npm run gate`; read the full output and exit status; read
      `tools/lane/gate-logs/<lane>.log` for any red lane before claiming done
- [ ] T018 In-runtime fresh verifier re-runs the browser gate and `validate.sh --strict` itself (D14 leg c;
      a delegate's own report is a claim, not a result)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] `npm run gate` reports `gate: PASS`, exit 0, observed by a fresh in-runtime agent
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
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in `spec.md`
- [ ] CHK-002 [P0] Technical approach defined in `plan.md`
- [ ] CHK-003 [P1] Dependencies identified and available (`036-obsidian-pm-ui-harvest` closed)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented (invalid-date events still hidden and repairable)
- [ ] CHK-013 [P1] Code follows project MODULE-banner and numbered-section pattern; no spec paths, phase
      numbers, or requirement ids in comments (Comment Hygiene HARD BLOCK)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met (`acceptance-criteria.md`)
- [ ] CHK-021 [P0] Manual testing complete at all five zoom levels
- [ ] CHK-022 [P1] Edge cases tested (due-only bar, same-side/duplicate/missing-task/cycle link rejection)
- [ ] CHK-023 [P1] Error scenarios validated (invalid-date repair unchanged)
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] N/A — this is a port, not a bug fix; no finding class applies
- [ ] CHK-FIX-002 [P0] N/A
- [ ] CHK-FIX-003 [P0] N/A
- [ ] CHK-FIX-004 [P0] N/A
- [ ] CHK-FIX-005 [P1] N/A
- [ ] CHK-FIX-006 [P1] N/A
- [ ] CHK-FIX-007 [P1] N/A
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation implemented (date/link inputs)
- [ ] CHK-032 [P1] N/A — no auth surface in this packet
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/acceptance-criteria synchronized
- [ ] CHK-041 [P1] Code comments adequate; durable why, no ephemeral artifact labels
- [ ] CHK-042 [P2] N/A — no README surface changed by this packet
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in `scratch/` only
- [ ] CHK-051 [P1] `scratch/` cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 8 | 0/8 |
| P1 Items | 8 | 0/8 |
| P2 Items | 1 | 0/1 |

**Verification Date**: pending
<!-- /ANCHOR:summary -->
