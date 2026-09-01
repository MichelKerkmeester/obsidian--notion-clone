# Final Plan: Stored two-way write-back
> Reviewed & optimized build plan, from a fresh Grok 4.6 (xhigh-fast) review of this phase's rewritten spec/plan/tasks/checklist plus its synthesis and research.

## Review — strengths, gaps, risks

**Do not build.** The rewritten spec/plan/tasks already match `research/synthesis.md` Verdict. Notion’s public contract is one relation array on the edited row plus schema `dual_property` (research.md Iteration 1 findings 1–3; duplication FAQ converts 2-way → 1-way). AppFlowy’s counterpart write is commented out (`event_handler.rs:1204-1223`); Anytype `backlinks` is a featured read-only key the client never writes (`object.ts:487-494`). Dual frontmatter mirrors would be a fork-only invention, not parity. `syncWrites` is spec language: fork-wide grep is 0 matches (research.md Iteration 4 finding 1; reconfirmed). `RelationConfig` is only `{ targetDatabaseId: string }` (`types.ts:34-37`). A relation click already dirties one file: `updateFrontmatter` → `mutateFrontmatter` → `enqueueWrite(file.path)` (`DataSource.ts:288-325`, queue `89` / `99-122`). `RelationValueRenderer.ts:7-37` is `openLinkText` only. `DataSource.ts:992` is `updateViewDefFile`, not a relation write.

What is solid: REQ-001–005, the dropped Notion dual-copy claim (research.md Iteration 1 finding 8), iCloud cost grounded in two `writeQueues` keys, 008 named as the substitute, and the single revisit trigger.

What is wrong or under-weighted:

- **`tasks.md` Phase 2 is a fake build list.** T004 is 008’s module (`RelationInverse.ts` over `RelationRollup.ts:58-90`). It is not a 015 task. T005–T010 are gated fiction; Completion Criteria already say they must stay `[B]`. Parent `spec.md` Wave 6: “lean decision spec at most, never a build plan.”
- **Frozen dual call sites would double-write.** Live `DatabaseView` injects `saveCellValueWithHistory` at `CellRenderer` ctor arg `saveCellValue` (`CellRenderer.ts:91`; `DatabaseView.ts:514`). `saveValue` (`2458-2469`) calls that injector and **returns**. Hooking both `saveValue` *and* `saveCellValueWithHistory` (`7876-7889`) mirrors twice on the table path. Embed has **no** injector (`EmbeddedDatabaseRenderer.ts:253-268` passes `undefined`) and needs the fallback `updateFrontmatter` at `2465-2469` only.
- **Frozen algorithm contradicts the default policy.** Synthesis Q4 default is **refuse dual-write**. Frozen step 7 still issues a second `updateFrontmatter`. There is no cross-path rollback (`mutateFrontmatter` only drops overrides for the failed file, `DataSource.ts:305-307`). Undo/fill/paste go through `applyFrontmatterChanges` (`DatabaseView.ts:8198-8216`) and other `updateFrontmatter` sites — not in the frozen two sites. A stored mirror would desync on undo.
- **Parser/dedup traps the frozen design under-weights as “module invariants” rather than reasons not to build:** `parseRelationLink` strips `|alias` and `#subpath` (`RelationLinks.ts:15-19`); `parseRelationValues` does not dedup; only `buildRelationRollups` uses `seenPaths` (`RelationRollup.ts:69-77`); unresolved `getFirstLinkpathDest` is skipped on read (`:70-74`). A mirror that full-array-sets the counterpart will accumulate duplicates and drop aliases.
- **008 is Planned, not shipped** (`008-derived-inverse-relations/spec.md` Status). 015 reopen is gated on 008 completing. 008’s spec still says Notion “store[s] a second property … and mirror[s] it on write” — that is the claim 015 research killed. A later owner reading 008 first can reopen 015 for “parity.”
- **No `checklist.md`** (Level 1). `implementation-summary.md` still says “Not yet implemented (Planned)” while spec Status is Deferred.

Effort in plan.md (0 fork hours now; L if ever built) is right. Do not schedule the L.

## Optimizations

1. Treat this packet as a **ship lock**, not a backlog. Closable work is T001–T003 + T011 only. Move T004 to 008. Keep T005–T010 as a single “if-reopened design note,” not tasks an implementer can close.
2. If the trigger ever fires, **re-ask refuse vs best-effort before writing `RelationWriteBack.ts`.** Default stays refuse (synthesis Q4). A named workflow 008 cannot serve still does not magically create a two-path transaction.
3. Correct the frozen call-site pair (not scheduled): mutually exclusive — (a) `saveValue` fallback branch only (`CellRenderer.ts:2465-2469`, embed); (b) after successful persist inside `applyCellChangeOptimistically` (`DatabaseView.ts:7942-7946`), which `saveCellValueWithHistory` already uses. Never both of `saveValue` (post-injector) and `saveCellValueWithHistory`.
4. Reverse key must be a new `RelationConfig` field (`types.ts:34-37` + column `:67-68`), never the same frontmatter key on both notes (synthesis Q3). Skip `sourcePath === targetPath` and same-database mirrors by default (Q5). Mobile: no new write path; `.db-mobile-reorder-controls` (`settings.ts:446-451`) is reorder UI, not a write gate.
5. Do not hook `EmbeddedDatabaseRenderer.ts:2864` / `:2887` (computed persist) or `RelationTargetChange.ts:23-49` (rollup retarget plan). Do not attach writes to `RelationValueRenderer.ts:7-37`.

## Final build plan (ordered)

**Verdict: DO-NOT-BUILD / Deferred. 0 fork hours. No `src/` module. No call-site edit.**

1. **Confirm the lock (S)** — no new files. Deps: none.
   - Spec Status Deferred; Files to Change empty; REQ-001–003.
   - Grep fork `src/` for `syncWrites` / `sync_writes` → 0.
   - `git status` on `/Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src` shows no 015 module.
   - **Check:** one relation click still one `enqueueWrite` (`DataSource.ts:293`).

2. **Read-only substitute (owned by 008, not here) (M)** — `src/data/RelationInverse.ts` over `RelationRollup.ts:58-90`; 008’s call sites only. Deps: 008 Planned → must complete before any 015 reopen.
   - Product need (Report lists inbound Expenses) is a **read**. Anytype `backlinks` is the same theorem.
   - **Check:** inbound list with one dirty markdown file, not two.

3. **Hold the frozen shape as notes, do not implement (S)** — Deps: step 1.
   - Hypothetical module `src/data/RelationWriteBack.ts` (`EuroFormat.ts:9` rebase contract) remains unbuilt.
   - Hypothetical gates: config default OFF (invented flag on `RelationConfig`), `Platform.isMobile` abort, resolve-before-write, Set/delta not full-array, canonical `[[target]]` only.
   - **Check:** none of T005–T010 start.

4. **Revisit gate (S)** — Deps: 008 complete + operator names a workflow.
   - **Exact trigger (spec §7):** reopen only if a **concrete named workflow** appears whose two-way need the derived inverse (008) cannot serve. Not “Notion parity.” Not “syncWrites was always meant to exist.”
   - Then write a **new** plan; do not execute this packet’s `[B]` list as-is (double-hook + refuse-vs-dual contradiction).

## Risks & open decisions

- **Later owner enables a `syncWrites` path that does not exist** — default: keep Deferred; cite grep = 0 and `types.ts:34-37`.
- **Reopen from 008’s old Notion dual-copy sentence** — default: 015 research wins; Notion internals stay an inference boundary (research.md Iteration 1 finding 8).
- **If reopened, same-key mirror vs reverse property id** — default: explicit reverse id (`dual_property` analog). Never the same key on both files.
- **If reopened, one of two writes fails** — default: **refuse dual-write**. If insisted: edited note canonical; counterpart best-effort delta; no atomic rollback (`DataSource.ts:88-122`).
- **Self-relation Next/Previous** — default: skip same-database mirrors until a named self-relation workflow exists.
- **Mobile / iCloud dual-enqueue** — default: display-only on mobile; never dual-enqueue on this iCloud vault. Fork has no `isMobile` write gate today (`CellRenderer.ts:1484` is overlay chrome).
- **Notion “1 page” cardinality** — default: do not add; schema has no max-count (`types.ts:34-37`).
- **008 unfinished** — default: do not start 015 instead of 008.
