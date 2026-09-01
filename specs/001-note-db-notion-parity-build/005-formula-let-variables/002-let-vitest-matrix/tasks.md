---
title: "Tasks: Let Vitest Matrix"
description: "Tasks for the moment stub, test script, LetVariables.test.ts, and the corrected ComputedField.let.test.ts engine matrix."
trigger_phrases:
  - "let vitest tasks"
  - "LetVariables.test.ts"
  - "18-case matrix"
  - "npx vitest run"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/005-formula-let-variables/002-let-vitest-matrix"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored vitest child from synthesis rank 5 and final-plan steps 1-2, 4, 8-10"
    next_safe_action: "Create setup.ts, the test script, LetVariables.test.ts, and ComputedField.let.test.ts"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-let-vitest-matrix"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Let Vitest Matrix

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

T003 (harness) can start as soon as child 001's module exists. T004 (pure tests) belongs next to the module, before engine tests. `vitest.config.ts` `setupFiles` requires `setup.ts` before any `*.test.ts` can run.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 001 exported `transformLetCalls` / `registerLetHelper` and wired both call sites; read synthesis rank 5 and final-plan steps 1–2, 4, 8–10 (harness, pure tests, corrected matrix, display-only proof) [15m]
- [ ] T002 Confirm `vitest.config.ts` `include: src/**/*.test.ts` and `setupFiles: src/__tests__/setup.ts`; confirm `package.json:6-10` currently has `dev`/`build`/`lint` only; note whether 004 `sqrt` exists for case 17 [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Harness**: create `src/__tests__/setup.ts` assigning a minimal `globalThis.moment` (or `vi.stubGlobal`) sufficient for `parseMoment` / `today`. Add `"test": "vitest run"` to fork `package.json` scripts. Do not mock the Obsidian API. `npx vitest run` must start (`src/__tests__/setup.ts`, `package.json`) [S]
- [ ] T004 **Pure tests** — after T003: `src/data/__tests__/LetVariables.test.ts`. Scanner: `let("a", "x,y", a)` one arg split; `"let("` in strings untouched; `obj.let(` untouched; `let ("a",1,a)` matches. Emission nested, not flat (`lets("a", 1, "b", a + 1, a + b)` → `__let((a) => __let((b) => a + b, a + 1), 1)`). `lets("a",1)` → argCount; `let(5,1,2)`, `let("a b",1,2)`, `let("if",1,2)` → name. `let("let",5,let+1)` allowed. Recurse on value-position `let("a", let("b",1,b+1), a)` (`src/data/__tests__/LetVariables.test.ts`) [S]
- [ ] T005 **Engine tests**: `src/data/__tests__/ComputedField.let.test.ts` via `evaluateSingleDetailed`. Corrected matrix cases 1–16 + 18 from final-plan step 8; case 9 is `let("radius",4,round(pi * radius ** 2, 0))` → 50; case 16 is uppercase `IF(...)`; case 7 is `let("rate",0.05,rate)+rate` → NaN inside one expression; case 17 **only if 004 merged**. User `__let` + `=>` still `noArrowFunction` (`src/data/__tests__/ComputedField.let.test.ts`) [M]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T006 Display-only proof: review `ComputedEvaluator.ts:29-78` + LetVariables exports; errors → `null` in the result map; no frontmatter / `TFile` / `fs` / network on the let path [S]
- [ ] T007 Gates: `npx vitest run` (or `npm test`) exits 0 on in-scope cases; `npm run build`; `npm run lint`; `git diff --exit-code -- src/data/SafeEval.ts`; confirm FormulaModal still has no LET/LETS rows (child 003) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003 exists before T004/T005 can run
- [ ] `npx vitest run` green on in-scope cases
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 5
- **Parent final-plan**: `../research/final-plan.md` steps 1–2, 4, 8–10
<!-- /ANCHOR:cross-refs -->
