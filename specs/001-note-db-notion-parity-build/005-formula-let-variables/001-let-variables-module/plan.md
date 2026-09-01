---
title: "Implementation Plan: Let Variables Module"
description: "One-module plan for LetVariables.ts (nested __let transform, sequential lets, let/lets identity, transform-side validation) plus two ComputedField call sites and P0 error i18n."
trigger_phrases:
  - "let variables plan"
  - "LetVariables"
  - "transformLetCalls"
  - "registerLetHelper"
  - "nested __let"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/005-formula-let-variables/001-let-variables-module"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored engine-module child from synthesis ranks 1-4 and final-plan steps 3,5-7"
    next_safe_action: "Implement LetVariables.ts plus ComputedField wiring and P0 error i18n"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-let-variables-module"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Plan: Let Variables Module

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (Obsidian plugin fork) |
| **Framework** | Obsidian API; live fork source at `Obsidian Plugin/src` |
| **Storage** | None — evaluation is read-only over already-loaded field data |
| **Testing** | Vitest lands in child 002; this child is engine-only |

### Overview
Land one EuroFormat-shaped leaf plus the two P0 `ComputedField.ts` call sites so Notion-natural `let`/`lets` evaluate through nested `__let` arrows. Sequential binding, `let`/`lets` identity, and transform-side validation are the same scanner, not extra surfaces. P0 error keys land in this commit, not the P2 FormulaModal commit.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Synthesis ranks 1–4 and locked design read; final-plan steps 0, 3, 5–7 read.
- [x] Locked: no `SafeEval.ts` edit; no `context.let` helper; no IIFE; no flat multi-param `__let`.
- [x] Locked: transform inside the eval try; keyword denylist = tokenizer keywords only.

### Definition of Done
- [ ] `LetVariables.ts` exports `transformLetCalls` and `registerLetHelper`; zero `obsidian` imports.
- [ ] `evaluateExpressionDetailed` transforms inside the existing try; both `safeEval` calls use `transformedExpr`.
- [ ] `__let` registered near `iferror` (`ComputedField.ts:294-304`); `:310-378` untouched.
- [ ] `formula.error.letArgCount` / `letName` mapped and present in three locales.
- [ ] `git diff --exit-code -- src/data/SafeEval.ts` empty.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated module + rebase-safe call sites (EuroFormat: `src/data/EuroFormat.ts:1-42`). Trusted source transform after the security check, then SafeEval Arrow child scopes. Module-level functions, not a class.

### Key Components
- **`transformLetCalls`**: scanner + nested `__let` emission + `let:argCount` / `let:name` throws.
- **`registerLetHelper`**: `__let: (fn, ...vals) => fn(...vals)` on the eval context.
- **`ComputedField.ts`**: import; eval hook at `:428-448`; helper at `:294-304`; error map at `:511-547`.

### Data Flow
User expression → `normalizeFormula` (`ComputedField.ts:549-555`) → `validateFormulaSecurity` on the user string (`=>` ban `:504-506`) → `transformLetCalls` (trusted; may emit `=>`) → `safeEval(transformedExpr, scope)` and the `allowStatements: true` fallback, unless the transform threw. Arrow evaluation builds `childScope = Object.create(scope)` (`SafeEval.ts:1043-1050`). Inner `__let` value args evaluate in the outer arrow's scope (sandbox analogue of notion-vm `runLets`).
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
Not a bug-fix packet. Producer: new `LetVariables.ts`. Consumers this child: `ComputedField.ts` `evaluateExpressionDetailed`, `createContext` lowercase region, `formatEvaluationError`, and `i18n.ts` error clusters. Non-consumers this child: `FormulaModal.ts`, vitest (later children), `SafeEval.ts`, `FormulaTokenizer.ts`, `ComputedEvaluator.ts` Bases path. Algorithm invariant: emit nested `__let` only; never a flat multi-param arrow; never special-case Call inside SafeEval.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [ ] Re-read freeze: `ComputedField.ts:135-380` (`createContext`), `:421-506` (eval + security), `SafeEval.ts:1010-1050`.
- [ ] Confirm UPPERCASE block still `:310-378`; note whether 004 `sqrt` exists (does not block this child).

### Phase 2: Core Implementation
- [ ] Create `LetVariables.ts` with the written scanner contract (final-plan step 3).
- [ ] Hook `evaluateExpressionDetailed` inside the try; catch transform errors before statement fallback.
- [ ] Map `let:*` in `formatEvaluationError`; add two keys in three locales.
- [ ] Call `registerLetHelper` after `iferror`.

### Phase 3: Verification
- [ ] Confirm a well-formed `let` evaluates and a malformed `lets("a", 1)` maps to `letArgCount`.
- [ ] Empty SafeEval diff; `:310-378` untouched; FormulaModal untouched.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | Pure transform (scanner, emission, errors) | Child 002 `LetVariables.test.ts` |
| Integration | Engine matrix via `evaluateSingleDetailed` | Child 002 `ComputedField.let.test.ts` |
| Manual | Spot-check `let("rate", 0.05, amount * rate)` on a throwaway column | Scratch vault after wiring |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Live fork `Obsidian Plugin/src` | Internal | Green | Cannot cite or edit call sites |
| Phase `004-formula-ifs-switch-math` | Internal | Not required for this child | Park matrix case 17 in child 002; rebase `__let` if `iferror` moves |
| Children 002 / 003 | Internal | Later | 002 needs the module on disk; 003 does not consume a help export |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: `SafeEval.ts` dirty; transform outside the try; `__let` documented; keyword names leak `unexpectedToken`; error keys missing so `t()` shows the key string.
- **Procedure**: `git checkout` `ComputedField.ts` and `i18n.ts` (error keys) and delete `LetVariables.ts` as one unit. Do not leave `__let` registered without the transform, or the transform without `__let`.
<!-- /ANCHOR:rollback -->
