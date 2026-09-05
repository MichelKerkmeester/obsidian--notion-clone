---
title: "Implementation Plan: Anytype Adoption"
description: "Nine file-grouped legs ordered by the research's fit ranking, each opened only after the capture sweep has trued its items' designs, each closed on a threshold observed red first."
trigger_phrases:
  - "implementation plan"
  - "050 plan"
  - "adoption legs"
  - "anytype adoption plan"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Anytype Adoption

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

Fourteen items, sixteen files, no new architecture — `047` verified that against this repo before it
ranked them. Every item lands inside a renderer or a state store we already have.

Two things shape the order. First, **the captures gate everything** (goal D1): the research is
code-derived and the first capture pass reached no mouse-driven surface, so six items have no
reference screen and T001 is the only task that may run before the sweep completes. Second, **one
leg touches one file** (goal D7): items are grouped by the file they land in and each group is
opened once, so `toolbar-renderer.ts` is not edited three times by three items.

### Overview

Nine legs, ordered by the best fit rank inside each. A leg carries every item that lands in its
files, which pulls REQ-011, REQ-013 and REQ-014 forward into their file's leg rather than leaving a
second pass over the same file later. `styles.css` is the one file more than one leg reaches; the
parent's serialized CSS lane owns it.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- `capture-alignment.md` has a row for the item: the Anytype screen it is designed against, or the
  gap the sweep left and the `047` finding standing in for it.
- The item's threshold in `acceptance-criteria.md` has been run on the current tree and **observed
  failing**, with the figure written into `checklist.md`.
- The item's phone expression is stated, or its absence is stated with a reason.

### Definition of Done
- The threshold passes, and the negative control for it was observed red.
- The item's lane row is permanent and green; `npm run gate` exits 0 read from `$?`.
- `044`'s seven grammar elements hold on any phone surface the item added or changed.
- For any leg touching `board-renderer.ts`: the `screenshots/project-manager/` board reference is
  `pixelHash`-identical to its pre-leg baseline (goal D5).
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Additive, per surface. Nothing here introduces a new layer: the chip row is a child of the existing
toolbar node, the sticky scrollbar is a positioning change inside the board renderer, scroll restore
is two fields on the existing per-view state, and the presets are additive keys on the view config
that an absent value leaves exactly as today.

### Key Components

- **Chip surface** — one row serving both sorts and filters, hosted by `toolbar-renderer.ts` and fed
  by `filter-panel-renderer.ts` and `sort-panel-renderer.ts`. It is a per-view toggle that renders
  nothing when there is nothing to show.
- **View lifecycle hook** — `database-view.ts` gains one post-create continuation that opens the
  config panel; duplication reuses it.
- **Per-view state** — `view-state-store.ts` carries the scroll offset; `view-config-panel-renderer.ts`
  carries the new-row preset map. Both are read at render and are absent-safe.
- **Placement** — `popover-position.ts` gains one edge-proximity branch at 92px, shared by every
  cell editor rather than reimplemented per editor.
- **Menu capability gate** — one predicate consulted by `row-menu.ts` and `bulk-edit-field-menu.ts`,
  with the never-empty fallback as its terminal case.

### Data Flow

View config → renderer → chip row and empty state. Nothing new is persisted except the per-view
new-row preset map, and a view without one behaves byte-identically to today.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

The legs, in execution order. A leg's rank is the best fit rank among its items, which is what
orders them; the items in parentheses are the ones the file grouping pulls along.

| Leg | Files | Items | Best rank |
|-----|-------|-------|-----------|
| L1 | `toolbar-renderer.ts`, `filter-panel-renderer.ts`, `sort-panel-renderer.ts`, `sheet-grammar.ts`, `styles.css` | REQ-001, (REQ-013) | 1 |
| L2 | `database-view.ts`, `view-config-panel-renderer.ts` | REQ-002, (REQ-010) | 2 |
| L3 | `board-renderer.ts`, `table-renderer.ts`, `styles.css` | REQ-003, REQ-007, (REQ-011) | 3 |
| L4 | `active-view-controls-renderer.ts` | REQ-004 | 4 |
| L5 | `view-state-store.ts` | REQ-005 | 5 |
| L6 | `popover-position.ts` + the cell editors | REQ-006 | 6 |
| L7 | `row-menu.ts`, `bulk-edit-field-menu.ts` | REQ-008 | 8 |
| L8 | `empty-state-renderer.ts` | REQ-009 | 9 |
| L9 | `embedded-database-renderer.ts` | REQ-012, REQ-014 | 12 |

**Why REQ-007 sits in L3 rather than in its own leg.** It lands in both `board-renderer.ts` and
`table-renderer.ts`, and both files belong to L3 anyway. Splitting it would open each file twice,
which D7 exists to prevent.

**Why REQ-013 rides with L1.** Its condition rows are the same rows L1 builds, rendered inside a
phone sheet. Building them twice would produce two vocabularies for one concept.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Setup is T001 alone — the capture read and the design true-up — and it gates every other task.
Implementation is the nine legs in the order above. Verification is the lane rows, the gate, the
replay, and the operator's read on device.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

- **Red first, per item.** Every threshold is run against the current tree and observed failing
  before the item is written. A threshold that cannot be made to fail is not a threshold.
- **Negative control per item.** After the item is green, the mechanism is removed or inverted and
  the row is required to go red again, so the check is proven to be reading the production path.
- **Unit** where the behavior is pure — the duplicate-config equality of REQ-004, the scroll-offset
  arithmetic of REQ-005, the capability predicate of REQ-008.
- **Lane rows** where the behavior is rendered — the chip row, the sticky scrollbar, the editor
  flip, the empty-state flavours, the phone grammar.
- **Reference parity** for any leg touching `board-renderer.ts`, per goal D5.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

- `047`'s research §11 — the item list, the fit ranking, the file scoping.
- `screenshots/anytype/` — the capture sweep. Blocking, by D1.
- `044`'s `sheet-grammar` lane and its seven elements.
- `048`'s stacking model, for the four items that open a surface over another.
- `038` / `037` reference captures under `screenshots/project-manager/`, as a constraint.
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Every leg is additive and independently revertible. A leg is one commit touching one file group, so
reverting it restores the prior surface without touching the other thirteen items.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Leg | Depends on | Why |
|-----|-----------|-----|
| L1 | T001 | REQ-001's chip anatomy and REQ-013's per-format rows both need the panel screens the first pass never reached |
| L2 | T001, L1 | The settings panel L2 opens is where L1's chips are configured from |
| L3 | T001 | REQ-003's edge bleed is visible in `anytype-board-official.jpg`; REQ-007's confirm is not, and needs the sweep |
| L4 | T001 | The view-tab context menu was never captured |
| L5 | — | Code-derived; no reference screen is expected |
| L6 | T001 | The 92px figure is from source; the flipped editor was never captured |
| L7 | T001 | The four-section `objectContext` menu and its caps were never captured |
| L8 | T001 | One flavour is visible in `anytype-inlinecollection-empty-dark.png`; the other is not |
| L9 | T001 | The inline collection is captured; the collapsed toolbar state is not |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Leg | Items | Estimated LOC | Note |
|-----|-------|---------------|------|
| T001 | Gate | ~150 (doc) | `capture-alignment.md`, fourteen rows |
| L1 | 2 | ~430 | The largest; a new chip surface plus phone condition rows |
| L2 | 2 | ~180 | One continuation, one preset map |
| L3 | 3 | ~270 | Sticky scrollbar, two-file confirm, `positionLock` |
| L4 | 1 | ~120 | Duplicate plus a tab menu |
| L5 | 1 | ~60 | Two fields and a restore |
| L6 | 1 | ~50 | One edge-proximity branch |
| L7 | 1 | ~120 | Predicate, caps, fallback |
| L8 | 1 | ~90 | Two flavours plus the deleted-relation state |
| L9 | 2 | ~190 | Measured collapse and a "Load more" row |
| **Total** | **14** | **~1660** | Against the 1500 estimate the level was scored on |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- Every leg's lane row is green and its negative control was seen red.
- `npm run gate` exits 0 read from `$?`; `npm run replay` holds with reversed 0.
- The board reference capture is unchanged, or the change is operator-ruled.

### Rollback Procedure
1. Revert the leg's commit. Legs do not share files, so no other leg moves.
2. Re-run the gate; the reverted leg's row goes red and every other row stays green.
3. If `styles.css` was touched, re-read the serialized CSS lane before the next leg starts.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A. The one persisted addition is the per-view new-row preset map, and a
  view without one renders exactly as today, so removing the code leaves stored views readable.
<!-- /ANCHOR:enhanced-rollback -->

---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```text
T001  capture sweep read, fourteen designs trued up
 |
 +--> L1  toolbar + filter/sort + sheet-grammar   (REQ-001, REQ-013)
 |     |
 |     +--> L2  database-view + view-config       (REQ-002, REQ-010)
 |
 +--> L3  board + table                            (REQ-003, REQ-007, REQ-011)
 +--> L4  active-view-controls                     (REQ-004)
 +--> L6  popover-position + cell editors          (REQ-006)
 +--> L7  row-menu + bulk-edit-field-menu          (REQ-008)
 +--> L8  empty-state-renderer                     (REQ-009)
 +--> L9  embedded-database-renderer               (REQ-012, REQ-014)

L5  view-state-store  (REQ-005)  — no capture dependency, may start immediately
```

### Dependency Matrix

| From | To | Kind |
|------|----|------|
| T001 | L1, L2, L3, L4, L6, L7, L8, L9 | Blocking (goal D1) |
| L1 | L2 | Sequential — L2 opens the panel L1's chips configure |
| `044` | L1, L13 rows | Contract consumed unchanged |
| `048` | L1, L6, L7, L9 | Contract consumed unchanged |
| `038` | L3 | Constraint — parity may not move |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

T001 → L1 → L2 is the only chain longer than one node, and it is the critical path: the chip surface
must exist before the settings panel that configures it is worth landing in. Everything else fans out
from T001 and can be ordered by rank alone. L5 is off the path entirely and can run at any time,
which makes it the natural first green row while the sweep is still running.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Content | Gate |
|-----------|---------|------|
| M1 | `capture-alignment.md` complete, fourteen rows, gaps named | Every item has a design or a named gap |
| M2 | The top ten by fit are green with their controls seen red | `npm run gate` exits 0 |
| M3 | All fourteen green, phone expressions included | Gate 0, replay reversed 0, board parity unchanged |
| M4 | Operator reads the surfaces on device | Operator's own words; not tickable by an agent |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

### ADR-001: One chip surface for sorts and filters, not two

**Status**: Proposed

**Context**: REQ-001 could render a sort control and a filter control as separate rows, which is the
smaller change against our current panels. Anytype uses one row: a leading direction-coloured sort
chip, then filter chips, then the add control and clear-all.

**Decision**: One row, following Anytype. The sort chip leads and is visually distinct by direction.

**Consequences**:
- Positive: one add control, one clear-all, one auto-hide rule, one place to read "is this view
  filtered at all" — which is what US-001 actually asks for.
- Negative: `filter-panel-renderer.ts` and `sort-panel-renderer.ts` must both feed a surface neither
  of them owns. Mitigation: the row is hosted by `toolbar-renderer.ts` and both panels write to it,
  rather than either panel owning the other's chips.

**Alternatives Rejected**:
- Two rows: cheaper to build, but doubles the empty-state logic and gives a filtered-and-sorted view
  two competing headers.

---

### ADR-002: The per-view new-row preset is the whole template adoption

**Status**: Proposed

**Context**: Anytype's template system is large — per-type defaults, per-view overrides, lock,
duplicate, bin, switchable-until-first-edit. `047` ranked only the per-view "new row" default preset
and explicitly listed the rest as a non-adoption.

**Decision**: REQ-010 is the preset map and nothing else. No template objects, no lock, no switching.

**Consequences**:
- Positive: the useful 90% of the behavior at a fraction of the surface, and no new object kind in a
  file-backed vault.
- Negative: a person who knows Anytype will look for templates and not find them. Mitigation: say so
  in the changelog rather than half-building the rest.

**Alternatives Rejected**:
- The full template system: needs an object kind we do not have and a type system we deliberately did
  not adopt (goal D6).

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
