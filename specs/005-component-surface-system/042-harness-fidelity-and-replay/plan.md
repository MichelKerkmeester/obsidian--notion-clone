---
title: "Implementation Plan: Harness Fidelity and Replay"
description: "How the chart/calendar coverage gap, the replay backfill, and the row-6 dependency audit get closed, in gate-red-first order."
trigger_phrases:
  - "harness fidelity plan"
  - "042 plan"
  - "replay backfill plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Harness Fidelity and Replay

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (`render-assertion-harness.ts`, `chart-renderer.ts`, `calendar-renderer.ts`), Node ESM (`.mjs` gate lanes) |
| **Framework** | None — direct construction of the plugin's own renderer classes against a headless DOM/bench harness |
| **Storage** | None — gate artefacts are JSON files under `tools/live/` |
| **Testing** | The gate lanes themselves (`render-assertions`, `replay`, `touch-targets`, `unstyled-links`, `device-parity`) plus `npm run gate` |

### Overview
Extend `026`'s render-assertion mechanism to cover the chart renderer and the calendar's week/day
scales; backfill `replay.mjs` with claim entries for every landed result since phase `005`; audit
and close or declare the row-6 harness dependencies; and correct the capture manifest's
changed-capture detection from a byte-level git diff to a content/layout-hash basis.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented (`spec.md` §2-3)
- [x] Success criteria measurable (`spec.md` §5, `goal.md` §3)
- [x] Dependencies identified (`spec.md` §"Phase Context")

### Definition of Done
- [ ] All acceptance criteria met (`acceptance-criteria.md`)
- [ ] `npm run gate` exits 0, read from `$?` directly, no stray Chrome process before the run
- [ ] Docs updated (spec/plan/tasks/goal), backfilled and validated
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Instrument repair and coverage extension on an existing harness (`020`/`026`'s pattern), not new
product architecture.

### Key Components
- **`render-assertion-harness.ts`**: constructs production renderer instances against both action
  bags; this phase adds a chart scenario and two calendar scenarios (week, day).
- **`replay.mjs`**: re-asserts a fixed claim list against recorded pre-fix numbers; this phase
  extends the claim list.
- **`check-lane.mjs`**: gates a release on every git-changed capture being named in `reviewed`;
  this phase corrects its changed-set detection.

### Data Flow
A scenario builds a config object, constructs the real renderer class, mounts it, and the harness
reads DOM/layout properties off the mounted output — never a hand-written fixture. The gate lane
runs every scenario and stamps `renderer-coverage.json` / `replay.json` with the measured
counts, exiting 1 if a ratchet would decrease.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase
checkboxes and task state.

**Gate order — red-first, per parent D3 (a criterion needs a threshold and a failing number,
observed red before green):**

1. For each new scenario (chart, calendar week, calendar day) and each row-6 remediation, first
   measure and record the failing/uncovered state as it exists today.
2. Only then write the fix or the new scenario.
3. Re-run the same check and record the passing number.
4. A tick without both numbers is not a tick, per this program's own rule (`epic-traps.md`).

**External lane order — per parent D14:**

1. An initial pass through cli-devin on `deepseek-v4-flash-max` under `--permission-mode
   dangerous`.
2. Then `gpt-5.6-luna` at `model_reasoning_effort=xhigh` or `max`, `service_tier=fast`, through
   cli-codex or cli-opencode.
3. In-runtime verification is unchanged: a fresh agent runs the browser gate and `validate.sh`
   itself, because sandboxed and cloud lanes cannot reach Chrome. No browser number from a
   sandboxed or cloud lane is evidence.

**Worktree**: one worktree per lane, per the repository's git workspace safety rules — never a
shared working tree across a code lane and a docs lane.

**CSS lane protocol**: only invoked if `styles.css` is touched. This phase's in-scope files are
`runtime-vars.css` and `theme.css` (both under `tools/screenshots/`, not the product stylesheet),
so the CSS lane hold (`tools/lane/css-lane.json`) is not expected to be needed — acquire it only
if a row-6 remediation turns out to require a `styles.css` edit, and record why in `goal.md`'s log
if that happens.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Gate lane | Chart/calendar scenario construction, negative controls | `node tools/live/render-assertions.mjs`, `npm run gate` |
| Gate lane | Replay claim backfill | `node tools/live/replay.mjs`, `npm run replay` |
| Gate lane | Row-6 dependency removal/declaration | `node tools/live/touch-targets.mjs`, `node tools/live/unstyled-links.mjs` |
| A/B control | Manifest-compare fix | Compare against a clean HEAD clone per parent D12; must still catch a deliberately mutated capture |
| Manual | External-lane result verification | In-runtime Opus/Sonnet agent running the browser gate and `validate.sh --strict` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `026-production-render-assertions` (render-assertion harness) | Internal | Green | New scenarios cannot be added without the existing bag/scenario contract |
| `031-sheet-lifecycle-ownership` (`98da630`, `0c92f4d`, `85ff504`) | Internal | Shipped | Replay entries cite these SHAs; a rebase invalidates the citation |
| `037`-`041` port-phase landings | Internal | Shipped (`037`-`039`, `041`); `040` pending 1.4.7 | Replay entries for a not-yet-shipped landing wait on the release |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: A new scenario or dependency fix causes `npm run gate` to red for a reason unrelated
  to this phase's own controls, or the manifest-compare fix hides a real regression in its A/B
  control.
- **Procedure**: Revert the specific scenario/fix commit; the gate lane and coverage/replay JSON
  stamps are regenerated from source, so no manual data repair is needed.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Coverage (chart + calendar week/day) ──────┐
                                            ├──► Verification (gate + docs backfill)
Replay backfill ────────────────────────────┤
Row-6 dependency audit ─────────────────────┘
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Coverage | `026`'s harness contract | Verification |
| Replay backfill | Confirmed SHAs from `031`, `037`-`041` | Verification |
| Row-6 audit | Coverage (some deps only close once the constructed renderer exists) | Verification |
| Manifest-compare fix | None | Verification |
| Verification | All four above | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Coverage (chart + calendar) | Medium | One session |
| Replay backfill | Low-Medium | One session |
| Row-6 dependency audit | Medium | One session |
| Manifest-compare fix + A/B | Medium | One session |
| **Total** | | **~2-4 sessions** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Every new/changed gate lane observed red before the fix, per D1
- [ ] `npm run gate` exits 0 with no stray Chrome process (`pgrep` empty) before and after

### Rollback Procedure
1. `git revert` the specific commit for the failing scenario/fix.
2. Re-run `npm run gate` to confirm the prior green state.
3. Re-stamp `renderer-coverage.json` / `replay.json` if their contents no longer match source.

### Data Reversal
- **Has data migrations?** No — all artefacts are regenerated JSON stamps.
- **Reversal procedure**: N/A
<!-- /ANCHOR:enhanced-rollback -->

---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌───────────────┐     ┌────────────────┐     ┌──────────────┐
│  026 harness  │────►│ Chart/calendar │────►│ Verification │
│   contract    │     │   coverage     │     │   (gate 0)   │
└───────────────┘     └────────────────┘     └──────┬───────┘
                                                      │
                       ┌──────────────┐        ┌──────▼──────┐
                       │ Replay + row │───────►│  Docs +      │
                       │  6 audit     │        │  backfill    │
                       └──────────────┘        └─────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| Chart scenario | `render-assertion-harness.ts` contract | `renderer-coverage.json` stamp | Verification |
| Calendar week/day scenarios | Same | Same | Verification |
| Replay entries | Confirmed SHAs | `replay.json` stamp | Verification |
| Row-6 fixes | Chart/calendar scenarios (for the fixture-vs-renderer swap) | Removed or declared dependency list | Verification |
| Manifest-compare fix | None | Corrected `changedCaptures()` | Verification |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **Read `render-assertion-harness.ts` in full** - required before any scenario write - CRITICAL
2. **Chart + calendar week/day scenarios, red-first** - CRITICAL
3. **Row-6 dependency swap to constructed renderer** - depends on (2) - CRITICAL

**Total Critical Path**: three sequential steps; replay backfill and the manifest-compare fix can
run in parallel with the critical path.

**Parallel Opportunities**:
- Replay backfill and the manifest-compare fix can run alongside the coverage work.
- `touch-targets.mjs` and `unstyled-links.mjs` remediation can run in parallel once the calendar
  scenario exists to route them to.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | Coverage extended | Chart + calendar week/day scenarios green with owned controls | REQ-001, REQ-002 met |
| M2 | Replay backfilled | Every landed result since `005` re-asserted | REQ-003 met |
| M3 | Row 6 closed or bounded | Every dependency removed or declared | REQ-004 met |
| M4 | Manifest compare corrected | `changedCaptures()` on content/layout-hash basis, A/B'd | REQ-005 met |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

No ADR opened yet. If a row-6 dependency proves un-removable without a larger rewrite (e.g. a
structural change to `scenarios.mjs`), record the decision to declare rather than remove in
`decision-record.md` at that time — this file does not exist yet because no ADR-worthy decision
has been made.

---
