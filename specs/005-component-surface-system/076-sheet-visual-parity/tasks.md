---
title: "Tasks: Sheet Visual Parity"
description: "Parent-level coordination tasks: the scaffold, the per-child sequence gate, and the programme close. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "076 tasks"
  - "sheet parity coordination tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Sheet Visual Parity

<!-- SPECKIT_LEVEL: phase -->

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

**These are coordination tasks only.** The implementation tasks are the six step groups in each
child's own `tasks.md`.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase A: Scaffold

- [x] T001 Open the three captures the operator cited and confirm each against its producer before writing anything — properties row, settings sheet, filter surfaces (`screenshots/notion-clone/**`, `src/views/**`)
- [x] T002 Audit fixture-versus-production across all fifty-nine constructed scenarios and record the result, whichever way it falls (`tools/screenshots/constructed-scenarios.mjs`, `tools/screenshots/scenarios.mjs`)
- [x] T003 Take the reference reads for the first families and record every value that cannot be read at 299×678 as a gap rather than a guess (`screenshots/notion/ios/**`)
- [x] T004 Write the parent packet: `spec.md` with the loop and the rubric, `decision-record.md` D1-D4, `goal.md`, `plan.md`, `tasks.md`, `checklist.md` (`specs/005-component-surface-system/076-sheet-visual-parity/`)
- [x] T005 Scaffold eleven children, each with the six-step loop as its plan and tasks and the rubric thresholds in its acceptance criteria (`001-*/` … `011-*/`)
- [x] T006 Update the parent surfaces: `roadmap.md` §4, §5.A, §6A and §7; `005/goal.md`'s DONE table; `005/handover.md` (`specs/005-component-surface-system/`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase B: The sequence gate, once per child

Run these three at each hand-off, in order. They are the parent's only job while a child is open.

- [ ] T007 Before a child starts: confirm the previous child's judge passed **twice consecutively on an unchanged tree**, and that its lane clauses are in the shared regression set (`<prev-child>/verification.md`, `tools/live/sheet-grammar.mjs`)
- [ ] T008 While a child is open: confirm it holds the css-lane triplet alone, and that no second child is editing `styles.css` (`tools/lane/check-lane.mjs`)
- [ ] T009 After a child closes: set its row in `spec.md`'s Phase Documentation Map to `complete`, tick its row in `goal.md` §3, and append a dated entry to `../handover.md` with `recent_action` ≤ 96 characters (`spec.md`, `goal.md`, `../handover.md`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase C: Cross-child work that belongs to no single sheet

- [ ] T010 When the operator's C-1..C-6 or settings capture arrives, re-open the DEFINE step of every child whose targets came from a 299×678 thumbnail, and record which numeric cells changed (D3) (`decision-record.md`, each child's `spec.md` §13)
- [ ] T011 Raise a Proposed ADR in `roadmap.md` §7 for each landed `071` ruling a child's visual target contradicts, naming the ruling and the evidence on both sides — never amend the `071` child (`../roadmap.md`)
- [ ] T012 Keep the rubric itself under review: if a child passes 14/16 twice and the operator still reports the sheet wrong, the rubric is what failed, and the finding is recorded here before the next child starts (`spec.md` §5, `decision-record.md`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase D: Close

- [ ] T013 All eleven map rows `complete`, all eleven `goal.md` rows ticked, the `071` regression set green, and the eleven operator rows left open and unticked (`spec.md`, `goal.md`)
- [ ] T014 Validate the parent and every child with `orchestrator.js --strict`, backfill graph metadata per folder, re-validate, and record the `RESULT` lines (`specs/005-component-surface-system/076-sheet-visual-parity/`)
<!-- /ANCHOR:phase-4 -->
