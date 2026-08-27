---
title: "Feature Specification: Format Display Proof"
description: "Twelve ConditionalFormatting helper cases, grep guards for E1/E7/E8/E9/E10, Chart unmatched, and table plus non-table display proof. Twelve cases are not E1–E12."
trigger_phrases:
  - "format display proof"
  - "conditionalformatting.test"
  - "cf helper cases"
  - "nowrite cf proof"
  - "chart no matcher"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons/005-format-display-proof"
    last_updated_at: "2026-08-25T21:15:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Feature Specification: Format Display Proof

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `010-conditional-format-icons` |
| **Parent Spec** | ../spec.md |
| **Phase** | 5 of 5 |
| **Predecessor** | 004-format-editor-panel |
| **Successor** | None |
| **Handoff Criteria** | Twelve helper cases green; grep guards pass; table tr/td plus one non-table view recorded in checklist.md |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 5 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `004-format-editor-panel`. Synthesis rank 8; final-plan steps 8–9. Honest split: 12 unit cases on the helper + grep for rename/delete/migration. Do not claim 12 = E1–E12 (T021 misses E6/E7/E8/E9/E10 as unit tests).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The fork has zero `*.test.ts` files and `vitest.config.ts:1-8` points at a missing `src/__tests__/setup.ts`. Without a colocated helper gate, empty-tree paint-everything, `parseSourceRuleTree`, and `getEffectiveFilterRules` on CF leaves can regress silently. Checklist CHK-022 must not pretend twelve cases cover E1–E12.

### Purpose
Land `src/data/ConditionalFormatting.test.ts` with the twelve locked helper cases, grep E1/E7/E8/E9/E10 plus no second walker and no Chart matcher, reuse 009 `setup.ts` if present, and record table plus non-table plus narrow-pane proofs in `checklist.md`.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Twelve helper cases in `src/data/ConditionalFormatting.test.ts`: (1) legacy color-only; (2) AND tree; (3) OR tree; (4) first-match collision, no icon/bold merge (E12); (5) empty/missing tree → no match (E2); (6) nested empty group inherits 009 Kleene, CF maps root `null` → no match (E4); (7) `valueSource:"today"` on tree (E5); (8) tree-only missing column fail-closed vs legacy frontmatter (E3); (9) invalid icon token (E11); (10) color-omitted icon/bold; (11) icon span not a child of `TR`; (12) `eq` + empty value still matches on the **legacy** path (`getEffectiveFilterRules` trap).
- Grep, not unit: E7 migration `761-765`; E8/E9 ColumnOperations; E10 extra keys; E1 missing id.
- Grep renderer files for a second CF predicate walker; confirm `ChartRenderer` has no `applyConditionalFormat` binding.
- Diff limited to `ConditionalFormatting.ts`, `types.ts`, `DataSource.ts`, `ViewConfigPanelRenderer.ts`, `ColumnOperations.ts`, `styles.css`, `i18n.ts`, tests (and `setup.ts` / `package.json` only if 009 did not).
- Reuse 009 `src/__tests__/setup.ts` if present; create it only if 009 has not. Add `package.json` `"test": "vitest run"` only if 009 did not.
- Manual: table record+field (`tr`/`td`) plus one non-table view, narrow pane.
- Confirm CF imports stay `CalendarDateTime` / `QueryEngine` / `types` / 009 tree helpers — no `electron` / `fs` / Node; no `App.vault` write; `EmbeddedDatabaseRenderer.ts:3360` still excludes `conditionalFormats`.

### Out of Scope
- Implementing match/parse/editor (children 001–004).
- `Intl.Segmenter` guard; Chart CF; Match Option; `ConditionalFormatTree.ts`.
- Treating grep edges E6-depth / E7 / E8 / E9 / E10 as the twelve unit cases.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/ConditionalFormatting.test.ts` | Create | Twelve helper cases |
| `src/__tests__/setup.ts` | Create only if 009 did not | No-op setup referenced by `vitest.config.ts:1-8` |
| `package.json` | Edit only if 009 did not | `"test": "vitest run"` |
| This child's `checklist.md` / `implementation-summary.md` | Modify | Evidence rows |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Twelve helper cases pass | `npx vitest run` executes `ConditionalFormatting.test.ts` including cases (5), (8), and (12) |
| REQ-002 | No second CF walker | Grep of renderer files finds no extra CF predicate engine; `ChartRenderer` has no `applyConditionalFormat` binding |
| REQ-003 | Display-only | No `App.vault` write on evaluate; `EmbeddedDatabaseRenderer.ts:3360` still excludes `conditionalFormats` |
| REQ-004 | Diff stays in the locked files | Change set is the parent Scope files plus tests; `setup.ts` / `package.json` only if 009 did not |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Grep edges recorded | E1 missing id, E7 `761-765`, E8/E9 ColumnOperations, E10 extra keys verified by grep |
| REQ-006 | Manual surfaces | Table `tr`/`td` plus one non-table view at narrow pane recorded in `checklist.md` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Twelve helper cases green, including empty-tree non-match, missing-column split, and legacy empty-`eq`.
- **SC-002**: Grep shows one matcher, no Chart binding, locked diff.
- **SC-003**: Table and one non-table view paint from the shared helper.

### Acceptance Scenarios

- **Given** the twelve cases, **when** vitest runs, **then** (5) empty tree does not match, (8) tree-only missing column is false while legacy frontmatter still matches, and (12) legacy empty-`eq` still matches.
- **Given** renderer sources, **when** grepped for a second CF walker, **then** none exists and Chart stays unmatched.
- **Given** table record CF on `tr` and field CF on `td`, **when** a rule matches, **then** format comes from `applyConditionalFormat` (`TableRenderer.ts:463,503`).
- **Given** evaluation, **when** a child amount note is unchanged, **then** no extra vault write is issued (`:3360`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Children 001–004 | Nothing to prove | Do not start until helper, parse, column ops, and editor exist |
| Risk | Fighting 009 over `setup.ts` | Duplicate harness | Reuse 009 file; create only if missing |
| Risk | Calling 12 = E1–E12 | False coverage | Cases listed; E7–E10 are grep |
| Risk | `applyFilterTree` used as matcher | Empty-tree paints everything | Case (5) must fail that bug |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Tests exercise the existing per-row helper; no second full-table scan.

### Security
- **NFR-S01**: No secrets or telemetry in the test diff.
- **NFR-S02**: Invalid icon tokens yield no icon; never `eval` / `SafeEval.ts`.

### Reliability
- **NFR-R01**: Legacy color-only case (1) locks today's color.
- **NFR-R03**: Tests import no `electron` / `fs` / Node besides vitest.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Unit: E2, E3, E4, E5, E11, E12 plus legacy empty-`eq` and color-omitted and TR icon.
- Grep: E1, E7, E8, E9, E10. E6 is 009's depth limit only.

### Error Scenarios
- Missing 009 harness: create `setup.ts` only then.
- Missing editor/parse: proofs stay Planned, not passed.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | Tests + grep + manual; no new production module |
| Risk | 8/25 | Empty-tree, prune trap, Chart creep |
| Research | 6/20 | Locked by `research/final-plan.md` steps 8–9 |
| **Total** | **22/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: no Chart matcher; skip `Intl.Segmenter`; twelve cases plus grep, not twelve = E1–E12.
<!-- /ANCHOR:questions -->
