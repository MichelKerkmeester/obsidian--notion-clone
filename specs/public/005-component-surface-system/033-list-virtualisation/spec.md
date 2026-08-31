---
title: "Feature Specification: List Virtualisation"
description: "The list renders every row, so its cost is proportional to node count; at the operator's shape that is 2.0-4.9s of blocked main thread and no loop fix reaches it."
trigger_phrases: ["list virtualisation", "windowing", "033 virtualisation", "large list freeze"]
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/033-list-virtualisation"
    last_updated_at: "2026-08-31T16:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Flat list windowed; node count flat at 2,184 and blocked time 4,748.6ms -> 48.4ms"
    next_safe_action: "Window the grouped path, which still renders every row"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-033"
      parent_session_id: null
    completion_pct: 83
    open_questions:
      - "Does windowing break row drag, range selection, or group collapse, which all assume every row exists?"
    answered_questions:
      - "The shape is already LINEAR; the quadratic is gone and no further loop work helps"
      - "At 3,000 rows, 3,722ms of the 4,909ms is layout over 225,007 nodes"
---
# Feature Specification: List Virtualisation

> Phase chain: parent [`../spec.md`](../spec.md). This is the second of the three priorities the
> session directive named, and the only one still unbuilt.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 033-list-virtualisation |
| **Level** | 2 |
| **Status** | **In progress — 5 of 6 criteria, flat lists only.** Windowed: blocked main thread 4,748.6ms -> 48.4ms at 3,000 rows, node count 225,007 -> 2,184 and flat to 3,400 rows. Open: the grouped path still renders every row, and the operator has not opened their database |
| **Complexity** | 60/100, confidence 92% |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 1. PROBLEM

**The list still does not open at the operator's shape, and the remaining cost is not a loop.**

Confirmed by the operator: **1,000-3,000 rows at 80-100% fill**. Measured at 21 columns and 6x CPU
throttle, which is the phone-class figure the packet requires:

| rows | blocked, desktop | blocked, phone |
|---|---|---|
| 1,000 | 1,654.1ms | 1,622.2ms |
| **1,300** | **2,022.9ms** | **2,066.3ms** |
| 2,000 | 3,006.6ms | 3,095.7ms |
| 3,000 | 4,765.2ms | 4,908.6ms |

The 2,000ms budget breaks at **1,300 rows** and the operator's range starts at 1,000.

**The shape is LINEAR x1.06.** The quadratic that `024` and `028` removed is genuinely gone. At
3,000 rows the render is 1,186ms and the **layout is 3,722ms**, over **225,007 nodes** — roughly 75
nodes per row across 21 columns. Layout is three quarters of the cost and it is proportional to how
many nodes exist, not to how they were built. **No change inside a row loop reaches it.**

Windowing is the only lever, and the ratio is unforgiving: clearing 2,000ms at 3,000 rows means
rendering roughly a fifth of what is rendered now.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 2. SCOPE

**In scope.** Rendering only the rows near the viewport, and whatever the existing row contracts
need in order to survive that.

**Out of scope.** Reducing per-row node count as an alternative. It helps proportionally and cannot
reach a fifth. Recorded so it is not attempted as a cheaper substitute.
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 3. REQUIREMENTS

| ID | Requirement |
|----|-------------|
| REQ-001 | A full-view rebuild stays under 2,000ms at 3,000 rows, 21 columns, full fill, 6x throttle. |
| REQ-002 | Row drag, range selection and group collapse behave identically — each assumes today that every row exists. |
| REQ-003 | The scaling verdict stays LINEAR, measured past 3,200 rows. A range that stops below the bend cannot see a regression. |
| REQ-004 | The production-renderer assertion still passes; windowing must not defeat the layout-read bound. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 4. SUCCESS CRITERIA

- [ ] Blocked main thread under 2,000ms at the operator's confirmed shape, at phone-class CPU.
- [ ] Drag, range selection and group collapse each proven against a row **outside** the rendered
      window — the case windowing is most likely to break.
- [ ] Node count no longer grows linearly with row count.
- [ ] The operator opens their real database without a stall. **Only the operator closes this.**
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 5. RISKS

| Risk | Likelihood | Mitigation |
|---|---|---|
| Row contracts assume every row is in the DOM | **High** | REQ-002 names the three; each is proven against an off-window row rather than assumed |
| Scroll-position jump on window recycle | Med | Assert scroll offset is stable across a recycle |
| A verdict taken below the bend | Med | REQ-003 requires measuring past 3,200 rows |
<!-- /ANCHOR:risks -->
