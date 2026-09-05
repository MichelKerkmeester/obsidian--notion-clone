---
title: "src/views/record-surface: record and property primitives"
description: "The shared record/property building blocks — header, property row, add-property row, hidden-properties group, and the cell-editor dispatch contract — consumed by the record sheet, the table peek, the properties panels and the board card."
trigger_phrases:
  - "note database record surface primitives"
  - "shared property row header hidden group"
  - "record-surface module family"
---

# src/views/record-surface: record and property primitives

`src/views/record-surface/` holds the record/object primitives this family converges on: one
header builder, one property-row vocabulary, one add-property affordance, one hidden-properties
group, and the pinned type-to-editor dispatch the per-type cell editors extract behind. A
consumer imports from here; none of them hosts a copy.

---

## 1. OVERVIEW

The property row used to exist three times — once in `card-field-renderer.ts`, once in
`table-record-peek.ts`, once hand-duplicated between the properties panel and the board-card
properties panel — and every fix had to be made once per copy. This folder is where the shared
shape lives instead. `card-field-renderer.ts`'s value renderer is now a re-export shim over
`property-row.ts`; the other consumers switch onto these primitives as later work lands.

See [`CODE.md`](./CODE.md) for which module builds what, and which are already wired to a
consumer versus built beside one and not yet consumed.

---

## 2. STRUCTURE

| File | Primitive |
|---|---|
| `index.ts` | Barrel and the contract table naming every primitive below |
| `record-header.ts` | Header block: icon, title, open, close — desktop and phone variants |
| `property-row.ts` | Property row: the display value renderer every card calls today, plus the corrected row shell and option-value split |
| `add-property-row.ts` | The search-first "add a property" affordance |
| `hidden-properties.ts` | The collapsed hidden-properties group with a count |
| `cell-editor-contract.ts` | The pinned `CellRenderer.startEdit` dispatch, ahead of the per-type editor extraction |

---

## 3. RELATED

- [`CODE.md`](./CODE.md) — the code map for this folder.
- [`../CODE.md`](../CODE.md) — the renderers and modals that consume these primitives.
