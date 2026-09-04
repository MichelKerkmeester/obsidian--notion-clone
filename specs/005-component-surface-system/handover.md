---
title: "Session Handover: Component Surface System"
description: "Resume point: main is at ab116959, release 0.0.20 is the shipped build, and 0.0.21 is the next cut. Five legs are in flight and none is on main: 037 reference captures, 039 column-width sheet, 040 settings sheet, the WebKit sheet fix on branches/001-sheet-webkit (worktree 036), and 042 screenshots folder split. Every phase 000-046 now carries a nested goal.md and the parent DONE table references each open one. PAUSED on operator instruction until the goal prompt is set."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "orchestrate-handover-16"
    recent_action: "Gave every phase a nested goal, referenced them from the parent goal, drafted the goal prompt"
    next_safe_action: "PAUSED: operator sets the goal prompt first. Then land the WebKit sheet fix and cut 0.0.21"
    blockers:
      - "PAUSED on operator instruction 2026-09-04 20:45: goal-prompt.md is drafted and awaits the operator setting it"
      - "Operator device confirmation owed: reports 29-33, the five ported surfaces, releases 0.0.16-0.0.20"
      - "IN FLIGHT, not on main: branches/001-sheet-webkit (worktree .worktrees/036-sheet-freeze) — the entrance fix landed as c96467c9 but a second bug remains, a toolbar rebuild drops the sheet (c5a9a8b5, ca2eb5c0, 8f14a21f)"
      - "IN FLIGHT, not on main: worktrees/039-column-width-sheet and worktrees/040-settings-sheet, both 044's, both must consume the shared sheet chrome rather than inventing a local fix"
      - "IN FLIGHT, not on main: worktrees/037-reference-captures (043 T031, Project Manager captures under screenshots/project-manager/) and worktrees/042-screenshots-folders (the notion-clone/ + project-manager/ split)"
      - "0.0.21 is the next cut and is blocked on the WebKit sheet fix plus the two sheet legs landing"
      - "044's Add view sheet leg (report 43) is not started; 045 and 046 have no leg at all"
      - "006-list-view-deprecation has four live children and none has started; its 005 audit runs first"
    key_files:
      - "goal.md"
      - "roadmap.md"
      - "037-timeline-gantt-port/tasks.md"
      - "037-timeline-gantt-port/acceptance-criteria.md"
      - "038-board-kanban-port/tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover"
      parent_session_id: null
    completion_pct: 71
    open_questions: []
    answered_questions:
      - "2026-09-04 ~17:30 CEST, operator answered four questions. (1) Reports 29-36 on 0.0.20: add filter/add sort still breaks or freezes the app on mobile — rows 34-36 reopened, fix leg on worktrees/036-sheet-freeze (owner 031); rows 29-33 unchanged, not mentioned. (2) Rows 37-38 (board/gantt vs. Project Manager): capture Project Manager's own board and gantt views into screenshots/ so the comparison is done in-repo, leg on worktrees/037-reference-captures (harness, 043); rows close when a fresh reviewer compares our captures against the reference captures. (3) Row 39 (milestone-overpaint): reinstate the local fix (raise crowded milestone labels) on the default gantt, amendment to 037's REQ-007, leg on worktrees/038-milestone-labels. (4) 043 AC-002: accept determinism (recommended) — the row is now Met, the animation-frame wording superseded"
      - "043 AC-002: amend the criterion to the inside-mount scrollTop measurement, or accept determinism as the basis? Operator ruling 2026-09-04: accept determinism; AC-002 is now Met"
      - "Milestone-overpaint (roadmap.md row 39): keep the reference-faithful shape, or reinstate a local anti-collision fix on the gantt's default render path? Operator decided 2026-09-04: reinstate the local fix, amendment to REQ-007"
      - "The 036 research loop cannot run in the main checkout while a sibling code phase is dirty; it now runs in a worktree. Synthesis landed at 036/research/research.md; lineage ledgers stay untracked by .gitignore"
      - "Landing discipline for a port phase: verify in the worktree, commit on the worktree branch, land to main only after the CSS/display leg is verified there, and release from a clean clone"
      - "All five obsidian-pm port phases (037-041) are landed on main and shipped: 1.4.4 (037), 1.4.5 (038), 1.4.6 (039, 041), 1.4.7 (040), 1.4.8 (038, 040 open-row fixes), 1.4.9 (037, 041 open-row fixes), 1.4.10 (037's last open row plus the 042 touch-floor fix). Every open product row from all five phases is now closed"
      - "2026-09-04: 042-harness-fidelity-and-replay landed on main. Chart and calendar week/day now construct their production renderers (DONE row 3). node tools/live/replay.mjs holds 28 claims, reversed 0. touch-targets.mjs and unstyled-links.mjs gained a constructed-renderer pass alongside their fixture pass; the one real defect it found shipped as a3781ae in 1.4.10"
      - "043-constructed-capture landed at 2ab4942, Level 3, partial. Nine constructed scenarios and 36 captures exist for every registered view, mounted through 042's own bundle seam, reproducing 0 of 312 manifest entries changed across two runs. Seven of eleven planned fixtures declared superseded via fixtureOf; the other 13 stay fixture-only, named. css-lane and device-parity now read the constructed captures for free; screenshots-fresh's DECLARED-staleness wiring is still open. AC-002's readiness negative control is unmeetable through the capture path because the screenshot command flushes pending animation frames before rasterising, and needs an operator ruling"
      - "Done-audit-6: the structural 043 landing did not close DONE row 6. Every constructed bench column was untyped text and every icon was the stub's placeholder diamond, so the fixture pass carried the only evidence for typed rendering and icon fidelity. That dependency was declared and bounded rather than hidden, but a declared-and-bounded dependency is still a dependency"
      - "Done-audit-7: a second 043 leg (0af4ca6, reconciled in bf67475) gave list, board, gallery, calendar and timeline real typed cells and 21 real icon names, closing the gap for those 7 declared pairs; the remaining difference there is curated content, a declared complement rather than a device-value dependency. Table and chart stay untyped by design (table's column builder takes no captureData argument, chart has no per-row field), so row 6 stays open, narrowed to those two views plus the 13 fixture-only scenarios. completion_pct stays 4 of 7 = 57"
      - "Done-audit-8: T027 (425d552) closed table and chart, typed-data-assertions.mjs 6 of 6 new markers PASS. All nine constructed views are now typed; the 13 fixture-only scenarios are the sole remaining gap, and they back 5 of the 25 npm run gate lanes, so ticked row 4's green partly depends on their hand-authored markup. Row 6 stays open on that narrower list. completion_pct stays 4 of 7 = 57"
      - "043 T028 is merged to main (d363456, reconciled dc67803): all 13 of row 6's named fixture-only scenarios now have a constructed counterpart, ten via new additive ScenarioSpec options (subtaskTree, sparseFields, emptyState, chartVariant, miniCalendar, three new toolbar-popover renderer values), three (table/list/board-mobile) via a fixtureOf declaration onto the existing mobile-device capture already on record. A real bug (constructedScenario() dropping opts.miniCalendar) was found only by reading the 40 new captures, after the assertion script had already reported green through a spec that bypassed it"
      - "Done-audit-9 answered the question T028 left open: a manifest-level counterpart does NOT satisfy row 6 regardless of which lane reads it, since the criterion tests whether a green depends on a harness-supplied value, not whether a counterpart exists anywhere. css-lane, screenshots-fresh and device-parity now cross-check all 13; touch-targets and unstyled-links never read the manifest, iterating render-assertion-bundle.mjs's 21-entry SCENARIOS instead. Row 6 stays open, narrowed a fifth time to ten scenarios and two lanes. completion_pct stays 57"
      - "043 T029 is merged to main (122a959, reconciled ce72379, numbers trued up in 65238ad): render-assertion-bundle.mjs gained a STATE_SCENARIOS array and a SCENARIOS_WITH_STATES export, and touch-targets/unstyled-links import the latter, so their constructed pass reads 31 scenarios instead of 21. touch-targets constructed 50462 elements across 31, 422 under the 28px floor against a rebaselined 422 (was 367/367); unstyled-links constructed 72 links across 31 with 0 UA-default findings, was 0 links across 21 — the empty-sample prediction is superseded because 7 of the ten state variants set captureData. SCENARIOS itself stays at 21 by necessity: render-assertions.mjs's BAGS table has 13 keys and none of them is the toolbar triple, so a merged list throws a TypeError at the bag-shape comparison rather than failing a check"
      - "Done-audit-10 ruled on row 6 after T029 and it stays open, re-scoped rather than narrowed again. What closed is exactly what done-audit-9 named. What keeps it open is the fixture half of the same two lanes: both exit codes still require a fixture pass over 71 hand-authored scenarios, 20 carry fixtureOf and 51 do not, and 42 of those 51 are the panel-/chrome-/field- and popover families no constructed scenario in either lane mounts — neither lane reads fixtureOf, which is consumed only through screenshots/manifest.json, so the constructed pass supplements the fixture pass without validating any individual fixture. That is done-audit-3's class (3) in the part done-audit-6's fixtureOf bound set aside rather than closed. Separately checked and clean: render-assertions.mjs, still reading the 21, leaves no criterion green on a harness-supplied value — it refuses DOM without a bundled-renderer provenance marker, its 13 action bags are return-type-annotated against the shipped *RendererActions interfaces so tsc binds them to src/views, and its coverage total is read live from src/views. completion_pct stays 57"
      - "2026-09-04, operator decision 'renumber our history': the version scheme restarted after the fork from pangy9/obsidian-note-database (fork point upstream 1.2.8). Upstream's seventeen tags (1.0.0-1.2.8) were removed from origin; our fifteen post-fork releases were re-tagged on the same commits and recreated on GitHub with the same builds, only the asset manifest's version field rewritten: 1.2.8-euro.1 through 1.4.10 now read 0.0.1 through 0.0.15 (Latest) in order. manifest.json/package.json/versions.json on main (6f81eb8) and the iCloud install both now read 0.0.15; the iCloud manifest carries a backup of the pre-rename 1.4.10 manifest. The next release is 0.0.16 (board + gantt one-to-one copies), then 0.0.17 onward, always 0.0.N. .github/workflows/release.yml auto-creates a release on any *.*.* tag push and raced the manual recreation, briefly leaving five releases wrong before they were fixed; future releases must push the tag and wait for CI, or create with gh and expect CI to fail with 'already exists'"
      - "Done-audit-11 TICKED DONE row 6 on main at 2242fa0 after 043 T030 landed, taking the parent to 5 of 7 = 71. T030 gave 46 of the 51 fixtureOf-less fixtures a production-mounted constructed counterpart (26 new renderer values, 13 options, 43 capture scenarios, 172 captures read), so 71 fixtures now hold 66 fixtureOf declarations and 5 without. Both lanes constructed pass went 21 -> 31 -> 73 scenarios, wider than the 71-fixture pass it supplements: touch-targets exit 0 three runs identical, constructed 24788 elements across 73 and 1223 under the 28px floor against a 1223 baseline (was 422/422 across 31), fixture 1123/71/199 against 279 (was 1450/71/264, the drop being styles.css moving under the board and gantt ports); unstyled-links exit 0, constructed 1476 links across 73 with 0 UA-default findings (was 72 across 31). done-audit-10 caveat that the ratchet was decided by timing is retired at its cause — T030 swept the body-portal teardown that had each scenario measuring the previous one stacked panels. The 5 that cannot be constructed (three DbModal panels the stub refuses, the MarkdownRenderChild-hosted selection status bar, the mid-gesture board drag classes) do not keep the row open: the criterion is conjunctive and asks for a harness value a device would not supply. Two reach a lane only as 2 and 3 of the 199 undeclared under-floor rows, which consume ratchet headroom rather than create it; one contributes nothing; the status bar product claims are asserted on production output by the placement lane; and board-drop-language, the one load-bearing case (replay.mjs:600, held on exact equality), supplies two class names that board-renderer-parity.test.ts asserts on a real BoardRenderer under real drag events in the tests lane. The five stay a coverage limit — a red the corpus cannot raise — recorded against row 3 ledger, not absorbed by the tick"
      - "Correction to done-audit-10 found by re-running its reasoning: its leg (b) does not hold. The 13 action-bag return-type annotations live in render-assertion-harness.ts, not render-assertions.mjs where it cited them, and no gate lane typechecks them — root tsconfig.json includes src/**/*.ts only and lint:tools runs eslint over tools/**/*.mjs, so the .ts harness is neither typechecked nor linted. BAGS is a hand-maintained expected list compared against the harness own bag keys with no enforced binding to src/views. The conclusion still stands on its other two legs (the harness refuses DOM without a bundled-renderer provenance marker; the coverage total is read live from src/views) plus done-audit-7 inertness finding, re-verified: render-assertions.mjs names actions only in a comment and the two lanes reference an action bag 0 times each. An unenforced shape list can only under-assert"
      - "2026-09-04: 037's gantt 1:1 leg landed (TypeScript d30ea78, CSS 2a6d98f, merged 972c2cd/a00ad31) and shipped 0.0.17 (839712b), installed to iCloud alongside 038's already-shipped 0.0.16 board 1:1 (TypeScript 1c5f465, CSS 4b4b404, merged 854c748). A fresh reviewer (T12) found real fidelity divergences in the board copy against the reference — an inline-color palette illegible in dark mode, a left-aligned due chip, a stray 'Sub' chip, a missing badge icon/priority strip/milestone/recurrence chips/due-soon tier, unscoped selectors, and an extra 24px host inset — now being fixed on worktrees/027-board-fidelity; T12 stays open until that lands. A gantt visual review is separately in progress, with its own fidelity pass to follow. A T030 leg on worktrees/028-constructed-chrome is constructing the panel-/chrome-/field- fixture families that keep 043's row 6 fixture half open. Main is clean at 839712b; next release is 0.0.18"
      - "2026-09-04: worktrees 022-035 all landed on main (026 version reset, 022 state variants, 023 board, 024 gantt, 025 lanes, 027 board fidelity, 028 constructed families, 029 gantt fidelity, 030 board close, 031 board inset, 032 gantt behaviours, 033 board T12 close, 034 gantt close, 035 captures refresh); none is an ancestor gap on main anymore, and all are the operator's to remove through sk-git"
      - "2026-09-04: release 0.0.20 (ccc946c3) carries gantt's residual-behaviour leg (week-label modes, elsewhere menu, add-subtask, undo/redo keys), gantt's closing leg (persistence, slot-duration gate, eight code + three fixture fixes), board T12's in-repo close, board's host-inset fix, and 043's constructed panel/chrome/field fixture families. A fresh reviewer (30c4b746) then confirmed gantt AC-007's in-repo half MET (60/60 pm-gantt-* classes, zero divergence) and surfaced one new operator-only finding: the milestone label overpaints the month-band label on the default render path, reference-faithful by construction — recorded as roadmap.md row 39, not fixed"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

As of 2026-09-04, releases 0.0.7 through **0.0.20** (0.0.7-0.0.15 formerly 1.4.2 through 1.4.10,
renumbered earlier this session — `roadmap.md` §5.3) are live on GitHub and installed into the
iCloud vault plugin folder (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel
Kerkmeester/.obsidian/plugins/note-database`), each with a `.backup-<old>` beside it. `038`'s board
one-to-one copy shipped as **0.0.16** (`46a8525`), `037`'s gantt one-to-one copy as **0.0.17**
(`839712b`), the board fidelity pass as **0.0.18** (`96f878a5`), the gantt fidelity pass plus the
board's closing fixes as **0.0.19** (`07f4500f`). **0.0.20 is now cut** (`ccc946c3`), carrying
`037`'s residual-behaviour leg (week-label modes, the depends-elsewhere menu, add-subtask, undo/
redo keys) and closing leg (persistence, slot-duration gate, eight code plus three fixture fixes),
`038`'s T12 in-repo close and host-inset fix, and `043`'s constructed panel/chrome/field fixture
families. `main` is at `ccc946c3`, pushed, working tree clean; the next cut is **0.0.21**.

All five obsidian-pm port phases (037-041) are landed and shipped, and every open product row they
carried is closed. Both harness phases the parent's DONE table opened are landed too. `043` is now
merged across seven legs on main: the structural landing (`2ab4942`), typed data and real icons
(`0af4ca6`, reconciled `bf67475`), table and chart typing (`425d552`, T027), the state variants
(`d363456`, T028), the widened constructed lanes (`122a959`, T029), the constructed fixture
families (`c4c7466`+`64db8d5`+`6fa715e`, T030), and this session's panel/chrome/field families
(`c4c74669`, reconciled `6fa715e5`/`2506bb2f`/`2242fa0a`, ticked `a78000ce`). Of the 71
hand-authored fixtures, **66** carry a `fixtureOf` declaration onto a production-mounted
constructed counterpart and **5** cannot — a structural coverage gap recorded against row 3's
ledger, not a defect (three `DbModal` panels the stub refuses out of scope, the
`MarkdownRenderChild`-hosted status bar, and one mid-gesture board drag class already covered by a
real-DOM test).

**The parent DONE table stays 5 of 7 = 71.** Rows 3, 4, 5, 6 and 7 hold; rows 1 and 2
(operator device confirmation) are the only open rows in it, and nothing this session touched
moves that count — the DONE table tracks the parent program, not either port's own comparison
criterion.

**Both 1:1 ports' in-repo comparison halves are now MET.** `038`'s board T12 was MET by a fourth
fresh reviewer (`c563f08`, `roadmap.md` row 37 entry): all fourteen carried-forward elements
matched to the pixel against the reference source; T12 itself stays unticked because the
operator's own vault compare (row 37) has not run. `037`'s gantt AC-007 was MET today by a fresh
reviewer (`30c4b746`, ran none of the gantt legs, `037/tasks.md` T048): 60 of 60 `pm-gantt-*`
classes matched with zero divergence, the copied CSS is byte-faithful, and every measured geometry
value (label width, row/header height, day-unit widths, bar padding/height/radius, milestone
diamond, progress fill, link marker) matched the reference exactly. AC-007 itself stays `Unmet`
per D3 — the operator's own vault compare (row 38) has not run either. That same gantt read
surfaced one new, genuinely reference-faithful finding rather than a defect: the milestone label
overpaints the month-band label on the default render path, because the reference's own
`GanttHeaderRenderer`/`GanttTaskBarRenderer` paint at `y=18`/`y=14` on the same header SVG. This is
recorded as a new never-tick operator row — `roadmap.md` §4 row 39, and an operator-only row in
`037/goal.md` — not fixed, since keep-vs-revert is the operator's call, not an agent's.

**Operator answered 2026-09-04 ~17:30 CEST**, resolving four of the open items above. Reports
34-36 (add filter/add sort) still break or freeze the app on mobile on 0.0.20 — reopened, not
device-confirmed; the fix leg moves to `worktrees/036-sheet-freeze` (owner `031`). Rows 37 and
38's own vault compares are redirected: rather than the operator installing both plugins in one
vault, the harness now captures Project Manager's own board and gantt views into `screenshots/`
so a fresh reviewer can compare in-repo — leg `worktrees/037-reference-captures` (`043`'s
harness); both rows close only when that reviewer runs. Row 39 is decided — reinstate the local
anti-collision fix that raises crowded milestone labels on the default gantt render path, as an
amendment to `037`'s REQ-007 — leg `worktrees/038-milestone-labels`. And `043`'s AC-002 is now
`Met`: the operator accepted determinism as the basis (two full capture runs, 0 of 36 constructed
entries moved; `screenshots:verify` 528 entries current at `e8e44cc6`), superseding the
pixel-difference wording.

**2026-09-04 evening: main is at `ab116959` and clean, and FIVE legs are in flight.** The
sentence this paragraph used to carry — *nothing is queued in the main checkout* — was true at
~17:30 CEST and is not true now. The operator's evening pass (reports 40-43) opened three phases
and two of them were dispatched immediately.

| Leg | Branch / worktree | Carries | On main? |
|---|---|---|---|
| WebKit sheet fix | `branches/001-sheet-webkit` (worktree `.worktrees/036-sheet-freeze`, tip `8f14a21f`) | `031`'s **second** bug. The entrance fix already landed on main (`c96467c9`, reconciled `4c6b2c78`, recorded `ec24f9a`); this branch adds the one it does not reach — a toolbar rebuild behind an open sheet leaves the panel holding a dead anchor and the next placement un-portals the sheet (`c5a9a8b5`), plus the panels replacing their own node so a touch's delayed click retargets outside the surface (`ca2eb5c0`), plus a device report for what emulation cannot reproduce (`8f14a21f`) | **No** |
| Column-width sheet | `worktrees/039-column-width-sheet` (`c6b5f113`) | `044`'s report-40 leg: the adjuster carries 0 of the 7 grammar elements today, and the keyboard covers it | **No** |
| Settings sheet | `worktrees/040-settings-sheet` (`c6b5f113`) | `044`'s report-41 leg: the grab band does nothing and the desktop two-column `Setting` grid is squeezed onto 390pt | **No** |
| Reference captures | `worktrees/037-reference-captures` (`2d1df59d`) | `043` T031: Project Manager's own kanban and gantt photographed under `screenshots/project-manager/`, 16 new PNGs, all opened and read beside their `referenceOf` twin. Closes rows 37 and 38's in-repo half | **No** |
| Screenshots folder split | `worktrees/042-screenshots-folders` (`82a1da76`) | Our captures move under `screenshots/notion-clone/` and the harness roots on capture sources. Lands **last**, because every other leg writes captures | **No** |

`worktrees/041-sheet-webkit-research` (`07f4c594`) is already merged and is not a pending leg.
`worktrees/038-milestone-labels` landed as `1358927` (row 39, decided: reinstate the local
anti-collision fix) and ships in **0.0.21**. Worktrees 022-035 all landed earlier and are the
operator's to remove through `sk-git`.

**Every phase now carries a nested goal.** `000`-`009` were the last ten in the old shape — no
frontmatter, no `D`-rows — and were backfilled this pass without touching a criterion or a piece of
evidence. All nine children of `006-list-view-deprecation` gained one for the first time. The
parent `goal.md`'s DONE table now REFERENCES every open phase subgoal by path, and `roadmap.md`
§5.A lists all 47 phases with a derived figure and a current state.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: THE OPERATOR SETS THE GOAL PROMPT

**PAUSED.** Operator instruction, 2026-09-04 20:45, verbatim: *"When all planned, phases created
and updated make sure each has nested goal and roadmap is updated and you update parent goal that
references all phase subgoals and send that in chat (max 4k chars) pause until I've set it."*

That work is done. [`goal-prompt.md`](goal-prompt.md) is the drafted prompt, under 4,000
characters. **Nothing in the order of work below starts until the operator has set it.**

Once it is set, the order is:

1. **Land the WebKit sheet fix, the column-width sheet and the settings sheet, then cut 0.0.21.**
   The three touch the same module and must not land as three independent guesses at the sheet
   chrome — `044`'s D2 is that an element a consumer can forget is one some consumer will forget.
2. **Reference captures (`043` T031) land**, and a fresh reviewer reads them beside our one-to-one
   copies. That closes `roadmap.md` §4 rows 37 and 38's in-repo half.
3. **The screenshots folder split lands last**, because every other leg writes captures and
   rebasing a moved tree under them is the expensive order.
4. **`044`'s remaining phone-sheet work**, ranked by
   `003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md` rather than by report order.
5. **`006-list-view-deprecation`'s children `005` -> `006` -> `007` -> `008`**, in that order and
   not negotiable.
6. **`045-board-card-properties`**, behind the existing `boardExtensionsEnabled` flag.
7. **`046-linked-views-notion-parity`**, and ADR-001 (may an embed write) is the operator's to
   answer before the four read-only gates are touched.

**Still owed from the operator regardless of the above**: device confirmation on reports 29-43 and
the five ported surfaces, across releases 0.0.16-0.0.20. Each confirmation closes its `roadmap.md`
§4 row; a "still broken" answer reopens the row with the device fact given, never argued with.
**No agent ticks an operator row.**

<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

**Read §2 first. This session is paused and the pause is the first instruction, not a note.**

1. Read this handover in full before touching anything.
2. Confirm the operator has set the goal prompt. If not, stop here and say so — the pause is not
   satisfied by the prompt existing on disk.
3. Run `npm run gate` from a clean `main` checkout and confirm 25/25 green before assuming the tree
   is as described here. A resume never trusts a stale gate claim.
4. Five legs are in flight and none is on main (§1's table). **Check each branch's tip before
   assuming its state** — three of them were dispatched this evening and moved after the last
   audit.
5. Work the order in §2, which the goal prompt also carries. Land, gate-green, ship; a phase is not
   done because its lane is green — D3 keeps shipped, verified and operator-confirmed apart.
6. Once the operator confirms the finished worktrees (022-035, 037-042 as they land) are no longer
   needed for reference, offer to remove them through `sk-git`.

<!-- /ANCHOR:session-notes -->

---

<!-- ANCHOR:next-session -->
## 4. GOTCHAS LEARNED THIS SESSION

- `tools/` is neither typechecked nor linted for TypeScript. Root `tsconfig.json` includes
  `src/**/*.ts` only, and `lint:tools` runs eslint over `tools/**/*.mjs`, so
  `render-assertion-harness.ts` — the file every constructed pass mounts through — has no gate
  covering it. An earlier audit cited `tsc --noEmit` as binding its 13 action bags to `src/views`'
  interfaces; the annotations are there, the enforcement is not. Do not cite a type annotation as
  evidence in this repo without checking which config actually compiles the file.
- A lane can depend strictly on a fixture and still not be harness-dependent. `replay.mjs` holds
  each claim on `actual === recorded`, and one claim loads `board-drop-language`'s hand-written
  markup — but the two class names it checks are asserted on a real `BoardRenderer` under real drag
  events by `board-renderer-parity.test.ts`. Ask what the value IS, not only where it was measured.
- Two exported lists in this tree are both called `SCENARIOS` and they cover different sets:
  `render-assertion-bundle.mjs`'s is what `render-assertions`, `touch-targets` and `unstyled-links`
  iterate, and `constructed-scenarios.mjs`'s `CONSTRUCTED_SCENARIOS` is what the capture pipeline
  photographs into the shared manifest. A scenario added to one is invisible to the other. Check
  which list a lane imports before claiming that lane covers a scenario.
- A lane's own evidence JSON is a before/after instrument. If a change was supposed to widen a
  lane's coverage, `git show <old-sha>:tools/live/<lane>.json` against the current file settles it
  in one command: an unchanged scenario count is proof the lane did not widen, stronger than any
  narrative in a summary.
- A file showing `UU` in `git status` but with zero `<<<<<<<` markers means the conflict was
  edited but never staged or continued; check both signals before assuming a rebase is blocked.
- A worktree rebased or branched before a sibling lane lands can go stale at its `--onto` target;
  check the target's distance from the current main tip before landing, not just before starting.
- Rebase a phase branch onto main before its verification, not after.
- Write the packet's implementation summary in the same pass as its first checklist ticks;
  validate.sh fails without it.
- The full landing sequence for a phase: verify in the worktree, commit on its own branch,
  fast-forward main, gate main, push, then release from a clean clone. Skipping the order risks
  gating a state main never actually reaches.
- The capture harness is not byte-deterministic: a handful of captures can move between identical
  runs on encoder noise alone; hash decoded pixels, not raw bytes, and restore a byte-only mover to
  its committed bytes rather than recommitting it.
- Run `npm run screenshots` detached; `check-lane` needs `SURFACE_PHASE` set. `screenshots-fresh`
  keys captures to source files, so a `src` change needs a recapture commit or the next gate is red.
- Build releases from `git clone --local`, never `git archive`. Never `git stash` in a tree another
  lane is writing; path-limit any stash to files you own.
- A review-type agent cannot write; hand its release, checklist-tick, and commit steps to a code
  leaf. Verify a port phase in its worktree, land to main only after the last leg is verified there.
- Every external delegate's claim is verified in-runtime: a delegate's report is a claim, not a
  result, and a browser number from a sandboxed or cloud lane is not evidence.
- A pipe makes `$?` the pipe's status; read exit codes directly, and `head` can SIGPIPE-truncate a
  run early; audit to completion, unpiped.
- `validate.sh` on a phase parent recurses into children; take the FIRST `RESULT:` line for this
  packet's own verdict. Regenerate metadata after any spec-doc edit.
- A completion figure is re-read fresh each audit against its criterion's own wording; a looser
  reading than the text is the same failure as a stricter one, pointed the other way.
- A criterion phrased as a readiness signal must name the instrument that can observe it. A frame
  count phrased as a pixel difference cannot be proven by screenshot, because the capture command
  flushes pending animation frames before it rasterises; the mount-level measurement can still be
  real and discriminating even when the pixel-level one is not.
- A constructed capture proves structure and layout, not typed rendering by default. Bench data
  defaults to untyped text columns and stub placeholder icons, so a fixture depicting a select
  pill, a date format, or a real icon stays the only evidence for that state until the bench data
  or the stub changes; declare the gap rather than letting the new capture quietly stand in for it.
- Declaring a dependency (naming it, bounding it, cross-checking it) does not remove it. A
  completion criterion phrased unconditionally still fails on a declared-and-bounded dependency,
  not only on a hidden one, unless every remaining piece is confirmed inert or genuinely equivalent.
- The same rule decides where a counterpart has to live: an artefact that exists in one lane's
  input set does nothing for a different lane's arithmetic. Ask which lane's exit code the claim is
  about, then check whether the counterpart enters THAT computation.
- Two independent ratchets are not a cross-check. `touch-targets` and `unstyled-links` each run a
  fixture pass and a constructed pass with separate baselines and a summed exit condition; nothing
  pairs a fixture id with its constructed counterpart, because `fixtureOf` is consumed only through
  `screenshots/manifest.json` and neither lane imports it. A second pass that supplements a first
  one catches what the first cannot see; it does not validate what the first measured.
- A bound that narrows a finding is not the same as closing it. When an audit trail narrows a
  criterion's population to a named subset, emptying that subset does not tick the criterion — the
  part the bound set aside has to be re-stated with a measured count, not inherited as closed.
  Re-scoping a residual upward on the pass that empties the tracked one is the honest move, and it
  reads like a moved goalpost unless you say which earlier audit named the part being restored.
- An evidence stamp is a measurement, not a constant. Two runs of `touch-targets` six minutes apart
  on identical `inputs` hashes returned 417 and 422 under-floor controls; the baseline is 422, so
  the ratchet sits exactly at the higher observed value. Before quoting a lane number, run it twice
  and diff the committed stamp — a single run agreeing with the docs is not the same as the lane
  being reproducible.
- A merged scenario list can throw rather than fail. `render-assertions.mjs` looks up
  `BAGS[renderer/bag]` and calls `.filter` on the result, so a scenario whose renderer has no bag
  entry crashes the lane instead of reporting a red. That is why the ten state variants ship as a
  sibling `SCENARIOS_WITH_STATES` export rather than being merged into `SCENARIOS`; verify a claim
  like that by enumerating the table's keys, not by reading the comment that asserts it.
- A capture container appended after an empty host div can inherit that div's full-viewport height
  as its own `offsetTop` reference before the mount moves inside it, producing a phantom scroll
  offset no real host pane ever has; detach the target container before mounting a renderer as
  `document.body`'s only child, then restore it once the render has already measured its window.
- A harness option landing for most registered views does not land for all of them. Check each
  view's own branch at its column-builder call site (does it read the option at all) rather than
  trusting an aggregate count like "7 of 9 typed" to also describe the other two.
- A registry-builder function that fans a new `ScenarioSpec` field through a spread-conditional list
  can silently drop one you forgot to add to that list, even though the harness branch that reads it
  is correct and a hand-built spec (including the one a red-first assertion script builds) proves it.
  The bug is invisible to the assertion script by construction — it bypasses the exact function the
  bug lives in — and was only caught by reading the actual captured PNG. Read every new capture
  rather than trusting a passing assertion alone.
- A popover positioned with `position: fixed`/`absolute` escapes an element-scoped `#shot` crop; a
  constructed capture of one needs the full-page (`page.screenshot()`, not `target.screenshot()`)
  path. The same popover can also take Obsidian's real bottom-sheet presentation on a phone
  (`isMobileBottomSheet`) instead of an anchored panel — a genuine device difference to expect and
  confirm by reading both captures, not a defect.
- A verbatim reference copy reproduces the reference's own visual quirks along with its structure.
  The gantt's milestone-label/month-band overpaint looked like a regression until reading the
  reference source itself showed both labels painting on the same header SVG at fixed `y` offsets
  in `GanttView`'s own code — a faithful copy is not obligated to be prettier than what it copies,
  and that distinction is an operator call, not a defect to silently patch over.
<!-- /ANCHOR:next-session -->
