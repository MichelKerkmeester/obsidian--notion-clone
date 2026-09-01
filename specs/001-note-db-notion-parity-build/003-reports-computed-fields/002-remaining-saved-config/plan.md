---
title: "Implementation Plan: Remaining Saved Config"
description: "One config transaction: Remaining plus Saved if distinct, view columnOrder, human labels, explicit display-only. Formula modal preferred. No TypeScript."
trigger_phrases:
  - "remaining saved config plan"
  - "saveFormula"
  - "flattened computedFields"
  - "display-only pin"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/003-reports-computed-fields/002-remaining-saved-config"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Remaining Saved Config

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Vault `db_view` YAML/config; native Excel-style formulas |
| **Framework** | Existing `ComputedField.ts` / `SafeEval.ts`; Formula modal `saveFormula` |
| **Storage** | Display-only computed values (no Report YAML write-back) |
| **Testing** | Defs present; columnOrder; display-only explicit; empty engine `git diff` (proofs in child 003) |

### Overview
Final-plan steps 3–5 as one config transaction after inspect. Prefer `saveFormula` (`DatabaseView.ts:5678-5705`). On-disk shape is flattened (`DataSource.ts:1041-1062`). EuroFormat is inherited (`CellRenderer.ts:13,198,:2576`; `SummaryRenderer.ts:7,556`), not cloned.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Child `001-live-reports-inspect` inspect record exists with live names and locked expressions.
- [ ] Delivery choice recorded: Formula modal (preferred) or flattened YAML.

### Definition of Done
- [ ] Remaining def present with locked expression; Saved present or skip recorded.
- [ ] View `columnOrder` is Income, Expenses, Remaining, Saved; labels set; keys not hidden.
- [ ] `computedSyncMode: display-only` explicit.
- [ ] No new `src/` file; engine `git diff` empty.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Vault-config computed columns on an already-capable native engine. No plugin module, no call-site TypeScript, no write-back.

### Key Components
- **Core algorithm (already in the fork).** Rollups in memory (`RelationRollup.ts:24-89`) → `evaluateComputedFields` multi-pass (`ComputedEvaluator.ts:29-48`) → `[Name]` rewrite (`ComputedField.ts:549-554`) → rollup reads `computed[column.key]` only (`:557-572`).
- **Config mutation (the only legal change).** Flattened payload:

```yaml
computedSyncMode: display-only
computedFields:
  - key: remaining
    label: Remaining
    expression: "IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])"
    type: number
  # saved: only if inspect locked a distinct Sales-outflow expression
```

  Matching `columns` with `type: computed` and `computedKey`. View `columnOrder` is the order surface (`ColumnConfig.ts:44-74`).
- **EuroFormat inherit.** Remaining/Saved format through existing call sites (`ColumnDisplay.ts:63-65`). Do not add `RemainingSaved.ts`.

### Data Flow
Inspected names go into formula strings. The evaluator resolves Remaining from live Income/Expenses rollups. Nothing writes results back while display-only.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: Reports `db_view` config via `saveFormula` or flattened YAML. Consumers: existing CellRenderer/SummaryRenderer (unchanged). Algorithm invariant: same-transaction Remaining + Saved-decision + `columnOrder` + display-only pin; never `schema.computedFields`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Load the 001 inspect record (path, names, expressions, Saved skip-or-ship, blank-vs-zero).
- [ ] Backup current Reports `db_view` payload for rollback.

### Phase 2: Core Implementation
- [ ] Add Remaining (and Saved if not skipped) via `saveFormula` or flattened YAML.
- [ ] Set view `columnOrder` and labels; keep keys out of `hiddenColumns`.
- [ ] Pin `computedSyncMode: display-only`.
- [ ] Leave all fork TypeScript untouched.

### Phase 3: Verification
- [ ] Defs present; order visible; YAML shows display-only.
- [ ] `git diff` empty on the four engine files.
- [ ] Hand off to `003-reports-display-proof` for known-pair / empty-month / mistype / hash.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Config presence | Remaining (and Saved if shipped) defs + computed columns | Reports `db_view` payload |
| Order | View `columnOrder` Income, Expenses, Remaining, Saved | Reports table header |
| Constraint | Display-only explicit; no engine diff | YAML + `git diff` |
| Manual arithmetic | Deferred to child 003 | Obsidian Reports view |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-live-reports-inspect` | Child predecessor | Required | Cannot write formulas without live names |
| `ComputedField.ts` + `SafeEval.ts` | Fork, existing | Capable per synthesis | This child forbids engine work |
| Reports `db_view` access | Vault config | Required | Cannot add computed columns |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Remaining/Saved wrong, YAML writes, or an engine edit appeared.
- **Procedure**: Restore the saved Reports `db_view` copy. Remove the two `computedFields` entries and matching columns. Unknown sync modes normalize to display-only (`ComputedSync.ts:42-45`). Stray persisted keys from an earlier automatic session: cleanup modal (`DatabaseView.ts:5576+`). Do not revert fork TypeScript (this child must not have changed it).
<!-- /ANCHOR:rollback -->
