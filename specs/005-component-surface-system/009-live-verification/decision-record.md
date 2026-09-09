---
title: "Decision Record: Live Verification in the Running Obsidian"
description: "ADR-001 records why the engine-parity lane's 23 Chrome-vs-WebKit width disagreements are gated against a recorded steady state instead of fixed at the stylesheet — three mechanisms, two of them inherent to the engines and one a race in the measurement itself, with the per-scenario delta table and the negative control that proves the gate can fail."
trigger_phrases:
  - "009 decision record"
  - "engine parity disagreement"
  - "engine parity steady state"
  - "chrome versus webkit width"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/009-live-verification"
    last_updated_at: "2026-09-09T11:30:00Z"
    last_updated_by: "engine-parity-residual-leg"
    recent_action: "ADR-001: the 23 engine-parity disagreements gated as a recorded steady state"
    next_safe_action: "None here; the packet's probe tasks (transport proof, defect reproduction) remain open"
    blockers: []
    key_files:
      - "tasks.md"
      - "../../../tools/live/engine-parity.mjs"
      - "../../../tools/live/engine-parity.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "engine-parity-residual"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Why do 23 widths disagree between Chrome and WebKit — three mechanisms, none a stylesheet gap, recorded then gated (ADR-001)"
---
# Decision Record: Live Verification in the Running Obsidian

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The engine-parity lane's 23 width disagreements are recorded, then gated — not fixed in the stylesheet, and not suppressed

**Status:** Accepted, 2026-09-09
**Context:** the residual the roadmap carried as "engine-parity's informational disagreements"

### The problem

`tools/live/engine-parity.mjs` renders every screenshot fixture in both Chrome and WebKit and
compares computed values on the elements most likely to diverge. It is the only instrument in the
repository that can see a defect whose only symptom is that Obsidian's iOS WebView disagrees with
the Chrome every capture is photographed through — the class of defect that shipped once already
(native checkboxes, drawn round on the phone while every capture showed squares).

But the lane was informational, not a gate: it always exited 1 while any disagreement existed, it
sat outside the 27-lane gate, and its own record (`tools/live/engine-parity.json`) carried 23
unresolved disagreements with nothing watching them. The question this record answers: are those
23 a stylesheet gap to close, or the engines' honest difference to own?

### What was measured

Three mechanisms, none of them a stylesheet gap. The full battery of this leg — computed-style
probe of the disagreeing elements and their ancestors in both engines, at the same viewport and
with the same stylesheets — is the evidence; the numbers below are read, not estimated.

**Mechanism 1 — the reserved classic scrollbar (delta exactly 8, 12 of 23).** Every surface with
`overflow: auto` whose content outruns its max-height scrolls. In this harness Chrome paints
overlay scrollbars (zero width); Playwright's headless WebKit reserves a classic one. Measured on
the add-view popover: `offsetWidth` 360 in both engines, identical 8px padding and 1px border, yet
`clientWidth` 358 (Chrome) against 350 (WebKit) — the 8px is WebKit's reserved scrollbar, and
every descendant shifts by it. That one mechanism covers twelve of the 23: the six add-view
popover action rows (342 vs 334), the three dropdown-field options (1094 vs 1102), the
load-more row (1112 vs 1120) and both date-pick triggers (1112 vs 1120).

**Mechanism 2 — the intrinsic text-input width, leaking through fit-content ancestors (the other
eleven).** The engines' intrinsic widths for a bare `input[type="text"]` at the default
`size` differ — WebKit 215.3125px against Chrome's 193px — and that difference leaks wherever the
input's `width: 100%` has no definite containing block to resolve against. Three placements, one
shape:

- `add-view-popover`, the two text inputs (193 vs 215.31, delta 22.31): the field wrapper is a
  shrink-to-fit flex item, so its grid column hugs the input's intrinsic width — the probe read
  the input's computed width as exactly its intrinsic in each engine, and its 133-135px row
  remainder empty in both.
- `panel-base-import-modal`, four text inputs (521.03 vs 539.91, delta 18.88): the inputs sit in
  an auto-sized table column; the modal row measures 1166 in both engines and the cell alone
  differs — the column's intrinsic sizing consumes the input's, and the input's own
  `width: 100%` fills whatever the column decides.
- `field-cell-edit-select`, one text input and four buttons (146.23 vs 164.25, 170.23 vs 188.25,
  delta 18.02, shared): the editor popover sizes itself to fit its widest content, and the
  "Add option" input's intrinsic difference (a different font size, hence a different intrinsic
  than the add-view controls') sets the popover everyone else stretches to.

The three deltas differ because the intrinsic difference is a property of each control's own
font size, and each of the three contexts styles its input differently — inferred from the
mechanism, not independently measured.

**Why not fix them at the stylesheet** — the residual's first branch, tested and rejected. The
mission's first branch asks whether the split is a stylesheet gap: a missing explicit
`width`, `min-width: 0` or `box-sizing` on the plugin's text inputs. It is not. Every disagreeing
input already declares `width: 100%` and the popover carrying the 8px cascade already declares
`box-sizing: border-box`; the disagreements come from the engines' own choices above those
declarations — the scrollbar reservation policy and the intrinsic width — plus the
shrink-to-fit ancestors whose definite widths would have to be invented (a fit-content popover
given a fixed width, a percentage table column) rather than restored. Making both engines agree
would mean forcing a scrollbar model or re-deriving three surfaces' widths for a parity no device
renders; the recorded steady state is the honest instrument, and this leg made it a gate.

### What changed in the tool

1. **The measurement race, fixed at source.** Before the gate could be trusted, its read was not
   even self-consistent: six consecutive pre-fix runs returned 23, 47, 47, 39, 39, 23 disagreements.
   The extra notes were all `background` disagreements on two modal scenarios' native checkboxes,
   and the module's own header documents the cause — "a transitioned property read before it
   settles reports an animation frame, and the two engines will not be mid-frame together."
   `reducedMotion: "reduce"` only shortens those transitions; the read still caught whichever
   frame each engine was in. The fix is in the harness, not the record: after the stylesheet
   settles, the read awaits every finite `document.getAnimations()` to its end (via
   `Promise.allSettled`, so a rejected `finished` wedges nothing; infinite animations — which
   never settle — are skipped). Both engines now read the settled frame. Post-fix, three
   consecutive runs printed the identical 23.

2. **The steady state became the exit condition.** Before this decision the lane exited 1 with
   23 disagreements on every run and gated nothing. It now reads the previously recorded
   disagreements (the file as it stood before this run stamped it), classifies each fresh
   disagreement against it, and exits 0 only when the disagreement set is steady:

   - a disagreement is steady when the record carries the same scenario, the same element, and
     the same property — with the recorded numeric delta reproduced within 1.5px, the very
     tolerance the instrument already uses to decide that a difference is a disagreement (one
     threshold, not two);
   - a disagreement that is new, changes property, or has grown past that allowance exits 1;
   - a disagreement that vanished is an improvement: it exits 0 and the refreshed record shrinks.

   Categorical notes (`appearance`, `background`, `radius`) match the recorded note verbatim, so
   a categorical flip is caught even where the numeric allowance would not see it. There is no
   suppression: the committed 23 carry no categorical notes at all, so a background disagreement
   appearing after the settle fix is a new disagreement and fails the run.

3. **The record is now dated honestly.** It stamps its inputs so the freshness check can know
   when it no longer describes the tree; it loads `theme.css` and `runtime-vars.css` but dated
   neither. Both are fingerprinted now — a change to either marks the record stale and the next
   run re-records it, the same discipline every other stamped artefact already obeys.

### The recorded steady state, per scenario

The 23 disagreements this decision records, exactly as the record carries them (Chrome value
first, then WebKit):

| # | Scenario — element | Measured (Chrome vs WebKit) | Delta | Mechanism |
|---|---|---|---|---|
| 1 | add-view-popover — `input[type="text"]`[0] | 193 vs 215.31 | 22.31 | intrinsic |
| 2 | add-view-popover — `input[type="text"]`[1] | 193 vs 215.31 | 22.31 | intrinsic |
| 3-8 | add-view-popover — `button`[2-7] | 342 vs 334 | 8 | scrollbar |
| 9-11 | dropdown-field — `button`[0-2] | 1094 vs 1102 | 8 | scrollbar |
| 12-15 | panel-base-import-modal — `input[type="text"]`[0-3] | 521.03 vs 539.91 | 18.88 | intrinsic |
| 16 | chrome-table-load-more — `button`[6] | 1112 vs 1120 | 8 | scrollbar |
| 17 | field-cell-edit-select — `input[type="text"]`[0] | 146.23 vs 164.25 | 18.02 | intrinsic |
| 18-21 | field-cell-edit-select — `button`[2-5] | 170.23 vs 188.25 | 18.02 | intrinsic |
| 22 | field-date-value-picker — `button`[0] | 1112 vs 1120 | 8 | scrollbar |
| 23 | field-date-value-picker-datetime — `button`[0] | 1112 vs 1120 | 8 | scrollbar |

Twelve scrollbar-cascade entries at exactly 8px; eleven intrinsic-leak entries whose deltas
(22.31, 18.88, 18.02) are each the engines' intrinsic-width difference under that control's own
typography. The recorded deltas themselves are the allowance: a disagreement this steady passes
while its delta reproduces within the 1.5px instrument tolerance, and any key, property, or
grown delta beyond it fails the run until the refreshed record absorbs it — a deliberate change
shows up as exactly one red run (the new disagreement, printed), then the refreshed record goes
green. Nothing is suppressed by list; a disagreement that never met the instrument's own
disagreement threshold is not "allowed", it is agreed.

### Evidence

- Settled-read stability: three consecutive post-fix runs, identical disagreement sets (23, all
  steady, 0 new, exit 0; the final one's record is the committed `engine-parity.json`).
- Negative control: the two add-view input deltas planted at 255.31 in the record — "steady 21,
  new 2", the tool's exit 1, both planted entries and nothing else flagged NEW; the next run
  re-stamps and exits 0.
- The wider battery, from the final state: typecheck 0, 1581/1581 tests, production build 0,
  sheet-grammar 0, render-assertions 0, placement 418/420 with 2 red for a declared reason,
  evidence freshness 15/15, gate 27 green / 0 declared red, comment and failing-value scans 0.
  No stylesheet changed, so no capture was invalidated.

### What this does not decide

Whether the eight- and eighteen-to-twenty-two-pixel deltas are worth equalizing — classic-versus-
overlay scrollbars, or definite widths for the fit-content wrappers — is a surface-by-surface
design question this record deliberately does not answer. The gate above turns any change to
those deltas, or any disagreement not in this table, into a failed run; the moment someone
equalizes one, the record absorbs it on the next run and the table here reads as history.
<!-- /ANCHOR:adr-001 -->
