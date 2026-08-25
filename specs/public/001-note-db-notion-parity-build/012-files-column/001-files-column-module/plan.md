---
title: "Implementation Plan: Files Column Module"
description: "EuroFormat plan for FilesColumn.ts: normalize vault wikilink string[], edit serialize, resolve, classify, FILE_CHIP_CAP, and renderChips with no CellRenderer import."
trigger_phrases:
  - "files column module plan"
  - "filescolumn isolation"
  - "renderchips plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/012-files-column/001-files-column-module"
    last_updated_at: "2026-08-25T21:20:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored FilesColumn module child from synthesis ranks 1,6,7,11 and final-plan step 2"
    next_safe_action: "Create src/data/FilesColumn.ts on the EuroFormat isolation rule"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-files-column-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Files Column Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | Vault-local wikilink `string[]` (no Notion CDN) |
| **Testing** | Scratch vault cases; grep for `fetch`/`cdn`/`adapter.exists` |

### Overview
Land one EuroFormat-shaped leaf so later children can register and dispatch `"files"` without inventing a second chip renderer or a second cover parser. Cap, unresolved chips, classify, and optional thumbnails ship in this file.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1, 6, 7, 11 and final-plan step 2 read; T012/T013 are module internals.
- [x] Locked: do not edit `FileFieldRenderer.ts`; do not widen HEIC/TIFF/ICO; no `adapter.exists`.
- [x] Cover helper without a call site is deferred to child 004.

### Definition of Done
- [ ] `src/data/FilesColumn.ts` exports normalize, edit serialize, resolve, classify, `FILE_CHIP_CAP`, `renderChips`.
- [ ] Grep is clean for `fetch` / `cdn` / `adapter.exists` / `electron` / `fs`.
- [ ] `FileFieldRenderer.ts` / `FileFields.ts` / `CoverImage.ts` unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module + later rebase-safe call sites (EuroFormat: `src/data/EuroFormat.ts:1-42`). This child is the module only.

### Key Components
- **`normalize`**: array + trim + drop URLs + parse + dedupe-by-target.
- **`formatForEdit` / `parseEdit`**: text of wikilinks for child 003's `editText` path.
- **`renderChips`**: cap 5 + `+N`, unresolved class, `openLinkText` or no-op.

### Data Flow
Callers pass a cell value. Normalize produces `string[]` of vault wikilinks. Resolve uses `getFirstLinkpathDest` (`CoverImage.ts:24`). Render paints chips; it does not write frontmatter (child 003 owns the save gate).
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: new `FilesColumn.ts`. Consumers wait for later children (`ColumnTypes.ts`, `CellRenderer.ts`, cover `renderCover` sites). Algorithm invariant: never throw on malformed wikilinks; never `fetch`; never probe disk with `adapter.exists`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `EuroFormat.ts:1-42`, `FileFieldRenderer.ts:73,111-122,124-141`, `CoverImage.ts:13-16,24`.
- [ ] Confirm live tree is `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`.

### Phase 2: Core Implementation
- [ ] Create `FilesColumn.ts` with normalize, edit serialize, resolve, classify, cap, `renderChips`.
- [ ] Optional thumbnails only if they stay in-module with existing chip CSS.

### Phase 3: Verification
- [ ] Scratch cases: `[]`, one PDF, URL dropped, duplicates, dangling dest, 50+ tooltip.
- [ ] Grep the module; confirm `FileFieldRenderer.ts` clean.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Scratch note cases listed in SC-002 | Obsidian vault note |
| Integration | None this child — no CellRenderer wire | — |
| Manual | Grep; confirm chips API is callable | Editor + grep |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot cite or create the module |
| `CoverImage.ts:13-16,24` (read-only) | Internal | Green | `isImageTarget` and dest lookup |
| Children 002–004 | Internal | Later | This module must not import CellRenderer |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Module imports CellRenderer, calls `renderFileLinkList`, or contains `fetch`/`adapter.exists`.
- **Procedure**: Delete `src/data/FilesColumn.ts`. Stored values are still plain `string[]` with no migration.
<!-- /ANCHOR:rollback -->
