---
title: "Tasks: Stacked Sheets"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "048 tasks"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Stacked Sheets

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
## Phase 1: Setup — the inventory comes first

Nothing is migrated before the list of what must be migrated exists. `044`'s instance ranking sat
`[B]` on an inventory for the same reason.

- [x] T001 Code-derived stacked-surface inventory: every surface that can open while another sheet
      is open, grouped parent → child → opener kind → current → target, one `file:line` opener per
      row, cross-referencing `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md`
      rather than restating it (`stacked-surface-inventory.md`)
- [x] T002 Identify the layers in `../scratch/device-2026-09-05/stacked-properties-create-property.png`
      by naming the nodes on `document.body` at that moment — three sheets, or a sheet plus a
      modal's own chrome band (`stacked-surface-inventory.md` §5)
- [x] T003 Runtime diff against the static list: open each parent, open each child, log depth,
      `--db-mobile-sheet-bottom` per sheet, scrim count and node position, and the parent's rect
      before and after. Record the failing numbers into `checklist.md`'s "today" column
- [x] T004 [P] Rank the inventory rows: which stacked pairs the operator meets first, worst first

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### The stacking model

- [x] T005 Make `parentId` load-bearing: expose the depth of a surface and the surface immediately
      beneath the top, per document (`src/views/overlay-stack.ts`)
- [x] T006 Push/pop parent treatment in the mount: on push, dim and scale back the surface beneath;
      on pop, restore it. The parent's bounding box does not change (`src/views/mobile-bottom-sheet.ts`)
- [x] T007 Move the one scrim node between the top two sheets instead of leaving it behind both,
      keeping the `MutationObserver` guarantee that a bare `.remove()` is still correct
      (`src/views/mobile-bottom-sheet.ts`)
- [x] T008 Publish the keyboard inset to the topmost sheet only; a sheet beneath holds zero and does
      not move for a keyboard opened over its child (`src/views/popover-position.ts`)
- [x] T009 Parent dim and scale, and the scroll fade at a child's cut (`styles.css`)

### Per-child migrations, by inventory rank

- [x] T010 K1 dropdown sheets — the single largest class and both operator screenshots. Header with
      a title and a 44px close on every stacked dropdown (`src/views/dropdown-field.ts`)
- [x] T011 K2 owned menus — the same header on the menu sheet (`src/views/owned-menu.ts`)
- [x] T012 The Properties sheet's own header onto `createSheetHeader`, replacing the hand-built
      header that has no close (`src/views/column-manager-renderer.ts:159`)
- [x] T013 K6 pickers — date, icon and colour (`src/views/date-value-picker.ts`,
      `src/views/icon-picker-popover.ts`, `src/views/option-color-picker.ts`)
- [x] T014 K3 `DbModal` sheets — **D1 ACCEPTED** (`decision-record.md` ADR-001). Either the shared header on
      `applyPresentation`, or the named phone flows replaced with sheets
      (`src/views/modals/db-modal.ts`)
- [x] T015 K4 `FuzzySuggestModal` — the two reachable from the settings sheet: a sheet, or an
      explicit recorded exemption with its reason (`src/views/view-config-panel-renderer.ts:626,668`)
- [x] T016 K5 — replace the one remaining `new Menu()` with `createOwnedMenuForEvent`
      (`src/views/calendar-timeline-renderer.ts:959`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T017 A permanent `sheet-grammar` lane row per stacked pair — parent+child, mounted through the
      constructed seam on a phone page — each observed **red first** (`tools/live/sheet-grammar.mjs`)
- [x] T018 A stacking negative control: remove the parent's dim on one registered pair, require that
      row red and every other row green, restore, require green (`tools/live/sheet-grammar.mjs`)
- [x] T019 One depth-3 row registered — record sheet → owned menu → submenu, or Properties → modal →
      dropdown — because a model tested only at depth 2 breaks at 3
- [x] T020 `npm run gate` exit 0 read from `$?` without a pipe; `npm run replay` holds with reversed 0
- [x] T021 Recapture and read by a person across both themes; `verify-placement.mjs` at its declared count
      — 550 captured, 7 content-changed and read, 19 byte-only reverted; `verify-placement` 370/373 with 3 declared reds
- [ ] T022 Release cut to GitHub and the iCloud vault, then the operator re-checks the three captures
      — **open. Ships in 0.0.24; nothing in this repository can close it**
- [x] T023 Update `checklist.md` "today" cells with the measured before-numbers and mark each row
      with its evidence
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]` — T022 open, and it is the operator's
- [x] No `[B]` blocked tasks remaining — D1 was the only block and it is ACCEPTED
- [ ] Manual verification passed — awaits the 0.0.24 device pass
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Inventory**: See `stacked-surface-inventory.md`
- **Criteria**: See `acceptance-criteria.md` and `checklist.md`
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

- [x] CHK-001 [P0] Requirements documented in spec.md — REQ-001 to REQ-008, four P0 and four P1
- [x] CHK-002 [P0] Technical approach defined in plan.md — one depth model in the stack, consumed by the mount
- [x] CHK-003 [P1] Dependencies identified and available — `044`'s lane green, `031`'s fix confirmed on 0.0.23, D1 open and scoped to the modal rows alone
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks
- [x] CHK-011 [P0] No console errors or warnings
- [x] CHK-012 [P1] Error handling implemented — a child whose parent is destroyed stays closable
- [x] CHK-013 [P1] Code follows project patterns — depth is asked of the stack, never computed by a surface
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete — the operator's three captures reproduced on iOS
- [x] CHK-022 [P1] Edge cases tested — depth 3, bare `.remove()`, parent rebuilt under an open child
- [x] CHK-023 [P1] Error scenarios validated — a popped-out window keeps its own stack
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Finding class recorded: **class-of-bug**. Three reports, one absent mechanism — no surface models depth
- [x] CHK-FIX-002 [P0] Same-class producer inventory: `rg -n "applySheetChrome|placeSheet|positionToolbarPopover" src/views` covers every path by which a surface becomes a sheet
- [x] CHK-FIX-003 [P0] Consumer inventory for `parentId`, `setSheetMount`, `setScrim`, `SHEET_KEYBOARD_INSET_VAR`
- [x] CHK-FIX-004 [P0] N/A — no security, path, parser or redaction surface. Recorded rather than silently skipped
- [x] CHK-FIX-005 [P1] Matrix axes listed: depth × opener kind × keyboard × parent kind, per `plan.md`
- [x] CHK-FIX-006 [P1] Hostile variant: a second document (popped-out window) with its own stack and its own scrim
- [x] CHK-FIX-007 [P1] Evidence pinned to a fix SHA, not a branch-relative range — `265f736f` model, `915591c2` migrations, `f1fffff2` lane
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] Input validation implemented — N/A, no input crosses a trust boundary here
- [x] CHK-032 [P1] Auth/authz working correctly — N/A, no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized
- [x] CHK-041 [P1] Code comments adequate — `keepSheetPlaced`'s recorded divergence updated to point at its fix
- [ ] CHK-042 [P2] README updated (if applicable)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only
- [x] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 11 | 10/11 |
| P1 Items | 15 | 14/15 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->

---
