---
title: "Feature Specification: Peek Panel CSS"
description: "Append a delimited .note-database-container CSS block for the table record peek and hover/phone OPEN button using theme variables only. Zero toolbar selectors and zero .db-record-detail-* reuse."
trigger_phrases:
  - "peek panel css"
  - "db-record-open-btn"
  - "db-record-peek-panel"
  - "phone persistent open"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/014-record-detail-panel/002-peek-panel-css"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored peek-panel CSS child from synthesis ranks 4 and 6 and final-plan step 4"
    next_safe_action: "Append the delimited styles.css block after class names from child 001"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-peek-panel-css"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Peek Panel CSS

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `014-record-detail-panel` |
| **Parent Spec** | ../spec.md |
| **Phase** | 2 of 5 |
| **Predecessor** | 001-table-record-peek-module |
| **Successor** | 003-title-open-affordance |
| **Handoff Criteria** | One appended styles.css block; no toolbar or calendar-detail selectors |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 2 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `001-table-record-peek-module` · Successor: `003-title-open-affordance`. This child is `research/final-plan.md` step 4. Synthesis rank 4 (toolbar-safe theme CSS) plus the CSS half of rank 6 (phone persistent OPEN). Rules can be authored once class names are locked; they do not edit TypeScript.

Phone OPEN is CSS-only: `body.is-phone .note-database-container .db-record-open-btn { opacity: 1 }`. No `isPhoneLayout()` JS (`TableRenderer.ts:759-761` is the existing phone check — do not copy it into peek code).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Obsidian loads only plugin-root `styles.css` (no esbuild CSS pipeline). GoodBases had to revert a core-toolbar restyle; this phase's hard constraint is zero toolbar selectors. The calendar overlay already owns `.db-record-detail-*` at `styles.css:7543-7618`, which truncates values (`:7592-7597`) and sets `cursor: pointer` — reuse would violate "long values wrap". Hover OPEN must default to `opacity: 0` and reveal on row hover (idiom `.db-heading-row:hover .db-heading-more-button` at `styles.css:770`). Touch has no hover.

### Purpose
Append one delimited block at EOF of plugin-root `styles.css`, selectors only under `.note-database-container` (and `body.is-phone` for persistent OPEN), using documented theme variables (`styles.css:35-45` / usage `:7547-7548, 7600`). New classes only: `.db-record-open-btn`, `.db-record-peek-panel`, `.db-record-peek-field`. Dock the panel `position: absolute; top: 0; right: 0; bottom: 0; width: min(360px, 100%)` inside the container which is already `position: relative; overflow: auto` (`styles.css:63-125`). z-index 998 (below calendar 999 at `:7544` and edit popovers 1000–1002).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Append-only delimited block at EOF of plugin-root `styles.css`.
- `.db-record-open-btn` default `opacity: 0`; `tr:hover .db-record-open-btn { opacity: 1 }` (idiom `:770`); `body.is-phone .db-record-open-btn { opacity: 1 }`.
- `td.db-title-cell { position: relative }` so the button can sit on the Name cell.
- `.db-record-peek-panel` absolute right dock, `overflow-y: auto`, wrap (no `white-space: nowrap` / ellipsis), theme variables only (`--background-primary`, `--background-secondary`, `--background-modifier-border`, `--background-modifier-hover`).
- `.db-record-peek-field` wrap; no truncation.
- Zero toolbar selectors. Do not edit `.db-toolbar*` or `.db-record-detail-*`.

### Out of Scope
- TypeScript (children 001, 003, 004).
- A second runtime stylesheet or `<link>` from `main.ts` (will not load).
- `PopoverPosition` / `positionToolbarPopover` geometry.
- Restyling the core Obsidian toolbar or `patchToolbarNew`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `styles.css` (plugin root) | Edit | Append one delimited `.note-database-container` block |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | CSS is append-only and scoped | `git diff styles.css` is one appended block; selectors live under `.note-database-container` (plus `body.is-phone` for OPEN) |
| REQ-002 | Core toolbar is not restyled | Grep of the CSS diff for `toolbar` / `patchToolbarNew` is empty |
| REQ-003 | Calendar detail CSS is not reused | New classes `.db-record-peek-panel`, `.db-record-open-btn`, `.db-record-peek-field` only; no `.db-record-detail-*` added or edited (`styles.css:7543-7618` stays the calendar overlay) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Theme variables only | Colors come from `styles.css:35-45` tokens (`--background-primary`, `--background-secondary`, `--background-modifier-border`, `--background-modifier-hover`); no hard-coded colors |
| REQ-005 | Phone OPEN is CSS-only | `body.is-phone .note-database-container .db-record-open-btn { opacity: 1 }`; no `isPhoneLayout()` JS in this child |
| REQ-006 | Peek stays below calendar z-index and wraps | Panel z-index 998 (calendar 999 at `:7544`); `overflow-y: auto`; long values wrap; no ellipsis / `nowrap` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Diff audit of `styles.css` is one appended block with zero toolbar selectors and zero `.db-record-detail-*` edits.
- **SC-002**: Desktop hover can reveal OPEN (`opacity: 0` → row-hover `1`); phone forces `opacity: 1`.
- **SC-003**: Docked panel is full-width on a narrow container via `width: min(360px, 100%)`.

### Acceptance Scenarios

- **Given** the appended block, **when** toolbar selectors are searched in the diff, **then** none match.
- **Given** `body.is-phone`, **when** a table row renders, **then** `.db-record-open-btn` is visible without hover.
- **Given** a long property value, **when** the peek is styled, **then** it wraps inside the panel with no horizontal scroll.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Toolbar restyle (GoodBases trap) | Hard-constraint violation | Append-only; grep diff for `toolbar` |
| Risk | Reusing `.db-record-detail-*` | Truncation (`:7592-7597`) and `cursor: pointer` | New `.db-record-peek-*` classes |
| Risk | Second stylesheet | Obsidian will not load it | Plugin-root `styles.css` only |
| Dependency | Child `001-table-record-peek-module` class names | CSS would target the wrong classes | Names locked: `db-record-peek-panel`, `db-record-open-btn`, `db-record-peek-field` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking. Locked defaults: append to plugin-root `styles.css`; no sibling runtime CSS file; phone OPEN is CSS-only; z-index peek 998 / calendar 999.
<!-- /ANCHOR:questions -->
