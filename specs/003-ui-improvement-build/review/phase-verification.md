# Grok 4.6 xhigh Phase Verification (cli-cursor, read-only)

- Date: 2026-08-27 · Executor: cursor-grok-4.6-xhigh --mode ask
- Scope: 8 authored phases vs the two-track research synthesis and the real code.

The plans are executable in outline — every Top-10 item has a home, and a large share of `file:line` pins match real code — but they are not safe to execute as written. Wrong call sites, duplicated ownership, and a dropped quick win would send implementers into the wrong functions or into merge collisions.

---

## 1. CORRECTNESS

Many high-value pins are accurate. These match the claimed code:

| Claim | Evidence |
|---|---|
| 5s idle auto-close | `src/views/PopoverAutoClose.ts:12` (`delayMs ?? 5000`), timer at `:71-79` |
| Dark status tokens, no dark overrides | `styles.css:85-116`; `.theme-dark` only tweaks `--db-current-time-lightness` at `:132-134` |
| `*:focus { outline: none }` | `styles.css:198-200` |
| Nested grouped tables | `src/views/TableRenderer.ts:157-166` (`renderHeader` per group) |
| Grouped empty wipes the table | `:98-104` |
| `"⋮⋮"` no-op click | `:647-657` |
| Board/Gallery/List `openNote` | `src/views/DatabaseView.ts:615`, `:646`, `:674` |
| `getVisibleColumns` auto-hides empty cols | `src/data/ColumnConfig.ts:92-113` |
| `padding-right: 32px` hover jitter | `styles.css:4165-4168` |
| 28px toolbar / 22px column trigger | `styles.css:1324`, `:4182-4187` |
| Nested `button > button` in DB switcher | `src/views/ToolbarRenderer.ts:436-449` |
| `sortByColumn` replaces the sort stack | `src/views/DatabaseView.ts:10220-10236` |
| `estimateAutoColumnWidth` exists, unwired to dblclick | `src/views/ColumnWidth.ts:39-61` vs `ColumnHeaderController.ts:49+` |
| Relation pills hardcode `file-text` | `src/views/RelationValueRenderer.ts:24-25` |
| Formula errors swallowed to `null` | `src/data/ComputedEvaluator.ts:68-72` |
| Cover images are frontmatter-only | `src/data/CoverImage.ts:52-61` |
| Nested Kanban subgroups | `src/views/BoardRenderer.ts:353-358` |
| Embed keyboard is copy/Escape only | `src/views/EmbeddedDatabaseRenderer.ts:3425-3439` |
| Hover shortcut steal | `src/views/DatabaseView.ts:1437` (`matches(":hover")`) |
| RangeSelection path in research/plans | **wrong folder** (see below) |

### Wrong, stale, or nonexistent citations

**P1 — `src/views/RangeSelection.ts` does not exist.** Phase 002 spec/plan/tasks (`002-table-grid-experience/spec.md:105`, `tasks.md:82`) cite `src/views/RangeSelection.ts:1-51`. The real module is `src/data/RangeSelection.ts`.

**P1 — `DatabaseView.ts:6406-6432` is not column-schema logic.** Phase 002 (`spec.md:73`, `tasks.md:78`) claims this is where filtering hides empty columns. Those lines are the view-type dispatch (`renderBoard` / `renderGallery` / `renderTable`). The real hide logic is `ColumnConfig.ts:92-117`. Luna iter 01 used `:6406-6435` for a *different* claim (pipeline results passed to views). The build plan reused the range for the wrong feature.

**P1 — `DatabaseView.ts:6360-6385` is not search/filter zero-results.** Phase 001 (`spec.md:68`, `tasks.md:76`) pins “Clear search / Reset filters” here. Actual contents: view-type bookkeeping, `empty.noColumnsDb` (`:6366-6372`), and folder-read failure (`:6377-6380`). Filter/search empty is not diagnosed at this site; grouped tables dump to `common.noMatchingData` at `TableRenderer.ts:98-104`.

**P1 — several 008 `DatabaseView` pins point at unrelated methods:**

- `008-mobile-and-accessibility/spec.md:121` / `tasks.md:102` — tablist at `:3100-3150` is `renameDatabase` / `getUniqueDatabaseName`, not tabs.
- `spec.md:118` / `tasks.md:88` — long-press at `:4150-4180` is `toggleRowSelected`.
- `spec.md:123` / `tasks.md:104` — `aria-live` at `:4200-4250` is selection-row collection / `clearSelection`.

**P1 — `DatabaseView.ts:1230-1300` is not a skeleton/query-transition.** Phase 007 (`spec.md:78`, `tasks.md:103`) pins shimmer loaders here. `:1230-1240` registers window blur/focus and the first `render()`. Error UI is `:1248+`. Refresh teardown is `:10631-10646`.

**P1 — `DatabaseView.ts:4233-4271` is not group-header selection.** Phase 002 `tasks.md:82` (T019). Those lines are `selectEntireTableGrid` / `selectFocusedTableRow` / `selectFocusedTableColumn`.

**P1 — `DatabaseView.ts:9829-9854` is not “Filter by this value”.** Phase 002 `spec.md:105`, `tasks.md:83`. That block is `applyChartFilters` (chart drilldown). `CellRenderer.ts:217-230` (same task) is the `displayType` switch (`status`/`select`/`multi-select`), not a context menu. `ColumnMenu.ts:194-224` is hide/wrap/auto-fit, not filter-by-value. Insertion *near* the column menu is plausible; the CellRenderer and DatabaseView pins are the wrong functions.

**P1 — `CellRenderer.ts:1148-1215` is not inline tag-pill ✕.** Phase 002 T027 and 007 T021. That span is the multi-select *popover* option row (checkmark + trash). Cell pills are rendered in `renderMultiSelect` (`:348-355`) with no dismiss control.

**P1 — `CellRenderer.ts:332-355` is not picker activation.** Phase 002 `spec.md:72`. `renderStatus` only paints a badge. Single-click vs double-click lives in `makeEditable` (`:418-430`), which selects on click and edits on dblclick for *all* editable types.

**P1 — calendar “add a live time ruler” already exists, and T020 cites the wrong method.** `CalendarRenderer.ts:717` already calls `renderCurrentTimeLine`; the implementation is `:1209-1227` (60s update). Phase 006 T020 (`tasks.md:96`) cites `:1224-1280`, which is `setupTimeRangeSelection` (drag-to-create), not the ruler. Auto-scroll to workday is still missing (no `scrollTop`/`scrollTo` in this file). The ruler work is polish-on-existing, not a greenfield feature.

**P1 — Gallery/List “blank Total 0” is not at `:90-99` / `:85-92`.** Those are `render()` entry points that always call `renderTotalHeader` (Gallery `:95,139`; List `:88,130`) and still mount a `+ New` card/row. There is no empty-state branch at the cited lines. Luna iter 01 used the same ranges; the build plan copied them without tightening to `renderTotalHeader`.

**P2 — `styles.css:4117` is not `padding-right: 32px`.** It is `transition: padding-right 120ms`. The actual 32px rule is `:4168` (also cited, so recoverable).

**P2 — `styles.css:6183-6288` is mostly group-header/collapse CSS.** Nested-thead sticky offset is only `:6286-6288`. Fine as a style hook, oversold as “thead architecture”.

**P2 — folder typo.** Phase 002/003 out-of-scope names `005-design-tokens-and-typography`; the real folder is `005-design-tokens-typography`.

**P2 — phantom line ranges on files to be created** (`CardFieldRenderer.ts:1-180`, `EdgeAutoScroller.ts:1-120`, `TouchEnvironment.ts:1-90`). Harmless if treated as sketches; misleading if treated as current code.

---

## 2. FAITHFULNESS

### Top-10 — all mapped

| Rank | Synthesis item | Phase |
|:---:|---|---|
| 1 | Dual-theme status/tag tokens | 005 T010 |
| 2 | Mobile bottom sheets | 003 T011 **and** 008 T010–T012 |
| 3 | Remove 5s auto-close | 003 T010 |
| 4 | Universal peek | 006 T003–T006 |
| 5 | Dedup grouped theads | 002 T010 |
| 6 | 4-cluster toolbar + tablist | 004 T010, T012 |
| 7 | Column-aligned `<tfoot>` | 002 T011 |
| 8 | DropdownField listbox keys | 003 T012 |
| 9 | Focus reset + 44px targets | 005 T022, 008 T006–T009/T026, 004 T011 |
| 10 | Reason-aware empty states | 001 |

### Quick wins — one hole

Covered: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 (via 006 CardFieldRenderer “target icons”), 11, 13, 14, 15, 16, 17, 18.

**Fell through: Quick Win 12 — “Hide Empty Properties Accordion in Record Detail”** (`RecordDetailPanel.ts:187-215`, `styles.css:7604-7635`). Today empty fields are *skipped* when `showEmptyFields !== true` (`RecordDetailPanel.ts:192-193`). No 003 phase mentions an accordion, `showEmptyFields`, or “N empty properties”. This is a named quick win with a real call site.

### Themed backlog that never landed

Almost all of synthesis **§7 Object-Oriented Inspection** is absent from every child:

- `RelationInverse.inboundByPath` backlinks accordion
- `$this.path` / `$this.name` in embedded filters (`SourceRules` / `QueryEngine`)
- Formula builder live sample-row eval (`FormulaModal.ts`) — Gemini unique contribution
- Document Outline TOC from `row.cache?.headings`
- Boolean switches in Record Detail
- `NumberDisplayConfig` currency/precision expansion
- Compact inline-block embed mode
- “+ Create '[query]' in [Target DB]” in the relation picker (003 T021 is windowing only)

Also uncovered: freeze-first-column (correctly deferred in 002 T030), formula entry bar (deferred T031). Those are explicit `[B]` — fine.

### Invented work (not in synthesis top-10 / themed backlog / quick wins)

Starter presets (Tasks / Projects / Reading List / Notes) are **not** invented: `research/devin-gemini/iteration-01.md:17,108`. OverlayStack, InteractionScope, EdgeAutoScroller, CardFieldRenderer, FAB, glassmorphic dock are all in the synthesis or iteration notes.

What *is* over-scoped relative to synthesis: 001 plan.md:164 (“save the initial view definition file when clicked”) vs 001 spec.md:173 (“presets only initialize in-memory… note creation only on `+ New`”). Pick one. Gemini iter 01 allowed a view-def file write; the spec forbids it.

---

## 3. NON-OVERLAP

Phases **claim** clean Out-of-Scope fences, then **re-claim the same work**.

| Collision | Who claims it | Who should own it |
|---|---|---|
| `.db-mobile-bottom-sheet` | 003 REQ-002 / T011 **and** 008 REQ-003 / T010–T012. 008 Out of Scope even says bottom sheets belong to 003, then implements them. | **003** (overlay geometry). 008 only consumes `isTouchDevice` + 44px. |
| WAI-ARIA `role="grid"` | 002 REQ-016 / T025 **and** 008 REQ-009 / T019. 002 Out of Scope points ARIA at 008, then ships it. | **008** (a11y contract). 002 only the table DOM refactor. |
| View switcher `role="tablist"` | 004 REQ-002 / T012 **and** 008 REQ-010 / T021 | **004** (toolbar). 008 verifies, does not re-annotate. |
| `#ERROR!` formula badges | 002 T026 **and** 007 REQ-005 / T017–T018 | **007** (error feedback). 002 should not paint this. |
| Tag hover ✕ | 002 T027 **and** 007 REQ-008 / T021 | **007** |
| URL/Email/Phone micro-actions | 002 T027 (bundled with tags) | **007** (or a dedicated 002 cell-affordance task, not both) |
| Row density tokens | 002 REQ-015 (Relaxed **42px**) **and** 005 REQ-009 (Comfortable **40px**), both on `TableRenderer.ts:74-86` / `styles.css:4070-4077` | **005** defines tokens; **002** consumes. Values must match. |
| Elevation / glass blur | 003 REQ-005 `blur(16px)` **and** 005 REQ-006 `blur(12px)` | **005** tokens; **003** applies `--db-elevation-*` |
| Grouped table empty headers | 001 T015 preserve thead on 0 rows **and** 002 T010 rewrite grouped tables to a single `<table>` | **002** owns grouped architecture; 001 should not land a structure 002 will delete |
| Board column header `:311-351` | 001 T016 empty drop slots, 006 T013 collapse rails, 006 T014 `...` menu | **006** for chrome; 001 only empty-copy/drop-slot styling |
| Gallery/List group headers `:94-135` | 001 T016 empty-group copy **and** 006 T018 `+ New` | Split: 001 copy, 006 button — same function, must be sequenced |
| Search control `:1087-1123` | 004 T018 clear/✕ **and** 007 T026 debounce spinner | **004** structure; 007 can add a spinner class only after 004 |

`graph-metadata.json` for every child has `"depends_on": []` while specs describe predecessor chains. Orchestration metadata and prose disagree.

---

## 4. CONSTRAINTS

Excluded research items (note-body writes on render, SQLite/blockstore, desktop `fs.watch`/`child_process`, telemetry, MobX/Zustand pipeline rewrite) did **not** sneak back in as named tasks. `navigator.vibrate?.()` (008 T014) is a guarded mobile API, not Electron-only.

Flags:

**P1 — Parent scope vs 001 T011.** Parent `spec.md:80-86` limits the program to “presentation-layer changes only” and forbids pipeline rewrites. 001 REQ-004 / T011 changes `src/data/RowPipeline.ts:23-111`, whose `build()` today returns `RowData[]` only (`RowPipeline.ts:23-29`). Changing that signature is a data-layer API break on a file upstream will keep editing — the opposite of “isolated module + few call sites”. Luna wanted a diagnostics *contract*; that should be a pure helper wrapping `build()`, not a `build()` return-type change.

**P1 — 001 preset write policy is inconsistent.** Plan.md:164 writes a view-def file; spec.md:173 claims in-memory only. A user click creating a database is fine; a render path that writes is not. The task text does not nail which it is.

**P2 — 002 `ColumnConfig.getVisibleColumns` and 006 `CoverImage` metadataCache reads** stay display-only if they never `vault.modify`. Cover fallback via `getFileCache()?.embeds` is iCloud-safe. Unscheduled-tray *drag onto a day* (006 SC-006) is a user-initiated date write — allowed, but it is not “display-only rendering”; the task should say that explicitly so it is not implemented as an automatic fill (which luna iter 01 forbade: “Never auto-fill a date”).

**P2 — 002/006/008 are not rebase-light.** Grouped-table rewrite, swimlanes, and “replace `isPhoneLayout()` at 8+ call sites” are broad edits, not “isolated module + few call sites”. The new modules (`EmptyStateRenderer`, `TableFooterRenderer`, `OverlayStack`, `CardFieldRenderer`, `TouchEnvironment`) *are* rebase-shaped; the call-site fan-out is not.

---

## 5. IMPLEMENTABILITY

**P1 — Phase 006 `tasks.md` remaps REQ IDs so they contradict `spec.md`.** Spec REQ-002 is swimlanes; tasks T001 says CardFieldRenderer is REQ-002. Spec REQ-006 is CardFieldRenderer; tasks REQ-006 is column collapsing. An agent following tasks.md will implement the wrong requirement IDs and the checklist cannot close objectively.

**P1 — Sequencing vs tokens.** Parent `spec.md:121` says 005 is the “natural first mover”, then says phases “may start independently”, then numbers 001→008 as the chain. 002 T024 and 005 T020 both invent `--db-row-height*` with **42px vs 40px**. 003 and 005 disagree on blur **16px vs 12px**. 006 already consumes `--db-border-subtle` (005). `graph-metadata.json` `depends_on: []` will let a Wave-1 agent start 002 before 005 and bake competing tokens.

**P1 — 001 grouped-header work is wasted if 002 is independent.** 001 T015 preserves nested theads on 0 rows; 002 T010 deletes nested tables. If 001 ships first, 002 rewrites it. If they ship in parallel, both edit `TableRenderer.renderGroupedTable`.

**P1 — Acceptance criteria that cannot be checked as written.**

- 006 SC-005 “live red current-time ruler” — already true (`:1209-1227`). “Done” would pass on day one without auto-scroll, which is the actual gap.
- 005 SC-001 “all 16 colors ≥ 4.5:1 on `#1e1e1e`” — checkable, but T052 does not name a contrast tool or fixture.
- 002 SC-014 “passes automated accessibility checks” — no tool named (axe, Lighthouse, or a unit assert on `role=`).
- 001 T054 / 002 T056 “0 frontmatter writes” via `git diff` on vault notes — no vault path, no test double.

**P2 — Vague / underspecified tasks.** 002 T010 (“refactor grouped tables to a single continuous table”) has no migration note for group drag MIME, sticky `top` vars (`--db-group-table-head-top`), or `patchUngroupedRows`. 003 T016 (“drilldown **or** pointer-bridge”) leaves the interaction model unchosen. 004 T013 split-New vs 004 risk table “merge into long-press on touch” — two designs. Effort labels (~3h for 001, ~4h for 002 including grouped-table rewrite) are not credible.

**P2 — 006/007/008 `tasks.md` dump implementation into “Phase 3: Verification”** (006 T018–T026, 007 T020–T027, 008 T019–T027). An agent stopping at “verification” will skip half the build.

---

## What is actually sound

The eight-phase carve (empty → table → overlays → toolbar → tokens → other views → motion → a11y) matches the research theme map. Top-10 coverage is complete. Constraints language is copied into every child. Isolated new modules (`EmptyStateRenderer`, `TableFooterRenderer`, `OverlayStack`, `CardFieldRenderer`, `EdgeAutoScroller`, `TouchEnvironment`, `InteractionScope`) are the right shape. Spot-checks of the *core* defect pins (auto-close, contrast, nested theads, `openNote`, `getVisibleColumns`, `"⋮⋮"`, `file-text` icon, `outline: none`, 28px toolbar) are honest.

The failure mode is not “made-up UI.” It is **citation drift, dual ownership, and REQ-ID rot** that will make two agents edit the same function, or one agent “fix” `renameDatabase` thinking it is the tablist.

---

**Before build:** (1) fix the false `DatabaseView` / `CellRenderer` / `RangeSelection` pins, (2) assign a single owner for bottom sheets, ARIA grid, tablist, density tokens, `#ERROR!`, and tag ✕, (3) put QW12 on 006 or 007, (4) make 005 a real predecessor in `graph-metadata.json`, (5) realign 006 tasks.md REQ IDs to spec.md.

VERDICT: CONDITIONAL — P1: false `file:line` pins (RangeSelection path; DatabaseView 3100/4150/4200/4233/6360/6406/9829/1230; CellRenderer 217/332/1148; Calendar 1224); dual-owned bottom sheets/ARIA/tablist/density/`#ERROR!`/tag ✕; 006 REQ-ID mismatch; QW12 missing; RowPipeline vs presentation-only. P2: 42 vs 40px density; 16 vs 12px blur; verification sections that still contain build work; phantom new-file line ranges.
