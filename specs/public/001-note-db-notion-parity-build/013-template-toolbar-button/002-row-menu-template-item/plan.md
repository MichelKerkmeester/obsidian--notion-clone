---
title: "Implementation Plan: Row Menu Template Item"
description: "Plan for the RowMenu New-from-template item gated on hasRecordTemplate, plus DatabaseView getDatabaseConfig wiring."
trigger_phrases:
  - "row menu template plan"
  - "getDatabaseConfig"
  - "hasRecordTemplate menu"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button/002-row-menu-template-item"
    last_updated_at: "2026-08-25T21:20:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored row-menu-template-item child from synthesis rank 2 and final-plan steps 5-6"
    next_safe_action: "Add the RowMenu item and DatabaseView getDatabaseConfig wiring"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-row-menu-template-item"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Row Menu Template Item

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | `RowMenu` uses `new Menu().setUseNativeMenu(false)` (`RowMenu.ts:45`) |
| **Storage** | Reads `getActiveDb().newRecordTemplate` (`DatabaseView.ts:783-786`; `types.ts:279`) |
| **Testing** | Manual: item present with template; absent with zero templates / calendar / timeline / read-only |

### Overview
Consume child 1's module on the second host. DatabaseView only adds `getDatabaseConfig` on the RowMenu ctor. Confirm stays off. Hide the item when no template is set so it is not a worse duplicate of insert above/below.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 2 and final-plan steps 5–6 read; hide-when-empty locked.
- [x] Child 1 must export `hasRecordTemplate`, `getNewFromTemplateLabel`, `executeNewFromTemplate`, and `menu.newFromTemplate`.
- [x] `newRecordTemplate` is on `DatabaseConfig`, not `ViewConfig`.

### Definition of Done
- [ ] Item after insert separator `:75` only when `hasRecordTemplate`.
- [ ] Calendar/timeline and read-only still hide it (`RowMenu.ts:54-58`).
- [ ] DatabaseView ctor wires `getDatabaseConfig: () => this.getActiveDb()`.
- [ ] `onClick` never calls `createEntry` after the module; no insert `position`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Second EuroFormat call site. No new `src/data/` file. Inject `createEntry` from `RowMenuActions`.

### Key Components
- **`RowMenu.show`**: item after `:75`, gated on `hasRecordTemplate(getDatabaseConfig?.())`.
- **`DatabaseView` RowMenu ctor `:555-567`**: `getDatabaseConfig: () => this.getActiveDb()`.

### Data Flow
Ctor supplies the active `DatabaseConfig`. Show-time `hasRecordTemplate` decides visibility. Click runs `executeNewFromTemplate`, which calls `this.actions.createEntry?.()` once. That callback is already `guardedCreateEntry` (`DatabaseView.ts:563, 845-850`) and loads the template inside `createBlankEntry` (`:3536-3538, 3673-3679`).
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Consumers: `RowMenu.ts` and the DatabaseView RowMenu ctor. Toolbar stays child 1. Algorithm invariant: no-arg create through the module; insert above/below keep positional `createEntry(defaults, position)` (`RowMenu.ts:58-74`).
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 1 module and `menu.newFromTemplate` exist.
- [ ] Re-read `RowMenu.ts:6, 54-75` and `DatabaseView.ts:555-567, 783-786`.

### Phase 2: Core Implementation
- [ ] Add `getDatabaseConfig?` and the gated item on `RowMenu`.
- [ ] Wire `getDatabaseConfig` on the DatabaseView ctor.

### Phase 3: Verification
- [ ] Present with template on table/board/gallery/list; absent otherwise.
- [ ] One create; no extra `createEntry`; no insert `position`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None new — reuse child 1 module | — |
| Integration | Not this child | — |
| Manual | Item presence/absence matrix; one click creates one row | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child 1 `TemplateToolbarAction.ts` plus i18n | Internal | Predecessor | Cannot add the item |
| Existing `RowMenuActions.createEntry` | Internal | Green | Module delegates; no second create path |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Item shows with zero templates; two notes per click; ctor reads `getConfig()` instead of `getActiveDb()`.
- **Procedure**: Revert the `RowMenu.ts` hunk and the DatabaseView ctor field together. Leave child 1's module in place.
<!-- /ANCHOR:rollback -->
