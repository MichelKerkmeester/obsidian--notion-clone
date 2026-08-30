---
title: "Goal: Production Render Assertions"
description: "What would make phase 026 worth having done, and the criteria that decide it."
trigger_phrases:
  - "026 goal"
  - "production render assertions goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/026-production-render-assertions"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Goal authored from the 007 harvest; failing numbers measured, nothing built"
    next_safe_action: "Build control N1 before AC-1, so the first assertion is falsifiable first"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-026-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the coverage ratchet belong in the gate or in the evidence stamp"
      - "Is the embed's thinner action bag a defect or intentional"
    answered_questions: []
---
# Goal: Production Render Assertions

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** At least one gate check constructs a renderer the plugin ships and asserts a
thresholded property of what it builds, so the gate can notice a renderer regression.

This phase is the founding failure of the program in its second, sharper form. **The gate runs
fourteen checks and none of them constructs a production renderer.** Twenty-two files under
`src/views/` export a `*Renderer`; two are imported by anything under `tools/`; neither of those two
is a gate check. That gap is not theoretical — it shipped. A quadratic list render blocked the main
thread for 6.8 seconds at 1,600 rows and passed `tsc`, the unit suite, 224 captures, story coverage
and the placement check on the way out. Every one of those gates measured something real. **None of
them ran the row loop.**

**The correction that makes this phase small rather than large.** "The harness renders hand-written
markup and imports nothing from `src/`" is true of the **screenshot fixtures only**.
`verify-placement.mjs` esbuilds fifteen shipped `src/views` modules and measures them in a real
browser, and `tools/bench/` already imports the real `TableRenderer` and `ListRenderer` and drives
them in headless Chrome. The expensive half exists. The real gap is narrower: the benches emit
timings rather than assertions, exercise one action bag rather than both hosts', are run by hand, and
appear in no gate entry.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Reuse the bench mechanism rather than build a second one. |
| D2 | Assert at the **renderer** boundary. The hosts extend Obsidian classes and need a live `App`; the renderers do not, which is the whole reason the bench works. |
| D3 | Coverage is a **ratchet**, not a target. A number that starts at 2 and cannot go down survives; a sprint to 22 rots. |
| D4 | No row is recorded Met until its control has been observed failing. The phase *is* a harness, so this is the rule it is most at risk of breaking. |
| D5 | This phase reaches Verified by construction and **Operator-confirmed never**. It must not be recorded as contributing to an operator confirmation. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] A gate check constructs a renderer imported from `src/views/` and asserts a thresholded
      property of what it builds. Today **0 of 14**. The threshold is not "14 → 15": adding a line to
      `CHECKS` is trivially satisfiable and proves nothing.
- [ ] `TableRenderer` and `ListRenderer` are both constructed by that check. Today 2 of 22
      importable, 0 reached by a gate.
- [ ] Both hosts' action bags drive the same renderer in one run, and a bag missing a member the
      renderer calls **fails rather than passing quietly**. Today 0 of 2. The file view's bag has 26
      members and the embed's 18, differing by nine — `openRecordDetail` among them, which is the
      row-click behaviour the list exists for.
- [ ] Deleting one row-level affordance from the renderer's output makes an assertion go red, naming
      the affordance.
- [ ] **Feeding the check a fixture DOM in place of renderer output fails**, with a message that says
      so. This is the load-bearing control: every other criterion could be satisfied by a harness that
      photographs a fixture and calls it a render.
- [ ] The check is red on `173819e^` and green on the fixed tree. It asserts the **shape**, not a
      timing threshold — the bench already owns the 2,000ms budget and duplicating it would create
      two systems for one number.
- [ ] Renderer coverage is published as a number out of 22 and cannot decrease.
- [ ] A green run **states in its own output what it does not prove**: no Obsidian host constructed,
      no device, and `App` absent so vault-resolving fields render unresolved.
- [ ] All six controls N1-N6 observed failing and recorded with the command that produced each,
      including N5 — removing the new `CHECKS` entry must leave `npm run gate` at exit 0, which is
      what stops "the gate has 15 checks" from being satisfied by a check that runs nothing.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Implemented on 2026-08-30.** Takes no stylesheet lane — a phase that needs the lane to prove a
renderer has confused two things.

### Why the three existing checks cannot close this

The unit suite runs `environment: "node"` with no DOM, so a renderer assertion there is not weak
evidence, it is no evidence. The captures photograph hand-written markup, so a renderer change and a
capture are independent artefacts that happen to resemble each other. And the placement check bundles
production code — the technique this phase needs, already proven — but its DOM comes from the same
hand-written scenarios, so it answers where a popover lands and never what a row loop builds.

### What it cannot do, said here so nobody looks for it

It does not construct `DatabaseView` or `EmbeddedDatabaseRenderer`, so it proves nothing about
dispatch, about a view kind being selected, or about anything either host does around the renderer it
builds. That gap belongs to `009` and to the device. The runner says so in its own output on every
green run.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Assertion runner | Built | `tools/live/render-assertions.mjs` + `tools/live/render-assertion-harness.ts`; 40 assertions green at `845a27c` |
| Gate entry | Built | `render-assertions` at `tools/gate.mjs:67`; red at `173819e^` proves it can fail |
| Both action bags | Exercised | 2 of 2; both bags drive both renderers; difference printed by name on every run |
| Six controls | Run | N1-N4 and N6 red as specified, recorded verbatim in `acceptance-criteria.md` §3; N5 reds attributed to concurrent-session movement, clean form pending the CSS lane landing |
| Coverage number | 2 of 22 | `tools/live/renderer-coverage.json` through the evidence stamp; ratchet enforced by the check |

### Deviations and findings

| Item | Note |
|------|------|
| Numbers re-read rather than inherited | The gate now has 16 checks and six `tools/` importers (was 14 and 4) because concurrent sessions landed work mid-implementation; recorded in the criteria rows |
| AC-3 census corrected | The published 18/9 census missed `expandGroup` (4-space indent quirk) and counted `includeWidthActions` (an option literal, not a member); precise census: 26/19, eight file-view-only members |
| N5's clean form deferred | `npm run gate` exit 0 with the entry removed needs the CSS lane's mid-edit `styles.css` artefacts re-stamped; the observation is recorded with its four unrelated reds |
<!-- /ANCHOR:log -->
