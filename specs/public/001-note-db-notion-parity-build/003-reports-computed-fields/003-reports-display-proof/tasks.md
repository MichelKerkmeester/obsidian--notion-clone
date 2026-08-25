---
title: "Tasks: Reports Display Proof"
description: "Ordered proof tasks: known pair, empty month, mistype, desktop hash, engine freeze, packet evidence."
trigger_phrases:
  - "reports display proof tasks"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Tasks: Reports Display Proof

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child `002-remaining-saved-config` shipped Remaining (and Saved if not skipped), view `columnOrder`, and explicit display-only. Hash the Report note before opening the view [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Proofs only; no new config. Do not edit fork TypeScript.

- [ ] T002 Known-pair proof: desktop Reports row with live Income=1000, Expenses=400 → Remaining displays 600 (`formatEuroNumber`, `CellRenderer.ts:2575-2577`). Saved matches the locked expression if shipped (Reports view) [S]
- [ ] T003 Empty-month proof: row whose Income and/or Expenses rollup is `null` (`RelationRollup.ts:126`) — default null-guard shows `"-" ` not `0` (`CellRenderer.ts:255-257`; `EuroFormat.ts:30-31`); zero opt-in (bare subtraction) shows `0` only if inspect recorded it. No YAML write either way (Reports view + note bytes) [S]
- [ ] T004 Negative control: temporarily set Remaining to `[Incme] - [Expenses]` → cell blanks (`formatEvaluationError`, `ComputedField.ts:511-546`), last-pass `console.warn` (`ComputedEvaluator.ts:68-72`), note bytes unchanged; restore and re-prove T002 (Reports `db_view`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Persistence proof (P0): hash Report note after open+scroll on desktop; hashes match T001; `computedSyncMode: display-only` explicit. Mobile/two-device hash operator-optional (`DatabaseView.ts:4648,6848` are icon/bulk-editor only) (Report note) [S]
- [ ] T006 Engine freeze: `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, `RelationRollup.ts` [S]
- [ ] T007 Record evidence: formulas, inspected names, blank-vs-zero, and proof results in `checklist.md` + honest `implementation-summary.md` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Known-pair, empty-month, mistype, desktop hash, and engine freeze all passed
- [ ] `checklist.md` evidence filled
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Parent synthesis**: `../research/synthesis.md` Edge cases
- **Parent final-plan**: `../research/final-plan.md` steps 6–11
<!-- /ANCHOR:cross-refs -->
