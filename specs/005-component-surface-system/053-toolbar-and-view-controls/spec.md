---
title: "Feature Specification: Toolbar and View Controls"
description: "The database toolbar and view controls rebuilt as composed shared primitives, taking the Anytype behaviours the captures show are better, with a per-surface migration table and the 050 items this phase implements."
trigger_phrases:
  - "toolbar spec"
  - "053 spec"
  - "view controls spec"
  - "toolbar primitives"
  - "chip row spec"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Toolbar and View Controls

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

The database toolbar is eight renderers that share nothing: `toolbar-renderer.ts` (2,626 lines)
builds eleven row vocabularies across seventeen popover roots and repeats one five-close run
seventeen times; `chart-`, `calendar-` and `calendar-timeline-toolbar-renderer.ts` each hand-build
the same popover shell with the same outside-click and Escape wiring; `filter-` and
`sort-panel-renderer.ts` build the same condition row twice; and the dead half of the settings
entry still exists as seven uncalled methods. This phase reduces all of it to five composed
primitives, takes six Anytype behaviours the captures show are better, and leaves the table, the
PM-parity board and gantt, and the bottom-sheet grammar exactly as the program has ruled them.

**Key Decisions**: capture-read gates the design work (D1); red-first thresholds per criterion
(D2); replaced vocabularies are deleted, not parked (D3); the family of surfaces that stays ours
is named, not implied (D4); `044`/`048` are constraints (D5); `050` items 1, 2, 4, 7, 10, 12 land
here with their thresholds (D7).

**Critical Dependencies**: `044`'s `sheet-grammar` lane (exists, green), `048`'s stacking model
(code-complete on main), `050`'s ranked items (this phase implements six of fourteen).

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-05 |
| **Branch** | `worktrees/082-phase-toolbar-view-controls` |
| **Parent Spec** | ../spec.md |
| **Phase** | 53 of 53 |
| **Predecessor** | 050-anytype-adoption (consumes items 1, 2, 4, 7, 10, 12; sibling, not supersedes) |
| **Successor** | None |
| **Handoff Criteria** | The five primitives exist and the replaced vocabularies are deleted; every migration row in `toolbar-surface-inventory.md` §3 shows its target state; every criterion's threshold was observed red first; `npm run gate` exits 0 with one permanent row per criterion |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 53** of the component surface program. `044` gave the phone sheet its grammar,
`048` gave a stacked child its stacking model, and `050` ranked fourteen Anytype adoption items
against `src/views/*`. The operator then asked for the general case: *"research recommendations
and how to tackle / update / improve every modal, sheet and general ui ux to take the best from
AnyType and componentize stuff as much as possible."* The toolbar family is where that
instruction is most behind the code: it is the most-rendered chrome in the plugin and the
least-shared.

**Scope Boundary**: the toolbar row, its popovers, the active-rule chip rail, the filter/sort
panels' condition rows, the per-view-type option popovers, the view-settings entry, and the
embedded view's toolbar collapse. The table view's body, the board's card body, the gantt, the
calendar grid and the record sheet are other phases'.

**Dependencies**:
- `050-anytype-adoption` — the ranked items, their thresholds, and the non-adoptions this phase
  also honours (goal D6 there). This phase implements items 1, 2, 4, 7, 10, 12 and does not touch
  the other eight.
- `044-phone-sheet-alignment` — the seven-element phone sheet grammar; the `sheet-grammar` lane
  this phase adds rows to rather than replaces.
- `048-stacked-sheets` — the stacking model. Every toolbar surface that can open over a sheet
  obeys it.
- `003-mobile-sheet-presentation` — the portal contract and `sheet-and-dropdown-inventory.md`,
  which `toolbar-surface-inventory.md` extends along the toolbar axis by reference.
- `001-overlay-placement-and-menu-language` — the surface role vocabulary and the
  `condition panel` width role this phase's panels keep using.

**Deliverables**:
- Five shared primitives (§5) replacing the per-surface vocabularies.
- `toolbar-surface-inventory.md` — every toolbar surface, its primitive, its changes, its Anytype
  pattern with capture filename, and what stays ours.
- Six implemented `050` items with their thresholds intact.
- One permanent gate lane row per criterion, red before green.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

A person using the toolbar cannot see which rules are active without opening panels (the triggers
have one behaviour each — `toolbar-renderer.ts:2211`, `:2229`), a new view is made but never
shaped (no settings land after create — `database-view.ts:3460-3462`), a drag under a sort is
silently undone (no confirm in either renderer), and a new row always starts blank. A developer
touching the toolbar must relearn each surface: the same popover shell exists four times in four
files (`toolbar-renderer.ts:1240-1250`, `chart-toolbar-renderer.ts:345-392`,
`calendar-toolbar-renderer.ts:84-131`, `calendar-timeline-toolbar-renderer.ts:69-116`), the same
condition row twice (`filter-panel-renderer.ts:445-532`, `sort-panel-renderer.ts:223-289`), the
same close-others run seventeen times in one file, and seven settings-entry methods render
nothing because nothing calls them. `design-system.md` §6 counted the row vocabularies; this
inventory extends the count to the shells.

### Purpose

One toolbar that reads as a composition of five primitives, behaves the way Anytype's toolbar
behaves where the captures show that is better, and keeps the surfaces the program ruled stay
ours — with the failing numbers that prove each change was needed, recorded before each change.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The five toolbar primitives (§5) and the migration of every surface in
  `toolbar-surface-inventory.md` §3 onto them.
- `050` items 1, 2, 4, 7, 10, 12, with `050`'s thresholds kept and its corrected Today values
  (parent `goal.md` §2).
- The seven dead settings-entry methods' deletion, keeping their CSS anchor classes for the
  fallback queries that still read them.
- `toolbar-surface-inventory.md` and one gate lane row per criterion.
- The phone expression of every changed surface, or a recorded reason it has none.

### Out of Scope
- The Project Manager 1:1 board and gantt fidelity (`037`/`038` hold it; this phase may not move a
  reference pixel — parent goal D5, `050` goal D5).
- The bottom sheets' ownership: `044`'s seven-element grammar, `048`'s stacking model, `003`'s
  portal. Consumed unchanged.
- Formulas, rollups and calculations — no Anytype equivalent exists
  (`screenshots/anytype/README.md`, relation-type mapping), and the program has not asked for one.
- The table view's body, column widths, and the record sheet.
- `050` items 3, 5, 6, 8, 9, 11, 13, 14 (board scrollbar, scroll restore, cell-editor flip,
  capability-gated menus, empty states, positionLock, per-format phone filter rows, Load more) —
  `050`'s, not re-scoped here.
- Anytype's data model, sidebar and template system — `050`'s non-adoptions stand.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/toolbar-renderer.ts` | Modify | Tab strip, control cluster, chip-row host, settings entry; delete the seven dead methods and the repeated close runs |
| `src/views/toolbar-primitives.ts` | Create | The five shared primitives: `createPopoverShell`, `createConditionRow`, `createControlClusterButton`, `createSettingsEntry`, `createTabStrip` |
| `src/views/active-view-controls-renderer.ts` | Modify | Direction-coloured leading sort chip; in-toolbar placement; the trigger's declared state (**not** dual-mode — see §5 B1) |
| `src/views/filter-panel-renderer.ts` | Modify | Migrate condition rows onto the shared primitive |
| `src/views/sort-panel-renderer.ts` | Modify | Migrate condition rows onto the shared primitive |
| `src/views/chart-toolbar-renderer.ts` | Modify | Migrate the popover shell and child-popover stack onto the shell primitive |
| `src/views/calendar-toolbar-renderer.ts` | Modify | Same migration |
| `src/views/calendar-timeline-toolbar-renderer.ts` | Modify | Same migration |
| `src/views/embedded-database-renderer.ts` | Modify | Measured collapse for the embed's toolbar (`050` item 12) |
| `src/views/database-view.ts` | Modify | Settings-landing continuation after create/duplicate (item 2); sort-conflict confirm host for the table (item 7) |
| `src/views/board-renderer.ts` | Modify | Sort-conflict confirm on card drag (item 7) |
| `src/views/view-config-panel-renderer.ts` | Modify | Per-view new-row presets section (item 10) |
| `src/data/types.ts` | Modify | `ViewConfig.newRowPresets` map (item 10) |
| `styles.css` | Modify | Primitive styles, chip states, collapse rules — serialized by the parent's CSS lane |
| `specs/.../053-toolbar-and-view-controls/toolbar-surface-inventory.md` | Create | Done — the migration table and capture index |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:primitives -->
## 5. THE FIVE PRIMITIVES

The toolbar becomes a composition. Each primitive is one module export in
`src/views/toolbar-primitives.ts`, consumed by the renderers it replaces vocabulary in. A surface
that migrates deletes its own copy (goal D3).

| Primitive | Replaces | Consumers after migration | Contract highlights |
|-----------|----------|---------------------------|---------------------|
| `createPopoverShell(anchor, { title, role, width })` | Four hand-built popover shells + the seventeen repeated close runs + the bespoke outside-click/Escape wiring in three option renderers | view-tab menu, all-views hub, group-by, export, add-view, database switcher, title actions, utilities; chart/calendar/timeline options panels | One owner of open/close/anchor-state/`installPopoverAutoClose`; closes siblings through the stack, not a per-caller close run; declares its role (`menu`, `panel`, `condition panel`) and sizes from it per `design-system.md` §5 |
| `createConditionRow(parent, { field, operator, value, onChange })` | The duplicated property/operator/value row in `filter-panel-renderer.ts:445-532` and `sort-panel-renderer.ts:223-289` | Filter panel, Sort panel, active-rule popover, per-format phone rows later (`050` item 13, not this phase) | Property dropdown with type icons, operator dropdown per `getFilterOperatorsForColumn`, format-aware value control — one implementation, both panels, `condition panel` row floors per `design-system.md` §5 |
| `createControlClusterButton(parent, { icon, label, state })` | `createIconButton` + `setBadge`/`setHiddenBadge` + the per-button aria/tooltip/expanded choreography (`toolbar-renderer.ts:2203-2270`, `:2566-2580`) | Filter, sort, group-by, properties, utilities, settings triggers | One button carrying icon, badge count, tooltip, `aria-expanded`, and a declared **state** — `add` or `active` — which is what makes the trigger's state legible to a lane at all. **The state is a declared property, not Anytype's dual-mode behaviour** — `design-trueup.md` REQ-001 rejects that on both evidence (one icon state across 120 captures) and contrast (colour-only signalling fails WCAG 1.4.11) |
| `createSettingsEntry(anchor, actions)` | Seven dead methods (`:512`, `:519`, `:551`, `:1594`, `:2239`, `:2252`, `:2290`) + the utilities row's settings shortcut (`:465-470`) + the chart/calendar/timeline option-button forks | The single settings trigger, whichever view type is current | One entry point resolving to the view-config panel for table/board/gallery and to the view-type options panel for chart/calendar/timeline; keeps the `db-view-config-btn` / `db-*-options-toolbar-btn` classes the anchor-fallback queries read (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`) |
| `createTabStrip(parent, { tabs, activeId, onActivate, onContext })` | `renderViewTabs`' inline construction, drag wiring, overflow collapse and hub fallback (`toolbar-renderer.ts:840-931`, `:978-1021`, `:1022-1085`) + the embed's single-tab copy | Standalone view, embedded view | Roving tabindex, drag reorder, measured overflow collapse, the add-view affordance and the context menu — one strip, both presentations |

**What deliberately stays hand-built:** the add-view form (a form, not a menu row), the database
switcher's two-column layout, the group popover's switch/limit rows — each is a single caller and
the primitive would be wider than the duplication it removed (the restraint ladder, applied).
<!-- /ANCHOR:primitives -->

---

<!-- ANCHOR:anytype -->
## 6. ANYTYPE BEHAVIOURS TO TAKE — AND WHAT STAYS OURS

Design rows name the capture each behaviour is read against (goal D1). This author could not
render images this session; the descriptions below come from `screenshots/anytype/README.md`'s
written index and `047`'s research, and T001 makes the implementer open the file before building.

| # | Behaviour | Our state today (cited) | Anytype pattern (capture) | Take? |
|---|-----------|--------------------------|---------------------------|-------|
| B1 | **Rewritten 2026-09-05.** The `N applied` count label in the view-settings panel's value column (`Sort   1 applied ›` beside a bare `Filter   ›`) — a count, as text, one level in | **0 settings rows carry it.** Both triggers open the panel unconditionally (`toolbar-renderer.ts:2211`, `:2229`); the count badge on the trigger already ships (`:2575-2579`) | `anytype-view-settings-panel-dark.png` via `design-trueup.md` REQ-001 | **Take the label.** **Reject the dual-mode icons** — the funnel measures `ink=52, blue=0` on a filtered *and* an unfiltered view, identical to the pixel, across all 120 catalogue captures; there is no second mode to adopt. **Reject colour-only active-state signalling** on contrast (WCAG 1.4.11); our count badge carries a text second signal and is strictly better |
| B2 | Leading direction-coloured sort chip, then filter chips, add control, clear-all, auto-hide when empty | Rail exists with sort-then-filter groups, logic toggle, clear-all, auto-hide (`active-view-controls-renderer.ts:99-189`) but no direction colour, and it sits below the toolbar, not in it | `anytype-set-kanban-view-dark.png` / `anytype-set-calendar-view-dark.png`; `047` §6: "a leading, direction-colored sort chip" | **Take** — extend the existing rail (parent `goal.md` §2 correction 1) |
| B3 | Land in view settings ~immediately after create/duplicate | Ends at `refresh({ viewport: "reset-top" })` (`database-view.ts:3460-3462`, `:3941-3943`) | `anytype-view-settings-panel-dark.png` — a newly added view's settings popover open; `047` §5: "land directly in view settings ~50ms after the switch" | **Take** (`050` item 2, 100ms budget) |
| B4 | Duplicate view + view-tab context menu | Both exist (`database-view.ts:3925-3956`, `toolbar-renderer.ts:1229-1284`) and are hand-rolled | `anytype-view-settings-panel-dark.png` — Duplicate/Remove view rows in the settings popover | **Keep ours**, migrated onto `createPopoverShell` (`050` item 4's componentization half) |
| B5 | Sort-conflict confirmation on manual drag reorder | No confirm in `board-renderer.ts` or `table-renderer.ts` | No capture — the moment was never reached; `047` §8 records the sorted-subscription repositioning this pairs with. **Gap named** | **Take**, designed from `047`'s finding (`050` item 7) |
| B6 | Per-view new-row presets applied at creation | `createEntry` accepts `defaults` (`toolbar-renderer.ts:157-159`) but no caller passes any; `ViewConfig` carries no preset map (`types.ts:415-432`) | No capture — Anytype's template picker was not captured; the adopted slice is deliberately template-lite. **Gap named** | **Take**, the `050` item 10 slice only (`050` goal D6) |
| B7 | Measured toolbar collapse for embedded views | Boolean hide-or-nothing from codeblock options (`embedded-database-renderer.ts:2410-2416`); only the tab strip measures (`toolbar-renderer.ts:895-917`) | `anytype-page-with-inline-collection-dark.png` — the inline collection's collapsed controls; `047` §5: the toolbar collapses "by measuring its own natural width against available space" | **Take** (`050` item 12) |
| B8 | Removing a view pre-selects the next so the tab row never loses a selection | `deleteView` already re-selects (`database-view.ts:3989-3992`); the strip keeps the active tab visible (`toolbar-renderer.ts:905-915`) | `anytype-set-kanban-view-dark.png` — tab renamed to match layout; `047` §5 | **Keep ours** — behaviour already matches |
| B9 | The split New button (primary action + template dropdown) | Already ours: `db-new-button-group` with primary + chevron (`toolbar-renderer.ts:2346-2407`), FAB on touch | Not in Anytype's toolbar (its creation is contextual, `047` §8) | **Keep ours** — the program's own creation pattern |
| B10 | Search: debounced, orthogonal to saved filters | `setSearchText` via `renderSearch` (`toolbar-renderer.ts:1610`) | `047` §6: view search "intentionally orthogonal to saved filters" | **Keep ours** — same shape |
| B11 | Group-by with visibility, date mode, row limit, subgroup | `renderGroupPopover` (`toolbar-renderer.ts:1741-2005`) | Not in Anytype (grouping differs; our board needs it) | **Keep ours**, shell migrated |
| B12 | Table view, formulas/rollups/calculations | Ours, whole | Anytype has neither formula nor rollup (`screenshots/anytype/README.md` mapping table) | **Keep ours** — non-adoption, program-ruled |
<!-- /ANCHOR:anytype -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

Requirement ids carry their `050` item number where one exists, so a reader can move between
`050`'s REQ table, `047` §11 and this spec without a map.

### P0 - Blockers (MUST complete)

| ID | `050` item | Requirement |
|----|-----------|-------------|
| REQ-101 | — | The five primitives of §5 exist in `toolbar-primitives.ts`, and every surface in `toolbar-surface-inventory.md` §3 whose target names that primitive is migrated onto it, with its replaced vocabulary deleted (goal D3) |
| REQ-102 | 1 | The chip row leads with a direction-coloured sort chip, then filter chips, an add control and a clear-all, auto-hiding when empty; each trigger carries a **declared state** the lane can read; and the view-settings panel's Filter and Sort rows carry the **`N applied` count label** in their value column. **Dual-mode trigger icons are rejected** (`design-trueup.md` REQ-001) — the threshold is `050` AC-001 **as restated by ADR-004**, not as first written |
| REQ-103 | 2 | Creating or duplicating a view lands in that view's settings within **100ms** of the create/duplicate completing (threshold: `050` AC-002) |
| REQ-104 | 4 | Duplicate view and the view-tab context menu are carried by the tab-strip/shell primitives with unchanged behaviour — duplicate is config-identical with a new id and a suffixed name; the menu offers rename, duplicate, remove (threshold: `050` AC-004) |
| REQ-105 | 7 | A manual drag reorder while a sort is active asks before it commits, on board and table both: decline leaves order and sort unchanged; accept clears the sort and commits the drop (threshold: `050` AC-007) |
| REQ-106 | 10 | A view can carry new-row default presets, applied at creation; a view without presets produces rows byte-identical to today's (threshold: `050` AC-010) |

### P1 - Required (complete OR user-approved deferral)

| ID | `050` item | Requirement |
|----|-----------|-------------|
| REQ-107 | 12 | An embedded view's toolbar collapses by measured natural width against available space — no control overflows at any width in the sweep, the measurement runs once per resize, not per frame (threshold: `050` AC-012) |
| REQ-108 | — | The seven dead settings-entry methods are deleted and the settings entry is the single `createSettingsEntry` path, with the anchor-fallback classes preserved |
| REQ-109 | — | `044`'s grammar holds on every toolbar surface presenting as a phone sheet, and `048`'s stacking model holds on every surface that can open over another (constraints, verified not re-built — goal D5) |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 7. SUCCESS CRITERIA

- **SC-001**: Every migration row in `toolbar-surface-inventory.md` §3 shows its target state, and
  the dual classes, repeated close runs and dead methods the rows name are gone from the tree.
- **SC-002**: Every threshold in `acceptance-criteria.md` was observed failing on the current tree
  before its surface was written, and the failing figure is recorded in `checklist.md`.
- **SC-003**: `npm run gate` exits 0 read from `$?`, with one permanent row per criterion, and
  `npm run replay` holds with reversed 0.
- **SC-004**: The `screenshots/project-manager/` board and gantt reference captures are
  `pixelHash`-identical to their pre-phase baseline, or the difference is operator-ruled.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 8. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | `toolbar-renderer.ts` is 2,626 lines with 17 duplicated close runs; a primitive migration can silently change dismissal order | H | The close run's *sequence* is the contract (database → group → view-tab → export → title). `createPopoverShell` encodes it once; the lane asserts the sequence on a representative surface |
| Risk | The chip rail moving into the toolbar shifts the `.db-header` layout the table's sticky-offset measurement reads (`embedded-database-renderer.ts:1833-1841`) | M | Measure the header height before and after; the lane asserts the sticky offset still tracks the real header box |
| Risk | A trigger carrying a declared state changes what the filter/sort panel anchors to | M | The anchor is unchanged: the state is reported, not acted on — dual-mode *behaviour* is rejected (`design-trueup.md` REQ-001), so both states go through `createControlClusterButton`'s single existing anchor contract |
| Risk | Item 7's confirm touches `board-renderer.ts`, which carries PM 1:1 parity | H | Parent D5: recapture the board reference and compare `pixelHash` before the leg closes; the confirm is a commit-time gate, not a drag-visual change |
| Risk | Deleting seven dead methods breaks an anchor fallback | M | The classes stay; only the uncalled methods go. Grep both query sites after the deletion |
| Risk | `styles.css` collisions across legs | M | The parent's serialized CSS lane; one leg at a time |
| Dependency | `050`'s thresholds | This phase keeps them verbatim; where this phase's Today differs (items 1 and 4), the correction is recorded in the parent `goal.md` §2, not in a new number |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:edge-cases -->
## 9. EDGE CASES

### Data Boundaries
- Empty input: a view with zero filters and zero sorts renders no chip row at all, and its
  triggers read the `add` state.
- Maximum length: a chip row wider than its container scrolls horizontally rather than wrapping
  (the rail's existing scroller, `active-view-controls-renderer.ts:190-205`).
- A preset map referencing a deleted column: the preset's orphaned keys are skipped at creation and
  the settings section flags the orphan rather than throwing.

### Error Scenarios
- A duplicate colliding on name: the existing unique-name suffix stands
  (`database-view.ts:3949-3956`); the duplicate never reuses the source id (`:3930`).
- An embedded view narrower than its minimum toolbar: collapse drops to the measured minimum set,
  never to an unmeasurable zero; below the tab strip's own floor the embed renders the
  headerless mode it already has (`:2410-2416`).

### State Transitions
- Toggling a trigger from `active` to `add` mid-edit: the panel closes first, then the state flips;
  the lane asserts no panel survives a state flip.
- A view deleted while its settings are open: the settings panel closes with the view — the
  existing `toggleHeaderPopover` exclusivity handles it; the lane asserts it.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## 10. COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 18/25 | 14 files, ~1200 LOC estimated; `recommend-level.sh --loc 1200 --files 13` → 49/100, Level 2 |
| Risk | 14/25 | No auth, no API, no data model. The risk is a shared mechanism every view consumes and one PM-parity surface |
| Research | 6/20 | The inventory is written from source; the capture read is the implementer's gate (D1) |
| Multi-Agent | 6/15 | Five file-grouped legs, sequential |
| Coordination | 8/15 | Four upstream contracts consumed (`044`, `048`, `003`, `050` thresholds) |
| **Total** | **52/100** | **Level 3** — raised from the script's Level 2 on judgment (parent precedent, `050` goal log). Phase score **10/50** against a 25 threshold, so a standard child, not a phase parent |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 11. OPEN QUESTIONS

- Does the direction-coloured sort chip change the `.db-header` height the table's sticky-offset
  measurement reads? The lane measures before the leg closes (risk table row 2).
- Does the settings-landing continuation (item 2) also apply on phone, where the settings surface
  is a sheet? Default: yes — the sheet opens like any other; confirm at T001.
- Should the timeline and calendar option popovers merge into the settings entry, or keep their
  own trigger with the shared shell? Default: own trigger, shared shell — the PM parity keeps
  their surfaces stable.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Surface inventory**: `toolbar-surface-inventory.md` (this packet) — the migration table
- **Implemented items**: `../050-anytype-adoption/spec.md` REQ-001/002/004/007/010/012
- **Ranked research**: `../047-competitor-references-and-pm-alignment/research/research.md` §11
- **Capture index**: `screenshots/anytype/README.md`
- **Sheet grammar**: `../044-phone-sheet-alignment/decision-record.md` (header everywhere, 44px
  close, 16px inset, 16px title)
- **Stacking model**: `../048-stacked-sheets/spec.md` §3
