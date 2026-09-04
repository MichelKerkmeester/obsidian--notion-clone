---
title: "Acceptance Criteria: Board / Kanban Port"
description: "What must be observed for the board/Kanban port to close, with the number each reads today."
trigger_phrases: ["038 acceptance criteria"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-04T07:30:00Z"
    last_updated_by: "board-1to1-amendment"
    recent_action: "Added AC-9 for the operator's 1:1 board copy directive"
    next_safe_action: "Dispatch devin leg: port KanbanView/Column/Card structure 1:1"
    blockers: []
    key_files: ["spec.md", "goal.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Board / Kanban Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:criteria -->
## CRITERIA

Each row states what is measured, the threshold, and **the number it reads today**. A criterion
whose control has not been observed failing is not met, however green it looks.

| ID | Measured | Threshold | Today |
|----|----------|-----------|-------|
| AC-1 | Card information hierarchy against catalog rows 5, 8 | matches reference shape on paired screenshot read | not rewritten — current field order/density unrecorded, T1 owed |
| AC-2 | Hover/drag/drop visual language against catalog rows 10-11 | matches reference intent under `--db-*` tokens | not rewritten — current `.db-board-card`/`.db-board-column` rules unchanged since before this phase |
| AC-3 | Card identity | `RowData.file.path`, never `task.id` | unchanged today (baseline, nothing to regress from yet) |
| AC-4 | Local extensions (WIP, swimlanes, summaries, conditional formatting, multi-select, roving keyboard, edge auto-scroll, blank-space drop, touch long-press, cover safety) | pass before and after rewrite | passing today (pre-rewrite baseline); post-rewrite re-check owed |
| AC-5 | Drag-drop matrix (same-group, cross-group, blank-space) | identical before/after | not yet run as a named baseline |
| AC-6 | Board/gallery layout-read negative control | armed and passing, same counts as `026`/`c5566db` | armed today per `tools/live/renderer-coverage.json`; post-rewrite re-check owed |
| AC-7 | `SURFACE_PHASE=038-board-kanban-port npm run gate` | exit 0 | not yet run under this phase's own `SURFACE_PHASE` |
| AC-8 | Operator opens a board on device | confirms rewritten card/column visual language and drag/drop | unknown — **only the operator closes this** |
| AC-9 | 1:1 DOM structure/class vocabulary/CSS/interactions/density/column-width against `KanbanView.ts`/`KanbanColumn.ts`/`KanbanCard.ts`/`kanban.css` (REQ-007, added 2026-09-04) | T9's DOM-structure parity test passes; local extensions render only default-off or where the reference has an equivalent | not started — today's board renders `db-board-*` classes (not the reference's vocabulary), five `db-board-column` lanes at a 280px default width (`board-renderer.ts:1699`; the operator's dispatch named 320px, corrected here against a direct code read), with a priority strip, parent chip, title-row chips and a meta grid, all local composition restyled from `kanban.css`'s visual intent rather than its DOM/class copy |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:evidence -->
## EVIDENCE STANDARD

Shipped, verified and operator-confirmed are three different things and only the third closes a
defect (parent `goal.md` D3). A number is quoted with the command that produced it and the exit
code read directly, never through a pipe. **Amended 2026-09-04 (REQ-007, `goal.md` D6):** the
`rewrite`-only disposition is superseded for structure and visual language — the leg pair copies
`kanban.css` verbatim where its rules apply, so the copied block MUST carry the full MIT notice
from `specs/context/obsidian-pm-main/LICENSE:1-21`. Every requirement outside REQ-007 (card
identity, action contract, local extensions) keeps its `rewrite` disposition unchanged.
<!-- /ANCHOR:evidence -->
