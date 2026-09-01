---
title: "Roadmap: Component Surface System"
description: "Traceability from every operator report to the phase that owns it, the execution order as actually run, and per-phase status measured against the working tree rather than against the plan."
trigger_phrases:
  - "surface system roadmap"
  - "component surface roadmap"
  - "005 roadmap"
  - "operator report traceability"
importance_tier: "high"
contextType: "planning"
---
# Roadmap: Component Surface System

<!-- SPECKIT_TEMPLATE_SOURCE: roadmap | v2.2 -->

> Read `architecture-findings.md` for the measured root causes and `design-system.md` for how to
> build on the contract. This file answers three questions: **which phase owns each thing the
> operator reported, what is actually true of each phase today, and what happens next.**

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Subject:** Note Database plugin, `specs/public/005-component-surface-system/`
**Status:** Active
**Horizon:** Open. The program closes on operator confirmation, not on a date.
**Owner:** Operator, with several agents holding phase folders concurrently — the four
flagged live in §5 this morning, plus `027` and `028`, opened today to investigate the reports
below.
**Last updated:** 2026-08-30

**Reconciliation note.** Sections 2, 5 and 6 were rewritten on 2026-08-30 against the working tree,
`tools/lane/css-lane.json` and each phase's continuity block. The previous version listed nine
phases, all Planned, and predated every phase cut from an operator report. Sixteen operator reports
and eight phase folders were missing from it.

**Second reconciliation note, later the same day.** Eight further operator reports arrived, and
seven further phases (`020` through `026`) existed without a row in §5.1. Two more phases, `027`
and `028`, were opened today to investigate the new reports. §4, §5, §5.1, §8 and the report
count in §9 are what changed; §6, §6A, §7, §10 and §12 were not re-audited and may carry their
own drift. `027` and `028` were being authored by other agents at the time of this pass, so
their §5.1 state is UNKNOWN rather than assumed; `022`, `023`, `025` and `026` are Planned on
their own explicit "Status" field, cross-checked against a git log and lane journal both
silent on them.

**What this file does not do.** It does not resolve disagreements between a phase's own documents.
Where they disagree, §7 names both readings and leaves the decision to the operator.
<!-- /ANCHOR:metadata -->

---

## 2. THE ONE-LINE REASON THIS EXISTS

1.3.1 passed tsc, build, the unit suite, 196 captures, Storybook and 13 geometry checks, and changed
nothing the operator could see. Every gate measured a mechanism. None measured an outcome.

**The same failure has a documentary form,** which is why this file was rewritten: a status table
claiming Planned for work that shipped is a gate that passes while nothing is true.

---

## 3. THREE STATES, NOT ONE

Every row in §4 and §5 uses one of these. Collapsing them is how 1.3.1 happened.

| State | Means | Does not mean |
|---|---|---|
| **Shipped** | The edit is in the working tree | That anything measured it |
| **Verified** | A check drives the production path, has a threshold, and has been observed red before it went green | That the operator can see the difference |
| **Operator-confirmed** | The operator looked at the device and said so | — |

**The program's closing condition is the third** (`spec.md` §7). Of the twenty-seven reports below,
**one** has reached it, and it reached it as an accepted shortfall rather than a fix.

**One further caveat that applies to every row.** Re-derived rather than carried: `HEAD` is at
`4228370`, `manifest.json` and `package.json` both declare **1.3.9**, and `git status --porcelain`
returns nothing, so the tree these rows describe is committed. The sentence here previously read
`4830275` / 1.3.1 / 1.3.3 and had been true three releases earlier — a version number in prose is a
number nothing recomputes, so read it off the tree before believing it.

### 3.1 The status vocabulary, because "In Progress" was carrying too much

A phase's `spec.md` **Status** field is this board's unit of truth. It had drifted into one phrase —
*In Progress* — covering everything from nine tasks of forty-one to code shipped in 1.3.9 and running
on the operator's phone. A word that spans that range costs a reader more than it tells them. Status
now takes one of the values below and nothing else, and each row names the observation that decides
it, so a status is checkable rather than asserted.

| Status | Means | What decides it |
|---|---|---|
| **Planned** | No code for this phase is in the working tree | The phase's named symbols, selectors and instruments are absent from `src/`, `styles.css` and `tools/` |
| **In progress — N of M tasks** | Part of the work is written, the rest is not, and `tasks.md` has been kept current | `grep -c '^- \[x\]' tasks.md` against the total. **The fraction is mandatory.** Bare *In progress* is not a status |
| **Partial** | Some deliverables are in the tree and some are not, and the phase's own tasks and criteria were never advanced past phase-cut, so no fraction is derivable | Named deliverables found in the tree, together with the absence of an advanced criteria record |
| **Shipped, unverified** | Every deliverable is in the tree; nothing drives it | The phase's criteria carry no measured after-number |
| **Shipped + verified** | Checks drive the production path, each with a threshold observed red before green | Every ticked criterion in the phase's `goal.md` carries its check and its number |
| **Shipped + verified, awaiting device** | As above, and every criterion still open is the operator's own | The unticked criteria are operator-confirmation rows |
| **Complete** | The operator confirmed it on the device | An operator statement recorded in the phase. D3 says only the third state closes, so **nothing else may read Complete** |
| **Not a program phase** | `007` only | Its own spec says so |

**These words are read by a machine, so choose them rather than paraphrase them.**
`scripts/rules/check-status-cross-doc-consistency.sh` buckets a Status field into
complete / in-progress / planned by keyword and **fails** a folder whose `spec.md` and
`implementation-summary.md` land in different buckets. *Shipped*, *done*, *delivered*, *closed* and
*implemented* all read as complete wherever they appear in the sentence — including inside *not
done* — and *partial*, *in progress* and *active* read as in-progress. That is why the third row
says **Partial** and not *partially shipped*: the longer phrase is more informative to a person and
tells the classifier the opposite of what it means. `000` was being bucketed **complete** before this
section was written, on the word *complete* inside *9 of 41 tasks complete* — a phase 22% of the way
through, reading to every consumer of that classifier as finished.

### 3.2 One completion figure per phase, and it is derived

**Decided here, after running as an open question across nine phases.** `spec.md`, `goal.md` and
`implementation-summary.md` each carry a `completion_pct`, and in fourteen phases at least two of the
three disagreed. The proposal was to keep the split and write it down as policy — *`spec.md` measures
shipping, `goal.md` measures verification*. **Rejected**, for three reasons, each re-derived from the
continuity blocks rather than argued:

1. **The data refutes the policy's own invariant.** If `spec` is shipping and `goal` is verification,
   the goal figure can never exceed the spec figure — you cannot verify more than you shipped. In
   `010` (0 against 60), `011` (0 against 66), `014` (75 against 85) and `019` (50 against 70) it
   does. Four of the nine phases the policy was written to explain contradict it.
2. **There are three carriers, not two.** `implementation-summary.md` holds the same field and
   diverges from both in `010`, `011`, `013`, `016`, `017` and `022`. A two-axis policy has no axis
   for the third number, so it would leave a third figure unexplained in six phases.
3. **The distinction already has a home.** Shipped, verified and operator-confirmed are §3's states
   and §3.1's vocabulary. Encoding the same distinction a second time as a percentage is what
   drifted — and a percentage cannot say *which* of the three states a phase has reached, which is
   the question anyone reading this board is asking.

**The rule.** Every continuity block inside a phase folder carries the **same** `completion_pct`, and
that figure is **derived, never judged**:

> `completion_pct` = ticked ÷ total over the phase's own `goal.md` completion-criteria checklist,
> rounded to a whole number.

Re-checking any phase costs one command:

```sh
d=specs/public/005-component-surface-system/<phase>
awk '/ANCHOR:completion/,/\/ANCHOR:completion/' "$d/goal.md" | grep -c '^- \[x\]'   # ticked
awk '/ANCHOR:completion/,/\/ANCHOR:completion/' "$d/goal.md" | grep -c '^- \[ \]'   # open
```

That checklist is the right denominator because it is where the criteria already live. `goal.md` §2
is what the parent's *"only the criteria below decide done"* points at, it carries the operator's own
confirmation as a criterion wherever one is owed — so D3 is enforced by the denominator rather than
by remembering — and it is the record a verification pass advances when it withdraws a tick.

**The rule governs phase children.** This parent's own figure is not a proportion of its criteria —
1 of 7 are ticked and the program is plainly further along than 14% — because its criteria are
program gates rather than units of work. It is derived from the report ledger instead, as `goal.md`'s
LOG states, and it now reads the same **50** in `spec.md`, `goal.md` and `handover.md`; `spec.md` had
carried 55 with no derivation written anywhere. That basis is itself owed a correction: it reads
*14 of 16 reports shipped* while §4 has grown to 27 rows, which is the same denominator error
`goal.md` §3 already un-ticked its report criterion for. One number now, with a stated basis and a
known defect in the basis, beats two numbers and no basis.

**Where a phase has no such checklist, the figure is UNKNOWN**, and the phase says so rather than
carrying a judged number. That is the state of `000`-`006`, `008` and `009`: their `goal.md` files
predate the checklist form, and their `acceptance-criteria.md` tables still hold the pre-fix baseline
this program requires them to record, so counting *Met* there measures 2026-08-29 rather than today.
One operation settles each — give it the same `goal.md` criteria checklist every phase from `010` on
already has — and it is that phase's own work, not this board's.

---

## 4. OPERATOR REPORT TRACEABILITY

**Twenty-seven reports** (1-16, 18-28), each resolved to a named phase. A seventeenth — refactoring the list view to
look like ClickUp — is its own packet at `specs/public/006-list-view-clickup/`, is not part of
this program, and does not occupy a row here; the table below runs 1-16 then 18-28 because of it.

| # | The report, shortened | Phase | State | Evidence |
|---|---|---|---|---|
| 1 | *"dragging the sheet downwards on mobile doesnt really work"*, and again on 1.3.3: *"should guaranteed move down in initial drag"* | `003` built it, `016` root-caused it | **Fixed + verified**, not operator-confirmed | **Root cause, after three failed fixes:** the panel's own content render empties the panel, destroying the grab bar the sheet module had prepended as its child — so **every view re-render silently unbound the gesture**. Measured: a 60px drag moves the sheet **60.0px fresh and 60.0px after a re-render**; before, 60.0px fresh and **0.0px after a re-render**, with the grab bar absent from the DOM. The earlier fixes were correct and bound to a node the panel destroys. Two hypotheses were tested and excluded: no transition was fighting the drag (computed duration 0s during the gesture), and the scrim neither helps nor hinders it |
| 2 | *"Close and expand button top right not aligned"*, reported twice | `003` | **Shipped + verified**, not operator-confirmed | Lane entry 45: "10px centre stagger removed and the expand action raised from a 24px to a 44px target". `016` ask 2, measured on the shipped build: both **44×44**, centre lines differing by **0.00px** |
| 3 | *"closer to notion… no space between, text a bit bigger, light transparent divider between each item"* — three asks | `010` | **2 of 3 verified; 1 open** | Lane entry 43: value un-pinned from the right edge, label given a fixed 96px column, row gap 2px→0 with a hairline, padding 4/6→8/12. Desktop measured identical before and after. `016` ask 3: gap **0px**, divider **1px at 40% alpha**, value text **16px** — all hold. ~~**The label measures 13px, which is not on the 12/14/16/18/20/24 scale.**~~ **Resolved: the operator chose 14px**, now set on the record row label. **A conflict surfaced in doing it and is named rather than resolved:** the plugin's own token ladder is 11/12/13/16/22, on which 13 *is* a step and 14 is not, while the audit measures against 12/14/16/18/20/24, on which the reverse holds. The label takes a literal 14px because minting a token for one consumer, or moving `--db-font-md` and its thirty-odd other rules, are both larger decisions than this label. **Reconciling the two ladders is the real fix and is not done** |
| 4 | *"when you click an item and keyboard opens you no longer see the item"* | `010` built it, `016` measured it | **Mechanism verified; one host shape unreachable** | `keyboardInset()` at `popover-position.ts:514`, written to `--db-mobile-sheet-bottom` at `:301`, with a pinch-zoom guard at `scale <= 1.01`. `016` ask 4: with `--keyboard-height: 336px` the sheet's bottom moves **844 → 508**, its top stays on screen at y=275, and it returns to 844 when the keyboard closes. **But `openRecordDetailPanel` registers `onResize = () => close()`.** iOS shrinks `visualViewport` and leaves the window alone, so the inset works there; a host that announces the keyboard by resizing the window **destroys the sheet before any inset can apply**. **The operator has answered: their phone shrinks the content area and leaves the window at full height — the iOS shape.** So the inset path is the one that runs, `onResize` is not fired by the keyboard, and the sheet is not destroyed. This row is **finished pending device confirmation** rather than blocked, and the window-resize hazard stays recorded as a real risk on hosts the operator does not hold |
| 5 | *"the desktop table column dropdown… should be a sheet on mobile"* | `011` | **Shipped + verified**, not operator-confirmed | `011/acceptance-criteria.md` AC-1: bottom 876 against an 844 viewport → 844. AC-2: width 220 → 390. Before-numbers taken from a detached worktree at `4830275` with the working tree's `styles.css` copied in, so only code differs. `owned-menu.ts:173-177` takes the sheet branch |
| 6 | *"Buttons of this sheet dont align with other sheets… proper reusable sheet menu item components"* | `011` | **Shipped + verified**, not operator-confirmed | `011/acceptance-criteria.md` measured **17 menu-row shapes on desktop, 15 of 17 on a phone** before the change. Lane entry 46: row grammar keyed to the row by doubling the class; sheet label spread 85px → 0px. `016` ask 8: a row built by `createMenuRow` measures `min-height 44px`, `padding 8px 16px`, height 44px in the owned-menu sheet and **identically** in a panel sheet |
| 7 | *"missing euro icons and the decimals €1.000,24"* | **`019-card-field-value-formatting`, opened by this pass** | **Shipped, zero checks** | Eleven added lines in `src/views/card-field-renderer.ts` routing the numeric branch through `formatEuroCurrency` / `formatEuroNumber`. **Was an orphan** — see §6 |
| 8 | *"a tap in a cell will open edit state… for the main item it will open the sheet"* | `012` | **Shipped + verified**, not operator-confirmed | `setupTitleCellTap` moved to the shared `table-record-peek` and bound by both table hosts (`database-view.ts:8457`, `embedded-database-renderer.ts:398`); `isTitleCell` keys off visible column order. `012` continuity: 88 placement checks, 87 pass, 1 declared red |
| 9 | *"block all interaction with items behind the sheet… black 25% transparent bg"* | `003` built it, `012` and `016` asserted it | **Shipped + verified**, not operator-confirmed | Lane entry 47: "scrim made modal at 25% and capturing by default". `012/acceptance-criteria.md` AC-6 **PASS** — a cell's centre resolves to `db-mobile-sheet-scrim` with `pointer-events: auto`, negative control `{scrimCapturesPointer:false}` observed red. `016` ask 7: scrim is `rgba(0,0,0,0.25)`, a press 120px above the sheet resolves to it, and a press on the grab band resolves to **the grab handle** (sheet z=1000, scrim z=999). **The operator's last clause — "that way drag handler works better" — is a non-issue**: the scrim neither helps nor hinders the drag, whose real cause was elsewhere (row 1) |
| 10 | *"drag handler tap area should be… atleast 48px high"* | `003` | **Operator-confirmed as an accepted shortfall. Do not reopen.** | `003/spec.md` "OPERATOR DECISION — the grab band stops at 35px": the operator was shown the shortfall and accepted it. 48px needs a taller sheet header, moving every sheet surface. **The decision stands; the number does not.** `016` measured the band answering presses over y=1..32 — **32px, full width at 386 of 390** — and derives it from the stylesheet as `--db-space-6`(16) + 8 + 4 + 4 = 32. Four different heights are now on record; see §7.5. All of them clear WCAG 2.5.8's 24px AA target and fall short of 2.5.5's 44px, so **none of them changes the decision** |
| 11 | *"make sure each sheet has same bg color"* | `003` | **Shipped + verified**, not operator-confirmed | Lane entry 47: "one overlay fill for all seven sheet surfaces". `016` ask 6 measured **all 9 sheet-capable surfaces at the identical fill** `color(srgb 0.95 0.95 0.95)`. Seven against nine is a small counting conflict, noted in §7.7. No before-number was ever recorded for this ask |
| 12 | *"Add view sheet is real bad… needs fresh design agent review"* | `013` | **Shipped + verified**, not operator-confirmed | `013/acceptance-criteria.md` §2 adjudicates the six observed defects against production rather than the fixture: **4 REAL, 1 HALF REAL** (the accessible name is present, the visible label is not), **1 FIXTURE ARTIFACT** (it already was a sheet on a phone). Lane entries 50-53; tile grid deleted and rebuilt on the row grammar; a verifier follow-up took the control boundary 1.21:1 → 3.23:1 |
| 13 | *"Make sure version is updated and for me to test"* | **No phase. Released under version management.** | **Done, awaiting the operator** | `manifest.json` and `package.json` both at **1.3.3**. `HEAD` is at 1.3.1, so 1.3.2 and 1.3.3 exist only in the working tree. This row is deliberately not a phase: a version bump has no acceptance criterion beyond the operator installing it |
| 14 | *"checkbox is being cut off on desktop"* | `014` | **Shipped + verified**, recapture owed | `014/acceptance-criteria.md` AC-1: narrowest left clearance **0px across 25 cells, all clipping → 18px across 25**. Negative control run **both ways** — re-guarding takes it to exit 1 at 78/80, restoring returns 79/80 exit 0. AC-2 guards the guard: 25/25 carry the shared component's class, so the fixture cannot go green by drifting |
| 15 | *"fresh pass on dropdown placement in the desktop version"* | `015` | **5 of 6 fixed, the 6th measured and declared** | `015/spec.md`: desktop placement is **five independent paths**, and the defects cluster on the four that are not maintained. The unfixed one — the calendar/timeline search-results panel clamping to `window.innerWidth` and travelling **240-292px under an open right sidebar** — is duplicated verbatim in two files held by another session for the whole phase, so it is measured and declared rather than fixed. Probe 30/31, one declared red |
| 16 | *"to the left of checkbox that little button doesnt have enough space"* | **`018-select-column-affordance-fit`, opened by this pass** | **Shipped under another phase's lane, unverified** | Lane entry 64: gap **−14px in a 49px cell on a phone, −17px on desktop** → **+4px in a 65px cell**, and no desktop button at all, which is what production builds. **Was an orphan** — see §6 |
| 18 | *"List view still bugged and freezes"* | `028-remaining-freezes` | **A prior fix (`024`) shipped and verified; operator confirmation now answered, negatively** | `024/acceptance-criteria.md` AC-1: observed red before green on the render-time budget (`list-bench: FAIL — 7173.5ms exceeds the 2000ms budget` → `PASS — worst render 85.2ms`); re-derived once the budget was corrected to count blocked main thread rather than render alone: **8,646.0ms → 246.6ms, 35.1× less, at 1,600 rows**. AC-2 through AC-5 and AC-7 pass with their own controls. AC-6, operator confirmation, was already on record as **"NOT MET — the only criterion that matters and it is not mine to close."** This report is that criterion closing, negatively. `028` was opened today to find out why; not read for this pass — see row 19 |
| 19 | *"Board view is also completely bugged and freezes"* | `028-remaining-freezes` | **New; phase opened today, not read** | Operator report, this pass. No board-view fix or investigation found in the git log or `tools/lane/css-lane.json` as of this evidence pass. `028`'s own files were not read — another agent is authoring them concurrently — so what, if anything, it has already found is UNKNOWN here |
| 20 | *"Same for calendar and other non table views"* — **the table view works; every non-table view freezes** | `028-remaining-freezes` | **New; phase opened today, not read** | Operator report, this pass, and the sharpest fact in this batch: it draws the boundary at table-versus-everything-else rather than at any one view. Same evidence gap as row 19 |
| 21 | *"Sort sheet bugs out if you press add sort it disappears and app freezes"* | `028-remaining-freezes` | **New; phase opened today, not read** | Operator report, this pass. Same evidence gap as row 19 |
| 22 | *"Closing sort sheet also bugs things out"* | `028-remaining-freezes` | **New; phase opened today, not read** | Operator report, this pass. Same evidence gap as row 19 |
| 23 | *"Same problem with filter sheet"* | `028-remaining-freezes` | **New; phase opened today, not read** | Operator report, this pass. Same evidence gap as row 19 |
| 24 | *"Column setting sheet also bugged you cant click change type doesnt do anything"* | `027-sheet-menu-grammar-and-motion` | **New; phase opened today, not read** | Operator report, this pass. No matching fix found in the git log or the lane journal as of this evidence pass; `027`'s contents were not read — another agent is authoring them concurrently |
| 25 | *"sheet buttons shouldnt be centered text… Aligned left. Dividers between. More like normal sheet buttons"*, plus *"view sheet doesnt work you cant drag it down and has bad layout"*, *"sheet shouldnt instantly appear but smoothly and fastly move in view from bottom like you see on ios"*, and *"sheets have horizontal overflow which shouldnt happen only vertical"* against a 90vh cap | `027-sheet-menu-grammar-and-motion` | **New; phase opened today, not read** | Five distinct asks bundled as one report, in the pattern of row 3. Operator report, this pass; same evidence gap as row 24 |

| 26 | *"some sheets still cant be dragged down like group sheet or view sheet"* | `031-sheet-lifecycle-ownership` | **New, this session. Not investigated.** | Operator report on 1.3.9. **Hypothesis to test, not a conclusion:** report 1's root cause was that a panel's own content render empties the panel and destroys the grab bar the sheet module prepended as its child, silently unbinding the gesture on every re-render. That was fixed for the record sheet. If the group and view sheets mount their content the same way, they would carry the identical defect on a surface nobody re-checked. What refutes it: a grab bar that survives their re-render, in which case the cause is elsewhere and this is a second mechanism |
| 27 | *"sometimes bug on closing freezing app"* | `031-sheet-lifecycle-ownership` | **New, this session. Not investigated.** | Operator report on 1.3.9, and note the word **sometimes** — an intermittent freeze is a different shape from reports 21-23, which froze on every close. Those were traced to dismissal routing through a full rebuild of every row, and `7ad775b` cut three rebuilds to one. **What is unexplained:** why a single remaining rebuild would freeze only sometimes. Candidates worth separating before spending a day: the rebuild cost crossing the budget only at certain row counts (the list already blocks 2.0-4.9s at the operator's shape), versus a distinct dismissal path that still triggers more than one rebuild |

| 28 | *"this dropdown doesnt align with other components yet dropdowns and sheets"* — the desktop **More tools** toolbar dropdown | `027-sheet-menu-grammar-and-motion` | **New, this session. Not investigated.** | Operator report on 1.3.9, with a screenshot: the section heading sits at the panel's left inset while the rows below start far to its right, so heading and rows do not share a left edge. **Hypothesis, testable:** the shared row grammar declares `padding: 0 8px` and `justify-content: flex-start` on `.db-menu-item`, and `.db-menu-section` declares `padding: 6px 8px 2px` — the same 8px inset, so a surface built on the shared row cannot show this gap. That points at the More-tools dropdown not using `createMenuRow`. **The stylesheet already records why this shape is invisible to our checks:** the `justify-content` declaration exists precisely because an undeclared value computes to `normal` against the plugin stylesheet alone and only centres under the host's cascade, so a rule measured without the host looks correct. What refutes the hypothesis: finding this surface already on `createMenuRow`, which would make it a cascade escape rather than a grammar gap |

**Reports 21-24 and report 27 are probably one defect with two owners.** 21, 22 and 23 are the sort
and filter sheets bugging out and freezing on open or close; 24 is the column-setting sheet not
responding. All three surfaces are panel families that `031` identifies as leaving a scrim behind,
and column-manager is one of the two it identifies as leaving the sheet itself. They still route to
`028` and `027` because that is where they were filed when the symptom looked like a render cost.

Not re-routed yet, deliberately: re-routing four reports on a mechanism that is diagnosed but not
yet fixed would be filing them where I expect the answer to be rather than where it is shown to be.
When `031` T1's parity check runs, it will say which of these surfaces leak — and that measurement,
not this note, is what should move them.

### What the table says as a whole

**All twenty-seven reports now have a named phase**, and fifteen of the original sixteen have
shipped code — report 13 remains the exception, deliberately not a phase. None of the eight rows
added later (18-28) have shipped code under the phase each now names, `027` or `028`, both opened
today and still being investigated. Row 18 is the one worth naming apart from the rest: the phase
it succeeds, `024`, did ship and rigorously verify a fix for the same symptom, and this report is
that fix not holding on the operator's device.

**Only report 10 is operator-confirmed,** and it is confirmed as a shortfall the operator agreed to
live with. Everything else sits at shipped or verified. Under `spec.md` §7 that means **no report in
this program is closed**, and the count of green checks does not change that.

**Three rows are not simply green.** Report 3's third ask is an open type-scale decision. Report 4
works on a host that shrinks the visual viewport and is destroyed on a host that resizes the window —
which of those the operator holds decides the row. Reports 7 and 16 — phases `019` and `018` —
shipped without a check of any kind until today.

**Report 1 deserves separate mention.** It was fixed three times and re-reported three times, and the
reason has now been measured: the fixes were correct and bound to a node the panel's own render
destroys. Nothing in the harness could see it, because no check had ever moved a finger across the
grab bar. The next re-report, if there is one, would be the fourth — which is why `016`'s operator
list asks specifically to drag *after editing a field*, the case that was broken.

**Row 18 deserves the same separate mention, for the opposite reason.** `024-list-view-freeze`
measured its fix against the real renderer, not a fixture, and was observed red before green on
the render-time budget (`FAIL — 7173.5ms exceeds the 2000ms budget` → `PASS — worst render
85.2ms`); re-derived once the budget was corrected to count blocked main thread rather than
render alone, the honest multiplier is **35.1×** (8,646.0ms → 246.6ms at 1,600 rows) — and it
named the one criterion it could not close: `024/acceptance-criteria.md` AC-6, **"NOT MET — this
is the only criterion that matters and it is not mine to close."** This report is that criterion
closing, negatively. Whether the operator's build already carried 1.3.7 — the only release with
both halves of the fix — is not established here, and neither is the operator's actual row count
against the 400-1,600 range the benchmark covered; `024`'s own open questions name both gaps.
**A pattern worth naming rather than concluding:** rows 19-23 report the same symptom — freeze,
on interaction — on the board view, the calendar view, and both the sort and filter sheets, none
of which shares `024`'s renderer. If those turn out to be one mechanism, it is not the one `024`
fixed.

**Rows 19 and 20 sharpen the boundary the operator drew.** The report places table views on one
side and names board, calendar and "other non table views" on the other — the table works,
nothing else does. That line, not any single view, is `028-remaining-freezes`'s clearest lead.

**Rows 21-23 name a second cluster inside the same phase:** the sort sheet freezes on adding a
condition and again on closing, and the filter sheet fails the same way. `028` carries all six
rows; its own documents were not read for this pass, per this update's own scope — see §5.1.

**Rows 24-25, filed against `027-sheet-menu-grammar-and-motion`,** are grammar and motion
complaints rather than freezes: a column-setting sheet whose type control does not respond, and
five separate asks about sheet button alignment, dividers, drag affordance, entry motion and
horizontal overflow. `027`'s own documents were likewise not read for this pass.

---

<!-- ANCHOR:now-next-later -->
## 4A. THE DEVICE PASS — DEFERRAL RECORDED, PER REPORT

The parent's completion criterion offers two ways to close a report: **confirmed on the operator's
device**, or **deferred by the operator with the deferral recorded**. Today's count is 1 of 16 and
the operator has chosen to verify rather than defer the pass outright, so every row below is
**deferred to that pass** — the deferral, and what it is deferred *to*, recorded here rather than
left implicit. A report that is neither confirmed nor recorded as deferred is the state this section
exists to abolish.

**Deferred to:** the device pass on **1.3.9**, cut for this purpose because 1.3.8 predates the
timeline fix. **Deferred at:** 2026-08-31. **Deferred by:** the operator, who chose a build first.

**What this section does NOT cover, stated so the count cannot be read as complete.** The table
below disposes of the original sixteen. Reports **21-28 are in neither state** — not confirmed, not
deferred with terms. Eight of them: the sort, filter and column-setting sheets (21-24), the bundled
sheet-grammar asks (25), the group and view sheets that will not drag (26), the intermittent
close-freeze (27), and the More-tools dropdown alignment (28). Four of those eight arrived after
this section was written, which is exactly how a denominator goes stale: the section was correct
when written and was not re-derived when the table grew.

Report 10 is not in the table: it is the one report already **operator-confirmed**, as an accepted
shortfall, and `spec.md` says do not reopen it.

| # | What to do on device | What passes | Risk if it fails |
|---|---|---|---|
| 1 | Open a record sheet, **edit a field**, then drag the sheet down | It moves with the finger, both before and after the edit | The fix bound to a node the panel destroys — this was re-reported three times, so the after-edit case is the one that matters |
| 2 | Look at the close and expand buttons, top right of a sheet | Aligned on one centre line, both comfortably tappable | Measured 44x44 with 0.00px stagger; a miss means the harness and the device disagree |
| 3 | Open a record sheet and read the property rows | No gap between rows, a hairline divider, label smaller than its value | Label now 14px on the audited scale — the only ask of the three that was still open |
| 4 | Tap a field so the keyboard opens | The row you tapped stays visible; the sheet does not vanish | Your phone shrinks content and keeps the window, so the inset path runs. A sheet that disappears means the other host shape after all |
| 5 | On a phone, open the table's column dropdown | It arrives as a sheet from the bottom, not a desktop popover | — |
| 6 | Compare buttons across two different sheets | Same height, same padding, same alignment | Measured identical at 44px; a difference means the shared grammar is not reaching one of them |
| 7 | Look at a currency card field | Euro sign and Dutch separators, e.g. `€ 1.000,24` | In scope after the operator's narrow reading of the exclusion |
| 8 | Tap a cell, then tap a title cell | A cell opens edit state; a title opens the record sheet | — |
| 9 | With a sheet open, try to tap a row behind it | Nothing behind responds; the backdrop is dark and blocks | — |
| 11 | Open several different sheets in turn | All the same background fill | Nine surfaces measured identical; no before-number was ever recorded |
| 12 | Open the add-view sheet | Readable layout, controls legible and tappable | Rebuilt on the row grammar after six observed defects |
| 13 | Check the installed version | **1.3.9** | This report is the install itself |
| 14 | On desktop, look at a select checkbox in a table | Not clipped at its left edge | Measured 0px clearance across 25 cells before, 18px after |
| 15 | On desktop with a right sidebar open, open dropdowns across views | They land under their trigger and stay on screen | One of six paths is declared unfixed — the calendar/timeline search panel, held by another session |
| 16 | Look left of a select checkbox on a phone | The small button has clear space around it | Was -14px on a phone, -17px on desktop; now +4px, and no desktop button at all |

**The three that are more than a look.** Reports 18-20 — list, board, calendar and timeline freezing
— are the ones 1.3.9 exists for. Open each view on the real database (**1,000-3,000 rows at 80-100%
fill**) and time it. The timeline should now open; the list is **expected to still stall**, because
at that shape it blocks 2.0-4.9s and the remaining cost is layout over node count, which only
virtualisation reaches. A list that still hangs is **not** a failed fix — it is the measured,
recorded state, and saying so in advance is the point of recording the deferral.

**What none of this closes.** The 20-iteration deep review is unstarted, so every number above is
self-certified against D4. `--font-ui-medium` is unread on a device, so `021` still rests on an
inferred value. Both are recorded as owed rather than counted as done.

---

## 5. PHASES: NOW / NEXT / LATER

Status per phase, measured against the working tree rather than against the plan. Six phases are
held by live agents and are marked ⚠ — their state is read-only here and may have moved since.

**These three headings are a schedule, not a status.** They group phases by when they are worked,
and several bullets under *Next* and *Later* are shipped. Each bullet carries its own status word
from §3.1; read that, not the heading above it.

**Now:** Six phases held by other agents — four unaudited since this morning's snapshot, two opened
today.

- ⚠ `004-checkbox-ownership` — **state UNKNOWN, see §7.1.** Holds the `styles.css` lane.
- ⚠ `005-content-row-rhythm` — shipped: list-row border-box, list meta ruled into columns, renderer-declared tracks. Continuity still reads "not started".
- ⚠ `016-sheet-drag-and-audit` — 90%. **Root-caused report 1** and re-measured all eight sheet asks together on the shipped build: 19 of 22 checks pass, 3 declared. Exit signal: two operator decisions (the 13px row label, and whether the sheet should survive a window resize instead of closing).
- ⚠ `017-touch-row-range-selection` — 95%. Predicate removed from both views, hold gesture added, 12 checks added, six negative controls run and restored by hash. Exit signal: a decision on whether the gesture gets an announcement in the selection status bar.
- ⚠ `027-sheet-menu-grammar-and-motion` — opened today for rows 24-25 (a non-responsive
  column-type control, and five sheet button/motion/overflow asks). Held by another agent at
  the time of this pass; state UNKNOWN, not read.
- ⚠ `028-remaining-freezes` — opened today for rows 18-23 (list, board, calendar and other
  non-table views; the sort and filter sheets). Held by another agent at the time of this pass;
  state UNKNOWN, not read.

**Next:** the verification debt the shipping created.

- `020-harness-fidelity-repair` — shipped and self-verified: the grab band's arithmetic
  corrected (add-view 42px → 48px, owned-menu 38px → 44px, both over the 44px thumb floor), a
  test shim that was more permissive than the device, an evidence-freshness check, and checks
  that lived outside the harness re-asserted inside it. Exit signal: the operator installs a
  build carrying it.
- `021-sheet-inline-edit-alignment` — shipped for the sheet's number/currency inline editor
  (7.6px → 1.0px off-centre, claimed). A fresh review found the same fix also reaches a fifth,
  previously uncounted editor — the title's inline rename popover — which improves 9.0px →
  2.4px and **is still wrong**, left open rather than quietly claimed. Exit signal: the title
  editor's residual offset, closed or accepted.
- `024-list-view-freeze` — shipped and rigorously verified against the real renderer (35.1×
  less blocked main thread at 1,600 rows); its own AC-6 already read **NOT MET**, and row 18
  today answers it — the freeze persists on the operator's device. Exit signal is no longer
  "the operator installs and reports"; it is `028-remaining-freezes`.
- `018-select-column-affordance-fit` — opened today. Code landed, nothing measured. Exit signal: the two after-numbers re-run and both negative controls observed red.
- `019-card-field-value-formatting` — opened today. Code landed, no test exists for the formatters at all. Exit signal: tests written, parity check added and observed red, and the scope question in §7.4 answered.
- `010`, `011`, `013` — shipped and self-verified, none operator-confirmed. Exit signal: the operator installs 1.3.3 and reports per surface.
- **The recapture debt — CLOSED.** The captures were regenerated and `screenshots-fresh` is green. `npm run gate` now runs **16 lanes and exits 0**, up from 13 lanes exiting 1: the two added since are `render-assertions`, which builds real `ListRenderer` and `TableRenderer` instances, and the repaired `placement`, which had been printing zero checks because one throwing check destroyed all 205 others before any of them reported.
- **The scaffold debt — CLOSED for 27 of 29 folders.** `010` through `017` all carry `plan.md` and `tasks.md`, every spec and goal carries its template marker and anchors, and `012`'s continuity block measures 1,481 bytes against the 2,048 cap. The parent validates at Errors: 0, Warnings: 0.
  Two folders remain, both honestly: `000` needs the `implementation-summary.md` its nine checked tasks make mandatory — all nine verified against the tree first, so the document rests on evidence rather than assertion. `007` cannot reach zero at all: it declares itself off-path and has no `spec.md`, `plan.md` or `tasks.md` by design, so the validator checks it as a child and reports files that were never meant to exist. Writing them would produce three documents whose only reader is the validator.
- **One warning this reconciliation introduced.** Adding `018` gives `017` a numeric successor it does not reference, so `PHASE_LINKS` went from 14 issues to 17 — one of the three is this pass's, and the other two arrived when `016` gained a `spec.md`. The fix is a line in `017`'s phase-chain blockquote, and `017` is held by a live agent, so it was left rather than written into.

**Later:** the structural phases the program declared first and ran last.

- `009-live-verification` — instruments exist (`tools/live/probe.mjs`) but no criteria are recorded as met. It was declared phase 1 and has not gated anything.
- `000-surface-contract-and-truthful-harness` — its census instruments exist and one edit shipped with a recapture debt. Continuity reads 0%.
- `001` — the overlay census has not run; the factory question was settled by deleting it (§7.2).
- `002-properties-panel` — held the lane nine times with substantial edits; continuity reads "not started".
- `006-record-open-target` — **partly shipped, and this entry said otherwise.** Commit `2babab2`, "make Open open the note", routes desktop Open through `openNote` instead of the peek and replaces the peek's hardcoded `z-index: 998` with a layer token. It landed under `002`'s lane hold, and none of that hold's nine notes mentions it. Still open: the setting, the touch branch, and retiring the peek. Its one operator question — side panel, full-page modal, or both behind a setting — stands.
- `008-integration-and-release-observability` — **Deliverable A shipped**: `tools/live/replay.mjs` exists and `npm run replay` re-asserts 8 results against recorded pre-fix numbers. The release decision stays last.
- `007-architecture-research` — Complete. 10 iterations plus synthesis; not a phase.
- `022-selection-bar-keyboard-docking` — **Shipped + verified, awaiting device — 6 of 8.** This
  bullet read *Planned. Needs the bar measured against an open keyboard before a docking mechanism
  is chosen* after the mechanism had been chosen, built and released. The bar docks on
  `--db-keyboard-inset`, which the plugin publishes itself rather than reading the host's
  `--keyboard-height`; that distinction is the phase's actual result, because the first shipped rule
  read a variable nothing in `src/` sets and moved nothing, silently. Open: which host shape the
  operator's phone is, and the operator seeing a usable bar.
- `023-record-note-body` — Planned, and **deliberately not startable**: the operator has not
  yet picked display-only or editable, which the phase's own spec says decides its size by
  roughly an order of magnitude.
- `025-story-coverage-blindness` — **Shipped + verified, awaiting device — 8 of 10.** The
  sentence this bullet used to carry — *the gate lane named `story-coverage` runs the DOM-shim
  checker* — was the defect, and it was fixed: `tools/gate.mjs:58-59` now carries `shim-coverage`
  and `story-coverage` as two distinct lanes running two distinct scripts. Open: the control that
  was substituted rather than run on the tree as received, and the operator opening the catalogue.
- `026-production-render-assertions` — **Shipped + verified — 9 of 9.** `render-assertions` is a
  gate lane (`tools/gate.mjs:67`) and renderer coverage stands at 6 of 22. This phase owes no device
  confirmation: its deliverable is a check in the gate, and the gate is where it is confirmed. Its
  own `spec.md` read *Draft — nothing built* while that lane was green.
<!-- /ANCHOR:now-next-later -->

### 5.0 The derived board, 2026-09-01

§3.2 settled that a phase's figure is `ticked ÷ total` over its own `goal.md` checklist, derived and
never judged. This is that computation run across every phase on the date above, so the board and the
tree cannot drift apart without one command showing it.

**Regenerate, and prefer the output to anything written below it:**

```sh
for d in specs/public/005-component-surface-system/0*/; do
  f="$d/goal.md"; [ -f "$f" ] || continue
  t=$(grep -c '^- \[' "$f"); x=$(grep -c '^- \[x\]' "$f"); [ "$t" -eq 0 ] && continue
  printf '%3s%%  %2s/%-2s  %s\n' "$(python3 -c "print(round($x/$t*100))")" "$x" "$t" "$(basename $d)"
done | sort -n
```

| Phase | Derived | Open | Operator-only | Harness-reachable |
|---|---|---|---|---|
| `000-surface-contract-and-truthful-harness` | **30%** — 3/10 | 7 | 1 | 6 |
| `001-overlay-placement-and-menu-language` | **75%** — 6/8 | 2 | 1 | 1 |
| `002-properties-panel` | **71%** — 5/7 | 2 | 1 | 1 |
| `003-mobile-sheet-presentation` | **50%** — 4/8 | 4 | 1 | 3 |
| `004-checkbox-ownership` | **75%** — 6/8 | 2 | 1 | 1 |
| `005-content-row-rhythm` | **86%** — 6/7 | 1 | 1 | 0 |
| `006-record-open-target` | **71%** — 5/7 | 2 | 1 | 1 |
| `007-architecture-research` | **100%** — 2/2 | 0 | 0 | 0 |
| `008-integration-and-release-observability` | **50%** — 5/10 | 5 | 1 | 4 |
| `009-live-verification` | **33%** — 2/6 | 4 | 1 | 3 |
| `010-sheet-reading-and-keyboard` | **91%** — 10/11 | 1 | 1 | 0 |
| `011-mobile-menu-presentation` | **91%** — 10/11 | 1 | 1 | 0 |
| `012-mobile-touch-semantics` | **90%** — 9/10 | 1 | 1 | 0 |
| `013-add-view-sheet` | **83%** — 10/12 | 2 | 1 | 1 |
| `014-desktop-select-checkbox` | **71%** — 5/7 | 2 | 1 | 1 |
| `015-desktop-dropdown-placement` | **88%** — 7/8 | 1 | 1 | 0 |
| `016-sheet-drag-and-audit` | **80%** — 8/10 | 2 | 1 | 1 |
| `017-touch-row-range-selection` | **73%** — 8/11 | 3 | 1 | 2 |
| `018-select-column-affordance-fit` | **80%** — 4/5 | 1 | 1 | 0 |
| `019-card-field-value-formatting` | **71%** — 5/7 | 2 | 1 | 1 |
| `020-harness-fidelity-repair` | **92%** — 12/13 | 1 | 1 | 0 |
| `021-sheet-inline-edit-alignment` | **88%** — 7/8 | 1 | 1 | 0 |
| `022-selection-bar-keyboard-docking` | **75%** — 6/8 | 2 | 1 | 1 |
| `023-record-note-body` | **89%** — 8/9 | 1 | 1 | 0 |
| `024-list-view-freeze` | **83%** — 5/6 | 1 | 1 | 0 |
| `025-story-coverage-blindness` | **80%** — 8/10 | 2 | 1 | 1 |
| `026-production-render-assertions` | **100%** — 9/9 | 0 | 0 | 0 |
| `027-sheet-menu-grammar-and-motion` | **93%** — 13/14 | 1 | 1 | 0 |
| `028-remaining-freezes` | **83%** — 5/6 | 1 | 0 | 1 |
| `029-numeric-coercion-parity` | **86%** — 6/7 | 1 | 1 | 0 |
| `030-gallery-view-deprecation` | **67%** — 4/6 | 2 | 1 | 1 |
| `031-sheet-lifecycle-ownership` | **83%** — 5/6 | 1 | 1 | 0 |
| `032-cover-target-scheme-safety` | **100%** — 4/4 | 0 | 0 | 0 |
| `033-list-virtualisation` | **83%** — 5/6 | 1 | 1 | 0 |
| `034-packet-doc-truth` | **100%** — 4/4 | 0 | 0 | 0 |

**Program: 221/281 = 79%.** 60 rows open — 30 closable only by the operator's device, 30 still reachable here.

**The two columns after "Open" are the ones worth reading.** A row only the operator can close is not
work waiting to be done here — it is the program's closing condition, and §4A records why it is
deferred. A harness-reachable row is work. Counting them together is what made "N% complete" mean
nothing, and it is why this table separates them.

**Every phase that this program's own hook lists as blocked on implementation now reads otherwise in
the tree.** `030` carries the migration and the importer change; `031` and `033` have one row each
and it is the operator's; `032` and `034` are 4/4. The figures above are the answer to that, and the
command above is how to disbelieve them.

### 5.1 Status table

| Phase | Declared | Actual | Evidence for "actual" |
|---|---|---|---|
| `000` | Planned | **Partially shipped** | Held the lane, added `.db-surface` to both token roots, released with an unsigned recapture. Census instruments exist under `tools/live/` |
| `001` | Planned | **Partially shipped** | Lane journal records it as `001-overlay-width-and-chrome` (§7.3). Owned menu chromed; portal-unrecoverable count 537 → 0; `openSurface` deleted (§7.2). Census not run |
| `002` | Planned | **Shipped, extensively** | Nine lane holds: sheet portal restored, phone list constrained, list card stacked, reduced-motion blocks repaired, row-state cluster landed and recaptured |
| `003` | Planned | **Shipped; report 1 still open** | Sheet layer, header actions, scrim, single fill, grab band. The drag is reported broken on the shipped build |
| `004` ⚠ | Planned | **UNKNOWN — §7.1** | Three sources disagree |
| `005` ⚠ | Planned | **Shipped** | List-row border-box, meta ruled into columns, renderer-declared tracks, portal-safety instrument built |
| `006` | Planned | **In progress** — the earlier "accurate" was wrong | 2 of 5 acceptance items shipped in `2babab2` under another phase's lane hold. Two of its criteria now cite a tree that no longer exists |
| `007` | Complete | **Complete** — accurate | Research plus synthesis, folded into `000`, `008`, `009` |
| `008` | Planned | **Deliverable A shipped** | `tools/live/replay.mjs`, `npm run replay` |
| `009` | Planned | **Instrument built, nothing gated** | `tools/live/probe.mjs` exists. It was declared phase 1 and gated no handoff |
| `010` | absent | **Shipped + verified** | Lane entry 43; keyboard lever wired |
| `011` | absent | **Shipped + verified** | Before/after from a detached worktree |
| `012` ⚠ | absent | **90%** | 87/88 placement, 1 declared red; blocked on stale captures |
| `013` | absent | **Shipped + verified** | Lane entries 50-53; six defects adjudicated |
| `014` | absent | **85%** | AC-1 through AC-3 with a two-way negative control; recapture owed |
| `015` | absent | **80%** | 30/31; the sixth defect declared, blocked on a file lock |
| `016` ⚠ | absent | **90%, report 1 root-caused** | 19/22, 3 declared. Gained `spec.md` and `acceptance-criteria.md` on 2026-08-30 while this file was being written |
| `017` ⚠ | absent | **95%** | 12 checks, six negative controls |
| `018` | absent | **Opened today** | Code shipped under `004`'s lane hold; unverified |
| `019` | absent | **Opened today** | Code shipped; no test exists |
| `020` | absent | **Shipped + verified, awaiting device — 12 of 13** | Its own `spec.md` read *Complete* against a `completion_pct` of 80; D3 reserves Complete for operator-confirmed and the one open criterion is the operator's fixture sign-off. Grab-band arithmetic corrected (42→48px add-view, 38→44px owned-menu, both over the 44px floor); test shim, evidence-freshness and in-harness checks repaired alongside it. Lane journal acquire→edit→release 12:05-12:53; commits `9d4f569`, `780a736`, `0a38723`, `1e6397d`, `56ba94e` |
| `021` | absent | **Shipped; 4 of 5 editors verified, 1 still off** | Lane journal, two full acquire→release cycles, 13:19-13:42, "Not committed" at release. Commit `0ff9f9a` centres the number/currency inline editor on its row (7.6px→1.0px claimed). A fresh review, commit `3d4d2f2`, found the fix also reaches a fifth, previously uncounted editor sharing the same popover class — the title's inline rename editor — which improves 9.0px→2.4px off-centre and is still wrong: "left open rather than quietly claimed" |
| `022` | absent | **Shipped + verified, awaiting device — 6 of 8** | This row and the phase's own `spec.md` both read *Planned* after the code landed. `styles.css:2436` docks the bar on `--db-keyboard-inset`, published by `publishKeyboardInset` in `src/views/popover-position.ts`; commit `a0d42a1` precedes the 1.3.9 cut `9e12fe1`, so it is in the build the operator is running. Open: which host shape the phone is, and the operator seeing a usable bar |
| `023` | absent | **Planned, not startable** | Own `spec.md` declares itself Planned and "deliberately not startable" pending an operator choice between a display-only and an editable note body |
| `024` | absent | **Shipped + verified; operator confirmation now answered, negatively** | `acceptance-criteria.md` AC-1 through AC-5 and AC-7 pass with real red-before-green controls on the actual renderer; AC-6 (operator confirmation) reads **NOT MET** in the phase's own words. Row 18 is that criterion closing |
| `025` | absent | **Shipped + verified, awaiting device — 8 of 10** | This row's evidence was the defect, not the state: the `story-coverage` lane now runs `npm run story:coverage` and `shim-coverage` runs the shim checker, two distinct entries at `tools/gate.mjs:58-59`, and the ambiguous package script is gone. Re-run today: **13 of 32 renderable modules carry a story, 19 exempt** — the phase's own table records 13/31 and 18, so its counts have drifted by one module while the property it asserts (0 unanswered) still holds. Open: the substituted control, and the operator opening the catalogue |
| `026` | absent | **Shipped + verified — 9 of 9; controls N1-N6 observed failing** | `tools/live/render-assertions.mjs` + harness; one `CHECKS` entry (`render-assertions`). Bundles the shipped renderers in headless Chrome and asserts structure: red at `173819e^` (1,600 layout reads in the row loop) and green at `845a27c` (2). Coverage is now **6 of 22** stamped at `tools/live/renderer-coverage.json`, and it is committed. Its own `spec.md` read *Draft — nothing built* against a lane that has been green in the gate |
| `027` | absent | **UNKNOWN** | Folder absent from the working tree as of this pass; opened by another agent to investigate rows 24-25; not read per this update's own scope |
| `028` | absent | **UNKNOWN** | Folder absent from the working tree as of this pass; opened by another agent to investigate rows 18-23; not read per this update's own scope |

---

## 6. THE ORPHANS

Two reports were fixed with no phase owning them. Both are now phases. The search that found them
covered every markdown file in the program for the report's own vocabulary, then checked the working
tree diff and the lane journal for edits no document claimed.

**Report 7 — currency and decimal formatting.** No document in this program mentions currency,
decimals, the euro sign or the card renderer's value branch. The formatter already existed and four
surfaces already called it; the card renderer was the single number surface not wired to it. Now
`019-card-field-value-formatting`. It also crosses a written scope exclusion — see §7.4.

**Report 16 — the reorder button.** Landed under `004-checkbox-ownership`'s stylesheet lane hold,
and `004`'s acquire note names it. But `004`'s thirteen criteria all measure checkbox appearance and
ownership; **none measures column geometry**. `017/acceptance-criteria.md` independently disclaims
the two overlap checks as "not this phase's". Both neighbours were right, and nothing owned it. Now
`018-select-column-affordance-fit`. A lane hold is permission to edit a file, not a scope grant.

**A third gap, closed while this was being written.** `016-sheet-drag-and-audit` owned the
most-reported defect in the program and, at the start of this pass, had no `spec.md` and no
`acceptance-criteria.md` — three probes and nothing else. Both appeared before it finished. Recorded
because the sequence matters: for several hours the program's most-reported defect was being worked
with no specification, and the only reason that is not still true is that its agent got there first.

---

## 6A. OPERATOR DECISIONS ON RECORD

Four decisions were taken on 2026-08-30. Each closes a question, and each is recorded here because a
decision that lives only in a conversation gets relitigated by the next agent.

| Decision | What it settles | Where it binds |
|---|---|---|
| **Row height stays 34px.** Density outranks the 44px touch floor | WCAG 2.5.5's 44px target is not met by the table's main-item cell and **cannot be met from CSS** — measured 169×34, and a hit-area expansion is a no-op because the cell clips its overflow and the row below owns everything past the boundary. The only fix was a touch row-height floor, which is the reader's density setting | `012`'s first open question. Closed |
| **The grab band is accepted at 35px** against the 48px ask | 48px needs a taller sheet header, moving every sheet surface and every capture of it. The alternative, letting the band overlap the header, reintroduces the defect that phase had just fixed | `003/spec.md` "OPERATOR DECISION". Closed. §7.5 notes the recorded number is now disputed; the decision is not |
| **Row range-select moves behind a long press** | A tap on a row checkbox selected everything between it and the last row touched, on every touch device, because `isTouchDevice` was OR-ed into the range predicate — shift held down with no way to let go | `017`. The gesture is `attachLongPress`, the same object the row menu uses, so threshold, tolerance and haptic are shared rather than matched |
| **The list view is a presentation mode of the grid**, not a separate view | Scopes `specs/public/006-list-view-clickup/`, which is outside this program | Named here so this program does not re-open it |

**Two decisions are still open** and both are `016`'s: whether the phone row label moves from 13px to
14px to sit on the type scale, and whether the record sheet should survive a window resize instead of
closing — which decides whether report 4 is finished or blocked on the operator's handset.

**A third, opened 2026-09-01 by reading a capture: the month grid on a phone cannot carry event
titles, and no CSS change fixes that.** Measured at 402px: the day column is **45px**, the segment
**41px**, and after the timed dot and its padding the title gets **30px** — so **8 of 11 titles are
clipped**, several to three characters. `"Notion sync"` wants 62px and `"Q1 renewals sweep"` wants
100px.

*What was ruled out, with numbers, rather than argued.* The `+` day-add button is not the thief — it
sits in the day heading, not in the segment row, and it is the only tap path to create on a day, since
the alternative is `ondblclick` and a double-tap on a phone is the browser's zoom gesture. The time
prefix is not the thief either: `.db-calendar-month-time` already computes to `display: none` on a
phone. Wrapping the title to a second line is not a small change — the segment is `height: 20px` with
`line-height: 20px` and its lane is placed by `grid-row`, so the lane arithmetic assumes that height.
Dropping the dot recovers 7px and would rescue **2 of the 8**.

*So this is a presentation decision, not a repair, and it is the operator's.* The candidates are the
ones real calendars pick: dots only on a phone month grid (Apple), a taller week row that fits two
lines, or leaving the truncation as it is. **Nothing is changed here.** Vertical room is not the
constraint — the week rows measure ~145px with events occupying the top 40 — which is what makes the
taller-row option cheap and the horizontal ones impossible.

**The week grid is the same decision and it is worse, measured the same day.** At 402px a day column
is **37px**. A timed event that owns its column gets a 29px box and a **12px** title, against titles
wanting 32 to 42px — so **7 of 7 are clipped**, most to one character. And where events overlap, the
column is divided again: three events on one Friday give each an **11px** box and a **0px** title, so
**2 of the 7 render no text at all** — a bare coloured bar. That is not truncation, it is a surface
that shows nothing, and the capture is what surfaced it.

*The extra mechanism here is the overlap lane.* Seven day columns and a per-lane division cannot both
fit in 402px, so the same three candidates apply plus one this grid has on its own: **do not divide a
phone column into overlap lanes** — stack overlapping events and let the reader open the day — which
is again what Apple does and again a presentation choice, not a repair.

---

## 7. WHERE A PHASE'S OWN DOCUMENTS DISAGREE

Reported, not resolved. Each names what would settle it.

### 7.1 `004` — three sources, resolved

| Source | Says |
|---|---|
| Program `goal.md` | "171/171 own appearance, **0 borrow it** (was 10); all five families have fixtures" |
| `004/acceptance-criteria.md` | **AC-001 through AC-013 all "Unmet"**, evidence cells blank |
| Lane entry 63 (08:05 today) | "Unguarded ancestor-keyed appearance rules 1 → 0"; toggles losing a property outside the container "10/10 → 0/10"; the switch taken from 34×18 to 34×28 |
| Verifier (reported to this pass) | **FAIL** — 10 toggles still ancestor-owned; a hit target at 37×24 against a 28px floor; the board, gallery, table and list fixtures contain **zero checkboxes**, so those families are measured by nothing |

**Settled.** The gate was run from a quiet tree — `npm run gate` 16 green exit 0,
`verify-placement` exit 0, the two checkbox test files 13 passed exit 0 — and the four sources
resolve into two facts and one misreading.

**The lane entry is corroborated on both its numbers.** `appearanceOwnedByAncestor: 0` of 211
controls across 57 fixtures, and the switch reaches 34×28.

**The verifier is refuted on all three of its claims and is stale.** Zero toggles are
ancestor-owned, not ten. The reach is 34×28, not 37×24. And the fixtures are not empty: board-view
28 checkboxes, board-mobile 28, gallery-view 4, list-view 24, list-mobile 12, table-view 25,
table-mobile 13, chrome-table-footer 25. The fixture finding was the more serious half precisely
because a family with no checkbox is measured by nothing — and it is the half that turned out not
to be true.

**The "all Unmet" reading is not a contradiction.** Every "Measured today" cell in that document is
dated 2026-08-29 and describes the pre-fix tree. It is the failing baseline this packet requires and
nobody advanced it after the fix landed. Its evidence cells are also not blank: they carry the
literal word *"blank"* pointing at a provenance table, which is why a grep for adjacent pipes scored
this phase — the one with a real gap — at zero, while flagging five phases that had none.

### 7.2 `001` — 0% against a decision taken

`001`'s continuity reads `completion_pct: 0`, while its `recent_action` describes deleting
`src/views/surface.ts` today after nine measurements, keeping `surface-contract.ts`, and confirming
gate 13 green, vitest 434 passing and verify-placement 87/88 — all equal to the pre-change baseline.
A phase at 0% does not delete a module. The decision is sound and recorded in that phase's spec §13;
**the percentage is what is wrong.**

Consequence for the parent: `spec.md` still names `openSurface()` as `000`'s deliverable in two
places. It no longer exists.

### 7.3 `001` has two names

The folder is `001-overlay-placement-and-menu-language`. `tools/lane/css-lane.json` records its lane
holds as `001-overlay-width-and-chrome`, and the lane's own outstanding list attributes an unclaimed
stylesheet drift to that second name. One of the two is wrong and the lane cannot be reconciled
against the folder until it is settled.

### 7.4 `019` crosses a written scope exclusion

`spec.md` §2 excludes "output number format" as remaining on the earlier track. Report 7 changed
output number format inside this program. Either the exclusion means the *formula editor's* number
format and the parent spec should say so, or the work was out of scope and belongs elsewhere.
Recorded in `019/spec.md` §7.

### 7.4b "No lane activity" is not evidence of no work

This section graded a phase "not started, accurate" on the evidence that the CSS lane recorded
nothing for it. The lane was telling the truth and the conclusion was still wrong: that phase's
delivery was TypeScript, which the lane cannot see, and its one stylesheet edit rode another phase's
hold, which the lane records under the holder's name.

That is now three phases in this packet whose work was hidden by a lane hold, and one whose work the
lane could not have seen at all. **The lane journal is evidence of stylesheet custody, not of
whether a phase has started.** Establishing that needs `git log -S` against the phase's named
symbols and files, and a read of the tree.

The failure mode is worth naming precisely, because it is the documentary twin of the one this
packet was opened to fix: a method that produces a confident wrong answer is worse than one that
produces no answer, and it is harder to notice because the answer looks like a finding.

### 7.5 The grab band has four recorded heights

| Source | Height |
|---|---|
| `003/spec.md`, the operator decision | 35px |
| Lane entry 47 | "widened to the header at **48px**" |
| The lane's outstanding list | **35px** record sheet, **41px** owned-menu sheet |
| `016`, measured on the shipped build | **32px**, full width at 386 of 390 |

`016` is the only one of the four that measured the shipped build rather than describing an
intention, and it derives 32 from the stylesheet's own arithmetic: `--db-space-6`(16) + 8 + 4 + 4.
The likely sequence is `003` setting 48px, `012` later stopping the band at its own header, and
nobody re-reading the result. **The operator's decision does not depend on which number is right:**
all four clear WCAG 2.5.8's 24px AA target and fall short of 2.5.5's 44px, which is exactly the
trade-off that was accepted. What needs correcting is the record, not the band.

### 7.6 Eight phases say "not started" after shipping

`000`, `001`, `002`, `003`, `004`, `005`, `010` and `013` all carry `completion_pct: 0` with a
`recent_action` of "Phase cut… not started" or similar, while the lane journal records their edits
and the working tree contains them. The continuity blocks were written at phase-cut time and never
advanced. This is the same defect as the old §5 status table, one level down.

### 7.7 Seven sheet surfaces, or nine

Lane entry 47 and `003/spec.md` both say the single overlay fill covers "all **seven** sheet
surfaces". `016` measured **nine** sheet-capable surfaces, all at the identical fill. Either two were
added since the count was written or two were never counted. Low stakes — every surface measured
matches — but the census number is quoted in three documents and only one of them counted.

---

## 8. EXECUTION ORDER — DECLARED, AND AS RUN

**Declared:** `009 → 000 → 004 → 005 → 001 → 002 → 003 → 006 → 008`, with `007` off-path.

**As run:** `000` (partial) → `004` → `005` → `002` → `001` → `003` → `010` → `003` → `013` → `014`
→ `012` → `004` → `005` → `020` → `021`, read from the lane journal's acquire order, with `009`
never gating a handoff and `006` never started.

**Not in this order at all:** `022`, `023`, `025` and `026` have never acquired the lane — no
code yet, for any of them. `024` shipped a real, measured fix without ever acquiring it either:
its edit is TypeScript only, in `src/views/list-renderer.ts`, and `styles.css` is untouched. A
lane-journal reading of "as run" is therefore a partial order, not a full one — it says nothing
about a phase whose work never touches the stylesheet. `027` and `028` postdate this reading
entirely: neither had a folder on disk when this pass gathered its evidence.

The declared order was an argument about circularity: `000` repairs the harness and would otherwise
measure its own work through it, so `009` — the running app — had to come first. **That argument was
never tested, because `009` did not run first.** Phases 010 through 017 were then cut in the order
the operator reported them, which is a different scheduling principle entirely and was never written
down.

Two readings, and this file does not choose: either the declared order was wrong and report-driven
scheduling is what this program actually does, or it was right and the program has been accruing the
exact risk it was designed to avoid. **What settles it:** whether `016`'s live drag probe finds a
defect the harness could have caught. That is the circularity argument's test case, arriving by
accident.

---

<!-- ANCHOR:milestones-targets -->
## 9. MILESTONES & TARGETS

**Report 1 closed, the drag working on device:** phase Now, target: the operator drags a sheet down
after editing a field. Status: **Mechanism fixed and measured; awaiting the device.** Evidence:
`016/acceptance-criteria.md` — 60px drag moves 60.0px both fresh and after a re-render, against
0.0px after a re-render before. This is the program's oldest defect and the only one re-reported
three times; the check that would have caught it did not exist until now.

**One green gate:** phase Next, target: after the next recapture. Status: Blocked. Evidence: the gate
exits 1 at 12/13 on `screenshots-fresh`; `014` released the lane without recapturing and `004` holds
it now.

**Every orphan owned:** phase Now, target: complete. Status: **Done** — `018` and `019` created
today. Evidence: §6.

**Two operator decisions on the sheet:** phase Now. Status: Open. Evidence: `016` §2 — the phone row
label measures 13px against a 12/14/16/18/20/24 scale, and the record sheet closes outright on a
window resize, which is how one of the two software-keyboard signals arrives.

**A known-inert declaration block left unfixed on purpose:** phase Later. Status: Deferred with a
reason. Evidence: `016` §2 — `placeSheet` writes five camelCase declarations that Obsidian's
`setCssProps` discards, and correcting the names would activate `overscroll-behavior: contain` for
the first time on every sheet, which needs a recapture.

**Twenty-four operator confirmations:** phase Later, target: the operator installs 1.3.3 and
reports per surface. Status: 1 of 24, and that one is an accepted shortfall. Evidence: §4.

**Program closed:** phase Later. Status: Blocked on all of the above plus `008`'s release gate.
Evidence: `spec.md` §7.
<!-- /ANCHOR:milestones-targets -->

---

<!-- ANCHOR:dependencies -->
## 10. DEPENDENCIES

**The `styles.css` lane:** needed by every phase that paints. Owner: `004-checkbox-ownership`,
acquired 2026-08-30T07:57:53Z. Status: Blocked for everyone else. Risk: it is 19,261 lines, must not
be split, and all 196+ captures fingerprint it. Mitigation: `tools/lane/check-lane.mjs` makes the
lane a check rather than an agreement, and it caught an unclaimed drift on 2026-08-30 (lane entry
42).

**A recapture:** needed by the gate. Owner: whoever holds the lane next. Status: Open. Risk: two
phases owe one and each is waiting for the other's edits to settle. Mitigation: one recapture covers
both, which is why the debt was deferred deliberately rather than forgotten.

**The operator:** needed by every milestone in §9. Status: Open. Risk: fourteen reports are shipped
and unconfirmed, so a regression in any of them would be found by the operator rather than by a
check. Mitigation: 1.3.3 is built and installed.

**Two open operator decisions:** `006`'s open target (side panel, full-page modal, or both behind a
setting) and `017`'s status-bar announcement. Status: Open. Neither blocks other work.

**Four concurrent agents:** owner: the operator. Status: Active. Risk: `004`, `005`, `016` and `017`
are all mid-flight, and §7.1 exists because two of them measured the same thing differently.
Mitigation: the lane, plus reading a phase's state rather than inheriting it.
<!-- /ANCHOR:dependencies -->

---

## 11. THE SERIALIZED CSS LANE

`styles.css` is 19,261 lines, must not be split, and every capture fingerprints it.

**Exactly one phase holds the file at a time.** A phase releases the lane only after a full
recapture **and a human looking at the changed PNGs** — `screenshots:verify` proves a capture was
regenerated, never that it looks right. `008` then re-runs the earlier phases' evidence, because a
later edit can reverse an earlier result with no compiler warning and 87 selectors in this file
already do exactly that.

The lane journal is now the most reliable record in this program. It caught what the continuity
blocks missed, and §4 and §5 are built on it.

---

## 12. THE TRAPS THAT OUTRANK THE REST

**A CI check that asserts the defect.** Written during the previous attempt: it requires a widthless
caller to render wider than 320px, and it runs on every push. Fixing `001`'s width policy turns CI
red. `000` inverts it before `001` starts.

**A check that has never failed has never been tested.** Report 1 is the standing proof: three fixes,
three re-reports, and every check on the drag was a string match against source.

**A rule's scope is not its name.** A touch-floor block decided `display` and put a phone-only
control on the desktop (`018`). A `:not(shared-checkbox)` guard took placement with appearance
(`014`). Both passed every check.

**A derived number written in a comment goes stale silently.** `48 = button 24 + checkbox 16 + gap 8`
was true when written, and nothing recomputed it when both controls grew to 28px.

**A fixture with none of the thing in it measures nothing.** See §7.1.
