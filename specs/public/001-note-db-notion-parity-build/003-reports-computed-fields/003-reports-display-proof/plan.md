---
title: "Implementation Plan: Reports Display Proof"
description: "Ordered proofs after Remaining/Saved config: known pair, empty month, mistype, desktop hash, engine freeze, packet evidence."
trigger_phrases:
  - "reports display proof plan"
  - "known pair"
  - "empty month"
  - "engine freeze"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/003-reports-computed-fields/003-reports-display-proof"
    last_updated_at: "2026-08-25T19:30:00Z"
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
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Implementation Plan: Reports Display Proof

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian Reports view + vault note bytes |
| **Framework** | Existing computed-field engine (untouched) |
| **Storage** | Display-only; hashes must match |
| **Testing** | Manual Reports view; file hash; `git diff`; checklist evidence |

### Overview
Final-plan steps 6–11. Re-budget: verification 45–60 minutes. Do not patch `SafeEval.ts` when empty months would otherwise show `0`.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Child `002-remaining-saved-config` shipped defs, `columnOrder`, and display-only.
- [ ] Inspect-locked expressions and blank-vs-zero choice available.

### Definition of Done
- [ ] Known pair Remaining 600.
- [ ] Empty-month `"-" ` (default) or recorded `0` opt-in; no YAML write.
- [ ] Mistype restored; desktop hashes match; engine diff empty.
- [ ] Checklist evidence filled honestly.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Observation-only proofs over the config child. Temporary mistype is the only Reports-note edit, and it is restored.

### Key Components
- **Known pair**: live SUM rollups → Remaining arithmetic → `formatEuroNumber` (`CellRenderer.ts:2575-2577`).
- **Empty month**: `null` rollup (`RelationRollup.ts:126`) vs null-guard vs `Number(null)===0` (`SafeEval.ts:962-1108`) vs glyph `"-" ` (`EuroFormat.ts:30-31`).
- **Persistence**: `syncComputedForFile` inert while display-only (`DatabaseView.ts:10244`).

### Data Flow
Open Reports → evaluator fills `row.computed` → CellRenderer formats → note bytes must not change.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. This child observes CellRenderer, ComputedEvaluator, RelationRollup, and the Reports note. It must not update those producers. Algorithm invariant: empty-month default is `"-" ` not `0`; do not treat finite `0` from `Number(null)` as a pass.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm Remaining (and Saved if shipped) exist from child 002.
- [ ] Hash the Report note before opening the view.

### Phase 2: Core Implementation
- [ ] Run known-pair, empty-month, mistype (restore), desktop hash, engine freeze.
- [ ] Do not edit fork TypeScript.

### Phase 3: Verification
- [ ] Fill `checklist.md` evidence rows.
- [ ] Honest `implementation-summary.md` (formulas, names, blank-vs-zero, pass/fail).
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual arithmetic | Income=1000, Expenses=400 → Remaining 600 | Obsidian Reports (desktop) |
| Empty-month | Null rollup row: `"-" ` vs `0` | Reports view |
| Negative control | `[Incme]` then restore | Reports edit + hash |
| Persistence | Note hash before/after open+scroll | File hash |
| Constraint | Four engine files unchanged | `git diff` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `002-remaining-saved-config` | Child predecessor | Required | Nothing to prove |
| `001-live-reports-inspect` | Child predecessor | Required | Need locked expressions |
| Reports `db_view` access | Vault | Required | Cannot open the view |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Proofs fail, mistype left in place, or an engine “fix” appeared.
- **Procedure**: Restore Remaining expression from the inspect record. Restore note YAML from child 002 backup. Revert any fork TypeScript (there must be none). Do not ship with empty-month showing `0` under the null-guard default.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | Child 002 config | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup (hash + confirm defs) | Low | 10 minutes |
| Proofs (known pair + empty month + mistype + hash + diff) | Low | 45–60 minutes |
| Evidence record | Low | 10 minutes |
| **Total** | | **~1 hour (effort S)** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Child 002 backup of Reports `db_view` still available.
- [ ] Engine files confirmed unmodified before proofs.

### Rollback Procedure
1. Restore Remaining/Saved expressions if the mistype was left in place.
2. Confirm Report YAML has no written-back formula fields.
3. Confirm fork TypeScript still has no phase diff.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: Config-only. Display-only formulas do not persist results.
<!-- /ANCHOR:enhanced-rollback -->
