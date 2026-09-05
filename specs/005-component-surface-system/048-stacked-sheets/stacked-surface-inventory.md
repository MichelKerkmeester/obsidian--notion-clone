---
title: "Stacked Surface Inventory: Every Child That Opens Over a Parent Sheet"
description: "Code-derived census of every surface that can open while another sheet is already open on the phone, grouped parent sheet to child surface to opener kind, with the behaviour the code produces today and the behaviour the stacking model requires."
trigger_phrases:
  - "stacked surface inventory"
  - "stacked sheet inventory"
  - "parent sheet child surface"
  - "sheet on sheet census"
  - "048 inventory"
importance_tier: "high"
contextType: "research"
---
# Stacked surface inventory

Every surface that can open **while another sheet is already open**. Derived by reading the openers,
not by opening the app: each row cites the `file:line` that constructs the child. What a phone
actually shows is the runtime half, and T003 is where the two are diffed.

**This extends `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md`; it does not
restate it.** That document is the per-surface census — twenty `DbModal` subclasses, twenty-seven
positioner popovers, thirteen owned menus, what each one is and whether it conforms on its own. It
never asks which surface opens over which, because when it was written the answer did not matter: a
first sheet was still broken. This document adds only the stacking axis. Where a surface's own
conformance is the question, that document answers it.

---

## 1. WHY EVERY ROW BELOW BEHAVES THE SAME WAY TODAY

Four mechanisms, all shared, none of which knows a stack exists. Every "current" cell in §3 is a
consequence of these, which is why the table has so few distinct current behaviours.

| # | Mechanism | Where | What it does to a second sheet |
|---|---|---|---|
| M1 | **One z-index for every sheet** | `styles.css:194` — `z-index: var(--db-layer-modal, 1000) !important` | Two sheets are ordered by DOM position on the body alone. A child paints over its parent because it was appended later, not because anything ranked them. |
| M2 | **One scrim for all sheets** | `mobile-bottom-sheet.ts:478` `setScrim`, `:237` CSS at `calc(var(--db-layer-modal) - 1)` | One `.db-mobile-sheet-scrim` node is created by the first sheet and removed by the last. It sits behind **both**, so a parent under a child is not dimmed. The module's own comment states this is deliberate: *"One backdrop is shared by however many sheets are open."* |
| M3 | **No parent read on child mount** | `mobile-bottom-sheet.ts:274` `setSheetMount` | Mounting a sheet appends it to `document.body` and adds it to a `Set`. Nothing looks at what was already in that set. No opacity, no transform, no inert, no depth. |
| M4 | **Per-sheet keyboard inset** | `popover-position.ts:406` (`placeSheet`), `:447` (`keepSheetPlaced`) | Each sheet writes its own `--db-mobile-sheet-bottom` when its own placement last ran. `keepSheetPlaced`'s doc comment already records the divergence as measured: *"a menu sheet sitting at `bottom 844 -> 844 -> 844` beside a panel sheet going `844 -> 508 -> 844` under the same declared keyboard. Two sheets on one screen answering the same signal differently is the defect."* |

**A fifth, and it is the one that makes a fix cheap.** `overlay-stack.ts:47` declares
`parentId?: string` on `OverlaySurfaceOptions` and `:54` stores it on the surface. `rg -n "parentId" src/views`
returns **zero reads** — the field is written and never consulted. The stack already has the shape a
depth model needs and no consumer for it.

**A sixth, specific to dropdowns, and it explains the nesting.** `getDropdownPopoverHost`
(`dropdown-field.ts:379-384`) resolves a dropdown's host by `anchor.closest(".note-database-container")`.
A portalled sheet is given that exact class by `setSheetMount` (`mobile-bottom-sheet.ts:305-306`) so
the plugin's ancestor-scoped CSS keeps matching. So a dropdown opened from inside a sheet is
**created as a child of that sheet**, then immediately portalled back out to the body by
`applySheetChrome` — and `originalMount` remembers the parent sheet as its home. Closing the
dropdown reinserts it into the parent; a parent rebuilt in the meantime is detached, and the branch
at `mobile-bottom-sheet.ts:337-340` removes the child instead. From a modal the host is
`doc.body` directly (`dropdown-field.ts:380`), so the same control takes two different paths
depending on what opened it.

---

## 2. THE OPENER KINDS

Six, and a seventh that is deliberately not a sheet.

| Kind | Producer | Chrome a stacked child gets today |
|---|---|---|
| **K1 dropdown sheet** | `dropdown-field.ts:187` `openDropdownPopover` → `positionToolbarPopover` | Sheet surface, grab handle, drag-to-dismiss, keyboard subscription. **No header, no title, no close** — `createSheetHeader` is never called here. |
| **K2 owned menu** | `owned-menu.ts:164` `showAt` → `applySheetChrome` + `placeSheet` + `keepSheetPlaced` | Sheet surface, grab handle, drag, capturing scrim, kept placed. **No header, no title, no close.** |
| **K3 Obsidian `Modal` via `DbModal`** | `modals/db-modal.ts:70` `applyPresentation` | Chrome applied to `modalEl`, grab handle, drag → `this.close()`. **No `createSheetHeader`** except `CreateLinkedViewModal` (`:59`). Obsidian's own close button and content box remain, which is the seam visible in the operator's capture. |
| **K4 native `FuzzySuggestModal`** | `main.ts:2954`, `markdown-file-suggest-modal.ts:16`, `image-file-suggest-modal.ts:22` | **Nothing.** No plugin chrome at all. `003`'s inventory §3 is the standing record. |
| **K5 native Obsidian `Menu`** | `calendar-timeline-renderer.ts:959` — the one remaining `new Menu()` | **Nothing.** Obsidian's own menu chrome. |
| **K6 picker popover** | `icon-picker-popover.ts:229`, `option-color-picker.ts:104`, `date-value-picker.ts:400` | Reaches `positionToolbarPopover`, so sheet surface + handle + drag. **No header, no title, no close.** |
| **K7 inline cell editor** | `cell-renderer.ts:2383`, `:1825`, `:2678` — `db-cell-edit-popover is-mobile is-inline-overlay` | Deliberately **not** a sheet (`003` inventory §9). It docks rather than stacks and claims the bottom edge through `claimBottomDock`. In scope only for the claim arbitration, not for the grammar. |

---

## 3. THE INVENTORY

**Target** is the same sentence for almost every row, and that is the finding: one stacking model
serves them all. Rows whose target differs say so.

Shorthand for the shared target: **`STACK`** = child overlays the parent in place; parent dims and
scales back with its bounding box unchanged; one scrim, between them; child carries a header with a
title and a 44px close, 16px row inset, 16px title; keyboard inset on the child only; drag-to-dismiss
on the child moves the child alone; a child taller than the viewport scrolls inside itself with a
visible fade; dismissing the child restores the parent's scroll, drafts and focus.

### 3.1 Filter sheet — `filter-panel-renderer.ts:218`, header + close at `:259`

| # | Child surface | Opener | Kind | Current, as the code shows | Target |
|---|---|---|---|---|---|
| F1 | Property picker | `filter-panel-renderer.ts:480` `createDropdownField` (`db-filter-field-dropdown`) | K1 | Created inside the filter sheet (M6), portalled to body, docked `bottom: 0` at the same z-index. No header, title or close. Covers the parent completely at 14 properties; list clipped at the sheet's own bottom edge with no fade. **This is `stacked-filter-property-picker.png`.** | `STACK` |
| F2 | Operator picker | `filter-panel-renderer.ts:510` `createDropdownField` (`db-filter-operator-dropdown`) | K1 | Same construction. Five options, so a short sheet at `bottom: 0` while the parent still holds a keyboard inset from the value field it was pushed off (M4) — two sheets splitting the viewport with a black gap. **This is `stacked-filter-operator-dropdown.png`.** | `STACK` |
| F3 | Value picker, select/status | `filter-panel-renderer.ts:569` | K1 | As F1. | `STACK` |
| F4 | Value picker, checkbox | `filter-panel-renderer.ts:590` | K1 | As F1. | `STACK` |
| F5 | Conjunction picker (AND/OR/NOT) | `filter-panel-renderer.ts:357` | K1 | As F1. | `STACK` |
| F6 | Date value picker | `filter-panel-renderer.ts:554` `renderDateValuePicker` → `date-value-picker.ts:400` | K6 | Sheet chrome, no header or close. The positioner's own comment (`popover-position.ts:229-236`) records that this picker's commit refreshes the filter panel and destroys the trigger button while the picker survives — a stacked child outliving its parent's anchor. | `STACK`, and the child must survive a parent rebuild without being orphaned |

### 3.2 Sort sheet — `sort-panel-renderer.ts:117`, header + close at `:113`

| # | Child surface | Opener | Kind | Current | Target |
|---|---|---|---|---|---|
| S1 | Field picker | `sort-panel-renderer.ts:215` | K1 | As F1. | `STACK` |
| S2 | Direction picker | `sort-panel-renderer.ts:232` | K1 | As F1. | `STACK` |

### 3.3 Properties sheet (column manager) — `column-manager-renderer.ts:148`; header hand-built at `:166`, **no close**

| # | Child surface | Opener | Kind | Current | Target |
|---|---|---|---|---|---|
| P1 | **Create property** | `column-manager-renderer.ts:107-112` `+ Add column` → `database-view.ts:5057` → `:5509` `new CreatePropertyModal` | K3 | `create-property-modal.ts:76` declares `sheet`, so `modalEl` gets the chrome and a drag; the modal never calls `createSheetHeader`, so there is no title row and no 44px close of ours. The parent Properties sheet is neither dimmed nor scaled (M3) and stays fully drawn above it. **This is `stacked-properties-create-property.png`.** | `STACK` — and D1 decides whether it stays a `Modal` presented as a sheet or the phone flow becomes a sheet |
| P2 | Property type picker | `create-property-modal.ts:139` `createDropdownField` | K1 | A **third** level. Its host resolves to `doc.body` rather than the modal (`dropdown-field.ts:380`), so the two dropdowns in this chain are constructed by different paths. | `STACK` at depth 3 |
| P3 | Per-column overflow menu | `column-manager-renderer.ts:126` `openDropdownMenu` | K1 | As F1. | `STACK` |

**The parent sheet itself is non-conforming and that is `044`'s row, not this packet's:**
`column-manager-renderer.ts:166` builds `db-panel-header` and a title by hand and never calls
`createSheetHeader`, so the Properties sheet has no close button of its own.

### 3.4 Settings sheet (view config) — `view-config-panel-renderer.ts:382`, header + `renderSheetClose` at `:388`

The widest parent in the tree: thirteen dropdown call sites, an icon picker and two native modals.

| # | Child surface | Opener | Kind | Current | Target |
|---|---|---|---|---|---|
| V1 | Thirteen dropdown fields — view type, source rules, conditional format, record-icon field, status presets, board field list | `view-config-panel-renderer.ts:601, 833, 855, 873, 946, 1003, 1237, 1298, 1378, 1398, 1419, 1784, 2094` | K1 | As F1, thirteen times. | `STACK` |
| V2 | Ad-hoc dropdown menu | `view-config-panel-renderer.ts:1523` `openDropdownMenu` | K1 | As F1. | `STACK` |
| V3 | Icon picker | `view-config-panel-renderer.ts:1045` `openIconPickerPopover` → `icon-picker-popover.ts:229` | K6 | Sheet chrome via the positioner; no header, title or close. A 318px-wide grid docked full width. | `STACK` |
| V4 | **Template file picker** | `view-config-panel-renderer.ts:626` `new MarkdownFileSuggestModal(...).open()` | K4 | **No plugin chrome whatsoever.** Obsidian's own fuzzy-suggest surface opens over a sheet that keeps its scrim and its dock claim. | D1's second half: a sheet, or an explicit, recorded exemption |
| V5 | **Cover image picker** | `view-config-panel-renderer.ts:668` `new ImageFileSuggestModal(...).open()` | K4 | As V4. | As V4 |
| V6 | Board Properties section | same sheet body, `viewConfigVariant: "board"` | — | Not a stack: the same sheet's own section. Listed so it is not counted twice. | n/a |

### 3.5 Record sheet — `record-detail-panel.ts`, opened at `database-view.ts:11650`

Every field in the record sheet is a potential opener, routed through one action.

| # | Child surface | Opener | Kind | Current | Target |
|---|---|---|---|---|---|
| R1 | Select / status value menu | `database-view.ts:11660` `editCell` → `cell-renderer.ts:860` `openDropdownMenu` | K1 | As F1, over the record sheet. | `STACK` |
| R2 | Date / datetime editor | `cell-renderer.ts:1825` `db-cell-edit-popover db-date-edit-popover` | K7 then K6 | Docks rather than stacks on the inline path; the calendar body reaches `date-value-picker.ts:400` and becomes a sheet. Two shapes for one control. | Settle which of the two a phone gets; the sheet path takes `STACK` |
| R3 | Relation / rollup editor | `cell-renderer.ts:898` `editRelationPopover` (`:1093` per `003`'s census) | K6 | Positioner-hosted; no header, title or close. | `STACK` |
| R4 | Option colour picker | `cell-renderer.ts:1488` `openOptionColorPicker` → `option-color-picker.ts:104` | K6 | 124px swatch grid docked full width, no header. | `STACK` |
| R5 | Column context menu from a record row | `database-view.ts:11662` `showColumnMenu` → `column-menu.ts:95` `createOwnedMenu` | K2 | Owned-menu sheet over the record sheet. No header, title or close. Its scrim captures, and it is the same single scrim node the record sheet is already using (M2). | `STACK` |
| R6 | Column-menu submenus — type, number style, text style | `column-menu.ts:224`, `:257`, `:386` → `createColumnMenuSubpopover` `:597` → `positionToolbarPopover` | K1 | **Depth 3**: record sheet → owned menu → submenu sheet, all three at one z-index, one scrim behind all three. | `STACK` at depth 3 |
| R7 | Inline text / number editor | `cell-renderer.ts:2383`, `:2678` | K7 | By design not a sheet. Claims the bottom dock (`mobile-bottom-sheet.ts:431`). | Unchanged; only the dock claim is arbitrated |

### 3.6 Add view sheet — `toolbar-renderer.ts:1426`, header + close at `:1386`

| # | Child surface | Opener | Kind | Current | Target |
|---|---|---|---|---|---|
| A1 | Title-property and view-type dropdowns | `toolbar-renderer.ts` `createDropdownField` sites | K1 | As F1. | `STACK` |
| A2 | ~~Native `<select>` key-field picker~~ | ~~`toolbar-renderer.ts:1371`~~ | ~~native~~ | **Closed.** `rg 'createEl\("select"' src` returns nothing in this tree; `044` T008 replaced it. Recorded because `003`'s inventory §8 still names it. | n/a |

### 3.7 All-views hub — `toolbar-renderer.ts:1138`

| # | Child surface | Opener | Kind | Current | Target |
|---|---|---|---|---|---|
| H1 | Per-row overflow menu | `toolbar-renderer.ts:1120` `createOwnedMenu` | K2 | Owned-menu sheet over the hub sheet. | `STACK` |
| H2 | Change-layout menu | `toolbar-renderer.ts:1141-1145` `showViewTypeChangeMenu` | K2 | **Not a stack, and it is the counter-example worth keeping.** The handler calls `this.closeViewTabPopover()` first, so the hub is gone before the menu opens. One surface at a time, reached by choosing to replace rather than to stack. | Unchanged — a deliberate replace stays a replace |

### 3.8 Modal-on-modal chains

Reached from a sheet, so every link is a stack level.

| # | Chain | Opener | Kind | Current | Target |
|---|---|---|---|---|---|
| M-1 | `AddDatabaseModal` → `StatusPresetManagerModal` | `add-database-modal.ts:158` | K3 → K3 | Two `DbModal` sheets, no header on either, no parent treatment. | `STACK` |
| M-2 | `StatusPresetManagerModal` → `StatusOptionsModal` | `status-preset-manager-modal.ts:160` | K3 → K3 | As M-1. | `STACK` |
| M-3 | `AddDatabaseFlow` → `BaseImportConfirmModal` | `add-database-flow.ts:104` | K3 | As M-1; the confirm then opens its own dropdown at `base-import-confirm-modal.ts:121`. | `STACK` at depth 3 |
| M-4 | Any destructive action inside a sheet → `ConfirmModal` | `confirm-modal.ts:98` `openAndWait` | K3 | A confirm sheet over whatever asked for it, with no header and no parent treatment. The most common stack in the plugin. | `STACK` |
| M-5 | `FormulaModal`, `PropertyTypeConflictModal`, `RelationRollupConfigModal`, `CreateLinkedViewModal` → dropdowns | `formula-modal.ts:274/443/454`, `property-type-conflict-modal.ts:248`, `relation-rollup-config-modal.ts:237`, `create-linked-view-modal.ts:65/77` | K3 → K1 | The first two present `fullscreen`, so the dropdown stacks over a full-screen surface rather than a sheet — a third arrangement. `CreateLinkedViewModal` is the one modal that calls `createSheetHeader` (`:59`). | `STACK`; `fullscreen` parents need their own rule, named in `spec.md` §6 |

### 3.9 Toolbar option popovers

| # | Parent | Child | Opener | Kind | Current | Target |
|---|---|---|---|---|---|---|
| T1 | Chart options (`chart-toolbar-renderer.ts:347`) | Child popovers — `003`'s census records this surface as explicitly two-level | `chart-toolbar-renderer.ts` `createDropdownField` ×2 | K1 | Hand-built `db-panel-header` at `:343`, no `db-sheet-close`. Children as F1. | `STACK` |
| T2 | Calendar options (`calendar-toolbar-renderer.ts:98`) | 2 dropdowns | `calendar-toolbar-renderer.ts` | K1 | Header at `:89`, no close. | `STACK` |
| T3 | Timeline options (`calendar-timeline-toolbar-renderer.ts:74`) | 2 dropdowns | same file | K1 | Header at `:69`, no close. | `STACK` |
| T4 | Group-by popover (`toolbar-renderer.ts:1717`) | Grouping dropdowns | `toolbar-renderer.ts` | K1 | As F1. | `STACK` |
| T5 | Gantt "depends elsewhere" chip | native `Menu` | `calendar-timeline-renderer.ts:959` | K5 | The one `new Menu()` left in `src`. No chrome at all, and it can open over the timeline options sheet. | Replace with `createOwnedMenuForEvent`, then `STACK` |

---

## 4. WHAT THE LANE COVERS, AND WHAT IT DOES NOT

`tools/live/sheet-grammar.mjs:46-68` registers **eight** surfaces:

`sort-panel`, `filter-panel`, `add-view`, `record-detail`, `record-peek`, `column-width`,
`settings`, `board-card-properties`.

**Every one of them is a first sheet. Not one stacked pair is registered**, so every child in §3 is
unregistered by construction — the lane cannot fail on any of them. Named individually, the
unregistered stacked children are:

1. Every **K1 dropdown sheet**: F1-F5, S1-S2, P2-P3, V1-V2, R1, A1, T1-T4, M-3, M-5 — the single
   largest class, and the one both operator screenshots landed on.
2. Every **K2 owned menu** opened from a sheet: R5, H1, and the thirteen `createOwnedMenu` call
   sites `003`'s inventory §5 lists, whenever the row they belong to is already inside a sheet.
3. Every **K3 `DbModal` sheet** opened from a sheet: P1, M-1, M-2, M-3, M-4, M-5 — twenty subclasses
   are in scope, of which `ConfirmModal` (M-4) is reachable from nearly every parent.
4. Both **K4 `FuzzySuggestModal`s** reachable from the settings sheet: V4, V5.
5. Every **K6 picker**: F6, V3, R2, R3, R4.
6. The one **K5 native `Menu`**: T5.
7. Every **depth-3 chain**: P1→P2, R5→R6, M-3, M-5.

`044`'s `sheet-grammar` lane and this packet's lane rows are the same lane. A stacked pair is added
as `parent+child`, and the negative control removes the parent's dim rather than the child's handle,
so the control proves the stacking assertion rather than re-proving `044`'s.

---

## 5. WHAT THIS DOCUMENT DOES NOT SETTLE

Read the code, not the phone. Three things static reading cannot answer, and each is a task:

- **Which sheet actually holds the keyboard inset in the operator's captures.** M4 makes the
  divergence possible and `keepSheetPlaced`'s comment records it as measured elsewhere; that the
  filter sheet in `stacked-filter-operator-dropdown.png` is lifted by roughly a keyboard's height
  while its own dropdown sits on the floor is **consistent with** M4 and is not proof of it. T003
  measures both `--db-mobile-sheet-bottom` values with a declared keyboard. What refutes it: both
  sheets reading the same value, which would move the cause to the height cap instead.
- **What the third layer in `stacked-properties-create-property.png` is.** Read as three sheets it
  is Properties → an unidentified sheet → the modal. Read against `db-modal.ts:70`, which applies
  chrome to `modalEl` while `contentEl` carries `note-database-modal`'s own background, the middle
  band is the modal's own chrome plus Obsidian's close button and there are two surfaces, not
  three. T002 settles it by naming the nodes on the body. It does not change the row: either way
  the parent is undimmed and unmoved.
- **Whether closing a child restores the parent's state.** `filter-panel-renderer.ts:472-475`'s
  `rerender` calls `render()`, which removes and recreates the panel node, and `originalMount`
  (`mobile-bottom-sheet.ts:255`) points a closing child back at whichever node was its parent when
  it opened. Whether a real selection produces an orphaned child or a reset parent is a runtime
  question (T003).
