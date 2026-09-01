# Iteration 9: Maintainability — CSS lane provenance

## Focus

Whether stylesheet ownership and capture evidence can be reconstructed reliably from the lane record after multiple phases and edits.

## Files Reviewed

- `tools/lane/css-lane.json`
- `tools/lane/README.md`
- `specs/public/005-component-surface-system/roadmap.md`
- `specs/public/005-component-surface-system/handover.md`

## Findings - New

### P0 Findings

- None.

### P1 Findings

- **F020**: The CSS lane history contains a stylesheet acquisition for phase 001 with no matching release — `tools/lane/css-lane.json:638` — the outstanding entry says the acquisition has no release, while the live record has `holder: null` at `tools/lane/css-lane.json:2` and later phase handoffs. The lane README defines the history as the record that must make who last touched the file and against what answerable at `tools/lane/README.md:30`; an unreleased acquisition leaves the phase boundary and baseline provenance ambiguous even though the lane is now shown as free.

### P2 Findings

- **F021**: Capture churn and sign-off remain only partially attributable — `tools/lane/css-lane.json:637` — the outstanding record says five of nineteen changed images have individual verdicts, fourteen are covered by one bulk expected-change line, and all verdicts are assistant readings of regenerated PNGs while device confirmation remains outstanding. This preserves a debt note but does not provide reproducible per-image or device-backed evidence for the moved captures.

## Claim Adjudication

### Claim adjudication — F020

```json
{"findingId":"F020","claim":"The CSS lane cannot fully reconstruct the phase-001 stylesheet handoff because its second acquisition has no release event.","evidenceRefs":["tools/lane/css-lane.json:2","tools/lane/css-lane.json:638","tools/lane/README.md:30"],"counterevidenceSought":"Compared the live holder, the explicit outstanding entry, and the lane contract describing acquire/release history.","alternativeExplanation":"The later phase history may have implicitly superseded the old hold, but no release event or explicit supersession marker closes it, so the record remains ambiguous.","finalSeverity":"P1","confidence":0.98,"downgradeTrigger":"Add a matching release or explicit supersession event with the phase baseline and current stylesheet hash, then reconcile the holder history."}
```

## Traceability Checks

- `spec_code`: fail for the unclosed acquisition; the lane contract requires acquire/release history to answer ownership after the fact.
- `checklist_evidence`: partial for capture sign-off; the outstanding entry records missing per-image and device evidence but does not close it.
- `feature_catalog_code`: not applicable to lane provenance.
- `playbook_capability`: not applicable to lane provenance.

## Integration Evidence

- The live lane is free, but the outstanding ledger still says phase 001 has no release.
- The lane contract explicitly treats history as the ownership and baseline record.
- Screenshot evidence is not uniformly individual or device-confirmed.
- No target or repository file was modified.

## Edge Cases

- A later release can make the stylesheet safe to edit, but it does not retroactively establish which baseline phase 001 released without a recorded event.
- Bulk expected-change review may be acceptable for known visual churn, but the record must identify the images and reviewer basis if it is to be replayable.

## Confirmed-Clean Surfaces

- The current `holder` is null, so no active lane lock was left by this review.
- The lane README documents the intended handoff contract and makes the missing release detectable.

## Ruled Out

- No claim that the current stylesheet has an unowned active editor; the finding concerns historical provenance.
- No claim that all capture changes are incorrect; the issue is evidence completeness and reconstruction.

## Next Focus

- Dimension: traceability, final adversarial angle
- Reason: reconcile remaining requirement-count and phase-status contradictions before synthesis.

Review verdict: CONDITIONAL
