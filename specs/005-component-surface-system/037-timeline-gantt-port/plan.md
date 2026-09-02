---
title: "Implementation Plan: Timeline/Gantt Port [template:level-2/plan.md]"
description: "Ordered port steps from obsidian-pm's Gantt view into calendar-timeline-renderer.ts, gated red-before-green, run under the D14 external lane order and the css-lane protocol for styles.css."
trigger_phrases:
  - "timeline gantt port plan"
  - "037 plan"
  - "timeline port steps"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Timeline/Gantt Port

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin) |
| **Framework** | Obsidian plugin API; no external UI framework |
| **Storage** | Frontmatter on `TFile` notes, via the local row/action pipeline |
| **Testing** | Local unit tests (`*.test.ts`), placement/teardown/screenshot harness, `npm run gate` |

### Overview
Rewrite obsidian-pm-main's Gantt geometry, controls, header/grid, bar rendering, save-on-release drag, and
dependency linking into `calendar-timeline-renderer.ts`'s existing action contract and CSS-unit model,
extending `calendar-timeline-model.ts` and `calendar-interaction-model.ts` where the reference's behavior has
no local equivalent (dependency links), and reconciling `styles.css` `db-timeline-*` rules under the lane
protocol.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented (`spec.md`)
- [x] Success criteria measurable (`spec.md` §5)
- [x] Dependencies identified (`spec.md` §6, `036-obsidian-pm-ui-harvest/research/research.md`)

### Definition of Done
- [ ] All acceptance criteria met (`acceptance-criteria.md`)
- [ ] `npm run gate` passes green for this packet's changed files
- [ ] Docs updated (spec/plan/tasks/acceptance-criteria)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Renderer + pure-function data/interaction model (existing local pattern): `calendar-timeline-renderer.ts`
owns DOM/lifecycle, `calendar-timeline-model.ts` owns pure model building, `calendar-interaction-model.ts`
owns pure drag/resize/create math. The port keeps this three-layer split; it does not introduce a parallel
Gantt view class (`GanttView.ts:124-135` is explicitly not adopted as a second view).

### Key Components
- **`calendar-timeline-renderer.ts`**: DOM build, event wiring, drag/resize handle dispatch, teardown.
- **`calendar-timeline-model.ts`**: `buildTimelineModel`, tick/band building, lane assignment — extended with
  reference padding/min-span semantics and a dependency-link data shape.
- **`calendar-interaction-model.ts`**: pure `resolveTimedDragRange`/`resolveDayMoveChange`/etc — extended with
  a `resolveTimelineLinkChange`-shaped function for same-side/duplicate/missing-task/cycle rejection.

### Data Flow
Row data (`RowData[]`) -> `buildTimelineModel` (pure) -> renderer builds DOM from the model -> user
drag/resize/link interaction -> pure resolver in `calendar-interaction-model.ts` computes the change ->
`actions.updateEventDates`/new link action commits once on release, matching `GanttDragHandler.ts:48-58`'s
save-once contract.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes
and task state. The gate order below is fixed by `036-obsidian-pm-ui-harvest/research/research.md:398`
(adoption plan row 1, "Gate order" column) and D3 (observed red before green):

1. **Red first.** Write or run an adapter/unit test against the current renderer's dependency-link seam (which
   does not exist yet) so the first observed result is a failure, not an assumption. Record the failing
   value (e.g., "no `resolveTimelineLinkChange` export, TypeError" or "link action not wired, no-op").
2. **Adapter/unit tests.** Extend `calendar-timeline-model.ts` and `calendar-interaction-model.ts` per the
   module map (`spec.md` §3); write/extend unit tests for padding/min-span and link rejection cases.
3. **Placement/teardown.** Wire the rewritten controls, header/grid, bars, and link seam into
   `calendar-timeline-renderer.ts`; verify placement and observer/DOM teardown.
4. **Keyboard/touch.** Verify drag/resize/link affordances have a keyboard and touch-menu equivalent, per the
   local requirement to keep touch menu and keyboard (`spec.md` §3 "Must differ / keep local").
5. **Screenshot scales.** Recapture screenshots at all five zoom levels (day/week/month/quarter/year) and
   read them before claiming a visual match to `gantt.css:1-17`, `:237-277`.
6. **`npm run gate`.** Run the full gate; read `tools/lane/gate-logs/<lane>.log` for any red lane.

### External lane order (D14, `../goal.md` §"directive")

- (a) Initial pass through `cli-devin` on `deepseek-v4-flash-max` under `--permission-mode dangerous`
  (operator-approved for this repo's worktree).
- (b) Then `gpt-5.6-luna` at `model_reasoning_effort=xhigh` or `max`, `service_tier=fast`, through `cli-codex`
  or `cli-opencode`.
- (c) In-runtime verification is unchanged: a fresh agent runs the browser gate and `validate.sh` itself,
  because sandboxed and cloud lanes cannot reach Chrome. In-runtime delegates default to Sonnet 5; Opus only
  where genuinely better. Never Fable, never fork. A delegate's "COMPLETE" report is a claim, not a result
  (D4) — the in-runtime gate run is the authority.
- Before composing any `cli-devin` or `cli-codex` prompt, read that CLI's `SKILL.md` first (AGENTS.md §5 CLI
  dispatch rule).

### CSS lane protocol (`styles.css`)

`styles.css` is lane-held: `tools/lane/css-lane.json`. Acquire (holder + history entry) before editing.
Release only after a recapture that is read, naming the changed captures in a `reviewed` array. An unclaimed
edit is refused by gate lane `css-lane`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `buildTimelineModel` padding/min-span, `resolveTimelineLinkChange` rejection cases | Local test runner (`*.test.ts`) |
| Integration | Placement, teardown, keyboard/touch, drag/resize/link commit | Placement/teardown harness, `npm run gate` |
| Manual/Screenshot | Five zoom levels visually reconciled against reference hierarchy | Screenshot capture + read (no browser claim without a read) |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `036-obsidian-pm-ui-harvest/research/research.md` | Internal (this program) | Green — closed with 10/10 spot-check | Citation source unavailable; port would need re-derivation |
| `tools/lane/css-lane.json` | Internal (repo tooling) | Must be acquired before editing `styles.css` | `css-lane` gate refuses an unclaimed edit |
| `specs/context/obsidian-pm-main` | Internal (read-only reference) | Present, unedited | Citations become unverifiable if moved/edited |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: `npm run gate` fails after the port lands, or a screenshot recapture shows a regression at any
  of the five zoom levels.
- **Procedure**: Revert the scoped diff to `calendar-timeline-renderer.ts`, `calendar-timeline-model.ts`,
  `calendar-interaction-model.ts`, and `styles.css`; release the `css-lane` hold if acquired; re-run the gate
  to confirm the pre-port baseline is restored.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Adapter/unit tests | Med | Per module-map row, 40-280 LOC (see `spec.md` §3 table sourced from `research/research.md:93-109`) |
| Placement/teardown + link seam | High | New dependency-link seam is unscoped surface, not a like-for-like port |
| Screenshot/keyboard/touch verification | Med | Five zoom levels x drag/resize/link affordances |
| **Total** | | **1,100-1,500 LOC** (`research/research.md:111-113`) |
<!-- /ANCHOR:effort -->
