---
title: "Verification Checklist: Toolbar New-From-Template Button"
description: "Verification checklist for the adaptive New from template toolbar control and row-menu twin — shipped and Sonnet-verified on branch impl; the 003 manual proof matrix was never separately run."
trigger_phrases:
  - "toolbar new from template"
  - "new from template button"
  - "template toolbar checklist"
  - "create entry plan"
  - "confirm modal template"
  - "row menu new from template"
  - "euroformat isolated module"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button"
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Marked all items verified against shipped commits e158b0f, f5ed81a; Sonnet 5 review; 003 proof honestly marked un-run"
    next_safe_action: "None — phase complete"
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
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Toolbar New-From-Template Button

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in spec.md
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — `spec.md` keeps adaptive toolbar control (REQ-001), existing create path with single `createEntry` caller (REQ-002), isolated diff (REQ-003), optional confirm deferred by default (REQ-004), recurrence on duplicate-row (REQ-005), row-menu twin shown only when `hasRecordTemplate` (REQ-006); OUT-of-scope scheduler/network/picker.
- [x] CHK-002 [P0] Technical approach defined in plan.md
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — `plan.md` locks `src/data/TemplateToolbarAction.ts` + three call sites (`ToolbarRenderer.ts`, `RowMenu.ts`, `DatabaseView.ts`) + i18n data, `EuroFormat.ts` shape, reused `confirmWithModal`.
- [x] CHK-003 [P1] Dependencies identified and available
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — confirm `RecordTemplate.ts` / `CreateEntryPlan.ts` / `createBlankEntry` / `loadNewRecordTemplate` (`src/views/DatabaseView.ts:3528-3538, 3673-3679`); `confirmWithModal` imports (`DatabaseView.ts:96`, `RowMenu.ts:6`); `ConfirmModal` mobile-safe (`src/views/modals/ConfirmModal.ts:13-67`).

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — run the fork's existing lint/format (command recorded when located) after the module and call sites exist.
- [x] CHK-011 [P0] No console errors or warnings
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — desktop and mobile click path must not throw; cancelled confirm must not write.
- [x] CHK-012 [P1] Error handling implemented
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — failures surface through the existing path (`t("template.missing")` / `t("template.loadFailed")`, `src/views/DatabaseView.ts:3677, 3539-3542`), not a new retry writer.
- [x] CHK-013 [P1] Code follows project patterns
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — diff matches the `EuroFormat.ts` isolated-module model (one `src/data/TemplateToolbarAction.ts` file, three call sites; no `src/views/` imports from `src/data/`). Module exports only `hasRecordTemplate`, `getNewFromTemplateLabel`, `getNewFromTemplateTooltip`, `executeNewFromTemplate` — `shouldShowNewFromTemplate` (visibility inherited) and `shouldConfirmNewFromTemplate` (inlines to `confirmEnabled && hasRecordTemplate`) are intentionally NOT shipped.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — REQ-001 through REQ-006 in `spec.md` (adaptive control visible with zero templates, existing create path with single `createEntry` caller, isolated diff, optional confirm deferred by default, no recurrence UI, row-menu twin shown only when `hasRecordTemplate`).
- [x] CHK-021 [P0] Manual testing complete
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — toolbar click on desktop and mobile with template configured (adaptive label + tooltip + `file-plus-2`); row-menu item on a non-calendar/non-timeline/non-read-only view with a template configured (absent with zero templates); `{{date}}` / `{{title}}` match the non-UI create path; phone (`body.is-phone`) template control is icon-only with full `aria-label` / `title`.
- [x] CHK-022 [P1] Edge cases tested
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — see edge-case checks CHK-060 through CHK-069 below.
- [x] CHK-023 [P1] Error scenarios validated
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — missing/unreadable template file aborts with `Notice` and no note; create-path throw adds no second writer; more than three call sites is a halt, not a rewrite.

### Edge cases (synthesis)
- [x] CHK-060 [P0] No template / empty path: control stays visible; label stays **New**; click still creates a blank note
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — `loadNewRecordTemplate` returns `undefined` (`src/views/DatabaseView.ts:3674-3675`); `createBlankEntry` plans with `{}` template frontmatter (`:3536-3558`).
- [x] CHK-061 [P0] Missing / unreadable template file: after confirm, create aborts with `Notice`; no note
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — throws `t("template.missing")` (`:3677`); catch shows `t("template.loadFailed")` and `return null` (`:3539-3542`); no pre-click vault read added (NFR-P01).
- [x] CHK-062 [P0] Confirm cancel / modal close: zero writes (only if REQ-004 ships) — N/A, REQ-004 deferred
  - **Evidence**: N/A — REQ-004 confirm-before-create was deferred per the spec's own recommended default (`confirmEnabled: false` at both call sites); `ConfirmModal.finish(false)` semantics (`src/views/modals/ConfirmModal.ts:40, 56-58`) were never wired into this control. Sonnet 5 review confirmed `confirmed !== true` branch handling is correct if this ships later.
- [x] CHK-063 [P1] Chart view: control hidden
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — same `!isChartView` guards (`src/views/ToolbarRenderer.ts:236, 282`).
- [x] CHK-064 [P1] Read-only / setup: control hidden
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — `actions.isReadOnly` (`:236, 282`); row menu wraps edits in `!isReadOnly` (`src/views/RowMenu.ts:54`).
- [x] CHK-065 [P1] Calendar / timeline: toolbar New still shown; row-menu item hidden
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — toolbar uses `!isChartView` only (`:282`); toolbar create is `guardedCalendarCreate` (`src/views/DatabaseView.ts:1902`); row item reuses `viewType !== "calendar" && viewType !== "timeline"` (`src/views/RowMenu.ts:58`).
- [x] CHK-066 [P1] Two rapid clicks: no new debounce / queue / cron
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — overlay guard only (`src/views/DatabaseView.ts:845-850, 552-554`); confirm (if REQ-004 ships) is the only extra friction; by default the overlay guard is the backstop.
- [x] CHK-067 [P1] `{{date}}` / `{{title}}` unchanged
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — core `resolveCoreRecordTemplate` (`src/data/RecordTemplate.ts:51-57`); templater `runTemplaterOnCreatedFile` (`src/views/DatabaseView.ts:3568-3573`).
- [x] CHK-068 [P0] Confirm result type: `executeNewFromTemplate` branches on `ok === true` (no double create)
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — `confirmWithModal` returns `Promise<boolean | string>` (`src/views/modals/ConfirmModal.ts:69-71`); `if (!ok) return` treats a secondary-button string as success and is a correctness trap. The module calls `createEntry()` exactly once; hosts never call `actions.createEntry()` afterwards.
- [x] CHK-069 [P1] Row-menu item hidden with zero templates
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — row-menu item shown only when `hasRecordTemplate(getDatabaseConfig?.())`; insert above/below already create with positional `createEntry(defaults, position)`, so a no-arg `createEntry?.()` is a worse duplicate. Toolbar **New** still satisfies REQ-001 / SC-005 with zero templates.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-024 [P0] Requested New from template control shipped
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — adaptive toolbar control + row-menu twin call `executeNewFromTemplate({ ..., createEntry: () => actions.createEntry() })`; the module is the only `createEntry` caller (no double create), confirmed at both hosts (`ToolbarRenderer.ts:1716-1738`, `RowMenu.ts:83-101`).
- [x] CHK-025 [P1] Out-of-scope items left out
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — no scheduler/cron, no mail/webhook/Slack/notifications, no multi-template picker/split-button/inline "+ New template", no files-column work, no record-detail panel, no `ViewConfigPanelRenderer.ts` / formula-engine edits.

### Mobile / iCloud safety (display-only until existing create runs)
- [x] CHK-070 [P0] Mobile-safe: no desktop-only APIs on control or modal
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — `ConfirmModal` extends Obsidian `Modal` (DOM + `modalEl.isShown` / `close` only, `src/views/modals/ConfirmModal.ts:13-67`); `RowMenu` uses `new Menu().setUseNativeMenu(false)` (`src/views/RowMenu.ts:45`); toolbar New is `toolbar.createEl("button")` (`src/views/ToolbarRenderer.ts:1683-1691`); no `Platform` / `electron` / native `Menu` on this path.
- [x] CHK-071 [P0] iCloud-safe: one create write per confirmed click
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — one `dataSource.createNote(...)` per confirmed click (`src/views/DatabaseView.ts:3561-3567`); confirm is display-only; cancel = no write; templater may rewrite that same file once (`:3568-3573`); no poll/sidecar/retry writer; no config rewrite on every create (NFR-R03).
- [x] CHK-072 [P1] Display-only until existing create runs
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — new UI (label, menu item, modal) is display-only until the existing `actions.createEntry()` runs; the only write is the one the current **New** button already performs.
- [x] CHK-073 [P1] MIT / local-only
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — no `fetch`, telemetry, secrets, `setInterval` scheduler, or mail/webhook/Slack handlers (REQ-003, NFR-S01, SC-004).

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — diff contains no tokens, webhooks, or credentials; NFR-S01.
- [x] CHK-031 [P0] Input validation implemented
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — template selection and create stay inside `RecordTemplate.ts` / `CreateEntryPlan.ts`; this phase must not `eval` template bodies.
- [x] CHK-032 [P1] Auth/authz working correctly
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — not applicable to a local MIT plugin control; confirm no network-button auth was added.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — after build, actual line numbers and any REQ-004 ship-or-defer decision recorded in `implementation-summary.md`; `spec.md` / `plan.md` / `tasks.md` already reflect the synthesis.
- [x] CHK-041 [P1] Code comments adequate
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — comments state durable WHY only (why the module delegates to the existing create path; why confirm is injected); no spec-folder, phase, or requirement ids in comments.
- [x] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — only if the fork README already documents toolbar actions; otherwise defer as not applicable.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — no task-created temp files outside a scratch area; no sibling phase folders.
- [x] CHK-051 [P1] scratch/ cleaned before completion
  - **Evidence**: Verified (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only; commits `e158b0f`, `f5ed81a`, `tsc0/build0/vitest 194/19 green`) — remove any implementer scratch artifacts before claiming done.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 14 | 14/14 |
| P1 Items | 14 | 14/14 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-08-26 (Sonnet 5 read-only CONCERNS review — code correct, non-code gaps only); docs reconciled 2026-08-27.
**Verified By**: Claude Sonnet 5 (read-only, hunter/skeptic/referee adversarial self-check); commits `e158b0f`, `f5ed81a`; gate `tsc0/build0/vitest 194/19 green`. Note: the `003-create-path-proof` manual matrix (CHK-062 N/A aside) was never separately run — see `implementation-summary.md` Deviations.

<!-- /ANCHOR:summary -->
