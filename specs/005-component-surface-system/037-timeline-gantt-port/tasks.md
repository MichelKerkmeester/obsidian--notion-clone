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
      fresh in-runtime session): `styles.css:17568-17588` MIT notice (line numbers verified by
      grep on the merged tree; `* MIT License` at `:17569`); `:17590-17604` alias block
      bridging only the two surface tokens the copy consumes (`font-family`/`color`, since the
      reference mounts under `.pm-root` and this plugin mounts under `.note-database-container`) —
      trimmed the reference's own unrelated `--pm-ghost-border`/`--pm-shadow-ambient` kanban/
      time-log tokens the alias originally over-carried, since nothing in the copied block or its
      companion rules reads them; `:17605-17881` is `gantt.css` lines 1-277 byte-for-byte
      (`diff -u specs/context/obsidian-pm-main/src/styles/gantt.css <(sed -n '17605,17881p'
      styles.css)`, zero output); `:17883-18030` is the reference's own drag-handle/link-dot/
      milestone/collapse-toggle/add-row companion rules from `widgets.css`/`table.css`, plus two
      rules a render-class-coverage sweep found the fixture/renderer emit with no matching CSS —
      `.pm-gantt-bar-icon` (`:17991`, from `widgets.css`) and the three
      `.pm-gantt-label-row--dragging`/`--drop-before`/`--drop-after` states (`:17996-18004`, from
      `utilities.css`); `:18006-18030` is the coarse-pointer hit-area rule (`min-width`/
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
      Post-rebase reconciliation (onto main's one-to-one board kanban port and its ten
      constructed state variants, `f5983a4`, merge-base `65238ad`): `styles.css` gained a new
      merged hash (`d3c6cc3e8453`) since the two legs' regions are disjoint MIT-notice blocks;
      re-measured directly on the merged tree rather than carried forward — `under` 367 against
      a freshly-recorded 367 baseline (not this leg's own 320: the state-variant leg's 55-control
      raise and this leg's 47-control retirement of the local timeline-nav classes wash back to
      the shared pre-either-leg base of 367, verified per class and recorded in
      `touch-targets-constructed-baseline.json`'s new `mergeReconciliation` entry, which keeps
      both this leg's `raiseHistory`/`lowerHistory` and the state-variant leg's own raise
      alongside it). `tools/lane/css-lane.json`: merged history, `baselineHash` recomputed, a new
      release entry names the 4 `constructed-timeline-subtask-*` captures a fresh recapture found
      content-changed (all read, matching the reference); one further capture moved bytes but not
      pixel content (encoder noise, restored to `HEAD`). `SURFACE_PHASE=037-timeline-gantt-port
      npm run gate`: 25/25 green on the rebased tree.
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

<!-- ANCHOR:phase-5 -->
## Phase 5: Fidelity Pass (Amendment 2026-09-04, fresh-reviewer divergences)

- [x] T023 Same-side link rejection keeps the first dot armed, matching `GanttLinkHandler.ts:56-59`
      (`src/views/calendar-timeline-renderer.ts`, `src/views/calendar-timeline-gantt.test.ts`)
      — red first: `calendar-timeline-gantt.test.ts` "keeps the first link dot armed when the
      second click is same-side, like the reference" —
      `AssertionError: expected 'pm-gantt-link-dot' to contain 'pm-gantt-link-dot--active'` —
      the pre-fix `handleTimelineLinkClick` cleared the selection before every rejection
      (was `calendar-timeline-renderer.ts:2001-2005`), so the armed dot lost its highlight.
      — closed: the rejection branch now returns with the first dot still armed for
      `same-side` and cancels only for duplicate/missing-task/cycle
      (`calendar-timeline-renderer.ts:2005-2011`), matching the reference's early return.
- [x] T024 Escape cancels an in-progress link from the document, gated on the active leaf
      (`GanttView.ts:197-219`), cleaned up on teardown
      (`src/views/calendar-timeline-renderer.ts`, `src/views/calendar-timeline-gantt.test.ts`)
      — red first: "cancels an in-progress link with Escape from the document, like the
      reference" and "removes the document keydown listener on teardown" —
      `AssertionError: expected 0 to be greater than 0` — the old binding sat on the root
      element, which has no tabindex and never receives a document-level keydown
      (was `calendar-timeline-renderer.ts:735-740`).
      — closed: document-level `keydown` behind the reference's `closest('.workspace-leaf')`
      `mod-active` gate, removed through `ganttCleanupFns` on the next render and on `destroy`
      (`calendar-timeline-renderer.ts:734-749`).
- [x] T025 Left-panel wiring: the spacer sync runs inside the post-layout frame and wheel
      passthrough covers the whole left panel (`GanttView.ts:230-236, 248-267`)
      (`src/views/calendar-timeline-renderer.ts`, `src/views/calendar-timeline-gantt.test.ts`)
      — red first: "defers the left spacer sync to the post-layout frame, like the reference" —
      `AssertionError: expected 'NaNpx' to be undefined` (the pre-fix code measured the
      scrollbar synchronously, was `calendar-timeline-renderer.ts:1564`) — and "passes wheel
      events from the whole left panel to the chart, like the reference" —
      `AssertionError: expected false to be true` (the pre-fix wheel listener sat on
      `leftBody`, was `:1552`).
      — closed: `setupGanttScrollSync` now binds wheel on the left panel and returns the
      `syncSpacer`, invoked by the same RAF that restores the scroll
      (`calendar-timeline-renderer.ts:734-763, 1567-1590`).
- [x] T026 Bar-edge drags patch only the changed edge, matching the reference's `{ start }` /
      `{ due }` / `{ start, due }` patch (`GanttDragHandler.ts:120-127`)
      (`src/views/calendar-timeline-renderer.ts`, `src/views/calendar-timeline-gantt.test.ts`)
      — red first: the two drag tests ("patches only the due date when the right edge is
      dragged" / "patches only the start date when the left edge is dragged") failed on the
      first harness run (`TypeError: Cannot read properties of undefined` — the mock could not
      dispatch drag events; fixed by giving the test document listener storage). After reading
      `updateEventDates` (`database-view.ts:4304-4305` gates the writes by `changedEdge`), the
      write layer already patched one cell per edge, but the right-edge payload still carried a
      geometry-derived `startDateKey` where the reference's patch is `{ due }` only.
      — closed: the change payload for a right-edge drag now anchors the type-required start on
      the event's own start date key, passed in through `GanttBarDragOpts`
      (`calendar-timeline-renderer.ts:89-104, 1495-1506`; call sites `:1258, 1276`), so the
      untouched edge is never a value the drag produced; both drag tests pin the contract
      (one cell written per edge, `changedEdge` correct).
- [x] T027 Expand/collapse all batches through one persistence call when the view offers it,
      instead of one async write per parent row (`GanttView.ts:326-331`)
      (`src/views/calendar-timeline-renderer.ts`, `src/views/calendar-timeline-gantt.test.ts`)
      — red first: "batches expand/collapse all through one persistence call when the view
      offers it" — `AssertionError: expected [] to have a length of 1 but got +0` — the
      pre-fix `setGanttAllCollapsed` fired `toggleSubtaskCollapsed` once per parent row
      (was `calendar-timeline-renderer.ts:794-800`), and each call mutates the config and
      refreshes the view (`database-view.ts:10926-10932`).
      — closed: new action seam `setSubtaskCollapsedMany(rows, collapsed)` on
      `CalendarTimelineRendererActions` (`calendar-timeline-renderer.ts:226-229`), preferred by
      `setGanttAllCollapsed` (`:818-828`) with the per-row toggle as fallback. The
      `database-view.ts` implementation of the batch action (one config mutation, one refresh)
      is out of this leg's file scope and is the orchestrator's next dispatch.
- [x] T028 Control-bar vocabulary: segmented/today/expand/collapse are bare `<button>`s and the
      add-subtask control is the reference `IconButton` shape
      `div.clickable-icon.extra-setting-button.pm-icon-btn` (`SegmentedControl.ts:20-30`,
      `ButtonComponent`, `IconButton.ts`, `TaskLabelRenderer.ts:130-137`)
      (`src/views/calendar-timeline-renderer.ts`, `src/views/calendar-timeline-gantt.test.ts`)
      — red first: the T019 parity tree —
      `AssertionError: expected 'div.pm-gantt-view\n  div.pm-gantt-con…' to be
      'div.pm-gantt-view\n  div.pm-gantt-con…'` — the expected tree asserts the reference
      shapes; the pre-fix markup carried `clickable-icon` on the buttons and a `<button>`
      add-subtask (was `calendar-timeline-renderer.ts:765, 774, 780, 786, 892`).
      — closed: bare buttons with `mod-cta` for the pressed scale (`:763-793`) and the add
      subtask as the IconButton div with the reveal-on-hover modifier (`:894-898`). The
      coarse-pointer hit-area rule must follow: its selectors
      (`styles.css:18011-18012`) still name `button.clickable-icon` / `button.pm-icon-btn`
      and no longer match — the CSS-lane verifier owns that edit.
- [x] T029 Dead "Custom column width" control hidden behind the local-extension gate, with a
      visible `timelineLocalExtensions` toggle in the options popover
      (`src/views/calendar-timeline-toolbar-renderer.ts`, `src/i18n.ts`,
      `tools/screenshots/scenarios/temporal.mjs`)
      — evidence: `timelineCustomUnitWidth` is read only by the local path
      (`calendar-timeline-model.ts:208-227`, `resolveTimelineUnitWidth`), and the reference
      gantt has no such control; the popover previously rendered the switch and slider
      unconditionally (was `calendar-timeline-toolbar-renderer.ts:206-231`). No failing
      assertion was writable in the leg's named test files (the popover has no DOM test
      harness in scope), so the red is the dead-path grep rather than a test.
      — closed: `renderLayoutContent` gates the custom column width rows on
      `timelineLocalExtensions === true` and renders the new toggle above them
      (`calendar-timeline-toolbar-renderer.ts:204-228`); i18n keys
      `viewConfig.timelineLocalExtensions` and `undo.timelineLocalExtensionsConfig` in all
      three locale blocks (`src/i18n.ts:458, 877, 2149, 2568, 3816, 4230`); the
      `timeline-toolbar-options` fixture mirrors the new layout section
      (`temporal.mjs:1640-1658`).
- [x] T030 Phone label column, milestone anchor, fixtures and bench
      (`src/views/calendar-timeline-renderer.ts`, `src/views/calendar-timeline-gantt.test.ts`,
      `tools/screenshots/scenarios/temporal.mjs`,
      `tools/screenshots/scenarios/temporal-tick-parity.test.mjs`,
      `tools/bench/timeline-render-bench.ts`)
      — phone (orchestrator decision D-phone): red first — "starts the label column at 160px on
      phone and 280px on desktop" — `AssertionError: expected '280px' to be '160px'` — and
      "resizes the label column through pointer events with capture" —
      `AssertionError: expected [] to include 7` (the pre-fix handle was mousedown-based and
      never captured). Closed: `GANTT_LABEL_PHONE_WIDTH` (`calendar-timeline-renderer.ts:68-71`),
      the label column starts at 160px when the body carries `is-phone` and 280px otherwise
      (the desktop constant `TIMELINE_REFERENCE_LABEL_WIDTH` is untouched, `:697-703`), and the
      resize handle is pointer-event based with `setPointerCapture` (`:958-998`) so touch can
      narrow the column; both asserted in `calendar-timeline-gantt.test.ts`.
      — milestone anchor: red first — "anchors the milestone on the due date when both dates
      exist, like the reference" — `AssertionError: expected '1768.5,198 1780.5,210
      1768.5,222 1756…' to contain '1786.5,'` — the pre-fix diamond anchored on the start field
      (was `calendar-timeline-renderer.ts:1272, 1349`). Closed: diamond, guide line and label
      use `endDateKey ?? startDateKey` (`:1322-1331, 1400-1403`), the reference's `due ?? start`
      (`GanttTaskBarRenderer.ts:278, 313`).
      — fixtures: `TIMELINE_FIXTURES` unit widths are now the reference/renderer values
      (day 44 / week 22 / month 9 / quarter 5 / year 2, `temporal.mjs:749-760`), the day scale
      draws day columns with unpadded day-of-month labels (`:853-870`), the header draws the
      month/year top band at every scale, and `temporal-tick-parity.test.mjs` imports
      `TIMELINE_RANGE_DAY_WIDTH` and fails on any of these (`:25, 305-322, 416-459`).
      — bench: `tools/bench/timeline-render-bench.ts:64-72` anchors the event span around the
      current date (`EVENT_START = addDateKeyDays(getLocalDateKey(new Date()), -4)`; neither
      `tools/live/render-assertion-harness.ts` nor `tools/screenshots/capture.mjs` freezes a
      "today", so a fixed past span is not an option) and `:141-149` spreads progress, a
      milestone and a dependency through the rows, so the constructed captures show bars,
      progress, a milestone and an arrow on screen after the first-paint scroll to today.
      — manifest note: the `timeline-view-*` note text no longer claims the viewport-centred
      window is production behaviour (`temporal.mjs:1340-1341`); it is fixture geometry, and
      the local viewport-centred window is gated behind `timelineLocalExtensions`.
- [x] T031 `setSubtaskCollapsedMany` seam: the batch expand/collapse-all action T027 declared on
      `CalendarTimelineRendererActions` had no host binding, so `renderer.setGanttAllCollapsed`
      always fell through to the per-row `toggleSubtaskCollapsed` loop
      (`src/views/database-view.ts`, `src/views/embedded-database-renderer.ts`,
      `src/views/database-view.test.ts`, `src/views/embedded-database-renderer.test.ts`)
      — red first, both suites: "setSubtaskCollapsedMany writes every row in one mutation and
      renders once, unlike N toggleSubtaskCollapsed calls" —
      `AssertionError: expected undefined to deeply equal { 'root.md': true, 'a.md': true }` —
      the action was unwired, so `config.subtaskCollapsed` never changed.
      — closed: `setSubtaskCollapsedMany(config, rows, collapsed)` on both classes builds one
      merged `config.subtaskCollapsed` map covering every row, then calls
      `scheduleConfigSave()`/`refresh()` (database-view) or
      `persistEmbeddedConfigLocally()`/`renderResults()`/`saveEmbeddedConfigInBackground()`
      (embedded) exactly once — matching the reference's `setAllCollapsed`
      (`GanttView.ts:326-331`: mutate every task in place, persist once, render once) — and is
      wired into each class's `calendarTimelineRenderer` actions object only (board keeps the
      per-row `toggleSubtaskCollapsed`; `CalendarTimelineRendererActions` is the only interface
      that declares the batch seam).
- [x] T032 CSS lane fidelity leg (D1, D14, coarse-pointer hit-area) — see `implementation-summary.md`
      for the full D-finding-to-selector mapping
      (`styles.css`, `tools/lane/css-lane.json`)
      — (a) `.pm-hidden`/`.pm-no-shrink`/`body.pm-resize-active`/`.pm-glyph-icon`/
      `.pm-gantt-right::-webkit-scrollbar*` copied verbatim from the reference's
      `utilities.css`/`widgets.css`/`task-editor.css` — none existed in `styles.css`, so
      `preview.addClass("pm-hidden")` (`calendar-timeline-renderer.ts:1355`) never hid the
      empty-row snap-preview bar, which painted on every undated row from first render (D1).
      — (b) the coarse-pointer hit-area rule's two selectors
      (`.pm-gantt-controls button.clickable-icon`, `.pm-gantt-label-row button.pm-icon-btn`)
      stopped matching once T028 made the controls-bar buttons bare and T023's port made the
      add-subtask affordance a `div.clickable-icon`; rewritten to
      `.pm-gantt-controls button` / `.pm-gantt-label-row .clickable-icon` with the same
      28px floor, no dimension change.
      — (c) `.pm-gantt-view`'s entry rule (font-family/color) and `.pm-segmented` scoped under
      `.note-database-container` (descendant form — the class sits on a child of the container,
      `renderTimeline`'s root is `container.createDiv`, so the compound
      `.note-database-container.pm-gantt-view` form would never match), the same narrow
      precedent as the board block's `.pm-kanban-view` custom-property rule (D14) — not a full
      re-prefix of every `pm-gantt-*` selector in the copied block.
      — verification: `touch-targets.mjs` constructed pass 367 under 28px, exactly the recorded
      baseline (0 new) — without (b) this regresses toward the ~9974 shape this file's
      `ganttPortRaiseHistory` already documents for the same root cause. Lane released
      (`css-lane.json` history), 40 changed captures named and read.
- [x] T033 Bench date-overflow fix, found verifying T030's captures: `eventDate(i)`'s
      day-of-month string arithmetic
      (`Number(EVENT_START.slice(8,10)) + (i % EVENT_WINDOW_DAYS)`) never rolled into the next
      month, so the now-today-relative `EVENT_START` silently produced invalid dates like
      `"2026-08-32"` whenever "today" fell in a month's last 9 days — `normalizeDateKey` then
      failed to parse them and `buildCalendarTimelineEvents` dropped the row's event entirely,
      leaving 90% of the constructed-timeline capture's rows with no bar, no milestone, no
      dependency arrow
      (`tools/bench/timeline-render-bench.ts`, `tools/bench/timeline-render-bench.test.mjs`)
      — red first: `eventDateFrom("2026-08-31", 1)` expected `"2026-09-01"`, threw
      `TypeError: eventDateFrom is not a function` (function did not exist).
      — closed: `eventDate` now delegates to an exported pure `eventDateFrom(start, i)` built on
      `addDateKeyDays` (real UTC calendar rollover, already imported for `EVENT_START`) instead
      of hand-rolled day-string arithmetic; four tests pin month rollover, year rollover, the
      offset-0 identity, and every offset in the window from a month-end anchor.
      — also closed the `replay.mjs` claim this fixture rewrite broke: the retired
      "day fixture centres on pinned now / bare hour, not HH:00" assertion read
      `timelineDynamicFixture(...).startMinutes`, a field `temporal.mjs` no longer sets since
      T030 replaced the hour-based day grammar with the reference's day-of-month one — `undefined
      + number` silently became `NaN`. Replaced with a claim pinning the current grammar
      (unpadded day-of-month label, 39/39 across both devices), not re-recorded to match NaN.
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase 6: Last Behaviour Divergences (2026-09-04, T034–T038)

- [x] T034 Week label modes: the reference's three `ganttWeekLabel` modes
      (`GanttHeaderRenderer.ts:8-23`, `types.ts:7,259` — `weekNumber` | `dateRange` | `both`,
      default `weekNumber`) become a timeline view-config option exposed in the options popover
      with i18n in all three locale blocks
      (`src/views/calendar-timeline-renderer.ts`, `src/views/calendar-timeline-toolbar-renderer.ts`,
      `src/data/types.ts`, `src/i18n.ts`, `src/views/calendar-timeline-gantt.test.ts`)
      — red first: "renders the three reference week-label modes in the week header, defaulting
      to week number" — `AssertionError: expected [ 'W9', 'W10', 'W11', 'W12', …(26) ] to deeply
      equal [ 'Mar 1–1', 'Mar 2–8', …(28) ]` — the pre-fix header ignored the config and always
      emitted `W{n}` (`calendar-timeline-gantt.test.ts:1073`, was
      `calendar-timeline-renderer.ts:1035-1060`).
      — closed: `GanttWeekLabel` and `timelineWeekLabel` (`types.ts:350, 705`); the header reads
      the mode exactly like the reference (`renderGanttWeekHeader` at
      `calendar-timeline-renderer.ts:1088-1114`, formats at `:1119-1134`, call site `:751` —
      same-month `"Mar 21–22"` en dash and cross-month `"Mar 30 – Apr 5"` spaced en dash);
      popover select at `calendar-timeline-toolbar-renderer.ts:229-237`; keys
      `viewConfig.timelineWeekLabel(.weekNumber/.dateRange/.both)` and
      `undo.timelineWeekLabelConfig` in all three blocks (`i18n.ts:459, 903-906, 2155, 2575-2578,
      3827, 4242-4245`). All three formats asserted including both dash formats
      (`calendar-timeline-gantt.test.ts:1040-1081`).
- [x] T035 "Depends elsewhere" chip: the tooltip-only chip now opens the reference's Menu
      (`TaskLabelRenderer.ts:106-123`) listing each external dependency and opening its file on
      click, through a new `openDependencyFile` action seam implemented in both hosts
      (`src/views/calendar-timeline-renderer.ts`, `src/views/database-view.ts`,
      `src/views/embedded-database-renderer.ts`, `src/views/calendar-timeline-gantt.test.ts`,
      `src/views/embedded-database-renderer.test.ts`)
      — red first: "opens the reference dependency menu from the depends-elsewhere chip, opening
      each file on click" — `AssertionError: expected [] to have a length of 1 but got +0` — the
      pre-fix chip only carried a tooltip (`calendar-timeline-gantt.test.ts:1110`, was
      `calendar-timeline-renderer.ts:925-930`).
      — closed: chip click builds the Menu with one `link-2` item per path and
      `showAtMouseEvent` (`calendar-timeline-renderer.ts:954-976`), seam declared at `:236`;
      `database-view.ts:433-436` opens the note in a tab (precedent `:3687`), the read-only embed
      navigates through its open-note path (`embedded-database-renderer.ts:219-224`) — navigation
      is not a record mutation, so it stays wired where `moveSubtask`/`updateEventDates` are
      deliberately not. Menu items asserted (`calendar-timeline-gantt.test.ts:1087-1120`) plus the
      embed binding (`embedded-database-renderer.test.ts:374-382`).
- [x] T036 Add-subtask: the label-row plus button routes to the host's record-creation path with
      the subtask relation pre-linked (child born with `parentId` + placement rank, then appended
      to the parent's `subtaskIds`), replacing the generic row-menu call, through a new
      `createSubtaskRecord` action seam
      (`src/views/calendar-timeline-renderer.ts`, `src/views/database-view.ts`,
      `src/views/calendar-timeline-gantt.test.ts`, `src/views/database-view.test.ts`)
      — red first: "routes the label-row plus button to the create-subtask seam with the parent
      row" — `AssertionError: expected [] to deeply equal [ 'Alpha.md' ]`
      (`calendar-timeline-gantt.test.ts:1140`, was
      `calendar-timeline-renderer.ts:936-940`); host red: "createSubtaskRecord creates the child
      note pre-linked and appends it to the parent's subtaskIds" —
      `AssertionError: expected "vi.fn()" to be called 1 times, but got 0 times`
      (`database-view.test.ts:322`).
      — closed: plus button prefers the seam with the row menu as fallback
      (`calendar-timeline-renderer.ts:984-992`, seam at `:240`); `DatabaseView.createSubtaskRecord`
      creates through `createBlankEntry` with `parentId`/`subtaskRank` defaults, then writes the
      parent's list through the relation write path (`database-view.ts:437, 10931-10950`); the
      read-only embed's timeline deliberately does not wire it, matching the existing
      `moveSubtask`/`updateEventDates` convention (`embedded-database-renderer.ts:213-215`).
      Seam call and relation payload asserted (`database-view.test.ts:316-339`: created
      frontmatter `parentId: "root.md"` + rank, parent update
      `{ parentId: null, subtaskIds: ["a.md","b.md","Tasks/new-child.md"], subtaskRank: null,
      collapsed: null }`).
- [x] T037 Undo/redo keys: the reference's document-level Ctrl+Z / Shift+Ctrl+Z / Ctrl+Y
      (`GanttView.ts:197-217`) wire to this plugin's existing bounded record-edit history stack
      (`DatabaseView.historyStack`/`redoStack`, `replayHistory`) for date/drag/link changes made
      from the gantt, through a new `undoGanttEdit` action seam
      (`src/views/calendar-timeline-renderer.ts`, `src/views/database-view.ts`,
      `src/views/calendar-timeline-gantt.test.ts`)
      — red first: "routes Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y to the host history stack through the
      actions seam" — `AssertionError: expected [] to deeply equal [ 'undo', 'redo', 'redo' ]`
      (`calendar-timeline-gantt.test.ts:1174`, was `calendar-timeline-renderer.ts:759-765`, the
      keydown handler only knew Escape; the scope-registered `Mod+z` in
      `database-view.ts:1441-1443` never fires when focus sits on the gantt's non-focusable
      bars/SVG, so the reference's document-level gate was the missing piece).
      — closed: the gantt's document keydown now implements the reference's shape — leaf-active
      gate, drag-in-progress suppression, `ctrlKey || metaKey` + `z`/`shift+z`/`y` routing to
      `undoGanttEdit("undo"|"redo")` (`calendar-timeline-renderer.ts:762-796`, seam at `:243`) —
      plus the host's own editing guard (input/inline-editor/modal keeps its undo, mirroring
      `handleHistoryShortcut` at `database-view.ts:1644-1653`); `DatabaseView` binds it to
      `undoLastEdit`/`redoLastEdit` (`database-view.ts:438-441`); the read-only embed has no
      record-edit history, so the seam stays unwired there and the keys fall through untouched.
      Seam routing, inactive-leaf/drag suppression and the editing guard asserted
      (`calendar-timeline-gantt.test.ts:1162-1225`); date drags already push history through
      `applyCellChanges(…, t("undo.timelineDates"))` (`database-view.ts:4344`), so Ctrl+Z after a
      gantt drag restores the previous dates through the host stack.
- [x] T038 Verification pass on an external `cli-devin` leg (T034–T037, landed uncommitted) plus one
      wart it named but did not close: undoing a created subtask left a dangling id in the parent's
      `subtaskIds` (`src/views/database-view.ts`, `src/views/database-view.test.ts`,
      `tools/screenshots/scenarios/temporal.mjs`, `tools/screenshots/scenarios/temporal-tick-parity.test.mjs`)
      — claims re-verified fresh rather than trusted: `tsc` 0, `vitest` 1003/1003 (devin's own count,
      confirmed before any further edit), `lint` 172=172 against `046d133`'s own baseline in this
      worktree, `scan-comments` PASS. Each fix read line-by-line against the reference: week-label
      formats match `GanttHeaderRenderer.ts:8-23` exactly (same-month en dash, cross-month spaced en
      dash, `weekNumber` default); the keydown handler is removed on teardown
      (`calendar-timeline-renderer.ts:796`, pushed onto `ganttCleanupFns`) and does not fire while an
      editor/input/modal has focus (`:777-780`); the elsewhere-menu items call `openDependencyFile`,
      which both hosts wire to a real open (`database-view.ts:433-436`,
      `embedded-database-renderer.ts:219-224`); add-subtask leaves the relation consistent (child
      `parentId`, parent `subtaskIds`, asserted at `database-view.test.ts:316-339`) — **except** the
      subtask-undo wart devin's own tasks.md/implementation-summary never named: `createBlankEntry`
      pushes its own single-file `"created"` history entry for the child
      (`database-view.ts:4111,4124`), and `createSubtaskRecord`'s separate `updateFrontmatter` call
      on the parent carried no history entry of its own at all — undoing the file creation trashed
      the child but left its path stranded in the parent's `subtaskIds`, and the append itself was
      never undoable in isolation either.
      — red first: "createSubtaskRecord folds the parent's subtaskIds write into the same history
      entry as the file creation, so one undo reverts both" —
      `AssertionError: expected 'created' to be 'cells'` (`database-view.test.ts:360`, the
      pre-fix `historyStack[0]` stayed the bare `{ type: "created", file }` entry `createBlankEntry`
      pushed, with the parent write not represented anywhere in it).
      — closed: after the parent write, `createSubtaskRecord` folds `createBlankEntry`'s own
      `"created"` entry in place into a `"cells"` entry carrying both `createdFiles` (the child) and
      a single `subtaskIds` `CellEditChange` (old value pre-append, new value post-append) for the
      parent (`database-view.ts:10955-10971`) — the existing, already-exercised
      `applyCellHistoryEntry` replay path (used by every other cell edit's undo/redo) reverts the
      write before removing the created file on undo, and restores the file before reapplying the
      write on redo, with no new replay logic needed. One Ctrl+Z now reverts the whole subtask
      creation atomically; asserted via `historyStack` shape, not just the forward write
      (`database-view.test.ts:349-368`).
      Fixture-contract, red first: the `timeline-toolbar-options` hand fixture had no Week label row
      at all, so `describe("timeline toolbar options fixture mirrors the week-label select", …)` —
      "shows the reference week-label select, defaulting to week number, using the shared
      dropdown-row markup" — failed on the first assertion,
      `expect(markup).toContain('<span class="db-dropdown-field-label">Week label</span>')`
      (`temporal-tick-parity.test.mjs:123`, added at `:108-146`). Closed by adding
      `dropdownRow(ICON.hash, "Week label", "Week number")` to the fixture's Layout section, in the
      real renderer's order — after Column width, before Slot duration
      (`tools/screenshots/scenarios/temporal.mjs:1582`, `ICON.hash` at `:70`); order and content
      asserted against the renderer source's own `t("viewConfig.timelineWeekLabel"...)` keys and
      default (`temporal-tick-parity.test.mjs:120-146`). The constructed
      `constructed-timeline-toolbar-options` scenario mounts the real popover and needed no fixture
      change — it showed the new row automatically once recaptured.
      Behaviours a static capture cannot show: the elsewhere-menu's click-to-open and the undo
      keys' interaction with a live history stack are proven by the vitest seams above (real DOM
      event dispatch against the actual renderer/host classes), not by a screenshot. Extending
      `tools/live/constructed-state-assertions.mjs` to drive either through the render-assertion
      harness was investigated and declined: the harness's `obsidian` stub declares `Menu` explicitly
      `outOfScope` (`tools/storybook/obsidian-stub.mjs:130`, throws on construction — a pre-existing,
      unrelated boundary, not something this task's scope extends), so dispatching the chip's click
      would throw rather than prove anything; and the harness's `fileViewTimelineBag()`
      (`tools/live/render-assertion-harness.ts:695-717`) wires every action as an inert `() =>
      undefined` with no host `historyStack` behind it, so there is no state for an undo to restore
      even if `undoGanttEdit` were wired in. Recaptured (`npm run screenshots`, 356 entries); read
      all 4 `constructed-timeline-toolbar-options` and all 4 `timeline-toolbar-options` captures
      (Week label row present, `Week number` value, correct position) plus `timeline-view-desktop-dark`
      (untouched by the recapture — not even byte-different — confirming the default `weekNumber`
      render is unchanged) and the two other week-scale-adjacent captures the recapture moved bytes
      on (`timeline-view-mobile-{dark,light}`, `timeline-view-quarter-desktop-dark`: `pixelHash`
      identical to `HEAD`, restored). 17 further byte-only re-encode captures across board/calendar/
      table (unrelated to this leg) also restored to `HEAD` bytes, manifest `bytes` hand-patched to
      match. `screenshots:verify`: 356/356 current. Separately, `npm run gate` surfaced two red
      checks pre-dating this leg's own edits: `css-lane` (the prior release's own `baselineHash`,
      `3110493a1a0e`, matched no state of `styles.css` this repository's history contains — commit
      `4cb21470`'s own lane update recorded neither its parent's hash nor its own committed content's
      hash, `26e134e61c3c`, confirmed via `git show 4cb21470:styles.css | shasum`) and `evidence` (8
      of 16 `tools/live/*.json` artefacts measured against that same wrong hash). Neither was edited
      by hand: `css-lane.json` gained a reconciliation acquire+release pair correcting `baselineHash`
      to the tree's actual, unchanged content hash and naming the 8 real content-changed captures;
      each stale evidence artefact was re-run through its own generating tool per `evidence.mjs`'s
      own instruction. `npm run gate`: 25/25 green, re-observed after the reconciliation (first run:
      23 green, 2 red for the pre-existing reasons above).
<!-- /ANCHOR:phase-6 -->

---

<!-- ANCHOR:phase-7 -->
## Phase 7: AC-007 Fresh-Reviewer Closing Leg (2026-09-04, in-runtime, bounded closing scope)

This leg ran in-runtime (no external `cli-devin`/`cli-codex` dispatch) against a fresh AC-007
reviewer's read of `a78000c`: geometry, DOM, class vocabulary and the CSS copy were confirmed
faithful and every earlier divergence closed; the reviewer left eight code items (P1-A, P1-B,
P2-A/B/C/D/E/H) and three fixture items, each fixed red-first per the reviewer's own instruction.

- [x] T039 [P1-A] `timelineLocalExtensions`/`timelineWeekLabel` round-trip through `ViewConfig`
      persistence: neither key was in `data-source.ts`'s explicit parse/serialize key lists, so
      both settings were dropped on save and undefined on load
      (`src/data/data-source.ts`, `src/data/data-source.test.ts`, `src/views/embedded-database-renderer.ts`)
      — red first: `data-source.test.ts` "round-trips timelineLocalExtensions and timelineWeekLabel
      through toViewPayload/parseViewConfig" — `AssertionError: expected undefined to be true`
      (`data-source.test.ts:135`, `view.timelineLocalExtensions` came back `undefined` after a
      `parseDatabaseConfig` round trip). Closed: both keys added beside `timelineScale`/
      `timelineColumnSizeMode`/`timelineCustomUnitWidth` in `parseViewConfig`
      (`data-source.ts:1095-1096`) and `toViewPayload` (`data-source.ts:1318-1319`); the same
      omission existed in the embedded codeblock config path's explicit field copy and was closed
      there too (`embedded-database-renderer.ts:3832-3833`). Green after: `data-source.test.ts` 5/5.
- [x] T040 [P1-B] The toolbar's "Slot duration" select rendered at day scale unconditionally; its
      only consumer, `getTimelineSlotDuration`, is read only inside `renderTimelineLocal` — the
      row offered a setting the default (reference) render never consults
      (`src/views/calendar-timeline-toolbar-renderer.ts`, new `calendar-timeline-toolbar-renderer.test.ts`)
      — red first: "hides the Slot duration row at day scale when local extensions are off" —
      `AssertionError: expected [ 'Local extensions', … ] to not include 'Time slot duration'`
      (`calendar-timeline-toolbar-renderer.test.ts:108`). Closed: the row's gate now reads
      `config.timelineLocalExtensions === true && config.timelineScale === "day"`
      (`calendar-timeline-toolbar-renderer.ts:242`). Green after: both new gating tests pass
      (`calendar-timeline-toolbar-renderer.test.ts:99-121`).
- [x] T041 [P2-A] Label-row child order: the reference (`TaskLabelRenderer.ts:101-128`) emits the
      elsewhere chip before the progress span; the port emitted progress first
      (`src/views/calendar-timeline-renderer.ts`, `src/views/calendar-timeline-gantt.test.ts`)
      — red first: "orders the depends-elsewhere chip before the progress span, matching
      TaskLabelRenderer.ts's child order" — `AssertionError: expected 4 to be less than 3`
      (`calendar-timeline-gantt.test.ts:1141`, the chip landed after the progress span in Alpha's
      label row). Closed: the elsewhere-chip block moved above the progress-span block
      (`calendar-timeline-renderer.ts:950-976`). Green after: `calendar-timeline-gantt.test.ts` 22/22.
- [x] T042 [P2-B] The popover's "Layout" section heading was created by `createSection` then wiped
      by `renderLayoutContent`'s own `layout.empty()` on the very next line — pre-existing
      (`src/views/calendar-timeline-toolbar-renderer.ts`, `calendar-timeline-toolbar-renderer.test.ts`)
      — red first: "keeps the Layout heading after renderLayoutContent's own empty()/rebuild" —
      `AssertionError: expected [ 'Data', 'Start date', … ] to include 'Layout'`
      (`calendar-timeline-toolbar-renderer.test.ts:134`). Closed: a nested
      `db-chart-options-section-content` div now scopes the empty()/rebuild below the heading
      `createSection` adds, instead of onto the section that carries it
      (`calendar-timeline-toolbar-renderer.ts:160-164`). Green after: 3/3.
- [x] T043 [P2-C] `is-active`/`is-linking` were written onto the pm-gantt tree on every link click,
      with no matching rule there (`.is-linking` and `.db-timeline-link-dot.is-active` are both
      scoped to `.db-timeline`, and the reference's own `GanttLinkHandler.ts` toggles only
      `pm-gantt-link-dot--active` on the dot, never a root "linking" class)
      (`src/views/calendar-timeline-renderer.ts`, `calendar-timeline-gantt.test.ts`)
      — red first: "writes only the reference's own dot-highlight class on the pm-gantt tree, not
      the local-extension is-active/is-linking pair, matching GanttLinkHandler.ts" —
      `AssertionError: expected 'pm-gantt-link-dot is-active pm-gantt…' not to contain 'is-active'`
      (`calendar-timeline-gantt.test.ts:862`). Closed: both classes now gate on
      `this.timelineRoot?.hasClass("db-timeline")` (`calendar-timeline-renderer.ts:2140`), so the
      default tree keeps only its own `pm-gantt-link-dot--active` highlight. An existing test that
      had locked in the wart (asserting `is-active` present on the pm-gantt dot) was corrected in
      the same pass. Green after: `calendar-timeline-gantt.test.ts` 23/23.
- [x] T044 [P2-D] The coarse-pointer hit-area rule (`styles.css` ~18090-18108) was a local addition
      (not part of the verbatim `gantt.css` copy) left unscoped, so it would also match a real
      obsidian-pm plugin's identical classes if installed alongside this one (`styles.css`) — CSS
      lane: acquired (`tools/lane/css-lane.json` acquire entry, `baselineHash` `28b394491fdb`),
      edited, recaptured, read, released (`baselineHash` `e357f63d13ac`, `reviewed` naming all 26
      changed captures). Doc-only framing does not apply here: every selector in the block now
      carries the `.note-database-container` scope the entry rule (`styles.css:17628`) already
      gives `.pm-gantt-view` (`styles.css:18090-18108`). `check-lane.mjs` exit 0, "release names
      all 21 changed capture(s)" (5 of the 26 named moved bytes but not pixelHash/layoutHash, not
      owed by the release).
- [x] T045 [P2-E] A failed date-drag save left the bar sitting at the dragged position; the
      reference (`GanttDragHandler.ts:129-136`) calls `restore()` in the same `catch`
      (`src/views/calendar-timeline-renderer.ts`, `calendar-timeline-gantt.test.ts`)
      — red first: "restores the bar to its pre-drag position when the date save is rejected,
      matching GanttDragHandler.ts's restore()" — `AssertionError: expected '1647' to be '1656'`
      (`calendar-timeline-gantt.test.ts:987`, the bar's `x` stayed at the dragged value after a
      rejected `updateEventDates`). Closed: the rejection handler now calls `restore()` before the
      failure notice (`calendar-timeline-renderer.ts:1621-1624`). Green after:
      `calendar-timeline-gantt.test.ts` 24/24.
- [x] T046 [P2-H] `createSubtaskRecord`'s parent-linking write had no error handling: a throw left
      the just-created child file on disk, pre-linked via its own `parentId`, but never listed in
      the parent's `subtaskIds`, with `createBlankEntry`'s own `"created"` history entry stranded
      pointing at it (`src/views/database-view.ts`, `database-view.test.ts`)
      — red first: "createSubtaskRecord rolls back the created child and reports the failure when
      the parent link write throws, instead of orphaning it" — the child-creation promise itself
      rejected back to the caller (`promise rejected "Error: disk full" instead of resolving`,
      `database-view.test.ts:381`), with no revert and no report. Closed: the parent write is now
      wrapped in `try`/`catch` (`database-view.ts:10936` region); on throw it drops the stray
      `"created"` history entry, trashes the child file via `dataSource.trashNote`, and reports
      `errors.createFailed`. Green after: `database-view.test.ts` 7/7.
- [x] T047 Fixture fidelity (`tools/screenshots/scenarios/temporal.mjs`,
      `tools/screenshots/scenarios/temporal-tick-parity.test.mjs`): three divergences from
      production, each fixed red-first.
      *(a) Label column width:* the fixture hardcoded `width: 280px` on every device; production
      starts the label column at 160px on phone (`GANTT_LABEL_PHONE_WIDTH`,
      `calendar-timeline-renderer.ts:68-71`). Red: "uses the 160px phone width on the mobile
      fixture" — `AssertionError: expected '<div class="note-database-container">…' to contain
      'class="pm-gantt-left" style="width: 1…'` (`temporal-tick-parity.test.mjs:531`). Closed:
      `timelineDynamicFixture` now carries `isMobile`, and `renderBody` picks `TL_LABEL_WIDTH_PHONE`
      (160) or `TL_LABEL_WIDTH` (280) from it (`temporal.mjs:1193-1198, 1229-1231, 1305-1306`).
      *(b) Month-band label/parity:* every month band was labelled with the visible window's own
      start month and coloured by array index, instead of each band's own month and its own month
      parity (`renderGanttMonthBands`, `calendar-timeline-renderer.ts:1192-1210`). Red: "labels a
      month band with its own month/year and matches month parity…" —
      `AssertionError: expected '<g class="pm-gantt-header">…' to contain '>Apr 26<'`
      (`temporal-tick-parity.test.mjs:511`, the week fixture's April band still read "Mar 26" with
      the array-index `pm-gantt-band-even` class instead of April's own odd parity). Closed: each
      mapped band now derives its own `bandDate` from `fixture.start + band.offset` for both the
      label and the class (`temporal.mjs:1050-1074`). *(c) Slot duration at Week scale:* the
      `timeline-toolbar-options` hand fixture showed a "Slot duration" row while its own Data
      section read "Timeline scale: Week" — production only shows that row at day scale (T040).
      Red: "hides the day-scale slot-duration row at the fixture's Week scale…" —
      `AssertionError: expected '…' not to contain 'Slot duration'` (`temporal-tick-parity.test.mjs:142`).
      Closed: the row dropped from the fixture's Layout section (`temporal.mjs:1596-1600`); the
      Layout heading itself needed no fixture change (T042 was a real-renderer-only bug — the hand
      fixture's own `section()` helper never wiped it). Green after:
      `temporal-tick-parity.test.mjs` 120/120.
      **Verification (all three legs, this session):** `npx tsc --noEmit` exit 0; `npx vitest run`
      101 files / 1037 tests, 0 failed; `npm run lint` 172 problems (= `172` baseline, no new
      finding in any file this leg touched); `npm run lint:tools` 0 problems; `node
      tools/naming/scan-comments.mjs` PASS (398 files, 0 missing banners/sections, 0
      commented-out lines); `npm run screenshots` 528 entries (run twice — the first restore
      batch mistakenly included five genuinely-changed timeline captures, corrected by a second
      full recapture and a narrower restore); pixelHash-compared every moved capture against HEAD
      and visually read six representative pairs (`timeline-view-day-mobile-{dark}`,
      `timeline-view-desktop-dark`, `timeline-view-month-mobile-dark`,
      `timeline-subtask-tree-mobile-dark`, `timeline-toolbar-options-mobile-dark`,
      `constructed-timeline-toolbar-options-desktop-dark`) beside their `HEAD` copies before
      trusting the rest to the same deterministic code path; 7 genuinely unrelated re-encode/
      drift captures (`constructed-owned-menu-mobile-dark`, `constructed-icon-picker-desktop-
      {dark,light}`, `constructed-record-detail-desktop-dark`,
      `constructed-sort-panel-calendar-mobile-light`, `board-subtask-tree-mobile-light`,
      `board-view-desktop-light`) restored to `HEAD` bytes. `npm run gate`: first run 24 green/1
      red (`evidence`: 8 of 16 `tools/live/*.json` artefacts stale against the new `styles.css`
      hash from T044's CSS-lane edit); each stale artefact re-run through its own generating tool
      per `evidence.mjs`'s own instruction; second run 25/25 green. Committed `9e4d4b04`.
<!-- /ANCHOR:phase-7 -->

---

<!-- ANCHOR:phase-8 -->
## Phase 8: AC-007 In-Repo Confirmation and Residual Dispositions (2026-09-04, T048-T053)

This leg ran in-runtime against the tree at `30c4b746`, after Phase 7's closing leg (T039-T047,
`9e4d4b04`) landed. The reviewer ran none of the gantt legs.

- [ ] **T048** Fresh AC-007 in-repo verifier reads the recaptured timeline screenshots against the
      reference SOURCE with pixel measurements — REQ-007.
      **In-repo half MET 2026-09-04 (fresh reviewer, `30c4b746`, ran none of the gantt legs):** 60
      of 60 `pm-gantt-*` classes match the reference with zero divergence either direction
      (`grep`'d from `calendar-timeline-renderer.ts`'s `createDiv`/`createEl`/`ganttSvgElement`
      calls against `gantt.css`/`widgets.css`/`table.css`/`utilities.css`'s selectors); the copied
      CSS is byte-faithful (`gantt.css`'s 278 lines plus the widgets/utilities/table companion
      blocks); geometry measured from the recaptured screenshots matches the reference exactly —
      label column 280px desktop / 160px phone, row height 44px, header 56px, day-unit widths
      44/22/9/5/2px across the five scales, bar padding 8px, bar height 28px, corner radius 7px,
      milestone diamond 24px across, progress fill 62%, dependency-arrow marker 8x8 with `refX` 6 /
      `refY` 3; all seven of T023-T033's own closing-leg tests still exist and pass (39/39 across
      the four suites they name, tick parity 120/120), `npx tsc --noEmit` exit 0. Before-value for
      this same criterion: the first fresh read (`a00ad31`) found seventeen divergences (D1-D17);
      the second (`a78000c`) found two (P1-A, P1-B); this read found zero. The operator's own vault
      side-by-side compare remains open — tracked as row 38 in the parent `../roadmap.md` §4 and as
      an operator-only row in this packet's `goal.md`, never ticked by an agent. T048 stays
      unticked until both halves close, mirroring `038-board-kanban-port`'s own T12.
- [x] **T049** [P2-F disposition] Invalid-date rows keep a row band and no bar — accepted
      adaptation, not a reference divergence (`src/views/calendar-timeline-renderer.ts:~1298-1300`).
      REQ-003's local invalid-event repair is preserved unchanged by the 1:1 port: an invalid-date
      row still renders its row band with no bar, exactly as the pre-port renderer did, and the
      reference has no invalid-date case of its own to diverge from. No code change; recorded here
      because the fresh reviewer surfaced it and no prior task named it.
- [x] **T050** [P2-G disposition] Milestone label overpaints the month-band label on the default
      render path — reference-faithful by construction, not a regression; OPERATOR DECISION added.
      `GanttHeaderRenderer`'s month-band label paints at `y=18` and `GanttTaskBarRenderer`'s
      milestone label at `y=14`, on the same header SVG — the overpaint is a property of the
      reference's own two renderers sharing one coordinate space, reproduced faithfully by the 1:1
      copy, not a defect this port introduced. The 1.4.9/1.4.10 local fix this packet's own
      `spec.md` Status field records (`resolveTimelineMilestoneLabelPlacement`, moving a crowded
      label above its bar) is superseded by the verbatim copy on the default render path and no
      longer runs there (it still applies inside the gated `renderTimelineLocal` extensions path).
      Keeping the reference-faithful overpaint versus reinstating a local anti-collision fix on the
      default path is an operator call, not an agent one — added as row 39 (never-tick) in the
      parent `../roadmap.md` §4 and as a new operator-only row in this packet's `goal.md`. No code
      change; this task closes by recording the disposition and adding both rows, not by resolving
      the decision.
- [x] **T051** [P2-I disposition] Fixture band parity — already closed by T047(b), never named by
      id. The per-band month-parity gap the reviewer flagged is the same defect T047's own part (b)
      already fixed (`renderGanttMonthBands` deriving each band's own month/year for both label and
      parity class, `tools/screenshots/scenarios/temporal.mjs:1050-1074`) — confirmed unchanged and
      still green (`temporal-tick-parity.test.mjs` 120/120). No further code change; this task
      exists only to give the disposition a task id, since T047's own entry never cited "P2-I".
      *Follow-up noted, not actioned this leg:* the doc comment at
      `calendar-timeline-renderer.ts:~884` describing the label row's children omits the
      depends-elsewhere chip T035 added; a comment-only edit re-keys 56 render-assertion captures
      by content hash, so it is deferred to the next real code change that touches that file rather
      than paid for on its own here.
- [x] **T052** [T050 resolution] Operator decided (2026-09-04, `roadmap.md` §4 row 39): "Reinstate
      local fix" — a local anti-collision fix for the milestone-label-over-band-label overpaint is
      reinstated on the reference gantt's default render path. This is REQ-007's one deliberate
      divergence from the 1:1 copy, recorded in `acceptance-criteria.md`'s AC-007 divergence list.
      Red first: a new `calendar-timeline-gantt.test.ts` case places a milestone due on a visible
      month's first day (its centred label lands 16px from that band's own left-anchored label) and
      asserts the milestone label leaves the reference's plain `y=14` baseline and carries a raised
      modifier — failed at `y="14"` against the unmodified renderer.
      Ported (not copied verbatim, since the reference has no such case to copy from) the
      estimate-then-move shape `resolveTimelineMilestoneLabelPlacement`/
      `getTimelineMilestoneLabelWidthUnits` (`calendar-timeline-model.ts`) already use for the local
      renderer's own milestone-vs-next-bar collision: `renderGanttMonthBands`/`renderGanttYearBands`
      (`calendar-timeline-renderer.ts:1250-1301`) now return each band label's own x/text instead of
      only drawing it, threaded through the five per-scale header dispatchers (`:1092-1244`) to
      `renderGanttMilestoneLabels` (`:1519-1570`), which estimates both labels' spans by character
      count (no real text metrics exist for an unmounted SVG string) and, when they overlap, moves
      the milestone label from `y=14` to `y=8` and adds `.pm-gantt-milestone-label--raised` (new
      `styles.css` rule, CSS lane `037-timeline-gantt-port`: a background-color text stroke for
      legibility). The guide line's own start needed no matching change — it always begins at the
      header's bottom edge, never inside the 0-24 band strip the raised label stays within.
      The hand-authored `temporal.mjs` fixture (`timeline-view-*` captures) was checked against the
      same crowd heuristic across all five scales/two devices and produces no collision in any of
      them, so it needed no update — confirmed unchanged by the recapture.
      10 real content-changed captures (`constructed-timeline{,-day,-subtask}` × desktop/mobile ×
      dark/light where applicable) opened and read directly: "row-1"'s milestone label (bench date
      lands on a September month boundary) now stacks cleanly above "SEP 26" instead of overpainting
      it, confirmed against the HEAD-committed PNG before/after. `pixelHash` read all ten as
      unchanged (its coarse tolerance misses a ~6px baseline move); `layoutHash` and a direct visual
      read both confirmed the change, so all ten are named in the CSS lane release regardless of
      what the hash comparator required (`tools/lane/css-lane.json` release note, this session).
      `npx tsc --noEmit` exit 0; `npx vitest run` 1038/1038 (101 files, was 1037); `npm run lint` 172
      (unchanged baseline); `npm run lint:tools` clean; `scan-comments` PASS; `npm run gate` 25/25
      green (8 evidence artefacts the `styles.css` edit staled — `cascade-audit`,
      `checkbox-appearance`, `checkbox-inventory`, `design-conformance`, `engine-parity`,
      `surface-census`, `token-census`, `view-census` — re-measured by re-running each tool, no
      number hand-edited).
- [ ] **T053** Reference-capture comparison, 2026-09-04 — the gantt read against a CAPTURE of the
      reference, not against its source. T048's in-repo half measured our port against
      `gantt.css` and the vendored TypeScript. This leg photographs the vendored plugin itself:
      `screenshots/project-manager/reference-gantt{,-subtask}-{desktop,mobile}-{dark,light}.png`,
      the same bench project our `constructed-timeline` captures show, mounted through the shared
      obsidian stub (`043-constructed-capture` T031, commit `bd3e2c0a`). Measurements below are from
      the desktop/dark pair at 2880x1800 and DPR 2, so one CSS pixel is two image pixels. The row
      stays unticked because it records a comparison and two open dispositions, not a fix.

| Element | Ours | Reference | Verdict |
|---------|------|-----------|---------|
| Controls bar | Day/Week/Month/Quarter/Year segmented with Week active, Today / Expand all / Collapse all right | identical set and order | match |
| Whole-view inset | 24 CSS px further right; the right-hand group ~32 px further left | flush at 16 px | host: `.note-database-container` padding plus its `scrollbar-gutter: stable`. Our kanban cancels this with a negative margin; the gantt does not |
| Label column width | 280 px desktop | 280 px | match |
| Header height / row height | 56 / 44 | 56 / 44 | exact — the label-column separators land on the SAME y in both (113, 157, 201, 245, ...) |
| Chart grid | a sampled vertical gridline column differs in 0 of 86,141 px | — | pixel-identical |
| Week bands and month label | W33-W39 plus `SEP 26`, same x | same | match (best cross-correlation at dx 0) |
| Today line and diamond | red dashed line and diamond at the header edge, same x | same | match |
| Bar geometry | one day = 22 px at week granularity, padding 8, radius 7 | same | match |
| Bar / milestone / label-dot colour | bar `var(--interactive-accent)` at 0.4 = rgb(61,64,108); dot `var(--text-muted)` | one colour for both, `#8a94a0` = rgb(73,77,82) | data model: our timeline has no per-status colour, and the reference cannot express its absence — `resolveProjectConfig`'s `withInUseExtras` mints its FALLBACK_COLOR for every in-use id, so it never reaches its own `--interactive-accent` fallback. The reference paints bar and dot from one colour; our port splits them |
| Progress fill | rows 0/4/8/12/16, same geometry | same | match |
| Dependency arrows | 3 curved dashed edges, 8x8 arrowhead, same anchors | same | match |
| Milestone label over the month band | present | present | reference-faithful, already dispositioned as T050 |
| Phone | label column 160 px, chart ~230 px, four week bands and every bar visible | label column stays 280 px, chart squeezed to ~90 px | our documented phone adaptation; the reference has none. This is the whole of the 10.4% (dark) and 36.0% (light) phone difference |
| Subtask variant | collapse diamond on row-0, two indented children, 62% | same | match |

      NO (d) FIDELITY GAP FOUND ON THE GANTT: every geometric value the reference draws, our port
      draws at the same pixel. Both open items above are dispositions rather than defects — the
      colour split is a data-model consequence recorded here for the first time against a real
      reference render, and the phone label width is this packet's own deliberate divergence. The
      two P2 gaps this comparison did find are both on the kanban and belong to
      `../038-board-kanban-port` T31. The operator's own vault side-by-side compare (parent
      `../roadmap.md` row 38) is untouched by this leg and stays open.
<!-- /ANCHOR:phase-8 -->

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
