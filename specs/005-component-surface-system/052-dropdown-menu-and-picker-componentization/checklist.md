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
| C1 | A `submenu: true` row opens a real nested menu through the factory, on pointer, keyboard and phone | **No path opens one** — `owned-menu.ts:170-178` closes the menu on any non-submenu row; `OwnedMenuHandle` has no child-menu method; the only real submenus are hand-built (`column-menu.ts:568-633`) | all three paths open the primitive submenu; the hand-built lifecycle is gone | [ ] |
| C2 | Hand-built `db-menu-item` row sites outside `menu-row.ts` | **70** — `toolbar-renderer.ts` 44, `column-menu.ts` 19, `dropdown-field.ts` 4, `cell-renderer.ts` 3 (`grep -rn "db-menu-item" src/views/*.ts \| grep "cls"`, counted 2026-09-05) | 0, or each remaining site individually dispositioned in `componentization-plan.md` | [ ] |
| C3 | An empty-eligible-row menu renders the never-empty fallback | **No fallback exists** — a menu whose rows are all gated renders zero rows (no code path for it in `owned-menu.ts`) | ≥1 row always, the G3 fallback | [ ] |
| C4 | Distinct active-picker registries in `src/views/` | **3** — `date-value-picker.ts:71`, `icon-picker-popover.ts:50`, `option-color-picker.ts:29` (each `activePickers = new WeakMap`) | 1, the host's | [ ] |
| C5 | Distinct geometric grid navigators | **2** — `getIconNavigationTarget` (`icon-picker-popover.ts:281`) and `getColorNavigationTarget` (`option-color-picker.ts:130`), near-duplicates | 1, the host's, both pickers consuming it | [ ] |
| C6 | Search implementations across the family | **4** — `dropdown-field.ts:407` `filterDropdownOptions`, `cell-renderer.ts:968` relation filter, `icon-picker-popover.ts:156` search, `toolbar-renderer.ts:1180` hub search | 1 shared (the host's) + documented exceptions only where a plan row says so | [ ] |
| C7 | Bespoke `preferredWidth` literals in the family | **8 distinct values** across **14** production call sites: 124, 252, 280, 292, 318, 360, 420, 520. *Corrected 2026-09-05 by T001 (`design-trueup.md` C9): the cell previously read "9 distinct values … 240". There is no 240 in the family — `chart-toolbar-renderer.ts:927` passes **280**, and the tree's only 240 is `popover-position.stories.ts:40`, a story* | every value mapped to a named role or written reason in `componentization-plan.md` §3 | [ ] |
| C8 | Phone sheet-header construction sites for pickers/menus | **6+** hand-rolled variations — `owned-menu.ts:216-224` (with the insert-after-handle dance), `dropdown-field.ts:199`, `date-value-picker.ts:393-397`, `icon-picker-popover.ts:135-141`, `option-color-picker.ts:85-91`, `cell-renderer.ts:950-952` | 1 host construction consumed by all | [ ] |
| C9 | `044`'s registered sheet-grammar rows and `048`'s 31 stacked pairs after the migration | green today (pre-migration baseline: 8 first-sheet rows + 31 pairs, `sheet-grammar.mjs:54-118`) | still green, with pair selectors updated in the same leg that changes their markup | [ ] |
| C10 | `npm run gate` with one permanent lane row per migrated family | **not run for this phase — the family's lane rows do not exist** | exit 0; each new row's negative control observed red then green | [ ] |

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
