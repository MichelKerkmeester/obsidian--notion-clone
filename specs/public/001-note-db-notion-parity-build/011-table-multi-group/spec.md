---
title: "Feature Specification: Table Group-by 2+ Fields"
description: "Multi-field grouping for TABLE views: groupByFields[] with recursive, indented group headers in TableRenderer.ts."
trigger_phrases:
  - "table group by"
  - "group by multiple fields"
  - "multi-field grouping"
  - "groupbyfields"
  - "nested group headers"
  - "table subgroup"
  - "group by 2 fields"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/011-table-multi-group"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Applied final-plan.md review findings; refreshed graph metadata; compacted continuity fields"
    next_safe_action: "Build phase 011 per plan.md and tasks.md (T001 then T002)"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Table Group-by 2+ Fields

> Wave-4 child phase: predecessor `010-conditional-format-icons`, successor `012-files-column`. Parent spec: [`../spec.md`](../spec.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-24 |
| **Branch** | `011-table-multi-group` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
TABLE views in the note-database fork group rows by a single string (`groupByField`) only, while Notion's current View settings expose **Group + Sub-group** (exactly two levels) and the fork already ships the 2-level algorithm on the board (`applyBoardSubgroups` / `getBoardSubgroups`). The fork's table dispatch reads one field at `src/views/DatabaseView.ts:6332-6333`; there is no way to nest a second grouping level inside a table without falling back to the board view.

### Purpose
Extend table grouping to more than one field by adding `groupByFields?: string[]` to the table view config and recursing `groupBy` through a new isolated module, rendering indented group headers per depth. The locked shape is **composition, not a rewrite**: one `EuroFormat`-style module (`src/data/MultiFieldGrouping.ts`) that recursively reuses `QueryEngine.groupBy` and the existing per-field maps, then a flatten-with-depth pass in `TableRenderer`. Effort stays **M**. The single biggest risk is a persistence miss — `DataSource` parse/serialize is a whitelist, so a `groupByFields[]` that is never serialized is deleted on the next config save — plus any nested `setupGroupDropTarget` that would write two frontmatter fields and break the display-only / iCloud contract.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `groupByFields?: string[]` on `ViewConfig` beside the existing `groupByField` (`src/data/types.ts:362`); legacy single-field config maps to a one-element array via `effectiveGroupFields`.
- New isolated module `src/data/MultiFieldGrouping.ts` on the `EuroFormat.ts` isolated-diff model: pure functions, no renderer imports. Exports `effectiveGroupFields`, `buildGroupTree`, `flattenGroupTree` (optional `dropComputedGroupFields`).
- Depth-aware grouped-table render in `src/views/TableRenderer.ts` (loop `82-155` only): indented headers via `db-group-header--depth-N`, path-qualified collapse keys, leaf tables render today's table + summaries + expand controls. `TableGroup` extended additively with `depth?`, `path?`, `field?`, `collapseKey?`, `children?`; collapse key, leaf value, and create defaults are three distinct fields.
- Persistence round-trip in `src/data/DataSource.ts` (parse `885`, serialize `1088`; serialize `undefined` when empty; new-format only — no `legacyViewKeys` strip entry) — **same commit as the module** (one PR for data + persist).
- Embedded-table grouped dispatch + copy-back sibling in `src/views/EmbeddedDatabaseRenderer.ts` (`3353` beside `groupByField`; table grouped branch `1012-1016`; do not change gallery/list `973-986` or timeline `1005-1007`).
- Additive indent/spacing CSS on `.db-group-header` (`styles.css:6171-6185`, `padding: 0` at `6184`) plus consecutive-header spacing beside `styles.css:6255-6257`; **sticky only at depth 0** (depth ≥ 1 not sticky — two depths share one sticky slot and paint over each other).
- Table Sub-group picker cloning the board `renderBoardSubgroupSection` (`ToolbarRenderer.ts:1423-1448`) behind `currentViewType === "table"` inside `populateGroupPopover` (`:1221-1266`); candidate filter = board filter plus `!isComputedGroupField`; write path `DatabaseView.ts:2408-2426`. A ViewConfigPanel table section and a second toolbar picker are deferred.
- Display-only behavior: grouping writes no vault data; nested DnD is deferred.

### Out of Scope
- Nested filters (separate phase; higher finance value, earlier in the wave).
- Gallery/list multi-level grouping (those stay on `vs().groupByField` at `DatabaseView.ts:9554-9578`) and timeline (`getActiveGroupField` at `2890-2894`).
- Board subgroup behavior changes — `groupByFields[]` stays **separate** from `boardSubgroupEnabled` / `boardSubgroupField` (`types.ts:339-340`).
- `ViewStateStore` threading (config-only; `persist` already writes top-level `groupByField` at `69-84`).
- Nested-group row drag-and-drop (multi-field write) — deferred; depth-0 drop targets unchanged and nested groups have no drop target.
- A ViewConfigPanel table Sub-group section (`renderBoardSettings` is board-only, `:313-317`) and a second toolbar picker beyond the single Sub-group control — both deferred.
- Extending `patchGroupedRows` for nested trees — deferred; 2-field flatten fails the patch and full-rerenders (the safety valve).
- Anytype query-as-group and AppFlowy single-field models (ruled out by research).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/MultiFieldGrouping.ts` (new) | Add | Isolated multi-field grouping helper; `EuroFormat.ts:1-42` contract — pure functions, no renderer imports. Exports `effectiveGroupFields`, `buildGroupTree`, `flattenGroupTree` (optional `dropComputedGroupFields`). |
| `src/data/types.ts` (`362`) | Modify | Add `groupByFields?: string[]` beside `groupByField`; `collapsedGroups` (`368`) unchanged. |
| `src/data/DataSource.ts` (`885`, `1088`) | Modify | Parse `groupByFields` at `885`; serialize at `1088` as `view.groupByFields?.length ? view.groupByFields : undefined`. No `legacyViewKeys` strip entry. |
| `src/views/DatabaseView.ts` (`6332-6333`, `9539-9545`) | Modify | Dispatch `6332-6333` becomes `effectiveGroupFields(...).length > 0`; `renderGroupedTable` `9539-9545` builds the tree then calls `tableRenderer.renderGroupedTable(..., flattened, fields[0])`. |
| `src/views/TableRenderer.ts` (`17-21`, `82-155`, `148-151`, `470`) | Modify | Extend `TableGroup` additively (`depth?`, `path?`, `field?`, `collapseKey?`, `children?`); depth-aware loop `82-155` only; `setupGroupDropTarget` only at depth 0 using the plain leaf `key` (not `collapseKey`); create-entry merges `resolveGroupCreateDefaults` per `(field, key)` in the path. |
| `src/views/EmbeddedDatabaseRenderer.ts` (`1012-1016`, `3353`) | Modify | Add `groupByFields` beside `groupByField` copy at `3353`; table grouped branch `1012-1016` uses the same tree + flatten; do not change gallery/list `973-986` or timeline `1005-1007`. |
| `src/views/ToolbarRenderer.ts` (`1221-1266`, `1423-1448`, `1462`) | Modify | Table Sub-group picker: clone `renderBoardSubgroupSection` behind `currentViewType === "table"` in `populateGroupPopover`; candidate filter = board filter plus `!isComputedGroupField`; write path `DatabaseView.ts:2408-2426`; undo label reuses `undo.groupConfig` (not `undo.boardSubgroupConfig`). |
| `styles.css` (`6171-6185`, `6255-6257`) | Modify | Additive `db-group-header--depth-N` indent (16px per depth via `padding-left`), consecutive-header margin, and **depth ≥ 1 not sticky** (only depth 0 keeps `position: sticky`). |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | `groupByFields[]` accepted by table view settings | `DataSource.parseViewConfig` (`885`) accepts `groupByFields`; `["Category", "Type"]` groups by Category then Type; `["Category"]` renders exactly as today's `groupByField`. Parse acceptance satisfies REQ-001; the table-gated toolbar Sub-group picker is the user-facing closer. |
| REQ-002 | Recursive groupBy via the new module | `buildGroupTree` recurses per parent; depth-N groups render nested inside depth N-1; verified with 2- and 3-field configs (compute unbounded; picker UX caps at 2). |
| REQ-003 | Indented group headers | Header indent scales with depth via `db-group-header--depth-N` (16px per depth, `padding-left`); depth-0 headers flush; consecutive-header margin added beside `styles.css:6255-6257`; **sticky only at depth 0** (depth ≥ 1 not sticky — two depths share one sticky slot). |
| REQ-004 | Single-field backward compatibility | `groupByFields` absent ⇒ `effectiveGroupFields` is `[groupByField]`; flatten depth 0; collapse keys unchanged; byte-identical to today (`types.ts:362`; dispatch falls back). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Rebase-friendly diff shape | One new module (`src/data/MultiFieldGrouping.ts`) + 3 logical call sites (DatabaseView dispatch+render, TableRenderer depth loop, settings types.ts+DataSource.ts); CSS and Embedded one-liner additive; no `ViewStateStore`; nested DnD out. Rebase dry-run onto upstream applies cleanly. |
| REQ-006 | Mobile-safe rendering | Nested headers usable at ≤360px; no desktop-only APIs; no new media queries; `tableMinWidth` per header (`TableRenderer.ts:112`) keeps horizontal overflow equal to today's grouped table; collapse toggles stay 20×20. |
| REQ-007 | Display-only, iCloud-safe | `groupBy` is pure (`QueryEngine.ts:132-152`); the new module writes nothing; collapse/expand only `scheduleConfigSave` view definition (`DatabaseView.ts:9850-9856`); no note-body / frontmatter row writes; no new write path (nested DnD deferred). |
| REQ-008 | No telemetry or secrets | No network calls, no credential-shaped values. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: A 2-field table config renders recursive groups with indented headers in the dev vault.
- **SC-002**: A 1-field config renders byte-identically to the pre-change build.
- **SC-003**: Diff-shape audit shows one new `src/data/` module plus 3 logical call sites (CSS + Embedded additive siblings).
- **SC-004**: Mobile viewport check passes for nested headers; horizontal overflow equal to today's grouped table.

### Acceptance Scenarios

- **Scenario 1**: **Given** a table with Category and Type fields, **when** `groupByFields` is set to both, **then** rows render grouped by Category with Type subgroups and indented headers, and collapsing a Category hides its Type subtree.
- **Scenario 2**: **Given** a legacy table with only `groupByField` set, **when** the change lands, **then** rendering is byte-identical (same collapse keys, same DOM).
- **Scenario 3**: **Given** the change set, **when** diff-audited, **then** exactly one new module under `src/data/` and 3 logical call sites are touched; CSS and Embedded edits are additive.
- **Scenario 4**: **Given** a narrow viewport, **when** nested headers render, **then** no horizontal overflow beyond existing table behavior and no desktop-only APIs are used.
- **Scenario 5**: **Given** a computed/rollup field in `groupByFields`, **when** the tree is built, **then** the module drops it with a console warning and never writes; the picker filters it out.
- **Scenario 6**: **Given** an embedded table view, **when** `groupByFields` is set, **then** it renders the same nested headers as the top-level view and the copy-back loop preserves the setting.
- **Scenario 7**: **Given** a 2-field table and a 1-field table, **when** an external row edit triggers `tryPatchExternalTableRows`, **then** the 1-field patch succeeds in place and the 2-field tree falls back to a full render (the safety valve), with no broken DOM.
- **Scenario 8**: **Given** a 2-field `Cat / Type` table, **when** a new row is created inside a `Cat / Type` group, **then** the row gets `Category = <cat>` and `Type = <type>` (not `Category = "Cat::Type"`) — collapse key, leaf value, and create defaults never conflate.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Persistence miss (DataSource whitelist) | `groupByFields[]` never serialized ⇒ deleted on next config save; REQ-001/REQ-007 regression | Add parse `885` + serialize `1088` in the same PR as the data layer; serialize `undefined` when empty; verify round-trip in dev vault. |
| Risk | Nested `setupGroupDropTarget` writes two fields | Breaks display-only / iCloud contract; `updateBoardGroup` on two fields | Call `setupGroupDropTarget` **only at depth 0**; nested groups have no drop target; nested DnD deferred. |
| Risk | Collapse-key / leaf-value / create-defaults namespace conflation | New rows get `Category = "Cat::Type"`; collapse toggles collide | Three distinct fields on the flat node (`collapseKey`, leaf `key`, per-level `(field, key)` create pairs); `setupGroupDropTarget` uses the plain leaf `key`, not `collapseKey`. |
| Risk | Sticky stacking — two depths share one sticky slot | Nested headers paint over each other (`styles.css:6171-6184`) | Sticky only at depth 0; depth ≥ 1 headers are `position: relative` (no stacked `top` offsets). |
| Risk | `patchGroupedRows` silent full-rerender on 2-field trees | Parent nodes skip the table ⇒ patch returns `false` ⇒ full refresh | Do not extend `patchGroupedRows` this phase; document the fallback; prove 1-field still patches. |
| Dependency | Upstream `TableRenderer.ts` / `DatabaseView.ts` | Rebase conflicts if upstream changes grouping | Isolated module, minimal call sites, rebase dry-run in verification. |
| Dependency | `boardSubgroupField` precedent | Naming/behavior drift between board and table subgrouping | Keep `groupByFields[]` separate from `boardSubgroupEnabled` / `boardSubgroupField` (`types.ts:339-340`); shared `buildGroupTree` helper is enough overlap. |
| Risk | Renderer complexity | Nested rendering regresses embedded views | Embedded grouped dispatch updated alongside top-level; manual render matrix including embedded views. |
| Risk | Large finance tables | Deep grouping hurts interaction | Display-only path; 5k×2 is O(N·D) Map passes with no memoization (`QueryEngine.ts:140-148`); `groupRowLimit` + `expandedGroupRows` clamp each leaf. |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: 2-field grouping over ~5k-row finance tables stays interactive; 5k×2 is O(N·D) Map passes with no memoization (`QueryEngine.ts:140-148`); no measured regression versus single-field grouping.

### Security
- **NFR-S01**: No secrets or credentials; no network calls.

### Reliability
- **NFR-R01**: Grouping is deterministic and display-only; `groupBy` is pure (`QueryEngine.ts:132-152`); the new module writes nothing; no vault writes (iCloud-safe).

### Mobile
- **NFR-M01**: Mobile-safe at ≤360px viewport; no desktop-only APIs; no new media queries; `body.is-phone` plus label `max-width: min(480px, calc(100vw - 48px))`; `tableMinWidth` per header keeps overflow equal to today; collapse toggles stay 20×20.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Legacy 1-field:** `groupByFields` absent ⇒ `effectiveGroupFields` is `[groupByField]`; flatten depth 0; collapse keys unchanged; byte-identical to today (`types.ts:362`; dispatch falls back).
- **Null / missing:** each level gets `t("common.uncategorized")` (`QueryEngine.ts:279`); hide via `showEmptyGroups[field]` (`GroupVisibility.ts:24-30`); distinct nodes per depth.
- **Empty groups:** `withEmptyOptionGroups` per level (`GroupVisibility.ts:52-60`); multi-select defaults to hidden empties (`:20`); empty leaf tables follow today's groupBy behavior.
- **Empty DB:** `rows.length === 0` → `db-empty` (`TableRenderer.ts:92-98`); tree is empty at any depth.
- **Filter-before-group:** `this.rows` is already filtered at `DatabaseView.ts:6313` before `6332`; nested grouping inherits that.

### Error Scenarios
- **Mixed types:** stringify + trim + dedupe (`QueryEngine.ts:276-280`); `localeCompare` tie-break; no throw.
- **Checkbox / date at depth:** checkbox `"true"`/`"false"` (`QueryEngine.ts:261`); date modes stay per-field (`dateGroupModes[field]`).
- **Multi-select fan-out:** a row can appear in multiple sibling groups at every depth (`QueryEngine.ts:143-147`); `rowByPath` is render-only (`TableRenderer.ts:90`); counts are non-exclusive.
- **3+ fields:** compute recurses; UI picker caps at 2; `groupRowLimit` + `expandedGroupRows` clamp each leaf (`GroupVisibility.ts:63-75`).
- **Computed / rollup:** picker filters them; module drops leftovers with a console warning (`GroupDisplay.ts:64-69`; create gate `TableRenderer.ts:149-150`); matches Notion (no rollup grouping; no drag on formula groups).

### Concurrent Operations
- **Regrouping is display-only** and writes no vault data, so it cannot race with note sync.
- **Collapse/expand** only `scheduleConfigSave` the view definition (`DatabaseView.ts:9850-9856`), serialized per-file.
- **Collapsed parent:** flatten is preorder; skip while `depth > collapsedDepth` (`TableRenderer.ts:132` today only skips the table).
- **Sticky stacking:** every `.db-group-header` shares one `position: sticky; top: calc(...); z-index: 26` slot (`styles.css:6171-6184`); two depths paint over each other. **Sticky only at depth 0**; depth ≥ 1 headers are `position: relative`.
- **Patch path:** `patchGroupedRows` requires each header's next sibling to be `.db-table-wrap` (`TableRenderer.ts:209-250`); parent nodes skip the table, so 2-field trees return `false` and `tryPatchExternalTableRows` (`DatabaseView.ts:2199-2272`) falls through to a full refresh. Do **not** extend `patchGroupedRows` this phase; do prove 1-field still patches.
- **DnD:** depth-0 drop targets unchanged; nested groups have no drop target so regrouping cannot `updateBoardGroup` two fields. `setupGroupDropTarget` uses the plain leaf `key` (not `collapseKey`).
- **Embedded table views** render the same nested headers as top-level views.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 12/25 | One new `src/data/MultiFieldGrouping.ts` module + 3 logical call sites (DatabaseView, TableRenderer, settings) + additive CSS/Embedded siblings. |
| Risk | 9/25 | Persistence whitelist miss + nested DnD write contract; rebase drift on upstream renderer; embedded-view regression. |
| Research | 6/20 | 10-iteration deep research complete; board subgroup precedent, EuroFormat diff model, DataSource persistence, AppFlowy/Anytype ruled out. |
| **Total** | **27/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

Operator decisions recorded with defaults (from research synthesis):

1. Unify `groupByFields[]` with board `boardSubgroupField`? — Default: **keep separate** (board is a 2-level special case with its own enabled flag and DnD MIME; table is N-level + flatten; shared `buildGroupTree` is enough overlap).
2. Module filename? — Default: **`src/data/MultiFieldGrouping.ts`** (alternative `GroupByFields.ts` acceptable; never under `src/views/`).
3. Collapse-key namespace? — Default: **`path.join("::")` under `groupByFields[0]`** (do not copy the board's field+key quirk).
4. Indent unit? — Default: **16px per depth** via `db-group-header--depth-N` (`padding-left`; header is currently `padding: 0` at `styles.css:6184`); add consecutive-header margin.
5. Settings UI in this phase? — Default: **ship parse + a table-gated toolbar Sub-group section (clone of `renderBoardSubgroupSection` in `populateGroupPopover`) in the same PR**; defer a ViewConfigPanel table section (board-only `renderBoardSettings` cannot host a table control) and a second toolbar picker.
6. UX cap at 2 vs expose 3+ in the picker? — Default: **picker max 2**; still verify a 3-field config in the data layer (Notion has no third level).
7. Thread `groupByFields` through `ViewStateStore`? — Default: **no** (config-only; dispatch reads `effectiveGroupFields(config, vs())`).
8. Nested drag-and-drop? — Default: **defer** (vault-write feature, not grouping display).
9. Correct spec §3 path at build? — Default: **yes** — `src/views/TableRenderer.ts` + `src/views/DatabaseView.ts`, not `src/views/table/TableRenderer.ts`.
10. REQ-005 vs discovered files? — Default: **lock the 1+3 call-site reading**; treat DataSource as the settings site, Embedded + CSS as siblings; do not open ViewStateStore, gallery/list, or nested DnD to "use up" the budget.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Research Source**: `research/synthesis.md` (ranked, decision-ready findings) and `research/research.md` (full evidence trail)

<!-- /ANCHOR:related-docs -->
