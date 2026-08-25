---
title: "Implementation Plan: Live Reports Inspect"
description: "Inspect-only plan: confirm SUM predecessors, record live Reports column ids, and lock Remaining/Saved expressions before any config write."
trigger_phrases:
  - "live reports inspect plan"
  - "inspect db_view"
  - "lock expressions"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Live Reports Inspect

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian note-database fork + vault `db_view` (read-only this child) |
| **Framework** | `DataSource.parseDatabaseConfig`; native `[field]` formulas (not written yet) |
| **Storage** | Inspect record in this packet only; no Report YAML write |
| **Testing** | Inspect record completeness against Open Q1–Q3; empty git diff on fork files |

### Overview
Final-plan steps 1–2 as one inspect. After SUM rollups exist, copy live column ids and lock expressions. Bare `[Income] - [Expenses]` evaluates empty months to `0` because `Number(null) === 0` (`SafeEval.ts:962-1108`); the locked default is therefore the null-guard, not `IFERROR`.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Parent `research/synthesis.md` ranks 1–6 and `research/final-plan.md` steps 1–2 read.
- [ ] Hard gate understood: no inspect against missing rollups.

### Definition of Done
- [ ] Predecessors confirmed shipped with `sum` aggregation (`types.ts:44`).
- [ ] Inspect record lists note path, `computedSyncMode`, keys/labels, Sales meaning, current order/hidden columns.
- [ ] Remaining/Saved expressions (or Saved skip) quoted; `IFERROR` not used for blank-vs-zero.
- [ ] Reports note and fork TypeScript unmodified.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Read-only inspect of an already-capable native formula engine. No plugin module. No call-site TypeScript. No write-back.

### Key Components
- **Parser**: `DataSource.parseDatabaseConfig` (`:627-637,787`) — flattened payload, not `schema.computedFields`.
- **Name matching**: `getFieldValue` uses `col.label` or `col.key` (`ComputedField.ts:563-564`).
- **Null arithmetic**: `toNumber` is `Number(val)` (`SafeEval.ts:1106-1108`); `== null` catches `undefined` (`:972`).

### Data Flow
Live rollups already compute in memory (`RelationRollup.ts:24-89`). This child does not add formulas; it only records which names those formulas will use in child 002.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. This child produces an inspect record. It does not update producers, consumers, or tests in the fork. Algorithm invariant: do not type `Income`/`Expenses`/`Sales` until the live column says so; do not wrap blank-vs-zero with `IFERROR`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm `001-live-reports-rollups` and `002-rollup-aggregation-pack` shipped SUM.
- [ ] Read fork citations only: `ComputedField.ts:563-564`, `types.ts:44`, `SafeEval.ts:962-1108`, `DataSource.ts:627-637,787`.

### Phase 2: Core Implementation
- [ ] Inspect the live Reports `db_view` and write the record (path, keys/labels, Sales meaning, current payload).
- [ ] Lock Remaining/Saved expressions and blank-vs-zero into that record.

### Phase 3: Verification
- [ ] Open Q1–Q3 answered with live values, not assumed strings.
- [ ] Confirm no vault YAML and no fork TypeScript changed.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual inspect | Live Reports columns after 001/002 | Obsidian Reports view + parsed `db_view` |
| Record completeness | Open Q1–Q3 answered | This child's spec.md / implementation-summary.md |
| Constraint | No YAML / no engine diff | `git status` on vault note + fork files |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-live-reports-rollups` | Phase predecessor | Must ship first | Halt; no inspect of missing rollups |
| `002-rollup-aggregation-pack` | Phase predecessor | Must ship SUM first | Halt; MAX is not required |
| Reports `db_view` access | Vault config | Required | Cannot copy live keys/labels |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Inspect was run against unshipped predecessors, or names were invented.
- **Procedure**: Discard the inspect record. Do not proceed to `002-remaining-saved-config`. No vault rollback is needed because this child must not have written formulas.
<!-- /ANCHOR:rollback -->
