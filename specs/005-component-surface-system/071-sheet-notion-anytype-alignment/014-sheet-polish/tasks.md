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

- [ ] T001 Read `../sheet-notion-audit.md` §0, §3.6, §3.7, §3.13 and §4 before any edit. Note the packet's purpose: two items carry work and the rest are **recorded**. Adding an item to this scope requires an operator ruling, not a reviewer's preference (`../sheet-notion-audit.md`)
- [ ] T002 Run the lane and record the pre-change baseline: icon-picker 8/8 grammar columns, close target 44.0x44.0, parent dim ratio 0.390, title centred within 0.49px (`tools/live/sheet-grammar.mjs`)
- [ ] T003 Answer the boundary question **before** writing any code: does taking `Remove` off the search row and putting it in the sheet header require changing `createSheetHeader` (`mobile-bottom-sheet.ts`)? If it does, stop — record the item Proposed in `decision-record.md` with the reasoning, leave the builder untouched, and satisfy REQ-002 by relocating `Remove` within the picker's own body instead. `007` REQ-006 draws this same line around the same builder (`src/views/icon-picker-popover.ts`, `src/views/mobile-bottom-sheet.ts`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED

- [ ] T004 Add two clauses and run each RED first, recording the failing state: (a) the icon picker's search row has 0 of `Remove`, `Random` and the settings button among its siblings — RED today at 3; (b) each add affordance on the properties and record sheets is a full-width row rather than one of a side-by-side pair — RED today (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [ ] T005 Relocate `Remove`, `Random` and the settings button off the icon picker's search row, by whichever route T003 ruled available. Keep each control's touch box at or above 44px on its new row. Confirm the clause passes on the `Reaction` variant too, which carries no `Remove` at all — Notion's does not either (`src/views/icon-picker-popover.ts`, `styles.css`)
- [ ] T006 Render the add affordances as full-width rows on the properties and record sheets. If `009-properties-sheet-row-model` has already landed, rebase onto it first — it changes the same producer (`src/views/column-manager-renderer.ts`, `src/views/record-detail-panel.ts`, `styles.css`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Verify and close

- [ ] T007 Run GREEN on T004 and record the numbers. Rerun every landed sheet clause unchanged on **both** engines and confirm nothing regressed. Confirm by `git diff` that `mobile-bottom-sheet.ts` is byte-identical unless the operator ruled otherwise (REQ-004). Recapture each changed surface phone-only light and dark. Full battery: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run gate` — record each exit code. Then write the closing docs, carrying forward §13's two **convergence** findings verbatim — the colour picker is already Notion's control, and the column-width sheet has no Notion reference — so the next audit does not re-derive them. Validate (`orchestrator --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet entry to `../../handover.md` (`tools/live/*`)
<!-- /ANCHOR:phase-4 -->
