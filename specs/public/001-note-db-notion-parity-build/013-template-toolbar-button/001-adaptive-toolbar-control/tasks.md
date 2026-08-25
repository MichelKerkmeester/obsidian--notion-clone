---
title: "Tasks: Adaptive Toolbar Control"
description: "Ordered tasks for TemplateToolbarAction.ts, i18n keys, and ToolbarRenderer.renderNewButton including path tooltip and phone icon-only."
trigger_phrases:
  - "adaptive toolbar tasks"
  - "template toolbar action"
  - "renderNewButton"
  - "phone icon-only new"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Adaptive Toolbar Control

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

T002–T004 are **one shippable slice**. Do not ship the longer toolbar label without the phone icon-only branch. Tooltip is the same module, not a follow-up.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Re-read create-with-defaults already on **New**: `RecordTemplate.ts:51-57`, `DatabaseView.ts:845-856, 3528-3573, 3673-3679`, `ToolbarRenderer.ts:236, 282, 1683-1691`, `ConfirmModal.ts:13-71`, `EuroFormat.ts:1-42` (fork files: read-only) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 **Create `src/data/TemplateToolbarAction.ts`**: import `t` from `../i18n`, `DatabaseConfig` from `./types`; no `src/views/` imports. Export `hasRecordTemplate` (`!!config?.newRecordTemplate?.path` at `types.ts:154-157, 279`), `getNewFromTemplateLabel`, `getNewFromTemplateTooltip` (full path), `executeNewFromTemplate`. If `confirmEnabled && hasRecordTemplate(config)`, `await confirm()` and return unless `=== true`; then `createEntry()` once. Do not export `shouldShowNewFromTemplate` or `shouldConfirmNewFromTemplate`. No network, no timers, no `Menu` (`src/data/TemplateToolbarAction.ts`) [S]
- [ ] T003 **i18n data** — same slice as T002: near `toolbar.new` (`src/i18n.ts:177` en; zh-CN / zh-TW peers) add `toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip` (`{path}`), `menu.newFromTemplate`. Do not add `toolbar.confirmNewFromTemplate`. `t("common.create")` already exists (`:134`) (`src/i18n.ts`) [S]
- [ ] T004 **Call site 1 — `ToolbarRenderer.ts`** — same slice as T002: import the module; `renderNewButton(toolbar, actions, currentDb?)` (`:1683-1691`); pass `currentDb` from `render()` at `:236` and `:282` (`:137`). Template: `t("toolbar.newFromTemplate")` plus `file-plus-2` plus `getNewFromTemplateTooltip`. Else: `t("toolbar.new")` plus `plus`. If `isPhoneLayout()` (`:285-287`) and template set, omit visible text; keep aria-label/title. `onclick` = `void executeNewFromTemplate({ config: currentDb, confirmEnabled: false, confirm: async () => true, createEntry: () => actions.createEntry() })`. Do not extend `ToolbarActions`. Do not call `createEntry` afterwards (`src/views/ToolbarRenderer.ts:236, 282, 1683-1691`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Desktop: template DB shows **New from template** plus path tooltip; zero-template stays **New** and still creates (`loadNewRecordTemplate` returns `undefined` at `DatabaseView.ts:3674-3675`). Chart/read-only still hidden (`ToolbarRenderer.ts:236, 282`). Phone template control is icon-only and still clicks through the existing create path. Confirm the three-row branch table: no template; template plus confirm true; template plus confirm false (`src/views/ToolbarRenderer.ts`, `src/data/TemplateToolbarAction.ts`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T002–T004 shipped together
- [ ] Manual verification of T005 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1, 4, 5
- **Parent final-plan**: `../research/final-plan.md` steps 1–4
<!-- /ANCHOR:cross-refs -->
