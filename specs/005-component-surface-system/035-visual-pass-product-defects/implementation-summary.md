---
title: "Implementation Summary: Visual Pass Product Defects"
description: "Fifteen of seventeen product defects repaired and read on a recapture; two stay open, each with the number that closed the question rather than the claim that opened it."
trigger_phrases: ["035 implementation summary", "visual pass defects summary"]
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/035-visual-pass-product-defects"
    last_updated_at: "2026-09-02T22:40:00Z"
    last_updated_by: "in-runtime-verifier"
    recent_action: "15 of 17 defects fixed and read; P4 improved, P4 P6 open"
    next_safe_action: "Take the operator call on P6, and on P4 needing a wider column"
    blockers: ["P6 contradicts the placement lane; P4 truncates from a 48px column"]
    key_files: ["styles.css", "src/views/table-footer-renderer.ts", "tools/gate.mjs"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-035-impl"
      parent_session_id: null
    completion_pct: 83
    open_questions: ["Should the phone selection bar wrap or keep its scroll lane"]
    answered_questions: ["The selection bar clips because it scrolls and a capture cannot"]
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 035-visual-pass-product-defects |
| **Completed** | Not complete — 2026-09-02, 15 of 18 rows |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Fourteen of the seventeen product defects the 2026-09-02 visual pass read are repaired, and every
one of them was measured in a browser rather than argued from the source. The work arrived in two
runtimes on purpose: an external `codex` lane on `gpt-5.6-luna` wrote the edits and said plainly
that it could not open Chrome, and this runtime recaptured all 240 screenshots, read the 60 that
moved in dark and light, and measured each row. That split is D1, and it earned its keep — four of
the implementing lane's claims did not survive the measurement.

### What the recapture changed about the report

Three of the pass's own numbers were wrong and are corrected here rather than repeated. The
invalid-events span cell was reported at 0px; it measured 28px, the width of the select gutter it
had fallen into. The select popover's unregistered row was reported ~35px left of its siblings; it
measured 18px. And the span rule's `cssText` was reported empty; only the `grid-area` declaration
dropped, while `place-self` survived beside it.

### The second round, and the fifth claim to fail measurement

Two residuals went back to the same `codex` lane on `gpt-5.6-luna` and came back as one fix and one
reversal, on the same split: it wrote, this runtime measured.

**P15 closed.** The gray pair moved off `.db-file-tag-badge` and onto the whole
`.status-badge:not([class*="status-color-"])` family in the container and the modal, with
`--db-control-border-strong` as the boundary. The uncoloured tag had no painted edge at all in the
light theme — `border-color` computed `rgba(0, 0, 0, 0)` — and it now computes rgb(130, 135, 142) at
3.62:1 and rgb(124, 130, 136) at 4.29:1, both clear of the 3:1 WCAG 1.4.11 asks of a control's own
outline. The narrower rule it replaced was deleted, which is safe only because the renderer gives
every file tag both classes; that was checked at `src/views/file-field-renderer.ts:81,84` rather than
assumed, since the deletion was not mentioned in the lane's report.

**P4 improved and stayed open.** The lane sent two declarations. Widening the segment — taking back
`margin-inline`, `gap` and `padding-inline`, which is all a week-grid item can return to its own
title — moved the box 44.28 → 48.28px, the title 33 → 37px, and truncation **6 → 4** of 11. Relaxing
the title to `flex: 1 1 auto` moved truncation **6 → 7**, and was reverted here: that basis is a
floor with shrink disabled, so removing it handed the title 28px inside the wider box and two titles
that had fit began truncating. Measured three ways at the 402px frame — committed stylesheet, the
lane's tree, and the lane's tree less that one declaration — which is what separated the two halves.
The lane's report also described its own change as edits to the base rules at `styles.css:16062`,
`:16226` and `:16637`. Those lines are untouched; the change is an override block inside the
coarse-pointer media query at `:18621`. The rendering claim was close and the location was wrong.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `styles.css` | Modified | Thirteen of the seventeen rows, every changed selector traceable to one |
| `src/views/table-footer-renderer.ts` | Modified | The footer date aggregate reads the column's own format |
| `src/views/table-footer-renderer.test.ts` | Modified | Pins that format, watched red before green |
| `tools/gate.mjs` | Modified | A red lane's log directory arrives with the README `folder-docs` requires |
| `tools/live/touch-targets-baseline.json` | Modified | The ratchet falls 228 → 215, because the shortfall it recorded was repaired |
| `tools/lane/css-lane.json` | Modified | Acquired by the implementing lane, released here after the captures were read |
| `screenshots/` | Modified | 240 recaptured, 60 moved, each read in both themes |
| `tools/live/*.json` | Modified | Evidence artefacts re-measured, never edited — eight again in the second round |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Every visual row was measured twice in Chrome — once against the committed stylesheet and once
against the working tree — so each carries a before and an after rather than an after alone. The
`grid-area` proof is a CSSOM parse of the old and new declarations side by side. The contrast
figures are composited through the real ancestor chain, not read off a token name. `touch-targets`
was run three times and reported 215 on each of the last two before that number was written down.

Two negative controls were watched red on purpose. The footer test fails against the old body with
`expected '2026-03-01' to be 'March 1, 2026'`. And `scan-folder-docs` exits 1 with
`tools/lane/gate-logs — missing-readme` without the gate's new README, then exits 0 with it — with a
second control confirming the lane still fails a genuinely undocumented source folder, so the fix
satisfies the rule instead of exempting a directory from it.

`npm run gate` prints `gate: PASS — 25 green, 0 red for a declared reason` at `$?` = 0. Two lanes
went red on the way there and both logs were read rather than retried: `evidence` on eight stale
artefacts, which were re-measured, and `placement` on the contradiction recorded below.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The list field's declared width became a floor, not a deletion | Deleting it cured the truncation and collapsed the sparse fixture's four declared columns from 110/190/150/130 to 73/141/97/75. A field sized purely from its own content stops lining up with the field above it, which is the alignment that fixture exists to photograph. |
| The chart label was recoloured at the nested rule, not the button | `.db-chart-options-export .db-chart-options-label` outranks the button's own colour, so recolouring the button changed nothing a person can see. The producer of the tone is the rule that sets it. |
| The slider's 4px line moved to the track pseudo-element | Painted on the input, it made the whole control 4px tall — a bare `353x4` in the touch census, thinner than anything the plugin ships. The line is the track; the control stays thumb-height. |
| The tag's border became the control-boundary token, after two rejected alternatives | Pinning it to the *foreground* token gave that one tag a 10.31:1 outline in light against siblings at 1.22:1. Leaving it to the theme, the first round's answer, left it with no painted edge at all in light. `--db-control-border-strong` is the third: 3.62:1 and 4.29:1, the same edge every other unchecked control in the plugin carries, which clears 3:1 without making the tag the odd one out. |
| The phone selection bar was NOT changed | Recorded below. |
| The touch ratchet was lowered rather than left | A ratchet that is not lowered when its defect is fixed stops recording anything, and the next raise would be measured against a number that no longer describes the tree. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, exit 0 — 644 tests, 76 files |
| `npm run lint:tools` | PASS, exit 0 |
| `node tools/naming/scan-comments.mjs` | PASS, exit 0 — 360 files, no banner or box-drawing violation |
| `npm run screenshots` | PASS, exit 0 — 240 captures; 60 moved in the first round, 7 in the second, all read in both themes |
| `npm run replay` | PASS, exit 0 |
| `node tools/live/touch-targets.mjs` | PASS, exit 0 — 215 under the floor against a baseline that was 228 |
| `SURFACE_PHASE=035-… npm run gate` | PASS, exit 0 — 25 green, re-run in the second round |
| `node tools/lane/check-lane.mjs` | PASS, exit 0 — released twice, each entry naming the captures it read |
| P13 negative control | RED as required: `expected '2026-03-01' to be 'March 1, 2026'` |
| P17 negative controls | RED as required: exit 1 without the README, exit 1 on an undocumented source folder |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **P6 is a contradiction, not an unfinished fix.** The phone selection bar's box is capped at
   `calc(100vw - 32px)` = 370px against 416px of content. No label truncates — "Copy CSV" measures
   clientWidth 71 against scrollWidth 71 — it sits 55px outside the scroll port, and a screenshot
   cannot scroll. A wrapping bar was built and measured green, all five children inside and none
   truncated, then reverted: `tools/storybook/verify-placement.mjs:903` pins the opposite behaviour,
   requiring `scrollWidth > clientWidth`, `overflow-x: auto` and `scrollbar-width: thin`, and went
   red. Two shipped decisions disagree and the operator picks.

   **Recorded 2026-09-02 as an open operator question, no side taken.** Two options, both whole:
   **(a) wrap the actions**, which measured green at 5 of 5 inside a 102px bar, and retarget
   `verify-placement.mjs:903` so it asserts the wrapped shape rather than `scrollWidth > clientWidth`,
   `overflow-x: auto` and `scrollbar-width: thin`; or **(b) keep the scroll lane** that
   `022-selection-bar-keyboard-docking` shipped under its D2, and accept that a capture of a 370px box
   holding 416px of actions shows "Copy CSV" clipped 55px outside the port. The same question is
   recorded in `022`'s `goal.md`; neither packet may take it alone.

2. **P4's reported mechanism is false, and the improvement stops short of the row.** The always-on
   "+" is an out-of-flow 28x28 corner control that hit-tests to itself; it never took the titles'
   width, because they are week-grid segments and not day-cell children. Giving the segment its own
   margin, gap and padding back takes truncation 6 → 4 of 11 at the 402px frame, and the row asks
   for 0. The four that remain want more column than a phone week has — "Spotify family" needs 72px
   of text in a 37px box inside a 48.28px cell — so what is left is a layout decision about the
   phone month view, not a further squeeze of the same box.

3. **P15 closed on its edge; the fill question outlived it.** The uncoloured tag's boundary now
   reads 3.62:1 light and 4.29:1 dark, so the criterion — edge **or** fill — is met. The fill is
   untouched at its siblings' 1.2-1.6:1, and no tag *fill* in the corpus reaches 3:1. That was
   always a question about the shared badge design rather than about this one tag, and closing the
   edge does not answer it.

4. **P2 was not read on a capture.** No fixture renders `is-drop-target`, so the token swap is
   verified from the token table at `styles.css:100` and that is said rather than implied.

5. **Every row still awaits the operator.** Shipped, verified and operator-confirmed are three
   states, and nothing here has reached the third.
<!-- /ANCHOR:limitations -->
