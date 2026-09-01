# Iteration 7: D4 Maintainability — stale numbers and scaffold claims

## Dimension
maintainability

## Files Reviewed
- `specs/public/005-component-surface-system/spec.md:259`
- `specs/public/005-component-surface-system/028-remaining-freezes/spec.md:53`
- `specs/public/005-component-surface-system/spec.md:157`
- `styles.css:1`

## Findings by Severity

### P0, Blocker
None this iteration.

### P1, Required
None this iteration.

### P2, Suggestion
- **F008**: Parent styles.css length is stale — `specs/public/005-component-surface-system/spec.md:259` — Spec says 19261 lines; styles.css is 20124 lines.
- **F009**: 028 cites refresh at line 11421 — `specs/public/005-component-surface-system/028-remaining-freezes/spec.md:53` — Current refresh() is at database-view.ts:11484; 11421 is not that function.
- **F012**: Parent says 010-017 lack plan.md — `specs/public/005-component-surface-system/spec.md:157` — 010-sheet-reading-and-keyboard/plan.md exists; 29 child plan.md files are present including 010-017.

## Traceability Checks
- `spec_code`: partial — Scaffold and constant claims outdated.

## Claim Adjudication
No new P0/P1 this iteration.

## Search Ledger
- SL-007: stale_constant / finding — styles.css was split so the 19261 figure is obsolete because the file is gone

## Verdict
Provisional iteration verdict maps from this pass only (P0→FAIL, P1→CONDITIONAL, P2-only→PASS). 

## Next Dimension
overlay playbook_capability on 009 live probe

Review verdict: PASS
