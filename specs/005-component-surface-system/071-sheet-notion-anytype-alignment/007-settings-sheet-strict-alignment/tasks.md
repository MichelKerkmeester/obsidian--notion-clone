---
title: "Tasks: Phase 7: settings-sheet-strict-alignment"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 7: settings-sheet-strict-alignment

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: Reference capture and measurement

- [ ] T001 Ask the operator for a full-resolution Notion iOS database-settings screenshot from
  their own device (the scaffold's own reference, `screenshots/notion/ios/flows/database-settings/`,
  is a 299x678px Mobbin thumbnail with no native-resolution numbers, confirmed via `sips`). If
  supplied, measure card corner-radius, inter-card gap and card-to-edge inset from it and replace
  `spec.md` §13's `TBD` cells with the measured numbers. If not supplied within this leg's budget,
  proceed on the structural requirements only (REQ-002/REQ-004) and leave the three numeric cells
  `TBD` — never invent a number (`spec.md`, `002/decision-record.md` D-005)
- [x] T002 DONE 2026-09-09: the pre-change lane ran clean (002's full set green), then the new card
  assertion's RED read exactly the scaffold-predicted failure (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert the card-grouping shell

- [x] T003 DONE 2026-09-09: card-grouping assertion added (≥2 cards, radius ≥8px floor, background
  distinct from canvas, gap ≥8px floor, headings above their card); RED recorded — lane exit 1,
  `0 card containers, wanted >= 2` (`tools/live/sheet-grammar.mjs`)
- [x] T004 DONE 2026-09-09: footer-card assertion added — IF a row carries the sheet-action marker
  it must sit in the body's last card; 0 marked rows today, assertion passes vacuously
  (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [x] T005 DONE 2026-09-09: each section's heading is followed by one `.obnotion-settings-card`
  container collecting that section's rows, sheet presentation only (the anchored popover keeps
  the continuous list); no row's own DOM, class list, or handlers changed
  (`src/views/view-config-panel-renderer.ts`)
- [x] T006 DONE 2026-09-09 (PROVISIONAL numbers pending T001): card = `--background-primary` at
  `border-radius: var(--obnotion-radius-lg)` (8px), margin `0 var(--obnotion-sheet-inset)
  var(--obnotion-space-5)` (16px inset / 12px gap), canvas = the sheet's own
  `--obnotion-surface-overlay` fill; headings above their card keep spacing and lose the opening
  hairline; a card's first row draws no divider (sibling-position rule, 067's mechanism), both
  themes (`styles.css`)
- [x] T007 DONE 2026-09-09: lane exit 0 — 2/2 cards radius ≥8px, every card's background distinct
  from the canvas, 1/1 inter-card gap ≥8px, 2/2 headings above their card, footer-card assertion
  vacuous-pass (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Regression and unit proof

- [x] T008 DONE 2026-09-09: 002's assertions rerun unchanged and green — 2336 PASS / 0 FAIL
  lane-wide, exit 0, the grammar now measured inside the cards
  (`tools/live/sheet-grammar.mjs`)
- [x] T009 DONE 2026-09-09: card-rule test added; revert check — card background declaration
  removed → exactly 1 test fails (1 failed / 6 passed), restored → 7/7
  (`src/views/view-config-sheet-row-grammar.test.ts`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase E: Capture, gate, close

- [x] T010 DONE 2026-09-09: recaptured phone-only light and dark ×3 (480 entries, exit 0 all);
  4 deterministic two-run content movers (view-config dark 716882px@Δ192 / light 716962px@Δ209,
  board-card-properties dark 785113px@Δ194 / light 785159px@Δ209); before/after recorded in
  `implementation-summary.md` against §13 (`screenshots/`)
- [x] T011 DONE 2026-09-09: tsc 0, build 0, vitest 1586/1586 (exit 0), sheet-grammar 0,
  touch-targets 0, render-assertions 0, verify-placement 0, evidence 15/15 fresh, check-lane 0,
  gate 27 green / 0 red ×2, scans 0 (`tools/live/*`)
- [x] T012 DONE 2026-09-09: docs written (AC rows ticked with lane numbers, the four provisional
  metrics and T001/AC-007 named open; no decision-record entry needed — the provisional-metrics
  ruling is the operator's own, recorded in spec.md §13 and the summary); validate --strict
  RESULT: PASSED ×3 (packet, 071 parent first RESULT, 005 track); graph metadata backfilled;
  packet entry appended to `../../handover.md`
<!-- /ANCHOR:phase-5 -->
