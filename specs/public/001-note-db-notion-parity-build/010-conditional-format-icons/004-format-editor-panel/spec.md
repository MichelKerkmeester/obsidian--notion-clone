---
title: "Feature Specification: Format Editor Panel"
description: "CF-scoped group chrome in renderConditionalFormatting, existing field/op/value leaves, icon picker, bold toggle, and three i18n keys. Do not copy renderSourceRuleLeaf."
trigger_phrases:
  - "format editor panel"
  - "renderconditionalformatting"
  - "cf group chrome"
  - "icon picker bold"
  - "conditionalformat.icon"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/010-conditional-format-icons/004-format-editor-panel"
    last_updated_at: "2026-08-25T21:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored format-editor-panel child from synthesis rank 3 and final-plan step 7"
    next_safe_action: "Add CF group chrome, icon picker, and bold toggle in ViewConfigPanelRenderer"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-format-editor-panel"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Format Editor Panel

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `010-conditional-format-icons` |
| **Parent Spec** | ../spec.md |
| **Phase** | 4 of 5 |
| **Predecessor** | 003-tree-aware-column-ops |
| **Successor** | 005-format-display-proof |
| **Handoff Criteria** | AND/OR group plus icon plus bold save and reload; no add-expression; no Chart UI |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 4 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `003-tree-aware-column-ops` · Successor: `005-format-display-proof`. Synthesis rank 3; final-plan step 7. Effort M. Copy **group chrome** from `renderSourceRuleGroup` (`ViewConfigPanelRenderer.ts:878-929`) only; do **not** copy `renderSourceRuleLeaf` (`:931+`).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
`renderConditionalFormatting` (`ViewConfigPanelRenderer.ts:552-766`) is one field/op/value row per rule. Users cannot author AND/OR groups, pick a RecordIcon, or toggle bold. Copying `renderSourceRuleLeaf` would leak source operators (`inFolder` / `strictEq` / `expression`) into CF.

### Purpose
Replace the single trio with CF-scoped group chrome (positional splice, no node ids), keep the existing field/op/value leaf plus `getFilterOperatorsForColumn` (`:593`), add wrap-into-group / delete-last-child-deletes-group, icon via `openIconPickerPopover` (`IconPickerPopover.ts:11-23`), bold as `db-icon-only-button` + `setIcon(..., "bold")`, and three i18n keys × three locales.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `renderConditionalFormatting` (`552-766`): group chrome copied from `renderSourceRuleGroup` (`878-929`); leaves stay the current trio; wrap-into-group writes `conditionTree` the first time and keeps `condition` as the first leaf (open Q7: no write-back of eval-time wraps).
- Wrap-into-group / delete-last-child-deletes-group (Anytype `group.tsx:66-110`; synthesis F3.3 / F4.2).
- Icon: `openIconPickerPopover` (`IconPickerPopover.ts:23`); RecordIcon token only; reject vault paths.
- Bold: `db-icon-only-button` + `setIcon(..., "bold")`.
- i18n: `conditionalFormat.icon` / `bold` / `group` × 3 locales; reuse `panel.and` / `panel.or` / `panel.addCondition` (`i18n.ts` ~379-385).
- Persist via existing `actions.onChange(t("undo.conditionalFormatConfig"))` (`601-604`).
- No add-expression. No Chart UI.

### Out of Scope
- Match/paint/CSS (child 001). Parse (child 002). Column ops (child 003). Tests (child 005).
- Icon catalog. Copying `renderSourceRuleLeaf`. Depth cap (009's only; CF adds none).
- Writing eval-time wraps onto legacy rules that the user never grouped.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/ViewConfigPanelRenderer.ts` | Edit | `renderConditionalFormatting` `552-766`: groups + icon + bold |
| `src/i18n.ts` | Edit | 3 keys × 3 locales; reuse panel and/or/addCondition |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Group chrome without source-leaf copy | Copy `renderSourceRuleGroup` `878-929` only; leaves stay field/op/value + `getFilterOperatorsForColumn` (`:593`); grep: no `inFolder` / `hasProperty` / `strictEq` / source `expression` in the CF editor |
| REQ-002 | Dual-write on first group | First wrap/add-group writes `conditionTree` and keeps `condition` as the first leaf; persist via `actions.onChange(t("undo.conditionalFormatConfig"))` (`601-604`) |
| REQ-003 | Icon and bold controls | Icon via `openIconPickerPopover` (`IconPickerPopover.ts:23`); bold toggle with `setIcon(..., "bold")`; values save and reload |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | i18n keys | `conditionalFormat.icon` / `bold` / `group` in 3 locales; reuse `panel.and` / `panel.or` / `panel.addCondition` (`i18n.ts` ~379-385) |
| REQ-005 | No Chart CF UI and no add-expression | Chart stays unmatched; no expression leaf control in CF |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: AND/OR group plus icon plus bold save and reload.
- **SC-002**: Wrap-into-group is the create-group gesture; eval-time wraps are not written for untouched legacy rules.
- **SC-003**: Source operators do not appear in the CF editor.

### Acceptance Scenarios

- **Given** a color-only rule, **when** the user wraps it into a group and adds an OR sibling, **then** `conditionTree` is written and `condition` stays the first leaf.
- **Given** the icon picker, **when** the user picks an emoji or `lucide:<id>@<color>`, **then** that RecordIcon token persists (`RecordIcon.ts:27-38`).
- **Given** the bold toggle, **when** saved and reloaded, **then** `bold: true` is still set.
- **Given** the CF editor, **when** inspected, **then** there is no add-expression control and no Chart CF UI.
- **Given** a legacy rule the user never grouped, **when** the editor saves, **then** no eval-time wrap is written (open Q7).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child 001 types + child 002 parse | Groups would not reload | Editor after parse |
| Risk | Copying `renderSourceRuleLeaf` | Source ops leak; unknown ops can match every row | REQ-001 grep |
| Risk | Writing eval-time wraps | Legacy JSON churn (NFR-R01) | Write `conditionTree` only after the user adds a group |
| Risk | New save API | Extra vault churn | Reuse `actions.onChange` (`601-604`) |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: RecordIcon token; reuse `openIconPickerPopover`; no Chart UI; no icon catalog.
<!-- /ANCHOR:questions -->
