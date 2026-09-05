---
title: "Feature Specification: Record and Relation Surfaces"
description: "The record sheet, the table record peek, the properties panel, the property modals and every cell editor reduced to one set of record-surface primitives, with the Anytype object-page and relation-panel behaviours worth taking and formulas/rollups/calculations staying ours."
trigger_phrases:
  - "054 spec"
  - "record surface primitives"
  - "property row primitive"
  - "relation panel"
  - "record sheet primitive"
  - "type picker"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Record and Relation Surfaces

<!-- SPECKIT_LEVEL: 3 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-05 |
| **Branch** | this worktree (`083-phase-record-relation-surfaces`) |
| **Parent Spec** | ../spec.md |
| **Phase** | 54 of 54 |
| **Predecessor** | 048-stacked-sheets; 050-anytype-adoption |
| **Successor** | None |
| **Handoff Criteria** | Every surface in §4's inventory carries its primitive row, the primitives exist as exported modules with a documented contract, one inline-editor primitive per column type is shared by table cells, the record sheet and board cards, the Anytype object-page behaviours in §5 are designed against named captures, and one lane row per primitive is green with its negative control observed red |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 54** of the component surface program. The operator's 2026-09-05 directive: *"research
recommendations and how to tackle / update / improve every modal, sheet and general ui ux to take the
best from AnyType and componentize stuff as much as possible."* `050-anytype-adoption` landed the
fourteen view-level items; this phase is the **record/object half** of the same directive — the
surfaces a person meets when they open one record and edit its properties.

**Scope Boundary**: the record/object surfaces and property editing only. View-level surfaces stay
`050`'s. Stacking stays `048`'s. First-sheet grammar stays `044`'s. The table, the bottom sheets'
ownership, the Project Manager 1:1 board and gantt, and **formulas, rollups and calculations stay
ours** — the operator's standing ruling, which this phase does not reopen.

**Dependencies**:
- `050-anytype-adoption` — the capture sweep and the research; this phase references its items by
  number where they overlap and implements the record-side slice of item 6 and item 11.
- `044-phone-sheet-alignment` — the seven-element grammar; every phone surface here already
  registered or registering there keeps it.
- `048-stacked-sheets` — the stacking model; every editor opened over the record sheet obeys it.
  This phase owns the editor *primitives*, not the stacking claims.
- `023-record-note-body` — owns the note body's display-vs-editable decision (accepted editable);
  this phase consumes `note-body-region.ts` as a primitive and does not reopen the decision.
- `045-board-card-properties` — owns the per-view card property list; this phase moves its rows onto
  the shared property-row primitive without changing the mechanism ADR-002 froze.

**Deliverables**:
- One primitives module family (`src/views/record-surface/`): header, property row, add-property
  row, hidden-properties group, note-body region host, type picker.
- One inline-editor primitive per column type, shared by table cells, the record sheet and board
  cards.
- §6's per-surface migration table: surface → primitive → changes → Anytype pattern with capture
  filename → what stays ours.
- §5's Anytype object-page and relation-panel behaviours, designed against named captures.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The same three UI ideas — a record's header, a property row, a property editor — are built three
times each by three different files, and the result is that a property looks different on every
surface that shows it.

**Three property-row vocabularies.** `renderCardField` (`card-field-renderer.ts:102`) builds the
row the record sheet and board cards use (`db-record-detail-field` / `db-board-card-value`);
`renderProperty` (`table-record-peek.ts:334`) builds a second, display-only row for the peek
(`db-record-peek-field`), whose badge rendering it documents as having been wrong until it was
copied from the cell; `renderColumnRow` (`column-manager-renderer.ts:265`) and
`renderBoardCardProperties` (`board-card-properties-panel.ts:48`) build a third — the checkbox +
type-icon + name row, hand-duplicated between the two files down to the same `shouldIgnoreDrag`
helper (column-manager-renderer.ts:378, board-card-properties-panel.ts:159). One concept, three
vocabularies, three places to fix the next defect.

**Four header builders in one family.** The record sheet hand-builds its header
(`record-detail-panel.ts:348-386`: icon, title, open button, close button reusing the cell editor's
`db-cell-edit-close` class); the peek hand-builds a different one (`table-record-peek.ts:233-235`,
no close at all — it is a rail); the properties panel branches between `createSheetHeader` on phone
and a hand-built desktop header (`column-manager-renderer.ts:180`); the `DbModal` subclasses get
a title only through `getSheetTitle`'s heading scrape (`db-modal.ts:83-88`). `044` decided "header
everywhere"; nothing decided "header built once".

**The record sheet has no hidden-properties group.** The peek has one
(`table-record-peek.ts:259-278`); the record sheet instead filters empty fields away wholesale on
`config.showEmptyFields` (`record-detail-panel.ts:387-396`) — an all-or-nothing switch with no
affordance on the surface itself. **Trued at T001:** Anytype has no hidden-relations group and no
count on either platform (`design-trueup.md` C3), so this gap is measured against our own peek, not
against a competitor. REQ-003 is ours.

**Empty values say "Empty" instead of naming the action.** An empty multi-select renders the word
`Empty` (`record-detail-panel.ts:636`, `getEmptyDisplayValue`; `src/i18n.ts:77`) — one word for every
format, naming the absence. **Trued at T001:** Anytype's answer is not an add affordance either but a
**format-specific prompt naming the action** — `Select options`, `Add email`, `Enter number` — and it
renders that prompt only on a property list, leaving a grid cell blank and giving an opened editor a
full empty state instead (`design-trueup.md` C5, three rungs).

**The type list is written once, filtered once, and repeated once.** `PROPERTY_TYPES` in
`create-property-modal.ts:48-52` (thirteen types); `getTypeOptions` in
`property-type-conflict-modal.ts:377-380`, which is **not a second list but a filtered subset** of
that one (nine for a normal writer, five for a computed one); and the column-menu type submenu's own
list (`column-menu.ts:224`'s branch). **Trued at T001:** Anytype ships **one unfiltered list in both
its picker surfaces**, so the fix for the middle site is a gate carrying its reason, not a merge
(`design-trueup.md` C7).

### Purpose

One property row, one record header, one type picker, one add-property affordance and one editor
entry point per column type — built once in `src/views/record-surface/`, consumed by the record
sheet, the peek, the properties panel, the board card properties panel, the property modals and
every cell editor — with the Anytype object-page behaviours that the captures show are better, and
formulas/rollups/calculations untouched.

<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The seven primitives of §4, as exported modules under `src/views/record-surface/`.
- The per-type inline-editor primitives, extracted from `CellRenderer`'s private methods and
  consumed back by it, so table cells, the record sheet and board cards keep one entry point
  (`CellRenderer.startEdit`, `cell-renderer.ts:644`) over exported, individually testable editors.
- The record-side slices of 050 items 6, 9 and 11 (§7).
- The §6 migration table, one row per surface, each naming its capture.
- One lane row per primitive, registered in the `sheet-grammar` lane's registry where the surface is
  a phone sheet, or as a unit-test-plus-lane row where it is not.

### Out of Scope
- **Formulas, rollups and calculations** — the operator's standing ruling keeps them ours. The
  formula workbench (`formula-modal.ts`, 1,664 lines) is touched only where its output-type
  dropdowns read the shared type picker; nothing about the expression engine, the help browser, or
  the aggregation list moves.
- **The stacking model and stacked-pair grammar rows** — `048`'s. Editors opened over the record
  sheet obey its model; this phase adds no stacking code.
- **The first-sheet grammar and the `sheet-grammar` lane's element predicates** — `044`'s. This
  phase adds *rows* to the lane's registry, never columns.
- **The record-open target** — `006-record-open-target`'s resolver (`recordOpenTarget`,
  `database-view.ts:8332`) is consumed unchanged.
- **The note body's display-vs-editable decision** — `023`'s, accepted editable by the operator.
- **The table view itself, the PM 1:1 board and gantt** — outside this family.
- **Anytype's data model** — Objects, Types, Queries versus our file-backed records; `050` D6's
  non-adoptions carry over whole.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/record-surface/record-header.ts` | Create | P1: header primitive (icon + title + primary action + close) |
| `src/views/record-surface/property-row.ts` | Create | P2: property-row primitive (type icon + label + value + edit affordance), display and interactive variants |
| `src/views/record-surface/add-property-row.ts` | Create | P3: add-property affordance row |
| `src/views/record-surface/hidden-properties.ts` | Create | P5: hidden-properties group with count and toggle |
| `src/views/record-surface/type-picker.ts` | Create | P7: one property-type list with icons and per-format descriptions |
| `src/views/record-surface/index.ts` | Create | The documented primitive contract, one table per export |
| `src/views/cell-renderer.ts` | Modify | Private editor methods become thin wrappers over the extracted per-type editor primitives |
| `src/views/cell-editor-*.ts` (per type) | Create | P4: one editor primitive per column type under `src/views/record-surface/` |
| `src/views/record-detail-panel.ts` | Modify | Consume P1, P2, P3, P5, P6-host |
| `src/views/table-record-peek.ts` | Modify | Consume P1, P2 (display variant), P5 |
| `src/views/column-manager-renderer.ts` | Modify | Rows consume P2's checkbox variant; add row consumes P3 |
| `src/views/board-card-properties-panel.ts` | Modify | Same as column-manager-renderer |
| `src/views/modals/create-property-modal.ts` | Modify | Type dropdown consumes P7 |
| `src/views/modals/property-type-conflict-modal.ts` | Modify | Per-writer type dropdowns consume P7 |
| `src/views/modals/formula-modal.ts` | Modify | Output-type dropdowns consume P7; nothing else |
| `src/views/modals/relation-rollup-config-modal.ts` | Modify | Relation/target/aggregation dropdowns consume P7 |
| `src/views/column-menu.ts` | Modify | Type submenu consumes P7 |
| `styles.css` | Modify | Primitive-scoped rules; per-surface duplicates retired, serialized by the parent's CSS lane |
| `tools/live/sheet-grammar.mjs` | Modify | Registry rows for the record-sheet and peek surfaces this phase changes |
| `specs/.../054-record-and-relation-surfaces/migration-table.md` | Create | §6 as a tracked deliverable |

<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | The record sheet's header, the peek's header and the properties panel's phone header are built by one header primitive; the census of distinct header builders in this family reads **1** (the primitive), down from **4** today |
| REQ-002 | One property-row primitive with display and interactive variants replaces the three vocabularies; the record sheet, board cards, the peek, the properties panel and the board-card properties panel all consume it |
| REQ-003 | The record sheet renders a hidden-properties group with a count, replacing the all-or-nothing `showEmptyFields` filter as the way a hidden property is reachable |
| REQ-004 | Empty relation, select and multi-select property rows render an add affordance that opens the same editor an occupied row opens, on the record sheet and on board cards |
| REQ-005 | One type picker primitive is the single source of the property-type list, consumed by the create-property modal, the type-conflict modal's per-writer dropdowns, the relation/rollup config modal, the formula modal's output-type dropdowns and the column-menu type submenu |
| REQ-006 | One inline-editor primitive per column type exists as an exported module with a documented contract, and `CellRenderer.startEdit` dispatches to it; table cells, the record sheet and board cards keep that one entry point |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-007 | The properties panel's add row and the board-card properties rows consume the add-property and property-row primitives without changing their mechanisms (drag reorder, range select, per-view list) |
| REQ-008 | The migration table exists as a tracked deliverable with one row per surface, each naming its Anytype capture or recording the gap, and marking what stays ours |
| REQ-009 | The note-body region is formalized as the record sheet's body primitive — mounted after the property rows, draft-preserving across refreshes — with its existing regression test kept green |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A property reads identically — type icon, label, value form, empty affordance — on the
  record sheet, a board card, the peek and the properties panel, verified by one lane row rendering
  the same column through all four consumers.
- **SC-002**: The operator opens a record on iOS and reads the sheet as one object page: header,
  properties, add-property affordance, hidden group, note body — and reports it as close to
  Anytype's object page as the table it belongs to.
- **SC-003**: Every threshold in `acceptance-criteria.md` was observed failing on the current tree
  before its primitive landed, and the failing figure is recorded in `checklist.md`.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:surface-inventory -->
## 5A. SURFACE INVENTORY — every surface this family owns, from source

Read from the working tree; each row cites the constructor and the header it builds today.

| # | Surface | Source | Header today | Rows today | Editor entry |
|---|---------|--------|--------------|------------|--------------|
| S1 | **Record sheet** (phone bottom sheet / desktop anchored panel) | `record-detail-panel.ts`, opened at `database-view.ts:11674` via `006`'s resolver (`:8352` panel, `:8348` peek) | Hand-built `:348-386`: record icon + title (`db-record-detail-title`) + open-note (`db-board-card-open`) + close (`db-cell-edit-close`) | `renderCardField` `:455` under `db-record-detail-fields` `:390`; empties filtered by `showEmptyFields` `:387-396`; no hidden group | `actions.editCell` → `CellRenderer.startEdit` (`database-view.ts:11678`) |
| S2 | **Table record peek** (desktop display-only rail) | `table-record-peek.ts:150`; touch delegates to S1 `:169-173` | Hand-built `:233-235`, no close (a rail, not a sheet) | `renderProperty` `:334-360`, badge-rendering copied from the cell; hidden group `:259-278` | None — display-only by design |
| S3 | **Properties panel** (column manager; phone sheet + desktop popover) | `column-manager-renderer.ts:148` | Branches at `:180`: `createSheetHeader` on phone, hand-built `db-panel-header` on desktop | `renderColumnRow` `:196` onward: drag + arrows + checkbox + type icon + name + wrap/edit/delete; add row `:164-198` | `actions.editColumn` → `ColumnRenameModal` |
| S4 | **Create property modal** | `create-property-modal.ts:64`, `sheet` presentation | `getSheetTitle` heading scrape (`db-modal.ts:83-88`) | Label + key + type rows; type from `PROPERTY_TYPES` `:69-74`, rollup gated on an existing relation `:139-150` | Its own form |
| S5 | **Property type conflict modal** | `property-type-conflict-modal.ts:78`, `fullscreen` | Obsidian's own (fullscreen path) | Conflict cards; writer table; per-writer type dropdown from `getTypeOptions` `:364-369` | `createDropdownField` per writer row |
| S6 | **Relation / rollup config modal** | `relation-rollup-config-modal.ts:32`, `sheet` | `getSheetTitle` scrape | Target-database dropdown + impact preview `:69-97`; rollup: relation, target (aggregation-filtered), aggregation (12 options) `:118-200` | `createDropdownField` ×3 |
| S7 | **Formula modal** (stays ours) | `formula-modal.ts:176`, `fullscreen` workbench, 1,664 lines | Obsidian's own (fullscreen path) | Editor, preview, help browser; output-type dropdowns `:274`, `:443`, `:454` | Textarea workbench — untouched |
| S8 | **Board card properties panel** (settings-sheet section) | `board-card-properties-panel.ts:34` | None (a section inside the settings sheet) | Fixed Cover/Title slots `:39-41` + reorderable rows duplicating S3's `renderColumnRow` shape `:48-147` | Visibility toggle only |
| S9 | **Cell editors** (every column type, shared by table cells, S1 and board cards) | `cell-renderer.ts:644` `startEdit` dispatch | Per-editor: option popover `:1106`, relation popover `:899` (phone header via `createSheetHeader` `:941`), date popover `:1787`, text popover `:2353`, single-line `:2658`, number `:1596` | — | The dispatch itself `:687-739`; all editor builders are **private** methods of a 3,152-line class |
| S10 | **Note body region** | `note-body-region.ts:68` `mountNoteBodyRegion`, mounted by S1 `:290-303` under the properties | None (a region) | Rendered/textarea pair, debounced commit 500ms, caret resume across refresh | Its own |

**Stacking note, owned by 048 and consumed here:** every S9 editor opened over S1 is a stacked pair
in `048`'s inventory (§3.5 R1–R7); this phase changes *which code builds the editor*, never *how it
stacks*.

<!-- /ANCHOR:surface-inventory -->

---

<!-- ANCHOR:anytype-behaviours -->
## 5B. ANYTYPE OBJECT-PAGE AND RELATION-PANEL BEHAVIOURS WORTH TAKING

Designed against the capture index (`screenshots/anytype/README.md`) and the research's §7 object
model. Each row names the capture that shows it.

**Updated at landing 2026-09-05.** This table was drafted from the index's written descriptions
because the authoring pass could not open image files. `050`'s `design-trueup.md` has since read the
sweep pixel by pixel and is now the **read of record** (`050` ADR-003: where a capture and `047`'s
research disagree, the capture is the fact and the research is a source reading). Two things follow.
**All four named capture filenames were verified to resolve** under `screenshots/anytype/` at
landing. And **A5 is corrected**: what the true-up read on the shipped 0.56.5 build is a filter
panel whose *entire body is one `+ New filter` row*, and a property picker whose rows carry
**per-format leading icons** — not a search-first picker with create-new entries. That description
comes from `047` §9's source read, so A5 is now marked **design inferred from source code, not
seen**. T001 still opens every named image by hand before the primitive that adopts it is written
(goal D1) — the true-up covered the view surfaces, not the object-page and relation-panel captures
this table leans on.

**Trued at T001, 2026-09-05 (later).** `design-trueup.md` has now read the 25 `anytype-menu-object-*`
captures, the 12 `anytype-menu-cell-*` grid-cell editors, the iOS relations panel and its per-format
editors, and the catalogue grids, pixel by pixel. **That document is this table's read of record**,
and the rows below are corrected against it. Three corrections are structural rather than cosmetic:
**A2's stated anatomy is wrong on both halves** (no format icon belongs on a value row, and neither
platform right-aligns a value); **A4's hidden group does not exist in the product** and REQ-003 is
ours rather than adopted; and **A5 reverts from code-derived to captured**, on the phone. The
`design-trueup.md` §1 contradiction table carries all nine, and `decision-record.md` ADR-004 rules
on them.

| # | Behaviour | Anytype evidence | What we take | What we keep |
|---|-----------|------------------|--------------|--------------|
| A1 | **Object-page header block**: icon, title, then the featured relations as one inline middot-separated line under the title | **Seen, both platforms.** `anytype-object-page-empty-dark.png` (`Page · Tag`); `mobile/anytype-mobile-object-page-dark.png` (`Project Tracker · Tag · 1 backlink`); `menus/anytype-menu-object-featured-tag-dark.png` (the featured `Tag` opening a `Filter or create options…` picker in place) | S1's header becomes P1, and the featured line — **inline text, middot-separated, secondary colour, one line, directly under the title** — is what makes the surface read as a page. An unset featured relation shows its **label**, and clicking it opens the same editor an occupied one opens | The open-note button, our title-field resolution (`resolveTitleFieldDisplay`) and our title sizing (`design-system.md` §5 owns panel type; Anytype's 34px is a full-page object title). **And our divergence, recorded deliberately**: Anytype puts no properties on the object page, S1 *is* the properties surface, so P1 keeps them |
| A2 | **Relation row layout**: label then value, one row per relation, in-place editing | **Seen, both platforms, and they are two designs.** `menus/anytype-menu-object-properties-panel-dark.png` — a **card per property**, `#1E1E1E` on `#171717`, 288px wide, 46px one line / 70px two, 8px apart, label at x 50 on every row and the value **12px after its own label ends** (x 84…153, no column). `mobile/anytype-mobile-sheet-object-properties-dark.png` — a **fixed two-column list**, 48.33pt rows, 1px divider inset 20pt, label at 20.7pt truncating at 154pt, **value pinned at 174pt on every row** | P2's anatomy is **label, then value, value left-aligned** — never right-aligned, and with **no format icon on the row** (`design-trueup.md` C1). Adopted: the desktop left-alignment; **equal type size** for label and value on desktop with the colour split carrying the hierarchy; the **single-select-as-coloured-text / multi-select-as-filled-chip** split (C9); a **4.5:1 floor on every option colour pair**, which Anytype's meet by pairing a dark tinted fill with a light tint of the same hue | Our option palette, conditional formatting, rating/progress/ring displays. Our mobile label column (`flex: 0 0 96px`, `styles.css:10463`) over Anytype's 154pt — an established documented value beats a neighbouring measurement of a longer label population. Our mobile label/value size split, which `styles.css:10479` forces (below 16px iOS zooms the page on tap). Our 44px `--db-sheet-row-min-height`, which Anytype's 48.33pt clears anyway. **And the board card's own right-alignment** (`styles.css:10161`), untouched — `038` parity, goal D5 |
| A3 | **Empty value affordance**: an empty relation offers a way in, and it opens the same editor an occupied row opens | **Seen, three rungs, keyed to surface density.** Grid cell: **nothing at all** (`anytype-crm-contacts-deals-grid-dark.png`). Property list: a **format-specific prompt naming the action** — `Select options`, `Select option`, `Enter number`, `Add email`. Opened editor: a **full empty state** — `No options` / `Nothing found. Create first option to start.` / `Create` (`mobile/anytype-mobile-sheet-cell-multiselect-empty-dark.png`), or the leaner `No Objects found` + `+ Add` default row (`menus/anytype-menu-object-relation-file-dark.png`) | REQ-004: the **second rung**, not a `+` button — the word "Empty" is replaced by a **format-specific prompt naming the action**, one string per format, on the record sheet and board cards. Plus the row-versus-input copy split the captures show: `Add email` on the row, `Enter email` in the input | `showEmptyFields` stays the show/hide switch for *whether* empties render. The grid keeps rendering **nothing** — the first rung is correct for a dense surface. **Anytype's placeholder greys are refused**: `#5C5C5C` at 2.49:1 desktop, `#646464` at 2.88:1 iOS; a prompt naming the only way to fill a field is normal text and owes 4.5:1 |
| A4 | **Hidden relations group**: properties hidden from the page collapse into a labelled group with a count | **Not seen — proved absent.** `mobile/anytype-mobile-sheet-object-properties-settings-dark.png` shows the surface that would carry one and it does something else: a **`Header` section** (Object type, Tag, Backlinks) and a **`Properties panel` section** (the rest) with a `+` on the second, every row `format icon · label · drag handle`, **both always expanded, nothing counted, nothing collapsing**. Membership changes by dragging a row across the boundary. The marketing JPEG the row cited is not evidence of a shipped surface | REQ-003 stays, **as ours rather than adopted** (`design-trueup.md` C3). The count stays too, for `050` REQ-001's reason: a number is a text second signal, and `t("panel.hiddenProperties")` (`src/i18n.ts:549`) carries none today. P5's shape is the peek's existing disclosure **moved, not redesigned** | The peek's group (`table-record-peek.ts:259-278`), which becomes the primitive. **Anytype's Header/Properties-panel model is not adopted**: its axis is *where* a property appears, decided at the type level, and a type system is out of scope by goal D6 |
| A5 | **Add-relation search-first**: the add control opens a search-first picker offering formats and existing properties, with create folded into the search | **Seen, on the phone. The landing correction is reverted.** `mobile/anytype-mobile-sheet-relation-add-dark.png`: title `Add property`, a search field placeholded **"Search or create new"**, then **`Properties formats`** (all eleven) and then **`Existing properties`** — formats **first**, which inverts the row's original order. Corroborated by three more pickers: `Filter or create options…` (featured tag), `Type to create a new option` (multi-select relation), `Filter Types…` (change type). Search-first is the product's picker grammar, not one surface's habit | P3 opens a search-first picker with **create folded into the search field's placeholder**, formats before existing properties. Row geometry: 52.33pt, 18pt icon box with a 14pt glyph at 23pt, label at 54.7pt, dividers inset 20pt. **The format-icon vocabulary is adopted and now placed**: pickers and the property-management surface, never a value row | Our `QUICK_ADD_FILE_FIELDS` quick-add row in S3, **beside** the picker — Anytype's picker leads with the format question and the quick-add row skips it, so the two do not compete (`spec.md` §10, answered) |
| A6 | **Type change flow**: a property's type is changed from its row, with the picker offering every format | **Seen, both platforms, and it is search-first.** `menus/anytype-menu-object-type-picker-dark.png` — a two-row menu, `Open type` / `Change type ›`. `menus/anytype-menu-object-type-picker-change-type-dark.png` — the submenu is a **`Filter Types…` search field** over a `My Types` section over the list. `mobile/anytype-mobile-sheet-relation-new-format-dark.png` — the **same eleven formats in the same order** as the add picker, current one carrying a **right-aligned checkmark**. **One list, twice, unfiltered** | P7 is the one list behind the column-menu type submenu and every modal's type dropdown, **search-first**, with the current value marked by a **checkmark** (a shape) rather than a row fill (a colour `050` already refused at 1.14:1). **The conflict modal's shortened list becomes a gate, not a filter**: `property-type-conflict-modal.ts:377-380` returns 9-of-13 or 5-of-13 today; Anytype hides no format anywhere, and `row-menu.ts` already sets our precedent — disable with a reason rather than remove | Our type-migration semantics in `ColumnRenameModal` (untouched). **Anytype's list order is not taken** — half its formats (URL, email, phone) we do not have and half of ours (currency, computed, rollup, status, files) it does not |
| A7 | **No equivalent — stays ours**: formulas, rollups, aggregations | **Not seen, and the absence is the evidence.** Scanned all 156 root, 600 menu and 118 iOS captures: **no formula, no rollup, no aggregation surface anywhere.** The 12 `menus/anytype-menu-cell-*` editors cover eleven formats plus type, none of them computed. `screenshots/anytype/README.md`: "formula and rollup carry no values, and cannot. Anytype has neither" | Nothing. ADR-003 is confirmed rather than re-litigated | The formula workbench (S7), the 12 aggregations, the output-number-format editor. Their only change from this phase is consuming P7 for their existing type dropdowns (REQ-005) — wiring, not design |

**The operator's keep-list, restated as constraints:** the table, the bottom sheets' ownership
(`003`/`016`/`031`), formulas/rollups/calculations, and the Project Manager 1:1 board and gantt.
Everything else in this family may take the Anytype pattern when the captures show it is better, and
must come out as a shared primitive — one component, many callers.

<!-- /ANCHOR:anytype-behaviours -->

---



---

<!-- ANCHOR:mobile-reconciliation -->
## 5D. RECONCILIATION, 2026-09-05 (later): the iOS simulator captures landed

`964a0b2a` landed **118 files — 59 states in light and dark — of Anytype's official open-source iOS
client**, built from source and run on a simulator, under `screenshots/anytype/mobile/`, against the
same 326-record demo space the desktop captures used. Real iOS chrome, not the desktop app narrowed.
Each carries a written description in `screenshots/anytype/README.md`.

**This is the packet whose §5B gains the most**, because seven of its rows were designed against a
capture index and two stood on `047`'s source read alone. The pixels are unread here — this landing
pass could not open images — so what follows names the file each row should now be trued against.
T001 opens them.

**T001 opened them, 2026-09-05 (later).** The table below stands as the routing it was written to be,
and every prediction in it held except two. **A4's prediction was right and its conclusion was
wrong**: the file does show a Header-versus-Properties-panel split rather than visible-versus-hidden,
and T001's answer to "which model this packet wants" is *neither adopted* — REQ-003 stays ours,
because Anytype's axis is a type-level authoring decision and goal D6 puts a type system out of
scope. **A2's prediction that the iOS panel is "S1's exact analogue" is the one thing this section
got wrong**: the desktop and iOS panels are two different designs, not one design at two widths
(`design-trueup.md` C6), and the desktop one is the further from ours. The per-format editor
inventory at the foot of this section is confirmed and reduced to **three shells over eleven formats
plus one toggle** in `design-trueup.md` §4.

| §5B row | Was | Now readable in |
|---|---|---|
| **A1 object-page header block** | `anytype-object-page-empty-dark.png`, desktop, empty | `anytype-mobile-object-page` — "Record page: title, type, backlink count, empty body", on the form factor the record sheet actually ships on |
| **A2 relation row layout** | `anytype-relation-editor-tag-dark.png` plus a marketing image | `anytype-mobile-sheet-object-properties` — "the record's relations panel, every catalogue column with its value". This is S1's exact analogue |
| **A3 empty value affordance** | An *empty* Tag relation clicked open | `anytype-mobile-sheet-cell-multiselect-empty` — **"No options — create first option to start"**, and `anytype-mobile-sheet-cell-email-empty` and `anytype-mobile-sheet-grid-cell-objecttype-empty`. Three empty-value screens where the packet had one, and the multi-select one names the create action rather than the absence — which is a better model than the word "Empty" *and* better than a bare affordance |
| **A4 hidden relations group** | `anytype-properties-official.jpg`, a marketing image | `anytype-mobile-sheet-object-properties-settings` — "the **type's** property editor — Header vs Properties panel, drag handles, `+`". Note what that says: Anytype's split is **Header versus Properties panel**, not visible-versus-hidden. That is a different model from REQ-003's and T001 should decide which one this packet wants before P5 is written |
| **A5 add-relation search-first** | **Corrected at landing to code-derived** — the desktop filter panel's whole body is one `+ New filter` row | `anytype-mobile-sheet-relation-add` — "Add property: **all eleven formats** — Relation object, Text, Number, Select, Multi-select, Date, File & Media, Checkbox, URL, Email, Phone number" — then `anytype-mobile-sheet-relation-new` ("Name, Format, Create") and `anytype-mobile-sheet-relation-new-format`. **A5 moves from code-derived back to captured**, on the phone |
| **A6 type change flow** | `anytype-newobject-type-picker-dark.png` | `anytype-mobile-sheet-relation-new-format` — "Select property format, current one ticked" |
| **A7 formulas/rollups stay ours** | The README's mapping table | Unchanged and confirmed by omission: none of the 59 mobile states shows a formula, a rollup or an aggregation |

**And the row this packet did not have at all.** §5A's **S9, the cell editors** — the ten surfaces
this phase exists to extract — now have **one captured Anytype counterpart per format**:
`anytype-mobile-sheet-cell-text-longtext` (inline editor with Clear), `-number`, `-select-priority`
(search, options in their colours, tick on the current one), `-multiselect-team` (**ordered selection
badges 1, 2** and coloured chips), `-multiselect-empty`, `-date` (month calendar, selected day,
Today / Tomorrow / Open selected date), `-date-monthpicker` (the month/year wheel),
`-object-assignee` (searchable object list with radio selection), `-backlinks` (read-only),
`-url`, `-phone`, `-email-empty`. **Twelve editor screens against ADR-002's ten extractions.** This
is the reference the extraction legs should be read against — not to copy, since ADR-002 forbids a
behavioural edit inside a move, but to know what the target grammar looks like before the move.

**One caveat that survives.** The iOS client ships **no Calendar and no Graph layout at all**, so
its surface set is narrower than the desktop's rather than a translation of it. A phone screen is
not the desktop screen's authority.
<!-- /ANCHOR:mobile-reconciliation -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | `renderCardField` has four callers beyond this family (board renderer, gallery remnants, bulk paths) | Moving its anatomy breaks surfaces this phase does not own | P2 is extracted beside it; `card-field-renderer.ts` becomes a re-export shim; its callers are re-run through the lane before close, and the board's `038` parity captures are re-read (goal D5 posture) |
| Risk | The per-type editor extraction touches the largest file in the family (3,152 lines) | A behavioural regression in editing, the plugin's core loop | Extraction is mechanical — the private method bodies move; `startEdit`'s dispatch contract is pinned by a unit test first (red: no exported editors) |
| Risk | The properties panel's desktop header is hand-built today and operator-verified there | Switching it to the primitive changes desktop chrome | P1 has a desktop variant pinned to the current desktop geometry; the lane asserts the desktop panel's rect is unchanged |
| Risk | `styles.css` is shared by the whole program | Merge collisions and silent overrides | The parent's serialized CSS lane; one leg at a time, retired per-surface duplicates named in each leg |
| Risk | Six capture files describe states the model behind this document could not open | A design adopted from a prose summary rather than the image | Goal D1: T001 opens every named image by hand before the adopting primitive lands; a capture that cannot be opened is recorded as a gap in `migration-table.md`, never silently consumed |
| Dependency | `048`'s stacked-pair grammar rows | The editors this phase extracts are the children in those pairs | This phase registers no stacking rows; the lane rows it adds assert primitive identity, not stacking |

<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:050-overlap -->
## 5C. OVERLAP WITH 050-ANYTYPE-ADOPTION

Referenced by item number, not duplicated. `050` owns each item whole; this phase implements only
the record-surface slice named here and `050`'s own files stay the item's home.

| 050 item | What it owns | What this phase takes from it |
|----------|--------------|-------------------------------|
| **Item 6** (REQ-006: cell-editor anti-clip flip within 92px of the right edge) | The `popover-position.ts` flip branch, all cell editors | S9's extracted editor primitives call the shared placement, which carries the flip; no editor primitive reimplements an edge check |
| **Item 9** (REQ-009: two-flavour empty state + deleted-relation state) | `empty-state-renderer.ts`, view-level | The record sheet's empty-property affordance (REQ-004) uses the flavour vocabulary — "no value" is a value-level state, not a view-level one — and must not grow a third empty-state grammar |
| **Item 11** (REQ-011: `positionLock` while a name is typed in a sorted view) | `table-renderer.ts` (and view-level stores) | S1's title rename goes through `editFileName` (`cell-renderer.ts:2992`) into the same commit path; when `050` lands the lock, the record sheet's rename inherits it — nothing here duplicates the lock |

**050's capture-alignment gate (D1) binds this phase by reference**: where this phase adopts an
Anytype pattern, its design is trued against the same sweep. The named captures in §5B are the
record-surface slice of that obligation.

<!-- /ANCHOR:050-overlap -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The editor extraction adds no render cost: `startEdit`'s dispatch becomes one module
  lookup per type, not a per-keystroke cost, and the relation list's virtualization window
  (`rowHeight 34`, `windowSize 80`, `cell-renderer.ts:963-965`) is carried into the relation editor
  primitive unchanged.
- **NFR-P02**: The record sheet's property rows keep their current DOM depth per row; P2 replaces
  class names and builders, not the row's node count.

### Security
- **NFR-S01**: No new network call, credential, or read outside the vault. Every primitive renders
  and edits values the data layer already exposes.

### Reliability
- **NFR-R01**: A primitive that cannot resolve its column — a deleted property still referenced by
  a saved view — renders its muted/empty variant rather than throwing, the way `renderProperty`
  already degrades.
- **NFR-R02**: The note-body region's draft survives a refresh mid-edit, as today
  (`record-detail-panel.ts:309-319`); the formalization may not regress `note-body-region.test.ts`.

<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Empty input: a record with zero non-title columns renders the header, the add-property affordance
  and the body region — never a blank sheet.
- Maximum length: a property label longer than the row's label track truncates with ellipsis; the
  value keeps its full width.
- Invalid format: a column whose type was removed from the plugin renders through P2's muted
  variant with its raw stringified value, the way the peek degrades today.

### Error Scenarios
- A relation column whose target database was deleted: the relation editor primitive renders
  `relation.targetDatabaseRequired`'s state (today a `Notice`, `cell-renderer.ts:912-915`) inside
  the editor rather than leaving the row inert.
- A type-picker consumer whose list was filtered (rollup without a relation, `create-property-modal.ts:139-150`):
  the picker renders the gated format disabled with its reason, as today.

### State Transitions
- Partial completion: a hidden-properties group toggled open stays open across a field-commit
  refresh (`renderContent` re-runs on every commit, `record-detail-panel.ts:332-341`) — the group's
  expanded state is carried across the rebuild, the way the body draft is.
- Rotation across the touch boundary while the sheet is open: `DbModal.applyPresentation` re-reads
  (`db-modal.ts:97`); the record sheet's own re-place behaviour is `010`'s and is not reopened.

<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 16/25 | 19 files touched, ~1,800 LOC estimated, but most of it is extraction into new modules rather than new behaviour; `recommend-level.sh --loc 1800 --files 14` → 50/100, Level 2, confidence 90% |
| Risk | 12/25 | No auth, no API, no data. The risk is editing — the core loop — which the pinned dispatch test bounds |
| Research | 4/20 | The research is `047`'s and the captures exist; what remains is the image true-up |
| **Total** | **32/70** | **Level 3** — the script returns Level 2 at **50/100, confidence 90%** (`recommend-level.sh --loc 1800 --files 14`); **raised on judgment at landing 2026-09-05**, the same call `050`, `051`, `052`, `053` and `055` made at comparable numbers. The tie-breaker is ADR-002's extraction: no other packet in the family moves method bodies out of a 3,152-line class that no check can mount today. Phase score **10/50** against a 25 threshold, so a standard child, not a phase parent |

<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 10. OPEN QUESTIONS

**All three are answered at T001**, from the captures where the captures reach and from our own tree
where they do not. `design-trueup.md` §5 carries the reasoning; the answers are recorded here.

- ~~Does the record sheet's desktop anchored panel keep its own close button (today
  `db-cell-edit-close`, CSS-hidden on desktop) or does P1 give the desktop panel the peek's
  no-chrome header?~~ **ANSWERED: desktop keeps today's DOM, asserted by the lane** — the proposed
  answer, unchanged. With one addition that moves part of this question out of the packet: **the
  desktop panel's placement is `006-record-open-target`'s, not P1's.** That packet's in-flight work
  (worktree `085-record-open-dock`) adds AC-014 and AC-015 against a measured red of **72px tall at
  `top 12 · bottom 84` on a 900px viewport** when the affordance carries no anchor. P1 changes the
  header's DOM and nothing about where the panel lands; any placement assertion this packet's lane
  makes must **read `006`'s stated `placement` field rather than measure a box**, or two packets will
  assert different answers about one surface.
- ~~Does P3's search-first picker replace S3's quick-add file-field row or sit beside it?~~
  **ANSWERED: beside.** The captures supply the reason the proposal lacked — Anytype's add-property
  picker leads with `Properties formats` and puts `Existing properties` second, so the format
  question comes first. `QUICK_ADD_FILE_FIELDS` is a shortcut *past* that question for a fixed known
  set; it skips the picker rather than competing with it.
- ~~Should the board card gain the add-property affordance (A3)?~~ **ANSWERED: no button, yes the
  prompt.** A grid cell — the densest surface — renders nothing for an empty value, and a board card
  is nearer a grid cell than a property list. But the format-specific prompt costs one string and is
  what keeps SC-001's "reads identically on every surface" true, so `renderCardField`'s
  `is-empty-field` path gains it on both consumers and **no add button lands on a card**. This also
  keeps the change inside the `card-field-renderer.ts` shim rather than reaching into
  `board-renderer.ts`, whose `038` parity captures goal D5 protects.

<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decision Record**: See `decision-record.md`
- **Migration Table**: See `migration-table.md` (created by T003, the §6 deliverable)
- **Packet Goal**: See `goal.md`
- **Research Source**: See `../047-competitor-references-and-pm-alignment/research/research.md` §7, §9
- **Capture Index**: See `screenshots/anytype/README.md`
