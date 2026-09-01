---
title: "Task Breakdown: Add-View Popover Layout Defects"
description: "Task breakdown for the Add view popover layout fix: cascade audit and hypothesis test, type-scoped form sizing, the tile box model and its states, the caption rule, uniform tile rows, the footer action row, the border-box popover frame and the regression suite."
trigger_phrases:
  - "add view popover tasks"
  - "add view tile task breakdown"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/010-add-view-popover-layout"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored task breakdown for the add-view popover layout fix"
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
      session_id: "ui-build-010"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Task Breakdown: Add-View Popover Layout Defects

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

- [x] T001 [S] Read every occurrence of `db-menu-item` in `styles.css` and test the hypothesis that it imposes a horizontal flex row on the cards; record that it declares only `min-height`, `border`, `border-radius` and `transition`, and no `display` (`styles.css:226-264, 377, 2538`) (REQ-002, REQ-007)
- [x] T002 [S] Read every occurrence of `db-add-view` in `styles.css` and identify the rule stretching the checkbox as the descendant selector `.db-add-view-form input`, not a rule on the checkbox itself (`styles.css:18541-18547` pre-fix) (REQ-001)
- [x] T003 [S] Confirm the popover is created inside `.note-database-container` and is not reparented by `positionToolbarPopover`, ruling out a portal-scoping cause for the container-scoped rules failing (`src/views/ToolbarRenderer.ts:1221-1234, 1291`) (REQ-002)
- [x] T004 [S] Confirm `db-menu-item` is only ever written into class strings and never queried in TypeScript, so removing it from the tiles changes no behaviour (`grep -rn "db-menu-item" src/` — 38 matches, all class strings in `ColumnMenu.ts`, `RowMenu.ts` and `ToolbarRenderer.ts`) (REQ-006)
- [x] T005 [S] Confirm `installMenuKeyboardNavigation` selects `button[role=menuitem]` rather than the class, so arrow-key navigation survives the class removal (`src/views/ToolbarRenderer.ts:1971-1974`) (REQ-006)
- [x] T006 [S] Locate the in-repo precedent for resetting the pinned button height on a button used as a tile (`styles.css:3325-3347` `.db-calendar-search-result`; `styles.css:661-675` `button.db-icon-only-button`) (REQ-002)
- [x] T007 [S] Confirm no existing test references `db-add-view` or `db-menu-item`, so no suite is invalidated by the change (`grep -rn "db-add-view\|db-menu-item" src/ --include="*.test.ts"` — 0 matches) (REQ-009)

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T008 [S] Narrow the full-bleed form sizing selector to `input:not([type="checkbox"]):not([type="radio"])` and record why in a comment beside it (`styles.css:18548-18557`) (REQ-001)
- [x] T009 [S] Add `.db-add-view-duplicate input { flex: 0 0 auto; margin: 0 }`, declaring no width or height so the platform's checkbox metrics survive (`styles.css:18615-18620`) (REQ-001)
- [x] T010 [S] Add `grid-auto-rows: 1fr` to `.db-add-view-cards` so a wrapped caption does not make one row taller than the others (`styles.css:18622-18629`) (REQ-008)
- [x] T011 [M] Give `.db-add-view-card` its own box model — `height: auto`, `width: 100%`, `box-sizing: border-box`, `grid-template-columns: minmax(0, 1fr)`, `grid-template-rows: auto auto`, `align-content: start`, `white-space: normal`, `box-shadow: none` — with a comment recording why the height and wrapping resets exist (`styles.css:18631-18653`) (REQ-002, REQ-003)
- [x] T012 [S] Restate the hover and `:focus-visible` states on the tile, since it no longer inherits them from the shared menu-row class (`styles.css:18655-18664`) (REQ-008)
- [x] T013 [S] Add the previously absent `.db-add-view-card-label` rule with `min-width: 0`, `overflow-wrap: anywhere`, the extra-small type size and the normal text colour (`styles.css:18666-18672`) (REQ-003)
- [x] T014 [S] Contain the preview: `min-width: 0` on `.db-add-view-preview`, an explicit 18px icon via a new `.db-add-view-preview-icon` rule, and `max-width: 100%` on the fixed-width lines glyph (`styles.css:18674-18701`) (REQ-004)
- [x] T015 [S] Drop `db-menu-item` from the view-type card's class list and record in a comment why a tile is not a menu item, keeping `role="menuitem"` (`src/views/ToolbarRenderer.ts:1261-1267`) (REQ-006)
- [x] T016 [S] Add `box-sizing: border-box` to `.db-add-view-popover` alone so its padding and border count toward the existing viewport clamp, without touching the three sibling popovers in the shared width rule (`styles.css:18535-18540`) (REQ-004)
- [x] T017 [S] Add a separate `.db-add-view-duplicate-action` rule with `height: auto`, a top margin, a `--db-border-subtle` top rule and square corners, leaving the shared toolbar-row declaration list at `styles.css:18719-18733` untouched (`styles.css:18742-18750`) (REQ-005, REQ-007)

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T018 [M] Add `src/views/AddViewPopoverLayout.test.ts` asserting, against the shipped stylesheet and the renderer source, that the cards are vertical tiles with their own height rather than inheriting the menu-row box, that the checkbox is not stretched, that every caption has a rule, that the grid rows are uniform, that the popover frame is a border box, that the duplicate action is its own full-width row, and that the shared menu-row rule is still intact (REQ-009)
- [x] T019 [S] Verify no `!important` and no spec, requirement, task or checklist identifier appears anywhere in the diff (REQ-002, REQ-007)

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] T020 [S] Run TypeScript compiler type-check verification `npx tsc --noEmit` — **not run in this session; the orchestrator verifies this gate**
- [ ] T021 [S] Run Vitest unit test suite `npx vitest run` — **not run in this session; the orchestrator verifies this gate**
- [ ] T022 [S] Run production bundle build `npm run build` — **not run in this session; the orchestrator verifies this gate**
- [ ] T023 [S] Visually confirm in the running plugin that the tiles contain their own contents, that no horizontal scrollbar appears, and that the popover reads correctly in light and dark themes and at the narrow clamp — **not verifiable from source; a text assertion cannot measure a rendered box**

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

| Requirement | Description | Tasks |
|---|---|---|
| REQ-001 | The duplicate checkbox renders at its native size with its caption beside it | T002, T008, T009 |
| REQ-002 | Each view-type card is a self-contained tile | T001, T003, T006, T011, T019 |
| REQ-003 | Every card shows its caption | T011, T013 |
| REQ-004 | Nothing overflows the popover horizontally | T014, T016 |
| REQ-005 | The duplicate action occupies its own full-width row | T017 |
| REQ-006 | The tile stops being labelled a menu row | T004, T005, T015 |
| REQ-007 | The shared menu-row rule keeps working for genuine rows | T001, T017, T019 |
| REQ-008 | Tiles are uniform and keep hover and focus feedback | T010, T012 |
| REQ-009 | A regression suite fails against the broken layout | T007, T018 |

<!-- /ANCHOR:cross-refs -->
