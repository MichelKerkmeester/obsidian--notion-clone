# Synthesis: Unique-ID Stamp on Row Create
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict

Build it. A create-time `INV-001` stamp is the one Notion unique-ID behavior the fork can deliver as Effort S without a 13th column type, a formula engine, or a vault scan: AppFlowy and Anytype only inject view defaults and mint UUIDs, so the finance sequence is Notion-specific parity, not a copy of those trees. Lock the design as a zero-import `src/data/UniqueIdStamp.ts` allocator, a `DatabaseConfig.uniqueId` block persisted through the existing `database` payload whitelist, and a stamp inside `planCreateEntry` after the source-rule overlay. The single biggest risk is not implementation difficulty; it is two unsynced devices allocating from the same persisted counter (duplicate IDs). Do not add lock files; treat uniqueness as best-effort across iCloud and document that. The tightest in-phase decision is whether `database.uniqueId` is opt-in (recommended) and whether pad-width 3 (`INV-001`) is an accepted fork extension over Notion’s unpadded `TASK-3`.

## Ranked backlog

1. **Create-time unique-ID stamp (prefix + sequence)** — Notion auto-assigns a data-source-scoped unique ID at page create (`TASK-1234`); the fork writes frontmatter in `planCreateEntry` but never allocates a sequential identity. Feasibility: **clear**. Files: new `src/data/UniqueIdStamp.ts`; `src/data/CreateEntryPlan.ts` (after `planCreateEntry` line 172); `src/views/DatabaseView.ts` (`buildCreateEntryPlan` / `createEntry` must pass `uniqueId` in — it is the sole caller of `planCreateEntry`). Effort: **S**. Depends on: nothing (`depends_on: none`). Citation: `src/data/CreateEntryPlan.ts:119-173` plus [Notion unique ID](https://developers.notion.com/reference/property-object).

2. **Persist allocator state on `DatabaseConfig.uniqueId`** — Notion owns the counter server-side (only `prefix` is configurable); the fork must store `{ field, prefix, counter, padWidth }` inside the view-definition `database` object or reload restarts the sequence. Feasibility: **clear**. Files: `src/data/types.ts` (`DatabaseConfig` at 256–291); `src/data/DataSource.ts` (`parseDatabaseConfig` return at 773–793 **and** `toDatabasePayload` at 1041–1063 — unknown keys are dropped). Effort: **S**. Depends on: item 1’s config shape. Citation: `src/data/DataSource.ts:1041-1063`.

3. **Synchronous in-memory increment + existing config save (debounce-safe)** — Notion’s allocator is atomic per data source; the fork’s `saveConfigImmediately` / `configSaveTimer` can persist a stale counter if each create re-reads disk inside a debounce window. Feasibility: **clear**. Files: in-memory `entry.config.uniqueId.counter` mutated in the stamp path; persist via `saveViewEntryConfig` → `updateViewDefFile` (`enqueueWrite` per file) with `{ skipHistory: true }`. Effort: **S**. Depends on: item 2. Citation: `src/views/DatabaseView.ts:6076-6088` and `src/data/DataSource.ts:991-1010`.

4. **Allocate-once across core-template rebuild** — Notion has no analog; the fork rebuilds the plan when `template?.engine === "core"`, which would increment twice and discard one id if the stamp naively lives in `planCreateEntry`. Feasibility: **likely** (hazard confirmed; fix is a small guard). Files: `src/views/DatabaseView.ts:3554-3557`; skip re-allocate in `planCreateEntry` when `frontmatter[field]` is already set; pass the first stamp through `defaults` on the second `buildCreateEntryPlan`. Effort: **S**. Depends on: item 1. Citation: `src/views/DatabaseView.ts:3554-3557`.

5. **Documented defaults when prefix / pad / counter / field are omitted** — Notion: `prefix` may be `null`, number is a bare integer (`TASK-3`, no padding), counter is not user-set. Fork spec wants `INV-001` and must not mix `INV-1` with `INV-001` in one database. Feasibility: **clear**. Files: `UniqueIdStamp.ts` only (defaults live in the pure formatter). Effort: **S**. Depends on: item 1. Citation: [Notion unique ID value shape](https://developers.notion.com/reference/property-object) (`{"number": 3, "prefix": "TASK"}`).

6. **Create-failure counter rollback** — Notion never exposes a half-allocated id; the fork’s general `createNote` catch (`DatabaseView.ts:3628-3634`) restores config **only** when `registeredGroupOption` is true. The paired trash+config rollback at 3610–3621 is the option-registration save-failure path, not every create failure. If the counter is bumped before `createNote` and create throws, a normal create currently will **not** restore the counter. Feasibility: **likely**. Files: `src/views/DatabaseView.ts` `createEntry` try/catch (extend the existing `replaceDatabaseConfig(entry.config, beforeConfig)` path so a unique-id bump is always in `beforeConfig`). Effort: **S**. Depends on: items 1–3. Citation: `src/views/DatabaseView.ts:3628-3634` vs `3610-3621`.

7. **Reuse `text` storage; do not add a 13th type** — Notion’s first-class `unique_id` type is read-only structured `{ number, prefix }`; the fork’s closed union is twelve types and `text` already stores `INV-001`. Feasibility: **clear** (negative work: skip type registration). Files: none required in `ColumnTypes.ts` / `types.ts` type union; optional later: user adds a `text` column whose `key` equals `uniqueId.field`. Effort: **S**. Depends on: item 1. Citation: `src/data/types.ts:50` and `src/data/ColumnTypes.ts:125-138`.

8. **Bulk / paste creates inherit the stamp** — Notion stamps every new page in the data source; fork bulk create already builds per-row plans via `buildCreateEntryPlan`. Feasibility: **clear** (verify, do not special-case). Files: `src/views/DatabaseView.ts:8751-8779` (read/verify; edit only if paste-with-rename double-stamps). Effort: **S**. Depends on: items 1 and 4. Citation: `src/views/DatabaseView.ts:8751-8779`.

9. **Prefix (and pad/field) config UI** — Notion exposes prefix per data source; the fork has toolbar + `Modal` patterns and no database-scoped unique-id control. Feasibility: **likely**. Files: `src/views/DatabaseView.ts` `renderToolbar` (~1832–1848); new `src/views/modals/UniqueIdConfigModal.ts`; `src/i18n.ts` (~6 keys × en / zh-CN / zh-TW). Effort: **M**. Depends on: items 1–2. Out of the 1–3 *allocator* call-site budget; additive view layer. Citation: `src/views/DatabaseView.ts:1832-1848`.

10. **Read-only unique-ID cell after stamp** — Notion: “This value is read-only.” The fork treats `text` as editable; AppFlowy gates editability only at page access, not per column. Feasibility: **hard** (no per-column read-only flag; a general read-only system blows the rebase budget). Files (cheapest P2): `src/views/CellRenderer.ts` ignore/commit-no-op when `col.key === uniqueId.field`. Effort: **M**. Depends on: item 1. Citation: [Notion unique ID: read-only](https://developers.notion.com/reference/property-object).

11. **Lookup URLs (`notion.com/TASK-1234`)** — Notion prefix enables URL lookup; Obsidian has no equivalent data-source URL space. Feasibility: **blocked** (out of scope; not an Obsidian primitive). Files: none. Effort: **L** if forced via custom protocol/plugin URI — do not build. Depends on: n/a. Citation: [Notion unique ID prefix / lookup URLs](https://developers.notion.com/reference/property-object).

## Recommended build (locked design)

**Algorithm (pure, EuroFormat-shaped).** New module `src/data/UniqueIdStamp.ts`: zero Obsidian imports, durable-why header only (stable identity at create; do not couple to file name). Mirror `src/data/EuroFormat.ts:1-42` (pure exports, two consumers today: `src/views/CellRenderer.ts:13`, `src/views/SummaryRenderer.ts:7`).

```ts
export interface UniqueIdConfig {
  prefix?: string;
  counter: number;
  padWidth?: number;
  field: string;
}

export function nextUniqueId(cfg: UniqueIdConfig): { value: string; nextCounter: number } {
  const counter = Number.isFinite(cfg.counter) && cfg.counter >= 0 ? cfg.counter : 0;
  const pad = cfg.padWidth && cfg.padWidth >= 1 ? cfg.padWidth : 3;
  const number = String(counter + 1).padStart(pad, "0");
  return {
    value: cfg.prefix ? `${cfg.prefix}-${number}` : number,
    nextCounter: counter + 1,
  };
}
```

- Stamp **only if** `database.uniqueId` is present (opt-in). Inside the block, missing `prefix` → `""` → `001`; missing `counter` → `0` (first value `001`); missing `padWidth` → `3`; missing `field` → `"unique-id"`.
- `nextUniqueId` does **not** persist. Caller writes `cfg.counter = nextCounter` on the live `DatabaseConfig` **before** returning the plan (same-tick creates cannot reread a stale disk counter).
- Pad-3 is a **documented fork extension** over Notion’s unpadded `TASK-3`. Store `padWidth` on the config block so a database cannot drift between `INV-1` and `INV-001`.
- Architecture analog (not UUID semantics): AppFlowy injects cells in `v_will_create_row` before persist (`context/appflowy/frontend/rust-lib/flowy-database2/src/services/database_view/view_editor.rs:189-226`); Anytype merges view defaults then `C.ObjectCreate` (`context/anytype-ts/src/ts/lib/dataview.ts:701-734`, `.../calendar.tsx:59-75`). The fork’s equivalent layer is the `contextFrontmatter` copy + source-rule overlay in `planCreateEntry`. Stamp **after** that overlay so the id wins over column defaults, view filters, group/calendar defaults, and template frontmatter (`CreateEntryPlan.ts:127-172`; `DatabaseView.ts:3654-3659`). AppFlowy `gen_row_id()` UUID is explicitly **not** the finance sequence (`view_editor.rs:196`).

**Persistence.** `db_view` config **is** the `database` object in the view-definition file (`parseDatabaseConfig` merges `fm` then `database`, `DataSource.ts:628-637`). Add `uniqueId?: UniqueIdConfig` to `DatabaseConfig` (`types.ts:256-291`). Parse it in the `return { ... }` of `parseDatabaseConfig` (`DataSource.ts:773-793`). Serialize it in `toDatabasePayload` (`DataSource.ts:1041-1063`) or the whitelist silently drops it. Writes go through `updateViewDefFile` → `app.fileManager.processFrontMatter` → `f["database"] = this.toDatabasePayload(dbConfig)` (`DataSource.ts:991-1001`), serialized with `enqueueWrite`. Persist counter with `saveViewEntryConfig(..., { skipHistory: true })` (`DatabaseView.ts:305-309`, `6147-6152`) so counter ticks do not flood undo; clone `beforeConfig` **before** the increment so a failed `createNote` can `replaceDatabaseConfig`.

**Stamp site.** After `plan.filename = resolveFilename(ctx)` (`CreateEntryPlan.ts:170-172`): if `input.uniqueId` is set and `plan.frontmatter[field]` is empty, `const { value, nextCounter } = nextUniqueId(input.uniqueId); plan.frontmatter[field] = value; input.uniqueId.counter = nextCounter`. Do not stamp `computed`/`rollup` (`CreateEntryPlan.ts:312-316`; `DatabaseView.ts:3656`). Templates cannot smuggle counter state: `parseRecordTemplate` deletes `db_view` and `database` (`RecordTemplate.ts:25-26`). Schemaless frontmatter is enough for visibility (`applySchemalessRule`, `CreateEntryPlan.ts:304-310`, `390-416`); no 13th type.

**Call sites (EuroFormat + persistence; 1 new module + these edits):**

| # | File | Edit |
|---|------|------|
| — | `src/data/UniqueIdStamp.ts` | **New** isolated module (does not count as a call-site edit). |
| 1 | `src/data/types.ts` | `uniqueId?: UniqueIdConfig` on `DatabaseConfig`. |
| 2 | `src/data/DataSource.ts` | Parse + `toDatabasePayload` whitelist (one file). |
| 3 | `src/data/CreateEntryPlan.ts` | Extend `CreateEntryPlanInput` with `uniqueId?: UniqueIdConfig`; stamp after line 172. |

**Required wiring (same create-plan seam; do not skip):** `DatabaseView.buildCreateEntryPlan` (`3638-3671`) is the only caller of `planCreateEntry`. Pass `this.getActiveDb().uniqueId` (or the create-context database config) into the input. On `template?.engine === "core"` (`3554-3557`), copy `plan.frontmatter[field]` into the second plan’s defaults so the skip-if-present guard holds. After a successful allocate, flush config via the existing save path (`6125-6131`). This is the 4th *file* if counted naively; it is the existing consumer of call site 3, not a new subsystem. Prefer a correct template rebuild over a literal 3-file cap.

**Ordering:** clone `beforeConfig` → allocate+increment in-memory → persist counter (`skipHistory`) → `createNote(plan.folder, plan.filename, plan.frontmatter, ...)` (`DatabaseView.ts:3561-3567`; `DataSource.ts:328-358`). On failure, restore `beforeConfig` (item 6). No vault scan (`NFR-P01`).

**Do not:** stamp in `DataSource.createNote` (non-database callers); source the id from a record template; add `unique_id` as a 13th `ColumnDef.type`; store as `number`; implement via `computed`; put the counter in a sidecar/lock file; put config on `ColumnMenu` (column-scoped) or plugin `settings.ts` (global). Current `rebuildViewEntries` loads only view-def files (`DatabaseView.ts:1058-1064`); file-backed `updateViewDefFile` is the persistence path that matters.

## Edge cases & mobile/iCloud safety

**Must handle**

- **Missing `uniqueId` block:** do not stamp (opt-in). Missing fields *inside* a present block: `counter=0`, `prefix=""`, `padWidth=3`, `field="unique-id"` → first id `001` (Scenario 5).
- **Empty database:** first create still stamps; uniqueness is the counter, not a file listing (`spec.md` §8).
- **Pad width frozen per database:** persist `padWidth` on first use so `INV-1` and `INV-001` cannot coexist.
- **Core-template double plan:** allocate once (`DatabaseView.ts:3554-3557`).
- **Rapid same-device creates:** `planCreateEntry` is synchronous; increment the in-memory counter before the second allocate reads it. Debounced save must write the **final** counter (`DatabaseView.ts:6076-6088`).
- **`createNote` failure:** restore pre-increment config; do not leave a burned number *and* no note, and do not leave a note *and* a rolled-back counter (duplicate on retry). Today only the `registeredGroupOption` branch pairs config rollback with `trashNote` (`3610-3621`).
- **Config write failure:** do not silently reuse an id; fail on the existing create/save notice path (`CreateEntryDiagnosticReason` / `showCreateEntryNotice`; `errors.createFailed` at 3633). `updateViewDefFile` already throws after clearing overrides (`DataSource.ts:1004-1006`).
- **Property not in schema:** write schemaless YAML (`CreateEntryPlan.ts:304-310`); do not crash create.
- **Rename:** `FileRenamePlan` only moves paths (`src/data/FileRenamePlan.ts:19-22`; bulk rename at `DatabaseView.ts:8764-8767`). Frontmatter id is unchanged (REQ-004 / Scenario 4).
- **User-edited id after stamp:** no vault-wide uniqueness scan this phase (`spec.md` §8).
- **Undo of a created row:** default `pushHistory({ type: "created", file })` (`3623`) does not revert config. With `skipHistory` counter writes, undo leaves a hole in the sequence (do not reissue `INV-001`). Acceptable for invoices.
- **Computed/rollup:** never stamp those keys (`DatabaseView.ts:3656`).
- **Two devices before iCloud merge:** both can read counter *N* and emit the same id. Spec-accepted; no desktop file locks (`spec.md` §6 / §8).

**Mobile + iCloud**

This feature is **not** display-only: the spec requires a real frontmatter property plus a db_view counter write. Safety is **create-time only**, not “no writes.”

- **Mobile:** `UniqueIdStamp.ts` has no Electron/desktop APIs (`Intl` only, same as `EuroFormat.ts`). AppFlowy mobile uses the same `createRow` hook as desktop (`mobile_fab.dart` / `mobile_grid_page.dart` in the research trail); the fork equivalent is stamping in the shared plan, not in a desktop view. Any later modal uses Obsidian `Modal` (already imported on `DatabaseView`).
- **iCloud:** one extra YAML key on the **new** note (the same `vault.create` `createNote` already performs) and one extra field inside the existing `database` payload on the **view-def file** (the same `processFrontMatter` path). No backfill (SC-003 / Scenario 3), no sibling-note rewrite, no extra sidecar, no telemetry/secrets (`NFR-S01`). `enqueueWrite` serializes per file on one device; it does not fence two devices. Rollups/formulas stay out of this diff and remain display-only as specified for those surfaces.

## Open questions / operator decisions

1. **Opt-in vs always-on.** Recommended default: **opt-in** — stamp only when `database.uniqueId` exists (finance DBs add `uniqueId: { prefix: "INV" }`). Scenario 5 is “prefix omitted inside an active allocator,” not “every database in the vault.” Always-on would write `unique-id: 001` onto unrelated databases.

2. **Prefix-less format.** Recommended default: **`001`** (empty prefix, pad 3), not `ID-001`. Matches Notion’s nullable prefix; document it. Finance invoice DBs set `prefix: "INV"` → `INV-001`.

3. **Pad width vs Notion.** Recommended default: **pad 3 as a fork extension**, stored on the config block. Notion displays `TASK-3` with no zeros ([property object](https://developers.notion.com/reference/property-object)). Changing to unpadded later is a breaking format change for any already-stamped `INV-001`.

4. **Stamp field key.** Recommended default: **`unique-id`**. Users who want it as a visible column add a `text` column with that key; no schema mutation required at stamp time.

5. **Immutable after create.** Recommended default for this phase: **leave the `text` cell editable** (REQ-004 is rename-independence, already true by construction). Notion read-only is P2 (backlog item 10), not P0.

6. **Config UI in this diff.** Recommended default: **YAML `database.uniqueId` is sufficient for v1**; toolbar modal + i18n is P2 (item 9) if the 1–3 allocator budget is strained. Prefix must be set somehow for `INV-*`; hand-editing the view-def file is enough to ship REQ-001–003.

7. **Call-site file count.** Recommended default: **accept `DatabaseView.ts` as wiring for call site 3** (only `planCreateEntry` caller + core-template guard). Do not drop the stamp out of `CreateEntryPlan.ts` (REQ-001). Do not skip `toDatabasePayload` (counter would never persist).

8. **Undo vs reuse.** Recommended default: **`skipHistory` counter persist; do not reuse IDs after undo** (invoice identity). Reverting the counter on undo is the alternative if the operator prefers dense sequences.

9. **Two-device duplicates.** Recommended default: **document best-effort; do not add locks or vault scans.** Same class of limitation as any local counter; Notion avoids it by allocating on the server.

10. **13th column type.** Recommended default: **no** — `text` holds the string (`types.ts:50`). Revisit only if a later phase requires structured `{ number, prefix }` or true read-only typing.
