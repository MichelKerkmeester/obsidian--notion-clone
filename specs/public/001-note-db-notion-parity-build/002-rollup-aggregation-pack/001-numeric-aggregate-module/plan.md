---
title: "Implementation Plan: Numeric Aggregate Module"
description: "Same-diff plan for Aggregate.ts numeric functions, Vitest harness, type widening, RelationRollup numeric dispatch, shared isNumericRollupKind, numeric modal options, and footer/chart numeric consume."
trigger_phrases:
  - "numeric aggregate plan"
  - "aggregate module"
  - "same-diff numeric"
  - "isNumericRollupKind"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/002-rollup-aggregation-pack/001-numeric-aggregate-module"
    last_updated_at: "2026-08-25T19:05:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored numeric same-diff child from synthesis and final-plan"
    next_safe_action: "Implement Aggregate.ts numeric functions plus the same-diff call sites"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-numeric-aggregate-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Numeric Aggregate Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None — display-only; `ComputedSync.ts:3` is already `"display-only"` |
| **Testing** | Vitest (`vitest.config.ts:1-11`); harness directory missing today |

### Overview
Land one EuroFormat-shaped leaf plus the numeric seams in a single shippable diff so Median cannot type as `"text"` or sit unused in the kind union. `Aggregate.ts` takes coerced `readonly number[]` and must not import the three aggregators. Range is scalar `max − min`. Footer date-ms RANGE stays local.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1–4 and 7 plus final-plan steps 1–7 read; same-diff coupling confirmed.
- [x] Locked numeric semantics: empty → `null`; even median = mean of two middle; never null→0.
- [x] Cycle rule locked: no `ChartAggregation` import from `Aggregate.ts`.

### Definition of Done
- [ ] `Aggregate.ts` exports numeric functions + `isNumericRollupKind` (percent ids in, dates out).
- [ ] `npx vitest run` green on `Aggregate.test.ts`.
- [ ] `aggregateRollup` dispatches min/max/median/range before a sum-only tail.
- [ ] Five clones use the predicate; modal lists numeric kinds; footer/chart numeric consume Aggregate.
- [ ] Rollup-of-rollup `:101` byte-stable; `count`/`list`/sum/avg unchanged; date-ms RANGE fallback kept.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module + rebase-safe call sites (EuroFormat: `src/data/EuroFormat.ts:1-9`). Module-level pure functions, not a class (AppFlowy `CalculationsService` match-dispatch is the idea, not a class to copy).

### Key Components
- **`Aggregate.ts`**: `min`/`max`/`median`/`range(numbers: readonly number[])`; `isNumericRollupKind`.
- **`RelationRollup.ts`**: after flatten `:102-109` and `toChartNumber` `:123-125`, switch new numeric kinds; tail `:128` is sum only.
- **Eligibility + modal + footer/chart**: one-line supporting edits in the same diff.

### Data Flow
Call sites extract numbers via `toChartNumber` (`ChartAggregation.ts:191-197`). Aggregate returns raw `number | null`. Footer maps `null` → `""`; charts map `null` → `0`; rollup cells stay empty text. `buildRelationRollups` remains an in-memory map (`RelationRollup.ts:24-89`); nothing is persisted.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Numeric producers: new `Aggregate.ts`. Consumers in this same diff: `RelationRollup.ts`, `SummaryRenderer.ts` `calculateSummary`, `ChartAggregation.ts` `getStatValue`/`getMedianValue`, five eligibility clones, `RelationRollupConfigModal.ts`. Date and percent consumers wait for later children. Algorithm invariant: never coerce null→0; range is scalar `max − min`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Record fork lint/test baseline (`npx vitest run` will fail on missing `setupFiles`).
- [ ] Confirm live fork paths: `types.ts:44`, `RelationRollup.ts:123-128`, clones listed in spec.md.

### Phase 2: Core Implementation
- [ ] Create `Aggregate.ts` numeric functions + `isNumericRollupKind`.
- [ ] Create `src/__tests__/setup.ts` and `Aggregate.test.ts`.
- [ ] Widen `types.ts:44`; dispatch numeric kinds; sum-only tail.
- [ ] Replace five clones; add numeric modal options; route footer/chart numeric kinds.

### Phase 3: Verification
- [ ] `npx vitest run` green on Aggregate tests.
- [ ] Three-surface numeric agreement on a sample relation; empty chrome unchanged.
- [ ] Modal numeric filter still excludes text; rollup-of-rollup empty.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `min`/`max`/`median`/`range` × empty / all-null / single / odd / even / mixed (pre-filtered numbers) | Vitest (`npx vitest run`) |
| Integration | Not this child — no Obsidian API in Aggregate | — |
| Manual | Median on a numeric relation; modal lists kinds; footer/chart match cell | Obsidian fork |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot cite or edit call sites |
| Phase `001-live-reports-rollups` | Internal | Not required | Do not block this child on 001 |
| Date / percent children | Internal | Later | This child must export percent ids on the predicate so 003 does not retouch clones |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Numeric kinds type as `"text"`, silently SUM, or circular-import the aggregators; tests fail; date RANGE footer regresses.
- **Procedure**: Revert the same-diff files as one unit (`Aggregate.ts`, tests, `types.ts`, `RelationRollup.ts`, five clones, modal, footer/chart numeric routing). Do not leave the union widened without the switch.
<!-- /ANCHOR:rollback -->
