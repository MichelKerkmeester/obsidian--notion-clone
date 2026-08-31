# Iteration 6: D3 overlay feature_catalog_code — SURFACE_REGISTRY census

## Dimension
traceability

## Files Reviewed
- `src/views/surface-contract.ts:63`
- `src/views/surface-contract.ts:224`
- `src/views/sort-panel-renderer.ts:81`

## Findings by Severity

### P0, Blocker
None this iteration.

### P1, Required
- **F013**: SURFACE_REGISTRY names five producers and omits live panels — `src/views/surface-contract.ts:224` — Registry keys are column-menu, owned-menu, record-detail-panel, filter-panel, date-value-picker. Sort, column manager, view-config, add-view sheet, and board covers are live with no registry row.

### P2, Suggestion
None this iteration.

## Traceability Checks
- `feature_catalog_code`: fail — Catalog stale vs live panels.

## Claim Adjudication
{
  "findingId": "F013",
  "claim": "SURFACE_REGISTRY is not a complete catalog of floating surfaces the plugin mounts.",
  "evidenceRefs": [
    "src/views/surface-contract.ts:224"
  ],
  "counterevidenceSought": "Looked for a later guard, allowlist, or shipped replacement before recording.",
  "alternativeExplanation": "Stale documentation only, or a test that no longer matches production.",
  "finalSeverity": "P1",
  "confidence": 0.84,
  "downgradeTrigger": "cited lines rewritten or shipped"
}

## Search Ledger
- SL-006: feature_catalog_gap / finding — SURFACE_REGISTRY enumerates every floating surface

## Verdict
Provisional iteration verdict maps from this pass only (P0→FAIL, P1→CONDITIONAL, P2-only→PASS). 

## Next Dimension
maintainability stale constants and citations

Review verdict: CONDITIONAL
