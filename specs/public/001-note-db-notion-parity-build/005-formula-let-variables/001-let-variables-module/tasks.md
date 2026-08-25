---
title: "Tasks: Let Variables Module"
description: "Atomic task list for LetVariables.ts (nested __let, sequential lets, let/lets identity, transform-side validation) plus ComputedField wiring and P0 error i18n."
trigger_phrases:
  - "let variables tasks"
  - "LetVariables"
  - "transformLetCalls"
  - "registerLetHelper"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/005-formula-let-variables/001-let-variables-module"
    last_updated_at: "2026-08-25T21:30:00Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Let Variables Module

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

T003–T006 are **one atomic diff** (core commit). Do not ship the module without both call sites and the two error keys. Sequential binding, `let`/`lets` identity, and name/argc validation are the same scanner as T003 — not extra tasks.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read parent `research/synthesis.md` ranks 1–4 plus locked design (no `context.let`, no IIFE, no flat `__let`) and `research/final-plan.md` steps 0, 3, 5–7 (scanner contract, eval try, error map, `registerLetHelper`) [15m]
- [ ] T002 Confirm live fork: `ComputedField.ts:135-380` (`createContext`, `iferror` `:294-304`, UPPERCASE `:310-378`), `:421-547` (eval + security `:504-506` + `formatEvaluationError`), `:549-555` (`normalizeFormula`), `SafeEval.ts:1010-1050`, `:824-838`, `:826-828`, `:935-936`, `:258-272`; record whether 004 `sqrt` exists [10m]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T003 **Create `src/data/LetVariables.ts`**: EuroFormat header (`EuroFormat.ts:1-42`); zero `obsidian` imports; export `transformLetCalls(formula: string): string` and `registerLetHelper(context)`. Scanner: depth over `(`/`[`/`{`; skip `"…"`, `'…'`, `` `…` `` with `\`; match `\blets\s*\(` before `\blet\s*\(`; non-ident left boundary and no preceding `.`. Split args at depth-1 commas. Recurse transform on **every** arg. Validate: odd argc ≥ 3 else `Error` prefix `let:argCount`; each name a quoted IDENT_RE **and not** `{true,false,null,undefined,typeof,if,else,return}` else `let:name`. Emit right-to-left nested `__let((name) => body, value)`. Pass-through if no bare let/lets. `let("let", 5, let + 1)` allowed (`SafeEval.ts:258-269`) (`src/data/LetVariables.ts`) [M]
- [ ] T004 **Call site 1** — same diff as T003: `import { transformLetCalls } from "./LetVariables"`; after security pass, **inside** the existing try at `evaluateExpressionDetailed` (`ComputedField.ts:428-448`): `transformedExpr = transformLetCalls(normalizedExpr)`; both `safeEval` calls (`:441`, `:447`) use `transformedExpr`. Catch transform errors **before** the `allowStatements` fallback (`src/data/ComputedField.ts:428-448`) [S]
- [ ] T005 **Error map + i18n (P0, core commit)** — same diff as T003: `formatEvaluationError` (`ComputedField.ts:511-547`) maps `let:argCount` → `t("formula.error.letArgCount")`, `let:name` → `t("formula.error.letName")`. Add those two keys in en / zh-CN / zh-TW next to existing error clusters (`i18n.ts` ~1175 / ~2647 / ~4165). Help keys `formula.fn.LET.desc` stay in child 003 (`src/data/ComputedField.ts:511-547`, `src/i18n.ts`) [S]
- [ ] T006 **Call site 2** — same diff as T003: `registerLetHelper(context)` from `createContext` immediately after `iferror` (`ComputedField.ts:294-304`). `__let: (fn, ...vals) => fn(...vals)`. Do **not** edit `:310-378`. Do **not** add `__let` to FormulaModal (`src/data/ComputedField.ts:294-304`) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T007 Confirm a well-formed `let` evaluates through `__let`; `lets("a", 1)` maps to `letArgCount`; `let("if", 1, 2)` maps to `letName`; direct user `__let((a) => a, 5)` still blocked by `:504-506`; `git diff --exit-code -- src/data/SafeEval.ts` empty; `:310-378` and FormulaModal untouched [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] T003–T006 shipped as one diff
- [ ] Manual verification of T007 passed
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` ranks 1–4
- **Parent final-plan**: `../research/final-plan.md` steps 0, 3, 5–7
<!-- /ANCHOR:cross-refs -->
