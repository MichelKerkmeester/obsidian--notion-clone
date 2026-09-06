# Convergence Report - lineage glm-devpass

| Field | Value |
|---|---|
| Session | fanout-glm-devpass-1788702960144-zh42w5 |
| Stop reason | **maxIterationsReached** (10 of 10; stopPolicy max-iterations) |
| Converged before cap | No - newInfoRatio stayed above the 0.05 threshold on every iteration, as expected under the operator's fixed-count instruction; review angles were broadened (iterations 7-8) instead of synthesizing early |
| Iterations completed | 10 |
| newInfoRatio trend | 0.90, 0.85, 0.80, 0.75, 0.80, 0.70, 0.65, 0.75, 0.70, 0.40 (avg 0.73) |
| Questions answered | 5 of 5 (Q1 grammar divergence; Q2 shell bypass; Q3 lane holes; Q4 iOS/WebKit blind spots; Q5 ranked plan) |
| Operator reports | 4 of 4 mapped to producers or open divergences with anchors |
| Statuses | 9 complete, 1 thought (iteration 7 - analytical synthesis, no new sources) |
| Source diversity | 16 bounded sources + 1 justified extra across src/, styles.css, tools/, specs/, roadmap - no single-source findings |
| Negative knowledge | 7 ruled-out or refused directions recorded (iteration 10 §Negative knowledge) |

## Per-iteration summary

| N | Focus | Status | newInfo |
|---|---|---|---|
| 1 | Frame, handle, header vs measured | complete | 0.90 |
| 2 | Shell primitive: composition + constants | complete | 0.85 |
| 3 | Shell bypass audit (Q2) | complete | 0.80 |
| 4 | Lane coverage holes (Q3) | complete | 0.75 |
| 5 | Stacking depth rules | complete | 0.80 |
| 6 | The 10:04 iOS defect set | complete | 0.70 |
| 7 | iOS/WebKit blind spots + verification designs (Q4) | thought | 0.65 |
| 8 | Harness audit: registry, gap-cap threshold | complete | 0.75 |
| 9 | Ranked remediation plan (Q5) | complete | 0.70 |
| 10 | Consolidation + inference audit | complete | 0.40 |

## Quality guards

- Source diversity: pass (six source families, every finding multi-anchor).
- Focus alignment: pass (one declared focus per iteration; all five questions covered).
- No single-weak-source findings: pass (the one theme-token non-measurement - the handle
  contrast - is recorded as unmeasured, not asserted).
- Spec anchoring: intentionally not exercised - this is a detached fan-out lineage with a fixed
  write surface; no generated fence write-back was attempted, and no file outside the lineage
  directory was created or modified.
