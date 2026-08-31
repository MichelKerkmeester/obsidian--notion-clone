# Iteration 8: D4 overlay playbook_capability — 009 live probe

## Dimension
maintainability

## Files Reviewed
- `specs/public/005-component-surface-system/009-live-verification/implementation-summary.md:48`
- `specs/public/005-component-surface-system/spec.md:248`
- `tools/live/probe.mjs:1`

## Findings by Severity

### P0, Blocker
None this iteration.

### P1, Required
- **F005**: 009 never drove the running Obsidian so the circular harness remains in force — `specs/public/005-component-surface-system/009-live-verification/implementation-summary.md:48` — Transport built; 1 of 13 criteria Met vacuously; app never driven. Parent spec.md:248-253 states 009 did not run first.

### P2, Suggestion
None this iteration.

## Traceability Checks
- `playbook_capability`: fail — Live scenarios not executed.

## Claim Adjudication
{
  "findingId": "F005",
  "claim": "The live-verification instrument has never produced a recorded value from the running app, so 000 harness claims remain self-measured.",
  "evidenceRefs": [
    "specs/public/005-component-surface-system/009-live-verification/implementation-summary.md:48"
  ],
  "counterevidenceSought": "Looked for a later guard, allowlist, or shipped replacement before recording.",
  "alternativeExplanation": "Stale documentation only, or a test that no longer matches production.",
  "finalSeverity": "P1",
  "confidence": 0.84,
  "downgradeTrigger": "cited lines rewritten or shipped"
}

## Search Ledger
- SL-008: playbook_capability / finding — 009 already recorded a live probe from the running app

## Verdict
Provisional iteration verdict maps from this pass only (P0→FAIL, P1→CONDITIONAL, P2-only→PASS). 

## Next Dimension
security adversarial replay of F001 including gallery path

Review verdict: CONDITIONAL
