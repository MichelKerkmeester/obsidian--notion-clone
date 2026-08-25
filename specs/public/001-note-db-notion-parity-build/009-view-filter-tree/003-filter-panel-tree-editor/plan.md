---
title: "Implementation Plan: Filter Panel Tree Editor"
description: "One FilterPanelRenderer.ts change: recursive group/not chrome with depth, wrap-into-group, auto-collapse, cap 3, existing view-filter leaves."
trigger_phrases:
  - "filter panel tree plan"
  - "wrap into group"
  - "filter depth cap"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/009-view-filter-tree/003-filter-panel-tree-editor"
    last_updated_at: "2026-08-25T21:00:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored filter-panel-tree-editor child from synthesis ranks 4/6/7/8-UI and final-plan step 8"
    next_safe_action: "Extend FilterPanelRenderer.ts with recursive group/not chrome; keep existing leaves"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-filter-panel-tree-editor"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Implementation Plan: Filter Panel Tree Editor

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Existing toolbar popover (`FilterPanelRenderer.ts:71-77`) |
| **Storage** | Child 002 persist path via `actions.saveState()` |
| **Testing** | Vault at phone width; grep source-op leak |

### Overview
One UI change in `FilterPanelRenderer.ts`. Copy group/`not` chrome from `ViewConfigPanelRenderer.ts:846-929` with a new `depth` argument. Reuse `.db-source-rule-*` so `styles.css` stays out of the diff. Wrap-into-AND-group is the create-group gesture.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Final-plan step 8 merge (T016+T022–T025) confirmed as one renderer change.
- [x] Leaf editors locked: `107-123`, not `renderSourceRuleLeaf` `931+`.
- [x] Child 002 persist omit/hydrate available.

### Definition of Done
- [ ] `(A and B) or C` editable at mobile width.
- [ ] Wrap, auto-collapse, depth 3, labeled `not`; no add-expression / add-empty-group.
- [ ] Rail popover still edits one leaf.
- [ ] `styles.css` / `i18n.ts` untouched; checklist.md items recorded.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Recursive renderer with positional `onReplace` (`SourceRuleNode` is positional — `ViewConfigPanelRenderer.ts:921-927`). Do not extract a shared tree-editor module this phase.

### Key Components
- **Group chrome**: header AND/OR, add-rule / add-group / add-not / remove, `depth`.
- **Leaves**: existing `renderFilterRow` / `renderSingleRuleEditor`.
- **Commit**: tree canonical; dual-write DFS leaves + root logic; `saveState()`.

### Data Flow
Edit → in-memory `SourceRuleNode` → dual-write `state.filters` / `state.filterLogic` → `saveState()` → child 002 persist omits `filterTree` when flat-equivalent.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: `FilterPanelRenderer.ts`. Consumers: `ViewStateStore.saveState` path already used at `99/142/187/212/228/245/264/285/339`. Do not use `removeSourceRuleTreeReferences` (`SourceRules.ts:222-224`) — it hoists; use `removeLeafAt` / positional splice. Algorithm invariant: no source-operator leaf in this file.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Re-read `FilterPanelRenderer.ts:71-90`, `107-123`, `125-146` and `ViewConfigPanelRenderer.ts:846-929` (note no depth at `901-916`).

### Phase 2: Core Implementation
- [ ] Recursive group/`not` with `depth`; wrap; auto-collapse; cap 3; dual-write on commit.

### Phase 3: Verification
- [ ] Phone-width popover; wrap / collapse / depth / `not`; grep source ops; `styles.css` clean.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Not this child — renderer is DOM | — |
| Integration | None required | — |
| Manual | Nested filter at phone width; wrap / collapse / depth 3 / `not`; rail popover leaf | Obsidian fork + checklist.md |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 leaf helpers (`appendLeaf`, `removeLeafAt`) | Internal | Required | Panel surgery would invent ids |
| Child 002 persist | Internal | Required | Nested edits session-only |
| `.db-source-rule-*` (`styles.css:9192-9234`) | Internal | Green | Do not edit CSS |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Source-op leak, 4th group layer allowed, or `styles.css` touched.
- **Procedure**: Revert `FilterPanelRenderer.ts` only. Do not leave a half-recursive header with the old flat loop.
<!-- /ANCHOR:rollback -->
