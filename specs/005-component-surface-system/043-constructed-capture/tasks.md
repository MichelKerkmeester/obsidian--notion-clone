---
title: "Tasks: Constructed Capture"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "043 tasks"
  - "constructed capture tasks"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/043-constructed-capture"
    last_updated_at: "2026-09-04T00:45:07Z"
    last_updated_by: "phase-author"
    recent_action: "Wrote the task breakdown; none started"
    next_safe_action: "T001"
    blockers: []
    key_files:
      - "tools/screenshots/capture.mjs"
      - "tools/live/render-assertion-bundle.mjs"
      - "tools/live/render-assertion-harness.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-043-tasks"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Constructed Capture

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
## Phase 1: Setup — red first

- [ ] T001 Confirm the seam contract by reading it in full, not by summary: `buildRenderAssertionBundle()` (`tools/live/render-assertion-bundle.mjs`), `runRenderAssertions()`'s `onMounted` hook and every `scenario.renderer` branch (`tools/live/render-assertion-harness.ts`), and how `touch-targets.mjs` drives both from inside a Playwright page (`tools/live/touch-targets.mjs:257-311`) — the working precedent for a capture-side mount driver.
- [ ] T002 Write the constructed-manifest presence check first, observed red: assert `screenshots/constructed-manifest.json` exists and has 52 entries covering all 13 scenarios × 2 devices × 2 themes. Run it before any constructed capture exists — it must fail (file absent or entry count 0), and the failure text must name what's missing, not just exit 1.
- [ ] T003 [P] Spike the parity-basis open question (`spec.md` §12, §6 Risks): mount `list/file-view` via `runRenderAssertions` at its current bench shape (1600 rows), capture it, and compare its `pixelHash` against the existing `list-view` fixture's recorded `pixelHash` (`screenshots/manifest.json`). Record whether they can ever be pixel-equal at that shape (expected: no — different row counts, different content) and confirm the capture-sized data option (T006) is required before the parity check (T017) can be meaningful, not optional polish.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 [P] Extend `ScenarioSpec` (`tools/live/render-assertion-harness.ts`) so the timeline branch reads a scale from `"day" | "week" | "month" | "quarter" | "year"`, defaulting to today's implicit behaviour when omitted. Before/after regression: `node tools/live/render-assertions.mjs` must produce identical output for every currently-registered scenario.
- [ ] T005 [P] Add four new timeline-scale entries to `render-assertion-bundle.mjs`'s shared `SCENARIOS` (`timeline-day/file-view`, `timeline-month/file-view`, `timeline-quarter/file-view`, `timeline-year/file-view`). Before/after regression: `node tools/live/touch-targets.mjs` and `node tools/live/unstyled-links.mjs` must still report the same fixture-pass numbers (264/279 and 112/70 as of `042`'s landing — read the current numbers directly rather than trusting these, they are a pointer not a promise) and the constructed-pass scenario count grows by exactly 4.
- [ ] T006 Add the opt-in capture-sized data option to the mount path (`tools/live/render-assertion-harness.ts`). Red first: attempt T003's list capture at the default bench shape, confirm it is visually dense/unrecognisable relative to the fixture. Green: the same mount with the capture-sized option produces a row count comparable to the fixture's own (`scenarios/shared.mjs`'s `ROWS`, ~12-20). Regression: all three existing consumers (`render-assertions.mjs`, `touch-targets.mjs`, `unstyled-links.mjs`) exit 0 with unchanged numbers when the option is not passed.
- [ ] T007 Add the constructed scenario type and mount driver to `capture.mjs`: build the bundle once, host it in a static page per device/theme (mirroring `buildPage()`'s existing theme/device class handling), expose a mount function, and route it through the same viewport/element screenshot logic the fixture path already has (`captureMode()`, `capture.mjs:97-99`).
- [ ] T008 Add the readiness-signal wait (documented frame count, capture-owned, no `src/` edit) before layout measurement and screenshot. Negative control: for at least one of `calendar-week/file-view` or `timeline/file-view` (both schedule a post-render `requestAnimationFrame` correction — `calendar-renderer.ts:605`/`:1482`, `calendar-timeline-renderer.ts:906`), capture once with the wait removed and once with it present; the two must differ (`pixelHash` or `layoutHash`), proving the wait does something rather than being decorative.
- [ ] T009 Register the 13 constructed scenarios (list, table, board, gallery, calendar×3 scales, timeline×5 scales, chart), each with its capture group/title/sources, and run a full constructed capture producing `screenshots/constructed/` PNGs and `screenshots/constructed-manifest.json`. Green: T002's presence check now passes.
- [ ] T010 Create `tools/screenshots/declared-fixtures.mjs` with the 11-entry mapping from `plan.md`'s Architecture table (11 DECLARED, 2 net-new with no prior fixture, 13 fixture-only entries named and left alone).
- [ ] T011 Wire `verify.mjs` (screenshots-fresh) to read `declared-fixtures.mjs`: for a DECLARED scenario, judge staleness against the constructed capture's `sourceHashes` (which is derived from the real bundle's inputs) rather than only the fixture's hand-maintained `sources` array. Red first: hand-edit a `src/views/*` renderer source the constructed capture depends on (in a scratch branch or reverted immediately), confirm `verify.mjs` now flags the DECLARED scenario stale where it previously would not have.
- [ ] T012 Wire `check-lane.mjs` to treat a changed constructed capture the same as a changed fixture capture: widen `contentChangedCaptures()` to also read `screenshots/constructed-manifest.json` and the `screenshots/constructed/` directory. Red first: mutate one constructed capture's `pixelHash` without naming it in a release entry, confirm the lane reds exactly the way it already reds for an unnamed fixture change.
- [ ] T013 Confirm whether `capture-device-parity.mjs` already covers `screenshots/constructed/` through its existing directory-and-naming-convention scan (`capture-device-parity.mjs:47-61` iterates every group directory under `screenshots/`, keyed only on the `-mobile-dark.png` / `-desktop-dark.png` suffix pair — not on `scenarios.mjs`'s scenario list). If it does, no code change is needed; record the confirmation. If it does not (for example because the constructed PNGs use a different naming convention), extend it minimally to match.
- [ ] T014 Re-baseline `device-parity-baseline.json` if the constructed captures introduce any new mobile/desktop-identical pair, per the file's own ratchet discipline (a scenario joining the identical list is a real regression signal and must be named, not silently absorbed).
- [ ] T015 [P] Confirm `styles.css` is unmodified by this phase (`git diff --stat styles.css` empty) — no CSS-lane hold should be needed. If a real defect surfaces, record it in `goal.md`'s log and defer rather than fix inline.
- [ ] T016 [P] Add `tools/screenshots/fixture-constructed-parity.test.mjs`: for every DECLARED scenario in `declared-fixtures.mjs`, assert both the fixture and constructed manifest entries exist, and compare `pixelHash` per T003/T006's resolved basis (data-aligned pixel comparison once T006 lands, or an explicit structural check if pixel-equality is not achievable even with aligned data — the test states which basis it uses and why, it does not silently pick one).
- [ ] T017 Confirm the DONE-row-6 bounded list: run the fixture-only 13-entry list from `plan.md`'s Architecture table against the current gate lanes and confirm none of them silently disappeared from `scenarios.mjs` or the manifest during this phase.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T018 [P] Dispatch (D14 leg a): `cli-devin` on `deepseek-v4-flash-max`, `--permission-mode dangerous`, own worktree, initial implementation pass over T004-T016. No browser number from this leg is evidence.
- [ ] T019 [P] Dispatch (D14 leg b): `cli-codex` or `cli-opencode` on `gpt-5.6-luna`, `model_reasoning_effort=xhigh` or `max`, `service_tier=fast`, own worktree, second pass / repair over leg (a)'s result. No browser number from this leg is evidence either.
- [ ] T020 In-runtime verification (D14 leg c, the only leg whose Chrome numbers count): pull the dispatched result into the main checkout (or its own worktree, then merge), and from a fresh in-runtime session run every check in T021-T023 directly.
- [ ] T021 `pgrep -f "tools/screenshots/capture.mjs|tools/gate.mjs"` empty, then `node tools/live/render-assertions.mjs`, `node tools/live/touch-targets.mjs`, `node tools/live/unstyled-links.mjs`, each `$?` read directly (never through a pipe) — all three must exit 0 with the same fixture-pass numbers they had before this phase.
- [ ] T022 Run the constructed capture detached (`nohup`, wait on the PID — a foreground run exceeds the 10-minute cap and a killed run leaves half-written PNGs), then `node tools/screenshots/verify.mjs`, `node tools/lane/check-lane.mjs`, `node tools/live/capture-device-parity.mjs`, each `$?` read directly.
- [ ] T023 `npx vitest run` (new tests included), `npx tsc --noEmit`, `npm run lint:tools`, `node tools/naming/scan-comments.mjs` all exit 0.
- [ ] T024 `SURFACE_PHASE=043-constructed-capture npm run gate`, `$?` read directly: must be 0.
- [ ] T025 Backfill: `backfill-graph-metadata.ts` on this child folder (positional, `realpath .opencode`, `NODE_PRESERVE_SYMLINKS=1`); `validate.sh <this folder> --strict` first `RESULT:` line `PASSED`; `build-operator-checklist`; `scan-failing-values` exit 0.
- [ ] T026 Write `implementation-summary.md` in the same landing pass as the first ticks in this file, per this program's own Level-3 discipline (a Level 3+ packet fails `validate.sh` the moment `tasks.md` ticks unless the summary exists alongside).
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks above marked `[x]`, each with its own red-then-green evidence line, not a bare checkmark
- [ ] No `[B]` blocked tasks remaining
- [ ] `goal.md`'s completion criteria all carry their observed-red number before being ticked green
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Durable directive**: See `goal.md`
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
- [ ] CHK-003 [P1] Dependencies identified and available (`042`'s seam, confirmed green on `main`)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` and `npm run lint:tools` pass
- [ ] CHK-011 [P0] No console errors/warnings from the constructed capture run
- [ ] CHK-012 [P1] Every failure mode (bundle-build failure, readiness timeout) is bounded per-scenario, not run-fatal
- [ ] CHK-013 [P1] Comment-section banners on every new `tools/` file (`node tools/naming/scan-comments.mjs`)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria in `acceptance-criteria.md` met, waived or superseded
- [ ] CHK-021 [P0] Manual review: all 13 constructed PNGs opened and confirmed non-degenerate
- [ ] CHK-022 [P1] Readiness-wait negative control passes (T008)
- [ ] CHK-023 [P1] Harness-regression negative control passes for T004/T005/T006
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

Not applicable — this phase is new capability, not a bug fix (see `plan.md`'s FIX ADDENDUM).
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets — N/A, no secrets touched
- [ ] CHK-031 [P0] N/A — no user input surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] `spec.md` / `plan.md` / `tasks.md` / `acceptance-criteria.md` / `goal.md` synchronized
- [ ] CHK-041 [P1] Code comments explain WHY (readiness wait, capture-sized data option), not just WHAT
- [ ] CHK-042 [P2] Parent `spec.md` Phase Documentation Map and `roadmap.md` §5 updated
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
| P0 Items | 9 | 0/9 |
| P1 Items | 9 | 0/9 |
| P2 Items | 2 | 0/2 |

**Verification Date**: Not yet run — phase just opened.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in `plan.md` §3 (no separate `decision-record.md` — optional at this level, not opened unless a decision needs formal ADR weight)
- [ ] CHK-101 [P1] N/A — no ADRs opened yet
- [ ] CHK-102 [P1] N/A
- [ ] CHK-103 [P2] N/A — no migration
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] NFR-P01 met — the full 52-capture constructed run completes inside the same detached-run discipline `npm run screenshots` already uses
- [ ] CHK-111 [P1] N/A — no throughput target for a local capture tool
- [ ] CHK-112 [P2] N/A — no load testing surface
- [ ] CHK-113 [P2] Capture-run wall-clock time recorded once, for the operator record, not enforced as a gate
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested (`plan.md` §7)
- [ ] CHK-121 [P0] N/A — no feature flag; this is a dev-tooling change with no runtime plugin surface
- [ ] CHK-122 [P1] N/A — no production monitoring surface
- [ ] CHK-123 [P1] N/A — no runbook beyond `plan.md`/`tasks.md` themselves
- [ ] CHK-124 [P2] N/A
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] N/A — no security-relevant surface (local headless-Chrome tooling)
- [ ] CHK-131 [P1] N/A — no new dependency added
- [ ] CHK-132 [P2] N/A
- [ ] CHK-133 [P2] N/A — no data handling beyond local PNG/JSON artefacts already covered by this repo's existing capture pipeline
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All five packet docs synchronized (see CHK-040)
- [ ] CHK-141 [P1] N/A — no API surface
- [ ] CHK-142 [P2] N/A — no user-facing documentation; this is internal tooling
- [ ] CHK-143 [P2] Knowledge transfer via `plan.md`'s Architecture section and `goal.md`'s log
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Technical Lead | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
