---
title: "Notion Screens Digest: Calendar View, Chips, Multi-Day Spans, Navigation, Date-Property Pickers"
description: "A second reference read, alongside the Anytype true-up, of the Notion screens Mobbin returned for the calendar surface — month grid, week/day scales, chips, multi-day spans, today, navigation, unscheduled items, date-property pickers, and the phone calendar."
date: 2026-09-06
surface: "calendar view (month grid, week/day scales, chips, multi-day spans, today, navigation, unscheduled items, date-property pickers, phone calendar)"
phase: "005-component-surface-system/057-calendar-anytype-parity"
trigger_phrases:
  - "notion calendar digest"
  - "057 notion screens"
  - "notion calendar screens read"
  - "notion vs anytype calendar"
importance_tier: "high"
contextType: "research"
---
# Notion Screens Digest: The Calendar Surface

> This is a **research read**, not a ruling. `../050-anytype-adoption/design-trueup.md`'s ADR-004
> posture (Anytype captures adopted unless a measured WCAG ground says otherwise) governs what
> ships; nothing here reopens a row that document or `057/design-trueup.md` already closed. Where
> Notion disagrees with Anytype, §5 names it rather than picking a side.

---

## 1. Selection

**40 unique screens read** (by Mobbin screen id), all from `screenshots/notion/{ios,web}/`, all
harvested 2026-09-06 per `screenshots/notion/README.md`'s provenance section. The hinted folders
were read in full and then widened:

- `ios/views/notion-ios-views-calendar-{01..15}` — 15 files, all 15 unique ids
- `ios/flows/adding-an-end-date/` — 5 files, 5 unique ids (2 shared with the calendar-view group)
- `ios/flows/connect-to-notion-calendar/` — 3 files, 3 unique ids
- `ios/flows/enabling-a-reminder/` — 5 files, 5 unique ids (2 shared with the calendar-view group)
- `ios/sheets/notion-ios-sheets-date-picker-{03,04,09,12}` — 4 files (2 shared with the flow
  groups above), found by the `Notion date picker` query
- `web/views/notion-web-views-calendar-01` — the only web file the `Notion calendar view` query
  filed here; the group holds one file, not fifteen
- `web/flows/connecting-to-notion-calendar/` — 2 files
- `web/flows/connecting-to-notion-calendar-2/` — 6 files
- `web/flows/creating-a-database-calendar/` — 4 files
- `web/flows/moving-a-database-entry-calendar/` — 3 files

**Widening.** `Notion calendar app` and `Notion database view options` / `Notion view options`
returned zero screens filed under those groups (every id they found was already on disk under a
different query, so nothing new to read). `Notion date picker` is fully covered above (4 files,
iOS only — web has no query group by that name and no file matches `*date-picker*` under
`web/database/` or `web/dialogs/`). No further widening found new on-topic material inside the
capture set's own coverage; the searches are recorded so a later reader does not repeat them.

**Skipped as off-topic, not near-duplicate.** `screenshots/notion/README.md`'s own caveat —
"the group is the query, not a verified reading of the image" — holds for exactly the fraction it
warned about. **15 of the 40** screens read are misfiled relative to the calendar surface and
carry no calendar chrome at all:

- `cb9d8cab`, `20aeb3fe` (`ios/flows/adding-an-end-date`) — a note's title bar showing a date or a
  date range next to the title; no grid, no picker.
- `442295aa`, `ca4fd83f` (`ios/flows/enabling-a-reminder`, `ios/sheets`) — a link-sharing
  **"Change access"** sheet with an expiry-date row; a date field, but for a share link, not an
  event.
- `c7890bf3`, `d2589d77`, `f318b5e0` (`ios/flows/connect-to-notion-calendar`) — a "Connect
  Calendar" tooltip over a meeting note and a browser pop-up-blocked dialog. This flow is the
  **external** calendar-sync feature (Google/iCloud), not the database calendar view.
- `8d3114c7`, `22671d55` (`web/flows/connecting-to-notion-calendar`) — the workspace Home screen's
  "Upcoming events" widget and the same connect-calendar modal.
- `fa7a1586`, `ffe6cfb5`, `3c1cca91`, `ef26f2c9`, `1574fef0`, `69be6087`
  (`web/flows/connecting-to-notion-calendar-2`) — a "Welcome to Notion" onboarding page, the
  connect-calendar modal, a participants popover and a "Join Google Meet" context menu. Same
  external-connect feature as above, six frames of it.

These are listed in §2 with a one-line description and no measurements, per "one row per screen
read," but none of them feeds §3 or §4.

**No dark-theme screen exists among the 40.** Every calendar-tagged Notion capture in this harvest
— iOS and web alike — is light theme; nothing in `ios/views/notion-ios-views-calendar-*`,
`web/views/notion-web-views-calendar-*`, or the six flow folders above is dark. This is unlike the
Anytype set (10 light + 10 dark). It is stated here rather than papered over: **every measurement
below is light-theme only**, and no Notion dark-theme comparison is possible from this harvest.

**Scale caveat.** iOS files are 299×678/680px, web files 768×521/523px — Mobbin-served `webp`
thumbnails, not 1:1 device captures like the Anytype set (`057/design-trueup.md` §2a verified that
set at 1 device px = 1 CSS px by three independent checks; no such verification is possible here,
and no scale factor for these thumbnails is claimed). No pixel-sampling tool was available for this
read (the Anytype true-up used a scripted per-pixel scan; this read is a visual proportional
reading of the same rendered images this document's author looked at). Every measurement below is
stated as **an approximate capture-px reading**, several rendered images wide/tall, not a
per-pixel-verified CSS value — explicitly weaker evidence than the Anytype true-up's, and not
comparable 1:1 to it. Where a value cannot be read with any confidence it says so rather than
guessing.

---

## 2. Per-screen table

One row per screen read. **Id** is the Mobbin screen id (short form, first 8 hex chars — unique in
this table). **Path** is relative to `screenshots/notion/`.

| Id | Platform | Theme | Path | Mobbin | Content | Measured / read |
|---|---|---|---|---|---|---|
| `7be7fafb` | iOS | light | `ios/views/notion-ios-views-calendar-01-7be7fafb-3dfb-42e9-855a-832a431a053b.webp` | [screen](https://mobbin.com/screens/7be7fafb-3dfb-42e9-855a-832a431a053b) | A "To do list" note with a database calendar block below it: May 2026, populated, today marked | Header `‹ Today ›`-style single "Need to do ⌄" + search/filter/`+` row above the grid, not inside it; weekday row `Sun Mon Tue Wed Thu Fri Sat` (three-letter, **Sunday-start**); 6 visible week rows; today (29) a **filled red circle** on the day number; no visible event chips in the rows shown (no dated entries in this list) |
| `420ef2f0` | web | light | `web/flows/creating-a-database-calendar/notion-web-flow-creating-a-database-calendar-04-420ef2f0-6dd1-4923-92ec-246df8c4cae2.webp` | [screen](https://mobbin.com/screens/420ef2f0-6dd1-4923-92ec-246df8c4cae2) | "Creative pipeline" database, Calendar layout, July 2025, populated with 4 chips | Toolbar: `Table \| Board \| Calendar \| 2 more...` tabs, then `Manage in Calendar` button, `‹ Today ›`, filter/sort/search/`+`/`New` icons, all in **one row** above the weekday header; weekday row `Sun Mon Tue Wed Thu Fri Sat`, **Sunday-start**; today (9) a **filled red circle**; chips are **boxed pills** — visible light-grey fill and a rounded border, a small leading page-icon, left-aligned text, sitting a few px below the day number; one chip ("Mood Poster") visually spans **two adjacent day cells** in the same row without a gap between them |
| `23cdb6d5` | web | light | `web/flows/moving-a-database-entry-calendar/notion-web-flow-moving-a-database-entry-calendar-01-23cdb6d5-a17d-4e1d-800c-5b52a76fa0ad.webp` | [screen](https://mobbin.com/screens/23cdb6d5-a17d-4e1d-800c-5b52a76fa0ad) | "User Interviews" database, Calendar layout, Feb 2024, populated with multi-day bars | Toolbar: `Table \| Calendar` tabs, `Open in Calendar`, `‹ Today ›`, then filter/sort/`+`/`New`; weekday row `Sun Mon Tue Wed Thu Fri Sat`, **Sunday-start**; today (21) **filled red circle**; "Jon Doe" is a **continuous bar spanning a full week row's width**, breaking and restarting on the next row — a per-week-clipped multi-day span, the same structural pattern our own renderer already uses; single-day entries ("Arthur Burr", "Missy Tek", "Alicia Cunner") read as plain **left-aligned text with no visible fill**, unlike the boxed pills in `420ef2f0` |
| `1c3f11f8` | web | light | `web/flows/moving-a-database-entry-calendar/notion-web-flow-moving-a-database-entry-calendar-02-1c3f11f8-0fc2-4f39-ae29-2ce8ce4e612d.webp` | [screen](https://mobbin.com/screens/1c3f11f8-0fc2-4f39-ae29-2ce8ce4e612d) | Same view, mid-drag: one cell (Wed 7) shows a **light-blue fill** as the drop target | The drag-target cell's tint reads as a flat, uniform fill across the whole cell, not a border or an outline; "Jon Doe"'s bar has shortened by one day versus `23cdb6d5`'s frame, consistent with a live drag-resize preview |
| `132e14f0` | web | light | `web/flows/moving-a-database-entry-calendar/notion-web-flow-moving-a-database-entry-calendar-03-132e14f0-971c-484f-bd36-70a01afec5ba.webp` | [screen](https://mobbin.com/screens/132e14f0-971c-484f-bd36-70a01afec5ba) | Same view, drag committed: "Jon Doe" now starts one row later and one day earlier in the week | Confirms the multi-day bar is **recomputed per week row** after a drag, not redrawn as one continuous shape across the row break |
| `e3c6d725` | web | light | `web/flows/creating-a-database-calendar/notion-web-flow-creating-a-database-calendar-03-e3c6d725-1cf0-4c02-99bd-321651646710.webp` | [screen](https://mobbin.com/screens/e3c6d725-1cf0-4c02-99bd-321651646710) | The "New view" submenu, opened from a Timeline view's view-tab row | Menu lists `Empty view`, `Table`, `Board`, `Chart`, `List`, `Timeline`, **`Calendar`**, `Gallery`, `Feed` as one flat list, no grouping, no icon-tile grid; each row ≈ one line, left-aligned icon + label |
| `0a4f8e88` | web | light | `web/flows/creating-a-database-calendar/notion-web-flow-creating-a-database-calendar-02-0a4f8e88-84c7-4c35-8b5b-4f245a44b4bb.webp` | [screen](https://mobbin.com/screens/0a4f8e88-84c7-4c35-8b5b-4f245a44b4bb) | The view-switcher dropdown, opened from the same Timeline view, before "New view" | Lists the database's own configured views (`Table`, `Board`, `Chart`, `Timeline`) above a `+ New view` row and a `Form` row; a search field sits at the top of the popover |
| `5960b442` | web | light | `web/flows/creating-a-database-calendar/notion-web-flow-creating-a-database-calendar-01-5960b442-09d2-4ed6-974b-8af68acdf893.webp` | [screen](https://mobbin.com/screens/5960b442-09d2-4ed6-974b-8af68acdf893) | The same database in its Timeline layout, before any view is added | Context frame only — establishes the "before" state for `0a4f8e88`/`e3c6d725`; no calendar chrome visible |
| `812c6468` | iOS | light | `ios/views/notion-ios-views-calendar-03-812c6468-f2fd-4015-ae83-e2e88f6ffb71.webp` | [screen](https://mobbin.com/screens/812c6468-f2fd-4015-ae83-e2e88f6ffb71) | The Date **property** sheet: a single date, a month grid, and a "Date format" submenu open | Sheet is two stacked panels: a calendar picker (7 columns, no weekday letter row, 6 numeric rows, selected day a **filled blue circle**, an adjacent day a **filled red circle** — today, not the selection) above a plain settings list; "Date format" submenu below it lists `Full date / Short date / Month/Day/Year / Day/Month/Year / Year/Month/Day / Relative` with a checkmark on the current choice |
| `365eabc0` | iOS | light | `ios/views/notion-ios-views-calendar-04-365eabc0-4a33-4d0c-81ee-60ce8a8b5af9.webp` | [screen](https://mobbin.com/screens/365eabc0-4a33-4d0c-81ee-60ce8a8b5af9) | Same Date sheet, settings list expanded, "End date" off | Rows, in order, each one line with a right-aligned value: `End date` (toggle, off), `Date format` (`Full date ›`), `Include time` (toggle, **on**), `Time format` (`12 hour ›`), `Timezone` (`GMT+7 ›`), `Remind` (`None ›`), then a full-width `Clear` row below a gap |
| `e58d8c68` | iOS | light | `ios/views/notion-ios-views-calendar-05-e58d8c68-9f11-40ea-932c-9f743d730098.webp` | [screen](https://mobbin.com/screens/e58d8c68-9f11-40ea-932c-9f743d730098) | Same sheet, `Date format` now `Relative` | Confirms the row list is static and only the value column changes; row order identical to `365eabc0` |
| `73217bdc` | iOS | light | `ios/views/notion-ios-views-calendar-06-73217bdc-f67c-4315-8cdd-1c8afd6db409.webp` | [screen](https://mobbin.com/screens/73217bdc-f67c-4315-8cdd-1c8afd6db409) | Same sheet, `End date` **on**: two date fields stacked, a date range selected in the grid | Two date-input rows stacked above the grid (start, end) instead of one; the grid shows the range as **two shades of blue** — a lighter fill spanning between the endpoints and a solid fill on the endpoints themselves; `Include time` now off, `Remind` row absent (replaced by the range display) |
| `0022bdd6` | iOS | light | `ios/views/notion-ios-views-calendar-07-0022bdd6-430a-46c8-897b-342f19a1e710.webp` | [screen](https://mobbin.com/screens/0022bdd6-430a-46c8-897b-342f19a1e710) | Same sheet with `End date` on, `Timezone` submenu open | Submenu: a search field (`Search cities, timezones...`), a `Current timezone` group with one row checked (`Jakarta GMT+7:00`), then a `Select a timezone` list starting `Abidjan GMT` |
| `5bac3734` | iOS | light | `ios/views/notion-ios-views-calendar-08-5bac3734-42a0-4868-a77e-a9be29ce8502.webp` | [screen](https://mobbin.com/screens/5bac3734-42a0-4868-a77e-a9be29ce8502) | Same sheet, `Remind` set to `5 minutes before` | Confirms the `Remind` row's value updates in place; same row set as `365eabc0` otherwise |
| `ab24efe6` | iOS | light | `ios/views/notion-ios-views-calendar-09-ab24efe6-5118-4b74-a400-b15bfb96fc8d.webp` | [screen](https://mobbin.com/screens/ab24efe6-5118-4b74-a400-b15bfb96fc8d) | Same sheet, `Timezone` submenu, list scrolled/no search entered | Same submenu as `0022bdd6`, single date not a range this time (9:00 AM shown, no end-date toggle visible above the fold) |
| `d7432519` | iOS | light | `ios/views/notion-ios-views-calendar-10-d7432519-3d48-45cf-8a09-dc046ed8d402.webp` | [screen](https://mobbin.com/screens/d7432519-3d48-45cf-8a09-dc046ed8d402) | Same sheet, `End date` on, but the grid replaced by a **titled, nav-arrowed** month calendar | Grid header reads `May 2026` with `‹ ›` arrows — the only iOS date-sheet frame in this set that shows month navigation chrome on the inline picker; weekday row absent even here (bare numeric grid); range shown as two solid-blue endpoint days, no lighter "between" fill visible in this frame |
| `3d1ba4aa` | iOS | light | `ios/views/notion-ios-views-calendar-11-3d1ba4aa-ab76-4d9e-b7e3-2a8d90156c3c.webp` | [screen](https://mobbin.com/screens/3d1ba4aa-ab76-4d9e-b7e3-2a8d90156c3c) | Same sheet, single date, `Time format: Hidden`, `Timezone: PDT` | A day (9) shown with a **blue outline, no fill** — a hover/focus-style ring distinct from the solid-blue selected-day fill seen elsewhere; confirms `Time format` has a `Hidden` option beyond `12 hour` |
| `6a6e6e87` | iOS | light | `ios/views/notion-ios-views-calendar-12-6a6e6e87-dc75-4980-a186-947b283d5d13.webp` | [screen](https://mobbin.com/screens/6a6e6e87-dc75-4980-a186-947b283d5d13) | Same sheet, `End date` on, both dates equal (single-day "range") | Two date-input rows both reading `May 28, 2026`; the grid shows day 28 in a **darker solid blue**, matching neither the lighter nor the darker fill seen in `73217bdc`'s true multi-day range — a same-day range appears to collapse to one solid marker |
| `cfca14fb` | iOS | light | `ios/sheets/notion-ios-sheets-date-picker-09-cfca14fb-a833-4bf6-b549-9e646bac5ec9.webp` | [screen](https://mobbin.com/screens/cfca14fb-a833-4bf6-b549-9e646bac5ec9) | Same sheet family, but with an explicit **titled, weekday-lettered** month grid: `May 2026 ‹ ›` above a `Su Mo Tu We Th Fr Sa` row | The one iOS frame in this set that shows both the month title/nav **and** the weekday letter row on the inline picker together; weekday row is **two-letter, Sunday-start**, distinct from the three-letter `Sun Mon...` used in the real calendar view (`7be7fafb`) |
| `fd9402ee` | iOS | light | `ios/flows/enabling-a-reminder/notion-ios-flow-enabling-a-reminder-03-fd9402ee-7d2b-4998-aab8-40ae08c6fc10.webp` | [screen](https://mobbin.com/screens/fd9402ee-7d2b-4998-aab8-40ae08c6fc10) | The `Remind` submenu, opened from the Date sheet | Six rows: `None` (checked), `At time of event`, `5 minutes before`, `10 minutes before`, `15 minutes before`, `30 minutes before` — a flat list, no grouping, no icons |
| `2413d15d` | iOS | dark-scrim/light-sheet | `ios/views/notion-ios-views-calendar-02-2413d15d-1ec7-4d3f-9855-9436fc479326.webp` | [screen](https://mobbin.com/screens/2413d15d-1ec7-4d3f-9855-9436fc479326) | Behind a dimmed "Database templates" modal, a **recurrence-interval** sheet: `Day / Weekday / Week / 2 Weeks / Month / 3 Months / 6 Months / Year` | A flat list of eight rows, no icons, no current-value check visible in this crop; this is a repeat-interval picker (for a recurring reminder), not the calendar's own date-property picker — tangentially relevant, kept for completeness |
| `4c2cbe60` | web | light | `web/views/notion-web-views-calendar-01-4c2cbe60-ba3b-43b3-8fbc-e98c8fb486d2.webp` | [screen](https://mobbin.com/screens/4c2cbe60-ba3b-43b3-8fbc-e98c8fb486d2) | An inline "Pick a date" mini-popover, anchored below a page's title, over the sidebar+cover layout | Popover ≈ 130 capture-px wide in the 768-wide frame (≈17% of the frame); month title + `‹ ›` (`Apr 2026`) at top; weekday row `Su Mo Tu We Th Fr Sa`, **Sunday-start**, single-letter-ish abbreviations at this scale; 6 numeric rows; today (10) a **filled red circle**; no time or timezone rows visible — this popover reads as bare-date only |
| `11caf701` | iOS | light | `ios/views/notion-ios-views-calendar-13-11caf701-71c3-49aa-93e5-0c91e8144bf3.webp` | [screen](https://mobbin.com/screens/11caf701-71c3-49aa-93e5-0c91e8144bf3) | A database view's "Settings" sheet (`This Week`) | Rows: `Layout (Table ›)`, `Property visibility (5 ›)`, `Filter (Date ›)`, `Sort ›`, `Group ›`, `Conditional color ›`, `Copy link to view`, then a "Data source settings" group: `Source (↗ Days ›)`, `Edit properties ›`, `Automations ›`, `AI Autofill ›`, `More settings ›`, `Open as full page`. **No "Date Property" row of the kind Anytype's layout panel has** is visible here — this view's date field is presumably set via `Filter (Date ›)` or a property editor, not a dedicated calendar-settings row |
| `5b2ae35d` | iOS | light | `ios/views/notion-ios-views-calendar-14-5b2ae35d-4cce-4340-a973-e6e2db005345.webp` | [screen](https://mobbin.com/screens/5b2ae35d-4cce-4340-a973-e6e2db005345) | The "Layout" picker, a **10-tile grid**, `Feed` selected | Tiles: `Table, Board, Timeline, Calendar, List, Gallery, Chart, Feed, Map, Dashboard` — 3 per row, 4 rows (last row 1 tile); below the grid, per-layout toggles: `Show data source title`, `Show page icon`, `Wrap properties`, `Show author byline`, then `Open pages in (Center peek ›)`, `Load limit (10 ›)` |
| `320f03de` | iOS | light | `ios/views/notion-ios-views-calendar-15-320f03de-6340-4a6a-ad48-f38383f18c58.webp` | [screen](https://mobbin.com/screens/320f03de-6340-4a6a-ad48-f38383f18c58) | Same Layout picker, `Table` selected | Same 10-tile grid; toggles differ by layout: `Show data source title`, `Show vertical lines`, `Show page icon`, `Wrap all content`, `Open pages in (Side peek ›)`, `Load limit (50 ›)` — confirms the settings **below** the tile grid are per-layout, not shared, and neither frame shows a `Calendar`-specific settings panel (no `Date Property` or `Show icon` row appears for either `Feed` or `Table`) |
| `cb9d8cab` | iOS | light | `ios/flows/adding-an-end-date/notion-ios-flow-adding-an-end-date-01-cb9d8cab-f85b-438f-bb06-4d1d07b90322.webp` | [screen](https://mobbin.com/screens/cb9d8cab-f85b-438f-bb06-4d1d07b90322) | Off-topic: a note titled "Meeting @May 28, 2026 → May 29, 2026" | Skipped — no calendar-view chrome; the arrow-separated date range is the note title's own inline date-range display, not a grid or picker |
| `20aeb3fe` | iOS | light | `ios/flows/adding-an-end-date/notion-ios-flow-adding-an-end-date-05-20aeb3fe-f645-4b66-ac13-a5fae2f343e0.webp` | [screen](https://mobbin.com/screens/20aeb3fe-f645-4b66-ac13-a5fae2f343e0) | Off-topic: same note, title now "Meeting @Today 12:02 PM" with a small clock glyph | Skipped — same reason |
| `442295aa` | iOS | light | `ios/flows/enabling-a-reminder/notion-ios-flow-enabling-a-reminder-05-442295aa-3ddc-4510-938d-b5ea92c9354f.webp` | [screen](https://mobbin.com/screens/442295aa-3ddc-4510-938d-b5ea92c9354f) | Off-topic: a link-sharing "Change access" sheet, `Link expires` submenu open (`Never / In an hour / In a day / In a week / Choose date`) | Skipped — a share-link expiry picker, not the calendar surface |
| `ca4fd83f` | iOS | light | `ios/sheets/notion-ios-sheets-date-picker-12-ca4fd83f-fca7-4e85-9232-3b747854779b.webp` | [screen](https://mobbin.com/screens/ca4fd83f-fca7-4e85-9232-3b747854779b) | Off-topic: same "Change access" sheet, `Link expires: Jun 4, 2026 at 2:12 PM` chosen | Skipped — same reason; this is why the `Notion date picker` query surfaced it |
| `c7890bf3` | iOS | light | `ios/flows/connect-to-notion-calendar/notion-ios-flow-connect-to-notion-calendar-01-c7890bf3-767a-46d5-bc49-cc8ceaf9cdde.webp` | [screen](https://mobbin.com/screens/c7890bf3-767a-46d5-bc49-cc8ceaf9cdde) | Off-topic: a meeting note, plain | Skipped — establishing frame for the connect-calendar flow below |
| `d2589d77` | iOS | light | `ios/flows/connect-to-notion-calendar/notion-ios-flow-connect-to-notion-calendar-02-d2589d77-3862-43e8-ad86-72b08b2a9efa.webp` | [screen](https://mobbin.com/screens/d2589d77-3862-43e8-ad86-72b08b2a9efa) | Off-topic: a "Connect Calendar" tooltip over the note's icon | Skipped — the external calendar-sync feature, not the database calendar view |
| `f318b5e0` | iOS | light | `ios/flows/connect-to-notion-calendar/notion-ios-flow-connect-to-notion-calendar-03-f318b5e0-2c9e-4db2-9bb3-128f468ccc0a.webp` | [screen](https://mobbin.com/screens/f318b5e0-2c9e-4db2-9bb3-128f468ccc0a) | Off-topic: a browser "pop-ups blocked" dialog | Skipped — same flow, an OAuth pop-up failure, not UI to measure |
| `8d3114c7` | web | light | `web/flows/connecting-to-notion-calendar/notion-web-flow-connecting-to-notion-calendar-01-8d3114c7-1b97-49ac-9c54-4097b8266cfd.webp` | [screen](https://mobbin.com/screens/8d3114c7-1b97-49ac-9c54-4097b8266cfd) | Off-topic: workspace Home, an "Upcoming events" widget card + a sidebar `Notion Calendar` app entry | Skipped for the digest's core patterns — this is the separate "Notion Calendar" companion app's home-widget, not the database calendar view; noted in §6 as a possible future comparison |
| `22671d55` | web | light | `web/flows/connecting-to-notion-calendar/notion-web-flow-connecting-to-notion-calendar-02-22671d55-50ed-418c-bff4-bf07c6837ecc.webp` | [screen](https://mobbin.com/screens/22671d55-50ed-418c-bff4-bf07c6837ecc) | Off-topic: same Home, connect-calendar modal open (`Continue with Google / iCloud`) | Skipped — same reason |
| `fa7a1586` | web | light | `web/flows/connecting-to-notion-calendar-2/notion-web-flow-connecting-to-notion-calendar-2-01-fa7a1586-e22b-433e-aaca-333b90f495ac.webp` | [screen](https://mobbin.com/screens/fa7a1586-e22b-433e-aaca-333b90f495ac) | Off-topic: "Welcome to Notion" onboarding page, sidebar "Connect Calendar" button | Skipped |
| `ffe6cfb5` | web | light | `web/flows/connecting-to-notion-calendar-2/notion-web-flow-connecting-to-notion-calendar-2-02-ffe6cfb5-227d-4cfd-9d20-9d8da267b935.webp` | [screen](https://mobbin.com/screens/ffe6cfb5-227d-4cfd-9d20-9d8da267b935) | Off-topic: connect-calendar modal over the same page | Skipped |
| `3c1cca91` | web | light | `web/flows/connecting-to-notion-calendar-2/notion-web-flow-connecting-to-notion-calendar-2-03-3c1cca91-ee25-43ab-86a4-9d5f450a8197.webp` | [screen](https://mobbin.com/screens/3c1cca91-ee25-43ab-86a4-9d5f450a8197) | Off-topic: same page, now with an "Upcoming events" list in the sidebar after connecting | Skipped |
| `ef26f2c9` | web | light | `web/flows/connecting-to-notion-calendar-2/notion-web-flow-connecting-to-notion-calendar-2-04-ef26f2c9-b9db-42ff-b4d8-64ff27490b93.webp` | [screen](https://mobbin.com/screens/ef26f2c9-b9db-42ff-b4d8-64ff27490b93) | Off-topic: same sidebar, a `Join Google Meet / Call ID / Participants / Open in calendar` context menu on an event row | Skipped |
| `1574fef0` | web | light | `web/flows/connecting-to-notion-calendar-2/notion-web-flow-connecting-to-notion-calendar-2-05-1574fef0-d39a-405f-8215-e5cea83b0172.webp` | [screen](https://mobbin.com/screens/1574fef0-d39a-405f-8215-e5cea83b0172) | Off-topic: same menu's "Participants" submenu | Skipped |
| `69be6087` | web | light | `web/flows/connecting-to-notion-calendar-2/notion-web-flow-connecting-to-notion-calendar-2-06-69be6087-ffb8-42f6-b549-49adb1cae5c7.webp` | [screen](https://mobbin.com/screens/69be6087-ffb8-42f6-b549-49adb1cae5c7) | Off-topic: back to the plain sidebar with the "Upcoming events" list, no menu open | Skipped |

---

## 3. Patterns

Ordered by how much of the surface they define, most first. Each names the screens that show it
and what was measured; §1's scale caveat applies to every value.

### P1 — The month grid is Sunday-start on both platforms, in every populated calendar-view frame

`7be7fafb` (iOS, real calendar block), `420ef2f0`, `23cdb6d5`/`1c3f11f8`/`132e14f0` (web, real
calendar layouts), and `4c2cbe60`/`cfca14fb` (the inline date-pickers) all show a `Su/Sun`-first
weekday row. Four **distinct, unrelated Notion databases/pickers**, both platforms, agree. This is
the single most load-bearing pattern in the set because it directly contradicts Anytype's measured
convention — see §5.

### P2 — Today is a filled, brand-coloured circle on the day number, never a background wash

`7be7fafb`, `420ef2f0`, `23cdb6d5`/`1c3f11f8`/`132e14f0`, `4c2cbe60` all mark today with a small
**filled red disc** directly on the numeral, not a cell-background tint. No frame in this set shows
a today *cell* fill distinct from an ordinary cell. Structurally the same shape convention as
Anytype's `#3C7FFB` disc (`057/design-trueup.md` §2c "Today marker"); only the accent hue differs
(brand red vs brand blue), which is expected and not a parity gap.

### P3 — Multi-day spans are per-week-clipped continuous bars, not a title plus a separate date-range string

`23cdb6d5` → `1c3f11f8` → `132e14f0` is one entry ("Jon Doe") dragged across a week boundary,
observed in three states. In every state the bar is a single continuous run for as much of the
span as fits one week row, breaking cleanly at the row edge and resuming as its own bar on the next
row — no visible connector, fade, or "continues" glyph across the break. **No frame in this set
shows a start–end date string printed inside or beside a multi-day bar.** The single-day entries
in the same view (`Arthur Burr`, `Missy Tek`, `Alicia Cunner`) are plain left-aligned text with no
visible box.

### P4 — Populated calendar-view chips can be boxed pills with an icon, not always flat text

`420ef2f0`'s "Creative pipeline" chips read as **light-filled, bordered, rounded pills** with a
small leading page-icon and left-aligned text — closer to a card than to Anytype's flat row. This
sits in tension with `23cdb6d5`'s plain-text single-day entries in a different database. Read
together, Notion's own chip presentation is **not fixed** — it varies by database/view
configuration, unlike Anytype's uniformly flat chip across all twenty of its captures.

### P5 — The calendar view's own toolbar puts all navigation and actions in one row, above the weekday header

`420ef2f0` and `23cdb6d5` both show a single row holding: the view-tab switcher (`Table | Board |
Calendar | ...`), an "external calendar" action (`Manage in Calendar` / `Open in Calendar`), the
`‹ Today ›` cluster, then filter/sort/search/add icons and a primary "New" button — all before the
weekday header, none of it inside the grid. `7be7fafb`'s iOS note-embedded calendar keeps the same
ordering but drops the view-tab row (it's a single-view block, not a full database page).

### P6 — The date-property picker is a two-panel sheet on iOS: a bare numeric grid, then a flat settings list

`812c6468`, `365eabc0`, `e58d8c68`, `73217bdc`, `0022bdd6`, `5bac3734`, `ab24efe6`, `d7432519`,
`3d1ba4aa`, `6a6e6e87`, `cfca14fb` — eleven frames of the same sheet family. The settings-list row
order is stable across all of them: `End date` (toggle) → `Date format` (submenu) → `Include time`
(toggle) → `Time format` (submenu, gated on `Include time`) → `Timezone` (submenu, gated on
`Include time`) → `Remind` (submenu) → `Clear`. Only `d7432519` and `cfca14fb` show the inline
calendar with a month title and `‹ ›` nav; the other nine show a bare numeric grid with no
title/nav/weekday row at all — the chrome is not constant even within one sheet family.

### P7 — The database-view "Layout" picker is a large, uniform icon-tile grid; Anytype's is not

`5b2ae35d` and `320f03de` show **ten** layout tiles (`Table, Board, Timeline, Calendar, List,
Gallery, Chart, Feed, Map, Dashboard`) in a fixed 3-per-row grid, with a **different set of
toggles below it per selected layout**. No frame in this set shows this grid with `Calendar`
itself selected, so its selected-state styling (Anytype's true-up records a `#3C7FFB` border +
label on the selected tile) is not confirmed from the Notion side.

---

## 4. Divergences from our surface

Each pattern above against what ships today, cited `file:line`.

**P1 (Sunday-start) vs ours.** `calendar-renderer.ts:2069`'s `weekStartsOn` is configurable and
currently **ships Sunday-start** — confirmed both by `acceptance-criteria.md` G7 ("Observed red
today: ... Sunday start") and by grep (no default override found toward Monday). `057/design-trueup.md`
A1 "Week start" row calls ours "a superset" of Anytype's fixed Monday and rules **No change**. P1
does not move that row — see §5, this is exactly the case where Notion's evidence and Anytype's
evidence disagree and the operator has not yet ruled (`decision-record.md`'s 2026-09-06 note,
P0-2 Proposed).

**P2 (today disc) vs ours.** Already matched: `styles.css:16522`-`:16533` is a 26×24px filled
`#216DFA` disc with a white numeral, landed under `057/design-trueup.md` §6 R4. P2 confirms the
*shape* choice (filled disc on the numeral, not a cell wash) independently of Anytype; no change
implied.

**P3 (multi-day: continuous bar, no date-range string) vs ours.** Ours adds a second element,
`db-calendar-month-dates` (`calendar-renderer.ts:424`-`:429`, styled `styles.css:17264`-`:17272`,
11px muted, centred inside its own flex slot), printing a `start–end` string on every non-timed
multi-day segment. `057/design-trueup.md` C5 already marked Anytype's multi-day presentation
"pixel read owed" (no multi-day event in twenty captures) — Notion now supplies direct evidence
neither reference had: eleven weeks of a real multi-day entry, and none of them print a
date-range string on the bar itself. Separately, the operator's own gestalt read already flagged
this exact element as a defect — G3 ("nothing in between" the title and a "muted date string"
right-aligned in the last cell) and G5 ("`+1 more` centred in 20 cells") in `acceptance-criteria.md`.
P3 is a second, independent line of evidence for removing or rethinking that string, and unlike P1
it is **not** a case of Notion contradicting a landed Anytype ruling — Anytype had nothing to say
on this element at all, so nothing here needs preserving against.

**P4 (boxed pill chips in one Notion database) vs ours.** `057/design-trueup.md` A3 already ruled
and **landed** the flat chip: `styles.css:17085`-`:17109` carries `background: none`, `border: 0`,
`border-radius: 0`. P4 is the divergence §5 flags explicitly — see below. No code change is implied
by this finding alone.

**P5 (one toolbar row, all controls) vs ours.** `057/design-trueup.md` A5 already adopted a
three-control `‹ Today ›` cluster plus the month/year selects, and ADR-002 kept a fourth control
(the scale segment) as a named, recorded deviation (§7 of that document). P5 does not add a new
gap; it corroborates the existing "everything in one row above the weekday header" shape, which
ours already follows (`calendar-renderer.ts:2127`-`:2167` builds `db-calendar-header` →
`db-calendar-controls` → title selects, all one row per `styles.css:15785`-`:15792`).

**P6 (date-property sheet row order) vs ours.** Ours has **no per-record date-property editing
sheet of any kind** — `057/design-trueup.md` A8 states plainly: "none in the calendar; the date
field is chosen in the view config," and `goal.md`'s completion criteria still lists the
date-property picker row unread (`**Today: unread.**`). P6 is new, first-hand evidence for that
still-open row: eleven frames of the row order (`End date` → `Date format` → `Include time` →
`Time format` → `Timezone` → `Remind` → `Clear`) `047`/`050`/`051`'s captures never supplied,
because they read Notion's *view-level* `Date Property ›` selector (in the layout panel), not its
*per-record* date-field editor. These are two different surfaces in Notion, and A8 as scoped in
`057/design-trueup.md` is the view-level one — P6 documents the other one for completeness, not as
a direct A8 input.

**P7 (ten-tile layout grid) vs ours.** Out of this packet's scope by `057/design-trueup.md` A8's
own note ("Out of scope: `053` owns the view switcher"). Recorded so the boundary stays visible: if
`053` ever reads Notion for its own switcher, `5b2ae35d`/`320f03de` are the two frames to start
from, and neither shows the `Calendar` tile in its selected state.

---

## 5. Anytype vs Notion

Per the operator's standing ruling, Anytype is parity by default (`goal.md` D3, `050` ADR-007's
posture) and nothing below authorises silently overturning a row that ruling already closed.
Named, not resolved:

**Week start — a live disagreement, and neither side has landed.** Anytype: Monday, in all twenty
set captures (`057/design-trueup.md` §2c). Notion: Sunday, in four independent populated/inline
calendar frames (P1: `7be7fafb`, `420ef2f0`, `23cdb6d5`-family, `4c2cbe60`). Ours currently ships
Sunday (G7, `acceptance-criteria.md`), and the operator's own P0-2 proposal to move to Monday is
**Proposed**, not Accepted (`decision-record.md`, 2026-09-06 note) — so nothing here reverses a
landed ruling. But it changes what "Anytype parity" would cost: adopting Monday for Anytype-parity
reasons would **also** diverge from Notion's own convention on both platforms, not just from ours.
Worth putting in front of the operator before P0-2 is ruled either way.

**Event chip presentation — Anytype's ruling is landed; Notion disagrees; do not let this reopen
it quietly.** Anytype: flat, no background, no border, no radius, across all twenty captures, and
`057/design-trueup.md` A3 ruled and shipped that treatment (`styles.css:17085`-`:17109`). Notion:
`420ef2f0`'s chips are boxed pills with a fill and a border (P4) — a different, product-specific
choice, and the *same* Notion instance (`23cdb6d5`) also shows plain unboxed text for a different
database. This is exactly the pattern the operator's instruction to me warns about: Notion
"refinements" must not undo the landed Anytype ruling. **This finding does not do that** — it is
recorded as a disagreement between the two references, not as grounds to re-add a border or fill.
If a future leg wants to revisit A3, it needs a fresh operator ruling naming this section, the same
way ADR-002 named the week/day-scale question.

**Multi-day date-range text — no disagreement, because Anytype has no position.** Anytype: not
captured, marked "pixel read owed" in `057/design-trueup.md` C5. Notion: P3's eleven frames show a
continuous bar with no date-range string. Since Anytype never ruled on this element, adopting or
dropping the date-range string on Notion's evidence alone does not touch an Anytype ruling — it is
a genuinely open element neither reference source contradicts the other on, just one with new
first-hand evidence now that didn't exist when `057/design-trueup.md` was written.

**The layout-picker tile count — not a contradiction, a scope note.** Anytype's own layout panel
(`050`/`051`'s true-up, not measured fresh here) is six tiles: Grid, Gallery, List, Kanban,
Calendar, Graph. Notion's is ten (P7). Neither number is ours to adopt — `053` owns the view
switcher — so this is recorded for that packet, not ruled here.

**Today marker hue — not a disagreement.** Anytype `#3C7FFB` blue vs Notion's red (P2) is each
product's own brand accent on the same shape convention (a filled disc on the numeral). Ours
already ships a darkened Anytype-hue blue (`#216DFA`, `057/design-trueup.md` §6 R4) for a measured
WCAG reason; Notion's different hue is not evidence against that, since Notion's own contrast on
its accent was not measured here.

---

## 6. Open questions for the research loop

- **Week start (P1/§5).** Put Notion's Sunday-start evidence in front of the operator before
  `decision-record.md`'s P0-2 is ruled — the Anytype-parity argument for Monday now has a
  same-strength counter-argument from a second reference product.
- **A8's two surfaces.** `057/design-trueup.md` A8 reads Notion's *view-level* `Date Property ›`
  selector; this digest's P6 reads its *per-record* date-field editor instead, because no frame in
  this 40-screen set shows the view-level selector itself opened (only the Layout tile grid around
  it, `11caf701`/`5b2ae35d`/`320f03de`, none of which expose the `Date Property ›` row). If A8 is
  ever re-opened, a **targeted** re-search for `Notion date property` or a re-crawl of the layout
  panel specifically (not the general `Notion database view options` query, which returned nothing
  new here) would be the next step, not a re-read of this set.
  - Related: `057/design-trueup.md` A8 also flags **"Show icon" toggle track colour"** contrast
    (§6 R5) and cites `calendar-toolbar-renderer.ts:314` as already landed; P4/P6 do not touch that
    row.
  - Related: `047`'s "6 calendar menus, 5 distinct surfaces" finding was Anytype-side; nothing in
    this Notion set changes that count.
- **Chip variability (P4).** Is Notion's boxed-pill chip driven by a per-database "card" style
  toggle, a select-property colour, or something else? None of the 40 screens shows the setting
  that produces it — worth a targeted follow-up search (`Notion calendar card style` or similar)
  if the operator wants to weigh in on A3 again.
- **No dark-theme Notion calendar capture exists in this harvest.** If a Notion-side dark-theme
  comparison is ever wanted, it needs a fresh Mobbin crawl — this harvest's calendar-tagged screens
  are 40-for-40 light.
- **The phone gap stays open.** Nothing in this digest touches it: no Notion screen here is an
  Obsidian-plugin phone surface, and `057/design-trueup.md` §8's "design inferred from desktop"
  posture for the phone calendar is Anytype-side reasoning this document does not alter.
- **The external "Connect Calendar" feature (15 skipped screens) is a different product surface
  entirely** — Google/iCloud calendar sync, a companion "Notion Calendar" app, meeting-note
  auto-generation. If that feature is ever in scope for a future packet, `8d3114c7` through
  `69be6087` are already on disk and read once; they were not read again for pattern-mining here
  because they carry no calendar-*view* chrome.

---

## RELATED DOCUMENTS

- **Design true-up (the design record of record)**: `design-trueup.md` — the nine anatomy elements
  this digest cross-reads against Notion
- **Goal**: `goal.md` — the completion criteria this digest's findings feed, especially A8 and G3/G5/G7
- **Acceptance criteria**: `acceptance-criteria.md` — G1-G15, the gestalt rows P3's evidence corroborates
- **Decision record**: `decision-record.md` — ADR-002 (week/day scale), P0-2 (Monday-start, Proposed)
- **Capture index**: `screenshots/notion/README.md` — provenance, query sets, per-file index
