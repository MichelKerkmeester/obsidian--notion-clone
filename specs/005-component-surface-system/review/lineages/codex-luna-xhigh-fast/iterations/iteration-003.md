# Iteration 3: Traceability

## Focus

Whether roadmap and handoff claims are traceable to phase-local closure evidence, especially for phases 001 and 009.

## Files Reviewed

- `specs/005-component-surface-system/spec.md`
- `specs/005-component-surface-system/roadmap.md`
- `specs/005-component-surface-system/001-overlay-placement-and-menu-language/spec.md`
- `specs/005-component-surface-system/001-overlay-placement-and-menu-language/checklist.md`
- `specs/005-component-surface-system/001-overlay-placement-and-menu-language/implementation-summary.md`
- `specs/005-component-surface-system/009-live-verification/spec.md`
- `specs/005-component-surface-system/009-live-verification/acceptance-criteria.md`
- `specs/005-component-surface-system/009-live-verification/implementation-summary.md`

## Findings - New

### P0 Findings

- None.

### P1 Findings

- **F006**: Phase 001's roadmap status is not supported by its phase-local closure artifacts — `specs/005-component-surface-system/roadmap.md:296` — the roadmap says 001 is shipped and verified, while the phase spec remains In Progress and the implementation summary records 0 of 67 tasks and 0 of 13 acceptance criteria met at `001-overlay-placement-and-menu-language/implementation-summary.md:52`; its checklist is still entirely unchecked at `001-overlay-placement-and-menu-language/checklist.md:62`.
- **F007**: The parent requires a live-verification gate before phase 000, but phase 009 has not produced the required evidence — `specs/005-component-surface-system/spec.md:192` — the handoff requires a known defect reproduced in the running app, while 009's acceptance criteria say only 1 of 3 transport legs has been observed at `009-live-verification/acceptance-criteria.md:93`, its mobile citation audit is still unmet at line 101, and its implementation summary remains In Progress at `009-live-verification/implementation-summary.md:47`.

### P2 Findings

- **F008**: The adversarial review carries a historical nine-child target without a current-scope qualifier — `specs/005-component-surface-system/adversarial-review.md:13` — it says the target is all nine children even though the parent now declares later generations and the roadmap records phases through 029. A reader can mistake the historical review for complete current coverage.

## Claim Adjudication

### Claim adjudication — F006

```json
{"findingId":"F006","claim":"The roadmap's shipped-and-verified status for phase 001 is not traceable to the phase-local closure artifacts.","evidenceRefs":["specs/005-component-surface-system/roadmap.md:296","specs/005-component-surface-system/001-overlay-placement-and-menu-language/spec.md:74","specs/005-component-surface-system/001-overlay-placement-and-menu-language/implementation-summary.md:52","specs/005-component-surface-system/001-overlay-placement-and-menu-language/checklist.md:62"],"counterevidenceSought":"Compared the roadmap row with the phase spec status, implementation summary task/criteria counts, and checklist rows.","alternativeExplanation":"The roadmap may summarize code shipped in a later tree, but it does not identify a phase-local evidence update that reconciles the older artifacts.","finalSeverity":"P1","confidence":0.99,"downgradeTrigger":"Phase 001's local status, checklist, implementation summary, and acceptance evidence are reconciled to the same shipped tree."}
```

### Claim adjudication — F007

```json
{"findingId":"F007","claim":"The required 009-to-000 live gate is open because 009 lacks the required completed evidence.","evidenceRefs":["specs/005-component-surface-system/spec.md:192","specs/005-component-surface-system/009-live-verification/acceptance-criteria.md:93","specs/005-component-surface-system/009-live-verification/acceptance-criteria.md:101","specs/005-component-surface-system/009-live-verification/implementation-summary.md:47"],"counterevidenceSought":"Checked both the parent handoff requirement and the phase's own transport/citation status, not only the presence of probe source files.","alternativeExplanation":"The probe may be built and can return a distinct app-not-running code, but the parent gate asks for a reproduced defect in the running app and 009 explicitly records the required legs as unobserved.","finalSeverity":"P1","confidence":0.98,"downgradeTrigger":"A dated 009 live-probe record reproduces the known defect and the remaining acceptance/citation obligations are closed or explicitly waived by the parent gate owner."}
```

## Traceability Checks

- `spec_code`: partial; parent handoff requirements were compared with child evidence, but the forbidden validation command was not run.
- `checklist_evidence`: fail for the phase-001 closure claim; the local checklist remains unchecked while the roadmap says verified.
- `feature_catalog_code`: not applicable to this phase-gate pass.
- `playbook_capability`: not applicable to this phase-gate pass.

## Integration Evidence

- The parent itself distinguishes roadmap summaries from phase-local evidence, so the conflicting records are not interchangeable.
- 009's source existence is not treated as proof that its running-app observation occurred.
- No target or repository file was modified.

## Edge Cases

- A historical review can legitimately target nine children, but it needs an as-of qualifier once the packet grows.
- “Built” and “running-app gate passed” are separate states in 009's own acceptance criteria.
- A roadmap can report a later implementation state only if its evidence pointer makes the supersession explicit.

## Confirmed-Clean Surfaces

- The parent handoff table explicitly names the 009-to-000 dependency; the issue is the open evidence, not a missing dependency declaration.

## Ruled Out

- No claim that 009's probe implementation is absent; only its required completed observation is unproven.

## Next Focus

- Dimension: maintainability
- Reason: inspect shared surface contracts, duplicated predicates, listener ownership, CSS/harness coupling, and whether source boundaries leave drift-prone seams.

Review verdict: CONDITIONAL
