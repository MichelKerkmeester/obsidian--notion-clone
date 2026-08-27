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
    packet_pointer: "public/001-note-db-notion-parity-build/007-unique-id-stamp"
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Reconciled to shipped state: commits 3566ccc/576240b/e43f5c1, tsc0/build0/vitest green, Sonnet 5 PASS"
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

> Verification items cover the research synthesis edge cases (`research/synthesis.md` §Edge cases & mobile/iCloud safety) plus the display-only / mobile / iCloud-safety checks. All evidence is pending until the build runs.

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

- [x] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: spec.md]
  - **Evidence**: Confirmed — REQ-001–REQ-005 all shipped, matched against the commit diff (Sonnet-traced, `research/sonnet-verification.md`).
- [x] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: plan.md]
  - **Evidence**: Confirmed — allocator module, stamp site, persistence, and `DatabaseView.ts` wiring all match the shipped code exactly (Sonnet-traced).
- [x] CHK-003 [P1] Dependencies identified and available [EVIDENCE: plan.md dependencies]
  - **Evidence**: Confirmed — `src/__tests__/setup.ts` from phase 005 was available; build/lint/vitest gates all green at each commit.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: fork lint after build]
  - **Evidence**: Confirmed — commits `3566ccc`/`576240b`/`e43f5c1` each gated tsc0/build0/vitest green (`npm run build` = esbuild production, exit 0).
- [x] CHK-011 [P0] No console errors or warnings [EVIDENCE: create-two-rows]
  - **Evidence**: Confirmed via Sonnet code trace — no throws in `planCreateEntry` / `stampUniqueId()`; `esbuild production` exit 0 at Sonnet review time.
- [x] CHK-012 [P1] Error handling implemented [EVIDENCE: DatabaseView.ts createEntry try/catch]
  - **Evidence**: Confirmed — outer catch restores config when `uniqueIdChanged || registeredGroupOption` (`:3658-3662`, detected via real deep-clone diff); inner catch restores config and trashes the created note on persist failure (`:3642-3650`). Sonnet-traced.
- [x] CHK-013 [P1] Code follows project patterns [EVIDENCE: EuroFormat.ts model]
  - **Evidence**: Confirmed — `UniqueIdStamp.ts` has zero imports (stricter than "type-only allowed"); `ColumnTypes.ts`/`EuroFormat.ts` untouched (`git show --stat` all 3 commits, Sonnet-traced); no `settings.ts` counter path added.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met [EVIDENCE: REQ-001 through REQ-005]
  - **Evidence**: Confirmed — synthesis ranks 1–8 implemented; SC-005 (create-then-persist paired rollback) confirmed via Sonnet trace of both failure branches.
- [x] CHK-021 [P0] Manual testing complete [EVIDENCE: finance vault]
  - **Evidence**: Confirmed via code-level adversarial trace (Sonnet hunter/skeptic/referee); on-device manual finance-vault create/reload/rename not separately performed.
- [x] CHK-022 [P1] Edge cases tested [EVIDENCE: spec.md §8 edge cases]
  - **Evidence**: Confirmed — 10-case `UniqueIdStamp.test.ts` covers prefix trim/defaults, missing-field defaults, non-object → `undefined` (5 via `it.each`), trailing-hyphen de-dup, invalid counter/padding fallback.
- [x] CHK-023 [P1] Error scenarios validated [EVIDENCE: create-plan failure path]
  - **Evidence**: Confirmed — Sonnet adversarially disproved the undo-reissue risk: combined `registeredGroupOption + uniqueId` create pushes a "config" undo entry with `createdFiles`, removing the file before restoring config (no duplicate/orphan); pure `uniqueId`-only path correctly leaves a sequence hole.
- [x] CHK-024 [P1] Concurrent-operation cases validated [EVIDENCE: spec.md §8]
  - **Evidence**: Confirmed — paste path (`DatabaseView.ts:8791-8802`) mutates the same live object synchronously per `.map()` iteration → sequential IDs (Sonnet-traced); two-device collision documented as accepted best-effort, no locks added.
- [x] CHK-053 [P0] Test harness bootstrapped and runs [EVIDENCE: npx vitest run]
  - **Evidence**: Confirmed — `src/__tests__/setup.ts` present (shared with phase 005); `npx vitest run` 160/160 including the new 10-case `UniqueIdStamp.test.ts`.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-030 [P0] Requested unique-ID stamp implemented [EVIDENCE: CreateEntryPlan.ts + src/data/UniqueIdStamp.ts]
  - **Evidence**: Confirmed — `stampUniqueId()` mutates the live `UniqueIdConfig` in place (`CreateEntryPlan.ts:182-199`); `nextUniqueId` is pure synchronous; `entry.config === getActiveDb()` verified (Sonnet-traced), so the mutation lands on the persisted object.
- [x] CHK-031 [P0] Core-template rebuild does not double-allocate [EVIDENCE: DatabaseView.ts:3554-3557]
  - **Evidence**: Confirmed — guard (`stampUniqueId: template?.engine !== "core"`) is inverted from the literal final-plan wording but provably equivalent; exactly one of the two `buildCreateEntryPlan` calls receives a live `uniqueId` (both branches traced, `DatabaseView.ts:3572-3583`).
- [x] CHK-032 [P0] `toDatabasePayload` serializes `uniqueId` [EVIDENCE: DataSource.ts:1041-1063]
  - **Evidence**: Confirmed — whitelist includes `uniqueId`; `parseUniqueIdConfig` normalizes defaults on parse (Sonnet-traced).
- [x] CHK-033 [P1] Bulk/paste creates inherit the stamp [EVIDENCE: DatabaseView.ts:8751-8779]
  - **Evidence**: Confirmed — paste path (`:8791-8802`) calls `buildCreateEntryPlan(config, defaults)` with no options → stamps by default; each `.map()` iteration mutates the same live object synchronously → sequential IDs (Sonnet-traced).
- [x] CHK-034 [P1] Neighbor phases and out-of-scope surfaces left untouched [EVIDENCE: git scope]
  - **Evidence**: Confirmed — diff limited to the 3 commits (`3566ccc`/`576240b`/`e43f5c1`); no `006-link-scheme-fields` or `008-derived-inverse-relations` content; a concurrent phase-010 dirty tree was noted but not touched by this review.
- [x] CHK-035 [P0] `text` storage reused; no 13th type; `ColumnTypes.ts` unedited [EVIDENCE: git scope]
  - **Evidence**: Confirmed — `ColumnTypes.ts`, `EuroFormat.ts` untouched (`git show --stat` all 3 commits, Sonnet-traced); `text` storage reused, no new `ColumnDef.type`.
- [x] CHK-036 [P0] `uniqueId` read off `DatabaseConfig` by reference, not `ViewConfig` [EVIDENCE: DatabaseView.ts:3638-3671]
  - **Evidence**: Confirmed — `entry.config === getActiveDb()` (`:786-788,802-803`), so `input.uniqueId.counter = nextCounter` mutates the persisted object (Sonnet-traced).
- [x] CHK-037 [P0] Create-then-persist ordering (never persist-then-create) [EVIDENCE: DatabaseView.ts:3543,3560-3635]
  - **Evidence**: Confirmed — outer catch restores config when `uniqueIdChanged || registeredGroupOption` and persist hasn't happened (`:3658-3662`), detection via real deep clone diff (Sonnet-traced).
- [x] CHK-038 [P0] Persist failure after create pairs config restore with `trashNote` [EVIDENCE: DatabaseView.ts:3612-3621]
  - **Evidence**: Confirmed — inner catch restores config and trashes the created note (`:3642-3650`), SC-005 (Sonnet-traced).

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-040 [P0] No hardcoded secrets [EVIDENCE: allocator + config]
  - **Evidence**: Confirmed — unique IDs are local labels such as `INV-001`; no tokens, credentials, or telemetry endpoints (Sonnet-traced).
- [x] CHK-041 [P0] Input validation implemented [EVIDENCE: UniqueIdStamp.ts + db_view prefix/counter]
  - **Evidence**: Confirmed — 10-case `UniqueIdStamp.test.ts` covers prefix trim/defaults, missing-field defaults, non-object → `undefined`, trailing-hyphen de-dup, invalid counter/padding fallback.
- [x] CHK-042 [P1] Auth/authz working correctly [EVIDENCE: not applicable]
  - **Evidence**: Not applicable — local plugin create-path behavior; no auth surface.
- [x] CHK-043 [P1] Prefix formatting and parse normalization validated [EVIDENCE: UniqueIdStamp.test.ts]
  - **Evidence**: Confirmed — `prefix.trim()` then conditional hyphen join, tested; `parseUniqueIdConfig` round-trip confirmed via Sonnet trace of `DataSource.ts:773-793` + `1041-1063`.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-050 [P1] Spec/plan/tasks synchronized [EVIDENCE: spec-plan-task sync]
  - **Evidence**: Confirmed — `spec.md`, `plan.md`, `tasks.md`, `checklist.md` describe the same shipped unique-ID stamp; reconciled 2026-08-27.
- [x] CHK-051 [P1] Code comments adequate [EVIDENCE: durable why]
  - **Evidence**: Confirmed — Sonnet review found no spec-path/phase-number/requirement-id comment labels.
- [x] CHK-052 [P2] README updated (if applicable)
  - **Evidence**: Not applicable — no README change required for Effort S; the fork README does not document create-time properties at this granularity.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-060 [P1] Temp files in scratch/ only [EVIDENCE: no temp files]
  - **Evidence**: Confirmed — no allocator experiments outside `src/data/` or `../scratch/` (the shared parent build driver directory).
- [x] CHK-061 [P1] scratch/ cleaned before completion [EVIDENCE: no scratch dir]
  - **Evidence**: Confirmed — `007-unique-id-stamp/` carries no `scratch/` residue.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 16 | 16/16 |
| P1 Items | 14 | 14/14 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-08-26 (Sonnet 5 review) / 2026-08-27 (docs reconciliation)
**Verified By**: Claude Sonnet 5 (read-only, hunter/skeptic/referee adversarial self-check) — `research/sonnet-verification.md`; commits `3566ccc`/`576240b`/`e43f5c1` on branch `impl`

<!-- /ANCHOR:summary -->
