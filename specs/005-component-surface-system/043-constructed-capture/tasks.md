---
title: "Tasks: Constructed Capture"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "043 tasks"
  - "constructed capture tasks"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/043-constructed-capture"
    last_updated_at: "2026-09-04T08:11:42Z"
    last_updated_by: "in-runtime-code-agent"
    recent_action: "T029 landed: touch-targets/unstyled-links constructed pass widened 21 -> 31 scenarios"
    next_safe_action: "Fresh audit re-reads parent row 6 against T029's widened touch-targets/unstyled-links pass"
    blockers:
      - "T019 (second dispatch leg) was skipped; the landing went straight from leg a to leg c"
    key_files:
      - "tools/screenshots/capture.mjs"
      - "tools/live/render-assertion-bundle.mjs"
      - "tools/live/render-assertion-harness.ts"
      - "tools/live/typed-data-assertions.mjs"
      - "tools/live/constructed-state-assertions.mjs"
      - "tools/live/touch-targets.mjs"
      - "tools/live/unstyled-links.mjs"
      - "tools/live/touch-targets-constructed-baseline.json"
      - "tools/bench/table-render-bench.ts"
      - "tools/storybook/obsidian-stub.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-043-tasks"
      parent_session_id: null
    completion_pct: 79
    open_questions:
      - "Does AC-002 amend to the inside-mount measurement, or accept determinism as its basis?"
      - "Does the shared manifest stand, or is the separate constructed-manifest.json still required?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Constructed Capture

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup — red first

- [x] T001 Confirm the seam contract by reading it in full, not by summary: `buildRenderAssertionBundle()` (`tools/live/render-assertion-bundle.mjs:92-123`), `runRenderAssertions()`'s `onMounted` hook and every `scenario.renderer` branch (`tools/live/render-assertion-harness.ts:1107-1356`), and how `touch-targets.mjs` drives both from inside a Playwright page (`tools/live/touch-targets.mjs:257-311`) — the working precedent for a capture-side mount driver. Read in full during D14 leg a; the constructed mount reuses the same `onMounted` + provenance-readiness pattern (`tools/screenshots/constructed-scenarios.mjs:44-56`).
- [ ] T002 Write the constructed-manifest presence check first, observed red: assert `screenshots/constructed-manifest.json` exists and has 52 entries covering all 13 scenarios × 2 devices × 2 themes. Run it before any constructed capture exists — it must fail (file absent or entry count 0), and the failure text must name what's missing, not just exit 1.
- [x] T003 [P] Spike the parity-basis open question (`spec.md` §12, §6 Risks): mount `list/file-view` via `runRenderAssertions` at its current bench shape (1600 rows), capture it, and compare its `pixelHash` against the existing `list-view` fixture's recorded `pixelHash` (`screenshots/manifest.json`). Record whether they can ever be pixel-equal at that shape (expected: no — different row counts, different content) and confirm the capture-sized data option (T006) is required before the parity check (T017) can be meaningful, not optional polish. In-runtime (leg c): all 7 declared fixture/constructed pairs compared at desktop-dark — every pair differs and none can be pixel-equal at this shape. `list-view` e9a1d0d55fe5 vs `constructed-list` a969e3e72c5e; `table-view` 8522be7222f3 vs fd6b7f1e748d; `board-view` d1eadede638f vs e71cb4408657; `gallery-view` 8e9de3110815 vs 7f193ace8cb0; `calendar-month-view` 772caca5be7c vs fe3481492209; `calendar-week-time-grid` 5276f3f719d6 vs 265f58faa024; `timeline-view` e9478a47f78e vs e9d29112a3dc. Observed by reading both sides, not only by hashing: the fixtures carry curated typed data (select pills, currency, dates, completed strikethrough, real icons) and the constructed captures carry 1600-2000 rows of untyped `row-N`/`fieldN-N` text with every icon drawn as the stub placeholder. Basis recorded: pixel equality is unreachable until T006 lands, so T016 must either wait for it or state a structural basis.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 [P] Extend `ScenarioSpec` (`tools/live/render-assertion-harness.ts`) so the timeline branch reads a scale from `"day" | "week" | "month" | "quarter" | "year"`, defaulting to today's implicit behaviour when omitted. Before/after regression: `node tools/live/render-assertions.mjs` must produce identical output for every currently-registered scenario. Done: `ScenarioSpec.scale` widened to the five-value union with a doc comment naming which renderer owns which subset; the timeline branch reads `scenario.scale ?? "week"` directly (its own `makeTimelineConfig` already accepts all five), the calendar branch narrows to its own three (`"week"`/`"day"`, else `"month"`) rather than casting, since a calendar scenario is only ever constructed with those three. Verified together with T005 (same landing pass): `node tools/live/render-assertions.mjs` exit 0, every scenario — the 17 pre-existing plus T005's 4 new — passes its own structural assertions, and the bag-shape comparison for every pre-existing `renderer/bag` key is unchanged (26/26, 19/19, 25/25, 21/21, 30/30, 24/24, 27/27, 20/20, 13/13, 10/10, 19/19, 15/15, 2/2 members, all PASS).
- [x] T005 [P] Add four new timeline-scale entries to `render-assertion-bundle.mjs`'s shared `SCENARIOS` (`timeline-day/file-view`, `timeline-month/file-view`, `timeline-quarter/file-view`, `timeline-year/file-view`). Before/after regression: `node tools/live/touch-targets.mjs` and `node tools/live/unstyled-links.mjs` must still report the same fixture-pass numbers (264/279 and 112/70 as of `042`'s landing — read the current numbers directly rather than trusting these, they are a pointer not a promise) and the constructed-pass scenario count grows by exactly 4. Done: four entries added, `timeline/file-view`'s existing implicit-week entry left as the fifth scale rather than duplicated. Verified in-runtime: `touch-targets.mjs` fixture pass unchanged at 264 under a baseline of 279, `unstyled-links.mjs` fixture pass unchanged at 112 links across 70 scenarios, and the constructed-pass scenario count grew from 17 to 21 (exactly +4) in both checks. The constructed touch-targets baseline needed an honest raise (335 -> 367, `touch-targets-constructed-baseline.json`'s new `raiseHistory`): the four new scenarios exposed 32 more instances of three ALREADY-recorded classes (`db-timeline-create-button` 1->5, `db-timeline-nav-button` 12->36, `db-timeline-scale-menu` 2->6) — the same shape the fixture baseline's own `037` precedent already documents for the fixture pass, no new class. Every other class held its exact prior count, confirmed by diffing the `--json` output.
- [x] T006 Add the opt-in capture-sized data option to the mount path (`tools/live/render-assertion-harness.ts`). Red first: attempt T003's list capture at the default bench shape, confirm it is visually dense/unrecognisable relative to the fixture. Green: the same mount with the capture-sized option produces a row count comparable to the fixture's own (`scenarios/shared.mjs`'s `ROWS`, ~12-20). Regression: all three existing consumers (`render-assertions.mjs`, `touch-targets.mjs`, `unstyled-links.mjs`) exit 0 with unchanged numbers when the option is not passed. Done: `ScenarioSpec.captureData` (opt-in, default unset) swaps `"text"` for `"mixed"` column kind, `LIST_ROWS`/`BOARD_ROWS`/`GALLERY_ROWS`/`CALENDAR_ROWS`/`TIMELINE_ROWS` for `CAPTURE_ROWS = 18`, and the benches' own sparse fill rate for `CAPTURE_FILL = 1`, across the list/board/gallery/calendar/timeline branches (table and chart left on the structural-cost shape — table's harness bag renders cells through a stub the option does not reach, chart shows no per-row field); `applyCaptureOptions`/`applyCaptureGroupPalette` point select/status/multi-select columns at a named, coloured `CAPTURE_OPTIONS` set instead of the bench's placeholder value, which otherwise matches no configured option and always renders the renderer's own grey no-match fallback. T003's list capture at the default bench shape was the observed red for the row-count problem (Known Limitation 2: 37 DOM rows below the fold on desktop, phone showing only the total header). The typed-marker red is `tools/live/typed-data-assertions.mjs`, a permanent negative control built for this task and run both ways: with the harness at its pre-T006 state (git-stashed), `captureData: true` on the same list scenario showed 0 of 3 markers (named select pill, checked checkbox, formatted currency) — FAIL, exit 1; after restoring, the same run showed all 3 present with `captureData: true` and all 3 absent with `captureData: false` (the same scenario, un-opted-in) — PASS, exit 0. `CAPTURE_ROWS = 18` sits inside the fixture's ~12-20 range. Regression confirmed: `render-assertions.mjs`, `touch-targets.mjs` and `unstyled-links.mjs` all exit 0 with the numbers T004/T005 already recorded, none of which pass `captureData`.
- [x] T007 Add the constructed scenario type and mount driver to `capture.mjs`: build the bundle once, host it in a static page per device/theme (mirroring `buildPage()`'s existing theme/device class handling), expose a mount function, and route it through the same viewport/element screenshot logic the fixture path already has (`captureMode()`, `capture.mjs:97-99`). D14 leg a: `capture.mjs:102-104` (combined registry), `:188-202` (refusal + one bundle build before the loop), `:260-278` (mount branch; fixture branch byte-identical), `:411-417` (manifest marking: `source: "constructed"` + `renderer`/`bag`/`scale`); the mount driver and 9-scenario registry in `tools/screenshots/constructed-scenarios.mjs:44-235` reuse `buildRenderAssertionBundle` (imported, not copied, `:24`) and the harness's `onMounted` readiness (`:44-56`). The 9 registered ids are `constructed-list/table/board/gallery/calendar-month/calendar-week/calendar-day/timeline/chart` (`:171-225`), timeline at the harness's implicit week scale. Sanity-run in the sandbox (a system Chrome was present): all 9 mounts resolved ready on desktop+mobile×dark+light; PNGs decode non-flat at device size and differ across themes — recorded as a sanity note, not gate evidence (D14: only leg c's browser numbers count). Confirmed in-runtime (leg c): two full detached runs produced 36 constructed entries (9 x 2 devices x 2 themes), all 36 PNGs opened and read, every theme pair differs by pixelHash, and the bundle reuse is real — `buildRenderAssertionBundle` is imported and the three existing consumers exit 0 with unchanged numbers (touch-targets 70 fixture / 17 constructed, baselines 279 / 335; unstyled-links 112 fixture links).
- [x] T008 Add the readiness-signal wait (documented frame count, capture-owned, no `src/` edit) before layout measurement and screenshot. Negative control: for at least one of `calendar-week/file-view` or `timeline/file-view` (both schedule a post-render `requestAnimationFrame` correction — `calendar-renderer.ts:605`/`:1482`, `calendar-timeline-renderer.ts:906`), capture once with the wait removed and once with it present; the two must differ (`pixelHash` or `layoutHash`), proving the wait does something rather than being decorative. D14 leg a: `READY_ANIMATION_FRAMES = 2` + `waitForConstructedLayout()` in `tools/screenshots/capture.mjs:105-125`, basis comment `:105-112`. Control result (measured, sandbox): the inside-mount snapshot proves the calendar week/day corrections are real and one frame deep — container `scrollTop` moves 0 -> 376 between mount-return and the next frame — but the with/without-wait captures are pixel-identical, because the screenshot command itself runs pending animation frames before rasterising, so a single-frame correction can never be photographed pre-application. The wait's proven effect is therefore deterministic layout measurement, not pixel difference; the plan's pixel-difference criterion needs a phase decision (amend to the inside-mount measurement or accept the determinism basis) — flagged for the in-runtime leg, which must re-run and record the ruling. Re-run in-runtime (leg c) and confirmed independently: inside the mount, `.note-database-container` scrollTop reads 0 synchronously after `__mountConstructed` returns, 376 after one frame and 376 after two (observed through a separate CDP evaluate it already reads 376, because the round-trip spans a frame). The pixel control was also run rather than reasoned about: with `READY_ANIMATION_FRAMES` set to 0, `--only constructed-calendar-week` produced pixelHash 265f58faa024 / f46ff021c4b2 / 2ea63aecd959 / afcbb4870a24 — identical to the two-frame manifest on all four entries. So the plan's pixel-difference criterion is unmeetable through the capture path and AC-002 stays Unmet pending a phase ruling; the wait's measured effect is that the layout hash cannot race the correction, evidenced by 0 of 36 constructed entries changing pixelHash or layoutHash across two independent full runs.
- [ ] T009 Register the 13 constructed scenarios (list, table, board, gallery, calendar×3 scales, timeline×5 scales, chart), each with its capture group/title/sources, and run a full constructed capture producing `screenshots/constructed/` PNGs and `screenshots/constructed-manifest.json`. Green: T002's presence check now passes.
- [ ] T010 Create `tools/screenshots/declared-fixtures.mjs` with the 11-entry mapping from `plan.md`'s Architecture table (11 DECLARED, 2 net-new with no prior fixture, 13 fixture-only entries named and left alone).
- [ ] T011 Wire `verify.mjs` (screenshots-fresh) to read `declared-fixtures.mjs`: for a DECLARED scenario, judge staleness against the constructed capture's `sourceHashes` (which is derived from the real bundle's inputs) rather than only the fixture's hand-maintained `sources` array. Red first: hand-edit a `src/views/*` renderer source the constructed capture depends on (in a scratch branch or reverted immediately), confirm `verify.mjs` now flags the DECLARED scenario stale where it previously would not have.
- [ ] T012 Wire `check-lane.mjs` to treat a changed constructed capture the same as a changed fixture capture: widen `contentChangedCaptures()` to also read `screenshots/constructed-manifest.json` and the `screenshots/constructed/` directory. Red first: mutate one constructed capture's `pixelHash` without naming it in a release entry, confirm the lane reds exactly the way it already reds for an unnamed fixture change.
- [x] T013 Confirm whether `capture-device-parity.mjs` already covers `screenshots/constructed/` through its existing directory-and-naming-convention scan (`capture-device-parity.mjs:47-61` iterates every group directory under `screenshots/`, keyed only on the `-mobile-dark.png` / `-desktop-dark.png` suffix pair — not on `scenarios.mjs`'s scenario list). If it does, no code change is needed; record the confirmation. If it does not (for example because the constructed PNGs use a different naming convention), extend it minimally to match. Confirmed in-runtime, no code change needed: `node tools/live/capture-device-parity.mjs` exits 0 and reports 77 scenarios captured on both devices, up from the committed 68 — exactly the 9 constructed pairs — while `capture-device-parity.json` records the same tool input hash ff0cac47e594 on both sides, so the scan reached them through its existing naming convention.
- [x] T014 Re-baseline `device-parity-baseline.json` if the constructed captures introduce any new mobile/desktop-identical pair, per the file's own ratchet discipline (a scenario joining the identical list is a real regression signal and must be named, not silently absorbed). No re-baseline was owed and none was taken: the run reports 0 identical against a recorded baseline of 4, and 77 of 77 render differently on a phone, so no constructed pair joined the identical list. Was 68 pairs / 0 identical before.
- [x] T015 [P] Confirm `styles.css` is unmodified by this phase (`git diff --stat styles.css` empty) — no CSS-lane hold should be needed. If a real defect surfaces, record it in `goal.md`'s log and defer rather than fix inline. Verified at D14 leg a: `git diff --stat styles.css` is empty and `git status` lists no stylesheet change; `check-lane`'s baseline hash is untouched.
- [ ] T016 [P] Add `tools/screenshots/fixture-constructed-parity.test.mjs`: for every DECLARED scenario in `declared-fixtures.mjs`, assert both the fixture and constructed manifest entries exist, and compare `pixelHash` per T003/T006's resolved basis (data-aligned pixel comparison once T006 lands, or an explicit structural check if pixel-equality is not achievable even with aligned data — the test states which basis it uses and why, it does not silently pick one).
- [x] T017 Confirm the DONE-row-6 bounded list: run the fixture-only 13-entry list from `plan.md`'s Architecture table against the current gate lanes and confirm none of them silently disappeared from `scenarios.mjs` or the manifest during this phase. Checked in-runtime: all 13 fixture-only ids are present in `SCENARIOS` and in `screenshots/manifest.json` (0 missing from either), the registry still carries 70 fixtures exactly as HEAD did, and 7 of them now declare a `fixtureOf`.
- [x] T027 Close the last two items of the parent `goal.md` DONE row 6 (`done-audit-7`, narrowed a second time): table's constructed capture rendered every cell through the harness bag's plain-text stub regardless of `captureData` (`render-assertion-harness.ts:1409`, `makeTableColumns(TABLE_COLUMNS)` took no kind argument), and chart's constructed capture aggregated by row count with no per-row field to type at all (`:1336`, `makeBoardColumns(CHART_COLUMNS, "text")` hardcoded, `chartAggregation: "count"`). Red first: extended `tools/live/typed-data-assertions.mjs` to mount `constructed-table` and `constructed-chart` (alongside the existing `constructed-list` case) twice each, once with `captureData` on and once off, and assert five table markers (named select pill, checked checkbox, formatted currency, a rendered date, a relation chip's real icon) and one chart marker (a per-row value field wired into the aggregation, read off `runRenderAssertions`'s own return value since Chart.js draws to a `<canvas>` a DOM query cannot read). Run against the pre-change tree (`git stash` on the two source files only, the new test script kept): FAIL, exit 1, 6 of 6 new assertions failed — `namedSelectPill`, `checkedCheckbox`, `currency`, `dateValue`, `relationIcon` false for `constructed-table` under `captureData: true`, `perRowValueField` false for `constructed-chart` under the same. Implemented: `tools/bench/table-render-bench.ts:50-73` gained a `kind: "text" | "mixed"` parameter on `makeColumns` (mirroring every other bench's own `MIXED_TYPES`/`valueForType` pair, key/label naming left at `field${i}` so the harness's own `"field1" holds the same cell index"` assertion keeps matching regardless of kind) and `makeRows` now calls `valueForType` unconditionally, which is behaviour-identical to the old `${col.key}-${i}` for the "text" kind, changed only under "mixed". `render-assertion-harness.ts`'s table branch (`:1482` onward) passes `scenario.captureData ? "mixed" : "text"` and calls `applyCaptureOptions`; `fileViewTableBag`/`embedTableBag` (`:362`, `:397`) take a `captureData` flag and swap `renderCell` for a `CellRenderer` instance (`makeCaptureCellRenderer`, `:293`) — the same class `database-view.ts`/`embedded-database-renderer.ts` wire into their own `renderCell` action, constructed with no live `DataSource`/`App` since `renderCell`'s typed branches never read either. The chart branch (`:1391`) picks the first `number`/`currency` column `MIXED_TYPES` produced as `chartValueField`, switches `chartAggregation` from `"count"` to `"sum"`, and force-fills that one column on every row (`i * 37 + 0.5`) so the board bench's own 30% sparse fill cannot coincidentally zero out a whole group's bar — the first read without that fill showed 2 of 5 bars empty (see `implementation-summary.md`'s verification table), a real but unconvincing "marks exercised" proof. Green: same 6 assertions, exit 0. Read-bound measurement (the dispatch's own ask, not assumed): a dedicated in-runtime mount of `{renderer: "table", bag: "file-view", captureData: true}` at the full 2000-row shape reported the identical `"3 of 3 layout reads... bound 8"` / `"3 layout reads... bound 8"` the `captureData: false` structural path already carried — the typed cells add zero forced reads to the row loop, confirmed rather than assumed silent. Two detached capture runs (`nohup`, waited on the PID) reproduced identical `pixelHash`/`layoutHash` for all 36 constructed entries; against the prior committed manifest exactly 8 of 312 entries changed (`constructed-table`/`constructed-chart`, both devices, both themes) and all 8 were opened and read: the table shows named select pills, a checked/unchecked checkbox column, formatted currency, real dates and a relation chip with a real (not placeholder) icon; the chart shows five bars with genuinely varying summed values instead of a flat row count. `css-lane.json` carries a new release entry naming the 8 (`styles.css` untouched, `baselineHash` unchanged); `check-lane.mjs` red-then-green: FAIL first (`8 changed capture(s) this release does not name`) before the entry was added, PASS after. `node tools/live/render-assertions.mjs`, `node tools/live/touch-targets.mjs`, `node tools/live/unstyled-links.mjs` all exit 0 with every pre-existing number unchanged (367/367 constructed touch-target baseline, 112 fixture links across 70 scenarios) — none of `render-assertion-bundle.mjs`'s shared `SCENARIOS` sets `captureData` on `table`/`chart`, so this change is invisible to those three lanes by construction, not just by measurement. `npx tsc --noEmit`, `npx vitest run` (97 files / 961 tests, unchanged), `npm run lint:tools`, `node tools/naming/scan-comments.mjs` all exit 0; `npm run lint` still exits 1 at 172 problems, identical to the HEAD baseline (`src/`/`styles.css` untouched, `git diff --stat` empty on both). `SURFACE_PHASE=043-constructed-capture npm run gate` and bare `npm run gate` both exit 0, 25 green.
- [x] T028 Give each of the parent `goal.md` DONE row 6's bounded thirteen fixture-only scenarios (done-audit-8: `board-subtask-tree`, `table-mobile`, `list-mobile`, `board-mobile`, `list-sparse-fields`, `calendar-mini-calendar`, `calendar-empty-state`, `calendar-toolbar-options`, `timeline-subtask-tree`, `timeline-toolbar-options`, `chrome-chart-options-popover`, `chrome-chart-number`, `chrome-chart-empty`) a constructed counterpart, or name why one genuinely cannot exist. Red first: `tools/live/constructed-state-assertions.mjs` (new), mounting each new state option twice (off/on) plus three single-mount toolbar-popover cases, run against the pre-change harness — FAIL, exit 1, 16 of 16 failures (every "on" marker false, every "off" marker already false — nothing to prove yet). All thirteen turned out constructible through real production code paths; none was left fixture-only. Three were free: `table-mobile`/`list-mobile`/`board-mobile` are superseded by the EXISTING `constructed-table`/`-list`/`-board` scenarios' own mobile-device capture (the shared device loop already mounts them at `is-phone`, confirmed by a genuinely distinct mobile `layoutHash` already on record) — no new registry entry, only a `fixtureOf` declaration. Ten needed new `ScenarioSpec` options on `render-assertion-harness.ts`, all additive and off by default: `subtaskTree` (board, timeline — wires the first `captureData` row into a parent with two children via `buildSubtaskRelation`'s own frontmatter keys: `parentId`/`subtaskIds`/`collapsed`/`progress`), `sparseFields` (list — blanks a deterministic subset of fields so `shouldReserveColumns`'s real measurement runs), `emptyState` (calendar — strips every date-typed column so `renderMonth`'s real no-date-field branch fires), `chartVariant: "number" | "empty"` (chart — `chartType: "number"`, or a `chartHiddenGroups` map hiding every value the group field produced, both real `ViewConfig` shapes), `miniCalendar` (calendar — clicks the real `data-icon="calendar-days"` trigger button `renderMiniCalendarButton` builds), and three new `renderer` values (`calendar-toolbar`, `timeline-toolbar`, `chart-toolbar`) that call `CalendarToolbarRenderer`/`CalendarTimelineToolbarRenderer`/`ChartToolbarRenderer`'s own public `togglePopover()` against a visually-hidden real anchor button — never a hand-applied class. The three popovers are captured full-page (`group: "components"`, `capture: "viewport"`) because their panel positions itself with `position: fixed`/`absolute`, which an element-scoped `#shot` crop cannot see; confirmed correct on both devices, including the real bottom-sheet presentation the identical production code takes on the phone (`isMobileBottomSheet`). `manifest-schema.mjs`'s `CONSTRUCTED_RENDERERS` enum gained the three new renderer values — without it the manifest write itself refuses, which it did on the first capture attempt (observed: `manifest schema rejects an entry this run captured`). A genuine defect was caught reading the actual captures, not by the assertion script: `constructedScenario()`'s spec builder never forwarded `opts.miniCalendar` into the harness spec, so the mini-calendar click never fired through the real registry path even though a hand-built spec (used by both the assertion script and a standalone debug harness) proved the underlying branch correct — the popover was genuinely absent from `constructed-calendar-mini-desktop-dark.png` and `-mobile-dark.png` until the one-line fix landed; this is exactly the failure mode `epic-traps.md`'s own precedent (`item 27`, a mount artefact invisible to structural assertions) warns about, and it is why this program reads every capture rather than trusting a passing assertion alone. Green: `constructed-state-assertions.mjs` exit 0, all 16 markers correct (off false / on true), plus a tenth single-mount mini-calendar case added in the same pass and green on its own first run for the reason above (its hand-built spec bypassed the registry bug the real pipeline had). Regression: `render-assertions.mjs`, `touch-targets.mjs`, `unstyled-links.mjs` all exit 0 with every pre-existing number unchanged (none of `render-assertion-bundle.mjs`'s shared `SCENARIOS` sets any of the new fields). Two full detached capture runs (`nohup`, waited on the PID) reproduced identical `pixelHash`/`layoutHash` for all 352 entries (0 changed between runs); against the committed manifest all 312 pre-existing entries (276 fixtures, 36 prior constructed) matched exactly — 0 content changes, 10 bytes-only encoder-noise re-encodes restored to committed bytes rather than recommitted, matching this program's own established precedent for that class of noise. All 40 new captures (10 scenarios x 2 devices x 2 themes) opened and read on both desktop and phone. `css-lane.json` carries a new release entry naming all 40 (`styles.css` untouched, `baselineHash` unchanged); `check-lane.mjs` exit 0, "release names all 40 changed capture(s)". `npx tsc --noEmit`, `npx vitest run` (97 files / 961 tests, one pre-existing registry-count test updated for the ten new scenario ids), `npm run lint:tools`, `node tools/naming/scan-comments.mjs` all exit 0; `npm run lint` unaffected (no file this task touched appears in its output). `node tools/live/evidence.mjs --check-all` 16 of 16 fresh. `SURFACE_PHASE=043-constructed-capture npm run gate` and bare `npm run gate` both exit 0, 25 green. **What this does not close on its own:** `touch-targets.mjs`/`unstyled-links.mjs`'s own constructed pass (`render-assertion-bundle.mjs`'s shared `SCENARIOS`, distinct from `constructed-scenarios.mjs`'s `CONSTRUCTED_SCENARIOS`) was not widened to include these ten new per-state entries, so those two lanes' internal fixture-vs-constructed cross-check still does not reach them — even though a constructed counterpart demonstrating the identical markers now exists in the shared capture manifest, declared via `fixtureOf` and cross-checked by hand. Recorded as a bounded, named gap for a fresh audit to weigh against parent `goal.md` row 6's own wording, not self-certified closed here.
- [x] T029 Close T028's own flagged gap (Known Limitations 6, `goal.md`'s row-6 closing move): give `touch-targets.mjs` and `unstyled-links.mjs`'s own constructed pass the ten per-state entries `constructed-state-assertions.mjs` already proved. Added a `STATE_SCENARIOS` array (the ten variants) and a `SCENARIOS_WITH_STATES = [...SCENARIOS, ...STATE_SCENARIOS]` export to `render-assertion-bundle.mjs`; both lanes now import `SCENARIOS_WITH_STATES` for their own constructed pass instead of the bare `SCENARIOS`. The ten were not merged into `SCENARIOS` itself: `render-assertions.mjs` also reads `SCENARIOS`, and its `BAGS` table has no entry for the three new toolbar `renderer` values (`calendar-toolbar`, `timeline-toolbar`, `chart-toolbar`) these add — merging them there would look up an undefined bag shape and throw, so `render-assertions.mjs` keeps reading the unwidened 21; touch-targets/unstyled-links measure DOM geometry and link colour, not action-bag membership, so that constraint does not bind them. Before (re-measured fresh on `3463c37`, not carried from a prior run): touch-targets `[constructed] 56538 across 21 production-renderer scenario(s)`, `under` 367 against a baseline of 367; unstyled-links `[constructed] 0 link(s) across 21`. After: touch-targets `[constructed] 57060 across 31`, `under` 422 against a rebaselined 422 (raised from 367; the ten scenarios' own under-floor contributions — 0+8+0+22+0+0+0+6+8+11 = 55 — are additive and attributed per class in `touch-targets-constructed-baseline.json`'s new `raiseHistory` entry, verified both in isolation and against the full 31-scenario run); unstyled-links `[constructed] 144 link(s) across 31`, 0 UA-default findings — seven of the ten state variants set `captureData` (the three toolbar-popover variants do not), so the constructed link pass is no longer an empty sample. This supersedes Known Limitations 6's "widening alone would not make it non-vacuous" concern for the link lane (updated below to match) and closes `goal.md`'s row-6 closing move for touch-targets/unstyled-links specifically — whether it closes the row itself is left to a fresh audit, not decided here. Regression: `npx tsc --noEmit` exit 0; `npx vitest run` exit 0 (97 files / 961 tests, unchanged); `npm run lint` 172 problems, byte-identical to the HEAD baseline (`src/`/`styles.css` untouched); `node tools/naming/scan-comments.mjs` exit 0; `SURFACE_PHASE=043-constructed-capture npm run gate` exit 0, 25 green. Residual, out of scope: touch-targets' printed `scenario` label collides for 7 of the 10 state variants (`scenarioLabel()` keys only on renderer/bag/scale, not on the new option fields — cosmetic, no pass/fail effect since this file's own per-class attribution is computed directly against each `ScenarioSpec`, not the label); two `field-icon-picker` desktop captures showed stable Chrome antialiasing drift on a fresh recapture and were restored to HEAD bytes rather than recommitted. Post-rebase reconciliation (onto main's one-to-one board port, `854c748`/`46a8525`): re-measured directly on the merged tree rather than carried forward — touch-targets `[constructed] 50462 across 31`, `under` still 422 against the same baseline (the ratchet value is unmoved; only the total measured count dropped from 57060, matching the board renderer's one-to-one rewrite); unstyled-links `[constructed] 72 link(s) across 31`, still 0 UA-default findings (constructed link total roughly halved by the same rewrite, the pass/fail number is unaffected). Recorded in `touch-targets-constructed-baseline.json`'s new `rebaseReconciliation` entry.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T018 [P] Dispatch (D14 leg a): `cli-devin` on `deepseek-v4-flash-max`, `--permission-mode dangerous`, own worktree, initial implementation pass over T004-T016. No browser number from this leg is evidence. Ran; the leg delivered T007, T008 and the fixture declarations and left T004-T006, T009-T012, T016 open. Its claims were treated as hypotheses and each was re-measured in leg c.
- [ ] T019 [P] Dispatch (D14 leg b): `cli-codex` or `cli-opencode` on `gpt-5.6-luna`, `model_reasoning_effort=xhigh` or `max`, `service_tier=fast`, own worktree, second pass / repair over leg (a)'s result. No browser number from this leg is evidence either.
- [x] T020 In-runtime verification (D14 leg c, the only leg whose Chrome numbers count): pull the dispatched result into the main checkout (or its own worktree, then merge), and from a fresh in-runtime session run every check in T021-T023 directly. Done on the phase worktree, fast-forwarded onto main at c13e020 first; every exit code below was read from $? directly, never through a pipe.
- [x] T021 `pgrep -f "tools/screenshots/capture.mjs|tools/gate.mjs"` empty, then `node tools/live/render-assertions.mjs`, `node tools/live/touch-targets.mjs`, `node tools/live/unstyled-links.mjs`, each `$?` read directly (never through a pipe) — all three must exit 0 with the same fixture-pass numbers they had before this phase. pgrep empty before the run. render-assertions exit 0; touch-targets exit 0 with 70 fixture scenarios and 17 constructed, baselines 279 and 335 unchanged; unstyled-links exit 0 with 112 fixture links across 70 scenarios. The harness and its bundle were never edited, so the three consumers are unchanged by construction as well as by measurement.
- [x] T022 Run the constructed capture detached (`nohup`, wait on the PID — a foreground run exceeds the 10-minute cap and a killed run leaves half-written PNGs), then `node tools/screenshots/verify.mjs`, `node tools/lane/check-lane.mjs`, `node tools/live/capture-device-parity.mjs`, each `$?` read directly. Two detached runs (nohup, waited on the PID), 312 entries each. verify.mjs exit 0, 312 entries current with none blank or theme-identical. check-lane observed red first — exit 1, "36 changed capture(s) this release does not name" — then exit 0 once the release entry named all 36. capture-device-parity exit 0, 77 pairs, 0 identical. Determinism measured across the two runs: 0 of 312 entries changed pixelHash or layoutHash, constructed included.
- [x] T023 `npx vitest run` (new tests included), `npx tsc --noEmit`, `npm run lint:tools`, `node tools/naming/scan-comments.mjs` all exit 0. All four exit 0: vitest 97 files / 961 tests (was 96 / 953 at HEAD), tsc clean, lint:tools clean, scan-comments clean. `npm run lint` still exits 1 with 172 problems, identical to the HEAD baseline, because src/ is untouched.
- [x] T024 `SURFACE_PHASE=043-constructed-capture npm run gate`, `$?` read directly: must be 0. Exit 0 — gate: PASS, 25 green, 0 red. evidence --check-all was observed red first (exit 1, 4 of 16 artefacts stale after scenarios.mjs moved) and returned 16 of 16 fresh, exit 0, once checkbox-appearance, engine-parity, replay and view-census were re-run. checkbox-appearance and engine-parity still exit 1 on their own pre-existing failures (2.99:1 border, 520 vs 512 width), unchanged and unrelated: this phase edits neither styles.css nor src/.
- [x] T025 Backfill: `backfill-graph-metadata.ts` on this child folder (positional, `realpath .opencode`, `NODE_PRESERVE_SYMLINKS=1`); `validate.sh <this folder> --strict` first `RESULT:` line `PASSED`; `build-operator-checklist`; `scan-failing-values` exit 0. Observed red twice before green. validate.sh --strict first read `RESULT: FAILED`, exit 2, Errors: 2 — six continuity fields were narrative and implementation-summary.md carried a stale Spec Folder value; after compacting them and matching the sibling packet's form, the first RESULT line reads PASSED at exit 0 with 1 advisory warning (AI_PROTOCOL). scan-failing-values first read FAIL, exit 1, "1 newly ticked criterion records no failing value" against a recorded baseline of 145; after the gate criterion carried the value it moved from, PASS at exit 0. build-operator-checklist exit 0, 80 rows across 38 phases.
- [x] T026 Write `implementation-summary.md` in the same landing pass as the first ticks in this file, per this program's own Level-3 discipline (a Level 3+ packet fails `validate.sh` the moment `tasks.md` ticks unless the summary exists alongside). Written in this landing pass, before the backfill and before validate.sh was run: it did not exist in the packet folder at the start of leg c, which is the observed-red condition this task exists to prevent.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks above marked `[x]`, each with its own red-then-green evidence line, not a bare checkmark
- [ ] No `[B]` blocked tasks remaining
- [ ] `goal.md`'s completion criteria all carry their observed-red number before being ticked green
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Durable directive**: See `goal.md`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in `spec.md`
- [ ] CHK-002 [P0] Technical approach defined in `plan.md`
- [ ] CHK-003 [P1] Dependencies identified and available (`042`'s seam, confirmed green on `main`)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` and `npm run lint:tools` pass
- [ ] CHK-011 [P0] No console errors/warnings from the constructed capture run
- [ ] CHK-012 [P1] Every failure mode (bundle-build failure, readiness timeout) is bounded per-scenario, not run-fatal
- [ ] CHK-013 [P1] Comment-section banners on every new `tools/` file (`node tools/naming/scan-comments.mjs`)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria in `acceptance-criteria.md` met, waived or superseded
- [ ] CHK-021 [P0] Manual review: all 13 constructed PNGs opened and confirmed non-degenerate
- [ ] CHK-022 [P1] Readiness-wait negative control passes (T008)
- [ ] CHK-023 [P1] Harness-regression negative control passes for T004/T005/T006
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

Not applicable — this phase is new capability, not a bug fix (see `plan.md`'s FIX ADDENDUM).
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets — N/A, no secrets touched
- [ ] CHK-031 [P0] N/A — no user input surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] `spec.md` / `plan.md` / `tasks.md` / `acceptance-criteria.md` / `goal.md` synchronized
- [ ] CHK-041 [P1] Code comments explain WHY (readiness wait, capture-sized data option), not just WHAT
- [ ] CHK-042 [P2] Parent `spec.md` Phase Documentation Map and `roadmap.md` §5 updated
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in `scratch/` only
- [ ] CHK-051 [P1] `scratch/` cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | 0/9 |
| P1 Items | 9 | 0/9 |
| P2 Items | 2 | 0/2 |

**Verification Date**: Not yet run — phase just opened.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in `plan.md` §3 (no separate `decision-record.md` — optional at this level, not opened unless a decision needs formal ADR weight)
- [ ] CHK-101 [P1] N/A — no ADRs opened yet
- [ ] CHK-102 [P1] N/A
- [ ] CHK-103 [P2] N/A — no migration
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] NFR-P01 met — the full 52-capture constructed run completes inside the same detached-run discipline `npm run screenshots` already uses
- [ ] CHK-111 [P1] N/A — no throughput target for a local capture tool
- [ ] CHK-112 [P2] N/A — no load testing surface
- [ ] CHK-113 [P2] Capture-run wall-clock time recorded once, for the operator record, not enforced as a gate
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested (`plan.md` §7)
- [ ] CHK-121 [P0] N/A — no feature flag; this is a dev-tooling change with no runtime plugin surface
- [ ] CHK-122 [P1] N/A — no production monitoring surface
- [ ] CHK-123 [P1] N/A — no runbook beyond `plan.md`/`tasks.md` themselves
- [ ] CHK-124 [P2] N/A
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] N/A — no security-relevant surface (local headless-Chrome tooling)
- [ ] CHK-131 [P1] N/A — no new dependency added
- [ ] CHK-132 [P2] N/A
- [ ] CHK-133 [P2] N/A — no data handling beyond local PNG/JSON artefacts already covered by this repo's existing capture pipeline
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All five packet docs synchronized (see CHK-040)
- [ ] CHK-141 [P1] N/A — no API surface
- [ ] CHK-142 [P2] N/A — no user-facing documentation; this is internal tooling
- [ ] CHK-143 [P2] Knowledge transfer via `plan.md`'s Architecture section and `goal.md`'s log
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Technical Lead | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
