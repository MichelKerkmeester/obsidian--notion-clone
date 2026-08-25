# Deep Research: Record Detail Panel / Hover-Open UX

> Notion-parity enrichment for the forked Note Database plugin, merged from 10 forced-depth research iterations (no early convergence).
> Executor lineage: `lineages/deepseek-flash-max`. Stop reason: max_iterations. Average newInfoRatio: 0.950.
> Deliverable synthesized deterministically from the per-iteration findings below; every claim keeps its original in-iteration SOURCE citation.

---

## Iteration Findings

The research built cumulatively; the final iteration is the ranked gap-mining synthesis. All iterations are included below as the evidence trail.

# Iteration 1: Fork recon — row rendering, record model, call sites, EuroFormat pattern

## Focus
Q1: Where exactly are table-row rendering and the record model in the fork, and which 1-3 call sites could mount the panel with EuroFormat-style isolation?

## Findings
1. **EuroFormat pattern confirmed as "pure module + 2 import sites".** `src/data/EuroFormat.ts` is a single self-contained module exporting pure formatting functions (`formatEuroNumber`, `formatEuroNumber2`, `formatEuroCurrency`); it is consumed at exactly two call sites: `src/views/CellRenderer.ts:13` (import) and `src/views/SummaryRenderer.ts:7` (import). No other edits are needed to activate it. This is the rebase-safe diff shape the plan.md §3 pattern refers to. [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/EuroFormat.ts:1-42, src/views/CellRenderer.ts:13, src/views/SummaryRenderer.ts:7]
2. **Row rendering pipeline:** `TableRenderer.renderTable` (`src/views/TableRenderer.ts:63`) → `renderRows` (line 436) → `renderRow` (line 450). Each row creates a `<tr data-note-database-row-path="{file.path}">` (lines 460-462) and immediately calls `this.actions.setupRow(tr, row, context)` (line 468) with `{visibleRows, groups}`. `setupRow` is the per-row extension seam already wired for row-menu attach. [SOURCE: src/views/TableRenderer.ts:450-471]
3. **The concrete call site for hover-open is `DatabaseView.setupRowInteractions`.** `DatabaseView.ts:585` wires `setupRow: (tr, row, context) => this.setupRowInteractions(tr, row, context)`, and the implementation (`src/views/DatabaseView.ts:7529-7531`) currently does exactly one thing: `this.rowMenu.attachToRow(tr, row, context)`. Adding hover-open wiring here = 1 call-site edit that covers every rendered table row, including grouped tables (same `renderRow` path). [SOURCE: src/views/DatabaseView.ts:585, 7529-7531]
4. **Record model is fully sufficient for a display-only panel.** `RowData` (`src/data/types.ts:113-119`) = `{ app?: App; file: TFile; frontmatter: Record<string, unknown>; cache?: CachedMetadata | null; computed: Record<string, unknown> }`. The panel can render header (icon + title) from `row.file` / `frontmatter`, properties from `frontmatter`, and display-only computed/rollup values from `row.computed` — zero persistence needed. [SOURCE: src/data/types.ts:113-119]
5. **Column model:** `ColumnDef` (`src/data/types.ts:47`) with `key`/`label`; `ViewConfig` (line 301) carries `hiddenColumns` (via `ViewModeStateDef.hiddenColumns`, line 165) — the existing hidden-column state is the natural basis for the panel's "hidden group" (anytype-style reveal), and `getVisibleColumns(config, rows)` (`TableRenderer.ts:24`) already computes the visible set. [SOURCE: src/data/types.ts:47, 164-172]
6. **Existing open path is navigation, not overlay:** `DatabaseView.openRow` (`src/views/DatabaseView.ts:7545-7548`) calls `this.dataSource.openNote(row.file)` — the panel's hover-open affordance must NOT reuse this; it must open the display-only overlay instead (keeps "without navigating away" REQ-002). [SOURCE: src/views/DatabaseView.ts:7545-7548]

## Sources Consulted
- /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/EuroFormat.ts (read)
- /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/TableRenderer.ts (read lines 19-54, 430-504; grep setupRow)
- /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/DatabaseView.ts (read 7529-7588; grep setupRow/renderRecordIcon)
- /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/data/types.ts (read 113-192)
- spec.md + plan.md of 014-record-detail-panel (read)

## Assessment
- newInfoRatio: 1.0 — first pass over the fork; all six findings are new to this packet.
- Confidence: high (direct file reads with line numbers; cross-checked call chain TableRenderer→DatabaseView).

## Reflection
- What worked: reading the render chain top-down (renderTable → renderRow → setupRow → setupRowInteractions) made the call-site question answer itself.
- What failed: nothing material.
- Ruled out: mounting the panel via `openRow` (navigates away — violates REQ-002); touching `CellRenderer` for hover chrome (row-level, better in setupRowInteractions).

## Recommended Next Focus
Q2: Anytype properties panel — grouped sections (header/hidden) components and reveal logic in `context/anytype-ts/src/ts`.

---

# Iteration 2: Anytype properties panel — grouped sections (header/hidden) + reveal logic

## Focus
Q2: How does Anytype's properties panel implement grouped sections (header/hidden) and in-panel reveal?

## Findings
1. **The three-group section model.** `SidebarPageObjectRelation.getSections()` (`context/anytype-ts/src/ts/component/sidebar/page/object/relation.tsx:19-49`) returns exactly three groups: `object` (featured relations from `type.recommendedFeaturedRelations` + recommended from `type.recommendedRelations`, no toggle, `withEmpty: true`), `hidden` (from `type.recommendedHiddenRelations`, `withToggle: true`, labeled via `translate('sidebarTypeRelationHidden')`), and `local` (per-object relations, `withToggle: true`). This is the direct precedent for the spec's "header group + hidden group": the header group = `object` section (featured first), the hidden group = collapsible `hidden` section. [SOURCE: context/anytype-ts/src/ts/component/sidebar/page/object/relation.tsx:26-48]
2. **Hidden-group filter skips empty readonly values.** Line 42: `hidden.filter(it => filterMapper(it) && !(it.isReadonlyValue && Relation.isEmpty(object[it.relationKey])))` — a readonly property with an empty value is not worth a hidden-group row. The hidden group only surfaces non-empty (or editable) properties. [SOURCE: relation.tsx:40-42]
3. **Collapse/reveal mechanics.** `onToggle` (`relation.tsx:141-154`): toggles `isOpen` classes on `.titleWrap`/`.list`, animates list height to `auto`/`0px` (lines 129-139), and persists the open state per page+group via `Storage.setToggle(page, id, !isOpen)`; on mount, `initToggle` reads `Storage.checkToggle(page, section.id)` (lines 158-166). Reveal state survives panel reopens. [SOURCE: relation.tsx:129-166]
4. **Per-property row reuses the grid Cell renderer.** `SidebarSectionObjectRelation` (`component/sidebar/section/object/relation.tsx:64-95`): each row = `.name` label + a `<Cell viewType={I.ViewType.Grid} readonly={!canEdit}>` — the same cell component the grid uses, with `idPrefix` for stable ids (`Relation.cellId(PREFIX, relationKey, rootId)`, line 52) and `Relation.formatValue(relation, value, true)` for display formatting (line 37). Panel property rows are therefore not a second rendering pipeline — they reuse the grid cell renderer with `readonly` set. [SOURCE: component/sidebar/section/object/relation.tsx:34-89]
5. **Edit gating via restriction flags.** `isReadonly = readonly || !S.Block.isAllowed(object.restrictions, [I.RestrictionObject.Details])` (`relation.tsx:12`); row-level `canEdit = !readonly && S.Block.checkFlags(rootId, rootId, [I.RestrictionObject.Details])` (`section/object/relation.tsx:57`). The display-only vs editable split is data-driven, not layout-driven. [SOURCE: component/sidebar/page/object/relation.tsx:12-14; component/sidebar/section/object/relation.tsx:56-58]
6. **Empty state is first-class.** Sections with `withEmpty: true` and zero children render `sidebarObjectRelationEmpty` (`relation.tsx:245-249`). [SOURCE: relation.tsx:244-249]
7. **Hover chrome precedent in the grid.** In the dataview grid, opening the "+" relation menu adds a `hover` class to the last column head on open and removes it on close (`component/block/dataview/view/grid.tsx:345-346`) — evidence that Anytype uses a class-driven hover affordance, consistent with a CSS-only hover affordance in the fork. [SOURCE: component/block/dataview/view/grid.tsx:344-347]

## Sources Consulted
- context/anytype-ts/src/ts/component/sidebar/page/object/relation.tsx (read full)
- context/anytype-ts/src/ts/component/sidebar/section/object/relation.tsx (read full)
- context/anytype-ts/src/ts/component/block/dataview/view/grid.tsx (read 300-360)
- context/anytype-ts/src/ts/component/menu/dataview/object/list.tsx + values.tsx (skimmed; ruled out as object-picker menus, not detail panel)

## Assessment
- newInfoRatio: 1.0 — first pass over Anytype source; all seven findings new to packet.
- Confidence: high (direct reads with line refs; the three-group model maps 1:1 to spec's header/hidden groups).

## Reflection
- What worked: following the right-sidebar section tree (right.tsx → page/object/relation.tsx → section/object/relation.tsx) located the panel; the group model is exactly the spec's target.
- What failed: initial greps for "properties"/"hidden" in dataview components missed the sidebar; the panel lives under sidebar/, not dataview/.
- Ruled out: `menu/dataview/object/*` (object-picker menus, not detail panel); `sidebar/preview.tsx` (layout preview, not properties).

## Recommended Next Focus
Q3: AppFlowy row detail — Rust grid model (row/property cells) + Flutter UI row open/hover behavior in `context/appflowy`.

---

# Iteration 3: AppFlowy row detail — Rust model + Flutter UI (overlay open, hidden fields, cell reuse)

## Focus
Q3: How does AppFlowy render row detail/properties in grid (Rust model + Flutter UI) and what hover affordances exist?

## Findings
1. **Row detail opens as an overlay ON TOP of the grid — no navigation.** `grid_page.dart` builds `RowDetailPage` inside `FlowyOverlay.show(context, builder: ...)` (lines 201-210), and again after row creation (244-255). This is the direct precedent for REQ-002 "opens the panel over the grid without navigating away". [SOURCE: context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/grid_page.dart:201-210, 244-255]
2. **Hidden-fields group is state-driven in the detail panel.** `RowDetailBloc` receives `(visibleCells, numHiddenFields)` from the cell-data stream (row_detail_bloc.dart:51); a toggle event flips `showHiddenFields` and recomputes the list (lines 76-90); cells are filtered with `if (!isHidden || state.showHiddenFields) visibleCells.add(cellContext)` (lines 139-140). [SOURCE: frontend/appflowy_flutter/lib/plugins/database/grid/application/row/row_detail_bloc.dart:51, 76-90, 139-140]
3. **The hidden-group toggle button is shown only when hidden fields exist.** `RowPropertyList` renders `ToggleHiddenFieldsVisibilityButton` in its footer when `state.numHiddenFields != 0` (row_property.dart:92-97) — a zero-cost empty-state guard. [SOURCE: frontend/appflowy_flutter/lib/plugins/database/widgets/row/row_property.dart:90-100]
4. **Detail property rows reuse the exact grid cell renderer with a style variant.** `_PropertyCell` builds cells via `widget.cellBuilder.buildStyled(cellContext, EditableCellStyle.desktopRowDetail)` (row_property.dart:133-135), while grid rows use `EditableCellStyle.desktopGrid` from the same builder (grid/presentation/widgets/row/row.dart:276). One `EditableCellBuilder`, two style enums — same pattern as Anytype's Cell reuse, and the strongest cross-peer signal that the fork's panel should reuse its existing cell rendering. [SOURCE: widgets/row/row_property.dart:133-135; grid/presentation/widgets/row/row.dart:274-276]
5. **Grid hover-open affordance = expand accessory on the primary (first) column cell.** Grid rows attach `PrimaryCellAccessory(onTap: onExpand, isCellEditing: ...)` to the first field's `CellContainer` (row.dart:284-293). The affordance is a cell-level accessory on the primary column — analogous to Notion's row-hover "Open" affordance and a concrete placement precedent for the fork. [SOURCE: grid/presentation/widgets/row/row.dart:282-293]
6. **Rust-side row model.** `RowMetaPB` (`flowy-database2/src/entities/row_entities.rs:57-70`) = `{id, document_id, icon, is_document_empty, attachment_count, cover}` — the row header data the panel renders (icon/cover/document presence), while cell values resolve per field through `RowController`/cell builder. [SOURCE: frontend/rust-lib/flowy-database2/src/entities/row_entities.rs:57-70]
7. **Desktop vs mobile split.** Desktop uses the overlay `RowDetailPage`; mobile routes to a full-page `MobileRowDetailPage` (mobile_grid_page.dart:138-141). Platform-aware presentation is the norm — supports the fork's mobile tap-fallback requirement (REQ-005). [SOURCE: grid/presentation/mobile_grid_page.dart:136-141]

## Sources Consulted
- context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/grid_page.dart (read 190-255)
- context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/application/row/row_detail_bloc.dart (grep showHiddenFields/visibleCells)
- context/appflowy/frontend/appflowy_flutter/lib/plugins/database/widgets/row/row_property.dart (read 1-140)
- context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/widgets/row/row.dart (read 270-300)
- context/appflowy/frontend/rust-lib/flowy-database2/src/entities/row_entities.rs (read 50-90)
- context/appflowy/frontend/appflowy_flutter/lib/plugins/database/grid/presentation/mobile_grid_page.dart (grep)

## Assessment
- newInfoRatio: 1.0 — first pass over AppFlowy source; all seven findings new to packet.
- Confidence: high (direct reads; overlay open and hidden-field toggle are file:line-verified).

## Reflection
- What worked: targeting `widgets/row/row_property.dart` + `row_detail_bloc.dart` directly — AppFlowy names its files by concept.
- What failed: no double-tap open handler found in grid cell builder (open is via primary-cell expand accessory + row actions); not needed for the finding.
- Ruled out: mobile full-page route as the desktop pattern (desktop uses overlay; fork targets desktop grid + touch fallback, so overlay + tap affordance is the applicable pattern).

## Recommended Next Focus
Q4: Notion record-detail panel + hover-open behavior — WebFetch Notion docs/help and community breakdowns of the properties panel groups (header/hidden), row-hover affordance, keyboard path, and viewport behavior.

---

# Iteration 4: Notion record-detail panel + hover-open behavior (official docs)

## Focus
Q4: What is Notion's actual record-detail panel + hover-open interaction (properties groups, affordance placement, keyboard, viewport)?

## Findings
1. **Notion's hover-open affordance is an "OPEN" button revealed on hover over the Name (title) column cell.** Official help: "To open a row as a page, hover over a cell in the `Name` column and click `OPEN`." The affordance is per-row, placed in the title column, revealed by hover — the exact chrome the spec's REQ-002 wants. [SOURCE: https://www.notion.com/help/create-a-database — "Open a row as a page" section]
2. **Three open-modes exist, configured per view.** "Open pages in": (a) **Side peek** — panel on the right side while the rest of the database stays interactive; (b) **Center peek** — focused center modal; (c) **Full page** — navigation. Table, Board, List & Timeline default to **Side peek**; Gallery & Calendar default to Center peek. For a table-focused fork, side-peek (right-side panel over/next to the grid, grid remains interactive) is Notion's default and the parity target. [SOURCE: https://www.notion.com/en-gb/help/views-filters-and-sorts — "Open pages in" section]
3. **Property visibility is per-view.** "Property visibility: Show or hide database properties for each view" — hidden properties are a view-level concept, not a page-level one; the fork's `ViewModeStateDef.hiddenColumns` matches this exactly. [SOURCE: https://www.notion.com/en-gb/help/views-filters-and-sorts — "View settings" section]
4. **Properties group into a "Property group" module, with pinned-to-heading and hidden-properties behavior.** From the layouts help: all properties display in the Property group to start; pinning a property to the Heading or moving it into another module removes it from the Property group; property search "works across collapsed sections and hidden properties too"; the details panel on the right can be opened/closed and accepts property groups or individual properties. This is Notion's current layout-model equivalent of the fork's "header group + hidden group". [SOURCE: https://www.notion.com/en-gb/help/layouts — "Property group"/"Details panel" sections]
5. **Row-hover reveals per-property actions.** In table view, hovering a property cell reveals a `💬` (comment) affordance, and hovering the property name row reveals `⋮⋮`; row hover also reveals a leading checkbox and drag handle. Hover-reveal of row-level chrome is pervasive in Notion tables. [SOURCE: https://www.notion.com/help/database-properties — "Hide or show properties"/"Comment" sections; https://www.notion.com/help/tables — row-hover checkbox/drag]

## Sources Consulted
- WebFetch https://www.notion.com/help/create-a-database (official help; "Open a row as a page")
- WebFetch https://www.notion.com/en-gb/help/views-filters-and-sorts (official help; "Open pages in", "View settings")
- WebFetch https://www.notion.com/en-gb/help/layouts (official help; Property group / Details panel) — via search snippet + fetch
- WebFetch https://www.notion.com/help/database-properties, https://www.notion.com/help/tables (search-result snippets of official help)

## Assessment
- newInfoRatio: 1.0 — first Notion pass in this packet; all five findings new.
- Confidence: high for findings 1-3 (fetched pages verbatim); moderate for 4-5 (official pages, partly via search snippets of the same help center).

## Reflection
- What worked: fetching two canonical help pages (create-a-database + views-filters-and-sorts) covered affordance placement AND open-modes.
- What failed: the layouts page fetch returned the details-panel behavior only partially in the first fetch; enough was captured via the search-result excerpt plus the main fetch.
- Ruled out: treating "Full page" as the fork's target (it is navigation; REQ-002 forbids it); keyboard specifics were not documented in these pages (deferred to Q5 keyboard-open requirement).

## Recommended Next Focus
Q5a: GoodBases hover-open chrome + the toolbar-restyle trap (web research) — the spec names GoodBases as the hover-open source and the restyle-revert trap.

---

# Iteration 5: GoodBases hover-open chrome + page panel (source-grounded)

## Focus
Q5a: GoodBases hover-open chrome, page panel implementation, and the toolbar-restyle trap.

## Findings
1. **OPEN button placement: title cell, revealed on row hover.** `NotionTableView.renderRow` builds the title cell `td.ntn-col-title` with `div.ntn-title-wrap` containing page icon, title span, and `span.ntn-open-btn` with text "OPEN". The button's click handler branches on the `openMode` view option: `'panel'` → `this.openPagePanel(entry.file)`, otherwise `openLinkText(..., true)` (new tab). Hover-reveal is CSS-driven (`.ntn-open-btn` inside the row). This is the closest public implementation of the spec's REQ-002 chrome and matches Notion's "hover the Name cell → OPEN". [SOURCE: https://raw.githubusercontent.com/FrancescoUmberto/GoodBases/main/src/view/notion-table-view.ts — renderRow]
2. **"Open notes in" is a per-view option, default new-tab.** `this.config.get('openMode')` — the view option decides where OPEN goes; the page panel is opt-in. For the fork, the panel is the whole point (REQ-002), so the fork's affordance should default to the panel, with the tab route as the secondary (spec keeps ≤3 call sites; no option plumbing needed in v1). [SOURCE: notion-table-view.ts openBtn handler]
3. **Page panel = centered Obsidian `Modal`.** `NotePageModal extends Modal` (`note-modal.ts`), classes `ntn-page-modal`/`ntn-page-content`. Centered Notion-style peek: editable `h1` title (`contenteditable plaintext-only`, Enter → move to body, blur → commitTitle rename), property rows below, body as rendered markdown preview ↔ textarea. [SOURCE: https://raw.githubusercontent.com/FrancescoUmberto/GoodBases/main/src/view/note-modal.ts — buildPanel]
4. **Panel property rows re-read from disk after each write.** `refreshProperties()` re-reads the file and rebuilds rows — a "file is the source of truth" model. The fork's display-only panel can be even simpler: read `row.frontmatter`/`row.computed` directly, no re-read needed (no writes). [SOURCE: note-modal.ts — refreshProperties]
5. **Empty properties are hidden via CSS.** "Properties (hidden via CSS while empty)" — `ntn-page-props` renders only when frontmatter has keys. Clean zero-property state without special-casing. [SOURCE: note-modal.ts — buildPanel comment]
6. **Keyboard paths exist in the panel.** Enter on title → body editing; open-in-new-tab button handles Enter/Space keydown. Evidence that panel keyboard navigation is expected (feeds the fork's keyboard-open requirement in spec §8). [SOURCE: note-modal.ts — pageTitleEl keydown; openTabBtn keydown]
7. **The toolbar trap is behavioral AND visual.** GoodBases reroutes the core toolbar's New button at runtime (`patchToolbarNew()`, `newButtonPatched`) so + New opens the panel — a behavioral patch of core chrome; per spec.md, the earlier CSS restyle of the toolbar had to be reverted. The fork's constraint (zero toolbar selectors, panel-scoped CSS) is therefore the correct boundary; behavioral rerouting of core toolbar buttons is likewise out of scope (REQ-003). [SOURCE: notion-table-view.ts — patchToolbarNew/constructor; spec.md §3]
8. **Re-render model is simple: full rebuild per update.** `onDataUpdated()` empties the root and rebuilds the table. For a display-only panel in the fork, re-render-on-refresh is trivially cheap and avoids diffing. [SOURCE: notion-table-view.ts — onDataUpdated]

## Sources Consulted
- WebFetch raw.githubusercontent.com/FrancescoUmberto/GoodBases/main/src/view/notion-table-view.ts
- WebFetch raw.githubusercontent.com/FrancescoUmberto/GoodBases/main/src/view/note-modal.ts
- Web search: GoodBases landing page, Obsidian plugin listing, GitHub README + 0.4.5...0.5.0 diff (styles.css +183, note-modal.ts added +385)

## Assessment
- newInfoRatio: 1.0 — first GoodBases pass; all eight findings new.
- Confidence: high (raw source fetched; only hover-reveal CSS selector inference is indirect — the `ntn-open-btn` class name and Notion parity statement make it near-certain, and styles.css diff confirms panel CSS volume).

## Reflection
- What worked: fetching the two raw source files directly — implementation-level facts without clone.
- What failed: nothing material.
- Ruled out: adopting GoodBases' write-through property editing (fork is display-only by spec); patching the core toolbar New button (REQ-003 boundary).

## Recommended Next Focus
Q5b: Edge cases + mobile/iCloud safety — viewport clamping, keyboard-open, empty state, scroll, touch fallback, display-only guarantee; ground in the fork's existing mobile handling (`isPhoneLayout`, `MobileMoveIcon`) and Obsidian platform APIs.

---

# Iteration 6: Edge cases + mobile/iCloud safety (grounded in fork + peers)

## Focus
Q5b: Viewport clamping, keyboard-open, empty state, scroll, touch fallback, display-only guarantee.

## Findings
1. **Mobile detection already exists in the fork: `isPhoneLayout()`.** Both `TableRenderer.ts:759-761` and `DatabaseView.ts:4254` implement `window.activeDocument.body.classList.contains("is-phone")`. The panel's touch fallback should reuse this exact check (or CSS `@media (hover: none)` as a complement) instead of inventing a new heuristic. [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/src/views/TableRenderer.ts:759-761; views/DatabaseView.ts:4254]
2. **Phone-only chrome precedent.** `renderMobileMoveButton` renders the `MobileMoveIcon` caret only when `isPhoneLayout()` (TableRenderer.ts:478-480) — the fork already conditionally adds touch UI. A tap-to-open affordance can follow the same pattern: show a persistent open control in phone layout (hover cannot exist), hover-reveal on desktop. [SOURCE: views/TableRenderer.ts:478-480; views/MobileMoveIcon.ts]
3. **Display-only boundary is enforceable by construction.** `DataSource` write surface = `mutateFrontmatter` (:288), `updateFrontmatter` (:314), `createNote` (:328), `duplicateNote` (:360), `trashNote` (:389), `renameNote` (:409), `updateViewDefFile` (:991) — every one is invoked only from explicit user-action paths. The panel module should import nothing from `DataSource` and read only the already-hydrated `RowData` (frontmatter/computed). Zero write surface ⇒ iCloud-safe (NFR-R01, REQ-005). [SOURCE: src/data/DataSource.ts:288,314,328,360,389,409,991]
4. **Value access seam for the panel: `getColumnValue(row, col)`.** `data/ColumnDisplay.ts:63` already resolves a row's value for any column (incl. computed/rollup display values). The panel renders each property through this function — one value-resolution path for grid cells and panel rows, mirroring AppFlowy's single `EditableCellBuilder`/Anytype's `Cell` reuse. [SOURCE: src/data/ColumnDisplay.ts:63]
5. **Hidden-group source: `hiddenColumns` + `getVisibleColumns`.** `ViewModeStateDef.hiddenColumns` (`data/types.ts:165`) is the persisted per-view hidden set; `TableRendererActions.getVisibleColumns(config, rows)` (TableRenderer.ts:24, invoked at :67/:101) computes the visible set. The panel's hidden group = `config.columns − visibleColumns`, exactly Notion's per-view "Property visibility" model (iter 4 finding 3). [SOURCE: src/data/types.ts:164-172; src/views/TableRenderer.ts:24]
6. **No existing overlay/positioning util in the fork.** `FieldTooltip.ts` is only a `title`-attribute helper (23 lines) — there is no popover engine to reuse, so the panel needs its own position/clamp logic. Peers diverge: GoodBases uses a centered `Modal` (browser-managed); AppFlowy's overlay is centered via `FlowyOverlay`. For the fork's side-peek (Notion default, iter 4), clamp = `getBoundingClientRect()` of the row + fixed positioning, flip side at viewport edge (spec §8). [SOURCE: src/views/FieldTooltip.ts:1-23; iter 4/5 findings]
7. **Empty-state patterns across peers differ.** GoodBases hides empty props via CSS (clean, but zero info); Anytype renders `withEmpty` text (sidebarObjectRelationEmpty); AppFlowy hides the hidden-fields toggle when `numHiddenFields == 0`. For the fork: zero-property record → single muted "No properties" row (spec: "clean empty state, not a broken layout"); hidden group reveal button only when hidden properties exist (AppFlowy rule). [SOURCE: iter 2 finding 6; iter 3 finding 3; iter 5 finding 5]
8. **Keyboard model: reuse the roving-tabindex discipline.** TableRenderer keeps the spreadsheet roving tabindex authoritative ("the gutter is clickable, but must not become an extra Tab stop", TableRenderer.ts:491-493). The panel must: Esc closes (modal convention), focus returns to the originating row, and the keyboard-open path uses a distinct binding — Enter is taken by inline edit, so e.g. Mod+Enter on a focused cell, or a row context-menu entry; GoodBases shows panel-internal keys (Enter on title → body) as the in-panel norm. [SOURCE: src/views/TableRenderer.ts:489-494; iter 5 finding 6]

## Sources Consulted
- Fork: views/TableRenderer.ts (isPhoneLayout, renderRows 436-504), views/DatabaseView.ts (isPhoneLayout:4254), views/FieldTooltip.ts, views/MobileMoveIcon.ts, data/DataSource.ts (method inventory), data/ColumnDisplay.ts:63, data/types.ts:164-172
- Prior iterations 2-5 (peer patterns)

## Assessment
- newInfoRatio: 0.9 — edge cases are partially enumerated in spec §8, but the fork-grounded mechanisms (isPhoneLayout, DataSource write inventory, getColumnValue, hiddenColumns plumbing, absence of a popover util) are new.
- Confidence: high (all fork facts file:line-verified).

## Reflection
- What worked: inventorying DataSource write methods made the iCloud-safety claim a checkable negative ("panel imports nothing from DataSource").
- What failed: nothing material.
- Ruled out: building a generic popover engine (out of scope; one panel only); title-attribute tooltip as the panel mechanism (FieldTooltip pattern is for single-value hints, not a panel).

## Recommended Next Focus
Q6 (new): Core logic + algorithm design for the RecordDetailPanel module — open/close state machine, data flow from RowData, hidden-group computation, header group definition, and CSS scoping strategy with Obsidian theme variables.

---

# Iteration 7: Core logic + algorithm design for the RecordDetailPanel module

## Focus
Q6 (new): Open/close state machine, data flow, hidden-group computation, module API shape, CSS scoping — grounded in fork seams.

## Findings
1. **The hover-reveal CSS idiom already exists in the fork.** `styles.css:770`: `.note-database-container .db-heading-row:hover .db-heading-more-button { opacity: 1; }` — the OPEN affordance should reuse this exact idiom: button default `opacity: 0`, row hover → `opacity: 1`. No new interaction primitive needed. [SOURCE: /Users/michelkerkmeester/MEGA/Development/Obsidian Plugin/styles.css:770]
2. **CSS scoping discipline is root-prefixed + variable-driven.** All fork styles hang off `.note-database-container` (e.g., styles.css:4032 `.note-database-container .db-table-wrap`); the stylesheet documents the allowed theme variables (`var(--background-primary)`, `var(--background-secondary)`, `var(--background-modifier-border)`, styles.css:27-38). Panel CSS: same root prefix + same variable set ⇒ toolbar selectors are structurally excluded (the Obsidian toolbar lives outside `.note-database-container`), satisfying REQ-003 by construction. [SOURCE: styles.css:27-38, 4032]
3. **A native hover-preview integration already exists — the panel must coexist with it, not fight it.** `HoverLinkPreview.ts` marks elements with `data-note-database-hover-link` and delegates to Obsidian's Page Preview via `app.workspace.trigger("hover-link", ...)` (lines 23-47). The panel's OPEN button must be a plain `<span>`/`<button>` NOT carrying that attribute, so Obsidian's hover system never intercepts it; conversely the panel is the *explicit* affordance while Page Preview remains the modifier-driven implicit one. [SOURCE: src/views/HoverLinkPreview.ts:4-47]
4. **Panel state machine (evidence-derived).** States: `closed → armed (hover/tap shows affordance) → open (panel mounted) → closed`. Anytype precedent: hover class added on open, removed on close (grid.tsx:345-346); GoodBases: `openMode` branch at click (notion-table-view.ts openBtn); AppFlowy: `openRowDetail` state flag in GridBloc (grid_page.dart:233). The fork's panel module owns this machine locally (a simple `openRecordDetailPanel(row, config)` + `close()` pair); no global state. [SOURCE: iter 2/3/5 findings; fork seams]
5. **Data flow is a straight line from existing seams.** `setupRowInteractions(tr, row, context)` (DatabaseView.ts:7529) receives the hydrated `RowData`; panel builds: header group = title (`row.file.basename`) + record icon (reuse `renderRecordIcon`, RecordIconRenderer.ts:18, already used at DatabaseView.ts:4642) + visible properties from `getColumnValue(row, col)` (ColumnDisplay.ts:63); hidden group = `config.columns − getVisibleColumns(config, rows)` (TableRenderer.ts:24); values rendered with existing stringify helpers — zero new value-formatting code. [SOURCE: src/views/DatabaseView.ts:7529-7531; src/data/ColumnDisplay.ts:63; src/views/RecordIconRenderer.ts:18]
6. **Render strategy: full rebuild per open/refresh.** GoodBases rebuilds its table wholesale per update (onDataUpdated); display-only panel re-rendering on refresh is trivially cheap and keeps the module pure. [SOURCE: iter 5 finding 8]
7. **Module API shape (EuroFormat-style).** `src/data/RecordDetailPanel.ts` exports pure functions: `attachRowOpenAffordance(tr, row, deps)` (binds mouseenter/tap; inserts the OPEN span into the title cell) and `openRecordDetailPanel(anchor: HTMLElement, row: RowData, config: ViewConfig, container: HTMLElement)` (mounts/clamps the overlay; Esc/keyboard handled internally). Call-site budget: (1) `setupRowInteractions` — affordance attach; (2) `main.ts` — register the extra CSS file (or append to styles.css); (3) container reference (the view's `.note-database-container`). ≤3 edits, same shape as EuroFormat's 2 imports. [SOURCE: iter 1 finding 2; plan.md §3]
8. **Hidden-group reveal = CSS-only collapse.** Anytype animates list height to `auto`/`0px` + `isOpen` classes (relation.tsx:129-139); the fork can do the same with a class toggle — no JS animation code. [SOURCE: iter 2 finding 3]

## Sources Consulted
- Fork: styles.css (lines 27-38, 770, 4032), src/views/HoverLinkPreview.ts (full), src/views/DatabaseView.ts:7529-7531, 4642, src/data/ColumnDisplay.ts:63, src/views/RecordIconRenderer.ts:18, src/main.ts (imports), package.json (esbuild bundling)
- Prior iterations 1-6

## Assessment
- newInfoRatio: 1.0 — the HoverLinkPreview coexistence constraint, the styles.css:770 idiom, and the scoping-by-construction argument are new; the rest is synthesis over verified seams.
- Confidence: high (all fork facts file:line-verified; only the final call-site count is a build-time decision, flagged as such).

## Reflection
- What worked: reading styles.css hover rules and HoverLinkPreview turned two spec risks (toolbar trap, hover conflicts) into construction-level guarantees.
- What failed: nothing material.
- Ruled out: building a new hover system (Obsidian Page Preview already exists; fork already integrates); JS-driven collapse animation (CSS class toggle suffices); reusing `openRow` (navigation, iter 1).

## Recommended Next Focus
Q7 (new): Accessibility + keyboard + focus management and panel anatomy — roving tabindex, Esc/Enter bindings, focus return, and the a11y attributes the panel needs (role="dialog", aria-modal), grounded in the fork's existing keyboard model.

---

# Iteration 8: Accessibility, keyboard + focus management, panel anatomy

## Focus
Q7 (new): Keyboard-open/close bindings, focus management, panel anatomy — grounded in the fork's keyboard model.

## Findings
1. **Roving-tabindex grid is the keyboard context.** Cells are `td[data-note-database-row-path][data-note-database-column-key][tabindex="0"]` (DatabaseView.ts:4197), with focus-movement selectors built from row path + column key (1662, 1719, 1744) and tabindex parity maintenance (4812). Any panel keyboard-open binding operates on the focused cell; focus-return after close is addressable with the exact same selector. [SOURCE: src/views/DatabaseView.ts:4197, 1662, 4812]
2. **Esc is handled via Obsidian `Scope` for the inline editor.** `this.scope.register([], "Escape", (event) => this.handleInlineEditorEscape(event))` (DatabaseView.ts:1213; handler at 1351). The panel must follow the same pattern — its own `Scope` entry while open — so it never conflicts with the grid's existing Esc handling (inline-edit cancel, selection clear at 1425). [SOURCE: src/views/DatabaseView.ts:1213, 1351, 1425]
3. **Shortcuts are physical-key guarded.** `physicalShortcutGuard.handleKeyDown/handleKeyUp` on window keydown/keyup capture (DatabaseView.ts:1191-1192) — the fork's existing mechanism for platform-correct modifiers (Cmd on mac vs Ctrl elsewhere). The panel's keyboard-open shortcut (e.g., Mod+Enter on a focused cell) must route through the same guard, not a fresh keydown handler. [SOURCE: src/views/DatabaseView.ts:1191-1192]
4. **Panel anatomy should be a side-peek, not an Obsidian `Modal`.** Notion's table default is Side peek with the rest of the database remaining interactive (iter 4 finding 2). GoodBases' `Modal`-based panel is centered and (by Modal semantics) blocks outside interaction — a parity mismatch for tables. Recommendation: in-view side panel (fixed/absolute within `.note-database-container`), grid remains interactive on the left; Esc closes; focus returns to the originating cell. Modal is only acceptable if side-peek proves too invasive at build time. [SOURCE: iter 4 finding 2; iter 5 finding 3; fork styles.css:4032 container]
5. **A11y contract for the panel.** `role="dialog"` + `aria-label` (record name) + `aria-modal` only if the panel traps focus; otherwise `aria-modal="false"` and a plain `role="region"`. The OPEN affordance must be a real `<button>` (not a span) for keyboard activation and screen-reader announcement — GoodBases' span-with-click (notion-table-view.ts openBtn) is the anti-pattern to improve on; the fork's own icon buttons (`db-icon-only-button`, styles.css:370) show the button convention. [SOURCE: iter 5 finding 1; styles.css:370]
6. **Focus trap vs return.** For a side-peek that keeps the grid interactive, no full trap: Tab moves into the panel once, Tab cycles panel controls, Esc returns focus to the originating cell via the row-path+column-key selector (finding 1). If hidden-group reveal is open, focus moves into the revealed rows in order (natural Tab order once rendered). [SOURCE: finding 1; iter 2 finding 3 (hidden group ordering)]
7. **Empty-state a11y.** A zero-property record renders a muted "No properties" row — as a `div` with `aria-hidden`-safe styling (visual only; screen readers get the title and body context). Peers hide empty props entirely (GoodBases CSS) or render empty text (Anytype) — the fork's muted-row choice keeps a visual anchor without noise. [SOURCE: iter 6 finding 7]
8. **Long values wrap; panel scrolls.** Text values wrap within the panel (no truncation per spec §8); the panel container scrolls when hidden-group content overflows (AppFlowy body auto-size + panel scroll precedent, note-modal.ts autoSizeBody). No horizontal scroll inside the panel. [SOURCE: iter 3/5 findings; spec §8]

## Sources Consulted
- Fork: views/DatabaseView.ts (1191-1213, 1351, 1425, 1662, 4197, 4812), styles.css:370, 4032
- Prior iterations 2-6

## Assessment
- newInfoRatio: 1.0 — keyboard-model facts (Scope Esc, physicalShortcutGuard, roving selector) and the side-peek-vs-Modal anatomy decision are new.
- Confidence: high on fork facts; the side-peek recommendation is a judgment call grounded in Notion's documented default (flagged as recommendation, not fact).

## Reflection
- What worked: tracing the fork's three keyboard mechanisms (roving tabindex, Scope Esc, physicalShortcutGuard) gave concrete reuse targets.
- What failed: nothing material.
- Ruled out: Obsidian `Modal` as the panel base (blocks grid interactivity — parity mismatch with side peek); a global keydown handler for panel Esc (fork owns window keydown via scope/guard).

## Recommended Next Focus
Q8 (new): Ranked synthesis prep — verify the 008 research baseline's prior UX findings, check the Anytype/AppFlowy hover-card or row-hover affordance details not yet mined (Anytype record row hover actions), then close remaining gaps for the ranked enrichment.

---

# Iteration 9: Baseline alignment + affordance-placement triangulation

## Focus
Q8 (new): Verify the 008 research baseline guidance; triangulate hover-open affordance placement across all four references.

## Findings
1. **The 008 baseline already scoped this phase exactly as mined.** Ranked backlog item 14: "Detail-panel sections / hover OPEN | 1 | S | CSS/IA" (research.md:173) and §10 UI/UX: "Anytype: Properties Panel sections (header/hidden) → small RecordDetailPanel IA" (:148); "GoodBases: steal hover-OPEN chrome if missing; **do not restyle core Obsidian toolbar** (GoodBases had to revert that)" (:146); "Notion / this fork: EuroFormat nl-NL at two call sites is the number feel to protect on rebase" (:149). Every iteration of this lineage confirmed those lines against source. [SOURCE: specs/obsidian/001-notion-finance-migration/008-note-db-notion-parity/research/research.md:146-149, 173]
2. **Affordance placement triangulates on the first column.** Notion: "hover over a cell in the `Name` column and click `OPEN`" (iter 4 finding 1); GoodBases: OPEN span inside the title cell `.ntn-title-wrap` (iter 5 finding 1); AppFlowy: `PrimaryCellAccessory(onTap: onExpand)` attached to the first field's cell (iter 3 finding 5). Three independent implementations place the open affordance in the title/first-column cell — the fork should do the same (the title cell is `td.db-col-title`-style, and `renderRow` already builds it). [SOURCE: iter 3/4/5 findings]
3. **Anytype is the outlier: no hover-OPEN button.** Anytype's grid reveals `.cellKeyHover`/`hover` classes only for column-add chrome (grid.tsx:306, 345-346); opening a row is implicit (click on the name cell). The explicit hover-revealed OPEN button is the Notion/GoodBases pattern the spec targets — confirming the spec's choice, not anytype's. [SOURCE: context/anytype-ts/src/ts/component/block/dataview/view/grid.tsx:306, 344-347]
4. **Hidden-group visibility rule triangulates too.** Anytype: hidden section rendered from `recommendedHiddenRelations`, filtered to non-empty (relation.tsx:40-42); AppFlowy: hidden toggle rendered only when `numHiddenFields != 0` (row_property.dart:92-97); Notion: property visibility is per-view (iter 4 finding 3). Consistent rule for the fork: the hidden group lists the view's hidden properties; the reveal control shows only when that set is non-empty; empty-valued hidden properties may be omitted. [SOURCE: iter 2 finding 2; iter 3 finding 3; iter 4 finding 3]
5. **Rebase-safety claim is now checkable.** 008 says EuroFormat = two call sites to protect (:149); the panel's call-site budget (≤3: setupRowInteractions, CSS registration, container ref) stays within the spec's SC-002 and matches the established rebase pattern. [SOURCE: research.md:149; spec.md SC-002]
6. **Panel value rendering: no new formatting code.** The fork's value helpers (`getColumnValue` ColumnDisplay.ts:63, `stringifyValue` Stringify.ts, `formatFieldTooltipValue` FieldTooltip.ts:5) cover all display types the panel needs; computed/rollup values are already in `row.computed` (display-only, iCloud-safe). [SOURCE: iter 1 finding 4; iter 6 finding 4]

## Sources Consulted
- specs/obsidian/001-notion-finance-migration/008-note-db-notion-parity/research/research.md (read 120-179)
- context/anytype-ts/src/ts/component/block/dataview/view/grid.tsx (grep hover/open)
- Prior iterations 1-8

## Assessment
- newInfoRatio: 1.0 — the triangulation result (first-column placement across 3 impls) and the Anytype outlier finding are new; baseline alignment is verification.
- Confidence: high.

## Reflection
- What worked: testing the 008 baseline claims against source rather than trusting them — they held, which strengthens the final synthesis.
- What failed: nothing material.
- Ruled out: following Anytype's implicit-open model (spec explicitly wants the hover affordance); adding panel-specific value formatters (existing helpers suffice).

## Recommended Next Focus
Q9 (final): Ranked enrichment synthesis — assemble the ranked recommendation list (panel IA, hover chrome, module shape, edge cases, mobile/iCloud) with evidence citations, and identify open gaps for phase synthesis.

---

# Iteration 10: Final gap-close + ranked enrichment preview

## Focus
Q9 (final): Close the last insertion-point gap; assemble the ranked enrichment.

## Findings
1. **The exact insertion target for the OPEN affordance is `db-title-cell`.** `CellRenderer.ts:118` adds `db-title-cell` to the title cell of each row — the fork's equivalent of Notion's Name cell / GoodBases' `.ntn-col-title` / AppFlowy's primary cell. `setupRowInteractions` (DatabaseView.ts:7529) can locate it per row via `tr.querySelector(".db-title-cell")` — so the entire hover-open wiring is: 1 edit in `setupRowInteractions` (attach affordance + tap fallback), 1 new module under `src/data/`, 1 CSS file registration (main.ts import) = 3 call sites, within SC-002's ≤3. [SOURCE: src/views/CellRenderer.ts:118; src/views/DatabaseView.ts:7529-7531]
2. **Header group = title + icon + visible columns; hidden group = hiddenColumns.** Panel header renders `row.file.basename` + `renderRecordIcon` (reuse, RecordIconRenderer.ts:18) + visible properties (`getColumnValue` over `getVisibleColumns`); hidden group = `config.columns − visible`, reveal via class-toggle collapse. All data is already hydrated in `RowData`; zero DataSource imports. [SOURCE: iter 1/6/7 findings]
3. **Ranked enrichment (final deliverable preview).** (a) Panel IA: header group + collapsible hidden group, Anytype three-group model simplified to two (fork has no per-object local relations); (b) hover chrome: OPEN button in `db-title-cell`, opacity idiom from styles.css:770, tap fallback via `isPhoneLayout`; (c) module: `src/data/RecordDetailPanel.ts` pure functions + scoped CSS under `.note-database-container` using theme variables only; (d) edge cases: viewport clamp with side-flip, empty-state muted row, panel scroll for long hidden lists, Mod+Enter keyboard-open via physicalShortcutGuard, Esc via Scope, focus return to originating cell; (e) iCloud: display-only by construction (no DataSource imports; rollups stay display-only per spec). [SOURCE: all prior iterations]
4. **Verification checklist for the build phase.** Typecheck via fork's own `npm run build`/esbuild (package.json:8); diff audit: grep for `.db-title-cell`/`note-database-container` additions, zero toolbar selectors (structural via root prefix); manual desktop + mobile pass (hover, tap, hidden reveal, empty state, viewport edge, keyboard). [SOURCE: package.json:7-8; spec.md SC-001..004]

## Sources Consulted
- Fork: src/views/CellRenderer.ts:118, src/views/DatabaseView.ts:7529, package.json:7-8
- All prior iterations 1-9

## Assessment
- newInfoRatio: 0.6 — `db-title-cell` is new evidence; the ranked enrichment is synthesis over confirmed findings (partially new as an assembled artifact).
- Confidence: high.

## Reflection
- What worked: the insertion-point question (which element hosts the OPEN button) resolved cleanly against `db-title-cell`.
- What failed: nothing material.
- Ruled out: (nothing new beyond prior iterations)

## Recommended Next Focus
Phase synthesis: compile research.md (17-section), resource-map.md, convergence report; mark config complete.

---
