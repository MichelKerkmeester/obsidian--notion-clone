---
title: "Implementation Plan: Embedded Table Grouping"
description: "Reuse MultiFieldGrouping on the embed table branch and copy groupByFields beside groupByField so settings save cannot strip it."
trigger_phrases:
  - "embedded table grouping plan"
  - "groupbyfields copy-back"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/011-table-multi-group/003-embedded-table-grouping"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored embedded grouping child from synthesis and final-plan"
    next_safe_action: "Wire EmbeddedDatabaseRenderer grouped dispatch and copy-back"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-embedded-table-grouping"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Embedded Table Grouping

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | Same view-config YAML; copy-back must not drop `groupByFields` |
| **Testing** | Manual embedded 2-field table vs top-level; save then reload |

### Overview
One file, two edits: grouped table dispatch at `EmbeddedDatabaseRenderer.ts:1012-1016` and copy-back beside `:3353`. Gallery/list and timeline stay on the existing one-field branches.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Children 001 and 002 shipped (module + flatten loop).
- [x] Locked: parse is still the load path; `Object.assign` `:3364-3365` is not a substitute.

### Definition of Done
- [ ] Embed table 2-field nest matches top-level.
- [ ] Embed settings save keeps `groupByFields`.
- [ ] Gallery/list/timeline embed branches unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Additive sibling of the settings site. Reuse `MultiFieldGrouping.ts`; do not fork a second flatten.

### Key Components
- **Grouped table branch `:1012-1016`**: same `effectiveGroupFields` + tree + flatten as `DatabaseView.ts:9539-9545`.
- **Copy-back `:3353`**: `origView.groupByFields = this.config.groupByFields`.

### Data Flow
Embed config (parsed) → table grouped branch → flatten loop already in `TableRenderer` from child 002. Save copies own keys including `groupByFields`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Consumer: `EmbeddedDatabaseRenderer.ts` table branch + copy-back. Producers stay in children 001–002. Algorithm invariant: do not change gallery/list `:973-986` or timeline `:1005-1007`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 002 flatten loop is live.
- [ ] Re-read `:1012-1016`, `:3353`, `:3364-3365`.

### Phase 2: Core Implementation
- [ ] Table grouped branch uses the same helpers as DatabaseView.
- [ ] Copy-back sibling at `:3353`.

### Phase 3: Verification
- [ ] Embedded 2-field matches top-level; save does not strip; gallery/list unchanged.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Manual | Embedded 2-field table vs top-level | Obsidian fork |
| Persist | Embed settings save then reload | YAML inspect |
| Negative | Embedded gallery still one-field | Same config blob |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-multifield-grouping-module` | Child predecessor | Required | No helpers / persist |
| `002-grouped-table-flatten` | Child predecessor | Required | No depth-aware loop |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Embed save strips `groupByFields`; gallery embed starts nesting; embed table diverges from top-level.
- **Procedure**: Revert the two `EmbeddedDatabaseRenderer.ts` edits. Leave module and top-level loop in place.
<!-- /ANCHOR:rollback -->
