---
title: "Implementation Summary"
description: "The icon picker's three search-row controls moved onto their own 44px action row, and the properties and record sheets' add affordances became full-width 44px rows; the lane proves both, the corpus moved with them."
trigger_phrases:
  - "implementation summary"
  - "014-sheet-polish implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/014-sheet-polish"
    last_updated_at: "2026-09-10T04:45:00Z"
    last_updated_by: "implementation-leg"
    recent_action: "Implemented T001-T007; gate 28/28; device read outstanding"
    next_safe_action: "Operator device read (D3) closes the packet"
    blockers:
      - "The operator's own device read (D3) is the only closing row that waits on a human"
    key_files:
      - "src/views/icon-picker-popover.ts"
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "tools/live/render-assertion-harness.ts"
      - "tools/lane/css-lane.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "014-sheet-polish-implementation"
      parent_session_id: null
    completion_pct: 83
    open_questions: []
    answered_questions:
      - "The icon picker's Remove promotion into the shared sheet header is recorded Proposed, not done: the header's leading slot exists and the hook chain reaches it without touching the builder, but the picker-host's mount contract would have to grow the pass-through, which is the shared surface 007's requirement pins"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 014-sheet-polish |
| **Completed** | 2026-09-10 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The audit's two P3 items that carry work, landed in one pass; the other eleven P3 findings stay
recorded, exactly as the packet scoped them.

**The icon picker's search row** (`src/views/icon-picker-popover.ts`, `styles.css`): the row that
used to carry the emoji/Lucide tabs, the search field, `Remove`, `Random` and a settings button
carries the tabs and the search field alone. The three action controls read on their own row
directly beneath it — `.obnotion-icon-picker-actions`, a 44px band on the header's inset, its
own hairline — `Remove` at the left, `Random` and the settings button at the right, each with a
44px touch box where the pills measured 28px. The markup is shared with the desktop popover, so
the desktop picker gains the same 44px action band.

**The add affordances** (`styles.css` — the producers' markup already carried the rows):
the properties sheet's `+ Add property` / `+ File property` render as two stacked full-width 44px
rows instead of a side-by-side pill pair, sharing the hairline vocabulary the property rows above
already use; the record sheet's add affordance is a full-width 44px row at the label position the
pill's left edge already put it. Both changes are scoped to the phone presentations
(`.obnotion-mobile-bottom-sheet` selectors); the desktop pills are unchanged.

The measurement that drives both: `tools/live/sheet-grammar.mjs` grew a bespoke clause block
(`window.__sheetPolishRows`) — how many of `Remove`/`Random`/the settings button share the
search's own row, and whether each add affordance spans its row (0.9 span floor). A control the
variant does not render simply does not match, so a picker carrying no `Remove` reports zero
strays by the same measurement rather than by a special case. `tools/live/render-assertion-harness.ts`
grew the record-detail fixture's `addProperty` action, because without it the lane's record
sheet mount photographs a panel that omits a footer the production panel always draws.

The other P3 rows stay where the audit put them: the option colour picker is converged (§3.7 —
the same single-column dot/name/checkmark list as Notion's, no work), the column-width sheet has
no Notion reference at all (§3.13 — no delta can be stated where no reference exists), and the
menu-card grouping belongs to `007` (§6, ADR-A). They are carried here verbatim so the next
audit does not re-derive them.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/icon-picker-popover.ts` | Modified | The three action controls moved out of the header div into a dedicated `.obnotion-icon-picker-actions` row the picker builds beneath it |
| `styles.css` | Modified | The 44px actions row (44x44 icon boxes overriding the 28px pills at higher specificity), and the properties/record add affordances as full-width 44px rows — phone-scoped, box-sizing, the shared hairline between the properties pair |
| `tools/live/sheet-grammar.mjs` | Modified | The packet's two clauses (search-row strays, add-affordance span) as a bespoke mounted-surface block with its own printed section |
| `tools/live/render-assertion-harness.ts` | Modified | The record-detail fixture's actions grew `addProperty` so the lane's record mount renders the footer (declared scope addition, below) |
| `tools/lane/css-lane.json` | Modified | The lane acquired, edited and released for the stylesheet change at `11a91fe1acd8`; 21 captures named reviewed (18 content-moved, 3 byte-only) |
| `screenshots/**` (21 PNGs + `manifest.json`) | Recaptured | Twice; judged by decoded pixel delta, every mover reproduced in both runs |
| `main.js` | Rebuilt | The production bundle, by `npm run build` |
| `tools/live/*.json` (12 censuses re-stamped) | Re-measured | Each by its own writer after the inputs moved |
| Packet docs | Modified | Tasks ticked with the numbers, AC statuses, goal log and continuity, the Proposed decision record, the §13 landed note, the roadmap row |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red first: the two lane clauses ran against the untouched tree — the search row carried **3** of
the counted controls (row: tabs, search, remove, random, settings), and the add affordances
spanned **17%** (record, 1-button row) and **23% / 22%** (properties, 2-button row) of their
rows — everything else in the lane green. Then the picker, the stylesheet and the fixture changed,
and the same clauses ran green: **0** of the three on the search row (row: tabs, search), and the
add affordances at **100%** (record) and **92% / 92%** (properties — width:100% inside the row's
16px sheet inset, above the 0.9 floor). `009` had already landed, so the add-affordance change
rebased onto its producer by construction: the worktree carried it, the markup already offered
one row per affordance, and only the stylesheet governed the widths — no producer edit was
needed, which is why `column-manager-renderer.ts` and `record-detail-panel.ts` are not among the
changed files.

The stylesheet change went through the css lane: acquired at `4bd3892f7e8a` (009's released
hash), the edit recorded, the captures regenerated twice and judged by decoded pixel delta, the
lane released at `11a91fe1acd8` with every changed capture named — 21 named, 18 of them
content-moved, 3 byte-only (the comparator's own distinction). Every mover reproduced
identically across both runs; none fell under the 12-delta one-run-only jitter rule, so none
was restored. The mover classes, read from the numbers: the icon picker's own four corpus
captures (184818-211045px at maxDelta 209-241), the properties sheet's two (219295 / 237887px at
196 / 209), the dependent stacks where the taller 44px band shifts the sheet's column
(depth-3 type picker, confirm card, property editor — 161870-213445px at 117-145, and the board
view's 9px at 121), the record sheet's docked-desktop pair (3810px at 128 / 145 — the newly
rendered add footer, visible because the harness fixture now draws it), and the record body
panels' desktop lights (6973px at maxDelta 1, both runs — the same footer's antialiasing reach;
the 067 outstanding row's below-the-fold framing trait, mobile twins unmoved).

**Declared scope addition:** `tools/live/render-assertion-harness.ts` sits beside the lane file
the tasks name — the record sheet's add affordance could not be measured at all without the
fixture passing the action, so the fixture grew the one `addProperty: () => undefined` line.
The deviation is recorded in the packet's `goal.md` deviations table.

**The Proposed ruling:** promoting `Remove` into the shared sheet header — Notion's actual
shape — needs the picker-host's mount contract to grow a leading-slot pass-through. The shared
header's own leading slot already exists and the hook chain reaches it without touching
`mobile-bottom-sheet.ts` or `surface-shell.ts` (both, and `popover-host.ts`, are untouched:
0 changed lines); but the extension belongs to the shared surface `007`'s requirement pins, so
it is recorded Proposed in the packet's `decision-record.md` and the picker carries the controls
in its own body. This also answers the packet's one open question.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| All three controls leave the search row, not only `Remove` | The clause counts all three among the search's siblings; leaving two behind would be a weaker reading than the requirement states, and the action row would carry a stranded pair |
| The action row sits beneath the search, not above the grid | It keeps the reading order — identity (tabs), narrowing (search), actions, content — and lets the row share the header's inset and hairline, so the picker reads as one column of 44px rows above the grid |
| `Remove` keeps its label; `Random` and the settings button keep their icons | Notion's own picker labels its remove control; the icon-only pair stay 44x44 taps, above the 28px they measured before |
| The changes are scoped to the phone presentations | The clause measures the phone sheets; the desktop popover keeps its 37px header row and the record/properties contexts keep their pill widths outside the bottom-sheet presentations, so no unmeasured surface changes shape |
| The record-detail fixture grew the action rather than the clause special-casing its absence | The harness's own comment records why: without the action, the panel photographs a footer the production record sheet always draws when a picker host exists |
| The promotion of `Remove` is Proposed, not slipped in | The picker-host's mount contract is shared by every phone picker; the packet's own risk table prices exactly this as a whole-app blast radius for a P3 row |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Lane RED (the packet's 2 clauses, untouched tree) | exit 1 — exactly the 2 new clauses red, everything else green |
| Lane GREEN | exit 0 — search-row strays 3 → **0** (row: tabs, search); add spans 17% → **100%** (record), 23%/22% → **92%/92%** (properties); 0.49px title centring, 44.0x44.0 close, parent dim 0.390, 8/8 grammar columns all unchanged |
| `npx tsc --noEmit` | exit 0 |
| `npx vitest run` | exit 0 — 1606/1606 (158 files) |
| `npm run build` | exit 0 |
| `node tools/live/render-assertions.mjs` | exit 0 (after the harness's record-detail fixture change) |
| `node tools/storybook/verify-placement.mjs` | exit 0 — 418/420, 2 red for a declared reason |
| `npm run screenshots` | exit 0 ×2 runs, 480 entries each |
| Decoded-pixel judgment | 21 movers, all reproduced in both runs, 0 jitter cases, none restored; 3 of the 21 move bytes only (pixelHash-identical, not billed by the comparator) |
| `node tools/live/evidence.mjs --check-all` | exit 0 — 16/16 fresh after re-running the 12 stale census writers |
| `node tools/lane/check-lane.mjs` | exit 0 — release names all 18 content-moved captures of 21 named |
| `node tools/naming/scan-comments.mjs`, `scan-failing-values.mjs` | exit 0 / exit 0 |
| `npm run gate` | exit 0 — **28 green, 0 red for a declared reason** |
| Shared-builder untouched (the packet's own requirement) | `git diff --numstat` = 0 lines in `src/views/mobile-bottom-sheet.ts` (and `surface-shell.ts`, `popover-host.ts`) |
| Validation orchestrator `--strict` | 014: RESULT: PASSED · 071 (first RESULT): PASSED · 005: RESULT: PASSED |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The operator's device read (D3) is the closing row and no agent ticks it.** Every other
   criterion is Met on measured numbers; AC-007 waits for the operator's own iPhone read.
2. **The record sheet's phone captures did not move** (`constructed-record-detail-mobile-*`,
   `...-docked-mobile-*`): the add row renders after the fields, below the capture's fold — the
   lane's 100% clause is the phone-presentation proof, the docked-desktop corpus pair (3810px at
   maxDelta 128/145) shows the new row. The same below-the-fold framing trait the 067 outstanding
   row already records; the framing decision, like that one, is the operator's.
3. **The `Remove` promotion stays Proposed** (the packet's `decision-record.md`): the shared
   header's leading slot exists, the builder is untouched, and the picker-host's mount contract
   extension is the shared-surface change this packet deliberately did not take.
4. **The audit's §5 operator captures (C-1..C-6) stay outstanding** — none of them gates this
   packet's criteria, which are all measured against our own numbers; the device read they
   support is the same D3.

---
<!-- /ANCHOR:limitations -->
