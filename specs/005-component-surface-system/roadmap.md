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

**Subject:** Note Database plugin, `specs/005-component-surface-system/`
**Status:** Active
**Horizon:** Open. The program closes on operator confirmation, not on a date.
**Owner:** Operator, with several agents holding phase folders concurrently — the four
flagged live in §5 this morning, plus `027` and `028`, opened today to investigate the reports
below.
**Last updated:** 2026-09-05

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

**Third reconciliation note, 2026-09-02.** §4 grew to thirty-two rows, 1.4.0 and 1.4.1 were
published, and report 29 was fixed and partially confirmed. §1, §3, §4, §4A, §5.2, §5.3 and §9 are
what this pass changed. §5, §5.0, §5.1, §6, §6A, §7, §8, §10, §11 and §12 were not re-audited and
carry their own dates.

**Fourth reconciliation note, 2026-09-04.** `037` and `038`'s port rows closed their in-repo
comparison halves (row 38's AC-007 read and T12's own row, per §5.2) and release **0.0.20** cut,
carrying both packets' residual work plus `043`'s constructed fixture families. A new never-tick
row (39) was added for a fresh operator ruling the AC-007 read surfaced — keep the reference-faithful
milestone/month-band label overpaint or reinstate a local fix. §4, §5.2 and §5.3 are what this pass
changed; the rest were not re-audited and carry their own dates.

**Fifth reconciliation note, 2026-09-04, later the same day.** Rows 30-36's status cells still read
"release 1.4.2/1.4.3 pending" from before the operator's version-scheme reset (§5.3): 1.4.2 (rows
30-33, `00e2aa2`) is now 0.0.7 and 1.4.3 (rows 34-36, `85ff504`) is now 0.0.8, and every release since
— through 0.0.20 (`ccc946c3`) — carries both fixes, installed to the iCloud vault. Rows 30-36 were
trued up to say so; row 29's 1.4.1 mention got the same `(now 0.0.6)` gloss for consistency. None of
the seven rows changed open/confirmed state — they stay open, not operator-confirmed, exactly as
before. Only §4 changed; the rest carry their own dates.

**Sixth reconciliation note, 2026-09-04.** On the operator's instruction, every capture under
`screenshots/` moved from `screenshots/<group>/` to `screenshots/notion-clone/<group>/` — a pure
`git mv` across all 528 entries, zero pixel or hash change, verified by re-running
`screenshots:verify` and the full gate against the moved tree. A second root,
`screenshots/project-manager/`, is reserved beside it for `037`'s Project Manager reference
captures, landing separately. Every `screenshots/...` path cited anywhere in this program's specs
before this date predates the move and resolves by prefixing `notion-clone/` after `screenshots/`;
this note is the only rewrite, no historical path citation was edited. Only this note changed;
the rest of the file carries its own dates.

**Seventh reconciliation note, 2026-09-05.** The split landed: `worktrees/042-screenshots-folders`
rebased onto `origin/main` at release 0.0.21 (`5af7eef7`), landing as `7d95a882`+`aa049b45` and
reconciled with main as `933308a5`. Both roots now exist on main exactly as the sixth note
predicted — `screenshots/notion-clone/<group>/` (534 PNGs, this program's own fixtures and
constructed renders) and `screenshots/project-manager/` (16 PNGs, `037`'s reference captures,
landed separately as `295401ad`/`04814e24` and left untouched by this reconciliation). Every one
of the 550 final entries was verified byte-identical to `origin/main`'s prior blob for that path —
this landing moved paths, not pixels. §4 rows 37 and 38 were updated to say both legs landed; only
those two cells and this note changed here.

**Eighth reconciliation note, 2026-09-05.** ADR-001 in `046-linked-views-notion-parity` was decided
by the operator, verbatim: *"Allow db writing from linked views"* — Accepted, full parity, undo
through the plugin's existing history stack, read-only only when the source is missing or
unresolved. The capability leg (T006) is now running on `worktrees/054-linked-views` (external
lane: devin first, Grok fallback). §4 row 42 and §5.A's `046` row were updated to record the
ruling; a note was also added to §4 recording `045`'s two still-open operator questions (gallery
sharing, hide-in-table) as unanswered. Only those cells and this note changed here.

**Ninth reconciliation note, 2026-09-05.** The operator's device check of **0.0.22** landed and it
is a deferral, not a pass: *"some still broken, all buttons like add sort, add filter still broken"*
and *"pressing any action in a sheet doesn't work and instantly closes it"*. Twelve §4 rows (29-36,
39-41, 43) are now **DEFERRED** with one named blocker — tap inside an open sheet dismisses it on
iOS, fix in progress on `worktrees/056-sheet-inside-tap` under `031` — and are re-asked after the
next iCloud build. Rows 37 and 38 moved the other way: *"align closer"*, plus reference captures of
Anytype and AppFlowy from both official product images and locally installed apps. Two new packets
were opened for the day's rulings — `specs/007-gallery-view-deprecation` (a top-level sibling; the
operator retired the gallery outright, *"should have been deprecated"*) and
`047-competitor-references-and-pm-alignment` (the rows 37/38 fidelity pass plus the competitor
captures). `045`'s two open operator questions were answered as ADR-001 and ADR-002. §1, §4, §5.A,
§6A, `goal.md`'s DONE table and `goal-prompt.md` are what this pass changed; everything else carries
its own date.

**Tenth reconciliation note, 2026-09-05.** `0.0.23` is cut (`d3979cf5`) and carries every lane named
above as landed: the sheet-inside-tap fix (`3a77d523`/`308ba2d3`) the twelve-row deferral was
waiting on, the list renderer's full retirement (`6f2aef3f`, its stylesheet rules dropped in
`44e08bfb`), the board/timeline bench's frozen clock (`6bac9ce9`), the settings sheet's own body
grammar (`4f090d2e`, closing `044`'s and `045`'s AC-005), and the board card properties capture and
grammar proof (`c0abb6ff`/`ba2b37f7`/`f240e8fa`). `006-list-view-deprecation`'s children `005`
through `007` are done; `008-docs-and-release` has its release row satisfied by this cut, and only
its operator row is open. ADR-001 and ADR-002 for `046-linked-views-notion-parity` were also
Accepted this pass (`decision-record.md`) and its capability leg landed partially on main
(`ec893e67`): AC-003 and AC-006 are `Met`, AC-001/002/004/005 stay `Unmet` behind `T002`'s
unanswered host-layout question, and `T016` (ship the write behind a settings flag) is a fresh
operator call. §1, §4, §5.3, §5.A and `goal.md`'s DONE table are what this pass changed;
`operator-checklist.md` was regenerated (**109 rows across 48 phases**, up from 103/47, `047` now
included) and `handover.md` was rewritten as `orchestrate-handover-18`.

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

**The program's closing condition is the third** (`spec.md` §7). Of the thirty-two reports below,
**one** has reached it, and it reached it as an accepted shortfall rather than a fix. Report 29 has
reached a partial, which under the table above is not a state.

**One further caveat that applies to every row.** Re-derived rather than carried, 2026-09-02:
`HEAD` is at `00e2aa2`, `manifest.json` and `package.json` still declare **1.4.1** pending the
1.4.2 cut, and `git status --porcelain` carries only an untracked `036/research/` that is residue
from a rejected launch. The code phase for reports 30 to 33 landed in `00e2aa2` and is committed,
not shipped as a release — the two must not be read as one until 1.4.2 is cut and installed. This
sentence previously read `e13c7b8` / 1.4.1 / dirty, and before that `4228370` / 1.3.9 / clean, and
before that `4830275` / 1.3.1 / 1.3.3. A version number in prose is a number nothing recomputes, so
read it off the tree before believing it.

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
d=specs/005-component-surface-system/<phase>
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

*2026-09-02: the paragraph above is superseded and kept as the record of the basis that was tried.*
The parent took the checklist basis after all, so its figure is derived the same way every phase's
is. `goal.md` §3 now holds seven rows with four ticked, rows 3, 4, 6 and 7, so the parent reads
**57**. It read 43 earlier the same day at three ticked, and 50 on the reports basis before that.
`spec.md` and `handover.md` still carry the older number and are owed the same edit.

**Where a phase has no such checklist, the figure is UNKNOWN**, and the phase says so rather than
carrying a judged number. That is the state of `000`-`006`, `008` and `009`: their `goal.md` files
predate the checklist form, and their `acceptance-criteria.md` tables still hold the pre-fix baseline
this program requires them to record, so counting *Met* there measures 2026-08-29 rather than today.
One operation settles each — give it the same `goal.md` criteria checklist every phase from `010` on
already has — and it is that phase's own work, not this board's.

---

## 4. OPERATOR REPORT TRACEABILITY

**Forty-seven reports** (1-16, 18-51), forty-seven resolved to a named phase; rows 47-51 were added 2026-09-05 from the operator's **desktop** check of 0.0.23, the first desktop pass in this list. **Rows 47 and 50 — the toolbar's split button and the filter popover's truncation — are the chrome pair, owned by `015-desktop-dropdown-placement`, fixed in-repo and awaiting the operator's own look.** **Rows 48, 49 and 51 are the board defects from the same pass**: 49 (card properties) is owned by `045-board-card-properties`, 48 (record panel placement) and 51 (board above the calendar) by `038-board-kanban-port`, all three root-caused and fixed the same day and awaiting the 0.0.25 cut; rows 44-46 were added 2026-09-05 07:02 CEST from the operator's iPhone check of **0.0.23** — three stacked-sheet reports, all owned by `048-stacked-sheets`, opened today; rows 40-43 were added 2026-09-04 from the operator's evening pass — three phone-sheet asks owned by `044-phone-sheet-alignment` and the linked-views ask owned by `046-linked-views-notion-parity`; rows 34-36 shipped a
fix in 0.0.8 (formerly 1.4.3) and every release since, latest 0.0.20, installed to the iCloud
vault, but the operator now reports the same symptoms still reproduce on 0.0.20 — reopened, see
below. A seventeenth — refactoring the list view to
look like ClickUp — was its own packet and does not occupy a row here; the table below runs 1-16
then 18-36 because of it. **That packet is now a deprecation.** On 2026-09-04 the operator said
*"Also deprecate list view completely"*, and `specs/006-list-view-deprecation/` was converted from
the ClickUp direction into a phased list-view retirement. The ClickUp children are kept as
superseded history rather than deleted.
*2026-09-02: row 29 added, the first device evidence since 1.3.1, raising the count from
twenty-seven to twenty-eight; rows 30 to 33 added later the same day from the operator's iOS pass,
raising it to thirty-two. 2026-09-03 ~06:40 CEST: rows 34-36 added from the iOS operator on 1.4.2 —
the sort sheet's add-sort control, the filter sheet's Add condition, and the class both belong to
(controls inside a sheet that mutate the sheet's own content close or crash it) — raising the count
to thirty-five, owner 031. 2026-09-03 ~07:10 CEST: rows 34-36 fixed in `85ff504` — the overlay
stack's outside-pointerdown check held a stale panel reference across an in-panel rebuild; a
`getPanel()` resolver fixes it — shipped in 0.0.8 (formerly 1.4.3) and every release since,
latest 0.0.20 installed to the iCloud vault; not operator-confirmed. 2026-09-04: row
37 added, raising the count to thirty-six — not an operator report but the operator-only half of
`038-board-kanban-port`'s T12 criterion, split out because the vendored reference carries no
image files an in-repo session could compare against. Same day, row 38 added, raising the count
to thirty-seven — the equivalent operator-only half of `037-timeline-gantt-port`'s AC-007
criterion, the same vendored-reference-has-no-images problem, split out the same way. 2026-09-04
(later the same day): row 38's in-repo half closed — a fresh reviewer (`30c4b746`) confirmed AC-007
MET in-repo, zero divergence across 60/60 `pm-gantt-*` classes; row 38 itself is unaffected, since
it names only the operator's own vault compare. Row 39 added, raising the count to thirty-eight —
not an operator report either, but a fresh operator-only ruling that ask surfaced: whether to keep
the reference-faithful milestone-label/month-band overpaint on the gantt's default render path or
reinstate a local anti-collision fix, `037-timeline-gantt-port` `tasks.md` T050. 2026-09-04
~17:30 CEST, operator answers: rows 34-36 reopened — the operator reports add filter / add sort
still break or freeze the app on mobile on 0.0.20; fix leg on `worktrees/036-sheet-freeze` (owner
031). Rows 37 and 38 redirected in-repo — capture Project Manager's own board and gantt views into
`screenshots/` so the comparison is done in-repo; leg on `worktrees/037-reference-captures`
(harness, 043). Row 39 decided — reinstate the local fix that raises crowded milestone labels on
the default gantt render path, as an amendment to REQ-007; leg on `worktrees/038-milestone-labels`
(037). 2026-09-05: rows 47-51 added from five fresh desktop reports, screenshots under
`scratch/device-2026-09-05/` — the toolbar's "+" split button, a clipped board-card record peek, a
board card missing enabled properties, a truncated filter popover, and the board persisting over
the calendar after a view switch. Not yet phased; two debug leaves
(`worktrees/063-desktop-board-bugs`, `worktrees/064-desktop-chrome-bugs`) are diagnosing root cause
and will amend these rows once found.*

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
| 29 | *"In this version a lot of sheets are bugged, drag handler dont work or no way to close or they pop up and than dissapear and than freeze app"* | `031-sheet-lifecycle-ownership` | **Shipped in 0.0.23 (`d3979cf5`), the release carrying the 2026-09-05 deferral's named blocker fix (`3a77d523`/`308ba2d3`) — tap inside an open sheet no longer dismisses it. STILL DEFERRED even so, and the blocker it named is gone:** the operator used that build and confirmed the fix — *"Buttons work now"* — so the reason recorded earlier on 2026-09-05 no longer holds, and the row stays deferred only because the 0.0.23 pass did not exercise it and its subject is not a sheet action: it names the drag handle, the missing close, and the appear-disappear-freeze shape — three lifecycle symptoms, none of them a control inside a sheet. Re-asked on the next device pass. Prior state, unchanged and still true: **Fixed and released in 1.4.1 (now 0.0.6); partially confirmed, open.** | **Fixed in `98da630`** (a modal's sheet chrome taken down on close, `pointercancel` honoured, anchor tolerance widened) **and `0c92f4d`** (a long press consumes the compatibility click it caused), both released as **1.4.1** (now **0.0.6**) in `460d4d7`. The operator, on that build: *"Most sheets seem to work now tho"*. That is real device evidence and it is a partial, not a close: per-row confirmation, sheet by sheet against the three named failure shapes, is still owed. Original report received 2026-09-02 against **1.4.0** — the first device evidence this program has had since 1.3.1. Three symptoms in one report: the drag handle does nothing, some sheets have no way to close, and one sheet appears, disappears immediately, then freezes the app. OS and which sheets: unknown, asked. **Severity: release-blocking (P0)** |

*2026-09-02, same session: **"Most sheets seem to work now tho"** — the operator's own words, reported on the build after `98da630`/`0c92f4d` (the modal-sheet-chrome-on-close and cancelled-gesture fixes). Recorded here as **partially confirmed on device**: sheets open and close on that build, which is real device evidence and is more than row 29 had. It is not a close — shipped, verified and operator-confirmed are three states, and the full discriminating sequence report 16's device-pass row asks for (drag *after* editing a field, each of the three named failure shapes, tried in turn) is still owed. Row 29 stays open.*

**Reports 21-24 and report 27 are probably one defect with two owners.** 21, 22 and 23 are the sort
and filter sheets bugging out and freezing on open or close; 24 is the column-setting sheet not
responding. All three surfaces are panel families that `031` identifies as leaving a scrim behind,
and column-manager is one of the two it identifies as leaving the sheet itself. They still route to
`028` and `027` because that is where they were filed when the symptom looked like a render cost.

Not re-routed yet, deliberately: re-routing four reports on a mechanism that is diagnosed but not
yet fixed would be filing them where I expect the answer to be rather than where it is shown to be.
When `031` T1's parity check runs, it will say which of these surfaces leak — and that measurement,
not this note, is what should move them.

| 30 | The "All views" bottom sheet renders five action icons per row (rename, duplicate, reorder, delete, icon) on a 393px phone; titles truncate (*"Calendar vi…"*) and each row is a wall of glyphs. Expected on a phone: one overflow control per row | `001-overlay-placement-and-menu-language` | **Shipped in 0.0.23 (`d3979cf5`), the release carrying the 2026-09-05 deferral's named blocker fix (`3a77d523`/`308ba2d3`) — tap inside an open sheet no longer dismisses it. STILL DEFERRED even so, and the blocker it named is gone:** the operator used that build and confirmed the fix — *"Buttons work now"* — so the reason recorded earlier on 2026-09-05 no longer holds, and the row stays deferred only because the 0.0.23 pass did not exercise it and its subject is not a sheet action: it names the All-views sheet's five action icons per row and its truncated titles, which is menu language and row density. Re-asked on the next device pass. Prior state, unchanged and still true: **Fixed in `00e2aa2`; shipped in 0.0.7 (formerly 1.4.2) and every release since, latest 0.0.20 installed to the iCloud vault; NOT operator-confirmed; open until the operator confirms or defers.** | Operator report, iOS, 2026-09-02 21:21. Screenshot: `scratch/device-2026-09-02/view-switcher-sheet-ios.png`. **Owner picked by scope, not by symptom:** `showAllViewsHub`/`renderInlineViewAction` (`toolbar-renderer.ts:1037-1111`) hand-build a bare-button row per action rather than calling `createMenuRow` — one of the exact "8 `render*Row` methods and 14 row-class grammars in `toolbar-renderer.ts`" `001/spec.md` §3 already names in scope for retirement onto the shared factory. `027`'s inventory covers rows already built through `createMenuRow`/`db-menu-item` (motion, z-index, overflow-x); this row carries neither class, so it is a menu-language gap, not a sheet-chrome one. **2026-09-02, `00e2aa2`:** one action list is now spent as five icons on desktop and as one trailing control opening an owned menu on touch. Red: 5 controls per row on 8 rows, shortest row 30px, menu 0 rows. Green: 1 per row, 44px floor, 5 menu rows, desktop unchanged at 5 icons. Title truncation is not reproduced on the bench, which places the "All views" hub as a popover where the device gives a sheet; the hub is an unregistered surface with no scenario, recorded as an adjacent finding, not a tick |
| 31 | The selection status bar (*"× Esc · 1 cells selected · Copy TSV · Copy Markdown"*) stays docked while a bottom sheet is open, sits over/under the floating "+" add button, and when a numeric cell is edited the inline editor lands on top of the bar, clipping "1 cells selected" and stacking a second action row (Copy CSV · Paste · Income · Clear · Undo) above the keyboard | `022-selection-bar-keyboard-docking` | **Shipped in 0.0.23 (`d3979cf5`), the release carrying the 2026-09-05 deferral's named blocker fix (`3a77d523`/`308ba2d3`) — tap inside an open sheet no longer dismisses it. STILL DEFERRED even so, and the blocker it named is gone:** the operator used that build and confirmed the fix — *"Buttons work now"* — so the reason recorded earlier on 2026-09-05 no longer holds, and the row stays deferred only because the 0.0.23 pass did not exercise it and its subject is not a sheet action: it names the selection bar staying docked under an open sheet and the inline editor landing on it — an arbitration between three surfaces for the bottom edge. Re-asked on the next device pass. Prior state, unchanged and still true: **Fixed in `00e2aa2`; shipped in 0.0.7 (formerly 1.4.2) and every release since, latest 0.0.20 installed to the iCloud vault; NOT operator-confirmed; open until the operator confirms or defers.** | Operator report, iOS, 2026-09-02 21:21. Screenshot: `scratch/device-2026-09-02/cell-editor-over-selection-bar-ios.png`. One docking owner is missing among sheet, bar, editor and floating button. **2026-09-02, `00e2aa2`:** a named claim set toggles `db-bottom-dock-taken`; sheets claim at mount and release at unmount or on the removal watcher, the inline cell editor claims while it is open, and the bar and the mobile add control yield to either. Red: bar 35084px² inside an open sheet, editor∩bar 7666px², add-control∩bar 2704px². Green: 0px² on all three, and the bar is restored when the sheet closes. Adjacent, not ticked: the cell-editor dock claim has no removal fallback (`cell-renderer.ts` releases only in `close()`), and `db-bottom-dock-taken` is a body class rather than phone-scoped, so a tablet split pane could in principle hide the other pane's bar — both inferred from the source, not observed |
| 32 | *"1 cells selected"* has no singular form | `022-selection-bar-keyboard-docking` | **Shipped in 0.0.23 (`d3979cf5`), the release carrying the 2026-09-05 deferral's named blocker fix (`3a77d523`/`308ba2d3`) — tap inside an open sheet no longer dismisses it. STILL DEFERRED even so, and the blocker it named is gone:** the operator used that build and confirmed the fix — *"Buttons work now"* — so the reason recorded earlier on 2026-09-05 no longer holds, and the row stays deferred only because the 0.0.23 pass did not exercise it and its subject is not a sheet action: it names a missing singular form in `src/i18n.ts:287`, which no sheet fix can reach. Re-asked on the next device pass. Prior state, unchanged and still true: **Fixed in `00e2aa2`; shipped in 0.0.7 (formerly 1.4.2) and every release since, latest 0.0.20 installed to the iCloud vault; NOT operator-confirmed; open until the operator confirms or defers.** | Operator report, iOS, 2026-09-02 21:21, bundled with row 31. `src/i18n.ts:287` — `"toolbar.selectedCells": "{count} cells selected"` — is interpolated at every count, including 1. **2026-09-02, `00e2aa2`:** `src/i18n-plural.test.ts` observed red — `TypeError: tSelectedCells is not a function` (3 failed) — then green with a singular form added. Chinese locales deliberately do not inflect |
| 33 | *"Open details sheet is buggy when overflow is present (content doesnt fit 100vh)"* | `010-sheet-reading-and-keyboard` | **Shipped in 0.0.23 (`d3979cf5`), the release carrying the 2026-09-05 deferral's named blocker fix (`3a77d523`/`308ba2d3`) — tap inside an open sheet no longer dismisses it. STILL DEFERRED even so, and the blocker it named is gone:** the operator used that build and confirmed the fix — *"Buttons work now"* — so the reason recorded earlier on 2026-09-05 no longer holds, and the row stays deferred only because the 0.0.23 pass did not exercise it and its subject is not a sheet action: it names the record sheet overflowing 100vh — scrolling and reachable chrome. Re-asked on the next device pass. Prior state, unchanged and still true: **Fixed in `00e2aa2`; shipped in 0.0.7 (formerly 1.4.2) and every release since, latest 0.0.20 installed to the iCloud vault; NOT operator-confirmed; open until the operator confirms or defers.** | Operator report, iOS, 2026-09-02 21:24. No screenshot yet. Meaning: the record detail bottom sheet, when its properties and note body exceed the viewport height, does not behave — content does not fit 100vh and the sheet presumably neither scrolls inside its own box nor keeps its handle reachable. **Owner picked by scope, not by feature-readiness:** `010/spec.md`'s own title is "Sheet Reading Rhythm and Keyboard Avoidance" and it already owns the phone record sheet's reading layout and scroll behaviour; `023-record-note-body` owns rendering the note body itself but is "deliberately not startable" per `roadmap.md` §5 — the operator has not chosen display-only vs editable, and no note-body code has shipped, so an overflow bug on the sheet as it exists today cannot be `023`'s to hold. **2026-09-02, `00e2aa2`:** the sheet lost its chrome, not its scroll — the grab bar and header were children of the scrolling panel, so a record taller than the 90svh cap carried both off the top. Red: handle -1148px from the sheet's top, `db-record-detail-panel` owned the scroll, reachable=false. Green: properties and body sit in a `.db-record-detail-scroll` region, the panel is a flex column, 1173px of overflow, handle 25px from the top, reachable=true. Both halves load-bearing: `record-detail-panel.ts`'s wrapper and `styles.css`'s flex column with `overflow-y hidden !important` against `popover-position.ts`'s inline `auto`. Adjacent: `styles.css` now carries two adjacent `.db-record-detail-panel.db-mobile-bottom-sheet` blocks (design-conformance duplicate counter 125→126) |
| 34 | *"add sort button is broken in sort sheet"* | `031` | **OPERATOR-CONFIRMED 2026-09-05 on 0.0.23** — the operator's words: *"Buttons work now"*. This row's subject IS a control inside a sheet, which is precisely what the tap-inside-sheet fix (`3a77d523`, `308ba2d3`, shipped in 0.0.23 `d3979cf5`) addressed, so the deferral is discharged and the row CLOSES under D3. Prior state, now superseded: **Reopened 2026-09-04 (operator: still reproduces on 0.0.20). The entrance fix has LANDED on main — `c96467c9`, reconciled `4c6b2c78`, recorded `ec24f9a`. It was `fb44a302` in the worktree and that id is **not** an ancestor of main, so this row previously quoted a commit that never landed here; reproduced red-first by four phone-touch cases in the `sheet-rebuild` lane. **The row does not close on it**, because a WebKit follow-up on `branches/001-sheet-webkit` found a SECOND bug in the same class: a toolbar rebuild behind an open sheet drops the sheet. Landed `9ecb5fff` on main (reconciling `9f31bf6f` dead-anchor drop fix, `8140a1ae` retained-node rebuild, `efb5b54f` pointerdown-only dismissal, `c12817a8` `debugSheetTrace`; re-trued at `45a1750d`); shipped in 0.0.21 (`5af7eef7`), released and installed to the iCloud vault; operator to enable "Trace sheet lifecycle", reproduce, then run "Copy sheet trace" and paste it back if it still fails; NOT operator-confirmed; open** | Overlay stack held the sort panel's node captured at register() time; the first in-panel rebuild (add-sort) left it stale, so the next tap read as an outside press and closed the sheet mid-edit. `OverlaySurfaceOptions.getPanel()` now re-resolves the live node on every dismissal check. Red observed in `sheet-rebuild.mjs` with `overlay-stack.ts` reverted; green after. Shipped 0.0.8 onward, latest 0.0.20; not device-confirmed |
| 35 | *"filter add condition closes / crashes it"*, then *"filter table sheet"* | `031` | **OPERATOR-CONFIRMED 2026-09-05 on 0.0.23** — the operator's words: *"Buttons work now"*. This row's subject IS a control inside a sheet, which is precisely what the tap-inside-sheet fix (`3a77d523`, `308ba2d3`, shipped in 0.0.23 `d3979cf5`) addressed, so the deferral is discharged and the row CLOSES under D3. Prior state, now superseded: **Reopened 2026-09-04 (operator: still reproduces on 0.0.20). The entrance fix has LANDED on main — `c96467c9`, reconciled `4c6b2c78`, recorded `ec24f9a`. It was `fb44a302` in the worktree and that id is **not** an ancestor of main, so this row previously quoted a commit that never landed here; reproduced red-first by four phone-touch cases in the `sheet-rebuild` lane. **The row does not close on it**, because a WebKit follow-up on `branches/001-sheet-webkit` found a SECOND bug in the same class: a toolbar rebuild behind an open sheet drops the sheet. Landed `9ecb5fff` on main (reconciling `9f31bf6f` dead-anchor drop fix, `8140a1ae` retained-node rebuild, `efb5b54f` pointerdown-only dismissal, `c12817a8` `debugSheetTrace`; re-trued at `45a1750d`); shipped in 0.0.21 (`5af7eef7`), released and installed to the iCloud vault; operator to enable "Trace sheet lifecycle", reproduce, then run "Copy sheet trace" and paste it back if it still fails; NOT operator-confirmed; open** | Same mechanism as row 34, on the filter panel: Add condition rebuilds the panel node, the overlay stack's captured reference went stale, and the next tap dismissed the sheet. Same `getPanel()` fix. Red observed in `sheet-rebuild.mjs` for the filter case; green after. Shipped 0.0.8 onward, latest 0.0.20; not device-confirmed |
| 36 | *"a lot of sheets have that"* — a named class, not a single symptom | `031` | **OPERATOR-CONFIRMED 2026-09-05 on 0.0.23** — the operator's words: *"Buttons work now"*. This row's subject IS a control inside a sheet, which is precisely what the tap-inside-sheet fix (`3a77d523`, `308ba2d3`, shipped in 0.0.23 `d3979cf5`) addressed, so the deferral is discharged and the row CLOSES under D3. Prior state, now superseded: **Reopened 2026-09-04 (operator: still reproduces on 0.0.20). The entrance fix has LANDED on main — `c96467c9`, reconciled `4c6b2c78`, recorded `ec24f9a`. It was `fb44a302` in the worktree and that id is **not** an ancestor of main, so this row previously quoted a commit that never landed here; reproduced red-first by four phone-touch cases in the `sheet-rebuild` lane. **The row does not close on it**, because a WebKit follow-up on `branches/001-sheet-webkit` found a SECOND bug in the same class: a toolbar rebuild behind an open sheet drops the sheet. Landed `9ecb5fff` on main (reconciling `9f31bf6f` dead-anchor drop fix, `8140a1ae` retained-node rebuild, `efb5b54f` pointerdown-only dismissal, `c12817a8` `debugSheetTrace`; re-trued at `45a1750d`); shipped in 0.0.21 (`5af7eef7`), released and installed to the iCloud vault; operator to enable "Trace sheet lifecycle", reproduce, then run "Copy sheet trace" and paste it back if it still fails; NOT operator-confirmed; open** | The named class is the same seam as rows 34-35 plus a second half on the embedded surface: `database-view.ts` and `embedded-database-renderer.ts` used a container-scoped `querySelector` for sort/filter/view-config/column-manager panels, which never matched once `mobile-bottom-sheet.ts` portals the sheet onto `document.body` — dismissal never registered there at all. Both renderers now pass their own `getPanel()` resolver. Shipped 0.0.8 onward, latest 0.0.20; not device-confirmed. **The second bug, 2026-09-04, on `branches/001-sheet-webkit` (worktree `.worktrees/036-sheet-freeze`), and it is why this class stays open after the entrance fix landed.** A phone sheet is docked to the viewport edge and full width, so `place` answers it from the viewport and reads the anchor for nothing — but it was gated on one at both ends. The view rebuilds its toolbar on roughly two dozen paths, most of them background refreshes with nothing on screen; any one behind an open sheet leaves the panel's owner holding a button that has left the document, and the next placement — a scroll, a rotation, the keyboard — un-portalled the sheet off the body and took its backdrop with it (`9f31bf6f`, 8 failures before and 0 after in `sheet-rebuild`, measured identically in Chrome and WebKit). Alongside it, the sort and filter panels replaced their own node on every add, remove, toggle and background refresh, so on a touch device the delayed click is retargeted out of a surface that no longer contains what the press began in — emulation cannot produce that delay, so the lane asserts the property directly (`8140a1ae`). `c12817a8` adds the device report for what emulation cannot reproduce, and `efb5b54f` pins the sheet's outside-dismissal check to `pointerdown` so no click path can reopen it |
| 37 | Not an operator complaint — the operator-only half of `038-board-kanban-port`'s T12 criterion ("compare the two plugins side by side in the vault where both are installed"), split out because the vendored reference carries no image files an in-repo session could compare captures against | `038-board-kanban-port` | **FAILING on 0.0.23 (07:02 device check), not merely unexercised.** The operator, after using 0.0.23: *"it is possible to add property, sort etc. But all should be debugged, refined, perfected."* Re-asked after **0.0.24**, which carries `044`'s closing leg (`origin/main` `28b505f3`). Reading before this correction, kept for history: **Operator (2026-09-04): capture Project Manager's own board and gantt views into `screenshots/project-manager/` so the comparison is done in-repo — our own captures move under `screenshots/notion-clone/` in the same split. Both legs have now landed on main: the reference captures (`worktrees/037-reference-captures`, harness `043`; landed `295401ad`, reconciled `04814e24`) and the notion-clone split (`worktrees/042-screenshots-folders`; landed `7d95a882`+`aa049b45`, reconciled with main `933308a5`). Rows close when a fresh reviewer compares our captures against the reference captures side by side** **2026-09-05, operator on 0.0.22: _"align closer"_.** The row stays open and now has a named owner — `047-competitor-references-and-pm-alignment`, opened today. It does two things: a fidelity pass against Project Manager's board and gantt using in-repo comparison criteria in the style `037`'s AC-007 and `038`'s T12 used, and a further reference set the operator asked for in the same breath — **Anytype**, boards, tables, calendar and timeline, taken from BOTH the official product images and the app installed locally through a Homebrew cask, saved under `screenshots/anytype/` with manifest entries matching `screenshots/project-manager/`'s style. AppFlowy was asked for in the same breath and captured under that ruling, then removed from the reference set entirely by operator decision, 2026-09-05 — see §6A. The operator's own side-by-side in the vault is still what closes this row. | 2026-09-04: `038/tasks.md` T12 was amended (an orchestrator decision, reversible default, recorded in `038/implementation-summary.md`'s Key Decisions) into two halves. The in-repo half — comparing recaptured board screenshots against the reference SOURCE (`kanban.css`/`table.css`/`widgets.css` and the composites) with pixel measurements — stays a checkable task under T12 itself. This row is the half no session in this repo can close: the operator installing both plugins in one vault and comparing them directly. In-repo side-by-side (fresh reviewer, 2026-09-04, at `466eb370`): gantt zero gaps; board three line-height gaps fixed (`038/tasks.md` T32); operator vault look still owed |
| 38 | Not an operator complaint — the operator-only half of `037-timeline-gantt-port`'s AC-007 criterion ("fresh reviewer's side-by-side screenshot read"), split out because the vendored reference carries no image files an in-repo session could compare captures against | `037-timeline-gantt-port` | **FAILING on 0.0.23 (07:02 device check), not merely unexercised.** The operator, after using 0.0.23: *"it is possible to add property, sort etc. But all should be debugged, refined, perfected."* Re-asked after **0.0.24**, which carries `044`'s closing leg (`origin/main` `28b505f3`). Reading before this correction, kept for history: **Operator (2026-09-04): capture Project Manager's own board and gantt views into `screenshots/project-manager/` so the comparison is done in-repo — our own captures move under `screenshots/notion-clone/` in the same split. Both legs have now landed on main: the reference captures (`worktrees/037-reference-captures`, harness `043`; landed `295401ad`, reconciled `04814e24`) and the notion-clone split (`worktrees/042-screenshots-folders`; landed `7d95a882`+`aa049b45`, reconciled with main `933308a5`). Rows close when a fresh reviewer compares our captures against the reference captures side by side** **2026-09-05, operator on 0.0.22: _"align closer"_.** The row stays open and now has a named owner — `047-competitor-references-and-pm-alignment`, opened today. It does two things: a fidelity pass against Project Manager's board and gantt using in-repo comparison criteria in the style `037`'s AC-007 and `038`'s T12 used, and a further reference set the operator asked for in the same breath — **Anytype**, boards, tables, calendar and timeline, taken from BOTH the official product images and the app installed locally through a Homebrew cask, saved under `screenshots/anytype/` with manifest entries matching `screenshots/project-manager/`'s style. AppFlowy was asked for in the same breath and captured under that ruling, then removed from the reference set entirely by operator decision, 2026-09-05 — see §6A. The operator's own side-by-side in the vault is still what closes this row. | 2026-09-04: `037/acceptance-criteria.md` AC-007's Verification cell was amended (an orchestrator decision, reversible default, recorded in `037/acceptance-criteria.md`'s Closure Statement and `037/goal.md`'s operator rows) into two halves, the same way `038`'s T12 was the same day. The in-repo half — comparing recaptured timeline screenshots against the reference SOURCE (`GanttView.ts`/`GanttHeaderRenderer.ts`/`GanttTaskBarRenderer.ts`/`TimelineConfig.ts`/`gantt.css`) with pixel measurements — stays a checkable item under AC-007 itself. **In-repo half MET 2026-09-04** (fresh reviewer, `30c4b746`, ran none of the gantt legs, `037/tasks.md` T048): 60 of 60 `pm-gantt-*` classes matched with zero divergence, the CSS copy is byte-faithful, and geometry matched exactly. This row is the half no session in this repo can close: the operator installing both plugins in one vault and comparing them directly. In-repo side-by-side (fresh reviewer, 2026-09-04, at `466eb370`): gantt zero gaps; board three line-height gaps fixed (`038/tasks.md` T32); operator vault look still owed |
| 39 | Not an operator complaint — a fresh ruling this ask surfaced: whether to keep the milestone label overpainting the month-band label on the gantt's default render path (reference-faithful by construction) or reinstate a local anti-collision fix there | `037-timeline-gantt-port` | **Shipped in 0.0.23 (`d3979cf5`), the release carrying the 2026-09-05 deferral's named blocker fix (`3a77d523`/`308ba2d3`) — tap inside an open sheet no longer dismisses it. STILL DEFERRED even so, and the blocker it named is gone:** the operator used that build and confirmed the fix — *"Buttons work now"* — so the reason recorded earlier on 2026-09-05 no longer holds, and the row stays deferred only because the 0.0.23 pass did not exercise it and its subject is not a sheet action: it is not a sheet defect at all, but a presentation ruling on the gantt's milestone label; it was deferred only because reading it needed a working sheet, and that is now true, so it is answerable on the next pass. Re-asked on the next device pass. Prior state, unchanged and still true: **Decided (reinstate): landed `1358927` on main; shipped in 0.0.21 (`5af7eef7`); operator confirmation on device open** | 2026-09-04: the fresh reviewer confirming row 38's in-repo half (`30c4b746`) also found `GanttHeaderRenderer`'s month-band label (`y=18`) and `GanttTaskBarRenderer`'s milestone label (`y=14`) painting on the same header SVG in the reference itself, so the overpaint the 1:1 copy reproduces is the reference's own design, not a defect this port introduced. This packet's own 1.4.9/1.4.10 local fix addressed a *different* overpaint (a milestone label crowded by the next bar in its lane) and is superseded on the default render path, not extended to this one — recorded as `037/tasks.md` T050, `037/goal.md`'s operator rows, and `037/implementation-summary.md`'s Key Decisions. This row is the operator's call: keep the reference-faithful shape as shipped, or ask for the local fix back |
| 40 | *"adjust column width sheet on ios needs an obvious redesign and alignment with other sheets"*, plus the addendum minutes later: *"When typing pixel width sheet should also move or adjust so you can still see what your doing when typing."* | `044-phone-sheet-alignment` (contract owners stay `003-mobile-sheet-presentation` and `016-sheet-drag-and-audit`) | **FAILING on 0.0.23 (07:02 device check), not merely unexercised.** The operator, after using 0.0.23: *"it is possible to add property, sort etc. But all should be debugged, refined, perfected."* Re-asked after **0.0.24**, which carries `044`'s closing leg (`origin/main` `28b505f3`). Reading before this correction, kept for history: **Shipped in 0.0.23 (`d3979cf5`), the release carrying the 2026-09-05 deferral's named blocker fix (`3a77d523`/`308ba2d3`) — tap inside an open sheet no longer dismisses it. STILL DEFERRED even so, and the blocker it named is gone:** the operator used that build and confirmed the fix — *"Buttons work now"* — so the reason recorded earlier on 2026-09-05 no longer holds, and the row stays deferred only because the 0.0.23 pass did not exercise it and its subject is not a sheet action: it names the column-width sheet's redesign and its keyboard leg, both presentation. Re-asked on the next device pass. Prior state, unchanged and still true: **Fixed `8bcb11f3` (shared sheet host, keyboard-aware, presets segmented; worktree commit `6ab72419` before three rebase rounds), reconciled through main and recorded `e494be00`; shipped in 0.0.21 (`5af7eef7`). Phase closed on main `9436b964` (superseding the earlier `dcff742e`, orphaned — not an ancestor of main — once the line-height fix landed underneath it and forced a second reconciliation): `npm run gate` 26/26, `sheet-grammar` 6 surfaces x 7 elements green (negative control red-then-green), `verify-placement.mjs` 402/403 (the same 1 declared red every release carries). Shipped in 0.0.22 (`7b976e28`). Operator confirmation open** | 2026-09-04 ~20:37 CEST, iOS, screenshots `report-40-column-width-sheet.png` and `report-40b-column-width-keyboard.png`. Measured cause, not inferred: `src/views/database-view.ts:11411-11412` builds `db-mobile-column-width-backdrop` and `db-mobile-column-width-panel` with `doc.body.createDiv` and never calls `applySheetChrome`, so the adjuster has none of the seven grammar elements — no sheet surface, no grab band, no header or close, no row padding, no safe-area inset and no keyboard avoidance. The capture shows the title starting at x=0 and the slider clipped by the left edge. The addendum is the same surface's keyboard leg: the numeric keyboard covers the whole strip, leaving only the table visible while typing |
| 41 | *"Same for settings sheet. That one also cant properly close, drag handler doesnt work"* | `044-phone-sheet-alignment` (contract owners stay `003` and `016`) | **FAILING on 0.0.23 (07:02 device check), not merely unexercised.** The operator, after using 0.0.23: *"it is possible to add property, sort etc. But all should be debugged, refined, perfected."* Re-asked after **0.0.24**, which carries `044`'s closing leg (`origin/main` `28b505f3`). Reading before this correction, kept for history: **Shipped in 0.0.23 (`d3979cf5`), the release carrying the 2026-09-05 deferral's named blocker fix (`3a77d523`/`308ba2d3`) — tap inside an open sheet no longer dismisses it. STILL DEFERRED even so, and the blocker it named is gone:** the operator used that build and confirmed the fix — *"Buttons work now"* — so the reason recorded earlier on 2026-09-05 no longer holds, and the row stays deferred only because the 0.0.23 pass did not exercise it and its subject is not a sheet action: it names the settings sheet's close affordance and its dead drag handle, which are chrome rather than actions. Re-asked on the next device pass. Prior state, unchanged and still true: **Root cause: the sheet scrolled its own handle/header out of reach. Fixed `dbdec603` (chrome out of the scroller, close control, phone rows), recorded `355d24ff`; shipped in 0.0.21 (`5af7eef7`). Phase closed on main `9436b964` (superseding the earlier `dcff742e`, orphaned — not an ancestor of main — once the line-height fix landed underneath it and forced a second reconciliation): `npm run gate` 26/26, `sheet-grammar` 6 surfaces x 7 elements green (negative control red-then-green), `verify-placement.mjs` 402/403 (the same 1 declared red every release carries). Shipped in 0.0.22 (`7b976e28`). Operator confirmation open** | 2026-09-04 ~20:38 CEST, iOS, screenshot `report-41-settings-sheet.png`. The opposite failure to row 40: `SettingsTab` (`src/settings.ts:91`) reaches the phone through `DbModal`'s `sheet` presentation (`src/settings.ts:571`) and does get the chrome — grab band and title are both in the capture — but its body is Obsidian's desktop two-column `Setting` grid squeezed onto 390pt, so labels wrap against narrow controls and "Leave empty to scan the vault root." is clipped at the right edge. There is no close affordance, and the grab band does not dismiss it. **Landed `dbdec603` on `worktrees/040-settings-sheet`, reconciled through main at `ee26bc5a`**: `view-config-panel-renderer.ts`'s `render()` moved the header and grab band out of the scrolling region into a fixed header carrying the title and a 44px close button (`renderSheetClose`, dismissing through `overlayStack.dismissPanel`), with `.db-view-config-body` as the sole scroller; `getScrollHost()` reads whichever element is actually scrolling so save/restore-scroll keeps working on both the anchored desktop panel and the phone sheet. Red observed in `sheet-rebuild.mjs`'s "settings sheet chrome survives its own scroll" case pre-fix (grab band 48px -> 0px after a 200px scroll); green after, holding at 48px through the same scroll |
| 42 | *"on overview the nested views shouldn't be clipped in blocks but look like original databases just like notion does"*, with two follow-ons the same minute: *"allow for easy dragging / moving of said views (database put on a different page like overview)"* and *"get that UX of adding a view linked to a source database close to Notion"* | `046-linked-views-notion-parity` | **ADR-001 Accepted 2026-09-05 ~05:30 CEST — operator, verbatim: "Allow db writing from linked views." Implementation pass running on `worktrees/054-linked-views` (external lane: devin first, Grok fallback)** | 2026-09-04 ~20:41 CEST, iOS, screenshots `report-42-embedded-view-clipped.png` (an Overview page's embedded "Reports" database inside a bordered block with a redundant nested title, expand and collapse icons, and a table clipped at the right edge) and `report-42-standalone-reference.png` (the same kind of database opened standalone: full-bleed, view tabs, toolbar with filter and sort badges, chip rail, table, + New row, footer COUNT/SUM) |
| 43 | *"This sheet also still has bad design"* — the Add view sheet | `044-phone-sheet-alignment` (the surface itself is `013-add-view-sheet`'s) | **FAILING on 0.0.23 (07:02 device check), not merely unexercised.** The operator, after using 0.0.23: *"it is possible to add property, sort etc. But all should be debugged, refined, perfected."* Re-asked after **0.0.24**, which carries `044`'s closing leg (`origin/main` `28b505f3`). Reading before this correction, kept for history: **Shipped in 0.0.23 (`d3979cf5`), the release carrying the 2026-09-05 deferral's named blocker fix (`3a77d523`/`308ba2d3`) — tap inside an open sheet no longer dismisses it. STILL DEFERRED even so, and the blocker it named is gone:** the operator used that build and confirmed the fix — *"Buttons work now"* — so the reason recorded earlier on 2026-09-05 no longer holds, and the row stays deferred only because the 0.0.23 pass did not exercise it and its subject is not a sheet action: it names the Add view sheet's row grammar; like row 39 it was deferred because reading it needed a working sheet, and that is now true. Re-asked on the next device pass. Prior state, unchanged and still true: **Fixed (T008): header with a close affordance via `createSheetHeader`; the three loose inputs grouped into `db-panel-row`s; Title property rendered as a dropdown row (`createDropdownField`) instead of a plain text input; Copy settings from current view as a toggle row instead of a bare checkbox; the Create rows chevroned via the shared row builder; List view withdrawn from the type picker. Landed on main `9436b964` (superseding the earlier `dcff742e`, orphaned — not an ancestor of main — once the line-height fix landed underneath it and forced a second reconciliation): `npm run gate` 26/26, `sheet-grammar` add-view row 7/7 green including the List-view-absent assertion, `verify-placement.mjs` 402/403 (the same 1 declared red every release carries), the `add-view-popover`/`constructed-toolbar-add-view` captures read by hand across both themes. Shipped in 0.0.22 (`7b976e28`). Operator confirmation open** | 2026-09-04 ~20:44 CEST, iOS, screenshot `report-43-add-view-sheet.png`. The sheet has the chrome and no row grammar: an "Options" heading over three tall bordered inputs, **Title property** rendered as a plain text input although it is a select, a bare square checkbox for "Copy settings from current view", then a "Create" heading over a flat icon list with no row chrome or chevrons. No close affordance. That `013` is marked Shipped + verified and this still reads as bad design is the argument for `044` existing: `013` met its own criteria, which never included conformance to a grammar nobody had written down. **List view must also leave this picker** as part of `specs/006-list-view-deprecation`; `044` asserts the absence, `006/002-hide-and-migrate` performs the removal |
| 44 | *"Buttons work now but stacked sheets dont look or work right. Add phase to optimize stacked sheets and make sure we have inventory of all sheets that are stacked on top of a parent."* — the Properties sheet leg: **"Create property" opens as an Obsidian modal stacked over two peeking parent sheets, with no dim and no push-back** | `048-stacked-sheets`, opened today | **FIXED 2026-09-05, ships in 0.0.24.** **Root cause:** the mount never read the parent — `setSheetMount` appended a child to the body and touched nothing else — and one scrim node sat behind both sheets by design, so there was nothing to dim the parent from its child and nothing to push it back. `CreatePropertyModal` compounded it by wearing Obsidian's own chrome, which is what the capture's middle band is. **Fix:** `265f736f` makes `parentId` load-bearing and gives one mount pass ownership of depth — a per-depth z-index, the dim and pull-back on every surface below the top, and the single scrim moved between the top two; `915591c2` presents modals as sheets under D1 ACCEPTED, so all 19 `DbModal` subclasses take the shared header and the host's close button is hidden. **Measured** (`f1fffff2`, AC-002): parent bounding-box delta **336.00px → 0.00px** across all 31 registered pairs. Level 2 (`recommend-level.sh --loc 600 --files 13 --architectural` → 64/100 confidence 82%; phase score 10/50 against the 25 threshold, so a standard child) | Operator report, iOS, 2026-09-05 07:02 CEST, screenshot `scratch/device-2026-09-05/stacked-properties-create-property.png`. **The chain is code-derived, not inferred from the picture**: the Properties sheet is `column-manager-renderer.ts:148` (its title is `t("toolbar.properties")` at `:166` beside a `t("panel.all")` checkbox, which is exactly what the capture shows); its `+ Add column` button (`:107-112`) calls `actions.addColumn()` → `database-view.ts:5057` → `:5509` `new CreatePropertyModal`. **Why there is no dim:** one `.db-mobile-sheet-scrim` node is shared by however many sheets are open (`mobile-bottom-sheet.ts:478`), so it sits behind BOTH and dims neither from the other. **Why there is no push-back:** `setSheetMount` (`:274`) appends the child to the body and never reads what was already open. The middle band is the one thing static reading cannot settle — read as three sheets it is an unidentified surface, read against `db-modal.ts:70` it is the modal's own chrome plus Obsidian's close button — and `048` T002 names the nodes rather than guessing. Either reading leaves the finding unchanged |
| 45 | The operator dropdown in the filter sheet **opens as a second sheet at the bottom while the filter sheet is shoved to the top — two sheets splitting the viewport** | `048-stacked-sheets` | **FIXED 2026-09-05, ships in 0.0.24.** **Root cause:** confirmed as M4 — each sheet wrote `--db-mobile-sheet-bottom` at its own placement time, so the filter sheet kept the inset its value field had raised while its own dropdown docked at zero, and both painted at the same z-index with nothing ranking them. **Fix:** `265f736f` publishes the keyboard inset to the top sheet only, writes zero to every sheet beneath, and stops a sheet beneath another re-placing at all — which is what keeps the parent still while the child takes the keyboard. **Measured** (AC-005, both surfaces re-placed under a declared 336px keyboard, as a device's single viewport event would): **red on all 31 pairs with the parent holding 336px → child 336px, parent 0px** on all 31 | Operator report, iOS, 2026-09-05 07:02 CEST, screenshot `scratch/device-2026-09-05/stacked-filter-operator-dropdown.png`. The child is `filter-panel-renderer.ts:510`'s `db-filter-operator-dropdown`, a `createDropdownField` whose popover reaches `positionToolbarPopover` and becomes a sheet. **Both sheets dock to `bottom: var(--db-mobile-sheet-bottom)` at the same `z-index: var(--db-layer-modal, 1000)`** (`styles.css:194-200`), and each writes that variable itself at its own placement time (`popover-position.ts:406`). Two sheets can therefore hold different values — a defect `keepSheetPlaced`'s own doc comment (`popover-position.ts:447-461`) already records as measured elsewhere: *"a menu sheet sitting at `bottom 844 -> 844 -> 844` beside a panel sheet going `844 -> 508 -> 844` under the same declared keyboard."* The capture is **consistent with** that and is not proof of it; `048` T003 measures both values. What refutes it: both sheets reading the same number, which would move the cause to the height cap |
| 46 | The property picker **covers most of the screen, the parent filter sheet vanishes, and the list is cut off mid-row with no title, no header or close, and no scroll affordance** | `048-stacked-sheets` | **FIXED 2026-09-05, ships in 0.0.24.** **Root cause:** two, and both were confirmed. `openDropdownPopover` never called `createSheetHeader`, so a dropdown sheet got a grab handle and nothing else; and `getDropdownPopoverHost` resolved the picker's host to the parent sheet itself, so the child was built inside its parent and portalled out — which is why the parent appeared to vanish rather than to be covered. **Fix:** `915591c2` builds a header when the anchor sits inside a sheet, resolves the host to the body instead, and moves the option list into its own scroll container with a mask at the cut so the title and close stay put. **Measured** (AC-004, AC-007): header, close-target, inset and title **all red on all 31 pairs → all green**; the long picker **985 > 424 with no fade → 932 > 344 with the mask present** | Operator report, iOS, 2026-09-05 07:02 CEST, screenshot `scratch/device-2026-09-05/stacked-filter-property-picker.png`. The child is `filter-panel-renderer.ts:480`'s `db-filter-field-dropdown`. **The missing header is checkable, not a judgement:** `createSheetHeader` and its one equivalent are called by exactly five surfaces in `src` — `filter-panel-renderer.ts:259`, `sort-panel-renderer.ts:113`, `toolbar-renderer.ts:1386`, `create-linked-view-modal.ts:59` and `view-config-panel-renderer.ts:388` — and `openDropdownPopover` (`dropdown-field.ts:187`) is not among them, so a dropdown sheet gets a grab handle and nothing else. **Why the parent appears to vanish:** the picker is created INSIDE the filter sheet, because `getDropdownPopoverHost` (`dropdown-field.ts:379-384`) resolves `anchor.closest(".note-database-container")` and a portalled sheet wears that exact class (`mobile-bottom-sheet.ts:305-306`); it is then portalled out to the body and, at fourteen properties, covers the parent completely |
| 47 | The toolbar's **"+" split button is broken, looking weird** | `015-desktop-dropdown-placement` | **NEW 2026-09-05, desktop. Fixed in-repo on `worktrees/064-desktop-chrome-bugs`, shipped in 0.0.24 pending; operator confirmation open.** Root cause, measured rather than inferred: the split button's two halves size from two different authorities. `.db-new-button-primary` takes `height: 28px` from the shared toolbar-button rule (`styles.css`); `.db-new-button-dropdown` declared no height at all, and a bare `button` is one of the few elements Obsidian sizes itself — `button { height: var(--input-height) }`, read out of the installed `obsidian.asar`'s `app.css` (1.13.4) this session. Under the group's `align-items: stretch` the half with no height takes the host's, the pinned half stays at 28px and top-aligns inside it, so the chevron hangs below its own plus sign and the pill stands taller than every icon button beside it. Two further mismatches on the same control, both measured in-repo: it painted `var(--interactive-accent)` at rest against transparent neighbours, and its outer corners used `--db-radius-md` (6px) against the icon buttons' `--db-radius-lg` (8px). Fixed in `styles.css` — the dropdown half states its own 28px, both outer ends move to 8px, the accent moves to `:hover`/`:active`/`.is-open` and the phone FAB keeps it explicitly, and the inner divider reads `--db-border-regular` rather than 28% of a `currentColor` that is now muted grey. **The focus ring the report also named is not a defect and was not changed:** every ring in the stylesheet is already `:focus-visible`-only, and a probe on the shipped renderer shows a mouse click on the More-tools button leaves `:focus-visible` false with `box-shadow: none`, while pressing Escape to close the menu flips it true — the browser's own keyboard-focus contract, and removing it would take the ring from keyboard users | Operator report, desktop, 2026-09-05: *"that plus dropdown button is broken, looking weird"*. Screenshot `scratch/device-2026-09-05/desktop-toolbar-new-split-button.png`. A pixel scan of that capture reads the chevron half's accent fill spanning 43px against the plus half's 37px from the same top edge — a scale-free 6px overhang in the direction the mechanism predicts. Reproduced in-repo at 33 findings by a new chrome-geometry measurement riding `unstyled-links.mjs`'s constructed pass (`tools/live/chrome-geometry-measure.mjs`), green at 0 after. The height half of that red is honestly incomplete and the lane's own PASS lines say so: `theme.css` states no height for a bare button, so the harness measures the pill against a shorter host than the app supplies. Applying the host's declaration in a probe reproduces it exactly — group 30px, primary 28px, dropdown 30px, against 28px icon buttons |
| 48 | Clicking a board card opens the record panel **clipped at the top of the window** — only its title row visible, above the workspace | `038-board-kanban-port` | **NEW 2026-09-05, desktop, 0.0.23. Fixed the same day; on main, awaiting the 0.0.25 cut. Operator confirmation open** | Operator report, desktop, screenshot `scratch/device-2026-09-05/desktop-board-card-peek-clipped.png`. **Root cause:** the reference card's click handler called `openRow(row)` with no element to anchor to, while the extension card beside it already passed `openRecordDetail(card, row)`. With no anchor, `openRecordAt` falls back to `host = this.containerEl_`, so `positionToolbarPopover` anchors the panel to the whole scrolling container — which has no room above or below itself, so `availableHeight` collapses to the margin above it and the panel is drawn there, at that height. **Measured in headless Chrome** on the shipped renderer, one board and two anchors: container anchor `top 12 · bottom 84 · height 72` against a 900px viewport — the operator's sliver — and card anchor `top 535 · bottom 706 · height 171`, below the clicked card. **Fix:** the reference card uses `openRecordDetail(card, row)` like the extension card, and guards clicks on links and controls now that a card carries property values. Red first: `board-renderer-parity.test.ts` "anchors the record surface to the card that was clicked" |
| 49 | *"not all enabled properties are showing in cards of board"* — every property is checked visible in the panel, yet a board card shows only the title, one number and a date chip | `045-board-card-properties` | **NEW 2026-09-05, desktop, 0.0.23. Fixed the same day; on main, awaiting the 0.0.25 cut. Operator confirmation open** | Operator report, desktop, screenshot `scratch/device-2026-09-05/desktop-board-card-properties-not-rendered.png`. **Root cause, read from the tree:** `board-renderer.ts:230-235` returns into `renderReferenceBoard` whenever `boardExtensionsEnabled` is not `true`, and nothing in `src/` ever sets that flag — so the reference card is the only board card that ships, and it resolved a fixed five-slot map (`getReferenceCardFields`, formerly reading every column) while `resolveBoardCardFields` at `:1465` sat behind the branch and never ran. The Properties panel wrote `boardCardFields` to a renderer that could not read it. **Fix:** the reference card resolves its five slots from the view's visible field list instead of from every column, and renders every configured field that takes no slot in a `db-board-card-meta` grid in panel order. Red first: three assertions in `board-renderer-hierarchy.test.ts` ("default board card properties") failed with `expected [] to include 'notes'` before the change. This **amends `038` REQ-007 and supersedes `045` AC-004** — see `045/decision-record.md` ADR-003 |
| 50 | Filter popover has **bad styling and truncates input content too much** | `015-desktop-dropdown-placement` | **NEW 2026-09-05, desktop. Fixed in-repo on `worktrees/064-desktop-chrome-bugs`, shipped in 0.0.24 pending; operator confirmation open.** Root cause: the panel's width is written inline by `positionToolbarPopover`, so no stylesheet rule can reach past it, and `PANEL_POPOVER` capped it at 360px (`popover-position.ts`). Inside that, the condition row spends its width on fixed parts first — a 112px operator basis and three trailing buttons at 26 + 26 + 32 — and the only two controls carrying words, the property chip and the value box, had no floor under either, so they absorbed the whole shortfall. Measured on the shipped renderer at 360px: property 82px, operator 110px, value 16-40px. Fixed by widening `PANEL_POPOVER` to a derived 552px and giving the row floors in `styles.css` — property and operator `flex: 0 1 auto` with a 140px minimum, the value control `flex: 1 1 auto` with a 120px minimum — plus `box-sizing: border-box` on the row's bare form controls, which were taking their box model from the host's global rule and so rendering a 28px-declared input at 30px. Sort is the same preset and moves with it. The floors are scoped away from `.db-mobile-bottom-sheet` so the phone's two-line grid is untouched, and away from `.db-active-rule-popover`, the compact single-rule editor that borrows `.db-filter-panel` for its chrome — a first version of the floors wrapped its three controls onto three lines, caught by reading the capture. **`PANEL_POPOVER`'s third caller is the Column Manager, which widens with them**; kept deliberately, since splitting the preset would restore the per-panel width drift it exists to end | Operator report, desktop, 2026-09-05: *"dropdowns have bad styling and truncate input content too much"*. Screenshot `scratch/device-2026-09-05/desktop-filter-popover-truncated.png` — the property dropdown reading "Ti…", the value input collapsed to "Va". The committed capture `screenshots/notion-clone/panels/constructed-filter-panel-desktop-dark.png` at HEAD showed the same defect, so this one reproduced in-repo with no stand-in gap. After: property 140px, operator 140px, value 120-140px in a 552px panel, zero row overflow, at every nesting depth the panel builds. **The declared `panel` role width in `design-system.md` §5 is 292-360px and this exceeds it** — the operator's 440-520px instruction outranks the doc, so the code follows the instruction and the doc is now a defect for the operator to rule on |
| 51 | *"board is stacked above calendar view"* — switching the view tab from board to calendar leaves the kanban rendered above the calendar | `038-board-kanban-port` | **NEW 2026-09-05, desktop, 0.0.23. Fixed the same day; on main, awaiting the 0.0.25 cut. Operator confirmation open** | Operator report, desktop, screenshot `scratch/device-2026-09-05/desktop-board-persists-over-calendar.png`. **Root cause:** `database-view.ts` `refresh()` cleared the previous view by naming every root in one selector list — `.db-table`, `.db-board`, `.db-calendar`, `.db-timeline` and the rest — and the list never learned the reference board's root. `renderReferenceBoard` mounts `.pm-kanban-board` and puts `pm-kanban-view` on the container itself; neither was named, so both survived the switch and the calendar appended underneath. The surviving class is the second half of the defect: `.note-database-container.pm-kanban-view` sets `overflow: hidden; display: flex; height: 100%`, which the calendar then inherited. **Fix:** the teardown moved to `rendered-view-roots.ts`, which names both and takes the container class off with the root. Red first: `board-renderer-parity.test.ts` "leaves no board root or board container class behind" renders a real board and failed on the surviving `.pm-kanban-board` |

*2026-09-05, the device check of **0.0.22**, and it is the reason twelve rows above now read
DEFERRED rather than confirmed.* The operator's words, in full: **"some still broken, all buttons
like add sort, add filter still broken"** and **"pressing any action in a sheet doesn't work and
instantly closes it"**. Quoted as a report, not as a diagnosis — nothing below it is a claim that
anything was fixed.

**What that costs the table is confirmation, not correctness.** Every one of rows 29-36, 39-41 and
43 was sitting at *shipped, awaiting the operator*. A sheet that dismisses itself the moment a
control inside it is pressed cannot be used to judge any of them: the sort sheet, the filter sheet,
the column-width sheet, the settings sheet, the Add view sheet and the record sheet are all reached
or exercised through the surface that is failing. So the operator deferred all twelve in one ruling
rather than reporting twelve separate failures — **they are re-asked after the next iCloud build**,
and the deferral is recorded per row above, which is what §4A exists to require.

**The named blocker is one bug, and it has an owner and a worktree.** Tap inside an open sheet
dismisses it on iOS; the fix was in progress on `worktrees/056-sheet-inside-tap` under
`031-sheet-lifecycle-ownership` when the operator gave the ruling. That is the third bug in `031`'s
class — the entrance fix (`c96467c9`) and the toolbar-rebuild drop (`9ecb5fff`) both landed and both
shipped, and this is a distinct third. Rows 34-36 name it as a symptom; every other deferred row is
collateral.

*Later the same day, and it does not un-defer anything:* the fix **landed on main** — `3a77d523`
(the view stops reading a press inside a portalled sheet as outside), `308ba2d3` (the cell selection
survives the same press), recorded in `031/implementation-summary.md` at `66b69842` and `2be66ba5`.
**It has not shipped.** Under D3 that is landed, not released and not confirmed, so all twelve rows
stay DEFERRED and are re-asked after the next iCloud build exactly as the operator set out. The
deferral's terms are what changed state, not the deferral.

**2026-09-05, later still: it has shipped.** `0.0.23` (`d3979cf5`) carries the fix. Under D3 that is
released, not confirmed — the release-side half of what the deferral was waiting on is now met, and
all twelve rows stay DEFERRED pending the operator's own device check against `0.0.23` specifically,
rather than a future build.

**Two rows are deferred for a reason worth separating from the other ten.** Rows 39 and 43 are not
sheet-lifecycle defects at all — 39 is a presentation ruling on the gantt's milestone label and 43
is the Add view sheet's grammar. They are deferred because the *reading* of them needs a working
sheet, not because they share the defect.

**Rows 37 and 38 moved in the opposite direction on the same day.** The operator did not defer them;
they asked for more: *"align closer"*, plus reference captures of **Anytype** and **AppFlowy** —
official product images and the apps installed through Homebrew casks — beside the Project Manager
set. `047-competitor-references-and-pm-alignment` owns both halves. Neither row closes on it; the
operator's own vault comparison still does.

**`045-board-card-properties`'s two open operator questions were answered the same day, and neither
was a defect.** *Does gallery share the visible-properties mechanism* — **no**, because the operator
retired the gallery outright (*"should have been deprecated"*), and the retirement is now
`specs/007-gallery-view-deprecation`. *Should hiding a card field also hide it in the table* —
**no, cards only**. Both are recorded as `045/decision-record.md` ADR-001 and ADR-002. `045`'s
AC-006 stays open and is deferred with the twelve above, for the same reason: the Properties sheet
could not be reached.

*2026-09-05 07:02 CEST, the device check of **0.0.23**, and it discharges three of the twelve
deferrals and re-anchors the other nine.* The operator's words, in full: **"Buttons work now but
stacked sheets dont look or work right. Add phase to optimize stacked sheets and make sure we have
inventory of all sheets that are stacked on top of a parent."**

**"Buttons work now" is an operator confirmation, and it closes rows 34, 35 and 36.** Those three
are the rows whose subject *is* a control inside a sheet — the sort sheet's add-sort, the filter
sheet's Add condition, and the class both belong to. The tap-inside-sheet fix (`3a77d523`,
`308ba2d3`, recorded in `031/implementation-summary.md` at `66b69842` and `2be66ba5`) shipped in
**0.0.23** (`d3979cf5`), and the operator has now used it. Under D3 that is the third state, so the
three rows close rather than merely un-defer.

**The other nine stay DEFERRED, and the reason has changed.** Their named blocker is gone — the
sheet works — so they are no longer blocked on anything. They stay deferred because the 0.0.23 pass
did not exercise them, and each row now says so in its own State cell with its own subject. Read
per row, the nine split into three groups:

- **Not a sheet action at all.** Row 32 is a plural form in `src/i18n.ts:287`. Row 39 is a
  presentation ruling on the gantt's milestone label. Neither has anything to do with a sheet; 39
  was deferred only because *reading* it needed a working sheet, and that is now true.
- **Sheet chrome and layout, not sheet actions.** Row 29 (dead drag handle, no way to close,
  appear-disappear-freeze), row 33 (the record sheet overflowing 100vh), row 40 (the column-width
  sheet's redesign and its keyboard leg), row 41 (the settings sheet's close and drag handle) and
  row 43 (the Add view sheet's row grammar). A working button does not answer any of them.
- **A surface next to a sheet rather than inside one.** Row 30 (the All-views sheet's five action
  icons per row and its truncated titles — menu language) and row 31 (the selection bar staying
  docked under an open sheet while the inline editor lands on it — three surfaces arbitrating for
  the bottom edge).

**`045`'s AC-006 moves with the nine, not with the three.** It was deferred because the 0.0.22 check
could not reach the Properties sheet. The 0.0.23 captures show that sheet open, so it is reachable;
it was simply not judged. It stays open and is re-asked on the next pass.

**One conflict is named rather than resolved here, per §7's rule.** `handover.md`, committed at
2026-09-05 07:20 (`b2fa03ae`), says 0.0.23 is *"not yet installed to the iCloud vault or
operator-confirmed"*. The operator's report above is timestamped **07:02 on an iPhone running
0.0.23**, eighteen minutes earlier, and it quotes them using the build. Both cannot be true. This
file takes the operator's own words as the stronger evidence — a handover states what a session
believed, a device report states what a person did — and the rows above are written on that reading.
`handover.md` is that document's to correct.

**And the same check opened three new rows — 44, 45 and 46 — all owned by `048-stacked-sheets`.**
They are one defect seen three ways, and the mechanism is an absence rather than a bug: nothing in
the plugin models a stack. One `z-index` for every sheet (`styles.css:194`), one scrim behind all of
them (`mobile-bottom-sheet.ts:478`), no parent read when a child mounts (`:274`), and a keyboard
inset each sheet computes for itself (`popover-position.ts:406`). `overlay-stack.ts:47` already
declares a `parentId` on every registered surface and `rg -n "parentId" src/views` returns **no
reader** — the shape a depth model needs is there and nothing consumes it. The operator's second ask
in the same breath, an inventory of every sheet stacked on a parent, is `048`'s T001 and is written:
`048-stacked-sheets/stacked-surface-inventory.md`.

**2026-09-05, later still: the same 07:02 check is read more precisely, and three
already-deferred rows plus the two board/timeline rows move from unexercised to
failing.** The operator's fuller words on that pass: **"it is possible to add
property, sort etc. But all should be debugged, refined, perfected."** Read against
the individual surfaces, that sentence draws a line the single "Buttons work now"
line did not: adding a property and sorting work at the level of *a control responds*,
but the column-width sheet (row 40), the settings sheet (row 41), the Add view sheet
(row 43) and board/timeline on the phone (rows 37/38) are named as still broken on
**0.0.23**, not merely untested. Each row's State cell now carries a FAILING lead
with the prior "unexercised" reading kept underneath for history rather than
deleted. All five are re-asked after **0.0.24**, the release that carries
`044-phone-sheet-alignment`'s closing leg (`origin/main` `28b505f3`). **"Debugged,
refined, perfected" is now the bar for every phone surface in this program, not a
one-off note** — recorded in §6A alongside the other standing operator decisions.


### What the table says as a whole

**Thirty-two of thirty-five reports now have a named phase; rows 34-36 do not** — they are recorded
with owner pending diagnosis, per the note above. Fifteen of the original sixteen have
shipped code — report 13 remains the exception, deliberately not a phase. *2026-09-02: of the
sixteen rows added later (18-33), five now have shipped code under the phase they name. Row 29's
fix landed in `98da630` and `0c92f4d` under `031` and went out in 1.4.1 (now 0.0.6). Rows 30 to 33
were recorded in `62c4fe7` and their fix landed in `00e2aa2`, shipped in 0.0.7 (formerly 1.4.2) and
every release since, latest 0.0.20 installed to the iCloud vault — not operator-confirmed.
The rest still route to `027`, `028` or `031` and are still being investigated.* Row 18 is the one worth naming apart from the rest: the phase
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

**`045-board-card-properties` carried two operator questions that are not part of the numbered
report list above. Both were answered on 2026-09-05.** Does gallery share the visible-properties
mechanism — **no**, the gallery is retired instead (`045/decision-record.md` ADR-001, and the
retirement packet is `specs/007-gallery-view-deprecation`). Should hiding a card field also hide it
in the table — **no, cards only** (ADR-002). See the `045` row in §5.A.

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
below disposes of the original sixteen. Reports **21-29 are in neither state** — not confirmed, not
deferred with terms. Nine of them: the sort, filter and column-setting sheets (21-24), the bundled
sheet-grammar asks (25), the group and view sheets that will not drag (26), the intermittent
close-freeze (27), the More-tools dropdown alignment (28), and the 1.4.0 report naming drag handle,
close and freeze-on-open defects across multiple sheets (29). Four of those nine arrived after
this section was written, which is exactly how a denominator goes stale: the section was correct
when written and was not re-derived when the table grew. *2026-09-02: row 29 added.*

*2026-09-02, re-derived once more: the rows in neither state are **21-33**, thirteen of them.* Rows
30 to 33 joined after the sentence above was written, which is the same staleness happening again in
the paragraph that names it. Row 29 is in neither state either, despite its partial: a partial
confirmation is not a confirmation and it is not a recorded deferral. The device pass this section
defers to is also now against **1.4.1** rather than 1.3.9, since that is the build the operator has
installed.

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
fill**) and time it. The timeline should now open; ~~the list is **expected to still stall**, because
at that shape it blocks 2.0-4.9s and the remaining cost is layout over node count, which only
virtualisation reaches. A list that still hangs is **not** a failed fix — it is the measured,
recorded state, and saying so in advance is the point of recording the deferral.~~

*2026-09-02: the deferral was taken up and the warning is withdrawn.* `033-list-virtualisation`
windowed the list: its `goal.md` records the blocked main thread at **4,748.6ms -> 48.4ms** at 3,000
rows and node count **225,007 -> 2,184**, flat to 3,400 rows, with the grouped path windowed too.
So the list is now expected to **open**, and a list that still hangs on the operator's database is
the finding — which is the one criterion `033` still carries, because every figure above it is a
bench figure.

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

**`npm run gate`'s lane count is not a constant — read the number beside the date, not against
this section's own older "25 green" figures.** The count moved twice outside `005`'s own phases:
`044-phone-sheet-alignment` (`005`'s child) added a `sheet-grammar` lane, taking the count from 25
to 26; `006-list-view-deprecation/007-remove-renderer-and-harness` (a sibling packet, not a `005`
child) then removed the `list-window` lane, taking it from 26 to 25. The bullets below that quote
"25 green" from before either change and the ones that would quote "26" or "25" after are two
different baselines that happen to share a number — a coincidence of timing, not evidence that
nothing changed. See `006-list-view-deprecation/007-remove-renderer-and-harness/implementation-summary.md`'s
own Reconciliation section for the full per-lane accounting.

**Now:** Six phases held by other agents — four unaudited since this morning's snapshot, two opened
today.

- `004-checkbox-ownership` — **Shipped + verified, awaiting device — 7 of 8.** The theme row was recorded unreachable and was not: three host profiles now run against all 250 fixture checkboxes, the first transcribed from the installed application stylesheet, and every checkbox holds its appearance. Getting there found a shipped accessibility defect — the border preferred a host token resolving to 2.30:1 in the default light theme and 2.90:1 in dark, under WCAG's 3:1 non-text minimum, invisible to every harness because none declared that token. The border now takes the switch's own #82878e and clears 3.09:1 or better everywhere. Exit signal: the operator seeing squares on a board on their phone.
- ⚠ `005-content-row-rhythm` — shipped: list-row border-box, list meta ruled into columns, renderer-declared tracks. Continuity still reads "not started".
- `016-sheet-drag-and-audit` — **Shipped + verified, awaiting device — 9 of 10.** Root-caused report 1 and re-measured all eight sheet asks together on the shipped build. The fill ask no longer reads one declaration nine times: the nine surfaces are built under nine wrappers each declaring its own `--background-primary` and still measure one colour, because `setSheetMount` relocates every sheet to `document.body` and it stops inheriting from its builder. The in-run control — the same class left unportalled, measuring its wrapper's colour — is what makes that not vacuous. Exit signal: the operator swiping between a record sheet and a menu sheet.
- ⚠ `017-touch-row-range-selection` — 91%. Predicate removed from both views, hold gesture added, checks added, negative controls run and restored by hash. The announcement decision is answered — the code had already taken it with an `aria-live` attribute the bar's own rebuild made inert, and a persistent live region outside the bar now carries it. The row-menu term is no longer a counter: the hold builds the shipped menu and the check measures it. Exit signal: one operator row, a tap on a real phone.
- ⚠ `027-sheet-menu-grammar-and-motion` — opened today for rows 24-25 (a non-responsive
  column-type control, and five sheet button/motion/overflow asks). Held by another agent at
  the time of this pass; state UNKNOWN, not read.
- `028-remaining-freezes` — **Shipped + verified — 6 of 6.** Opened for rows 18-23 (list, board,
  calendar and other non-table views; the sort and filter sheets) and now closed on every criterion,
  none of which is an operator row. The last one held on the table's own un-windowed range, and it
  named two ways out: remove the superlinear term, or restate the row to bound cost instead of
  forbidding a shape. The term was removable. `applyGridSemantics` was scanning every row per row
  and rebuilding a children array per cell — 8.8% of a 400-row render, 26.2% of a 1,600-row one on
  the profile — and with both gone the 4-column arm goes **SUPERLINEAR ×1.82 → LINEAR ×0.93** and
  1,600 rows renders in **22.3ms against 76.7ms**. Reverting the one function restores ×1.82.
- `044-phone-sheet-alignment` — **Opened 2026-09-04, Level 2** (`recommend-level.sh --loc 700 --files 16 --architectural` -> 67/100; phase score 20/50, so it stays a standard child rather than decomposing again). Opened from three operator reports inside eight minutes — rows 40, 41 and 43 above — that share one cause rather than three: `applySheetChrome` supplies mount, scrim and drag, while header/close, padded rows, segmented choices, keyboard avoidance and safe-area inset are supplied per instance or not at all. Measured at opening, not asserted: six modules call `applySheetChrome`, and three body-mounted surfaces bypass it entirely (`database-view.ts:11412`, `icon-picker-popover.ts:57`, `option-color-picker.ts:43`). `003-mobile-sheet-presentation` and `016-sheet-drag-and-audit` stay the contract owners; this phase owns conformance to them, instance by instance, driven by `003/sheet-and-dropdown-inventory.md`. Two legs were already running when the packet was written (`worktrees/039-column-width-sheet`, `worktrees/040-settings-sheet`) and both must consume the shared chrome rather than inventing a local fix — that is the phase's own first risk. Exit signal: the operator opening all three reported sheets on iOS and reading them as aligned; a green `sheet-grammar` lane is necessary and has already been shown insufficient on this program.
- `045-board-card-properties` — **Opened 2026-09-04, Level 2** (`recommend-level.sh --loc 450 --files 10 --db` -> 46/100; phase score 0/50). From the operator, verbatim: *"Also make it possible to adjust visible properties in board card like notion"*. Measured at opening: a board card has no field model of its own. `board-renderer.ts:1439` reads the same `getVisibleColumns` result the table reads, so hiding a column to tidy the table strips it from every card, and `board-renderer.ts:1478-1483` then removes the title field, the grouped field and every `select`/`status` column by rule. Three implicit inputs, none of them the view's. The phase adds one per-view ordered list with per-field visibility and moves the renderer onto it. Two things can silently go wrong and both are measured rather than tested: an upgrade with no stored list must leave every existing card byte-identical, and a stored list must have zero effect on `038`'s one-to-one reference path, which is why the control sits behind the existing `boardExtensionsEnabled` flag. Gallery is recorded as an open question, not scoped. Exit signal: the operator arranging a card's properties on a phone and reading it as close to Notion's.
- `046-linked-views-notion-parity` — **Opened 2026-09-04, Level 3** (`recommend-level.sh --loc 800 --files 14 --architectural --db` -> 74/100; phase score 10/50). Operator report 42, three asks in one minute: embeds that look like the databases rather than clipped blocks, moving a linked view to another page, and a Notion-like create-linked-view flow. Measured at opening: the embed is already the same renderer — `renderToolbar` (`embedded-database-renderer.ts:1409`) builds real view tabs, which is why the operator's capture shows tabs inside the block. What differs is chrome and capability. Three mechanisms: the up-to-eight-ancestor `note-database-embed-codeblock-host` walk (`:600-611`) boxes and clips it; a `db-header` plus the `db-embed-header-toggle` chevron (`:1724-1745`) give it a duplicate title and a control whose only job is hiding that title; and four read-only gates on `persistMode === "codeblock"` (`:421`, `:433`, `:463`, `:1575`, `:1592`, `:1593`) remove "+ New", cell editing and the chart options. None of the four carries a recorded intent, which is why ADR-001 (may an embed write) is a precondition rather than something the phase discovers. The block format does not change, so the create flow writes the fence `serializeCodeBlockReference` already builds. Exit signal: the operator opening the Overview page and reading the nested views as real databases.

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
- `042-harness-fidelity-and-replay` — landed `7e9fd27`, `5fa0b0c`, `bea1b1c`, `8759399`, `8a79ff8`; the `touch-targets`/`unstyled-links` constructed pass it added found a real defect, fixed and shipped as `a3781ae` in **1.4.10** (a 28px touch floor on the row-insert, gallery-open and timeline-menu buttons). Not operator-relevant. Of the parent's three DONE-table rows this phase targeted, two are now closed: row 3 (chart and calendar week/day renderer coverage — all seven `DatabaseViewType` values constructed, armed controls read 11 reds against their bounds) and row 5 (replay) — `8a79ff8` added the last missing claim, for `7ca6cc2`'s day-scale fixture centring (pre-fix `0`, recorded `574`), so `replay.mjs` now carries 28 claims, `reversed: 0`, and every landed result this program has named carries one. Row 6 (harness-dependency audit) stays open on the fixture passes of five gate lanes (`touch-targets`, `unstyled-links`, `css-lane`, `screenshots-fresh`, `device-parity`); the constructed pass cross-validates two of the five but does not replace their fixture pass. Exit signal met for rows 3 and 5; row 6 carries to `043`.
- `043-constructed-capture` — **Landed (partial)** `2ab4942` + `0af4ca6` + `bf67475` + `425d552`, Level 3, not operator-relevant. `capture.mjs` gained a second, constructed scenario type reusing `042`'s `buildRenderAssertionBundle()`/`runRenderAssertions()` seam: nine constructed scenarios (list, table, board, gallery, calendar's month/week/day, timeline's week scale, chart), 36 captures across two devices and two themes, read in-runtime and reproducing 0 of 312 manifest entries' `pixelHash`/`layoutHash` changed across two detached runs. Seven of eleven planned fixtures carry `fixtureOf`; the 13 that stay fixture-only are named. css-lane (`check-lane.mjs`) and device-parity (`capture-device-parity.mjs`) now read the constructed captures with zero code change, because both already scanned the shared manifest; screenshots-fresh's DECLARED-staleness wiring against a constructed counterpart's `sourceHashes` is still open. Three deviations from the plan: constructed entries share `screenshots/manifest.json` rather than AC-006's separate `constructed-manifest.json`; `fixtureOf` lives on the fixture rather than a `declared-fixtures.mjs` map (AC-007); nine scenarios landed, not thirteen, because `constructed-scenarios.mjs`'s own registry still names only the week-scale timeline entry (T004-T005 widened `ScenarioSpec.scale` on the shared harness, but the constructed-capture registry was not grown to use the other four scales, so the timeline is captured at week scale only). AC-002's readiness negative control is unmet as written and unmeetable through the capture path — the screenshot command flushes pending animation frames before rasterising, so a photograph taken with the wait removed is `pixelHash`-identical to one taken with it present, measured on all four `constructed-calendar-week` entries — and needs an operator ruling rather than another attempt. `0af4ca6`, reconciled onto the list mount fix in `bf67475`, landed T004-T006: `captureData` gives list, board, gallery, calendar and timeline real typed cells (a named, coloured select pill, a checked checkbox, a formatted currency figure, a relation chip) and `obsidian-stub.mjs`'s `setIcon` draws 21 real hand-drawn icon names instead of the diamond placeholder, verified in-runtime by `tools/live/typed-data-assertions.mjs` (3 of 3 typed markers with the option set, 0 of 3 without). `425d552` then landed T027, closing table and chart: `fileViewTableBag`/`embedTableBag` now route through a real `CellRenderer` when `captureData` is on (named select pill, checkbox, currency, date, relation icon), and chart sums a real `number`/`currency` column instead of a flat row count; `typed-data-assertions.mjs` extended to 6 of 6 new markers, red before the change and green after. All nine constructed views now show typed rendering; the fixtures' remaining role for those nine is curated content, not typed-vs-untyped evidence. What stays open is the 13 named fixture-only scenarios (mobile widths, subtask-tree overlays, sparse fields, empty states, toolbar-options popovers, and the chart view's three chrome popovers) — none is one of the seven `DatabaseViewType` values, so row 3 does not depend on them, but they back `css-lane`, `screenshots-fresh`, `device-parity`, `touch-targets` and `unstyled-links`, 5 of the 25 lanes `npm run gate` sums, with no constructed or device counterpart to cross-check against. That makes ticked row 4's "exits 0" partly dependent on hand-authored markup a device would not supply, not merely on the fixture lanes' own greens. Exit signal met for the row-6 dependency's structural half and for all nine views' typed-state/icon half; DONE row 6 stays open (done-audit-8), narrowed a third time to the 13 fixture-only scenarios and the row-4 dependency they carry. **Operator rulings owed:** AC-002's wording (amend to the inside-mount measurement, or accept determinism as the basis), plus device confirmation of reports 29-36 and the five ported surfaces on 1.4.10. **2026-09-04, T028 landed and is now merged to main (`d363456`, reconciled `dc67803`):** all 13 of the named fixture-only scenarios now have a constructed counterpart — three (`table-mobile`/`list-mobile`/`board-mobile`) via a `fixtureOf` declaration onto the existing mobile-device capture already on record, ten via new additive `ScenarioSpec` options (`subtaskTree`, `sparseFields`, `emptyState`, `chartVariant`, `miniCalendar`, and three new `renderer` values calling the real toolbar renderers' own `togglePopover()`). Red-first `constructed-state-assertions.mjs` failed 16 of 16 before, passed all after; two detached runs moved 0 of 352 entries; all 312 pre-existing entries matched committed HEAD exactly. `SURFACE_PHASE=043-constructed-capture npm run gate` and bare `npm run gate` both exit 0, 25 green. Row 6 narrowed a fourth time but deliberately left unticked (D4) — full evidence in `043`'s own `tasks.md` T028, `goal.md`, and `implementation-summary.md`. **Done-audit-9 (2026-09-04T07:20:00Z) re-audited row 6 on the merged tree and it stays open, narrowed a fifth time — from 13 scenarios across five lanes to ten across two.** Measured here: `fixtureOf` now declared 20 times (was 7), manifest 352 entries and 19 constructed scenarios (was 312 and 9), 20 fixture ids paired and 50 unpaired (was 7 and 63). Three of the five lanes are consequently cross-checked for all 13 inside their own input set — `device-parity` 87 pairs (was 77), `screenshots-fresh` 352 entries matching sources (was 312), `css-lane` exit 0. The other two are not: `touch-targets` and `unstyled-links` never read the manifest, and their constructed pass iterates `render-assertion-bundle.mjs`'s 21-entry `SCENARIOS`, which carries none of T028's new `ScenarioSpec` fields or its three toolbar `renderer` values — both lanes ran at exit 0 with constructed counts still at 21 and both JSON records field-for-field identical to `425d552`, before T028. `table-mobile`/`list-mobile`/`board-mobile` are covered in-lane anyway, since `touch-targets` mounts its constructed pass at 390x844 with `is-phone`. Closing move: widen `render-assertion-bundle.mjs`'s `SCENARIOS` to the ten state variants (their harness options already exist), then rebaseline `touch-targets-constructed-baseline.json`. **2026-09-04, T029 landed (`122a959`, reconciled `ce72379`, numbers trued up in `65238ad`) and did exactly that; `done-audit-10` re-read row 6 on main at `65238ad` and it stays open, re-scoped rather than narrowed again.** The named residual is closed, measured on that tree: `render-assertion-bundle.mjs` gained a `STATE_SCENARIOS` array and a `SCENARIOS_WITH_STATES` export (**31** = 21 + 10) that both lanes import instead of the bare `SCENARIOS`; `touch-targets` exit 0 with constructed **50462** elements across **31** scenarios and **422** under the 28px floor against a rebaselined **422** (was 21 scenarios and 367/367), the raise attributed per class in `touch-targets-constructed-baseline.json`'s `raiseHistory` and re-measured after the rebase in its `rebaseReconciliation`; `unstyled-links` exit 0 with constructed **72** links across **31** and **0** user-agent-default findings, was **0** links across 21 — so the standing prediction that widening alone would leave that half vacuous is superseded, since 7 of the ten state variants set `captureData` and that is what builds the relation and file-type fields. Two checks that could have kept the row open did not: the three toolbar `renderer` values really are why `SCENARIOS` itself stayed at 21 (`BAGS` holds exactly 13 keys, none of them the toolbar triple, and `render-assertions.mjs:277`/`:279` would throw a `TypeError` on a merged list rather than fail a check), and `render-assertions.mjs` — still reading the 21 — leaves no criterion green on a harness-supplied value, since it refuses DOM without a bundled-renderer provenance marker, its 13 action bags are return-type-annotated against the shipped `*RendererActions` interfaces so `tsc --noEmit` binds them to `src/views`, and its coverage total is read live from `src/views` rather than pinned. **What keeps row 6 open is the fixture half of those same two lanes**, which `done-audit-6`'s `fixtureOf` bound set aside rather than closed: both exit codes still require a fixture pass over **71** hand-authored scenarios, **20** of which carry `fixtureOf` and **51** of which do not, and **42** of those 51 are the `panel-*`, `chrome-*`, `field-*` and popover families that no constructed scenario in either lane mounts at all — neither lane reads `fixtureOf`, which is consumed only through `screenshots/manifest.json`, so the constructed pass supplements the fixture pass without validating any individual fixture. One evidence caveat found by that audit: HEAD's committed `tools/live/touch-targets.json` (written by the `ce72379` run) reads constructed **50444**/`under` **417** while two runs in the audit both read **50462**/**422** on identical `inputs` hashes with no `src/` commit between them — both clear the baseline, but the baseline equals the higher value, so the ratchet sits on its ceiling. `completion_pct` stays 4 of 7 = 57. **A T030 leg is now running on `worktrees/028-constructed-chrome`** (branched from `57b96e8`, an ancestor of main), constructing the `panel-*`/`chrome-*`/`field-*` families — 42 of the 51 `fixtureOf`-less fixtures — that keep row 6's fixture half open; in progress, not landed. **2026-09-04, T030 landed (`c4c7466`+`64db8d5`+`6fa715e`, trued up onto main's gantt and board fidelity passes in `d94e11f`/`2506bb2`/`2242fa0`) and `done-audit-11` re-read row 6 on main at `2242fa0` — the row TICKS, and the parent DONE table goes 5 of 7 = 71.** T030 gave 46 of the 51 `fixtureOf`-less fixtures a production-mounted constructed counterpart: 26 new `ScenarioSpec.renderer` values (toolbar, its popovers, the anchored filter/sort/view-config/column-manager panels, record detail/peek, the cell editors, date/icon/colour pickers, relation and file fields, number displays, dropdown, empty state, column header, group-selection controls, card covers), 13 additive options on the existing board/gallery/table/toolbar branches, and 43 new capture scenarios each declaring `fixtureOf`; 172 new captures were opened and read beside the fixture each supersedes. Measured here rather than carried: **71** fixtures, **66** with `fixtureOf`, **5** without — 51 -> 5. Both lanes' constructed pass went **21 -> 31 -> 73** scenarios (`SCENARIOS` 21 + `STATE_SCENARIOS` 52 = `SCENARIOS_WITH_STATES` 73), so it is now WIDER than the 71-fixture pass it supplements. `touch-targets` `$?` `0` on three consecutive runs with identical output — constructed **24788** elements across **73** and **1223** under the 28px floor against a baseline of **1223** (was 422/422 across 31), fixture **1123/71/199** against 279 (was 1450/71/264, the drop being main's board and gantt ports moving `styles.css`); `unstyled-links` `$?` `0` — constructed **1476** links across **73**, **0** user-agent-default findings (was 72 across 31). `done-audit-10`'s "the ratchet is decided by timing" caveat is retired at its cause: T030 added the body-portal teardown sweep that had each scenario measuring the previous one's stacked panels. **The five that cannot be constructed** — `panel-computed-cleanup-modal`, `panel-invalid-events-modal`, `panel-base-import-modal` (all `DbModal extends Modal`, which `obsidian-stub.mjs:202` refuses as out-of-scope), `chrome-selection-status-bar` (a `MarkdownRenderChild` host with mid-gesture selection state) and `board-drop-language` (drag classes added only by live `dragstart`/`dragover` handlers) — do not keep the row open, because the criterion is conjunctive and asks for a harness value *a device would not supply*. Two of them reach a lane only as 2 and 3 of the 199 undeclared under-floor rows, which consume ratchet headroom rather than create it; one contributes nothing; the status bar's product claims are asserted on production output by the placement lane. Only `board-drop-language` is load-bearing (`replay.mjs:600`, held on exact equality), and the two class names it supplies are asserted on a real `BoardRenderer` under real drag events by `board-renderer-parity.test.ts` in the `tests` lane. The five stay a **coverage** limit — a red the corpus cannot raise — recorded against row 3's ledger rather than absorbed by the tick. One correction the audit made to `done-audit-10`: its leg (b) does not hold, because the 13 action-bag annotations live in `render-assertion-harness.ts` and **no gate lane typechecks them** (root `tsconfig.json` includes `src/**/*.ts` only; `lint:tools` runs eslint over `tools/**/*.mjs`); the conclusion survives on its other two legs plus `done-audit-7`'s inertness finding. `completion_pct` moves to **5 of 7 = 71**; rows 1 and 2 (operator device confirmation) are now the only open rows.
- `019-card-field-value-formatting` — **Shipped + verified, awaiting device — 6 of 7.** Tests written, parity check added and observed red. The scope question is answered: the parent's exclusion sentence now names the formula editor as its surface, so this phase is in scope where it sits. Exit signal: the operator comparing the figure on a card against the table row behind it.
- `010`, `011`, `013` — shipped and self-verified, none operator-confirmed. Exit signal: the operator installs 1.3.3 and reports per surface.
- **The recapture debt — CLOSED.** The captures were regenerated and `screenshots-fresh` is green. `npm run gate` now runs **16 lanes and exits 0**, up from 13 lanes exiting 1: the two added since are `render-assertions`, which builds real `ListRenderer` and `TableRenderer` instances, and the repaired `placement`, which had been printing zero checks because one throwing check destroyed all 205 others before any of them reported.
- **The scaffold debt — CLOSED for 27 of 29 folders.** `010` through `017` all carry `plan.md` and `tasks.md`, every spec and goal carries its template marker and anchors, and `012`'s continuity block measures 1,481 bytes against the 2,048 cap. The parent validates at Errors: 0, Warnings: 0.
  Two folders remain, both honestly: `000` needs the `implementation-summary.md` its nine checked tasks make mandatory — all nine verified against the tree first, so the document rests on evidence rather than assertion. `007` cannot reach zero at all: it declares itself off-path and has no `spec.md`, `plan.md` or `tasks.md` by design, so the validator checks it as a child and reports files that were never meant to exist. Writing them would produce three documents whose only reader is the validator.
- **One warning this reconciliation introduced.** Adding `018` gives `017` a numeric successor it does not reference, so `PHASE_LINKS` went from 14 issues to 17 — one of the three is this pass's, and the other two arrived when `016` gained a `spec.md`. The fix is a line in `017`'s phase-chain blockquote, and `017` is held by a live agent, so it was left rather than written into.

**Later:** the structural phases the program declared first and ran last.

- `009-live-verification` — instruments exist (`tools/live/probe.mjs`) but no criteria are recorded as met. It was declared phase 1 and has not gated anything.
- `000-surface-contract-and-truthful-harness` — its census instruments exist and one edit shipped with a recapture debt. Continuity reads 0%.
- `001` — the overlay census has not run; the factory question was settled by deleting it (§7.2).
- `002-properties-panel` — **Shipped + verified, awaiting device — 6 of 7.** Held the lane nine times with substantial edits while continuity read "not started". The geometry row is now measured on the shipped renderer at both viewports: one grid track with every laid-out child inside its band, and 30px against a 36px ceiling where the failing value was 52px. The clause recorded as undecidable turned out not to be — the host's `--input-height` is declared now, read from the installed app stylesheet, and it moved `layoutHash` for 0 of 240 captures. Exit signal: the operator reading every property name on a phone.
- `006-record-open-target` — **Shipped + verified, awaiting device — 6 of 7.** The setting, the resolver and every measurement were outstanding and are now in: `recordOpenTarget` on `PluginSettings` with five options and `panel` as the unset default, one `resolveRecordOpenTarget` that folds by platform and anchor, and fourteen call sites routed through a single opener — including the Open button's hardcoded touch branch and `Mod+Enter`, which had no touch guard and disagreed with the button beside it. Driven in the placement lane: five settings produce five distinct surfaces, and a control that ignores the resolver collapses all five to one. Exit signal: the operator clicking Open and reading the note.
- `008-integration-and-release-observability` — **Deliverable A shipped**: `tools/live/replay.mjs` exists and `npm run replay` re-asserts 8 results against recorded pre-fix numbers. The lane now refuses a release that leaves a changed capture unnamed — observed red at exit 1 on an unnamed PNG and green once the release names it, so the *per-image sign-off still owed* that ended every release note is a gate rather than a promise. The release decision stays last.
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
- `025-story-coverage-blindness` — **Shipped + verified, awaiting device — 9 of 10.** The
  sentence this bullet used to carry — *the gate lane named `story-coverage` runs the DOM-shim
  checker* — was the defect, and it was fixed: `tools/gate.mjs:58-59` now carries `shim-coverage`
  and `story-coverage` as two distinct lanes running two distinct scripts. The substituted control
  has been replaced by the specified one: the tree as received was reconstructed with `git archive`
  and both matchers run against it — narrow names 1 blind module, widened names 14, and the 13 it
  adds are the phase's thirteen exactly, so the recorded 13-versus-14 gap was arithmetic rather than
  disagreement. Open: the operator opening the catalogue.
- `026-production-render-assertions` — **Shipped + verified — 9 of 9.** `render-assertions` is a
  gate lane (`tools/gate.mjs:67`) and renderer coverage stands at 6 of 22. This phase owes no device
  confirmation: its deliverable is a check in the gate, and the gate is where it is confirmed. Its
  own `spec.md` read *Draft — nothing built* while that lane was green.
<!-- /ANCHOR:now-next-later -->

### 5.A Every phase 000-049, and where each one stands

**Read this before the three schedule headings above.** §5's *Now / Next / Later* groups phases by
when they are worked and several of its bullets are shipped; §5.0's board is a dated computation
that stops at `035`; §5.1's status table stops at `028`. This is the whole tree at one moment.

**It is numbered `5.A` rather than `5.4` on purpose.** §5.0 to §5.3 are cited by number from inside
this file and from `020`'s own documents, and renumbering them to make room would break those
citations silently.

**Regenerate the figure column, and prefer its output to the table below:**

```sh
for d in specs/005-component-surface-system/0*/; do
  f="$d/goal.md"; [ -f "$f" ] || continue
  t=$(grep -c '^- \[' "$f"); x=$(grep -c '^- \[x\]' "$f"); [ "$t" -eq 0 ] && continue
  printf '%3s%%  %2s/%-2s  %s\n' "$(python3 -c "print(round($x/$t*100))")" "$x" "$t" "$(basename $d)"
done | sort -n
```

| Phase | Derived | State | Where it stands, 2026-09-05 |
|---|---|---|---|
| `000-surface-contract-and-truthful-harness` | **50%** — 5/10 | Partially shipped | `.db-surface` on both token roots, census instruments under `tools/live/`. Four harness-reachable rows open plus the operator's; `009`'s live number does not exist to agree with. |
| `001-overlay-placement-and-menu-language` | **89%** — 8/9 | Shipped + verified, awaiting device | Owned menu chromed, portal-unrecoverable 537 -> 0, `openSurface` deleted (§7.2). Census never ran. One row left, the operator's. |
| `002-properties-panel` | **86%** — 6/7 | Shipped + verified, awaiting device | Nine lane holds. Geometry measured on the shipped renderer at both viewports: one grid track, 30px against a 36px ceiling, failing value 52px. One row left, the operator's. |
| `003-mobile-sheet-presentation` | **88%** — 7/8 | Shipped, class reopened by reports 34-36 | Portal, scrim, single fill, grab band all landed. Stays the sheet **contract owner** for `044`. One row left, the operator's. |
| `004-checkbox-ownership` | **88%** — 7/8 | Shipped + verified, awaiting device | Three host profiles against 250 fixture checkboxes; found and fixed a shipped 2.30:1 contrast defect, now 3.09:1 or better. One row left, the operator's. |
| `005-content-row-rhythm` | **86%** — 6/7 | Shipped + verified, awaiting device | List-row border-box, meta ruled into columns, renderer-declared tracks. One row left, the operator's. |
| `006-record-open-target` | **86%** — 6/7 | Shipped + verified, awaiting device | `recordOpenTarget` with five options, one resolver, fourteen call sites routed through a single opener. One row left, the operator's. |
| `007-architecture-research` | **100%** — 2/2 | Complete, off-path | Not a program phase. 10 iterations plus synthesis; consulted, not scheduled. 2 of 2. |
| `008-integration-and-release-observability` | **60%** — 6/10 | Deliverable A shipped | `tools/live/replay.mjs` exists and the lane refuses a release that leaves a changed capture unnamed. Part B and the red-review rehearsal are open. |
| `009-live-verification` | **33%** — 2/6 | Instrument built, nothing gated | `tools/live/probe.mjs` exists; it cannot open the real app from this repository. Four rows open, and the operator's device is what closes them. |
| `010-sheet-reading-and-keyboard` | **92%** — 11/12 | Shipped + verified, awaiting device | Sheet reading and the keyboard lever. One row left, the operator's. |
| `011-mobile-menu-presentation` | **91%** — 10/11 | Shipped + verified, awaiting device | Mobile menu presentation, before/after from a detached worktree. One row left, the operator's. |
| `012-mobile-touch-semantics` | **90%** — 9/10 | Shipped + verified, awaiting device | 87 of 88 placement checks, one declared red. One row left, the operator's. |
| `013-add-view-sheet` | **92%** — 11/12 | Shipped + verified, reopened in effect by report 43 | Six defects adjudicated. It met its own criteria, which never included conformance to a sheet grammar nobody had written — that is `044`'s argument for existing. |
| `014-desktop-select-checkbox` | **86%** — 6/7 | Shipped + verified, awaiting device | AC-1 to AC-3 with a two-way negative control. One row left, the operator's. |
| `015-desktop-dropdown-placement` | **88%** — 7/8 | Shipped + verified, awaiting device | 30 of 31; the sixth defect declared. One row left, the operator's. |
| `016-sheet-drag-and-audit` | **90%** — 9/10 | Shipped + verified, awaiting device | Report 1 root-caused; all eight sheet asks re-measured on the shipped build. Stays the drag **contract owner** for `044`. One row left, the operator's. |
| `017-touch-row-range-selection` | **91%** — 10/11 | Shipped + verified, awaiting device | Predicate removed from both views, hold gesture added, six negative controls. One row left, the operator's. |
| `018-select-column-affordance-fit` | **40%** — 2/5 | Opened, code landed, mostly unmeasured | Three rows open: the two after-numbers re-run and both negative controls observed red, plus the operator's. |
| `019-card-field-value-formatting` | **86%** — 6/7 | Shipped + verified, awaiting device | Parity check added and observed red; the scope question is answered in this phase's favour. One row left, the operator's. |
| `020-harness-fidelity-repair` | **95%** — 21/22 | Shipped + verified, awaiting device | Grab-band arithmetic corrected (42 -> 48px, 38 -> 44px, both over the 44px floor), test shim and evidence-freshness repaired. One row left, the operator's fixture sign-off. |
| `021-sheet-inline-edit-alignment` | **88%** — 7/8 | Shipped, one editor still off | Number/currency editor 7.6px -> 1.0px; the title rename popover improves 9.0px -> 2.4px and is still wrong, left open rather than quietly claimed. |
| `022-selection-bar-keyboard-docking` | **80%** — 8/10 | Shipped + verified, awaiting device | The bar docks on `--db-keyboard-inset`, which the plugin publishes itself. Open: which host shape the phone is, and the operator seeing a usable bar. |
| `023-record-note-body` | **89%** — 8/9 | Planned, deliberately not startable | The operator has not picked display-only or editable, which decides its size by roughly an order of magnitude. |
| `024-list-view-freeze` | **83%** — 5/6 | Shipped + verified; its operator row answered negatively | AC-6 reads NOT MET in the phase's own words. Exit signal reassigned to `028`. **`006-list-view-deprecation` REQ-007 closes it against the retirement.** |
| `025-story-coverage-blindness` | **90%** — 9/10 | Shipped + verified, awaiting device | `shim-coverage` and `story-coverage` are two distinct lanes now; the substituted control replaced by the specified one. One row left, the operator's. |
| `026-production-render-assertions` | **100%** — 9/9 | Shipped + verified — 9 of 9 | `render-assertions` is a gate lane; renderer coverage 6 of 22. Owes no device confirmation: its deliverable is a check in the gate. |
| `027-sheet-menu-grammar-and-motion` | **93%** — 13/14 | Shipped + verified, awaiting device | Opened for rows 24-25: a non-responsive column-type control and five sheet button/motion/overflow asks. One row left, the operator's. |
| `028-remaining-freezes` | **100%** — 6/6 | Shipped + verified — 6 of 6 | Rows 18-23 closed. `applyGridSemantics` de-quadratified: 4-column arm SUPERLINEAR x1.82 -> LINEAR x0.93, 1,600 rows 22.3ms against 76.7ms. No operator row. |
| `029-numeric-coercion-parity` | **86%** — 6/7 | Shipped + verified, awaiting device | Numeric coercion parity. One row left, the operator's. |
| `030-gallery-view-deprecation` | **67%** — 4/6 | Withdrawn, not removed — **the removal now has an owner** | Migration and importer change carried. The gallery is still renderable by design — that withdraw-then-migrate pattern is `006-list-view-deprecation`'s precedent. **2026-09-05:** the operator ruled the gallery *"should have been deprecated"* and asked for it to be retired completely. The deletion half is not this phase's to grow into — it is `specs/007-gallery-view-deprecation`, a new top-level sibling packet mirroring `006`. This phase stays as the withdrawal it performed. |
| `031-sheet-lifecycle-ownership` | **70%** — 7/10 | Reopened by reports 34-36, fix shipped | The `getPanel()` resolver shipped 0.0.8 onward. The entrance fix landed on main (`c96467c9`, reconciled `4c6b2c78`, recorded `ec24f9a`). **The second bug landed on `branches/001-sheet-webkit` (`9ecb5fff`, re-trued `45a1750d`): a toolbar rebuild behind an open sheet drops the sheet.** Shipped in 0.0.21 (`5af7eef7`); operator to run "Trace sheet lifecycle" / "Copy sheet trace" if it still reproduces. **A THIRD bug in the same class, 2026-09-05, from the 0.0.22 device check:** *"pressing any action in a sheet doesn't work and instantly closes it"* — a tap inside an open sheet dismisses it on iOS. Fix in progress on `worktrees/056-sheet-inside-tap`. This is the named blocker behind twelve deferred §4 rows; it is distinct from the entrance fix and from the toolbar-rebuild drop, both of which landed and shipped. |
| `032-cover-target-scheme-safety` | **100%** — 4/4 | Shipped + verified — 4 of 4 | Cover target scheme safety. No operator row. |
| `033-list-virtualisation` | **83%** — 5/6 | Shipped + verified, awaiting device | Windowed list, bench-only at 48.4ms / 3,000 rows. **`006-list-view-deprecation` REQ-007 closes it against the retirement.** |
| `034-packet-doc-truth` | **100%** — 4/4 | Shipped + verified — 4 of 4 | Packet doc truth. No operator row. |
| `035-visual-pass-product-defects` | **89%** — 16/18 | Shipped + verified, awaiting device | Visual pass product defects; the uncoloured-badge boundary closed at 3.62:1 and 4.29:1. Two rows open, one of them the operator's. |
| `036-obsidian-pm-ui-harvest` | **60%** — 3/5 | Complete as research; its output is five phases | The 20-iteration harvest merged and its citations were spot-checked. It is why `037`-`041` exist. |
| `037-timeline-gantt-port` | **50%** — 10/20 | Landed and shipped; reopened, then closed in-repo | Gantt 1:1 copy through 0.0.17/0.0.19/0.0.20; AC-007's in-repo half MET at `30c4b746` (60/60 `pm-gantt-*` classes, zero divergence). **Open: AC-007's operator half (row 38) and the overpaint ruling (row 39, decided and shipped in 0.0.21 at `1358927`).** Its reference captures landed (`295401ad`, reconciled `04814e24`); a fresh in-repo side-by-side against them (`565d86d0`) found zero fidelity gaps on the gantt — its two remaining differences (bar/label-dot colour, phone label width) are dispositions, not defects. |
| `038-board-kanban-port` | **30%** — 3/10 | Landed and shipped; reopened, then closed in-repo | Board 1:1 copy through 0.0.16/0.0.18/0.0.19/0.0.20; T12's in-repo half MET at `c563f08` (fourteen carried-forward elements matched to the pixel). **Open: T12's operator half (row 37).** The same fresh in-repo side-by-side (`565d86d0`) found line-height-driven gaps on the board: `.note-database-container`'s inherited 1.45 line-height inflates the count chip, the column header and the subtask parent line 2-3px taller than the reference, plus uncopied `::-webkit-scrollbar` rules for the board and card list. **Landed** (`74a26419`, reconciled `4df2720c`/`b7dc7cf5`, trued a second time after the card-properties rebase at `53513962`), shipped 0.0.22: `line-height: normal` reset on the kanban host now ships on main; `screenshots/notion-clone/views/constructed-board-desktop-dark.png` read beside `screenshots/project-manager/reference-kanban-desktop-dark.png` confirms the count pill and every card band align. |
| `039-calendar-parity-port` | **83%** — 5/6 | Landed and shipped in 1.4.6 | Calendar parity port. Not operator-confirmed; open defect rows live in `039/goal.md`. |
| `040-subtask-tree-port` | **57%** — 4/7 | Landed and shipped in 1.4.7 | Subtask tree port; the drag-reorder write-path row closed at `535373a`. Not operator-confirmed. |
| `041-shared-ui-ux-port` | **12%** — 1/8 | Landed and shipped in 1.4.6 | Shared UI and UX port; the reduced-motion row closed at `3f143df`+`a251a43`. Seven of eight rows still open on device confirmation. |
| `042-harness-fidelity-and-replay` | **100%** — 6/6 | Shipped + verified — 6 of 6 | Harness fidelity and replay; found and fixed a real 28px touch-floor defect shipped as `a3781ae` in 1.4.10. Not operator-relevant. |
| `043-constructed-capture` | **55%** — 6/11 | Landed (partial) | Constructed capture through T030; parent DONE row 6 ticked at `2242fa0`. **T031, the Project Manager reference captures, landed on main** (`295401ad`, reconciled `04814e24`) under `screenshots/project-manager/`, closing rows 37/38's in-repo half. Five rows open here. |
| `044-phone-sheet-alignment` | **0%** — 0/7 (goal.md checklist not yet ticked; all seven tasks are `[x]` in `tasks.md`) | Landed on main `9436b964`, shipped 0.0.22, Level 2 | Phone sheet grammar for reports 40, 41 and 43, plus the ranked non-conforming instances (table record peek, gantt's owned menu, three suggest modals, `group-order-modal.ts` removed). The settings sheet (`dbdec603`) and column-width sheet (`8bcb11f3`) shipped in 0.0.21; the remaining legs on `worktrees/043-sheet-alignment-2` (grammar contract, shared header, add-view sheet T008, record peek, negative control, recapture) rebased onto the board card properties landing (`56a34199`) and reconciled first as `bdf255cf`, then again as `9436b964` after the line-height fix landed underneath it — an earlier intermediate sha (`dcff742e`) is superseded and is not an ancestor of main. `tools/lane/css-lane.json` kept main's `045` entries then appended this phase's own, `screenshots/manifest.json` merged 552 entries by owner, 47 timeline/gantt/date-picker/byte-noise captures restored to HEAD (real-clock "today" drift, a separate leg's job to freeze), 8 stale `tools/live/*.json` evidence artefacts re-run. `npm run gate` 26/26; AC-001 through AC-005 and AC-007 `Met`, AC-006 (operator) `Unmet`. The one follow-on scope this phase deliberately left out — the settings sheet's own body grammar — **landed as T015** (`worktrees/050-settings-body-grammar`): `settings` registered in `sheet-grammar.mjs` (7 surfaces × 7 elements), the board Cover/Title fixed rows carried onto the same grammar, then reconciled onto main's list-renderer retirement and frozen-clock landings (`npm run gate` 25/25, the lane-count drop owned by that retirement, not this phase). Not operator-confirmed. |
| `045-board-card-properties` | **0%** — 0/6 | Shipped on main `56a34199` (via `ff1dacec`), shipped 0.0.22 | Per-view ordered property list for board cards, behind the existing `boardExtensionsEnabled` flag. Resolver, persisted list and Properties panel landed, rebased onto main clean (`npm run gate` 25/25). AC-005/T013 wait for `044`'s sheet-grammar lane to exist before they can be checked — it now does. **Both open questions were answered by the operator 2026-09-05 and recorded as `decision-record.md` ADR-001 and ADR-002:** the gallery does not share the mechanism (it is retired outright by `specs/007-gallery-view-deprecation`), and hiding a card field does not hide it in the table — cards only. AC-006 stays the single open row and is deferred with the twelve above, because the 0.0.22 check could not reach the Properties sheet. |
| `046-linked-views-notion-parity` | **0%** — 0/7 (goal.md checklist not yet ticked; 2 of 7 acceptance criteria are `Met`) | Opened 2026-09-04, Level 3; ADR-001/ADR-002 Accepted 2026-09-05, capability partially landed on main (`ec893e67`) | Linked views to Notion parity, from report 42. ADR-001 (may an embed write) was decided by the operator 2026-09-05 ~05:30 CEST, verbatim: "Allow db writing from linked views" — full parity, an embedded view writes to its source database exactly as the standalone view does (cells, rows, status/board moves, view config), undo through the same history stack, read-only only when the source is missing or unresolved. **Landed** (`ec893e67`, reconciled `e544a2c5`): the duplicate title and collapse chevron are gone, and the four `persistMode === "codeblock"` read-only gates are now one `isViewReadOnly()` seam (10 → 3 survivors, all presentation) — AC-003 and AC-006 `Met`. Move-to-page, create-from-picker and the sixteen-shape round trip are code-complete but unmeasured on a device — AC-004/AC-005 `Unmet`. The card border and embed width are still untouched in `styles.css`, pending `T002`'s unanswered host-layout question against real Obsidian — AC-001/AC-002 stay `Unmet`. `T016` (ship the write capability behind a settings flag, per `checklist.md` CHK-121) is a fresh operator call, not yet asked. AC-007 is the operator's own read of the Overview page. |
| `047-competitor-references-and-pm-alignment` | **0%** — 0/6 | Opened 2026-09-05, Level 2, standard child | The rows 37/38 *"align closer"* ruling, and the competitor references the operator asked for in the same breath. Two legs: (a) **Anytype** and **AppFlowy** captures — boards, tables, calendar, timeline — from BOTH the official product images AND the apps installed locally through Homebrew casks, saved under `screenshots/anytype/` and `screenshots/appflowy/` with manifest entries matching `screenshots/project-manager/`'s style; (b) a fidelity pass on the board and gantt against Project Manager, with in-repo comparison criteria in the style `037`'s AC-007 and `038`'s T12 used. `recommend-level.sh` 53/100 confidence 92%, phase score 10/50 — below the 25 threshold, so a standard child rather than a phased packet. 0 of 6. |
| `048-stacked-sheets` | **86%** — 6/7 | Code complete 2026-09-05, Level 2, standard child | From the 0.0.23 device check, §4 rows 44-46, all three now FIXED. The mechanism was an absence and it is now present: `overlay-stack.ts`'s `parentId` is load-bearing, one mount pass owns per-depth z-index, the parent's dim and pull-back, a zero inset below the top and the single scrim between the top two. Every stacked child carries `044`'s header — K1 through the dropdown module, K3 through the shared modal chrome for all 19 `DbModal` subclasses, K4 for the three suggest modals; K2, K5 and K6 were already closed by `044`'s leg and the gantt landing. **D1 ACCEPTED** (`048/decision-record.md` ADR-001): modals opened from a sheet present as sheets, which also settles the `fullscreen` arrangement. `sheet-grammar` carries **31 stacked pairs**, three at depth 3, and the same lane reports **253 failing assertions against the pre-fix tree and 0 against this one**; `npm run gate` `$?` **0**, 25 lanes green. Three defects the reports did not name were found and fixed at their producers: the dim was written and never rendered, a press inside a child closed its parent, and re-placing a parent detached it. **6 of 7 — the open row is AC-009, the operator's own device check, which ships in 0.0.24 and which nothing in this repository can close.** |
| `049-test-environments-and-mock-data` | **0%** — 0/8 (5 of 8 goal criteria are ticked; the figure counts `- [` lines and the three open rows are the operator's, Anytype's and AppFlowy's) | Opened 2026-09-05, Level 2, standard child; Obsidian leg landed | From the operator's 2026-09-05 ask: *"first set similar test environment like Obsidian, add a lot of mock data, various use cases not just finance data; do same for AppFlowy; and upgrade test environment Obsidian."* The comparison work had been running against three different data sets — this plugin held **one** database of 29 finance-flavoured records, and the competitor captures photographed whatever those apps ship as demo content — so any difference could always be explained away as a difference in the data. `tools/mock-data/` now builds **one** catalogue: ten use cases, **326** records, 28 columns and five views each, all thirteen `ColumnDef` types plus the five display variants exercised in **every** use case. Three emitters translate it and none of them invents: Obsidian notes, a product-neutral `catalogue.json`, and one CSV per use case. **The Obsidian leg is landed** — 336 files written under ten new folders beside the existing Testbed, the 31 pre-existing files byte-identical afterwards (`sha256` before and after, `changed: 0`), a second run reporting `0 written, 336 already current`, and all ten databases mounted in the shipped `TableRenderer` at 1440px with every capture opened. Both negative controls were armed and observed red first: `Math.random()` in the seeded stream reddens determinism, suppressing a facet reddens coverage. **Two honest gaps:** computed and rollup cells photograph empty, because both are evaluated by the data pipeline against a live vault and the capture constructs a renderer with no `App`; and `tools/` sits outside `tsconfig.json`'s `include`, so `tsc --noEmit` does not typecheck the generator, exactly as it does not typecheck `tools/live/` or `tools/bench/`. D2: five view types, not seven — `list-renderer.ts` is gone and gallery is being withdrawn by `007`, so ten generated gallery views would be fresh configuration for a surface whose migration is in progress. AC-007 (Anytype) waits on the CDP session `047`'s leg owns, AC-008 (AppFlowy) on an operator window, AC-009 on a device. 5 of 8. |
| `050-anytype-adoption` | **0%** — 0/8 | Opened 2026-09-05, Level 3, standard child | From the operator's ruling on `047`'s research — *"I find Anytype to have amazing UI/UX"*. `047` read `anytype-ts`, `anytype-kotlin` and the official docs across 20 iterations, produced 89 findings, and ranked **14 file-scoped adoption items** by fit against `src/views/*` in its §11, none of which needs new architecture. This phase lands all fourteen: the filter/sort chip row with dual-mode trigger icons (rank 1), landing in view settings within 100ms of a view being created (2), a board scrollbar sticky to the viewport rather than to the board (3), duplicate-view plus a view-tab context menu (4), per-view scroll restore within ±2px (5), a cell-editor flip within 92px of the right edge (6), a sort-conflict confirmation on manual drag reorder (7), capability-gated menus that are never empty (8), the two empty-state flavours plus the deleted-relation state (9), per-view new-row presets (10), `positionLock` while a name is typed in a sorted view (11), a measured toolbar collapse for embedded views (12), per-format filter rows on phone sheets (13, High/mobile), and an inline "Load more" row (14). **Implementation WAITS on the Anytype capture sweep** — goal D1 makes T001 a gate, because `047`'s ranking is code-derived and `screenshots/anytype/README.md` records that the first capture pass reached **no mouse-driven surface at all** (raw `CGEvent` clicks had no effect, `System Events` was refused assistive access -25211, the canvas is one opaque `AXGroup`), leaving items 1, 4, 6, 7, 8 and 10 with no reference screen. Nine legs grouped by file so each is opened once (D7); `044`'s grammar, `048`'s stacking model and `038`/`037`'s Project Manager 1:1 parity are constraints it may not regress (D4, D5). `recommend-level.sh --loc 1500 --files 16` → 51/100 confidence 90% (Level 2, raised to **3** on judgment), phase score **20/50** below the 25 threshold, so a standard child |

**Program: 306/409 = 75%**, derived across all 47 phases on 2026-09-04. The figure
is `ticked / total` over each phase's own `goal.md` checklist (§3.2), never judged. It is **not**
comparable to §5.0's 240/299: that board covered `000`-`035` on 2026-09-01, and eleven phases plus
several new rows have landed since. **This figure is stale as of 2026-09-05**: `047` opened with
6 unticked rows, so the denominator is now 415 and the percentage falls to 74 without any work
having gone backwards. Regenerate it with the loop above rather than trusting either number.

**Six phases have nothing left**: `007`, `026`, `028`, `032`, `034`, `042`. Every other phase's
residual is dominated by one row nothing in this repository can close — `operator-checklist.md`
gathers all 109 of them in one place.

**Three phases opened 2026-09-04 from the operator's evening pass** (reports 40-43): `044` has
fully landed on main (`9436b964`, shipped 0.0.22, `npm run gate` 26/26) — the settings and
column-width sheet legs shipped in 0.0.21 and its remaining legs (grammar contract, shared header,
add-view sheet, record peek, gantt's owned menu, suggest modals) reconciled after
`worktrees/043-sheet-alignment-2` rebased onto the board card properties landing, then again after
the line-height fix landed underneath it; `045` shipped on main (`56a34199`, shipped 0.0.22); `046`'s
ADR-001/ADR-002 were Accepted 2026-09-05 and its capability leg landed partially on main
(`ec893e67`) — the host-layout question (`T002`) is now what blocks the rest, not the ADR.

**Everything named above through 0.0.22's cut has landed; three new worktrees are in flight since.**
`worktrees/043-sheet-alignment-2` (`044`'s remaining legs) landed as `9436b964`;
`worktrees/044-list-hide-migrate` (`006-list-view-deprecation`'s hide-and-migrate leg) landed as
`f49eda4c`; `worktrees/042-screenshots-folders`, the capture-folder split, landed
(`7d95a882`+`aa049b45`, reconciled `933308a5`) — see §1's Seventh reconciliation note.
`worktrees/045-board-card-properties` shipped on main (`56a34199`).
`worktrees/046-board-line-height` (the board's line-height gaps from the fresh in-repo
side-by-side, §4A row 37/38 continuity) landed and was trued twice more (`74a26419`, reconciled
`4df2720c`/`b7dc7cf5`, trued `53513962`). **All three since landed**: `worktrees/047-list
-remove-renderer` (`006`'s child `007-remove-renderer-and-harness`) landed as `6f2aef3f`, reconciled
`ac7c78ac`; `worktrees/049-bench-frozen-today` (the board/timeline frozen-clock bench and capture
pass) landed as `6bac9ce9`; `worktrees/050-settings-body-grammar` (the settings sheet's own body
grammar) landed as T015 above, reconciled onto both of the other two.

**`007-gallery-view-deprecation` is the second sibling packet, opened 2026-09-05.** It finishes what
`030-gallery-view-deprecation` started, on the operator's ruling that the gallery *"should have been
deprecated"*. `030` withdrew the gallery from every picker and stopped there, by design; `007`
migrates the databases still configured as one and then removes the renderer and every measurement
of it. It is Level 3, phased into four children (`recommend-level.sh` 90/100, phase score 50/50 —
both thresholds met independently), and it mirrors `006-list-view-deprecation`'s shape rather than
inventing one. It reaches into this program at two points: `030` is its predecessor and is not
reopened, and `045-board-card-properties`'s ADR-001 cites it as the reason the gallery does not
share the card-properties mechanism. Its roadmap is `../007-gallery-view-deprecation/roadmap.md`.

**`006-list-view-deprecation` is a sibling packet, not a phase here.** It retires the list view
outright on the operator's 2026-09-04 instruction, using `030-gallery-view-deprecation` as its
precedent. It reaches into this program at three points: its REQ-007 closes `033-list-virtualisation`
and `024-list-view-freeze` against the retirement, and `044-phone-sheet-alignment` asserts that
**List view** has left the Add view picker while `006`'s own `006-hide-and-migrate` performs the
removal. Its own child `005-usage-and-migration-audit` is done (`c98e05ab`: one list view found in
the vault, four declared losses); child `006-hide-and-migrate` is **shipped in 0.0.22** (`8152cf4f`
implemented — a devin pass that ran out of daily quota mid-way, finished by Grok 4.6 via cli-cursor
— landed `e0e1c568`, reconciled `e466696b`, trued `f49eda4c`); child `007-remove-renderer-and-
harness` **landed** (`6f2aef3f`, reconciled `ac7c78ac`, recorded `6dec09b9`) — `list-renderer.ts` is
gone, `list-window` is absent from the gate's 25 lanes rather than present and skipped, and
`033`/`024` are both closed against the retirement; child `008-docs-and-release` has its three
in-repo rows done (changelog, README, no open planning work) and its release row satisfied by
`0.0.23` (`d3979cf5`) — only its operator row (the migrated vault, reported working) stays open,
alongside `006-hide-and-migrate`'s own operator row. Its own top-level checklist reads **7 of 9**
ticked. Its roadmap is `../006-list-view-deprecation/roadmap.md`.

### 5.0 The derived board, 2026-09-01

§3.2 settled that a phase's figure is `ticked ÷ total` over its own `goal.md` checklist, derived and
never judged. This is that computation run across every phase on the date above, so the board and the
tree cannot drift apart without one command showing it.

**Regenerate, and prefer the output to anything written below it:**

```sh
for d in specs/005-component-surface-system/0*/; do
  f="$d/goal.md"; [ -f "$f" ] || continue
  t=$(grep -c '^- \[' "$f"); x=$(grep -c '^- \[x\]' "$f"); [ "$t" -eq 0 ] && continue
  printf '%3s%%  %2s/%-2s  %s\n' "$(python3 -c "print(round($x/$t*100))")" "$x" "$t" "$(basename $d)"
done | sort -n
```

| Phase | Derived | Open | Operator-only | Harness-reachable |
|---|---|---|---|---|
| `000-surface-contract-and-truthful-harness` | **50%** — 5/10 | 5 | 1 | 4 |
| `001-overlay-placement-and-menu-language` | **88%** — 7/8 | 1 | 1 | 0 |
| `002-properties-panel` | **86%** — 6/7 | 1 | 1 | 0 |
| `003-mobile-sheet-presentation` | **88%** — 7/8 | 1 | 1 | 0 |
| `004-checkbox-ownership` | **88%** — 7/8 | 1 | 1 | 0 |
| `005-content-row-rhythm` | **86%** — 6/7 | 1 | 1 | 0 |
| `006-record-open-target` | **86%** — 6/7 | 1 | 1 | 0 |
| `007-architecture-research` | **100%** — 2/2 | 0 | 0 | 0 |
| `008-integration-and-release-observability` | **60%** — 6/10 | 4 | 1 | 3 |
| `009-live-verification` | **33%** — 2/6 | 4 | 1 | 3 |
| `010-sheet-reading-and-keyboard` | **91%** — 10/11 | 1 | 1 | 0 |
| `011-mobile-menu-presentation` | **91%** — 10/11 | 1 | 1 | 0 |
| `012-mobile-touch-semantics` | **90%** — 9/10 | 1 | 1 | 0 |
| `013-add-view-sheet` | **92%** — 11/12 | 1 | 1 | 0 |
| `014-desktop-select-checkbox` | **86%** — 6/7 | 1 | 1 | 0 |
| `015-desktop-dropdown-placement` | **88%** — 7/8 | 1 | 1 | 0 |
| `016-sheet-drag-and-audit` | **90%** — 9/10 | 1 | 1 | 0 |
| `017-touch-row-range-selection` | **91%** — 10/11 | 1 | 1 | 0 |
| `018-select-column-affordance-fit` | **80%** — 4/5 | 1 | 1 | 0 |
| `019-card-field-value-formatting` | **86%** — 6/7 | 1 | 1 | 0 |
| `020-harness-fidelity-repair` | **92%** — 12/13 | 1 | 1 | 0 |
| `021-sheet-inline-edit-alignment` | **88%** — 7/8 | 1 | 1 | 0 |
| `022-selection-bar-keyboard-docking` | **75%** — 6/8 | 2 | 1 | 1 |
| `023-record-note-body` | **89%** — 8/9 | 1 | 1 | 0 |
| `024-list-view-freeze` | **83%** — 5/6 | 1 | 1 | 0 |
| `025-story-coverage-blindness` | **90%** — 9/10 | 1 | 1 | 0 |
| `026-production-render-assertions` | **100%** — 9/9 | 0 | 0 | 0 |
| `027-sheet-menu-grammar-and-motion` | **93%** — 13/14 | 1 | 1 | 0 |
| `028-remaining-freezes` | **100%** — 6/6 | 0 | 0 | 0 |
| `029-numeric-coercion-parity` | **86%** — 6/7 | 1 | 1 | 0 |
| `030-gallery-view-deprecation` | **67%** — 4/6 | 2 | 1 | 1 |
| `031-sheet-lifecycle-ownership` | **83%** — 5/6 | 1 | 1 | 0 |
| `032-cover-target-scheme-safety` | **100%** — 4/4 | 0 | 0 | 0 |
| `033-list-virtualisation` | **83%** — 5/6 | 1 | 1 | 0 |
| `034-packet-doc-truth` | **100%** — 4/4 | 0 | 0 | 0 |
| `035-visual-pass-product-defects` | **83%** — 15/18 | 3 | 1 | 2 |

**Program: 240/299 = 80%.** 59 rows open — 31 closable only by the operator's device, 28 still reachable here.

*The `035` row was added on 2026-09-02, after the 2026-09-01 computation above, and its figure moved
twice the same day: 15 of its 18 rows are ticked, derived from its own `goal.md` checklist, the
fifteenth being the uncoloured-badge boundary its second round closed at 3.62:1 and 4.29:1. The
program totals are re-added to include it. Every other row still carries its 2026-09-01 value, so re-run the
command above rather than trusting the mixture of two dates.*

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
| `020` | absent | **Shipped + verified, awaiting device — 95%, 21 of 22** | **Two derivations, reconciled 2026-09-02, and neither count is deleted.** The **21 of 22 (95%)** here is §3.2's rule run against the packet's `goal.md` completion checklist as it stands today, and it is the figure all four of `020`'s documents carry in `completion_pct`. The **12 of 13 (92%)** that §5.0's derived board and this row previously showed is the *same* rule run against the *same* checklist on **2026-09-01**, when it held 13 rows: verified with `git show fa15cb4:…/020-harness-fidelity-repair/goal.md`, the commit that wrote 12/13 into §5.0, which counts 12 ticked of 13. The list has since grown to 22 rows, 21 ticked. So this is one board figure gone stale against a growing list, not two competing measurements. §5.0's row is left at 12/13 as the dated 2026-09-01 snapshot it declares itself to be, per that section's own instruction to re-run the command rather than trust a mixture of dates. **§3.2's one-number rule binds `completion_pct` in the phase folder's continuity blocks, and the number it binds is 95** — it does not bind this board's cells, which are dated computations. Its own `spec.md` read *Complete* against a `completion_pct` of 80; D3 reserves Complete for operator-confirmed and the one open criterion is the operator's fixture sign-off. Grab-band arithmetic corrected (42→48px add-view, 38→44px owned-menu, both over the 44px floor); test shim, evidence-freshness and in-harness checks repaired alongside it. Lane journal acquire→edit→release 12:05-12:53; commits `9d4f569`, `780a736`, `0a38723`, `1e6397d`, `56ba94e` |
| `021` | absent | **Shipped; 4 of 5 editors verified, 1 still off** | Lane journal, two full acquire→release cycles, 13:19-13:42, "Not committed" at release. Commit `0ff9f9a` centres the number/currency inline editor on its row (7.6px→1.0px claimed). A fresh review, commit `3d4d2f2`, found the fix also reaches a fifth, previously uncounted editor sharing the same popover class — the title's inline rename editor — which improves 9.0px→2.4px off-centre and is still wrong: "left open rather than quietly claimed" |
| `022` | absent | **Shipped + verified, awaiting device — 6 of 8** | This row and the phase's own `spec.md` both read *Planned* after the code landed. `styles.css:2436` docks the bar on `--db-keyboard-inset`, published by `publishKeyboardInset` in `src/views/popover-position.ts`; commit `a0d42a1` precedes the 1.3.9 cut `9e12fe1`, so it is in the build the operator is running. Open: which host shape the phone is, and the operator seeing a usable bar |
| `023` | absent | **Planned, not startable** | Own `spec.md` declares itself Planned and "deliberately not startable" pending an operator choice between a display-only and an editable note body |
| `024` | absent | **Shipped + verified; operator confirmation now answered, negatively** | `acceptance-criteria.md` AC-1 through AC-5 and AC-7 pass with real red-before-green controls on the actual renderer; AC-6 (operator confirmation) reads **NOT MET** in the phase's own words. Row 18 is that criterion closing |
| `025` | absent | **Shipped + verified, awaiting device — 8 of 10** | This row's evidence was the defect, not the state: the `story-coverage` lane now runs `npm run story:coverage` and `shim-coverage` runs the shim checker, two distinct entries at `tools/gate.mjs:58-59`, and the ambiguous package script is gone. Re-run today: **13 of 32 renderable modules carry a story, 19 exempt** — the phase's own table records 13/31 and 18, so its counts have drifted by one module while the property it asserts (0 unanswered) still holds. Open: the substituted control, and the operator opening the catalogue |
| `026` | absent | **Shipped + verified — 9 of 9; controls N1-N6 observed failing** | `tools/live/render-assertions.mjs` + harness; one `CHECKS` entry (`render-assertions`). Bundles the shipped renderers in headless Chrome and asserts structure: red at `173819e^` (1,600 layout reads in the row loop) and green at `845a27c` (2). Coverage is now **6 of 22** stamped at `tools/live/renderer-coverage.json`, and it is committed. Its own `spec.md` read *Draft — nothing built* against a lane that has been green in the gate |
| `027` | absent | **UNKNOWN** | Folder absent from the working tree as of this pass; opened by another agent to investigate rows 24-25; not read per this update's own scope |
| `028` | absent | **UNKNOWN** | Folder absent from the working tree as of this pass; opened by another agent to investigate rows 18-23; not read per this update's own scope |

### 5.2 Planned port phases (from `036`)

**Opened 2026-09-02.** Five phases were opened from `036-obsidian-pm-ui-harvest`'s adoption plan once
its 20-iteration research loop merged and its citations were spot-checked (`036/goal.md` LOG). Each
folder number below was allocated at open time, not foreseen in advance.

Every one of them is a near one-to-one port of `specs/context/obsidian-pm-main` (MIT, Stepan
Kropachev and dotpm contributors), rewritten to this repository's standards under `sk-code` and
merged into our renderers and our data model rather than bolted alongside them. **What stays ours:**
the table view, the bottom sheets, and formulas, rollups and calculations. Those are better here and
are not part of the port.

| Planned phase | Folder | What it ports | Status |
|---|---|---|---|
| 1. Timeline and gantt | `037-timeline-gantt-port` | Their timeline and gantt surface, into our timeline renderer | Landed `0262386` + `55bff9b`, shipped **1.4.4** (**0.0.9**); open-row fixes closed three of four `fa58c7f`+`b29bf7f`, reconciled `65fb7dd`, shipped **1.4.9** (**0.0.14**); the day-scale row closed after that cut, leg `7ca6cc2`, shipped **1.4.10** (**0.0.15**). **Reopened 2026-09-04 for a 1:1 gantt copy at the operator's request** — REQ-007 in `037`'s `spec.md`. The 1:1 copy landed (TypeScript `d30ea78` + CSS `2a6d98f`, merged `972c2cd`/`a00ad31`), released as **0.0.17** (`839712b`). A fresh reviewer (T12's gantt counterpart, AC-007) found real fidelity divergences against the reference; that pass landed too (`119f5936`+`8c563a35`, reconciled `5fd4fc7d`, trued up `6d12740a`), released as **0.0.19** (`07f4500f`), followed by a residual-behaviour leg (week-label modes, the depends-elsewhere menu, add-subtask, undo/redo keys) and a closing leg (eight code + three fixture defects, `9e4d4b04`), both riding **0.0.20** (`ccc946c3`). **AC-007's in-repo half is now MET** by a fresh reviewer (`30c4b746`, `037/tasks.md` T048): 60/60 `pm-gantt-*` classes match with zero divergence, the CSS copy is byte-faithful, geometry matches exactly. That same read surfaced one operator-only ruling, not a defect: whether to keep the reference-faithful milestone-label/month-band overpaint on the default render path or reinstate a local fix (row 39 above). Not operator-confirmed on device. Open: AC-007's operator half (row 38) and the overpaint ruling (row 39) — both the operator's alone |
| 2. Board | `038-board-kanban-port` | Their board surface, into our board renderer | Landed `b9e2321` + `a6fcd31`, shipped **1.4.5** (**0.0.10**); hover/drag/drop-target/empty-column row closed `7e36671`, shipped **1.4.8** (**0.0.13**). **Reopened 2026-09-04 for a 1:1 board copy at the operator's request** — REQ-007 in `038`'s `spec.md`. The 1:1 copy landed (TypeScript `1c5f465` + CSS `4b4b404`, merged `854c748`), released as **0.0.16** (`46a8525`). A fresh reviewer (T12) found real fidelity divergences against the reference — an inline-color palette, a left-aligned due chip, a stray "Sub" chip, missing badge icon/priority strip/milestone/recurrence chips/due-soon tier, unscoped selectors, an extra 24px host inset; that pass landed too (`a6abd0a9`+`cb6ef827`, reconciled `01883cf8`, trued up `b1e75124`), released as **0.0.18** (`96f878a5`), with its own closing fixes riding **0.0.19**/**0.0.20**. **T12's in-repo half is now MET** by a fourth fresh reviewer (`c563f08`): all fourteen carried-forward elements matched to the pixel against the reference source; T12 itself stays unticked. Not operator-confirmed on device. Open: T12's operator half (row 37) — the operator's alone |
| 3. Calendar | `039-calendar-parity-port` | Their calendar surface, into our calendar renderer | Landed `57043e7` + `1588576` + `d8a2508`, shipped **1.4.6**. Not operator-confirmed; open defect rows live in `039`'s `goal.md` |
| 4. Subtask model | `040-subtask-tree-port` | Their subtask model, into our data model | Landed `1d611db` + `00b7bd2`, shipped **1.4.7** (`214f6bd`); drag-reorder write-path row closed `535373a`, riding **1.4.8** (pending). Not operator-confirmed; open defect rows live in `040`'s `goal.md` |
| 5. Shared UI and UX | `041-shared-ui-ux-port` | Their shared primitives, composites and interaction grammar | Landed `cb9aedf` + `25ae3a9`, shipped **1.4.6**; reduced-motion row closed `3f143df`+`a251a43`, reconciled `471860d`, riding **1.4.9** (pending). Not operator-confirmed; open rows in `041`'s `goal.md` now closed |

The research runs in a worktree, `.worktrees/003-obsidian-pm-harvest` on branch
`worktrees/003-obsidian-pm-harvest`, so the main checkout stays free for the in-flight lanes. The
untracked `036/research/` directory in the main checkout is residue from a rejected launch and is
not evidence of anything.

**All five port phases opened above have now landed on `main` and shipped.** `037` at
`0262386`+`55bff9b` (1.4.4), `038` at `b9e2321`+`a6fcd31` (1.4.5), `039` at `57043e7`+`1588576`
(reconciled `d8a2508`, 1.4.6), `041` at `cb9aedf`+`25ae3a9` (1.4.6), and `040` at `1d611db`+`00b7bd2`
(1.4.7, cut `214f6bd`). None of the five is operator-confirmed; each packet's own `goal.md` carries
its own open defect rows. `038`'s hover/drag/drop-target/empty-column row and `040`'s drag-reorder
write-path row have since closed (`7e36671`, `535373a`), riding release **1.4.8** (pending, cut in
a separate clone); the table above reflects both.

### 5.3 Release cadence

Each verified milestone is pushed to `origin main` and cut as a GitHub release, so the operator can
install it on the phone. **The version scheme was renumbered on 2026-09-04**, at the operator's
request to "renumber our history": the fork point is `pangy9/obsidian-note-database` at upstream
1.2.8, whose seventeen upstream tags (1.0.0-1.2.8) were removed from `origin`, and our fifteen
post-fork releases were re-tagged on the same commits and recreated on GitHub with the same builds —
only the asset manifest's version field was rewritten, nothing was rebuilt. Every prior release is
renamed, not replaced: 1.2.8-euro.1→**0.0.1**, 1.2.9→**0.0.2**, 1.3.0→**0.0.3**, 1.3.1→**0.0.4**,
1.4.0→**0.0.5**, 1.4.1→**0.0.6**, 1.4.2→**0.0.7**, 1.4.3→**0.0.8**, 1.4.4→**0.0.9**, 1.4.5→**0.0.10**,
1.4.6→**0.0.11**, 1.4.7→**0.0.12**, 1.4.8→**0.0.13**, 1.4.9→**0.0.14**, and 1.4.10→**0.0.15**
(the last renumbered release; **0.0.16** has since been cut on top of it).
`manifest.json`/`package.json`/`versions.json` on `main` read **0.0.17** today (`839712b`; they read
0.0.15 at `6f81eb8`, when the renumbering landed), and the iCloud install now reads **0.0.17** too,
with a backup of the pre-rename 1.4.10 manifest still beside it. **0.0.16 is cut** (`46a8525`),
carrying `038`'s board one-to-one copy — TypeScript leg `1c5f465`, CSS leg `4b4b404`, merged and
reconciled onto main in `854c748`. **0.0.17 is cut** (`839712b`), carrying `037`'s gantt one-to-one
copy — TypeScript leg `d30ea78`, CSS leg `2a6d98f`, merged and reconciled onto main in
`972c2cd`/`a00ad31`. Both are installed to the iCloud vault. **0.0.18 is cut** (`96f878a5`),
carrying `038`'s board fidelity pass — the divergences T12's fresh reviewer found against the
reference, landed `a6abd0a9`+`cb6ef827`, reconciled `01883cf8`, trued up `b1e75124`. **0.0.19 is
cut** (`07f4500f`), carrying `037`'s gantt fidelity pass (`119f5936`+`8c563a35`, reconciled
`5fd4fc7d`, trued up `6d12740a`) together with the board's own closing fixes — the kanban height
chain, due-tier and badge-icon fidelity (`2cddc7cf`+`d896f90e`) and the responsive host padding,
photograph avatars and milestone chips (`595dc283`+`7d5b3f90`, reconciled `fe42955d`).
`manifest.json`, `package.json` and `versions.json` on main read **0.0.19**, and both tags are on
`origin`. **0.0.20 is cut** (`ccc946c3`), carrying: `037`'s gantt residual-behaviour pass — week-label
modes, the depends-elsewhere menu, add-subtask through the record-creation path, and the reference's
document-level undo/redo keys (`3c3d7123`, reconciled `1a6c8123`) — and its closing leg — persistence
for two settings, the slot-duration gate, and the AC-007 reviewer's eight code plus three fixture
fixes (`6d4b6223`, reconciled `999ea1c8`); `038`'s board T12 in-repo half MET by a fourth fresh
reviewer (`4565ece9`, reconciled `4d7b657f`) and its host-inset fix (`595dc283`, reconciled
`fe42955d`); `043`'s constructed panel/chrome/field fixture families, closing the parent DONE table's
row 6 (`c4c74669`, reconciled `6fa715e5`/`2506bb2f`/`2242fa0a`, ticked `a78000ce`); and a full-tree
capture refresh that returned `screenshots-fresh` to green (`349e22c4`). `manifest.json`,
`package.json` and `versions.json` on main read **0.0.20**, and the tag is on `origin`. **0.0.21 is
cut** (`5af7eef7`), carrying: `031`'s WebKit sheet fix — the toolbar-rebuild second bug, the dead-
anchor drop fix (`9f31bf6f`), the retained-node rebuild (`8140a1ae`), the pointerdown-only
dismissal (`efb5b54f`) and the `debugSheetTrace` device report (`c12817a8`), landed `9ecb5fff` and
re-trued at `45a1750d`; `044`'s settings sheet fix, root-caused to the sheet scrolling its own
chrome out of reach (`dbdec603`, recorded `355d24ff`); `044`'s column-width sheet fix, a shared
keyboard-aware bottom sheet (`8bcb11f3`, recorded `e494be00`); `037`'s reinstated local
milestone-label anti-collision fix (`1358927`); and the Project Manager reference captures under
`screenshots/project-manager/` (`295401ad`, reconciled `04814e24`), closing rows 37 and 38's
in-repo half. `manifest.json`, `package.json` and `versions.json` on main read **0.0.21**, the tag
is on `origin`, and the iCloud install reads **0.0.21** too — the `.backup-0.0.21-preview` beside
it is a superseded pre-release build, not the shipped one. **0.0.22 is cut** (`7b976e28`), carrying
six lanes landed after 0.0.21's own cut: the symlink-safe ignore check (`6328c9cb`, `classifySource`
now resolves a worktree's `specs/context` symlink before asking git whether a vendored source is
ignored); `006-list-view-deprecation`'s child `006-hide-and-migrate` (`e0e1c568`, reconciled
`e466696b`, trued `f49eda4c`) — List view hidden and existing list views migrated;
`045-board-card-properties` (`a79d7421`, reconciled `ff1dacec`, trued `56a34199`) — a per-view
ordered property list for board cards; the kanban line-height fix trued a second time after the
card-properties rebase (`b7dc7cf5`, `53513962`); and `044-phone-sheet-alignment`'s remaining legs
(`2c0902fc`,
reconciled `bdf255cf`, reconciled again as `9436b964` after the line-height fix landed underneath
it) — `sheet-grammar` is now a registered gate lane, 21 → 26. `manifest.json`, `package.json` and
`versions.json` on main read **0.0.22**, the tag is on `origin`, and the iCloud install reads
**0.0.22** too. **0.0.23 is cut** (`d3979cf5`), carrying every lane the Tenth reconciliation note
above lists: the sheet-inside-tap fix (`3a77d523`/`308ba2d3`) that the twelve deferred rows (29-36,
39-41, 43) were waiting on; the list renderer's full retirement (`6f2aef3f`, reconciled `ac7c78ac`)
and its stylesheet cleanup (`44e08bfb`), closing `006-list-view-deprecation`'s child `007` and
leaving only `008`'s operator row open; the board/timeline bench's frozen clock (`6bac9ce9`); the
settings sheet's own body grammar (`4f090d2e`), closing `044`'s and `045`'s AC-005 (`sheet-grammar`
now 7 surfaces × 7 elements, 25 gate lanes total); the board card properties capture and grammar
proof (`c0abb6ff`/`ba2b37f7`/`f240e8fa`); and `046-linked-views-notion-parity`'s ADR-001/ADR-002
acceptance plus its partially-landed capability leg (`ec893e67`) — AC-003/AC-006 `Met`, AC-001/002/
004/005 `Unmet` pending `T002`'s host-layout answer. `manifest.json`, `package.json` and
`versions.json` on main read **0.0.23**, and the tag is on `origin`. `npm run gate`: **25/25 green**.
**0.0.24 is cut** (`cabf595c`), carrying `048-stacked-sheets`' landing on top of 0.0.23: a child
sheet now overlays its parent in place — the parent dims and stays put, one scrim covers the stack,
and every child gets its own header with a close affordance (`265f736f`/`915591c2`, registered in
the grammar lane `f1fffff2`, re-measured `012f7769`/`b363d1b5`, recorded `0d3192e9`/`3440dce9`/
`c492cf66`), with the keyboard inset applying only to the top sheet and Create-property and confirm
dialogs present as sheets in the stack; `044`'s phone-sheet-grammar closing leg — a header
everywhere, 16px row inset and title padding, and pickers registered into the shared component set
(`55253df8`, reconciled `28b505f3`, recorded `4cbaba7c`); `046-linked-views-notion-parity`'s desktop
chrome — a linked database rendering at the page's reading width with no card furniture and a
dedicated grab handle (`e955f8ee`, captured `8a58c0b8`, recorded `fb7bd820`); and `047`'s gallery
view migrating to board on open (`e85fc31a`, recorded `01014484`, re-measured `ceaa49ee`). The
0.0.23 sheet-inside-tap fix carries forward unchanged. `manifest.json`, `package.json` and
`versions.json` on main read **0.0.24**, and the tag is on `origin`.
**0.0.25 is cut** (version bump `2334046b`, bundle fix `f2518f5e`), carrying two desktop fixes the
operator reported on 2026-09-05: the board card now shows every property enabled in the Properties
panel, in panel order, instead of five fixed slots resolved off the reference board's unreachable
branch; switching from board to another view no longer leaves `.pm-kanban-board`/`pm-kanban-view`
painted above it, since the pre-render teardown now names both; and clicking a board card anchors
the record panel to the card instead of falling back to the scrolling container and clipping at the
top (`8f5205b2`, recorded `f7405a6b`/`d15c9fc2`, re-measured `9d47b50e`) — plus the New split button
matching the toolbar's own icon-button height and radius instead of a bare button's Obsidian-supplied
height, and the filter/sort popover widened from a 360px cap to 552px with 140/140/120px floors so
property, operator and value never truncate (`91a0a426`, re-measured `f5a69e9f`). **A gate the tag
itself caught:** the `chore(release): cut 0.0.25` commit (`2334046b`) carried the same `main.js`
`b363d1b5` had committed before either fix — fresh `npm run build` differed by 108 lines — so
`.github/workflows/gates.yml`'s release-commit drift check (`4ab702ee`'s "committed only at release
time" rule) reddened the tagged push; `f2518f5e` rebuilds the bundle, the tag was moved to it, and
both Release and Gates went green on the retag. `manifest.json`, `package.json` and `versions.json`
on main read **0.0.25**, and the tag is on `origin`.
None of 0.0.7 through 0.0.25 is operator-confirmed yet. The cadence continues at **0.0.26** onward —
always `0.0.N`, never a second `.N.N`.

Each release since the operator's 2026-09-03 request also installs into the iCloud vault plugin
folder (`.../obsidian/plugins/note-database`) with a `.backup-<old>` beside it. What each renumbered
release actually shipped, keyed to its **new** number: 0.0.7, was 1.4.2 (reports 30 to 33), 0.0.8,
was 1.4.3 (overlay-stack `getPanel()` fix, `85ff504`), 0.0.9, was 1.4.4 (`037` timeline/gantt), 0.0.10,
was 1.4.5 (`038` board), 0.0.11, was 1.4.6 (`039` calendar parity plus `041` shared UI/UX), 0.0.12,
was 1.4.7 (`040` subtask tree, cut `214f6bd`), 0.0.13, was 1.4.8 (`038`'s empty-column/
drop-language row `7e36671` and `040`'s same-parent reorder `535373a`), 0.0.14, was 1.4.9 (`037`'s
three open-row fixes `fa58c7f`/`b29bf7f` and `041`'s reduced-motion fix `a251a43`/`3f143df`,
reconciled `65fb7dd`/`471860d`), 0.0.15, was 1.4.10 (`037`'s last open row `7ca6cc2` and the
touch-floor fix `a3781ae`), 0.0.16, was `038`'s board one-to-one copy, kanban structure and
stylesheet, merged and reconciled in `854c748`, cut in `46a8525`, and **0.0.17**, the current cut —
`037`'s gantt one-to-one copy, TypeScript structure and stylesheet, merged and reconciled in
`972c2cd`/`a00ad31`, cut in `839712b`; **0.0.18**, `038`'s board fidelity pass, cut in `96f878a5`;
and **0.0.19**, `037`'s gantt fidelity pass plus the board's closing fixes, cut in `07f4500f`; and
**0.0.20**, `037`'s gantt residual-behaviour and closing legs, `038`'s T12 in-repo
close and inset fix, and `043`'s constructed fixture families, cut in `ccc946c3`; **0.0.21**,
`031`'s WebKit sheet second-bug fix, `044`'s settings and column-width sheet
chrome fixes, `037`'s milestone-label reinstatement, and the Project Manager reference captures,
cut in `5af7eef7`; and **0.0.22**, the current cut — the symlink-safe ignore check (`6328c9cb`),
`006`'s list hide-and-migrate (`e0e1c568`/`f49eda4c`), `045`'s board card properties
(`a79d7421`/`56a34199`), the kanban line-height fix's second truing (`53513962`), and `044`'s
remaining phone-sheet-grammar legs registering `sheet-grammar` as a gate lane (`9436b964`), cut in
`7b976e28`; and **0.0.23**, the current cut — the sheet-inside-tap fix (`3a77d523`/`308ba2d3`), the
list renderer's full retirement and stylesheet cleanup (`6f2aef3f`/`44e08bfb`), the frozen bench
clock (`6bac9ce9`), the settings-body grammar (`4f090d2e`), the card-properties capture and grammar
proof (`c0abb6ff`/`ba2b37f7`/`f240e8fa`), and `046`'s ADR-001/ADR-002 acceptance plus its partial
capability landing (`ec893e67`), cut in `d3979cf5`; **0.0.24** —
`048-stacked-sheets`' phone stacking model (`265f736f`/`915591c2`, reconciled `012f7769`/`b363d1b5`),
`044`'s phone-sheet-grammar closing leg (`55253df8`/`28b505f3`), `046`'s desktop linked-view chrome
(`e955f8ee`/`fb7bd820`), and `047`'s gallery-to-board migration on open (`e85fc31a`/`ceaa49ee`), cut
in `cabf595c`; and **0.0.25**, the current cut — the board card's configured-property list, cleared
teardown and anchored record panel (`8f5205b2`, recorded `f7405a6b`/`d15c9fc2`/`9d47b50e`), and the
New split button's toolbar-matched chrome plus the widened filter/sort popover (`91a0a426`, recorded
`f5a69e9f`), version-bumped in `2334046b` and rebuilt in `f2518f5e` after the tagged push's own drift
check caught a stale bundle. The `0.0.16` through `0.0.25` tags are all present on `origin`. None of
0.0.7 through 0.0.25 is operator-confirmed yet.

**Release-mechanics gotcha, surfaced during the rename:** `.github/workflows/release.yml`
auto-creates a GitHub release on any `*.*.*` tag push, and it raced the manual tag-recreation pass —
five of the fifteen recreated releases briefly carried the CI-generated body before being fixed by
hand. Future releases must account for the same race: either push the tag and wait for the CI run to
finish before editing the release, or create the release with `gh` first and expect the CI run to
fail with "already exists" — never assume the tag push is the only writer.

---

## 6. THE ORPHANS

Two reports were fixed with no phase owning them. Both are now phases. The search that found them
covered every markdown file in the program for the report's own vocabulary, then checked the working
tree diff and the lane journal for edits no document claimed.

**Report 7 — currency and decimal formatting.** No document in this program mentions currency,
decimals, the euro sign or the card renderer's value branch. The formatter already existed and four
surfaces already called it; the card renderer was the single number surface not wired to it. Now
`019-card-field-value-formatting`. It also crossed a written scope exclusion, now resolved — see §7.4.

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

Four decisions were taken on 2026-08-30, and **fourteen more on 2026-09-05** — across five tables
further down, not folded into this one. Each closes a question, and each is recorded here
because a decision that lives only in a conversation gets relitigated by the next agent.

| Decision | What it settles | Where it binds |
|---|---|---|
| **Row height stays 34px.** Density outranks the 44px touch floor | WCAG 2.5.5's 44px target is not met by the table's main-item cell and **cannot be met from CSS** — measured 169×34, and a hit-area expansion is a no-op because the cell clips its overflow and the row below owns everything past the boundary. The only fix was a touch row-height floor, which is the reader's density setting | `012`'s first open question. Closed |
| **The grab band is accepted at 35px** against the 48px ask | 48px needs a taller sheet header, moving every sheet surface and every capture of it. The alternative, letting the band overlap the header, reintroduces the defect that phase had just fixed | `003/spec.md` "OPERATOR DECISION". Closed. §7.5 notes the recorded number is now disputed; the decision is not |
| **Row range-select moves behind a long press** | A tap on a row checkbox selected everything between it and the last row touched, on every touch device, because `isTouchDevice` was OR-ed into the range predicate — shift held down with no way to let go | `017`. The gesture is `attachLongPress`, the same object the row menu uses, so threshold, tolerance and haptic are shared rather than matched |
| ~~**The list view is a presentation mode of the grid**, not a separate view~~ — **superseded 2026-09-04** | Scoped the packet that is now `specs/006-list-view-deprecation/`, outside this program. The operator replaced the direction outright: *"Also deprecate list view completely"*. The Route B decision is kept as history in that packet's `decision-record.md`; it no longer binds | Named here so this program does not re-open either the old direction or the new one |

### Seven more, all taken 2026-09-05

Same rule as the four above: a decision that lives only in a conversation gets relitigated by the
next agent. These arrived with the 0.0.22 device check and are quoted as decisions, not as claims
that anything was fixed.

| Decision | What it settles | Where it binds |
|---|---|---|
| **Twelve report rows are DEFERRED, not failed.** Rows 29-36, 39-41 and 43 — **partly discharged 2026-09-05 on 0.0.23, see the table below: rows 34-36 close and the other nine keep their state without their blocker** | The device check of 0.0.22 could not exercise a sheet at all — *"pressing any action in a sheet doesn't work and instantly closes it"* — so none of the twelve could be judged. The operator deferred them in one ruling with a named blocker: tap inside an open sheet dismisses it on iOS, fix in progress on `worktrees/056-sheet-inside-tap` under `031`. **They are re-asked after the next iCloud build** | §4 rows 29-36, 39-41, 43, and §4A's requirement that a report be confirmed or deferred with terms |
| **Rows 37/38: _"align closer"_**, plus capture Anytype and AppFlowy | The board and timeline are not close enough to Project Manager yet. Two reference sets were added beside it — Anytype and AppFlowy, boards, tables, calendar and timeline — from **both** the official product images **and** the apps installed locally through Homebrew casks, under `screenshots/anytype/` and `screenshots/appflowy/`, manifest entries in `screenshots/project-manager/`'s style. **AppFlowy was captured, then removed from the reference set entirely by a later operator decision the same day — see the entry below, "AppFlowy removed from the reference set."** | `047-competitor-references-and-pm-alignment`, opened today. Neither row closes on it — the operator's own vault comparison still does |
| **The gallery view is retired completely.** Operator: *"should have been deprecated"* | `030-gallery-view-deprecation` withdrew the gallery and stopped. The operator's instruction is to finish it the same way the list view is being retired in `specs/006-list-view-deprecation`: migrate, then delete the renderer and every measurement of it | `specs/007-gallery-view-deprecation`, a new top-level sibling packet. It also answers `045`'s first open question — see `045/decision-record.md` ADR-001 |
| **Hiding a property on a board card does NOT hide it in the table.** Cards only | The convenience was recorded as cheap and as re-coupling the two surfaces `045` had just separated. The operator chose the decoupling | `045/decision-record.md` ADR-002. It confirms shipped behaviour; AC-001's test already asserts it |
| **Header everywhere.** Every sheet, including the plugin's own owned menus, carries a header with a close button | Sheets that reach the phone through several different builders have had close affordances added one at a time, per report. This makes it a rule rather than a series of fixes: an owned menu presented as a sheet is a sheet | `044-phone-sheet-alignment`. It generalises the shared-header work T008 did for the Add view sheet |
| **Sheet row inset 16px; sheet header title 16px** | Two exact numbers rather than "align it better", so the grammar lane can assert them instead of a reviewer judging them | `044-phone-sheet-alignment`, and `tools/live/sheet-grammar.mjs`'s `rows` and `header` elements are where they become checkable |
| **Landed worktrees 003-055 are removed; their branches are kept** | The `.worktrees/` tree had grown past fifty entries, most of them landed. Removing a worktree is not removing its branch, and the branches stay as history. Separately, the stale `cli-external-orchestration` hub is being re-minted in `Code_Environment/Public`. **Closed 2026-09-05: the Public checkout was already fresh, so no change was needed, and the pre-push override that the staleness would have required is no longer necessary.** | Workspace hygiene, not this program's code. Recorded here because a later agent reading `§5.A`'s worktree citations will find the directories gone and the branches present |

### Three more, taken 2026-09-05 on the 0.0.23 check

| Decision | What it settles | Where it binds |
|---|---|---|
| **The sheet-action half of the twelve deferrals is CONFIRMED and closes; the other nine stay deferred, per row.** Operator: *"Buttons work now"* | The 2026-09-05 ruling deferred twelve rows on one blocker — a tap inside an open sheet dismissed it. The fix shipped in 0.0.23 and the operator used it. Rows **34, 35 and 36** name that defect as their subject, so they close under D3. The other nine — 29, 30, 31, 32, 33, 39, 40, 41, 43 — stay deferred because the 0.0.23 pass did not exercise them, **not** because anything still blocks them, and each row's own subject is recorded in its State cell | §4 rows 34-36 (closed), 29-33, 39-41, 43 (deferred, blocker discharged), and §4A's requirement that a report be confirmed or deferred with terms. `045`'s AC-006 moves with the nine |
| **Stacked sheets are their own phase, and the inventory is a deliverable rather than a note.** Operator: *"Add phase to optimize stacked sheets and make sure we have inventory of all sheets that are stacked on top of a parent"* | `044` gave a FIRST sheet its grammar; nothing owned the SECOND. The ask names both halves — a stacking model and a census — so the census is T001 with a `file:line` per row, not something derived later from whatever was fixed | `048-stacked-sheets`, opened today. The census is `048-stacked-sheets/stacked-surface-inventory.md`; it extends `003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md` along the stacking axis by reference rather than restating it |
| **The stacking model is Notion-like and stated as a contract, not a mood** | Eight clauses, each checkable: the child overlays in place; the parent dims and scales back with its bounding box unchanged (\|Δ\| ≤ 1px); the child carries the header-everywhere grammar; dismissing the child restores the parent's state; the scrim belongs to the topmost sheet only; the keyboard inset applies to the topmost sheet; drag-to-dismiss on the child never moves the parent; a child longer than the viewport scrolls inside itself with a visible fade | `048/spec.md` §3, `048/acceptance-criteria.md` AC-002 to AC-007, and `tools/live/sheet-grammar.mjs` once `048` T017 registers a row per stacked pair |

**`048` D1 is DECIDED, 2026-09-05, and it is the operator's, not an agent's.** Obsidian modals
opened from a sheet on the phone — Create property, confirms, date pickers, suggest modals —
become stacked bottom sheets; none stay modals. This accepts the recommendation that was on
record: present as a sheet, because `DbModal` already declares a presentation per subclass
(`db-modal.ts:56`) so the mechanism exists, while replacing each modal forks twenty subclasses
into a phone branch and a desktop branch. It gates six inventory rows and part of `048`'s
AC-004; the dropdown, menu and picker rows — the majority, and both of the operator's dropdown
screenshots — do not wait on it. **The implementation leg runs on codex, in `worktrees/062`.**
Recorded Accepted in `048/decision-record.md`.

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

### Two more, taken 2026-09-05 (later)

| Decision | What it settles | Where it binds |
|---|---|---|
| **"Debugged, refined, perfected" is the bar for every phone surface, not a one-off note.** Operator, on the 0.0.23 device check: *"it is possible to add property, sort etc. But all should be debugged, refined, perfected."* | A control responding is not the same test as the surface being right. Column width, settings, Add view and board/timeline on the phone all respond to a tap on 0.0.23 and are still named FAILING — see §4's updated rows 37, 38, 40, 41 and 43 — because responding is the floor this standard sits above, not the standard itself | Every phone-surface row in §4 and §4A, present and future; the standard applies past `048-stacked-sheets` to the whole program |
| **The 5-iteration deep-research cap is overridden for `047`: 20 more iterations, run purely on Anytype.** Operator: *"finds Anytype to have amazing UI/UX"*, wants *"a lot of screenshots"* and *"another 20 iterations deep research UX / Logic extraction run purely on Anytype"* | An explicit, named exception to the default 5-iteration research cap — scoped to one competitor reference and one packet, not a change to the cap itself | `047-competitor-references-and-pm-alignment`; recorded Accepted in its own `decision-record.md` |

### One more, taken 2026-09-05 (~11:15)

| Decision | What it settles | Where it binds |
|---|---|---|
| **Skip AppFlowy installed captures; Anytype's demo space is the persistent test environment.** Operator: *"Skip AppFlowy installed captures."* | AppFlowy is Flutter with no DOM or accessibility tree, so its CSV import and remaining view captures need real mouse clicks — about 10 minutes of the operator's Mac, taken away from their concurrent use of it. The operator chose to keep only the official AppFlowy images. Separately, Anytype's demo space stays the persistent test environment (kept across sessions, not deleted and rebuilt) | `047-competitor-references-and-pm-alignment/decision-record.md` ADR-002 and `049-test-environments-and-mock-data/decision-record.md` ADR-001. `047`'s two remaining AppFlowy installed-app rows (AC-001) and `049`'s AppFlowy environment leg (AC-008/T022) both close as skipped by operator decision — not failed, not deferred. The retained CSVs stay in `tools/mock-data/csv/` for a future operator window |

### One more, taken 2026-09-05 (~11:40)

| Decision | What it settles | Where it binds |
|---|---|---|
| **A `condition panel` role, 440-560px, is added for Filter, Sort and Column Manager; `panel` keeps 292-360px for everything else.** Operator: *"Amend the document."* | Row 50's fix (`worktrees/064-desktop-chrome-bugs`, landed `f5a69e9f`) widened `PANEL_POPOVER` to 552px so a condition row's property, operator and value controls never truncate — measured chips 140px, value control 120-140px, row overflow 0. That value sits outside `design-system.md` §5's declared `panel` range of 292-360px, which row 50 itself flagged as "now a defect for the operator to rule on." The operator ruled: a named wider role, not a widened existing one, per the row-floor rule (property/operator 140px floors, value 120px floor) | `design-system.md` §5 (amended), `roadmap.md` §4 rows 47 and 50 (measurement source), `015-desktop-dropdown-placement/decision-record.md` ADR-001 (Accepted) |

### One more, taken 2026-09-05 (~12:10)

| Decision | What it settles | Where it binds |
|---|---|---|
| **AppFlowy removed from the reference set entirely, superseding the earlier skip decision.** Operator: *"let's ditch AppFlowy screenshots."* | The 2026-09-05 (~11:15) ruling kept AppFlowy's official images and already-taken installed captures as an ongoing reference, skipping only its two remaining installed-app rows pending a future operator window. This later, separate instruction removes AppFlowy as a reference product entirely — `screenshots/appflowy/` (images, `README.md`, `sources.md`) is deleted, and every active scope statement in `047` and `049` is rewritten to Anytype-only (plus the Project Manager reference). `047`'s AC-001 moves from `Waived` to `Met` on the narrower 8-row Anytype-only matrix, which is fully captured or N/A. `049`'s AC-008 moves from `Waived` to `Superseded` — the environment itself is gone, not merely deferred. `tools/mock-data/csv/`'s CSVs stay, reworded from AppFlowy-specific framing to product-neutral "CSV export," since the operator judged them product-neutral | `047-competitor-references-and-pm-alignment/decision-record.md` ADR-003 (supersedes ADR-002) and `049-test-environments-and-mock-data/decision-record.md` ADR-002 (supersedes ADR-001). §4 rows 37 and 38 above no longer name AppFlowy in the active ask |

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

`000`, `001`, `002`, `003`, `004`, `005`, ~~`010`~~ and `013` all carry `completion_pct: 0` with a
`recent_action` of "Phase cut… not started" or similar, while the lane journal records their edits
and the working tree contains them. The continuity blocks were written at phase-cut time and never
advanced. This is the same defect as the old §5 status table, one level down.

*2026-09-02: `010` is struck because it no longer has the defect.* Its `goal.md`, `spec.md` and
`implementation-summary.md` all carry `completion_pct: 91` and a `recent_action` describing measured
work, so the phase named here as unadvanced is advanced. **Only `010` was checked for this
correction.** The other seven are not thereby confirmed: `000`, `001` and `002` are already known to
carry non-zero figures in their `spec.md` continuity blocks, so this paragraph's "all carry
`completion_pct: 0`" needs a phase-by-phase re-read before any of them is struck.

### 7.7 Seven sheet surfaces, or nine

Lane entry 47 and `003/spec.md` both say the single overlay fill covers "all **seven** sheet
surfaces". `016` measured **nine** sheet-capable surfaces, all at the identical fill. Either two were
added since the count was written or two were never counted. Low stakes — every surface measured
matches — but the census number is quoted in three documents and only one of them counted.

### 7.8 `specs/context` was tracked as a self-referencing symlink

*2026-09-05:* Commit `c492cf66` staged `specs/context` as a `120000` symlink pointing at its own
path, because `.gitignore` line 10 read `specs/**/context/` — the trailing slash matches only a
directory, so a convenience symlink slipped past it untracked-but-not-ignored and got `git add`ed.
Pulling that commit into the primary checkout replaced the gitignored vendored directory
`specs/context/obsidian-pm-main/` (and its siblings) with the symlink; `tools/live/reference-mount.ts`
imports from that vendored tree, so `npm run screenshots` could no longer bundle. Fixed by untracking
the symlink (`git rm --cached`) and tightening the ignore to `specs/**/context` (no trailing slash)
plus a bare `specs/context` line, so both the directory and a same-named symlink are caught.

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

**Thirty-two operator confirmations:** phase Later, target: the operator installs the current
release and reports per surface. Status: **1 of 32**, and that one is an accepted shortfall, plus a
partial on row 29. Evidence: §4. *2026-09-02: this milestone read 1 of 24 against 1.3.3. The
denominator is the row count in §4 and the build is now 1.4.1.*

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
