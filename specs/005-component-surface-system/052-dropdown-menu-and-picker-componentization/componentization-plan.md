---
title: "Componentization Plan: Dropdown, Menu and Picker Migration Table"
description: "One row per menu, dropdown, popover and picker surface in the family: surface, the primitive it lands on, the concrete changes, the Anytype pattern it takes with its capture, and what stays ours."
trigger_phrases:
  - "componentization plan"
  - "migration table"
  - "052 migration"
  - "surface to primitive"
  - "menu migration"
importance_tier: "high"
contextType: "planning"
---
# Componentization plan — the migration table

Every surface in the floating-surface family, dispositioned. Census method: `grep -rn` over
`src/views/` and `src/` on today's tree, counts stated per row. Shorthand:

- **Menu primitive** = `owned-menu.ts` + `menu-row.ts` (container, rows, sections, separators,
  checkmarks, `warning` tone, keyboard nav, phone sheet via `applySheetChrome`).
- **Select picker** = `dropdown-field.ts` (`createDropdownField`/`openDropdownMenu`), the shared
  listbox with search, sections, icons, `preserveValueOnSelect`.
- **Picker host** = the new shared host (search, active-picker registry, phone header, grid nav,
  width roles) extracted in REQ-003.
- **Grammar refs** (G1-G16) point into `anytype-menu-grammar.md`.

## 1. The menu primitive's own surface list

| # | Surface | Producer (file:line) | Primitive | Changes | Anytype pattern | Stays ours |
|---|---------|----------------------|-----------|---------|-----------------|------------|
| M1 | Row context menu (table/list/board/gallery/calendar/timeline/embedded) | `row-menu.ts:80` via `createOwnedMenu`; consumed by 7 renderers (`table-renderer.ts:930`, `board-renderer.ts:777`, `gallery-renderer.ts:402`, `calendar-renderer.ts:2354`, `calendar-timeline-renderer.ts:3845`, `embedded-database-renderer.ts:2480`, `list` retired) | Menu primitive | None to markup — already canonical. Gains: the never-empty fallback (G3) and capability-gate helpers shared with `050` item 8 | G2, G3, G6 (`anytype-object-more-menu-dark.png`) | Its action set; delete flow stays our confirm modal |
| M2 | Column header context menu | `column-menu.ts:95` `createOwnedMenuForEvent`, title `col.label` | Menu primitive | Rows already via `addRow`; its **submenus move from hand-built subpopovers to the primitive's submenu handle** (see M3-M5) | G1, G9 | Its action set; 292px width |
| M3 | Column type submenu | `column-menu.ts:224-255` opens `showColumnTypePopover` (`:186-219`) | Menu primitive submenu | Rebuild as a primitive submenu: sections + checkmark + property-type icons already match; the hand-built `db-dropdown-option` rows (`:192-218`) become `addRow` | G9, G12 | Type list and grouping (Basic/Options/Advanced) — ours |
| M4 | Number display style submenu | `column-menu.ts:257-320` `showNumberDisplayStylePopover` | Menu primitive submenu + picker host | The rating/progress/ring option rows keep their bespoke controls (emoji input, divisor, colour swatches) — these are **formulas-adjacent display config and stay ours**; only the style list becomes primitive rows | G9 | The option controls themselves (G-declined: no Anytype equivalent) |
| M5 | Text render mode submenu | `column-menu.ts:386-431` `showTextRenderModePopover` | Menu primitive submenu | Plain/link/markdown + link-scheme rows become primitive rows with checkmarks; the hand-built back button dies with the old lifecycle | G9, G14 | Scheme list |
| M6 | All-views hub "more" menu | `toolbar-renderer.ts:1169` `createOwnedMenu` | Menu primitive | None — already canonical; verify the fallback row (G3) when the hub's row set empties | G3 | — |
| M7 | View-tab context menu | `toolbar-renderer.ts:1229` `showViewTabMenu` — hand-built `db-view-tab-popover` panel + hand-rolled rows | Menu primitive | **Migrate the panel to `createOwnedMenu`**; rows via `addRow`. `050` item 4 lands duplicate/rename/remove here — the substrate migration is this phase's | G1, G5, G6 | Move-to-first/last touch rows (`:1263-1273`) |
| M8 | View-type change menu | `toolbar-renderer.ts:1301` `openDropdownMenu` | Select picker | None — already shared; width follows REQ-007's preset mapping | G12 | — |
| M9 | Record icon context menu | `database-view.ts:5361` `createOwnedMenuForEvent` | Menu primitive | None — canonical; title fallback chain verified | G6 | — |
| M10 | Board group/card menus | `board-renderer.ts:777`, `:1763` | Menu primitive | None — canonical | G1 | Group option set |
| M11 | Calendar day/event menu | `calendar-renderer.ts:2354` | Menu primitive | None — canonical | — | — |
| M12 | Timeline/gantt row menu + depends-elsewhere chip menu | `calendar-timeline-renderer.ts:3845`, `:996` (the former `new Menu()` site, now owned) | Menu primitive | None — canonical. **Gantt reference parity (`037`)**: recapture + read if a leg moves a pixel | G3 | The gantt surface itself — kept ours |
| M13 | Gallery card menu | `gallery-renderer.ts:402` | Menu primitive | None — canonical | — | — |
| M14 | Utilities/kebab, title actions, database switcher, add-view, export, new-template, group-by panels | `toolbar-renderer.ts:407` (`:434`), `:770`, `:589`/`:592`, `:1360` (`:1426`), `:458`/`:2279`, `:2453`, `:1717`/`:1741` — **hand-built panels** | Menu primitive / select picker | The largest migration: these build `db-panel-header` + hand-rolled rows today (45 sites). Panels that are menus-of-actions become `createOwnedMenu`; panels that are control surfaces (add-view's form, group-by's selects, export options) keep panel shape but take **primitive rows for their menu-like rows** and the select picker for their dropdowns (they already use `createDropdownField` at `:1409`, `:1936`) | G1, G5, G12 (`anytype-object-more-menu-dark.png` for action menus) | Add-view's form grid; group-by's live controls; `044`'s add-view grammar registration |
| M15 | Active-rule chip edit popover | `active-rule-popover-renderer.ts:132` | Select picker (inside a panel) | Rows unchanged; dropdowns already shared; width mapped per REQ-007 | G12 | The single-rule editor's own compact shape (`design-system.md` §5 scopes it away from the condition-panel floors) |

## 2. The picker family's surface list

| # | Surface | Producer (file:line) | Primitive | Changes | Anytype pattern | Stays ours |
|---|---------|----------------------|-----------|---------|-----------------|------------|
| P1 | Select/multi-select dropdown (listbox) | `dropdown-field.ts:95` `createDropdownField`, `:157` `openDropdownMenu`; **29 call sites** (12 files: `view-config-panel-renderer.ts` ×13, `filter-panel-renderer.ts` ×5, `toolbar-renderer.ts` ×2, `calendar-toolbar-renderer.ts:463`, `calendar-timeline-toolbar-renderer.ts:312`, `chart-toolbar-renderer.ts:938`, `column-menu.ts:443`, `settings.ts:371`, etc.) | Select picker | Becomes the family's select primitive on the shared **picker host**: search, empty state, phone header and width move into the host; `preserveValueOnSelect` action rows become the standard create-affordance slot (G11) | G10, G11, G12, G14 (`anytype-filter-tag-value-picker-dark.png`, `anytype-filter-property-picker-dark.png`) | Desktop anchored placement; `048`'s registered stacked dropdown pairs |
| P2 | Cell option editor (select/status/tag values) | `cell-renderer.ts:1123` `editOptionPopover` (`db-cell-option-popover`) | Select picker + menu row builder | The option rows (`:1270-1420`, 3 hand-built `db-menu-item` sites), drag-reorder and the colour-dot slot keep their behaviour but render through the shared row/host; its **add-option row stays** (G11) and becomes the convention's reference implementation | G11, G14 | Drag-reorder; the option-commit transaction flow; the inline-editor boundary (`003` §9) |
| P3 | Relation/object picker | `cell-renderer.ts:899` `editRelationPopover` (`db-relation-popover`, width 360/420/520 at `:1096`) | Picker host | Search + windowed list + footer move onto the host; its checkmark becomes the shared icon (G14); width mapped per REQ-007 (a `panel`-role picker, not a bespoke 520) | G10, G14 (`anytype-relation-editor-tag-dark.png`) | Windowed list; multi-select footer; target-database resolution |
| P4 | Date/time picker | `date-value-picker.ts:141` `renderDateValuePicker` → `openDateValuePicker`; width 252 (`:420`) | Picker host | Onto the host: registry, phone header, width. **Presets stay** (Today/Tomorrow/Next week/Clear, `:164-166`) — they already match Anytype-style relative affordances; segmented Y/M/D + H:M inputs stay ours | G13 (declined for chips; presets already ours) | The segmented input; mini-calendar body |
| P5 | Colour picker (option colour) | `option-color-picker.ts:29` `openOptionColorPicker`; width 124 (`:119`) | Picker host | Onto the host: registry, header, geometric grid nav (one function with the icon picker's, `:130-173`) | G14 | The 12-swatch grid; `048`'s registered `record option colour picker` pair |
| P6 | Icon/emoji picker | `icon-picker-popover.ts:53` (`openIconPickerPopover`) `openIconPickerPopover`; width 318 (`:244`) | Picker host | Onto the host: search, tabs, registry, geometric nav (`:281-306` unified with P5's), phone header | G10, G15 | Emoji/Lucide catalogue, recents, colour dots |
| P7 | Bulk-edit property picker | `bulk-edit-field-menu.ts:31` `openDropdownMenu` | Select picker | Caller updates only — already shared; gains the fallback/create affordances via P1 | G10, G12 | `050` item 8's gating lives with the bulk flow |
| P8 | Summary/footer pickers | `summary-renderer.ts:385`, `:425`; `table-footer-renderer.ts:183` | Select picker | None — already shared | — | — |
| P9 | Calendar/timeline scale menus | `calendar-renderer.ts:2269`, `calendar-timeline-renderer.ts:2804` | Select picker | None — already shared | — | — |
| P10 | Record-icon field picker | `database-view.ts:5315` `openDropdownMenu` | Select picker | None — already shared; its `preserveValueOnSelect` create rows are the existing proof of G11's slot | G11 | — |

## 3. Placement-width disposition (REQ-007)

Nine bespoke `preferredWidth` values across the family (`grep -rn "preferredWidth: [0-9]"`,
excluding tests and the presets themselves):

| Width | Where | Disposition |
|-------|-------|-------------|
| 292 | `column-menu.ts:353`, `:426` (submenus) | `COMPACT_MENU_POPOVER` — already the named preset; submenus take it by role |
| 420/360/520 | `cell-renderer.ts:1096` (relation picker) | A wider picker role, declared once on the host (design-system §5 policy item 2), not three numbers |
| 318 | `icon-picker-popover.ts:244` | Picker-host role: `grid` (content-driven floor for the emoji grid) |
| 124 | `option-color-picker.ts:119` | Picker-host role: `swatches` |
| 280/360/180 | `dropdown-field.ts:335` | Select-picker role inside the host; the host owns one definition |
| 252 | `date-value-picker.ts:420` | Picker-host role: `date` |
| 520 (no options passed) | 3 panel callers (`filter-panel-renderer.ts:213`, `sort-panel-renderer.ts:90`, `column-manager-renderer.ts:134`) | Already fixed by `001`'s preset work; listed for completeness — not this phase's |
| 240 | `chart-toolbar-renderer.ts:927` | Mapped to `COMPACT_MENU_POPOVER` or given a written role in the leg |

## 4. What each primitive must express (the contract)

**Menu primitive** (`owned-menu.ts` + `menu-row.ts`): rows (icon, label, trailing value, chevron),
sections, separators, checkmarks (`menuitemcheckbox`), destructive `warning` tone, disabled with
reason, keyboard roving + Home/End + Escape, focus return, real submenus (REQ-001), never-empty
fallback (G3), desktop popover ↔ phone sheet from one definition (already true at
`owned-menu.ts:194-224`), height-cap-before-measure (`:230-241`), registration through
`overlayStack`.

**Picker family** (picker host + the five pickers): one active-picker registry per document, one
phone sheet-header construction, one search with empty state + create-affordance slot (G10/G11),
one geometric grid navigator, width-by-role, the select picker's option model (value/text/section/
icon/swatches/disabled/disabledReason/preserveValueOnSelect) as the shared option shape.

## 5. Migration order (legs, D6)

1. **Primitive legs first**: `owned-menu.ts` submenu handle + fallback row; `menu-row.ts` chevron
   truth; `popover-host.ts` extraction from `dropdown-field.ts`.
2. **Menu consumers**: M7 (view-tab menu), M14 (toolbar panels) — the 45 hand-built rows; then
   M3-M5 (column-menu submenus + its 19 rows).
3. **Picker consumers**: P2, P3 (cell-renderer's two editors); P4, P5, P6 onto the host.
4. **Lane rows and recaptures** land with each leg, never after; `sheet-grammar` pair selectors
   updated in the same leg that changes their markup.
