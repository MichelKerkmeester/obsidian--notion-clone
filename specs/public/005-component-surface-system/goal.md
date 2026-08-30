---
title: "Goal: Component Surface System"
description: "The durable directive for the component surface program, and the criteria that decide when it is done."
trigger_phrases:
  - "surface system goal"
  - "005 goal"
  - "component surface directive"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system"
    last_updated_at: "2026-08-30T17:30:00Z"
    last_updated_by: "goal-reconciliation"
    recent_action: "Goal rewritten to current reality; phases 010-019, 024 and 026 gained a goal.md"
    next_safe_action: "Get the operator a build where a non-table view opens, then confirm the sheet drag"
    blockers:
      - "Every non-table view freezes on device - list, board and calendar; 028 is investigating"
      - "Board, Gallery, Calendar and Timeline have no production-renderer assertion"
    key_files:
      - "roadmap.md"
      - "spec.md"
      - "design-system.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-parent"
      parent_session_id: null
    completion_pct: 50
    open_questions:
      - "Does report-driven scheduling replace the declared 009-first order"
    answered_questions:
      - "Reports 7 and 16 had no owning phase; 018 and 019 now own them"
      - "Every phase 000-026 now carries its own goal.md"
---
# Goal: Component Surface System

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Give the plugin's surfaces, sheets, checkboxes, rows and renderers one architecture,
and prove each operator-reported defect fixed **on the operator's device**, not in a harness.

**Why.** A release passed every gate and changed nothing on device. Then a quadratic render
regression shipped past 14 gates, 444 tests and 224 captures, because **no gate check built a
production renderer**. One now does (`026`).

### Decisions

| ID | Decision |
|----|----------|
| D1 | A check that does not drive the production path proves nothing. |
| D2 | A criterion needs a threshold and a failing number, observed red before green. |
| D3 | Shipped, verified and operator-confirmed differ. Only the third closes. |
| D4 | A fresh reviewer verifies. Never self-certify. |
| D5 | A criterion can fail a correct implementation. Check both ways. |
| D6 | Absent evidence is a finding only if the sample could have shown it. |
| D7 | A lane hold permits editing a file. It grants no scope. |
| D8 | A check reading a different environment than what it certifies is decoration. |
| D9 | Read the rule before theorising. Measure the leaf off the viewport origin. |
| D10 | Only the **screenshot fixtures** are hand-written. `verify-placement` bundles shipped modules; `tools/bench/` and the render-assertions lane build real renderers. |
| D11 | One phase holds `styles.css`, released only after a recapture a person looked at. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the phase's own `goal.md` first.** Each binds as if written here.

`000`-`009` are structural; `010`-`019` are operator device reports, `020`-`026` reviews and
research. `roadmap.md` §4 maps report to phase, §5 state, §7 conflicts.

**Precedence.** Decisions outrank child detail, which outranks any summary. Name conflicts; never
resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Every operator report is operator-confirmed on device, **or explicitly deferred by the
      operator with the deferral recorded.** Today 1 of 16, an accepted shortfall.
- [ ] Every view opens on device without freezing. Today only the table does.
- [ ] A gate check constructs a production renderer for **every** view. One lane does now, for
      List and Table; Board, Gallery, Calendar and Timeline have none.
- [ ] `SURFACE_PHASE=<phase> npm run gate` exits 0, read from `$?`, never via a pipe.
- [ ] `npm run replay` re-asserts every landed result against its recorded pre-fix number.
- [ ] No phase's `acceptance-criteria.md` leaves a **data** cell empty or placeholder. Parse the
      table; an adjacent-pipe grep cannot distinguish. See LOG.
- [ ] `validate.sh <this folder> --strict` reports the parent at Errors: 0.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->

## 4. LOG

Volatile. Not part of the directive and not copied into an objective.

### What is broken on device right now

**Every non-table view freezes** — list, board, calendar. The table works. Under investigation in
`028`. `024` fixed the list renderer's quadratic and measured it 8,646.0ms → 246.6ms of blocked main
thread, so whatever remains is either a second cause or lives above the renderer. Treat `024` as
evidence about the row loop, not as evidence that the list opens.

### The two founding failures

**1.3.1.** It passed tsc, build, the unit suite, 196 captures, Storybook and 13 geometry checks, and
changed nothing the operator could see. Every gate measured a mechanism; none measured an outcome.

**The list freeze.** A property with no value held its column by rendering a full hidden field, three
nodes each, 8,000 field elements at 1,600 rows; and every row asked whether it was on a touch device,
a question answered by measuring the container **while that container was being appended to**. Every
row re-flowed everything already added. Quadratic, 7,173ms of blocked main thread, past every gate.
The first failure was about what the checks measured. The second is about what they never construct.

### The big placement one, fixed

Paint containment makes the leaf the containing block for `position: fixed`, and
`positionToolbarPopover` computes viewport coordinates — so every container-mounted surface among its
34 call sites was displaced by the leaf's origin: filter, sort, column manager, view config, cell
editors, toolbar popovers, the date picker. `setPosition` always had the compensating parameter; the
positioner's three callers passed `undefined`. Now wired via `fixedContainingBlock()`, its property
list checked against the browser rather than the docs — no false positives, so a gap under-corrects
and can never overshoot. **Check this first on device.**

### The next one, measured

`app.css:3606` gives every CM6 widget `contain: paint !important` and the plugin registers two
code-block processors. In **Live Preview** an embedded database's popovers are placed correctly, then
clipped at the widget's edge and left unclickable. No coordinate escapes a paint-contained ancestor;
only the portal does. `verify-placement`: 18/19, 1 declared red.

### Portal unblocked

`portal-safety.mjs` splits what a surface loses on the body into rules no marker can recover and
styling the markers impose. Naming each surface's own chrome twice — scoped and `.db-x.db-surface`,
same specificity, nothing in-container moves — took the unrecoverable count **537 → 0** in six rules.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Reports with an owning phase | Done | 16 of 16; `roadmap.md` §4 |
| Reports shipped | In Progress | 14 of 16 |
| Reports operator-confirmed | In Progress | 1 of 16, as an accepted shortfall |
| Every phase has a `goal.md` | Done | `000`-`026`; `010`-`019`, `024`, `026` written 2026-08-30 |
| Report 1, the sheet drag | Fixed, awaiting device | The panel's render destroyed the grab bar; a 60px drag now moves 60.0px after a re-render, was 0.0px |
| Non-table views on device | Broken | List, board and calendar freeze; `028` |
| Gate checks constructing a renderer | 1 of 16 | `026` shipped as `1bac3c2`. `render-assertion-harness.ts` builds `new ListRenderer` and `new TableRenderer`, green in the gate, both renderer sources fingerprinted as declared inputs. Four view types still have none |
| `004` state | Unknown | Three sources disagree; `roadmap.md` §7.1 |
| Gate | Red | 12/13, `screenshots-fresh` on stale captures |
| Version | Done | `manifest.json` and `package.json` both at 1.3.7. The freeze was reported on 1.3.4 and 1.3.5 and is unconfirmed on 1.3.7 |

`completion_pct: 50` is derived, not felt: 14 of 16 reports shipped, 1 of 16 confirmed, and seven
later phases opened of which one has shipped.

### Deviations and findings

| Item | Note |
|------|------|
| Declared order `009 → 000 → …` was not run | Phases 010-017 were cut in report order instead. `009` gated no handoff. `roadmap.md` §8 |
| Reports 7 and 16 shipped with no phase | Now `019` and `018`. A lane hold is not a scope grant |
| Report 7 crosses a written scope exclusion | `spec.md` §2 excludes output number format. Unresolved; `019/spec.md` §7 |
| `016` worked unspecced for hours | It owns the most-reported defect; its spec and criteria arrived before it finished |
| Eight continuity blocks read 0% after shipping | `roadmap.md` §7.6. `010`'s spec still says "not started" while its own summary says 90% |
| Grab band: three surfaces, three numbers | I had carried 35px and 32px in different places and both are wrong. The harness hit-tests it through the browser: the owned menu measures **44px** (14 above the bar + 29 below + the centre pixel), ends 44px from the sheet's top edge against a first row at 47px, and takes 0 of 19 rows; the add-view sheet measures **48px** and takes 0 of 12 controls. The stylesheet's own comment says 45px on the owned menu, which is one more than the browser reports. The floor is 44px, so that surface passes at **zero headroom** — any padding or font change tips it red. Same shape as the selection-bar check that passes at content=46px against box=46px. Neither is a defect; both are checks with nothing to spare. **These are not the surface the operator's decision is about.** That is the record sheet, which measures **32px** and is the subject of roadmap §7.5's four conflicting records — the only one of the four taken from the shipped build. So there is no single grab-band number to reconcile: three surfaces carry three bands, and citing one for another is how four records became four |
| 44px table row height declined | Density outranks it, and the cell clips its own overflow so a hit-area expansion is a no-op. Closed with a number |
| `024` missing `plan.md` and `tasks.md` | Level 1 requires both; `validate.sh --strict` reports 5 errors there, and its continuity block is 2806 bytes against a 2048 cap |
| 22 of 29 children fail `--strict`; the parent passes | Measured per folder, not inferred from the recursive tail. The rule is **level-driven, not marker-driven**: a folder's level decides which docs are validated and which anchors their template renders. The acceptance-criteria body sits behind an `IF level:2,3,3+` guard, so at Level 1 it renders empty and the file is exempt — which is why `018` and `019` pass carrying no marker at all, and why removing a marker from a Level 3 folder trades one error for another rather than clearing it. So `goal.md` costs `000`-`009` two errors each, and `spec.md` costs `010`-`017` the same two — I had recorded only the first half and written that `010`-`026` "add nothing", which the scan refutes. `acceptance-criteria.md` carries no marker in 12 folders and that is free: `018` and `019` validate clean with none. `024` and `027` are each missing `plan.md` and `tasks.md`; `028` has no marker on any of its five docs. Content is sound throughout — this is conformance, not rewriting |
| `000` declares Planned over nine checked tasks | `spec.md` declares Status Planned; `tasks.md` carries nine checked implementation tasks and the lane journal independently records the acquire, the token-root edit and a release "with a debt". Work started, so the contract also wants an implementation summary. Recorded, not resolved: writing one means asserting what `000` delivered without having verified it |

### `007` cannot reach Errors: 0, and should not be made to

It declares itself *"Not a program phase. It gates nothing and appears in no execution order"*, and
it has no `spec.md`, `plan.md` or `tasks.md` by design. The validator sees a directory under a phase
parent and checks it as a child, so it reports two errors that no honest edit removes — reaching
zero means writing three documents whose only reader is the validator.

Adding its template marker did briefly make it worse: the marker switched on a sufficiency check
that free prose never triggered, and the empty completion anchor became a third error. That one was
real and is fixed — its criteria are now written, both met, and checked by opening the files.

Doing that also caught the folder describing itself wrongly. It recorded one lineage; there are
two. `luna-xhigh` holds 10 iterations and a 29K `research.md`, `grok46-xhigh-architecture` holds 5
and 23K, and both sets live one directory deeper than the path it gave. A phase whose own trap is
*"never trust the exit status, go and look"* had not been looked at.

### Traps

Captures churn 12 files on an identical rerun — read any diff against that floor. A criterion can be
wrong in **both** directions: one here passed against the defect because right-alignment pinned the
edge it measured, and another failed a correct implementation by forbidding the reference layout it
was copying. A unit test that asserts on source text passes for a broken implementation and fails for
a correct one spelled differently. Flex properties are inert on grid items. `:not()` raises
specificity and wins fights it used to lose — tried on the container box, moved 34 captures,
reverted. A fixture containing none of the thing under test measures nothing. A derived number
written in a comment goes stale silently — `48 = 24 + 16 + 8` was true when written and nothing
recomputed it when both controls grew to 28px. A pipe makes `$?` the pipe's status.

### The blank-cell criterion, and why its first instrument was theatre

Written as "no coverage table has a blank cell" and measured with a grep for adjacent pipes. That
detector matched 23 rows across five phases. A markdown parser over all 29 found **zero** empty data
cells: 21 were the legal empty header corner of a label-column table, and 2 were a JavaScript `||`
inside a code span.

So two phases with complete, closed tables failed a completion criterion because they quoted code,
and the only way to satisfy it was to corrupt a citation. That is a criterion failing a correct
implementation — one of the two banned shapes, sitting in the checklist meant to enforce them.

It also fails this program's own theatre test: delete every piece of evidence from a coverage table
and the count does not move. Add fabricated evidence and it does not move either. And `004`, the one
phase the roadmap names as having blank evidence cells, scores zero on it.

The criterion's intent was right and its instrument was wrong. Corrected above to name the property —
an empty **data** cell — rather than a string that correlates with it.

### Gate

`SURFACE_PHASE=<phase> npm run gate` runs 13-14 checks. `npm run replay` re-asserts 8 results against
their recorded pre-fix numbers. Lane: `tools/lane/css-lane.json`.
<!-- /ANCHOR:log -->
