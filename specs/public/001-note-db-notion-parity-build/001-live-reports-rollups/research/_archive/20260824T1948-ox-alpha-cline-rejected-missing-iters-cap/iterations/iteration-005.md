# Iteration 005 — Edge cases, mobile + iCloud safety, core-logic gaps (Q3, Q7)

**Focus:** What `computedSyncMode` actually gates; mobile rendering of rollup cells; currency-mixing and refresh edge cases.
**Status:** complete

## Findings (citations in `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src` unless noted)

### F5.1 `computedSyncMode` gates formula write-back only — rollups are always derived
- `views/DatabaseView.ts:10390-10392` — `isAutomaticComputedSync()` returns true only for `"automatic"`; the automatic path schedules frontmatter writes via `ComputedSyncQueue`. `ComputedSync.ts:1-45` exists purely to coalesce *computed-field* sync work.
- Nothing in `RelationRollup.ts` ever calls a writer; its output enters views as `derivedValues` (`DatabaseView.ts:10351-10362`). Therefore Report note files cannot be rewritten by rollups under ANY sync mode.
- **Refined REQ-003 guidance:** set `computedSyncMode=display-only` as documentation + insurance (it also blocks accidental future formula write-back), but the iCloud risk in this phase's exact shape (rollups only) is structurally zero. The real hazard arrives in the successor phase when Remaining/Saved *formulas* land — there, automatic mode would rewrite notes.
- Cleanup path even self-heals: `DatabaseView.ts:5597-5604` downgrades `automatic`→`display-only` during computed-frontmatter cleanup and cancels queued syncs.

### F5.2 Rollup-dependent formulas escalate sync scope (successor-phase tripwire)
- `views/DatabaseView.ts` `getIncrementalComputedSyncPlan` (~line 5648): if any computed field references backlinks or depends on rollups (`hasRollupComputedDependency`), sync scope escalates from per-row to whole-database because "another note changed, without the source row path appearing in changedPaths."
- **Future-proofing:** when Saved eventually becomes Income − Expenses via formula over rollup columns, expect database-wide recompute churn; design that phase with display-only default intact.

### F5.3 Mobile: single renderer path, read-only cells, no rollup-specific desktop-only APIs
- `views/CellRenderer.ts:1484-1508` — `Platform.isMobile` branches exist for popover hosting, not for value computation; rollup cells render through the same `db-rollup-cell` path (:426). No `RelationRollup.ts` dependency on desktop-only Electron APIs (imports are obsidian `App`, metadataCache, vault-level only).
- Mobile Obsidian remains fully supported by this feature by construction (spec NFR-S03 confirmed).

### F5.4 Currency mixing is silent — one-currency-per-property discipline required
- `RelationRollup.ts:124-128` sums raw numerics from `toChartNumber` with no currency dimension; `data/types.ts:50` has a distinct `currency` column type but aggregation ignores it. If Expenses.cost mixes EUR and another currency, the SUM is arithmetically correct and semantically wrong with no warning.
- **Edge-case rule for ops handoff:** bind each rollup to amount properties guaranteed single-currency; record the assumption next to the UNKNOWN key confirmation.

### F5.5 Fast-path patch deliberately skips rollup databases (correctness over speed)
- `views/DatabaseView.ts` `tryPatchExternalTableRows`: returns false early `if config.schema.columns.some(col => col.type === "rollup")` — views with rollups always take the full rebuild so derived totals stay authoritative. Confirms live-update correctness priority; minor perf cost accepted by design.

## Ruled out / failed this iteration
- Searched for a mobile-specific rollup compute branch to cite parity differences — none exists (single code path); recorded F5.3 instead. Did not find any cache-invalidation gap between `relationTargetPaths` updates and row rebuilds within the batch handler.

## Novelty justification
First lineage evidence on what computedSyncMode truly gates (structural zero write-risk for this phase), the rollup-formula sync escalation tripwire, mobile single-path rendering, and the currency-mixing silence.
