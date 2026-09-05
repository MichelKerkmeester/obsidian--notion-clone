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

Two things shape the order. First, **the captures gate everything** (goal D1). That gate is now
discharged: T001 read the 151-file sweep and `design-trueup.md` is the read. Five items have no
reference screen and are marked *design inferred from source code, not seen* — REQ-005, REQ-006,
REQ-007, REQ-011, REQ-013. Second, **one leg touches one file** (goal D7): items are grouped by the
file they land in and each group is opened once, so `toolbar-renderer.ts` is not edited three times by
three items.

**What T001 did to this plan.** Six legs are materially smaller than they were sized. REQ-001's chip
row and count badge already ship, REQ-009's twelve empty-state reasons already ship, REQ-013's
per-format rows already ship on both viewports and are already `sheet-grammar`-registered, REQ-005's
snapshot machinery already exists, REQ-008's never-empty guarantee already holds in the file that
matters, and REQ-014 has no virtualization path to replace. Those become **assertions with negative
controls over existing behaviour** plus a small residue each, rather than construction (ADR-004). The
LOC estimate below is corrected rather than left to be discovered mid-phase.

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
- `design-trueup.md` has a section for the item: the Anytype screen it is designed against with its
  measured values, or the gap the sweep left and the `047` finding standing in for it. **All fourteen
  do, as of T001.**
- The item's threshold in `acceptance-criteria.md` — **in the restated form where T001 restated it**
  — has been run on the current tree and **observed failing**, with the figure written into
  `checklist.md`. Measuring the original wording of AC-001, AC-005, AC-008, AC-009, AC-013 or AC-014
  produces a red that no code change caused (ADR-004).
- The item's phone expression is stated, or its absence is stated with a reason. **REQ-003 is the one
  item with no phone expression**, and the reason is recorded: a touch surface has no persistent
  scrollbar chrome to make sticky.

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
| L1 | ~~T001~~ **released** | The filter panel and the property picker were reached. Both items ship already; the residue is the settings-panel `N applied` value and three unproven grammar elements |
| L2 | ~~T001~~ **released**, L1 | The settings panel is captured and measured: 360 × 316px, 28px rows, 8px radius. REQ-010's per-view default row is **absent from the captured panel**, so it is ours to design |
| L3 | ~~T001~~ **released** | REQ-003's geometry is measured on both a kanban and a grid, which is what rescoped it. REQ-007's confirm was never captured and stays source-derived |
| L4 | ~~T001~~ **released** | Duplicate and Remove are captured — in the settings panel. The tab context menu was still never captured and is dropped from AC-004 |
| L5 | — | Behaviour, no reference screen expected, **confirmed at T001**. And the snapshot machinery already exists in `database-viewport.ts` |
| L6 | ~~T001~~ **released** | The 92px figure is from source and no capture shows an open editor near an edge. The deciding criterion is the no-overflow one instead |
| L7 | ~~T001~~ **released** | The object context menu is captured — **five** sections, not four. The never-empty fallback and the caps were not; the caps are not adopted |
| L8 | ~~T001~~ **released** | Anytype renders **no** empty-state block at all. Ours has twelve reasons; the residue is the deleted-relation state |
| L9 | ~~T001~~ **released** | The collapsed inline toolbar **is** captured, and so is `Page limit  60 ›`. The measured-versus-breakpoint mechanism is not |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Leg | Items | Estimated LOC | Note |
|-----|-------|---------------|------|
| T001 | Gate | **~700 (doc), done** | `design-trueup.md` plus `decision-record.md`; larger than estimated because the read produced three ADRs |
| L1 | 2 | ~430 → **~90** | Both items ship. Residue: the settings-panel `N applied` value, three grammar elements, and lane rows over what exists |
| L2 | 2 | ~180 → **~150** | One continuation; per-**field** defaults only, since the status preset ships |
| L3 | 3 | ~270 → **~300** | Sticky scrollbar now on two surfaces, not one; plus the confirm and `positionLock` |
| L4 | 1 | ~120 → **~70** | Duplicate in the settings panel; the tab menu is dropped from the criterion |
| L5 | 1 | ~60 → **~40** | Wire the existing snapshot; do not build a second |
| L6 | 1 | ~50 | Unchanged — one edge-proximity branch |
| L7 | 1 | ~120 → **~50** | One fallback in `bulk-edit-field-menu.ts`; the caps are not adopted and `row-menu.ts` is asserted |
| L8 | 1 | ~90 → **~50** | One state, not two flavours plus one |
| L9 | 2 | ~190 → **~160** | Measured collapse and a page-limited "Load more" row |
| **Total** | **14** | **~1660 → ~960** | Corrected at T001. Six legs became assertions over shipped behaviour plus a residue |
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

T001 → L1 → L2 was the critical path and T001 is done, which releases all nine legs at once.

**The path is now L2 alone.** L1's chip surface already exists, so L2 no longer waits on it being
built — only on the settings-panel `N applied` value, which is a string. Everything else fans out and
can be ordered by rank. L3 is the largest remaining leg, since T001 doubled REQ-003's surface count
from one to two, and it is the only leg carrying the goal D5 parity constraint, which makes it the
natural next one after L2.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Content | Gate |
|-----------|---------|------|
| M1 | ~~`design-trueup.md` complete~~ **Done 2026-09-05** — fourteen sections, five gaps named, seven contradictions recorded, six thresholds restated | Every item has a design or a named gap |
| M2 | The top ten by fit are green with their controls seen red | `npm run gate` exits 0 |
| M3 | All fourteen green, phone expressions included | Gate 0, replay reversed 0, board parity unchanged |
| M4 | Operator reads the surfaces on device | Operator's own words; not tickable by an agent |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

### ADR-001: One chip surface for sorts and filters, not two

**Status**: Accepted, amended at T001

**Context**: REQ-001 could render a sort control and a filter control as separate rows, which is the
smaller change against our current panels. Anytype uses one row: a leading direction-coloured sort
chip, then filter chips, then the add control and clear-all.

**Decision**: One row, following Anytype. The sort chip leads and is visually distinct by direction.

**Amended at T001.** This ADR is now a description of what already ships rather than a choice being
made. `active-view-controls-renderer.ts` builds exactly this row — sorts first with a direction arrow
and an ordinal, a conjunction chip, filter chips with a format icon and an `×`, `Clear all`, auto-hide
at `:93` — hosted off the header rather than owned by either panel, which is what the mitigation
below proposed. Two things also change: **Anytype does not do this.** No chip row appears on any of
the 151 captures, including a view that demonstrably carries a filter, so "following Anytype" is
false as stated and the row is ours (`design-trueup.md` C2). And the sort chip's direction is carried
by an **arrow glyph plus an ordinal number**, not by colour, which is the right call and is why the
"direction-coloured" phrasing is retired.

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

**Status**: Accepted, amended at T001

**Context**: Anytype's template system is large — per-type defaults, per-view overrides, lock,
duplicate, bin, switchable-until-first-edit. `047` ranked only the per-view "new row" default preset
and explicitly listed the rest as a non-adoption.

**Decision**: REQ-010 is the preset map and nothing else. No template objects, no lock, no switching.

**Amended at T001 — the slice narrows again, twice over.** First, a per-view **status** preset and a
per-database template already ship (`view-config-panel-renderer.ts:259, :265, :403-407` and
`:558-612`), so the residue is per-**field** default values and only that. Second, the premise that
Anytype offers a per-view template override is contradicted by the panel itself: the captured view
settings, in both their Grid and their Kanban form, carry View name, Layout, [Groups], Properties,
Filter, Sort, Duplicate view and Remove view, and **no default-template row** (`design-trueup.md` C7).
The one captured per-view default of any kind is `Page limit  60 ›` in the gallery layout block —
which is also where a new default row belongs.

**Consequences**:
- Positive: the useful 90% of the behavior at a fraction of the surface, and no new object kind in a
  file-backed vault.
- Negative: a person who knows Anytype will look for templates and not find them. Mitigation: say so
  in the changelog rather than half-building the rest.

**Alternatives Rejected**:
- The full template system: needs an object kind we do not have and a type system we deliberately did
  not adopt (goal D6).

---

### ADR-003, ADR-004, ADR-005 — recorded in `decision-record.md`

T001's read forced three rulings too large to sit inside a plan ADR, so they live in this packet's
`decision-record.md` and are named here so an `acceptance-criteria.md` waiver can cite them.

| ADR | Ruling |
|-----|--------|
| ADR-003 | Where a capture and `047`'s research disagree, the capture decides and the contradiction is named. Seven do. Absence of a capture is not evidence of absence; a source-derived number survives where no capture can replace it, carrying its provenance |
| ADR-004 | Six thresholds — AC-001, AC-005, AC-008, AC-009, AC-013, AC-014 — asserted a failing value the tree does not have and are restated before any of them may be observed red. Shipped behaviour is asserted with a negative control rather than deleted from the packet |
| ADR-005 | The measured Anytype geometry is adopted; its `#232323` row highlight (1.14:1) and its colour-only state signalling are refused on contrast; every colour stays on our own theme tokens. 28px rows are adopted as a named deviation from the spacing scale, because a measurement and `design-system.md` §9's touch floor agree on the number |

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
