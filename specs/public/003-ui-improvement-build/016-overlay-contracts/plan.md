---
title: "Implementation Plan: Overlay Presentation, Placement and Layer Contracts"
description: "Approach, gates and rollback for 016-overlay-contracts, covering inventory items #4, #5, #6, #7."
trigger_phrases:
  - "016 overlay contracts plan"
importance_tier: "high"
contextType: "planning"
---
# Implementation Plan: Overlay Presentation, Placement and Layer Contracts

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

Split presentation from placement, and give the layer scale every tier it is already being asked for. Covers inventory items #4, #5, #6, #7. The governing analysis is
[`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md); read the rows for these items
before planning the edits.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Expectation |
|---|---|
| `tsc --noEmit` | exit 0, no output — read without a pipe |
| `npm run build` | exit 0 |
| `vitest run` | all tests pass |
| `screenshots:verify` | exit 0, every entry matching |
| `npm run lint` | not a CI gate; hold the 115 baseline as convention |

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

Derived from the decision matrix rather than restated here. Each in-scope item's root cause,
chosen design and evidence are recorded per row; this phase implements those decisions and does
not re-open them.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

| Step | Work |
|---|---|
| 1 | Read the matrix rows for the owned items and the phase note in `spec.md` §6 |
| 2 | Implement source changes |
| 3 | Implement CSS changes, if any, holding the capture token |
| 4 | Run the full gate set from the final state |
| 5 | Confirm on a physical device where the item is visual |

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

`vitest` runs `environment: "node"` with no jsdom, so every CSS assertion is a text match against
source. Behavioural DOM tests are not possible; any guard added here inherits that weakness and
should be treated as a regression tripwire, not proof of behaviour. Mock elements in new tests must
implement `setCssProps` or the code under test throws.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

Predecessor `015-ts-only-wins-and-release-proof`. The decision matrix's dependency order governs; a phase that depends on an
architecture contract may not start until that contract has landed.

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Revert the phase's commits. No migration, no persisted state change, except where a schema
descriptor is explicitly introduced — in which case the descriptor is optional and absent values
retain current behaviour.

<!-- /ANCHOR:rollback -->
---

## 8. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md)
- [`../013-mobile-ux-research/decision-matrix.md`](../013-mobile-ux-research/decision-matrix.md)
- [`../013-mobile-ux-research/device-defect-inventory.md`](../013-mobile-ux-research/device-defect-inventory.md)
