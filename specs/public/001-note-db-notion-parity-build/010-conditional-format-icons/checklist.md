---
title: "Verification Checklist: Conditional Formatting Multi-Condition and Icons"
description: "Pending verification checklist for multi-condition CF plus icon and bold on the shared helper."
trigger_phrases:
  - "conditional formatting checklist"
  - "applyconditionalformat"
  - "format icons"
  - "icon bold verify"
  - "multi-condition cf"
  - "first-match regression"
  - "cf display-only"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/010-conditional-format-icons"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan review findings; status Planned (blocked on 009)"
    next_safe_action: "Wait for 009 to ship evaluateFilterTree, then build per tasks.md"
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
# Verification Checklist: Conditional Formatting Multi-Condition and Icons

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

- [ ] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: pending]
  - **Evidence**: Pending — implementation not started. `spec.md` records REQ-001–REQ-007 and SC-001–SC-005 reflecting the synthesis verdict; do not treat scaffold docs as build evidence.
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: pending]
  - **Evidence**: Pending — `plan.md` records the locked design (in-place `ConditionalFormatting.ts`, 3 call-site edits, 0 renderer consumer edits, 8-step algorithm, dual-write persistence); no code has been changed yet.
- [ ] CHK-003 [P1] Dependencies identified and available [EVIDENCE: pending]
  - **Evidence**: Pending — `009-view-filter-tree` must ship `QueryEngine.evaluateFilterTree` (per-row `boolean | null`) + `normalizeViewFilterTree` + `src/data/ViewFilterTree.ts` before multi-condition; confirmed absent today. One PR after 009 — do not split icon/bold first.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: pending]
  - **Evidence**: Pending — no fork TypeScript has been edited in this phase.
- [ ] CHK-011 [P0] No console errors or warnings [EVIDENCE: pending]
  - **Evidence**: Pending — runtime not exercised; do not claim a clean console.
- [ ] CHK-012 [P1] Error handling implemented [EVIDENCE: pending]
  - **Evidence**: Pending — empty/invalid trees (E2/E4), missing columns (E3), and invalid icon tokens (E11) must fail closed per `spec.md` §8; not implemented.
- [ ] CHK-013 [P1] Code follows project patterns [EVIDENCE: pending]
  - **Evidence**: Pending — expected pattern is additive `types.ts` plus in-place `ConditionalFormatting.ts` + `DataSource.ts` + `ViewConfigPanelRenderer.ts` + `ColumnOperations.ts` + `styles.css` + `i18n.ts` + tests, modeled on `EuroFormat.ts` (`update-fork.sh:5-7`); no `ConditionalFormatTree.ts`.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: pending]
  - **Evidence**: Pending — REQ-001–REQ-007 and SC-001–SC-005 have no observed test output.
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: pending]
  - **Evidence**: Pending — table (`tr` :463 / `td` :503) plus one non-table view have not been painted with icon/bold. Record-target table icon must attach to the first `td:not(.db-select-col)` (a span child of `tr` is invalid HTML); field-target icon attaches to the `td` itself.
- [ ] CHK-022 [P1] Edge cases tested [EVIDENCE: pending]
  - **Evidence**: Pending — 12 **unit** cases on the helper (legacy color-only; AND; OR; first-match collision E12; empty/missing tree E2; nested empty group E4; `valueSource:"today"` E5; tree-only missing column E3; invalid icon E11; color-omitted icon/bold; icon span not a child of `TR` / onto first `td:not(.db-select-col)`; `eq`+empty value still matches on the legacy path — the `getEffectiveFilterRules` trap) **plus** grep checks (E1 missing `id`; E7 legacy db-level migration `DataSource.ts:761-765`; E8/E9 ColumnOperations rename/delete; E10 unknown extra keys). Be honest: 12 unit cases on the helper + grep for rename/delete/migration, not 12 = E1–E12. Not implemented.
- [ ] CHK-023 [P1] Error scenarios validated [EVIDENCE: pending]
  - **Evidence**: Pending — fail-closed behavior for invalid/empty trees and invalid icon tokens is specified in `spec.md` §8 but untested because the helper is unchanged.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-024 [P0] Requested valid fixture files regenerated [EVIDENCE: pending]
  - **Evidence**: Pending — this item maps to the phase deliverable: shared multi-condition + icon/bold CF is not built. Scaffold markdown in this folder is not the product fix.
- [ ] CHK-025 [P1] Intentional warning fixture left unchanged [EVIDENCE: pending]
  - **Evidence**: Pending — out-of-scope fork files (formula engines, rollups, footers, charts, `ChartRenderer`, other phase folders) must remain untouched; not yet verified by diff.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets [EVIDENCE: pending]
  - **Evidence**: Pending — no implementation diff to inspect; NFR-S01 still required at build time.
- [ ] CHK-031 [P0] Input validation implemented [EVIDENCE: pending]
  - **Evidence**: Pending — icon strings must be RecordIcon tokens validated by `parseRecordIconToken` (never `eval` / `SafeEval`, NFR-S02); invalid tokens yield no icon (E11); invalid/empty trees must not throw through renderers (NFR-R02).
- [ ] CHK-032 [P1] Auth/authz working correctly [EVIDENCE: pending]
  - **Evidence**: Pending — not applicable to local vault CF display; record N/A with evidence only after confirming no new network or credential paths.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: pending]
  - **Evidence**: Pending — scaffold files now agree on the synthesis verdict, locked design, and ranked backlog; completion sync is blocked until implementation.
- [ ] CHK-041 [P1] Code comments adequate [EVIDENCE: pending]
  - **Evidence**: Pending — when code is written, comments must record durable WHY only (no spec paths, phase numbers, or REQ/CHK/task ids).
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Pending — not applicable unless the fork README already documents CF; do not add a README solely for this phase.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: pending]
  - **Evidence**: Pending — no implementation scratch yet; keep any locate-at-build notes out of the fork src tree.
- [ ] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: pending]
  - **Evidence**: Pending — nothing to clean until build; completion still requires a clean scoped diff.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | 0/9 |
| P1 Items | 11 | 0/11 |
| P2 Items | 1 | 0/1 |

**Verification Date**: Not yet verified
**Verified By**: Pending

<!-- /ANCHOR:summary -->
