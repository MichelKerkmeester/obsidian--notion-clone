# Iteration 4: Maintainability

## Focus

Drift-prone seams between the shared surface contract, touch predicates, and provenance claims for the production-render assertion phase.

## Files Reviewed

- `specs/public/005-component-surface-system/003-mobile-sheet-presentation/plan.md`
- `specs/public/005-component-surface-system/003-mobile-sheet-presentation/implementation-summary.md`
- `specs/public/005-component-surface-system/spec.md`
- `src/data/touch-environment.ts`
- `src/views/popover-position.ts`
- `src/views/surface-contract.ts`
- `specs/public/005-component-surface-system/026-production-render-assertions/implementation-summary.md`
- `specs/public/005-component-surface-system/roadmap.md`

## Findings - New

### P0 Findings

- None.

### P1 Findings

- **F009**: Phase 003's single-predicate contract remains explicitly unimplemented — `specs/public/005-component-surface-system/003-mobile-sheet-presentation/plan.md:87` — the plan requires `isTouchDevice()` and `isMobileBottomSheet()` to collapse into one exported predicate, but its implementation summary says both symbols remain live and disagree in the 601–760px band at `003-mobile-sheet-presentation/implementation-summary.md:195`; the parent still describes phase 003 as shipped at `specs/public/005-component-surface-system/spec.md:130`. Two independently evolving decisions remain on the surface boundary.
- **F010**: Phase 026's commit/provenance state is contradictory across its own summary and the roadmap — `specs/public/005-component-surface-system/026-production-render-assertions/implementation-summary.md:46` — the phase says it is committed at `1bac3c2` while the parent roadmap says no commit exists and the working tree holds the check at `roadmap.md:312`; the summary also retains a pending clean N5 gate at lines 13–16 and 45. This prevents a maintainer from identifying one authoritative reproducible input state.

### P2 Findings

- **F011**: The shared surface registry has an unproven equality boundary — `src/views/surface-contract.ts:224` — the contract is type-closed, but no source-level enforcement shown in the inspected files proves every remaining producer is registered. The partial registry is a drift seam until the census/registry equality criterion is closed.

## Claim Adjudication

### Claim adjudication — F009

```json
{"findingId":"F009","claim":"The one-phone-predicate maintainability contract is not implemented; two predicates remain with different thresholds and callers.","evidenceRefs":["specs/public/005-component-surface-system/003-mobile-sheet-presentation/plan.md:87","specs/public/005-component-surface-system/003-mobile-sheet-presentation/implementation-summary.md:195","src/data/touch-environment.ts:46","src/views/popover-position.ts:618","specs/public/005-component-surface-system/spec.md:130"],"counterevidenceSought":"Compared the explicit plan, implementation summary, current definitions, and parent phase status.","alternativeExplanation":"The two predicates could be intentionally distinct for interaction mode versus sheet presentation, but the phase contract explicitly requires one predicate and the implementation summary calls the remaining disagreement unfinished.","finalSeverity":"P1","confidence":0.99,"downgradeTrigger":"One exported predicate owns both decisions, or the phase contract is formally amended to define and test two separate policies."}
```

### Claim adjudication — F010

```json
{"findingId":"F010","claim":"Phase 026 does not identify one authoritative commit and clean verification state.","evidenceRefs":["specs/public/005-component-surface-system/026-production-render-assertions/implementation-summary.md:13","specs/public/005-component-surface-system/026-production-render-assertions/implementation-summary.md:16","specs/public/005-component-surface-system/026-production-render-assertions/implementation-summary.md:45","specs/public/005-component-surface-system/026-production-render-assertions/implementation-summary.md:46","specs/public/005-component-surface-system/roadmap.md:312"],"counterevidenceSought":"Compared the phase's metadata, blockers, pending N5 note, and the parent status table.","alternativeExplanation":"The roadmap may be stale and the phase summary may be current, but the packet has not reconciled the difference, so a fresh reviewer cannot know which state to reproduce.","finalSeverity":"P1","confidence":0.98,"downgradeTrigger":"Both parent and phase-local provenance point to the same commit/tree and the N5 clean control is either recorded or explicitly left open in both."}
```

## Traceability Checks

- `spec_code`: partial; implementation and plan contracts were compared directly.
- `checklist_evidence`: partial; the inspected phase summaries expose unfinished obligations, but repository validators were not run under the write-surface constraint.
- `feature_catalog_code`: not applicable to this implementation-seam pass.
- `playbook_capability`: not applicable to this implementation-seam pass.

## Integration Evidence

- The current source does define both predicates and retains many `isTouchDevice` callers, consistent with the phase summary's open state.
- Phase 026's summary and roadmap use different provenance claims for the same check.
- No target or repository file was modified.

## Edge Cases

- A five-entry registry may be a deliberate partial migration; the finding is the unproven equality boundary, not the existence of a typed registry.
- A stale roadmap row is still a maintainability defect when handoff decisions depend on it.
- The distinction between touch interaction mode and phone sheet presentation is valid only if the contract says so and tests both policies.

## Confirmed-Clean Surfaces

- `surface-contract.ts` uses a closed union and `satisfies Record<...>`, so missing keys in that declared registry fail type checking.
- The inspected predicate functions have named thresholds and comments explaining their current semantics.

## Ruled Out

- No claim that the current code cannot compile; the issue is contract drift and provenance ambiguity.

## Next Focus

- Dimension: correctness, expanded angle
- Reason: inspect runtime placement, sheet geometry, anchor refresh, and renderer behavior against the known acceptance baselines and current source paths.

Review verdict: CONDITIONAL
