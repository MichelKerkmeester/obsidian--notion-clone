---
title: "Tasks: Computed Formulas Vitest"
description: "Tasks for the moment stub and module-only computed-formulas.test.ts. Run npx vitest run."
trigger_phrases:
  - "computed formulas vitest tasks"
  - "formula test harness"
  - "npx vitest run"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math/003-computed-formulas-vitest"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored vitest child from synthesis rank 6 and final-plan step 7"
    next_safe_action: "Create setup.ts and computed-formulas.test.ts importing only the new module"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-computed-formulas-vitest"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Computed Formulas Vitest

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

T003–T004 land together: `vitest.config.ts:6-7` requires `setup.ts` before any `*.test.ts` can run.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 001 exported `formulaIfsSwitchMath`; read synthesis rank 6 and final-plan step 7 (module-only tests, `npx vitest run`) [15m]
- [ ] T002 Confirm `vitest.config.ts:1-11` `include: src/**/*.test.ts` and `setupFiles: src/__tests__/setup.ts`; confirm `package.json` has no test script [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Create `src/__tests__/setup.ts`**: minimal `globalThis.moment` stub (`vitest.config.ts:6-7`). No general test migration (`src/__tests__/setup.ts`) [S]
- [ ] T004 **Create `src/data/__tests__/computed-formulas.test.ts`** — same child as T003: import only the new module. Cases: `SQRT(9)===3`; `LN(Math.E)≈1`; `LOG(100)===2` (not `Math.log(100)`); `LOG(8,2)===3`; `LOG10`/`EXP`/`CBRT` vs `Math.*`; IFS three-bracket boundaries; SWITCH `"Month"!=="month"`; empty/&lt;1 pair/no match → `null`; trailing defaults; `SQRT(-1)` NaN; `LN(0)` `-Infinity`; `LOG(n,1)` non-finite; no `console.warn` from wrappers (`src/data/__tests__/computed-formulas.test.ts`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 `npx vitest run` exits 0 (SC-001) [S]
- [ ] T006 Confirm the suite would fail a `LOG: Math.log` implementation; confirm tests do not import `ComputedFieldEngine` or `obsidian` [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped together
- [ ] `npx vitest run` green
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 6
- **Parent final-plan**: `../research/final-plan.md` step 7
<!-- /ANCHOR:cross-refs -->
