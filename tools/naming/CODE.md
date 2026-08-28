---
title: "tools/naming: scanner topology"
description: "Code map for the three convention scanners: the shared walk-then-check-then-report shape each follows, what each one gates, their JSON and exit-code contract, and their read-only relationship to the tree they scan."
trigger_phrases:
  - "naming scanners code map"
  - "walk check report scanner shape"
  - "folder docs scanner threshold"
---

# tools/naming: scanner topology

---

## 1. OVERVIEW

`tools/naming/` is a flat folder of three standalone Node ESM scanners. Each follows the same
walk-then-check-then-report shape and shares no code with the others, so a reader who understands one
understands all three.

Current state:

- Node built-ins only (`node:fs`, `node:path`, `node:url`). No dependency.
- Each takes `--json` and exits `0` clean, `1` on violations.
- Read-only. None writes, renames or deletes a scanned file.

---

## 2. KEY FILES

| File | Responsibility |
|---|---|
| `scan-naming.mjs` | Walks `src/` and `tools/`, checks each file stem against a lowercase-kebab regex |
| `scan-comments.mjs` | Checks each source file for a `MODULE:` banner, paired numbered box-drawing sections, and commented-out code |
| `scan-folder-docs.mjs` | Builds a folder tree and enforces the `README.md`/`CODE.md` threshold in both directions |

---

## 3. SHARED SHAPE

Each scanner is organized under numbered sections: `1. IMPORTS`, `2. CONFIGURATION`, `3. HELPERS`,
`4. SCAN`, `5. REPORT`.

```text
[src/ + tools/ tree] -> walk -> per-file or per-folder check -> violations[]
                        -> stdout (text or --json) -> exit code (0 clean, 1 violations)
```

For `scan-folder-docs.mjs`, the threshold is: a folder owes both `README.md` and `CODE.md` when it
has three or more direct source files, or any child folder that itself carries source. Below that it
owes `README.md` only, and a `CODE.md` sitting there anyway is a stray-doc violation.

---

## 4. BOUNDARIES AND FLOW

| Boundary | Rule |
|---|---|
| Imports | `node:fs`, `node:path`, `node:url` only |
| Exports | None. Each is a CLI entry point run with `node` |
| Ownership | Convention gates over `src/` and `tools/`. No plugin runtime code |

---

## 5. ENTRYPOINTS

| Entrypoint | Type | Purpose |
|---|---|---|
| `node tools/naming/scan-naming.mjs [--json]` | CLI | Report non-kebab filenames |
| `node tools/naming/scan-comments.mjs [--json]` | CLI | Report missing banners, missing sections and commented-out code |
| `node tools/naming/scan-folder-docs.mjs [--json]` | CLI | Report missing, stray or unpaired folder docs |

---

## 6. VALIDATION

Run from the repository root.

```bash
node tools/naming/scan-folder-docs.mjs
```

Expected result: exit `0` and a PASS line once every folder holds the docs its source count requires.

---

## 7. RELATED

- [`README.md`](./README.md)
- [`../CODE.md`](../CODE.md) — the tooling root.
</content>
