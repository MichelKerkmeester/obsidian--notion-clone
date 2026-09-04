---
title: "Session Handover: Component Surface System"
description: "Resume point: 043 T030 landed and done-audit-11 ticked DONE row 6, taking the parent to 5 of 7 = 71 — rows 1 and 2 (operator device confirmation) are the only open ones left. Both fidelity passes shipped: board as 0.0.18, gantt as 0.0.19. Two legs stay in flight outside main, board T12's closing leg (worktrees/033) and a gantt behaviour pass (worktrees/032). The operator owes device confirmation and the 043 AC-002 ruling."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-04T13:17:14Z"
    last_updated_by: "done-audit-11"
    recent_action: "Done-audit-11 ticked DONE row 6 after T030 landed; parent goes 4 of 7 to 5 of 7"
    next_safe_action: "Operator confirms 0.0.16-0.0.19 on device; 043 AC-002 ruling still owed"
    blockers:
      - "operator confirmation owed: reports 29-36, the five ported surfaces, and 0.0.16 through 0.0.19"
      - "board T12's operator half owed: compare the board against obsidian-pm's kanban in the vault"
      - "board T12 closing leg on worktrees/033-board-t12; not on main at 2242fa0"
      - "gantt behaviour pass landing from worktrees/032-gantt-residual; not on main at 2242fa0"
      - "043's AC-002 ruling owed: amend it to the inside-mount measurement, or take determinism"
    key_files:
      - "goal.md"
      - "roadmap.md"
      - "043-constructed-capture/tasks.md"
      - "043-constructed-capture/implementation-summary.md"
      - "038-board-kanban-port/tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover"
      parent_session_id: null
    completion_pct: 71
    open_questions:
      - "043 AC-002: amend the criterion to the inside-mount scrollTop measurement, or accept determinism as the basis"
    answered_questions:
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
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

As of 2026-09-04, releases 0.0.7 through 0.0.19 (0.0.7-0.0.15 formerly 1.4.2 through 1.4.10,
renumbered this session — `roadmap.md` §5.3) are live on GitHub and installed into the iCloud vault
plugin folder (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel
Kerkmeester/.obsidian/plugins/note-database`), each with a `.backup-<old>` beside it. **0.0.16**
(`46a8525`) carries `038`'s board one-to-one copy and **0.0.17** (`839712b`) `037`'s gantt one-to-one
copy; **0.0.18** (`96f878a5`) then carries `038`'s board fidelity pass, and **0.0.19** (`07f4500f`)
`037`'s gantt fidelity pass together with the board's closing fixes. All four tags are on `origin`.
`main` at `2242fa0` reads **0.0.19**; the next cut is **0.0.20**.

All five obsidian-pm port phases (037-041) are landed and shipped, and every open product row they
carried is closed. Both harness phases the parent's DONE table opened are landed too. `043` is now
merged across six legs on main at `2242fa0`: the structural landing (`2ab4942`), typed data and
real icons (`0af4ca6`, reconciled `bf67475`), table and chart typing (`425d552`, T027), the state
variants (`d363456`, T028, reconciled `dc67803`), the widened constructed lanes (`122a959`, T029,
reconciled `ce72379`), and the constructed fixture families (`c4c7466`+`64db8d5`+`6fa715e`, T030,
trued up onto the gantt and board fidelity passes in `d94e11f`/`2506bb2`/`2242fa0`). Of the 71
hand-authored fixtures, **66** now carry a `fixtureOf` declaration onto a production-mounted
constructed counterpart and **5** cannot — and both lanes' own constructed pass reads **73**
scenarios, wider than the fixture pass it supplements.

**The parent DONE table is 5 of 7 = 71.** Rows 3, 4, 5, 6 and 7 hold; rows 1 and 2 are the
operator's and are now the only open rows in it. **Row 6 was ticked on main at `2242fa0` as
`done-audit-11`**, after `043` T030 constructed the fixture families `done-audit-10` had re-scoped
it to. What closed, each check against the value it replaced: fixtures with no constructed
counterpart **51 -> 5**, read by importing `scenarios.mjs` and filtering rather than grepping (71
fixtures, 66 with `fixtureOf`, 5 without); both lanes' constructed pass **21 -> 31 -> 73**
(`SCENARIOS` 21 + `STATE_SCENARIOS` 52 = `SCENARIOS_WITH_STATES` 73, 35 distinct `renderer` values);
`node tools/live/touch-targets.mjs` `$?` `0` on three consecutive runs returning byte-identical
output — constructed **24788** elements across **73** scenarios and **1223** under the 28px floor
against a baseline of **1223** (was 422/422 across 31), fixture **1123/71/199** against 279 (was
1450/71/264, the drop being main's board and gantt ports moving `styles.css`, not a fixture edit);
`node tools/live/unstyled-links.mjs` `$?` `0` — constructed **1476** links across **73** and **0**
user-agent-default findings (was 72 across 31). `done-audit-10`'s "the ratchet is decided by timing"
caveat is retired at its cause rather than inherited: T030 added the body-portal teardown sweep that
had each scenario measuring every earlier scenario's stacked panels.

**Why the five that cannot be constructed do not keep the row open.** They are
`panel-computed-cleanup-modal`, `panel-invalid-events-modal` and `panel-base-import-modal` (all
`DbModal extends Modal`, which `obsidian-stub.mjs:202` refuses as out-of-scope),
`chrome-selection-status-bar` (a `MarkdownRenderChild` host whose state exists only mid-gesture) and
`board-drop-language` (drag classes added only by live `dragstart`/`dragover` handlers). The
criterion is conjunctive — a green must rest on a harness value **that a device would not supply** —
and `done-audit-7` already set the test for a named class member when it ruled the stubbed action
bags a declared residual. Applied to each: two of the five reach a lane's arithmetic only as 2 and 3
of the 199 undeclared under-floor rows, which *consume* ratchet headroom (`fixtureFailed` is
`undeclared.length > allowed`, so a fixture manufactures reds here and never greens); one
contributes nothing to either lane; the status bar's product claims are asserted on production
output by the placement lane, which builds the bar through `renderSelectionStatusBar`; and
`board-drop-language`, the one genuinely load-bearing case (`replay.mjs:600`, held on exact
equality), supplies two class names that `board-renderer-parity.test.ts` asserts on a real
`BoardRenderer` under real drag events inside the `tests` lane. What the tick does **not** claim: the
five stay a structural coverage gap, a red the corpus cannot raise, recorded against row 3's ledger.

**Both 1:1 reopen lanes and both fidelity passes have landed and shipped.** At the operator's
request, `037` and `038` were reopened for one-to-one copies of obsidian-pm's gantt and board
surfaces (REQ-007 in each child's `spec.md`). `038`'s board leg landed first, merged and reconciled
onto main in `854c748` and cut as **0.0.16** (`46a8525`); `037`'s gantt leg followed (TypeScript
`d30ea78`, CSS `2a6d98f`, merged `972c2cd`/`a00ad31`) and was cut as **0.0.17** (`839712b`). A fresh
reviewer (T12) then found real fidelity divergences in the board copy against the reference —
palette names painted as inline colors and illegible in dark mode, a left-aligned due chip, a stray
"Sub" chip, a missing badge icon/priority strip/milestone/recurrence chips/due-soon tier, selectors
unscoped enough to style a co-installed Project Manager, and an extra 24px host inset. **That pass
has landed and shipped as 0.0.18** (`a6abd0a9`+`cb6ef827`, reconciled `01883cf8`, trued up
`b1e75124`, cut `96f878a5`), with its closing fixes following in `2cddc7cf`+`d896f90e` (kanban
height chain, due-tier and badge-icon fidelity) and `595dc283`+`7d5b3f90` (responsive host padding,
photograph avatars, milestone chips). **`037`'s gantt fidelity pass landed and shipped as 0.0.19**
(`119f5936`+`8c563a35`, reconciled `5fd4fc7d`, trued up `6d12740a`, cut `07f4500f`). Board `T12`'s
in-repo half is now met by a fourth fresh read, and `c563f089` mirrored its operator half into
`038`'s own `goal.md` as an operator-only row so `build-operator-checklist.mjs` surfaces it; T12
itself stays unticked because that operator comparison is owed.

Main is at `2242fa0` (`043`'s T030 reconciliation onto the board fidelity work), working tree clean
as of this pass — the three `touch-targets` runs and the `unstyled-links` run this audit made
reproduce HEAD's committed stamps exactly, so they left no `tools/live/*.json` dirt. Two legs run
outside main and neither is an ancestor of it: **`worktrees/033-board-t12`** carries board T12's
closing leg, and **`worktrees/032-gantt-residual`** a gantt behaviour pass. No DONE row, release or
operator row moves on their account until they land and are verified in-runtime.
of.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: OPERATOR CONFIRMS AND RULES

No code lane is queued in the main checkout itself; the two remaining legs run in worktrees outside
it (below). With `done-audit-11` ticking DONE row 6, **rows 1 and 2 are the only open rows in the
parent table, and both are the operator's** — no agent can close either. Two decisions are theirs,
not an agent's. First, `043`'s AC-002: the readiness wait is real inside the mount (`scrollTop`
moves 0 to 376 across one frame), but the screenshot command flushes that frame before it
rasterises, so a photograph can never show the difference the criterion asks for. Amend the
criterion to the inside-mount measurement, or accept determinism as its basis. Second, device
confirmation: reports 29-36, the five ported surfaces, and now all four of `038`'s board one-to-one
copy (0.0.16), `037`'s gantt one-to-one copy (0.0.17), the board fidelity pass (0.0.18) and the
gantt fidelity pass (0.0.19). Each confirmation closes its `roadmap.md` §4 row; each "still broken"
reopens it with the device fact given, not an assumption. All four releases are installed to the
iCloud vault, so no install step blocks any of them — and unlike the last handover, a confirmation
today is against the post-fidelity-pass copies. Board `T12`'s operator half (comparing the board
against obsidian-pm's kanban in the vault where both are installed) is now surfaced in
`operator-checklist.md` and is part of the same ask.

Candidate next work is bounded, not open-ended: board T12's closing leg on
`worktrees/033-board-t12`, the gantt behaviour pass landing from `worktrees/032-gantt-residual`,
whatever the operator's confirmations reopen, and whatever AC-002's ruling requires. Nothing else is
queued.
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

Two legs are in flight; neither is landed on main yet, and neither blocks the other.

1. **`worktrees/033-board-t12`** — board `T12`'s closing leg. The in-repo half is already met by a
   fourth fresh read, and `c563f089` mirrored the operator half into `038`'s `goal.md` as an
   operator-only row; land the remainder under the usual discipline once verified there.
2. **`worktrees/032-gantt-residual`** — the gantt behaviour pass following `037`'s fidelity leg.
   Land it the same way; re-run the lanes on the merged tree rather than carrying the branch's own
   numbers, since the last two rebases each moved a lane total.
3. Ask the operator to confirm reports 29-36, the five ported surfaces, and all four of 0.0.16,
   0.0.17, 0.0.18 and 0.0.19 on iOS — every one is already installed, so no install step blocks
   this — plus board T12's operator half, the side-by-side vault comparison against obsidian-pm's
   kanban, now listed in `operator-checklist.md`.
4. Bring the AC-002 wording decision to the operator; do not amend or tick it without their answer.
5. Record each answer in `roadmap.md` §4: confirmed rows close, "still broken" rows reopen with
   the device fact given. An agent never closes an operator row on its own judgment.
6. DONE row 6 is ticked and needs no further audit. What it explicitly does NOT cover is the
   coverage limit it names: the five unconstructable fixtures are a red the corpus cannot raise,
   which belongs to row 3's ledger and `043`'s Known Limitations, not to row 6.
7. Offer to remove the finished worktrees through sk-git once the operator confirms they are no
   longer needed for reference.
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
<!-- /ANCHOR:next-session -->
