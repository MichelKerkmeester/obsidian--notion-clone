---
title: "tools/naming: convention scanners"
description: "The three Node source-gate scanners that make the plugin's target conventions executable: kebab-case filenames, MODULE banners with numbered sections, and paired README/CODE folder docs."
trigger_phrases:
  - "obsidian plugin naming scanners"
  - "scan-naming scan-comments scan-folder-docs"
  - "source convention gates"
---

# tools/naming: convention scanners

`tools/naming/` holds the three scanners that turn the plugin's source conventions into gates. Each
walks `src/` and `tools/`, reports violations, and exits non-zero when it finds any, so a convention
is enforced by a failing check rather than a promise.

---

## 1. OVERVIEW

Each scanner owns one convention and runs standalone with `node`. All three take `--json` for
machine-readable output and exit `0` when clean, `1` when they find violations. They are the first
files in the repository to follow the grammar they enforce.

| File | Convention it gates |
|---|---|
| `scan-naming.mjs` | Filenames are lowercase kebab-case |
| `scan-comments.mjs` | Every source file carries a `MODULE:` banner and numbered box-drawing sections, and no commented-out code |
| `scan-folder-docs.mjs` | Folders carry `README.md` and, above the threshold, `CODE.md` |

---

## 2. QUICK START

```bash
node tools/naming/scan-folder-docs.mjs
node tools/naming/scan-comments.mjs --json
node tools/naming/scan-naming.mjs
```

Expected result: each prints its counts and exits `0` when the tree is clean, `1` otherwise.

---

## 3. RELATED

- [`CODE.md`](./CODE.md) — the code map for this folder.
- [`../README.md`](../README.md) — the tooling root.
</content>
