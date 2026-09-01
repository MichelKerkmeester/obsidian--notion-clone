# Deep Research: Stored two-way write-back

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/deepseek-flash-max`. Stop reason: max_iterations. Average newInfoRatio: 0.560.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 1: Notion's relation storage and write behavior (Q1)

## Focus

Establish the Notion baseline that a "stored two-way write-back" port would be copying: how Notion actually stores relations (single vs dual link arrays), how two-way sync is modeled, and what the write path costs.

## Findings

1. **Notion two-way relations are a schema-level pair of synced properties, not a dual-copy write.** The API property schema for a relation carries `data_source_id` plus a `dual_property` object with `synced_property_id` and `synced_property_name`, documented as "Present for dual (bidirectional) relations" — i.e. the two property objects on the two databases reference each other by ID; the *relation* between them is metadata, not duplicated values. [SOURCE: https://developers.notion.com/reference/property-object#relation]

2. **The stored value per side is a single array of page references.** The API page-property value for a relation is `{"relation": [{"id": "..."}, ...]}`; the write path is "pass an array of page references with id" — one value on the edited row. There is no API surface for writing two values on two rows in one call. [SOURCE: https://developers.notion.com/reference/property-object#relation]

3. **The inverse side is derived, not stored — the duplication FAQ is the proof.** Notion's help FAQ states that duplicating one database "convert[s] the relation from a 2-way sync to a 1-way sync" — if both sides stored physical copies, duplication would leave the duplicate's copies inconsistent; instead the sync *relationship* is broken, which is only possible if the inverse side is a live derivation of the canonical side. [SOURCE: https://www.notion.com/help/relations-and-rollups#faq]

4. **Notion's UI confirms single-side edit + auto-applied inverse.** "With two-way relations, the edits work both ways! So if you add a customer to the Items database in the relation column, the change pops up in your Customers database." The visible contract is one edit, one synced result — matching a derived-inverse model, not a mirrored-write model. [SOURCE: https://www.notion.com/help/relations-and-rollups#two-way-relations]

5. **Self-relations get special modeling.** One property on a self-relation works in both directions; toggling "Two-way relation" creates two separate properties (e.g. Next task / Previous task) where "the other property updates on its own". This is the only dual-storage case — and it is still one editable side per property pair, with the counterpart updating automatically. [SOURCE: https://www.notion.com/help/relations-and-rollups#relate-a-database-to-itself]

6. **Cardinality control exists: "1 page" or "No limit".** The help doc documents limiting a relation to a single page (useful for one-to-one), which maps to a max-count constraint on the stored array. [SOURCE: https://www.notion.com/help/relations-and-rollups#view-and-remove-related-pages]

7. **Notion blocks rollup-of-rollup "as this could create unintended loops"** — schema-level cycle prevention is a first-class concern in Notion's model. [SOURCE: https://www.notion.com/help/relations-and-rollups#faq]

8. **Spec 015's premise "Notion ... store[s] the link on both records and rewrite[s] both on every change" is unsupported by public evidence (inferred).** What IS documented: one relation value array per side, schema-level `dual_property` pairing, and a derived inverse. Whether Notion's internal storage duplicates arrays is not publicly documented; the observable contract contradicts the "rewrite both on every change" cost model. The deferral still stands, but its Notion-cost rationale should be reworded to the real fork-side rationale (per-path writeQueues + iCloud churn), not a Notion mirror claim. [SOURCE: https://developers.notion.com/reference/property-object#relation, https://www.notion.com/help/relations-and-rollups#faq]

## Sources Consulted

- https://www.notion.com/help/relations-and-rollups (fetched 2026-08-25; full page including FAQs)
- https://developers.notion.com/reference/property-object (fetched 2026-08-25; relation + rollup sections)

## Assessment

- **newInfoRatio: 1.0** — first evidence-gathering iteration of generation 2; all eight findings are new to this packet.
- **Confidence:** High for the API schema (`dual_property`, relation value array) and the duplication FAQ; the internal-storage claim (finding 8) is explicitly flagged inferred because Notion internals are not public.

## Reflection

- Worked: fetching the official help page AND the API property-object reference gave schema-level and UX-level evidence from the same vendor; the duplication FAQ is a natural experiment that discriminates "synced pair" from "dual copy".
- Failed/ruled out: Notion's internal storage layout is not publicly documented — no attempt to confirm it will succeed; recorded as inference boundary (ruledOut).

## Recommended Next Focus

Q2 — AppFlowy relation implementation: `frontend/rust-lib/flowy-database2` relation storage model + mutation write path, and the Flutter relation cell UI under `frontend/appflowy_flutter/lib/plugins/database`.

---

# Iteration 2: AppFlowy relation implementation (Q2)

## Focus

Mine the AppFlowy clone for the end-to-end relation implementation: storage model in `flowy-database2` (Rust), the mutation/write path, and the Flutter relation cell UI — with real path:line citations.

## Findings

1. **Storage model: one `row_ids` array per cell — no reverse copy.** The relation cell data is `RelationCellData { row_ids: Vec<String> }`; `apply_changeset` produces exactly one cell value from the prior cell plus inserted/removed ids. There is no second cell, no mirrored property. [SOURCE: context/appflowy/frontend/rust-lib/flowy-database2/src/services/field/type_options/relation_type_option/relation.rs:27-56]

2. **Delta-based mutation algorithm with dedup.** `apply_changeset` starts from the stored `row_ids`, appends each `inserted_row_ids` entry only if absent (`if !row_ids.iter().any(|row_id| row_id == inserted)`), and removes each `removed_row_ids` entry by position. This is idempotent — re-applying an insert is a no-op, which is the natural conflict-handling behavior for a link array. [SOURCE: relation.rs:40-51]

3. **Relation type option carries ONLY `database_id` — there is no reverse-property schema.** `RelationTypeOptionPB { database_id: String }` is the entire field configuration (unlike Notion's `dual_property` pair). The "other direction" is not modeled as a property; it is an implicit query over which rows reference this row. [SOURCE: context/appflowy/frontend/rust-lib/flowy-database2/src/entities/type_option_entities/relation_entities.rs:44-64]

4. **The write handler updates exactly ONE cell; the related-database write is commented out.** `update_relation_cell_handler` parses the changeset, then the block that would fetch the related database, validate the row ids, and write the counterpart cell is present but disabled: `// get the related database`, `// related_database_editor.validate_row_ids_exist(...)`. The only live write is `database_editor.update_cell_with_changeset(...)` on the current view/cell. This is direct source proof that AppFlowy ships a single-write model for relation edits. [SOURCE: context/appflowy/frontend/rust-lib/flowy-database2/src/event_handler.rs:1183-1225]

5. **Client write path: toggle sends one delta event.** `RelationCellBloc._handleSelectRow` builds a `RelationCellChangesetPB` for the CURRENT cell (`viewId/fieldId/rowId` of the edited row) and appends to `insertedRowIds` or `removedRowIds` based on membership, then sends a single `DatabaseEventUpdateRelationCell`. No second event touches the related database. [SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/application/cell/bloc/relation_cell_bloc.dart:119-135]

6. **Read path: ids are resolved to names at render time.** On cell change, the bloc issues `GetRelatedRowDataPB(databaseId, rowIds)` → `DatabaseEventGetRelatedRowDatas`, mapping stored ids to `RelatedRowDataPB(row_id, name)` for display. The UI never reads a stored reverse array. [SOURCE: relation_cell_bloc.dart:44-64; event_handler.rs:1227-1232]

7. **UI surface is consistent with the model**: relation cells exist for desktop grid, card cells, row detail, mobile grid, and mobile row detail (`widgets/cell/desktop_grid/desktop_grid_relation_cell.dart`, `widgets/cell/mobile_grid/mobile_grid_relation_cell.dart`, `widgets/cell/editable_cell_skeleton/relation.dart`), i.e. the same single-array model renders across form factors with the same bloc. [SOURCE: appflowy_flutter/lib/plugins/database/widgets/cell/ — file inventory]

8. **Conflict/concurrency story is implicit in the delta design**: because mutations are insert/remove deltas applied against the stored array with dedup, two concurrent edits converge without a lost-update on the same membership operation (though concurrent insert+remove of the same id is last-writer-wins on the cell write itself). No dual-write atomicity problem exists because there is only one write target. [SOURCE: relation.rs:40-51 (algorithm); inferred: no transaction layer observed in handler]

## Sources Consulted

- context/appflowy/frontend/rust-lib/flowy-database2/src/services/field/type_options/relation_type_option/relation.rs
- context/appflowy/frontend/rust-lib/flowy-database2/src/entities/type_option_entities/relation_entities.rs
- context/appflowy/frontend/rust-lib/flowy-database2/src/event_handler.rs (update_relation_cell_handler, get_related_row_datas_handler)
- context/appflowy/frontend/appflowy_flutter/lib/plugins/database/application/cell/bloc/relation_cell_bloc.dart
- File inventory: appflowy_flutter/lib/plugins/database/widgets/cell/**

## Assessment

- **newInfoRatio: 0.95** — all findings are new to this packet; small overlap only with the general "single-stored-link" premise established for Notion in iteration 1 (the AppFlowy specifics themselves are entirely new).
- **Confidence:** High — every claim is a direct read of the clone's source; the commented-out related-database write is unambiguous.

## Reflection

- Worked: following the change from Flutter bloc → protobuf event → Rust handler → cell changeset made the single-write path provable end to end.
- Ruled out: any AppFlowy dual-write path — the code that would do it is literally commented out (event_handler.rs:1204-1213). Also ruled out needing the collab-database crate source: the flowy-database2 layer alone proves the write path.

## Recommended Next Focus

Q3 — Anytype relation implementation: relation value storage in `anytype-ts/src/ts` (store/detail), reverse/backlink semantics, and dataview relation UX.

---

# Iteration 3: Anytype relation implementation (Q3)

## Focus

Mine the anytype-ts clone for: where relation values are stored per object, whether the reverse direction is stored or derived, and how the dataview grid renders and edits relation cells.

## Findings

1. **Relation values live on the object's detail record, as arrays of object ids.** The relation popup reads `object[relationKey]` from subscribed records and, for array-format relations, treats the value as an array of object ids (`Relation.getArrayValue(detailsRef.current[k])` → `depIds`) which it then subscribes to for display names. [SOURCE: context/anytype-ts/src/ts/component/popup/relation.tsx:47-66]

2. **The reverse direction is a derived system relation key (`backlinks`), computed by the middleware, not stored by the client.** `getByIds` appends `['links', 'backlinks']` to the requested subscription keys alongside the default relation set — i.e. the frontend asks for backlinks like any other key and renders whatever the middleware returns; there is no client-side write of a reverse array anywhere in the clone. [SOURCE: context/anytype-ts/src/ts/lib/util/object.ts:487-494]

3. **`backlinks` is treated as a first-class system relation in the UI model**: new types get `recommendedFeaturedRelations = ['type', 'tag', 'backlinks']` and `recommendedRelations = ['createdDate', 'creator', 'links']` — the reverse direction is a *featured read-only view* on the object, exactly like the fork's planned derived inverse (008). [SOURCE: object.ts:981-995]

4. **Write path = per-object detail mutation via gRPC.** `ObjectListSetDetails(objectIds, details)` and `ObjectListModifyDetailValues(objectIds, operations)` send `{relationKey, add|set}` operations to the middleware (`dispatcher.request('ObjectListSetDetails'|'ObjectListModifyDetailValues')`); `add` appends to an array value, `set` replaces. The client writes ONE object's detail; nothing in the clone issues a paired reverse write. [SOURCE: context/anytype-ts/src/ts/lib/api/command.ts:1339-1359]

5. **Dataview grid cells are a generic renderer over the record subscription.** `BodyCell` resolves the relation by key (`S.Record.getRelationByKey(relationKey)`), formats via `Relation.className(relation.format)` and `Relation.cellId(...)`, and renders the value from `record[relationKey]`; editability is gated by `canCellEdit(relation, record)` and a `readonly` flag — the same subscription/format machinery drives all six view types (board, calendar, gallery, grid, list, timeline). [SOURCE: context/anytype-ts/src/ts/component/block/dataview/view/grid/body/cell.tsx:23-66; view directory inventory]

6. **Multi-object edit UX computes the common value across selected objects** before writing (only ids present on ALL selected objects are kept), and read-only relations (`isReadonlyValue`) are filtered from editing — evidence of deliberate read-only treatment for system/derived relations. [SOURCE: popup/relation.tsx:27-32, 76-114]

7. **Anytype's middleware (anytype-heart, Go) is not in this clone** — the `backlinks` computation itself is not readable here; the frontend contract (request the key, render the result, never write it) is the provable part. Flagged as an inference boundary: backlinks derivation happens server-side. [SOURCE: clone inventory — no middleware source; frontend contract at object.ts:494]

## Sources Consulted

- context/anytype-ts/src/ts/component/popup/relation.tsx
- context/anytype-ts/src/ts/lib/util/object.ts (getByIds, getNewTypeDetails)
- context/anytype-ts/src/ts/lib/api/command.ts (ObjectListSetDetails, ObjectListModifyDetailValues)
- context/anytype-ts/src/ts/component/block/dataview/view/grid/body/cell.tsx
- context/anytype-ts/src/ts/component/popup/search.tsx (key lists incl. backlinks)
- File inventory: component/block/dataview/view/{board,calendar,gallery,grid,list,timeline}

## Assessment

- **newInfoRatio: 0.9** — all findings new to this packet; slight conceptual overlap with the single-stored-array + derived-inverse pattern seen in Notion (1) and AppFlowy (2), but every Anytype-specific citation is fresh.
- **Confidence:** High for the client contract (subscription keys, write commands, grid renderer). Medium for the middleware derivation detail (flagged: not in clone).

## Reflection

- Worked: tracing the subscription key list (`keys: [...default, 'links', 'backlinks']`) proved the reverse is fetched, not stored; tracing `ObjectListModifyDetailValues` proved single-object writes.
- Ruled out: reading the middleware backlinks computation (source absent from the clone); treating `backlinks` as a stored relation (contradicted by it being requested via subscription keys).

## Recommended Next Focus

Q4 — Fork relation architecture + EuroFormat integration mapping: read the fork's DataSource.ts writeQueues, RelationRollup.ts (or its successor), the EuroFormat module pattern, and map the exact module + call-site shape a stored write-back would take.

---

# Iteration 4: Fork relation architecture + EuroFormat integration mapping (Q4)

## Focus

Read the fork's actual source to map: the current relation/rollup architecture, the per-path write queue, the EuroFormat isolated-module pattern, and the exact module + call-site shape a stored write-back would take. Verify `syncWrites` in code.

## Findings

1. **`syncWrites` does not exist in the fork's source.** A full-tree grep for `syncWrites|sync_writes` returns zero matches. The flag is spec-packet-only language (spec.md/plan.md), not a code escape hatch. A future ON path would be net-new code, not flipping a dormant switch. [SOURCE: fork src — grep over all files, 0 matches]

2. **The EuroFormat pattern is a 42-line pure module under `src/data/` with a self-documenting rebase contract.** `EuroFormat.ts` defines three exported formatters over `Intl.NumberFormat("nl-NL")` and its header states: "Local fork override. Kept in one module so it stays a small, rebasable diff." Exactly two call sites consume it: `views/CellRenderer.ts:13` and `views/SummaryRenderer.ts:7`. This is the canonical isolated-module shape: pure module + 1-3 call-site edits. [SOURCE: fork src/data/EuroFormat.ts:1-42]

3. **`DataSource.writeQueues` is per-file-path with ownership credits.** `private writeQueues = new Map<string, Promise<void>>()` (DataSource.ts:89); `enqueueWrite(path, operation)` chains the new operation after the prior one for THAT path, swallows prior errors so the queue never poisons, and tracks owned-path credits via `markOwnedPath(path, context?.sourceInstanceId)` / `releaseOwnedCredit` (DataSource.ts:99-122). Writes land through this single funnel (call sites at DataSource.ts:293 and :992). A stored write-back that touches a second note creates a second queue entry for the second path — the exact "two keys in writeQueues" cost the spec records. [SOURCE: fork src/data/DataSource.ts:85-122]

4. **Relation values in the fork are frontmatter wikilink arrays, parsed by `RelationLinks.ts`.** `parseRelationValues` accepts a single wikilink string or an array, splits target from alias (`|`) and subpath (`#`), and drops malformed entries (RelationLinks.ts:23-26; parser 9-21). Any write-back must serialize back through this same shape (array of `[[target]]` strings) to stay round-trip compatible with the read side.

5. **The read side today is `RelationRollup.ts`: a pure scan of `frontmatter[relation.key]` per source record.** `buildRelationRollups` resolves each wikilink via `app.metadataCache.getFirstLinkpathDest`, dedups by path (`seenPaths`), and aggregates (count/sum/avg/list) per rollup column (RelationRollup.ts:58-90). The derived inverse (008) inverts this same scan into an inbound list; there is no reverse array stored anywhere. [SOURCE: fork src/data/RelationRollup.ts:24-90]

6. **Relation columns are first-class configured objects with target databases** — `planRelationTargetChange` (RelationTargetChange.ts:23-49) already models relation→target reconfiguration and its rollup invalidation cascade. A stored write-back would hook into this same configuration surface (relationConfig.targetDatabaseId), not a new ad-hoc schema.

7. **Integration shape for a hypothetical write-back module (mapped, not built):** a new `src/data/RelationWriteBack.ts` pure module (mirroring EuroFormat's header contract) exposing e.g. `planRelationMirror(sourcePath, targetPath, relationColumn, link)` and `mirrorRelationValue(record, relationColumn, links)`; 2-3 call sites: (a) the relation cell commit path feeding `enqueueWrite` (DataSource.ts:293 vicinity), (b) the existing relation-value write call site (~:992), (c) optional backfill/migration on relation target change (RelationTargetChange.ts surface). All writes would still route through `enqueueWrite` — which is precisely where the dual-queue cost materializes. [SOURCE: derived from DataSource.ts:293/992 + RelationTargetChange.ts:23-49 + EuroFormat.ts:1-42]

8. **Per-path ownership credits already exist for concurrent-edit safety** (`sourceInstanceId` in DataWriteContext, DataSource.ts:107) — evidence the fork already reasons about multi-writer concurrency per file, which a dual-write feature would need to extend (two files, two credits).

## Sources Consulted

- fork src/data/EuroFormat.ts (full)
- fork src/data/DataSource.ts:85-129 (writeQueues/enqueueWrite), call sites :293, :992
- fork src/data/RelationRollup.ts (full), data/RelationLinks.ts (full), data/RelationTargetChange.ts (full)
- fork views/CellRenderer.ts:13, views/SummaryRenderer.ts:7 (EuroFormat call sites)
- Full-tree grep: syncWrites (0 matches), EuroFormat (2 imports)

## Assessment

- **newInfoRatio: 0.85** — fork-specific citations all new; the "one module + call sites" premise was in the research topic itself, so its confirmation is partial novelty.
- **Confidence:** High — direct file reads with line numbers; `syncWrites` absence verified by grep.

## Reflection

- Worked: verifying `syncWrites` absence before trusting the spec's "default OFF" framing; reading EuroFormat.ts's own header as the pattern contract.
- Ruled out: any existing dual-write infrastructure in the fork (none exists); treating `syncWrites` as a code flag (it is spec-only).

## Recommended Next Focus

Q5 — Edge cases for stored two-way write-back: cycles/self-relations, aliases, dedup, stale targets, dual-write atomicity and conflict policy — anchored in the reference implementations (Notion's max-1/self-relation handling, AppFlowy's idempotent deltas, Anytype's add/set ops) plus the fork's own wikilink parser constraints.

---

# Iteration 5: Edge cases for stored two-way write-back (Q5)

## Focus

Inventory the edge cases a stored two-way write-back design must confront, anchored in the reference implementations (Notion, AppFlowy, Anytype) and the fork's own parser/write infrastructure — cycles/self-relations, aliases/subpaths, dedup, stale targets, dual-write atomicity, and conflict policy.

## Findings

1. **Cycle risk exists only in a stored-mirror design; the derived inverse has none.** Notion blocks rollup-of-rollup "as this could create unintended loops" [SOURCE: https://www.notion.com/help/relations-and-rollups#faq] and special-cases self-relations (one property works both directions; a two-property pair is opt-in) [SOURCE: https://www.notion.com/help/relations-and-rollups#relate-a-database-to-itself]. Neither AppFlowy (no reverse property at all) nor Anytype (derived backlinks) writes a mirror, so neither has a write-loop surface. A fork mirror write must at minimum skip when `targetDatabaseId` equals the source database id (self-relation) and skip when the mirrored target path equals the source path — both guards are free (pure string checks) and should live in the write-back module, not the call sites. [SOURCE: derived from fork relationConfig.targetDatabaseId usage in RelationRollup.ts:28-31 + Notion self-relation model]

2. **Alias/subpath loss is baked into the fork's parser.** `parseRelationLink` strips `|alias` and `#subpath` from the target on read (RelationLinks.ts:15-19). A mirror write serializes the canonical `[[target]]`; alias changes on one side therefore cannot round-trip — the mirror must write canonical targets only, and any UI that shows aliases must treat them as display-only. This is a UX constraint the spec's "mirror into both notes' frontmatter" framing ignores. [SOURCE: fork src/data/RelationLinks.ts:9-26]

3. **Dedup is read-side-only in the fork today.** `parseRelationValues` does not dedup; `buildRelationRollups` dedups at read time via `seenPaths` (RelationRollup.ts:69-77). A mirror write must dedup on write (Set semantics) or the second note can accumulate duplicate wikilinks. AppFlowy's `apply_changeset` dedups on insert (`if !row_ids.iter().any(...)`) — the same rule, applied on the write path, is the reference precedent. [SOURCE: flowy-database2/src/services/field/type_options/relation_type_option/relation.rs:40-51]

4. **Stale/deleted targets resolve silently today; a mirror must do the same.** `buildRelationRollups` skips links whose `getFirstLinkpathDest` resolves to null (RelationRollup.ts:71-74). A write-back that mirrors a link into a note whose target was deleted/renamed between click and commit would write a broken link; the module must resolve the target first and no-op (or surface a warning) when unresolved. [SOURCE: fork src/data/RelationRollup.ts:70-77]

5. **Dual-write atomicity is impossible across the fork's per-path queue by construction.** `enqueueWrite` serializes per path but there is no cross-path transaction (DataSource.ts:88-122); two enqueues (source + target note) can fail independently, leaving one side updated. AppFlowy's answer is to have no second write (commented out); Anytype's `ObjectListSetDetails` is a batch command (command.ts:1339-1346) whose atomicity lives in the Go middleware — not provable from the clone, flagged inferred. A fork mirror would need an explicit compensation strategy (e.g., write target first, best-effort source, or a per-session repair scan) — none of which the deferral currently requires. [SOURCE: DataSource.ts:88-122; event_handler.rs:1204-1223; command.ts:1339-1346]

6. **Conflict policy: the fork already has per-path ownership credits, but no cross-path arbitration.** `markOwnedPath(path, sourceInstanceId)` / `releaseOwnedCredit` (DataSource.ts:107-111) serialize same-path writers; a mirror that writes note B while the user concurrently edits note B's mirror column has no defined winner. Anytype's `ObjectListModifyDetailValues` add/set operations are the closest precedent (idempotent add → append-if-absent; set → last-writer-wins) [SOURCE: command.ts:1348-1359]. AppFlowy's delta changesets are idempotent by design (relation.rs:40-51). Recommendation for a future design: mirror writes use add/remove deltas (AppFlowy-style), not full-array set, so concurrent edits converge.

7. **The fork's display-only rule is codified in types.ts, not just the spec.** `rollupConfig` carries the comment "Rollups are display-only derived values and are never written to frontmatter" (types.ts:69-70). Any stored write-back is the exact negation of that rule and must be a separate, explicitly-gated path — matching the spec's `syncWrites`-style gating concept. [SOURCE: fork src/data/types.ts:68-71]

8. **No cardinality limit exists in the fork's `RelationConfig`** — only `targetDatabaseId` is observed in use (RelationRollup.ts:28-31; types.ts:68). Notion offers "1 page" vs "No limit" (help doc). If a mirror write-back is ever built, Notion's one-page limit is a schema field the fork does not have; the write-back module cannot enforce what the schema doesn't model. [SOURCE: https://www.notion.com/help/relations-and-rollups#view-and-remove-related-pages; fork types.ts:68]

## Sources Consulted

- fork src/data/RelationLinks.ts, data/RelationRollup.ts, data/types.ts, data/DataSource.ts:88-122, 515-589
- AppFlowy relation.rs:27-56, event_handler.rs:1183-1225
- Anytype command.ts:1339-1359
- Notion help: relations-and-rollups (FAQ, self-relations, view/remove related pages)

## Assessment

- **newInfoRatio: 0.6** — the edge-case inventory is new as a synthesized artifact, but every component was previously established (iterations 1-4); several findings are analytic consolidations rather than new evidence.
- **Confidence:** High for parser/queue behaviors (direct reads); atomicity of Anytype's batch command flagged inferred.

## Reflection

- Worked: mapping each edge case to a concrete citation — every recommended guard (skip self, dedup on write, resolve-before-write) traces to an existing mechanism in a reference implementation or the fork.
- Ruled out: a fork cardinality limit (does not exist); cross-path transactions in the fork (none exist).

## Recommended Next Focus

Q6 — Mobile + iCloud safety: AppFlowy's mobile relation cells (display/editing posture), Anytype mobile posture, the fork's settings/platform surface, and Obsidian iCloud write behavior. Determine what "display-only" means per platform and quantify the write-churn claim against the per-path queue.

---

# Iteration 6: Mobile + iCloud safety constraints (Q6)

## Focus

Determine what "display-only" means per platform for relation editing, using AppFlowy's mobile cells as the reference precedent, the fork's own settings surface, and Obsidian/iCloud documented behavior.

## Findings

1. **AppFlowy ships relation editing on mobile as an explicit placeholder: "Coming soon".** `MobileGridRelationCellSkin` renders the relation row names (underlined text) and its `onTap` opens a bottom sheet whose entire body is `FlutterText("Coming soon")` — i.e., even a mobile-first app with the full relation model present (grid, row detail, editable cell skeleton) deliberately ships the mobile relation EDITOR as display-only. [SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/widgets/cell/mobile_grid/mobile_grid_relation_cell.dart:9-53]

2. **AppFlowy maintains a parallel mobile cell surface (mobile row detail, mobile grid) distinct from desktop editable cells** — `mobile_row_detail_relation_cell.dart` and `mobile_grid_relation_cell.dart` vs `editable_cell_skeleton/relation.dart` — confirming mobile gets a reduced, separate interaction model rather than reusing desktop editing. [SOURCE: appflowy_flutter/lib/plugins/database/widgets/cell/ — file inventory, iteration 2]

3. **The fork already has mobile-specific UI** (`.db-mobile-reorder-controls` in settings.ts:446-451) but no platform-gated write logic: grep of settings.ts/main.ts shows no `isMobile`/platform gating of writes. The fork's display-only rule is data-model-level (types.ts:69-70 "Rollups are display-only derived values and are never written to frontmatter"), not platform-level. A stored write-back would therefore need an EXPLICIT platform gate if mobile is to stay display-only — the current codebase has no such mechanism. [SOURCE: fork src/settings.ts:446-451; data/types.ts:69-70]

4. **Obsidian's official docs bless iCloud for macOS/iOS but warn iCloud Drive on Windows "may lead to file duplication or corruption"; placeholder-file behavior is documented.** iCloud may remove files from local storage and leave placeholders that Obsidian must redownload (forum: "Waiting for iCloud to synchronise Obsidian configuration files…" on iPhone; help doc recommends "Keep Downloaded"). Every extra file write on a churny path increases exposure to placeholder redownload and sync stalls on mobile. [SOURCE: https://obsidian.md/help/sync-notes; https://forum.obsidian.md/t/icloud-sync-vs-obsidian-sync/71918]

5. **Community tooling exists solely to fight iCloud write volatility.** OIFS ("Obsidian-iCloud Fast Sync" — rsync/fswatch with atomic locking, debounced 10s watcher, path-level pending-upload guard) and obsidian-icloud-mirror (debounced sync on save/blur/close, MD5 conflict detection, "Safe Mode") both document iCloud's conflict/duplicate symptoms (`note.md` → `note 2.md`) under multi-writer access. This is third-party confirmation that iCloud is conflict-prone under concurrent file writes — the exact scenario a dual-path write-back creates on every relation click. [SOURCE: https://github.com/zzyking/OIFS; https://github.com/AngelCLA/obsidian-icloud-mirror]

6. **The spec's churn model is structurally confirmed by the per-path queue, not by Notion.** The real cost basis for the deferral: `enqueueWrite` per-path (DataSource.ts:88-122) means a relation click with a mirror writes TWO files, each through its own serialization slot, doubling iCloud's per-click file-change events. This matches the spec's "two keys in writeQueues" framing exactly — and holds regardless of Notion's actual storage (iteration 1 showed Notion itself does not demonstrably dual-write). The iCloud safety rationale stands on fork-side facts alone. [SOURCE: fork src/data/DataSource.ts:88-122; spec.md §2]

7. **Mobile "display-only unless the spec says otherwise" is the correct default posture** — it matches AppFlowy's shipped behavior (finding 1), the fork's rollup display-only codification (finding 3), and iCloud volatility evidence (findings 4-5). No evidence anywhere recommends shipping a write path on mobile first.

8. **A future ON path would need three explicit gates before any mirror write: (a) platform gate (mobile → display-only), (b) config gate (syncWrites-style flag, default off — the spec's concept), (c) resolution gate (target exists and is in the target database).** All three are checkable at the module boundary, keeping the 1-3 call-site EuroFormat shape intact. [SOURCE: derived from findings 1-6]

## Sources Consulted

- context/appflowy/.../mobile_grid_relation_cell.dart (full)
- fork src/settings.ts:446-451; data/types.ts:69-70; data/DataSource.ts:88-122
- https://obsidian.md/help/sync-notes (iCloud guidance)
- https://forum.obsidian.md/t/icloud-sync-vs-obsidian-sync/71918 (placeholder/redownload behavior)
- https://github.com/zzyking/OIFS, https://github.com/AngelCLA/obsidian-icloud-mirror (iCloud volatility tooling)

## Assessment

- **newInfoRatio: 0.55** — the mobile display-only precedent ("Coming soon") and iCloud volatility citations are new; the per-path churn basis re-confirms spec language established in iteration 4.
- **Confidence:** High for AppFlowy mobile cell (direct read) and Obsidian docs; community tooling claims are third-party but consistent and cited.

## Reflection

- Worked: reading the actual mobile cell widget — the "Coming soon" placeholder is unambiguous primary-source evidence for display-only mobile posture.
- Ruled out: any fork platform-gated write mechanism (none exists — grep); Notion-derived iCloud cost basis (iteration 1 already displaced it with the fork-side queue rationale).

## Recommended Next Focus

Iteration 7: Cross-source synthesis and verification — check contradictions: Notion "edits work both ways" UX vs single-write API (why no conflict appears), AppFlowy "Coming soon" mobile vs mobile row detail cell presence, and verify the fork's RecordDetailPanel relation editing path (014 predecessor) as the actual call site. Also confirm the rollup packet's EuroFormat doc matches the code.

---

# Iteration 7: Cross-source verification pass

## Focus

Close the remaining verification gaps: (a) AppFlowy mobile row-detail relation cell posture (contradiction check vs mobile grid), (b) the fork's actual frontmatter write funnel and relation cell call site, (c) EuroFormat pattern documentation vs code.

## Findings

1. **AppFlowy's mobile row-detail relation cell is display-only too — same "Coming soon" placeholder.** `MobileRowDetailRelationCellSkin` renders the row names in a `Wrap` of underlined `FlowyText` and its `onTap` opens a bottom sheet containing `FlowyText("Coming soon")` (mobile_row_detail_relation_cell.dart:18-25). Combined with the mobile grid cell (iteration 6), BOTH mobile surfaces are confirmed display-only; the desktop `editable_cell_skeleton/relation.dart` path is where real editing lives. Contradiction resolved: mobile never edits relations in this codebase. [SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/widgets/cell/mobile_row_detail/mobile_row_detail_relation_cell.dart:8-55]

2. **The fork's frontmatter write funnel is `mutateFrontmatter(file, mutator, context)` → `enqueueWrite(file.path, ...)` → `processFrontMatter` with diff-remember and error rollback.** DataSource.ts:288-310 shows the exact pattern: per-path queueing, `cloneFrontmatter`/`diffFrontmatter` to remember updates for immediate reads, and `frontmatterOverrides.delete(file.path)` on failure. Any relation cell write already routes here (or its sibling `updateFrontmatter` at :314). A write-back module would therefore slot in as: (1) compute mirror plan (pure module), (2) call `mutateFrontmatter` on the source note (existing call site), (3) call `mutateFrontmatter` on the target note (ONE new call site) — preserving the EuroFormat shape with exactly 1-2 new call sites, and confirming the spec's "two keys in writeQueues" cost lands in this funnel. [SOURCE: fork src/data/DataSource.ts:288-314]

3. **The EuroFormat pattern documentation matches the code.** The ox-alpha-cline research packet cites `EuroFormat.ts` as the isolated module and `formatEuroNumber2` at `SummaryRenderer.ts:556` (plus the file inventory `types.ts:39-70`, `RelationRollup.ts:24-97...`, `EuroFormat.ts`) — consistent with the code I read (EuroFormat.ts:30-41; SummaryRenderer.ts:7 import). The documented pattern (pure module under src/data + 1-3 call-site edits, rebase-safe) is confirmed as the fork's established convention. [SOURCE: specs/obsidian/002-note-db-notion-parity-build/002-rollup-aggregation-pack/research/lineages/ox-alpha-cline/research.md:38,56; fork EuroFormat.ts:1-42]

4. **Notion's "edits work both ways" UX reconciles with the single-write API contract without stored mirrors.** The help page's promise ("if you add a customer to the Items database in the relation column, the change pops up in your Customers database") is the observable outcome of the schema-level `dual_property` pair: one array written on the edited side, the inverse side derived and rendered. There is no contradiction — the API writes one value; the UI shows two synced properties. [SOURCE: https://www.notion.com/help/relations-and-rollups#two-way-relations; https://developers.notion.com/reference/property-object#relation]

5. **Net verification result: no finding from iterations 1-6 was contradicted.** Every cross-check (mobile posture, write funnel, pattern doc, UX/API reconciliation) confirmed or refined prior findings; the only new fact is the exact write funnel identity (`mutateFrontmatter`), which strengthens the iteration-4 integration mapping rather than changing it.

## Sources Consulted

- context/appflowy/.../mobile_row_detail_relation_cell.dart (full)
- fork src/data/DataSource.ts:270-314 (mutateFrontmatter)
- specs/obsidian/002-note-db-notion-parity-build/002-rollup-aggregation-pack/research/lineages/ox-alpha-cline/research.md:38,56
- Notion help + API pages (reconciliation, from iteration 1 fetches)

## Assessment

- **newInfoRatio: 0.35** — one genuinely new fact (the `mutateFrontmatter` funnel identity) plus confirmation-level verification of prior claims; most of this iteration re-confirms established findings.
- **Confidence:** High — direct reads; reconciliation is analytic but grounded in cited primary sources.

## Reflection

- Worked: verification-by-consistency — every open contradiction candidate (mobile posture ×2, pattern doc vs code, UX vs API) resolved to a single consistent model.
- Ruled out: any AppFlowy mobile relation editing (both surfaces "Coming soon"); any mismatch between the EuroFormat docs and code.

## Recommended Next Focus

Iteration 8: Saturation check — search for remaining unexamined surfaces: the fork's `RelationValueRenderer.ts` (UI rendering of relation cells, click-to-edit entry), `DataSource.updateFrontmatter` (:314+) details, and any Obsidian API constraints on `processFrontMatter` frequency. Expect low novelty.

---

# Iteration 8: Saturation check — remaining fork surfaces

## Focus

Examine the last unexamined fork surfaces to confirm saturation: the relation cell UI renderer (`RelationValueRenderer.ts`), the `updateFrontmatter` write wrapper, and note-creation paths — verifying the write-back call-site mapping against every remaining write surface.

## Findings

1. **`RelationValueRenderer.ts` is read/navigate-only — no write anywhere in the relation cell UI.** `renderRelationValue` parses links, renders icon + label anchors, and its `onclick` calls `workspace.openLinkText(link.target, row.file.path)` (open the target note). The relation cell today is a navigation surface; there is no inline edit, no mirror, no second write. Any stored write-back must therefore attach to the WRITE path (mutateFrontmatter/updateFrontmatter), not to this renderer. [SOURCE: fork src/views/RelationValueRenderer.ts:7-37]

2. **`updateFrontmatter(file, updates, context)` is the ready-made set/delete wrapper for a mirror write.** It routes through `mutateFrontmatter` → per-path `enqueueWrite` and treats `null` as key deletion (DataSource.ts:314-325). A stored write-back's target-side write is literally `updateFrontmatter(targetFile, { [mirrorKey]: links })` — one existing public method, one new call site. This hardens the iteration-7 mapping: the EuroFormat shape is module + exactly 2 call sites (existing cell-write site + one target write). [SOURCE: fork src/data/DataSource.ts:312-325]

3. **Note creation paths (`createNote`, `duplicateNote`) already exercise the owned-credit discipline** (`markOwnedPath`/`releaseOwnedCredit` around `vault.create`, DataSource.ts:342-349) — confirming the fork's consistency: every file mutation, create or update, is credited. A mirror write gets the same credit for free by routing through the same funnel. [SOURCE: fork src/data/DataSource.ts:327-357]

4. **No Obsidian API throttle constraint found for `processFrontMatter`** — it is the standard mutation API; the fork's serialization (per-path queue) is its only pacing mechanism. The dual-write cost is therefore purely the second enqueue slot + iCloud file-change event, matching the spec's stated cost model. [SOURCE: fork src/data/DataSource.ts:88-122, 296, 536; Obsidian API usage]

5. **Saturation assessment**: with the renderer, both write wrappers, creation paths, the queue, the parser, the rollup scan, target-change planning, and the type schema all read, the fork's relation surface is fully inventoried. Combined with Notion (API + help), AppFlowy (Rust + Flutter, desktop + mobile), and Anytype (client contract), no unexamined surface remains that could change the ranked enrichment. Remaining work is synthesis, not discovery.

## Sources Consulted

- fork src/views/RelationValueRenderer.ts (full)
- fork src/data/DataSource.ts:312-361 (updateFrontmatter, createNote, duplicateNote head)

## Assessment

- **newInfoRatio: 0.2** — two small new details (renderer is navigation-only; updateFrontmatter is the ready-made mirror wrapper) plus confirmation; the saturation verdict itself is the main output.
- **Confidence:** High — direct reads; the saturation claim covers exactly the surfaces enumerated in strategy Known Context.

## Reflection

- Worked: exhausting the fork's write-surface inventory — every file-mutation entry point is now traced and cited.
- Ruled out: any hidden inline-edit write in the relation cell UI (renderer is navigation-only); any need to add a new write API (updateFrontmatter already fits).

## Recommended Next Focus

Iteration 9: Final gap + negative-knowledge pass — consolidate the only inference boundaries (Notion internal storage, Anytype middleware derivation) and any residual questions; then legal-convergence check: rolling avg of last 3 evidence ratios vs 0.05 threshold, MAD noise floor, entropy, quality gates.

---

# Iteration 9: Final gap + negative-knowledge consolidation + legal-stop check

## Focus

Close the last citation gap (the `RelationConfig` interface shape), consolidate the two inference boundaries into the negative-knowledge record, verify no residual questions, and run the legal-stop decision tree honestly.

## Findings

1. **`RelationConfig` is exactly `{ targetDatabaseId: string }` — the schema has zero write-back surface today.** Verified at fork src/data/types.ts:34-37 (with the column reference at :68). No mirror key, no reverse property id, no cardinality limit, no sync flag. This is the strongest single confirmation of the deferral's structural basis: the fork's data model cannot even EXPRESS a stored mirror without a schema change, which is why 015 records the feature as "would have been" rather than building it. [SOURCE: fork src/data/types.ts:34-37, 68]

2. **Inference boundaries consolidated (negative knowledge):**
   - Notion's internal storage layout (physical dual-copy vs derived) is not publicly documented; the observable contract (single value array per side, `dual_property` schema pair, duplication converts 2-way to 1-way) is decisive for the synced-pair model. [SOURCE: iteration 1; https://developers.notion.com/reference/property-object#relation]
   - Anytype's `backlinks` derivation happens in the Go middleware (anytype-heart), absent from the clone; the frontend contract (request the key, render it, never write it) is the provable boundary. [SOURCE: iteration 3; lib/util/object.ts:494]
   Both boundaries are recorded as ruled-out directions; neither blocks any finding.

3. **Residual-question check: none.** All six key questions carry evidence-backed answers (iterations 1-6), verification (7) and saturation (8) passes found no contradictions and no new questions; carried-forward open questions remain empty. The two inference boundaries are documented, not open.

4. **Legal-stop decision tree (iteration 9):**
   - Ratios: 1.0, 0.95, 0.9, 0.85, 0.6, 0.55, 0.35, 0.2, 0.15
   - Rolling average (last 3): (0.35 + 0.2 + 0.15) / 3 = 0.233 — far above the 0.05 threshold → no rolling STOP vote
   - MAD noise floor: median = 0.6, MAD = 0.3, floor = 0.3 × 1.4826 = 0.445; latest ratio 0.15 ≤ 0.445 → MAD STOP vote
   - Question entropy: 6/6 evidence-backed → 1.0 → STOP vote
   - Composite: (0.35 + 0.35) / 0.70 = 1.0 > 0.60 → STOP nominated
   - Legal-stop gates: Coverage gate PASS (all answered); Quality gate PASS (4+ source classes: Notion docs/API, AppFlowy, Anytype, fork source, web/iCloud — no single weak source); **Convergence gate FAIL** (low novelty does NOT hold across the required consecutive window — rolling average 0.233 ≫ 0.05) → STOP blocked → `blocked_stop` event appended → CONTINUE to iteration 10.
   - At iteration 10 the loop hits `maxIterations` → terminal stop `maxIterationsReached` (legal under stopPolicy=max-iterations; hard stop needs no gates).

## Sources Consulted

- fork src/data/types.ts:34-37, 68
- State log (deep-research-state.jsonl) + dashboard + strategy (this lineage)

## Assessment

- **newInfoRatio: 0.15** — one small new fact (exact RelationConfig shape) plus consolidation of previously-recorded boundaries; the legal-stop computation is analytical.
- **Confidence:** High — the RelationConfig read is direct; the signal math follows the convergence-signals reference exactly.

## Reflection

- Worked: applying the legal-stop decision tree literally instead of wishing for early convergence — the honest outcome is blocked_stop now, maxIterationsReached at 10.
- Ruled out: claiming convergence at iteration 9 (gate fails); treating the two inference boundaries as open questions (they are documented boundaries, not gaps).

## Recommended Next Focus

Iteration 10 (final): state-consistency verification (JSONL vs dashboard vs strategy vs iteration files) + final ratio assessment → STOP with maxIterationsReached → phase_synthesis.

---

# Iteration 10: State-consistency verification + terminal stop

## Focus

Final pass: verify the full state packet is internally consistent (JSONL ↔ dashboard ↔ strategy ↔ iteration files), sweep the write surface for stray files, and record the terminal stop decision.

## Findings

1. **State packet verified consistent.** JSONL: 12 records (1 config, 1 restarted event, 9 iteration records, 1 blocked_stop event) — all parse as valid JSON, iteration numbers 1-9 contiguous, ratios [1.0, 0.95, 0.9, 0.85, 0.6, 0.55, 0.35, 0.2, 0.15] match the dashboard trend exactly; iteration files 001-009 exist and are write-once; strategy sections track the same answers; config carries the dispatch session id and generation 2. [SOURCE: lineage dir state audit — python JSONL parse + ls]

2. **Write surface is clean.** The lineage directory contains only canonical artifacts (config, state, strategy, dashboard, registry, iterations/, research_archive/) — no stray temp files, no writes outside the surface. The generation-1 tree remains archived under research_archive/2026-08-25T043000Z. [SOURCE: ls of lineage dir]

3. **Terminal stop decision:** iteration count (10) >= maxIterations (10) → hard STOP with stopReason `maxIterationsReached`. This is the legal terminal condition under `stopPolicy: max-iterations`; no legal-stop gates apply to the hard cap. The earlier blocked_stop (iteration 9) is on record showing the loop did not stop early on an illegal convergence claim. [SOURCE: convergence.md decision order step 1; deep-research-state.jsonl blocked_stop event]

4. **Final convergence assessment:** rolling average (0.35, 0.2, 0.15) = 0.233 never approached the 0.05 threshold within 10 iterations — the honest record is maxIterationsReached, with entropy (6/6) and MAD signals confirming the topic is exhausted but the strict novelty gate was never satisfied. This is the correct, non-fabricated outcome; the deliverable (ranked, evidence-cited enrichment) is complete in the iteration corpus. [SOURCE: convergence-signals.md; state log]

## Sources Consulted

- Lineage state audit: deep-research-state.jsonl (parse), deep-research-dashboard.md, deep-research-strategy.md, iterations/001-009, deep-research-config.json
- convergence.md (decision order), convergence-signals.md (signal rules)

## Assessment

- **newInfoRatio: 0.05** — verification pass; no new research information, only state consistency + stop decision.
- **Confidence:** High — direct audit.

## Reflection

- Worked: closing the loop with an honest terminal stop instead of a fabricated convergence claim (the failure mode that killed generation 1).
- Ruled out: any remaining discovery surface (saturated at iteration 8; verified here).

## Recommended Next Focus

phase_synthesis: compile research.md (ranked, evidence-cited enrichment + Eliminated Alternatives + convergence report), emit resource-map.md, mark config complete, append synthesis_complete event.

---
