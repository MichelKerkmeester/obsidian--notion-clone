---
title: "Feature Specification: Format Parse Persist"
description: "Additive parseConditionalFormats for conditionTree via normalizeViewFilterTree, icon ≤64 chars, bold boolean, and optional color so new CF keys survive reload."
trigger_phrases:
  - "format parse persist"
  - "parseconditionalformats"
  - "normalizeviewfiltertree"
  - "conditiontree parse"
  - "color optional parse"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons/002-format-parse-persist"
    last_updated_at: "2026-08-25T21:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored format-parse-persist child from synthesis rank 4 and final-plan step 5"
    next_safe_action: "Parse conditionTree/icon/bold/optional color in DataSource.parseConditionalFormats"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-format-parse-persist"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Format Parse Persist

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `010-conditional-format-icons` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 5 |
| **Predecessor** | 001-format-match-paint-module |
| **Successor** | 003-tree-aware-column-ops |
| **Handoff Criteria** | New keys load through parseConditionalFormats; parseSourceRuleTree is not used; color-only JSON unchanged |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-format-match-paint-module` · Successor: `003-tree-aware-column-ops`. Synthesis rank 4 plus color-optional **parse** from rank 9; final-plan step 5. The fork whitelist-drops unknown keys (`DataSource.ts:800-825`), so child 001's new fields never load until this child ships. Color-optional paint already landed in 001; this child stops requiring `color` at parse (`:815`).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
`parseConditionalFormats` (`DataSource.ts:800-825`) whitelist-builds CF rules. Unknown keys never load. Today a missing/invalid `color` is rejected (`:815` `!colors.has(color)`), so icon/bold-only rules cannot persist. Calling raw `parseSourceRuleTree` (`SourceRules.ts:227-257`) would admit `inFolder` / `strictEq` / `expression` (`SourceRules.ts:7-28`) that CF cannot evaluate.

### Purpose
Additively parse `conditionTree` via 009 `normalizeViewFilterTree`, `icon` string ≤64 chars, `bold` boolean, and optional `color` still constrained to `OPTION_COLORS` when present, while keeping a parseable `condition` object for Apply-to and rollback.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `parseConditionalFormats` (`DataSource.ts:800-825`): additive `conditionTree` via `normalizeViewFilterTree` (view-op allow-list); `icon` string capped at 64 chars (store capped raw; render fail-closed is child 001); `bold` boolean.
- Keep requiring a parseable `condition` object (Apply-to + rollback).
- Stop requiring `color`; if present it must still be in `OPTION_COLORS`.
- Unknown extra keys ignored (E10). Invalid tree dropped, `condition` kept.
- Legacy db-level copy at `DataSource.ts:761-765` stays `{...rule.condition}` (E7). Do not call `parseSourceRuleTree`.

### Out of Scope
- Match/paint/CSS (child 001).
- Column rename/delete (child 003).
- Editor dual-write (child 004).
- Tests (child 005).
- Changing first-match or migrating db-level rules into a tree at read time.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/DataSource.ts` | Edit | `parseConditionalFormats` `800-825`: additive tree/icon/bold; optional color |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `conditionTree` parses via 009 only | `normalizeViewFilterTree` is the parser; grep: no `parseSourceRuleTree` in CF parse |
| REQ-002 | Legacy color-only JSON is unchanged | Rules without the new keys load as they do today (NFR-R01) |
| REQ-003 | `condition` remains required | A rule with no parseable `condition` object is dropped; Apply-to / rollback keep a leaf |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Icon, bold, optional color load | `icon` string ≤64 chars; `bold` boolean; missing `color` no longer rejects the rule; present `color` still in `OPTION_COLORS` (`:815`) |
| REQ-005 | Fail-closed tree, ignore extras | Invalid tree dropped and `condition` kept; unknown extra keys ignored (E10); db-level copy `761-765` still `{...rule.condition}` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Color-only JSON loads unchanged.
- **SC-002**: Tree + icon + bold JSON loads; color-omitted icon/bold JSON loads.
- **SC-003**: Invalid tree is dropped and `condition` remains; `parseSourceRuleTree` is not called.

### Acceptance Scenarios

- **Given** a pre-phase color-only rule, **when** `parseConditionalFormats` runs, **then** it loads with the same `condition` and `color`.
- **Given** JSON with `conditionTree`, `icon`, `bold`, and no `color`, **when** parse runs, **then** the rule loads (color-optional).
- **Given** a malformed `conditionTree`, **when** parse runs, **then** the tree is dropped and `condition` is kept.
- **Given** unknown extra keys on a rule, **when** parse runs, **then** they are ignored (E10).
- **Given** a db-level legacy rule, **when** it migrates into a view, **then** copy stays `{...rule.condition}` (`761-765`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child 001 types + 009 `normalizeViewFilterTree` | Nothing typed to parse | Do not start until 001 types exist and 009 parser exists |
| Risk | `parseSourceRuleTree` | Source-only operators CF cannot evaluate | REQ-001 grep |
| Risk | Still requiring `color` | Icon/bold-only rules never load | Stop `:815` reject-when-missing; keep allow-list when present |
| Risk | Dropping `condition` | Rollback / Apply-to inert (`:31` without tree) | Keep requiring a parseable `condition` object |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: dual-write `condition` + `conditionTree` at the editor (child 004); this child only **reads** both. Do not write eval-time wraps at parse.
<!-- /ANCHOR:questions -->
