---
title: "Coverage Audit: Every Sheet, Panel, Popover and Dropdown Against the 076 Children"
description: "Cross-references tools/storybook/sheet-inventory.mjs's 87-surface list (071/001) against 076 children 001-012, names every gap, and records the seven new children (013-019) scaffolded to close them."
trigger_phrases:
  - "076 coverage audit"
  - "sheet dropdown coverage"
  - "every sheet inventorized"
  - "076 gap analysis"
importance_tier: "critical"
contextType: "planning"
---

# Coverage Audit: Every Sheet, Panel, Popover and Dropdown Against the 076 Children

Run at 2026-09-11 ~05:37 from the operator's instruction (verbatim, 2026-09-11 ~05:35): *"Double
check we have inventorized every sheet / dropdown. And each ine has dedicated multi phased ohase
with oroper planning based on screenshots embedded in phase plan of that sheets multi ohased spec
etc."* Generator: `node tools/storybook/sheet-inventory.mjs`, rewritten this session to
`specs/005-component-surface-system/071-sheet-notion-anytype-alignment/001-sheet-story-coverage-audit/inventory.md`
(87 surfaces: 55 primary + 32 stacked).

---

## 1. METHOD

1. Ran the generator; read the regenerated `071/001/inventory.md` in full (87 rows).
2. Read every `076` child's (`001`-`012`) `spec.md` §3 "Producers" list to know exactly which
   `src/views/*.ts` files it already claims.
3. Matched every inventory row's producer file to a `076` child, or marked it `NONE`.
4. For each `NONE` row, grouped by shared renderer/reference family (the operator's own rule: split
   when surfaces have different references or different renderers; bundle when they share both) into
   the smallest number of new children that still gives each surface a real DEFINE table.
5. Incorporated two operator-reported additions delivered mid-audit (2026-09-11 05:36-05:38): board
   visual parity (ClickUp) and board card drag feel (ClickUp), each already carrying its own
   operator screenshot and notes file under `scratchpad/loop/`.

Desktop dropdowns are in scope per the operator's own words ("sheet / dropdown"): the inventory's
"Phone presentation" column names the phone-specific class a producer *earns* (bottom-sheet), not a
separate desktop surface — the same producer renders the desktop anchored-popover baseline by
default. Desktop coverage therefore rides the same children as phone coverage wherever a producer is
already claimed; no row below needed a desktop-only split.

---

## 2. THE COVERAGE TABLE

Legend: **Child** = the `076` phase claiming this surface's producer. **NONE** = no `076` child
claims it before this audit. **Split?** = whether this audit gave the surface its own new child
(Y) or folded it into a bundle with others (bundle name) or left it inside an existing child's
scope unchanged (existing child number).

### Primary surfaces (55)

| # | Surface | Platform | Mount path (producer) | Capture scenario id | Operator screenshot on file | Child |
|---|---------|----------|------------------------|----------------------|------------------------------|-------|
| 1 | Settings sheet | phone+desktop | `src/views/view-config-panel-renderer.ts` | `panel-view-config`, `panel-view-config-sheet` | none captioned for this row specifically (`0040-settings-sheet-cards-typography.png` is 001-adjacent, already in 001's scope) | 001 |
| 2 | Add-property / property-type picker | phone+desktop | `src/views/modals/create-property-modal.ts`, `record-surface/type-picker.ts` | `constructed-depth3-property-type-picker*` | `ios-add-property-sheet-0032.png` (071/001's own evidence row) | 007 |
| 3 | sort-panel | phone+desktop | `src/views/sort-panel-renderer.ts` | `panel-sort-calendar-empty`, `panel-sort-rules` | none | 004 |
| 4 | filter-panel | phone+desktop | `src/views/filter-panel-renderer.ts` | `panel-filter-conditions`, `panel-filter-nested-group` | `0040-filter-property-picker-padding.png` | 003 |
| 5 | group | phone+desktop | `src/views/toolbar-renderer.ts` | `chrome-toolbar`, +7 | none | 005 |
| 6 | add-view | phone+desktop | `src/views/toolbar-renderer.ts` | `add-view-popover`, `constructed-toolbar-add-view` | none | 006 |
| 7 | record-detail | phone+desktop | `src/views/record-detail-panel.ts` | `panel-record-detail*`, +2 | none | 008 |
| 8 | record-peek | phone+desktop | `src/views/table-record-peek.ts` | `panel-record-peek` | none | 008 (peek mounts the record sheet on touch; see §3) |
| 9 | column-width | phone+desktop | `src/views/column-width.ts` | `constructed-column-width-adjuster*`, `panel-column-width-sheet` | none | 011 |
| 10 | column-manager | phone+desktop | `src/views/column-manager-renderer.ts` | `panel-column-manager` | `constructed-column-manager-mobile-light.png` | 002 |
| 11 | **board-card-properties** | phone+desktop | `src/views/board-card-properties-panel.ts` | `constructed-board-card-properties*`, `panel-board-card-properties` | none | **NONE -> 013** |
| 12 | owned-menu | phone+desktop | `src/views/owned-menu.ts` | `chrome-owned-menu*`, +1 | `0040-cell-menu-no-handle.png`, `0040-column-menu-close-but.png` | 009 |
| 13 | date-picker | phone+desktop | `src/views/date-value-picker.ts` | `constructed-date-picker*`, +3 | none | 010 |
| 14 | icon-picker | phone+desktop | `src/views/icon-picker-popover.ts` | `field-icon-picker` | none | 010 |
| 15 | option-color-picker | phone+desktop | `src/views/option-color-picker.ts` | `constructed-option-color-picker`, `field-option-color-picker` | none | 010 |
| 16 | confirm | phone+desktop | `src/views/confirm-sheet.ts`, `modals/confirm-modal.ts` | `constructed-depth3-import-confirm-dropdown`, +2 | `0040-cell-menu-no-handle.png` (adjacent) | 009 |
| 17 | **base-file-suggest** | phone+desktop | `src/main.ts:3061` | none | none | **NONE -> 014** |
| 18 | **image-file-suggest** | phone+desktop | `src/views/image-file-suggest-modal.ts` | none | none | **NONE -> 014** |
| 19 | **markdown-file-suggest** | phone+desktop | `src/views/markdown-file-suggest-modal.ts` | none | none | **NONE -> 014** |
| 20 | toolbar-utilities (overflow) | phone+desktop | `src/views/toolbar-renderer.ts` | `chrome-utilities-popover`, `constructed-toolbar-utilities` | `toolbar-labelled-buttons-reference.png` (adjacent) | 011 |
| 21 | toolbar-tab-menu (overflow) | phone+desktop | `src/views/toolbar-renderer.ts` | `add-view-popover`, +7 | `0036-toolbar-vertical-scroll.png` (adjacent) | 011 |
| 22 | filter-panel-nested (overflow) | phone+desktop | `src/views/filter-panel-renderer.ts` | `chrome-active-rule-popover-filter`, +4 | `constructed-active-rule-filter-mobile-light.png` | 003 |
| 23 | sort-panel-calendar-hint (overflow) | phone+desktop | `src/views/sort-panel-renderer.ts` | `chrome-active-rule-popover-sort`, +3 | none | 004 |
| 24 | record-detail-docked (overflow) | desktop | `src/views/record-detail-panel.ts` | `constructed-record-detail-docked`, +6 | none | 008 |
| 25 | active-rule-filter (overflow) | phone+desktop | `src/views/active-rule-popover-renderer.ts` | `chrome-active-rule-popover-filter`, `constructed-active-rule-filter` | none | 003 |
| 26 | active-rule-sort (overflow) | phone+desktop | `src/views/active-rule-popover-renderer.ts` | `chrome-active-rule-popover-sort`, `constructed-active-rule-sort` | none | 004 |
| 27 | **cell-editor-text** (overflow) | phone+desktop | `src/views/cell-renderer.ts` | `constructed-cell-editor-text`, +9 | none | **NONE -> 015** |
| 28 | **cell-editor-select** (overflow) | phone+desktop | `src/views/cell-renderer.ts` | `constructed-cell-editor-select`, +9 | none | **NONE -> 015** |
| 29 | date-picker-datetime (overflow) | phone+desktop | `src/views/date-value-picker.ts` | `constructed-date-picker-datetime` | none | 010 |
| 30 | dropdown (overflow) | phone+desktop | `src/views/dropdown-field.ts` | `constructed-dropdown*` | none | Shared primitive — covered contextually by 003/004/006/007 wherever it appears; not a standalone gap |
| 31 | **calendar-toolbar-options** | phone+desktop | `src/views/calendar-toolbar-renderer.ts` | none | none | **NONE -> 016** |
| 32 | **timeline-toolbar-options** | phone+desktop | `src/views/calendar-timeline-toolbar-renderer.ts` | none | none | **NONE -> 016** |
| 33 | **chart-toolbar-options** | phone+desktop | `src/views/chart-toolbar-renderer.ts` | none | none | **NONE -> 016** |
| 34 | **mini-calendar-popover** | phone+desktop | `src/views/calendar-mini-calendar-renderer.ts` | `constructed-date-picker*` (shared) | none | **NONE -> 016** |
| 35 | **CsvMarkdownImportModal** | phone+desktop | `src/main.ts:2915` | none | none | **NONE -> 017** |
| 36 | **TrashManagerModal** | phone+desktop | `src/settings.ts:583` | none | none | **NONE -> 017** |
| 37 | **AddDatabaseModal** | phone+desktop | `src/views/modals/add-database-modal.ts` | none | none | **NONE -> 017** |
| 38 | **BaseImportConfirmModal** | phone+desktop | `src/views/modals/base-import-confirm-modal.ts` | `panel-base-import-modal` | none | **NONE -> 017** |
| 39 | **ColumnRenameModal** | phone+desktop | `src/views/modals/column-rename-modal.ts` | `constructed-modal-sheet-property-editor*` | none | **NONE -> 017** |
| 40 | **ComputedFrontmatterCleanupModal** | phone+desktop | `src/views/modals/computed-frontmatter-cleanup-modal.ts` | `panel-computed-cleanup-modal` | none | **NONE -> 017** |
| 41 | **CreateLinkedViewModal** | phone+desktop | `src/views/modals/create-linked-view-modal.ts` | none | none | **NONE -> 017** |
| 42 | **CreateRecordIconFieldModal** | phone+desktop | `src/views/modals/create-record-icon-field-modal.ts` | none | none | **NONE -> 017** |
| 43 | **CsvMarkdownExportModal** | phone+desktop | `src/views/modals/csv-markdown-export-modal.ts` | none | none | **NONE -> 017** |
| 44 | **DeleteDatabaseModal** | phone+desktop | `src/views/modals/delete-database-modal.ts` | none | none | **NONE -> 017** |
| 45 | **FormulaModal** | phone+desktop | `src/views/modals/formula-modal.ts` | none | none | **NONE -> 017** |
| 46 | **InvalidTimeEventsModal** | phone+desktop | `src/views/modals/invalid-time-events-modal.ts` | `panel-invalid-events-modal` | none | **NONE -> 017** |
| 47 | **PropertyTypeConflictModal** | phone+desktop | `src/views/modals/property-type-conflict-modal.ts` | none | none | **NONE -> 017** |
| 48 | **RelationRollupConfigModal** | phone+desktop | `src/views/modals/relation-rollup-config-modal.ts` | none | none | **NONE -> 017** |
| 49 | **StatusOptionsModal** | phone+desktop | `src/views/modals/status-options-modal.ts` | none | none | **NONE -> 017** |
| 50 | **StatusPresetManagerModal** | phone+desktop | `src/views/modals/status-preset-manager-modal.ts` | none | none | **NONE -> 017** |
| 51 | **Trash restore-confirm** | phone+desktop | `src/settings.ts:680` | none | none | **NONE -> 017** |
| 52 | **ChartDrilldownModal** | phone+desktop | `archive/deprecated-views/chart/chart-renderer.ts` | none | none | **NONE -> 017** (live/archived status to be confirmed at 017's T002) |
| 53 | **Toast** | phone+desktop | `src/views/toast.ts` | `chrome-toast-error`, `chrome-toast-success` | none | **NONE -> 017** |
| 54 | **ColumnMenu** | phone+desktop | `src/views/column-menu.ts` | none | `0040-column-menu-close-but.png` (adjacent) | 009 |
| 55 | **Bulk-edit field menu** | phone+desktop | `src/views/bulk-edit-field-menu.ts` | none | none | **NONE -> 017** |

### Stacked / paired children (32)

| # | Surface | Parent | Child (of the parent's own 076 owner) |
|---|---------|--------|----------------------------------------|
| 56 | filter property picker | filter-panel | 003 |
| 57 | filter operator picker | filter-panel | 003 |
| 58 | filter select value picker | filter-panel | 003 |
| 59 | filter checkbox value picker | filter-panel | 003 |
| 60 | filter conjunction picker | filter-panel | 003 |
| 61 | filter date value picker | filter-panel | 003 |
| 62 | sort field picker | sort-panel | 004 |
| 63 | sort direction picker | sort-panel | 004 |
| 64 | properties create property | column-manager | 007 (opens `CreatePropertyModal`) |
| 65 | properties edit property | column-manager | 007 (judgment call — see §3) |
| 66 | properties property type picker | column-manager | 007 |
| 67 | properties column overflow menu | column-manager | 009 (`ColumnMenu` family) |
| 68 | settings dropdown field | view-config | 001 |
| 69 | settings ad hoc dropdown | view-config | 001 |
| 70 | settings icon picker | view-config | 001 (host context; primitive is 010) |
| 71 | **settings template file picker** | view-config | **NONE -> 014** |
| 72 | **settings cover image picker** | view-config | **NONE -> 014** |
| 73 | record select value menu | record-detail | 008 |
| 74 | record date editor | record-detail | 008 |
| 75 | record relation editor | record-detail | 008 |
| 76 | record option colour picker | record-detail | 008 |
| 77 | record column context menu | record-detail | 009 (menu-card family) |
| 78 | record column submenu | record-detail | 009 |
| 79 | add view property picker | toolbar | 006 |
| 80 | all views overflow menu | toolbar | 011 |
| 81 | confirm over a sheet | filter-panel | 009 |
| 82 | **import confirm dropdown chain** | filter-panel | **NONE -> 017** (shares `CsvMarkdownImportModal`'s family) |
| 83 | **chart option dropdown** | toolbar | **NONE -> 016** |
| 84 | **calendar option dropdown** | toolbar | **NONE -> 016** |
| 85 | **timeline option dropdown** | toolbar | **NONE -> 016** |
| 86 | group by dropdown | toolbar | 005 |
| 87 | **timeline event menu** | toolbar | **NONE -> 016** (provisional; may reclassify to 009, see 016 §12) |

---

## 3. SPLIT-VS-BUNDLE RATIONALE

Per the operator's own rule: split when surfaces have different references or different renderers;
bundle when they share both.

| New child | Surfaces bundled | Why bundled, not split |
|---|---|---|
| **013** board-card-properties | 1 | Standalone — distinct renderer (`board-card-properties-panel.ts`) and distinct reference set (Notion-only) from both `012` (card CSS) and `002` (record/table column manager); a genuine gap, not a bundle |
| **014** fuzzy-suggest sheets | 5 | All five are `FuzzySuggestModal` instances routed through one `createSurfaceShell` chrome (pending T001 confirmation) and share the same reference family (Anytype desktop palette, structurally mismatched for all five equally) |
| **015** cell-editor popovers | 2 | Both editor kinds share one mount point (`cell-renderer.ts:601`) and the same reference family (Anytype mobile cell sheets), differing only in control kind |
| **016** view-toolbar options | 4 (+4 stacked) | All four renderers share a "view's own toolbar opens its own options popover" shape, even though only the calendar/mini-calendar pair has an external reference — bundled on renderer similarity, per the operator's own precedent elsewhere in `076` (e.g. `009` bundles menu+confirm on shared chrome, not shared reference) |
| **017** utility DbModal sheets | 18 (+2 non-modal, +1 stacked) | All inherit one shared `DbModal` presentation and all carry zero reference of any kind — splitting 18 near-identical zero-reference surfaces into 18 phases would multiply paperwork without multiplying evidence; bundled explicitly, with the shared-chrome claim itself as T001's first task to falsify before any edit |
| **018** board visual parity (ClickUp) | 1 (header/body/anatomy) | Operator-reported, own reference (ClickUp), distinct scope from `012` (single-column field rule, stands) and `013` (property-visibility mechanism) |
| **019** board card drag feel (ClickUp) | 1 (drag interaction) | Operator-reported, own reference (ClickUp), a motion/interaction surface — a fundamentally different evidence shape (mid-drag capture, DOM-state lane) from every static-frame child, so it does not fold into `018` |

**Judgment calls flagged, not silently resolved:**
- Row 65 ("properties edit property") is assigned to `007` provisionally; it may instead be
  `ColumnRenameModal` (`017`'s bundle) depending on which modal the "edit" action actually opens —
  `007`'s own T-series or `017`'s T001 should confirm and correct this table if wrong.
- Row 87 ("timeline event menu") is provisionally placed in `016` rather than `009`; `016` §12
  carries this explicitly as an open question for its own T004 to resolve.
- Row 30 ("dropdown", the generic listbox primitive) and row 8 ("record-peek") are marked covered
  contextually rather than gaps: `dropdown-field.ts` has no independent visual identity outside the
  sheets that host it, and `record-peek` mounts the record sheet itself on touch (071/001's own
  inventory note). Neither was split into its own child.

---

## 4. SURFACES WITH NO REFERENCE OF ANY KIND

`071/001/inventory.md`'s own summary line: **47 rows carry no reference of any kind.** Of those, this
audit's new children account for the concentrated majority:

- **017** (utility DbModal sheets): 18 of the 47 — the single largest share, every row `none/none`
- **014** (fuzzy-suggest sheets): 5 rows `none/none` for Notion+ClickUp; Anytype's desktop palette is
  the only partial reference, and it is a form-factor mismatch (desktop palette vs. phone sheet)
- **015** (cell-editor popovers): both rows have an Anytype reference, but it is a full-sheet family
  against an inline-popover surface — a structural mismatch, not a true zero
- **016** (view-toolbar options): 3 of 4 primary rows plus all 4 of their stacked children are
  `none/none` (timeline, chart, and their option dropdowns; only calendar/mini-calendar have a
  reference)

Remaining `none/none` rows outside this audit's new children's scope (already inside an existing
`001`-`012` child's DEFINE table, unaffected by this audit): `group`, `add-view`,
`toolbar-tab-menu`, `column-width`, `confirm`, `properties create/edit property` (stacked),
`properties property type picker`/`column overflow menu` (stacked), `settings dropdown field`/`ad
hoc dropdown` (stacked), `record column context menu`/`submenu` (stacked), `date-picker-datetime`.
These were already claimed by an existing child before this audit and are not renumbered here; each
child's own DEFINE table is the authority on how it resolves its own zero-reference rows.

---

## 5. CHILDREN SCAFFOLDED THIS SESSION

| Child | Title | Bundled surfaces | Primary reference |
|---|---|---|---|
| 013 | Board Card Properties Sheet Visual Parity | 1 | Notion (properties list), ClickUp (row anatomy) |
| 014 | Fuzzy File-Suggest Sheets Visual Parity | 5 | Anytype (structural only) |
| 015 | Inline Cell-Editor Popovers Visual Parity | 2 | Anytype (structural only) |
| 016 | View-Specific Toolbar Option Popovers Visual Parity | 4 primary + 4 stacked | Notion + Anytype (calendar/mini-calendar anchor only) |
| 017 | Utility DbModal Sheets Visual Parity | 18 primary + 2 non-modal + 1 stacked | None — internally derived from `001`-`016`'s landed grammar |
| 018 | Board Visual Parity (ClickUp) | Board header/body/card-anatomy | ClickUp (operator screenshot + words) |
| 019 | Board Card Drag Feel (ClickUp) | Board drag interaction | ClickUp (operator screenshot + words) |

Each carries the sibling six-document set (`spec.md`, `plan.md`, `tasks.md`,
`acceptance-criteria.md`, `goal.md`, `verification.md`), follows the 076 frame ruling (no card
containers, dividers on the plain sheet background), and has ≤14 write-first tasks across the same
six-step loop (DEFINE, PLAN, CREATE, SCREENSHOT, VERIFY, REMEDIATE) as `001`-`012`.

Operator screenshot references are mirrored into
`scratchpad/loop/<child>/operator-notes.md` for each of the seven, so the loop planners see them
without re-deriving this audit.
