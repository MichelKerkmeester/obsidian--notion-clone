---
title: "tools/bench: harness topology and flow"
description: "Code map for the two render benchmarks: how each bundles a real renderer into headless Chrome, what the list bench varies that nothing else does, and why the reported shape of the scaling matters more than any single duration."
trigger_phrases:
  - "render benchmark code map"
  - "list table render scaling harness"
  - "per-row cost superlinear measurement"
---

# tools/bench: harness topology and flow

---

## 1. OVERVIEW

`tools/bench/` holds two benchmarks that answer the same kind of question about different renderers:
does cost stay proportional to the work asked for, or does it run away.

- `table-render-bench.ts` + `run.mjs` — the `TableRenderer`, varied by row and column count. Written
  to settle whether windowing was worth building.
- `list-render-bench.ts` + `run-list.mjs` — the `ListRenderer`, varied by row count, column count,
  how full the data is, and which column types are present. Written after a list view froze the app.

Both bundle the shipped renderer rather than a copy, run it in the same headless Chrome the other
harnesses use, and report per-row cost so the shape of the curve is visible rather than inferred.

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

`tools/storybook/` supplies the Obsidian DOM shim and the module stub both benches reuse, so neither
needs a vault and neither reimplements anything the plugin does at runtime.

---

## 3. WHAT THE LIST BENCH VARIES, AND WHY

Fill rate is the axis nothing else in the repository moves. Every fixture, story and screenshot gives
a row every one of its properties, and at 100% fill a renderer that skips empty properties and one
that reserves their columns produce identical output. The difference only appears as the data gets
sparser, and it grows with column count — which is why a defect that tripled the elements in a list
was invisible to every check that existed.

`--kind=mixed` swaps plain text for the types whose renderers do real work: relation, multi-select,
date, number, currency, checkbox, and text in markdown mode. An empty value used to skip the
renderer entirely, so whatever those cost per field was previously never paid on a gap.

```
npm run bench:list
node tools/bench/run-list.mjs --cols=21 --fill=0.3 --rows=400,800,1600 --repeats=1
node tools/bench/run-list.mjs --kind=mixed
```

Both surfaces are measured on every run: desktop, where the row is a grid, and phone, where the same
element is a wrapping flex line under the class the stylesheet keys its mobile arm to. They are
different layouts with different costs and only one of them was ever the reported one.

---

## 4. READING THE OUTPUT

Per-row cost is the number that matters. Flat means row count multiplies a constant and a large list
is merely slower; rising means something in the loop scales with what is already on screen, and no
amount of tuning the constant will save it. It is a slope, so it needs two row counts: given one,
`run-list.mjs` prints `NO VERDICT` rather than dividing a sample by itself and reporting `LINEAR
×1.00` beside a seven-second render, which is what it used to do.

`run-list.mjs` fails on the `blocked` column — render plus the layout that render forced — not on
render alone. Blocking the main thread for seconds is not slow, it is the app hanging, and the two
halves block it identically. Splitting them also matters in one specific direction: the repair this
harness was built to verify works by moving a forced layout out of the row loop, so its cost leaves
`median` and arrives in `layout`. A budget on render alone would have scored that move as far larger
than it was, and would have passed a tree that renders in 100ms and then lays out for five seconds.

The `blanks` column counts reserved columns, and `nodes` counts everything. A change that holds a
column with a whole hidden field rather than an empty box shows up here as a node count that grew
without a field count that did. `blanks` is also surface-dependent by design: the desktop grid
reserves a column per empty property and the phone's wrapping line reserves none, so the phone rows
of a run carry fewer nodes than the desktop rows of the same shape.

---

## 5. WHAT NEITHER MEASURES

Row preparation, the metadata cache, computed-field evaluation, relation rollups and the refresh
coordinator's queueing all need a live vault. Field values are constant-time by design, which
isolates structural cost — a real database with expensive cells pays more than this reports, never
less. Read either output as one input to a decision, not the whole picture.

---

## 6. RELATED

- `tools/storybook/` — the DOM shim and module stub both benches reuse
- `tools/storybook/verify-placement.mjs` — measures where the same renderers put things, rather than
  how long they take
