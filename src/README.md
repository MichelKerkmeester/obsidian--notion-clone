---
title: "src: Note Database plugin source"
description: "The TypeScript source root for the Note Database Obsidian plugin: the plugin entrypoint, its settings and locale files, and the data and view layers underneath."
trigger_phrases:
  - "note database plugin src"
  - "obsidian plugin source root"
  - "where does the plugin start"
---

# src: Note Database plugin source

`src/` holds every TypeScript source file the plugin bundles. `main.ts` is the Obsidian
entrypoint. Everything a database view computes lives under `data/`, everything it draws lives
under `views/`, and `settings.ts` and `i18n.ts` sit alongside as the settings surface and the
locale dictionaries.

---

## 1. OVERVIEW

The plugin turns Markdown notes into editable database views inside Obsidian. `main.ts` registers
the two view types and the command palette entries, reads and writes the vault, and wires the data
layer to the renderers. The heavy logic is split by concern:

- `data/` owns the model and the pure logic: columns, formulas, filters, grouping, relations,
  charts, calendar and timeline models, and export. No DOM.
- `views/` owns the rendering: one renderer per view plus the cells, panels, popovers and modals
  they open.

Read `main.ts` first to see how a database view is constructed, then follow it into `data/` for a
computation or `views/` for a surface.

---

## 2. STRUCTURE

```text
src/
+-- main.ts        # Plugin entrypoint: view registration, commands, vault IO
+-- settings.ts    # Settings tab and its modal
+-- i18n.ts        # Locale dictionaries and the translate helper
+-- data/          # Model and pure logic (no DOM)
+-- views/         # Renderers, cells, panels, popovers, modals
`-- __tests__/     # Vitest global setup
```

| Path | Role |
|---|---|
| `main.ts` | The `NoteDatabasePlugin` class, view and command registration, file lifecycle |
| `settings.ts` | Plugin settings tab and the settings modal |
| `i18n.ts` | `LocaleCode` union and the string dictionaries the UI reads |
| `data/` | Database model, formulas, filters, grouping, relations, charts, export |
| `views/` | View renderers and every interactive surface they build |
| `__tests__/` | Global test setup shared by the Vitest suites |

---

## 3. RELATED

- [`CODE.md`](./CODE.md) — the code map for this folder.
- [`data/README.md`](./data/README.md) — the data and logic layer.
- [`views/README.md`](./views/README.md) — the rendering layer.
</content>
