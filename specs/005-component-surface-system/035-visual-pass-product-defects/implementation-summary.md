---
title: "Implementation Summary: Visual Pass Product Defects"
description: "Fourteen of seventeen product defects repaired and read on a recapture; three stay open, each with the number that closed the question rather than the claim that opened it."
trigger_phrases: ["035 implementation summary", "visual pass defects summary"]
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/035-visual-pass-product-defects"
    last_updated_at: "2026-09-02T18:45:00Z"
    last_updated_by: "in-runtime-verifier"
    recent_action: "14 of 17 defects fixed and read on recaptures; P4 P6 P15 open"
    next_safe_action: "Take the operator call on P6 scroll-versus-wrap and P15 threshold"
    blockers: ["P6 contradicts the placement lane; P15 threshold met by no tag"]
    key_files: ["styles.css", "src/views/table-footer-renderer.ts", "tools/gate.mjs"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-035-impl"
      parent_session_id: null
    completion_pct: 78
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
| **Completed** | Not complete — 2026-09-02, 14 of 18 rows |
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
| `tools/live/*.json` | Modified | Twelve evidence artefacts re-measured, never edited |
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
| The tag's border was left to the theme | Pinning it to the foreground token gave that one tag a 10.31:1 outline in the light theme while its siblings sat at 1.22:1. Setting the token pair and nothing else puts it back among them. |
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
| `npm run screenshots` | PASS, exit 0 — 240 captures, 60 moved and read |
| `npm run replay` | PASS, exit 0 |
| `node tools/live/touch-targets.mjs` | PASS, exit 0 — 215 under the floor against a baseline that was 228 |
| `SURFACE_PHASE=035-… npm run gate` | PASS, exit 0 — 25 green |
| `node tools/lane/check-lane.mjs` | PASS, exit 0 — released, 60 captures named |
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

2. **P4's reported mechanism is false.** The always-on "+" is now an out-of-flow corner control and
   the day number no longer shares a 46px flex row with it, but the titles do not move: 6 of 12
   month segments truncate before the change and 6 after. They are week-grid segments, not day-cell
   children, and they truncate from a 48px column at 402px.

3. **P15's threshold is met by no tag in the corpus.** The uncoloured tag now measures exactly like
   its registered siblings — fill 1.00 → 1.55 and edge 1.71 → 2.64 in dark, against design 1.37/2.27
   and personal 1.57/2.65 — so it is no longer the odd one out. It does not reach 3:1, and neither
   does any other tag, which makes that a question about the shared badge design.

4. **P2 was not read on a capture.** No fixture renders `is-drop-target`, so the token swap is
   verified from the token table at `styles.css:100` and that is said rather than implied.

5. **Every row still awaits the operator.** Shipped, verified and operator-confirmed are three
   states, and nothing here has reached the third.
<!-- /ANCHOR:limitations -->
