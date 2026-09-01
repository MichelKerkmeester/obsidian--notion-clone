---
title: "Implementation Plan: Table Record Peek Module"
description: "Plan for reading the live calendar RecordDetailPanel, creating src/views/TableRecordPeek.ts with distinct display-only exports, and adding panel.* i18n keys."
trigger_phrases:
  - "table record peek plan"
  - "TableRecordPeek"
  - "panel i18n"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/014-record-detail-panel/001-table-record-peek-module"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored table-record-peek module child from synthesis ranks 2-3-8 and final-plan steps 1-3"
    next_safe_action: "Read live RecordDetailPanel.ts then create TableRecordPeek.ts plus i18n keys"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-table-record-peek-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Table Record Peek Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None — display-only; no `DataSource` import |
| **Testing** | Grep of new module; fork typecheck after later children wire it |

### Overview
Final-plan steps 1–3. Isolation is "one new file + few hunks" (`EuroFormat.ts:1-42`), not a fake `src/data/` DOM module. This child is the new file plus i18n. Call sites wait for later children. CSS-docked geometry is the module's contract; CSS rules land in `002-peek-panel-css`.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 2, 3, 8 and final-plan steps 1–3 read.
- [x] Calendar export collision recorded (`RecordDetailPanel.ts:84-104`; `DatabaseView.ts:143`).
- [x] Hidden-set math locked to `ColumnConfig.ts:64, 77-101` (injected as `visibleColumns` / `allColumns`).

### Definition of Done
- [ ] Implementer can state why a second `RecordDetailPanel.ts` / `openRecordDetailPanel` is illegal.
- [ ] `TableRecordPeek.ts` exports the four distinct functions; grep shows no `DataSource` / `mutateFrontmatter` / `openNote`.
- [ ] i18n `panel.*` keys exist × three locales.
- [ ] Calendar module still compiles with original exports.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
EuroFormat isolated-module: one new view file. Unlike `EuroFormat.ts:1-42` (pure formatters), this module mounts DOM and copies calendar Esc capture — so it lives under `src/views/`, with view callbacks injected (`renderRecordIcon`, `returnFocus`).

### Key Components
- **`TableRecordPeek.ts`**: singleton state machine; affordance factory; peek mount/unmount/sync.
- **`src/i18n.ts`**: `panel.open`, `panel.noProperties`, `panel.hiddenProperties`.
- **Injected deps**: `renderRecordIcon: (parent, row, config) => host.renderRowRecordIcon(...)` — not the token-level `RecordIconRenderer.ts:18` export.

### Data Flow
Host later passes already-hydrated `RowData` + `ViewConfig` + column arrays. Module reads `row.frontmatter` / `row.computed`, stringifies with `stringifyValue` (`Stringify.ts:1`), rebuilds on each open. `syncTableRecordPeek(rows)` rebuilds the same `row.file.path` or closes. No writes.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer this child: new `src/views/TableRecordPeek.ts` plus `src/i18n.ts` keys. Consumers wait: `DatabaseView.ts` hunks in children 003–004; `styles.css` in child 002. Algorithm invariant: never import `DataSource`; never call calendar `openRecordDetailPanel`; Esc is document capture not a pushed `Scope`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `src/views/RecordDetailPanel.ts:23-218` and hosts at `DatabaseView.ts:143, 834, 864, 10418-10440, 10483-10488`.
- [ ] Confirm `CellRenderer.ts:117-129`, `ColumnConfig.ts:64, 77-101`, `HoverLinkPreview.ts:8-17`.

### Phase 2: Core Implementation
- [ ] Create `TableRecordPeek.ts` with the four exports, header/hidden groups, Esc capture, scroll dismiss.
- [ ] Add i18n `panel.*` keys × en / zh-CN / zh-TW.

### Phase 3: Verification
- [ ] Grep new file for `DataSource` / `mutateFrontmatter` / `openNote`.
- [ ] Confirm calendar module is byte-stable.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Grep | No write/navigation imports in the new module | `rg` |
| Compile | Calendar `RecordDetailPanel.ts` still typechecks | Fork typecheck (full pass in child 005) |
| Manual | Deferred to children 003–005 once wired | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `src/views/RecordDetailPanel.ts` | Internal | Exists | Collision if this child reuses names |
| `ColumnDisplay.ts:63` / `Stringify.ts:1` | Internal | Exists | Panel cannot stringify without them |
| Children 002–004 | Later | Not this child | Module can exist unwired |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Export-name collision, `DataSource` import, or calendar file edited.
- **Procedure**: Delete `src/views/TableRecordPeek.ts` and revert the `src/i18n.ts` `panel.*` keys as one unit. Do not leave a second `openRecordDetailPanel`.
<!-- /ANCHOR:rollback -->
