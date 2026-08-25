---
title: "Implementation Plan: Column Menu Scheme Picker"
description: "Plan for nested scheme choices under the existing display popover and setTextLinkScheme beside setTextRenderMode."
trigger_phrases:
  - "column menu scheme picker plan"
  - "setTextLinkScheme"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields/003-column-menu-scheme-picker"
    last_updated_at: "2026-08-25T19:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored menu-picker child from synthesis rank 4 and final-plan T012"
    next_safe_action: "Implement ColumnMenu picker and setTextLinkScheme after the table same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-column-menu-scheme-picker"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Column Menu Scheme Picker

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | Same `ColumnDef` JSON save as `setTextRenderMode` (`DatabaseView.ts:5096-5100`) |
| **Testing** | Manual menu click; reuse child-001 round-trip test (no new assemble cases) |

### Overview
Two call-site edits on existing UI. Nest `https` / `mailto` / `tel` / none under the text display popover. Persist through a setter that clones config the same way `textRenderMode` already does (`DatabaseView.cloneDatabaseConfig` `:930-931`). Do not extend the `textRenderMode` union.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 4 and final-plan T012 read; REQ-005 tension recorded (own child).
- [x] Child 001 must have landed `textLinkScheme?` on `ColumnDef`.

### Definition of Done
- [ ] Menu can set and clear the three schemes on text columns.
- [ ] Setter sits beside `setTextRenderMode`.
- [ ] `textRenderMode` union and `types.ts:50` unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Sibling optional field + existing display popover (do not invent a 13th column type).

### Key Components
- **`ColumnMenu.ts`**: choices under `:393-418`; wire from `:133-150` as needed.
- **`DatabaseView.ts`**: `setTextLinkScheme` next to `setTextRenderMode` `:5096-5100`.

### Data Flow
Menu writes the optional field onto the in-memory `ColumnDef`, then the existing config save. Renderers already consult the field from child 001. Clearing deletes the key (`undefined` omitted on stringify).
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Consumers: `ColumnMenu.ts:133-150,393-418` and `DatabaseView.ts:5096-5100`. Do not retouch assemble or `types.ts:50`. i18n: reuse existing display-popover strings where possible; only add keys if a label is actually missing.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `ColumnMenu.ts:133-150,393-418` and `DatabaseView.ts:5096-5100`.
- [ ] Confirm child 001 field exists on `ColumnDef`.

### Phase 2: Core Implementation
- [ ] Add scheme choices (https / mailto / tel / none) under the display popover.
- [ ] Add `setTextLinkScheme` beside `setTextRenderMode`.

### Phase 3: Verification
- [ ] Set / clear from the menu; confirm JSON and table render.
- [ ] Confirm number columns do not show the picker; unions unchanged.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None required beyond child-001 round-trip | — |
| Integration | Not this child | — |
| Manual | Pick mailto, confirm cells; pick none, confirm plain; number column has no picker | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child `001-text-link-scheme-module` | Internal | Required | No field to persist |
| Child `002-layout-scheme-honor` | Internal | Not required | Menu works against table-only rendering |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Menu writes unknown schemes; `textRenderMode` union changes; non-text columns gain a picker.
- **Procedure**: Revert `ColumnMenu.ts` + `DatabaseView.ts`. Leave child 001 module in place; JSON-set hints still work.
<!-- /ANCHOR:rollback -->
