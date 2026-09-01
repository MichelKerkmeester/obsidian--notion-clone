---
title: "Implementation Plan: Toolbar New-From-Template Button"
description: "Locked design: one src/data/TemplateToolbarAction.ts module plus three call sites (ToolbarRenderer, RowMenu, DatabaseView) reusing the existing create path and confirmWithModal."
trigger_phrases:
  - "toolbar new from template"
  - "new from template button"
  - "create entry plan"
  - "template toolbar plan"
  - "euroformat isolated module"
  - "confirm modal template"
  - "row menu new from template"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/013-template-toolbar-button"
    last_updated_at: "2026-08-27T12:25:50Z"
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
# Implementation Plan: Toolbar New-From-Template Button

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript Obsidian plugin (MIT fork) |
| **Framework** | Existing note-database fork UI; `RecordTemplate.ts` / `CreateEntryPlan.ts` create path; `confirmWithModal` / `ConfirmModal` |
| **Storage** | Vault notes via the existing create-with-defaults path; one `dataSource.createNote(...)` per confirmed click; no new persistence format |
| **Testing** | Fork test harness if present plus manual toolbar/row-menu clicks on mobile and desktop |

### Overview
The create-with-defaults path already exists and is already wired to the toolbar **New** button (`renderNewButton` → `actions.createEntry()` → `createBlankEntry` → `loadNewRecordTemplate` → `buildCreateEntryPlan` / `planCreateEntry`). The gap is discoverability. This plan ships an adaptive **New from template** label, a row-menu twin, and an optional confirm-before-create via one new isolated module `src/data/TemplateToolbarAction.ts` and exactly three call sites, reusing the existing `confirmWithModal`. No second create engine, no scheduler/cron, no network buttons, no multi-template picker. Source of truth: `research/synthesis.md`. Fork root: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] `RecordTemplate.ts`, `CreateEntryPlan.ts`, `createBlankEntry`, `loadNewRecordTemplate` read in the fork; create-with-defaults and `{{date}}` / `{{title}}` confirmed as the path to call (`src/views/DatabaseView.ts:3528-3538, 3673-3679`).
- [ ] Three call-site hosts confirmed: `src/views/ToolbarRenderer.ts`, `src/views/RowMenu.ts`, `src/views/DatabaseView.ts`.
- [ ] `confirmWithModal` import confirmed present in `DatabaseView.ts:96` and `RowMenu.ts:6`; `ConfirmModal` mobile-safe (`src/views/modals/ConfirmModal.ts:13-67`).
- [ ] Duplicate-row confirmed as the recurrence path; no scheduler work queued.
- [ ] Network buttons explicitly excluded (mail/webhook/Slack/notifications); multi-template picker / split-button / inline "+ New template" locked out.
- [ ] Isolated-diff budget agreed: one `src/data/TemplateToolbarAction.ts` module, three call sites, `EuroFormat.ts` shape (`src/data/EuroFormat.ts:1-42`).

### Definition of Done
- [ ] Adaptive **New from template** control visible on the toolbar (template configured → `toolbar.newFromTemplate` + `file-plus-2` + path tooltip; else `toolbar.new` + `plus`); visible with zero templates.
- [ ] Row-menu **New from template** item present after the insert separator inside the existing read-only/calendar guards.
- [ ] Both call sites route through `executeNewFromTemplate` with `createEntry: () => actions.createEntry()` injected; the module is the only `createEntry` caller (no double create); no second create engine.
- [ ] Optional `confirmWithModal` either deferred (default — overlay guard is the double-click backstop) or shipped enabled with operator approval, mobile-safe; cancel/onClose writes nothing; record the choice in `implementation-summary.md`.
- [ ] Diff is one new `src/data/` file plus exactly three call-site edits (+ i18n data); no telemetry/secrets; no cron; no network buttons; no picker/split-button.
- [ ] Manual mobile and desktop click path verified; cancelled confirm writes nothing (if shipped); zero-template click still creates a blank note; phone template control is icon-only with full `aria-label` / `title`.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated decision module plus thin UI call sites — the same rebase-friendly shape as `EuroFormat.ts` (`src/data/EuroFormat.ts:1-42`). New decision logic lives in `src/data/`; the view layer still calls the live create callback. The module decides; the view layer delegates.

### Key Components
- **Existing create path (unchanged)**: `actions.createEntry()` → `guardedCalendarCreate` (toolbar, `src/views/DatabaseView.ts:1902, 852-856`) or `guardedCreateEntry` (row menu, `:563, 845-850`) → `createBlankEntry` (`:3528`) → `loadNewRecordTemplate` (`:3673-3679`) → `buildCreateEntryPlan` / `planCreateEntry`. Core engine resolves `{{title}}` / `{{date}}` / `{{time}}` via `resolveCoreRecordTemplate` (`src/data/RecordTemplate.ts:51-57`); templater runs post-create (`src/views/DatabaseView.ts:3568-3573`). Zero templates → `loadNewRecordTemplate` returns `undefined` (`:3674-3675`) and create still writes a blank note.
- **New module `src/data/TemplateToolbarAction.ts`**: Exports `hasRecordTemplate`, `getNewFromTemplateLabel`, `getNewFromTemplateTooltip`, `executeNewFromTemplate`. Pure decision + injected side effects. No `obsidian` `Menu`, no network, no timers. May import `t` from `../i18n` (14 existing `src/data/` files do) and `DatabaseConfig` from `./types`. Must NOT import `src/views/` (EuroFormat forbids it). `shouldShowNewFromTemplate` is intentionally NOT exported (visibility is inherited from existing `!isReadOnly && !isChartView` / calendar-timeline guards); `shouldConfirmNewFromTemplate` inlines to `confirmEnabled && hasRecordTemplate(config)`. `getNewFromTemplateConfirmCopy(config)` is added only if REQ-004 ships.
- **Toolbar control (`src/views/ToolbarRenderer.ts`)**: Adaptive label/tooltip/icon; `renderNewButton` is passed `currentDb` internally from `render()` (no DatabaseView pass-through for the label); `onclick` = `void executeNewFromTemplate({ config: currentDb, confirmEnabled: false, confirm: async () => true, createEntry: () => actions.createEntry() })` — the module is the only `createEntry` caller. On `isPhoneLayout()` with a template set, render icon-only and keep the full string on `aria-label` / `title`. Has no `App`; must not call `confirmWithModal` directly — confirm is injected only if REQ-004 ships.
- **Row-menu control (`src/views/RowMenu.ts`)**: Same adaptive action after the insert separator (`:75`), inside the existing `!isReadOnly` and `viewType !== "calendar" && viewType !== "timeline"` guards (`:54-58`), shown **only when `hasRecordTemplate(getDatabaseConfig?.())`**; `onClick` = `void executeNewFromTemplate({ ..., createEntry: () => this.actions.createEntry?.() })` with no extra `createEntry` after; reuses its already-imported `confirmWithModal` (`:6`) only if REQ-004 ships.
- **Optional confirm (deferred by default)**: reuses `confirmWithModal` / `ConfirmModal` (`src/views/modals/ConfirmModal.ts:40, 56-58`); cancel/onClose resolve `false` → no write. `confirmWithModal` returns `Promise<boolean | string>` (`ConfirmModal.ts:69-71`), so `executeNewFromTemplate` branches on `ok === true`. Ship only with operator approval; overlay guard (`src/views/DatabaseView.ts:845-850, 552-554`) is the default double-click backstop.

### Locked Design — Core Algorithm
Do not reimplement create. The module decides; the view layer still calls the live create callback.

1. `hasRecordTemplate(config)` → `!!config.newRecordTemplate?.path` (`src/data/types.ts:154-157, 279`).
2. Label / tooltip / icon: if true → `t("toolbar.newFromTemplate")`, tooltip with `{path}`, icon `file-plus-2`; else → existing `t("toolbar.new")` (`src/i18n.ts:177`) and icon `plus`.
3. Visibility: inherit current guards — `!isReadOnly && !isChartView` on the toolbar (`src/views/ToolbarRenderer.ts:236, 282`); row-menu item inside `!isReadOnly` and the same `viewType !== "calendar" && viewType !== "timeline"` guard as insert above/below (`src/views/RowMenu.ts:54-58`).
4. `executeNewFromTemplate({ config, confirmEnabled, confirm, createEntry })`: if `confirmEnabled && hasRecordTemplate(config)`, `await confirm()` and **return unless `ok === true`** (`confirmWithModal` returns `Promise<boolean | string>`; a secondary-button string is NOT success); then `createEntry()` **once**. The module is the only `createEntry` caller — hosts inject `createEntry: () => actions.createEntry()` and never call `createEntry` afterwards.
5. `createEntry` remains the existing callback (toolbar `guardedCalendarCreate`; row menu `guardedCreateEntry`). Both load the template inside `createBlankEntry`.

### Why the module does not call `CreateEntryPlan` itself
Spec wording ("wrapper that calls the existing path") is satisfied by owning the confirm-then-delegate algorithm, not by importing views. `createBlankEntry` is a private `DatabaseView` method (`src/views/DatabaseView.ts:3528`). EuroFormat forbids `src/views/` imports (`src/data/EuroFormat.ts:1-42`). Inject `confirm` (`confirmWithModal`) and `createEntry` from the hosts.

### Call Sites (exactly three code hosts; i18n is data, not a call site)
1. **`src/views/ToolbarRenderer.ts`** — import the module; change `renderNewButton` to take optional `DatabaseConfig` and pass `currentDb` internally from `render()` at `:236` and `:282` (no DatabaseView pass-through for the label); adaptive label/tooltip/icon; on `isPhoneLayout()` with a template set, render icon-only and keep the full string on `aria-label` / `title`; `onclick` = `void executeNewFromTemplate({ config: currentDb, confirmEnabled: false, confirm: async () => true, createEntry: () => actions.createEntry() })` — the module is the only `createEntry` caller. Do not extend `ToolbarActions` unless REQ-004 ships.
2. **`src/views/RowMenu.ts`** — import the module + `DatabaseConfig`; add `getDatabaseConfig?: () => DatabaseConfig | undefined`; after the insert separator (`:75`) add the item **only if** `hasRecordTemplate(getDatabaseConfig?.())`; `onClick` = `void executeNewFromTemplate({ ..., createEntry: () => this.actions.createEntry?.() })` with no extra `createEntry` after; inside the existing `!isReadOnly` and `viewType !== "calendar" && viewType !== "timeline"` guards. Reuse the already-imported `confirmWithModal` (`:6`) only if REQ-004 ships.
3. **`src/views/DatabaseView.ts`** — RowMenu ctor (`:555-567`): `getDatabaseConfig: () => this.getActiveDb()` (`getActiveDb` at `:783-786`; `newRecordTemplate` lives on `DatabaseConfig`, not `ViewConfig`). No new import. The toolbar-actions confirm wiring (`:1902` region: `confirmNewFromTemplate: true`, `confirmCreate: () => confirmWithModal(this.app, { title, message: getNewFromTemplateConfirmCopy(db), confirmText: t("common.create") })`) is **optional** and added only if REQ-004 ships. `t("common.create")` already exists in all three locales (`src/i18n.ts:134` and locale peers).

### i18n (not a 4th call site)
Add `toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip`, `menu.newFromTemplate` × en / zh-CN / zh-TW to `src/i18n.ts`. Add `toolbar.confirmNewFromTemplate` only if REQ-004 ships.

### Data Flow
Operator clicks New control → `executeNewFromTemplate` (module) → optional `confirmWithModal` (injected, only if REQ-004 ships; branch on `ok === true`) → `createEntry()` once (the module is the only caller) → existing `actions.createEntry()` → `createBlankEntry` → `loadNewRecordTemplate` → `buildCreateEntryPlan` / `planCreateEntry` → one `dataSource.createNote(...)` with template defaults (`{{date}}` / `{{title}}` resolved by the existing path) → view refresh. No cron. No outbound network. Recurrence is not in this flow.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Re-read `RecordTemplate.ts`, `CreateEntryPlan.ts`, `createBlankEntry` / `loadNewRecordTemplate` in `src/views/DatabaseView.ts:3528-3538, 3673-3679`; confirm `{{date}}` / `{{title}}` via `resolveCoreRecordTemplate` (`src/data/RecordTemplate.ts:51-57`).
- [ ] Confirm the three call-site hosts and the `confirmWithModal` imports (`DatabaseView.ts:96`, `RowMenu.ts:6`).
- [ ] Confirm duplicate-row owns recurrence; confirm no existing **New from template** control to duplicate.

### Phase 2: Core Implementation
- [ ] Create `src/data/TemplateToolbarAction.ts` with the four exports above (`hasRecordTemplate`, `getNewFromTemplateLabel`, `getNewFromTemplateTooltip`, `executeNewFromTemplate`); pure decisions + `executeNewFromTemplate` with injected `confirm` / `createEntry`; branch on `ok === true`; module is the only `createEntry` caller. Do not export `shouldShowNewFromTemplate` / `shouldConfirmNewFromTemplate`.
- [ ] Add the three core i18n keys × three locales to `src/i18n.ts` (`toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip`, `menu.newFromTemplate`); add `toolbar.confirmNewFromTemplate` only if REQ-004 ships.
- [ ] Call site 1 — `src/views/ToolbarRenderer.ts`: update `renderNewButton` to take optional `DatabaseConfig`, pass `currentDb` internally from `render()` at `:236` and `:282`; adaptive label/tooltip/icon; on `isPhoneLayout()` with a template set, render icon-only and keep the full string on `aria-label` / `title` (folds phone-density in, not a follow-up); `onclick` = `void executeNewFromTemplate({ config: currentDb, confirmEnabled: false, confirm: async () => true, createEntry: () => actions.createEntry() })`. Do not extend `ToolbarActions` unless REQ-004 ships.
- [ ] Call site 2 — `src/views/RowMenu.ts`: add `getDatabaseConfig`, add item after insert separator `:75` **only if** `hasRecordTemplate(getDatabaseConfig?.())`, `onClick` = `void executeNewFromTemplate({ ..., createEntry: () => this.actions.createEntry?.() })` with no extra `createEntry` after.
- [ ] Call site 3 — `src/views/DatabaseView.ts`: wire RowMenu ctor (`:555-567`) with `getDatabaseConfig: () => this.getActiveDb()` (always). Add toolbar-actions confirm wiring (`:1902` region) only if REQ-004 ships.
- [ ] Keep total call-site edits at exactly three; do not touch `RecordTemplate.ts`, `CreateEntryPlan.ts`, formula engines, or `ViewConfigPanelRenderer.ts`.

### Phase 3: Verification
- [ ] Click toolbar on desktop with a template configured: adaptive label + tooltip + row created via existing path; `{{date}}` / `{{title}}` match non-UI create; exactly one `createEntry` call (no double create).
- [ ] Click toolbar with zero templates: label stays **New**, blank note created.
- [ ] Row-menu item on a non-calendar, non-timeline, non-read-only view with a template configured: present after insert separator, same module. With zero templates: row-menu item absent (toolbar **New** still satisfies REQ-001).
- [ ] Phone (`body.is-phone`) with a template set: toolbar control is icon-only with full `aria-label` / `title` (no overflow).
- [ ] Cancel confirm (only if REQ-004 shipped): no write; `ok === true` is the only proceed path.
- [ ] Repeat on mobile (no desktop-only APIs).
- [ ] Diff review: one new `src/data/` file, three call sites, i18n data; no scheduler/network/telemetry/picker; no `shouldShowNewFromTemplate` / `shouldConfirmNewFromTemplate` exports.
- [ ] Run fork tests/lint if a harness exists; record the actual command when known.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Source read-through | Confirm create path, hosts, modal, guards | Read `RecordTemplate.ts`, `CreateEntryPlan.ts`, `ToolbarRenderer.ts`, `RowMenu.ts`, `DatabaseView.ts`, `ConfirmModal.ts` in the fork |
| Unit (if harness exists) | `TemplateToolbarAction` decisions + `executeNewFromTemplate` cancel/confirm branching | Fork test runner — command recorded when found |
| Manual | Toolbar + row-menu click; adaptive label; zero-template; confirm cancel; mobile + desktop | Obsidian on iOS/iPadOS or mobile emulator plus desktop |
| Diff contract | One `src/data/` module + three call sites; no cron/network/picker | `git diff` against the `EuroFormat.ts` shape |
| Packet (docs only) | This phase folder structure | `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh specs/001-note-db-notion-parity-build/013-template-toolbar-button --strict` (not a substitute for plugin verification) |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `RecordTemplate.ts` + `CreateEntryPlan.ts` + `createBlankEntry` create-with-defaults | Internal (fork, confirmed) | Green | No create path to call; phase cannot ship a control |
| `confirmWithModal` / `ConfirmModal` (mobile-safe) | Internal (fork, confirmed; `DatabaseView.ts:96`, `RowMenu.ts:6`, `ConfirmModal.ts:13-67`) | Green | REQ-004 deferred with approval rather than desktop-only APIs |
| Duplicate-row recurrence | Internal (fork, confirmed) | Green | Recurrence must not be rebuilt here; if missing, still out of scope |
| Three call-site hosts (`ToolbarRenderer.ts`, `RowMenu.ts`, `DatabaseView.ts`) | Internal (confirmed) | Green | Cannot wire the click; Setup re-confirms before Core |
| `NewRecordTemplateConfig` single `{ path, engine }` | Internal (`src/data/types.ts:154-157, 279`) | Green (constraint) | Multi-template picker / split-button locked out; revisit only with schema change |
| Predecessor `012-files-column` | Adjacent phase | Not a blocker | Adjacent in the parent packet only |
| Successor `014-record-detail-panel` | Adjacent phase | Not a blocker | Detail panel is a later surface; do not implement it here |
| Formula / rollup / view engines; `ViewConfigPanelRenderer.ts` | Fork baseline | Untouched | Must not be edited in this phase |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: The control writes outside the existing `createBlankEntry` path, uses desktop-only APIs, adds scheduler/network/picker code, or the diff exceeds one `src/data/` module plus three call sites.
- **Procedure**: Delete `src/data/TemplateToolbarAction.ts`, revert the three core i18n key additions (plus `toolbar.confirmNewFromTemplate` if REQ-004 shipped), and revert the three call-site edits in `ToolbarRenderer.ts`, `RowMenu.ts`, `DatabaseView.ts`. Vault notes already created by successful clicks stay (they are user data, not a migration). No schema to reverse.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 30 minutes (re-read confirmed path + hosts) |
| Core Implementation | Low | 2 hours (module + i18n + three call sites + optional confirm) |
| Verification | Low | 1 hour (mobile/desktop click, adaptive label, zero-template, diff contract) |
| **Total** | | **~3.5 hours (Effort S)** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Call-site count is exactly three; new code is confined to one `src/data/TemplateToolbarAction.ts` module (+ i18n data).
- [ ] No scheduler, network-button, telemetry, secrets, picker, or split-button code in the diff.
- [ ] Create still goes through `actions.createEntry()` → `createBlankEntry` → `loadNewRecordTemplate` → `CreateEntryPlan.ts` / `RecordTemplate.ts`.
- [ ] Mobile-safe APIs only (`ConfirmModal` extends `Modal`; `RowMenu` `setUseNativeMenu(false)`; toolbar `createEl("button")`).
- [ ] `RecordTemplate.ts`, `CreateEntryPlan.ts`, `ViewConfigPanelRenderer.ts`, and formula engines untouched.

### Rollback Procedure
1. Revert the three call-site edits (`ToolbarRenderer.ts`, `RowMenu.ts`, `DatabaseView.ts`).
2. Revert the three core i18n key additions (plus `toolbar.confirmNewFromTemplate` if REQ-004 shipped).
3. Delete `src/data/TemplateToolbarAction.ts`.
4. Confirm the plugin builds and existing duplicate-row / create-with-defaults still work.
5. Leave any notes already created by the control in the vault (user data).

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A. Creates are ordinary vault notes via the existing path; do not bulk-delete them on rollback.

<!-- /ANCHOR:enhanced-rollback -->
