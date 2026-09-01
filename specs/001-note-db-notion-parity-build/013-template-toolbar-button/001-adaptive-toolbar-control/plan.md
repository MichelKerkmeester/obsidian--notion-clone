---
title: "Implementation Plan: Adaptive Toolbar Control"
description: "EuroFormat plan for TemplateToolbarAction.ts, i18n keys, and ToolbarRenderer.renderNewButton including path tooltip and phone icon-only."
trigger_phrases:
  - "adaptive toolbar plan"
  - "template toolbar action"
  - "renderNewButton adaptive"
  - "phone icon-only new"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button/001-adaptive-toolbar-control"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored adaptive-toolbar-control child from synthesis ranks 1,4,5 and final-plan steps 1-4"
    next_safe_action: "Implement TemplateToolbarAction.ts plus i18n and ToolbarRenderer.renderNewButton"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-adaptive-toolbar-control"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Adaptive Toolbar Control

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | Reads `DatabaseConfig.newRecordTemplate.path` (`types.ts:154-157, 279`); does not write config |
| **Testing** | Three-row `executeNewFromTemplate` branch table (no template / confirm true / confirm false); desktop plus phone manual |

### Overview
Land one EuroFormat-shaped leaf plus the toolbar host in one shippable slice so the longer label cannot ship without the phone icon-only branch. The module decides; `ToolbarRenderer` still injects `createEntry: () => actions.createEntry()`. Confirm stays off (`confirmEnabled: false`).
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1, 4, 5 and final-plan steps 1–4 read; tooltip and phone folded into this host.
- [x] Double-create trap locked: module is the only `createEntry` caller.
- [x] Confirm result type locked: branch on `ok === true` (`ConfirmModal.ts:69-71`).

### Definition of Done
- [ ] `TemplateToolbarAction.ts` exports the four functions; no `src/views/` imports.
- [ ] Three locales resolve `toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip`, `menu.newFromTemplate`.
- [ ] Desktop template DB shows **New from template** plus path tooltip; zero-template stays **New**.
- [ ] Phone template control is icon-only with full `aria-label` / `title`.
- [ ] Toolbar `onclick` never calls `createEntry` after the module.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module plus one rebase-safe call site (`src/data/EuroFormat.ts:1-42`). Pure decisions plus injected side effects. No `obsidian` `Menu`, no network, no timers.

### Key Components
- **`TemplateToolbarAction.ts`**: `hasRecordTemplate`, `getNewFromTemplateLabel`, `getNewFromTemplateTooltip`, `executeNewFromTemplate`.
- **`ToolbarRenderer.renderNewButton`**: takes optional `DatabaseConfig`; `render()` passes `currentDb` at `:236` and `:282`.
- **i18n data**: not a fourth call site.

### Data Flow
`hasRecordTemplate(currentDb)` picks label/icon/tooltip. Click runs `executeNewFromTemplate`, which calls the injected `createEntry` once. That callback is still `actions.createEntry()` and reaches `createBlankEntry` (`DatabaseView.ts:3528`) through the existing toolbar action. The module never imports `CreateEntryPlan` or `DatabaseView`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: new `TemplateToolbarAction.ts`. Consumer this child: `ToolbarRenderer.ts` `renderNewButton`. i18n is data. Row-menu and DatabaseView wait for child 2. Algorithm invariant: hosts never call `createEntry` after the module; `ok === true` is the only confirm proceed path.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Re-read `RecordTemplate.ts:51-57`, `DatabaseView.ts:845-856, 3528-3573, 3673-3679`, `ToolbarRenderer.ts:236, 282, 1683-1691`, `EuroFormat.ts:1-42`.
- [ ] Confirm create-with-defaults is already on **New**; no second engine queued.

### Phase 2: Core Implementation
- [ ] Create `TemplateToolbarAction.ts` with the four exports and the confirm-then-delegate algorithm.
- [ ] Add i18n keys times three locales.
- [ ] Change `renderNewButton` (adaptive label, tooltip, phone icon-only, module-only onclick).

### Phase 3: Verification
- [ ] Desktop template / zero-template labels; phone icon-only; one create per click.
- [ ] Three-row branch table: no template; template plus confirm true; template plus confirm false.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `executeNewFromTemplate` times no template / confirm true / confirm false | Documented table; optional colocated test only if a harness already exists |
| Integration | Not this child — no Obsidian `App` in the module | — |
| Manual | Desktop label plus tooltip; phone icon-only; zero-template still creates | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot cite or edit call sites |
| Existing `actions.createEntry()` chain | Internal | Green | Module delegates; does not reimplement create |
| Child 2 row-menu | Internal | Later | This child must export `hasRecordTemplate` and `menu.newFromTemplate` so child 2 does not retouch i18n |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Two notes per click; phone overflow; module imports `src/views/`.
- **Procedure**: Revert `TemplateToolbarAction.ts`, the i18n keys, and the `ToolbarRenderer.ts` hunk as one unit. Do not leave the longer label without the phone branch.
<!-- /ANCHOR:rollback -->
