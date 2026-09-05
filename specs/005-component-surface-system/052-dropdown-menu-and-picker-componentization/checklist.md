---
title: "Verification Checklist: Dropdown, Menu and Picker Componentization"
description: "The ten thresholds the migration closes, each with today's counted value recorded before its leg runs, so a pass means the family changed rather than a check being added."
trigger_phrases:
  - "052 checklist"
  - "menu componentization checklist"
  - "red first per family"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Dropdown, Menu and Picker Componentization

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

Desktop measurements on the real renderer at the production mount point; phone measurements on a
390×844 profile with a navbar present. Every threshold carries a failing value observed before the
fix (goal D2). T002/T003 fill every `Today` cell that carries a mechanism rather than a figure.

| # | Criterion | Today | Target | Evidence |
|---|-----------|-------|--------|----------|
| C1 | A `submenu: true` row opens a real nested menu through the factory, on pointer, keyboard and phone | **Closed 2026-09-05 (T004).** `owned-menu.ts` now exposes `buildSubmenu` on `addRow`; click, `ArrowRight`, `Enter` and hover (behind `(hover: hover)`) all call one `openChildMenu`, which opens a real child `createOwnedMenu` positioned beside the row on desktop or as a stacked sheet on the phone. `owned-menu.test.ts` drives all four paths plus innermost-only Escape and LIFO outside-dismissal against a mock DOM; stashing the change and re-running the same suite reproduces 6 of 7 failures (re-observed 2026-09-05 on the rebased tree: `6 failed | 1 passed (7)` reverted, `7 passed (7)` restored). **The three named paths are not all observed at the same tier.** Pointer, keyboard and hover are driven directly. The phone path is **derived**, from two observations rather than one drive: the child is produced by `createOwnedMenu` itself (observed in the click test, which reads a second `db-owned-menu` on the body), and that factory's phone presentation is what `sheet-grammar.mjs` already holds green for the registered `owned-menu` surface. Nothing in the child path is phone-specific, so the derivation is sound, but it is a derivation and the lane row that would drive it is deferred with T004's deviation 1. The desktop child is not separately registered with `overlayStack` — only the phone path registers, automatically, through the existing sheet-chrome mechanism — see `tasks.md` T004's named deviation | all three paths open the primitive submenu; the hand-built lifecycle is gone | [x] |
| C2 | Hand-built `db-menu-item` row sites outside `menu-row.ts` | **70** — `toolbar-renderer.ts` 44, `column-menu.ts` 19, `dropdown-field.ts` 4, `cell-renderer.ts` 3 (`grep -rn "db-menu-item" src/views/*.ts \| grep "cls"`, counted 2026-09-05). *Reproduced 2026-09-05 (T002)*: same command, same per-file counts, **76** including `menu-row.ts`'s own 6. *Re-measured 2026-09-05 after rebasing this leg onto `053`*: **65** outside `menu-row.ts` — `toolbar-renderer.ts` **39** (down 5; `053` moved five of its hand-built rows onto `toolbar-primitives.ts`), `column-menu.ts` 19, `dropdown-field.ts` 4, `cell-renderer.ts` 3; **71** including the builder's own 6. `src/views/menu-row-vocabulary-census.test.ts` carries 65/39 as its ratchet, not the pre-rebase 70/44 — a ratchet sitting 5 above the real count licenses the regression it exists to catch. *Re-measured 2026-09-05 after T007*: **63** outside `menu-row.ts` — `toolbar-renderer.ts` **37** (down 2; the census counts hand-built-row *definition* lines, not call sites, so deleting `renderViewTabPopoverRow` and `renderViewTypeChangeRow` — one `cls` line each, shared by all nine of `showViewTabMenu`'s rows — drops the count by 2 even though nine rows moved to `addRow`), `column-menu.ts` 19, `dropdown-field.ts` 4, `cell-renderer.ts` 3; **69** including the builder's own 6. Ratchet re-pinned to 63/37 **Reconfirmed 2026-09-06 (T010/T011)**: `cell-renderer.ts` stays at **3**, unchanged — the option editor's rows now build through `menu-row.ts`'s `createMenuRow` (T010), which moved zero hand-built lines because that popover never carried a `db-menu-item` class before this leg; the relation editor's three lines (T011) were evaluated for the same move and refused, because the list they build is a `listbox` whose rows and the keyboard handler that drives them depend on `role="option"`/`aria-selected`, semantics `menu-row.ts`'s rows do not carry (`role="menuitem"`/`menuitemcheckbox`) — an individually dispositioned survivor per this row's own target clause, not an oversight. 63/37/69 all reproduce unchanged on the rebased tree; `npx vitest run src/views/menu-row-vocabulary-census.test.ts` stays green | 0, or each remaining site individually dispositioned in `componentization-plan.md` | [ ] |
| C3 | An empty-eligible-row menu renders the never-empty fallback | **Closed 2026-09-05 (T005).** `owned-menu.ts`'s `showAt` adds one disabled instructional row (`t("menu.noActions")`, "No available actions") the first time it is called having received zero `addRow` calls. `owned-menu.test.ts` asserts exactly one disabled row for a menu that never called `addRow`, and none for one that called it once; red-first confirmed by stashing the change | ≥1 row always, the G3 fallback | [x] |
| C4 | Distinct active-picker registries in `src/views/` | **3** — `date-value-picker.ts:71`, `icon-picker-popover.ts:50`, `option-color-picker.ts:29` (each `activePickers = new WeakMap`). *Reproduced 2026-09-05 (T002)*: `grep -n "activePickers = new WeakMap" src/views/*.ts` returns the same three lines. *Still 3 after T006*: the host's own registry was written, found to have no consumer and a shape `date-value-picker.ts` could not use, and was cut before landing (`tasks.md` T006, deferral 1) — had it landed, this cell would read **4**, which is the count going the wrong way. **Closed 2026-09-05 (T012).** `popover-host.ts` now carries `ActivePicker { anchor; close(commit?) }` and the one registry (`getActivePicker`/`setActivePicker`/`clearActivePickerIfCurrent`/`closeActivePicker`), written against `date-value-picker.ts`'s own need to read `anchor` back — the shape T006 found nothing had to fit, now fitted first. All three pickers consume it; `grep -n "activePickers = new WeakMap" src/views/*.ts` returns exactly one line, in `popover-host.ts` | 1, the host's | [x] |
| C5 | Distinct geometric grid navigators | **2** — `getIconNavigationTarget` (`icon-picker-popover.ts:284`) and `getColorNavigationTarget` (`option-color-picker.ts:138`), near-duplicates. *Corrected 2026-09-05 (T002)*: the cell previously cited `:281`/`:130`; `grep -n "function getColorNavigationTarget\|function getIconNavigationTarget" src/views/*.ts` now reads `:138` and `:284` — both files gained lines above these functions since the citation was written (the same drift `design-trueup.md` §7 already recorded for `AC-003`). The count of 2 is unchanged. **Closed 2026-09-05 (T012, ADR-003).** Both functions were structurally identical except a `<`/`<=` tolerance difference on the same-row filter; unified as `getGridNavigationTarget` in `popover-host.ts`, keeping the icon picker's `<=` (the looser of the two, and immaterial on any real grid where rows are separated by more than the tolerance). Oracle-tested in `popover-host.test.ts` against a fixed-column grid (the colour picker's shape) and an uneven-row grid (the icon picker's shape) before either picker was migrated onto it. `grep -n "function getColorNavigationTarget\|function getIconNavigationTarget" src/views/*.ts` now returns nothing; `grep -n "function getGridNavigationTarget" src/views/*.ts` returns exactly one line | 1, the host's, both pickers consuming it | [x] |
| C6 | Search implementations across the family | **4** — `dropdown-field.ts:424` `filterDropdownOptions`, `cell-renderer.ts:973` relation filter (`getFilteredRecords`), `icon-picker-popover.ts:126` search, `toolbar-renderer.ts:1099` hub search. *Corrected 2026-09-05 (T002)*: all four line citations had drifted (previously `:407`, `:968`, `:156`, `:1180`); re-found by `grep -n` against each file's function/variable name. The count of 4 implementations is unchanged. **Unchanged by T010-T012, with a reason.** The relation editor's `getFilteredRecords` re-runs on a virtualised window (`windowSize`/`rowHeight` spacer rows) rather than toggling a fixed row set's visibility, which is what `filterPickerRows` does — folding it in would mean rebuilding the virtualisation, not reusing the search, and neither T011 nor its proof clause asked for that (`tasks.md` T011: "windowing behaviour unchanged — the host does not own the list's window"). The icon picker's search narrows a tab/category-scoped catalogue rather than a fixed row list and stays its own. `toolbar-renderer.ts`'s hub search is T007/T008's file, untouched here by the parent brief's own scope fence | 1 shared (the host's) + documented exceptions only where a plan row says so | [ ] |
| C7 | Bespoke `preferredWidth` literals in the family | **8 distinct values** across **14** production call sites: 124, 252, 280, 292, 318, 360, 420, 520. *Corrected 2026-09-05 by T001 (`design-trueup.md` C9): the cell previously read "9 distinct values … 240". There is no 240 in the family — `chart-toolbar-renderer.ts:927` passes **280**, and the tree's only 240 is `popover-position.stories.ts:40`, a story*. *Reproduced 2026-09-05 (T002)*: `grep -rn "preferredWidth: [0-9]" src/views/*.ts` (excluding `surface-contract.ts`/`popover-position.ts`'s role definitions and `.stories.`/`.test.` files) returns the same 14 call sites and 8 distinct values. **Reduced 2026-09-05 (T011/T012).** Four literals moved onto named roles in `popover-host.ts` — `DATE_PICKER_POPOVER` (252), `SWATCH_PICKER_POPOVER` (124), `GRID_PICKER_POPOVER` (318), `RELATION_PICKER_POPOVER` (420/min 360/max 520) — so their call sites (`date-value-picker.ts`, `option-color-picker.ts`, `icon-picker-popover.ts`, `cell-renderer.ts`'s relation editor) no longer spell a literal at the call site. `grep -rn "preferredWidth: [0-9]" src/views/*.ts` excluding the same role-definition/test/story files now returns **5 distinct values — 280, 292, 360, 420, 520 — at 10 production call sites**, down from 8/14 | every value mapped to a named role or written reason in `componentization-plan.md` §3 | [ ] |
| C8 | Phone sheet-header construction sites for pickers/menus | **6+** hand-rolled variations — `owned-menu.ts:216-224` (with the insert-after-handle dance), `dropdown-field.ts:199`, `date-value-picker.ts:409-414`, `icon-picker-popover.ts:100-105`, `option-color-picker.ts:65-70`, `cell-renderer.ts:950-952`. *Corrected 2026-09-05 (T002)*: three citations had drifted (`date-value-picker.ts` was `:393-397`, `icon-picker-popover.ts` was `:135-141`, `option-color-picker.ts` was `:85-91`); re-found by `grep -n "createSheetHeader"` against each file. The count of 6 sites is unchanged. **Reduced 2026-09-05 (T012).** `popover-host.ts`'s `mountPickerSheetHeader` wraps `isMobileBottomSheet`/`createSheetHeader`/the body-wrapper once; `date-value-picker.ts`, `icon-picker-popover.ts` and `option-color-picker.ts` all call it instead of holding their own copy of the dance. `grep -n "createSheetHeader(" src/views/*.ts` now names 4 sites in the family — `owned-menu.ts`, `dropdown-field.ts`, `cell-renderer.ts`'s relation editor, and `popover-host.ts`'s one shared construction — down from 6, with 3 of those 6 collapsed into the 1 | 1 host construction consumed by all | [ ] |
| C9 | `044`'s registered sheet-grammar rows and `048`'s 31 stacked pairs after the migration | green today. *Measured 2026-09-05 (T002)*: `node tools/live/sheet-grammar.mjs`, `$?` → `0` — `PASS — every registered surface satisfies all eight grammar columns…`, 564 `PASS` lines, 0 `FAIL` lines. `REGISTERED_SURFACES` now holds **12** entries, not the cell's original 8: `044` landed its REQ-007 "header everywhere" decision since this cell was written and registered the four dropdown families (`owned-menu`, `date-picker`, `icon-picker`, `option-color-picker`) on top of the original 8 (`044/implementation-summary.md` "Grammar registry"). `REGISTERED_STACKED_PAIRS` holds **31**, unchanged. *Reconfirmed 2026-09-05 after T004-T006*: `node tools/live/sheet-grammar.mjs`, `$?` → `0`, 564 `PASS` / 0 `FAIL` — unchanged by the submenu handle, the fallback row, or the host extraction | still green, with pair selectors updated in the same leg that changes their markup | [ ] |
| C10 | `npm run gate` with one permanent lane row per migrated family | **not run for this phase — the family's lane rows do not exist**. *Reconfirmed 2026-09-05 (T002)*: `grep -rln "052\|dropdown-menu-and-picker\|menu-primitive\|picker-host" tools/gate.mjs tools/live/*.mjs tools/lane/*.mjs` returns nothing | exit 0; each new row's negative control observed red then green | [ ] |
| C11 | Colour picker swatch size on the phone sheet (Fable review P1 #9) | **Red, measured 2026-09-05.** `.db-color-picker-popup .db-color-picker-swatch` set 18×18px with no phone override — `styles.css` carried no `.db-mobile-bottom-sheet .db-color-picker-body .db-color-picker-swatch` rule at all, so the desktop mouse-pointer size shipped unchanged on a thumb. Below `design-system.md` §9's 28×28 coarse-pointer floor and `044`'s 44px close button both | **Green, 2026-09-05 (T012).** `.db-mobile-bottom-sheet .db-color-picker-body .db-color-picker-swatch { width: 44px; height: 44px; }` added; `constructed-option-color-picker-mobile-dark`/`-light` re-captured and read — the grid re-wraps at seven swatches per row, still fully visible at the sheet's own width, no truncation | [x] |

**C1 is the phase's headline: it deletes a shipped anti-pattern (a chevron that promises a menu
nothing can open). C2-C8 are the componentization accounting. C9-C10 are the fence that keeps the
migration from regressing `044` and `048`.**

### Capture evidence caveat

The grammar document's Anytype rows were authored from the capture index's written descriptions —
the authoring runtime could not open images. T001 opens the PNGs and corrects; a grammar row that
the pixels refute is re-dispositioned in the same leg that adopted it, and the correction is dated
in `anytype-menu-grammar.md`.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## PRE-IMPLEMENTATION

- [x] CHK-001 [P0] The census is counted, not estimated — every number in goal §3 and C2-C8 carries
      the command that produced it
- [x] CHK-002 [P0] The level is derived, not guessed — `recommend-level.sh --loc 1400 --files 15` →
      Level 2, 51/100, confidence 90%, phase score 10/50; raised to **Level 3** on judgment (same
      call as `050` at identical numbers)
- [x] CHK-003 [P0] What may not change is recorded: `044`'s grammar, `048`'s stacking model and
      pairs, `001`'s role vocabulary, the Project Manager 1:1 board/gantt parity, the table view,
      formulas/rollups/calculations (`spec.md` §3, goal D4/D5)
- [x] CHK-004 [P0] The `create.sh --phase` failure is recorded and its parent-doc injection
      reverted (`goal.md` §4 LOG); the structure copied from `050` per the packet brief
- [x] CHK-005 [P0] Overlap with `050` items 1/4/6/8 is dispositioned by reference, not re-implemented
      (`spec.md` §7)
- [ ] CHK-006 [P0] T001 complete: the captures opened, the grammar doc trued
- [ ] CHK-007 [P0] T002/T003 complete: every mechanism-only `Today` cell above carries a figure
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:implementation -->
## IMPLEMENTATION

- [ ] CHK-010 [P0] One leg, one file group — no file is opened by two legs, `styles.css` excepted
      and serialized by the parent's CSS lane (goal D6)
- [ ] CHK-011 [P0] Every migrated surface has both expressions — desktop popover and phone sheet —
      from the primitive's one definition (goal D7)
- [ ] CHK-012 [P0] Every phone surface the migration touches carries all seven `sheet-grammar`
      elements, and every surface that can open over another obeys `048`'s stacking model (goal D4)
- [ ] CHK-013 [P0] No second dismissal system: submenus register through `overlayStack`, not a new
      listener pair (plan ADR-001; the design-system's anti-pattern list)
- [ ] CHK-014 [P1] The create-affordance is `preserveValueOnSelect`, not a new option kind
      (plan ADR-002)
- [ ] CHK-015 [P0] Kept-ours surfaces unchanged: table view surface, formula/rollup/calculated
      menus, Project Manager board/gantt parity captures re-read if a leg moved a pixel (goal D5)
<!-- /ANCHOR:implementation -->

---

<!-- ANCHOR:verification -->
## VERIFICATION

- [ ] CHK-020 [P0] `npx tsc --noEmit` exit 0, read from `$?`
- [ ] CHK-021 [P0] `npm run build` exit 0, read from `$?`
- [ ] CHK-022 [P0] `npx vitest run` exit 0, read from `$?`
- [ ] CHK-023 [P0] `SURFACE_PHASE=052-dropdown-menu-and-picker-componentization npm run gate` exit 0,
      read from `$?`; `npm run replay` holds with reversed 0
- [ ] CHK-024 [P0] `npm run screenshots:verify` exit 0; every changed PNG opened and read
- [ ] CHK-025 [P0] `validate.sh specs/005-component-surface-system/052-dropdown-menu-and-picker-componentization --strict`
      exit 0, first `RESULT:` line PASSED, Errors: 0
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:completion -->
## COMPLETION

- [ ] CHK-030 [P0] Every C-row carries its evidence and its final figure
- [ ] CHK-031 [P0] `acceptance-criteria.md` every row `Met`, `Waived` or `Superseded`, each waiver
      naming an ADR
- [ ] CHK-032 [P0] The operator rows remain unticked until the operator closes them (goal D8)
<!-- /ANCHOR:completion -->
