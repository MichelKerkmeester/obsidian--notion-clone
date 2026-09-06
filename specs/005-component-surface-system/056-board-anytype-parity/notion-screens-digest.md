---
title: "Notion Screens Digest: The Kanban Board View"
description: "A read of the Notion Mobbin harvest against the board surface — columns, column headers, cards, card properties, add-card, group menus, drag, page scrolling, sticky scrollbar, phone board — with the patterns it shows, where our current (Anytype-shaped) build diverges, and where Notion and Anytype disagree."
date: 2026-09-06
surface: "kanban board view (columns, column headers, cards, card properties, add-card, group menus, drag, page scrolling, sticky scrollbar, phone board)"
phase: "005-component-surface-system/056-board-anytype-parity"
---
# Notion Screens Digest: The Kanban Board View

> This is a supplementary read of the Notion harvest, run against the board surface `056`'s own
> `design-trueup.md` already trued up to Anytype. It does not re-open `056`'s ruling — `../goal.md`
> D3 makes parity with Anytype the default, and this document's job is to name where Notion agrees,
> where it refines, and where the two references disagree, never to substitute one silently for the
> other.

---

## 1. Selection

**32 unique screens read** (by Mobbin screen id), from `screenshots/notion/{ios,web}/`:

- `ios/views/` — 5 (`notion-board`/`kanban` files)
- `ios/database/` — 5 (`group-by-*`)
- `ios/flows/changing-layout/` — 5
- `ios/flows/group/` — 2 new ids (a third id duplicates `database/group-by-13`)
- `ios/flows/group-2/` — 3 new ids
- `ios/flows/grouping-a-database/` — 2 new ids (two ids duplicate `group`/`database/group-by`)
- `ios/flows/switching-to-board-layout/` — 1 new id (three ids duplicate `ios/views/`)
- `ios/flows/view-options/` — 2 new ids (one id duplicates `changing-layout-01`)
- `web/views/` — 3
- `web/database/` — 1
- `web/flows/grouping-database-entries/` — 3

The hint folders (`views/*board*`, `views/*kanban*`, `flows/switching-to-board-layout`,
`flows/group*`, `flows/grouping-a-database`, `flows/changing-layout`, `database/*group*`) returned
every direct board/kanban file that exists under those names — confirmed by grepping the full
per-file index for the literal queries `` `Notion board view` `` and `` `Notion kanban board` ``,
which return exactly 8 rows total (5 iOS, 3 web) across the *entire* 3647-file index, all already
filed under `views/`. The widened grep (query words `group by`, `group`, `layout`, `view options`)
added the remaining 24 unique ids.

**Skipped as near-duplicate (same screen id already read under another path):**
`ios/flows/switching-to-board-layout/-02/-03/-04` (= `ios/views/notion-ios-views-board-{03,01,04}`),
`ios/flows/group-2/-01` and `ios/flows/view-options/-02` (both = `ios/flows/changing-layout/-01`,
id `794591f5`), `ios/flows/group/-03` (= `ios/database/group-by-13`, id `c3125904`),
`ios/flows/grouping-a-database/-01` (= `ios/flows/group/-02`, id `6c740ed6`),
`ios/flows/grouping-a-database/-03` (= `ios/database/group-by-07`, id `b4e4ca0d`), and
`ios/flows/group-2/-04` (near-identical restate of `-03`, same sub-group panel with two rows
swapped between visible/hidden).

**Skipped as off-topic** (the query surfaced a real Notion screen, but not this surface — the
README's own caveat that "the group is the query, not a verified reading" holds here too):
`ios/database/group-by-03` (a plain block-list page, "Weekly Plan"), `group-by-11` (a database row
opened full-page, not the board), `group-by-12` ("Offline pages" list), `ios/flows/view-options-01`
(a table cell being edited, keyboard open), `web/views/kanban-02` (a **Gallery** view of the same
dataset, not board — the tab reads "Gallery"), and `web/database/group-by-01` (a **Table** view
with a bar chart above it, not board).

No dark-theme board or kanban screen exists anywhere in the 3647-file index for either platform —
every one of the 8 direct `views/board`/`views/kanban` files, and every flow/database file that
resolves to the board surface, renders in light theme. This is a genuine gap in the harvest, not a
selection choice, and it means every colour value below is light-theme only. It also means the
capture set never shows a populated board past 2-3 records per column, so page-limit behaviour past
the limit and a genuinely empty column are both unseen here, the same two gaps `056`'s own
Anytype true-up records independently (`design-trueup.md` §9, items 4 and 5).

---

## 2. Per-screen table

| Screen id | Platform | Theme | Path | Mobbin | Content | Measured / observed |
|---|---|---|---|---|---|---|
| `71f9dba2` | iOS | light | `ios/views/notion-ios-views-board-01-...webp` | [screen](https://mobbin.com/screens/71f9dba2-130f-406e-b4fe-781f227f51b8) | Board, "Need to do" database, "Not started" column full, "In prog..." column edge visible | Column header: grey filled pill "Not started" + count "3" + always-visible `···`+`+`; cards are plain rounded rows, one line of text each ("Monday"/"Tuesday"/"Wednesday"), no visible property rows; "+ New page" plain-text link, no box, left-aligned, below the last card |
| `9d7ffd05` | iOS | light | `ios/views/notion-ios-views-board-03-...webp` | [screen](https://mobbin.com/screens/9d7ffd05-6eaa-4e65-954c-e0e09c99b577) | The board's "Layout" sheet, Board tile selected | Toggles: Show data source title, Show page icon, Wrap all content, **Group by → Status**, **Color columns (on)**, Open pages in → Side peek, **Load limit → 25**, Card preview → None, Card size → Medium |
| `c9d34319` | iOS | light | `ios/views/notion-ios-views-board-04-...webp` | [screen](https://mobbin.com/screens/c9d34319-8700-442b-8806-2f2fcb475034) | Board mid-scroll/loading — "Done" column, count "0", cards rendered as empty grey placeholder boxes | Confirms the column header carries label + count + `···` + `+` together, all always-visible on phone; card placeholders are plain rounded rectangles with no border colour sampled (loading state) |
| `efc302e8` | iOS | light | `ios/views/notion-ios-views-kanban-01-...webp` | [screen](https://mobbin.com/screens/efc302e8-36bc-4dc5-aa8b-675376875b16) | Same board, further mid-scroll/loading state | Same empty-card-placeholder pattern; "Monday" label bleeding in at the very bottom edge |
| `e1897baf` | iOS | light | `ios/views/notion-ios-views-kanban-02-...webp` | [screen](https://mobbin.com/screens/e1897baf-cdc7-4a5b-920a-8dcef731a495) | Same board, another mid-scroll/loading frame | Same pattern; confirms this is a transient loading state, not a designed empty-card treatment |
| `98dde396` | web | light | `web/views/notion-web-views-board-01-...webp` | [screen](https://mobbin.com/screens/98dde396-5c07-422d-a99c-885c83220249) | "Team" database, Board tab active, 3 columns ("Not started·1", "Contract·1", "Full-time·2"), "Property visibility" side panel open | Column header: **coloured dot + plain-text label (not coloured) + plain-text count**, no border, no fill, no chip container; no `···`/`+` visible at rest (hover state not captured); cards: white, rounded, bordered, title bold, property rows below with per-type icon (avatar for person, plain text for formula/date), select values as filled colour pills; "+ New page" plain-text link, no box, left-aligned |
| `69f98d1d` | web | light | `web/views/notion-web-views-kanban-01-...webp` | [screen](https://mobbin.com/screens/69f98d1d-b556-4a33-90f4-a0e98b6b9032) | Same board, "Property visibility" panel with a different property order (Person before Role) | Same header/card/add-row geometry as `98dde396`; near-duplicate content, kept for the panel-order difference only |
| `b4e4ca0d` | iOS | light | `ios/database/notion-ios-database-group-by-07-...webp` | [screen](https://mobbin.com/screens/b4e4ca0d-add7-432e-a61c-e127243d086e) | The database "Settings" sheet (opened from the view's `···`) | Rows: Layout → Table, **Property visibility → 3**, Filter, Sort, **Group → Title**, Conditional color, Copy link to view, then a "Data source settings" section (Edit properties, Automations, AI Autofill, More settings) |
| `c3125904` | iOS | light | `ios/database/notion-ios-database-group-by-13-...webp` | [screen](https://mobbin.com/screens/c3125904-93f8-4a92-b022-a7f85d4ef4d9) | The "Group" entry sheet reached from Settings → Group | Two rows only: "Group by ›" and "Learn about grouping" — the entry point is minimal, the property picker is a second sheet |
| `794591f5` | iOS | light | `ios/flows/changing-layout/notion-ios-flow-changing-layout-01-...webp` | [screen](https://mobbin.com/screens/794591f5-f9b6-4416-8c0c-bea36a0e1e65) | "View options" sheet, opened from the "New ▾" toolbar area | Rows: View name field, Layout → Table, Properties → 2 shown, Filter → None, Sort → None, Group → None, Automations → None, then admin rows (Customize, Lock database, Copy link, Duplicate view) |
| `888fb63c` | iOS | light | `ios/flows/changing-layout/-02-...webp` | [screen](https://mobbin.com/screens/888fb63c-bf82-4c5d-9eba-5286c404f9bf) | The Layout sheet with **Table** selected | View-type grid (Table/Board/Timeline/Calendar/List/Gallery/Chart), then Table-specific toggles: Show vertical lines, Wrap all columns, Open pages in, Show page icon — **no Group/Card fields on this tile**, confirming they are Board-specific |
| `2050ac3d` | iOS | light | `ios/flows/changing-layout/-03-...webp` | [screen](https://mobbin.com/screens/2050ac3d-9bf7-4140-a0ba-9220aa768f85) | The Layout sheet with **Board** selected, a second capture of the same sheet as `9d7ffd05` | Same view-type grid; Board toggles in this capture: Card preview → None, Card size → Medium, Wrap all properties (on), Group by → Status, Color columns (off), Open pages in → Side peek, Show page icon (on) — order and presence differ slightly from `9d7ffd05`, which also shows "Show data source title", "Wrap all content" and "Load limit" |
| `7d30bac2` | iOS | light | `ios/flows/changing-layout/-04-...webp` | [screen](https://mobbin.com/screens/7d30bac2-28fb-4629-8fa0-e4cd46e38547) | A **Table** view, "Today Notes", grouped by status, with a "Hidden gr[oups]" panel sliding in from the right | Group header row: "Not started" + count "2" + `···` + `+`, same shape as the board's own header; the right panel begins listing "In prog[ress]" and "Done" as hidden groups |
| `cbc934dc` | iOS | light | `ios/flows/changing-layout/-05-...webp` | [screen](https://mobbin.com/screens/cbc934dc-941f-4364-baff-3fa2293981d5) | The same "Hidden groups" panel, fully open | "In progress · 0" and "Done · 0" listed under "Hidden groups", the visible groups scrolled off to the left |
| `52348672` | iOS | light | `ios/flows/group/notion-ios-flow-group-01-...webp` | [screen](https://mobbin.com/screens/52348672-5d4a-4133-8ffb-f1845d73f826) | Same "Settings" sheet as `b4e4ca0d` (different screen id, identical layout) | Confirms Settings → Group is the entry point on this dataset too |
| `6c740ed6` | iOS | light | `ios/flows/group/-02-...webp` | [screen](https://mobbin.com/screens/6c740ed6-969e-427c-828d-00b779664287) | The **Group by** property picker | Search field, then "None ✓", "Title", "Column 1", "Column 2" — a flat list with a trailing checkmark on the active row, no property-type icons shown here |
| `65ed2da3` | iOS | light | `ios/flows/group-2/-02-...webp` | [screen](https://mobbin.com/screens/65ed2da3-9441-47bd-8b7c-744fbf76188a) | The **Sub-group by** property picker | Same list shape as Group by, but a second, independent grouping axis: "None ✓", "Activity", "Rate", "Status" |
| `30ba5533` | iOS | light | `ios/flows/group-2/-03-...webp` | [screen](https://mobbin.com/screens/30ba5533-609c-4dff-acda-afd85694fb9c) | The **Sub-group** management screen | Sub-group by → Activity, Text by → Exact, Sort → Alphabetical, **Hide empty groups (on)**, "Visible groups" (Breakfast, Run — each with an eye icon) + "Hide all", "Hidden groups" (No Activity) + "Show all", "Remove grouping" |
| `f6d1e7e6` | iOS | light | `ios/flows/group-2/-04-...webp` | [screen](https://mobbin.com/screens/f6d1e7e6-b047-445c-bfcb-260d156af71d) | The same panel after toggling one group's visibility | "Run" now the only visible group; "No Activity" and "Breakfast" both hidden — confirms the eye icon is a live per-group toggle, not decorative |
| `e9698e1b` | iOS | light | `ios/flows/grouping-a-database/-02-...webp` | [screen](https://mobbin.com/screens/e9698e1b-5bfb-4588-b07f-343900daf469) | The primary **Group** management screen (not sub-group) | Group by → Title, Text by → Exact, Sort → Alphabetical, Hide empty groups (on), "Groups" list: Monday/Tuesday/Wednesday (visible, eye icon) + "No Title" (hidden, eye-off, greyed) — **each row carries a `⁚⁚` drag handle at its left edge**, so groups are manually reorderable from this screen |
| `7040ffad` | iOS | light | `ios/flows/grouping-a-database/-04-...webp` | [screen](https://mobbin.com/screens/7040ffad-073f-42ee-abd1-a0ff41a7dfad) | A **Table** view, grouped, rows visible under each group | Group header: a disclosure triangle + label + `···` + `+`, matching the board's column-header affordance set even though this is Table, not Board |
| `320f03de` | iOS | light | `ios/flows/switching-to-board-layout/-01-...webp` | [screen](https://mobbin.com/screens/320f03de-6340-4a6a-ad48-f38383f18c58) | The Layout sheet, **before** switching — Table selected | Table-specific toggles only (Show data source title, Show vertical lines, Show page icon, Wrap all content off, Open pages in, **Load limit → 50**) — the "before" state that the flow's other 3 frames (already read as `71f9dba2`/`9d7ffd05`/`c9d34319`) switch away from |
| `213f8a7c` | iOS | light | `ios/flows/view-options/-01-...webp` | [screen](https://mobbin.com/screens/213f8a7c-6c38-4b4e-9daa-b9cff99cdec2) | A Table cell being edited inline, keyboard open | Off-topic for the board surface; kept only to record why it was opened (the "View options" flow query) and dropped from the pattern analysis |
| `e4dfff31` | iOS | light | `ios/flows/view-options/-03-...webp` | [screen](https://mobbin.com/screens/e4dfff31-b1da-4d5a-8e36-b33ea9c54e96) | The same "View options" sheet as `794591f5`, keyboard open behind it | Confirms the sheet's row list is stable across captures; no new information |
| `56e2ae1a` | web | light | `web/flows/grouping-database-entries/-01-...webp` | [screen](https://mobbin.com/screens/56e2ae1a-d9aa-46cd-96b4-4c6c3a17ab35) | Web "View options" **side panel** (not a floating menu), Table view | Layout → Table, Properties → 4 shown, Filter, Sort, Group, Sub-items, Dependencies, Automations, then Lock database / Copy link / Duplicate view / Delete view — the panel opens anchored to the right of the toolbar's `···`, not as a dropdown |
| `8c76f76d` | web | light | `web/flows/grouping-database-entries/-02-...webp` | [screen](https://mobbin.com/screens/8c76f76d-188d-4a78-9a2e-1654b9d0ff4c) | The web **Group by** picker, same side-panel pattern | Back arrow, search field, "None ✓", then Name / Date / User characteristics — same list shape as the phone's own Group by sheet |
| `2ef31bd5` | web | light | `web/flows/grouping-database-entries/-03-...webp` | [screen](https://mobbin.com/screens/2ef31bd5-1e16-4d2b-80dc-b0b87974d979) | The web **Group management** panel, grouped by Date | Group by → Date, Date by → Relative, Sort → Oldest first, Hide empty groups (on), "Visible groups" (Last 7 days/Today/Next 7 days, each with an eye icon) + "Hide all", "Hidden groups" (No Date) + "Show all", "Remove grouping" — identical structure to the phone's own management screen, one screen wider |
| `935b4300` | web | light | `web/database/notion-web-database-group-by-01-...webp` | [screen](https://mobbin.com/screens/935b4300-77d3-47f8-aa2e-5277e745d7ec) | A **Table** view with a bar chart above it, not Board | Off-topic for this surface (kept in the index list, excluded from pattern analysis) |
| `0bd76f5f` | web | light | `web/views/notion-web-views-kanban-02-...webp` | [screen](https://mobbin.com/screens/0bd76f5f-9281-4d76-933e-cafe385ef965) | A **Gallery** view of the same "Team" dataset, image cards | Off-topic — the query "Notion kanban board" surfaced a Gallery screen; the README's own relevance caveat (§ Layout) predicted exactly this |

---

## 3. Patterns

Ordered by how much of the surface they define.

### P1 — The column header is label + count together, always, on both platforms

Every board capture that shows a header at rest (`71f9dba2`, `c9d34319`, `98dde396`, `69f98d1d`)
carries a **count beside the label**, unconditionally. Web renders it as a coloured dot plus a
plain-text label plus a plain-text count, no border, no fill, no pill. iOS renders it as a filled
grey pill holding label-plus-count together, with `···` and `+` **also always visible**, not
hover-revealed. No board capture on either platform shows a header with the count suppressed.
Table's own group header (`7d30bac2`, `7040ffad`) uses the same label+count+`···`+`+` shape, so
this is a database-wide convention, not something Board alone does.

### P2 — Group management is a dedicated screen, not a per-column menu

Four screens (`30ba5533`, `f6d1e7e6`, `e9698e1b`, `2ef31bd5`) show the same structure on both
platforms: a "Hide empty groups" toggle, a "Visible groups" list with a per-group eye icon and a
"Hide all" bulk action, a "Hidden groups" list with "Show all", and "Remove grouping" at the
bottom. `e9698e1b` additionally shows a `⁚⁚` drag handle on every group row, making manual
reordering a first-class action from this same screen. This is one screen that governs every
group's visibility and order at once, reached via Settings → Group (phone, `c3125904`/`6c740ed6`)
or the side-panel's Group row (web, `8c76f76d`/`2ef31bd5`).

### P3 — Sub-grouping is a second, independent axis

`65ed2da3` and `30ba5533` show "Sub-group by" as a wholly separate property picker and management
screen from "Group by" — a two-level grouping the flat kanban strip does not otherwise imply. Every
board capture in this set (`71f9dba2`, `98dde396`, etc.) still shows a single flat row of columns,
so sub-grouping is a Table-view feature demonstrated on this dataset, not something seen applied to
the board itself in any capture here.

### P4 — The "+ New" row is a bare text link, not a bordered control

`71f9dba2` and `98dde396` both show "+ New page" as plain, left-aligned text directly below the
last card — no border, no fixed-height box, no background. It sits in the same position (bottom of
the column) that `056`'s Anytype read also settled on (`design-trueup.md` §5 C4), but the visual
weight is much lighter than Anytype's bordered 42px box.

### P5 — Card property rows carry small leading icons for several types

`98dde396`/`69f98d1d` show a circular avatar before a Person value, and plain text (no icon) for
Formula and Date values; select values render as filled colour pills. This is a partial departure
from Anytype's "values only, uniform text, no icons except relation" rule (`design-trueup.md` A4).

### P6 — The board and table Layout sheets are one shared settings surface

`888fb63c` (Table) and `2050ac3d`/`9d7ffd05` (Board) are the same sheet with a different tile
selected; switching tiles swaps the option rows below the grid but keeps the same sheet chrome
(view-type grid, "Done" button, "Learn about views" footer). "Group by" and "Color columns" appear
only once the Board tile is active — they are Board-specific options within one shared sheet, not a
separate Board settings surface.

### P7 — The board scrolls a database whose entries are databases, not blocks

No board capture in this set is dense enough to show scrolling of any kind — every column tops out
at 2-3 records, and no capture shows a partially-scrolled column or the page under a fixed header.
Page scrolling, per-column scrolling and the sticky scrollbar are all **unmeasurable from this
capture set** — see § 6.

---

## 4. Divergences from our surface

Our current implementation already carries the Anytype rebuild (`src/views/board-renderer.ts`,
`styles.css`), not the retired `pm-kanban-*` port `056`'s own `design-trueup.md` measured against.
Every citation below is against the code as it stands now, at `4294770d`.

**Column header (P1).** Ours renders the option name inside a 24px, border-radius-12px, 1px-bordered
chip with the option colour as *text* (`styles.css:9404-9419`), and the record count only in touch
mode, plain text beside the chip, never on desktop (`board-renderer.ts:267-269`,
`styles.css:9461-9464`); the `···`/`+` pair is opacity-0 until hover or focus-within on
non-touch (`styles.css:9421-9437`). This matches Anytype (`design-trueup.md` A1: "no record count
anywhere on the desktop board", hover-only controls) and diverges from Notion's P1 — Notion shows
the count unconditionally on both platforms, and iOS shows `···`/`+` unconditionally too. Per D3,
Notion's always-visible count is not adopted; it is named here as a live disagreement, not folded
in silently.

**Group menu (P2).** Ours is a single floating menu — Sort Ascending, Sort Descending, a separator,
Collapse Group, Hide Column, Delete Group (`board-renderer.ts:514-536`) — opened per-column from the
same hover-revealed `···` as P1. There is no dedicated group-management screen, no per-group
visible/hidden list with bulk Hide-all/Show-all, and no drag-handle reordering of groups from a
menu (columns can still be dragged directly on the board). Anytype's own captured column menu is
closer to ours in shape — a single "Hide Column" toggle plus a colour-disc row, no bulk actions, no
per-group list (`design-trueup.md` §2b, the iOS sheet crawl) — so this is a case where **Notion
diverges from both Anytype and us in the same direction**, offering materially more group-management
surface than either reference.

**Sub-grouping (P3).** Not present in our schema or renderer at all — `board-renderer.ts` groups by
exactly one field (`groupField` is singular throughout `renderBoardColumn`). Anytype's own kanban
has no sub-grouping either (`design-trueup.md` §7, "Swimlanes: None. Anytype's kanban is a flat
strip of columns"). Notion's P3 is therefore a feature neither reference we are bound to shows on
the board itself; per D3/D6 it is not a gap to close.

**Add-card control (P4).** Ours is a bordered 246×42px box on desktop with a bare 14×14px `+`
centred, and a labelled 44px-minimum row on touch (`styles.css:9616-9656`,
`board-renderer.ts:309-315`) — this is Anytype's own shape (`design-trueup.md` A5), not Notion's
bare-text link. The two references disagree here (see § 5); ours currently follows Anytype, as D3
requires by default.

**Card property icons (P5).** Ours hides the property label and shows the value in plain secondary
text for every field type except a checkbox, which keeps its label beside the glyph
(`styles.css:9583-9589`); there is no per-type leading icon on a Person or Date value the way
Notion's avatar-before-name row shows. This matches Anytype's own read exactly
(`design-trueup.md` A4: "Values only, no labels... Relations render as a 16px icon plus the object
title", i.e. only relations carry a leading icon) and is a case where Notion refines past Anytype in
a way this packet's D3 does not ask us to follow.

**Load/page limit (P6-adjacent).** Ours fixes the kanban page limit at 10, distinct from every other
layout's default (`board-renderer.ts:291-294`, `291`: *"the kanban page limit is 10, distinct from
every other layout's own default"*), matching Anytype's own per-layout figure
(`design-trueup.md` A13, `053` D4). Notion's captures show materially higher, view-specific numbers
(25 for Board in `9d7ffd05`, 50 for Table in `320f03de`) — the mechanism (a per-view limit) agrees
across all three; the magnitude does not, and Anytype's lower number is what we ship.

**Page scrolling (P7, and independent of Notion).** `styles.css:9466-9469` still gives
`.db-kanban-cards` `overflow-y: auto`, so each column remains its own vertical scroll container, and
`.db-kanban-view` (`styles.css:9342-9351`) still carries `overflow: hidden` with `height: 100%`, so
the page itself cannot scroll in its place. This is `../goal.md`'s own third amendment criterion,
already red on the operator's 0.0.29 report, independent of anything in this Notion read — the
Notion captures cannot confirm or deny it either way (§ 6), so this digest neither closes nor
reopens that criterion.

---

## 5. Anytype vs Notion, where the two disagree

Naming each disagreement rather than resolving it, per `../goal.md`'s binding: *"Where the two
disagree the true-up wins... never silently."* `050` ADR-003 makes Anytype's true-up the design read
of record; nothing below reopens that.

- **Column header count.** Anytype: none on desktop, present on phone only, plain text
  (`design-trueup.md` A1). Notion: present on both platforms, unconditionally (P1). **Anytype's
  ruling stands** — our header already matches it (§ 4).
- **`···`/`+` visibility.** Anytype: hover-only on desktop, permanent on phone (A1). Notion: iOS
  shows both permanently even in the same at-rest header (`71f9dba2`, `c9d34319`); web's hover state
  was not captured, so web cannot be compared. **Anytype's ruling stands** for desktop; phone already
  agrees on both references.
- **Group management depth.** Anytype: one toggle, "Hide Column", per column, no bulk actions, no
  dedicated group-list screen (`design-trueup.md` §2b). Notion: a full management screen with
  per-group visibility, hide-all/show-all, drag-handle reorder and "Remove grouping" (P2). **Neither
  reference is closer to ours than the other is far from it** — this is flagged for the operator
  rather than folded in, since D3's parity-by-default logic has no Notion clause to invoke here.
- **Sub-grouping.** Anytype: explicitly none (§7, "Swimlanes: None"). Notion: a full second grouping
  axis (P3). **Anytype's absence stands** — D6 already treats an extension with no Anytype
  counterpart as retire-or-fold, and sub-grouping was never part of our schema to begin with.
- **Add-card control weight.** Anytype: a bordered 246×42px box, bare `+` (A5). Notion: a bare text
  link, no box (P4). **Anytype's ruling stands** — ours already ships the bordered box (§ 4).
- **Card property icons.** Anytype: values only, no icon except on a relation (A4). Notion: an
  avatar or type icon on several property types (P5). **Anytype's ruling stands** — ours already
  ships icon-free rows outside relations (§ 4).
- **Page limit magnitude.** Anytype: 10 for kanban specifically (A13). Notion: 25 (board) / 50
  (table) in these captures. **Anytype's number stands** — ours already ships 10 (§ 4).

---

## 6. Open questions for the research loop

1. **No dark-theme board or kanban capture exists in the Notion harvest, on either platform.** Every
   colour and contrast comparison this digest could otherwise make is unavailable; if a dark-theme
   Notion board read is ever wanted, it needs a fresh Mobbin query, not a re-read of this set.
2. **No capture in this set is dense enough to show a scrolled board, a partially-visible page
   header while scrolled, or a sticky scrollbar of any kind.** § 4's "Page scrolling" divergence is
   `../goal.md`'s own criterion and stays open on its own evidence, not this digest's.
3. **Whether the web board's `···`/`+` pair is hover-only like iOS's or something else** is
   unanswered — no web capture in the harvest catches a column mid-hover the way
   `anytype-menu-kanban-column-menu-dark-full.png` does for Anytype. A targeted Mobbin flow query for
   "Notion board column menu" or similar, if one exists, was not tried here.
4. **Whether Notion's board ever renders sub-grouped columns (a swimlane-shaped board)** is
   unanswered — `65ed2da3`/`30ba5533` demonstrate sub-grouping only on a Table view of the same
   dataset. If the operator ever asks whether our board should gain a swimlane mode, this is the gap
   that would need closing first, on either reference.
5. **Whether Notion's group-management screen (P2) is worth a Notion-sourced refinement on top of
   Anytype parity** — bulk hide/show and drag-handle reorder are both real usability gains over a
   single "Hide Column" toggle — is a question for the operator, not a decision this digest makes;
   D3 gives accessibility as the only ground for declining a measured Anytype value, and adding
   *more* than Anytype shows is a different kind of change than declining what it shows.
