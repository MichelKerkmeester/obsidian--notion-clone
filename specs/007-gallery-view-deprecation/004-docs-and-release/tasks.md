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

- [x] T001 [B] Confirm `003` landed on main and record its sha — `fb27ba5b`, re-stamped `932fa3a9`, both ancestors of the release commit `d3433d81` (`git merge-base --is-ancestor` confirmed both)
- [x] T002 [B] Collect `001`'s declared-loss list, to be quoted verbatim rather than summarised — `001/implementation-summary.md` §4, six fields: three fully carried, one softened, two genuine losses
- [x] T003 [P] Read `006`'s `008-docs-and-release` — it created `CHANGELOG.md` and left its release owed (`../../006-list-view-deprecation/008-docs-and-release/implementation-summary.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Update `README.md`'s view count and screenshot table (`README.md:22`, `:43-45`) — "Six" → "Five", Gallery screenshot row removed
- [x] T005 Update the page-preview and cover-settings prose, keeping the board half (`README.md:87`, `:120-123`) — gallery mentions dropped, board half kept verbatim
- [x] T006 [P] Remove the gallery from the plugin `description` (`package.json`) — also removed from `keywords`, since the verification command checks the whole file
- [x] T007 Append the retirement entry to `CHANGELOG.md`, naming EVERY `001` declared loss individually and stating what a rollback does not undo — `## 0.0.28`
- [x] T008 [P] Close `030-gallery-view-deprecation` against this retirement — superseded, its own measurements kept as evidence, the way `006`'s REQ-007 closed `033` and `024` (`../../005-component-surface-system/030-gallery-view-deprecation/spec.md`)
- [x] T009 True up the `030` row in the surface-system roadmap §5.A (`../../005-component-surface-system/roadmap.md`) — also updated `005/goal.md`'s DONE table row for `007` itself
- [x] T010 Take ADR-001: does the in-app "What's new" surface carry this, or is README plus CHANGELOG enough (`plan.md`) — Accepted, out of scope, matching `006`
- [x] T016 Drop the gallery from the community-plugin `description` (`manifest.json:6`) — T006 cleared `package.json`, but `manifest.json` is the file Obsidian's community-plugin browser renders, so the gallery was still being offered there as a current view. `rg -i gallery manifest.json` now returns nothing; `version` untouched at `0.0.28`

> **Out of scope, recorded rather than fixed.** `package.json:4`'s `description` and `package.json:39`'s
> `keywords` still name the **list** view, retired at `0.0.23`. That residue belongs to
> `specs/006-list-view-deprecation/008-docs-and-release`, which is still open, and is logged there as
> an open row rather than absorbed here.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 `npm run gate`, exit status read from `$?` — exit 0, 26/26 green
- [x] T012 `rg -i gallery README.md package.json` and confirm nothing offers the gallery as a current feature — returns nothing
- [x] T013 Read the CHANGELOG entry as a user who lost a gallery would, and check every loss is findable — all six `gallery*` fields have their own bullet, each named in the words a user sees; `galleryImageField` is the one carried as an identifier, the other five being described by what they did
- [x] T014 Cut the release, or hand the cut to the orchestrator WITH the target version recorded in `implementation-summary.md` — release **0.0.28** (`d3433d81`) already carries `001`-`003`; recorded rather than re-cut
- [ ] T015 Leave the operator row open. An agent never ticks it
- [ ] T016 [P2] Remove the orphaned `assets/screenshots/gallery-view.png` (1.3MB, unreferenced since T004/T005 dropped the README's gallery screenshot row). Found 2026-09-06 during the 058/refresh leg; recorded rather than deleted, because that leg does not touch binaries. Code owner: the next lander touching `assets/screenshots/`
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]` — except T015 (the operator's own row, never ticked by an agent) and T017 (a post-completion follow-up recorded 2026-09-06)
- [x] No `[B]` blocked tasks remaining
- [x] Every acceptance criterion in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded` — except AC-007, which is operator-only
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

- [x] CHK-001 [P0] `003` has landed — the docs describe a removal that happened
- [x] CHK-002 [P0] `001`'s declared-loss list is to hand and quotable verbatim
- [x] CHK-003 [P1] `006`'s `008-docs-and-release` read, including the release it prepared and did not cut
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npm run gate` still exits 0 read from `$?` after the doc edits — 26/26 green
- [x] CHK-011 [P0] No broken link introduced in README or CHANGELOG
- [x] CHK-012 [P1] The board half of every shared prose sentence survives the gallery half's removal
- [x] CHK-013 [P1] `manifest.json`, `package.json` and `versions.json` agree on the version — all read `0.0.28`
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met — except AC-007, operator-only
- [x] CHK-021 [P0] `rg -i gallery README.md package.json` returns nothing offering it as a current feature
- [x] CHK-022 [P1] Every `001` declared loss appears individually in `CHANGELOG.md`
- [x] CHK-023 [P1] The rollback sentence is present and states that a migrated view stays a board
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Each edit classed: the README and description are `instance-only`, closing `030` is `cross-consumer`.
- [x] CHK-FIX-002 [P0] Same-class producer inventory: `rg -rn -i gallery README.md package.json CHANGELOG.md` — README and package.json clean; CHANGELOG carries the retirement entry by design.
- [x] CHK-FIX-003 [P0] Consumer inventory: any spec document citing `030` as in-progress work — `005/roadmap.md` §5.A and `005/goal.md`'s DONE table row both trued up alongside `030` itself.
- [x] CHK-FIX-004 [P0] Not applicable — no security, path, parser or redaction change. Recorded rather than silently skipped.
- [x] CHK-FIX-005 [P1] Not applicable — no runtime matrix.
- [x] CHK-FIX-006 [P1] Not applicable — no process-wide state.
- [x] CHK-FIX-007 [P1] Evidence pinned to the release sha — `d3433d81` (0.0.28), with `fb27ba5b`/`932fa3a9` named as ancestors.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No secrets in the release notes
- [x] CHK-031 [P0] Not applicable — no input handling
- [x] CHK-032 [P1] Not applicable — no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized
- [x] CHK-041 [P1] `030`'s own measurements survive its supersession
- [x] CHK-042 [P2] ADR-001 on the in-app "What's new" surface is taken either way — Accepted, out of scope
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only — none created
- [x] CHK-051 [P1] scratch/ cleaned before completion — not applicable, none created
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 12/12 |
| P1 Items | 15 | 15/15 |
| P2 Items | 8 | 8/8 — several `N/A` and recorded as such rather than skipped |

**Verification Date**: 2026-09-06
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [x] CHK-100 [P0] Architecture decisions recorded in this phase's `plan.md` ADR section — ADR-001, Accepted
- [x] CHK-101 [P1] Every ADR carries a status
- [x] CHK-102 [P1] Rejected alternatives named with their rejection reason
- [x] CHK-103 [P2] Migration path documented where one applies — the gallery-to-board migration is documented in `CHANGELOG.md`'s `## 0.0.28` Upgrade section
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [x] CHK-110 [P1] No measurable regression in view-open time, or the absence of a target recorded — not applicable, no code changed
- [x] CHK-111 [P1] Throughput not applicable to a view-open path; recorded rather than skipped
- [x] CHK-112 [P2] Load testing not applicable
- [x] CHK-113 [P2] Benchmarks recorded where one exists — none new; `003`'s renderer-coverage figures are the relevant benchmark and are unchanged by this phase
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [x] CHK-120 [P0] Rollback procedure documented in `plan.md` §7 and its limits stated
- [x] CHK-121 [P0] Feature flag not used; the reason recorded
- [x] CHK-122 [P1] Not applicable — the plugin has no server-side monitoring
- [x] CHK-123 [P1] The rollback steps are the runbook
- [x] CHK-124 [P2] Release notes drafted where this phase changes user-visible behaviour — `CHANGELOG.md` `## 0.0.28`
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [x] CHK-130 [P1] No security-relevant surface changed, or the change reviewed
- [x] CHK-131 [P1] No dependency added
- [x] CHK-132 [P2] Not applicable
- [x] CHK-133 [P2] Vault data handled per the plugin's existing write model
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [x] CHK-140 [P1] `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md` and `goal.md` agree
- [x] CHK-141 [P1] Not applicable — no public API
- [x] CHK-142 [P2] User-facing docs are `004`'s
- [x] CHK-143 [P2] Findings carried into the parent where they contradict it — `../goal.md` completion criteria ticked to match, `../roadmap.md` milestones and children table updated
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Product Owner | [ ] Approved | |
| Fresh in-runtime reviewer | QA | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
