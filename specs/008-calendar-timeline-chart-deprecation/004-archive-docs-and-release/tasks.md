---
title: "Tasks: Phase 4: archive-docs-and-release"
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
# Tasks: Phase 4: archive-docs-and-release

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

- [x] T001 Preconditions and precedent: worktree `252-deprecation-readme-strip` branched from main post-003 — `archive/deprecated-views` holds `calendar/`, `chart/`, `timeline/` and the restore-README (003's landed deliverable); read this packet's goal, spec, acceptance criteria and the parent goal in full, plus the root README; the operator's directive (R9, 2026-09-08): "And remove any mention of that and gallery view from root readme. Do keep the archived code somewhere for future use for those deprecated views"
- [x] T002 [P] Mention census before the strip (the before numbers, recorded here so the lane's green has its red): a plain 5-keyword substring grep (`calendar|timeline|gantt|chart|gallery`, case-insensitive) reads `README.md` 13 (calendar 3, timeline 3, gantt 0, chart 4, gallery 3) and `manifest.json` 3 (one each of chart, calendar, timeline — all in the community-plugin `description`); `package.json`'s description also names the retired views but is the npm-listing copy, outside this phase's named scope (`README.md` and `manifest.json`), and so recorded, not touched
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T003 The root-README strip: the intro sentence's view list narrowed to what 0.0.34+ ships ("Table and board views read and write those same files…"); the Views section's three retired bullets (chart, calendar, timeline) deleted and "Five view types" → "Two view types"; the Settings section's default-view row narrowed ("table, board, chart, calendar, or timeline" → "table or board"); the early-alpha paragraph, the record/property/formula copy, the linked-view sentence, the phone-surface sections and everything downstream of the Views section untouched
- [x] T004 The mandated note: one short "Deprecated views" section, no marketing prose — it names the 0.0.34 removal of the chart, calendar and timeline views, points at `archive/deprecated-views/README.md` for the restore path, and absorbs the former gallery/list migration paragraph (gallery → board, list → table, the one-time notice, the gallery notice's Undo) so the feature list loses the words while the shipped behavior's truth stays
- [x] T005 The community-plugin description: `manifest.json`'s `description` now reads "Database views for notes with table, board, formulas, filters, and inline editing." — the retired names gone, nothing else changed
- [x] T006 RED FIRST, the mention lane: `tools/naming/scan-deprecated-views.mjs` plus `tools/naming/scan-deprecated-views.test.mjs` (10 vitest cases), written to the `scan-comments` conventions (MODULE banner, numbered box-drawing sections, a `scanText` export so tests drive fixtures without the real tree, the CLI's `process.exit` guarded on import). RED, recorded against the pre-strip copies restored from `git show HEAD:…`: `README.md` 13 enforced mentions outside any note (chart 3, calendar 3, timeline 3, gallery 3, "list views" 1), `manifest.json` 3, plus the note-missing violation — exit 1. GREEN against the stripped tree: `README.md` 0 outside the note / 7 inside (chart 1, calendar 1, timeline 1, gallery 3, "list views" 1), `manifest.json` 0, exit 0. The suite covers the note exemption's section boundary (a mention after the next heading counts again), the noteless and pointer-less violation shapes, the manifest's noteless rule, and the CLI's exit contract against this repository's own tree. Lane placement: the suite rides the gate's existing tests lane (vitest picks up `tools/**/*.test.mjs`), so no `gate.mjs` row was added — the dispatch offered "a test or lane row", and the test made the row redundant
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T007 Green, exit read from `$?` without a pipe: `npx tsc --noEmit` 0; `npx vitest run` 1581/1581 tests, exit 0 (the 10 new cases included)
- [x] T008 `npm run build` 0; `node tools/naming/scan-comments.mjs` 0 (the two new files carry the comment grammar and no artifact id); `node tools/naming/scan-failing-values.mjs` 0
- [x] T009 `npm run gate` (foreground, `</dev/null`, exit read): **27 green, 0 red for a declared reason, exit 0** — lane count 27→27, because the new coverage rides the existing tests lane rather than adding one
- [x] T010 Documentation: this file, the acceptance criteria, the implementation summary, this phase's goal (criteria, LOG, continuity), the parent goal's 004 criterion + continuity + LOG, 002's AC-007 discharge (criterion, closure statement, tasks row, both continuity blocks), 037's supersession note, the 005 handover entry, and the drafted release notes at `../changelog/008-004-archive-docs-and-release.md`
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Every acceptance criterion in `acceptance-criteria.md` is `Met` — both, with observed evidence; no waivers. REQ-003 (P1) is discharged by the drafted release notes; publishing them is the 0.0.35 cut's, a later leg's
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Predecessor**: See `../003-remove-renderers-and-harness/` — the archived code this leg's note points at
- **Restore path**: See `../../../archive/deprecated-views/README.md`
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

- [x] CHK-001 [P0] Requirements documented in `spec.md`, drawn from the operator's R9 copy and the parent's D4
- [x] CHK-002 [P0] Technical approach: strip-then-note-then-lane, the note absorbing the migration paragraph; the counts (before → after) fixed by T002's census before the first edit
- [x] CHK-003 [P1] Dependencies: 003's landed archive (the note's pointer target) verified present — `archive/deprecated-views/` holding the three views and its README — before the note was written
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` clean (exit 0)
- [x] CHK-011 [P0] No console errors — the full suite 1581/1581 green, the scanner CLI's runs silent beyond their own report lines
- [x] CHK-012 [P1] The scanner's rules behave: the red-then-green bracket (T006) proves the lane fails exactly while the retired names sit outside the note and passes exactly when they do not
- [x] CHK-013 [P1] Comment hygiene: `scan-comments.mjs` 0 across the leg, including the two new files
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met — see `acceptance-criteria.md`; each row's Verification cell names the observed evidence
- [x] CHK-021 [P0] End-to-end: the verification battery (T007–T009) green from the final state. The boundary it proves is the docs' truth, not the bundle's — 003's battery owns the bundle, this one owns the copy about it
- [x] CHK-022 [P1] Edge cases: a mention after the note's next heading counts again (the exemption's section boundary); a noteless copy violates twice; a note that never points at the archive violates the pointer rule; the manifest has no note to hide behind
- [x] CHK-023 [P1] Error scenarios: the leg's own red record — 13+3 enforced mentions plus the note-missing violation, exit 1 against the pre-strip copies — is the failure mode the strip had to close, and the final green is the same check passing
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] One actionable finding, classified and closed in the leg: the suite's first fixtures counted mentions their fixture note did not carry (`instance-only` — a test-expectation mismatch, caught by the suite's own red run and corrected the same leg; the scanner itself needed no fix)
- [x] CHK-FIX-002 [P0] Instance-only status proven: the corrected expectations were re-run green, and the scanner's rule independently bracketed by the CLI's red (pre-strip copies) and green (stripped tree) runs — no other occurrence of the class exists, the lane has one rule and two named files
- [x] CHK-FIX-003 [P0] Consumer inventory: the lane's consumers are the two named files, its own suite, and the gate's tests lane (which runs vitest over `tools/**/*.test.mjs`); the packet docs and the 005 handover record it; no other doc, registry or evidence owner reads these two files' view copy
- [ ] CHK-FIX-004 [P0] Adversarial table tests — not applicable: no security, path, parser or redaction logic changed; the leg's whole production diff is documentation prose plus a two-file mention counter
- [x] CHK-FIX-005 [P1] Matrix axes: 2 named files × 6 keyword shapes (calendar, timeline, gantt, chart, gallery, "list views") × note-in/note-out; every mention moved or accounted — README 13 → 0 outside the note (7 inside), the description 3 → 0, gantt 0 → 0 throughout
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant — not applicable: the lane reads two repository files, no process-wide state
- [x] CHK-FIX-007 [P1] Evidence pinned: the red run's inputs pinned to the committed history (`git show HEAD:README.md`, `HEAD:manifest.json` — the pre-strip bytes); every number in this file, the acceptance criteria and the implementation summary comes from a read exit code or a counted output
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets — the leg adds prose, one description string and a mention counter; nothing credential-adjacent exists in the diff
- [ ] CHK-031 [P1] Input validation — not applicable: no input handling changed (the counter reads trusted repository files)
- [ ] CHK-032 [P1] Auth/authz — not applicable: no authorization surface in this leg
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized: the dispatch's named set — tasks, acceptance criteria, implementation summary, this phase's goal, the parent goal's criterion + continuity, 002's discharge, 037's note, the 005 handover, the drafted release notes; `plan.md` deliberately untouched, the dispatch's brief names the doc set (003's precedent)
- [x] CHK-041 [P1] Code comments adequate: the scanner's comments carry the durable why (the note exemption's ruling, the inclusive keyword list's reason), and `scan-comments.mjs` 0
- [x] CHK-042 [P2] README — this leg IS the README leg: the strip, the note, and the lane that keeps them honest
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files: the runner's brief mandates the gate log and exit-marker at the worktree root (`.gate-exit`, `.gate-*.log`); untracked, reported, nothing staged — 003's precedent
- [x] CHK-051 [P1] `scratch/` unused by this leg — nothing to clean
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 11/13 (2 not applicable, noted in their cells) |
| P1 Items | 22 | 10/22 (11 not applicable, noted in their cells; 1 — CHK-123 — left to its noted owner) |
| P2 Items | 7 | 3/7 (4 not applicable, noted in their cells) |

**Verification Date**: 2026-09-09
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions in `decision-record.md` — not applicable: the phase adds no architecture; its two judgment calls (the note-exemption ruling, the lane's placement in the existing tests lane) are recorded as Key Decisions in the implementation summary
- [ ] CHK-101 [P1] ADR statuses — not applicable: no ADR owed; the two judgment calls above carry their rationale where they are recorded
- [x] CHK-102 [P1] Alternatives documented — considered and rejected in the implementation summary: a new gate row (rejected: the suite rides the tests lane), keeping the migration paragraph in the feature list (rejected: it is shipped-behavior copy, and the note carries it without the retired names in the feature prose)
- [x] CHK-103 [P2] Restore path documented — this phase's own row: the note points at `archive/deprecated-views/README.md`, whose restore procedure 003 wrote and proved; the pointer's presence is enforced by the lane
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] Response-time targets — the spec's NFR section was deliberately left until the audit (003's precedent); none recorded, none claimed
- [ ] CHK-111 [P1] Throughput targets — same
- [ ] CHK-112 [P2] Load testing — not applicable to a documentation leg
- [ ] CHK-113 [P2] Performance benchmarks — not applicable: a two-file prose counter has no benchmark worth gating
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [x] CHK-120 [P0] Rollback procedure documented and its premise proven: the leg's own red run IS the rollback proof — the pre-strip copies restored from `git show HEAD:…` and re-read green by the same lane that had just failed them; reverting the two product files restores the 13+3 state, exit 1
- [ ] CHK-121 [P0] Feature flag — not applicable: a documentation strip ships behind no flag
- [ ] CHK-122 [P1] Monitoring — not applicable: an Obsidian plugin ships no monitoring
- [ ] CHK-123 [P1] Runbook — the archived-views README stays the restore runbook (003's); this leg's note is its pointers, the lane its proof. No separate runbook
- [ ] CHK-124 [P2] Runbook review — the dispatch's fresh-verification leg reviews it; not this leg's row to tick
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Security review — no security-relevant change; nothing to review
- [ ] CHK-131 [P1] Dependency licenses — no dependency added or removed (the scanner uses `node:fs`/`node:path` alone)
- [ ] CHK-132 [P2] OWASP — not applicable
- [ ] CHK-133 [P2] Data handling — not applicable: no data leaves the vault
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [x] CHK-140 [P1] Spec documents synchronized: this phase's goal/AC/tasks/summary, the parent goal's criterion + continuity + LOG, 002's discharge, 037's note and the 005 handover all carry the same numbers (README 13 → 0 outside the note, the description 3 → 0, the lane 10/10, the gate 27/0)
- [ ] CHK-141 [P1] API documentation — not applicable: no public API changed
- [x] CHK-142 [P2] User-facing documentation — the root README and the community-plugin description ARE this leg's deliverables, and the note is the new reader's pointer
- [x] CHK-143 [P2] Knowledge transfer: the 005 handover entry (including the counts, the exemption ruling and the open 0.0.35 cut) and the worktree's `.handover.md`
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
