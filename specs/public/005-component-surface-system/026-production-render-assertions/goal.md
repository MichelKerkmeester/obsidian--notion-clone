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
    last_updated_at: "2026-08-30T21:20:00Z"
    last_updated_by: "goal-reconcile"
    recent_action: "Criteria audited against the tree; 8 of 9 met with file:line, N5 clean form open"
    next_safe_action: "Re-run N5 on a freshly stamped tree: drop the entry, require gate exit 0"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-026-goal"
      parent_session_id: null
    completion_pct: 95
    open_questions:
      - "Is the embed's thinner action bag a defect or intentional"
    answered_questions:
      - "Ratchet placement: the check enforces it (fails before stamping) and the stamp dates it"
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

> Ticks below are settled by reading the tree at `f64dd87`, cited by `file:line`. The
> `render-assertions` lane is not in the 2026-08-30 placement capture — that capture is
> `verify-placement`, a different lane — so no number here is carried from it.

- [x] A gate check constructs a renderer imported from `src/views/` and asserts a thresholded
      property of what it builds. Today **0 of 14**. The threshold is not "14 → 15": adding a line to
      `CHECKS` is trivially satisfiable and proves nothing.
      **Met.** `render-assertions` → `node tools/live/render-assertions.mjs` is a `CHECKS` entry
      (`tools/gate.mjs:67`, 16 entries today); the harness it bundles imports both renderers from
      `src/views/` (`tools/live/render-assertion-harness.ts:33-34`) and asserts named thresholds —
      `layoutReads <= MAX_LAYOUT_READS`, bound **8** (`:72`, `:517-521`), and `rowAppends === 0`
      (`:541-548`).
- [x] `TableRenderer` and `ListRenderer` are both constructed by that check. Today 2 of 22
      importable, 0 reached by a gate.
      **Met.** `new ListRenderer(app, bag)` at `tools/live/render-assertion-harness.ts:504` and
      `new TableRenderer(bag)` at `:531`, driven by the four scenarios at
      `tools/live/render-assertions.mjs:58-61`.
- [x] Both hosts' action bags drive the same renderer in one run, and a bag missing a member the
      renderer calls **fails rather than passing quietly**. Today 0 of 2. The file view's bag has 26
      members and the embed's 18, differing by nine — `openRecordDetail` among them, which is the
      row-click behaviour the list exists for.
      **Met.** The four scenarios at `tools/live/render-assertions.mjs:58-61` are both bags × both
      renderers in one run. A bag that loses a member fails twice over: the pinned bag-shape diff
      reports `missing …` and pushes a failure (`:237-243`), and the file-view row-click assertion
      returns false when `bag.openRecordDetail` is not a function
      (`tools/live/render-assertion-harness.ts:429-437`). The precise census is 26/19 with eight
      file-view-only members, not 26/18 with nine — `acceptance-criteria.md` §2 AC-3 footnote.
- [x] Deleting one row-level affordance from the renderer's output makes an assertion go red, naming
      the affordance.
      **Met.** Both affordance assertions are per-row counts whose names carry the affordance:
      `row open affordance is one per row` compares `button.db-list-row-open` against `rows.length`
      (`tools/live/render-assertion-harness.ts:376-380`), and `row checkbox affordance is one per
      row` does the same for `input.db-list-row-checkbox` (`:381-385`). Deleting either drives the
      count to 0 against a non-zero row count. Observed as N1, `acceptance-criteria.md` §3.
- [x] **Feeding the check a fixture DOM in place of renderer output fails**, with a message that says
      so. This is the load-bearing control: every other criterion could be satisfied by a harness that
      photographs a fixture and calls it a render.
      **Met.** The render call itself sets `data-production-render` on the container it built into
      (`tools/live/render-assertion-harness.ts:224`, `:236`); `provenanceResult` is the first
      assertion and refuses anything else with "refusing DOM without a bundled-renderer marker"
      (`:255-267`); every other assertion is gated behind `results[0].pass` (`:518`, `:540`).
      Observed as N2, `acceptance-criteria.md` §3.
- [x] The check is red on `173819e^` and green on the fixed tree. It asserts the **shape**, not a
      timing threshold — the bench already owns the 2,000ms budget and duplicating it would create
      two systems for one number.
      **Met.** The asserted property is a read count against a fixed bound, not a millisecond
      budget: `layoutReads <= MAX_LAYOUT_READS` with `MAX_LAYOUT_READS = 8`
      (`tools/live/render-assertion-harness.ts:72`, `:517-521`). The two-tree observation is N3 in
      `acceptance-criteria.md` §3 — red at `173819e^` (`f27da7f`), "1600 layout reads during render,
      bound 8"; green at `845a27c`, "2 layout reads during render, bound 8". Carried from that
      record, which is the only place it exists.
- [x] Renderer coverage is published as a number out of 22 and cannot decrease.
      **Met.** `tools/live/renderer-coverage.json` publishes `"constructed": 2, "total": 22`, and
      the total is recomputed each run by counting `src/views/*.ts` files that export a `*Renderer`
      (`tools/live/render-assertions.mjs:256-260`). The ratchet exits 1 **before** stamping when
      `constructed < published` (`:266-272`). Observed as N6, `acceptance-criteria.md` §3.
- [x] A green run **states in its own output what it does not prove**: no Obsidian host constructed,
      no device, and `App` absent so vault-resolving fields render unresolved.
      **Met.** All three exclusions print on the pass path, in the runner's own words, at
      `tools/live/render-assertions.mjs:300-302`.
- [ ] All six controls N1-N6 observed failing and recorded with the command that produced each,
      including N5 — removing the new `CHECKS` entry must leave `npm run gate` at exit 0, which is
      what stops "the gate has 15 checks" from being satisfied by a check that runs nothing.
      **Not met, and nothing that exists settles it.** N1-N4 and N6 are recorded with their commands
      in `acceptance-criteria.md` §3; N5's only recorded run exited 1 on four reds owned by
      concurrent sessions, which measures those sessions rather than the entry.
      **The check that would settle it:** on a tree where `npm run gate` is independently green —
      every `tools/live/*.json` artefact freshly stamped and no `src/` or `styles.css` edit in
      flight — delete only the `render-assertions` entry from `CHECKS` (`tools/gate.mjs:67`), run
      `npm run gate >log 2>&1; echo $?`, and require **exit 0 with 15 of 15 checks green**; then
      restore the entry against its recorded sha256 and require **exit 0 with 16 of 16**. The
      measured quantity is the gate's exit status with and without the entry; the threshold is 0 in
      both runs. Any other exit code on the 15-check run leaves AC-1 measured against the file
      rather than against the entry, which is the substitution N5 exists to rule out.
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

### The half this covers, and the half it does not

The lane constructs `ListRenderer` and `TableRenderer`, and both sources are declared inputs of the
stamp (`tools/live/renderer-coverage.json`), so a change to either dates the artefact and the gate
notices. That is **2 of the 22** `src/views/*.ts` files exporting a `*Renderer`, and it is the first
check in this packet's history to build a production renderer at all — the founding failure, closed
in one direction.

The other direction is open and should not be read as covered. `board-renderer.ts`,
`gallery-renderer.ts`, `calendar-renderer.ts` and `calendar-timeline-renderer.ts` have **no
production-renderer assertion of any kind**. A row-loop regression in any of them is invisible to
the gate in exactly the way the list's was, and those are the views the operator reports freezing
(`../028-remaining-freezes/spec.md` §1). D3 makes 2 a floor rather than a failure — it cannot go
down — but a floor is not coverage.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Assertion runner | Built | `tools/live/render-assertions.mjs` + `tools/live/render-assertion-harness.ts`; 40 assertions green at `845a27c` |
| Gate entry | Built | `render-assertions` at `tools/gate.mjs:67`; red at `173819e^` proves it can fail |
| Both action bags | Exercised | 2 of 2; both bags drive both renderers; difference printed by name on every run |
| Six controls | 5 of 6 | N1-N4 and N6 red as specified, recorded verbatim in `acceptance-criteria.md` §3. N5 has no clean observation: its only run exited 1 on four reds owned by concurrent sessions, so it measured those rather than the entry. The criterion states the run that would settle it |
| Coverage number | 2 of 22 | `tools/live/renderer-coverage.json` through the evidence stamp; ratchet enforced by the check |

### Deviations and findings

| Item | Note |
|------|------|
| Numbers re-read rather than inherited | The gate now has 16 checks and six `tools/` importers (was 14 and 4) because concurrent sessions landed work mid-implementation; recorded in the criteria rows |
| AC-3 census corrected | The published 18/9 census missed `expandGroup` (4-space indent quirk) and counted `includeWidthActions` (an option literal, not a member); precise census: 26/19, eight file-view-only members |
| N5's clean form deferred | `npm run gate` exit 0 with the entry removed needs the CSS lane's mid-edit `styles.css` artefacts re-stamped; the observation is recorded with its four unrelated reds |
<!-- /ANCHOR:log -->
