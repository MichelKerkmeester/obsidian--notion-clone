---
title: "Tasks: Phase 9: properties-sheet-row-model"
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
# Tasks: Phase 9: properties-sheet-row-model

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
## Phase A: Baseline and shared-builder survey

- [ ] T001 Read `../sheet-notion-audit.md` §0, §3.1 and §3.2 before anything else. §0 is binding: every Notion iOS asset is 299x678, so **no number in this packet may come from one**. Confirm you can state the origin of each numeric target in `spec.md` §13 (all are ours) (`../sheet-notion-audit.md`)
- [ ] T002 Run the lane and record the pre-change baseline verbatim: the Properties sheet's 3/3 section-boundary hairlines, its title centring (0.49px), its row pitch and its 0 native selects (`tools/live/sheet-grammar.mjs`)
- [ ] T003 Survey the shared row builder before touching it: `column-manager-renderer.ts:318-410` and `record-detail-panel.ts:216-226` pass the same options object. Record which options each caller sets, and measure whether any fixture has two properties sharing one label (the bracketed key's only defensible job). Change nothing yet (`src/views/column-manager-renderer.ts`, `src/views/record-detail-panel.ts`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: RED — assert what has never been asserted

- [ ] T004 Add a **controls-per-row** clause to the column-manager surface: count interactive descendants per property row and assert **≤4**. Run RED first and record the failing count (today: 6 per row) (`tools/live/sheet-grammar.mjs`)
- [ ] T005 Add a **key-free label** clause: assert no property row's label text matches a bracketed-key pattern. Run RED first and record (today: every row, e.g. `Name [file.name]`) (`tools/live/sheet-grammar.mjs`)
- [ ] T006 Add a **section-partition** clause: with at least one property hidden, assert ≥2 section headers exist and each carries a bulk-action control on its own line. Run RED first and record (today: 0 section headers) (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Implement GREEN — destination before source

- [ ] T007 Land the destination first: give the edit-property surface a `Wrap content` toggle and a `Delete property` row, matching Notion's own Edit-property sheet, with delete carrying `is-warning`. Confirm it is reachable in one tap from a property row **before** anything is removed (`src/views/database-view.ts`, `src/views/column-manager-renderer.ts`)
- [ ] T008 Now cut the row: remove the wrap and trash icon buttons, drop the bracketed key from the label, and reduce the row to at most four interactive controls. If T003 found two properties sharing a label, move the disambiguator to a secondary line rather than restoring the key. Branch on the caller if the shared builder's default would change the record sheet (`src/views/column-manager-renderer.ts`)
- [ ] T009 Build the Shown / Hidden partition, reusing `panel.shownSection`, `panel.hiddenSection`, `panel.hideAllProperties` and `panel.showAllProperties` — the four strings `record-detail-panel.ts:222-226` already consumes. Move the header's `All` master checkbox onto the section headers as their bulk action. Style in `styles.css` (`src/views/column-manager-renderer.ts`, `styles.css`)
- [ ] T010 Run GREEN on T004-T006 and record every number (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Regression, unit proof and close

- [ ] T011 Rerun the landed clauses unchanged and confirm they still pass on **both** engines: the sheet's 3/3 section-boundary hairlines, its row pitch, its 0 native selects, its 0.49px title centring — **and the record sheet's own `006` clauses** (21/21 rows at 44.0px, 20/20 hairlines, 16.0px inset), because T008 may have touched the builder they share (REQ-006). Then extend `column-manager-renderer.test.ts` with a revert-proof unit test for the row contract and prove it red-then-green. Finish with the full battery — `npx tsc --noEmit`, `npm run build`, `npx vitest run`, `npm run screenshots` for the Properties sheet phone light+dark (REQ-007), `npm run gate` — then write the closing docs, validate (`orchestrator --strict` → `RESULT: PASSED`), backfill graph metadata, and append the packet entry to `../../handover.md` (`src/views/column-manager-renderer.test.ts`)
<!-- /ANCHOR:phase-4 -->
