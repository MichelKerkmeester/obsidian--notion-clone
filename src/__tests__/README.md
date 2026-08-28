---
title: "src/__tests__: Vitest global setup"
description: "The shared Vitest setup for the plugin test suites: the single setup module that runs before the data-layer and view unit tests."
trigger_phrases:
  - "vitest global setup obsidian plugin"
  - "test setup src __tests__"
---

# src/__tests__: Vitest global setup

`src/__tests__/` holds the global Vitest setup that runs before the plugin's unit tests. It carries
no test cases of its own. The suites it prepares live next to the code they cover, under
`src/data/__tests__/` and beside the renderers in `src/views/`.

---

## 1. OVERVIEW

`setup.ts` is loaded once per Vitest run to establish the shared test environment the plugin's
suites assume. It is the only file here, so this folder owes a README and no code map.

| File | Role |
|---|---|
| `setup.ts` | Global test setup executed before the suites run |

---

## 2. VALIDATION

Run from the repository root.

```bash
npx vitest run
```

Expected result: the suites run against the environment this setup establishes and pass.

---

## 3. RELATED

- [`../README.md`](../README.md) — the source root.
- [`../data/__tests__/README.md`](../data/__tests__/README.md) — the data-layer suites.
</content>
