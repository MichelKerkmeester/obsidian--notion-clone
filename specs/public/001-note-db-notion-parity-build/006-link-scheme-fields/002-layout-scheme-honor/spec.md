---
title: "Feature Specification: Layout Scheme Honor"
description: "Honor textLinkScheme in Board, Gallery, List, and record-detail via the shared {label,target} helper extracted in the table child — four one-line delegations, no second timer."
trigger_phrases:
  - "layout scheme honor"
  - "board gallery list detail"
  - "textLinkScheme layouts"
  - "renderDelayedExternalLink"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields/002-layout-scheme-honor"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored layout-honor child from synthesis rank 3 and final-plan T011"
    next_safe_action: "Implement Board/Gallery/List/RecordDetail one-liners after the table same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-layout-scheme-honor"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Layout Scheme Honor

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `006-link-scheme-fields` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 4 |
| **Predecessor** | 001-text-link-scheme-module |
| **Successor** | 003-column-menu-scheme-picker |
| **Handoff Criteria** | Four layout surfaces honor the hint through the shared helper; no second 280 ms timer |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 4** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-text-link-scheme-module` · Successor: `003-column-menu-scheme-picker`. Synthesis rank 3; final-plan T011. Depends on child 001's assemble module and exported `renderDelayedExternalLink`. Synthesis `:1069` / `:372` are off-by-one vs the live fork (`BoardRenderer.ts:1070`, `RecordDetailPanel.ts:373`).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion properties click in every layout. The parent spec assumed “the existing text render path is reused by all views,” but Board, Gallery, List, and record-detail each special-case `textRenderMode === "link"` and never enter `CellRenderer`'s `default:` branch. A CellRenderer-only table slice will not match Notion on those surfaces.

### Purpose
After the shared `{label, target}` helper exists, add one-line delegations so a `textLinkScheme` hint produces the same delayed-open anchor in Board (`:1070`), Gallery (`:594`), List (`:554`), and RecordDetail (`:373`). Do not copy the 280 ms timer.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Honor `isTextLinkScheme(col.textLinkScheme)` + non-null `assembleSchemeLinkTarget` on the four layout surfaces, using the helper exported from child 001.
- Keep existing `textRenderMode === "link"` branches for unhinted link-mode.
- Same precedence as table: scheme-hint wins when assemble ≠ `null`; empty assemble ⇒ plain text, no empty `<a>`.
- Same `!isFileFieldKey` ignore if those surfaces can show file-derived keys.

### Out of Scope
- Creating `textLinkScheme.ts` or the `ColumnDef` field (child 001).
- Column-menu picker (child 003) and ColumnWidth (child 004).
- Copy / Visit, auto-detect, confirm sheet, speculative CSS.
- A second timer implementation inside any of the four files.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/BoardRenderer.ts` | Edit | Delegate at `:1070` via `{label,target}` helper |
| `src/views/GalleryRenderer.ts` | Edit | Delegate at `:594` |
| `src/views/ListRenderer.ts` | Edit | Delegate at `:554` |
| `src/views/RecordDetailPanel.ts` | Edit | Delegate at `:373` (synthesis `:372` is off-by-one) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Board honors the hint | `BoardRenderer.ts:1070` emits the same delayed-open anchor as the table path when assemble ≠ `null` |
| REQ-002 | Gallery honors the hint | `GalleryRenderer.ts:594` delegates through the shared helper |
| REQ-003 | List honors the hint | `ListRenderer.ts:554` delegates through the shared helper |
| REQ-004 | Record detail honors the hint | `RecordDetailPanel.ts:373` delegates through the shared helper |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | No second timer | All four files import the child-001 opener; grep shows one 280 ms delayed-open implementation |
| REQ-006 | Unhinted layouts unchanged | Absent / unknown hint / assemble `null` keeps today's `textRenderMode === "link"` vs plain behavior |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A `mailto`-hinted text property is clickable on Board, Gallery, List, and record-detail, not only in the table.
- **SC-002**: Unhinted text in those layouts matches pre-change rendering.
- **SC-003**: No copied 280 ms `window.setTimeout` / `window.open` block in the four files.

### Acceptance Scenarios

- **Given** a text column with `textLinkScheme: "https"` and value `www.acme.com`, **when** rendered on the Board, **then** the card shows a delayed-open external link whose href is `https://www.acme.com`.
- **Given** the same column without the hint, **when** rendered on Gallery / List / detail, **then** output matches today's text / link-mode branch.
- **Given** assemble returns `null` (`javascript:…`), **when** rendered on any of the four surfaces, **then** the value stays plain text.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child `001-text-link-scheme-module` | No assemble module or exported opener | Wait for the table same-diff |
| Risk | Copy-paste of `renderTextLink`'s timer | Four divergent openers | Import the extracted helper only |
| Risk | Off-by-one line cites | Edits miss the `textRenderMode === "link"` branch | Use final-plan lines `:1070` / `:373` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked default from parent research: table-only v1 lands first; this child is the immediate follow-on. Expand into this child only after 001 exports the helper. Do not wait on the column menu.
<!-- /ANCHOR:questions -->
