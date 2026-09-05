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
this phase may not regress (D4, D5). **Where a capture and the research disagree, the capture decides
and the contradiction is named** (ADR-003).

**Critical Dependencies**: the Anytype capture sweep, **complete and read at T001**. It landed 151
files — 120 catalogue-set captures across ten use cases, six layouts and both themes, plus the view
settings, layout, filter, property, value, type-picker and object-context surfaces, and 20 official
mobile images. `design-trueup.md` is the read.

**What the read changed.** Seven of `047`'s source-derived claims do not hold in the shipped 0.56.5
build, and six of this packet's "today" premises do not hold against the current tree. Five items
have no reference screen at all — REQ-005, REQ-006, REQ-007, REQ-011, REQ-013 — and carry their gap.
Six thresholds are restated so they can be observed red at all (ADR-004).

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
| **Handoff Criteria** | `design-trueup.md` exists with a trued-up design or a named gap for all fourteen items, every item's threshold has been observed red on the current tree, and one permanent lane row per item is green with its negative control seen failing |
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
- `design-trueup.md` — one row per item: the Anytype screen it is designed against, or the gap.
- Fourteen implemented items across nine file-grouped legs.
- One permanent gate lane row per item, each observed red before green.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Our view surfaces work but do not cohere. A new view drops you back on the board with no way to
configure it; the board's scrollbar hides below the fold on a tall board; a single view cannot be
duplicated; scroll position is lost on every switch; a cell editor near the right edge clips; a drag
under an active sort silently loses the drop; the bulk field menu can render empty; a board whose
group relation was deleted has no state of its own; a row jumps mid-keystroke in a sorted view; an
embedded toolbar overflows rather than collapsing; and a new row starts blank.

**Three complaints in the original statement did not survive T001** and are removed rather than
left to be discovered: an active filter does **not** look the same as an inactive one (the chip row
and the count badge both ship), the row menu cannot render empty (its first row is unconditional),
and the empty state distinguishes far more than "no source" from "no matches" (twelve reasons).
`design-trueup.md` §4 carries the evidence for each.

### Purpose
Each of the fourteen surfaces behaves the way the operator saw in Anytype, on desktop and on the
phone, with the failing number that proved it was broken recorded beside the fix.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The fourteen adoption items of `047` §11, REQ-001 through REQ-014 below.
- `design-trueup.md`: the design true-up against the Anytype capture sweep, which gates all of them.
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
| `src/views/toolbar-renderer.ts` | Assert | The count badge and the chip row host already ship; a lane row guards them. Anytype's dual-mode icons are not adopted (REQ-001) |
| `src/views/database-view.ts` | Modify | Land in view settings after create or duplicate (REQ-002) |
| `src/views/view-config-panel-renderer.ts` | Modify | Settings entry point and per-view new-row presets (REQ-002, REQ-010) |
| `src/views/board-renderer.ts` | Modify | Sticky horizontal scrollbar, 10px tall and 8px above the viewport bottom; sort-conflict confirm (REQ-003, REQ-007) |
| `src/views/table-renderer.ts` | Modify | Sort-conflict confirm; `positionLock` while a name is being typed (REQ-007, REQ-011) |
| `src/views/active-view-controls-renderer.ts` | Assert | The chip row already ships here; a lane row guards it (REQ-001). Duplicate and Remove move to `view-config-panel-renderer.ts`, where the capture puts them (REQ-004) |
| `src/views/view-state-store.ts` | Modify | Per-view scroll offset, wired to `database-viewport.ts`'s existing snapshot rather than a second one (REQ-005) |
| `src/views/popover-position.ts` | Modify | Cell-editor anti-clip flip at the 92px threshold (REQ-006) |
| `src/views/row-menu.ts` | Assert | Capability gating and the never-empty guarantee already hold; a lane row guards them. Selection caps are not adopted (REQ-008) |
| `src/views/bulk-edit-field-menu.ts` | Modify | The never-empty fallback this file lacks — `:31-45` maps a possibly empty column set straight into `options` (REQ-008) |
| `src/views/empty-state-renderer.ts` | Modify | The deleted-group-relation state, which is the one of thirteen that does not exist; the other twelve are asserted (REQ-009) |
| `src/views/embedded-database-renderer.ts` | Modify | Measured toolbar collapse; inline "Load more" row (REQ-012, REQ-014) |
| `src/views/sheet-grammar.ts` | Assert | The filter and sort sheets are already registered; the residue is the three elements a still capture cannot show (REQ-013) |
| `styles.css` | Modify | Chip row, sticky scrollbar, collapse and empty-state rules — serialized by the parent's CSS lane |
| `design-trueup.md` | Created | The T001 design true-up, one section per item |
| `decision-record.md` | Created | ADR-003 capture over research, ADR-004 threshold restatement, ADR-005 adopted geometry and refused contrast |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

Requirement ids match `047` §11's item numbers so a reader can move between the two documents
without a mapping table. **Fit** is the research's own ranking and is what orders the work.

### P0 - Blockers (MUST complete)

Every row below was trued against the sweep at T001. **Design detail, provenance and the residue that
is actually absent are in `design-trueup.md` §3**, one section per requirement; the wording here is
the requirement, not the design.

| ID | Fit | Requirement |
|----|-----|-------------|
| REQ-000 | Gate | The capture sweep is read and every item below carries a design trued against a real Anytype screen, or a named gap where the sweep did not reach one. No item is implemented before this. **Satisfied by `design-trueup.md`** |
| REQ-001 | High | An active filter or sort is legible without opening a panel, on the view surface and in the view's settings. The chip row and the trigger-count badge already ship and are asserted rather than built; the residue is the `N applied` count in the settings panel's value column. **The captured build does neither** — no chip row on any of 151 captures and pixel-identical trigger icons in every state — so Anytype's dual-mode icons are not adopted (`design-trueup.md` C1, C2) |
| REQ-002 | High | Creating or duplicating a view lands directly in that view's settings, so a new view is configured rather than merely made. The panel is 360px wide with 28px rows, an 8px radius and 16px horizontal padding, and it gains one `Groups` row on a board — all measured |
| REQ-003 | High | The horizontal scrollbar of **every horizontally scrolling view surface** — board and table both — is sticky to the viewport rather than to the bottom of the content: 10px tall, its bottom edge 8px above the viewport's, spanning the container's full content width with no gutter inset. The capture shows the grid carrying this at identical geometry to the board, so it is not a board affordance (`design-trueup.md` C3) |
| REQ-004 | High | A view can be duplicated, and **Duplicate view and Remove view live in the view-settings panel's last section**, where the capture puts them. A view-tab context menu is design inferred from source code, not seen, and is built only if wanted (`design-trueup.md` C4) |
| REQ-006 | High | An open cell editor near the viewport's right edge flips to right-aligned instead of clipping. Two criteria: the 92px trigger boundary, which is source-derived and unphotographed, and — the one that decides the item — no open editor's right edge exceeding the viewport's |
| REQ-007 | High | A manual drag reorder while a sort is active asks before it commits, rather than dropping the row where the sort will immediately move it. It gates on the existing `isExplicitlySorted(config)` predicate, not a second one |
| REQ-008 | High | Menus are capability-gated and never empty. `row-menu.ts`'s guarantee is asserted so it cannot regress; `bulk-edit-field-menu.ts` gains the fallback it lacks. Anytype's numeric selection caps are **not adopted** — our row menu has no multi-select, so they have no referent |
| REQ-009 | High | The empty state distinguishes a missing source from a present source with no matches — twelve reasons already do, and the mapping is asserted — **plus the one state that does not exist**: a board whose group relation was deleted, pointing at view settings |
| REQ-013 | High (mobile) | Filter and sort condition rows on phone sheets are per format — already shipped on both viewports — and every such sheet carries **all seven** of `044`'s grammar elements. The residue is the three a still capture cannot show: segmented choices, keyboard avoidance, safe-area inset. No Anytype phone filter surface exists in the sweep |

### P1 - Required (complete OR user-approved deferral)

| ID | Fit | Requirement |
|----|-----|-------------|
| REQ-005 | Med-high | Scroll position is remembered per view and restored on return, within ±2px. It **wires `database-viewport.ts`'s existing snapshot into per-view state**; it does not build a second snapshot mechanism |
| REQ-010 | Med-high | A view can carry default **field values** for a new row, applied at creation. A per-view status preset and a per-database template already ship, so field values are the whole residue. The captured settings panel has **no** per-view default-template row in either form, contradicting `047` §8 (`design-trueup.md` C7) |
| REQ-011 | Med-high | A row being renamed in a sorted view holds its position until the edit commits or blurs, then repositions exactly once, instead of jumping mid-keystroke |
| REQ-012 | Med-high | An embedded view's toolbar collapses by dropping whole controls in a stated order — icon cluster before the `New` button, tab row to a dropdown before either — driven by a measured natural-width comparison rather than a fixed breakpoint. Only the end state is captured; the mechanism is source-derived |

### P2 - Optional

| ID | Fit | Requirement |
|----|-----|-------------|
| REQ-014 | Medium | An embedded view honours a per-view page limit — **60 rows, Anytype's own captured default** — and renders an inline "Load more" row past it. The original "instead of entering the virtualization path" clause becomes a regression guard: no virtualization exists in `src/views` today, so it cannot be entered |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: All fourteen items carry a `design-trueup.md` row naming the Anytype screen they
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
| ~~Dependency~~ | ~~The Anytype capture sweep~~ | **Closed.** The sweep landed 151 files and T001 read it | `design-trueup.md`; D1's gate is satisfied and T002 may proceed |
| Risk | Six thresholds asserted a failing value the tree does not have | An item "observed red" against a condition nobody can produce, or a threshold quietly softened mid-phase — either way D2's guarantee is gone | ADR-004 restates all six; T002 measures the restated form |
| Risk | Three of `047`'s claims describe behaviour the shipped build does not have | A design copied from a screen nobody saw | ADR-003; every contradiction is in `design-trueup.md` §1 and this spec cites that table rather than the research |
| Dependency | `044`'s `sheet-grammar` lane | REQ-013 has nowhere to register without it | The lane exists and is green at `7b976e28`; this phase adds rows, it does not build the lane |
| Dependency | `048`'s stacking model | Items 1, 6, 8 and 13 open surfaces that can sit over another | Consume `048`'s model where it has landed; where it has not, register the pair and leave the row red rather than shipping a second stacking mechanism |
| Risk | `styles.css` is 22,692 lines and two legs touch it | Merge collisions and silent overrides | The parent's serialized CSS lane owns this; one leg at a time, and the lane is read after each |
| Risk | Item 3 lands in `board-renderer.ts`, which carries the Project Manager 1:1 parity | A scrollbar change moves a reference capture | D5: recapture the board reference and compare `pixelHash` before the leg is called done |
| Risk | Five items have no reference screen — REQ-005, REQ-006, REQ-007, REQ-011, REQ-013 | A design invented rather than observed | D1's second clause, discharged: each is marked *design inferred from source code, not seen* in `design-trueup.md` §4, and two of the five need no screen at all |
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
| R-001 | An item is designed from a guess because its Anytype surface was never captured | H | M | D1's gate, and a named gap per item in `design-trueup.md` |
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

All three of this section's questions were answered at T001. They are kept with their answers rather
than deleted, because the answers are the reason several requirements above changed shape.

- **Did the sweep reach the six surfaces the first pass could not?** Partly. It reached the view
  switcher, view settings, the layout picker, the filter panel, the property and value pickers, the
  relation editor, the type picker and the object context menu. It did **not** reach a view-tab
  right-click, an open cell editor near an edge, a drag under an active sort, or any phone filter
  surface. Five items therefore ship on code-derived design and are named as such in
  `design-trueup.md` §4: REQ-005, REQ-006, REQ-007, REQ-011, REQ-013.
- **Do REQ-005 and REQ-011 need a visual reference?** No. Both are behaviour over time and no still
  can show either. Their tasks stop carrying a capture field.
- **Does REQ-003's sticky scrollbar belong to the board only?** No. The grid carries it at the same
  y, the same 10px height, the same colours and the same full-width track as the kanban, in the same
  window. It is a dataview affordance and REQ-003 is rescoped to every horizontally scrolling surface.

### Opened by the read

- **Should the view-tab context menu be built at all?** It was never captured, its actions are in the
  settings panel where the capture puts them, and a right-click has no phone equivalent. REQ-004 now
  delivers the actions without it. Building the menu is an operator call, not a gap.
- **`047` §5, §6, §8 and §9 now contain four claims that do not hold in 0.56.5.** `047` is closed and
  is not reopened (ADR-003). A reader of the research alone will still read them as true.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Packet Goal**: See `goal.md`
- **Research Source**: See `../047-competitor-references-and-pm-alignment/research/research.md` §11
