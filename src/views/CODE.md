---
title: "src/views: rendering topology by concern"
description: "Code map for the plugin's rendering layer: how ~90 renderers group into view bodies, table internals, cell and field renderers, panels and popovers, calendar internals and the view-container core, and the one-way dependency on src/data."
trigger_phrases:
  - "views layer code map obsidian plugin"
  - "table renderer cell panel popover map"
  - "views depend on data not reverse"
---

# src/views: rendering topology by concern

---

## 1. OVERVIEW

`src/views/` is a flat folder (plus `modals/`) of DOM-building modules. Each owns one surface or one
piece of a surface. Renderers read computed rows from `src/data/` and emit `db-*` class structures
that `styles.css` styles and the screenshot harness photographs.

Current state:

- Around 90 direct source modules, grouped below by purpose.
- `modals/` holds the Obsidian `Modal` subclasses.
- The layer depends on `src/data/`. `src/data/` never depends on it.

---

## 2. ARCHITECTURE

```text
╭──────────────────────────────────────────────────────────────────╮
│                            src/views                             │
╰──────────────────────────────────────────────────────────────────╯

┌─────────────┐    ┌────────────────┐    ┌────────────────┐
│ DatabaseView│ ─▶ │ ToolbarRenderer│ ─▶ │ Panels /       │
│ (container) │    │ (controls)     │    │ Popovers       │
└──────┬──────┘    └────────────────┘    └────────────────┘
       │
       ▼
┌────────────────┐    ┌────────────────┐
│ View renderer  │ ─▶ │ Cell / field   │
│ Table, Board…  │    │ renderers      │
└────────────────┘    └────────────────┘

Reads rows from src/data. Emits db-* DOM styled by styles.css.
```

---

## 3. TOPOLOGY BY CONCERN

| Concern | Representative modules |
|---|---|
| View container and state | `DatabaseView.ts`, `DatabaseFileView.ts`, `DatabaseViewport.ts`, `ViewStateStore.ts`, `ViewRuleOperations.ts` |
| View bodies | `TableRenderer.ts`, `BoardRenderer.ts`, `GalleryRenderer.ts`, `ChartRenderer.ts`, `CalendarRenderer.ts`, `CalendarTimelineRenderer.ts`, `EmbeddedDatabaseRenderer.ts` |
| Table internals | `CellRenderer.ts`, `ColumnHeaderController.ts`, `ColumnManagerRenderer.ts`, `ColumnMenu.ts`, `ColumnOperations.ts`, `ColumnPropertySync.ts`, `ColumnWidth.ts`, `TableColumnLayoutSync.ts`, `TableFooterRenderer.ts`, `TableLayout.ts`, `TableRecordPeek.ts`, `RowMenu.ts` |
| Cell and field renderers | `CardFieldRenderer.ts`, `FileFieldRenderer.ts`, `FileTitleDisplay.ts`, `DropdownField.ts`, `DateValuePicker.ts`, `DatePickerModel.ts`, `NumberDisplayRenderer.ts`, `RelationValueRenderer.ts`, `RecordIconRenderer.ts`, `PropertyTypeIcon.ts`, `InlineMarkdownRenderer.ts`, `FieldTooltip.ts` |
| Toolbar, panels, popovers | `ToolbarRenderer.ts`, `ChartToolbarRenderer.ts`, `CalendarToolbarRenderer.ts`, `CalendarTimelineToolbarRenderer.ts`, `FilterPanelRenderer.ts`, `SortPanelRenderer.ts`, `ViewConfigPanelRenderer.ts`, `ActiveViewControlsRenderer.ts`, `ActiveRulePopoverRenderer.ts`, `IconPickerPopover.ts`, `OptionColorPicker.ts`, `BulkEditFieldMenu.ts`, `RecordDetailPanel.ts` |
| Grouping and summaries | `GroupLabelRenderer.ts`, `GroupExpandControls.ts`, `SummaryRenderer.ts` |
| Calendar internals | `CalendarMiniCalendarRenderer.ts`, `CalendarKeyboardNavigation.ts`, `CalendarToolbarRenderer.ts` |
| Interaction and overlays | `InteractionScope.ts`, `InteractionSnapshot.ts`, `OverlayStack.ts`, `PopoverPosition.ts`, `PopoverAutoClose.ts`, `EdgeAutoScroller.ts`, `DragDropFeedback.ts`, `CardRovingTabindex.ts`, `HoverLinkPreview.ts`, `DomGuards.ts`, `MobileMoveIcon.ts` |
| Suggest and workflow | `ImageFileSuggestModal.ts`, `MarkdownFileSuggestModal.ts`, `PropertyTypeConflictWorkflow.ts`, `SearchHighlight.ts`, `EmptyStateRenderer.ts` |
| Modal dialogs | `modals/` (see [`modals/CODE.md`](./modals/CODE.md)) |

---

## 4. BOUNDARIES AND FLOW

| Boundary | Rule |
|---|---|
| Imports | `src/data/` and Obsidian are allowed. A renderer does not reach back into `main.ts` |
| Exports | `DatabaseView` and `DatabaseFileView` are the view types `main.ts` registers |
| Ownership | DOM construction and interaction. The `db-*` class names emitted here are the contract with `styles.css` and the screenshot harness |

Main flow:

```text
╭──────────────────────────────────────────╮
│ DatabaseView opens with rows from data/    │
╰──────────────────────────────────────────╯
                  │
                  ▼
┌──────────────────────────────────────────┐
│ ToolbarRenderer draws the controls        │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ The active view renderer draws the body   │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ Cell, panel and popover renderers fill in │
└──────────────────────────────────────────┘
                  │
                  ▼
╭──────────────────────────────────────────╮
│ db-* DOM styled by styles.css             │
╰──────────────────────────────────────────╯
```

---

## 5. ENTRYPOINTS

| Entrypoint | Type | Purpose |
|---|---|---|
| `DatabaseView` | Class (`DatabaseView.ts`) | The main database view Obsidian registers |
| `DatabaseFileView` | Class (`DatabaseFileView.ts`) | The database-file dashboard view |
| `ToolbarRenderer` | Module (`ToolbarRenderer.ts`) | Builds the toolbar and view switcher |

---

## 6. VALIDATION

Run from the repository root.

```bash
npx vitest run
npm run screenshots:verify
```

Expected result: the view suites pass and every screenshot still matches its sources.

---

## 7. RELATED

- [`README.md`](./README.md)
- [`modals/CODE.md`](./modals/CODE.md)
- [`../data/CODE.md`](../data/CODE.md)
</content>
