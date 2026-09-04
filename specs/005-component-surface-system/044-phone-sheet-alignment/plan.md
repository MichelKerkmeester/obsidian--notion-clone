---
title: "Implementation Plan: Phone Sheet Alignment"
description: "Define the seven grammar elements once in the sheet module, route the one surface that bypasses it back through it, re-dress the two that have the chrome but not the rows, then generate the remaining instance tasks from the inventory and hold them all with a conformance check."
trigger_phrases:
  - "phone sheet alignment plan"
  - "sheet grammar conformance plan"
  - "044 plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Phone Sheet Alignment

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API, esbuild |
| **Framework** | None — direct DOM through Obsidian's `createDiv`/`Setting` helpers |
| **Storage** | None new. Presentation only; no persisted field is added |
| **Testing** | Vitest for units, `tools/live/*.mjs` headless-Chrome checks for the harness, `npm run gate` as the authoritative lane sum |

### Overview

The grammar already exists in code but only as a set of calls a surface may or may not make.
`applySheetChrome` supplies mount, scrim and drag; header, padded rows, segmented choices, keyboard
avoidance and safe-area inset are supplied per instance or not at all. This plan pulls the missing
elements into the sheet module so a conforming surface gets them by construction, routes the one
surface that bypasses the module entirely back through it, re-dresses the two that have the chrome
but not the rows, and then holds the whole set with a check that fails on a removed element rather
than on an operator's screenshot.

The order is deliberate: the two operator legs already running (`worktrees/039-column-width-sheet`,
`worktrees/040-settings-sheet`) are the acceptance tests for the shared work, so the shared module
lands first and those legs consume it rather than each inventing a local fix.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Problem statement clear and scope documented — three operator reports quoted verbatim in `spec.md` §2
- [ ] Success criteria measurable — SC-001 is an exit code with a negative control; SC-002 is an operator row
- [ ] Dependencies identified — `003`, `016`, `013`, `031`, `022`, and the concurrent inventory

### Definition of Done
- [ ] All acceptance criteria met — `acceptance-criteria.md` AC-001 through AC-006
- [ ] Tests passing — `npm run gate` exits 0 including the new `sheet-grammar` lane
- [ ] Docs updated (spec/plan/tasks) and the parent map plus `../roadmap.md` §4 rows 40, 41, 43 carry this phase as owner
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

One owning module plus conforming consumers — the same shape `003` used for the portal and `004`
used for the checkbox primitive. The grammar is not a stylesheet convention: an element a consumer
can forget is an element some consumer will forget, which is what produced all three reports.

### Key Components
- **`src/views/mobile-bottom-sheet.ts`**: owns the seven elements. Gains a header/close builder, a
  `visualViewport`-driven keyboard inset publisher, and the row/segmented-control class contract.
  Keeps `applySheetChrome`, `attachSheetDragToDismiss`, `playSheetEntrance` and the flick constants
  unchanged so `016`'s measured results stay valid.
- **`src/views/modals/db-modal.ts`**: the `sheet` presentation gains the header/close, so all 20
  subclasses — including `SettingsTab`'s host — inherit it at one call site.
- **`src/views/database-view.ts`**: `showMobileColumnWidthPanel` stops building two bespoke body
  divs and becomes a sheet body.
- **`src/settings.ts`**: the settings body's rows; the drag reaching its host.
- **`src/views/toolbar-renderer.ts`**: the Add view sheet's rows and view-type picker.
- **`tools/live/sheet-grammar.mjs`**: mounts each registered surface in the constructed harness
  `043` built and reports one row per instance per element.

### Data Flow

A surface asks for sheet presentation → `applySheetChrome` portals it to `document.body`, applies
the scrim and claims the bottom dock → the header/close and row classes are applied from the same
call → a `visualViewport` listener publishes `--db-keyboard-inset` (the variable `022` already
introduced, reused rather than duplicated) → the surface's own body renders into the padded row
container. Nothing about placement, anchor lifetime or the drag changes; those still resolve through
`003` and `016`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `mobile-bottom-sheet.ts` (`applySheetChrome`) | Producer of mount, scrim, dock claim and drag | Update — gains header/close, keyboard inset, row contract | `rg -n 'applySheetChrome' src` returns the six current consumers plus the newly routed ones |
| `database-view.ts:11404` `showMobileColumnWidthPanel` | Non-consumer today: builds `db-mobile-column-width-*` on `document.body` directly | Update — becomes a consumer | `rg -n 'db-mobile-column-width-panel' src` must show no direct `body.createDiv` after the change |
| `settings.ts` `SettingsTab` + `TrashManagerModal` | Consumer via `DbModal("sheet")`; body is host-owned `Setting` grid | Update — body rows, drag reaching the host | `settings.test.ts` plus a story read at 390x844 |
| `modals/db-modal.ts` (20 subclasses) | Producer of the `sheet`/`fullscreen`/`dialog` presentation | Update at the base only | `rg -n 'extends DbModal' src` — 20 hits, none edited individually |
| `owned-menu.ts`, `popover-position.ts`, `toolbar-renderer.ts`, `record-detail-panel.ts` | Consumers, conforming today | Unchanged except where the inventory ranks them non-conforming | `sheet-grammar.mjs` row per instance |
| `icon-picker-popover.ts`, `option-color-picker.ts`, `column-menu.ts` sub-popover | Non-consumers: `doc.body.createDiv` popovers | Update — sheet path on phone | `rg -n 'body.createDiv' src` shrinks by three surface-class hits |
| `styles.css` | Policy: the serialized lane | Update under a held lane | Recapture and a human PNG read on lane release (`../spec.md` §4) |
| `tools/live/touch-targets.mjs` ratchets | Consumer of the rendered DOM | Re-baseline expected | Baseline diff attributed per class, as `043` T029/T030 did |

Required inventories:
- Same-class producers: `rg -n 'applySheetChrome|attachSheetDragToDismiss|body\.createDiv' src`
- Consumers of changed symbols: `rg -n 'applySheetChrome|SheetChromeOptions|db-mobile-bottom-sheet' . --glob '*.ts' --glob '*.mjs' --glob '*.css'`
- Matrix axes: {instance} × {seven grammar elements} × {light, dark} × {390x844, 768x1024}. The
  conformance check owns the first two axes; captures own the last two.
- Algorithm invariant: a surface presenting as a sheet on the phone has exactly one owner for each
  of the seven elements, and that owner is the sheet module. Adversarial case: a surface that adds
  its own grab bar and its own close button, producing two of each.
<!-- /ANCHOR:affected-surfaces -->


---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `applySheetChrome` header/close/inset behaviour, the width sheet's clamp and focus guard, the settings row builder | Vitest |
| Integration | Every registered surface mounted in the constructed harness, one row per grammar element, plus the keyboard-inset emulation | `tools/live/sheet-grammar.mjs`, `render-assertion-bundle.mjs` |
| Manual | The operator opening the three reported sheets on iOS | Device |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `003-mobile-sheet-presentation` portal/predicate | Internal | Green — shipped | None; consumed unchanged |
| `016-sheet-drag-and-audit` drag + grab band | Internal | Green — shipped and verified, 9 of 10 | None; consumed unchanged |
| `022-selection-bar-keyboard-docking` `--db-keyboard-inset` | Internal | Green — shipped | Yellow if the variable's publisher is view-scoped; then the sheet publishes its own and `022` is told |
| `sheet-and-dropdown-inventory.md` | Internal | Yellow — being written concurrently | T002 (instance task generation) blocks; T003-T006 do not |
| `006-list-view-deprecation/002` | Internal | Red — not started | REQ-006's assertion stays pending; the picker's shape does not |
| `styles.css` serialized lane | Internal | Yellow — contended | Legs queue; recapture on each release |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the shared header/close or keyboard inset regresses a sheet that works today — most
  likely the record detail panel or an owned menu, both of which are operator-verified surfaces.
- **Procedure**: revert the `mobile-bottom-sheet.ts` commit. Every consumer change is additive at
  its call site, so reverting the module leaves consumers calling the previous signature; the width
  sheet's re-route is the only change that must revert with it.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 read contracts ──┐
                      ├──► T003 shared chrome ──► T004 width sheet ──► T008 conformance check
T002 read inventory ──┘                      ├──► T005 settings sheet
                                             ├──► T006 add-view sheet
                                             └──► T007 ranked instances
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup (T001-T002) | None | Everything |
| Shared chrome (T003) | Setup | All four consumer legs |
| Consumer legs (T004-T007) | T003 | Verification |
| Verify (T008-T010) | T004-T007 | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 1-2 hours |
| Core Implementation | High | 8-14 hours across four legs, two already running |
| Verification | Med | 3-4 hours including the negative control and the ratchet re-baseline |
| **Total** | | **12-20 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Backup created — N/A, no data changes; the git revert is the backup
- [ ] Feature flag configured — N/A, the grammar is not optional; a flagged sheet grammar would
      reproduce the defect this phase exists to remove
- [ ] Monitoring alerts set — `sheet-grammar` added to `tools/gate.mjs` so a regression shows in the
      lane sum rather than in a report

### Rollback Procedure
1. Revert `mobile-bottom-sheet.ts` and the width-sheet re-route together.
2. Re-run `npm run gate`; expect the `sheet-grammar` lane to fail closed rather than silently pass.
3. Recapture and read the changed PNGs before releasing the lane (`../spec.md` §4).
4. Record the revert on `../roadmap.md` §4 rows 40, 41 and 43 — the operator is the stakeholder.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A.
<!-- /ANCHOR:enhanced-rollback -->

---
