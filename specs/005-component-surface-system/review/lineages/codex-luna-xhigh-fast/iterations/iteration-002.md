# Iteration 2: Security

## Focus

Cross-document event ownership and user-content boundaries for body-mounted menus, record-detail panels, and mobile-sheet detection.

## Files Reviewed

- `src/views/record-detail-panel.ts`
- `src/views/owned-menu.ts`
- `src/views/popover-position.ts`
- `src/views/inline-markdown-renderer.ts`
- `src/data/inline-markdown.ts`
- `specs/005-component-surface-system/003-mobile-sheet-presentation`

## Findings - New

### P0 Findings

- None.

### P1 Findings

- **F004**: Record-detail listeners are bound through the global active document instead of the panel's owning document — `src/views/record-detail-panel.ts:196` — cleanup and registration use `window.activeDocument` and `window` at lines 196–198 and 382–385, while the owned-menu path deliberately derives a document from the event at lines 246–250. In a popped-out or otherwise non-global host, the panel can receive dismissal events from the wrong document or leave listeners attached to the wrong window.

### P2 Findings

- **F005**: Mobile-sheet detection mixes an owner document with the global navigator — `src/views/popover-position.ts:621` — `isMobileBottomSheet(doc)` receives the panel document but reads `navigator.maxTouchPoints` from the global realm. A popped-out or test document can therefore take a different sheet branch from its own touch environment.

## Claim Adjudication

### Claim adjudication — F004

```json
{"findingId":"F004","claim":"Record-detail panel listener registration and cleanup are not scoped to the panel's owning document/window.","evidenceRefs":["src/views/record-detail-panel.ts:196","src/views/record-detail-panel.ts:382","src/views/record-detail-panel.ts:385","src/views/owned-menu.ts:246"],"counterevidenceSought":"Checked both registration and cleanup, then compared the sibling owned-menu factory's cross-window implementation.","alternativeExplanation":"Obsidian may guarantee that every host is in the global active document, but the packet and sibling implementation explicitly support popped-out documents, so that guarantee is not established here.","finalSeverity":"P1","confidence":0.91,"downgradeTrigger":"A host-scoped document/window contract or a cross-window test proves registration, cleanup, and focus all remain in the panel's owning realm."}
```

## Traceability Checks

- `spec_code`: partial; the implementation follows the body-portal concept, but the cross-window contract is not proven by a runnable check in this lineage.
- `checklist_evidence`: partial; the phase scope names anchor/lifetime behavior, but no permitted verification command was run.
- `feature_catalog_code`: not applicable to this security pass.
- `playbook_capability`: not applicable to this security pass.

## Integration Evidence

- Confirmed positive boundary: `inline-markdown-renderer.ts` and `inline-markdown.ts` document a create-element/text-content path with no `innerHTML`.
- Confirmed inconsistency: owned menus derive `event.view.document`, but record-detail panels use `window.activeDocument`.
- No target or repository file was modified.

## Edge Cases

- A second Obsidian window is the relevant boundary; same-window tests cannot establish this behavior.
- Global `navigator` can be correct in the main window while still being wrong for an owner document.
- The user-content renderer is not treated as a finding because the inspected implementation explicitly avoids the unsafe HTML path.

## Confirmed-Clean Surfaces

- No direct `innerHTML` sink was found in the inspected production user-content renderers.
- Owned-menu listener registration and cleanup are symmetric within the document returned by its factory.

## Ruled Out

- No XSS finding was raised from the inspected inline markdown paths.

## Next Focus

- Dimension: traceability
- Reason: audit parent-to-child acceptance criteria, evidence tuples, stale line references, and whether handoff gates name the criteria their consumers actually require.

Review verdict: CONDITIONAL
