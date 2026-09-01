---
title: "Implementation Plan: Peek Display Proof"
description: "Ordered proofs after the peek module, CSS, OPEN attach, overlay lifecycle, and Mod+Enter: typecheck, greps, and the locked manual desktop/phone list."
trigger_phrases:
  - "peek display proof plan"
  - "hover open proof"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel/005-peek-display-proof"
    last_updated_at: "2026-08-27T17:27:13Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored peek display-proof child from synthesis edge cases and final-plan step 8"
    next_safe_action: "Run typecheck, greps, and locked manual scenarios after children 001-004 ship"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-peek-display-proof"
      parent_session_id: null
    completion_pct: 86
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Implementation Plan: Peek Display Proof

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Fork typecheck + manual Obsidian table view |
| **Framework** | Existing table render path (untouched except prior children's hunks) |
| **Storage** | Display-only; greps must show no write imports |
| **Testing** | Typecheck; grep; manual; checklist evidence |

### Overview
Final-plan step 8. Effort M for the whole phase; this child is the verification slice. Do not edit `RecordDetailPanel.ts` to make a proof pass.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Children 001–004 shipped module, CSS, attach+lifecycle, and Mod+Enter.

### Definition of Done
- [ ] Typecheck green; greps pass; manual list recorded in `checklist.md`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Observation-only proofs over the phase diff. No fourth `DatabaseView` hunk.

### Key Components
- **Grep isolation**: new module vs `DataSource`; diff vs toolbar / calendar CSS / calendar TS.
- **Manual matrix**: desktop hover, phone CSS, title vs OPEN vs Page Preview, hidden group, zero-property, wrap, keys, scroll, title-hidden, calendar edit.

### Data Flow
Open table → OPEN → peek reads `RowData` → stringify → no writes. Refresh calls `syncTableRecordPeek`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. This child observes `TableRecordPeek.ts`, `DatabaseView.ts` hunks, `styles.css`, and the calendar panel. It must not update those producers except to revert a failed proof.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm children 001–004 artifacts exist.

### Phase 2: Core Implementation
- [ ] Typecheck + greps + manual list. No new production files.

### Phase 3: Verification
- [ ] Fill `checklist.md` evidence; honest `implementation-summary.md`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Typecheck | Phase diff | Fork tsc |
| Grep | Module writes; toolbar; calendar file | `rg` / `git diff` |
| Manual | Final-plan step 8 list | Obsidian desktop + `body.is-phone` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Children 001–004 | Child predecessors | Required | Nothing to prove |
| Table view in the vault | Vault | Required | Cannot run manuals |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Proofs fail, calendar panel stops editing, or a "fix" edited `RecordDetailPanel.ts`.
- **Procedure**: Revert the offending child hunk. Do not ship with OPEN navigating or with an orphan peek.
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
| Setup (confirm hunks) | Low | 15 minutes |
| Typecheck + greps | Low | 30 minutes |
| Manual matrix | Medium | 2–3 hours |
| Evidence record | Low | 20 minutes |
| **Total** | | **Part of phase M (~6h)** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Children 001–004 diffs identifiable.
- [ ] Calendar `RecordDetailPanel.ts` hash known before proofs.

### Rollback Procedure
1. If a proof "fix" edited the calendar module, revert it.
2. If OPEN navigates, revert the `renderCell` button wiring.
3. If refresh orphans, restore overlay-lifecycle hunk.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: Display-only. Hidden-group toggle is in-memory CSS.
<!-- /ANCHOR:enhanced-rollback -->
