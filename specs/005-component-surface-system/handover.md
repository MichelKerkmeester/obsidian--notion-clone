---
title: "Session Handover: Component Surface System"
description: "Resume point mid-flight on the 037 port: cli-devin's initial pass needs in-runtime verification."
trigger_phrases:
  - "005 handover"
  - "surface system handover"
  - "resume surface system"
importance_tier: "critical"
contextType: "handover"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system"
    last_updated_at: "2026-09-03T00:20:00Z"
    last_updated_by: "orchestrate-handover-2"
    recent_action: "Landed row-6, reports 30-33, 1.4.2; 036 merged; five port phases opened"
    next_safe_action: "Verify devin's 037 initial pass, then codex leg for CSS"
    blockers:
      - "Operator device confirmation of reports 29-33 on iOS 1.4.2 is still owed"
      - "The cli-devin lane for 037's initial pass is in flight and unverified"
    key_files:
      - "goal.md"
      - "roadmap.md"
      - "037-timeline-gantt-port/goal.md"
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
---
# Session Handover: Component Surface System

<!-- SPECKIT_LEVEL: phase -->
<!-- SPECKIT_TEMPLATE_SOURCE: handover | v1.0 -->

<!-- ANCHOR:handover-summary -->
## 1. WHERE THINGS STAND

Landed and pushed since the previous handover: `c5566db` row-6 negative controls, verified
1601/1601/2003 armed vs 1/1/3 disarmed; `00e2aa2` reports 30-33 fixed and verified by a fresh
reviewer; `decbc62` release 1.4.2 published on GitHub (`main.js`, `manifest.json`, `styles.css`);
`28b4809` and `5f68f60` doc audits; `f52732e` the 036 research loop merged, synthesis at
`036/research/research.md`, lineage ledgers untracked by the `.gitignore` rule
`specs/**/research/**/lineages/`, iteration count self-reported, all 10 reference citations
verified with three local citations corrected; `7b0fea4` five port phases opened:
`037-timeline-gantt-port` (L2), `038-board-kanban-port` (L2), `039-calendar-parity-port` (L2),
`040-subtask-tree-port` (L3), `041-shared-ui-ux-port` (L2), all criteria unticked. Parent
completion sits at 57.

Origin/main sits at `7b0fea4`. This handover is being written mid-flight on the 037 port, so treat
the in-flight lane below as unverified until you confirm it yourself.
<!-- /ANCHOR:handover-summary -->

---

<!-- ANCHOR:context-transfer -->
## 2. IN-FLIGHT LANE, AND HOW TO RECOGNISE IT

Run `git status --porcelain` first.

**The 037 lane: cli-devin (deepseek-v4-flash-max), dangerous mode, main checkout.** PID in
scratchpad `devin-037.pid`, log `devin-037.log`, prompt `devin-037.prompt`. It is doing 037's
initial pass: a red-first dependency-link seam test, a geometry model for five scales, and
renderer wiring without CSS, in `src/views/calendar-timeline-model.ts`,
`calendar-interaction-model.ts`, `calendar-timeline-renderer.ts` and their tests, plus
`037-timeline-gantt-port/tasks.md` ticks. Recognise it by dirty `src/views/calendar-timeline-*`
and `calendar-interaction-model` files.

On resume: if `devin-037.log` ends with a RETURN block, dispatch a fresh in-runtime verifier
(Sonnet; runs `tsc`, vitest, `npm run gate`, reads captures, checks the red-first evidence) and
commit with explicit paths. If devin is still running, wait on its PID. If it died without RETURN,
treat its edits as a claim and verify the same way.
<!-- /ANCHOR:context-transfer -->

---

<!-- ANCHOR:session-notes -->
## 3. RESUME ORDER

1. **Verify devin's 037 initial pass.** Follow the resume steps in Section 2. Dispatch the
   in-runtime verifier, then commit with explicit paths (never `git add -A`).
2. **Leg (b): gpt-5.6-luna via cli-codex for CSS.** Handle the CSS/lane step and remaining
   renderer work for 037 (`styles.css` under the css-lane protocol, recapture, read), then
   in-runtime verification, docs, commit, and release 1.4.3.
3. **Then 038, 039, 040, 041 in adoption-plan order,** the same three legs each (initial pass,
   CSS/lane, in-runtime verify). One cli-* dispatch at a time.
4. **Ask the operator to confirm reports 29-33 on iOS on 1.4.2.** A push notification was sent
   2026-09-02 22:35. Record each row as confirmed or deferred in `roadmap.md` §4. An agent never
   closes an operator row itself.
5. **Housekeeping:** the sk-git worktree `.worktrees/003-obsidian-pm-harvest`
   (branch `worktrees/003-obsidian-pm-harvest`) has served its purpose; its research tree is
   merged. Removal is the operator's call (sk-git owns worktree removal). The scratchpad is
   session-scoped and may vanish; everything load-bearing is in the repo.
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
- `generate-context.js` runs through the `.opencode` symlink with `NODE_PRESERVE_SYMLINKS=1`;
  `validate.sh` runs via `realpath`.
- Commit scopes must not be numeric; use `specs`, `release`, `phone-chrome`, `render-assertions`.
- Uncommitted work in the main checkout can be wiped by a sibling lane, so external code lanes
  (cli-devin, cli-codex) get verified and committed promptly.
<!-- /ANCHOR:next-session -->
