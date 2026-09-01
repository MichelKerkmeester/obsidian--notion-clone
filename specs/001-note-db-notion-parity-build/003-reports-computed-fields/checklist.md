---
title: "Verification Checklist: Reports Remaining/Saved Computed Fields"
description: "Verification checklist for display-only Remaining and Saved computed columns on the Reports view — shipped as code (a documented deviation from the config-only spec), gate-green; Saved-field classification remains deferred."
trigger_phrases:
  - "reports remaining checklist"
  - "remaining saved verify"
  - "computed fields check"
  - "display-only remaining"
  - "rollup formula verify"
  - "reports computed columns"
  - "no write-back"
  - "native computedfield"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/003-reports-computed-fields"
    last_updated_at: "2026-08-27T17:09:01Z"
    last_updated_by: "markdown-agent"
    recent_action: "Completion docs reconciled to shipped state; gate green; Sonnet-verified"
    next_safe_action: "Operator input needed to classify Saved-field semantics (REQ-004, deferred)"
    blockers:
      - "Saved-field classification deferred pending operator input (REQ-004; c766117 commit message)"
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
    completion_pct: 90
    open_questions:
      - "Saved-field classification (REQ-004, needs operator input)"
    answered_questions: []
---
# Verification Checklist: Reports Remaining/Saved Computed Fields

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

- [x] CHK-001 [P0] Requirements documented in spec.md and matching the synthesis
  - **Evidence**: [EVIDENCE: shipped: ReportsInspector, ReportsComputedConfig, and ReportsDisplay; full suite 247/247]
- [x] CHK-002 [P0] Technical approach defined in plan.md and matching the locked design
  - **Evidence**: [EVIDENCE: src/data/ReportsInspector.ts:126-195; src/data/ReportsComputedConfig.ts:42-102; src/data/ReportsComputedConfig.test.ts:52-244 (9/9)]
- [ ] CHK-003 [P1] Dependencies identified and available; live columns inspected before any formula is written
  - **Evidence**: [EVIDENCE: DEFERRED -- required predecessor configuration was not shipped, so post-predecessor inspection cannot be verified]

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Config parses and uses native syntax only
  - **Evidence**: [EVIDENCE: src/data/ReportsInspector.ts:126-137; src/data/ReportsComputedConfig.ts:42-97; src/data/ReportsInspector.test.ts:104-123 (5/5)]
- [ ] CHK-011 [P0] No console errors or warnings on a valid row
  - **Evidence**: [EVIDENCE: DEFERRED -- no valid-row runtime console-check artifact was produced]
- [x] CHK-012 [P1] Error handling stays fail-closed with zero engine patches
  - **Evidence**: [EVIDENCE: src/data/ReportsInspector.ts:156-210; src/data/ReportsInspector.test.ts:154-169 (5/5); src/data/ReportsComputedConfig.test.ts:163-171 (9/9)]
- [ ] CHK-013 [P1] No new plugin module or call site; config-only pattern respected
  - **Evidence**: [EVIDENCE: DEFERRED -- shipped implementation adds plugin modules and call sites, so the config-only constraint is unmet]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] Remaining acceptance criteria met; Saved (REQ-004) deferred
  - **Evidence**: [EVIDENCE: DEFERRED -- Saved (REQ-004) classification remains unresolved; acceptance criteria are not all closed]
- [ ] CHK-021 [P0] **DEFERRED** — Manual testing complete against the known pair
  - **Evidence**: [EVIDENCE: DEFERRED -- no witnessed desktop known-pair session was performed]
- [x] CHK-022 [P1] Edge cases tested per the synthesis list
  - **Evidence**: [EVIDENCE: src/data/ReportsInspector.test.ts:104-169 (5/5); src/data/ReportsComputedConfig.test.ts:52-244 (9/9); src/data/ReportsDisplay.test.ts:42-60 (23/23); src/data/ColumnDisplay.test.ts:31-77 (8/8)]
- [x] CHK-023 [P1] Blank-vs-zero decision recorded and validated
  - **Evidence**: [EVIDENCE: src/data/ReportsInspector.ts:126-137; src/data/ReportsInspector.test.ts:104-138 (5/5)]

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-024 [P0] Remaining-only column configured, ordered, and labeled
  - **Evidence**: [EVIDENCE: src/data/ReportsComputedConfig.ts:61-68,79-89; src/data/ReportsComputedConfig.test.ts:53-97]
- [x] CHK-025 [P1] Formula engine and rollup modules left unchanged
  - **Evidence**: [EVIDENCE: `src/data/ComputedField.ts:563-569`; `src/data/SafeEval.ts:961-973`; `src/data/BaseExpression.ts:1-7`; `src/data/RelationRollup.ts:130-155`; no Reports-specific references]
- [x] CHK-026 [P0] Desktop persistence + display-only proven; mobile parity operator-optional
  - **Evidence**: [EVIDENCE: src/data/DataSource.ts:527-542; src/data/ReportsComputedConfig.ts:94-100; src/data/ReportsComputedConfig.test.ts:52-97 (9/9)]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets or telemetry
  - **Evidence**: [EVIDENCE: src/data/ReportsInspector.ts:1-7; src/data/ReportsComputedConfig.ts:1-9; src/data/ReportsDisplay.ts:1-3; full suite 247/247]
- [x] CHK-031 [P0] Evaluation stays inside the existing sandbox
  - **Evidence**: [EVIDENCE: src/data/ReportsInspector.ts:126-154; src/data/ReportsInspector.test.ts:154-169 (5/5); existing evaluation engine remains the only evaluator]
- [x] CHK-032 [P2] Auth/authz working correctly
  - **Evidence**: [EVIDENCE: src/data/ReportsInspector.ts:1-7; src/data/ReportsComputedConfig.ts:1-9; src/data/ReportsDisplay.ts:1-3]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks/checklist synchronized with the synthesis and final-plan review
  - **Evidence**: [EVIDENCE: `synthesis.md`; `final-plan.md`; `tasks.md`; `checklist.md`; `implementation-summary.md`; 247/247]
- [x] CHK-041 [P1] Config comments adequate
  - **Evidence**: [EVIDENCE: src/data/ReportsInspector.ts:1-7,52-69; src/data/ReportsComputedConfig.ts:19-22]
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: [EVIDENCE: DEFERRED -- README applicability was not verified and no README change is evidenced]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
  - **Evidence**: [EVIDENCE: DEFERRED -- scratch-vault/file-organization check was not independently verified]
- [ ] CHK-051 [P1] scratch/ cleaned before completion
  - **Evidence**: [EVIDENCE: DEFERRED -- scratch cleanup lacks an independent verification artifact]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Kept with real evidence | Unchecked/deferred |
|----------|-------|-------------------------|--------------------|
| P0 Items | 10 | 7/10 | 3 |
| P1 Items | 10 | 6/10 | 4 |
| P2 Items | 2 | 1/2 | 1 |
| **All Items** | **22** | **14/22** | **8** |

**Verification Date**: 2026-08-27
**Verification**: Source/test reconciliation; `npx tsc --noEmit` exit 0; full Vitest suite 247/247 passing; phase-specific tests 37/37 passing. Saved-field classification, dependency/config-only claims, valid-row console proof, manual proof, README applicability, and scratch-vault checks remain explicitly deferred.

<!-- /ANCHOR:summary -->
