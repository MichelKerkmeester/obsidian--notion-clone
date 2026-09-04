---
title: "Phase 004: Mobile and Live Verification"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Phone layout and touch targets, the two deferred guards, and the only evidence that closes the packet: the operator opens the plugin and confirms the screen changed."
trigger_phrases:
  - "006 phase 004"
  - "mobile touch targets list"
  - "live device verification"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/004-mobile-and-live-verification"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 004; AC-26 recorded as unsubstitutable"
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
      session_id: "list-view-clickup-006-p004"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "No capture shows a narrow or phone width. Every phone criterion here is ours to get right, not ours to copy"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Phase 004: Mobile and Live Verification

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | `specs/006-list-view-deprecation/004-mobile-and-live-verification/` |
| **Parent Spec** | [`../spec.md`](../spec.md) |
| **Predecessor** | [`../003-group-affordances-and-selection/spec.md`](../003-group-affordances-and-selection/spec.md) |
| **Successor** | None — this is the last phase |
| **Level** | 2 (Verification) — **raised.** `recommend-level.sh --loc 250 --files 6` returned 30/100 and Level 1. The scorer does not see that this phase carries the only criterion that closes the packet and cannot be satisfied by any harness. Judgment goes higher |
| **Status** | **Superseded 2026-09-04** — was: Planned — blocked on the lane release |
| **Lane** | **Not held.** Any styling this phase needs was written in 002 or is deferred to a follow-on packet |
| **Independent of** | 003. The two may run in either order or in parallel |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

**This phase exists so that device verification is not the tail of a phase that is already declaring
victory.**

That is one of the two reasons this packet uses five phases where the scorer suggested three. The
other produced phase 000. Both splits exist to stop a phase grading its own work.

Two smaller pieces come with it, deferred here deliberately rather than dropped:

- **The two deferred guards** — the external-row-patch fast path and the optimistic update on the
  title field. Both were held back from 001's conversion because neither is needed to make the list a
  grid and both change behaviour under concurrent edits.
- **Phone layout.** No primary capture shows a narrow or phone width. Every criterion here is
  therefore **ours to get right, not ours to copy** — a distinction that matters because the rest of
  the packet leans on the reference and this phase cannot.

**Purpose.** Finish the parts the desktop grid deferred, then get the only evidence that counts.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In scope

- Phone layout for the list, and 44 by 44 CSS px touch targets on the group toggle and the row
  checkbox.
- The two deferred guards: the external-row-patch fast path, and the optimistic update on the title
  field.
- Focus rings on every interactive element introduced across the packet.
- The final full recapture sign-off.
- **Live device verification by the operator.**

### Out of scope

- Any write to `styles.css`. The lane is released and this phase does not retake it. Phone rules were
  written in 002 or are deferred to a follow-on packet.
- Structural or chrome change.
- The mobile move menu and row drag-reorder. The list already has both.
- **Subtasks.**

### Frozen boundary

`SCOPE LOCK` applies. A defect found outside this list — including in the table — is recorded in the
parent and not fixed here.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

| ID | Requirement | Priority |
|---|---|---|
| FR-19 | External row patching and interaction-snapshot restore extend to the list | P2 |
| NFR-04 | Touch targets on phone are at least 44 by 44 CSS px, including the group toggle and the checkbox | P0 |
| NFR-05 | Focus is visible on every interactive element, as a `box-shadow` ring rather than `outline` | P0 |

### 4.1 The two deferred guards change behaviour under concurrent edits

Neither is needed to make the list a grid, which is why 001 left them. Both deserve their own
attention rather than a line in a nine-guard sweep:

- **The external-row-patch fast path.** Today a non-table view falls through to a full refresh.
  Extending the fast path to the list means the list starts applying partial updates, and the edge
  case the parent already names is the one to check: two groups, one collapsed, an external row
  change. The patch path applies to both or refuses. **It must not apply to one.**
- **The optimistic update on the title field.** Today the list's title field forces a full refresh
  rather than updating optimistically. Revisiting it means deciding whether the list's title cell can
  hold an optimistic value — which is now the grid's title cell, so the question has changed since it
  was deferred.

### 4.2 Phone width is unobserved, and that constrains what may be claimed

The parent's §4.2.1 records it directly: all four primary captures are wide desktop, so the
narrow-width overflow rule, the touch targets and **every criterion in this phase** are untouched by
the reference.

This is not a licence to invent freely — it is a requirement to say so. A phone criterion here is
justified by the platform's own guidance and by our own measurements, and it must not be written as
though the reference supported it.

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Definitions live in the parent register [`../acceptance-criteria.md`](../acceptance-criteria.md).
This phase owns `AC-24`, `AC-25` and `AC-26`.

**`AC-26` is not optional and is not satisfiable by any harness.** A person opens the plugin and says
the screen changed. It is the evidence release 1.3.1 lacked, and nothing in the gate set substitutes
for it — not the capture manifest, not the placement harness, not a green bench.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Why it bites | Mitigation |
|---|---|---|
| The packet closes on a harness pass | Exactly what release 1.3.1 did | `AC-26` is P0 and has no automated substitute |
| A phone criterion is written as though the reference supported it | No capture shows a narrow width | Every criterion here names its own justification and does not cite a capture |
| The patch fast path applies to one of two groups | Partial application is worse than a full refresh, because it looks correct | The edge case is a named criterion: two groups, one collapsed, an external change — both or neither |
| This phase wants the lane | Phone rules belong to 002 | Any styling needed here was written in 002 or is deferred |
| The operator confirms "it changed" without checking the affordances | "The screen changed" is satisfied by any visible difference | The device check names the two affordances that had zero rules: the per-group create button and the row checkbox |

### Dependencies

- **Lane released by 002.** Blocking for the phase start.
- **Phase 000's census** for the "today" cells this phase owns.
- **Phases 001, 002 and 003 landed.** `AC-26` is a check on the whole packet, not on this phase.

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement | Threshold | How measured |
|---|---|---|---|
| NFR-04 | Touch target box on phone, including the group toggle and the row checkbox | at least 44 by 44 CSS px | harness at phone width |
| NFR-05 | Focus ring visible on every interactive element introduced, as `box-shadow`, with no bare `outline: none` | present and visible | harness |
| NFR-01 | Render time at 2,000 rows, re-checked at the end of the packet | within 20 percent of the 000 table baseline | `npm run bench` |

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

| Case | Expected |
|---|---|
| Phone width | Column headers, resize and drag-to-reorder are absent by the existing touch predicate; **sorting stays reachable through the toolbar** |
| Two groups, one collapsed, external row change | The patch path applies to both or refuses. It must not apply to one |
| A touch target overlaps another at 44px | Neither shrinks below the floor. If they cannot both fit, the layout changes, not the target |
| The operator's device differs from the harness's phone width | The device check is the authority. The harness is a proxy |
| Optimistic update on a title cell that is now a grid cell | Decided here, not inherited. The question changed when the cell changed |

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## 9. COMPLEXITY ASSESSMENT

| Dimension | Value |
|---|---|
| Estimated LOC | ~250 |
| Files touched | ~6 |
| Architectural | no |
| Risk | medium. Two guards that change behaviour under concurrent edits, and the packet's only unsubstitutable criterion |
| Level score | 30/100 by the scorer; **raised to 2** on the grounds in §1 |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 10. OPEN QUESTIONS

**Q-P4-01 — Should the optimistic update extend to the list's title cell now that it is a grid cell?**
Open. It was deferred from 001 as a behaviour question and the cell it concerns has since changed, so
it is re-decided here rather than inherited. Nothing else in the packet depends on the answer.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- [`../spec.md`](../spec.md) §4.2.1 — why no phone claim may cite a capture.
- [`../plan.md`](../plan.md) §3 — the two deferred guards and their intended predicates.
- [`../acceptance-criteria.md`](../acceptance-criteria.md) — the criteria register.
