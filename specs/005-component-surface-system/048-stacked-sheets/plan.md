---
title: "Implementation Plan: Stacked Sheets"
description: "Read the openers first and write the inventory, then build one depth model in the sheet module and the overlay stack, then migrate each stacked child onto it by rank, then pin every pair with a lane row observed red first."
trigger_phrases:
  - "implementation plan"
  - "stacking model plan"
  - "048 plan"
  - "sheet depth model"
importance_tier: "normal"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Stacked Sheets

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API, one hand-written `styles.css` |
| **Framework** | None. Direct DOM through Obsidian's `createDiv`/`createEl` helpers |
| **Storage** | None. Sheet depth is runtime state in `OverlayStack` |
| **Testing** | Vitest for units; Playwright-driven lanes under `tools/live/` for the production render path |

### Overview

Give `OverlayStack` a depth it already has the shape for — `parentId` is declared at
`overlay-stack.ts:47` and read nowhere — and let `mobile-bottom-sheet.ts` treat the surface beneath
the top when a sheet is pushed or popped. Every stacked child in the inventory then inherits the
same behaviour from the mount, rather than each opener learning it. That ordering is `044` D2
applied one level up: an element a consumer can forget is an element some consumer will forget, and
there are more than forty consumers.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] The inventory exists with a `file:line` opener per row (T001)
- [ ] The three runtime-unsettled items in `stacked-surface-inventory.md` §5 are measured (T003)
- [ ] D1 is answered by the operator, for the modal rows only

### Definition of Done
- [ ] Every P0 acceptance criterion in `acceptance-criteria.md` is `Met`, with a failing number recorded before the fix
- [ ] `npm run gate` exits 0, read from `$?` without a pipe
- [ ] `sheet-grammar` carries one row per registered stacked pair, negative control observed red then green
- [ ] `spec.md`, `plan.md`, `tasks.md` and the inventory agree
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

One owner per question, which is this program's standing shape. Depth is asked of the stack;
presentation is applied by the sheet module; placement stays with the positioner.

### Key Components

- **`OverlayStack` (`overlay-stack.ts`)**: already LIFO, already per-document, already the single
  arbiter of Escape and outside-pointerdown. It gains two readers: the depth of a surface, and the
  surface immediately beneath the top. `parentId` stops being decorative.
- **`mobile-bottom-sheet.ts`**: `setSheetMount` gains the push/pop half it does not have. On push it
  applies the parent treatment to the surface beneath; on pop it removes it. `setScrim` moves the
  one scrim node between the top two rather than leaving it behind both.
- **`popover-position.ts`**: `placeSheet` publishes the keyboard inset only when the sheet it is
  placing is the top surface; a sheet beneath publishes zero.
- **`styles.css`**: the parent treatment (opacity and `scale`, both compositor properties), the
  scroll fade at a child's cut, and per-depth ordering if DOM order proves insufficient.
- **Child openers**: `dropdown-field.ts`, `owned-menu.ts`, `db-modal.ts` and the three pickers each
  gain `createSheetHeader` — the same call the five conforming surfaces already make.

### Data Flow

A child opens → its opener calls `applySheetChrome` (directly, or through `positionToolbarPopover`)
→ `setSheetMount` asks the stack what is beneath → the parent gets the treatment → the scrim moves
between them → the child mounts on the body. Dismissal runs the same sequence backwards through the
path `overlay-stack.ts` already owns, so a `.remove()` with no ceremony is still correct: the
`MutationObserver` at `mobile-bottom-sheet.ts:464` is the existing precedent for that guarantee.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `mobile-bottom-sheet.ts` `setSheetMount` (`:274`) | Producer — portals a sheet, sets the scrim, claims the dock | Update: add the push/pop parent treatment | `sheet-grammar` stacked rows; unit test on mount order |
| `mobile-bottom-sheet.ts` `setScrim` (`:478`) | Producer — one scrim node per document | Update: position it between the top two | AC-003, scrim count and DOM position |
| `overlay-stack.ts` `OverlaySurfaceOptions.parentId` (`:47`) | Declared, never read | Update: becomes the depth source | `rg -n "parentId" src/views` goes from 0 reads to the mount's |
| `popover-position.ts` `placeSheet` (`:394`) | Producer — writes `--db-mobile-sheet-bottom` per sheet | Update: top surface only | AC-005 with a declared keyboard |
| `popover-position.ts` `keepSheetPlaced` (`:447`) | Consumer — the menu path's subscription | Unchanged, but its doc comment's recorded defect is what AC-005 closes | Comment updated to point at the fix |
| `dropdown-field.ts` `openDropdownPopover` (`:187`) | Consumer — the single largest child class | Update: `createSheetHeader` | AC-004 |
| `owned-menu.ts` `showAt` (`:164`) | Consumer | Update: `createSheetHeader` | AC-004 |
| `modals/db-modal.ts` `applyPresentation` (`:70`) | Consumer, 20 subclasses | Update **after D1** | AC-004, modal rows |
| `column-manager-renderer.ts` `renderHeader` (`:159`) | Consumer — hand-built header, no close | Update: `createSheetHeader` | AC-004 |
| `icon-picker-popover.ts:229`, `option-color-picker.ts:104`, `date-value-picker.ts:400` | Consumers | Update: `createSheetHeader` | AC-004 |
| `calendar-timeline-renderer.ts:959` | Producer — the one `new Menu()` left | Update: `createOwnedMenuForEvent` | `rg -n "new Menu\(" src` → 0 |
| `tools/live/sheet-grammar.mjs` (`:46`) | Check — 8 first-sheet rows | Update: add stacked pairs and a stacking control | `npm run gate` exit 0 |
| `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md` | Docs — the per-surface census | **Not a consumer.** Extended by reference from this packet, not edited | Cross-reference present in both directions from this side |
| `styles.css` | Producer — one sheet z-index, one scrim rule | Update: parent treatment, scroll fade | AC-002, AC-007 |

Required inventories:
- Same-class producers: `rg -n "applySheetChrome|placeSheet|positionToolbarPopover" src/views` — every
  path by which a surface becomes a sheet, so none takes an unstacked shortcut.
- Consumers of changed symbols: `rg -n "parentId|setSheetMount|setScrim|SHEET_KEYBOARD_INSET_VAR" src`.
- Matrix axes: depth (1, 2, 3) × opener kind (K1-K6) × keyboard (open, closed) × parent kind (sheet,
  fullscreen modal). The lane registers one row per axis combination that the inventory says exists.
- Algorithm invariant: **at most one surface holds the scrim, and it is always the top of the stack
  for that document.** Adversarial cases: a child removed with a bare `.remove()`; a parent rebuilt
  under an open child; two documents (a popped-out window) each with their own stack.
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
| Unit | `OverlayStack` depth, push/pop ordering, scrim arbitration with a bare `.remove()` | Vitest |
| Integration | The production render path on a 390×844 phone profile with a navbar, one row per stacked pair | `tools/live/sheet-grammar.mjs` |
| Manual | The operator's three captures, reproduced on iOS after a release | Device, 0.0.24+ |

**D1 of the parent binds here.** A check that does not drive the production path proves nothing, so
no stacked pair closes on a hand-written fixture; each mounts through the harness's constructed
seam, the same one the eight existing rows use.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `044`'s `sheet-grammar` lane | Internal | Green | No lane rows; every criterion becomes self-certified |
| `031`'s tap-inside-sheet fix | Internal | Landed and operator-confirmed on 0.0.23 | Nothing here is reachable on a device |
| D1, the modal presentation ruling | Operator | Open | Six inventory rows in §3.8 and P1 cannot be migrated. The dropdown, menu and picker rows are unaffected |
| `003`'s portal contract | Internal | Stable | A parent transform would contain a fixed child; the sibling-on-body invariant is what prevents it |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: any stacked pair regressing a first sheet — a `sheet-grammar` row that was green for
  one of the eight registered first-sheet surfaces going red.
- **Procedure**: the parent treatment is additive and reversible. Reverting the push/pop half of
  `setSheetMount` restores the current behaviour exactly, because nothing else reads depth.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 inventory ──► T003 runtime diff ──┐
                                       ├──► T004-T007 stacking model ──► T008-T012 migrations ──► T013-T014 lane ──► T015-T016 release
T002 layer identification ─────────────┘
D1 (operator) ─────────────────────────────────────────────────────────► T011 modal rows only
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Inventory (T001-T003) | None | Everything |
| Stacking model (T004-T007) | Inventory | Migrations |
| Migrations (T008-T012) | Model | Lane |
| Modal migration (T011) | Model **and** D1 | Lane's modal rows only |
| Lane (T013-T014) | Migrations | Release |
| Release + operator (T015-T016) | Lane | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Inventory and runtime diff | Med | 2-3 hours |
| Stacking model | High | 4-6 hours |
| Per-child migrations | Med | 4-6 hours |
| Lane rows and controls | Med | 2-3 hours |
| **Total** | | **12-18 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] `npm run gate` exit status read from `$?`, not through a pipe
- [ ] `npm run replay` holds with reversed 0
- [ ] Captures recaptured and read by a person across both themes

### Rollback Procedure
1. Revert the push/pop half of `setSheetMount` — the parent treatment is additive and nothing else reads depth
2. Revert the `styles.css` parent-treatment block
3. Re-run `sheet-grammar`; the eight first-sheet rows must return to green
4. Tell the operator, because a rollback here is visible on the device that reported it

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A — sheet depth is runtime state and nothing is persisted
<!-- /ANCHOR:enhanced-rollback -->

---
