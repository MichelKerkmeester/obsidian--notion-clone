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
    last_updated_at: "2026-09-02T23:30:00Z"
    last_updated_by: "parent-basis-reconciled"
    recent_action: "Reconciled completion_pct basis to 43 across spec/goal/handover"
    next_safe_action: "The operator runs the deferred device pass on the installed 1.3.9 build"
    blockers:
      - "Every fix is measured on a bench; 1 of 27 reports is confirmed on the operator device"
      - "Every fix is bench-measured; none of the six renderers is asserted against a live Obsidian host"
      - "The windowed list is bench-only: 48.4ms at 3,000 rows, unconfirmed on the operator device"
      - "CI runs npm run storybook:coverage, a script package.json no longer defines (.github/workflows/gates.yml:64)"
    key_files:
      - "roadmap.md"
      - "spec.md"
      - "design-system.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-parent"
      parent_session_id: null
    completion_pct: 43
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
| D14 | ~~**External delegation, decided 2026-09-02.** Implement, debug and review through cli-codex on `gpt-5.6-luna` at `model_reasoning_effort=max`, `service_tier=fast`, `--sandbox workspace-write`; cli-opencode only when the task itself needs the browser; fallback cli-devin on `deepseek-v4-flash-max` (that exact id, its effort baked in), read-only audits first. Every external result is verified by a fresh in-runtime Opus agent that runs `npm run gate` and `validate.sh --strict` itself — a delegate's report is a claim, not a result (D4). **No browser number from a sandboxed or cloud lane is evidence**, the lesson the queued-lane note in §4 already paid for. Model ids are passed exactly as each transport spells them — codex `gpt-5.6-luna`, devin `deepseek-v4-flash-max`, which do not share a spelling — never a near-miss. The orchestrator never runs a sub-agent on Fable.~~ **2026-09-02, revised.** The order is now: (a) an initial pass through cli-devin on `deepseek-v4-flash-max` under `--permission-mode dangerous`, which the operator approved for this repo's worktree; (b) then `gpt-5.6-luna` at `model_reasoning_effort=xhigh` or `max`, `service_tier=fast`, through cli-codex or cli-opencode; (c) in-runtime verification is unchanged — a fresh agent runs the browser gate and `validate.sh` itself, because sandboxed and cloud lanes cannot reach Chrome. In-runtime delegates default to Sonnet 5 (xhigh may be used more freely than before); Opus is used only where it is genuinely better. Never Fable, never fork. |
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
- [ ] Every view opens on device without freezing. Today only the table does.
- [x] A gate check constructs a production renderer for **every** view. One lane does now, for
      List, Table, Board, Gallery, Calendar and Timeline — **6 of 22**, a ratchet, twelve
      scenarios driven by both action bags. Every view named in an operator report is asserted.
- [x] `SURFACE_PHASE=<phase> npm run gate` exits 0, read from `$?`, not a pipe. Was red on
      2026-08-29: the gate was 13 green, reported red by an external lane that could not reach
      Chrome. `SURFACE_PHASE=035-visual-pass-product-defects npm run gate`, `$?` read directly,
      not through a pipe: today 25 green, exit 0.
- [ ] `npm run replay` re-asserts every landed result against its recorded pre-fix number.
      `npm run replay` passes today — 8 of 8 held, exit 0 — but observed red: N/A — no earlier
      count recorded. `tools/live/replay.json`'s history carries no run where a claim's `held` was
      `false`, and the parent log records no earlier held-count either, so this tick has no red to
      cite. Left unticked: a tick needs its red.
- [ ] No criterion's green depends on a value the harness supplies that a device would not — a
      pinned variable, a stubbed action, a hand-written mount, or an absent host stylesheet.
- [x] `validate.sh <this folder> --strict` reports the parent at Errors: 0. Was red: 3
      `SPECDOC_FRONTMATTER_004` errors (`spec.md`, `handover.md`, `goal.md`) until the shared kit
      accepted a single-segment `packet_pointer` today (Public commit `a3e3fe774e`, packet
      `specs/system-speckit/050-single-segment-packet-pointer`). `validate.sh
      specs/005-component-surface-system --strict`, first `RESULT:` line `PASSED`,
      `grep -c SPECDOC_FRONTMATTER_004` now 0.
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
| Reports with an owning phase | Done | **27 of 27** — re-read off `roadmap.md` §4 on 2026-09-02, where the table now runs 1-16 and 18-28. This cell read *16 of 16* against a table that had grown |
| Reports shipped | In Progress | **15 of the original 16** (report 13 is the version bump, deliberately not a phase); **0 of the 11 later rows** have shipped code under the phase they name. Was recorded as *14 of 16*; `roadmap.md` §4 says fifteen |
| Reports operator-confirmed | In Progress | 1 of **27**, as an accepted shortfall (report 10) |
| Every phase has a `goal.md` | Done | 36 folders, all carrying one — `035-visual-pass-product-defects`, opened 2026-09-02 for the visual pass's product defects, was the 36th and carried one from the start. **This row was briefly false:** 032, 033 and 034 were opened without one by the same commit that opened 034 to fix documentation drift — the drift mechanism reproducing itself inside its own remedy. Added and re-checked across every folder rather than assumed | The four that did not — `020`, `021`, `023`, `025` — were written after an audit counted, having been claimed complete twice |
| Report 1, the sheet drag | Fixed, awaiting device | The panel's render destroyed the grab bar; a 60px drag now moves 60.0px after a re-render, was 0.0px |
| Non-table views on device | Unconfirmed | Two quadratics found and fixed (list `024`, timeline `028`); the calendar measured clean; the list then windowed in `033`. None confirmed on device |
| Gate checks constructing a renderer | 1 of **25** | `026`. `render-assertion-harness.ts` builds all six view renderers across twelve scenarios and both bags, green in the gate, all six sources fingerprinted as declared inputs. Coverage 6 of 22, read off `tools/live/renderer-coverage.json` (`constructed: 6`, `total: 22`). The denominator here was the lane count and it was 16; `tools/gate.mjs` declares **25** lanes on 2026-09-02 |
| `004` state | Unknown | Three sources disagree; `roadmap.md` §7.1 |
| Gate | Green when last run, at 16 lanes | `tools/gate.mjs` now declares **25** lanes and the gate was **not re-run for this audit**, so Green is a dated verdict rather than a current one. This row read Red 12/13 long after it went green, and then 16 lanes long after there were 25 |
| Version | Done | `manifest.json` and `package.json` both at **1.3.9** (read 2026-09-02; this cell said 1.3.7). The freeze was reported on 1.3.4, 1.3.5 and again on 1.3.9, and no view is confirmed on any of them |

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
names the reports ledger. `completion_pct` is **43** in every continuity block of this packet; the
50-on-the-reports-basis paragraph above is dated history, superseded by this line, not the current
figure.

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
| **The rows only a device can close are now one list, derived** | Every phase ends with a row nothing here can close, recorded one per packet across thirty folders — the right place to keep them and the wrong place to act on them. `operator-checklist.md` gathers them: **42 rows across 30 phases**, with 5 phases carrying none. It invents nothing — a row appears because it is unticked in its own `goal.md`, and each figure is a count of that packet's checkboxes. **Generated, and guarded**, because shipping a generated file nobody regenerates would add an instance of the doc-truth failure this program exists to catch: `build-operator-checklist.mjs --check` regenerates in memory and fails the gate on drift, comparing everything but its own derived date so it does not go red each morning for saying nothing. Control: ticking one row in the generated copy fails it. |
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
<!-- /ANCHOR:log -->
