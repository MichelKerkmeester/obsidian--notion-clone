---
title: "Feature Specification: Card Field Value Formatting"
description: "Make a number rendered in a card field read the way the same number reads in the table: grouped thousands, a comma decimal separator, and a euro sign on currency columns."
trigger_phrases:
  - "card field formatting"
  - "missing euro sign sheet"
  - "decimals not formatted"
  - "number format card"
  - "019 value formatting"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/019-card-field-value-formatting"
    last_updated_at: "2026-08-30T10:40:00Z"
    last_updated_by: "roadmap-reconciliation"
    recent_action: "Phase opened retroactively for an operator report fixed in the renderer with no owning spec"
    next_safe_action: "Write the first test for the two format functions, which have none"
    blockers:
      - "The parent spec declares output number format out of scope; that exclusion needs an amendment or this phase needs moving"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../../../../src/views/card-field-renderer.ts"
      - "../../../../src/data/euro-format.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-019"
      parent_session_id: null
    completion_pct: 50
    open_questions:
      - "Does the scope exclusion in the parent spec get amended, or does this phase move to the earlier track"
    answered_questions:
      - "Was the formatter missing? No. It existed and four other surfaces already used it; the card renderer was the one number surface not wired to it"
---
# Feature Specification: Card Field Value Formatting

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `018-select-column-affordance-fit`.
> Related: `010-sheet-reading-and-keyboard`, whose criteria build the phone sheet's field rows with
> the same `renderCardField` this phase changes.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-30 |
| **Branch** | `main` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The operator, looking at the record sheet: *"the data doesnt use proper formatting here like in
table itself im missing euro icons and the decimals €1.000,24."*

The comparison in that sentence is the whole defect. The table and the sheet were showing **the same
column of the same record two different ways** — the table grouped the figure and gave a currency
column its symbol; the card printed the raw JavaScript number.

The formatter was never missing. `src/data/euro-format.ts` exports `formatEuroNumber`,
`formatEuroNumber2` and `formatEuroCurrency`, and four surfaces already called them:
`cell-renderer.ts`, `table-footer-renderer.ts`, `summary-renderer.ts` and `reports-display.ts`.
`card-field-renderer.ts` was the one number surface not wired to it, so the record sheet — which
builds its field rows through `renderCardField` — read as unformatted data next to a table that
looked right.

### Purpose

One number, one rendering, wherever it surfaces.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- The numeric branch of `renderCardFieldValue`, and only after the progress-bar and ring display
  styles have taken their own returns.
- A test for the three format functions, which currently have none.
- A criterion that fails when a card and a cell disagree about the same value.

### Out of Scope

- The locale itself. `euro-format.ts` is a declared local fork override pinned to `nl-NL`; changing
  what "proper formatting" means is a different decision from applying it consistently.
- The formula editor's output number format, which the parent spec places on the earlier track.
- Date and datetime display, already routed through `formatDateValueDisplay`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/card-field-renderer.ts` | Modify | Route the finite-numeric branch through the shared formatters |
| `src/data/euro-format.test.ts` | Create | The first test for the three exported formatters |
| `tools/storybook/verify-placement.mjs` | Modify | A check comparing a card's rendered text to a cell's for the same value |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | A currency column renders with grouping, a comma decimal and a euro sign in a card field | AC-1 |
| REQ-002 | A card field and a table cell render the same value identically | AC-2 |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003 | The progress-bar and ring display styles are unaffected | AC-3 |
| REQ-004 | Non-finite values still render the placeholder rather than a formatted `NaN` | AC-4 |
| REQ-005 | The parent spec's scope exclusion is amended or this phase is moved | AC-5 |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Zero columns render differently in a card than in a cell for the same record.
- **SC-002**: The three formatters have tests. Today they have none, on any surface, despite five
  callers.
- **SC-003**: The operator confirms on device that the sheet's figures match the table's.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | The change sits after two early returns, so a display style that returns first is untouched | Low | AC-3 asserts both styles still render their own way |
| Risk | The formatters have five callers and no test | High | AC-6; a shared formatter with no test is one refactor from changing every number in the plugin silently |
| Risk | This work contradicts a written scope exclusion | Med | Named in REQ-005 rather than absorbed. An undocumented deviation is the fault, not the deviation |
| Dependency | `010-sheet-reading-and-keyboard` builds its rows with the same renderer | Low | Its geometry criteria measure boxes and text rectangles, and a longer formatted string can move a text rectangle. Re-run its checks after this lands |
<!-- /ANCHOR:risks -->

---

## 7. THE SCOPE CONFLICT, STATED RATHER THAN RESOLVED

`../spec.md` §2 says, under **Out of scope**: *"Formula editor layout and output number format remain
on the earlier track."*

This phase changes output number format. Two readings are available and this document does not pick
one:

1. The exclusion means the **formula editor's** number format, and a card field's is a different
   surface that this program legitimately owns. The sentence pairs it with formula editor layout,
   which supports this reading.
2. The exclusion means output number format generally, in which case this work was out of scope and
   the fix belongs on the earlier track.

Under reading 1 the parent spec should say so explicitly, because it currently does not. Under
reading 2 this folder should move. **The operator decides.** It is recorded here because the fix
shipped today with neither reading written down anywhere, which is how a scope exclusion stops
meaning anything.

---

## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Roadmap**: [`../roadmap.md`](../roadmap.md)
- **Predecessor**: `018-select-column-affordance-fit`
- **Implementation Plan**: See [`plan.md`](plan.md)
- **Task Breakdown**: See [`tasks.md`](tasks.md)
- **Acceptance Criteria**: See [`acceptance-criteria.md`](acceptance-criteria.md)
