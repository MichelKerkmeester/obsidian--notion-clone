# Iteration 9: D2 Security — adversarial replay of F001

## Dimension
security

## Files Reviewed
- `src/data/cover-image.ts:47`
- `src/data/cover-image.ts:69`
- `src/data/cover-image.test.ts:128`
- `src/data/cover-image.test.ts:153`
- `src/views/board-renderer.ts:971`
- `src/views/gallery-renderer.ts:615`
- `src/views/gallery-renderer.ts:719`

## Findings by Severity

### P0, Blocker
- **F001**: Non-files cover fields open javascript and data scheme targets via window.open — `src/views/board-renderer.ts:971` — parseCoverImage treats any URI scheme as external; isCoverImageBlocked is files-only; cover click window.open(image.target). Tests expect javascript:alert(1).png to parse as external and not be blocked for text columns.

### P1, Required
None this iteration.

### P2, Suggestion
None this iteration.

## Traceability Checks
- `spec_code`: pass — Gallery shares the hole; no new P0 class.

## Claim Adjudication
{
  "findingId": "F001",
  "claim": "A javascript: cover value that ends with an image extension is parsed as an external image and opened with window.open on board and gallery cover click when the cover column is not type files.",
  "evidenceRefs": [
    "src/views/board-renderer.ts:971"
  ],
  "counterevidenceSought": "Looked for a later guard, allowlist, or shipped replacement before recording.",
  "alternativeExplanation": "Stale documentation only, or a test that no longer matches production.",
  "finalSeverity": "P0",
  "confidence": 0.92,
  "downgradeTrigger": "http(s) allowlist on parseCoverImage and cover click"
}

## Search Ledger
- SL-009: unsafe_scheme / ruled_out — Only board is affected

## Verdict
Provisional iteration verdict maps from this pass only (P0→FAIL, P1→CONDITIONAL, P2-only→PASS). F001 reaffirmed after adversarial re-read of cited lines plus gallery-renderer.ts:615-719.

## Next Dimension
maintainability broaden: 004 contested status, 027 remainder, leftover openSurface comment

Review verdict: FAIL
