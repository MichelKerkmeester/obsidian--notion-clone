---
title: "Tasks: Remaining Freezes"
description: "Ordered work items with their gates, each naming the evidence that closes it."
trigger_phrases:
  - "remaining freezes tasks"
  - "028 tasks"
importance_tier: "high"
contextType: "planning"
---
# Tasks: Remaining Freezes
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:phase-2 -->
## STAGE 1 — Count the rebuilds *(done)*

- [x] **T1.1** Instrument the count. `tools/bench/panel-refresh-bench.ts` wraps `DatabaseView.render`
  and drives the real `toggleHeaderPopover`, `closeHeaderPopovers`, `renderSortPanel`,
  `renderFilterPanel` and `refresh`, plus the real `SortPanelRenderer` and `FilterPanelRenderer`.
  Run by `tools/bench/run-panel-refresh.mjs` in headless Chrome at 390px with `is-phone`, because at
  phone width the panels are portalled to `body` as sheets and a container-scoped harness sees nothing.
- [x] **T1.2 / T1.3** Sort and filter, dismissed by the toolbar button and by an outside click.
  → **2 rebuilds each** before the change (open 0, change 1, dismiss 1); **1 each** after.
- [x] **T1.4 — the three-rebuild claim was wrong and is corrected to two.** The third was inferred
  from the call graph; whichever close path runs first clears the panel flags and
  `closeHeaderPopovers` early-returns. → closes **AC-4**.

**Also found and fixed here, because the fix required it.** `FilterPanelRenderer.render(visible:false)`
called `clearPendingRefresh`, which **dropped** the 220ms keystroke debounce; the unconditional
dismissal rebuild was the only thing painting it. Making the dismissal conditional without flushing
that timer discards a value typed and dismissed inside the window. `flushPendingRefresh` now runs the
owed refresh rather than cancelling it.

## STAGE 2 — GATE

- **T2.1** Put Q1–Q3 (`spec.md` §7) to the operator.
- **T2.2** Record the answers verbatim in this folder. Do not paraphrase a row count.
- **T2.3** Decide which branch of `plan.md` Stage 4 applies — or stop and re-open, if the boundary
  survives on identical data. → closes **AC-5**.

## STAGE 3 — Hoist the per-item forced layouts *(done — see `implementation-summary.md`)*

- [x] **T3.1** Record `board-renderer.ts:770`'s before-number on the current tree.
  → 2,990.4ms blocked at 6,400 rows, fitted k=1.38, steepest segment 1.80.
- [x] **T3.2** Hoist it to a per-render field; re-measure; the number must move.
  → 1,068.8ms, k=1.14. **2.80×.** Measured on the container, not `board`: `.db-board` is
  `width: max-content` and grows mid-render, so it has no single value to hoist. This changes
  narrow-split-pane drag behaviour — `implementation-summary.md` §1.
- [x] **T3.2b** *(not in the original plan)* `gallery-renderer.ts:277`, `:423`, `:448` — three
  per-card calls the audit missed entirely, one with no read-only guard.
  → 16,700.2ms → 1,000.7ms, k 1.89 → 1.10. **16.69×**, the worst of the three renderers.
- [x] **T3.3 / T3.4 — premise refuted, deliberately not done.** `TableRenderer` builds its body
  off-document (`:139-146`) and attaches it once, so its per-row calls flush nothing: a per-item
  forced layout costs ×80.1 into an attached container and ×0.8 into a detached one, measured.
  Hoisting `:790` would buy nothing and would change read-only behaviour for no gain.
  → `implementation-summary.md` §3.
- [x] **T3.5** `table-record-peek.ts:90` recorded — per row, but detached like the rest of the
  table, so free. It also measures the `td` rather than the pane, which is a latent correctness
  bug it shares with `database-view.ts:5087`; both need an owner decision, neither was taken here.

## STAGE 4 — Bound the work *(gated on T2.3)*

- **T4.1** Establish whether a sort or filter change needs a full rebuild at all, or whether the
  rule set can be reapplied without destroying every row. *(Stage 1 removed the **repeated** rebuild,
  not the rebuild. One change still costs one full row build, which is what this task is about.)*
- **T4.2** If a rebuild is genuinely required, window the ungrouped path using the existing
  `getGroupVisibleCount` behaviour rather than a second concept.
- **T4.3** Re-measure at the operator's confirmed shape at 6× throttle. → closes **AC-1**.
- **T4.4** Re-run the 1A matrix; the verdict must not read SUPERLINEAR. → closes **AC-3**.
<!-- /ANCHOR:phase-2 -->

<!-- ANCHOR:phase-3 -->
## STAGE 5 — Re-verify

- **T5.1** Re-run `npm run bench:list -- --rows=400,1600,3200,6400,12800 --cols=21 --fill=0.3`,
  exit code read unpiped.
- **T5.2** Re-run `run-compare.mjs --throttle` from the repository root; delete the `dist/` it writes.
- **T5.3** Re-assert AC-6 — the refuted hypotheses stay refuted, the table stays the control.
- **T5.4** Return the baseline to green: `npm run gate` 14 · `npx vitest run` 444 ·
  `verify-placement` 186/190 with 4 declared reds.
- **T5.5** Operator confirms on device. Nothing here substitutes for it.
<!-- /ANCHOR:phase-3 -->

## ADDED FROM THE DEEP REVIEW

- [ ] **T-F002** A sort or filter mutation must not destroy and rebuild every view — review finding
      F002, `database-view.ts:11485`.
      *Evidence to close:* a mutation repaints the affected rows without a full teardown, measured
      at the operator's shape rather than at a bench default.
      **Why this needs its own row:** this phase's ticked criterion bounds the *number* of rebuilds
      at one and says outright that it "bounds the number of rebuilds, never the cost of the one."
      F002 is about that one rebuild still being wrong, so the ticked row does not cover it and
      would otherwise read as if it did.
