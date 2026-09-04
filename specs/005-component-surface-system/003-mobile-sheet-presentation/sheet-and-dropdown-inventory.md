---
title: "Sheet and Dropdown Inventory: Phone Alignment Census"
description: "Static source census of every bottom sheet, modal, popover and dropdown under src/, grouped by host mechanism, with a ranked list of surfaces that do not conform to the shared sheet grammar."
trigger_phrases:
  - "sheet and dropdown inventory"
  - "phone alignment census"
  - "column-width adjuster bare strip"
  - "database settings sheet drag handle"
  - "003 mobile sheet inventory"
importance_tier: "high"
contextType: "research"
---
# Sheet and dropdown inventory — phone alignment census

Static source census of every surface under `src/` that presents as a bottom sheet, modal, popover
or dropdown, produced for the phone alignment pass the operator asked for after finding two
non-conforming surfaces by hand: the column-width adjuster (a bare strip, now `worktrees/039-column-
width-sheet`) and the database Settings sheet (a drag handle that does not close, a desktop two-
column layout squeezed onto the phone, now `worktrees/040-settings-sheet`). Both worktrees confirmed
via `git -C .worktrees/0XX... status --short` are working directly against **this same packet's**
`tasks.md` — there is no separate spec folder for either, so every surface below is owned by
`005-component-surface-system/003-mobile-sheet-presentation`.

**This is static, not runtime.** `spec.md` §4A already states the reason: "static analysis cannot
answer the questions this spec asks... it cannot tell which of the 20 `DbModal` subclasses actually
presents as a sheet at a given width... it cannot tell whether a node survives a commit." This
document is the "static list" that `tasks.md` T10 asks to diff against a runtime log — it names
every file:line producer and what the code says should happen, not what a phone shows. Two items
below (view-config panel drag-close, and any mid-gesture rebuild race) are flagged as **needs
runtime confirmation** rather than asserted as fact, per that same limit.

---

## 1. Host mechanisms

| Mechanism | Where | What it gives a surface on phone |
|---|---|---|
| Shared positioner | `positionToolbarPopover()` — `src/views/popover-position.ts:98` | Every call unconditionally runs `applySheetChrome(panel, isMobileBottomSheet(doc))`, `playSheetEntrance`, and rewires `attachSheetDragToDismiss` — portal to `document.body`, grab handle, scrim, safe-area padding, `visualViewport`-aware keyboard avoidance (`popover-position.ts:254`), `90svh` height cap. Close-on-drag calls `overlayStack.dismissPanel(panel, "programmatic")`. |
| `DbModal` | `src/views/modals/db-modal.ts` | Same chrome + gesture, applied in `onOpen`/`applyPresentation` from a declared `"sheet" \| "fullscreen" \| "dialog"` (default `"sheet"`). |
| Owned menu | `src/views/owned-menu.ts` (`createOwnedMenu`, `createOwnedMenuForEvent`) | Same chrome + gesture, wired directly inside `showAt()`; close-on-drag calls the menu's own `close()` rather than the overlay stack. Scrim captures the pointer (`scrimCapturesPointer: true`) since a menu dismisses on outside press. |
| Native Obsidian | `Modal`, `FuzzySuggestModal`, `Menu`, `PluginSettingTab` | No plugin chrome at all — Obsidian's own presentation, whatever that is on the installed version. |
| Custom / ad hoc | bespoke DOM the surface builds itself | Whatever the surface wrote, checked case by case below. |

---

## 2. Modals — `DbModal` subclasses (20)

`rg -n "extends DbModal" src` returns exactly 20, matching `spec.md`'s REQ-007 count.

| # | Class | Defined | `super()` | Presentation | Purpose |
|---:|---|---|---|---|---|
| 1 | `TrashManagerModal` | `src/settings.ts:565` | `:571` explicit | `sheet` | Trash manager — list of deleted databases |
| 2 | *(anonymous restore-confirm)* | `src/settings.ts:654` | none (implicit) | `sheet` — **silent** | Restore a trashed database as a file, confirm step |
| 3 | `PropertyTypeConflictModal` | `src/views/modals/property-type-conflict-modal.ts:78` | `:90` | `fullscreen` | Cross-database frontmatter-key type-conflict resolver |
| 4 | `ComputedFrontmatterCleanupModal` | `src/views/modals/computed-frontmatter-cleanup-modal.ts:25` | `:34` | `sheet` | Stale computed-field frontmatter cleanup checklist |
| 5 | `RelationRollupConfigModal` | `src/views/modals/relation-rollup-config-modal.ts:32` | `:43` | `sheet` | Relation-target + rollup-aggregation config |
| 6 | `GroupOrderModal` | `src/views/modals/group-order-modal.ts:24` | `:36` | `sheet` | Manual board/group order editor — **dead code**: `rg -n "GroupOrderModal" src` finds zero call sites besides its own definition. The live feature is the inline `showGroupOrderPopover` positioner popover (§4, rows 14/14b) instead. |
| 7 | `CsvMarkdownImportModal` | `src/main.ts:2816` | `:2825` explicit, 1 arg | `sheet` — **silent** | CSV+Markdown import dialog |
| 8 | `DeleteDatabaseModal` | `src/views/modals/delete-database-modal.ts:33` | `:42` | `sheet` | Destructive delete/trash prompt |
| 9 | `ChartDrilldownModal` | `src/views/chart-renderer.ts:970` | `:972` | `fullscreen` | Chart segment drill-down record list |
| 10 | `CreateRecordIconFieldModal` | `src/views/modals/create-record-icon-field-modal.ts:23` | `:28` | `sheet` | Add the reserved "icon" column |
| 11 | `BaseImportConfirmModal` | `src/views/modals/base-import-confirm-modal.ts:47` | `:67` | `sheet` | Scanned-frontmatter review table (import / new-database flows) |
| 12 | `AddDatabaseModal` | `src/views/modals/add-database-modal.ts:29` | `:41` | `sheet` | New database dialog |
| 13 | `StatusOptionsModal` | `src/views/modals/status-options-modal.ts:109` | `:125` | `sheet` | Per-column status/select option editor |
| 14 | `ColumnRenameModal` | `src/views/modals/column-rename-modal.ts:36` | `:43` | `sheet` | Column rename/retype prompt, with value-migration option |
| 15 | `FormulaModal` | `src/views/modals/formula-modal.ts:176` | `:217` | `fullscreen` | Computed-field formula workbench |
| 16 | `StatusPresetManagerModal` | `src/views/modals/status-preset-manager-modal.ts:32` | `:44` | `sheet` | Status/select preset CRUD |
| 17 | `CreatePropertyModal` | `src/views/modals/create-property-modal.ts:64` | `:76` | `sheet` | Create-column dialog |
| 18 | `CsvMarkdownExportModal` | `src/views/modals/csv-markdown-export-modal.ts:22` | none (no constructor at all) | `sheet` — **silent** | CSV+Markdown export options |
| 19 | `ConfirmModal` | `src/views/modals/confirm-modal.ts:35` | `:42` | `sheet` | Generic yes/no/secondary-action confirmation dialog |
| 20 | `InvalidTimeEventsModal` | `src/views/modals/invalid-time-events-modal.ts:66` | `:78` | `fullscreen` | Bulk repair grid for timeline events whose start is on/after their end |

**Delta against `spec.md` §4A's estimate:** that section says "18 of the 20 pass a presentation
explicitly, the other two inherit `"sheet"` silently" (`db-modal.ts:56`, `:66-70`). This census finds
**three** silent inherits — #2, #7, #18 — not two. #2 is an anonymous inline class
(`new class extends DbModal {...}`), which the 18/2 estimate likely did not count as a named
subclass. Breakdown: 4 `fullscreen` (#3, #9, #15, #20), 13 `sheet` explicit, 3 `sheet` silent. 0
`dialog`.

---

## 3. Modals — native Obsidian, bypass `DbModal` entirely (3 `FuzzySuggestModal`)

These are `spec.md` REQ-007's explicitly named gap and `tasks.md` T7.

| # | Class | Defined | Instantiated at | Purpose | Phone presentation |
|---:|---|---|---|---|---|
| 1 | `BaseFileSuggestModal` | `src/main.ts:2954` | `src/main.ts:891` | Pick a `.base` file to import | None — Obsidian's own `FuzzySuggestModal` chrome only. No `applySheetChrome`, no grab handle, no portal, no `db-mobile-bottom-sheet`. |
| 2 | `MarkdownFileSuggestModal` | `src/views/markdown-file-suggest-modal.ts:16` | `src/views/view-config-panel-renderer.ts:536` | Pick a markdown file | Same — no plugin sheet chrome. |
| 3 | `ImageFileSuggestModal` | `src/views/image-file-suggest-modal.ts:22` | `view-config-panel-renderer.ts:578`; `src/views/database-view.ts:2416` | Pick an image file (record icon / cover) | Same — no plugin sheet chrome. |

---

## 4. Positioner-hosted sheets/popovers (`positionToolbarPopover`)

Every row below becomes a phone bottom sheet automatically via the shared positioner (§1), unless
the "Notes" column says otherwise. Fixture ids are from `tools/screenshots/scenarios/*.mjs`;
`constructed-*` scenarios are per-view-type only and are not per-surface, so they are not listed
individually.

| # | Surface | Entry point | Purpose | Fixture | Notes |
|---:|---|---|---|---|---|
| 1 | Utilities/kebab overflow menu | `toolbar-renderer.ts:434` (`renderUtilitiesOverflowButton`) | Refresh DB / copy formats / open DB file / view-settings shortcuts | `chrome-utilities-popover` | conforms |
| 2 | Database switcher popover | `toolbar-renderer.ts:562,592` (`renderDatabasePopover`/`populateDatabasePopover`) | Switch/reorder configuration databases | none | conforms |
| 3 | Title actions menu | `toolbar-renderer.ts:763` (`showTitleActionsMenu`) | Per-database title-row actions | none | conforms |
| 4 | All-views hub | `toolbar-renderer.ts:1138` (`showAllViewsHub`) | Overflow list of view tabs | none | conforms; nests an owned-menu "more" button (`toolbar-renderer.ts:1120`) |
| 5 | View-tab context menu | `toolbar-renderer.ts:1230` (`showViewTabMenu`) | Rename/duplicate/delete a view tab | none | conforms |
| 6 | Add-view menu | `toolbar-renderer.ts:1426` (`showAddViewMenu`) | Create a new view | `add-view-popover` | conforms; contains the plugin's one native `<select>` (`:1371`, §8) |
| 7 | Group-by popover | `toolbar-renderer.ts:1717` (`renderGroupPopover`) | Configure grouping, subgrouping, row limits | none | conforms |
| 8 | Export/copy-formats popover | `toolbar-renderer.ts:2279` (`renderExportPopover`) | Copy/export format menu | none | conforms |
| 9 | New-record template menu | `toolbar-renderer.ts:2453` (`showNewTemplateMenu`) | Choose a record template | none | conforms |
| 10 | Filter panel | `filter-panel-renderer.ts:218` | Flat rule rows + nested AND/OR/NOT group trees | `panel-filter-conditions`, `panel-filter-nested-group` | conforms; self-repaints incrementally rather than a whole-view refresh per edit (`dismissalNeedsRebuild`, `database-view.ts:2912-2920`) |
| 11 | Sort panel | `sort-panel-renderer.ts:117` | Sort rules — list, add, drag-reorder, remove | `panel-sort-rules`, `panel-sort-calendar-empty` | conforms; self-repaints incrementally, same as filter |
| 12 | Column manager panel | `column-manager-renderer.ts:148` | Column visibility, ordering, wrap | `panel-column-manager` | conforms; rebuilds wholesale (`panelEl.remove()` + recreate) on every `render()` call, same lifecycle as #13 |
| 13 | **View Settings panel** ("Current view" / "Current database") | `view-config-panel-renderer.ts` `render()` (positions at `:382-402`); opened via `toolbar-renderer.ts:2191` (`renderViewConfigButton`) → `database-view.ts` `toggleHeaderPopover("view")` | View type, source rules, conditional formatting, record-icon field, status presets, and — under the "Current database" section (`viewConfig.databaseSection` i18n key, `view-config-panel-renderer.ts:305-308`) — the per-database icon field, computed-sync mode, and status presets | `panel-view-config` | **FLAGGED — `worktrees/040-settings-sheet`.** See §7.3 for the full finding. |
| 14 | Group Order popover (table view) | `database-view.ts:3137` (`showGroupOrderPopover`) | Reorder group values | none | conforms |
| 14b | Group Order popover (embedded view) | `embedded-database-renderer.ts:2914` (`showGroupOrderPopover`) | Same, for embedded/base-file databases | none | conforms; duplicate implementation of #14 — the `GroupOrderModal` `DbModal` (§2 #6) is dead code for this same feature |
| 15 | Calendar view-options popover | `calendar-toolbar-renderer.ts:98` | Calendar data/layout/time/appearance settings | `calendar-toolbar-options` | conforms |
| 16 | Timeline view-options popover | `calendar-timeline-toolbar-renderer.ts:74` | Timeline data/layout/style settings | `timeline-toolbar-options` | conforms |
| 17 | Chart options popover | `chart-toolbar-renderer.ts:347` | Chart `ViewConfig` fields — two-level: main panel + child popovers | `chrome-chart-options-popover` | conforms |
| 18 | Active-rule chip edit popover | `active-rule-popover-renderer.ts:132` | Edit a single filter/sort chip in place | `chrome-active-rule-popover-filter`, `chrome-active-rule-popover-sort` | conforms |
| 19 | Icon picker popover | `icon-picker-popover.ts:229` | Emoji/Lucide icon picker, search + recents + arrow-key grid | `field-icon-picker` | conforms |
| 20 | Option color picker | `option-color-picker.ts:104` | Select/status swatch grid | `field-option-color-picker` | conforms |
| 21 | Date/time value picker | `date-value-picker.ts:400` | Segmented date input + calendar | `field-date-value-picker`, `field-date-value-picker-datetime` | conforms |
| 22 | Relation/rollup cell editor popover | `cell-renderer.ts:1093` (`editRelationPopover`) | In-place relation/rollup value editor | none (relation rendering only: `field-relation-values`) | conforms structurally |
| 23 | Column-menu (top level) | `column-menu.ts:95` | Column header context menu | none | uses the owned-menu mechanism (§5), not the positioner |
| 24 | Column-menu → type submenu | `column-menu.ts:224` → `createColumnMenuSubpopover` (`:597`) | Change column type | none | conforms |
| 25 | Column-menu → number-style submenu | `column-menu.ts:257` (`showNumberDisplayStylePopover`) → `:352` | Number display style | none | conforms |
| 26 | Column-menu → text-style submenu | `column-menu.ts:386` (`showTextRenderModePopover`) → `:425` | Text render mode | none | conforms |
| 27 | `db-dropdown` listbox popover | `dropdown-field.ts:324` (`openDropdownPopover`) | Backing popover for every `db-dropdown` field/menu | `dropdown-field` | conforms — see §8 |

---

## 5. Owned menus (`createOwnedMenu` / `createOwnedMenuForEvent`)

Replaces Obsidian's native `Menu` (`owned-menu.ts:1-19` header comment). On phone: sheet, scrim
captures the pointer, drag-to-dismiss wired to the menu's own `close()` (`owned-menu.ts:172-183`).

| Call site | Purpose |
|---|---|
| `row-menu.ts:80` (via `createOwnedMenu`) | Table/list row right-click / long-press menu (open/insert/duplicate/delete) |
| `toolbar-renderer.ts:1120` (`createOwnedMenu`) | "More" button inside the all-views hub (§4 #4) |
| `database-view.ts:5314` (`openRecordIconContextMenu`) | Record-icon change/remove context menu |
| `board-renderer.ts:761` (`renderBoardGroupOptions`) | Board column/group options menu (sort, etc.) |
| `board-renderer.ts:1749` | Board card's group/move context menu |
| `list-renderer.ts:889` | List row context menu |
| `column-menu.ts:95` | Column header top-level context menu (edit/type/format/sort/delete) |
| `embedded-database-renderer.ts:2419` | Embedded row/card context menu |
| `table-renderer.ts:930` | Table row context menu |
| `calendar-timeline-renderer.ts:3775` | Gantt row context menu |
| `calendar-renderer.ts:2354` | Calendar day/event context menu |
| `gallery-renderer.ts:402` | Gallery card context menu |
| `owned-menu.stories.ts:40` | Storybook fixture only |

All conform per `owned-menu.ts`'s `showAt()` (§1).

---

## 6. Native Obsidian `Menu` (bypasses the shared grammar)

`rg -n "new Menu\(" src` returns exactly **one** match — down from the 11 sites the sibling packet's
`specs/003-ui-improvement-build/013-mobile-ux-research/device-defect-inventory.md` (item 8) recorded
before the owned-menu migration:

- `calendar-timeline-renderer.ts:959` — the Gantt "depends elsewhere" chip, listing predecessor
  records outside the current view. `new Menu()` + `showAtMouseEvent` (`:958-970`). No
  `applySheetChrome`, no portal, no grab handle, no scrim — Obsidian's own (non-plugin) menu chrome
  renders instead. This is new code from the recent Gantt work (`feat(timeline): give the gantt its
  scales, milestones, progress and link affordance`, `55bff9b`..`0b61449` in `git log`) and appears
  to be the one call site the earlier migration missed rather than a deliberate exemption.

---

## 7. Custom / ad hoc surfaces (outside every shared mechanism)

### 7.1 Column-width adjuster — `database-view.ts:11404` (`showMobileColumnWidthPanel`)

**FLAGGED — `worktrees/039-column-width-sheet`.** Builds `db-mobile-column-width-backdrop` and
`db-mobile-column-width-panel` directly on `doc.body` (`:11411-11412`) with none of the shared
mechanism: no `applySheetChrome`, no `db-mobile-bottom-sheet` class, no grab handle, no portal
token-root marking (`db-surface`/`note-database-container`), no `positionToolbarPopover`. It wires
its own bespoke Escape-key handler and backdrop-click close (`:11486-11494`), and its own CSS block
(`db-mobile-column-width-*`, `styles.css:19980-20011`) has no relationship to
`.db-mobile-bottom-sheet`. This is exactly the "bare strip" the operator reported: no rounded top,
no shared scrim, no drag-to-dismiss, no safe-area padding, no keyboard-avoidance via
`visualViewport` — it is a hand-built floating card, not a sheet.

### 7.2 Table record peek panel — `table-record-peek.ts:150` (`openTableRecordPeek`)

Read-only "peek" panel docked beside a table row, appended directly into the table `container` (not
portalled to `document.body`): `position: absolute; top:0; right:0; bottom:0; width: min(360px,
100%)` (`styles.css:21312-21327`). No `positionToolbarPopover`, no `applySheetChrome`, no phone-
specific CSS anywhere in the stylesheet for `.db-record-peek-panel` (`grep -n "record-peek"
styles.css | grep -i "phone\|mobile"` → no matches). It dismisses on **any** container scroll or
window resize (`onDismiss`, `:203-207`), both of which fire readily from a touch scroll or a
keyboard-open resize on a phone. This is a **new finding, not previously flagged by the operator**,
and it matches the sibling packet's own `device-defect-inventory.md` item #1 verbatim — *"The `⤢`
peek button opens a side rail, not a bottom sheet... A previous fix was applied to the wrong
component"* — confirming that defect is still present in the current tree. It is worth noting this
surface DOES have screenshot capture coverage (`panel-record-peek`, `panels.mjs:580`), which shows
existing coverage does not by itself verify conformance to the shared sheet grammar.

### 7.3 View Settings panel — the operator's "database Settings sheet"

**FLAGGED — `worktrees/040-settings-sheet`.** Located and confirmed at
`view-config-panel-renderer.ts` (opened via `toolbar-renderer.ts:2191`), title `t("toolbar.settings")`
= "Settings", with a "Current database" section (`viewConfig.databaseSection` i18n key = "Current
database", `view-config-panel-renderer.ts:305-308`) — matching the operator's report precisely.

- **Two-column layout, confirmed.** Every row is `.db-view-config-row`: `display: grid;
  grid-template-columns: 116px minmax(0, 1fr)` (`styles.css:11682-11688`). `grep -n
  "db-view-config-row" styles.css` returns exactly this one rule — **no `is-phone` override
  collapses it to one column.** The outer panel itself IS forced full width on phone
  (`.db-mobile-bottom-sheet { width: 100% !important }`, `styles.css:199-200`), so the sheet spans
  the screen, but every field inside it still reserves a fixed 116px label column regardless of
  viewport width. This is the desktop two-column layout the operator saw squeezed onto the phone.

- **Drag-close mechanism, needs runtime confirmation.** The panel goes through the shared
  positioner (§1), so it structurally gets `applySheetChrome`, a grab handle, and
  `attachSheetDragToDismiss`. The panel node is destroyed and rebuilt wholesale
  (`this.panelEl?.remove()` then a fresh `containerEl.createDiv(...)`,
  `view-config-panel-renderer.ts:295-296`) on **every** call to `render()`, and every field edit's
  `onChange` triggers `this.refresh()` — a whole-view rebuild (`database-view.ts:5049-5051`) — which
  re-renders this panel again if still open. `installHeaderPopoverAutoClose`
  (`database-view.ts:2952-2993`) already compensates for this at the **dismissal** layer: it resolves
  the *current* panel node dynamically via `viewConfigPanelRenderer.getPanel()` rather than trusting
  a captured reference, and a comment there narrates the exact historical failure —
  *"that is why the backdrop and Escape close these sheets on desktop and a drag does nothing on a
  phone: dismissal is the overlay stack's to perform, and the stack was never told the sheet
  exists"* — as a bug this dynamic resolution fixes. `filter-panel-renderer.ts` and
  `sort-panel-renderer.ts` share the identical `panelEl.remove()`+recreate lifecycle at the top of
  their own `render()` (confirmed by the same pattern at `filter-panel-renderer.ts:151-157` and
  `sort-panel-renderer.ts:59-63`), so the rebuild-per-render lifecycle alone is not unique to this
  panel. What static reading cannot settle is whether an **active drag gesture** — bound fresh to
  whichever node existed at the last render — can be interrupted mid-swipe by a `refresh()` fired
  from something other than the drag itself while the sheet is open, which is the shape of failure
  the operator described. That requires the runtime census (`tasks.md` T5/T8) to confirm or rule
  out; this document does not assert a specific root cause for it.

---

## 8. Dropdowns

| Primitive | Where | Call sites | Phone presentation | Keyboard | Capture |
|---|---|---|---|---|---|
| `db-dropdown` | `dropdown-field.ts` — `createDropdownField` (`:94`, persistent labeled field) and `openDropdownMenu` (`:156`, ephemeral anchor menu) share `openDropdownPopover` (`:187`) → `positionToolbarPopover` (`:324`) | Pervasive: view-config panel, record-icon field pickers, status/select editors, filter/sort field pickers, board key-field selects elsewhere, etc. | Bottom-sheet option list, identical to every other positioner surface (§1/§4) | typeahead + arrow-key roving (`dropdown-field.ts` header comment) | `dropdown-field` (`core.mjs:290`) |
| Native `<select>` | `toolbar-renderer.ts:1371`, inside `showAddViewMenu` (§4 #6) | 1 — the board view's "key field" selector | The OS-native select sheet (iOS wheel / Android dropdown), **not** `db-dropdown`'s bottom-sheet listbox | native | none |
| `DropdownComponent` (Obsidian's own) | — | 0 — `rg -n "DropdownComponent" src` returns no matches | n/a | n/a | n/a |
| Segmented/toggle-group | — | 0 — no `db-segmented`/`db-toggle-group`/`segmented-control` class exists anywhere in `src` or `styles.css` | n/a | n/a | n/a |

`toolbar-renderer.ts:1371`'s native `<select>` is the only dropdown in the plugin that does not use
`db-dropdown` — visually inconsistent with every other control in the same Add-View menu, though it
degrades to a functioning native control rather than breaking.

---

## 9. Summary table (a) — sheets/modals by host mechanism

| Host mechanism | Count | Conforms to shared grammar | Gap |
|---|---:|---|---|
| Shared positioner (`positionToolbarPopover`) | 27 distinct popovers, ~40 call sites (§4) | **Partial** — yes for all but #13 | View Settings panel: fixed-width CSS row with no `is-phone` override; drag-close behavior needs runtime confirmation (§7.3) |
| `DbModal` (`sheet`/`fullscreen`) | 20 subclasses (§2) | **Yes** | `GroupOrderModal` is dead code — never opened |
| Owned menu (`createOwnedMenu`/`ForEvent`) | ~13 call sites (§5) | **Yes** | none found |
| Native Obsidian `FuzzySuggestModal` | 3 subclasses (§3) | **No** | No sheet chrome at all — this is REQ-007's named gap, open in `tasks.md` T7 |
| Native Obsidian `Menu` | 1 call site (§6) | **No** | Gantt "depends elsewhere" menu — no sheet chrome, no scrim, no drag |
| Custom / ad hoc | 2 (§7.1, §7.2) + 1 by-design (inline cell editor) | **No** for 2 of 3 | Column-width adjuster: no chrome at all. Record peek: no chrome at all, dismisses on scroll. Inline cell editor is deliberately non-sheet by design (`.db-cell-edit-popover.is-mobile.is-inline-overlay`, `cell-renderer.ts:2676`, `styles.css:20044`) — not a gap. |
| Native Obsidian `PluginSettingTab` | 1 (`SettingsTab`, `settings.ts:88`) | N/A — out of scope for the sheet grammar; Obsidian owns full-screen settings on every platform | — |
| Docked bar (not a sheet) | 1 (Selection status bar, `database-view.ts:7536`) | **Yes**, by coordination | Yields to `body.db-bottom-dock-taken` (`styles.css:2555`) rather than claiming the dock itself — correct by design, not a gap |

## 10. Summary table (b) — dropdowns by primitive

| Primitive | Count | Conforms | Gap |
|---|---:|---|---|
| `db-dropdown` (`dropdown-field.ts`) | pervasive | **Yes** | none found |
| Native `<select>` | 1 | **No** | Renders the OS-native select sheet instead of `db-dropdown`'s bottom-sheet listbox |
| `DropdownComponent` | 0 | n/a | not used anywhere |
| Segmented/toggle group | 0 | n/a | not used anywhere |

---

## 11. Ranked non-conforming list (worst first)

1. **Column-width adjuster** — `database-view.ts:11404` (`showMobileColumnWidthPanel`). No shared
   chrome at all: bespoke backdrop/panel appended straight to `document.body`, no grab handle, no
   portal-token class. Packet: `005-component-surface-system/003-mobile-sheet-presentation`, active
   in `worktrees/039-column-width-sheet`. **Fix:** route the panel through `applySheetChrome` /
   `attachSheetDragToDismiss` (or wrap it in `positionToolbarPopover` with no anchor) so it inherits
   the grab handle, safe-area padding, and keyboard avoidance every other sheet already has, instead
   of its own bespoke `backdrop.onclick`/Escape pair.

2. **Table record peek panel** — `table-record-peek.ts:150` (`openTableRecordPeek`). Docked to the
   table container, not portalled; no sheet chrome; dismisses on any scroll/resize. Packet: same.
   **Fix:** on `isTouchDevice()`, route the open action to `record-detail-panel.ts`'s sheet instead
   of this side rail — the sibling `device-defect-inventory.md` item 1 already recommended this same
   fix and it is still open.

3. **View Settings panel ("Current database" section)** —
   `view-config-panel-renderer.ts` (render at `:288-396`) + `styles.css:11682-11688`
   (`.db-view-config-row`). Uses the shared positioner/drag mechanism, but its fixed `116px | 1fr`
   row grid has no `is-phone` override, and the panel rebuilds wholesale on every field edit.
   Packet: same, active in `worktrees/040-settings-sheet`. **Fix:** add an `is-phone` override that
   collapses `.db-view-config-row` to a single column (label above control) under some width
   threshold; confirm with the runtime census (`tasks.md` T5/T8) whether the wholesale rebuild races
   the drag gesture mid-swipe, since static reading cannot settle that.

4. **Native Obsidian `Menu`** — `calendar-timeline-renderer.ts:959`. The one remaining `new Menu()`
   call, on the Gantt "depends elsewhere" chip, bypasses the owned-menu migration entirely. Packet:
   same (this is new Gantt-work scope creep against the migration the sibling
   `003-ui-improvement-build` track already completed elsewhere). **Fix:** replace with
   `createOwnedMenuForEvent`, matching every other context menu in the same file.

5. **3 `FuzzySuggestModal` subclasses** — `main.ts:2954`, `image-file-suggest-modal.ts:22`,
   `markdown-file-suggest-modal.ts:16`. No plugin sheet chrome; this is REQ-007's explicitly named
   gap, still open in `tasks.md` T7. Packet: same. **Fix:** per `spec.md`, classify each explicitly
   (sheet / not-a-sheet / out-of-scope-with-reason) rather than leaving them unrouted.

6. **Native `<select>`** — `toolbar-renderer.ts:1371` (Add-View "key field"). Renders the OS-native
   picker instead of `db-dropdown`. Packet: same. **Fix:** swap for `createDropdownField` /
   `openDropdownMenu` to match every other control in the same Add-View menu.

7. **`GroupOrderModal` dead code** — `group-order-modal.ts:24`. Never instantiated; the live feature
   is the inline `showGroupOrderPopover` positioner popover (§4 #14/#14b). Not a phone-presentation
   defect on its own, but it inflates any "20 `DbModal` subclasses" count with a phantom surface.
   Packet: same. **Fix:** delete it, or wire it up and delete the duplicate positioner popovers —
   not both.

---

## 12. Relationship to this packet's own tasks

- `tasks.md` T5-T10 (Stage 2 — runtime census) remain open; this document is the "static list" T10
  asks to diff a runtime log against, not a substitute for opening each surface on a phone profile.
- T7 ("Record what the 3 `FuzzySuggestModal` subclasses do") is answered structurally here (§3): all
  three currently bypass every plugin mechanism. The classification decision (sheet / not-a-sheet /
  out-of-scope) itself is still open.
- §11 items 1-3 correspond to the operator's two hand-found defects plus one this census surfaced
  independently (table record peek); items 4-7 are new findings from this pass with no prior report.
