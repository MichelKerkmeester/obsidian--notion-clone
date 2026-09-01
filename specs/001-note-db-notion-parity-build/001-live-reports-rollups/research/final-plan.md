# Final Plan: Live Reports Roll-ups
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

The rewritten packet is correctly **config-only**. Synthesis verdict (Wave 0, effort S, value 5) matches the live fork: rollup kinds are exactly `count | sum | avg | list` at `types.ts:44`; compute is forward-only from `sourceRecord.frontmatter[relation.key]` at `RelationRollup.ts:70-78`; unknown kinds fall through to **sum** at `RelationRollup.ts:126-128`; empty SUM is `null` not `0` at `RelationRollup.ts:126,159-160`. REQ-004 (no `src/` edits) is the right freeze. Display-only as the iCloud contract is right: rollups never write (`types.ts:69-70`; `RelationRollup.ts` has no vault writes), and `DataSource.writeQueues` is per-path (`DataSource.ts:88-120`) with only two enqueue sites (`mutateFrontmatter` at `DataSource.ts:288-293`, `updateViewDefFile` at `DataSource.ts:989-992`).

What is solid: ranked backlog 1→6 in `tasks.md` matches `research/synthesis.md`; both-sides relation wiring is first; `list` diagnostic exists because there is **no Notice** on unresolved targets (`RelationRollup.ts:64-66`); Saved stays static; footer `SummaryRenderer.ts:19-22` is correctly banned as the monthly figure (`GroupDisplay.ts:28-61` has no per-group aggregation); EuroFormat is already on the number path (`ColumnDisplay.ts:18-23` → `CellRenderer.ts:13,201-203,2575-2576`).

Gaps and wrong sequencing:

1. **T005 bundles COUNT+SUM behind ops keys.** COUNT short-circuits at `RelationRollup.ts:99` before any field lookup. COUNT and a `list` on `file.name` can prove resolution **before** amount keys exist. SUM is the only step that must halt on UNKNOWN keys (`research/synthesis.md` open question 1; `research/research.md` iteration 10 finding 3).

2. **Temporary `list` target is unspecified.** `list` dedupes via `stringifyValue` (`RelationRollup.ts:110-119`). If the list reuses the SUM amount field, two children with the same amount collapse to one entry — a false inventory. The modal already special-cases `file.name` for count/list (`RelationRollupConfigModal.ts:134-147,246`). Diagnostic list **must** target `file.name` (or another unique identity field), not cost/gross/net.

3. **Wikilink syntax is under-weighted.** `parseRelationLink` accepts only a full-string `[[...]]` (`RelationLinks.ts:9-25`). Bare titles, paths, or Markdown links are dropped with the same empty UI as “no children.” Setup must inventory actual frontmatter shapes, not just “is the Month field filled.”

4. **Effort S / 2.5h is only true if Reports-side links already exist.** Synthesis item 1 is honest (“hard only if the operator refuses to maintain Reports-side links”), but `plan.md` still budgets 90 minutes for “both relation sides.” If each Report note’s Expenses (R) / Sales (R) / Income (R) is empty, the work is per-child wikilink transcription onto the **Report** row — the only side `buildRelationRollups` reads. Child Month links do not fill figures. That is not an S YAML tweak; it is a data-entry job whose size is UNKNOWN until T001 counts rows.

5. **Bidirectional drift is named, then dropped.** Until later inverse-relations work, every new child must be added on **both** the child Month field and the matching Report relation. The current plan treats pairing as a one-shot Setup task. Without a runbook rule, live SUMs silently rot after go-live.

6. **T013 is a false task.** It asks this phase to remember `RollupAggPack.ts`. Successor `002-rollup-aggregation-pack` locked **`src/data/Aggregate.ts`**. T013 should not be an executable checkbox here.

7. **Citation error on display-only write-back.** Docs cite `ComputedSync.ts:42-44` as `syncComputedForFile` early-return. Those lines are `normalizeComputedSyncMode` only. Real early-returns: `DatabaseView.ts:10244` and `EmbeddedDatabaseRenderer.ts:2834` (`!this.isAutomaticComputedSync()`). Default is still display-only (`ComputedSync.ts:3`; load-time coerce at `DataSource.ts:787`). Pin YAML anyway so the view-config UI cannot be left on `automatic`.

8. **Euro-sign vs grouping.** Synthesis open question 7 is correct: rollup display type is hardcoded `"number"` (`ColumnDisplay.ts:18-23`), so `formatEuroCurrency` (`CellRenderer.ts:196-198`) never runs. Accept nl-NL grouping. Do not patch `ColumnDisplay.ts` this phase. Iteration 10’s E1 (force display type in view config) is already satisfied for `count|sum|avg`.

## Optimizations

- **Split resolution proof from SUM.** After both relation sides exist: COUNT + `list`/`file.name` first (unblocked). Halt SUM until ops keys. If COUNT > 0 and SUM is empty, the amount key is wrong — that is the cheap silent-SUM detector the synthesis wanted.
- **Keep diagnostic list until after the no-write proof**, then remove. Do not remove it at the same moment SUM is added.
- **Bulk-fill Reports-side links outside the fork** if inventory shows empty Report relations: a one-shot vault script / Templater pass that writes `[[wikilink]]` arrays onto each Report note. Still not plugin TypeScript. Do not wait for phase 008 inverses.
- **Pin `computedSyncMode: display-only` in the first YAML edit**, not “same change-set as SUM.” It is independent and is the iCloud P0.
- **Snapshot\* in parallel** after Setup captures totals; default yes (`research/synthesis.md` Q4).
- **Cut T013** from the executable list. Handoff one line: successor module is `Aggregate.ts`, not `RollupAggPack.ts`.
- **Do not use table-footer SUM as the monthly figure** (synthesis Q8). Optional YTD sanity bar only after SC-001.
- **EuroFormat pattern this phase:** zero new `src/` files, zero call sites.

## Final build plan (ordered)

1. **Preflight (fork + backups)** — Read-only confirm fork tree is clean (so later dirt is not blamed on this phase). Copy current `database:` YAML from Reports / Expenses / Sales / Income `db_view` notes. Effort **S**. Accept: backups exist; `git status` on the Obsidian Plugin tree is recorded. Deps: none.

2. **T001 inventory** — Locate the four `db_view` notes (paths UNKNOWN; do not invent). Record database ids, relation column keys, existing `targetDatabaseId`, static Income/Expenses/Sales/Saved values, and whether Report frontmatter already holds `[[wikilink]]` arrays for Expenses (R) / Sales (R) / Income (R). Count child rows with empty Month vs malformed non-`[[...]]` values (`RelationLinks.ts:9-25`). Effort **S** (inventory) / **M** if hundreds of rows need transcription. Accept: a written inventory; halt if notes cannot be found. Deps: step 1.

3. **Ops keys (SUM gate only)** — Confirm live YAML keys for Expenses / Sales / Income amounts. Labels `cost`/`gross`/`net` are not keys (`research/synthesis.md` Q1). Effort **S**. Accept: three keys written down, or UNKNOWN and SUM stays blocked. Deps: none (parallel with 2). Default: halt; do not bind.

4. **Wire both relation sides (synthesis #1)** — Reports `database:` relation columns with `relationConfig.targetDatabaseId` = child database ids; each Report row’s relation field lists **that month’s** children as `[[wikilink]]`; each child Month field points at its Report note. Engine reads only the Report row (`RelationRollup.ts:70-78`). A wrong `targetDatabaseId` is `getTarget` null → empty (`RelationRollup.ts:43-49,64-66`). Effort **S** if already populated; **M** if bulk-fill needed. Accept: one sample Report’s relation resolves to the expected child set. Deps: step 2. Fork files: **none**.

5. **Child amount types (synthesis #6)** — Expenses/Sales/Income amount columns typed `number` or `currency` so free text cannot enter (`ChartAggregation.ts:191-198`; `RelationRollup.ts:123-125` drops non-numerics). Effort **S**. Accept: schema type check on the three amount columns. Deps: step 2. Parallel with 4.

6. **Pin display-only (synthesis #3)** — Set Reports `computedSyncMode: display-only` in YAML (`ComputedSync.ts:3`; `DataSource.ts:787`; write-back only if automatic: `DatabaseView.ts:10244`, `EmbeddedDatabaseRenderer.ts:2834`). Effort **S**. Accept: YAML literally contains `display-only`. Deps: step 2. Fork files: **none**.

7. **COUNT + diagnostic `list` on `file.name` (synthesis #2/#4, split)** — Reports rollup columns: COUNT of related children; temporary `list` with `targetField: file.name` (not the amount key) beside each of the three relations (`RelationRollup.ts:99,110-119`; modal `file.name` path at `RelationRollupConfigModal.ts:146-147`). Do **not** name `median|min|max|range` in YAML (unknown id → sum at `RelationRollup.ts:126-128`). Effort **S**. Accept: COUNT equals unique resolved children in the `list`; empty Report shows COUNT `0` and SUM-to-come empty, not a crash (`RelationRollup.ts:159-160`). Deps: step 4. Not blocked on ops keys.

8. **SUM rollups (synthesis #2, gated)** — Bind SUM to ops-confirmed amount keys for Expenses / Sales / Income (`RelationRollup.ts:123-128`). Effort **S**. Accept: on-screen SUM equals a manual sum of the `list`’s children; if COUNT > 0 and SUM empty → wrong key, fix YAML, do not patch the fork. Deps: steps 3 and 7.

9. **Snapshot\* (synthesis #5, default yes)** — Typed columns holding screenshot-era Income/Expenses/Sales/Saved beside live figures (REQ-005/006). Saved stays non-live. Effort **S**. Accept: both live and snapshot visible when they diverge. Deps: step 2 (captured totals). Parallel with 7–8. Operator may defer.

10. **SC-001 accuracy** — Manual SUM vs on-screen vs `list`/`file.name` inventory (`CellRenderer.ts:656` reads `row.computed[col.key]`; consumers `DatabaseView.ts:3388-3399`, `EmbeddedDatabaseRenderer.ts:3198-3209`). Effort **S**. Accept: three figures match; zero-child Report not deleted. Deps: step 8.

11. **SC-002 no-write proof + runbook (synthesis #7)** — Snapshot Report file bytes; edit one related child amount; rollup updates (≤80ms coalesce, `DataSource.ts:1938-1998`); Report bytes identical. Document benign writes: startup migrations and user-initiated `updateViewDefFile` (`DataSource.ts:989-992`), not rollup recompute. Effort **S**. Accept: byte-equality; runbook written. Deps: steps 6 and 8.

12. **Edges (checklist CHK-022)** — Empty Month omitted; duplicate `[[wikilink]]` counted once (`seenPaths`, `RelationRollup.ts:69-75`); two relation columns over the same children count independently; nested rollup target stays empty (`RelationRollup.ts:101`); Saved still static. Effort **S**. Accept: COUNT `0` / SUM empty placeholder (do not read SUM empty as `0`). Deps: step 10.

13. **Remove diagnostic `list` columns** — After steps 10–11 pass. Effort **S**. Accept: SUM/COUNT remain; lists gone. Deps: steps 10–11.

14. **Scope lock** — Fork `src/` unchanged (SC-003). Mobile smoke: same vault, same figures (`Platform.isMobile` is UI-only; sole `require("electron")` is export). Effort **S**. Accept: no this-phase fork diff. Deps: all above.

Successor (not built): `002-rollup-aggregation-pack` → `src/data/Aggregate.ts`. This phase must not pre-create that file.

## Risks & open decisions

| Item | Default |
|------|---------|
| Live amount YAML keys | Halt; write UNKNOWN; do not bind SUM. COUNT/`list` may proceed. |
| `db_view` filesystem paths | Inventory in Setup; do not invent. |
| Reports-side relation already populated? | Inventory; if empty, populate this phase (vault data). Do not wait for inverses. |
| Keep Snapshot\*? | **Yes.** |
| Saved live this phase? | **No.** |
| Extra Notion calculate functions in YAML? | **No** (unknown id currently **sums**). |
| Euro sign on rollup cells? | Accept `formatEuroNumber` grouping; no `ColumnDisplay.ts` patch. |
| Footer SUM as monthly figure? | **No.** Optional YTD bar after SC-001 only. |
| Ongoing two-sided maintenance | Required until derived inverses. New child → Month **and** Report relation, both `[[wikilink]]`. |
| Bulk-fill vs manual | If T001 shows empty Reports-side links and more than a handful of children: one-shot vault script, not fork `src/`. |
| Effort | **S** if both sides already linked; **M** if Reports-side must be bulk-filled. Do not treat 2.5h as a contract until T001 row counts exist. |
