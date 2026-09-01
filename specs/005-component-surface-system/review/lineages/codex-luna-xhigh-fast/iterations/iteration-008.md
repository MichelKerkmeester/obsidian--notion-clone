# Iteration 8: Correctness — production-render coverage

## Focus

The boundary between renderer-level headless scenarios and actual DatabaseView/embed host behavior.

## Files Reviewed

- `tools/live/render-assertions.mjs`
- `tools/live/render-assertion-harness.ts`
- `tools/live/renderer-coverage.json`
- `specs/005-component-surface-system/026-production-render-assertions/acceptance-criteria.md`
- `specs/005-component-surface-system/026-production-render-assertions/implementation-summary.md`
- `specs/005-component-surface-system/handover.md`
- `specs/005-component-surface-system/roadmap.md`

## Findings - New

### P0 Findings

- None.

### P1 Findings

- **F018**: Phase 026's coverage evidence is stale and internally contradictory — `tools/live/renderer-coverage.json:21` — the stamped artifact says 6 renderers are constructed, while the phase acceptance and implementation summary still say 2 of 22 at `026-production-render-assertions/acceptance-criteria.md:91` and `026-production-render-assertions/implementation-summary.md:60`; the current scenario list names six renderer families at `tools/live/render-assertions.mjs:58`.
- **F019**: The handover generalizes renderer-level coverage into host-level coverage that the assertion explicitly excludes — `specs/005-component-surface-system/handover.md:53` — handover says every reported view is now asserted, while phase 026 says DatabaseView and EmbeddedDatabaseRenderer are not constructed and no device is involved at `026-production-render-assertions/implementation-summary.md:121`; the harness creates a synthetic container and casts an undefined App at `tools/live/render-assertion-harness.ts:887`.

### P2 Findings

- None.

## Claim Adjudication

### Claim adjudication — F018

```json
{"findingId":"F018","claim":"The phase 026 coverage artifact and its acceptance/summary documents describe different constructed-renderer counts.","evidenceRefs":["tools/live/renderer-coverage.json:21","specs/005-component-surface-system/026-production-render-assertions/acceptance-criteria.md:91","specs/005-component-surface-system/026-production-render-assertions/implementation-summary.md:60","tools/live/render-assertions.mjs:58"],"counterevidenceSought":"Compared the stamped JSON, phase acceptance, implementation summary, and current scenario declarations.","alternativeExplanation":"The JSON may be a newer stamp and the prose may be historical, but neither document labels itself historical or points to the newer artifact, so current coverage is ambiguous.","finalSeverity":"P1","confidence":0.99,"downgradeTrigger":"Regenerate or reconcile the coverage stamp and phase prose so one dated count and scenario set is authoritative."}
```

### Claim adjudication — F019

```json
{"findingId":"F019","claim":"A green phase 026 renderer-level run does not establish that DatabaseView and EmbeddedDatabaseRenderer host integrations work, despite the handover's broad coverage claim.","evidenceRefs":["specs/005-component-surface-system/handover.md:53","specs/005-component-surface-system/026-production-render-assertions/implementation-summary.md:121","tools/live/render-assertion-harness.ts:887"],"counterevidenceSought":"Read the phase's explicit limitations and the harness construction path rather than relying on renderer names alone.","alternativeExplanation":"Renderer-level coverage may be the intended proxy, but the handover must say proxy/renderer coverage rather than every reported view if host integration is excluded.","finalSeverity":"P1","confidence":0.96,"downgradeTrigger":"Add host-level scenarios or narrow the handover claim and link the excluded host verification status."}
```

## Traceability Checks

- `spec_code`: fail for the stale coverage count and overbroad handover claim.
- `checklist_evidence`: partial; the phase summary does document its exclusions, but the parent handover does not preserve that boundary.
- `feature_catalog_code`: not applicable to the production-render coverage pass.
- `playbook_capability`: not applicable to the production-render coverage pass.

## Integration Evidence

- The scenario list currently names list, table, board, gallery, calendar, and timeline.
- The harness uses renderer classes directly with synthetic host containers; it does not construct the two app host integrations it lists as limitations.
- The coverage stamp is 6 while phase prose still says 2.
- No target or repository file was modified.

## Edge Cases

- A six-renderer count can be legitimate after later implementation work; it still requires the acceptance and summary records to be refreshed.
- Renderer-level structural coverage is valuable but does not cover live App/workspace/metadata wiring.
- “Every reported view” may mean renderer family rather than host integration; the current handover does not define the term.

## Confirmed-Clean Surfaces

- The check bundles shipped renderer sources rather than copying their implementation, as documented in the summary.
- The current scenario list visibly includes six renderer families.

## Ruled Out

- No claim that the renderer assertions are useless; only that their stated boundary is narrower than the handover claim.

## Next Focus

- Dimension: maintainability, expanded angle
- Reason: inspect CSS/harness lane ownership, source lists, generated evidence, and concurrent-session provenance for reproducibility hazards.

Review verdict: CONDITIONAL
