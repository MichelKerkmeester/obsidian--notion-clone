---
title: "Implementation Plan: Formula IFS/SWITCH Math Module"
description: "One-module plan for FormulaIfsSwitchMath.ts (IFS, SWITCH, five 1:1 aliases, Excel LOG) and the P0 ComputedField Object.assign spread. Never land aliases without LOG."
trigger_phrases:
  - "formula ifs switch plan"
  - "FormulaIfsSwitchMath"
  - "excel log"
  - "computed field spread"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/004-formula-ifs-switch-math/001-formula-ifs-switch-math-module"
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
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Formula IFS/SWITCH Math Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None — evaluation is read-only over already-loaded field data |
| **Testing** | Vitest lands in child 003; this child is engine-only |

### Overview
Land one EuroFormat-shaped leaf plus the P0 `createContext` spread so `IFS`/`SWITCH`/`LOG` resolve from the UPPERCASE table. IFS, SWITCH, five 1:1 aliases, and Excel `LOG` are one write. Record upstream base (`v1.2.8` / `2c96359` per research iter 7) before the SafeEval freeze check.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1–4 and LOG/discovery defaults read; final-plan steps 1–3 read.
- [x] Locked LOG: unary = `Math.log10`; `b == null` before `Number(b)`.
- [x] Locked: no `SafeEval.ts` edit; uppercase-only; `RESERVED` includes `"if"` and `"switch"` (`ComputedField.ts:93-98`).

### Definition of Done
- [ ] `FormulaIfsSwitchMath.ts` exports `formulaIfsSwitchMath` and `formulaIfsSwitchMathHelp`; zero `obsidian` imports.
- [ ] `ComputedField.ts:310-378` spreads the runtime table inside the existing `Object.assign`.
- [ ] Unary `LOG` ≠ `LN`; `LOG(100)===2`.
- [ ] `git diff <upstream-base> -- src/data/SafeEval.ts` empty.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module + rebase-safe call site (EuroFormat: `src/data/EuroFormat.ts:1-10`). Named wrappers over an engine that already evaluates `IF` and exposes `Math`. Module-level functions, not a class.

### Key Components
- **`formulaIfsSwitchMath`**: `IFS`, `SWITCH`, `SQRT`, `LN`, `LOG`, `LOG10`, `EXP`, `CBRT`.
- **`formulaIfsSwitchMathHelp`**: eight modal rows (consumed in child 002).
- **`ComputedField.ts`**: one import (`:1-8`) + spread inside `:310-378`.

### Data Flow
User expression → `normalizeFormula` rewrites `[x]` to `field("x")` (`ComputedField.ts:549-555`) → `safeEval` Call evaluates every argument (`SafeEval.ts:985-1018`) → wrapper returns value or `null`. Missing bracket keys return `undefined` (`getFieldValue` `:587`), not a throw. Bare missing idents still `ReferenceError` → field `null` (`:106-108`).
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: new `FormulaIfsSwitchMath.ts`. Consumer this child: `ComputedField.ts` `createContext` UPPERCASE table. Non-consumers this child: `FormulaModal.ts`, `i18n.ts`, vitest (later children). Algorithm invariant: never `LOG: Math.log`; unmatched IFS/SWITCH return `null` with no `console.warn`.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Re-read freeze: `ComputedField.ts:93-98,310-378,433-437` and SafeEval Call/Binary (`SafeEval.ts:949-1018`).
- [ ] Record upstream base (`v1.2.8` / `2c96359`).

### Phase 2: Core Implementation
- [ ] Create `FormulaIfsSwitchMath.ts` with IFS, SWITCH, aliases, Excel LOG, and help rows.
- [ ] Spread into `ComputedField.ts` `Object.assign` at `:310-378`.

### Phase 3: Verification
- [ ] Confirm `IFS`/`SQRT`/`LOG` resolve from `createContext`.
- [ ] Empty SafeEval diff; tokenizer / `ComputedEvaluator` / rollups / other views untouched.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Module wrappers (SQRT/LOG/IFS/SWITCH edges) | Child 003 `npx vitest run` |
| Integration | Not this child — do not import `ComputedFieldEngine` (needs `moment` + `t()`) | — |
| Manual | Tax-bracket IFS and period SWITCH on a throwaway column | Scratch vault after the spread |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot cite or edit call sites |
| Phase `003-reports-computed-fields` | Internal | Not required | Do not block this child on 003 |
| Children 002 / 003 | Internal | Later / parallel | Help export must exist for 002; 003 can start once this module is on disk |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: `LOG` equals `LN`; `SafeEval.ts` dirty; module shipped without the spread; lowercase `ifs`/`switch` registered.
- **Procedure**: Revert `FormulaIfsSwitchMath.ts` and the `ComputedField.ts` import+spread as one unit. Do not leave UPPERCASE keys without bodies.
<!-- /ANCHOR:rollback -->
