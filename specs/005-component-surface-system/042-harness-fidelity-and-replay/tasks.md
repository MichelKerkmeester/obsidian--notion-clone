---
title: "Tasks: Harness Fidelity and Replay"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "042 tasks"
  - "harness fidelity tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Harness Fidelity and Replay

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

- [x] T001 Read `tools/live/render-assertion-harness.ts` in full and confirm the existing bag/scenario contract before extending it (`tools/live/render-assertion-harness.ts`)
      Evidence: the contract now carries a calendar `scale` member (`render-assertion-harness.ts:171`) and a `"chart"` renderer (`:172`); the scenario runner branches at `:1182` (calendar) and `:1222` (chart).
- [x] T002 Read `src/views/chart-renderer.ts`'s constructor and public surface to determine whether it fits the existing bag pattern (`src/views/chart-renderer.ts`)
      Evidence: `ChartRenderer` is constructed with no arguments (`chart-renderer.ts:266-272`); its bag is the actions object the render call takes, and both hosts pass the same two members — `database-view.ts:10634-10641`, `embedded-database-renderer.ts:804-817`. The harness builds the same bag (`render-assertion-harness.ts:511-516`) and the runner's census pins it (`render-assertions.mjs:190`).
- [x] T003 [P] Confirm each replay-entry SHA (`98da630`, `0c92f4d`, `85ff504`, `037`-`041`'s landing commits) still exists in `git log` (repo)
      Evidence: `git log -1 --format="%h %s"` on `98da630`, `0c92f4d`, `85ff504`, `0262386`, `55bff9b`, `b9e2321`, `a6fcd31`, `57043e7`, `1588576`, `1d611db`, `00b7bd2`, `cb9aedf`, `25ae3a9` — all thirteen resolve on this worktree's history; each commit body and the owning phase's `goal.md` supplied the recorded red/green numbers the replay entries carry (`tools/live/replay.mjs:241-539`).
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Measure and record the chart view's current renderer-coverage state (uncovered) before writing any scenario (`tools/live/renderer-coverage.json`)
      Evidence: before this leg, `grep -in chart tools/live/render-assertion-harness.ts` returned nothing and the stamp read `constructed: 6` (`renderer-coverage.json` pre-edit). After: `constructed: 7` distinct renderers of 22 renderer files (`renderer-coverage.json:21`), published 6 → 7.
- [x] T005 Add a chart-renderer render-assertion scenario with an owned negative control, observed red before green (`tools/live/render-assertion-harness.ts`, `tools/live/render-assertions.mjs`)
      Evidence: scenario at `render-assertions.mjs:86` (registered), constructed at `render-assertion-harness.ts:1222-1241`; assertions at `:1023-1042`; provenance tag at `:614`. Red first: `RENDER_READ_CONTROL=per-item node tools/live/render-assertions.mjs` — `chart/file-view: no forced layout inside the chart build — 1630 layout reads during render, bound 48`, exit 1. Green: disarmed run reads 30 against the same bound, exit 0. Bound basis: the measured 30 (theme token reads + Chart.js canvas sizing) plus margin, far below the armed 1630.
- [x] T006 Measure and record the calendar lane's current scale coverage (month-only) before writing the week/day scenarios (`tools/live/render-assertion-harness.ts`)
      Evidence: the pre-edit runner called `makeCalendarConfig(columns, "month")` only; the lane now constructs all three scales (`render-assertion-harness.ts:1195`), with scenarios registered at `render-assertions.mjs:80-83`.
- [x] T007 Add calendar `scale: "week"` and `scale: "day"` scenarios, each with an owned negative control and bounds set from measured reads (`tools/live/render-assertion-harness.ts`, `tools/live/render-assertions.mjs`)
      Evidence: week/day branches at `render-assertion-harness.ts:1199-1201`, assertion suite at `:1000-1016`. Red first (armed): week 14 reads vs bound 8, day 1600 vs 8, both bags, exit 1. Green: both read 0 vs 8, exit 0 — the measured basis (0 reads at both scales) is the recorded bound basis. Week arms the shared per-item seam; day cannot exceed the bound through that seam (a day column caps its all-day lanes at six), so it arms the per-row render-entry control (`:1097-1105`), the same shape the bound exists to catch.
- [x] T008 Re-stamp `renderer-coverage.json` and confirm the ratchet does not decrease (`tools/live/renderer-coverage.json`)
      Evidence: stamped `constructed: 7, total: 22` (`renderer-coverage.json:21-22`); the lane wording is `coverage 7 distinct renderers of 22 renderer files exercised by this check (published 6 → 7)`, exit 0. The count is distinct renderer names via `countConstructed` (`render-assertions.mjs:362`, `tools/live/render-scenario-utils.mjs`).
- [x] T009 [P] Add replay claim entries for report 29 (`98da630`, `0c92f4d`), each with its recorded pre-fix number (`tools/live/replay.mjs`)
      Evidence: `98da630`: the static parent-tree probe is 0 → delegated runtime result 0; the named teardown case must be PASS with `1 backdrop(s) and 1 sheet(s) left after the host wrapper was removed` as its pre-fix failure. `0c92f4d`: the static parent-tree probe is 0 → delegated runtime result 0; the named rebuild case records `dismissed the sheet — the press is not reaching the bar, and every gesture above is passing for that reason rather than its own`. Missing artifacts or cases return 1.
- [x] T010 [P] Add replay claim entries for reports 34-36 (`85ff504`), each with its recorded pre-fix number (`tools/live/replay.mjs`)
      Evidence: `85ff504`: the static parent-tree probe is 0 → delegated runtime result 0 across the three real sort/filter rebuild cases; the red lives in `sheet-rebuild.json`, whose pre-fix failure text is `a tap inside the panel the rebuild just created read as OUTSIDE`.
- [x] T011 [P] Add replay claim entries for phases `037`-`041`'s landings, each with its recorded pre-fix number; skip `040` until 1.4.7 ships if it has not by the time this task runs (`tools/live/replay.mjs`)
      Evidence: `tools/live/replay.mjs`. Parent-tree → current pairs, each re-measured by running this entry's own measure on `<sha>^`, are `0262386: 5 → 0`, `55bff9b: 0 → 5` (kept), `b9e2321: 1 → 10`, `a6fcd31: 2 → 0`, `57043e7: 4 → 0`, `1588576: 1 → 0`, `1d611db: 2 → 0`, `00b7bd2: 0 → 2` (kept), `cb9aedf: 1 → 0`, and `25ae3a9: 10 → 0`; `040` remains included.
- [x] T012 Confirm the replay lane reds when a required entry is deliberately removed, then restore it (`tools/live/replay.mjs`)
      Evidence: the claim-set ratchet still compares 21 entries with the published count and returns 1 when an entry is removed. The mutation set retains delegated runtime pairs `0 → 0` × 3 and static pairs `5 → 0`, `0 → 5`, `1 → 10`, `2 → 0`, `4 → 0`, `1 → 0`, `2 → 0`, `0 → 2`, `1 → 0`, `10 → 0`; runtime entries also return 1 when their artifact, named case, PASS state, or recorded pre-fix failure text is absent.
- [x] T013 [P] Remove or declare the pinned `--db-calendar-day-min-height` / `--db-calendar-month-week-min-height` formula in `runtime-vars.css`, citing `getCellMinHeight()`'s real default (`tools/screenshots/runtime-vars.css`)
      Evidence: `tools/screenshots/runtime-vars.css:57-63` now pins the product default `112px` for both variables (the renderer writes `config.calendarCellMinHeight ?? 112` clamped to 72-400 at `calendar-renderer.ts:2196-2199` and never measures the pane), replacing the `calc((100vh - 150px) / 5)` viewport formula and its stand-in comment. Removed, not declared: the harness now carries the product's real value.
- [x] T014 [P] Route `touch-targets.mjs` to the constructed renderer where the calendar/chart scenarios now cover it, or declare the remaining fixture dependency with its criterion (`tools/live/touch-targets.mjs`)
      Evidence: declared, not routed — the pipeline rewrite is out of this phase's scope. See the fixture-lane provability record below.
- [x] T015 [P] Route `unstyled-links.mjs` the same way (`tools/live/unstyled-links.mjs`)
      Evidence: declared, not routed. See the fixture-lane provability record below.
- [x] T016 [P] Declare or add Obsidian's `.mod-cta` rule to `theme.css` (`tools/screenshots/theme.css`)
      Evidence: `tools/screenshots/theme.css:309-318` declares `button.mod-cta { background-color: var(--interactive-accent); --text-color: var(--text-on-accent); }`, transcribed from the installed application stylesheet of Obsidian 1.13.4 (`/Applications/Obsidian.app/Contents/Resources/obsidian.asar`, `app.css` `button.mod-cta` — the 1.13.4 bundle on this machine; the hover and mobile-tap arms are omitted because a capture has no pointer, mirroring the `mod-warning` precedent). Blast radius: two fixture sources carry `mod-cta` (`tools/screenshots/scenarios/core.mjs` empty-state, `tools/screenshots/scenarios/temporal.mjs` calendar-empty-state); their captures photograph the accent fill after recapture.
- [ ] T017 Correct `check-lane.mjs`'s `changedCaptures()` to compare by content/layout hash or a declared tolerance instead of raw git byte-diff (`tools/lane/check-lane.mjs`)
      Note: not part of the initial pass (D14 leg a); the manifest-compare leg owns this row.
- [ ] T018 A/B the manifest-compare fix against a clean HEAD clone; confirm it still catches a deliberately mutated capture (repo, per parent D12)
      Note: same leg as T017.
- [x] T024 [P] Add replay claim entries for the six open-row fixes landed on `main` after `037`-`041` shipped (`7e36671`, `535373a`, `a251a43`, `3f143df`, `fa58c7f`, `b29bf7f`), each with its recorded pre-fix number (`tools/live/replay.mjs`)
      Evidence: each entry's own measure was re-run on `<sha>^`, extracted via `git archive` into a scratch directory (never `git checkout` against a shared work-tree, which would have dirtied the index). Pre-fix -> recorded pairs: `7e36671: 0 -> 2` (the empty-column and drop-language scenarios did not exist, so `SCENARIOS.find` returned undefined for both); `535373a: 0 -> 2` (neither host binding's board `moveRowToPosition` callback carried a `subtaskMove` parameter); `a251a43: 0 -> 1` (`.db-surface` appeared in no reduced-motion rule); `3f143df: 0 -> 1` (`.db-surface` was still joined into the same rule as `.note-database-container`, not its own). `fa58c7f: 0 -> 4` (none of `getTimelineTitleWindow`'s third parameter, the first-tick `transform: "none"` branch, `resolveTimelineMilestoneLabelPlacement`, or `TIMELINE_DAY_PHONE_UNIT_WIDTH_PX`'s 32px branch existed in source); `b29bf7f: 0 -> 2` (no `.is-label-above` rule and `row-gap` still read the flat 4px, not `var(--db-space-8)`). One correction to the dispatch brief that named this task: the brief's prose swapped `3f143df` and `a251a43`'s descriptions — `git show` on both commits and the parent `goal.md` log (`005-component-surface-system/goal.md`, "`041`'s last open row closed" entry) confirm `a251a43` is the selector-list join and `3f143df` is the one that splits `.db-surface` into its own zero-duration rule; the claims above are written against the verified commit content, not the swapped prose. `node tools/live/replay.mjs`: 27 claims, `reversed: 0`, exit 0. Mutation control: `recorded` moved by one on the `535373a` entry, re-run reported `replay: FAIL — 1 result(s) reversed`, restored and re-verified green.
<!-- /ANCHOR:phase-2 -->

---

### Fixture-lane provability record (touch-targets, unstyled-links)

Both lanes read hand-written fixture markup (`scenarios.mjs` `html()`) against `styles.css` plus
the harness stand-ins — they never construct a renderer. The render-assertion lane is the
constructed-renderer check, and it is where a renderer regression must be caught. Recorded here
is exactly what each fixture lane can and cannot prove, so the row-6 dependency list stays
bounded and named:

**`tools/live/touch-targets.mjs`** can prove: for every scenario fixture at phone width under a
coarse pointer, each interactive element's bounding box clears the 28px floor; the coarse-pointer
premise holds on every measured page; and the count of sub-floor controls does not grow past the
recorded baseline. It cannot prove: (1) anything about an element no fixture contains — a control
the renderer builds that no fixture mirrors is invisible to this lane, and the render-assertion
lane is the check that constructs the renderers; (2) the real renderers' output — fixture markup
can drift from what the renderers build, which is exactly the failure the provenance marker and
the fixture-parity tests exist to catch; (3) hit area — a bounding box is not a hit area, so an
overlapping element or a parent-carried press can still make a clearing control hard to hit; (4)
any device behaviour — no device is involved.

**`tools/live/unstyled-links.mjs`** can prove: no link in any fixture resolves to a user-agent
default colour in either theme, and the harness's link tokens resolve. It cannot prove: (1) links
the fixtures do not contain; (2) links the real renderers build, for the same fixture-vs-renderer
reason as above; (3) that a colour the harness supplies equals the colour the host supplies — the
lane catches silence (a token the harness never defines) but not disagreement (a token the harness
defines wrongly), which is the pinned-values scan's half of the pair.

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T019 `SURFACE_PHASE=042-harness-fidelity-and-replay npm run gate`, `$?` read directly, no stray Chrome process before the run (`pgrep` empty)
      Evidence: `pgrep -fl "Google Chrome"` was cleared before the run; `npm run gate`, `$?` read directly: `0`, 25 green / 0 red. Re-run a second time with the same clean-`pgrep` precondition for this task's own evidence: `0`, unchanged.
- [x] T020 `npm run replay`, `$?` read directly, confirm the new claim count and every `held: true`
      Evidence: `node tools/live/replay.mjs`, `$?` read directly: `0`, "replay: PASS — all 27 results still hold", `reversed: 0`. Was 21 claims before this pass.
- [ ] T021 External lane per D14: devin initial pass, then codex/luna, then in-runtime verification with Chrome
- [x] T022 Update `goal.md`'s completion criteria with the observed red/green pair for each ticked row
      Evidence: `goal.md`'s replay completion-criterion row (§3) updated with the six new pre-fix -> recorded pairs; scoped to the row this task covers, not the four unrelated rows the manifest-compare and external-lane tasks own.
- [x] T023 Backfill graph metadata, run `validate.sh --strict` on this child, `build-operator-checklist`, `scan-failing-values`
      Evidence: `backfill-graph-metadata.ts 042-harness-fidelity-and-replay` run; `validate.sh --strict` first `RESULT:` line `PASSED`; `build-operator-checklist` regenerated; `scan-failing-values.mjs` exit 0.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] `npm run gate` exits 0
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Durable Directive**: See `goal.md`
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

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available (T001-T003 confirm before implementation starts)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns (mirrors `026`'s scenario/bag structure)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] `npm run gate` and `npm run replay` both exit 0
- [ ] CHK-022 [P1] Every new negative control observed red before its fix
- [ ] CHK-023 [P1] Manifest-compare fix A/B'd against a clean HEAD clone
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each row-6 dependency has a finding class: removed (`class-of-bug`) or declared (`instance-only`, bounded).
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed for the two fixture-reading lanes (`touch-targets.mjs`, `unstyled-links.mjs`).
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for `changedCaptures()` — every caller of `check-lane.mjs`'s comparison logic.
- [ ] CHK-FIX-004 [P0] N/A — no security/path/parser/redaction surface in this phase's scope.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count listed before completion is claimed (per-scenario red/green pairs).
- [ ] CHK-FIX-006 [P1] N/A — no process-wide global state read by these checks.
- [ ] CHK-FIX-007 [P1] Every replay-entry evidence pinned to its exact fix SHA, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] N/A — no secrets, auth or authz surface in this phase's scope.
- [ ] CHK-031 [P0] N/A
- [ ] CHK-032 [P1] N/A
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/goal synchronized
- [ ] CHK-041 [P1] Code comments carry durable WHY only, no spec paths or phase labels
- [ ] CHK-042 [P2] N/A — no README surface in scope
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
| P0 Items | 10 | 0/10 |
| P1 Items | 8 | 0/8 |
| P2 Items | 2 | 0/2 |

**Verification Date**: Not started
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] N/A unless an ADR is opened (see `plan.md` §"Architecture Decision Record")
- [ ] CHK-101 [P1] N/A
- [ ] CHK-102 [P1] N/A
- [ ] CHK-103 [P2] N/A
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] N/A — no NFR-P performance target in this phase's scope
- [ ] CHK-111 [P1] N/A
- [ ] CHK-112 [P2] N/A
- [ ] CHK-113 [P2] N/A
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented (`plan.md` §7)
- [ ] CHK-121 [P0] N/A — no feature flag
- [ ] CHK-122 [P1] N/A — no runtime monitoring surface
- [ ] CHK-123 [P1] N/A
- [ ] CHK-124 [P2] N/A
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] N/A
- [ ] CHK-131 [P1] N/A
- [ ] CHK-132 [P2] N/A
- [ ] CHK-133 [P2] N/A
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] N/A — no external API
- [ ] CHK-142 [P2] N/A — no user-facing documentation
- [ ] CHK-143 [P2] N/A
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Owner | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
