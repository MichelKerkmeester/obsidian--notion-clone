---
title: "Implementation Plan: Unique-ID Stamp on Row Create"
description: "Plan to add a create-time unique-ID allocator as an isolated src/data module, stamp it from CreateEntryPlan.ts, and persist counter plus optional prefix in db_view config."
trigger_phrases:
  - "unique id stamp"
  - "unique-id plan"
  - "createentryplan stamp"
  - "db_view counter"
  - "euroformat isolated diff"
  - "invoice unique id"
  - "row create unique id"
  - "unique id allocator"
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
# Implementation Plan: Unique-ID Stamp on Row Create

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript Obsidian plugin fork (MIT) |
| **Framework** | note-database fork; fork-relative paths `src/...` (root: `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin`) |
| **Storage** | Unique-ID property on the created note's frontmatter; `{ field, prefix, counter, padWidth }` on `DatabaseConfig.uniqueId` in the view-definition file's `database` payload |
| **Testing** | Fork tests if present; manual create-two-rows + reload + rename check; packet `validate.sh --strict` |

### Overview
This phase is Planned, not built. The locked design (from `research/synthesis.md`) adds Notion-style unique IDs (`INV-001`, `INV-002`) at row create time for stable finance invoice/expense identity independent of file name. The allocator is a new zero-import `src/data/UniqueIdStamp.ts` module imitating `src/data/EuroFormat.ts:1-42` (pure exports, no Obsidian imports). `planCreateEntry` in `src/data/CreateEntryPlan.ts` stamps the value after the source-rule overlay. `DatabaseConfig.uniqueId` holds the counter and optional prefix, parsed by `parseDatabaseConfig` and serialized by `toDatabasePayload`. The diff stays additive and rebase-clean: 1 new module + call-site edits in `types.ts`, `DataSource.ts`, `CreateEntryPlan.ts`, plus `DatabaseView.ts` wiring (the sole caller of `planCreateEntry`). Effort S, `depends_on: none`. The single biggest risk is two unsynced devices allocating from the same persisted counter (duplicate IDs); uniqueness is best-effort across iCloud, documented, no lock files. Wave adjacency is `006-link-scheme-fields` then this packet then `008-derived-inverse-relations`; those neighbors are not build blockers.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Fork create path confirmed: `planCreateEntry` in `src/data/CreateEntryPlan.ts:119-173`; sole caller `DatabaseView.buildCreateEntryPlan` at `3638-3671`.
- [x] `EuroFormat.ts` isolated-diff model confirmed as the shape to copy (`src/data/EuroFormat.ts:1-42`, zero imports, 2 consumer files).
- [x] db_view config persistence located: `DatabaseConfig` (`types.ts:256-291`), `parseDatabaseConfig` (`DataSource.ts:773-793`), `toDatabasePayload` whitelist (`DataSource.ts:1041-1063`).
- [x] Column-type surface confirmed: `text` stores `INV-001` (`types.ts:50`, `ColumnTypes.ts:125-138`); no 13th type.
- [x] Scope locked: create-time stamp only; no backfill; no 006/008 work; no formula/rollup/filter edits; no `unique_id` type.

### Definition of Done
- [ ] Unique-ID property stamped at create with an advancing sequence (`INV-001` then `INV-002`); a second create with the field already set does not increment.
- [ ] Counter and optional prefix persisted on `DatabaseConfig.uniqueId` (normalized by `parseUniqueIdConfig`) and surviving reload.
- [ ] Create-then-persist with paired rollback: failed `createNote` leaves the counter unchanged in memory and on disk; persist failure after create restores config + `trashNote`.
- [ ] Diff is one new `src/data/UniqueIdStamp.ts` module plus `src/__tests__/setup.ts` + `src/data/UniqueIdStamp.test.ts` plus the call-site edits and `DatabaseView.ts` wiring, mobile-safe, iCloud-safe, MIT-forkable, no telemetry, no `settings.ts` counter path, no `ColumnTypes.ts` edit.
- [ ] `spec.md` success scenarios have observable pass/fail evidence recorded in `checklist.md` after the build.

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Isolated `src/data/UniqueIdStamp.ts` allocator (same placement discipline as `EuroFormat.ts:1-42`) consumed by the existing create plan. No new view type, no second formula engine, no rollup write-back, no 13th column type.

### Locked Design — Allocator Module (`src/data/UniqueIdStamp.ts`, new)
Zero runtime imports (type-only imports allowed; `EuroFormat.ts:1-42` has zero runtime imports), durable-why header only (stable identity at create; do not couple to file name). Mirror `src/data/EuroFormat.ts:1-42` (pure exports; two consumers today: `src/views/CellRenderer.ts:13`, `src/views/SummaryRenderer.ts:7`). One module owns the type and the parse/normalize logic — `types.ts` imports the interface type-only; do not duplicate it.

```ts
export interface UniqueIdConfig {
  prefix?: string;
  counter: number;
  padWidth?: number;
  field?: string;
}

export function parseUniqueIdConfig(raw: unknown): UniqueIdConfig | undefined {
  if (!raw || typeof raw !== "object") return undefined; // opt-in
  const r = raw as Record<string, unknown>;
  return {
    counter: typeof r.counter === "number" && Number.isFinite(r.counter) && r.counter >= 0 ? r.counter : 0,
    prefix: typeof r.prefix === "string" ? r.prefix : "",
    padWidth: typeof r.padWidth === "number" && r.padWidth >= 1 ? r.padWidth : 3,
    field: typeof r.field === "string" && r.field ? r.field : "unique-id",
  };
}

export function nextUniqueId(cfg: UniqueIdConfig): { value: string; nextCounter: number } {
  const counter = Number.isFinite(cfg.counter) && cfg.counter >= 0 ? cfg.counter : 0;
  const pad = cfg.padWidth && cfg.padWidth >= 1 ? cfg.padWidth : 3;
  const number = String(counter + 1).padStart(pad, "0");
  const prefix = (cfg.prefix ?? "").trim();
  return {
    value: prefix ? `${prefix}-${number}` : number,
    nextCounter: counter + 1,
  };
}
```

- Stamp **only if** `database.uniqueId` is present (`parseUniqueIdConfig` returns `undefined` for absent/non-object = opt-in). Inside the block, missing `prefix` → `""` → `001`; missing `counter` → `0` (first value `001`); missing `padWidth` → `3`; missing `field` → `"unique-id"`. The pure formatter must not throw on a YAML stub `{ prefix: "INV" }`.
- `nextUniqueId` does **not** persist. Caller writes `cfg.counter = nextCounter` on the live `DatabaseConfig` **by reference** before returning the plan (same-tick creates cannot reread a stale disk counter). First allocate also writes the resolved `padWidth`/`field` back onto the live config so `INV-1` and `INV-001` cannot drift (pad frozen per database).
- Prefix is `prefix.trim()`-ed; a user-supplied trailing hyphen is not honored (would emit `INV--001`).
- Pad-3 is a **documented fork extension** over Notion's unpadded `TASK-3`. Store `padWidth` on the config block so a database cannot drift between `INV-1` and `INV-001`.
- Architecture analog (not UUID semantics): AppFlowy injects cells in `v_will_created_row` before persist (`view_editor.rs:189-226`); Anytype merges view defaults then `C.ObjectCreate` (`dataview.ts:701-734`). The fork's equivalent layer is the `contextFrontmatter` copy + source-rule overlay in `planCreateEntry`. Stamp **after** that overlay so the id wins over column defaults, view filters, group/calendar defaults, and template frontmatter (`CreateEntryPlan.ts:127-172`; `DatabaseView.ts:3654-3659`). AppFlowy `gen_row_id()` UUID is explicitly **not** the finance sequence.

### Locked Design — Persistence
`db_view` config **is** the `database` object in the view-definition file (`parseDatabaseConfig` merges `fm` then `database`, `DataSource.ts:628-637`). Add `uniqueId?: UniqueIdConfig` to `DatabaseConfig` (`types.ts:256-291`) via `import type { UniqueIdConfig } from "./UniqueIdStamp"` (type-only; do not duplicate the interface). Parse it with `parseUniqueIdConfig` in the `return { ... }` of `parseDatabaseConfig` (`DataSource.ts:773-793`). Serialize it in `toDatabasePayload` (`DataSource.ts:1041-1063`) or the whitelist silently drops it. Writes go through `updateViewDefFile` → `app.fileManager.processFrontMatter` → `f["database"] = this.toDatabasePayload(dbConfig)` (`DataSource.ts:991-1001`), serialized with `enqueueWrite`. Persist counter with `saveViewEntryConfig(..., { skipHistory: true })` (`DatabaseView.ts:305-309`, `6147-6152`) so counter ticks do not flood undo; clone `beforeConfig` **before** the increment so a failed `createNote` can `replaceDatabaseConfig`. Do not add a `settings.ts` counter path — `isShowingFileDatabase()` is hardcoded `true` (`935-937`) and `saveViewEntryConfig` writes only when `entry.sourcePath` is a `TFile` (`6127-6131`); the settings store is a ghost.

### Locked Design — Stamp Site
After `plan.filename = resolveFilename(ctx)` (`CreateEntryPlan.ts:170-172`): if `input.uniqueId` is set, the field is not `computed`/`rollup` (`CreateEntryPlan.ts:312-316`), and `plan.frontmatter[field]` is empty, `const { value, nextCounter } = nextUniqueId(input.uniqueId); plan.frontmatter[field] = value; input.uniqueId.counter = nextCounter` and freeze `padWidth`/`field` onto `input.uniqueId` on first allocate. `field` defaults to `"unique-id"` when omitted. Do not stamp `computed`/`rollup` (`DatabaseView.ts:3656`). Templates cannot smuggle counter state: `parseRecordTemplate` deletes `db_view` and `database` (`RecordTemplate.ts:25-26`); keep skip-if-`frontmatter[field]`-present as defense against template smuggling of arbitrary keys. Schemaless frontmatter is enough for visibility (`applySchemalessRule`, `CreateEntryPlan.ts:304-310`, `390-416`); no 13th type.

### Call Sites (1 new module + these edits)

| # | File | Edit |
|---|------|------|
| — | `src/data/UniqueIdStamp.ts` | **New** isolated module: `UniqueIdConfig`, `parseUniqueIdConfig`, `nextUniqueId` (does not count as a call-site edit). |
| 1 | `src/data/types.ts` | `uniqueId?: UniqueIdConfig` on `DatabaseConfig` (`256-291`) via `import type { UniqueIdConfig } from "./UniqueIdStamp"` (type-only). |
| 2 | `src/data/DataSource.ts` | `parseUniqueIdConfig` in `parseDatabaseConfig` (`773-793`) + `toDatabasePayload` whitelist (`1041-1063`) (one file). |
| 3 | `src/data/CreateEntryPlan.ts` | Extend `CreateEntryPlanInput` with `uniqueId?: UniqueIdConfig`; stamp after line 172; freeze `padWidth`/`field` on `input.uniqueId`. |

**Required wiring (same create-plan seam; do not skip):** `DatabaseView.buildCreateEntryPlan` (`3638-3671`) is the only caller of `planCreateEntry`. Pass `this.getActiveDb()?.uniqueId` **by reference** (the live `DatabaseConfig` object — `uniqueId` lives on `DatabaseConfig`, not `ViewConfig`; reading it off the `ViewConfig` arg at `3638-3642` is a type error) via a new optional `stampUniqueId` arg (default `true`). On `template?.engine === "core"` (`3554-3557`), the **first** `buildCreateEntryPlan` call passes `stampUniqueId: false` (it only exists to feed `resolveCoreRecordTemplate(template, plan.filename)`); after the template resolves, the **second** call stamps and copies the first stamp into `defaults` so the skip-if-present guard holds (skip-if-present alone is not sufficient — the second call re-seeds `contextFrontmatter` from defaults/template, not the first plan). Non-core and paste (`8759`) stamp on the single call. After a successful allocate + `createNote`, flush config via the existing save path (`6125-6131`). This is the 4th *file* if counted naively; it is the existing consumer of call site 3, not a new subsystem. Prefer a correct template rebuild over a literal 3-file cap.

### Key Components
- **`UniqueIdStamp.ts` (new)**: pure `nextUniqueId` + `parseUniqueIdConfig`; no persistence, no runtime imports.
- **`CreateEntryPlan.ts`**: stamp site after the rule overlay; freezes `padWidth`/`field` on first allocate.
- **`DatabaseConfig.uniqueId`**: source of truth for `{ field, prefix, counter, padWidth }`, normalized by `parseUniqueIdConfig`.
- **`DatabaseView.ts`**: wiring (pass `this.getActiveDb()?.uniqueId` by reference via `stampUniqueId` arg, core-template first-call-`false` guard, create-then-persist with paired rollback).
- **Non-components**: `RelationRollup.ts` stays display-only; `ComputedField.ts` / `BaseExpression.ts` / `SafeEval.ts` unused; `ConditionalFormatting.ts` unused; no `unique_id` column type; no `ColumnTypes.ts` edit; no `settings.ts` counter path.

### Data Flow
User creates a row → `buildCreateEntryPlan` passes `this.getActiveDb()?.uniqueId` by reference into `planCreateEntry` (first call `stampUniqueId: false` for core-template) → after the source-rule overlay, `nextUniqueId` formats the next id → caller writes `cfg.counter = nextCounter` on the live `DatabaseConfig` and freezes `padWidth`/`field` → `plan.frontmatter[field] = value` → `createNote(plan.folder, plan.filename, plan.frontmatter, ...)` writes the note → on success, counter persisted via `saveViewEntryConfig(..., { skipHistory: true })` → `updateViewDefFile` → `processFrontMatter`. On `createNote` failure, `replaceDatabaseConfig(entry.config, beforeConfig)` if bumped. On persist failure after a successful create, restore config + `trashNote`. No vault scan. No rewrite of sibling notes. File rename later does not flow back into the property.

### Ordering
**Create-then-persist** (match the paste path at `8737-8906`, which already does this): clone `beforeConfig` (already at `3543`) → stamp in the **final** plan (increment in-memory by reference) → `createNote(plan.folder, plan.filename, plan.frontmatter, ...)` (`DatabaseView.ts:3561-3567`; `DataSource.ts:328-358`) → on success `saveViewEntryConfig(entry, mutation, { skipHistory: true })` (`6147-6152`). On `createNote` failure: always `replaceDatabaseConfig(entry.config, beforeConfig)` if `uniqueId` was bumped (not only when `registeredGroupOption`). On persist failure after a successful create: restore config **and** `trashNote` (mirror `3612-3621`). Never persist-then-create (burned number + extra disk rollback). No vault scan (`NFR-P01`).

### Do Not
- stamp in `DataSource.createNote` (non-database callers);
- source the id from a record template;
- add `unique_id` as a 13th `ColumnDef.type`;
- edit `ColumnTypes.ts` (negative work — `text` already stores `INV-001`);
- store as `number`;
- implement via `computed`;
- put the counter in a sidecar/lock file;
- put config on `ColumnMenu` (column-scoped) or plugin `settings.ts` (global — the settings store is a ghost);
- read `uniqueId` off the `ViewConfig` (type error; it lives on `DatabaseConfig`);
- persist-then-create (burns a number and forces an extra disk rollback);
- honor a user-supplied trailing hyphen in `prefix` (would emit `INV--001`);
- invent a `package.json` test script this phase (scripts are `dev`/`build`/`lint`/`lint:all` only; run `npx vitest run`).

`rebuildViewEntries` loads only view-def files (`DatabaseView.ts:1058-1064`); file-backed `updateViewDefFile` is the persistence path that matters.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [x] Read `CreateEntryPlan.ts:119-173`, `RecordTemplate.ts:25-26`, `DatabaseView.ts:3554-3567` and `3638-3671`.
- [x] Read `EuroFormat.ts:1-42` as the isolated-diff model.
- [x] Confirm `text` stores the stamped string (`types.ts:50`, `ColumnTypes.ts:125-138`); no 13th type.
- [x] Confirm `toDatabasePayload` is a whitelist (`DataSource.ts:1041-1063`).

### Phase 2: Core Implementation
- [ ] Add `src/data/UniqueIdStamp.ts` (pure `nextUniqueId` + `parseUniqueIdConfig` + `UniqueIdConfig`; `prefix.trim()`; defaults `counter=0`/`prefix=""`/`padWidth=3`/`field="unique-id"`).
- [ ] Call site 1: `uniqueId?: UniqueIdConfig` on `DatabaseConfig` via type-only import (`types.ts:256-291`).
- [ ] Call site 2: `parseUniqueIdConfig` in `parseDatabaseConfig` (`773-793`) + serialize in `toDatabasePayload` (`1041-1063`).
- [ ] Call site 3: extend `CreateEntryPlanInput` + stamp after line 172 (skip if `frontmatter[field]` already set and field is not computed/rollup); freeze `padWidth`/`field` on `input.uniqueId`.
- [ ] Wiring: `DatabaseView.buildCreateEntryPlan` passes `this.getActiveDb()?.uniqueId` by reference via a new optional `stampUniqueId` arg (default `true`); do not read off `ViewConfig`.
- [ ] Core-template once: first `buildCreateEntryPlan` call `stampUniqueId: false`; second call stamps and copies the first stamp into `defaults` (`3554-3557`); non-core/paste stamps on the single call.
- [ ] Create-then-persist + paired rollback: after successful `createNote`, `saveViewEntryConfig(..., { skipHistory: true })`; on `createNote` failure always `replaceDatabaseConfig(entry.config, beforeConfig)` if bumped; on persist failure after create, restore config + `trashNote` (`3543`, `3560-3635`, `8737-8906`).

### Phase 3: Verification
- [ ] Bootstrap empty `src/__tests__/setup.ts` (required by `vitest.config.ts`); add `src/data/UniqueIdStamp.test.ts`; run `npx vitest run src/data/UniqueIdStamp.test.ts`.
- [ ] Create two rows and confirm sequential ids (`INV-001` then `INV-002`); second create with field set does not increment.
- [ ] Reload and confirm the next create continues the persisted counter.
- [ ] Confirm existing notes were not backfilled and rename does not change the property.
- [ ] Confirm a failed `createNote` leaves the counter unchanged in memory and on disk; a persist failure after create trashes the note.
- [ ] Confirm bulk/paste creates inherit the stamp without double-stamping (`DatabaseView.ts:8751-8779`); verify the plan-map stamps before `createNote` so `configChanged` at `8790` is true.
- [ ] Inspect the diff: new `src/data/UniqueIdStamp.ts` + `src/__tests__/setup.ts` + `src/data/UniqueIdStamp.test.ts` + call-site edits + `DatabaseView.ts` wiring; no `ColumnTypes.ts`, no `EuroFormat.ts`, no 006/008, no telemetry, no `settings.ts` counter path, no spec-path comments in code.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Strict validation | This phase folder | `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh specs/public/001-note-db-notion-parity-build/007-unique-id-stamp --strict` |
| Allocator unit tests | `nextUniqueId`: format, increment, defaults, prefix-less `001`, `prefix.trim()` (no `INV--001`); `parseUniqueIdConfig`: absent → `undefined`, non-object → `undefined`, `{}` → field `unique-id`, stub `{ prefix: "INV" }` → defaults | `npx vitest run src/data/UniqueIdStamp.test.ts` (vitest is a devDependency; `vitest.config.ts` exists but points at missing `src/__tests__/setup.ts` — bootstrap it empty; do not add a `package.json` script) |
| Create-plan integration | Stamp happens once per create (core-template first-call `stampUniqueId: false` does not double-allocate); second create advances; reload continues from `DatabaseConfig.uniqueId.counter`; `padWidth`/`field` frozen on first allocate | Tests around `CreateEntryPlan.ts` / `DatabaseView.buildCreateEntryPlan` |
| Rollback test | `createNote` failure restores `beforeConfig` (counter unchanged in memory and on disk — create-then-persist); persist failure after a successful create restores config + `trashNote` (no live note with rolled-back counter; no duplicate on retry) | Extend existing create-failure test path |
| Manual | Finance invoice/expense databases | Create two rows, reload, rename one file, force a `createNote` failure and a persist failure, confirm property stability and no backfill of older notes |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `planCreateEntry` create path (`CreateEntryPlan.ts:119-173`) | Internal fork | Confirmed by research | No stamp site; cannot meet REQ-001 |
| `toDatabasePayload` whitelist (`DataSource.ts:1041-1063`) | Internal fork | Confirmed; must add `uniqueId` | Counter would never persist; duplicates after reload |
| `DatabaseView.buildCreateEntryPlan` (`3638-3671`) | Internal fork | Confirmed; sole caller | No wiring to pass `uniqueId` in; core-template guard missing |
| `EuroFormat.ts` isolated-diff model (`EuroFormat.ts:1-42`) | Internal fork | Confirmed as the model to imitate | Diff would sprawl and rebase would hurt |
| `text` column type (`types.ts:50`) | Internal fork | Confirmed stores `INV-001` | Would force a 13th type (out of scope) |
| Phase `006-link-scheme-fields` | Packet adjacency | `depends_on: none` | Does not block this build |
| Phase `008-derived-inverse-relations` | Packet adjacency | Successor only | Must not be implemented in this diff |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Create path errors, duplicated ids on sequential same-device creates, extra iCloud note churn, or a diff larger than one `src/data/UniqueIdStamp.ts` module plus `src/__tests__/setup.ts` + `src/data/UniqueIdStamp.test.ts` plus the call-site edits and `DatabaseView.ts` wiring.
- **Procedure**: Remove `src/data/UniqueIdStamp.ts` (and the test harness files added for this phase) and revert the call-site edits (`types.ts`, `DataSource.ts`, `CreateEntryPlan.ts`) and the `DatabaseView.ts` wiring. Leave already-stamped note properties in place unless the operator explicitly asks to strip them; this phase does not ship a backfill or a mass-delete migration.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | Core Implementation |
| Core Implementation | Setup | Verification |
| Verification | Core Implementation | None |

<!-- /ANCHOR:phase-deps -->
---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | 1 hour (research already done) |
| Core Implementation | Low | 3 hours |
| Verification | Low | 1 hour |
| **Total** | | **5 hours (Effort S)** |

<!-- /ANCHOR:effort -->
---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] `UniqueIdStamp.ts` lives only under fork `src/data/` and has zero runtime imports (type-only imports allowed).
- [ ] Call-site edits limited to `types.ts` (type-only import), `DataSource.ts`, `CreateEntryPlan.ts`, plus `DatabaseView.ts` wiring; `EuroFormat.ts` and `ColumnTypes.ts` are not modified.
- [ ] No backfill loop, no rollup write-back, no telemetry, no secrets, no 13th column type, no `settings.ts` counter path.
- [ ] `DatabaseConfig.uniqueId.counter` write via `saveViewEntryConfig(..., { skipHistory: true })` is the only added persistence; no new sidecar/lock file.
- [ ] `beforeConfig` is cloned before the increment; ordering is create-then-persist (never persist-then-create).
- [ ] `uniqueId` is read off `this.getActiveDb()?.uniqueId` by reference, not off the `ViewConfig`.
- [ ] Test harness bootstrapped: empty `src/__tests__/setup.ts` + `src/data/UniqueIdStamp.test.ts`; run via `npx vitest run` (no new `package.json` script).

### Rollback Procedure
1. Delete `src/data/UniqueIdStamp.ts`, `src/data/UniqueIdStamp.test.ts`, and `src/__tests__/setup.ts` (if it was created for this phase).
2. Revert `types.ts`, `DataSource.ts`, `CreateEntryPlan.ts`, and the `DatabaseView.ts` wiring.
3. Re-run the create-two-rows check to confirm creates still succeed without stamping.
4. Leave existing stamped values in notes unless the operator requests cleanup.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: Stop writing the property and counter. Do not rewrite the vault to strip ids unless explicitly requested. iCloud-safe reversal is "stop stamping," not a mass note rewrite.

<!-- /ANCHOR:enhanced-rollback -->
