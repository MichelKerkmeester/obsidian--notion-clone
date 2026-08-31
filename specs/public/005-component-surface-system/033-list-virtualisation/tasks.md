---
title: "Tasks: List Virtualisation"
description: "Window the rendered row range without breaking the three contracts that assume every row exists."
trigger_phrases: ["033 plan", "033 tasks"]
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/033-list-virtualisation"
    last_updated_at: "2026-08-31T16:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened as the only remaining lever on the list freeze"
    next_safe_action: "Record the three row contracts before windowing exists"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-033"
      parent_session_id: null
    completion_pct: 0
    open_questions: ["Does windowing break drag, range selection or group collapse"]
    answered_questions: ["The shape is LINEAR; layout over node count is the remaining cost"]
---
# Tasks: List Virtualisation

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

<!-- ANCHOR:notation -->
> `[ ]` open · `[x]` closed with its evidence named beneath it.
<!-- /ANCHOR:notation -->

<!-- ANCHOR:phase -->
## TASKS

- [ ] **T1** Record today's behaviour for drag, range selection and group collapse — REQ-002.
      *Evidence to close:* each exercised against a row far down the list, with the result recorded.
- [ ] **T2** Window the rendered row range — REQ-001.
      *Evidence to close:* node count stops growing linearly with row count.
- [ ] **T3** Re-prove the three contracts against an **off-window** row — REQ-002.
      *Evidence to close:* each behaves as T1 recorded. This is where windowing breaks first.
- [ ] **T4** Scroll offset survives a window recycle.
      *Evidence to close:* offset stable across a recycle, asserted.
- [ ] **T5** Re-measure past the bend — REQ-003.
      *Evidence to close:* under 2,000ms at 3,000 rows, 21 cols, full fill, 6x throttle; verdict
      still LINEAR measured past 3,200 rows.
- [ ] **T6** The renderer assertion still passes — REQ-004.
      *Evidence to close:* the layout-read bound holds; windowing has not defeated it.
- [ ] **T7** The operator opens their real database without a stall.
      *Evidence to close:* the operator says so. Nothing else closes this.
<!-- /ANCHOR:phase -->

<!-- ANCHOR:completion -->
## COMPLETION
Complete when T7 closes. Everything else is a precondition for asking.
<!-- /ANCHOR:completion -->

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES
- [`spec.md`](spec.md) · [`../028-remaining-freezes/goal.md`](../028-remaining-freezes/goal.md)
<!-- /ANCHOR:cross-refs -->
