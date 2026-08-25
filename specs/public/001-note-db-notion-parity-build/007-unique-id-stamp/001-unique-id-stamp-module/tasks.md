---
title: "Tasks: Unique-ID Stamp Module"
description: "Tasks for UniqueIdStamp.ts, parseUniqueIdConfig defaults, nextUniqueId pad-3 formatting, Vitest setup.ts, and UniqueIdStamp unit tests."
trigger_phrases:
  - "unique id stamp tasks"
  - "UniqueIdStamp"
  - "parseUniqueIdConfig"
  - "vitest setup"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/007-unique-id-stamp/001-unique-id-stamp-module"
    last_updated_at: "2026-08-25T21:35:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored UniqueIdStamp module child from synthesis ranks 1 and 5 and final-plan step 1"
    next_safe_action: "Implement UniqueIdStamp.ts and its vitest harness"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-unique-id-stamp-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Unique-ID Stamp Module

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

T003–T005 are **one atomic diff**. Do not ship `UniqueIdStamp.ts` without parse defaults and the tests that lock them.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` ranks 1 and 5 plus `research/final-plan.md` step 1 (module, defaults, `prefix.trim()`, pad 3) [15m]
- [ ] T002 Confirm `EuroFormat.ts:1-42` header precedent and that `vitest.config.ts` points at missing `src/__tests__/setup.ts` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Create `src/data/UniqueIdStamp.ts`**: durable-why header only; zero runtime imports; export `UniqueIdConfig`; `parseUniqueIdConfig(raw)` returns `undefined` for absent/non-object and fills `counter=0`, `prefix=""`, `padWidth=3`, `field="unique-id"` for a present object; `nextUniqueId` uses `Number.isFinite` / `counter >= 0`, pad default 3, `prefix.trim()` then `prefix ? `${prefix}-${number}` : number` (`src/data/UniqueIdStamp.ts`) [S]
- [ ] T004 **Harness** — land with T003: empty `src/__tests__/setup.ts` required by `vitest.config.ts`. No `package.json` `"test"` script (`src/__tests__/setup.ts`) [S]
- [ ] T005 **Unit tests** — land with T003: `INV`+0 → `INV-001`/`nextCounter=1`; missing prefix → `001`; `{}` → field `unique-id`; non-object → `undefined`; trailing-hyphen prefix does not emit `INV--001` (`src/data/UniqueIdStamp.test.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T006 `npx vitest run src/data/UniqueIdStamp.test.ts` green (SC-001) [S]
- [ ] T007 Confirm zero runtime imports in `UniqueIdStamp.ts` and no diff in `types.ts` / `DataSource.ts` / `CreateEntryPlan.ts` / `DatabaseView.ts` / `ColumnTypes.ts` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T005 shipped as one diff
- [ ] T006 green
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1, 5
- **Parent final-plan**: `../research/final-plan.md` step 1 (tests also step 8 harness)
<!-- /ANCHOR:cross-refs -->
