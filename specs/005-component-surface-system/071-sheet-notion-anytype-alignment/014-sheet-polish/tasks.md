---
title: "Tasks: Phase 14: sheet-polish"
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
# Tasks: Phase 14: sheet-polish

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
## Phase A: Boundary check first

- [x] T001 Read `../sheet-notion-audit.md` §0, §3.6, §3.7, §3.13 and §4 before any edit. Note the packet's purpose: two items carry work and the rest are **recorded**. Adding an item to this scope requires an operator ruling, not a reviewer's preference (`../sheet-notion-audit.md`)
  - Landed 2026-09-10: the five sections read; the scope held — two items implemented, the colour picker and column-width recorded, card grouping left to its ruling
- [x] T002 Run the lane and record the pre-change baseline: icon-picker 8/8 grammar columns, close target 44.0x44.0, parent dim ratio 0.390, title centred within 0.49px (`tools/live/sheet-grammar.mjs`)
  - Landed 2026-09-10: rerun on the untouched tree, exit 0 — the registered icon-picker surface prints all eight grammar columns PASS, close target 44.0x44.0, parent dim 0.390 (want 0.35-0.44), no right-edge overflow; the centring figure stands from the goal log's own measurement. The RED run's baseline printed the identical clause set
- [x] T003 Answer the boundary question **before** writing any code: does taking `Remove` off the search row and putting it in the sheet header require changing `createSheetHeader` (`mobile-bottom-sheet.ts`)? If it does, stop — record the item Proposed in `decision-record.md` with the reasoning, leave the builder untouched, and satisfy REQ-002 by relocating `Remove` within the picker's own body instead. `007` REQ-006 draws this same line around the same builder (`src/views/icon-picker-popover.ts`, `src/views/mobile-bottom-sheet.ts`)
  - Landed 2026-09-10: recorded Proposed in `decision-record.md` — the shared header's leading slot already exists and the hook chain reaches it without touching the builder, but the promotion needs the picker-host's mount contract to grow the pass-through, which is the shared surface the 007 requirement pins; `mobile-bottom-sheet.ts` (and `surface-shell.ts`, `popover-host.ts`) untouched, 0 changed lines; REQ-002 satisfied by relocating all three controls within the picker's own body
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED

- [x] T004 Add two clauses and run each RED first, recording the failing state: (a) the icon picker's search row has 0 of `Remove`, `Random` and the settings button among its siblings — RED today at 3; (b) each add affordance on the properties and record sheets is a full-width row rather than one of a side-by-side pair — RED today (`tools/live/sheet-grammar.mjs`)
  - Landed 2026-09-10: the clauses went in as a bespoke mounted-surface block (`window.__sheetPolishRows`) with its own printed section; RED, exit 1 — (a) 3 of the three on the search row (row: tabs, search, remove, random, settings); (b) the record add affordance 17% of a 1-button row, the properties pair 23% / 22% of a 2-button row — exactly the failing states the task recorded, nothing else red. The record sheet's clause needed the fixture to pass its `addProperty` action (`tools/live/render-assertion-harness.ts`, recorded as the packet's one scope addition)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [x] T005 Relocate `Remove`, `Random` and the settings button off the icon picker's search row, by whichever route T003 ruled available. Keep each control's touch box at or above 44px on its new row. Confirm the clause passes on the `Reaction` variant too, which carries no `Remove` at all — Notion's does not either (`src/views/icon-picker-popover.ts`, `styles.css`)
  - Landed 2026-09-10: GREEN, exit 0 — 0 of the three on the search row (row: tabs, search); the controls read on a dedicated 44px action row beneath it, `Remove` a 44px label tap, `Random` and the settings 44x44 icon boxes. The variant case passes by the clause's own mechanics: it counts only controls the picker actually renders among the search's siblings, so a picker with no `Remove` reports 0 without a special case; no current caller omits one
- [x] T006 Render the add affordances as full-width rows on the properties and record sheets. If `009-properties-sheet-row-model` has already landed, rebase onto it first — it changes the same producer (`src/views/column-manager-renderer.ts`, `src/views/record-detail-panel.ts`, `styles.css`)
  - Landed 2026-09-10: GREEN, exit 0 — the record affordance 100% of its row, the properties pair 92% / 92% (width:100% inside the row's 16px sheet inset, above the 0.9 span floor). `009` had landed, so the rebase was already standing: the producers' markup offered one row per affordance and only the stylesheet governed the widths, which is why neither producer is among the changed files
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Verify and close

- [x] T007 Run GREEN on T004 and record the numbers. Rerun every landed sheet clause unchanged on **both** engines and confirm nothing regressed. Confirm by `git diff` that `mobile-bottom-sheet.ts` is byte-identical unless the operator ruled otherwise (REQ-004). Recapture each changed surface phone-only light and dark. Full battery: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — record each exit code. Then write the closing docs, carrying forward §13's two **convergence** findings verbatim — the colour picker is already Notion's control, and the column-width sheet has no Notion reference — so the next audit does not re-derive them. Validate (`orchestrator --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet entry to `../../handover.md` (`tools/live/*`)
  - Landed 2026-09-10: the numbers above, plus tsc 0, build 0, vitest 1606/1606, render-assertions 0, placement 418/420 (2 declared), screenshots ×2 480/480 (21 movers, all reproduced in both runs, none jitter-restored), evidence 16/16 fresh, check-lane 0 (18 of 21 content-moved, all named), scans 0/0, gate 28/0; `mobile-bottom-sheet.ts` byte-identical (0 changed lines, no ruling needed); the two convergence findings carried verbatim into the implementation summary; validation, backfill and the parent handover entry — all done in this pass
<!-- /ANCHOR:phase-4 -->
