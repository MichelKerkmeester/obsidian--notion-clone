# Iteration 7: Traceability — evidence freshness

## Focus

Freshness of phase 000's acceptance rows and whether implemented harness changes match the criteria and checklists they are supposed to close.

## Files Reviewed

- `specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md`
- `specs/005-component-surface-system/000-surface-contract-and-truthful-harness/checklist.md`
- `specs/005-component-surface-system/000-surface-contract-and-truthful-harness/tasks.md`
- `specs/005-component-surface-system/000-surface-contract-and-truthful-harness/implementation-summary.md`
- `tools/screenshots/runtime-vars.css`
- `tools/screenshots/capture.mjs`
- `tools/screenshots/scan-pinned-values.mjs`

## Findings - New

### P0 Findings

- None.

### P1 Findings

- **F015**: Phase 000's acceptance row still reports four old pinned runtime values although the current harness file says those values were removed and replaced with a different runtime-value policy — `specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:116` — the row says four pins remain, while `tools/screenshots/runtime-vars.css:12` says five values were removed and the implementation summary records the changed scan rule at `000-surface-contract-and-truthful-harness/tasks.md:90`; closure evidence cannot tell which population is authoritative.
- **F016**: The capture-fingerprint criterion requires three harness edits to stale captures, but the current forced input set does not include two of them — `specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:128` — `CAPTURE_INPUTS` includes runtime-vars, scenarios, and capture at `tools/screenshots/capture.mjs:39`, but not `.storybook/preview.ts` or `tools/storybook/verify-placement.mjs`; the task itself records those exclusions at `000-surface-contract-and-truthful-harness/tasks.md:120`.
- **F017**: The implemented pinned-value scanner no longer enforces the acceptance criterion it is marked as closing — `specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:240` — the row requires flagging harness properties also assigned by `src/`, while the same row says the checker skips exactly that population; tasks mark T4a closed under a different rule at `000-surface-contract-and-truthful-harness/tasks.md:90` and the implementation summary presents the changed rule as complete.

### P2 Findings

- None.

## Claim Adjudication

### Claim adjudication — F015

```json
{"findingId":"F015","claim":"Phase 000's AC-005 measured-today population is stale relative to the current runtime-vars file and the task's changed rule.","evidenceRefs":["specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:116","tools/screenshots/runtime-vars.css:12","specs/005-component-surface-system/000-surface-contract-and-truthful-harness/tasks.md:90"],"counterevidenceSought":"Compared the acceptance row with the current harness comment and the task's recorded implementation change.","alternativeExplanation":"The acceptance row may intentionally preserve the pre-change baseline, but it is not labeled as historical and is still the row used to determine closure.","finalSeverity":"P1","confidence":0.97,"downgradeTrigger":"The row records a dated baseline and current result separately, naming the changed rule and the exact remaining pinned population."}
```

### Claim adjudication — F016

```json
{"findingId":"F016","claim":"The capture fingerprint implementation does not satisfy the criterion's requirement to fingerprint preview.ts and verify-placement.mjs.","evidenceRefs":["specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:128","tools/screenshots/capture.mjs:39","tools/screenshots/capture.mjs:45","specs/005-component-surface-system/000-surface-contract-and-truthful-harness/tasks.md:120"],"counterevidenceSought":"Read the forced capture input list and the task's explicit exclusion rationale.","alternativeExplanation":"The exclusions may be an intentional scope amendment because those files do not shape screenshots, but the acceptance/checklist still names all three edits and no superseding criterion is cited.","finalSeverity":"P1","confidence":0.98,"downgradeTrigger":"The criterion is amended to the actual capture dependency set with an explicit rationale, or the two excluded harness files are proven to shape and fingerprint the captures."}
```

### Claim adjudication — F017

```json
{"findingId":"F017","claim":"T4a's scanner rule and AC-016's stated rule are different, so a green scan cannot discharge AC-016 as written.","evidenceRefs":["specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md:240","specs/005-component-surface-system/000-surface-contract-and-truthful-harness/tasks.md:90","specs/005-component-surface-system/000-surface-contract-and-truthful-harness/tasks.md:98"],"counterevidenceSought":"Compared the acceptance criterion's required population with the task's changed-rule explanation.","alternativeExplanation":"The changed rule may be the correct design, but then AC-016 and its negative controls need an explicit superseding update before the task can be called closure evidence.","finalSeverity":"P1","confidence":0.99,"downgradeTrigger":"AC-016 is rewritten or superseded with the changed rule and a control proving that rule's intended failure mode."}
```

## Traceability Checks

- `spec_code`: fail for the three inspected criterion-to-implementation mismatches.
- `checklist_evidence`: fail for the unchanged A15-style “all three” fingerprint claim and the unamended scanner rule.
- `feature_catalog_code`: not applicable to this harness-evidence pass.
- `playbook_capability`: not applicable to this harness-evidence pass.

## Integration Evidence

- The implementation summary is unusually explicit about changed rules and proof pending; the acceptance/checklist artifacts did not carry the same reconciliation.
- `CAPTURE_INPUTS` is a concrete source of truth for what the screenshot pipeline fingerprints.
- No target or repository file was modified.

## Edge Cases

- A changed criterion is valid only after it records the new rule and its negative control; otherwise historical and current evidence are conflated.
- Excluding non-screenshot inputs may be correct, but the criterion must then name the actual dependency set.
- Runtime-assigned properties are distinct from properties with only stylesheet fallbacks; the scanner must not silently switch populations.

## Confirmed-Clean Surfaces

- The current screenshot pipeline does fingerprint several capture inputs beyond the scenario source list.
- The runtime-vars file documents why its removed values were not valid stand-ins.

## Ruled Out

- No claim that the current scanner cannot detect its newly defined complement; only that this differs from AC-016's stated requirement.

## Next Focus

- Dimension: correctness, expanded angle
- Reason: inspect list/board/calendar renderer construction and the production-render assertion coverage boundary for behavior that current evidence explicitly excludes.

Review verdict: CONDITIONAL
