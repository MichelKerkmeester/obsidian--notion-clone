---
title: "Implementation Summary: Constructed Capture"
description: "The capture pipeline now photographs the shipped renderers, not only hand-written fixture markup: nine constructed views across two devices and two themes, mounted through the same bundle the assertion lanes use."
trigger_phrases:
  - "043 implementation summary"
  - "constructed capture summary"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/043-constructed-capture"
    last_updated_at: "2026-09-04T08:11:42Z"
    last_updated_by: "in-runtime-code-agent"
    recent_action: "T029 landed: touch-targets/unstyled-links constructed pass widened 21 -> 31 scenarios"
    next_safe_action: "Rule on AC-002; fresh audit re-reads row 6 against T029's widened pass"
    blockers:
      - "AC-002 unmeetable as written, needs a phase ruling (Known Limitations 1)"
    key_files:
      - "tools/live/render-assertion-harness.ts"
      - "tools/live/render-assertion-bundle.mjs"
      - "tools/live/typed-data-assertions.mjs"
      - "tools/live/constructed-state-assertions.mjs"
      - "tools/live/touch-targets.mjs"
      - "tools/live/unstyled-links.mjs"
      - "tools/live/touch-targets-constructed-baseline.json"
      - "tools/storybook/obsidian-stub.mjs"
      - "tools/screenshots/constructed-scenarios.mjs"
      - "tools/bench/table-render-bench.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-043-impl-summary"
      parent_session_id: null
    completion_pct: 79
    open_questions:
      - "AC-002: pixel-difference basis, or inside-mount layout determinism basis?"
      - "Does the shared manifest stand, or does AC-006's separate file still apply?"
      - "Does parent row 6 tick now that touch-targets/unstyled-links' own constructed pass covers all ten state variants (T029), or does another residual keep it open? Left to a fresh audit (parent D4)."
    answered_questions:
      - "Fixture/constructed pixel-equal at bench shape? No, all 7 pairs differ."
      - "Row count alone enough for row 6? No, captureData also types columns."
      - "Does captureData's real CellRenderer add forced layout reads to the table's row loop? No — measured 3 of 3 connected reads, bound 8, identical to captureData:false at the same 2000-row shape."
      - "Can all 13 of the parent's row-6 fixture-only scenarios be constructed through real production code paths? Yes — all 13, none left fixture-only (T028)."
      - "Does widening touch-targets/unstyled-links' own constructed pass to the ten state variants make the link lane's sample non-vacuous? Yes — 144 links across 31 scenarios, 0 UA-default findings (T029), superseding the prior 'widening alone would not make it non-vacuous' concern."
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 043-constructed-capture |
| **Completed** | Partial — 2026-09-04 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Until now every screenshot in this repository was a photograph of hand-written markup. A fixture
proves what the stylesheet does to the class structure the renderers are believed to emit; it never
runs a renderer, so a regression in shipped code that the fixture mirrors loosely stays green and
photogenic. The capture pipeline now also mounts the real `src/views/*` renderers — through the same
esbuild bundle and the same mount path the assertion, touch-target and unstyled-links lanes already
drive — and photographs what comes out. Nine views, two devices, two themes: 36 new captures whose
subject is the renderer itself.

### The constructed scenario type

A scenario that carries an async `mount(page, device, theme)` instead of an `html()` string is a
constructed scenario. `capture.mjs` refuses it before the browser launches if the mount is not async,
because a synchronous mount gives the capture nothing to wait on and would photograph an empty box
while every check stayed green. The mount navigates to a host document that loads the bundle, calls
`runRenderAssertions`, and resolves only when the harness's `onMounted` hook fired AND its
provenance marker passed — the same two-part signal `touch-targets.mjs` checks before it measures
anything, not a sleep and not a fresh invention. The bundle is built once per run and disposed when
the run ends, so a fixture-only run never pays for it and a constructed run never repeats it.

The nine registered scenarios are `constructed-list`, `-table`, `-board`, `-gallery`,
`-calendar-month`, `-calendar-week`, `-calendar-day`, `-timeline` and `-chart`. Two of them —
the chart and the calendar's day scale — are net-new coverage: no fixture ever depicted either.

### What the pictures show

All 36 were opened and read. The table draws its sixteen-column bench grid; the board draws five
status columns at 320 cards each; the gallery's responsive grid collapses to a single column on the
phone; the calendar month grid covers February 2026 with its unscheduled backlog and per-day
overflow counts; the week and day time grids arrive already scrolled to the workday by the
renderer's own post-render correction; the timeline draws its week window with a month boundary
tick, weekend fills, dependency dots and two milestone diamonds; the chart draws a five-bar count
aggregation that agrees with the board's five columns.

### Typed data and real icons (T004-T006)

The nine captures above were structurally real but typographically hollow: every bench column was
`"text"`, so no select pill, checkbox, date, currency figure or completed strikethrough ever
appeared, and every icon drew the stub's placeholder diamond — the gap the parent's DONE row 6
stayed open on. `ScenarioSpec.captureData` (`render-assertion-harness.ts`) is the fix: an opt-in,
default-off field that swaps the harness's 1600-2000-row `"text"` structural-cost shape for an
18-row, fully-filled `"mixed"`-type one on the list, board, gallery, calendar and timeline
branches, with select/status/multi-select columns pointed at a small named, coloured option set
instead of the bench's placeholder value (which matches no configured option and always hits the
renderer's grey no-match fallback). `constructed-scenarios.mjs` is the only caller that turns it
on. Table and chart are unchanged by design: table's harness bag renders every cell through a stub
(`renderCell: (td, row, col) => td.setText(...)`, deliberately cost-isolating, not type-aware) the
option does not reach, and chart draws an aggregation with no per-row field to type.

Separately, `obsidian-stub.mjs`'s `setIcon` now draws a real inline SVG for the icon names the
render-assertion bundle actually mounts (traced by grepping the BUILT bundle for every `setIcon(…)`
call site, including the two nav-button helpers that forward their icon through a parameter) —
21 names, hand-drawn lucide-style paths, since this project has no `lucide`/`lucide-static`
dependency to inline by name. An id outside that set still gets the original text placeholder, so
nothing silently goes blank.

T004/T005 gave the timeline branch the same five-scale reach the calendar branch already had:
`ScenarioSpec.scale` widened to `"day"|"week"|"month"|"quarter"|"year"`, the timeline branch reads
it directly, and `render-assertion-bundle.mjs`'s shared `SCENARIOS` gained the four scales the week
entry did not already cover. This is the shared list `render-assertions.mjs`, `touch-targets.mjs`
and `unstyled-links.mjs` all read — not `constructed-scenarios.mjs`'s nine-capture registry, which
is unchanged (still nine, still week-scale timeline only; the four extra scales are covered by the
structural-assertion and touch-target lanes, not by a tenth-through-thirteenth screenshot).

### The parent's thirteen row-6 fixture-only scenarios, all now constructed (T028)

The parent `goal.md` row 6 named a bounded, thirteen-entry list of fixture-only scenarios with no
constructed or device counterpart to cross-check against. All thirteen now have one, each mounted
through a real production code path rather than a hand-applied class. Three
(`table-mobile`/`list-mobile`/`board-mobile`) were free: the existing `constructed-table`/`-list`/
`-board` scenarios already mount at the phone device with `is-phone` applied, so only a `fixtureOf`
declaration was owed. The other ten needed new, additive `ScenarioSpec` options:

- **`subtaskTree`** (board, timeline) wires the first `captureData` row into a parent with two
  children via `buildSubtaskRelation`'s own frontmatter keys (`parentId`/`subtaskIds`/`collapsed`/
  `progress`) — the same input a real vault note gives the relation, not a fabricated DOM shape.
- **`sparseFields`** (list) blanks a deterministic subset of fields on rows after the first, so
  `ListRenderer`'s real `shouldReserveColumns` measurement runs — confirmed correct on both the
  desktop grid (reserves) and the phone flex line (does not, matching production).
- **`emptyState`** (calendar) strips every date-typed column from the constructed schema, reproducing
  `renderMonth`'s real no-date-field early return rather than fabricating the empty-state DOM.
- **`chartVariant: "number" | "empty"`** (chart) sets `chartType: "number"` or hides every group value
  the board bench's group field actually produced via `chartHiddenGroups` — both real `ViewConfig`
  shapes a configured chart can reach.
- **`miniCalendar`** (calendar) clicks the real mini date-picker trigger button
  (`data-icon="calendar-days"`, the same one a device tap reaches) so `renderMiniCalendar`'s own
  popover opens through `toggleMiniCalendar`.
- **Three new `renderer` values** (`calendar-toolbar`, `timeline-toolbar`, `chart-toolbar`) call
  `CalendarToolbarRenderer`/`CalendarTimelineToolbarRenderer`/`ChartToolbarRenderer`'s own public
  `togglePopover()` against a visually-hidden, real, connected anchor button. These three are
  captured full-page (`group: "components"`, `capture: "viewport"`) because their panel positions
  itself with `position: fixed`/`absolute` and an element-scoped `#shot` crop cannot see it —
  confirmed correct on both devices, including the real bottom-sheet presentation the same
  production code takes on the phone.

A genuine defect surfaced only by reading the actual captures, not by the automated assertion
script: `constructedScenario()`'s spec builder never forwarded `opts.miniCalendar` into the harness
spec, so the mini-calendar click never fired through the real capture-registry path, even though a
hand-built spec (used by both the assertion script and a standalone debug harness) proved the
underlying harness branch correct. The popover was genuinely absent from
`constructed-calendar-mini-desktop-dark.png`/`-mobile-dark.png` until the one-line fix landed. This
is why every one of the 40 new captures was opened and read on both desktop and phone before this
work was called done, rather than trusting the assertion script's PASS alone.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `tools/screenshots/constructed-scenarios.mjs` | Created | The constructed registry, its mount driver, the readiness refusal, and the one bundle build shared with the assertion lanes |
| `tools/screenshots/manifest-schema.mjs` | Created | The manifest entry contract — a constructed entry must name the renderer and bag it photographed, or the run fails rather than publishing a record that cannot be read |
| `tools/screenshots/constructed-capture.test.mjs` | Created | Pins the manifest marking, the readiness refusal, the nine-scenario registry and the fixture declarations |
| `tools/screenshots/capture.mjs` | Modified | Constructed branch in the device/theme loop, the readiness frame wait, one bundle build before the loop, manifest marking, schema check before write |
| `tools/screenshots/scenarios.mjs` | Modified | Header now states the two scenario kinds and the `fixtureOf` declaration |
| `tools/screenshots/scenarios/core.mjs` | Modified | `fixtureOf` on the list, table, board and gallery fixtures |
| `tools/screenshots/scenarios/temporal.mjs` | Modified | `fixtureOf` on the calendar month, calendar week and week-scale timeline fixtures |
| `tools/live/render-assertion-harness.ts` | Modified (T004-T006) | `ScenarioSpec.scale` widened to five values, `.captureData` added; the list/board/gallery/calendar/timeline branches read both; `applyCaptureOptions`/`applyCaptureGroupPalette` and the `CAPTURE_ROWS`/`CAPTURE_FILL`/`CAPTURE_OPTIONS` constants |
| `tools/live/render-assertion-bundle.mjs` | Modified (T005) | Four new timeline-scale entries in the shared `SCENARIOS` list |
| `tools/screenshots/constructed-scenarios.mjs` | Modified (T006) | Every constructed spec now sets `captureData: true` |
| `tools/storybook/obsidian-stub.mjs` | Modified | `setIcon` draws real SVG for 21 traced icon names; text placeholder retained as the fallback |
| `tools/live/typed-data-assertions.mjs` | Created | Live check: mounts `list/file-view` with and without `captureData`, asserting the three typed markers appear only when it is on — the negative control proving the option is what produces them |
| `tools/live/touch-targets-constructed-baseline.json` | Modified | `under` raised 335 -> 367 with a `raiseHistory` entry recording which three already-known classes grew and by how much, once T005's four new timeline scenarios exposed more instances of them |
| `tools/lane/css-lane.json` | Modified | New release entry naming the 28 constructed captures whose `pixelHash` changed (table and chart unchanged) |
| `screenshots/views/constructed-*.png` | Modified | 28 of the 36 constructed captures recaptured with typed data and real icons |
| `screenshots/manifest.json`, `screenshots/README.md` | Modified | Re-stamped after the recapture |
| `screenshots/views/constructed-*.png` | Created | The 36 constructed captures |
| `screenshots/manifest.json`, `screenshots/README.md` | Modified | 312 entries (276 fixture + 36 constructed); `fixtureOf` recorded on the 28 declared fixture entries |
| `tools/lane/css-lane.json` | Modified | Release entry for this phase naming all 36 reviewed captures |
| `tools/live/*.json` | Modified | Re-stamped evidence after `scenarios.mjs` moved |
| `tools/bench/table-render-bench.ts` | Modified (T027) | `makeColumns` gained a `"text" \| "mixed"` kind parameter (`MIXED_TYPES`/`valueForType`, mirroring every other bench); `makeRows` calls `valueForType` unconditionally, behaviour-identical to the prior `${col.key}-${i}` for "text" |
| `tools/live/render-assertion-harness.ts` | Modified (T027) | `fileViewTableBag`/`embedTableBag` take a `captureData` flag and route `renderCell` through a new `makeCaptureCellRenderer()` (a real `CellRenderer`) instead of the plain-text stub; the table branch passes `"mixed"` columns and calls `applyCaptureOptions` when captureData is on; the chart branch picks a `number`/`currency` value column, force-fills it, and switches `chartAggregation` to `"sum"`; `chartAssertions` gained a `config` parameter and a value-field-resolves assertion; `ScenarioOutcome` gained `chartValueField` |
| `tools/screenshots/constructed-scenarios.mjs` | Modified (T027) | Chart scenario's `note` text updated from "count aggregation" to "summing a per-row currency/number column" |
| `tools/live/typed-data-assertions.mjs` | Modified (T027) | Extended from one scenario (`constructed-list`) to three (`+constructed-table`, `+constructed-chart`), each with its own marker set; table adds date and relation-icon markers, chart reads `chartValueField` off the harness's own return value rather than the DOM |
| `tools/lane/css-lane.json` | Modified (T027) | New release entry naming the 8 captures (table + chart, both devices/themes) whose `pixelHash` changed; `styles.css` untouched, `baselineHash` unchanged |
| `screenshots/views/constructed-table-*.png`, `screenshots/views/constructed-chart-*.png` | Modified (T027) | The last 8 of the 36 constructed captures to gain typed rendering |
| `screenshots/manifest.json`, `screenshots/README.md` | Modified (T027) | Re-stamped after the recapture; 8 `bytes` fields on unrelated fixtures corrected back to their committed values after their encoder-noise-only re-encodes were restored rather than recommitted |
| `tools/live/render-assertion-harness.ts` | Modified (T028) | Six new opt-in `ScenarioSpec` fields (`subtaskTree`, `sparseFields`, `emptyState`, `chartVariant`, `miniCalendar`) plus three new `renderer` values (`calendar-toolbar`, `timeline-toolbar`, `chart-toolbar`); three new tag-patch functions on the toolbar renderers' own `togglePopover()`; new helper functions (`applyCaptureSubtaskTree`, `applyCaptureSparseFields`, `allHiddenGroupsFor`) and assertion functions for each new state's marker |
| `tools/screenshots/constructed-scenarios.mjs` | Modified (T028) | `constructedScenario()` extended to pass through the six new opt-in fields plus a `group`/`capture` override; ten new registry entries |
| `tools/screenshots/manifest-schema.mjs` | Modified (T028) | `CONSTRUCTED_RENDERERS` enum gained the three new toolbar renderer values, without which the manifest write refuses |
| `tools/screenshots/constructed-capture.test.mjs` | Modified (T028) | Registry-coverage and fixture-declaration expectations extended to the ten new constructed ids and thirteen new `fixtureOf` pairs |
| `tools/screenshots/scenarios/core.mjs` | Modified (T028) | `fixtureOf` on `board-subtask-tree`, `table-mobile`, `list-mobile`, `board-mobile`, `list-sparse-fields` |
| `tools/screenshots/scenarios/temporal.mjs` | Modified (T028) | `fixtureOf` on `timeline-subtask-tree`, `calendar-mini-calendar`, `calendar-empty-state`, `calendar-toolbar-options`, `timeline-toolbar-options` |
| `tools/screenshots/scenarios/chrome.mjs` | Modified (T028) | `fixtureOf` on `chrome-chart-options-popover`, `chrome-chart-number`, `chrome-chart-empty` |
| `tools/live/constructed-state-assertions.mjs` | Created (T028) | Red-first live check: six paired boolean-option states, three single-mount toolbar-popover markers, one single-mount mini-calendar marker |
| `tools/lane/css-lane.json` | Modified (T028) | New release entry naming the 40 new captures; `styles.css` untouched, `baselineHash` unchanged |
| `screenshots/views/*`, `screenshots/components/*` | Created (T028) | 40 new constructed captures (10 scenarios x 2 devices x 2 themes) |
| `screenshots/manifest.json`, `screenshots/README.md` | Modified (T028) | 352 entries; 10 `bytes` fields on unrelated fixtures corrected back to their committed values after their encoder-noise-only re-encodes were restored rather than recommitted |
| `tools/live/render-assertion-bundle.mjs` | Modified (T029) | `STATE_SCENARIOS` (the ten per-state entries) and `SCENARIOS_WITH_STATES = [...SCENARIOS, ...STATE_SCENARIOS]` added; `SCENARIOS` itself left unwidened since `render-assertions.mjs`'s `BAGS` table has no entry for the three new toolbar `renderer` values |
| `tools/live/touch-targets.mjs`, `tools/live/unstyled-links.mjs` | Modified (T029) | Both import `SCENARIOS_WITH_STATES` instead of `SCENARIOS` for their own constructed pass — 21 scenarios widened to 31 |
| `tools/live/touch-targets-constructed-baseline.json` | Modified (T029) | `under` raised 367 -> 422 with a `raiseHistory` entry attributing all 55 new under-floor controls to the ten state variants, per class and per scenario |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The implementation pass ran as a dispatched external leg with no browser evidence rights; every
number below was measured in-runtime afterwards, on this worktree, with exit codes read directly
rather than through a pipe.

The red was reproduced before the green was accepted: moving `manifest-schema.mjs` aside makes
`constructed-capture.test.mjs` fail with `Cannot find module './manifest-schema.mjs'` — 1 failed
suite, no tests — and restoring it returns a byte-identical file (sha256 `95af8897fba2`).

Two full detached capture runs were taken, each of all 312 entries. The static path was checked by
comparison rather than by reading the diff: against the committed manifest, all 276 fixture entries
came back with identical `pixelHash` and identical `layoutHash`, and eight fixture PNGs that moved
bytes only (encoder noise, which is why this pipeline hashes decoded pixels) were restored to their
committed bytes rather than recommitted. Between the two runs, all 312 entries — the 36 constructed
included — reproduced the same `pixelHash` and `layoutHash`.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Reuse `buildRenderAssertionBundle()` rather than build a second bundle | D1. A second bundler can drift from the first, and then the capture proves something about a copy. The bundle is imported, not reproduced, and the run fails outright if `missingSources` is non-empty. |
| Readiness is the harness's `onMounted` plus its provenance result, not a timeout | A sleep photographs whatever happens to be on screen when it expires. This is the identical signal the touch-target lane waits on before it measures, so the capture and the measurement agree about when a renderer is up. |
| The frame wait lives in `capture.mjs`, never in `src/views/*` | D2. The renderers already schedule their corrections through `requestAnimationFrame`; the capture side can wait that out without asking production code to report "done". |
| Constructed entries share `screenshots/manifest.json` rather than a separate file | Deviates from AC-006 and `plan.md`. It was not chosen on the merits — the dispatched leg was scoped to the shared manifest, and the landing pass kept it because the shared file is what `check-lane`, `verify.mjs` and `capture-device-parity` already read, which is why three of them picked the constructed captures up with no code change at all. Recorded as a deviation, not as a resolution: AC-006 is still open. |
| Nine scenarios, not thirteen | The four extra timeline scales need `ScenarioSpec` to carry a timeline scale, which the harness does not yet do (T004). `makeTimelineConfig(columns, "week")` is hardcoded, so `constructed-timeline` is the week scale and says so. |
| `fixtureOf` on the fixture, rather than a `declared-fixtures.mjs` map | Deviates from AC-007. The declaration sits next to the markup it describes, so a fixture and its claim cannot drift apart in separate files. Seven of the eleven planned pairs are declared; the four timeline-scale pairs are not, because D4 forbids declaring a supersession the constructed capture does not actually reproduce. |
| Table routes through a real `CellRenderer`, not a second stub | The bag's own `renderCell` stub is deliberately cost-isolating for the structural bench, and duplicating `cell-renderer.ts`'s status/checkbox/currency/date/relation branches inline would drift from the shipped behaviour the capture exists to prove. `database-view.ts`'s own file-view wiring is mirrored exactly: no live `DataSource`/`App` (neither is read by the display branches this exercises), `isReadOnly` left at its default `false`. |
| Chart's value column is force-filled rather than left at the board bench's sparse fill | `CHART_FILL` stays `BOARD_FILL` (30%) for every other column, matching the bench's own shape. Left sparse, the specific column the aggregation reads coincided with two of five groups' row indices and zeroed their bars — real, but the option exists to prove marks are exercised, and two empty bars proves that weakly. Filling only the one column the aggregation reads keeps the rest of the bench's shape untouched. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

Every exit code below was read from `$?` directly.

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, exit 0 — 97 files, 961 tests (HEAD baseline 96 / 953) |
| `npm run lint:tools` | PASS, exit 0 |
| `npm run lint` | exit 1, 172 problems — identical to the HEAD baseline; `src/` is untouched by this phase |
| `node tools/naming/scan-comments.mjs` | PASS, exit 0 |
| Red-first control | `Cannot find module './manifest-schema.mjs'` observed with the module moved aside; restored byte-identical |
| Full capture run x2 (detached) | 312 entries each; constructed `pixelHash`/`layoutHash` 0 of 36 changed between runs; fixture 0 of 276 changed |
| Static-path regression | 0 of 276 fixture entries changed `pixelHash` or `layoutHash` against the committed manifest |
| `node tools/screenshots/verify.mjs` | PASS, exit 0 — 312 entries match their sources, none blank or theme-identical |
| `node tools/lane/check-lane.mjs` | Observed red first: FAIL, exit 1, "36 changed capture(s) this release does not name". After the release entry named all 36: PASS, exit 0 |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 |
| `node tools/live/touch-targets.mjs` | PASS, exit 0 — 70 fixture scenarios, 17 constructed, baselines 279 / 335 unchanged |
| `node tools/live/unstyled-links.mjs` | PASS, exit 0 — 112 fixture links, constructed pass an honest empty sample |
| `node tools/live/capture-device-parity.mjs` | PASS, exit 0 — pairs 68 -> 77 with zero code change (`capture-device-parity.mjs` input hash `ff0cac47e594` on both sides); identical 0 against a baseline of 4 |
| `node tools/live/evidence.mjs --check-all` | Observed red first: exit 1, 4 of 16 artefacts stale after `scenarios.mjs` moved. After re-running their writers: PASS, exit 0, 16 of 16 |
| `SURFACE_PHASE=043-constructed-capture npm run gate` | PASS, exit 0 — 25 green, 0 red |
| 36 constructed PNGs opened and read | Done. Nine views x 2 devices x 2 themes; every theme pair differs by `pixelHash`; two weak pictures named in Known Limitations |
| Readiness negative control | Inside the mount, `.note-database-container` `scrollTop` reads 0 synchronously after mount returns and 376 after one frame. Through a separate CDP evaluate it already reads 376. Captures taken with the wait set to 0 frames are `pixelHash`-identical to the two-frame captures on all four calendar-week entries. |
| `git diff --stat src/ styles.css` | Empty — no renderer or stylesheet change in this phase |

**T004-T006 landing (typed data, real icons, timeline scale), every exit code read from `$?` directly:**

| Check | Result |
|-------|--------|
| Red: `typed-data-assertions.mjs` on the pre-T006 harness (git-stashed) | FAIL, exit 1 — `captureData: true` showed 0 of 3 typed markers on `list/file-view` |
| Green: `typed-data-assertions.mjs` after restoring | PASS, exit 0 — all 3 markers present with `captureData: true`, all 3 absent with it unset, on the same scenario |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 — 21 scenarios (17 + T005's 4), bag-shape comparison unchanged for every pre-existing key |
| `node tools/live/touch-targets.mjs` | PASS, exit 0 — fixture 264/279 unchanged; constructed 21 scenarios (was 17), 367/367 after honestly raising the constructed baseline (`raiseHistory`: 3 already-known timeline classes grew by 32, no new class) |
| `node tools/live/unstyled-links.mjs` | PASS, exit 0 — fixture 112 links across 70 scenarios unchanged; constructed 21 scenarios (was 17) |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, exit 0 — 97 files / 961 tests, unchanged (this landing's new check is a live script, not a vitest suite) |
| `npm run lint:tools` | PASS, exit 0 |
| `npm run lint` | exit 1, 172 problems — identical to the HEAD baseline; `src/` untouched |
| `node tools/naming/scan-comments.mjs` | PASS, exit 0 |
| Full capture run x2 (detached) | 312 entries each; 0 of 36 constructed entries changed `pixelHash`/`layoutHash` between the two runs |
| `node tools/screenshots/verify.mjs` | PASS, exit 0 — 312 entries current, none blank or theme-identical |
| `node tools/lane/check-lane.mjs` | PASS, exit 0 — a new release entry names all 28 captures whose `pixelHash` changed (table and chart unchanged); `styles.css` untouched, `baselineHash` unchanged |
| `SURFACE_PHASE=043-constructed-capture npm run gate` | PASS, exit 0 — 25 green, 0 red |
| 9 constructed views read on desktop + phone | Done. list/board/gallery/calendar month·week·day/timeline show named select pills, checkboxes, currency, relation cells, real icons; table/chart unchanged (see Known Limitations 3) |
| Declared `fixtureOf` pairs re-compared | All 7 read on both sides. Fixtures still show curated, named content (specific subscription names, multi-day/timed events, category grouping) the bench's generated `row-N` shape does not reproduce; the difference that remains is data richness and structure, not typed-vs-untyped rendering, which is now closed for 5 of the 7 (table's constructed side stays untyped; gallery's constructed side has no cover-image field configured, so it never shows the fixture's empty-cover placeholder state) |
| `git diff --stat src/ styles.css` | Empty — no renderer or stylesheet change in this landing either |

**T027 landing (table's production cell renderer, chart's per-row value field — DONE row 6's last two open items), every exit code read from `$?` directly:**

| Check | Result |
|-------|--------|
| Red: `typed-data-assertions.mjs` extended with `constructed-table`/`constructed-chart` cases, run against the pre-T027 tree (`git stash` on `table-render-bench.ts`/`render-assertion-harness.ts` only) | FAIL, exit 1 — 6 of 6 new assertions failed: table's `namedSelectPill`/`checkedCheckbox`/`currency`/`dateValue`/`relationIcon` all false under `captureData: true`, chart's `perRowValueField` false under the same |
| Green: same script after restoring | PASS, exit 0 — all 6 present under `captureData: true`, all absent under `captureData: false`, on the same three scenarios; `constructed-list`'s original 3 markers unaffected |
| Read-bound measurement (table's real `CellRenderer` vs. the stub, at the unreduced 2000-row shape) | Dedicated in-runtime mount of `{renderer: "table", bag: "file-view", captureData: true}}`: `"3 of 3 layout reads... bound 8"` / `"3 layout reads... bound 8"` — identical to the `captureData: false` numbers already on record. Zero forced reads added. |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 — unaffected by construction: no entry in `render-assertion-bundle.mjs`'s shared `SCENARIOS` sets `captureData` on `table`/`chart` |
| `node tools/live/touch-targets.mjs` | PASS, exit 0 — fixture 264/279 and constructed 367/367 unchanged |
| `node tools/live/unstyled-links.mjs` | PASS, exit 0 — fixture 112 links across 70 scenarios unchanged |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, exit 0 — 97 files / 961 tests, unchanged |
| `npm run lint:tools` | PASS, exit 0 |
| `npm run lint` | exit 1, 172 problems — identical to the HEAD baseline; `src/` untouched |
| `node tools/naming/scan-comments.mjs` | PASS, exit 0 |
| Full capture run x2 (detached) | 312 entries each; 0 of 36 constructed entries changed `pixelHash`/`layoutHash` between the two runs |
| `node tools/screenshots/verify.mjs` | PASS, exit 0 — 312 entries current, none blank or theme-identical |
| `node tools/lane/check-lane.mjs` | Observed red first: FAIL, exit 1, "8 changed capture(s) this release does not name". After the release entry named all 8: PASS, exit 0; `styles.css` untouched, `baselineHash` unchanged |
| `node tools/live/capture-device-parity.mjs` | PASS, exit 0 — 77 pairs, 0 identical against a baseline of 4, unchanged |
| `node tools/live/evidence.mjs --check-all` | Observed red first: exit 0 but reporting 2 of 16 stale (`touch-targets.json`, `unstyled-links.json`, after `render-assertion-harness.ts` moved). After re-running their writers: 16 of 16 fresh |
| `SURFACE_PHASE=043-constructed-capture npm run gate` and bare `npm run gate` | PASS, exit 0 — 25 green, 0 red, both |
| 8 changed constructed PNGs (table + chart, both devices, both themes) opened and read | Done. Table: named select pills, checked/unchecked checkbox, formatted currency, real dates, a relation chip with a real `file-text` icon. Chart: five bars with genuinely varying summed values (`"Sum of month by Status"`) instead of a flat row-count tally; before the per-column force-fill, the first read showed 2 of 5 bars at zero (real, but an unconvincing proof of "marks exercised") — recorded and then closed by filling only the one column the aggregation reads, not the bench's general shape |
| `node tools/naming/scan-failing-values.mjs` | PASS, exit 0 — baseline 145 unchanged before this task's own tick was added |
| `git diff --stat src/ styles.css` | Empty — no renderer or stylesheet change in this landing either |

**T028 landing (all thirteen of parent row 6's fixture-only scenarios, constructed), every exit code read from `$?` directly:**

| Check | Result |
|-------|--------|
| Red: `constructed-state-assertions.mjs` (new) against the pre-T028 harness | FAIL, exit 1 — 16 of 16 failures across nine paired/single cases; every "on" marker false since the states did not exist |
| Green: same script after implementing the ten harness options and registry entries | PASS, exit 0 — all 16 markers correct, plus a tenth (mini-calendar) single-mount case added in the same pass |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, exit 0 — 97 files / 961 tests (one pre-existing registry-count test updated for the ten new scenario ids and thirteen new `fixtureOf` pairs) |
| `npm run lint:tools` | PASS, exit 0 |
| `npm run lint` | Unaffected — none of this task's touched files appear in its output |
| `node tools/naming/scan-comments.mjs` | PASS, exit 0 |
| `node tools/live/render-assertions.mjs` | PASS, exit 0 — unaffected by construction, none of `render-assertion-bundle.mjs`'s shared `SCENARIOS` sets any of the new fields |
| `node tools/live/touch-targets.mjs` | PASS, exit 0 — fixture 264/279 and constructed 367/367 unchanged |
| `node tools/live/unstyled-links.mjs` | PASS, exit 0 — fixture 112 links across 70 scenarios unchanged |
| Full capture run x2 (detached) | 352 entries each; 0 changed `pixelHash`/`layoutHash` between the two runs |
| Static-path regression | All 312 pre-existing entries (276 fixtures, 36 prior constructed) matched their committed HEAD content exactly — 0 content changes; 10 bytes-only encoder-noise re-encodes restored to committed bytes rather than recommitted |
| `node tools/screenshots/verify.mjs` | PASS, exit 0 — 352 entries current, none blank or theme-identical |
| `node tools/lane/check-lane.mjs` | PASS, exit 0 — release entry names all 40 new captures; `styles.css` untouched, `baselineHash` unchanged |
| `node tools/live/capture-device-parity.mjs` | PASS, exit 0 — 87 pairs, 0 identical against a baseline of 4 |
| `node tools/live/evidence.mjs --check-all` | PASS, exit 0 — 16 of 16 fresh |
| `SURFACE_PHASE=043-constructed-capture npm run gate` and bare `npm run gate` | PASS, exit 0 — 25 green, both |
| 40 new constructed PNGs opened and read | Done. All 10 scenarios on both desktop and phone. A real defect (the `miniCalendar` option silently dropped by `constructedScenario()`'s spec builder) was caught only by this read, after the assertion script had already reported green through a hand-built spec that bypassed the bug |
| `git diff --stat src/ styles.css` | Empty — no renderer or stylesheet change in this landing either |

**T029 landing (touch-targets/unstyled-links' own constructed pass widened to the ten state variants — closes T028's own flagged gap), every exit code read from `$?` directly:**

| Check | Result |
|-------|--------|
| Before, re-measured fresh on `3463c37` (not carried from a prior run) | `touch-targets.mjs`: `[constructed] 56538 across 21 production-renderer scenario(s)`, `under` 367 against a baseline of 367. `unstyled-links.mjs`: `[constructed] 0 link(s) across 21` |
| After | `touch-targets.mjs`: `[constructed] 57060 across 31`, `under` 422 against a rebaselined 422 (367 -> 422, +55, additive per class in `touch-targets-constructed-baseline.json`'s `raiseHistory`). `unstyled-links.mjs`: `[constructed] 144 link(s) across 31`, 0 UA-default findings |
| After rebase onto main's one-to-one board port (`854c748`, `46a8525`) | `touch-targets.mjs`: `[constructed] 50462 across 31`, `under` still 422 against the same baseline of 422 — the ratchet value this landing raised is unmoved by the port; only the total element count measured dropped (57060 -> 50462), consistent with the board's kanban structure being rewritten one-to-one rather than any change here. `unstyled-links.mjs`: `[constructed] 72 link(s) across 31`, still 0 UA-default findings — the board rewrite roughly halved the constructed link total, the pass/fail number (0) is unaffected. Both re-measured directly on the merged tree, not carried forward; recorded in `touch-targets-constructed-baseline.json`'s new `rebaseReconciliation` entry |
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, exit 0 — 97 files / 961 tests, unchanged |
| `npm run lint` | exit 1, 172 problems — byte-identical to the HEAD baseline; `src/`/`styles.css` untouched |
| `node tools/naming/scan-comments.mjs` | PASS, exit 0 |
| `SURFACE_PHASE=043-constructed-capture npm run gate` | PASS, exit 0 — 25 green |
| `render-assertions.mjs` | Unaffected by construction — still imports the original unwidened `SCENARIOS` (21 entries), never `SCENARIOS_WITH_STATES`, so its `BAGS` lookup never sees the three new toolbar `renderer` values |
| Residual, out of scope | touch-targets' printed `scenario` label collides for 7 of the 10 state variants (`scenarioLabel()` keys only on renderer/bag/scale — cosmetic, no pass/fail effect); two `field-icon-picker` desktop captures showed stable Chrome antialiasing drift on a fresh recapture, restored to HEAD bytes rather than recommitted |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **AC-002's criterion cannot be met through the capture path, and this is measured rather than
   argued.** The criterion asks for a capture taken with the readiness wait removed to differ from
   one taken with it present. It does not: `constructed-calendar-week` at 0 frames produced
   `265f58faa024` / `f46ff021c4b2` / `2ea63aecd959` / `afcbb4870a24`, the same four hashes the
   two-frame run recorded. The reason is that the screenshot command itself flushes pending
   animation frames before rasterising, so a one-frame correction can never be photographed
   pre-application. The correction is real: inside the mount, `scrollTop` moves 0 -> 376 across one
   frame. The wait's demonstrated effect is that the layout measured before the screenshot describes
   the same frame the pixels do. The criterion needs an operator ruling — amend it to the
   inside-mount measurement, or accept determinism as the basis. It is left `Unmet` rather than
   quietly reinterpreted.
2. **RESOLVED (T006).** The constructed list used to be a weak photograph with the phone one close
   to empty — 37 DOM rows below the fold at the 1600-row bench shape, the phone capture showing the
   total header over empty ground. `ScenarioSpec.captureData` (opt-in, `constructed-scenarios.mjs`
   the only caller) drops the row count to 18 at full fill for list/board/gallery/calendar/timeline;
   the phone list capture now shows real rows from the first frame. Left as history rather than
   deleted: this was the observed-red evidence T006's own task row cites.
3. **RESOLVED (T004-T006, T027).** All nine constructed views now show typed rendering. T004-T006
   covered list, board, gallery, calendar month/week/day and timeline — a named, coloured select
   pill (`col.statusOptions` rather than the grey no-match fallback), a checked checkbox, a
   formatted currency figure, a relation/link cell, and — on the calendar and timeline captures —
   a real struck-through completed row wherever the capture-sized checkbox column reads true.
   Every Obsidian icon across all nine views draws a real hand-drawn SVG glyph for the 21 icon
   names the render-assertion bundle actually mounts, rather than the stub's placeholder diamond.
   T027 closed the remaining two: table's `fileViewTableBag`/`embedTableBag`
   (`render-assertion-harness.ts:362`, `:397`) now swap `renderCell` for a `CellRenderer` instance
   when `captureData` is on — the same class `database-view.ts` and `embedded-database-renderer.ts`
   wire into their own `renderCell` action — so a typed table cell shows the identical named select
   pill, checkbox, currency figure, date and relation chip (with a real, not placeholder, icon) the
   other five views already had; table stays at its full 2000-row bench shape rather than the
   fixture-sized one, since it has no window to protect and a dedicated in-runtime measurement
   confirmed the real cell renderer adds zero forced layout reads to the row loop. Chart's
   `chartAggregation` switches from `"count"` to `"sum"` over the first `number`/`currency` column
   `MIXED_TYPES` produced, force-filled on every row so the board bench's own sparse fill cannot
   coincidentally zero out a group's bar, so its five marks now carry genuinely varying per-row
   sums rather than a flat row tally. The fixtures are no longer the sole authority for any of the
   nine views' typed rendering; all 70 fixtures stay registered and captured, unaffected by this
   change.
4. **Constructed entries live in the shared manifest, not `screenshots/constructed-manifest.json`.**
   AC-005 and AC-006 are unmet as written. The count is 36 rather than 52, and the separation the
   plan asked for does not exist.
5. **PARTIALLY RESOLVED (T004-T005).** `render-assertion-bundle.mjs`'s shared `SCENARIOS` list —
   what `render-assertions.mjs`, `touch-targets.mjs` and `unstyled-links.mjs` read — now carries all
   five timeline scales; `ScenarioSpec.scale` is widened and the timeline branch reads it instead of
   hardcoding `"week"`. `constructed-scenarios.mjs`'s nine-capture registry is unchanged and still
   registers only the week scale: growing it to cover day/month/quarter/year as actual screenshots
   is T009 (register 13 constructed scenarios), which stays open and out of this task's scope.
6. **PARTIALLY RESOLVED (T029).** `declared-fixtures.mjs` (T010), the `verify.mjs` DECLARED
   staleness inheritance (T011), the explicit `check-lane` widening (T012) and the
   fixture-constructed parity test (T016) remain open. Three of the four manifest-reading lanes read
   the constructed captures already because the entries share the fixture manifest, but that is a
   consequence of the shared-file deviation rather than the wiring the plan specified. T028 narrowed
   the gap further: all thirteen of the parent's row-6 fixture-only scenarios now have a constructed
   counterpart in the shared manifest, cross-checked by hand. What T028 left open — that
   `touch-targets.mjs`/`unstyled-links.mjs`'s own constructed pass
   (`render-assertion-bundle.mjs`'s shared `SCENARIOS`, distinct from `constructed-scenarios.mjs`'s
   `CONSTRUCTED_SCENARIOS`) did not yet include the ten new per-state entries — is now closed by
   T029: both lanes import a new `SCENARIOS_WITH_STATES` export (`SCENARIOS` plus the ten
   `STATE_SCENARIOS` entries) instead of the bare `SCENARIOS`, so their own internal
   fixture-vs-constructed cross-check reaches all 31. This also supersedes the standing prediction
   that widening alone would not make `unstyled-links.mjs`'s constructed pass non-vacuous: seven of
   the ten state variants set `captureData`, so the constructed link count moved from an empty
   sample (0 links across 21) to a real one (144 links across 31, 0 UA-default findings). `SCENARIOS`
   itself stays unwidened — `render-assertions.mjs` also reads it, and its `BAGS` table has no entry
   for the three new toolbar `renderer` values these ten entries add, so merging them there would
   throw on an undefined bag shape; `render-assertions.mjs` keeps reading the original 21 by
   construction, unaffected. Whether this closes parent row 6 outright, or another residual keeps it
   open, is left to a fresh audit rather than decided here (parent D4).
7. **One dispatch leg did not run.** T019 (the second external pass) was skipped; this landing went
   straight from the first dispatched leg to in-runtime verification.
<!-- /ANCHOR:limitations -->
