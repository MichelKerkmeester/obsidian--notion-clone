---
title: "Acceptance Criteria: Phase 001 — List Grid Structure"
description: "Measurement plans for AC-01 to AC-11 and AC-28, the replacement for AC-10 after the FR-17 reversal, and the closure of the two guard tripwires armed in 000."
trigger_phrases:
  - "006 phase 001 criteria"
  - "ac-10 replacement"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/006-list-view-clickup/001-list-grid-structure"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 001; FR-17 reversed per the operator's reading-identity decision"
    next_safe_action: "Wait for phase 000 to arm both guard tripwires"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p001-acc"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Phase 001 — List Grid Structure

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Phase** | `001-list-grid-structure/` |
| **Criterion definitions** | [`../acceptance-criteria.md`](../acceptance-criteria.md) — the packet register. Thresholds and negative controls are defined there once |
| **This file** | The measurement plan, plus the one criterion this phase **replaces** |
| **Doctrine** | Parent register §2, binding in full |
| **"Today" cells** | Filled by phase 000's census. A blank cell **blocks** this phase's corresponding task |
| **Measurement surface** | `tools/storybook/verify-placement.mjs` against system Chrome, at the production mount point |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

### 2.1 Owned by this phase

`AC-01`, `AC-02`, `AC-03`, `AC-04`, `AC-05`, `AC-06`, `AC-07`, `AC-08`, `AC-09`, `AC-11`, `AC-28`,
plus the replacement for `AC-10` below.

`AC-31` and `AC-32` were **armed in 000 and close here**, against the tree that actually converts the
other seven. A tripwire never exposed to the conversion it guards has been written, not tested.

### 2.2 AC-10 is replaced — the criterion now fails a correct implementation

The register's `AC-10` reads: *row-click still opens the record detail panel, and the roving-tabindex
model is still active in list mode; threshold both true.* It exists to guard an `FR-17` regression.

**The operator reversed `FR-17`.** The list matches ClickUp and becomes a grid; those behaviours are
removed with no replacement (parent `ADR-005`). An implementation that does exactly what the operator
asked for would now **fail** `AC-10`.

That is the register's own **banned shape 2** — a criterion whose threshold the source contradicts —
and it is worth naming how it got here. The first instance in this packet came from misreading a
capture. This one came from a **decision changing underneath a criterion that was correct when it was
written**. The lesson generalises: a criterion is invalidated not only by new evidence but by a new
decision, and nothing in the doctrine was checking for the second.

**Replacement — AC-10R.**

| Field | Value |
|---|---|
| **Criterion** | In list mode: the cell-grid keyboard model is active and the roving-tabindex model is not; a row click opens on a **target cell** rather than the record detail panel; and the keyboard model in list mode is identical to the table's for the same fixture |
| **Threshold** | All three, and the two keyboard models are never simultaneously active |
| **Negative control** | Re-enable the roving-tabindex model in the harness — the cell-grid assertion must fail. If both can be true at once, the models are not mutually exclusive and the criterion has not been met |
| **Why it fails today** | *census* — both list behaviours are present on the current tree, so this criterion genuinely fails first on HEAD. It does not need the tripwire carve-out |
| **What it does not assert** | It does not assert that anything replaced the reading affordances. Nothing did. Asserting a replacement would be asserting work nobody scoped |

### 2.3 AC-01 cannot be measured before ADR-P1-01

`AC-01` counts header elements against "visible columns plus the two utility columns". The register
already flags the load-bearing half: **whether the leading gutter is emitted as its own header cell or
as padding on the first cell is this phase's decision, and it must be recorded before the number is
measured.** Either answer is legitimate; an unrecorded answer makes the count ambiguous, and a
criterion that fails ambiguously lets the phase that fixes it choose which reading it meant.

Record it in [`decision-record.md`](decision-record.md) as ADR-P1-01, then measure.

### 2.4 The fixture requirements that are themselves criteria

Three rows fail silently against a convenient fixture. Each names the fixture it needs:

| ID | Fixture | Why a simpler fixture passes wrongly |
|---|---|---|
| `AC-02` | Grouped, **including a group with zero rows** | Header emission driven off row count passes every non-empty fixture |
| `AC-30` | Same | Same. The reference shows a zero-row group carrying a full header row and its own create row |
| `AC-32` | **Multi-group**, ≥3 groups, one empty, affordance used on a **non-first** group | With one group, "landed in the right group" is true by construction |

### 2.5 The banned shape most likely to appear here

**Presence masquerading as behaviour.** A header element can render, carry `aria-sort`, and do
nothing when clicked, because the list's render path discards and rebuilds. Every structural
criterion here is therefore phrased over an **observable consequence**:

- `AC-03` reads the **order of rendered row paths** after a click, and after a second click. Not the
  header's existence.
- `AC-04` reads the **rendered track width** after a drag. Not the handle's existence.
- `AC-05` reads a **non-empty cell** for `files` and `rollup`. Not the column's existence.
- `AC-06` reads the **clipboard payload**. Not that a copy handler was bound.
- `AC-07` reads that **one row was created**. Not that a keydown fired.

<!-- /ANCHOR:criteria -->
---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

This phase closes when every criterion it owns has a recorded failing measurement from the 000
census, a recorded passing measurement from this tree, and a negative control that moved — and when
**both tripwires pass after the guard conversion**.

`AC-10` does not close. It is withdrawn and replaced by `AC-10R`, and the withdrawal is recorded in
the parent register so a reader who finds `AC-10` cited elsewhere can follow it here.

A phase that reports all-green while a "today" column is blank has not been verified. It has been
asserted.

<!-- /ANCHOR:closure -->
