---
title: "tools/bench: the table render benchmark"
description: "Measures how the real TableRenderer's cost scales with row count in headless Chrome, which is what turns the windowing question from an intuition into a decision with numbers behind it."
trigger_phrases:
  - "obsidian plugin render benchmark"
  - "table render scaling rows"
  - "windowing decision measurement"
---

# tools/bench: the table render benchmark

`tools/bench/` drives the **real** `TableRenderer` at several row and column counts in headless
Chrome and reports how cost scales. It exists because the performance research reached a deliberate
UNKNOWN and set a gate — support windowing only if measurement concentrates cost in table DOM and
layout — and a gate is worthless without an instrument.

## 1. QUICK START

```
npm run bench
```

Prints medians, p95, forced layout, DOM node counts and milliseconds per row, for both an attached
and a detached build. Raw samples land in `dist/samples.json`.

## 2. WHAT IT FOUND

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

- `tools/storybook/` — supplies the Obsidian DOM shim and stub this bench reuses
- `specs/public/003-ui-improvement-build/023-performance-research/` — the research and the finding
