---
title: "src/views/modals: dialog surfaces"
description: "The plugin's modal dialogs: the Obsidian Modal subclasses that create databases and properties, edit formulas and status options, confirm destructive or importing actions, and resolve property-type conflicts."
trigger_phrases:
  - "note database modals dialogs"
  - "obsidian modal subclasses plugin"
  - "where is the add database modal"
---

# src/views/modals: dialog surfaces

`src/views/modals/` holds the plugin's dialog surfaces. Each file is an Obsidian `Modal` subclass
that opens over a view to create, edit, confirm or configure something: a new database, a new
property, a formula, status options, an export, or a conflict resolution. They read from
`src/data/` and are opened from the renderers in the parent folder.

---

## 1. OVERVIEW

A modal is a focused, one-task surface. It gathers input, validates it against the data layer, and
hands the result back to the caller. The dialogs group into creation, editing, confirmation and
configuration. See [`CODE.md`](./CODE.md) for which file does which.

---

## 2. STRUCTURE

| File | Dialog |
|---|---|
| `AddDatabaseModal.ts` | Create a new database |
| `AddDatabaseFlow.ts` | The multi-step add-database flow |
| `CreatePropertyModal.ts` | Create a property with name, key and type |
| `CreateRecordIconFieldModal.ts` | Add a record-icon field |
| `ColumnRenameModal.ts` | Rename a column |
| `FormulaModal.ts` | Edit a formula |
| `StatusOptionsModal.ts` | Edit status options and colors |
| `StatusPresetManagerModal.ts` | Manage status presets |
| `RelationRollupConfigModal.ts` | Configure a relation rollup |
| `CsvMarkdownExportModal.ts` | Export to CSV and Markdown |
| `BaseImportConfirmModal.ts` | Confirm properties from an imported Base file |
| `ComputedFrontmatterCleanupModal.ts` | Confirm computed-frontmatter cleanup |
| `InvalidTimeEventsModal.ts` | Resolve events with invalid times |
| `PropertyTypeConflictModal.ts` | Resolve a property-type conflict |
| `DeleteDatabaseModal.ts` | Confirm deleting a database |
| `ConfirmModal.ts` | The shared confirm dialog |

---

## 3. RELATED

- [`CODE.md`](./CODE.md) — the code map for this folder.
- [`../README.md`](../README.md) — the renderers that open these dialogs.
</content>
