---
title: "Implementation Plan: Title Open Affordance"
description: "Same-diff plan for DatabaseView.renderCell OPEN attach (including title-hidden fallback) plus overlay lifecycle so refresh cannot orphan the peek."
trigger_phrases:
  - "title open affordance plan"
  - "renderCell open"
  - "syncTableRecordPeek"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel/003-title-open-affordance"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored title-open affordance child from synthesis ranks 1 and 5 and final-plan steps 5 and 7"
    next_safe_action: "Add DatabaseView renderCell attach plus overlay lifecycle hunks"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-title-open-affordance"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Title Open Affordance

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | `DatabaseView` host; table-only `renderCell` wired at `DatabaseView.ts:586` (`TableRenderer.ts:502` invokes `this.actions.renderCell(...)`) |
| **Storage** | None — display-only peek |
| **Testing** | Manual hover/title-click/Page Preview; refresh orphan check |

### Overview
Final-plan steps 5 and 7. One host file, two hunks in this child (keyboard hunk B is child 004). Count still fits the EuroFormat budget of three `DatabaseView` hunks for the whole phase.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1 and 5 plus final-plan steps 5 and 7 read; stale-DOM coupling confirmed.
- [x] Insertion point locked: not `setupRowInteractions`.
- [x] Children 001–002 specify module + CSS.

### Definition of Done
- [ ] OPEN appears on Name cell or first visible `td` when title is hidden.
- [ ] Title `<a>` click and Page Preview unchanged.
- [ ] `refresh()` / `closeActiveOverlays` cannot leave an orphan peek.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Rebase-safe host hunks. Affordance factory already lives in `TableRecordPeek.ts`; this child only calls it.

### Key Components
- **`renderCell`**: compute `getVisibleColumns` (`ColumnConfig.ts:77`); attach.
- **Overlay lifecycle**: selector + close + sync, parallel to calendar panel at `:834, :864, :10483-10488`.

### Data Flow
`TableRenderer.renderRow` → `renderCell` paints `db-title-cell` (`CellRenderer.ts:117-118`) → attach OPEN → click opens peek keyed to `row.file.path`. On `refresh()`, `syncTableRecordPeek(this.rows)` rebuilds that path or closes.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Consumer: `DatabaseView.ts` only. Do not edit `CellRenderer.ts` or `RecordDetailPanel.ts`. Algorithm invariant: OPEN never navigates; refresh never orphans.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 exports and child 002 classes exist.

### Phase 2: Core Implementation
- [ ] Hunk A `renderCell` attach + title-hidden fallback.
- [ ] Hunk C overlay selector / close / refresh sync.

### Phase 3: Verification
- [ ] Hover OPEN; title click still navigates; refresh leaves no orphan.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual | Hover OPEN vs title click vs Page Preview | Obsidian fork |
| Manual | Title column hidden | Hide `file.name` |
| Manual | Refresh / view switch | No orphan `.db-record-peek-panel` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-table-record-peek-module` | Child predecessor | Required | Nothing to call |
| `002-peek-panel-css` | Child predecessor | Required | OPEN/panel would be unstyled |
| `ColumnConfig.ts:64, 77-101` | Internal | Exists | Visible/hidden arrays |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: OPEN navigates, Page Preview breaks, or refresh orphans the peek.
- **Procedure**: Revert the `DatabaseView.ts` hunks (import, `renderCell`, overlay selector, `closeActiveOverlays`, `refresh`) as one unit. Leave `TableRecordPeek.ts` and `styles.css` in place if they are clean.
<!-- /ANCHOR:rollback -->
