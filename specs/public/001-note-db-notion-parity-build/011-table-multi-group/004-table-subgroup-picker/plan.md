---
title: "Implementation Plan: Table Sub-group Picker"
description: "Clone renderBoardSubgroupSection into the table group popover; write groupByFields; keep vs().groupByField as primary."
trigger_phrases:
  - "table subgroup picker plan"
  - "populateGroupPopover"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/011-table-multi-group/004-table-subgroup-picker"
    last_updated_at: "2026-08-25T20:50:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored table Sub-group picker child from synthesis and final-plan"
    next_safe_action: "Clone renderBoardSubgroupSection behind table view type"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-table-subgroup-picker"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Table Sub-group Picker

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | View config YAML via existing persist; `groupByFields` already round-trips from child 001 |
| **Testing** | Manual table vs board vs gallery popover |

### Overview
One table-gated toolbar section, not a second M-sized settings surface. Write `groupByFields` and keep the primary on `vs().groupByField` so `getActiveGroupField` (`DatabaseView.ts:2890-2894`) stays consistent.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Child 001 persist is live (required). Child 002 nest is live (so picking two fields shows nested headers).
- [x] Locked: do not edit `renderBoardSettings`.

### Definition of Done
- [ ] Table popover shows Sub-group; board unchanged; gallery/list have no `groupByFields` writer.
- [ ] Reload after picking two fields still nests.
- [ ] Computed fields omitted; colliding subgroup cleared on primary change.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Clone-and-gate. Board subgroup stays on `boardSubgroupEnabled` / `boardSubgroupField`. Table uses `groupByFields[]` only.

### Key Components
- **`ToolbarRenderer.populateGroupPopover`**: table-only section cloned from `:1423-1448`.
- **`DatabaseView` write path `:2408-2426`**: array writer + primary keep + collision clear.

### Data Flow
User picks subgroup → `config.groupByFields = [primary, sub]` or `undefined` → persist copies primary `groupByField` → dispatch `effectiveGroupFields` prefers the array.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Consumers: `ToolbarRenderer.ts` group popover and `DatabaseView.ts` `:2408-2426`. Do not touch `ViewConfigPanelRenderer.renderBoardSettings`. Algorithm invariant: gallery/list never write `groupByFields`; picker max 2.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Re-read `populateGroupPopover` `:1221-1266`, `renderBoardSubgroupSection` `:1423-1448`, candidates `:1462`, write path `:2408-2426`.

### Phase 2: Core Implementation
- [ ] Table-gated clone + computed filter.
- [ ] Writer + collision clear + undo label.

### Phase 3: Verification
- [ ] Table vs board vs gallery; reload nest; computed omitted.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual | Table Sub-group pick + reload | Obsidian fork |
| Negative | Board UI unchanged; gallery has no array writer | Same vault |
| Filter | Computed/rollup absent from candidates | Popover inspect |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-multifield-grouping-module` | Child predecessor | Required | Array would be stripped on save |
| `002-grouped-table-flatten` | Child predecessor | Required for visible nest | Config would save without nested UI |
| `003-embedded-table-grouping` | Ordered predecessor | Preferred | Embeds should already honor the array |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Board UI changes; gallery writes `groupByFields`; tables never see Sub-group; undo uses board string.
- **Procedure**: Revert `ToolbarRenderer.ts` popover edits and `DatabaseView.ts` `:2408-2426` writer. Leave persist and flatten in place.
<!-- /ANCHOR:rollback -->
