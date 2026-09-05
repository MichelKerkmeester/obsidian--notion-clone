---
title: "Task Breakdown: Anytype Adoption"
description: "T001 reads the capture sweep and trues up all fourteen designs; every task after it carries one threshold, the red-first proof for it, and the Anytype capture it was designed against."
trigger_phrases:
  - "task breakdown"
  - "050 tasks"
  - "adoption tasks"
  - "capture true-up"
importance_tier: "high"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Task Breakdown: Anytype Adoption

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

Every implementation task below carries three things: the **threshold** it closes on, the
**red-first proof** that threshold was seen failing, and the **capture** its design was trued
against. A task missing any of the three is not ready to start.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 [P0] **Read the Anytype capture sweep and true up every item's design against the real
      screens.** One row per item in a new `capture-alignment.md`: the capture file it is designed
      against, what that screen actually shows, how our target surface differs, and — where the
      sweep did not reach the surface — the `047` finding standing in for it and the gap stated
      plainly. Today's `screenshots/anytype/README.md` records that the first pass reached no view
      switcher, no filter or sort panel with a condition open, no property editor, no context menu
      and no hover state, so expect gaps for REQ-001, REQ-004, REQ-006, REQ-007, REQ-008 and
      REQ-010 unless the sweep closed them. **This task gates every other task in this packet**
      (goal D1) (`capture-alignment.md`)
- [ ] T002 [P0] Run each threshold in `acceptance-criteria.md` against the current tree and write
      the observed failing figure into `checklist.md`. A threshold that cannot be made to fail is
      not a threshold and is sent back to T001 (goal D2) (`checklist.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Ordered by leg, and legs ordered by their best fit rank. A leg opens its files once (goal D7).

### L1 — toolbar, filter and sort panels, sheet grammar, styles.css

- [ ] T003 [B] [P0] **REQ-001 — the chip row and dual-mode trigger icons.** One row: leading
      direction-coloured sort chip, then filter chips, then add and clear-all; the row auto-hides
      when both are empty. The toolbar's filter and sort icons toggle the chips when chips exist and
      open the add-relation menu when none do.
      **Threshold:** the chip row is present whenever a filter or a sort is active and absent when
      neither is, and each trigger icon reports a state that changes with that condition.
      **Red first:** assert both on the current tree, where there is no chip row and the icons have
      one state.
      **Capture:** `anytype-collection-fullpage-onboarding-dark.png` for toolbar anatomy;
      `anytype-table-official.jpg` for the chip row in place. Chip anatomy with a condition open was
      **not captured** in the first pass — T001 says whether the sweep closed that
      (`src/views/toolbar-renderer.ts`, `src/views/filter-panel-renderer.ts`,
      `src/views/sort-panel-renderer.ts`, `styles.css`)
- [ ] T004 [B] [P0] **REQ-013 — per-format filter and sort condition rows on phone sheets.** One
      condition row shape per property format we support, rendered inside a sheet that carries
      `044`'s grammar.
      **Threshold:** every supported format renders its own condition row, and each such sheet
      passes all seven `sheet-grammar` elements.
      **Red first:** register the sheet in the `sheet-grammar` lane before the rows exist and observe
      the row red.
      **Capture:** none — the capture set is desktop-only and dark-only, and `047` §10's Android
      findings came from `anytype-kotlin` source rather than a screen. Code-derived by declaration
      (`src/views/filter-panel-renderer.ts`, `src/views/sort-panel-renderer.ts`,
      `src/views/sheet-grammar.ts`)

### L2 — database-view, view-config-panel-renderer

- [ ] T005 [B] [P0] **REQ-002 — land in view settings after a view is created or duplicated.**
      **Threshold:** the view-settings surface is open within **100ms** of the create or duplicate
      completing (Anytype's own figure is ~50ms; 100ms is our budget).
      **Red first:** measure the current tree, where nothing opens at all, and record "never" as the
      failing value.
      **Capture:** `anytype-inlinecollection-onboarding2-dark.png` ("Views — adjust rules and
      views") shows the intent; the settings panel itself was **not captured**
      (`src/views/database-view.ts`, `src/views/view-config-panel-renderer.ts`)
- [ ] T006 [B] [P1] **REQ-010 — per-view new-row default presets.** The adopted slice of templates
      and only that slice (ADR-002, goal D6).
      **Threshold:** a row created in a view carrying presets has every preset value applied at
      creation; a view with no presets produces a new row byte-identical to today's.
      **Red first:** assert the applied values on the current tree, where no preset can be stored.
      **Capture:** `anytype-newpage-created-dark.png` shows the Template Selector affordance; the
      per-view default control itself was **not captured**
      (`src/views/view-config-panel-renderer.ts`)

### L3 — board-renderer, table-renderer, styles.css

- [ ] T007 [B] [P0] **REQ-003 — sticky horizontal board scrollbar with edge bleed.**
      **Threshold:** while the board is taller than the viewport, the horizontal scrollbar is
      positioned at the **viewport** bottom and is visible without scrolling the page to the board's
      end.
      **Red first:** measure the scrollbar's position against the viewport on a board taller than the
      viewport, where today it sits at the board's own bottom and is off-screen.
      **Capture:** `anytype-board-official.jpg`.
      **Constraint:** goal D5 — recapture `screenshots/project-manager/` board reference and prove
      `pixelHash` unchanged before this task closes
      (`src/views/board-renderer.ts`, `styles.css`)
- [ ] T008 [B] [P0] **REQ-007 — sort-conflict confirmation on manual drag reorder.**
      **Threshold:** a drag reorder while a sort is active raises a confirmation; declining leaves
      the order and the sort untouched; accepting clears the sort and commits the drop.
      **Red first:** drag under an active sort on the current tree and record that the drop is
      accepted and then silently undone by the sort.
      **Capture:** none — the sort panel with a condition open was **not captured**. `047` §5's board
      drag vocabulary stands in
      (`src/views/board-renderer.ts`, `src/views/table-renderer.ts`)
- [ ] T009 [B] [P1] **REQ-011 — `positionLock` while a name is being typed in a sorted view.**
      **Threshold:** the edited row's index does not change while typing, and repositions exactly
      once on commit or blur.
      **Red first:** type into a sorted view on the current tree and record the row index changing
      mid-keystroke.
      **Capture:** none needed; this is behavior, not appearance, and `047` §8 names the mechanism
      (`src/views/table-renderer.ts`)

### L4 — active-view-controls-renderer

- [ ] T010 [B] [P0] **REQ-004 — duplicate view, and a view-tab context menu.**
      **Threshold:** duplicating a view yields a config equal to the source on every field except
      `id` and the name suffix, with a **new** id; the tab's context menu offers duplicate, rename
      and remove.
      **Red first:** assert the duplicate exists at all on the current tree, where the action does
      not.
      **Capture:** none — the view tab row and its right-click menu were **not captured**. `047` §5's
      toolbar anatomy stands in
      (`src/views/active-view-controls-renderer.ts`)

### L5 — view-state-store

- [ ] T011 [P1] **REQ-005 — per-view scroll-position restore.** Off the critical path; may start
      before T001 completes, since no capture is expected.
      **Threshold:** leaving a view at a known offset and returning restores it within **±2px**, per
      view and independently per view.
      **Red first:** record the current tree returning to 0 on every switch.
      **Capture:** none needed; behavior, not appearance
      (`src/views/view-state-store.ts`)

### L6 — popover-position and the cell editors

- [ ] T012 [B] [P0] **REQ-006 — cell-editor anti-clip flip near the right edge.**
      **Threshold:** an editor whose anchor is within **92px** of the viewport's right edge renders
      right-aligned, and no open editor's right edge exceeds the viewport's.
      **Red first:** open an editor in the rightmost column on the current tree and record the
      clipped width.
      **Capture:** none — no open cell editor was captured. The 92px figure is `047` §5's, read from
      `anytype-ts`
      (`src/views/popover-position.ts`, the cell editors)

### L7 — row-menu, bulk-edit-field-menu

- [ ] T013 [B] [P0] **REQ-008 — capability-gated menus with a never-empty fallback and selection
      caps.**
      **Threshold:** menu item count is **≥ 1** in every capability state — the fully-restricted case
      renders a "No available actions" row rather than an empty menu; a selection greater than 1
      disables open and link; greater than 10 disables open-in-new-tab.
      **Red first:** drive a fully-restricted selection on the current tree and record the empty
      menu.
      **Capture:** none — `objectContext` and its four sections were **not captured**. `047` §9
      stands in
      (`src/views/row-menu.ts`, `src/views/bulk-edit-field-menu.ts`)

### L8 — empty-state-renderer

- [ ] T014 [B] [P0] **REQ-009 — two empty-state flavours plus the deleted-relation state.**
      **Threshold:** a missing or deleted source renders the "target" flavour; a present source with
      zero matches renders the "view" flavour; a board whose group relation was deleted renders its
      own state pointing at view settings. Each carries its per-layout add affordance.
      **Red first:** drive both conditions on the current tree and record that they render the same
      thing.
      **Capture:** `anytype-inlinecollection-empty-dark.png` for the "view" flavour and its
      `+ New Object` row. The "target" flavour and the deleted-relation state were **not captured**
      (`src/views/empty-state-renderer.ts`)

### L9 — embedded-database-renderer

- [ ] T015 [B] [P1] **REQ-012 — measured toolbar "small" collapse for embedded views.**
      **Threshold:** the collapse is driven by measured natural width against available width, not a
      fixed breakpoint, and no toolbar control overflows its container at any width from **250px**
      upward.
      **Red first:** sweep the widths on the current tree and record the first overflow.
      **Capture:** `anytype-page-with-inline-collection-dark.png` and
      `anytype-inlinecollection-empty-dark.png` show the inline surface; the collapsed state itself
      was **not captured**
      (`src/views/embedded-database-renderer.ts`)
- [ ] T016 [B] [P2] **REQ-014 — inline "Load more" row instead of virtualization for embedded
      views.**
      **Threshold:** an embedded view renders its page of rows plus a "Load more" row and never
      enters the virtualization path.
      **Red first:** assert the virtualization path is entered today for an embedded view.
      **Capture:** `anytype-inlinecollection-empty-dark.png`, `anytype-collection-grid-populated-dark.png`
      (`src/views/embedded-database-renderer.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T017 [P0] One permanent lane row per item under `tools/live/`, each with its negative control
      observed **red** before green, and every other row staying green while it is red
- [ ] T018 [P0] `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0, status read from `$?` and never
      through a pipe; `npm run replay` holds with reversed 0
- [ ] T019 [P0] Recapture the `screenshots/project-manager/` board and gantt references and prove
      `pixelHash` unchanged against the pre-phase baseline, or take the difference to the operator
      (goal D5)
- [ ] T020 [P0] **The operator opens the board and a table on iOS and on desktop and reads the
      adopted surfaces.** Not tickable by an agent (goal D8)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`, or deferred with a recorded reason
- [ ] No `[B]` blocked tasks remaining — T001 has released them
- [ ] Every row in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`, and each waiver names
      an ADR that exists in this packet
- [ ] Every `checklist.md` criterion carries both its failing figure and its passing one
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Checklist**: See `checklist.md`
- **Goal**: See `goal.md`
- **Research source**: `../047-competitor-references-and-pm-alignment/research/research.md` §11
- **Capture index**: `../../../screenshots/anytype/README.md`
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

Exit statuses are read from `$?`, never through a pipe. A criterion closes on a number that was
read, never on a command that was merely run.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] VER-001 [P0] T001 is complete and `capture-alignment.md` carries fourteen rows
- [ ] VER-002 [P0] Every threshold has been observed failing and its figure is in `checklist.md`
- [x] VER-003 [P0] The level is derived, not guessed — `recommend-level.sh --loc 1500 --files 16` →
      51/100, confidence 90%, Level 2, raised to Level 3 on judgment; phase score 20/50 against a
      threshold of 25, so a standard child
- [x] VER-004 [P0] What may not change is recorded: `044`'s grammar, `048`'s stacking model, `003`'s
      portal, and `038`/`037`'s reference parity (`spec.md` §3 Out of Scope, `goal.md` D4 and D5)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] VER-010 [P0] Each leg is one commit touching one file group; no leg opens a file another leg
      owns, `styles.css` excepted and serialized by the parent's CSS lane
- [ ] VER-011 [P0] No item introduces a new architecture layer — every one lands in an existing
      renderer or store, as `047` verified before ranking them
- [ ] VER-012 [P1] The chip surface has one owner (`toolbar-renderer.ts`) rather than two panels
      writing competing rows (ADR-001)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] VER-020 [P0] Every item's threshold was observed red on the current tree before the item was
      written
- [ ] VER-021 [P0] Every item's negative control was observed red after it was green
- [ ] VER-022 [P1] Unit coverage for the pure behavior: duplicate-config equality, scroll-offset
      arithmetic, the capability predicate
- [ ] VER-023 [P1] Both viewports exercised per item, or the absence of a phone expression recorded
      with its reason (goal D3)
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] VER-030 [P0] All fourteen items are addressed — implemented, waived by an ADR, or deferred
      with the operator's agreement. Fourteen is the whole list `047` produced and a partial landing
      is a partial phase
- [ ] VER-031 [P0] The six items with no reference screen carry their gap in `capture-alignment.md`
      rather than an invented design
- [ ] VER-032 [P1] The four non-adoptions stayed non-adopted (goal D6)
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] VER-040 [P0] No item adds a network call, a credential, or a read outside the vault
- [ ] VER-041 [P1] The per-view preset map stores no user content beyond the field defaults the
      operator typed into it
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] VER-050 [P1] `capture-alignment.md` is complete and readable on its own
- [ ] VER-051 [P1] The changelog entry names the adopted slice of templates and says the rest was
      deliberately not built (ADR-002)
- [ ] VER-052 [P1] The parent's `roadmap.md` §5.A row and `goal.md` DONE table reflect this phase's
      state at close
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] VER-060 [P1] Every file changed appears in `spec.md` §3 Files to Change, and nothing outside it
      was touched
- [ ] VER-061 [P1] `capture-alignment.md` lives in this packet, not in `047`, whose captures it reads
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 19 | 2/19 |
| P1 Items | 15 | 0/15 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-05
<!-- /ANCHOR:summary -->
