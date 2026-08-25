---
title: "Tasks: Filter Tree Persistence"
description: "Tasks to parse, serialize, hydrate, persist, and prune filterTree so nested groups survive reload and flat views stay iCloud-quiet."
trigger_phrases:
  - "filter tree persistence tasks"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Filter Tree Persistence

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (target — fork file:line)`

T002 and T003 are one disk slice. Do not ship ViewStateStore `filterTree` without `DataSource.ts`.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 001 exported `normalizeViewFilterTree` / `buildViewFilterTree` and additive `filterTree?` types; re-read `DataSource.ts:701-702`, `908-909`, `1116-1117`, `1239-1240` and `ViewStateStore.ts:16-26`, `40-46`, `69-127` [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 Parse `filterTree` via `normalizeViewFilterTree` at both view constructors (`DataSource.ts:701-702`, `908-909`); put `filterTree` on the serializable view object (next to `1116-1117`); add `"filterTree"` to `legacyViewKeys()` next to `"filters"` (`1239-1240`). Do **not** call `parseSourceRuleTree` (`SourceRules.ts:227-257`) (`src/data/DataSource.ts`) [S]
- [ ] T003 `filterTree` on `DatabaseViewState` (`16-26`); hydrate in `create` (`86-113`) through `normalizeViewFilterTree` (legacy `filters` + `filterLogic` via `buildViewFilterTree`); `toPersistedState` (`115-127`) omits `filterTree` unless nested group or `not`; `persist` (`69-84`) mirrors `viewConfig.filterTree` like `filters`; recursive dead-field leaf prune in `get` (`40-46`); groups emptied by prune stay skip (`src/views/ViewStateStore.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T004 Nested tree survives save/reload; flat views do not grow a `filterTree` key (checklist T037 shape) [S]
- [ ] T005 Grep: `DataSource.ts` view-filter path does not call `parseSourceRuleTree`; truncated/non-object root still becomes `undefined` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T002 and T003 shipped together
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 2–3
- **Parent final-plan**: `../research/final-plan.md` steps 6–7
<!-- /ANCHOR:cross-refs -->
