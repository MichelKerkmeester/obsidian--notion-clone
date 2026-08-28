---
title: "tools: tooling topology"
description: "Code map for the repository tooling root: the two subfolders it orients (naming scanners and the screenshot harness), how they are invoked, and the fact that it holds no direct source itself."
trigger_phrases:
  - "tools code map obsidian plugin"
  - "naming screenshots tooling structure"
---

# tools: tooling topology

---

## 1. OVERVIEW

`tools/` is an orientation folder. It holds no direct source files, only the two subfolders that
carry the repository's Node tooling. It owes a code map because its job is pointing a reader at the
right subfolder.

Current state:

- `naming/` and `screenshots/` are independent. Neither imports the other.
- All tooling is standalone Node ESM run from the repository root.

---

## 2. DIRECTORY TREE

```text
tools/
+-- naming/          # scan-naming, scan-comments, scan-folder-docs
`-- screenshots/     # capture, verify, scenario registry
    `-- scenarios/   # per-surface scenario modules
```

---

## 3. KEY FOLDERS

| Folder | Responsibility |
|---|---|
| `naming/` | Source-gate scanners for filenames, comment grammar and folder docs |
| `screenshots/` | Headless-Chrome capture, the fingerprint verify gate, and the scenario registry |

---

## 4. BOUNDARIES AND FLOW

| Boundary | Rule |
|---|---|
| Imports | Node built-ins and, for the harness, `playwright-core`. Nothing from `src/` |
| Exports | Each tool is a CLI entry point, not an imported library |
| Ownership | Repository-quality gates and the screenshot pipeline. No plugin runtime code |

---

## 5. ENTRYPOINTS

| Entrypoint | Type | Purpose |
|---|---|---|
| `node tools/naming/scan-folder-docs.mjs` | CLI | Gate the folder-doc threshold |
| `npm run screenshots` | CLI | Capture every scenario |
| `npm run screenshots:verify` | CLI | Fail when a shot's sources changed |

---

## 6. VALIDATION

Run from the repository root.

```bash
node tools/naming/scan-folder-docs.mjs
npm run screenshots:verify
```

Expected result: the folder-doc scan exits 0 and every screenshot matches its sources.

---

## 7. RELATED

- [`README.md`](./README.md)
- [`naming/CODE.md`](./naming/CODE.md)
- [`screenshots/CODE.md`](./screenshots/CODE.md)
</content>
