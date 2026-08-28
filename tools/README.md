---
title: "tools: repository tooling"
description: "The repository's Node tooling: the convention scanners under naming/ that gate filenames, comments and folder docs, and the screenshot harness under screenshots/ that photographs the shipped stylesheet."
trigger_phrases:
  - "obsidian plugin tools folder"
  - "convention scanners screenshot harness"
---

# tools: repository tooling

`tools/` holds the repository's Node tooling. It carries no source files of its own. Two
subfolders do the work: `naming/` runs the convention scanners that gate the source tree, and
`screenshots/` runs the headless-Chrome harness that photographs the shipped stylesheet.

---

## 1. OVERVIEW

The tooling here is standalone Node ESM. Nothing in `src/` imports it. Each tool is a command run
from the repository root through `npm run` scripts or directly with `node`.

- `naming/` proves the source tree follows its conventions: kebab-case filenames, `MODULE:`
  banners and numbered sections, and paired folder docs.
- `screenshots/` renders `styles.css` against mock data and fingerprints each shot so the images
  in `screenshots/` stay honest to the source.

---

## 2. STRUCTURE

```text
tools/
+-- naming/        # Convention scanners (naming, comments, folder docs)
`-- screenshots/   # Headless-Chrome capture and verify harness
    `-- scenarios/ # One scenario module per surface family
```

| Path | Role |
|---|---|
| `naming/` | The three source-gate scanners |
| `screenshots/` | Capture, verify and the scenario registry |
| `screenshots/scenarios/` | The per-surface scenario modules |

---

## 3. RELATED

- [`CODE.md`](./CODE.md) — the code map for this folder.
- [`naming/README.md`](./naming/README.md) — the convention scanners.
- [`screenshots/README.md`](./screenshots/README.md) — the screenshot harness.
</content>
