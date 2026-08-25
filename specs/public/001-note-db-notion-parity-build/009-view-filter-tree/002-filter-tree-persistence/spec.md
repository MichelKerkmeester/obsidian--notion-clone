---
title: "Feature Specification: Filter Tree Persistence"
description: "Make nested view filter groups survive save/reload by parsing and serializing filterTree in DataSource.ts and hydrating, persisting, and pruning it in ViewStateStore — omit the key when the tree is a single flat group."
trigger_phrases:
  - "filter tree persistence"
  - "datasource filtertree"
  - "viewstatestore filtertree"
  - "legacy filter promotion"
  - "icloud quiet filtertree"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/009-view-filter-tree/002-filter-tree-persistence"
    last_updated_at: "2026-08-25T21:00:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored filter-tree-persistence child from synthesis ranks 2-3 and final-plan steps 6-7"
    next_safe_action: "Wire DataSource.ts parse/serialize and ViewStateStore hydrate/persist/prune"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-filter-tree-persistence"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Filter Tree Persistence

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `009-view-filter-tree` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 5 |
| **Predecessor** | 001-kleene-eval-module |
| **Successor** | 003-filter-panel-tree-editor |
| **Handoff Criteria** | Nested `filterTree` survives save/reload; flat views omit the key; `create` hydrates via `normalizeViewFilterTree`; recursive dead-field prune |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-kleene-eval-module` · Successor: `003-filter-panel-tree-editor`. Synthesis ranks 2–3 and final-plan steps 6–7. Disk round-trip is not ViewStateStore-only: without `DataSource.ts`, `filterTree` is session-only.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion groups survive close/reopen. The fork's `DataSource.ts` whitelist-builds views from `filterLogic` / `filters` only (`701-702`, `908-909`). The serializable view object (`1116-1117`) and `legacyViewKeys()` (`1239-1240`) have no `filterTree`. `viewStates` is a raw pass-through (`756-758`, `983-984`), so a tree stored *inside* `viewStates[mode]` can survive — but `create()` falls back to top-level `viewConfig` when mode state is missing (`ViewStateStore.ts:88-89`). Calling `parseSourceRuleTree` (`SourceRules.ts:227-257`) would whitelist `SOURCE_RULE_OPERATORS` (`7-28`).

### Purpose
Parse `filterTree` via `normalizeViewFilterTree` at both view constructors, put it on the serializable view object, add `"filterTree"` to `legacyViewKeys()`, and hydrate / persist / recursively prune it in `ViewStateStore`. Omit `filterTree` when the tree is a single flat group so existing vault configs stay iCloud-quiet.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `DataSource.ts`: parse `filterTree` via `normalizeViewFilterTree` at both view constructors (`701-702`, `908-909`). Put `filterTree` on the serializable view object (next to `1116-1117`). Add `"filterTree"` to `legacyViewKeys()` next to `"filters"` (`1239-1240`). Do **not** call `parseSourceRuleTree`.
- `ViewStateStore.ts`: `filterTree` on `DatabaseViewState` (`16-26`). Hydrate in `create` (`86-113`) through `normalizeViewFilterTree` (legacy `filters` + `filterLogic` promote via `buildViewFilterTree`). `toPersistedState` (`115-127`) omits `filterTree` unless nested group or `not`. `persist` (`69-84`) mirrors `viewConfig.filterTree` like `filters`. Recursive dead-field leaf prune in `get` (`40-46`); groups emptied by prune stay skip.
- Dual-write protocol for later panel commits: DFS leaves → `state.filters`, root logic → `state.filterLogic` (this child owns the persist omit shape those writes ride). Config writes stay on existing `scheduleConfigSave` debounce 300ms (`DatabaseView.ts:6213-6252`) — no new save API.

### Out of Scope
- Kleene evaluator and QueryEngine bridges (child `001-kleene-eval-module`).
- Filter panel editor (child `003-filter-panel-tree-editor`).
- Chip / column / chart dual-write (child `004-nonpanel-filter-coherence`).
- A second persistence pipeline; churny always-on `filterTree: { type:"group", rules:[] }`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/DataSource.ts` | Edit | Parse at `701-702` and `908-909`; serialize next to `1116-1117`; `legacyViewKeys()` `1239-1240` |
| `src/views/ViewStateStore.ts` | Edit | Hydrate `create` `86-113`; persist `69-84` and `toPersistedState` `115-127`; prune `get` `40-46` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `DataSource.ts` round-trips `filterTree` | Both constructors parse via `normalizeViewFilterTree`; serializable view object includes `filterTree`; `"filterTree"` is in `legacyViewKeys()`; `parseSourceRuleTree` is not used |
| REQ-002 | Nested / `not` trees persist; flat trees omit the key | `toPersistedState` (`115-127`) omits `filterTree` unless nested group or `not`; existing vault configs do not grow a new key |
| REQ-003 | Legacy `filters` + `filterLogic` load as a root group | `create` (`86-113`) hydrates through `normalizeViewFilterTree` / `buildViewFilterTree` with identical row subsets for flat views |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Recursive dead-field prune | `get` (`40-46`) prunes leaves whose fields are gone, same as today’s `state.filters` filter at line 46; groups emptied by prune stay skip |
| REQ-005 | No new save API | Writes ride `scheduleConfigSave` debounce 300ms (`DatabaseView.ts:6213-6252`) with existing flush-on-deactivate / flush-on-activation; omit empty (`115-127`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Nested tree survives save/reload.
- **SC-002**: Flat views do not grow a `filterTree` key.
- **SC-003**: Legacy flat-filter views load with identical row subsets via `buildViewFilterTree`.
- **SC-004**: Grep shows `DataSource.ts` does not call `parseSourceRuleTree` for this field.

### Acceptance Scenarios

- **Given** a nested `(A and B) or C` tree, **when** the view config is saved and reloaded, **then** `filterTree` is present and evaluates the same subset.
- **Given** a single flat AND/OR group, **when** `toPersistedState` runs, **then** `filterTree` is omitted and `filters` + `filterLogic` remain.
- **Given** a truncated or non-object `filterTree` on disk, **when** `normalizeViewFilterTree` runs, **then** the result is `undefined` (not an empty OR group).
- **Given** a dead schema field in a nested leaf, **when** `ViewStateStore.get` runs, **then** that leaf is pruned and an emptied group stays skip.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Forgetting `DataSource.ts` | `filterTree` dies on reload (session-only) | Constructors + serializable object + `legacyViewKeys()` in this same child |
| Risk | `parseSourceRuleTree` whitelist | Source ops leak into view filters (`SourceRules.ts:7-28`) | `normalizeViewFilterTree` only |
| Risk | Always writing empty `filterTree` | iCloud churn | Omit when flat; omit empty (`115-127`) |
| Dependency | Child 001 `normalizeViewFilterTree` / `buildViewFilterTree` | Cannot hydrate safely | This child starts after 001 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked default: persist `filterTree` only when the tree has a nested group or a `not`. First nested edit is the promotion write (Notion simple→advanced).
<!-- /ANCHOR:questions -->
