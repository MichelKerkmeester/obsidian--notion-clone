---
title: "Tasks: Multigroup Display Proof"
description: "Ordered proof tasks: render matrix, persist reload, patch valve, mobile, diff-shape, display-only, packet evidence."
trigger_phrases:
  - "multigroup display proof tasks"
  - "table grouping matrix"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/005-multigroup-display-proof"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored multi-group display-proof child from synthesis and final-plan"
    next_safe_action: "Run render matrix and persist proofs after children 001-004 ship"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-multigroup-display-proof"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Tasks: Multigroup Display Proof

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

Proofs only; no fork TypeScript. Nested DnD stays out.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm children 001–004 shipped module, flatten loop, embed copy-back, and table Sub-group picker. Snapshot a 1-field grouped table if identity must be compared [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 Render matrix: 1 / 2 / 3-field (data layer only for 3); nulls → `t("common.uncategorized")` (`QueryEngine.ts:279`); empty groups (`GroupVisibility.ts:52-60`; multi-select default hidden `:20`); mixed types (`QueryEngine.ts:276-280`); checkbox/date at depth (`:261`); multi-select fan-out (`:143-147`); computed refusal (planned warn); empty DB (`TableRenderer.ts:92-98`); hidden parent hides subtree; filter-before-group (`DatabaseView.ts:6313` then `:6332`) (table view) [M]
- [ ] T003 Persistence reload: `groupByFields: [Category, Type]` still nests; 1-field byte-identical + hide keys unchanged (`DataSource.ts:885, 1088`) [S]
- [ ] T004 Patch valve: 1-field `patchGroupedRows` still works; 2-field returns false and full-rerenders (`TableRenderer.ts:209-250`; `DatabaseView.ts:2199-2272`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Mobile ≤360px: no new media queries; overflow equal to today (`TableRenderer.ts:112`); toggles 20×20 (`styles.css:6218-6219`) [S]
- [ ] T006 Diff-shape: 1 new `src/data/` module + 3 logical sites (DatabaseView dispatch+render, TableRenderer loop, types+DataSource); CSS + Embedded + toolbar additive; rebase dry-run; grep `MultiFieldGrouping.ts` for vault writes / `fetch` [S]
- [ ] T007 Nested DnD still out: depth > 0 has no `setupGroupDropTarget`; drop on a Type header does not write. Record evidence in `checklist.md` + honest `implementation-summary.md` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Render matrix, persist, patch, mobile, diff-shape, and no-write all passed
- [ ] `checklist.md` evidence filled
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Parent synthesis**: `../research/synthesis.md` Edge cases
- **Parent final-plan**: `../research/final-plan.md` step 7
<!-- /ANCHOR:cross-refs -->
