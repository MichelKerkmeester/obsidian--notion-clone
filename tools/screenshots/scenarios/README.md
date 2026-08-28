---
title: "tools/screenshots/scenarios: per-surface scenarios"
description: "One scenario module per surface family: shared fixtures, application chrome, core views, field and cell surfaces, panels and overlays, and temporal surfaces. Each defines the mock DOM the capture harness photographs."
trigger_phrases:
  - "screenshot scenario modules"
  - "chrome core fields panels temporal scenarios"
  - "mock db- fixtures for capture"
---

# tools/screenshots/scenarios: per-surface scenarios

`tools/screenshots/scenarios/` holds one scenario module per surface family, so several can be
authored at once without contending for a single file. Each module defines the mock `db-*` DOM for
its surfaces and names the source files behind each shot. `scenarios.mjs` in the parent folder
aggregates them into the `SCENARIOS` registry.

---

## 1. OVERVIEW

A scenario is a mock render of one surface: an id, a title, the source files it depicts, and the
HTML the harness photographs. `_shared.mjs` supplies the fixtures every module reuses (rows,
columns, icons and small builders). The other five modules each own one surface family.

| File | Surface family |
|---|---|
| `_shared.mjs` | Shared fixtures: rows, columns, icons and DOM builders |
| `chrome.mjs` | Application chrome: the toolbar and everything it hangs off |
| `core.mjs` | Core views: table, board and the dense grid surfaces |
| `fields.mjs` | Field and cell surfaces: editors, pickers and value renderers |
| `panels.mjs` | Panels and overlays the toolbar opens over a view |
| `temporal.mjs` | Temporal surfaces: calendar, week grid, mini calendar and timeline |

---

## 2. RELATED

- [`CODE.md`](./CODE.md) — the code map for this folder.
- [`../README.md`](../README.md) — the capture harness that renders these.
</content>
