---
title: "Feature Specification: Remaining Saved Config"
description: "One config transaction after inspect: add display-only Remaining and Saved (if distinct) via Formula modal or flattened YAML, set view columnOrder and human labels, pin computedSyncMode display-only. No fork TypeScript."
trigger_phrases:
  - "remaining saved config"
  - "saveFormula"
  - "computed fields yaml"
  - "columnOrder remaining"
  - "display-only sync"
  - "null-guard remaining"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/003-reports-computed-fields/002-remaining-saved-config"
    last_updated_at: "2026-08-25T19:30:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored remaining-saved config child from synthesis and final-plan"
    next_safe_action: "Apply the one config transaction after the 001 inspect record exists"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-remaining-saved-config"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Remaining Saved Config

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
| **Phase** | 2 of 3 |
| **Predecessor** | 001-live-reports-inspect |
| **Successor** | 003-reports-display-proof |
| **Handoff Criteria** | Remaining (and Saved unless skipped) present; view columnOrder set; display-only explicit; engine git diff empty |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-live-reports-inspect` · Successor: `003-reports-display-proof`. Depends on the inspect record. Do not invent `[field]` names.

This child is final-plan steps 3–5 as **one config transaction**. Remaining, Saved (or the recorded skip), view `columnOrder`, human labels, and explicit `computedSyncMode: display-only` ship together. Do not add `src/data/RemainingSaved.ts`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Reports still lacks Remaining and Saved as live computed columns. The native engine already rewrites `[Name]` to `field("name")` (`ComputedField.ts:549-554`), seeds rollups into a multi-pass evaluator (`ComputedEvaluator.ts:29-48`), and reads rollup columns only from `computed[column.key]` (`ComputedField.ts:557-572`). Persistence is flattened (`DataSource.ts:1041-1062`); a hand-edit of `schema.computedFields` is ignored. `normalizeColumnOrder` pushes unknown keys last (`ColumnConfig.ts:58-60`), so Remaining/Saved must be inserted on the view `columnOrder`. Bare subtraction of a null rollup becomes `0` (`SafeEval.ts:962-1108`).

### Purpose
After the inspect record exists, add Remaining (and Saved if not skipped) as `type: "number"` `ComputedFieldDef`s (`types.ts:102-109`) with matching `type: computed` columns, order them Income then Expenses then Remaining then Saved on `views[].columnOrder` (`ColumnConfig.ts:64-74`), and pin `computedSyncMode: display-only` (`DataSource.ts:1056`). Prefer `DatabaseView.saveFormula` (`:5678-5705`). Inherit EuroFormat call sites; add no TypeScript.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **One config transaction** using inspected field names verbatim from child 001.
- **Preferred:** Formula modal → `saveFormula` (`DatabaseView.ts:5678-5705`) creating `{key,label,expression,type:"number"}` and matching `type: computed` columns with `computedKey`. Still no-ops persistence under display-only (`:5703` to `:10337`).
- **Alt:** flattened YAML `computedFields` + `columns` next to `computedSyncMode` (`DataSource.ts:1041-1062`; parse `:634-636,787`). Not nested under `schema:`.
- Remaining expression: null-guarded `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` unless the inspect record opted into bare subtraction.
- Saved: ship only if inspect locked a distinct expression (Sales outflow, same null-guard). Otherwise skip. Native `[field]` syntax; no `expressionSyntax: "base"`.
- View `columnOrder` Income, Expenses, Remaining, Saved (`ColumnConfig.ts:64-74`); new keys not in `hiddenColumns` (`:100-101`). Human `label`s (`types.ts:102-104`).
- `computedSyncMode: display-only` explicit (`DataSource.ts:1056`). Never `automatic`. Unknown modes already normalize (`ComputedSync.ts:42-45`) — still write it explicitly. Sole writer `syncComputedForFile` returns unless automatic (`DatabaseView.ts:10244`).
- Remaining/Saved ride `row.computed[col.computedKey || col.key]` (`ColumnDisplay.ts:63-65`) through existing `CellRenderer.ts:13,198` and `:2576` / `SummaryRenderer.ts:7,556`.

### Out of Scope
- Inventing names or expressions (child `001-live-reports-inspect`).
- Known-pair / empty-month / mistype / hash proofs (child `003-reports-display-proof`).
- A new `src/data/` module or a fourth formatting call site.
- Any edit to `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts`.
- Percent Saved, MAX, inline errors, `LET` (parent deferred).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Reports `db_view` (path from inspect record) | Modify | Flattened `computedFields` + `columns` + view `columnOrder` + explicit `computedSyncMode: display-only` |
| `src/data/EuroFormat.ts` and CellRenderer/SummaryRenderer call sites | Do not change | Inherited formatter path |
| Fork engine files listed above | Do not change | REQ-003 freeze |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Remaining exists as a display-only number computed field | `ComputedFieldDef` `{key,label,expression,type:"number"}` (`types.ts:102-109`) plus matching `type: computed` column with `computedKey`; expression uses inspected names and the locked null-guard (or recorded zero opt-in); native `[field]` syntax |
| REQ-002 | Config stays display-only | Payload has `computedSyncMode: display-only` explicit (`DataSource.ts:1056`); never `automatic` |
| REQ-003 | Native engine source is untouched | `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Saved ships only when distinct | Second `type: "number"` def if Sales is an outflow (null-guarded minus Sales); otherwise skip is recorded. No percent Saved |
| REQ-005 | Columns are ordered and labeled | View `columnOrder` is Income, Expenses, Remaining, Saved (`ColumnConfig.ts:64-74`); new keys out of `hiddenColumns` (`:100-101`); human labels (`types.ts:104`) |
| REQ-006 | No new plugin module | Zero new `src/data/*.ts`; Remaining/Saved use existing CellRenderer/SummaryRenderer / `ColumnDisplay.ts:63-65` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Remaining (and Saved unless skipped) are present on Reports as computed columns using the inspect-locked expressions.
- **SC-002**: Left-to-right view order is Income, Expenses, Remaining, Saved with human labels.
- **SC-003**: The phase diff for this child is Reports `db_view` config only; engine files are unmodified.

### Acceptance Scenarios

- **Given** the 001 inspect record exists, **when** Remaining is added via `saveFormula` (`DatabaseView.ts:5678-5705`) or flattened YAML, **then** a `type: number` def and matching `type: computed` column exist.
- **Given** Sales is unused or income-side, **when** this config transaction runs, **then** Saved is omitted unless the operator confirmed a duplicate.
- **Given** Remaining/Saved keys are new, **when** view `columnOrder` is not edited, **then** `normalizeColumnOrder` would push them last (`ColumnConfig.ts:58-60`) — so this child edits `columnOrder` explicitly.
- **Given** `computedSyncMode` is display-only, **when** the view renders, **then** `syncComputedForFile` returns without writing (`DatabaseView.ts:10244`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child `001-live-reports-inspect` | Wrong names blank cells | Do not start without the inspect record |
| Risk | Hand-edit `schema.computedFields` | Parse ignores it (`DataSource.ts:1041-1062`) | Formula modal or flattened payload |
| Risk | Skip view `columnOrder` | New keys land last (`ColumnConfig.ts:58-60`) | Same-transaction `columnOrder` edit |
| Risk | Accidental `automatic` sync | Every rollup change writes YAML (`DatabaseView.ts:10244`, debounce `:10286-10330`) | Pin display-only in this same transaction |
| Risk | New `RemainingSaved.ts` | Violates config-only freeze | Inherit EuroFormat call sites |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Names, Saved skip-or-ship, and blank-vs-zero are locked in `001-live-reports-inspect`. Delivery default: Formula modal. Sync default: never `automatic` on an iCloud vault.
<!-- /ANCHOR:questions -->
