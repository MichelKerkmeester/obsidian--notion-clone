---
title: "Implementation Plan: Record and Relation Surfaces"
description: "Four legs — capture true-up, display primitives, editor extraction, consumer migration — each closed on a threshold observed red first, with formulas/rollups/calculations excluded by ADR-003."
trigger_phrases:
  - "054 plan"
  - "record surface legs"
  - "editor extraction plan"
  - "primitive migration"
importance_tier: "high"
contextType: "planning"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Record and Relation Surfaces

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

Ten surfaces (spec §5A) already build their records and properties from four header builders, three
property-row vocabularies, three type lists and nine private editor methods. The work is
**extraction and convergence**, not new behaviour: the primitives are what the surfaces already
draw, written once.

Two constraints shape the order. First, the capture true-up gates the design rows (goal D1): §5B's
behaviours are adopted only after T001 opens the named images. Second, the editor extraction is the
highest-blast-radius leg in this family (ADR-002), so its dispatch test is pinned red-first before
anything moves and the extraction runs one editor per leg with no behavioural edit inside a move.

### Overview

Four legs: T001 alone; then the display primitives (P1, P2, P3, P5, P6-host, P7) built beside their
consumers; then the editor extraction (P4) behind the pinned dispatch test; then the consumer
migration, one file group at a time, retiring per-surface duplicates as each consumer switches.
`styles.css` is touched by more than one leg and is serialized by the parent's CSS lane.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- The leg's threshold in `acceptance-criteria.md` has been run on the current tree and **observed
  failing**, with the figure written into `checklist.md`.
- For legs adopting an Anytype behaviour: the named capture has been opened and read by hand
  (T001's record), or the gap is named in the leg.
- The leg's phone expression is stated, or its absence is stated with a reason.

### Definition of Done
- The threshold passes, and the negative control for it was observed red.
- The lane row is permanent and green; `npm run gate` exits 0 read from `$?`.
- The consumers the leg switched render identically to their pre-leg captures, or the difference is
  the primitive's named improvement with its own red-first threshold.
- No per-surface duplicate the leg retired still has a live rule in `styles.css`.

<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Extraction beside consumers. The primitives module family (`src/views/record-surface/`, ADR-001)
holds the shared shapes; the ten surfaces import them and lose their private copies. No new
rendering layer, no new state, no new persistence: a property row is a DOM builder, a type picker is
a list plus an icon renderer, an editor is the existing method body at an exported address.

### Key Components

- **`record-header.ts` (P1)** — phone/desktop variants over one builder; `createSheetHeader`
  remains the phone chrome underneath, and the record sheet's operator-verified desktop DOM is the
  desktop variant (spec open question 1, resolved there).
- **`property-row.ts` (P2)** — display variant (peek, board card summary) and interactive variant
  (record sheet, properties panel's checkbox rows). Anatomy per A2: type icon, label, value.
- **`add-property-row.ts` (P3)** — the `+` row for the record sheet (A5 search-first picker,
  falling through to `CreatePropertyModal`) and the properties panel's existing add row.
- **`hidden-properties.ts` (P5)** — collapsed group with a count; expanded state survives a
  refresh.
- **`type-picker.ts` (P7)** — one source for the thirteen formats with icons and gating reasons;
  five consumers wired.
- **Cell-editor primitives (P4)** — one module per type behind `CellRenderer.startEdit`
  (ADR-002's mechanical extraction).
- **`note-body-region.ts` (P6-host)** — already extracted and tested; formally named the record
  sheet's body primitive (REQ-009), no code change expected.

### Data Flow

View config and row data → primitive builders → DOM. Nothing new is persisted; the hidden group's
expanded state is per-open session state on the sheet, carried across refreshes in the same closure
pattern the body draft already uses (`record-detail-panel.ts:309-319`).

<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## AFFECTED SURFACES — the legs

| Leg | Files | Primitives | Consumers switched |
|-----|-------|------------|--------------------|
| T1 | capture files, `migration-table.md` | — (design) | — |
| L1 | `record-surface/record-header.ts`, `record-surface/index.ts`, `styles.css` | P1 | built beside consumers |
| L2 | `record-surface/property-row.ts`, `record-surface/hidden-properties.ts`, `record-surface/add-property-row.ts`, `styles.css` | P2, P3, P5 | built beside consumers |
| L3 | `record-detail-panel.ts`, `table-record-peek.ts` | P1, P2, P3, P5, P6-host | record sheet, peek |
| L4 | `column-manager-renderer.ts`, `board-card-properties-panel.ts`, `record-surface/type-picker.ts` | P2 (checkbox variant), P3, P7 | properties panel, board card properties |
| L5 | `create-property-modal.ts`, `property-type-conflict-modal.ts`, `relation-rollup-config-modal.ts`, `formula-modal.ts` (type dropdowns only), `column-menu.ts` (type submenu) | P7 | the five type-list sites |
| L6 | `cell-renderer.ts`, `record-surface/cell-editor-*.ts` | P4 | `startEdit` dispatch |
| L7 | `styles.css` retirement sweep, `tools/live/sheet-grammar.mjs` registry rows, lane assertions | — | all |

**Why L5 lands before L6.** The type-picker wiring (L5) touches five small files and no editor body;
the editor extraction (L6) touches the largest file in the family. Sequencing the low-risk leg first
keeps the risky leg's diff reviewable on its own.

**Why L7 is a leg and not a habit.** The retired per-surface duplicates (peek's `renderProperty`
body, the hand-built headers, `PROPERTY_TYPES` and `getTypeOptions`, the duplicated drag rows) each
leave dead CSS behind; the stylesheet reverses itself silently (`design-system.md` §2), so the
retirement sweep is its own verified pass, not a tail of the consumer legs.

<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Setup is T001 alone — the capture-image read, the design true-up recorded in `migration-table.md` —
and it gates every design row in L3. L1/L2 build the primitives beside their consumers (nothing
switches yet, so every existing capture still holds). L3-L6 switch consumers one file group per leg.
L7 retires, registers and asserts.

<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

- **Red first, per threshold.** Every AC's number is measured on the current tree before its leg
  starts — the three-vocabulary count, the four-header count, the three-type-list count, the
  hidden-group absence, the empty-value word — and recorded in `checklist.md`.
- **Pinned dispatch test before extraction.** A unit test asserting `startEdit`'s type → editor
  mapping fails (no exported editors) before L6 and passes after each move (ADR-002).
- **Negative control per threshold.** After green, the mechanism is removed or inverted — a second
  property-row builder reintroduced, the header primitive bypassed, a type list inlined — and the
  row must go red again.
- **Lane rows where the behaviour renders.** SC-001's four-consumer row renders one column through
  the record sheet, a board card, the peek and the properties panel in one page; the phone surfaces
  register `sheet-grammar` rows per `044`'s lane.
- **Unit where pure.** The hidden group's expanded-state survival, the type picker's gating reasons,
  the empty-affordance's editor binding.
- **Reference parity posture.** No leg touches `board-renderer.ts`'s own rendering path, but L2/L3
  change what board cards draw. The `038` board reference captures are re-read after L3, and a
  `pixelHash` difference is operator-ruled before close (goal D5's posture, applied where it bites).

<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

- `screenshots/anytype/` — the capture index and images; D1's gate for every design row.
- `044`'s `sheet-grammar` lane and its seven elements — rows added, never columns.
- `048`'s stacking model — consumed; the extracted editors remain the children in its pairs.
- `023`'s note-body decision (editable, accepted) and its regression test.
- `045`'s ADR-002 (card hiding is cards-only) — the board-card properties mechanism does not change.
- `050`'s items 6, 9, 11 — referenced by number; its `capture-alignment.md` gate binds by reference.
- `003`'s inventory — extended by reference through the migration table, never edited.

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Each leg is one commit-sized unit over one file group and is independently revertible. Because L1/L2
build beside consumers rather than switching them, the first four legs can land without changing any
rendered surface at all; the switching legs (L3-L6) are the revertible units, and L7's retirement
sweep is last so a revert upstream never strands dead CSS.

<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Leg | Content | Estimated LOC | Note |
|-----|---------|---------------|------|
| T1 | Capture read, `migration-table.md` | ~250 (doc) | one row per surface + one per Anytype behaviour |
| L1 | P1 header primitive | ~180 | phone + desktop variants |
| L2 | P2/P3/P5 | ~420 | the largest primitive leg; three modules + tests |
| L3 | Record sheet + peek migration | ~200 (net negative in duplicates) | the two record surfaces |
| L4 | Properties panel + board card properties + P7 | ~220 | includes P7's module |
| L5 | Five type-list sites | ~120 | wiring, not design |
| L6 | Editor extraction | ~350 (mostly moved) | one editor per leg |
| L7 | Retirement sweep + lane rows | ~150 | CSS retirement, registry rows |
| **Total** | | **~1,890** | against the 1,800 estimate the level was scored on |

<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- Every leg's lane row is green and its negative control was seen red.
- `npm run gate` exits 0 read from `$?`; the pinned dispatch test passes.
- Board card reference captures re-read after L3; any difference operator-ruled.

### Rollback Procedure
1. Revert the leg's commit; no other leg shares its file group except `styles.css`.
2. Re-run the gate; the reverted leg's row goes red and every other row stays green.
3. If `styles.css` was touched, re-read the serialized CSS lane before the next leg starts.

### Data Reversal
- **Has data migrations?** No. No persisted key changes: hidden-group state is per-open session
  state; the type picker is a rendering list; the editors move, they do not change what they write.
- **Reversal procedure**: N/A.

<!-- /ANCHOR:enhanced-rollback -->

---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```text
T1   capture read, migration-table.md
 |
 +--> L1  P1 header primitive
 |     |
 |     +--> L3  record sheet + peek switch
 |
 +--> L2  P2/P3/P5 display primitives
 |     |
 |     +--> L3  (same switch)
 |     +--> L4  properties panel + board card properties
 |             |
 |             +--> L5  type-list sites (P7 consumers)
 |
 +--> L6  editor extraction (independent of L1-L5; pinned test is its own gate)

L7  retirement + registry rows (after all switching legs)
```

### Dependency Matrix

| From | To | Kind |
|------|----|------|
| T1 | L3's design rows | Blocking (goal D1) |
| L1, L2 | L3 | The primitives the record sheet consumes |
| L2 | L4 | The row primitives the panel consumes |
| L4 | L5 | P7 is built in L4, wired in L5 |
| L6 | L7 | The extracted editors' wrappers are what the sweep verifies |
| `044` | L3, L7 | Lane rows, grammar consumed unchanged |
| `048` | L6 | Stacking model consumed unchanged |
| `023` | L3 | Note-body regression test stays green |

<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

T1 → L2 → L3 is the critical path: the record sheet is the surface the operator's directive is
about, and it needs P2 (rows), P5 (hidden group), P3 (add affordance) and P6-host before it reads as
the object page SC-002 describes. L6 is the long pole in wall-clock terms but runs independent of
the path; L4/L5 fan off L2.

<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Content | Gate |
|-----------|---------|------|
| M1 | `migration-table.md` complete: ten surface rows, seven Anytype behaviour rows, gaps named | Every design row has a capture read or a named gap |
| M2 | The primitives exist and are green beside their consumers; every existing capture still holds | L1+L2 merged, no capture moved |
| M3 | All ten surfaces consume the primitives; the vocabulary counts read 1/1/1 | SC-001's four-consumer lane row green, negative control seen red |
| M4 | Operators' device read | SC-002; the operator's own words, not tickable by an agent |

<!-- /ANCHOR:milestones -->
