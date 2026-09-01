---
title: "Feature Specification: Percent Aggregation Pack"
description: "Add percentEmpty/percentFilled last, computed from related-row totals including empties (not flattened numbers), with modal options and chart percent-empty / percent-not-empty routed through Aggregate.ts."
trigger_phrases:
  - "percent empty"
  - "percent filled"
  - "percent aggregation"
  - "rollup percent"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/002-rollup-aggregation-pack/003-percent-aggregation-pack"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored percent-pack child from synthesis rank 6 and final-plan step 9"
    next_safe_action: "Implement percentEmpty/percentFilled after numeric and date children"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-percent-aggregation-pack"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Percent Aggregation Pack

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
| **Phase** | 3 of 3 |
| **Predecessor** | 002-date-aggregation-pack |
| **Successor** | None |
| **Handoff Criteria** | Percents use all-row denominators; 0 rows → 0; N all-empty → 100/0; charts keep `?? 0` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-date-aggregation-pack`. Ships last so the shared math module is not split into `003-reports-computed-fields`. Predicate already includes percent ids from child 001.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion universal rollups include Percent empty / Percent not empty. Charts already emit 0–100 floats (`ChartAggregation.ts:788-789`). Rollup columns and footers do not. Flatten in `RelationRollup.ts:102-109` drops `null`/`""`, then `numbers.length === 0` returns `null` — so all-empty related rows would become `null` instead of percentEmpty `100`, and zero related rows would become `null` instead of `0`. Percents cannot reuse the numeric path or average's non-empty denominator (`:126-128`).

### Purpose
Add `percentEmpty`/`percentFilled` on row totals including empties, dispatch from `records` + `getTargetFieldValue` **before** `:126`, wire modal options, and route chart `percent-empty` / `percent-not-empty` through Aggregate with `?? 0`. Do not add footer percent kinds this phase.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `Aggregate.ts` `percentEmpty`/`percentFilled(total, emptyCount)` (or equivalent). `total === 0` → `0`. All-null N rows → percentEmpty `100` / percentFilled `0`. Scale 0–100. Filled is the complement. Do not reuse average's non-empty denominator.
- Dispatch in `RelationRollup.ts` from `records` + `getTargetFieldValue` **before** `:126`, not from flattened `numbers`. Missing target still uses `emptyRollupValue` → `null` (`:64-66`, `:159-160`).
- Modal options; reuse `chart.percentEmptyAggregation` (`ChartViewModel.ts:41-48`).
- Chart `percent-empty` / `percent-not-empty` (`ChartAggregation.ts:788-789`) through Aggregate with `?? 0`.
- `isNumericRollupKind` already includes percent ids from child 001 — do not retouch five clones.

### Out of Scope
- Footer percent kinds (footers lack them today).
- Checkbox checked / unchecked / percent-checked (`ChartAggregation.ts:792-795`).
- Changing average's non-empty denominator.
- Count unique / show unique; `RollupConfig` format slot.
- Unifying empty chrome (chart 0 vs rollup empty text).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/Aggregate.ts` | Edit | `percentEmpty` / `percentFilled` on row counts |
| `src/data/types.ts` | Edit | Ensure `"percentEmpty" \| "percentFilled"` (or the fork's chosen ids) on `:44` |
| `src/data/RelationRollup.ts` | Edit | Percent dispatch from `records` before `:126` |
| `src/data/ChartAggregation.ts` | Edit | Route `:788-789` through Aggregate; keep `?? 0` |
| `src/views/modals/RelationRollupConfigModal.ts` | Edit | Percent options + existing i18n |
| `src/data/Aggregate.test.ts` | Edit | 0 rows; N all-empty; mixed empty/filled |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Percent functions use all-row denominators | `total === 0` → `0`; N rows all empty → 100 / 0; mixed uses `emptyCount / total × 100` on a 0–100 scale |
| REQ-002 | Rollup percent dispatch does not use flattened `numbers` | Reads `records` + `getTargetFieldValue` **before** `:126`; missing target → `null` via `emptyRollupValue` (`:159-161`) |
| REQ-003 | Average denominator stays non-empty | Existing avg at `RelationRollup.ts:126-128` unchanged; two denominators, documented, not unified |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Charts share percent math | `percent-empty` / `percent-not-empty` (`ChartAggregation.ts:788-789`) call Aggregate; keep `?? 0` |
| REQ-005 | Modal offers percent kinds | Reuse `chart.percentEmptyAggregation`; no new `i18n.ts` block unless a key is missing |
| REQ-006 | No footer percent kinds and no clone retouch | Footers unchanged for percents; five eligibility clones already cover percent ids from child 001 |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: CHK-027 two denominators — percents divide by total related rows including empties; avg still divides by non-empty `numbers.length`.
- **SC-002**: 0 related rows → `0`; N rows all empty → percentEmpty `100` / percentFilled `0`; missing target → `null`.
- **SC-003**: Chart percents stay 0–100 with empty→0 at the chart edge.
- **SC-004**: Display-only; no frontmatter writes.

### Acceptance Scenarios

- **Given** zero related rows, **when** percentEmpty or percentFilled runs, **then** Aggregate returns `0` (not `null`).
- **Given** N related rows that are all empty, **when** percentEmpty runs, **then** the result is `100` (not `null` from the numeric empty path).
- **Given** a missing target field, **when** the rollup renders, **then** `emptyRollupValue` still yields `null`.
- **Given** chart percent-empty on an empty series, **when** `getStatValue` returns, **then** the edge mapping `?? 0` still shows 0.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child 001 predicate includes percent ids | Would retouch five clones | Child 001 REQ-005 already lists future percent ids |
| Risk | Percent reuses flattened `numbers` | All-empty → `null` instead of 100 | REQ-002 records path before `:126` |
| Risk | Conflating 0 rows with all-null targets | Wrong 0 vs 100 | Locked three-way table in synthesis |
| Risk | Unifying avg and percent denominators | Breaks existing avg | REQ-003 leave avg untouched |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked default: include percent-empty/filled in this phase, last, so the shared module is not split into reports. Checkbox percents stay out (REQ-001 empty/filled only).
<!-- /ANCHOR:questions -->
