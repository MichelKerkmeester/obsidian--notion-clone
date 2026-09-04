---
title: "Goal: Component Surface System"
description: "The durable directive for the component surface program, and the criteria that decide when it is done."
trigger_phrases:
  - "surface system goal"
  - "005 goal"
  - "component surface directive"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Gave every phase a nested goal and referenced them all from this DONE table"
    next_safe_action: "Land the WebKit sheet fix, the column-width and settings sheets, and cut 0.0.21"
    blockers:
      - "Only DONE rows 1 and 2 remain, both operator device confirmation: reports 29-43 and the five ported surfaces"
      - "031 reopened: entrance fix landed (c96467c9); a second bug is in flight on branches/001-sheet-webkit, a toolbar rebuild drops the sheet"
      - "044, 045, 046 opened 2026-09-04 from reports 40-43 and have landed nothing"
      - "043 T031 is done on worktrees/037-reference-captures, not on main"
      - "006-list-view-deprecation has four live children, none started"
      - "Earlier blockers are in the LOG and roadmap.md rather than here"
    key_files:
      - "roadmap.md"
      - "spec.md"
      - "design-system.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-parent"
      parent_session_id: null
    completion_pct: 71
    open_questions:
      - "Does report-driven scheduling replace the declared 009-first order"
    answered_questions:
      - "Reports 7 and 16 had no owning phase; 018 and 019 now own them"
      - "Every phase 000-046 now carries its own goal.md, and this DONE table references each open one"
      - "The timeline froze on a per-event touch probe; the calendar does not scale with rows"
      - "The deep review returned FAIL against 1.3.9: P0=1, P1=7, P2=7; 11 of 15 findings were doc drift in this packet"
      - "Operator shape: 1,000-3,000 rows at 80-100% fill; the 2,000ms budget breaks at 1,300"
      - "The output-number-format exclusion is the formula editor's only, so report 7 is in scope"
      - "The editable note body is accepted; its writer already goes through the per-file queue"
---
# Goal: Component Surface System

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Give the plugin's surfaces, sheets, checkboxes, rows and renderers one architecture,
and prove each operator-reported defect fixed **on the operator's device**, not in a harness.

**Why.** A release passed every gate and changed nothing on device. Then a quadratic render
regression shipped past 14 gates, 444 tests and 224 captures, because **no gate check built a
production renderer**. One now does (`026`).

### Decisions

| ID | Decision |
|----|----------|
| D1 | A check that does not drive the production path proves nothing. |
| D2 | A criterion needs a threshold and a failing number, observed red before green. |
| D3 | Shipped, verified and operator-confirmed differ. Only the third closes. |
| D4 | A fresh reviewer verifies. Never self-certify. |
| D5 | A criterion can fail a correct implementation. Check both ways. |
| D6 | Absent evidence is a finding only if the sample could have shown it. A pass on an empty set proves nothing. |
| D7 | A lane hold permits editing a file. It grants no scope. |
| D8 | A check reading a different environment than what it certifies is decoration. |
| D9 | Read the rule before theorising. Measure the leaf off the viewport origin. |
| D10 | Check the **mount**, not just the module: a check can bundle shipped code and still render a hand-written fixture. |
| D11 | One phase holds `styles.css`, released only after a recapture a person looked at. |
| D12 | Prefer **parity**: a harness cannot fake one without giving two independent producers the same wrong answer. |
| D13 | One completion figure per phase, **derived** from its `goal.md` criteria checklist — never judged, never two. Status carries shipped/verified/confirmed; a percentage cannot. `roadmap.md` §3.1-3.2. |
| D14 | ~~**External delegation, decided 2026-09-02.** Implement, debug and review through cli-codex on `gpt-5.6-luna` at `model_reasoning_effort=max`, `service_tier=fast`, `--sandbox workspace-write`; cli-opencode only when the task itself needs the browser; fallback cli-devin on `deepseek-v4-flash-max` (that exact id, its effort baked in), read-only audits first. Every external result is verified by a fresh in-runtime Opus agent that runs `npm run gate` and `validate.sh --strict` itself — a delegate's report is a claim, not a result (D4). **No browser number from a sandboxed or cloud lane is evidence**, the lesson the queued-lane note in §4 already paid for. Model ids are passed exactly as each transport spells them — codex `gpt-5.6-luna`, devin `deepseek-v4-flash-max`, which do not share a spelling — never a near-miss. The orchestrator never runs a sub-agent on Fable.~~ **2026-09-02, revised.** The order is now: (a) an initial pass through cli-devin on `deepseek-v4-flash-max` under `--permission-mode dangerous`, which the operator approved for this repo's worktree; (b) then `gpt-5.6-luna` at `model_reasoning_effort=xhigh` or `max`, `service_tier=fast`, through cli-codex or cli-opencode; (c) in-runtime verification is unchanged — a fresh agent runs the browser gate and `validate.sh` itself, because sandboxed and cloud lanes cannot reach Chrome. In-runtime delegates default to Sonnet 5 (xhigh may be used more freely than before); Opus is used only where it is genuinely better. Never Fable, never fork. **2026-09-02, the worktree named in (a) now exists:** `036`'s 20-iteration research loop runs in `.worktrees/003-obsidian-pm-harvest` on branch `worktrees/003-obsidian-pm-harvest` (`9642e43`), and the untracked `research/` in the main checkout is residue from a rejected launch rather than evidence. A devin lane's harness change for the board and gallery reds was verified in-runtime and committed as `c5566db`, which is the (c) leg working as written: the delegate's report was a claim until a fresh agent ran it here. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the phase's own `goal.md` first.** Each binds as if written here.

`roadmap.md` §4 maps report to phase, §5 state, §7 conflicts.

**Precedence.** Decisions outrank child detail, which outranks any summary. Name conflicts; never
resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] Every operator report is confirmed on device, **or deferred by the operator with the
      deferral recorded.** **Unticked again, because the tick used the wrong denominator.** It read
      16 of 16 while `roadmap.md` §4 had grown to **27 numbered rows** (1-16, 18-28) — three of
      which this session added. §4A dispositioned fifteen and covered 18-20 in prose; **reports
      21-28 are in neither state.**

      The error is worth naming precisely because of what preceded it. The commit that set this tick
      argued for reading a criterion against its own wording rather than a stricter one. It then
      read it against a **looser** one: "every operator report" means every row in the table, not
      the sixteen that existed when the sentence was written. Reading a criterion loosely is the
      same failure as reading it strictly, pointed the other way.

      Today, re-derived 2026-09-02 so the parts sum to the 27 rows in `roadmap.md` §4:
      **1 confirmed** (report 10, an accepted shortfall), **15 deferred with terms** in §4A's
      table, **3 more deferred in its prose** (18-20, the freezes 1.3.9 was cut for), and
      **8 in neither state** (21-28). The figure here previously read *12 in neither state*
      against the same eight rows — a third denominator error in the criterion written to record
      the first two. D3 still governs — only operator-confirmed closes a defect.

      **2026-09-02, same day: the denominator moved again.** `roadmap.md` §4 grew to **28 numbered
      rows** (1-16, 18-29) with row 29, a new operator report against 1.4.0 (drag handle inert on
      some sheets, no way to close others, one that appears then disappears then freezes the app —
      release-blocking, dispatched to `031-sheet-lifecycle-ownership` for diagnosis). The **8 in
      neither state** above is now **9** (21-29). Not re-ticked: this addition only widens the
      gap between confirmed and total.

      **2026-09-02, later the same day: three new device reports plus one bundled correction.**
      `roadmap.md` §4 grew to **32 numbered rows** (1-16, 18-33) with rows 30-33, all four from the
      operator's iOS device at 21:21-21:24: the view-switcher sheet's icon-wall rows (30, routed to
      `001`), the selection bar staying docked over a sheet and under an inline editor plus its
      missing singular string (31-32, both routed to `022`), and the record detail sheet not
      fitting content inside 100vh when it overflows (33, routed to `010`). The **9 in neither
      state** above is now **13** (21-33). Row 29 also gained a partial: the operator's *"Most
      sheets seem to work now tho"*, reported against the build after `98da630`/`0c92f4d`, is
      recorded in `roadmap.md` §4 as **partially confirmed on device** — sheets open and close —
      with the full discriminating sequence still owed, and the row stays open rather than ticked.
      Not re-ticked here either: four new rows in neither state widens the gap further, and a
      partial confirmation on one row is not the same as this criterion's "every report."

      **2026-09-02, later still: two releases, and the count does not move.** 1.4.0 was cut in
      `1e1d269` and 1.4.1 in `460d4d7`, the second carrying the report-29 fixes `98da630` (modal
      sheet chrome taken down on close, `pointercancel`, anchor tolerance) and `0c92f4d` (a long
      press consumes the click it caused). Reports 30-33 were recorded in `62c4fe7` with owners
      `001`, `022`, `022` and `010`, and their fix is an uncommitted code phase in the working
      tree. A cut release is a shipped state and an uncommitted phase is not even that, so this
      reads **1 confirmed of 32** exactly as before. Row 29's per-row confirmation is what would
      move it.
- [ ] Every view opens on device without freezing. Today only the table does. **2026-09-02:** 1.4.1
      carries sheet lifecycle fixes, not a view fix, so nothing here changed. The board and gallery
      remain the two views with an observed red and no verified green.
- [x] A gate check constructs a production renderer for **every** view. One lane does now, for
      List, Table, Board, Gallery, Calendar and Timeline — **6 of 22**, a ratchet, twelve
      scenarios driven by both action bags. Every view named in an operator report is asserted.
      **Unticked 2026-09-03T23:40:00Z, on a fresh audit read against the criterion's own wording
      rather than the looser "every view named in an operator report" it had settled for.**
      `src/data/types.ts:317` declares seven `DatabaseViewType` values — `table`, `board`,
      `gallery`, `list`, `chart`, `calendar`, `timeline` — and `chart` is a live,
      user-selectable view (`DEFAULT_VIEW_TYPES` in `settings.ts:78`, its own toolbar icon and
      view-switcher row in `toolbar-renderer.ts`), not a retired one. `tools/live/render-
      assertion-harness.ts` (1188 lines) imports and constructs `ListRenderer`, `TableRenderer`,
      `BoardRenderer`, `GalleryRenderer`, `CalendarRenderer` and `CalendarTimelineRenderer`;
      `grep -in chart` on that file returns nothing, so no gate lane ever constructs
      `chart-renderer.ts`. The calendar lane is narrower than its tick implied, too: it only
      builds `makeCalendarConfig(columns, "month")`, and `calendar-renderer.ts` supports
      `scale: "month" | "week" | "day"` (`:82`) — week and day are never constructed by any
      gate check either. `node tools/live/render-assertions.mjs`, `$?` read directly: `0`,
      26/26 assertions PASS, coverage stamped 6 of 22 (`tools/live/renderer-coverage.json`). The
      check is real and green for the six it covers; "every view" is not yet true.
      **Ticked 2026-09-04T03:40:00Z, landed `7e9fd27`.** All seven `DatabaseViewType` values are
      now covered: list, table, board, gallery, timeline, chart, and calendar at month, week and
      day. `node tools/live/render-assertions.mjs` disarmed: exit 0. Armed
      `RENDER_READ_CONTROL=per-item`: exit 1, 11 reds — chart 1630 against bound 48; calendar
      week 14 and day 1600 against bound 8; board/gallery 1601 and table 2003 against bound 8,
      carried from the earlier controls. Was: chart and calendar week/day uncovered, coverage 6
      of 22 renderer files; now 7 of 22 distinct renderers.
- [x] `SURFACE_PHASE=<phase> npm run gate` exits 0, read from `$?`, not a pipe. Was red on
      2026-08-29: the gate was 13 green, reported red by an external lane that could not reach
      Chrome. `SURFACE_PHASE=035-visual-pass-product-defects npm run gate`, `$?` read directly,
      not through a pipe: today 25 green, exit 0. **Re-verified 2026-09-03T23:40:00Z.**
      `SURFACE_PHASE=040-subtask-tree-port npm run gate`, `$?` read directly: `0`, 25 green, 0
      red. Bare `npm run gate`, `$?` read directly: `0`, the same 25 green, 0 red. No stray
      Chrome process before either run (`pgrep` empty). **Re-verified 2026-09-04T03:40:00Z.**
      `SURFACE_PHASE=042-harness-fidelity-and-replay npm run gate`, `$?` read directly: `0`, 25
      green. Bare `npm run gate`, `$?` read directly: `0`, the same 25 green. No stray Chrome
      process (`pgrep` empty).
      **Re-verified 2026-09-04T06:40:00Z (done-audit-4).** `pgrep -f "tools/screenshots/
      capture.mjs|tools/gate.mjs"` empty before each run. `SURFACE_PHASE=042-harness-fidelity-
      and-replay npm run gate`, `$?` read directly: `0`, 25 green, 0 red. Bare `npm run gate`,
      `$?` read directly: `0`, the same 25 green, 0 red.
- [x] `npm run replay` re-asserts every landed result against its recorded pre-fix number.
      `npm run replay` passes today — 8 of 8 held, exit 0 — but observed red: N/A — no earlier
      count recorded. `tools/live/replay.json`'s history carries no run where a claim's `held` was
      `false`, and the parent log records no earlier held-count either, so this tick has no red to
      cite. Left unticked: a tick needs its red. **Re-verified 2026-09-03T23:40:00Z, still open,
      gap widened.** `npm run replay`, `$?` read directly: `0`, `tools/live/replay.json` still
      shows the same 8/8 held. Its five covered phases are `000-surface-contract-and-truthful-
      harness`, `001-overlay-width-and-chrome`, `002-properties-panel`, `004-checkbox-ownership`
      and `005-content-row-rhythm` — none of this program's later landed work. `replay.json`
      carries no claim for report 29's fix (`98da630`/`0c92f4d`, owner `031`), reports 34-36's
      fix (`85ff504`, owner `031`), or any of the five port-phase landings: `037`
      (`0262386`+`55bff9b`, 1.4.4), `038-board-kanban-port` (`b9e2321`+`a6fcd31`, 1.4.5), `039`
      (`57043e7`+`1588576`+`d8a2508`, 1.4.6), `040` (`1d611db`+`00b7bd2`, 1.4.7 pending) and `041`
      (`cb9aedf`+`25ae3a9`, 1.4.6). Every one of those is a landed result with no recorded
      pre-fix number for replay to hold it against.
      **Re-verified 2026-09-04T03:40:00Z, narrowed, still open.** `replay.json` now carries
      claims for report 29 and reports 34-36 (delegated `031` claims) and both legs of phases
      `037`-`041` (10 claims, pre-fix audited). Missing: six open-row fix commits with
      documented reds but no replay claim — `7e36671` (038 board captures), `535373a` (040
      same-parent reorder), `3f143df` and `a251a43` (041 reduced motion), `fa58c7f` and
      `b29bf7f` (037 timeline open rows). A lane is adding them now.
      **Re-verified 2026-09-04T06:40:00Z (done-audit-4), narrowed further, still open.**
      `node tools/live/replay.mjs`, `$?` read directly: `0`, "replay: PASS — all 27 results
      still hold", `reversed: 0`. The six open-row claims above landed in `5fa0b0c`, all
      pre-fix-audited (T024: `7e36671: 0 -> 2`, `535373a: 0 -> 2`, `a251a43: 0 -> 1`,
      `3f143df: 0 -> 1`, `fa58c7f: 0 -> 4`, `b29bf7f: 0 -> 2`, each measured on `<sha>^` via
      `git archive`, never `git checkout`). Checked every landed result this audit named: report
      29 and reports 34-36 delegate to `sheet-teardown.json`/`sheet-rebuild.json` by design —
      `was`/`recorded` both read `0` because the assertion is artefact-presence-plus-failure-text,
      not a numeric diff; proven non-vacuous by the negative controls in `042/implementation-
      summary.md`'s Verification table (moving either artefact reds the lane), not by a
      differing number. Both legs of `037`-`041` (10 static claims) and the six open-row fixes
      above (6 more) all show `was` differing from `recorded`, confirmed by reading
      `replay.json` directly. One landed result in the named list still carries no claim:
      `7ca6cc2` — `037`'s fourth and last open row (day-scale fixture centring on the pinned
      `now`, `HH` tick-label suffix dropped), which this parent's own log calls "the last of its
      four remaining open product rows," the identical framing used for `fa58c7f`/`b29bf7f`.
      This row's own precedent already required a claim for a capture-only commit (`7e36671`
      touches no `src/` file either), so `7ca6cc2` is not exempt on that basis. Read
      `replay.mjs`'s existing `037` claims in full: both measure only
      `src/data/calendar-timeline-model.ts`/`src/views/calendar-timeline-renderer.ts` patterns
      (title window, first-tick transform, milestone-placement helper, the 32px phone-day
      branch, and the dependency-link/five-scale checks) — none reads `tools/screenshots/
      scenarios/temporal.mjs`'s day-branch centring or its tick-label suffix, so `7ca6cc2`'s fix
      is genuinely uncovered, not double-counted under an existing claim. `042`'s own four
      commits (`7e9fd27`, `5fa0b0c`, `bea1b1c`, `8759399`) are out of scope for a claim: none
      closes a documented open row in another phase's ledger the way `7e36671` did, and
      `replay.mjs` holding a claim against its own construction would be circular — the
      instrument cannot certify itself. Stays open on `7ca6cc2` alone.
      **Ticked 2026-09-04T09:10:00Z (done-audit-5).** The last gap closed: `7ca6cc2`'s fix
      (`037`'s day-scale fixture centring on the pinned `now`, dropped `HH` tick-label suffix) got
      its missing claim in `8a79ff8`. The claim measures two-digit day tick labels plus centred
      start minutes across both device widths: pre-fix `0`, recorded `574`. `node
      tools/live/replay.mjs`, `$?` read directly: `0`, "replay: PASS — all 28 results still hold",
      `reversed: 0` read from `replay.json` — 28 claims, up from 27. Every landed product result
      and every open-row fix this program has named now carries a claim with a differing pre-fix
      number; three lifecycle claims (report 29's sheet-chrome/pointercancel fix, reports 34-36's
      overlay-stack fix) delegate to the sheet-teardown/sheet-rebuild lanes by design, proven
      non-vacuous by negative controls rather than a numeric diff, per this row's earlier audit.
      Was 8 claims covering phases `000` through `005` only, 2026-09-03 audit; now 28.
- [x] No criterion's green depends on a value the harness supplies that a device would not — a
      pinned variable, a stubbed action, a hand-written mount, or an absent host stylesheet.
      **Ticked 2026-09-02, on an observed red verified in-runtime and committed as `c5566db`.** The
      board, gallery and table scenarios had no owned negative control, so their green proved the
      scenario ran rather than that it could fail. Armed, the controls read **1601 layout reads
      during render, bound 8** on board/embed and on gallery/embed, and **2003 layout reads, bound
      8, over 2000 rows** on table/embed, exit 1. Disarmed the same reads are **1, 1 and 3**, exit
      0. A delegate produced the change and a fresh in-runtime agent ran it here before this tick,
      per D4 and D14: a delegate's report is a claim, and this row waited for the result.
      **Unticked 2026-09-03T23:40:00Z.** The `c5566db` control above is real and stays true for
      the three scenarios it covers. A fresh audit checked the other three dependency classes
      this row's own wording names, none audited before now. **(1) pinned variable** —
      `tools/screenshots/runtime-vars.css` sets `--db-calendar-day-min-height`/`--db-calendar-
      month-week-min-height: calc((100vh - 150px) / 5)`; this program's own `039-calendar-
      parity-port` log already found that formula wrong — production's `getCellMinHeight()`
      (`calendar-renderer.ts:2196`) defaults to a fixed `112px`, config-driven, never
      viewport-derived. It does not reach `render-assertions.mjs` (which loads only
      `styles.css`), but it does reach every calendar screenshot capture. **(2) stubbed
      actions** — every member of `render-assertion-harness.ts`'s six action bags is a no-op
      (`openRow: () => undefined`, etc.); the row-3/4 green does not exercise them, but the bags
      are exactly the "stubbed action" this row names, unaudited until now. **(3) hand-written
      mounts** — `tools/live/touch-targets.mjs` and `tools/live/unstyled-links.mjs`, two of the
      25 lanes row 4's green counts, both `import { SCENARIOS } from "../screenshots/
      scenarios.mjs"` and call `scenario.html()`; `tools/screenshots/capture.mjs` (backing
      `screenshots-fresh`, `css-lane`, `device-parity`) uses the same fixtures. These are
      hand-authored HTML strings, not the constructed production renderer — the D10 risk this
      row exists to police, and this program's own visual pass already caught two real instances
      of it producing false defects (six siblings clipping mid-word, five single-glyph rows)
      before adding scenario-specific parity checks; those checks cover the two found defects,
      not a structural guarantee for the rest of `scenarios.mjs`. **(4) absent host
      stylesheet** — `tools/screenshots/theme.css` never declares Obsidian's own `.mod-cta`
      rule, so a capture of any primary-CTA button (`db-empty-action mod-cta`, etc.) never shows
      the host's real button styling; already recorded as an open row in `039/goal.md` and
      `039/implementation-summary.md`. (1) and (4) make a capture-based check show a value a
      device would not; (3) makes touch-target and unstyled-link counts depend on fixture markup
      a production render might not reproduce. Unticked rather than partially ticked, per this
      row's own "check both ways" framing (D5): a device dependency found anywhere in the set
      the wording names disqualifies "no criterion's green," not just the three scenarios
      `c5566db` armed.
      **Re-verified 2026-09-04T03:40:00Z, narrowed, still open.** Of the four dependency classes
      named above, two are REMOVED: (1) `tools/screenshots/runtime-vars.css`'s calendar
      min-height formula now matches production's `getCellMinHeight()` at a fixed 112px. (4)
      `tools/screenshots/theme.css` now declares `.mod-cta`, transcribed from Obsidian 1.13.4.
      Two stay open: (2)/(3) `touch-targets.mjs` and `unstyled-links.mjs`, plus the shared
      capture-pipeline fixtures, remain DECLARED in `042/tasks.md`'s provability record and back
      two of the 25 gate lanes that make row 4 green. Stays open on that bounded list.
      **Re-verified 2026-09-04T06:40:00Z (done-audit-4), narrowed further, still open.** (1) and
      (4) stay REMOVED, unchanged. (2)/(3) moved from DECLARED to DECLARED-AND-CROSS-VALIDATED
      for `touch-targets.mjs`/`unstyled-links.mjs` specifically: both now run a second pass
      (`8759399`) that mounts every scenario `render-assertions.mjs` knows through the identical
      bundle and mount path the render-assertion lane itself uses, measuring real `src/views`
      renderer output rather than fixture markup. That pass is not theatre — it found four real
      touch-target classes no fixture could see (`touch-targets-constructed-baseline.json`,
      `under: 8493`) and prints an explicit empty-sample caveat for `unstyled-links.mjs` per D6
      rather than a silent pass. But the fixture pass was supplemented, not replaced: both
      hand-written passes still count toward two of the 25 gate lanes' green, confirmed
      unchanged this run (fixture 264/279 and 112/70). Three more of the 25 lanes —
      `css-lane`, `screenshots-fresh`, `device-parity` — read only `tools/screenshots/
      scenarios.mjs`'s hand-written fixtures with no constructed-renderer counterpart at all;
      `check-lane.mjs` now compares captures by content (`pixelHash`/`layoutHash`, `bea1b1c`)
      rather than a raw byte diff, and specific scenarios (board empty-column/drop-language,
      timeline day/tick) are constrained by scenario-specific parity tests, but the fixtures
      themselves remain hand-authored HTML a device did not render. The dependency is DECLARED
      rather than hidden — named, bounded, and now partly cross-checked — but this row's own
      wording is unconditional ("No criterion's green depends on...") and, per the "check both
      ways" precedent this row already set (D5): a device dependency found anywhere in the named
      set disqualifies the tick, a declared-and-bounded dependency is still a dependency. Stays
      open on the fixture passes of these five gate lanes.
      **Re-verified 2026-09-04T10:40:00Z (done-audit-6), still open, verdict unchanged by the
      `043` landing.** `043-constructed-capture` landed `2ab4942`: nine constructed scenarios, 36
      captures, mounted through the same `buildRenderAssertionBundle()` seam `042` reused, read
      in-runtime and reproducing 0 of 312 `pixelHash`/`layoutHash` changes across two detached
      runs. Seven of `plan.md`'s eleven planned fixture-to-constructed pairs now carry
      `fixtureOf` inside `screenshots/manifest.json` (28 of 312 entries), and the 13 fixture-only
      scenarios this row's own audit already named stay registered and captured, confirmed
      present in both the registry and the manifest. Two of the three lanes done-audit-4 found no
      constructed-renderer counterpart for — `css-lane` and `device-parity` — do now read the
      constructed captures with zero code change: `check-lane.mjs`'s `contentChangedCaptures()`
      and `capture-device-parity.mjs`'s directory scan both already covered the shared manifest,
      so the constructed entries joined it for free (`043/goal.md`'s own AC rows for both, now
      ticked). `screenshots-fresh` (`verify.mjs`) does validate the 36 constructed entries' own
      freshness ("312 entries match their sources"), but the specific wiring this row named — a
      DECLARED scenario's staleness judged against its constructed counterpart's `sourceHashes` —
      stays unmet in `043/goal.md`'s own checklist. None of that closes the dependency this row
      polices, because the fixture pass those three lanes still run is not merely present, it is
      load-bearing: every bench column in the constructed captures is `"text"` — no select pill,
      currency, date format or completed-strikethrough — and every Obsidian icon draws as the
      stub's placeholder diamond, so the fixture captures remain the sole evidence for typed-state
      and icon rendering across all 7 declared pairs, read side by side
      (`043/implementation-summary.md` Known Limitation 3). The dependency is now DECLARED
      (`fixtureOf`) and bounded to those 7 pairs plus the 13 named fixture-only scenarios, rather
      than spread across all five lanes undifferentiated as it read in done-audit-3. But per this
      row's own "check both ways" precedent, a declared-and-bounded dependency is still a
      dependency, and this row's wording stays unconditional. **Stays open**, narrowed to: the
      fixture pass backing typed-state and icon fidelity in css-lane, screenshots-fresh and
      device-parity greens for the 7 declared pairs and 13 fixture-only scenarios. Closes only
      when an Obsidian stub renders real icons, or the constructed mount gains a typed bench-data
      option (`043/tasks.md` T004-T006, still pending). Observed today: 312 manifest entries, 36
      constructed, 7 of 11 declared pairs, 13 named fixture-only.
      **Re-verified 2026-09-04T05:40:00Z (done-audit-7), narrowed a second time, stays open.**
      `0af4ca6`/`bf67475` (main, equal to origin) landed `043`'s T004-T006 after `done-audit-6`
      audited the tree. Verified directly today, not carried over: `node tools/live/typed-data-
      assertions.mjs`, `$?` read directly: `0` — 3 of 3 typed markers with `captureData: true`, 0
      of 3 with it unset, on the same scenario. `REAL_ICONS` in `tools/storybook/obsidian-stub.mjs`
      carries 21 keys, counted directly. `grep -c fixtureOf tools/screenshots/scenarios/*.mjs`
      reads 7. For those 7 declared pairs the gap `done-audit-6` stayed open on is closed: both
      sides now show a real select pill, checkbox, currency figure and icon, so the remaining
      difference is curated content, not typed-vs-untyped rendering — read as a declared complement
      per D4 (the default bench data now actually reproduces the same state a device would show),
      not a device-value dependency. The stubbed action bags stay present but are confirmed inert
      rather than assumed so: `render-assertions.mjs` only reads `Object.keys(actions).sort()` for
      a bag-shape comparison and never invokes a member, and `touch-targets.mjs`/`unstyled-
      links.mjs` reference no action bag at all (`grep` empty) — no capture's `pixelHash`,
      `layoutHash` or measured geometry can differ because a bag member is a no-op, so this class
      is a named, declared residual in `042`'s provability record rather than a live dependency.
      Two gaps do not close, read directly rather than trusted from `043`'s own claim: (1) table's
      column builder (`render-assertion-harness.ts:1406`, `makeTableColumns(TABLE_COLUMNS)`) takes
      no `captureData` argument at all, unlike every other renderer branch, so `constructed-table`
      renders every cell through the plain-text stub regardless of the option — table's fixture
      (`fixtureOf: "constructed-table"`) stays the only place any check has shown a typed table
      cell. (2) chart's builder (`:1336`, `makeBoardColumns(CHART_COLUMNS, "text")`) hardcodes
      `"text"` unconditionally and aggregates rows into bars, so it has no per-row field to type at
      all, and chart never had a fixture either — a net-new scenario with no typed evidence
      anywhere. The 13 named fixture-only scenarios stand unchanged and their entries still count
      toward the same five gate lanes' (`css-lane`, `screenshots-fresh`, `device-parity`,
      `touch-targets`, `unstyled-links`) green with hand-authored markup, per this row's own
      "declared-and-bounded dependency is still a dependency" precedent (`done-audit-4`,
      `done-audit-6`). **Stays open**, narrowed a second time: from the 7-declared-pair
      typed-state/icon gap `done-audit-6` stayed open on, down to table's permanently untyped
      cells, chart's absent per-row typing, and the 13 fixture-only scenarios. Observed today: 312
      manifest entries, 36 constructed, 28 `fixtureOf` entries (7 pairs), 21 real icon names, 3 of 3
      typed markers, 0 of 312 entries moved on `043`'s own two detached runs.

      **Re-verified 2026-09-04T07:00:00Z (done-audit-8), narrowed a third time, stays open.**
      `425d552` (main, equal to origin) landed T027 after `done-audit-7` audited the tree. Verified
      directly: `node tools/live/typed-data-assertions.mjs`, `$?` read directly: `0` — 6 of 6 new
      markers (table's named select pill, checked checkbox, currency, date, relation icon; chart's
      per-row value field) PASS with `captureData: true`, all false without it, on
      `constructed-table` and `constructed-chart`; `constructed-list`'s original 3 markers
      unaffected. `grep -c fixtureOf tools/screenshots/scenarios/*.mjs` still reads 7 (core.mjs 4,
      temporal.mjs 3), unchanged — T027 typed table and chart without declaring a new fixture pair
      for either. Both gaps `done-audit-7` narrowed to are closed: table's `fileViewTableBag`/
      `embedTableBag` now route through a real `CellRenderer` when `captureData` is on, and chart
      sums a real `number`/`currency` column instead of a flat row count, confirmed by reading
      `implementation-summary.md`'s T027 verification table and the 8 changed constructed PNGs it
      names.

      The 13 named fixture-only scenarios (`plan.md`'s Architecture table: `board-subtask-tree`,
      `table-mobile`, `list-mobile`, `board-mobile`, `list-sparse-fields`, `calendar-mini-calendar`,
      `calendar-empty-state`, `calendar-toolbar-options`, `timeline-subtask-tree`,
      `timeline-toolbar-options`, `chrome-chart-options-popover`, `chrome-chart-number`,
      `chrome-chart-empty`) are unchanged, counted directly against `screenshots/manifest.json`: 63
      fixture ids in total carry no `fixtureOf`, and these 13 are exactly `plan.md`'s own bounded
      list within that 63 — the other 50 were never candidates for a constructed pair (chrome
      popovers, panels and field-level fixtures outside this row's scope). Correcting this audit's
      own dispatch framing rather than repeating it: ten of the 13 are per-view state variants of
      views that already carry a typed constructed capture (mobile width, subtask-tree overlay,
      sparse fields, an empty state, a toolbar-options popover), not "menus, sheets, chrome" as a
      category apart from views; only the three `chrome-chart-*` entries are popover/chrome
      elements, and those are specifically the chart view's own chrome. None of the 13 is one of the
      seven `DatabaseViewType` values row 3 counts, so row 3's tick does not rest on them.

      They still back the same five gate lanes named since `done-audit-4`: `css-lane`,
      `screenshots-fresh`, `device-parity`, `touch-targets`, `unstyled-links` — confirmed by reading
      `tools/gate.mjs` directly (`grep -n "name:" tools/gate.mjs` = 25 lines) rather than trusting
      the prior count: these five are 5 of the 25 lanes `SURFACE_PHASE=<phase> npm run gate` sums
      into its exit code. That makes row 4's own wording the test: its tick reads only "exits 0,"
      and it does, so the tick is correct on its own narrower terms. But this row's question is
      different and unconditional ("no criterion's green depends on..."), and the answer is no
      longer "only the fixture lanes' own greens" as it read when `done-audit-6` first bounded it —
      five of the 25 lane exit codes that together ARE row 4's green are each computed in part over
      these 13 scenarios' hand-authored markup (touch-target counts, link counts, pixel/layout
      hashes, source freshness) with no constructed or device capture to cross-check against, unlike
      the now-typed 7 declared pairs. Row 4's green therefore does depend on a value the harness
      supplies that a device would not, through this bounded 13-scenario slice. Checked the other
      ticked rows and the child goals directly rather than assuming clearance: row 5's 28 replay
      claims (`tools/live/replay.json`) name no claim referencing any of the 13 ids or the five
      lanes' baseline counts; row 7 validates spec docs, unrelated to captures; four child `goal.md`
      files mention one of the 13 ids (`018`, `037`, `038`, `039`) but none makes a ticked child
      criterion's green rest on it beyond what `018` already discloses under its own D5 ("a number
      measured on a hand-written fixture is a fact about the fixture") — a disclosed limit, not a
      new dependency.

      **Stays open**, narrowed a third time: no longer table's or chart's rendering (T027 closed
      both), and no longer framed as "typed-state and icon fidelity" (closed for all 9 declared/
      constructed views) — now solely the 13 named fixture-only scenarios, which have no constructed
      or device counterpart at all, and whose fixture-authored measurements compose five of the 25
      lane results that together make ticked row 4 exit 0. Observed today: 312 manifest entries, 36
      constructed, 7 `fixtureOf` entries unchanged, 6 of 6 new typed markers PASS, 13 fixture-only
      ids confirmed against `plan.md`'s named list, 25 total gate lanes with the five named ones
      confirmed among them.

      **Re-verified 2026-09-04, `043` T028 landed on its own worktree branch (not yet merged to
      main): all 13 of the named fixture-only scenarios now have a constructed counterpart, narrowed
      a fourth time but not ticked.** Three (`table-mobile`/`list-mobile`/`board-mobile`) needed no
      new capture: the existing `constructed-table`/`-list`/`-board` scenarios already mount at the
      phone device with `is-phone` applied (a genuinely distinct mobile `layoutHash` already on
      record), so only a `fixtureOf` declaration was owed. The other ten
      (`board-subtask-tree`/`timeline-subtask-tree` via a real `buildSubtaskRelation` parent-and-two-
      children wiring, `list-sparse-fields` via a deterministic blanked-field subset that exercises
      `ListRenderer`'s real `shouldReserveColumns` measurement, `calendar-empty-state` via every
      date-typed column stripped from the schema, `chrome-chart-number`/`chrome-chart-empty` via real
      `ViewConfig` shapes (`chartType: "number"`, an all-groups `chartHiddenGroups` map),
      `calendar-mini-calendar` via a real click on the mini date-picker trigger, and
      `calendar-toolbar-options`/`timeline-toolbar-options`/`chrome-chart-options-popover` via the
      three toolbar renderers' own public `togglePopover()` against a visually-hidden real anchor
      button) needed additive `ScenarioSpec` options on `render-assertion-harness.ts`, none of which
      touch the three existing consumers' own numbers (`render-assertions.mjs`/`touch-
      targets.mjs`/`unstyled-links.mjs` all exit 0 unchanged, by construction as well as by
      measurement). A red-first live check (`tools/live/constructed-state-assertions.mjs`, new) FAILed
      16 of 16 before the harness branches existed and PASSed all after. Two full detached capture
      runs reproduced identical `pixelHash`/`layoutHash` for all 352 entries; all 312 pre-existing
      entries matched their committed HEAD content exactly (0 content changes, 10 bytes-only
      encoder-noise re-encodes restored rather than recommitted); all 40 new captures were opened and
      read on both desktop and phone. `SURFACE_PHASE=043-constructed-capture npm run gate` and bare
      `npm run gate` both exit 0, 25 green. **This row still does not tick, per D4 (a fresh reviewer
      verifies, never self-certify) and per this row's own repeated "check both ways" precedent.** A
      manifest-level constructed counterpart now exists for all 13 declared via `fixtureOf`, but
      `touch-targets.mjs`/`unstyled-links.mjs`'s OWN constructed pass
      (`render-assertion-bundle.mjs`'s shared `SCENARIOS`, the list those two lanes and
      `render-assertions.mjs` actually read, distinct from `constructed-scenarios.mjs`'s capture
      registry) was not widened to include these ten new per-state entries — so those two lanes' own
      internal fixture-vs-constructed cross-check does not yet reach them, even though a device-
      realistic counterpart demonstrating the identical markers now exists elsewhere in the shared
      manifest. Whether that residual gap still disqualifies the tick, or whether the row's own
      wording ("no constructed or device counterpart to cross-check against") is now satisfied by the
      manifest-level counterpart regardless of which lane algorithmically reads it, is exactly the
      kind of question this row's history shows should not be decided by the same pass that produced
      the evidence — left for a fresh audit. `completion_pct` stays **4 of 7 = 57**, unchanged: rows
      3, 4, 5 and 7 hold, rows 1 and 2 stay open on operator device confirmation, row 6 stays open,
      narrowed a fourth time. Full evidence: `043/tasks.md` T028, `043/goal.md`'s own T028 log entry,
      `043/implementation-summary.md`'s T028 verification table and Known Limitations item 6.

      **Re-verified 2026-09-04T07:20:00Z (done-audit-9), narrowed a fifth time, stays open.** T028
      merged to main in `d363456`, reconciled in `dc67803`. Every number below was measured on that
      merged tree by this audit, never carried from the landing pass. **What closed.** All 13 named
      fixture-only scenarios now carry a `fixtureOf` declaration:
      `grep -c fixtureOf tools/screenshots/scenarios/*.mjs` reads **20** (chrome.mjs 3, core.mjs 9,
      temporal.mjs 8), was **7**; `screenshots/manifest.json` holds **352** entries and **19**
      distinct constructed scenarios, was **312** and **9**; **20** fixture ids carry `fixtureOf`
      and **50** do not, was **7** and **63** — the 13 are exactly that difference, each read out of
      the manifest by id rather than counted in aggregate, each present on all four device/theme
      entries. Three of the five lanes this row has named since `done-audit-4` are consequently
      cross-checked for all 13 inside their own input set, each lane run to completion here and its
      `$?` read directly: `device-parity` (`node tools/live/capture-device-parity.mjs`) `0`, **87
      pairs, 0 identical against a recorded baseline of 4** — was **77** pairs at `425d552`, and the
      ten new constructed state ids are individually confirmed captured on both `desktop` and
      `mobile`; `screenshots-fresh` (`npm run screenshots:verify`) `0`, **352 entries match their
      sources**, was **312**; `css-lane` (`node tools/lane/check-lane.mjs`) `0`, stylesheet unchanged
      at `c32661e8c089`, "release names all 0 changed capture(s)".

      **What does not close, and is the entire residual.** `touch-targets` and `unstyled-links` never
      read the manifest. Their constructed pass iterates `render-assertion-bundle.mjs`'s exported
      `SCENARIOS` — read line by line, a **21**-entry list that sets none of T028's new `ScenarioSpec`
      fields (`subtaskTree`, `sparseFields`, `emptyState`, `chartVariant`, `miniCalendar`) and names
      none of its three new toolbar `renderer` values. The ten new states exist only in
      `constructed-scenarios.mjs`'s capture registry, a different list neither lane imports.
      Measured, not inferred: `node tools/live/touch-targets.mjs`, `$?` read directly `0` —
      "[fixture] 1450 interactive element(s) across **70** scenario(s)", "[constructed] 56538 across
      **21** production-renderer scenario(s)", 264 under against a fixture baseline of 279 and 367
      under against a constructed baseline of 367; `node tools/live/unstyled-links.mjs`, `$?` `0` —
      "[fixture] 112 link(s) across **70** scenario(s)", "[constructed] 0 link(s) across **21**
      production-renderer scenario(s)". Both JSON records are field-for-field identical to their
      state at `425d552`, before T028 (`git show 425d552:tools/live/touch-targets.json` and
      `...unstyled-links.json`: fixture 1450/70/264, constructed 56538/21/367; links 112/70 and
      0/21). That is the strongest available proof T028 moved nothing in these two lanes — a widened
      constructed pass could not have left the count at 21.

      Three of the 13 are nonetheless covered in-lane for `touch-targets`:
      `table-mobile`/`list-mobile`/`board-mobile` declare `constructed-table`/`-list`/`-board`, which
      ARE in the 21-entry list, and that lane mounts its whole constructed pass in one page at
      `viewport: 390x844`, `hasTouch`, `isMobile`, body class `is-phone` — the phone condition those
      three fixtures exist to depict. The residual is therefore **ten** scenarios against **two**
      lanes, not 13 against five. Separately, already declared under D6 and re-confirmed rather than
      newly found: `unstyled-links`' constructed pass returns an empty sample (0 links) for all 21
      scenarios because the shared list sets no `captureData`, so widening it alone would not make
      that half non-vacuous.

      **Stays open.** T028's own note left one question for a fresh reviewer: whether a
      manifest-level counterpart satisfies this row regardless of which lane algorithmically reads
      it. It does not, on the criterion's own words. The row tests whether a green *depends* on a
      harness-supplied value, not whether a counterpart exists somewhere in the tree. A PNG in
      `device-parity`'s input set never enters `touch-targets`' `under` count; those two lane exit
      codes are still computed in part over ten hand-authored fixtures with no constructed
      measurement anywhere in their own arithmetic, and both are among the 25 lanes ticked row 4's
      "exits 0" sums. That is the identical "declared-and-bounded dependency is still a dependency"
      reading `done-audit-4`, `-6` and `-8` applied; loosening it on the first pass that would
      benefit from the looser reading is the exact failure the first criterion in this table was
      rewritten to record. What closes it is small and named: add the ten state variants to
      `render-assertion-bundle.mjs`'s `SCENARIOS` — the harness options they need already exist and
      are exercised red-first by `tools/live/constructed-state-assertions.mjs` — then rebaseline
      `touch-targets-constructed-baseline.json`. `completion_pct` stays **4 of 7 = 57**: rows 3, 4, 5
      and 7 hold, rows 1 and 2 are the operator's, row 6 stays open on ten scenarios and two lanes.

      **Re-verified 2026-09-04T09:10:50Z (done-audit-10), the tracked residual closed, the row
      still does not tick.** `043` T029 landed on main in `122a959`, was reconciled onto main's
      one-to-one board port in `ce72379`, and had its stale post-rebase numbers trued up in
      `65238ad`. Every number below was measured on that tree by this audit, never carried from the
      landing pass.

      **What closed — exactly the closing move `done-audit-9` named.**
      `render-assertion-bundle.mjs` now exports `STATE_SCENARIOS` (the ten variants) and
      `SCENARIOS_WITH_STATES`, and `touch-targets.mjs:65` / `unstyled-links.mjs:40` import the
      latter instead of the bare `SCENARIOS`. Read out of the modules rather than counted by eye:
      **21** + **10** = **31**. `node tools/live/touch-targets.mjs`, `$?` read directly `0` —
      "[constructed] 50462 interactive element(s) across **31** production-renderer scenario(s)",
      **422** under the 28px floor against a recorded baseline of **422**; was **21** scenarios and
      **367** against **367** at `425d552`. `touch-targets-constructed-baseline.json` carries the
      raise as data rather than prose: a `raiseHistory` of 367 -> 422 with twelve per-class
      before/after rows summing 0+8+0+22+0+0+0+6+8+11 = **55**, and a `rebaseReconciliation` block
      recording `reMeasured: 422`, `matchesRaiseHistory: true`, the scanned total 57060 -> **50462**
      and the constructed link total 144 -> **72**, both attributed to main's board rewrite rather
      than to T029. `node tools/live/unstyled-links.mjs`, `$?` `0` — "[constructed] **72** link(s)
      across **31** production-renderer scenario(s)", **0** user-agent-default findings; was **0**
      links across **21**, and the lane's `constructedElementsSeen === 0` empty-sample caveat no
      longer prints. That supersedes this row's own standing prediction that widening alone would
      not make the link half non-vacuous, and the mechanism is checkable rather than asserted:
      **7** of the ten `STATE_SCENARIOS` set `captureData` (the three toolbar-popover entries do
      not), so relation and file-type fields — the only source of `.internal-link` markup, per that
      caveat's own comment — are now built by the constructed pass.

      **One evidence caveat, found by this audit rather than carried.** The stamp committed at HEAD
      (`tools/live/touch-targets.json`, written by the `ce72379` run six minutes before this one)
      records constructed `measured 50444`, `under 417`, `betweenFloors 44201`, while two
      independent runs here both record `50462`, `422`, `44214` — on the identical six `inputs`
      hashes, with no `src/` or `tools/storybook/` commit between `ce72379` and `65238ad` to explain
      the difference. The figure the docs cite (**422**) is the one this audit reproduces, and it is
      also exactly the recorded baseline, so the ratchet is sitting on its ceiling: a run landing on
      the lower value passes, a run landing one control above 422 fails. Not a verdict change —
      both 417 and 422 clear the baseline — but the constructed pass is demonstrably not run-to-run
      identical, and D2's discipline is to record the spread rather than quote the convenient
      number. `unstyled-links.json` shows no such drift: its diff against HEAD is the `measuredAt`
      timestamp alone, with 72 constructed links unchanged.

      **The three toolbar renderers are the real reason `SCENARIOS` itself stayed at 21**, verified
      rather than taken from the comment that claims it: `BAGS` in `render-assertions.mjs` holds
      exactly **13** keys, enumerated out of the source, and none is `calendar-toolbar/file-view`,
      `timeline-toolbar/file-view` or `chart-toolbar/file-view` — the three the state list adds.
      `render-assertions.mjs:277` reads `const expected = BAGS[key]` and `:279` calls
      `expected.filter(...)`, so a merged list throws a `TypeError` at the bag-shape comparison
      rather than failing a check. The sibling export is a real constraint, not a convenience.

      **And `render-assertions.mjs`, still reading the 21, leaves no criterion green on a
      harness-supplied value.** Checked three ways. (a) It mounts no hand-written markup at all:
      the harness refuses DOM without a bundled-renderer provenance marker (`render-assertion-
      harness.ts:918`, "hand-written markup resembles renderer output and proves nothing about
      it"), and `buildRenderAssertionBundle()` fails the run outright when any of the seven
      `RENDERER_SOURCES` is absent from esbuild's own input manifest. (b) Its action bags are
      return-type-annotated against the shipped `*RendererActions` interfaces — **13** annotations
      against those same 13 `BAGS` keys — so `npx tsc --noEmit`, its own gate lane, binds their
      shape to `src/views`; `BAGS` itself is an expected-shape threshold, which D2 asks of every
      check, not an input a device would supply differently. (c) Its coverage total is read live
      from `src/views` (`readdirSync` plus `/export class \w*Renderer/`), not pinned. What the
      21-entry read does cost is arithmetic, not truth: the three toolbar renderers are now
      constructed by the other two lanes and counted by neither, so this lane's "7 distinct
      renderers" under-reports. That is row 3's ledger to correct, not this row's.

      **What does not close.** Both lanes still run a fixture pass first, and both exit codes
      require it — `touch-targets.mjs:414` fails on `fixtureFailed || constructedFailed` (fixture
      **264** against a baseline of **279**), `unstyled-links.mjs:211` on
      `findings.length + constructedFindings.length > 0` (fixture **112** links across **71**).
      That pass mounts **71** hand-authored HTML strings from `tools/screenshots/scenarios.mjs`.
      Neither lane reads `fixtureOf`: it is declared on the fixture and consumed only through
      `screenshots/manifest.json`, which neither imports, so the pairing `done-audit-9` credited to
      the other three lanes has no effect inside these two. Their constructed pass supplements the
      fixture pass; it validates no individual fixture. Measured: of the 71, **20** carry
      `fixtureOf` and **51** do not, and **42** of those 51 are the `panel-*` (14), `chrome-*` (15),
      `field-*` (11) and popover (`add-view-popover`, `dropdown-field`) families — sheets, menus,
      popovers, pickers and cell editors that no constructed scenario in either lane mounts at all,
      because their production builders are not view renderers and the harness has no seam for
      them. The 71st fixture makes the point on its own: `chrome-board-extensions-selection`, added
      by main's board port in `d921404`, landed straight into the uncovered set. For a control that
      lives only on those surfaces the hand-authored measurement is the sole evidence, inside a
      lane whose exit code ticked row 4 sums.

      **This is a re-scoping, not a widened goalpost, and saying so is part of the ruling.** It is
      `done-audit-3`'s class (3) — recorded there as "not a structural guarantee for the rest of
      `scenarios.mjs`" — in the part `done-audit-6`'s `fixtureOf` bound set aside rather than
      closed, when it narrowed this row's population to the 7 declared pairs plus the 13 named
      fixture-only scenarios. Every audit since tracked that narrower population, and today it is
      empty. Ticking on an emptied tracked list while an untracked part of the same class is still
      live would be this table's first criterion's own denominator error, pointed the other way.

      **Stays open**, narrowed on the axis it was tracked on — ten scenarios against two lanes,
      down to none — and re-scoped to the remainder: the fixture half of `touch-targets` and
      `unstyled-links`, **42 of 71** hand-authored scenarios with no constructed counterpart in
      either lane's own arithmetic. What closes it is finite and nameable: give those surfaces a
      constructed counterpart in the same two lanes (a mount seam for the non-renderer builders,
      which does not exist yet), or take the fixture pass out of the exit condition and keep it as
      a reported-not-enforced number beside the constructed one. `completion_pct` stays **4 of
      7 = 57**: rows 3, 4, 5 and 7 hold, rows 1 and 2 are the operator's, row 6 stays open on the
      fixture half of two lanes.

      **Ticked 2026-09-04T13:17:14Z (done-audit-11), on this row's own words, after `043` T030
      constructed the fixture families done-audit-10 re-scoped it to.** T030 landed across
      `c4c7466`+`64db8d5`+`6fa715e` and was trued up onto main's gantt and board fidelity passes in
      `d94e11f`, `2506bb2` and `2242fa0`. Every number below was measured on main at `2242fa0` by
      this audit — four lane runs and a source census — never carried from the landing pass.

      **What closed, each check with the value it replaced.** (a) *Fixtures with no constructed
      counterpart: 51 -> 5.* Read by importing `tools/screenshots/scenarios.mjs` and filtering the
      array, not by grepping a count that a comment could inflate: **71** fixtures, **66** carry
      `fixtureOf`, **5** do not. Was 20 paired and 51 unpaired at `65238ad`. (b) *Both lanes'
      constructed pass: 21 -> 31 -> 73 scenarios.* `render-assertion-bundle.mjs` exports `SCENARIOS`
      (**21**) plus `STATE_SCENARIOS` (**52**) as `SCENARIOS_WITH_STATES` (**73**), over **35**
      distinct `renderer` values, and `touch-targets.mjs:65` / `unstyled-links.mjs:40` import the
      last of those. The constructed pass is now WIDER than the fixture pass it supplements — 73
      against 71 — which is the first time in this row's history that has been true. (c)
      *`touch-targets`:* constructed **24788** interactive elements across **73** scenarios, **1223**
      under the 28px floor against a recorded baseline of **1223**; was **422/422** across **31**,
      and **367/367** across **21** before that. Run three times, `$?` read directly each time — `0`,
      `0`, `0` — and all three returned the identical fixture **1123/71/199** and constructed
      **24788/73/1223**, matching HEAD's committed `tools/live/touch-targets.json` to the digit.
      (d) *`unstyled-links`:* `$?` `0`, constructed **1476** links across **73** scenarios and **0**
      user-agent-default findings; was **72** links across **31**, and **0** across **21** before
      that. (e) *The fixture pass, recorded for the spread rather than skipped:* **1123** elements
      across **71** scenarios, **199** under against a baseline of **279**; was **1450/71/264** at
      `65238ad`. The scenario count is unchanged, so the drop is main's board and gantt ports moving
      `styles.css`, not a fixture edit.

      **done-audit-10's determinism caveat is retired, not inherited.** That audit found the
      constructed ratchet sitting on its ceiling and *decided by timing* — 417 against a baseline of
      422 on identical `inputs` hashes with no `src/` commit to explain it, and 1457/1471/1558/1584/
      1601/1623 across six runs of one tree on T030's own branch. The cause is now named and fixed
      rather than tolerated: the anchored surfaces that portal to `document.body` were never torn
      down, so each scenario measured every earlier scenario's panel as well, and the runner now
      sweeps every body child a mount added. Three runs here return one number. The ratchet still
      equals its baseline (1223 = 1223), so it has no headroom — but a ceiling a run reproduces is a
      different object from a ceiling a run rolls for.

      **The ruling, and the five fixtures it turns on.** The criterion is conjunctive: a green must
      depend on a harness-supplied value *that a device would not supply*. A hand-written mount is
      the class this row names, but done-audit-7 already set the test for a named class member —
      the stubbed action bags were ruled a declared residual rather than a live dependency once it
      was verified in source that no green could move on them. That is the test applied here, to
      each of the five, and none of them keeps a criterion green on a harness-only value:
      **`panel-computed-cleanup-modal`** and **`panel-invalid-events-modal`** are the only two of
      the five that reach either lane's pass/fail arithmetic at all, and they reach it in the wrong
      direction for this row: `node tools/live/touch-targets.mjs --json` attributes **2** and **3**
      of the 199 undeclared under-floor rows to them (bare and `mod-warning` buttons at 24px height),
      which *consume* ratchet headroom rather than create it — `fixtureFailed` is
      `undeclared.length > allowed` (`touch-targets.mjs:411`), so a fixture can manufacture a red
      here and never a green. **`panel-base-import-modal`** contributes **0** undeclared rows and
      **0** link findings; its 5 hits are all on the `DECLARED` allowlist, which is an accepted
      shortfall, not a green. **`chrome-selection-status-bar`** contributes **0** undeclared rows,
      and its product claims are asserted on production output by a different lane entirely:
      `verify-placement.mjs` builds the bar through `DatabaseView.prototype.renderSelectionStatusBar`
      and `EmbeddedDatabaseRenderer.prototype.renderEmbedSelectionStatusBar` and measures the thumb
      floor and keyboard clearance on that DOM. The one criterion that names the fixture id at all,
      `022`'s AC-8, asks for "a fixture that photographs the bar rather than an empty region" — a
      claim whose subject IS the capture, correctly scoped, not a proxy for a device value.
      **`board-drop-language`** is the one genuinely load-bearing case and it was checked hardest.
      It is the only one of the five any executable check names: `replay.mjs:600` loads its
      hand-written HTML and requires `.pm-kanban-drop-target` and `.pm-kanban-card--dragging`,
      contributing 1 of the `recorded: 2` on `038`'s empty-column/drop-language claim, and
      `replay.mjs:827` holds claims on `actual === c.recorded` exactly — so the replay lane's exit
      code, which ticked row 5 reads and ticked row 4 sums, does strictly depend on that fixture.
      What it does not depend on is a value a device would withhold: `board-renderer-parity.test.ts`
      constructs a real `BoardRenderer` from `src/views/board-renderer` and dispatches real
      `dragstart`, `dragover` and `dragleave` events, asserting those same two class names on the
      renderer's own output (`:928`, `:939`, `:946`, present at HEAD), inside the `tests` gate lane.
      The harness value and the production value are the same value, measured twice.

      **What this tick does not claim, said plainly.** The five are still a coverage gap, and the
      gap is structural rather than deferred: `obsidian-stub.mjs:202` makes `Modal` an
      `outOfScope()` throw, so the three `DbModal`-hosted panels have no mountable host;
      `chrome-selection-status-bar`'s host extends `MarkdownRenderChild` and its state exists only
      mid-gesture; `board-drop-language`'s classes are added by live `dragstart`/`dragover`
      handlers. Those surfaces are measured on hand-authored geometry and nowhere else, so the two
      lanes cannot raise a red about them. That is a red the corpus cannot reach, which is a
      different defect from the one this row polices — this row asks whether a green *rests* on a
      harness value, and after T030 none does. Recorded as a live coverage limit against row 3's
      ledger and `043`'s Known Limitations, not silently absorbed by this tick.

      **Two checks that could have kept it open, run rather than assumed.** `render-assertions.mjs`
      still reads the unwidened **21** (`:54` imports the bare `SCENARIOS`), and its `BAGS` still
      holds exactly **13** keys with none of `calendar-toolbar/file-view`,
      `timeline-toolbar/file-view` or `chart-toolbar/file-view` among them — enumerated out of the
      source again, so the sibling-export constraint T029 recorded is still real and still the
      reason the merge cannot happen. And **one correction to done-audit-10, found by re-running its
      own reasoning rather than repeating it.** That audit cleared `render-assertions.mjs` three
      ways; legs (a) and (c) hold — the harness refuses DOM without a bundled-renderer provenance
      marker (`render-assertion-harness.ts:1308`) and the coverage total is read live from
      `src/views` (`render-assertions.mjs:298-301`, `readdirSync` plus `/export class \w*Renderer/`).
      Leg (b) does not. It claimed the 13 action bags are "return-type-annotated against the shipped
      `*RendererActions` interfaces so `tsc --noEmit` binds them to `src/views`". The annotations do
      exist — 13 of them, in `render-assertion-harness.ts`, not in `render-assertions.mjs` where the
      audit cited them — but no gate lane typechecks them: root `tsconfig.json` includes
      `src/**/*.ts` only, and `lint:tools` runs eslint over `tools/**/*.mjs`, which excludes the
      `.ts` harness. So `BAGS` is a hand-maintained expected list compared against the harness's own
      bag keys (`:277`-`:279`), with no enforced binding to `src/views`. That weakens leg (b) to
      zero, and the conclusion still stands on the other two plus done-audit-7's inertness finding,
      re-verified here: `render-assertions.mjs` references `actions` only inside a comment, and
      `touch-targets.mjs`/`unstyled-links.mjs` reference an action bag **0** times each, so no
      measured geometry, colour or hash can move on a bag member. An unenforced shape list can only
      under-assert — a red it fails to raise — which is the same class as the coverage gap above,
      not a green resting on a device-divergent value.

      `completion_pct` moves to **5 of 7 = 71**, up from 4 of 7 = 57: rows 3, 4, 5, 6 and 7 hold,
      and rows 1 and 2 stay the operator's — device confirmation of reports 29-36, the five ported
      surfaces and releases 0.0.16 through 0.0.19.
- [x] `validate.sh <this folder> --strict` reports the parent at Errors: 0. Was red: 3
      `SPECDOC_FRONTMATTER_004` errors (`spec.md`, `handover.md`, `goal.md`) until the shared kit
      accepted a single-segment `packet_pointer` today (Public commit `a3e3fe774e`, packet
      `specs/system-speckit/050-single-segment-packet-pointer`). `validate.sh
      specs/005-component-surface-system --strict`, first `RESULT:` line `PASSED`,
      `grep -c SPECDOC_FRONTMATTER_004` now 0. **Re-verified 2026-09-03T23:40:00Z.**
      `NODE_PRESERVE_SYMLINKS=1 bash "$(realpath .opencode)/skills/system-spec-kit/scripts/spec/
      validate.sh" specs/005-component-surface-system --strict`, run to completion without
      piping through `head` — an earlier attempt in this same audit piped through `head -80` and
      silently truncated the run via `SIGPIPE` at 100 lines, the exact "never trust a pipe" trap
      this program's own rules name. Full run: first `RESULT:` line for the parent is `PASSED`,
      `Summary: Errors: 0  Warnings: 1`. All 42 recursively-validated folders report `RESULT:
      PASSED`, 0 `RESULT: FAILED`. **Re-verified 2026-09-04T03:40:00Z.** First `RESULT:` line
      for the parent is `PASSED`, all 43 recursively-validated folders report `RESULT: PASSED`,
      `Summary: Errors: 0`.
      **Re-verified 2026-09-04T06:40:00Z (done-audit-4).**
      `NODE_PRESERVE_SYMLINKS=1 bash "$(realpath .opencode)/skills/system-spec-kit/scripts/spec/
      validate.sh" specs/005-component-surface-system --strict`, run to completion, output
      redirected to a file rather than piped. First `RESULT:` line for the parent is `PASSED`,
      all 43 recursively-validated folders report `RESULT: PASSED`, 0 `RESULT: FAILED`,
      `Summary: Errors: 0  Warnings: 0`.

### The phase subgoals this table stands on

**The seven rows above are the program's own. They do not close a phase.** Each open phase carries
its own `goal.md` with its own completion criteria, and that document — not a summary of it — is
what decides whether the phase is done. This table is the reference, added 2026-09-04 so a reader
of the parent can reach every open subgoal without walking the tree.

**Precedence.** The decisions in §1 outrank child detail; child detail outranks any summary of it,
including this table. Where a row here and a child's own `goal.md` disagree, **the child is right
and this row is a defect.**

| Open phase | Its goal document | What its criteria ask for, in one line | Derived |
|---|---|---|---|
| `043-constructed-capture` (T031) | [`043-constructed-capture/goal.md`](043-constructed-capture/goal.md) | A readiness signal proven by a negative control, `declared-fixtures.mjs` naming every superseded fixture, screenshots-fresh judging a DECLARED scenario against its constructed counterpart, and a fixture-versus-constructed `pixelHash` parity check. **T031, the Project Manager reference captures under `screenshots/project-manager/`, is done on `worktrees/037-reference-captures` and not on main.** | 6/11 |
| `044-phone-sheet-alignment` | [`044-phone-sheet-alignment/goal.md`](044-phone-sheet-alignment/goal.md) | Zero phone bottom-sheet surfaces bypassing `applySheetChrome` (today 3), the column-width adjuster carrying all seven grammar elements (today 0), a focused field staying inside the reduced `visualViewport`, the settings sheet closing from its grab band with no label wrapping, the Add view sheet on a shared row type (today 0 of its controls), a green `sheet-grammar` lane that does not yet exist, and the operator reading all three sheets as aligned on iOS. | 0/7 |
| `045-board-card-properties` | [`045-board-card-properties/goal.md`](045-board-card-properties/goal.md) | One per-view ordered property list with per-field visibility, the renderer moved onto it, an upgrade with no stored list leaving every existing card byte-identical, a stored list having zero effect on `038`'s one-to-one reference path, and the operator arranging a card's properties on a phone and reading it as close to Notion's. | 0/6 |
| `046-linked-views-notion-parity` | [`046-linked-views-notion-parity/goal.md`](046-linked-views-notion-parity/goal.md) | The embed unboxed from its ancestor-walk clip, the duplicate `db-header` and its hide-the-title chevron gone, ADR-001 (may an embed write) taken before the four `persistMode === "codeblock"` read-only gates are touched, a linked view movable to another page, a create flow writing the fence `serializeCodeBlockReference` already builds, and the operator reading the Overview page's nested views as real databases. | 0/7 |
| **`006-list-view-deprecation`** — a **sibling packet**, not a phase here | [`../006-list-view-deprecation/goal.md`](../006-list-view-deprecation/goal.md) | No surface offering list, a list-configured vault opening as a table with the same columns once with a notice, `list-renderer.ts` gone, the `list-window` lane **removed not skipped** with `npm run gate` at 0, the coverage floor lowered with its reason beside the number, `033-list-virtualisation` and `024-list-view-freeze` closed against the retirement, and the operator reporting a migrated vault. Its four live children each carry their own goal; see [`../006-list-view-deprecation/roadmap.md`](../006-list-view-deprecation/roadmap.md). | 0/7 |

**Every other phase's subgoal is reachable the same way**, at `<phase>/goal.md`. The full inventory
with a derived figure and a current state per phase is `roadmap.md` §5.A, and the 103 rows that only
a device can close are gathered in `operator-checklist.md`.

**What this table does not change.** Rows 1 and 2 above are the operator's and stay unticked; rows 3
to 7 stay ticked on the evidence recorded under each. A phase subgoal closing does not tick a row
here, and a row here does not close a phase — that separation is D3 (shipped, verified and
operator-confirmed differ) applied to the parent's own table.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->

### Queued: a 20-iteration deep review, two lanes, no early convergence

**2026-09-02: D14 supersedes this order for new work.** What follows stays as the record of what
was ordered, not the lanes to use next. Neither half is orderable as written: Cursor's allowlist
carries no xhigh tier for Luna at all — only `gpt-5.6-luna-max` and its `-fast` variant
(`cli-cursor/references/providers-and-models.md:69-70`) — and codex's ceiling for Luna is `max`,
not xhigh (`cli-codex/references/providers-and-models.md:51`). Verification moves to a fresh
in-runtime Opus agent because that is the only lane that can reach Chrome, for the reason the
next paragraph gives.

Ordered by the operator once the build work lands. Ten iterations on
`cursor-grok-4.6-xhigh` through cli-cursor, ten on `gpt-5.6-luna` at
`model_reasoning_effort=xhigh` with `service_tier=fast` through cli-codex, stop policy
max-iterations so neither lane stops early, spread across every phase this session touched.

The split across two transports is not arbitrary. Cursor's enforced allowlist has no xhigh
tier for Luna — it carries `gpt-5.6-luna-max` and its fast variant and nothing between — and
the contract forbids substituting the closest-sounding id, so the operator chose the effort
over the transport.

**One limit to hold the codex lane to.** Its sandbox is `[workdir, /tmp, $TMPDIR]` and Chrome
lives outside it, so that lane cannot run the placement harness or any browser-driven check.
It reported the gate as 13 green earlier today where the gate is 16. A review is reading
rather than measuring, so this is survivable — but any number that lane produces about a
browser is not evidence, and a finding of the shape "the gate is red" from it should be
checked here before it is believed.

## 4. LOG

Volatile. Not part of the directive and not copied into an objective.

### The operator's numbers, and what they settle

Confirmed by the operator: **1,000-3,000 rows at 80-100% fill**. Measured at 21 columns and 6× CPU
throttle, the list blocks **2,022.9ms at 1,300 rows** against a 2,000ms budget and **4,908.6ms at
3,000**. Their range starts at 1,000 rows, which already costs 1.6s.

The shape across that range is **LINEAR ×1.06** — the quadratic is genuinely gone — and at 3,000
rows **3,722.5ms of the 4,908.6ms is layout** over 225,007 nodes. Cost is proportional to node
count, so no further loop work reaches it. **Virtualisation is the only remaining lever**, and
clearing the budget at 3,000 rows means rendering roughly a fifth of the nodes rendered now.

**2026-09-02: `033-list-virtualisation` pulled that lever, and the paragraph above is now history.**
The flat and grouped lists are windowed: **4,748.6ms → 48.4ms** blocked main thread at 3,000 rows
and **225,007 → 2,184** nodes, flat across 1,000, 3,000 and 3,400 rows, with `list-window` a gate
lane carrying 16 checks. Five of that phase's six criteria are met and the sixth is the operator's
own, so this is bench-measured and **not confirmed on device** — which is why the blocker above
now names the bench rather than the missing lever, and why §4A's advance warning that *the list is
expected to still stall* no longer describes the build the operator will install.

Two other operator decisions, recorded here because both had been escalated rather than picked:
the **editable note body is accepted** (its writer already runs inside the per-file write queue,
with a negative control proving the interleaving check can fail), and the **output-number-format
scope exclusion means the formula editor's only**, so report 7 is in scope for `019`.

### What is broken on device right now

**Every non-table view was reported freezing** — list, board, calendar, timeline. The table works.
`024` fixed the list renderer's quadratic and measured it 8,646.0ms → 246.6ms of blocked main
thread; `028` then found and fixed a **second, unrelated quadratic in the timeline** — a forced
layout per event — measuring 8,547.9ms → 234.2ms at 6,400 rows, and established that **the
calendar was never superlinear at all** (30.3ms at 12,800 rows, constant DOM). So three of the
four reported views now have a measured, fixed cause and one has a measured absence of one.
`033` then windowed the list, which is the only one of the four whose remaining cost was layout
over node count rather than a loop.
None of it is confirmed on the operator's device. Treat these as evidence about the render
loops, not as evidence that the views open.

### The two founding failures

**1.3.1.** It passed tsc, build, the unit suite, 196 captures, Storybook and 13 geometry checks, and
changed nothing the operator could see. Every gate measured a mechanism; none measured an outcome.

**The list freeze.** A property with no value held its column by rendering a full hidden field, three
nodes each, 8,000 field elements at 1,600 rows; and every row asked whether it was on a touch device,
a question answered by measuring the container **while that container was being appended to**. Every
row re-flowed everything already added. Quadratic, 7,173ms of blocked main thread, past every gate.
The first failure was about what the checks measured. The second is about what they never construct.

### The big placement one, fixed

Paint containment makes the leaf the containing block for `position: fixed`, and
`positionToolbarPopover` computes viewport coordinates — so every container-mounted surface among its
34 call sites was displaced by the leaf's origin: filter, sort, column manager, view config, cell
editors, toolbar popovers, the date picker. `setPosition` always had the compensating parameter; the
positioner's three callers passed `undefined`. Now wired via `fixedContainingBlock()`, its property
list checked against the browser rather than the docs — no false positives, so a gap under-corrects
and can never overshoot. **Check this first on device.**

### The next one, measured

`app.css:3606` gives every CM6 widget `contain: paint !important` and the plugin registers two
code-block processors. In **Live Preview** an embedded database's popovers are placed correctly, then
clipped at the widget's edge and left unclickable. No coordinate escapes a paint-contained ancestor;
only the portal does. `verify-placement`: 18/19, 1 declared red.

### Portal unblocked

`portal-safety.mjs` splits what a surface loses on the body into rules no marker can recover and
styling the markers impose. Naming each surface's own chrome twice — scoped and `.db-x.db-surface`,
same specificity, nothing in-container moves — took the unrecoverable count **537 → 0** in six rules.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Reports with an owning phase | Done | **32 of 32** — re-read off `roadmap.md` §4 on 2026-09-02, where the table now runs 1-16 and 18-33. This cell read *16 of 16*, then *27 of 27*, against a table that kept growing |
| Reports shipped | In Progress | **15 of the original 16** (report 13 is the version bump, deliberately not a phase), plus **row 29**, whose fix shipped under `031` in `98da630`/`0c92f4d` and was released as 1.4.1 (`460d4d7`). **0 of the remaining 15 later rows** have shipped code: 30-33 are recorded in `62c4fe7` and their fix is uncommitted |
| Reports operator-confirmed | In Progress | 1 of **32**, as an accepted shortfall (report 10). Row 29 carries a **partial** — *"Most sheets seem to work now tho"* — which under D3 is not a close |
| Every phase has a `goal.md` | Done | **37 folders** (`000`-`036`), all carrying one, counted 2026-09-02 — `036-obsidian-pm-ui-harvest` was opened in `5b542fb` and rescoped in `7f00622`/`9642e43`, and it carried one from the start. This cell read *36 folders* before that phase existed. Earlier: 36 folders, all carrying one — `035-visual-pass-product-defects`, opened 2026-09-02 for the visual pass's product defects, was the 36th and carried one from the start. **This row was briefly false:** 032, 033 and 034 were opened without one by the same commit that opened 034 to fix documentation drift — the drift mechanism reproducing itself inside its own remedy. Added and re-checked across every folder rather than assumed | The four that did not — `020`, `021`, `023`, `025` — were written after an audit counted, having been claimed complete twice |
| Report 1, the sheet drag | Fixed, awaiting device | The panel's render destroyed the grab bar; a 60px drag now moves 60.0px after a re-render, was 0.0px |
| Non-table views on device | Unconfirmed | Two quadratics found and fixed (list `024`, timeline `028`); the calendar measured clean; the list then windowed in `033`. None confirmed on device |
| Gate checks constructing a renderer | 1 of **25** | `026`. `render-assertion-harness.ts` builds all six view renderers across twelve scenarios and both bags, green in the gate, all six sources fingerprinted as declared inputs. Coverage 6 of 22, read off `tools/live/renderer-coverage.json` (`constructed: 6`, `total: 22`). The denominator here was the lane count and it was 16; `tools/gate.mjs` declares **25** lanes on 2026-09-02 |
| `004` state | Unknown | Three sources disagree; `roadmap.md` §7.1 |
| Gate | Green when last run, at 16 lanes | `tools/gate.mjs` now declares **25** lanes and the gate was **not re-run for this audit**, so Green is a dated verdict rather than a current one. This row read Red 12/13 long after it went green, and then 16 lanes long after there were 25 |
| Version | Done | `manifest.json` and `package.json` both at **1.4.1** (read 2026-09-02; this cell said 1.3.9, and 1.3.7 before that). Tags `1.4.0` (`1e1d269`) and `1.4.1` (`460d4d7`) are published on GitHub so the operator's phone can install them. The freeze was reported on 1.3.4, 1.3.5 and 1.3.9, and the sheet defects of report 29 on 1.4.0; no view is confirmed on any of them |

`completion_pct: 50` is derived, not felt — but **its basis was measured against the wrong
denominator and is corrected here rather than the figure.** It read *14 of 16 reports shipped, 1 of
16 confirmed*. The ledger says **15 of the original 16 shipped, 0 of the later 11, and 1 of 27
confirmed**. The figure stays at 50 because `roadmap.md` §3.2 requires one number across `spec.md`,
`goal.md` and `handover.md`, and moving it in this file alone would recreate the divergence that
rule exists to abolish — re-deriving it is a change to three documents and is owed. Recorded
2026-09-02.

**Re-derived again, 2026-09-02, on a different basis: `completion_pct: 43`, 3 of the 7 §3
COMPLETION CRITERIA rows ticked (rows 3, 4 and 7).** This is the checklist `D13` names as the
per-phase basis, not the reports ledger the paragraph above used — the two bases disagree and
only one can be `completion_pct`. Applying the checklist basis here recreates the exact
`spec.md`/`handover.md` divergence the paragraph above declined to cause, because this dispatch's
write scope is `goal.md` alone; those two files still carry 50 on the reports basis. Flagged, not
silently reconciled — `roadmap.md` §3.2 needs one basis picked across all three documents, and
that choice is the operator's.

**Resolved 2026-09-02: the checklist basis binds.** `roadmap.md` §3.2 states the rule as
`completion_pct` = ticked ÷ total over the phase's own `goal.md` completion-criteria checklist,
rounded to a whole number, and `D13` names the same source as never judged, never two — neither
names the reports ledger. `completion_pct` was **43** in every continuity block of this packet on
that date, and is 57 today for the reason the next paragraph gives; the
50-on-the-reports-basis paragraph above is dated history, superseded by this line, not the current
figure.

**Re-derived 2026-09-02 by this audit: `completion_pct` is 57.** Four of the seven §3 rows are now
ticked — 3, 4, 6 and 7 — 4 ÷ 7 = 57 on §3.2's rule, up from 43 at 3 ÷ 7. The row that moved is 6,
on `c5566db`'s owned negative controls for the board, gallery and table scenarios, verified
in-runtime rather than taken from the delegate that wrote them. Nothing else moved: two releases
landed and report 29 gained a partial, which moves the report ledger and not the checklist, and the
checklist is the basis §3.2 binds. `spec.md` and `handover.md` still carry the older figure and are
outside this audit's write scope, so the divergence is flagged rather than fixed.

**Two blockers this audit retired, and one it added.** *Retired:* the CI line reading
`npm run storybook:coverage` is fixed — `.github/workflows/gates.yml:64` runs `npm run
shim:coverage` and `:73` runs `npm run story:coverage`, both defined in `package.json`, since
`dd6c13b`. And `SPECDOC_FRONTMATTER_004` no longer fires on this root: the single-segment
`packet_pointer` amendment shipped, so `validate.sh` reports it zero times, which is what §3 row 7
already claimed. *Added:* `036`'s port research runs in a worktree, `.worktrees/003-obsidian-pm-harvest`
on branch `worktrees/003-obsidian-pm-harvest`, and the untracked `research/` directory in the main
checkout is residue from a rejected launch — reading it as evidence would be reading a run that was
thrown away.

### Deviations and findings

| Item | Note |
|------|------|
| Declared order `009 → 000 → …` was not run | Phases 010-017 were cut in report order instead. `009` gated no handoff. `roadmap.md` §8 |
| Reports 7 and 16 shipped with no phase | Now `019` and `018`. A lane hold is not a scope grant |
| Report 7 crosses a written scope exclusion | `spec.md` §2 excludes output number format. Unresolved; `019/spec.md` §7 |
| `016` worked unspecced for hours | It owns the most-reported defect; its spec and criteria arrived before it finished |
| Eight continuity blocks read 0% after shipping | `roadmap.md` §7.6. `010`'s spec still says "not started" while its own summary says 90% |
| Grab band: three surfaces, three numbers | I had carried 35px and 32px in different places and both are wrong. The harness hit-tests it through the browser: the owned menu measures **44px** (14 above the bar + 29 below + the centre pixel), ends 44px from the sheet's top edge against a first row at 47px, and takes 0 of 19 rows; the add-view sheet measures **48px** and takes 0 of 12 controls. The stylesheet's own comment says 45px on the owned menu, which is one more than the browser reports. The floor is 44px, so that surface passes at **zero headroom** — any padding or font change tips it red. The selection-bar check reading content=46px against box=46px is **not** the same shape and was wrongly filed here: `scrollHeight` returns the box height whenever content fits, so equal numbers are what a comfortable pass prints. Shrinking that box shows 47px and 45px passing, 30px failing — 2px of real margin plus the tolerance. The title editor's 0.9px is the genuine article: bit-identical across eight runs under six stylesheets. One check with no margin, not two. **These are not the surface the operator's decision is about.** That is the record sheet, which measures **32px** and is the subject of roadmap §7.5's four conflicting records — the only one of the four taken from the shipped build. So there is no single grab-band number to reconcile: three surfaces carry three bands, and citing one for another is how four records became four |
| 44px table row height declined | Density outranks it, and the cell clips its own overflow so a hit-area expansion is a no-op. Closed with a number |
| `024` missing `plan.md` and `tasks.md` | Level 1 requires both; `validate.sh --strict` reports 5 errors there, and its continuity block is 2806 bytes against a 2048 cap |
| ~~22 of 29 children fail `--strict`~~; the parent passes | Measured per folder, not inferred from the recursive tail. The rule is **level-driven, not marker-driven**: a folder's level decides which docs are validated and which anchors their template renders. The acceptance-criteria body sits behind an `IF level:2,3,3+` guard, so at Level 1 it renders empty and the file is exempt — which is why `018` and `019` pass carrying no marker at all, and why removing a marker from a Level 3 folder trades one error for another rather than clearing it. So `goal.md` costs `000`-`009` two errors each, and `spec.md` costs `010`-`017` the same two — I had recorded only the first half and written that `010`-`026` "add nothing", which the scan refutes. `acceptance-criteria.md` carries no marker in 12 folders and that is free: `018` and `019` validate clean with none. `024` and `027` are each missing `plan.md` and `tasks.md`; `028` has no marker on any of its five docs. Content is sound throughout — this is conformance, not rewriting. **This row is stale and was re-measured: `000`, `010` and `018` all pass today. A fresh reviewer found only `022` and `024` failing, both from a metadata regeneration this session skipped after editing them, and both now at Errors: 0.** The count moved because the tree moved; re-derive it rather than citing it |
| **The rows only a device can close are now one list, derived** | Every phase ends with a row nothing here can close, recorded one per packet across thirty folders — the right place to keep them and the wrong place to act on them. `operator-checklist.md` gathers them: regenerated 2026-09-02, **53 rows across 32 phases**, where it
read 42 across 30 the day before. The figure moves because the tree moves, which is the argument for
generating it rather than writing it down. It invents nothing — a row appears because it is unticked in its own `goal.md`, and each figure is a count of that packet's checkboxes. **Generated, and guarded**, because shipping a generated file nobody regenerates would add an instance of the doc-truth failure this program exists to catch: `build-operator-checklist.mjs --check` regenerates in memory and fails the gate on drift, comparing everything but its own derived date so it does not go red each morning for saying nothing. Control: ticking one row in the generated copy fails it. |
| **The visual pass found three defects, and two of them were the harness** | Read rather than counted. `field-status-colors` and six siblings clipped a long note name mid-word with no ellipsis, because the fixtures built `<a>bare text</a>` where the renderer builds `.db-file-title-inline > .db-file-title-name` and the ellipsis lives on that inner span. `chrome-chart-options-popover` rendered **five rows as single clipped glyphs** — the fixture supplied icon markup without `has-current-icon`, the stylesheet hides the icon without it, and a hidden element is not a grid item, so every child slid one track left and the label landed in the icon's 18px column. **24 captures were showing defects the product does not have.** Both now carry parity checks with controls. The third is real: on a phone the calendar week grid gives each event title 16px, and the two-line clamp stacked single glyphs — fixed by giving width the same compact treatment duration already had. **What the pass did NOT find is also evidence:** a sweep of all 120 fixture-device combinations reports 0 squeezed text nodes, and that detector reports 10 with the chart control armed. **A fourth and fifth were the same shape:** the utilities popover drew one glyph for *Save computed results* and *Refresh database* where the toolbar draws a recalculate badge and a plain refresh, and the timeline options drew the dotted calendar for *Year display* where the renderer draws the plain one. A sixth pair was **rejected** — the calendar's start-date and first-day rows share an icon in the renderer too, and sit under different section headings, so flagging it would ask the fixture to disagree with the product. **And a spacing sweep corrected itself:** 118 off-scale padding and gap values fell to **78** once `theme.css`'s host-control baseline was transcribed from the installed application stylesheet instead of recalled — it claimed to mirror the host while carrying `5px 10px` on a button where the host resolves `4px 12px`, so 40 of the 118 were the harness's own invention being counted as the plugin's drift. The remaining 78 are real 3px half-steps in dense surfaces, recorded rather than refactored because each is plausibly deliberate and none has a demonstrated defect behind it. **Three product defects came out of it, all one fault:** a stated width with padding outside it. `db-empty-hero` is `width: min(100%, 780px)` with 28px padding and overflowed its pane by **26px**; the two inline cell editors are `width: 100%` over the host's input padding and overflowed the cell they edit by **24px**; the invalid-events modal overflowed by its own border. All four are `box-sizing: border-box` now. **Three overhangs were characterised and left:** the toolbar badge is `position: absolute` at `left: 9px` on a button corner, the board subgroup header carries an explicit `margin-right: -8px`, and the list group header reaches the same 8px bleed through content-box — so the pair is visually consistent through two different mechanisms, and changing one alone would break the alignment. **The harness had to be repaired to see any of it:** 60 scenarios declare a `width` and `capture.mjs` read it nowhere, so every element capture sized to `max-content` and a percentage width had nothing honest to resolve against. Honouring it then erased a real responsive difference — 392 declared against a 402px phone made two device captures identical — and `capture-device-parity` caught that as *newly identical*, which is the reading that rule exists for. The declared width frames the desktop shot only. |
| **Seven task lists never advanced while their goals nearly finished** | Measured 2026-09-02: `001` 7/8 goal against **0/67** tasks, `002` 6/7 against **0/65**, `004` 7/8 against **0/28**, `005` 6/7 against **0/36**, `006` 6/7 against **0/32**, `025` 9/10 against **1/21**, and `022` 6/8 against **0/17** (added 2026-09-02) — **265 unticked tasks in phases whose goal checklist is 75-90% complete.** This is not a cosmetic gap: `roadmap.md` §3 makes the *In progress — N of M tasks* fraction mandatory and derives it from `grep -c '^- \[x\]' tasks.md`, so for these seven the status vocabulary cannot be applied at all. **Recorded rather than cleared, deliberately.** Ticking 265 boxes to make the fraction computable would assert per-task evidence nobody gathered, which is the exact failure this program exists to catch — and it would be far harder to detect afterwards than the zero is now. `030` and `031` were reconciled task-by-task against the tree in this session and are what that costs: each tick carries what closed it, and three of `030`'s were marked *gated* rather than done because the decision they wait on defers them. |
| `000` declares Planned over nine checked tasks | `spec.md` declares Status Planned; `tasks.md` carries nine checked implementation tasks and the lane journal independently records the acquire, the token-root edit and a release "with a debt". Work started, so the contract also wants an implementation summary. Recorded, not resolved: writing one means asserting what `000` delivered without having verified it |

### `007` cannot reach Errors: 0, and should not be made to

It declares itself *"Not a program phase. It gates nothing and appears in no execution order"*, and
it has no `spec.md`, `plan.md` or `tasks.md` by design. The validator sees a directory under a phase
parent and checks it as a child, so it reports two errors that no honest edit removes — reaching
zero means writing three documents whose only reader is the validator.

Adding its template marker did briefly make it worse: the marker switched on a sufficiency check
that free prose never triggered, and the empty completion anchor became a third error. That one was
real and is fixed — its criteria are now written, both met, and checked by opening the files.

Doing that also caught the folder describing itself wrongly. It recorded one lineage; there are
two. `luna-xhigh` holds 10 iterations and a 29K `research.md`, `grok46-xhigh-architecture` holds 5
and 23K, and both sets live one directory deeper than the path it gave. A phase whose own trap is
*"never trust the exit status, go and look"* had not been looked at.

### Traps

**A file count is the wrong instrument for capture churn, and this line used to be one.** It claimed 12 files churn on an identical rerun. Measured, the count is neither 12 nor stable: one identical rerun moved 2 files, both `timeline-view-desktop`, and a later one moved a set including `calendar-week-time-grid-desktop-dark` instead. There is no floor to read a diff against, because the set itself varies. What every instance has in common is scale — the worst seen is 25,048 of 5,184,000 pixels at a maximum channel delta of 38, and the calendar one is 13 — spread across a whole content block rather than concentrated at any element, which is what antialiasing looks like and is not what a moved element looks like. **The instrument is `layoutHash`**, which the capture tool records for exactly this reason: across all of it, 0 of 240 manifest entries moved, and `bytes` was the only field that changed. Read a capture diff against that, and open the image when it moves. **One fix was tried and withdrawn.** The layout fingerprint is taken before `document.fonts.ready` is awaited, so it and the image beside it describe different moments — which sounds like the cause and is not. A probe measuring the geometry on both sides of that wait reported 0 differences across the entire scenario set, so the reorder is inert and was reverted rather than banked. A criterion can be
wrong in **both** directions: one here passed against the defect because right-alignment pinned the
edge it measured, and another failed a correct implementation by forbidding the reference layout it
was copying. A unit test that asserts on source text passes for a broken implementation and fails for
a correct one spelled differently. Flex properties are inert on grid items. `:not()` raises
specificity and wins fights it used to lose — tried on the container box, moved 34 captures,
reverted. A fixture containing none of the thing under test measures nothing. A derived number
written in a comment goes stale silently — `48 = 24 + 16 + 8` was true when written and nothing
recomputed it when both controls grew to 28px. A pipe makes `$?` the pipe's status.

### The blank-cell criterion, and why its first instrument was theatre

Written as "no coverage table has a blank cell" and measured with a grep for adjacent pipes. That
detector matched 23 rows across five phases. A markdown parser over all 29 found **zero** empty data
cells: 21 were the legal empty header corner of a label-column table, and 2 were a JavaScript `||`
inside a code span.

So two phases with complete, closed tables failed a completion criterion because they quoted code,
and the only way to satisfy it was to corrupt a citation. That is a criterion failing a correct
implementation — one of the two banned shapes, sitting in the checklist meant to enforce them.

It also fails this program's own theatre test: delete every piece of evidence from a coverage table
and the count does not move. Add fabricated evidence and it does not move either. And `004`, the one
phase the roadmap names as having blank evidence cells, scores zero on it.

The criterion's intent was right and its instrument was wrong. Corrected above to name the property —
an empty **data** cell — rather than a string that correlates with it.

### Gate

`SURFACE_PHASE=<phase> npm run gate` runs 13-14 checks. `npm run replay` re-asserts 8 results against
their recorded pre-fix numbers. Lane: `tools/lane/css-lane.json`.

### DONE row 7, tested against the symlinked Public path and still open

Row 7 wants this parent at `Errors: 0`, and today it fails on one rule only:
`SPECDOC_FRONTMATTER_004`, three times, because `packet_pointer: "005-component-surface-system"` is a
single segment where the kit's regex wants two. A candidate fix was tested on 2026-09-02 and
rejected. The Public monorepo's `specs/obsidian` is a symlink to this repository's `specs/` — same
inode, checked with `stat` — so `obsidian/005-component-surface-system` names this exact packet in two
segments without inventing a folder. Set on all three root pointers, it cleared
`SPECDOC_FRONTMATTER_004` and immediately failed `METADATA_DISK_PATH_CONSISTENCY` instead, from both
roots: `continuity.packet_pointer=obsidian/005-component-surface-system
expected=005-component-surface-system`. That rule takes the expected id from the folder leaf and does
not resolve the symlink, so no pointer spelling satisfies both rules at once. Validated from the
Public root the result was worse still — `Errors: 1 Warnings: 1` against the repo form's
`Errors: 1 Warnings: 0` — the extra warning being `GRAPH_METADATA_CHILD_DRIFT`, since `children_ids`
are stored under the unprefixed id. The change was reverted; the pointers read as before. Row 7 stays
unticked and its disposition remains the operator's, per `repo-rules/spec-tree-layout.md` §4.

**2026-09-02, the disposition narrowed to one and it is not this program's to take.** The two-segment
`obsidian/…` pointer was tested today from both repository roots, this one and the Public monorepo, and
`METADATA_DISK_PATH_CONSISTENCY` failed in both: the rule derives the expected id from the folder leaf
and never resolves the symlink, so `obsidian/005-component-surface-system` can never equal
`005-component-surface-system`. That closes the fourth disposition for good. Of the three
`repo-rules/spec-tree-layout.md` §4 records, the second undoes the flattening and the third leaves row 7
permanently unticked as an accepted divergence, so **the only one that closes row 7 without reversing
the flattening is the first: amend `SPECDOC_FRONTMATTER_004` to accept a single-segment
`packet_pointer`.** That rule lives in the shared kit at
`system-spec-kit/mcp-server/lib/validation/spec-doc-structure.ts`, which is symlinked from the Public
monorepo and read by every repository that uses it, so the edit is not local and no one here may make
it. **It awaits the operator.** Until then row 7 stays unticked, `npm run gate` remains this
repository's authority, and a program root reporting `SPECDOC_FRONTMATTER_004` is expected rather than
a regression to chase.

**2026-09-02: the disposition is decided.** The first option above is taken: `SPECDOC_FRONTMATTER_004`
will be amended to accept a single-segment `packet_pointer`. The edit is not local, so the work is
dispatched to the Public repo, tracked at `specs/system-speckit/050-single-segment-packet-pointer`.
Row 7 stays unticked here until that packet ships and this program's pointers are re-validated against
it. See `repo-rules/spec-tree-layout.md` §4, updated to record this as the taken disposition.

**2026-09-02, closed: that packet shipped and row 7 is ticked.** Re-validated by this audit —
`validate.sh specs/005-component-surface-system --strict`, `grep -c SPECDOC_FRONTMATTER_004` returns
**0**. So the paragraphs above are the record of a rule that no longer fires here, kept because the
four dispositions and why three of them failed are the reason the fourth was taken. A program root
reporting `SPECDOC_FRONTMATTER_004` is no longer expected; if one does, it is a regression.

### Report 29: fresh operator report against 1.4.0, dispatched for diagnosis

**2026-09-02.** A new operator report, quoted in full at `roadmap.md` §4 row 29: *"In this version a
lot of sheets are bugged, drag handler dont work or no way to close or they pop up and than
dissapear and than freeze app."* This is the first device evidence this program has had since
1.3.1 — the operator's phone runs plugin release **1.4.0**, tagged today, and three distinct
symptoms are bundled in the one report: the sheet drag handle does nothing, some sheets cannot be
closed by any means, and one sheet appears, disappears immediately, then freezes the app entirely.
OS and which specific sheets are affected are both unknown; both are asked. Severity is
**release-blocking (P0)**.

The suspect commit range is **1.3.1..HEAD** in `mobile-bottom-sheet.ts`, `popover-position.ts`,
`record-detail-panel.ts` and `owned-menu.ts` — the four files that changed sheet lifecycle,
positioning and dismissal since the last release this program has device evidence for.
`031-sheet-lifecycle-ownership` owns the diagnosis: it already carries the drag-handle hypothesis
for reports 26 and 27 (a panel's own content render destroying the grab bar it prepended), and
this report's freeze-then-app-hang symptom is a new shape not yet covered by that hypothesis.

**2026-09-02, same day: diagnosed, fixed and released, and still not closed.** Two commits landed
under `031` — `98da630` takes a modal's sheet chrome down on close, honours `pointercancel` and
widens the anchor tolerance, and `0c92f4d` makes a long press consume the compatibility click it
caused. Both went out in **1.4.1** (`460d4d7`), which the operator installed. The operator's reading
of that build is *"Most sheets seem to work now tho"* — real device evidence, and the first this
program has had that a fix helped. It is a partial, not a close: which sheets, and which of the
three named failure shapes each one still shows, are not established, so the row is owed a per-sheet
confirmation. D3 is the whole reason this distinction is written down.

### Reports 30-33: three fresh device reports plus one bundled correction, iOS, 2026-09-02

**2026-09-02, 21:21-21:24.** Four new operator reports, all from the same iOS device that produced
report 29, quoted in full at `roadmap.md` §4 rows 30-33. **Row 30** — the "All views" view-switcher
bottom sheet draws five action icons per row on a 393px phone, titles truncate, and every row reads
as a wall of glyphs where the operator expects one overflow control. Screenshot:
`scratch/device-2026-09-02/view-switcher-sheet-ios.png`. Routed to **`001-overlay-placement-and-menu-language`**:
the row is hand-built by `showAllViewsHub`/`renderInlineViewAction` (`toolbar-renderer.ts:1037-1111`)
rather than the shared `createMenuRow` factory, and `001/spec.md` §3 already scopes exactly this —
retiring `toolbar-renderer.ts`'s hand-rolled row builders onto the one row grammar — where `027`'s
inventory only covers rows already built through `createMenuRow`/`db-menu-item`. **Rows 31-32** — the
selection status bar stays docked over/under the floating add button while a sheet is open, and an
inline numeric-cell editor lands on top of it, clipping the cell count and stacking a second action
row above the keyboard; separately, `"1 cells selected"` has no singular form
(`src/i18n.ts:287`, `toolbar.selectedCells`). Screenshot:
`scratch/device-2026-09-02/cell-editor-over-selection-bar-ios.png`. Both routed to
**`022-selection-bar-keyboard-docking`**, which already owns the bar's docking mechanism. **Row 33**
— the record detail sheet does not behave when its content overflows 100vh; no screenshot yet.
Routed to **`010-sheet-reading-and-keyboard`**, which owns the phone record sheet's reading layout
and scroll behaviour; `023-record-note-body` was considered and rejected as owner because it is
deliberately not startable (the operator has not chosen display-only vs editable) and ships no code
today, so it cannot hold a bug against the sheet as it currently exists. The four were recorded in
`62c4fe7`.

**Where they stand, 2026-09-02.** A fix for them is **in flight and uncommitted** — the working tree
carries edits to `src/i18n.ts`, `src/views/toolbar-renderer.ts`, `src/views/record-detail-panel.ts`
and `src/views/mobile-bottom-sheet.ts` among others, plus a new `src/i18n-plural.test.ts`. Nothing of
it is committed and none of it is released, so all four rows read as **not shipped** and the
1.4.2 that would carry them does not exist yet.

**Also 2026-09-02, same device, same session.** Row 29 gained a partial: the operator wrote *"Most
sheets seem to work now tho"* on the build after `98da630`/`0c92f4d` (the modal-sheet-chrome-on-close
and cancelled-gesture-dismissal fixes). Recorded at `roadmap.md` §4 row 29 as **partially confirmed
on device** — sheets open and close on that build — with the full discriminating sequence (drag
*after* editing a field, tried against each of the three named failure shapes) still owed. The row
stays open; a partial is not a close under D3.

### Five port phases opened, 2026-09-03

**2026-09-03T00:05:00Z.** `037-timeline-gantt-port`, `038-board-kanban-port`,
`039-calendar-parity-port`, `040-subtask-tree-port` and `041-shared-ui-ux-port` were opened from
`036-obsidian-pm-ui-harvest`'s Final adoption plan (`036/research/research.md`), in the plan's own
order. Every completion-criteria row in all five is unticked; nothing has run yet. `roadmap.md` §5.2
now names each folder and reads "Opened" in place of "Planned, not opened"; `spec.md`'s Phase
Documentation Map carries the same five rows with each child's declared level (`040` at Level 3,
raised over `recommend-level.sh`'s Level 1 for the reason its own `spec.md` §1 records). This does
not change `completion_pct` — the parent's 57% basis is unaffected because it is a program-wide
figure over the phases that were already counted, and the five new phases enter at 0%.

### Reports 34-36: three fresh device reports, iOS, 1.4.2, 2026-09-03

**2026-09-03 ~06:40 CEST.** The iOS operator, after installing **plugin 1.4.2**, reported three new
defects, quoted in full at `roadmap.md` §4 rows 34-36: **row 34** — *"add sort button is broken in
sort sheet"*, the sort configuration bottom sheet's add-sort control does nothing. **Row 35** —
*"filter add condition closes / crashes it"*, then *"filter table sheet"*, the table view's filter
bottom sheet closes or crashes when Add condition is tapped. **Row 36**, a named class rather than a
single symptom — *"a lot of sheets have that"*: controls inside a bottom sheet that mutate the
sheet's own content close or crash the sheet on the phone, of which 34 and 35 are the first named
instances; the operator has not yet said whether the failure is nothing-happens, an immediate close,
or a freeze. All three are **recorded, not investigated**: owner is pending the in-runtime diagnosis
running now, none is operator-confirmed, and all three are open.

### Reports 34-36 fixed, 2026-09-03 ~07:10 CEST

The in-runtime diagnosis referenced above landed as `85ff504` (`fix(sheets): keep a rebuilt panel
inside its own sheet`), owner **`031-sheet-lifecycle-ownership`**. Mechanism: the sort, filter,
view-config and column-manager panel renderers remove and recreate their panel node on every
add/toggle/remove; the overlay stack's outside-pointerdown check held the node captured at
`register()` time, so the first in-panel rebuild left it stale and the next tap anywhere in the
live panel read as OUTSIDE and closed the sheet mid-edit. On the embedded surface a
container-scoped lookup never matched at all once `mobile-bottom-sheet.ts` portals the sheet onto
`document.body`, so dismissal never registered there in the first place. Fix: `OverlaySurfaceOptions`
gained an optional `getPanel()` resolver that `OverlayStack.livePanel()` re-asks on every dismissal
check, and `database-view.ts`/`embedded-database-renderer.ts` now pass their renderer's own
`getPanel()` for all four panel kinds. Red observed in `tools/live/sheet-rebuild.mjs` with
`overlay-stack.ts` reverted, for both the sort and filter cases; green after. Lane exits:
`sheet-rebuild` 0, `sheet-teardown` 0, `render-assertions` 0, `touch-targets` 0; `tsc` 0; `vitest`
761 passed; `lint` 145 (pre-existing baseline, unchanged); `scan-comments` 0. This is a **new**
mechanism in the same overlay-stack seam `031` already owns — not one of that packet's six
originally-ranked findings — and is recorded there. Not released (1.4.3 pending) and **not
operator-confirmed**; `roadmap.md` §4 rows 34-36 updated to match.

### `037-timeline-gantt-port` landed, 2026-09-03

`0262386` (range geometry, cycle-safe dependency-link seam) and `55bff9b` (five scales, header/grid,
milestone, progress, link affordance) closed the packet's own six-item completion gate: 17 of 17
module-map rows rewritten and matching, the link seam red-first (12 of 12, `TypeError:
resolveTimelineLinkChange is not a function`) then green, keep-local behaviours untouched, `css-lane`
released naming 21 captures, `npm run gate` PASS 25 green observed twice by fresh in-runtime agents, and
`validate.sh --strict` first `RESULT: PASSED`. Two product bugs were fixed on the way (every hour column
painted `is-today` at day scale; the year printed twice in the year title). Nine fresh in-runtime rounds
ran; the code held from round three, and eleven defects found in the ninth round (header/axis mismatch,
zero-width mount fallback, span-in-button nesting, link-dot overlap, low-contrast meta, milestone-label
overpaint, clipped mobile axis label, unusable day/year scale at phone width, a harness padding note, and
a pre-existing duplicated CSS block) are recorded as open rows in `037/goal.md` §3, not fixed in this leg.
Will ride release **1.4.4, pending**; **not operator-confirmed**. `roadmap.md` §5.2's port-phases row
updated to match.

### `041-shared-ui-ux-port` landed, 2026-09-03

Two legs. `cb9aedf` (dispatched to `cli-devin`, then verified in-runtime) reconciled three tasks
named in the packet's own `tasks.md` — T005, T008, T009: `EmptyStateRenderer`'s message element now
matches the reference's paragraph body shape, the display-width toolbar toggle announces its state
via `aria-pressed`, and a new `PluginSettings.defaultViewType` field plus its Settings dropdown row
let a new database's default view be chosen, localized across `en`, `zh-CN` and `zh-TW`. Red-first,
verified in-runtime: `empty-state-renderer.test.ts:160` ("expected 'div' to be 'p'"),
`toolbar-renderer.test.ts:41` (source-string contain failure on `aria-pressed`), and
`settings.test.ts:319/339/350/354` ("expected undefined to be defined/false"); 45/45 green after,
across the four changed/new test files. `cli-codex` then carried a second leg, rebased onto `main`
and verified by a fresh Opus reviewer as `25ae3a9`: four semantic role tokens, a `.db-surface` arm on
the accent focus ring for a menu portalled to the body, `margin: 0` on `.db-empty-card-message`, and
the timeline event bar's nested `span[role="button"]` link dots replaced with a native
`.db-timeline-event-trigger` button and native sibling buttons — the reduced-motion coverage task was
checked against this leg and found already complete, so nothing there was extended. Four speculative
rules the leg carried were dropped on inspection rather than shipped. `touch-targets` moved from 277
to 253 controls under 28px against an unchanged baseline of 279. 18 captures were read, not counted,
and every one opened against its `cb9aedf4` copy; the lane released naming all 18. `npm run gate`
read PASS, 25 green, both `SURFACE_PHASE=041-shared-ui-ux-port` and bare, and `validate.sh --strict`
first `RESULT: PASSED`. Two open rows stay recorded in `041/goal.md`: reduced motion still misses an
owned menu's descendants when that menu is not wrapped in the container class, and six captures moved
in one run and reproduced their committed bytes in another, so the harness is not byte-deterministic
for them. Neither commit is operator-confirmed, and no release has been cut for either leg yet.
`roadmap.md` §5.2's port-phases row and §5.3's release-cadence line updated to match; `spec.md`'s
Phase Documentation Map row for `041` updated to match. This does not change `completion_pct` — the
same basis as the `037` entry above applies: none of the parent's seven §3 rows turn on an individual
port phase landing, so the 57% figure is unaffected. Release 1.4.6 is planned to bundle this landing
with `039-calendar-parity-port` and `040-subtask-tree-port`, both landed on their own worktree
branches (`worktrees/004-calendar-parity-port` at `9ae6ea3`, `worktrees/005-subtask-tree-port` at
`cf91587`) and not yet merged to `main`.

### `039-calendar-parity-port` landed, 2026-09-03

Two legs plus a reconciliation. `57043e7` (dispatched to `cli-devin`, then verified in-runtime)
read completion from the view's own checkbox column (`isRowCompleted`), applied `is-completed`/
`is-weekend` across month/week/day segments, popover and timed events, added the backlog's
"Nothing unscheduled." empty line, and landed calm empty-state copy in `en`/`zh-CN`/`zh-TW`.
Red-first: `calendar-renderer.test.ts`'s parity block read `8 failed | 7 passed (15)` before any
renderer edit; green after. `1588576` (dispatched to `cli-codex`, one in-runtime fix round, two
Opus verifications) styled the marks: `.is-completed` dims and strikes through rather than
repainting, so a completed event keeps its row's own status colour — a first draft's `!important`
background override was rejected; weekend cells take a 4.3-9.0% tint; the empty card reads its
density from a token on `.note-database-container`; reduced motion now covers the month and
week-grid flash columns too; the capture theme gained Obsidian's `--color-green`/`--text-success`
so the strikethrough renders in status colour instead of falling back to accent purple; a
calendar empty-state capture scenario was added; and the fixture parity suite was bound to i18n.
20 captures read; `css-lane` released; `npm run gate` PASS 25 green; `validate.sh --strict` first
`RESULT: PASSED`. The month fixture's 112px cell height is confirmed as the product's own default
(`getCellMinHeight`), not a framing artifact — `runtime-vars.css`'s viewport-derived formula was
the inaccurate value, not the fixture.

`d8a2508` reconciled both legs onto `main` after `038-board-kanban-port` and `041-shared-ui-ux-port`
landed: `styles.css` merged purely additively (039's rules append after 041's, 0 lines removed), 12
of 260 recaptured screenshots moved on byte-only encoder noise with an identical `layoutHash`, all
twelve opened and read correct, and `tools/live/*.json` re-generated fresh against the merged tree.

Four rows stay open in `039/goal.md`: `T6` (re-exercise move/resize/quick-add against the
completion marker), `T11` (operator confirms on device), the capture harness's absent Obsidian
`.mod-cta` rule, and `runtime-vars.css`'s viewport-derived cell-height formula, which the month
fixture now mirrors but leaves wrong for any future scenario. Neither leg is operator-confirmed,
and release **1.4.6** is planned to bundle this landing with `040-subtask-tree-port`. This does
not change `completion_pct`: the same basis as the `037` and `041` entries above applies, none of
the parent's seven §3 rows turn on an individual port phase landing, so the 57% figure is
unaffected. `roadmap.md` §5.2's port-phases row and `spec.md`'s Phase Documentation Map row for
`039` updated to match.

### `040-subtask-tree-port` landed, 2026-09-03

Two legs. `1d611db` (dispatched to `cli-devin`, resumed after a connection loss, verified
in-runtime) derives the subtask relation over `RowData[]` — never nested, per ADR-001 — and adds
`planSubtaskMove` as the single atomic write path with a cycle guard, per ADR-002, plus hydrate and
serialize modules and an optional pipeline stage carrying byte-identical diagnostics. Red-first:
`Cannot find module './subtask-hydrate'` before the three modules existed; 47/47 green after.
`00b7bd2` (dispatched to `cli-codex`, one in-runtime fix round after a rejection for an
unconditional subtask class and an add input on every card, then rebased onto `main` and verified
by a fresh Opus reviewer) puts depth on the board card's own outline, an expand toggle, an
explicit-vs-derived progress distinction, an inline add row only on an expanded parent, and a
Move-under menu bounded to the group and capped at 20, with host handlers wired through
`planSubtaskMove` and `ViewConfig.subtaskCollapsed` carrying per-view collapse state. Four reds
seen across the relation, data-source and two fixture probes; the tree got its own board and
timeline scenarios so the ordinary ones stayed unchanged. 21 captures read; the lane released
naming all 21; `npm run gate` PASS 25 green; `validate.sh --strict` first `RESULT: PASSED`.

Two rows stay open, recorded in `040/goal.md` rather than here: drag-reorder inside one parent
still routes rank-only because every host binding drops the `subtaskMove` argument, so the board
and timeline disagree; and the host `moveSubtask`/`toggleSubtaskCollapsed` bodies have no test
harness — their inputs and output shape are covered, the call itself is read, not run. Both ADRs
stay Proposed in `decision-record.md`. Neither leg is operator-confirmed. `037`, `038` and
`039`/`041` already shipped in 1.4.4, 1.4.5 and 1.4.6 respectively; `040` is the last of the five
and missed 1.4.6, so it will ride release **1.4.7, pending**. `roadmap.md` §5.2's port-phases row
and `spec.md`'s Phase Documentation Map row for `040` updated to match.

This does not change `completion_pct`: the same basis as the `037`, `039` and `041` entries above
applies — none of the parent's seven §3 rows turn on an individual port phase landing, so the 57%
figure is unaffected.

### Done-audit-2, 2026-09-03T23:40:00Z: rows 3 and 6 unticked, 4 and 7 re-verified, 5 confirmed still open

A fresh in-runtime pass audited §3 rows 3-7 against the tree at `421995b`. **Row 3** read too
loosely: `chart` is a live, user-selectable `DatabaseViewType` (`data/types.ts:317`,
`settings.ts:78`) that no gate lane ever constructs (`grep -in chart render-assertion-
harness.ts` returns nothing), and the covered calendar lane only builds `scale: "month"`, never
`"week"` or `"day"`. Unticked. **Row 6** was ticked on one real negative control (`c5566db`,
board/gallery/table) but the wording names four dependency classes and only one had been
checked: a pinned viewport formula for calendar cell height already known wrong (`039`'s own
log), stubbed action bags (by design, now named rather than assumed harmless), two of the 25
gate lanes (`touch-targets`, `unstyled-links`) plus the whole screenshot pipeline reading
hand-authored fixture markup instead of a constructed renderer, and Obsidian's own `.mod-cta`
rule absent from the capture theme (already an open row in `039/goal.md`). Unticked. **Row 4**
re-verified fresh: both `SURFACE_PHASE=040-subtask-tree-port npm run gate` and bare `npm run
gate` exit 0, 25 green, `$?` read directly. **Row 5** re-verified still open: `npm run replay`
holds 8/8 but its five covered phases (`000`, `001`, `002`, `004`, `005`) predate every landed
result this program has shipped since — report 29's fix, reports 34-36's fix, and all five
port-phase landings (`037`-`041`) carry no recorded pre-fix number for replay to check. **Row 7**
re-verified fresh, `Errors: 0`, first `RESULT: PASSED`, run to completion without a truncating
pipe. `completion_pct` recomputed 2 of 7 ÷ 7 = **29** (was 57 at 4 of 7): only rows 4 and 7 hold.
Basis: `roadmap.md` §3.2's checklist rule, the same basis as every `completion_pct` figure in
this file. `spec.md` and `handover.md` are outside this audit's write scope (parent `goal.md`
DONE table and log only) and still carry the prior figure; the divergence is flagged, not fixed,
exactly as the prior audit's own paragraph above flags its own.

### `038` and `040` open rows closed, 2026-09-04, release 1.4.8 in flight

`038-board-kanban-port`'s hover/drag/drop-target/empty-column row closed in `7e36671`: two new
board scenarios (`board-empty-column`, `board-drop-language`) mirror `renderColumn`'s empty-group
branch and the drag handlers class-for-class, red observed (`db-board-drop-indicator` nesting
mutation), eight captures read, `npm run gate` PASS 25 green, no stylesheet edit. `040-subtask-
tree-port`'s drag-reorder row closed in `535373a`: both board host bindings (`database-view.ts`,
`embedded-database-renderer.ts`) now forward the planned `subtaskMove` through `moveSubtask`'s one
write path and abort on a rejected write — a devin lane then a fresh in-runtime verifier, red
re-observed independently (`expected "vi.fn()" to be called 2 times, but got 0 times`), a new host
harness added, both ADRs moved to Accepted in `040/decision-record.md`, gate 25 green. Release
**1.4.8** is being cut from these two commits by a release leaf in a separate clone; not run here.
Still in flight on their own branches: `037`'s remaining four open rows (leg a landed, the CSS/
fixture leg in verification), `041`'s reduced-motion row (the fix landed, a placement-lane
regression is being resolved), and `042-harness-fidelity-and-replay` (a devin initial pass only).
`completion_pct` stays **29**: no §3 DONE row changed on this pass, per D13 the figure is derived
from that checklist alone, not from port-phase landings. `roadmap.md` §5.2's `038` and `040` rows
updated to match.

### `041`'s last open row closed, 2026-09-04, release 1.4.9 pending

The reduced-motion row left open when `041-shared-ui-ux-port` landed — reduced motion not reaching
an owned menu's descendants — closed on `main` in three commits rebased onto `1eb4ab2` (1.4.8).
`a251a43` fixed the original gap: `owned-menu.ts` mounts its surface on `doc.body` carrying
`.db-surface` but never `.note-database-container`, so the container-wide reduced-motion reset
never matched a menu descendant; `.db-surface` now leads that reset's selector list, red-first via
a source-string test. That fix then regressed the placement lane: the reset gave `.db-surface` a
`0.01ms` transition-duration with no `transition-property`, so the default `transition-property:
all` made every animatable property on the subtree actually transition, and `verify-placement.mjs`'s
synchronous `getComputedStyle` read after a style mutation could land mid-flight and report the
departing value — caught by its `.is-phone` heading-rule ablation, FAIL. `3f143df` fixed it: nothing
under `.db-surface` waits on `transitionend`/`animationend`, so `.db-surface` now gets its own
reduced-motion rule with `transition-duration: 0`, an honest zero rather than a race; placement lane
FAIL→PASS. `471860d` reconciled all three onto `1eb4ab2`: `tools/live/*.json` re-run fresh against
the rebased `styles.css` (16/16 fresh), `css-lane.json` kept main's history and appended 041's own
acquire/edit/release entries, `operator-checklist.md` regenerated, `graph-metadata.json` backfilled
with no drift. `npm run gate` PASS, 25 green, 0 red; `validate.sh --strict` on `041` first `RESULT:
PASSED`.

Neither commit is operator-confirmed. The landing ships in **1.4.9 (pending)** bundled with
`037-timeline-gantt-port`'s own open-row fixes — three of its four remaining rows are now visible
in captures, and the day-scale row stays capture-pending on two fixture gaps recorded in `037`.
`042-harness-fidelity-and-replay`'s devin leg a remains in verification, unchanged by this landing.
`completion_pct` stays **29**: none of the parent's seven §3 DONE rows turn on an individual
open-row landing, so per D13/§3.2 the figure is unaffected — the same basis every port-phase entry
above states. `roadmap.md` §5.2's row for `041` updated to match.

### `037`'s open rows landed, 2026-09-04, release 1.4.9 pending

Three of `037-timeline-gantt-port`'s four remaining open rows closed on `main` in two legs, each
verified by a fresh reviewer: a devin TypeScript leg (`fa58c7f`, originally `27fae8b`) titled the
rendered window for quarter and year scales, made the first axis tick label whole on mobile, and
narrowed the day scale to 32px columns below a 560px container; a codex CSS-and-fixture leg
(`b29bf7f`, originally `e94b148`) lifts a milestone label above its bar when the next bar starts
within its width, moving the lane's `row-gap` onto the `space-8` token — a change to lane rhythm on
every timeline capture, read and accepted. `65fb7dd` reconciled both onto `main`. Reds observed
before green: `expected '2026-01-01' to be '2026-02-07'`, `expected '2025' to be '2025 — 2026'`,
`expected undefined to be 'none'`, `resolveTimelineMilestoneLabelPlacement is not a function`,
`expected 60 to be 32`. `npm run gate` PASS, 25 green. Three rows are now visible in captures; the
day-scale row stays capture-pending on two fixture gaps recorded in `037` — the fixture's day
window never centres on `now`, and its day tick labels still read `HH:00` where the renderer now
emits `HH`.

The landing ships in **1.4.9 (pending)**, bundled with `041`'s reduced-motion fixes above. Neither
is operator-confirmed. `completion_pct` stays **29**: none of the parent's seven §3 DONE rows turn
on an individual open-row landing, so per D13/§3.2 the figure is unaffected — the same basis every
port-phase entry above states. `roadmap.md` §5.2's row for `037` updated to match.

### Done-audit-3, 2026-09-04T03:40:00Z: row 3 closed, rows 5 and 6 narrowed, 4 and 7 re-verified

A fresh in-runtime audit checked §3 rows 3-7 against `7e9fd27`. **Row 3** ticks: all seven
`DatabaseViewType` values are now constructed — list, table, board, gallery, timeline, chart, and
calendar at month, week and day. `node tools/live/render-assertions.mjs` disarmed exits 0; armed
`RENDER_READ_CONTROL=per-item` exits 1 with 11 reds (chart 1630 against bound 48; calendar week 14
and day 1600 against bound 8; board/gallery 1601 and table 2003 against bound 8, carried from the
earlier controls). Coverage moves from 6 of 22 renderer files to 7 of 22 distinct renderers. **Row
5** narrows but stays open: `replay.json` now carries claims for report 29, reports 34-36
(delegated `031` claims) and both legs of phases `037`-`041` (10 claims, pre-fix audited), but six
open-row fix commits still carry no replay claim — `7e36671`, `535373a`, `3f143df`, `a251a43`,
`fa58c7f`, `b29bf7f` — and a lane is adding them now. **Row 6** narrows but stays open: of the four
dependency classes named in its wording, two are removed (`runtime-vars.css`'s calendar
min-height formula now matches production's `getCellMinHeight()` at 112px; `theme.css` now
declares `.mod-cta`, transcribed from Obsidian 1.13.4), and two remain declared —
`touch-targets.mjs`/`unstyled-links.mjs` and the shared capture-pipeline fixtures back two of the
25 gate lanes row 4's green counts. **Row 4** and **Row 7** re-verified fresh: `SURFACE_PHASE=042-
harness-fidelity-and-replay npm run gate` and bare `npm run gate` both exit 0, 25 green, no stray
Chrome; `validate.sh specs/005-component-surface-system --strict`, first `RESULT:` line `PASSED`,
43 of 43 folders `PASSED`, `Errors: 0`. `completion_pct` recomputed 3 of 7 ÷ 7 = **43** (was 29):
rows 3, 4 and 7 now hold. `spec.md`'s Phase Documentation Map row and `roadmap.md` §5's bullet for
`042` updated to match; rows 5 and 6 remain this phase's open work.

### `037`'s last open row closed, 2026-09-04, all four rows confirmed

`037-timeline-gantt-port`'s day-scale row — the last of its four remaining open product rows —
closed on `main` in `7ca6cc2` (leg d): `temporal.mjs`'s day branch now centres the fixture window
on the pinned `now` through the same clamp `resolveTimelineDayCentredStartMinutes` uses, and its
tick labels drop the `":00"` suffix to match what `buildTimelineTicks` emits. Red observed first:
`temporal-tick-parity.test.mjs`'s new window- and tick-label-parity assertions failed 4 of 118
(`startMinutes` 0 vs 60 desktop / 480 mobile; labels `"HH:00"` vs `"HH"`), green after (118/118).
Captures read: `timeline-view-day-desktop-{light,dark}.png` show 23 hourly columns;
`timeline-view-day-mobile-{light,dark}.png` show 11 columns 08-18 with the 13:00 tick and the
now-line in frame, no label collision. 16 captures named in the `css-lane.json` release (12
verified encoder noise). `npm run gate` PASS, 25 green.

All four of `037`'s open product rows — title/axis contradiction, milestone label, tick-clip and
day-scale — are now closed and visible in captures. Neither `037` nor `041` is operator-confirmed.
`completion_pct` stays **43**: no §3 DONE row changed on this pass — rows 3, 4 and 7 still hold,
the same 3-of-7 basis the prior audit derived — per D13/§3.2 the figure is derived from the
parent's own checklist alone, not from a child phase's open-row landing. `roadmap.md` §5.2's row
for `037` updated to match.

### Done-audit-4, 2026-09-04T06:40:00Z: rows 5 and 6 re-audited and narrowed further, 4 and 7 re-verified

A fresh in-runtime audit re-checked §3 rows 4-7 against `8759399` (main, equal to origin). **Row
5**: `node tools/live/replay.mjs`, `$?` read directly `0`, 27 claims, `reversed: 0`. The six
open-row claims `5fa0b0c` added are all pre-fix-audited against `<sha>^` (T024). Every landed
result this audit's dispatch named now carries a claim — reports 29/34-36 (delegated by design,
proven by negative control rather than a differing number), both `037`-`041` legs (10 claims,
`was` differs from `recorded` on all 10, confirmed in `replay.json`), and the six open-row fixes
(differs on all 6) — except `7ca6cc2`, `037`'s fourth open row (day-scale fixture centring, `HH`
tick label), which this parent's own prior entry calls "the last of its four remaining open
product rows" in the identical language used for `fa58c7f`/`b29bf7f`. Reading `replay.mjs`'s
`037` measures in full confirms neither existing claim reads `temporal.mjs`'s day-branch centring
or tick-label suffix, so this is a genuine gap, not a double-count. `042`'s own four commits
(`7e9fd27`, `5fa0b0c`, `bea1b1c`, `8759399`) stay out of scope for a claim — none closes another
phase's documented open row, and the instrument cannot certify itself. **Left unticked**, narrowed
to one commit. **Row 6**: of the four dependency classes, (1) and (4) stay removed. (2)/(3) moved
from declared to declared-and-cross-validated for `touch-targets.mjs`/`unstyled-links.mjs` — a
constructed-renderer pass (`8759399`) now measures real `src/views` output for both and found four
real touch-target classes no fixture could see — but the fixture pass was supplemented, not
replaced, and still counts toward two of the 25 gate lanes' green (unchanged: 264/279, 112/70).
`css-lane`, `screenshots-fresh` and `device-parity` (three more lanes) still read only hand-written
fixtures with no constructed counterpart; `check-lane.mjs` now compares by content
(`pixelHash`/`layoutHash`, `bea1b1c`) rather than raw bytes, but the fixtures themselves are
unchanged in kind. Per this row's own "check both ways" precedent, a declared-and-bounded
dependency is still a dependency. **Left unticked**, narrowed to the fixture passes of five gate
lanes. **Row 4** and **Row 7** re-verified fresh: `pgrep` empty before each gate run;
`SURFACE_PHASE=042-harness-fidelity-and-replay npm run gate` and bare `npm run gate` both exit 0,
25 green; `validate.sh specs/005-component-surface-system --strict`, output to a file rather than
a pipe, first `RESULT:` line `PASSED`, 43 of 43 folders `PASSED`, `Errors: 0  Warnings: 0`.
`completion_pct` stays **43**: no §3 DONE row changed on this pass — rows 3, 4 and 7 still hold,
the same 3-of-7 basis. `roadmap.md` §5's `042` bullet updated to name the three lanes landed since
the prior audit (27-claim replay incl. the six open-row fixes `5fa0b0c`; the pixel-hash manifest
compare `bea1b1c`; the constructed-renderer touch-target/link measures `8759399`) and the two
remaining gaps (`7ca6cc2` for row 5; the fixture passes for row 6).

### Done-audit-5, 2026-09-04T09:10:00Z: row 5 ticked, row 6 stays open, 043 opened

A fresh in-runtime audit re-checked §3 row 5 against `8a79ff8` (main, equal to origin at `c2de984`).
`7ca6cc2` (`037`'s fourth and last open product row, the day-scale fixture centring) had landed
with no replay claim; `8a79ff8` adds it, measuring two-digit day tick labels plus centred start
minutes across both device widths, pre-fix `0`, recorded `574`. `node tools/live/replay.mjs`,
`$?` read directly: `0`, "replay: PASS — all 28 results still hold", `reversed: 0`. Every landed
product result and every open-row fix this program has named now carries a claim with a differing
pre-fix number; the three lifecycle claims for reports 29 and 34-36 delegate to the sheet-teardown
and sheet-rebuild lanes by design, already proven non-vacuous by negative control rather than a
numeric diff. **Row 5 ticked.** Row 6 stays open on the fixture passes of the same five gate lanes
(`touch-targets`, `unstyled-links`, `css-lane`, `screenshots-fresh`, `device-parity`) done-audit-4
narrowed it to; `043-constructed-capture` (Level 3) was opened for exactly that dependency, `c2de984`,
and a devin initial pass is running against it. Rows 1 and 2 stay open on the operator's own
device confirmation, unrelated to either phase. `completion_pct` recomputed 4 of 7 ÷ 7 = **57**
(was 43): rows 3, 4, 5 and 7 now hold — 3, 4 and 7 held over from the prior audit, row 5 is the
one that moved. `roadmap.md` §5's `042` bullet updated to record the lanes landed since the prior
audit and the `043` row opened for the remainder; §5.3's release cadence line updated through
1.4.10.

### Done-audit-6, 2026-09-04T10:40:00Z: `043` landed at `2ab4942`, row 6 re-audited, stays open

`043-constructed-capture` landed on main at `2ab4942`, equal to origin. A fresh audit re-read row 6
against the merged tree, per the precedent done-audit-5 set: landing a phase is not itself proof its
row closes. Nine constructed scenarios and 36 captures now exist for every registered view, declared
alongside seven of eleven planned fixtures via `fixtureOf`, and two of the three lanes done-audit-4
found no constructed-renderer counterpart for (`css-lane`, `device-parity`) now read the constructed
captures with zero code change. The dependency this row polices did not close: the fixture pass
across all five gate lanes still carries the only evidence for typed rendering and icon fidelity,
because every constructed bench column is untyped text and every icon is the stub's placeholder
diamond. That dependency is now DECLARED and bounded (`fixtureOf`, 7 of 11 pairs; 13 named
fixture-only scenarios) rather than undifferentiated, but per this row's own "check both ways"
precedent (D5), a declared-and-bounded dependency still counts. **Row 6 stays open**, narrowed from
the full fixture pass of five gate lanes to the typed-state and icon-fidelity slice of it.
`completion_pct` stays **4 of 7 = 57**, unchanged: rows 3, 4, 5 and 7 hold, row 6 stays open, rows 1
and 2 stay open on the operator's own device confirmation, unrelated to either phase. `roadmap.md`
§5's `043` bullet updated to record the landing and its own known limitations (AC-002 unmet as
written and needing an operator ruling, the shared manifest kept over AC-006's separate file, the
timeline captured at week scale only); a new "operator rulings owed" line records the AC-002 wording
decision plus the still-outstanding device confirmation of reports 29-36 and the five ported surfaces
on 1.4.10. `spec.md`'s two Phase Documentation Map rows for `043` updated to match, since the doc's
own note requires the row be carried the same in both. `handover.md` refreshed for the same state,
including the in-flight list-view phone-fold diagnosis lane this pass found already running in a
separate worktree, unrelated to `043`.

### Done-audit-7, 2026-09-04T05:40:00Z: row 6 re-audited after T004-T006, narrowed to table, chart and 13 fixtures

A fresh audit re-read row 6 against `bf67475` (main, equal to origin), the T004-T006 typed-data-and-
icons landing (`0af4ca6`, reconciled onto the list mount fix in `bf67475`) that `done-audit-6`
predates. Verified directly rather than trusted from the child's own claim: `node tools/live/typed-
data-assertions.mjs` exits 0, 3 of 3 typed markers with `captureData: true`, 0 of 3 without, on the
same scenario; `REAL_ICONS` in `obsidian-stub.mjs` carries 21 keys; `grep -c fixtureOf tools/
screenshots/scenarios/*.mjs` reads 7. For the 7 declared pairs, the fixture-versus-constructed gap
that justified `done-audit-6`'s "stays open" is closed: both sides now show real typed cells and
real icons, so the remaining difference is curated content, a declared complement rather than a
device-value dependency. The stubbed action bags stay present but are confirmed inert:
`render-assertions.mjs` only compares bag key names, never invokes a member, and `touch-
targets.mjs`/`unstyled-links.mjs` reference no action bag at all, so no capture's green can depend
on their no-op behaviour. Two gaps do not close, read directly in `render-assertion-harness.ts`:
table's column builder (`:1406`) takes no `captureData` argument, so `constructed-table` renders
every cell through the plain-text stub regardless of the option, and table's fixture stays the sole
typed evidence; chart's builder (`:1336`) hardcodes `"text"` and has no per-row field at all, and
never had a fixture either. The 13 named fixture-only scenarios are unchanged and still back the
same five gate lanes' green with hand-authored markup. **Row 6 stays open**, narrowed a second time
to: table's permanently untyped cells, chart's absent per-row typing, and the 13 fixture-only
scenarios. `completion_pct` stays **4 of 7 = 57**: rows 3, 4, 5 and 7 hold, rows 1 and 2 stay open
on operator device confirmation, row 6 stays open on the narrower list above. `roadmap.md` §5's
`043` bullet, `spec.md`'s two Phase Documentation Map rows and `handover.md` updated to match.

### Done-audit-8, 2026-09-04T07:00:00Z: `425d552` lands T027, row 6 narrowed a third time to 13 fixture-only scenarios plus a row-4 dependency

A fresh audit re-read row 6 against `425d552` (main, equal to origin), the T027 landing that closed
`done-audit-7`'s last two open items. Verified directly, not carried over: `node tools/live/typed-
data-assertions.mjs`, `$?` read directly: `0` — 6 of 6 new markers PASS (table's named select pill,
checked checkbox, currency, date and relation icon; chart's per-row value field), all false without
`captureData`, on the same two scenarios; `constructed-list`'s original 3 markers unaffected.
`grep -c fixtureOf tools/screenshots/scenarios/*.mjs` still reads 7, unchanged. Table's
`fileViewTableBag`/`embedTableBag` now route through a real `CellRenderer` when `captureData` is
on, and chart sums a real `number`/`currency` column instead of a flat row count — both gaps
`done-audit-7` named are closed.

What remains is the 13 named fixture-only scenarios, unchanged and counted directly against
`screenshots/manifest.json` (63 fixture ids total lack `fixtureOf`; these 13 are `plan.md`'s own
bounded subset). This audit corrects its own dispatch framing: ten of the 13 are per-view state
variants of already-typed views (mobile width, subtask-tree overlay, sparse fields, an empty
state, a toolbar-options popover), not "menus, sheets, chrome" as a category apart from views; only
the three `chrome-chart-*` entries are chrome/popover elements, and those belong to the chart view.
None is one of the seven `DatabaseViewType` values, so row 3's tick does not depend on them. They
still back `css-lane`, `screenshots-fresh`, `device-parity`, `touch-targets` and `unstyled-links` —
confirmed 5 of the 25 lanes in `tools/gate.mjs` (`grep -n "name:" tools/gate.mjs` = 25). Row 4's own
wording ("exits 0") is met and its tick stands on its own narrower terms, but row 6 asks the wider,
unconditional question, and the answer moved: these five lane exit codes, which together compose
row 4's green, are each computed in part over the 13 scenarios' hand-authored markup with no
constructed or device counterpart to cross-check against. Row 4's green therefore does depend on a
value the harness supplies that a device would not, through this bounded slice — not merely on "the
fixture lanes' own greens." Checked rather than assumed: row 5's 28 replay claims name none of the
13; row 7 is unrelated to captures; the four child `goal.md` files that mention one of the 13
(`018`, `037`, `038`, `039`) disclose it as a fixture-derived fact, per `018`'s own D5, not a hidden
dependency. **Row 6 stays open**, narrowed a third time: no longer table/chart rendering (T027
closed both) and no longer "typed-state and icon fidelity" (closed for all 9 constructed views) —
solely the 13 fixture-only scenarios and the fact that they feed a piece of row 4's ticked green.
`completion_pct` stays **4 of 7 = 57**: rows 3, 4, 5 and 7 hold, rows 1 and 2 stay open on operator
device confirmation, row 6 stays open on the narrower list above. `roadmap.md` §5's `043` bullet,
`spec.md`'s two Phase Documentation Map rows and `handover.md` updated to match.

### 2026-09-04T07:35:00Z: `037` and `038` reopened for a 1:1 reference copy at the operator's request

Two operator directives landed the same minute. First, verbatim: "We should copy their board view
1:1 the one from project manager" — the operator installed obsidian-pm 2.1.0 beside this plugin in
the iCloud vault with a comparison project and judged `038`'s landed legs (`b9e2321`, `a6fcd31`,
column/card composition restyled from `kanban.css`) not close enough. Second, same pattern for the
timeline: "Same for timeline" — apply the identical amendment to `037` against
`obsidian-pm-main`'s `GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/
`TimelineConfig.ts`/`gantt.css`. Both child packets gain a new P0 requirement (REQ-007) and a
superseded decision record (`goal.md` D6) reopening the prior "rewrite, not copy" disposition for
DOM structure, class vocabulary, and visual language specifically — card/task identity
(`RowData.file.path`) and every local extension named in each packet's own REQ-003/REQ-005 stay
unchanged, moving behind a new default-off setting rather than being dropped. Both packets plan the
same leg pair: a `cli-devin` TypeScript structure port, a `cli-codex` verbatim CSS copy plus
fixture update (MIT notice attached to each copied block), and a fresh in-runtime verifier reading
recaptured screenshots side by side with the reference or the operator's vault comparison — red
first, via a DOM-structure parity test against each reference view's own output shape. `roadmap.md`
§5.2 rows 037 and 038 are marked reopened above. No implementation has landed for either leg pair
yet; this entry and the two child packets' own `spec.md`/`plan.md`/`tasks.md`/`goal.md`/
`acceptance-criteria.md`/`implementation-summary.md` document the amendment, not its execution.

### 2026-09-04: `043` T028 landed on its own worktree — all 13 of row 6's named fixture-only scenarios now have a constructed counterpart, row 6 narrowed a fourth time and left for a fresh audit

Landed on `worktrees/022-constructed-state-variants`, not yet merged to main. Full detail lives in
row 6's own checklist paragraph above and in `043`'s own three docs (`tasks.md` T028, `goal.md`'s
T028 log entry, `implementation-summary.md`'s T028 section); this entry is the pointer, not a
duplicate. Summary: three of the 13 scenarios (`table-mobile`/`list-mobile`/`board-mobile`) were
already produced by the existing `constructed-table`/`-list`/`-board` scenarios' own mobile-device
capture and needed only a `fixtureOf` declaration; the other ten needed additive, off-by-default
`ScenarioSpec` options on `render-assertion-harness.ts` — none of them changed a number any existing
consumer (`render-assertions.mjs`/`touch-targets.mjs`/`unstyled-links.mjs`) reports. A red-first live
check (`tools/live/constructed-state-assertions.mjs`) failed 16 of 16 before the change and passed
all after. Two full detached capture runs reproduced identical content for all 352 manifest entries;
all 312 pre-existing entries matched committed HEAD exactly; all 40 new captures were opened and read
on both devices. A genuine defect (`constructedScenario()`'s spec builder silently dropping
`opts.miniCalendar`) was found only by that read, after the automated assertion script had already
reported green through a hand-built spec that bypassed the bug — recorded as the concrete case for
why this program reads every capture rather than trusting a passing assertion alone.
`SURFACE_PHASE=043-constructed-capture npm run gate` and bare `npm run gate` both exit 0, 25 green.

**Row 6 is deliberately NOT ticked by this entry.** Per D4 (a fresh reviewer verifies, never
self-certify) and this row's own five-audit history of narrowing rather than closing on the same pass
that produced the evidence, the residual question — whether `touch-targets.mjs`/`unstyled-links.mjs`'s
own constructed pass not yet including these ten new per-state entries still disqualifies the tick,
given a manifest-level constructed counterpart now exists for all 13 — is left for that fresh audit.
`completion_pct` stays **4 of 7 = 57**, unchanged.

### Done-audit-9, 2026-09-04T07:20:00Z: T028 merged, row 6 re-audited, narrowed a fifth time to ten scenarios and two lanes

A fresh audit re-read row 6 against the merged tree (`d363456`, reconciled `dc67803`), answering the
one question T028's landing note deliberately left open. Everything below was measured here, not
carried: `grep -c fixtureOf tools/screenshots/scenarios/*.mjs` **20**, was 7; `screenshots/
manifest.json` **352** entries and **19** constructed scenarios, was 312 and 9; **20** fixture ids
with `fixtureOf` and **50** without, was 7 and 63; all 13 named fixture-only ids confirmed by id,
each on all four device/theme entries.

Three of the five lanes this row has named since `done-audit-4` are now cross-checked for all 13
inside their own input set — `device-parity` **87 pairs** (was 77 at `425d552`), `screenshots-fresh`
**352 entries match their sources** (was 312), `css-lane` exit 0 with the stylesheet unchanged. The
other two are not, and that is the whole residual. `touch-targets` and `unstyled-links` never read
the manifest: their constructed pass iterates `render-assertion-bundle.mjs`'s exported `SCENARIOS`,
a 21-entry list carrying none of T028's new `ScenarioSpec` fields and none of its three toolbar
`renderer` values, while the ten new states live only in `constructed-scenarios.mjs`'s capture
registry, which neither lane imports. Both lanes were run: `touch-targets` exit 0, fixture 1450
elements across 70 scenarios / constructed 56538 across **21**; `unstyled-links` exit 0, fixture 112
links across 70 / constructed 0 across **21**. Both JSON records are field-for-field identical to
`425d552`, before T028 — a widened constructed pass could not have left the count at 21.

The ruling, since this is exactly what a fresh reviewer was left to decide: a manifest-level
counterpart does not satisfy the row regardless of which lane reads it. The criterion tests whether a
green *depends* on a harness-supplied value, not whether a counterpart exists somewhere in the tree,
and a PNG in `device-parity`'s input set never enters `touch-targets`' `under` count. `done-audit-4`,
`-6` and `-8` all read a declared-and-bounded dependency as still a dependency; loosening that on the
first pass that would benefit from the looser reading is the failure this table's own first criterion
was rewritten to record. **Row 6 stays open**, narrowed a fifth time — from 13 scenarios across five
lanes to **ten** scenarios across **two**, since `table-mobile`/`list-mobile`/`board-mobile` are
covered in-lane by `touch-targets`, which mounts its whole constructed pass at 390x844 with
`is-phone`. Closing move, named and small: add the ten state variants to
`render-assertion-bundle.mjs`'s `SCENARIOS` (their harness options already exist, exercised red-first
by `constructed-state-assertions.mjs`), then rebaseline `touch-targets-constructed-baseline.json`.
Re-confirmed as a separate, already-declared D6 condition: `unstyled-links`' constructed pass is an
empty sample (0 links) for all 21 scenarios, so widening alone would not make that half non-vacuous.
`completion_pct` stays **4 of 7 = 57**. `roadmap.md` §5 and §5.2, `spec.md`'s two Phase Documentation
Map rows and `handover.md` updated to match.

### 2026-09-04: two 1:1 reopen lanes in flight, both unmerged

Recorded as in-progress fact, not as landed work. `038`'s board 1:1 leg sits on
`worktrees/023-board-one-to-one` at `1c5f465` (the TypeScript structure port; a drag defect was found
and fixed on that branch, its CSS leg under verification). `037`'s gantt 1:1 leg sits on
`worktrees/024-gantt-one-to-one` at `d30ea78` + `9bd044a` (TypeScript leg landed, CSS leg in
progress). Verified here rather than assumed: `git merge-base --is-ancestor` reports neither branch
tip is an ancestor of main's `dc67803`, so **main is unaffected by both**, and no DONE-table row,
release, or operator row moves on their account until they land and are verified in-runtime.
### Done-audit-10, 2026-09-04T09:10:50Z: T029 merged, row 6's tracked residual closed, the row re-scoped and still open

A fresh audit re-read row 6 on main at `65238ad` after `043` T029 (`122a959`, reconciled `ce72379`,
numbers trued up in `65238ad`) did precisely what `done-audit-9` named as the closing move. Full
evidence sits in row 6's own checklist paragraph above; this entry is the ruling.

**The named residual is closed, measured here.** `render-assertion-bundle.mjs` gained a
`STATE_SCENARIOS` array (10) and a `SCENARIOS_WITH_STATES` export (**31** = 21 + 10), and both lanes
import the latter. `node tools/live/touch-targets.mjs` exit 0: constructed **50462** elements across
**31** scenarios, **422** under the 28px floor against a recorded baseline of **422** — was 21
scenarios and 367/367. `node tools/live/unstyled-links.mjs` exit 0: constructed **72** links across
**31**, **0** user-agent-default findings — was **0** links across 21, so this row's own standing
prediction that widening alone would leave the link half vacuous is superseded; 7 of the ten state
variants set `captureData`, which is what builds the relation and file-type fields the caveat named.
`touch-targets-constructed-baseline.json` records the 367 -> 422 raise per class (summing 55) and a
`rebaseReconciliation` block re-measuring 422 on the merged tree.

**Two checks that could have kept it open, and did not.** The three toolbar `renderer` values really
are why `SCENARIOS` itself stayed at 21: `BAGS` in `render-assertions.mjs` holds exactly 13 keys and
none of them is the toolbar triple, and `render-assertions.mjs:277`/`:279` would throw a `TypeError`
on a merged list rather than fail a check. And `render-assertions.mjs`, still reading the 21, leaves
no criterion green on a harness-supplied value: it refuses DOM without a bundled-renderer provenance
marker, its 13 action bags are return-type-annotated against the shipped `*RendererActions`
interfaces so `tsc --noEmit` binds them to `src/views`, and its coverage total is read live from
`src/views` rather than pinned. Its 21-entry read costs coverage arithmetic (row 3's ledger), not
truth.

**Row 6 still does not tick, and this is a re-scoping rather than a moved goalpost.** Both lanes
still run a fixture pass whose result their exit codes require — `touch-targets` on
`fixtureFailed || constructedFailed`, `unstyled-links` on the summed finding count — over **71**
hand-authored scenarios, of which **20** carry `fixtureOf` and **51** do not; **42** of those 51 are
the `panel-*`, `chrome-*`, `field-*` and popover families that no constructed scenario in either lane
mounts at all. Neither lane reads `fixtureOf` (it is consumed only through `screenshots/
manifest.json`), so their constructed pass supplements the fixture pass without validating any
individual fixture. That is `done-audit-3`'s class (3) in the part `done-audit-6`'s `fixtureOf` bound
set aside rather than closed; ticking on an emptied tracked list while an untracked part of the same
class is live would be this table's first criterion's denominator error pointed the other way.
`completion_pct` stays **4 of 7 = 57**. `roadmap.md` §5 and §5.3 and `handover.md` updated to match.

### 2026-09-04: the board 1:1 leg shipped as 0.0.16; the gantt leg is landing

Supersedes the in-flight entry above rather than rewriting it. `038`'s board one-to-one leg was
merged and reconciled onto main in `854c748` and cut as release **0.0.16** in `46a8525` — the first
release under the renumbered scheme. Its arrival is visible in this audit's own numbers: the
constructed pass's scanned element total dropped 57060 -> 50462 and its constructed link total
144 -> 72 with the pass/fail figures unmoved, and the board port added the 71st fixture scenario
(`chrome-board-extensions-selection`, `d921404`) straight into the set with no constructed
counterpart. `037`'s gantt one-to-one leg is landing from `worktrees/024-gantt-one-to-one` at
`7617f85` (TypeScript leg `d30ea78`+`9bd044a`, CSS leg recorded); main does not carry it yet.

### 2026-09-04: both fidelity passes landed and shipped, 0.0.18 and 0.0.19

Recorded as landed fact, measured on main rather than taken from a branch note. `038`'s board
fidelity pass — the divergences T12's fresh reviewer found against the reference — landed in
`a6abd0a9`+`cb6ef827`, was reconciled in `01883cf8` and trued up in `b1e75124`, and was cut as
release **0.0.18** (`96f878a5`); its closing fixes (kanban height chain, due-tier and badge-icon
fidelity, then the responsive host padding, photograph avatars and milestone chips) landed in
`2cddc7cf`+`d896f90e` and `595dc283`+`7d5b3f90`, reconciled `fe42955d`. `037`'s gantt fidelity pass
landed in `119f5936`+`8c563a35`, reconciled `5fd4fc7d`, trued up `6d12740a`, and was cut as release
**0.0.19** (`07f4500f`). `manifest.json`, `package.json` and `versions.json` on main all read
**0.0.19**, and the `0.0.18` and `0.0.19` tags are both on `origin`. The next cut is **0.0.20**.
Board `T12`'s in-repo half is met by a fourth fresh read, and `c563f089` mirrored its operator half
into `038`'s own `goal.md` as an operator-only row so `build-operator-checklist.mjs` surfaces it;
the closing leg runs on `worktrees/033-board-t12`, and a gantt behaviour pass is landing from
`worktrees/032-gantt-residual`. Neither is on main at `2242fa0`, so no row moves on their account.

### Done-audit-11, 2026-09-04T13:17:14Z: `043` T030 lands, row 6 TICKED, the parent goes 5 of 7

A fresh audit re-read row 6 on main at `2242fa0` after `043` T030 (`c4c7466`+`64db8d5`+`6fa715e`,
trued up onto the gantt and board fidelity passes in `d94e11f`, `2506bb2`, `2242fa0`) constructed
the fixture families `done-audit-10` re-scoped the row to. Full evidence sits in row 6's own
checklist paragraph above; this entry is the ruling. **Row 6 ticks**, and the parent DONE table goes
**5 of 7 = 71** for the first time.

**What closed, with the value each check replaced.** Fixtures with no constructed counterpart
**51 -> 5**, read by importing `scenarios.mjs` and filtering rather than grepping a count: 71
fixtures, 66 with `fixtureOf`, 5 without. Both lanes' constructed pass **21 -> 31 -> 73** scenarios
(`SCENARIOS` 21 + `STATE_SCENARIOS` 52 = `SCENARIOS_WITH_STATES` 73, 35 distinct `renderer` values)
— wider than the 71-fixture pass it supplements, a first for this row. `touch-targets` `$?` `0`
three times running with byte-identical output: constructed **24788** elements across **73**,
**1223** under the 28px floor against a baseline of **1223** (was 422/422 across 31, and 367/367
across 21); fixture **1123/71/199** against a baseline of 279 (was 1450/71/264, the drop being
main's board and gantt ports moving `styles.css`). `unstyled-links` `$?` `0`: constructed **1476**
links across **73** with **0** user-agent-default findings (was 72 across 31, and 0 across 21).
`done-audit-10`'s "the ratchet is decided by timing" caveat is retired at its cause — T030 swept the
body-portal teardown that had each scenario measuring the previous one's panels — not inherited.

**Why the five that remain do not keep this row open.** The criterion is conjunctive: a green must
rest on a harness value *that a device would not supply*. `done-audit-7` already set the test for a
named class member, ruling the stubbed action bags a declared residual once it was verified in
source that no green could move on them; that same test, applied to each of the five, clears all
five. Two of them (`panel-computed-cleanup-modal`, `panel-invalid-events-modal`) reach a lane's
arithmetic only as 2 and 3 of the 199 undeclared under-floor rows, which consume ratchet headroom —
`fixtureFailed` is `undeclared.length > allowed`, so a fixture manufactures reds here, never greens.
`panel-base-import-modal` contributes 0 undeclared rows and 0 findings. `chrome-selection-status-bar`
contributes 0, and its product claims are asserted on production output by the placement lane, which
builds the bar through `renderSelectionStatusBar`/`renderEmbedSelectionStatusBar`. Only
`board-drop-language` is load-bearing — `replay.mjs:600` loads its markup for 1 of a `recorded: 2`
held on exact equality, so the replay lane's exit code does depend on it — but the value it supplies
is not one a device withholds: `board-renderer-parity.test.ts` drives real `dragstart`/`dragover`/
`dragleave` events against a real `BoardRenderer` and asserts the identical two class names, inside
the `tests` gate lane.

**What the tick does not claim.** The five stay a structural coverage gap — `obsidian-stub.mjs:202`
makes `Modal` an out-of-scope throw, the status bar's host is a `MarkdownRenderChild` with
mid-gesture state, and the board's drag classes are added by live handlers — so the two lanes cannot
raise a red about those surfaces. A red the corpus cannot reach is a different defect from a green
resting on a harness value, and it is recorded against row 3's coverage ledger rather than absorbed
here.

**One correction to `done-audit-10`, found by re-running its reasoning rather than repeating it.**
It cleared `render-assertions.mjs` three ways; (a) and (c) hold, verified again here. (b) does not:
the 13 action-bag return-type annotations live in `render-assertion-harness.ts`, not in
`render-assertions.mjs` where it cited them, and **no gate lane typechecks them** — root
`tsconfig.json` includes `src/**/*.ts` only and `lint:tools` runs eslint over `tools/**/*.mjs`, so
the `.ts` harness is neither typechecked nor linted. `BAGS` is therefore a hand-maintained list
compared against the harness's own bag keys with no enforced binding to `src/views`. The conclusion
survives on (a), (c) and `done-audit-7`'s inertness finding, re-verified: `render-assertions.mjs`
names `actions` only in a comment and the two lanes reference an action bag 0 times each. An
unenforced shape list can only under-assert, which is again a missing red rather than a false green.
Also re-confirmed unchanged: `BAGS` holds exactly 13 keys, none of them the toolbar triple, so
`SCENARIOS` still cannot absorb `STATE_SCENARIOS`.

`completion_pct` moves to **5 of 7 = 71**, up from 4 of 7 = 57. Rows 3, 4, 5, 6 and 7 hold; rows 1
and 2 are the operator's and are now the only open rows in the table. `roadmap.md` §5, §5.3 and
`handover.md` updated to match.

### Final-state proof (2026-09-04, main 7e1dd4c8)

A fresh verifier ran every objective check this parent's completion criteria name, from the current
tree — not carried from `done-audit-11`'s landing pass. `HEAD` moved to `534240b2` partway through
this run on a concurrent `roadmap.md` commit (renumbering the operator-report release wording); it
touches no `src/` or `tools/` file, so the numbers below hold for the tree both shas produced. No
stray gate/capture/headless process before the run: `pgrep -f "node tools/gate.mjs|capture.mjs|
--headless"` returned empty. Every `$?` below was read directly, never through a pipe.

| Command | Summary | Exit |
|---|---|---|
| `SURFACE_PHASE=037-timeline-gantt-port npm run gate` | `gate: PASS — 25 green, 0 red for a declared reason` | 0 |
| `SURFACE_PHASE=038-board-kanban-port npm run gate` | `gate: PASS — 25 green, 0 red for a declared reason` | 0 |
| `SURFACE_PHASE=043-constructed-capture npm run gate` | `gate: PASS — 25 green, 0 red for a declared reason` | 0 |
| `npm run gate` (bare) | `gate: PASS — 25 green, 0 red for a declared reason` | 0 |
| `npm run replay` | `replay: PASS — all 28 results still hold` | 0 |
| `NODE_PRESERVE_SYMLINKS=1 bash "$(realpath .opencode)/skills/system-spec-kit/scripts/spec/validate.sh" specs/005-component-surface-system --strict` | first `RESULT:` line `PASSED`; parent `Summary: Errors: 0  Warnings: 1` (the one warning is `FRONTMATTER_MEMORY_BLOCK` flagging `goal.md`'s and `handover.md`'s continuity-block byte size — advisory, not an error) | 0 |
| `node tools/live/render-assertions.mjs` | `render-assertions: PASS — the shipped renderers built the asserted structure in headless Chrome`; `tools/live/renderer-coverage.json` stamps `constructed: 7, total: 22` — all seven `DatabaseViewType` values (list, table, board, gallery, calendar month/week/day, timeline day/month/quarter/year, chart) each have a production renderer constructed and asserted | 0 |
| `npm run screenshots:verify` | `screenshots current: 528 entries match their sources, and none is blank or identical across themes` | 0 |

All eight runs are green, no lane exempted or worked around to reach this. This entry re-confirms
rows 3, 4, 5, 6 and 7 on the tree as it stands today; it adds no evidence toward rows 1 or 2, which
stay the operator's device confirmation alone. `completion_pct` unchanged at **5 of 7 = 71**.

<!-- /ANCHOR:log -->
