---
title: "Tasks: Unique-ID Stamp on Row Create"
description: "Ordered task list from the research synthesis ranked backlog: create-time unique-ID stamping via an isolated src/data allocator, DatabaseConfig.uniqueId persistence, and CreateEntryPlan.ts stamp site."
trigger_phrases:
  - "unique id tasks"
  - "unique-id stamp tasks"
  - "createentryplan tasks"
  - "db_view counter tasks"
  - "invoice id tasks"
  - "allocator module tasks"
  - "row create stamp tasks"
  - "unique id verification tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/007-unique-id-stamp"
    last_updated_at: "2026-08-27T12:25:50Z"
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
# Tasks: Unique-ID Stamp on Row Create

> Task list is the research synthesis ranked backlog (`research/synthesis.md` §Ranked backlog), ordered by rank. Each task carries its real fork `file:line` target and effort tier. Deferred/blocked items are marked `[B]`. Fork-relative `src/...` paths resolve under the fork root `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable (no task is parallel this phase — T002/T003 both need `UniqueIdConfig` from T001, so the build is strictly sequenced per the final build plan) |
| `[B]` | Blocked / deferred (P2 or out of scope this phase) |

**Task Format**: `T### [P?] Description (file path:line) [effort S/M/L]`

**Effort tiers**: S = small (allocator-sized, ≤1 file/module), M = medium (view layer + i18n), L = large (forced via custom protocol — do not build).

**Sequencing**: tasks are ordered to match `research/final-plan.md` §Final build plan (ordered). Each task lists its `Depends:` step; do not start a task before its dependency is complete.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

> Final build plan steps 1–4: allocator module, then the three strictly-sequenced call sites (each depends on the prior — no parallelism, the prior `[P]` markers were wrong).

- [x] T001 Create the unique-ID allocator module — new zero-runtime-import `src/data/UniqueIdStamp.ts` exporting `UniqueIdConfig`, `parseUniqueIdConfig(raw): UniqueIdConfig | undefined` (absent/non-object → `undefined` = opt-in; present object → defaults `counter=0`, `prefix=""`, `padWidth=3`, `field="unique-id"`), and pure `nextUniqueId(cfg)` returning `{ value, nextCounter }` with `prefix.trim()` (no `INV--001`); mirror `src/data/EuroFormat.ts:1-42`; type-only imports allowed; durable-why header only. This task folds in the documented-defaults work (was a separate defaults task — defaults live in the parser/formatter, not a build task). (`src/data/UniqueIdStamp.ts` new) [S] — **Depends:** none -- src/data/UniqueIdStamp.ts:5-43
- [x] T002 Call site 1 — add `uniqueId?: UniqueIdConfig` to `DatabaseConfig` via `import type { UniqueIdConfig } from "./UniqueIdStamp"` (type-only; do not duplicate the interface); no change to the `ColumnDef.type` union at `types.ts:50` (`src/data/types.ts:256-291`) [S] — **Depends:** step 1 -- src/data/types.ts:4,263-299
- [x] T003 Call site 2 — parse `database.uniqueId` via `parseUniqueIdConfig` in `parseDatabaseConfig` return (`773-793`) **and** serialize in `toDatabasePayload` (`1041-1063`) or the whitelist silently drops it (`src/data/DataSource.ts:773-793,1041-1063`) [S] — **Depends:** step 2 -- src/data/DataSource.ts:829,1076
- [x] T004 Call site 3 — extend `CreateEntryPlanInput` (`78-98`) with `uniqueId?: UniqueIdConfig`; after `plan.filename = resolveFilename(ctx)` (`170-172`), before `return plan`, if `input.uniqueId` is set, the field is not computed/rollup (`312-316`), and `plan.frontmatter[field]` is empty, `nextUniqueId` then `plan.frontmatter[field] = value; input.uniqueId.counter = nextCounter` and freeze `padWidth`/`field` on `input.uniqueId` (`src/data/CreateEntryPlan.ts:78-98,170-172`) [S] — **Depends:** step 1 -- src/data/CreateEntryPlan.ts:80-101,173-198

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

> Final build plan steps 5–7 plus bulk/paste verification. The prior T005 (debounce-safe increment) and T007 (wiring) duplicated the same persist seam and are merged here; the prior T008 (defaults) was folded into T001; the prior T004 (text reuse / no 13th type) was negative work and is folded into the checklist.

### Core Documents
- [x] T005 Wire `DatabaseView.buildCreateEntryPlan` to pass `uniqueId` in by reference — sole caller of `planCreateEntry`; pass `this.getActiveDb()?.uniqueId` **by reference** (lives on `DatabaseConfig`, not `ViewConfig` — reading it off the `ViewConfig` arg at `3638-3642` is a type error) via a new optional `stampUniqueId` arg (default `true`); mutate `input.uniqueId.counter = nextCounter` synchronously in-memory so same-tick creates cannot reread a stale disk counter; debounced save writes the final counter (`src/views/DatabaseView.ts:3638-3671,6076-6088`) [S] — **Depends:** steps 2–4 -- src/views/DatabaseView.ts:3626-3637,3672-3679,3722-3755
- [x] T006 Allocate-once across core-template rebuild — `createEntry` first `buildCreateEntryPlan(..., { stampUniqueId: false })` (it only feeds `resolveCoreRecordTemplate` at `3555-3557`); after template resolve, the second call stamps and copies the first stamp into `defaults` so the skip-if-present guard holds (skip-if-present alone is not sufficient — the second call re-seeds `contextFrontmatter` from defaults/template, not the first plan); non-core and paste (`8759`) stamp on the single call (`src/views/DatabaseView.ts:3554-3557,8759`) [S] — **Depends:** step 5 -- src/views/DatabaseView.ts:3626-3635
- [x] T007 Create-then-persist + paired rollback (merged persist seam) — match paste: clone `beforeConfig` (already at `3543`) → stamp in the final plan → `createNote` → on success `saveViewEntryConfig(entry, mutation, { skipHistory: true })` (`6147-6152`); on `createNote` failure always `replaceDatabaseConfig(entry.config, beforeConfig)` if `uniqueId` was bumped (not only when `registeredGroupOption`); on persist failure after a successful create restore config **and** `trashNote` (mirror `3612-3621`); never persist-then-create (burned number + extra disk rollback); never restore the counter while leaving the note (`src/views/DatabaseView.ts:3543,3560-3635,8737-8906`) [S] — **Depends:** steps 5–6 -- src/views/DatabaseView.ts:3613-3715
- [x] T008 Bulk / paste creates inherit the stamp — verify paste plan-map stamps before `createNote` so `configChanged` at `8790` is true and one `updateViewDefFile` writes the final counter; paste already restores `before` at `8887`; edit only if paste-with-rename double-stamps (`src/views/DatabaseView.ts:8751-8779,8790,8887`) [S] — **Depends:** steps 6–7 -- src/views/DatabaseView.ts:8871-8915

### Verification Documents
- [x] T009 Record build evidence in the checklist after implementation (`checklist.md`) [15m] -- checklist.md:61-179
- [x] T010 Update implementation summary with what actually shipped (`implementation-summary.md`) [15m] -- implementation-summary.md:47-131

### Integration
- [x] T011 Leave packet tooling metadata untouched (`description.json`, `graph-metadata.json` — do not author these) [0m] -- done during build

### Deferred (P2 / cut this phase)
- [ ] [B] T012 Prefix (and pad/field) config UI — cut this phase regardless of budget; v1 ships with YAML `database.uniqueId` hand-editing. Toolbar `configureUniqueId` callback + new `src/views/modals/UniqueIdConfigModal.ts` + ~6 i18n keys × en / zh-CN / zh-TW (`src/views/DatabaseView.ts:1832-1848`, `src/i18n.ts`) [M] — do not add a UniqueId modal this phase -- DEFERRED: config UI and modal artifact were intentionally cut; YAML hand-editing is the shipped path
- [ ] [B] T013 Read-only unique-ID cell after stamp — cut this phase; cheapest P2: `src/views/CellRenderer.ts` ignore/commit-no-op when `col.key === uniqueId.field`; do not build a general read-only cell system [M] — REQ-004 is rename-independence only -- DEFERRED: no unique-ID read-only cell guard exists in the renderer; stamped text remains editable

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

> Final build plan steps 8–9 (tests + harness, diff gate) plus integration, manual, and documentation verification. Lookup URLs stay blocked (out of scope — do not build).

### Unit Tests
- [x] T014 Bootstrap the test harness + allocator unit tests — add empty `src/__tests__/setup.ts` (required by the existing `vitest.config.ts`, currently missing/unloadable; do not add a `package.json` `test` script — scripts are `dev`/`build`/`lint`/`lint:all` only) and `src/data/UniqueIdStamp.test.ts` covering `nextUniqueId` (format, increment, defaults, prefix-less `001`, `prefix.trim()` no `INV--001`) and `parseUniqueIdConfig` (absent → `undefined`, non-object → `undefined`, `{}` → field `unique-id`, stub `{ prefix: "INV" }` → defaults). Run `npx vitest run src/data/UniqueIdStamp.test.ts` (`src/data/UniqueIdStamp.ts`, `src/__tests__/setup.ts`, `src/data/UniqueIdStamp.test.ts`) [30m] — **Depends:** steps 1–7 -- src/data/UniqueIdStamp.test.ts:4-45; src/__tests__/setup.ts:1-41

### Integration Tests
- [ ] T015 Confirm sequential stamps through the create plan — two `planCreateEntry` calls with the same config object yield `INV-001` then `INV-002`; a second call with the field already set does not increment; a core-template create increments the counter once (first call `stampUniqueId: false`); reload continues from `DatabaseConfig.uniqueId.counter`; `padWidth`/`field` frozen on first allocate (`src/data/CreateEntryPlan.ts`, `src/views/DatabaseView.ts:3554-3557,3638-3671`) [30m] — **Depends:** step 14 -- DEFERRED: no create-plan integration test was produced; only allocator tests are present
- [ ] T016 Confirm `createNote` failure leaves the counter unchanged in memory **and** on disk (create-then-persist, not persist-then-create); a persist failure after a successful create restores config + `trashNote` (no live note with a rolled-back counter; no duplicate on retry) (`src/views/DatabaseView.ts:3543,3560-3635,8737-8906`) [30m] — **Depends:** step 14 -- DEFERRED: no create/persist failure integration test was produced

### Manual Verification
- [ ] T017 Create two finance rows (`INV-001` then `INV-002`), reload, rename one file, confirm no backfill of older notes, and confirm a missing `uniqueId` block → no stamp (finance vault using the fork) [30m] — **Depends:** steps 1–7 -- DEFERRED: on-device finance-vault create/reload/rename proof was not performed
- [ ] T018 Confirm bulk/paste creates inherit the stamp without double-stamping; verify the plan-map stamps before `createNote` so `configChanged` at `8790` is true (`src/views/DatabaseView.ts:8751-8779,8790`) [15m] — **Depends:** steps 6–7 -- DEFERRED: no separate bulk/paste manual proof was recorded

### Documentation
- [ ] T019 Reconcile spec/plan/tasks with the shipped diff (`spec.md`, `plan.md`, `tasks.md`, `checklist.md`) [15m] -- DEFERRED: plan.md still declares the phase Planned and cannot be edited in this dispatch
- [x] T020 Run packet strict validation (`bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh specs/public/001-note-db-notion-parity-build/007-unique-id-stamp --strict`) [10m] -- strict validator exit 0

### Diff Gate (final build plan step 9)
- [ ] T021 Confirm the scoped diff: `UniqueIdStamp.ts` (new), `types.ts`, `DataSource.ts`, `CreateEntryPlan.ts`, `DatabaseView.ts`, plus `src/__tests__/setup.ts` and `src/data/UniqueIdStamp.test.ts` only — no `ColumnTypes.ts`, no `EuroFormat.ts`, no 006/008, no telemetry, no `settings.ts` counter path, no 13th type; comments are durable-why only [10m] — **Depends:** steps 14–18 -- DEFERRED: exact changed-file scope was not independently verifiable under the no-git constraint

### Blocked (out of scope — do not build)
- [ ] [B] T022 Lookup URLs (`notion.com/TASK-1234`) — Obsidian has no equivalent data-source URL space; do not build via custom protocol/plugin URI [L] — blocked, out of scope -- DEFERRED: lookup URL support is out of scope and no implementation exists

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All non-deferred tasks marked `[x]`. Pending — no build has run; do not mark complete from this scaffold. Non-deferred tasks are T001–T011 and T014–T021.
- [ ] No unblocked `[B]` tasks remaining in-phase. Pending — T012 (config UI) and T013 (read-only cell) are P2-cut this phase; T022 (lookup URLs) is blocked/out-of-scope. The build tasks are unchecked and unblocked (`depends_on: none` for the allocator; later tasks depend on prior steps as noted).
- [ ] Strict validation passed. Pending — command is `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh specs/public/001-note-db-notion-parity-build/007-unique-id-stamp --strict`.
- [ ] Checklist.md fully verified. Pending — `checklist.md` Verification Summary must stay 0 verified until the build produces evidence.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Checklist**: See `checklist.md`
- **Research synthesis (ranked backlog source)**: See `research/synthesis.md` (evidence trail: `research/research.md`)

<!-- /ANCHOR:cross-refs -->
