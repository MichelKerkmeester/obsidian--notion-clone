---
title: "Feature Specification: Numeric Coercion Parity"
description: "A table row reads a numeric column's stored text with a leading-digits parse, so a value it cannot read whole becomes a shorter number that looks correct; make the row read the whole value or none of it."
trigger_phrases:
  - "numeric coercion parity"
  - "parseFloat cell renderer"
  - "table row wrong number"
  - "1.000,24 renders as 1"
  - "029 coercion"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/029-numeric-coercion-parity"
    last_updated_at: "2026-08-30T18:50:00Z"
    last_updated_by: "phase-author"
    recent_action: "Cell coercion switched to whole-string; 10 harness disagreements closed to 0"
    next_safe_action: "Refresh the 20 stale captures with npm run screenshots, then read them"
    blockers:
      - "screenshots-fresh is red on 20 captures this edit invalidated; the refresh writes outside this phase's scope"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../../../../src/views/cell-renderer.ts"
      - "../../../../tools/storybook/verify-placement.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-029"
      parent_session_id: null
    completion_pct: 71
    open_questions:
      - "Does sorting keep a leading-digits parse now that no display surface uses one"
    answered_questions:
      - "Which coercion wins: the card's, because a prefix parse invents a number the note does not hold"
      - "Does this touch ordinary data? No. A stored number short-circuits both paths and never reaches the coercion"
---
# Feature Specification: Numeric Coercion Parity

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

> Phase chain: parent [`../spec.md`](../spec.md). Sibling
> [`../019-card-field-value-formatting/spec.md`](../019-card-field-value-formatting/spec.md) built
> the card side of this comparison and declared this divergence rather than repairing it; its
> declaration in the harness `KNOWN` map is what this phase replaces with an assertion.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P0 |
| **Status** | In Progress |
| **Created** | 2026-08-30 |
| **Branch** | `main` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Two renderers read the same stored value differently, and the table row is the wrong one.

`card-field-renderer.ts:92,240` coerces with `Number(value)` — the whole string, or nothing. On
failure it prints the text unchanged. `cell-renderer.ts:325,397` coerced with
`parseFloat(String(value))` — the **leading digits only**. On failure it printed `-`.

Measured through both production renderers over one record and one column:

| stored | card shows | table row shows |
|---|---|---|
| `1.000,24` | `1.000,24` | **`1`** |
| `1000,24` | `1000,24` | **`1.000`** |
| `12abc` | `12abc` | `12` |
| `NaN` | `NaN` | `-` |
| `1000.24` | `1.000,24` | `1.000,24` |

The second row is the dangerous one. `1000,24` renders as `1.000`: a number that **looks correct and
is wrong**. The first silently drops three digits. This is not a formatting complaint — the row
misrepresents what the note holds, and nothing in the output says so.

### Purpose

A row prints the value the note holds, or says it cannot read it. It never prints a plausible
substitute.

**The card is the correct side.** It refuses to invent a number. `parseFloat` deriving `1` from
`1.000,24` is wrong under every locale, and no display is improved by a fabricated value. So the
cell stops truncating: coerce the whole string, and on failure show the raw text rather than a
fabricated number or a dash that destroys information.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- The two display coercions in `cell-renderer.ts`: the `currency` branch of `renderCell` and
  `renderNumberValue`.
- Their `-` fallback, narrowed so it still covers the case it was built for.
- Removing the sibling's `KNOWN` declaration and replacing it with a literal assertion that names
  the direction, not just the disagreement.

### Out of Scope

- **Sorting.** `query-engine.ts:236` coerces separately, with `parseFloat(stringifyValue(val)) || 0`.
  §6 records why this is a finding rather than an edit.
- **The record detail panel.** `record-detail-panel.ts:407` carries a third `parseFloat`, gating only
  the rating/progress/ring styles. Same family, different file, not in this phase's write scope.
- **The inline editor's write path.** `cell-renderer.ts:1580` parses typed input with `parseFloat`
  and validates with `Number.isFinite`, so typing `1.000,24` stores `1`. That changes stored data,
  not display, and wants its own phase.
- **The card.** It is the reference here, and `019` owns it.
- **`reports-display.ts`.** `formatReportsNumber` is unchanged and still fails closed.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/cell-renderer.ts` | Modify | Coerce the whole value; print the value itself when it is not a number |
| `tools/storybook/verify-placement.mjs` | Modify | Retire the `KNOWN` entry; add a literal check naming the truncation |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | A numeric column holding text a whole-string coercion rejects renders that text, not a prefix of it | AC-1 |
| REQ-002 | A card and a cell agree byte for byte on every value in the divergent sample | AC-2 |
| REQ-003 | A stored number is untouched: the existing all-numeric sample stays at zero disagreements | AC-3 |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | A computed column with no result keeps its `-` placeholder rather than gaining a `0` | AC-4 |
| REQ-005 | The check can fail: restoring `parseFloat` reddens it | AC-5 |
| REQ-006 | The captures this edit invalidated are refreshed and looked at | AC-6 |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Zero values in the divergent sample render differently in a card than in a cell.
- **SC-002**: No display surface in the plugin parses a leading numeric prefix. Four already used
  whole-string `Number()`; the table cell was the outlier.
- **SC-003**: The operator confirms on device that a hand-authored numeric field reads as written.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Sorting still parses a prefix, so a row can display `1.000,24` and sort as `1` | Med | Named, not absorbed. §7 |
| Risk | `Number("")` is `0` where `parseFloat("")` is `NaN`, so a naive swap turns an empty computed result into a zero | High | AC-4. The emptiness test runs before the coercion, so nothing empty reaches `Number()` |
| Risk | The parity check measures disagreement, so it reports green if both sides drift the same way | Med | AC-1 adds a literal, and AC-5 proves the pair can redden |
| Dependency | 20 screenshot fixtures fingerprint `cell-renderer.ts` | Med | AC-6. Editing the file makes them stale by fingerprint even when the pixels do not move |
<!-- /ANCHOR:risks -->

---

## 7. THE BLAST RADIUS, ESTABLISHED BEFORE THE EDIT

**A stored number never reaches the coercion.** Both sites read
`typeof value === "number" ? value : <coerce>`, so the coercion is unreachable for a YAML number.
This is what bounds the change to hand-authored strings in a numeric column, and it is asserted
rather than asserted-about: the harness's all-numeric sample of 14 pairs sat at zero disagreements
before the change and sits at zero after. A change touching ordinary data would move that count.

**Values typed through the plugin cannot be affected either.** `property-service.ts:226`
converts on save, so a numeric column holds a number or an empty string after any edit made in the
UI. A non-numeric string in a numeric column arrives from hand-authored frontmatter.

**Four surfaces already agreed with the card.** `chart-aggregation.ts:217` exports `toChartNumber`,
which is `Number(value)` with a finite test — whole-string, `null` on failure. The table footer
(`table-footer-renderer.ts:45`), relation rollups (`relation-rollup.ts:206`) and the chart view model
(`chart-view-model.ts:313`) all read numbers through it, and `relation-rollup.ts:204` records that a
"regex strip-and-parse" was deliberately replaced by it. So footer summaries, rollups and charts were
already whole-string. The table cell was the minority of one.

**Callers of the changed code depend on nothing this changes.** `renderNumberValue` has three
callers: the `number` branch of `renderCell`, and two in `editNumber` that re-render the value the
cell already held when an edit is cancelled or is a no-op. None reads the coerced number.
`formatNumber` has one caller, at `cell-renderer.ts:406`, and receives an already-numeric argument —
so the second `parseFloat` inside `toReportsDisplayNumber` is unreachable from this path.

**One caller does depend on the `-`, and it is the reason the fallback narrowed rather than moved.**
`renderCell` skips its empty-value branch when `isReportsComputedColumn(col)` is true, specifically so
an empty Reports formula result falls through to `renderNumberValue` and picks up the `-` there. That
only works because `parseFloat(String(""))` is `NaN`. `Number("")` is `0`, so a direct swap would have
turned an empty Reports cell into `0` — a fail-closed placeholder replaced by a figure. The emptiness
test now runs first and returns `NaN`, which preserves it exactly.

### Sorting: a finding, not an edit

`getSortValue` coerces with `parseFloat(stringifyValue(val)) || 0`, in a file outside this phase's
write scope. After this change a table can display `1.000,24` and sort it as `1`.

That divergence is **not created here**. The card, the list, the board, the footer, the rollups and
the charts already displayed these values whole while sorting parsed a prefix. The table cell was the
one surface that agreed with the sort, and it agreed by being wrong. What changes is that the
inconsistency is now visible on the surface where someone will notice it.

It is left alone deliberately. Sorting changes row order rather than text, its `|| 0` collapses
"not a number" and "zero" into the same key, and correcting it is a wider decision about what a
numeric column may be ordered by. Recorded so the next reader does not have to rediscover it.
