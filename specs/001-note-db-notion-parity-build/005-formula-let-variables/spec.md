---
title: "Feature Specification: Formula LET/LETS Variables"
description: "Adds Notion-style LET/LETS variable binding via a trusted source transform in a new LetVariables.ts module plus two rebase-safe ComputedField.ts call sites, without touching the SafeEval sandbox."
trigger_phrases:
  - "let variable"
  - "lets variable"
  - "formula let"
  - "notion let"
  - "named intermediate"
  - "computed field scope"
  - "formula variable binding"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/005-formula-let-variables"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored; LetVariables module first"
    next_safe_action: "Build 001-let-variables-module per its plan.md and tasks.md"
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
# Feature Specification: Formula LET/LETS Variables

> Phase adjacency: predecessor `004-formula-ifs-switch-math` · successor `006-link-scheme-fields`. Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-24 |
| **Branch** | `005-formula-let-variables` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion formulas support `let()` / `lets()` to bind named intermediate values in a per-row child scope (`let(person, "Alan", "Hello, " + person + "!")` = `"Hello, Alan!"`); the fork's native engine (`ComputedField.ts` over the `SafeEval.ts` sandbox) has no binding construct, so long formulas duplicate sub-expressions. Research confirmed the obvious fix cannot work: SafeEval eagerly evaluates every Call argument in the caller scope before the function runs (`SafeEval.ts:1010-1017`), so a plain `context.let = (name, value, expr) => …` fails on the unbound name before `let` ever executes. String-body variants break nested `let` (the inner function closes over the fixed context, losing outer bindings), and a naive `((rate) => body)(value)` IIFE is rejected by SafeEval's arrow parser (`SafeEval.ts:824-838`). AppFlowy and Anytype contribute nothing — both have only hardcoded column aggregates, no expression engine.

### Purpose
Close that parity gap with the locked design: a new EuroFormat-style module `src/data/LetVariables.ts` whose pure `transformLetCalls()` rewrites `let`/`lets` calls into nested `__let((name) => body, value)` forms AFTER the security check, letting SafeEval's native Arrow child scopes (`Object.create(scope)`, `SafeEval.ts:1043-1050`) reproduce Notion's binding, shadowing, and sequential-binding semantics. `SafeEval.ts` stays byte-identical. The single biggest risk is verification, not the design: the fork has vitest configured but zero `*.test.ts` files and no `test` script, so phase 005 must bootstrap the harness to evidence its acceptance criteria. Nested children own the ordered slices: the module plus ComputedField wiring and P0 error keys first, then the vitest harness and 18-case matrix, then P2 FormulaModal help.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New pure module `src/data/LetVariables.ts`: `transformLetCalls(formula)` — bracket/string-aware scanner matching bare `let(`/`lets(` (never `obj.let(`, never inside literals; optional whitespace before `(` so `let ("a", 1, a)` still transforms), splitting top-level args, validating, and emitting **nested** `__let` calls folded right-to-left so each value sees earlier bindings of the same call. The transform **recurses on every arg (value args AND body)** so value-position `let("a", let("b",1,b+1), a)` rewrites the inner `let`, not only the body.
- `let` and `lets` treated as one transform (identical since Notion April 2025).
- Transform-side validation: odd argument count ≥ 3 else `formula.error.letArgCount`; each name a quoted string matching `[A-Za-z_$][A-Za-z0-9_$]*` **and not a SafeEval tokenizer keyword** (`true false null undefined typeof if else return`) else `formula.error.letName` — keyword names tokenize as `TT.If`/`TT.True` etc. and would surface a transformed-form `unexpectedToken` the user never wrote. `ComputedFieldEngine.RESERVED` is NOT reused (it filters frontmatter keys and bans `let`, which must stay a legal binding name).
- Call site 1: `evaluateExpressionDetailed` in `ComputedField.ts` inserts `transformLetCalls` between `validateFormulaSecurity` and both `safeEval` calls (expression path and `allowStatements` fallback). The transform runs **inside the existing try** that wraps the `safeEval` calls; on transform failure the mapped error returns immediately and the statement-mode fallback does NOT retry.
- Call site 2: `__let: (fn, ...vals) => fn(...vals)` registered in `createContext` near `iferror` (via an exported `registerLetHelper(context)`), kept out of the phase-004 UPPERCASE alias region.
- Vitest harness bootstrap: `src/__tests__/setup.ts` assigning a minimal `globalThis.moment` (or `vi.stubGlobal`) sufficient for `parseMoment`/`today` — the whole Obsidian API is NOT mocked (`ComputedField.ts` and `i18n.ts` do not import `obsidian`; `obsidian` mocks are skipped until a test actually imports a view) — plus a `"test": "vitest run"` script, required because SC-002's regression gate is otherwise unprovable.
- Test coverage: pure-transform tests (written before engine wiring) plus the engine-level 18-case matrix.
- Core commit (P0): the two `formula.error.let*` i18n keys (en / zh-CN / zh-TW) land next to the existing error-key clusters — typed errors are P0, not P2.
- P2 (same PR, separate commit): LET/LETS help entries in `FormulaModal.ts` `FUNCTIONS` under `formula.catLogic` (examples use fork `**`/`pow`, never Notion `^`) and 3-locale i18n help keys (`formula.fn.LET.desc` / `formula.fn.LETS.desc` only — the error keys are NOT in this commit).

### Out of Scope
- `SafeEval.ts` — byte-identical by construction (do NOT touch).
- The ruled-out designs: a context function receiving a pre-evaluated expr; string-body `let("rate", 0.05, "amount * rate")`; a flat single-arrow `__let((a, b) => expr, v1, v2)` (breaks sequential binding); any special case inside SafeEval's Call evaluator.
- Bases method-chaining dialect (`BaseExpression.ts`) — routed away by `expressionSyntax === "base"` (`ComputedEvaluator.ts:50-54`).
- Persistent or stored named variables across fields or rows.
- Any write behavior — let/lets stay evaluation-only (iCloud-safe, rollup display-only).
- Lazy `if`/`ifs`, static typing/unbound-name errors, and Notion-style method chaining on bound values — parent-backlog items, explicitly not decided here.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Fork `src/data/LetVariables.ts` | Add | Pure `transformLetCalls()` + optional `registerLetHelper(context)` |
| Fork `src/data/ComputedField.ts` | Modify | Import + insert transform in `evaluateExpressionDetailed` (~428-448) **inside the existing try** (no statement-mode retry on transform failure); register `__let` near `iferror` (~294-304); map transform errors in `formatEvaluationError` (~511-547) |
| Fork `src/__tests__/setup.ts` | Add | Vitest setup — minimal `globalThis.moment` (or `vi.stubGlobal`) for `parseMoment`/`today`; no full Obsidian API mock — harness bootstrap |
| Fork `package.json` | Modify | Add `"test": "vitest run"` script |
| Fork `src/data/__tests__/LetVariables.test.ts`, `src/data/__tests__/ComputedField.let.test.ts` | Add | Pure-transform (written before wiring) + engine 18-case coverage |
| Fork `src/i18n.ts` | Modify (core commit, P0) | Add `formula.error.letArgCount` / `formula.error.letName` in en / zh-CN / zh-TW next to existing error-key clusters (~1175 / ~2647 / ~4165) |
| Fork `src/views/modals/FormulaModal.ts` (`FUNCTIONS` ~60-105), `src/i18n.ts` (help keys) | Modify (P2, separate commit) | LET/LETS help entries under `formula.catLogic` + `formula.fn.LET.desc` / `formula.fn.LETS.desc` (3 locales); error keys are NOT in this commit |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `let(name, value, expr)` / `lets(...)` are rewritten by `transformLetCalls` into nested `__let((name) => body, value)` calls; the body evaluates in a child binding scope created by SafeEval's Arrow evaluator | `let("rate", 0.05, amount * rate)` returns `amount * 0.05`; `rate` is not visible after the call |
| REQ-002 | Multi-var bindings emit nested `__let` (one per pair, folded right-to-left) so values evaluate sequentially, left-to-right, each seeing earlier names of the same call; inner bindings shadow outer ones | `lets("a", 1, "b", a + 1, a + b)` returns 3; `let("lastName","Luffy","Monkey D. "+let("lastName","Garp",lastName))` returns `"Monkey D. Garp"` |
| REQ-003 | The binding is strictly child-scoped | A formula referencing the name outside the let/lets expression fails exactly as an unknown identifier does today |
| REQ-004 | `SafeEval.ts` is byte-identical after implementation | `git diff --exit-code -- src/data/SafeEval.ts` reports no changes |
| REQ-005 | Malformed calls surface transform-side typed errors, not a transformed-form `unexpectedToken`: odd argc < 3 → `formula.error.letArgCount`; name not a quoted identifier → `formula.error.letName` | `lets("a", 1)` raises `letArgCount`; `let(5, 1, 2)`, `let("a b", 1, 2)`, and `let("if", 1, 2)` raise `letName`; `let("let", 5, let + 1)` is allowed (`let` is a plain Ident, not a tokenizer keyword) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-006 | Existing formulas without a bare `let(`/`lets(` behave identically — the transform is a pure pass-through, giving a byte-identical evaluation path | Full regression matrix shows zero changes to existing results |
| REQ-007 | Isolated-diff model on the EuroFormat pattern, relaxed per the synthesis default: diff confined to `ComputedField.ts` + new `LetVariables.ts` + tests (+ harness `setup.ts`/`package.json`); `FormulaModal.ts`/`i18n.ts` land as a separate P2 commit | `git diff --stat` shows only the scoped files; minimal rebase-friendly edits; phase-004 regions untouched |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The 18-case matrix passes, reproducing the official Notion examples (`"Hello, Alan!"`, `50` via `round(pi * radius ** 2, 0)` with fork `**` (not `^`) and `pi` as a number constant, `"Hello world"`, `12`) plus shadowing, nesting, sequential binding, and error paths. Case 16 uses uppercase `IF(...)` (the fork has no lowercase `context.if`); case 17 (`sqrt`) is gated on phase 004 merging and skipped otherwise — the transform and cases 1–16 + 18 ship without 004.
- **SC-002**: The regression check passes with a 0 delta against the pre-change baseline — provable because the vitest harness is bootstrapped in this phase.
- **SC-003**: `git diff --exit-code -- src/data/SafeEval.ts` exits 0 (untouched).
- **SC-004**: The core diff touches only `ComputedField.ts`, `LetVariables.ts`, `i18n.ts` (error keys), tests, and harness files; the P2 commit adds `FormulaModal.ts` + `i18n.ts` help keys.

### Acceptance Scenarios

- **Scenario 1**: **Given** a formula using `let("rate", 0.05, amount * rate)`, **when** the computed field evaluates, **then** the result equals `amount * 0.05` and `rate` is undefined after evaluation.
- **Scenario 2**: **Given** a formula using `lets("a", 1, "b", a + 1, a + b)`, **when** it evaluates, **then** the result is 3 — proving sequential left-to-right binding — and neither `a` nor `b` leaks into the outer scope.
- **Scenario 3**: **Given** phase 004 (IF/SWITCH/MATH) is merged, **when** a formula mixes `if` and `let`, **then** both features compose in one expression (with the documented caveat that the fork's eager `IF` evaluates both branches — pre-existing engine behavior, not a let defect).
- **Scenario 4**: **Given** a rollup display field whose formula uses `let`, **when** the rollup renders, **then** results are display-only with no writes (iCloud-safe).

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Phase `004-formula-ifs-switch-math` merges first on `createContext` | Merge/rebase churn in `ComputedField.ts` | Default ordering per synthesis: 004 merges first; 005 then adds `__let` near `iferror` and hooks `evaluateExpressionDetailed` (which 004 does not touch). Composition tests wait on 004; the transform itself does not |
| Risk | Verification gap — the fork has vitest configured but zero `*.test.ts` files, no `setup.ts`, no `test` script | SC-002's 0-delta gate is unprovable | Bootstrap the harness first (backlog item 5); structural pass-through of the transform reduces interim regression risk by construction |
| Risk | Security ordering — the transform emits `=>` which the security check bans | Sandbox bypass concern | Locked order: `validateFormulaSecurity` runs on the user string first (blocks `=>`); the transform is trusted code on already-scanned text, mirroring the existing `normalizeFormula` precedent. Direct user `__let(...)` with arrows stays blocked |
| Risk | Built-in collision (`let("round", 5, round(3.14))`) | Confusing errors | Expected and correct: the child own-prop shadows the built-in; calling `5` surfaces `formula.error.notFunction` via the standard path |
| Risk | Notion divergence on unbound/self-referencing names (`let("a", a, a)` with no field `a`) | Formulas behave differently than in Notion | Accepted default: caller-scope resolution → `undefined`/`NaN`, consistent with existing Ident semantics (`SafeEval.ts:935-936`); divergence noted on the parent parity backlog, no special check in 005 |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Formulas without let/lets take the same evaluation path as today (no measurable regression) — satisfied by construction: the transform is a byte-identical pass-through when no bare `let(`/`lets(` is present.

### Security
- **NFR-S01**: Sandbox integrity — the user-facing `=>` ban holds; arrows exist only in trusted transformed text; `SafeEval.ts` untouched.
- **NFR-S02**: No telemetry, network calls, or secret handling introduced.

### Reliability
- **NFR-R01**: Evaluation is deterministic — one fresh `Object.create` child scope per Arrow; no shared mutable state, so concurrent renders are isolated.

### Mobile & Forkability
- **NFR-M01**: Mobile-safe — pure in-memory evaluation, no desktop-only APIs, no `fs`/DOM/network/timers.
- **NFR-F01**: MIT-forkable and rebase-friendly — new EuroFormat-style module + two localized `ComputedField.ts` call-site edits; rollback is `git checkout` of `ComputedField.ts` + deleting `LetVariables.ts`.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- Self-reference `let("a", a, a)` with no field `a` → value resolved in the caller scope → `undefined`/`NaN`, no throw (engine-uniform; Notion would type-error — divergence documented).
- Deeply nested let/lets chains → one fresh `Object.create` per Arrow; no shared mutable state; concurrent renders safe.
- `[amount]` / `field("amount")` inside the body → works; `normalizeFormula` runs before the transform.

### Error Scenarios
- `lets("a", 1)` / any even argc → `formula.error.letArgCount` (transform-side, not a transformed-form token error).
- `let(5, 1, 2)` / `let("a b", …)` / empty name → `formula.error.letName`.
- Name matching a SafeEval tokenizer keyword (`let("if", 1, 2)`, `let("true", 1, 2)`, `let("return", 1, 2)`) → `formula.error.letName` — keyword names tokenize as `TT.If`/`TT.True` etc., not `TT.Ident`, so the transformed form would otherwise throw `unexpectedToken` on commas the user never wrote. `let("let", 5, let + 1)` is allowed (`let` is a plain Ident, not a keyword).
- Name colliding with an engine built-in → child shadows it; misuse surfaces the standard `notFunction` error; outer behavior unchanged.
- Direct user `__let((a) => a, 5)` → blocked by the `=>` security check; `__let` stays internal.

### Scanner Safety (no false rewrites)
- `let("a", "x,y", a)` — commas inside string literals do not split arguments.
- `"let("` inside strings/templates — skipped by the literal-aware scan (escapes honored).
- `obj.let(` — member-access exclusion: an identifier preceded by `.` is a method call, not LET.
- `let("let", 5, let + 1)` → `6` (confusing but valid; `let` is a plain Ident, not a keyword — no extra ban).

### Composition
- `IF(amount>50, let(...), 0)` → correct result; **both** branches evaluate (pre-existing eager `IF`, documented divergence). Use uppercase `IF(...)` — the fork has no lowercase `context.if` (tokenizer emits `TT.If`, `parseIfStatement` expects `if (test) cons else alt`, not comma-call form).
- Value-position `let("a", let("b", 1, b + 1), a)` → the inner `let` rewrites because the transform recurses on every arg, not only the body.
- Formulas with no `let(`/`lets(` → byte-identical path.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 12/25 | One new module + two call-site edits + harness bootstrap, on the core engine surface |
| Risk | 8/25 | Trusted-transform security ordering; sandbox adjacency |
| Research | 5/20 | Complete — semantics, feasibility, and edge cases settled across 10 iterations |
| **Total** | **25/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

All research UNKNOWNs are resolved; remaining items are operator decisions with synthesis defaults:

- **REQ-007 relaxation** — default adopted: diff = `ComputedField.ts` + `LetVariables.ts` + tests; inlining the scanner in `ComputedField.ts` is rejected as the worse rebase.
- **Harness bootstrap in 005** — default adopted: yes; deferring leaves DoD blocked.
- **FormulaModal + i18n** — default adopted: same PR, second commit; no new `formula.catVars` category; `__let` undocumented; examples use `**`/`pow`.
- **Self-reference/unbound names** — default adopted: no special check; note the divergence on the parent parity backlog.
- **`__let` registration shape** — default adopted: exported `registerLetHelper(context)` called near `iferror`.
- **Phase 004 ordering** — default adopted: 004 merges first.

Explicitly out of scope (parent backlog): lazy `if`/`ifs`; static typing; Notion method-chaining on bound values; Bases dialect; any `SafeEval.ts` edit.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research**: `research/synthesis.md` (ranked findings) · `research/research.md` (full evidence trail)

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-let-variables-module/ | New `LetVariables.ts` nested `__let` transform (let+lets, sequential binding, transform-side validation) plus two ComputedField call sites and P0 `formula.error.let*` i18n | Complete |
| 2 | 002-let-vitest-matrix/ | Bootstrap vitest `setup.ts`/`test` script, pure-transform tests, and the corrected 18-case engine matrix | Complete |
| 3 | 003-formula-modal-let-help/ | P2 FormulaModal LET/LETS help under `formula.catLogic` plus `formula.fn.LET.desc`/`LETS.desc` in three locales | Complete |

Future / out of this phase (not child folders): lazy `if`/`ifs` (synthesis rank 7); unbound identifiers / static typing (rank 8); Notion method-chaining on bound values; Bases dialect; any `SafeEval.ts` edit.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-let-variables-module | 002-let-vitest-matrix | `LetVariables.ts` exports `transformLetCalls` and `registerLetHelper`; `evaluateExpressionDetailed` runs the transform inside the existing try; `__let` is registered near `iferror`; `formula.error.letArgCount` / `letName` exist in en / zh-CN / zh-TW; `SafeEval.ts` untouched | `let("rate", 0.05, amount * rate)` evaluates; `lets("a", 1)` maps to `letArgCount` not `unexpectedToken`; `git diff --exit-code -- src/data/SafeEval.ts` empty |
| 002-let-vitest-matrix | 003-formula-modal-let-help | `npx vitest run` green on `LetVariables.test.ts` plus in-scope `ComputedField.let.test.ts` (cases 1–16 + 18; case 17 only if 004 merged); `"test": "vitest run"` exists; `setup.ts` exists | SC-001 in-scope cases; SC-002 0-delta on `round(3.14, 2)`; FormulaModal still has no LET/LETS rows |
<!-- /ANCHOR:phase-map -->
