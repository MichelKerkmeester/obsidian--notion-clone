# Convergence Report — lineage `deepseek` (`076-sheet-visual-parity`)

**Session:** `fanout-deepseek-1789102713325-fbmgv2` · loop `research` · executor `cli-pi:deepseek-v4.1-flash`
**Stop policy:** `max-iterations` × 10 · **convergence role:** telemetry-only
**Terminal state:** `synthesis_complete` · **stopReason:** `maxIterationsReached`

---

## 1. Iteration series

| # | Gap class (axis) | newInfoRatio | Findings | Sources | Status |
|---:|---|---:|---:|---:|---|
| 0 | phase_init | 1.00 | — | 5 | complete |
| 1 | COVERAGE | 0.80 | C-1…C-7 | 9 | complete |
| 2 | DEPTH | 0.72 | D-1…D-6 (+C-3 correction) | 7 | complete |
| 3 | REFERENCE_COMPOSITION | 0.65 | R-1…R-5 | 7 | complete |
| 4 | DESIGN_SYSTEM | 0.68 | DS-1…DS-5 | 8 | complete |
| 5 | LOOP_LOGIC | 0.75 | L-1…L-8 | 8 | complete |
| 6 | COVERAGE (2nd axis) | 0.70 | Z-1…Z-4 | 9 | complete |
| 7 | DEPTH (2nd axis) | 0.73 | T-1…T-4 | 9 | complete |
| 8 | DESIGN_SYSTEM (2nd axis) | 0.66 | Y-1…Y-4 | 8 | complete |
| 9 | LOOP_LOGIC (2nd axis) | 0.71 | G-1…G-6 | 10 | complete |
| 10 | CROSS-CUTTING | 0.63 | X-1…X-4 | 11 | complete |

Mean of iterations 1–10: **0.703**. Minimum: **0.63** (iteration 10). The `convergenceThreshold`
(0.05) was never approached, so no convergence STOP was available at any iteration and the loop
stopped at the configured cap — as `config.stopPolicy` requires. The terminal iteration still
produced first-time joins (the traceability matrix, the corrections ledger, the question ownership),
which is the evidence that the cap, not exhaustion, ended the run.

## 2. Quality-guard view (recorded, not gating)

| Guard | Reading at the cap |
|---|---|
| Key-question coverage | 21 questions raised across iterations 1–10; 12 answered by evidence inside the loop (the rest are operator-scope or packet decisions) |
| Evidence density | every finding carries a path + line, a quoted command, or a counted measurement; 0 findings rely on a summary alone |
| Hotspot saturation | the two most revisited hotspots were each opened from a new axis and yielded new facts — `sheet-grammar.mjs` (iterations 3 → 7 → 9: card machinery → vacuous pass → clause identity), the two running children (iterations 2 → 5 → 9: path 2 depth → loop contract → measured guard fit) |
| Source diversity | 5→11 distinct sources per iteration; 7–11 across the second half |

## 3. Corrections issued and superseded statements

| Iteration | Statement | Superseded by | Carried form |
|---:|---|---|---|
| 4, DS-2 | colour swatches read **host** `--status-color-fg-*` | 8, Y-1 | plugin's own, per-theme, **unnamespaced**; host-dependency half withdrawn |
| 3, LC-5 | stacking has no clause | 8, Y-3 | engine exists; gap is per-child ownership |
| 1, C-3 | `scratchpad/` citations fail to resolve | 2 | operator images resolve at `screenshots/operator/`; only the reasoning notes are absent |
| 2 | “0 `-sheet-mobile-` ids exist” | 2 (same iteration) | the variant is a `-sheet` scenario with `capture: "sheet"`; 11 exist |
| 1 (implied) | calendar/chart/timeline renderers possibly dead | 6, Z-1 | modules live and instantiated; the presentation path is gone |

No correction has itself been corrected; all five are single-step and verified in the tree.

## 4. Proposal ledger

| Class | Proposals |
|---|---|
| Coverage | `020-control-primitives-visual-parity`; a `deferred` child state; a named judged sample for `017` |
| Depth | clause ids + `CLAUSE_CONTROLS`; the `Clause`/`judge-only` traceability column; a states requirement; an optional ninth rubric row |
| Reference | `076/references.md`; six legal `Source` values; per-theme Source cells; `roadmap.md` §7.22 for `012` |
| Design system | the shared primitive set; extended type tokens; colour-role aliases + contrast floor; the post-D7 elevation ladder; LC-1…LC-7 |
| Loop | the lane schema check; `SURFACE_PHASE` in the packet; the in-repo pixel-delta comparator; `max_iters=6` + `DEFINE-REOPEN`; verdict rows/`captures`/`inputs`; outer-walk `LAUNCH/SKIP/STALL/LANE-WAIT`; per-resource caps |

## 5. Process notes and deviations

- **State records are appended directly to `deep-research-state.jsonl`, not through
  `append-mode-event.cjs`.** The gateway writes against the durable authority record in the run
  directory, which lies outside this lineage's configured write surface (`write_surface` is the
  lineage directory; `writeOutsideLineageForbidden: true`). Each append was verified to parse; the
  file holds `init` + 10 iteration records + the terminal `synthesis_complete` event.
- **No nested dispatch.** Every iteration was executed in-process in this session, per the fan-out
  brief; no CLI, agent or Task dispatch was used.
- **The five write flags were honoured**: nothing was written outside
  `specs/005-component-surface-system/076-sheet-visual-parity/research/lineages/deepseek/`; `git`,
  `validate.sh` and `generate-context.js` were not run.
- **Read-only tools exercised**: `tools/live/evidence.mjs --check-all` (16/16 fresh) and file reads
  under `tools/**`, `src/**`, `styles.css`, `specs/**` — all permitted by the config's
  `read_only_surface`.

## 6. Artifact index

| Artifact | Path |
|---|---|
| Synthesis | `research.md` |
| Coverage matrix | `coverage-matrix.md` |
| Convergence report (this file) | `convergence-report.md` |
| Findings | `findings/iter-1.md` … `findings/iter-10.md` |
| Iteration records | `iterations/iteration-001.md` … `iterations/iteration-010.md` |
| Deltas | `deltas/iter-001.jsonl` … `deltas/iter-010.jsonl` |
| State log | `deep-research-state.jsonl` |
| Dashboard / strategy / config | `deep-research-dashboard.md`, `deep-research-strategy.md`, `deep-research-config.json` |

## 7. Terminal record

```json
{"type":"event","event":"synthesis_complete","totalIterations":10,"answeredCount":12,"totalQuestions":21,"stopReason":"maxIterationsReached"}
```
