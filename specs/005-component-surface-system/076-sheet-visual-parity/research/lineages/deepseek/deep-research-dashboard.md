# Deep-Research Dashboard — lineage `deepseek`

| Field | Value |
|-------|-------|
| Session | `fanout-deepseek-1789102713325-fbmgv2` |
| Artifact dir | `specs/005-component-surface-system/076-sheet-visual-parity/research/lineages/deepseek` |
| Executor | `cli-pi` · `deepseek-v4.1-flash` · in-process (this session is the executor) |
| Stop policy | `max-iterations` × 10 — convergence is telemetry only |
| Iterations complete | **10 / 10** |
| Findings files | **10** (+ synthesis, coverage matrix, convergence report) |
| Stop reason (final) | **`maxIterationsReached`** — terminal event `synthesis_complete` |
| Mean newInfoRatio (iters 1–10) | **0.703** (min 0.63 at iteration 10; threshold 0.05 never approached) |

## Iteration ledger

| # | Gap class | Angle | newInfoRatio | Status | Findings |
|---|-----------|-------|--------------|--------|----------|
| 0 | — | phase_init | 1.00 | complete | — |
| 1 | COVERAGE | request → child → task → clause; surfaces with no child | 0.80 | complete | `findings/iter-1.md` |
| 2 | DEPTH | L1–L3+ grading of every child per phase | 0.72 | complete | `findings/iter-2.md` |
| 3 | REFERENCE_COMPOSITION | Source column, ClickUp lead for boards, D7 frame everywhere | 0.65 | complete | `findings/iter-3.md` |
| 4 | DESIGN_SYSTEM | token/primitive connection map, extraction order | 0.68 | complete | `findings/iter-4.md` |
| 5 | LOOP_LOGIC | D6 graph, driver, judge calibration, guard, release gate | 0.75 | complete | `findings/iter-5.md` |
| 6 | COVERAGE (2nd) | surface reachability; comparison object for zero-reference children | 0.70 | complete | `findings/iter-6.md` |
| 7 | DEPTH (2nd) | dark-theme object, both-theme agreement, vacuous pass, states | 0.73 | complete | `findings/iter-7.md` |
| 8 | DESIGN_SYSTEM (2nd) | colour roles, type scale vs D7's 17pt, stacking engine | 0.66 | complete | `findings/iter-8.md` |
| 9 | LOOP_LOGIC (2nd) | lane file, clause→gate path, judged comparator, outer walk | 0.71 | complete | `findings/iter-9.md` |
| 10 | CROSS-CUTTING | traceability rows→clauses→captures; claims→assertions | 0.63 | complete | `findings/iter-10.md` |

## Coverage counter

| Metric | Value |
|--------|-------|
| Children in the Phase Documentation Map | 19 |
| Children required by the success criterion | ≥ 15 — **met** |
| Children with named clauses | 12 (67 clause ids: 001 10, 002 6, 003–012 4–6) |
| Children with zero clauses | 7 (`013`–`017`, `019`; `018` carries criteria text only) |
| Children with judged full-sheet captures (D2) | 11 (`capture: "sheet"`, 22 PNGs) |
| Children with the D9 `Source` column | 7 (`013`–`019`) |
| Inventoried surfaces (`sheet-inventory.mjs`) | 87 (55 primary + 32 stacked) |
| Inventory rows with no reference of any kind | 47 (18 in `017`) |
| Requests without a child (roadmap §4 rows 70–94) | 0 — one surface gap remains (`dropdown-field.ts`, proposed `020`) |
| DEFINE rows vs clauses (scaffold set 003–019) | 119 rows / 51 clauses / 29 rows with neither |
| Children below L3 | 8 (`012` L2; `013`–`019` L1+–L2) |

## Question status

| Bucket | Count |
|---|---|
| Raised across the ten iterations | 21 |
| Answered by evidence inside the loop | 12 |
| Operator-scope (need a ruling) | 10 |
| Evidence-pipeline decisions the packet can make itself | 5 |
| Loop mechanics (answered by the synthesis's proposals) | 4 |
| On the packet's own open-question lists already | ~10 — **nine are unowned** |

## Convergence trend

| Iteration | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| newInfoRatio | 0.80 | 0.72 | 0.65 | 0.68 | 0.75 | 0.70 | 0.73 | 0.66 | 0.71 | 0.63 |

## Dead ends / ruled out

- `020`-as-replacement for `001`'s primitives (iteration 6 — the shared row primitive shrinks it).
- Clause sections joining mechanically to the lane tool (iteration 10 — no join key exists for 17 of 19 children).
- “The lane's holder is the parent packet” (iteration 9 — disproved at HEAD).
- “`--status-color-fg-*` are host tokens” (iteration 8 — plugin-owned).
- “`016` bundles deprecated renderers” (iteration 6 — live modules, dead presentation path).
- “The stacked-pair registry is small” (iteration 8 — 8 named pairs; 32 in the audit).

## Blocked stops

None. No `blocked_stop` event was emitted; no gate blocked synthesis. The only process deviations are
recorded in `convergence-report.md` §5 (direct state appends because the append gateway writes outside
the lineage write surface).

## Next Focus

**Terminal.** The loop is complete at the cap. The next actor is the operator/orchestrator: apply
`research.md` §2's nine mechanical repairs, then rule on the ten operator-scope questions in
`findings/iter-10.md` §X-3 before the remaining eight children are launched.
