---
title: "Tasks: Formula IFS/SWITCH Math Module"
description: "Atomic task list for FormulaIfsSwitchMath.ts (IFS, SWITCH, aliases, Excel LOG) and the ComputedField Object.assign spread."
trigger_phrases:
  - "formula ifs switch tasks"
  - "FormulaIfsSwitchMath"
  - "excel log"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math/001-formula-ifs-switch-math-module"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored engine-module child from synthesis ranks 1-4 and final-plan steps 2-3"
    next_safe_action: "Implement FormulaIfsSwitchMath.ts plus the ComputedField Object.assign spread"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-formula-ifs-switch-math-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Formula IFS/SWITCH Math Module

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

T003–T004 are **one atomic diff**. Do not ship T003 without T004. Do not land aliases without `LOG`.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` ranks 1–4 plus LOG/SWITCH/uppercase defaults, and `research/final-plan.md` steps 1–3 (one module write, Excel LOG, no SafeEval edit) [15m]
- [ ] T002 Confirm live fork: `ComputedField.ts:93-98,310-378,325,314-315,372-373,433-437,500-506` and SafeEval Call/Binary (`SafeEval.ts:949-1018`); record upstream base `v1.2.8` / `2c96359` [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Create `src/data/FormulaIfsSwitchMath.ts`**: EuroFormat header (`EuroFormat.ts:9`); zero `obsidian` imports; export `formulaIfsSwitchMath` and `formulaIfsSwitchMathHelp`. **IFS:** walk `cond,val`; first JS-truthy wins (`ComputedField.ts:325`); odd arity → trailing default; &lt;1 pair or no match → `null`; no `console.warn`. **SWITCH:** `expr` then `pat,val` with `===`; odd rest → default; no match → `null`. **Aliases** with `Number(...)` like `ROUNDUP` (`:314-315`): `SQRT→Math.sqrt`, `LN→Math.log`, `LOG10→Math.log10`, `EXP→Math.exp`, `CBRT→Math.cbrt`, `LOG:(n,b?) => (b==null ? Math.log10(Number(n)) : Math.log(Number(n))/Math.log(Number(b)))`. No `LOG: Math.log`. No lowercase `ifs`/`switch`. Help: Logic for IFS/SWITCH, Math for six aliases; examples `=IFS([income]<=69715, 0.14, [income]<=150000, 0.30, 0.36)` and `=SWITCH(UPPER([period]), "MONTH", [amount], "QUARTER", [amount]*3, 0)`; mention `field("x")` / `IFERROR` / `?:` (`src/data/FormulaIfsSwitchMath.ts`) [S]
- [ ] T004 **Call site 1 (P0)** — same diff as T003: import next to `ComputedField.ts:1-8`; spread `...formulaIfsSwitchMath` **inside** the existing `Object.assign` at `:310-378` (beside `IF`/`AND`/`OR`). Do not add a second assign. Precedence unchanged (`:139-147,306-310`) (`src/data/ComputedField.ts:310-378`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Confirm `IFS`/`SWITCH`/`SQRT`/`LOG` resolve from `createContext`; unmatched / empty → `null`; `IFS(...)` no longer yields `formula.error.notFunction` (`ComputedField.ts:527-530`) [S]
- [ ] T006 `git diff <upstream-base> -- src/data/SafeEval.ts` empty; tokenizer (`FormulaTokenizer.ts:175`), `ComputedEvaluator.ts`, `RelationRollup.ts`, and views other than later FormulaModal untouched [S]
- [ ] T007 Spot-check `LOG(100)===2` (not `Math.log(100)`), `LOG(8,2)===3`, `SQRT(9)===3`; `SQRT(-1)` NaN / `LN(0)` `-Infinity` display as `-` (`EuroFormat.ts:30-31`) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T004 shipped as one diff
- [ ] Manual verification of T005–T007 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1–4
- **Parent final-plan**: `../research/final-plan.md` steps 1–3, 6
<!-- /ANCHOR:cross-refs -->
