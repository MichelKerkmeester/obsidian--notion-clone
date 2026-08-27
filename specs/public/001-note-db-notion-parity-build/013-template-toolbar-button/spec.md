---
title: "Feature Specification: Toolbar New-From-Template Button"
description: "Specifies an adaptive New from template toolbar control and row-menu twin that reuse the existing RecordTemplate / CreateEntryPlan create path via one isolated src/data module and three call sites."
trigger_phrases:
  - "toolbar new from template"
  - "new from template button"
  - "record template toolbar"
  - "create entry plan"
  - "template toolbar button"
  - "notion buttons parity"
  - "confirm modal template"
  - "row menu new from template"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored from synthesis and final-plan"
    next_safe_action: "Build 001-adaptive-toolbar-control per its plan.md and tasks.md"
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
# Feature Specification: Toolbar New-From-Template Button

> Predecessor: `012-files-column` · Successor: `014-record-detail-panel` Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P2 |
| **Status** | In Progress |
| **Created** | 2026-08-24 |
| **Branch** | `013-template-toolbar-button` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The note-database fork already implements Notion-style record templates and already wires them to the toolbar **New** button. `renderNewButton` calls `actions.createEntry()` with no args (`src/views/ToolbarRenderer.ts:1683-1691`), which reaches `createBlankEntry` → `loadNewRecordTemplate` → `buildCreateEntryPlan` / `planCreateEntry` (`src/views/DatabaseView.ts:845-850, 3528-3538, 3673-3679`). The create-with-defaults engine therefore already exists. The gap is **discoverability**, not a second engine: the button is labeled only `"New"` (`src/i18n.ts:177`), so an operator who configured `database.newRecordTemplate` has no visible indication that clicking **New** applies that template, and the row menu has no template entry at all (`src/views/RowMenu.ts:36-120`).

### Purpose
Ship an adaptive **New from template** label on the toolbar plus a row-menu twin, via one EuroFormat-style `src/data/` module and exactly three call sites, reusing the existing `confirmWithModal` for an optional confirm-before-create. `NewRecordTemplateConfig` is a single `{ path, engine }` (`src/data/types.ts:154-157, 279`); a Notion-style multi-template picker would require a schema change and exceeds the 1–3 call-site budget, so it is explicitly out. Duplicate-row already covers recurrence. The rest of Notion Buttons — scheduler/cron and network actions (mail, webhook, Slack, notifications) — is not a local vault feature and is out of this phase. Nested children own the ordered slices: adaptive toolbar module plus host first, then the row-menu twin, then create-path proof. Source of truth: `research/synthesis.md` (evidence trail: `research/research.md`). Fork root: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- An **adaptive** toolbar New control: when `database.newRecordTemplate.path` is set, label `toolbar.newFromTemplate` + `file-plus-2` icon + path tooltip; otherwise keep `toolbar.new` + `plus` (`src/i18n.ts:177`). Control stays visible with zero templates.
- A **New from template** item on the row menu (`src/views/RowMenu.ts`), a distinct host from the toolbar (`src/views/DatabaseView.ts:555-567`), reusing the same isolated module.
- An optional `ConfirmModal` before create, reusing the existing mobile-safe `confirmWithModal` (`src/views/modals/ConfirmModal.ts:40, 56-58`; already imported in `DatabaseView.ts:96` and `RowMenu.ts:6`). Cancel writes nothing. **Deferred by default:** today's unlabeled **New** already creates with no modal, so a template-only modal is anti-parity friction; the existing overlay guard (`src/views/DatabaseView.ts:845-850, 552-554`) is the in-budget double-click backstop. Ship confirm only if the operator overrides (REQ-004).
- One new isolated module `src/data/TemplateToolbarAction.ts` plus exactly three call-site edits (`ToolbarRenderer.ts`, `RowMenu.ts`, `DatabaseView.ts`), following the `EuroFormat.ts` rebase-friendly isolated-diff model (`src/data/EuroFormat.ts:1-42`). i18n key additions are data, not a call site.
- Mobile-safe wiring (no desktop-only APIs; `ConfirmModal` extends Obsidian `Modal`, `RowMenu` uses `setUseNativeMenu(false)`). MIT-forkable. iCloud-safe (one `dataSource.createNote(...)` per confirmed click, `src/views/DatabaseView.ts:3561-3567`; no poll/sidecar/retry).

### Out of Scope
- Notion split-button + template dropdown, multi-template / per-view `defaultTemplateId`, and inline "+ New template" from the New control. All require a `NewRecordTemplateConfig` schema change and/or exceed the 1–3 call-site budget (`src/data/types.ts:154-157`; `src/views/ViewConfigPanelRenderer.ts:420-477`).
- Scheduler, cron, or any time-triggered create. Recurrence stays on the existing duplicate-row path (REQ-005).
- Network buttons: mail, webhook, Slack, notifications, or any non-local action (REQ-003, SC-004).
- New template engines, new placeholder syntax, or changes to the two formula engines (`ComputedField.ts` / `SafeEval.ts`, `BaseExpression.ts`). `RecordTemplate.ts`, `CreateEntryPlan.ts`, and `ViewConfigPanelRenderer.ts` are untouched.
- Column-type, view-type, relation, rollup, filter, footer, chart, or conditional-formatting work.
- Record-detail panel work (successor `014-record-detail-panel`) and files-column work (predecessor `012-files-column`).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/TemplateToolbarAction.ts` | Create | Isolated decision module. Exports `hasRecordTemplate`, `getNewFromTemplateLabel`, `getNewFromTemplateTooltip`, `executeNewFromTemplate`. Pure decisions + injected side effects; no `obsidian` `Menu`, no network, no timers. `shouldShowNewFromTemplate` is intentionally NOT exported (visibility is inherited from existing guards); `shouldConfirmNewFromTemplate` inlines to `confirmEnabled && hasRecordTemplate(config)`. `getNewFromTemplateConfirmCopy(config)` is added only if REQ-004 ships. |
| `src/views/ToolbarRenderer.ts` | Modify | Import module; `renderNewButton` takes optional `DatabaseConfig` and is passed `currentDb` internally from `render()` at `:236` and `:282` (no DatabaseView pass-through for the label); adaptive label/tooltip/icon; `onclick` = `void executeNewFromTemplate({ config: currentDb, confirmEnabled: false, confirm: async () => true, createEntry: () => actions.createEntry() })` — the module is the only `createEntry` caller; hosts never call `createEntry` afterwards. On `isPhoneLayout()` with a template set, render icon-only (`file-plus-2`) and keep the full string on `aria-label` / `title`. Do not extend `ToolbarActions` unless REQ-004 ships. Call site 1. |
| `src/views/RowMenu.ts` | Modify | Import module + `DatabaseConfig`; add `getDatabaseConfig?`; add item after insert separator `:75` **only if** `hasRecordTemplate(getDatabaseConfig?.())`; `onClick` = `void executeNewFromTemplate({ ..., createEntry: () => this.actions.createEntry?.() })` with no extra `createEntry` after; inside existing `!isReadOnly` and `viewType !== "calendar" && viewType !== "timeline"` guards. Call site 2. |
| `src/views/DatabaseView.ts` | Modify | RowMenu ctor `:555-567`: `getDatabaseConfig: () => this.getActiveDb()` (`getActiveDb` at `:783-786`; `newRecordTemplate` lives on `DatabaseConfig` not `ViewConfig`). No new import. Toolbar-actions confirm wiring (`:1902` region: `confirmNewFromTemplate: true`, `confirmCreate: () => confirmWithModal(...)`) is **optional** and added only if REQ-004 ships. Call site 3. |
| `src/i18n.ts` | Modify (data) | Add `toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip`, `menu.newFromTemplate` × en / zh-CN / zh-TW. Add `toolbar.confirmNewFromTemplate` only if REQ-004 ships. Data file, not a call site. |
| `src/data/RecordTemplate.ts`, `src/data/CreateEntryPlan.ts`, `src/views/ViewConfigPanelRenderer.ts` | Unchanged | Create-with-defaults and `{{date}}` / `{{title}}` already live here; this phase must not fork a second create path or touch the config panel. |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Adaptive toolbar New-from-template control, visible with zero templates | When `database.newRecordTemplate.path` is set, the toolbar New button shows `toolbar.newFromTemplate` + `file-plus-2` + path tooltip; otherwise it keeps `toolbar.new` + `plus`. Control stays visible and reachable on mobile and desktop even with no template configured. Clicking it is the only required user gesture. |
| REQ-002 | Click calls the existing create-with-defaults path | The control invokes the existing `actions.createEntry()` → `guardedCalendarCreate` / `guardedCreateEntry` → `createBlankEntry` → `loadNewRecordTemplate` → `buildCreateEntryPlan` / `planCreateEntry` chain. The new row receives that path's defaults, including markdown/core/templater `{{date}}` and `{{title}}` via `resolveCoreRecordTemplate` (`src/data/RecordTemplate.ts:51-57`). `executeNewFromTemplate` is the **only** `createEntry` caller — hosts inject `createEntry: () => actions.createEntry()` and never call `createEntry` afterwards; a host that calls both writes two notes per click and is a failure. A second create implementation is also a failure. |
| REQ-003 | Isolated rebase-friendly diff; local-only; no scheduler | New logic lives in one `src/data/TemplateToolbarAction.ts` module plus exactly three call-site edits (`EuroFormat.ts` model). No cron/scheduler. No mail/webhook/Slack/notifications. No telemetry, no secrets. MIT-forkable. iCloud-safe (no extra write churn beyond the single create the existing path already performs). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Optional confirm-before-create | If shipped, the existing `confirmWithModal` runs before create when a template is configured; cancel/onClose performs no write (`src/views/modals/ConfirmModal.ts:40, 56-58`). `confirmWithModal` returns `Promise<boolean \| string>`, so `executeNewFromTemplate` must branch on `ok === true` (a secondary-button string is NOT success). **Recommended default: defer.** Today's unlabeled **New** already creates with no modal; a template-only modal is anti-parity friction and the overlay guard (`src/views/DatabaseView.ts:845-850, 552-554`) is the in-budget double-click backstop. Ship only if the operator overrides; record the choice in `implementation-summary.md`. Desktop-only modal APIs are not acceptable. |
| REQ-005 | Recurrence stays on duplicate-row | This control adds no recurrence, interval, or next-occurrence fields. Duplicate-row remains the recurrence path. |
| REQ-006 | Row-menu New-from-template twin | The row menu (`src/views/RowMenu.ts`) exposes the same adaptive action inside the existing `!isReadOnly` and `viewType !== "calendar" && viewType !== "timeline"` guards (`:54-58`), reusing the same isolated module. The item is shown **only when `hasRecordTemplate(config)`** — insert above/below already create with positional `createEntry(defaults, position)`, so a no-arg `createEntry?.()` is a worse duplicate, not a twin. The toolbar still shows **New** with zero templates (REQ-001 / SC-005). |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: From a database view, the New control is reachable on the toolbar without leaving the view, on mobile and desktop, and is labeled adaptively when a template is configured.
- **SC-002**: One click (or click plus optional confirm) creates a row through the existing `CreateEntryPlan.ts` / `RecordTemplate.ts` path, with `{{date}}` / `{{title}}` resolved the same way as today's non-UI create path.
- **SC-003**: Diff shape is one new `src/data/` file plus exactly three call-site edits (toolbar, row-menu, DatabaseView wiring); `git rebase` onto upstream is not blocked by a tangled UI rewrite.
- **SC-004**: The shipped tree contains no scheduler, no network-button handlers, and no recurrence UI on this control; no multi-template picker, split-button, or inline "+ New template".
- **SC-005**: With zero templates configured, the control stays visible, stays labeled **New**, and a click still creates a blank note via the existing empty-set path.

### Acceptance Scenarios

- **Scenario 1**: **Given** a database that has a record template configured, **when** the operator clicks the toolbar New control, **then** it is labeled **New from template**, shows the template path tooltip, and creates a row via `CreateEntryPlan.ts` with that template's defaults.
- **Scenario 2**: **Given** the template uses `{{date}}` and/or `{{title}}`, **when** the create path runs from this control, **then** those placeholders resolve via `resolveCoreRecordTemplate` the same way as the existing templater path (no new substitution engine).
- **Scenario 3**: **Given** REQ-004 confirm is enabled (operator override) and a template is configured, **when** the operator cancels or closes the modal, **then** no note is written and the view is unchanged. (Default build defers REQ-004; this scenario applies only when confirm ships.)
- **Scenario 4**: **Given** the row menu is opened on a non-calendar, non-timeline, non-read-only view with a template configured, **then** **New from template** is present after the insert separator and calls the same isolated module as the toolbar. With zero templates the row-menu item is absent (the toolbar **New** still satisfies REQ-001).
- **Scenario 5**: **Given** the operator inspects the diff, **when** they compare it to `EuroFormat.ts`, **then** they see one isolated `src/data/` module and three call sites, not a rewrite of formula, rollup, view, or config-panel code.
- **Scenario 6**: **Given** a database with no template configured, **when** the operator clicks the New control, **then** it is labeled **New** and still creates a blank note (existing empty-set path; `loadNewRecordTemplate` returns `undefined`).
- **Scenario 7**: **Given** a template is configured on a phone (`body.is-phone`), **when** the toolbar renders, **then** the New control is icon-only (`file-plus-2`) with the full **New from template** string preserved on `aria-label` / `title` (no phone overflow).
- **Scenario 8**: **Given** any host clicks the New control, **when** `executeNewFromTemplate` runs, **then** `createEntry` is invoked exactly once by the module; the host never calls `actions.createEntry()` afterwards (no double create).

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Existing create path `RecordTemplate.ts` + `CreateEntryPlan.ts` + `createBlankEntry` already apply template defaults | Phase has no create engine if misread | Module delegates via injected `createEntry`; never imports `src/views/` (EuroFormat forbids it, `src/data/EuroFormat.ts:1-42`); `createBlankEntry` is private (`src/views/DatabaseView.ts:3528`) |
| Dependency | `confirmWithModal` already imported in `DatabaseView.ts:96` and `RowMenu.ts:6` | Re-confirm import rather than re-add | Reuse existing import; no new modal code |
| Dependency | Duplicate-row already covers recurrence | Scope creep into scheduler/recurrence UI | Treat recurrence as out of scope; REQ-005 |
| Risk | Expanding into Notion split-button / multi-template picker | Blows the 1–3 call-site budget; needs `NewRecordTemplateConfig` schema change | Locked out: single `{ path, engine }` config (`src/data/types.ts:154-157, 279`); revisit only as a later packet with explicit schema change |
| Risk | `ToolbarRenderer` has no `App`; cannot call `confirmWithModal` directly | Confirm cannot run from the renderer | Confirm is deferred by default; if shipped, inject `confirmCreate` from `DatabaseView` (call site 3) and put copy on the module as `getNewFromTemplateConfirmCopy(config)`; renderer only calls `executeNewFromTemplate` |
| Risk | Extra writes around create | iCloud churn on a personal vault | One `dataSource.createNote(...)` per confirmed click (`src/views/DatabaseView.ts:3561-3567`); no retry loops, no sidecar files, no config rewrite on every create |
| Risk | Tangled UI rewrite | `git rebase` onto upstream becomes expensive | Isolated `src/data/` module + three call sites, same model as `EuroFormat.ts` |
| Risk | Network-button temptation (mail/webhook/Slack) | Non-local, needs people, not MIT-vault-safe | Explicit OUT; no stubs that import network APIs (REQ-003, NFR-S01) |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Click-to-create uses the existing create path's cost; this phase must not add polling, cron, pre-click vault reads, or extra vault walks before the write.

### Security
- **NFR-S01**: No telemetry, no secrets, no network button payloads. MIT-forkable. `SafeEval.ts` constraints (no arrows/loops/`eval`) are untouched; this phase does not evaluate formulas.

### Reliability
- **NFR-R01**: Cancelled confirm writes nothing (`ConfirmModal` `finish(false)` on cancel and `onClose`, `src/views/modals/ConfirmModal.ts:40, 56-58`). Failed create surfaces through the existing create path's error handling (`t("template.missing")` / `t("template.loadFailed")`, `src/views/DatabaseView.ts:3677, 3539-3542`), not a new retry writer.
- **NFR-R02**: Mobile-safe: no desktop-only APIs on the control or modal. `ConfirmModal` extends Obsidian `Modal`; `RowMenu` uses `setUseNativeMenu(false)` (`src/views/RowMenu.ts:45`); toolbar New is `toolbar.createEl("button")`.
- **NFR-R03**: iCloud-safe: one create write per confirmed click; no churny metadata rewrites. `updateViewDefFile` only pre-existing group-option auto-registration, not introduced here.
- **NFR-R04**: Rebase-friendly: new isolated `src/data/` module + three call-site edits.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **No template / empty path**: control stays visible; label stays **New**; click still creates. `loadNewRecordTemplate` returns `undefined` (`src/views/DatabaseView.ts:3674-3675`); `createBlankEntry` plans with `{}` template frontmatter (`:3536-3558`). Follow the existing empty-set path; do not invent a new empty state.
- **Missing / unreadable template file**: after confirm, create aborts with a `Notice`; no note written. Throws `t("template.missing")` (`:3677`); catch shows `t("template.loadFailed")` and `return null` (`:3539-3542`). Do not add a pre-click vault read (NFR-P01).
- **Template body with `{{date}}` / `{{title}}`**: substitution stays in the existing path — core `resolveCoreRecordTemplate` (`src/data/RecordTemplate.ts:51-57`); templater `runTemplaterOnCreatedFile` post-create (`src/views/DatabaseView.ts:3568-3573`).
- **Confirm cancel / modal close**: zero writes (`src/views/modals/ConfirmModal.ts:40, 56-58`). `confirmWithModal` returns `Promise<boolean | string>` (`ConfirmModal.ts:69-71`); `executeNewFromTemplate` must branch on `ok === true` — `if (!ok) return` treats a secondary-button string as success and is a correctness trap.
- **Double create**: `executeNewFromTemplate` is the only `createEntry` caller. Hosts inject `createEntry: () => actions.createEntry()` and never call `createEntry` afterwards; "then `actions.createEntry()`" in any older wording is a drafting error, not an instruction.
- **Row menu with zero templates**: the row-menu item is shown only when `hasRecordTemplate(config)`. Insert above/below already create with positional `createEntry(defaults, position)`; a no-arg `createEntry?.()` is a worse duplicate. The toolbar **New** still satisfies REQ-001 / SC-005.

### View / Mode Boundaries
- **Chart view**: control hidden — same `!isChartView` guards (`src/views/ToolbarRenderer.ts:236, 282`).
- **Read-only / setup**: control hidden — `actions.isReadOnly` (`:236, 282`); row menu wraps edits in `!isReadOnly` (`src/views/RowMenu.ts:54`).
- **Calendar / timeline**: toolbar New still shown (toolbar uses `!isChartView` only, `:282`; toolbar create is `guardedCalendarCreate`, `src/views/DatabaseView.ts:1902`). Row-menu template item hidden — reuse the existing `viewType !== "calendar" && viewType !== "timeline"` guard (`src/views/RowMenu.ts:58`); date-driven creates, not insert-from-row.

### Error Scenarios
- Create path throws: do not add a second error writer; surface the existing failure.
- More than three call sites appear necessary: halt and report; do not expand into a UI rewrite.
- Accidental scheduler or network import: treat as spec failure, not a stretch goal.

### Concurrent Operations
- **Two rapid clicks**: no new debounce / queue / cron. Overlay guard only (`src/views/DatabaseView.ts:845-850, 552-554`). Calendar has `pendingCalendarTimelineCreates`; toolbar/row-menu does not. Confirm (if REQ-004 ships) is the only extra friction; by default the overlay guard is the backstop. Inherit existing concurrent behavior.

### Mobile / iCloud
- **Mobile**: `ConfirmModal` extends Obsidian `Modal` (DOM + `modalEl.isShown` / `close` only, `src/views/modals/ConfirmModal.ts:13-67`); `RowMenu` uses `new Menu().setUseNativeMenu(false)` (`src/views/RowMenu.ts:45`); toolbar New is `toolbar.createEl("button")` (`src/views/ToolbarRenderer.ts:1683-1691`). No `Platform` / `electron` / native `Menu` on this path.
- **iCloud**: one `dataSource.createNote(...)` per confirmed click (`src/views/DatabaseView.ts:3561-3567`); confirm is display-only; cancel = no write; templater may rewrite that same file once (`:3568-3573`). No poll, sidecar, retry writer, or config rewrite on every create.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | Adaptive label + row-menu twin over an existing create path; one module, three call sites; no engine work |
| Risk | 4/25 | Hosts, modal, and guards all confirmed in research; remaining risk is budget creep into split-button/picker (locked out) |
| Research | 18/20 | 10-iteration deep research complete; synthesis locks the design and edge cases |
| **Total** | **30/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

1. **Ship REQ-004 confirm now, or defer?** Recommended default: **defer**. Today's **New** is already a one-click write; overlay guard (`src/views/DatabaseView.ts:845-850`) is the double-click backstop; a template-only modal is anti-parity friction. Ship only if accidental templated creates in the finance vault hurt more than an extra click; record the choice in `implementation-summary.md`.
2. **Adaptive label vs always "New from template"?** Recommended default: adaptive (template configured → "New from template" + `file-plus-2`; else keep "New" + `plus`).
3. **Phone: icon-only vs full label on first ship?** Recommended default: **icon-only on `body.is-phone` when a template is set**, full string on `aria-label` / `title`. Do not wait for a follow-up packet — shipping a longer label onto the phone title-row + toolbar is the overflow failure the synthesis flagged.
4. **Row-menu item when no template is configured?** Recommended default: **hide**. Toolbar stays visible (REQ-001). Showing **New** next to insert above/below duplicates a worse create. Override only if the operator wants a discoverability twin even when it labels a blank create.
5. **Tooltip contents: full vault path vs filename?** Recommended default: full `newRecordTemplate.path`. Shorten later without a schema change if noisy.
6. **Split-button / multi-template / inline "+ New template" / repeating templates?** Recommended default: no. Locked out by single-file `NewRecordTemplateConfig`, the 1–3 call-site budget, `ViewConfigPanelRenderer` as the config surface, and REQ-005. Revisit only as a later packet with an explicit schema change.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research synthesis (ranked backlog, locked design)**: `research/synthesis.md`
- **Research evidence trail**: `research/research.md`
- **Fork root**: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-adaptive-toolbar-control/ | Isolated `TemplateToolbarAction.ts` plus i18n and the adaptive toolbar New host (path tooltip, phone icon-only) | Complete |
| 2 | 002-row-menu-template-item/ | Row-menu New-from-template item when a template is set, plus DatabaseView `getDatabaseConfig` wiring | Complete |
| 3 | 003-create-path-proof/ | Prove one create via the existing path, no double create, phone and empty-set behavior, and the three-host diff | Complete |

Future / out of this phase (not child folders): REQ-004 confirm-before-create (deferred; overlay guard is the double-click backstop); Notion split-button plus template dropdown; inline "+ New template"; multi-template / per-view `defaultTemplateId`; repeating or scheduled templates; AppFlowy-style payload pre-fill as a new engine; network buttons (mail, webhook, Slack).

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-adaptive-toolbar-control | 002-row-menu-template-item | `src/data/TemplateToolbarAction.ts` exports `hasRecordTemplate`, `getNewFromTemplateLabel`, `getNewFromTemplateTooltip`, and `executeNewFromTemplate`; i18n keys include `toolbar.newFromTemplate`, `toolbar.newFromTemplateTooltip`, and `menu.newFromTemplate`; toolbar adaptive label plus phone icon-only land; the module is the only toolbar `createEntry` caller; `confirmEnabled` stays false | Desktop template DB shows **New from template** plus path tooltip; zero-template stays **New**; chart/read-only still hidden (`ToolbarRenderer.ts:236, 282`); phone template control is icon-only with full `aria-label` / `title` (`:285-287`) |
| 002-row-menu-template-item | 003-create-path-proof | Row-menu item exists only when `hasRecordTemplate` inside the existing `!isReadOnly` and calendar/timeline guards; DatabaseView RowMenu ctor wires `getDatabaseConfig: () => this.getActiveDb()`; the module is the only row-menu `createEntry` caller | Item present on table/board/gallery/list with a template; absent with zero templates, on calendar/timeline, and when read-only (`RowMenu.ts:54-75`); `getActiveDb` at `DatabaseView.ts:783-786` |
<!-- /ANCHOR:phase-map -->
