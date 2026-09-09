# Archived: the chart view

The chart.js renderer — bar and number variants, aggregation over records (count/sum by group),
date and number bucketing, hidden-group absorption, reference lines, palette support and PNG
export/copy. A persisted chart view now opens as a table (the records themselves, sorted) through
the redirect shipped in 0.0.34; every `chart*` configuration field — aggregation, bucketing,
palette, reference lines — is the declared loss.

## Last-live SHA

```
e75a979c9a21f6f93967a40e24b2a58f474fa9d5  (origin/main when 0.0.34 was cut)
```

These bytes were last shipped in the 0.0.34 bundle.

## Restore procedure

From the repository root — this writes the file back at its original path, without touching the
copy beside this README:

```sh
git checkout e75a979c9a21f6f93967a40e24b2a58f474fa9d5 -- src/views/chart-renderer.ts
```

A restored chart needs, at minimum: its importer, field and dispatch/teardown legs back in
`src/views/database-view.ts` and `src/views/embedded-database-renderer.ts`, its entries back in
`src/views/rendered-view-roots.ts` (`obnotion-chart`, `obnotion-chart-empty`, `obnotion-chart-number`)
and the harness (`tools/live/render-assertion-bundle.mjs`'s `SCENARIOS`/`STATE_SCENARIOS`/
`RENDERER_SOURCES` and the `chart`/`chart-toolbar` branches of
`tools/live/render-assertion-harness.ts`), its capture scenario and `screenshots/manifest.json`
rows, and the chart rules restored in `styles.css`. `chart.js` stays in `package.json` while its
`src/data/chart-*.ts` modules survive the renderer. Compare against the last-live SHA before
assuming anything else.

## What is here

| Archived file | Original path | What it was |
|---|---|---|
| `chart-renderer.ts` | `src/views/chart-renderer.ts` | the chart renderer (`ChartRenderer`, the chart.js host) |

## What deliberately stayed

`src/views/chart-toolbar-renderer.ts` (the toolbar host still wires it) and the `src/data/`
aggregation/palette/view-model layer (`chart-aggregation.ts`, `chart-palettes.ts`,
`chart-view-model.ts`, `chart-js-setup.ts`, `chart-migration.ts`) — the aggregation helpers also
feed the rollup surfaces, the palettes feed the option-color UI, and the migration reads the
persisted fields.

## Note on the archived bytes

The copy here is the last-live source with one mechanical difference: its relative imports were
re-pointed at the surviving `src/` tree (one extra `../` per hop) so the archived module still
resolves. The untouched last-live bytes are at the SHA above, restorable exactly as written.
