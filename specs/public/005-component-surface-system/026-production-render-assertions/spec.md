---
title: "Feature Specification: Production Render Assertions"
description: "Fourteen gate checks and none of them constructs a renderer the plugin ships, so a quadratic freeze reached a user through every one. This phase turns the existing production-renderer bench mechanism into a gated assertion harness covering both hosts' action bags."
trigger_phrases:
  - "production render assertions"
  - "renderer harness gate"
  - "026 production render"
  - "gate drives a production renderer"
  - "bench to assertion harness"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/026-production-render-assertions"
    last_updated_at: "2026-08-30T17:00:00Z"
    last_updated_by: "007-harvest"
    recent_action: "Opened from the 007 architecture-research harvest; failing numbers measured, none built"
    next_safe_action: "Run the AC-1 and AC-2 census commands and record their output before writing any code"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "tools/bench/run-list.mjs"
      - "tools/gate.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-026"
      parent_session_id: null
    completion_pct: 95
    open_questions:
      - "Does the ratchet in AC-7 belong in the gate or in the evidence stamp"
    answered_questions: []
---
# Feature Specification: Production Render Assertions

> Phase chain: parent [`../spec.md`](../spec.md). Opened by
> [`../007-architecture-research/harvest.md`](../007-architecture-research/harvest.md) §5, which is
> also where the evidence for every number below is collected. Root causes and the criteria doctrine
> live in [`../architecture-findings.md`](../architecture-findings.md); the harness repair this phase
> builds on is [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md);
> the cross-phase replay that consumes this phase's results is
> [`../008-integration-and-release-observability/spec.md`](../008-integration-and-release-observability/spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

## EXECUTIVE SUMMARY

**The gate runs fourteen checks and none of them constructs a renderer the plugin ships.**
`tools/gate.mjs:40-62` lists every check. Twenty-two files under `src/views/` export a `*Renderer`
class. Two of them are imported by anything in `tools/` — `TableRenderer` at
`tools/bench/table-render-bench.ts:30` and `ListRenderer` at `tools/bench/list-render-bench.ts:31` —
and neither of those two harnesses is a gate check, because `bench` and `bench:list`
(`package.json:16-17`) appear in no `CHECKS` entry.

**That gap is not theoretical; it shipped.** Opening a list view froze Obsidian for 6.8 seconds at
1,600 rows, growing with the square of the row count, and it passed `tsc`, the unit suite, 224
captures, the story coverage check and the placement check on the way out (`173819e`). Every one of
those gates measured something real. None of them ran the row loop.

**The expensive half of the fix already exists.** `tools/bench/run-list.mjs:85-120` esbuilds a
production renderer and drives it in headless Chrome through `playwright-core`, with the Obsidian
`App` supplied as `undefined` because the renderers tolerate a missing metadata cache
(`tools/bench/list-render-bench.ts:171-173`). What is missing is that the bench emits **timings**
rather than **assertions**, exercises one action bag rather than both hosts', and is run by hand.

**Key decisions**: reuse the bench mechanism rather than build a second one; assert at the renderer
boundary rather than attempting to construct the Obsidian host classes; make coverage a published,
ratcheted number rather than a promise; prove the harness against the regression that actually
shipped.

**Critical dependencies**: none. `tools/bench/` and `tools/gate.mjs` both exist and this phase does
not need the CSS lane.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Level:** 2 (Verification) — `recommend-level.sh --loc 450 --files 5 --architectural` scores 55/100
at 92% confidence, phase score 10/50 against a threshold of 25, so this is a flat phase with no
children.
**Status:** Draft — nothing built.
**Owner:** unassigned.
**Lane:** does not take the `styles.css` lane. If this phase is holding the lane, something is wrong.
**Opened:** 2026-08-30, from the 007 harvest.
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM STATEMENT

### What is true today

| Measurement | Value | Command or source |
|---|---:|---|
| Gate checks | 14 | `tools/gate.mjs:40-62` |
| Gate checks that construct a production renderer | **0** | same list; `bench` and `bench:list` are absent |
| `src/views/` files exporting a `*Renderer` class | 22 | `grep -l "export class .*Renderer" src/views/*.ts`, excluding `*.test.ts` and `*.stories.ts` |
| Of those, imported by anything under `tools/` | **2** | `tools/bench/table-render-bench.ts:30`, `tools/bench/list-render-bench.ts:31` |
| Obsidian hosts | 2 | `src/views/database-view.ts`, `src/views/embedded-database-renderer.ts` |
| Host action-bag variants any harness exercises | **0 of 2** | no harness builds either host's bag; the benches build their own minimal one |
| Buildable surfaces no fixture renders | 129 | `tools/live/design-conformance.json`, `measuredAt` 2026-08-30T13:40:32.835Z |

### Why the existing checks cannot close this

Three of them look like they should, and each is blind in a different direction.

**The unit suite runs without a DOM.** `vitest.config.ts:14-17` sets `environment: "node"`. A
renderer assertion in Node is not weak evidence, it is no evidence — there is nothing to render into.

**The captures photograph hand-written markup.** `tools/screenshots/scenarios.mjs:12-17` states it
plainly: *"Every scenario renders the class structure the renderers emit … Markup is hand-written
rather than driven through the real renderers because those need a live Obsidian App, a vault and a
metadata cache."* `REPO RULES.md` repeats it as a property of the harness to keep in mind when
reading a capture. So a renderer change and a capture are independent artefacts that happen to
resemble each other, and 224 green captures say nothing about the code that ships.

**The placement check bundles production code, but not a renderer.** `verify-placement.mjs:52-60`
esbuilds the shipped `popover-position.ts` and measures it in a real browser — the technique this
phase needs, already proven — but its DOM comes from the same hand-written `SCENARIOS`. It answers
where a popover lands, never what a row loop builds.

### The failure this prevents

A property with no value used to hold its column by rendering a full hidden field, three nodes each,
8,000 field elements at 1,600 rows; and each row asked whether it was on a touch device, a question
answered by measuring the container while that same container was being appended to. Every row
re-flowed everything already added. 7,173ms of blocked main thread, quadratic in row count
(`173819e`; `../024-list-view-freeze/acceptance-criteria.md` §2).

Nothing in the gate could see it, and nothing in the gate can see it come back.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In scope

1. **An assertion runner** that mounts production renderers in headless Chrome, reusing the
   esbuild-plus-`playwright-core` mechanism already working in `tools/bench/run-list.mjs`. Assertions
   with thresholds, not timings; exit non-zero on failure, as `run-list.mjs:187-193` already does for
   its budget.
2. **Both hosts' action bags.** The file view wires `openRecordDetail`, `saveCellValue`,
   `editFileName` and grouped-move helpers; the embed omits them
   (`src/views/database-view.ts:784-814` against `src/views/embedded-database-renderer.ts:464-484`).
   Both bag shapes are exercised against the same renderer.
3. **Negative controls**, including one built from a tree that actually failed.
4. **A gate entry** in `tools/gate.mjs`, so the check runs where the other thirteen run.
5. **A published coverage number** — renderers constructed by a gated check, out of 22 — recorded
   through the existing evidence stamp so it dates itself.

### Out of scope, with the reason

| Excluded | Why |
|---|---|
| Constructing `DatabaseView` or `EmbeddedDatabaseRenderer` themselves | They extend Obsidian's `FileView` and `MarkdownRenderChild` and need a live `App`, workspace and metadata cache. The renderers do not — that is the whole reason the bench works. This phase asserts at the renderer boundary and **says so in its own output**, so nobody reads a green run as a host-level proof |
| Covering all 22 renderer classes | A ratchet that starts at 2 and cannot go down is worth more than a sprint to 22 that rots. The two that carry the 29-row list/table gap come first |
| Replacing the screenshot harness | Captures answer a different question — what a surface looks like against the shipped stylesheet. This phase does not photograph anything |
| Taking the `styles.css` lane | No stylesheet edit is needed. A phase that needs the lane to prove a renderer has confused two things |
| Device or operator confirmation | Headless Chrome is not a phone. `009-live-verification` owns the device transport and `008` owns the release decision |
| The list-to-grid migration itself | Owned by `../../006-list-view-clickup/`. This phase builds the instrument that migration needs; it changes no product behaviour |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

| ID | Requirement | Priority |
|---|---|---|
| REQ-001 | At least one gate check constructs a renderer imported from `src/views/` and asserts a thresholded property of what it builds | P0 |
| REQ-002 | `TableRenderer` and `ListRenderer` are both constructed by that check | P0 |
| REQ-003 | Both hosts' action-bag shapes are exercised, and a bag missing a member the renderer calls fails rather than passing quietly | P0 |
| REQ-004 | Deleting a row-level affordance from the production render moves an asserted number | P0 |
| REQ-005 | Substituting hand-written fixture markup for renderer output fails the run | P0 |
| REQ-006 | The check is red on `173819e^` and green on the fixed tree | P0 |
| REQ-007 | Renderer coverage is published as a number out of 22 and cannot decrease | P1 |
| REQ-008 | The runner's output states, in its own text, what a green run does **not** prove — no host construction, no device, no vault | P1 |
| REQ-009 | No spec path, phase number, task id or requirement id appears in any code comment this phase writes | P0 |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Full criteria, with today's failing number and the control for each, are in
[`acceptance-criteria.md`](acceptance-criteria.md). The phase closes when every row there is `Met`,
each control has been observed failing, and the coverage number has been read from a gate run rather
than asserted here.

This phase does **not** close on the operator seeing a difference, because it changes nothing the
operator can see. It closes on an instrument that has been shown to fail.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS

| Risk | Consequence | Mitigation |
|---|---|---|
| The harness becomes a second thing to keep true, and rots | A green check over stale assertions — the failure this phase exists to end, relocated | Assertions are structural properties of what the renderer builds, not snapshots. The evidence stamp dates the coverage number and `tools/gate.mjs:52` already fails on stale artefacts |
| `App: undefined` diverges from a real vault | A pass that a real database would not reproduce | Already true of the bench and already recorded there (`list-render-bench.ts:171-173`): relation resolution is absent, so a real database pays more per field, never less. REQ-008 makes the runner say so |
| Chrome absent on a machine | The check cannot run and someone marks it skipped | Follow the existing convention — `SCREENSHOT_CHROME` overrides the path (`REPO RULES.md`), and the runner fails rather than skips |
| Scope creep toward 22 of 22 | The phase never closes | REQ-007 is a ratchet, not a target. Two is the closing bar |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

1. **Where the ratchet lives.** The coverage number could be a gate assertion of its own, or a field
   in the evidence stamp that `tools/live/evidence.mjs --check-all` already validates for freshness.
   The second is cheaper and reuses a mechanism; the first fails louder. Decide before Phase 6.
2. **Whether the embed's thinner bag is a defect.** The embed omits `openRecordDetail`, so an embedded
   list row cannot open the record panel. That may be intentional. This phase asserts the difference
   exists; whoever owns the embed decides whether it should.
<!-- /ANCHOR:questions -->
