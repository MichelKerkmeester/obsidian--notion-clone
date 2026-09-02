---
title: "Session Handover: Component Surface System"
description: "Resume point after a usage-limit cutoff mid-flight: three parallel lanes in progress, none landed."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-02T22:10:00Z"
    last_updated_by: "orchestrate-handover"
    recent_action: "Saved resume handover; 036 loop moved to worktree 003"
    next_safe_action: "Check git status; finish reports 30-33 code phase, cut 1.4.2"
    blockers:
      - "The usage-limit cutoff landed mid-flight: three lanes are open and none has been verified or committed"
      - "Reports 29-33 are still unconfirmed on the operator's device beyond the report 29 partial"
    key_files:
      - "goal.md"
      - "roadmap.md"
      - "036-obsidian-pm-ui-harvest/goal.md"
      - "031-sheet-lifecycle-ownership/goal.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-handover"
      parent_session_id: null
    completion_pct: 57
    open_questions: []
    answered_questions:
      - "spec.md vs goal.md completion_pct: reconciled at 57, one derived figure per phase (4 of 7 goal.md checklist rows ticked). D13, roadmap 3.2"
      - "The 036 research loop cannot run in the main checkout while a sibling code phase is dirty; it now runs in a worktree"
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

Releases 1.4.0 and 1.4.1 are published on GitHub (`MichelKerkmeester/obsidian--notion-clone`).
Report 29 (iOS sheets froze, P0) is fixed in `98da630` and `0c92f4d`; the operator says most sheets
now work, but the full discriminating sequence on device is still owed. Reports 30-33 (view-switcher
row icons, selection-bar docking, the "1 cells" plural, and detail-sheet overflow) are recorded in
`62c4fe7` and routed to `001`, `022` and `010`.

Origin/main sits at `9642e43`. Nothing from this session is pushed beyond that commit. This handover
itself is being written after a usage-limit cutoff that landed mid-flight, so treat every in-flight
lane below as unverified until you confirm it yourself.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. IN-FLIGHT LANES, AND HOW TO RECOGNISE EACH

Run `git status --porcelain` first. Three lanes can be dirty at once; match the files to the lane
before touching anything.

**Lane A: reports 30-33 code fix, in-runtime Opus, main checkout.** Its files are `src/views/*.ts`
(`cell-renderer.ts`, `mobile-bottom-sheet.ts`, `record-detail-panel.ts`), `styles.css`,
`tools/lane/css-lane.json`, `tools/live/*.json`, `tools/live/render-assertion-harness.ts`,
`tools/live/render-assertions.mjs`, `tools/storybook/verify-placement.mjs`, and
`specs/005-component-surface-system/026-production-render-assertions/tasks.md`. These edits are
UNCOMMITTED. If you find this set dirty, that is this lane resuming — do not discard it.

**Lane B: DONE row 6, negative controls, cli-devin (deepseek-v4-flash-max).** A lane adding owned
negative controls to the board/gallery/table render-assertion scenarios. Its files overlap Lane A's
`tools/live/render-assertion-harness.ts` and `tools/screenshots/scenarios`. If dirty, verify controls
armed produce red and disarmed produce green before committing.

**Lane C: the 036 research loop, in a worktree, not the main checkout.** Path
`.worktrees/003-obsidian-pm-harvest`, branch `worktrees/003-obsidian-pm-harvest`, base `7f00622`. The
worktree carries symlinks `.opencode` → `Public/.opencode` and `specs/context` → this checkout's
`specs/context`. It runs there because the fan-out runner's containment check rejected it in the main
checkout while Lane A's files were dirty. Launcher: scratchpad `fanout-036-launch.sh` (`LOOP_ROOT` env
selects the root), log `fanout-036.log`, status log
`<worktree>/specs/005-component-surface-system/036-obsidian-pm-ui-harvest/research/orchestration-status.log`.
Executor order: codex `gpt-5.6-luna` `max` `fast` (20 iterations), then devin
`deepseek-v4-flash-max` (20), then claude2 Sonnet `high` (5).

A stale, untracked `research/` directory from the rejected main-checkout launch still sits at
`specs/005-component-surface-system/036-obsidian-pm-ui-harvest/research/` in THIS checkout
(confirmed dirty at the time this handover was written). Delete it before merging the worktree's
`research/` back — do not merge both.
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. **Land reports 30-33 and cut 1.4.2.** Check `git status` against Lane A's file list above. If
   dirty, run the gate (`npm run gate`, read `$?` directly, never through a pipe), read the
   recaptured screenshots, update `001`, `022` and `010`'s docs with what shipped, commit with
   explicit paths (never `git add -A`), then cut release 1.4.2 (`main.js`, `manifest.json`,
   `styles.css`).
2. **Land DONE row 6's negative controls.** Check Lane B's files. If dirty, verify the controls
   observe red when armed and green when disarmed, then commit.
3. **Ask the operator to confirm reports 29-33 on iOS.** Record confirmed or deferred against each
   row in `roadmap.md` §4. An agent never closes an operator row itself.
4. **Resume the 036 research loop.** Delete this checkout's stale untracked `research/` directory
   at `036-obsidian-pm-ui-harvest/` first. Then check the worktree's launcher and status log for
   where the 20+20+5 executor sequence stopped, and continue it from there. Packet 036 is rescoped
   to a near one-to-one PORT of obsidian-pm's timeline/gantt, board, calendar and subtask model plus
   its shared UI/UX — the table, sheets and calc/rollup surfaces stay ours (`036/goal.md` §1,
   `036/spec.md`).
5. **After the loop converges:** spot-check 10 citations in-runtime against
   `specs/context/obsidian-pm-main`, then open one adoption-plan phase per surface (timeline, board,
   calendar, subtasks, shared UI) per `036/goal.md`'s module-map-and-adoption-plan directive.
<!-- /ANCHOR:session-notes -->

---

<!-- ANCHOR:next-session -->
## 4. GOTCHAS LEARNED THIS SESSION

- `generate-context.js` must be invoked THROUGH the `.opencode` symlink with
  `NODE_PRESERVE_SYMLINKS=1`, not via `realpath` — going through `realpath` resolves the project root
  to `Public` and the write guard blocks the packet.
- The fan-out containment check (`fanout-run.cjs`) scans the WHOLE worktree, so a dirty sibling
  lane anywhere in the checkout rejects a loop launch even when the loop's own files are clean. This
  is why the 036 loop moved to a separate worktree instead of waiting.
- `devin -p` needs `--respect-workspace-trust false` or it will not run non-interactively.
- Codex quota exhaustion exits 1 mid-run, leaving partial edits on disk and no RETURN payload.
  Check the working tree directly rather than trusting the exit code alone.
- Every external delegate's claim is verified in-runtime (D4, D14) — a delegate's report is a claim,
  not a result, and a browser number from a sandboxed or cloud lane is not evidence.
- A pipe makes `$?` the pipe's status; read exit codes directly.
- `validate.sh` on a phase parent recurses into children; take the FIRST `RESULT:` line for this
  packet's own verdict.
- Regenerate metadata after any spec-doc edit or the fingerprint check fails.
<!-- /ANCHOR:next-session -->
