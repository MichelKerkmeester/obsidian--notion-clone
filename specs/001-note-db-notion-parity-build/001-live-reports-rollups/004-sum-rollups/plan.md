---
title: "Implementation Plan: Sum Rollups"
description: "Gated vault YAML plan to bind SUM to ops-confirmed amount keys after COUNT plus list/file.name proved resolution."
trigger_phrases:
  - "sum rollups plan"
  - "ops keys gate"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/001-live-reports-rollups/004-sum-rollups"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored SUM child from synthesis rank 2 remainder and final-plan step 8"
    next_safe_action: "Halt for ops amount keys; do not bind SUM while UNKNOWN"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-sum-rollups"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Sum Rollups

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Obsidian vault markdown `database:` YAML |
| **Framework** | Existing `sum` kind (`types.ts:44`; `RelationRollup.ts:123-128`) |
| **Storage** | Reports `db_view` |
| **Testing** | On-screen SUM vs manual sum of child 003 `list` |

### Overview
Bind SUM only after ops keys exist and COUNT/`list` proved resolution. Empty numeric set → `null`, not `0` (`RelationRollup.ts:126,159-160`). Zero new `src/` files.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Final-plan step 8 read; SUM split from COUNT confirmed.
- [ ] Child 003 COUNT matches `list`/`file.name`.
- [ ] Ops keys written, or UNKNOWN halt accepted.

### Definition of Done
- [ ] SUM bound to confirmed keys, or unbound with UNKNOWN recorded.
- [ ] On-screen SUM matches manual sum of list children when bound.
- [ ] Diagnostic lists still present.
- [ ] Fork `src/` unchanged.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Configure existing `sum`. Do not add kinds. Do not use table-footer SUM as the monthly figure.

### Key Components
- **SUM column defs** on Reports against ops-confirmed keys.
- **Silent-empty detector**: COUNT > 0 and SUM empty → wrong key.

### Data Flow
`aggregateRollup` sum/avg → `toChartNumber` (strict `Number()`, no wikilink digit scrape) then sum (`RelationRollup.ts:123-128`). Cells read `row.computed[col.key]` (`CellRenderer.ts:656`).
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: Reports SUM column defs. Consumers: existing rollup engine and CellRenderer. Invariant: never invent a fallback amount field.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm ops keys or record UNKNOWN.
- [ ] Confirm child 003 resolution proof.

### Phase 2: Core Implementation
- [ ] Bind SUM if keys exist; otherwise stop.

### Phase 3: Verification
- [ ] Manual SUM vs on-screen vs `list` children.
- [ ] If COUNT > 0 and SUM empty, fix the key.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None | — |
| Integration | None | — |
| Manual | SUM vs list inventory; empty SUM not read as `0` | Obsidian Reports view |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Ops amount keys | External | UNKNOWN | SUM stays unbound |
| Child 003 COUNT/`list` | Internal | Predecessor | Cannot distinguish empty SUM from unwired relation |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Wrong key, unknown kind id, or fork dirt.
- **Procedure**: Remove SUM column defs from Reports YAML. Keep COUNT/`list`. Do not patch `RelationRollup.ts`.
<!-- /ANCHOR:rollback -->
