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

**Capture citations re-evidenced 2026-09-05 · T001.** Every row's Anytype-pattern cell now names a
file in `screenshots/anytype/desktop/menus/` or `screenshots/anytype/mobile/` that was opened and measured,
or says it has none. `design-trueup.md` §4 carries the full seen/not-seen table and the five rows
with no Anytype capture at all — **M4, M5, M12, M15 and the desktop half of M7**. Four of those five
are surfaces Anytype does not ship (number-display styles, text render modes, a timeline, a chip
row); the fifth is a right-click nobody drove.

## 1. The menu primitive's own surface list

| # | Surface | Producer (file:line) | Primitive | Changes | Anytype pattern | Stays ours |
|---|---------|----------------------|-----------|---------|-----------------|------------|
| M1 | Row context menu (table/list/board/gallery/calendar/timeline/embedded) | `row-menu.ts:80` via `createOwnedMenu`; consumed by 7 renderers (`table-renderer.ts:930`, `board-renderer.ts:777`, `gallery-renderer.ts:402`, `calendar-renderer.ts:2354`, `calendar-timeline-renderer.ts:3845`, `embedded-database-renderer.ts:2480`, `list` retired) | Menu primitive | None to markup — already canonical. Gains: the never-empty fallback (G3) and capability-gate helpers shared with `050` item 8 | G2, G3, G6 — `menus/anytype-menu-list-row-menu-dark.png` (256×459, 3 dividers), identical in geometry to `…-kanban-card-menu` and `…-gallery-card-menu` | Its action set; delete flow stays our confirm modal |
| M2 | Column header context menu | `column-menu.ts:95` `createOwnedMenuForEvent`, title `col.label` | Menu primitive | Rows already via `addRow`; its **submenus move from hand-built subpopovers to the primitive's submenu handle** (see M3-M5) | G1, G9 — `menus/anytype-menu-set-column-header-dark.png` (256×500, 4 dividers, **two captioned sections**: `Property name`, `Property Type`) | Its action set; 292px width |
| M3 | Column type submenu | `column-menu.ts:224-255` opens `showColumnTypePopover` (`:186-219`) | Menu primitive submenu | Rebuild as a primitive submenu: sections + checkmark + property-type icons already match; the hand-built `db-dropdown-option` rows (`:192-218`) become `addRow` | G9, G12 — `menus/anytype-menu-object-type-picker-change-type-dark.png`; the `Property Type` section of `…-set-column-header-dark.png` | Type list and grouping (Basic/Options/Advanced) — ours |
| M4 | Number display style submenu | `column-menu.ts:257-320` `showNumberDisplayStylePopover` | Menu primitive submenu + picker host | The rating/progress/ring option rows keep their bespoke controls (emoji input, divisor, colour swatches) — these are **formulas-adjacent display config and stay ours**; only the style list becomes primitive rows | G9 — **no capture.** Anytype ships no number-display styles (no rating, progress or ring). **Design inferred from source, not seen** | The option controls themselves (G-declined: no Anytype equivalent) |
| M5 | Text render mode submenu | `column-menu.ts:386-431` `showTextRenderModePopover` | Menu primitive submenu | Plain/link/markdown + link-scheme rows become primitive rows with checkmarks; the hand-built back button dies with the old lifecycle | G9, G14 — **no capture.** No text-render submenu appears in the sweep. **Design inferred from source, not seen** | Scheme list |
| M6 | All-views hub "more" menu | `toolbar-renderer.ts:1169` `createOwnedMenu` | Menu primitive | None — already canonical; verify the fallback row (G3) when the hub's row set empties | G3 — `menus/anytype-menu-set-viewlist-dark.png` (caption `Views`, drag handles, trailing `＋ Add a view`) | — |
| M7 | View-tab context menu | `toolbar-renderer.ts:1229` `showViewTabMenu` — hand-built `db-view-tab-popover` panel + hand-rolled rows | Menu primitive | **Migrate the panel to `createOwnedMenu`**; rows via `addRow`. `050` item 4 lands duplicate/rename/remove here — the substrate migration is this phase's | G1, G5, G6 — **desktop menu not captured**; no right-click on a view tab was driven. The **phone** answer is captured and is not a context menu: `mobile/anytype-mobile-sheet-set-viewswitcher-edit-dark.png` shows an iOS **edit mode** on the view list (red `⊖`, pencil, drag handle, blue done tick) | Move-to-first/last touch rows (`:1263-1273`), which already approximate that edit mode |
| M8 | View-type change menu | `toolbar-renderer.ts:1301` `openDropdownMenu` | Select picker | None — already shared; width follows REQ-007's preset mapping | G12 — `menus/anytype-menu-set-view-layout-dark.png` / `…-set-layout-grid-dark.png`: Anytype's view-type chooser is a **3-column tile grid with a 2px accent ring** on the selected tile, not a list | — |
| M9 | Record icon context menu | `database-view.ts:5361` `createOwnedMenuForEvent` | Menu primitive | None — canonical; title fallback chain verified | G6 — `menus/anytype-menu-object-icon-picker-dark.png` (408×412) | — |
| M10 | Board group/card menus | `board-renderer.ts:777`, `:1763` | Menu primitive | None — canonical | G1 — `menus/anytype-menu-kanban-column-menu-dark.png` (224×341, 1 divider) and `menus/anytype-menu-kanban-card-menu-dark.png` (256×459, 3 dividers) | Group option set |
| M11 | Calendar day/event menu | `calendar-renderer.ts:2354` | Menu primitive | None — canonical | `menus/anytype-menu-calendar-day-menu-dark.png` and `…-calendar-item-menu-dark.png` — both **224×72, two rows** | — |
| M12 | Timeline/gantt row menu + depends-elsewhere chip menu | `calendar-timeline-renderer.ts:3845`, `:996` (the former `new Menu()` site, now owned) | Menu primitive | None — canonical. **Gantt reference parity (`037`)**: recapture + read if a leg moves a pixel | G3 — **no capture.** Anytype ships no timeline view, so there is no counterpart to read. **Design inferred from source, not seen** | The gantt surface itself — kept ours |
| M13 | Gallery card menu | `gallery-renderer.ts:402` | Menu primitive | None — canonical | `menus/anytype-menu-gallery-card-menu-dark.png` (256×459) | — |
| M14 | Utilities/kebab, title actions, database switcher, add-view, export, new-template, group-by panels | `toolbar-renderer.ts:407` (`:434`), `:770`, `:589`/`:592`, `:1360` (`:1426`), `:458`/`:2279`, `:2453`, `:1717`/`:1741` — **hand-built panels** (44 sites, re-counted at T001; the drafted 45 was wrong) | Menu primitive / select picker | The largest migration: these build `db-panel-header` + hand-rolled rows today (**44 sites**, `design-trueup.md` C8). Panels that are menus-of-actions become `createOwnedMenu`; panels that are control surfaces (add-view's form, group-by's selects, export options) keep panel shape but take **primitive rows for their menu-like rows** and the select picker for their dropdowns (they already use `createDropdownField` at `:1409`, `:1936`) | G1, G5, G12 — `menus/anytype-menu-set-new-object-dark.png` (288×143, caption `Settings`, two trailing-value rows) and `menus/anytype-menu-set-view-settings-dark.png` (360×316). **No export and no utilities analogue is captured** | Add-view's form grid; group-by's live controls; `044`'s add-view grammar registration |
| M15 | Active-rule chip edit popover | `active-rule-popover-renderer.ts:132` | Select picker (inside a panel) | Rows unchanged; dropdowns already shared; width mapped per REQ-007 | G12 — **no capture.** Anytype ships no chip row (`050` C2), so there is no rule-edit popover to read. **Design inferred from source, not seen** | The single-rule editor's own compact shape (`design-system.md` §5 scopes it away from the condition-panel floors) |

## 2. The picker family's surface list

| # | Surface | Producer (file:line) | Primitive | Changes | Anytype pattern | Stays ours |
|---|---------|----------------------|-----------|---------|-----------------|------------|
| P1 | Select/multi-select dropdown (listbox) | `dropdown-field.ts:95` `createDropdownField`, `:157` `openDropdownMenu`; **29 call sites** (12 files: `view-config-panel-renderer.ts` ×13, `filter-panel-renderer.ts` ×5, `toolbar-renderer.ts` ×2, `calendar-toolbar-renderer.ts:463`, `calendar-timeline-toolbar-renderer.ts:312`, `chart-toolbar-renderer.ts:938`, `column-menu.ts:443`, `settings.ts:371`, etc.) | Select picker | Becomes the family's select primitive on the shared **picker host**: search, empty state, phone header and width move into the host; `preserveValueOnSelect` action rows become the standard create-affordance slot (G11) | G10, G11, G12, G14 — `menus/anytype-menu-cell-select-dark.png` (300×144, 32px pitch, 24px chips), `menus/anytype-menu-set-filter-property-picker-dark.png` (257 wide, flat, format icons, 28px search field), `menus/anytype-menu-nav-settings-preferences-select-1-dark.png` (225, plain). **The create row's position is ADR-004's**: first, under the search, above the list | Desktop anchored placement; `048`'s registered stacked dropdown pairs |
| P2 | Cell option editor (select/status/tag values) | `cell-renderer.ts:1123` `editOptionPopover` (`db-cell-option-popover`) | Select picker + menu row builder | The option rows (`:1270-1420`, 3 hand-built `db-menu-item` sites), drag-reorder and the colour-dot slot keep their behaviour but render through the shared row/host; its **add-option row stays** (G11) and becomes the convention's reference implementation | G11, G14 — `menus/anytype-menu-cell-multiselect-dark.png` (chips + **2 × 3-dot drag handles at the 16px inset**, 32px pitch, 24px chip) and `menus/anytype-menu-object-featured-tag-dark.png` (search + the create-instruction empty state *"Type to create a new option"*) | Drag-reorder; the option-commit transaction flow; the inline-editor boundary (`003` §9) |
| P3 | Relation/object picker | `cell-renderer.ts:899` `editRelationPopover` (`db-relation-popover`, width 360/420/520 at `:1096`) | Picker host | Search + windowed list + footer move onto the host; its checkmark becomes the shared icon (G14); width mapped per REQ-007 (a `panel`-role picker, not a bespoke 520) | G10, G14 — `menus/anytype-menu-cell-object-dark.png` (300×300, per-row icon + right-aligned source label) and `menus/anytype-menu-object-more-add-link-to-object-dark.png` (≈360 child: search, `＋ Create Object` **first**, then the list). The tick moves **trailing** (G14), so this pair's `sheet-grammar` selectors update in the same leg | Windowed list; multi-select footer; target-database resolution |
| P4 | Date/time picker | `date-value-picker.ts:141` `renderDateValuePicker` → `openDateValuePicker`; width 252 (`:420`) | Picker host | Onto the host: registry, phone header, width. **Presets stay** (Today/Tomorrow/Next week/Clear, `:164-166`) — they already match Anytype-style relative affordances; segmented Y/M/D + H:M inputs stay ours | G13 — `menus/anytype-menu-cell-date-dark.png` (288×271: `‹ May 2026 ›`, `Mo…Su` header, tinted weekends, `#4686FB` selected day, divider, footer `Today` `Tomorrow` left / `Clear` right). Our presets are that footer set plus `Next week`, in that placement | The segmented input; mini-calendar body |
| P5 | Colour picker (option colour) | `option-color-picker.ts:29` `openOptionColorPicker`; width 124 (`:119`) | Picker host | Onto the host: registry, header, geometric grid nav (one function with the icon picker's, `:130-173`) | G14 — `menus/anytype-menu-object-block-menu-color-dark.png`. **Anytype's colour picker is a 224px labelled list, not a grid**: ten named colours, leading dot, trailing tick. Adopted from it: the **trailing tick** and **named colours as accessible names**. Its shape is **declined** (ADR-005) | The 12-swatch grid; `048`'s registered `record option colour picker` pair |
| P6 | Icon/emoji picker | `icon-picker-popover.ts:53` (`openIconPickerPopover`) `openIconPickerPopover`; width 318 (`:244`) | Picker host | Onto the host: search, tabs, registry, geometric nav (`:281-306` unified with P5's), phone header | G10, G15 — `menus/anytype-menu-object-icon-picker-dark.png` (408×412: tab row `Emojis / Library / Upload`, 28px search field, **category section headers** `Smileys & People`, grid, footer category bar). Anytype's 408 is **declined** against our 318 content floor | Emoji/Lucide catalogue, recents, colour dots |
| P7 | Bulk-edit property picker | `bulk-edit-field-menu.ts:31` `openDropdownMenu` | Select picker | Caller updates only — already shared; gains the fallback/create affordances via P1 | G10, G12 — `mobile/anytype-mobile-sheet-relation-add-dark.png` (search `Search or create new`, **two typed group headers**: `Properties formats`, `Existing properties`). This is the picker that **groups**, per G12's grouped-when-mixed rule | `050` item 8's gating lives with the bulk flow |
| P8 | Summary/footer pickers | `summary-renderer.ts:385`, `:425`; `table-footer-renderer.ts:183` | Select picker | None — already shared | `menus/anytype-menu-set-column-header-calculate-dark.png` — the calculate submenu | — |
| P9 | Calendar/timeline scale menus | `calendar-renderer.ts:2269`, `calendar-timeline-renderer.ts:2804` | Select picker | None — already shared | `menus/anytype-menu-calendar-month-select-dark.png`, `…-calendar-year-select-dark.png` (224/225, 28px rows). **No timeline analogue** — Anytype ships no timeline | — |
| P10 | Record-icon field picker | `database-view.ts:5315` `openDropdownMenu` | Select picker | None — already shared; its `preserveValueOnSelect` create rows are the existing proof of G11's slot | G11 — `menus/anytype-menu-object-icon-picker-dark.png` | — |

## 3. Placement-width disposition (REQ-007) — **re-counted 2026-09-05 · T001**

**Eight** distinct bespoke `preferredWidth` literals across **fourteen** production call sites
(`grep -rn "preferredWidth: [0-9]" src/views/`, excluding tests, stories and the presets
themselves). The drafted "nine, including 240" was wrong: `chart-toolbar-renderer.ts:927` passes
**280**, and the only 240 in the tree is `popover-position.stories.ts:40`, a story
(`design-trueup.md` C9). `checklist.md` C7 still carries the old figure and is **T003's to correct**.

Anytype's measured tiers, for comparison, are **224 / 256 / 288-300 / 360 / 408**
(`design-trueup.md` §2). ADR-005 rules on which of them we adopt.

| Width | Where | Anytype's counterpart | Disposition |
|-------|-------|-----------------------|-------------|
| 292 | `column-menu.ts:353`, `:426` (submenus) | 224 compact · 256 context menu | `COMPACT_MENU_POPOVER` — already the named preset; submenus take it by role. **Anytype's narrower tiers declined** (ADR-005) |
| 420 (min 360 / max 520) | `cell-renderer.ts:1096` (relation picker); the same 420 at `calendar-toolbar-renderer.ts:98`, `calendar-timeline-toolbar-renderer.ts:74` | 288-300 (`cell-object`, `object-relation-*`) | A wider picker role, declared once on the host (design-system §5 policy item 2), not three numbers. **Derived from our row** — title plus source label plus trailing tick — not from Anytype's narrower one |
| 318 | `icon-picker-popover.ts:244` | **408** (`object-icon-picker`) | Picker-host role: `grid` (content-driven floor for our emoji grid). Anytype's 408 **declined** — it is their grid's floor, not ours |
| 124 | `option-color-picker.ts:119` | **224 labelled list, not a grid** (`object-block-menu-color`) | Picker-host role: `swatches`. The 12-swatch grid **stays**; what is adopted from Anytype's list is the **trailing tick** and **named colours as accessible names** (G14, G15) |
| 280 (min 180-220 / max 320-360) | `dropdown-field.ts:335`; `chart-toolbar-renderer.ts:927` | 224 plain select · 300 cell editor | Select-picker role inside the host; the host owns one definition. `chart-toolbar-renderer.ts:927` writes the compact preset's shape out by hand and should **take the preset** |
| 252 | `date-value-picker.ts:420` | **288** (`cell-date`) | Picker-host role: `date`. Ours stays — the delta is a font stack, not a design, and the preset row and grid match (G13) |
| 360 | `database-view.ts:3182`, `embedded-database-renderer.ts:2975`, `record-detail-panel.ts:408` (min 240 / max 420) | **360** (every view/filter/sort/layout panel) | The `panel` role's top, and **the exact tier Anytype's panels measure**. Adopted by agreement — nothing moves |
| 520 | `chart-toolbar-renderer.ts:347` | — | Outside the family. Left where it is; named so the count reconciles |
| ~~240~~ | **no production site** | — | **Removed.** Story value only (`popover-position.stories.ts:40`) |
| *(no options passed)* | 3 panel callers (`filter-panel-renderer.ts:213`, `sort-panel-renderer.ts:90`, `column-manager-renderer.ts:134`) | 360 | Already the `condition panel` role at 552 per `001`; not this phase's. **Not to be narrowed to Anytype's 360** — Anytype stacks the condition across two surfaces where our row carries property, operator, value, group, NOT and remove on one line (`design-trueup.md` §2) |

## 4. What each primitive must express (the contract)

**Menu primitive** (`owned-menu.ts` + `menu-row.ts`): rows (icon, label, trailing value, chevron),
sections, separators, checkmarks (`menuitemcheckbox`), destructive `warning` tone, disabled with
reason, keyboard roving + Home/End + Escape, focus return, real submenus (REQ-001), never-empty
fallback (G3), desktop popover ↔ phone sheet from one definition (already true at
`owned-menu.ts:194-224`), height-cap-before-measure (`:230-241`), registration through
`overlayStack`.

Four clauses the capture read adds to that contract (ADR-005):

- **The leading icon slot is optional per row.** `menus/anytype-menu-nav-widget-bin-dark.png` renders
  two rows with no icon and two with one, in the same menu. An icon-less menu must not pay a blank
  16px gutter.
- **Sections come in two shapes.** A bare divider, and a divider plus a caption at the secondary text
  colour, ~12px, on the same 16px inset — used where a section configures rather than acts.
- **The checkmark is trailing**, at the 16px right inset, which is what frees the leading slot for
  the format icon G12 and G15 both need.
- **A row that owns an open submenu keeps its highlight and rotates its chevron.** Two signals,
  neither of them colour alone — which is also why `#232323` at 1.14:1 is refused.

**Picker family** (picker host + the five pickers): one active-picker registry per document, one
phone sheet-header construction, one search with empty state + create-affordance slot (G10/G11),
one geometric grid navigator, width-by-role, the select picker's option model (value/text/section/
icon/swatches/disabled/disabledReason/preserveValueOnSelect) as the shared option shape.

Three clauses the capture read adds (ADR-004):

- **The create row renders first** — between the search field and the first result, not last in its
  section. Last-in-section is reserved for an *escalation* out of the surface, which is where
  `menus/anytype-menu-set-filter-property-picker-dark.png` puts `Add advanced filter`.
- **The create affordance stays reachable when the list is empty**, which is AC-006's clause and what
  all three captured phone shapes do.
- **The search field is first in the panel**: 28px tall, full content width at the 16px inset, sitting
  12px below the frame's top edge. Its placeholder names the verb of its surface, and none of
  Anytype's placeholder strings is copied — `mobile/anytype-mobile-sheet-filter-relation-picker-dark.png`
  ships `Choose a property to sort` inside the *filter* flow.

## 5. Migration order (legs, D6)

1. **Primitive legs first**: `owned-menu.ts` submenu handle + fallback row; `menu-row.ts` chevron
   truth; `popover-host.ts` extraction from `dropdown-field.ts`.
2. **Menu consumers**: M7 (view-tab menu), M14 (toolbar panels) — the 45 hand-built rows; then
   M3-M5 (column-menu submenus + its 19 rows).
3. **Picker consumers**: P2, P3 (cell-renderer's two editors); P4, P5, P6 onto the host.
4. **Lane rows and recaptures** land with each leg, never after; `sheet-grammar` pair selectors
   updated in the same leg that changes their markup.
