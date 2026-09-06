---
title: "Notion Screens Digest: Table View — Header Row, Column Types, Cell Rendering, Row Chrome, Footer and Phone Table"
description: "Per-pixel read of the Notion table-view surface (header row, column types/icons, cell rendering per property type, row hover/selection, inline editing, wrap, row height, footer calculations, add row, column resize/reorder, frozen title column, phone table) across the Mobbin catalogue, screen-cited, measured against our current tree and against the Anytype references already ruled on."
trigger_phrases:
  - "notion table digest"
  - "notion screens table view"
  - "053 notion digest"
date: 2026-09-06
surface: "005-component-surface-system/053-toolbar-and-view-controls — table view"
phase: "053-toolbar-and-view-controls"
importance_tier: "high"
contextType: "research"
---
# Notion screens digest — table view

Read against `screenshots/notion/README.md`'s layout table, provenance and per-file index, and
against this packet's `goal.md` and `design-trueup.md`. Every claim below cites a screen id (the
Mobbin UUID, stable across the README's group-vs-flow refiling) and, where it exists, our own
`file:line`. Measurements are read off the Mobbin thumbnails: **iOS captures are 299×678/680 and
web captures are 768×521/523 — both are scaled down from Notion's real render**, so every pixel
value below is a thumbnail pixel, not a device pixel; ratios (row pitch vs type size, chip height
vs row height) are more reliable than absolute px and are called out as such. No image in this
harvest is dark-themed — every screen opened, iOS and web, rendered in Notion's light theme, so
the dark-theme columns in the per-screen table are not a gap in reading, they are the catalogue.

---

## 1. Selection

**102 screenshots opened** (69 iOS, 33 web), resolving to **98 unique Mobbin screen ids** — four
ids are filed under two folders each (a group folder and a flow folder, or two flows), per the
README's documented group-plus-flow storage rule (`screenshots/notion/README.md` line 9): `9867cb76`
(`ios/views` and `flows/hiding-properties`), `664b0f07` (`ios/views` and
`flows/turning-on-header-row`), `52348672` (`flows/hiding-properties` and
`flows/adding-a-new-property`), `086606f1` (`ios/database` and `flows/deleting-a-property`).

**Folders read**, matching the brief's hint list plus the widened set:

- `ios/views/*table*` — all 15 files (the full set, not a sample: this is the primary surface).
- `web/views/*table*` — all 7 files (the full set).
- `ios/database/*propert*` — 11 `properties-*` files (all) + 5 `property-editor-*` files (sampled).
- `web/database/*propert*` — 4 `properties-*` files (all) + 5 `property-editor-*` files (sampled).
- `ios/database/*column*`, `web/database/*column*` — **empty**, no files match either glob; column
  configuration lives under `properties-*`/`property-editor-*` and the table-view header itself,
  not a `column` group.
- `ios/flows/adding-a-table-view` — 8 of 20 sampled (drag/type/tag steps prioritised over
  duplicate onboarding text-entry steps).
- `ios/flows/reordering-a-table` — all 3.
- `ios/flows/turning-on-header-row` — all 3.
- `ios/flows/hiding-properties` — 4 of 5.
- `ios/flows/adding-a-new-property` — 4 of 9 (the AI-autofill steps repeat across five files and
  were sampled once).
- `ios/flows/deleting-a-property` — 3 of 4.
- `ios/flows/turning-a-table-into-a-database` — all 4 read of 6 (the two skipped duplicate ids
  already read under `reordering-a-table` and `turning-on-header-row`).
- `ios/flows/turning-table-into-database` (a second, separately-named flow the brief's hint list
  did not anticipate) — 3 of 4.
- `ios/flows/customizing-page-table` — all 3.
- `web/flows/adding-a-table` — all 5.
- `web/flows/filtering-and-sorting-a-table` — 5 of 8.
- `web/flows/creating-a-database-table` — 6 of 7.
- `ios/states/*empty-database*`, `ios/database/*database-template*`,
  `web/database/*database-template*` — 2 + 1 + 1, for the empty and templated states the hint list
  did not name.

**Widened by grep** for surface words against the README's query lists (§"Query sets"): `table
view`, `properties`, `property editor`, `database`, `database template`, `filters`, `sort`, `group
by` all resolve to folders already read above; no additional Notion query surfaced a table-cell or
row-chrome screen the folder walk missed.

**Skipped and why.** `ios/database/*column*` and `web/database/*column*` — no files exist under
that glob (see above, not a skip so much as an empty hint). Roughly a third of the
`property-editor-*` and `properties-*` files opened turned out to be Notion AI agent
configuration, workspace emoji settings, SEO/share settings or automation builders — the README's
own caveat (line 11: "the group is the query, not a verified reading of the image") predicts
exactly this, and these are recorded in §2 as off-topic rather than silently dropped, since they
were opened and read. Near-duplicate onboarding steps inside `adding-a-table-view` (12 of its 20
files) and repeated AI-agent screens inside `adding-a-new-property` (5 of its 9) were skipped after
the first instance because they add no new measurement. `web/database/property-editor-{02,03,04,06,08,10,11,13}`
were skipped outright after the first five samples returned four off-topic AI/workspace screens out
of five — diminishing return confirmed before spending the rest of the budget there.

---

## 2. Per-screen table

One row per unique screen id. "Found by" collapses to the group/flow name(s) the README lists;
"Off-topic" marks a screen the query surfaced but that does not depict this surface (still opened,
per the README's caveat, and recorded honestly rather than dropped).

| Screen id | Platform | Theme | Path | Mobbin | Content | Measured / observed |
|---|---|---|---|---|---|---|
| `d3acf726` | iOS | light | `ios/views/notion-ios-views-table-01…` | [screen](https://mobbin.com/screens/d3acf726-47cf-46f4-bd0d-65788523dc3b) | Layout picker (Table selected) + table display toggles | Toggles: Show data source title, Show vertical lines, Show page icon, Wrap all content, Open pages in → Center peek, Load limit → 50 |
| `9867cb76` | iOS | light | `ios/views/…-02…` + `flows/hiding-properties/…-02…` | [screen](https://mobbin.com/screens/9867cb76-74ed-4ff0-9254-398aeff2265e) | "Property visibility" panel | Rows: Title (Aa icon, eye greyed/disabled), Column 1, Column 2 (eye active); 6-dot drag grip leading each row; "Hide all" link top-right |
| `e7391344` | iOS | light | `ios/views/…-03…` | [screen](https://mobbin.com/screens/e7391344-2ba8-491f-b940-966f1a329459) | Simple table block — row-detail popup | Off-topic for the database Table view: this is the lightweight in-page table block's cell-edit popover, a different surface (see §5) |
| `a0d1e399` | iOS | light | `ios/views/…-04…` | [screen](https://mobbin.com/screens/a0d1e399-b713-46a7-abec-15ea7e7cdc06) | View Settings panel | Rows, 28px-pitch: View name, Layout, Property visibility (count badge), Filter, Sort, Group, **Conditional color**, Copy link to view — divider — Data source settings: Source, Edit properties, Automations, AI Autofill |
| `19745d87` | iOS | light | `ios/views/…-05…` | [screen](https://mobbin.com/screens/19745d87-2fe8-4767-9da9-20946b445bd7) | Populated table, phone | Header row: `Aa Title`, `≡ Column 1`, `≡ Column 2`; each row: file icon + "OPEN" pill overlapping the title text + value cells; footer `+ New page` |
| `e33466b4` | iOS | light | `ios/views/…-06…` | [screen](https://mobbin.com/screens/e33466b4-6be5-4e19-9d56-1b112f7aed10) | Same table, different data source | Footer wording is `+ New task` here vs `+ New page` on `19745d87` — the add-row label is the data source's noun, not fixed |
| `664b0f07` | iOS | light | `ios/views/…-07…` + `flows/turning-on-header-row/…-03…` | [screen](https://mobbin.com/screens/664b0f07-e153-4231-af93-70a084d10a18) | Simple table block, plain | 3 columns × 2 rows, equal widths, 1px grey grid, no page-icon column — the block, not the database view |
| `35c64a84` | iOS | light | `ios/views/…-08…` | [screen](https://mobbin.com/screens/35c64a84-58d0-43ca-a023-3258e5d91090) | Populated table with `+` add-column | Header row ends in a bare `+` cell (add column); rows carry OPEN pill + two text cells |
| `c5fc5db2` | iOS | light | `ios/views/…-09…` | [screen](https://mobbin.com/screens/c5fc5db2-33f2-4e5e-9bfa-dd284ad9408d) | Single-row table | Same header/add-column pattern at n=1 row |
| `8d6dcf3b` | iOS | light | `ios/views/…-10…` | [screen](https://mobbin.com/screens/8d6dcf3b-3197-4244-86b6-f901f7df6079) | Status cell + option bottom sheet | Cell renders a **pill**: grey dot + "Not started"; sheet groups options under To-do/In progress/Complete headers, pill options Not started (grey), In progress (blue-tint pill), Done (green-tint pill) |
| `90277769` | iOS | light | `ios/views/…-11…` + `flows/turning-a-table-into-a-database/…-06…` | [screen](https://mobbin.com/screens/90277769-e407-4476-bc16-4309ee11276d) | Row-expand affordance | Each row grows a leading `▶` triangle before the title's file icon — a row-level expand/select handle distinct from the OPEN pill |
| `d95ea247` | iOS | light | `ios/views/…-12…` + `flows/turning-a-table-into-a-database/…-01…` | [screen](https://mobbin.com/screens/d95ea247-b077-4e8a-89f7-9cee67b4921a) | Simple table block, empty | Same 3×2 plain grid as `664b0f07`, pre-conversion starting state for the turn-into-database flow |
| `6673816d` | iOS | light | `ios/views/…-13…` | [screen](https://mobbin.com/screens/6673816d-9c68-4275-8902-f6cf6982f982) | Status column, mixed values | One row "Done" (green pill), rest "Not started" (grey pill) — confirms the pill recolors per option, not per column |
| `7f2dbda0` | iOS | light | `ios/views/…-14…` | [screen](https://mobbin.com/screens/7f2dbda0-d1e7-4086-8ef8-fe998e0f6174) | "Properties" list | Rows with type icons: Title `Aa`, Column 1/2 `≡` (text), Summary `≡`, Text `≡`, Number `#`, Select `⊙` (dashed-circle/target), Summary 1 `≡`; `+ New property` / `Learn about properties` footer |
| `2517d4cf` | iOS | light | `ios/views/…-15…` | [screen](https://mobbin.com/screens/2517d4cf-7998-4f68-a689-20489ef18ec0) | Settings panel, toast overlay | "Link to view copied to clipboard" — confirms Copy-link-to-view is a live action, not a stub |
| `3b3c3c26` | web | light | `web/views/notion-web-views-table-01…` | [screen](https://mobbin.com/screens/3b3c3c26-58ac-42ec-9ddd-f4783d4f5f4f) | "Team" table, tinted rows | Columns: Role, Status (`⊙`), Person (`⚉`/avatar), Formula (`Σ`), Date (`📅`); **every row carries a full-row pale background tint** (pink/red/yellow) independent of the Status pill's own colour — resolved by `142cef4e` as Conditional color, not a Status-driven effect |
| `b184ec4c` | web | light | `web/views/…-02…` | [screen](https://mobbin.com/screens/b184ec4c-7b84-4cba-b7e1-bc727bde0eea) | Same database, plain rows | No row tint here — Conditional color is opt-in per view, not a database-wide default; Name/Role/Status columns, grey "Not started" pills, colour-coded Role pills |
| `bd482935` | web | light | `web/views/…-03…` | [screen](https://mobbin.com/screens/bd482935-9854-4f32-9e1d-47157eee4f1f) | Date cell + picker | Cell text "April 1, 2026 9:00"; picker: month grid, End date, Date format → Full date, Include time (on), Time format → 24 hour, Timezone, Remind |
| `74fe28d3` | web | light | `web/views/…-04…` | [screen](https://mobbin.com/screens/74fe28d3-82c4-4fe8-b982-5c04e708b27c) | Status column-header menu | Full list: Edit property, Change type, AI Autofill, Filter, Sort, Group, Calculate, **Freeze**, Hide, **Wrap content**, Insert left, Insert right, Duplicate property, Delete property; Edit-property flyout shows grouped options (To-do/In progress/Complete) and a 10-swatch colour palette |
| `f19c6f50` | web | light | `web/views/…-05…` | [screen](https://mobbin.com/screens/f19c6f50-e006-40f1-aaf6-0eaeb6dcc315) | Role column menu, fresh property | Same menu list; Edit-property flyout shows `Sort: Manual`, an empty Options list (`+ Add an option`, `Generate with AI`) |
| `a9f53856` | web | light | `web/views/…-06…` | [screen](https://mobbin.com/screens/a9f53856-c9f0-47cf-8f22-7e74e4a11b5d) | Imported CSV table | Columns Vendor Business name (`Aa`), Contact name (`≡`), Account number (`#`), Routing number (`#`), Email (`@`, envelope icon) — number-typed values render left-aligned, same as text |
| `0159ba7f` | web | light | `web/views/…-07…` | [screen](https://mobbin.com/screens/0159ba7f-b03b-4b57-b6fe-d44d8ade6ac7) | Role column menu, populated | Options list now shows 3 colour-tagged values (Junior/Senior Designer tan/red, Manager tan) |
| `8bb9115f` | iOS | light | `ios/database/notion-ios-database-properties-01…` | [screen](https://mobbin.com/screens/8bb9115f-e0da-4e01-bd9d-2b627a4b6727) | "Properties" list, plain | Title/Column 1/Column 2 rows only, `+ New property` footer |
| `63512550` | iOS | light | `…-properties-02…` | [screen](https://mobbin.com/screens/63512550-9381-42d2-839e-528e416275da) | Relation "Advanced settings" | Off-topic for cell rendering; relation icon is a diagonal arrow `↗`, noted for the column-type icon set |
| `9a0b56b7` | iOS | light | `…-properties-04…` | [screen](https://mobbin.com/screens/9a0b56b7-2f3a-46e2-b0b6-8a549eea5627) | Relation property picker | Search list of candidate relation targets, same `↗` icon |
| `086606f1` | iOS | light | `…-properties-05…` + `flows/deleting-a-property/…-02…` | [screen](https://mobbin.com/screens/086606f1-d300-4d22-a236-46180752ed89) | Files & media property edit | "Google Drive File" (a specific file, not the type); **Wrap content** toggle (off), Delete property |
| `7d7b5690` | iOS | light | `…-properties-06…` | [screen](https://mobbin.com/screens/7d7b5690-df66-49a7-ab4e-de6503244fbc) | AI agent column config | Off-topic — Notion AI "Summary 1 agent" instructions/triggers editor |
| `050083af` | iOS | light | `…-properties-08…` | [screen](https://mobbin.com/screens/050083af-8fc7-4f2b-9e96-defe72762eb6) | Row opened as page | Empty cells render the literal word **"Empty"** in muted grey, not a blank; off-topic surface (row-as-page, not table) but the empty-cell placeholder convention is worth carrying |
| `52294205` | iOS | light | `…-properties-11…` | [screen](https://mobbin.com/screens/52294205-f7ad-41c9-b766-836c6af988d9) | Task-database wizard | Off-topic — property-role picker for Notion's task-database template |
| `dd06bc90` | iOS | light | `…-properties-13…` | [screen](https://mobbin.com/screens/dd06bc90-912a-4c12-aa35-c53fed682cad) | AI agent config, continued | Off-topic |
| `0d940540` | iOS | light | `…-properties-14…` | [screen](https://mobbin.com/screens/0d940540-26d4-4bbf-8df5-60982ec567b2) | AI agent config, continued | Off-topic |
| `bb16fd8a` | iOS | light | `…-properties-15…` | [screen](https://mobbin.com/screens/bb16fd8a-b2cf-432e-9097-9f5105b09569) | Share/SEO settings | Off-topic |
| `142cef4e` | iOS | light | `…-properties-16…` | [screen](https://mobbin.com/screens/142cef4e-fe09-4fc9-bab5-59d0e4e72de1) | **Conditional color** explainer | Mini table preview: rows tinted green/tan/pink by a category property's value, full row width; "New color setting" CTA; Select-property picker beneath |
| `658fd83b` | iOS | light | `ios/database/property-editor-02…` | [screen](https://mobbin.com/screens/658fd83b-c23b-4573-aac8-a18e06e185a1) | Database templates list | Off-topic-adjacent: Checklist (Default badge), Empty, `+ New template`; default-template confirm dialog scoped "For all views" vs "Only on this view" |
| `53ff42bf` | iOS | light | `…-property-editor-04…` | [screen](https://mobbin.com/screens/53ff42bf-c17f-4181-a61c-704d1075622c) | Task-database wizard | Off-topic |
| `2f0d2563` | iOS | light | `…-property-editor-07…` | [screen](https://mobbin.com/screens/2f0d2563-d5e6-4f01-adda-18b8d09b74c4) | "View options" menu | Rename, Display as, Edit view, Source, — Copy link to view, Open as full page, **Hide data source titles**, — Duplicate view, Delete view |
| `8d28fcb9` | iOS | light | `…-property-editor-11…` | [screen](https://mobbin.com/screens/8d28fcb9-c6a8-4028-8012-e0b0a91aa8c9) | Automation trigger picker | Off-topic |
| `fd5e59c9` | iOS | light | `…-property-editor-14…` | [screen](https://mobbin.com/screens/fd5e59c9-124c-4ee9-b282-cd43cafc5c3c) | AI sources toggle | Off-topic |
| `39684b6e` | web | light | `web/database/properties-01…` | [screen](https://mobbin.com/screens/39684b6e-3307-402e-bdaf-7a0f3e668673) | AI column config, with preview | Off-topic; preview card renders a Status pill identically to the table cell ("Full-time", green) |
| `b69c8a59` | web | light | `…-properties-02…` | [screen](https://mobbin.com/screens/b69c8a59-0612-4e4a-9535-957f5a6efa92) | Board view + property visibility panel | Not the table, but the same "Shown in board / Hidden in board" panel shape as the iOS table's Property visibility, confirming the panel is shared across layouts |
| `35c32af9` | web | light | `…-properties-03…` | [screen](https://mobbin.com/screens/35c32af9-0c3b-4ecb-a2e4-aa293fafb9dc) | Same panel, all hidden but Name | Confirms Name/title cannot be moved into "Hidden" |
| `0b5a0ef9` | web | light | `…-properties-04…` | [screen](https://mobbin.com/screens/0b5a0ef9-73e1-44b8-8852-51a314fdeb6c) | AI column config, no preview | Off-topic |
| `c08e8ce9` | web | light | `web/database/property-editor-01…` | [screen](https://mobbin.com/screens/c08e8ce9-74ff-41c3-ab52-a750a3ad1f1d) | AI "Run agent" menu | Off-topic |
| `deb747e2` | web | light | `…-property-editor-05…` | [screen](https://mobbin.com/screens/deb747e2-2093-4228-b366-4957da0b3ca2) | Page-automation dialog | Off-topic (trigger/action builder) |
| `6ff60437` | web | light | `…-property-editor-07…` | [screen](https://mobbin.com/screens/6ff60437-cdbb-4ef5-b1a4-d0901d13dfdb) | Workspace emoji settings | Off-topic |
| `97869a67` | web | light | `…-property-editor-09…` | [screen](https://mobbin.com/screens/97869a67-378d-4d4c-b083-c373a930b2e5) | Workspace AI settings | Off-topic |
| `eb375741` | web | light | `…-property-editor-12…` | [screen](https://mobbin.com/screens/eb375741-eee6-4a3e-be4b-70187cff0d2b) | AI avatar picker | Off-topic |
| `d53b3912` | iOS | light | `flows/reordering-a-table/…-01…` | [screen](https://mobbin.com/screens/d53b3912-f60a-4bd1-872e-18276fe2acd5) | Simple table block, column selected | Blue selection outline with 4 corner squares around the "Wednesday" column; a top `⠿` drag grip; text-formatting toolbar visible below (B/U/I/S/@/link/comment/code) |
| `026940b3` | iOS | light | `…-reordering-a-table/…-02…` | [screen](https://mobbin.com/screens/026940b3-e0de-443d-a948-6eb1e53e4ea1) | Column mid-drag | The dragged column's ghost sits over "Tuesday"; the grip row (`⠿`) rides with it |
| `db2814d9` | iOS | light | `…-reordering-a-table/…-03…` | [screen](https://mobbin.com/screens/db2814d9-78bd-4b01-9d57-8e1c4dcbdbbc) | Reorder complete | Column order now Monday / Wednesday / Tuesday; selection outline persists on the moved column |
| `6ecea6c7` | iOS | light | `flows/turning-on-header-row/…-01…` | [screen](https://mobbin.com/screens/6ecea6c7-4682-4c35-b649-412a0a240738) | Simple table block "Actions" sheet | Table section: Turn into database, Fit to width, Insert below, **Header row** (toggle, off here), **Header column** (toggle, off); then Copy link to block / Duplicate / Move to / Delete — Comment — Ask AI |
| `aeb6d373` | iOS | light | `…-turning-on-header-row/…-02…` | [screen](https://mobbin.com/screens/aeb6d373-0c84-4b69-a591-029ea8938b83) | Same sheet, Header row ON | Header row toggle now blue/on; Header column stays off — the two toggles are independent |
| `fc68b3ff` | iOS | light | `flows/turning-table-into-database/…-01…` | [screen](https://mobbin.com/screens/fc68b3ff-ef3a-4793-95c1-35f8ee01e280) | Block "Actions" sheet, alt layout | Same action set, ordered Comment/Ask AI/Delete/Duplicate/Insert below/Copy link/Turn into database/Move to |
| `6055725d` | iOS | light | `…-turning-table-into-database/…-02…` | [screen](https://mobbin.com/screens/6055725d-1757-4b23-8fd2-a26a9465cd22) | Embedded database mid-page | "Today Notes" table inline under page text: Activity (`Aa`)/Rate (`≡`) columns, OPEN pills, `+ New page`, **two separate `Calculate ⌄` footer triggers** (one per data column) |
| `213f8a7c` | iOS | light | `…-turning-table-into-database/…-04…` | [screen](https://mobbin.com/screens/213f8a7c-6c38-4b4e-9daa-b9cff99cdec2) | Same view, renaming | Title field mid-edit, keyboard open, same footer/Calculate row underneath |
| `794591f5` | iOS | light | `flows/customizing-page-table/…-01…` | [screen](https://mobbin.com/screens/794591f5-f9b6-4416-8c0c-bea36a0e1e65) | "View options" panel | View name, Layout, **Properties → "2 shown"**, Filter/Sort/Group None, Automations None — "Customize [db]" row, Lock database, Copy link, Duplicate view |
| `8ee187d8` | iOS | light | `…-customizing-page-table/…-02…` | [screen](https://mobbin.com/screens/8ee187d8-2749-43ec-b644-a5ecb6b0db99) | Feature picker | Suggested: Sub-items, Dependencies, Tasks, AI summary; Advanced: Automations, Connections |
| `3a843067` | iOS | light | `…-customizing-page-table/…-03…` | [screen](https://mobbin.com/screens/3a843067-c290-475a-a928-d2bf000461d7) | Same panel, toast | "Added AI summary to this database" |
| `43ac2f1a` | iOS | light | `flows/deleting-a-property/…-01…` | [screen](https://mobbin.com/screens/43ac2f1a-4aa0-47c8-870b-2522de00e239) | Connections panel | Off-topic-adjacent (linked-service picker, not a delete confirm) |
| `25255c04` | iOS | light | `…-deleting-a-property/…-04…` | [screen](https://mobbin.com/screens/25255c04-281a-4aca-8851-0228b9ec1174) | Connections panel, post-delete | Settings section gone after the property (and its Google Drive connection) is removed |
| `d9d61160` | iOS | light | `flows/adding-a-new-property/…-04…` | [screen](https://mobbin.com/screens/d9d61160-837d-45fe-b667-7091457e6aab) | Table renaming | View-name field shows placeholder "New …"; header row `Aa Title` plus a trailing `+`/`···` pair |
| `34541a79` | iOS | light | `…-adding-a-new-property/…-08…` | [screen](https://mobbin.com/screens/34541a79-8f3d-405a-bc1e-a4d3b5e5f284) | Text display-style picker | **Paragraph / Bullets / One-liner** — a per-column rendering mode for text-like values, applies inside the cell |
| `4cc9aad0` | iOS | light | `…-adding-a-new-property/…-09…` | [screen](https://mobbin.com/screens/4cc9aad0-a791-449d-a9a6-bd85558b77e6) | AI agent toast | Off-topic |
| `5905b1ab` | iOS | light | `flows/turning-a-table-into-a-database/…-04…` | [screen](https://mobbin.com/screens/5905b1ab-554b-458a-a941-1f5adb60e46a) | Table mid-conversion | Title cell shows "Mo[OPEN]"; the two still-plain columns (Tuesday/Wednesday) render blank OPEN-pill rows underneath — every row gets an auto-created page the moment the block becomes a database, even where the row had no content |
| `74da3d7a` | iOS | light | `…-turning-a-table-into-a-database/…-05…` | [screen](https://mobbin.com/screens/74da3d7a-b6b7-4ab8-ba38-9a17f04de3da) | Fully converted table | "Need to do" view name, `Aa Title`/`≡ Column 1`/`≡ Column 2`, all three rows populated |
| `77b8a9bb` | iOS | light | `flows/adding-a-table-view/…-01…` | [screen](https://mobbin.com/screens/77b8a9bb-28e0-4edc-a399-b773dc53567f) | Page block editor | Off-topic (block insert toolbar, not a table) |
| `a6230c70` | iOS | light | `…-adding-a-table-view/…-04…` | [screen](https://mobbin.com/screens/a6230c70-9a88-49d9-b60a-9bb98bda03f9) | "Select data source" picker | List: Meeting Notes, Task List (checked), Docs, Team Tasks — plus "Link or create a database" field |
| `06e4d0c3` | iOS | light | `…-adding-a-table-view/…-07…` | [screen](https://mobbin.com/screens/06e4d0c3-27c3-4c1c-b384-d16ce4cd44ed) | Row opened as page | Property rows Assignee/Status/Priority/Due Date/Date Created/Attachment/Project, all "Empty" but Date Created |
| `101392c7` | iOS | light | `…-adding-a-table-view/…-10…` | [screen](https://mobbin.com/screens/101392c7-454e-43cd-8810-06cb683194fa) | Embedded "Team Tasks" table | Search chip, "Date Created ⌄" sort chip, "+ Add filter"; Status/Assignee columns; footer `COUNT 2` + two `Calculate ⌄` triggers |
| `af7a18b0` | iOS | light | `…-adding-a-table-view/…-13…` | [screen](https://mobbin.com/screens/af7a18b0-2cfe-4521-bab0-a0abd6e6cc22) | **"New property" type list** | Multi-select, Status, Date, Person, Files & media, Checkbox, URL, Email, Phone, Formula, Relation, Rollup, Created time, Created by, Last edited time, Last edited by — the canonical column-type icon set |
| `8e8e4249` | iOS | light | `…-adding-a-table-view/…-16…` | [screen](https://mobbin.com/screens/8e8e4249-fd96-4f1c-a9cc-bd9f5942c345) | Multi-select option editor | Low (green), Medium (yellow), High (red + 🔥 emoji) — drag grips, `···` per row |
| `cbf001e4` | iOS | light | `…-adding-a-table-view/…-18…` | [screen](https://mobbin.com/screens/cbf001e4-0487-493f-a320-06324af50187) | Inline option create | Typed "England" → "Create England" suggestion |
| `20a95974` | iOS | light | `…-adding-a-table-view/…-20…` | [screen](https://mobbin.com/screens/20a95974-c4be-413d-b9be-f8f63228932d) | Embedded table, new tag applied | Country cell shows a tan "England" pill; footer shows 3 `Calculate ⌄` triggers, one per data column |
| `3654c134` | web | light | `web/flows/adding-a-table/…-01…` | [screen](https://mobbin.com/screens/3654c134-225e-4240-ac94-3273856013df) | Page, pre-table | Baseline before block insertion |
| `046635be` | web | light | `…-adding-a-table/…-02…` | [screen](https://mobbin.com/screens/046635be-1997-41fa-8711-aa5b33516b86) | Heading added | "Quarterly Content Strategy Table" heading, `+` hover affordance below |
| `452f412e` | web | light | `…-adding-a-table/…-03…` | [screen](https://mobbin.com/screens/452f412e-3fb1-4cd4-847b-7ad2d2da8f1f) | `/` slash menu | Numbered list, To-do list, Toggle list, Page, Callout, Quote, **Table**, Divider, Link to page — plus a Notion AI row |
| `23e9e82e` | web | light | `…-adding-a-table/…-04…` | [screen](https://mobbin.com/screens/23e9e82e-d9ea-4304-b939-81f65d39968c) | Simple table inserted, selected | 2×3 grid, blue selection fill; `Options ⌄` toolbar and a `↔` fit-to-width icon above it |
| `ed5dcd61` | web | light | `…-adding-a-table/…-05…` | [screen](https://mobbin.com/screens/ed5dcd61-32d1-42b3-9cb2-a665c0e77e98) | Same table, deselected | Plain 2×3 grid, thin grey border, no chrome |
| `21d71e5f` | web | light | `web/flows/filtering-and-sorting-a-table/…-01…` | [screen](https://mobbin.com/screens/21d71e5f-76a6-4d62-834a-388b5d433942) | "Creative pipeline" embedded table | Asset name (`Aa`), Medium (**multi-select, two pills per cell**, e.g. "Digital" + "OOH"), Status (`⊙`, single pill), Launch date (`📅`), Owner (avatar + name); toolbar row of 6 icons + `New ⌄` |
| `e2d7cfbc` | web | light | `…-filtering-and-sorting-a-table/…-02…` | [screen](https://mobbin.com/screens/e2d7cfbc-eb4f-4f62-8deb-917947a5a723) | Filter dropdown | "Filter by…" list with per-property icons (Asset name/Launch date/Medium/Owner/Status) + "Add advanced filter" |
| `2e15ed28` | web | light | `…-filtering-and-sorting-a-table/…-04…` | [screen](https://mobbin.com/screens/2e15ed28-6376-4f80-889c-c8e2ad3dd5d9) | Active filter chip | "Medium: Digital ⌄" chip + "+ Filter"; table narrowed to 3 rows |
| `57333104` | web | light | `…-filtering-and-sorting-a-table/…-06…` | [screen](https://mobbin.com/screens/57333104-b101-4d86-bb04-ce01293aacbf) | Sort dropdown | "Sort by…" list, same icon set as the filter list |
| `7e310dca` | web | light | `…-filtering-and-sorting-a-table/…-08…` | [screen](https://mobbin.com/screens/7e310dca-c11a-48df-9f5c-2078f281ed40) | Active sort chip | "↑ Launch date ⌄" chip; rows in ascending date order |
| `68d368d2` | web | light | `web/flows/creating-a-database-table/…-01…` | [screen](https://mobbin.com/screens/68d368d2-4ca8-4ee5-9adc-e434c4db0809) | Page, pre-database | Baseline |
| `d458cc50` | web | light | `…-creating-a-database-table/…-02…` | [screen](https://mobbin.com/screens/d458cc50-eea6-4cc0-82d2-bae86b1cbec9) | `/database` menu | Table view, Board view, Gallery view, List view, Feed view (New badge), Calendar view, Timeline view, Vertical bar chart, Horizontal bar chart — each with its own icon |
| `bfa2b3f9` | web | light | `…-creating-a-database-table/…-03…` | [screen](https://mobbin.com/screens/bfa2b3f9-3c46-4e38-a36f-26117ae670bf) | Fresh empty database table | `Name` column + `+ Add property`, 2 blank rows, `+ New page` |
| `039351aa` | web | light | `…-creating-a-database-table/…-04…` | [screen](https://mobbin.com/screens/039351aa-8446-4e1d-808f-a67484181dd3) | **Title-column header menu** | Show page icon (on), Filter, Sort, Group, Calculate, **Freeze**, **Unwrap text**, Insert left, Insert right — **no Hide, no Delete property**: the reduced menu the Title column gets |
| `136d7dd8` | web | light | `…-creating-a-database-table/…-06…` | [screen](https://mobbin.com/screens/136d7dd8-7324-4d4c-9a70-f5ea1a36ce52) | Title icon picker | Search field + a monochrome icon grid (~14×8) |
| `101b0be3` | web | light | `…-creating-a-database-table/…-07…` | [screen](https://mobbin.com/screens/101b0be3-3160-4426-b928-99a2dee4be15) | Same empty table, picker closed | Confirms no residual state change |
| `a984fe81` | iOS | light | `ios/states/empty-database-01…` | [screen](https://mobbin.com/screens/a984fe81-e471-4d22-a451-2684fd5983ac) | AI chat empty state | Off-topic — mis-filed per the README's caveat, not a database |
| `d658e522` | iOS | light | `ios/states/empty-database-09…` | [screen](https://mobbin.com/screens/d658e522-8558-4546-aea8-8993c6dd4d3a) | Simple table block, empty | Same plain 3×2 grid as `664b0f07`/`d95ea247`, not a database empty state |
| `a5ffc340` | iOS | light | `ios/database/database-template-01…` | [screen](https://mobbin.com/screens/a5ffc340-ac7e-4476-ae29-ae64b903f6c2) | "Database templates" list | Checklist (Default badge), Empty, `+ New template` |
| `db686263` | web | light | `web/database/database-template-01…` | [screen](https://mobbin.com/screens/db686263-c5af-44cb-b9db-d1b8727d2616) | Template marketplace listing | Off-topic |

---

## 3. Patterns

Ordered by how much of the table-view surface they define.

### P1 — Header row and column-header menu
Every populated table screen (`19745d87`, `35c64a84`, `3b3c3c26`, `a9f53856`, `21d71e5f`, …)
shows a persistent header row: a leading icon per column, a text label, and a click target that
opens a header menu. The full menu (`74fe28d3`, `f19c6f50`, `0159ba7f`) is: Edit property, Change
type, AI Autofill, Filter, Sort, Group, Calculate, **Freeze**, Hide, **Wrap content**, Insert left,
Insert right, Duplicate property, Delete property. The Title column's own menu (`039351aa`) drops
Hide and Delete property and adds a page-icon toggle — the column that can't be removed gets a
visibly shorter menu, not a disabled row (contrast with our own approach, §4).

### P2 — Column types and their icons
`af7a18b0` is the canonical list: Multi-select, Status, Date, Person, Files & media, Checkbox,
URL, Email, Phone, Formula, Relation, Rollup, Created time, Created by, Last edited time, Last
edited by (plus Title and Text, seen everywhere else). Each carries one glyph, reused identically
in the properties list (`7f2dbda0`), the column header (`3b3c3c26` etc.) and the type-change
submenu.

### P3 — Cell rendering per property type
- **Title**: a small file/page icon (togglable via "Show page icon", `d3acf726`) + text, with an
  "OPEN" pill that overlaps the tail of long titles on the phone width (`19745d87`, `35c64a84`).
- **Text**: plain left-aligned string; a per-column display-style choice — **Paragraph / Bullets /
  One-liner** (`34541a79`) — governs how a multi-line value collapses inside the cell.
- **Number**: left-aligned by default, no distinct visual weight from text (`a9f53856`'s Account
  number/Routing number columns).
- **Select / Status**: a rounded, colour-tinted **pill** — grey/blue/green tints seen on Status
  (`8d6dcf3b`, `6673816d`), tan/red/yellow on Role and Country (`b184ec4c`, `20a95974`).
- **Multi-select**: the same pill, **repeated per selected tag inline** with a small gap
  (`21d71e5f`'s Medium column: "Digital" + "OOH" side by side).
- **Date**: formatted text ("April 1, 2026 9:00"), a calendar-icon column header, and a popover
  carrying format/timezone/reminder controls (`bd482935`).
- **Person**: a small circular avatar + name (`3b3c3c26`'s Person column, `21d71e5f`'s Owner
  column).
- **Files & media**: the file's own name, no thumbnail in the table cell (`086606f1`'s edit-property
  screen names a specific "Google Drive File").
- **Formula/Rollup**: plain computed text, no distinct chip styling (`3b3c3c26`'s "Eligible for
  Insurance" / "Not Eligible" Formula column).
- **Empty cell**: renders the literal word **"Empty"** in muted grey when viewed as a page property
  row (`050083af`) — table cells themselves render as visually blank, this convention is
  page-view-only but worth naming.

### P4 — Row chrome: add-row footer, expand affordance, per-column Calculate
Every populated table ends in a `+ New page` (or `+ New task`, `e33466b4` — the label follows the
data source's noun) footer row, immediately followed by a **separate** row of per-column
`Calculate ⌄` triggers (`6055725d`, `101392c7`, `20a95974` — one trigger per data column, plus a
`COUNT 2` label when a calculation is set). Rows also carry a leading `▶` expand triangle
(`90277769`) distinct from the OPEN pill.

### P5 — Property visibility (show/hide columns)
A dedicated panel — search field, "Shown in table"/"Hide all", one row per property with a 6-dot
drag grip, a type icon, a name and an eye toggle (`9867cb76`). The Title row's eye is permanently
disabled/greyed rather than removed (`9867cb76`). The same panel shape appears for a Board view
(`b69c8a59`, `35c32af9`), confirming it's shared across layouts, not table-specific chrome.

### P6 — Column resize and reorder (simple table block)
Selecting a column shows a **blue outline with 4 corner squares** and a top **6-dot drag grip**
(`d53b3912`); dragging shows the moving column's ghost over its new neighbour (`026940b3`) and the
final order updates live (`db2814d9`). A `↔ Fit to width` action sits beside the column-count
`···` at all times (`d3acf726`, `d53b3912`). **This entire pattern was only captured on the simple
table block**, not the database Table view — the Mobbin catalogue never shows a database table's
column being dragged mid-motion.

### P7 — Column freeze
`Freeze` is a per-column action in the header menu (`74fe28d3`, `039351aa`), available on the
Title column exactly like any other. No capture shows the frozen visual state (a sticky
divider/shadow) — Mobbin's screens are static and none happens to be mid-horizontal-scroll with a
frozen column active. **Design inferred from the menu action, not seen as a rendered state.**

### P8 — Wrap content
A per-column toggle in the header menu, labelled `Wrap content` when off and `Unwrap text` when on
(`74fe28d3`, `039351aa` — the Title column in `039351aa` shows `Unwrap text`, meaning it starts
wrapped). A view-level `Wrap all content` toggle also exists in the Layout panel (`d3acf726`),
separate from the per-column control.

### P9 — Conditional color (row background tint)
A first-class Settings row (`a0d1e399`, `794591f5` list it; `142cef4e` explains it: "Customize page
colors to easily distinguish categories… — New color setting"). Applied, it tints the **entire
row's background** by a chosen property's value (`3b3c3c26`), independent of any pill colouring in
the same row. Opt-in per view — `b184ec4c`, the same database's plain Table view, shows no tint.

### P10 — View-level display toggles
`d3acf726`: Show data source title, Show vertical lines, Show page icon, Wrap all content, Open
pages in (Center peek / full page / side peek), Load limit. `2f0d2563`'s View options adds Hide
data source titles as a separate, view-scoped toggle from the same-named Layout switch.

### P11 — The simple table block is a distinct, simpler surface
`turning-on-header-row` (`6ecea6c7`, `aeb6d373`) and `reordering-a-table` both operate on Notion's
lightweight in-page **table block**, not the database Table view: its own "Actions" sheet carries
Turn into database, Fit to width, Insert below, **Header row** toggle, **Header column** toggle,
Copy link to block, Duplicate, Move to, Delete, Comment, Ask AI. The header-row and header-column
toggles this brief's hint list named (`turning-on-header-row`, and `Header column` inside the same
sheet) belong to this block, which has no database, no properties, and no calculate row. Our
plugin's "table view" is exclusively the database kind — it has no simple-block equivalent, so P11
is a naming, not a feature, gap (see §6).

### P12 — Phone table specifics
Row pitch on the phone captures is tight enough that the OPEN pill visibly overlaps the title text
(`19745d87`, `35c64a84`, `d9d61160`) rather than truncating first. Pickers that would be a popover
on web (Status options `8d6dcf3b`, multi-select option editor `8e8e4249`, database templates
`a5ffc340`) become **bottom sheets** with a drag handle. The "+ New page"/"+ New task" wording
tracks the data source name, not a fixed string, on phone just as it does on web.

---

## 4. Divergences from our surface

| Pattern | Notion (screen) | Our tree | Gap |
|---|---|---|---|
| **P1 header menu shape** | Title column's menu drops Hide/Delete, keeps everything else (`039351aa`) | `row-menu.ts:10`: "disabled documents that the action exists but doesn't apply here" — we grey out the disabled action rather than omitting it | Different convention, not a missing feature; both communicate "this property can't be hidden," ours via a disabled row, Notion's via a shorter menu |
| **P2 column types** | 16 named types with distinct icons (`af7a18b0`), including Person, URL, Email, Phone, Created time/by, Last edited time/by | `src/views/property-type-icon.ts:32-46` — our `ColumnDef["type"]` union (`src/data/types.ts:82`) is `text, number, date, datetime, currency, select, multi-select, status, checkbox, computed, relation, rollup, files` | We have no Person, URL, Email, Phone, or audit-trail (created/edited by/time) types; we have `currency` and `datetime` as their own icons where Notion folds those into Number/Date formatting |
| **P3 multi-select cell** | Multiple pills inline per cell (`21d71e5f`) | multi-select exists as a type (`property-type-icon.ts:39`, `tags` icon) | Not verified whether our cell renderer chips multiple values inline the same way — worth a follow-up read of `cell-renderer.ts`'s multi-select branch, not done in this digest (scope: table view only, not a full cell-renderer audit) |
| **P5 property visibility** | Dedicated panel, drag grip + eye toggle, Title's eye disabled (`9867cb76`) | `column-manager-renderer.ts:1-12` — "Renders the column manager panel (visibility, ordering, wrap)" | Matches; no gap. We already have the equivalent surface |
| **P6 column resize/reorder** | Blue selection outline + corner squares + top drag grip during drag (simple block only, `d53b3912`) | `column-header-controller.ts:90` (`db-resize-handle`), `styles.css:5656-5662` (4px hit strip, `cursor: col-resize`); reorder via native drag on the header cell (`cursor: grab`, `column-header-controller.ts` comment block) | Notion's captured pattern is the block's, not the database table's, so there's no direct comparison to make; our resize handle is a narrow invisible-until-hover strip rather than a visible grip, which is a design choice already made, not something this capture set overturns |
| **P7 column freeze / frozen title column** | `Freeze` is a per-column header-menu action, works on any column incl. Title (`74fe28d3`, `039351aa`) | **No match anywhere** — `grep -rn "freeze\|frozen"` across `column-menu.ts`, `types.ts`, `styles.css` returns nothing | **This is the gap the surface brief names.** We have no frozen-column mechanism at all, sticky or otherwise. Notion's version is a discrete user action ("Freeze up to and including this column"), not an automatic property of the title column — if we build one, the per-column-action shape is the one to match, not an always-on sticky first column |
| **P8 wrap content** | Per-column `Wrap content`/`Unwrap text` toggle in the header menu (`74fe28d3`); view-level `Wrap all content` (`d3acf726`) | `column-menu.ts:44` (`setColumnWrap`), ADR-004 (`decision-record.md`): `col.wrap ?? config.wrapText` — column wins over view default | Matches structurally (per-column overrides a view default in both). `goal.md`'s 2026-09-06 amendment records a live bug where wrap-off still produces oversized rows on a long-text column — that bug is **ours to fix regardless of Notion**, not something this capture set changes |
| **P9 conditional color** | First-class Settings row, tints the full row by a property's value (`142cef4e`, `3b3c3c26`) | **No match** — `grep -rn "conditional.color\|rowColor\|rowBackground"` across `src/data/types.ts`, `src/views/table-renderer.ts`, `src/views/cell-renderer.ts` returns nothing | We have no per-row background-colour feature at all. Not named in this phase's completion criteria (`goal.md` D4: "the table view… [is] not redesigned here"), so this is scope for a future phase, not a defect of this one — recorded here because the brief asked for every pattern, not only the ones already in scope |
| **P4 footer calculations** | `Calculate ⌄` per data column, `COUNT 2` example (`101392c7`) | `table-footer-renderer.ts:146-156` — `db-table-footer-trigger`, label `t("table.calculate")`, one `<td>` per column; `goal.md`'s ADR-005: hidden at 0 rows, 44px floor on phone | **Matches well** — this is the one pattern where our tree already tracks Notion's shape closely; no gap to record beyond the already-landed ADR-005 |
| **P10 view display toggles** | Show data source title, Show vertical lines, Show page icon, Wrap all content, Open pages in, Load limit (`d3acf726`) | Not located in this digest's read — out of scope for a table-view-cells digest, flagged as an open question (§6) rather than claimed either way | Unverified: needs a source-level check the operator or a follow-up pass should do before treating any of these six as present or absent |
| **P11 simple table block** | Header row/column toggles, Turn into database, Fit to width live on the block's own Actions sheet (`6ecea6c7`) | We have no simple/lightweight table block — every table in this plugin is a database Table view | Not a gap: this is a different product surface Notion has and we don't build toward. Recorded so the next reader doesn't try to match "header row toggle" against our always-on `<thead>` (`table-renderer.ts:608`) and call it a defect — it's a different surface entirely |

---

## 5. Anytype vs Notion

- **Conditional color (row background tint).** `design-trueup.md` §1 does not name a row-level
  conditional-colour feature among Anytype's captured surfaces, and this phase's `goal.md` D4 rules
  the table view stays ours by default. Notion has a named, discoverable version of this
  (`142cef4e`). Neither reference forces a ruling here — flagging the disagreement in existence
  (Notion has it, Anytype's capture set as read by `050`/`053` does not surface it) rather than
  picking a side, since D4 already closed the table view for this phase.
- **Column freeze.** Not mentioned in `design-trueup.md` for Anytype either (its rows are about the
  toolbar/chip/menu family, not table columns). No conflict to name — this is purely new ground
  from the Notion read, not a place where the two references disagree.
- **Wrap content resolution rule.** `design-trueup.md` and `goal.md`'s ADR-004 already settled
  `col.wrap ?? config.wrapText` against Anytype's captures before this digest; Notion's own
  per-column-overrides-view shape (P8) agrees with the rule already landed, so there is no
  ruling to revisit and none is proposed here.
- **No other named Anytype ruling in `design-trueup.md`'s twenty-four rows concerns the table
  view's cells, header or footer** — D4 scoped the table view out of `053` entirely, so the
  program has not yet ruled on most of what this digest measures. That is the honest state to
  report: this digest adds Notion evidence to a surface no packet has ruled on, rather than
  refining an existing Anytype-based ruling.

---

## 6. Open questions for the research loop

1. **Multi-select cell rendering** — does `cell-renderer.ts` already chip multiple values inline
   the way `21d71e5f` shows, or render them some other way (stacked, truncated-with-count)? Not
   checked in this pass; scoped out because it's a cell-renderer question, not a table-view
   structural one, but it's the one P3 sub-claim this digest could not verify against our tree.
2. **View-level display toggles (P10)** — Show data source title / Show vertical lines / Show page
   icon / Wrap all content / Open pages in / Load limit: do any exist in our `ViewConfig`
   (`src/data/types.ts`) today? Not searched in this pass; flagged rather than guessed.
3. **Frozen-column visual state is unseen everywhere.** No Mobbin capture shows a database table
   mid-horizontal-scroll with a column frozen — if a future phase builds P7, the sticky-divider
   styling (shadow, border) has no Notion reference to read against and would need either a live
   Notion session or an Anytype-only design.
4. **Column resize/reorder on the database Table view specifically** (not the simple block) has no
   capture in this 102-screen read. P6's blue-outline-and-grip pattern is confirmed only for the
   lightweight block; whether the database Table view's resize/reorder looks the same is
   unconfirmed both ways.
5. **Hover states are structurally unobservable in a static-screenshot catalogue.** Every hover
   claim in this digest is an absence (no screen happens to show one) rather than a measurement;
   any future digest of this surface should say the same rather than imply hover was checked and
   found absent.
6. **Dark theme.** Zero of the 102 screens opened are dark — not a sampling gap in this pass, the
   entire harvest (3647 files, per the README) may simply not have surfaced a dark Notion table
   screen for these queries. Worth a targeted dark-theme query sweep before this surface's colours
   are compared against ours in dark mode.
