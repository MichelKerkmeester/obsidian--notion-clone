---
title: "Feature Specification: Formula Modal LET Help"
description: "P2 commit: add LET/LETS rows to FormulaModal FUNCTIONS under formula.catLogic and formula.fn.LET.desc / LETS.desc in en / zh-CN / zh-TW. Do not document __let. Error keys stay in child 001."
trigger_phrases:
  - "formula modal let"
  - "LET help"
  - "LETS desc"
  - "formula.catLogic"
  - "FUNCTION_NAMES"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/005-formula-let-variables/003-formula-modal-let-help"
    last_updated_at: "2026-08-25T21:30:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored P2 discovery child from synthesis rank 6 and final-plan step 11"
    next_safe_action: "Add LET/LETS FUNCTIONS rows and formula.fn.LET.desc / LETS.desc in three locales"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-003-formula-modal-let-help"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Formula Modal LET Help

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P2 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `005-formula-let-variables` |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 3 |
| **Predecessor** | 002-let-vitest-matrix |
| **Successor** | None |
| **Handoff Criteria** | Help lists LET/LETS; `__let` absent; examples use `**` / `pow` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 3 of 3** — Parent: [`../spec.md`](../spec.md) · Predecessor: `002-let-vitest-matrix`. Engine and tests can already be green; this child is discoverability. Same PR as children 001–002, **second commit**. Error i18n is **not** this commit.

This child is synthesis rank 6 and final-plan step 11. Fork `FUNCTIONS` (`FormulaModal.ts:60-105`) has no LET/LETS, so `FUNCTION_NAMES` (`:110`) will not highlight them and the help panel will not list them. Without this child the feature works but is undiscoverable for Notion migrants.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Even after child 001 evaluates `let`/`lets`, the editor's own registry drives autocomplete, `NAME(` highlighting, and help. `FUNCTIONS` is the source for `FUNCTION_NAMES` at `FormulaModal.ts:110`. Unregistered names render as plain text. Notion surfaces `let`/`lets` in formula docs/UI; the fork currently does not.

### Purpose
Add `LET` and `LETS` help entries under existing `formula.catLogic` at `FormulaModal.ts:60-105` so `:110` highlights them, and append `formula.fn.LET.desc` / `formula.fn.LETS.desc` in en / zh-CN / zh-TW. Examples use fork `**` / `pow`, never Notion `^` (`SafeEval.ts` `TT.Pow` is `**`, line 32). Do not add `formula.catVars`. Do not document `__let`.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `FormulaModal.ts:60-105`: add LET/LETS rows under `formula.catLogic`. Names `LET` / `LETS` so `FUNCTION_NAMES` (`:110`) highlights them. Add the rows at array init (a `const` initialized once), not by pushing later.
- Examples must be fork-legal: `**` / `pow`, never `^`. Quoted names + live expression, matching the locked user syntax (`let("rate", 0.05, amount * rate)`), not a string body.
- `i18n.ts`: `formula.fn.LET.desc` and `formula.fn.LETS.desc` in all three locale blocks. Append-only. Do **not** add or edit `formula.error.letArgCount` / `letName` here (child 001 already owns those).
- Confirm `__let` is absent from `FUNCTIONS` and from help copy.

### Out of Scope
- Engine transform, `__let` registration, or error-key i18n (child 001).
- Vitest files (child 002).
- New `formula.catVars` category.
- Documenting `__let` or teaching users to write arrows.
- Touching `SafeEval.ts`, `ComputedField.ts`, or `LetVariables.ts`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/modals/FormulaModal.ts` | Edit | LET/LETS rows under `formula.catLogic` at `FUNCTIONS` `:60-105` |
| `src/i18n.ts` | Edit | `formula.fn.LET.desc` / `formula.fn.LETS.desc` in en / zh-CN / zh-TW |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | LET/LETS rows exist at `FUNCTIONS` init | Entries under `formula.catLogic` at `FormulaModal.ts:60-105`; names are not pushed after `FUNCTION_NAMES` is built (`:110`) |
| REQ-002 | Autocomplete and highlighting see the names | `FUNCTION_NAMES` (`:110`) lists `LET` and `LETS`; `LET(` / `LETS(` highlight as function |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-003 | Two help keys in three locales | `formula.fn.LET.desc` and `formula.fn.LETS.desc` present in en / zh-CN / zh-TW; append-only; error keys unchanged |
| REQ-004 | `__let` stays internal; examples are fork-legal | No `__let` help row or copy; no `formula.catVars`; examples use `**` / `pow`, never `^` |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: FormulaModal autocomplete lists LET and LETS.
- **SC-002**: Typing `LET(` highlights as a function token (`FormulaModal.ts:110`).
- **SC-003**: All three locales have `formula.fn.LET.desc` and `formula.fn.LETS.desc`.
- **SC-004**: `__let` is absent from `FUNCTIONS` and from help copy.

### Acceptance Scenarios

- **Given** FormulaModal open on a computed column, **when** the user types `LET`, **then** autocomplete offers `LET` and `LET(` highlights as a function.
- **Given** the help panel, **when** LET or LETS is selected, **then** the example uses `**` or `pow`, not `^`, and uses quoted names with a live body.
- **Given** zh-CN and zh-TW locales, **when** help renders, **then** both LET and LETS have descriptions and `__let` is not listed.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Push rows after `FUNCTION_NAMES` is built | Names evaluate but stay unstyled / unlistable | Add rows at the `FUNCTIONS` declaration (`FormulaModal.ts:60-105`) |
| Risk | Notion `^` in examples | Help teaches a token SafeEval does not parse as power (`SafeEval.ts:32`) | Use `**` / `pow` only |
| Risk | Documenting `__let` | Users try to write arrows; security blocks `=>` at `ComputedField.ts:504-506` | Keep `__let` out of `FUNCTIONS` and i18n |
| Risk | Bundling error keys into this commit | Typed errors already shipped in child 001; duplicating them here drifts | Error keys stay in child 001; this child is help keys only |
| Dependency | Child 001 engine | Help without a working transform is misleading | Same PR, second commit, after children 001–002 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Locked defaults: same PR, second commit; no `formula.catVars`; `__let` undocumented; examples use `**` / `pow`. Deferral of this child needs explicit operator approval (feature would work but stay undiscoverable).
<!-- /ANCHOR:questions -->
