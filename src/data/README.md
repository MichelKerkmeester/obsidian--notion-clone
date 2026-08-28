---
title: "src/data: model and pure logic"
description: "The DOM-free data layer of the plugin: columns and property types, formulas, filtering, grouping, relations and rollups, chart and calendar models, and export. Every renderer under src/views reads from here."
trigger_phrases:
  - "note database data layer"
  - "plugin model formulas filters logic"
  - "where is the query engine"
---

# src/data: model and pure logic

`src/data/` is the plugin's logic layer. It computes what a database view shows without drawing
anything. Columns and property types, formulas, filters, grouping, relations, rollups, charts, the
calendar and timeline models, and export all live here. The renderers under `src/views/` consume
these modules, never the other way around.

---

## 1. OVERVIEW

A database view is a pipeline: source rules pick records, filters narrow them, grouping and sorting
arrange them, and computed fields and rollups derive values. This folder owns every step of that
pipeline as pure logic, plus the type contracts the whole plugin shares (`types.ts`). Because
nothing here touches the DOM, the logic is unit-tested directly under `__tests__/`.

Start with `types.ts` for the shared shapes, `DataSource.ts` for how records are gathered, and
`QueryEngine.ts` for how a view's rows are produced.

---

## 2. STRUCTURE

```text
src/data/
+-- types.ts             # Shared type contracts
+-- DataSource.ts        # Record gathering from the vault
+-- QueryEngine.ts       # Filter, sort and group into view rows
+-- ...                  # ~120 focused logic modules by concern
`-- __tests__/           # Unit tests for the logic here
```

The folder is flat: each concern is one or a few modules. See [`CODE.md`](./CODE.md) for the
grouped map of what lives here.

---

## 3. RELATED

- [`CODE.md`](./CODE.md) — the grouped code map.
- [`../views/README.md`](../views/README.md) — the renderers that consume this layer.
- [`__tests__/README.md`](./__tests__/README.md) — the data-layer unit tests.
</content>
