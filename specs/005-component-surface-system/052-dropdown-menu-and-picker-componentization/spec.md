---
title: "Feature Specification: Dropdown, Menu and Picker Componentization"
description: "One menu primitive and one picker primitive family for every dropdown, menu, popover and picker in src/views, with a per-surface migration table and the Anytype menu grammar each migration takes or declines."
trigger_phrases:
  - "052 spec"
  - "menu primitive spec"
  - "picker primitive family"
  - "dropdown componentization"
  - "menu migration table"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Dropdown, Menu and Picker Componentization

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

The plugin's menus have three good shared pieces — `owned-menu.ts` (container), `menu-row.ts`
(rows), `dropdown-field.ts` (listbox) — and a drifted periphery that predates or bypasses them: 70
hand-built row constructions, submenus built outside the menu factory, three pickers each wiring
their own host, and nine bespoke popover widths. This phase reduces the whole family to one menu
primitive and one picker family, and takes Anytype's menu grammar where the captures show it is
better. The table view, formulas/rollups/calculations, and the Project Manager 1:1 board and gantt
stay ours.

**Key Decisions**: one row builder (D1); submenus through the factory (D2); one picker host (D3);
captures first for the grammar document (D5); existing sheet/stack/role contracts consumed
unchanged (D4).

**Critical Dependencies**: `044`'s sheet grammar, `048`'s stacking model and the `sheet-grammar`
lane; `001`'s role vocabulary; the Anytype captures.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-05 |
| **Branch** | `worktrees/081-phase-menu-componentization` |
| **Parent Spec** | ../spec.md |
| **Phase** | 52 |
| **Predecessor** | 048-stacked-sheets (stacking model), 044-phone-sheet-alignment (sheet grammar) |
| **Related** | 050-anytype-adoption (items 1, 4, 6, 8 — see §7), 047-competitor-references-and-pm-alignment (research + captures) |
| **Handoff Criteria** | `componentization-plan.md` and `anytype-menu-grammar.md` exist with every family surface dispositioned; the menu primitive opens real submenus; the picker family shares one host; one lane row per migrated family is green with its negative control seen failing |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 52** of the component surface program. The operator asked for every modal, sheet
and menu to take the best from Anytype and to be componentized as much as possible. `044` and `048`
landed the sheet half — the seven-element grammar and the stacking model. No phase owns the menu
half. `050` owns fourteen file-scoped Anytype adoption items, four of which touch menus; this phase
implements the primitive work those four sit on and references them by item number rather than
re-doing them.

**Scope Boundary**: every dropdown, menu, popover and picker — the floating-surface family. A
sheet's own grammar is `044`'s; stacking is `048`'s; the inline cell editor is deliberately not a
sheet (`003` inventory §9) and its dock claim is `048`'s arbitration. The properties panel is
`002`'s.

**Deliverables**:
- `anytype-menu-grammar.md` — the menu grammar worth taking, each pattern with its capture or its named gap.
- `componentization-plan.md` — the per-surface migration table: surface → primitive → changes → Anytype pattern → stays ours.
- One menu primitive (items, sections, submenus, search, checkmarks, icons, destructive tone, keyboard navigation, desktop popover ↔ phone sheet from one definition).
- One picker primitive family (select/multi-select with search and create, date with time and relative presets, object/relation, colour, icon).
- One lane row per migrated family, red before green.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The family works surface by surface and drifts as a family. Counted from source on today's tree:

- **Rows**: `createMenuRow` (`menu-row.ts:93`) is the canonical builder and production reaches it
  through `owned-menu.ts:170`'s `addRow` — but **71 sites across four files construct
  `db-menu-item` rows by hand** (45 in `toolbar-renderer.ts`, 19 in `column-menu.ts`, 4 in
  `dropdown-field.ts`, 3 in `cell-renderer.ts`), exactly the "fourteen other vocabularies" drift
  the design-system's row-grammar section records, still growing.
- **Submenus**: `owned-menu.ts:170-178` closes the menu on any non-submenu row and exposes no
  nested-menu handle; `menu-row.ts:112-122` draws a chevron and sets `aria-haspopup` that promises
  a menu nothing can open. The only real submenus (`column-menu.ts:224-255`, `:257-320`, `:386-431`)
  are hand-built body popovers with their own cleanup lifecycle — the design-system's "affordance
  without a mechanism" anti-pattern, live in shipped code.
- **Pickers**: `date-value-picker.ts`, `icon-picker-popover.ts` and `option-color-picker.ts` each
  declare their own `activePickers` WeakMap (`:71`, `:50`, `:29`), repeat the phone-header
  construction dance, and place themselves with four bespoke widths (252, 318, 124; the dropdown
  adds 280/360/180). The relation editor (`cell-renderer.ts:899`) is a fourth picker with its own
  search/virtualized-list/footer wiring.
- **Placement widths**: 34 `positionToolbarPopover` call sites, 9 passing bespoke numbers (420,
  360, 318, 292, 280, 252, 240, 124, 520), against the design-system's rule that width is a
  property of the role, not the call site.
- **Search**: four separate search implementations — `dropdown-field.ts`'s
  `filterDropdownOptions` (`:407`), the relation editor's inline filter (`cell-renderer.ts:968`),
  `icon-picker-popover.ts`'s search, and the all-views hub's search (`toolbar-renderer.ts:1180`) —
  with different empty states, different reset behaviour and no shared "create new" affordance.

Anytype solves the same problem with one menu grammar: **five** sectioned blocks with capability
gating, 28px rows and 16px leading icons in a 256px frame (measured, `design-trueup.md` REQ-008 and
§2), one picker component feeding three search surfaces, and a "create" entry in the value picker's
search row (`anytype-filter-tag-value-picker-dark.png`). Its **hover-opened, pre-filtered submenus**
are `047` §9's source read and are **not captured** — the sweep photographed no hover state at all —
so that half stays code-derived with the gap named (goal D3).

### Purpose

One menu primitive and one picker family, so the next surface declares intent instead of inventing
markup — and the family reads like Anytype's menus where Anytype's are better.

<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The menu primitive: `owned-menu.ts` + `menu-row.ts` extended once — real submenus through the
  factory, sections and separators (already present), checkmarks, icons, destructive tone (already
  present as `warning`), keyboard navigation (already present), search where a menu needs it.
- The picker family: select/multi-select (with search and create), date with time and relative
  presets, object/relation, colour, icon — reduced to one shared host for search, grids, headers,
  phone-sheet branching, active-picker registration and placement.
- The migration of every family surface listed in `componentization-plan.md`.
- The Anytype menu grammar document, from the captures and `047`'s research.
- Lane rows per migrated family, with negative controls.

### Out of Scope
- **The table view's surface grammar, formulas/rollups/calculations, and the Project Manager 1:1
  board and gantt** — kept ours per the operator's ruling; menu changes inside them do not alter
  their parity contracts (`037`/`038` references re-read if a capture moves).
- **`044`'s sheet grammar and `048`'s stacking model** — consumed unchanged; migrations register
  rows in the existing lanes rather than building new ones.
- **The inline cell editor** — deliberately not a sheet (`003` inventory §9); only its option
  popover's row construction is migrated here.
- **Anytype's data model** — `050` D6 applies: Objects/Types/Queries are not adopted.
- **`050`'s fourteen items** — referenced by item number where they overlap (§7); implemented by
  `050`, not here, except where this phase's primitive is the substrate those items land on.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/owned-menu.ts` | Modify | Submenu handle through the factory; search section; no other shape change |
| `src/views/menu-row.ts` | Modify | Submenu rows carry a working open affordance; section rows stay as-is |
| `src/views/dropdown-field.ts` | Modify | Becomes the select/multi-select picker; shared host extraction |
| `src/views/popover-host.ts` (new) | Create | The shared picker host: active-picker registry, phone-header dance, search wiring, width roles |
| `src/views/date-value-picker.ts` | Modify | Onto the shared host; presets stay |
| `src/views/icon-picker-popover.ts` | Modify | Onto the shared host |
| `src/views/option-color-picker.ts` | Modify | Onto the shared host |
| `src/views/cell-renderer.ts` | Modify | Relation editor onto the shared host; option editor's rows via the row builder |
| `src/views/column-menu.ts` | Modify | Submenus onto the menu primitive; its 19 hand-built rows onto the row builder |
| `src/views/toolbar-renderer.ts` | Modify | Its 44 hand-built rows and 4 hand-built panels onto the primitive |
| `src/views/bulk-edit-field-menu.ts` | Modify | Caller updates only (already `openDropdownMenu`-based) |
| `src/views/row-menu.ts` | Modify | Capability gating helpers shared with `050` item 8 |
| `tools/live/sheet-grammar.mjs` | Modify | Row updates for any registered pair whose child markup changed |
| `styles.css` | Modify | Rules follow the markup; serialized by the parent's CSS lane |
| `componentization-plan.md` | Create | The migration table |
| `anytype-menu-grammar.md` | Create | The grammar document |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | The menu primitive opens a real submenu through the same factory that produced its parent row: keyboard (`ArrowRight`/`Enter`), pointer and phone-sheet paths all open it; the phone expression is the stacked-sheet grammar `048` already registers, not a second mechanism. The chevron promise in `menu-row.ts:112-122` becomes true or disappears. |
| REQ-002 | Every menu row in the family is built by `createMenuRow`. A surface that needs a row the builder cannot express extends the builder once. The 71 hand-built sites are migrated or individually dispositioned in `componentization-plan.md`. |
| REQ-003 | The picker family shares one host owning: the one-per-document active-picker registry, the phone sheet-header construction, search-with-empty-state, grid keyboard navigation (the two geometric navigators in `icon-picker-popover.ts:281-306` and `option-color-picker.ts:130-173` are one function), and width-by-role. |
| REQ-004 | Every family surface in `componentization-plan.md` carries a row: surface → primitive → changes → Anytype pattern with capture filename → stays ours. No surface in the census is undispositioned. |
| REQ-005 | `anytype-menu-grammar.md` states the menu grammar worth taking — item density, section headers, submenu arrows, search-first pickers, the create-option row, hover/active states — each with its capture file or its named gap. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-006 | Search is one shared implementation with one empty state and one optional "create new" affordance (Anytype's search-first pickers; `anytype-filter-tag-value-picker-dark.png` shows "Filter or create options…"), adopted by the dropdown, relation and option editors. |
| REQ-007 | Widths move from call-site numbers to named presets/roles: the nine bespoke widths are each mapped to a named value or given a written reason in `componentization-plan.md`. |
| REQ-008 | `npm run gate` exits 0 with one permanent lane row per migrated family, each negative control observed red then green; `044`'s pairs and `048`'s stacking rows still pass. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `componentization-plan.md` dispositiones every family surface with no "unknown" cells,
  and every adopted pattern names a capture that resolves under `screenshots/anytype/` or a named gap.
- **SC-002**: A submenu opened from the column menu opens through the menu primitive on desktop,
  phone and keyboard, and the hand-built subpopover lifecycle (`column-menu.ts:568-633`) is gone.
- **SC-003**: The 71 hand-built row sites are reduced to the single builder (or individually
  dispositioned), measured by `grep -c 'db-menu-item'` per file against a recorded baseline.
- **SC-004**: Every threshold in `acceptance-criteria.md` was observed failing on the current tree
  before its leg ran, and the failing figure is recorded in `checklist.md`.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `044`'s `sheet-grammar` lane and `048`'s registered pairs | Migrating child markup can move a registered pair's selectors | `tools/live/sheet-grammar.mjs:88-118` names every pair and selector; update rows in the same leg, never after |
| Dependency | `048`'s D1 (modals-as-sheets) | The picker family renders inside modal-presented sheets at depth 3 | The stacking lane already registers depth-3 chains (`properties property type picker`, `import confirm dropdown chain`); keep them green |
| Risk | `toolbar-renderer.ts` is 2,626 lines and carries the toolbar's own tests | Wide refactor regressions in the most-used chrome | One leg, D6; the geometry/grammar lanes run per leg |
| Risk | Anytype's hover-open submenus are desktop-only | Phone expression needs its own decision | D7: the phone path is the stacked sheet Anytype's mobile builds also reach; decided in the grammar doc, not improvised per surface |
| Risk | Capture descriptions were read from the index, not the pixels | A grammar pattern could be mis-stated | Goal D1's clause: T001 re-reads the actual PNGs and corrects the grammar doc; image reads were unavailable to this authoring session |
| Risk | `styles.css` is 22k+ lines with cascade traps | A selector rename silently breaks sibling surfaces | The parent's serialized CSS lane; cascade replay per the design-system's §10 anti-pattern list |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:overlaps -->
## 7. OVERLAP WITH 050-ANYTYPE-ADOPTION

`050`'s items 1, 4, 6 and 8 land on surfaces this phase builds the substrate for:

| 050 item | Surface | This phase's role |
|----------|---------|-------------------|
| Item 1 — the filter/sort trigger state **[trued 2026-09-05]** | `toolbar-renderer.ts`, `filter-panel-renderer.ts` | `design-trueup.md` REQ-001 rewrote this item in both directions. **Our chip row already ships** (`active-view-controls-renderer.ts`, auto-hiding at `:97`, on both the full-page and embedded surfaces) and our triggers already carry a numeric count badge (`toolbar-renderer.ts:2575`) — so `050`'s AC-001 could not be observed red as written. And **Anytype's dual-mode icons are rejected**: the funnel and sort glyphs are pixel-identical across all 120 catalogue captures whether or not the view is filtered or sorted, so there is no second mode to adopt; the colour-only signalling it does carry fails WCAG 1.4.11 where our count badge carries a text second signal. The one thing adopted is the `N applied` **count label** in the view-settings panel's value column. This phase's role is unchanged: the trigger menu opens through the menu primitive |
| Item 4 — duplicate view + view-tab context menu **[trued 2026-09-05]** | `active-view-controls-renderer.ts`, `toolbar-renderer.ts` | `design-trueup.md` REQ-004 (contradiction C4): Anytype's **duplicate and remove live in the view-settings panel**, last section below a divider — not in a tab context menu. **No right-click on a view tab was ever captured**, so a tab menu may exist but may not be designed from a screen nobody saw; the true-up marks it *design inferred from source code, not seen*. Our tab menu already exists (`toolbar-renderer.ts:1229`, hand-rolled rows) and is migrated onto the primitive here regardless — its **content and placement** are `053`'s and `050`'s to settle, not this phase's. Duplicate-view itself is partially landed (`database-view.ts:3925` `duplicateView`, wired at `toolbar-renderer.ts:1256`); this phase does not re-implement it |
| Item 6 — cell-editor flip at the right edge | `popover-position.ts` | Placement is shared; this phase's picker host calls the same placement and inherits the flip when `050` lands it |
| Item 8 — capability-gated menus, never empty **[trued 2026-09-05]** | `row-menu.ts`, `bulk-edit-field-menu.ts` | `design-trueup.md` REQ-008 narrowed this to **one file**: `row-menu.ts` cannot render empty (its first row, `menu.openNote`, is unconditional), so its guarantee is **asserted so it cannot regress, not built**; the only file that can violate the threshold is `bulk-edit-field-menu.ts:31-45`. The selection caps `047` describes are **not adopted** — our row menu has no multi-select, so they have no referent. The gating predicate stays `050`'s; this phase's primitive gives the one violating file somewhere to render the fallback row, whose exact wording is **code-derived** (the "No available actions" state appears on no capture) |

Where an item's file and a migration leg would both open a file, `050`'s leg and this phase's leg
coordinate through D6's one-leg-one-file rule and the parent's serialized CSS lane.
<!-- /ANCHOR:overlaps -->

---

<!-- ANCHOR:nfr -->
## 8. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The shared search implementation filters the dropdown's existing dataset without a
  new per-keystroke layout pass; the relation editor's windowed list keeps its 34px-row windowing.
- **NFR-P02**: Menu open cost does not regress: the owned menu already caps height before measuring
  (`owned-menu.ts:230-241`); the primitive keeps that order.

### Security
- **NFR-S01**: No new document-level listeners per surface: the primitive registers through
  `overlayStack` (as `installPopoverAutoClose` already does) rather than adding a second dismissal
  system — the design-system's "a second dismissal system" anti-pattern is not reintroduced for
  submenus.

### Reliability
- **NFR-R01**: One `activePickers` registry means opening picker B closes picker A on the same
  document, on every picker, not on three of four (the dropdown's own registry is the overlay stack
  today; the relation editor and date picker coordinate through `closeActiveOptionColorPicker` and
  `closeActiveDateValuePicker` ad hoc).
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## 9. EDGE CASES

### Data Boundaries
- Empty input: a menu with zero eligible rows renders the never-empty fallback (Anytype's "No
  available actions"), not a blank sheet; a picker with zero results renders the shared empty state
  plus its create affordance.
- Maximum length: a submenu longer than the viewport scrolls inside itself with the same cap the
  owned menu already applies (`owned-menu.ts:230-241`); a picker list longer than `90svh` scrolls
  inside the sheet with the scroll affordance `dropdown-field.ts:315-320` already draws.

### Error Scenarios
- A submenu's parent closes while the child is open: the child closes with it — the overlay stack's
  LIFO dismissal already answers this for registered surfaces; the submenu registers like any child.
- A picker opened from a surface that rebuilds underneath it: the anchor-lease rule (`design-system.md`
  §8) applies — the picker closes on expiry rather than pointing at nothing.

### State Transitions
- Phone rotation mid-menu: `isMobileBottomSheet` is read at open (`owned-menu.ts:194`); the open
  presentation is not re-decided mid-flight, matching `048`'s own rotation stance (`db-modal.ts:65`
  re-runs `applyPresentation` for modals; menus close and reopen).
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## 10. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 18/25 | 16 files, ~1400 LOC estimated; `recommend-level.sh --loc 1400 --files 15` → 51/100 |
| Risk | 14/25 | No auth, no API, no data. The risk is refactoring the most-consumed chrome in the plugin |
| Research | 4/20 | `047`'s research and the captures exist; the grammar doc is extraction, not research |
| Multi-Agent | 6/15 | Legs grouped by file; sequential |
| Coordination | 9/15 | Four upstream contracts consumed unchanged |
| **Total** | **51/100** | **Level 3** — raised from the script's Level 2 on judgment, the same call `050` made at identical numbers. Phase score **10/50** against a 25 threshold, so a standard child, not a phase parent |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 11. OPEN QUESTIONS

- Which picker widths become named roles versus stay content-driven numbers — decided per row in
  `componentization-plan.md` against the design-system's §5 policy, not pre-decided here.
- Does the create-option row belong in the dropdown primitive (so every select gains it) or in the
  cell option editor only? Anytype puts it in the picker; our option editor already has one
  (`cell-renderer.ts:1508-1516`). The grammar doc proposes; the operator disposes if the answer
  changes a shipped surface's behaviour.
- Do Anytype's hover-open submenus adopt on desktop, or do ours stay click/arrow-key opened? Hover
  is Anytype's mechanism (research §9); the captures cannot show a hover state, so this is a
  code-derived decision with the gap named.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Packet Goal**: See `goal.md`
- **Migration Table**: See `componentization-plan.md`
- **Menu Grammar**: See `anytype-menu-grammar.md`
- **Research Source**: See `../047-competitor-references-and-pm-alignment/research/research.md` §9, §11
