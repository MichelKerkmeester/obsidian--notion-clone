---
title: "src/views/modals: dialog topology"
description: "Code map for the plugin's modal dialogs: how the Obsidian Modal subclasses group into creation, editing, confirmation and configuration, the shared ConfirmModal base, and the one-way dependency on the data layer."
trigger_phrases:
  - "modals code map obsidian plugin"
  - "confirm modal creation editing dialogs"
---

# src/views/modals: dialog topology

---

## 1. OVERVIEW

`src/views/modals/` is a flat folder of Obsidian `Modal` subclasses. Each opens over a view, gathers
one task's input, validates against `src/data/`, and returns a result to the renderer that opened it.

Current state:

- Seventeen dialogs, grouped below by intent.
- `ConfirmModal.ts` is the shared yes/no base the destructive dialogs build on.
- Dialogs read from `src/data/`. They do not import view bodies.

---

## 2. TOPOLOGY BY INTENT

| Intent | Modules |
|---|---|
| Creation | `AddDatabaseModal.ts`, `AddDatabaseFlow.ts`, `CreatePropertyModal.ts`, `CreateRecordIconFieldModal.ts` |
| Editing | `ColumnRenameModal.ts`, `FormulaModal.ts`, `StatusOptionsModal.ts`, `StatusPresetManagerModal.ts`, `GroupOrderModal.ts` |
| Configuration | `RelationRollupConfigModal.ts`, `CsvMarkdownExportModal.ts` |
| Confirmation | `ConfirmModal.ts`, `DeleteDatabaseModal.ts`, `BaseImportConfirmModal.ts`, `ComputedFrontmatterCleanupModal.ts`, `InvalidTimeEventsModal.ts`, `PropertyTypeConflictModal.ts` |

---

## 3. KEY FILES

| File | Responsibility |
|---|---|
| `ConfirmModal.ts` | The shared confirm dialog the destructive modals reuse |
| `AddDatabaseFlow.ts` | The multi-step flow that drives `AddDatabaseModal` |
| `FormulaModal.ts` | The formula editor dialog with live preview |
| `PropertyTypeConflictModal.ts` | Resolves a property whose type disagrees across records |

---

## 4. BOUNDARIES AND FLOW

| Boundary | Rule |
|---|---|
| Imports | `obsidian` `Modal`, `src/data/` and sibling modals. Not the view bodies in the parent folder |
| Exports | Each file exports its own `Modal` subclass |
| Ownership | One dialog per task. Shared confirm behavior lives in `ConfirmModal.ts` |

Main flow:

```text
╭──────────────────────────────────────────╮
│ A renderer opens a modal                  │
╰──────────────────────────────────────────╯
                  │
                  ▼
┌──────────────────────────────────────────┐
│ The modal gathers input                   │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ It validates against src/data             │
└──────────────────────────────────────────┘
                  │
                  ▼
╭──────────────────────────────────────────╮
│ The result returns to the caller          │
╰──────────────────────────────────────────╯
```

---

## 5. ENTRYPOINTS

| Entrypoint | Type | Purpose |
|---|---|---|
| `ConfirmModal` | Class (`ConfirmModal.ts`) | The base confirm dialog other modals extend or reuse |
| `AddDatabaseModal` | Class (`AddDatabaseModal.ts`) | The create-database entry dialog |
| `FormulaModal` | Class (`FormulaModal.ts`) | The formula editor |

---

## 6. VALIDATION

Run from the repository root.

```bash
npx tsc --noEmit
npm run screenshots:verify
```

Expected result: the type-check is clean and the modal screenshots still match their sources.

---

## 7. RELATED

- [`README.md`](./README.md)
- [`../CODE.md`](../CODE.md) — the rendering layer that opens these dialogs.
</content>
