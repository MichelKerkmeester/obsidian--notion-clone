---
title: "Tasks: Phase 4: view-config-sheet"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 4: view-config-sheet

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Reference reading and measurement

- [x] T001 Read 001's reference mapping for this sheet family before any redesign work starts (`specs/005-component-surface-system/071-sheet-notion-anytype-alignment/001-sheet-story-coverage-audit/inventory.md` row 42: producer `src/views/database-view.ts:5299`; references notion/ios/settings 24 + notion/web/settings 51 against anytype/mobile/sheets 4 + anytype/desktop/app 3, flagged "filename read only")
- [x] T002 Record the current-vs-reference gap table with what is actually measurable (`spec.md` §4, `reference-gap`): the harvest manifests carry ids only, so the reference-side numbers are 002's adopted inset-list grammar plus the Anytype 402pt-logical geometry, and the current side is measured from the shipped stylesheet and lane
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T003 RED — reference row grammar in `tools/live/sheet-grammar.mjs`: plain rows label-left/control-right, 44–52px pitch between adjacent plain rows, 1px hairline inset 16px left / 0px right on row-after-row and on following section headings, 16px edge insets, zero native `<select>`, ≥90%-width stacked editors, no horizontal overflow; plus the negative control that reverts the grammar by override and expects the numbers to go wrong
- [x] T004 Implement the geometry in `styles.css`: one-line rows (flex-basis-zero field, right-grounded), 44px row floor, no inter-row cushion, the `:has` stacked exceptions (field-stack, textarea, read-only multiline, range, placement group), the shared `::before` hairline with token-plus-literal colour, 16px section-heading inset, the preset picker sharing its line with its Manage button, the read-only note on the sheet inset
- [x] T005 Unit regression suite `src/views/view-config-sheet-row-grammar.test.ts`, proven to fail against a reverted line (1 failed / 5 passed with `flex: 1 1 0` → `1 1 auto`, 6/6 restored)
- [x] T006 GREEN — lane 13/13 direction, 6/6 pitch 48.0px, 18/18 hairlines, 16px insets, 1/1 heading, 0 native selects, 7/7 stacks, no overflow, negative control red
- [x] T007 Error handling/a11y carried, not regressed: focus trap, roles and the 44px touch floors untouched; the 058 title-field/format and 045 column-visibility controls keep their producer markup and their tests
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T008 Gates: `npx tsc --noEmit` 0, `npm run build` 0, `npx vitest run` 1729/1729 (`tools/gate.mjs` health)
- [x] T009 Live lanes: `sheet-grammar` 0, `render-assertions` 0, `touch-targets` 0, `verify-placement` 0
- [x] T010 Screenshots twice from a clean index (616, exit 0 both) + pixel-delta read: 6 content moves all on the redesigned surface, 2 byte movers, no one-run phantom; css-lane acquire/edit/release with the 6 named, `check-lane` 0
- [x] T011 Evidence: the 11 artefacts that went stale against the edited stylesheet re-derived by their own producing tools, then `evidence --check-all` 15/15 fresh; `engine-parity` 82 fixtures / 43 differences, none in this family (pre-existing condition, recorded)
- [x] T012 `npm run gate` — 27 green, 0 red for a declared reason; `scan-comments` / `scan-failing-values` 0
- [x] T013 Docs: this file, `acceptance-criteria.md`, `implementation-summary.md`, `decision-record.md` (created), `goal.md` criteria; packet validated strict (RESULT: PASSED); graph metadata backfilled scoped to this packet; the 005 track handover carries this leg's entry
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]` — 13 of 13; no `[B]` tasks
- [x] No `[B]` blocked tasks remaining
- [x] Manual verification: the lane's own measured numbers stand in for the headless leg's eye; the operator's device recheck remains the operator's row and is not ticked here
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
<!-- /ANCHOR:cross-refs -->
