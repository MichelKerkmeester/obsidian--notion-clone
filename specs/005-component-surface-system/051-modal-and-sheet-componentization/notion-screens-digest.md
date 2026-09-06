---
title: "Notion Screens Digest: Phone Bottom Sheets, Modals and Dialogs"
description: "77 Notion captures (iOS + web, sheets/menus/dialogs/database config surfaces) read against the 051 shell surface — frame, handle, header, rows, actions, stacking, scrim, motion, keyboard — with the recurring patterns, their measured values, and where they diverge from our tree and from the 050/051 Anytype true-up."
date: 2026-09-06
surface: "phone bottom sheets, modals and dialogs, and their desktop modal counterparts"
phase: "005-component-surface-system/051-modal-and-sheet-componentization"
---
# Notion Screens Digest: Phone Bottom Sheets, Modals and Dialogs

> Research input for `051`. This document does not amend `goal.md`, `design-trueup.md` or any
> ADR — it reads a second reference (Notion, harvested from Mobbin on 2026-09-06 into
> `screenshots/notion/`) against the same surface `050`/`051` already trued up against Anytype, and
> names where the two references agree, disagree, or where Notion adds a shape neither Anytype nor
> our tree currently has. Per `screenshots/notion/README.md`'s own caveat, the group a file sits in
> is the Mobbin query that found it, not a verified reading — several files below are filed under a
> group they do not depict, and that is noted per row rather than silently corrected.

---

## 1. Selection

**77 screens read**, chosen from `screenshots/notion/{ios,web}/` under the hinted folders
(`sheets/`, `menus/`, `dialogs/`, `database/*filter*`, `database/*sort*`, `database/*propert*`, and
the flow folders `setting-up-filter`, `sorting-a-database`, `filtering-a-database`, `view-options`,
`hiding-properties`, `page-actions`), then widened with two `grep`s over the per-file index for
`sort`/`filter`/`propert` inside `web/database/` (no `web/database/*sort*` files exist — the web sort
UI was reached only through the flow folders) and for a `dark` query hit (`switching-to-dark-mode`),
since none of the sheet/menu/dialog/database folders returned a dark-theme file on either platform.

| Group | Screens | Folders |
|---|---:|---|
| iOS sheets | 11 | `ios/sheets/` |
| iOS menus | 7 | `ios/menus/` |
| iOS database (filters/sort/properties/property-editor/new-database) | 12 | `ios/database/` |
| iOS flows — filtering, setting-up-filter, sorting, hiding-properties | 10 | `ios/flows/{filtering-a-database,setting-up-filter,sorting-a-database,hiding-properties}/` |
| iOS flow — page-actions | 3 | `ios/flows/page-actions/` |
| iOS flow — view-options | 2 | `ios/flows/view-options/` |
| web dialogs | 6 | `web/dialogs/` |
| web menus | 5 | `web/menus/` |
| web database (filters/properties/property-editor/new-database/template/side-peek) | 11 | `web/database/` |
| web flows — filtering-a-database(-2/-advanced), sorting-a-database(-2) | 8 | `web/flows/{filtering-a-database,filtering-a-database-2,filtering-a-database-advanced,sorting-a-database,sorting-a-database-2}/` |
| web flow — switching-to-dark-mode | 2 | `web/flows/switching-to-dark-mode/` |
| **Total** | **77** | |

**Skipped, and why.** Every `ios/database/*-automations-*` and `web/database/*-automations-*` file
(23 web, 10 iOS) — automations are a database feature, not a sheet/modal shape, and the two
automation surfaces read (I5/I7 below, reached through `property-editor`) already cover the panel
chrome they use. Duplicate screen ids across a group folder and a flow folder were read once (e.g.
`filters-08`'s screen also appears in `flows/filtering-a-database/`; only the flow copy not already
seen was added). Near-duplicate sequential frames inside one sheet's scroll (there are usually 10-16
files per query, mostly the same sheet scrolled or the same flow one step apart) were thinned to one
or two representative frames per state. `ios/sheets/color-picker-04`, `move-to-05/11`,
`delete-confirm-09`, `command-palette-01`, `filters-01` (web), `filters-03` (web),
`database-template-01` (web), `properties-01` (iOS `filters-13`'s neighbour) and several others are
**filed under a query they do not depict** — flagged per row in §2 rather than dropped, per the
README's "group is the query, not a verified reading" caveat. No iOS dark-theme capture and no
dark-theme sheet/menu/dialog capture on web exist anywhere in the 3,647-file harvest for this
surface; the two dark-theme reads (K1, K2) are page-level only, included to confirm the gap rather
than to measure a dark sheet that isn't there.

**Scale caveat.** Every iOS file in this harvest is a **299×678 or 299×680px thumbnail** (Mobbin's
served size, not a device capture) and every web file is **768×521 or 768×523px**. These are not the
1206×2622 device-pixel-at-3× files `050`/`051`'s Anytype true-up sampled per pixel — there is no
equivalent full-resolution Notion capture on disk. Every measurement below is therefore a **visual
proportion read off the thumbnail** (row height as a fraction of the frame, icon size relative to a
24px reference glyph, alignment by eye against the frame's centre and edges), not a per-pixel sample,
and is stated as such. Colours are named where they read as a flat, high-contrast fill (e.g. the red
of a destructive row, the blue of a primary pill) and are not claimed as sampled hex — the thumbnails
are `webp`-recompressed screenshots of a compressed Mobbin asset, and a per-pixel hex read off them
would carry false precision `050`/`051`'s Anytype method (per-pixel sampling off an uncompressed
1206×2622 source) does not share.

---

## 2. Per-screen table

One row per screen read. "Path" is relative to `screenshots/notion/`. "Mislabeled?" flags a file
whose group does not match what it shows, per the README's caveat — the screen id and `mobbin_url`
are what stays stable, and citations elsewhere in this document use those, not the folder name.

| ID | Platform | Theme | Path | Mobbin | Content | Measured (capture px, thumbnail-relative) |
|---|---|---|---|---|---|---|
| A1 | iOS | light | `ios/sheets/notion-ios-sheets-color-picker-04-e5accf4d….webp` | [screen](https://mobbin.com/screens/e5accf4d-d2be-4c81-bb01-de4424af9da2) | **Mislabeled** — full-screen "Conditional color" rule editor, not a colour picker or a sheet | Back chevron leading, centred title, no trailing; full-page push, not a sheet — no rounded top, no handle |
| A2 | iOS | light | `ios/sheets/notion-ios-sheets-date-picker-03-cb9d8cab….webp` | [screen](https://mobbin.com/screens/cb9d8cab-f85b-438f-bb06-4d1d07b90322) | "Date" bottom sheet: date/time row, month calendar, End date/format/timezone rows | Handle only, no header actions of any kind; `?` leading icon, centred title; sheet occupies ~90% of frame height |
| A3 | iOS | light | `ios/sheets/notion-ios-sheets-date-picker-12-ca4fd83f….webp` | [screen](https://mobbin.com/screens/ca4fd83f-fca7-4e85-9232-3b747854779b) | **Mislabeled** — "Change access" sheet (Can edit/comment/view, link expiry, Remove) | Handle **and** a circular trailing `X`; centred title, no leading; sheet ~55% of frame height, rows ~2× a single-line row tall (two-line rows) |
| A4 | iOS | light | `ios/sheets/notion-ios-sheets-delete-confirm-01-55602f6a….webp` | [screen](https://mobbin.com/screens/55602f6a-072b-47bd-af28-c234ec299245) | "Delete the last view for this data source?" — a **centred floating dialog** over a dimmed "View options" sheet | Trash icon above the question; two radio-selectable option cards (one outlined red, selected); footer **two full-width stacked buttons**, red primary "Delete View" over a plain "Cancel"; circular trailing `X` top-right of the card, no leading; card is rounded on all four corners and does not touch any frame edge |
| A5 | iOS | light | `ios/sheets/notion-ios-sheets-delete-confirm-09-3c913eb7….webp` | [screen](https://mobbin.com/screens/3c913eb7-2aaa-43a5-935f-4958ad58340a) | **Mislabeled** — a page with a **toast**, "Moved to Alex Smith's Space HQ · Undo", no sheet or dialog open | Toast is a dark pill, bottom-anchored above the AI input bar, not a sheet |
| A6 | iOS | light | `ios/sheets/notion-ios-sheets-icon-picker-01-0c4e7197….webp` | [screen](https://mobbin.com/screens/0c4e7197-170b-44d6-adea-534219b9dd35) | "Page icon" sheet — Emoji/Icons/Upload tabs, filter field, icon grid | **Three-slot header**: leading text "Remove", centred title "Page icon", trailing text "Close" (not an icon) |
| A7 | iOS | light | `ios/sheets/notion-ios-sheets-icon-picker-06-4df35a24….webp` | [screen](https://mobbin.com/screens/4df35a24-1e3a-423c-b9b8-4ea5c3bd9162) | "Reaction" emoji sheet — search field, People section, emoji grid, bottom category tab bar | Centred title, trailing text "Close", **no leading slot**; bottom tab bar of 8 category glyphs, ~24px each |
| A8 | iOS | light | `ios/sheets/notion-ios-sheets-move-to-05-937a87d9….webp` | [screen](https://mobbin.com/screens/937a87d9-a9d1-4b8c-b092-cf5ef8014858) | **Mislabeled** — "Share settings" sheet, Share/Publish segmented control, search field, member row, "General access" row, primary "Share link" pill | Leading `?` icon, centred title, trailing "Done" text — three-slot; full-width blue pill primary action, ~1 row-height tall, ~16px side inset |
| A9 | iOS | light | `ios/sheets/notion-ios-sheets-move-to-11-6d241d3c….webp` | [screen](https://mobbin.com/screens/6d241d3c-f480-42cf-a012-00723d30201f) | **Mislabeled** — same "Share settings" sheet, Publish tab active, publish preview card, full-width "Publish" pill | Same three-slot header as A8; preview card ~45% of sheet height with its own mini status bar |
| A10 | iOS | light | `ios/sheets/notion-ios-sheets-sheet-04-05b9a158….webp` | [screen](https://mobbin.com/screens/05b9a158-e0a7-4679-a403-6105e6a3d57f) | "Select Instructions" — a **floating rounded card**, not edge-to-edge, over a partially visible page behind it | Leading circular `X`, trailing circular checkmark — a confirm-style two-icon header, no text title in that row (title is below, "Select Instructions", left-aligned not centred); three template rows, icon + title + one-line description each |
| A11 | iOS | light | `ios/sheets/notion-ios-sheets-sheet-11-11f9da9e….webp` | [screen](https://mobbin.com/screens/11f9da9e-d759-40cb-b203-62815e78bf2f) | "Discussion" comment-thread sheet — author row, comment body, reaction chips, "Add a comment" field | Circular trailing `X` only, centred title, no leading; handle present above header |
| B1 | iOS | light | `ios/menus/notion-ios-menus-context-menu-13-3601882d….webp` | [screen](https://mobbin.com/screens/3601882d-0003-4794-bd98-d9eb9ccf2234) | "Insert Media" sheet — Photo library/Take photo/Scan document/Choose files rows, over a dimmed "To do list" page | **Title-only header, zero header actions** — no leading, no trailing, no close icon; dismiss is swipe/backdrop only; rounded top corners, floats above the bottom edge with visible margin (not flush) |
| B2 | iOS | light | `ios/menus/notion-ios-menus-menu-10-0d1a034d….webp` | [screen](https://mobbin.com/screens/0d1a034d-fbe8-4bbd-aecd-4fab8a778c2f) | Small **anchored context menu** ("Rename"/"Delete") over a chat-item row, mid-screen, not bottom-anchored | No header, no handle; ~130px wide rounded card; red "Delete" with trash icon |
| B3 | iOS | light | `ios/menus/notion-ios-menus-menu-14-ac33be32….webp` | [screen](https://mobbin.com/screens/ac33be32-036a-4a22-bfd0-9c09d306c617) | "Theme" sheet — Use system setting/Light/Dark rows, checkmark selection | Centred title, **trailing "Done" only, no leading**; three rows, ~50px each by eye, checkmark right-aligned |
| B4 | iOS | light | `ios/menus/notion-ios-menus-more-menu-04-5d02e087….webp` | [screen](https://mobbin.com/screens/5d02e087-c6c6-499e-813d-dd867ce04e92) | "General access" sheet — Only people invited/Everyone at Space/Anyone with link, checkmark selection | **Title-only header**, no leading or trailing action at all; icon + label rows, checkmark trailing |
| B5 | iOS | light | `ios/menus/notion-ios-menus-more-menu-13-93da6545….webp` | [screen](https://mobbin.com/screens/93da6545-7cd8-449c-9bfc-c36f9658786f) | "Discussion" sheet (same shape as A11) with a **toast** ("Muted replies to this discussion") layered over its bottom edge | Confirms the toast pattern stacks over an open sheet, not just over a page (cf. A5) |
| B6 | iOS | light | `ios/menus/notion-ios-menus-page-options-03-ca092fc7….webp` | [screen](https://mobbin.com/screens/ca092fc7-be5c-41fc-8530-621e1186f06b) | "Share settings" sheet, Publish tab — domain row, "Search engine indexing"/"Duplicate as template" toggles, "Embed this page" row, "Unpublish"/"View site" side-by-side buttons | Same three-slot header as A8/A9; the one row-pair in the whole sample with **side-by-side, not stacked** buttons ("Unpublish" outline + "View site" primary, roughly equal width) |
| B7 | iOS | light | `ios/menus/notion-ios-menus-page-options-13-17ab32de….webp` | [screen](https://mobbin.com/screens/17ab32de-dfee-404e-865b-3d12b866bccd) | "Change access" sheet — guest row with a "Guest" chip, Current access/User access sections, red "Remove" row with trash icon | Centred title, **trailing circular `X` only**, no leading; two-line rows (label + description); red destructive row carries a trash icon, matching A4 |
| C1 | iOS | light | `ios/database/notion-ios-database-filters-01-1d5d6adc….webp` | [screen](https://mobbin.com/screens/1d5d6adc-4e6f-41d9-9831-245a420d790b) | "1 filter" sheet — Sort row, "Advanced filter · 1 rule" row (blue, active), search field, property rows | **Title-only header**, zero actions; the "Advanced filter" row is rendered in the accent blue when a rule is set, plain grey label + value otherwise (Sort row) |
| C2 | iOS | light | `ios/database/notion-ios-database-filters-08-d6d8022a….webp` | [screen](https://mobbin.com/screens/d6d8022a-b391-45c1-8901-8200803b9baa) | "Advanced filter" sheet — Title/Contains/Value rows, red "Remove" (trash icon), "Duplicate", "Turn into group", "+ Add filter rule"; a **stacked child sheet "Comparator"** (Is/Is not/Contains/…) layered over its bottom two-thirds | Parent: back chevron leading, centred title, **no trailing**. Child "Comparator": centred title, **trailing "Done" only, no leading** — a stacked sheet, not a replace, confirmed by the parent's dimmed rows still visible above the child's top edge |
| C3 | iOS | light | `ios/database/notion-ios-database-filters-13-e20dff9f….webp` | [screen](https://mobbin.com/screens/e20dff9f-f089-4d08-8f54-d32decbca5e9) | **Mislabeled** — "Sort by" **anchored dropdown** (Manual/Last edited, checkmark) over the Home sidebar list, not a filter and not a full sheet | No header, no handle; ~150px wide rounded card, positioned under its trigger row rather than at a screen edge; background behind it is only lightly dimmed, page content stays legible |
| C4 | iOS | light | `ios/database/notion-ios-database-sort-01-84653307….webp` | [screen](https://mobbin.com/screens/84653307-d85f-4766-991d-f060f6cfe1ac) | "Sort" sheet — Title/Descending rows, red "Delete" (trash icon), greyed-out "Add sort"/"Delete sort" (disabled, single-sort state) | Back chevron leading, centred title, **no trailing** |
| C5 | iOS | light | `ios/database/notion-ios-database-sort-06-e9698e1b….webp` | [screen](https://mobbin.com/screens/e9698e1b-5bfb-4588-b07f-343900daf469) | "Group" sheet — Group by/Text by/Sort rows, "Hide empty groups" toggle, reorderable group rows (drag handle + eye-icon visibility toggle), "Remove grouping"/"Learn about grouping" rows | Back chevron leading, centred title, no trailing; drag-handle glyph (`::`) leading each group row, eye/eye-slash icon trailing instead of a switch |
| C6 | iOS | light | `ios/database/notion-ios-database-properties-01-8bb9115f….webp` | [screen](https://mobbin.com/screens/8bb9115f-e0da-4e01-bd9d-2b627a4b6727) | "Properties" sheet — search field, property rows, "+ New property", "Learn about properties" | Back chevron leading, centred title, no trailing |
| C7 | iOS | light | `ios/database/notion-ios-database-properties-08-050083af….webp` | [screen](https://mobbin.com/screens/050083af-8fc7-4f2b-9e96-defe72762eb6) | A dimmed **guide overlay** ("Task databases require status, assignee, and due date properties", three "Pick the property…" rows) with a **stacked anchored dropdown** ("Status"/"+ Create new") over its bottom third | Two layers of chrome at once: neither is a sheet — the guide is a full-bleed overlay card, the dropdown is a small anchored list with a checkmark |
| C8 | iOS | light | `ios/database/notion-ios-database-properties-16-142cef4e….webp` | [screen](https://mobbin.com/screens/142cef4e-fe09-4fc9-bab5-59d0e4e72de1) | "Conditional color" empty state (illustration, copy, full-width blue "New color setting" pill) with a **stacked "Select property" sheet** over its bottom half | Confirms the empty-state-then-picker stack — a full-page empty state, not a sheet, sits behind a genuine bottom sheet |
| C9 | iOS | light | `ios/database/notion-ios-database-property-editor-02-658fd83b….webp` | [screen](https://mobbin.com/screens/658fd83b-c23b-4573-aac8-a18e06e185a1) | "Use 'Checklist' as default template when creating new pages?" — a **centred floating dialog** over a dimmed "Database templates" sheet | Bold centred question, **no icon this time**; **three full-width stacked rows** ("For all views in…", "Only on…", "Cancel") — one more stacked option than A4's two; no visible close control on the card itself |
| C10 | iOS | light | `ios/database/notion-ios-database-property-editor-07-2f0d2563….webp` | [screen](https://mobbin.com/screens/2f0d2563-d5e6-4f01-adda-18b8d09b74c4) | "View options" sheet — Rename/Display as/Edit view/Source group, Copy link/Open as full page/Hide data source titles group, Duplicate view/red Delete view group | **Title-only header**; three logical groups separated by a **grey gutter band** (a background-colour gap, not a divider line inside one card) — each group is its own rounded card |
| C11 | iOS | light | `ios/database/notion-ios-database-property-editor-12-4593d681….webp` | [screen](https://mobbin.com/screens/4593d681-5b8a-4959-a93f-8d3b740e2f54) | "Edit cadence" sheet (weekday duplication schedule) stacked over a dimmed "Database templates" sheet | Trailing "Save" text, **no leading**, no centred-title icon; seven circular weekday toggle pills (Mo-Fr filled blue, Sa/Su grey outline); red "Stop duplicating" row; footer caption text, no button |
| C12 | iOS | light | `ios/database/notion-ios-database-new-database-02-f08c2a28….webp` | [screen](https://mobbin.com/screens/f08c2a28-c70e-4644-8d9c-33c5b9c7ad09) | "Database templates" sheet — Checklist/Empty rows with `···` overflow buttons, "+ New template" | **Title-only header**, no actions; each row carries its own trailing `···` icon-button rather than a swipe action |
| D1 | iOS | light | `ios/flows/filtering-a-database/notion-ios-flow-filtering-a-database-08-c5fc5db2….webp` | [screen](https://mobbin.com/screens/c5fc5db2-33f2-4e5e-9bfa-dd284ad9408d) | Database page toolbar — view name, search/filter/sort icons, blue "+ New" split pill | Toolbar row sits directly under the page title, no card; icons ~24px, "New" pill ~1 row tall with an attached chevron for the split action |
| D2 | iOS | light | `ios/flows/setting-up-filter/notion-ios-flow-setting-up-filter-01-794591f5….webp` | [screen](https://mobbin.com/screens/794591f5-f9b6-4416-8c0c-bea36a0e1e65) | "View options" sheet (same as C10's content, different property set) — View name field, Layout/Properties/Filter/Sort/Group/Automations rows, "Customize Today Notes" row, Lock/Copy link/Duplicate rows | **Title-only header, trailing "Done" only** (differs from C10's zero-action header for the *same* sheet elsewhere in the set — Notion is inconsistent even for one named sheet); grey gutter bands between every group, five groups visible |
| D3 | iOS | light | `ios/flows/setting-up-filter/notion-ios-flow-setting-up-filter-03-beabc96b….webp` | [screen](https://mobbin.com/screens/beabc96b-a48b-470f-9553-3728e73b5f1b) | "Filters" sheet — a filter-rule pill chip ("1 rule", dropdown chevron, small orange unsaved-state dot), "+ Add filter" row, orange "Save for everyone" row, "Reset filters", "More options" (`···`) | **Three-slot header**: back chevron leading, centred title, trailing "Done" |
| D4 | iOS | light | `ios/flows/setting-up-filter/notion-ios-flow-setting-up-filter-05-39e7ad85….webp` | [screen](https://mobbin.com/screens/39e7ad85-f85e-41de-8bc9-5df639c18e61) | Database page with the filter pill visible in the toolbar and a full-width **orange "Save for everyone" banner** row above the grouped board | Confirms the unsaved-filter state surfaces both as a pill dot and as a banner, not a sheet |
| D5 | iOS | light | `ios/flows/sorting-a-database/notion-ios-flow-sorting-a-database-01-74da3d7a….webp` | [screen](https://mobbin.com/screens/74da3d7a-b6b7-4ab8-ba38-9a17f04de3da) | "New sort" sheet — "Sort by…" search field, Title/Column 1/Column 2 rows | Back chevron leading, centred title, no trailing |
| D6 | iOS | light | `ios/flows/sorting-a-database/notion-ios-flow-sorting-a-database-03-1067756c….webp` | [screen](https://mobbin.com/screens/1067756c-30d6-49b8-bffe-8ae440649969) | Database page — toolbar, orange "Save for everyone" banner, a group header row with count badge and inline `···`/`+`, a card-style row | No sheet open; confirms the group-header row shape (chevron + label + count + trailing icons) that C5's "Group" sheet configures |
| D7 | iOS | light | `ios/flows/sorting-a-database/notion-ios-flow-sorting-a-database-07-946acd58….webp` | [screen](https://mobbin.com/screens/946acd58-032e-49b3-a09e-fae2fdeeca23) | "No filters" sheet — Sort row (blue, "Title" value), search field, property rows, "Advanced filter" row | Title-only header; confirms the filter sheet's Sort row reads in the accent colour whenever a sort is set, plain otherwise (same rule as C1) |
| D8 | iOS | light | `ios/flows/hiding-properties/notion-ios-flow-hiding-properties-02-9867cb76….webp` | [screen](https://mobbin.com/screens/9867cb76-74ed-4ff0-9254-398aeff2265e) | "Property visibility" sheet — search field, "Shown in table" section with trailing "Hide all" link, rows with drag-handle + icon + label + eye-icon toggle | Back chevron leading, centred title, no trailing; the visibility toggle is an **eye/eye-slash icon tap target**, not a switch |
| D9 | iOS | light | `ios/flows/hiding-properties/notion-ios-flow-hiding-properties-03-cc8b241a….webp` | [screen](https://mobbin.com/screens/cc8b241a-76d5-4192-8a33-5b970ea2f9ab) | Same sheet, scrolled — "Hidden in table" section with trailing "Show all" link, two hidden rows | Confirms two independent link actions, one per section, not one global toggle |
| D10 | iOS | light | `ios/flows/hiding-properties/notion-ios-flow-hiding-properties-05-8ce401b5….webp` | [screen](https://mobbin.com/screens/8ce401b5-4d65-493e-988c-0cb7c7d11900) | Database page mid-transition — toolbar label greyed to "New…", table rows greyed with "OPEN" chips faded | A **loading/transitional state**, not a distinct chrome shape; included to confirm one exists and is not sheet-shaped |
| E1 | iOS | light | `ios/flows/page-actions/notion-ios-flow-page-actions-01-71f786c5….webp` | [screen](https://mobbin.com/screens/71f786c5-3415-4b8e-b787-6484bf08b20b) | "Actions" sheet — font-family 3-tile row (Default/Serif/Mono), "Lock page" toggle, Undo/Redo group, Customize page/Turn into wiki group, Add to Favorites/Copy link/Duplicate/Move to/**Move to Trash** group | Title-only header, trailing "Done" only, no leading; grey gutter bands between five groups; **"Move to Trash" is default (black) text with a trash icon, not red** |
| E2 | iOS | light | `ios/flows/page-actions/notion-ios-flow-page-actions-02-838f7123….webp` | [screen](https://mobbin.com/screens/838f7123-8cbd-4a88-8992-7775c02f6ac8) | Page editor with keyboard open, no sheet or menu — context frame only | Included to show the keyboard-open baseline the sheets in this flow open above |
| E3 | iOS | light | `ios/flows/page-actions/notion-ios-flow-page-actions-03-638ed245….webp` | [screen](https://mobbin.com/screens/638ed245-0fb0-415b-91a8-1091df538237) | "Actions" sheet, scrolled — Copy link/Duplicate/Move to/**Move to Trash** group, Page updates/Version history/Show deleted pages group, Notify me row, Export row, Connections/Connect to row, word count and last-edited footer text | Confirms E1's "Move to Trash" colour (black, trash icon, no red) at a second scroll position; footer metadata rendered as plain grey caption text, not a row |
| F1 | iOS | light | `ios/flows/view-options/notion-ios-flow-view-options-01-213f8a7c….webp` | [screen](https://mobbin.com/screens/213f8a7c-6c38-4b4e-9daa-b9cff99cdec2) | Table view with the keyboard open (search/filter row focused), no sheet | Context frame for F2 |
| F2 | iOS | light | `ios/flows/view-options/notion-ios-flow-view-options-03-e4dfff31….webp` | [screen](https://mobbin.com/screens/e4dfff31-b1da-4d5a-8e36-b33ea9c54e96) | "View options" sheet with the "View name" text field focused and the keyboard open, "Done" repeated as the keyboard's own accessory button | Confirms the sheet does not resize for the keyboard beyond what the field needs — the row list below the field is simply covered |
| G1 | web | light | `web/dialogs/notion-web-dialogs-command-palette-01-e0bcd679….webp` | [screen](https://mobbin.com/screens/e0bcd679-56a2-44ac-8a4b-e97188edae28) | **Mislabeled** — full-page "Ask AI" chat home, not a command palette or a dialog | No modal chrome at all; included only to record the miss |
| G2 | web | light | `web/dialogs/notion-web-dialogs-dialog-01-af8c3aec….webp` | [screen](https://mobbin.com/screens/af8c3aec-a932-4988-adde-b5baba6d6a01) | "Collaborate with teammates" — centred modal, workspace row (avatar, name, plan, "Join workspace" link), full-width blue "Create a new workspace" pill | **Leading back chevron + centred title + trailing `X`** — three-slot, the same shape as the phone's three-slot sheets; card is ~470px wide by eye, rounded on all corners, does not touch any viewport edge, page behind it visibly dimmed |
| G3 | web | light | `web/dialogs/notion-web-dialogs-dialog-02-ba93ce22….webp` | [screen](https://mobbin.com/screens/ba93ce22-6dd3-4eda-ace5-0b78d593f8e0) | "Are you sure you want to cancel your trial…" — centred modal, four feature-loss rows (icon + label + one-line description), fine-print date text | Centred title, **trailing `X` only, no leading**; **two full-width stacked buttons**, "Yes, cancel trial on…" (outline) over "Go back" (outline) — no colour-coded primary, matching A4/C9's stacked-full-width phone pattern on desktop |
| G4 | web | light | `web/dialogs/notion-web-dialogs-dialog-03-ad51a8b8….webp` | [screen](https://mobbin.com/screens/ad51a8b8-e251-447e-8a17-502d2159b3c5) | "Status agent" — a **two-pane floating panel** (settings left, "Preview with…" pane right), banner notice, trigger rows (On page creation/update/Recurring), toggle rows, footer quality sliders + Save changes/Run agent buttons | Icon + title leading, undo/redo icons, trailing `X`; not centred on the viewport — anchored below the toolbar, left-biased; ~370px left pane + ~190px right pane |
| G5 | web | light | `web/dialogs/notion-web-dialogs-dialog-04-27ae8065….webp` | [screen](https://mobbin.com/screens/27ae8065-9cc6-48ca-989f-cfb95b1f220a) | "Import in progress…" — small centred modal, icon, description, single "Go back to Notion" button | Trailing `X` only; ~270×210px by eye — the smallest modal in the set, roughly square, not the frame's typical elongated-card shape |
| G6 | web | light | `web/dialogs/notion-web-dialogs-dialog-05-9150b32f….webp` | [screen](https://mobbin.com/screens/9150b32f-ddb0-46e4-bc7b-59da95f2c751) | "Import PDF into Notion" — icon, title, description, "Selected file" row, "Import location" dropdown row, full-width blue "Continue" primary, "Learn about imports" link | Trailing `X` only; single full-width primary button (no cancel row at all — dismissal is the `X` or the outside click) |
| H1 | web | light | `web/menus/notion-web-menus-menu-01-78e7f802….webp` | [screen](https://mobbin.com/screens/78e7f802-2ece-4893-8542-90fe84170ce8) | Page `···` **anchored dropdown** — font-family 3-tile row (Ag Default/Serif/Mono), Copy link/Copy page contents/Duplicate/Move to/Archive/**Move to Trash** group, Present/Small text/Full width/toggle rows, Lock page/Use with AI submenu row, Undo/Import/Export/Turn into wiki, Updates & analytics | No header at all; groups separated by **thin divider lines inside one card** (not a grey gutter band — the opposite of the phone "Actions"/"View options" sheets); **"Move to Trash" is default-colour text with a trash icon, not red**, same as E1/E3 |
| H2 | web | light | `web/menus/notion-web-menus-more-menu-01-49ebf525….webp` | [screen](https://mobbin.com/screens/49ebf525-3275-423a-9dda-725fdb0c1d68) | "Keyboard shortcuts" — a large centred modal with a Popular/Create & style/Edit & move/Markdown/Commands/more… tab row, search icon, sectioned rows with key-cap chips right-aligned | Title top-left (not centred), no visible leading/trailing close glyph inside the frame's crop; ~628px wide by eye — the largest, most reference-document-like modal in the set |
| H3 | web | light | `web/menus/notion-web-menus-more-menu-03-8aff7e5c….webp` | [screen](https://mobbin.com/screens/8aff7e5c-7473-4965-807f-92cb8d55eba2) | "Export" modal — Export format/Database views/Page content dropdown rows, two toggle rows, footer buttons | **No title text at all** — the modal opens directly on its rows; footer **"Cancel" (outline) + "Export" (blue) side by side**, the only desktop dialog in the set with side-by-side rather than stacked footer buttons; ~330px wide |
| H4 | web | light | `web/menus/notion-web-menus-more-menu-05-09777bcb….webp` | [screen](https://mobbin.com/screens/09777bcb-7748-472e-9801-2b411d4bca6f) | "Explore plans" — large centred modal, current-plan card, four-column plan comparison table | Trailing `X` only, no leading, no back chevron despite being reached from a settings list (contrast with G2) |
| H5 | web | light | `web/menus/notion-web-menus-page-options-01-5e7e723d….webp` | [screen](https://mobbin.com/screens/5e7e723d-8a09-4a0b-ac77-58cd66bce4e5) | Page-display `···` **anchored dropdown** — Backlinks row ("Show on hover" trailing chip), Page discussions/Table of contents toggles, Inline comments ("Default" trailing chip) | No header; ~220px wide; every row carries its own trailing control (chip or switch), none are plain navigational rows |
| I1 | web | light | `web/database/notion-web-database-filters-01-56aa9350….webp` | [screen](https://mobbin.com/screens/56aa9350-dfa8-4b57-a296-5ad2aa18137c) | **Mislabeled** — a table with the header search field focused ("Smith"), no filter UI open | Included only to record the miss |
| I2 | web | light | `web/database/notion-web-database-filters-03-53858386….webp` | [screen](https://mobbin.com/screens/53858386-6aba-40c7-a0f6-bc3b5aed0e49) | **Mislabeled** — a code-block language picker **anchored dropdown** (search field, scrollable language list, checkmark on "JavaScript") | No header; confirms the generic anchored-list shape recurs for non-database pickers too |
| I3 | web | light | `web/database/notion-web-database-properties-01-39684b6e….webp` | [screen](https://mobbin.com/screens/39684b6e-3307-402e-bdaf-7a0f3e668673) | **Mislabeled** — the same "Status agent" two-pane panel as G4, reached from a database toolbar this time | Same chrome as G4; confirms the panel shape is reused verbatim across entry points |
| I4 | web | light | `web/database/notion-web-database-properties-03-35c32af9….webp` | [screen](https://mobbin.com/screens/35c32af9-0c3b-4ecb-a2e4-aa293fafb9dc) | "Property visibility" **side panel** for a board view — search field, "Shown in board"/"Hidden in board" sections, trailing "Hide all"/"Show all" links, drag-handle + icon + label + eye-icon rows | Anchored **mid-right**, ~190px wide, starts below the toolbar row — does **not** span full viewport height and does **not** dock flush to the right edge; back chevron leading, trailing `X`, no centred title styling distinct from a left-aligned one |
| I5 | web | light | `web/database/notion-web-database-property-editor-01-c08e8ce9….webp` | [screen](https://mobbin.com/screens/c08e8ce9-74ff-41c3-ab52-a750a3ad1f1d) | Same "Status agent" panel with a **split-button dropdown** open under "Run agent" ("Run on the first page / 5 pages / 10 pages / all pages", each with a credit-cost hint) | A menu stacked over a panel's own footer button, not over the panel's frame — the panel stays fully visible, undimmed, behind the small anchored menu |
| I6 | web | light | `web/database/notion-web-database-property-editor-05-deb747e2….webp` | [screen](https://mobbin.com/screens/deb747e2-2093-4228-b366-4957da0b3ca2) | "Team page automation" — centred modal, "When" trigger builder ("+ Page added" row already set, "+ Add trigger"), a vertical connector line, "Do" action builder (Send notification/People picker/Message textarea, "+ Add action"), footer Cancel/Enable | Trailing `X` only; narrow ~254px card; **Cancel (text) + Enable (blue, disabled-grey until valid) side by side**, right-aligned — a third footer-button arrangement (cf. G3 stacked, H3 side-by-side-both-enabled) |
| I7 | web | light | `web/database/notion-web-database-property-editor-10-5df2fdae….webp` | [screen](https://mobbin.com/screens/5df2fdae-e41f-46fa-932c-3181ed65349f) | Same "Status agent" panel with the "On page creation" trigger **dropdown open** (None/Any page creation ✓/Created in…) | Confirms trigger rows expand into their own small anchored list, nested one level inside the panel |
| I8 | web | light | `web/database/notion-web-database-new-database-01-e00ca642….webp` | [screen](https://mobbin.com/screens/e00ca642-dcfd-4797-aec7-9ae0d780ec3d) | "New database" **floating panel**, reached from the "+ New" toolbar button — "Describe what you want to build" field, "New empty data source"/"Import CSV" rows, "Suggested" template list; canvas behind shows an unrelated "Something went wrong / Try again" empty state | Anchored top-right below its trigger, ~230px wide, does not reach the viewport's top or bottom edge; trailing `X` only |
| I9 | web | light | `web/database/notion-web-database-database-template-01-db686263….webp` | [screen](https://mobbin.com/screens/db686263-c5af-44cb-b9db-d1b8727d2616) | **Mislabeled** — a full template-gallery page (Requirements/Details/Categories), not a modal | Included only to record the miss |
| I10 | web | light | `web/database/notion-web-database-side-peek-01-3647446f….webp` | [screen](https://mobbin.com/screens/3647446f-f959-4e58-baba-ef7e4f9ab6b0) | "Version history" **side peek** — plain-text header + trailing `X` (no leading), a scrollable list of timestamped revision rows, footer "Learn more" link + primary "Restore" button | Right-anchored, ~340px wide, inset from **all four edges** — does not touch the top bar or the viewport's bottom edge, so it is a floating panel, not a full-height dock |
| I11 | web | light | `web/database/notion-web-database-side-peek-03-a1c31875….webp` | [screen](https://mobbin.com/screens/a1c31875-094e-4623-b543-e095a9e36853) | An emoji-reaction **anchored popover** (~330px, search field, People section, emoji grid) stacked over a **comments side panel** (~250px, threaded replies, attachment row) that itself runs near-full viewport height, right-flush | The one side surface in the whole sample that **is** edge-flush and close to full height — the comments/inbox family, not the config-panel family I4/I10 belong to |
| J1 | web | light | `web/flows/filtering-a-database/notion-web-flow-filtering-a-database-01-9693630d….webp` | [screen](https://mobbin.com/screens/9693630d-784e-459c-9bd0-76db35d32b99) | Plain database table, no filter/sort UI open | Context frame; toolbar shows Filter/Sort/`+` icons directly in the row, no pill |
| J2 | web | light | `web/flows/filtering-a-database/notion-web-flow-filtering-a-database-05-13bbee6c….webp` | [screen](https://mobbin.com/screens/13bbee6c-0965-4c08-8d76-91e2a41dd09a) | Filter-value **anchored dropdown** — property name + "Contains" operator chip at top, a checkbox multi-select list of values below | No header; ~135px wide; positioned directly under the toolbar's "Filter" trigger, left-aligned to it, not centred |
| J3 | web | light | `web/flows/filtering-a-database-2/notion-web-flow-filtering-a-database-2-03-d9d59162….webp` | [screen](https://mobbin.com/screens/d9d59162-2dec-4d32-8d1a-2852ef8e6be6) | Filter-value dropdown, single-select variant (radio-style highlighted row rather than checkboxes) for a select-type property | Same anchored-list shape as J2, ~255px wide; confirms the picker's own control type (checkbox vs. single-highlight) is decided by the property type, not by the chrome |
| J4 | web | light | `web/flows/filtering-a-database-advanced/notion-web-flow-filtering-a-database-advanced-02-433ade8f….webp` | [screen](https://mobbin.com/screens/433ade8f-0d6c-48e0-9f5c-c06041622933) | Filter-builder anchored dropdown — one condition row: "Where [Name] [Contains] [Value]", `···` overflow, "+ Add filter rule", "Delete filter" | No header, no title; the whole builder is a single-row-tall dropdown directly under the "1 rule" toolbar pill, not a panel or sheet |
| J5 | web | light | `web/flows/filtering-a-database-advanced/notion-web-flow-filtering-a-database-advanced-05-24295cd3….webp` | [screen](https://mobbin.com/screens/24295cd3-d92b-453e-8566-2f4f50fe14db) | Same builder with a second rule added ("Where…"/"And…"), "+ Add filter rule"/"Delete filter" | Confirms multi-rule state stays a two-row dropdown, no extra chrome for the second rule beyond the "And" connector label |
| J6 | web | light | `web/flows/sorting-a-database/notion-web-flow-sorting-a-database-02-82d66d47….webp` | [screen](https://mobbin.com/screens/82d66d47-ccea-421c-8ef8-94e855c1163f) | Sort **anchored dropdown** — plain property list (Name/Date Joined/Formula/Person/Role/Status), no rule yet | No header; ~140px wide, directly under the "Sort" toolbar icon |
| J7 | web | light | `web/flows/sorting-a-database/notion-web-flow-sorting-a-database-04-e57c782d….webp` | [screen](https://mobbin.com/screens/e57c782d-f578-4d24-ac76-4c5ef616f256) | Sort dropdown with a rule set — property chip + "Ascending" direction toggle + remove `×`, "+ Add sort" opening a nested property-search list | Confirms the sort builder nests a second, narrower dropdown (search field + property list) inside the first when adding a rule, rather than pushing to a new surface |
| J8 | web | light | `web/flows/sorting-a-database-2/notion-web-flow-sorting-a-database-2-02-9e80b489….webp` | [screen](https://mobbin.com/screens/9e80b489-cadb-42dd-b321-b2a67d52a3d4) | Sort-by dropdown, plain property list (Name/Date/ID/User characteristics) for a different database | Same shape as J6; confirms it is not database-specific |
| K1 | web | **dark** | `web/flows/switching-to-dark-mode/notion-web-flow-switching-to-dark-mode-04-270a428f….webp` | [screen](https://mobbin.com/screens/270a428f-0ec3-46d5-8d8d-8ef3576e8939) | Dark-theme page, no sheet/menu/dialog open | Page background reads as a near-black warm grey (`#191919`-ish by eye, not sampled); included only to confirm dark exists on web and that no dark modal/sheet capture exists anywhere in the harvest |
| K2 | web | **dark** | `web/flows/switching-to-dark-mode/notion-web-flow-switching-to-dark-mode-05-cfa128af….webp` | [screen](https://mobbin.com/screens/cfa128af-7a43-4ea8-a392-4417887e860e) | Dark-theme page, board view, no sheet/menu/dialog open | Same finding as K1 on a second surface |

---

## 3. Patterns

Ordered by how much of the shell surface each one defines.

### P1 — Three chrome shapes, not one, and they do not map 1:1 to platform

Every screen in §2 resolves to one of three shapes: a **bottom sheet** (iOS only — rounded top
corners, occupies from mid-frame to the bottom edge or further, dismissed by swipe/handle or an
explicit close), an **anchored popover/dropdown** (both platforms — a small rounded card positioned
under or beside its trigger, no header of its own, dismissed by an outside tap), and a **centred
floating dialog** (mostly web, twice on iOS — rounded on all four corners, does not touch any frame
edge, scrim dims the parent). iOS: sheets A2-A11, B1,B3-B7, C1-C12 minus the anchored ones,
D2,D3,D5,D8,D9,E1,E3,F2; popovers B2, C3, C7 (dropdown half); dialogs A4, C9. Web: popovers H1, H5,
I2, I5, I7, J2-J8; dialogs G2-G6, H2-H4, I6, I8 (I8 and the "New database" panel sit between a popover
and a dialog — anchored like a popover, but with a dialog's rows and buttons). **This is the pattern
that defines the most surface**: which of the three a given feature gets is not predictable from the
feature alone (filters are a full sheet on iOS and a one-row popover on web for the identical rule
builder — J4/J5 vs. D3/C2).

### P2 — The header has at least five slot combinations, not one canonical three-slot shape

Counting only iOS sheets and web dialogs with a header at all: **title-only, zero actions** (B1, B4,
C1, C6, C10, C12, D2, D8, D9, E1 — the single most common shape in the sample, ~10 of ~30 headered
surfaces); **title + trailing text/icon, no leading** (A7, A11, B3, B7, G3-G6, H4, I6, I8, I10);
**leading icon/chevron + title, no trailing** (A2, C4, C5, C6); **leading + title + trailing, three
slots** (A6, A8, A9, B6, D3, G2); and **no title text at all** (H3, H5, J2-J8's builders). A given
named sheet is not even consistent with itself across two entries in the set — "View options" is
title-only with zero actions at C10 and title-only with a trailing "Done" at D2, same content,
different chrome.

### P3 — The close affordance splits into "explicit control" and "handle/backdrop only," roughly evenly

Where a header exists, about half the sheets add an explicit close (a circular `X`, or text — "Done",
"Close", "Save") and about half rely on the handle and an outside tap alone, with no visible
correlation to how destructive or how deep the sheet is: A3 (Change access) and A11 (Discussion) both
add a circular `X`; B4 (General access) and C1/C6/C10/D2/D8 (Filters/Properties/View options) do not,
despite General access being no less consequential than Change access.

### P4 — Grouped sections use a background-colour gutter band on iOS, a thin divider line on web

Every multi-group iOS sheet in the set (C10, D2, E1) separates its logical groups with a **grey
gutter band** — a background-colour gap between two rounded cards, not a line inside one card. The
one equivalent web surface (H1, the page `···` menu) separates its groups with **thin divider lines
inside a single card** instead. The two platforms do not share one grouping convention even within
Notion's own product.

### P5 — Destructive-row colour tracks reversibility, not the action's name

Every "Delete"/"Remove" row that has no recovery path is red with a trash icon: C2's filter "Remove",
C4's sort "Delete", A4/C9's dialog primary buttons, B2's context-menu "Delete", B7's member "Remove".
Every "Move to Trash" row — reversible, because Notion has a Trash — is rendered in the sheet's
**default foreground colour**, trash icon only, no red: E1, E3 (iOS "Actions" sheet) and H1 (web page
menu) all agree on this, on both platforms, across three separate captures.

### P6 — Confirm/destructive dialogs are a fourth shape, not a bottom sheet with buttons

A4 and C9 (iOS) and G3 (web) all render "are you sure" as a **small centred floating card** — not a
bottom sheet, not full width, rounded on all four corners, with margin on every side — carrying
**stacked full-width buttons** (two at A4/G3, three at C9) rather than a side-by-side pair. This shape
does not appear anywhere else in the set; it is reserved for the confirm/destructive family
specifically, on both platforms.

### P7 — Filter/Sort/Properties builders are sheet-on-phone, popover-on-desktop for the identical feature

The clearest phone/desktop split in the sample. iOS drills into a dedicated full sheet per concern
(Filters D3, Sort C4, Properties C6, Property visibility D8, Group C5), each reached by pushing from
"View options" and returned to with a back chevron. Web never promotes the same concern past a small
anchored dropdown under the toolbar (J2-J8, H1's font-family row): no filter, sort or property-visibility
surface in the web set is a modal or a panel, all of them are single- or double-row popovers.

### P8 — Notion's own "side peek" is popover-sized for config, near-full-height only for comments

I4 (Property visibility) and I10 (Version history) both float mid-viewport, inset from all four
edges, sized to their content (~190-340px). I11's comments panel is the only side surface in the
sample that runs close to full height and sits edge-flush right. Notion does not have one "right side
sheet" shape either — it has a small popover for database/page configuration and a taller,
edge-docked panel reserved for the comments/inbox family.

### P9 — A picker's own value editor is a further pushed/stacked surface, never inline

C2's "Comparator" stacks over "Advanced filter"; J7's "Add sort" nests a second dropdown inside the
first; I5/I7's trigger and run-count pickers stack over "Status agent"'s own footer. No screen in the
set shows a value editor rendered inline inside the row that opened it.

---

## 4. Divergences from our surface

Each row: the Notion pattern from §3, what our tree does today (cited by `file:line`), the
`design-trueup.md` value where one exists for the same question, and the gap.

| Pattern | Our tree today | `design-trueup.md` (Anytype) | Gap |
|---|---|---|---|
| **P1** — three chrome shapes | `DbModal.applyPresentation` (`src/views/modals/db-modal.ts:92-113`) declares exactly two presentations, `modal`/`sheet`, plus `fullscreen` under review (`goal.md` §4, "the third open question"); the `menu`/`panel`/`condition panel` roles in `design-system.md` §3 (lines 77-84) already give us a popover-shaped surface distinct from `sheet` | Confirms the sheet/popover/menu three-way split (`design-trueup.md` §3, "the three navigation moves") | No gap in kind — our role vocabulary already has the pieces. The gap is that our shell routes every destructive confirm through `sheet` (below), where **both** references keep confirms in a fourth, dialog-shaped bucket |
| **P2/P3** — header slot count and close affordance | `createSheetHeader` (`src/views/mobile-bottom-sheet.ts:160-176`) builds exactly **two slots** unconditionally — title, then `beforeClose` controls, then a `44px` close (`044` REQ-007, "header everywhere") — on every phone sheet, with **no title-only variant** | `design-trueup.md` C6 (§6) reads Anytype as **three slots, title centred, on every sheet header** and ADOPTs it; C2 REFUSEs the handle-only dismissal for accessibility (E1, 2.21:1 contrast) and keeps the 44px close universal | Notion corroborates neither reference's "always N slots" claim — its own plurality answer (§3 P2) is **title-only, zero actions**, closer to our two-slot shape than to Anytype's proposed universal three-slot header. This does not reopen `044`'s accessibility-grounded 44px-close ruling (E1 stands on its own number), but it means the "no title-less variant" clause has no corroboration from a second reference — flagged as an open question in §6, not acted on |
| **P4** — grouped-band sections | No iOS-only grouped-band convention exists in our tree; `.db-panel-row` (referenced at `styles.css:53`, "PANEL ROWS") groups rows inside one card with dividers, matching Notion's own **web** convention (H1), not its phone one | Not addressed — `050`/`051`'s true-up measures divider inset and row pitch (design-trueup §2b, §6 C8) but not a between-groups background-colour gap | Open gap: no `design-trueup.md` row licenses a grey-gutter-band grouping style for phone sheets with multiple sections (our `AddDatabaseModal`, `StatusPresetManagerModal` and similar multi-section surfaces from the census rows 2, 6 would be the candidates). Not something to build from Notion alone — named for the research loop (§6) |
| **P5** — destructive-row colour by reversibility | Matches. `goal.md` §4's 2026-09-06 amendment records the operator's ruling — *"No confirm for single delete, Undo toast"* — closing ADR-007 E4 on exactly this reversibility line | `design-trueup.md` row 1 (§5a) already names Anytype's own Bin-reversibility argument for why no confirm appears at all, and ADR-007 exception E3 (§8c) adopts red-plus-trash-icon on every destructive row **where a confirm exists** | No gap — a second, independent confirmation that the reversible/irreversible colour line is the right one, not a new finding |
| **P6** — confirm dialogs as a fourth, centred, stacked-button shape | `ConfirmModal` (`src/views/modals/confirm-modal.ts:37,42`, `super(app, "sheet")`) always presents the confirm as a phone **sheet**; `buildConfirmSheetBody` (`src/views/confirm-sheet.ts:54-71`) lays its Cancel/confirm pair out via `.db-modal-actions` (`styles.css:8592-8598`), `display: flex; justify-content: flex-end` — **side-by-side, right-aligned**, on both desktop and phone | Row 1 (§5a) marks the confirm's shape as **"Not seen"** in any of the 118 iOS states or 600 menu files — Anytype's true-up is silent on confirm geometry, not agreeing or disagreeing | Notion is not silent where Anytype is: it shows a small centred, edge-margined, stacked-full-width-button card on both platforms (A4, C9, G3), never a bottom sheet with a right-aligned button row. Flagged for §6 and §5 — this is new information a still-open packet question (`spec.md` confirm-shape, tracked under AC-012/E4) does not yet have an Anytype answer to weigh against |
| **P7** — filter/sort as sheet-on-phone, popover-on-desktop | Our `filter-panel-renderer.ts:259` and `sort-panel-renderer.ts:113` (design-trueup rows 33, 29) already give filter/sort the `condition panel` role — a desktop-anchored popover — and a phone `sheet` presentation, i.e. we already split by platform the way Notion does | `design-trueup.md` rows 29, 33 (§5c) ADOPT Anytype's own equivalent split (360px desktop sub-page vs. phone sheet) | No gap in kind. Notion's version keeps the desktop half to a **single- or double-row dropdown** (J2-J8) rather than a 360px sub-page — narrower than either Anytype's or our own condition-panel width. Not actionable against `design-system.md` §5's already-open 440-560px `condition panel` conflict (`roadmap.md` §7.11) without widening that conflict further; named, not resolved |
| **P8** — no single "side sheet" shape | The 2026-09-06 amendment (`goal.md` §4) already shipped a **420px, full-height, edge-docked** right side sheet for the desktop database Settings surface, ruled "Keep the overlay" by the operator | Not addressed — `050`/`051`'s true-up has no desktop side-panel measurement to compare | Notion's own closest equivalents (I4, I10) are **not** full-height or edge-docked — they float, inset on all sides, sized to content. This does not contradict the operator's shipped ruling (D6/D8 already exclude Anytype-only refinements from redoing an operator ruling, and this is a Notion-only observation with no Anytype backing either), but it is worth naming: the shipped shape is closer to Notion's comments-panel outlier (I11) than to Notion's own config-panel norm |
| **P9** — value editors are always pushed/stacked | Matches our shell's existing stacking model (`048`, thirty-one registered pairs in `tools/live/sheet-grammar.mjs`) and the `design-trueup.md` §4 per-pair ruling (two convert to replace-in-place, twenty-nine keep stacking) | §4 (ADR-002) | No gap — third independent confirmation that no surface in this family renders a value editor inline |

---

## 5. Anytype vs Notion

Per the packet's binding (`goal.md` §2): the operator ruled **Anytype parity by default**
(`design-trueup.md` §8, ADR-007, Accepted 2026-09-05), and that ruling is not reopened here. Where
Notion's evidence disagrees with an already-adopted Anytype value, this section names the
disagreement; it does not resolve it, and nothing in this document changes an ADR.

- **Header slot count (P2).** Anytype: three slots, title centred, on every sheet header
  (`design-trueup.md` C6, ADOPTed). Notion: at least five slot combinations across the sample, with
  **title-only, zero actions** the single most common shape (§3 P2) — the opposite end from
  Anytype's "always three." The two references disagree; the parity ruling already resolved this in
  Anytype's favour for `051`, so this is recorded as a named disagreement, not a reopened question.
- **Close affordance (P3).** Anytype: handle-only on every sheet, refused for accessibility (C2,
  REFUSE, the packet's one refusal) — the 44px close survives *despite* Anytype's own evidence, on a
  contrast number (E1). Notion: roughly half its sheets add an explicit close and half do not, with
  no visible rule distinguishing them. Notion neither corroborates Anytype's handle-only norm nor
  contradicts our 44px-close ruling — it simply does something else, inconsistently. Not a
  disagreement to act on; the accessibility number that decided C2/E1 does not move.
- **Grouped-section chrome (P4).** Neither Anytype's true-up nor our tree currently has a
  grey-gutter-band convention for multi-section phone sheets — Anytype's own multi-section sheets
  (e.g. the view-config sheet, design-trueup row 34) use plain row lists with dividers, matching our
  `.db-panel-row` grammar, not Notion's banded groups. This is a Notion-only pattern with no Anytype
  backing; nothing here licenses adopting it under the "parity by default" ruling, which targets
  Anytype specifically (`goal.md` §2, "the design read of record is `../050-anytype-adoption/design-trueup.md`").
- **Confirm dialog shape (P6).** Anytype: silent (row 1, "Not seen" in any of 118 iOS states or 600
  menu files). Notion: a specific, consistent fourth shape — small centred card, stacked full-width
  buttons, margined on all sides — shown identically on both its platforms (A4, C9, G3). Because
  Anytype has no answer here, there is no Anytype ruling for Notion's evidence to contradict; this is
  new information for the still-open confirm-shape question (`spec.md`, tracked under AC-012/E4),
  not a correction to anything landed.
- **Desktop side-panel shape (P8).** Anytype: not measured by `050`/`051` for a desktop side panel at
  all. Notion: floats, content-sized, inset on all edges for config surfaces (I4, I10); only its
  comments/inbox family (I11) is edge-flush and near-full-height. Our shipped right side sheet
  (`goal.md` §4, 2026-09-06 amendment, operator-ruled "Keep the overlay") is full-height and
  edge-docked — closer to Notion's outlier than its norm, and with no Anytype measurement on either
  side of the comparison. Recorded, not actioned: the operator's ruling on this shape is dated
  2026-09-06 and closes AC-013; this document does not reopen it.

---

## 6. Open questions for the research loop

1. **Does a title-only header (no leading, no trailing action) belong in the shell as a first-class
   header variant?** `044` REQ-007 currently forbids a title-less variant and mandates the 44px close
   everywhere, on Anytype's contrast evidence (C2/E1). Notion's plurality shape (§3 P2, §4) is the
   mirror case — title-only, no close at all — and is the single most common header in this sample.
   Anytype's ruling is accessibility-grounded and this document does not challenge it, but the
   question of whether *some* surfaces (e.g. purely informational sheets with no destructive or
   stateful action) could use a title-only header without an accessibility regression has no answer
   in `design-trueup.md` and is worth a targeted capture-reread rather than an inference from Notion
   alone.
2. **What shape should the confirm primitive take where Anytype offers no evidence?** P6/§5 shows
   Notion using a fourth, dialog-like shape — centred, margined, stacked full-width buttons — that
   neither our shipped `ConfirmModal` (a `sheet` with right-aligned buttons, `confirm-sheet.ts:54-71`)
   nor Anytype's true-up addresses. This bears on the still-open AC-012/E4 confirm-shape question and
   should be weighed alongside whatever the operator's own device pass finds, not adopted from Notion
   alone (D8: Anytype is a design source, and this packet's design source is Anytype, not Notion).
3. **Is the grey-gutter-band grouping (P4) worth a capture-level check against Anytype's own
   multi-section sheets**, given our current `.db-panel-row` grammar already matches Anytype's
   divider-based grouping and Notion's banded alternative has no Anytype backing either way?
4. **Does the shipped right-side-sheet shape for desktop Settings (`goal.md` §4 amendment, AC-013)
   want revisiting against Notion's popover-sized norm**, or does the operator's "Keep the overlay"
   ruling already settle it regardless of what either reference shows? This document takes no
   position — the ruling is dated after both true-ups and is not superseded by a second reference
   with no Anytype corroboration on either side.
5. **The harvest has zero dark-theme sheet, menu or dialog captures on either platform** (§1). If a
   theme-parity check against Notion is ever wanted for this surface, a targeted re-harvest with
   dark-mode toggled before the query run would be needed — nothing in the current 3,647-file set
   answers it.

---

## RELATED DOCUMENTS

- **Goal**: See `goal.md`
- **Anytype design true-up**: See `design-trueup.md`
- **Notion capture index**: See `../../../../screenshots/notion/README.md`
- **Repo evidence rule**: See `../../../../repo-rules/` (local rules only; the shared evidence rule
  is symlinked and git-ignored in this worktree)
