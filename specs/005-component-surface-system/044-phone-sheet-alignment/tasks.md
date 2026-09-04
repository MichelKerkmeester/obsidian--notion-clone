---
title: "Tasks: Phone Sheet Alignment"
description: "Ordered tasks: read the contracts and the inventory, land the shared chrome, then one leg per reported sheet and one per ranked non-conforming instance, held by a conformance check with a negative control."
trigger_phrases:
  - "phone sheet alignment tasks"
  - "044 tasks"
  - "sheet grammar tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phone Sheet Alignment

<!-- SPECKIT_LEVEL: 2 -->

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
## Phase 1: Setup

- [ ] T001 Read the two contracts this phase consumes and record what may not change: `003`'s portal and phone predicate, `016`'s drag, flick thresholds and the operator-accepted 35px grab band (`../003-mobile-sheet-presentation/spec.md`, `../016-sheet-drag-and-audit/acceptance-criteria.md`, `src/views/mobile-bottom-sheet.ts`)
- [ ] T002 [B] Read `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md` and turn its ranking into T007's per-instance subtask list. Blocked on the inventory landing; do not wait for it to start T003 (`044/tasks.md`)
- [ ] T003 [P] Define the seven grammar elements as one checkable contract, with the class names and the DOM shape each one requires, so `sheet-grammar.mjs` and the consumer legs read the same list (`src/views/mobile-bottom-sheet.ts`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 Land the shared chrome in the sheet module: a header builder carrying title plus a close affordance over 44px, a `visualViewport` listener publishing `022`'s `--db-keyboard-inset` while a sheet is open, the padded-row and segmented-control class contract, and the bottom safe-area inset. `applySheetChrome`'s existing signature, `attachSheetDragToDismiss` and the flick constants stay byte-identical so `016`'s measurements remain valid (`src/views/mobile-bottom-sheet.ts`)
- [ ] T005 Report 40 — the column-width adjuster. Replace the two bespoke `doc.body.createDiv` surfaces at `database-view.ts:11411-11412` with a sheet body: surface, grab band, header carrying the column name and a close, the slider and typed value as padded rows, the Auto/Narrow/Medium/Wide presets as a segmented control, safe-area inset. Keep the `activeElement` guard that stops the clamp eating keystrokes. Leg: `worktrees/039-column-width-sheet` (`src/views/database-view.ts`, `styles.css`)
- [ ] T006 Report 40b — keyboard avoidance. While the width field holds focus, the sheet's bottom edge stays above the reduced `visualViewport` bottom and the field stays inside the visible area. Red first against the strip presentation (`src/views/mobile-bottom-sheet.ts`, `tools/live/sheet-grammar.mjs`)
- [ ] T007 Report 41 — the settings sheet. Make the grab handle close it, and replace the desktop two-column `Setting` grid on phone with padded rows so no label wraps against a narrow control and no description clips at the right edge. Restyle through our own host wrapper class, never by patching `Setting` internals. Leg: `worktrees/040-settings-sheet` (`src/settings.ts`, `src/views/modals/db-modal.ts`, `styles.css`)
- [ ] T008 Report 43 — the Add view sheet. Header with a close affordance; the three loose inputs grouped into padded rows; **Title property** as a dropdown row rather than the plain text input it renders as today; **Copy settings from current view** as a toggle row rather than a bare checkbox; the view-type list as chromed rows with chevrons instead of a flat icon list (`src/views/toolbar-renderer.ts`, `styles.css`, `src/i18n.ts`)
- [ ] T009 [B] One subtask per non-conforming instance the inventory ranks, after the three reported ones. Includes at minimum the `doc.body.createDiv` popovers that bypass the sheet path entirely: `icon-picker-popover.ts:57`, `option-color-picker.ts:43`, `column-menu.ts:576`. Blocked on T002 (`src/views/*`)
- [ ] T010 [P] Assert that the Add view picker carries no **List view** row. The removal is `specs/006-list-view-deprecation/002-hide-and-migrate`'s; this task owns only the assertion and stays `[B]` until that lands (`tools/live/sheet-grammar.mjs`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T011 Build `tools/live/sheet-grammar.mjs` on `043`'s constructed mount seam: one row per registered surface per grammar element, exit non-zero on any missing element. Register it in `tools/gate.mjs` (`tools/live/sheet-grammar.mjs`, `tools/gate.mjs`)
- [ ] T012 Run the negative control: remove one grammar element from one conforming surface, observe the check go red on that surface alone, restore by hash. A check that has never been observed red is not evidence (`tools/live/sheet-grammar.mjs`)
- [ ] T013 Recapture, read the changed PNGs by hand, re-baseline the `touch-targets` ratchet with the raise attributed per class, and release the `styles.css` lane (`screenshots/`, `tools/live/touch-targets-constructed-baseline.json`)
- [ ] T014 Update `../roadmap.md` §4 rows 40, 41 and 43 with the measured after-numbers, and this phase's row in `../spec.md`'s Phase Documentation Map (`../roadmap.md`, `../spec.md`)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification passed — the operator opens all three reported sheets on iOS and reports each as aligned
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Instance source**: `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md`
- **Operator rows**: `../roadmap.md` §4 rows 40, 41, 43
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete
- [ ] CHK-022 [P1] Edge cases tested
- [ ] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`. Reports 40, 41 and 43 are provisionally `class-of-bug`, which is why this phase exists rather than three fixes.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep. `rg -n 'body\.createDiv' src` is the producer scan.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests. `applySheetChrome` has six consumers today; the count after must be stated.
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases. N/A here — no path, parser or redaction surface is touched; record that rather than ticking it blank.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed.
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state. Applies: `visualViewport` and `document.body` are process-wide.
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation implemented — the width field's numeric clamp
- [ ] CHK-032 [P1] Auth/authz working correctly — N/A, no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments adequate
- [ ] CHK-042 [P2] README updated (if applicable)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 11 | 0/11 |
| P1 Items | 12 | 0/12 |
| P2 Items | 2 | 0/2 |

**Verification Date**: 2026-09-04
<!-- /ANCHOR:summary -->

---
