# Archived Deprecated Views: calendar, timeline, chart

The calendar, timeline and chart database views are retired. The three view types remain
accepted-but-redirected values of `DatabaseViewType`: every persisted view of these types is
migrated on open (chart → table, calendar → table, timeline → board) by the redirects shipped in
0.0.34, and the renderers below were the last code that could draw one. Their sources are archived
here rather than deleted so the date/renderer-parity work can resurrect one later if ever needed.

Each view folder below holds exactly what its renderer needed to build and draw: the renderer, its
test suites, and — for calendar and timeline — the dedicated render bench that measured it.

## Last-live SHA

These sources were last shipped (live and reachable in the bundle) at:

```
e75a979c9a21f6f93967a40e24b2a58f474fa9d5  (origin/main when 0.0.34 was cut)
```

`0.0.34` is the last release whose bundle still contained the three renderers.

## Restore procedure

Every archived file's pre-removal bytes are reachable at the last-live SHA. To restore one, several,
or all, from the repository root:

```sh
# one file, back at its original location:
git checkout e75a979c9a21f6f93967a40e24b2a58f474fa9d5 -- src/views/calendar-renderer.ts

# a whole view's worth, still at their original paths:
git checkout e75a979c9a21f6f93967a40e24b2a58f474fa9d5 -- \
  src/views/calendar-renderer.ts src/views/calendar-renderer.test.ts \
  tools/bench/calendar-render-bench.ts
```

`git checkout <sha> -- <path>` writes the file at its original location; it does not touch the copy
under this folder. A restored file needs its importer restored too (`src/views/database-view.ts`
and `src/views/embedded-database-renderer.ts` lost the import, the field, the dispatch branch and
the teardown legs), and the capture/manifest rows restored, so check this README's path list
against the importers you bring back.

## What is archived, per view

### `calendar/` — the calendar view renderer

| Original path | What it was |
|---|---|
| `src/views/calendar-renderer.ts` | the calendar grid renderer |
| `src/views/calendar-renderer.test.ts` | its test suite |
| `tools/bench/calendar-render-bench.ts` | the dedicated render bench (`runCalendarBench`), still the fixture source named by the harness comments |

### `timeline/` — the timeline (gantt) view, the 037 port

| Original path | What it was |
|---|---|
| `src/views/calendar-timeline-renderer.ts` | the timeline renderer, including the gantt port (sticky header, today line, week/day/month/quarter/year scales) |
| `src/views/calendar-timeline-gantt.test.ts` | gantt-port behaviour tests |
| `src/views/calendar-timeline-hour-column.test.ts` | hour-column tests |
| `src/views/calendar-timeline-tick-label.test.ts` | tick-label tests |
| `tools/bench/timeline-render-bench.ts` | the dedicated render bench (`runTimelineBench`) |
| `tools/bench/timeline-render-bench.test.mjs` | the bench's own suite |

### `chart/` — the chart view renderer

| Original path | What it was |
|---|---|
| `src/views/chart-renderer.ts` | the chart renderer (chart.js host: aggregation, bucketing, reference lines, PNG export) |

## What deliberately stayed

- `src/views/calendar-mini-calendar-renderer.ts` — the mini calendar is still live: the date value
  picker (`date-value-picker.ts`) and the date cell editor (`record-surface/cell-editor-date.ts`)
  both mount it, and neither is going away.
- `src/views/calendar-toolbar-renderer.ts`, `chart-toolbar-renderer.ts`,
  `calendar-timeline-toolbar-renderer.ts` and their tests — the toolbar host still wires them.
- the whole `src/data/` model layer (`calendar-*`, `chart-*`, `timeline-migration.ts`,
  `invalid-time-events.ts`) — the on-open migrations added by the 0.0.34 redirect read these
  fields from persisted frontmatter, so the field types, the migration plan/apply pairs and their
  tests must survive the renderer.

## Why the archived code does not ship

`tsconfig.json` compiles `src/**` only, the production bundle (`esbuild.config.mjs`) builds from
the single entry `src/main.ts` and tree-shakes, `vitest.config.ts` collects `src/**/*.test.ts` and
`tools/**/*.test.mjs` only, and the linters glob `src/**` and `tools/**/*.mjs`. A file under
`archive/` is therefore outside every build, test and lint glob by construction; nothing needs
regenerating when a file moves here, and the excluded folder must never be added back to a glob.
