---
title: "Implementation Summary [template:level-2/implementation-summary.md]"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation"
  - "summary"
  - "039 implementation summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/039-calendar-parity-port"
    last_updated_at: "2026-09-03T13:25:00Z"
    last_updated_by: "leg-b-verified"
    recent_action: "Leg b landed: calendar CSS, capture-theme green token, empty-state fixture; gate PASS 25 green"
    next_safe_action: "T6 — re-exercise move/resize/quick-add against the completion marker"
    blockers:
      - "Not operator-confirmed: no one has read a completed milestone on device (parent goal D3)"
      - "T6 open: no test or run exercises drag/resize/quick-add against the completion marker"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/i18n.ts"
      - "src/views/calendar-renderer.test.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "039-calendar-parity-port"
      parent_session_id: null
    completion_pct: 82
    open_questions: []
    answered_questions:
      - "Shared date-transaction seam: no module lands in this leg; src/data/ has only calendar-date-time.ts and date-time-format.ts, and 037 has not created one either, so the seam stays documented in spec.md REQ-006 under the collision rule (T7, D6)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 039-calendar-parity-port |
| **Status** | In progress — leg b verified: CSS treatment landed, captures recaptured and read, gate PASS 25 green; not operator-confirmed |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

There is no source calendar module to port — `types.ts:4-11` stops `ViewMode` at `table | gantt |
kanban` — so this leg rewrites reference *behavior*, not a file, into the existing
`calendar-renderer.ts` host: completion-aware milestone ordering (REQ-002), date-scale header/weekend
wording intent (REQ-003), and calm empty-state/backlog density (REQ-004).

### Completion-Aware Marking

`isRowCompleted` (`calendar-renderer.ts:2420-2425`) reads the view's checkbox column via
`toBooleanValue` — a checkbox column is the view's only native completion signal, since status
columns carry display colors, not a terminal flag. `is-completed` is applied at all three scales:
month segments (`:385`), month popover events (`:556`), week all-day segments (`:791`), all-day
overflow events (`:865`), timed events (`:992`), and backlog/unscheduled items (`:181`), which share
the same helper as the scheduled path (REQ-002).

### Weekend Treatment

`is-weekend` follows the reference's weekend-header wording intent (`GanttHeaderRenderer.ts:48-75`)
across the month weekday row (`:2072`), month day cells (`:345`), week/day time headers (`:700`),
all-day date buttons (`:755`), all-day columns (`:741`), and time-grid columns (`:930`); header
structure and nav controls are unchanged in shape (REQ-003).

### Backlog Empty Line and Empty-State Copy

The backlog empty path (`:173-177`) renders a calm empty line through `t("calendar.unscheduledEmpty")`
instead of collapsing the whole drawer. `emptyState.noEventsTitle`/`Message` and
`emptyState.noDateFieldTitle`/`Message` move to calmer density language, landed in all three locale
blocks: en (`src/i18n.ts:118,1483-1486`), zh-CN (`:1789,3130-3133`), zh-TW (`:3450,4783-4786`)
(REQ-004).

Kept local, unchanged: scale control, drag/resize, navigation, and the backlog drawer's own
open/collapse behavior — none of REQ-002 to REQ-004 touch those paths.

### The CSS Treatment (leg b)

Completion **dims and strikes through** rather than repainting: `.is-completed` sets `opacity: 0.82`
and a `--db-calendar-done-accent` strikethrough on the title, and touches neither background nor
border, so a completed event keeps the status colour its row already carries — measured on the
fixture, the completed "Q1 renewals sweep" keeps `border-left-color: rgb(154, 52, 18)` in light and
`rgb(254, 215, 170)` in dark, against `rgb(30, 58, 138)` for an incomplete neighbour. An earlier
draft carried `!important` here, which beat the inline colour `applyEventColor` writes and flattened
every completed event to one "done" tint; that declaration is gone.

Weekend headers and columns take a quiet fill: measured 4.3% black on a light day cell and 7.8% on
its header, 5.5% and 9.0% white in dark. The empty-card density token
`--db-calendar-empty-min-height` is declared on `.note-database-container`, because `renderEmpty()`
builds the card as a direct child of that container before any `.db-calendar` wrapper exists — the
card measures 144px desktop and 128px phone. Reduced motion now also covers the week-grid flash
columns (`.db-calendar-week-day-col.is-flash`, `.db-calendar-week-allday-col.is-flash`), whose
`is-flash` producer is `calendar-renderer.ts:1982`.

The capture harness gained `--color-green` / `--text-success` (`#08b94e` light, `#44cf6e` dark),
transcribed from the installed Obsidian stylesheet, without which every completed event's
strikethrough fell back to the accent purple. A `calendar-empty-state` scenario was added, mirroring
`EmptyStateRenderer.renderCard()` class-for-class, and the month fixture carries
`--db-calendar-day-min-height` on the `.db-calendar-month` wrapper — where `applyMonthSizingVars`
writes it from `config.calendarCellMinHeight ?? 112` — rather than on each day cell.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/calendar-renderer.ts` | Modified | `isRowCompleted` plus `is-completed`/`is-weekend` markers across month/week/day/backlog rendering |
| `src/i18n.ts` | Modified | Calm empty-state and backlog-empty copy in en, zh-CN, zh-TW |
| `src/views/calendar-renderer.test.ts` | Modified | Nine new parity assertions covering completion marking, weekend headers, backlog empty line, and empty-state copy |
| `styles.css` | Modified | Calendar state tokens, completion dim/strikethrough, weekend fills, backlog drawer, empty-card density, reduced-motion coverage |
| `tools/screenshots/theme.css` | Modified | `--color-green` / `--text-success` so the done accent resolves in the capture harness |
| `tools/screenshots/scenarios/temporal.mjs` | Modified | Weekend/completion/backlog markup, the `calendar-empty-state` scenario, and the wrapper-level month sizing variable |
| `tools/screenshots/scenarios/temporal-tick-parity.test.mjs` | Modified | Fixture-mirror assertions, including copy bound to the strings `renderEmpty()` reads |
| `screenshots/**` + `tools/lane/css-lane.json` | Modified | 20 recaptured/new PNGs, manifest, index, and the lane release naming each one |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The "Calendar parity behaviours" describe block (`calendar-renderer.test.ts:429-630`) was read red
before the renderer edit — `8 failed | 7 passed (15)`, failing exactly on the missing completion
marker, the missing weekend header, the missing backlog empty line, and the old empty-state copy
(`expected 'No dated records' to be 'No events'`) — then green after, `15/15`. The full suite
(`npx vitest run`) reads 786/786 green across 81 files, and `npx tsc --noEmit` reports 0 errors.
`npm run gate` reads 24 of 25 lanes green; `screenshots-fresh` is the one red lane, on the 12 calendar
PNGs whose mtime predates this leg's `calendar-renderer.ts` edit. No `styles.css` rule exists yet for
`is-completed`/`is-weekend`, so a recapture would still read byte-identical to the current PNGs — the
CSS leg that gives these classes a visual treatment, and the recapture that follows it, have not run
(T9, T10 in `tasks.md` stay open).

Leg b took the `css-lane`, landed the visual treatment, and was then re-verified in-runtime rather
than on the CSS author's word. Three claims did not survive first contact and were fixed before this
landing: an `!important` that flattened every completed event to one tint, `is-next`/`is-overdue`
rules no `src/` caller ever produced, and a density token declared on a sibling of the element that
reads it. A fourth was corrected here — the month fixture had been pinning
`--db-calendar-day-min-height` on each day cell, an element the renderer never writes it to; it now
sits on the `.db-calendar-month` wrapper, which is exactly where `applyMonthSizingVars` puts it, with
the same measured 112px result. The parity suite grew an assertion tying the fixture's empty-state and
backlog copy to the strings `renderEmpty()` actually reads, observed red against the pre-leg-a wording
before it was allowed to pass.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| No shared date-transaction module created in this leg | `src/data/` holds only `calendar-date-time.ts` and `date-time-format.ts`; `037-timeline-gantt-port` has not landed one either, so the seam stays documented in `spec.md` REQ-006 rather than built, per the collision rule (T7, goal.md D6) |
| Completion and weekend markers ship ahead of their CSS pass | Landing the class attributes first, and the visual rule after, keeps this leg's diff scoped to `calendar-renderer.ts`/`i18n.ts`/tests; captures stay byte-identical until the CSS leg lands |
| Keep-local paths left untouched | Scale control, drag/resize, navigation, and the backlog drawer already meet parity (REQ-005) and sit outside REQ-002 to REQ-004's scope |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Parity suite red-first (`calendar-renderer.test.ts:429-630`) | Red: `8 failed \| 7 passed (15)`, before the renderer edit |
| Parity suite green | `15/15`, after the renderer edit |
| Full unit suite (`npx vitest run`) | PASS — 786/786 tests, 81 files |
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 169 problems (156 errors, 13 warnings) — unchanged from HEAD baseline |
| `node tools/naming/scan-comments.mjs` | PASS — 0 missing banners, 0 missing sections, 0 commented-out lines |
| `node tools/naming/scan-failing-values.mjs` | PASS — exit 0, no newly ticked criterion arrived without its failing value |
| Fixture parity suite (`temporal-tick-parity.test.mjs`) | 86/86; observed red first — reverting `calendarWeekdayMarkup`'s weekend branch gives `1 failed \| 84 passed`, and stale empty-state/backlog copy gives `3 failed \| 83 passed`, both exit 1 |
| Computed-style probe (headless Chrome, capture page) | Completed month segment `opacity 0.82`, `border-left-color rgb(154, 52, 18)` light / `rgb(254, 215, 170)` dark, title `line-through` in `rgb(8, 185, 78)`; incomplete neighbour `opacity 1`, `rgb(30, 58, 138)` |
| Weekend tint | Day cell 4.3% light / 5.5% dark; weekday header 7.8% light / 9.0% dark — was ~1.3-2.6%, which read as no tint at all |
| Empty-card density | 144px desktop, 128px phone, resolved from `--db-calendar-empty-min-height` on `.note-database-container` |
| Month geometry | Day cells `min-height: 112px`, five week rows, grid bottom `y=789.5` in the 900px desktop frame and `817.7` in the 874px phone frame — the product's own default, since `applyMonthSizingVars` writes `config.calendarCellMinHeight ?? 112` and nothing in the renderer measures the pane |
| Reduced motion | `transition-property: none` and `animation-name: none` on `.db-calendar-month-segment` and `.db-calendar-time-header-day` under `prefers-reduced-motion: reduce` |
| `node tools/live/evidence.mjs --check-all` | exit 0 — 16 artefacts describe this tree, after re-running the 10 the stylesheet edit invalidated |
| `node tools/lane/check-lane.mjs` | exit 0 — the release names all 20 changed captures |
| `npm run screenshots` / `screenshots:verify` | 260 captures rewritten; verify exit 0, 260 entries match their sources |
| `npm run gate` | PASS — 25 green, 0 red, exit 0, both under `SURFACE_PHASE=039-calendar-parity-port` and plain (was 24 green with `screenshots-fresh` red) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Not operator-confirmed.** No one has read a completed milestone as visually distinct on device
   (parent goal D3); this closes only T11, and nothing else can.
2. **T6 open.** Move/resize/quick-add have not been re-exercised against the completion styling, and
   no test asserts the marker survives a drag through `safeUpdateEventDates`.
3. **Completion is read from a checkbox column only.** A status column carries display colours, not a
   terminal flag, so a view whose completion lives in a status option is not marked.
4. **The done accent is one colour for every event.** The strikethrough is `--text-success` green
   regardless of the event's own tone, so a completed orange bar carries a green rule through it.
5. **The capture harness does not declare Obsidian's `.mod-cta` rule**, so the empty card's primary
   action photographs in the plugin's neutral button style rather than the host's accent fill. This
   predates this packet and affects every capture containing a CTA.
6. **`runtime-vars.css` derives `--db-calendar-day-min-height` and `--db-calendar-month-week-min-height`
   from viewport height**, and its comment says the plugin measures them from the pane. It does not —
   both are written inline from config. The month fixture now mirrors the renderer's own write, which
   neutralises the mismatch for that scenario but leaves the harness values wrong for any future one.
<!-- /ANCHOR:limitations -->

---
