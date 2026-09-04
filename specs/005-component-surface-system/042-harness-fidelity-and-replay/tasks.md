---
title: "Tasks: Harness Fidelity and Replay"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "042 tasks"
  - "harness fidelity tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Harness Fidelity and Replay

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
## Phase 1: Setup

- [x] T001 Read `tools/live/render-assertion-harness.ts` in full and confirm the existing bag/scenario contract before extending it (`tools/live/render-assertion-harness.ts`)
      Evidence: the contract now carries a calendar `scale` member (`render-assertion-harness.ts:171`) and a `"chart"` renderer (`:172`); the scenario runner branches at `:1182` (calendar) and `:1222` (chart).
- [x] T002 Read `src/views/chart-renderer.ts`'s constructor and public surface to determine whether it fits the existing bag pattern (`src/views/chart-renderer.ts`)
      Evidence: `ChartRenderer` is constructed with no arguments (`chart-renderer.ts:266-272`); its bag is the actions object the render call takes, and both hosts pass the same two members — `database-view.ts:10634-10641`, `embedded-database-renderer.ts:804-817`. The harness builds the same bag (`render-assertion-harness.ts:511-516`) and the runner's census pins it (`render-assertions.mjs:190`).
- [x] T003 [P] Confirm each replay-entry SHA (`98da630`, `0c92f4d`, `85ff504`, `037`-`041`'s landing commits) still exists in `git log` (repo)
      Evidence: `git log -1 --format="%h %s"` on `98da630`, `0c92f4d`, `85ff504`, `0262386`, `55bff9b`, `b9e2321`, `a6fcd31`, `57043e7`, `1588576`, `1d611db`, `00b7bd2`, `cb9aedf`, `25ae3a9` — all thirteen resolve on this worktree's history; each commit body and the owning phase's `goal.md` supplied the recorded red/green numbers the replay entries carry (`tools/live/replay.mjs:241-539`).
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Measure and record the chart view's current renderer-coverage state (uncovered) before writing any scenario (`tools/live/renderer-coverage.json`)
      Evidence: before this leg, `grep -in chart tools/live/render-assertion-harness.ts` returned nothing and the stamp read `constructed: 6` (`renderer-coverage.json` pre-edit). After: `constructed: 7` distinct renderers of 22 renderer files (`renderer-coverage.json:21`), published 6 → 7.
- [x] T005 Add a chart-renderer render-assertion scenario with an owned negative control, observed red before green (`tools/live/render-assertion-harness.ts`, `tools/live/render-assertions.mjs`)
      Evidence: scenario at `render-assertions.mjs:86` (registered), constructed at `render-assertion-harness.ts:1222-1241`; assertions at `:1023-1042`; provenance tag at `:614`. Red first: `RENDER_READ_CONTROL=per-item node tools/live/render-assertions.mjs` — `chart/file-view: no forced layout inside the chart build — 1630 layout reads during render, bound 48`, exit 1. Green: disarmed run reads 30 against the same bound, exit 0. Bound basis: the measured 30 (theme token reads + Chart.js canvas sizing) plus margin, far below the armed 1630.
- [x] T006 Measure and record the calendar lane's current scale coverage (month-only) before writing the week/day scenarios (`tools/live/render-assertion-harness.ts`)
      Evidence: the pre-edit runner called `makeCalendarConfig(columns, "month")` only; the lane now constructs all three scales (`render-assertion-harness.ts:1195`), with scenarios registered at `render-assertions.mjs:80-83`.
- [x] T007 Add calendar `scale: "week"` and `scale: "day"` scenarios, each with an owned negative control and bounds set from measured reads (`tools/live/render-assertion-harness.ts`, `tools/live/render-assertions.mjs`)
      Evidence: week/day branches at `render-assertion-harness.ts:1199-1201`, assertion suite at `:1000-1016`. Red first (armed): week 14 reads vs bound 8, day 1600 vs 8, both bags, exit 1. Green: both read 0 vs 8, exit 0 — the measured basis (0 reads at both scales) is the recorded bound basis. Week arms the shared per-item seam; day cannot exceed the bound through that seam (a day column caps its all-day lanes at six), so it arms the per-row render-entry control (`:1097-1105`), the same shape the bound exists to catch.
- [x] T008 Re-stamp `renderer-coverage.json` and confirm the ratchet does not decrease (`tools/live/renderer-coverage.json`)
      Evidence: stamped `constructed: 7, total: 22` (`renderer-coverage.json:21-22`); the lane wording is `coverage 7 distinct renderers of 22 renderer files exercised by this check (published 6 → 7)`, exit 0. The count is distinct renderer names via `countConstructed` (`render-assertions.mjs:362`, `tools/live/render-scenario-utils.mjs`).
- [x] T009 [P] Add replay claim entries for report 29 (`98da630`, `0c92f4d`), each with its recorded pre-fix number (`tools/live/replay.mjs`)
      Evidence: `98da630`: the static parent-tree probe is 0 → delegated runtime result 0; the named teardown case must be PASS with `1 backdrop(s) and 1 sheet(s) left after the host wrapper was removed` as its pre-fix failure. `0c92f4d`: the static parent-tree probe is 0 → delegated runtime result 0; the named rebuild case records `dismissed the sheet — the press is not reaching the bar, and every gesture above is passing for that reason rather than its own`. Missing artifacts or cases return 1.
- [x] T010 [P] Add replay claim entries for reports 34-36 (`85ff504`), each with its recorded pre-fix number (`tools/live/replay.mjs`)
      Evidence: `85ff504`: the static parent-tree probe is 0 → delegated runtime result 0 across the three real sort/filter rebuild cases; the red lives in `sheet-rebuild.json`, whose pre-fix failure text is `a tap inside the panel the rebuild just created read as OUTSIDE`.
- [x] T011 [P] Add replay claim entries for phases `037`-`041`'s landings, each with its recorded pre-fix number; skip `040` until 1.4.7 ships if it has not by the time this task runs (`tools/live/replay.mjs`)
      Evidence: `tools/live/replay.mjs`. Parent-tree → current pairs, each re-measured by running this entry's own measure on `<sha>^`, are `0262386: 5 → 0`, `55bff9b: 0 → 5` (kept), `b9e2321: 1 → 10`, `a6fcd31: 2 → 0`, `57043e7: 4 → 0`, `1588576: 1 → 0`, `1d611db: 2 → 0`, `00b7bd2: 0 → 2` (kept), `cb9aedf: 1 → 0`, and `25ae3a9: 10 → 0`; `040` remains included.
- [x] T012 Confirm the replay lane reds when a required entry is deliberately removed, then restore it (`tools/live/replay.mjs`)
      Evidence: the claim-set ratchet still compares 21 entries with the published count and returns 1 when an entry is removed. The mutation set retains delegated runtime pairs `0 → 0` × 3 and static pairs `5 → 0`, `0 → 5`, `1 → 10`, `2 → 0`, `4 → 0`, `1 → 0`, `2 → 0`, `0 → 2`, `1 → 0`, `10 → 0`; runtime entries also return 1 when their artifact, named case, PASS state, or recorded pre-fix failure text is absent.
- [x] T013 [P] Remove or declare the pinned `--db-calendar-day-min-height` / `--db-calendar-month-week-min-height` formula in `runtime-vars.css`, citing `getCellMinHeight()`'s real default (`tools/screenshots/runtime-vars.css`)
      Evidence: `tools/screenshots/runtime-vars.css:57-63` now pins the product default `112px` for both variables (the renderer writes `config.calendarCellMinHeight ?? 112` clamped to 72-400 at `calendar-renderer.ts:2196-2199` and never measures the pane), replacing the `calc((100vh - 150px) / 5)` viewport formula and its stand-in comment. Removed, not declared: the harness now carries the product's real value.
- [x] T014 [P] Route `touch-targets.mjs` to the constructed renderer where the calendar/chart scenarios now cover it, or declare the remaining fixture dependency with its criterion (`tools/live/touch-targets.mjs`)
      Evidence: routed, not merely declared. `touch-targets.mjs` now runs the fixture pass unchanged and then mounts every scenario `render-assertions.mjs` knows (`render-assertion-bundle.mjs`'s shared `SCENARIOS`/`buildRenderAssertionBundle`, no mount code duplicated — `runRenderAssertions()`'s new `onMounted` hook in `render-assertion-harness.ts` fires the measurement while the container is still attached, before its own `container.remove()`). Red first, before any constructed baseline existed: the constructed pass measured **8503** under-floor controls across 12 classes on the first run. Five classes were invisible to every fixture (no `scenarios.mjs` fixture mounts them): `db-row-insert-button` (22x22, 3998), `db-gallery-card-open` (24x24, 3200), `db-timeline-mobile-menu-button` (22x22, 960), `db-board-pagination-dot` (12x12, 10), `db-calendar-week-allday-more` (67x13, 16). One is declared as a false positive: `db-board-pagination-dot` has a `::before` inset of -16px on every side (44px effective hit area, `styles.css:19696-19699`), added to `touch-targets.mjs`'s shared `DECLARED` list beside the checkbox, the identical shape. The other four are real and recorded in the new `tools/live/touch-targets-constructed-baseline.json` (`under: 8493 = 8503 - 10`, per-class breakdown and reasoning in its `note`). A CSS fix was built and verified for three of the four — `.db-row-insert-button`, `.db-gallery-card-open`, `.db-timeline-mobile-menu-button` have no compensating hit area and no coarse-pointer rule at all, so adding them to the existing `@media (pointer: coarse) { min-width: 28px; min-height: 28px }` block (`styles.css:21462-21469`, the same idiom already used for `db-list-row-open`/`db-source-rule-icon-button`) was applied under the full CSS lane protocol (acquired, edited, recaptured detached — `npm run screenshots`, 276 entries, 0 `layoutHash` moves confirming the fix touches no fixture, 13 encoder-noise PNGs opened and restored to committed bytes) and confirmed clean. It was then **reverted rather than landed**: any `styles.css` edit invalidates `sourceHashes.styles.css` on eight unrelated census/audit artefacts, and re-running them to re-stamp surfaced that two — `checkbox-appearance.mjs` (a 2.99:1 border-contrast shortfall) and `engine-parity.mjs` (Chrome/WebKit rendering differences) — fail for reasons that predate this pass, confirmed pre-existing by running both against the untouched `7e9fd27` `styles.css` and diffing: byte-for-byte identical failing output. Fixing those two is a different phase's scope (a WCAG contrast repair and a cross-engine tolerance mechanism are not touch-target or link-colour work), so `styles.css` and `tools/lane/css-lane.json` were both restored to their exact pre-dispatch committed bytes (`git show 7e9fd27:<path>`) rather than forcing this pass to either land red on `npm run gate` or silently absorb two unrelated repairs. The verified fix stays recorded in `touch-targets-constructed-baseline.json`'s `note`, ready for a future CSS-lane-holding phase to apply directly. The fourth, `db-calendar-week-allday-more` (67x13), was never a fix candidate here regardless: it sits inside the calendar's CSS-grid all-day row track shared with event-segment bars, an area this program's own history already flags as fragile, so it stays deferred pending a dedicated pass with its own capture verification. Negative control: temporarily raising the constructed baseline's `under` requirement (lowering `under` to 1000) reddened the check (`FAIL [constructed] — 7493 control(s) newly under 28px`, exit 1); restoring it passed again (exit 0). Final state: `node tools/live/touch-targets.mjs`, `$?` read directly: `0` — fixture 264 against baseline 279 (unchanged), constructed 8493 against the new baseline 8493; `styles.css` unchanged from `7e9fd27` (hash `4c7b8b627ab9`).
- [x] T014a [P] Land the CSS fix T014 built and verified but reverted, from a fresh CSS-lane hold (`styles.css`, `tools/live/touch-targets-constructed-baseline.json`)
      Evidence: red first, live: `node tools/live/touch-targets.mjs --json` before any edit reproduced the recorded per-class counts exactly (`db-row-insert-button` 3998, `db-gallery-card-open` 3200, `db-timeline-mobile-menu-button` 960, total 8493). Grepped `scenarios.mjs`/`scenarios/` for all three class names — zero hits, so no fixture screenshot can ever depict them. Lane acquired (`tools/lane/css-lane.json`); `.db-row-insert-button`, `.db-gallery-card-open`, `.db-timeline-mobile-menu-button` added to the existing coarse-pointer `min-width`/`min-height: 28px` block (`styles.css:21456-21469`), no width/height/position property changed. Full detached `npm run screenshots` (276 entries) then `SURFACE_PHASE=042-harness-fidelity-and-replay npm run lane:check`: 9 captures moved bytes, 0 moved `pixelHash`/`layoutHash` — the 9 restored to committed bytes rather than recommitted, `reviewed: []` on the release entry since nothing this release moved needed a look. `node tools/live/touch-targets.mjs` after: `$?` read directly `0` — fixture 264/279 (unchanged), constructed 335/335 (new baseline; all three classes 0 remaining). Re-ran all eight census/audit tools T014 named as invalidated by any `styles.css` edit: `cascade-audit`, `checkbox-inventory`, `design-conformance`, `surface-census`, `token-census`, `view-census` exit 0; `checkbox-appearance` and `engine-parity` still exit 1, same findings as `main` (2.99:1 border contrast; 520-vs-512 width), confirmed unchanged by direct comparison rather than fixed incidentally. `node tools/live/evidence.mjs --check-all`: 16 of 16 fresh. `npx tsc --noEmit` exit 0; `npx vitest run` exit 0 (96 files, 953 tests); `npm run lint` in this worktree and in `main` both exit 1 with the identical 172-problem count, confirming no new lint findings.
- [x] T015 [P] Route `unstyled-links.mjs` the same way (`tools/live/unstyled-links.mjs`)
      Evidence: routed the same way — fixture pass unchanged, then every `render-assertions.mjs` scenario mounted through the identical bundle/hook path, both themes toggled per scenario inside the `onMounted` callback (mount and remove happen around one synchronous call, so both-theme measurement has to run inside it). Red-first raw count: the constructed pass measures **0** links across all 17 scenarios, both themes — genuinely empty, not a bug: every `render-assertion-harness.ts` scenario builds `"text"`-type columns only (`LIST_COLUMNS`/`TABLE_COLUMNS`/`BOARD_COLUMNS`/etc., all `makeXColumns(n, "text")`), so no relation- or file-type field is ever constructed and `.internal-link`/`a[href]` markup — built by `relation-value-renderer.ts`, `file-field-renderer.ts`, `inline-markdown-renderer.ts`, `cell-renderer.ts`, none of it needing a live `App` to build the DOM — never appears regardless of this pass's own fix. Per D6 ("a pass on an empty set proves nothing"), the check says so itself: `unstyled-links.mjs` prints an explicit empty-sample caveat rather than reporting a silent PASS for the constructed link-colour surface. `node tools/live/unstyled-links.mjs`, `$?` read directly: `0` — fixture 112 links / 70 scenarios (unchanged, zero-tolerance), constructed 0 links / 17 scenarios with the caveat printed.
- [x] T016 [P] Declare or add Obsidian's `.mod-cta` rule to `theme.css` (`tools/screenshots/theme.css`)
      Evidence: `tools/screenshots/theme.css:309-318` declares `button.mod-cta { background-color: var(--interactive-accent); --text-color: var(--text-on-accent); }`, transcribed from the installed application stylesheet of Obsidian 1.13.4 (`/Applications/Obsidian.app/Contents/Resources/obsidian.asar`, `app.css` `button.mod-cta` — the 1.13.4 bundle on this machine; the hover and mobile-tap arms are omitted because a capture has no pointer, mirroring the `mod-warning` precedent). Blast radius: two fixture sources carry `mod-cta` (`tools/screenshots/scenarios/core.mjs` empty-state, `tools/screenshots/scenarios/temporal.mjs` calendar-empty-state); their captures photograph the accent fill after recapture.
- [x] T017 Correct `check-lane.mjs`'s `changedCaptures()` to compare by content/layout hash or a declared tolerance instead of raw git byte-diff (`tools/lane/check-lane.mjs`)
      Evidence: added `tools/screenshots/pixel-hash.mjs` (`decodePng`/`pixelHash` — a coarse, quantised hash of the decoded pixels, tolerant to encoder/antialiasing jitter); `capture.mjs` now records it per manifest entry as `pixelHash` beside the existing `layoutHash`, `bytes` kept for information. `check-lane.mjs` gained `isContentChange`/`contentChangedCaptures`, comparing the working-tree manifest against `git show HEAD:screenshots/manifest.json`; `changedCaptures()` itself is unchanged and still pure. Red first: `tools/screenshots/pixel-hash.test.mjs` against a naive `sha256(bytes)` stand-in for `pixelHash` — **3 of 4 assertions failed** (two byte-different encodings of identical pixels hashed differently; a non-PNG buffer returned a hash instead of null); reverted to the real implementation, all 4 passed. `check-lane.test.mjs` gained 8 cases for `isContentChange`/`contentChangedCaptures`, including the bootstrap case (previous manifest has no `pixelHash`, must compare `layoutHash`-to-`layoutHash` rather than `pixelHash`-to-`layoutHash` — caught by a live dry-run below before the test was written, then covered).
- [x] T018 A/B the manifest-compare fix against a clean HEAD clone; confirm it still catches a deliberately mutated capture (repo, per parent D12)
      Evidence: two full detached `npm run screenshots` runs on this worktree (branched clean off `main`), pgrep-clear of stray Chrome, PID-waited. Round 1: 276 captured, 15 PNGs moved bytes against the committed tree (`git status`, a different file set than round 2's 11 — the harness's own non-determinism, reproduced live). Round 2: 276 captured, 11 moved. Round 1 vs round 2 by the new measure: **0 of 276 `pixelHash` changed, 0 of 276 `layoutHash` changed** — the recorded pre-fix number `npm run gate`'s earlier leg measured for this same fact. By contrast, 9 of 276 entries' recorded `bytes` moved between the two rounds (deltas -435..+365, matching the documented 2-560 byte range) with zero pixel movement. Decoding the committed (`HEAD`) bytes of all 11 round-2 movers and hashing them confirmed every one pixel-identical to the fresh capture, so the 11 were restored (`git checkout --`) rather than committed — recording noise as a review of nothing, per the `020`/`042` precedent. Live `check-lane.mjs` before the restore: `FAIL — 12 changed capture(s) this release does not name` (the byte-only comparator); after wiring `contentChangedCaptures()`: `release names all 0 changed capture(s)`, exit 0. Deliberate-mutation control, steady state (both manifests carrying `pixelHash`, the shape every future commit will have): one entry's `pixelHash` overwritten — `contentChangedCaptures()` reported exactly that one path changed and zero others, confirming the fix still catches a real repaint.
- [x] T024 [P] Add replay claim entries for the six open-row fixes landed on `main` after `037`-`041` shipped (`7e36671`, `535373a`, `a251a43`, `3f143df`, `fa58c7f`, `b29bf7f`), each with its recorded pre-fix number (`tools/live/replay.mjs`)
      Evidence: each entry's own measure was re-run on `<sha>^`, extracted via `git archive` into a scratch directory (never `git checkout` against a shared work-tree, which would have dirtied the index). Pre-fix -> recorded pairs: `7e36671: 0 -> 2` (the empty-column and drop-language scenarios did not exist, so `SCENARIOS.find` returned undefined for both); `535373a: 0 -> 2` (neither host binding's board `moveRowToPosition` callback carried a `subtaskMove` parameter); `a251a43: 0 -> 1` (`.db-surface` appeared in no reduced-motion rule); `3f143df: 0 -> 1` (`.db-surface` was still joined into the same rule as `.note-database-container`, not its own). `fa58c7f: 0 -> 4` (none of `getTimelineTitleWindow`'s third parameter, the first-tick `transform: "none"` branch, `resolveTimelineMilestoneLabelPlacement`, or `TIMELINE_DAY_PHONE_UNIT_WIDTH_PX`'s 32px branch existed in source); `b29bf7f: 0 -> 2` (no `.is-label-above` rule and `row-gap` still read the flat 4px, not `var(--db-space-8)`). One correction to the dispatch brief that named this task: the brief's prose swapped `3f143df` and `a251a43`'s descriptions — `git show` on both commits and the parent `goal.md` log (`005-component-surface-system/goal.md`, "`041`'s last open row closed" entry) confirm `a251a43` is the selector-list join and `3f143df` is the one that splits `.db-surface` into its own zero-duration rule; the claims above are written against the verified commit content, not the swapped prose. `node tools/live/replay.mjs`: 27 claims, `reversed: 0`, exit 0. Mutation control: `recorded` moved by one on the `535373a` entry, re-run reported `replay: FAIL — 1 result(s) reversed`, restored and re-verified green.
- [x] T025 [P] Add a replay claim for `7ca6cc2`, `037`'s fourth and last open row (the day-scale fixture centring on the pinned now and its `HH` tick-label suffix), with its recorded pre-fix number (`tools/live/replay.mjs`)
      Evidence: `7ca6cc2` exported `timelineTicksFor` and added a `now` parameter to `timelineViewportWindow` so `temporal.mjs`'s day-scale fixture centres on the pinned "now" and labels each tick the bare zero-padded hour `buildTimelineTicks()`'s own day branch emits, not the fixture-only `"HH:00"` string. The new claim measures both device widths (`{ id: "desktop", width: 1440 }`, `{ id: "mobile", width: 402 }`) via the exported helpers: `SCENARIOS.find(id === "timeline-view-day").html(device)` loaded into the page, counting `.db-timeline-tick-date` elements whose text matches `/^\d\d$/`, plus `timelineDynamicFixture("day", device).startMinutes` summed across both widths. Pre-fix -> recorded: `7ca6cc2: 0 -> 574` (34 tick labels + 540 startMinutes, split desktop 23 ticks/startMinutes 60, mobile 11 ticks/startMinutes 480). The pre-fix number was measured on `7ca6cc2^`, extracted with `git archive 7ca6cc2^ -- styles.css tools/screenshots | tar -x` into a scratch directory (never `git checkout` against a shared work-tree), then run against a real launched Chrome per `measure-prefix.mjs`'s method: both device widths returned 0 matching labels (every tick still read `"HH:00"`) and `startMinutes` 0 (neither width was centred), confirming the measure returns a different value on the fix commit's parent tree — not equal to the recorded number. `node tools/live/replay.mjs`: 28 claims, `reversed: 0`, exit 0, all `held: true`. Mutation control: this entry's `recorded` moved from `574` to `999`, re-run reported `replay: FAIL — 1 result(s) reversed since the phase that measured them` with `037-timeline-gantt-port measured 999 and now gets 574`, exit code read directly as `1`; restored to `574` and re-verified `replay: PASS — all 28 results still hold`, exit `0`.
<!-- /ANCHOR:phase-2 -->

---

### Two-pass provability record (touch-targets, unstyled-links)

Both lanes now run two passes and record every row with a `source` field (`fixture` or
`constructed`). The fixture pass reads hand-written markup (`scenarios.mjs` `html()`) against
`styles.css` plus the harness stand-ins; the constructed pass mounts every scenario
`render-assertions.mjs` knows through the identical bundle and `runRenderAssertions()` mount path
(`render-assertion-bundle.mjs`, `render-assertion-harness.ts`'s `onMounted` hook — no mount code
duplicated), so it measures the same DOM the render-assertion lane already asserts structural facts
about. Recorded here is exactly what each pass can and cannot prove, so the row-6 dependency-class
finding is closed for the classes both passes can see, and what remains open is bounded and named:

**`tools/live/touch-targets.mjs`, fixture pass** can prove: for every scenario fixture at phone
width under a coarse pointer, each interactive element's bounding box clears the 28px floor; the
coarse-pointer premise holds on every measured page; and the count of sub-floor controls does not
grow past the recorded baseline (`touch-targets-baseline.json`). It cannot prove anything about a
control the renderer builds that no fixture mirrors — that gap is what the constructed pass below
closes for the seven renderer types (`list`, `table`, `board`, `gallery`, `calendar`, `timeline`,
`chart`) and seventeen scenarios `render-assertions.mjs` covers.

**`tools/live/touch-targets.mjs`, constructed pass** proves the same 28px-floor claim against real
`src/views` renderer output for those seven types and seventeen scenarios, with its own recorded
ratchet (`touch-targets-constructed-baseline.json`, `under: 8493`, four real classes: three with a
verified-but-not-landed CSS fix recorded in the baseline's `note`, one — `db-calendar-week-allday-more`
— deferred pending a dedicated capture-verified pass; see T014's evidence for why the fix was
reverted). It still cannot prove: (1) anything about the 15 of 22 renderer files no
`render-assertions.mjs` scenario constructs yet — that is `render-assertions.mjs`'s own coverage
ratchet's gap, not this lane's; (2) hit area — a bounding box is not a hit area, same as the fixture
pass; (3) any device behaviour — no device is involved, same as the fixture pass; (4) anything about
a field value the harness's bench data never populates — every scenario's columns are the bench's
own shape (21 or 16 uniform columns), not every field type or configuration a real database can
carry.

**`tools/live/unstyled-links.mjs`, fixture pass** can prove: no link in any fixture resolves to a
user-agent default colour in either theme, and the harness's link tokens resolve. It cannot prove
anything about a link the real renderers build that no fixture mirrors — the same gap the
constructed pass exists to close.

**`tools/live/unstyled-links.mjs`, constructed pass** measures every scenario `render-assertions.mjs`
knows, in both themes, against the same zero-tolerance rule. It found **zero** links across all
seventeen scenarios — a genuine, structural empty sample, not a bug: every
`render-assertion-harness.ts` scenario builds `"text"`-type columns only, so no relation- or
file-type field is ever constructed, and `.internal-link`/`a[href]` markup (built by
`relation-value-renderer.ts`, `file-field-renderer.ts`, `inline-markdown-renderer.ts`,
`cell-renderer.ts` — none of it needing a live `App` to build the DOM, only the harness's bench
column shape) never appears regardless of what this lane fixes. Per D6, the check prints this
caveat itself rather than reporting a silent pass. Neither pass can prove: (1) that a colour the
harness supplies equals the colour the host supplies — both catch silence, not disagreement, which
is the pinned-values scan's half of the pair; (2) anything about a relation/file-type field's link
colour, until `render-assertion-harness.ts`'s own scenario columns carry one — an extension to that
harness's scenario shape, out of this row's scope.

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T019 `SURFACE_PHASE=042-harness-fidelity-and-replay npm run gate`, `$?` read directly, no stray Chrome process before the run (`pgrep` empty)
      Evidence: `pgrep -fl "Google Chrome"` was cleared before the run; `npm run gate`, `$?` read directly: `0`, 25 green / 0 red. Re-run a second time with the same clean-`pgrep` precondition for this task's own evidence: `0`, unchanged.
- [x] T020 `npm run replay`, `$?` read directly, confirm the new claim count and every `held: true`
      Evidence: `node tools/live/replay.mjs`, `$?` read directly: `0`, "replay: PASS — all 27 results still hold", `reversed: 0`. Was 21 claims before this pass.
- [ ] T021 External lane per D14: devin initial pass, then codex/luna, then in-runtime verification with Chrome
- [x] T022 Update `goal.md`'s completion criteria with the observed red/green pair for each ticked row
      Evidence: `goal.md`'s replay completion-criterion row (§3) updated with the six new pre-fix -> recorded pairs; scoped to the row this task covers, not the four unrelated rows the manifest-compare and external-lane tasks own.
- [x] T023 Backfill graph metadata, run `validate.sh --strict` on this child, `build-operator-checklist`, `scan-failing-values`
      Evidence: `backfill-graph-metadata.ts 042-harness-fidelity-and-replay` run; `validate.sh --strict` first `RESULT:` line `PASSED`; `build-operator-checklist` regenerated; `scan-failing-values.mjs` exit 0.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] `npm run gate` exits 0
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Durable Directive**: See `goal.md`
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

- [x] CHK-001 [P0] Requirements documented in spec.md
- [x] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available (T001-T003 confirm before implementation starts)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns (mirrors `026`'s scenario/bag structure)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] `npm run gate` and `npm run replay` both exit 0
- [ ] CHK-022 [P1] Every new negative control observed red before its fix
- [ ] CHK-023 [P1] Manifest-compare fix A/B'd against a clean HEAD clone
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each row-6 dependency has a finding class: removed (`class-of-bug`) or declared (`instance-only`, bounded).
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed for the two fixture-reading lanes (`touch-targets.mjs`, `unstyled-links.mjs`).
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for `changedCaptures()` — every caller of `check-lane.mjs`'s comparison logic.
- [ ] CHK-FIX-004 [P0] N/A — no security/path/parser/redaction surface in this phase's scope.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count listed before completion is claimed (per-scenario red/green pairs).
- [ ] CHK-FIX-006 [P1] N/A — no process-wide global state read by these checks.
- [ ] CHK-FIX-007 [P1] Every replay-entry evidence pinned to its exact fix SHA, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] N/A — no secrets, auth or authz surface in this phase's scope.
- [ ] CHK-031 [P0] N/A
- [ ] CHK-032 [P1] N/A
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/goal synchronized
- [ ] CHK-041 [P1] Code comments carry durable WHY only, no spec paths or phase labels
- [ ] CHK-042 [P2] N/A — no README surface in scope
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 10 | 0/10 |
| P1 Items | 8 | 0/8 |
| P2 Items | 2 | 0/2 |

**Verification Date**: Not started
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] N/A unless an ADR is opened (see `plan.md` §"Architecture Decision Record")
- [ ] CHK-101 [P1] N/A
- [ ] CHK-102 [P1] N/A
- [ ] CHK-103 [P2] N/A
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] N/A — no NFR-P performance target in this phase's scope
- [ ] CHK-111 [P1] N/A
- [ ] CHK-112 [P2] N/A
- [ ] CHK-113 [P2] N/A
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented (`plan.md` §7)
- [ ] CHK-121 [P0] N/A — no feature flag
- [ ] CHK-122 [P1] N/A — no runtime monitoring surface
- [ ] CHK-123 [P1] N/A
- [ ] CHK-124 [P2] N/A
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] N/A
- [ ] CHK-131 [P1] N/A
- [ ] CHK-132 [P2] N/A
- [ ] CHK-133 [P2] N/A
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] N/A — no external API
- [ ] CHK-142 [P2] N/A — no user-facing documentation
- [ ] CHK-143 [P2] N/A
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Owner | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
