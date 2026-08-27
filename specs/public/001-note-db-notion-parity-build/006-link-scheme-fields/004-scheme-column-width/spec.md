---
title: "Feature Specification: Scheme Column Width"
description: "Make auto-width and wrap measure scheme-hint text cells like link-mode labels so columns do not over-fit on the full assembled URL."
trigger_phrases:
  - "scheme column width"
  - "textLinkScheme width"
  - "parseTextLink label"
  - "column width link mode"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields/004-scheme-column-width"
    last_updated_at: "2026-08-25T19:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored column-width child from synthesis rank 5 and final-plan T013"
    next_safe_action: "Implement ColumnWidth scheme-hint measuring after the table same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-scheme-column-width"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Scheme Column Width

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Complete |
| **Created** | 2026-08-25 |
| **Branch** | `006-link-scheme-fields` |
| **Parent Spec** | ../spec.md |
| **Phase** | 4 of 4 |
| **Predecessor** | 003-column-menu-scheme-picker |
| **Successor** | None |
| **Handoff Criteria** | Auto-width / wrap sizes scheme-hint cells on the visible label, not the assembled href |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 4 of 4** — Parent: [`../spec.md`](../spec.md) · Predecessor: `003-column-menu-scheme-picker`. Synthesis rank 5; final-plan T013. Depends on child 001's hint field. Does not require the menu (JSON-set hints still need correct width). Last child in this phase.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion sizes on the visible value. `ColumnWidth` already measures `textRenderMode === "link"` by `parseTextLink` label, not raw text (`src/views/ColumnWidth.ts:22-26`). A scheme-hinted column still looks like a link (raw label, assembled href) but would otherwise over-fit on the full URL string if width keeps using raw cell text.

### Purpose
Treat `isTextLinkScheme(col.textLinkScheme)` cells like link-mode labels for auto-width and wrap (`ColumnWidth.ts:17-31,48,101-105`) so sizing follows the visible raw value, not the assembled `https://…` target.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- When `isTextLinkScheme(col.textLinkScheme)` is true, measure using the visible label (raw cell string), matching the link-mode `parseTextLink` label path at `:22-26`.
- Cover the auto-width / wrap call sites listed in synthesis: `:17-31,48,101-105`.
- Unhinted columns keep today's measuring (including `textRenderMode === "link"` via `parseTextLink`).

### Out of Scope
- Assemble, CellRenderer, layouts, menu (children 001–003).
- Speculative `db-text-link` CSS padding (parent: add only after a real tight hit-box).
- Changing `parseTextLink` semantics for markdown / explicit link-mode.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/ColumnWidth.ts` | Edit | Scheme-hint cells measure like link-mode labels (`:17-31,48,101-105`) |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Scheme-hint auto-width uses the visible label | A `https`-hinted column of `www.acme.com` sizes on that label, not `https://www.acme.com` |
| REQ-002 | Link-mode measuring stays | `textRenderMode === "link"` still uses `parseTextLink` label (`:22-26`) |
| REQ-003 | Unhinted plain text unchanged | Columns without `textLinkScheme` keep today's width |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Wrap path agrees with auto-width | Sites `:48` and `:101-105` use the same label rule as `:17-31` |
| REQ-005 | Display-only | Width code writes no cells and does not persist hrefs |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Auto-width of a scheme-hinted URL column matches the visible label, not the assembled href.
- **SC-002**: Link-mode and plain columns do not regress.
- **SC-003**: No CSS file and no `types.ts:50` change.

### Acceptance Scenarios

- **Given** a `https`-hinted column of short labels with long would-be hrefs, **when** auto-width runs, **then** the column is sized on the short labels.
- **Given** a `textRenderMode === "link"` column, **when** this child lands, **then** `parseTextLink` label measuring (`:22-26`) is unchanged.
- **Given** an unhinted plain text column, **when** auto-width runs, **then** behavior matches pre-change measuring.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Child `001-text-link-scheme-module` | No `isTextLinkScheme` to consult | Wait for the table same-diff |
| Risk | Measuring the assembled href | Columns over-fit on full URLs | Use the visible raw label, like link-mode |
| Risk | Missing one of `:48` / `:101-105` | Wrap disagrees with auto-width | Touch every listed call site |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked default from parent research: no speculative CSS in this child; size on the visible value. Menu (child 003) is not required — JSON-set hints still need correct width.
<!-- /ANCHOR:questions -->
