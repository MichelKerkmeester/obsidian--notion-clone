---
title: "Feature Specification: Formula IFS/SWITCH + Math Function Aliases"
description: "Adds IFS/SWITCH varargs wrappers and SQRT/LN/LOG/LOG10/EXP/CBRT aliases to the note database formula engine's createContext function table."
trigger_phrases:
  - "ifs"
  - "switch"
  - "sqrt"
  - "ln"
  - "log10"
  - "math aliases"
  - "formula functions"
  - "computed field"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored; engine module first"
    next_safe_action: "Build 001-formula-ifs-switch-math-module per its plan.md and tasks.md"
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
# Feature Specification: Formula IFS/SWITCH + Math Function Aliases

> **Phase adjacency**: predecessor `003-reports-computed-fields`, successor `005-formula-let-variables`. Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-24 |
| **Branch** | `004-formula-ifs-switch-math` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The note database fork's native Excel-style formula engine already evaluates `IF`, exposes `Math` on the sandbox eval scope (`ComputedField.ts:433-437`), and already dual-names `POWER`/`POW` — but Notion's `ifs(cond, val, ..., [else])` branch chain is absent (users must hand-nest `IF`), and the common Excel-style math names `SQRT` / `LN` / `LOG10` / `EXP` / `CBRT` are missing even though raw `Math.*` works. A naïve `LOG: Math.log` would silently equal `LN` because JS `Math.log` is ln, contradicting the spreadsheet dialect where `LOG` is log10. This is the highest-value remaining gap in the formula surface per the ranked backlog in `research/synthesis.md`.

### Purpose
Build it, as named wrappers over an engine that needs no new evaluation machinery: lock a pure `src/data/FormulaIfsSwitchMath.ts` module (EuroFormat isolated-diff model, zero `obsidian` imports) and spread it into the existing UPPERCASE `createContext` table in `ComputedField.ts`. The sandbox (`SafeEval.ts`) is a security boundary — its no-arrow/no-loop/no-eval gate stays untouched, and its diff must remain empty. The single biggest risks are shipping the wrong `LOG` semantics and shipping engine-only so the new names never appear in FormulaModal autocomplete or highlighting. Nested children own the ordered slices: the module plus ComputedField spread first, then FormulaModal and i18n discovery, then the vitest harness.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `IFS` varargs wrapper: walk `cond,val` pairs, first truthy cond wins; odd arity means trailing default; no match returns `null`.
- `SWITCH` varargs wrapper: strict `===` pattern dispatch over `expr,pat,val,...`; odd remaining arity means trailing default; no match/no default returns `null`.
- Math aliases `SQRT`, `LN`, `LOG10`, `EXP`, `CBRT` (each `Number(...)`-coerced onto its `Math.*` member) plus `LOG(n, b?)` implemented as Excel/Sheets log10 with optional base — NOT `Math.log` (that is what `LN` is for).
- A new pure module `<fork>/src/data/FormulaIfsSwitchMath.ts` exporting a runtime function table plus modal help rows; uppercase names only (lowercase `ifs`/`switch` collide with `RESERVED` and the security gate's keyword block).
- Spread of the module into the `createContext` UPPERCASE table at `ComputedField.ts:310-378` beside `IF`/`AND`/`OR`.
- Editor discovery: append-only registration into FormulaModal `FUNCTIONS` (`FormulaModal.ts:60-105`) — help rows concatenated at the `FUNCTIONS` declaration (a `const` initialized once) so `FUNCTION_NAMES` and autocomplete see the new names — plus eight `formula.fn.<NAME>.desc` keys (`IFS`, `SWITCH`, `SQRT`, `LN`, `LOG`, `LOG10`, `EXP`, `CBRT`) appended to the en / zh-CN / zh-TW locale blocks in `src/i18n.ts` (24 strings total).
- Vitest scaffolding: `src/__tests__/setup.ts` (moment stub) and `src/data/__tests__/computed-formulas.test.ts` — the fork currently has no plugin test files at all.
- Fork root: `specs/obsidian/001-notion-finance-migration/build/note-database-fork`; all source paths below are relative to that fork root.
- Candidate upstream PR packaging (inline the same function literals into upstream's UPPERCASE block).

### Out of Scope
- `SafeEval.ts` changes of any kind (security boundary; eager argument evaluation is inherited behavior, not special-cased).
- Lazy (Notion-style) branch evaluation via AST special-casing; bare missing identifiers in losing branches still throw and null the field — document `field("x")` / `IFERROR` / nested ternary as workarounds instead.
- Lowercase `ifs` / `switch` / `if` registrations (`RESERVED` contains `"if"` and `"switch"`; the gate blocks `function`/`=>` in user text).
- Tokenizer or dependency-extraction changes (`isCall` and `extractDependencies` already handle call tokens correctly).
- `LOG2`: deferred unless the six-name alias freeze is explicitly expanded by the operator.
- AppFlowy / Anytype as behavioral precedent: neither implements formulas of this shape (AppFlowy `FieldType` has no formula variant; Anytype `FormulaType` is aggregation-only) — do not claim competitor parity upstream.
- Rollup expansion: `RelationRollup.ts` remains `count|sum|avg|list`, display-only (iCloud-safe constraint).
- Successor phase 005 LET/variables work.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `<fork>/src/data/FormulaIfsSwitchMath.ts` | New (planned) | Pure module: `IFS`/`SWITCH` wrappers, math alias table incl. base-10 `LOG`, and modal help rows; zero `obsidian` imports |
| `<fork>/src/data/ComputedField.ts` | Modify (planned) | One additive `Object.assign` line at the `createContext` table region (lines ~310-378) spreading the runtime table |
| `<fork>/src/views/modals/FormulaModal.ts` | Modify (planned) | Append help rows into `FUNCTIONS` (lines ~60-105) so autocomplete/highlighting register the new names |
| `<fork>/src/i18n.ts` | Modify (planned) | Append eight `formula.fn.<NAME>.desc` keys (`IFS`, `SWITCH`, `SQRT`, `LN`, `LOG`, `LOG10`, `EXP`, `CBRT`) to the three existing locale blocks (en ~1115, zh-CN ~2587, zh-TW ~4105) |
| `<fork>/src/__tests__/setup.ts` | New (planned) | Minimal `globalThis.moment` stub enabling node-side vitest runs |
| `<fork>/src/data/__tests__/computed-formulas.test.ts` | New (planned) | Alias-equivalence and wrapper-scenario unit tests (no `obsidian` types needed) |
| `<fork>/src/data/SafeEval.ts` | No change (verify) | Sandbox gate must show zero diff against the upstream base |
| `specs/obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math/spec.md` | Scaffolded | This specification |
| `specs/obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math/plan.md` | Scaffolded | Implementation plan |
| `specs/obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math/tasks.md` | Scaffolded | Task breakdown |
| `specs/obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math/checklist.md` | Scaffolded | Verification checklist |
| `specs/obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math/implementation-summary.md` | Scaffolded | Implementation summary |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | IFS and SWITCH are callable from computed fields | Expressions invoking `IFS(...)` and `SWITCH(...)` evaluate through the existing sandbox; first-truthy-pair selection for `IFS`, strict `===` matching for `SWITCH`; empty/<1-pair input and no-match-without-default return `null` (blank), not an error |
| REQ-002 | SafeEval.ts is untouched | `git diff` against the fork's upstream base shows zero changes to the sandbox file; no-arrow/no-loop/no-eval gate intact; argument eagerness inherited, not special-cased |
| REQ-003 | Math aliases resolve correctly, with Excel LOG semantics | SQRT/LN/LOG10/EXP/CBRT each evaluate equal to its `Math.*` counterpart on spot-check inputs after `Number()` coercion; `LOG(n)` equals log10 and `LOG(n, b)` computes `Math.log(n)/Math.log(b)`; `LOG: Math.log` is forbidden (it would silently duplicate `LN`) |
| REQ-004 | Rebase footprint matches the EuroFormat isolated-diff model | Engine half is one conflict-friendly module plus one `Object.assign` call site in `ComputedField.ts`; `git diff <upstream-base> -- src/data/SafeEval.ts` stays empty; tokenizer, `ComputedEvaluator`, rollups, and views stay untouched |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Candidate upstream PR packaged | Candidate PR described for pangy9's MIT plugin: inline the same function literals into upstream's UPPERCASE block; states honestly Notion `ifs` + Excel math aliases, base-10 `LOG`, eager branches vs Notion lazy `ifs`, blank/`null` on no match, and no AppFlowy/Anytype formula precedent |
| REQ-006 | Mobile-safe and iCloud-safe | Wrappers are pure compute: no `Platform`, no `obsidian` APIs, no network, no telemetry, no frontmatter writes; evaluation read-only over already-loaded field data |
| REQ-007 | Representative uses tested | Tax-bracket `IFS` and monthly-vs-quarterly `SWITCH` scenarios covered by vitest unit tests and/or scratch-vault verification |
| REQ-008 | Editor discovery registered | `IFS`/`SWITCH`/alias names appear in FormulaModal autocomplete and render as function tokens (`NAME(` highlighting); eight `formula.fn.<NAME>.desc` keys (`IFS`, `SWITCH`, `SQRT`, `LN`, `LOG`, `LOG10`, `EXP`, `CBRT`) present in all three locales. Deferral only with explicit user approval |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: All P0 acceptance criteria (REQ-001 through REQ-004) pass with recorded command output, including the newly scaffolded vitest suite.
- **SC-002**: The fork diff touches only the new module, the three call sites (`ComputedField.ts`, `FormulaModal.ts`, `i18n.ts`), the new test scaffolding, and this phase's docs; `SafeEval.ts` diff is empty.
- **SC-003**: Spot-check expressions evaluate inside the sandbox with no sandbox modification; unmatched `IFS`/`SWITCH` inputs yield blank fields rather than errors.
- **SC-004**: `IFS(`, `SWITCH(`, `SQRT(` and friends render as recognized function tokens in FormulaModal and carry localized descriptions in en / zh-CN / zh-TW.

### Acceptance Scenarios

- **Scenario 1**: **Given** a computed field with an `IFS` chain over three tax-bracket thresholds, **when** the field evaluates, **then** the correct bracket is selected for boundary incomes.
- **Scenario 2**: **Given** a `SWITCH` dispatch on a period field (`=SWITCH(UPPER([period]), "MONTH", [amount], "QUARTER", [amount]*3, 0)`), **when** the field evaluates, **then** the monthly or quarterly sub-formula is selected under strict case-sensitive `===` matching.
- **Scenario 3**: **Given** each math alias in a computed field, **when** evaluated, **then** `SQRT(9)` is 3, `LN(e)` is 1, `LOG(100)` is 2 (log10, not ln), and domain violations (`SQRT(-1)`, `LN(0)`, `LOG(n, 1)`) yield IEEE NaN/±Infinity rendered as `-`.
- **Scenario 4**: **Given** the finished diff, **when** reviewed, **then** `SafeEval.ts` shows no changes and the sandbox gate holds.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Wrong `LOG` semantics | `LOG: Math.log` silently equals `LN` and contradicts every spreadsheet dialect | Lock Excel/Sheets `LOG(n)` = log10 with optional second base; ship together with the other aliases, never as a later patch |
| Risk | Engine-only shipping | Functions evaluate but stay invisible in autocomplete/highlighting — users cannot discover them | Call sites 2-3 (FormulaModal `FUNCTIONS` + i18n keys) are part of the locked design, not optional polish |
| Dependency | Fork codebase (`note-database-fork`) | Phase cannot land without the fork's current `ComputedField.ts` shape | Build against the recorded upstream base commit |
| Risk | Sandbox boundary erosion | Formula execution could bypass the no-arrow/no-loop/no-eval gate | Wrappers only add named functions to the existing table; `SafeEval.ts` is never edited and its zero-diff is a gate |
| Risk | Upstream rebase drift | `ComputedField.ts` function-table churn in upstream makes the edit conflict | Module isolates the logic; call sites are one `Object.assign` line plus append-only modal/i18n rows |
| Dependency | Predecessor `003-reports-computed-fields` | Phase 004 targets the computed-field surface; adjacency is wave-ordered, not a hard dependency | **Not a hard dependency**: 003 is vault YAML, 004 is fork TS — no shared files. Start 004 whenever the fork is free; wave order is documentation, not a compiler |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Per-`createContext` cost is a handful of extra closures next to the existing 60+ table entries; wrappers add negligible evaluation overhead.

### Security
- **NFR-S01**: No secrets, telemetry, or network calls; sandbox gate is byte-identical before and after; uppercase-only registration keeps `RESERVED` and the keyword gate effective.

### Reliability
- **NFR-R01**: Deterministic evaluation — wrappers contain no clock/random coupling (`rand`/`TODAY` stay separate); identical inputs produce identical outputs across runs.
- **NFR-R02**: iCloud-safe — evaluation performs no writes and adds no file churn; rollups remain display-only.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- Empty argument lists or fewer than one pair: `IFS`/`SWITCH` return `null` (blank), consistent with failed-eval storage (`ComputedField.ts:106-108`) and Notion's unmatched `ifs` without else; no `console.warn` spam (unmatched dispatch is distinct from failed eval's warn+null).
- Trailing defaults: odd arg count for `IFS`; odd count after `expr` for `SWITCH`.
- `IFS` uses JS truthiness like the existing `IF` (`ComputedField.ts:325`) — `IFS(0, "a", 1, "b")` returns `"b"`; tax-bracket comparisons are booleans so this is fine, but help text must not claim Notion-boolean-only.
- `SWITCH` matching is strict `===` and case-sensitive (`"Month" !== "month"`); users wrap operands with `UPPER()` (help example: `=SWITCH(UPPER([period]), "MONTH", [amount], "QUARTER", [amount]*3, 0)`).
- Math domain: `SQRT(-1)` → NaN, `LN(0)` → `-Infinity`, `LOG(n, 1)` or base ≤ 0 → IEEE NaN/±Infinity; non-numeric strings coerce to NaN via `Number(...)`; display maps non-finite to `-` (`EuroFormat.ts:30-31`). `LOG(n, b?)` must test `b == null` BEFORE `Number(b)` — `Number(null)===0` would take the two-arg path and yield ±Infinity.

### Error Scenarios
- Eager losing branches: bracket refs rewrite to `field("...")` which returns `undefined` on miss (no throw); a bare missing identifier still throws `ReferenceError` and nulls the field — documented workaround is `field("x")`, `IFERROR`, or nested ternary, and these must appear in IFS/SWITCH help examples (do not edit `SafeEval.ts` to get Notion-lazy `ifs`).
- Pre-ship usage: `IFS(...)` raises TypeError "IFS is not a function" mapped to `formula.error.notFunction`; the change is purely additive.
- Name collisions: a frontmatter key named `SQRT` is overridden by the UPPERCASE builtin exactly like `IF`/`ABS` today; lowercase field `switch` is filtered by `RESERVED` and does not collide with `SWITCH(`.
- Dependencies/rename: call tokens are not field refs; column rename does not rewrite `IFS(` / `SQRT(`, and `extractDependencies` records zero false dependencies.

### Concurrent Operations
- Evaluation is read-only over field data; no locking or write coordination is introduced; the same `createContext` path runs identically on desktop and mobile builds.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 6/25 | One pure module plus three small call sites |
| Risk | 5/25 | Sandbox boundary; LOG-semantics trap; discovery completeness |
| Research | 3/20 | Phase research complete (synthesis + evidence trail) |
| **Total** | **14/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

- Resolved defaults locked by the synthesis, to be recorded as a spec amendment in the implementation summary: (1) `LOG` is Excel/Sheets log10 with optional base — REQ-003's "equal to its Math.* counterpart" applies to unary `LOG` as `Math.log10`, never `Math.log`; (2) FormulaModal + i18n discovery (REQ-008) ships by default, deferral requires explicit user approval; (3) `SWITCH` uses strict case-sensitive `===`; (4) `LOG2` is deferred outside the six-name freeze; (5) unmatched dispatch returns `null`, not a thrown error; (6) the upstream PR inlines the same function literals rather than importing the fork module; (7) predecessor 003 is NOT a hard dependency — 003 is vault YAML, 004 is fork TS with no shared files, so 004 starts whenever the fork is free; (8) `LOG(n, b?)` tests `b == null` before `Number(b)` to avoid the `Number(null)===0` two-arg trap.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research Synthesis**: `research/synthesis.md`
- **Research Evidence Trail**: `research/research.md`

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-formula-ifs-switch-math-module/ | New `FormulaIfsSwitchMath.ts` (IFS, SWITCH, SQRT/LN/LOG10/EXP/CBRT, Excel LOG) plus P0 spread into `ComputedField.ts` createContext — one module write | Planned |
| 2 | 002-formula-modal-i18n-discovery/ | Concat help rows into FormulaModal `FUNCTIONS` at array init and append eight `formula.fn.*.desc` keys in en / zh-CN / zh-TW | Planned |
| 3 | 003-computed-formulas-vitest/ | Bootstrap `src/__tests__/setup.ts` and `computed-formulas.test.ts` against the new module (`npx vitest run`) | Planned |

Future / out of this phase (not child folders): `LOG2` alias (synthesis rank 7, outside the six-name freeze); candidate upstream PR notes stay in leftover parent docs until asked to open.

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-formula-ifs-switch-math-module | 002-formula-modal-i18n-discovery | `formulaIfsSwitchMath` and `formulaIfsSwitchMathHelp` exist; `ComputedField.ts` `Object.assign` at `:310-378` spreads the runtime table; unary `LOG` is log10 not ln; `SafeEval.ts` untouched | `IFS(...)` no longer maps to `formula.error.notFunction` (`ComputedField.ts:527-530`); `LOG(100)` is 2 not `Math.log(100)`; `git diff <upstream-base> -- src/data/SafeEval.ts` empty |
| 002-formula-modal-i18n-discovery | 003-computed-formulas-vitest | Eight help rows concatenated at `FUNCTIONS` init so `:110` / `:864-868` / `:1202` see them; 24 i18n strings present. Vitest may already run in parallel after child 001. | Autocomplete lists IFS/SWITCH/SQRT/LN/LOG/LOG10/EXP/CBRT; `NAME(` highlights as function; all three locales have all eight keys |
<!-- /ANCHOR:phase-map -->
