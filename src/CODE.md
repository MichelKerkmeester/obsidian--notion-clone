---
title: "src: source topology and control flow"
description: "Code map for the plugin source root: the entrypoint that registers the two view types and commands, the settings and locale files beside it, and the data and view layers it drives."
trigger_phrases:
  - "note database src code map"
  - "plugin entrypoint main.ts flow"
  - "data views layer boundary"
---

# src: source topology and control flow

---

## 1. OVERVIEW

`src/` is the plugin's TypeScript root. It owns the Obsidian entrypoint and splits the rest of the
plugin into a DOM-free data layer and a rendering layer.

Current state:

- `main.ts` exports `NoteDatabasePlugin` (extends Obsidian's `Plugin`) and is the only entrypoint.
- `data/` holds pure model and logic. `views/` holds everything that touches the DOM.
- `settings.ts` and `i18n.ts` are leaf modules the entrypoint and views read from.

---

## 2. ARCHITECTURE

```text
╭──────────────────────────────────────────────────────────────────╮
│                              src                                 │
╰──────────────────────────────────────────────────────────────────╯

┌─────────────┐      ┌────────────────┐      ┌────────────────┐
│ Obsidian    │ ───▶ │ main.ts        │ ───▶ │ views/         │
│ workspace   │      │ NoteDatabase-  │      │ renderers,     │
│ + commands  │      │ Plugin         │      │ panels, modals │
└─────────────┘      └───────┬────────┘      └────────┬───────┘
                             │                        │
                             ▼                        ▼
                     ┌───────────────┐        ┌───────────────┐
                     │ data/         │ ◀───   │ settings.ts   │
                     │ model + logic │        │ i18n.ts       │
                     └───────────────┘        └───────────────┘

Dependency direction: views/ ───▶ data/ ; main.ts ───▶ views/ + data/
data/ never imports views/
```

---

## 3. DIRECTORY TREE

```text
src/
+-- main.ts        # NoteDatabasePlugin, view registration, commands, vault IO
+-- settings.ts    # Settings tab and modal
+-- i18n.ts        # Locale dictionaries and translate helper
+-- data/          # Model and pure logic (no DOM)
+-- views/         # Renderers, cells, panels, popovers
|   `-- modals/    # Obsidian Modal subclasses
+-- __tests__/     # Vitest global setup
`-- data/__tests__/  # Data-layer unit tests
```

---

## 4. KEY FILES

| File | Responsibility |
|---|---|
| `main.ts` | Registers `DATABASE_VIEW_TYPE` and `DATABASE_FILE_VIEW_TYPE`, adds command-palette entries, opens and persists database files |
| `settings.ts` | The `PluginSettingTab` subclass and settings modal that edit `PluginSettings` |
| `i18n.ts` | The `LocaleCode` union and per-locale string dictionaries |

---

## 5. BOUNDARIES AND FLOW

| Boundary | Rule |
|---|---|
| Imports | `views/` imports from `data/`. `data/` imports Obsidian and Node types but never `views/` |
| Exports | `main.ts` is the plugin default export Obsidian loads. `DatabaseView` and `DatabaseFileView` come from `views/` |
| Ownership | Model and computation belong in `data/`. Anything that builds or mutates DOM belongs in `views/` |

Main flow:

```text
╭──────────────────────────────────────────╮
│ Obsidian loads the plugin                │
╰──────────────────────────────────────────╯
                  │
                  ▼
┌──────────────────────────────────────────┐
│ main.ts registerView + addCommand        │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ DatabaseView builds a DataSource (data/)  │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ views/ renderers draw the active view     │
└──────────────────────────────────────────┘
                  │
                  ▼
╭──────────────────────────────────────────╮
│ Edits write back to the Markdown file     │
╰──────────────────────────────────────────╯
```

---

## 6. ENTRYPOINTS

| Entrypoint | Type | Purpose |
|---|---|---|
| `NoteDatabasePlugin` | Class (`main.ts`) | The plugin Obsidian instantiates on load |
| `DatabaseView` | Class (`views/DatabaseView.ts`) | The main database view type |
| `DatabaseFileView` | Class (`views/DatabaseFileView.ts`) | The database-file dashboard view |

---

## 7. VALIDATION

Run from the repository root.

```bash
npx tsc --noEmit
npx vitest run
```

Expected result: type-check reports no errors and the Vitest suites pass.

---

## 8. RELATED

- [`README.md`](./README.md)
- [`data/CODE.md`](./data/CODE.md)
- [`views/CODE.md`](./views/CODE.md)
</content>
