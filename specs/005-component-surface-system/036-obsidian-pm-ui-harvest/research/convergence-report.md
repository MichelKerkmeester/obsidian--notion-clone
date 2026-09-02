---
title: "Deep research convergence report — Luna PM harvest"
status: complete
session_id: fanout-luna-max-fast-pm-harvest-1788379278687-inumo2
stop_policy: max-iterations
stop_reason: maxIterationsReached
iterations: 20
convergence_threshold: 0.1
---

# Convergence report

## Phase status

| Phase | Status | Evidence |
|---|---|---|
| `phase_init` | complete | Exact topic, spec folder, executor metadata, session id, direct fan-out artifact override, and packet-local strategy/config were recorded. |
| `phase_main_loop` | complete | Iterations `01` through `20` and deltas/events `01` through `20` are present in this lineage. |
| `phase_synthesis` | complete | `research/research.md` and the root projection contain the five-surface catalog, 38-row source→local map, adoption plan, report matrix, and do-not-borrow list. |

## Stop semantics

The configured stop policy was `max-iterations`, with `maxIterations: 20` and
`convergenceThreshold: 0.1`. The ratio series was
`1.00,.92,.88,.82,.78,.74,.68,.64,.58,.54,.50,.46,.42,.38,.34,.30,.26,.22,.18,.14`.
The threshold was used as telemetry only; it did not authorize early synthesis. The terminal event
records `stopReason: maxIterationsReached`, `totalIterations: 20`, and five answered surface
questions.

## Evidence and containment

- Source root: `specs/context/obsidian-pm-main`, read locally and treated as MIT-licensed reference.
- No browser or external-source claims were used.
- The native detached `cli-codex model=gpt-5.6-luna` startup was blocked before a model turn by the
  outer app-server permission boundary. The packet-local fallback preserved the requested executor
  metadata and completed the same three phases from local source reads.
- All artifacts, including state, events, deltas, reports, ledgers, registry/dashboard projections,
  resource map, and spot-check, are descendants of this lineage directory. No product code or
  out-of-scope packet file was modified.
