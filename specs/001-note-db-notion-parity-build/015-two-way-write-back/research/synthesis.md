# Synthesis: Stored two-way write-back
> One-line: ranked Notion-parity enrichment for this feature, synthesized by Grok 4.6 (xhigh-fast) from the phase's 10 research iterations. Evidence trail: research.md.

## Verdict

Do **not** build stored two-way write-back. Notion's public contract is a schema-level `dual_property` pair plus a **derived** inverse (one relation array written on the edited row), and both AppFlowy and Anytype ship the same single-write / derived-backlink model — so dual frontmatter mirrors would not be Notion parity; they would be a fork-only storage invention that dirties two markdown files per click through `DataSource.writeQueues`. Ship the two-way **read** in `008-derived-inverse-relations` (`RelationInverse.ts` over the existing `RelationRollup.ts` scan) and leave this packet Deferred. The single biggest risk is a later owner "closing the Notion gap" by turning on a `syncWrites` path that **does not exist in source**, justified by spec.md's unsupported claim that Notion "store[s] the link on both records and rewrite[s] both on every change."

## Ranked backlog

1. **Keep stored write-back unbuilt (this wave)** — Gap vs Notion: the visible two-way UX ("edits work both ways") is one write plus a live inverse, not two stored copies. Feasibility: **clear**. Fork files: **none** (spec Files to Change is empty). Effort: **S** (0 hours of plugin work). Depends on: nothing in this packet; do not start 015 instead of 008. Citation: [Notion property-object relation / `dual_property`](https://developers.notion.com/reference/property-object#relation).

2. **Ship 008's derived inverse as the two-way READ** — Gap vs Notion: a Report must list inbound Expenses without a second stored property. Feasibility: **clear**. Fork files: new `src/data/RelationInverse.ts`; call sites `src/data/RelationRollup.ts` and `src/data/RelationLinks.ts` only (008's EuroFormat shape). Effort: **M** (owned by 008, not 015). Depends on: 008 completing before any 015 reopen. Citation: `src/data/RelationRollup.ts:58-90` (the scan 008 inverts); Anytype treats `backlinks` as a featured read-only key, never a client write (`context/anytype-ts/src/ts/lib/util/object.ts:487-494`).

3. **Do not add or enable `syncWrites`** — Gap vs Notion: Notion's pairing is schema metadata (`synced_property_id` / `synced_property_name`), not a dormant write switch. Feasibility: **clear** (absence is verified). Fork files: **none now**; a future flag would first have to be invented on `RelationConfig` in `src/data/types.ts:34-37`. Effort: **S** to document; **L** to implement an ON path. Depends on: the recorded revisit trigger (a concrete named workflow 008 cannot serve). Citation: fork-wide grep, zero `syncWrites`/`sync_writes` matches.

4. **If the trigger fires: extend `RelationConfig` before any mirror write** — Gap vs Notion: `dual_property` names the counterpart property; the fork schema is only `{ targetDatabaseId: string }` and cannot express a reverse key, cardinality, or sync flag. Feasibility: **likely**. Fork files: `src/data/types.ts:34-37` (and the column field at `:67-68`). Effort: **M**. Depends on: item 1 staying deferred until a named workflow exists; must precede item 5. Citation: `src/data/types.ts:34-37`.

5. **If the trigger fires: isolated delta mirror, not a full-array rewrite** — Gap vs Notion: a stored counterpart array on the related note (Notion does not document this as the public write). Feasibility: **hard** (no cross-path transaction; AppFlowy's counterpart write is commented out). Fork files: new `src/data/RelationWriteBack.ts`; two commit call sites listed in Recommended build. Effort: **L**. Depends on: item 4 plus an operator-named workflow. Citation: `context/appflowy/frontend/rust-lib/flowy-database2/src/event_handler.rs:1204-1223` (related-database write disabled; only `update_cell_with_changeset` is live).

6. **Module invariants: Set-dedup, resolve-before-write, skip self-path** — Gap vs Notion: relation values are unique page-id arrays; the fork only dedups on **read** (`seenPaths`) and silently skips unresolved links. Feasibility: **clear** as pure guards inside item 5. Fork files: `src/data/RelationWriteBack.ts` using `src/data/RelationLinks.ts:9-26` and `src/data/RelationRollup.ts:69-77`. Effort: **S** (inside the L module). Depends on: item 5. Citation: AppFlowy insert-if-absent / remove-by-position (`context/appflowy/frontend/rust-lib/flowy-database2/src/services/field/type_options/relation_type_option/relation.rs:40-51`).

7. **Keep mobile relation edits display-only; never dual-write on iCloud** — Gap vs Notion: Notion's mobile clients edit two-way relations; this vault must not. Feasibility: **likely** (gate is new; the fork has mobile UI, not write gating). Fork files: the gate lives in `RelationWriteBack.ts` if item 5 is ever built; do not invent platform write logic in `src/settings.ts:446-451` (`.db-mobile-reorder-controls` is reorder UI only). Effort: **S**. Depends on: item 5; until then the default path already writes one file. Citation: AppFlowy `MobileGridRelationCellSkin` `onTap` → `FlowyText("Coming soon")` (`context/appflowy/frontend/appflowy_flutter/lib/plugins/database/widgets/cell/mobile_grid/mobile_grid_relation_cell.dart:9-53`); same placeholder on mobile row-detail (`.../mobile_row_detail/mobile_row_detail_relation_cell.dart:8-55`).

8. **Do not port Notion "1 page" vs "No limit" into write-back** — Gap vs Notion: cardinality is a first-class relation limit. Feasibility: **blocked** until item 4 adds a schema field; `RelationConfig` has no max-count. Fork files: `src/data/types.ts:34-37` first, then the planner. Effort: **M**. Depends on: a named 1:1 workflow **and** item 4. Citation: [Notion view-and-remove related pages](https://www.notion.com/help/relations-and-rollups#view-and-remove-related-pages).

9. **Do not design a cross-path commit/rollback** — Gap vs Notion: the public API writes one page's relation array; the fork would enqueue two independent files. Feasibility: **hard** (structurally blocked as atomicity). Fork files: `src/data/DataSource.ts:88-122` cannot become a two-path transaction. Effort: **L** for any compensation scanner; **do not schedule it**. Depends on: item 5, which should be refused rather than compensated. Citation: `src/data/DataSource.ts:88-122` (`writeQueues` is `Map<string, Promise<void>>` keyed by path).

## Recommended build (locked design)

**This wave: no plugin module and no call-site edits.** spec.md Files to Change is empty; plan.md effort is 0 fork hours. Rollups stay display-only (`src/data/types.ts:69-70`). Relation cells already write **one** note through `updateFrontmatter` → `mutateFrontmatter` → `enqueueWrite` (`src/data/DataSource.ts:288-325`). `src/views/RelationValueRenderer.ts:7-37` is navigation-only (`openLinkText`); do not attach writes there. `DataSource.ts:992` is `updateViewDefFile` (view-config YAML), not a relation write — do not treat it as a call site.

**Frozen future shape (only if the revisit trigger fires): EuroFormat isolated module.**

- **Module:** `src/data/RelationWriteBack.ts`, same contract as `src/data/EuroFormat.ts:9` ("Kept in one module so it stays a small, rebasable diff").
- **Exports (pure):** `planRelationMirror({ sourceFile, sourceKey, previousValue, nextValue, relationConfig, app })` → `{ mirrors: Array<{ file: TFile; key: string; nextLinks: string[] }> }` or empty (no-op). Optional `serializeCanonicalWikilink(path)` → `[[target]]` with no `|alias` and no `#subpath`.
- **Algorithm (AppFlowy delta, not array-set):**
  1. Hard-abort unless an explicit config gate is ON (the spec's `syncWrites` concept — net-new; default OFF). Hard-abort on mobile.
  2. Parse previous/next with `parseRelationValues` (`src/data/RelationLinks.ts:23-26`).
  3. Resolve each target with `metadataCache.getFirstLinkpathDest`; drop unresolved (same as `RelationRollup.ts:70-74`).
  4. Restrict to records in `relationConfig.targetDatabaseId`. Skip when resolved path equals the source path. Skip when source database id equals `targetDatabaseId` unless the operator has opted into a Notion-style two-property self-relation pair (default: skip).
  5. Diff membership → `inserted` / `removed` path sets. On the counterpart note, apply insert-if-absent / remove-by-position (`relation.rs:40-51`). Dedup with Set semantics on write; the read path's `seenPaths` is not enough.
  6. Serialize canonical `[[target]]` only. Aliases are display-only (`getRelationDisplayLabel` in `RelationLinks.ts:28-30`); a mirror cannot round-trip `|alias` or `#subpath` because `parseRelationLink` strips them (`RelationLinks.ts:15-19`).
  7. Caller issues **one additional** `dataSource.updateFrontmatter(targetFile, { [mirrorKey]: nextLinks })`. That is a second `writeQueues` key (`DataSource.ts:89, 99-122`). There is no cross-path rollback; `mutateFrontmatter` only rolls back in-memory overrides for the file that failed (`DataSource.ts:305-307`).

- **Call sites (exactly two rebase-safe edits; do not scatter):**
  1. `src/views/CellRenderer.ts` — after a relation commit in `saveValue` (`2458-2469`). Relation edits enter through `editRelationPopover` (`661-781`) → `commitEditedValue` (`2446-2456`). This covers the fallback path when no `saveCellValue` injector is present.
  2. `src/views/DatabaseView.ts` — `saveCellValueWithHistory` (`7876-7889`), which DatabaseView injects as CellRenderer's `saveCellValue` (`514`). This is the live table/board/gallery commit path.

Do not hook `EmbeddedDatabaseRenderer.ts:2864` (computed-field persist, not relations). Do not hook `RelationTargetChange.ts:23-49` unless the named workflow explicitly requires a backfill when `targetDatabaseId` changes.

## Edge cases & mobile/iCloud safety

**Must-handle if ever built (today they argue against building):**

- **Cycles / self-relations.** A stored mirror can write loops; the derived inverse cannot. Notion special-cases self-relations (one property both ways, or an opt-in two-property pair) and blocks rollup-of-rollup loops ([FAQ](https://www.notion.com/help/relations-and-rollups#faq); [self-relation](https://www.notion.com/help/relations-and-rollups#relate-a-database-to-itself)). Guard in the module: skip `sourcePath === targetPath` and skip same-database mirrors by default.
- **Alias / subpath loss.** `parseRelationLink` drops `|alias` and `#subpath` (`RelationLinks.ts:15-19`). Mirrors must write canonical targets; UI aliases stay display-only.
- **Duplicates.** `parseRelationValues` does not dedup; only `buildRelationRollups` does (`RelationRollup.ts:69-77`). Write-back must use Set/delta semantics or the counterpart note accumulates duplicate wikilinks.
- **Stale / renamed / deleted targets.** Unresolved `getFirstLinkpathDest` must no-op, matching today's rollup skip (`RelationRollup.ts:70-74`). Do not write a broken `[[...]]` into a second note.
- **Half-applied dual writes.** Two `enqueueWrite` slots fail independently. AppFlowy's answer is to have no second write (`event_handler.rs:1204-1223`). Anytype's `ObjectListSetDetails` atomicity is in Go middleware, not in this clone (`context/anytype-ts/src/ts/lib/api/command.ts:1339-1359`). The fork has per-path ownership credits (`DataSource.ts:107-111`) and no cross-path arbitrator. Concurrent edit of note B's mirror column vs a mirror write into B is undefined unless mirrors are add/remove deltas (last-writer-wins on the same id is still possible).
- **Rollup display-only invariant.** `types.ts:69-70` forbids writing rollups to frontmatter. A stored reverse relation is a new, separately gated write class — not a rollup.
- **No cardinality field.** The module cannot enforce Notion's "1 page" limit until `RelationConfig` grows.

**Why this change is safe on mobile + iCloud (this wave):** the change is **not made**. Default relation clicks already dirty one markdown file (`enqueueWrite(file.path)` in `mutateFrontmatter`, `DataSource.ts:293`). This packet adds no second queue key, so iCloud sees one file-change event, not two. Rollups remain display-only. AppFlowy ships mobile relation **editing** as "Coming soon" on both grid and row-detail skins; the fork has no `isMobile` write gate today, so the safe posture is to add **no** new write path on iPhone/iCloud at all. Extra writes increase exposure to iCloud placeholder redownload and `note 2.md` conflict copies ([Obsidian iCloud guidance](https://obsidian.md/help/sync-notes); community conflict tooling documents the same failure mode). Spec 015 is display-only by omission: it ships no writes.

## Open questions / operator decisions

1. **Is there a concrete named workflow whose two-way need the derived inverse cannot serve?** Recommended default: **no** — keep 015 Deferred (spec.md REVISIT TRIGGER). Do not reopen for abstract "Notion parity."
2. **Should spec.md §2 keep claiming Notion rewrites both records?** Recommended default: **no** — keep the deferral and the iCloud/`writeQueues` cost; drop the Notion dual-copy claim. Public evidence is one relation array per edited page plus `dual_property` schema pairing ([property-object](https://developers.notion.com/reference/property-object#relation); duplication converts 2-way to 1-way, [FAQ](https://www.notion.com/help/relations-and-rollups#faq)). Notion internal storage remains undocumented (inference boundary, not a build input).
3. **If reopened, same-key mirror on both notes vs an explicit reverse property id?** Recommended default: **explicit reverse property** (Notion `dual_property`), never the same frontmatter key on both files. Same-key mirrors collide with self-relations and with notes that sit in both databases.
4. **If reopened, what is the source of truth when one of two writes fails?** Recommended default: **refuse dual-write**. If the operator insists, the edited note is canonical; the counterpart is best-effort delta; there is no atomic rollback (`DataSource.ts:88-122`).
5. **Self-relation (Next/Previous) two-property pair?** Recommended default: **skip** same-database mirrors. Only add a Notion-style pair if a named self-relation workflow appears.
6. **Mobile / iCloud writes for a future ON path?** Recommended default: **display-only on mobile**; never dual-enqueue on iCloud-synced vaults. Three gates at the module boundary: platform, config (`syncWrites`-style, default OFF), resolution (target exists in the target database).
7. **Notion "1 page" cardinality?** Recommended default: **do not add** until a named 1:1 workflow exists. Schema cannot enforce it today (`types.ts:34-37`).
