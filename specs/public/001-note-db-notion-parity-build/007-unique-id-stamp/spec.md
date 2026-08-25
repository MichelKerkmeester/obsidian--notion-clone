---
title: "Feature Specification: Unique-ID Stamp on Row Create"
description: "Stamp a Notion-style unique ID at row create time, persist the running counter and optional prefix in db_view config, and keep the change rebase-clean for finance invoice and expense ids."
trigger_phrases:
  - "unique id stamp"
  - "unique-id"
  - "auto-increment id"
  - "createentryplan unique id"
  - "invoice unique id"
  - "db_view counter"
  - "unique id prefix"
  - "row create stamp"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/007-unique-id-stamp"
    last_updated_at: "2026-08-25T21:35:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Nested sub-phases authored; UniqueIdStamp module first"
    next_safe_action: "Build 001-unique-id-stamp-module per its plan.md and tasks.md"
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
# Feature Specification: Unique-ID Stamp on Row Create

> Predecessor: `006-link-scheme-fields`. Successor: `008-derived-inverse-relations`. Parent spec: [`../spec.md`](../spec.md). Source of truth: [`research/synthesis.md`](research/synthesis.md) (evidence trail: [`research/research.md`](research/research.md)).

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
| **Branch** | `007-unique-id-stamp` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The note-database fork creates rows through `planCreateEntry` in `src/data/CreateEntryPlan.ts` and writes frontmatter, but it never allocates a Notion-style sequential unique ID at create time (`CreateEntryPlan.ts:119-173`). Finance notes therefore lack a stable invoice or expense identifier such as `INV-001` / `INV-002`. File names are not a substitute: they change on rename (`FileRenamePlan` only moves paths, `src/data/FileRenamePlan.ts:19-22`), they are not sequential per database, and they do not survive as a property independent of the note path. The research synthesis verdict is **build it**: a create-time `INV-001` stamp is the one Notion unique-ID behavior the fork can deliver as Effort S without a 13th column type, a formula engine, or a vault scan. AppFlowy and Anytype only inject view defaults and mint UUIDs, so the finance sequence is Notion-specific parity, not a copy of those trees.

### Purpose
Close that gap by allocating a unique-ID property when a row is created, storing the running counter and optional prefix in `DatabaseConfig.uniqueId` (the `database` object in the view-definition file), and isolating the allocator in a new zero-import `src/data/UniqueIdStamp.ts` module on the `EuroFormat.ts` isolated-diff model (`src/data/EuroFormat.ts:1-42`). The fork already has the create-plan surface; this phase only stamps an id there. It does not add a second formula engine, does not change rollups, does not add a 13th column type, and does not backfill existing notes. Nested children own the ordered slices: the UniqueIdStamp module and tests first, then DatabaseConfig persist, then the create-plan stamp with core-template allocate-once and paired rollback.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- A unique-ID property stamped only at row create time inside `planCreateEntry` (`src/data/CreateEntryPlan.ts`), after the source-rule overlay and after `plan.filename = resolveFilename(ctx)` (`CreateEntryPlan.ts:170-172`). The stamp writes `input.uniqueId.counter = nextCounter` and freezes `padWidth`/`field` onto the live config on first allocate so `INV-1` and `INV-001` cannot drift.
- A new zero-runtime-import `src/data/UniqueIdStamp.ts` allocator module exporting `UniqueIdConfig`, `parseUniqueIdConfig(raw): UniqueIdConfig | undefined` (absent/non-object → `undefined` = opt-in; present object → defaults `counter=0`, `prefix=""`, `padWidth=3`, `field="unique-id"`), and pure `nextUniqueId(cfg)` (mirroring `src/data/EuroFormat.ts:1-42`; type-only imports allowed, zero runtime imports).
- A `uniqueId?: UniqueIdConfig` block on `DatabaseConfig` (`src/data/types.ts:256-291`) via a **type-only** `import type { UniqueIdConfig } from "./UniqueIdStamp"` (do not duplicate the interface), parsed in `parseDatabaseConfig` (`src/data/DataSource.ts:773-793`) through `parseUniqueIdConfig` and serialized through the `toDatabasePayload` whitelist (`src/data/DataSource.ts:1041-1063`).
- Wiring in `src/views/DatabaseView.ts` (`buildCreateEntryPlan` at `3638-3671`, the sole caller of `planCreateEntry`) to pass `this.getActiveDb()?.uniqueId` **by reference** (the live `DatabaseConfig` object, not the `ViewConfig` — `uniqueId` lives on `DatabaseConfig`) via a new optional `stampUniqueId` arg (default `true`), plus the core-template rebuild guard at `3554-3557` (first `buildCreateEntryPlan` call passes `stampUniqueId: false`; the second call stamps and copies the first stamp into `defaults`).
- Create-then-persist ordering with paired rollback: stamp in the final plan → `createNote` → `saveViewEntryConfig(..., { skipHistory: true })`; on `createNote` failure always `replaceDatabaseConfig(entry.config, beforeConfig)` if `uniqueId` was bumped; on persist failure after a successful create, restore config **and** `trashNote`. Never persist-then-create.
- Finance-facing values of the form prefix + zero-padded sequential number (example `INV-001`, `INV-002`), independent of the note file name. Pad-width 3 is a documented fork extension over Notion's unpadded `TASK-3`. Prefix is `prefix.trim()`-ed and a user-supplied trailing hyphen is not honored (would emit `INV--001`).
- Additive, MIT-forkable, mobile-safe, iCloud-safe behavior: one create-time stamp and the existing db_view config write path; no telemetry and no secrets.
- A test harness bootstrap: an empty `src/__tests__/setup.ts` (required by the existing `vitest.config.ts`, currently missing) plus `src/data/UniqueIdStamp.test.ts`, run via `npx vitest run src/data/UniqueIdStamp.test.ts` (no new `package.json` script this phase).

### Out of Scope
- Backfilling unique IDs onto notes that already exist (Scenario 3 / SC-003).
- Predecessor work in `006-link-scheme-fields` and successor work in `008-derived-inverse-relations`.
- Formula engines (`ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`), rollups (`RelationRollup.ts`, still display-only: count|sum|avg|list), footers (`SummaryRenderer.ts`), charts (`ChartAggregation.ts`), filters, color-only conditional formatting (`ConditionalFormatting.ts`), view types, and relation wiring.
- A 13th `ColumnDef.type`: `text` already stores `INV-001` (`src/data/types.ts:50`, `src/data/ColumnTypes.ts:125-138`); no type-registration edit.
- Desktop-only APIs, churny vault-wide rewrites, new sidecar/lock files besides db_view config, vault-wide uniqueness scans, and Notion lookup URLs (`notion.com/TASK-1234` — no Obsidian data-source URL space).
- General per-column read-only cell machinery (P2 enrichment, backlog item 10, not this phase).
- Config UI modal + i18n (P2, backlog item 9) — cut this phase; v1 ships with YAML `database.uniqueId` hand-editing regardless of budget.
- A plugin `settings.ts` counter path. `isShowingFileDatabase()` is hardcoded `true` (`DatabaseView.ts:935-937`) and `saveViewEntryConfig` writes only when `entry.sourcePath` is a `TFile` (`6127-6131`); settings-store persistence is a ghost. The counter lives on `DatabaseConfig.uniqueId` only.
- Reading `uniqueId` off the `ViewConfig`. `buildCreateEntryPlan` takes a `ViewConfig` (`3638-3642`); passing `config.uniqueId` from it is a type error. The live object is `this.getActiveDb().uniqueId` by reference.
- Persist-then-create ordering (burns a number and forces an extra disk rollback if `createNote` then throws).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/UniqueIdStamp.ts` | Add | New zero-runtime-import pure allocator: `UniqueIdConfig` interface, `parseUniqueIdConfig(raw)` (absent/non-object → `undefined`; present → defaults filled), `nextUniqueId(cfg)` returning `{ value, nextCounter }` with `prefix.trim()`. Durable-why header only. |
| `src/data/types.ts` | Modify | Add `uniqueId?: UniqueIdConfig` to `DatabaseConfig` (`types.ts:256-291`) via `import type { UniqueIdConfig } from "./UniqueIdStamp"` (type-only; do not duplicate the interface). Call site 1. |
| `src/data/DataSource.ts` | Modify | Parse `database.uniqueId` via `parseUniqueIdConfig` in `parseDatabaseConfig` (`773-793`) **and** serialize in `toDatabasePayload` (`1041-1063`) — whitelist drops unknown keys. Call site 2 (one file). |
| `src/data/CreateEntryPlan.ts` | Modify | Extend `CreateEntryPlanInput` with `uniqueId?: UniqueIdConfig`; stamp after line 172 when `plan.frontmatter[field]` is empty and the field is not computed/rollup (`312-316`); write `input.uniqueId.counter = nextCounter` and freeze `padWidth`/`field` on `input.uniqueId`. Call site 3. |
| `src/views/DatabaseView.ts` | Modify (wiring) | `buildCreateEntryPlan` (`3638-3671`) passes `this.getActiveDb()?.uniqueId` by reference via a new optional `stampUniqueId` arg (default `true`); core-template rebuild guard (`3554-3557`) — first call `stampUniqueId: false`, second stamps and copies the first stamp into `defaults`; create-then-persist via `saveViewEntryConfig(..., { skipHistory: true })` (`6147-6152`); paired rollback (`3628-3635`, `3612-3621`). Existing consumer of call site 3, not a new subsystem. |
| `src/__tests__/setup.ts` | Add | Empty setup file required by the existing `vitest.config.ts` (currently missing/unloadable). Test harness only. |
| `src/data/UniqueIdStamp.test.ts` | Add | Unit tests for `nextUniqueId` and `parseUniqueIdConfig`. Test harness only. |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Stamp a unique-ID property at row create time | `planCreateEntry` (`CreateEntryPlan.ts`) writes the allocated id onto the new row during create, after the source-rule overlay; a second create in the same database yields the next sequence value (`INV-001` then `INV-002`) |
| REQ-002 | Persist allocator state in db_view config | `{ field, prefix, counter, padWidth }` lives on `DatabaseConfig.uniqueId`, normalized by `parseUniqueIdConfig` (absent/non-object → no stamp = opt-in; present → defaults filled) and serialized by `toDatabasePayload`; restarting the vault and creating another row continues the sequence rather than restarting |
| REQ-003 | Keep the diff rebase-clean | New `src/data/UniqueIdStamp.ts` module plus the call-site edits in `types.ts`, `DataSource.ts`, `CreateEntryPlan.ts`, and the `DatabaseView.ts` wiring; no unrelated churn; comment text states durable why only (no spec-path, phase-number, or requirement-id comments) |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Keep finance ids independent of file name | The stamped property remains unchanged when the note file is renamed (`FileRenamePlan` only moves paths); invoice/expense identity is the property, not the path |
| REQ-005 | Honor fork constraints | Behavior is mobile-safe (`UniqueIdStamp.ts` has no Electron/desktop APIs, `Intl` only like `EuroFormat.ts`), MIT-forkable, iCloud-safe (one extra YAML key on the new note + one extra field inside the existing `database` payload; no backfill, no sibling-note rewrite, no sidecar), and contains no telemetry or secrets |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Creating two rows in a database configured with `uniqueId: { prefix: "INV" }` yields `INV-001` then `INV-002` (pad-width 3 fork extension; prefix-less default is `001`).
- **SC-002**: After reload, the next create continues from the persisted `DatabaseConfig.uniqueId.counter` rather than reallocating an earlier value.
- **SC-003**: Notes that existed before this change are left unstamped; only new creates receive an id (stamp lives inside `planCreateEntry` only).
- **SC-004**: The git diff is a new `src/data/UniqueIdStamp.ts` module plus the call-site edits and `DatabaseView.ts` wiring, matching the `EuroFormat.ts` isolated-diff model.
- **SC-005**: A failed `createNote` leaves the counter unchanged in memory **and** on disk (create-then-persist, not persist-then-create); a persist failure after a successful create restores the config **and** trashes the note, so no live note carries a rolled-back counter (no duplicate on retry).

### Acceptance Scenarios

- **Scenario 1**: **Given** a database whose `database.uniqueId` has `prefix: "INV"` and `counter: 0` or missing, **when** the user creates a row, **then** the new row's `unique-id` (or configured `field`) property is `INV-001` and the stored counter advances to `1`.
- **Scenario 2**: **Given** a row was just created with `INV-001`, **when** the user creates another row in the same database, **then** the second row receives `INV-002` and the first row keeps `INV-001`.
- **Scenario 3**: **Given** existing finance notes with no unique-ID property, **when** this feature ships, **then** those notes are not rewritten solely to backfill ids.
- **Scenario 4**: **Given** a unique-ID already stamped, **when** the user renames the note file, **then** the unique-ID property is unchanged (rename only moves paths).
- **Scenario 5**: **Given** `database.uniqueId` is present but `prefix` is omitted, **when** a row is created, **then** the allocator produces `001` (empty prefix, pad 3) using the documented defaults (`counter=0`, `prefix=""`, `padWidth=3`, `field="unique-id"`) rather than failing the create.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Two devices creating rows before iCloud sync | Duplicate unique IDs — both read counter *N* and emit the same id. **The single biggest risk** (not implementation difficulty). | Treat uniqueness as best-effort across iCloud; do not add lock files or vault scans; document the limitation. `enqueueWrite` serializes per file on one device only. |
| Dependency | `planCreateEntry` create path (`CreateEntryPlan.ts:119-173`) | Stamp site renamed upstream would block the call-site plan | Confirmed by research; keep the allocator module free of UI imports |
| Dependency | `toDatabasePayload` whitelist (`DataSource.ts:1041-1063`) | Unknown keys are silently dropped; counter would never persist | Add `uniqueId` to both `parseDatabaseConfig` and `toDatabasePayload` |
| Risk | Core-template double plan (`DatabaseView.ts:3554-3557`) | Two allocations, one discarded id | Allocate once on the **final** plan: first `buildCreateEntryPlan` call passes `stampUniqueId: false` (it only feeds `resolveCoreRecordTemplate`); the second call stamps and copies the first stamp into `defaults` so the skip-if-present guard holds. Skip-if-present alone is not sufficient — the second call re-seeds `contextFrontmatter` from defaults/template, not the first plan |
| Risk | `createNote` failure after counter bump | Burned number with no note, or note with rolled-back counter (duplicate on retry) | Create-then-persist (match paste): stamp in the final plan → `createNote` → `saveViewEntryConfig(..., { skipHistory: true })`. Clone `beforeConfig` before the increment; on `createNote` failure always `replaceDatabaseConfig(entry.config, beforeConfig)` if `uniqueId` was bumped (not only when `registeredGroupOption`). On persist failure after a successful create, restore config **and** `trashNote` (mirror `3612-3621`). Never persist-then-create |
| Risk | `uniqueId` read off the wrong config object | `buildCreateEntryPlan` takes a `ViewConfig` (`3638-3642`); passing `config.uniqueId` from it is a type error and would not mutate the session config the debounce/save path writes | Pass `this.getActiveDb()?.uniqueId` **by reference** so `input.uniqueId.counter = nextCounter` mutates the live `DatabaseConfig` the save path persists |
| Risk | Settings-store persistence is a ghost | `isShowingFileDatabase()` is hardcoded `true` (`935-937`); `saveViewEntryConfig` writes only when `entry.sourcePath` is a `TFile` (`6127-6131`) — a `settings.ts` counter path would never load | Do not add a `settings.ts` counter path; the counter lives on `DatabaseConfig.uniqueId` only |
| Risk | Debounced save writes stale counter | Rapid same-device creates re-read a stale persisted counter; `saveConfigImmediately` (`6076-6088`) can flush a stale pending save | Increment the in-memory counter synchronously in `planCreateEntry` and never re-read the last disk counter inside a burst; debounced save writes the final counter |
| Risk | Backfill temptation | iCloud churn on existing finance notes | Create-time only; existing rows stay out of scope |
| Dependency | Wave adjacency `006-link-scheme-fields` / `008-derived-inverse-relations` | None for this build (`depends_on: none`) | Do not wait on 006 or extend into 008; adjacency is packet order only |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Allocating an id at create is a constant-time read-increment-write on the in-memory `DatabaseConfig.uniqueId.counter`; `planCreateEntry` is synchronous, so two creates in the same tick get distinct numbers. Creating a row must not scan the vault or recompute other rows.

### Security
- **NFR-S01**: No telemetry, no secrets, no credentials in unique-ID values or config; ids are local sequential labels such as `INV-001`.

### Reliability
- **NFR-R01**: The next id after a vault reload matches the persisted counter; the feature does not introduce extra note-body churn beyond the single create write already performed by `createNote` (`DataSource.ts:328-358`).

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- Missing `database.uniqueId` block: do not stamp (opt-in; `parseUniqueIdConfig` returns `undefined`). Missing fields *inside* a present block: `parseUniqueIdConfig` fills `counter=0`, `prefix=""`, `padWidth=3`, `field="unique-id"` → first id `001` (Scenario 5). The pure formatter must not throw on a YAML stub `{ prefix: "INV" }`.
- Empty database (no rows): first create still stamps; uniqueness is the counter, not a file listing.
- Pad width frozen per database: persist `padWidth` on the config block so `INV-1` and `INV-001` cannot coexist; first allocate writes the resolved `padWidth`/`field` back onto the live config.
- Prefix formatting: `prefix.trim()` then `prefix ? `${prefix}-${number}` : number`; a user-supplied trailing hyphen is not honored (would emit `INV--001`).
- Property not in schema: write schemaless YAML (`CreateEntryPlan.ts:304-310`); do not crash create.
- Computed/rollup keys: never stamp those keys (`CreateEntryPlan.ts:312-316`; `DatabaseView.ts:3656`).
- `text` storage reuse: `text` already stores `INV-001` (`types.ts:50`, `ColumnTypes.ts:125-138`); no `ColumnTypes.ts` edit and no 13th type (negative work — verified in the checklist, not a build task).

### Error Scenarios
- `createNote` failure: create-then-persist means the counter is bumped in memory only before `createNote`; on failure always `replaceDatabaseConfig(entry.config, beforeConfig)` if `uniqueId` was bumped (not only the `registeredGroupOption` branch at `3610-3621`). Do not leave a burned number *and* no note, and do not leave a note *and* a rolled-back counter (duplicate on retry).
- Persist failure after a successful create: restore config **and** `trashNote` (mirror `3612-3621`); never restore the counter while leaving the note. Never persist-then-create (burned number + extra disk rollback).
- Config write failure: do not silently reuse an id; fail on the existing create/save notice path (`CreateEntryDiagnosticReason` / `showCreateEntryNotice`; `errors.createFailed` at `3633`). `updateViewDefFile` already throws after clearing overrides (`DataSource.ts:1004-1006`).
- User-edited id after stamp: no vault-wide uniqueness scan this phase.
- Undo of a created row: default `pushHistory({ type: "created", file })` (`3623`) does not revert config. With `skipHistory` counter writes, undo leaves a hole in the sequence (do not reissue `INV-001`). Acceptable for invoices.

### Concurrent Operations
- Two rapid creates on one device must not receive the same id: increment the in-memory counter synchronously before the second allocate reads it; debounced save writes the final counter.
- Two devices before iCloud merge may still collide; do not add desktop-only file locks to "fix" that. Document best-effort.

### Mobile + iCloud
- This feature is **not** display-only: the spec requires a real frontmatter property plus a db_view counter write. Safety is **create-time only**, not "no writes."
- **Mobile:** `UniqueIdStamp.ts` has no Electron/desktop APIs (`Intl` only, same as `EuroFormat.ts`). The stamp lives in the shared plan, not a desktop view; mobile uses the same create path. Any later modal uses Obsidian `Modal` (already imported on `DatabaseView`).
- **iCloud:** one extra YAML key on the **new** note (the same `vault.create` `createNote` already performs) and one extra field inside the existing `database` payload on the **view-def file** (the same `processFrontMatter` path). No backfill, no sibling-note rewrite, no extra sidecar, no telemetry/secrets. `enqueueWrite` serializes per file on one device; it does not fence two devices.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 10/25 | One `src/data/UniqueIdStamp.ts` module, `planCreateEntry` stamp, `DatabaseConfig.uniqueId` persistence; no backfill, no rollup/formula work, no 13th type |
| Risk | 8/25 | Two-device duplicate-id window is the biggest risk; still additive and create-time only |
| Research | 6/20 | 10-iteration synthesis with locked design, exact file:line call sites, and ranked backlog |
| **Total** | **24/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

Research resolved the prior UNKNOWNs. The remaining items are operator decisions with recommended defaults (see `research/synthesis.md` §Open questions):

1. **Opt-in vs always-on** — Recommended: **opt-in** (stamp only when `database.uniqueId` exists). Always-on would write `unique-id: 001` onto unrelated databases.
2. **Prefix-less format** — Recommended: **`001`** (empty prefix, pad 3), not `ID-001`. Matches Notion's nullable prefix.
3. **Pad width vs Notion** — Recommended: **pad 3 as a fork extension**, stored on the config block. Notion displays `TASK-3` unpadded; changing later is a breaking format change for already-stamped `INV-001`.
4. **Stamp field key** — Recommended: **`unique-id`**. Users add a `text` column with that key to see it; no schema mutation at stamp time.
5. **Immutable after create** — Recommended for this phase: **leave the `text` cell editable** (REQ-004 is rename-independence, already true by construction). Notion read-only is P2 (backlog item 10).
6. **Config UI in this diff** — Recommended: **YAML `database.uniqueId` is sufficient for v1**; toolbar modal + i18n (item 9) is cut this phase regardless of budget. Prefix must be set via hand-editing the view-def file to ship REQ-001–003.
7. **Call-site file count** — Recommended: **accept `DatabaseView.ts` as wiring for call site 3** (only `planCreateEntry` caller + core-template guard). Do not drop the stamp from `CreateEntryPlan.ts` or skip `toDatabasePayload`.
8. **Undo vs reuse** — Recommended: **`skipHistory` counter persist; do not reuse IDs after undo** (invoice identity). Reverting the counter on undo is the alternative if dense sequences are preferred.
9. **Two-device duplicates** — Recommended: **document best-effort; do not add locks or vault scans.**
10. **13th column type** — Recommended: **no** — `text` holds the string (`types.ts:50`). Revisit only if a later phase requires structured `{ number, prefix }` or true read-only typing.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research Synthesis**: See `research/synthesis.md` (evidence trail: `research/research.md`)

<!-- /ANCHOR:related-docs -->

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | 001-unique-id-stamp-module/ | Zero-import `UniqueIdStamp.ts` (`UniqueIdConfig`, `parseUniqueIdConfig`, `nextUniqueId`, pad-3 defaults) plus `setup.ts` and `UniqueIdStamp.test.ts` | Planned |
| 2 | 002-unique-id-config-persist/ | Attach `uniqueId` on `DatabaseConfig` and round-trip it through `parseDatabaseConfig` plus `toDatabasePayload` | Planned |
| 3 | 003-create-entry-stamp/ | Stamp in `planCreateEntry`, wire `DatabaseView`, allocate once on core-template rebuild, create-then-persist with paired rollback and paste inherit | Planned |

Future / out of this phase (not child folders): prefix config UI and i18n modal (ranked item 9); read-only unique-ID cell (item 10); Notion lookup URLs (item 11, blocked); a 13th `unique_id` column type (item 7, negative work).

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/speckit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001-unique-id-stamp-module | 002-unique-id-config-persist | `UniqueIdStamp.ts` exports `UniqueIdConfig`, `parseUniqueIdConfig` (absent/non-object → `undefined`; present stub fills defaults), and `nextUniqueId`; zero runtime imports; unit cases green | `npx vitest run src/data/UniqueIdStamp.test.ts`; `INV`+0 → `INV-001`; `{}` → field `unique-id`; non-object → `undefined` |
| 002-unique-id-config-persist | 003-create-entry-stamp | `DatabaseConfig` has `uniqueId?: UniqueIdConfig` via type-only import; `parseDatabaseConfig` and `toDatabasePayload` both carry `uniqueId`; unset omits the key | Round-trip YAML stub `{ prefix: "INV" }` through parse+payload; `ColumnDef.type` union at `types.ts:50` unchanged |
<!-- /ANCHOR:phase-map -->
