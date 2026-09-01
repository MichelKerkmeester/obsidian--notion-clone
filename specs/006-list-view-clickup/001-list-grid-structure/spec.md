---
title: "Phase 001: List Grid Structure"
description: "The structural swap. The list renders through the grid renderer behind data-db-row-style: header row repeated per group, sort, resize, reorder, add-column, the shared cell pipeline, cell selection, footer and multi-group. Seven guards convert here, two more in 004, and two never do."
trigger_phrases:
  - "006 phase 001"
  - "list grid structure"
  - "data-db-row-style"
  - "guard conversion"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/006-list-view-clickup/001-list-grid-structure"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 001; FR-17 reversed per the operator's reading-identity decision"
    next_safe_action: "Wait for phase 000 to arm both guard tripwires; no guard may be converted before that"
    blockers:
      - "Phase 000 tripwires not yet armed"
      - "Phase 000 census not yet run"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "checklist.md"
      - "decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p001"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Is the leading gutter emitted as its own header cell or as padding on the first cell? ADR-P1-01, and AC-01 cannot be measured until it is answered"
    answered_questions:
      - "The list adopts the grid's interaction model. Row-click-opens-record, roving tabindex, stacked titles and content-width wrapping are not kept. Parent ADR-005"
---
# Phase 001: List Grid Structure

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | `specs/public/006-list-view-clickup/001-list-grid-structure/` |
| **Parent Spec** | [`../spec.md`](../spec.md) |
| **Predecessor** | [`../000-grid-contract-and-list-harness/spec.md`](../000-grid-contract-and-list-harness/spec.md) |
| **Successor** | [`../002-clickup-chrome/spec.md`](../002-clickup-chrome/spec.md) |
| **Level** | 3 (Full) — `recommend-level.sh --loc 900 --files 9 --architectural --api` returned 71/100, confidence 84% |
| **Status** | Planned — blocked on phase 000 |
| **Lane** | `tools/lane/css-lane.json` — **take**, at the start of this phase. Held continuously through 002 |
| **Blocked by** | Phase 000's tripwires being armed, and its census being on record. Two separate gates |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

**The list is a card stack and the table is a grid, and every capability gap between them follows
from that one divergence.**

The list renders `controls | main`, where `main` is a title line plus a grid of `label value` pairs.
There is no column header, so there is nothing to sort, resize, reorder or open a menu on. There is
no cell element, so cell selection, fill, clipboard and keyboard grid navigation have nothing to
address. There is no footer, so per-column calculations have nowhere to render. Its cells render
through a 348-line field renderer while the table's render through a 3,107-line one, so `files` and
`rollup` are invisible in the list and always will be while the pipelines are separate.

**Purpose.** Make the list a presentation mode of the grid, so the feature surface is inherited by
construction rather than re-listed and re-implemented. This is Route B, decided in the parent's
ADR-001.

**What this phase is not.** It is not the appearance. The list will look wrong at the end of this
phase and that is correct — the chrome is 002, and putting it here would let a single phase both
create the appearance and grade it.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In scope

- `data-db-row-style` on the grid, with `list` as one of its values.
- Routing the list render through the grid renderer, including the render-dispatch site.
- Column header row, repeated **once per group as the group's first child**, keyed on the group's
  existence and never on its row count.
- Sort, sort indicator with ordinal on every repetition, resize, drag-to-reorder, column menu,
  trailing add-column affordance.
- The shared cell pipeline, so `files` and `rollup` render in the list.
- Cell range selection, fill, clipboard, keyboard grid navigation, tab-past-last-cell row creation.
- Per-column footer, replacing the separate summary bar for the list.
- Multi-field grouping at the table's depth model.
- **Converting seven of the eleven guards** — G1, G2, G3, G4, G6, G7, G9. Not G8 and G11, which are
  view-semantic and are never converted; not G5 and G10, which the parent's `plan.md` §3 defers to
  phase 004.
- The minimum CSS that stops the result being unreadable. Nothing more.

### Out of scope

- ClickUp's visual language — row rhythm, dividers, group pill, chips, placeholders, density. All 002.
- The per-group create row's styling and wiring. 003.
- Phone layout, touch targets, and the deferred guards. 004.
- Subtask hierarchy. There is no subtask model and none is being built. **No slot, affordance or
  row-grammar column is reserved for one.** Parent `spec.md` §12 Q4.

### Frozen boundary

`SCOPE LOCK` applies. A defect found outside this list — including in the table — is recorded in the
parent and not fixed here.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

Inherited from the parent's [`../spec.md`](../spec.md) §4.3. This phase owns:

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | A column header row, one header per visible column, using the table's column resolution | P0 |
| FR-02 | The header repeats per group as the group's first child, **including for a zero-row group** | P0 |
| FR-03 | Header click sorts; shift-click appends. The same handler serves both views | P0 |
| FR-03a | A sorted header carries a direction-plus-ordinal indicator on **every** repetition | P0 |
| FR-04 | Column menu, resize handle and drag-to-reorder on pointer devices, from the table's controller | P0 |
| FR-05 | A trailing add-column affordance closes the header row | P1 |
| FR-06 | Cells edit in place through the table's cell pipeline | P0 |
| FR-07 | Cell selection, fill, clipboard and keyboard grid navigation work in the list | P0 |
| FR-08 | A per-column calculation footer renders per group and for the view | P1 |
| FR-09 | Multi-field grouping at the table's depth model | P1 |
| FR-17 | **Reversed.** See §4.1 | P0 |

### 4.1 FR-17 is reversed — the list adopts the grid's interaction model

The parent's FR-17 read: *the list keeps its distinctive reading behaviours — row-click opens the
record detail panel, roving-tabindex keyboard model, stacked file titles, wrapping fields — as
configuration, not as casualties.*

**The operator has decided the other way.** The list matches ClickUp and becomes a grid. Those four
behaviours are **not kept as defaults and no replacement is provided.** The decision and its cost are
recorded in the parent's [`../decision-record.md`](../decision-record.md) ADR-005.

What this phase must therefore do:

| Behaviour today | After this phase |
|---|---|
| Row-click opens the record detail panel | Removed. The list opens on a target cell, as the table does |
| Roving-tabindex card keyboard model | Removed. The cell-grid keyboard model replaces it, and the two are mutually exclusive |
| Stacked file titles | Removed. Titles render in the title column's cell |
| Wrapping fields sized `max-content` | Removed as the list default. Cell text truncates, which is also what the reference does — `C31` in the parent's §4.2 |

**What is lost, stated plainly.** Anyone using the list as a reading surface today loses it. There is
no replacement view and no compatibility mode. The reading affordances are not being relocated,
deferred or made opt-in — they are being removed, deliberately, because the operator asked for the
list to be a grid and a surface cannot be both a reading stack and an aligned grid at the same time.

The parent's `AC-10` asserted the opposite and would now **fail a correct implementation.** It is
replaced; see [`acceptance-criteria.md`](acceptance-criteria.md) §2.

### 4.2 The two guards that must not be converted

Seven guards convert here and two more in phase 004. **Two never convert**, and both would pass
`tsc` and the whole unit suite if they did:

- The **required-column** guard. The list needs its title field kept; returning empty would hide it.
  That column also hosts the leading gutter, the collapse chevron, the record glyph and the row-action
  cluster, so dropping it takes every row-level affordance with it.
- The **new-row-reveal** guard. This is list-specific reveal behaviour, correctly keyed on the view,
  and the create affordance is group-scoped — every group carries one, including a group with zero
  rows.

**This phase may not convert any guard until phase 000's tripwires are armed.** Not "should not" —
the tripwires are the only thing in the gate set that can see either failure.

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Definitions live in the parent register [`../acceptance-criteria.md`](../acceptance-criteria.md).
This phase owns `AC-01` through `AC-11`, `AC-28`, the replaced `AC-10`, and closes `AC-31` and
`AC-32`. Measurement plans are in [`acceptance-criteria.md`](acceptance-criteria.md).

The banned criterion shape most likely to appear here is **presence masquerading as behaviour**: a
header element that renders, carries `aria-sort`, and does nothing when clicked, because the list's
render path discards and rebuilds. Criteria here assert the **order of rendered row paths after a
click**, never the presence of a header.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Why it bites | Mitigation |
|---|---|---|
| A sweep converts all eleven guards | Both view-semantic failures are invisible to `tsc` and the unit suite | The tripwires, armed in 000, run in this phase's gate. Guard conversion is one commit, reverted whole or not at all |
| A wrong predicate changes a non-list view | Five other view types pass through the same guards | Each guard is converted against the re-derived table from 000, with the intended predicate recorded before the edit |
| Header emitted only for non-empty groups | The natural optimisation. It passes any fixture built from non-empty groups and breaks the case the reference shows twice | `AC-02` and `AC-30` both require a zero-row group in the fixture |
| Partial revert of the guard commit | Two guards change config-writing behaviour, so a half-revert can leave a field set on a view that no longer reads it | Revert the guard commit whole or not at all |
| The list quietly becomes the table | Under Route B there is nothing structural left to distinguish them | This is now **intended** for interaction. What still distinguishes the list is chrome, which is 002's subject, selected by `data-db-row-style` |
| Bench regression at 2,000 rows | The list gains the table's machinery | `NFR-01` against the 000 baseline, gated **before** the lane is released |

### Dependencies

- **Phase 000 tripwires armed** — blocking for any guard conversion.
- **Phase 000 census on record** — blocking for any criterion claim.
- **`tools/lane/css-lane.json` free** — blocking for the phase start. The parent packet `005` also
  queues for it.
- **ADR-P1-01** — the leading-gutter emission decision. `AC-01` cannot be measured until it is
  recorded.

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement | Threshold | How measured |
|---|---|---|---|
| NFR-01 | Render time for a 2,000-row list against the table baseline from 000 | within 20 percent | `npm run bench` |
| NFR-02 | The body is built detached and attached once, as the table already does | one body append per render | source assertion plus the bench |
| NFR-07 | No new value off the existing token scale | zero | diff review |

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

| Case | Expected |
|---|---|
| A group has zero rows | The header row renders, the create row renders, nothing between. Header emission keys off the group's existence |
| No columns visible except the title | Header renders with the title column and the trailing affordance only; no empty track |
| A column is hidden while a cell in it is selected | Selection collapses to the nearest surviving cell, as the table does |
| A group is collapsed while a cell inside it is selected | Selection clears; focus returns to the group toggle |
| `showEmptyFields` is off and a row has no value | The cell is empty but the **track is kept**, so columns stay aligned. The list already guards this today; the grid must not reintroduce the bug |
| Read-only view | No create row, no add-column, no resize. Header still sorts |
| Phone width | Column headers, resize and drag-to-reorder absent by the existing touch predicate; sorting stays reachable from the toolbar |
| Manual order active and the user clicks a header | Explicit sort disables manual reorder, as the table does |
| Two groups, one collapsed, external row change | The patch path applies to both or refuses. It must not apply to one |

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## 9. COMPLEXITY ASSESSMENT

| Dimension | Value |
|---|---|
| Estimated LOC | ~900 |
| Files touched | ~9 |
| Architectural | yes — this is where the shared grid contract lands |
| Risk | high. Nine guard conversions across six view types, and a serialized stylesheet lane |
| Level score | 71/100, confidence 84% |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 10. OPEN QUESTIONS

**Q-P1-01 — Is the leading gutter emitted as its own header cell, or as padding on the first cell?**
Open, and it blocks `AC-01`'s measurement rather than this phase's start. Recorded in
[`decision-record.md`](decision-record.md) ADR-P1-01. Phase 000's `AC-31` is deliberately written so
that **either answer passes it**, so this question does not gate the tripwire.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- [`../spec.md`](../spec.md) — the interaction model, the UNKNOWN list, the feature diff.
- [`../plan.md`](../plan.md) §3 — the guard table, re-derived by phase 000.
- [`../decision-record.md`](../decision-record.md) — ADR-001 the route, ADR-005 the reading identity.
- [`../000-grid-contract-and-list-harness/`](../000-grid-contract-and-list-harness/) — the tripwires
  and the census this phase is gated on.
