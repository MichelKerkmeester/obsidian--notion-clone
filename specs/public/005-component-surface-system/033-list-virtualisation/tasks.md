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
    recent_action: "Flat list windowed; node count flat at 2,184 and blocked time 4,748.6ms -> 48.4ms"
    next_safe_action: "Window the grouped path, which still renders every row"
    blockers: []
    key_files: ["spec.md", "tasks.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-033"
      parent_session_id: null
    completion_pct: 83
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
- [x] **T2** Window the rendered row range — REQ-001. **Flat lists only — see the limit below.**
      *Evidence to close:* node count stops growing linearly with row count.
      *Closed by:* `mountWindow` / `updateWindow` / `paintWindow` in `list-renderer.ts`. Spacers
      carry the height of everything unmounted, so the scroll bar keeps its length and its
      position. **Node count is flat: 2,184 at 1,000 rows, 2,184 at 3,000, 2,184 at 3,400.**
      Row height is MEASURED, not assumed — `.db-list-row` is `min-height: 44px`, so a guessed
      constant would size the spacers wrong and the scroll bar would lie. It is re-measured on
      every recycle, so the estimate improves as taller and shorter rows come into view.
      *Below 120 rows nothing changes:* no spacers, no listener, the same DOM as before. Every
      screenshot fixture and placement story is small, so a window that engaged for twelve rows
      would rewrite hundreds of captures to no purpose.
      *The limit, stated rather than discovered later:* **only the flat list is windowed.** Grouped
      lists still render every row, so a grouped view at the operator's shape still blocks. That is
      not a regression, but it is not a fix either, and REQ-001 is met for one of the two paths.
- [x] **T3** Re-prove the three contracts against an **off-window** row — REQ-002.
      *Evidence to close:* each behaves as T1 recorded. This is where windowing breaks first.
      *Closed by:* the `list-window` gate lane, driving the real renderer at 2,000 rows. The
      off-window row is one **the renderer itself declined to mount** — 27 of 2,000 — rather than
      one modelled by hand, which is the only version that can catch the renderer deciding wrongly.
      **Range selection** — fixed first, as T1 required. `database-view` now records the visual
      order at render time and the selection reads that instead of the DOM. The lane runs BOTH
      orderings against the same window: the DOM order still collapses to **2 rows**, the recorded
      order spans all **28**. The failing half is kept deliberately — without it a green could mean
      the window was not exercising the difference at all.
      **Drag batch** — an off-window row stays addressable, as T1 predicted, because `rowByPath`
      holds every row the renderer was given.
      **Group collapse** — *not applicable yet, and not ticked.* Grouped lists are not windowed, so
      a grouped list has no off-window row to prove it against. It behaves exactly as T1 recorded
      because nothing about it changed.
- [x] **T4** Scroll offset survives a window recycle.
      *Evidence to close:* offset stable across a recycle, asserted.
      *Closed by:* the lane scrolls to 4,000px, confirms the mounted range actually moved (row-0 to
      row-70 — a recycle that did not happen would make the offset check meaningless), and asserts
      `scrollTop` is still 4,000. The spacers carry the unmounted height, so replacing the middle
      cannot move the position; mis-sized spacers would show up here as a clamp or a jump.
- [x] **T5** Re-measure past the bend — REQ-003.
      *After windowing*, 21 cols / 100% fill / 6x throttle, phone: **48.3ms at 1,000 rows, 48.4ms
      at 3,000, 50.3ms at 3,400** — measured past 3,200 as the task requires. Verdict **SUBLINEAR
      x0.31**. Against a 2,000ms budget that is a 40x margin where there was a 2.4x breach.
      *One honesty fix to the bench itself:* it created its container with no height, so a windowed
      list computed its window against a viewport no device has. The container now takes the
      surface's own `window.innerHeight`. This changed nothing about the old full-render numbers —
      every row was built regardless — but it decides how many rows a window keeps, and a harness
      supplying its own viewport is measuring the harness.
      *The pre-fix baseline, kept:* **Baseline re-measured before any change.**
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
- [x] **T6** The renderer assertion still passes — REQ-004.
      *Evidence to close:* the layout-read bound holds; windowing has not defeated it.
      **It did not pass at first, and it was right not to.** The first version of the row-height
      measurement summed `offsetHeight` across every painted row — a forced read per row, which is
      the exact shape this assertion exists to catch. It reported 13 reads against a bound of 8.
      Bounded by the window is not the same as bounded. Rewritten to span the first and last row:
      three reads, constant whatever the window size, same average.
      *Three assertions were changed, and this is the honest part:* "rows rendered", "open
      affordance is one per row" and "checkbox affordance is one per row" all counted against the
      TOTAL row count. REQ-001 requires node count to stop tracking row count, so "every row is
      rendered" is a requirement this phase deliberately replaced — it could not be met while that
      assertion demanded the opposite. The affordance checks keep their invariant exactly (a second
      checkbox on any row still fails); only their denominator moved to the mounted rows. "rows
      rendered" became a stricter claim: the window must be a real subset, neither empty nor whole.
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
