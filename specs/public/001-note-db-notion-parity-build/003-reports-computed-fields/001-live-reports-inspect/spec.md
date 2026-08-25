---
title: "Feature Specification: Live Reports Inspect"
description: "Inspect the live Reports db_view after predecessors ship SUM; record note path, column keys/labels, Sales meaning, and lock Remaining/Saved expressions plus blank-vs-zero before any formula write."
trigger_phrases:
  - "live reports inspect"
  - "inspect db_view"
  - "column keys labels"
  - "lock remaining expression"
  - "saved formula inspect"
  - "blank versus zero"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/003-reports-computed-fields/001-live-reports-inspect"
    last_updated_at: "2026-08-25T19:30:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored live-reports inspect child from synthesis and final-plan"
    next_safe_action: "Inspect live Reports db_view after 001 and 002 ship SUM; write the inspect record"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-live-reports-inspect"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Live Reports Inspect

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `003-reports-computed-fields` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 3 |
| **Predecessor** | None |
| **Successor** | 002-remaining-saved-config |
| **Handoff Criteria** | Written inspect record answers Open Q1-Q3; names not assumed; no formula YAML written |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 3** — Parent: [`../spec.md`](../spec.md) · Successor: `002-remaining-saved-config`. Hard gate: `001-live-reports-rollups` and `002-rollup-aggregation-pack` have shipped live SUM rollups. If not, stop. No formulas, no YAML.

This child is final-plan steps 1–2 (one inspect plus locked expressions). Do not write Remaining/Saved until the inspect record exists.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The single biggest risk for this phase is writing the wrong `[field]` names or Saved expression before inspecting live Reports column ids after predecessors ship. `getFieldValue` matches `col.label` or `col.key` (`ComputedField.ts:563-564`); assumed strings `Income` / `Expenses` / `Sales` will blank the cell. Saved's formula is UNKNOWN until Sales' meaning is inspected. The Reports note path is also UNKNOWN.

### Purpose
Produce a written inspect record that answers parent Open Q1–Q3: exact field names, Sales meaning, Reports note path, current `computedSyncMode` / `columns` / `computedFields` / `views[].columnOrder` / `views[].hiddenColumns`, SUM confirmation, locked Remaining/Saved expression strings, and the blank-vs-zero choice. No vault formula write in this child.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Confirm predecessors shipped live SUM rollups. Do **not** block on rollup MAX (`types.ts:39-44`; `RelationRollup.ts:92-129`). Halt if they have not shipped.
- Parse the live Reports `db_view` via `DataSource.parseDatabaseConfig` (`:627-637,787`). Record: note path; `computedSyncMode`; each Income/Expenses/Sales `col.key` + `col.label`; Sales meaning (outflow vs income-side); current `columns`, `computedFields`, `views[].columnOrder`, `views[].hiddenColumns`. Confirm aggregation is `sum` (`types.ts:44`).
- Lock Remaining to the null-guarded default `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` using **inspected** names. `== null` also catches `undefined` (`SafeEval.ts:972`). Genuine `0` sums stay `0` because `0 == null` is false.
- Lock Saved: if Sales is an outflow, `[Income] - [Expenses] - [Sales]` with the same null-guard (any input null → null). If Sales is unused or income-side, **skip Saved** unless the operator explicitly confirms a deliberate duplicate. No percent Saved.
- Blank-vs-zero: default is the null-guard (cell renders `"-"`). Numeric-zero opt-in is the **bare** `[Income] - [Expenses]` (`Number(null) === 0`, `SafeEval.ts:962-1108`). Do **not** use `IFERROR` (`ComputedField.ts:294-304` — `0` is a successful finite result).
- Write the inspect record into this child's docs (Open Questions answered; honest `implementation-summary.md`).

### Out of Scope
- Any Formula-modal or YAML write of `computedFields` / `columns` / `columnOrder` (child `002-remaining-saved-config`).
- Known-pair, empty-month, mistype, hash, or engine-freeze proofs (child `003-reports-display-proof`).
- Percent-of-income Saved, rollup MAX, inline errors, `LET` projections (parent deferred backlog).
- Any fork TypeScript edit. No `RemainingSaved.ts`. EuroFormat is inherited later, not cloned here.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| This child's spec.md / implementation-summary.md inspect record | Modify | Record live path, keys/labels, Sales meaning, locked expressions, blank-vs-zero |
| Reports `db_view` note | Do not change | Inspect only |
| Fork `ComputedField.ts` / `SafeEval.ts` / `RelationRollup.ts` / `types.ts` | Do not change | Read-only confirmation of cited lines |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Predecessors shipped SUM before inspect | `001-live-reports-rollups` and `002-rollup-aggregation-pack` have live SUM rollups; aggregation is `sum` (`types.ts:44`). If not, this child stops with no formula work |
| REQ-002 | Live column ids are recorded, not assumed | Inspect record lists each Income/Expenses/Sales `col.key` and `col.label` (`ComputedField.ts:563-564`); the Reports note path; current `computedSyncMode`; current `columns`, `computedFields`, `views[].columnOrder`, `views[].hiddenColumns` |
| REQ-003 | Expressions are locked before any write | Remaining uses the null-guarded default with inspected names. Saved is either the null-guarded Sales-outflow formula or an explicit skip. `IFERROR` is not used for blank-vs-zero |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Sales meaning decides Saved | Inspect record states outflow vs income-side/unused. Duplicate Remaining is not the default Saved |
| REQ-005 | MAX does not block this child | Inspect record states SUM is sufficient; MAX/Median/Range stay in `002-rollup-aggregation-pack` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A written inspect record in this child answers parent Open Q1–Q3 with live names, not assumed `Income`/`Expenses`/`Sales` strings.
- **SC-002**: Remaining and Saved expression strings (or the Saved skip) are quoted in that record, using the null-guard default unless the operator opted into bare subtraction.
- **SC-003**: The Reports note and all fork TypeScript files are unmodified by this child.

### Acceptance Scenarios

- **Given** predecessors have not shipped live SUM rollups, **when** this child starts, **then** it stops with no formula and no YAML.
- **Given** live Reports columns after 001/002, **when** inspect runs, **then** `col.key`/`col.label` are copied verbatim into the inspect record.
- **Given** Sales is unused or income-side, **when** Saved is decided, **then** Saved is skipped unless the operator confirms a duplicate.
- **Given** an empty-month row will later evaluate Remaining, **when** expressions are locked, **then** the default is `IF(OR(... == null), null, …)` not `IFERROR(..., 0)`.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `001-live-reports-rollups` | No live Income/Expenses/Sales inputs | Halt; do not invent names |
| Dependency | `002-rollup-aggregation-pack` | Rollups cannot SUM | Requires SUM only; do not wait on MAX |
| Risk | Assumed `[field]` strings | Mistype blanks the cell (`ComputedField.ts:508-546`) | Inspect `col.label`/`col.key` first (`:563-564`) |
| Risk | Inventing Saved before Sales meaning is known | Duplicate Remaining columns | Skip Saved unless Sales is an outflow |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

These are the inspect-time questions this child must answer (recommended defaults from parent research):

1. Exact Saved formula (UNKNOWN until inspect): Sales outflow → null-guarded `[Income] - [Expenses] - [Sales]`; else skip Saved. No percent.
2. Exact `[field]` names and Reports note path (UNKNOWN until inspect): match live `col.label` or `col.key`.
3. Blank vs zero (default: null-guard, glyph `"-"`; opt-in: bare subtraction). Do not use `IFERROR`.
<!-- /ANCHOR:questions -->
