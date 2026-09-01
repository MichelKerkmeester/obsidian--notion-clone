# Iteration 001 — Fork capability baseline (Q1, Q2)

**Focus:** What `RelationRollup.ts`, `ComputedSync.ts`, `DataSource.ts`, `DatabaseView.ts` implement today; how rollups render.
**Status:** complete

## Findings (all citations are real file:line in `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src`)

### F1.1 Rollup kinds confirmed: exactly `count | sum | avg | list`
- `data/types.ts:44` — `aggregation: "count" | "sum" | "avg" | "list"` on rollup column config.
- `data/RelationRollup.ts:99,110,127-128` — count → `records.length`; list → dedup'd array; sum/avg share a numeric reduce (`sum / n` for avg).
- Chart aggregation is a separate, wider enum (`median|min|max|range|percent-*` etc., `types.ts:177-192`) — confirms the spec's warning not to treat footer/chart kinds as relation-rollup kinds.

### F1.2 Rollups compute per parent row — Notion-shaped model
- `data/RelationRollup.ts:24-86` (`buildRelationRollups`): for each source record, for each rollup column, resolves the relation column by `config.relationField`, follows wikilinks via `app.metadataCache.getFirstLinkpathDest` (:69), de-duplicates target paths (:66-75), aggregates over the *target database's* records using the *target database's* schema (`aggregateRollup(records, target.database, config.targetField, ...)` :79-86). This is Notion's per-row "rollup cell on the row that holds the relation" semantics — the Reports db_view gets live columns without any inverse-relation machinery.

### F1.3 Empty/degenerate behavior (spec Scenario 3 already satisfied)
- Unresolvable relation or missing target database → `emptyRollupValue` (:81-83): count→0, list→[], else null (:160).
- No numeric values under sum/avg → `null` (:128), i.e. an empty cell rather than a misleading 0.
- Non-numeric values are filtered to null before summation via `toChartNumber` (:124-126), with an in-source note that an earlier regex-based extractor wrongly pulled digits out of note names like `[[Task 42]]`.

### F1.4 Rollup-of-rollup blocked; computed targets supported
- `RelationRollup.ts:96` — if the target column is itself a rollup, returns empty value (no nested aggregation).
- `getTargetFieldValue` (:135-152) — supports file fields and evaluates **computed fields** of the target database as rollup inputs. This matters later: once Remaining/Saved computed fields ship in a later phase, Reports could roll up over them with zero new code.

### F1.5 Display-only is the DEFAULT sync mode
- `data/ComputedSync.ts:4` — `DEFAULT_COMPUTED_SYNC_MODE: ComputedSyncMode = "display-only"`.
- `ComputedSync.ts:41-44` — `normalizeComputedSyncMode` accepts only `"automatic" | "manual"` overrides; anything else falls back to display-only.
- **Implication for REQ-003:** omitting `computedSyncMode` in YAML is already iCloud-safe; explicitly setting it is documentation, plus insurance against future default changes.

### F1.6 Writes are per-path queued; rollups never enqueue the parent
- `data/DataSource.ts:89-117` — `writeQueues = Map<string, Promise<void>>` keyed per file path; queue chained per path, cleaned on settle (:116-117).
- Rollup values flow into views purely as derived data: `views/DatabaseView.ts:3393-3410` builds rollups on every row build; results enter rows via `rowPipeline.build(..., derived)` (:3412); read at render time at `DatabaseView.ts:10351-10362` (`derivedValues: rollupValues?.get(record.file.path)`).

### F1.7 Live refresh on child edits without touching Report files
- `views/DatabaseView.ts:3360-3362` — `relationTargetPaths` cached from each rollup build.
- `DatabaseView.ts:2119-2158` (`handleDataChangeBatch`) — a change event to any path in `relationTargetPaths` / `relationTargetDatabases` marks the view for refresh (`refreshCoordinator.mark` :2157). Editing an Expenses.cost updates the Reports view; nothing enqueues the Report path. SC-002's mechanism exists end-to-end today.

### F1.8 UI/UX: rollup cells are read-only rendered cells
- `views/CellRenderer.ts:115,301,426,460-465,656` — rollup columns get `db-rollup-cell` class, click shows a Notice ("rollupReadonly"), value comes from `row.computed[col.key]`. Footer summaries are a separate surface (`views/SummaryRenderer.ts`). So current UX = Notion-style read-only rollup cells; no click-through to source rows yet (Notion shows referenced rows on hover/open).

## Ruled out / failed this iteration
- None; all targeted reads succeeded. Did NOT find a mobile-specific rollup branch (single renderer path suggests parity, but not separately verified — flagged for edge-case pass).

## Novelty justification
All eight findings carry first-time file:line evidence for this lineage; several contradict plan assumptions (display-only being the *default*, computed-field roll-up inputs already supported).
