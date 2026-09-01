---
title: "Implementation Plan: Stored two-way write-back"
description: "No build is planned: stored two-way write-back stays deferred. Notion's two-way contract is a schema-level dual_property pair plus a derived inverse, and both reference clones ship single-write / derived-backlink models — so dual frontmatter mirrors would be a fork-only invention, not parity. The two-way read ships in 008 instead."
trigger_phrases:
  - "two-way write-back"
  - "stored write-back"
  - "implementation plan"
  - "syncwrites"
  - "no build planned"
  - "relation mirror writes"
  - "icloud write churn"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/015-two-way-write-back"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan findings: corrected call-site pair, step 7 refuse default"
    next_safe_action: "Revisit only if the recorded trigger fires; then write a new plan"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Stored two-way write-back

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | None for this phase (TypeScript plugin fork is not touched) |
| **Framework** | Obsidian plugin API (fork baseline only; no new write path) |
| **Storage** | Operator vault on iCloud; no new writes |
| **Testing** | None planned; there is no plugin diff to test |

### Overview
This is not a build. The research verdict is DO-NOT-BUILD: Notion's two-way contract is a schema-level `dual_property` pair plus a **derived** inverse (one relation array written on the edited row; the duplication FAQ proves the inverse is derived), and both AppFlowy and Anytype ship the same single-write / derived-backlink model. Dual frontmatter mirrors would therefore be a fork-only storage invention that dirties two markdown files per click through `DataSource.writeQueues` (`src/data/DataSource.ts:88-122`) — not Notion parity. The cheaper/safer alternative the synthesis names is the two-way **read** in `008-derived-inverse-relations` (`RelationInverse.ts` over the existing `RelationRollup.ts:58-90` scan); that path dirties one markdown file.

There is no implementation sequence, no new module under `src/data/`, and no call-site edit this wave. spec.md Files to Change is empty; effort is 0 fork hours. Rollups stay display-only (`src/data/types.ts:69-70`). Relation cells already write **one** note through `updateFrontmatter` → `mutateFrontmatter` → `enqueueWrite` (`src/data/DataSource.ts:288-325`). `src/views/RelationValueRenderer.ts:7-37` is navigation-only (`openLinkText`); do not attach writes there. `DataSource.ts:992` is `updateViewDefFile` (view-config YAML), not a relation write — do not treat it as a call site.

`syncWrites` does not exist in source (fork-wide grep: zero `syncWrites`/`sync_writes` matches); it is spec-packet language. A future ON path would be net-new code, not flipping a dormant switch. If this were ever built, effort would be L; that work is not planned.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented (fork-side rationale, not the Notion mirror claim)
- [x] Success criteria measurable
- [x] Dependencies identified (008 read path; `writeQueues` per-path cost)

### Definition of Done
- [x] All acceptance criteria met (deferral recorded; no fork diff)
- [x] Tests passing (N/A — no plugin diff to test)
- [x] Docs updated (spec/plan/tasks reflect synthesis Verdict)

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Decision-only packet. No runtime architecture is added this wave. The fork keeps the derived inverse (`008`) as the two-way read, and no `syncWrites` ON path is built. This phase adds no dual-write path.

### Key Components
- **This decision spec**: Holds the deferral, the fork-side dual-write cost, the corrected (non-Notion-mirror) rationale, and the single revisit trigger
- **Derived inverse (specified in `008-derived-inverse-relations`)**: Read-only inbound list (`RelationInverse.ts` over `RelationRollup.ts`); the substitute this deferral relies on
- **Rejected surface**: Stored mirror into both notes' frontmatter; a `syncWrites` ON path (net-new code, not a dormant switch); two keys in `DataSource.writeQueues`

### Data Flow
None this wave. No second frontmatter property is written, and no second path is enqueued. A relation click today flows `updateFrontmatter` → `mutateFrontmatter` → `enqueueWrite(file.path)` (`src/data/DataSource.ts:288-325`), dirtying one markdown file. A future build would have to design conflict policy for two stored properties and accept iCloud dual-churn; that path is not designed here, only sketched as frozen future shape below.

### Frozen future shape (only if the revisit trigger fires — EuroFormat isolated module)
Recorded as design-ready-if-revisited notes, **not** an active plan. The synthesis locks this shape so a future owner does not redesign from scratch:

- **Module:** `src/data/RelationWriteBack.ts`, same contract as `src/data/EuroFormat.ts:9` ("Kept in one module so it stays a small, rebasable diff").
- **Exports (pure):** `planRelationMirror({ sourceFile, sourceKey, previousValue, nextValue, relationConfig, app })` → `{ mirrors: Array<{ file: TFile; key: string; nextLinks: string[] }> }` or empty (no-op). Optional `serializeCanonicalWikilink(path)` → `[[target]]` with no `|alias` and no `#subpath`.
- **Algorithm (AppFlowy delta, not array-set):** (1) hard-abort unless an explicit config gate is ON (the spec's `syncWrites` concept — net-new; default OFF) and hard-abort on mobile; (2) parse previous/next with `parseRelationValues` (`src/data/RelationLinks.ts:23-26`); (3) resolve each target with `metadataCache.getFirstLinkpathDest`, drop unresolved (same as `RelationRollup.ts:70-74`); (4) restrict to records in `relationConfig.targetDatabaseId`, skip when resolved path equals source path, skip same-database mirrors by default; (5) diff membership → inserted/removed, apply insert-if-absent / remove-by-position (`relation.rs:40-51`) with Set dedup on write; (6) serialize canonical `[[target]]` only (aliases are display-only, `getRelationDisplayLabel` in `RelationLinks.ts:28-30`; `parseRelationLink` strips `|alias`/`#subpath`, `RelationLinks.ts:15-19`); (7) **default: refuse the dual-write** (synthesis Q4) — issue no second `updateFrontmatter`. If the operator insists on best-effort, the caller issues one additional `dataSource.updateFrontmatter(targetFile, { [mirrorKey]: nextLinks })` — a second `writeQueues` key (`DataSource.ts:89, 99-122`), with no cross-path rollback (`mutateFrontmatter` only drops overrides for the failed file, `DataSource.ts:305-307`). **Re-ask refuse vs best-effort before writing the module** (final-plan.md Optimization #2). Note: undo/fill/paste go through `applyFrontmatterChanges` (`DatabaseView.ts:8198-8216`) and other `updateFrontmatter` sites — not the two frozen call sites — so a stored mirror desyncs on undo.
- **Call sites (mutually exclusive pair — never hook both; corrected from the original frozen pair which double-wrote on the table path):** Live `DatabaseView` injects `saveCellValueWithHistory` at the `CellRenderer` ctor arg `saveCellValue` (`CellRenderer.ts:91`; `DatabaseView.ts:514`), and `saveValue` (`CellRenderer.ts:2458-2469`) calls that injector and **returns** — so hooking both `saveValue` (post-injector) and `saveCellValueWithHistory` (`DatabaseView.ts:7876-7889`) mirrors twice on the table path. The correct pair is: (a) `saveValue` **fallback branch only** (`CellRenderer.ts:2465-2469`) — the embed path where `EmbeddedDatabaseRenderer.ts:253-268` passes `undefined` as the injector; (b) after successful persist inside `applyCellChangeOptimistically` (`DatabaseView.ts:7942-7946`), which `saveCellValueWithHistory` already uses. Do **not** hook `EmbeddedDatabaseRenderer.ts:2864` / `:2887` (computed-field persist) or `RelationTargetChange.ts:23-49` (rollup retarget plan; unless the named workflow requires a backfill when `targetDatabaseId` changes). Do not attach writes to `RelationValueRenderer.ts:7-37` (navigation-only, `openLinkText`).

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Setup
- [x] Decision recorded in this packet (`spec.md`)
- [x] No project structure, dependencies, or development environment for a plugin build

### Phase 2: Core Implementation
- [x] No core implementation is planned this wave
- [x] Do not add a stored frontmatter mirror on the related note
- [x] Do not implement a `syncWrites` ON path or a dual `writeQueues` path
- [ ] [B] If the revisit trigger fires: write a **new** plan — do not execute this packet's frozen shape as-is (the call-site pair double-writes on the table path; step 7 contradicts the refuse-dual-write default). The new plan must first extend `RelationConfig` in `src/data/types.ts:34-37` (and the column field at `:67-68`) with an explicit reverse property id, then build `src/data/RelationWriteBack.ts` (isolated delta mirror) at the corrected mutually-exclusive call sites above

### Phase 3: Verification
- [x] No plugin verification is required until the revisit trigger fires
- [x] Confirm the fork tree is not changed by this phase
- [ ] [B] Revisit only if a concrete named workflow appears that the derived inverse (`008`) cannot serve

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | None. No new module. | N/A |
| Integration | None. No dual-write path. | N/A |
| Manual | Confirm the fork is unchanged and this packet still reads Deferred | Read `spec.md` / `plan.md` / `tasks.md`; grep fork for `syncWrites` (expect 0) |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| Derived read-only inverse (`008-derived-inverse-relations`) | Internal | Specified as the two-way READ substitute | This deferral assumes that read path; do not build write-back instead of it; 008 must complete before any 015 reopen |
| `syncWrites` default OFF | Internal | Spec concept only — zero matches in fork source | An ON path would be net-new code (this phase); it stays unbuilt |
| `DataSource.writeQueues` per-path behavior (`src/data/DataSource.ts:88-122`) | Internal | Green (baseline) | A build would enqueue two paths; iCloud would churn both notes; no cross-path rollback (`mutateFrontmatter` rolls back only the failed file, `DataSource.ts:305-307`) |
| Concrete named workflow the inverse cannot serve | External | Not present | Until one is named, this phase stays Deferred |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: Not applicable to plugin code. This phase ships no fork diff.
- **Procedure**: If a later session adds a stored frontmatter mirror, implements a `syncWrites` ON path, or dual-enqueues relation writes against this decision, revert that diff and restore the Deferred ruling in this packet. The edited note is canonical; any counterpart write is best-effort delta with no atomic rollback.

<!-- /ANCHOR:rollback -->
---

<!-- ANCHOR:l2-phase-deps -->
## L2: PHASE DEPENDENCIES

```
Phase 1 (Setup) ──> Phase 2 (Core) ──> Phase 3 (Verify)
     (docs only)      (no build)         (no plugin tests)
                                  [B] items gated on revisit trigger
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Setup | None | None (no build follows) |
| Core | None | None (no implementation is planned this wave) |
| Verify | None | None (no plugin gate) |
| [B] Future build | Revisit trigger + `RelationConfig` extension | A dual-write path (refused by default) |

<!-- /ANCHOR:l2-phase-deps -->
---

<!-- ANCHOR:l2-effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | Decision already recorded in this packet |
| Core Implementation | None now; L if ever built | 0 hours of plugin work this wave |
| Testing & Verification | None | 0 hours of plugin tests |
| [B] `RelationConfig` extension (if reopened) | M | Schema field for reverse key/cardinality/sync flag (`types.ts:34-37`) |
| [B] `RelationWriteBack.ts` module (if reopened) | L | Isolated delta mirror + 2 call sites; no cross-path transaction |
| **Total** | | **0 hours of fork work** (Effort L only if the revisit trigger fires and a new plan is written) |

<!-- /ANCHOR:l2-effort -->
---

<!-- ANCHOR:l2-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [x] Backup created (N/A: no data or plugin change)
- [x] Feature flag configured (N/A: `syncWrites` is spec-only and not implemented here)
- [x] Monitoring alerts set (N/A: no runtime)

### Rollback Procedure
1. Immediate: do not merge any stored write-back or `syncWrites` ON diff.
2. Revert code: N/A unless a later session added a dual-write path; then revert that diff.
3. Database: N/A. No schema or note rewrite.
4. Verify: fork tree matches pre-phase baseline; grep `syncWrites` returns 0.
5. Notify: N/A. Personal vault, no product launch.

### Data Reversal
- **Has data migrations?** No
- **Reversal procedure**: N/A. This phase writes no vault data.

### Edge cases & mobile/iCloud safety (must-handle only if ever built; today they argue against building)
- **Cycles / self-relations.** A stored mirror can write loops; the derived inverse cannot. Notion special-cases self-relations and blocks rollup-of-rollup loops. Guard: skip `sourcePath === targetPath` and skip same-database mirrors by default.
- **Alias / subpath loss.** `parseRelationLink` drops `|alias` and `#subpath` (`RelationLinks.ts:15-19`). Mirrors must write canonical targets; UI aliases stay display-only.
- **Duplicates.** `parseRelationValues` does not dedup; only `buildRelationRollups` does (`RelationRollup.ts:69-77`). Write-back must use Set/delta semantics or the counterpart note accumulates duplicate wikilinks.
- **Stale / renamed / deleted targets.** Unresolved `getFirstLinkpathDest` must no-op, matching today's rollup skip (`RelationRollup.ts:70-74`). Do not write a broken `[[...]]` into a second note.
- **Half-applied dual writes.** Two `enqueueWrite` slots fail independently; AppFlowy's answer is to have no second write (`event_handler.rs:1204-1223`); Anytype's atomicity is in Go middleware, not this clone (`command.ts:1339-1359`). The fork has per-path ownership credits (`DataSource.ts:107-111`) and no cross-path arbitrator. Default: refuse dual-write.
- **Rollup display-only invariant.** `types.ts:69-70` forbids writing rollups to frontmatter. A stored reverse relation is a new, separately gated write class — not a rollup.
- **No cardinality field.** The module cannot enforce Notion's "1 page" limit until `RelationConfig` grows (`types.ts:34-37`).
- **Mobile / iCloud.** This wave the change is **not made** — default relation clicks already dirty one file (`enqueueWrite(file.path)`, `DataSource.ts:293`), so iCloud sees one file-change event. AppFlowy ships mobile relation editing as "Coming soon" on both grid and row-detail skins (`mobile_grid_relation_cell.dart:9-53`; `mobile_row_detail_relation_cell.dart:8-55`); the fork has no `isMobile` write gate today, so the safe posture is to add **no** new write path on iPhone/iCloud. A future ON path needs three gates at the module boundary: platform (mobile → display-only), config (`syncWrites`-style, default OFF), resolution (target exists in the target database). Do not invent platform write logic in `src/settings.ts:446-451` (`.db-mobile-reorder-controls` is reorder UI only).

<!-- /ANCHOR:l2-rollback -->

---

<!--
CORE TEMPLATE (~90 lines)
- Essential technical planning
- Simple phase structure
- Add L2/L3 addendums for complexity
-->
