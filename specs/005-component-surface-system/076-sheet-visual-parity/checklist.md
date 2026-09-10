---
title: "Checklist: Sheet Visual Parity"
description: "The per-sheet close-out checklist. One block per child, each block identical, each ending in an operator row no agent ticks."
trigger_phrases:
  - "076 checklist"
  - "sheet parity checklist"
  - "sheet close out checklist"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->
# Checklist: Sheet Visual Parity

Every child closes against the same eight rows. A row is ticked only when its evidence exists and
has been read — a command's exit status is not evidence for a claim the command never tested.

---

<!-- ANCHOR:per-child -->
## The eight rows, per child

| # | Row | Evidence that ticks it |
|---|-----|------------------------|
| 1 | DEFINE complete | `spec.md` §13 has a target row for every row of the sheet; every reference path resolves; every number is ours or `TBD` |
| 2 | Every surface enumerated | The child's `plan.md` names every production producer painting this grammar (D2a) |
| 3 | RED recorded | Each lane clause's failing number is written down before the producer moved |
| 4 | GREEN recorded | Each lane clause's passing number, from the same lane, same run |
| 5 | Captures current | `npm run screenshots` exit 0, `npm run screenshots:verify` 0 stale, phone light **and** dark opened and looked at |
| 6 | Judge pass #1 | `verification.md` carries a score table ≥ 14/16 with no row at 0, one justification line per row |
| 7 | Judge pass #2 | A second score table, same thresholds, **on an unchanged tree** |
| 8 | **Operator read** | The operator's own iPhone. **No agent ticks this row.** |

Plus the shared battery, read rather than assumed: `npx tsc --noEmit`, `npm run build`,
`npx vitest run`, `npm run gate`, and the `071` regression clauses unchanged and green.

---

## 001-settings-sheet-visual-parity
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator

## 002-properties-sheet-visual-parity
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator

## 003-filter-sheet-visual-parity
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator

## 004-sort-sheet-visual-parity
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator

## 005-group-sheet-visual-parity
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator

## 006-add-view-sheet-visual-parity
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator

## 007-property-editor-sheet-visual-parity
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator

## 008-record-sheet-visual-parity
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator

## 009-menu-and-confirm-visual-parity
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator

## 010-picker-sheets-visual-parity
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator

## 011-toolbar-overflow-and-column-width
- [ ] 1 DEFINE  - [ ] 2 Surfaces  - [ ] 3 RED  - [ ] 4 GREEN  - [ ] 5 Captures  - [ ] 6 Judge #1  - [ ] 7 Judge #2  - [ ] 8 Operator
<!-- /ANCHOR:per-child -->
