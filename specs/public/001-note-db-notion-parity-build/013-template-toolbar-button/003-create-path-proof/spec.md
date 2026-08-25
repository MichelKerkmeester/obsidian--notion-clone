---
title: "Feature Specification: Create Path Proof"
description: "Prove one create via createBlankEntry, no double create, phone icon-only, zero-template and missing-file behavior, and a three-host plus one-module diff with no fetch or scheduler."
trigger_phrases:
  - "create path proof"
  - "double create template"
  - "new from template verify"
  - "overlay guard create"
  - "template missing notice"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button/003-create-path-proof"
    last_updated_at: "2026-08-25T21:20:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored create-path-proof child from synthesis edge cases and final-plan step 8"
    next_safe_action: "Run one-create, grep, phone, and missing-file proofs after children 001-002"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-create-path-proof"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Feature Specification: Create Path Proof

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P2 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `013-template-toolbar-button` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 3 |
| **Predecessor** | 002-row-menu-template-item |
| **Successor** | None |
| **Handoff Criteria** | One create per click; no double create; phone icon-only; empty-set and missing-file paths unchanged; grep shows one module plus three hosts |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-row-menu-template-item`. Synthesis edge cases plus final-plan step 8. Residual risks: double create, phone overflow, `if (!ok) return` on confirm result. REQ-004 stays deferred; record that choice here.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Call-site prose that says `onclick` then `actions.createEntry()` after `executeNewFromTemplate` writes two notes per click. Confirm result type is `Promise<boolean | string>` (`ConfirmModal.ts:69-71`); `if (!ok) return` treats a secondary-button string as success. Phone overflow and missing-template Notices can hide behind a rubber-stamped "New from template works."

### Purpose
After children 001–002, prove the existing create-with-defaults path still runs once per click, `{{date}}` / `{{title}}` still resolve in `resolveCoreRecordTemplate` (`RecordTemplate.ts:51-57`) / `runTemplaterOnCreatedFile` (`DatabaseView.ts:3568-3573`), zero-template still creates, missing files still Notice without a pre-click vault read, rapid clicks still use the overlay guard only (`DatabaseView.ts:845-850, 552-554`), and the diff is one `src/data/` file plus three hosts plus i18n.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Desktop: template click creates one row via `createBlankEntry`; placeholders unchanged.
- Zero-template click still creates (`loadNewRecordTemplate` returns `undefined` at `DatabaseView.ts:3674-3675`).
- Missing template file: existing `t("template.missing")` / `t("template.loadFailed")` (`:3677, 3539-3542`); no pre-click vault read (NFR-P01).
- Two rapid clicks: overlay guard only; no new debounce / queue / cron.
- Mobile: toolbar is `toolbar.createEl("button")` (`ToolbarRenderer.ts:1683-1691`); `RowMenu` keeps `setUseNativeMenu(false)` (`RowMenu.ts:45`); phone template control is icon-only (`isPhoneLayout()` at `:285-287`).
- Grep: `executeNewFromTemplate` is the only `createEntry` caller at the two hosts; no `fetch` / `setInterval` / webhook; diff is `TemplateToolbarAction.ts`, `ToolbarRenderer.ts`, `RowMenu.ts`, `DatabaseView.ts`, `i18n.ts`.
- Record REQ-004 deferred in `implementation-summary.md` (parent spec requires this).
- Fill this child's `checklist.md` with honest evidence (pending until proofs run).

### Out of Scope
- Implementing the module or hosts (children 001–002).
- Shipping REQ-004 confirm, split-button, multi-template, scheduler, or network buttons.
- Adding a second create engine to "make proofs pass."

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| This child's `checklist.md` / `implementation-summary.md` | Modify | Evidence rows after proofs |
| Fork `src/` | Unchanged by this child | Observe children 001–002; do not add production files here |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | One create per click through the existing path | Template toolbar click and row-menu click each write one note via `createBlankEntry` (`DatabaseView.ts:3528-3538, 3673-3679`). Hosts do not call `createEntry` after the module. |
| REQ-002 | Diff shape and local-only | Grep shows one new `src/data/` file, three hosts, i18n data; no `fetch` / `setInterval` / webhook / mail / Slack. |
| REQ-003 | iCloud one write | One `dataSource.createNote(...)` per confirmed click (`DatabaseView.ts:3561-3567`). Templater may rewrite that same file once (`:3568-3573`). No poll, sidecar, or retry writer. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Empty-set, missing file, rapid clicks, phone | Zero-template still creates; missing file Notices and writes nothing; overlay guard only; phone template control is icon-only with full aria-label/title. |
| REQ-005 | Confirm deferral recorded | REQ-004 confirm did not ship; choice recorded in `implementation-summary.md`. Overlay guard (`DatabaseView.ts:845-850, 552-554`) remains the double-click backstop. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: One click creates one row; `{{date}}` / `{{title}}` still come from `RecordTemplate.ts:51-57` / `DatabaseView.ts:3568-3573`.
- **SC-002**: Grep shows no second create caller, no scheduler, no network buttons, three hosts plus one module.
- **SC-003**: Phone icon-only, zero-template create, and missing-file Notice are recorded in `checklist.md`.

### Acceptance Scenarios

- **Given** a configured template, **when** the operator clicks toolbar New from template, **then** exactly one note is created via `createBlankEntry`.
- **Given** `{{date}}` / `{{title}}` in the template, **when** that click runs, **then** placeholders resolve the same way as today's non-UI create path.
- **Given** no template, **when** the operator clicks toolbar New, **then** a blank note is still created.
- **Given** a missing template file, **when** create runs, **then** `t("template.missing")` / `t("template.loadFailed")` surface and no note is written (`DatabaseView.ts:3677, 3539-3542`).
- **Given** two rapid clicks, **when** the overlay is up, **then** no new debounce is introduced (`DatabaseView.ts:845-850, 552-554`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Children 001–002 | Nothing to prove | Do not start until module, toolbar, row-menu, and ctor wiring exist |
| Risk | Host-then-module create | Two notes per click | Grep both hosts for `createEntry` after `executeNewFromTemplate` |
| Risk | Shipping confirm to "fix" double-click | Anti-parity friction | Keep REQ-004 deferred; overlay guard is the backstop |
| Risk | Pre-click vault read of the template | NFR-P01 violation | Missing file is still caught inside `loadNewRecordTemplate` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Proofs must not add polling, cron, or a pre-click vault read.

### Security
- **NFR-S01**: Grep finds no telemetry, secrets, or network-button payloads.

### Reliability
- **NFR-R01**: Missing-file and cancel paths write nothing (`ConfirmModal.ts:40, 56-58` unused while confirm is deferred; create-path Notices at `DatabaseView.ts:3677, 3539-3542`).
- **NFR-R02**: Mobile-safe: `createEl("button")` plus `setUseNativeMenu(false)` (`RowMenu.ts:45`); no `Platform` / `electron` / native `Menu` on this path.
- **NFR-R03**: iCloud-safe: one `createNote` per click (`DatabaseView.ts:3561-3567`).
- **NFR-R04**: Rebase-friendly: one isolated `src/data/` module plus three call sites.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- No template / empty path: toolbar stays **New**; click still creates (`DatabaseView.ts:3674-3675`).
- Missing / unreadable template: Notice; no note (`:3677, 3539-3542`).
- Confirm cancel: not shipped; if later enabled, `ok === true` is the only proceed path (`ConfirmModal.ts:69-71`).

### View / Mode Boundaries
- Chart and read-only: control hidden (`ToolbarRenderer.ts:236, 282`; `RowMenu.ts:54`).
- Calendar / timeline: toolbar New still shown; row-menu item hidden (`RowMenu.ts:58`).

### Concurrent Operations
- Two rapid clicks: overlay guard only (`DatabaseView.ts:845-850, 552-554`).
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 6/25 | Proofs plus grep; no new production module |
| Risk | 8/25 | Double create and phone overflow are residual |
| Research | 8/20 | Locked by `research/final-plan.md` step 8 |
| **Total** | **22/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: defer REQ-004 confirm; tooltip stays full path; row-menu item stays hidden with zero templates; do not build split-button / multi-template / scheduler.
<!-- /ANCHOR:questions -->
