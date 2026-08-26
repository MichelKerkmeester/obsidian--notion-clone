# Verification: Reports Remaining/Saved Computed Fields
> Read-only plan verdict by GPT-5.6 Luna against research/synthesis.md + final-plan.md.

## Coverage
- Ranked backlog items 1–6 have homes:
  - Remaining formula: `001-live-reports-inspect` T003–T004 and `002-remaining-saved-config` T002–T003.
  - Saved formula: `001-live-reports-inspect` T004 and `002-remaining-saved-config` T002/T004.
  - Display-only sync: `002-remaining-saved-config` T005 and `003-reports-display-proof` T005.
  - SUM-only/no MAX gate: `001-live-reports-inspect` T002.
  - Column order and human labels: `002-remaining-saved-config` T005.
  - Empty-month blank/zero behavior: `001-live-reports-inspect` T004, `002-remaining-saved-config` T003, and `003-reports-display-proof` T003.
- Ranked backlog items 7, 9, and 10 are explicitly deferred in the parent Phase Documentation Map (`spec.md:253`).
- **NO HOME:** synthesis ranked backlog item 8 includes `percent-empty` (`research/synthesis.md:22`), but the parent Phase Documentation Map only names rollup MAX/Median/Range as deferred (`spec.md:253`). No child covers `percent-empty`, and it is not explicitly recorded in that map.

## Couplings
- PASS. Inspecting live Reports and locking expressions remain together in `001-live-reports-inspect`, covering final-plan steps 1–2.
- PASS. Adding Remaining/Saved, deciding whether Saved ships, setting view order/labels, and pinning `display-only` remain together in `002-remaining-saved-config` T002–T005 as one config transaction.
- PASS. Final-plan proof steps 6–11 remain together in `003-reports-display-proof`; deferred work is not split into implementation children.

## Grounding
- PASS. The cited task references resolve to real source files and line ranges. Spot-checked:
  - `src/data/types.ts:44,102-109`
  - `src/data/RelationRollup.ts:92-129`
  - `src/data/DataSource.ts:627-637,787,1041-1062`
  - `src/data/ComputedField.ts:294-304,511-546,563-564`
  - `src/data/SafeEval.ts:962-1108`
  - `src/data/ColumnConfig.ts:64-74,100-101`
  - `src/data/ComputedSync.ts:42-45`
  - `src/views/DatabaseView.ts:4648,5678-5705,6848,10244`
  - `src/views/CellRenderer.ts:255-257,2575-2577`
  - `src/data/EuroFormat.ts:30-31`
  - `src/data/ComputedEvaluator.ts:68-72`
- No bogus file:line citation found.

## Verdict
**CONCERNS** — The decomposition otherwise covers the build recommendations, preserves the required same-sub-phase couplings, and uses real citations. The specific gap is synthesis ranked backlog item 8: `percent-empty` has no child home and is not explicitly listed in the parent Phase Documentation Map's deferred items.
