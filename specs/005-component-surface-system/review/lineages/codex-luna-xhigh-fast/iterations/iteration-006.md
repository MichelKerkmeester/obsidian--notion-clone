# Iteration 6: Security — modality and dismissal

## Focus

Scrim modality, nested dismissal, focus restoration, and per-document overlay ownership.

## Files Reviewed

- `src/views/mobile-bottom-sheet.ts`
- `src/views/owned-menu.ts`
- `src/views/overlay-stack.ts`
- `src/views/interaction-scope.ts`
- `src/views/record-detail-panel.ts`
- `specs/public/005-component-surface-system/003-mobile-sheet-presentation/acceptance-criteria.md`

## Findings - New

### P0 Findings

- None.

### P1 Findings

- None newly confirmed. Existing F004 and F005 remain active from the prior cross-window pass.

### P2 Findings

- None.

## Traceability Checks

- `spec_code`: pass for the inspected modality paths; the scrim is created with `aria-hidden`, defaults to CSS pointer interception, and is removed only after no body sheet remains.
- `checklist_evidence`: partial; source symmetry was inspected, but repository validators and browser checks are outside this lineage's permitted commands.
- `feature_catalog_code`: not applicable to this security pass.
- `playbook_capability`: not applicable to this security pass.

## Integration Evidence

- `setScrim` centralizes creation and removal and supports an explicit pointer-permeable opt-out.
- Owned-menu close removes its document listeners, drag disposer, sheet chrome, node, and returns focus.
- `OverlayStack` keys listener ownership and top-surface lookup by `panel.ownerDocument`.
- No new security defect was established in this pass; F004/F005 remain unresolved.

## Edge Cases

- Nested surfaces are intentionally handled by the topmost registered surface; child editor selectors are separately allowlisted in the record panel.
- A scrim's `aria-hidden` state does not itself prove full accessibility isolation, but no new security claim is made from that observation.
- Cross-window behavior remains excluded from the clean conclusion because the record-panel path is still global-realm bound.

## Confirmed-Clean Surfaces

- No unsafe HTML sink was introduced in the inspected paths.
- Pointer interception and close cleanup are symmetric for the owned menu's sheet branch.
- Overlay-stack listeners are removed when a document has no remaining surfaces.

## Ruled Out

- No new pointer-through-scrim defect was confirmed in the source path inspected.
- No stale listener defect was confirmed for `OverlayStack` itself.

## Next Focus

- Dimension: traceability, expanded angle
- Reason: inspect acceptance criteria and checklists for blank failing numbers, mechanism-only closure, stale citations, and evidence freshness.

Review verdict: CONDITIONAL
