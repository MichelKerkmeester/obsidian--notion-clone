# Iteration 2: D1 Correctness — deleted factory and unshipped 006 resolver

## Dimension
correctness

## Files Reviewed
- `specs/public/005-component-surface-system/000-surface-contract-and-truthful-harness/spec.md:59`
- `specs/public/005-component-surface-system/000-surface-contract-and-truthful-harness/spec.md:242`
- `specs/public/005-component-surface-system/000-surface-contract-and-truthful-harness/spec.md:306`
- `specs/public/005-component-surface-system/spec.md:133`
- `specs/public/005-component-surface-system/006-record-open-target/spec.md:78`

## Findings by Severity

### P0, Blocker
None this iteration.

### P1, Required
- **F003**: Child 000 still specifies deleted openSurface as the create path — `specs/public/005-component-surface-system/000-surface-contract-and-truthful-harness/spec.md:59` — REQ-001 and the files table still require src/views/surface.ts and openSurface(). Glob finds no surface.ts. Parent spec.md:225 records the deletion.
- **F007**: Parent lists 006 as Planned while the child is in progress without the resolver — `specs/public/005-component-surface-system/spec.md:133` — Child 006 status is In progress; setting, resolver, and measurements remain unshipped. Parent map still says Planned.

### P2, Suggestion
None this iteration.

## Traceability Checks
- `spec_code`: fail — Normative factory claim contradicts shipped tree; 006 status row disagrees with child.

## Claim Adjudication
{
  "findingId": "F003",
  "claim": "000 still requires openSurface() and src/views/surface.ts after that module was deleted.",
  "evidenceRefs": [
    "specs/public/005-component-surface-system/000-surface-contract-and-truthful-harness/spec.md:59"
  ],
  "counterevidenceSought": "Looked for a later guard, allowlist, or shipped replacement before recording.",
  "alternativeExplanation": "Stale documentation only, or a test that no longer matches production.",
  "finalSeverity": "P1",
  "confidence": 0.84,
  "downgradeTrigger": "cited lines rewritten or shipped"
}

{
  "findingId": "F007",
  "claim": "006 open-target setting and resolver are unshipped, and the parent status row disagrees with the child.",
  "evidenceRefs": [
    "specs/public/005-component-surface-system/spec.md:133"
  ],
  "counterevidenceSought": "Looked for a later guard, allowlist, or shipped replacement before recording.",
  "alternativeExplanation": "Stale documentation only, or a test that no longer matches production.",
  "finalSeverity": "P1",
  "confidence": 0.84,
  "downgradeTrigger": "cited lines rewritten or shipped"
}

## Search Ledger
- SL-002: spec_code_drift / finding — openSurface still exists under another filename

## Verdict
Provisional iteration verdict maps from this pass only (P0→FAIL, P1→CONDITIONAL, P2-only→PASS). 

## Next Dimension
security on cover-image scheme handling vs text-link allowlist

Review verdict: CONDITIONAL
