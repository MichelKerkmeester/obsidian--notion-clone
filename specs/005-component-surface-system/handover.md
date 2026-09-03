---
title: "Session Handover: Component Surface System"
description: "Resume point mid-flight on the 037 port: leg (b) needs a ninth verification round."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-03T07:40:00Z"
    last_updated_by: "orchestrate-handover-3"
    recent_action: "Released 1.4.3 (85ff504); 037 leg b uncommitted after round 8"
    next_safe_action: "Ninth verification of 037 leg b, then rebase, push, docs, 1.4.4"
    blockers:
      - "Operator confirmation of reports 29-36 on iOS is still owed"
      - "037 leg b is uncommitted in the main checkout"
      - "Local main is behind origin until 037 commits"
    key_files:
      - "goal.md"
      - "roadmap.md"
      - "037-timeline-gantt-port/goal.md"
      - "037-timeline-gantt-port/tasks.md"
      - "038-board-kanban-port/goal.md"
      - "039-calendar-parity-port/goal.md"
      - "040-subtask-tree-port/goal.md"
      - "041-shared-ui-ux-port/goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover"
      parent_session_id: null
    completion_pct: 57
    open_questions: []
    answered_questions:
      - "spec.md vs goal.md completion_pct: reconciled at 57, one derived figure per phase (4 of 7 goal.md checklist rows ticked). D13, roadmap 3.2"
      - "The 036 research loop cannot run in the main checkout while a sibling code phase is dirty; it now runs in a worktree"
      - "036 synthesis landed at 036/research/research.md; lineage ledgers stay untracked by .gitignore rule specs/**/research/**/lineages/; iteration count is self-reported; 10/10 reference citations verified with three local citations corrected"
      - "1.4.3 fixed a bottom-sheet control that rebuilds its own content and closes the sheet: root cause was the overlay-stack seam missing a live panel resolver, and embedded views had never registered dismissal at all. Fix 85ff504, built and gated from a clean clone to avoid the 037 lane"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

1.4.2 shipped reports 30-33. 1.4.3 shipped reports 34-36: a control inside a bottom sheet that
rebuilds the sheet's content no longer closes it. The fix, `85ff504`, sits at the overlay-stack
seam with a live panel resolver; embedded views had never registered dismissal at all. 1.4.3 was
built and gated from a clean clone at
`scratchpad/release-1.4.3` (commits `9c0516f` recapture, `46ba24f` bump), because the main
checkout's tree is dirty with the 037 lane. Origin/main sits at `46ba24f`, local main at `1bcbd1e`.

Roadmap §4 now carries 35 rows. Parent completion sits at 57. The operator owes confirmation of
reports 29-36 on iOS; a push notification was sent 2026-09-02 22:35 (device pass) and again
2026-09-03 07:35 for the fuller set.

037-timeline-gantt-port leg (b) is in flight, uncommitted, after eight in-runtime verification
rounds. Treat it as unverified until you confirm it yourself.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. IN-FLIGHT LANE, AND HOW TO RECOGNISE IT

Run `git status --porcelain` first.

**037 leg (b): the CSS/renderer pass, main checkout, uncommitted.** Dirty files: renderer, model,
title formatter, `i18n.ts`, `styles.css` under the held CSS lane,
`tools/screenshots/scenarios/temporal.mjs` and `temporal-tick-parity.test.mjs`, the touch-targets
baseline (215 to 279, justified by an A/B check), the timeline PNGs, and
`037-timeline-gantt-port/tasks.md`. Recognise it by dirty `src/views/calendar-timeline-*`,
`src/data/calendar-*`, `styles.css`, and `temporal*`.

Code has held since round three. The fixture has been the recurring failure: it hand-mirrors
timeline geometry instead of importing the real export. The fix now in progress: the fixture's
unit widths must equal `resolveTimelineUnitWidth` (60/100/80/15/4) with a parity assertion, then a
recapture, then a ninth verification with commit authority.

On resume: check the scratchpad tasks for a RETURN block or a verifier report and continue from
it. If neither exists, dispatch a fresh Opus verifier with the eighth-round brief. The findings
file `scratchpad/037-findings-for-docs.md` lists product defects to record in 037's own docs, not
in this handover.
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. **Ninth verification of 037 leg (b).** Follow Section 2: resume from an existing RETURN or
   verifier report, or dispatch a fresh Opus verifier. Confirm the fixture parity assertion, the
   recapture, and `npm run gate` before commit authority.
2. **Commit with explicit paths** (never `git add -A`), matching the dirty-file list in Section 2.
3. **Rebase onto origin.** `git pull --rebase origin main`; expect no conflict beyond
   `screenshots/manifest.json`, which a recapture resolves.
4. **Push**, then write the 037 docs leaf from `scratchpad/037-findings-for-docs.md`.
5. **Release 1.4.4.**
6. **Dispatch 038 on cli-devin**, prompt drafted at `scratchpad/devin-038.prompt`, then 039, 040,
   041 in adoption-plan order. One cli-* lane at a time.
7. **Ask the operator to confirm reports 29-36 on iOS.** Record each row as confirmed or deferred
   in `roadmap.md` §4. An agent never closes an operator row itself.
<!-- /ANCHOR:session-notes -->

---

<!-- ANCHOR:next-session -->
## 4. GOTCHAS LEARNED THIS SESSION

- A hand-mirrored fixture must be constrained by parity tests that import the fixture and the real
  exports, or it lies; this was the root cause behind eight failed 037 rounds.
- Run `npm run screenshots` detached; `check-lane` needs `SURFACE_PHASE` set.
- `screenshots-fresh` keys captures to source files, so a `src` change needs a recapture commit or
  the next clean gate is red.
- Use `git clone --local`, not `git archive`, for a clean-tree build (used for 1.4.3).
- Never `git stash` in a tree another lane is writing.
- Open coverage row from 031: the embedded call site has no test driving the production method;
  eleven other `installPopoverAutoClose` consumers remain unaudited.
- `generate-context.js` must be invoked THROUGH the `.opencode` symlink with
  `NODE_PRESERVE_SYMLINKS=1`, not via `realpath`; `validate.sh` runs via `realpath`.
- The fan-out containment check (`fanout-run.cjs`) scans the WHOLE worktree, so a dirty sibling
  lane anywhere in the checkout rejects a loop launch even when the loop's own files are clean.
- Every external delegate's claim is verified in-runtime (D4, D14): a delegate's report is a claim,
  not a result, and a browser number from a sandboxed or cloud lane is not evidence.
- A pipe makes `$?` the pipe's status; read exit codes directly.
- `validate.sh` on a phase parent recurses into children; take the FIRST `RESULT:` line for this
  packet's own verdict.
- Regenerate metadata after any spec-doc edit or the fingerprint check fails.
- Commit scopes must not be numeric; use `specs`, `release`, `phone-chrome`, `render-assertions`.
- Uncommitted work in the main checkout can be wiped by a sibling lane, so external code lanes get
  verified and committed promptly.
- See also `scratchpad/epic-traps.md` for the fuller list; it is session-scoped and not
  load-bearing on its own.
<!-- /ANCHOR:next-session -->
