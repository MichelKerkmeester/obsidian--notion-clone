---
title: "Implementation Summary: List Virtualisation"
description: "The baseline reproduces and the three row contracts are recorded; one of them breaks silently and must be fixed before the window exists."
trigger_phrases:
  - "033 implementation summary"
  - "list windowing status"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/033-list-virtualisation"
    last_updated_at: "2026-08-31T23:30:00Z"
    last_updated_by: "phase-implementer"
    recent_action: "Baseline reproduced; the three row contracts recorded before windowing exists"
    next_safe_action: "Order the selection from data, not from the DOM, before windowing anything"
    blockers:
      - "Windowing itself is not started; T1 found a prerequisite the plan's order did not have"
    key_files:
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-033-impl"
      parent_session_id: null
    completion_pct: 20
    open_questions:
      - "Variable row height: estimated offsets with correction, or a forced uniform height"
    answered_questions:
      - "Windowing breaks range selection only, and silently — drag and group collapse are data-driven"
      - "The packet's numbers reproduce on this tree; the node count matches exactly"
---
# Implementation Summary: List Virtualisation

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 033-list-virtualisation |
| **Level** | 2 |
| **Status** | In progress — T1 done, baseline re-derived. Windowing not started |
| **State** | No renderer change. Gate 18 green, exit 0 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 1. WHAT THIS ADVANCED

No windowing yet. Two things the rest of the phase depends on, both of which had to happen before
the renderer changed.

**The baseline was re-derived from this tree rather than quoted.** 3,000 rows, 21 columns, 100%
fill, 6x throttle: phone **4,748.6ms** blocked — 1,201.6ms render plus 3,547.0ms layout — over
**225,007 nodes**, verdict **LINEAR ×1.07**. The packet recorded 4,908.6 / 3,722 / 225,007. The node
count matches exactly and the timings sit within a few percent, so the finding reproduces and the
2,000ms budget still breaks by roughly 2.4×. Layout is three quarters of the cost and is
proportional to how many nodes exist, so nothing inside a row loop reaches it.

**The three row contracts are recorded**, in `src/views/list-row-contracts.test.ts`, while every row
still exists in the DOM — the only time that can be done honestly.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## 2. THE CONTRACTS, AND THE ONE THAT BREAKS

Each contract reduces to one question: does it derive from the DATA, or from the DOM?

| Contract | Source | Survives windowing |
|---|---|---|
| Row drag batch | `rowByPath`, built from the rows handed to `render` | **Yes** |
| Group collapse | config, via `isGroupCollapsed` | **Yes** |
| Range selection | `querySelectorAll("[data-note-database-row-path]")` | **No** |

Two of the three named as at-risk turn out not to be. Drag filters its batch through a map built
from the row array, so it holds every row whether or not one was drawn. A collapsed group having no
rendered rows is already its normal state.

**Range selection is the real one, and it fails quietly.** `getOrderedSelectionRowPaths` orders by
DOM query and falls back to the full row list only when that query returns *nothing* — a windowed
list is never empty, only incomplete, so the safety net never fires.

Measured with the off-window rows absent: a shift-click from row 0 to row 15 selects **2** rows
rather than 16. The range does not shorten, it collapses — anchor and target survive, the fourteen
between are dropped. The row the user actually clicked *is* selected, so the gesture looks like it
worked.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:verification -->
## 3. VERIFICATION

| Property | Evidence |
|---|---|
| The baseline reproduces | Re-run on this tree at the packet's stated shape; node count identical, timings within a few percent |
| The break is measured, not argued | The selection is exercised with a truncated order and the resulting set is asserted exactly — `{row-0, row-15}` |
| The order really is DOM-derived | Asserted against the source of `getRenderedSelectionRows`, so the consequence above is not hypothetical |
| The two survivors are survivors | Asserted at their sources: `rowByPath.has(path)` with no DOM query, and the config-backed collapse check |
| Gates | `npx tsc --noEmit` and `npx vitest run` exit 0 — 546 tests. `npm run gate` 18 green, exit 0 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 4. WHAT THIS DOES NOT PROVE

The off-window row is *simulated* by leaving it out of the ordered list, because no window exists
yet to leave it out for real. That is exactly what windowing will do to this input, but it is a
model of the cause rather than the cause itself.

Nothing here makes the list faster. The budget still breaks by 2.4×.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:decisions -->
## 5. DECISIONS, AND TWO THINGS THE PLAN DID NOT KNOW

| Item | Note |
|---|---|
| The selection order must be fixed BEFORE windowing | The plan's order is window, then re-prove. That sequence ships a silent selection bug and then asks a check written afterwards to notice — with nothing to compare against. Deriving the order from the same data the renderer orders by is a prerequisite, not a follow-up |
| Rows are not a fixed height | `.db-list-row` is `min-height: 44px`, so a row grows when its fields wrap. Windowing needs estimated offsets with correction rather than `index * rowHeight`; assuming uniform height produces a scroll bar that lies about where it is. The plan does not say which approach, and it is the main open question |
| A prediction of mine was wrong, and is kept | The first draft of the range test asserted the target row would also be missing. It is not — which is precisely what makes the failure quiet. Had the test shipped with that expectation, it would have "passed" after windowing and certified the defect |
| Windowing itself was not started | It is the largest change in this packet — variable-height windowing across a 792-line renderer with both flat and grouped paths — and it has a prerequisite that was only discovered by doing T1. Starting it in the same pass would have meant building on an order that is known to be wrong |
<!-- /ANCHOR:decisions -->
