---
title: "Implementation Summary [template:level-2/implementation-summary.md]"
description: "Open with a hook: what changed and why it matters. One paragraph, impact first."
trigger_phrases:
  - "implementation"
  - "summary"
  - "template"
  - "impl summary core"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/037-timeline-gantt-port"
    last_updated_at: "2026-09-04T12:08:25Z"
    last_updated_by: "gantt-rebase-landing"
    recent_action: "Rebased onto main board fixes; reconciled css-lane/touch-targets/evidence; gate 25/25 green"
    next_safe_action: "Close T003/T009/T013/T014 and the CHK-* checklist rows"
    blockers:
      - "Not operator-confirmed: the gantt has not been checked on iOS"
      - "T003, T009, T013, T014 and the CHK-* checklist rows in tasks.md predate the 1:1 amendment and remain open — out of scope for the CSS-leg dispatch that closed T021/T022"
    key_files:
      - "src/views/calendar-timeline-renderer.ts"
      - "src/data/calendar-timeline-model.ts"
      - "src/data/calendar-interaction-model.ts"
      - "styles.css"
      - "tools/screenshots/scenarios/temporal.mjs"
      - "tools/live/replay.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "037-timeline-gantt-port"
      parent_session_id: null
    completion_pct: 55
    open_questions: []
    answered_questions:
      - "The dependency-link seam persists as an optional persistence action off the local action contract (calendar-timeline-renderer.ts:173), not note frontmatter"
      - "Weekend fill is day-scale-only by the reference's own design (GanttRenderer.ts:43, GanttHeaderRenderer.ts:62), not a four-scale requirement — confirmed against the vendored reference source, not assumed"
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
| **Spec Folder** | 037-timeline-gantt-port |
| **Completed** | 2026-09-02 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The timeline/Gantt surface was ported near one-to-one from `obsidian-pm-main` into
`calendar-timeline-renderer.ts` across two commits. All 17 module-map rows in `spec.md` §3 were rewritten
(never copied) and verified matching, and the new cycle-safe dependency-link seam — no local dependency
renderer existed before this packet — rejects same-side, duplicate, missing-task, and cycle links.

### Timeline/Gantt Port

`0262386` (range geometry + link seam): `buildTimelineRangeGeometry` ports the reference's padded/min-spanned
range (padding -7/+14 days, per-scale minimum span); `resolveTimelineLinkChange` plus
`wouldCreateTimelineDependencyCycle` reject the four link cases, red-first (12 of 12 seam tests red,
`TypeError: resolveTimelineLinkChange is not a function`, before the seam existed).

`55bff9b` (scales, header/grid, milestone, progress, link affordance): five scales with header, grid, weekend
and today fills; bars, milestone diamond, progress fill, and the link affordance with keyboard and touch
equivalents. Two product bugs were fixed on the way: every hour column was painted `is-today` at day scale
(now only the current hour column, unit test red 24 of 24 before); the year was printed twice in the
year-scale title (now once, parity test).

Kept local, unchanged: visible-window rendering, unscheduled backlog (with the declared due-only exclusion),
invalid-event repair, group/lane limits, touch menu, and keyboard nav.

Eleven defects were found during the ninth and final verification round and were NOT fixed in this leg —
they are recorded as open rows in `goal.md` §3 and `spec.md` §1: a header/axis mismatch at quarter and year
scale, a zero-width mount fallback, invalid `span[role=button]` nesting, overlapping link dots at year/quarter,
low-contrast progress-fill meta, a milestone label overpainted by the next bar, a clipped leading axis label on
mobile, a near-unusable day scale and unreadable year scale at phone width, a capture-harness padding note, and
the pre-existing duplicated `.db-timeline-event.is-all-day` CSS block.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/calendar-timeline-renderer.ts` | Modified | Rewrote controls/header/grid/bars/drag/link affordance per `spec.md` §3 |
| `src/data/calendar-timeline-model.ts` | Modified | Extended `buildTimelineModel` with reference padding/min-span semantics; due-only/milestone metadata |
| `src/data/calendar-interaction-model.ts` | Modified | Added `resolveTimelineLinkChange` / `wouldCreateTimelineDependencyCycle` |
| `styles.css` | Modified | Reconciled `db-timeline-*` rules against the reference's visual hierarchy under the `css-lane` protocol; leg c added the `.is-label-above` milestone rules and moved `.db-timeline-events` `row-gap` to `var(--db-space-8)` |
| `src/data/calendar-title-formatter.ts` | Modified | Leg a: the title follows the rendered window, and spans years when the window crosses one |
| `tools/screenshots/scenarios/temporal.mjs` | Modified | Leg c: the timeline fixture takes its title, first-tick anchor, day column width and milestone placement from the viewport window instead of frozen constants. Leg d: the day branch's viewport window centres on a pinned `now` and its tick labels match `buildTimelineTicks`'s bare `"HH"` format |
| `tools/screenshots/scenarios/temporal-tick-parity.test.mjs` | Modified | Leg c: binds each new fixture mirror to the real model export it mirrors. Leg d: adds day-scale window- and tick-label-parity assertions against a pinned `now`, and corrects a downstream test assumption the centring made stale |
| `tools/screenshots/scenarios/shared.test.mjs` | Modified | Leg e (T021, 1:1 amendment): subtask/dependency contract assertions moved from the retired `db-subtask-event`/`has-subtask-children`/`db-timeline-subtask-progress` classes to the default render's `pm-gantt-bar-group`/`pm-gantt-bar`/`pm-gantt-bar-progress`/`pm-gantt-drag-handle`/`pm-gantt-link-dot` |
| `tools/screenshots/theme.css` | Modified | Leg e: stood `--color-red` in (TRANSCRIBED from the installed Obsidian 1.13.4 `app.css`), fixing the today-line/today-diamond's UNSUPPLIED-token black paint |
| `tools/live/replay.mjs` | Modified | Leg e: reselectored 3 stale `db-timeline-*` claims to the current `pm-gantt-*` vocabulary and reworded 1 (weekend-fill scope) to the reference's own day-only invariant; no recorded number changed except the reworded claim's text. Leg f: merged with main's own board-claim rewrite of the same two subtask-tree checks (board's `[data-subtask-depth]`, timeline's `padding-left`), no number changed |
| `tools/live/touch-targets-constructed-baseline.json` | Modified | Leg e: ratchet lowered 9974 → 320 with a `lowerHistory` entry after the coarse-pointer hit-area rule closed the shortfall the TypeScript leg's raise had documented. Leg f: re-measured on the merged tree to 367 (kept both this leg's and main's state-variant derivation in a new `mergeReconciliation` entry) |
| `tools/lane/css-lane.json` | Modified | Leg e: release entry naming the 30 captures the CSS/theme edits moved, `baselineHash` advanced to the new `styles.css` hash. Leg f: merged with main's own history, `baselineHash` recomputed on the merged stylesheet, new release entry names the 4 captures a post-rebase recapture found content-changed. Leg h: merged again against main's board-closing-fixes history (207 entries plus this branch's own 2 unique `037` entries), `baselineHash` recomputed on the newly merged stylesheet (`bd780d064dd4`), new release entry names the recapture that found zero real content-changed captures |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Nine fresh in-runtime verification rounds ran against this packet; the code held from round three onward,
and every later rejection traced to fixture fidelity (clamped events, shared lanes, tick tables, day window,
raw width, unit widths) rather than a code regression. The screenshot pipeline cannot mount the production
renderer (`tools/screenshots/capture.mjs` accepts only static HTML), so a fixture mirrors the renderer's
viewport-window mode, content width, and unit widths, backed by parity tests
(`temporal-tick-parity.test.mjs`) that import the fixture helpers directly. 20 timeline captures were read
across all five scales, both devices, both themes. The `css-lane` was acquired before the `styles.css` edit
and released naming all 21 changed captures. `npm run gate` was observed PASS at 25 green twice — once with
`SURFACE_PHASE=037-timeline-gantt-port` (lane held) and once plain (lane released) — by fresh in-runtime
agents, and `validate.sh --strict` returned first `RESULT: PASSED`. This shipped in release 1.4.4. Leg d
(2026-09-04) closed the day-scale row's last fixture-fidelity gap on a dedicated worktree branch: the
screenshot fixture now centres its day-scale viewport window on the pinned "now" through the same clamp
math `resolveTimelineDayCentredStartMinutes` uses, and its tick labels match `buildTimelineTicks`'s bare
`"HH"` format. `temporal-tick-parity.test.mjs` gained window- and tick-label-parity assertions per device
width, observed red first (4 of 118 failed), green after the fixture fix (118/118); all four day-scale
captures were read in both themes, and the twelve other captures the recapture moved were verified as the
toolchain's known encoder noise before being named in the same `css-lane.json` release. Leg e (2026-09-04,
T021/T022, 1:1 amendment) verified and completed a `cli-codex` CSS leg that had landed uncommitted: read
the reference `gantt.css` alongside every `pm-gantt-*` class the renderer emits, closed two class-coverage
gaps, and restored (rather than left missing) the ~1266 lines the still-live gated `renderTimelineLocal`
extensions path needs, since that renderer's own markup was untouched by this leg and its stylesheet had
been deleted wholesale. Found and fixed one missing harness token (`--color-red`, TRANSCRIBED from the
installed Obsidian app) while reading the recaptured screenshots — the today marker had been painting
black instead of red in every capture. Measured, not asserted, the touch-target improvement: the coarse-
pointer hit-area rule dropped the constructed ratchet from 9974 to exactly 367 minus the three retired
local-nav classes, confirming it closed the whole shortfall the port had introduced and nothing else
moved. Reconciled four `tools/live/replay.mjs` claims a fixture-vocabulary rewrite (this same leg's
inheritance) had made stale, tracing each to its actual cause against the reference source rather than
re-recording the numbers.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Drop the reference's eager-SVG-height rendering (`GanttView.ts:185-190`) | Conflicts with local virtualization; visible-window rendering and lane limits are a local strength the reference lacks (D2, `research/research.md:375`) |
| Touch-targets baseline raised 215 -> 279 accepted without a new exemption | A/B against a clean HEAD showed the 64 extra are five pre-existing 20px timeline classes now measured across four new scale scenarios, not a new class; the link dot is a real 28x28 element |
| Eleven round-nine defects recorded as open rather than fixed in this leg | The landing round's own scope was the six-item closure gate (module map, link seam, keep-local behaviours, css-lane, gate, validate); newly found defects are tracked in `goal.md` §3 rather than silently expanding this leg's scope |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Unit tests (`npx vitest run`) | PASS — 89 files / 913 tests green after leg c, exit 0 (78 files / 682 at landing; 908 before rebasing onto `7e36671`, whose board leg adds 5) |
| Typecheck / lint / comments after leg c | `npx tsc --noEmit` exit 0; `npm run lint` 169 problems, exactly the recorded baseline; `scan-comments` exit 0 |
| Fixture-mirror mutation checks (leg c) | Forcing `timelineMilestoneLabelPlacement` to `"inline"` — red, 5 failed; mutating the title mirror's same-month branch — red, 1 failed. Both restored, `shasum -a 256` identical to the pre-mutation file |
| `css-lane` (leg c) | Acquired at `32148b7b7646`, released at `4f74f3bd0b1c` naming all 27 changed captures; `check-lane` exit 0 both held (`SURFACE_PHASE=037-timeline-gantt-port`) and plain |
| `touch-targets` after leg c | `under = 264` against the recorded 279 baseline, unchanged from the pre-edit tree — no interactive box shrank |
| Dependency-link seam red-first | Red: 12 of 12, `TypeError: resolveTimelineLinkChange is not a function`; green after `calendar-interaction-model.ts:270` landed |
| Hour-column `is-today` fix | Red: 24 of 24 (`calendar-timeline-hour-column.test.ts`); green after `55bff9b` |
| `npm run gate` | PASS — 25 green, 0 red, observed twice by fresh in-runtime agents (lane held and released) |
| `validate.sh --strict` | First `RESULT: PASSED` |
| Screenshot capture (20 timeline images, five scales x two devices x two themes) | Read, matching renderer's ticks/bars/milestone/progress; day-scale `is-today` column lands on the current hour only |
| Recapture and read after leg c (27 changed PNGs) | All opened and read against their `HEAD` copies. Three of the four open rows are now photographed: quarter titles "February — May 2026" and year "2025 — 2026" over their own axes; "Tue 24" and "00:00" whole at the mobile viewport edge; "Adobe CC Mar 25" above its bar on all 16 week/month/quarter/year captures where `HEAD` read "A N". The day row is half photographed — eleven 32px columns against `HEAD`'s five of 60px, but today out of frame |
| `npm run gate` after leg c | PASS — 25 green, exit 0, run twice (`SURFACE_PHASE=037-timeline-gantt-port` and plain) |
| Day-scale fixture parity (leg d), red-first | Red: 4 of 118 failed in `temporal-tick-parity.test.mjs` (`startMinutes` 0 vs 60 at 1440px / 0 vs 480 at 402px; tick labels `"HH:00"` vs `"HH"` at both widths), before `timelineViewportWindow` took a `now` argument. Green after: 118/118 |
| Typecheck / full suite / tools lint / comments after leg d | `npx tsc --noEmit` exit 0; `npm test` 93 files/929 tests green; `npm run lint:tools` exit 0; `scan-comments` exit 0; `npm run lint` (src) unchanged at 172 problems, confirmed by `git diff --stat main -- src/` reporting no `src/` changes on this leg's branch |
| `css-lane` (leg d) | `styles.css` untouched, `baselineHash` unchanged at `4c7b8b627ab9`; `check-lane` exit 0, release names all 16 recaptured PNGs (4 real day-scale captures, 12 verified toolchain encoder noise) |
| Screenshot capture (leg d), 4 day-scale timeline images read | `timeline-view-day-desktop-{light,dark}.png` show 23 hourly columns "01"–"23"; `timeline-view-day-mobile-{light,dark}.png` show 11 columns "08"–"18"; all four show the 13:00 tick highlighted and the now-line/today band at 13:45 in frame, with plain zero-padded labels and no `:00` collision |
| `npm run gate` after leg d | PASS — 25 green, exit 0 |
| Post-rebase reconciliation (leg h, onto main's board closing fixes — kanban height chain, due-tier, badge-icon fidelity, `2cddc7c`/`d896f90`) | `styles.css` auto-merged clean (no conflict); every changed line traced to `pm-gantt-*`/`pm-hidden`/`pm-no-shrink`/`pm-resize-active`/`pm-glyph`/scrollbar scope, none touching the board's kanban block; merged hash `bd780d064dd4`. `tools/live/*.json` (16 evidence stamps) taken from main, `screenshots/manifest.json` merged per-entry by scenario id (`timeline`/`constructed-timeline`/`timeline-toolbar` from the branch, else main), `tools/lane/css-lane.json` merged (main's 207-entry history plus this branch's own 2 unique `037` entries appended, `baselineHash` recomputed on the merged stylesheet). Full recapture (`npm run screenshots`, 356 entries) found zero real content-changed captures: two flaky reruns (`constructed-gallery-desktop-dark`, `timeline-subtask-tree-desktop-light`) reproduced their prior committed `pixelHash` exactly on an isolated single-scenario recapture; the established `field-icon-picker-desktop-{dark,light}` drift and 26 further byte-only re-encode-noise captures were restored to committed `HEAD` bytes, manifest entries reset to `HEAD`'s bytes/`pixelHash`/`layoutHash` with `sourceHashes` left at their current post-merge values. Two `constructed-board` and four `constructed-timeline` captures (both themes/devices) opened and read: board columns fill full height with no icon glyph before any column label; gantt shows bars with progress fill, milestone diamond, dashed dependency arrows and the today line, fully styled. `touch-targets.mjs` re-measured 362 under the 28px floor in the constructed pass against the recorded 367 baseline (0 new; this harness's own run-to-run count varies 362-367, both within baseline). 8 evidence artefacts (`cascade-audit`, `checkbox-appearance`, `checkbox-inventory`, `design-conformance`, `engine-parity`, `surface-census`, `token-census`, `view-census`) re-stamped fresh against the new hash, each re-ran green or held its pre-existing baseline. `npx tsc --noEmit` exit 0; `npx vitest run` 1006/1006; `npm run lint` 172 (unchanged); `node tools/naming/scan-comments.mjs` PASS; `npm run gate` 25/25 green |
| Class-coverage sweep (leg e, T021) | Every `pm-gantt-*` class the renderer emits (`calendar-timeline-renderer.ts` `createDiv`/`createEl`/`ganttSvgElement` calls) checked against `styles.css`; two misses found and closed — `.pm-gantt-bar-icon` (from the reference's `widgets.css`) and the three `.pm-gantt-label-row--dragging`/`--drop-before`/`--drop-after` states (from `utilities.css`) |
| `gantt.css` copy fidelity (leg e) | `diff -u specs/context/obsidian-pm-main/src/styles/gantt.css <(sed -n '17205,17480p' styles.css)` — zero output, byte-for-byte |
| Extension-path restore (leg e) | `renderTimelineLocal` (gated, default off) still emits `db-timeline-*` markup; the ~1266 lines a prior pass deleted were restored verbatim (`diff` against the pre-leg commit, zero output) rather than left missing, which would have silently broken that still-live path |
| `pinned-values` (leg e) | `--color-red` UNSUPPLIED hard-fail — `.pm-gantt-today-line`/`-diamond` read it with no fallback and the harness supplied nothing, painting the "now" marker black. Stood the token in at `tools/screenshots/theme.css`, TRANSCRIBED from the installed Obsidian 1.13.4 `app.css` (`/Applications/Obsidian.app/Contents/Resources/obsidian.asar`), cross-checked against the file's existing `--color-orange`/`--color-green` transcriptions. `node tools/screenshots/scan-pinned-values.mjs` PASS |
| `touch-targets` ratchet lower (leg e) | Constructed pass 9974 → 320 after the coarse-pointer hit-area rule landed (`tools/live/touch-targets-constructed-baseline.json` `lowerHistory`) — 320 is exactly the pre-port baseline (367) minus the three retired local-nav classes the TypeScript leg's own raise already accounted for |
| Recapture and review (leg e) | 24 timeline/subtask-tree captures plus the 4 `constructed-timeline-*` (superseding T020's pre-CSS review) read across all 5 scales, both devices, both themes; 2 more (`field-icon-picker-desktop-{dark,light}`) moved pixel content unrelated to any `pm-gantt-*`/`db-timeline-*` selector (deterministic capture-environment drift, reproduced identically across two runs), shipped as captured and named in the release rather than hand-reverted |
| `css-lane` (leg e) | `baselineHash` moved `c32661e8c089` → `20d8ee6827be`; release names all 30 changed captures; `check-lane` exit 0 |
| `replay` reconciliation (leg e) | 4 claims the pre-fixture-rewrite `db-timeline-*` vocabulary made stale — 2 reselectored to `.pm-gantt-*` and reproduced their original recorded numbers exactly (0; 574); 2 (subtask-tree depth marker) updated to test the correct per-surface marker (board's `[data-subtask-depth]` vs. timeline's `padding-left` indentation) since the default `pm-gantt` label row never carried that attribute; 1 (weekend-fill scope) reworded to the reference's actual, verified invariant (`GanttRenderer.ts:43`) after confirming the fixture's pinned date (2026-03-25, a Wednesday) makes the old wording unsatisfiable under any faithful implementation. `node tools/live/replay.mjs`: PASS, all 28 claims hold |
| Full re-verification (leg e) | `npx tsc --noEmit` exit 0; `npx vitest run` 964/964; `npm run lint` 172 (unchanged from HEAD baseline); `npm run lint:tools` exit 0 (fixed two pre-existing dead-parameter errors in `temporal.mjs`); `scan-comments` PASS; `SURFACE_PHASE=037-timeline-gantt-port npm run gate` 25/25 green |
| Post-rebase reconciliation (leg f, onto main's one-to-one board port and its ten constructed state variants, `f5983a4`, merge-base `65238ad`) | `styles.css` gained a new merged hash (`d3c6cc3e8453`) — the gantt.css and kanban.css copies sit in disjoint MIT-notice blocks, both kept verbatim. `touch-targets.mjs`: `[constructed] under = 367` against a freshly-recorded 367 baseline, not leg e's own 320 — the state-variant leg's 55-control raise and leg e's 47-control retirement of the local timeline-nav classes wash back to the shared pre-either-leg base of 367 (per-class math in `touch-targets-constructed-baseline.json`'s new `mergeReconciliation` entry, which keeps both derivations rather than discarding either). `css-lane.json`: history merged, `baselineHash` recomputed on the merged stylesheet, new release entry names 4 `constructed-timeline-subtask-*` captures a fresh recapture found content-changed (all read, matching the reference); one further capture moved bytes only (encoder noise, restored to `HEAD`). `npx tsc --noEmit` exit 0; `npx vitest run` 984/984; `npm run lint` 172 (unchanged); `scan-comments` PASS; `SURFACE_PHASE=037-timeline-gantt-port npm run gate` 25/25 green |
| Fidelity-gap claim verification (leg g, T023-T030, an external `cli-devin` leg left uncommitted) | Re-verified against `75eaa34` rather than trusted: `npx tsc --noEmit` exit 0; `npx vitest run` 988/988; `npm run lint` 172 problems — confirmed unchanged against the same count on `75eaa34` in a temp worktree (`lint 172=172`, not a pre-existing-vs-introduced guess); `npm run lint:tools` exit 0; `scan-comments` PASS. Each claimed fix read line-by-line against the reference (`GanttLinkHandler.ts:56-59` same-side rejection, `GanttView.ts:197-219` Escape/keydown gating and `:139-161` wheel-on-left-panel, `GanttDragHandler.ts:121-127` per-edge patch shape, `GanttView.ts:326-331` setAllCollapsed's mutate-once/persist-once/render-once shape, `IconButton.ts`/`ExtraButtonComponent`'s div.clickable-icon.extra-setting-button shape, `GanttTaskBarRenderer.ts:278,313` due-then-start milestone anchor, `TimelineConfig.ts:11-16` DAY_WIDTH, `GanttHeaderRenderer.ts:48-75`/`GanttRenderer.ts:30-70` unpadded day-of-month label and Monday grid boundary) — all confirmed matching, no corrections needed to T023-T030's own claims |
| `setSubtaskCollapsedMany` seam (T031), red-first | Red: `database-view.test.ts` and `embedded-database-renderer.test.ts` both — "setSubtaskCollapsedMany writes every row in one mutation and renders once, unlike N toggleSubtaskCollapsed calls" — `AssertionError: expected undefined to deeply equal { 'root.md': true, 'a.md': true }` (action unwired). Green after: one merged `config.subtaskCollapsed` write plus one `refresh()`/`renderResults()` call each, asserted via `vi.spyOn` call-count = 1 (not N) |
| CSS lane fidelity leg (T032), D1/D14/hit-area | `.pm-hidden` missing meant the empty-row snap-preview bar painted on every undated row unconditionally (confirmed by reading `calendar-timeline-renderer.ts:1355` before the CSS fix: `pm-hidden` had no matching rule in `styles.css`, so `display: none` never applied). Added verbatim from the reference's `utilities.css`/`widgets.css`/`task-editor.css`. Coarse-pointer hit-area selectors rewritten (`.pm-gantt-controls button.clickable-icon` → `.pm-gantt-controls button`; `.pm-gantt-label-row button.pm-icon-btn` → `.pm-gantt-label-row .clickable-icon`), no dimension change, confirmed by re-reading T028/T023's DOM shape changes against the old selectors. `.pm-gantt-view`'s entry rule and `.pm-segmented` scoped under `.note-database-container` in descendant form (not compound — verified `renderTimeline`'s root is `container.createDiv`, a child of the element that carries `note-database-container`, so the compound form would never match), matching the board block's own narrow precedent |
| `touch-targets` before/after (T032) | The bare-button/`div.clickable-icon` reshape (T023/T028) with the OLD hit-area selectors would regress toward the ~9974-under shape this file's own `ganttPortRaiseHistory` already documents for the identical root cause (a selector no longer matching a reshaped element); with the NEW selectors, `node tools/live/touch-targets.mjs`: constructed pass `367 under 28px`, exactly the recorded baseline, 0 new. The ~9974 "before" figure is cited from `touch-targets-constructed-baseline.json`'s own prior record of the same regression shape, not independently re-measured this session (re-measuring it live would have required reverting the CSS fix first) |
| Bench date-overflow fix (T033), red-first | Red: `eventDateFrom("2026-08-31", 1)` → `TypeError: eventDateFrom is not a function`. Found while reading the "constructed-timeline" capture: `row-1`'s milestone (frontmatter set by T030's bench edit) rendered nothing — traced to `eventDate(1)` computing `"2026-08-32"` (August has 31 days), which `normalizeDateKey` cannot parse, so `buildCalendarTimelineEvents` dropped the row (confirmed via a throwaway `vitest` probe: `totalEvents: 160` of `totalRows: 1600`, i.e. only `i % 10 === 0` rows survived, since every other offset in the 10-day window overflowed August's 31st). Green after `eventDateFrom` delegates to `addDateKeyDays`: recaptured `constructed-timeline-*`, row-1's milestone diamond, the row-4→row-5/row-9→row-10/row-14→row-15 dependency arrows and every row's bar are now visible |
| `replay.mjs` reconciliation (T033) | 1 claim broke on this tree, unrelated to the CSS edit: the retired "day fixture centres on pinned now / bare hour, not HH:00" claim read `timelineDynamicFixture(...).startMinutes`, a field T030's fixture rewrite no longer sets (the hour-based day grammar it measured was replaced by the reference's day-of-month grammar) — `undefined + number` silently became `NaN`. Replaced with a claim pinning the grammar that is actually current (unpadded day-of-month tick label, `TimelineConfig.DAY_WIDTH`'s 44/22/9/5/2), computed fresh (39/39 across both device widths) rather than re-recorded to match the broken number. `node tools/live/replay.mjs`: PASS, all 28 claims hold |
| Recapture and read (leg g) | `npm run screenshots` (356 entries) run three times across this leg (once pre-T033-fix to surface the milestone gap, twice after); the 40 timeline/gantt-scoped PNGs (`constructed-timeline` x4, `constructed-timeline-subtask` x4, `constructed-timeline-toolbar-options` x4, `timeline-toolbar-options` x4, `timeline-subtask-tree` x4, `timeline-view-*` all 5 scales x2 devices x2 themes =20) read at least once each — every scale confirmed showing bars with progress fill, a milestone diamond, and dependency arrows; the toolbar popover confirmed gating the custom-column-width rows both ways (local extensions off: hidden; on: shown, `timeline-toolbar-options` fixture). Byte-only re-encode noise (differs per run: 8, then 7, then 4 non-timeline captures) and `field-icon-picker-desktop-{dark,light}` (this lane's established environment-drift-prone capture) restored to `HEAD` bytes; their manifest `sourceHashes.styles.css` hand-patched to the tree's current hash after `check-lane.mjs`'s own pixelHash/layoutHash comparator confirmed none render any selector this leg touched |
| `evidence`/`screenshots-fresh` reconciliation (leg g) | Editing `styles.css` staled 8 `tools/live/*.json` artefacts plus `capture-device-parity.json` (source-hash bookkeeping, not a claim about their content); each re-run via its own tool (`cascade-audit.mjs`, `checkbox-appearance.mjs`, `checkbox-inventory.mjs`, `design-conformance.mjs`, `engine-parity.mjs`, `surface-census.mjs`, `token-census.mjs`, `view-census.mjs`, `capture-device-parity.mjs`) rather than hand-edited, per `evidence.mjs`'s own instruction |
| `css-lane` (leg g) | Acquired at `d3c6cc3e8453` (no operator had claimed it); released at `3110493a1a0e`, release entry names all 40 changed captures; `check-lane.mjs` exit 0 both held and released |
| Full re-verification (leg g) | `npx tsc --noEmit` exit 0; `npx vitest run` 994/994 (`75eaa34`'s 988 + T031's 2 seam tests + T033's 4 rollover tests; a throwaway milestone-debug probe used to trace the `eventDate` overflow was run standalone, never landed, and does not figure in this count); `npm run lint` 172 (unchanged); `npm run lint:tools` exit 0 (one `no-unused-vars` on the reworked `replay.mjs` claim, fixed by dropping the unused `page` param rather than an eslint-disable); `scan-comments` PASS (397 files); `SURFACE_PHASE=037-timeline-gantt-port npm run gate` 25/25 green (one transient `tests` timeout from concurrent worktree load, reproduced as flaky in isolation — all 12 tests in the 3 affected files pass standalone — and confirmed clean on the next full `npm run gate` run) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. ~~**Header/axis mismatch at quarter and year scale.**~~ Fixed in leg a and photographed in leg c: the
   title describes the rendered window, and spans years when the window crosses one.
2. **Zero-width mount fallback has no centring.** `getTimelineViewportUnitCount` returns `undefined` on a
   0-width mount and falls back to the calendar-boundary window until the next resize.
3. **Invalid interactive nesting.** `span[role=button][tabindex=0]` sits inside `button.db-timeline-event`;
   flagged for `041-shared-ui-ux-port`.
4. **Link-dot overlap at year/quarter scale.** Adjacent bars' 28px link dots overlap each other and
   neighbouring bars.
5. **Low-contrast meta over the progress fill in light mode.**
6. ~~**Milestone label overpaint.**~~ Fixed across legs a and c: the lane model raises a crowded label and
   `.is-label-above` gives it somewhere to go. Photographed on all 16 week/month/quarter/year captures.
7. ~~**Clipped leading axis label on mobile.**~~ Fixed in leg a and photographed in leg c.
8. ~~**Day scale at phone width, partly repaired.**~~ Fixed and fully photographed as of leg d
   (2026-09-04): eleven 32px hour columns, the window centred on the current hour, and — closing the last
   capture gap — the screenshot fixture now derives that centring from the same clamp math the model uses,
   so `timeline-view-day-{desktop,mobile}-{light,dark}.png` all show today (13:00) in frame with no
   colliding tick labels. **Year scale at phone width remains open**: 4px/day still carries almost no
   readable labels, and the 160px label column still overlays the grid.
11. ~~**Two screenshot-fixture fidelity gaps, both in the day branch.**~~ Fixed in leg d: `temporal.mjs`'s
    `timelineTicksFor` day branch now emits the bare `"HH"` label `buildTimelineTicks` emits, and
    `timelineViewportWindow` now takes a `now` argument and centres through
    `resolveTimelineDayCentredStartMinutes`'s own clamp math. `temporal-tick-parity.test.mjs` binds both to
    the real exports, red-first (4 of 118 failed), green after (118/118).
9. **Capture-harness padding note (low priority).** `#shot` carries 16px padding not reflected in the
   fixture's device-width comment; the right edge overflows by up to 8 columns at year desktop, though
   today-centred content stays in frame.
10. **Pre-existing duplicated CSS.** `.db-timeline-event.is-all-day` remains defined at two `styles.css`
    blocks; not introduced by this port.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:next-leg -->
## Next Leg

**Amendment 2026-09-04, operator directive (verbatim): "Same for timeline"**, issued the same
minute as the equivalent board directive. The operator installed obsidian-pm 2.1.0 beside this
plugin in the iCloud vault and ran a side-by-side comparison; the landed legs above and their
round-nine fixes rewrote the reference's behavior contract into local geometry rather than
reproducing `GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/`TimelineConfig.ts`'s
DOM structure and class vocabulary, and that fell short of the comparison. `spec.md` REQ-007 and
`goal.md` D6 record the amendment and its supersession of the prior "rewrite, never copied"
disposition for structure and visual language; `acceptance-criteria.md` AC-007 and `tasks.md`
T019-T022 were the closure gate.

**T019-T022 are now closed** (2026-09-04, `tasks.md` carries the full evidence per task):
T019/T020 (`cli-devin`) ported the reference's DOM structure and class vocabulary onto the default
render, gated the local-extensions behaviors behind a new default-off setting, and turned the
parity test green. T021 (`cli-codex`, verified and completed by a fresh in-runtime session in this
leg) copied `gantt.css` verbatim, closed two class-coverage gaps the copy alone left unstyled,
restored the ~1266 lines the still-live gated extensions path needs (deleted by an intermediate
uncommitted pass, not by design), stood in the missing `--color-red` token, and lowered the
touch-target ratchet 9974 → 320 with a coarse-pointer hit-area rule rather than a visual resize.
T022 (this same fresh session) read all 24 changed fixture captures plus the 4 constructed-renderer
captures against the reference source, confirming structure, class vocabulary, and visual language
match at all five scales, both devices, both themes.

**What remains before the whole packet can claim `[x]` on every task**: T003, T009, T013, T014 and
the CHK-* checklist rows in `tasks.md` predate the 1:1 amendment and were out of scope for the
CSS-leg dispatch that closed T021/T022 — they still need their own pass before the Completion
Criteria section can be checked off.

**T023-T033 are now closed** (leg g, 2026-09-04): T023-T030 (an external `cli-devin` leg, verified
line-by-line against the reference by a fresh in-runtime session in this leg before being trusted)
closed the same-side link rejection, Escape/wheel/scroll-sync wiring, per-edge bar-drag payload,
the collapse-all batching contract, the controls-bar and add-subtask DOM shape, the local-extension
gate on custom column width, and the phone label width/milestone anchor/fixture-and-bench fidelity
gaps. T031 (this leg) wired the `setSubtaskCollapsedMany` seam T027 declared but never bound. T032
(this leg) closed the CSS-side fallout of T023/T028's DOM shape changes (the empty-row preview's
missing `pm-hidden` rule, the hit-area selectors T028 orphaned, `.pm-gantt-view`/`.pm-segmented`
namespace scoping). T033 (found verifying T030's own bench edit) fixed a day-of-month overflow in
`eventDate()` that was silently dropping most of the bench's rows from the constructed captures,
and reconciled the one `replay.mjs` claim T030's fixture rewrite broke. T003/T009/T013/T014 and the
CHK-* rows remain the only items still open.
<!-- /ANCHOR:next-leg -->

---


