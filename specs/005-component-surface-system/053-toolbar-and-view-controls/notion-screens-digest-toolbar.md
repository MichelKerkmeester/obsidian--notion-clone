---
title: "Notion Screens Digest: The View Toolbar and View Controls"
description: "104 Notion captures read against the view toolbar surface — view tabs, add view, filter and sort panels and chips, group, properties/columns, search, new record split button, settings gear, overflow menu, collapse on narrow widths — with the recurring patterns, what our tree already does about each, and where Anytype and Notion disagree."
date: 2026-09-06
surface: "005-component-surface-system/053-toolbar-and-view-controls"
phase: "research"
---
# Notion Screens Digest: The View Toolbar and View Controls

> Every value below was read off a file in `screenshots/notion/`, cited by screen id. Where a claim
> compares against our tree, it cites `src/`:line at the current worktree HEAD
> (`c45c53c3` "componentize the database toolbar onto five shared primitives" and later). Where a
> claim compares against Anytype, it cites `../050-anytype-adoption/design-trueup.md` or this
> packet's own `design-trueup.md`.

---

## 1. Selection

**104 screens read** (Read tool, one call per image), from:

| Folder | Read | Notes |
|---|---:|---|
| `ios/views/` | 14 | board, calendar, table, list, gallery, database — 2-3 per layout |
| `ios/database/` | 17 | filters, sort, group-by, properties, property-editor, buttons |
| `ios/flows/*` (16 flow folders) | 23 | adding-a-new-data-source, adding-a-new-sort, adding-a-table-view, changing-database-view, changing-layout, database-settings, deleting-a-view, layout, searching-database, setting-up-filter, sorting-a-database, sorting-pages, switching-to-board/chart/database-layout, view-options |
| `web/views/` | 16 | board, calendar, chart, gallery, kanban, list, table, database, full-width |
| `web/database/` | 11 | filters, group-by, properties, property-editor, buttons |
| `web/flows/*` (10 flow folders) | 18 | adding-an-advanced-filter, creating-a-view-dashboard, filtering-a-database(-2/-advanced), filtering-and-sorting-a-table, sorting-a-database(-2), switching-layouts, switching-to-fullscreen-view, searching-a-database(-2) |
| targeted theme check | 4 | one screen each from `ios/views`, `ios/database`, `web/database` chosen by pixel-sampling for a dark background, plus the one confirmed dark web capture |

**How folders were widened.** Started from the hint list in the brief, then grepped the README's
per-file index for every screen whose `Found by` matches a surface word (`filter`, `sort`, `group`,
`view`, `properties`, `search`, `settings`) inside `ios/views`, `ios/database`, `web/views`,
`web/database` and their flow siblings, before sampling. This surfaced the `buttons` and
`property-editor` groups, both of which turned out mostly off-topic (below).

**What was skipped, and why.**

- **Near-duplicate flow starts.** Several flows begin from the same screen id — `74da3d7a` (the
  "To do list" database) recurs across `database-settings`, `searching-database` and
  `sorting-a-database`; `320f03de` (the Layout picker) recurs across all three `switching-to-*`
  flows; `6f13a52e` (the "Team" table) recurs across `creating-a-view-dashboard`,
  `filtering-a-database-2`, `sorting-a-database`, `switching-layouts` and `searching-a-database`.
  Each was opened once, at its first useful occurrence, and later occurrences were skipped by id
  rather than re-read.
- **Off-topic despite an on-topic folder name.** The README's own caveat ("the group is the query,
  not a verified reading of the image") held throughout: `ios/database/buttons` surfaced an
  AI-character customization sheet, not a button component; `ios/database/property-editor`
  surfaced a "turn into task database" wizard and a template-recurrence editor; `web/database/buttons`
  and `web/database/property-editor` surfaced workspace admin (emoji settings, teamspaces) and an
  AI-agent automation dialog; several `ios/views/*` and `ios/database/*` files labelled `calendar`,
  `list`, `gallery`, `group-by`, `properties` and `sort` actually showed a date-value picker, a
  table-of-contents hint, an Unsplash embed picker, a plain checklist page, a "turn into task
  database" dialog and a chart-axis config screen respectively. These are read (they are in the
  table below) and marked off-topic rather than silently dropped, per the README's own accounting
  of loose relevance.
- **Full folder exhaustion was not attempted.** `ios/views/` alone holds 153 files and
  `web/database/` 77; reading every file in every candidate folder would have exceeded the 120-image
  budget several times over for diminishing return once a layout's toolbar and settings shape
  repeated three times running. Variety (platform × theme × populated/empty × menu open/closed) was
  prioritized over exhaustion inside any one folder, per the brief.

**Theme coverage — a corpus fact, not a sampling gap.** Pixel-sampled all 247
`ios/views/*` + `ios/database/*` files and all 219 `web/views/*` + `web/database/*` files (resize to
40×40, mean channel value). **Zero** of the 247 iOS files read as dark theme; three of the 219 web
files sampled dark, and two of those three are light-theme screens under a dimmed onboarding-modal
scrim (`web/database/buttons-06`, confirmed by opening it) rather than genuine dark theme. Exactly
**one** confirmed dark-theme capture exists for this surface in the whole harvest:
`web/views/notion-web-views-list-04` (id `9aed23d0`, a dark "Task Database" table with the same
icon-cluster toolbar as every light capture). Read it and cite it in Pattern 1 below rather than
skip it as a duplicate. **This packet's own captures are therefore compared against Notion at ~99%
light-theme fidelity**; a dark-theme cross-check of Notion's toolbar chrome specifically is not
possible from this harvest and is named as an open question (§6).

**Capture geometry, restated from the README.** iOS files are 299×678/680px, web files 768×521/523px
— both are Mobbin's scaled thumbnails, not 1:1 captures. Every pixel-ish measurement below (icon
counts, row order, relative proportions) is read at thumbnail scale and should be treated as
structural evidence (what exists, what order, what groups together), not as a source of adoptable
px values the way `design-trueup.md`'s 1:1 Anytype catalogue is. No px value from this digest is
proposed for adoption on that basis alone.

---

## 2. Per-screen table

One row per screen read, in folder order. "Values" is what was measurable at thumbnail scale, or
`—` for a screen that turned out off-topic to this surface (kept per the note above).

### ios/database

| Id | Theme | Path | Mobbin | Content | Values |
|---|---|---|---|---|---|
| `f1f5e9d7` | light | `ios/database/notion-ios-database-buttons-01-…webp` | [screen](https://mobbin.com/screens/f1f5e9d7-c3f3-433f-8a38-8856464dd56f) | Off-topic: AI-agent icon/name/instructions editor | — |
| `8a7eeea7` | light | `ios/database/notion-ios-database-buttons-03-…webp` | [screen](https://mobbin.com/screens/8a7eeea7-95ba-4ce1-ae07-2bb8063f3b16) | "View options" full sheet: View name field, Layout/Properties/Filter/Sort/Group/Automations rows each with a value summary, "Customize \<view\> Notes", Lock/Copy link/Duplicate | 10 rows, every settings row carries a value column (`2 shown`, `None`×4) |
| `1d5d6adc` | light | `ios/database/notion-ios-database-filters-01-…webp` | [screen](https://mobbin.com/screens/1d5d6adc-4e6f-41d9-9831-245a420d790b) | "1 filter" root sheet: Sort row, Advanced filter row (1 rule), property search, property list | 2-tier filter entry: Sort + Advanced filter as sibling rows above the plain property list |
| `1f10ae24` | light | `ios/database/notion-ios-database-filters-04-…webp` | [screen](https://mobbin.com/screens/1f10ae24-57fe-4c4b-92b1-048456640ee1) | "Advanced filter" condition row: Title/Is/Value(Edit)/Remove(red)/Duplicate/Turn into group, +Add filter rule, +Add filter group, Delete filter | one condition per row, structured fields not a phrase |
| `d6d8022a` | light | `ios/database/notion-ios-database-filters-08-…webp` | [screen](https://mobbin.com/screens/d6d8022a-b391-45c1-8901-8200803b9baa) | Comparator picker stacked over the condition row: Is/Is not/Contains/Does not contain/Starts with/Ends with | 3-level stack (panel → condition → operator), matches Anytype T15 |
| `6c740ed6` | light | `ios/database/notion-ios-database-filters-12-…webp` | [screen](https://mobbin.com/screens/6c740ed6-969e-427c-828d-00b779664287) | Mislabeled (filters folder): "Group by" property picker, None checked | off-topic to filters; on-topic to group-by |
| `3cb253aa` | light | `ios/database/notion-ios-database-group-by-03-…webp` | [screen](https://mobbin.com/screens/3cb253aa-3a56-462b-9cee-76decd1366a6) | Off-topic: plain "Weekly Plan" checklist page | — |
| `6b0b6aa6` | light | `ios/database/notion-ios-database-group-by-11-…webp` | [screen](https://mobbin.com/screens/6b0b6aa6-7d3a-4a0a-9f56-e548f0f4d6dd) | Populated List-style rows under the same 4-icon toolbar as board/calendar | confirms one toolbar shape across layouts |
| `8bb9115f` | light | `ios/database/notion-ios-database-properties-01-…webp` | [screen](https://mobbin.com/screens/8bb9115f-e0da-4e01-bd9d-2b627a4b6727) | "Properties" (edit) sheet: search, Title/Column rows (chevron → type editor), +New property | distinct from "Property visibility" (eye toggles) — two surfaces |
| `050083af` | light | `ios/database/notion-ios-database-properties-08-…webp` | [screen](https://mobbin.com/screens/050083af-8fc7-4f2b-9e96-defe72762eb6) | Mislabeled: "Turn into task database" property-mapping wizard | off-topic |
| `142cef4e` | light | `ios/database/notion-ios-database-properties-16-…webp` | [screen](https://mobbin.com/screens/142cef4e-fe09-4fc9-bab5-59d0e4e72de1) | Mislabeled: "Conditional color" feature + property picker | Notion-only feature, no Anytype or our equivalent |
| `658fd83b` | light | `ios/database/notion-ios-database-property-editor-02-…webp` | [screen](https://mobbin.com/screens/658fd83b-c23b-4573-aac8-a18e06e185a1) | Mislabeled: database-template list + "use as default template" scope modal (For all views / Only on this view) + template row menu | matches Anytype T10's per-view default finding independently |
| `0568e792` | light | `ios/database/notion-ios-database-property-editor-10-…webp` | [screen](https://mobbin.com/screens/0568e792-f357-4298-8d32-d373273b836e) | Properties list with mixed types + AI-autofill toast | on-topic, low new signal |
| `4593d681` | light (scrim over light) | `ios/database/notion-ios-database-property-editor-12-…webp` | [screen](https://mobbin.com/screens/4593d681-5b8a-4959-a93f-8d3b740e2f54) | Off-topic: template recurrence-cadence editor | — |
| `84653307` | light | `ios/database/notion-ios-database-sort-01-…webp` | [screen](https://mobbin.com/screens/84653307-d85f-4766-991d-f060f6cfe1ac) | Sort detail: Title/Descending/Delete(red), +Add sort, Delete sort (greyed, single sort) | per-sort row, not aggregate |
| `e9698e1b` | light | `ios/database/notion-ios-database-sort-06-…webp` | [screen](https://mobbin.com/screens/e9698e1b-5bfb-4588-b07f-343900daf469) | Mislabeled: "Group" config panel — Group by/Text by/Sort/Hide empty groups, per-group eye toggles, Remove grouping | richer group panel than ours or Anytype's |
| `ac0d576b` | light | `ios/database/notion-ios-database-sort-10-…webp` | [screen](https://mobbin.com/screens/ac0d576b-6e42-4ee3-b8b1-e74f0d998a9e) | Full "Settings" root sheet: Filter/Sort/Group/Conditional color/Sub-items/Copy link, Data source settings (Source/Edit properties/Automations/AI Autofill/More settings), Open as full page/Manage data sources/Unlock database | 15 rows total, richest settings sheet read |
| `94f0fd50` | light | `ios/database/notion-ios-database-sort-14-…webp` | [screen](https://mobbin.com/screens/94f0fd50-1baa-47ad-a966-34a55e4c8d5f) | Mislabeled: Chart type config (X/Y axis, chart-type icons) | on-topic to view-type-specific settings, off-topic to sort |

### ios/flows

| Id | Theme | Path (flow) | Mobbin | Content | Values |
|---|---|---|---|---|---|
| `bdd3608f` | light | `adding-a-new-data-source/…01` | [screen](https://mobbin.com/screens/bdd3608f-ed64-4909-b79e-3f1983539e0c) | Off-topic: AI meeting-transcript block | — |
| `6bf42839` | light | `adding-a-new-data-source/…02` | [screen](https://mobbin.com/screens/6bf42839-bdee-41b2-89ff-8ae5394fb8a2) | "Settings" root sheet, `Property visibility` row greyed, Lock/unlock row toggled to "Lock database" | confirms settings-sheet row set varies by state |
| `794591f5` | light | `adding-a-new-sort/…01` | [screen](https://mobbin.com/screens/794591f5-f9b6-4416-8c0c-bea36a0e1e65) | "Manage data sources": Source (1 view, `···`), +Add data source, Linked: +Link existing data source | Notion-only multi-source concept |
| `995ca0e3` | light | `adding-a-new-sort/…03` | [screen](https://mobbin.com/screens/995ca0e3-a4e7-448b-be55-5c66f8a7c79e) | "View options" sheet, value-summary rows (2nd confirming instance) | reconfirms Pattern 3 |
| `77b8a9bb` | light | `adding-a-table-view/…01` | [screen](https://mobbin.com/screens/77b8a9bb-28e0-4edc-a399-b773dc53567f) | Richer "Sort" sheet variant: Activity/Ascending/Delete, +Add sort/Delete sort, **Save for everyone** (orange), Reset sorts, More options | shared/personal-view-edit state, no Anytype or our equivalent |
| `101392c7` | light | `adding-a-table-view/…10` | [screen](https://mobbin.com/screens/101392c7-454e-43cd-8810-06cb683194fa) | Off-topic: block-editor formatting toolbar | — |
| `07cec641` | light | `changing-database-view/…02` | [screen](https://mobbin.com/screens/07cec641-aacc-45b9-a558-ca28e8ed9c38) | "Team Home" embedded database: `All Tasks⌄ ↗ ··· [New⌄]`, `🔍Search ↑Date Created⌄ +Add filter` text row, `COUNT 2 \| Calculate⌄` footer | text-label toolbar variant + footer calculate row |
| `888fb63c` | light | `changing-layout/…02` | [screen](https://mobbin.com/screens/888fb63c-bf82-4c5d-9eba-5286c404f9bf) | Off-topic: block-editing keyboard toolbar | — |
| `7d30bac2` | light | `changing-layout/…04` | [screen](https://mobbin.com/screens/7d30bac2-28fb-4629-8fa0-e4cd46e38547) | "3 views" hub: To do list/Table/This Week rows (per-view icon matching layout, per-row `···`), +New view (Table, chart, form and more), +New data source | Notion's all-views hub, per-row action present |
| `52348672` | light | `database-settings/…02` | [screen](https://mobbin.com/screens/52348672-5d4a-4133-8ffb-f1845d73f826) | Layout picker sheet (2nd confirming instance) | reconfirms tile grid + per-layout toggle set |
| `faaf3dc5` | light | `database-settings/…03` | [screen](https://mobbin.com/screens/faaf3dc5-741b-41d9-aa33-e29444769c81) | Full "Settings" sheet, populated title (3rd confirming instance) | reconfirms Pattern 3 |
| `55602f6a` | light | `deleting-a-view/…03` | [screen](https://mobbin.com/screens/55602f6a-072b-47bd-af28-c234ec299245) | **Delete-view confirm modal**: radio "Delete view only" (kept, selected) vs "Delete view and data source", red Delete button, Cancel | explicit two-scope destructive confirm |
| `348fd2b7` | light | `deleting-a-view/…04` | [screen](https://mobbin.com/screens/348fd2b7-e0d1-4b91-90ad-690f5bf2d98c) | Same modal, second option selected — button label changes to match | radio + button-label binding |
| `320f03de` | light | `layout/…02` | [screen](https://mobbin.com/screens/320f03de-6340-4a6a-ad48-f38383f18c58) | Layout picker sheet (populated) | 3rd confirming instance |
| `d426cb7f` | light | `searching-database/…02` | [screen](https://mobbin.com/screens/d426cb7f-abd5-4933-b5c7-edaedd98f442) | Search icon → inline "Type to search…" field replaces the view-name row, keyboard open | in-toolbar search, not a popover |
| `d3de8071` | light | `searching-database/…03` | [screen](https://mobbin.com/screens/d3de8071-5d1a-4418-aa12-d6ff44af3128) | Search applied ("Monday"), live-filtered to one row, clear "×" | confirms live filter + clear affordance |
| `86a8e66c` | light | `setting-up-filter/…02` | [screen](https://mobbin.com/screens/86a8e66c-2ca9-4f11-90b3-17dd3e7367d9) | "Add filter" simple sheet: Filter by… search, flat property list, +Add advanced filter footer | 2-tier filter entry (simple list → advanced builder) |
| `1067756c` | light | `sorting-a-database/…03` | [screen](https://mobbin.com/screens/1067756c-30d6-49b8-bffe-8ae440649969) | "New sort" property picker: Sort by… search + flat list | searchable picker, matches Anytype's convention |
| `3779c4f7` | light | `sorting-pages/…01` | [screen](https://mobbin.com/screens/3779c4f7-a6f6-4cee-b379-32e512d53f49) | Off-topic: app home/sidebar (Recents, Private) | — |
| `c9d34319` | light | `switching-to-board-layout/…04` | [screen](https://mobbin.com/screens/c9d34319-8700-442b-8806-2f2fcb475034) | Board populated, "Done" column with per-column `···` and `+` add-column | confirms per-column menu, same toolbar |
| `eb167dde` | light | `switching-to-chart-layout/…03` | [screen](https://mobbin.com/screens/eb167dde-eec3-4199-8c49-5d89b7d045e4) | Chart-type config screen (2nd confirming instance) | reconfirms view-type-specific settings block |
| `0193b407` | light | `switching-to-database-layout/…02` | [screen](https://mobbin.com/screens/0193b407-2676-4f20-a428-06c7f8cff72a) | Simpler "Settings" variant with **no** Filter/Sort/Group rows: title, Show data source title, Show icons in heading (disabled), Copy link, Manage data sources, Lock database | settings row set is context-dependent, not fixed |
| `213f8a7c` | light | `view-options/…01` | [screen](https://mobbin.com/screens/213f8a7c-6c38-4b4e-9daa-b9cff99cdec2) | "Today Notes", text-label toolbar (`Table⌄ ··· [New⌄]` + `Search  +Add filter` row), footer `Calculate⌄ Calculate⌄`, keyboard open editing a cell | text-label toolbar variant, 2nd instance |
| `e4dfff31` | light | `view-options/…03` | [screen](https://mobbin.com/screens/e4dfff31-b1da-4d5a-8e36-b33ea9c54e96) | "View options" sheet, value summaries (4th confirming instance) | reconfirms Pattern 3 |

### ios/views

| Id | Theme | Path | Mobbin | Content | Values |
|---|---|---|---|---|---|
| `71f9dba2` | light | `views/…board-01` | [screen](https://mobbin.com/screens/71f9dba2-130f-406e-b4fe-781f227f51b8) | "To do list" board start, toolbar `Need to do⌄ 🔍 ≡ ⚏⚏ [+⌄]` | 4 icon buttons + split New button, right of view-name dropdown |
| `9d7ffd05` | light | `views/…board-03` | [screen](https://mobbin.com/screens/9d7ffd05-6eaa-4e65-954c-e0e09c99b577) | Layout picker (Board selected) + per-layout settings incl. Group by, Color columns, Card preview/size | 11-layout tile grid, 8 settings rows for Board |
| `7be7fafb` | light | `views/…calendar-01` | [screen](https://mobbin.com/screens/7be7fafb-3dfb-42e9-855a-832a431a053b) | Calendar month grid, same 4-icon toolbar as board-01 | confirms one toolbar shape across layouts |
| `5bac3734` | light | `views/…calendar-08` | [screen](https://mobbin.com/screens/5bac3734-42a0-4868-a77e-a9be29ce8502) | Mislabeled: Date-property value picker | off-topic |
| `d3acf726` | light | `views/…table-01` | [screen](https://mobbin.com/screens/d3acf726-47cf-46f4-bd0d-65788523dc3b) | Layout picker (Table selected): vertical lines/page icon/wrap/open-in/load-limit, **no** Group-by row | per-layout settings row set differs |
| `664b0f07` | light | `views/…table-07` | [screen](https://mobbin.com/screens/664b0f07-e153-4231-af93-70a084d10a18) | Table scrolled to header only, share/comment/`···` visible, no view toolbar in frame | no measurable toolbar |
| `2517d4cf` | light | `views/…table-15` | [screen](https://mobbin.com/screens/2517d4cf-7998-4f68-a689-20489ef18ec0) | "Settings" root sheet (dimmed) behind a "link copied" toast: Filter/Sort/Group/Conditional color/Sub-items/Copy link/Data source settings | 1st sighting of the settings-root pattern |
| `4ad41221` | light | `views/…list-01` | [screen](https://mobbin.com/screens/4ad41221-d2e4-4534-bd0b-855f4b939eb8) | Layout picker continued + List-specific settings (Card preview, Fit media, Card layout Compact/List) | per-layout settings differ again |
| `fb6838a2` | light | `views/…list-12` | [screen](https://mobbin.com/screens/fb6838a2-c6ff-46c1-986e-c05ef71ee638) | Off-topic: plain page ToC hint | — |
| `6db99f87` | light | `views/…gallery-01` | [screen](https://mobbin.com/screens/6db99f87-62f1-4e09-bfd3-151cbe473a42) | Off-topic: Unsplash embed picker | — |
| `ddcba3da` | light | `views/…gallery-06` | [screen](https://mobbin.com/screens/ddcba3da-9557-4a83-adca-3aa6a81e16b0) | "Property visibility" sheet: search, "Shown in gallery" + Hide all, eye-toggle rows, Style properties | distinct from the edit-type "Properties" sheet |
| `2cb53019` | light | `views/…database-01` | [screen](https://mobbin.com/screens/2cb53019-fd9e-4f13-8497-df283445101c) | Table + "Data source actions" sheet: Add a new view/Copy link/Duplicate view/View database/Edit title/Edit icon | data-source-level overflow, 6 actions |
| `89f232fa` | light | `views/…database-04` | [screen](https://mobbin.com/screens/89f232fa-0ec1-4c35-87d7-7d7c4d73f866) | Same page, populated + "Agent deleted successfully" toast (theme check) | confirmed light, no new signal |
| `ea532678` | light | `views/…database-09` | [screen](https://mobbin.com/screens/ea532678-a727-44b3-ba6d-72bf3b119ba4) | "New data source⌄" placeholder row above the same 4-icon toolbar, empty grid | pre-named creation state |
| `026940b3` | light | `views/…database-16` | [screen](https://mobbin.com/screens/026940b3-e0de-443d-a948-6eb1e53e4ea1) | Cell selected, floating mini toolbar `↔ ···` | column-resize/menu affordance, minor |

### web/database

| Id | Theme | Path | Mobbin | Content | Values |
|---|---|---|---|---|---|
| `b9897a10` | light | `database/…buttons-01` | [screen](https://mobbin.com/screens/b9897a10-73de-4b6a-920f-76f290947954) | Off-topic: workspace admin teamspaces list | — |
| `865da2ba` | light | `database/…buttons-05` | [screen](https://mobbin.com/screens/865da2ba-9d23-4f02-b24e-b0e4fe577224) | Off-topic: "Create a new teamspace" modal | — |
| `dc48a33a` | light + scrim | `database/…buttons-06` | [screen](https://mobbin.com/screens/dc48a33a-0557-4a66-ba2c-cd8cf7018a49) | Off-topic: onboarding "What is this space for?" modal (theme check) | confirmed light-under-scrim, not dark |
| `56aa9350` | light | `database/…filters-01` | [screen](https://mobbin.com/screens/56aa9350-dfa8-4b57-a296-5ad2aa18137c) | Mislabeled: search icon expanded to inline "Smith" query in the icon-cluster toolbar | web search-in-toolbar, matches iOS behaviour |
| `8cbe99a8` | light | `database/…filters-02` | [screen](https://mobbin.com/screens/8cbe99a8-57a4-40e6-85c8-5f55712b6cf3) | Off-topic: block/slash menu | matches README's own named example of this exact mismatch |
| `53858386` | light | `database/…filters-03` | [screen](https://mobbin.com/screens/53858386-6aba-40c7-a0f6-bc3b5aed0e49) | Off-topic: code block + language picker | — |
| `935b4300` | light | `database/…group-by-01` | [screen](https://mobbin.com/screens/935b4300-77d3-47f8-aa2e-5277e745d7ec) | Dashboard: Chart above Table, `Count all` footer on both | footer/calculate row present on web too |
| `39684b6e` | light | `database/…properties-01` | [screen](https://mobbin.com/screens/39684b6e-3307-402e-bdaf-7a0f3e668673) | Off-topic: AI-agent "fill in property" dialog | — |
| `35c32af9` | light | `database/…properties-03` | [screen](https://mobbin.com/screens/35c32af9-0c3b-4ecb-a2e4-aa293fafb9dc) | "Property visibility" **docked right panel**: "Shown in board" (Name) / "Hidden in board" (rest) with Show all | two-section grouping, unlike iOS's flat eye-toggle list |
| `c08e8ce9` | light | `database/…property-editor-01` | [screen](https://mobbin.com/screens/c08e8ce9-74ff-41c3-ab52-a750a3ad1f1d) | Off-topic: workspace emoji admin settings | — |
| `6ff60437` | light | `database/…property-editor-07` | [screen](https://mobbin.com/screens/6ff60437-cdbb-4ef5-b1a4-d0901d13dfdb) | Off-topic: page-automation config ("When page added → Do send notification") | adjacent (automations), not this surface |
| `2e44a0e9` | light | `database/…property-editor-13` | [screen](https://mobbin.com/screens/2e44a0e9-376b-4cff-9190-e05a2e94de92) | Off-topic: "What is this space for?" onboarding modal | — |

### web/views

| Id | Theme | Path | Mobbin | Content | Values |
|---|---|---|---|---|---|
| `98dde396` | light | `views/…board-01` | [screen](https://mobbin.com/screens/98dde396-5c07-422d-a99c-885c83220249) | Board + Dashboard tabs, icon-cluster toolbar, "Property visibility" right-docked panel open | icon-only cluster when 2 tabs are shown |
| `4c2cbe60` | light | `views/…calendar-01` | [screen](https://mobbin.com/screens/4c2cbe60-ba3b-43b3-8fbc-e98c8fb486d2) | Mislabeled: cover-photo page + date picker | off-topic |
| `420dd630` | light | `views/…chart-01` | [screen](https://mobbin.com/screens/420dd630-80ee-4048-9348-f4a1342d2435) | Chart view, right-docked "View settings" panel: View name, Layout, Chart type icons, Data (What to show/Slice by/Sort by), Style, Source/Filter/View archived pages/Save chart as | full desktop view-settings panel is right-docked, not centered |
| `2a3c9ede` | light | `views/…chart-03` | [screen](https://mobbin.com/screens/2a3c9ede-fa76-4e52-8b0d-b1ae025ec0c6) | Empty Dashboard, icon-only layout-type picker row + "+New view" | lightweight add-view for dashboard blocks |
| `9232120f` | light | `views/…gallery-01` | [screen](https://mobbin.com/screens/9232120f-819a-4e89-9f15-0aeee7d849c6) | Off-topic: template marketplace listing page | — |
| `44453ef6` | light | `views/…gallery-05` | [screen](https://mobbin.com/screens/44453ef6-a197-4976-97ef-dbd753bb7559) | Off-topic: template marketplace grid | — |
| `69f98d1d` | light | `views/…kanban-01` | [screen](https://mobbin.com/screens/69f98d1d-b556-4a33-90f4-a0e98b6b9032) | Near-duplicate of board-01 (same dataset, Board selected) | 2nd confirming instance of icon cluster + right panel |
| `0bd76f5f` | light | `views/…kanban-02` | [screen](https://mobbin.com/screens/0bd76f5f-9281-4d76-933e-cafe385ef965) | Gallery view of the same database, cover-image cards | icon cluster order confirmed a 3rd time |
| `d6621c97` | light | `views/…list-01` | [screen](https://mobbin.com/screens/d6621c97-f36f-469d-ab54-77d753630d4d) | Off-topic: global "All search results for 'tasks'" page | workspace search ≠ in-view search |
| `d8abbe0b` | light | `views/…list-06` | [screen](https://mobbin.com/screens/d8abbe0b-4c55-4316-91b7-2e6b4baecb52) | Filter chip row: `Role: Senior Designer, Ju…⌄ \| +Filter`, value picker with checkboxes open | one-line chip row below tabs, directly comparable to our chip rail |
| `3b3c3c26` | light | `views/…table-01` | [screen](https://mobbin.com/screens/3b3c3c26-58ac-42ec-9ddd-f4783d4f5f4f) | Plain populated table, icon-cluster toolbar | baseline icon order |
| `0159ba7f` | light | `views/…table-07` | [screen](https://mobbin.com/screens/0159ba7f-b03b-4b57-b6fe-d44d8ade6ac7) | Column-header context menu: Edit property→Change type (Sort:Manual, reorderable options)/AI Autofill/**Filter/Sort/Group/Calculate**/Freeze/Hide/Wrap/Insert/Duplicate/Delete | converges with our own column menu's Filter/Sort/Group/Calculate set |
| `a99dd612` | light | `views/…full-width-02` | [screen](https://mobbin.com/screens/a99dd612-0fd8-4f03-b178-dba44ae3dd7b) | Off-topic: cover-photo page | — |
| `2f7bbc1f` | light | `views/…database-01` | [screen](https://mobbin.com/screens/2f7bbc1f-a8a0-4fd4-ba5f-aa6c5ef86ceb) | "+Add view" inline picker: "Start from scratch" 11-icon layout grid + "Or describe a view…" AI text box | AI-generated view is Notion-only, no Anytype/ours equivalent |
| `82d66d47` | light | `views/…database-15` | [screen](https://mobbin.com/screens/82d66d47-ccea-421c-8ef8-94e855c1163f) | Sort property picker: Sort by… + flat list | matches iOS pattern |
| `f63163ee` | light | `views/…database-30` | [screen](https://mobbin.com/screens/f63163ee-9eaa-4c17-9095-9e00d896a659) | Row-selection bulk toolbar (2 selected) + "Search actions…" command palette (Edit icon/Edit property/Copy links/Duplicate/Move to/Archive/Move to Trash) | adjacent surface (bulk row actions), not this toolbar |
| `9aed23d0` | **dark** | `views/…list-04` | [screen](https://mobbin.com/screens/9aed23d0-f039-4685-aeb1-8a0f81628796) | "Task Database", All tasks/By status tabs, dark theme, same icon-cluster toolbar | only confirmed dark-theme capture of this surface |

### web/flows

| Id | Theme | Path (flow) | Mobbin | Content | Values |
|---|---|---|---|---|---|
| `8ff7ae4b` | light | `adding-an-advanced-filter/…01` | [screen](https://mobbin.com/screens/8ff7ae4b-40f0-4d9b-bb30-611469098554) | Chip row + "Filter by…" property picker (Name/Date/ID) + "+Add advanced filter" | 2-tier filter entry on web, matches iOS |
| `41665ca0` | light | `adding-an-advanced-filter/…04` | [screen](https://mobbin.com/screens/41665ca0-55f1-4c1b-a847-10820eaab02c) | Advanced builder: "2 rules", `Where [Name][Is not empty]···`, `And⌄`, `Where […]`, +Add filter rule, Delete filter | structured nested rows, not a phrase chip |
| `6f13a52e` | light | `creating-a-view-dashboard/…01` | [screen](https://mobbin.com/screens/6f13a52e-d5d2-427a-b6a0-7318eb1affce) | Plain "Team" table (flow-start screen, recurs across 5 flows) | baseline |
| `6ad9e8d1` | light | `creating-a-view-dashboard/…04` | [screen](https://mobbin.com/screens/6ad9e8d1-ebba-4221-9934-9e82ae321802) | Empty Dashboard: "Add charts, tables, lists / Edit dashboard" | Notion-only view type |
| `a77baf41` | light | `creating-a-view-dashboard/…09` | [screen](https://mobbin.com/screens/a77baf41-df18-476f-aa48-c1023269bb8c) | Populated Dashboard, one Chart block with its own filter/sort icons + "+add block", "Done" edit mode | block-level controls inside a dashboard view |
| `24295cd3` | light | `filtering-a-database-advanced/…05` | [screen](https://mobbin.com/screens/24295cd3-d92b-453e-8566-2f4f50fe14db) | Advanced builder, "2 rules" (2nd dataset) | reconfirms nested-row builder |
| `9693630d` | light | `filtering-a-database/…01` | [screen](https://mobbin.com/screens/9693630d-784e-459c-9bd0-76db35d32b99) | "User Interviews" table, no chip row, **text-label toolbar** (`Filter Sort ⚡ 🔍 ··· New⌄`), Tags column | text-label variant confirmed unfiltered |
| `13bbee6c` | light | `filtering-a-database/…05` | [screen](https://mobbin.com/screens/13bbee6c-0965-4c08-8d76-91e2a41dd09a) | Filter value picker: checkbox list (South/East/Adult only/Child 6-12/Child <5) under Contains/Does not contain/Is empty/Is not empty | tag-style multi-value picker |
| `21d71e5f` | light | `filtering-and-sorting-a-table/…01` | [screen](https://mobbin.com/screens/21d71e5f-76a6-4d62-834a-388b5d433942) | "Creative pipeline" table, **no visible view-tab row at all**, icon-cluster toolbar | icon-only even with a single implicit view |
| `4f6ed519` | light | `filtering-and-sorting-a-table/…05` | [screen](https://mobbin.com/screens/4f6ed519-5b04-4123-b8ce-82e225e794fc) | Same, hover-revealed `+`/drag-grip before the title | minor hover-state, low signal |
| `a9f0dfea` | light | `searching-a-database-2/…02` | [screen](https://mobbin.com/screens/a9f0dfea-55f8-434c-8d46-156624fd8d86) | Search expanded in the text-label toolbar, footer `Calculate⌄` visible | confirms search works identically in both toolbar densities |
| `792336a7` | light | `searching-a-database/…02` | [screen](https://mobbin.com/screens/792336a7-3064-4872-95c3-4387f9b344d0) | Search expanded in the icon-only toolbar | same |
| `9e80b489` | light | `sorting-a-database-2/…02` | [screen](https://mobbin.com/screens/9e80b489-cadb-42dd-b321-b2a67d52a3d4) | Full right-docked "View settings" panel: View name, Layout, **Property visibility 6**, Filter, Sort, Group, Conditional color, Copy link, Data source settings (Source/Edit properties/**Automations 1**/**AI Autofill 1**/View archived pages/More settings), Manage data sources/Lock database/Manage in Calendar | value-badge-per-row pattern, richer than Anytype's |
| `d89efb14` | light | `sorting-a-database/…03` | [screen](https://mobbin.com/screens/d89efb14-f7fd-4d1f-8395-1bfda1c7e6ae) | Sort **chip row**: `+Name⌄ [Ascending⌄] ×`, `Role⌄`, `+Sort`, popover below (Name/Ascending, +Add sort/Delete sort) | chip-per-sort, two-part property+direction control |
| `e3ebbca9` | light | `switching-layouts/…02` | [screen](https://mobbin.com/screens/e3ebbca9-048c-4025-931e-3d4038ef82e5) | Timeline view: `No date (1) \| Manage in Calendar \| Month⌄ ‹Today›` added to the icon row | view-type-specific toolbar additions |
| `6d9641f2` | light | `switching-layouts/…05` | [screen](https://mobbin.com/screens/6d9641f2-a575-4695-92ef-aea771018018) | Map view: `No place (1)` + icon row | Notion-only layout, no Anytype/ours equivalent |
| `795eb9b5` | light | `switching-layouts/…11` | [screen](https://mobbin.com/screens/795eb9b5-5985-4a31-b9bb-ba1919448c40) | Near-duplicate of the "Creative pipeline" no-tabs table | reconfirms icon-only-with-no-tabs case |
| `a8a5865d` | light | `switching-to-fullscreen-view/…02` | [screen](https://mobbin.com/screens/a8a5865d-1c22-4423-9a45-7a9fc44007cf) | "User Interviews", Table+Timeline tabs, `Filter Sort ⚡` then search expanded inline | text-label toolbar + inline search together |

---

## 3. Patterns

Ordered by how much of the surface they define.

### P1 — The toolbar row: tabs, a control cluster, and a split New button (~30 screens)
Every populated database screen (`71f9dba2`, `7be7fafb`, `d3acf726`, `6b0b6aa6`, `c9d34319`,
`98dde396`, `69f98d1d`, `0bd76f5f`, `3b3c3c26`, `9aed23d0`, and more) carries the same shape: a
view-name/tab row, then a right-aligned control cluster, then a blue split "New" button. **Two
density variants exist and both are attested repeatedly**: an **icon-only** cluster (4-6 glyph
buttons, seen on `71f9dba2`, `98dde396`, `69f98d1d`, `0bd76f5f`, `3b3c3c26`, `9aed23d0`,
`21d71e5f`) and a **text-label** cluster (`Filter  Sort  ⚡  🔍  ···`, seen on `9693630d`,
`07cec641`, `213f8a7c`, `a8a5865d`). The two never mix mid-cluster. The dark capture (`9aed23d0`)
uses the icon-only variant, so the density split is not theme-driven.

### P2 — The active-rule chip row, one chip per rule, not aggregated (`d8abbe0b`, `d89efb14`, `2517d4cf`'s sibling `84653307`)
A single line below the tab row, left-aligned, holding one chip per filter or sort plus a trailing
`+Filter`/`+Sort` add control. `d8abbe0b`'s filter chip reads `Role: Senior Designer, Ju…⌄`;
`d89efb14`'s sort row shows two independent chips (`+Name⌄ [Ascending⌄]` and `Role⌄`) each removable
on its own. Never an aggregate "N sorts" pill.

### P3 — The view-settings panel, one row per control with a value-column summary (`ac0d576b`, `8a7eeea7`, `995ca0e3`, `e4dfff31`, `9e80b489`, `420dd630`)
Every settings row on every platform carries its current value in a trailing column — `Properties
2 shown`, `Filter None`, `Sort None`, `Automations 1`, `AI Autofill 1` — never a bare label. The
**shape differs by platform**: an iOS bottom sheet (`ac0d576b`'s 15-row "Settings") vs a **right-
docked panel on web** (`420dd630`, `9e80b489`) that sits in the same slot a comments/history sidebar
would use, not a centered or anchored popover.

### P4 — Filter is two-tiered: a flat property list, then an advanced structured builder (`1d5d6adc`, `86a8e66c`, `8ff7ae4b`, `1f10ae24`, `41665ca0`, `24295cd3`)
The entry surface (`86a8e66c`, `8ff7ae4b`) is a plain "Filter by…" property list with a footer
"+Add advanced filter". Only once advanced is chosen does a `Where [prop][operator][value] ···`
row appear, with `And⌄` connecting further rows (`1f10ae24`, `41665ca0`, `24295cd3`) — structured
fields, not the phrase-style chip Anytype's captures showed. A 3-level stack (panel → condition →
operator, `d6d8022a`) matches Anytype's T15 finding independently.

### P5 — Sort is chip-per-rule with a two-part property+direction control (`84653307`, `1067756c`, `d89efb14`)
Each sort is its own removable row/chip carrying a property name and a direction, never merged into
one "N sorts" summary — the same choice our own chip rail already made against Anytype's aggregate.

### P6 — Properties and Property visibility are two different surfaces (`8bb9115f` vs `ddcba3da`, `35c32af9`)
"Properties" (`8bb9115f`) is a flat editable list (tap a row to change its type). "Property
visibility" is a separate show/hide surface with an eye toggle per row — flat with one "Hide all"
link on iOS (`ddcba3da`), but split into **"Shown in board" / "Hidden in board" sections** each with
its own Show/Hide-all link on web (`35c32af9`).

### P7 — Group-by has two entry points and is richer than a single field picker (`e9698e1b`, and Anytype's own T8 finding)
`e9698e1b`'s "Group" panel carries Group by, Text by (Exact), Sort (Alphabetical), a "Hide empty
groups" toggle, a per-group eye toggle list, and "Remove grouping" — six controls, not one field
picker.

### P8 — The all-views hub has a per-row icon and a per-row `···`, plus a natural-language add-view (`7d30bac2`, `2f7bbc1f`)
`7d30bac2`'s "3 views" sheet shows each view with an icon matching its layout type and its own
`···` menu — unlike Anytype's hub, which the design-trueup found has no per-row action at all.
`2f7bbc1f`'s add-view surface is an 11-icon "Start from scratch" grid plus an "Or describe a view…"
free-text AI box.

### P9 — Deleting the last view of a data source is an explicit, two-scope destructive confirm (`55602f6a`, `348fd2b7`)
A modal with two radio options — "Delete view only" (data and other views survive) vs "Delete view
and data source" (everything goes) — each carrying its own explanatory sentence, and the action
button's label tracks the selected radio.

### P10 — Search is inline in the toolbar row, not a popover (`d426cb7f`, `d3de8071`, `56aa9350`, `792336a7`, `a9f0dfea`, `a8a5865d`)
Tapping/clicking the search icon replaces (iOS) or extends (web) the row with a live text field and
a clear control; results filter live. Confirmed in both toolbar density variants and on both
platforms.

### P11 — The New button's Settings section carries a per-view creation default (`658fd83b`)
A "use as default template" modal offers **"For all views in ‹database›"** vs **"Only on ‹view›"** —
independently converging with Anytype's `Default Type for this View` / `Template for this View`
finding (`design-trueup.md` T10).

### P12 — The column-header menu already looks like ours (`0159ba7f`)
Filter / Sort / Group / **Calculate** / Align / Freeze / Hide / Wrap / Insert / Duplicate / Delete
all live in one column menu — the same shape our own column menu carries, and the same set
Anytype's T13 finding documented.

### P13 — View-type-specific settings blocks (`94f0fd50`/`eb167dde` chart, `e3ebbca9` timeline, `6d9641f2` map, `a77baf41` dashboard)
Each layout adds its own block of controls inside the same settings surface rather than a separate
popover per layout (chart gets X/Y axis and chart-type icons; timeline gets "Manage in Calendar" and
a month/today control; map and dashboard are Notion-only layouts with no Anytype or our
counterpart).

---

## 4. Divergences from our surface

**Read against the current worktree (`c45c53c3` "componentize the database toolbar onto five
shared primitives" and later, HEAD `28e680fc`).** That commit landed most of what `goal.md`'s
completion criteria still list as "Today: … not yet" — the criteria prose is stale relative to
HEAD on several rows. This section reports the code as it stands, not the checklist state.

| Pattern | Our tree today | Gap |
|---|---|---|
| P1 toolbar row | `renderFilterButton`/`renderSortButton` (`toolbar-renderer.ts:2241`, `:2260`) carry a count badge and `active`/`add` state, matching Anytype's no-dual-mode ruling; `renderSettingsButton` sits before the overflow (`toolbar-renderer.ts:435`, AC-113 shipped) | **No gap.** Notion's icon-vs-text density split (P1) is new evidence for our own T24/AC-107 collapse work: Notion collapses text labels to icons rather than dropping controls first. Worth a look at `toolbar-renderer.ts`'s `collapseTabStripToDropdown` sequencing, not a mandate — see §6 |
| P2 chip row | `active-view-controls-renderer.ts` already renders one chip per sort/filter (`createChip`, :188), a direction word (`createDirectionWord`, :230, wired at :121-123), and a 28px chip height (`styles.css:1821`) | **No gap.** P2 and P5 both reinforce decisions already shipped, independent of the Anytype read that originally motivated them |
| P3 value-summary rows | `view-config-panel-renderer.ts:511-525` computes `filterCount`/`sortCount`/`hiddenCount` and renders `toolbar.appliedCount` or an empty word per row | **No gap** on content. Notion's web variant is a **right-docked panel**, ours is a popover/sheet per D8's shell ownership (`051`'s shell) — a shape difference, not something this phase should change unilaterally, named for the research loop |
| P6 properties vs property visibility | `column-manager-renderer.ts` is one flat draggable list with a per-row checkbox (`:272`) and a single toggle-all (`:227`) | Notion's web panel splits into **Shown/Hidden sections** (P6). Ours conflates reorder + visibility into one list, which is arguably more capable, not less — named as an open question, not a defect |
| P7 group-by richness | `view-config-panel-renderer.ts:1968` resolves one `groupField` (`config.boardGroupField \|\| config.groupByField`); no text-by, no per-group hide, no "hide empty groups" | **Real gap.** Notion (P7) and Anytype's own T8 finding agree that grouping carries more than a field picker. Not in this phase's completion criteria — named for the research loop, not silently added (scope discipline) |
| P4 filter two-tier entry | `filter-panel-renderer.ts` is one compound builder (nested AND/OR/NOT trees, `:302-380`); grepped for a "simple list first" entry and found none | Notion's two-tier flow (P4: flat list → advanced builder) doesn't exist in ours — every filter is answered by the same nested-tree surface. D4 already rules our nested trees stay (no Anytype referent either), so this is a *possible* simplification for the common one-property case, not a ruling — named for the research loop |
| P9 delete-view confirm | `deleteView` runs immediately with no confirmation — `toolbar-renderer.ts:1180` (`run: () => actions.deleteView(index)`), `:1330`, `database-view.ts:3445` | **Real gap**, and a new one: neither `047`'s research nor Anytype's captures showed this (Anytype's own capture set has no per-row delete action on desktop and an unphotographed desktop confirm). Notion's iOS P9 is the first capture evidence for a delete-view confirmation existing anywhere. Not in this phase's completion criteria — named for the research loop, and if picked up, ADR-003's confirm primitive (D8, "one owner") is the shell to reuse, not a second one |
| P10 inline search | `renderSearch` (`toolbar-renderer.ts:1613-1660`) already expands an inline `<input>` in place with a clear button on click/focus | **No gap.** Independent convergence with Notion on both platforms |
| P11 New-menu presets | `writablePresetColumns`/`applyViewRowPresets` wired into `renderNewButton` (`toolbar-renderer.ts:2351`, presets section at `:2517-2521`) | **No gap.** Already shipped, and P11 is a second independent product (Notion) confirming the placement Anytype's T10 argued for |
| P12 column menu | Our column menu already carries Filter/Sort/Group/Calculate per `design-trueup.md` T13's read of the current tree | **No gap** |

---

## 5. Anytype vs Notion

The operator ruled Anytype parity by default (`goal.md` D1-D9); nothing here reopens a landed
Anytype ruling. Named disagreements:

- **Chip aggregation.** Anytype aggregates sorts into one `2 sorts` pill (`design-trueup.md` T14);
  Notion (P2, P5) never aggregates — one chip per rule on both filter and sort. **Agreement, not
  disagreement**, and it agrees with what we already shipped: two independent products both chose
  per-rule chips over Anytype's aggregate.
- **Settings-panel value summaries.** Anytype's T19 finding (`N applied` widened to every value
  column) is independently corroborated by Notion's P3 (`Property visibility 6`, `Automations 1`,
  `AI Autofill 1`) — two products agree with the ruling this phase already adopted from Anytype
  alone.
- **Per-view creation defaults, placement.** Anytype's T10 put `Default Type for this View` /
  `Template for this View` in the New menu's Settings section; Notion's P11 (`658fd83b`) shows the
  same placement choice (a per-view/per-database default template, offered "for all views" or
  "only this view") from its own New-page flow. Agreement.
- **Filter panel shape.** Anytype's filter panel fits 360px by splitting one condition across three
  stacked popovers (`design-trueup.md` T16); Notion's advanced builder (P4) puts property, operator
  and value **on one row**, closer to our own nested-row builder than to Anytype's phrase-chip.
  **Disagreement between the two references**, and it favors what we already have: neither reference
  argues for changing our row shape.
- **Group-by depth.** Anytype's T8 finding already argued our group control set is "ours, justified"
  against a thin Anytype equivalent (group-property + column-colour only). Notion's P7 is *richer*
  than Anytype's, not thinner — text-by, hide-empty-groups, and per-group visibility. This doesn't
  reopen T8's ruling (D4: what stays ours stays), but it does mean the research-loop question in §6
  is now backed by two references pointing the same direction, not one.
- **All-views hub, per-row action.** Anytype's T4 finding: the hub has no per-row action on any
  form factor Anytype was captured on. Notion's P8 (`7d30bac2`) hub has a per-row `···` on every
  row. **Disagreement**, and moot for us either way — our own hub already carries rename-in-place,
  which neither reference does (`design-trueup.md` T4's own note).
- **Delete-view confirmation.** Anytype's captures never reached a delete-view confirm on desktop
  (T18-adjacent: no per-row action exists to delete from on desktop at all) and the phone form used
  a plain red "Delete view" row with no scope choice. Notion's P9 is the only reference with a
  captured, structured (two-scope) delete confirmation. Not a disagreement — Anytype has no opinion
  here — but it means P9 is Notion-only evidence, not corroborated, and should be weighted
  accordingly if picked up.
- **Database switcher / multi-source.** `design-trueup.md` T5 ruled "no capture, none is possible" for
  Anytype and left the whole surface ours, unconstrained. Notion's `Manage data sources` /
  `Add data source` / `Link existing data source` (screen `794591f5`) is a *different* mechanism —
  multiple data sources feeding one database, not multiple databases behind one switcher — so it does
  not reopen T5's ruling. Named because it's the closest either reference comes to our own
  multi-database question, and the mechanisms are not interchangeable.

---

## 6. Open questions for the research loop

1. **Group-by richness (P7).** Two references (Anytype T8's board case, Notion's P7) now show more
   than a field picker where ours has one. Is "text-by / hide-empty-groups / per-group visibility"
   worth a future phase, and if so whose — this packet's or a sibling's?
2. **Filter's two-tier entry (P4).** Would a flat "pick a property" list in front of our existing
   nested-tree builder reduce clicks for the single-condition case, without touching the builder
   itself? Not scoped here; flagging the shape for whoever scopes it.
3. **Delete-view confirmation (P9).** Notion is the only reference with captured evidence a
   confirmation belongs here at all. Is this in scope for `053`, a sibling, or the operator's device
   pass (AC-111)?
4. **Toolbar density collapse (P1).** Notion collapses text→icon before dropping controls; ours
   drops the tab strip to a dropdown (`toolbar-renderer.ts:895-917`, `:collapseTabStripToDropdown`).
   Is there a control-cluster label to collapse before the tab strip does, or does our toolbar never
   carry text labels to begin with (making the comparison moot)? Needs a read of the shipped
   control-cluster markup, not this digest.
5. **Dark-theme Notion toolbar.** This harvest carries exactly one dark-theme capture of this surface
   (`9aed23d0`). A dark-theme-specific check of Notion's chip/badge contrast is not possible from
   this corpus; if it matters, it needs a targeted follow-up harvest, not a re-read of what's here.
6. **Property visibility's Shown/Hidden split (P6).** Would splitting our flat list into two sections
   help or would it fight the drag-to-reorder affordance our single list already carries? Genuinely
   unresolved from this read — recorded, not answered.
