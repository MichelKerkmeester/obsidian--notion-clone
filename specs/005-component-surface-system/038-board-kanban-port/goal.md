---
title: "Goal: Board / Kanban Port"
description: "Port obsidian-pm-main's Kanban column/card hierarchy and hover/drag/drop visual language into board-renderer.ts, near one-to-one, without narrowing the local action contract."
trigger_phrases: ["038 goal", "board kanban port goal"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-02T23:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from 036's adoption plan row 2"
    next_safe_action: "Write a check that fails on the current board renderer before any rewrite"
    blockers: []
    key_files: ["spec.md", "plan.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Goal: Board / Kanban Port

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Adopt `obsidian-pm-main`'s Kanban status-column information hierarchy and
hover/drag/drop visual language into `src/views/board-renderer.ts` near one-to-one, rewritten
through this repo's `RowData`/`ViewConfig`/action contracts, while every local extension the
reference has no equivalent for — WIP/visible counts, swimlanes, summaries, conditional
formatting, multi-select, roving keyboard, edge auto-scroll, touch, cover-target scheme safety
(report 032) — is proven unchanged, not assumed unchanged.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Rewrite, not copy. Every catalog row's disposition is `rewrite`; no reference code or CSS block is copied verbatim, so no MIT notice is owed by this phase (`../036-obsidian-pm-ui-harvest/research/research.md` "License and copy boundary"). |
| D2 | Card identity stays `RowData.file.path`. The reference's `task.id` identity is never adopted; every drag/drop payload and the batch/order transaction stays path-keyed. |
| D3 | A local extension with no reference equivalent is a requirement to preserve, not a gap to fill from the reference. Checked before and after the rewrite, per `plan.md`'s first step. |
| D4 | Shipped, verified and operator-confirmed differ. Only the third closes a row (parent `goal.md` D3). |
| D5 | A fresh reviewer verifies; the delegate order and in-runtime verification follow the parent's D14. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [ ] The card information hierarchy (title, priority strip, chips, preview, time/tags/progress/
      people/due) matches the reference's shape on a read of paired before/after screenshots.
      **Not started — no rewrite exists yet.** Red to record: the current card's field order and
      density against catalog rows 5 and 8 (`research/research.md` lines 160, 164).
- [ ] Hover/drag/drop visual language (raised card, hover lift, drop-target tint, column drop
      highlight) matches the reference's language, rewritten under `--db-*` tokens in `styles.css`
      §17 BOARD VIEW. **Not started.** Red to record: a diff of the current
      `.db-board-card`/`.db-board-column` rules (`styles.css:8881-8908`, `:9175-9197`) against the
      reference's `kanban.css:13-155`.
- [ ] Every local extension named in REQ-005 (WIP/visible counts, swimlanes, summaries,
      conditional formatting, multi-select, roving keyboard, edge auto-scroll, blank-space drop,
      touch long-press, cover-target scheme safety) passes the same check before and after the
      rewrite. **Not started.** Red to record: today's passing state of each, captured by `plan.md`
      step 1, before any rewrite line lands.
- [ ] Card identity, drag/drop payloads, and the path/batch-order transaction are unchanged in
      contract (REQ-003). **Not started.** Red to record: today's drag-drop matrix (same-group,
      cross-group, blank-space) run once, before the rewrite, as the baseline the post-rewrite run
      must match.
- [ ] The board/gallery layout-read negative control (`tools/live/renderer-coverage.json`, the
      bound `026`/`c5566db` wired) stays armed and passing after the rewrite. **Not started.** Red
      to record: the control's current armed/disarmed read counts, before the rewrite touches
      `board-renderer.ts`.
- [ ] `npm run gate` exits 0, `$?` read directly. **Not started.**
- [ ] `validate.sh specs/005-component-surface-system/038-board-kanban-port --strict` reports
      Errors: 0. **Not started.**

### Operator-only rows

- [ ] **The operator opens a board on device and confirms the rewritten card/column visual
      language and drag/drop reads correctly on their own database.** Only the operator closes
      this row; nothing in this tree can close it. Not a report-driven row — no operator report
      (29-33) named the board surface directly, so this is a proactive confirmation ask, not a
      defect closure.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Opened 2026-09-02** from `036-obsidian-pm-ui-harvest`'s "Final adoption plan" row 2
(`research/research.md` lines 394-402), which orders the board second after
`037-timeline-gantt-port`. Nothing has started; every completion row above is unticked and names
the red it is waiting to record.
<!-- /ANCHOR:log -->
