---
title: "Implementation Plan: Filter Tree Persistence"
description: "Plan to round-trip filterTree through DataSource.ts and ViewStateStore so nested groups survive reload while flat views stay iCloud-quiet."
trigger_phrases:
  - "filter tree persistence plan"
  - "datasource filtertree"
  - "viewstatestore persist"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Filter Tree Persistence

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | View config JSON in vault markdown (`database:` / `viewStates`) |
| **Storage** | Existing `scheduleConfigSave` debounce 300ms (`DatabaseView.ts:6213-6252`) |
| **Testing** | Round-trip nested vs flat omit; malformed root → `undefined` |

### Overview
`filterTree` is canonical when present. Flat groups stay `filters` + `filterLogic`. Disk is `DataSource.ts` plus `ViewStateStore.ts` — not ViewStateStore alone. Normalize with `normalizeViewFilterTree`, never `parseSourceRuleTree`.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Child 001 exports `normalizeViewFilterTree` and `buildViewFilterTree`.
- [x] Final-plan DataSource gap (`701-702`, `908-909`, `1116-1117`, `1239-1240`) confirmed.
- [x] Omit-when-flat default locked.

### Definition of Done
- [ ] Nested tree survives save/reload.
- [ ] Flat views have no `filterTree` key.
- [ ] `create` hydrates legacy filters as a root group.
- [ ] Recursive prune in `get` (`40-46`).
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Additive field on existing view-config JSON. Same omit-empty shape as `toPersistedState` (`115-127`).

### Key Components
- **`DataSource.ts`**: parse at both constructors; serialize; `legacyViewKeys()`.
- **`ViewStateStore.ts`**: `DatabaseViewState.filterTree`; hydrate; persist; recursive prune.
- **`normalizeViewFilterTree`**: view-operator allow-list; truncated root → `undefined`.

### Data Flow
Load: YAML/JSON → `normalizeViewFilterTree` → `state.filterTree` (or `buildViewFilterTree` from `filters` + `filterLogic`). Save: if nested/`not` write `filterTree`; else omit and keep leaf snapshot in `filters` for badges.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producers: `DataSource.ts` parse/serialize and `ViewStateStore` hydrate/persist. Consumers: later panel commits dual-write leaves into `state.filters` so `getEffectiveFilterRules` and `ActiveViewControlsRenderer.ts:37-40` keep working. Algorithm invariant: never persist an empty `{ type:"group", rules:[] }` root; truncated JSON becomes `undefined`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 types and `normalizeViewFilterTree` exist.
- [ ] Re-read `DataSource.ts:701-702`, `908-909`, `1116-1117`, `1239-1240` and `ViewStateStore.ts:40-46`, `69-127`.

### Phase 2: Core Implementation
- [ ] Parse + serialize + `legacyViewKeys()` in `DataSource.ts`.
- [ ] Hydrate / persist / prune in `ViewStateStore.ts`.

### Phase 3: Verification
- [ ] Nested survives reload; flat omit; malformed root → `undefined`.
- [ ] Grep: no `parseSourceRuleTree` on the view-filter path.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `normalizeViewFilterTree` already covered in child 001 | Vitest |
| Integration | Save/reload nested vs flat omit | Manual vault + optional fixture |
| Manual | Nested tree in `database:` YAML after save | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 `normalizeViewFilterTree` / `buildViewFilterTree` / types | Internal | Required | Cannot hydrate |
| Existing `scheduleConfigSave` | Internal | Green | Do not add a second save path |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Nested trees vanish on reload, or flat views grow a churny `filterTree` key.
- **Procedure**: Revert `DataSource.ts` and `ViewStateStore.ts` together. Do not leave `legacyViewKeys()` listing `"filterTree"` without parse/serialize.
<!-- /ANCHOR:rollback -->
