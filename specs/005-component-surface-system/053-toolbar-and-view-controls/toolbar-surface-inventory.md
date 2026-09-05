---
title: "Toolbar Surface Inventory: Every Toolbar Surface, Its Primitive, Its Migration and Its Anytype Pattern"
description: "Code-derived census of the toolbar family's surfaces: the primitive each migrates onto, the changes it takes, the Anytype capture its design is read against, and what stays ours. Extends 003's sheet-and-dropdown inventory along the toolbar axis."
trigger_phrases:
  - "toolbar surface inventory"
  - "toolbar migration table"
  - "toolbar census"
  - "053 inventory"
importance_tier: "high"
contextType: "research"
---
# Toolbar surface inventory

Every surface the toolbar family owns, derived by reading the renderers on the current tree, each
row citing the `file:line` that constructs it. **This extends
`../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md`; it does not restate it.** That
document is the per-surface census of what each surface is and whether it conforms as a sheet;
this document adds only the toolbar axis — which primitive a surface migrates onto, what changes,
and which Anytype capture its design is read against.

**Capture-read gate (goal D1): CLOSED at T001, 2026-09-05.** This packet's own
[`design-trueup.md`](design-trueup.md) is now the **read of record** for every row here: the pixels
of the 600-file menu sweep, the 120-file catalogue and the 118-file iOS set were measured directly,
and **§8 carries the per-row record naming the files opened**. `050`'s `design-trueup.md` remains
the read of record for the fourteen adoption items and is superseded here in the eight places §8.2
lists — under `050` ADR-003, where a capture and a prior reading disagree, the capture is the fact.
Rows corrected against `050` at landing are marked **[trued 2026-09-05]**; rows corrected against
T001's own read are marked **[trued T001]**. Rows marked **no capture** are designed from `047`'s
code-derived findings with the gap named — never from a guess — and absence of a capture is not
evidence of absence.

---

## 1. THE MECHANISMS THE FAMILY RUNS ON TODAY

Five shared mechanisms, none shared on purpose — each is re-implemented per surface, which is why
the family reads as eight renderers rather than one toolbar.

| # | Mechanism | Where it lives today | What it costs |
|---|-----------|----------------------|---------------|
| M1 | **The close-others run** | `toolbar-renderer.ts` — the same sequence (database → group → view-tab → export → title, sometimes + `closeToolbarPopovers` + utilities) repeated at **17 call sites** (grep count of `this.closeTitleActionsPopover();` = 17; `closeDatabasePopover();` appears at 19) | Every new popover must remember to join the run; one that forgets leaves a stack |
| M2 | **The hand-built popover shell** | Four shapes: `toolbar-renderer.ts:1240-1250` (view-tab menu), `chart-toolbar-renderer.ts:345-392` (options + child stack), `calendar-toolbar-renderer.ts:84-131`, `calendar-timeline-toolbar-renderer.ts:69-116` | Four implementations of create → header → position → outside-click → Escape → auto-close → cleanup, each with its own drift |
| M3 | **The condition row** | `filter-panel-renderer.ts:445-532` (property, operator, value, remove, wrap/NOT) and `sort-panel-renderer.ts:223-289` (field, direction, remove, drag) | Two vocabularies for one row shape; `design-system.md` §5's condition-panel row floors have to be asserted twice |
| M4 | **The dead settings entry** | Seven methods with zero `this.` call sites at HEAD: `renderComputedSyncButton` `:512`, `renderDatabaseRefreshButton` `:519`, `renderCalendarTimelineOptionsButton` `:551`, `renderWidthSelect` `:1594`, `renderViewConfigButton` `:2239`, `renderChartOptionsButton` `:2252`, `renderExportButton` `:2290` | The entry point is unreadable: the live path is the utilities row's settings shortcut (`:465-470`), while the classes the dead methods would stamp are still the anchor-fallback queries' target (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`) |
| M5 | **Per-surface phone branching** | `createSheetHeader` + `positionToolbarPopover` pairs scattered per surface (`filter-panel-renderer.ts:255-278`, `sort-panel-renderer.ts:133-141`, `view-config-panel-renderer.ts:351-361`) | `044`'s grammar is honoured, but each surface re-derives when it is a sheet and when it is not |

---

## 2. THE PRIMITIVES (target state)

One new module, `src/views/toolbar-primitives.ts`, exports five constructors. A surface migrates
by deleting its own copy of the mechanism (goal D3). Full contracts: `spec.md` §5.

| Primitive | Kills mechanism | First consumer |
|-----------|-----------------|----------------|
| `createPopoverShell` | M1 + M2 | The view-tab context menu |
| `createConditionRow` | M3 | The sort panel (smaller of the two) |
| `createControlClusterButton` | M1 (trigger side) | The filter trigger |
| `createSettingsEntry` | M4 | The utilities row's settings shortcut |
| `createTabStrip` | (tab strip duplication) | The embed's single-tab toolbar |

---

## 3. THE MIGRATION TABLE

Shorthand: **Primitive** names the constructor the surface's replaced mechanism lives behind;
**Change** names what is new for this phase; **Anytype** names the capture the change is read
against, or `no capture`; **Stays ours** names what the row deliberately keeps. `050 item` column
ties the row to `050`'s REQ numbering.

### 3.1 The toolbar row and its clusters — `toolbar-renderer.ts:381-405`

| # | Surface (defined) | `050` item | Primitive | Change | Anytype | Stays ours |
|---|---|---|---|---|---|---|
| T1 | View tabs + add button (`renderViewTabs` `:840-931`) **[trued 2026-09-05]** | 4 | `createTabStrip` | Extracted as-is: roving tabindex, drag (`:978-1021`), measured overflow collapse (`:895-917`), hub fallback (`:1022-1085`) | `anytype-set-kanban-view-dark.png` — the capture shows **a tab row and a trailing `+`**, active tab bright and inactive dimmed. There is **no view-selector dropdown at that width and no captured tab context menu**; the draft's "rename/duplicate/remove on context" was read from `047` §5, not from a screen (`design-trueup.md` REQ-004, contradiction C4) | Drag-reorder on desktop; touch reorder via the context menu's move rows (`:1263-1272`) |
| T2 | View-tab context menu (`showViewTabMenu` `:1229-1284`) **[trued 2026-09-05]** | 4 | `createPopoverShell` | Rows migrate off the `db-view-tab-popover-row db-menu-item` dual class (`:1249`, `:1341`). **Duplicate and Remove go in the view-settings panel, not here** — that is where the capture puts them, last section below a divider, each a 28px row with a 16px leading icon, and it also lands them where item 2 has just put the reader. Our tab menu keeps its own action set | `anytype-view-settings-panel-dark.png` (Duplicate view / Remove view, measured). The tab **context menu itself is not captured** — neither capture phase drove a right-click — so its content and placement stay **design inferred from source code, not seen** | Row order and the change-type submenu row (`:1286-1339`); the move-to-first/last touch rows, which have no Anytype referent |
| T3 | Add-view popover (`showAddViewMenu` `:1360-1490`) | — | `createPopoverShell` (shell only) | Shell migration; the form stays bespoke | `anytype-newobject-type-picker-dark.png` (creation type picker — pattern reference only) | The duplicate-current checkbox (`:1433-1475`), the 15-view cap (`:889-901`) |
| T4 | All-views hub (`showAllViewsHub` `:1087-1198`) | — | `createPopoverShell` | Shell migration; its nested more-menu rides the same stack | `anytype-view-settings-panel-dark.png` (overflow list pattern) | The hub's own rename-in-place (`renameAllView` `:1203-1227`) |
| T5 | Database switcher (`renderDatabasePopover` `:589-762`) | — | — (single caller, two-column layout) | None | `no capture` — Anytype has no multi-database switcher | The whole surface; shell migration is optional and not required by any criterion |
| T6 | Title actions menu (`showTitleActionsMenu` `:763-838`) | — | `createPopoverShell` | Shell migration | `no capture` | Action set |
| T7 | Utilities overflow (`renderUtilitiesOverflowButton` `:407-498`) | — | `createPopoverShell` + `createSettingsEntry` | Settings shortcut becomes the shared entry; the popover's `.is-phone` override keeps `044`'s inset | `anytype-object-more-menu-dark.png` (capability sections — pattern reference) | Refresh/copy-formats/open-file/open-full-view/move-to-page rows |
| T8 | Group-by popover (`renderGroupSelect`/`renderGroupPopover` `:1698-2005`) | — | `createPopoverShell` (shell only) | Shell migration | `no capture` | Every switch, date-mode, row-limit and subgroup row |
| T9 | Export popover (`renderExportPopover` `:2296-2345`) | — | `createPopoverShell` | Shell migration; `renderExportButton` `:2290` (dead) deleted | `no capture` | CSV/Markdown/zip/copy-view-code rows |
| T10 | New button + template menu (`renderNewButton` `:2346-2407`, `showNewTemplateMenu` `:2453-2530`) **[trued T001]** | 10 (consumer) | `createControlClusterButton` (cluster side) | The create call reads the view's preset map when the view carries one (item 10). **The presets section moves here from T19**: the captured home for a per-view creation default is this menu's `Settings` section, where the reader already is when they create a row | **Captured, and it overturns `050` C7 (D2).** `anytype-menu-set-new-object-light.png`: a **288px** menu — `→ Existing object ›`, divider, section label `Settings`, then **`Default Type for this View  Page ›`** and **`Template for this View  Blank ›`** at a 28px pitch. Each opens its own anchored picker over an undimmed parent (`-default-type-for-this-view-light`: search field + typed list; `-template-for-this-view-light`: a two-column card grid). Item 10's narrowing to per-field values **stands on a corrected reason** — we have no type or template system to default, which is a scope fact, not an absence in Anytype | The split-button shape and the touch FAB. **Note**: Anytype's desktop `New` is **one 70×28px pill with no divider**; only its **phone** button is split, at a 1pt `#699BFF` rule. Ours matches the phone and diverges from the desktop |

### 3.2 The control clusters — triggers and chips

| # | Surface (defined) | `050` item | Primitive | Change | Anytype | Stays ours |
|---|---|---|---|---|---|---|
| T11 | Filter trigger (`renderFilterButton` `:2203-2220`) **[trued 2026-09-05]** | 1 | `createControlClusterButton` | **Declared state, not dual-mode behaviour.** The trigger carries `add` or `active` as a property a lane can read; the anchor and the click behaviour are unchanged. **Dual-mode is rejected**: the funnel measures `ink=52, blue=0` on a filtered view and on an unfiltered one, identical to the pixel, on all 120 catalogue captures | `design-trueup.md` REQ-001 (contradiction C1). Anytype's own state surface is the **`N applied` count label** in the settings panel — adopted, and it lands in T19 | The panel anchor, the badge count (`toolbar-renderer.ts:2575-2579`), and our text-carrying badge, which beats colour-only signalling on WCAG 1.4.11 |
| T12 | Sort trigger (`renderSortButton` `:2221-2238`) **[trued 2026-09-05]** | 1 | `createControlClusterButton` | Same declared-state contract as T11. **The sort glyph's blue is a static two-tone glyph, not a state** — it measures `ink=80, blue=60` on a sorted view, an unsorted one, and a default "All" view carrying neither | `design-trueup.md` REQ-001 | Calendar hint routing (`sort-panel-renderer.ts:143-145`) |
| T13 | Properties trigger (`renderColumnButton` `:2273-2289`) **[trued T001]** | — | `createControlClusterButton` | State plumbing only; behaviour unchanged. **Adopt one vocabulary**: a property that cannot be hidden renders greyed with no control rather than being omitted | **Was `no capture`; now seen on two surfaces.** `anytype-menu-set-view-properties-light.png`: a 360px scrolling list, one 28px row per property as `⠿ grip · format icon · label · toggle`, with `Name` **greyed and control-less**, and a `+ Add Property` footer below a divider. `anytype-menu-set-column-header-light.png`: a **280px** five-section menu — property name, property type, `Open as Object`/`Duplicate`/`Remove from Collection`, `Add filter`/`Sort ascending`/`Sort descending`/`Insert left`/`Insert right`/`Hide Property`, then `Align ›` and **`Calculate ›`** (D5) | Hidden-count badge (`setHiddenBadge` `:2592-2598`) |
| T14 | Active-rule chip rail (`active-view-controls-renderer.ts:66-189`) **[trued T001]** | 1 | — (it *is* the chip row) | **The rail is captured (D1)** and its anatomy measured, so two clauses change. **The band move is withdrawn**: the capture puts the rail below a 1px full-content-width divider in its own band, which is where ours already renders — there is nothing to move and no sticky-offset risk. **The direction colour is demoted** to a redundant third signal behind the arrow glyph and, where there is room, the direction word; it may never be the only signal. What the rail **gains**: chip height 26px → **28px**, an 8px/12px group separator, and a condition-as-a-phrase label. Sort-group-first order confirmed | `anytype-project-tracker-list-light.png` measured (`design-trueup.md` T14): rail **y 274..301**; sorts chip **99×28px** fully rounded, fill `#E2ECFE` light / `#1D2739` dark, leading `↓`, aggregate label, trailing `⌄`; 1px separator at x 789; **unfilled** filter chips one per filter; `+ Filter`; right-aligned `Clear`. Present on 5 of 5 List views, absent on Grid/Gallery/Kanban/Calendar/Graph — it auto-hides, and the exact predicate is not decidable from a still. **Refused on contrast**: accent-on-tint **3.14:1**, fill-on-bar **1.19:1** | The logic toggle (`:146-158`), per-chip edit popover (`active-rule-popover-renderer.ts:115-141`), auto-hide-when-empty (`:97`), overflow scroller (`:190-205`), **and one chip per sort** — Anytype aggregates to `2 sorts`, which cannot be individually removed or edited |
| T15 | Active-rule edit popover (`active-rule-popover-renderer.ts:33-141`) | — | `createConditionRow` | Its editor content rides the shared row | `anytype-filter-tag-value-picker-dark.png` (value-picker pattern) | Toggle-to-close keyed on `kind:index` (`:38-46`) |

### 3.3 The rule panels — filter and sort

| # | Surface (defined) | `050` item | Primitive | Change | Anytype | Stays ours |
|---|---|---|---|---|---|---|
| T16 | Filter panel (`filter-panel-renderer.ts:167-255`) **[trued T001]** | 1 (consumer) | `createConditionRow` | `renderFilterRow` `:445-532` becomes the shared row's filter binding (property, operator, value); group/NOT chrome stays. **Adopt**: the condition-as-a-phrase chip label (`Starts is today`), the `✓` on the current operator, the searchable picker head, and a worded empty state on the phone sheet | **`050` REQ-013's "one `+ New filter` row" was the empty state (D3).** Populated, captured across twelve relation formats: `anytype-menu-set-filter-{checkbox,date,email,file,multiselect,number,object,phone,select,text-long,text-short,url}-light.png` each with a `-condition-` pair, plus `-date-picker-` and `-date-relative-`. A **360px panel with content-driven height** (192px short text → 824px object); applied filters render at the top as accent pills reading the whole condition as a phrase. **The 360px does not override our 440-560px `condition panel` role**: Anytype fits it by splitting one condition across three stacked popovers, so the measurement covers a different row than ours | Nested AND/OR/NOT trees (`:302-380`), the logic toggle in the header (`:255-278`), the debounced value commit (`:640-690`) — Anytype's phone sheet commits on an explicit `Apply`, recorded and not adopted |
| T17 | Sort panel (`sort-panel-renderer.ts:110-197`) **[trued T001]** | 1 (consumer) | `createConditionRow` | `renderRule` `:223-289` becomes the shared row's sort binding, at the measured **36px row on a 48px pitch** | **Was `no capture`; now seen (D6).** `anytype-menu-set-view-sort-light.png` and `-sort-added-light.png`: `‹ Sort` header, then per sort a `⠿ grip · [outlined pill: format icon + property] · [outlined square: ↑/↓]`, then a divider, `+ Add sort`, `🗑 Delete sort`. `-sort-property-picker-light.png` is a searchable flat list with per-format icons. `anytype-mobile-sheet-view-sorts-light.png` carries direction as the **word** `Ascending` on a second line — the evidence behind T14's colour demotion. **Still not captured**: the direction chooser — `anytype-menu-set-sort-direction-*` is byte-identical (md5 `909659cd…`) to its `-added-` pair, the only duplicate in all 59 set-controls menus | Drag reorder + drop indicators (`:291-337`), mobile move controls (`:238-270`), the calendar hint (`:143-145`), **and per-row remove** — Anytype's footer `Delete sort` is ambiguous about which sort it deletes |
| T18 | Sort-conflict confirm (new; board + table drag commit) | 7 | — (uses `confirm-modal`, not a new surface) | A confirm gates the drop when rules exist: decline no-ops, accept clears the sort and commits | `no capture` — **gap named**: designed from `047` §8's sorted-subscription repositioning | The PM 1:1 drag visuals — the confirm fires at commit, after the gesture, so no reference pixel moves (parent goal D5) |

### 3.4 The per-view-type option panels and the settings entry

| # | Surface (defined) | `050` item | Primitive | Change | Anytype | Stays ours |
|---|---|---|---|---|---|---|
| T19 | View-config panel (`view-config-panel-renderer.ts:329-460`) **[trued 2026-09-05]** | 2 (target), 1, 4, 10 | `createSettingsEntry` (target side) | Opens on create/duplicate within **100ms — our budget, kept** (Anytype's ~50ms is `047`'s source read and is **not observable in any capture**). Gains: the **`N applied` count label** on the Filter and Sort rows (item 1); **Duplicate view / Remove view** as the last section below a divider (item 4); and the **per-field new-row default values** section (item 10). The panel is **layout-adaptive**: a board's settings gains one `Groups ›` row between Layout and Properties and nothing else moves | `anytype-view-settings-panel-dark.png` measured (`design-trueup.md` REQ-002): **360px × 316px**, right-aligned under the settings icon, **8px** radius, 1px border, **16px** horizontal padding, a boxed 328 × 56px View name field, then **28px** rows. Two navigation moves, both captured: a settings **sub-page replaces in place** (`‹ Layout`) inside the same frame, while a **picker opens as a separate anchored popover** over an undimmed parent — the shell half of which is `051`'s REQ-003. **C7 is overturned at T001 (D2)**: the panel indeed has no default-template row, but the product does — in the **New menu** (T10), which is where item 10's section now lands. **`Page limit` is per-layout, not a single 60 (D4)**: Gallery 60, Kanban 10, and Grid, List, Calendar and Graph carry no page-limit row at all. **The `N applied` label widens (T001)**: the phone's `Edit view` sheet puts a summary on **Properties (`27 applied`), Filters (`No filters`) and Sorts (`2 applied`)** — every value column, with the empty case as a **word** rather than a blank. And the real layout adaptivity is in the **Layout sub-page**, whose block runs from one row (Graph) to six (Kanban), over a constant 2×3 tile grid | Section layout, source rules, conditional formatting, status presets, board/gallery/calendar/timeline branches (`:418-460`) |
| T20 | Chart options popover (`chart-toolbar-renderer.ts:326-392`) | — | `createPopoverShell` | Shell migration incl. its child-popover stack (`:395-420`) | `no capture` | Two-level structure; PM chart parity untouched |
| T21 | Calendar options popover (`calendar-toolbar-renderer.ts:65-131`) | — | `createPopoverShell` | Shell migration | `anytype-set-calendar-view-dark.png` (Date Property setting — pattern reference) | Month/week/day section rebuild (`:138-149`) |
| T22 | Timeline options popover (`calendar-timeline-toolbar-renderer.ts:60-116`) | — | `createPopoverShell` | Shell migration | `no capture` | Scale-section rebuild (`:119-123`) |
| T23 | Settings entry point (the M4 tangle) | 2 | `createSettingsEntry` | One trigger; the seven dead methods (`:512, :519, :551, :1594, :2239, :2252, :2290`) deleted; `db-view-config-btn` / `db-chart-options-toolbar-btn` / `db-calendar-timeline-options-toolbar-btn` classes kept for the anchor fallbacks (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`) | `anytype-view-settings-panel-dark.png` (one settings surface per view type) | Which panel each view type resolves to |
| T24 | Embedded view toolbar (`embedded-database-renderer.ts:1498-1815`) **[trued 2026-09-05]** | 12 | `createTabStrip` + collapse | **The end state is what the threshold asserts, because it is what the captures can decide.** Controls drop in a stated order matching the captured three-rung ladder — full page: tabs · search · filter · sort · settings · split `New ⌄`; inline (~680px): **the view tab row alone, and not even its trailing `+`** (**D7**, `anytype-page-with-inline-collection-dark.png` read at T001) — no add-view affordance, no icon cluster, no `New` button; phone: `Grid ⌄` as a **dropdown instead of tabs** · settings icon only · split `New | ⌄`, now read off a **real iOS client** rather than marketing creative (`anytype-mobile-sheet-set-viewswitcher-light.png`). So the `New` button, the icon cluster and the add-view `+` all go before the tab row does, and the tab row becomes a dropdown before it is dropped. **"Measured, not a fixed breakpoint" is relabelled source-derived**: only one inline width exists in the sweep, so the captures cannot distinguish the two mechanisms. Copy `chart-renderer.ts:876`'s owner-window `ResizeObserver` resolution rather than reinventing it — `embedded-database-renderer.ts` has none | `anytype-inlinecollection-empty-dark.png` and `anytype-page-with-inline-collection-dark.png` (inline), `anytype-collection-grid-populated-dark.png` (full page), `anytype-mobile-official-ios-06-lists.png` (phone) via `design-trueup.md` REQ-012. **Honesty caveat**: the phone image is App Store / Google Play marketing creative, not an installed-app capture — good evidence of intent, weak evidence of pixels, so no number is taken from it. Hover was never captured, so the inline icons may be hover-revealed rather than absent | `shouldHideHeaderChrome()`'s three codeblock options (`:2410-2416`) — the explicit user hide stays a hide; the 250px sweep floor, which is ours |

---

## 4. WHAT STAYS OURS, AND WHY (the program's rulings)

| Surface family | Ruling | Where it is ruled |
|---|---|---|
| The table view | Stays ours — density, widths, frozen header | Parent `goal.md` §1 "Keep ours where the program says so: the table"; `roadmap.md` §6A row-height decision |
| Formulas / rollups / calculations | Stay ours. **[trued T001]** — the ruling holds, its stated reason does not. `formula` and `rollup` genuinely have no equivalent, but **`Calculate ›` does exist** as a column-header submenu (`anytype-menu-set-column-header-calculate-light.png`, offering `None` and `Count ›`). Ours stays because D4 rules it ours and because our calculation set is far wider — not because nothing comparable exists (D5) | `screenshots/anytype/README.md` mapping table (`formula` → no equivalent; `rollup` → no equivalent); parent `goal.md` D4; `design-trueup.md` T13 |
| The Project Manager 1:1 board and gantt | Not a pixel moves without a recapture read | Parent goal D5; `037`/`038` hold the parity |
| The bottom sheets | `044`'s grammar and `048`'s stacking model are constraints, not deliverables | `044/decision-record.md` ADR-001 (header everywhere, 44px close, 16px inset, 16px title); `048/spec.md` §3 |
| The split New button | Ours, not Anytype's creation pattern | This file T10; `047` §8 records Anytype's contextual creation |
| Group-by's control set | Ours — our board grouping needs it | This file T8 |
| The four non-adoptions | Cross-view drag writes, sidebar widgets, the full template system, dynamic filter values | `050/spec.md` §3 Out of Scope; `047` §11 non-adoptions |

---

## 5. WHAT THIS DOCUMENT DOES NOT SETTLE

- **What the captures actually look like.** This inventory cites the README's written index and
  `047`'s findings; the author's runtime could not render images. T001's record is the proof the
  named PNGs were opened and the design rows trued against them — this document is the claim, not
  the evidence.
- **Whether the chip rail moves into the toolbar band without shifting the table's sticky-offset
  measurement.** Measured, not argued: the lane runs the `.db-header` height check before and
  after the rail's move (risk row 2, `spec.md` §8).
- **Which widths the embed's collapse sweep must cover.** `050` AC-012 says "from 250px upward";
  the sweep's step and ceiling are T008's to record with its first red number.

---

## 6. CORRECTIONS MADE AT LANDING, 2026-09-05

`050`'s `design-trueup.md` landed after this inventory was drafted. Under `050` ADR-003 the capture
is the fact and `047`'s research is a source reading, so the rows below were corrected rather than
left standing. Each is marked **[trued 2026-09-05]** in §3.

| Row | Was | Is | Contradiction |
|---|---|---|---|
| T1 | The tab row's context offers rename / duplicate / remove | A tab row and a trailing `+`. **No view-selector dropdown at that width**, and no tab context menu was ever photographed | C4 |
| T2 | Duplicate joins the tab menu's permanent set | **Duplicate and Remove go in the view-settings panel**, last section below a divider. The tab menu keeps its own action set and its design stays source-derived | C4 |
| T11 / T12 | Dual-mode triggers: `active` toggles chips, `add` opens the panel, the icon reports the state | **Rejected.** The funnel measures `ink=52, blue=0` on a filtered *and* an unfiltered view — identical to the pixel, on all 120 catalogue captures — and the sort glyph's blue is a static two-tone glyph. The trigger carries a **declared state** a lane can read; the behaviour is unchanged | C1 |
| T14 | Auto-hide at `:99` | `:97` | — (line drift, verified at HEAD) |
| T19 | Settings open with an unspecified geometry | **360 × 316px**, 8px radius, 16px padding, 28px rows, layout-adaptive with one `Groups ›` row for a board. Gains the `N applied` label and the Duplicate / Remove section. **No default-template row exists**, so item 10 narrows to per-field new-row defaults | C7 |
| T24 | Collapse by measured natural width | The **end state** is asserted, because the captures can decide it and cannot decide the mechanism. "Measured, not a breakpoint" is relabelled **source-derived**. The phone rung swaps tabs for a dropdown | — |
| Capture gate | "This author's runtime could not render images" | `design-trueup.md` is the read of record; T001's remaining obligation is the captures it did not reach | `050` ADR-003 |

**One row this inventory got right before the true-up did.** T14 already recorded that the chip rail
exists and auto-hides — the parent `goal.md` §2 correction 1 — which is the same finding
`design-trueup.md` REQ-001 reached independently from the tree. Two independent reads agreeing is
the strongest in-repo evidence this program accepts.

**Two values `050` refused, repeated here so this phase does not re-adopt them.** The `#232323` row
highlight at **1.14:1** against its own panel (WCAG 1.4.11 asks 3:1 of a non-text element that is
the only thing identifying state), and colour-only active-state signalling. Our hover and selection
tokens stay ours.

---

## 7. RECONCILIATION, 2026-09-05 (later): the iOS simulator captures landed

`964a0b2a` landed **118 files — 59 states in light and dark — of Anytype's official open-source iOS
client**, built from source and run on a simulator, under `screenshots/anytype/mobile/`, against the
same 326-record demo space the desktop captures used. Real iOS chrome, not the desktop app narrowed.
Each file carries a written description in `screenshots/anytype/README.md`.

**This lands after `050`'s `design-trueup.md`, so it supersedes that document wherever it reports a
phone surface as uncaptured** — which it does often, because the only phone evidence it had was the
twenty App Store and Google Play marketing images in `mobile-official/`. Those stay what they were:
good evidence of intent, weak evidence of pixels, no number taken from them.

**The pixels are unread here.** This landing pass could not open image files, exactly as the drafting
pass could not. Naming a file is not reading it. T001 opens each one; that obligation is unchanged
and is now answerable.

**Six inventory rows gain a phone reference, and one true-up finding is narrowed.**

| Row | What the mobile set adds |
|---|---|
| **T1 / T2 view tabs and their context menu** | **The most consequential.** `design-trueup.md` C4 recorded that no right-click on a view tab was ever captured and that a tab context menu therefore stayed *design inferred from source code, not seen*. On iOS it is captured, twice: `anytype-mobile-sheet-set-viewswitcher-edit` is the view list in an edit mode with **delete handles, reorder grips and a pencil per view**, and `anytype-mobile-sheet-view-edit-more` is indexed as "the view's own action menu". So a per-view action surface **does** exist in the product — on the phone, as a sheet, reached by an explicit Edit affordance rather than by a long-press. **C4's desktop finding is unchanged** (duplicate and remove live in the desktop settings panel); what changes is that "may not design one from a screen nobody saw" no longer applies to the phone half |
| **T11 / T12 the triggers** | `anytype-mobile-sheet-view-settings-gallery` is indexed as "Edit view opened straight from the toolbar" — a sliders icon, one control, no filter/sort icon pair at all. The phone toolbar is a **different control set**, not a narrowed one, which is a second reason the dual-mode rejection holds |
| **T16 / T17 the filter and sort panels** | `design-trueup.md` REQ-013 recorded that **no filter or sort sheet appears in any of the 151 desktop files**. Now four do: `anytype-mobile-sheet-view-filters-empty` (empty state and the `+`), `anytype-mobile-sheet-filter-relation-picker`, `anytype-mobile-sheet-filter-condition-text` (relation, operator, Value, Apply), and `anytype-mobile-sheet-filter-condition-operators` (All / Is / Is not / Contains / Doesn't contain / Is empty / Is not empty). Plus `anytype-mobile-sheet-view-sorts` and `anytype-mobile-sheet-sort-direction` (Ascending / Descending **plus empty-value placement**). **This is the reference `050` item 13 never had** |
| **T19 the view-settings panel** | `anytype-mobile-sheet-view-edit` — "Edit view: Name, Layout, Properties, Filters, Sorts" — is the phone form of the 360px desktop panel, and `anytype-mobile-sheet-view-layout-picker` / `-gallery` / `-kanban` are its layout sub-pages. The desktop panel's **layout-adaptive** behaviour is confirmed on a second form factor: the Kanban layout sheet carries **Group by and Color columns**, the Gallery one **Card size, Image preview, Fit image** |
| **T24 the embed's phone rung** | The three-rung ladder's phone rung was read from marketing creative. `anytype-mobile-set-grid`/`-gallery`/`-list`/`-kanban` are the real thing. **Note the caveat that survives**: these are *full-page* mobile sets, not an inline embed — the inline collapse rung still has no phone capture |
| **T8 group-by** | `anytype-mobile-sheet-kanban-groupby` ("every groupable relation, current one ticked") and `anytype-mobile-sheet-kanban-column-menu` ("Hide column, Column color, Apply") |

**One thing the mobile set says that no desktop capture could**: the iOS client ships **no Calendar
and no Graph layout at all**. Its surface set is narrower than the desktop's rather than a
translation of it, which is worth knowing before treating any phone screen as the desktop screen's
authority.

---

## 8. THE CAPTURE-READ RECORD, T001, 2026-09-05

**The pixels are read.** `design-trueup.md` is T001's output: every row below names the files
actually opened and the one thing the read changed. Where the read contradicts a row in §3 or §4,
the row is corrected in place and marked **[trued T001]**; §8.2 lists the eight contradictions.
This closes AC-112 and satisfies goal D1 for every surface this phase writes.

### 8.1 Per-row record

| Row | Files opened | What the read changed |
|---|---|---|
| T1 | 12 catalogue bars (5 sets × grid/list/kanban/calendar/graph/gallery), `set-viewlist-{light,dark}`, `-dark-full`, `set-kanban-view-dark`, `mobile-sheet-set-viewswitcher-light` | Tab gap **18px** measured; inactive tab `#B6B6B6` at **2.03:1** refused; the view list has **drag grips and no per-row action** |
| T2 | `set-viewlist-light`, `mobile-sheet-set-viewswitcher-edit-light`, `mobile-sheet-view-edit-more-light` | Desktop still unseen and now with a **negative**: the view list carries no per-row action. Phone **seen** — an explicit Edit mode, not a long-press |
| T3 | `set-viewlist-light`, `set-new-object-default-type-for-this-view-light` | The footer-add row (`+`, 28px, below a divider) is one vocabulary across four surfaces; adopted |
| T4 | `set-viewlist-{light,dark}` | This *is* Anytype's hub: 360px, 28px rows, drag grips, **no current-view marker** — marker not adopted |
| T5 | — | `no capture`, and none is possible. Design inferred from source, not seen |
| T6 | — | `no capture`. The object `···` menu is a different surface and is not borrowed |
| T7 | `object-more-light`, `mobile-sheet-set-more-light` | Phone overflow is a **dark platform menu, not a sheet** — recorded, not adopted (D5) |
| T8 | `set-layout-kanban-light`, `set-kanban-view-dark`, `mobile-sheet-kanban-groupby-light` | Grouping has **two desktop entry points**; not adopted (`design-system.md` §10) |
| T9 | — | `no capture`. Design inferred from source, not seen |
| T10 | `set-new-object-{light,dark}`, `-default-type-for-this-view-light`, `-template-for-this-view-light`, `-existing-object-light`, `mobile-sheet-set-newobject-templates-light` | **`050` C7 overturned**: per-view default type and template exist, in this menu. Menu body **288px**, rows 28px. Desktop `New` is **one pill**; the phone's is a **true split** at a 1pt rule |
| T11 | 120 catalogue captures scanned, `set-viewlist-dark-full`, `view-settings-panel-dark` | Funnel `ink=52, sat=0` on filtered **and** unfiltered — C1 re-derived on light theme. Expanded state is a **28×28px `#232323` fill at 1.20:1**, refused |
| T12 | Same 122 | Sort glyph `ink=80, sat=80` in all three states — static. README's "state indicator" reading recorded as **unresolved**, and immaterial to the rejection |
| T13 | `set-view-properties-light`, `set-column-header-{light,dark}`, `-calculate-light`, `-align-light` | **`Calculate ›` exists** — §4's "no Anytype equivalent" is false for calculations. The undisableable `Name` row's greyed-with-a-reason vocabulary adopted |
| T14 | `project-tracker-list-{light,dark}`, `crm-contacts-deals-list-light`, `reading-list-list-light`, `course-notes-list-light`, `content-calendar-list-light`, `set-viewlist-dark-full`, plus 5 negative controls | **`050` C2 overturned**: the rail is captured and fully measured. It already sits **below** the toolbar, so the band move is withdrawn. Direction colour demoted to a redundant signal |
| T15 | 12 `set-filter-<format>-light` + 12 `-condition-` pairs, `-date-picker-`, `-date-relative-` | The rule edit is a **three-level stack**. `✓` on the current choice, the searchable picker and the segmented `Exact \| Relative` adopted |
| T16 | The same 26 files, `set-filter-property-picker-light`, `mobile-sheet-view-filters-empty-`, `-filter-condition-text-`, `-filter-condition-operators-`, `-filter-relation-picker-` | **`050` REQ-013's account superseded**: the populated panel is captured. Its 360px does **not** override our 440-560px role — it measures a split condition, not our single-line row |
| T17 | `set-view-sort-light`, `set-sort-empty-light`, `-added-light`, `-property-picker-light`, `mobile-sheet-view-sorts-light` | **Was `no capture`; now seen.** Rule row **36px on a 48px pitch**. The direction *chooser* is still unseen — `set-sort-direction-*` is byte-identical to `-added-*` |
| T18 | — | `no capture`, confirmed unreachable. ADR-003 corroborated from the side by two greyed-with-a-reason rows |
| T19 | `set-view-settings-{light,dark}`, `-dark-full`, `view-settings-panel-dark`, `set-kanban-view-dark`, `set-view-{layout,properties,filter,sort}-light`, 6 × `set-layout-*-light`, `mobile-sheet-view-edit-light`, `-view-edit-more-`, `-view-layout-picker-`, `-view-settings-gallery-` | 360×315px, 28px rows, 56px name field re-measured. `Groups ›` **confirmed**. **Page limit is per-layout** (Gallery 60, Kanban 10) — `050`'s single 60 corrected. The `N applied` label **widens to every value column** with a worded empty state |
| T20 | — | `no capture`, and none is possible — Anytype ships no chart layout |
| T21 | `set-layout-calendar-light`, `content-calendar-calendar-light` | The Date Property setting is in the **Layout sub-page**, not a popover. Evidence for merging the option popovers into the settings entry, recorded against `spec.md` §11 |
| T22 | — | `no capture`, and none is possible — no timeline layout |
| T23 | `view-settings-panel-dark`, `set-kanban-view-dark`, `mobile-sheet-set-viewswitcher-light` | **One trigger, one surface, branching one level in** — and the phone proves a single trigger carries every view type. Stronger argument for `createSettingsEntry` than §3 made |
| T24 | `page-with-inline-collection-dark`, `inlinecollection-empty-dark`, `collection-grid-populated-dark`, `mobile-set-{grid,list,gallery,kanban}-light`, `mobile-sheet-set-viewswitcher-light` | The inline rung **also drops the trailing `+`**. The phone rung now rests on a real client, not marketing creative. Both "one inline width" and "hover uncaptured" caveats survive |

### 8.2 The eight contradictions this read resolved

Each is expanded in `design-trueup.md` §1 and carried into `decision-record.md`.

| # | Prior claim | Corrected to | Rows |
|---|---|---|---|
| D1 | `050` C2: no chip row on any capture | The rail, measured on 11 captures | T14, T11, T12 |
| D2 | `050` C7: no per-view default in the product | Both, in the New menu | T10, T19 |
| D3 | `050` REQ-013: the filter panel is one add row | That is the empty state | T15, T16 |
| D4 | `050`: page limit **60**, adopted | Per-layout — 60 Gallery, 10 Kanban, absent elsewhere | T19, T24 |
| D5 | §4: calculations have no Anytype equivalent | `Calculate ›` exists; the ruling stands, the reason does not | T13 |
| D6 | §3 T17: sort panel `no capture` | Captured; only the direction chooser is not | T17, T12 |
| D7 | `050` REQ-012: inline is "view tab row only" | And no trailing `+` | T24 |
| D8 | §3 T2: no tab action surface on any form factor | Seen on iOS as an Edit mode | T1, T2 |

### 8.3 What §5 said this document could not settle, answered

- **"What the captures actually look like."** Answered. `design-trueup.md` is the evidence; this
  section is the index into it.
- **"Whether the chip rail moves into the toolbar band without shifting the sticky-offset
  measurement."** **The question is void: the rail does not move.** The capture places it below a
  full-content-width divider, in its own band — where ours already renders. `spec.md` §8's risk
  row 2 and `goal.md`'s open question retire with it.
- **"Which widths the embed's collapse sweep must cover."** Still T008's, unchanged. The read
  sharpens only the drop *order*, not the sweep's step or ceiling.
