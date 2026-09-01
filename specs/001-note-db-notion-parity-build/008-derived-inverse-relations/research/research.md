# Deep Research: Derived Inverse (Safe Two-Way) Relations

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/deepseek-flash-max`. Stop reason: max_iterations. Average newInfoRatio: 0.745.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 001 — Fork scan-contract deep read (REQ-003 inversion surface)

Status: complete | Focus: pin the exact RelationRollup.ts scan shape and RelationLinks.ts parsing contract the inverse must reuse; locate relation/rollup type surface and view-layer call sites.

## Findings

### F1.1 — The scan contract the inverse must invert (REQ-003/NFR-P01)
`buildRelationRollups(context)` in `src/data/RelationRollup.ts` is the single forward scan. Its inversion surface, exactly:

1. Relation columns of the **source** database are selected by `column.type === "relation" && column.relationConfig?.targetDatabaseId` (`src/data/RelationRollup.ts:28-32`).
2. Per source record, stored values are parsed with `parseRelationValues(sourceRecord.frontmatter[relation.key])` (`src/data/RelationRollup.ts:70`; parser in `src/data/RelationLinks.ts:23-26`, wikilink regex `^\s*\[\[([\s\S]+?)\]\]\s*$` at `RelationLinks.ts:7`, alias/subpath stripping at `:15-19`).
3. Link targets resolve via `app.metadataCache.getFirstLinkpathDest(link.target, sourceRecord.file.path)` — Obsidian link resolution, not string matching (`RelationRollup.ts:71`).
4. Resolved paths are deduped per record (`seenPaths`, `RelationRollup.ts:69-75`) and validated against the target database's record set via `getRecordsForDatabase(target)` → `recordsByPath` map (`RelationRollup.ts:38-56`, `:73-76`).
5. Valid targets accumulate into `targetPaths: Set<string>` (`RelationRollup.ts:21`, `:76`) — "used to scope refreshes".

### F1.2 — Type surface (answers spec open question "exact export names")
- `RelationConfig { targetDatabaseId: string }` — `src/data/types.ts:34-37`. Single field; cross-database targeting is exactly this id.
- `RollupConfig { relationField, targetField, aggregation: "count"|"sum"|"avg"|"list" }` — `types.ts:39-45`.
- `ColumnDef.relationConfig?` (line 68) and `ColumnDef.rollupConfig?` (line 70) with the load-bearing comment: *"Rollups are display-only derived values and are never written to frontmatter"* (types.ts:69). The fork already has a display-only derived-value precedent — the inverse is the same class of value, which directly supports SC-002/SC-003 and the "display-only" mobile/iCloud constraint.
- `NoteRecord { file: TFile; frontmatter }` — `src/data/DataSource.ts:23-26`; `writeQueues = Map<path, Promise<void>>` per-path queue at `DataSource.ts:89` (single-path write constraint, REQ-001/REQ-005 anchor).

### F1.3 — buildRelationRollups has exactly two view-layer call sites (integration points)
- `src/views/DatabaseView.ts:3393` (`calculateRelationRollups`), gated by `database.schema.columns.some(c => c.type === "rollup")` at `:3389`.
- `src/views/EmbeddedDatabaseRenderer.ts:3202`, same gate at `:3198`, with `cacheTargets` flag also wiring `targetPaths` for refresh scoping (`:3210-3211`).
- Both construct the identical `RelationRollupContext` (`app`, `sourceRecords`, `sourceDatabase`, `databases`, `getRecordsForDatabase: (t) => this.dataSource.getRecordsForDatabase(t)`).

### F1.4 — Structural asymmetry: rollups scan OUT (source→target), inverse must scan IN (target←sources)
`buildRelationRollups` iterates only `sourceRecords` of one source database and pushes outbound edges. An inverse for target DB `T` needs **fan-in across every database** whose relation columns carry `relationConfig.targetDatabaseId === T.id` — multiple source databases can point at one target (Notion parity: a record page lists inbound rows from all related databases). The inverse therefore needs its own entry point that consumes the same `databases[]` + `getRecordsForDatabase` contract but iterates all source databases, not just `sourceDatabase`. This is a design fork from "piggyback on buildRelationRollups", which only runs when the source DB has rollup columns (early return `RelationRollup.ts:36`; view gates above).

### F1.5 — The record-page surface for inverse display already exists
`renderRelationValue` is the single shared relation renderer, consumed by:
- `src/views/CellRenderer.ts:331-333` (table cells),
- `src/views/RecordDetailPanel.ts:320` — the record detail panel (the fork's "record page"; Notion's page-backlinks equivalent surface),
- `src/views/ListRenderer.ts:518`, `src/views/GalleryRenderer.ts:557`, `src/views/BoardRenderer.ts:1030` (compact badge mode).
Renderer contract: `renderRelationValue(parent, app, row, value, compact)` returns false when empty, renders `a.db-relation-link.internal-link` anchors with icon/label/tooltip/hover-preview, click → `app.workspace.openLinkText(link.target, row.file.path)` (`src/views/RelationValueRenderer.ts:14-36`). The inverse can reuse this exact renderer (or a thin variant) for read-only inbound links.

### F1.6 — Rollup dependency planner exists
`planRelationTargetChange` (`src/data/RelationTargetChange.ts:23-49`) already enumerates rollups dependent on a relation field and invalidates them on target change (`requiresReconfigure`). Any inverse display must be invalidated by the same relation-target changes (refresh-scoping reuse of `targetPaths`).

## Ruled out this iteration
- Direct string-prefix matching of link targets (e.g. `link.target` vs path) — the fork resolves via `metadataCache.getFirstLinkpathDest` (RelationRollup.ts:71), which handles vault-relative paths, aliases, and moved files; the inverse must use the same resolver, not a parallel resolver (fail-closed: same scan shape).

## Next focus
Iteration 2: AppFlowy data-layer mining — `frontend/rust-lib/flowy-database2` relation field model (RelationField, setting, inverse/related computation) with real path:line citations.

---

# Iteration 002 — AppFlowy data-layer model (flowy-database2 Rust)

Status: complete | Focus: how AppFlowy models the relation and its inverse at the data layer, with real path:line evidence from the cloned repo (`specs/obsidian/002-note-db-notion-parity-build/context/appflowy`).

## Findings

### F2.1 — AppFlowy relation type option is structurally identical to the fork's RelationConfig
`RelationTypeOptionPB { database_id: String }` — `appflowy/frontend/rust-lib/flowy-database2/src/entities/type_option_entities/relation_entities.rs:44-48`. The Rust impl `RelationTypeOption` carries the same single field (`database_id`) at `src/services/field/type_options/relation_type_option/relation.rs:20-25`. This is the exact analog of the fork's `RelationConfig { targetDatabaseId }` (`types.ts:34-37`): a relation field is defined by "which other database it points at", nothing more.

### F2.2 — Relation cells store forward row ids; writes are insert/remove deltas
`RelationCellData { row_ids: Vec<RowId> }` (`src/services/field/type_options/relation_type_option/relation_entities.rs:3-7`; proto view `RelationCellDataPB { row_ids: Vec<String> }` at `src/entities/type_option_entities/relation_entities.rs:7-11`). The changeset applies inserted/removed row ids with dedupe and removal (`relation.rs:27-57`). The fork's analog is the frontmatter wikilink list parsed by `parseRelationValues` (`RelationLinks.ts:23-26`).

### F2.3 — Forward read path is a fetch-by-ids, not a scan
`get_related_database_id(field_id)` reads the target database id from the type option (`src/services/database/database_editor.rs:1752-1765`). `get_related_rows(row_ids)` resolves target rows by id and reads their primary (name) field (`database_editor.rs:1780-1799`). The Flutter cell bloc drives it via `DatabaseEventGetRelatedRowDatas` (`appflowy_flutter/lib/plugins/database/application/cell/bloc/relation_cell_bloc.dart:51-64`).

### F2.4 — No inverse computation exists in the visible AppFlowy data layer
`grep -rn "invert"` over `flowy-database2/src` returns zero hits; the cell bloc only ever writes forward deltas (`relation_cell_bloc.dart:119-135`). The reciprocal "related field" machinery (auto-created mirror field on the target database when a relation is created) lives in the `collab-database` crate, which is a workspace git dependency — `collab-database = { workspace = true }` at `frontend/rust-lib/flowy-database2/Cargo.toml:10` — and is NOT vendored in this clone. What is locally verifiable: the visible `RelationTypeOptionPB` carries only `database_id` (`relation_entities.rs:44-48`), i.e. no invert flag survives into the visible proto surface.
> INFERRED (would confirm by opening the collab-database crate): AppFlowy's full model mirrors the relation onto the target database as a second stored field — the exact dual-storage cost the fork's spec REQ-001/REQ-005 exists to avoid. Even without that crate, the visible layer stores the forward edge in exactly one cell (`row_ids`) and computes nothing inverse.

### F2.5 — Type-option editor UX: pick a target database
The relation type-option editor is a target-database picker: list of database metas (`relation_type_option_cubit.dart:15-37`), selection writes `databaseId` into the type option (`widgets/field/type_option_editor/relation.dart:79-95`, `:107-115`). Cell editor switches between "no target DB → picker" and "target DB → selected rows" (`widgets/cell_editor/relation_cell_editor.dart:26-46`).

## Ruled out this iteration
- Treating AppFlowy's visible layer as having a derived inverse: it does not — its inverse (if any) is the external mirror-field creation, which is out of the fork's scope by design (syncWrites OFF). The fork's derived-inverse is the more conservative choice; AppFlowy's UI still validates the *benefit* (related rows visible from both sides).

## Next focus
Iteration 3: AppFlowy Flutter UI — how related rows render on the target side (row detail, related section) and any "linked rows" affordance; plus the AppFlowy relation cell display (chips). Answers q-ui-ux (AppFlowy half).

---

# Iteration 003 — AppFlowy Flutter UI (target-side related surface)

Status: complete | Focus: how AppFlowy renders relation cells and presents the target-side/related affordance; map to the fork's call sites.

## Findings

### F3.1 — Relation cell: underlined row-name chips, wrap or horizontal scroll
`DesktopGridRelationCellSkin` (`appflowy_flutter/lib/plugins/database/widgets/cell/desktop_grid/desktop_grid_relation_cell.dart:15-110`): rows render as `FlowyText` with `TextDecoration.underline` (line 73, 101), empty names get a title placeholder (lines 69-71, 97-99), wrapped with 4px spacing or single-line horizontal scroll (lines 55-80, 82-108). Click opens the `RelationCellEditor` popover (max 400x400, lines 26-40). This matches the fork's relation chip rendering (`RelationValueRenderer.ts:16-35`: `a.db-relation-link.internal-link` with icon + label) — both are inline chips; the fork adds Obsidian-native click-to-open + hover preview.

### F3.2 — Clicking a related row navigates to a full row-detail page in the target database
`RelatedRowDetailPage` (`widgets/row/relation_row_detail.dart:8-44`) opens a `RowDetailPage` bound to the *related* database + row (`RelatedRowDetailPageBloc`, `application/row/related_row_detail_bloc.dart:16-114`, resolves default view id of the target database at `:76-82`). Fork analog: `renderRelationValue` click → `app.workspace.openLinkText(link.target, row.file.path)` (`RelationValueRenderer.ts:30-34`). AppFlowy's UX confirms the pattern: inbound list → navigate to source record, no write involved.

### F3.3 — No target-side inverse list exists in the visible AppFlowy UI layer
The row-detail page renders the row's own fields (via `RowDetailPage`, `relation_row_detail.dart:32-37`); nothing in the visible clone computes "rows that point at this row". The reciprocal display depends on the mirrored relation field created by the non-vendored `collab-database` crate (see F2.4). Verified boundary: the visible UI never renders an inverse without a stored field.

## Ruled out this iteration
- Looking for a computed inverse in AppFlowy's UI layer: none exists in the clone; the fork's derived-inverse remains the differentiating design, and AppFlowy's *forward* cell UX (underline chips + navigate) is the pattern to borrow.

## Next focus
Iteration 4: Anytype — `anytype-ts/src/ts` relation/backlink handling: how relations are stored (one-side?), any inverse/backlink computation, and UI affordances. Answers q-appflowy-model (Anytype half) + q-ui-ux (Anytype half).

---

# Iteration 004 — Anytype: backlink model and UI (anytype-ts)

Status: complete | Focus: how Anytype models backlinks (data layer) and presents them (UI), with real path:line evidence from the cloned repo (`specs/obsidian/002-note-db-notion-parity-build/context/anytype-ts`). Answers the Anytype half of q-appflowy-model + q-ui-ux.

## Findings

### F4.1 — Anytype `backlinks` is a computed system relation key; the TS app only subscribes to it
Anytype treats inbound links as a first-class *relation key* `backlinks` (sibling: `links` for outbound). The computation itself lives in the non-vendored Go middleware (anytype-heart); the TS surface proves it by consuming the key everywhere:
- `src/ts/lib/util/object.ts:494` — `getByIds` appends `[ 'links', 'backlinks' ]` to requested record keys, i.e. backlinks arrive with the record, no second fetch.
- `src/ts/component/popup/search.tsx:737-744` — search rows read `Relation.getArrayValue(item.links)` / `item.backlinks`; non-empty arrays classify the row as drill kind `'backlink'` ("rows with links search related objects (in-space only - the object graph is per-space)", `:721-723`).
- `src/ts/component/page/main/date.tsx:81` — date page excludes `links`/`backlinks` from its relation list: system-computed, not user-editable.
> INFERRED (computation not vendored): the middleware derives `backlinks` from the same stored link edges that produce `links` — the TS side never writes `backlinks` (no write call exists for it in this clone). Even without the middleware, the client contract is unambiguous: one stored edge, both directions exposed read-only.

### F4.2 — Anytype UI: a count chip in the object's featured relations; empty → nothing
`renderLinks` (`src/ts/component/block/featured.tsx:185-208`) renders the backlink affordance as a read-only count chip: `U.String.sprintf(translate('commonCountRelation'), l, plural('backlinks'))` (`:203`) — i.e. "3 backlinks" — click opens a menu listing the linked objects with descriptions (`onLinks`, `featured.tsx:522-534`). When the array is empty the cell renders `null` (`:192-194`): no placeholder, no empty state. This maps 1:1 to the fork's record-detail surface: inbound count chip → list, hidden when empty (spec edge case "Empty relation: inverse returns an empty inbound list; no placeholder rows").

### F4.3 — Backlinks are *featured* by default: Anytype treats inbound links as primary metadata
`src/ts/lib/util/object.ts:983` — new Type objects are created with `recommendedFeaturedRelations: [ 'type', 'tag', 'backlinks' ]`. Not a buried "links" sidebar: Anytype surfaces the inbound set on the object's header row by default. Strong Notion-parity signal for the fork: the derived inverse deserves a first-class slot on the record detail panel, not a hidden debug list.

### F4.4 — Backlink scope is space-wide (the whole graph), matching the fan-in design
The search comment (`search.tsx:721-723`) states the object graph is per-space and backlink drilling is "in-space only". Anytype does not scope backlinks to a single database/set — any object in the space that links to the target is an inbound. Fork analog (F1.4): the inverse must fan in across **every database** whose relation columns target the given DB, plus — strictly stronger than Anytype — filter by `RelationConfig.targetDatabaseId` (spec REQ cross-db honoring) because the fork's relations are database-scoped while Anytype's links are not.

### F4.5 — Anytype never stores the backlink; both directions derive from one edge set
There is no "backlink" write path in this clone (the key is read-only everywhere it appears: `object.ts:494` read-subscribe, `featured.tsx:188` read, `date.tsx:81` hide, `search.tsx:738` read). Product semantics = exactly the fork's REQ-001/REQ-002: one stored forward edge, computed inverse, display-only. Anytype validates the concept at scale (a graph product ships two-way as computed), which de-risks the fork's derived-inverse choice versus AppFlowy's stored mirror field (F2.4).

## Ruled out this iteration
- Looking for a client-side backlink *writer* or inverse *algorithm* in anytype-ts: neither exists in the clone — the algorithm is middleware-owned. The fork must own its algorithm; Anytype only proves the UX contract (count chip + list + featured placement + empty→hidden).

## Next focus
Iteration 5: Notion — how Notion stores/exposes two-way relations (target-side property, relation rollups, "related" UX) via WebFetch of help docs and API docs. Answers q-notion-model + the Notion half of q-ui-ux.

---

# Iteration 005 — Notion two-way relations (help docs + API docs via WebFetch)

Status: complete | Focus: how Notion stores and exposes two-way relations, and the "related"/rollup UX — the parity target for the fork. Answers q-notion-model + Notion half of q-ui-ux.

Sources: [notion.com/help/relations-and-rollups](https://www.notion.com/help/relations-and-rollups) (fetched 2026-08-25), [developers.notion.com/reference/property-object#relation](https://developers.notion.com/reference/property-object#relation), [developers.notion.com/reference/page-property-values#relation](https://developers.notion.com/reference/page-property-values#relation).

## Findings

### F5.1 — Notion's two-way relation is a SECOND STORED property on the target data source (API-verified)
The relation property type object is `{ data_source_id, dual_property }` where `dual_property: { synced_property_id, synced_property_name }` is "Present for dual (bidirectional) relations" [SOURCE: developers.notion.com/reference/property-object#relation — Relation §, type-object table]. The UI creates that property via the `Show on [name of related database]` toggle: "We've created a relation from the Customer database to the Items database, and a relation from the Items database to the Customer database" [SOURCE: notion.com/help/relations-and-rollups — Two-way relations §]. Confirmed: Notion's two-way = mirrored stored property + write fan-out — exactly the cost the fork spec exists to avoid (REQ-001/REQ-005, iCloud single-path). The fork's derived inverse is the storage-cheaper substitute, not a fidelity loss on the visible benefit.

### F5.2 — Write behavior: edits sync both ways
"With two-way relations, the edits work both ways! So if you add a customer to the Items database in the relation column, the change pops up in your Customers database" [SOURCE: notion.com/help/relations-and-rollups — Two-way relations §]. Also: "when you add an item bought into the Customers database, the customers who bought them automatically appear in the ↗ Customers column in the Items database" [SOURCE: same, What is a database relation? §]. Notion dual-writes the synced property. The fork's default path must NOT do this (NFR-P02, REQ-005); `syncWrites` OFF is the permanent default — this finding pins what "ON" would mean later (Notion-equivalent mirror writes).

### F5.3 — Self-relations: a single property works BOTH ways — Notion's only "derived" inverse case
"A relation from a database to itself works a little differently... With one property, the relation can work in both directions. If you add Task B to Task A, Task A can also show up on Task B." Tip: "A self-relation with one property isn't fully one-way. To keep each direction separate, turn on Two-way relation and hide the property you don't need" [SOURCE: notion.com/help/relations-and-rollups — Relate a database to itself §]. For self-targeting relations the stored set IS symmetric — the inverse is literally the same edge list reversed, which is precisely the fork algorithm's behavior for a self-targeted DB (spec edge case "Circular wikilinks: inverse is a reverse index of stored edges, not a recursive expander"). Notion validates: no recursion, no extra storage; same set, both directions.

### F5.4 — Display options include "Hide when empty" — the empty-state contract
Relation display on a database page: "Property visibility" → `Always show`, `Hide when empty`, `Always hide` [SOURCE: notion.com/help/relations-and-rollups — Display options for relations §]. Triangulates with Anytype's empty → render `null` (F4.2) and the spec's "empty relation → empty inbound list, no placeholder rows". Recommendation for the fork record page: render the inverse section only when non-empty (matches BOTH references and keeps the record page uncluttered on mobile).

### F5.5 — Cardinality limit ("1 page or No limit") — the many-to-one analog
"You can choose to limit the number of pages that can be included in your relations property – with the option to select 1 page or to have No limit... especially useful when only one order number should be associated with each purchase" [SOURCE: notion.com/help/relations-and-rollups — View and remove related pages §]. The fork's many-to-one stored wikilink (Expenses.Month → one Report) is the "1 page" Notion configuration — the inverse must be a LIST of sources even when the forward cardinality is 1 (spec: "One Expense to one Report: inverse lists that single source").

### F5.6 — Rollups compute over the related-pages set; the fork's RollupConfig already covers Notion's core union
Rollup display options: `Show original` ("just shows all related pages in the same cell"), `Show unique values`, `Count all`, `Count values`, `Count unique values`, `Count empty`, `Count not empty`, `Percent empty/not empty`, `Sum`, `Average`, `Median`, `Min`, `Max`, date earliest/latest [SOURCE: notion.com/help/relations-and-rollups — rollup section]. API shape: rollup property config = `relation_property_id` + `relation_property_name` [SOURCE: developers.notion.com/reference/property-object#rollup — §Rollup]. Fork mapping (types.ts:39-45): `count` ≈ Count all/values, `list` ≈ Show original, `sum`/`avg` ≈ Sum/Average. SC-003 ("rollups aggregate the derived inbound set") is exactly Notion's rollup-over-related-pages; the fork's 4-aggregation union is the compatible subset and needs no new aggregation kinds.

### F5.7 — API pagination: relation values cap at 25 references — large inverse sets need lazy rendering
"has_more: If a relation has more than 25 references, then the has_more value for the relation in the response object is true" [SOURCE: developers.notion.com/reference/page-property-values#relation — §Relation, has_more field]. Related page references are `{id}` arrays. Fork analog: an inverse list on the record page can grow (many Expenses → one Report); cap/render-window the inverse chips (mobile memory safety, NFR-P02 — no writes, but render cost is bounded).

## Ruled out this iteration
- Searching for a Notion "computed inverse" mode: none exists — every two-way path is a stored `dual_property` (F5.1). The only derived-like case is the self-relation single property (F5.3). The fork's design is therefore strictly beyond Notion on storage while matching it on the visible surface.

## Next focus
Iteration 6: Edge cases + safety — empty/dangling/cross-database/circular/concurrent writes + mobile/iCloud single-path writes; how the fork's DataSource.writeQueues + metadataCache resolution constrain the inverse; what the references do for each case.

---

# Iteration 006 — Edge cases + mobile/iCloud safety (fork-grounded)

Status: complete | Focus: map every spec §8 edge case to concrete fork behavior using the real DataSource.writeQueues, metadataCache resolution, and RelationTargetChange invalidation; check what the references do for each. Answers q-edge-safety.

## Findings

### F6.1 — Empty relation and empty inverse are already fail-closed in the scan shape
`parseRelationValues(undefined)` yields `[]`; the per-record loop then never runs, `relatedRecords` stays empty, `count` → 0 and `list` → `[]` (`RelationRollup.ts:70`, `:99`, `:159-161`). The inverted scan inherits this for free: an empty stored wikilink list produces an empty inbound set with zero writes (NFR-R02). UI contract triangulated: Anytype renders nothing for empty backlinks (featured.tsx:192-194), Notion offers explicit "Hide when empty" visibility (F5.4). Recommendation: record-page inverse section renders only when non-empty — matches both references and the spec's "no placeholder rows".

### F6.2 — Dangling wikilinks are omitted by the same resolver, never repaired
`context.app.metadataCache.getFirstLinkpathDest(link.target, sourceRecord.file.path)` returns `null` for a missing target and the code `continue`s (`RelationRollup.ts:71-72`) — no file created, no membership attempt. The inverse uses the identical resolver (F1.6), so dangling sources simply never enter any target's inbound set (spec Scenario 4). Notion behaves the same way: a deleted related page just disappears from the relation property (F5.7 context; no target auto-creation anywhere in the reference surface).

### F6.3 — Cross-database inbound is enforced by targetDatabaseId membership, not path shape
`buildRelationRollups` filters relation columns to `column.relationConfig?.targetDatabaseId` (`RelationRollup.ts:28-32`) and validates each resolved path against the target DB's `recordsByPath` map built from `getRecordsForDatabase(database)` (`:50-56`, `:73-74`). A wikilink that resolves but points at a note outside the target database is skipped (`:74`). The inverse must replicate this exact membership check per (source column → target DB id) pair — this is what makes the fan-in "cross-database-correct" (spec: honor `RelationConfig.targetDatabaseId` the same way the forward scan does). Anytype's looser space-wide backlinks (F4.4) confirm the fork's stricter filter is the safer superset.

### F6.4 — Circular and self-referential relations: reverse index, no recursion — Notion validates
The spec's contract ("inverse is a reverse index of stored edges, not a recursive expander") matches Notion's self-relation behavior with a single property: the same stored set serves both directions ("If you add Task B to Task A, Task A can also show up on Task B", F5.3). The inverted scan is one pass over parsed frontmatter; a source whose relation points at its own database simply appears in the inbound set of the target record — no expansion, no cycle traversal. A record that links to itself appears once (dedupe via `seenPaths`, `RelationRollup.ts:69-75`).

### F6.5 — Concurrent rapid edits: per-path write queues; the inverse is never a write participant
`writeQueues = Map<path, Promise<void>>` (`DataSource.ts:89`); `enqueueWrite` serializes writes on the SAME path, swallows prior errors so the queue never poisons, and cleans up when its slot is the tail (`:99-120`). Two rapid relation clicks on different Expenses key two different paths; the Report is not enqueued because the inverse never writes (NFR-P02). This is the concrete mechanism behind spec Scenario 3 / REQ-005: `writeQueues` receives exactly one path per click.

### F6.6 — View refresh while a source write is queued: inverse reads the in-memory cache, no repair writes
`getRecordsForDatabase` filters `this.getCachedRecords()` (in-memory `recordCache`, `DataSource.ts:229-232`, `:242`), and `getRecordSnapshot` consults the cache first (`:239-244`). The inverse therefore reads the currently parsed forward links — the same view the rollup scan reads — and never flushes "repair" writes to the target (spec §8 Concurrent Operations, NFR-R02). Plugin-owned writes are credited via `ownedPathUntil` (`DataSource.ts:81-84`, `markPluginWrite :246-249`) so they don't re-trigger change loops. iCloud sees one note churn per click (REQ-001/005).

### F6.7 — Relation-target changes already have an invalidation planner to reuse
`planRelationTargetChange` (`RelationTargetChange.ts:23-49`) enumerates rollups whose `relationField` matches a changed relation and flags `requiresReconfigure` when the target field no longer resolves (`:30-33`, `:45-48`). When a relation column's `targetDatabaseId` changes, the inverse's fan-in set changes too; the same planner (or its shape) must invalidate/refresh cached inverse results for both the old and new target DB. This is the refresh-scoping counterpart to `targetPaths` (F1.4/F1.6): keep the inverse cache keyed by (databaseId, recordPath) and clear it when a relation column target changes.

### F6.8 — Large inbound sets: bound the render, not the computation
Notion's API caps a relation value at 25 references with `has_more` (F5.7). Fork analog: a Report with hundreds of Expenses must not render hundreds of chips in one record-page pass on mobile. The inverse computation itself is one O(edges) pass (cheap); the UI should render a bounded window (e.g. first N + "and M more") — pure display policy, no writes (NFR-P02).

### F6.9 — Scan API mismatch fails closed by construction
If an expected export of `RelationRollup.ts`/`RelationLinks.ts` is missing at build time, the call site must treat it as "no inverse rows" and never fall back to a second scanner (spec §8 Error scenarios). The EuroFormat isolated-diff budget (REQ-007) keeps this check small: the inverse imports only `parseRelationValues` + the context contract, both already pinned (F1.1).

## Ruled out this iteration
- Buffering inverse writes to "catch up" after concurrent clicks: the spec forbids write participation entirely; Anytype/Notion never flush inverse repairs either (F4.5, F5.2 — Notion writes only because it STORES the mirror; the fork stores nothing).

## Next focus
Iteration 7: Fork integration design — full read of types.ts, EuroFormat.ts (the pattern), RelationLinks.ts; pin the exact RelationInverse.ts module shape (exports, context, algorithm), call-site hunks, and syncWrites OFF declaration.

---

# Iteration 007 — Fork integration design: RelationInverse.ts module shape + call-site hunks

Status: complete | Focus: full reads of types.ts / EuroFormat.ts / RelationLinks.ts; pin the exact isolated-module shape (exports, context, algorithm), the 1–3 call-site edits, and the syncWrites OFF declaration (REQ-006/REQ-007/SC-005).

## Findings

### F7.1 — EuroFormat.ts is the exact diff-shape model: self-contained, pure, WHY-only header
`EuroFormat.ts` (42 lines) imports nothing, exports three pure functions, and opens with a durable-WHY header ("The stock renderer prints integers with String()…", "Local fork override. Kept in one module so it stays a small, rebasable diff.") (`EuroFormat.ts:1-10`). RelationInverse.ts should mirror this: zero side effects, no class, no plugin hooks; only the scan contract's own types. This keeps REQ-007 (rebase-friendly isolated diff) mechanical: new file + import lines only.

### F7.2 — The module contract the inverse imports is small and already pinned
- Parser: `parseRelationValues(value): ParsedRelationLink[]` + `ParsedRelationLink { raw, target, alias? }` (`RelationLinks.ts:1-26`); regex strips alias after `|` and subpath after `#` (`:15-19`). The inverse reuses these exact exports — zero parser duplication, and `getRelationDisplayLabel` (`:29-31`) is the label contract for inverse chips (alias || basename).
- Types: `RelationConfig { targetDatabaseId }` (`types.ts:34-37`), `RollupConfig { relationField, targetField, aggregation: "count"|"sum"|"avg"|"list" }` (`:39-45`), `ColumnDef.relationConfig?` / `rollupConfig?` (`:68-70`) with the load-bearing precedent comment "Rollups are display-only derived values and are never written to frontmatter" (`:69`).
- Records: `NoteRecord { file, frontmatter }` (`DataSource.ts:23-26`); `getRecordsForDatabase(db)` reads the in-memory cache (`DataSource.ts:229-232`).
- The full import set for RelationInverse.ts: `App` (obsidian), `parseRelationValues` (RelationLinks), `ColumnDef`/`DatabaseConfig` (types), `NoteRecord` (DataSource) — a strict subset of RelationRollup.ts's imports (F1.1). No new dependency.

### F7.3 — Proposed module shape (grounded in the scan contract)
```
export interface RelationInverseContext {
  app: App;
  databases: DatabaseConfig[];                       // fan-in scope: ALL databases
  getRecordsForDatabase(database: DatabaseConfig): NoteRecord[];
}
export interface RelationInverseEdge {
  sourceDatabase: DatabaseConfig;
  relationColumn: ColumnDef;                         // the column whose targetDatabaseId === target.id
  sourceRecord: NoteRecord;
}
export interface RelationInverseResult {
  inboundByPath: Map<string, RelationInverseEdge[]>; // target record path → inbound edges
  sourcePaths: Set<string>;                          // refresh-scoping analog of targetPaths (F1.4)
}
export function buildRelationInverse(context: RelationInverseContext): RelationInverseResult;
export const SYNC_WRITES_DEFAULT = false;            // REQ-006: flag lives on the module → zero type-file touches
```
Algorithm — the SAME scan as `buildRelationRollups`, inverted (REQ-003):
1. **Fan-in index**: for every database in `databases`, collect columns with `type === "relation" && relationConfig?.targetDatabaseId` (identical filter to `RelationRollup.ts:28-32`), grouped by `targetDatabaseId`.
2. **Per target DB T**: for each source (db, column) whose `targetDatabaseId === T.id`, iterate `getRecordsForDatabase(db)` records; per record `parseRelationValues(record.frontmatter[column.key])` → `app.metadataCache.getFirstLinkpathDest(link.target, record.file.path)` → skip unresolvable (dangling, F6.2) → dedupe per record via `seenPaths` → membership check against T's `recordsByPath` (built exactly like `RelationRollup.ts:50-56`) → append `{sourceDatabase, relationColumn, sourceRecord}` to `inboundByPath.get(resolvedPath)`.
3. Empty relation → `[]` parse → no edges (F6.1); cross-database misses → membership skip (F6.3); self/circular → the same reverse index, no recursion (F6.4).

The only structural deltas vs the forward scan: outer loop is all-databases (not `sourceDatabase`), and results are keyed by target path instead of source path. Same resolver, same dedupe, same membership, same in-memory records — NFR-P01 holds by construction. **Critical gate already proven (F6.5): the inverse cannot call `buildRelationRollups` itself — it early-returns when the source DB has no rollup columns (`RelationRollup.ts:36`); the inverse is its own entry with the same shape.**

### F7.4 — Call-site hunks (1–3, in the spec's allowed budget)
1. **Record-page inverse section — `RecordDetailPanel.ts:320` region** (PRIMARY, Notion/Anytype parity: both references show the inbound list on the row/object page — F4.2 featured chip, F5.2 related column, F3.2 row-detail navigation). The record detail panel already renders relation values via the shared `renderRelationValue` (F1.5); a read-only "Inbound" section consumes `inboundByPath.get(currentPath)` and renders with `getRelationDisplayLabel`; empty → render nothing (F6.1/F5.4/F4.2).
2. **Rollup-over-inverse (SC-003) — `RelationRollup.ts` / its view call sites (`DatabaseView.ts:3393`, `EmbeddedDatabaseRenderer.ts:3202`)**: when a rollup column's `relationField` cannot resolve to a local relation column, resolve it as an INVERSE relation (a relation column on another database whose `targetDatabaseId === this.id`) and aggregate `inboundByPath` entries with the existing `aggregateRollup` (`RelationRollup.ts:92-129`) — count/list/sum/avg unchanged, no new aggregation kinds (F5.6: fork's 4 kinds are Notion's compatible subset). This is the one spot where `RollupConfig.relationField`'s "same source database" comment (`types.ts:40-41`) must be READ AS EXTENDED — flag it as a documented resolution rule, not a schema change.
3. **Back-reference label helper — `RelationLinks.ts`**: one exported helper (e.g. `getInverseRelationLabel`) so cells/width-measurement/group surfaces share the inverse display contract (`ColumnWidth.ts`, `GroupDisplay.ts` consumers stay untouched — they call the label function, which is the EuroFormat-style single-point change).

### F7.5 — syncWrites OFF declaration (REQ-006) without a type/config touch
Declaring `SYNC_WRITES_DEFAULT = false` (and an optional `syncWrites?: boolean` context flag defaulting to it) on `RelationInverse.ts` itself satisfies SC-005 ("at most one type/config touch IF required" — zero required). The flag must never be read to enable writes in this phase: the module contains no write path at all (NFR-P02; F6.5). Comment hygiene: durable WHY only ("the inverse must never rewrite the target: one stored wikilink, one computed direction"), no spec-path/requirement-id comments (AGENTS comment-hygiene block).

### F7.6 — Complexity and refresh cost are bounded
One pass over S×E edges where S = source columns targeting T and E = edges in those columns — identical cost class to the existing rollup pass over one DB (`RelationRollup.ts:58-88`). Compute per target database once per refresh (the `targetPaths` scoping pattern, F1.4), not per record: `inboundByPath` for T is built once and serves every record page of T; `sourcePaths` drives invalidation (clear T's inverse when any source path in `sourcePaths` changes, or on relation-target change via the `planRelationTargetChange` shape — F6.7).

## Ruled out this iteration
- A schema change to `RollupConfig` (new field for inverse): unnecessary — the inverse-resolution rule in F7.4(2) reuses the existing config; keeps SC-005 at 3 hunks.
- Calling `buildRelationRollups` from the inverse or vice versa: both directions early-return on the other's preconditions (F6.5) — they share shape, not execution.

## Next focus
Iteration 8: UI/UX synthesis — the concrete record-page inverse section design (placement, chip rendering via renderRelationValue reuse, count chip vs list, bounded window, empty state, mobile rendering), ranked against Notion/AppFlowy/Anytype patterns. Answers q-ui-ux.

---

# Iteration 008 — UI/UX synthesis: the fork's record-page inverse surface

Status: complete | Focus: merge the three references' inverse UX patterns with the fork's real renderer contract into one ranked, call-site-fitting design. Answers q-ui-ux.

## Findings

### F8.1 — The fork's shared relation renderer is the natural inverse renderer (contract pinned)
`renderRelationValue(parent, app, row, value, compact): boolean` (`src/views/RelationValueRenderer.ts:7-37`): returns `false` when the parsed value is empty (`:15`); builds `div.db-relation-values` → per link an `a.db-relation-link.internal-link` with icon (`file-text`), label via `getRelationDisplayLabel` (`:24-29`), `markNoteHoverLink` hover-preview, and click → `event.preventDefault/stopPropagation` + `app.workspace.openLinkText(link.target, row.file.path)` (`:30-34`). RecordDetailPanel consumes it at `:320-323` (compact chips, `has-badges`). The inverse surface is the same chip grammar over a different source (computed edges instead of frontmatter values) — the diff stays visual-schema-identical, which keeps Obsidian-native affordances (hover preview, click-to-open, internal-link styling) for free.

### F8.2 — Ranked design: record-page "back-references" section (R1)
- **Placement**: bottom section of the record detail panel, after the field list. Evidence: Anytype places backlinks in the object's featured relations (header row, F4.3); Notion shows the related column inline with page-level presence (F5.2); AppFlowy opens a dedicated row-detail page for the related side (F3.2). The fork's panel is field-list-based (`RecordDetailPanel.ts:320` renders values inside the field grid), so a trailing section is the smallest structural change and matches Notion's "page shows related pages" more closely than a popover.
- **Rendering**: one call that mirrors `renderRelationValue` mechanics — chips with icon + `getRelationDisplayLabel` + hover preview + click-to-open the SOURCE record (click semantics = AppFlowy's `RelatedRowDetailPage` navigation, F3.2). Inbound edges from `inboundByPath.get(currentPath)` (F7.3) map to `ParsedRelationLink`-shaped entries, so the existing renderer contract accepts them without a second renderer.
- **Count + bounded window**: show first N chips + a "+M more" affordance. Evidence: Notion's API caps relation values at 25 refs with `has_more` (F5.7); AppFlowy caps the cell popover at 400x400 with scrolling (F3.1); Anytype collapses the whole list behind a count chip (F4.2). Bounded rendering is the mobile-safe choice (no desktop-only APIs, REQ-008) and costs nothing in the data layer (the inverse pass is O(edges), F7.6).
- **Empty state**: hide the section entirely. Evidence: Anytype renders `null` for empty backlinks (`featured.tsx:192-194`), Notion offers explicit "Hide when empty" visibility (F5.4), spec §8 "no placeholder rows" (F6.1).
- **Label**: "Backlinks" — Obsidian's native backlinks terminology (the fork is an Obsidian plugin; users already know the concept from core backlinks). Distinguish from core backlinks if needed via the section's chip styling (relation icon + label), not new copy.

### F8.3 — Ranked design: rollup-over-inverse display (R2, SC-003)
When a rollup resolves as inverse (F7.4.2), `aggregateRollup` already yields Notion-compatible output: `list` ≈ Notion "Show original" (all related pages), `count` ≈ "Count all/values", `sum`/`avg` ≈ Sum/Average (F5.6). No new display mode; the existing rollup cell renderers consume the derived value unchanged. This is the cheapest way to give Reports a Notion-style inbound COUNT column without any stored property.

### F8.4 — Ranked design: cell-level inbound badge (R3, optional, defer)
An inbound-count badge on table cells (e.g. a small "↩ 3" next to the row's relation cell) is the closest to Anytype's header chip (F4.2) but adds a view-layer touch beyond the record page. References do NOT show inbound counts in table cells (AppFlowy table cells show only the forward relation chips, F3.1; Notion shows the dual property as a normal column only when two-way is ON, F5.1). Defer: keep the 3-hunk budget (SC-005) for R1 + R2.

### F8.5 — Interaction and state rules for the inverse surface
- Click on an inverse chip opens the SOURCE record via `openLinkText` with the source record's own path as resolution context (unambiguous same-name handling; forward renderer passes `row.file.path` — the inverse must pass the source's path, F1.5/F8.1 nuance).
- Stale-while-refresh is acceptable and expected: the inverse recomputes per refresh on the in-memory cache (F6.6); the display never enqueues writes (NFR-P02).
- No hover-preview regressions: reuse `markNoteHoverLink` (RelationValueRenderer.ts:23) so mobile long-press/desktop hover behaves exactly like forward relation chips.
- Circular self-links render as ordinary chips (reverse index, F6.4); a record linking to itself shows itself once in its own inbound list (dedupe, F6.4) — same as Notion's self-relation single property (F5.3).

## Ruled out this iteration
- A popover/menu-based inverse (Anytype-style count chip → menu): viable but adds a new interactive component; the record-page section achieves the same information with the existing chip grammar and a smaller diff (R1 > Anytype-clone).
- Header-level placement (Anytype featured): the fork's record panel has no featured-relations header row; retrofitting one would exceed the diff budget (SC-005).

## Next focus
Iteration 9: Algorithm correctness review — worst-case complexity, cache/invalidation contract, ordering/determinism, and the verification matrix (unit/integration/write-path proofs) mapped to spec scenarios SC-001..005.

---

# Iteration 009 — Algorithm correctness review + verification matrix

Status: complete | Focus: worst-case complexity, determinism, cache-invalidation contract, and an objective proof plan mapped to SC-001..005 — grounded in the fork's REAL test infrastructure (spec open question now answered).

## Findings

### F9.1 — Complexity: one pass over the fan-in edge set, same class as the existing rollup pass
For target DB T, the inverse iterates each source (db, column) whose `targetDatabaseId === T.id` and, per source record, its parsed links: O(Σₛ |edgesₛ|) where s ranges over source columns — identical cost shape to `buildRelationRollups` over one DB (`RelationRollup.ts:58-88`). All record access goes through `getRecordsForDatabase` → in-memory cache (`DataSource.ts:229-232`): no vault I/O, no second walk (NFR-P01). Memory: one `Map<path, edge[]>` per target DB — proportional to inbound edges, freed with the view.

### F9.2 — Determinism: database iteration order + records order make the result stable
The fan-in index iterates `context.databases` (array order — same source of truth as `databaseById`, `RelationRollup.ts:27`) and records come from the stable cached list (`getRecordsForDatabase`). The edge order per target path is therefore deterministic for a given vault state — sufficient for stable rendering. Recommendation: sort chips by `getRelationDisplayLabel` (alias || basename, `RelationLinks.ts:29-31`) before display so renames don't reorder the UI; keep the data-layer order as-is (mirrors the forward scan's behavior, which makes no sort promise either).

### F9.3 — Correctness invariant (the property tests must check)
`inboundByPath[P] = { (db, col, rec) | col.type === "relation" ∧ col.relationConfig.targetDatabaseId === T.id ∧ rec ∈ db ∧ parseRelationValues(rec.frontmatter[col.key]) ∋ link ∧ getFirstLinkpathDest(link.target, rec.file.path) = P }`.
Round-trip property: for every forward edge the rollup scan collects (`RelationRollup.ts:69-77`), the inverse must contain the mirrored edge at the target's inbound list. Note the forward scan only runs when the source DB has rollup columns (`:36`) — the round-trip fixture therefore uses a DB with a rollup column; the inverse's own unit tests exercise the fan-in standalone (F6.5).

### F9.4 — Cache/invalidation contract (display-only, per-refresh)
Compute `inboundByPath` for T once per refresh (the `targetPaths` refresh-scoping pattern, F1.4) and share across T's record pages. Invalidate when: (a) any path in `sourcePaths` changes (data events flow as `DataChangeBatch`, `DataSource.ts:31-40`); (b) a relation column's `targetDatabaseId` changes — reuse the `planRelationTargetChange` shape (`RelationTargetChange.ts:23-49`) to know which DB pairs are affected (F6.7); (c) a database config changes (schema columns). No persistent cross-session cache: the inverse is a pure function of current state, recomputed cheaply (F9.1) — same policy as rollups (display-only derived, `types.ts:69`).

### F9.5 — The fork's test infrastructure: vitest configured, ZERO tests exist, no npm test script (spec open question answered)
`vitest.config.ts` includes `src/**/*.test.ts` with `environment: "node"` and `setupFiles: ["src/__tests__/setup.ts"]` — but `src/__tests__/` does not exist and there are no `*.test.ts` files under `src/` (verified: only node_modules matches). `package.json` scripts are `dev/build/lint/lint:all` — no `test` script; `lint` explicitly ignores `src/__tests__/**`. Implementation implication (recorded for the follow-up phase): create `src/__tests__/setup.ts`, add `"test": "vitest run"`, and place `RelationInverse.test.ts` beside the module (`src/data/RelationInverse.test.ts`) per the vitest include glob. This resolves plan.md's "path UNKNOWN until the fork test tree is read".

### F9.6 — Verification matrix (objective checks → SC-001..005)
| Check | Proof | Pass condition |
|---|---|---|
| SC-001 single-path write | Unit: spy on `enqueueWrite`/`writeQueues` (`DataSource.ts:89`) while setting `Expenses.Month → Report` | exactly one queued path (the Expense); Report mtime unchanged |
| SC-002 inbound matches forward | Unit: fixture with forward wikilinks → `buildRelationInverse` | Report inbound == Expenses; empty + dangling fixtures → `[]` |
| SC-003 rollup over inverse | Integration: `aggregateRollup` (reuse, `RelationRollup.ts:92-129`) over `inboundByPath` entries | count=2 for two Expenses; list returns both; no stored back-property |
| SC-004 syncWrites OFF | Unit: `SYNC_WRITES_DEFAULT === false`; module import graph contains zero write calls (pure functions only) | constant false + no `vault.*write*`/`processFrontMatter` references in `RelationInverse.ts` |
| SC-005 isolated diff | Diff gate: `git diff --stat` on the phase | exactly `src/data/RelationInverse.ts` + ≤3 hunks in `RelationRollup.ts`/`RelationLinks.ts` (+0 type files) |
| Regression | `npx vitest run` + `npm run lint:all` | all pass; no changes outside declared files |

Edge matrix (from F6.1-F6.7 + F5.7): empty → `[]`; dangling → omitted; cross-db miss → omitted; circular/self → single self-edge, no recursion; duplicate wikilinks → deduped (`RelationRollup.ts:69-75`); alias/subpath → parsed before resolve (`RelationLinks.ts:15-19`); multi-db fan-in → union over all source DBs (F1.4); large set → bounded render (F5.7).

### F9.7 — Fail-closed contract for the call sites
If an expected export is missing at build time (scan API mismatch, spec §8), the call site degrades to "no inverse rows" — the same `false`/empty path `renderRelationValue` already uses for empty values (`RelationValueRenderer.ts:15`). Never fall back to a second scanner, never write (NFR-R02). The inverse never throws into the view: wrap the builder call at the call site, render empty on error.

## Ruled out this iteration
- Persistent/cross-session inverse caching: adds invalidation surface for zero measured gain (recompute is O(edges) on in-memory records, F9.1); rollups set the display-only-recompute precedent (F9.4).

## Next focus
Iteration 10 (final): breadth + gap-closing — verify the two rollup call-site contexts (DatabaseView.ts:3389-3395, EmbeddedDatabaseRenderer.ts:3198-3212) for the inverse hook, the fork's relation WRITE path (single-path proof chain), and mobile/platform-API safety (REQ-008) of the touched surfaces.

---

# Iteration 010 — Breadth + gap-closing: call-site contexts, write-path proof chain, mobile safety

Status: complete | Focus: verify the two rollup call-site contexts (where the inverse hook lands), the forward write path (SC-001 single-path chain), and platform/mobile safety of every touched surface (REQ-008).

## Findings

### F10.1 — Rollup call-site contexts verified; the inverse hook reuses the exact same context assembly
- `DatabaseView.calculateRelationRollups` (`src/views/DatabaseView.ts:3388-3401`): gate `database.schema.columns.some(c => c.type === "rollup")` (`:3389`); gathers `databases` from `viewEntries` (`:3390-3392`); builds the `RelationRollupContext` with `getRecordsForDatabase: (target) => this.dataSource.getRecordsForDatabase(target)` (`:3393-3399`). The inverse needs the identical `databases` list + closure — the hook is a sibling call in this method (rollup-over-inverse, F7.4.2/R2), NOT a modification of the context shape.
- `EmbeddedDatabaseRenderer.buildRowsWithRelations` (`src/views/EmbeddedDatabaseRenderer.ts:3190-3219`): same gate (`:3198`), same context (`:3202-3208`), and — the key extra — the `cacheTargets` refresh machinery already stores `relationTargetPaths` (`:3211`), `relationTargetDatabases` (`:3218`), and `relationTargetDatabasePaths` (`:3219`). This is the fork's existing invalidation signal: the inverse cache for target DB T must be invalidated exactly when `relationTargetDatabasePaths`/`relationTargetPaths` change (F6.7/F9.4 now have concrete members to key on — no new refresh plumbing needed).

### F10.2 — Write-path proof chain for SC-001: all view-layer relation writes flow through the per-path queue
`DataSource.enqueueWrite(path, op)` serializes per file path (`DataSource.ts:99-120`) and every write caller wraps `processFrontMatter` inside it (`:293-296`, `:992-995`). The secondary surface `PropertyService.processFrontmatter` explicitly DELEGATES to the DataSource queued writer when wired: "Prefer DataSource so bulk property operations share queued writes and metadata-cache overlays" (`PropertyService.ts:181-188`); DatabaseView constructs PropertyService with that delegate (`DatabaseView.ts:498`, `:323`). Conclusion: a relation edit in any view enqueues exactly one path — the Expense — and the Report never joins the queue (inverse has no write path at all, F7.5). The SC-001/SC-004 proof can spy on `enqueueWrite` with zero production hooks.

### F10.3 — Mobile + platform safety (REQ-008) verified on every touched surface
The full import/API surface of the inverse modules is cross-platform Obsidian: `app.workspace.openLinkText` (RelationValueRenderer.ts:33 — supported on mobile), `app.metadataCache.getFirstLinkpathDest` (RelationRollup.ts:71 — mobile-supported), `setIcon` (RelationValueRenderer.ts:1), DOM element creation (`createDiv`/`createEl`). `RelationLinks.ts`, `types.ts`, `EuroFormat.ts` use no platform APIs at all (full-file reads, F7.1/F7.2). No `electron`, `node:`, `fs`, or desktop-only imports anywhere in the touched chain; no telemetry or secrets (NFR-S01); fork is MIT-licensed (`package.json` license field). The only mobile-specific design constraint is bounded rendering of large inbound lists (F5.7/F8.2) — display-only, no writes (NFR-P02).

### F10.4 — Record-page hook placement confirmed
`RecordDetailPanel.ts:320` calls `renderRelationValue(valueEl, app, row, value, true)` inside the field-value renderer; the inverse section is an ADDITIVE bottom-of-panel section (F8.2/R1) that consumes `inboundByPath.get(currentPath)` — it does not touch the field grid or the renderer's signature (SC-005: no fourth hunk).

### F10.5 — Coverage assessment: all five key questions answered; no material gaps remain
Coverage map: scan contract (it-1, it-7), reference models AppFlowy+Anytype (it-2..4), Notion model (it-5), edge+safety (it-6), integration shape (it-7), UI/UX (it-8), algorithm+verification (it-9), call-site/write-path/mobile verification (it-10). Open items are all implementation-time logistics, not research gaps: create `src/__tests__/setup.ts`, add `"test": "vitest run"` script (F9.5), confirm `mutateFrontmatter` wiring at DatabaseView.ts:498 during implementation, and validate the `RollupConfig.relationField` inverse-resolution rule against the live phase-001 dependency (spec risk section).

## Ruled out this iteration
- New refresh-scoping plumbing for the inverse: `relationTargetPaths`/`relationTargetDatabasePaths` already exist (`EmbeddedDatabaseRenderer.ts:3210-3219`) — the inverse reuses them (F10.1).

## Next focus
Synthesis: assemble the ranked, evidence-cited enrichment (research.md) from iterations 1-10, produce the convergence report, and finalize the lineage state.

---
