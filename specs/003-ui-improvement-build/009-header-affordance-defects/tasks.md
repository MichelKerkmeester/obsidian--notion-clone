---
title: "Task Breakdown: Column Header Menu Affordance Defects"
description: "Task breakdown for the table and board column header menu affordance fix: cascade root-cause removal, flex-row header layout, vertical ellipsis icon, cursor scoping, auto-fit allowance and the regression suite."
trigger_phrases:
  - "header affordance tasks"
  - "column menu trigger task breakdown"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/009-header-affordance-defects"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored task breakdown for the header affordance defect fix"
    next_safe_action: "Await orchestrator compiler, build and test gates"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-009"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Task Breakdown: Column Header Menu Affordance Defects

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Notation | Meaning | Time Estimate |
|---|---|---|
| `[S]` | Small task | < 30 minutes |
| `[M]` | Medium task | 30–90 minutes |
| `[L]` | Large task | > 90 minutes |
| `- [ ]` | Incomplete task (unstarted) | — |
| `- [/]` | In progress task | — |
| `- [x]` | Completed task | — |

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 [S] Read every occurrence of `db-column-menu-trigger` in `styles.css` and identify the winning `position` declaration by cascade order and specificity rather than by reading the first rule (`styles.css:4658, 17272-17285` pre-fix) (REQ-001, REQ-006)
- [x] T002 [S] Audit the board equivalent: confirm `button.db-board-column-options` has zero CSS rules and that `.db-board-header-text` is `flex: 1 1 auto` (`src/views/BoardRenderer.ts:203-207`, `styles.css:975-982` pre-fix) (REQ-005)
- [x] T003 [S] Confirm `more-vertical` is a valid Obsidian icon name for `minAppVersion` 1.7.2 and that `IconName` is `string`, so the compiler provides no check (`node_modules/obsidian/obsidian.d.ts:5517, 7517`, `manifest.json`) (REQ-003)
- [x] T004 [S] Confirm the table uses `table-layout: fixed` with explicit column widths so an added in-flow child cannot reflow columns (`styles.css:4529`) (REQ-001)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T005 [S] Remove `.db-column-menu-trigger` from the shared touch-target `position: relative` list so no later blanket rule decides its layout (`styles.css:17365-17382`) (REQ-006)
- [x] T006 [S] Move `position: relative` into the trigger's own rule and replace `position: absolute; top; right` with `display: inline-flex; flex: 0 0 auto; margin-left: 2px`, plus `svg` sizing (`styles.css:4694-4723`) (REQ-001)
- [x] T007 [S] Convert `.db-th-content` to a full-width flex row with per-child spacing instead of a row `gap`, and give the type icon its 6px right margin (`styles.css:4629-4642`) (REQ-001)
- [x] T008 [S] Make `.db-th-label` the only shrinking child: `flex: 0 1 auto`, `min-width: 0`, `overflow: hidden`, `text-overflow: ellipsis`, `white-space: nowrap` (`styles.css:4674-4684`) (REQ-002)
- [x] T009 [S] Give the sort indicator its 6px left margin now that the row carries no `gap` (`styles.css:4758-4767`) (REQ-002)
- [x] T010 [S] Narrow the trigger's `::before` halo to `inset: -8px -8px -8px 0` and remove the class from the coarse-pointer symmetric inset list, leaving one declaration site (`styles.css:4731-4736, 17430-17450`) (REQ-007)
- [x] T011 [S] Mount the trigger inside `.db-th-content` with a fallback to the cell, and switch to the vertical ellipsis icon (`src/views/ColumnHeaderController.ts:46-60`) (REQ-001, REQ-003)
- [x] T012 [S] Scope `cursor: grab` to `th[data-note-database-column-key]` and return `cursor: pointer` over the label, type icon and sort indicator (`styles.css:4615-4627`) (REQ-004)
- [x] T013 [S] Convert `.db-board-header-text` to a content-hugging flex row and truncate `.db-board-column-title` / `.db-board-subgroup-title` inside it (`styles.css:975-994`) (REQ-005)
- [x] T014 [S] Pin `.db-board-count`, `.db-board-subgroup-count` and `.db-board-header-summaries` at `flex: 0 0 auto` so only the title shrinks (`styles.css:996-1001, 8465-8472, 8544-8550`) (REQ-005)
- [x] T015 [M] Add the previously absent `.db-board-column-options` rule set — inline non-shrinking box, 2px margin, hover/focus reveal, icon sizing — plus the name row's pointer cursor (`styles.css:8359-8401`) (REQ-004, REQ-005)
- [x] T016 [S] Add `.db-board-column-options` to the coarse-pointer minimum-size list for touch parity with the table trigger (`styles.css:17384-17403`) (REQ-005)
- [x] T017 [S] Mount the board options button into the header's name row at both the swimlane and the standard column call sites, and switch to the vertical ellipsis icon (`src/views/BoardRenderer.ts:202-209, 260, 516`) (REQ-003, REQ-005)
- [x] T018 [S] Raise the auto-fit header chrome allowance so it covers cell padding, the type icon with its margin and the trigger with its margin (`src/views/ColumnWidth.ts:45-49`) (REQ-008)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T019 [M] Add `src/views/ColumnHeaderMenuAffordance.test.ts` asserting, against the shipped stylesheet and the two renderer sources, that the trigger is in flow with a single positioning declaration, that the name truncates, that the icon is the vertical variant, that the board header mirrors the table, and that the drag cursor is scoped to the header background (REQ-009)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] T020 [S] Run TypeScript compiler type-check verification `npx tsc --noEmit` — **not run in this session; the orchestrator verifies this gate**
- [ ] T021 [S] Run Vitest unit test suite `npx vitest run` — **not run in this session; the orchestrator verifies this gate**
- [ ] T022 [S] Run production bundle build `npm run build` — **not run in this session; the orchestrator verifies this gate**
- [ ] T023 [S] Visually confirm `more-vertical` resolves to a rendered glyph in the running plugin — **not verifiable from source; `IconName` is `string`, so an unresolved name fails silently as a blank button**

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

| Requirement | Description | Tasks |
|---|---|---|
| REQ-001 | Table trigger sits inline immediately after the column name | T001, T004, T006, T007, T011 |
| REQ-002 | The column name truncates with an ellipsis | T008, T009 |
| REQ-003 | Both triggers use the vertical ellipsis icon | T003, T011, T017 |
| REQ-004 | The drag cursor appears only over the header background | T012, T015 |
| REQ-005 | The board column header takes the same inline shape | T002, T013, T014, T015, T016, T017 |
| REQ-006 | The trigger's positioning is declared exactly once | T005, T006 |
| REQ-007 | The enlarged tap target does not reach back over the name | T010 |
| REQ-008 | Auto-fit column width reserves the in-flow trigger | T018 |
| REQ-009 | A regression suite fails against the broken layout | T019 |

<!-- /ANCHOR:cross-refs -->
