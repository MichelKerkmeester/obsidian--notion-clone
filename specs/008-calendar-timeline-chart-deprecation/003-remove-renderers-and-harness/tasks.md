---
title: "Tasks: Phase 3: remove-renderers-and-harness"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 3: remove-renderers-and-harness

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

- [x] T001 Preconditions and precedent: `git tag -l 0.0.34` non-empty (the directive's start condition — 002's redirect shipped in that release); read `001`'s inventory (every file:line referencing calendar/timeline/chart, the harness lanes, stories, captures), the parent goal's D1–D4, and the removal precedent's commits via `git log --oneline --` over the gallery phase's folder, then each commit's file list
- [x] T002 [P] Seam survey: every import, field, dispatch branch, teardown leg, registry row, story, capture id and evidence owner that names the three renderers, including the stored-view migration surfaces that must survive (the redirects shipped in 0.0.34) and the Survivors census (the mini calendar, the three toolbar renderers, all of `src/data/`, the invalid-events machinery, the search-results panel)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T003 Archive-first: `git mv` the ten sources — calendar (`calendar-renderer.ts`, its test, its render bench), timeline (`calendar-timeline-renderer.ts` with the gantt port, the gantt/hour-column/tick-label tests, the timeline render bench and its `.mjs` test), chart (`chart-renderer.ts`) — into `archive/deprecated-views/{calendar,timeline,chart}/`, plus a root README and one README per view, each naming the last-live SHA `e75a979c9a21f6f93967a40e24b2a58f474fa9d5` and the exact `git checkout <sha> -- <paths>` restore procedure, what deliberately stayed, and why the archived files fall outside every build/test/lint glob
- [x] T004 RED recorded against the moved-but-not-yet-rewired tree: `npx tsc --noEmit` exit 2 (4× TS2307 where the hosts' imports chased the moved modules, + cascading TS7006); `npx vitest run` 11 failed / 13 failed files / 1442 passed (two suites dying at import); the sheet inventory's census already reading 68→67 surfaces. The failing suites are the tests that pin the hosts, the harness registries and the capture manifests to the three renderers
- [x] T005 `database-view.ts` surgery: the dispatch collapsed to board-else-table; `renderSummary`'s chart gating made unconditional; deleted the outgoing-view teardown branch, the search-results panel methods, `jumpTo`, `getTimelineRenderConfig`, the scroll-reset helper, the external-chart-data and export-filename plumbing and `renderChart`/`applyChartFilters`; the surviving KEEP zones (dead-but-coherent defaults, the `pipelineConfig` chart ternary, the summary's placement-after-chart branch) left untouched — the stored-view machinery from 002 reads some of them
- [x] T006 `embedded-database-renderer.ts` surgery: the three renderer imports and their field literals, the chart fast-path caller, the theme-refresh trigger, the unload destroy, the panel methods, the type-change guard's teardown leg, the options-toggle's chart onChange, the export/copy legs; `staleViewSelector`'s retired root list pruned (needed for the bundle grep to reach 0); the summary/type gates collapsed; the permanently idle search-results element field kept, matching the standalone host's precedent
- [x] T007 Test repoints and pin rewrites: the archived sources' own imports re-anchored to `../../../src/...`; the four suites that read the renderers' bytes (`database-view.test.ts`, `embedded-database-renderer.test.ts`, `surface-shell.test.ts`, `calendar-pinned-values.test.ts`) repointed to the archive; the 002 hide-and-migrate suite's section-5 rewritten (its `viewType === "chart"` pin still holds through the surviving `pipelineConfig` ternary; its two class-name pins replaced by the archive import path); the harness member indirections removed where their machinery went with the renderers; `tsconfig.json`'s vestigial `rootDir` widened from `src` to `.` (no emit anywhere; otherwise tsc errors on the archived imports living outside the old root)
- [x] T008 Registry, harness and capture surgery: the bundle's scenario/state registries trimmed (13 + 8 rows) with the renderer-source list narrowed to table/board; the live harness's moved imports repointed and its header trimmed; the assertions' retired sections, stamps and inputs rewritten (the note now says the retired view renderers left the tree); published constructed-coverage 5→2; three dying chrome entries deleted; the temporal scenario module and its parity test deleted with their last consumer (a discovery: the final tick-label claim imported the fixture helpers); the shared-contracts suite narrowed to the board surface; nine replay claims retired, two narrowed; constructed scenarios 76→59, reference scenarios 4→2 (their constructed mirrors died with them); 138 retired capture PNGs deleted; the constructed-capture suite's pinned arrays brought to the new declared counts; the sheet inventory's drill-down producer repointed to the archived chart renderer, the mandated regenerator run (68→67 surfaces) and the census recount updated
- [x] T009 The four final source edits that retired the last bundle references: the retired view-root classes and their comment in `rendered-view-roots.ts`; the toolbar's retired icon arms; the view-config panel's retired icon ternary and option row. The 002 suite's pinned picker clauses untouched — `hide-and-migrate` 24/24 afterwards
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T010 Green: `npx tsc --noEmit` 0; `npx vitest run` 154/154 files, 1555/1555 tests, exit 0
- [x] T011 `npm run build` 0; bundle grep `grep -c -iE 'gantt|calendar-renderer|chart-renderer' main.js` = 0, down from 5 (the retired root id and three lucide icon arms) — the criterion's own check
- [x] T012 `npm run screenshots` twice (`</dev/null`, both exit 0, 480 captures each — 616→480, the 136 retired manifest rows; 138 PNG files deleted), pixel-delta between the runs: one 1-px/1-unit jitter (the recorded rule), one 61-px real mover (the filename-format board's dynamic timestamp content, committed as the new truth), 138 retired PNGs confirmed gone; `npm run screenshots:verify` 0 ("480 entries match their sources, and none is blank or identical across themes")
- [x] T013 Stale-evidence sweep, every exit read: `render-assertions.mjs` 0; `replay.mjs` 28/28 hold; `sheet-grammar.mjs` 0; `story-coverage.mjs` 0; `verify-placement.mjs` 0; the shim-coverage check 0; `sheet-inventory.mjs` 0 and its dedicated test 0; the device-parity check first flagged its own artefact stale (the manifest's hash moved) — its writer re-run, PASS — then `evidence --check-all` 15/15 fresh. The touch-targets evidence stayed fresh; no dedicated lane script exists (the count lives in the artefact and the gate's touch-targets lane)
- [x] T014 The pinned-values lane, after the gate's first run caught it: the baseline note appended mid-implementation carried a trailing comma (the scan crashed parsing) — fixed; the scan then reported 10 unsupplied tokens against 5 recorded: the five retired-view tokens' only setters were style-assignments inside the now-archived renderers, so their reads turned unsupplied without any declaration changing. All five recorded in the baseline with counts and the reason (recorded, not stood in — no surviving code computes values for them, and standing them in would resurrect values nothing reads), and the scan's headcount re-verified: 0
- [x] T015 `npm run gate` final: exit 0 — 27 green, 0 red for a declared reason. Lane count 27→27: no lane dropped, because the harness's retired-view machinery was kept dormant rather than excised (see decision-record) so every lane's inputs stayed populated
- [x] T016 `scan-comments.mjs` 0 (no commented-out code, no artifact-id violations); `scan-failing-values.mjs` 0
- [x] T017 Documentation: this file, the acceptance criteria, the implementation summary, the decision record, this phase's goal, the parent goal's continuity, the 005 handover entry; the validation orchestrator strict-PASSED and the packet's graph metadata regenerated
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Every acceptance criterion in `acceptance-criteria.md` is `Met` — all four, with observed evidence; no waivers
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Predecessor**: See `../002-settings-redirect-and-migrate/`
- **Audit**: See `../001-usage-and-migration-audit/inventory.md`
- **Removal precedent**: See `../../../.worktrees/`-independent history: `007-gallery-view-deprecation/003-remove-renderer-and-harness/`
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

- [x] CHK-001 [P0] Requirements documented in `spec.md`, drawn from `001`'s audit and the parent's D1–D4
- [x] CHK-002 [P0] Technical approach mirrors the gallery-removal precedent: archive-first, then the hosts, then the registries, then the captures, with the stored-view migration machinery kept working throughout
- [x] CHK-003 [P1] Dependencies: the 0.0.34 tag (002's released redirect) verified present before the first move
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` clean (exit 0)
- [x] CHK-011 [P0] No console errors — the full suite 1555/1555 green, and both capture runs printed no error, only their capture lines
- [x] CHK-012 [P1] The stored-view machinery keeps working: the hide-and-migrate suite (the tests that own the 002 redirect) 24/24 after every surgery step, its pinned picker clauses never touched
- [x] CHK-013 [P1] Comment hygiene: `scan-comments.mjs` 0 violations across the leg
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met — see `acceptance-criteria.md`, each row's Verification cell names the observed evidence
- [x] CHK-021 [P0] Systematic end-to-end pass: 480 fresh captures ×2 runs, `screenshots:verify` 0, the gate 27/27. The boundary the harness itself prints is recorded, not hidden: no Obsidian host is constructed (no live App, workspace or metadata cache), so the battery proves the bundle and the surfaces, not a real device
- [x] CHK-022 [P1] Edge cases: the retired-token reads surfacing only after the moves (caught by the gate's first run), the replay claim whose fixture import died with the temporal module (caught by the replay run), the drill-down producer whose census row followed its class into the archive
- [x] CHK-023 [P1] Error scenarios: the leg's own red record — import failures at tsc and at vitest — is the failure mode the surgery had to close, and the final green is the same check passing
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Two actionable findings, both classified and both closed in the leg: the replay's fixture-helper import (instance-only — one import, retired with its claim) and the five-turned-unsupplied retired-view tokens (evidence-matrix — recorded, counted, ratcheted)
- [x] CHK-FIX-002 [P0] Instance-only status proven by grep: after the surgery, zero references to the deleted host methods, panels, renderer fields or retired roots remained (each deletion's `rg`-zero recorded before moving on)
- [x] CHK-FIX-003 [P0] Consumer inventory: the seam survey named every importer, pin, registry, story, capture and evidence owner before the first edit; the one missed consumer (the replay's fixture import) was caught by the replay run and retired, not patched around
- [ ] CHK-FIX-004 [P0] Adversarial table tests — not applicable: no security, path, parser or redaction logic changed
- [x] CHK-FIX-005 [P1] Matrix axes: 3 retired views × 2 hosts + the harness registries + 34 retired capture ids × 4 device/theme arms; every axis row deleted or repointed, none silently kept
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant — not applicable: the leg reads no process-wide state
- [x] CHK-FIX-007 [P1] Evidence pinned: every archived byte is pinned to the last-live SHA in the restore READMEs; every number in the acceptance criteria comes from a read exit code or a counted output
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets — the leg adds documentation, moves sources and deletes code; no credential-adjacent change exists in the diff
- [ ] CHK-031 [P1] Input validation — not applicable: no input handling changed
- [ ] CHK-032 [P1] Auth/authz — not applicable: no authorization surface in this leg
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized: the four docs the dispatch named (tasks, acceptance criteria, implementation summary, decision record) plus the phase goal, the parent goal's continuity, the parent spec's status and the 005 handover; `plan.md` deliberately untouched — the dispatch's brief names the doc set, and the technical approach lives in the tasks and the decision record
- [x] CHK-041 [P1] Code comments adequate: the surviving comments carry the durable why (the kept zone's reason, the dormant machinery's reason), and `scan-comments.mjs` 0
- [x] CHK-042 [P2] README: the four archive READMEs (root + one per view) written; the root-README strip is the next phase's scope, not this one's
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files: the runner's brief mandates the gate log and exit-marker at the worktree root (`.gate-exit`, `.gate-*.log`, plus the pixel-delta report); all untracked, all reported, nothing staged
- [x] CHK-051 [P1] `scratch/` unused by this leg — nothing to clean
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 15 | 14/15 (1 not applicable, noted in its cell) |
| P1 Items | 17 | 13/17 (4 not applicable, noted in their cells) |
| P2 Items | 9 | 2/9 (7 not applicable, noted in their cells) |

**Verification Date**: 2026-09-09
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [x] CHK-100 [P0] Architecture decisions documented in `decision-record.md` — three, all with the context that forced them
- [x] CHK-101 [P1] All ADRs have status — Accepted
- [x] CHK-102 [P1] Alternatives documented with rejection rationale — delete-vs-archive, glob-edits-vs-exclusion-by-construction, dormant-keep-vs-full-excision, stand-in-vs-record for the retired tokens
- [x] CHK-103 [P2] Restore path documented — the per-view READMEs; every archived source proven reachable at the last-live SHA (`git show` over all ten, byte counts > 0)
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] Response-time targets — the spec's NFR section was deliberately left until the audit; none was recorded, so none is claimed
- [ ] CHK-111 [P1] Throughput targets — same
- [ ] CHK-112 [P2] Load testing — not applicable to a removal leg
- [x] CHK-113 [P2] Performance benchmarks — the two dedicated render benches moved into the archive with their renderers and still run from there via their surviving importer; the published constructed-coverage artefact records the new 5→2 count
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [x] CHK-120 [P0] Rollback procedure documented (per-view READMEs) and its premise proven: every one of the ten archived sources resolves at the last-live SHA by `git show`; the checkout itself not executed, to keep the tree exactly the verified state
- [ ] CHK-121 [P0] Feature flag — not applicable: the removal ships behind no flag; the redirect already shipped in 0.0.34
- [ ] CHK-122 [P1] Monitoring — not applicable: an Obsidian plugin ships no monitoring
- [ ] CHK-123 [P1] Runbook — the restore READMEs are the runbook; no separate one
- [ ] CHK-124 [P2] Runbook review — the dispatch's fresh-verification leg reviews it; not this leg's row to tick
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Security review — no security-relevant change; nothing to review
- [ ] CHK-131 [P1] Dependency licenses — no dependency added or removed
- [ ] CHK-132 [P2] OWASP — not applicable
- [ ] CHK-133 [P2] Data handling — not applicable: no data leaves the vault
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [x] CHK-140 [P1] Spec documents synchronized: this phase's goal/AC/tasks/summary/decision record, the parent goal's continuity and the 005 handover all carry the same numbers (1555/1555, 480×2, grep 0, 27/0)
- [ ] CHK-141 [P1] API documentation — not applicable: no public API changed
- [ ] CHK-142 [P2] User-facing documentation — the root-README strip is the next phase's scope
- [x] CHK-143 [P2] Knowledge transfer: the 005 handover entry (including the superseded note for the gantt-port phase, per the parent's D4) and the worktree's run log
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| [Name] | Technical Lead | [ ] Approved | |
| [Name] | Product Owner | [ ] Approved | |
| [Name] | QA Lead | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
