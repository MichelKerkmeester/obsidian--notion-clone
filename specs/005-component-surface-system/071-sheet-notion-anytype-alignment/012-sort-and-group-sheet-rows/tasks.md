---
title: "Tasks: Phase 12: sort-and-group-sheet-rows"
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
# Tasks: Phase 12: sort-and-group-sheet-rows

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
## Phase A: Baseline and the reorder question

- [ ] T001 Read `../sheet-notion-audit.md` §0, §3.10 and §3.11 before anything else. §0 is binding: every Notion iOS asset is 299x678, so **no number in this packet may come from one**. Note the one place the audit says the reference cannot answer at all: Notion's sort reorder (§5 C-4) (`../sheet-notion-audit.md`)
- [ ] T002 Run the lane and record the pre-change baseline verbatim: sort 2/2 rows @48px, span 357px, row inset 16.0px, 0 native selects; group 17/17 rows @44px, span 341px, padding 16px/16px, 1 section heading (`tools/live/sheet-grammar.mjs`)
- [ ] T003 Confirm the `×` glyph's hit area before writing anything about it: measure the rendered box of `.obnotion-panel-button-narrow` including `styles.css:13820`'s `::before`. It should clear 44px. Record the number — this packet's delete change is **legibility**, and must not be written up as a touch-target fix (`styles.css`, `tools/live/sheet-grammar.mjs`)
- [ ] T004 Settle the reorder question with measurement, not assumption. For both the `⋮⋮` drag handle and the ↑↓ arrow pair, record: rendered touch box, keyboard reachability, and whether each is the only path to reordering for some input mode. The surviving affordance must carry the keyboard path. Record the choice and its evidence in `decision-record.md` (`src/views/sort-panel-renderer.ts`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert what has never been asserted

- [ ] T005 Add three clauses to the sort surface and one to the group surface, and run each RED first, recording the failing numbers: (a) a sort rule renders on **2** rows — RED today at 1; (b) no rule row carries more than **4** interactive controls — RED today at 5; (c) the sheet carries exactly **1** reorder affordance — RED today at 2; (d) no group row carries more than **4** interactive controls (`tools/live/sheet-grammar.mjs`)
- [ ] T006 Add a **group-partition** clause: with at least one group hidden, assert ≥2 section headers exist and each carries a bulk-action control on its own line. Add a **sheet-body prose** clause asserting no run exceeds 80 characters. Run both RED and record (today: 1 heading; 150 characters) (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN

- [ ] T007 Stack the sort rule: build the property and direction as two rows inside one rule block, and replace the `×` with a labelled destructive row carrying `is-warning` (`styles.css:813`, the class three producers already use). Remove whichever reorder affordance T004 ruled against, keeping the keyboard path on the survivor. Style in `styles.css`. Then confirm the taller sheet still respects the 90svH cap and the published keyboard inset with a 5-rule sort mounted (`src/views/sort-panel-renderer.ts`, `styles.css`)
- [ ] T008 Give the group sheet its Shown / Hidden partition with a bulk action on each section header, reusing `panel.shownSection`, `panel.hiddenSection`, `panel.hideAllProperties` and `panel.showAllProperties` — the four strings that already ship and that `record-detail-panel.ts:222-226` already consumes. Reduce any group row above four interactive controls. Move `sortPanel.calendarHint` behind a phone-reachable info affordance, or shorten it under 80 characters (`src/views/toolbar-renderer.ts`, `styles.css`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Regression, merge check and close

- [ ] T009 Run GREEN on T005 and T006 and record every number. Then the merge check this packet's risk table names: if `008-filter-sheet-row-model` has landed, rebase onto it and rerun **both** packets' clauses together — the two share row primitives and each can pass alone while conflicting merged. Rerun `005`'s own sort and group clauses unchanged on both engines (rows 44-52px, padding 16px/16px, 1px divider, 0 native selects, spans, and the group popover's scrollbar fix) (`tools/live/sheet-grammar.mjs`)
- [ ] T010 Extend `sort-panel-renderer.test.ts` with a revert-proof unit test for the rule-row contract and prove it red-then-green. Finish with the full battery — `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots` for both sheets phone light+dark, `npm run gate` — then write the closing docs including `decision-record.md` for T004's reorder ruling, validate (`orchestrator --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet entry to `../../handover.md` (`src/views/sort-panel-renderer.test.ts`)
<!-- /ANCHOR:phase-4 -->
