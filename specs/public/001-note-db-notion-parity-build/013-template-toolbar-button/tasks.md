---
title: "Tasks: Toolbar New-From-Template Button"
description: "Ranked backlog from research synthesis as ordered build tasks: adaptive toolbar control, row-menu twin, optional confirm, phone-density, tooltip, with locked-out items marked blocked."
trigger_phrases:
  - "toolbar new from template"
  - "new from template button"
  - "create entry plan tasks"
  - "template toolbar tasks"
  - "record template wiring"
  - "confirm modal template"
  - "row menu new from template"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/013-template-toolbar-button"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan.md review findings to spec/plan/tasks/checklist; status Planned"
    next_safe_action: "Build phase 013 per plan.md and tasks.md"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Tasks: Toolbar New-From-Template Button

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked / deferred (locked out this phase) |

**Task Format**: `T### [P?] Description (file path:line) [effort S/M/L]`

Tasks are ordered by the synthesis ranked backlog, reconciled with `research/final-plan.md`. Items 6–10 of the backlog are locked out this phase and listed under "Locked out" with `[B]`. Ranked item 4 (phone-density) and the standalone tooltip task (former T009) are folded into T006 (toolbar call site), not deferred. REQ-004 confirm is deferred by default; its wiring is the optional T028.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 [P] Re-read the existing create-with-defaults path: `renderNewButton` → `actions.createEntry()` (`src/views/ToolbarRenderer.ts:1683-1691`) → `guardedCreateEntry` / `guardedCalendarCreate` → `createBlankEntry` → `loadNewRecordTemplate` → `buildCreateEntryPlan` / `planCreateEntry` (`src/views/DatabaseView.ts:845-850, 3528-3538, 3673-3679`); confirm `{{date}}` / `{{title}}` via `resolveCoreRecordTemplate` (`src/data/RecordTemplate.ts:51-57`) [S]
- [ ] T002 [P] Confirm the three call-site hosts and the `confirmWithModal` imports: `src/views/ToolbarRenderer.ts` (`renderNewButton` `:1683-1691`, invocations `:236` and `:282`, `ToolbarActions.createEntry` `:81`); `src/views/RowMenu.ts` (`:36-120`, insert separator `:75`, `confirmWithModal` `:6`); `src/views/DatabaseView.ts` (RowMenu ctor `:555-567`, toolbar actions `:1902`, `confirmWithModal` `:96`) [S]
- [ ] T003 Confirm `NewRecordTemplateConfig` is single `{ path, engine }` (`src/data/types.ts:154-157, 279`) and duplicate-row owns recurrence; no scheduler/picker work in scope [S]

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Ranked backlog item 1 — Adaptive toolbar New-from-template control
- [ ] T004 Create `src/data/TemplateToolbarAction.ts` exporting `hasRecordTemplate`, `getNewFromTemplateLabel`, `getNewFromTemplateTooltip`, `executeNewFromTemplate` (pure decisions + injected `confirm` / `createEntry`; import `t` from `../i18n`, `DatabaseConfig` from `./types`; no `src/views/` imports). `executeNewFromTemplate` branches on `ok === true` (`confirmWithModal` returns `Promise<boolean | string>`; a secondary-button string is NOT success) and calls `createEntry()` exactly once — the module is the only `createEntry` caller. Do NOT export `shouldShowNewFromTemplate` (visibility is inherited from existing `!isReadOnly && !isChartView` / calendar-timeline guards) or `shouldConfirmNewFromTemplate` (inlines to `confirmEnabled && hasRecordTemplate(config)`) (`src/data/TemplateToolbarAction.ts`) [S]
- [ ] T005 Add i18n keys `toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip`, `menu.newFromTemplate` × en / zh-CN / zh-TW (`src/i18n.ts:177` region). Add `toolbar.confirmNewFromTemplate` only if REQ-004 ships [S]
- [ ] T006 Call site 1 — `src/views/ToolbarRenderer.ts`: import module; `renderNewButton` takes optional `DatabaseConfig` and is passed `currentDb` internally from `render()` at `:236` and `:282` (no DatabaseView pass-through for the label); adaptive label/tooltip/icon (`file-plus-2` vs `plus`); wire `getNewFromTemplateTooltip` as `aria-label` / `title` (folds former T009 tooltip wiring in); on `isPhoneLayout()` (`:285-287`) with a template set, render icon-only and keep the full string on `aria-label` / `title` (folds former T027 phone-density in, not a follow-up); `onclick` = `void executeNewFromTemplate({ config: currentDb, confirmEnabled: false, confirm: async () => true, createEntry: () => actions.createEntry() })` — module is the only `createEntry` caller. Do not extend `ToolbarActions` unless REQ-004 ships (`src/views/ToolbarRenderer.ts:236, 282, 285-287, 1683-1691`) [S]

### Ranked backlog item 2 — Row-menu New-from-template item
- [ ] T007 Call site 2 — `src/views/RowMenu.ts`: import module + `DatabaseConfig`; add `getDatabaseConfig?: () => DatabaseConfig | undefined` on `RowMenuActions`; add item after the insert separator (`:75`) **only if** `hasRecordTemplate(getDatabaseConfig?.())` (insert above/below already create with positional `createEntry(defaults, position)`; a no-arg `createEntry?.()` is a worse duplicate, not a twin); `onClick` = `void executeNewFromTemplate({ ..., createEntry: () => this.actions.createEntry?.() })` with no extra `createEntry` after; inside existing `!isReadOnly` and `viewType !== "calendar" && viewType !== "timeline"` guards (`:54-58`). Reuse `confirmWithModal` (`:6`) only if REQ-004 ships (`src/views/RowMenu.ts:6, 54-58, 75`) [S]

### Ranked backlog item 3 — DatabaseView RowMenu wiring (always-on) + optional confirm (REQ-004)
- [ ] T008 Call site 3 — `src/views/DatabaseView.ts` RowMenu ctor (`:555-567`): `getDatabaseConfig: () => this.getActiveDb()` (`getActiveDb` at `:783-786`; `newRecordTemplate` lives on `DatabaseConfig`, not `ViewConfig`). No new import. This wiring is always-on (the row-menu item needs the active DB's template path) (`src/views/DatabaseView.ts:555-567, 783-786`) [S]
- [ ] T028 [P] Optional REQ-004 confirm wiring — **skip unless operator overrides**. Extend `ToolbarActions` with `confirmNewFromTemplate?: boolean` and `confirmCreate?: () => Promise<boolean>`; add `getNewFromTemplateConfirmCopy(config)` to the module; DatabaseView toolbar actions (`:1902` region): `confirmNewFromTemplate: true`, `confirmCreate: () => confirmWithModal(this.app, { title, message: getNewFromTemplateConfirmCopy(db), confirmText: t("common.create") })`; RowMenu reuses its existing `confirmWithModal` import (`:6`) with the same copy; enable confirm only when `hasRecordTemplate`. Default is defer — overlay guard (`src/views/DatabaseView.ts:845-850, 552-554`) is the double-click backstop. Record the ship-or-defer choice in `implementation-summary.md` (`src/views/DatabaseView.ts:96, 1902`; `src/views/RowMenu.ts:6`) [S]

### Diff contract
- [ ] T010 Keep the diff to the new `src/data/TemplateToolbarAction.ts` module plus exactly three call-site edits (+ i18n data); do not touch `RecordTemplate.ts`, `CreateEntryPlan.ts`, formula engines, or `ViewConfigPanelRenderer.ts` (`src/data/EuroFormat.ts:1-42` shape) [S]
- [ ] T011 Exclude scheduler, mail, webhook, Slack, notifications, telemetry, secrets, multi-template picker, split-button, and inline "+ New template" from the diff (entire phase diff) [S]

### Locked out this phase (ranked backlog items 6–10)
- [B] T022 Ranked item 6 — Notion split-button + template dropdown. Exceeds 1–3 call-site budget; one-item list until schema changes. Effort L. Depends on item 8. **Do not build.**
- [B] T023 Ranked item 7 — Inline "+ New template" from the New control. Different storage model; `ViewConfigPanelRenderer` out of budget. Effort M. **Do not build.**
- [B] T024 Ranked item 8 — Multi-template / per-view `defaultTemplateId`. Blocked by `NewRecordTemplateConfig` schema + queryable template objects (`src/data/types.ts:154-157`). Effort L. Exceeds isolated-diff contract. **Do not build.**
- [B] T025 Ranked item 9 — Repeating / scheduled templates and network buttons. Spec OUT (REQ-003, REQ-005, SC-004). Recurrence stays on duplicate-row. **Do not build.**
- [B] T026 Ranked item 10 — AppFlowy-style payload pre-fill as a new engine. Would duplicate existing defaults. **Do not build.**

> Ranked item 4 (phone-density) and the standalone tooltip task (former T009) are folded into T006 — icon-only on `isPhoneLayout()` with a template set, full string on `aria-label` / `title`, and `getNewFromTemplateTooltip` wired as the tooltip. They are no longer deferred `[B]`.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Manual / Integration
- [ ] T012 Click toolbar New on desktop with a template configured: adaptive **New from template** label + path tooltip + `file-plus-2` icon; one new row via the existing create path; `{{date}}` / `{{title}}` match the non-UI create path; `createEntry` invoked exactly once (no double create) (Obsidian desktop) [S]
- [ ] T013 Click toolbar New with zero templates: label stays **New** + `plus`; still creates a blank note via the existing empty-set path (`loadNewRecordTemplate` returns `undefined`, `src/views/DatabaseView.ts:3674-3675`) [S]
- [ ] T014 Open row menu on a non-calendar, non-timeline, non-read-only view with a template configured: **New from template** present after the insert separator (`src/views/RowMenu.ts:75`), calls the same module; hidden on calendar/timeline and read-only. With zero templates: row-menu item absent (toolbar **New** still satisfies REQ-001) [S]
- [ ] T015 Cancel confirm (only if REQ-004 shipped via T028): no note written; `ConfirmModal` cancel/onClose resolve `false` (`src/views/modals/ConfirmModal.ts:40, 56-58`); `ok === true` is the only proceed path [S]
- [ ] T016 Repeat toolbar + row-menu click on mobile: no desktop-only APIs (`ConfirmModal` extends `Modal`; `RowMenu` `setUseNativeMenu(false)` `:45`; toolbar `createEl("button")`) [S]
- [ ] T029 Phone (`body.is-phone`) with a template set: toolbar control is icon-only (`file-plus-2`) with the full **New from template** string on `aria-label` / `title` (no overflow); still clicks through the existing create path [S]

### Edge cases
- [ ] T017 Missing / unreadable template file: after confirm, create aborts with `Notice`; no note; throws `t("template.missing")` (`src/views/DatabaseView.ts:3677`), catch shows `t("template.loadFailed")` and `return null` (`:3539-3542`); no pre-click vault read added [S]
- [ ] T018 Two rapid clicks: no new debounce/queue/cron; overlay guard only (`src/views/DatabaseView.ts:845-850, 552-554`); confirm (if REQ-004 ships) is the only extra friction; by default the overlay guard is the backstop [S]
- [ ] T019 iCloud safety: one `dataSource.createNote(...)` per confirmed click (`src/views/DatabaseView.ts:3561-3567`); no poll/sidecar/retry/config-rewrite on every create [S]

### Diff / docs
- [ ] T020 Diff review: one new `src/data/` file + three call sites + i18n data; no scheduler/network/telemetry/picker/split-button; no `shouldShowNewFromTemplate` / `shouldConfirmNewFromTemplate` exports [S]
- [ ] T021 Run fork lint/tests if a harness exists (command recorded when found); record actual file paths, test commands, and REQ-004 ship-or-defer decision (default: defer) in `checklist.md` and `implementation-summary.md` [S]

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-`[B]` tasks marked `[x]`.
- [ ] No `[B]` blocked tasks remaining (locked-out items stay `[B]` by design).
- [ ] Strict validation passed.
- [ ] Checklist.md fully verified.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research synthesis (ranked backlog)**: `research/synthesis.md`
- **Research evidence trail**: `research/research.md`

<!-- /ANCHOR:cross-refs -->
