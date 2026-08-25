---
title: "Implementation Plan: Percent Aggregation Pack"
description: "Plan for percentEmpty/percentFilled on row totals, RelationRollup records-path dispatch, percent modal options, and chart percent-empty / percent-not-empty consume."
trigger_phrases:
  - "percent aggregation plan"
  - "percent empty"
  - "two denominators"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/002-rollup-aggregation-pack/003-percent-aggregation-pack"
    last_updated_at: "2026-08-25T19:05:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored percent-pack child from synthesis rank 6 and final-plan step 9"
    next_safe_action: "Implement percentEmpty/percentFilled after numeric and date children"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-percent-aggregation-pack"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Percent Aggregation Pack

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
Ship percents last against `records`, not `numbers`. Zero rows → `0`. All-empty N rows → 100/0. Average stays divide-by-non-empty. Charts keep `?? 0`. No footer percent kinds.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis rank 6 and final-plan step 9 read; two-denominator trap recorded.
- [x] Child 001 specified to put percent ids on `isNumericRollupKind`.

### Definition of Done
- [ ] Percent functions on `(total, emptyCount)`.
- [ ] Dispatch from `records` before `:126`.
- [ ] Chart `:788-789` via Aggregate with `?? 0`.
- [ ] Avg tail unchanged; no footer percents.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Same leaf; add two functions on counts. Do not import aggregators.

### Key Components
- **`percentEmpty` / `percentFilled`**: `emptyCount / total × 100`; filled = complement; `total === 0` → `0`.
- **`RelationRollup.ts`**: percent branch on `records` before numeric early return.
- **`ChartAggregation.ts`**: percent-empty / percent-not-empty call Aggregate.

### Data Flow
Related row list (including empties) → emptyCount + total → Aggregate → 0–100 number → rollup cell / chart (`?? 0`). Missing target never enters this path; it uses `emptyRollupValue`.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Percent producers: `Aggregate.ts` percentEmpty/percentFilled. Consumers: `RelationRollup.ts` records path, `ChartAggregation.ts:788-789`, modal. Non-consumers this child: footer percent kinds (absent today), five clones (already covered), avg tail.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Confirm child 001 predicate includes percent ids.
- [ ] Confirm flatten `:102-109` and numeric empty return `:126` still exist.

### Phase 2: Core Implementation
- [ ] Add percent functions + tests (0 rows, all-empty, mixed).
- [ ] Records-path dispatch before `:126`.
- [ ] Modal + chart `:788-789`.

### Phase 3: Verification
- [ ] Two-denominator check vs avg.
- [ ] 0 rows vs all-empty vs missing target.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | total=0; N all-empty; mixed empty/filled | Vitest |
| Manual | Percent empty on a relation vs chart percent-empty | Obsidian fork |
| Regression | Existing avg still divides by non-empty length | Manual + existing rollup |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `001-numeric-aggregate-module` | Internal | Planned first | Need module + percent ids on the predicate |
| `002-date-aggregation-pack` | Internal | Planned before this | Ordering only; no date API required |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: All-empty relations show `null` for percentEmpty; avg denominator changes; missing target no longer `null`.
- **Procedure**: Revert percent functions, records-path branch, modal percent options, and chart percent routing. Leave numeric and date slices intact.
<!-- /ANCHOR:rollback -->
