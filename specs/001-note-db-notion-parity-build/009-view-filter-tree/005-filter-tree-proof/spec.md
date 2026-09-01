---
title: "Feature Specification: Filter Tree Proof"
description: "Prove the nested view-filter tree: 010 API freeze, Vitest (A and B) or C plus legacy regression, vault reload and mobile panel, and grep guards for FilterGroup, styles.css, matchesFilter, and SourceRules imports."
trigger_phrases:
  - "filter tree proof"
  - "view filter vitest"
  - "filtertree grep"
  - "010 evaluatefiltertree"
  - "nowrite filter panel"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/009-view-filter-tree/005-filter-tree-proof"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored filter-tree-proof child from synthesis rank 9 and final-plan steps 10-12"
    next_safe_action: "Run Vitest, vault, grep, and 010 freeze after 001-004"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-filter-tree-proof"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Feature Specification: Filter Tree Proof

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Deferred — never executed (predecessors 001-004 shipped; this proof's manual/grep run has no implementation commit; see `implementation-summary.md`) |
| **Created** | 2026-08-25 |
| **Branch** | `009-view-filter-tree` |
| **Parent Spec** | ../spec.md |
| **Phase** | 5 of 5 |
| **Predecessor** | 004-nonpanel-filter-coherence |
| **Successor** | None |
| **Handoff Criteria** | Vitest green, vault nested persist + mobile panel, grep freeze, 010 public surface documented and CF still on `applyFilters` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 5 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `004-nonpanel-filter-coherence`. Final-plan steps 10–12 and synthesis rank 9 (run the harness). Child 001 already authors `ViewFilterTree.test.ts` and `setup.ts`; this child **runs** them, records vault/grep evidence, and freezes the 010 contract. Do not “fix” `ConditionalFormatting.ts:38` here.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Without recorded proofs, nested AND/OR can look done while `DataSource.ts` drops `filterTree` on reload, a source-op leak matches every row (`QueryEngine.ts:124-125`), or phase 010 is forced into `applyFilterTree([row])` (null-passes would paint every row). `ConditionalFormatting.ts:38` must stay on `applyFilters` until 010. Fork `lint` / `build` must still pass.

### Purpose
Run the unit suite, vault nested-filter proofs (phone width, wrap / collapse / depth 3 / `not`, persist, chip + column-delete + drilldown), grep guards, and freeze the 010 public surface: `evaluateViewFilterTree`, `normalizeViewFilterTree`, `QueryEngine.evaluateFilterTree`, `QueryEngine.applyFilterTree`. Record evidence in this packet.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Re-run `npx vitest run` on `src/data/__tests__/ViewFilterTree.test.ts` (cases landed in child 001): `(A and B) or C`; `not` wrapping a group; empty root → all rows; nested empty AND under OR is skip (not `SourceRules.ts:152`, not AppFlowy `controller.rs:493-503`); `expression` → `false`; single-leaf ≡ flat; serialize round-trip; truncated root → `undefined`; `getRequiredViewFilterLeaves` ignores OR children.
- 010 contract freeze: public surface listed above; grep shows no CF import of the new APIs; `ConditionalFormatting.ts:38` unchanged.
- Manual vault: nested filter at phone width; wrap / collapse / depth 3 / `not`; persistence (nested survives, flat has no `filterTree` key); chip + column-delete + drilldown.
- Grep: no `FilterGroup`; `styles.css` untouched; `matchesFilter` not exported; `ViewFilterTree.ts` has no runtime import from `SourceRules.ts`.
- Fork `lint` / `build`.

### Out of Scope
- Authoring the module, persistence, panel, or mutators (children 001–004).
- Changing `ConditionalFormatting.ts:38`.
- AppFlowy `DashMap` cache; evaluator depth cap; `styles.css` edits.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| This packet `checklist.md` / `scratch/` | Modify | Record vitest, vault, grep, lint/build evidence |
| Fork `src/` | None | Proofs must not add a sixth implementation slice |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Vitest suite green | `npx vitest run` executes `ViewFilterTree.test.ts` and the Kleene / legacy cases pass |
| REQ-002 | 010 surface frozen | Exports: `evaluateViewFilterTree`, `normalizeViewFilterTree`, `QueryEngine.evaluateFilterTree`, `QueryEngine.applyFilterTree`. Grep: `ConditionalFormatting.ts:38` has no new imports |
| REQ-003 | Vault nested persist + panel | Nested tree survives reload; flat has no `filterTree` key; panel usable at phone width |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Grep guards | No `FilterGroup`; `styles.css` untouched; `matchesFilter` not exported; no runtime `SourceRules.ts` import from `ViewFilterTree.ts` |
| REQ-005 | Non-panel vault check | Chip + column-delete + drilldown on a nested view stay consistent |
| REQ-006 | Fork lint / build | `lint` / `build` pass after children 001–004 |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Vitest Kleene and legacy cases green.
- **SC-002**: 010 can consume `evaluateFilterTree` without exporting `matchesFilter`.
- **SC-003**: Vault proofs recorded in checklist.md.
- **SC-004**: Grep freeze matches parent SC-002 / SC-006.

### Acceptance Scenarios

- **Given** children 001–004 have shipped, **when** `npx vitest run` runs, **then** `ViewFilterTree.test.ts` is green including nested empty AND under OR is skip.
- **Given** a nested view in the vault, **when** the user saves, reloads, and edits at phone width, **then** the tree is intact and the 4th group layer is refused.
- **Given** a reviewer greps the fork, **when** they search `FilterGroup`, exported `matchesFilter`, `styles.css` this-phase hunks, and `SourceRules` imports from `ViewFilterTree.ts`, **then** all are absent.
- **Given** `ConditionalFormatting.ts:38`, **when** 009 closes, **then** it still calls `applyFilters` and does not import the new APIs.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Treating failed proofs as engine bugs | Drive-by `ConditionalFormatting.ts` or `matchesFilter` export | Fail closed; record; do not expand 009 |
| Dependency | Children 001–004 | Nothing to prove | This child runs last |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked: Kleene documented vs AppFlowy `controller.rs:493-503` in the test file (authored in 001, confirmed here).
<!-- /ANCHOR:questions -->
