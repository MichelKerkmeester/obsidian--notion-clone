---
title: "Tasks: Phase 13: sheet-input-and-action-order"
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
# Tasks: Phase 13: sheet-input-and-action-order

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
## Phase A: Baseline

- [ ] T001 Read `../sheet-notion-audit.md` §0, §3.4, §3.5, §3.12 and §3.14 before anything else. Note what makes this packet unusual: every target is **ordinal**, and an ordinal fact survives the 299x678 ceiling intact — so unlike the other packets in this wave, the Notion column here is directly load-bearing (`../sheet-notion-audit.md`)
- [ ] T002 Run the lane and record the pre-change baseline verbatim for all four surfaces, especially `061`'s confirm geometry: inset ≥16px all four edges, radius 16px all four corners, `flex-direction: column`, action heights `[44,50]` (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert the four orders

- [ ] T003 Add four order clauses and run each RED first, recording the failing state: (a) in the stacked confirm the destructive action is the first child of `.obnotion-modal-actions` — RED today, cancel is; (b) the date picker's calendar precedes its segment inputs in document order — RED today; (c) the add-view create affordance precedes its settings rows — RED today; (d) the toolbar overflow menu contains 0 free-text inputs — RED today (`tools/live/sheet-grammar.mjs`)
- [ ] T004 Add a clause asserting `Clear` is not a member of the date picker's presets group. Run RED and record (today: the fourth of four) (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [ ] T005 The confirm, first because it is one line and carries the geometry risk: in `buildConfirmSheetBody`, emit the confirm button before the cancel button in the **stacked** variant only — the side-by-side variant every other modal footer uses keeps its current order. Change the shared builder, not the lane's probe; both read the same function by design. Then rerun `061`'s geometry clauses immediately and confirm nothing moved (`src/views/confirm-sheet.ts`)
- [ ] T006 The date picker: put the calendar ahead of the numeric segment inputs and take `Clear` out of the presets group, giving it its own row. Then measure the keyboard inset with the reordered sheet mounted, reading the published `--obnotion-keyboard-inset` the placement loop writes per sheet, and confirm the calendar is not covered (`src/views/date-value-picker.ts`, `styles.css`)
- [ ] T007 Add-view and the toolbar menu: move the create affordance ahead of the four settings rows, keeping the name input's deliberate absence of a placeholder (`toolbar-renderer.ts:1428-1430` — do not add one). For the toolbar menu, land the presets' new destination **before** removing the text inputs from the menu surface, the same destination-before-source order `009` uses. Do **not** convert the layout rows to tiles — ADR-C is Proposed (`src/views/toolbar-renderer.ts`, `styles.css`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Regression, unit proof and close

- [ ] T008 Run GREEN on T003 and T004 and record every number. Then rerun the landed clauses unchanged on **both** engines: `061`'s confirm geometry in full (REQ-003), and the row grammar of every surface touched — pitches inside the 44-52 band, 16px insets, 0 native selects, no horizontal overflow at 402px (`tools/live/sheet-grammar.mjs`)
- [ ] T009 Extend `confirm-sheet.test.ts` with a revert-proof unit test for the action order and prove it red-then-green by swapping the two `createEl` calls back. Confirm by `git diff` that the add-view name input still has no placeholder (REQ-005) and that the layout choice still renders as rows (REQ-009) (`src/views/confirm-sheet.test.ts`)
- [ ] T010 Recapture all four surfaces phone-only, light and dark, and record a measured before/after against `spec.md` §13 (REQ-010) (`screenshots/`)
- [ ] T011 Full battery: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `node tools/live/sheet-grammar.mjs`, `npm run gate` — record each exit code. Then write the closing docs including a `decision-record.md` entry for the confirm reorder citing Notion's 4/4, validate (`orchestrator --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet entry to `../../handover.md` (`tools/live/*`)
<!-- /ANCHOR:phase-4 -->
