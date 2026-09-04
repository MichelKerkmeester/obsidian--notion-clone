---
title: "Session Handover: Component Surface System"
description: "Resume point: 043's fifth leg (T029) is merged, so touch-targets and unstyled-links read 31 constructed scenarios instead of 21 and row 6's tracked residual is closed; done-audit-10 re-read the row on main and keeps it open, re-scoped to the fixture half of those two lanes. 038's board 1:1 shipped as 0.0.16; 037's gantt 1:1 is landing. The operator owes device confirmation and the 043 AC-002 ruling."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-04T09:13:25Z"
    last_updated_by: "done-audit-10"
    recent_action: "T029 widened both constructed lanes 21 -> 31; done-audit-10 re-read row 6, still open"
    next_safe_action: "Operator confirms 0.0.16 on device and rules on 043 AC-002; gantt 1:1 lands next"
    blockers:
      - "operator confirmation owed: reports 29-36, the five ported surfaces, and 0.0.16's board copy"
      - "row 6 re-scoped: 42 of 71 fixture scenarios have no constructed counterpart in either lane"
      - "043's AC-002 ruling owed: amend the criterion to the inside-mount measurement, or accept determinism as its basis"
      - "038's board 1:1 shipped as 0.0.16; 037's gantt 1:1 is landing from worktrees/024 (7617f85)"
    key_files:
      - "goal.md"
      - "roadmap.md"
      - "043-constructed-capture/implementation-summary.md"
      - "043-constructed-capture/goal.md"
      - "043-constructed-capture/tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover"
      parent_session_id: null
    completion_pct: 57
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
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

As of 2026-09-04, releases 0.0.7 through 0.0.15 (formerly 1.4.2 through 1.4.10, renumbered this
session — `roadmap.md` §5.3) are live on GitHub and installed into the iCloud vault plugin folder
(`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel
Kerkmeester/.obsidian/plugins/note-database`), each with a `.backup-<old>` beside it. **0.0.16 is
cut** (`46a8525`, tag present on `origin`, verified with `git ls-remote --tags`), carrying `038`'s
board one-to-one copy; `main` reads 0.0.16, the iCloud install still reads 0.0.15, and the next cut
is 0.0.17.

All five obsidian-pm port phases (037-041) are landed and shipped, and every open product row they
carried is closed. Both harness phases the parent's DONE table opened are landed too. `043` is now
merged across five legs on main at `65238ad`: the structural landing (`2ab4942`), typed data and
real icons (`0af4ca6`, reconciled `bf67475`), table and chart typing (`425d552`, T027), the state
variants (`d363456`, T028, reconciled `dc67803`), and the widened constructed lanes (`122a959`,
T029, reconciled `ce72379`, numbers trued up in `65238ad`). All 13 of DONE row 6's named
fixture-only scenarios carry a constructed counterpart in the shared capture manifest, and the ten
of them that needed one now also enter `touch-targets`' and `unstyled-links`' own constructed pass.

**The parent DONE table stays 4 of 7 = 57.** Rows 3, 4, 5 and 7 hold; rows 1 and 2 are the
operator's. Row 6 was re-audited on main at `65238ad` as **done-audit-10** and stays open — but
re-scoped rather than narrowed again, because the residual it was tracking is now empty. What
closed, measured in that audit rather than carried from the landing: `render-assertion-bundle.mjs`
exports `STATE_SCENARIOS` (10) and `SCENARIOS_WITH_STATES` (**31** = 21 + 10), and both lanes import
the latter; `node tools/live/touch-targets.mjs` exit 0 with constructed **50462** elements across
**31** scenarios and **422** under the 28px floor against a rebaselined **422** (was 21 scenarios,
367 against 367); `node tools/live/unstyled-links.mjs` exit 0 with constructed **72** links across
**31** and **0** user-agent-default findings, was **0** links across 21 — so the standing prediction
that widening alone would leave that half vacuous is superseded, because 7 of the ten state variants
set `captureData` and that is what builds the relation and file-type fields. Two things that could
have kept the row open did not: the three toolbar `renderer` values really are why `SCENARIOS`
itself stayed at 21 (`BAGS` holds exactly 13 keys, none of them the toolbar triple, and
`render-assertions.mjs:277`/`:279` would throw a `TypeError` on a merged list rather than fail a
check), and `render-assertions.mjs` — still reading the 21 — leaves no criterion green on a
harness-supplied value. **What keeps row 6 open is the fixture half of those same two lanes.** Both
exit codes still require a fixture pass over **71** hand-authored scenarios, of which **20** carry
`fixtureOf` and **51** do not, and **42** of those 51 are the `panel-*`, `chrome-*`, `field-*` and
popover families that no constructed scenario in either lane mounts at all. Neither lane reads
`fixtureOf` — it is consumed only through `screenshots/manifest.json` — so the constructed pass
supplements the fixture pass without validating any individual fixture. That is `done-audit-3`'s
class (3) in the part `done-audit-6`'s `fixtureOf` bound set aside rather than closed. Closing move,
now larger than the last one: give those surfaces a constructed counterpart in the same two lanes (a
mount seam for builders that are not view renderers, which does not exist yet), or take the fixture
pass out of the exit condition and keep it as a reported-not-enforced number beside the constructed
one.

**One 1:1 reopen lane has landed, the other is landing.** At the operator's request, `037` and `038`
were reopened for one-to-one copies of obsidian-pm's gantt and board surfaces (REQ-007 in each
child's `spec.md`). `038`'s board leg is **done**: both legs verified on
`worktrees/023-board-one-to-one`, merged and reconciled onto main in `854c748`, and cut as release
**0.0.16** in `46a8525`. Its arrival is visible in this audit's own numbers — the constructed pass's
scanned element total moved 57060 -> 50462 and its constructed link total 144 -> 72 with the
pass/fail figures unmoved, and the port added the 71st fixture scenario
(`chrome-board-extensions-selection`, `d921404`) straight into the set with no constructed
counterpart. `037`'s gantt leg is **landing**, not landed: `worktrees/024-gantt-one-to-one` at
`7617f85` (TypeScript leg `d30ea78`+`9bd044a`, CSS leg recorded in `2a6d98f`+`7617f85`), and main
does not carry it yet — no DONE row, release, or operator row moves on its account until it lands
and is verified in-runtime.

Main is at `65238ad`, gate 25 green as of the landing pass. The working-tree dirt is
`tools/live/*.json` rewritten by this audit's lane runs, left uncommitted deliberately.
`unstyled-links.json` differs from HEAD in its `measuredAt` timestamp alone. `touch-targets.json`
does **not**: HEAD's stamp (from the `ce72379` run) reads constructed `50444`/`under 417`, and two
runs here both read `50462`/`under 422` on identical `inputs` hashes with no `src/` commit between
them. Both clear the 422 baseline, but the baseline equals the higher value, so the ratchet is on
its ceiling — record the spread before treating either number as the lane's.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: OPERATOR CONFIRMS AND RULES

No code lane is queued in the main checkout. Two decisions are the operator's, not an agent's.
First, `043`'s AC-002: the readiness wait is real inside the mount (`scrollTop` moves 0 to 376
across one frame), but the screenshot command flushes that frame before it rasterises, so a
photograph can never show the difference the criterion asks for. Amend the criterion to the
inside-mount measurement, or accept determinism as its basis. Second, device confirmation: reports
29-36, the five ported surfaces, and now `038`'s board one-to-one copy in 0.0.16. Each confirmation
closes its `roadmap.md` §4 row; each "still broken" reopens it with the device fact given, not an
assumption. 0.0.16 is cut but the iCloud install still reads 0.0.15, so installing it is the
prerequisite for confirming the board copy.

Candidate next work is bounded, not open-ended: landing `037`'s gantt 1:1 leg from its worktree
under the usual discipline and cutting 0.0.17, row 6's re-scoped closing move above, whatever the
operator's confirmations reopen, and whatever AC-002's ruling requires. Nothing else is queued.
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. Install 0.0.16 into the iCloud vault plugin folder (it still reads 0.0.15), then ask the
   operator to confirm reports 29-36, the five ported surfaces, and `038`'s board 1:1 copy on iOS.
2. Bring the AC-002 wording decision to the operator; do not amend or tick it without their
   answer.
3. Record each answer in `roadmap.md` §4: confirmed rows close, "still broken" rows reopen with
   the device fact given. An agent never closes an operator row on its own judgment.
4. Land `037`'s gantt 1:1 leg from `worktrees/024-gantt-one-to-one` (`7617f85`) under the usual
   discipline — verify in the worktree, fast-forward main, gate main, push, release from a clean
   clone as 0.0.17 — and never report it as landed against main until `git merge-base
   --is-ancestor` says so. `038`'s board leg is already merged (`854c748`) and shipped (0.0.16).
5. Row 6's re-scoped closing move, when a lane is free: give the `panel-*`/`chrome-*`/`field-*` and
   popover surfaces a constructed counterpart inside `touch-targets` and `unstyled-links`
   themselves — their builders are not view renderers, so this needs a mount seam the harness does
   not have — or take the fixture pass out of those two lanes' exit conditions and keep it as a
   reported-not-enforced number. Then let a fresh audit, not the implementing pass, re-read the
   row (D4).
6. Offer to remove the finished worktrees (003-022) through sk-git once the operator confirms
   they are no longer needed for reference.
<!-- /ANCHOR:session-notes -->

---

<!-- ANCHOR:next-session -->
## 4. GOTCHAS LEARNED THIS SESSION

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
