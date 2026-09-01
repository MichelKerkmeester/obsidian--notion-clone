---
title: "Implementation Plan: Remaining Freezes"
description: "Five stages, gated so the open contradiction is resolved before any build, and so no per-item hoist ships without its own recorded before-number."
trigger_phrases:
  - "remaining freezes plan"
  - "028 plan"
importance_tier: "high"
contextType: "planning"
---
# Implementation Plan: Remaining Freezes
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:phases -->
## STAGE 1 — Count the rebuilds

Add the one instrument that does not exist: a count of `DatabaseView.refresh()` invocations per
user interaction. Today AC-4's claim rests on the call graph, which proves a path is reachable, not
how often it runs.

Cheapest honest form is a counter incremented at `database-view.ts:11421` and read by a test that
drives open → add rule → dismiss on each of the sort and filter sheets.

**Exit:** the three-rebuild claim in `spec.md` §2 is either confirmed with a number or corrected.

**Result — corrected to two, and reduced to one.** `tools/bench/panel-refresh-bench.ts` counts real
`DatabaseView.render` invocations across the real routing methods; the harness runs at phone width
because the panels portal to `body` there. Sort and filter each cost 2 rebuilds by either dismissal,
now 1. The count budget alone would have rewarded dropping the final update, so the harness also
asserts that the last render observed the state the round trip left behind — and that assertion is
what caught the filter panel's dropped keystroke debounce.

---

## STAGE 2 — GATE: resolve the contradiction

**Blocked on the operator.** `spec.md` §7 Q1–Q3: the freezing database's row count, the working
table view's column count and whether it is the same database, and the device.

This gate exists because the three answers lead to three different builds, and because building
before it means building on a boundary that measurement currently contradicts. **Do not start Stage
3 on an assumed row count.**

If the answer retires the boundary — different database, or a 3-column table against a 21-column
list — then Stage 4 is the phase and Stage 3 is a cleanup. If the boundary is real on identical
data, **stop and re-open the investigation**; something is unfound and virtualisation would be
aimed at the wrong target.

---

## STAGE 3 — Hoist the two live per-item forced layouts

`board-renderer.ts:770` and `table-renderer.ts:790`, following exactly the shape `024` used in
`list-renderer.ts`: a field decided once per render, because nothing `isTouchDevice` reads —
platform flags, pointer type, container width — can change during a synchronous render, and a
resize re-renders anyway.

**Per site, in this order, and the order is the point:**

1. Measure that renderer on the current tree at the 1A matrix. Record the number.
2. Hoist.
3. Re-measure. The number must move.

A site whose before-number was not recorded cannot be told apart from one that never had the defect.

**Note the asymmetry when hoisting the table.** `board` reads
`!this.actions.isReadOnly && !isTouchDevice(this.boardEl)` and short-circuits; `table` reads
`isTouchDevice(this.renderContainer) && (…)` and does not. The table's is therefore the hotter of
the two, and hoisting it changes behaviour for read-only views in a way board's does not.

**`table-record-peek.ts:90` is deliberately not in this stage.** It is real, it is per-cell, and it
sits on the surface the operator says works. Record it; do not fix it under this phase's scope.

---

## STAGE 4 — Bound the work

Only after Stage 2 says the cause is scale.

Nothing bounds the per-render row work: `ListRenderer.render` iterates every row
(`list-renderer.ts:171`), no view virtualises, and rows are capped only inside groups. The candidate
answers, cheapest first:

1. **Do not rebuild every row on a config change.** The sheets mutate sort and filter rules; a
   rebuild is the current mechanism, not a requirement. This is the highest-leverage change because
   it removes the multiplier on every one of the four sheet reports at once. *(Stage 1 halved the
   count by removing the redundant dismissal rebuild. The remaining rebuild is this item, and it is
   the one that costs the full row build.)*
2. **Window the ungrouped path** the way groups are already windowed, reusing
   `getGroupVisibleCount`'s established behaviour rather than inventing a second concept.
3. **Virtualise.** Largest blast radius; last resort.

`024` §2 declined windowing on the grounds that both renderers were linear. That reasoning was
sound at the row counts it measured and does not survive `spec.md` §4 — which is a finding about the
measurement ceiling, not about `024`'s judgement.

---

## STAGE 5 — Re-verify, including what was refuted

Re-run the 1A matrix and the throttled comparison. Re-assert AC-6: the refuted hypotheses stay
refuted, and the table stays the control.

**No screenshot lane.** This phase changes no CSS and no markup shape. If a capture's
`sourceHashes` name a touched renderer, `npm run screenshots:verify` will say so — and `024` §7
already recorded that the list fixtures do not change when the renderer does, so a green there is
not evidence either way.

**Baseline to return to green:** `npm run gate` 14 green exit 0 · `npx vitest run` 444 ·
`verify-placement` 186/190 with 4 declared reds.
<!-- /ANCHOR:phases -->
