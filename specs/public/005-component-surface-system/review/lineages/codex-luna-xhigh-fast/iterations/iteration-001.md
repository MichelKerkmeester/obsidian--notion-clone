# Iteration 1: Correctness

## Focus

Correctness of the parent packet's scope map, release-state claims, and the newly landed card-field formatting phase.

## Files Reviewed

- `specs/public/005-component-surface-system/spec.md`
- `specs/public/005-component-surface-system/roadmap.md`
- `specs/public/005-component-surface-system/handover.md`
- `specs/public/005-component-surface-system/019-card-field-value-formatting/implementation-summary.md`

## Findings - New

### P0 Findings

- None.

### P1 Findings

- **F001**: The parent phase map does not cover the live child set — `specs/public/005-component-surface-system/spec.md:149` — the scope declares twenty phase folders at line 69 but explicitly omits rows 020–028, while the roadmap records those phases as existing at lines 39–45. A release review cannot derive complete phase coverage or status from the parent map.
- **F002**: Handover validation status contradicts the transition rule — `specs/public/005-component-surface-system/handover.md:52` — handover says `--strict` has zero errors and warnings, while the parent spec says every child fails `--strict` and names the missing-doc causes at lines 155–159. The two claims cannot both describe the same review state.
- **F003**: Phase 019 shipped without verification evidence — `specs/public/005-component-surface-system/019-card-field-value-formatting/implementation-summary.md:40` — the summary marks the phase In Progress and says no verification exists, and its verification section says every criterion is unmet at lines 84–88. The parent roadmap nevertheless presents the phase as shipped and unverified rather than release-blocked at its evidence boundary.

### P2 Findings

- None.

## Claim Adjudication

### Claim adjudication — F001

```json
{"findingId":"F001","claim":"The parent phase map cannot represent all live child phases, so review scope and release status are incomplete.","evidenceRefs":["specs/public/005-component-surface-system/spec.md:69","specs/public/005-component-surface-system/spec.md:149","specs/public/005-component-surface-system/roadmap.md:39"],"counterevidenceSought":"Checked the parent map and the reconciliation note for an explicit exclusion of 020-028.","alternativeExplanation":"The omitted phases could be intentionally outside the program, but the roadmap says they exist and does not mark them excluded.","finalSeverity":"P1","confidence":0.98,"downgradeTrigger":"A parent-owned scope map explicitly lists or formally excludes every live child phase with an authoritative status source."}
```

### Claim adjudication — F002

```json
{"findingId":"F002","claim":"Handover's zero-error parent validation claim is inconsistent with the parent spec's statement that every child fails strict validation.","evidenceRefs":["specs/public/005-component-surface-system/handover.md:52","specs/public/005-component-surface-system/spec.md:155","specs/public/005-component-surface-system/spec.md:159"],"counterevidenceSought":"Checked whether the handover qualified its validation claim as parent-only and whether the parent spec limited the failure statement to an earlier snapshot.","alternativeExplanation":"The handover may report a later parent-only run while the transition rule describes child validation; that still leaves the claimed release state ambiguous because the rule requires child validation.","finalSeverity":"P1","confidence":0.97,"downgradeTrigger":"A dated, scope-matched validation record shows all required child packets pass the transition gate, or the handover explicitly narrows its claim and records the child results."}
```

### Claim adjudication — F003

```json
{"findingId":"F003","claim":"Phase 019 has production code but no verification evidence, so its shipped state is not release-ready.","evidenceRefs":["specs/public/005-component-surface-system/019-card-field-value-formatting/implementation-summary.md:40","specs/public/005-component-surface-system/019-card-field-value-formatting/implementation-summary.md:84","specs/public/005-component-surface-system/019-card-field-value-formatting/implementation-summary.md:88"],"counterevidenceSought":"Checked the phase's own metadata and verification section rather than inferring from the parent roadmap.","alternativeExplanation":"The phase may be intentionally shipped-but-unverified, but the parent program says every phase criterion must pass before closure, so this remains an open gate rather than a neutral status.","finalSeverity":"P1","confidence":0.99,"downgradeTrigger":"Phase-local verification records parity checks and all required acceptance criteria as passed, with evidence tied to the shipped tree."}
```

## Traceability Checks

- `spec_code`: partial; the parent scope and phase-map contradiction is evidenced, but no repo validator was run because the lineage write-surface contract forbids `validate.sh`.
- `checklist_evidence`: partial; phase 019 explicitly reports unmet criteria, but no checklist command was run because the lineage contract forbids repository tooling.
- `feature_catalog_code`: not applicable to this document-only correctness pass.
- `playbook_capability`: not applicable to this document-only correctness pass.

## Integration Evidence

- Route proof: `mode=review`, `target_agent=deep-review`, `agent_definition_loaded=true`.
- Detached execution binding: `cli-codex model=gpt-5.6-luna`, `xhigh`, `fast`; artifact writes remain lineage-local.
- No target specification, source, test, style, harness, or Git file was modified.

## Edge Cases

- A parent-only validation result cannot satisfy a child-by-child transition rule.
- “Shipped” is not equivalent to “verified”; the phase-local document explicitly separates them.
- Missing rows are a coverage defect even when their folders exist and are documented elsewhere.

## Confirmed-Clean Surfaces

- No additional correctness defect was established in the four documents beyond the three findings above.

## Ruled Out

- No claim was made that the card formatter implementation itself produces the wrong numeric string; the defect is the absence of verification evidence.

## Next Focus

- Dimension: security
- Reason: inspect body-mounted and document-level surface ownership, dismissal listeners, focus return, and cross-window document selection for unsafe or unbounded behavior.

Review verdict: CONDITIONAL
