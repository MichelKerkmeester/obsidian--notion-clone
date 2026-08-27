---
title: "Feature Specification: Adaptive Toolbar Control"
description: "Create TemplateToolbarAction.ts plus i18n and the adaptive toolbar New host: template path tooltip, phone icon-only, and a single createEntry call through the existing create-with-defaults path."
trigger_phrases:
  - "adaptive toolbar control"
  - "template toolbar action"
  - "new from template label"
  - "phone icon-only new"
  - "newRecordTemplate tooltip"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button/001-adaptive-toolbar-control"
    last_updated_at: "2026-08-25T21:20:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Adaptive Toolbar Control

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P2 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `013-template-toolbar-button` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 3 |
| **Predecessor** | None |
| **Successor** | 002-row-menu-template-item |
| **Handoff Criteria** | Module, i18n, and toolbar host land together; module is the only toolbar `createEntry` caller; phone template control is icon-only |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 3** — Parent: [`../spec.md`](../spec.md) · Successor: `002-row-menu-template-item`. Synthesis ranks 1, 4, and 5 (tooltip and phone-density folded into the toolbar host) and final-plan steps 1–4. Do not split tooltip or phone-density into later children. Row-menu and DatabaseView wiring wait for child 2. REQ-004 confirm is deferred (not this child).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
`renderNewButton` already calls `actions.createEntry()` with no args (`src/views/ToolbarRenderer.ts:1683-1691`), which reaches `createBlankEntry` then `loadNewRecordTemplate` then `buildCreateEntryPlan` / `planCreateEntry` (`src/views/DatabaseView.ts:845-850, 3528-3538, 3673-3679`). The gap is discoverability: the button is labeled only `"New"` (`src/i18n.ts:177`) even when `database.newRecordTemplate` is set (`src/data/types.ts:154-157, 279`). Shipping a longer label onto the phone title-row plus toolbar (`ToolbarRenderer.ts:236, 282`) without an `isPhoneLayout()` branch (`:285-287`) is the overflow failure synthesis rank 4 flagged.

### Purpose
Create one EuroFormat-shaped `src/data/TemplateToolbarAction.ts` (`src/data/EuroFormat.ts:1-42`), add the i18n keys, and change `renderNewButton` so a configured template shows **New from template** plus `file-plus-2` plus a full-path tooltip, while zero-template stays **New** plus `plus`. On phone with a template set, omit the visible text span and keep the full string on `aria-label` / `title`. The module is the only `createEntry` caller.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New module `src/data/TemplateToolbarAction.ts`: import `t` from `../i18n` and `DatabaseConfig` from `./types`; no `src/views/` imports. Export `hasRecordTemplate` (`!!config?.newRecordTemplate?.path`), `getNewFromTemplateLabel`, `getNewFromTemplateTooltip` (full `newRecordTemplate.path`), `executeNewFromTemplate`. Do **not** export `shouldShowNewFromTemplate` (visibility is inherited) or `shouldConfirmNewFromTemplate` (inlines to `confirmEnabled && hasRecordTemplate`).
- `executeNewFromTemplate({ config, confirmEnabled, confirm, createEntry })`: if `confirmEnabled && hasRecordTemplate(config)`, `await confirm()` and return unless the result is `=== true`; then `createEntry()` once. Cancel / `false` / `undefined` writes nothing. This child ships `confirmEnabled: false` and `confirm: async () => true`.
- i18n data near `toolbar.new` (`src/i18n.ts:177` en; zh-CN / zh-TW peers): `toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip` (`{path}`), `menu.newFromTemplate`. Do not add `toolbar.confirmNewFromTemplate` (REQ-004 deferred). `t("common.create")` already exists (`:134`).
- Call site 1: `src/views/ToolbarRenderer.ts`. Import the module. Change `renderNewButton(toolbar, actions, currentDb?)` (`:1683-1691`). Pass `currentDb` from `render()` at `:236` and `:282` (`currentDb` already exists at `:137`). Adaptive: template then `t("toolbar.newFromTemplate")` plus `file-plus-2` plus tooltip/aria-label from `getNewFromTemplateTooltip`; else keep `t("toolbar.new")` plus `plus`. If `isPhoneLayout()` (`:285-287`) and template set, omit the visible text span. `onclick` is only `void executeNewFromTemplate({ config: currentDb, confirmEnabled: false, confirm: async () => true, createEntry: () => actions.createEntry() })`. Do not extend `ToolbarActions`. Do not add a DatabaseView pass-through for the label.

### Out of Scope
- Row-menu item and DatabaseView `getDatabaseConfig` (child `002-row-menu-template-item`).
- REQ-004 confirm injection (`confirmNewFromTemplate` / `confirmCreate` / `getNewFromTemplateConfirmCopy`).
- Notion split-button, multi-template picker, inline "+ New template", repeating templates, network buttons.
- Edits to `RecordTemplate.ts`, `CreateEntryPlan.ts`, or `ViewConfigPanelRenderer.ts`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/TemplateToolbarAction.ts` | Create | Isolated decision module; injected `confirm` and `createEntry`; no `obsidian` `Menu`, no network, no timers |
| `src/i18n.ts` | Modify (data) | `toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip`, `menu.newFromTemplate` times en / zh-CN / zh-TW |
| `src/views/ToolbarRenderer.ts` | Modify | Call site 1: pass `currentDb` into `renderNewButton` at `:236` and `:282`; adaptive label/icon/tooltip; phone icon-only; module-only `createEntry` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Adaptive toolbar New control, visible with zero templates | Template path set: `toolbar.newFromTemplate` plus `file-plus-2` plus path tooltip. Else: `toolbar.new` plus `plus`. Control stays visible; chart/read-only still hidden by existing guards (`ToolbarRenderer.ts:236, 282`). |
| REQ-002 | Module is the only `createEntry` caller | `onclick` is only `void executeNewFromTemplate({ ..., createEntry: () => actions.createEntry() })`. Hosts never call `createEntry` afterwards. `confirmWithModal` returns `Promise<boolean \| string>` (`ConfirmModal.ts:69-71`); the module branches on `ok === true` even though this child keeps confirm disabled. |
| REQ-003 | Isolated rebase-friendly toolbar slice | New logic lives in `TemplateToolbarAction.ts` plus this one view host plus i18n data (`EuroFormat.ts:1-42`). No DatabaseView edit. No scheduler, fetch, or webhook. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Phone-density label | When `isPhoneLayout()` (`ToolbarRenderer.ts:285-287`) and a template is set, render icon-only (`file-plus-2`); keep the full string on `aria-label` / `title`. Desktop keeps the full label. |
| REQ-005 | Template-path tooltip | `getNewFromTemplateTooltip` uses the full `newRecordTemplate.path` (the config key). i18n `toolbar.newFromTemplateTooltip` carries `{path}`. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A database with a record template shows **New from template** plus a path tooltip on the desktop toolbar.
- **SC-002**: A database with no template stays labeled **New** and still creates via the existing empty-set path (`loadNewRecordTemplate` returns `undefined` at `DatabaseView.ts:3674-3675`).
- **SC-003**: On `body.is-phone` with a template set, the control is icon-only and still clicks through `executeNewFromTemplate`.
- **SC-004**: One click creates one row; the host does not call `actions.createEntry()` after the module.

### Acceptance Scenarios

- **Given** a database with `newRecordTemplate.path` set, **when** the toolbar renders on desktop, **then** the New button uses `toolbar.newFromTemplate`, icon `file-plus-2`, and the full path tooltip.
- **Given** a database with no template, **when** the operator clicks New, **then** the label stays **New** and create still writes a blank note.
- **Given** a template on phone (`isPhoneLayout()`), **when** the toolbar renders, **then** visible text is omitted and `aria-label` / `title` keep the full string.
- **Given** any toolbar click, **when** `executeNewFromTemplate` runs, **then** `createEntry` is invoked exactly once by the module.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Host calls `createEntry` after the module | Two notes per click | `onclick` is only `void executeNewFromTemplate(...)`; final-plan: "then `actions.createEntry()`" is a drafting error |
| Risk | `if (!ok) return` on confirm result | Secondary-button string treated as success (`ConfirmModal.ts:69-71`) | Branch on `ok === true` inside the module now, even with confirm disabled |
| Risk | Full **New from template** text on phone | Toolbar overflow on `body.is-phone` | Same-diff `isPhoneLayout()` icon-only branch (`ToolbarRenderer.ts:285-287`) |
| Risk | `ToolbarRenderer` has no `App` | Cannot call `confirmWithModal` here | Confirm deferred; this child injects `confirm: async () => true` |
| Dependency | Existing create path `createBlankEntry` | Phase must not fork a second engine | Module delegates via injected `createEntry`; never imports `src/views/` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: adaptive label (not always "New from template"); tooltip is the full vault path; phone is icon-only on first ship; REQ-004 confirm stays deferred.
<!-- /ANCHOR:questions -->
