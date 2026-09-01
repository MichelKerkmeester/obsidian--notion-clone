---
title: "Implementation Plan: Format Display Proof"
description: "Twelve helper cases, grep guards, Chart unmatched, and table plus non-table display proof after children 001–004."
trigger_phrases:
  - "format display proof plan"
  - "conditionalformatting.test"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons/005-format-display-proof"
    last_updated_at: "2026-08-27T12:50:04Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored format-display-proof child from synthesis rank 8 and final-plan steps 8-9"
    next_safe_action: "Add ConditionalFormatting.test.ts and run grep plus table/non-table proofs"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-format-display-proof"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Implementation Plan: Format Display Proof

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript + Vitest |
| **Framework** | Existing helper; no new matcher |
| **Storage** | Display-only evaluation |
| **Testing** | Twelve unit cases; grep; manual table/non-table |

### Overview
Final-plan steps 8–9. Reuse 009 `setup.ts` if present. Cases (5), (8), and (12) are the residual-risk detectors.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Children 001–004 shipped (helper, parse, column ops, editor).
- [ ] 009 halt already passed in child 001.

### Definition of Done
- [ ] Twelve cases green.
- [ ] Grep guards pass; Chart unmatched.
- [ ] `checklist.md` evidence filled honestly.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Colocated vitest next to the helper. Grep and manual proofs; no production walker.

### Key Components
- **`ConditionalFormatting.test.ts`**: twelve cases.
- **Grep**: E1/E7/E8/E9/E10, second walker, Chart.
- **Manual**: `TableRenderer.ts:463,503` plus one non-table consumer.

### Data Flow
Construct `ViewConfig` + `RowData` → `getConditionalFormatMatch` / `applyConditionalFormat` → assert result and DOM.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. This child observes the helper and consumers. It must not add a Chart matcher or a private walker to "make tests pass". Invariant: twelve unit cases are not E1–E12.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm 009 `setup.ts` / `package.json` `test` script; create only if missing.

### Phase 2: Core Implementation
- [ ] Write twelve cases. Do not edit renderer consumers.

### Phase 3: Verification
- [ ] Grep + manual table/non-table/narrow pane. Fill checklist evidence.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Twelve helper cases | Vitest |
| Grep | E1/E7/E8/E9/E10, second walker, Chart | `rg` |
| Manual | Table `tr`/`td`, one non-table view, narrow pane | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Children 001–004 | Internal | Predecessors | Nothing to prove |
| 009 `setup.ts` | Internal | Reuse if present | Create only if missing |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Tests fail by adding a Chart matcher or a private walker; `setup.ts` fights 009.
- **Procedure**: Delete `ConditionalFormatting.test.ts`. Revert `setup.ts` / `package.json` only if this child created them. Do not patch production to hide a failed case.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | Children 001–004 | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup (harness reuse) | Low | 15 minutes |
| Twelve cases | Medium | 2–3 hours |
| Grep + manual + evidence | Low | 1 hour |
| **Total** | | **~4 hours (effort M)** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] 009 `setup.ts` ownership recorded (reuse vs create).
- [ ] Production files from children 001–004 already reviewed.

### Rollback Procedure
1. Remove `ConditionalFormatting.test.ts`.
2. If this child created `setup.ts` or the `test` script, revert those only when 009 did not own them.
3. Do not add `applyConditionalFormat` to `ChartRenderer`.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: Tests only. Extra JSON keys stay ignored by old code.
<!-- /ANCHOR:enhanced-rollback -->
