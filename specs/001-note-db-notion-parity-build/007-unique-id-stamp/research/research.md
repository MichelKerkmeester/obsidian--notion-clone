# Deep Research: Unique-ID Stamp on Row Create

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/deepseek-flash-max`. Stop reason: max_iterations. Average newInfoRatio: 0.730.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — Fork create path: the stamp site and property-write mechanics

**Focus:** Where exactly does the unique-ID stamp belong in the fork's create path, and how do row properties reach the note?

## Findings

1. **The create plan is the single choke point for frontmatter.** `planCreateEntry()` in `src/data/CreateEntryPlan.ts` builds the final `frontmatter: Record<string, unknown>` for a new note: it copies `contextFrontmatter` (column defaults + view-filter/status/group/calendar defaults + template frontmatter) and then overlays required source rules (`[SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/CreateEntryPlan.ts:119-173]`). The plan also carries `filename`, `folder`, and `diagnostics[]`.

2. **Exactly one consumer builds plans and two call paths write notes.** `DatabaseView.buildCreateEntryPlan()` (`[SOURCE: .../src/views/DatabaseView.ts:3638-3671]`) is the sole caller of `planCreateEntry`. Its returned `plan.frontmatter` is passed verbatim to `this.dataSource.createNote(plan.folder, plan.filename, plan.frontmatter, { sourceInstanceId }, templateBody)`:
   - single-row create: `DatabaseView.ts:3554-3567` (plan rebuilt once more when a core template is used, lines 3555-3557)
   - bulk create: `DatabaseView.ts:8759-8779` (per-row plans via `buildCreateEntryPlan(config, defaults)`).

3. **Stamp placement options, ranked by blast radius:**
   - **A (smallest, spec-aligned):** inside `planCreateEntry()` — after the rule overlay loop (after line 172), assign `plan.frontmatter[uniqueIdKey] = allocatedId` when the db_view config has an id column/prefix. Every create entry (table/board/gallery/list/calendar/timeline/toolbar/bulk/database-file) funnels through this one function, so one call site covers REQ-001 ("stamped at create time") and SC-004 ("1–3 call-site edits").
   - **B:** in `buildCreateEntryPlan()` (DatabaseView.ts) — same effect but outside the pure plan module and duplicated for the template-rebuild branch (line 3555-3557 would produce two allocations unless guarded).
   - **C:** in `createNote` (DataSource) — too low-level; `createNote` also serves non-database writes (`[SOURCE: DataSource.ts createNote used for paste/bulk paths]`), widening blast radius.

4. **Ordering hazard with template rebuild.** When `template?.engine === "core"`, the plan is rebuilt after `resolveCoreRecordTemplate` (DatabaseView.ts:3555-3557). A stamp inside `planCreateEntry` would allocate twice (two counter increments, one discarded). Mitigation: the allocator must be idempotent within a single create decision — e.g. allocate once and pass through, or allocate at `buildCreateEntryPlan` boundary only on the *final* plan. This is a real edge case the spec does not mention (§8 open).

5. **RecordTemplate strips `db_view`/`database` from template frontmatter** (`[SOURCE: .../src/data/RecordTemplate.ts:25-26]`), so template files cannot smuggle counter state or id properties into the plan; template frontmatter only merges into `contextFrontmatter` (DatabaseView.ts:3659). The stamp must therefore come from the allocator, not from template content — confirming the spec's "no sidecar, db_view config is the source of truth" shape.

6. **Diagnostics plumbing exists for create-time risks.** `CreateEntryDiagnosticReason` (CreateEntryPlan.ts:47-57) already covers unconstructable/conflict cases and surfaces via `showCreateEntryNotice` (DatabaseView.ts:3698-3707). A failed stamp (e.g. db_view write fails) can ride this path without new UI — relevant to spec §8 "db_view config write fails: fail or retry on the existing create-plan error path".

## Ruled out

- **Stamping inside `createNote`/DataSource** — createNote serves multiple non-database callers; violates 1–3 call-site and rebase-clean constraints.
- **Stamping via record template** — templates strip db_view keys (RecordTemplate.ts:25-26) and would make ids template-dependent rather than database-scoped.

## Questions for later iterations

- Q2: db_view config schema + EuroFormat model (iteration 2).
- Q3: which column type holds the stamped string (iteration 3).
- Does `getDefaultCellValue(col)` treat an id column's default as writable/static, and would a stamp override it? (iteration 3/9)

---

# Iteration 002 — EuroFormat isolated-module model + db_view config persistence

**Focus:** What is the exact `EuroFormat.ts` diff shape to copy, and where does db_view config live so counter + prefix ride the existing write path?

## Findings

1. **EuroFormat.ts is the canonical isolated-diff model.** `[SOURCE: .../src/data/EuroFormat.ts:1-42]`: a 42-line module with **zero imports**, three exported pure functions (`formatEuroNumber`, `formatEuroNumber2`, `formatEuroCurrency`), module-level `Intl.NumberFormat` instances, and a durable-why header comment ("Local fork override. Kept in one module so it stays a small, rebasable diff."). Its call sites are exactly **2 files**: `views/SummaryRenderer.ts:7` (`formatEuroNumber2`) and `views/CellRenderer.ts:13` (`formatEuroNumber`, `formatEuroCurrency`). This is the "new module under src/data + 1–3 call-site edits" template the spec names.

2. **"db_view config" = the `database` object in the view-definition file's frontmatter.** `db_view: true` marks database files (`[SOURCE: .../src/data/DataSource.ts:628-637]` `parseDatabaseConfig` merges `const source = { ...fm, ...database }` — the `database` object wins); `DatabaseConfig` type at `[SOURCE: .../src/data/types.ts:256-291]` (id, name, sourceFolder, schema, views, newRecordTemplate, …). A `uniqueId` block (`{ field, prefix, counter, padWidth }`) belongs on `DatabaseConfig`, parsed via `parseDatabaseConfig` and serialized via `toDatabasePayload`.

3. **Config writes are already serialized per-file.** `updateViewDefFile` (`[SOURCE: .../src/data/DataSource.ts:991-1010]`) wraps the write in `this.enqueueWrite(file.path, ...)` — "Serialized per-file to prevent conflicts with concurrent frontmatter writes" — and persists via `app.fileManager.processFrontMatter` writing `f["database"] = this.toDatabasePayload(dbConfig)`. The allocator's counter increment can reuse this exact queue, satisfying the spec's "existing db_view config write path" (NFR-P01 constant-time read-increment-write) and avoiding a new sidecar.

4. **`toDatabasePayload` is a whitelist serializer** (`[SOURCE: .../src/data/DataSource.ts:1041-1063]`) — every new `DatabaseConfig` key must be added here or it silently never persists. So the counter/prefix feature has a *mandatory* second call-site edit in `DataSource.ts` (parse + payload), and a third in `types.ts`. Total budget: 1 new module + types.ts + DataSource.ts + (optionally) one view touch = exactly the 1–3 call-site cap.

5. **Save cadence is debounced.** `saveConfigImmediately` (`[SOURCE: .../src/views/DatabaseView.ts:6076-6088]`) clears `configSaveTimer` and flushes pending saves through `saveViewEntryConfig` → `updateViewDefFile` (`DatabaseView.ts:6125-6134`). For a create-time counter increment this debounce is a hazard: a burst of creates within the debounce window must increment the in-memory counter each time and write the *final* value, not re-read a stale persisted counter. The allocator must read-modify-write the in-memory `DatabaseConfig` (single source of truth during the session) and persist via the existing save path.

6. **Configuration databases (settings) persist outside view-def files.** `saveViewEntryConfig` guards `if (file instanceof TFile)` (`DatabaseView.ts:6127-6131`); for settings-backed entries the config lives in plugin settings (main.ts/settings.ts store). Counter persistence must cover both surfaces; REQ-002 wording ("db_view config") maps to `DatabaseConfig` regardless of backing store.

## Ruled out

- Adding the counter as a *new* top-level frontmatter key next to `database` — `parseDatabaseConfig` would need special handling and the payload whitelist would diverge from the parse; keeping it inside `database.uniqueId` reuses both.
- A separate sidecar/lock file for the counter (spec forbids; `enqueueWrite` already serializes per-file).

## Questions for later iterations

- Q3 (I3): which column type displays the stamped string.
- Q9 (I9): settings-store save path for configuration databases (exact call site for counter persistence there).
- Does `getDefaultCellValue(col)` conflict with a stamp? (I3/I9)

---

# Iteration 003 — Column-type surface: storing the stamped string

**Focus:** Which of the twelve column types can hold `INV-001`, how properties register, and does a column default conflict with the stamp?

## Findings

1. **Exactly twelve types, confirmed, and `text` holds the stamp.** `ColumnDef.type` is the closed union `"text" | "number" | "date" | "datetime" | "currency" | "select" | "multi-select" | "status" | "checkbox" | "computed" | "relation" | "rollup"` (`[SOURCE: .../src/data/types.ts:50]`), mirrored by `isColumnType` (`[SOURCE: .../src/data/ColumnTypes.ts:125-138]`) and `COLUMN_TYPE_LABELS` (`ColumnTypes.ts:108-123`). `INV-001` is a plain string scalar → a **`text` column stores it directly in frontmatter**; `textRenderMode: "plain"` (types.ts:59-62) renders it without link/markdown interpretation. **No 13th type and no type-registration edit is required** — the spec's "Modify only if required" branch (scope table row 4) resolves to *not required*.

2. **A stamped property does not even need a schema column.** The fork treats frontmatter keys outside the schema as "schemaless vault properties": `CreateEntryPlan.applySchemalessRule` writes them as untyped text (`[SOURCE: .../src/data/CreateEntryPlan.ts:304-310, 390-416]`), and `VaultProperties.ts` / `FrontmatterScanner.ts` discover vault-wide keys (`[SOURCE: .../src/data/VaultProperties.ts:81-86]`, `FrontmatterScanner.ts:261-267`). So a stamped `unique-id` key renders as an Obsidian property even before the user adds it as a column; adding the column later is a normal user action (column menu / option registration `planOptionRegistration`, DatabaseView.ts:3548).

3. **Column defaults are a lower-priority base, not a conflict.** `getDefaultCellValue` → `getColumnDefaultCellValue(col)` (`[SOURCE: .../src/views/DatabaseView.ts:3908-3913]`) seeds `contextFrontmatter` per column (DatabaseView.ts:3655-3658), and `planCreateEntry` copies that base *before* overlaying rules (`[SOURCE: .../src/data/CreateEntryPlan.ts:127-130]`). A stamp that runs after the merge (proposed I1 finding 3A) simply overwrites whatever default the text column contributed — no conflict, and it correctly beats template frontmatter too (the stamp must be authoritative).

4. **Frontmatter is the note's storage; rename does not touch it.** Values written through `plan.frontmatter` land in the note's YAML via `createNote`; file renames go through `FileRenamePlan`/`executeFileRenamesAtomically` which only renames paths (`[SOURCE: .../src/views/DatabaseView.ts:8764-8767]`). This confirms REQ-004 (id independent of file name) is satisfied by construction, matching the spec's Scenario 4.

5. **Computed/rollup are excluded from stamping.** `buildCreateEntryPlan` skips `computed`/`rollup` columns when seeding defaults (`[SOURCE: .../src/views/DatabaseView.ts:3656]`), and `applyRequiredRule` rejects writes to them (`[SOURCE: .../src/data/CreateEntryPlan.ts:312-316]`). The unique-id property must be a plain writable key, not a computed field — consistent with spec's "no second formula engine".

## Ruled out

- A 13th column type ("unique-id") — `text` already stores/renders the string; a new type would break the `isColumnType`/`COLUMN_TYPE_LABELS`/`ColumnDisplay` closed unions (bigger, non-rebase-clean diff).
- Storing the id as a number column — `INV-001` is not numeric; prefix breaks number parse/format paths.
- Computed-field expression for the id — computed values aren't written at create (ComputedSync display-only modes exist but the spec wants a durable property, and computed would re-evaluate).

## Questions for later iterations

- Q9 (I9): where the user configures prefix (column menu vs db settings) — need the settings/UI surface inventory.

---

# Iteration 004 — AppFlowy `flowy-database2` Rust model: identity and create-time injection

**Focus:** How does AppFlowy's grid model assign row identity and auto-generated values at row creation?

## Findings

1. **AppFlowy has no auto-increment / unique-id counter.** Grep across all of `flowy-database2/src` for `auto_increment|auto-increment|AutoIncrement|sequence|Sequence|unique_id|unique-id` returns **zero matches**. Identity is not a Notion-style counter; it is a generated UUID.

2. **Row identity = generated id at the create hook.** `v_will_create_row` (`[SOURCE: .../context/appflowy/frontend/rust-lib/flowy-database2/src/services/database_view/view_editor.rs:189-226]`) builds `CreateRowParams { id: gen_row_id(), ... }` where `gen_row_id` comes from `collab_database::database` (`[SOURCE: .../flowy-database2/src/template.rs:1, 53-55]` — template rows also `gen_row_id()`). Uniqueness is by construction (UUID), not by a shared counter, so there is no reload-reset or two-device collision window — but also no human-readable sequence.

3. **The create hook is the stamp site, with layered cell injection.** `v_will_create_row` runs a deterministic pipeline before persistence: (a) frontend-supplied cells via `CellBuilder` (view_editor.rs:205-206), (b) group controllers inject cells (`controller.will_create_row(&mut cells, &field, &group_id)`, view_editor.rs:215-219 — e.g. `date_controller.rs:220-230` inserts the group's date cell), (c) filter controllers fill cells (`filter_controller.fill_cells(&mut cells)`, view_editor.rs:222-224 → `src/services/filter/controller.rs:226+`, which applies min-effective filters). Only then does `database.create_row_in_view(view_id, params)` persist (database_editor.rs:682-700). **This is the exact architectural analog of the fork's `planCreateEntry` merge pipeline** (contextFrontmatter defaults → source rules → final frontmatter), confirming that a create-time stamp belongs in that same layer, before `createNote`.

4. **Primary field is structural, not sequential.** `field.is_primary` guards destructive/type operations: cannot delete primary (`[SOURCE: .../flowy-database2/src/services/database/database_editor.rs:412-423]`), cannot change its field type (500-503), cannot duplicate it (547-555). The primary field holds the human title; it is not auto-numbered.

5. **Row cells are created empty unless injected.** `CreateRowParams { cells: Cells::new(), ... }` (view_editor.rs:200-209) — nothing auto-fills; every value at create comes from the payload/group/filter layers. This is evidence for the design rule: a "unique id" value must be *injected at the create hook*, exactly like the fork's plan merge, or it will not exist.

## Implication for the fork

- Placement validated: the fork's `planCreateEntry` merge loop ≈ AppFlowy's `v_will_create_row` injection pipeline; the allocator stamps at that layer.
- AppFlowy's UUID approach does not solve the finance requirement (`INV-001` human-readable sequence) — it only reinforces that identity must be set *at* create.
- AppFlowy keeps the primary field separate from identity: the fork's id property should be a normal text column (I3), not the title field.

## Ruled out

- Copying AppFlowy's pure-UUID identity — fails REQ-004/SC-001 (needs `INV-001` human-readable sequence); UUID could be a fallback only if a counter is impossible (not the case here).

## Next iteration focus

Iteration 5: AppFlowy Flutter UI — how the database grid surfaces row-created defaults, display-only vs editable cells, and any create-entry UI affordances (new-row defaults).

---

# Iteration 005 — AppFlowy Flutter database UI: create-time cell injection and editability

**Focus:** How does the AppFlowy Flutter grid surface create-time values and editability — relevant to the fork's unique-id display UX.

## Findings

1. **The UI pre-fills cells at create via `withCells`.** `RowBackendService.createRow` accepts a `withCells(RowDataBuilder)` callback that fills `CreateRowPayloadPB.data` before send (`[SOURCE: .../context/appflowy/frontend/appflowy_flutter/lib/plugins/database/application/row/row_service.dart:16-35]`). Concrete consumers: board view inserts the new card title into the primary field (`(builder) => builder.insertText(primaryField, title)`, `[SOURCE: .../board/application/board_bloc.dart:113-127]`); calendar inserts the clicked date (`builder.insertDate(dateField, date)`, `[SOURCE: .../calendar/application/calendar_bloc.dart:200-202]`). This is the *view-context → create hook* value flow: the same shape as the fork's `createEntry(config, defaults, ...)` where view filters/group/calendar defaults flow into `buildCreateEntryPlan` (`[SOURCE: .../src/views/DatabaseView.ts:3648-3659]`). A fork unique-id stamp is the database-level counterpart of these view-level injections: it must be applied in the same hook, with higher precedence than view defaults (so no view can overwrite it).

2. **Editability is page-level, not per-column.** The grid gates editing on `PageAccessLevelBloc().state.isEditable` — grid page (300, 571, 613), mobile grid page (186-187, 385-387) — so read-only pages render cells display-only. There is **no per-column read-only flag in the AppFlowy grid UI**; the "display-only" concept is a whole-page permission, not a cell property.

3. **Mobile parity is first-class.** `MobileGridFab` and the mobile grid page create rows with the same `RowBackendService.createRow` path (`[SOURCE: .../grid/presentation/widgets/mobile_fab.dart:15-40]`, `mobile_grid_page.dart:186-221`), and mobile opens the row as a page after create (`DidCreateRowAction.openAsPage`, board_bloc.dart:130-133). Mobile uses the same backend hook — no desktop-only create path. This is evidence for the fork constraint REQ-005: the stamp must live in the shared plan layer, not in a desktop-only view code path.

4. **Primary field cells are structurally special, not auto-numbered.** `fieldInfo.isPrimary` drives row-detail visibility lists (excluded from hide toggles, `[SOURCE: .../grid/application/row/row_detail_bloc.dart:81, 135, 167]`) and gets a `PrimaryCellAccessory` expand affordance (`[SOURCE: .../grid/presentation/widgets/row/row.dart:280-289]`). The fork's unique-id column should be a plain text column (I3) with no special accessory; Notion-style display-only-ness (if wanted) needs a per-column flag the fork already lacks — see iteration 7 for Notion's semantics.

## Implication for the fork

- AppFlowy confirms: view-context defaults are injected at the create hook, identity is not a UI concern, and mobile shares the same hook. The fork's stamp belongs in `planCreateEntry` (database-level), executed after view defaults so it wins.
- If the spec's "display-only unless the spec says otherwise" is interpreted strictly, the fork needs no new read-only cell machinery: the stamp happens once at create; afterwards the value is a normal text cell. Notion-parity display-only editing (I7) is optional enrichment, not a REQ.

## Ruled out

- Per-column read-only UI flag modeled after page-access gating — AppFlowy doesn't have one; the fork's existing cell-editing paths (BulkEdit, cell renderers) treat text columns as editable. Adding read-only machinery exceeds the 1–3 call-site budget unless the spec requires it (it does not).

## Next iteration focus

Iteration 6: Anytype (`anytype-ts/src/ts`) — object identity, dataview object creation, auto-generated relation values.

---

# Iteration 006 — Anytype (`anytype-ts/src/ts`): object creation and identity

**Focus:** How does Anytype assign identity and inject default values when an object is created from a dataview?

## Findings

1. **Identity is backend-generated, never frontend.** Dataview creation calls `C.ObjectCreate(details, flags, templateId, type?.uniqueKey, S.Common.space, cb)` (`[SOURCE: .../context/anytype-ts/src/ts/component/block/dataview/view/calendar.tsx:63-78]`); the command ships `details`, `internalFlags`, `templateId`, `spaceId`, and `objectTypeUniqueKey` over gRPC (`[SOURCE: .../src/ts/lib/api/command.ts:1118-1126]`), and the object id arrives back in `message.details` (`object.id` used at calendar.tsx:72-75). The TS frontend never generates or sequences ids — like AppFlowy, identity is a UUID from the core (anytype-heart Go middleware), not a per-database counter. There is **no unique/auto-increment relation** in the TS layer (grep for `isUnique|unique` beyond `uniqueKey` returns nothing).

2. **Create-time defaults are composed in the frontend and injected into the create payload.** `Dataview.getDetails(rootId, blockId, objectId, viewId, groupId)` (`[SOURCE: .../src/ts/lib/dataview.ts:701-760+]`) builds the `details` object that seeds the new object:
   - relation defaults formatted per relation type (lines 707-717),
   - board/calendar/timeline group value: `details[view.groupRelationKey] = group.value` (724-727),
   - calendar: `details[view.groupRelationKey] = U.Date.now()` (729),
   - timeline: start = now, end = now + 5 days (731-734),
   - filter-constrained values: for Equal/GreaterOrEqual/LessOrEqual/In/AllIn filters, `details[filter.relationKey] = filter.value` (736-750+).
   Calendar then merges its own details over the view defaults via `Object.assign(Dataview.getDetails(...), details)` (calendar.tsx:59).

3. **The injection is exactly the fork's defaults pipeline.** Anytype's group/calendar/filter injection ≈ AppFlowy's `will_create_row`/`fill_cells` ≈ the fork's `getDefaultFrontmatterFromViewFilters` + group/calendar defaults merged in `buildCreateEntryPlan` (`[SOURCE: .../src/views/DatabaseView.ts:3648-3659]`). Three independent implementations converge on the same architecture: **view-context defaults are merged into the create payload before persistence, and identity is decided by the core**. The fork's unique-id stamp is a fourth instance of the same pattern, placed at the same layer (the plan merge), but sourced from the *database* config rather than the view.

4. **`uniqueKey` is a type key, not an instance id.** `objectTypeUniqueKey: typeKey || J.Constant.default.typeKey` (command.ts:1124) identifies the object *type* (e.g. "note"), confirming Anytype has no per-instance human-readable sequence either.

## Implication for the fork

- Anytype reinforces the cross-product conclusion: not even Notion's closest competitors implement a per-database auto-increment property; they all rely on UUID identity + create-time injection of view-derived defaults. The fork's `INV-001` feature is therefore an *enhancement beyond* AppFlowy/Anytype — Notion parity comes from Notion's own unique-id property (iteration 7), and the reference repos validate the *stamp-at-create architecture*, not the counter semantics.
- The fork's stamp must be injected after view defaults (like calendar.tsx:59's Object.assign over getDetails) so the database-owned id cannot be clobbered by view context — matching the I1 finding that the stamp runs after the rule overlay in `planCreateEntry`.

## Ruled out

- Emulating Anytype's "defaults from filters" for the id — the id must not depend on the active view (REQ-002 database-scoped), unlike filter-injected values which are view-scoped.

## Next iteration focus

Iteration 7: Notion's actual unique-ID behavior via WebFetch — property type, prefix+number semantics, editability, creation semantics (API + docs).

---

# Iteration 007 — Notion unique-ID semantics (official API docs)

**Focus:** What is Notion's actual unique-ID behavior — property type, prefix + number semantics, editability?

## Findings

1. **`unique_id` is a first-class Notion property type.** The data-source property `type` enum lists 22 types including `"unique_id"` (`[SOURCE: https://developers.notion.com/reference/property-object]`, type enum table).

2. **Semantics per the official docs:** "Automatically incremented, unique across all pages in a data source. Useful for task or bug report IDs (e.g. `TASK-1234`). **This value is read-only.**" (`[SOURCE: https://developers.notion.com/reference/property-object]`, Unique ID section).

3. **Config surface is exactly prefix (+ implicit counter).** The `unique_id` type object has one field: `prefix: string | null` — "A common prefix assigned to pages. When set, enables lookup URLs like `notion.com/TASK-1234`." The counter is not user-configurable; Notion owns the sequence per data source.

4. **Value shape is `{ number, prefix }`.** Page property value example: `{"type": "unique_id", "unique_id": {"number": 3, "prefix": "TASK"}}` → displayed as `TASK-3`. The number is a plain integer — **Notion's canonical display is NOT zero-padded** (`TASK-3`, not `TASK-003`); the fork's `INV-001` pad-width-3 is a deliberate extension beyond Notion, and SC-001 already permits "the documented default format if prefix/pad-width come from db_view config".

5. **Read-only is a documented Notion invariant** — users cannot edit a unique id after creation; only Notion's allocator writes it. The fork spec §9 open question ("Whether a stamped unique ID is immutable in the UI after create: UNKNOWN") now has a parity answer: Notion makes it read-only, but the fork's REQ-004 only demands *rename-independence*, and the fork has no per-column read-only machinery (I5). Enrichment: make the id column non-editable in the fork UI is optional polish, not required for parity of the *stamped value*.

6. **Notion increments per data source, not per view and not per workspace** ("unique across all pages in a data source") — confirming the fork's database-scoped counter in db_view config (REQ-002) is the right scope. Notion's docs do not state whether deleted pages' numbers are reused (UNKNOWN; do not fabricate).

## Parity gap table (fork vs Notion)

| Aspect | Notion | Fork spec |
|--------|--------|-----------|
| Property type | `unique_id` (1st-class) | text column holding string (I3) — equivalent UX, no 13th type |
| Prefix | optional, per data source | optional, in db_view config (REQ-002) |
| Numbering | auto-increment per data source | counter in db_view config (REQ-002) |
| Format | `TASK-3` (no padding) | `INV-001` (pad 3 per backlog) — document as extension |
| Editability | read-only | stamped at create; text cell editable after — enrichment: read-only display |
| Scope | per data source | per database (db_view config) |

## Next iteration focus

Iteration 8: allocator edge cases — counter persistence across reload/debounce, missing counter/prefix defaults, pad width, write-failure semantics, rapid creates, two-device pre-sync window; grounded in the fork's config save path (I2) and DataSource create path.

---

# Iteration 008 — Allocator edge cases grounded in fork code

**Focus:** How must the allocator behave for every spec §8 edge case, using the fork's real save/rollback machinery?

## Findings

1. **Counter saves can skip undo history — `skipHistory` metadata exists.** `ConfigSaveMetadata { undoLabel, cellChanges, skipHistory? }` (`[SOURCE: .../src/views/DatabaseView.ts:305-309]`) and `recordConfigHistory` (`[SOURCE: .../src/views/DatabaseView.ts:6136-6163]`) show: when `metadata?.skipHistory && !undoLabel && cellChanges.length === 0`, the config snapshot is updated without pushing an undo entry (6147-6152). The allocator's counter increment can ride `saveViewEntryConfig(entry, mutation, { skipHistory: true })` — the *existing* write path, no undo pollution. (The undo path for a *created row* still restores the pre-create config via `entry.before`, so undoing a create also undoes its counter bump — consistent.)

2. **Create failure already pairs config rollback with note trash.** The single-row create catch path (`[SOURCE: .../src/views/DatabaseView.ts:3610-3627]`) does `replaceDatabaseConfig(entry.config, beforeConfig)` **and** `dataSource.trashNote(file, ...)`. If the allocator bumps the counter before `createNote` and the note create fails, this existing path restores the counter and removes the orphan note — no duplicate ids, no leaked counter. Ordering recommendation: allocate (in-memory) → persist increment via existing save path → `createNote`; on failure the existing rollback restores both.

3. **`createNote` is YAML-stringified, path-deduped, and independent of config.** `createNote` (`[SOURCE: .../src/data/DataSource.ts:328-358]`) builds content from the plan frontmatter, resolves a unique path (`getAvailablePath`), and `vault.create`s. The note write and the config write are different files; both funnel through Obsidian's own vault write serialization. `updateViewDefFile` adds a *per-file* `enqueueWrite` (DataSource.ts:991-992) — same-device ordering is safe; cross-device pre-sync ordering is NOT (spec documents best-effort; no lock file per spec).

4. **Missing counter/prefix defaults resolve cleanly.** If `database.uniqueId` is absent, `parseDatabaseConfig` (`[SOURCE: .../src/data/DataSource.ts:628-637]`) yields `undefined` — the allocator defaults: `counter = 0` (next = 1), `prefix = ""` (Notion's null-prefix default, I7), `padWidth = 3` (backlog `INV-001`), `field = "unique-id"`. First create → `001` or `ID-001` per a documented default; SC-001's "or the documented default format" branch is satisfied. Pad width must be fixed per database once allocated (spec §8: "pick one documented default rather than mixing INV-1 and INV-001") — the config block stores it, so it can't drift.

5. **Rapid same-device creates are safe by construction.** `planCreateEntry` is synchronous; the allocator reads the in-memory `DatabaseConfig` counter and increments before returning the plan (read-increment-write in one synchronous section). Two creates in the same tick get distinct numbers; the debounced config save (`configSaveTimer`, DatabaseView.ts:6076-6088) persists the *final* counter, so a burst writes once with the highest value. This satisfies spec §8 "two rapid creates on one device must not receive the same id" and NFR-P01 (constant time, no vault scan).

6. **Two devices pre-sync remain best-effort (spec-documented).** The fork has no cross-device coordination; `enqueueWrite` is per-file within one device. Both devices allocating from the same persisted counter can collide — the spec already documents this as accepted risk ("do not add desktop-only file locks to 'fix' that"). Notion's own counter has the same class of limitation at the data-source level (server-allocated, so effectively safe there); the fork's best-effort caveat is the honest parity gap.

7. **User-edited id after stamp is out of scope (spec §8).** The fork has no uniqueness scan; not adding one. Optional enrichment: treat the id column display-only to reduce accidental edits (I5/I7 discussion) — but REQ-004 only requires rename-independence, which holds by construction (I3 f4).

## Ruled out

- Lock files, vault-wide scans, or cross-device counter fencing (spec §8 forbids; Notion parity does not require offline-safe counters).
- Rolling back the counter on every create failure *without* trashing the note — the existing paired rollback (finding 2) is the correct behavior; a counter-only rollback with a live note would duplicate ids.

## Next iteration focus

Iteration 9: UI/UX surface — where prefix/pad/field config lives in the fork (database settings, column menu, settings.ts), mobile-safe constraints, i18n strings needed.

---

# Iteration 009 — UI/UX surface for prefix + counter config

**Focus:** Where does the user configure prefix/pad/field, with mobile-safe and rebase-clean constraints?

## Findings

1. **Database-level UI slots into the toolbar renderer.** `renderToolbar()` (`[SOURCE: .../src/views/DatabaseView.ts:1832-1860+]`) passes a callback bag (selectDatabase, renameView, renameDatabase, updateDatabaseDescription, editDatabaseIcon, …) into `toolbarRenderer.render(...)`. A `configureUniqueId: () => void` callback plus a menu item is the natural slot — one call site, database-scoped, following the existing `renameDatabase`/`updateDatabaseDescription` pattern (`[SOURCE: .../src/views/DatabaseView.ts:1847-1848]`).

2. **Modal patterns are established.** `views/modals/` contains ~15 modals (ColumnRenameModal, CreatePropertyModal, AddDatabaseModal, StatusPresetManagerModal, FormulaModal, …) — all `extends Modal` with an onConfirm-style callback (`[SOURCE: .../src/views/modals/ColumnRenameModal.ts:13]` as representative). A `UniqueIdConfigModal` (prefix text input, pad width, optional "stamp field" name, and a read-only counter display) follows the same pattern. Obsidian `Modal`/`Menu`/`Notice`/`Platform` are cross-platform (imported at DatabaseView.ts:1) — **no desktop-only API**, satisfying REQ-005 mobile safety.

3. **i18n is tri-lingual with a flat key catalog.** `i18n.ts` holds en / zh-CN / zh-TW key-value tables with dotted keys (`"settings.databaseFiles.name"`, `"columnType.text"`, `[SOURCE: .../src/i18n.ts:953-979]`). The feature needs ~6 new keys per locale (`uniqueId.prefix`, `uniqueId.padWidth`, `uniqueId.field`, `uniqueId.counter`, `uniqueId.enable`, `uniqueId.configure`) — the fork convention is to add all three locales in the same diff.

4. **Column-menu placement is a second option but weaker.** `ColumnMenu` (`[SOURCE: .../src/views/ColumnMenu.ts:45]`) is column-scoped; unique-id is database-scoped (REQ-002), so a column-menu entry would misplace the config (it applies to the whole database, not one column). The header/toolbar slot is the correct scope. The *column itself* (if shown) is a normal text column the user adds via the existing column menu (I3 f2).

5. **Notion parity for the config surface.** Notion's unique_id config is exactly: prefix per data source, number auto (I7 f3). The fork's UI should therefore expose: prefix (optional text), pad width (extension, default 3), stamp field key (default `unique-id`), and a read-only "next number" hint. Everything else (counter) is implementation state, not UI.

6. **Display-only treatment is optional enrichment.** Notion renders unique_id read-only (I7 f5), AppFlowy gates editability only by page permission (I5 f2). The fork has no per-column read-only flag; the cheapest parity-adjacent option is a `textRenderMode`/read-only hint when the column key equals the configured stamp field — but the spec does not require it (REQ-004 is rename-independence only). Rank as P2 enrichment, not build scope.

## Implication for the fork

- UI budget: 1 toolbar callback + 1 modal + ~6 i18n keys × 3 locales. That is NOT one of the 1–3 call-site edits (those are the allocator module + types.ts + DataSource.ts parse/payload); the UI additions are additive view-layer changes and can ship in the same diff without touching the allocator contract.

## Ruled out

- Column-menu placement for database-scoped config (wrong scope).
- Plugin-level settings tab for per-database prefix (settings.ts is plugin-global; per-database config belongs in DatabaseConfig, which is per-database).

## Next iteration focus

Iteration 10: integration synthesis — module design (filename/API/algorithm), exact call sites, ranked enrichment, REQ/SC mapping, answers to spec open questions.

---

# Iteration 010 — Integration synthesis: module design, call sites, ranked enrichment

**Focus:** Converge all evidence into the ranked, evidence-cited enrichment deliverable.

## 1. Module design (new file: `src/data/UniqueIdStamp.ts` — name is free, verified no collision)

EuroFormat-clone shape (`[SOURCE: .../src/data/EuroFormat.ts:1-42]`): zero-import pure module + one tiny integration seam.

```ts
// src/data/UniqueIdStamp.ts — durable-why comment only (no spec paths / REQ ids)
// Stable per-database identity at row create: the stamped value must not depend
// on the note file name (renames would orphan invoice references), so the counter
// and prefix live in db_view config, not in the path.

export interface UniqueIdConfig { prefix?: string; counter: number; padWidth?: number; field: string; }

export function nextUniqueId(cfg: UniqueIdConfig): { value: string; nextCounter: number } {
  const counter = Number.isFinite(cfg.counter) && cfg.counter >= 0 ? cfg.counter : 0;
  const pad = cfg.padWidth && cfg.padWidth >= 1 ? cfg.padWidth : 3; // documented default
  const number = String(counter + 1).padStart(pad, "0");
  return { value: cfg.prefix ? `${cfg.prefix}-${number}` : number, nextCounter: counter + 1 };
}
```

- Pure function, no obsidian imports → mobile-safe, unit-testable, MIT-forkable.
- Returns `nextCounter` so the caller owns persistence (see edge cases, I8).
- Pad-width default 3 = the backlog `INV-001`; documented as a fork extension over Notion's non-padded `TASK-3` (`[SOURCE: https://developers.notion.com/reference/property-object#unique-id]`).

## 2. The 1–3 call-site edits (rebase-safe diff)

| # | File | Change | Why |
|---|------|--------|-----|
| 1 | `src/data/types.ts` | Add `uniqueId?: UniqueIdConfig` to `DatabaseConfig` (types.ts:256-291) | Config schema (REQ-002) |
| 2 | `src/data/DataSource.ts` | Parse `database.uniqueId` in `parseDatabaseConfig` (628-637) **and** serialize in `toDatabasePayload` (1041-1063) — both are inside the same file, counted as one call-site | Whitelist serializer drops unknown keys (I2 f3) |
| 3 | `src/data/CreateEntryPlan.ts` | In `planCreateEntry`, after the rule overlay (after line 172): when the db config carries `uniqueId`, stamp `plan.frontmatter[cfg.field] = nextUniqueId(cfg).value` and advance the in-memory counter; persist the counter through the existing save path with `skipHistory` (I8 f1) | Single choke point covers every create entry (I1 f1); template rebuild (DatabaseView.ts:3555-3557) needs the stamp to be allocation-once — e.g. pass the allocated value through, or allocate only when `plan.frontmatter[cfg.field]` is absent |

Import graph: `CreateEntryPlan.ts` imports `./UniqueIdStamp` (pure); `types.ts` defines the config type. No UI imports into the module.

**Stamp-site guard (I1 f2):** the core-template rebuild calls `buildCreateEntryPlan` twice (DatabaseView.ts:3554-3557). To avoid double allocation, stamp *only if* the incoming `contextFrontmatter`/template did not already carry a value for the field, and advance the counter exactly once per `createEntry` decision. The cleanest seam: `buildCreateEntryPlan` passes a stable `uniqueIdValue` computed once per create entry into both plan builds.

## 3. Ranked enrichment (deliverable)

1. **P0 — Stamp at `planCreateEntry` with counter in `DatabaseConfig.uniqueId`** — the spec's REQ-001..003; grounded in the create choke point (I1), payload whitelist (I2), text column storage (I3), Notion scope parity (I7 f6).
2. **P0 — Persist via existing `updateViewDefFile` path with `skipHistory` metadata** — REQ-002 without undo pollution; the fork already supports it (I8 f1); debounced save persists the final counter (I8 f5).
3. **P1 — Documented defaults: prefix `""`, counter 0, padWidth 3, field `unique-id`** — resolves spec §9 open question 1 and Scenario 5; Notion's null-prefix default (I7 f3).
4. **P1 — Ordering: increment-then-create with the existing paired rollback** — create failure restores counter + trashes note (I8 f2); no duplicate ids.
5. **P2 — Config UI: toolbar `configureUniqueId` callback + `UniqueIdConfigModal` + 6 i18n keys × 3 locales** — mobile-safe Modal pattern (I9 f2/f5); additive, outside the 1–3 call-site budget.
6. **P2 — Display-only id column** (optional): Notion read-only parity (I7 f5); the fork lacks per-column read-only machinery (I5 f2) — cheapest form is ignoring edits or a render hint when `col.key === cfg.field`; do NOT build a general read-only cell system.
7. **P2 — Bulk/paste create paths inherit the stamp automatically** (DatabaseView.ts:8759-8779) since they share `buildCreateEntryPlan` — verify no double-stamp on paste-with-rename path.
8. **Documented limitation — two-device pre-sync duplicates** stay best-effort (spec §8; I8 f6); no lock files.

## 4. REQ / SC mapping

- REQ-001 (stamp at create, INV-001→INV-002): call site 3; SC-001/Scenario 1-2.
- REQ-002 (persist counter in db_view config, survives reload): call sites 1-2; SC-002.
- REQ-003 (rebase-clean diff): 1 new module + 3 call-site edits; SC-004.
- REQ-004 (rename-independent): by construction — frontmatter property, rename only moves paths (I3 f4); Scenario 4.
- REQ-005 (mobile/iCloud/MIT/no telemetry): zero-import pure module + cross-platform Modal (I9 f5); create-time only, no backfill (Scenario 3).
- SC-003 (no backfill): stamp only inside `planCreateEntry` — existing notes untouched.

## 5. Answers to spec §9 open questions

1. **Default format when db_view omits prefix/pad width** → `001` (prefix `""`, pad 3) — documented default; Notion parity says prefix optional (I7 f3).
2. **Immutable in UI after create?** → Notion: read-only (I7 f5); fork REQ only demands rename-independence; P2 enrichment optional.
3. **Can one of the twelve types store the value?** → Yes: `text` (I3 f1); no type-registration edit.

## 6. Ruled-out inventory (negative knowledge)

- Stamp in `DataSource.createNote` (I1), template-sourced ids (I1), 13th column type / computed expression (I3), AppFlowy-style UUID identity (I4), view-filter-derived id (I6), sidecar/lock files and vault scans (I8), column-menu or plugin-settings config placement (I9).

---
