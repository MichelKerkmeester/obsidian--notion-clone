---
title: "Tasks: Gallery Deprecation Docs and Release"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "gallery docs tasks"
  - "007 phase 4 tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Gallery Deprecation Docs and Release

<!-- SPECKIT_LEVEL: 3 -->

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

- [ ] T001 [B] Confirm `003` landed on main and record its sha
- [ ] T002 [B] Collect `001`'s declared-loss list, to be quoted verbatim rather than summarised
- [ ] T003 [P] Read `006`'s `008-docs-and-release` — it created `CHANGELOG.md` and left its release owed (`../../006-list-view-deprecation/008-docs-and-release/implementation-summary.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 Update `README.md`'s view count and screenshot table (`README.md:22`, `:43-45`)
- [ ] T005 Update the page-preview and cover-settings prose, keeping the board half (`README.md:87`, `:120-123`)
- [ ] T006 [P] Remove the gallery from the plugin `description` (`package.json`)
- [ ] T007 Append the retirement entry to `CHANGELOG.md`, naming EVERY `001` declared loss individually and stating what a rollback does not undo
- [ ] T008 [P] Close `030-gallery-view-deprecation` against this retirement — superseded, its own measurements kept as evidence, the way `006`'s REQ-007 closed `033` and `024` (`../../005-component-surface-system/030-gallery-view-deprecation/spec.md`)
- [ ] T009 True up the `030` row in the surface-system roadmap §5.A (`../../005-component-surface-system/roadmap.md`)
- [ ] T010 Take ADR-001: does the in-app "What's new" surface carry this, or is README plus CHANGELOG enough (`plan.md`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T011 `npm run gate`, exit status read from `$?`
- [ ] T012 `rg -i gallery README.md package.json` and confirm nothing offers the gallery as a current feature
- [ ] T013 Read the CHANGELOG entry as a user who lost a gallery would, and check every loss is findable
- [ ] T014 Cut the release, or hand the cut to the orchestrator WITH the target version recorded in `implementation-summary.md`
- [ ] T015 Leave the operator row open. An agent never ticks it
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Every acceptance criterion in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Predecessor**: See `../003-remove-renderer-and-harness/`
- **Loss list**: See `../001-usage-and-migration-audit/implementation-summary.md`
- **Precedent**: See `../../006-list-view-deprecation/008-docs-and-release/`
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

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] `003` has landed — the docs describe a removal that happened
- [ ] CHK-002 [P0] `001`'s declared-loss list is to hand and quotable verbatim
- [ ] CHK-003 [P1] `006`'s `008-docs-and-release` read, including the release it prepared and did not cut
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npm run gate` still exits 0 read from `$?` after the doc edits
- [ ] CHK-011 [P0] No broken link introduced in README or CHANGELOG
- [ ] CHK-012 [P1] The board half of every shared prose sentence survives the gallery half's removal
- [ ] CHK-013 [P1] `manifest.json`, `package.json` and `versions.json` agree on the version
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] `rg -i gallery README.md package.json` returns nothing offering it as a current feature
- [ ] CHK-022 [P1] Every `001` declared loss appears individually in `CHANGELOG.md`
- [ ] CHK-023 [P1] The rollback sentence is present and states that a migrated view stays a board
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each edit classed: the README and description are `instance-only`, closing `030` is `cross-consumer`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory: `rg -rn -i gallery README.md package.json CHANGELOG.md`.
- [ ] CHK-FIX-003 [P0] Consumer inventory: any spec document citing `030` as in-progress work.
- [ ] CHK-FIX-004 [P0] Not applicable — no security, path, parser or redaction change. Recorded rather than silently skipped.
- [ ] CHK-FIX-005 [P1] Not applicable — no runtime matrix.
- [ ] CHK-FIX-006 [P1] Not applicable — no process-wide state.
- [ ] CHK-FIX-007 [P1] Evidence pinned to the release sha.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No secrets in the release notes
- [ ] CHK-031 [P0] Not applicable — no input handling
- [ ] CHK-032 [P1] Not applicable — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] `030`'s own measurements survive its supersession
- [ ] CHK-042 [P2] ADR-001 on the in-app "What's new" surface is taken either way
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
| P0 Items | 12 | 0/12 |
| P1 Items | 15 | 0/15 |
| P2 Items | 6 | 0/6 |

**Verification Date**: not yet run
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions recorded in this phase's `plan.md` ADR section
- [ ] CHK-101 [P1] Every ADR carries a status
- [ ] CHK-102 [P1] Rejected alternatives named with their rejection reason
- [ ] CHK-103 [P2] Migration path documented where one applies
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] No measurable regression in view-open time, or the absence of a target recorded
- [ ] CHK-111 [P1] Throughput not applicable to a view-open path; recorded rather than skipped
- [ ] CHK-112 [P2] Load testing not applicable
- [ ] CHK-113 [P2] Benchmarks recorded where one exists
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented in `plan.md` §7 and its limits stated
- [ ] CHK-121 [P0] Feature flag not used; the reason recorded
- [ ] CHK-122 [P1] Not applicable — the plugin has no server-side monitoring
- [ ] CHK-123 [P1] The rollback steps are the runbook
- [ ] CHK-124 [P2] Release notes drafted where this phase changes user-visible behaviour
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] No security-relevant surface changed, or the change reviewed
- [ ] CHK-131 [P1] No dependency added
- [ ] CHK-132 [P2] Not applicable
- [ ] CHK-133 [P2] Vault data handled per the plugin's existing write model
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md` and `goal.md` agree
- [ ] CHK-141 [P1] Not applicable — no public API
- [ ] CHK-142 [P2] User-facing docs are `004`'s
- [ ] CHK-143 [P2] Findings carried into the parent where they contradict it
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Product Owner | [ ] Approved | |
| Fresh in-runtime reviewer | QA | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
