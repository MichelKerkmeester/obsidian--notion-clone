---
title: "src/views/record-surface: primitive topology"
description: "Code map for the record/property primitive family: which module is already wired to a consumer through a shim, which is built beside its consumers and not yet switched on, and the boundary that keeps a consumer from hosting its own copy."
trigger_phrases:
  - "record surface code map"
  - "property row primitive topology"
  - "cell editor dispatch contract"
---

# src/views/record-surface: primitive topology

---

## 1. OVERVIEW

`src/views/record-surface/` is a flat folder of primitive modules, one per shared shape. Every
module is a plain function or a small factory — no class, no framework, no persisted state
beyond what a caller's own closure carries across a re-render.

Current state:

- `property-row.ts`'s display value renderer is live: `card-field-renderer.ts` calls into it
  instead of keeping its own copy, so the record sheet, the board card, the gallery card and the
  list card already render through this module.
- `record-header.ts`, `add-property-row.ts`, `hidden-properties.ts` and the corrected half of
  `property-row.ts` (the trued-up row shell and the single-select/multi-select split) are built
  and unit-tested but not yet wired to a live renderer — no existing capture depends on them.
- `cell-editor-contract.ts` pins `CellRenderer.startEdit`'s type-to-editor mapping ahead of any
  method body moving; every entry that names an extracted module is red until that module lands.

---

## 2. TOPOLOGY BY ROLE

| Role | Modules |
|---|---|
| Wired today (via a shim) | `property-row.ts` (display value renderer) |
| Built beside consumers, not yet wired | `record-header.ts`, `add-property-row.ts`, `hidden-properties.ts`, `property-row.ts` (row shell + option-value split) |
| Pinned contract, no code moved yet | `cell-editor-contract.ts` |

---

## 3. KEY FILES

| File | Responsibility |
|---|---|
| `index.ts` | Barrel export plus `RECORD_SURFACE_PRIMITIVES`, the table a census reads to count how many primitives exist |
| `property-row.ts` | `renderPropertyValue` (the shim target), `buildPropertyRow` and `renderOptionValue` (the corrected shell) |
| `record-header.ts` | `buildDesktopRecordHeader` (reproduces the record sheet's own DOM) and `buildPhoneRecordHeader` (delegates to `createSheetHeader`) |
| `cell-editor-contract.ts` | `CELL_EDITOR_DISPATCH_CONTRACT`, cross-checked against `cell-renderer.ts`'s own dispatch by its test |

---

## 4. BOUNDARIES AND FLOW

| Boundary | Rule |
|---|---|
| Imports | `../../data/`, sibling view helpers (`../checkbox`, `../field-tooltip`, and similar), `obsidian` types. Never a consumer file in the parent folder — that would invert the ownership this family exists to fix |
| Exports | Each module exports plain functions and their option/handle interfaces; no default exports |
| Ownership | One shape, one module. A consumer imports; it does not keep a parallel copy "for now" |

Main flow, for the primitives already wired:

```text
╭──────────────────────────────────────────╮
│ A consumer (e.g. renderCardField) builds  │
│ its field shell                           │
╰──────────────────────────────────────────╯
                  │
                  ▼
┌──────────────────────────────────────────┐
│ It calls into record-surface for the      │
│ value/row/group it needs                  │
└──────────────────────────────────────────┘
                  │
                  ▼
╭──────────────────────────────────────────╮
│ The primitive renders into the caller's   │
│ own element, mutating nothing else        │
╰──────────────────────────────────────────╯
```

---

## 5. ENTRYPOINTS

| Entrypoint | Type | Purpose |
|---|---|---|
| `renderPropertyValue` | Function (`property-row.ts`) | The value half of a property row, called by `card-field-renderer.ts` today |
| `buildDesktopRecordHeader` / `buildPhoneRecordHeader` | Functions (`record-header.ts`) | The header block, awaiting its first consumer switch |
| `createHiddenPropertiesGroup` | Factory (`hidden-properties.ts`) | The collapsed group, holding expanded state across rebuilds |
| `buildAddPropertyRow` | Function (`add-property-row.ts`) | The search-first add-property affordance |
| `CELL_EDITOR_DISPATCH_CONTRACT` | Data (`cell-editor-contract.ts`) | The pinned type-to-editor mapping the extraction is measured against |

---

## 6. VALIDATION

Run from the repository root.

```bash
npx tsc --noEmit
npx vitest run src/views/record-surface
npm run screenshots:verify
```

Expected result: the type-check is clean, every primitive's unit tests pass, and the screenshot
gate reports no capture depending on this folder's still-unwired primitives (only
`property-row.ts`'s shimmed value renderer touches anything a fixture already draws).

---

## 7. RELATED

- [`README.md`](./README.md)
- [`../CODE.md`](../CODE.md) — the renderers and modals this family is converging.
