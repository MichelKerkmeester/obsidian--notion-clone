---
title: "Notion Screens Digest: Dropdowns, Context Menus, Option/Relation Pickers, Icon/Colour Pickers, Date Pickers, Search-in-Menu, Submenus"
description: "101 Notion iOS/web screens read against 052's surface, with measured values, the recurring patterns they show, and where they diverge from or agree with our tree and with 050's Anytype true-up."
date: 2026-09-06
surface: "dropdowns, context menus, option and relation pickers, icon and colour pickers, date pickers, search-in-menu, submenus"
phase: "005-component-surface-system/052-dropdown-menu-and-picker-componentization"
---

# Notion Screens Digest: Dropdowns, Menus and Pickers

> Method note, carried from `design-trueup.md`: measure, then decide. Every value below was read off a
> file in `screenshots/notion/{ios,web}/` and is stated at capture-pixel scale — iOS files are
> **299×678/680**, web files **768×521/523** (`screenshots/notion/README.md` §"Verification"), both
> scaled-down thumbnails of the real device/browser render. A measurement like "44pt row" below is a
> visual estimate against the on-screen status bar and known iOS control heights, not a per-pixel
> sample the way `050`/`052`'s Anytype reads are — Notion's own capture set carries no equivalent
> per-pixel scan, so every geometry figure here is qualitative-with-an-estimate, not exact. Colours are
> read by eye and named descriptively rather than sampled to hex, for the same reason. Nothing here
> overrides a measured Anytype value; this document adds a second reference, it does not re-run `050`'s
> or `052`'s method on Notion.

---

## 1. Selection

**101 screens read**, iOS and web, chosen from `screenshots/notion/README.md`'s per-file index by
starting at the hinted folders and widening by grepping the index for query words matching the
surface (`color picker`, `date picker`, `icon picker`, `context menu`, `slash menu`, `relation
property`, `group by`, `page options menu`, `more menu`, `property editor`, plus the advanced-filter
and multi-select-option web flows). The full selection was built with a script against the index so
no path was hand-typed; it is reproducible from the query list in §2 below.

**From which folders**, by count read: `ios/menus/` 12 (all 12 files in the folder), `web/menus/` 8
(all 8), `ios/editors/` 10 (6 `slash-menu-*`, 4 `block-menu-*`), `web/editors/` 1, `ios/sheets/` 10
(1 `color-picker`, 4 `date-picker`, 5 `icon-picker`), `ios/database/` 18 (5 `filters`, 5 `sort`, 2
`group-by`, 2 `relation`, 4 `property-editor`), `web/database/` 10 (3 `filters`, 1 `group-by`, 2
`relation`, 4 `property-editor`), `ios/flows/` 25 across `setting-up-filter` (3), `sorting-a-database`
(3), `filtering-a-database` (1), `adding-a-new-sort` (2), `page-blocks-option` (5), `adding-an-icon-page`
(2), `changing-text-background-color` (3), `web/flows/` 15 across `adding-an-advanced-filter` (2),
`filtering-a-database-advanced` (2), `adding-options` (2), `creating-multi-select-options` (2),
`editing-an-option` (1), `deleting-a-choice` (1), `deleting-a-status-property` (1), `web/dialogs/` 2.

**What was skipped, and why.** Every screen id opened is listed in §2; a handful turned out
off-topic once opened — `screenshots/notion/README.md` §"Layout" warns groups are "the query, not a
verified reading," and that held here too. Filed-but-off-topic screens kept in the corpus for
provenance but excluded from pattern analysis: `web/menus/more-menu-01` (a Keyboard Shortcuts modal),
`web/menus/more-menu-04` (a ChatGPT connector settings panel), `web/menus/more-menu-05` (an Explore
Plans pricing table), `web/database/property-editor-01/05` (Notion-AI agent settings, unrelated to
menus/pickers), `web/flows/deleting-a-choice-01` (a form checkbox field, not an option picker),
`web/dialogs/command-palette-01` (the AI chat home screen, not a command palette — the same mismatch
the README's landing check already flagged for this exact query). Near-duplicates skipped after the
first instance: the "Insert Media" bottom sheet recurred three times inside the `slash-menu` query
(`ios/editors/slash-menu-01/06`, kept as one data point); several `ios/flows/*` screens were the
unopened background page behind a later screen in the same flow and added no new geometry (noted in
§3 rather than given their own row where they contributed nothing beyond confirming a flow step).
**Theme coverage is weak**: 100 of the 101 screens read are light theme; only one
(`ios/menus/notion-ios-menus-menu-15`, a Settings screen) is dark. This is a property of Mobbin's
catalogue, not of the selection — no dark-theme equivalent of most captured menus exists in the
harvest. Any claim below about a colour value is a light-theme claim unless stated otherwise (§6).

---

## 2. Per-screen table

One row per screen read, in read order. "Id" is the first 8 hex characters of the Mobbin screen id
(full id in the URL); paths are relative to `screenshots/notion/`. Measured values are estimates at
capture-thumbnail scale (§ method note above), not per-pixel reads.

| Id | Platform | Theme | Path | Mobbin | Content | Measured / observed |
|---|---|---|---|---|---|---|
| `3601882d` | ios | light | `ios/menus/notion-ios-menus-context-menu-13-...` | [screen](https://mobbin.com/screens/3601882d-0003-4794-bd98-d9eb9ccf2234) | "Insert Media" bottom sheet from a comment | 1 card, 4 rows, leading icon + label, ~44pt row |
| `0d1a034d` | ios | light | `ios/menus/notion-ios-menus-menu-10-...` | [screen](https://mobbin.com/screens/0d1a034d-fbe8-4bbd-aecd-4fab8a778c2f) | Row-level "..." popover: Rename / Delete | 2-row card popover, destructive last, red text + no visible icon override |
| `6ecea6c7` | ios | light | `ios/menus/notion-ios-menus-menu-13-...` | [screen](https://mobbin.com/screens/6ecea6c7-4682-4c35-b649-412a0a240738) | Block "Actions" sheet, Table block | Sectioned into separate rounded **cards** (not just dividers): Table-props card, actions card (Delete red, last), Comment/Ask AI card, metadata footer |
| `ac33be32` | ios | light | `ios/menus/notion-ios-menus-menu-14-...` | [screen](https://mobbin.com/screens/ac33be32-036a-4a22-bfd0-9c09d306c617) | "Theme" single-select sheet | Flat list, trailing checkmark on "Use system setting" |
| `213bded5` | ios | **dark** | `ios/menus/notion-ios-menus-menu-15-...` | [screen](https://mobbin.com/screens/213bded5-a06d-4282-ade7-4407f7ec911b) | Settings, Preferences section | Trailing-value rows w/ chevron ("Theme  Dark ›"), dark bg near-black, only dark screen in the sample |
| `5d02e087` | ios | light | `ios/menus/notion-ios-menus-more-menu-04-...` | [screen](https://mobbin.com/screens/5d02e087-c6c6-499e-813d-dd867ce04e92) | "General access" single-select sheet | Flat list, trailing checkmark, no dividers between rows |
| `66657546` | ios | light | `ios/menus/notion-ios-menus-more-menu-07-...` | [screen](https://mobbin.com/screens/66657546-8477-4df4-8e88-20879199b7e3) | "Manage Passkeys" modal w/ row popover | Small 2-row popover (Rename/Delete) anchored off a "..." button, overlapping the sheet below it |
| `5f81b365` | ios | light | `ios/menus/notion-ios-menus-more-menu-09-...` | [screen](https://mobbin.com/screens/5f81b365-9ff7-4d05-9ba5-512534bac006) | "Change access" single-select sheet | Flat list, trailing check, "Link expires" trailing-value+chevron row, "Remove" red **no icon**, last |
| `93da6545` | ios | light | `ios/menus/notion-ios-menus-more-menu-13-...` | [screen](https://mobbin.com/screens/93da6545-7cd8-449c-9bfc-c36f9658786f) | Discussion thread + a toast ("Muted replies") | Off-topic to menus; toast is a transient confirmation, not a menu |
| `56d9b984` | ios | light | `ios/menus/notion-ios-menus-more-menu-15-...` | [screen](https://mobbin.com/screens/56d9b984-7f99-4ae1-acae-833ee1c31eb2) | "2 views" sheet | Per-row "..." (kebab), "+ New view" w/ 2-line subtitle, "+ New data source" separate row |
| `ca092fc7` | ios | light | `ios/menus/notion-ios-menus-page-options-03-...` | [screen](https://mobbin.com/screens/ca092fc7-be5c-41fc-8530-621e1186f06b) | "Share settings" (Share/Publish tab pair) | Segmented-control tab pair at top, trailing-value + chevron rows below |
| `17ab32de` | ios | light | `ios/menus/notion-ios-menus-page-options-13-...` | [screen](https://mobbin.com/screens/17ab32de-dfee-404e-865b-3d12b866bccd) | "Change access" (guest, existing access shown) | Two sections: "Current access" (read-only) then "User access" (flat single-select), "Remove" red last |
| `78e7f802` | web | light | `web/menus/notion-web-menus-menu-01-...` | [screen](https://mobbin.com/screens/78e7f802-2ece-4893-8542-90fe84170ce8) | Full page "..." context menu, AI submenu open | 3-tile font row (Ag Default/Serif/Mono) at top; ~9 sections by divider; hovered row opens a 3-item submenu flush to its left (menu sits at the viewport's right edge) |
| `49ebf525` | web | light | `web/menus/notion-web-menus-more-menu-01-...` | [screen](https://mobbin.com/screens/49ebf525-3275-423a-9dda-725fdb0c1d68) | Keyboard Shortcuts modal | Off-topic: a searchable reference modal with icon tabs, not a menu |
| `7adbbfc8` | web | light | `web/menus/notion-web-menus-more-menu-02-...` | [screen](https://mobbin.com/screens/7adbbfc8-75aa-484d-b736-f91969faa01c) | Channel select picker (automation) | Search field top, flat list, trailing checkmark, Delete/Save footer buttons |
| `8aff7e5c` | web | light | `web/menus/notion-web-menus-more-menu-03-...` | [screen](https://mobbin.com/screens/8aff7e5c-7473-4965-807f-92cb8d55eba2) | "Export" dialog | Inline dropdown-chevron selects inside a form modal, not a menu |
| `6a542fc1` | web | light | `web/menus/notion-web-menus-more-menu-04-...` | [screen](https://mobbin.com/screens/6a542fc1-91ac-44d1-ba25-23cfda9d0a8d) | ChatGPT connector settings | Off-topic |
| `09777bcb` | web | light | `web/menus/notion-web-menus-more-menu-05-...` | [screen](https://mobbin.com/screens/09777bcb-7748-472e-9801-2b411d4bca6f) | "Explore plans" pricing table | Off-topic |
| `878083d9` | web | light | `web/menus/notion-web-menus-more-menu-06-...` | [screen](https://mobbin.com/screens/878083d9-f5bf-4a48-80c4-5fb59814524d) | Settings, localized (Japanese) | Same trailing-value+chevron row grammar as `213bded5`, cross-locale confirmation |
| `5e7e723d` | web | light | `web/menus/notion-web-menus-page-options-01-...` | [screen](https://mobbin.com/screens/5e7e723d-8a09-4a0b-ac77-58cd66bce4e5) | Small "..." popover: Backlinks/Discussions/TOC/Comments | 4 rows, no dividers, trailing slot is a mix of chevron-select and toggle in the same list |
| `6d541d61` | ios | light | `ios/editors/notion-ios-editors-slash-menu-01-...` | [screen](https://mobbin.com/screens/6d541d61-ef40-4190-a91a-815925e83657) | "Insert Media" sheet (again) | Duplicate of `3601882d`'s shape |
| `cf573f99` | ios | light | `ios/editors/notion-ios-editors-slash-menu-02-...` | [screen](https://mobbin.com/screens/cf573f99-fcd7-4e70-886b-8f13dd56f660) | "Model" single-select list | Leading icon + label + "Beta" pill tag + trailing **plain** checkmark (not the blue filled circle) |
| `7a8eec44` | ios | light | `ios/editors/notion-ios-editors-slash-menu-04-...` | [screen](https://mobbin.com/screens/7a8eec44-aeb1-40f6-9e01-8d349d6fb9f5) | "Summary instructions" management list | Rows carry both a pencil (edit) and a "..." (more) trailing icon; "+ Add custom instructions" is the last row |
| `f380f296` | ios | light | `ios/editors/notion-ios-editors-slash-menu-06-...` | [screen](https://mobbin.com/screens/f380f296-9d59-48a0-89f5-d78fe16d37fd) | "Insert Media" sheet (third instance) | Duplicate |
| `04b18cc3` | ios | light | `ios/editors/notion-ios-editors-slash-menu-07-...` | [screen](https://mobbin.com/screens/04b18cc3-6d66-4cfc-84b3-4fe61448d3a1) | Row-level submenu on "Summary instructions" | "Set as default" / "Remove from my menu" (red, last), popover anchored right of the row's "..." |
| `12c8b938` | ios | light | `ios/editors/notion-ios-editors-slash-menu-10-...` | [screen](https://mobbin.com/screens/12c8b938-aafe-4bbb-8b91-997347a6976b) | "Automations" list + row action sheet | Active (toggle) / Edit / Duplicate / Delete (red, last), flat, no dividers |
| `ffbb0bcf` | ios | light | `ios/editors/notion-ios-editors-block-menu-02-...` | [screen](https://mobbin.com/screens/ffbb0bcf-8417-4242-a446-dd95101be27f) | Block "Actions" sheet, Image block | Same card-sectioning as `6ecea6c7`: image-props card, actions card, comment/AI card, metadata footer |
| `9acbba50` | ios | light | `ios/editors/notion-ios-editors-block-menu-07-...` | [screen](https://mobbin.com/screens/9acbba50-e88a-4e2c-b3ae-a8de35da6a92) | "Data source actions" sheet | Modal header w/ "Done", 3 card groups, no destructive row on this menu |
| `7950fc99` | ios | light | `ios/editors/notion-ios-editors-block-menu-10-...` | [screen](https://mobbin.com/screens/7950fc99-d6a3-4c91-a9c9-d00e339483c1) | Page "Actions" sheet | 3-tile font row at top (identical to web's), then card groups, "Move to Trash" red last in its card |
| `7e1fda1e` | web | light | `ios/editors/notion-ios-editors-block-menu-14-...`* | [screen](https://mobbin.com/screens/7e1fda1e-b5df-4801-9a04-676cbead7612) | Meeting-notes block "..." menu | Trailing chevron for submenu rows, trailing value for state rows ("English (US)"), trailing shortcut text for "Delete" ("Del") |
| `959f1824` | web | light | `web/editors/notion-web-editors-block-menu-01-...` | [screen](https://mobbin.com/screens/959f1824-ebfd-4660-a603-1980f3af990a) | "Conditional color" rule editor | Back-chevron+title header; Title/Is not empty/Green background/Apply to rows each w/ trailing chevron; "Delete color setting" plain (not red), last; "+ Add another" outside the card |
| `e5accf4d` | ios | light | `ios/sheets/notion-ios-sheets-color-picker-04-...` | [screen](https://mobbin.com/screens/e5accf4d-d2be-4c81-bb01-de4424af9da2) | "Select color" (text background) | **1-column labelled list**: swatch + label per row, trailing check on selected, no dividers |
| `cb9d8cab` | ios | light | `ios/sheets/notion-ios-sheets-date-picker-03-...` | [screen](https://mobbin.com/screens/cb9d8cab-f85b-438f-bb06-4d1d07b90322) | Date+time editor, inline calendar | Calendar month grid inline (not a popover), then a card of trailing-value+chevron rows (Date format/Time format/Timezone) and one toggle (Include time) |
| `fd9402ee` | ios | light | `ios/sheets/notion-ios-sheets-date-picker-04-...` | [screen](https://mobbin.com/screens/fd9402ee-7d2b-4998-aab8-40ae08c6fc10) | Same calendar + "Remind" list | Flat single-select list below the calendar, trailing check on "None" |
| `cfca14fb` | ios | light | `ios/sheets/notion-ios-sheets-date-picker-09-...` | [screen](https://mobbin.com/screens/cfca14fb-a833-4bf6-b549-9e646bac5ec9) | "Link expires" relative-date list | Never / In an hour / In a day / In a week (each w/ a literal date/time subline) / Choose date (chevron, escalates to full picker) |
| `ca4fd83f` | ios | light | `ios/sheets/notion-ios-sheets-date-picker-12-...` | [screen](https://mobbin.com/screens/ca4fd83f-fca7-4e85-9232-3b747854779b) | "Change access", date chosen | Chosen date shown as trailing value+chevron; "Remove" red, **no icon**, last |
| `0c4e7197` | ios | light | `ios/sheets/notion-ios-sheets-icon-picker-01-...` | [screen](https://mobbin.com/screens/0c4e7197-170b-44d6-adea-534219b9dd35) | "Page icon" — Icons tab | 3 tabs (Emoji/Icons/Upload), search + shuffle + last-colour swatch button, "Recent" then "Icons" caption, dense glyph grid (~12 cols) |
| `754eb37a` | ios | light | `ios/sheets/notion-ios-sheets-icon-picker-02-...` | [screen](https://mobbin.com/screens/754eb37a-90aa-492c-96b5-84471070b61f) | "Page icon" — Emoji tab | "Recent"/"People" captions, 8-col emoji grid, bottom persistent category tab bar |
| `28548045` | ios | light | `ios/sheets/notion-ios-sheets-icon-picker-05-...` | [screen](https://mobbin.com/screens/28548045-a9e1-478a-9548-112ac74bbb01) | "Reaction" emoji grid | Same grammar as `754eb37a`, different host ("Reaction" title, "Close" not "Done") |
| `4df35a24` | ios | light | `ios/sheets/notion-ios-sheets-icon-picker-06-...` | [screen](https://mobbin.com/screens/4df35a24-1e3a-423c-b9b8-4ea5c3bd9162) | "Reaction" emoji grid (near-dup) | Same as above |
| `79c6ccc5` | ios | light | `ios/sheets/notion-ios-sheets-icon-picker-07-...` | [screen](https://mobbin.com/screens/79c6ccc5-babf-450d-a868-b38f2e07fecc) | "Reaction" + skin-tone popover | Long-press opens a small horizontal swatch row (6 tones) flush above the held emoji |
| `1d5d6adc` | ios | light | `ios/database/notion-ios-database-filters-01-...` | [screen](https://mobbin.com/screens/1d5d6adc-4e6f-41d9-9831-245a420d790b) | "1 filter" sheet | Sort (chevron) / Advanced filter (blue, "1 rule", chevron) / search field / flat property list — search is **not** the first element here |
| `4c195b27` | ios | light | `ios/database/notion-ios-database-filters-05-...` | [screen](https://mobbin.com/screens/4c195b27-50ed-4a63-9658-f5fc5c979598) | "Filters" sheet (search results) | Sort (chevron) / Title only (toggle) / Created by (chevron), no search field on this variant |
| `7174b226` | ios | light | `ios/database/notion-ios-database-filters-09-...` | [screen](https://mobbin.com/screens/7174b226-1497-4754-bf60-43ecba835669) | "Created by" people picker | Header carries "Clear" (not a last row); search field second; **blue filled circular check** on the selected person |
| `e20dff9f` | ios | light | `ios/database/notion-ios-database-filters-13-...` | [screen](https://mobbin.com/screens/e20dff9f-f089-4d08-8f54-d32decbca5e9) | "Sort by" popover (search results) | Manual / Last edited (checked ✓), small popover anchored under its trigger |
| `aeb6d373` | ios | light | `ios/database/notion-ios-database-filters-15-...` | [screen](https://mobbin.com/screens/aeb6d373-0c84-4b69-a591-029ea8938b83) | "Sort" search-results list | **Radio buttons** (hollow/filled-blue), not checkmarks — a third selection grammar |
| `84653307` | ios | light | `ios/database/notion-ios-database-sort-01-...` | [screen](https://mobbin.com/screens/84653307-d85f-4766-991d-f060f6cfe1ac) | Block "Actions" sheet, Table (dup of `6ecea6c7`) | Same card-sectioning |
| `988277d3` | ios | light | `ios/database/notion-ios-database-sort-03-...` | [screen](https://mobbin.com/screens/988277d3-0dc6-4e66-86f5-45c796178ff8) | "Sort" detail editor | Title (chevron) / Descending (chevron) / Delete (red, own card) / Add sort+Delete sort (disabled, greyed, own card) |
| `e9698e1b` | ios | light | `ios/database/notion-ios-database-sort-06-...` | [screen](https://mobbin.com/screens/e9698e1b-5bfb-4588-b07f-343900daf469) | "Group" panel + group list | Group by/Text by/Sort chevrons, Hide-empty toggle; group rows have a drag handle + per-row eye-toggle + "Hide all" header link; "Remove grouping" plain (not red) |
| `50d73158` | ios | light | `ios/database/notion-ios-database-sort-09-...` | [screen](https://mobbin.com/screens/50d73158-3d35-474f-9848-3bea591a19a1) | Full "Settings" view panel | Layout/Property visibility(badge "1")/Filter/Sort/Group/Conditional color/Copy link, then "Data source settings" caption + Source/Edit properties/Automations/AI Autofill/More settings |
| `52348672` | ios | light | `ios/database/notion-ios-database-sort-13-...` | [screen](https://mobbin.com/screens/52348672-5d4a-4133-8ffb-f1845d73f826) | Same panel, named view | Property visibility badge shows "3" for this view — the badge count is a live per-view number |
| `3cb253aa` | ios | light | `ios/database/notion-ios-database-group-by-03-...` | [screen](https://mobbin.com/screens/3cb253aa-3a56-462b-9cee-76decd1366a6) | Grouped board, no menu open | Background reference only (day-of-week group headers) |
| `c3125904` | ios | light | `ios/database/notion-ios-database-group-by-13-...` | [screen](https://mobbin.com/screens/c3125904-93f8-4a92-b022-a7f85d4ef4d9) | "Group" empty state | Just "Group by" (chevron, unset) + "Learn about grouping" — no never-empty fallback text needed since it's a config row, not a list |
| `b4fd8ac7` | ios | light | `ios/database/notion-ios-database-relation-02-...` | [screen](https://mobbin.com/screens/b4fd8ac7-ef9d-4cb4-81ae-c76c94a86764) | "Link to existing data source" | Search field top, two captioned sections ("Suggested", "Existing data sources"), icon+title+subtitle rows |
| `beb4a541` | ios | light | `ios/database/notion-ios-database-relation-07-...` | [screen](https://mobbin.com/screens/beb4a541-29ca-4203-a89e-a0f5d504e113) | "New data source" chooser | 3 flat action rows, leading icon each, no dividers |
| `658fd83b` | ios | light | `ios/database/notion-ios-database-property-editor-02-...` | [screen](https://mobbin.com/screens/658fd83b-c23b-4573-aac8-a18e06e185a1) | Template-default confirm dialog | Behind it: a template row's own menu (Duplicate every.../Set as default/Edit/Duplicate/Delete red last) |
| `2f0d2563` | ios | light | `ios/database/notion-ios-database-property-editor-07-...` | [screen](https://mobbin.com/screens/2f0d2563-d5e6-4f01-adda-18b8d09b74c4) | "View options" sheet | Rename/Display as/Edit view/Source cards, Copy link/Open as full page/Hide titles card, Duplicate view/Delete view (red, last) card |
| `8d28fcb9` | ios | light | `ios/database/notion-ios-database-property-editor-11-...` | [screen](https://mobbin.com/screens/8d28fcb9-c6a8-4028-8012-e0b0a91aa8c9) | "Create automation" trigger picker | Search field first ("Search triggers..."), flat action rows then property rows w/ chevron — mixed list |
| `fd5e59c9` | ios | light | `ios/database/notion-ios-database-property-editor-14-...` | [screen](https://mobbin.com/screens/fd5e59c9-124c-4ee9-b282-cd43cafc5c3c) | "Sources" toggle list | 2 rows, each a leading icon + label + trailing toggle, no chevrons |
| `56aa9350` | web | light | `web/database/notion-web-database-filters-01-...` | [screen](https://mobbin.com/screens/56aa9350-dfa8-4b57-a296-5ad2aa18137c) | Plain table view, no menu open | Off-topic to this surface |
| `8cbe99a8` | web | light | `web/database/notion-web-database-filters-02-...` | [screen](https://mobbin.com/screens/8cbe99a8-57a4-40e6-85c8-5f55712b6cf3) | Right-click block-insert list | Flat list, leading icon, trailing chevron on rows with variants (Toggle list, Quote), "Close menu — esc" footer hint |
| `53858386` | web | light | `web/database/notion-web-database-filters-03-...` | [screen](https://mobbin.com/screens/53858386-6aba-40c7-a0f6-bc3b5aed0e49) | Code-block language dropdown | Search field first ("Search for a language..."), long alphabetical list, trailing checkmark on current value, anchored under a "JavaScript ⌄" trigger chevron |
| `935b4300` | web | light | `web/database/notion-web-database-group-by-01-...` | [screen](https://mobbin.com/screens/935b4300-77d3-47f8-aa2e-5277e745d7ec) | Chart+table grouped by Status | Off-topic, no menu open |
| `932bb81c` | web | light | `web/database/notion-web-database-relation-01-...` | [screen](https://mobbin.com/screens/932bb81c-6d25-4521-80bf-ae17aba01f0f) | Automation "Select page, form, URL" picker | Search field first, "Pages" caption, icon+title rows |
| `b95c9bf0` | web | light | `web/database/notion-web-database-relation-02-...` | [screen](https://mobbin.com/screens/b95c9bf0-6d2c-489f-814b-c35d192310eb) | Same picker, URL typed | List narrows to one match; input carries an inline "X" clear button |
| `c08e8ce9` | web | light | `web/database/notion-web-database-property-editor-01-...` | [screen](https://mobbin.com/screens/c08e8ce9-74ff-41c3-ab52-a750a3ad1f1d) | AI-agent "Run on..." dropdown | Flat option list w/ trailing credit-cost badges, tangential to this surface |
| `deb747e2` | web | light | `web/database/notion-web-database-property-editor-05-...` | [screen](https://mobbin.com/screens/deb747e2-2093-4228-b366-4957da0b3ca2) | Notion AI settings, tabbed page | Off-topic |
| `445696a8` | web | light | `web/database/notion-web-database-property-editor-08-...` | [screen](https://mobbin.com/screens/445696a8-052f-401a-8106-81eefa1bd411) | "Team page automation" modal | Dropdown-chevron selects inline in a form ("Specific people ⌄") |
| `2e44a0e9` | web | light | `web/database/notion-web-database-property-editor-13-...` | [screen](https://mobbin.com/screens/2e44a0e9-376b-4cff-9190-e05a2e94de92) | Same modal, people dropdown open | "Select up to 20 people..." placeholder in the trigger itself |
| `86a8e66c` | ios | light | `ios/flows/setting-up-filter/...-02-...` | [screen](https://mobbin.com/screens/86a8e66c-2ca9-4f11-90b3-17dd3e7367d9) | "Add filter" sheet | Search first ("Filter by..."), flat property list, **"+ Add advanced filter" separated and last** |
| `beabc96b` | ios | light | `ios/flows/setting-up-filter/...-03-...` | [screen](https://mobbin.com/screens/beabc96b-a48b-470f-9553-3728e73b5f1b) | "Filters" panel, chip trigger | "1 rule ⌄" pill w/ orange active-dot, "Add filter", then "Save for everyone" (orange) / "Reset filters" / "More options" |
| `39e7ad85` | ios | light | `ios/flows/setting-up-filter/...-05-...` | [screen](https://mobbin.com/screens/39e7ad85-f85e-41de-8bc9-5df639c18e61) | Live table w/ active filter+sort chips | Toolbar shows "Search / Activity ⌄ / 1 rule ⌄" inline — matches the "N applied" chip-row pattern |
| `74da3d7a` | ios | light | `ios/flows/sorting-a-database/...-01-...` | [screen](https://mobbin.com/screens/74da3d7a-b6b7-4ab8-ba38-9a17f04de3da) | Plain table, no menu | Background reference only |
| `568053e6` | ios | light | `ios/flows/sorting-a-database/...-04-...` | [screen](https://mobbin.com/screens/568053e6-fad3-46df-b2cb-6b8cb54b571a) | Plain table, "New ⌄" button visible | Background reference only |
| `35c64a84` | ios | light | `ios/flows/sorting-a-database/...-08-...` | [screen](https://mobbin.com/screens/35c64a84-58d0-43ca-a023-3258e5d91090) | "Sort" panel, footer actions | Ascending/Delete card, then Save for everyone/Reset sorts/More options card — mirrors the filter panel's own footer exactly |
| `c5fc5db2` | ios | light | `ios/flows/filtering-a-database/...-08-...` | [screen](https://mobbin.com/screens/c5fc5db2-33f2-4e5e-9bfa-dd284ad9408d) | Plain table, no menu | Background reference only |
| `995ca0e3` | ios | light | `ios/flows/adding-a-new-sort/...-03-...` | [screen](https://mobbin.com/screens/995ca0e3-a4e7-448b-be55-5c66f8a7c79e) | "Sort" detail (near-dup of `988277d3`) | Same shape, Ascending instead of Descending |
| `5f9429be` | ios | light | `ios/flows/adding-a-new-sort/...-05-...` | [screen](https://mobbin.com/screens/5f9429be-5206-43f8-9f42-c1a94cf456b2) | "Sort" panel footer (near-dup of `35c64a84`) | Same footer-actions card |
| `c7b22d6c` | ios | light | `ios/flows/page-blocks-option/...-01-...` | [screen](https://mobbin.com/screens/c7b22d6c-cc0c-4a23-8e55-e38afea1d86f) | Block-insert picker, "Basic blocks" | **2-column icon+label tile grid**, captioned by group, not a row list |
| `b31fea0a` | ios | light | `ios/flows/page-blocks-option/...-02-...` | [screen](https://mobbin.com/screens/b31fea0a-dcbc-4f20-8d95-138ac06b91d3) | Same picker, scrolled | "Basic blocks" continues (Video/Audio/Code/File), then "Database" caption (Table/Board/Gallery/List view tiles) |
| `fa5907df` | ios | light | `ios/flows/page-blocks-option/...-04-...` | [screen](https://mobbin.com/screens/fa5907df-b5d8-4dff-9454-33f6947894b6) | Plain page, toolbar visible | Background reference only |
| `9d1a6166` | ios | light | `ios/flows/page-blocks-option/...-06-...` | [screen](https://mobbin.com/screens/9d1a6166-a67a-464f-9f37-b00e50614a19) | Block-insert picker, "Advanced blocks" | Same 2-col tile grid (TOC/Equation/Button/Breadcrumb/Synced block/Toggle h1-3/Code) |
| `844ea449` | ios | light | `ios/flows/page-blocks-option/...-07-...` | [screen](https://mobbin.com/screens/844ea449-7afe-4cd7-a5ee-b6f9e231ba1b) | Block-insert picker, "Synced Databases" | Same tile grid, brand-icon tiles (Zendesk, GitLab, Jira, Asana, GitHub, Jira Sync) |
| `ee317f0a` | ios | light | `ios/flows/adding-an-icon-page/...-01-...` | [screen](https://mobbin.com/screens/ee317f0a-d52d-4dee-98db-60918c55de7b) | Plain page, no icon yet | Background reference only |
| `0bfd74c0` | ios | light | `ios/flows/adding-an-icon-page/...-03-...` | [screen](https://mobbin.com/screens/0bfd74c0-52b5-4b13-97ef-1d9fa03f9a85) | Page with emoji icon applied | Result state, no menu open |
| `0f96c4df` | ios | light | `ios/flows/changing-text-background-color/...-01-...` | [screen](https://mobbin.com/screens/0f96c4df-8895-4620-b4e8-726f350589bb) | Text selected, floating toolbar | Toolbar: chevron / Aa (active) / comment / emoji / B / I / U / highlighter, no popover open yet |
| `011e1303` | ios | light | `ios/flows/changing-text-background-color/...-02-...` | [screen](https://mobbin.com/screens/011e1303-32b9-4882-8d28-71b5b233c517) | "Background color" popover from toolbar | **2-column grid of labelled swatches** — the same 10 colours as `e5accf4d`'s 1-column list, but gridded here to save vertical space |
| `692eaaa1` | ios | light | `ios/flows/changing-text-background-color/...-03-...` | [screen](https://mobbin.com/screens/692eaaa1-1245-4109-a68b-6605daee286c) | Highlight applied, no menu | Result state |
| `8ff7ae4b` | web | light | `web/flows/adding-an-advanced-filter/...-01-...` | [screen](https://mobbin.com/screens/8ff7ae4b-40f0-4d9b-bb30-611469098554) | "Filter by..." dropdown, 3 properties | Search field **is** the trigger's open state (auto-focused), list below, "+ Add advanced filter" separated last — search shown despite only 3 options |
| `299e69bb` | web | light | `web/flows/adding-an-advanced-filter/...-05-...` | [screen](https://mobbin.com/screens/299e69bb-545e-4ecc-9948-d61527ab26da) | Full advanced-filter builder | "Where [prop ⌄][is not empty ⌄]" / "And ⌄" connector row / second "Where [prop ⌄][operator ⌄][value chip]" / "+ Add filter rule" / "Delete filter" (plain, last) — property+operator+value stay on **one row** |
| `433ade8f` | web | light | `web/flows/filtering-a-database-advanced/...-02-...` | [screen](https://mobbin.com/screens/433ade8f-0d6c-48e0-9f5c-c06041622933) | Single-condition filter row | "Where [Name ⌄][Contains ⌄][value___]", "+ Add filter rule", "Delete filter" |
| `b801453a` | web | light | `web/flows/filtering-a-database-advanced/...-04-...` | [screen](https://mobbin.com/screens/b801453a-b5a3-4a54-913d-c5381b7113c5) | "+Add filter rule" expanded | 2-item mini-menu: "Add filter rule" / "Add filter group" (**with a one-line description under the label**) |
| `f19c6f50` | web | light | `web/flows/adding-options/...-02-...` | [screen](https://mobbin.com/screens/f19c6f50-e006-40f1-aaf6-0eaeb6dcc315) | Column "..." menu, submenu open | Depth-2 cascade: "Edit property ›" hovered opens a child showing "Sort: Manual ›" (itself carrying a further chevron — a depth-3 path) and an "Options" section |
| `841ae11d` | web | light | `web/flows/adding-options/...-04-...` | [screen](https://mobbin.com/screens/841ae11d-d9e0-43ce-9d45-0405415af97f) | Same submenu, create-option active | "Type a new option..." input live inside the Options section — the create affordance **is** the inline field, no separate search row |
| `441621d0` | web | light | `web/flows/creating-multi-select-options/...-03-...` | [screen](https://mobbin.com/screens/441621d0-afd3-4167-be6f-27fe92da97f8) | Tags column "..." menu, flat | No visible submenu here: Edit property/AI autofill/Sort asc/desc/Filter/Hide/Freeze/Duplicate/**Delete property (plain, not red)**/Wrap toggle |
| `1d99acb0` | web | light | `web/flows/creating-multi-select-options/...-05-...` | [screen](https://mobbin.com/screens/1d99acb0-c3ff-4fcd-ad49-7f8f98307013) | "Edit property" as a **right-docked side panel** | Same rows as `441621d0` but hosted in a persistent panel pinned to the viewport edge, not a floating popover |
| `efb2b347` | web | light | `web/flows/editing-an-option/...-02-...` | [screen](https://mobbin.com/screens/efb2b347-39b5-4457-83a4-7fb381055038) | Select-option edit popover | Rename field, "Delete" (plain, no red), "Colors" caption, **1-column labelled list** (swatch+name), trailing check on current colour |
| `5c449015` | web | light | `web/flows/deleting-a-choice/...-01-...` | [screen](https://mobbin.com/screens/5c449015-35bc-406a-8e3e-8b09a471d18b) | Form checkbox field | Off-topic |
| `622d2611` | web | light | `web/flows/deleting-a-status-property/...-01-...` | [screen](https://mobbin.com/screens/622d2611-99d2-4604-a37a-d788d6d17fac) | Status column submenu, options | **Captioned bucket groups** ("To-do"/"In progress"/"Complete"), each ending in its **own** "+" add-row, plus a "Display as [Select ⌄]" header row |
| `ba93ce22` | web | light | `web/dialogs/notion-web-dialogs-dialog-02-...` | [screen](https://mobbin.com/screens/ba93ce22-6dd3-4eda-ace5-0b78d593f8e0) | "Cancel trial" confirm dialog | Destructive confirm, out of this surface's scope (goal.md D8: confirms are `051`'s) |
| `e0bcd679` | web | light | `web/dialogs/notion-web-dialogs-command-palette-01-...` | [screen](https://mobbin.com/screens/e0bcd679-56a2-44ac-8a4b-e97188edae28) | AI chat home | Off-topic, mismatched query per the README's own landing-check note |

---

## 3. Patterns

Ordered by how much of the surface they define — the ones every menu/picker shows first, the
narrower ones after.

### N1 — Row anatomy: leading icon (optional), trailing slot is polymorphic

Every list row in the corpus — action menu, settings list, filter/sort detail, picker option — shares
one shape: an optional leading icon, a label, and a **trailing slot** that is one of five things
depending on the row's job: a chevron (opens a child/panel), a value + chevron ("Dark ›", "3 ›"), a
toggle switch, a checkmark, or nothing (plain action). No row carries two of these at once. Seen on
nearly every screen in §2; most explicit on `52348672` (badge+chevron), `5e7e723d` (chevron and
toggle in the same list), `fd5e59c9` (toggle only).

### N2 — Three, not one, selection-indicator grammars

Contrary to a single "the check wins" assumption, the corpus shows **three** distinct indicators for
"this is the current value," used in different contexts and never mixed within one list:

1. **Trailing checkmark** (black/primary-colour ✓) — single-select lists of static options:
   `ac33be32` (Theme), `5d02e087` (General access), `cf573f99` (Model), `53858386` (code language),
   `e5accf4d` / `efb2b347` (colour).
2. **Trailing blue filled circle** — value pickers where the option is a person/entity, not a static
   label: `7174b226` (Created-by person picker).
3. **Radio buttons** (hollow ○ / filled ● blue) — a search-results sort-order list only:
   `aeb6d373`.

All three are **trailing**, none are leading. This cross-validates `design-trueup.md` G14's "the tick
is trailing" ruling from a second, independent product, but adds a nuance G14 does not carry: Notion
itself does not use one indicator uniformly — it picks by list type. See §4.

### N3 — Search-first pickers show the field regardless of option count, and escalation sits last

Every search-first picker in the corpus puts a search/filter field at or near the top and, when there
is a "do more" affordance beyond the plain list, puts it **last**, separated by a gap: `86a8e66c`
("+ Add advanced filter"), `299e69bb` / `b801453a` ("+ Add filter rule" / "Add filter group"),
`2f0d2563` is the exception that proves the point (`Delete view` is genuinely destructive-last, not
escalation-last). Critically, `8ff7ae4b` shows the search field present on a **3-option** list —
Notion does not gate search behind an option-count threshold the way `dropdown-field.ts:193` does
(`options.length > 8`). This is the strongest single piece of supporting evidence in this digest for
the operator's 2026-09-06 combobox amendment in `goal.md` §4.

### N4 — Colour is never a bare swatch grid; it is always labelled, in one of two layouts

Both colour pickers read (`e5accf4d`, `efb2b347`) are 1-column lists: a small swatch, then the colour's
name as text, then a trailing check. The **one** grid layout found (`011e1303`, the inline
text-toolbar popover) still carries the name as a label on every tile — it is a labelled grid, not a
swatch-only grid. The layout choice (list vs. grid) tracks the host's available height, not the
colour concept: a full-screen sheet gets a list, a floating toolbar popover gets a denser 2-column
grid to fit above the keyboard. Confirms `design-trueup.md` G15's "labelled list" finding on a second
product, and extends it: even where Notion grids, it never drops the label.

### N5 — Sectioning is cards on iOS, dividers-with-optional-captions on desktop

The iOS "Actions" sheet family (`6ecea6c7`, `ffbb0bcf`, `7950fc99`, `9acbba50`, `2f0d2563`) groups
rows into visually separate **rounded cards** with gaps between them, not a single card with internal
dividers. The desktop context menu (`78e7f802`) uses one card with divider rules, some with a text
caption above the first row of a section (matches `design-trueup.md` G1's captioned-section finding).
This is a platform split the Anytype captures did not carry (Anytype's captures are desktop-only for
this pattern) — new evidence, not a contradiction.

### N6 — Destructive styling is inconsistent, and the inconsistency is legible

Red text appears on rows that destroy user content: `Delete` (page/view/block/automation/filter's
saved rule), always last in its group. But plain, uncoloured text appears on rows that remove
*structure without destroying content*: `Remove grouping` (`e9698e1b`), `Delete color setting`
(`959f1824`), `Delete property` (`441621d0`), `Delete filter` (`299e69bb`), and `Remove` on an access
sheet when no icon accompanies it (`5f81b365`, `ca4fd83f` — red text, but **no icon**, unlike every
red+icon "Delete" row). The pattern is legible once named: **destroys content → red + icon; removes
structure or reverts a setting → plain text, last position only**. `design-trueup.md` G6 adopted "a
destructive row's colour is always paired with a matching icon" wholesale from Anytype's iOS; Notion's
own iOS supplies a counter-example to that pairing (§4, §5).

### N7 — Cascading submenus reach depth 3 on desktop, and flip side by available room

`f19c6f50` shows a genuine depth-3 path: column "..." → "Edit property ›" (hover) → "Sort: Manual ›"
(a further chevron inside the depth-2 child). `78e7f802`'s "Use with AI" submenu opens to the
**left** because the parent menu is already at the viewport's right edge — the same flip-by-available-
room behaviour `design-trueup.md` G8 measured procedurally on Anytype. Unlike Anytype's captures,
nothing in this corpus proves *how* the submenu opens (hover vs. click) — these are static screens,
not a crawl with a recorded procedure (§6).

### N8 — The block/type-insert chooser is a captioned 2-column tile grid, not a row list

`c7b22d6c`, `b31fea0a`, `9d1a6166`, `844ea449` all show the same shape for "insert a block/database/
integration": icon-top, label-below tiles, two per row, grouped under a plain-text caption ("Basic
blocks", "Advanced blocks", "Database", "Synced Databases"). This is a genuinely different grammar
from every other menu in the corpus — none of which use tiles — and neither Anytype's captures (M14
half-seen, no block-insert tile grid recorded) nor our own tree has a row-builder mode for it.

### N9 — The view-settings panel is one scrollable list of chevron-rows, each opening a child panel

`50d73158` / `52348672` show the whole per-view settings surface as a flat list (Layout, Property
visibility with a live count badge, Filter, Sort, Group, Conditional color, ...), each row opening a
further panel of the same kind rather than an inline expansion. This is close to our own
`filter-panel-renderer.ts` / `sort-panel-renderer.ts` / `column-manager-renderer.ts` split, and its
count-badge ("Property visibility  3 ›") is the same shape as the already-adopted "N applied" chip
(`design-trueup.md` §6, `050` item 1).

### N10 — Advanced-filter rows keep property + operator + value on one line, joined by an And/Or row

`299e69bb`: "Where [Name ⌄][Is not empty ⌄]" / "And ⌄" / "Where [User characteristics ⌄][Does not
contain ⌄][Adult only]" — one row per condition, a separate connector row between conditions. This
matches our own row shape (§4, §5), not Anytype's stacked-popover shape.

### N11 — Property-type-specific option editors diverge internally: Status buckets, Select/Multi-select don't

`622d2611`'s Status option editor groups options into three fixed captioned buckets (To-do/In
progress/Complete), each with its **own** trailing "+"; `441621d0` and `efb2b347`'s Select/Multi-
select option editors are flat with one "+Add option" affordance for the whole list. Notion itself
does not use one option-editor shape for every property type.

### N12 — The same "Edit property" action hosts as a floating popover in one place and a docked side panel in another

`f19c6f50` (popover) and `1d99acb0` (right-docked panel) show identical row content — Type, Sort, AI
Autofill, Options, Wrap, Hide, Duplicate, Delete — in two different hosts. No rule in the corpus
distinguishes when Notion picks one over the other from the same trigger family (§6).

---

## 4. Divergences from our surface

Each row: the pattern, our current source (as already read and line-cited in
`design-trueup.md`, not re-derived here), and the gap this digest adds.

| Pattern | Our source (design-trueup.md's read) | Gap this digest adds |
|---|---|---|
| **Checkmark side** | `dropdown-field.ts:240-243` and `cell-renderer.ts:1420,1478,1483` are **leading** | N2: every Notion single-select list read is **trailing** — a second, independent product agreeing with `050`/`052`'s existing "trailing wins" ruling. No new decision needed; this is corroboration, already adopted. |
| **Colour picker shape** | `option-color-picker.ts:119,138` — a **124px, 12-swatch, unlabelled grid** with its own geometric navigator | N4: Notion never ships an unlabelled swatch grid — list or grid, every option carries a text name. `design-trueup.md` G15 already declined adopting Anytype's list ("a shipped surface... no requirement to change"); this adds a **second** reference making the same choice, which raises the question without re-opening the ruling on its own authority (§6, per `goal.md` D3's "must not undo a landed ruling silently"). |
| **Search gating** | `dropdown-field.ts:193` — search shown only when `options.length > 8` | N3: `8ff7ae4b` shows Notion's own search-first filter picker with only **3** options and the field still present. Direct supporting evidence for `goal.md` §4's 2026-09-06 combobox amendment (no gate), independent of the operator's report. |
| **Advanced-filter row shape** | `filter-panel-renderer.ts`, `sort-panel-renderer.ts` — **552px**, property+operator+value+group+NOT+remove on one line (`design-trueup.md` §2 closing note, already ruled "not to be narrowed to Anytype's 360") | N10: Notion's own advanced-filter builder (`299e69bb`) also keeps property+operator+value on **one row**, disagreeing with Anytype's stacked-popover shape. Reinforces the existing ruling with a second reference; nobody should "correct" our 552 toward Anytype's 360 on this evidence either. |
| **"N applied" count badge** | Already adopted per `050` item 1 (`design-trueup.md` §6) | N9: Notion's own view-settings panel ships the identical shape ("Property visibility  3 ›"), independent confirmation the adopted pattern is a real cross-product convention, not an Anytype idiosyncrasy. |
| **Submenu depth ceiling** | `goal.md` D8 / `050`: our depth-3 chains are "ours to satisfy, not a parity target," since Anytype ships depth 2 only | N7: `f19c6f50` shows Notion itself shipping a depth-3 cascade on desktop (column menu → Edit property → Sort). This is new evidence, from a second product, that depth-3 is a legitimate shipped menu shape — not proof Anytype-parity requires it, but a data point against treating our depth-3 chains as pure debt. |
| **Toolbar/block-insert row shape** | `toolbar-renderer.ts` — 45 of the 71 hand-built `db-menu-item` rows this phase's census counts (`design-trueup.md` C8), all row-shaped | N8: Notion's own block-insert chooser is a captioned **2-column tile grid**, a shape neither our row-builder (`menu-row.ts`) nor Anytype's captures (M14, half-seen) can express. Named here for the `toolbar-renderer.ts` migration leg (`goal.md` D6, "one leg touches one file group") to weigh, not a requirement to build in `052`. |
| **Destructive icon pairing** | `design-trueup.md` G6, adopted: "wherever a destructive row is coloured, it carries a matching icon" (from Anytype's iOS) | N6: Notion's own iOS "Remove" rows (`5f81b365`, `ca4fd83f`) are red text with **no icon**, on a second independent reference. Not strong enough to reopen an Anytype-sourced ruling per `goal.md` D3 (Anytype is the design source; Notion refines, it does not overturn), but the rule may want a named exception for "revert/remove structure" rows rather than blanket enforcement (§6). |

---

## 5. Anytype vs Notion

Per `goal.md` D3: Anytype is the design source, ruled by the operator by default; a Notion refinement
may sharpen a gap but must not silently undo a landed Anytype ruling.

- **Condition-row shape — agree with us, disagree with Anytype.** Anytype's filter panel stacks
  property (one popover) against operator+value (a second popover), per `design-trueup.md` §2's
  measured `set-filter-select` at 360px. Notion (`299e69bb`) keeps all three on one row, like our own
  `filter-panel-renderer.ts`. `design-trueup.md` already ruled against narrowing our 552px row to
  Anytype's 360px shape; Notion's agreement with our shape is corroboration for that existing ruling,
  not new grounds to revisit it.

- **Colour picker — Anytype and Notion agree with each other, both disagree with us.** Anytype's is a
  224px labelled list (`design-trueup.md` G15/G6 in this document's terms). Notion's is a labelled
  list (full-screen) or a labelled grid (inline toolbar), never bare swatches. Ours
  (`option-color-picker.ts:119`) is an unlabelled 124px swatch grid. `design-trueup.md` already
  declined adopting Anytype's list on cost grounds ("a shipped surface... no requirement to change").
  This document does not overturn that ruling — it flags that a second reference now agrees with the
  declined option, which is worth surfacing to the operator rather than silently acted on (§6).

- **Checkmark side — both agree, already adopted.** Anytype: trailing (G14). Notion: trailing in
  every list read (N2). No disagreement; this is double confirmation of an already-landed decision.

- **Create-affordance placement — no direct conflict, but Notion supplies no evidence for one of the
  four shapes.** Anytype's captured `+ Create Object` sits first, under the search field, above the
  list (G11). Notion's samples show the create affordance either as the search field itself
  (`8ff7ae4b`'s "Filter by...") or as an inline "Type a new option..." field inside a section
  (`841ae11d`), and any escalation ("+ Add advanced filter") consistently **last**. Nothing in this
  corpus shows a first-row create action above an existing list the way Anytype's does — that specific
  shape rests on Anytype's evidence alone; Notion neither confirms nor contradicts it.

- **Submenu trigger (hover vs. click) — Anytype has procedural proof, Notion has none in this corpus.**
  `design-trueup.md` C2 proves Anytype's submenus are hover-opened from the crawler's own procedure
  (37 captures, each reached by dispatching a hover). This digest's screens are static Mobbin captures
  with no comparable procedural trail, so N7's depth-3 cascade cannot say whether Notion's desktop
  submenu opens on hover or click. Treat as unknown, not as agreement or disagreement (§6).

- **Destructive icon pairing — Notion mildly disagrees with the Anytype-sourced rule we adopted.**
  `design-trueup.md` G6 adopted "colour is never alone" (icon + colour together) from Anytype's iOS
  `Delete` row. Notion's iOS `Remove` rows are sometimes red text alone (N6). Per `goal.md` D3 this
  does not unseat the Anytype-sourced ruling on its own; it is recorded as a place the rule may need a
  documented exception (§6) rather than a silent reversal.

---

## 6. Open questions for the research loop

1. **Colour picker, revisited or not?** Two independent references (Anytype's 224px labelled list,
   Notion's labelled list/grid) now agree against our unlabelled 124px swatch grid
   (`option-color-picker.ts:119`). `design-trueup.md` G15 already ruled this declined, for cost
   reasons, under `goal.md` D3's Anytype-first framing. Does the operator want this re-opened now that
   a second, non-Anytype reference independently makes the same choice, or does the existing ruling
   stand as landed? This document takes no position — D3 forbids undoing a ruling silently, and this
   is exactly that kind of ruling.
2. **Hover vs. click for desktop submenus, on Notion.** N7/§5: this corpus cannot settle it. Would a
   live check (not a static Mobbin screenshot) be worth the cost before the primitive's `@media
   (hover: hover)` guard (`design-trueup.md` G8) is extended to other consumers?
3. **A tile-grid row mode for the primitive?** N8: Notion's block-insert chooser needs a 2-column
   captioned tile layout neither our `menu-row.ts` nor Anytype's captured menus provide. `goal.md` D1
   forbids "a fifteenth row vocabulary" — is a tile-grid mode the one extension worth making, given
   it's now independently observed on a second product, or is it out of scope until `toolbar-
   renderer.ts`'s own migration leg names a concrete caller?
4. **A named exception to "destructive is always icon-paired"?** N6/§5: Notion's own inconsistency
   (icon-paired for content-destroying rows, plain for structure-removing rows) suggests G6's rule
   might read better with an explicit carve-out than as a blanket requirement. Worth a decision record
   entry rather than silent enforcement either way.
5. **Floating popover vs. docked side panel for "Edit property"?** N12: Notion itself is inconsistent
   between these two hosts for the same action. Is there a reason to prefer one for our own picker
   family's desktop host, or is this purely a Notion quirk with nothing to take?
6. **Dark-theme claims need a dedicated harvest.** §1: 100 of 101 screens read here are light theme.
   Any dark-mode value asserted for Notion in a future document built on this digest should cite a
   dark-theme screen specifically, not extrapolate from this corpus's single dark sample (`213bded5`).
