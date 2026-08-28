---
title: "src/data: logic topology by concern"
description: "Code map for the plugin's data layer: how ~120 DOM-free modules group into columns and types, the query pipeline, formulas, relations, temporal models, charts and export, and the one-way boundary that keeps this layer independent of the renderers."
trigger_phrases:
  - "data layer code map obsidian plugin"
  - "query engine formulas relations grouping"
  - "data views dependency boundary"
---

# src/data: logic topology by concern

---

## 1. OVERVIEW

`src/data/` is a flat folder of focused, DOM-free modules. Each owns one concern in the pipeline
that turns vault notes into the rows a view shows. `types.ts` carries the shapes the rest of the
plugin shares.

Current state:

- Pure logic only. No module here imports from `src/views/`.
- Grouped below by purpose rather than listed one by one, because the folder holds around 120
  source modules.
- Directly unit-tested under `__tests__/`.

---

## 2. ARCHITECTURE

```text
╭──────────────────────────────────────────────────────────────────╮
│                            src/data                              │
╰──────────────────────────────────────────────────────────────────╯

┌─────────────┐    ┌────────────────┐    ┌────────────────┐
│ DataSource  │ ─▶ │ QueryEngine    │ ─▶ │ Grouping /     │
│ SourceRules │    │ FilterRules    │    │ Sorting        │
└─────────────┘    └───────┬────────┘    └────────┬───────┘
                           │                      │
                           ▼                      ▼
                   ┌───────────────┐      ┌───────────────┐
                   │ Computed /    │      │ Relations /   │
                   │ Formulas      │      │ Rollups       │
                   └───────────────┘      └───────────────┘

Consumed by src/views renderers. This layer imports none of them.
```

---

## 3. TOPOLOGY BY CONCERN

| Concern | Representative modules |
|---|---|
| Shared types | `types.ts`, `MomentTypes.ts` |
| Sourcing and pipeline | `DataSource.ts`, `SourceRules.ts`, `RowPipeline.ts`, `DatabaseFileOrder.ts`, `CreateEntryPlan.ts`, `RecordTemplate.ts` |
| Query, filter, sort | `QueryEngine.ts`, `FilterRules.ts`, `ViewFilterTree.ts`, `Search.ts`, `ViewSelection.ts` |
| Grouping and order | `GroupDisplay.ts`, `GroupOrder.ts`, `GroupVisibility.ts`, `MultiFieldGrouping.ts`, `MultiGroupDisplay.ts`, `ManualOrder.ts` |
| Columns and property types | `ColumnConfig.ts`, `ColumnDisplay.ts`, `ColumnTypes.ts`, `FilesColumn.ts`, `PropertyService.ts`, `PropertyTypeConflict.ts`, `OptionRegistration.ts`, `MultiSelect.ts`, `TitleFieldDisplay.ts` |
| Value display | `NumberDisplay.ts`, `DateTimeFormat.ts`, `EuroFormat.ts`, `StatusColors.ts`, `InlineMarkdown.ts`, `TextLink.ts`, `textLinkScheme.ts` |
| Formulas and computed fields | `BaseExpression.ts`, `ComputedEvaluator.ts`, `ComputedField.ts`, `ComputedSync.ts`, `ComputedCleanup.ts`, `ComputedDiagnostic.ts`, `FormulaFields.ts`, `FormulaIfsSwitchMath.ts`, `FormulaTokenizer.ts`, `LetVariables.ts`, `SafeEval.ts`, `SafeString.ts`, `Stringify.ts`, `Aggregate.ts` |
| Relations and rollups | `RelationInverse.ts`, `RelationLinks.ts`, `RelationRollup.ts`, `RelationTargetChange.ts` |
| Conditional formatting | `ConditionalFormatting.ts`, `ConditionalFormatParser.ts`, `ConditionalFormatEditor.ts`, `ConditionalFormatColumnOps.ts` |
| Charts | `ChartAggregation.ts`, `ChartJsSetup.ts`, `ChartPalettes.ts`, `ChartViewModel.ts` |
| Calendar and timeline models | `CalendarDateTime.ts`, `CalendarInteractionModel.ts`, `CalendarLayoutModel.ts`, `CalendarTimelineModel.ts`, `CalendarTimelineSearchResults.ts`, `CalendarTitleFormatter.ts`, `InvalidTimeEvents.ts` |
| Editing and clipboard | `BulkEdit.ts`, `ClipboardSerializer.ts`, `TablePastePlan.ts`, `RangeSelection.ts`, `TableKeyboardNavigation.ts`, `KeyboardUtils.ts`, `PhysicalShortcutGuard.ts`, `TouchEnvironment.ts` |
| Files and vault | `FileFields.ts`, `FileRenamePlan.ts`, `UniqueIdStamp.ts`, `VaultProperties.ts`, `FrontmatterScanner.ts` |
| Icons and covers | `IconPickerCatalog.ts`, `RecordIcon.ts`, `CoverImage.ts`, `CoverWiring.ts` |
| Export and reports | `CsvMarkdownZipExport.ts`, `ZipExport.ts`, `ExportSaveTarget.ts`, `ReportsDisplay.ts`, `ReportsInspector.ts`, `ReportsComputedConfig.ts` |
| Refresh and scheduling | `RefreshBlockers.ts`, `RefreshCoordinator.ts`, `SerialTaskQueue.ts` |

---

## 4. BOUNDARIES AND FLOW

| Boundary | Rule |
|---|---|
| Imports | Obsidian and Node types are allowed. `src/views/` is not |
| Exports | Each module exports its own functions and types. `types.ts` is the shared contract |
| Ownership | Computation and model shape live here. Rendering lives in `src/views/` |

Main flow:

```text
╭──────────────────────────────────────────╮
│ DataSource gathers records                │
╰──────────────────────────────────────────╯
                  │
                  ▼
┌──────────────────────────────────────────┐
│ FilterRules / ViewFilterTree narrow them  │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ QueryEngine sorts and groups into rows    │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ Computed fields and rollups derive values │
└──────────────────────────────────────────┘
                  │
                  ▼
╭──────────────────────────────────────────╮
│ Rows handed to a src/views renderer       │
╰──────────────────────────────────────────╯
```

---

## 5. ENTRYPOINTS

| Entrypoint | Type | Purpose |
|---|---|---|
| `DataSource` | Module (`DataSource.ts`) | Gathers records for a database from the vault |
| `QueryEngine` | Module (`QueryEngine.ts`) | Produces the filtered, sorted, grouped rows |
| `types.ts` | Module | The shared type contracts every layer reads |

---

## 6. VALIDATION

Run from the repository root.

```bash
npx vitest run
npx tsc --noEmit
```

Expected result: the data-layer suites under `__tests__/` pass and the type-check is clean.

---

## 7. RELATED

- [`README.md`](./README.md)
- [`__tests__/CODE.md`](./__tests__/CODE.md)
- [`../views/CODE.md`](../views/CODE.md)
</content>
