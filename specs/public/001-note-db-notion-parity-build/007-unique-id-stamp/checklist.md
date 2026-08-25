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
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan review findings; status Planned"
    next_safe_action: "Build phase 007 per reconciled plan.md and tasks.md"
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

- [ ] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: spec.md]
  - **Evidence**: Pending build. `spec.md` states REQ-001–REQ-005 (create-time stamp in `planCreateEntry`, `DatabaseConfig.uniqueId` counter + optional prefix, isolated `src/data/UniqueIdStamp.ts` module, file-name independence, mobile/iCloud/MIT constraints) with the locked design and exact call sites.
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: plan.md]
  - **Evidence**: Pending build. `plan.md` locks the allocator module (`UniqueIdStamp.ts` with `UniqueIdConfig`, `parseUniqueIdConfig`, `nextUniqueId` + `prefix.trim()`), `CreateEntryPlan.ts` stamp site (freeze `padWidth`/`field`), `DatabaseConfig.uniqueId` persistence via type-only import (`parseDatabaseConfig` + `toDatabasePayload`), `DatabaseView.ts` wiring (pass `this.getActiveDb()?.uniqueId` by reference via `stampUniqueId` arg; core-template first-call `false`), create-then-persist with paired rollback, and the `EuroFormat.ts` diff model.
- [ ] CHK-003 [P1] Dependencies identified and available [EVIDENCE: plan.md dependencies]
  - **Evidence**: Pending build. `plan.md` lists `planCreateEntry`, `toDatabasePayload` whitelist, `DatabaseView.buildCreateEntryPlan`, `EuroFormat.ts`, and `text` column type; `006-link-scheme-fields` is adjacency only (`depends_on: none`); vitest is a devDependency and `vitest.config.ts` exists but points at missing `src/__tests__/setup.ts` (bootstrapped this phase).

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks [EVIDENCE: fork lint after build]
  - **Evidence**: Pending. Run the fork's existing lint/format command (script read from fork `package.json` at build) after `src/data/UniqueIdStamp.ts` and the call-site edits land.
- [ ] CHK-011 [P0] No console errors or warnings [EVIDENCE: create-two-rows]
  - **Evidence**: Pending. Creating two rows must not throw in `planCreateEntry` or log allocator failures.
- [ ] CHK-012 [P1] Error handling implemented [EVIDENCE: DatabaseView.ts createEntry try/catch]
  - **Evidence**: Pending. Create-then-persist: on `createNote` failure always `replaceDatabaseConfig(entry.config, beforeConfig)` if `uniqueId` was bumped (not only the `registeredGroupOption` branch at `3610-3621`); on persist failure after a successful create, restore config **and** `trashNote` (mirror `3612-3621`); config write failure must fail on the existing `CreateEntryDiagnosticReason` / `showCreateEntryNotice` path, not silently reuse an id. Never persist-then-create.
- [ ] CHK-013 [P1] Code follows project patterns [EVIDENCE: EuroFormat.ts model]
  - **Evidence**: Pending. New `src/data/UniqueIdStamp.ts` (zero runtime imports; type-only imports allowed) + type-only import in `types.ts` (do not duplicate the interface) + call-site edits in `DataSource.ts`, `CreateEntryPlan.ts` + `DatabaseView.ts` wiring; `EuroFormat.ts` and `ColumnTypes.ts` unmodified; no `settings.ts` counter path; test harness `src/__tests__/setup.ts` + `src/data/UniqueIdStamp.test.ts` added; comments carry durable why only (no spec paths, phase numbers, or requirement ids).

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: REQ-001 through REQ-005]
  - **Evidence**: Pending. Sequential ids, persisted counter (normalized by `parseUniqueIdConfig`), rebase-clean diff, rename-stable property, and constraint set in `spec.md` must be demonstrated after implementation; SC-005 (create-then-persist paired rollback) must be demonstrated.
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: finance vault]
  - **Evidence**: Pending. Create two invoice/expense rows (`INV-001` then `INV-002`), reload, rename one file, force a `createNote` failure and a persist failure, confirm older notes were not backfilled.
- [ ] CHK-022 [P1] Edge cases tested [EVIDENCE: spec.md §8 edge cases]
  - **Evidence**: Pending. Missing `uniqueId` block (`parseUniqueIdConfig` → `undefined`, no stamp), missing fields inside a present block (`counter=0`, `prefix=""`, `padWidth=3`, `field="unique-id"` → `001`), YAML stub `{ prefix: "INV" }` does not throw, empty database, frozen pad width per database (first allocate writes `padWidth`/`field` back), `prefix.trim()` (no `INV--001`), schemaless property write, and computed/rollup keys never stamped.
- [ ] CHK-023 [P1] Error scenarios validated [EVIDENCE: create-plan failure path]
  - **Evidence**: Pending. Failed `createNote` leaves the counter unchanged in memory **and** on disk (create-then-persist, not persist-then-create); failed persist after a successful create restores config + `trashNote` (no live note with rolled-back counter; no duplicate on retry); failed config write fails on the existing create/save notice path; undo of a created row leaves a sequence hole (no reissued `INV-001`).
- [ ] CHK-024 [P1] Concurrent-operation cases validated [EVIDENCE: spec.md §8]
  - **Evidence**: Pending. Two rapid same-device creates get distinct ids (synchronous in-memory increment by reference before the second allocate; never re-read the disk counter inside a burst); two devices before iCloud merge may collide — documented best-effort, no lock files.
- [ ] CHK-053 [P0] Test harness bootstrapped and runs [EVIDENCE: npx vitest run]
  - **Evidence**: Pending. Empty `src/__tests__/setup.ts` added (required by the existing `vitest.config.ts`); `src/data/UniqueIdStamp.test.ts` added; `npx vitest run src/data/UniqueIdStamp.test.ts` passes (no new `package.json` `test` script — scripts are `dev`/`build`/`lint`/`lint:all` only).

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-030 [P0] Requested unique-ID stamp implemented [EVIDENCE: CreateEntryPlan.ts + src/data/UniqueIdStamp.ts]
  - **Evidence**: Pending. No fork files have been changed yet; implementation must stamp at create (after the source-rule overlay), write `input.uniqueId.counter = nextCounter` by reference, freeze `padWidth`/`field` on first allocate, and persist counter + optional prefix on `DatabaseConfig.uniqueId`.
- [ ] CHK-031 [P0] Core-template rebuild does not double-allocate [EVIDENCE: DatabaseView.ts:3554-3557]
  - **Evidence**: Pending. On `template?.engine === "core"`, the **first** `buildCreateEntryPlan` call passes `stampUniqueId: false` (it only feeds `resolveCoreRecordTemplate`); the second call stamps and copies the first stamp into `defaults` so the skip-if-present guard holds (skip-if-present alone is insufficient — the second call re-seeds `contextFrontmatter` from defaults/template). A core-template create increments the counter exactly once.
- [ ] CHK-032 [P0] `toDatabasePayload` serializes `uniqueId` [EVIDENCE: DataSource.ts:1041-1063]
  - **Evidence**: Pending. After reload, the next create continues from the persisted counter (SC-002); confirm the whitelist no longer drops `uniqueId`; `parseUniqueIdConfig` normalizes defaults on parse.
- [ ] CHK-033 [P1] Bulk/paste creates inherit the stamp [EVIDENCE: DatabaseView.ts:8751-8779]
  - **Evidence**: Pending. Per-row plans via `buildCreateEntryPlan` stamp on the single call; verify the plan-map stamps before `createNote` so `configChanged` at `8790` is true and one `updateViewDefFile` writes the final counter; verify no double-stamp on the paste-with-rename path.
- [ ] CHK-034 [P1] Neighbor phases and out-of-scope surfaces left untouched [EVIDENCE: git scope]
  - **Evidence**: Pending. Diff must not include `006-link-scheme-fields` or `008-derived-inverse-relations` work, must not edit formula/rollup/filter modules, `ColumnTypes.ts`, `EuroFormat.ts`, or add a `settings.ts` counter path.
- [ ] CHK-035 [P0] `text` storage reused; no 13th type; `ColumnTypes.ts` unedited [EVIDENCE: git scope]
  - **Evidence**: Pending. `text` already stores `INV-001` (`types.ts:50`, `ColumnTypes.ts:125-138`); the `ColumnDef.type` union is unchanged and `ColumnTypes.ts` is not in the diff (negative work folded out of the task list into this check).
- [ ] CHK-036 [P0] `uniqueId` read off `DatabaseConfig` by reference, not `ViewConfig` [EVIDENCE: DatabaseView.ts:3638-3671]
  - **Evidence**: Pending. `buildCreateEntryPlan` passes `this.getActiveDb()?.uniqueId` by reference via the new optional `stampUniqueId` arg (default `true`); reading `uniqueId` off the `ViewConfig` arg at `3638-3642` is a type error and would not mutate the session config the save path persists.
- [ ] CHK-037 [P0] Create-then-persist ordering (never persist-then-create) [EVIDENCE: DatabaseView.ts:3543,3560-3635]
  - **Evidence**: Pending. The counter is bumped in memory only before `createNote`; persist happens after a successful `createNote` via `saveViewEntryConfig(..., { skipHistory: true })`. No persist-then-create path that would burn a number and force an extra disk rollback.
- [ ] CHK-038 [P0] Persist failure after create pairs config restore with `trashNote` [EVIDENCE: DatabaseView.ts:3612-3621]
  - **Evidence**: Pending. On persist failure after a successful create, the config is restored **and** the note is trashed (mirror `3612-3621`); no live note carries a rolled-back counter (no duplicate on retry).

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-040 [P0] No hardcoded secrets [EVIDENCE: allocator + config]
  - **Evidence**: Pending. Unique IDs are local labels such as `INV-001`; no tokens, credentials, or telemetry endpoints.
- [ ] CHK-041 [P0] Input validation implemented [EVIDENCE: UniqueIdStamp.ts + db_view prefix/counter]
  - **Evidence**: Pending. `parseUniqueIdConfig` returns `undefined` for absent/non-object (opt-in) and fills defaults for present objects (`counter=0`, `prefix=""`, `padWidth=3`, `field="unique-id"`); missing or non-numeric counter falls back to `0`; missing `padWidth` falls back to `3`; `Number.isFinite` guard prevents `NaN` ids; `prefix.trim()` prevents `INV--001`; the pure formatter does not throw on a YAML stub `{ prefix: "INV" }`.
- [ ] CHK-042 [P1] Auth/authz working correctly [EVIDENCE: not applicable]
  - **Evidence**: Pending / not applicable. This phase is local plugin create-path behavior; no auth surface.
- [ ] CHK-043 [P1] Prefix formatting and parse normalization validated [EVIDENCE: UniqueIdStamp.test.ts]
  - **Evidence**: Pending. `prefix.trim()` then `prefix ? `${prefix}-${number}` : number`; a user-supplied trailing hyphen is not honored; `parseUniqueIdConfig` round-trips a stub `{ prefix: "INV" }` into a full config and `toDatabasePayload` emits it.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-050 [P1] Spec/plan/tasks synchronized [EVIDENCE: spec-plan-task sync]
  - **Evidence**: Pending until after build. Scaffold describes the same Planned unique-ID stamp across `spec.md`, `plan.md`, `tasks.md`, and `checklist.md`, reconciled to `research/final-plan.md` (create-then-persist, `parseUniqueIdConfig`, by-reference wiring, merged/folded/cut tasks, `npx vitest run`).
- [ ] CHK-051 [P1] Code comments adequate [EVIDENCE: durable why]
  - **Evidence**: Pending. Allocator and call-site comments must explain why the id is stamped at create and stored off the file name; they must not embed spec paths, phase numbers, or requirement ids.
- [ ] CHK-052 [P2] README updated (if applicable)
  - **Evidence**: Pending / optional. Defer unless the fork README already documents create-time properties; no README change is required for Effort S.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-060 [P1] Temp files in scratch/ only [EVIDENCE: no temp files]
  - **Evidence**: Pending. Build must not leave allocator experiments outside fork `src/data/` or this spec folder.
- [ ] CHK-061 [P1] scratch/ cleaned before completion [EVIDENCE: no scratch dir]
  - **Evidence**: Pending. `007-unique-id-stamp/` must contain no `scratch/` residue at completion.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 16 | 0/16 |
| P1 Items | 14 | 0/14 |
| P2 Items | 1 | 0/1 |

**Verification Date**: Pending
**Verified By**: Not yet verified (Planned scaffold)

<!-- /ANCHOR:summary -->
