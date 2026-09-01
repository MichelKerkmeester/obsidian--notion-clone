# Iteration 4: D3 Traceability — parent inventory vs child folders

## Dimension
traceability

## Files Reviewed
- `specs/005-component-surface-system/spec.md:69`
- `specs/005-component-surface-system/spec.md:145`
- `specs/005-component-surface-system/spec.md:235`
- `specs/005-component-surface-system/roadmap.md:365`

## Findings by Severity

### P0, Blocker
None this iteration.

### P1, Required
- **F004**: Parent phase map is incomplete and under-counts folders — `specs/005-component-surface-system/spec.md:69` — Body says Twenty phase folders; map stops at 019 with a note that 020-028 rows are missing. Tree has 29 child spec.md files (000-006, 008-029).

### P2, Suggestion
- **F011**: Parent still narrates the deleted factory as the overlay sequence — `specs/005-component-surface-system/spec.md:235` — After recording deletion at :225, :235 still says once every surface goes through the factory.

## Traceability Checks
- `spec_code`: fail — Inventory claim false; map incomplete.

## Claim Adjudication
{
  "findingId": "F004",
  "claim": "The parent spec under-counts phases and omits 020-028 from the status map even though those folders exist.",
  "evidenceRefs": [
    "specs/005-component-surface-system/spec.md:69"
  ],
  "counterevidenceSought": "Looked for a later guard, allowlist, or shipped replacement before recording.",
  "alternativeExplanation": "Stale documentation only, or a test that no longer matches production.",
  "finalSeverity": "P1",
  "confidence": 0.84,
  "downgradeTrigger": "cited lines rewritten or shipped"
}

## Search Ledger
- SL-004: inventory_gap / finding — Parent map lists every child folder

## Verdict
Provisional iteration verdict maps from this pass only (P0→FAIL, P1→CONDITIONAL, P2-only→PASS). 

## Next Dimension
traceability core protocol checklist_evidence

Review verdict: CONDITIONAL
