# Iteration 3: D2 Security — cover scheme open

## Dimension
security

## Files Reviewed
- `src/data/cover-image.ts:65`
- `src/data/cover-image.ts:107`
- `src/data/cover-image.test.ts:128`
- `src/views/board-renderer.ts:971`
- `src/views/board-renderer.ts:1409`
- `src/data/text-link.ts:71`

## Findings by Severity

### P0, Blocker
- **F001**: Non-files cover fields open javascript and data scheme targets via window.open — `src/views/board-renderer.ts:971` — parseCoverImage treats any URI scheme as external; isCoverImageBlocked is files-only; cover click window.open(image.target). Tests expect javascript:alert(1).png to parse as external and not be blocked for text columns.

### P1, Required
None this iteration.

### P2, Suggestion
- **F010**: External window.open calls omit noopener — `src/views/board-renderer.ts:1409` — openTarget and cover window.open never pass noopener,noreferrer. Same pattern in gallery-renderer.ts:719 and list-renderer.ts:766.

## Traceability Checks
- `spec_code`: pass — Link parser rejects non-http(s) schemes; cover path does not.

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
- SL-003: unsafe_scheme / finding — javascript: covers never parse

## Verdict
Provisional iteration verdict maps from this pass only (P0→FAIL, P1→CONDITIONAL, P2-only→PASS). 

## Next Dimension
traceability on parent phase map versus child folders

Review verdict: FAIL
