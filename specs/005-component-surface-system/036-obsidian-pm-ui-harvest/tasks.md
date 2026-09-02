---
title: "Tasks: Obsidian PM UI Harvest"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "tasks"
  - "036"
  - "obsidian pm harvest tasks"
importance_tier: "normal"
contextType: "general"
---
# Tasks: Obsidian PM UI Harvest

<!-- SPECKIT_LEVEL: 2 -->
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

- [ ] T001 Confirm `specs/context/obsidian-pm-main` is present, and re-read `LICENSE` before dispatch
- [ ] T002 Confirm the plugin worktree is clean and no agent is concurrently editing this packet's tree (007's write-containment trap)
- [ ] T003 [P] Read the `SKILL.md` for whichever of `cli-codex`/`cli-opencode` and `cli-devin` will be dispatched (`plan.md` §4)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Research Loop

- [ ] T004 Dispatch lane 1 — `gpt-5.6-luna`, `model_reasoning_effort=max`, `service_tier=fast`, via `cli-codex` or `cli-opencode` (`research/lineages/<lane-1>/`)
- [ ] T005 Dispatch lane 2 — `deepseek-v4-flash-max` via `cli-devin` (`research/lineages/<lane-2>/`)
- [ ] T006 Dispatch lane 3 — Sonnet `xhigh` via the second Claude login (`research/lineages/<lane-3>/`)
- [ ] T007 Confirm each lane reached 20 iterations, or recorded a convergence reason in its `convergence-report.md`
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T008 Synthesize all lanes into `research/research.md`, ≥ 20 entries, each with `file:line`, adopting packet, license note
- [ ] T009 Cross-reference operator reports 30-33 against the catalog; record coverage in `acceptance-criteria.md` AC-2
- [ ] T010 Run the 10-citation in-runtime spot-check; record pass/fail per citation
- [ ] T011 Update `spec.md`, `goal.md` and `acceptance-criteria.md` to reflect the loop's actual outcome
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification passed (T010 spot-check, 10 of 10)
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
- [ ] CHK-003 [P1] `specs/context/obsidian-pm-main` confirmed available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met (`acceptance-criteria.md`)
- [ ] CHK-021 [P0] 10-citation spot-check complete, 10 of 10 pass
- [ ] CHK-022 [P1] Reports 30-33 cross-referenced against the catalog
- [ ] CHK-023 [P1] Loop convergence or 20-iteration completion recorded per lane
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/goal/acceptance-criteria synchronized after the loop runs
- [ ] CHK-041 [P1] License note present on every catalog row
- [ ] CHK-042 [P2] Parent `roadmap.md`/`goal.md` phase map updated — owned by whoever holds those files next, not this packet
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Loop output confined to `research/` and `research/lineages/`
- [ ] CHK-051 [P1] No hand-authored file placed under `research/`
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 4 | 0/4 |
| P1 Items | 6 | 0/6 |
| P2 Items | 1 | 0/1 |

**Verification Date**: pending
<!-- /ANCHOR:summary -->
