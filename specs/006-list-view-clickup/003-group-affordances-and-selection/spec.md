---
title: "Phase 003: Group Affordances and Selection"
description: "Wire and reach the per-group create row, the group count, and the selection-sync defect that leaves the list group checkbox stale after any change from another surface."
trigger_phrases:
  - "006 phase 003"
  - "group create row"
  - "selection sync defect"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/006-list-view-clickup/003-group-affordances-and-selection"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 003; the selection-sync criterion trap carried in"
    next_safe_action: "Wait for the styles.css lane to be released by 002"
    blockers:
      - "Lane not released"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p003"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "The create affordance is group-scoped and renders in a zero-row group. Confirmed on two primary captures"
---
# Phase 003: Group Affordances and Selection

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | `specs/public/006-list-view-clickup/003-group-affordances-and-selection/` |
| **Parent Spec** | [`../spec.md`](../spec.md) |
| **Predecessor** | [`../002-clickup-chrome/spec.md`](../002-clickup-chrome/spec.md) |
| **Successor** | [`../004-mobile-and-live-verification/spec.md`](../004-mobile-and-live-verification/spec.md) |
| **Level** | 2 (Verification) — **raised.** `recommend-level.sh --loc 300 --files 5` returned 31/100 and Level 1. The scorer does not see that this phase fixes a live defect whose criterion passes on the broken code unless it is written carefully. Judgment goes higher |
| **Status** | Planned — blocked on the lane release |
| **Lane** | **Not held.** Any styling this phase needs was written in 002 or is deferred to a follow-on packet |
| **Independent of** | 004. The two may run in either order or in parallel |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

**One affordance is emitted but unreachable, and one behaviour is a live defect that looks fine from
the surface that broke it.**

- The per-group create button is emitted by the list renderer today and carries **zero** CSS rules.
  Phase 002 gives it an appearance; this phase makes it work and makes the new row land in the right
  group.
- `syncGroupedSelectionInputs` queries the table's own containers only. The list's group checkbox is
  set once at render and **never resynced**, so any selection change originating anywhere else leaves
  it stale.

**Purpose.** Make the group's own affordances real: the create row lands in its group, the count
tells the truth, and the checkboxes agree with the selection regardless of which surface changed it.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In scope

- Wiring the per-group create row so a new row lands in **the group whose affordance was used**,
  including a group with zero rows.
- The group count numeral, and what it counts.
- The selection-sync defect: grouped and total checkboxes resync after a selection change **from any
  source**.
- Bulk action bar parity with the table.

### Out of scope

- Any write to `styles.css`. The lane is released and this phase does not retake it.
- Structural change. That is 001's and is frozen.
- Phone layout and touch targets. 004.
- **Subtasks.** The reference nests them and shows a count on the parent row. We have no subtask model
  and are not building one, so **no slot, affordance or row-grammar column is reserved for one.**

### Frozen boundary

`SCOPE LOCK` applies. A defect found outside this list — including in the table — is recorded in the
parent and not fixed here.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

| ID | Requirement | Priority |
|---|---|---|
| FR-12 | Each group ends with a create-entry row aligned under the first column, and it is styled | P0 |
| FR-14 | Grouped and total select-all checkboxes resync after any selection change **from any source** | P0 |

### 4.1 What the group count counts

The reference's count numeral counts the group's **top-level rows**, not its nested descendants — a
group reading 1 can contain one top-level row and five nested beneath it, and a collapsed parent with
four subtasks counts as one.

**We have no subtask model, so for us the two counts coincide.** That is recorded so the coincidence
is not later mistaken for a design choice, and so that if a subtask model ever arrives, the count's
definition is already written down rather than inferred from an implementation that never had to
distinguish them.

### 4.2 The create affordance is group-scoped, and renders at zero rows

Confirmed on two primary captures: every group carries its own create row, including a group whose
count reads zero, where the create row is the only thing below the header row.

Two consequences:

1. The reveal target is the **group**, not the view. A row created from a group's affordance lands in
   that group.
2. Emission cannot key off the group's row count. This is the same constraint the header row carries.

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Definitions live in the parent register [`../acceptance-criteria.md`](../acceptance-criteria.md).
This phase owns `AC-22` and `AC-23`.

**The banned shape most likely to appear here is a criterion that passes on the broken code.**
Selection sync is invisible until a **second** surface changes the selection: a criterion that
toggles the list's own group checkbox and reads it back passes today, on code that is documented as
broken. `AC-22` therefore changes the selection **from the toolbar** and reads the **list group
checkbox**.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Why it bites | Mitigation |
|---|---|---|
| A selection criterion that passes on broken code | Toggling a checkbox and reading it back exercises neither the sync path nor the defect | `AC-22` changes the selection from a different surface than the one it reads |
| A create-row criterion anchored on ambiguous geometry | "The first column's content edge" is ambiguous between the glyph origin and the title origin, and a reserved gutter plus a variable run of glyphs sits between them | `AC-23` names the **leading-glyph origin** explicitly, in the harness, and the anchor is fixed before the number is compared |
| The create row is styled but unreachable | 002 gave it an appearance. An appearance is not a wiring | The criterion is that a row **lands in the right group**, not that the affordance renders |
| This phase wants the lane | It was released by 002 and retaking it serialises another packet | Any styling needed here was written in 002 or is deferred to a follow-on packet |

### Dependencies

- **Lane released by 002.** Blocking for the phase start.
- **Phase 000's census** for `AC-22` and `AC-23`'s "today" cells.
- **Phase 001's group structure.** The create row attaches to a group container that 001 builds.

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement | Threshold | How measured |
|---|---|---|---|
| NFR-05 | Focus is visible on the create row and both checkboxes, as a `box-shadow` ring | present and visible | harness |
| NFR-P3-01 | Resyncing selection does not re-render the whole view | no full re-render on a selection change | harness, render count |

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

| Case | Expected |
|---|---|
| A group has zero rows | Its create row renders and works. A row created from it lands in that group |
| A group is collapsed and its create affordance is used | Either the group expands and the row lands in it, or the affordance is unavailable. It must not land the row elsewhere silently |
| Selection changed from the toolbar | Both the group checkbox and the total checkbox reflect it |
| Selection changed from a bulk action | Same |
| Every row in a group is selected individually | The group checkbox reaches its checked state without a further click |
| A row is added to a group while that group's checkbox is checked | The checkbox moves to an indeterminate state rather than silently claiming the new row |
| Read-only view | No create row, no checkboxes |

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## 9. COMPLEXITY ASSESSMENT

| Dimension | Value |
|---|---|
| Estimated LOC | ~300 |
| Files touched | ~5 |
| Architectural | no |
| Risk | medium. One live defect, and one criterion that passes on the broken code unless written carefully |
| Level score | 31/100 by the scorer; **raised to 2** on the grounds in §1 |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 10. OPEN QUESTIONS

None blocking.

One thing is recorded as **observed and not required**: the reference's group header carries an
overflow menu and an add affordance beside its count, but only on some groups. Four static captures
cannot say whether the trigger is hover, focus, or containing the revealed row. Nothing here depends
on the answer, and this phase should not invent one.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- [`../spec.md`](../spec.md) §4.2 — the group-scoped create affordance and what the count counts.
- [`../acceptance-criteria.md`](../acceptance-criteria.md) — the criteria register.
- [`../002-clickup-chrome/`](../002-clickup-chrome/) — the phase that must release the lane first.
