---
title: "Implementation Plan: Scheme Column Width"
description: "Plan for ColumnWidth to measure scheme-hint text cells like link-mode labels."
trigger_phrases:
  - "scheme column width plan"
  - "parseTextLink label"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/006-link-scheme-fields/004-scheme-column-width"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Scheme Column Width

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None — measuring only |
| **Testing** | Manual auto-width on a hinted URL column vs an unhinted column |

### Overview
One-file edit. Extend the existing `textRenderMode === "link"` label-measure path (`ColumnWidth.ts:22-26`) so `isTextLinkScheme` columns also size on the visible raw value. Touch wrap sites `:48` and `:101-105` so they agree.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 5 and final-plan T013 read.
- [x] Child 001 must export `isTextLinkScheme`.

### Definition of Done
- [ ] Scheme-hint auto-width / wrap use the visible label.
- [ ] Link-mode `parseTextLink` path unchanged.
- [ ] Unhinted plain columns unchanged; no CSS file.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Same measurer, extra predicate. Do not assemble hrefs inside `ColumnWidth`.

### Key Components
- **`ColumnWidth.ts`**: auto-width `:17-31`, wrap `:48`, remaining sites `:101-105`.
- **`isTextLinkScheme`**: imported from `textLinkScheme.ts` (child 001).

### Data Flow
Width reads the raw cell (or `parseTextLink` label for link-mode). It never calls `assembleSchemeLinkTarget` for measurement. Rendered hrefs stay a renderer concern.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Single consumer: `ColumnWidth.ts:17-31,48,101-105`. Do not retouch CellRenderer, layouts, or the menu.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Read `ColumnWidth.ts:17-31,48,101-105` and the link-mode label path `:22-26`.
- [ ] Confirm `isTextLinkScheme` is importable from child 001.

### Phase 2: Core Implementation
- [ ] Treat scheme-hint columns like link-mode labels for auto-width.
- [ ] Apply the same rule at wrap sites `:48` and `:101-105`.

### Phase 3: Verification
- [ ] Auto-width a hinted URL column vs an unhinted column and a link-mode column.
- [ ] `npm run build`; `npm run lint`; no CSS / no union change.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None required | — |
| Integration | Not this child | — |
| Manual | Hinted URL column auto-width vs unhinted and link-mode | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Child `001-text-link-scheme-module` | Internal | Required | No `isTextLinkScheme` |
| Child `003-column-menu-scheme-picker` | Internal | Not required | JSON-set hints still need width |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Link-mode width regresses; scheme columns still over-fit on hrefs; CSS file appears.
- **Procedure**: Revert `ColumnWidth.ts` only.
<!-- /ANCHOR:rollback -->
