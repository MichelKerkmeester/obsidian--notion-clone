---
title: "tools/bench: harness topology and flow"
description: "Code map for the render benchmark: how it bundles a real renderer into headless Chrome, and why the reported shape of the scaling matters more than any single duration."
trigger_phrases:
  - "render benchmark code map"
  - "table render scaling harness"
  - "per-row cost superlinear measurement"
---

# tools/bench: harness topology and flow

---

## 1. OVERVIEW

`tools/bench/` holds a benchmark that answers a simple question about the table renderer: does cost
stay proportional to the work asked for, or does it run away.

- `table-render-bench.ts` + `run.mjs` — the `TableRenderer`, varied by row and column count. Written
  to settle whether windowing was worth building.

It bundles the shipped renderer rather than a copy, runs it in the same headless Chrome the other
harnesses use, and reports per-row cost so the shape of the curve is visible rather than inferred.

The list renderer had its own bench here — `list-render-bench.ts` + `run-list.mjs`, varied by fill
rate and column type as well as row count — retired with the list renderer itself. `renderer-coverage.json`
carries the note recording the floor it lowered.

---

## 2. ARCHITECTURE

```text
╭──────────────────────────────────────────────────────────────────╮
│                          tools/bench                             │
╰──────────────────────────────────────────────────────────────────╯

┌──────────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ src/views/*-renderer │ ──▶ │ *-render-bench   │ ──▶ │ run*.mjs         │
│ (the shipped code)   │     │ fixture + timing │     │ esbuild + Chrome │
└──────────────────────┘     └──────────────────┘     └────────┬─────────┘
                                                                │
              ┌─────────────────────────────────────────────────┤
              ▼                                                 ▼
      ┌──────────────────┐                            ┌──────────────────┐
      │ dist/*.json      │                            │ stdout: per-row  │
      │ raw samples      │                            │ cost + verdict   │
      └──────────────────┘                            └──────────────────┘
```

`tools/storybook/` supplies the Obsidian DOM shim and the module stub the bench reuses, so it needs
no vault and reimplements nothing the plugin does at runtime.

---

## 3. READING THE OUTPUT

Per-row cost (`ms/row`) is the number that matters, read across two row counts at the same column
count. Flat means row count multiplies a constant and a large table is merely slower; rising means
something in the loop scales with what is already on screen, and no amount of tuning the constant
will save it. `run.mjs` reports the shape directly — `LINEAR`, `SUPERLINEAR` or `SUBLINEAR` — from
the drift between the first and last sample's per-row cost at each column count.

`nodes` counts every DOM node the render produced; `layout` is the forced layout separated from
`median`'s render time, so a change that moves cost from one to the other is visible rather than
absorbed into a single number. The DETACHED block repeats the same measurement built off-document
and attached once, which is what the table renderer actually does — building in the live document
first was the comparison that motivated it.

---

## 4. WHAT IT DOES NOT MEASURE

Row preparation, the metadata cache, computed-field evaluation, relation rollups and the refresh
coordinator's queueing all need a live vault. Field values are constant-time by design, which
isolates structural cost — a real database with expensive cells pays more than this reports, never
less. Read the output as one input to a decision, not the whole picture.

---

## 5. RELATED

- `tools/storybook/` — the DOM shim and module stub the bench reuses
- `tools/storybook/verify-placement.mjs` — measures where the same renderers put things, rather than
  how long they take
