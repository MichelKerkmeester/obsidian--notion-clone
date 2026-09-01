---
title: "Feature Specification: Filter Panel Tree Editor"
description: "Recursive group/not filter panel copied from source-rule chrome only, with wrap-into-group, auto-collapse of empty groups, UI depth cap 3, and existing FilterRule leaf editors — one renderer change."
trigger_phrases:
  - "filter panel tree editor"
  - "wrap into group"
  - "filter depth cap"
  - "renderfilterrow"
  - "source rule chrome"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/009-view-filter-tree/003-filter-panel-tree-editor"
    last_updated_at: "2026-08-27T12:50:04Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Feature Specification: Filter Panel Tree Editor

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `009-view-filter-tree` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 5 |
| **Predecessor** | 002-filter-tree-persistence |
| **Successor** | 004-nonpanel-filter-coherence |
| **Handoff Criteria** | `(A and B) or C` editable at mobile width; wrap-into-group; empty groups removed; 4th group layer refused; no source-operator leaf editor |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-filter-tree-persistence` · Successor: `004-nonpanel-filter-coherence`. Final-plan step 8 merges T016+T022–T025 into **one** `FilterPanelRenderer.ts` change (synthesis ranks 4, 6, 7, and 8 UI). Do not split wrap / depth / `not` chrome / auto-collapse into later diffs.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The filter panel is a global AND/OR toggle plus a flat row list (`FilterPanelRenderer.ts` `renderHeader` `125-146` and the flat loop `81-90`). Notion groups have their own AND/OR control and an inner “Add a filter”. Copying `renderSourceRuleLeaf` (`ViewConfigPanelRenderer.ts:931+`) would leak source ops (`inFolder` / `hasProperty` / `strictEq` / `expression`); unknown view ops fall through `matchesFilter`'s `default: return true` (`QueryEngine.ts:124-125`). `renderSourceRuleGroup` (`878-929`) has **no depth parameter** at `901-916` — the 3-layer cap must be added, not copied.

### Purpose
Extend `FilterPanelRenderer.ts` with a recursive group/`not` renderer copied from `renderSourceRuleNode` / `renderSourceRuleGroup` (`846-929`) with a `depth` argument. Leaves stay `renderFilterRow` / `renderSingleRuleEditor` (`107-123`). Reuse `.db-source-rule-*` (`styles.css:9192-9234`) so `styles.css` and `i18n.ts` stay out of the diff. Gestures: wrap-selected-rule-into-AND-group; auto-collapse empty groups; hide “add group” at `depth >= 3`; labeled `not` wrapper like `858-869`; no add-expression.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Recursive group/`not` editor in `FilterPanelRenderer.ts` with `depth`. Keep `renderSingleRuleEditor` `107-123` working for the active-rail popover.
- On commit: tree canonical; dual-write DFS leaves → `state.filters`, root logic → `state.filterLogic`; keep `actions.saveState()` (`99/142/187/212/228/245/264/285/339`).
- Wrap-into-AND-group as the create-group gesture (Anytype `group.tsx:109-122`). No “add empty group”. Auto-collapse empty groups; do not auto-flatten a remaining single child except persist-normalization in child 002.
- Hide “add group” at `depth >= 3` (evaluator stays unbounded).
- Labeled `not` wrapper like `ViewConfigPanelRenderer.ts:858-869`. Evaluator already handles `not` in child 001.
- Reuse i18n `panel.and` / `panel.or` / `panel.addCondition` and existing source-rule add-group/not strings.
- Mobile: panel is already a popover (`71-77`, `positionToolbarPopover`); copy source-rule flex + `min-width: 0` (`styles.css:9192-9229`); measure popover width in this child's checklist.

### Out of Scope
- Chip-`Wrap` rebuild (AppFlowy `filter_menu.dart:62-66` is leaf layout only).
- “Add expression” in the view panel (`expression` → `false` in the evaluator).
- `styles.css` / `i18n.ts` edits.
- Non-panel mutators (child `004-nonpanel-filter-coherence`).
- Extracting a shared tree-editor module (three copies of group chrome is the rebase-cheap choice).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/FilterPanelRenderer.ts` | Edit | Recursive group/`not` chrome with `depth`; leaves stay `107-123`; wrap / auto-collapse / cap 3 / labeled `not` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Recursive group/`not` editor | Panel builds `(A and B) or C`; per-index `onReplace`; header AND/OR dropdown; add-rule / add-group / add-not / remove. Copy **group/`not` chrome only** from `846-929` |
| REQ-002 | Leaves stay view-filter editors | `renderFilterRow` / `renderSingleRuleEditor` (`107-123`, `148+`) remain the leaf; grep: no `inFolder` / `hasProperty` / `strictEq` / source `expression` in the view panel |
| REQ-003 | Dual-write on commit | DFS leaves → `state.filters`; root logic → `state.filterLogic`; `saveState()` unchanged (`99/142/187/212/228/245/264/285/339`) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Wrap-into-group + auto-collapse | Wrap selected rule into AND-group (no add-empty-group). Removing the last child removes the group. Do not hoist a remaining single child except persist-normalization |
| REQ-005 | UI depth cap 3 | Hide “add group” at `depth >= 3`; 4th group layer refused; evaluator unbounded |
| REQ-006 | Mobile popover usable | Row-list + flex-shrink; reuse `.db-source-rule-*` (`styles.css:9192-9234`); measure popover width in checklist.md |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `(A and B) or C` is editable in the panel at phone width.
- **SC-002**: Wrap, auto-collapse, depth 3, and labeled `not` work; no add-expression.
- **SC-003**: Rail popover still edits one leaf via `renderSingleRuleEditor`.
- **SC-004**: `styles.css` and `i18n.ts` have no this-child diff.

### Acceptance Scenarios

- **Given** a single filter row, **when** the user wraps it into a group and adds a nested rule with OR at the root, **then** the tree is `(A and B) or C` and `saveState()` dual-writes leaves.
- **Given** a group at depth 3, **when** the user looks for “add group”, **then** it is hidden and a 4th layer cannot be created.
- **Given** the last child of a group is removed, **when** the panel updates, **then** that empty group is gone (not an AppFlowy empty group).
- **Given** the active-rail popover, **when** it opens on one chip, **then** `renderSingleRuleEditor` (`107-123`) still edits that leaf.
- **Given** a reviewer greps `FilterPanelRenderer.ts`, **when** they search source ops, **then** `inFolder` / `hasProperty` / `strictEq` are absent.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Copying `renderSourceRuleLeaf` | Source op matches every row (`QueryEngine.ts:124-125`) | Copy chrome only; keep `107-123` |
| Risk | Copying `901-916` without `depth` | UI allows unbounded nesting | Add `depth`; hide add-group at `>= 3` |
| Risk | Nested chrome at phone width | Unusable popover | Reuse `min-width: 0` flex (`styles.css:9192-9229`); measure in checklist |
| Dependency | Child 002 persist omit / hydrate | Nested edits would be session-only | Panel starts after 002 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: no add-expression; keep row-list (not chip-`Wrap`); auto-collapse empty groups; do not hoist a remaining single child except persist-normalization when the tree is flat-equivalent.
<!-- /ANCHOR:questions -->
