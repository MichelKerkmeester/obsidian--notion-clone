---
title: "Implementation Plan: Mobile UX Research — Eight Architecture Decisions"
description: "How the ten-iteration source audit was run and gated: forced-depth loop configuration, the executor and its provenance, the evidence convention that separates confirmed fact from inference, and the correction pass that rebuilt the decision matrix against the authoritative device inventory."
trigger_phrases:
  - "mobile ux research plan"
  - "forced depth research loop"
  - "max-iterations stop policy research"
  - "research evidence convention"
importance_tier: "high"
contextType: "planning"
---
# Implementation Plan: Mobile UX Research — Eight Architecture Decisions

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

A single-lineage deep-research loop of ten iterations over the current branch's source, answering
eight architecture questions derived from eighteen device-reported defects. Convergence was
configured as telemetry only so the loop could not stop early on apparent saturation. The output is
a seventeen-section synthesis, a resource map, and a per-defect decision matrix that the `014+`
build phases consume.

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Expectation |
|---|---|
| Iteration completeness | 10 of 10, each with narrative, JSONL delta, and gateway event |
| Question closure | 8 of 8 answered, 0 open |
| Evidence | every load-bearing claim carries a current-branch `file:line` |
| Honesty | `Confirmed` / `[INFERENCE]` / `UNKNOWN` marked per claim |
| Inventory fidelity | the matrix reconciles the authoritative inventory, not a substitute |
| Packet validation | no *authoring* errors; two environmental errors per leaf are expected while the memory MCP is down |

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Loop configuration (REQ-002)

`stopPolicy: max-iterations`, `maxIterations: 10`, `convergenceThreshold: 0.05` retained for
telemetry. Artifacts resolve to `research/`, with the fan-out lineage under `research/lineages/luna/`.

### Executor (REQ-001)

`cli-codex` running `gpt-5.6-luna` at `xhigh` reasoning on the `fast` service tier. Provenance is
recorded in the synthesis so a later reader can weigh the source.

### Evidence convention (REQ-004)

Three markers, applied per claim rather than per document: `Confirmed` means a cited current-branch
file was read; `[INFERENCE]` means a design recommendation derived from confirmed structure;
`UNKNOWN` means device, accessibility, or visual validation that this source-only lineage could not
perform. A source-only lineage cannot produce device proof, and saying so is part of the deliverable.

### Inventory correction (REQ-003)

The first synthesis reconciled against a substituted list because the packet contained no device
report; the lineage flagged the substitution rather than hiding it. The remedy was to write the
authoritative inventory into the packet and re-run one focused pass over that section alone,
preserving the eight question answers which were in scope and correct.

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

| Phase | Work | State |
|---|---|---|
| 1 | Initialize packet: config, state ledger, strategy with the eight questions, findings registry | Done |
| 2 | Run ten iterations under forced depth | Done |
| 3 | Synthesize into `research.md` + `resource-map.md` | Done |
| 4 | Write the authoritative device inventory | Done |
| 5 | Rebuild the decision matrix against it | In progress |
| 6 | Cut build phases `014+` from the matrix | Pending |

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

Research is verified by audit rather than by test execution. Each iteration is checked for a
narrative, a delta record, and a gateway receipt; the registry is checked for iteration count and
question closure; citations are spot-checked against the files they name. No repository gate is run
by this packet, because it changes no source.

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

- The `system-spec-memory` MCP is down, so `description.json` cannot be generated for any leaf here.
- The deep-loop runner cannot resolve spec folders outside the hub's approved roots; this packet is
  reached through the fan-out runner, which validates only that the artifact directory sits inside
  the spec folder's research tree.
- `stopPolicy: max-iterations` additionally requires a per-lineage `lineage.iterations` cap. Omitting
  it lets the loop run correctly but fails the lineage at teardown.

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

The packet writes no source and touches no git state. Rollback is deletion of the packet directory.
Nothing downstream depends on it until the build phases are cut.

<!-- /ANCHOR:rollback -->
---

## 8. CROSS-REFERENCES

- Authoritative inventory: [`device-defect-inventory.md`](device-defect-inventory.md)
- Synthesis: [`research/lineages/luna/research.md`](research/lineages/luna/research.md)
- Decision matrix: [`decision-matrix.md`](decision-matrix.md)
- Predecessor: [`../012-mobile-name-column-and-fab/spec.md`](../012-mobile-name-column-and-fab/spec.md)
