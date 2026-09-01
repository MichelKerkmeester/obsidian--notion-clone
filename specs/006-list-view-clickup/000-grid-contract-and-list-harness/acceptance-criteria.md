---
title: "Acceptance Criteria: Phase 000 — Grid Contract and List Harness"
description: "The two guard tripwires with their fixtures and arming procedure, and the census obligations this phase owns. Definitions live in the parent register; this file is the measurement plan."
trigger_phrases:
  - "006 phase 000 criteria"
  - "ac-31 ac-32 tripwire"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/006-list-view-clickup/000-grid-contract-and-list-harness"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 000; AC-31 and AC-32 defined as guard tripwires"
    next_safe_action: "Build isGridView and the two guard tripwires"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p000-acc"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Phase 000 — Grid Contract and List Harness

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Phase** | `000-grid-contract-and-list-harness/` |
| **Criterion definitions** | [`../acceptance-criteria.md`](../acceptance-criteria.md) — the packet register. Thresholds and negative controls are defined there once and are not restated here |
| **This file** | The measurement plan: fixture, probe, and arming procedure for the criteria this phase owns |
| **Doctrine** | Parent register §2, binding in full — both banned shapes and the undecided-target check |
| **Carve-out** | [`decision-record.md`](decision-record.md) ADR-P0-01, guard tripwires only |
| **Measurement surface** | `tools/storybook/verify-placement.mjs` against system Chrome, at the production mount point |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:criteria -->
## 2. CRITERIA THIS PHASE OWNS

| ID | Owned as | Note |
|---|---|---|
| AC-31 | **built here, never closed here** | The G8 tripwire. Armed in this phase; it closes in 001, when the guard it protects is exposed to conversion |
| AC-32 | **built here, never closed here** | The G11 tripwire. Same |
| Every other AC | **measured here, closed elsewhere** | This phase fills the "today" cell of every criterion in the packet. The target cell belongs to the phase that does the work |

### 2.1 AC-31 — the G8 tripwire

**Fixture.** A list view at the production mount point, with the title column configured and **at
least one non-title column hidden**. The hidden column matters: it proves the required-column set is
being read rather than the full column set.

**Probe.** Two numbers from one render.

| # | Number | Read from |
|---|---|---|
| a | Is the title field's key present in the required-column set the view resolves? | the rendered DOM's column attribution, not a direct call to the resolver — a direct call would pass while the render dropped the column |
| b | The count of row-level affordance nodes rendered in a list row | the rendered DOM |

**Arming procedure.** In a scratch tree, convert G8 to the grid predicate. Re-run. Record four
numbers: `a` and `b` on HEAD, `a` and `b` on the mutant. The tripwire is accepted only when both
move. Record the mutation as a diff so the next reader can reproduce it.

**What AC-31 must not assert, and why.** It must not assert that the leading gutter renders *inside*
the title column's cell. Whether the gutter is emitted as its own header cell or as padding on the
first cell is phase 001's decision and the parent's `AC-01` records it as undecided. A tripwire that
presumed either answer would fail a correct implementation of the other — the parent's banned shape
2, reproduced inside the mitigation built to prevent it. **T1.2d requires the check to be
demonstrated passing against both candidate structures.**

Containment is asserted later and by other criteria: `AC-16` for the positions, `AC-23` for the
create row's anchor. Both are written to be measurable only after the gutter decision is recorded.

**Why "and its occupants" survives this narrowing.** The half of `b` that matters is that the count
does not fall. Converting G8 returns an empty required set, the title column is dropped, and every
row-level affordance the column hosted goes with it — so `b` collapses whether or not the tripwire
knows which container held them. The assertion is over survival, which is decision-independent; the
assertion over *location* is deferred to a criterion that runs after the location is decided.

### 2.2 AC-32 — the G11 tripwire

**Fixture — and the fixture is the criterion.** A **multi-group** list, at least three groups, one of
them with **zero rows**. Never a single-group fixture: with one group, "the row landed in the group
whose affordance was used" is true by construction and the check reports a pass it did not earn.

**Probe.** Activate the create affordance of a **named, non-first** group. Read the group container
that receives the new row. The two group identities must match. Repeat with the **zero-row** group's
affordance; the new row must land in that group.

The non-first group matters for the same reason the multi-group fixture does — a reveal that always
targets the first group passes a first-group test.

**Arming procedure.** In a scratch tree, convert G11 to the grid predicate. Re-run. The check must
fail. Record which group was used and which group received the row, on HEAD and on the mutant.

**Threshold provenance.** The group-scoped create affordance is confirmed on the primary captures:
five groups each carrying their own create row, including one with a count of zero where the create
row is the only thing below the header. This is `C5` and `C24` in the parent's `spec.md` §4.2, and it
is why the threshold is group-scoped rather than view-scoped. Checked against banned shape 2: an
implementation matching the reference passes this criterion.

### 2.3 The census

Every criterion in the packet register gets its "today" number from this phase. Three rules:

1. **Read-only.** The census does not fix what it measures. A number that improved because the census
   author repaired it in passing has cost its criterion the prior failure that makes a later pass
   mean something.
2. **Blank is blocked, not unmet.** A criterion whose "today" cell is empty blocks the phase that
   would fix it. No number here may be invented.
3. **A passing census number is a finding.** If a criterion passes before any work is done it is a
   suspected banned shape 1. Do not adjust it — send it back to the parent register to be rewritten.

<!-- /ANCHOR:criteria -->
---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

This phase closes when both tripwires have been demonstrated to fail against their deliberately
converted guards — with the mutation, the command and both numbers on record — and when every "today"
cell in the packet carries a measured number.

Neither AC-31 nor AC-32 closes here. They are armed here and they close in 001, against the tree that
actually converted the other seven. A tripwire that was never exposed to the conversion it
guards has not been tested; it has been written.

<!-- /ANCHOR:closure -->
