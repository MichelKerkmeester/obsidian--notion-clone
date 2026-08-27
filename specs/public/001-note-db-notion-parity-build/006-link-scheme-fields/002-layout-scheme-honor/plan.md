---
title: "Implementation Plan: Layout Scheme Honor"
description: "Plan for Board, Gallery, List, and record-detail to honor textLinkScheme through the shared delayed-open helper."
trigger_phrases:
  - "layout scheme honor plan"
  - "board gallery list detail"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Layout Scheme Honor

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None — display-only; reuses the `ColumnDef` hint from child 001 |
| **Testing** | Manual layout click-through; reuse child-001 vitest (no new assemble cases) |

### Overview
Four rebase-safe call-site edits. Each layout's `textRenderMode === "link"` branch also consults `textLinkScheme` and, when assemble ≠ `null`, calls the helper exported from `CellRenderer.ts`. No new module. No second timer.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 3 and final-plan T011 read; line-number corrections (`:1070`, `:373`) recorded.
- [x] Child 001 must export `renderDelayedExternalLink` before this diff starts.

### Definition of Done
- [ ] Board, Gallery, List, and record-detail honor the hint.
- [ ] Grep shows no copied 280 ms delayed-open block in those four files.
- [ ] Unhinted layouts unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
One-line delegation onto an existing helper (EuroFormat call-site budget, four files because reuse of `CellRenderer` `default:` is false).

### Key Components
- **Shared helper** (from child 001): `{ label, target }` delayed-open.
- **Four layout renderers**: insert scheme consult next to the existing link-mode special case.

### Data Flow
Same assemble function as the table. Layouts pass raw cell as label and assembled href as target. Null assemble falls through to today's branch.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Consumers: `BoardRenderer.ts:1070`, `GalleryRenderer.ts:594`, `ListRenderer.ts:554`, `RecordDetailPanel.ts:373`. Producer stays `textLinkScheme.ts` from child 001. Do not retouch `types.ts:50`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 helper is exported and assemble is importable.
- [ ] Re-read the four live link-mode branches (final-plan line numbers).

### Phase 2: Core Implementation
- [ ] Board `:1070` delegation.
- [ ] Gallery `:594`, List `:554`, RecordDetail `:373` delegations.

### Phase 3: Verification
- [ ] Click a hinted property in each layout.
- [ ] Confirm unhinted / assemble-null paths unchanged; one timer implementation only.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None new — assemble already covered in child 001 | — |
| Integration | Not this child | — |
| Manual | Hinted vs unhinted property on Board, Gallery, List, record-detail | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child `001-text-link-scheme-module` | Internal | Required | No helper / no hint field |
| Child 003 menu | Internal | Not required | Layouts can use schema JSON |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Layouts open `javascript:`; unhinted cards change; a second timer appears.
- **Procedure**: Revert the four renderer edits. Leave child 001 in place.
<!-- /ANCHOR:rollback -->
