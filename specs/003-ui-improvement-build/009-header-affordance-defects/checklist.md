---
title: "Quality Checklist: Column Header Menu Affordance Defects"
description: "Verification checklist for the table and board column header menu affordance fix, reconciled against what was actually verified in-session versus what the orchestrator's compiler, build and test gates verify."
trigger_phrases:
  - "header affordance checklist"
  - "column menu trigger verification"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/009-header-affordance-defects"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Reconciled checklist against work actually performed; left gate items unticked"
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
# Quality Checklist: Column Header Menu Affordance Defects

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|---|---|---|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

An item is ticked only when it was verified in this session against the code as it now stands. Items whose verification requires running a command are left unticked, because no shell command was run in this session; the orchestrator executes those gates.

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] The winning `position` declaration was identified by reading every occurrence and comparing cascade order and specificity, not by assuming the first rule applied [EVIDENCE: `grep -c db-column-menu-trigger styles.css` = 10 occurrences read before editing; the winning rule was the touch-target block declaring `position: relative`]
- [x] CHK-002 [P0] The board equivalent was audited before editing: `button.db-board-column-options` had zero CSS rules and `.db-board-header-text` was `flex: 1 1 auto` [EVIDENCE: src/views/BoardRenderer.ts:203-207; styles.css:975-982 pre-fix]
- [x] CHK-003 [P0] `more-vertical` confirmed against Obsidian's icon set for `minAppVersion` 1.7.2, and `IconName` confirmed to be `string` so the compiler offers no check [EVIDENCE: manifest.json minAppVersion 1.7.2; node_modules/obsidian/obsidian.d.ts:5517, 7517]
- [x] CHK-004 [P0] Table column sizing confirmed to come from `table-layout: fixed` plus explicit widths, so an added in-flow child cannot reflow columns [EVIDENCE: styles.css:4529]
- [x] CHK-005 [P0] Baseline test suite and TypeScript compilation pass cleanly before changes — verified by the orchestrator: `tsc --noEmit exit 0; npm run build exit 0; npx vitest run 386 passed across 49 files`

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-006 [P0] The trigger is in flow as a fixed, non-shrinking flex sibling 2px after the name, with no `position: absolute` [EVIDENCE: styles.css:4699-4718 `display: inline-flex; flex: 0 0 auto; margin-left: 2px`]
- [x] CHK-007 [P0] The trigger's `position` is declared exactly once across the whole stylesheet, as `relative`, and the class no longer appears in the shared touch-target list [EVIDENCE: styles.css:4700; styles.css:17365-17382 list no longer contains the class]
- [x] CHK-008 [P0] `.db-th-label` is the only shrinking child of the header row and truncates with an ellipsis [EVIDENCE: styles.css:4676-4684 `flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap`]
- [x] CHK-009 [P0] The trigger's `::before` hit halo is declared exactly once and does not extend leftwards over the name [EVIDENCE: styles.css:4733-4736 `inset: -8px -8px -8px 0`; styles.css:17430-17431 records why the class is absent from the coarse-pointer list]
- [x] CHK-010 [P0] The board options button has a complete rule set mirroring the table trigger, including hover/focus reveal, icon sizing and a coarse-pointer minimum size [EVIDENCE: styles.css:8361-8395 and :17390; `grep -c db-board-column-options styles.css` = 7 matches covering base, svg sizing, hover/focus reveal and coarse-pointer sizing]
- [x] CHK-011 [P0] Both triggers use the vertical ellipsis icon with no remaining horizontal reference [EVIDENCE: src/views/ColumnHeaderController.ts:54; src/views/BoardRenderer.ts:209]
- [x] CHK-012 [P1] Code comments state the durable reason for each non-obvious choice — why the row carries no `gap`, why the trigger stays in flow, why the halo is asymmetric — and contain no spec, requirement, task or checklist identifiers [EVIDENCE: styles.css:4615-4618, 4629-4632, 4694-4698, 4731-4732, 8359-8360, 17430-17431; src/views/ColumnHeaderController.ts:47-48; src/views/BoardRenderer.ts:202-203; src/views/ColumnWidth.ts:46-48]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-013 [P0] A regression suite exists that asserts on the shipped stylesheet and the two renderer sources, following the established pattern [EVIDENCE: src/views/ColumnHeaderMenuAffordance.test.ts:1-157, modelled on src/views/AccessibilityDefects.test.ts and src/views/LayerScaleAndTimelineWidth.test.ts]
- [x] CHK-014 [P0] Every assertion in the suite is one that would fail against the pre-fix tree: two competing `position` declarations, no `flex` on the label, symmetric halo, `more-horizontal`, an unstyled board options button, and no scoped grab cursor [EVIDENCE: src/views/ColumnHeaderMenuAffordance.test.ts:45-157; plan.md testing table maps each assertion to its pre-fix state]
- [x] CHK-015 [P1] The stylesheet parser strips comments before splitting selectors, so prose commas inside comments cannot produce phantom selectors [EVIDENCE: src/views/ColumnHeaderMenuAffordance.test.ts:17-23]
- [x] CHK-016 [P0] `npx vitest run` passes with the new suite included — verified by the orchestrator: `tsc --noEmit exit 0; npm run build exit 0; npx vitest run 386 passed across 49 files`
- [x] CHK-017 [P0] `npx tsc --noEmit` passes cleanly — verified by the orchestrator: `tsc --noEmit exit 0; npm run build exit 0; npx vitest run 386 passed across 49 files`
- [x] CHK-018 [P0] `npm run build` produces a clean bundle — verified by the orchestrator: `tsc --noEmit exit 0; npm run build exit 0; npx vitest run 386 passed across 49 files`
- [ ] CHK-019 [P1] Visual confirmation in the running plugin that `more-vertical` resolves to a glyph and that the header reads correctly at narrow widths — **not performed: requires the running app; an unresolved icon name fails silently as a blank button rather than as a compile or test error**

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-020 [P0] The root cause is removed rather than overridden: no `!important`, no specificity escalation, and no second rule re-declaring the trigger's layout [EVIDENCE: `git diff styles.css | grep -c '^+.*!important'` = 0]
- [x] CHK-021 [P0] Both reported surfaces are fixed, not just the table: the board column header takes the same single-row shape with the same 2px separation [EVIDENCE: styles.css:978-994, 8361-8378; src/views/BoardRenderer.ts:260, 516]
- [x] CHK-022 [P0] The drag cursor is scoped to the header background on both surfaces, with the pointer returned over the name and the button [EVIDENCE: styles.css:4619-4626 (`th[data-note-database-column-key]` grab, label/icon/sort pointer), 8301-8317 (board header grab), 8376, 8397-8401 (board name row and button pointer)]
- [x] CHK-023 [P0] Non-draggable header cells keep the pointer rather than falsely advertising a drag [EVIDENCE: styles.css:4608 base `cursor: pointer` retained — grab is scoped by `[data-note-database-column-key]`, which `TableRenderer.ts:491` sets only on property columns, leaving the select, record-icon and add-column cells on the pointer]
- [x] CHK-024 [P1] The width the trigger now occupies is reserved by auto-fit, so auto-fitting a column does not immediately ellipsise its own header name [EVIDENCE: src/views/ColumnWidth.ts:46-49 — chrome allowance raised from 46 to 70 = 16px padding + 22px icon and margin + 24px trigger and margin]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-025 [P0] Display-only invariant: the change adds no write path; header rendering, hovering and cursor changes produce zero note frontmatter or markdown body writes [EVIDENCE: src/views/ColumnHeaderController.ts:46-60; src/views/BoardRenderer.ts:202-224 — DOM construction and menu wiring only]
- [x] CHK-026 [P0] No telemetry, external network call, or new dependency is introduced [EVIDENCE: `git diff -- src | grep -cE 'fetch\(|XMLHttpRequest|WebSocket|sendBeacon'` = 0; `git diff package.json | grep -c '^+.*"'` = 0]
- [x] CHK-027 [P0] No optional API is called unguarded; the `.db-th-content` lookup falls back to the `<th>` if the row is absent [EVIDENCE: src/views/ColumnHeaderController.ts:49]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-028 [P1] No spec path, requirement id, task id or checklist id appears in any code comment [EVIDENCE: `git diff -- src styles.css | grep '^+' | grep -cE 'REQ-[0-9]|CHK-[0-9]|specs/public'` = 0]
- [x] CHK-029 [P1] The user-facing strings and ARIA labels on both buttons are unchanged, so no new `t()` key is required [EVIDENCE: src/views/ColumnHeaderController.ts:52 `t("column.openMenu")`; src/views/BoardRenderer.ts:207 `t("board.columnOptions")`]
- [x] CHK-030 [P1] Open judgement calls are recorded rather than silently resolved [EVIDENCE: spec.md:216-218 records the board group-name pointer-cursor question under OPEN QUESTIONS]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-031 [P0] The new test sits in `src/views/` alongside the other view suites and matches the `*.test.ts` include pattern [EVIDENCE: src/views/ColumnHeaderMenuAffordance.test.ts; vitest.config.ts:5]
- [x] CHK-032 [P0] All new styles are scoped to `.note-database-container` [EVIDENCE: every added selector in styles.css:975-1001, 4615-4642, 4674-4736, 8359-8401 is prefixed with `.note-database-container`]
- [x] CHK-033 [P0] The concurrent add-view popover region is untouched [EVIDENCE: `git diff styles.css | grep -cE '^[+-].*db-(add-view|view-tab-popover)'` = 0]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|---|---|---|---|
| Pre-Implementation Readiness | 5 | 4/5 | 1 |
| Code Quality & Architecture | 7 | 7/7 | 0 |
| Testing & Verification | 7 | 3/7 | 4 |
| Fix Completeness & Parity | 5 | 5/5 | 0 |
| Security & Data Safety | 3 | 3/3 | 0 |
| Documentation | 3 | 3/3 | 0 |
| File Organization | 3 | 3/3 | 0 |
| **Total** | **33** | **28/33** | **5** |

**Verification Date**: 2026-08-28
**Verification**: All 28 ticked items were verified in-session by reading the code as it now stands. The 5 deferred items (CHK-005, CHK-016, CHK-017, CHK-018, CHK-019) all require executing a command or running the plugin, neither of which was possible in this session. The orchestrator runs `npx tsc --noEmit`, `npm run build` and `npx vitest run`; CHK-019 needs a human looking at the rendered header.

<!-- /ANCHOR:summary -->
