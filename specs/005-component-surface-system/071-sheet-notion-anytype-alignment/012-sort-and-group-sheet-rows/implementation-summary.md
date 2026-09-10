---
title: "Implementation Summary"
description: "The sort rule reads as three labelled rows with one reorder affordance, and the group sheet carries the shown/hidden partition — every clause RED before GREEN, the full battery green."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/012-sort-and-group-sheet-rows"
    last_updated_at: "2026-09-10T02:55:00Z"
    last_updated_by: "278-sort-group-rows-implementation"
    recent_action: "Landed the stacked sort rule, the warning delete and the group partition; battery green"
    next_safe_action: "Operator device read (D3) closes the judgement; C-4 may amend ADR-001"
    blockers: []
    key_files:
      - "src/views/sort-panel-renderer.ts"
      - "src/views/toolbar-renderer.ts"
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "tools/lane/css-lane.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "012-sort-and-group-sheet-rows-implementation"
      parent_session_id: "012-sort-and-group-sheet-rows-scaffold"
    completion_pct: 90
    open_questions:
      - "ADR-001's Notion half: did Notion use a grip for sort-rule reorder? No repository capture shows one (audit C-4)"
    answered_questions:
      - "The ↑↓ arrow pair survives, the ⋮⋮ grip goes — the pair carries the keyboard path (ADR-001)"
      - "The partition reuses panel.shownSection/panel.hiddenSection/panel.hideAllProperties/panel.showAllProperties verbatim (ADR-003)"
      - "The ×'s expanded hit box measures 40.0×40.0, not the ≥44 the scaffold assumed; the labelled row owns the 44px box now (ADR-002)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 012-sort-and-group-sheet-rows |
| **Completed** | 2026-09-10 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The sort sheet's rule stopped being one crowded row: each rule now reads the way it is spoken —
what to sort by, then which way, then the way out — as a property row carrying the ↑↓ arrow pair,
a direction row indented to the property picker's own left edge, and a labelled `is-warning` Delete
row with a trash icon. The ⋮⋮ grip is gone, so the sheet carries exactly one reorder affordance,
the one that answers to Tab and Enter; the HTML5 row drag stays wired underneath for pointers. On
the group sheet the "Group by" property list now partitions into Shown and Hidden — the record
sheet's own shown/hidden vocabulary, read off the view state's hidden-column set — with
"Hide all" / "Show all" bulk actions riding each section header's own line, carried by one new
optional `ToolbarActions.setHiddenColumns` implemented in both hosts with the required-column
guard the main view's own hide-all already applies. The calendar hint shortened 126 → 74
characters in both locales. Every clause went RED before GREEN: the lane's seven new failures
(5 controls on one 48px row, 2 affordances, 2 × glyphs, 1 heading, 126-char prose, 2 rows
carrying both pickers, group bulk actions absent) are the proof the clauses measure something.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

RED first: the grammar clauses went into `tools/live/sheet-grammar.mjs`'s panel-sheets section —
per-row interactive-control counts, the property/direction-on-own-rows pair, the reorder-affordance
census, the ×/warning-row tally, the shown/hidden bulk-action placement (a control beside the
title, not among the rows), the longest body-text run, and a five-rule 90svH/keyboard-inset mount
driven through the sheet's own add control — each run RED, the failing numbers recorded, then the
producers moved and the same clauses run GREEN. The unit contract in
`sort-panel-renderer.test.ts` was proved red-then-green by reverting the producer (1 failed |
2 passed → 3 passed), not by trusting the绿. The hand fixtures in
`tools/screenshots/scenarios/panels.mjs` were mirrored onto the new markup so the surface census
keeps reading zero fixture-only classes. The stylesheet's move (fcaf3fec28cf → 6e10b42f6324) ran
inside one acquire/edit/release triplet, holder 012-sort-and-group-sheet-rows, every content mover
judged by decoded pixel delta rather than by opening images.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

1. **ADR-001 — the arrow pair survives, the grip goes.** The pair is two real buttons carrying
   `aria-label` and `title`; the grip was a span driving HTML5 drag, reachable by pointer only.
   The packet's threshold — the survivor carries the keyboard path — decides ours; the Notion
   half stays PROVISIONAL until the audit's C-4 device capture, since no repository asset shows a
   Notion sort rule being reordered.
2. **ADR-002 — legibility, not touch-target, and now measured.** The glyph's own box is 28.0×28.0
   and its painted hit box 40.0×40.0 — 4px short of the 44px floor the scaffold assumed it
   cleared. The labelled row (min-height 44px) is what owns the 44px box now; the ruling's
   framing is stronger, not weaker.
3. **ADR-003 — the partition reuses the shipped vocabulary, and both sections always render.**
   `panel.shownSection` / `panel.hiddenSection` / `panel.hideAllProperties` / `panel.showAllProperties`
   — the four strings the record sheet already consumes. A list that rearranges itself as soon as
   the first property hides reads as two different lists, so the Hidden section renders even
   empty; the clause asserts ≥2 headings and ≥2 bulk actions, which the empty case still
   satisfies.
4. **One shared relaxation, type-only.** `ConditionRowOptions.operator` became optional — the
   direction row legitimately carries nothing but its picker, and forcing a builder to return
   nothing there read as ceremony.
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| RED (grammar clauses, pre-change) | 7 failures: sort 5 controls/row, 2 rows carrying both pickers, 2 affordances, 2 ×/0 warning rows, 1 group heading/0 bulk actions, prose 126 characters, 1 heading with 0 bulk actions |
| `node tools/live/sheet-grammar.mjs` (GREEN) | PASS, exit 0 — 6/6 sort rows 44–52px (48, 44, 44, 48, 44, 44), span 357px = 357px, heaviest rule row 3 controls, 1 affordance, 0 ×/2 warning rows, 3 group headings 16/16 inset with dividers 0/1/1, 2 bulk actions on their own line, heaviest group row 1, prose 74; the 005 clauses (44–52px, 16px/16px, 1px divider, 0 native selects, one row span, extent == clientWidth) unchanged and green on both engines |
| 5-rule 90svH / keyboard inset | 5 rules mounted through the sheet's own add control; 759.6px = the 90svH ceiling exactly, the body scrolls (759.6/759.6); the pre-change 5-rule mount read 378px — the taller rule is what exercises the cap |
| `src/views/sort-panel-renderer.test.ts` | PASS 3/3; red-then-green proven by reverting the producer: 1 failed \| 2 passed → 3 passed |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, 1601/1601, 158 files (one `types` gate failure — the test's own `onclick?.(new Event(...))` arity — fixed, 3/3 re-confirmed) |
| `npm run build` | PASS, exit 0 |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 |
| `node tools/storybook/verify-placement.mjs` | PASS, exit 0, 418/420 (2 declared reds, its own recorded watched-red floor) |
| `npm run screenshots` ×4 (two judged pairs) | 480 entries each, exit 0; 16 content-changed captures judged by decoded pixel delta and kept (579014–623107px the sort desktop pair, 10690–159338px the calendar pair, deltas 112–212; the four hand-fixture sort/calendar captures size-differs); 2 one-run jitters (board-view-desktop-dark, 8px@Δ1) restored to their committed bytes with their manifest rows patched back; the recurring 66px@209 import-modal mover stayed pixelHash-identical — byte-only by the lane's own comparator, named not owed |
| `node tools/lane/check-lane.mjs` | PASS, exit 0 — acquire/edit/release at fcaf3fec28cf → 6e10b42f6324, the release names all 16 content movers |
| `node tools/live/evidence.mjs --check-all` | PASS, exit 0, 16/16 fresh after 13 stamps were re-run by their own writers (never hand-edited), then 1 more (capture-device-parity) after the manifest moved |
| `node tools/naming/scan-comments.mjs`, `scan-failing-values.mjs` | PASS, exit 0 |
| `npm run gate` (foreground) | PASS, 28 green, 0 red — re-run once after the single `types` failure was fixed |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The reorder ruling's Notion half is provisional.** No capture in the repository shows a
   Notion sort rule being reordered (the audit's C-4); ours was decided by our own keyboard
   threshold. The operator's device capture amends ADR-001 rather than being absorbed.
2. **The operator's own device recheck row stays open.** Per the parent packet's D3 decision, only
   the operator's own device recheck may close a device-level completion row; this leg closes every
   criterion `acceptance-criteria.md` names as agent-verifiable and ticks nothing beyond that.
3. **The hand fixtures' "Delete" copy is duplicated, not derived.** The capture fixture spells the
   label literally where the producer reads `common.delete`; the census proves the classes, the
   dictionary proves the string, and no lane proves the fixture's text — the same relationship the
   other panel fixtures already carry.
<!-- /ANCHOR:limitations -->

---
