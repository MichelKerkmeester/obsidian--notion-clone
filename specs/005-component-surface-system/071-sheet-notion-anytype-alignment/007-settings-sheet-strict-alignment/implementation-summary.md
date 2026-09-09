---
title: "Implementation Summary: Settings Sheet Strict Notion Alignment"
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
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/007-settings-sheet-strict-alignment"
    last_updated_at: "2026-09-09T22:40:00Z"
    last_updated_by: "implement-007-settings-sheet-strict-alignment"
    recent_action: "Landed the card-grouping shell; lane red-green; provisional metrics recorded; gate 27-0"
    next_safe_action: "Retune the four provisional numbers from T001's capture"
    blockers:
      - "T001: the operator's full-resolution Notion database-settings capture has not arrived; all four card metrics are provisional"
    key_files:
      - "src/views/view-config-panel-renderer.ts"
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "src/views/view-config-sheet-row-grammar.test.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "007-settings-sheet-strict-alignment-implementation"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Can the operator supply a full-resolution Notion iOS database-settings screenshot to replace the four provisional card numbers"
    answered_questions:
      - "Which presentation carries the card grouping: the phone sheet only; the anchored popover keeps the continuous list because a card needs the sheet's width to read as one"
---
<!-- SPECKIT_TEMPLATE_SOURCE: implementation-summary | v2.2 -->
# Implementation Summary: Settings Sheet Strict Notion Alignment

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 007-settings-sheet-strict-alignment |
| **Status** | Implemented — 2026-09-09, on provisional metrics |
| **Completed** | 2026-09-09 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The Settings sheet's rows now collect into rounded cards on the sheet's own canvas, the way the
reference database-settings sheet separates its groups: each section's heading sits **above** its
own card instead of opening a run of rows inside one continuous list, and the card boundary
replaces the hairline that used to open each group. Row-internal grammar is untouched — the
44–52px pitch, the 16px inset, the hairline between rows inside a card, the zero native selects
`002`/`004` landed all still measure green, inside the cards now instead of on the bare list.

**All four card metrics are provisional** pending the operator's own full-resolution Notion
capture (T001, asked by the orchestrator, not yet supplied): card corner radius = the existing
`--obnotion-radius-lg` (8px), card-to-edge inset = 16px (`--obnotion-sheet-inset`), inter-card gap
= 12px (`--obnotion-space-5`, asserted no tighter than 8px), canvas = the sheet's existing
`--obnotion-surface-overlay` fill, card = `--background-primary` (the plugin's own page fill,
which reads lifted against the sheet's overlay fill in both themes). The leg that receives the
capture retunes these numbers; the lane's radius and gap thresholds were set so the retune stays
inside the band rather than rewriting the assertions.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/view-config-panel-renderer.ts` | Modified | On sheet presentation only, each section's heading is followed by one `.obnotion-settings-card` container that collects that section's rows; the anchored popover keeps the continuous list (a card needs the sheet's width to read as one). No row's own DOM, class list, or handlers changed |
| `styles.css` | Modified | The card paint: `border-radius: var(--obnotion-radius-lg)`, `background: var(--background-primary)`, margin `0 var(--obnotion-sheet-inset) var(--obnotion-space-5)` — all scoped to `.obnotion-view-config-panel.obnotion-mobile-bottom-sheet`; headings above their card keep their spacing and lose the hairline; a row whose previous sibling is a card (a card's first row) draws no divider |
| `tools/live/sheet-grammar.mjs` | Modified | The card-grouping assertion (≥2 cards, radius ≥8px, background distinct from the canvas, gap ≥8px, headings above their own card) plus the vacuous footer-card assertion (a producer-marked sheet-action row renders inside a trailing footer card — 0 marked rows today) |
| `src/views/view-config-sheet-row-grammar.test.ts` | Modified | One more pinned-declaration test for the card rule; proven to fail when the card background declaration reverts |
| `tools/lane/css-lane.json` | Modified | The acquire/edit/release triplet for this leg's `styles.css` edit, release naming the 4 changed captures |
| `screenshots/notion-clone/panels/constructed-view-config-*.png`, `constructed-board-card-properties-*.png`, `screenshots/manifest.json` | Modified | The recaptures: 4 content moves, all this surface and its board-variant host |
| `tools/live/*.json` (14) | Modified | The evidence artefacts that dated themselves to the pre-edit tree, re-measured by their own producing tools |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first. The card-grouping assertion ran against the unmodified sheet and measured **0 card
containers** (lane exit 1, one failure) — the recorded RED number, matching the scaffold's
prediction. Then the producer and the stylesheet landed together, and the lane ran green:
2/2 cards at radius ≥8px, both cards' backgrounds distinct from the canvas, 1/1 inter-card gap
≥8px, 2/2 section headings above their own card. `002`'s row-grammar assertions rerun unchanged
and stayed green inside the cards (2336 PASS / 0 FAIL lane-wide, exit 0). The unit suite's new
card test was opened, revert-checked (card background declaration deleted → exactly that 1 test
fails, 6 pass; restored → 7/7), and kept. The footer-card assertion passes vacuously (0 rows
carry the sheet-action marker; REQ-005 stays N/A as spec.md records).

Full battery, foreground, exit codes read: `npx tsc --noEmit` 0, `npm run build` 0,
`npx vitest run` 1586/1586 across 157 files (exit 0), `sheet-grammar` 0, `render-assertions` 0,
`touch-targets` 0, `verify-placement` 0 (418/420, the 2 red for a declared reason).
`npm run screenshots` ran twice plus a third post-lane pass (480 entries, exit 0 all three);
pixel-delta against the committed blobs: **4 content movers, every one moved in BOTH sampled runs
at identical counts** — constructed-view-config dark 716882px@Δ192 / light 716962px@Δ209,
constructed-board-card-properties dark 785113px@Δ194 / light 785159px@Δ209 (the board variant
renders the same `.obnotion-view-config-panel`) — kept, deterministic, this edit's own surface.
The third pass moved 3 known lane-instability captures (board-mobile-desktop-dark 1px@Δ1,
board-subtask-tree-desktop-dark 1px@Δ1, board-view-desktop-dark 4px@Δ1), one sampled run only,
max channel delta ≤12 — jitter by the lane's own rule, restored at committed bytes with their
manifest rows' bytes fields restored and `screenshots:verify` 0 (480 entries match their sources).
The 14 stale evidence artefacts were re-derived by their own producing tools (all exit 0), then
`evidence --check-all` 15/15 fresh. `check-lane` 0 (stylesheet unchanged since the triplet;
release names all 4 changed captures). `npm run gate` ran to the full 27 lanes twice: **27 green,
0 red**, exit 0 both. `scan-comments` 0, `scan-failing-values` 0. Validated strict: RESULT PASSED
(this packet, the 071 parent's first RESULT, and the 005 track). Nothing pushed — a fresh
verifier lands it.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The card groups only on the sheet presentation; the anchored popover keeps the continuous list | A card boundary reads as a group edge only on a surface wide enough to carry its own margins; inside a 320px popover the same markup reads as clutter. The grouping class is added on the sheet path only, so desktop markup is unchanged |
| The card is `--background-primary` on the sheet's `--obnotion-surface-overlay` fill, not a new token | The provisional ruling names the sheet's existing surface tokens; the sheet's "one fill for every sheet" rule already paints the root with the overlay token, and the page fill is one step flatter than it in both themes by that rule's own design, so the contrast exists without inventing a second definition to keep in step |
| Headings keep their position in DOM and lose only their hairline | The lane's heading clauses measure the heading's inset and its `::before`; keeping the heading a body child (not a card child) means every existing predicate reads the same element it always read, and `002`'s suite needs no rewrite |
| The card's first row draws no divider, declared by sibling position | Inside a card, a row following the card itself has no row above it — the hairline's own meaning is "another row precedes me"; the `X + X` mechanism `067` established extends here rather than a per-card exception class |
| Provisional numbers carry thresholds with headroom | The lane asserts radius ≥8px and gap ≥8px (the provisional gap is 12px), so the operator capture's retune moves values, not assertions |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| RED (T003) | Lane exit 1 — `0 card containers, wanted >= 2`, the scaffold-predicted failure, recorded |
| GREEN (T007/T008) | Lane exit 0 — 2/2 cards radius ≥8px, backgrounds distinct from canvas (sheet rgb over page fill), 1/1 gap ≥8px, 2/2 headings above their card; 002's row grammar green unchanged (2336 PASS / 0 FAIL) |
| Footer-card assertion (T004) | PASS vacuous — 0 rows carry the sheet-action marker; REQ-005 N/A as recorded |
| Revert-proof unit (T009) | Card background declaration removed → 1 failed / 6 passed (exactly the new test); restored → 7/7 |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run build` | PASS, exit 0 |
| `npx vitest run` | PASS, 1586/1586 (157 files) |
| `node tools/live/sheet-grammar.mjs` | PASS, exit 0 |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 |
| `node tools/live/touch-targets.mjs` | PASS, exit 0 |
| `node tools/storybook/verify-placement.mjs` | PASS, exit 0 (418/420, 2 declared red) |
| `npm run screenshots` ×3 + pixel-delta | PASS, 480 entries, exit 0 all; 4 deterministic two-run content movers (all this surface), kept; 3 one-run ≤4px/Δ1 jitters restored per the lane rule; `screenshots:verify` 0 |
| `node tools/live/evidence.mjs --check-all` | PASS, 15/15 fresh — after 14 artefacts went stale against the edited tree and were re-derived by their own tools |
| `node tools/lane/check-lane.mjs` | PASS, exit 0 — release names all 4 changed captures |
| `npm run gate` | PASS ×2 — 27 green, 0 red, exit 0 |
| `scan-comments` / `scan-failing-values` | PASS, 0 / 0 |
| `validate --strict` (packet, 071 parent, 005 track) | RESULT: PASSED ×3 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The four card numbers are provisional.** The operator's full-resolution Notion database-
   settings capture (T001) has not arrived; radius 8px, inset 16px, gap 12px and the two surface
   tokens stand in until the capture lands, and the receiving leg retunes them. The Notion side of
   the §13 gap table stays TBD where the 299x678px thumbnail cannot support a pixel claim.
2. **AC-007 is the operator's own device read.** No agent ticks it; it stays open whatever the
   lane says.
3. **Light/dark is proven by number, not by eye.** Both themes recaptured, both movers move in
   both themes, and the card/canvas contrast holds by token design; the visual read is the
   operator's device pass.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:continuation -->
## Continuation Notes

The next leg should: (1) receive the operator's capture and re-derive the four provisional numbers
from it, editing only the two declarations in `styles.css`'s card rule and the two lane constants
(`SETTINGS_CARD_RADIUS_MIN_PX` stays a floor, the provisional values move); (2) rerun the
battery; (3) leave AC-007 to the operator. The footer-card marker
(`.obnotion-settings-sheet-action`, `.obnotion-settings-card-footer`) is defined in the lane's
measurement and its assertion passes vacuously — a future row set that needs a trailing action
card adopts those names rather than inventing new ones.
<!-- /ANCHOR:continuation -->
