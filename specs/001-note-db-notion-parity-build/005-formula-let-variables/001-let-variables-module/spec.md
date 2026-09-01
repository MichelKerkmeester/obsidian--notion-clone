---
title: "Feature Specification: Let Variables Module"
description: "One module write: LetVariables.ts nested __let transform (let+lets, sequential binding, transform-side validation) plus two ComputedField call sites and P0 formula.error.let* i18n."
trigger_phrases:
  - "let variables module"
  - "LetVariables"
  - "transformLetCalls"
  - "registerLetHelper"
  - "nested __let"
  - "formula letArgCount"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/005-formula-let-variables/001-let-variables-module"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Let Variables Module

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `005-formula-let-variables` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 3 |
| **Predecessor** | None |
| **Successor** | 002-let-vitest-matrix |
| **Handoff Criteria** | Module plus both ComputedField call sites and P0 error keys land together; SafeEval.ts diff empty |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 3** — Parent: [`../spec.md`](../spec.md) · Successor: `002-let-vitest-matrix`. Independent of FormulaModal help (child 003). Unblocks the vitest matrix once `transformLetCalls` and `__let` exist.

This child is the **one module write** from `research/final-plan.md` steps 3, 5–7 and synthesis ranks 1–4. Nested `__let` emission, sequential left-to-right multi-var binding, `let`/`lets` identity, and transform-side arg-count/name errors land in the same file. Do not ship the module without the two `ComputedField.ts` call sites. Do not park `formula.error.let*` keys in the P2 FormulaModal commit.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion formulas bind per-row names with `let`/`lets` (`let(person, "Alan", "Hello, " + person + "!")` = `"Hello, Alan!"`). The fork has no binding construct. A plain `context.let` helper cannot work: SafeEval evaluates every Call argument in the caller scope before the function runs (`SafeEval.ts:1010-1017`), so `let("rate", 0.05, amount * rate)` dies on unbound `rate`. Naive IIFE `((rate) => body)(value)` is rejected by `parseArrowFunction` (`SafeEval.ts:824-838`). A flat `__let((a, b) => expr, v1, v2)` eager-evals `a + 1` in the caller and is wrong.

### Purpose
Create one EuroFormat-shaped leaf `src/data/LetVariables.ts` (`EuroFormat.ts:1-42` header precedent, zero `obsidian` imports) exporting `transformLetCalls(formula: string): string` and `registerLetHelper(context)`, wire it into `evaluateExpressionDetailed` **inside** the existing try, register `__let: (fn, ...vals) => fn(...vals)` near `iferror`, and map `let:argCount` / `let:name` in `formatEvaluationError` plus three-locale i18n.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New module `src/data/LetVariables.ts`: bracket/string-aware scanner. Walk `(`/`[`/`{` depth; skip `"…"`, `'…'`, `` `…` `` (honor `\`); match `\blets\s*\(` before `\blet\s*\(`; require a non-identifier left boundary and **not** a preceding `.` (`obj.let(` is a method). Split args only at depth-1 commas. Recurse `transformLetCalls` on **every** arg (value args AND body) so `let("a", let("b",1,b+1), a)` rewrites the inner call.
- `let` and `lets` are one transform (Notion April 2025 identity). Optional whitespace before `(` so `let ("a", 1, a)` still transforms.
- Emit right-to-left nested `__let((name) => body, value)`: `let("rate", 0.05, amount * rate)` → `__let((rate) => amount * rate, 0.05)`; `lets("a", 1, "b", a + 1, a + b)` → `__let((a) => __let((b) => a + b, a + 1), 1)`. Pass-through when no bare `let(`/`lets(` is present.
- Transform-side validation: odd argc ≥ 3 else throw `Error` with stable prefix `let:argCount`; each name a quoted string matching `[A-Za-z_$][A-Za-z0-9_$]*` **and not** `{true,false,null,undefined,typeof,if,else,return}` else `let:name`. `let("let", …)` stays legal (`let` is Ident, not a tokenizer keyword — `SafeEval.ts:258-269`). Do **not** reuse `ComputedFieldEngine.RESERVED` (`ComputedField.ts:93-98`) — it filters frontmatter keys and bans `let`.
- Call site 1: `evaluateExpressionDetailed` (`ComputedField.ts:428-448`). After `validateFormulaSecurity` on the **user** string (`=>` ban at `:504-506`), **inside** the existing try: `transformedExpr = transformLetCalls(normalizedExpr)`; both `safeEval` calls (`:441` and `:447`) use `transformedExpr`. On transform failure return the mapped error immediately; do **not** run the `allowStatements` fallback.
- Call site 2: `registerLetHelper(context)` from `createContext` immediately after `iferror` (`:294-304`). Do **not** edit the phase-004 UPPERCASE block (`:310-378`). Do **not** add `__let` to FormulaModal.
- P0 error i18n: `formatEvaluationError` (`:511-547`) maps `let:argCount` → `t("formula.error.letArgCount")`, `let:name` → `t("formula.error.letName")`. Add those two keys in en / zh-CN / zh-TW next to existing error clusters (`i18n.ts` ~1175 / ~2647 / ~4165).
- Pipeline order stays locked: `normalizeFormula` (`:549-555`) → `validateFormulaSecurity` on the user string → trusted `transformLetCalls` → both `safeEval` calls.
- `extractDependencies` stays on the original formula (`:390-414`). Bases dialect is untouched (`ComputedEvaluator.ts:50-54`).

### Out of Scope
- Vitest harness and the 18-case matrix (child `002-let-vitest-matrix`).
- FormulaModal `FUNCTIONS` and `formula.fn.LET.desc` / `LETS.desc` (child `003-formula-modal-let-help`).
- `SafeEval.ts` edits of any kind.
- Lazy `if`/`ifs`; static typing / unbound-name errors; Notion method-chaining on bound values; Bases dialect `BaseExpression.ts`.
- Ruled-out designs: `context.let` receiving a pre-evaluated expr; string-body `let("rate", 0.05, "amount * rate")`; naive IIFE; a Call special-case inside SafeEval; flat `__let((a, b) => expr, v1, v2)`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/LetVariables.ts` | Create | Pure `transformLetCalls` + `registerLetHelper`; zero `obsidian` imports; EuroFormat header |
| `src/data/ComputedField.ts` | Edit | Import; transform inside the eval try (`:428-448`); `__let` near `iferror` (`:294-304`); map `let:*` in `formatEvaluationError` (`:511-547`) |
| `src/i18n.ts` | Edit | `formula.error.letArgCount` / `formula.error.letName` in en / zh-CN / zh-TW (~1175 / ~2647 / ~4165) |
| `src/data/SafeEval.ts` | No change (verify) | Empty diff |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `let`/`lets` rewrite to nested `__let` | `let("rate", 0.05, amount * rate)` becomes `__let((rate) => amount * rate, 0.05)` and evaluates as `amount * 0.05`; Arrow child scope is `Object.create(scope)` (`SafeEval.ts:1043-1050`) |
| REQ-002 | Sequential multi-var binding; `let` and `lets` are one transform | `lets("a", 1, "b", a + 1, a + b)` emits nested `__let` (not a flat two-param arrow) and returns 3; match `lets(` before `let(` |
| REQ-003 | `SafeEval.ts` is untouched | `git diff --exit-code -- src/data/SafeEval.ts` empty; eager Call args inherited (`:1010-1017`) |
| REQ-004 | Transform-side typed errors, including keyword names | Odd argc `< 3` → `formula.error.letArgCount`; `let(5,1,2)`, `let("a b",…)`, `let("if",1,2)` → `formula.error.letName`; `let("let", 5, let + 1)` allowed; statement-mode fallback does not retry a failed transform |
| REQ-005 | EuroFormat engine footprint | One new module plus two localized `ComputedField.ts` edits (`:428-448` and `:294-304`); do not edit `:310-378` |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-006 | P0 error i18n keys in three locales | `formula.error.letArgCount` and `formula.error.letName` present at `i18n.ts` ~1175 / ~2647 / ~4165; `t()` does not surface the raw key string |
| REQ-007 | `__let` stays internal | Registered via `registerLetHelper` near `iferror`; absent from FormulaModal `FUNCTIONS`; direct user `__let((a) => a, 5)` still blocked by `:504-506` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `let("rate", 0.05, amount * rate)` evaluates; `lets("a", 1, "b", a + 1, a + b)` returns 3.
- **SC-002**: `lets("a", 1)` and `let("if", 1, 2)` return the typed error strings, not `formula.error.generic` or `unexpectedToken`.
- **SC-003**: `SafeEval.ts` diff is empty; `createContext` UPPERCASE block (`:310-378`) is untouched.
- **SC-004**: Formulas with no bare `let(`/`lets(` take the pass-through path (byte-identical transform).

### Acceptance Scenarios

- **Given** `let("rate", 0.05, amount * rate)` with `amount=100`, **when** the field evaluates, **then** the result is 5 and `rate` is not visible after the call.
- **Given** `lets("a", 1, "b", a + 1, a + b)`, **when** it evaluates, **then** the result is 3.
- **Given** `lets("a", 1)`, **when** it evaluates, **then** the error is `formula.error.letArgCount`, not a transformed-form `unexpectedToken`.
- **Given** a user formula containing `=>`, **when** security runs, **then** it is still blocked at `:504-506` before any transform emits arrows.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Transform runs outside the try | `Error("let: …")` escapes and is not mapped; statement fallback retries | Insert `transformLetCalls` **inside** the existing try; return immediately on transform failure |
| Risk | Security scan after emit `=>` | Sandbox bypass concern | `validateFormulaSecurity` on the user string first (`:504-506`); transform is trusted, like `normalizeFormula` |
| Risk | Keyword binding names | `let("if", …)` becomes `unexpectedToken` on commas the user never wrote | Denylist tokenizer keywords only (`SafeEval.ts:264-272`); do not reuse `RESERVED` |
| Risk | Phase 004 churn on `createContext` | `__let` collides with UPPERCASE aliases | Register near `iferror` (`:294-304`); do not edit `:310-378`. Build 005 anyway if 004 is not merged |
| Dependency | Live fork `Obsidian Plugin/src` | Cannot cite or edit call sites | Build against recorded fork lines |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: nested `__let` only (not flat, not IIFE, not a context helper); `let`/`lets` identity; keyword names are `letName`; `registerLetHelper` near `iferror`; error i18n is P0 in this child, not P2.
<!-- /ANCHOR:questions -->
