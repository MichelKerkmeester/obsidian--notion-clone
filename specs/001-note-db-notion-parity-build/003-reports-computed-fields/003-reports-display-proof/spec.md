---
title: "Feature Specification: Reports Display Proof"
description: "Prove Remaining/Saved after config: known-pair 1000 minus 400 equals 600, empty-month dash not zero, mistype fail-closed, desktop note-hash unchanged, engine git diff empty."
trigger_phrases:
  - "reports display proof"
  - "known pair remaining"
  - "empty month dash"
  - "mistype Incme"
  - "report note hash"
  - "engine freeze"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/003-reports-computed-fields/003-reports-display-proof"
    last_updated_at: "2026-08-27T17:27:13Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored reports display-proof child from synthesis and final-plan"
    next_safe_action: "Run known-pair, empty-month, mistype, hash, and engine-freeze proofs after config ships"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-reports-display-proof"
      parent_session_id: null
    completion_pct: 73
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Feature Specification: Reports Display Proof

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `003-reports-computed-fields` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 3 |
| **Predecessor** | 002-remaining-saved-config |
| **Successor** | None |
| **Handoff Criteria** | Known-pair, empty-month, mistype, desktop hash, and engine freeze recorded in checklist.md |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-remaining-saved-config`. This child owns final-plan steps 6–11. Config is already written; this child must not “fix” the engine to get a truly empty cell.

The locked default blank is the null-guard. Bare `[Income] - [Expenses]` shows `0` on empty months because `Number(null) === 0` (`SafeEval.ts:962-1108`). Accept `"-" ` as fail-closed display (`CellRenderer.ts:255-257`; `EuroFormat.ts:30-31`).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Without the locked proofs, Remaining can “pass” while showing `0` on empty months. Rollup SUM with no numbers returns `null` (`RelationRollup.ts:126`, `emptyRollupValue` at `:159-160`). `getFieldValue` returns that `null` (`ComputedField.ts:568-571`). SafeEval subtraction uses `Number(val)` so `Number(null) === 0`. `IFERROR(..., 0)` does not save this (`ComputedField.ts:294-304`). Persistence risk is `automatic` sync (`DatabaseView.ts:10244`). A mistype must blank, not write YAML (`ComputedField.ts:511-546`).

### Purpose
Prove Remaining (and Saved if shipped) on the live Reports view: known pair Income=1000 / Expenses=400 → Remaining 600 with nl-NL grouping (`formatEuroNumber`, `CellRenderer.ts:2575-2577`); empty-month `"-" ` not `0`; mistype `[Incme]` fail-closed; desktop note-hash identical after open+scroll; engine `git diff` empty. Record evidence in this packet.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Known-pair proof on desktop Reports (final-plan step 6).
- Empty-month proof: row whose Income and/or Expenses rollup is `null` (`RelationRollup.ts:126`). Default null-guard shows `"-" ` not `0`. Zero opt-in (bare subtraction) shows `0`. No YAML write either way (step 7).
- Negative control: temporarily `[Incme] - [Expenses]` (`formatEvaluationError`, `ComputedField.ts:511-546`); last-pass `console.warn` (`ComputedEvaluator.ts:68-72`); note bytes unchanged; restore and re-prove known pair (step 8).
- Persistence proof (P0): hash Report note before/after open+scroll on **desktop**; `computedSyncMode: display-only` explicit. Mobile/two-device hash is operator-optional (step 9). Platform checks at `DatabaseView.ts:4648,6848` are icon/bulk-editor only.
- Engine freeze: `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts` (step 10).
- Record formulas, names, and blank-vs-zero in `checklist.md` + honest `implementation-summary.md` (step 11).

### Out of Scope
- Writing the formulas (child `002-remaining-saved-config`).
- Inventing names (child `001-live-reports-inspect`).
- Filing an engine bug to get a truly empty cell (T010 / inline errors deferred).
- Two-device hash as a single-implementer blocker (operator-optional).
- Percent Saved, MAX, `LET`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| This child's `checklist.md` / `implementation-summary.md` | Modify | Evidence rows for proofs |
| Reports `db_view` | Temporary mistype only | Restore after negative control |
| Fork engine files | Do not change | Freeze |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Known-pair Remaining is 600 | Desktop row with live Income=1000 and Expenses=400 displays Remaining 600 (`CellRenderer.ts:2575-2577`). Saved matches the locked expression if shipped |
| REQ-002 | Empty months fail closed to `"-" ` under the default | Null rollup row (`RelationRollup.ts:126`) shows `"-" ` not `0` with the null-guard; no YAML write. Bare-subtraction opt-in shows `0` if that was the inspect choice |
| REQ-003 | Report note bytes do not change on desktop open+scroll | Before/after hashes match; `computedSyncMode: display-only` explicit |
| REQ-004 | Engine freeze holds | `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Mistype is fail-closed | `[Incme] - [Expenses]` → cell `"-" `, last-pass `console.warn` (`ComputedEvaluator.ts:68-72`), note unchanged; restore re-proves REQ-001 |
| REQ-006 | Evidence lives in this packet | Inspect-locked formulas, names, blank-vs-zero, and proof results are in `checklist.md` and `implementation-summary.md` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Remaining 600 on the known pair; Saved matches lock if shipped.
- **SC-002**: Empty-month default is `"-" ` not `0`; hashes match; engine diff empty.
- **SC-003**: Negative control restores cleanly.

### Acceptance Scenarios

- **Given** a Report row whose live Income rollup is 1000 and Expenses is 400, **when** Remaining evaluates, **then** it displays 600.
- **Given** a month row whose Income and/or Expenses rollup is `null`, **when** Remaining uses the null-guard, **then** the cell is `"-" ` not `0` and no YAML is written.
- **Given** Remaining is `[Incme] - [Expenses]`, **when** the view evaluates, **then** the cell blanks, the engine warns, and restoring the spelling recovers 600.
- **Given** display-only config, **when** the Reports view is opened and scrolled on desktop, **then** the Report note hash is unchanged.
- **Given** this child has run, **when** engine files are diffed, **then** the four files show no phase changes.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child `002-remaining-saved-config` | Nothing to prove | Do not start until defs exist |
| Risk | Treating `0` on empty months as a pass | Silent-zero finance column | REQ-002 uses the null-guard default |
| Risk | “Fixing” SafeEval so null does not become 0 | Engine edit; violates freeze | Accept `"-" ` glyph; do not patch `SafeEval.ts` |
| Risk | Two-device hash as a blocker | Unclosable by one implementer | Desktop hash is P0; mobile/two-device is optional |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Proofs ride the existing path: in-memory rollups (`RelationRollup.ts:24-89`) and `max(defs.length, 1)` evaluator passes (`ComputedEvaluator.ts:29-48`). No extra note I/O.

### Security
- **NFR-S01**: Formulas stay inside `SafeEval.ts` (no arrows, no loops, no `eval`). No telemetry.

### Reliability
- **NFR-R01**: Display-only values never call `updateFrontmatter`. Errors set `null` and warn on the last pass (`ComputedEvaluator.ts:68-70`).
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Missing/non-numeric Income or Expenses: rollup `null` (`RelationRollup.ts:126`). Bare subtraction → `0`. Null-guard → `"-" `.
- Currency strings still subtract (`coerceValue`, `ComputedField.ts:590-597`).
- Sales unused by Remaining is allowed; never rollup-of-rollup (`RelationRollup.ts:139`).

### Error Scenarios
- Mistyped `[field]`: localized error, `null` cell, no persistence (`ComputedField.ts:508-546`).
- If predecessors never shipped, these proofs must not be treated as passing.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 6/25 | Proofs only; no new config surface |
| Risk | 8/25 | Silent-zero and iCloud write-back are the load-bearing checks |
| Research | 6/20 | Locked by `research/final-plan.md` steps 6–11 |
| **Total** | **20/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Blank-vs-zero and Saved skip-or-ship are locked in `001-live-reports-inspect`. Mobile/two-device hash remains operator-optional.
<!-- /ANCHOR:questions -->
