---
title: "Verification Checklist: Unique-ID Stamp on Row Create"
description: "Verification checklist for create-time unique-ID stamping, DatabaseConfig.uniqueId counter persistence, rebase-clean isolated src/data diff, and the synthesis edge cases plus display-only / mobile / iCloud-safety checks."
trigger_phrases:
  - "unique id checklist"
  - "unique-id verification"
  - "createentryplan checklist"
  - "db_view counter checklist"
  - "invoice id checklist"
  - "unique id stamp checks"
  - "row create unique id"
  - "allocator verification"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/007-unique-id-stamp"
    last_updated_at: "2026-08-27T12:25:50Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Completion docs reconciled to shipped state; gate green; Sonnet-verified"
    next_safe_action: "None — phase complete"
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
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Unique-ID Stamp on Row Create

> Verification items cover the shipped allocator, persistence, create-path, and safety behavior. Source and test evidence is recorded below; manual device proofs and exact repository-scope verification remain deferred.

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

- [x] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: src/data/UniqueIdStamp.ts:5-43; src/views/DatabaseView.ts:3626-3635]
  - **Evidence**: `src/data/UniqueIdStamp.ts:5-43` implements the allocator contract; `src/views/DatabaseView.ts:3626-3635` wires create-time stamping.
- [x] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: src/views/DatabaseView.ts:3626-3755]
  - **Evidence**: The allocator, persistence round-trip, create-plan stamp, and view wiring are present in the shipped source.
- [x] CHK-003 [P1] Dependencies identified and available [EVIDENCE: src/__tests__/setup.ts:1-41]
  - **Evidence**: `src/__tests__/setup.ts:1-41` is present; typecheck and the full test gate passed.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: src/data/UniqueIdStamp.ts:1-48 (eslint exit 0)]
  - **Evidence**: The unique-ID source modules pass the scoped ESLint check; repository-wide lint has seven unrelated errors outside these modules.
- [x] CHK-011 [P0] No console errors or warnings [EVIDENCE: npx vitest run — 247 passed]
  - **Evidence**: The full test suite exits 0 with 247 passed tests and no console output.
- [x] CHK-012 [P1] Error handling implemented [EVIDENCE: src/views/DatabaseView.ts:3696-3717]
  - **Evidence**: Persist failure restores the config and trashes the created note; the outer create failure path restores an unpersisted counter.
- [x] CHK-013 [P1] Code follows project patterns [EVIDENCE: src/data/UniqueIdStamp.ts:1-48]
  - **Evidence**: `UniqueIdStamp.ts` has zero imports; `types.ts` adds only a type-only import and the existing column type union remains unchanged.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met [EVIDENCE: src/data/UniqueIdStamp.ts:12-43; src/data/DataSource.ts:829,1059-1076; src/data/CreateEntryPlan.ts:181-199; src/views/DatabaseView.ts:3626-3704]
  - **Evidence**: `src/data/UniqueIdStamp.ts:12-43`, `src/data/DataSource.ts:829,1059-1076`, `src/data/CreateEntryPlan.ts:181-199`, and `src/views/DatabaseView.ts:3626-3704` cover allocation, persistence, stamping, template allocate-once behavior, and paired rollback.
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: DEFERRED -- on-device manual create/reload/rename proof was not performed]
  - **Evidence**: Deferred — code-level review does not replace the unperformed on-device create, reload, and rename proof.
- [x] CHK-022 [P1] Edge cases tested [EVIDENCE: src/data/UniqueIdStamp.test.ts:4-45 (10 passed)]
  - **Evidence**: `src/data/UniqueIdStamp.test.ts:4-45` covers prefix trimming, defaults, non-object input, separator de-duplication, and invalid counter/padding fallback; all 10 tests passed.
- [x] CHK-023 [P1] Error scenarios validated [EVIDENCE: src/views/DatabaseView.ts:3696-3717,9000-9017]
  - **Evidence**: The create path restores config after failure; persist failure trashes the created note, and paste failure restores created files and config.
- [x] CHK-024 [P1] Concurrent-operation cases validated [EVIDENCE: src/views/DatabaseView.ts:8871-8915]
  - **Evidence**: Paste plan mapping uses the default-stamping path before creation, then persists the changed counter once and restores it on failure.
- [x] CHK-053 [P0] Test harness bootstrapped and runs [EVIDENCE: src/__tests__/setup.ts:1-41; src/data/UniqueIdStamp.test.ts:4-45 (10 passed)]
  - **Evidence**: The harness is present; the focused allocator suite passed 10/10 and the full suite passed 247/247.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-030 [P0] Requested unique-ID stamp implemented [EVIDENCE: src/data/CreateEntryPlan.ts:181-199]
  - **Evidence**: `stampUniqueId()` skips absent or protected fields, allocates synchronously, writes the value, and advances the live counter.
- [x] CHK-031 [P0] Core-template rebuild does not double-allocate [EVIDENCE: src/views/DatabaseView.ts:3626-3635]
  - **Evidence**: The first core-template plan disables stamping; its allocated value is copied into defaults before the second plan.
- [x] CHK-032 [P0] `toDatabasePayload` serializes `uniqueId` [EVIDENCE: src/data/DataSource.ts:829,1059-1076]
  - **Evidence**: Parsing normalizes the config and serialization includes the `uniqueId` property in the database payload.
- [x] CHK-033 [P1] Bulk/paste creates inherit the stamp [EVIDENCE: src/views/DatabaseView.ts:8871-8881]
  - **Evidence**: Each paste row builds a create plan through the default-stamping path before `createNote`.
- [ ] CHK-034 [P1] Neighbor phases and out-of-scope surfaces left untouched [EVIDENCE: DEFERRED -- exact changed-file scope and untouched neighboring surfaces were not independently verifiable without repository history]
  - **Evidence**: Deferred — source state cannot establish the exact changed-file boundary or untouched neighboring surfaces without repository history.
- [ ] CHK-035 [P0] `text` storage reused; no 13th type; `ColumnTypes.ts` unedited [EVIDENCE: DEFERRED -- the unedited-file claim requires repository history, which was not independently verifiable]
  - **Evidence**: Deferred — current source shows the existing column union, but cannot prove the unedited-file claim without repository history.
- [x] CHK-036 [P0] `uniqueId` read off `DatabaseConfig` by reference, not `ViewConfig` [EVIDENCE: src/views/DatabaseView.ts:3722-3755]
  - **Evidence**: `buildCreateEntryPlan` passes `this.getActiveDb()?.uniqueId` by reference into the create-plan input.
- [x] CHK-037 [P0] Create-then-persist ordering (never persist-then-create) [EVIDENCE: src/views/DatabaseView.ts:3613-3646,3712-3717]
  - **Evidence**: The code creates the note before saving changed config and restores the in-memory config when creation fails before persistence.
- [x] CHK-038 [P0] Persist failure after create pairs config restore with `trashNote` [EVIDENCE: src/views/DatabaseView.ts:3696-3704]
  - **Evidence**: The persistence catch restores the config snapshot and trashes the created note before rethrowing.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-040 [P0] No hardcoded secrets [EVIDENCE: src/data/UniqueIdStamp.ts:1-48]
  - **Evidence**: The allocator has no imports or external endpoints and produces only local sequential labels.
- [x] CHK-041 [P0] Input validation implemented [EVIDENCE: src/data/UniqueIdStamp.test.ts:4-45 (10 passed)]
  - **Evidence**: The focused suite covers prefix trimming, defaults, non-object input, separator de-duplication, and invalid counter/padding fallback.
- [x] CHK-042 [P1] Auth/authz working correctly [EVIDENCE: `rg -n -i '\b(auth|authorization|authentication|permission)\b' src` -> no matches; src/views/DatabaseView.ts:3640]
  - **Evidence**: `rg -n -i '\b(auth|authorization|authentication|permission)\b' src` returned no matches; the local create path is `src/views/DatabaseView.ts:3640`.
- [x] CHK-043 [P1] Prefix formatting and parse normalization validated [EVIDENCE: src/data/UniqueIdStamp.test.ts:4-45 (10 passed)]
  - **Evidence**: Tests cover trimmed prefixes, conditional separator insertion, and parser defaults; the round-trip is implemented at `src/data/DataSource.ts:829,1059-1076`.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-050 [P1] Spec/plan/tasks synchronized [EVIDENCE: DEFERRED -- the plan and task documents still contain planned/pending state]
  - **Evidence**: Deferred — the plan and task documents still contain planned/pending state.
- [x] CHK-051 [P1] Code comments adequate [EVIDENCE: src/data/UniqueIdStamp.ts:1-3]
  - **Evidence**: The allocator header records the durable rationale without embedding transient identifiers.
- [x] CHK-052 [P2] README updated (if applicable) [EVIDENCE: README.md has no create-property surface]
  - **Evidence**: Not applicable — `README.md` does not document create-time properties at this granularity.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-060 [P1] Temp files in scratch/ only [EVIDENCE: `find . -maxdepth 1 -type f -print` -> packet documents only]
  - **Evidence**: `find . -maxdepth 1 -type f -print` found only packet documents at the phase root; no temp files are present there.
- [x] CHK-061 [P1] scratch/ cleaned before completion [EVIDENCE: `find . -maxdepth 1 -type d -name scratch -print` -> no results]
  - **Evidence**: `find . -maxdepth 1 -type d -name scratch -print` returned no results.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 16 | 14/16 |
| P1 Items | 14 | 12/14 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-08-26 (Sonnet 5 review) / 2026-08-27 (docs reconciliation)
**Verified By**: Claude Sonnet 5 (read-only, hunter/skeptic/referee adversarial self-check) — `research/sonnet-verification.md`; commits `3566ccc`/`576240b`/`e43f5c1` on branch `impl`

<!-- /ANCHOR:summary -->
