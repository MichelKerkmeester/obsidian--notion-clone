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
| `scan-comments.mjs` | Every source file carries a `MODULE:` banner and numbered box-drawing sections, no commented-out code, and no ephemeral artifact id (comment hygiene, below) |
| `scan-folder-docs.mjs` | Folders carry `README.md` and, above the threshold, `CODE.md` |

---

## 2. COMMENT HYGIENE (ARTIFACT IDS)

`scan-comments.mjs` also enforces the comment-hygiene hard block: a task id (`T001`), an
ADR/REQ/CHK/AC id, a packet number used as a label (`045-`, `045's`, `per 045`), or a numbered
spec-folder path (`specs/047-...`) planted in a comment or a `describe`/`it`/`test` name rots the
day the id it points at is renamed or closed. It scans `src/**/*.ts`, `tools/**/*.{ts,mjs,js}` and
`styles.css`. This has no baseline — a hard block with a ratchet is a suggestion — so the target is
always zero. A durable spec-folder path (`specs/context/...`, a vendored fixture that is not a
numbered packet) is not matched; a numbered packet path is.

A commit that reintroduces one is rejected before it lands: see
[`../git-hooks/README.md`](../git-hooks/README.md).

---

## 3. QUICK START

```bash
node tools/naming/scan-folder-docs.mjs
node tools/naming/scan-comments.mjs --json
node tools/naming/scan-naming.mjs
```

Expected result: each prints its counts and exits `0` when the tree is clean, `1` otherwise.

---

## 4. RELATED

- [`scan-comments.test.mjs`](./scan-comments.test.mjs) — coverage for the comment-grammar checks and the artifact-id hard block above, driven through the scanner's exported `scanText()`.
- [`CODE.md`](./CODE.md) — the code map for this folder.
- [`../README.md`](../README.md) — the tooling root.
</content>
