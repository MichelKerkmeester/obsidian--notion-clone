# Archived: the timeline (gantt) view

The timeline renderer — the lane/group layout, the week/day/month/quarter/year scales, the sticky
header, the today line and the reference-gantt (pm) presentation that 037 ported. A persisted
timeline view now opens as a board (its `timelineGroupField` carried into the board's grouping)
through the redirect shipped in 0.0.34; the time axis itself and the start/end date semantics are
the declared losses.

## Last-live SHA

```
e75a979c9a21f6f93967a40e24b2a58f474fa9d5  (origin/main when 0.0.34 was cut)
```

These bytes were last shipped in the 0.0.34 bundle.

## Restore procedure

From the repository root — this writes the files back at their original paths, without touching
the copies beside this README:

```sh
git checkout e75a979c9a21f6f93967a40e24b2a58f474fa9d5 -- \
  src/views/calendar-timeline-renderer.ts \
  src/views/calendar-timeline-gantt.test.ts \
  src/views/calendar-timeline-hour-column.test.ts \
  src/views/calendar-timeline-tick-label.test.ts \
  tools/bench/timeline-render-bench.ts tools/bench/timeline-render-bench.test.mjs
```

A restored timeline needs, at minimum: its importer, field and dispatch/teardown legs back in
`src/views/database-view.ts` and `src/views/embedded-database-renderer.ts`, its entries back in
`src/views/rendered-view-roots.ts` (`obnotion-timeline` and `pm-gantt-view` — the reference-gantt
root, whose omission was the leak the view-switch residue check exists to prove) and the harness
(`tools/live/render-assertion-bundle.mjs`'s `SCENARIOS`/`STATE_SCENARIOS`/`RENDERER_SOURCES` and the
`timeline`/`timeline-toolbar` branches of `tools/live/render-assertion-harness.ts`), its capture
scenario and `screenshots/manifest.json` rows, and the timeline/gantt rules restored in
`styles.css`. Compare against the last-live SHA before assuming anything else.

## What is here

| Archived file | Original path | What it was |
|---|---|---|
| `calendar-timeline-renderer.ts` | `src/views/calendar-timeline-renderer.ts` | the timeline renderer (`CalendarTimelineRenderer`), including the gantt port — the sticky header, the today line and the reference-gantt presentation |
| `calendar-timeline-gantt.test.ts` | `src/views/calendar-timeline-gantt.test.ts` | the gantt-port behaviour tests |
| `calendar-timeline-hour-column.test.ts` | `src/views/calendar-timeline-hour-column.test.ts` | hour-column tests |
| `calendar-timeline-tick-label.test.ts` | `src/views/calendar-timeline-tick-label.test.ts` | tick-label tests |
| `timeline-render-bench.ts` | `tools/bench/timeline-render-bench.ts` | the dedicated render bench (`runTimelineBench`) |
| `timeline-render-bench.test.mjs` | `tools/bench/timeline-render-bench.test.mjs` | the bench's own suite |

## What deliberately stayed

`src/views/calendar-timeline-toolbar-renderer.ts` (the toolbar host still wires it),
`src/data/calendar-timeline-model.ts` and `src/data/invalid-time-events.ts` (the search-results
shaping and the invalid-event scan survive the renderer), `src/data/timeline-migration.ts` (the
on-open migration), and `src/data/calendar-timeline-search-results.ts`.

## Note on the archived bytes

The copies here are the last-live sources with one mechanical difference: their relative imports
were re-pointed at the surviving `src/` tree (one extra `../` per hop) so the archived modules
still resolve when a surviving module imports their types. The untouched last-live bytes are at
the SHA above, restorable exactly as written.
