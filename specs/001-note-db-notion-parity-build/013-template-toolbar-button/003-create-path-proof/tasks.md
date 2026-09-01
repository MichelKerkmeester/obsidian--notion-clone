---
title: "Tasks: Create Path Proof"
description: "One-create, grep, phone, empty-set, missing-file, overlay, and checklist evidence after children 001-002."
trigger_phrases:
  - "create path proof tasks"
  - "double create verify"
  - "template missing notice"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/013-template-toolbar-button/003-create-path-proof"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Tasks: Create Path Proof

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

Do not add production files in this child. Double-create and phone overflow are residual-risk detectors.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm children 001–002 landed. Record `git diff --stat` and expect `src/data/TemplateToolbarAction.ts`, `src/views/ToolbarRenderer.ts`, `src/views/RowMenu.ts`, `src/views/DatabaseView.ts`, `src/i18n.ts` (fork tree) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 **Desktop create proofs**: template toolbar click creates one row via `createBlankEntry` (`DatabaseView.ts:3528-3538, 3673-3679`); `{{date}}` / `{{title}}` still from `resolveCoreRecordTemplate` (`RecordTemplate.ts:51-57`) / `runTemplaterOnCreatedFile` (`DatabaseView.ts:3568-3573`). Zero-template click still creates (`loadNewRecordTemplate` returns `undefined` at `:3674-3675`). Missing template file: `t("template.missing")` / `t("template.loadFailed")` (`:3677, 3539-3542`); no pre-click vault read. Row-menu click with a template also creates one row (Obsidian fork — fork files: observe only) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T003 Phone: template control is icon-only (`isPhoneLayout()` at `ToolbarRenderer.ts:285-287`) with full aria-label/title. Mobile APIs: `toolbar.createEl("button")` (`:1683-1691`); `RowMenu` `setUseNativeMenu(false)` (`RowMenu.ts:45`). Two rapid clicks: overlay guard only (`DatabaseView.ts:845-850, 552-554`); no new debounce / queue / cron [S]
- [ ] T004 Grep: both hosts call `createEntry` only inside `executeNewFromTemplate` (fail if `actions.createEntry()` follows the module). Grep the diff for `fetch` / `setInterval` / webhook / mail / Slack (fail if present). Confirm `RecordTemplate.ts`, `CreateEntryPlan.ts`, `ViewConfigPanelRenderer.ts` untouched [S]
- [ ] T005 Record REQ-004 confirm as deferred in `implementation-summary.md`. Fill `checklist.md` evidence honestly. One `dataSource.createNote(...)` per click (`DatabaseView.ts:3561-3567`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] One create per click proven on both hosts
- [ ] `checklist.md` evidence filled
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Parent synthesis**: `../research/synthesis.md` edge cases
- **Parent final-plan**: `../research/final-plan.md` step 8
<!-- /ANCHOR:cross-refs -->
