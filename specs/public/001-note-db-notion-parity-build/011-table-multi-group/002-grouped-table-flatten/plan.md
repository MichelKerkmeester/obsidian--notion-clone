---
title: "Implementation Plan: Grouped Table Flatten"
description: "Table dispatch, depth-aware TableRenderer loop, indent CSS, depth-0 drop-target gate, and full-path create defaults as one shippable slice."
trigger_phrases:
  - "grouped table flatten plan"
  - "depth-aware table loop"
  - "renderGroupedTable"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/002-grouped-table-flatten"
    last_updated_at: "2026-08-25T20:50:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored flatten-loop child from synthesis and final-plan"
    next_safe_action: "Implement table dispatch, TableRenderer loop, and indent CSS"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-grouped-table-flatten"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Grouped Table Flatten

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | Hide/show still `scheduleConfigSave` view definition (`DatabaseView.ts:9850-9856`) |
| **Testing** | Manual 1-field vs 2-field table; 1-field patch still in-place |

### Overview
Do **not** recurse the DOM. Flatten once, then walk the existing loop. Indent, hide-subtree, drop-target gate, and create defaults are the same `TableRenderer.ts:82-155` edit. CSS is additive. Gallery/list/timeline stay single-field.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Child `001-multifield-grouping-module` shipped module + persist.
- [x] Locked: one loop edit; sticky only at depth 0; drop target only at depth 0.

### Definition of Done
- [ ] Dispatch uses `effectiveGroupFields`; `renderGroupedTable` flattens then renders.
- [ ] 2-field Category/Type nests; hiding Category conceals Type.
- [ ] 1-field DOM/hide keys match today; 1-field patch still works.
- [ ] Create in `Cat / Type` sets both properties; nested headers have no drop target.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Call-site consume of `MultiFieldGrouping.ts`. No new actions interface; hide/show already take opaque keys (`DatabaseView.ts:9845-9856`).

### Key Components
- **`DatabaseView.ts`**: table-only dispatch + `renderGroupedTable` tree build.
- **`TableRenderer.ts`**: additive `TableGroup` + depth-aware loop.
- **`styles.css`**: `--depth-N` indent, consecutive-header margin, sticky only at depth 0.

### Data Flow
Filtered `this.rows` (`DatabaseView.ts:6313`) → `effectiveGroupFields` → `dropComputedGroupFields` → `buildGroupTree` → `flattenGroupTree` → loop: header always; skip subtree when hidden; leaf table only when `children` is empty.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producers: child 001 module. Consumers in this child: `DatabaseView.ts` table dispatch/`renderGroupedTable`, `TableRenderer.ts` loop, additive CSS. Embedded waits for child 003. Toolbar waits for child 004. Algorithm invariant: `setupGroupDropTarget` only at depth 0 using the plain leaf `key`; create defaults never use `collapseKey` as a property value.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 exports and persist round-trip.
- [ ] Re-read loop `TableRenderer.ts:82-155`, patch `:209-250`, create `:470`.

### Phase 2: Core Implementation
- [ ] Table dispatch + `renderGroupedTable` flatten.
- [ ] Additive `TableGroup` + depth-aware loop + create path + CSS.

### Phase 3: Verification
- [ ] 2-field nest; hidden parent hides subtree; 1-field patch; create both fields; ≤360px no new media queries.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual render | 1-field vs 2-field Category/Type, hidden parent, empty DB (`TableRenderer.ts:92-98`) | Obsidian fork |
| Patch | 1-field still patches; 2-field full-rerenders | External row edit |
| Create | New row in `Cat / Type` | Table create-entry |
| Mobile | ≤360px overflow vs today | Narrow viewport |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-multifield-grouping-module` | Child predecessor | Required | No tree/flatten API |
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot edit loop |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: 1-field DOM changes; nested drop writes two fields; create writes `Cat::Type`; sticky headers paint over each other.
- **Procedure**: Revert `DatabaseView.ts` dispatch/`renderGroupedTable`, `TableRenderer.ts` loop, and the CSS rules as one unit. Leave the module in place only if persist still round-trips.
<!-- /ANCHOR:rollback -->
