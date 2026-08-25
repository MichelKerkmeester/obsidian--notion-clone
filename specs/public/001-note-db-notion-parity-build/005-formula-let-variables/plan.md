---
title: "Implementation Plan: Formula LET/LETS Variables"
description: "Locked build plan: a new LetVariables.ts transform module plus two rebase-safe ComputedField.ts call sites emit nested __let arrow calls; SafeEval.ts untouched."
trigger_phrases:
  - "let variable"
  - "lets variable"
  - "formula let"
  - "notion let"
  - "child scope binding"
  - "computed field context"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/005-formula-let-variables"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "markdown"
    recent_action: "Applied final-plan.md review findings"
    next_safe_action: "Bootstrap harness, then build LetVariables.ts"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Formula LET/LETS Variables

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript — Obsidian plugin fork |
| **Framework** | Native formula engine (`ComputedField.ts`) over the `SafeEval.ts` sandbox |
| **Storage** | In-memory evaluation context only |
| **Testing** | Vitest harness bootstrapped in this phase (`src/__tests__/setup.ts` + `"test": "vitest run"`; the fork currently has zero `*.test.ts` files) |

### Overview
Build the synthesis's locked design: a new EuroFormat-style pure module `src/data/LetVariables.ts` exporting `transformLetCalls()`, which rewrites Notion-natural `let`/`lets` calls into **nested** `__let((name) => body, value)` forms. SafeEval eagerly evaluates Call arguments (`SafeEval.ts:1010-1017`), so a plain context function cannot defer the body — but an Arrow in argument position parses correctly, and SafeEval's Arrow evaluator builds `childScope = Object.create(scope)` (`SafeEval.ts:1043-1050`), reproducing Notion's binding, shadowing, and sequential-binding semantics. This is homologous to Notion's real engine (notion-vm compiles the body to deferred bytecode evaluated in a child binding stack), not a hack. Two rebase-safe edits land in `ComputedField.ts`; `SafeEval.ts` is never touched. Ships after phase `004-formula-ifs-switch-math` merges on `createContext`.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] Phase 004 merged shape on `createContext` reviewed (005 must not collide with its function-table region).
- [ ] Synthesis constraints re-read: eager args (`SafeEval.ts:1010-1017`), Arrow child scope (`SafeEval.ts:1043-1050`), security ban on `=>` (`ComputedField.ts:504-506`).
- [ ] Scope locked: `LetVariables.ts` + `ComputedField.ts` + tests (+ harness files); P2 UI commit separate.
- [ ] Harness bootstrap approved as in-phase work (synthesis default).

### Definition of Done
- [ ] `transformLetCalls` implemented with scanner, nested emission, validation errors, and recursion on every arg (value args AND body).
- [ ] Both `safeEval` calls consume `transformedExpr`; the transform runs inside the existing try and on failure returns the mapped error without falling through to the `allowStatements` retry; `__let` registered via `registerLetHelper`.
- [ ] `formula.error.letArgCount` / `formula.error.letName` mapped in `formatEvaluationError` and present in en / zh-CN / zh-TW (core commit).
- [ ] 18-case matrix green, including sequential binding and all edge cases (case 17 gated on 004).
- [ ] Regression check passes with 0 delta; no-let formulas byte-identical by pass-through.
- [ ] `git diff --exit-code -- src/data/SafeEval.ts` passes.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Trusted post-security source transform on the EuroFormat isolated-module model. Precedent: `normalizeFormula` already performs a trusted rewrite between the security check and eval. The user-facing `=>` ban holds because the security scan runs on the user string first; every `=>` in the transformed text was emitted by trusted code over already-scanned user text.

### Do NOT ship (ruled out by research)
(a) a `createContext` context function receiving a pre-computed expr — eager args make it fail before `let` exists; (b) string-body `let("rate", 0.05, "amount * rate")` — inner `let` closes over the fixed context and loses outer bindings; (c) naive IIFE `((rate) => body)(value)` — `parseArrowFunction` rejects it; (d) any Call special case inside SafeEval (REQ-004); (e) a flat single-arrow `__let((a, b) => expr, v1, v2)` — breaks sequential binding.

### Key Components

| Piece | Path | Role |
|-------|------|------|
| **New module** | `src/data/LetVariables.ts` | Pure `transformLetCalls(formula): string`; exported `registerLetHelper(context)` registers `__let: (fn, ...vals) => fn(...vals)` so the helper line stays out of the dense function table |
| **Call site 1** | `ComputedField.ts` `evaluateExpressionDetailed` (~428-448) | After `validateFormulaSecurity`: `const transformedExpr = transformLetCalls(normalizedExpr)` placed **inside the existing try** that wraps the `safeEval` calls; **both** `safeEval` calls (expression path and `allowStatements: true` fallback) use `transformedExpr`; on transform failure the mapped error returns immediately and the statement-mode fallback does NOT retry |
| **Call site 2** | `ComputedField.ts` `createContext`, lowercase region near `iferror` (~294-304) | `registerLetHelper(context)`. Placed here to avoid phase-004 UPPERCASE-alias churn (~310-378). Do **not** add `__let` to `FormulaModal` FUNCTIONS |
| **Error map + i18n (core, P0)** | `ComputedField.ts` `formatEvaluationError` (~511-547) + `src/i18n.ts` | Map `let:argCount` → `t("formula.error.letArgCount")`, `let:name` → `t("formula.error.letName")`; add those two keys in en / zh-CN / zh-TW next to the existing error-key clusters (~1175 / ~2647 / ~4165). Typed errors are P0 — without these keys in the core commit, `t()` surfaces the key string |
| **Call site 3 (P2)** | `src/views/modals/FormulaModal.ts` `FUNCTIONS` (~60-105) + `src/i18n.ts` (help keys only) | LET/LETS help entries under `formula.catLogic`; `formula.fn.LET.desc` / `formula.fn.LETS.desc` (3 locales); examples use fork `**`/`pow`, never Notion `^`. The two `formula.error.let*` keys are NOT in this commit |

### Core Algorithm
User syntax stays Notion-natural (quoted names, live expression):

- `let("rate", 0.05, amount * rate)` → `__let((rate) => amount * rate, 0.05)`
- `lets("a", 1, "b", a + 1, a + b)` → `__let((a) => __let((b) => a + b, a + 1), 1)`
- Nested `let("firstName","Monkey", let("lastName","Luffy", firstName + " D. " + lastName))` → innermost-first nested `__let`.

Values of an inner `__let` are eager-evaluated in the outer arrow's scope — the sandbox analogue of notion-vm `runLets` (sequential push-then-eval in a child binding stack). Folding pairs right-to-left is what makes later values see earlier names of the same call.

### Scanner (~35–45 lines; regex is insufficient)
Walk the formula tracking `(`/`[`/`{` depth; skip `"…"`, `'…'`, `` `…` `` honoring `\` escapes; match `lets\s*\(` before `let\s*\(` (optional whitespace before `(` so `let ("a", 1, a)` still transforms); require a non-identifier boundary and not a preceding `.` (member-access exclusion). Split args only at depth-1 commas. **Recurse `transformLetCalls` on every arg (value args AND body)** so value-position `let("a", let("b", 1, b + 1), a)` rewrites the inner `let`, not only the body. Validate: odd argc ≥ 3 else `Error("let: …")` → `formula.error.letArgCount`; each name a quoted string matching `[A-Za-z_$][A-Za-z0-9_$]*` **and not a SafeEval tokenizer keyword** (`true false null undefined typeof if else return`) else `formula.error.letName` — keyword names tokenize as `TT.If`/`TT.True` etc., not `TT.Ident`, so `expect(TT.Ident)` (`SafeEval.ts:826-828`) would throw `unexpectedToken` on the transformed form. Do NOT reuse `ComputedFieldEngine.RESERVED` (`:93-98`) — it filters frontmatter keys and bans `let`, which must remain a legal binding name. Pass through unchanged when no bare `let(`/`lets(` is present (NFR-P01 by construction). `extractDependencies` stays on the original formula (`ComputedField.ts:390-414`) — let-bound names are not columns.

### Data Flow
`normalizeFormula` (`[amount]` → `field("amount")`, `ComputedField.ts:549-555`) → `validateFormulaSecurity` on the user string (blocks `=>`) → `transformLetCalls` (trusted; may emit `=>`) → `safeEval(transformedExpr, scope)` and the `allowStatements` fallback. Bases dialect never reaches this pipeline (`expressionSyntax === "base"` routes to `BaseExpression.ts`, `ComputedEvaluator.ts:50-54`).

### Mobile / iCloud Safety
let/lets are evaluation-only: `evaluateComputedFields` writes a `result` map (`ComputedEvaluator.ts:29-78`); errors → `null`; success → display values. No frontmatter write, no vault/`TFile` mutation, no `fs`/DOM/network/timers. `__let` and `transformLetCalls` are pure; NFR-M01/NFR-S02 hold; rollups consuming a let-using computed field remain display-only.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Harness & Setup
- [ ] Bootstrap vitest: create `src/__tests__/setup.ts` assigning a minimal `globalThis.moment` (or `vi.stubGlobal`) sufficient for `parseMoment`/`today` — do NOT mock the whole Obsidian API (`ComputedField.ts` and `i18n.ts` do not import `obsidian`; skip `obsidian` mocks until a test actually imports a view); add `"test": "vitest run"` to `package.json`.
- [ ] Confirm phase 004 merged on `createContext` (composition tests depend on it; placement of `__let` avoids its region). NOTE: 004 is required only for matrix case 17 (`sqrt`) and to avoid rebasing the UPPERCASE alias table; the transform and cases 1–16 + 18 ship without 004.
- [ ] Capture the regression baseline with the new harness.

### Phase 2: Core Implementation
- [ ] Create `src/data/LetVariables.ts` (one merged implementation: scanner + nested emission + validation; `let`/`lets` one transform). Scanner: depth/string-aware, `lets\s*\(` before `let\s*\(`, non-identifier boundary, no preceding `.`, split at depth-1 commas, **recurse on every arg (value args AND body)**, keyword denylist `{true, false, null, undefined, typeof, if, else, return}` for names, right-to-left nested `__let` emission, pass-through when no bare let/lets.
- [ ] Write pure-transform tests `src/data/__tests__/LetVariables.test.ts` **before** engine wiring (TDD the scanner; cheap, no `moment`): scanner safety, nested emission, both validation errors, value-position recursion.
- [ ] Wire call site 1: import + insert `transformLetCalls` between the security check and both `safeEval` calls in `evaluateExpressionDetailed`, **inside the existing try**; on transform failure return the mapped error immediately (no `allowStatements` retry).
- [ ] Wire call site 2: call `registerLetHelper(context)` in `createContext` near `iferror`.
- [ ] Error map + i18n (CORE commit, P0): map `let:argCount`/`let:name` in `formatEvaluationError`; add `formula.error.letArgCount` / `formula.error.letName` in en / zh-CN / zh-TW next to existing error-key clusters.
- [ ] Engine matrix `src/data/__tests__/ComputedField.let.test.ts` via `evaluateSingleDetailed` (corrected 18-case matrix per tasks.md T010; case 17 gated on 004).

### Phase 3: P2 Commit & Verification
- [ ] Separate commit: `FormulaModal.ts` FUNCTIONS entries (category `formula.catLogic`, `**`/`pow` examples, names `LET`/`LETS`) + en/zh-CN/zh-TW help keys (`formula.fn.LET.desc`, `formula.fn.LETS.desc` only — the error keys are already in the core commit). Highlighting fixes itself via `FUNCTION_NAMES` derivation. No `__let` help.
- [ ] Run the full matrix + regression check; confirm `SafeEval.ts` zero diff and scoped `git diff --stat`; update `checklist.md` evidence.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit (pure transform) | Scanner safety (strings/templates/member access), splitting, emission shape, validation errors, value-position recursion | `npx vitest run` — `src/data/__tests__/LetVariables.test.ts` (written before engine wiring; no `moment` needed) |
| Engine integration | 18-case matrix: Notion examples, sequential binding, nesting/shadowing, collisions, self-ref, composition (case 17 gated on 004) | `npx vitest run` — `src/data/__tests__/ComputedField.let.test.ts` |
| Regression | No-let formulas unchanged; 0 delta vs baseline | Same harness (bootstrapped in Phase 1) |
| Diff integrity | `SafeEval.ts` untouched | `git diff --exit-code -- src/data/SafeEval.ts` |
| Scope confinement | Only scoped files changed | `git diff --stat` |
| Build/lint | No compile or lint regressions | `npm run build` · `npm run lint` |

Matrix cases are enumerated in `tasks.md` (T010) and `checklist.md`; they cover every row of the synthesis edge-case table.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Phase `004-formula-ifs-switch-math` merged first on `createContext` | Internal | Planned (synthesis default ordering) | Composition tests (matrix 16–17) wait on 004; the transform itself does not |
| Vitest harness (in-phase bootstrap) | Internal | Missing today — zero test files, no `test` script | SC-002's 0-delta gate unprovable; bootstrapping is backlog item 5 |
| `SafeEval.ts` (read-only constraint) | Internal | Green | Eager-args + Arrow child-scope define the design |
| Phase research | Internal | Green | `research/synthesis.md` (ranked findings) + `research/research.md` (evidence trail) |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: let/lets returns wrong results, leaks bindings, or the regression check regresses.
- **Procedure**: `git checkout` of `ComputedField.ts` + delete `LetVariables.ts`. `SafeEval.ts` needs no rollback because it is never modified (`git diff --exit-code -- src/data/SafeEval.ts` proves it at any point).

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Harness & Setup | Phase 004 merged (for placement/composition only) | Core Implementation |
| Core Implementation | Harness & Setup | P2 Commit & Verification |
| P2 Commit & Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Harness & Setup (moment global + empty setup + `test` script) | Small | 20 minutes |
| Core Implementation (module M + pure tests S + call sites S + error i18n S) | Medium | 2 hours |
| P2 Commit (help entries + 3-locale help keys) | Small | 30 minutes |
| Verification (18-case matrix + gates) | Medium | 45 minutes |
| **Total** | | **~3.5 hours (M)** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Scope confirmed: `LetVariables.ts` + `ComputedField.ts` (+ tests/harness; P2 commit separate).
- [ ] `git diff --exit-code -- src/data/SafeEval.ts` verified empty before and after.
- [ ] Regression baseline captured with the bootstrapped harness before changes.

### Rollback Procedure
1. Revert `ComputedField.ts` with `git checkout`; delete `LetVariables.ts` (and revert the P2 commit if present).
2. Re-run the regression check to confirm the baseline is restored.
3. Confirm `SafeEval.ts` still has zero diff.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A — evaluation-only feature, no persisted state, iCloud-safe.

<!-- /ANCHOR:enhanced-rollback -->
