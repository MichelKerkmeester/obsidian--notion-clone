---
title: "Implementation Summary: Record Sheet Header and Property Icons"
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
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/011-record-sheet-header-and-icons"
    last_updated_at: "2026-09-10T01:10:00Z"
    last_updated_by: "277-record-sheet-header"
    recent_action: "Landed record family on shared header; 21/21 icons; 006 green; gate 28-0"
    next_safe_action: "Operator device read (D3) closes the packet; then 008, 009, 012-014 in the audit's order"
    blockers:
      - "AC-008: the operator's own device read has not happened; no agent may tick it"
    key_files:
      - "src/views/record-detail-panel.ts"
      - "src/views/record-surface/record-header.ts"
      - "styles.css"
      - "tools/live/sheet-grammar.mjs"
      - "src/views/record-detail-panel.test.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "011-record-sheet-header-and-icons-implementation"
      parent_session_id: null
    completion_pct: 86
    open_questions:
      - "Can the operator supply a full-resolution Notion record page carrying many properties (audit C-5), so the collapse-affordance question can be settled"
    answered_questions:
      - "Does record-peek adopt the shared header builder outright — the peek's phone surface rides the record-detail bottom sheet, so one producer branch mounting the shared header covers both; the clause's record-family selector fallback keeps the delta measured if the producer drifts"
---
<!-- SPECKIT_TEMPLATE_SOURCE: implementation-summary | v2.2 -->
# Implementation Summary: Record Sheet Header and Property Icons

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 011-record-sheet-header-and-icons |
| **Status** | Implemented — 2026-09-10, awaiting the operator's device read |
| **Completed** | 2026-09-10 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The record sheet's phone title now centres like every other sheet's, because the record family
now mounts the same shared header every other sheet mounts — the audit's Mechanism B, closed at
the producer rather than by widening a selector: `record-detail-panel.ts`'s bottom-sheet path
builds its header through `buildPhoneRecordHeader` (`record-header.ts`, which calls
`buildShellHeader`), so the title-centring contract's membership is structural. The record's own
affordances take the shared header's two open slots: the record icon in the leading slot, the
expand action beside the close in the trailing one; the title's decorations (hover preview,
conditional format, rename, empty-title state) land on the shared title element so the
desktop-side decoration contract keeps applying. The desktop anchored panel keeps its own
`.obnotion-record-detail-header` — a different surface, a byte-compatible DOM its own CSS
depends on. Every record property row now paints its property's type icon: a 14px glyph inside
the label's own fixed 96px box, middle-aligned on the x-height so it stays inside the strut the
text already owns — the row's inner geometry, the value's left edge and the 44px pitch are
untouched, which the lane measures beside the new clause.

The centring clause itself learned to keep its coverage honest: the record family is a member of
`TITLE_CENTERED_SURFACES` (the list no longer excludes it), and the title measure gained a
record-family selector fallback that reports which selector answered (`via shell` /
`via record-family`), so a producer that silently stops mounting the shared header goes visibly
red instead of invisibly green — the coverage-gap class this packet exists to close.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/record-detail-panel.ts` | Modified | The bottom-sheet path mounts `buildPhoneRecordHeader`; record icon, expand action and title decorations land in the shared header's slots; the desktop branch is untouched. Property rows pass a `renderLabelTypeIcon` opt-in |
| `src/views/record-surface/record-header.ts` | Modified | The phone builder's return type is the shell handle, so callers reach the leading/trailing slots and the shared title element |
| `src/views/card-field-renderer.ts` | Modified | `renderLabelTypeIcon` opt-in: draws the type icon into the existing label box, so no caller's row geometry moves unless it opts in |
| `styles.css` | Modified | One addition, the record-detail field-label type-icon declarations (14px inline-flex, middle-aligned, faint); no rule outside that icon |
| `tools/live/sheet-grammar.mjs` | Modified | The centring clause gains the record family; the title measure gains the reporting fallback; the row grammar gains the type-icon clause |
| `src/views/record-detail-panel.test.ts` | New | The producer wiring pinned as written: the sheet branch routes through the shared header, the desktop branch keeps its own, the shared title's never-overflow pair and the sheet-only close control stay declared |
| `tools/lane/css-lane.json` | Modified | The acquire/edit/release triplet, release naming the 15 movers |
| `tools/storybook/verify-placement.mjs`, `tools/live/renderer-coverage.json` | Modified | Coverage/placement inputs follow the new producer path and test file |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

RED first, exactly as the packet's tasks sequence: the lane's centring list and the type-icon
clause landed before the producer, and the RED numbers were measured at the pre-change producers
(the four changed source files reverted, measured, restored byte-identical — sha256-verified):
record-detail **47.50px** and record-peek **47.50px** off the frame centre, reported
`via record-family`, **0 of 21** property rows carrying a type icon, lane exit 1. Then the
producer fix, then GREEN. The unit contract was proven the same way: at the pre-change producer
**1 of 3** tests fails (the wiring test — the other two pin stylesheet declarations that
predate this leg and are regression guards, and they stay green on revert), restored **3/3**.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The record family adopts the shared `buildPhoneRecordHeader` rather than joining the clause by selector alone | `record-header.ts` already shipped the phone builder (a `buildShellHeader` call) with no production caller, so membership becomes structural; the clause's record-family selector stays as a *measured* fallback that reports which selector answered, not as the membership's mechanism |
| The desktop anchored panel keeps its own header | It is a different surface whose CSS depends on a byte-compatible DOM; the packet's scope is the sheet, and the clause measures the sheet |
| The record icon takes the leading slot, the expand action the trailing one | The shell header's centring comes from mirrored slots; the record's own decorations go on the shared title element (hover, conditional format, rename, empty state), so a desktop-side decoration contract never silently stops applying on the phone |
| The type icon lives inside the label's 96px box, not beside it | `006`'s landed row grammar is regression-checked, not re-designed (goal D2): no fourth row slot, so the pitch, the inset and the value's left edge cannot move |
| Only AC-008 stays open | Every agent-verifiable criterion closed on the lane's own numbers; the device read is D3's, and no agent ticks it |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| RED (T004/T005, at the pre-change producers) | Lane exit 1 — record-detail 47.50px, record-peek 47.50px (`via record-family`), 0/21 type icons |
| GREEN (T008) | Lane exit 0 — 0.49px / 0.49px `via shell`, 21/21 icons; 2349 PASS / 0 FAIL |
| `006` regression (T008) | Unchanged: 21/21 rows 44.0px, 20/20 hairlines (last 0px), 16.0px inset, 1/1 section headings 16.0px/1px, 0 native selects, scrollWidth 390 ≤ 389+1 at 402px; row-grammar negative control green |
| Revert-proof unit (T009) | At the pre-change producer 1 failed / 2 passed; restored 3/3 |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npm run build` | PASS, exit 0 |
| `npx vitest run` | PASS, 1591/1591 (158 files) |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 |
| `node tools/storybook/verify-placement.mjs` | PASS, exit 0 (418/420, 2 declared red) |
| `npm run screenshots` ×2 + pixel-delta | PASS, 480 entries, exit 0 both; 15 content movers, every one at identical counts across both runs (record-detail family 8, record-peek family 4, the submenu fixture that mounts the record detail 2, the time-relative field-file-fields read 1), kept; 1 jitter (views/board-mobile-desktop-dark 2px@Δ1, one run) restored, its manifest bytes field patched back (242584) |
| css-lane | check-lane exit 0 — holder `011-record-sheet-header-and-icons`, baselineHash `892ac77282a3` (the first 12 of the working tree's `styles.css` sha256), acquire/edit/release signed, release names all 14 changed captures |
| `node tools/live/evidence.mjs --check-all` | PASS, 16/16 fresh — after 12 artefacts went stale against the edited tree and were re-derived by their own tools (all 12 exit 0) |
| `node tools/naming/scan-comments.mjs` / `scan-failing-values.mjs` | PASS, 0 / 0 |
| `npm run gate` | PASS — 28 green, 0 red, exit 0 |
| `validate --strict` (packet, 071 parent, 005 track) | RESULT: PASSED |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The property-count collapse stays `TBD`.** Every captured Notion row page has exactly 3
   properties, so a "N properties / Show all" collapse never triggers in the reference; it needs
   the operator's full-resolution capture (audit §5 C-5), which this leg does not own. §13's row
   stays `TBD` exactly as scaffolded.
2. **AC-008 is the operator's own device read.** No agent ticks it; it stays open whatever the
   lane says.
3. **Light/dark is proven by number, not by eye.** Both themes recaptured, every mover moved in
   both themes at identical counts, and the judgement is decoded-pixel, not opened images; the
   visual read is the operator's device pass.

<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:continuation -->
## Continuation Notes

The next leg should: (1) take the operator's device read (D3) — it closes AC-008 and the packet;
(2) when the audit's C-5 capture arrives, settle the collapse affordance in its own packet, not
here; (3) the record-family selector fallback in the centring clause is deliberate — if the
family ever reports `via record-family` on a GREEN run, the producer has drifted off the shared
header and that is the defect the fallback exists to name. Children `008`, `009`, `012`, `013`,
`014` follow the audit's implementation order and own their own gap tables.
<!-- /ANCHOR:continuation -->
