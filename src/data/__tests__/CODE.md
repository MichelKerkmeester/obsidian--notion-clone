---
title: "src/data/__tests__: suite-to-module map"
description: "Code map for the data-layer test folder: each Vitest suite, the src/data module it exercises, and the command that runs them."
trigger_phrases:
  - "data layer test map obsidian plugin"
  - "which suite covers which data module"
---

# src/data/__tests__: suite-to-module map

---

## 1. OVERVIEW

`src/data/__tests__/` is a flat folder of Vitest suites. Each imports directly from `src/data/` and
asserts on pure output, so no DOM or Obsidian runtime is involved.

Current state:

- Five suites, each scoped to one data-layer concern.
- No shared fixture module here. The global test setup lives at `src/__tests__/setup.ts`.

---

## 2. KEY FILES

| File | Module under test | What it checks |
|---|---|---|
| `ComputedField.let.test.ts` | `../ComputedField.ts`, `../LetVariables.ts` | `let` bindings resolve inside a computed field |
| `LetVariables.test.ts` | `../LetVariables.ts` | The `let`-variable parser and scope rules |
| `computed-formulas.test.ts` | `../ComputedEvaluator.ts`, `../FormulaFields.ts` | Formula evaluation produces the expected values |
| `ViewFilterTree.test.ts` | `../ViewFilterTree.ts` | Nested groups combine with AND, OR and NOT correctly |
| `textLinkScheme.test.ts` | `../textLinkScheme.ts`, `../TextLink.ts` | Text-link scheme parsing and output |

---

## 3. BOUNDARIES AND FLOW

| Boundary | Rule |
|---|---|
| Imports | Modules from `src/data/` and Vitest only. No renderer imports |
| Ownership | Assertions on data-layer output. No rendering assertions |

Main flow:

```text
╭──────────────────────────────────────────╮
│ Vitest loads src/__tests__/setup.ts       │
╰──────────────────────────────────────────╯
                  │
                  ▼
┌──────────────────────────────────────────┐
│ A suite imports a src/data module         │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ It asserts on the module's pure output    │
└──────────────────────────────────────────┘
                  │
                  ▼
╭──────────────────────────────────────────╮
│ Pass or fail reported to the runner       │
╰──────────────────────────────────────────╯
```

---

## 4. VALIDATION

Run from the repository root.

```bash
npx vitest run
```

Expected result: all five suites pass.

---

## 5. RELATED

- [`README.md`](./README.md)
- [`../CODE.md`](../CODE.md) — the data layer under test.
</content>
