---
title: "Implementation Plan: Nonpanel Filter Coherence"
description: "One-slice plan to dual-write filter tree and chips at every non-panel mutator, hide the nested rail toggle, and seed new records from AND-required leaves."
trigger_phrases:
  - "nonpanel filter coherence plan"
  - "dual-write filtertree"
  - "applychartfilters"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/009-view-filter-tree/004-nonpanel-filter-coherence"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored nonpanel-filter-coherence child from synthesis rank 5 and final-plan step 9"
    next_safe_action: "Dual-write chip/column/chart mutators; hide nested rail toggle; AND-required new-record leaves"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-nonpanel-filter-coherence"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Nonpanel Filter Coherence

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Existing view-state mutations; no new save API |
| **Storage** | Child 002 persist path |
| **Testing** | Manual chip / delete / rename / drilldown / new-record on a nested view |

### Overview
EuroFormat extras required for the feature to actually run: wire every non-panel writer of `state.filters` to also update `state.filterTree` via `mapLeafAt` / `removeLeafAt` / `appendLeaf`. Hide the nested rail toggle. Seed new records with `getRequiredViewFilterLeaves`.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis open question #1 default accepted: coherence stays in-phase.
- [x] Correct `applyChartFilters` citation: `DatabaseView.ts:9651-9667`.
- [x] Child 001 exports leaf helpers and `getRequiredViewFilterLeaves`.

### Definition of Done
- [ ] All listed mutators dual-write.
- [ ] Nested rail toggle hidden; flat toggle writes both logics.
- [ ] New-record seeding ignores OR / `not` children.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Same-diff coherence slice. Leaf helpers from `ViewFilterTree.ts` map DFS index ↔ `state.filters[i]`.

### Key Components
- **Mutators**: ViewRuleOperations, ColumnOperations, ColumnConfig, both `applyChartFilters`.
- **Rail**: hide nested toggle; dual-write flat toggle.
- **Defaults**: `getRequiredViewFilterLeaves` at `DatabaseView.ts:3991`.

### Data Flow
Non-panel edit → update tree positionally → dual-write flat leaf snapshot → existing `saveState` / persist omit-when-flat.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producers: the six files in spec.md Files to Change. Consumers: panel (re-reads tree), badges (`getEffectiveFilterRules`), new-record frontmatter. Algorithm invariant: do not call `removeSourceRuleTreeReferences` (`SourceRules.ts:222-224`); it hoists. Column-delete may prune leaves then persist-normalize.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 helpers exist; re-read the six files at the locked lines.

### Phase 2: Core Implementation
- [ ] Dual-write mutators; hide nested rail toggle; AND-required new-record leaves.

### Phase 3: Verification
- [ ] Chip / column-delete / rename / drilldown / new-record on a nested view stay consistent.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Optional: `getRequiredViewFilterLeaves` already in child 001 tests | Vitest |
| Integration | Not required | — |
| Manual | Nested view: chip delete, column delete, rename, chart drilldown, new record | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 leaf helpers + `getRequiredViewFilterLeaves` | Internal | Required | Cannot dual-write |
| Child 002 persist | Internal | Required | Dual-write would not survive reload |
| Child 003 panel | Internal | Preferred | Final-plan: panel is source of truth; coherence can start after 002 |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Nested view desyncs after chip/delete/drilldown, or OR values appear in new-record frontmatter.
- **Procedure**: Revert the six files as one unit. Do not leave `applyChartFilters` dual-write without chip remove.
<!-- /ANCHOR:rollback -->
