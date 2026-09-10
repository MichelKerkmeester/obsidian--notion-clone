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

- [x] T001 Read `../sheet-notion-audit.md` §0, §3.4, §3.5, §3.12 and §3.14 before anything else. Note what makes this packet unusual: every target is **ordinal**, and an ordinal fact survives the 299x678 ceiling intact — so unlike the other packets in this wave, the Notion column here is directly load-bearing (`../sheet-notion-audit.md`)
- [x] T002 Run the lane and record the pre-change baseline verbatim for all four surfaces, especially `061`'s confirm geometry: inset ≥16px all four edges, radius 16px all four corners, `flex-direction: column`, action heights `[44,50]` (`tools/live/sheet-grammar.mjs`) — the RED run: 7 failures, exactly the packet's own clauses, every landed row green; the 061 readings carried by the post-T005 rerun, which touches order only (inset 275.3/35/35/275.3px, radius 16px ×4, column, heights 50/44px)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert the four orders

- [x] T003 Add four order clauses and run each RED first, recording the failing state: (a) in the stacked confirm the destructive action is the first child of `.obnotion-modal-actions` — RED today, cancel is; (b) the date picker's calendar precedes its segment inputs in document order — RED today; (c) the add-view create affordance precedes its settings rows — RED today; (d) the toolbar overflow menu contains 0 free-text inputs — RED today (`tools/live/sheet-grammar.mjs`)
- [x] T004 Add a clause asserting `Clear` is not a member of the date picker's presets group. Run RED and record (today: the fourth of four) (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [x] T005 The confirm, first because it is one line and carries the geometry risk: in `buildConfirmSheetBody`, emit the confirm button before the cancel button in the **stacked** variant only — the side-by-side variant every other modal footer uses keeps its current order. Change the shared builder, not the lane's probe; both read the same function by design. Then rerun `061`'s geometry clauses immediately and confirm nothing moved (`src/views/confirm-sheet.ts`)
- [x] T006 The date picker: put the calendar ahead of the numeric segment inputs and take `Clear` out of the presets group, giving it its own row. Then measure the keyboard inset with the reordered sheet mounted, reading the published `--obnotion-keyboard-inset` the placement loop writes per sheet, and confirm the calendar is not covered (`src/views/date-value-picker.ts`, `styles.css`)
- [x] T007 Add-view and the toolbar menu: move the create affordance ahead of the four settings rows, keeping the name input's deliberate absence of a placeholder (`toolbar-renderer.ts:1428-1430` — do not add one). For the toolbar menu, land the presets' new destination **before** removing the text inputs from the menu surface, the same destination-before-source order `009` uses. Do **not** convert the layout rows to tiles — ADR-C is Proposed (`src/views/toolbar-renderer.ts`, `styles.css`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Regression, unit proof and close

- [x] T008 Run GREEN on T003 and T004 and record every number. Then rerun the landed clauses unchanged on **both** engines: `061`'s confirm geometry in full (REQ-003), and the row grammar of every surface touched — pitches inside the 44-52 band, 16px insets, 0 native selects, no horizontal overflow at 402px (`tools/live/sheet-grammar.mjs`)
- [x] T009 Extend `confirm-sheet.test.ts` with a revert-proof unit test for the action order and prove it red-then-green by swapping the two `createEl` calls back. Confirm by `git diff` that the add-view name input still has no placeholder (REQ-005) and that the layout choice still renders as rows (REQ-009) (`src/views/confirm-sheet.test.ts`)
- [x] T010 Recapture all four surfaces phone-only, light and dark, and record a measured before/after against `spec.md` §13 (REQ-010) (`screenshots/`) — recorded, provisional: 24 deterministic two-run movers in the css-lane triplet (baselineHash `aa57d141259c`); the record popover's half is the lane's printed 15→0 plus the destination's 15, because the constructed corpus has no scenario for that popover; the visual retuning awaits the device read (D3, the audit's C-1..C-6)
- [x] T011 Full battery: `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `node tools/live/sheet-grammar.mjs`, `npm run gate` — record each exit code. Then write the closing docs including a `decision-record.md` entry for the confirm reorder citing Notion's 4/4, validate (`orchestrator --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet entry to `../../handover.md` (`tools/live/*`)
<!-- /ANCHOR:phase-4 -->

---

### Design-review follow-ups (2026-09-10)

Opened by `../sheet-design-review.md` §6 F-4, a `sk-design-fundamentals` pass distinct from this
child's own reordering work. Not yet implemented.

- [ ] T012 RED first: add a clause to `tools/live/sheet-grammar.mjs`'s date-picker block that
  reads the computed `border` and `background` of a mounted `.obnotion-date-seg` inside the phone
  sheet's `.obnotion-date-picker-body`, and asserts they match the class's own declared rule
  (`border: 0`, `background: transparent`, `styles.css:7171-7182`) rather than the inherited
  `.obnotion-panel-row input` rule (`styles.css:13836-13846`: `border: 1px solid
  var(--background-modifier-border)`, `background: var(--background-primary)`). Run against the
  unmodified tree and record the failure: the segment computes the panel-row input's bordered
  treatment, not its own (`tools/live/sheet-grammar.mjs`)
- [ ] T013 Fix with a targeted override, the same resolution the icon-picker search field already
  uses for the identical leak (`styles.css:14266-14277`, three classes beats two-classes-plus-type
  on specificity): add
  `.obnotion-mobile-bottom-sheet .obnotion-date-picker-body .obnotion-date-seg { border: 0; background: transparent; }`
  immediately after the `.obnotion-mobile-bottom-sheet .obnotion-date-picker-body` rule at
  `styles.css:14302-14307` (`styles.css`)
- [ ] T014 Verify GREEN: T012's clause passes; rerun the date-picker order clauses this leg shipped
  (`calendar precedes segments`, `three shortcut presets, Clear outside the group`) unchanged —
  the fix touches only the segment inputs' paint, not their order or width. Recapture
  `constructed-date-picker-mobile-{light,dark}.png` and
  `field-date-value-picker-mobile-{light,dark}.png` and confirm by eye that the typed-segment row
  no longer looks like a different input system than the three preset buttons above it
  (`tools/live/sheet-grammar.mjs`, `screenshots/`)
