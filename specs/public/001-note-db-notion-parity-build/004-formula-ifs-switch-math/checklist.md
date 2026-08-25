---
title: "Verification Checklist: Formula IFS/SWITCH + Math Function Aliases"
description: "Verification checklist for the phase 004 formula additions: wrapper/alias semantics, sandbox boundary, editor discovery, display-only/mobile/iCloud safety."
trigger_phrases:
  - "ifs"
  - "switch"
  - "sqrt"
  - "math aliases"
  - "checklist"
  - "verification"
  - "computed field"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "markdown"
    recent_action: "Reconciled checklist with final-plan review findings"
    next_safe_action: "Build phase 004 per reconciled tasks"
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
# Verification Checklist: Formula IFS/SWITCH + Math Function Aliases

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

- [ ] CHK-001 [P0] Requirements documented in spec.md and match the synthesis verdict [EVIDENCE: pending — spec.md rewrite]
  - **Evidence**: `spec.md` records the module + three call sites scope, the Excel LOG amendment, REQ-001..008, NFRs, and the synthesis edge-case table.
- [ ] CHK-002 [P0] Technical approach defined in plan.md and matches the locked design [EVIDENCE: pending — plan.md rewrite]
  - **Evidence**: `plan.md` records `FormulaIfsSwitchMath.ts` plus call sites at `ComputedField.ts:310-378`, `FormulaModal.ts:60-105`, and `i18n.ts`, with gates, testing, and rollback.
- [ ] CHK-003 [P1] Dependencies identified and available [EVIDENCE: pending — fork + upstream base commit]
  - **Evidence**: Fork codebase and upstream base commit are recorded before implementation starts.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: pending — plugin lint run]
  - **Evidence**: `npm run lint` exits 0 on the new module and the three call sites (ignores `src/__tests__/**`); pre-existing formulas still evaluate identically (purely additive regression).
- [ ] CHK-011 [P0] No console errors or warnings from the new functions [EVIDENCE: pending — evaluation spot-checks]
  - **Evidence**: No-match dispatch returns `null` without `console.warn`; only pre-existing engine warns appear.
- [ ] CHK-012 [P0] Sandbox boundary preserved [EVIDENCE: pending — SafeEval.ts zero diff]
  - **Evidence**: `git diff <upstream-base> -- src/data/SafeEval.ts` is empty; the no-arrow/no-loop/no-eval gate holds; argument eagerness inherited, no AST special-casing.
- [ ] CHK-013 [P1] Code follows project patterns [EVIDENCE: pending — module + call-site review]
  - **Evidence**: Pure module with zero `obsidian` imports (EuroFormat isolated-diff model); one additive `Object.assign` spread beside `IF`/`AND`/`OR`; help rows concatenated at the `FUNCTIONS` declaration (not pushed later); append-only i18n rows.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All P0 acceptance criteria met [EVIDENCE: pending — REQ-001 through REQ-004]
  - **Evidence**: `spec.md` REQ-001 through REQ-004 pass with recorded command output, including the scaffolded vitest suite run via `npx vitest run` (the fork's `package.json` has no test script) — SC-001.
- [ ] CHK-021 [P0] Wrapper scenarios tested [EVIDENCE: pending — vitest + scratch vault]
  - **Evidence**: Three-bracket tax IFS incl. boundary incomes; monthly-vs-quarterly SWITCH under strict case-sensitive matching; both recorded.
- [ ] CHK-022 [P0] Empty/default edge cases return null, not errors [EVIDENCE: pending — unit tests]
  - **Evidence**: Empty args / <1 pair → `null` for both wrappers; trailing defaults honored for odd arity (`IFS`) and odd-count-after-`expr` (`SWITCH`); no `console.warn` on unmatched input (distinct from failed eval's warn+null).
- [ ] CHK-023 [P1] Math domain edges render as `-` [EVIDENCE: pending — unit tests + display check]
  - **Evidence**: `SQRT(-1)` → NaN, `LN(0)` → `-Infinity`, `LOG(n,1)` → NaN; non-finite values display as `-` via `formatEuroNumber`; non-numeric strings coerce to NaN via `Number(...)`.
- [ ] CHK-024 [P1] Eager losing branches behave per contract [EVIDENCE: pending — unit tests]
  - **Evidence**: Bracket-ref miss in a losing branch returns `undefined` without throwing; bare missing identifier nulls the field; documented workarounds (`field("x")`, `IFERROR`, ternary) appear in IFS/SWITCH help examples — `SafeEval.ts` is not edited to get Notion-lazy `ifs`.
- [ ] CHK-025 [P1] Pre-phase formulas unchanged (purely additive) [EVIDENCE: pending — regression run]
  - **Evidence**: Pre-existing formulas evaluate identically; before landing, `IFS(...)` produced the localized unknown-function error and still would after rollback.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-030 [P0] Module contains wrappers, aliases, and help rows [EVIDENCE: pending — module review]
  - **Evidence**: `IFS`/`SWITCH` plus SQRT/LN/LOG10/EXP/CBRT and base-10 `LOG(n,b?)` all live in `src/data/FormulaIfsSwitchMath.ts`; uppercase-only registration.
- [ ] CHK-031 [P0] LOG semantics are Excel-correct [EVIDENCE: pending — spot-check]
  - **Evidence**: `LOG(100) === 2` (log10), `LOG(8, 2) === 3` (base formula); `LOG` is NOT registered as `Math.log`; `LOG(n, b?)` tests `b == null` BEFORE `Number(b)` (the `Number(null)===0` two-arg trap is guarded).
- [ ] CHK-032 [P1] Editor discovery complete [EVIDENCE: pending — FormulaModal inspection]
  - **Evidence**: New names autocomplete, `NAME(` renders as a function token, and all eight `formula.fn.<NAME>.desc` keys (`IFS`, `SWITCH`, `SQRT`, `LN`, `LOG`, `LOG10`, `EXP`, `CBRT`) exist in en, zh-CN, and zh-TW; help rows concatenated at the `FUNCTIONS` declaration.
- [ ] CHK-033 [P1] No out-of-scope files changed [EVIDENCE: pending — fork diff stat]
  - **Evidence**: Diff touches only the new module, the three call sites, the test scaffolding, and this phase's docs; tokenizer/rollups/views untouched; T016 `LOG2` remains deferred `[B]`.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-040 [P0] Sandbox security boundary intact [EVIDENCE: pending — SafeEval.ts empty diff]
  - **Evidence**: The no-arrow/no-loop/no-eval gate is byte-identical before and after.
- [ ] CHK-041 [P0] No hardcoded secrets [EVIDENCE: pending — diff review]
  - **Evidence**: Final diff review finds no credential-shaped values.
- [ ] CHK-042 [P1] Uppercase-only registration keeps RESERVED effective [EVIDENCE: pending — name audit]
  - **Evidence**: No lowercase `ifs`/`switch`/`if` entries; frontmatter keys named like the new builtins are overridden exactly as `IF`/`ABS` are today; lowercase field `switch` stays filtered by `RESERVED`.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:mobile-cloud -->
## Display-Only / Mobile / iCloud Safety

- [ ] CHK-050 [P0] Wrappers are pure compute — mobile-safe [EVIDENCE: pending — import audit]
  - **Evidence**: No `Platform`, no `obsidian` APIs, no network, no telemetry in the module; the same `createContext` path runs on desktop and mobile builds.
- [ ] CHK-051 [P0] Evaluation is read-only over loaded field data [EVIDENCE: pending — diff review]
  - **Evidence**: No frontmatter writes, no file churn introduced by the new functions; iCloud sync sees no extra writes from them.
- [ ] CHK-052 [P1] Rollups remain display-only and unexpanded [EVIDENCE: pending — RelationRollup.ts zero diff]
  - **Evidence**: `RelationRollup.ts` still supports exactly `count|sum|avg|list` and nothing in this phase changes its display-only contract.
- [ ] CHK-053 [P1] Determinism holds (NFR-R01) [EVIDENCE: pending — repeated-run check]
  - **Evidence**: Identical inputs produce identical outputs across runs; wrappers contain no clock/random coupling.

<!-- /ANCHOR:mobile-cloud -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-060 [P1] Spec/plan/tasks synchronized [EVIDENCE: pending — build-time sync]
  - **Evidence**: `spec.md`, `plan.md`, and `tasks.md` describe the same module-plus-call-sites change with matching LOG and discovery decisions.
- [ ] CHK-061 [P1] Code comments carry durable WHY only [EVIDENCE: pending — comment review]
  - **Evidence**: No spec paths, phase numbers, or requirement/task ids appear in code comments.
- [ ] CHK-062 [P2] README updated (if applicable) [EVIDENCE: pending — fork README]
  - **Evidence**: Update the fork README only if it enumerates formula functions.
- [ ] CHK-063 [P1] Spec amendments recorded in implementation summary [EVIDENCE: pending — summary Decisions anchor]
  - **Evidence**: The LOG-as-log10 amendment to REQ-003, the P1 discovery inclusion, strict `===`, LOG2 deferral, and null-on-no-match default are all recorded.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-070 [P1] Temp files in scratch/ only [EVIDENCE: pending — folder inventory]
  - **Evidence**: Evaluation scratch files live under the fork's scratch area, not in the phase folder.
- [ ] CHK-071 [P1] scratch/ cleaned before completion [EVIDENCE: pending — final inventory]
  - **Evidence**: No scratch residue remains in the phase folder or fork at completion.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 10 | 0/10 |
| P1 Items | 11 | 0/11 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-08-24
**Verified By**: Pending — planning stage, no implementation yet

<!-- /ANCHOR:summary -->
