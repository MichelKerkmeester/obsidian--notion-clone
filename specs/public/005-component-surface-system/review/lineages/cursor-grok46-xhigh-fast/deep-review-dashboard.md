---
title: Deep Review Dashboard
description: Auto-generated reducer view over the review packet.
---

# Deep Review Dashboard - Session Overview

Auto-generated from JSONL state log, iteration files, findings registry, and strategy state. Never manually edited.

<!-- ANCHOR:overview -->
## 1. OVERVIEW

Reducer-generated observability surface for the active review packet.

<!-- /ANCHOR:overview -->
<!-- ANCHOR:status -->
## 2. STATUS
- Review Target: specs/public/005-component-surface-system (spec-folder)
- Started: 2026-08-31T12:17:49.000Z
- Status: COMPLETE
- Iteration: 10 of 10
- Provisional Verdict: FAIL
- hasSearchDebt: true
- hasAdvisories: false
- Session ID: fanout-cursor-grok46-xhigh-fast-1788178447595-968qzp
- Parent Session: none
- Lifecycle Mode: new
- Generation: 1
- continuedFromRun: none

<!-- /ANCHOR:status -->
<!-- ANCHOR:dimension-expansion -->
## 2A. DIMENSION EXPANSION
- Completed pivots: 0
- Failed pivots: 0
- Audited overrides: 0
- Swept: none yet
- Pivot lineage: none yet
- Remaining frontier: none recorded

<!-- /ANCHOR:dimension-expansion -->
<!-- ANCHOR:findings-summary -->
## 3. FINDINGS SUMMARY

| Severity | Count |
|----------|------:|
| P0 (Blockers) | 1 |
| P1 (Required) | 7 |
| P2 (Suggestions) | 7 |
| Resolved | 0 |

<!-- /ANCHOR:findings-summary -->
<!-- ANCHOR:progress -->
## 4. PROGRESS

| # | Focus | Dimensions | Ratio | P0/P1/P2 | Status |
|---|-------|------------|-------|----------|--------|
| 1 | correctness | correctness | 0.45 | 0/1/0 | complete |
| 2 | correctness | correctness | 0.41 | 0/3/0 | complete |
| 3 | security | security | 0.62 | 1/3/1 | complete |
| 4 | traceability | traceability | 0.28 | 1/4/2 | complete |
| 5 | traceability | traceability | 0.22 | 1/5/2 | complete |
| 6 | traceability | traceability | 0.18 | 1/6/2 | complete |
| 7 | maintainability | maintainability | 0.12 | 1/6/5 | complete |
| 8 | maintainability | maintainability | 0.20 | 1/7/5 | complete |
| 9 | security | security | 0.50 | 1/7/5 | complete |
| 10 | maintainability | maintainability | 0.08 | 1/7/7 | complete |

<!-- /ANCHOR:progress -->
<!-- ANCHOR:dimension-coverage -->
## 5. DIMENSION COVERAGE

| Dimension | Status | Open findings |
|-----------|--------|--------------:|
| correctness | covered | 5 |
| security | covered | 2 |
| traceability | covered | 3 |
| maintainability | covered | 5 |

<!-- /ANCHOR:dimension-coverage -->
<!-- ANCHOR:blocked-stops -->
## 6. BLOCKED STOPS
No blocked-stop events recorded.

<!-- /ANCHOR:blocked-stops -->
<!-- ANCHOR:graph-convergence -->
## 7. GRAPH CONVERGENCE
- graphConvergenceScore: 0.00
- graphDecision: none
- graphBlockers: none

<!-- /ANCHOR:graph-convergence -->
<!-- ANCHOR:trend -->
## 8. TREND
- Last 3 ratios: 0.20 -> 0.50 -> 0.08
- convergenceScore: 0.92
- openFindings: 15
- persistentSameSeverity: 0
- severityChanged: 1
- repeatedFindings (deprecated combined bucket): 1

<!-- /ANCHOR:trend -->
<!-- ANCHOR:corruption-warnings -->
## 9. CORRUPTION WARNINGS
No corrupt JSONL lines detected.

<!-- /ANCHOR:corruption-warnings -->
<!-- ANCHOR:search-debt -->
## 10. SEARCH DEBT
- graphCoverageMode: graphless_fallback
- candidateCoverage: covered=8, ruledOut=1, deferred=1, blocked=0

### Search Debt
- iteration 10 stale_status (deferred): Expected remaining work, not a new P1; evidence=specs/public/005-component-surface-system/027-sheet-menu-grammar-and-motion/spec.md:18

### Ruled-Out Candidates
- iteration 9 unsafe_scheme (ruled_out): Gallery shares the hole; F001 refined not replaced; evidence=src/data/cover-image.ts:47

### Clean Search Proof
- iteration 9 unsafe_scheme (ruled_out): Gallery shares the hole; F001 refined not replaced; evidence=src/data/cover-image.ts:47

<!-- /ANCHOR:search-debt -->
<!-- ANCHOR:next-focus -->
## 11. NEXT FOCUS
[All dimensions covered]

<!-- /ANCHOR:next-focus -->
<!-- ANCHOR:active-risks -->
## 12. ACTIVE RISKS
- 1 active P0 finding(s) blocking release.
- 7 active P1 finding(s) — required before release; not a P0 but still blocks PASS.
- 1 search-debt obligation(s) remain deferred or blocked. Verdict is CONDITIONAL until they are covered or ruled out.

<!-- /ANCHOR:active-risks -->
