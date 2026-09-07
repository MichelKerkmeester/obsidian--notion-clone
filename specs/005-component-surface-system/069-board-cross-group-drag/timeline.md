---
title: "Timeline: Board Cross-Group Drag"
description: "Level-agnostic chronological record of events, outcomes and milestones."
trigger_phrases:
  - "069 timeline"
  - "board touch drag timeline"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: timeline | v2.2 -->
# Timeline: Board Cross-Group Drag

> Tracks this packet from the operator's report to the gate.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Subject:** Board cross-group drag
**Status:** In Progress
**Started:** 2026-09-07
**Last updated:** 2026-09-07
**Owner:** Implementation session
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:timeline -->
## 2. TIMELINE

**2026-09-07 ~21:40:** Operator report: the board needs ClickUp-style cross-group drag. Outcome:
tree read confirms the desktop mouse path already does this; touch cannot, because
`card.draggable` excludes touch mode outright.

**2026-09-07:** Amendment from the coordinator: open this as its own phase child rather than a row
inside `059`/`056`. Outcome: `069-board-cross-group-drag` created under
`005-component-surface-system` via the phase-append path, Level 2 (recommend-level.sh: 49/100,
confidence 82%, phase score 0/50).

**2026-09-07:** Touch drag implemented directly in `BoardRenderer`, reusing the existing
`moveCardAndOrder` write path and the previously-unwired `resolveBoardColumnByPoint` hit-test.
Outcome: long-press lift, ghost tracking, column highlight, edge auto-scroll, Escape/outside
cancel, one-shot click-swallow.

**2026-09-07:** Embedded host's `updateBoardGroup` gained an Undo toast; the desktop host's own was
confirmed pre-existing and untouched.

**2026-09-07:** Mutation-proven test suites written across three files — one real ordering bug
(the click-swallow listener torn down before the browser's own compatibility click could reach it)
and one real hit-test bug (the drag's starting column pre-set as "already highlighted," silently
skipping the first highlight) were caught and fixed by the tests themselves before they shipped.

**2026-09-07:** `tools/live/board-cross-group-drag.mjs` built and run: real `DataTransfer` desktop
proof and real `PointerEvent` phone proof both passed, including a reverse drag, a same-column
no-op, and a read-only no-lift case. The first capture attempt showed the ghost mostly off-screen
at 402px width; fixed by capturing at an intermediate drag position instead of the drop target.

**2026-09-07:** Full verification in progress — `tsc`, `vitest`, `build`, `render-assertions.mjs`,
`sheet-grammar.mjs` all green; `npm run gate` surfaced five pre-existing-tree failures triggered by
the `styles.css` hash moving (not by any pixel changing), being worked through.
<!-- /ANCHOR:timeline -->

---

<!-- ANCHOR:milestones -->
## 3. MILESTONES

**Touch drag implemented:** target same-session. Status: Done. Evidence: `src/views/board-renderer.ts`.

**Both hosts undo-covered:** target same-session. Status: Done. Evidence: `decision-record.md` ADR-003.

**Live proof, both devices:** target same-session. Status: Done. Evidence: `tools/live/board-cross-group-drag.mjs`, `RESULT: PASSED`.

**Gate green:** target same-session. Status: In Progress. Evidence: `.gate-*.log` in the working tree at close.

**Operator confirms on device:** target post-release. Status: Planned. Evidence: `goal.md`'s operator row.
<!-- /ANCHOR:milestones -->
