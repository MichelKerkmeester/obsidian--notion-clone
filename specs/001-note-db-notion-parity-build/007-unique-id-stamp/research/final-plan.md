# Final Plan: Unique-ID Stamp on Row Create
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

**Solid.** The locked design matches the fork. `planCreateEntry` is the only create choke point (`CreateEntryPlan.ts:119-173`; sole caller `DatabaseView.buildCreateEntryPlan` at `3638-3671`). `toDatabasePayload` is a whitelist (`DataSource.ts:1041-1063`) so `uniqueId` will silently vanish unless both parse (`parseDatabaseConfig` return at `773-793`) and serialize are edited. `text` already stores `INV-001` (`types.ts:50`, `ColumnTypes.ts:125-138`); a 13th type is correctly refused. `EuroFormat.ts:1-42` is the right isolated-diff model. Opt-in, pad-3 as a documented fork extension, YAML-only v1, and best-effort iCloud uniqueness are the right operator defaults (`research/synthesis.md` §Open questions 1–3, 6, 9). Paste already clones `before` at `DatabaseView.ts:8737`, stamps via `buildCreateEntryPlan` in the `8751-8762` map, then persists once at `8790-8796` and restores `before` on failure at `8872-8887` — that path is already the correct counter lifecycle.

**Wrong sequence / wrong estimate.** `tasks.md` marks T002/T003 `[P]` with T001. They are not parallel: both need `UniqueIdConfig` from the new module. T008 (defaults) is not a task; it is T001. T004 is negative work (do not edit `ColumnTypes.ts`); fold it into the checklist. T005/T007 duplicate the same persist seam. Effort S (~5h) holds only if UI/read-only stay deferred (T014/T015) and tests do not invent a test runner the fork does not have: `package.json` scripts are `dev`/`build`/`lint`/`lint:all` only; `vitest` is a devDependency and `vitest.config.ts` already points at missing `src/__tests__/setup.ts`.

**Under-weighted traps (synthesis named them; tasks under-specify).**

1. **Persist-then-create is the worse order.** Plan §Ordering says clone → increment → persist → `createNote` (`DatabaseView.ts:3561-3567`). If persist succeeds and `createNote` throws, memory rollback via `replaceDatabaseConfig` (`9513-9517`) is not enough — disk already has `counter+1` unless you persist the rollback. Today's outer catch (`3628-3634`) restores config **only** when `registeredGroupOption` is true; a normal create does not. Paste already does create-then-persist. Copy that.

2. **Core-template double plan is real.** `createEntry` builds the plan at `3554`, then rebuilds at `3555-3557` when `template?.engine === "core"`. A naive stamp in `planCreateEntry` increments twice (`research/research.md` I1 f4). Skip-if-present is necessary but not sufficient: the second call seeds `contextFrontmatter` from column defaults + template + `defaults` (`3654-3659`), not from the first plan. If `unique-id` is not copied into `defaults` or template frontmatter, the second call sees an empty field and stamps again.

3. **`uniqueId` lives on `DatabaseConfig`, not `ViewConfig`.** `buildCreateEntryPlan` takes a `ViewConfig` (`3638-3642`). `getCreateContextConfig` (`4014-4026`) merges folders/rules/schema only. Passing `config.uniqueId` is a type error. The live object must be `this.getActiveDb().uniqueId` (`783-785` / `entry.config`) **by reference**, so `input.uniqueId.counter = nextCounter` mutates the session config the debounce/save path will write.

4. **Settings-store persistence is a ghost.** Research I2 f6 worried about non-file DBs. `isShowingFileDatabase()` is hardcoded `true` (`935-937`); `saveViewEntryConfig` writes only when `entry.sourcePath` is a `TFile` (`6127-6131`). Do not add a `settings.ts` counter path.

5. **Same-object increment vs debounce.** `saveConfigImmediately` (`6076-6088`) can flush a stale pending save. The allocator must increment in-memory synchronously in `planCreateEntry` and never re-read the last disk counter inside a burst (`synthesis` ranked item 3). Debounced save writes the final counter.

6. **`UniqueIdConfig.field: string` vs “missing field → `unique-id`”.** The sketched interface requires `field`, but Scenario 5 and `synthesis` defaults treat it as optional. Parse/normalize must fill defaults; the pure formatter must not throw on a YAML stub `{ prefix: "INV" }`.

**Not a build blocker.** Two-device duplicate IDs remain the biggest product risk (`spec.md` §6); do not add locks. Lookup URLs (T023) stay out. Neighbor phases 006/008 are packet order only (`depends_on: none`).

## Optimizations

- **One type, one module:** define `UniqueIdConfig` in `src/data/UniqueIdStamp.ts`. `types.ts` `import type { UniqueIdConfig } from "./UniqueIdStamp"` onto `DatabaseConfig` (`256-291`). Do not duplicate the interface. Keep UniqueIdStamp runtime-import-free (type-only import is allowed; EuroFormat has zero runtime imports).
- **Add `parseUniqueIdConfig(raw): UniqueIdConfig | undefined` in the same module.** Absent/non-object → `undefined` (opt-in). Present object → `counter=0`, `prefix=""`, `padWidth=3`, `field="unique-id"`. First allocate also writes the resolved `padWidth`/`field` back onto the live config so `INV-1` and `INV-001` cannot drift (`synthesis` edge: pad frozen per database).
- **Stamp only on the final plan.** `createEntry`: first `buildCreateEntryPlan` (`3554`) omits `uniqueId` (it only exists to feed `resolveCoreRecordTemplate(template, plan.filename)` at `3555-3557`). Second call (and every non-core path, including paste `8759`) passes `getActiveDb().uniqueId`. Keep skip-if-`frontmatter[field]`-present as defense against template smuggling (`RecordTemplate.ts:25-26` already strips `db_view`/`database`, not arbitrary keys).
- **Create then persist, paired rollback.** Match paste: clone (already at `3543`) → stamp in final plan → `createNote` → `saveViewEntryConfig(..., { skipHistory: true })` (`6147-6152`). On `createNote` failure: `replaceDatabaseConfig(entry.config, beforeConfig)` always, not only `registeredGroupOption`. On persist failure after a successful create: restore config **and** `trashNote` (same pairing as `3612-3621`). Never restore the counter while leaving the note (duplicate on retry). Never persist-then-create (burned number + extra disk rollback).
- **Cut from the build list:** T004, T008, T014, T015, T023. Merge T005+T007. Bootstrap `src/__tests__/setup.ts` here (vitest is already configured and currently unloadable); do not add a UniqueId modal; do not add a 13th type.
- **Prefix formatting:** `prefix.trim()` then `prefix ? `${prefix}-${number}` : number`. Do not honor a user-supplied trailing hyphen (would emit `INV--001`).

## Final build plan (ordered)

1. **Create `src/data/UniqueIdStamp.ts`** — Effort **S**. Zero runtime imports; durable-why header only (stable identity at create; do not couple to file name). Export `UniqueIdConfig`, `parseUniqueIdConfig`, `nextUniqueId` as in `research/synthesis.md` §Recommended build (pad default 3; `Number.isFinite` / `counter >= 0`; empty prefix → `001`). **Accept:** unit cases `INV`+0 → `INV-001`/`nextCounter=1`; missing prefix → `001`; `{}` → field `unique-id`; non-object → `undefined`. **Depends:** none.

2. **Call site 1 — `src/data/types.ts:256-291`** — Effort **S**. `uniqueId?: UniqueIdConfig` on `DatabaseConfig`. **Accept:** compile; no change to the `ColumnDef.type` union at `types.ts:50`. **Depends:** step 1.

3. **Call site 2 — `src/data/DataSource.ts`** — Effort **S**. In `parseDatabaseConfig` return (`773-793`) set `uniqueId: parseUniqueIdConfig(source["uniqueId"] ?? database["uniqueId"])`. In `toDatabasePayload` (`1041-1063`) emit `uniqueId` when present. Writes already go `updateViewDefFile` → `enqueueWrite` → `f["database"] = this.toDatabasePayload(dbConfig)` (`991-1001`). **Accept:** round-trip a stub `{ prefix: "INV" }` through parse+payload; omit the key when unset. **Depends:** step 2.

4. **Call site 3 — `src/data/CreateEntryPlan.ts`** — Effort **S**. Extend `CreateEntryPlanInput` (`78-98`) with `uniqueId?: UniqueIdConfig`. After `plan.filename = resolveFilename(ctx)` (`170-172`), before `return plan`: if `input.uniqueId` is set, field is not computed/rollup (`312-316`), and `plan.frontmatter[field]` is empty, `nextUniqueId` then `plan.frontmatter[field] = value; input.uniqueId.counter = nextCounter` (and freeze `padWidth`/`field` on `input.uniqueId`). Schemaless write is already legal (`304-310`). **Accept:** two sequential `planCreateEntry` calls with the same config object yield `INV-001` then `INV-002`; second call with field already set does not increment. **Depends:** step 1.

5. **Wiring — `src/views/DatabaseView.ts` `buildCreateEntryPlan` (`3638-3671`)** — Effort **S**. Pass `this.getActiveDb()?.uniqueId` by reference into `planCreateEntry` when the caller asks to stamp (new optional arg, default true). Do **not** read uniqueId off the `ViewConfig`. **Accept:** TypeScript; live `entry.config.uniqueId.counter` advances. **Depends:** steps 2–4.

6. **Core-template once — `createEntry` (`3554-3557`)** — Effort **S**. First `buildCreateEntryPlan(..., { stampUniqueId: false })`; after `resolveCoreRecordTemplate`, second call stamps. Non-core / paste (`8759`) stamps on the single call. **Accept:** a core-template create increments the counter once. **Depends:** step 5.

7. **Persist + rollback — `createEntry` try/catch (`3560-3635`) and paste (`8737-8906`)** — Effort **S**. After successful `createNote`, `saveViewEntryConfig(entry, mutation, { skipHistory: true })`. Outer catch: always `replaceDatabaseConfig` if `uniqueId` was bumped. Persist failure after create: restore + `trashNote` (mirror `3612-3621`). Paste already restores `before` at `8887`; verify the plan-map stamps before `createNote` so `configChanged` at `8790` is true and one `updateViewDefFile` writes the final counter. **Accept:** failed `createNote` leaves counter unchanged in memory **and** on disk; persist failure does not leave a live note with a rolled-back counter. **Depends:** steps 5–6.

8. **Tests + harness** — Effort **S**. Add empty `src/__tests__/setup.ts` (required by `vitest.config.ts`). Add `src/data/UniqueIdStamp.test.ts`. Run `npx vitest run src/data/UniqueIdStamp.test.ts` (no `package.json` script required this phase). Manual: YAML `database.uniqueId: { prefix: "INV" }` on a finance DB; create two rows → `INV-001`/`INV-002`; reload continues; rename does not change the property (`FileRenamePlan.ts:19-22`); pre-existing notes unstamped; missing block → no stamp. **Depends:** steps 1–7.

9. **Diff gate** — Effort **S**. Scoped files: `UniqueIdStamp.ts` (new), `types.ts`, `DataSource.ts`, `CreateEntryPlan.ts`, `DatabaseView.ts`, plus test/setup only. No `ColumnTypes.ts`, no `EuroFormat.ts`, no 006/008, no telemetry, comments are durable-why only. **Depends:** step 8.

## Risks & open decisions

| Item | Residual risk | Recommended default |
|------|----------------|---------------------|
| Two devices before iCloud merge | Both read counter *N*, emit the same id (`spec.md` §6; `enqueueWrite` is per-file, `DataSource.ts:99-120`) | Document best-effort. Do not add lock files or vault scans. |
| Opt-in vs always-on | Always-on writes `unique-id: 001` on unrelated DBs | **Opt-in:** stamp only when `database.uniqueId` exists. |
| Pad vs Notion `TASK-3` | Changing later breaks already-stamped `INV-001` | **Pad 3**, persist `padWidth` on first use. |
| Prefix-less format | `ID-001` vs `001` | **`001`** (empty prefix). |
| Field key | Schema mutation at stamp time | **`unique-id`**; user adds a `text` column later. |
| Undo | `skipHistory` + `pushHistory({ type: "created" })` at `3623` does not revert config | **Leave holes**; do not reissue. Invoice identity > dense sequences. |
| Immutable cell | Notion read-only; fork `text` is editable | **Leave editable** this phase (T015 deferred). |
| Config UI | YAML-only is awkward for non-dev users | **YAML v1**; T014 only if allocator lands under budget. |
| Persist failure vs create success | Duplicate if counter rolled back while note lives | **Paired trash + config restore** (step 7). |
| `package.json` `"test"` script | Vitest config exists; script does not | **`npx vitest run`**; do not expand this diff into package.json unless 008 needs it next. |
