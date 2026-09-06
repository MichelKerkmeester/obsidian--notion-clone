---
title: "Notion Screens Digest: The Record/Page Surface"
description: "97 Notion captures read by hand for the record/page surface — header/icon/cover, property rows and editors, relation rows, add property, hidden properties, comments, the phone record sheet — with per-screen findings, recurring patterns, and where they diverge from our tree and from the Anytype ruling."
date: 2026-09-06
surface: "record/page (header, property rows, relation rows, add property, hidden properties, comments, phone record sheet)"
phase: "005-component-surface-system/054-record-and-relation-surfaces"
---

# Notion Screens Digest: The Record/Page Surface

> Companion to `design-trueup.md` (the Anytype true-up). Method: read the image, describe what is
> on it, measure what is measurable. Unlike `design-trueup.md`'s Anytype sweep, no per-pixel colour
> scan was available in this pass — Notion's captures were read visually, not sampled — so hex
> colours are omitted except where a handful were unambiguous, and "measured" below mostly means
> counted, read as literal on-screen text, or eyeballed as a proportion (flagged as such). Where
> `design-trueup.md` already carries a stronger claim for the same surface, this document defers to
> it rather than re-deriving it.

---

## 1. Selection

**97 screens read**, of a 346-screen candidate pool built from the task's named folders
(`ios/editors/`, `ios+web/database/*propert*`, `flows/database-detail`,
`flows/adding-a-new-property`, `flows/adding-new-properties`, `flows/customizing-page`,
`flows/page-actions`, `flows/adding-a-cover*`, `flows/adding-an-icon-page`,
`flows/commenting-on-a-page`) plus a README-index grep widened to `flows/hiding-properties`,
`flows/hiding-database-properties`, `flows/deleting-a-property`, `flows/deleting-a-status-property`,
`ios+web/collaboration/comments`, `ios+web/database/row-page` (the "database row opened as page"
query — the record page itself), and `web/database/side-peek`. The 346 candidates were deduplicated
by Mobbin screen id (the same screen is often filed under both a query folder and a flow folder) and
priority-ranked; the top five priority tiers (cover/icon, properties+editor+relation+row-page+
side-peek+comments, database-detail, adding-a-new-property, hiding-properties) were read in full,
then thinned by taking every other screen inside the two largest, most-repetitive tiers
(`properties`/`property-editor` sequences) to keep breadth without reading nine near-identical crops
of the same picker.

**Platforms and states actually read**: 44 iOS + 53 web. Populated pages, empty/new pages, menus
open and menus closed, and light and dark **content** (a black cover image, a dark AI-preview
panel) all appear — but **every app chrome capture in the sample renders Notion's light theme**;
no dark-mode sidebar, top bar, or property panel turned up in 97 reads. That is a property of the
harvested corpus, not a selection choice: the folders this task named do not carry a light/dark pair
the way `screenshots/anytype/` does, and no screen in the read set was skipped for being the "wrong"
theme.

**Skipped, and why.** Two categories, both large:

1. **Off-topic despite the folder name.** `screenshots/notion/README.md` states this directly: "the
   group is the query, not a verified reading of the image." It held here at roughly the same rate
   the README's own landing check found (~1 in 2 for the worst-hit groups). The `ios/editors/`
   query folder (165 files) is almost entirely block-editor content — AI writing, ask-AI, slash
   menu — with only its `cover-icon` slug (23 files) on-surface; all 136 off-slug files were
   excluded before reading. The `property-editor` query folder, on both platforms, turned out to be
   almost entirely **workspace admin and AI-automation surfaces** (emoji admin, Notion AI skills,
   "fill property with AI agent" modals, automation builders) rather than a per-type value editor —
   of the 24 property-editor screens read, 19 were off-topic and are recorded as such in the table
   below rather than silently dropped. The `relation` query folder was similarly mostly
   data-source-linking and sub-item config, not a relation-value picker; one screen in it (the
   side/center/full-page display-mode chooser) carried the whole group's signal. The `side peek`
   query never surfaced an actual side-peek panel in this sample — it returned version history, the
   comments panel, and publish settings instead.
2. **Near-duplicates.** Several flows replay the same static screen (the "SLMobbin — Creative
   Strategy Framework" web doc appears in nine different flow/query folders under different
   filenames but eleven distinct screen ids); duplicate ids were deduplicated before reading, and
   near-identical crops of the same picker mid-flow (e.g. three consecutive AI Autofill config
   screens) are named once in the table with the repeat noted rather than each drawing its own row.

The reading order (and the batch grouping below) was: page cover/icon (iOS then web, 24 screens) →
`database-detail` flow (4) → `adding-a-new-property` + `adding-new-properties` flows (12) →
`hiding-properties` + `hiding-database-properties` flows (17) → comments, iOS and web (10) →
`properties` query tail (9) → `property-editor` query (24, mostly off-topic) → `relation` query (9,
mostly off-topic) → `row-page` query, iOS and web (10) → `side peek` query (7, mostly off-topic).

---

## 2. Per-screen table

One row per screen actually opened. **Id** is the Mobbin screen id's first 8 hex characters (unique
within this table); the full id resolves at `https://mobbin.com/screens/<full-id>` (linked). Off-topic
rows are marked so in Description rather than omitted, per the instruction to record what was skipped
and why on the screen that earned it.

### Page header, icon and cover (24 screens: `ios/editors/cover-icon`, `web/editors/cover-icon`)

| Id | Platform | Theme | Path | Mobbin | Description | Measured |
|---|---|---|---|---|---|---|
| `b1b9d218` | iOS | light | `ios/editors/notion-ios-editors-cover-icon-01-…` | [screen](https://mobbin.com/screens/b1b9d218-f175-44f7-9272-9c26ee18d793) | Icon picker sheet, Icons tab | 8-colour swatch row above an icon grid; "Ask every time" toggle; a "Recent" row |
| `4dd0854f` | iOS | light | `…cover-icon-02-…` | [screen](https://mobbin.com/screens/4dd0854f-794a-4157-8b4e-83c58d74fa62) | Icon picker sheet, Emoji tab | Recent row + "People" category grid |
| `e9e94681` | iOS | light | `…cover-icon-04-…` | [screen](https://mobbin.com/screens/e9e94681-2120-4697-aadd-814c1f9464c1) | Off-topic: "Offline pages" list, mistagged by the query | — |
| `62fe716c` | iOS | light | `…cover-icon-05-…` | [screen](https://mobbin.com/screens/62fe716c-ef93-48cd-8317-782fdeca6152) | "To do list" page: Private breadcrumb, bold title under a full-bleed black cover, "MOBBIN DIARY" caption/link between cover and body | Cover reads full-bleed edge-to-edge in the 299px-wide capture |
| `404d254a` | iOS | light | `…cover-icon-06-…` | [screen](https://mobbin.com/screens/404d254a-57eb-4bd2-af62-c0797d86fe66) | Off-topic: template-gallery preview modal | — |
| `9d90280d` | iOS | light | `…cover-icon-07-…` | [screen](https://mobbin.com/screens/9d90280d-cf5f-4b9d-a8d4-3c96cfff5ec4) | Same page as `62fe716c`, cover shows an **"ALT"** badge, bottom-right corner of the image | Badge is a small pill, opens `3ebe4893`'s alt-text dialog |
| `b5352c94` | iOS | light | `…cover-icon-10-…` | [screen](https://mobbin.com/screens/b5352c94-5145-44c8-a6af-9ee40677b88f) | Same page, cover shows an "Uploading" spinner overlay | Upload-in-progress state exists on the cover itself |
| `6f5b6ad1` | iOS | light | `…cover-icon-11-…` | [screen](https://mobbin.com/screens/6f5b6ad1-9582-4d7f-8053-edf3bff564a6) | Off-topic: AI-agent icon/emoji picker (Name + Instructions form), not a page icon | — |
| `080d7a29` | iOS | light | `…cover-icon-15-…` | [screen](https://mobbin.com/screens/080d7a29-6cc6-43d1-9487-642462aa0247) | Page-history restore bar ("Restore / date / Done") over the same cover+title page | History chrome, not header chrome; noted only |
| `18d621d0` | web | light | `web/editors/notion-web-editors-cover-icon-01-…` | [screen](https://mobbin.com/screens/18d621d0-2f20-4f36-80e8-9193d214b160) | Cover picker menu open | Tabs: Gallery / Upload / Link / Unsplash / Notion AI (Beta) / Remove; action row Generate / Change / Reposition |
| `c21465fc` | web | light | `…cover-icon-02-…` | [screen](https://mobbin.com/screens/c21465fc-28fd-4c7e-992d-0a7d02c6466d) | Cover menu, Notion AI tab active | Prompt textarea, style dropdown "General", attach + submit icons |
| `c562f7e8` | web | light | `…cover-icon-03-…` | [screen](https://mobbin.com/screens/c562f7e8-d22a-45ac-b255-b73d72b34d34) | Style dropdown open | Options: General (checked) / Photo / Pattern |
| `e01a33d7` | web | light | `…cover-icon-04-…` | [screen](https://mobbin.com/screens/e01a33d7-6b51-4c8d-9db1-493764a90123) | Cover menu, Link tab | Paste-image-link field + Submit button |
| `d393578a` | web | light | `…cover-icon-05-…` | [screen](https://mobbin.com/screens/d393578a-02ea-4548-81e7-85b112499af5) | Duplicate of `c21465fc` | — |
| `bfddb457` | web | light | `…cover-icon-06-…` | [screen](https://mobbin.com/screens/bfddb457-f6ba-4160-811a-dbc93713e20e) | Cover reposition mode | "Drag image to reposition" centred hint; top-right "Save position / Cancel" |
| `ab313e42` | web | light | `…cover-icon-07-…` | [screen](https://mobbin.com/screens/ab313e42-7ab7-46d5-8a8c-119796663c86) | Cover baseline, hover state | Cover ≈152/521px of the capture height (≈29%, eyeballed); icon 🎨 overlaps the cover's bottom-left corner |
| `d2b6da49` | web | light | `…cover-icon-08-…` | [screen](https://mobbin.com/screens/d2b6da49-6ec2-49b9-abfe-d82adfb280af) | Page with a "Verified" badge beside the title, an "@mention" popover open (Date / People / Link to page sections) | Metadata line under the title reads "Document to be refined by @…" — a freeform mention, not a property |
| `3ef5663d` | web | light | `…cover-icon-09-…` | [screen](https://mobbin.com/screens/3ef5663d-4ab1-4479-a942-4af54bcff6e5) | Cover menu, Notion AI tab, empty prompt | Placeholder "Generate a pattern, artwork, photo…" |
| `42f72d81` | web | light/dark preview | `…cover-icon-10-…` | [screen](https://mobbin.com/screens/42f72d81-0036-4b07-87ed-9ac157f0ac4f) | Off-topic: "Publish to web" Header settings panel (Breadcrumbs/Search/Share/Duplicate/Sign-up toggles) | Site-publish chrome, not the record header |
| `aa987df0` | web | light | `…cover-icon-11-…` | [screen](https://mobbin.com/screens/aa987df0-1513-49d0-85e4-1e345b268002) | Off-topic: presentation/slide export mode, "1 of 13" | — |
| `9484e185` | web | light | `…cover-icon-12-…` | [screen](https://mobbin.com/screens/9484e185-ebe8-4a16-8b2a-ece1fec877a8) | Page "···" more-menu open | 17 rows: Move to, Archive, Present, Small text (toggle), Full width (toggle), Customize page, Lock page, Use with AI, Suggest edits, Translate, Undo, Import, Export, Turn into wiki, Updates & analytics, Version history, Notify me, Open in Mac app |
| `92c51f39` | web | light | `…cover-icon-13-…` | [screen](https://mobbin.com/screens/92c51f39-b156-4369-90d1-8e001f5acad1) | Inline text-selection comment popover | Avatar+name+timestamp+"Delete: `<quoted text>`"; a comment-indicator rail in the right margin |
| `2526cc8c` | web | light/dark preview | `…cover-icon-14-…` | [screen](https://mobbin.com/screens/2526cc8c-1636-4e80-9e8c-498927a4a5d5) | Off-topic: "This page is live on …notion.site" publish banner | Cover height in this crop matches `ab313e42`'s ≈29% |

### `flows/database-detail` (4 screens, iOS)

| Id | Platform | Theme | Path | Mobbin | Description | Measured |
|---|---|---|---|---|---|---|
| `74da3d7a` | iOS | light | `ios/flows/database-detail/…-01-…` | [screen](https://mobbin.com/screens/74da3d7a-b6b7-4ab8-ba38-9a17f04de3da) | "To do list" page body with an embedded inline table "Need to do" | Rows carry an "OPEN" pill beside the title cell — the row-opens-as-page affordance |
| `2cb53019` | iOS | light | `…-02-…` | [screen](https://mobbin.com/screens/2cb53019-fd9e-4f13-8497-df283445101c) | "Data source actions" sheet | Rows: Add a new view / Copy link to view / Duplicate view — divider — View database / Edit title / Edit icon |
| `9acbba50` | iOS | light | `…-03-…` | [screen](https://mobbin.com/screens/9acbba50-e88a-4e2c-b3ae-a8de35da6a92) | Same sheet, one more group | Adds a divider + a lone "Hide title" row |
| `6494c048` | iOS | light | `…-04-…` | [screen](https://mobbin.com/screens/6494c048-3824-413c-a5ca-3f3b0c8f21ee) | Plain "Need to do" table view | Off-surface (table chrome only); breadcrumb dropdown "To do list ⌄" above the toolbar |

### `flows/adding-a-new-property` + `flows/adding-new-properties` (12 screens, iOS)

| Id | Platform | Theme | Path | Mobbin | Description | Measured |
|---|---|---|---|---|---|---|
| `52348672` | iOS | light | `…adding-a-new-property-01-…` | [screen](https://mobbin.com/screens/52348672-5d4a-4133-8ffb-f1845d73f826) | View "Settings" sheet | Row **"Property visibility › 3"**; also Layout/Filter/Sort/Group/Conditional color; "Edit properties" under Data source settings |
| `1589e7c8` | iOS | light | `…-03-…` | [screen](https://mobbin.com/screens/1589e7c8-87af-4c7d-8b1a-a7ec6ec103f8) | "New property" sheet | Order: Property name field → "AI Autofill" suggestions (Summarize·Basic, Translate·Basic, Due Date·Custom Agent, Priority Level·Custom Agent) → "Type" search → format list (Text, Number, Select, Multi-select, Status, Date, Person, Files & media, …) |
| `d9d61160` | iOS | light | `…-04-…` | [screen](https://mobbin.com/screens/d9d61160-837d-45fe-b667-7091457e6aab) | Small 3-row sheet: Paragraph / Bullets / One-liner | Purpose uncertain from this crop alone (likely an AI-summarize output-style sub-picker); flagged low-confidence |
| `f9fd244c` | iOS | light | `…-05-…` | [screen](https://mobbin.com/screens/f9fd244c-70e9-43b5-844e-d6967a371cc4) | Off-topic: "Autofill Summary" property-type config (Basic/Custom Agent, Instructions, Triggers) | — |
| `34541a79` | iOS | light | `…-08-…` | [screen](https://mobbin.com/screens/34541a79-8f3d-405a-bc1e-a4d3b5e5f284) | Off-topic: same config, Sources+Settings scrolled | Agent model "Sonnet 4.6"; credit usage "0/20" |
| `4cc9aad0` | iOS | light | `…-09-…` | [screen](https://mobbin.com/screens/4cc9aad0-a791-449d-a9a6-bd85558b77e6) | Duplicate of `34541a79` | — |
| `794591f5` | iOS | light | `…adding-new-properties-01-…` | [screen](https://mobbin.com/screens/794591f5-f9b6-4416-8c0c-bea36a0e1e65) | "View options" sheet | Row **"Properties › 2 shown"**; "Customize [db] — Change settings, add new features" |
| `2f52d1bc` | iOS | light | `…-02-…` | [screen](https://mobbin.com/screens/2f52d1bc-fcf7-4da5-8f96-6b1e31339dc4) | **"Properties" hidden-group sheet** (board variant) | Search field; "Shown in board" + "Hide all" link, 1 row (Activity); "Hidden in board" + "Show all" link, 2 rows (Rate, Status), each with an eye icon |
| `406e67e2` | iOS | light | `…-03-…` | [screen](https://mobbin.com/screens/406e67e2-62ad-4243-bc0e-c52190f5bd49) | Same sheet after toggling one row | Shown now holds 2 (Activity, Rate), Hidden holds 1 (Status) — confirms live section membership |

### `flows/hiding-properties` (iOS, 5) + `flows/hiding-database-properties` (web, 4)

| Id | Platform | Theme | Path | Mobbin | Description | Measured |
|---|---|---|---|---|---|---|
| `9867cb76` | iOS | light | `ios/flows/hiding-properties/…-02-…` | [screen](https://mobbin.com/screens/9867cb76-74ed-4ff0-9254-398aeff2265e) | **"Property visibility" sheet** (table variant) | Drag handles (⋮⋮); "Shown in table" — Title (eye greyed/disabled), Column 1, Column 2 (both eye active) |
| `cc8b241a` | iOS | light | `…-03-…` | [screen](https://mobbin.com/screens/cc8b241a-76d5-4192-8a33-5b970ea2f9ab) | Same sheet after hiding both columns | "Shown in table": Title only; "Hidden in table" + "Show all" appears: Column 1, Column 2 |
| `50d73158` | iOS | light | `…-04-…` | [screen](https://mobbin.com/screens/50d73158-3d35-474f-9848-3bea591a19a1) | "Settings" sheet, third count phrasing | Row **"Property visibility › 1"** |
| `8ce401b5` | iOS | light | `…-05-…` | [screen](https://mobbin.com/screens/8ce401b5-4d65-493e-988c-0cb7c7d11900) | View-name rename transition (skeleton state) | Low-signal loading artifact |
| `c3b86c01` | web | light | `web/flows/hiding-database-properties/…-01-…` | [screen](https://mobbin.com/screens/c3b86c01-5700-492f-898b-c2cdc281d3c8) | Baseline "User Interviews" table | Columns Name/User characteristics(chips)/ID/Date; footer "Calculate ▾" |
| `56e2ae1a` | web | light | `…-02-…` | [screen](https://mobbin.com/screens/56e2ae1a-d9aa-46cd-96b4-4c6c3a17ab35) | "View options" panel | Row **"Properties › 4 shown"**; header row gains ghost buttons "+ Add icon / + Add cover / + Add description" |
| `01cde7f6` | web | light | `…-03-…` | [screen](https://mobbin.com/screens/01cde7f6-815d-44d3-a6f2-84312ac7c543) | **"Properties" panel** (desktop) | "Shown in table" + "Hide all", 5 rows w/ drag handle+icon+eye+chevron; then **"Deleted properties › 11"** row |
| `7ffa073f` | web | light | `…-04-…` | [screen](https://mobbin.com/screens/7ffa073f-4d8d-45bb-8f64-9d26fba04a27) | Same panel, 2 rows hidden | "Shown in table": 3; "Hidden in table" + "Show all": 2; "Deleted properties 11" unchanged |

### Comments (iOS collaboration ×2, web collaboration ×6)

| Id | Platform | Theme | Path | Mobbin | Description | Measured |
|---|---|---|---|---|---|---|
| `531ce76e` | iOS | light | `ios/collaboration/…comments-08-…` | [screen](https://mobbin.com/screens/531ce76e-984a-4827-a50d-879ca10a2c04) | Inline comment composer over a dimmed cover | Text typed, image-attachment preview + ×, icon row (attach/@mention/send), keyboard open |
| `1da73ef6` | iOS | light | `…comments-09-…` | [screen](https://mobbin.com/screens/1da73ef6-c2fd-4abb-a268-f22cd0e7aa9c) | Page-level comment thread anchored directly under the title | Avatar+name+"Just now", body text, icon row (react/resolve-check/···), then "Add a comment…" row below |
| `39835a00` | web | light | `web/collaboration/…comments-01-…` | [screen](https://mobbin.com/screens/39835a00-402b-4616-a83e-96a13f0eef04) | Inline comment composer beside a highlighted paragraph | Text field + attach/mention/send icons |
| `d3ea7850` | web | light | `…comments-02-…` | [screen](https://mobbin.com/screens/d3ea7850-e228-4a7e-a157-f5d05e389c4b) | Scroll-state dup, no comment UI open | Off-signal |
| `388a29da` | web | light | `…comments-03-…` | [screen](https://mobbin.com/screens/388a29da-0afb-467b-a46b-3439b0ca4f6b) | **"All discussions" side panel** | Grouped by day ("Today"/"Last Friday"); rows = avatar+name+time+preview text+page name+"Reply…" |
| `372450ee` | web | light | `…comments-04-…` | [screen](https://mobbin.com/screens/372450ee-4dc0-4f80-8070-cb4c4720278b) | Inline thread in the right margin | Original comment + a **PDF attachment card** ("PDF File.pdf · 13.5 KB") + a nested reply + "Reply…" box |
| `1a00da21` | web | light | `…comments-05-…` | [screen](https://mobbin.com/screens/1a00da21-21a0-496e-8b9e-5b16102b593c) | Off-topic: "This page was archived… / Unarchive" banner | — |
| `2a906c09` | web | light | `…comments-06-…` | [screen](https://mobbin.com/screens/2a906c09-0cb5-40cb-9a52-ab718ce0efe3) | Minimal single-thread crop, confirms reply-box icon order | attach → mention → send |

### `properties` query tail (iOS ×6, web ×2)

| Id | Platform | Theme | Path | Mobbin | Description | Measured |
|---|---|---|---|---|---|---|
| `8bb9115f` | iOS | light | `ios/database/…properties-01-…` | [screen](https://mobbin.com/screens/8bb9115f-e0da-4e01-bd9d-2b627a4b6727) | **"Properties" management sheet** (distinct from the visibility sheet) | Title/Column 1/Column 2 rows, plain chevron, **no eye icon** — opens the property's own editor |
| `9a0b56b7` | iOS | light | `…properties-04-…` | [screen](https://mobbin.com/screens/9a0b56b7-2f3a-46e2-b0b6-8a549eea5627) | Sub-items nesting config + a relation-property search picker on top | Marginal — adjacent to relation rows, a distinct hierarchy feature |
| `7d7b5690` | iOS | light | `…properties-06-…` | [screen](https://mobbin.com/screens/7d7b5690-df66-49a7-ab4e-de6503244fbc) | Off-topic: Autofill Custom Agent config | — |
| `52294205` | iOS | light | `…properties-11-…` | [screen](https://mobbin.com/screens/52294205-f7ad-41c9-b766-836c6af988d9) | Off-topic: "Can only fill data in" checklist | — |
| `0d940540` | iOS | light | `…properties-14-…` | [screen](https://mobbin.com/screens/0d940540-26d4-4bbf-8df5-60982ec567b2) | Off-topic: Autofill config variant | — |
| `142cef4e` | iOS | light | `…properties-16-…` | [screen](https://mobbin.com/screens/142cef4e-fe09-4fc9-bab5-59d0e4e72de1) | Off-topic: "Conditional color" config | Property-search picker (Title/Column 1/Column 2) reused here too |
| `b69c8a59` | web | light | `web/database/…properties-02-…` | [screen](https://mobbin.com/screens/b69c8a59-0612-4e4a-9535-957f5a6efa92) | Board "Team", **Property visibility panel** open | "Shown in board"+"Hide all", 6 rows incl. a **Formula** (Σ) property row |
| `0b5a0ef9` | web | light | `…properties-04-…` | [screen](https://mobbin.com/screens/0b5a0ef9-73e1-44b8-8852-51a314fdeb6c) | Off-topic: AI-agent "Preview with [person]" modal | — |

### `property-editor` query (iOS ×5, web ×10 — mostly off-topic)

| Id | Platform | Theme | Path | Mobbin | Description | Measured |
|---|---|---|---|---|---|---|
| `658fd83b` | iOS | light | `ios/database/…property-editor-02-…` | [screen](https://mobbin.com/screens/658fd83b-c23b-4573-aac8-a18e06e185a1) | Off-topic: "Use as default template?" dialog | — |
| `53ff42bf` | iOS | light | `…-04-…` | [screen](https://mobbin.com/screens/53ff42bf-c17f-4181-a61c-704d1075622c) | Off-topic: "Task databases require…" property-mapping pickers | Noted: a "+ Create new ▾" combo-picker pattern |
| `2f0d2563` | iOS | light | `…-07-…` | [screen](https://mobbin.com/screens/2f0d2563-d5e6-4f01-adda-18b8d09b74c4) | Off-topic: "View options" list | "Hide data source titles" naming precedent noted |
| `8d28fcb9` | iOS | light | `…-11-…` | [screen](https://mobbin.com/screens/8d28fcb9-c6a8-4028-8012-e0b0a91aa8c9) | Off-topic: "Create automation" trigger search | — |
| `3ebe4893` | iOS | light | `…-13-…` | [screen](https://mobbin.com/screens/3ebe4893-48ad-4eb8-9aec-0dc51d5cbffd) | **"Add alt text to describe this image" dialog** | Single text field, prefilled "Mobbin's logo" — what the cover's "ALT" badge opens |
| `c08e8ce9` | web | light | `web/database/…property-editor-01-…` | [screen](https://mobbin.com/screens/c08e8ce9-74ff-41c3-ab52-a750a3ad1f1d) | Off-topic: AI-agent run-cost dropdown | "Run on first page −7 / 5 pages −35 / 10 pages −70 / all pages in view −28" (token-cost UI) |
| `c36224b0` | web | light | `…-03-…` | [screen](https://mobbin.com/screens/c36224b0-dffd-42e8-b0ea-7b36b77d9a6d) | Off-topic: "Generating content… Stop" busy state | — |
| `deb747e2` | web | light | `…-05-…` | [screen](https://mobbin.com/screens/deb747e2-2093-4228-b366-4957da0b3ca2) | Off-topic: "Team page automation" builder | — |
| `6ff60437` | web | light | `…-07-…` | [screen](https://mobbin.com/screens/6ff60437-cdbb-4ef5-b1a4-d0901d13dfdb) | Off-topic: workspace-admin Emoji settings | — |
| `97869a67` | web | light | `…-09-…` | [screen](https://mobbin.com/screens/97869a67-378d-4d4c-b083-c373a930b2e5) | Off-topic: workspace-admin Notion AI settings | — |
| `7b8e6d7b` | web | light | `…-11-…` | [screen](https://mobbin.com/screens/7b8e6d7b-1519-4d71-8b1d-b31b1f9d660a) | Off-topic: Notion AI Skills page-link picker | — |
| `2e44a0e9` | web | light | `…-13-…` | [screen](https://mobbin.com/screens/2e44a0e9-376b-4cff-9190-e05a2e94de92) | Off-topic: "Team page automation" People selector | — |

### `relation` query (iOS ×5, web ×2 — mostly off-topic, one high-value screen)

| Id | Platform | Theme | Path | Mobbin | Description | Measured |
|---|---|---|---|---|---|---|
| `b4fd8ac7` | iOS | light | `ios/database/…relation-02-…` | [screen](https://mobbin.com/screens/b4fd8ac7-ef9d-4cb4-81ae-c76c94a86764) | Marginal: "Link to existing data source" picker | Database-to-database link, not a row-level relation picker |
| `d7b8f655` | iOS | light | `…-03-…` | [screen](https://mobbin.com/screens/d7b8f655-fecf-4dff-a46f-8049823ff8d2) | Off-topic: "Remove related properties when turning off sub-items?" confirm | — |
| `987fddc4` | iOS | light | `…-04-…` | [screen](https://mobbin.com/screens/987fddc4-ead0-4b7b-a0b6-c07a10fab299) | Off-topic: "Summary instructions" preset list | — |
| `03c1c9bf` | iOS | light | `…-05-…` | [screen](https://mobbin.com/screens/03c1c9bf-7597-4e55-86f0-abdf7e96d027) | Off-topic: same list, one preset added | — |
| `beb4a541` | iOS | light | `…-07-…` | [screen](https://mobbin.com/screens/beb4a541-29ca-4203-a89e-a0f5d504e113) | Off-topic: "New data source" chooser | — |
| `932bb81c` | web | light | `web/database/…relation-01-…` | [screen](https://mobbin.com/screens/932bb81c-6d25-4521-80bf-ae17aba01f0f) | Off-topic: automation page-link picker | — |
| `b95c9bf0` | web | light | `…-02-…` | [screen](https://mobbin.com/screens/b95c9bf0-6d2c-489f-814b-c35d192310eb) | Off-topic: same picker, Link tab | — |

### `database row opened as page` query (iOS ×9, web ×1) — the record page itself

| Id | Platform | Theme | Path | Mobbin | Description | Measured |
|---|---|---|---|---|---|---|
| `0cb59457` | iOS | light | `ios/database/…row-page-03-…` | [screen](https://mobbin.com/screens/0cb59457-00da-4154-b7c0-5bb2a4831ba2) | **"Side peek / Center peek / Full page" display-mode chooser** | Side peek checked, subtitled "Default for Table" |
| `16ddd22c` | iOS | light | `…-04-…` | [screen](https://mobbin.com/screens/16ddd22c-d559-4bd7-ab48-9557843441f9) | "Mobbin" page, plain property list | Column 1/Column 2/Summ… all read **"Empty"** in grey; "+ Add a property" plain-text row directly beneath; "Add a comment…" row below a gap |
| `900136e2` | iOS | light | `…-07-…` | [screen](https://mobbin.com/screens/900136e2-a920-4c8e-81f7-65bc7d92cb62) | Off-topic: bookmark/link-preview content block | — |
| `28ece649` | iOS | light | `…-08-…` | [screen](https://mobbin.com/screens/28ece649-ec8f-46d2-982d-764e3353e7d2) | Duplicate of `9d90280d` (cover+title) | — |
| `c2e215ad` | iOS | light | `…-09-…` | [screen](https://mobbin.com/screens/c2e215ad-0e3a-4670-8be5-f340de5fcfb7) | Off-topic: JavaScript code content block | — |
| `fcde1e20` | iOS | light | `…-10-…` | [screen](https://mobbin.com/screens/fcde1e20-a77e-4235-a96a-cee150b8c81f) | Off-topic: collapsed toggle content block | — |
| `1ef7f4f0` | iOS | light | `…-11-…` | [screen](https://mobbin.com/screens/1ef7f4f0-3770-466c-b703-19ece318d7bd) | Off-topic: synced-block banner in the body | Noted: the top bar can grow a synced-block ring icon beyond share/comment/more |
| `bf2171ff` | iOS | light | `…-12-…` | [screen](https://mobbin.com/screens/bf2171ff-ff70-4e91-b417-170af24a056c) | "New page" (empty title), same plain property list shape | Column 1/Column 2/Summ… "Empty"; "+ Add a property"; "Add a comment…"; body ghost-copy "Tap here to continue with an empty page, or create a template" |
| `ec0eb4a9` | iOS | light | `…-13-…` | [screen](https://mobbin.com/screens/ec0eb4a9-5cc1-4dd0-892c-5b46cedab204) | "Meeting @Today" template — a **bordered card property** instead of label:value rows | `📅 <event title> ⌄`, full-width rounded card; tabs Summary/Notes/Transcript |
| `256622cb` | iOS | light | `…-14-…` | [screen](https://mobbin.com/screens/256622cb-33aa-4441-a5a5-d0e762a5c11d) | Off-topic: AI transcript-processing state | — |
| `263196dd` | web | light | `web/database/…row-page-01-…` | [screen](https://mobbin.com/screens/263196dd-fec5-49cb-85b5-cde50e0cfbfe) | Desktop echo of `ec0eb4a9`, same card property + avatar stack | Marginal, template-specific |

### `side peek` query (web ×7 — mostly off-topic)

| Id | Platform | Theme | Path | Mobbin | Description | Measured |
|---|---|---|---|---|---|---|
| `3647446f` | web | light | `web/database/…side-peek-01-…` | [screen](https://mobbin.com/screens/3647446f-f959-4e58-baba-ef7e4f9ab6b0) | Off-topic: Version history panel | Grouped by day, per-row time+author |
| `e8ed9805` | web | light | `…-02-…` | [screen](https://mobbin.com/screens/e8ed9805-4357-4690-8bfc-9185f37c0a93) | Off-topic: same panel + "Restore to this version?" | — |
| `a1c31875` | web | light | `…-03-…` | [screen](https://mobbin.com/screens/a1c31875-094e-4623-b543-e095a9e36853) | Off-topic: emoji reaction picker over a comment thread | Confirms a reply/reaction badge sits on the comment row |
| `f6b952f0` | web | light/dark preview | `…-04-…` | [screen](https://mobbin.com/screens/f6b952f0-d9d3-496f-b2a1-4d18ff556a68) | Duplicate of `42f72d81` (Publish Header panel) | — |
| `81e875fa` | web | light | `…-05-…` | [screen](https://mobbin.com/screens/81e875fa-61d6-4010-b5d7-201bcaa2e4b1) | Off-topic: AI meeting-transcript panel with citation markers | — |
| `780626a3` | web | light | `…-06-…` | [screen](https://mobbin.com/screens/780626a3-20f5-4795-ac3b-bdbaef325210) | Duplicate of `3647446f` | — |
| `2c1900c8` | web | light | `…-07-…` | [screen](https://mobbin.com/screens/2c1900c8-c7d2-4559-aa5a-4f468674c901) | Comment thread, per-comment action row | React icon, resolve check, reply count; "···" → "Copied link to clipboard" toast |

---

## 3. Patterns

Ordered by how much of the surface they define.

### P1 — The property list is a plain label→value row, not a two-column grid

Every populated property list read (`16ddd22c`, `bf2171ff`, `9867cb76`, `cc8b241a`, `01cde7f6`,
`c3b86c01`) draws a property as `label` then `value` in reading order, with **no visible column
alignment carried across rows** — this matches `design-trueup.md`'s A2 reading of the *Anytype*
property panel almost exactly (label, then value, value not right-aligned, no format icon on the
row). Empty values in every record/page-level list read the literal word **"Empty"** in grey
(`16ddd22c`, `bf2171ff`) — not a format-specific prompt. "+ Add a property" is a plain text row
directly under the last property, and "Add a comment…" sits below a hairline gap, reading as its own
zone (`16ddd22c`, `bf2171ff`, `8bb9115f`).

### P2 — Two distinct "Properties" destinations from the same label

Notion sends "Properties"/"Property visibility" to **two different sheets** depending on entry
point: a **management sheet** (`8bb9115f`: Title/Column 1/Column 2, plain chevron, no eye icon,
opens the property's own type/format editor) and a **visibility sheet** (`9867cb76`, `2f52d1bc`,
`01cde7f6`: search field, drag handle, eye icon, chevron, opens nothing — toggles show/hide in
place). The two are visually near-identical rows with different affordances per icon.

### P3 — The hidden-properties group: two labelled sections, a bulk link, a per-row toggle, and (on desktop) a soft-delete tier

Read on iOS board (`2f52d1bc`→`406e67e2`), iOS table (`9867cb76`→`cc8b241a`), and desktop table
(`01cde7f6`→`7ffa073f`) — three independent captures of the same grammar:

- **Two sections**, "Shown in `<surface>`" and "Hidden in `<surface>`", each with a **bulk link**
  ("Hide all" / "Show all") in its header row.
- **The Hidden section renders only once something is hidden** — `9867cb76` (nothing hidden yet)
  shows no "Hidden in table" section at all; `cc8b241a` (two hidden) shows both. Conditional
  rendering, not two static always-open groups.
- **Every row** carries a drag handle (⋮⋮), the property's own type icon, its name, an eye icon, and
  a chevron. Title/Name is always shown and its eye icon is disabled — it cannot be hidden.
- **Desktop only**, a further divider and a **"Deleted properties › 11"** row (`01cde7f6`,
  `7ffa073f`) — a third, soft-delete tier the iOS sample never showed.
- **The count itself lives on the entry-point row, not inside the panel.** Three different phrasings
  were read for the same concept: `"Property visibility › 3"` (`52348672`, `50d73158`),
  `"Properties › 2 shown"` (`794591f5`), `"Properties › 4 shown"` (`56e2ae1a`). The in-panel section
  headers ("Shown in table"/"Hidden in table") never themselves carry a number.

### P4 — Add-property: name field, then AI suggestions, then a searched format list

`1589e7c8` reads top to bottom as: Property name input → **"AI Autofill" suggestion chips**
(Summarize, Translate, Due Date, Priority Level — each independently selectable) → a "Type" search
field → the plain format list (Text, Number, Select, Multi-select, Status, Date, Person, Files &
media, …). AI-generated suggestions sit **above** the format search, not folded into it.

### P5 — The cover/icon system: a six-tab picker, three hover actions, and a separate alt-text dialog

`18d621d0` reads the full picker chrome: tabs **Gallery / Upload / Link / Unsplash / Notion AI
(Beta) / Remove**, with a top-right action row **Generate / Change / Reposition** shown on hover once
a cover exists. The Notion AI tab (`c21465fc`, `c562f7e8`) carries its own style sub-picker
(General/Photo/Pattern). Reposition (`bfddb457`) is a distinct drag mode with its own Save
position/Cancel pair. A cover image can independently carry an **"ALT" badge** (`9d90280d`) that
opens a single-field **alt-text dialog** (`3ebe4893`) — alt text is not part of the property list or
the header, it is attached to the image itself. On an unset header, desktop reveals ghost buttons
"+ Add icon / + Add cover / + Add description" on hover (`56e2ae1a`) rather than showing empty slots
by default.

### P6 — Comments: a page-level thread, an inline-anchored composer, and a separate discussions panel — three surfaces, not one

Three distinct comment UIs were read, not variants of one: (a) a **page-level thread** anchored
directly under the title, with its own resolve-check/react/"···" row (`1da73ef6`, iOS); (b) an
**inline composer** that anchors beside a text selection rather than at the page level
(`92c51f39`, `39835a00`, web); (c) a dedicated **"All discussions" side panel**, grouped by day,
listing every thread across the page with a preview line and a "Reply…" affordance (`388a29da`).
Threads support **file attachments as cards** (`372450ee`: "PDF File.pdf · 13.5 KB") and nested
replies.

### P7 — Row-open display mode is a named, three-way user choice

`0cb59457`: **Side peek** ("Open pages on the side. Keeps the view behind interactive. Default for
Table") / **Center peek** ("Open pages in a focused, centered modal") / **Full page** ("Open pages in
full page") — a single settings screen naming exactly the three shells our own record surface
splits across the record sheet, the record peek, and the full note.

### P8 — The page "···" menu is long and mixes page-actions with view-level toggles

`9484e185`: 17 rows in one menu, spanning destructive actions (Move to, Archive), display toggles
(Small text, Full width), page-management (Customize page, Lock page, Turn into wiki), AI (Use with
AI, Suggest edits, Translate), and history/notification rows. Nothing in it is a property or a
relation row, but it is the surface `flows/page-actions` named and it borders the header directly.

---

## 4. Divergences from our surface

Each row: the pattern above, what our tree does today (file:line, verified against the current
worktree — several `design-trueup.md` citations have drifted since L6/L7 landed, and the current
line is used where that happened), and the gap.

- **P1, empty-value placeholder.** `design-trueup.md`'s AC-004 (Anytype-sourced) already landed
  *partially*: `getPropertyEmptyPrompt` (`src/views/record-surface/property-row.ts:286-291`) returns
  a format-specific prompt for `select`/`multi-select`/`relation` only; every other type still falls
  through to `t("common.empty")` = **"Empty"** (`src/i18n.ts:78`, consumed at
  `record-detail-panel.ts:514-519`). Notion's own record pages (`16ddd22c`, `bf2171ff`) render
  **"Empty" universally**, for text/number/date-shaped columns exactly the ones our tree has not yet
  converted. **Notion is not evidence to widen or to stop the conversion** — it independently shows
  the pre-ruling state, not a better one. See §5.

- **P1, value alignment.** Already resolved in the ruled direction: `styles.css:10213-10223` sets
  `text-align: left` on `.db-record-detail-field .db-board-card-value` (scoped away from the board
  card, which stays right-aligned per D5/D7), and `:10230-10233` does the same for badge rows. This
  is more current than `design-trueup.md`'s own citation (which quoted the pre-fix `:10161`
  right-align). Notion's plain label→value flow (P1) independently corroborates the ruling; no
  action needed.

- **P1, label/value type size.** Still open. `styles.css:10258-10264` sets the record-sheet label to
  `font-size: var(--font-smaller)` against an inherited (larger) value size — the exact gap
  `design-trueup.md`'s A2 named ("Equalise with the value… hierarchy is colour, not size"). Nothing
  in the Notion sample measures a font-size ratio precisely enough to add a number, but every row
  read (`16ddd22c`, `01cde7f6`, `9867cb76`) shows label and value reading as the same visual weight,
  distinguished by colour/icon rather than size — third-source agreement with Anytype's finding.

- **P2, two "Properties" destinations.** We do not carry this split. Our column-manager row
  (`buildCheckboxPropertyRow`, `src/views/record-surface/property-row.ts:321-395`, consumed by
  `column-manager-renderer.ts` and `board-card-properties-panel.ts`) already draws a **drag handle
  (⋮⋮ — the same glyph Notion's rows use), a checkbox in place of an eye icon, a type icon, and a
  name** — structurally the closest thing we have to Notion's *visibility* sheet (P2/P3). But we have
  no separate *management* sheet (P2's other half, `8bb9115f`) that opens a chevron into the
  property's own editor from the same list; today that only happens through the type picker inside
  the create/edit-property modal. Not a defect — REQ scope for `052`/`054` — but worth naming so a
  future "add a manage-properties destination" idea does not get built as a variant of the visibility
  list by accident.

- **P3, hidden-properties group.** Our record sheet's group
  (`src/views/record-surface/hidden-properties.ts:44-76`, consumed at
  `record-detail-panel.ts:191,393`) is the single-toggle-with-count shape `design-trueup.md`'s A4
  called for (moved from the peek, `t("panel.hiddenProperties", { count })` = **"Hidden properties
  ({count})"**, `src/i18n.ts:569`) — completion-criteria item 2 already reads green on the census.
  Notion's P3 is richer on **every** axis this group does not cover: two labelled sections instead of
  one collapsed group, a bulk "Hide all"/"Show all" link per section, a per-row eye toggle (ours has
  none — showing a field again means re-editing the view's column config, not a click in this group),
  and (desktop) a "Deleted properties" tier we have no analogue for at all. None of this closes A4 —
  A4 already carries an operator ruling that the count is ours to add and the peek's shape is ours to
  move, not Anytype's to dictate — but it is new evidence for the research loop's OPS questions, not
  something to fold into this packet silently (§5, §6).

- **P4, add-property ordering.** We have neither half of P4. `column-manager-renderer.ts:164-198`
  renders a plain "+ New property" row; the modal it opens is a labelled form (name, key, type
  dropdown), not a search-first picker, and carries no AI-suggestion layer. `design-trueup.md`'s A5
  (Anytype-sourced) already calls for search-first-then-formats; Notion's own order — name field,
  then AI suggestions, then a searched format list — agrees with Anytype on "search the format list"
  but disagrees on where AI-generated suggestions sit relative to it. Named, not resolved: this
  packet's D6 (goal.md) puts AI-generated anything out of scope, so P4's AI-chip half is not
  actionable here regardless.

- **P5, cover/icon system.** We have no equivalent surface in `054`'s file group at all — no
  Gallery/Upload/Link/Unsplash/Generate tabs, no Reposition mode, no alt-text dialog, no hover-only
  "+ Add cover" ghost button. `design-trueup.md` does not carry this as an owned row either (A1 notes
  our header keeps the property list under it, a deliberate divergence, but does not size a cover
  picker). Per the task's own framing this belongs to "page header and icon/cover" as part of this
  surface's inventory; recorded here as a **named gap**, not a decision — whether the record sheet
  should grow a cover picker at all is `051`'s shell-ownership question (goal.md D8) before it is a
  content question.

- **P6, comments.** `023` owns the note body and `051` owns sheet/modal shell per goal.md D5/D8; this
  packet does not own a comments implementation to compare against. Recorded as inventory: our
  surface currently has no comments area on the record sheet at all, and Notion's evidence shows the
  feature is genuinely three surfaces (thread, inline composer, discussions panel), not one — a
  future comments packet should not scope it as a single "comments area" without naming which of the
  three it means.

- **P7, display-mode naming.** `goal.md` §5 (T001's answered question 1) already rules the desktop
  anchored panel's placement is `006`'s, not this packet's, and that P1 changes the header's DOM only.
  Notion's own naming — Side peek / Center peek / Full page, with an explicit stated default per view
  type — is a vocabulary this packet can borrow when it *writes about* the three shells (record
  sheet ≈ side/center peek, the full note ≈ full page), but the placement decision itself stays
  `006`'s per the existing ruling.

- **P8, page-actions menu.** Out of this packet's file group (goal.md D8: the shell/menu chrome is
  `051`'s/`052`'s). Recorded because `flows/page-actions` was a named input folder; nothing here
  changes as a result.

---

## 5. Anytype vs Notion

Per the operator's ruling (goal.md, `_memory.answered_questions`): Anytype parity is the default, and
a Notion refinement must not silently undo a landed Anytype ruling. Two places in this sweep put the
two references in direct tension, and one where they simply diverge without touching a ruling:

1. **Empty-value copy — direct tension.** `design-trueup.md`'s A3 (Anytype-sourced, §3) rules
   against the generic word "Empty" and for a format-specific action prompt ("Select options", "Add
   email", …), refusing Anytype's own placeholder *colour* but keeping the *copy* pattern; our tree
   has begun implementing exactly that for select/multi-select/relation (`property-row.ts:286-291`).
   **Notion's own record pages use the generic word "Empty" for every property type**
   (`16ddd22c`, `bf2171ff`) — the same word, the same universal scope, that the Anytype-sourced ruling
   moved us away from. This is not a case for adopting Notion's copy: the ruling was made on Anytype
   evidence and stands: Notion agreeing with our *pre-fix* state is not a reason to stop finishing the
   AC-004 rollout to text/number/date columns. Named explicitly so nobody reads "Notion also says
   Empty" as grounds to revert or pause the remaining conversion.

2. **Hidden-properties richness — new evidence, not a reopened ruling.** A4's operator ruling stands:
   "not adopted from anything… ours… take the peek's shape, add the count" — closed, and completion
   criteria item 2 already reads green against it. Notion's P3 (§3 above) is considerably richer
   (two sections, bulk actions, per-row eye toggle, a deleted-properties tier) than either the
   Anytype capture set showed (A4: "no group, no count, no collapse… membership changed by drag") or
   than our shipped single-toggle group. Neither reference argues for the *other's* shape here —
   Anytype has nothing to adopt (A4 confirmed), and Notion's richer shape was never ruled on because
   T001's sweep predates this document. Filed as an open question in §6, not resolved by inference.

3. **Add-property ordering — a genuine divergence, no tension.** Anytype's A5 (search-first, formats
   before existing properties) and Notion's P4 (name field, then AI suggestions, then a searched
   format list) agree that the **format list is searched**, and disagree on what precedes it. Since
   this packet has not built any add-property picker yet (`design-trueup.md`'s "Values that change"
   for A5 is the standing target), there is no landed ruling to protect; Anytype's ordering is still
   the one on record until an operator says otherwise.

---

## 6. Open questions for the research loop

- Should the record sheet's hidden-properties group grow a **per-row eye toggle** (independent of the
  view's own column-visibility config) to match P3's richness, given the column-manager already has
  the row primitive (`buildCheckboxPropertyRow`) to build it from? This is new evidence against a
  closed ruling (A4) — needs an operator call, not an inference from this document.
- Is a **"Deleted properties"** (soft-delete/trash) tier for record properties in scope anywhere in
  this program, or does it collide with `045`'s card-hiding mechanism (goal.md D5)?
- Does `054` or `051` own deciding whether the record sheet ever grows a **cover/icon picker** (P5)?
  Today neither packet's file group claims it; the gap is real but unowned.
- `d9d61160` (the "Paragraph / Bullets / One-liner" sheet inside the add-property flow) could not be
  read with confidence from its crop alone — worth a second pass with the flow's neighbouring screens
  if the AI-Autofill output-style question becomes relevant.
- Three comment surfaces (P6) were read with no current owner named in `054`'s scope. Whichever
  packet eventually specs comments should decide up front whether it means the page-level thread, the
  inline composer, the discussions panel, or (per Notion's own evidence) some combination — not
  "comments" as a single undifferentiated feature.
- The `property-editor` and `relation` query folders returned mostly off-topic screens in this sample
  (§1); if a future pass needs a genuine per-format value-editor comparison for Notion (the S9
  equivalent `design-trueup.md` built for Anytype), it will need a differently-targeted query set —
  these two as harvested do not carry that evidence.
