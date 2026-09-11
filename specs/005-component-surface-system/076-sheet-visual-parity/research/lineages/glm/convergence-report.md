# Convergence Report — lineage `glm`

| Field | Value |
|---|---|
| Session | `fanout-glm-1789102713325-fbmgv2` |
| Loop | `research` · lineage `glm` of the 3-lineage fan-out (deepseek, glm, luna) |
| Target | `specs/005-component-surface-system/076-sheet-visual-parity` |
| Artifact dir | `specs/005-component-surface-system/076-sheet-visual-parity/research/lineages/glm` |
| **Stop reason** | **`maxIterationsReached`** — the 5-iteration cap of `config.maxIterations` reached; `stopPolicy: max-iterations` (convergence never stopped the loop early; it was telemetry only, and no pre-cap convergence occurred) |
| Total iterations | 5 of 5, plus phase_init (iteration 0) and phase_synthesis |
| Iterations at cap with `stopReason` recorded | terminal synthesis event in `deep-research-state.jsonl` carries `stopReason: "maxIterationsReached"`; mirrored here |
| Questions answered | 10/10 strategy-registered angles executed (5 gap classes, one per iteration, none repeated); 076's founding open question (spec §6, judge-vs-operator) additionally answered within the loop (F5.3) — 1/3 of the packet's own §6 questions retired as a by-product |
| Average newInfoRatio | 0.66 (per-iteration: 0.70, 0.65, 0.60, 0.70, 0.65) — the convergence threshold 0.05 was never crossed; no iteration fell below 0.60, so the loop ran at full signal throughout (per the brief: convergence before the cap = telemetry only, broaden instead — the cap arrived first) |
| Findings | 26 finding records + 1 grade record across 5 deltas; 6+7+6+4+5 = 28 findings-as-articles (two rolled into delta records: F3.0-reserve, F4-summary), every one with a `path:line` + quote + paste-ready proposal + confidence 0.80–0.95 |
| Success criteria | (1) coverage matrix: no 076-owned request without a child (matrix §2 of `research/research.md`); (2) depth: 19×6 graded, every below-L3 cell carries its paste; (3) ≥15 multi-phased children: 19 + 020 proposed = 20; (4) design-system connection map: §5; (5) loop-logic change list: §6 — all present in the synthesis |
| Quality guards | source diversity 10–13 distinct sources per iteration (roadmap, packet docs, 19 children's docs, src/**, styles.css, the /tmp loop artifacts); focus: one gap class per iteration, never repeated; no single-weak-source findings — every claim is a read, grep-census, or flagged inference |
| Continuity | the runner's; this lineage wrote nothing outside its artifact dir and executed no repo tooling (no validate.sh, no generate-context.js, no git writes — per the dispatch contract) |

Per-iteration ledger (mirrors `deep-research-dashboard.md`):

| # | Gap class | Angle | newInfoRatio | Status | Findings |
|---|-----------|-------|--------------|--------|----------|
| 0 | — | phase_init | 1.00 | complete | — |
| 1 | COVERAGE | requests × surfaces → child/task/clause | 0.70 | complete | 6 + 1 negative |
| 2 | DEPTH | 19×6 grade vs L3/L3+ | 0.65 | complete | 7 (6 + grade record) |
| 3 | REFERENCE_COMPOSITION | Source columns, ClickUp-lead, D7/D9 constraints, ADRs | 0.60 | complete | 6 (incl. the F3.0 reserve) |
| 4 | DESIGN_SYSTEM | connection map, extraction, landing order | 0.70 | complete | 4 + negative knowledge |
| 5 | LOOP_LOGIC | GATE/guard/verdict/DONE/brief | 0.65 | complete | 5 |
| — | synthesis | `stopReason: maxIterationsReached` | — | complete | research.md |
