---
title: "Implementation Summary"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/073-checkbox-controls"
    last_updated_at: "2026-09-08T14:40:00Z"
    last_updated_by: "implementation-leg"
    recent_action: "Implemented and gate-verified; awaiting the operator device check"
    next_safe_action: "Wait for the operator's device confirmation (AC-005), then close"
    blockers: []
    key_files:
      - "styles.css"
      - "tools/live/touch-targets.mjs"
      - "src/views/view-config-panel-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "073-checkbox-controls-implementation"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "AC-005: does the checkbox size read right on the operator's own phone?"
    answered_questions:
      - "How many distinct radio-style controls exist beyond the board card's control? Exactly 3 producer sites; the other `radio` mentions in src are selectors, grammar guards and tests, not producers."
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 073-checkbox-controls |
| **Completed** | 2026-09-08 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

[Opening hook: 2-3 sentences on what changed and why it matters. Lead with impact.]

The operator's R3 report found the checkboxes twice the reference's size and the app's only
radio-style inputs where checkboxes should be. Both defects lived in the same control: the
shared checkbox component.

### Checkbox size on phone and removing radio-style inputs in favour of checkboxes

Every checkbox on the phone now paints the reference's glyph — 14 to 18px, the size Notion and
Anytype draw — where it used to paint 28px, because the shared checkbox's `pointer: coarse`
block forced every box to double its authored size. The 44px touch target did not go away: it
moved into the invisible `::before` inset, the idiom the control already used, and a new
control-geometry pass measures both numbers so neither can drift back quietly. Every
radio-shaped control in the app is gone: the three inventoried producers — the new-record
placement picker, the column-width presets and the computed-sync cards — now carry checkbox
semantics, with the exclusivity held by each group's behaviour rather than by the control type.

The board card's checkbox-property control, the one the operator's screenshot circled, is the
sharpest case: a 14px reference-matched circle that shipped at 28px on every phone, its value
stuck at a bare `0` until the property-reads repair landed. That control now paints 14px inside
a 44px target and reads its real value — 18 of 36 mounted card fields render checked, none
renders the stray `0` any more.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `styles.css` | Modified | Shared checkbox coarse block: 28px minimum released to the authored glyph, new -15px `::before` pass (cascade-ordered after the -6px base); select-column/divider/selection-clear trio repeats it; the phone select column drops to 28px and the sorted-state `<col>` hint joins the auto-layout release |
| `src/views/toolbar-renderer.ts` | Modified | New-record placement options: `role=radio` → `role=checkbox`, the group does the single-select; keyboard-navigation selector follows |
| `src/views/column-width.ts` | Modified | Width-preset options: same conversion, one shared idiom stated once |
| `src/views/view-config-panel-renderer.ts` | Modified | Sheet-branch segmented options → checkbox semantics; the computed-sync cards' three native radios → the shared checkbox (value kept, re-tap re-asserts) |
| `src/views/view-config-panel-renderer.test.ts` | Modified | Desktop expectations: no radio of either spelling, the cards' boxes are the factory's, exactly one card selected, the grammar column's reason named |
| `src/views/column-width.test.ts` | Modified | Source-contains expectations follow the role change |
| `src/views/checkbox-family-coverage.test.ts` | Modified | New: the phone glyph stays in the reference band and the -15px inset pays the floor — either half reverting fails |
| `tools/live/touch-targets.mjs` | Modified | New third pass: control geometry — three production mounts (board card, table, view-config) measured for glyph band, `::before` hit area and radio count; the premise canary proves the 16px/44px shape; the declared-checkbox reason tells the truth about the new geometry |
| `tools/lane/css-lane.json` | Modified | Acquire/edit/release for this leg; the release names all 78 content-changed captures |
| 91 captures + `screenshots/manifest.json` | Modified | Two clean recaptures; every mover reproduced in both runs, judged by decoded pixel delta, named in the css-lane release |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first: the control-geometry pass was added to the touch-floor tool and recorded its failures
against the unmodified tree — 94 glyphs at 28×28, hit areas 40×40, 3 radios, and a board mount
reading 0 checkbox fields because the 1600-row bench carries no typed columns (the pass mounts a
capture-sized copy for the board and the table; the floor passes keep their calibrated benches).
Then the stylesheet and the three producers, then the same pass: 94 glyphs inside 14–18px, hit
44px and above, 0 radios, 36/18/0 on the board. A unit test was run red against a reverted line
(the -15px inset), then restored to green. The one placement regression the shrink produced (the
28px-era 40px select column) was repaired and the lane returned to its recorded 413/415 + 2
declared. Screenshots ran twice from a clean index; the decoded pixel-delta pass judged every
mover against the committed blobs; all 91 kept movers reproduced in both runs, one 1px@1 jitter
candidate self-reverted. Twelve stale evidence artefacts were re-measured by their own tools, so
evidence freshness reads 15/15. Nothing shipped to a device yet: the captures are the proxy, and
AC-005 belongs to the operator.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Reference band 14–18px glyph, ≥44px target, paid by a -15px inset | The reference manifests carry no glyph dimensions, so the band is a documented assumption (decision-record.md §1); 14+30=44 is why -15 exactly |
| Single-select by behaviour, not the radio glyph | The directive is radios gone, checkboxes only; all three producers never drew a glyph, so the exclusivity was already behavioural — the ARIA spelling followed (decision-record.md §3) |
| The -15px rule placed after the -6px base rule | Equal specificity resolves by file order; the pointer, not the order, must decide (decision-record.md §2) |
| Select column 40 → 28px, its `<col>` hint released on the phone | The 28px-era reserve failed the placement lane's arithmetic (24px of room, no second control); a col width floors an auto-layout column silently (decision-record.md §4) |
| The bare `0` recorded, not chased | The value slot renders only the checkbox; the screenshot's `0` was a sibling number property whose read 070 already repaired — 0 bare-`0` fields remain (decision-record.md §5) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | 0 |
| `npx vitest run` | 153 files, 1673 tests, 0 failed |
| `npm run build` | 0 |
| `node tools/live/touch-targets.mjs` (incl. the new control-geometry pass) | 0 — 94 glyphs in 14–18px, hit ≥44, 0 radios; board 36/18/0; ratchets 171/785 unchanged |
| `node tools/live/sheet-grammar.mjs` | 0 |
| `node tools/live/render-assertions.mjs` | 0 |
| `node tools/storybook/verify-placement.mjs` | 0 — 413/415, 2 declared (the count the packet cites) |
| `npm run screenshots` ×2 + decoded pixel delta | 0 both; 91 real movers, all reproduced in both runs; 1 jitter candidate (4px@1, one run) self-reverted; 4 fit-content canvases resized (804×840→804×832, 748×636→748×618) |
| `node tools/live/evidence.mjs --check-all` | 0 — 15/15 fresh after 12 stale artefacts were re-measured by their own tools |
| css-lane | acquire → edit → release; 78 content-changed captures named; `check-lane` 0 |
| Engine parity (informational, outside the gate) | re-measured: 50 disagreements, the committed report's own count |
| Unit test reverted-line proof | the -15px inset reverted → the coverage test fails; restored → 4/4 pass |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **AC-005 is the operator's.** The device confirmation — checkboxes read right, no radios —
   can only be ticked on the operator's phone. Every measurable proxy is green; the criterion
   still waits.
2. **The band, not a number, is the spec.** The 14–18px interval reads the reference captures,
   whose manifests carry no glyph metrics; the project's own role precedent (16px row, 18px
   field, 14px reference-matched circle) corroborates it. If the device pass disagrees, the
   number to revisit is the band — in exactly two places: the lane's constants and the coverage
   test's expectation.
3. **The engine-parity report names 50 intrinsic width disagreements.** The same count the
   committed report carried; text intrinsic sizing, not this packet's geometry. Outside the
   gate; recorded here so it is not rediscovered.
<!-- /ANCHOR:limitations -->

---


