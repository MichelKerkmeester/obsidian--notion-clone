# Iteration 5: Correctness — runtime geometry

## Focus

Sheet keyboard/resize transitions and bounds resolution when surfaces are mounted in non-global documents.

## Files Reviewed

- `src/views/record-detail-panel.ts`
- `src/views/popover-position.ts`
- `src/views/mobile-bottom-sheet.ts`
- `src/views/anchor-ref.ts`
- `specs/public/005-component-surface-system/003-mobile-sheet-presentation/acceptance-criteria.md`
- `specs/public/005-component-surface-system/roadmap.md`

## Findings - New

### P0 Findings

- None.

### P1 Findings

- **F012**: The record-detail panel closes on window resize instead of satisfying the sheet's resize-preservation contract — `src/views/record-detail-panel.ts:226` — `onResize` calls `close()` whenever the body is not editing, while phase 003 AC-003 requires an open sheet to survive resize and remain repositionable at `003-mobile-sheet-presentation/acceptance-criteria.md:107`; the roadmap records this same window-resize hazard at `roadmap.md:93`.
- **F013**: Sheet placement can compute bounds from the global active document even when the panel belongs to another document — `src/views/popover-position.ts:329` — `placeSheet` calls `getVisiblePopoverBounds(null)`, whose null-container branch selects `window.activeDocument` at lines 491–493 instead of `panel.ownerDocument`. In a popped-out host, the sheet's keyboard and viewport coordinates can be clamped against the wrong document.

### P2 Findings

- **F014**: Anchor lease fallback timeout has no evidence-backed budget for asynchronous rebuilds — `src/views/anchor-ref.ts:53` — the default pending timeout is fixed at 250ms while the surrounding render path is explicitly asynchronous; a renderer that misses one refresh window can transition to `anchor-missing` and close before a delayed replacement anchor is available, and no phase evidence establishes that 250ms covers the slowest supported rebuild.

## Claim Adjudication

### Claim adjudication — F012

```json
{"findingId":"F012","claim":"An ordinary window resize closes a record-detail panel instead of preserving and repositioning it, contrary to AC-003's transition contract.","evidenceRefs":["src/views/record-detail-panel.ts:226","src/views/record-detail-panel.ts:232","src/views/record-detail-panel.ts:233","specs/public/005-component-surface-system/003-mobile-sheet-presentation/acceptance-criteria.md:107","specs/public/005-component-surface-system/roadmap.md:93"],"counterevidenceSought":"Read the complete resize handler and checked the phase acceptance row and parent risk note for an exception.","alternativeExplanation":"The close may be intentional for desktop anchored panels, but the same handler is attached after mobile-sheet setup and the acceptance row requires the sheet to survive resize.","finalSeverity":"P1","confidence":0.96,"downgradeTrigger":"Resize handling branches by presentation and preserves/repositions a sheet, with a test or measured evidence for the window-resize host shape."}
```

### Claim adjudication — F013

```json
{"findingId":"F013","claim":"placeSheet can use bounds from window.activeDocument rather than the panel's owner document.","evidenceRefs":["src/views/popover-position.ts:323","src/views/popover-position.ts:328","src/views/popover-position.ts:329","src/views/popover-position.ts:491","src/views/popover-position.ts:493"],"counterevidenceSought":"Followed the null-bounds call from placeSheet into getVisiblePopoverBounds and checked the function's document selection.","alternativeExplanation":"Most production panels may live in the global document, but the source explicitly handles popped-out windows elsewhere, so the fallback is not proven safe for every supported host.","finalSeverity":"P1","confidence":0.93,"downgradeTrigger":"placeSheet passes panel.ownerDocument-derived bounds or a cross-window test proves the global active document is always identical to the panel owner."}
```

## Traceability Checks

- `spec_code`: partial; source behavior was compared with AC-003 and the roadmap risk note.
- `checklist_evidence`: partial; no permitted browser or repository test was run, so transition behavior remains source-inferred.
- `feature_catalog_code`: not applicable to this runtime geometry pass.
- `playbook_capability`: not applicable to this runtime geometry pass.

## Integration Evidence

- The panel owns a dedicated `onResize` handler and registers it on the global window after positioning.
- `placeSheet` accepts an optional `bounds`, but its default path resolves a null-container global document.
- No target or repository file was modified.

## Edge Cases

- A keyboard event that changes only `visualViewport` may use the inset path and avoid `onResize`; that does not clear the host shape that resizes the window.
- A panel in the main window is not evidence for a popped-out document.
- The anchor timeout is a risk finding, not a claim that every refresh exceeds 250ms.

## Confirmed-Clean Surfaces

- `AnchorRef` clears its timer when a live element is resolved and when released.
- `placeToolbarPopover` passes explicit bounds through its main placement path when available.

## Ruled Out

- No claim that the mobile keyboard inset arithmetic itself is numerically wrong; the findings concern the close transition and document source.

## Next Focus

- Dimension: security, expanded angle
- Reason: inspect scrim modality, pointer hit-testing, nested surface dismissal, and whether hidden/moved nodes can retain interaction or stale ownership.

Review verdict: CONDITIONAL
