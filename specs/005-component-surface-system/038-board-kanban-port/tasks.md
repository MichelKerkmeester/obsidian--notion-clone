---
title: "Tasks: Board / Kanban Port"
description: "Task breakdown following the plan's group/card contract, drop matrix, keyboard/touch/cover, screenshot, gate order."
trigger_phrases: ["038 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/038-board-kanban-port"
    last_updated_at: "2026-09-03T10:40:00Z"
    last_updated_by: "board-legs-landed"
    recent_action: "Verified legs b9e2321/a6fcd31; ticked T5-T7 and 3 goal criteria"
    next_safe_action: "Record a T1 pre-rewrite baseline, then close T1-T4"
    blockers: []
    key_files: ["spec.md", "plan.md", "implementation-summary.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-038"
      parent_session_id: null
    completion_pct: 38
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
- [x] **T5** Board/gallery negative control still armed — REQ-006.
      *Evidence to close:* `tools/live/renderer-coverage.json`'s layout-read bound
      (`026`/`c5566db`) reads the same armed/disarmed counts after the rewrite as before it.
      Closed 2026-09-03: `node tools/live/render-assertions.mjs` re-run disarmed (default);
      `board/file-view` and `board/embed` both PASS "no forced layout inside the card loop",
      matching the standing bound of 8 the control has never been observed failing against. Armed
      (`RENDER_READ_CONTROL=per-item`), the same two scenarios go red at 1601 layout reads against
      that bound, confirming the control is armed. `renderer-coverage.json` stamped fresh in the
      disarmed re-run.
- [x] **T6** Recapture and read board screenshots.
      *Evidence to close:* every changed capture named in a `reviewed` array and actually opened,
      not inferred from a file-count diff (parent's own recorded trap on that instrument).
      Closed 2026-09-03: `tools/lane/css-lane.json`'s `9eb4b141471e` release names all 20 changed
      captures and describes what each shows; `board-view-desktop-light.png` opened directly this
      session — status-colored topbar per column, matching priority strip per card, controls row,
      `Subscriptions` parent chip, title line with select/status chips ranged right, Cost/Renews
      grid, nothing clipped or unstyled.
- [x] **T7** `SURFACE_PHASE=038-board-kanban-port npm run gate` exits 0.
      *Evidence to close:* `$?` read directly, not through a pipe.
      Closed 2026-09-03: observed directly, exit 0, 25 green / 0 red; re-run bare (no
      `SURFACE_PHASE`) also exit 0, 25 green / 0 red.
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
