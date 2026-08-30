---
title: "tools/bench: the render benchmarks"
description: "Measures how the real TableRenderer and ListRenderer scale in headless Chrome — by row count, column count and how full the data is — which is what turns a performance intuition into a decision with numbers behind it."
trigger_phrases:
  - "obsidian plugin render benchmark"
  - "table render scaling rows"
  - "list render freeze measurement"
  - "windowing decision measurement"
---

# tools/bench: the render benchmarks

`tools/bench/` drives the **real** renderers at several shapes in headless Chrome and reports how
cost scales. The table bench exists because the performance research reached a deliberate UNKNOWN
and set a gate — support windowing only if measurement concentrates cost in table DOM and layout —
and a gate is worthless without an instrument. The list bench exists because a list view froze the
app on a device and no check in the repository could see it.

## 1. QUICK START

```
npm run bench        # TableRenderer, by row and column count
npm run bench:list   # ListRenderer, also by fill rate and column type
```

Prints medians, p95, forced layout, DOM node counts and milliseconds per row. Raw samples land in
`dist/samples.json` and `dist/list-samples.json`.

`bench:list` takes shape overrides, because the defect that motivated it only appears at scale:

```
node tools/bench/run-list.mjs --cols=21 --fill=0.3 --rows=400,800,1600 --repeats=1
node tools/bench/run-list.mjs --kind=mixed
```

It exits non-zero when the worst single render exceeds its budget. Fill rate is the axis nothing
else varies: at 100% every fixture in the repository looks the same whether the renderer skips an
empty property or reserves its column, which is why the regression shipped.

## 2. WHAT THE TABLE BENCH FOUND

Rendering into the live document is quadratic: per-row cost rises roughly thirtyfold between 100 and
2,000 rows, and a 2,000-row, 16-column table takes over half a minute. Building off-document and
attaching once is 99–182× faster and near-linear.

Forced layout is a rounding error by comparison — 74 ms against a 32-second render — so the cost is
in the JavaScript loop, not in layout.

The full write-up, including why this argues against windowing as the first fix and the measurement
trap waiting for whoever implements the real change, is in
`specs/public/003-ui-improvement-build/023-performance-research/baseline-finding.md`.

## 3. WHAT IT DOES NOT MEASURE

Row preparation, the metadata cache, computed-field evaluation, relation rollups and the refresh
coordinator's queueing all need a live vault and are out of scope here. Cell content is
constant-time by design, which isolates structural cost — a slow cell renderer would confound the
thing being measured.

Read the output as one input to a performance decision, never as the whole picture.

## 4. RELATED

- `CODE.md` — the topology, what each bench varies, and how to read the output
- `tools/storybook/` — supplies the Obsidian DOM shim and stub both benches reuse
- `specs/public/003-ui-improvement-build/023-performance-research/` — the research and the finding
