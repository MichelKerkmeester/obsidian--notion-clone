---
title: "src/data/__tests__: data-layer unit tests"
description: "The Vitest suites for the plugin's data layer: computed fields and let-variables, formula evaluation, the filter tree, and the text-link scheme."
trigger_phrases:
  - "data layer unit tests obsidian plugin"
  - "computed field formula filter tree tests"
---

# src/data/__tests__: data-layer unit tests

`src/data/__tests__/` holds the Vitest suites that exercise the pure logic in `src/data/`. Each
suite targets one concern: computed fields, formula evaluation, the filter tree, or the text-link
scheme. Because the data layer never touches the DOM, these run without a browser.

---

## 1. OVERVIEW

The suites here are the proof that the data layer computes correctly. They import modules from
`src/data/` directly and assert on their output. See [`CODE.md`](./CODE.md) for which suite covers
which module.

| File | Covers |
|---|---|
| `ComputedField.let.test.ts` | `let`-scoped variables inside computed fields |
| `LetVariables.test.ts` | The `let`-variable parser and binding |
| `computed-formulas.test.ts` | Formula evaluation end to end |
| `ViewFilterTree.test.ts` | The nested filter tree and its logic combinators |
| `textLinkScheme.test.ts` | The text-link scheme parsing and rendering rules |

---

## 2. VALIDATION

Run from the repository root.

```bash
npx vitest run
```

Expected result: every suite in this folder passes.

---

## 3. RELATED

- [`CODE.md`](./CODE.md) — the map of suite to module under test.
- [`../README.md`](../README.md) — the data layer these suites cover.
</content>
