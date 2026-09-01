---
title: "Feature Specification: Date Aggregation Pack"
description: "Add earliest/latest rollup kinds through Aggregate.ts, extract dates before the numeric empty return, map earliest/latest to display type date, filter the modal by date-like columns, and route footer EARLIEST/LATEST through Aggregate."
trigger_phrases:
  - "date aggregation"
  - "earliest latest"
  - "rollup date"
  - "dateKey"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/002-rollup-aggregation-pack/002-date-aggregation-pack"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored date-pack child from synthesis rank 5 and final-plan step 8"
    next_safe_action: "Implement earliest/latest after the numeric same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-date-aggregation-pack"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Date Aggregation Pack

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `002-rollup-aggregation-pack` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 3 |
| **Predecessor** | 001-numeric-aggregate-module |
| **Successor** | 003-percent-aggregation-pack |
| **Handoff Criteria** | Earliest/latest render through `renderDate` / footer dateKey, not `String(Date)` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-numeric-aggregate-module` · Successor: `003-percent-aggregation-pack`. Depends on the numeric child's `Aggregate.ts` module; does not wait on percents.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion Date-property rollups expose Earliest date / Latest date / Date range. Fork rollup columns have none. Footers already do EARLIEST/LATEST via `toDateTimestamp` (`DateTimeFormat.ts:203-214`) and format with `parseDateTimeParts(...)?.dateKey` (`SummaryRenderer.ts:552`). If date kinds are added without a display-type map, `getColumnDisplayType` keeps the text path (`ColumnDisplay.ts:18-23`) and cells render `String(Date)` (`CellRenderer.ts:231-232`).

### Purpose
Add `earliest`/`latest` to `Aggregate.ts` on timestamp arrays, dispatch them in `RelationRollup.ts` **before** the numeric `numbers.length === 0` return, map `earliest|latest` → `"date"` (not via `isNumericRollupKind`), offer date kinds in the modal via `isDateLikeColumnType`, and route footer EARLIEST/LATEST through Aggregate while keeping the existing dateKey formatter.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `Aggregate.ts` `earliest`/`latest(timestamps: readonly number[])` returning `Date | null`. Empty/all-invalid → `null`. Local wall-time via `toDateTimestamp` (`DateTimeFormat.ts:203-214`), not `Date.parse`.
- Parallel date extraction in `RelationRollup.ts` before `:126`.
- Map `earliest|latest` → `"date"` in `ColumnDisplay.ts:18-23` and `RowPipeline.ts:143-147` so cells use `renderDate` (`CellRenderer.ts:205-206`).
- Modal date-kind filter via `isDateLikeColumnType`; options reuse `viewConfig.summaryEarliest` / `summaryLatest` (`SummaryRenderer.ts:54-71`).
- Footer EARLIEST/LATEST (`SummaryRenderer.ts:455-456`) call Aggregate; keep `parseDateTimeParts(...)?.dateKey` at `:552`.
- Keep numeric `range` numeric-only; keep footer date-ms RANGE fallback `:457-459` and `Nd` chrome `:551-556`. Date span is a formatter concern, not a second Aggregate kind.

### Out of Scope
- Numeric min/max/median/range (child 001).
- Percent empty/filled (child 003).
- Notion start→end date-range chrome; Anytype duration chrome.
- Putting `earliest|latest` inside `isNumericRollupKind`.
- Count unique, checkbox percents, rollup number-format slot.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/Aggregate.ts` | Edit | Add `earliest`/`latest` on timestamps |
| `src/data/types.ts` | Edit | Ensure `"earliest" \| "latest"` on the union at `:44` if unused in child 001 |
| `src/data/RelationRollup.ts` | Edit | Date extraction + dispatch before `:126`; keep `:101` |
| `src/data/DateTimeFormat.ts` | Read | `toDateTimestamp` at `:203-214` stays at the call site |
| `src/data/ColumnDisplay.ts` | Edit | `getColumnDisplayType` maps `earliest\|latest` → `"date"` (`:18-23`) |
| `src/data/RowPipeline.ts` | Edit | `withComputedResultTypes` maps `earliest\|latest` → `"date"` (`:143-147`) |
| `src/views/SummaryRenderer.ts` | Edit | EARLIEST/LATEST via Aggregate (`:455-456`); keep dateKey `:552` |
| `src/views/modals/RelationRollupConfigModal.ts` | Edit | Date-kind options + `isDateLikeColumnType` filter |
| `src/data/Aggregate.test.ts` | Edit | Table rows for earliest/latest empty / single / mixed invalid |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `earliest`/`latest` exist on Aggregate | Take `readonly number[]` timestamps; return `Date \| null`; empty/all-invalid → `null`; no `ChartAggregation` import |
| REQ-002 | Rollup columns dispatch date kinds before the numeric empty return | `RelationRollup.ts` extracts via `toDateTimestamp` (`DateTimeFormat.ts:203-214`) **before** `:126`; rollup-of-rollup `:101` unchanged |
| REQ-003 | Date rollups display as dates, not `String(Date)` | `ColumnDisplay.ts:18-23` and `RowPipeline.ts:143-147` map `earliest\|latest` → `"date"`; cells use `renderDate` (`CellRenderer.ts:205-206`) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Footer EARLIEST/LATEST share the math | `SummaryRenderer.ts:455-456` calls Aggregate; `:552` still uses `parseDateTimeParts(...)?.dateKey` |
| REQ-005 | Config modal offers date kinds only on date-like targets | `isDateLikeColumnType` filter; labels reuse `viewConfig.summaryEarliest` / `summaryLatest` |
| REQ-006 | Numeric range and date RANGE chrome stay split | Aggregate `range` remains numeric; footer keeps date-ms RANGE `:457-459` and `Nd` `:551-556` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Scenario 2 — earliest/latest on a date relation match footer dateKey on the same dates.
- **SC-002**: Date rollup cells use `renderDate`, not `String(Date)`.
- **SC-003**: `earliest|latest` are not members of `isNumericRollupKind`.
- **SC-004**: Display-only; no frontmatter writes.

### Acceptance Scenarios

- **Given** a relation column over dates, **when** the user selects Earliest or Latest, **then** the cell renders through the same dateKey pipeline footers use (`SummaryRenderer.ts:552`).
- **Given** all-invalid date targets, **when** earliest/latest run, **then** Aggregate returns `null`.
- **Given** a single valid date, **when** earliest and latest run, **then** both return that date.
- **Given** a footer RANGE over dates, **when** this child lands, **then** the date-ms fallback (`:457-459`) still formats whole-day spans as `Nd`.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child `001-numeric-aggregate-module` | No `Aggregate.ts` to extend | Wait for numeric same-diff |
| Risk | Date kinds left on the text path | `String(Date)` in cells (`CellRenderer.ts:231-232`) | REQ-003 display-type map, separate from the numeric predicate |
| Risk | Date extract runs after `numbers.length === 0` | All-non-numeric dates return `null` as if empty numbers | Dispatch dates before `:126` |
| Risk | Feeding dates into numeric `range()` | Footer date RANGE regresses | Keep `:457-459` local |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked defaults: keep fork `Nd` / ms at the formatter; Aggregate returns a `Date` for earliest/latest and a number for range; do not implement Notion start→end chrome in this pack.
<!-- /ANCHOR:questions -->
