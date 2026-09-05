---
title: "Implementation Plan: Dropdown, Menu and Picker Componentization"
description: "Four legs ordered primitive-first — the menu primitive and picker host land before their consumers — each closed on a threshold observed red first, with the existing sheet-grammar and stacking lanes as the regression fence."
trigger_phrases:
  - "052 plan"
  - "menu componentization plan"
  - "picker host plan"
  - "migration legs"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Dropdown, Menu and Picker Componentization

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

The family already has its three shared pieces; this phase finishes the composition. `owned-menu.ts`
mounts `db-surface db-menu db-owned-menu` on `doc.body`, carries keyboard roving, focus return and a
phone-sheet branch (`showAt` at `:186-262`); `menu-row.ts` builds the row grammar; `dropdown-field.ts`
is the searchable listbox with sections, icons and phone header. Around them sit **70** hand-built row
sites (re-counted at T001), three hand-built submenus, four pickers with private hosts and **eight**
bespoke widths across fourteen call sites. No new
architecture layer: the picker host (`popover-host.ts`) extracts what `dropdown-field.ts` and the
three pickers already each do privately.

### Overview

Four legs, ordered so primitives land before consumers:

1. **Leg 1 — primitives.** `owned-menu.ts` gains the submenu handle and the never-empty fallback;
   `menu-row.ts` makes the chevron true; `popover-host.ts` is extracted (active-picker registry,
   phone header, search, geometric grid nav, width roles) with `dropdown-field.ts` as its first
   consumer.
2. **Leg 2 — menu consumers.** `toolbar-renderer.ts`'s hand-built panels and rows (M7, M14, 44
   sites) and `column-menu.ts`'s submenus and rows (M2-M5, 19 sites) onto the primitive.
3. **Leg 3 — picker consumers.** `cell-renderer.ts`'s option and relation editors (P2, P3), then
   `date-value-picker.ts`, `option-color-picker.ts`, `icon-picker-popover.ts` onto the host.
4. **Leg 4 — lanes, widths, docs.** Width-role mapping completed (REQ-007), lane rows per family
   green, `componentization-plan.md` dispositions trued against what landed.

`styles.css` is reached by every leg; the parent's serialized CSS lane owns it.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Command | Passes when |
|------|---------|-------------|
| Types | `npx tsc --noEmit` | exit 0, read from `$?` |
| Build | `npm run build` | exit 0, read from `$?` |
| Tests | `npx vitest run` | exit 0, read from `$?` |
| Gate | `SURFACE_PHASE=052-dropdown-menu-and-picker-componentization npm run gate` | exit 0, 25+ lanes green, read from `$?` |
| Screenshots | `npm run screenshots:verify` | exit 0; changed PNGs opened and read |
| Grammar | `node tools/live/sheet-grammar.mjs` via the gate | registered pairs green; negative control seen red first |
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### The primitive composition

```
popover-host.ts (new)              owned-menu.ts + menu-row.ts
  ├─ activePickers registry          ├─ addRow / addSection / addSeparator
  ├─ phone sheet header dance        ├─ submenu handle (new, REQ-001)
  ├─ shared search + empty state     ├─ never-empty fallback (new, G3)
  ├─ geometric grid navigator        └─ phone sheet + desktop popover from one definition
  └─ width roles
        │
   ┌────┴─────────┬──────────────┬───────────────┬──────────────┐
dropdown-field  date-picker   color-picker   icon-picker   relation editor
(select picker)   (P4)          (P5)           (P6)           (P3)
```

### Decisions taken in this plan

**ADR-001: the submenu is a child surface in the overlay stack, not an inline region.**
**[confirmed 2026-09-05 · T001]** Anytype's submenus are separate surfaces, hover-opened — and this
is no longer a source read: the sweep could open each of its 37 submenus only by dispatching a hover
on the parent row, and `screenshots/anytype/README.md` records that one Escape closes the child and
leaves the parent open, which is this ADR's innermost-only clause **observed**. Ours become child surfaces registered with
`parentId` set to the parent menu's surface id — `overlay-stack.ts:47`'s field, load-bearing since
`048` — so Escape closes the innermost only, the LIFO rule holds, and the phone path presents the
submenu through the stacking model `048` already registers (`record column submenu` pair,
`sheet-grammar.mjs:110`). The alternative — rendering the submenu inline inside the parent menu —
would break `044`'s header-per-sheet grammar on phone and reinvent the column menu's current
hand-built lifecycle, which this phase exists to delete.

**ADR-002: the create-affordance slot is `preserveValueOnSelect`, not a new option kind.**
**[amended by ADR-004, 2026-09-05 · T001 — mechanism stands, placement changes.]** The captured
create row sits **first, under the search field and above the list**
(`menus/anytype-menu-object-more-add-link-to-object-dark.png`), not last in its section; last is
where Anytype puts an *escalation*. `dropdown-field.ts:42-43` already carries the action-row mechanic and four call sites use it for
create actions (`database-view.ts:5323-5325`, `calendar-toolbar-renderer.ts:325`,
`calendar-timeline-toolbar-renderer.ts:199`, `view-config-panel-renderer.ts:670,1117,1830,1947,1976`).
Adopting Anytype's pattern (G11) is a convention plus placement (the row sits last in its section,
under the search field's reach), not a second mechanism. A new option kind would fork the option
model the picker host just unified.

**ADR-003: the geometric grid navigator is one function keyed by layout, not two.**
**[citations corrected 2026-09-05 · T001]** `getIconNavigationTarget` (`icon-picker-popover.ts:284`)
and `getColorNavigationTarget` (`option-color-picker.ts:138`) are near-identical nearest-neighbour
implementations; the count of two is unchanged and correct. Anytype's own colour picker turns out to
be a **224px labelled list rather than a grid**
(`menus/anytype-menu-object-block-menu-color-dark.png`), which removes an outside precedent for our
grid and changes nothing about the duplication this ADR ends. The host owns one; the icon picker's row-aware variant is the
same function with the row-partition branch enabled. Two functions would re-drift on the first
grid change.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## 3b. PHASES

| Phase | Scope | Legs | Exit criterion | Status |
|-------|-------|------|----------------|--------|
| Phase 1 — Evidence and primitives | T001-T006: the capture read, the red baselines, the submenu handle, the fallback row, the picker-host extraction | tasks.md Phase 1 + 2 | The submenu lane row observed red then green; the host's search oracle-tested; `sheet-grammar` pairs unchanged | **T001 done** (`design-trueup.md`; AC-009 and AC-005 Met); T002-T006 unmet |
| Phase 2 — Consumers | T007-T012: toolbar menus and panels, column-menu submenus, the cell editors, the three pickers onto the host | tasks.md Phase 3 | C2's row-vocabulary count at its target; every registered pair green; changed captures re-read | Unmet |
| Phase 3 — Widths, lanes, closure | T013-T015: width roles, family lane rows red-then-green, docs trued | tasks.md Phase 4 | AC-002 through AC-009 `Met` or waived; `npm run gate` exit 0 read from `$?` | Unmet |

## 4. AFFECTED SURFACES

| Surface | Leg | Registered lane rows touched |
|---------|-----|------------------------------|
| Column type/display submenus | 2 | `record column submenu` pair (depth 3) — selector updates only |
| View-tab menu, toolbar panels | 2 | `all views overflow menu`, `add view property picker` pairs |
| Cell option/relation editors | 3 | `record relation editor`, `record option colour picker` pairs |
| Date/colour/icon pickers | 3 | `filter date value picker`, `settings icon picker` pairs |
| Dropdown listbox (P1) | 1 | Every `kind: "dropdown"` pair (11 of 31) — class-name stable by design |
| Board/gantt menus | 2 | None registered; `037` reference recapture if a pixel moves |
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:testing -->
## 5. TESTING

- **Unit**: the submenu handle's open/close/close-with-parent; the shared search's filter + empty
  state + create slot; the unified grid navigator (row-aware and flat modes) against the two legacy
  implementations' recorded outputs.
- **Lane**: one row per migrated family (menus, select picker, option editor, relation editor,
  date, colour, icon), each negative control observed red before its leg's green.
- **Submenu paths**: four now, not three — pointer, `ArrowRight`/`Enter`, **hover behind
  `@media (hover: hover)`** (ADR-004), and the phone tap. The hover path needs its own assertion,
  because it is the one a coarse-pointer profile must **not** fire.
- **Manual/capture**: `npm run screenshots:verify` + changed PNGs opened; phone 390×844 profile for
  every picker's sheet expression; gantt/board reference read if leg 2 touches their menus.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| On | Why | Status |
|----|-----|--------|
| `044`'s sheet grammar | Header-everywhere, 44px close, 16px inset/title on every phone sheet in the family | Landed; consumed |
| `048`'s stacking model + D1 | Submenus and pickers at depth 2-3 | Landed (`048` code complete, AC-009 operator-owned) |
| `001`'s role vocabulary + design-system sizing | Width roles and mount adapters | Shipped; consumed |
| `050` items 1/4/6/8 | Overlapping surfaces (spec §7) | Draft; coordination via one-leg-one-file. **[T001]** All four confirmed against the menus sweep at `050`'s restated thresholds — `design-trueup.md` §6 |
| Anytype captures + `047` research | Grammar evidence | **Read.** T001 opened the **150** clipped desktop menus in `screenshots/anytype/desktop/menus/` and the **59** iOS states in `screenshots/anytype/mobile/`, measured them, and wrote `design-trueup.md` as the read of record. Eleven contradictions recorded; AC-009 and AC-005 Met |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK

Each leg is a revert-sized unit: primitive legs are additive (new exports, no signature changes);
consumer legs are mechanical migrations whose pre-leg selectors live in `sheet-grammar.mjs` and
`tools/screenshots/scenarios/*.mjs`. A leg that fails its lane reverts without carrying partial
markup, because a half-migrated surface is exactly the "second vocabulary" defect this phase closes.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:effort -->
## 8. EFFORT

| Leg | Files | Est. LOC | Risk |
|-----|-------|----------|------|
| 1 primitives | `owned-menu.ts`, `menu-row.ts`, `popover-host.ts` (new), `dropdown-field.ts` | ~350 | Medium — the submenu handle is the one genuinely new mechanism |
| 2 menu consumers | `toolbar-renderer.ts`, `column-menu.ts` | ~500 | Medium-high — widest blast radius in the plugin |
| 3 picker consumers | `cell-renderer.ts`, `date-value-picker.ts`, `option-color-picker.ts`, `icon-picker-popover.ts` | ~400 | Medium — behaviour-preserving host moves |
| 4 widths/lanes/docs | `popover-host.ts`, lane files, docs | ~150 | Low |
| **Total** | 16 files | **~1400** | `recommend-level.sh --loc 1400 --files 15` → 51/100, Level 2 raised to 3 on judgment |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:user-stories -->
## 9. USER STORIES

### US-001: One menu, one grammar (Priority: P0)

**As a** person using any context menu in the plugin, **I want** every menu to read and behave the same — sections, checkmarks, a delete row last, a working submenu — **so that** moving between the column menu, the row menu and the view-tab menu does not relearn anything.

**Acceptance criteria:** see `acceptance-criteria.md` AC-001, AC-002.

### US-002: One picker family (Priority: P0)

**As a** person editing a cell or configuring a view, **I want** every picker — select, date, relation, colour, icon — to search the same way, empty the same way, and present as a sheet on the phone the same way, **so that** the picker I learned is the picker I am using.

**Acceptance criteria:** see `acceptance-criteria.md` AC-003, AC-006, AC-007.

### US-003: Nothing regressed underneath (Priority: P0)

**As a** person using the phone sheets this program already fixed, **I want** the migration to leave `044`'s grammar and `048`'s stacks exactly as they are, **so that** componentization does not re-open defects that closed.

**Acceptance criteria:** see `acceptance-criteria.md` AC-008, and `checklist.md` C9.
<!-- /ANCHOR:user-stories -->
