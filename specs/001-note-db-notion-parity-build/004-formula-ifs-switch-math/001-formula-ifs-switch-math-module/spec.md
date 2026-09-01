---
title: "Feature Specification: Formula IFS/SWITCH Math Module"
description: "One module write: FormulaIfsSwitchMath.ts with IFS, SWITCH, SQRT/LN/LOG10/EXP/CBRT, and Excel LOG, plus the P0 Object.assign spread into ComputedField createContext."
trigger_phrases:
  - "formula ifs switch math"
  - "FormulaIfsSwitchMath"
  - "excel log"
  - "ifs varargs"
  - "switch varargs"
  - "math aliases"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/004-formula-ifs-switch-math/001-formula-ifs-switch-math-module"
    last_updated_at: "2026-08-27T12:27:53Z"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Formula IFS/SWITCH Math Module

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | In Progress |
| **Created** | 2026-08-25 |
| **Branch** | `004-formula-ifs-switch-math` |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 3 |
| **Predecessor** | None |
| **Successor** | 002-formula-modal-i18n-discovery |
| **Handoff Criteria** | Module plus ComputedField spread land together; unary LOG is log10; SafeEval.ts diff empty |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 1 of 3** — Parent: [`../spec.md`](../spec.md) · Successor: `002-formula-modal-i18n-discovery`. Independent of phase `003-reports-computed-fields` (vault YAML vs fork TS). Unblocks FormulaModal discovery once `formulaIfsSwitchMathHelp` exists.

This child is the **one module write** from `research/final-plan.md` steps 2–3 and synthesis ranks 1–4. IFS, SWITCH, the five 1:1 aliases, and Excel `LOG` land in the same file. Do not ship aliases without `LOG`. Do not ship the module without the `ComputedField.ts:310-378` spread.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The fork already evaluates `IF` (`ComputedField.ts:325`), exposes `Math` on eval scope (`:433-437`), and dual-names `POWER`/`POW` (`:372-373`), but Notion `ifs(cond, val, …, [else])` is absent and the Excel-style names `SQRT` / `LN` / `LOG10` / `EXP` / `CBRT` are missing even though raw `Math.*` works. A naïve `LOG: Math.log` silently equals `LN` because JS `Math.log` is ln.

### Purpose
Create one EuroFormat-shaped leaf `src/data/FormulaIfsSwitchMath.ts` (`EuroFormat.ts:1-10` header precedent, zero `obsidian` imports) exporting `formulaIfsSwitchMath` and `formulaIfsSwitchMathHelp`, and spread the runtime table **inside** the existing UPPERCASE `Object.assign` at `ComputedField.ts:310-378` beside `IF`/`AND`/`OR`.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- New module `src/data/FormulaIfsSwitchMath.ts`: **IFS** walks `cond,val` pairs; first JS-truthy cond wins (same truthiness as `IF` at `ComputedField.ts:325`); odd arity → trailing default; fewer than one pair or no match → `null` (no `console.warn`).
- **SWITCH**: `expr` then `pat,val` with strict `===`; odd rest → trailing default; no match / no default / no pair → `null`. Case-sensitive (`"Month" !== "month"`).
- **Aliases** with `Number(...)` like `ROUNDUP` (`ComputedField.ts:314-315`): `SQRT→Math.sqrt`, `LN→Math.log`, `LOG10→Math.log10`, `EXP→Math.exp`, `CBRT→Math.cbrt`.
- **LOG(n, b?)**: test `b == null` **before** `Number(b)` (`Number(null)===0` would take the two-arg path); unary → `Math.log10(Number(n))`; two-arg → `Math.log(n)/Math.log(b)`. Never `LOG: Math.log`.
- UPPERCASE keys only. Do not register lowercase `ifs`/`switch`/`if` (`RESERVED` contains `"if"` and `"switch"` at `ComputedField.ts:93-98`; the gate blocks `function`/`=>` at `:500-506`).
- Help rows on the same export: Logic for IFS/SWITCH, Math for the six aliases. Examples: `=IFS([income]<=69715, 0.14, [income]<=150000, 0.30, 0.36)` and `=SWITCH(UPPER([period]), "MONTH", [amount], "QUARTER", [amount]*3, 0)`. Document `field("x")` / `IFERROR` / `?:` as the eager-branch workaround.
- Call site 1 (P0): import next to `ComputedField.ts:1-8`; spread `...formulaIfsSwitchMath` **inside** the existing `Object.assign` at `:310-378`. Do not add a second assign. Precedence unchanged (`:139-147, 306-310`).
- Inherit eager Call args (`SafeEval.ts:985-1018`). Do not edit `SafeEval.ts`. Cond/`&&`/`||`/`??` already short-circuit (`:949-982`).

### Out of Scope
- FormulaModal `FUNCTIONS` concat and i18n keys (child `002-formula-modal-i18n-discovery`).
- Vitest harness (child `003-computed-formulas-vitest`; may start in parallel once this module exists).
- `LOG2` (synthesis rank 7; outside the six-name freeze).
- Tokenizer / `extractDependencies` edits (`FormulaTokenizer.ts:175`; `ComputedField.ts:411`).
- Lowercase registrations; AppFlowy/Anytype formula precedent; rollup expansion; successor LET/variables.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/FormulaIfsSwitchMath.ts` | Create | Runtime table + help rows; zero `obsidian` imports; EuroFormat header |
| `src/data/ComputedField.ts` | Edit | Import plus spread inside `Object.assign` at `:310-378` |
| `src/data/SafeEval.ts` | No change (verify) | Empty diff against upstream base |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | IFS and SWITCH evaluate from computed fields | First JS-truthy IFS pair wins (`ComputedField.ts:325`); SWITCH uses `===`; empty / &lt;1 pair / no match without default → `null` with no `console.warn` |
| REQ-002 | `SafeEval.ts` is untouched | `git diff <upstream-base> -- src/data/SafeEval.ts` is empty; eager Call args inherited (`:985-1018`) |
| REQ-003 | Math aliases plus Excel LOG | SQRT/LN/LOG10/EXP/CBRT match `Math.*` after `Number()`; `LOG(100)===2` and `LOG(8,2)===3`; unary LOG is **not** `Math.log`; `b == null` tested before `Number(b)` |
| REQ-004 | EuroFormat engine footprint | One new module plus one spread inside the existing `Object.assign` (`ComputedField.ts:310-378`); tokenizer, `ComputedEvaluator`, rollups, and views other than the later FormulaModal child stay untouched |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Wrappers are pure compute | No `Platform`, no `obsidian` imports in the module, no network, no telemetry, no frontmatter writes |
| REQ-006 | Help export is ready for discovery | `formulaIfsSwitchMathHelp` lists eight names (IFS, SWITCH, SQRT, LN, LOG, LOG10, EXP, CBRT) so child 002 can concat at `FUNCTIONS` init without duplicating names |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `IFS(...)` and `SWITCH(...)` resolve from `createContext`; unmatched / empty inputs yield `null`, not `formula.error.notFunction` (`ComputedField.ts:527-530`).
- **SC-002**: `LOG(100)` is 2 (log10), not `Math.log(100)`; `LN(Math.E)` is about 1.
- **SC-003**: `SafeEval.ts` diff is empty; no lowercase `ifs`/`switch` keys.
- **SC-004**: IEEE domain: `SQRT(-1)` NaN, `LN(0)` `-Infinity`, `LOG(n,1)` non-finite; display already maps non-finite to `-` (`EuroFormat.ts:30-31`).

### Acceptance Scenarios

- **Given** a tax-bracket `IFS` over three thresholds, **when** the field evaluates, **then** the correct bracket is selected for boundary incomes.
- **Given** `SWITCH(UPPER([period]), "MONTH", [amount], "QUARTER", [amount]*3, 0)`, **when** the field evaluates, **then** matching is strict `===` (`"Month" !== "month"`).
- **Given** each alias, **when** evaluated, **then** `SQRT(9)` is 3, `LOG(100)` is 2, and domain violations stay IEEE.
- **Given** the finished engine diff, **when** reviewed, **then** `SafeEval.ts` is unchanged.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | `LOG: Math.log` | Silently duplicates `LN` | Ship Excel log10 with optional base in the same write as the other aliases |
| Risk | Module without the spread | Names exist on disk but `IFS` still TypeErrors | Same-diff REQ-004 |
| Risk | Editing `SafeEval.ts` for Notion-lazy `ifs` | Sandbox boundary erosion | Inherit eager Call; document `field("x")` / `IFERROR` / `?:` |
| Dependency | None on phase 003 | — | 003 is vault YAML; start whenever the fork is free |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults from parent research: unary `LOG` = `Math.log10`; SWITCH is strict `===`; unmatched dispatch returns `null` with no `console.warn`; lowercase names stay unregistered; `LOG2` is deferred.
<!-- /ANCHOR:questions -->
