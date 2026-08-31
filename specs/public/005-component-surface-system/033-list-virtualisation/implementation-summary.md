---
title: "Implementation Summary: List Virtualisation"
description: "The flat list is windowed — 4,748.6ms to 48.4ms, node count flat — with the selection reordered first so the window could not break it silently."
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
    recent_action: "Grouped lists windowed too; header survives a recycle"
    next_safe_action: "The operator opens their real database on device"
    blockers:
      - "The grouped path is not windowed; the operator has not opened their database"
    key_files:
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-033-impl"
      parent_session_id: null
    completion_pct: 83
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
| **Status** | In progress — 5 of 6 criteria. Flat lists windowed; the grouped path is not |
| **State** | Gate **19 green**, exit 0. tsc, build and vitest exit 0 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 1. WHAT SHIPPED

**The flat list renders only the rows near the viewport**, with spacers standing in for the rest.

| | before | after |
|---|---|---|
| blocked main thread, 3,000 rows | 4,748.6ms | **48.4ms** |
| DOM nodes | 225,007 | **2,184** |
| nodes at 3,400 rows | — | **2,184**, unchanged |
| verdict | LINEAR ×1.07 | **SUBLINEAR ×0.31** |

Row height is measured rather than assumed, because `.db-list-row` is `min-height: 44px` and a row
grows when its fields wrap; a spacer sized from a constant produces a scroll bar that lies. It is
re-measured on each recycle, so the estimate improves as taller rows come into view.

Below 120 rows nothing changes at all — no spacers, no listener, the same DOM. Every screenshot
fixture and placement story is small, and a window engaging for twelve rows would rewrite hundreds
of captures to no purpose.

**Only the flat path is windowed.** A grouped list still renders every row and still blocks at the
operator's shape. Stated here rather than left to be discovered.

### And the prerequisite, which came first

Two things the rest of the phase depended on, both of which had to happen before the renderer
changed.

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
| The window is a window | The lane asserts a real subset — **27 of 2,000** rows mounted — before it checks anything else. A list that rendered everything would satisfy every contract below trivially |
| The off-window row is genuine | It is one the renderer itself declined to mount, not one modelled by hand — the only version that can catch the renderer deciding wrongly |
| Range selection is fixed, and the fix is what fixed it | Both orderings run against the SAME window: the DOM order still collapses to **2 rows**, the recorded order spans all **28**. The failing half is kept, so a green cannot mean the window stopped exercising the difference |
| Scroll offset holds | 4,000px across a recycle that is itself asserted to have happened (row-0 → row-70). Mis-sized spacers would clamp or jump here |
| Node count is bounded | **2,184** at 1,000, 3,000 and 3,400 rows — flat, not merely smaller |
| The budget is cleared past the bend | 48.3ms / 48.4ms / 50.3ms at 1,000 / 3,000 / 3,400 rows, against 2,000ms |
| Gates | `npx tsc --noEmit`, `npm run build`, `npx vitest run` all exit 0 — 546 tests. `npm run gate` **19 green**, exit 0 read from `$?` |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 4. WHAT THIS DOES NOT PROVE

**The grouped list is not windowed.** It still renders every row and still blocks at the operator's
shape. If their database is grouped, nothing here helps them yet — which is why the criterion for
group collapse is not ticked rather than ticked with a caveat.

**No Obsidian host is constructed.** The list is rendered directly rather than through a view, so
what is measured is the renderer's own behaviour. The window itself is real.

**The bench's viewport is now supplied by the bench.** It had none, which meant a windowed list
computed its window against a height no device has; it now takes the surface's own
`window.innerHeight`. That is more honest than before and still not a device.

**Nothing is device-confirmed.** The operator has not opened their database.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:decisions -->
## 5. DECISIONS, AND WHAT THE CHECKS CAUGHT

| Item | Note |
|---|---|
| The selection order must be fixed BEFORE windowing | The plan's order is window, then re-prove. That sequence ships a silent selection bug and then asks a check written afterwards to notice — with nothing to compare against. Deriving the order from the same data the renderer orders by is a prerequisite, not a follow-up |
| Rows are not a fixed height | `.db-list-row` is `min-height: 44px`, so a row grows when its fields wrap. The spacers are sized from a MEASURED average, re-measured on every recycle, rather than from `index * rowHeight` — a guessed constant produces a scroll bar that lies about where it is |
| My first height measurement was the very defect this packet is about | It summed `offsetHeight` across every painted row — a forced layout read per row. The renderer assertion caught it at 13 reads against a bound of 8. "Bounded by the window" is not "bounded". Rewritten to span the first and last row: three reads, constant |
| Three render assertions were changed, and that needs justifying | "rows rendered" and the two affordance counts compared against the TOTAL row count. REQ-001 requires node count to stop tracking row count, so "every row is rendered" is a requirement this phase deliberately replaced — the two could not both hold. The affordance invariants are unchanged (a second checkbox on a row still fails); only the denominator moved to mounted rows. "rows rendered" became stricter: the window must be a real subset |
| The grouped path was left alone | Windowing it means reasoning about group headers inside the offset arithmetic, and the flat path is what the bench and the operator's report describe. Scoped out deliberately and recorded, rather than attempted badly |
| A prediction of mine was wrong, and is kept | The first draft of the range test asserted the target row would also be missing. It is not — which is precisely what makes the failure quiet. Had the test shipped with that expectation, it would have "passed" after windowing and certified the defect |
| Windowing itself was not started | It is the largest change in this packet — variable-height windowing across a 792-line renderer with both flat and grouped paths — and it has a prerequisite that was only discovered by doing T1. Starting it in the same pass would have meant building on an order that is known to be wrong |
<!-- /ANCHOR:decisions -->
