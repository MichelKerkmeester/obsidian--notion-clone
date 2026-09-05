---
title: "Feature Specification: Anytype Adoption"
description: "The fourteen adoption items 047's research ranked against src/views, each designed from a real Anytype screen before it is written and closed on a threshold observed failing first."
trigger_phrases:
  - "anytype adoption spec"
  - "050 spec"
  - "adoption items"
  - "chip row"
  - "anytype ui ux"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Anytype Adoption

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

`047` spent twenty research iterations reading Anytype's client source and docs and came out with 89
findings and fourteen file-scoped adoption items, ranked by fit against `src/views/*`. The operator
read it and ruled: *"I find Anytype to have amazing UI/UX."* This phase lands those fourteen items.

**Key Decisions**: captures gate the work — nothing is implemented before T001 trues each design
against a real screen (D1); every item carries one threshold observed red first (D2); `044`'s sheet
grammar, `048`'s stacking model and the Project Manager 1:1 board and gantt parity are constraints
this phase may not regress (D4, D5).

**Critical Dependencies**: the Anytype capture sweep, still running. The first capture pass reached
**no mouse-driven surface at all**, so six of the fourteen items have no reference screen today.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-05 |
| **Branch** | `worktrees/069-anytype-adoption` |
| **Parent Spec** | ../spec.md |
| **Phase** | 50 of 50 |
| **Predecessor** | 047-competitor-references-and-pm-alignment |
| **Successor** | None |
| **Handoff Criteria** | `capture-alignment.md` exists with a trued-up design or a named gap for all fourteen items, every item's threshold has been observed red on the current tree, and one permanent lane row per item is green with its negative control seen failing |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 50** of the component surface program. `047` produced the research; this phase
consumes it. `047` stays the owner of the reference captures and of the Project Manager fidelity
pass for §4 rows 37/38 — this phase does not reopen either.

**Scope Boundary**: the fourteen items in `../047-competitor-references-and-pm-alignment/research/research.md`
§11 and nothing else. Anytype's data model is not adopted, its sidebar is not adopted, and the four
non-adoptions that document records stay non-adopted (goal D6).

**Dependencies**:
- `047-competitor-references-and-pm-alignment` — the ranked item list, the file scoping, and the
  capture sweep under `screenshots/anytype/` that D1 gates on.
- `044-phone-sheet-alignment` — the seven-element phone sheet grammar every new phone surface here
  must carry, and the `sheet-grammar` lane this phase adds rows to rather than replacing.
- `048-stacked-sheets` — the stacking model. Items 1, 6, 8 and 13 all open a surface that can sit
  over another one, so they are bound by it.
- `038-board-kanban-port` and `037-timeline-gantt-port` — the 1:1 Project Manager reference parity
  that item 3 works next to and may not move.

**Deliverables**:
- `capture-alignment.md` — one row per item: the Anytype screen it is designed against, or the gap.
- Fourteen implemented items across nine file-grouped legs.
- One permanent gate lane row per item, each observed red before green.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Our view surfaces work but do not cohere. A filter that is active looks the same as one that is
not; a new view drops you back on the board with no way to configure it; the board's scrollbar hides
below the fold on a tall board; there is no way to duplicate a view; scroll position is lost on every
switch; a cell editor near the right edge clips; a drag under an active sort silently loses the drop;
menus can render empty; the empty state cannot tell "no source" from "no matches"; and every new row
starts blank. Anytype solved each of these, and `047` located ours in `src/views/*` file by file.

### Purpose
Each of the fourteen surfaces behaves the way the operator saw in Anytype, on desktop and on the
phone, with the failing number that proved it was broken recorded beside the fix.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The fourteen adoption items of `047` §11, REQ-001 through REQ-014 below.
- `capture-alignment.md`: the design true-up against the Anytype capture sweep, which gates all of them.
- One permanent lane row per item, with its negative control.
- The phone expression of every item, or a recorded reason it has none.

### Out of Scope
- Anytype's data model — Objects, Types, Queries versus Collections. We are file-backed and
  single-user; adopting the model is a different program, not an item here.
- The four non-adoptions `047` recorded: cross-view drag that writes a property, sidebar widgets and
  live lenses, the full template system, and This-Object / Current-User dynamic filter values.
- The Project Manager fidelity pass for §4 rows 37/38 — that stays `047`'s.
- Anything in `044`, `048`, `003` or `016`. Their contracts are consumed unchanged.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/filter-panel-renderer.ts` | Modify | Chip surface and per-format condition rows (REQ-001, REQ-013) |
| `src/views/sort-panel-renderer.ts` | Modify | Leading direction-coloured sort chip (REQ-001, REQ-013) |
| `src/views/toolbar-renderer.ts` | Modify | Dual-mode filter and sort trigger icons, chip row host (REQ-001) |
| `src/views/database-view.ts` | Modify | Land in view settings after create or duplicate (REQ-002) |
| `src/views/view-config-panel-renderer.ts` | Modify | Settings entry point and per-view new-row presets (REQ-002, REQ-010) |
| `src/views/board-renderer.ts` | Modify | Sticky horizontal scrollbar with edge bleed; sort-conflict confirm (REQ-003, REQ-007) |
| `src/views/table-renderer.ts` | Modify | Sort-conflict confirm; `positionLock` while a name is being typed (REQ-007, REQ-011) |
| `src/views/active-view-controls-renderer.ts` | Modify | Duplicate view and the view-tab context menu (REQ-004) |
| `src/views/view-state-store.ts` | Modify | Per-view scroll-position restore (REQ-005) |
| `src/views/popover-position.ts` | Modify | Cell-editor anti-clip flip at the 92px threshold (REQ-006) |
| `src/views/row-menu.ts` | Modify | Capability gating, never-empty fallback, selection caps (REQ-008) |
| `src/views/bulk-edit-field-menu.ts` | Modify | The same gating for the bulk surface (REQ-008) |
| `src/views/empty-state-renderer.ts` | Modify | Two empty-state flavours plus the deleted-relation state (REQ-009) |
| `src/views/embedded-database-renderer.ts` | Modify | Measured toolbar collapse; inline "Load more" row (REQ-012, REQ-014) |
| `src/views/sheet-grammar.ts` | Modify | Gate the phone filter rows on our own grammar (REQ-013) |
| `styles.css` | Modify | Chip row, sticky scrollbar, collapse and empty-state rules — serialized by the parent's CSS lane |
| `capture-alignment.md` | Create | The T001 design true-up, one row per item |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

Requirement ids match `047` §11's item numbers so a reader can move between the two documents
without a mapping table. **Fit** is the research's own ranking and is what orders the work.

### P0 - Blockers (MUST complete)

| ID | Fit | Requirement |
|----|-----|-------------|
| REQ-000 | Gate | The capture sweep is read and every item below carries a design trued against a real Anytype screen, or a named gap where the sweep did not reach one. No item is implemented before this |
| REQ-001 | High | A filter/sort chip row: one leading direction-coloured sort chip, then filter chips, an add control and a clear-all, auto-hiding when empty — and toolbar filter and sort icons that are **dual-mode**, toggling existing chips when chips exist and opening the add-relation menu when none do |
| REQ-002 | High | Creating or duplicating a view lands directly in that view's settings, so a new view is configured rather than merely made |
| REQ-003 | High | The board's horizontal scrollbar is sticky to the viewport rather than to the bottom of the board, with edge bleed, so it is reachable on a board taller than the screen |
| REQ-004 | High | A view can be duplicated, and the view tab carries a context menu offering duplicate, rename and remove |
| REQ-006 | High | An open cell editor near the viewport's right edge flips to right-aligned instead of clipping |
| REQ-007 | High | A manual drag reorder while a sort is active asks before it commits, rather than dropping the row where the sort will immediately move it |
| REQ-008 | High | Context menu items are capability-gated per selection, with numeric selection caps and a never-empty fallback |
| REQ-009 | High | The empty state has two flavours — the view's source is missing, versus the source exists and nothing matches — plus a distinct state for a deleted group relation on a board |
| REQ-013 | High (mobile) | Filter and sort condition rows on phone sheets are per format, and every such sheet carries `044`'s seven grammar elements |

### P1 - Required (complete OR user-approved deferral)

| ID | Fit | Requirement |
|----|-----|-------------|
| REQ-005 | Med-high | Scroll position is remembered per view and restored on return |
| REQ-010 | Med-high | A view can carry default values for a new row, applied at creation — the adopted slice of Anytype's templates, and only that slice |
| REQ-011 | Med-high | A row being renamed in a sorted view holds its position until the edit commits, instead of jumping mid-keystroke |
| REQ-012 | Med-high | An embedded view's toolbar collapses by measuring its own natural width against the space available, not at a fixed breakpoint |

### P2 - Optional

| ID | Fit | Requirement |
|----|-----|-------------|
| REQ-014 | Medium | An embedded view pages with an inline "Load more" row instead of entering the virtualization path |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: All fourteen items carry a `capture-alignment.md` row naming the Anytype screen they
  were designed against, or the gap the sweep left.
- **SC-002**: Every threshold in `acceptance-criteria.md` was observed failing on the current tree
  before its item was written, and the failing figure is recorded in `checklist.md`.
- **SC-003**: `npm run gate` exits 0 read from `$?`, with one permanent row per item, and
  `npm run replay` holds with reversed 0.
- **SC-004**: The board and gantt reference captures against `screenshots/project-manager/` are
  `pixelHash`-identical to their pre-phase baseline, or the difference is operator-ruled.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | The Anytype capture sweep | Every item's design is unverified until it lands | D1 makes it a gate; the phase opens now so sequencing can proceed, and T001 is the only task that may run before it completes |
| Dependency | `044`'s `sheet-grammar` lane | REQ-013 has nowhere to register without it | The lane exists and is green at `7b976e28`; this phase adds rows, it does not build the lane |
| Dependency | `048`'s stacking model | Items 1, 6, 8 and 13 open surfaces that can sit over another | Consume `048`'s model where it has landed; where it has not, register the pair and leave the row red rather than shipping a second stacking mechanism |
| Risk | `styles.css` is 22,692 lines and two legs touch it | Merge collisions and silent overrides | The parent's serialized CSS lane owns this; one leg at a time, and the lane is read after each |
| Risk | Item 3 lands in `board-renderer.ts`, which carries the Project Manager 1:1 parity | A scrollbar change moves a reference capture | D5: recapture the board reference and compare `pixelHash` before the leg is called done |
| Risk | Six items have no reference screen and the sweep may not reach them either | A design invented rather than observed | D1's second clause: design from `047`'s code-derived findings and name the gap in the task, never guess at the screen |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: View settings are open within **100ms** of a view being created or duplicated
  (Anytype's own figure is ~50ms; ours is the budget, not the target).
- **NFR-P02**: Restoring a per-view scroll offset adds no measurable frame beyond the switch itself,
  and the restore lands within **±2px**.
- **NFR-P03**: The measured toolbar collapse reads its own width once per resize, not per frame.

### Security
- **NFR-S01**: No item introduces a network call, a credential, or a read outside the vault. Every
  one of the fourteen is local rendering and local view state.

### Reliability
- **NFR-R01**: An item that cannot resolve its state — a missing view config, a deleted relation —
  renders its declared empty or fallback state rather than throwing. REQ-008 and REQ-009 exist for
  exactly this case.

---

## 8. EDGE CASES

### Data Boundaries
- Empty input: a view with zero filters and zero sorts renders **no** chip row at all, not an empty
  one. A selection of zero rows opens no menu.
- Maximum length: a chip row wider than its container scrolls horizontally rather than wrapping; a
  selection above 10 disables the actions Anytype disables at that cap.

### Error Scenarios
- A view config referencing a deleted property: the chip renders inactive and the empty state takes
  its deleted-relation flavour, pointing at view settings.
- A duplicate that collides on name: the duplicate takes a suffixed name and a fresh id; it never
  reuses the source id.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 20/25 | 16 files, ~1500 LOC estimated; `recommend-level.sh --loc 1500 --files 16` → 51/100 |
| Risk | 12/25 | No auth, no API, no data model. The risk is fourteen edits inside surfaces that already carry reference parity |
| Research | 4/20 | The research is done and is `047`'s; what remains is the capture true-up |
| Multi-Agent | 6/15 | Nine file-grouped legs, sequential by rank |
| Coordination | 9/15 | Four upstream phases hold contracts this one consumes |
| **Total** | **51/100** | **Level 3** — raised from the script's Level 2 on judgment. Phase score **20/50** against a 25 threshold, so a standard child, not a phase parent |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | An item is designed from a guess because its Anytype surface was never captured | H | M | D1's gate, and a named gap per item in `capture-alignment.md` |
| R-002 | The board scrollbar change moves the `038` reference capture | H | L | Recapture and `pixelHash` compare before the leg closes (D5) |
| R-003 | Two legs touching `styles.css` collide | M | M | The parent's serialized CSS lane; one leg at a time |
| R-004 | REQ-010 grows into the full template system | M | M | D6 freezes it at the per-view new-row preset slice |
| R-005 | A phone surface added here bypasses `044`'s grammar or `048`'s stack | H | M | Every new phone surface registers a `sheet-grammar` row; REQ-013's threshold includes all seven elements |
| R-006 | An item ships green without ever having been red | H | M | D2, and `checklist.md` carries the failing figure per item before work starts |

---

## 11. USER STORIES

### US-001: The active state is visible (Priority: P0)

**As a** person looking at a filtered view, **I want** the filter I applied to be visible as a chip
and the toolbar icon to say that something is active, **so that** I can tell a filtered view from an
unfiltered one without opening a panel.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

### US-002: A new view is configurable at the moment it exists (Priority: P0)

**As a** person who just made a view, **I want** to land in its settings, **so that** I can shape it
while I still remember why I made it.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

### US-003: Nothing is lost silently (Priority: P1)

**As a** person moving between views and dragging rows, **I want** my scroll position kept, my drag
under a sort questioned, and my half-typed name held in place, **so that** the surface does not
quietly undo what I did.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

## 12. OPEN QUESTIONS

- Does the running capture sweep reach the six surfaces the first pass could not — the view
  switcher, a filter or sort panel with a condition open, an open cell editor, an object context
  menu, view settings, and the per-view template control? If it does not, six items ship on
  code-derived design and that should be an operator-visible fact rather than a footnote.
- REQ-005 and REQ-011 have no visual reference and probably need none. Confirm at T001 rather than
  leaving them unstated.
- Does REQ-003's sticky scrollbar belong to the board only, or to every horizontally scrolling
  surface we have? Anytype scopes it to the board; our table scrolls horizontally too.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Packet Goal**: See `goal.md`
- **Research Source**: See `../047-competitor-references-and-pm-alignment/research/research.md` §11
