# Verification: Derived Inverse (Safe Two-Way) Relations
> Read-only plan verdict by GPT-5.6 Luna against research/synthesis.md + final-plan.md.

## Coverage
- No ranked recommendation has no home.
- Ranked items 1 and 8 are covered by `001-relation-inverse-module`.
- Ranked items 2 and 4 are covered by `002-rollup-inverse-resolution`.
- Ranked item 7 is covered by `003-inverse-refresh-membership`.
- Ranked items 3, 5, 6, 9, and 10 are explicitly deferred in the parent Phase Documentation Map; item 6 requires a budget waiver and item 10 is blocked.

## Couplings
- The module, self-relation behavior, and unit fixtures are kept together in `001-relation-inverse-module`; T003–T005 are explicitly one atomic diff.
- Rollup inverse resolution and `sourcePaths` → `targetPaths` propagation are kept together in `002-rollup-inverse-resolution`; T003–T004 are explicitly one `RelationRollup.ts` diff.
- Both view membership copies are kept together in `003-inverse-refresh-membership`; T003–T004 are explicitly one atomic seam.
- **Concern:** `final-plan.md` requires Hunk 1 to return `sourceDatabaseIds` (or an equivalent handoff) alongside inverse paths so Hunk 2 can register both Expense paths and the Expenses database. `002-rollup-inverse-resolution/tasks.md` specifies the `sourcePaths` union but does not explicitly require propagating `sourceDatabaseIds` through `RelationRollupResult` or another equivalent result. `003-inverse-refresh-membership` assumes that input in T003–T004, leaving an incomplete cross-sub-phase handoff.

## Grounding
- Checked the fork citations in the child tasks. The cited ranges in `RelationRollup.ts`, `RelationLinks.ts`, `DataSource.ts`, `EuroFormat.ts`, `DatabaseView.ts`, `EmbeddedDatabaseRenderer.ts`, and `RelationTargetChange.ts` all exist at the referenced lines and contain the cited scan, resolver, refresh, or write-path code.
- No bogus fork file:line citation found.

## Verdict
CONCERNS — coverage, grounding, and scope are sound, and the principal atomic diff couplings are grouped correctly. However, the `sourceDatabaseIds` handoff required by the final refresh design is not explicitly owned by the Hunk 1 sub-phase, so the decomposition is not yet complete enough for PASS.
