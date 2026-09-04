---
title: "Session Handover: Component Surface System"
description: "Resume point: five obsidian-pm port phases and every open row they carried are shipped through 1.4.10; 042 and 043 harness phases both landed; a list-view phone-fold diagnosis is in flight in its own worktree; the operator owes device confirmation and the 043 AC-002 ruling."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-04T10:40:00Z"
    last_updated_by: "orchestrate-handover-10"
    recent_action: "043 landed; row 6 stays open; list-phone-fold diagnosis lane opened"
    next_safe_action: "Land the list-fold diagnosis; operator confirms and rules"
    blockers:
      - "operator confirmation owed: reports 29-36 and the five ported surfaces, on 1.4.10"
      - "043's AC-002 ruling owed: amend the criterion, or accept determinism as its basis"
    key_files:
      - "goal.md"
      - "roadmap.md"
      - "043-constructed-capture/implementation-summary.md"
      - "043-constructed-capture/goal.md"
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
      - "Done-audit-6: 043 landing did not close DONE row 6. Every constructed bench column is untyped text and every icon is the stub's placeholder diamond, so the fixture pass still carries the only evidence for typed rendering and icon fidelity across the 7 declared pairs and 13 fixture-only scenarios. That dependency is now declared and bounded rather than hidden, but this row's own precedent holds a declared-and-bounded dependency is still a dependency. completion_pct stays 4 of 7 = 57"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

As of 2026-09-04 10:40 CEST, releases 1.4.2 through 1.4.10 are live on GitHub and installed into
the iCloud vault plugin folder (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel
Kerkmeester/.obsidian/plugins/note-database`), each with a `.backup-<old>` beside it.

All five obsidian-pm port phases (037-041) are landed and shipped, and every open product row they
carried is now closed. 037's day-scale fixture centring, the last of its four rows, closed in
1.4.10.

Both harness phases the parent's DONE table opened are now landed. 042-harness-fidelity-and-replay
gave chart and calendar week/day their production renderers and brought replay to 28 held claims,
reversed 0. 043-constructed-capture landed at `2ab4942`: nine constructed scenarios, 36 captures,
mounted through 042's own bundle seam, photograph every registered view for the first time. Seven
of eleven planned fixtures are declared superseded; the other 13 stay fixture-only, named rather
than dropped. Three of its own criteria are unmet: AC-002 (a readiness negative control the
screenshot command's own frame-flush makes unmeetable, needing an operator ruling), the separate
manifest file AC-006 asked for (constructed entries share the fixture manifest instead), and the
timeline scale set (captured at week only, the other four scales untouched).

The parent DONE table (goal.md's 7-row checklist) is 4 of 7 = 57: rows 3, 4, 5 and 7 hold. Row 6
was re-audited against the merged 043 tree and stays open, narrowed rather than closed: every
constructed bench column is untyped text and every icon is the stub's placeholder diamond, so the
fixture pass across css-lane, screenshots-fresh and device-parity still carries the only evidence
for typed rendering and icon fidelity on the 7 declared pairs and 13 fixture-only scenarios. That
dependency is declared and bounded now, not hidden, but a declared dependency is still a dependency
under this row's own precedent. Rows 1 and 2 stay open on operator device confirmation, unrelated
to either phase.

One diagnosis lane is in flight, unrelated to 043's own scope. A constructed capture showed the
list view's virtual window landing below the fold on the phone: the first row sits at y=1964 in an
874px viewport. The outcome is pending in worktree `list-phone-fold`.

Worktrees are merged or finished except that one. Removing the finished ones is the operator's
call, through sk-git. Main is clean at the last commit and equal to origin/main at `2ab4942`.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. NEXT SAFE ACTION: LAND THE DIAGNOSIS, THEN OPERATOR RULINGS

The next safe action is not a fresh code lane. Let the `list-phone-fold` worktree's diagnosis
finish, then verify and land it the same way every prior phase landed: verify with Chrome in the
worktree, fill the packet's evidence, commit on the worktree's own branch, fast-forward main, gate
main, push.

Two rulings are the operator's, not an agent's. First, 043's AC-002: the readiness wait is real
inside the mount (`scrollTop` moves 0 to 376 across one frame) but the screenshot command flushes
that frame before it rasterises, so a photograph can never show the difference the criterion asks
for. Amend the criterion to the inside-mount measurement, or accept determinism as its basis.
Second, device confirmation: reports 29-36 and the five ported surfaces, once 1.4.10 is installed.
Each confirmation closes its `roadmap.md` §4 row; each "still broken" reopens it with the device
fact given, not an assumption.
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. Check worktree `list-phone-fold`'s status before assuming the diagnosis is ready to land.
2. Verify in the worktree with Chrome, fill the packet's evidence, commit on the worktree's own
   branch.
3. Land to main: fast-forward, gate main, push.
4. Bring the AC-002 wording decision to the operator; do not amend or tick it without their answer.
5. Ask the operator to confirm reports 29-36 and the five ported surfaces on iOS, on 1.4.10.
6. Record each answer in `roadmap.md` §4: confirmed rows close, "still broken" rows reopen with the
   device fact given. An agent never closes an operator row on its own judgment.
7. Once the diagnosis lands and both operator rulings are in, pick the next item or open a fresh
   spec-folder decision (Gate 3) for a new packet.
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
- A constructed capture proves structure and layout, not typed rendering. Bench data defaults to
  untyped text columns and stub placeholder icons, so a fixture depicting a select pill, a date
  format, or a real icon stays the only evidence for that state until the bench data or the stub
  changes; declare the gap rather than letting the new capture quietly stand in for it.
- Declaring a dependency (naming it, bounding it, cross-checking it) does not remove it. A
  completion criterion phrased unconditionally still fails on a declared-and-bounded dependency,
  not only on a hidden one.
<!-- /ANCHOR:next-session -->
