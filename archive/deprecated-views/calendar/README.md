# Archived: the calendar view

The calendar grid renderer — month/week/day scales, timed-event overlap columns, the mini
calendar, unscheduled-row chips, date-keyboard navigation. A persisted calendar view now opens as
a table (sorted by its own `calendarStartDateField`) through the redirect shipped in 0.0.34; its
grid arrangement, end-date spans and title/color formatting are the declared losses.

## Last-live SHA

```
e75a979c9a21f6f93967a40e24b2a58f474fa9d5  (origin/main when 0.0.34 was cut)
```

These bytes were last shipped in the 0.0.34 bundle.

## Restore procedure

From the repository root — this writes the file back at its original path, without touching the
copy beside this README:

```sh
git checkout e75a979c9a21f6f93967a40e24b2a58f474fa9d5 -- \
  src/views/calendar-renderer.ts src/views/calendar-renderer.test.ts \
  tools/bench/calendar-render-bench.ts
```

A restored calendar needs, at minimum: its importer, field and dispatch/teardown legs back in
`src/views/database-view.ts` and `src/views/embedded-database-renderer.ts`, its entries back in
`src/views/rendered-view-roots.ts` (`obnotion-calendar`) and the harness
(`tools/live/render-assertion-bundle.mjs`'s `SCENARIOS`/`STATE_SCENARIOS`/`RENDERER_SOURCES` and the
`calendar` branches of `tools/live/render-assertion-harness.ts`), its capture scenario and
`screenshots/manifest.json` rows, and the `obnotion-calendar-*` rules restored in `styles.css`.
Compare against the last-live SHA before assuming anything else.

## What is here

| Archived file | Original path | What it was |
|---|---|---|
| `calendar-renderer.ts` | `src/views/calendar-renderer.ts` | the calendar grid renderer (`CalendarRenderer`) |
| `calendar-renderer.test.ts` | `src/views/calendar-renderer.test.ts` | its test suite |
| `calendar-render-bench.ts` | `tools/bench/calendar-render-bench.ts` | its dedicated render bench (`runCalendarBench`) |

## What deliberately stayed

`src/views/calendar-mini-calendar-renderer.ts` (the date value picker and the date cell editor
still mount it), `src/views/calendar-toolbar-renderer.ts` (the toolbar host still wires it), and
the whole `src/data/` model layer (`calendar-date-time.ts`, `calendar-layout-model.ts`,
`calendar-migration.ts`, `calendar-interaction-model.ts`, `calendar-title-formatter.ts`) — the
on-open migration reads these, so the persisted fields stay defined.

## Note on the archived bytes

The copies here are the last-live sources with one mechanical difference: their relative imports
were re-pointed at the surviving `src/` tree (one extra `../` per hop) so the archived modules
still resolve when a surviving module imports their types. The untouched last-live bytes are at
the SHA above, restorable exactly as written.
