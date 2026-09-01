# Iteration 1: D1 Correctness — freeze refresh path

## Dimension
correctness

## Files Reviewed
- `specs/public/005-component-surface-system/028-remaining-freezes/spec.md:53`
- `src/views/database-view.ts:11484`
- `src/views/database-view.ts:2833`
- `src/views/sort-panel-renderer.ts:81`

## Findings by Severity

### P0, Blocker
None this iteration.

### P1, Required
- **F002**: Sort and filter mutations still destroy and rebuild every view — `src/views/database-view.ts:11484` — refresh() querySelectorAll removes every :scope view root then render(); sort add-rule still calls actions.refresh().

### P2, Suggestion
None this iteration.

## Traceability Checks
- `spec_code`: partial — 028 freeze mechanism is present; cited line 11421 is stale.

## Claim Adjudication
{
  "findingId": "F002",
  "claim": "DatabaseView.refresh() still tears down every rendered view and rebuilds it; sort-panel add-rule and header-popover dismissal still call that path.",
  "evidenceRefs": [
    "src/views/database-view.ts:11484"
  ],
  "counterevidenceSought": "Looked for a later guard, allowlist, or shipped replacement before recording.",
  "alternativeExplanation": "Stale documentation only, or a test that no longer matches production.",
  "finalSeverity": "P1",
  "confidence": 0.84,
  "downgradeTrigger": "cited lines rewritten or shipped"
}

## Search Ledger
- SL-001: state_transition / finding — refresh() no longer tears down views after 028

## Verdict
Provisional iteration verdict maps from this pass only (P0→FAIL, P1→CONDITIONAL, P2-only→PASS). 

## Next Dimension
correctness on 000 openSurface vs deleted factory and 006 resolver

Review verdict: CONDITIONAL
