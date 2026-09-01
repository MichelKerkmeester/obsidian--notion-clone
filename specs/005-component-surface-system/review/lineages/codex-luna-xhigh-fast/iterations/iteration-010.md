# Iteration 10: Traceability — final requirement-count reconciliation

## Focus

Whether REQ-007's acceptance wording and the evidence run that was used to close it describe the same control and result.

## Files Reviewed

- `specs/005-component-surface-system/verification-audit.md`
- `specs/005-component-surface-system/000-surface-contract-and-truthful-harness/acceptance-criteria.md`
- `specs/005-component-surface-system/000-surface-contract-and-truthful-harness/tasks.md`
- `specs/005-component-surface-system/000-surface-contract-and-truthful-harness/implementation-summary.md`

## Findings - New

### P0 Findings

- None.

### P1 Findings

- **F022**: REQ-007 names thirteen blind modules but its literal widened-matcher run reports fourteen missing modules — `specs/005-component-surface-system/verification-audit.md:376` — the audit distinguishes the 13 newly revealed modules from the 14 modules reported missing on the tree as received at lines 410–418, and says the phase discharged the un-skippable control with a substitute run at lines 417–424. The release evidence therefore cannot claim the exact acceptance experiment passed until the criterion is rewritten to ask for the intended set or the fourteen-result run is recorded as the required control.

### P2 Findings

- None.

## Claim Adjudication

### Claim adjudication — F022

```json
{"findingId":"F022","claim":"REQ-007's acceptance number and its literal control run disagree by one module, and the phase closure uses a substitute experiment without labeling that as the criterion's exact run.","evidenceRefs":["specs/005-component-surface-system/verification-audit.md:376","specs/005-component-surface-system/verification-audit.md:392","specs/005-component-surface-system/verification-audit.md:417","specs/005-component-surface-system/verification-audit.md:423"],"counterevidenceSought":"Compared the quoted requirement, the literal tree-as-received output, the set distinction, and the audit's stated remediation options.","alternativeExplanation":"The thirteen newly revealed modules may be the intended semantic result, while fourteen is the complete missing set; that makes the wording ambiguous but does not make the exact acceptance control unambiguous.","finalSeverity":"P1","confidence":0.99,"downgradeTrigger":"Change REQ-007 to require the 14-module literal result or explicitly require the 13-module set-difference run, then link the resulting control to phase closure."}
```

## Traceability Checks

- `spec_code`: fail for the requirement/control count mismatch; the audit itself says the control was discharged by a substitute run.
- `checklist_evidence`: partial; the discrepancy and remediation are documented, but no single corrected criterion is authoritative.
- `feature_catalog_code`: not applicable to requirement-count reconciliation.
- `playbook_capability`: not applicable to requirement-count reconciliation.

## Integration Evidence

- The literal widened matcher reports 14 missing modules on the tree as received.
- The 13-module result is the narrowed-versus-widened set difference and is a different set.
- The audit says either changing the number to 14 or changing the requirement to ask for the set difference would fix the wording.
- No target or repository file was modified.

## Edge Cases

- Both 13 and 14 can be correct for their respective definitions; the issue is that the requirement names one while the exact run produces the other.
- This is a traceability/release-evidence defect, not evidence that the matcher itself is falsely green.

## Confirmed-Clean Surfaces

- The audit records the extra module (`checkbox.ts`) and explains why it belongs to the pre-existing red owned by REQ-004.
- The audit provides a concrete, bounded correction to the wording.

## Ruled Out

- No claim that the 13 newly revealed modules are incorrect.
- No claim that the matcher control cannot be made satisfiable; the audit states it is satisfiable after aligning the wording.

## Next Focus

- Dimension: synthesis
- Reason: maxIterations reached; consolidate the 10-pass evidence, active findings, limitations, and conditional release verdict.

Review verdict: CONDITIONAL
