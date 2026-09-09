---
title: "Tasks: Phase 8: filter-sheet-row-model"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 8: filter-sheet-row-model

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
## Phase A: Baseline and root cause

- [ ] T001 Read `../sheet-notion-audit.md` §0 and §3.9 before anything else. §0 is the binding
  constraint: every Notion iOS asset is 299x678, so **no number in this packet may come from one**.
  Confirm you can state where each numeric target in `spec.md` §13 comes from (all are ours)
  (`../sheet-notion-audit.md`)
- [ ] T002 Run the lane and record the pre-change baseline verbatim: filter 3/3 rows @48px,
  panel padding 16px/16px, row span 332px, native selects 0, extent 373 == 373, and the printed
  `row sits 25.0px from the sheet's edge` (`tools/live/sheet-grammar.mjs`)
- [ ] T003 Find what produces the 9px difference between filter's 25.0px row inset and sort's
  16.0px — read the computed box of a condition row and its ancestors on the filter fixture and
  name the rule that adds it (a candidate is the rule-tree's own left border/indent,
  `.obnotion-source-rule-node`). Record the finding; the T008 fix targets whatever this names.
  Do not change anything yet (`styles.css`, `src/views/filter-panel-renderer.ts`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert what has never been asserted

- [ ] T004 Add a **controls-per-row** clause to the filter surface: count interactive descendants
  (`button`, `input`, `select`, `[role=button]`, `.obnotion-dropdown-field`) per condition row and
  assert **≤4**. Run RED first and record the failing count (today: 6 per row, 3 rows)
  (`tools/live/sheet-grammar.mjs`)
- [ ] T005 Add a **name-legibility** clause: mount a condition whose property name is at least 12
  characters and assert the property control's rendered text is not truncated — compare
  `scrollWidth` to `clientWidth` on the label element, and assert the text content is not
  ellipsis-terminated. Run RED first and record it (today: truncated) (`tools/live/sheet-grammar.mjs`)
- [ ] T006 Add a **row-inset** clause promoting the number the lane already prints but never checks
  at `sheet-grammar.mjs:3998`: every panel sheet's first divider-owing row sits **16.0px** from the
  sheet edge. Run RED first — filter fails at 25.0px, sort and group pass — and record
  (`tools/live/sheet-grammar.mjs`)
- [ ] T007 Add a **shared-span** clause: filter, sort and group row spans agree within **±2px**.
  Run RED first and record (today: 332 / 357 / 341px) (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [ ] T008 Stack the condition: in `filter-panel-renderer.ts:555-604`, build the property,
  operator and value as three rows inside one rule block instead of three inline controls on one
  `.obnotion-panel-row`. Keep every control's existing class, value binding and change handler
  untouched — this is an arrangement change. Replace the bare `—` empty-value glyph (`:595`) with
  a labelled affordance (REQ-008). Style the block in `styles.css`, and apply the T003 fix so the
  row inset reads 16.0px (`src/views/filter-panel-renderer.ts`, `styles.css`)
- [ ] T009 Move the rule's three icon buttons — `folder-plus` (add group), `circle-slash-2`
  (negate), `×` (remove) — off the condition row and render them as labelled rows, remove carrying
  the destructive treatment (`is-warning`, `styles.css:813`, the same class three producers already
  use). Assert the **nested-group** fixture separately: the group header
  (`createFilterTreeGroup`, `:415-445`) keeps its own structure and its own actions
  (`src/views/filter-panel-renderer.ts`, `styles.css`)
- [ ] T010 Run GREEN on T004-T007 and record every number. Then confirm the taller sheet still
  respects the 90svH cap and the published keyboard inset with a 5-rule filter mounted
  (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Regression and unit proof

- [ ] T011 Rerun `005`'s own clauses unchanged and confirm they still pass under the stacked block:
  rows 44-52px, panel padding 16px/16px, 1px divider, 0 native selects, extent 373 == 373, and the
  group popover's scrollbar fix (REQ-006). Also rerun the whole-lane sweep on **both** engines
  (`tools/live/sheet-grammar.mjs`)
- [ ] T012 Extend `filter-panel-renderer.test.ts` with a revert-proof unit test for the stacked-row
  class contract, then prove it: revert the stacking rule → the test fails; restore → all pass.
  Record both states. Finish with the full battery — `npx tsc --noEmit`, `npm run build`,
  `npx vitest run`, `npm run screenshots` for the Filter sheet phone light+dark (REQ-009),
  `npm run gate` — then write the closing docs, validate (`orchestrator --strict` → `RESULT: PASSED`),
  backfill graph metadata, and append the packet entry to `../../handover.md`
  (`src/views/filter-panel-renderer.test.ts`)
<!-- /ANCHOR:phase-4 -->
