---
title: "Feature Specification: Peek Display Proof"
description: "Prove the table record peek after children 001-004: fork typecheck, grep isolation, desktop hover-open, phone persistent OPEN, title vs Page Preview, hidden group, zero-property row, wrap, Mod+Enter/Esc, scroll dismiss, title-hidden fallback, calendar panel still edits."
trigger_phrases:
  - "peek display proof"
  - "record peek verify"
  - "hover open proof"
  - "nowrite peek"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel/005-peek-display-proof"
    last_updated_at: "2026-08-27T17:27:13Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored peek display-proof child from synthesis edge cases and final-plan step 8"
    next_safe_action: "Run typecheck, greps, and locked manual scenarios after children 001-004 ship"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-005-peek-display-proof"
      parent_session_id: null
    completion_pct: 86
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
<!-- SPECKIT_LEVEL: 2 -->
# Feature Specification: Peek Display Proof

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `014-record-detail-panel` |
| **Parent Spec** | ../spec.md |
| **Phase** | 5 of 5 |
| **Predecessor** | 004-peek-keyboard-open |
| **Successor** | None |
| **Handoff Criteria** | Typecheck, greps, and locked manual scenarios recorded in checklist.md |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 5 of 5** — Parent: [`../spec.md`](../spec.md) · Predecessor: `004-peek-keyboard-open`. This child owns `research/final-plan.md` step 8. No new TypeScript beyond what 001–004 already shipped. Do not "fix" proofs by editing `src/views/RecordDetailPanel.ts` or adding toolbar CSS.

Diff shape to prove: 1 new view module + i18n data + 1 appended `styles.css` block + 1 host (`DatabaseView.ts`, three hunks).
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Without the locked proofs, OPEN can look done while still navigating (title `<a>` at `CellRenderer.ts:126-129`), fighting Page Preview (`HoverLinkPreview.ts:8-17`), orphaning after `refresh()` (`DatabaseView.ts:10483-10488`), truncating via `.db-record-detail-*` (`styles.css:7592-7597`), or writing via a `DataSource` import. Calendar coexistence can regress if table OPEN was wired to `openRecordDetailPanel` (`RecordDetailPanel.ts:257-263` edits in place).

### Purpose
Run final-plan step 8: fork typecheck; grep the new module for `DataSource` / `mutateFrontmatter` / `openNote`; grep the diff for toolbar selectors and for edits to `views/RecordDetailPanel.ts`; manual desktop hover-open, phone persistent OPEN (`body.is-phone`), title click vs OPEN vs Page Preview, hidden-group reveal + empty-hidden omission, zero-property row, long wrap, Mod+Enter / Esc + focus return, inline-edit on another row, grid-scroll dismiss, title-column hidden, calendar event-card panel still edits. Record evidence in this packet.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Fork typecheck with the phase diff applied (SC-001).
- Diff/grep audit: zero toolbar selector edits; zero edits to `src/views/RecordDetailPanel.ts`; zero `.db-record-detail-*` selectors added; new module has no `DataSource` / `mutateFrontmatter` / `openNote` (SC-002 / SC-004).
- Manual desktop and phone scenarios listed in final-plan step 8 and parent SC-003.
- Checklist evidence plus honest `implementation-summary.md`.

### Out of Scope
- Implementing the module, CSS, or `DatabaseView` hunks (children 001–004).
- Board / gallery hosts; body/markdown preview; write-back (015).
- Follow-on-scroll; Obsidian `Modal`; a pushed `Scope`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| This child's `checklist.md` / `implementation-summary.md` | Modify | Evidence rows for proofs |
| Fork TypeScript / `styles.css` | Do not change | Prove the prior children's diff; do not add a fourth hunk |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Fork typecheck passes | Phase diff applied; typecheck green (SC-001) |
| REQ-002 | Diff shape and isolation hold | 1 new view module + i18n + 1 appended `styles.css` block + 1 host with three hunks; grep new module empty for `DataSource` / `mutateFrontmatter` / `openNote`; zero toolbar / `.db-record-detail-*` / `RecordDetailPanel.ts` edits |
| REQ-003 | Desktop hover-open works without navigation | OPEN on Name cell opens the CSS-docked peek; title `<a>` click still opens the note (`CellRenderer.ts:126-129`); Page Preview still only on the `<a>` (`HoverLinkPreview.ts:8-17`) |
| REQ-004 | Panel is display-only | No writes; hidden-group toggle is in-memory CSS; rollups stay display-only (`types.ts:69-70`) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Edge and keyboard proofs pass | Phone CSS persistent OPEN; title-hidden fallback; zero-property `t("panel.noProperties")`; long wrap; Mod+Enter / Esc + focus return (`:4197`); inline-edit on another row; scroll dismiss; zh locales have no raw English |
| REQ-006 | Calendar coexistence holds | Event-card panel still edits in place (`RecordDetailPanel.ts:257-263`); peek z-index 998 vs calendar 999 (`styles.css:7544`) |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Typecheck green.
- **SC-002**: Diff/grep audit matches the locked shape.
- **SC-003**: Manual desktop/phone list from final-plan step 8 recorded as pass in `checklist.md`.
- **SC-004**: No writes from the peek module.

### Acceptance Scenarios

- **Given** the phase diff, **when** typecheck and greps run, **then** SC-001/SC-002/SC-004 pass.
- **Given** a table row, **when** OPEN is used, **then** the peek opens and the title `<a>` still navigates.
- **Given** `body.is-phone`, **when** a row renders, **then** OPEN is visible without hover.
- **Given** the peek is open, **when** the container scrolls or the view refreshes, **then** the panel dismisses or rebuilds — no orphan DOM.
- **Given** a calendar event card, **when** its detail panel opens, **then** it still edits in place.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Children 001–004 | Nothing to prove | Do not start until hunks exist |
| Risk | Treating an unstyled or navigating OPEN as a pass | False complete | REQ-003 checks title click and Page Preview |
| Risk | Patching the calendar panel to make proofs pass | Ships 015 write-back | REQ-002 forbids `RecordDetailPanel.ts` edits |
| Risk | Skipping refresh/scroll proofs | Orphan peek in production | REQ-005 includes scroll dismiss and refresh |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Full rebuild on each open is cheap because there are no writes; CSS is scoped under `.note-database-container`.

### Security
- **NFR-S01**: No secrets or telemetry in the panel or CSS.
- **NFR-S02**: No new evaluation paths; existing `stringifyValue` (`Stringify.ts:1`) is reused.

### Reliability
- **NFR-R01**: Module imports nothing from `DataSource` (write surface `mutateFrontmatter` `:288` and siblings).
- **NFR-R02**: Diff stays the locked EuroFormat shape.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Title column hidden: attach on `getVisibleColumns(...)[0]` (`CellRenderer.ts:117-118`).
- Zero properties: muted `t("panel.noProperties")`.
- Empty hidden values omitted; reveal control hidden when the hidden list is empty.
- Long values wrap; no `.db-record-detail-*` truncation (`styles.css:7592-7597`).

### Error Scenarios
- OPEN vs title click vs Page Preview: sibling button, no hover-link attr, stop the click.
- Keyboard: Mod+Enter opens; bare Enter edits (`DatabaseView.ts:1523-1526`).

### Concurrent Operations
- Inline-edit on another row while peek is open: both stay functional; keyed to `row.file.path`.
- Grid scroll: dismiss (default).
- Re-render / view switch: `syncTableRecordPeek` / `closeActiveOverlays` (`:864`, `:10483-10488`).
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 6/25 | Proofs only; no new production surface |
| Risk | 8/25 | Navigation, Page Preview, stale DOM, calendar coexistence |
| Research | 6/20 | Locked by `research/final-plan.md` step 8 |
| **Total** | **20/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Follow-on-scroll, Modal, and body preview stay out. Calendar panel must still edit after these proofs.
<!-- /ANCHOR:questions -->
