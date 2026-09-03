---
title: "Feature Specification: Harness Fidelity and Replay"
description: "Three DONE-table rows unticked on the 2026-09-03 audit share one shape: a gate check, or the replay that re-asserts it, reading a value a device would not. This phase closes the chart and calendar renderer-coverage gap, backfills replay entries for every landed result, and either removes or declares every harness-only dependency the audit named."
trigger_phrases:
  - "harness fidelity and replay"
  - "042 harness fidelity"
  - "chart renderer coverage"
  - "calendar week day coverage"
  - "replay backfill"
  - "capture manifest content hash"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/042-harness-fidelity-and-replay"
    last_updated_at: "2026-09-03T23:50:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from the parent's 2026-09-03 DONE-table audit (rows 3, 5, 6)"
    next_safe_action: "Run the AC-1 and AC-2 census commands and record their output before writing any code"
    blockers: []
    key_files:
      - "../goal.md"
      - "spec.md"
      - "acceptance-criteria.md"
      - "tools/live/render-assertion-harness.ts"
      - "tools/live/replay.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-042"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the manifest compare fix belong in check-lane.mjs's changedCaptures(), or in a new comparator both check-lane and a future release tool call"
      - "Is the embedded chart view constructed the same way as the other six renderers, or does chart-renderer.ts need its own bag member"
    answered_questions: []
---
# Feature Specification: Harness Fidelity and Replay

> Phase chain: parent [`../spec.md`](../spec.md). Opened from
> [`../goal.md`](../goal.md) §3's 2026-09-03 audit (rows 3, 5, 6). Prior art for the harness this
> phase extends: [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md)
> (the instrument-truthfulness repair) and
> [`../026-production-render-assertions/spec.md`](../026-production-render-assertions/spec.md) (the
> gate lane this phase's coverage work extends). Predecessor: `041-shared-ui-ux-port`.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

The 2026-09-03 audit unticked two of the parent's seven DONE-table rows and left one unaudited
gap named in the third. Row 3: no gate check constructs the production chart renderer, and the
calendar lane only ever builds `scale: "month"` — week and day are never constructed. Row 5:
`npm run replay` still only covers the five phases it shipped with; nothing landed since is
re-asserted, including three releases and five port-phase landings. Row 6: `runtime-vars.css`
pins a calendar variable to a viewport formula this program's own `039` log already found wrong,
and two gate lanes (`touch-targets`, `unstyled-links`) read hand-written fixtures rather than a
constructed renderer.

**Key Decisions**: Every new scenario carries its own negative control, observed red before
green (parent D2, D4). Replay entries are backfilled with the recorded pre-fix number each
verifier already measured, not a number derived after the fact.

**Critical Dependencies**: `026`'s `render-assertion-harness.ts` and `render-assertions.mjs` (the
mechanism this phase extends); `031`'s `85ff504` and `98da630`/`0c92f4d` (the fixes this phase's
replay entries hold); `039`'s log entry on `getCellMinHeight()` (the fact this phase's
runtime-vars.css fix corrects).

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 — `recommend-level.sh --loc 650 --files 10 --architectural` scores 61/100 (mid-range Level 2, 8 points under the Level 3 floor); a fuller estimate reflecting the touch-targets/unstyled-links refactor implied by row 6 (`--loc 850 --files 12 --architectural`) scores 66/100, 4 points under the floor. Raised to Level 3 per the operator's "go higher if in doubt" instruction and parity with `020-harness-fidelity-repair`, the closest prior art for this exact class of work (harness-truthfulness repair across multiple gate lanes), which is itself Level 3. |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-03 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Phase** | 42 of 42 |
| **Predecessor** | `041-shared-ui-ux-port` |
| **Successor** | None |
| **Handoff Criteria** | All five requirements below `Met`; `goal.md` completion criteria all ticked with their observed-red evidence; parent `spec.md` Phase Documentation Map and `roadmap.md` §5 both carry this phase's landed state. |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 42** of the Component Surface System. It closes the three DONE-table rows the
parent's 2026-09-03 audit unticked or narrowed (rows 3, 5, 6) and records one structural fact the
audit surfaced but did not require a row for: the capture harness is not byte-deterministic.

**Scope Boundary**: gate-lane and harness-instrument truthfulness only — chart and calendar
renderer coverage, replay backfill, and the row-6 dependency list. No product-facing fix, no
`styles.css` edit beyond what row 6's dependency audit may require, and no device confirmation
(this phase reaches Verified by construction, per `026`'s D5 — never Operator-confirmed).

**Dependencies**:
- `026-production-render-assertions` — the render-assertion mechanism (`render-assertion-harness.ts`, `render-assertions.mjs`, `renderer-coverage.json`) this phase's row-3 work extends.
- `020-harness-fidelity-repair` — the evidence-freshness and fixture-truthfulness precedent this phase's row-6 work follows.
- `008-integration-and-release-observability` — owns `replay.mjs`'s original five-phase coverage; this phase backfills what it never grew to cover.
- `031-sheet-lifecycle-ownership` — source of the `98da630`, `0c92f4d` and `85ff504` fixes this phase's replay entries hold.

**Deliverables**:
- A chart-renderer render-assertion scenario and calendar week/day scenarios, each with an owned negative control.
- Replay entries for report 29, reports 34-36, and phases 037-041, each carrying its recorded pre-fix number.
- Each row-6 dependency either removed (harness reads the constructed renderer or the product's real value) or declared with the criterion it cannot prove.
- The capture manifest compare corrected to a content-hash or declared-tolerance basis.

**Changelog**:
- When this phase closes, refresh the matching file in `../changelog/` using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Three DONE-table rows in the parent's `goal.md` share one shape: a check's green, or the replay
that re-asserts it, does not cover what its own wording claims. `chart` is a live,
user-selectable `DatabaseViewType` (`src/data/types.ts:317`, `settings.ts:78`) with no
render-assertion scenario at all (`grep -in chart tools/live/render-assertion-harness.ts` returns
nothing); the calendar lane only ever calls `makeCalendarConfig(columns, "month")`
(`render-assertion-harness.ts:1077`), leaving `scale: "week"` and `scale: "day"` unconstructed
despite `calendar-renderer.ts` supporting all three. `npm run replay` re-asserts 8 results from
phases `000`, `001`, `002`, `004` and `005` only — nothing landed since is covered, including
report 29's fix, reports 34-36's fix, and five port-phase landings. And three harness
dependencies can make a check green in a way a device would not: `runtime-vars.css` pins
`--db-calendar-day-min-height` to `calc((100vh - 150px) / 5)` where production's
`getCellMinHeight()` (`calendar-renderer.ts:2196`) defaults to a fixed `112px`, config-driven,
never viewport-derived; `touch-targets.mjs` and `unstyled-links.mjs` both
`import { SCENARIOS } from "../screenshots/scenarios.mjs"` and call `scenario.html()` rather than
constructing a renderer; and `theme.css` never declares Obsidian's own `.mod-cta`
(`grep -n mod-cta tools/screenshots/theme.css` returns nothing).

A fourth, structural fact belongs in the same repair: the capture harness is not byte-deterministic.
The parent's own Traps log records that an identical rerun moved 2 files on one run and a different
set on a later one — no floor to read a diff against, because the set itself varies — and that the
right instrument is `layoutHash`, not a file count, because 0 of 240 manifest entries moved by
that measure across the same runs. `tools/lane/check-lane.mjs`'s `changedCaptures()`
(`:84`) reads the changed set from `git status --porcelain` — a byte-level diff — while
`tools/screenshots/capture.mjs` already computes a `layoutHash` per entry (`:332-333`) that this
comparison does not use, so a release can be forced to name a capture that moved no layout pixel.

### Why It Matters

This program exists because a release passed every gate and changed nothing on device, and its
own D1 states the general form: a check that does not drive the production path proves nothing.
An uncovered renderer and a replay that stops growing are the same failure at the gate-coverage
layer — a green result that stopped meaning what it once meant. A manifest compare that reads
byte noise as a layout change is the same failure inverted: it makes a real regression
indistinguishable from paint jitter, which is exactly the noise `020`'s blank-and-identical
capture rejection exists to cut through.

### Goals

- Every view named in `DatabaseViewType` that is live and user-selectable has a render-assertion
  scenario, with the calendar lane covering all three scales it ships.
- `npm run replay` re-asserts every landed result this program has shipped since phase `005`,
  each held against its recorded pre-fix number.
- Every dependency row 6 names is either removed or declared with the exact criterion it cannot
  prove, so row 6 can be honestly ticked or left with a bounded, named list.
- The capture manifest compare stops reading antialiasing noise as a changed capture.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- `tools/live/render-assertion-harness.ts` and `tools/live/render-assertions.mjs` — a chart
  renderer scenario, and calendar `"week"`/`"day"` scenarios, each with an owned negative control.
- `tools/live/renderer-coverage.json` — the coverage stamp, moved from 6 of 22.
- `tools/live/replay.mjs` and `tools/live/replay.json` — entries for report 29, reports 34-36, and
  phases `037`-`041`, each carrying its recorded pre-fix number.
- `tools/screenshots/runtime-vars.css` — the pinned `--db-calendar-day-min-height` /
  `--db-calendar-month-week-min-height` formula, either removed or declared with the criterion it
  cannot prove.
- `tools/live/touch-targets.mjs`, `tools/live/unstyled-links.mjs` — the `scenarios.mjs` fixture
  dependency, either routed to the constructed renderer or declared.
- `tools/screenshots/theme.css` — Obsidian's `.mod-cta` rule, added or the gap declared.
- `tools/lane/check-lane.mjs` — `changedCaptures()`, corrected to compare by content/layout hash
  or a declared tolerance rather than raw git byte-diff.

### Out of Scope

- Any product-facing (`src/`) fix. This phase measures and repairs instruments; a defect an
  instrument reveals belongs to the phase that owns the surface, per `020`'s own precedent.
- Device confirmation of any kind. Per `026`'s D5, this phase reaches Verified by construction.
- `tools/screenshots/capture.mjs`'s fixtures in `scenarios.mjs` themselves, beyond what row 6's
  dependency audit requires — a structural rewrite of the fixture set is a larger decision than
  this phase's scope.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|--------------|
| `tools/live/render-assertion-harness.ts` | Modify | Add a chart-renderer scenario and calendar `"week"`/`"day"` scenarios, each with an owned negative control |
| `tools/live/render-assertions.mjs` | Modify | Register and run the new scenarios |
| `tools/live/renderer-coverage.json` | Modify | Re-stamped coverage after the new scenarios land |
| `tools/live/replay.mjs` | Modify | Add claim entries for report 29, reports 34-36, and phases `037`-`041` |
| `tools/live/replay.json` | Modify | Re-stamped after the new claims land |
| `tools/screenshots/runtime-vars.css` | Modify | Remove or declare the pinned calendar-height formula |
| `tools/live/touch-targets.mjs` | Modify | Route to the constructed renderer, or declare the fixture dependency with its criterion |
| `tools/live/unstyled-links.mjs` | Modify | Same as `touch-targets.mjs` |
| `tools/screenshots/theme.css` | Modify | Declare `.mod-cta`, or record it as an accepted gap with its criterion |
| `tools/lane/check-lane.mjs` | Modify | `changedCaptures()` compares by content/layout hash or a declared tolerance |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | A render-assertion scenario constructs the production chart renderer and asserts a thresholded property of what it builds, with an owned negative control observed red before green. |
| REQ-002 | Render-assertion scenarios construct the production `CalendarRenderer` at `scale: "week"` and `scale: "day"`, not only `"month"`, each with an owned negative control and bounds set from measured reads. |
| REQ-003 | `npm run replay` carries a claim entry for report 29 (`98da630`, `0c92f4d`), reports 34-36 (`85ff504`), and phases `037`-`041`'s landings, each with its recorded pre-fix number; the replay lane reds when a required entry is missing. |
| REQ-004 | Each dependency row 6 names — the pinned `runtime-vars.css` calendar formula, `touch-targets.mjs`/`unstyled-links.mjs` reading hand-written fixtures, `theme.css`'s absent `.mod-cta` — is either removed (the harness reads the constructed renderer or the product's real value) or declared with the exact criterion it cannot prove. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | The capture manifest compare (`check-lane.mjs`'s `changedCaptures()`) is corrected to compare by content/layout hash or a declared tolerance, recording the known fact that six captures move between identical runs. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Renderer coverage (`tools/live/renderer-coverage.json`) increases from 6 of 22 and
  includes the chart renderer and the calendar week/day scales, each with a red-before-green
  control.
- **SC-002**: `npm run replay`'s claim count grows from 8 and includes every landed result named
  in this phase's scope, each held against its recorded pre-fix number.
- **SC-003**: Row 6's dependency list is either empty (every dependency removed) or a named,
  bounded list, each entry carrying the criterion it cannot prove.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `026`'s render-assertion mechanism | New scenarios cannot be added if the harness's bag/scenario contract has since drifted | Read `render-assertion-harness.ts` in full before adding a scenario; reuse its existing bag members |
| Dependency | `031`'s fix commits (`98da630`, `0c92f4d`, `85ff504`) | A replay entry naming a commit that was rebased or amended cites the wrong SHA | Verify each SHA against `git log` before writing the claim |
| Risk | Chart view has no existing bench harness to model a scenario on (unlike list/table) | A first-of-its-kind scenario may need more scaffolding than the calendar week/day extension | Read `chart-renderer.ts`'s constructor and public surface before estimating; extend the existing bag pattern rather than inventing a new one |
| Risk | The capture manifest fix touches a release-gating file (`check-lane.mjs`) | A wrong tolerance either hides a real regression or keeps false churn | A/B the corrected comparator against a clean HEAD clone per parent D12, and require the fix to still catch a deliberately mutated capture |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: N/A. This phase adds gate-lane assertions and replay entries; it does not change a render path's runtime cost.

### Security
- **NFR-S01**: N/A. No auth, network or persistence surface is touched.

### Reliability
- **NFR-R01**: The gate (`npm run gate`) exits 0 after every change in this phase, read from `$?` directly.

---

## 8. EDGE CASES

### Data Boundaries
- A date-driven calendar scenario (week/day) rendering an empty window: assert a non-zero
  drawn-item count before the per-item bound, per `026`'s D6/N4 precedent — an empty window
  passes every per-item bound trivially.
- A chart scenario with no series configured: the negative control must exercise a state the
  chart renderer actually produces, not an invented one (parent D12).

### Error Scenarios
- A replay claim naming a commit no longer in `git log`: the replay lane must red rather than
  silently skip the entry.
- A manifest-compare tolerance set too loosely: require the A/B control in §6 to still catch a
  deliberately mutated capture before the tolerance is accepted.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 20/25 | Files: ~10, LOC: ~650-850, Systems: render-assertion harness, replay, capture manifest, two capture-fixture lanes |
| Risk | 12/25 | Auth: N, API: N, Breaking: N — but touches a release-gating file (`check-lane.mjs`) and the gate's own truthfulness contract |
| Research | 12/20 | Reading four existing harness files in full before extending each |
| Multi-Agent | 6/15 | External lane per D14 (devin initial pass, then codex/luna), in-runtime verification with Chrome |
| Coordination | 9/15 | Depends on `026`, `020`, `008`, `031` per §"Phase Context" |
| **Total** | **59/100** | Recommend-level.sh scored 61-66/100 (Level 2 range); raised to Level 3 per the operator's "go higher if in doubt" and parity with `020` |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | A new chart or calendar scenario's negative control is not owned — the same green-for-the-wrong-reason failure `020` repaired | M | M | Every new control must be demonstrated failing on a defect that is present, per `020`'s own governing rule |
| R-002 | A replay entry's "recorded pre-fix number" is invented rather than the number the original verifier measured | H | L | Cite the exact verifier report and number from `goal.md`/`roadmap.md` for each entry; no derived number |
| R-003 | Removing a row-6 dependency (e.g. the pinned calendar CSS variable) changes a capture a downstream lane depends on | M | M | Recapture and diff the affected scenarios before landing; declare rather than remove if the blast radius is unclear |

---

## 11. USER STORIES

### US-001: A gate that can see the views it claims to cover (Priority: P0)

**As** a fresh reviewer verifying the parent's DONE-table row 3, **I want** a render-assertion
scenario for every live, user-selectable view, **so that** "a gate check constructs a production
renderer for every view" is true of the gate rather than of six-sevenths of it.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-001, AC-002).

---

### US-002: A replay that grows with the program (Priority: P0)

**As** an operator reading `npm run replay`'s output, **I want** every landed result re-asserted
against its recorded pre-fix number, **so that** a regression in a release the program already
shipped is caught rather than silently uncovered.

**Acceptance criteria:** see `acceptance-criteria.md` (AC-003).

---

## 12. OPEN QUESTIONS

- Does the manifest-compare fix belong inside `check-lane.mjs`'s `changedCaptures()`, or in a
  shared comparator both `check-lane.mjs` and a future release tool call — deferred to
  implementation, since either satisfies REQ-005 as written.
- Is the chart view constructed through the same bag pattern as the other six renderers, or does
  `chart-renderer.ts` need its own action-bag member — read the constructor before estimating.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `tasks.md`
- **Durable Directive and Criteria**: See `goal.md`
