---
title: "tools/screenshots/scenarios: scenario topology"
description: "Code map for the scenario modules: the shared fixture module every family imports, the five surface-family registries capture aggregates, the scenario shape, and the rule that every named source must be a real file."
trigger_phrases:
  - "scenario modules code map"
  - "shared fixtures surface family registries"
  - "scenario shape sources html"
---

# tools/screenshots/scenarios: scenario topology

---

## 1. OVERVIEW

`tools/screenshots/scenarios/` is a flat folder of scenario modules. One is shared fixtures, the
other five are surface-family registries. `../scenarios.mjs` imports the five and concatenates them
into `SCENARIOS`.

Current state:

- `_shared.mjs` exports the fixtures the family modules reuse. It defines no scenarios itself.
- Each family module exports one `*_SCENARIOS` array.
- Every scenario names the source files it depicts, and each must be a real file for `verify.mjs` to
  fingerprint it.

---

## 2. KEY FILES

| File | Exports | Responsibility |
|---|---|---|
| `_shared.mjs` | `ROWS`, `COLUMNS`, `ICONS`, `tableHeader`, `tableRows`, `boardColumn`, and other builders | Shared mock fixtures and DOM helpers |
| `chrome.mjs` | `CHROME_SCENARIOS` | The toolbar, view switcher, search and the chrome popovers |
| `core.mjs` | `CORE_SCENARIOS` | Table, board and the core view bodies |
| `fields.mjs` | `FIELDS_SCENARIOS` | Cell editors, pickers and value renderers |
| `panels.mjs` | `PANEL_SCENARIOS` | Filter, sort, column-manager and record panels |
| `temporal.mjs` | `TEMPORAL_SCENARIOS` | Calendar, week grid, mini calendar, timeline and their settings popovers |

---

## 3. SCENARIO SHAPE

Each entry carries an `id`, a `title`, a `group`, the `sources` it depicts and an `html` builder:

```text
{ id, title, group, width?, sources: ["src/views/…"], html: () => `<div class="note-database-container">…` }
```

`verify.mjs` hashes every path in `sources` plus `styles.css`, so a shot goes stale when any of them
changes. A `sources` path that does not resolve is reported as a missing source.

---

## 4. BOUNDARIES AND FLOW

| Boundary | Rule |
|---|---|
| Imports | `_shared.mjs` and Node built-ins. Family modules do not import each other |
| Exports | `_shared.mjs` exports fixtures. Each family module exports one `*_SCENARIOS` array |
| Ownership | Mock DOM and source lists. No plugin runtime code and no capture logic |

Main flow:

```text
╭──────────────────────────────────────────╮
│ _shared.mjs supplies fixtures             │
╰──────────────────────────────────────────╯
                  │
                  ▼
┌──────────────────────────────────────────┐
│ Each family module builds its scenarios   │
└──────────────────────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────┐
│ scenarios.mjs concatenates into SCENARIOS │
└──────────────────────────────────────────┘
                  │
                  ▼
╭──────────────────────────────────────────╮
│ capture.mjs renders each entry            │
╰──────────────────────────────────────────╯
```

---

## 5. ENTRYPOINTS

| Entrypoint | Type | Purpose |
|---|---|---|
| `CHROME_SCENARIOS`, `CORE_SCENARIOS`, `FIELDS_SCENARIOS`, `PANEL_SCENARIOS`, `TEMPORAL_SCENARIOS` | Exports | The five surface-family registries |
| `ROWS`, `COLUMNS`, `ICONS` | Exports (`_shared.mjs`) | The shared fixtures family modules reuse |

---

## 6. VALIDATION

Run from the repository root.

```bash
npm run screenshots:verify
```

Expected result: every scenario resolves its sources and matches its captured shot.

---

## 7. RELATED

- [`README.md`](./README.md)
- [`../CODE.md`](../CODE.md) — the capture harness.
</content>
