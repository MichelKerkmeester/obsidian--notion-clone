---
title: "Usage & Migration Inventory: calendar / timeline / chart views"
description: "The audit's single output: 33 live views named with file:line and decided redirect targets, the DatabaseViewType retention decision, the embedded-host decision, every code-reference class, the counts, the migration charter and the archive plan."
trigger_phrases:
  - "008 usage audit inventory"
  - "calendar timeline chart inventory"
  - "view deprecation redirect targets"
  - "deprecated views archive plan"
importance_tier: "important"
contextType: "implementation"
---
# Usage & Migration Inventory — calendar / timeline / chart views

> Packet: 008-calendar-timeline-chart-deprecation/001-usage-and-migration-audit (Phase 1; read-only — the only writes are this document).
> Audited against the tree at **`bf694181`** (origin/main this worktree started from). That SHA is also the **last-live SHA** for the phase-3 archive plan.
> Method: mirrors 007-001 (gallery) — every mention *class* enumerated with file:line; occurrence counts given per class; the vault read is fresh (this run), scoped to `--include='*.md'`, read-only.
> Completion criteria served: goal items 1 (inventory naming every live view), 2 (redirect target + reason per view), 3 (DatabaseViewType retention-vs-redirect decision); AC-001, AC-002; REQ-003.

---

## 1. View type ids and where they are stored

`src/data/types.ts:320`:

```ts
export type DatabaseViewType = "table" | "board" | "gallery" | "list" | "chart" | "calendar" | "timeline";
```

A deprecated view is not a stored variant with its own persistence: the id lives in the *same* `DatabaseConfig.views[]` frontmatter block as every other view. Storage/parse sites:

| Storage surface | file:line | Notes |
|---|---|---|
| Per-view id | `src/data/types.ts:502` | `viewType?: DatabaseViewType` on `ViewConfig`, persisted in each database's `views:` frontmatter |
| Union annotation, per-type state | `src/data/types.ts:760` | `viewStates?: Partial<Record<DatabaseViewType, ViewModeStateDef>>` |
| Plugin-level default | `src/data/types.ts:803` | `defaultViewType?: DatabaseViewType` |
| Frontmatter parse | `src/data/data-source.ts:773`, `:964-965` | both the database-level and per-view read paths funnel through `parseViewType()` |
| Type gate | `src/data/data-source.ts:1566-1567` | `parseViewType()` accepts all seven ids; **this is the accepting surface** |

### 1.1 DECISION (REQ-002 / AC-002): the three ids stay in `DatabaseViewType` — accepted-but-redirected

**Recorded decision: `chart`, `calendar` and `timeline` remain members of the `DatabaseViewType` union and of `parseViewType()`'s accepted set during the redirect phase; they do not leave the union in this packet's phase 2.** Reasons:

1. **Precedent, both directions.** 006-005 recommended `list` stay accepted-but-redirected (its implementation-summary, "Recommend `list` stays accepted-but-redirected in `DatabaseViewType`, decided by `007`"). 007-001 then proved the *mechanism* reason: closing `parseViewType()`'s exemption costs nothing only when the migration target equals the unknown-type fallback (`table`). Of this packet's three targets, two equal the fallback and one does not (§1.2), so the union cannot shrink cleanly until the timeline redirect (target ≠ fallback) routes through a real migration, 007-002-ADR-002 style.
2. **Dead configuration is recorded, not dropped** (spec.md §8): the 33 live views below are frontmatter values; shrinking the union without the redirect would coerce them to `table` before any migration could read their config fields.

### 1.2 DECISION: redirect target per type, with the reason

| Type | Target | Reason (grounded in what the surviving type preserves) |
|---|---|---|
| `chart` | **table** | A chart view is aggregations *over* records (`ChartAggregation`, `src/data/types.ts:322+`); no surviving type aggregates, so the lossless residual is the records themselves. Target equals the unknown-type fallback (`table`), so when this exemption eventually closes, nothing is silently dropped — the 006/`list` situation, not the 007/`gallery` one. Declared losses: every `chart*` ViewConfig field (aggregation, bucketing, palette, reference lines) — unrecoverable by design. |
| `calendar` | **table** | A calendar's essence is records arranged by a date property; a table sorted by that same property (`calendarStartDateField`, `src/data/types.ts:688`) retains every record and every property. Board is *not* the target: a calendar config carries no grouping property, so a board would have to invent one. Declared losses: the grid arrangement, end-date spans (`:692`), title/color formatting (`:694,696`). |
| `timeline` | **board** | The only one of the three whose config already carries a grouping dimension: lanes (`timelineGroupField`, `src/data/types.ts:738`) map structurally onto board groups (`boardGroupField`, `:505` — both optional property-name strings). Title/color carries likewise (`:740,742`). Target ≠ fallback, so per 007-001 §1's criterion the redirect must route through the real migration rather than the bare unknown-type fallback — 007-002's ADR-002 is the shipped pattern. Declared losses: the time axis itself, start/end date semantics (`:734,736`). |

### 1.3 DECISION (REQ-003): the embedded codeblock host needs its own migration pass — yes

Precedent: 007-002 ADR-001 (the embedded host gained the gallery migration call even though 046's ADR-001 had already settled the categorical objection). Present necessity: **0** fence-configured views of the three types exist today (the only real fences, `Finance/Finance Overview.md:8,14,20,26`, carry `dbPath`+`viewId` only and reference table views), so the pass is prophylactic. It is still required: the embedded host resolves the referenced view's config itself, and any future fence pointing at one of the 33 affected viewIds would render through the embedded host without the main view's on-open migration. Transplant shape already ships: `migrateListViewOnOpen(config)` — defined at `src/views/embedded-database-renderer.ts:825`, called from the embedded render path at `:746` (built by 006), with 007-002's gallery copy beside it (`:745` call, `:782` def); the main-view counterpart calls sit at `src/views/database-view.ts:12164-12165` — phase 2 adds the three new migrations beside them.

---

## 2. Inventory: every live view of the three types (operator vault)

Fresh read this run of the operator's iCloud vault (`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Michel Kerkmeester/`). **15** files carry `db_view: true` (the vault grew from 1 at 007-001's read of `b240a8d5` — this audit's count supersedes theirs). **76 views total: 31 table, 12 board, 0 gallery, 0 list, 11 chart, 11 calendar, 11 timeline.** No `defaultViewType` override exists anywhere in the vault.

### 2.1 The 33 affected views (11 databases × one of each type), with decided target

| # | Database file | View name | Type | file:line | → Target | Reason ref |
|---|---|---|---|---|---|---|
| 1 | Database Testbed/Testbed.md | Calendar | calendar | :469 | table | §1.2 |
| 2 | Database Testbed/Testbed.md | Timeline | timeline | :617 | board | §1.2 |
| 3 | Database Testbed/Testbed.md | Budget by Status | chart | :765 | table | §1.2 |
| 4 | Database Testbed/CRM Contacts and Deals/CRM Contacts and Deals.md | Calendar | calendar | :521 | table | §1.2 |
| 5 | Database Testbed/CRM Contacts and Deals/CRM Contacts and Deals.md | Timeline | timeline | :683 | board | §1.2 |
| 6 | Database Testbed/CRM Contacts and Deals/CRM Contacts and Deals.md | By status | chart | :845 | table | §1.2 |
| 7 | Database Testbed/Content Calendar/Content Calendar.md | Calendar | calendar | :490 | table | §1.2 |
| 8 | Database Testbed/Content Calendar/Content Calendar.md | Timeline | timeline | :615 | board | §1.2 |
| 9 | Database Testbed/Content Calendar/Content Calendar.md | By status | chart | :740 | table | §1.2 |
| 10 | Database Testbed/Course Notes and Study/Course Notes and Study.md | Calendar | calendar | :475 | table | §1.2 |
| 11 | Database Testbed/Course Notes and Study/Course Notes and Study.md | Timeline | timeline | :601 | board | §1.2 |
| 12 | Database Testbed/Course Notes and Study/Course Notes and Study.md | By status | chart | :727 | table | §1.2 |
| 13 | Database Testbed/Finance Reports/Finance Reports.md | Calendar | calendar | :477 | table | §1.2 |
| 14 | Database Testbed/Finance Reports/Finance Reports.md | Timeline | timeline | :603 | board | §1.2 |
| 15 | Database Testbed/Finance Reports/Finance Reports.md | By status | chart | :761 | table | §1.2 |
| 16 | Database Testbed/Habit and Health Log/Habit and Health Log.md | Calendar | calendar | :485 | table | §1.2 |
| 17 | Database Testbed/Habit and Health Log/Habit and Health Log.md | Timeline | timeline | :611 | board | §1.2 |
| 18 | Database Testbed/Habit and Health Log/Habit and Health Log.md | By status | chart | :737 | table | §1.2 |
| 19 | Database Testbed/Home Inventory/Home Inventory.md | Calendar | calendar | :514 | table | §1.2 |
| 20 | Database Testbed/Home Inventory/Home Inventory.md | Timeline | timeline | :639 | board | §1.2 |
| 21 | Database Testbed/Home Inventory/Home Inventory.md | By status | chart | :764 | table | §1.2 |
| 22 | Database Testbed/Project Tracker/Project Tracker.md | Calendar | calendar | :303 | table | §1.2 |
| 23 | Database Testbed/Project Tracker/Project Tracker.md | Timeline | timeline | :360 | board | §1.2 |
| 24 | Database Testbed/Project Tracker/Project Tracker.md | By status | chart | :418 | table | §1.2 |
| 25 | Database Testbed/Reading List/Reading List.md | Calendar | calendar | :297 | table | §1.2 |
| 26 | Database Testbed/Reading List/Reading List.md | Timeline | timeline | :354 | board | §1.2 |
| 27 | Database Testbed/Reading List/Reading List.md | By status | chart | :412 | table | §1.2 |
| 28 | Database Testbed/Recipes and Meal Plan/Recipes and Meal Plan.md | Calendar | calendar | :303 | table | §1.2 |
| 29 | Database Testbed/Recipes and Meal Plan/Recipes and Meal Plan.md | Timeline | timeline | :360 | board | §1.2 |
| 30 | Database Testbed/Recipes and Meal Plan/Recipes and Meal Plan.md | By status | chart | :418 | table | §1.2 |
| 31 | Database Testbed/Travel Itinerary/Travel Itinerary.md | Calendar | calendar | :299 | table | §1.2 |
| 32 | Database Testbed/Travel Itinerary/Travel Itinerary.md | Timeline | timeline | :356 | board | §1.2 |
| 33 | Database Testbed/Travel Itinerary/Travel Itinerary.md | By status | chart | :414 | table | §1.2 |

All 33 lines are inside the eleven `Database Testbed/*` databases. The 4 `Finance/*` databases (plus their Overview fences) hold **only** table/board views — they are the spec.md §8 "database with more than one view, only one of which is affected" case, resolved: their untouched views get no redirect, and no dead-configuration rows exist to record.

### 2.2 Fixture / test vaults the project ships

**None.** No `.obsidian/` directory and no fixture vault ships in the repo (verified: no `db_view: true` `.md` outside the operator's vault; the only in-repo `viewType:` text hit is prose in `screenshots/README.md:978`). What the project ships instead are *programmatically constructed* fixtures — they carry the three types in code, not in vault files:

| Fixture surface | file:line | Constructed types |
|---|---|---|
| Render-assertion harness configs | `tools/live/render-assertion-harness.ts:3063`, `:3180` (`viewType: "chart"`), `:3218` (`viewType: "timeline"`), `:3393` (`viewType: "calendar"`) | all three; mention counts: calendar 170, timeline 109, chart 116 |
| Render benches | `tools/bench/calendar-render-bench.ts:150`, `tools/bench/timeline-render-bench.ts:183` (`viewType: "calendar"`) | calendar, timeline (chart has no dedicated bench; its measured coverage is the assertion harness + captures) |
| Constructed-capture scenarios | `tools/screenshots/constructed-scenarios.mjs` (calendar 48, timeline 40, chart 25 occurrences) + `tools/screenshots/scenarios/temporal.mjs` (359, 175 in its parity test, 73 in `chrome.mjs`) | all three |
| Reference (Project Manager) captures | `tools/screenshots/reference-scenarios.mjs`, `tools/live/reference-state-assertions.mjs`, `tools/bench/reference-fixture.test.mjs` | reference-**gantt** — the PM-format counterpart of the timeline; see §3.6 |

Spec §8's dead-configuration edge case: no dead rows found — all 33 frontmatter views and all harness configs are referenced by their files' other views' shared config blocks.

---

## 3. Every code reference (minting, accepting, rendering, teardown, panel, harness, i18n)

Occurrence totals in `src/**` (case-insensitive, `*.ts`): **calendar 2767, timeline 2756, gantt 765, chart 3236** — across 105 files. The table below names every reference *class* with its load-bearing file:line; per-file occurrence lists are reproducible with the greps noted under each class (phase 2/3 must re-grep at removal time — this audit's counts are pinned to `bf694181`).

### 3.1 Minting surfaces (where a new view of these types can still be created)

| Surface | file:line | Detail |
|---|---|---|
| View switcher / toolbar "add view" menu | `src/views/toolbar-renderer.ts:102-104` | `{ value: "chart" / "calendar" / "timeline", ... }` entries |
| — its icons | `src/views/toolbar-renderer.ts:113-115` | `"bar-chart"`, `"calendar-days"`, `"chart-gantt"` |
| View-config panel's add-view select | `src/views/view-config-panel-renderer.ts:574-576` | same three values |
| Plugin-settings default-view dropdown | `src/settings.ts:80` | `DEFAULT_VIEW_TYPES = ["table", "board", "chart", "calendar", "timeline"]` — these three are **still offered**; 007-001 found this class of surface for gallery |
| — option rendering | `src/settings.ts:165-166` | `t(\`common.${viewType}View\`)` |
| — normalizer + setter | `src/settings.ts:83-85`, `:172-174` | `normalizeDefaultViewType` keeps any offered value, else falls back |
| i18n labels | `src/i18n.ts:109-111` (en), `:1919-1921` (zh) | `common.chartView` / `calendarView` / `timelineView` |

### 3.2 Accepting surfaces (where an old stored id is still admitted)

| Surface | file:line | Detail |
|---|---|---|
| `parseViewType()` | `src/data/data-source.ts:1566-1567` | accepts all seven ids; called from `:773` and `:964-965`; the decision in §1.1 keeps it open through phase 2 |
| View-name derivation | `src/data/data-source.ts:1761-1763` | default names for the three types |

### 3.3 Renderer wiring, render, and teardown (`src/views/database-view.ts`)

| Concern | file:line |
|---|---|
| Imports | `:114` (ChartRenderer), `:124-125` (CalendarTimelineRenderer, CalendarRenderer) |
| Instances | `:416` (chart), `:419` (timeline — the gantt port), `:463` (calendar) |
| Theme/resize/destroy lifecycle | `:1428`, `:1463-1468`, `:1500` |
| viewType-exit teardown guard | `:2648` (`if (config.viewType === "chart" && value !== "chart") this.chartRenderer.destroy()`) |
| Export/copy actions | `:2973-2974` |
| Render dispatch | `:7097-7099` (calendar / `renderTimeline`), `:11045` (chart) |
| Outgoing-view teardown | `:7133-7135` — the shared `teardownOutgoingViewRenderer` legs closed by 037's 0.0.31 leak fix; the reason 008 is one packet, not three (parent spec.md:33,66) |
| Visible-range (calendar/timeline shared) | `:7158-7159` |

### 3.4 Panel and row-pipeline branching

| Concern | file:line |
|---|---|
| Layout-options / options button | `src/views/view-config-panel-renderer.ts:390-401` |
| Panel sections gated off for the three | `:404,407,418-419,453,525-529` |
| Calendar/timeline-specific panel sections | `:467` (calendar), `:472` (timeline) |
| Timeline invalid-events notice | `src/data/invalid-time-events.ts` + `src/views/modals/invalid-time-events-modal.ts`; toolbar wiring `src/views/toolbar-renderer.ts:186-189` |
| Event-card search/row shaping | `src/data/row-pipeline.ts:32,112-130` (`isCalendarTimeline` guard; hides the property panel path) |

### 3.5 Obsidian view registration — nothing to remove here

The three are *inner* `DatabaseViewType` ids, not Obsidian `registerView` types: `src/main.ts:358-359,381-382` register the two container view types only. No registration changes belong to this packet.

### 3.6 Harness, storybook, benches, capture sets

| Class | Items | Counts (pinned to `bf694181`) |
|---|---|---|
| Assertion harness | `tools/live/render-assertion-harness.ts` — configs at `:3063,:3180` (chart), `:3218` (timeline), `:3393` (calendar); the gantt root's document-level listener discipline is what `src/views/rendered-view-roots.ts:29-37`'s reference-gantt entry protects | harness mentions: calendar 170, timeline 109, chart 116 |
| Other `tools/live` lanes touching the three (31 more files) | `constructed-state-assertions.mjs`, `render-assertion-bundle.mjs`, `render-assertions.mjs`, `reference-assertion-bundle.mjs`, `reference-mount.ts`, `reference-state-assertions.mjs`, `reference-temporal-shim.mjs`, `render-scenario-utils.mjs` (+test), `replay.mjs`/`replay.json`, `sheet-grammar.mjs`, `surface-census.*`, `token-census.json`, `touch-targets-*-baseline.json`, `view-census.*`, `renderer-coverage.json`, `cascade-audit.json`, `checkbox-*.json`, `design-conformance.json`, `engine-parity.json`, `typed-data-assertions.mjs` | phase 2/3: regenerate each stale json lane (same rule 007-001 recorded) |
| Storybook | **1** of 20 story files mentions the three: `src/views/dropdown-field.stories.ts`; harness side: `tools/storybook/verify-placement.mjs:11441`, `obsidian-dom-shim.mjs`, `obsidian-stub.mjs`, `story-coverage-allowlist.json` | lowest-touch class |
| Benches | `tools/bench/calendar-render-bench.ts:150`, `timeline-render-bench.ts:183` (+ its `timeline-render-bench.test.mjs`); `card-bench-driver.mjs` is shared (007-001 precedent) — do not delete with the benches | 2 dedicated benches |
| Capture definitions | constructed ids: `tools/screenshots/constructed-scenarios.mjs` + `tools/screenshots/scenarios/temporal.mjs`; chrome ids: `tools/screenshots/scenarios/chrome.mjs`; panels: `panels.mjs` (8), core: `core.mjs` (5); parity tests: `temporal-tick-parity.test.mjs` (175), `shared.test.mjs` (11) | scenario-file mentions: temporal.mjs 359, temporal-tick-parity.test.mjs 175, chrome.mjs 73, fields.mjs 34 |
| Capture ids in `screenshots/manifest.json` (34 ids; total token occurrences 1400: calendar 624, timeline 532, chart 244) | calendar-*: `calendar-empty-state, calendar-mini-calendar, calendar-month-view, calendar-toolbar-options, calendar-week-time-grid, constructed-calendar-day/-empty/-month/-month-unscheduled/-toolbar-options/-week, constructed-sort-panel-calendar, panel-sort-calendar-empty`; timeline-*: `timeline-view, timeline-view-day/-month/-quarter/-year, timeline-subtask-tree, timeline-toolbar-options, constructed-timeline, -day/-month/-quarter/-subtask/-toolbar-options/-year`; chart-*: `chrome-chart-empty, chrome-chart-number, chrome-chart-options-popover, constructed-chart, -empty, -number, -toolbar-options` | id list extracted from the manifest; each id's PNGs live under `screenshots/notion|.../` per the app-family layout |
| Reference-gantt (packet 037's port) | the gantt port lives in `src/views/calendar-timeline-renderer.ts` (765 `gantt` occurrences; the renderer class + its sticky-header/resize subtrees, `rendered-view-roots.ts:29-37`'s comment records the switch-away leak 037 fixed); its capture+assertion surface: `tools/screenshots/reference-scenarios.mjs`, `tools/live/reference-state-assertions.mjs`, `tools/bench/reference-fixture.test.mjs`, 16 reference PNGs under `screenshots/project-manager/` (005 roadmap note) | packet 037 = `specs/005-component-surface-system/037-timeline-gantt-port/`; 008's parent spec.md:55,117 already names it superseded-by-008 — nothing further to document in this phase |

### 3.7 Docs / community-description mentions (the strip list for phase 4)

| File:line | Text | Action in phase 4 |
|---|---|---|
| `README.md:3` | "…Table, board, chart, calendar, and timeline views read and write those same files…" | drop the three from the enumeration |
| `README.md:19` | "**Chart** — bar, …" feature bullet | delete bullet |
| `README.md:20` | "**Calendar** — …" feature bullet | delete bullet |
| `README.md:21` | "**Timeline** — …" feature bullet | delete bullet |
| `README.md:23` | gallery/list migration note | **keep** — still true, and this packet's redirects join it |
| `README.md:73` | "**Default view for new databases** — table, board, chart, calendar, or timeline." | drop the three |
| `manifest.json:6` | description: "…table, board, chart, calendar, timeline, formulas, filters…" | drop the three |
| `package.json:4` | description: "…table, board, list, chart, calendar, timeline…" | drop the three |
| `package.json:61` | `"chart.js": "^4.5.1"` | stays until phase 3 removes `src/data/chart-*.ts` + `chart-js-setup.ts` |

Communityoplágia note: `manifest.json`'s description is what the Obsidian community-plugin directory displays — the phase-4 strip must keep it under the directory's length limit after trimming (no shrink needed: removing three words).

---

## 4. Counts per view (summary)

| Surface | calendar | timeline | chart |
|---|---|---|---|
| Live views, operator vault | **11** | **11** | **11** |
| Fence-configured views (vault) | 0 | 0 | 0 |
| Shipped fixture-vault views | 0 | 0 | 0 |
| Harness-constructed configs | 3 sites (`:3393` + bench) | 2 sites (`:3218` + bench) | 2 sites (`:3063,:3180`) |
| Harness file mentions | 170 | 109 | 116 |
| Capture ids (manifest) | 14 | 11 | 7 |
| Manifest token occurrences | 624 | 532 | 244 |
| Scenario-definition mentions | 48 + 359 (temporal.mjs) | 40 + (shared) | 25 + (chrome/panels) |
| Dedicated benches | 1 | 1 | 0 |
| Story files | 1 (shared, `dropdown-field.stories.ts`) | 1 | 1 |
| `src/**` occurrences (all) | 2767 (+gantt 765) | 2756 | 3236 |
| `src` test files mentioning | 31 | 22 | 14 |
| Minting surfaces still open | 3 (toolbar, panel, settings-default) | 3 | 3 |
| Redirect target | table | board | table |

---

## 5. Migration / redirect plan (what phase 2 must mirror from 007)

Shipped 007 pattern to transplant (evidence: 007-001 implementation-summary §1/§6; 007-002 decision-record ADR-001/ADR-002):

1. **Settings-load / on-open sanitizer**: `main.ts`'s load path + `database-view.ts:2718-2728`-style `migrateXxxViewOnOpen()`, called from `refresh()`'s head (`src/views/database-view.ts:12164-12165`) — add the three; do **not** close the surfaces by deletion.
2. **`parseViewType()` stays open** through the redirect phase (`data-source.ts:1566-1567`); regression test guards that the old ids still parse so the migration can see them. When the timeline (board-target) migration routes through the real migration, its exemption may close like 007-002's ADR-002; the `table`-target exemptions (chart, calendar) may close for free, exactly 006's `e0e1c568` list case.
3. **Embedded host**: add the call beside `migrateListViewOnOpen` (`embedded-database-renderer.ts:746`, definition `:825`) — §1.3.
4. **Per-view, not per-database**: the redirect rewrites only the affected `views[]` entries (spec.md §8); the 4 Finance databases' table/board views are untouched, and no view here is the sole view of its database, so no default-view churn.

Declared losses to name in phase 2's notice copy (from §1.2): chart — all aggregation/bucketing/palette config; calendar — grid arrangement, end-date spans, title/color; timeline — the time axis, start/end dates. Carried: timeline's lane→group (group/title/color), calendar's start-date→table sort target.

## 6. Archive plan (phase 3)

- Target: `archive/deprecated-views/<view>/` for `chart/`, `calendar/`, `timeline/` — one folder per removed renderer subtree (`calendar-*` renderer/model/test files, `chart-*.ts`, `timeline` halves of the shared `calendar-timeline-*` files, benches, and the manifest capture sets).
- Last-live SHA: **`bf694181`** — recorded in each folder's README ("last live at `bf694181`").
- Restore recipe (each archived README carries it): `git checkout bf694181 -- <archived-paths-restored-to-their-orig-locations>` or `git show bf694181:<path> > <path>`; the repo-root question ("how to restore") resolves to the same SHA — every removed file's pre-removal bytes are reachable at thatSHA.
- Measurement idiom, from 007-001 §3: `renderer-coverage.json`'s counts step down by exactly the retired renderer's share, note "was N/M; <type> renderer retired".

## 7. Provenance

| What | Evidence |
|---|---|
| Worktree clean at start | `git status --short | wc -l` = 0 (this run) |
| Start SHA | `git log --oneline -1 origin/main` = `bf694181 docs(specs): scaffold the 0.0.32 device-pass reports into new packets` |
| Vault read | fresh `grep` this run over the iCloud path; 15 files, 76 views, enumerated in §2.1 |
| Occurrence counts | `grep -rho -i <token> src --include='*.ts' | wc -l` this run, pinned to `bf694181` |
