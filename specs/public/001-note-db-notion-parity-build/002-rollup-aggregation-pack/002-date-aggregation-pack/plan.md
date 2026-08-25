---
title: "Implementation Plan: Date Aggregation Pack"
description: "Plan for earliest/latest on Aggregate.ts, RelationRollup date dispatch before the numeric empty return, date display-type mapping, date modal filter, and footer EARLIEST/LATEST consume."
trigger_phrases:
  - "date aggregation plan"
  - "earliest latest"
  - "dateKey"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/002-rollup-aggregation-pack/002-date-aggregation-pack"
    last_updated_at: "2026-08-25T19:05:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored date-pack child from synthesis rank 5 and final-plan step 8"
    next_safe_action: "Implement earliest/latest after the numeric same-diff child"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-date-aggregation-pack"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Date Aggregation Pack

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork `Obsidian Plugin/src` |
| **Storage** | Display-only |
| **Testing** | Extend `Aggregate.test.ts`; `npx vitest run` |

### Overview
Extend the numeric child's `Aggregate.ts` with `earliest`/`latest` on timestamps. Call sites coerce with `toDateTimestamp` (`DateTimeFormat.ts:203-214`). Display mapping is a separate edit from `isNumericRollupKind`. Footer keeps dateKey formatting and date-ms RANGE.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Numeric child specified; this child depends on its module.
- [x] Final-plan step 8 and synthesis rank 5 read.
- [x] Display-type landmine (`String(Date)`) recorded.

### Definition of Done
- [ ] `earliest`/`latest` return `Date | null`.
- [ ] Dispatch before `numbers.length === 0`.
- [ ] `earliest|latest` → `"date"` in ColumnDisplay and RowPipeline.
- [ ] Footer EARLIEST/LATEST via Aggregate; dateKey `:552` kept.
- [ ] Modal date filter via `isDateLikeColumnType`.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Same EuroFormat leaf; add two functions. Coercion stays at call sites.

### Key Components
- **`Aggregate.earliest` / `latest`**: min/max timestamps → `Date | null`.
- **`RelationRollup.ts`**: date extract parallel to `:123-128`, **before** `:126`.
- **Display map**: `getColumnDisplayType` / `withComputedResultTypes` → `"date"`.

### Data Flow
Related cells → `toDateTimestamp` → timestamp array → Aggregate → `Date | null` → `parseDateTimeParts(...)?.dateKey` at the footer formatter; cells go through `renderDate`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Date producers: `Aggregate.ts` earliest/latest. Consumers: `RelationRollup.ts`, `SummaryRenderer.ts` EARLIEST/LATEST, `ColumnDisplay.ts`, `RowPipeline.ts`, `RelationRollupConfigModal.ts`. Numeric predicate must not gain date ids. Footer RANGE date-ms path is unchanged, not a consumer of Aggregate `range()`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm `Aggregate.ts` exists from child 001.
- [ ] Confirm `toDateTimestamp` at `DateTimeFormat.ts:203-214` and footer dateKey at `:552`.

### Phase 2: Core Implementation
- [ ] Add `earliest`/`latest` + tests.
- [ ] RelationRollup date dispatch before `:126`.
- [ ] Display-type map + modal date options + footer consume.

### Phase 3: Verification
- [ ] Scenario 2 dateKey match.
- [ ] Cells use `renderDate`; footer date RANGE still `Nd`.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | earliest/latest empty / single / mixed invalid timestamps | Vitest |
| Manual | Earliest on a date relation vs footer dateKey | Obsidian fork |
| Regression | Footer date RANGE `Nd` still works | Manual |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-numeric-aggregate-module` | Internal | Planned first | No module to extend |
| `DateTimeFormat.ts:203-214` | Internal | Exists | Date extract cannot skip `Date.parse` |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Date cells show `String(Date)`; numeric empty path swallows date kinds; footer date RANGE breaks.
- **Procedure**: Revert date functions, RelationRollup date branch, display-type map, modal date options, and footer EARLIEST/LATEST routing together. Leave numeric slice intact.
<!-- /ANCHOR:rollback -->
