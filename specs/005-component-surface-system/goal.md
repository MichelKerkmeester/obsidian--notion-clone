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
    last_updated_at: "2026-09-03T23:40:00Z"
    last_updated_by: "done-audit-2"
    recent_action: "done-audit-2: unticked rows 3,6; re-verified 4,7; pct 57->29"
    next_safe_action: "Cut 1.4.7; operator confirms all five surfaces on iOS"
    blockers:
      - "1 of 32 reports is confirmed on device; every other fix is bench-measured"
      - "No renderer is asserted against a live Obsidian host"
      - "The windowed list is bench-only: 48.4ms at 3,000 rows, unconfirmed on device"
      - "Report 29 (P0): fixed in 98da630 and 0c92f4d, released in 1.4.1; per-row confirmation is owed"
      - "Reports 30-33: recorded in 62c4fe7, owners 001, 022, 022, 010; the fix is uncommitted"
      - "036's port research runs in .worktrees/003-obsidian-pm-harvest"
      - "reports 34-36 fixed in 85ff504 (owner 031); release 1.4.3 pending; device confirmation owed"
      - "037 landed (0262386+55bff9b); release 1.4.4 pending; 11 open defects recorded, not operator-confirmed"
    key_files:
      - "roadmap.md"
      - "spec.md"
      - "design-system.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-parent"
      parent_session_id: null
    completion_pct: 29
    open_questions:
      - "Does report-driven scheduling replace the declared 009-first order"
    answered_questions:
      - "Reports 7 and 16 had no owning phase; 018 and 019 now own them"
      - "Every phase 000-026 now carries its own goal.md"
      - "The timeline froze on a per-event touch probe; the calendar does not scale with row count at all"
      - "The deep review ran and returned FAIL: P0=1, P1=7, P2=7, release-blocking, against 1.3.9"
      - "Eleven of its fifteen findings are documentation drift inside this packet's own files"
      - "Operator shape: 1,000-3,000 rows at 80-100% fill. The 2,000ms budget breaks at 1,300 rows"
      - "The scope exclusion on output number format means the formula editor's only, so report 7 is in scope"
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
- [ ] A gate check constructs a production renderer for **every** view. One lane does now, for
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
- [x] `SURFACE_PHASE=<phase> npm run gate` exits 0, read from `$?`, not a pipe. Was red on
      2026-08-29: the gate was 13 green, reported red by an external lane that could not reach
      Chrome. `SURFACE_PHASE=035-visual-pass-product-defects npm run gate`, `$?` read directly,
      not through a pipe: today 25 green, exit 0. **Re-verified 2026-09-03T23:40:00Z.**
      `SURFACE_PHASE=040-subtask-tree-port npm run gate`, `$?` read directly: `0`, 25 green, 0
      red. Bare `npm run gate`, `$?` read directly: `0`, the same 25 green, 0 red. No stray
      Chrome process before either run (`pgrep` empty).
- [ ] `npm run replay` re-asserts every landed result against its recorded pre-fix number.
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
- [ ] No criterion's green depends on a value the harness supplies that a device would not — a
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
      PASSED`, 0 `RESULT: FAILED`.
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
<!-- /ANCHOR:log -->
