---
title: "Verification Checklist: Formula LET/LETS Variables"
description: "Verification checklist for the Formula LET/LETS phase: 18-case matrix, transform edge cases, display-only/mobile/iCloud safety, sandbox integrity; all items pending."
trigger_phrases:
  - "let variable"
  - "lets variable"
  - "formula let"
  - "checklist"
  - "formula engine verify"
  - "notion parity check"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/005-formula-let-variables"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "markdown"
    recent_action: "Applied final-plan.md review findings"
    next_safe_action: "Verify CHK-001/CHK-002, then execute during build"
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
# Verification Checklist: Formula LET/LETS Variables

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] spec.md reflects the locked `__let`-transform design (not a createContext context function) [EVIDENCE: spec.md]
  - **Evidence**: Pending — rewritten against `research/synthesis.md`; re-verify at build start.
- [ ] CHK-002 [P0] plan.md names the new module (`src/data/LetVariables.ts`) and both exact call sites with pipeline order [EVIDENCE: plan.md]
  - **Evidence**: Pending — verify security check precedes the transform and both `safeEval` calls consume the transformed expression.
- [ ] CHK-003 [P1] Phase-004 dependency satisfied — merged on `createContext` before this phase lands [EVIDENCE: git log of ComputedField.ts]
  - **Evidence**: Pending — composition tests (matrix 16–17) wait on it.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Lint passes (`npm run lint`; `src/__tests__/**` is ignored by config) [EVIDENCE: lint output]
  - **Evidence**: Pending — no code written yet.
- [ ] CHK-011 [P0] Production build passes (`npm run build`) [EVIDENCE: build output]
  - **Evidence**: Pending — no code written yet.
- [ ] CHK-012 [P0] Transform-side validation implemented AND error i18n in the core commit: odd argc < 3 → `formula.error.letArgCount`; non-identifier name (or SafeEval tokenizer keyword: `true false null undefined typeof if else return`) → `formula.error.letName`; `let("let",5,let+1)` allowed; `formatEvaluationError` maps `let:argCount`/`let:name`; the two `formula.error.let*` keys exist in en / zh-CN / zh-TW next to the existing error-key clusters (NOT in the P2 commit — typed errors are P0) [EVIDENCE: LetVariables.test.ts + i18n.ts diff]
  - **Evidence**: Pending — validation tests (T005, T008) and error-key i18n not yet written or run.
- [ ] CHK-013 [P1] Code follows the EuroFormat isolated-module pattern: pure `LetVariables.ts` + minimal call-site edits; no scanner code inlined in `createContext` [EVIDENCE: git diff --stat]
  - **Evidence**: Pending — not yet verified.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met — REQ-001 through REQ-007 [EVIDENCE: 18-case matrix green]
  - **Evidence**: Pending — no tests run.
- [ ] CHK-021 [P0] Official Notion examples reproduce: `"Hello, Alan!"`, `50` via `round(pi * radius ** 2, 0)` (fork `**` not `^`; `pi` is a number constant not a function; `round(n, d)` requires digits), `"Hello world"`, `12` [EVIDENCE: matrix cases 8–10]
  - **Evidence**: Pending — no tests run.
- [ ] CHK-022 [P1] Synthesis edge cases tested: self-ref `let("a",a,a)` → undefined/NaN no throw; built-in collision → `notFunction`; nested access + inner shadowing; deep nesting isolated per Arrow; non-leakage proven inside one expression `let("rate",0.05,rate)+rate` → NaN no throw [EVIDENCE: matrix cases 5–7, 12, 15]
  - **Evidence**: Pending — edge-case tests not yet run.
- [ ] CHK-023 [P0] Scanner safety verified — no false rewrite for `let("a","x,y",a)`, `"let("` inside strings/templates, `obj.let(`, `let ("a",1,a)` (whitespace before `(`); `let("let",5,let+1)` = 6 accepted; value-position `let("a", let("b",1,b+1), a)` rewrites the inner `let` (recurse on every arg) [EVIDENCE: LetVariables.test.ts]
  - **Evidence**: Pending — no tests run.
- [ ] CHK-024 [P1] Sequential left-to-right binding proven: `lets("a",1,"b",a+1,a+b)` = 3 via nested emission (flat single-arrow would fail this case) [EVIDENCE: matrix case 4]
  - **Evidence**: Pending — no tests run.
- [ ] CHK-025 [P1] Composition with phase-004 features: `IF(amount>50, let(...), 0)` (uppercase `IF` — the fork has no lowercase `context.if`) correct result with documented eager both-branch caveat; `sqrt`/`pi` inside a let body (matrix case 17) gated on 004 merging — skipped without 004, transform and cases 1–16 + 18 ship without it [EVIDENCE: matrix cases 16–17]
  - **Evidence**: Pending — depends on T002/CHK-003.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-026 [P0] Feature implemented only in scoped files: `LetVariables.ts`, `ComputedField.ts`, `i18n.ts` (error keys, core commit), tests, harness (`setup.ts`, `package.json`); P2 commit confined to `FormulaModal.ts` + `i18n.ts` help keys only [EVIDENCE: git diff --stat]
  - **Evidence**: Pending — no source changes made yet.
- [ ] CHK-027 [P1] No-let formulas take a byte-identical path — `transformLetCalls` is a pass-through when no bare `let(`/`lets(` is present; regression delta is 0 vs baseline [EVIDENCE: matrix case 18 + baseline comparison]
  - **Evidence**: Pending — baseline captured in T003, comparison not yet run.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:safety -->
## Display-Only / Mobile / iCloud Safety

- [ ] CHK-030 [P0] Display-only confirmed — evaluation writes only the `evaluateComputedFields` result map (errors → `null`); no frontmatter write, no vault/`TFile` mutation anywhere in the let path [EVIDENCE: test review + diff review]
  - **Evidence**: Pending — verification not yet run.
- [ ] CHK-031 [P0] Mobile-safe — pure in-memory evaluation; no desktop-only APIs, no `fs`/DOM/network/timers introduced [EVIDENCE: diff review]
  - **Evidence**: Pending — verification not yet run.
- [ ] CHK-032 [P0] iCloud-safe rollups — `evaluateComputedFields` writes only a result map; errors → `null` in the result map; the let path adds no frontmatter/`TFile`/`fs`/network mutation. Proven by code review of `ComputedEvaluator.ts:29-78` + LetVariables exports (T011), NOT by a manual rollup screenshot — the rollup is not a unique let path [EVIDENCE: code review + diff review]
  - **Evidence**: Pending — T011 read-only confirmation not yet run.

<!-- /ANCHOR:safety -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-033 [P0] User-facing `=>` ban holds — `validateFormulaSecurity` runs on the user string BEFORE the transform; direct `__let((a) => a, 5)` from a formula stays blocked; `__let` unreachable for legitimate use [EVIDENCE: unit test + code review]
  - **Evidence**: Pending — ordering test not yet written.
- [ ] CHK-034 [P0] Sandbox intact — `git diff --exit-code -- src/data/SafeEval.ts` exits 0; no eval/arrows/loops added to user-facing syntax [EVIDENCE: git diff --exit-code]
  - **Evidence**: Pending — diff check not yet run.
- [ ] CHK-035 [P1] `__let` kept internal — not listed in FormulaModal FUNCTIONS/help; underscore-prefix signals do-not-call; no telemetry/secrets introduced [EVIDENCE: FormulaModal.ts review]
  - **Evidence**: Pending — verification not yet run.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/checklist synchronized with `research/synthesis.md`; research pointers reference this phase's `research/synthesis.md` + `research/research.md` (no stale 001-packet paths) [EVIDENCE: doc review]
  - **Evidence**: Pending — docs rewritten; re-verify after build updates evidence.
- [ ] CHK-041 [P1] Code comments carry durable WHY only (no task/spec-path labels) [EVIDENCE: diff review]
  - **Evidence**: Pending — comment-hygiene review not yet run.
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Not applicable unless the plugin docs enumerate engine features.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: no temp files]
  - **Evidence**: Pending — verify at completion.
- [ ] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: no scratch dir]
  - **Evidence**: Pending — verify at completion.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 14 | 0/14 |
| P1 Items | 11 | 0/11 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-08-24
**Verified By**: Not yet implemented (Planned)

<!-- /ANCHOR:summary -->
