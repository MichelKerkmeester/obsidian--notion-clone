---
title: "Implementation Plan: Format Editor Panel"
description: "CF-scoped group chrome, existing leaves, icon picker, bold toggle, and i18n in renderConditionalFormatting."
trigger_phrases:
  - "format editor panel plan"
  - "renderconditionalformatting"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/010-conditional-format-icons/004-format-editor-panel"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored format-editor-panel child from synthesis rank 3 and final-plan step 7"
    next_safe_action: "Add CF group chrome, icon picker, and bold toggle in ViewConfigPanelRenderer"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-format-editor-panel"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Format Editor Panel

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Existing view-config popover; no new component file |
| **Storage** | `actions.onChange` undo string already used for CF |
| **Testing** | Manual AND/OR + icon + bold save/reload; grep source ops |

### Overview
Copy group chrome only (`878-929`). Keep CF leaves on `getFilterOperatorsForColumn`. Dual-write on first wrap. Reuse icon popover and panel and/or strings.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 3 and final-plan step 7 read; do not copy `renderSourceRuleLeaf`.
- [ ] Child 001 types and child 002 parse exist so save/reload works.

### Definition of Done
- [ ] AND/OR group + icon + bold save and reload.
- [ ] No add-expression; no Chart UI; no source-op leak.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
In-file editor extension. Positional splice, no node ids (same as source-rule groups).

### Key Components
- **Group chrome**: `renderSourceRuleGroup` `878-929`.
- **Leaf**: existing field/op/value at `552-766` / `:593`.
- **Icon / bold**: `IconPickerPopover.ts:23` and `setIcon(..., "bold")`.

### Data Flow
User edit → mutate rule (`condition` + optional `conditionTree` + `icon` + `bold`) → `actions.onChange(t("undo.conditionalFormatConfig"))` (`601-604`) → child 002 parse on reload.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producers: `ViewConfigPanelRenderer.ts` and `i18n.ts`. Do not edit `ChartRenderer`. Invariant: first wrap writes `conditionTree`; untouched legacy rules stay single-`condition`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `renderConditionalFormatting` `552-766` and `renderSourceRuleGroup` `878-929`.

### Phase 2: Core Implementation
- [ ] Group chrome + wrap/delete-last-child; icon; bold; i18n keys.

### Phase 3: Verification
- [ ] Save/reload; grep source ops; confirm no Chart UI.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual | AND/OR + icon + bold at narrow pane | Obsidian fork |
| Constraint | No source ops in CF editor | `grep` |
| Unit | Helper cases in child 005 | Vitest later |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 001 types | Internal | Predecessor | Nothing to bind |
| Child 002 parse | Internal | Predecessor | Reload drops new keys |
| `IconPickerPopover.ts:23` | Internal | Green | Reuse; no catalog |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Source-op leak; eval-time wraps written onto legacy rules; Chart UI appears.
- **Procedure**: Revert `ViewConfigPanelRenderer.ts` and `i18n.ts`. Extra JSON keys remain ignored by old editor.
<!-- /ANCHOR:rollback -->
