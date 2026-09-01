---
title: "Verification Checklist: Formula IFS/SWITCH + Math Function Aliases"
description: "Verification checklist for the formula additions, with substantive source/test evidence; manual scratch-vault, display, lint, and regression proofs are deferred."
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
    packet_pointer: "public/001-note-db-notion-parity-build/004-formula-ifs-switch-math"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "markdown"
    recent_action: "Completion docs reconciled to shipped state; gate green; Sonnet-verified"
    next_safe_action: "Deferred lint/regression and manual display/scratch proofs remain open"
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
    completion_pct: 83
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

- [x] CHK-001 [P0] Requirements documented in spec.md and match the synthesis verdict [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:42,55]
- [x] CHK-002 [P0] Technical approach defined in plan.md and matches the locked design [EVIDENCE: src/data/ComputedField.ts:381; src/views/modals/FormulaModal.ts:108]
- [x] CHK-003 [P1] Dependencies identified and available [EVIDENCE: package.json:31,33; src/data/__tests__/computed-formulas.test.ts:1]

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: DEFERRED -- npm run lint exits 1 on seven unrelated repository errors; clean lint was not proved]
- [x] CHK-011 [P0] No console errors or warnings from the new functions [EVIDENCE: src/data/__tests__/computed-formulas.test.ts:60; 7 tests pass]
- [x] CHK-012 [P0] Sandbox boundary preserved [EVIDENCE: src/data/SafeEval.ts:949]
- [x] CHK-013 [P1] Code follows project patterns [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:1; src/data/ComputedField.ts:381]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All P0 acceptance criteria met [EVIDENCE: DEFERRED -- P0 lint and scratch-vault proofs remain unverified]
- [ ] CHK-021 [P0] Wrapper scenarios tested [EVIDENCE: DEFERRED -- scratch-vault wrapper proof was not recorded; unit tests cover code paths only]
- [x] CHK-022 [P0] Empty/default edge cases return null, not errors [EVIDENCE: src/data/__tests__/computed-formulas.test.ts:25; 7 tests pass]
- [ ] CHK-023 [P1] Math domain edges render as `-` [EVIDENCE: DEFERRED -- display rendering proof was not recorded; source and unit math-domain behavior are covered]
- [x] CHK-024 [P1] Eager losing branches behave per contract [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:18; src/i18n.ts:1170]
- [ ] CHK-025 [P1] Pre-phase formulas unchanged (purely additive) [EVIDENCE: DEFERRED -- clean regression run was not proved; npm run lint exits 1 on unrelated errors]

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-030 [P0] Module contains wrappers, aliases, and help rows [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:42,55]
- [x] CHK-031 [P0] LOG semantics are Excel-correct [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:47; src/data/__tests__/computed-formulas.test.ts:45]
- [x] CHK-032 [P1] Editor discovery complete [EVIDENCE: src/views/modals/FormulaModal.ts:108,114,1202; src/i18n.ts:1170,2673,4219]
- [ ] CHK-033 [P1] No out-of-scope files changed [EVIDENCE: DEFERRED -- changed-file scope was not independently verified]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-040 [P0] Sandbox security boundary intact [EVIDENCE: src/data/SafeEval.ts:949]
- [x] CHK-041 [P0] No hardcoded secrets [EVIDENCE: `grep -RniE 'secret|api[_-]?key|private[_-]?key|password|BEGIN (RSA|OPENSSH|EC|PGP) PRIVATE KEY' src/` -- no matches]
- [x] CHK-042 [P1] Uppercase-only registration keeps RESERVED effective [EVIDENCE: src/data/ComputedField.ts:95; src/data/FormulaIfsSwitchMath.ts:42]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:mobile-cloud -->
## Display-Only / Mobile / iCloud Safety

- [x] CHK-050 [P0] Wrappers are pure compute — mobile-safe [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:1; src/data/ComputedField.ts:381]
- [x] CHK-051 [P0] Evaluation is read-only over loaded field data [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:42; src/data/ComputedField.ts:381]
- [x] CHK-052 [P1] Rollups remain display-only and unexpanded [EVIDENCE: src/data/RelationRollup.ts:137,157,187,188,226]
- [x] CHK-053 [P1] Determinism holds (NFR-R01) [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:18,29,42]

<!-- /ANCHOR:mobile-cloud -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-060 [P1] Spec/plan/tasks synchronized [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:42,55; src/data/ComputedField.ts:381; src/views/modals/FormulaModal.ts:108]
- [x] CHK-061 [P1] Code comments carry durable WHY only [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:1]
- [x] CHK-062 [P2] README updated (if applicable) [EVIDENCE: README.md:34,116 — function enumeration not applicable]
- [x] CHK-063 [P1] Spec amendments recorded in implementation summary [EVIDENCE: src/data/FormulaIfsSwitchMath.ts:47; src/i18n.ts:1174]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-070 [P1] Temp files in scratch/ only [EVIDENCE: `test ! -d scratch` passed -- scratch/ absent]
- [x] CHK-071 [P1] scratch/ cleaned before completion [EVIDENCE: `test ! -d scratch` passed -- scratch/ absent]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked with real evidence | Unchecked/deferred |
|----------|-------|---------------------------|--------------------|
| P0 Items | 14 | 11/14 | 3 |
| P1 Items | 15 | 12/15 | 3 |
| P2 Items | 1 | 1/1 | 0 |
| **Total** | **30** | **24/30** | **6** |

**Verification Date**: 2026-08-27
**Verified By**: Codex evidence reconciliation against shipped source and tests — `npx vitest run` 25 files / 247 tests pass; `npx tsc --noEmit` exit 0; production build exit 0; `npm run lint` exit 1 with seven unrelated repository errors. Scratch-vault, display, and clean-regression proofs remain deferred.

<!-- /ANCHOR:summary -->
