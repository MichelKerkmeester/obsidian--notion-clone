---
title: "Implementation Summary: Mobile Table and Panel UX"
description: "What was delivered for the mobile layout fix: an is-phone container reset that stops the desktop centring throwing content off-screen, table select-column unclipping and content auto-fit, list card fit, a non-sticky board header, a dismissable record bottom sheet (close button, pointer outside-dismissal, drag-down gesture, border-box), touch hover gates, and realistic is-phone reproduction scenarios plus a stylesheet/source regression suite. All gates green."
trigger_phrases:
  - "mobile table and panel ux implementation summary"
  - "is-phone layout fix delivered"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/011-mobile-table-and-panel-ux"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Fixed six mobile defects as one root cause; all gates green"
    next_safe_action: "On-device pass in Obsidian mobile for the scroll/drag paths"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-011"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Implementation Summary: Mobile Table and Panel UX

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Metric | Value |
|---|---|
| **Phase Name** | 011-mobile-table-and-panel-ux |
| **Theme** | One systemic phone-layout failure across every database view, plus a touch-input dismissal bug in the record panel |
| **Status** | Complete |
| **Completion Pct** | 100% of implementation; whole gate green from the final state |
| **Requirements** | 9 defined (6 P0, 3 P1) |
| **Tasks** | 20 (all complete) |
| **Defects fixed** | 6 of 6 |
| **Target Deliverables** | is-phone container reset, table select-column + auto-fit, list card fit, non-sticky board header, record bottom-sheet dismissal (close button + pointer + drag + border-box), touch hover gates, reproduction scenarios, regression suite |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

1. **The one systemic cause was found before anything was changed.** Every view is authored for a wide horizontally-scrollable canvas — the table uses fixed px columns under `table-layout: fixed`, list rows and the board grid grow to `width: max-content`, and their children are rigid (`.db-list-field` 150px `styles.css:9584`, `.db-board-column` 280px `8273`). The shared `.note-database-container` keeps its desktop `db-width-default` centring (`max-width; margin: auto` `536-540`) with no `is-phone` reset, so the auto margins throw wider children off-screen. The only prior `is-phone` rule was `max-height: 50vh` on the record panel (`8955`). The fix is one `is-phone` divergence layer on top of the untouched desktop CSS.
2. **The container reset.** `.is-phone .note-database-container.db-width-default { max-width: none; margin-left: 0; margin-right: 0 }` (`styles.css:17672`). One rule, because the class is on the container itself, so every view stops being centred off-screen on a phone.
3. **Table — select column unclipped and aligned.** A horizontal fade *mask* on `.db-table-wrap` (`18254` pre-fix) faded the leftmost 8px — the select column — on every platform; it is now dropped on the phone table (`17683`). The coarse-pointer fallback had switched the checkbox to in-flow, misaligning the header (no move handle) against rows (24px move handle); it is pinned back to `position: absolute; right: 6px` on the phone (`17690`). Confirmed in `table-mobile-mobile-dark.png`.
4. **Table — columns auto-fit to content.** On the phone `.db-table` becomes `table-layout: auto` with `width: auto !important; min-width: 0 !important`, and `col[data-note-database-column-key]` becomes `width: auto !important`, releasing the inline JS-set widths; data cells hug content on one line (`white-space: nowrap`) capped at `max-width: 60vw` (`17711`). It cannot run away: auto layout is intrinsic-content sized — the 1000088px case in the HANDOVER was a colgroup-less *fixed* layout, which cannot occur here. Confirmed in the capture: the long service name renders in full and the table scrolls horizontally rather than truncating.
5. **List — cards fill the viewport, fields wrap inside the border.** The grouped/group/row/main/meta chain is constrained to `width: 100%; min-width: 0; max-width: 100%`; the row grid's second track becomes `minmax(0, 1fr)`; the meta row gets `flex-wrap: wrap; overflow: hidden`; the field gets `flex: 1 1 …; min-width: 0` (`17734`). Confirmed in `list-mobile-mobile-dark.png`: no card off-screen, no value past the border.
6. **Board — the group header stays off the cards.** On the phone the board becomes a dual-axis scroll container (`overflow-x: auto` pairs with `overflow: visible` → `auto`), making it the containing block for the sticky header, whose desktop-seeded `top` then floated it down over the cards. `.db-board-column-header` is taken out of sticky flow (`position: relative; top: auto` `17766`), staying positioned so its `::before` background still anchors. Confirmed at column top in `board-mobile-mobile-dark.png`.
7. **Record detail panel — a dismissable bottom sheet.** `positionToolbarPopover` already renders the sheet + grab handle on the phone; what was missing is the dismissal. Added: a permanent header close button reusing the existing `db-cell-edit-close` class, shown only in the sheet (`RecordDetailPanel.ts:198`, CSS `17776`); `mousedown`→`pointerdown` for the outside handler so touch works (`RecordDetailPanel.ts:138, 244`); `attachSheetDragToDismiss` — pointer drag on the grab handle, translate-follow, 96px threshold (`RecordDetailPanel.ts:255`); and `box-sizing: border-box !important` on `.db-mobile-bottom-sheet` so its padding does not overflow the viewport without the runtime inline box-sizing (`styles.css:195`). Confirmed in `panel-record-detail-sheet-mobile-dark.png`.
8. **Hover — gated off touch.** The six load-bearing hover rules (table `tr:hover td`, `td:hover`; `.db-list-row:hover`; `.db-board-card:hover`; `.db-board-card-field:hover`; `.db-record-detail-field:hover`) are wrapped in `@media (hover: hover)`, the repo's existing pattern (`5281, 8572, 8747, 8950, 9513`), so a tap leaves nothing stuck.
9. **Reproduction and regression.** The existing "views" fixtures omit `db-width-default`, the select column and the real list structure, so they photographed clean while the device was broken. Four `is-phone` scenarios carry the realistic runtime DOM: `table-mobile`, `list-mobile`, `board-mobile` (`core.mjs`) and `panel-record-detail-sheet` (`panels.mjs`, `capture: "viewport"`). `src/views/MobileTableAndPanelUx.test.ts` asserts the phone rules, the hover gates and the renderer's pointer/close/drag wiring against the shipped tree.

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

- **Phase 1**: Four-area read-only audit — table, record panel, list/board, harness+hover — to separate the one cause from six symptoms and real bugs from harness stand-ins.
- **Phase 2**: The is-phone divergence layer — container reset, table, list, board, hover.
- **Phase 3**: Record panel — close button, pointer dismissal, drag gesture; bottom-sheet box-sizing.
- **Phase 4**: Reproduction scenarios and the regression suite.
- **Phase 5**: Capture the new scenarios at phone width and eyeball them; the box-sizing fix came from this loop (the sheet's padding overflowed the viewport before it).
- **Phase 6**: Full recapture (styles.css invalidated all captures) and the whole gate.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

- **One is-phone layer, not six patches.** The defects share one cause, so the fix is one divergence layer keyed strictly off `is-phone`, added on top of untouched desktop CSS. `is-phone` was chosen over `@media (max-width)` deliberately: a narrow desktop is a different question, and the existing board rules that conflate the two are what this phase works around.
- **`table-layout: auto` over recomputing widths in JS.** It is the browser's native "hug content", is intrinsic-content sized (so no runaway), and needs no per-cell measurement on the phone path. The `!important` overrides are required because the widths are inline (JS-set) and specificity alone cannot release them — the repo already uses `!important` for host/inline overrides.
- **Reuse `db-cell-edit-close`, do not invent a class.** The close affordance is an existing, styled class; it is added to the header on every platform and shown only in the sheet via CSS, so the desktop anchored panel is unchanged and no `.db-*` class is invented (which `ScreenshotFixtures.test.ts` would reject).
- **Move outside-dismissal to `pointerdown`, not add a touch handler.** `pointerdown` fires for both mouse and touch, so it is a superset: the phone gains dismissal and the desktop is unchanged.
- **Take the board header out of sticky flow rather than fight the containing block.** The sticky `top` mis-resolves because the phone board is a dual-axis scroll container; making the header non-sticky is the smaller, more durable fix than trying to recompute the offset.
- **Fix the bottom-sheet box-sizing on the class, not only inline.** `positionToolbarPopover` sets it inline at runtime, but the class must hold on its own; making `.db-mobile-bottom-sheet` border-box is correct with or without JS and is what made the sheet render correctly in the harness.
- **Build realistic reproduction fixtures.** The clean-looking existing mobile captures were the trap: the fix would have "passed" against fixtures that never reproduced the bug. The new fixtures carry `db-width-default` and the runtime DOM so the harness reproduces the defect and then confirms the fix.

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

- **The operator's anchored-panel screenshot pre-dates the current code.** The brief described the record panel as an anchored overlay; the current `positionToolbarPopover` already renders it as a bottom sheet with a grab handle on the phone. What was actually missing — and fixed — is the dismissal (close button, pointer outside-handler, drag gesture), not the sheet conversion. Recorded rather than fixing a symptom that no longer exists.
- **A seventh fix was added that the brief did not name.** `box-sizing: border-box` on `.db-mobile-bottom-sheet` (REQ-008) surfaced from the capture loop — the sheet's own padding overflowed the viewport width without the runtime inline box-sizing. It is a robustness fix to the same surface, recorded as its own requirement.
- **The hover fix uses `@media (hover: hover)` wrapping, the primary leg of the repo pattern**, applied to the six load-bearing rules rather than all 284 `:hover` rules — the operator asked for the load-bearing ones for the four broken views, and wrapping avoids the value-duplication drift a `@media (hover: none)` override would carry.

<!-- /ANCHOR:deviations -->
---

<!-- ANCHOR:verification -->
## Verification

All gates were run from the final state and their output and exit status read.

```bash
npx tsc --noEmit            # exit 0
npm run build               # exit 0 (main.js rebuilt)
npx vitest run              # 50 files, 396 tests, all pass (was 49/386)
npm run screenshots         # 196 entries, manifest + README rewritten (was 180)
npm run screenshots:verify  # 196 entries match their sources
```

Baseline (from `HANDOVER.md`, re-confirmed at session start): tsc 0, vitest 386/49, screenshots:verify 180. Delta: +10 tests / +1 file (the new suite), +16 captures (four scenarios × 2 devices × 2 themes). `npm run lint` is left at its known 115-problem baseline; not touched, no regression claimed.

### Verification Checklist
- [x] Table select column unclipped and header/row checkboxes aligned (`styles.css:17683, 17690`; `table-mobile-mobile-dark.png`).
- [x] Table columns hug content and cannot run away (`17711`; long name renders in full, table scrolls).
- [x] List cards fill the viewport with values inside the border (`17734`; `list-mobile-mobile-dark.png`).
- [x] Board group header at the column top, not over cards (`17766`; `board-mobile-mobile-dark.png`).
- [x] Record sheet has a grab handle, a visible close button, and closes on drag/pointer (`RecordDetailPanel.ts:198, 244, 255`; `panel-record-detail-sheet-mobile-dark.png`).
- [x] Six hover rules gated on `@media (hover: hover)` (`5281, 8572, 8747, 8950, 9513`).
- [x] Desktop unchanged: every rule is is-phone-scoped or a hover gate (`table-mobile-desktop-dark.png`; selector inspection).
- [x] Regression suite `MobileTableAndPanelUx.test.ts` — 10 assertions pass.
- [x] `ScreenshotFixtures.test.ts` class guard passes: no invented class in the new fixtures.
- [x] `git status` clean of stray temp files; `scratch/` holds only `.gitkeep`.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

- **On-device gestures were not run.** The drag-down-to-dismiss and pointer outside-dismissal are verified by source and by the regression suite, and the sheet is eyeballed in the harness, but no Obsidian mobile session exercised the actual pointer path. Treat the gesture behaviour as static-analysis-verified until run on a device.
- **The 60vw cap is best-effort on table-cells.** Chrome does not reliably honour `max-width` on a `display: table-cell` in auto layout, so a pathological single value produces a wide-but-finite column with horizontal scroll rather than an ellipsis. The layout is still bounded by intrinsic content (no runaway) and the operator's "hug content" ask is met.
- **The board header-over-cards overlap is a scroll-position artifact.** The static harness captures scroll 0, where the header already sits at the column top, so the capture confirms the *non-overlapping* state rather than reproducing the overlap. The non-sticky fix that prevents the float is asserted by CSS; a moving-scroll confirmation needs the real app.
- **The pre-existing board mobile media query still keys on `(max-width: 760px)`.** That conflates a cramped desktop with a phone, which the hard constraints warn against, but it predates this phase; the header fix is layered on `is-phone`-scoped rather than rewriting the media query.

<!-- /ANCHOR:limitations -->
