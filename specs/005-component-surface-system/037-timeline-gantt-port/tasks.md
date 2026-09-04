---
title: "Tasks: Timeline/Gantt Port [template:level-2/tasks.md]"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "timeline gantt port tasks"
  - "037 tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Timeline/Gantt Port

<!-- SPECKIT_LEVEL: 2 -->

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

- [x] T001 Observe the current renderer's dependency-link seam failing (no seam exists) and record the exact
      failing value — D3 red-before-green (`src/views/calendar-timeline-renderer.ts`)
      — evidence: stashing `calendar-interaction-model.ts` and running its isolated test file reproduces
      12 failed of 12 seam tests, red `TypeError: resolveTimelineLinkChange is not a function` at
      `src/data/calendar-interaction-model.test.ts:41` (vitest, 2026-09-03; combined-run figure from the
      authoring session was 31 failed/2 passed across both timeline test files before the split); green
      after the seam landed at `src/data/calendar-interaction-model.ts:270`
- [x] T002 Acquire `tools/lane/css-lane.json` before any `styles.css` edit begins (`tools/lane/css-lane.json`)
      — evidence: holder/acquiredAt at `tools/lane/css-lane.json:2-3`, acquire history entry at `:1163-1168`; `SURFACE_PHASE=037-timeline-gantt-port node tools/lane/check-lane.mjs` accepted the held lane (2026-09-03)
- [ ] T003 [P] Read `cli-devin`'s and `cli-codex`'s `SKILL.md` before composing the first external-lane prompt
      (`.opencode/skills/cli-external-orchestration/cli-devin/SKILL.md`, `cli-codex/SKILL.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Extend `buildTimelineModel` with reference padding/min-span semantics from `TimelineConfig.ts:36-45`,
      `:47-61` (`src/data/calendar-timeline-model.ts`)
      — evidence: `buildTimelineRangeGeometry` at `calendar-timeline-model.ts:1316` with padding/min-span
      constants at `:207-228`; tests at `calendar-timeline-model.test.ts:64-112`
- [x] T005 Add a `resolveTimelineLinkChange`-shaped pure function rejecting same-side, duplicate, missing-task,
      and cycle links, matching `GanttLinkHandler.ts:56-67`, `:77-97` (`src/data/calendar-interaction-model.ts`)
      — evidence: `resolveTimelineLinkChange` at `calendar-interaction-model.ts:270`,
      `wouldCreateTimelineDependencyCycle` at `:300`; four rejection tests at
      `calendar-interaction-model.test.ts:55-78`
- [x] T006 Rewrite the five-level scale controls into the local i18n/navigation contract, matching
      `GanttView.ts:95-106` (`src/views/calendar-timeline-renderer.ts:1202-1244`)
      — evidence: five translated options, pressed state, scale data attributes and mobile listbox at `calendar-timeline-renderer.ts:1202-1244`; translations at `src/i18n.ts:837-847, 2500-2510, 4130-4140`
- [x] T007 Rewrite header/grid bands (weekend/Monday/month boundaries, today line) matching
      `GanttRenderer.ts:30-40`, `:90-109` and `GanttHeaderRenderer.ts:48-75`
      (`src/views/calendar-timeline-renderer.ts:399-420`, `:500-529`, `:482-488`)
      — evidence: boundary/weekend tick classes and per-unit weekend/today fill columns at `calendar-timeline-renderer.ts:399-420, 500-529`; sticky axis/fill rules at `styles.css:16876-16948, 17029-17052`
- [x] T008 Rewrite due-only/milestone/progress bar rendering matching `GanttTaskBarRenderer.ts:51-58`, `:76-117`
      (`src/views/calendar-timeline-renderer.ts:921-951`, `src/data/calendar-timeline-model.ts:941-972`)
      — evidence: due-only model fallback and metadata at `calendar-timeline-model.ts:739-746, 941-972`; milestone diamond/progress elements at `calendar-timeline-renderer.ts:921-951`; focused model tests at `calendar-timeline-model.test.ts:137-178`
- [ ] T009 Rewrite drag/resize edge handles as local buttons/ARIA, keeping the touch alternative, matching
      `GanttTaskBarRenderer.ts:119-146` and `GanttDragHandler.ts:48-58`
      (`src/views/calendar-timeline-renderer.ts:1430-1460`)
- [x] T010 Wire the new link seam into `calendar-timeline-renderer.ts:158-170`'s action contract; no direct
      local dependency renderer existed before this task
      — evidence: optional persistence action at `calendar-timeline-renderer.ts:173`; dots/drag/keyboard/two-click resolution at `:609-778`; dependency line projection at `:532-570`; rejection notices use all three locale blocks in `src/i18n.ts:838-847, 2501-2510, 4131-4140`
- [x] T011 Reconcile `styles.css` `db-timeline-*` rules against `gantt.css:1-17`, `:237-277`, under the
      acquired `css-lane` hold (`styles.css:16759-16760` region)
      — evidence: local token hierarchy, scale grid, weekend/today fills, progress/milestone, link dots/line, hover/drag and reduced-motion rules at `styles.css:16750-16773, 16876-17052, 17717-17869`; lane check accepted the changed stylesheet while held
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T012 Run unit tests for padding/min-span and link-rejection cases; observe green after T004/T005
      — evidence: `npx vitest run` 78 files / 682 tests green, 2026-09-03 (33 new tests across
      `calendar-interaction-model.test.ts` and `calendar-timeline-model.test.ts`)
- [ ] T013 Verify placement and observer/DOM teardown unchanged after the port
- [ ] T014 Verify keyboard and touch-menu equivalents exist for every rewritten drag/resize/link affordance
- [x] T015 Recapture and read screenshots at all five zoom levels (day/week/month/quarter/year)
      — evidence: 20 timeline captures read (day/week/month/quarter/year x desktop/mobile x light/dark;
      week keeps its pre-existing name `timeline-view-{desktop,mobile}-{light,dark}.png`), plus
      `panel-record-detail-sheet-body-empty-desktop-light.png` read separately (byte noise, no layoutHash move) — 21 total
- [x] T016 Release the `css-lane` hold with a `reviewed` array naming the recaptured screenshots
      — evidence: release entry at `tools/lane/css-lane.json` naming all 21 changed captures;
      `node tools/lane/check-lane.mjs` (no `SURFACE_PHASE`) — "check-lane: release names all 21 changed
      capture(s)", exit 0, 2026-09-03
- [x] T017 Run `npm run gate`; read the full output and exit status; read
      `tools/lane/gate-logs/<lane>.log` for any red lane before claiming done
      — evidence: `SURFACE_PHASE=037-timeline-gantt-port npm run gate` — "gate: PASS — 25 green, 0 red for
      a declared reason", exit 0, 2026-09-03; plain `npm run gate` (lane released) — same 25/25 green, exit 0
- [x] T018 In-runtime fresh verifier re-runs the browser gate and `validate.sh --strict` itself (D14 leg c;
      a delegate's own report is a claim, not a result)
      — evidence: both gate runs above are this dispatch's own fresh observation, not a relayed claim;
      `validate.sh --strict` run against this packet, first `RESULT: PASSED`, 2026-09-03
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase 4: 1:1 Reference Port (Amendment 2026-09-04, REQ-007)

- [x] T019 Write a red-first DOM-structure parity test walking the reference's `GanttView` output
      shape — REQ-007.
      — evidence to close: the test is observed failing against the current (pre-amendment)
      renderer before any port line lands, naming the exact structural gap.
      — closed 2026-09-04 (this leg): `src/views/calendar-timeline-gantt.test.ts` — red first:
      3 failed of 3, `AssertionError: expected 'div\n  div.db-timeline.is-scale-month…' to be
      'div.pm-gantt-view\n  div.pm-gantt-con…' // Object.is equality`, the pre-port renderer
      emitting `db-timeline-*` classes where the reference shape requires `pm-gantt-*`
      (`calendar-timeline-gantt.test.ts:398, 542, 603`); green after the port: 3/3, plus the
      reference geometry defaults (label width 280px, header 56px, row 44px) asserted at
      `calendar-timeline-gantt.test.ts:535-549`.
- [x] T020 `cli-devin` leg: port `GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/
      `TimelineConfig.ts`'s DOM structure and class vocabulary 1:1 onto
      `calendar-timeline-renderer.ts` — REQ-007, REQ-002, REQ-003.
      — evidence to close: T019's parity test turns green; the dependency-link seam and
      visible-window/backlog/invalid-event/group-limit behavior named in REQ-002/REQ-003 are
      unchanged by hunk-range inspection of the diff.
      — closed 2026-09-04 (this leg): default render dispatch to the 1:1 path at
      `calendar-timeline-renderer.ts:389-393`, ported tree at `renderTimelineGantt`
      (`:636-734`) with the MIT notice at `:573-608`; the local-extension path is unchanged and
      gated by `timelineLocalExtensions` (default off) at `:389` (`src/data/types.ts:706-709`);
      reference geometry constants at `src/data/calendar-timeline-model.ts:249-254`; strings in
      all three locale blocks (`src/i18n.ts:863-873, 2551-2561, 4210-4220`). REQ-002 seam
      (`resolveTimelineLinkChange` → `handleTimelineLinkClick`) reused unchanged by the link
      dots (`calendar-timeline-renderer.ts:1227`, `handleGanttLinkDotClick` at `:1516`);
      REQ-003 behaviors live unchanged behind the setting. Local extensions and their gates
      listed in the leg report.
      — fresh verifier pass, 2026-09-04 (a session that did not write T019/T020): re-read every
      reference file (`GanttView.ts`, `GanttHeaderRenderer.ts`, `GanttRenderer.ts`,
      `GanttTaskBarRenderer.ts`, `GanttDragHandler.ts`, `GanttLinkHandler.ts`,
      `TaskLabelRenderer.ts`, `TimelineConfig.ts`) against the ported block line by line; found
      and fixed one real gap the port left open — every data/config change re-renders the
      timeline from scratch (`renderTimeline` at `calendar-timeline-renderer.ts:374`), and
      without the reference's `pendingScroll` mechanism (`GanttView.ts:48,65-73,258-267`) the
      viewport snapped back to "today" after every drag, link, or scale change; added
      `ganttPendingScroll` (`:302`), a capture before teardown in `renderTimeline` (`:374`), and
      `applyGanttPendingScroll` (`:1577`) called from `renderTimelineGantt`'s RAF (`:649`) instead
      of unconditionally centering on today. `npx tsc --noEmit` exit 0, `npx vitest run` 964/964
      (including the untouched T019 parity test), `npm run lint` 172 problems (verified equal to
      a clean `f7b080a` baseline via a disposable `git worktree add`, not `git stash`), comment
      scan 0. One accepted, undocumented-by-devin structural gap left as-is (no local fix
      possible without new app infrastructure): the reference's per-view Ctrl+Z/Ctrl+Shift+Z/
      Ctrl+Y undo/redo (`GanttView.ts:201-217`) has no local equivalent — this codebase carries
      no `plugin.undoLastAction`/`redoLastAction` analogue outside Obsidian's own editor-focused
      undo, so REQ-007's "drag and resize behaviour" parity holds for the drag/resize/link
      mechanics themselves but not this specific reference keyboard shortcut; flagged for the
      orchestrator rather than invented. Repointed the harness's `db-timeline-*` assertions to
      the new default: `tools/live/render-assertion-harness.ts`'s `timelineAssertions()` now
      queries `.pm-gantt-label-row`/`.pm-gantt-bar-group`/`.pm-gantt-milestone` (the bench never
      sets `timelineLocalExtensions`, so its scenario always exercised the new default path);
      raised `tools/live/touch-targets-constructed-baseline.json`'s ratchet from 367 to 9974 with
      a full per-class audit (clickable-icon 0→9648, pm-prop-add 0→6, the three retired
      `db-timeline-nav`/`-create-button`/`-scale-menu` classes 47→0) — the reference's own
      controls bar and per-row add-subtask button are bare, unstyled `clickable-icon` buttons at
      bench scale (1600 rows × 6 timeline scenarios), matching the reference's own `gantt.css`,
      which carries no sizing rule for them either; added a `tools/lane/css-lane.json` release
      entry (`037-timeline-gantt-port`, same `baselineHash`, no styles.css edit) naming the four
      `constructed-timeline-*` captures that moved for real (the other twelve recaptured
      `timeline-view-*`/`timeline-subtask-tree-*` PNGs are hand-written `scenarios.mjs` fixtures,
      confirmed pixel-identical by `check-lane`'s own compare — byte-only re-encode noise, no
      review owed); read all four constructed-timeline captures at both densities and both
      themes — every one shows the unstyled pre-CSS-leg state (`pm-gantt-controls` bar and
      `pm-gantt-label-row`s stacked as plain blocks from the top, the SVG header/grid/bars
      pushed off-viewport below the row list because `.pm-gantt-wrapper` has no flex rule yet),
      expected until T021 lands `gantt.css`. `npm run gate`: 25/25 green (`screenshots-fresh`,
      `touch-targets`, `evidence` were the three red lanes before this pass; all three now
      green from the fixes above, not from exemption).
- [x] T021 `cli-codex` leg: copy `gantt.css` verbatim where its rules apply into the
      `css-lane`-held `styles.css` `db-timeline-*` region, with the MIT notice attached to the
      copied block, and update the screenshot fixtures to match — REQ-007.
      — evidence to close: `css-lane` acquired before the edit and released only after a
      recapture that is actually read; local extensions (visible-window rendering, unscheduled
      backlog, invalid-event repair, group/lane limits, touch menu, keyboard link buttons, the
      viewport-centred window) render only behind a new default-off setting.
      — was: before this leg the default `.pm-gantt-*` tree carried the MIT notice and the copied
      `gantt.css` block but rendered unstyled (T020's own note: "pm-gantt-controls bar and
      pm-gantt-label-rows stacked as plain blocks … SVG header/grid/bars pushed off-viewport"),
      and `tools/live/touch-targets-constructed-baseline.json`'s ratchet stood raised at 9974.
      — closed 2026-09-04 (this leg, `cli-codex` uncommitted work verified and completed by a
      fresh in-runtime session): `styles.css:17168-17190` MIT notice; `:17192-17203` alias block
      bridging only the two surface tokens the copy consumes (`font-family`/`color`, since the
      reference mounts under `.pm-root` and this plugin mounts under `.note-database-container`) —
      trimmed the reference's own unrelated `--pm-ghost-border`/`--pm-shadow-ambient` kanban/
      time-log tokens the alias originally over-carried, since nothing in the copied block or its
      companion rules reads them; `:17205-17480` is `gantt.css` lines 1-277 byte-for-byte
      (`diff -u specs/context/obsidian-pm-main/src/styles/gantt.css <(sed -n '17205,17480p'
      styles.css)`, zero output); `:17483-17605` is the reference's own drag-handle/link-dot/
      milestone/collapse-toggle/add-row companion rules from `widgets.css`/`table.css`, plus two
      rules a render-class-coverage sweep found the fixture/renderer emit with no matching CSS —
      `.pm-gantt-bar-icon` (`:17591`, from `widgets.css`) and the three
      `.pm-gantt-label-row--dragging`/`--drop-before`/`--drop-after` states (`:17596-17603`, from
      `utilities.css`); `:17606-17629` is the coarse-pointer hit-area rule (`min-width`/
      `min-height: 28px` on the controls/label-row/add-row buttons, no `width`/`height` changed).
      Class-coverage check: every `pm-gantt-*` class `grep`'d from
      `src/views/calendar-timeline-renderer.ts`'s `createDiv`/`createEl`/`ganttSvgElement` calls
      now resolves to a rule; the two gaps above were the only misses.
      Old-region decision (per rule, not wholesale): `renderTimelineLocal`
      (`calendar-timeline-renderer.ts:411`, gated by `config.timelineLocalExtensions`, default
      off) still emits `db-timeline-*` markup — confirmed unchanged in this leg's diff — so the
      ~1266 lines the prior `cli-codex` pass deleted (old `styles.css:17168-18433`, "Timeline
      shared base"/"Timeline View") were restored verbatim at `:17643-18908`
      (`diff` against the pre-session commit, zero output) rather than left missing, which would
      have silently broken that still-live path (backlog drawer, grouped lanes, link-dot editor,
      milestone diamond, snap markers, drag/resize — none of which the reference or the pm-gantt
      copy has an equivalent for). No additional scoping wrapper was added: these class names are
      exclusive to the gated renderer and are never emitted by the default tree (grepped
      `createDiv`/`createEl` call sites for every `db-timeline-*` name; none overlaps a `pm-gantt-*`
      one), so the isolation is by construction, matching how it worked before removal and how
      `db-calendar-*` shares 28 of these same declarations today (`styles.css:15594-15794`
      unchanged, since it is not part of the deleted region; the restoration shifted everything
      after it, so the touch-target block that also names `db-timeline-window-jump`/
      `-mobile-menu-button` now sits at `:19888-19978` and `:21944` — verified still shared with
      the calendar view and the app-wide 28px hit-area block).
      Missing-token fix (found reading the captures, not assumed): `.pm-gantt-today-line`/
      `-diamond` read `var(--color-red)` with no fallback (`gantt.css`'s own rule, copied
      verbatim); the harness supplies no such token, so every capture painted the "now" marker
      black instead of red. Stood the token in at `tools/screenshots/theme.css` (light block, next
      to `--color-orange`/`--color-green`; dark override in the `.theme-dark`-equivalent block),
      TRANSCRIBED from the installed Obsidian 1.13.4 `app.css` (`.theme-light { --color-red:
      #e93147; }`, `.theme-dark { --color-red: #fb464c; }` — extracted from
      `/Applications/Obsidian.app/Contents/Resources/obsidian.asar`, not recalled), cross-checked
      against the file's existing `--color-orange`/`--color-green` transcriptions which match this
      same install exactly. `node tools/screenshots/scan-pinned-values.mjs`: the `--color-red`
      UNSUPPLIED hard-fail cleared (0 unsupplied tokens outside the recorded baseline; count moved
      10 → 7, no baseline edit needed since it was never on the allowlist).
      Touch-target ratchet, measured not asserted: `node tools/live/touch-targets.mjs` after the
      hit-area rule landed — constructed pass 320 under the 28px floor, down from the 9974 the
      TypeScript leg's own `raiseHistory` recorded (`tools/live/touch-targets-constructed-baseline.json`
      `lowerHistory`, this leg): 320 is exactly 367 (the pre-port baseline) minus the 47
      (5+36+6) retired local-nav classes that raise already accounted for, i.e. the hit-area rule
      removed the entire `clickable-icon`/`pm-prop-add` shortfall the port introduced and nothing
      else moved (`db-calendar-month-segment` 200, `-more-events` 56, `-week-allday-date` 16,
      `-week-allday-more` 16, `db-table-footer-trigger` 32 — every one held its exact prior count).
      Recapture and review: `npm run screenshots` (312 entries); 24 timeline/subtask-tree captures
      plus the 4 `constructed-timeline-*` (already reviewed once pre-CSS by T020, now superseded)
      opened and read across all 5 scales (Day/Week/Month/Quarter/Year), both devices, both
      themes — every one shows the segmented scale control, label column with header, sticky SVG
      header with alternating bands, dashed grid, the (now red) today line and diamond, bars with
      progress fill and label, the milestone diamond, the dashed dependency arrow with its
      arrowhead, and mobile's narrow left-panel/clipped-right-panel layout, matching the reference.
      Two more captures (`field-icon-picker-desktop-dark/light`) moved pixel content in an
      unrelated "Recent" icon-row region — `git diff -- styles.css` shows zero icon-picker lines,
      and the same layoutHash/pixelHash reproduced across two independent recapture runs, so this
      is deterministic capture-environment drift (grid `auto-fill`/`scrollbar-gutter` sub-pixel
      measurement on this machine's current Chromium), not a CSS regression; shipped as captured
      (not hand-reverted) so `screenshots:verify`'s freshness invariant stays honest, and named in
      the `css-lane` release alongside the 28 real ones (30 total, `tools/lane/css-lane.json`
      newest history entry). `tools/lane/check-lane.mjs`: green, "release names all 30 changed
      capture(s)". `npx tsc --noEmit` exit 0; `npx vitest run` 964/964; `npm run lint` 172
      problems (unchanged from the HEAD baseline, no `styles.css`-caused count move — lint is
      TS/JS-only); `node tools/naming/scan-comments.mjs` PASS, 0 missing banners/sections, 0
      commented-out lines.
      Fixed two small `tools/` lint errors found closing this leg (`no-unused-vars`, unrelated to
      styles.css): `tools/screenshots/scenarios/temporal.mjs` — `timelineGanttLabelRow`'s
      `rowIndex` parameter was dead (never read in the function body); removed it and the
      matching call-site argument. `timelineEvent`'s `laneEvents` parameter is a real 3rd
      positional slot some callers use to reach `rowIndex` as the 4th (`temporal-tick-parity.test.mjs`),
      but is not read inside the function itself — the milestone-arrow markup this fixture renders
      derives its link target from the lane data at fixture build time, one level up, not inside
      `timelineEvent`; kept the parameter for positional compatibility with an
      `eslint-disable-next-line no-unused-vars` and a WHY comment, matching this codebase's
      existing precedent (`src/views/embedded-database-renderer.ts:3828`).
      `SURFACE_PHASE=037-timeline-gantt-port npm run gate`: 25/25 green (fixed the 5 that were red
      before this leg closed — `lint:tools` above; `pinned-values` above; `evidence` — 8 of 16
      artefacts stale on the moved `styles.css`/`theme.css` hashes, each re-run through its own
      writer tool, `--check-all` now reports 16 fresh; `screenshots-fresh` — resolved by the
      recapture above; `replay` — 4 claims the `037`/`040`-phase claim set had recorded against
      the pre-fixture-rewrite `db-timeline-*` vocabulary, detailed below).
      `replay` claim reconciliation (not silently re-recorded — each traced to its actual cause):
      two selectors were stale-but-vacuously-passing (`0 == 0` while matching nothing) — the
      dependency-link and day-scale-hour-label claims now query `.pm-gantt-bar-group`/
      `.pm-gantt-link-dot` and `.pm-gantt-header-day` (the current default-render vocabulary the
      REQ-007 fixture rewrite moved `temporal.mjs`'s `timeline-view*` scenarios to); both
      reproduce their original recorded numbers exactly (0 missing; 574) once corrected, no
      claim-number change. The subtask-tree claims (`040-subtask-tree-port`) assumed a uniform
      `[data-subtask-depth]` attribute; board still stamps it (`board-renderer.ts:806`,
      unchanged) but the default `pm-gantt` label row never did — production
      (`calendar-timeline-renderer.ts:825-827`) indents subtask children via a computed inline
      `padding-left` instead, matching the reference's own label row (no CSS in this file reads
      `[data-subtask-depth]` for anything `pm-gantt-*`, confirmed by grep); updated both checks to
      test the correct per-surface marker (attribute for board, `padding-left > 8px` for
      timeline), recorded numbers unchanged (0 missing; 2 surfaces). The weekend-fill claim
      assumed weekend shading applies to the four multi-day scales and never to day — inverted
      from what the reference actually does: `specs/context/obsidian-pm-main/src/views/gantt/
      GanttRenderer.ts:43` and `GanttHeaderRenderer.ts:62` gate `pm-gantt-weekend`/
      `-weekend-header` on `granularity === 'day'` only, which this port carries over unchanged,
      and the day-scale fixture is pinned to 2026-03-25 (a Wednesday), so no scale paints a
      weekend fill for this fixture data under any faithful implementation. Reworded the claim to
      the actual, verified invariant — header/grid/today fills present on all 5 scales, and
      weekend fill never leaks outside the day scale — which still catches a real regression
      class (weekend fill widening past day, or header/grid/today disappearing) without asserting
      something the reference's own design makes impossible. `node tools/live/replay.mjs`: PASS,
      all 28 claims hold.
- [x] T022 Fresh in-runtime verifier reads the recaptured timeline screenshots side by side with
      the reference's own screenshots or the operator's vault comparison — REQ-007.
      — evidence to close: a session that did not run T020/T021 opens both sets of captures and
      states, per element, whether structure/class/visual language/row-height/unit-width defaults
      match; T019's parity test re-run green by this same fresh session.
      — closed 2026-09-04 (this leg is that fresh session: dispatched fresh into the worktree,
      did not write T020 or the T021 CSS/fixture edits it inherited uncommitted): read all 24
      changed `timeline-view-*`/`timeline-subtask-tree-*` fixture captures plus the 4
      `constructed-timeline-*` production-renderer captures, per element against `gantt.css` and
      the reference `GanttRenderer.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts` source —
      structure: controls bar (segmented Day/Week/Month/Quarter/Year, Today/Expand all/Collapse
      all), left label column with header, resize handle, sticky SVG header with alternating
      bands, dashed vertical grid, today line and diamond (red, once the missing token above was
      supplied), bars with progress fill and label, the milestone diamond, the dashed dependency
      arrow with arrowhead, and the subtask collapse chevron — all present and positioned as the
      reference specifies, at all 5 scales, both themes, both devices. Class vocabulary: every
      `pm-gantt-*` class the renderer emits resolves to a copied or companion rule (class-coverage
      sweep in T021, two gaps found and closed there). Row-height/unit-width defaults: unchanged
      from T020's port (`GANTT_ROW_HEIGHT`/label width 280px/header 56px), not touched by this
      CSS-only leg. Visual language: colors, typography and spacing match the copied `gantt.css`
      rule-for-rule (T021's `diff -u`, zero output) plus the one corrected token (`--color-red`).
      `src/views/calendar-timeline-gantt.test.ts`'s T019 parity test re-run in this same session:
      3/3 green, unchanged. `npx tsc --noEmit` exit 0, `npx vitest run` 964/964,
      `SURFACE_PHASE=037-timeline-gantt-port npm run gate` 25/25 green — all fresh-observed in
      this session, not relayed from T021's own report.
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] `npm run gate` reports `gate: PASS`, exit 0, observed by a fresh in-runtime agent
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
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
- [ ] CHK-003 [P1] Dependencies identified and available (`036-obsidian-pm-ui-harvest` closed)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented (invalid-date events still hidden and repairable)
- [ ] CHK-013 [P1] Code follows project MODULE-banner and numbered-section pattern; no spec paths, phase
      numbers, or requirement ids in comments (Comment Hygiene HARD BLOCK)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met (`acceptance-criteria.md`)
- [ ] CHK-021 [P0] Manual testing complete at all five zoom levels
- [ ] CHK-022 [P1] Edge cases tested (due-only bar, same-side/duplicate/missing-task/cycle link rejection)
- [ ] CHK-023 [P1] Error scenarios validated (invalid-date repair unchanged)
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] N/A — this is a port, not a bug fix; no finding class applies
- [ ] CHK-FIX-002 [P0] N/A
- [ ] CHK-FIX-003 [P0] N/A
- [ ] CHK-FIX-004 [P0] N/A
- [ ] CHK-FIX-005 [P1] N/A
- [ ] CHK-FIX-006 [P1] N/A
- [ ] CHK-FIX-007 [P1] N/A
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation implemented (date/link inputs)
- [ ] CHK-032 [P1] N/A — no auth surface in this packet
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/acceptance-criteria synchronized
- [ ] CHK-041 [P1] Code comments adequate; durable why, no ephemeral artifact labels
- [ ] CHK-042 [P2] N/A — no README surface changed by this packet
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
| P0 Items | 8 | 0/8 |
| P1 Items | 8 | 0/8 |
| P2 Items | 1 | 0/1 |

**Verification Date**: pending
<!-- /ANCHOR:summary -->
