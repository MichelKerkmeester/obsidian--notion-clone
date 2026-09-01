---
title: "Acceptance Criteria: Phase 003 — Group Affordances and Selection"
description: "Measurement plans for AC-22 and AC-23, both phrased across a boundary so neither passes on the surface it changed."
trigger_phrases:
  - "006 phase 003 criteria"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-clickup/003-group-affordances-and-selection"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 003; the selection-sync criterion trap carried in"
    next_safe_action: "Wait for the styles.css lane to be released by 002"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p003-acc"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Phase 003 — Group Affordances and Selection

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Phase** | `003-group-affordances-and-selection/` |
| **Criterion definitions** | [`../acceptance-criteria.md`](../acceptance-criteria.md) — the packet register |
| **This file** | The measurement plan |
| **Owned** | `AC-22`, `AC-23` |
| **Also gated on** | `AC-32`, phase 000's reveal tripwire, which runs here too |
| **Measurement surface** | `tools/storybook/verify-placement.mjs` against system Chrome |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

### 2.1 AC-22 — the criterion must cross a surface boundary

**The trap.** Selection sync is invisible until a **second** surface changes the selection. A
criterion that toggles the list's own group checkbox and reads it back **passes today**, on code
documented as broken, because setting a checkbox and reading that same checkbox exercises neither the
resync path nor the defect.

**The measurement.** Change the selection **from the toolbar**. Read the **list group checkbox**. The
two surfaces are different on purpose.

| Field | Value |
|---|---|
| **Probe** | toolbar selection change → list group checkbox state |
| **Threshold** | reflects the change |
| **Negative control** | select nothing; the checkbox clears |
| **Why it fails today** | the resync routine queries the table's own containers only, so the list group checkbox is set once at render and never resynced |
| **Second assertion** | the same change reaches a second grouped view's checkbox. A fix that reaches only the list is a special case, not a fix |

### 2.2 AC-23 — the anchor is the criterion's load-bearing half

**The trap.** "The first column's content edge" is ambiguous between the **glyph origin** and the
**title origin**, and the two do not coincide: a reserved gutter sits before the glyph, and a
variable run of glyphs sits between the glyph and the title. On one primary capture the create
label lands at the row titles; on another, whose rows carry an extra glyph, it lands left of them.

An unnamed anchor makes the number ambiguous, and a criterion that fails ambiguously lets the phase
that fixes it choose which reading it meant.

| Field | Value |
|---|---|
| **Probe** | horizontal offset of the per-group create row against the first column's **leading-glyph origin** — not its title text — with the anchor named in the harness |
| **Threshold** | equal within 1px |
| **Negative control** | hide the first column; the offset follows |
| **Why it fails today** | the create row is not aligned to a column, because there are no columns |
| **Prerequisite** | the anchor is fixed in the harness **before** the number is compared |

### 2.3 What this phase must not assert

- **That the reference's group-header overflow menu and add affordance appear on hover.** They are
  present on some groups and absent on others across the captures, and four static images cannot say
  whether the trigger is hover, focus, or containing the revealed row. Observed, not required, and
  not to be resolved in the direction we expect.
- **That the group count and a descendant count differ.** They coincide for us because there is no
  subtask model. Record the coincidence; do not build a distinction to justify it.
- **Anything about a collapsed group's create affordance in the reference.** No capture shows a
  collapsed group.

<!-- /ANCHOR:criteria -->
---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

This phase closes when `AC-22` and `AC-23` each have a recorded failing measurement from the 000
census, a recorded passing measurement from this tree, and a negative control that moved — and when
phase 000's reveal tripwire still passes.

A criterion that passed by reading the surface it changed has not been verified. It has been
asserted.

<!-- /ANCHOR:closure -->
