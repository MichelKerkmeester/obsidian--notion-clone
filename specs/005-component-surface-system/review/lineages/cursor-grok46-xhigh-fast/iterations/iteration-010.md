# Iteration 10: D4 Maintainability — 004 status, 027 remainder, leftover factory comment

## Dimension
maintainability

## Files Reviewed
- `specs/005-component-surface-system/027-sheet-menu-grammar-and-motion/spec.md:18`
- `specs/005-component-surface-system/spec.md:132`
- `specs/005-component-surface-system/roadmap.md:368`
- `specs/005-component-surface-system/004-checkbox-ownership/spec.md:61`
- `src/views/popover-position.ts:177`

## Findings by Severity

### P0, Blocker
None this iteration.

### P1, Required
None this iteration.

### P2, Suggestion
- **F014**: Parent still labels 004 Contested after roadmap 7.1 resolved it — `specs/005-component-surface-system/spec.md:132` — Roadmap 7.1 settled the three-source fight; 004 spec status is In progress. Parent map row still says Contested.
- **F015**: popover-position still documents openSurface.place() after the factory was deleted — `src/views/popover-position.ts:177` — Comment says hiding is the same answer openSurface's own place() already gives. openSurface does not exist in src/.

## Traceability Checks
- `spec_code`: partial — 004 status row stale versus resolved roadmap 7.1.
- `playbook_capability`: partial — 027: 13 of 14 criteria met; operator row open by design.

## Claim Adjudication
No new P0/P1 this iteration.

## Search Ledger
- SL-010: stale_status / deferred — 027 operator row is a new P1

## Verdict
Provisional iteration verdict maps from this pass only (P0→FAIL, P1→CONDITIONAL, P2-only→PASS). 

## Next Dimension
none — max iterations reached

Review verdict: PASS
