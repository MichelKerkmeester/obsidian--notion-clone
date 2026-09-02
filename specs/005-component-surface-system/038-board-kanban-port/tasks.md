---
title: "Tasks: Board / Kanban Port"
description: "Task breakdown following the plan's group/card contract, drop matrix, keyboard/touch/cover, screenshot, gate order."
trigger_phrases: ["038 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-02T23:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened from 036's adoption plan row 2"
    next_safe_action: "Record today's board behaviour before any rewrite line lands"
    blockers: []
    key_files: ["spec.md", "plan.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Tasks: Board / Kanban Port

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## TASKS

- [ ] **T1** Record today's board behaviour before any rewrite — REQ-005, REQ-003.
      *Evidence to close:* the passing state of every local extension (WIP/visible counts,
      swimlanes, summaries, conditional formatting, multi-select, roving keyboard, edge
      auto-scroll, blank-space drop, touch long-press, cover-target scheme safety) and the
      drag-drop matrix (same-group, cross-group, blank-space) captured once, before the group/card
      contract rewrite begins. This is the plan's step 1 and `goal.md`'s "red to record" for its
      first four completion rows.
- [ ] **T2** Rewrite the status-column and card information hierarchy — REQ-001.
      *Evidence to close:* `renderColumn`/`renderCard` (`board-renderer.ts:463-577`, `:750-951`)
      match catalog rows 1, 2, 5, 8 on a paired screenshot read, with `RowData.file.path` identity
      unchanged (REQ-003) and every T1-recorded local extension still passing.
- [ ] **T3** Rewrite hover/drag/drop visual language and re-prove the drop matrix — REQ-002,
      REQ-003.
      *Evidence to close:* `.db-board-column`/`.db-board-card` rules (`styles.css:8881-8908`,
      `:9175-9197`) match catalog rows 10-11's intent under `--db-*` tokens; the T1 drag-drop
      matrix re-run against the rewritten card shell reads identically for same-group, cross-group,
      and blank-space drop.
- [ ] **T4** Re-prove keyboard/touch/cover against the rewritten card shell — REQ-005.
      *Evidence to close:* roving keyboard (`wireCardKeyboard`), touch long-press
      (`attachLongPress`/`isTouchDevice`), and cover-target scheme safety (`renderCover`,
      `:953-991`, report 032) each match their T1-recorded behaviour.
- [ ] **T5** Board/gallery negative control still armed — REQ-006.
      *Evidence to close:* `tools/live/renderer-coverage.json`'s layout-read bound
      (`026`/`c5566db`) reads the same armed/disarmed counts after the rewrite as before it.
- [ ] **T6** Recapture and read board screenshots.
      *Evidence to close:* every changed capture named in a `reviewed` array and actually opened,
      not inferred from a file-count diff (parent's own recorded trap on that instrument).
- [ ] **T7** `SURFACE_PHASE=038-board-kanban-port npm run gate` exits 0.
      *Evidence to close:* `$?` read directly, not through a pipe.
- [ ] **T8** The operator opens a board on device and confirms the rewritten visual language and
      drag/drop.
      *Evidence to close:* the operator says so. Nothing else closes this.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Complete when T8 closes. Everything else is a precondition for asking.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · [`../036-obsidian-pm-ui-harvest/research/research.md`](../036-obsidian-pm-ui-harvest/research/research.md)
<!-- /ANCHOR:cross-refs -->
