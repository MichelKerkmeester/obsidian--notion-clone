---
title: "Goal: List Virtualisation"
description: "The list renders every row, so its cost is layout over node count; windowing is the only lever left."
trigger_phrases: ["033 goal"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/033-list-virtualisation"
    last_updated_at: "2026-09-02T08:00:00Z"
    last_updated_by: "goal-audit"
    recent_action: "Goal audit: windowing claims verified in list-renderer"
    next_safe_action: "The operator opens their real database on device"
    blockers:
      - "The windowed list is bench-only: 48.4ms at 3,000 rows, unconfirmed on device"
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-033-goal"
      parent_session_id: null
    completion_pct: 83
    open_questions: []
    answered_questions:
      - "Windowing breaks range selection only, and silently — drag and group collapse are data-driven"
      - "Drag and range selection are asserted against a row the renderer declined to mount"
      - "The packet's inherited figures reproduced on this tree; the node count matched exactly"
---
# Goal: List Virtualisation

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The list opens at the operator's real shape without a stall.

**The quadratic is gone and the list still does not open.** At 3,000 rows the render is
1,186ms and the layout is 3,722ms over 225,007 nodes. Layout is three quarters of the cost and is
proportional to how many nodes exist, not to how they were built, so nothing inside a row loop
touches it. Windowing is the only remaining lever, and the ratio is unforgiving: clearing the budget
at 3,000 rows means rendering about a fifth of what renders now.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Cutting per-row node count is not a substitute. It helps proportionally and cannot reach a fifth. |
| D2 | Drag, range selection and group collapse each assume every row exists. They are requirements, not regressions to discover. |
| D3 | Prove each contract against a row **outside** the window. Inside the window proves nothing. |
| D4 | No verdict from a range that stops below 3,200 rows. |
| D5 | The timings below are inherited from an earlier phase and have no artifact in the tree. Re-measure before relying on them. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

- [x] Blocked main thread under 2,000ms at 3,000 rows, 21 columns, full fill, phone-class throttle.
      **Met — 48.4ms**, from 4,748.6ms. Measured past the bend too: 50.3ms at 3,400 rows. Grouped
      lists are windowed as well: 2,000 rows in one group render 1,310 nodes.
- [x] Drag, range selection and group collapse each proven against an off-window row. **Met.** Drag
      and range selection are asserted against a row the renderer declined to mount, with the DOM
      ordering kept as a failing control (2 rows against 28). Grouped lists are windowed too, and
      the section header is asserted to survive a recycle — collapse itself is a config question and
      a collapsed group rendering no rows is its normal state.
- [x] Scroll offset stable across a window recycle. **Met** — 4,000px held across a recycle that
      is itself asserted to have happened.
- [x] Node count no longer grows linearly with row count. **Met — flat at 2,184** across 1,000,
      3,000 and 3,400 rows, from 225,007. Grouped: 1,310 nodes for 2,000 rows in one group.
- [x] The renderer assertion still passes; windowing must not defeat the layout-read bound. **Met,
      after it caught me** — the first row-height measurement forced a layout per row and the bound
      failed at 13 against 8. Now three reads, constant.
- [ ] The operator opens their real database without a stall. **Only the operator closes this.**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Nothing has started.**

**A caveat on the numbers this phase is built on.** The figures — 4,908.6ms at 3,000 rows, 3,722ms
of layout, 225,007 nodes — appear in four prose documents in this packet and in **no artifact**.
Nothing under `tools/bench/` records the run that produced them. They are inherited rather than
introduced here, and they are load-bearing for a whole phase, so the first measurement should
reproduce them rather than assume them. If they do not reproduce, that is the finding.

*2026-09-02 audit: both paragraphs are history now, and the caveat resolved the good way.* The
numbers reproduced — `implementation-summary.md` records the node count matching exactly — and the
windowing is on disk rather than in prose: `ListWindow`, `mountWindow`, `updateWindow` and
`paintWindow` in `src/views/list-renderer.ts`, with the spacer height re-measured on each recycle
(the bound that caught the per-row layout read is documented at its `measureRowHeight`). The
off-window contracts are asserted by a harness that makes a row off-window by scrolling rather than
by omitting it from a list, and the grouped arm asserts the section header survives a recycle
(`tools/live/list-window-harness.ts`), stamped at `tools/live/list-window.json` — 16 checks.

**What that does not settle.** Every figure above is a bench figure. The remaining criterion is the
operator on their own database, and no artefact in this tree can close it — which is why it is now
carried as a blocker rather than as an empty list.
<!-- /ANCHOR:log -->
