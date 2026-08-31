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

- [x] **T1** Record today's behaviour for drag, range selection and group collapse — REQ-002.
      *Evidence to close:* each exercised against a row far down the list, with the result recorded.
      *Closed by:* `src/views/list-row-contracts.test.ts`. Each contract was resolved to the same
      question — does it derive from the DATA, or from the DOM? — and the answers differ:

      | Contract | Source | Survives windowing |
      |---|---|---|
      | Row drag batch | `rowByPath`, built from the rows handed to `render` | **Yes** |
      | Group collapse | config, via `isGroupCollapsed` | **Yes** |
      | Range selection | `querySelectorAll("[data-note-database-row-path]")` | **No** |

      **Range selection breaks, and it breaks quietly.** `getOrderedSelectionRowPaths` orders by
      DOM query and falls back to `this.rows` only when that query returns NOTHING — a windowed
      list is never empty, only incomplete, so the safety net never fires.
      Measured with the off-window rows absent: a shift-click from row 0 to row 15 selects **2**
      rows, not 16. It does not shorten the range, it collapses it — anchor and target survive, the
      fourteen between are dropped. The row the user clicked *is* selected, so the gesture looks
      like it worked, which is what makes this the dangerous shape rather than a visible failure.
      *A prediction of mine that was wrong, kept because it is the point:* the first draft asserted
      the target would also be missing. It is not. Had the test been written to that expectation and
      "passed" after windowing, it would have certified the defect.
      *What T2 must do first:* derive the selection order from the same data the renderer orders by,
      not from what is currently drawn. Windowing before that ships a silent selection bug.
- [ ] **T2** Window the rendered row range — REQ-001.
      *Evidence to close:* node count stops growing linearly with row count.
- [ ] **T3** Re-prove the three contracts against an **off-window** row — REQ-002.
      *Evidence to close:* each behaves as T1 recorded. This is where windowing breaks first.
- [ ] **T4** Scroll offset survives a window recycle.
      *Evidence to close:* offset stable across a recycle, asserted.
- [~] **T5** Re-measure past the bend — REQ-003. **Baseline re-measured; the target is untouched.**
      *Baseline, re-derived from this tree rather than quoted from the packet* — 3,000 rows, 21
      cols, 100% fill, 6x throttle: phone **4,748.6ms** blocked (1,201.6 render + 3,547.0 layout),
      **225,007 nodes**, verdict **LINEAR x1.07**. The packet recorded 4,908.6 / 3,722 / 225,007;
      the node count matches exactly and the timings sit within a few percent, so the finding
      reproduces and the budget still breaks by roughly 2.4x.
      *Also measured, and it changes T2's design:* `.db-list-row` has `min-height: 44px`, not a
      fixed height, so rows can grow when fields wrap. Windowing therefore needs variable-height
      handling — estimated offsets with correction, not `index * rowHeight`. The plan does not say
      which, and assuming uniform height would produce a scroll bar that lies.
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
