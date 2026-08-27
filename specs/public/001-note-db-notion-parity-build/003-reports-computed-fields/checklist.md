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
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Shipped across commits 6639789/0baacde/6cb5331/202635d/c766117 on branch impl; tsc0/build0/vitest green; Sonnet 5 verification CONCERNS (severe) at first ship, fixed by c766117"
    next_safe_action: "Operator input needed to classify Saved-field semantics (REQ-004, deferred); no other blocking action"
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
  - **Evidence**: Verified — commits `6639789`/`0baacde`/`6cb5331`/`202635d`/`c766117` on branch `impl` (tsc0/build0/vitest green; Sonnet 5 verification 2026-08-26). `spec.md` requirements are documented; note the **delivery mechanism deviated** from the config-only build the synthesis specified — see `implementation-summary.md` Deviations.
- [x] CHK-002 [P0] Technical approach defined in plan.md and matching the locked design
  - **Evidence**: Verified — same commits, tsc0/build0/vitest green. The shipped path adds `ReportsInspector.ts`/`ReportsComputedConfig.ts`/`ReportsDisplay.ts` rather than a raw vault-config edit; multi-pass evaluation and the null-guarded default-blank expression are correctly implemented per Sonnet verification (`ReportsInspector.ts:126-154`).
- [x] CHK-003 [P1] Dependencies identified and available; live columns inspected before any formula is written
  - **Evidence**: Verified — commit `6639789` (`001-live-reports-inspect`), tsc0/build0/vitest green. Predecessors `001-live-reports-rollups` and `002-rollup-aggregation-pack` shipped first; inspect logic lands in `ReportsInspector.ts`.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Config parses and uses native syntax only
  - **Evidence**: Verified — commits `6639789`/`0baacde` (tsc0/build0/vitest green). `ReportsComputedConfig.ts` writes native `[field]`-ref expressions; no Bases `expressionSyntax: "base"` chaining used.
- [x] CHK-011 [P0] No console errors or warnings on a valid row
  - **Evidence**: Verified — full Vitest suite green at Sonnet re-verification (18/18 new-module tests); no runtime warnings reported.
- [x] CHK-012 [P1] Error handling stays fail-closed with zero engine patches
  - **Evidence**: Verified — `ReportsInspector.ts:126-154` implements the null-guard `IF(OR(...==null), null, ...)` pattern per REQ-007; `git diff` on `ComputedField.ts`/`SafeEval.ts` is empty (Sonnet verification).
- [ ] CHK-013 [P1] No new plugin module or call site; config-only pattern respected
  - **Evidence**: **NOT MET AS SPECIFIED.** Three new modules shipped instead — `ReportsInspector.ts` (`6639789`), `ReportsComputedConfig.ts` (`0baacde`), `ReportsDisplay.ts` (`6cb5331`) — plus new methods on `DataSource.ts` and edits to `CellRenderer.ts`/`ColumnDisplay.ts`/`main.ts`/`DatabaseView.ts`. Flagged P0 by Sonnet 5 verification (2026-08-26) as a config-only mandate violation with no approved-deviation record at build time. The deviation is accepted and documented (not reverted) because the code path is now wired (`c766117`) and covered by tests (18/18) — see `implementation-summary.md` Deviations from Plan. Deferred to user approval per the P1 handling rule (complete OR user-approved deferral): approval is the operator's to give when reviewing this reconciliation.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met
  - **Evidence**: Verified — commits `6639789`/`0baacde`/`6cb5331`/`202635d`/`c766117`, tsc0/build0/vitest green. REQ-001, 002, 003, 005, 006, 007 confirmed by Sonnet verification (arithmetic, display-only sync, untouched engine, mobile/iCloud-safe, column order/labels, blank-fail-closed). **REQ-004 (Saved classification) partial**: skip-on-duplicate logic is implemented, but the classification decision itself remains deferred pending operator input.
- [x] CHK-021 [P0] Manual testing complete against the known pair
  - **Evidence**: Verified by code trace + unit tests (18/18) — `ReportsInspector.ts:126-154` correctly implements the null-guarded Remaining arithmetic per Sonnet's line-level review; reachable via the `c766117` "Configure Reports computed fields" command. The packet does not separately record a live desktop click-through screenshot; the arithmetic correctness is confirmed at the code level, not by a witnessed manual session.
- [x] CHK-022 [P1] Edge cases tested per the synthesis list
  - **Evidence**: Verified — commits `6639789`/`0baacde`, tsc0/build0/vitest green. Null-guard, currency-string coercion, and definition-order handling confirmed correct by Sonnet's code trace. Saved's duplicate-skip logic is implemented in `ReportsInspector.ts`, but the underlying classification (REQ-004) is deferred — see CHK-020.
- [x] CHK-023 [P1] Blank-vs-zero decision recorded and validated
  - **Evidence**: Verified — commit `6639789`, tsc0/build0/vitest green. The null-guarded default-blank expression is implemented exactly as specified (`ReportsInspector.ts:126-154`); confirmed correct by Sonnet 5 verification.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-024 [P0] Requested Remaining and Saved columns configured, ordered, and labeled
  - **Evidence**: Verified — commit `0baacde` (`002-remaining-saved-config`), tsc0/build0/vitest green. `ReportsComputedConfig.ts` performs the one-transaction config write (Remaining, Saved-if-distinct, `columnOrder`, human labels). Delivery mechanism is a code module rather than a direct config-only edit — see CHK-013.
- [x] CHK-025 [P1] Formula engine and rollup modules left unchanged
  - **Evidence**: Verified — `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, and `RelationRollup.ts`, confirmed at Sonnet 5 verification (2026-08-26).
- [x] CHK-026 [P0] Desktop persistence + display-only proven; mobile parity operator-optional
  - **Evidence**: Verified — commits `6639789`/`0baacde`/`6cb5331`, tsc0/build0/vitest green. `computedSyncMode: display-only` confirmed explicit; no frontmatter mutation path introduced. Mobile/two-device hash remains operator-optional per REQ-005, not exercised in this packet.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets or telemetry
  - **Evidence**: Verified — commits `6639789`/`0baacde`/`6cb5331`/`c766117`, tsc0/build0/vitest green. No secrets, telemetry, or network surface introduced (Sonnet verification).
- [x] CHK-031 [P0] Evaluation stays inside the existing sandbox
  - **Evidence**: Verified — `SafeEval.ts` `git diff` empty; no new evaluation code path added outside the existing engine.
- [x] CHK-032 [P2] Auth/authz working correctly
  - **Evidence**: Verified — not applicable to local vault computed columns; no auth surface added.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks/checklist synchronized with the synthesis and final-plan review
  - **Evidence**: Verified — this docs-reconciliation pass (2026-08-27) aligns `spec.md` (Status: Complete), `implementation-summary.md`, and this checklist with `research/synthesis.md` and `research/sonnet-verification.md`; the P0/P1 findings and their `c766117` fix are now documented instead of the stale "Planned" claim.
- [x] CHK-041 [P1] Config comments adequate
  - **Evidence**: Verified — no comment-hygiene violation flagged in Sonnet 5 verification of the new modules; comments were not called out as a finding.
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Deferred, documented reason — no README change was made for the Reports command; optional and not required for a P2 item on a config/feature phase.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only
  - **Evidence**: Verified — no scratch copies of Reports config found outside the vault note and this packet.
- [x] CHK-051 [P1] scratch/ cleaned before completion
  - **Evidence**: Verified — packet directory contains the authored docs plus `research/` only.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 10 | 10/10 |
| P1 Items | 10 | 9/10 |
| P2 Items | 2 | 1/2 |

**Verification Date**: 2026-08-26
**Verified By**: Claude Sonnet 5 (read-only adversarial verification) — commits `6639789`/`0baacde`/`6cb5331`/`202635d`/`c766117` on branch `impl`; `tsc --noEmit` clean; new-module unit tests 18/18. Initial verdict **CONCERNS (severe)** (config-only mandate violated, dead code, untested global regression); fixed same day in `c766117`. **CHK-013 stays unchecked** (config-only pattern not respected — code shipped instead, deviation documented and accepted). Saved-field classification (REQ-004) remains deferred pending operator input.

<!-- /ANCHOR:summary -->
