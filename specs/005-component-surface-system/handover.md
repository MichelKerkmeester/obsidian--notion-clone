---
title: "Session Handover: Component Surface System"
description: "Resume point: five obsidian-pm port phases, 042, and all three 043 legs (structural, typed data and real icons, then table and chart) are landed and merged; a fourth 043 leg (T028, all 13 row-6 fixture-only scenarios now constructed) is landed on an unmerged worktree; no lane is in flight; the operator owes device confirmation, the 043 AC-002 ruling, and a merge decision on the T028 worktree."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-04T11:00:00Z"
    last_updated_by: "in-runtime-code-agent"
    recent_action: "043 T028 landed on an unmerged worktree; row 6 narrowed"
    next_safe_action: "Decide whether to merge the T028 worktree; fresh audit reads row 6"
    blockers:
      - "operator confirmation owed: reports 29-36 and the five ported surfaces, on 1.4.10"
      - "043's AC-002 ruling owed: amend the criterion, or accept determinism as its basis"
      - "worktrees/022-constructed-state-variants carries T028's landing but is unmerged; main is unaffected until it lands"
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
      - "043 T028 (worktree, unmerged): all 13 of row 6's named fixture-only scenarios now have a constructed counterpart, ten via new additive ScenarioSpec options (subtaskTree, sparseFields, emptyState, chartVariant, miniCalendar, three new toolbar-popover renderer values), three (table/list/board-mobile) via a fixtureOf declaration onto the existing mobile-device capture already on record. Red-first constructed-state-assertions.mjs failed 16 of 16 before, passed all after. Two detached runs: 0 of 352 entries changed; all 312 pre-existing entries matched committed HEAD exactly. A real bug (constructedScenario() dropping opts.miniCalendar) was found only by reading the 40 new captures, after the assertion script had already reported green through a spec that bypassed it. Row 6 deliberately left unticked (D4: a fresh reviewer verifies, never self-certify) — the residual question is whether touch-targets.mjs/unstyled-links.mjs's own constructed pass not yet covering these ten states still disqualifies the tick"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

As of 2026-09-04 07:00 CEST, releases 1.4.2 through 1.4.10 are live on GitHub and installed into
the iCloud vault plugin folder (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel
Kerkmeester/.obsidian/plugins/note-database`), each with a `.backup-<old>` beside it.

All five obsidian-pm port phases (037-041) are landed and shipped, and every open product row they
carried is closed. Both harness phases the parent's DONE table opened are landed too. 042 gave
chart and calendar week/day their production renderers and brought replay to 28 held claims,
reversed 0. 043 landed across three legs on main, equal to origin: the structural landing at
`2ab4942` (nine constructed scenarios, 36 captures, mounted through 042's own bundle seam), a
typed-data landing at `0af4ca6` (reconciled in `bf67475`) giving list, board, gallery, calendar and
timeline real typed cells and 21 real icon names, and `425d552` (T027), which closed the last two
views: table now routes through a real `CellRenderer` when `captureData` is on, and chart sums a
real per-row value column instead of a flat row count. Typed data and real icons now land for all
nine constructed views; `typed-data-assertions.mjs` extended to 6 of 6 new markers, red before and
green after.

The parent DONE table (`goal.md`'s 7-row checklist) is 4 of 7 = 57, unchanged this pass: rows 3, 4,
5 and 7 hold. Row 6 was re-audited against `425d552` (done-audit-8) and stays open, narrowed a
third time: the typed-state/icon gap is fully closed for all nine views, so what remains is 13
named fixture-only scenarios (mobile widths, subtask-tree overlays, sparse fields, empty states,
toolbar-options popovers, and the chart view's three chrome popovers) with no constructed or device
counterpart at all. They back five of the 25 `npm run gate` lanes (`css-lane`, `screenshots-fresh`,
`device-parity`, `touch-targets`, `unstyled-links`), so ticked row 4's "exits 0" is itself partly
computed over their hand-authored markup, not only the fixture lanes' own greens. Row 3 is
unaffected: none of the 13 is one of the seven `DatabaseViewType` values. Rows 1 and 2 stay open on
operator device confirmation, unrelated to either phase.

No lane is in flight. Worktrees 003 through 021 are all merged or finished into main, confirmed
directly: every worktree's HEAD commit is an ancestor of `425d552`. Removing the finished worktrees
is the operator's call, through sk-git. Main is clean at `425d552` and equal to origin/main.

**One new worktree carries unmerged work.** `worktrees/022-constructed-state-variants` landed T028:
all 13 of row 6's named fixture-only scenarios now have a constructed counterpart, mounted through
real production code paths (including three toolbar renderers' own `togglePopover()`, never a
hand-applied class). Ten scenarios needed new, additive `ScenarioSpec` options on
`render-assertion-harness.ts`; three needed only a `fixtureOf` declaration onto an existing capture
already on record. Full evidence lives in `043`'s own three docs. Row 6 was narrowed a fourth time
but deliberately NOT ticked — that judgment is left to a fresh audit, per D4. Main is unaffected
until an operator/orchestrator decides to merge this branch.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: OPERATOR CONFIRMS AND RULES

No code lane is queued. Two decisions are the operator's, not an agent's. First, 043's AC-002:
the readiness wait is real inside the mount (`scrollTop` moves 0 to 376 across one frame), but the
screenshot command flushes that frame before it rasterises, so a photograph can never show the
difference the criterion asks for. Amend the criterion to the inside-mount measurement, or accept
determinism as its basis. Second, device confirmation: reports 29-36 and the five ported surfaces,
now that 1.4.10 is installed. Each confirmation closes its `roadmap.md` §4 row; each "still
broken" reopens it with the device fact given, not an assumption.

Candidate next work is bounded, not open-ended: whether to merge `worktrees/022-constructed-state-
variants` (row 6's own remaining list now has a constructed counterpart for all 13, awaiting a fresh
audit's judgment before it ticks), what the operator's confirmations reopen, and whatever AC-002's
ruling requires. Nothing else is queued.
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. Ask the operator to confirm reports 29-36 and the five ported surfaces on iOS, on 1.4.10.
2. Bring the AC-002 wording decision to the operator; do not amend or tick it without their
   answer.
3. Record each answer in `roadmap.md` §4: confirmed rows close, "still broken" rows reopen with
   the device fact given. An agent never closes an operator row on its own judgment.
4. Decide whether to merge `worktrees/022-constructed-state-variants` (043 T028: all 13 row-6
   fixture-only scenarios now constructed, full evidence in `043`'s own docs). A fresh audit should
   re-read row 6 against that evidence before it ticks — do not tick it on the landing pass's own
   say-so (D4).
5. Offer to remove the finished worktrees (003-021) through sk-git once the operator confirms
   they are no longer needed for reference.
<!-- /ANCHOR:session-notes -->

---

<!-- ANCHOR:next-session -->
## 4. GOTCHAS LEARNED THIS SESSION

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
