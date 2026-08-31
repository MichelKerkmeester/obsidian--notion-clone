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
    last_updated_at: "2026-08-31T08:20:00Z"
    last_updated_by: "renderer-coverage-extension"
    recent_action: "Coverage 2 to 6 of 22; the added timeline scenario caught a live quadratic at 964 reads"
    next_safe_action: "Re-run N5 on a quiet tree: drop the entry, require gate exit 0 at 15 of 15"
    blockers:
      - "N5 needs a tree with no src/ or styles.css edit in flight; one is in flight now"
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
      - "What threshold would have caught a per-row scan that costs no layout read"
    answered_questions:
      - "Ratchet placement: the check enforces it (fails before stamping) and the stamp dates it"
      - "2 of 22 is a floor, not coverage: a second defect shipped through the uncovered 20"
      - "The bound needed no recalibration; pointing it at a fourth renderer caught a live quadratic at 964 reads"
      - "A windowed view drawing nothing passes every per-item bound, so a non-zero drawn-item count is asserted first"
---
# Goal: Production Render Assertions

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** At least one gate check constructs a renderer the plugin ships and asserts a
thresholded property of what it builds, so the gate can see a renderer regression.

**The founding failure.** Fourteen gate checks, none constructing a production renderer — so a
quadratic list render blocked the main thread 6.8 seconds at 1,600 rows and passed `tsc`, the unit
suite, 224 captures, story coverage and placement. The expensive half existed already;
assertions, both bags and a gate entry did not.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Reuse the bench mechanism; do not build a second one. |
| D2 | Assert at the **renderer** boundary: the hosts need a live `App`, the renderers do not. |
| D3 | Coverage is a **ratchet**, not a target. A floor that cannot go down survives; a sprint to 22 rots. |
| D4 | No row is Met until its control has been observed failing. The phase *is* a harness. |
| D5 | This phase reaches Verified by construction, and **Operator-confirmed never**. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [x] A gate check constructs a renderer from `src/views/` and asserts a thresholded property of
      it. Was **0 of 14**. **Met:** `render-assertions` asserts `layoutReads <= 8`, `rowAppends === 0`.
- [x] `TableRenderer` and `ListRenderer` are both constructed by it. Was 0 reached by any gate.
      **Met:** both, four scenarios. `CalendarRenderer`, `CalendarTimelineRenderer`,
      `BoardRenderer` and `GalleryRenderer` were added after, taking the check to **twelve
      scenarios across six renderers**, each driven by both bags.
- [x] Both hosts' bags drive the same renderer in one run, and a bag missing a member the renderer
      calls **fails rather than passing quietly**. Was 0 of 2. **Met:** a lost member fails twice:
      bag-shape diff, row-click.
- [x] Deleting one row-level affordance reds an assertion naming it. **Met:** both are per-row
      counts named for the affordance. N1.
- [x] **A fixture DOM fed in place of renderer output fails**, saying so — the load-bearing control,
      since every other criterion could be met by photographing one. **Met:** the render call
      marks its container and provenance runs first, gating the rest. N2.
- [x] Red on `173819e^`, green on the fixed tree, asserting **shape** not timing — the bench owns
      the budget. **Met:** 1600 layout reads against a bound of 8, then 2. N3.
- [x] Renderer coverage is published out of 22 and cannot decrease. **Met:** now **6 of 22**,
      recomputed each run; the ratchet exits 1 **before** stamping. N6. Calendar, Timeline,
      Board and Gallery were all added, so **every view the operator reported now has a
      production-renderer assertion.** The remaining sixteen are panels, cells and chrome.
- [x] A green run **states what it does not prove**: no host, no device, `App` absent. **Met:** all
      three print on the pass path.
- [ ] All six controls N1-N6 observed failing, each with its command — including N5, where removing
      the `CHECKS` entry must leave `npm run gate` at exit 0. **Not met:** N5's only run exited 1 on
      reds owned by other sessions, and it needs a quiet tree; `src/` is under edit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Implemented on 2026-08-30.** Takes no stylesheet lane — a phase that needs the lane to prove a
renderer has confused two things.

### The uncovered twenty hid a third defect, and coverage is now 6 of 22

The argument below was written when this lane covered two renderers, and it has since been paid out
exactly as predicted. `calendar-timeline-renderer.ts` — named here as uncovered and as the packet's
largest unknown — was carrying a forced layout per event, the *precise* shape `layoutReads <= 8` is
built to catch. It had shipped because nothing constructed that renderer, not because the bound was
wrong. Adding the scenario reads **964 layout reads against a bound of 8** on the pre-fix tree and
**5** after, and it fails on both bags.

That is the ratchet argument's strongest evidence and its sharpest limit in one: the threshold was
already correct and already written, and it caught nothing for as long as nobody pointed it at the
renderer. D3 makes 6 a floor. Board and Gallery were added in the same pass and read **1 layout
read** each, which is the earlier per-card hoist holding — previously true and unguarded. Every
view named in an operator report is now asserted; the sixteen still uncovered are panels, cells
and chrome, none of which build a per-row loop.

The calendar was added in the same change and reads **zero** layout reads. It is covered against a
regression it does not currently have, which is what a ratchet is for.

**A bound needs a non-empty sample under it.** Both date-driven views draw a window and will render
nothing at all if their anchor is not pinned — one fixture here reported a clean pass over zero
event bars before that was found. Each new scenario therefore asserts that the view drew something
*before* its per-item bound, because an empty window satisfies every per-item bound trivially. That
is D6 with a specific instrument, and it is the failure mode a coverage number invites: a scenario
can be counted, run, and green while measuring an empty view.

### The uncovered twenty hid a second defect, and the covered two could not see it

The lane exists and it is real. It also just watched a second superlinear term ship through the
renderer it does cover. The list's freeze had two causes, not one: the forced layout per row, which
this lane's `layoutReads <= 8` bound is exactly shaped to catch, and **a per-row scan over the whole
row set to decide whether a basename is shared**, which costs no layout read and appends no row.
The lane's two thresholds are `layoutReads` and `rowAppends`. A scan moves neither.

That is not a defect in the lane; it is the boundary of what a read-count bound can express, and it
belongs in the record because the obvious next move — "the list is covered now" — is wrong. It is
covered against one shape of regression.

Worse for the ratchet argument: **that same defect shipped in `board-renderer.ts` and
`gallery-renderer.ts`**, both of which have no production-renderer assertion of any kind, and
neither of which had a bench to notice. `calendar-renderer.ts` and `calendar-timeline-renderer.ts`
are in the same position and are now the packet's largest unknown (`../028-remaining-freezes`). D3
makes 2 a floor rather than a failure. A floor is still not coverage.

### The evidence behind each tick

| Criterion | Evidence |
|---|---|
| Gate entry constructs a renderer | `render-assertions` → `node tools/live/render-assertions.mjs` at `tools/gate.mjs:67`; harness imports both renderers at `tools/live/render-assertion-harness.ts:33-34`; thresholds `layoutReads <= MAX_LAYOUT_READS` bound **8** (`:72`, `:517-521`) and `rowAppends === 0` (`:541-548`) |
| Both renderers constructed | `new ListRenderer(app, bag)` (`:504`), `new TableRenderer(bag)` (`:531`), four scenarios at `tools/live/render-assertions.mjs:58-61` |
| Both bags, and a missing member fails | Pinned bag-shape diff reports `missing …` and pushes a failure (`:237-243`); row-click assertion returns false when `bag.openRecordDetail` is absent (`harness:429-437`). Census 26/19 with eight file-view-only members |
| Affordance deletion reds a named assertion | `row open affordance is one per row` vs `button.db-list-row-open` (`harness:376-380`); `row checkbox affordance is one per row` vs `input.db-list-row-checkbox` (`:381-385`). N1 |
| Fixture DOM refused | `data-production-render` set by the render call (`harness:224`, `:236`); `provenanceResult` first, "refusing DOM without a bundled-renderer marker" (`:255-267`); everything else gated on `results[0].pass` (`:518`, `:540`). N2 |
| Red then green on shape | N3: red at `173819e^` (`f27da7f`), "1600 layout reads during render, bound 8"; green at `845a27c`, "2 layout reads during render, bound 8" |
| Coverage ratchet | `tools/live/renderer-coverage.json` publishes `"constructed": 6, "total": 22`; total recomputed each run (`render-assertions.mjs:256-260`); exits 1 before stamping when `constructed < published` (`:266-272`). N6 |
| Green run states its exclusions | `tools/live/render-assertions.mjs:300-302` |

### The run N5 still owes

On a tree where `npm run gate` is independently green — every `tools/live/*.json` artefact freshly
stamped and **no `src/` or `styles.css` edit in flight** — delete only the `render-assertions` entry
from `CHECKS` (`tools/gate.mjs:67`), run `npm run gate >log 2>&1; echo $?`, and require **exit 0 with
15 of 15 checks green**; then restore the entry against its recorded sha256 and require **exit 0 with
16 of 16**. The measured quantity is the gate's exit status with and without the entry; the threshold
is 0 in both runs. Any other exit code on the 15-check run leaves AC-1 measured against the file
rather than against the entry, which is the substitution N5 exists to rule out.

The precondition is the whole difficulty, and today it is unmet by construction: `src/` and
`styles.css` are under active edit, so a gate number taken now describes neither tree.

### The gap was narrower than the slogan

"The harness renders hand-written markup and imports nothing from `src/`" is true of the
**screenshot fixtures only**. `verify-placement.mjs` esbuilds fifteen shipped `src/views` modules
and measures them in a real browser, and `tools/bench/` already imported the real `TableRenderer`
and `ListRenderer`. That correction is what made this phase small rather than large: the benches
emitted timings rather than assertions, exercised one action bag rather than both, ran by hand, and
appeared in no gate entry.

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
| Assertion runner | Built | `render-assertions.mjs` + `render-assertion-harness.ts`; 40 assertions green at `845a27c` |
| Gate entry | Built | `render-assertions` at `tools/gate.mjs:67`; red at `173819e^` proves it can fail |
| Both action bags | Exercised | 2 of 2; both bags drive both renderers; difference printed by name each run |
| Six controls | 5 of 6 | N1-N4 and N6 red as specified. N5 has no clean observation; its precondition is unmet while `src/` is being edited |
| Coverage number | 6 of 22 | `renderer-coverage.json` through the evidence stamp; ratchet enforced by the check |
| Calendar and timeline | Covered | Eight scenarios, both bags; timeline reads 964 → 5 against a bound of 8 across the fix |
| Board and gallery | Covered | 1 layout read each against a bound of 8; the earlier per-card hoist is now guarded |

### Deviations and findings

| Item | Note |
|------|------|
| The bound was right and blind | The timeline shipped a forced layout per event that `layoutReads <= 8` catches at 964. Nothing was wrong with the threshold; nothing constructed the renderer. Coverage, not calibration, was the gap |
| An empty window passes every bound | A windowed view renders nothing when its anchor is unpinned, and every per-item bound then passes trivially. Each date-driven scenario asserts a non-zero drawn-item count ahead of its bound |
| A read-count bound cannot see a scan | The list's second superlinear term costs no layout read and appends no row, so both of this lane's thresholds are blind to it. Recorded, not fixed: the threshold that would catch it is an open question, not an obvious edit |
| Numbers re-read rather than inherited | The gate has 16 checks and six `tools/` importers (was 14 and 4) because concurrent sessions landed work mid-implementation |
| AC-3 census corrected | The published 18/9 census missed `expandGroup` (4-space indent quirk) and counted `includeWidthActions` (an option literal, not a member); precise census 26/19, eight file-view-only members |
| N5's clean form still deferred | Its precondition — a tree with nothing in flight — has not existed on any day this phase has been worked |
<!-- /ANCHOR:log -->
