---
title: "Tasks: Gallery Usage and Migration Audit"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "gallery audit tasks"
  - "007 phase 1 tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Gallery Usage and Migration Audit

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

- [x] T001 Read the parent inventory so this phase extends it rather than repeating it (`../spec.md` §4)
- [x] T002 Read `030-gallery-view-deprecation`'s `spec.md` §7 — it already asks the union question (`../../005-component-surface-system/030-gallery-view-deprecation/spec.md`)
- [x] T003 [P] Read `006`'s equivalent audit for shape and for the surfaces it found late (`../../006-list-view-deprecation/005-usage-and-migration-audit/implementation-summary.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Enumerate every site that accepts, mints or coerces `viewType: "gallery"` — grep the literal FIRST, then sweep every `viewType` assignment and every `DatabaseViewType` narrowing, because the literal alone is what `030` stopped at (`scratch/surface-list.md`). Found a second accepting surface beyond the parent's own: `data-source.ts:1527-1529` `parseViewType()`
- [x] T005 Record the one known survivor with its guard — the settings sanitizer (`src/main.ts:146`, `:182`) — and confirm the `.base` importer still lands `cards` on `board` (`src/main.ts:1577`, schema guard at `:1580`) rather than assuming either way. Confirmed by reading the function; also confirmed neither accepting surface is safe to close the way `006`'s parallel `list` exemption was closed
- [x] T006 [P] Classify all 24 gallery-touching `screenshots/manifest.json` entries as gallery-only or board-shared, naming the board contribution of every shared one (`scratch/capture-classification.md`)
- [x] T007 [P] List every measurement of the gallery: `renderer-coverage.json` pins, the bench and its driver, `constructed-scenarios.mjs:237`, the `core.mjs`/`shared.mjs` scenarios, `render-assertion-harness.ts`, `verify-placement.mjs`, and the unit specs (`scratch/measurement-inventory.md`)
- [x] T008 Derive the declared-loss list: what each of the six `gallery*` `ViewConfig` fields expresses, and whether the board has an equivalent. Name each loss individually (`scratch/declared-losses.md`)
- [x] T009 Report actual vault usage — how many gallery-configured views exist — or state that the vault is unreadable from this session rather than reporting zero. Result: 0, confirmed readable
- [x] T010 Record the embedded-codeblock asymmetry as a finding with its evidence: `applyGalleryMigration` has exactly one call site (`src/views/database-view.ts:11678`) and `embedded-database-renderer.ts` has none. Also found the working shape to close it, already shipped for `list` in the same file
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 Re-run every recorded command and confirm each list reproduces
- [x] T012 Confirm no `src/` or `tools/` file appears in this phase's diff
- [x] T013 Write the three lists into `implementation-summary.md` with their commands beside them
- [x] T014 Reconcile the parent's `spec.md` §4 against the audit — the disagreements are identified and written up in full (`implementation-summary.md` §7, `roadmap.md`'s row for this child); the edit to `../spec.md` itself is left for whoever holds write authority over the parent, since this dispatch's write authority is scoped to this child folder plus the parent's `roadmap.md` row, not `spec.md`
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Every list in `implementation-summary.md` carries the command that produced it
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent inventory**: See `../spec.md` §4
- **Shape reference**: See `../../006-list-view-deprecation/005-usage-and-migration-audit/`
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

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [x] CHK-003 [P1] Parent `spec.md` §4 inventory read, so this phase extends rather than repeats it
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] No `src/` or `tools/` file appears in this phase's diff
- [x] CHK-011 [P0] No console errors from any script written into `scratch/` — not applicable, no executable script was written into `scratch/`, only `.md` records of the commands run
- [x] CHK-012 [P1] Every list is reproducible from a recorded command
- [x] CHK-013 [P1] Findings cite `file:line`, not file names alone
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met
- [x] CHK-021 [P0] Each recorded command re-run and the same list produced
- [x] CHK-022 [P1] The `viewType`-assignment sweep ran, not only the string grep
- [x] CHK-023 [P1] Not applicable this run — the vault WAS readable and the count is a confirmed 0, not an unavailability case; the reporting discipline itself (0 vs. unreadable are different claims) is honored in `implementation-summary.md` §5
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Each finding has a class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`. This audit's findings are `matrix/evidence` class throughout — an enumeration, not a bug fix — per goal D2
- [x] CHK-FIX-002 [P0] Same-class producer inventory completed: every site assigning `viewType`, not only literal `"gallery"`.
- [x] CHK-FIX-003 [P0] Consumer inventory completed for the six `gallery*` `ViewConfig` fields.
- [x] CHK-FIX-004 [P0] Not applicable — no security, path, parser or redaction change is made here. Recorded rather than silently skipped.
- [x] CHK-FIX-005 [P1] Matrix axes listed: host x entry point x cover-field state (`scratch/surface-list.md` §6).
- [x] CHK-FIX-006 [P1] Not applicable — no process-wide state is read.
- [x] CHK-FIX-007 [P1] Evidence pinned to the sha the audit ran against (`b240a8d5`).
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No secrets appear in `scratch/` output
- [x] CHK-031 [P0] Not applicable — no input is validated by this phase
- [x] CHK-032 [P1] Vault reads are read-only; no vault file is written
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized
- [x] CHK-041 [P1] Each list names its own derivation
- [ ] CHK-042 [P2] Parent `spec.md` §4 corrected if the audit contradicts it — deferred, not waived: this dispatch's write authority covers this child folder plus the parent's `roadmap.md` row, not `spec.md`. The two contradictions are fully written up in `implementation-summary.md` §7 and `roadmap.md`'s row for this child, ready to apply verbatim once someone with `spec.md` write authority does so
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Raw output in `scratch/` only
- [x] CHK-051 [P1] `scratch/` cleaned of throwaway files before completion — verified by directory listing: 3 raw-command `.txt` files plus the 4 curated `.md` lists, nothing else
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | 0/9 |
| P1 Items | 13 | 0/13 |
| P2 Items | 1 | 0/1 |

**Verification Date**: not yet run
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [x] CHK-100 [P0] ADR-001 (audit as its own phase) recorded in `plan.md`
- [x] CHK-101 [P1] Every ADR carries a status (`plan.md`'s ADR-001: Status Accepted)
- [x] CHK-102 [P1] The rejected alternative is named with its rejection reason (`plan.md`'s ADR-001: "Audit as T001 of the removal phase")
- [x] CHK-103 [P2] Not applicable — no migration path is designed here; `002` owns it
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [x] CHK-110 [P1] Not applicable — no runtime code. Recorded rather than skipped
- [x] CHK-111 [P1] Not applicable — no throughput target
- [x] CHK-112 [P2] Not applicable — no load testing
- [x] CHK-113 [P2] Not applicable — no benchmark
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [x] CHK-120 [P0] Rollback is `git revert` of a docs-only commit, stated in `plan.md` §7
- [x] CHK-121 [P0] Not applicable — nothing ships behind a flag
- [x] CHK-122 [P1] Not applicable — nothing runs
- [x] CHK-123 [P1] Not applicable — no runbook
- [x] CHK-124 [P2] Not applicable
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [x] CHK-130 [P1] Not applicable — no security-relevant change
- [x] CHK-131 [P1] Not applicable — no dependency added
- [x] CHK-132 [P2] Not applicable
- [x] CHK-133 [P2] Vault data is read, never written
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [x] CHK-140 [P1] `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md` and `goal.md` agree — `acceptance-criteria.md` now reads Complete/all six Met, matching this file and `implementation-summary.md`
- [x] CHK-141 [P1] Not applicable — no API
- [x] CHK-142 [P2] Not applicable — `004` owns user-facing docs
- [x] CHK-143 [P2] The three lists ARE the knowledge transfer
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Product Owner | [ ] Approved | |
| Fresh in-runtime reviewer | QA | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
