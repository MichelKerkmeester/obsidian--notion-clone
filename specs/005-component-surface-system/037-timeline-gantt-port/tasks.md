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

- [x] T001 Observe the current renderer's dependency-link seam failing (no seam exists) and record the exact
      failing value — D3 red-before-green (`src/views/calendar-timeline-renderer.ts`)
      — evidence: stashing `calendar-interaction-model.ts` and running its isolated test file reproduces
      12 failed of 12 seam tests, red `TypeError: resolveTimelineLinkChange is not a function` at
      `src/data/calendar-interaction-model.test.ts:41` (vitest, 2026-09-03; combined-run figure from the
      authoring session was 31 failed/2 passed across both timeline test files before the split); green
      after the seam landed at `src/data/calendar-interaction-model.ts:270`
- [x] T002 Acquire `tools/lane/css-lane.json` before any `styles.css` edit begins (`tools/lane/css-lane.json`)
      — evidence: holder/acquiredAt at `tools/lane/css-lane.json:2-3`, acquire history entry at `:1163-1168`; `SURFACE_PHASE=037-timeline-gantt-port node tools/lane/check-lane.mjs` accepted the held lane (2026-09-03)
- [ ] T003 [P] Read `cli-devin`'s and `cli-codex`'s `SKILL.md` before composing the first external-lane prompt
      (`.opencode/skills/cli-external-orchestration/cli-devin/SKILL.md`, `cli-codex/SKILL.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Extend `buildTimelineModel` with reference padding/min-span semantics from `TimelineConfig.ts:36-45`,
      `:47-61` (`src/data/calendar-timeline-model.ts`)
      — evidence: `buildTimelineRangeGeometry` at `calendar-timeline-model.ts:1316` with padding/min-span
      constants at `:207-228`; tests at `calendar-timeline-model.test.ts:64-112`
- [x] T005 Add a `resolveTimelineLinkChange`-shaped pure function rejecting same-side, duplicate, missing-task,
      and cycle links, matching `GanttLinkHandler.ts:56-67`, `:77-97` (`src/data/calendar-interaction-model.ts`)
      — evidence: `resolveTimelineLinkChange` at `calendar-interaction-model.ts:270`,
      `wouldCreateTimelineDependencyCycle` at `:300`; four rejection tests at
      `calendar-interaction-model.test.ts:55-78`
- [x] T006 Rewrite the five-level scale controls into the local i18n/navigation contract, matching
      `GanttView.ts:95-106` (`src/views/calendar-timeline-renderer.ts:1202-1244`)
      — evidence: five translated options, pressed state, scale data attributes and mobile listbox at `calendar-timeline-renderer.ts:1202-1244`; translations at `src/i18n.ts:837-847, 2500-2510, 4130-4140`
- [x] T007 Rewrite header/grid bands (weekend/Monday/month boundaries, today line) matching
      `GanttRenderer.ts:30-40`, `:90-109` and `GanttHeaderRenderer.ts:48-75`
      (`src/views/calendar-timeline-renderer.ts:399-420`, `:500-529`, `:482-488`)
      — evidence: boundary/weekend tick classes and per-unit weekend/today fill columns at `calendar-timeline-renderer.ts:399-420, 500-529`; sticky axis/fill rules at `styles.css:16876-16948, 17029-17052`
- [x] T008 Rewrite due-only/milestone/progress bar rendering matching `GanttTaskBarRenderer.ts:51-58`, `:76-117`
      (`src/views/calendar-timeline-renderer.ts:921-951`, `src/data/calendar-timeline-model.ts:941-972`)
      — evidence: due-only model fallback and metadata at `calendar-timeline-model.ts:739-746, 941-972`; milestone diamond/progress elements at `calendar-timeline-renderer.ts:921-951`; focused model tests at `calendar-timeline-model.test.ts:137-178`
- [ ] T009 Rewrite drag/resize edge handles as local buttons/ARIA, keeping the touch alternative, matching
      `GanttTaskBarRenderer.ts:119-146` and `GanttDragHandler.ts:48-58`
      (`src/views/calendar-timeline-renderer.ts:1430-1460`)
- [x] T010 Wire the new link seam into `calendar-timeline-renderer.ts:158-170`'s action contract; no direct
      local dependency renderer existed before this task
      — evidence: optional persistence action at `calendar-timeline-renderer.ts:173`; dots/drag/keyboard/two-click resolution at `:609-778`; dependency line projection at `:532-570`; rejection notices use all three locale blocks in `src/i18n.ts:838-847, 2501-2510, 4131-4140`
- [x] T011 Reconcile `styles.css` `db-timeline-*` rules against `gantt.css:1-17`, `:237-277`, under the
      acquired `css-lane` hold (`styles.css:16759-16760` region)
      — evidence: local token hierarchy, scale grid, weekend/today fills, progress/milestone, link dots/line, hover/drag and reduced-motion rules at `styles.css:16750-16773, 16876-17052, 17717-17869`; lane check accepted the changed stylesheet while held
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T012 Run unit tests for padding/min-span and link-rejection cases; observe green after T004/T005
      — evidence: `npx vitest run` 78 files / 682 tests green, 2026-09-03 (33 new tests across
      `calendar-interaction-model.test.ts` and `calendar-timeline-model.test.ts`)
- [ ] T013 Verify placement and observer/DOM teardown unchanged after the port
- [ ] T014 Verify keyboard and touch-menu equivalents exist for every rewritten drag/resize/link affordance
- [x] T015 Recapture and read screenshots at all five zoom levels (day/week/month/quarter/year)
      — evidence: 20 timeline captures read (day/week/month/quarter/year x desktop/mobile x light/dark;
      week keeps its pre-existing name `timeline-view-{desktop,mobile}-{light,dark}.png`), plus
      `panel-record-detail-sheet-body-empty-desktop-light.png` read separately (byte noise, no layoutHash move) — 21 total
- [x] T016 Release the `css-lane` hold with a `reviewed` array naming the recaptured screenshots
      — evidence: release entry at `tools/lane/css-lane.json` naming all 21 changed captures;
      `node tools/lane/check-lane.mjs` (no `SURFACE_PHASE`) — "check-lane: release names all 21 changed
      capture(s)", exit 0, 2026-09-03
- [x] T017 Run `npm run gate`; read the full output and exit status; read
      `tools/lane/gate-logs/<lane>.log` for any red lane before claiming done
      — evidence: `SURFACE_PHASE=037-timeline-gantt-port npm run gate` — "gate: PASS — 25 green, 0 red for
      a declared reason", exit 0, 2026-09-03; plain `npm run gate` (lane released) — same 25/25 green, exit 0
- [x] T018 In-runtime fresh verifier re-runs the browser gate and `validate.sh --strict` itself (D14 leg c;
      a delegate's own report is a claim, not a result)
      — evidence: both gate runs above are this dispatch's own fresh observation, not a relayed claim;
      `validate.sh --strict` run against this packet, first `RESULT: PASSED`, 2026-09-03
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase 4: 1:1 Reference Port (Amendment 2026-09-04, REQ-007)

- [ ] T019 Write a red-first DOM-structure parity test walking the reference's `GanttView` output
      shape — REQ-007.
      — evidence to close: the test is observed failing against the current (pre-amendment)
      renderer before any port line lands, naming the exact structural gap.
- [ ] T020 `cli-devin` leg: port `GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/
      `TimelineConfig.ts`'s DOM structure and class vocabulary 1:1 onto
      `calendar-timeline-renderer.ts` — REQ-007, REQ-002, REQ-003.
      — evidence to close: T019's parity test turns green; the dependency-link seam and
      visible-window/backlog/invalid-event/group-limit behavior named in REQ-002/REQ-003 are
      unchanged by hunk-range inspection of the diff.
- [ ] T021 `cli-codex` leg: copy `gantt.css` verbatim where its rules apply into the
      `css-lane`-held `styles.css` `db-timeline-*` region, with the MIT notice attached to the
      copied block, and update the screenshot fixtures to match — REQ-007.
      — evidence to close: `css-lane` acquired before the edit and released only after a
      recapture that is actually read; local extensions (visible-window rendering, unscheduled
      backlog, invalid-event repair, group/lane limits, touch menu, keyboard link buttons, the
      viewport-centred window) render only behind a new default-off setting.
- [ ] T022 Fresh in-runtime verifier reads the recaptured timeline screenshots side by side with
      the reference's own screenshots or the operator's vault comparison — REQ-007.
      — evidence to close: a session that did not run T020/T021 opens both sets of captures and
      states, per element, whether structure/class/visual language/row-height/unit-width defaults
      match; T019's parity test re-run green by this same fresh session.
<!-- /ANCHOR:phase-4 -->

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
