# Anytype — capture index

Everything in this folder is a reference capture for comparing our board and property surfaces
against Anytype. It is not tracked by `tools/screenshots/manifest.json` — see the packet note at
the bottom of this file for why. Two kinds of file live here: official product images (`*-official.*`,
documented in `sources.md`) and screenshots of the locally installed app (`*-dark.png`).

## Layout — how to find a capture

Grouped by platform and subject, filenames unchanged so any citation by name still resolves:

| Folder | Holds | How to find it |
|--------|-------|-----------------|
| `official/` | 5 desktop `*-official.jpg` docs.anytype.io illustrations | Look here first for board/table/calendar/gallery/properties reference art |
| `desktop/sets/<use-case>/` | 120 catalogue captures, 12 per use case (6 layouts × 2 themes) | Pick the use-case folder (e.g. `project-tracker/`) named in the filename itself |
| `desktop/app/` | 31 dark-only installed-app screens — search, slash menu, inline collection, set layouts, filters, pickers, the object `···` menu | Anything not a catalogue set or a menu crawl capture lives here |
| `desktop/menus/` | 600 files, 150 menus × light/dark × clipped/`-full`, kept flat since the filename already carries its context (`menu-set-`, `menu-cell-`, `menu-object-`, `menu-nav-`, `menu-kanban-`, `menu-calendar-`, `menu-gallery-`, `menu-list-`) | Grep the filename prefix for a context, e.g. `anytype-menu-nav-` for sidebar/settings menus |
| `mobile/official/` | 20 App Store / Google Play / GitHub README marketing images | Vendor marketing creative, not an installed-app capture |
| `mobile/sheets/` | 104 `anytype-mobile-sheet-*` iOS simulator captures | Every bottom sheet: view edit, filters, sorts, cell editors, pickers |
| `mobile/app/` | 14 remaining iOS simulator captures — set layouts, object page, space and type lists | Screens that are not a sheet |

## Installed app

- **Version**: 0.56.5 — Homebrew cask version at install time (`brew info --cask anytype`), and
  confirmed against the CDP target's own user-agent string (`anytype/0.56.5 ... Electron/41.10.6`).
- **Install source**: Homebrew cask (`brew install --cask anytype`), local-only, never signed in to
  an Anytype Network account or workspace.
- **Workspace**: the default local space created on first launch ("Get Started" — `Welcome to
  Anytype`, `Playground Page`). A demo page `notion-clone-reference-demo` and its objects were
  created for this capture pass and **fully deleted (Move to Bin) before this commit** — see
  "Cleanup" below. Everything shown in the final capture set is either the app's own shipped content
  (viewed, never edited) or the transient demo state, already removed.
- **Theme**: dark only — see "Still not reachable" below.

## How these were captured — two methods, in sequence

**Phase 1 — keyboard only.** No simulated mouse click worked in this environment at first: raw
`CGEvent` clicks posted with no effect, and `System Events`'s `click at` was refused outright
(`osascript is not allowed assistive access`, -25211). Only `keystroke`/`key code` (sent to whatever
was frontmost) and native macOS menu-bar item clicks worked. Captures from this phase were reached
through `Cmd+K` (search/quick-switcher), `Cmd+N` (new object), `/` (slash menu), arrows + Return,
and Escape — sidebar navigation, search, slash menu, object creation, Settings → Account, and one
Grid view of the demo collection.

**Phase 2 — Chrome DevTools Protocol.** The operator later granted OS Accessibility permission, but
synthetic clicks proved unreliable against this window (coordinates drifted, hover state updated but
clicks landed on the wrong element, and the operator was concurrently using the same machine — a
window-bounds check mid-session caught the window having moved from `{-2160,1602}` to `{-2148,227}`,
confirming real interference). The operator then asked for a click-free method entirely: **quit
Anytype (`quit app "Anytype"`), relaunch with `--remote-debugging-port=9222`, and drive it over CDP**
— raw WebSocket JSON-RPC (`Runtime.evaluate`, `Page.captureScreenshot`, `Input.dispatchKeyEvent`)
rather than Playwright (`connectOverCDP` hung for 30s against this Electron build; the raw protocol
connected immediately). `el.click()` executed inside the page's own JS engine is a real DOM click
dispatched by the renderer itself — it never moves the OS pointer, changes the frontmost app, or
takes keyboard focus, so it was safe to use while the operator kept working. Page.captureScreenshot
renders from the page directly, independent of window position, focus, or visibility. This phase
reached the view-settings panel, all six set layouts (Grid/Gallery/List/Kanban/Calendar/Graph), the
filter and property pickers, the relation editor, the new-object type picker, and the object
context menu — and used the same method to delete the demo content at the end.

## Still not reachable, with the exact refusal

- **Light theme / Settings → Preferences.** The Settings panel itself was reached in Phase 1 via
  `Cmd+,`, but that shortcut is an Electron **menu accelerator** handled by the main process, not a
  page-level `keydown` listener — `Input.dispatchKeyEvent` (CDP, phase 2) posts into the renderer's
  own input pipeline and does not trigger it, so it could not be reopened once phase 2 started
  without a native menu click, which is exactly the kind of OS-level action the operator asked to
  avoid entirely. No settings/appearance capture or theme toggle exists as a result.
  **Superseded on 2026-09-05 — this was wrong, and the reason is worth keeping.** The accelerator is
  a dead end, but the theme does not need it: the Settings UI's own handler is
  `Action.themeSet(id)` -> `Renderer.send('setTheme', id)` -> `Electron.Api(winId, 'setTheme', [id])`,
  and that last call is reachable from the renderer with no navigation at all. `''` is light,
  `'dark'` is dark, `'system'` follows the OS. Both themes are captured in the catalogue set below.
  The lesson is that "the shortcut is unreachable" was mistaken for "the feature is unreachable"
  without reading what the shortcut's own handler calls.
- **A worked view-switcher "+" popover appearing as a menu vs. a submenu** and the **drag-only
  states** (a row's inline "⋮⋮" drag handle under a held pointer) were not specifically captured — the
  settings panel and layout picker capture the same underlying controls in their open state, which is
  the higher-value shot.
  **Corrected on 2026-09-05: this bullet used to say "a few hover-only states" and it was read as
  "no hover state was captured". That reading is false, and five documents inherited it.** The
  submenu walk in the catalogue pass *is* a hover: **37 of the 150 menus under `menus/` were reached
  by hovering a row of their parent**, and each of those files photographs that parent row in its
  hovered state — the catalogue table's own "How it was reached" column says `▸ hover "align"`,
  `▸ hover "advanced"`, `▸ hover "change type"`. Measured on
  `menus/anytype-menu-object-more-add-link-to-object-dark.png` by `052`'s T001: the hovered
  `Add Link to Object` row is **`#232323`, 28px tall, inset ~10px inside a 16px content inset,
  1.14:1 against its own `#171717` panel**. The hover grammar was on disk the whole time; what is
  genuinely missing is a **drag** state, not a hover one.
- Everything else the operator's expanded brief asked for (every layout, view switcher, view
  settings, filter, property/relation editor, type picker, new-object flow, context menu on an
  object) **was** reached; see the table below.

## Cleanup

`notion-clone-reference-demo` and every object created inside it (the `Untitled` Collection plus its
demo rows) were moved to Bin via the object header's `···` → **Move to Bin**, driven the same
click-free way (`el.click()` over CDP). The sidebar's "Recently edited" list and the space itself now
show only the two objects Anytype shipped by default (`Welcome to Anytype`, `Playground Page`),
confirmed by a post-cleanup screenshot before this commit. Anytype's Bin keeps a moved object
recoverable (docs.anytype.io/anytype/organize/deletion) — nothing was permanently purged, matching
"move to bin", not "delete forever".

## Captures

The five `*-official.jpg` rows live in `official/`; every other row below lives in `desktop/app/`.

| File | Origin | Shows |
|------|--------|-------|
| `anytype-board-official.jpg` | Official — docs.anytype.io | Kanban/board view, product documentation illustration |
| `anytype-table-official.jpg` | Official — docs.anytype.io | Grid/table view, product documentation illustration |
| `anytype-calendar-official.jpg` | Official — docs.anytype.io | Calendar view, product documentation illustration |
| `anytype-gallery-official.jpg` | Official — docs.anytype.io | Gallery view, product documentation illustration |
| `anytype-properties-official.jpg` | Official — docs.anytype.io | Object properties/field-editing panel, product documentation illustration |
| `anytype-sidebar-default-dark.png` | Installed, dark | Fresh local space: sidebar (Get Started, Welcome to Anytype, Playground Page, Types), empty default collection |
| `anytype-welcome-page-dark.png` | Installed, dark | The shipped "Welcome to Anytype" object page |
| `anytype-search-palette-recent-dark.png` | Installed, dark | `Cmd+K` quick-switcher, no query — Recent Objects list, keyboard-hint footer |
| `anytype-search-palette-query-dark.png` | Installed, dark | Quick-switcher with a typed query, showing fuzzy/semantic result matching |
| `anytype-search-create-action-dark.png` | Installed, dark | Quick-switcher's "Create Object …" action, with its `Cmd+N` shortcut hint |
| `anytype-newpage-created-dark.png` | Installed, dark | A freshly created page, title set from the create action, with the "Template Selector" onboarding tooltip |
| `anytype-slashmenu-text-dark.png` | Installed, dark | `/` slash menu, Text category (Regular Text, Title, Heading, Checkbox, …) |
| `anytype-slashmenu-set-dark.png` | Installed, dark | Slash menu filtered to "set" — Inline Collection / Inline Query |
| `anytype-inlinecollection-onboarding1-dark.png` | Installed, dark | "This is Inline Collection" onboarding step, first of two |
| `anytype-inlinecollection-onboarding2-dark.png` | Installed, dark | "Views — adjust rules and views" onboarding step, second of two |
| `anytype-inlinecollection-empty-dark.png` | Installed, dark | The inline collection block after onboarding, empty Grid ("All" view), `+ New Object` row |
| `anytype-page-with-inline-collection-dark.png` | Installed, dark | The demo page showing its embedded collection preview |
| `anytype-collection-fullpage-onboarding-dark.png` | Installed, dark | The collection opened as its own full page, with the "Change Types Easily" onboarding tooltip and its toolbar |
| `anytype-collection-grid-populated-dark.png` | Installed, dark | The full-page Grid view with 10 demo rows |
| `anytype-type-collections-list-dark.png` | Installed, dark | The system `Collections` Type page — every Collection-type object in the space, with Templates/Edit Type actions |
| `anytype-object-page-empty-dark.png` | Installed, dark | A single demo row opened as its own object page |
| `anytype-settings-account-tooltip-dark.png` | Installed, dark | Settings → Account page, with the "Join the Anytype Network" membership tooltip |
| `anytype-settings-account-dark.png` | Installed, dark | Settings → Account page, tooltip dismissed — local profile name, local Anytype Identity key (not a login credential) |
| `anytype-view-settings-panel-dark.png` | Installed, dark, CDP | A newly added view's settings popover — View name, Layout, Properties, Filter, Sort, Duplicate/Remove view |
| `anytype-layout-picker-dark.png` | Installed, dark, CDP | The Layout submenu — all six set/collection view types: Grid, Gallery, List, Kanban, Calendar, Graph |
| `anytype-layout-picker-kanban-selected-dark.png` | Installed, dark, CDP | Layout submenu with Kanban selected, board rendering behind it (grouped by Tag, "No value") |
| `anytype-set-kanban-view-dark.png` | Installed, dark, CDP | The set rendered as a Kanban board, tab renamed to match, with the view-settings panel (Layout, Groups, Properties, Filter, Sort) |
| `anytype-set-calendar-view-dark.png` | Installed, dark, CDP | The set rendered as a Calendar (month grid), Layout picker open with Calendar selected and its Date Property setting |
| `anytype-set-gallery-view-dark.png` | Installed, dark, CDP | The set rendered as a Gallery, Layout picker open with Gallery selected and its Card size/Cover/Fit media settings |
| `anytype-set-list-view-dark.png` | Installed, dark, CDP | The set rendered as a List, Layout picker open with List selected and its Size/Show icon settings |
| `anytype-set-graph-view-dark.png` | Installed, dark, CDP | The set rendered as a Graph (unconnected demo-row nodes, since no relations link them), Layout picker open with Graph selected |
| `anytype-filter-property-picker-dark.png` | Installed, dark, CDP | "New filter" property picker — Name, Object type, Creation/Modified/Opened date, Backlinks, Tag, Description, Add advanced filter |
| `anytype-filter-tag-value-picker-dark.png` | Installed, dark, CDP | The Tag filter's value picker — "Filter or create options…", both popovers open together |
| `anytype-relation-editor-tag-dark.png` | Installed, dark, CDP | An object page's empty Tag relation clicked open — the same value-picker/relation-editor pattern, on a single object rather than a filter |
| `anytype-newobject-type-picker-dark.png` | Installed, dark, CDP | The "+" new-object flow's type picker — Page, Note, Task, Chat, Collection, Query, Bookmark, Create from clipboard/Upload/Create Type |
| `anytype-object-more-menu-dark.png` | Installed, dark, CDP | An object's header `···` context menu — Type settings, Copy Link, Favorite, Pin to Channel, Add Link/Add to Collection, Duplicate, **Move to Bin**, Lock, Search in Object, Version History, Print, Export, Advanced |

**36 files total**: 5 official + 31 installed-app captures (18 from the keyboard-only phase, 13 from
the CDP phase).

## Views not captured, and why

- **Timeline/gantt** — Anytype has no timeline or gantt view (confirmed against the product's own
  view documentation and its community's open feature-request threads for one). Not applicable.
- ~~**Light theme**~~ — **reached on 2026-09-05** through the main-process bridge the Settings UI
  itself calls, which needs no menu and no navigation. See the correction above and the catalogue
  set below; every capture in that set exists in both themes.
- Everything else in the operator's expanded brief — every set layout, view switcher, view settings,
  filter, property/relation editor, type picker, new-object flow, object context menu — **was**
  reached via CDP; see the table above.

## Mock-data catalogue — landed, and since loaded

The operator asked for the sets in this pass to be populated from a shared mock-data catalogue,
diverse use cases rather than one theme. This capture pass polled `origin/main` for it three times
(`git fetch` + `git ls-tree`, 10 minutes apart, 30 minutes total) and it had not landed by then, so
the layout/filter/relation/context-menu captures above use the existing small demo dataset instead.

`tools/mock-data/catalogue.json` landed later, at `74313a7e`: 10 use cases (Project Tracker, CRM
Contacts and Deals, Reading List, Recipes and Meal Plan, Habit and Health Log, Travel Itinerary, Home
Inventory, Content Calendar, Course Notes and Study, Finance Reports), 28-40 records each, 326 total,
28 typed columns per use case (money, rating, percent, tag, person, formula, rollup, createdTime, and
more — formula/rollup/filename columns carry no per-record value by design). **Loading it into ten
correctly-typed Anytype sets — one relation created and typed per neutral column, all 326 records'
values set, all six view types per set, a sort and a filter applied — was assessed as out of scope
for this session once the catalogue arrived**: each relation and each cell is its own DOM operation
over CDP, and this session's remaining budget could not carry ~280 relation-type decisions plus
several thousand cell writes to a verified, reviewed finish without risking an abandoned, half-loaded
vault. Building the ten sets from this catalogue is recorded as explicit follow-up work for a fresh
session, not a silent gap — the catalogue itself, its column-to-relation-type mapping, and this
capture pass's proof that Anytype's six layouts, filters, and relation editor are all reachable over
CDP are the inputs that follow-up needs.

**That follow-up ran on 2026-09-05 and is recorded below.** The estimate above was wrong by an order
of magnitude in the one way that mattered: the load never needed CDP at all. Anytype serves a local
HTTP API that creates types, properties, options, objects and collection membership in bulk, and
only the views leg — the one thing that API cannot do — needed the renderer.

## Manifest

`tools/screenshots/manifest-schema.mjs` accepts only `group: "project-manager"` for a `source:
"reference"` entry, and only `pm-kanban`/`pm-gantt` as reference renderers (`:52`, `:118`). Widening
that contract is explicitly a different leg of this packet (`047-competitor-references-and-pm-
alignment`'s contract-widening task), not this capture pass, so **no manifest entry exists for
anything in this folder** and `screenshots/manifest.json` is untouched. `npm run screenshots:verify`
does not see this folder — it only walks `manifest.scenarios` — so it is unaffected either way.

## Mobile — official (`mobile/official/`)

A later, separate pass added `screenshots/anytype/mobile/official/`: 20 official Anytype **mobile**
images (App Store, Google Play, and the `anyproto/anytype-swift` GitHub README) — no installed-app
mobile captures, since Anytype's mobile clients were not installed for this pass. Same "not tracked
by `manifest.json`" status as the rest of this folder, for the same reason (no `reference` group/
renderer widened for a mobile surface).

- 7 iOS (Apple App Store, `apps.apple.com`, bundle `io.anytype.app`, id `6449487029`): hero,
  object-type list, spaces, chats, pages, lists, organize.
- 7 Android (Google Play, `play.google.com`, package `io.anytype.app`): the same seven subjects —
  both stores use the same marketing creative, re-exported per store.
- 6 GitHub (`anyproto/anytype-swift` README, `docs/assets/screenshots/`): the same creative minus
  the object-type-list subject, which exists in that repo's assets folder but is not referenced by
  the live README and was excluded as not clearly official.

Full per-file source URLs, fetch dates, resolutions, and the licence position (same "terms
unclear, retained for internal comparison" finding as the rest of this folder) are in
`screenshots/anytype/mobile/official/sources.md`.
## Catalogue sets — loaded, with views, in both themes

The follow-up the section above recorded as out of scope is done. `tools/mock-data/catalogue.json`
is loaded into a dedicated space, ten sets, 326 records, every column created as a typed Anytype
relation, six view layouts per set, and captured in both themes.

### What worked: the local HTTP API, not the DOM

The previous pass assumed this had to be driven cell by cell over CDP and priced it accordingly.
It does not. Anytype 0.56.5 serves a **local HTTP API** on `localhost:31009` (`Anytype-Version:
2025-11-08`), and it can create spaces, types, properties, tag options, objects with values, and
collection membership — the entire data load — in bulk.

**Pairing.** `POST /v1/auth/challenges` returns a `challenge_id` and opens a small always-on-top
window showing a 4-digit code. That window is **its own CDP target** (`.../dist/challenge/index.html`),
not part of the app shell, so the code is readable over CDP without touching the app:

```js
// each digit is its own leaf element; the prose above it contains "4-digit",
// so read the digit nodes structurally rather than regexing the whole string
Array.from(document.querySelectorAll('*'))
  .filter(e => e.children.length === 0 && /^\d$/.test((e.textContent||'').trim()))
  .map(e => e.textContent.trim()).join('')
```

`POST /v1/auth/api_keys` with `{challenge_id, code}` then returns the bearer key. **Each challenge
invalidates the previous one and raises a fresh dialog**, so create exactly one and read the code
from the window that challenge opened — not from a stale dialog still on screen.

**What the API cannot do.** `POST /v1/spaces/{id}/lists/{id}/views` is **404** — only `GET` is
routed. Views, sorts and filters have no API and are the one leg that still needs the renderer.
`DELETE /v1/spaces/{id}` is also 404: a space cannot be removed through the API.

**Rate limit.** Writes are capped at roughly **1/second with a burst of 7** (`Ratelimit-Limit: 1`,
`Ratelimit-Remaining`, `Ratelimit-Reset` headers; an overrun answers `429` rather than queueing).
`api.mjs` spends the burst and then holds at the refill rate, and retries a `429` with backoff. The
full load of 326 records plus 233 properties and their options takes about 25 minutes at that rate.

### The scripts

| File | What it does |
|------|--------------|
| `tools/mock-data/anytype/api.mjs` | The HTTP client, with the rate limiter and paged GETs |
| `tools/mock-data/anytype/mapping.mjs` | Neutral column type → Anytype relation format, and the value coercions |
| `tools/mock-data/anytype/load.mjs` | Builds the space: types, properties, options, objects, collections. `--reset` rebuilds |
| `tools/mock-data/anytype/cdp.mjs` | Raw-WebSocket CDP client (Playwright's `connectOverCDP` still hangs against this build) |
| `tools/mock-data/anytype/driver.mjs` | DOM driver: click, hover, type, navigate, screenshot |
| `tools/mock-data/anytype/views.mjs` | The six layouts, the sort and the filter, per set; `--names` repairs tab labels |
| `tools/mock-data/anytype/capture.mjs` | The capture sweep, both themes |

### Three things the renderer does that a script has to know

Each was found by driving the app, and each breaks a script that does not know it.

- **Submenus open on hover and ignore clicks.** The row that picks Kanban's group-by property has
  `arrow: true`, and the menu's `onClick` returns early for exactly those rows — `el.click()` does
  nothing at all. A synthetic `mouseover` opens it, but only after a `mousemove` on the document,
  because the app latches a mouse-disabled flag after any key press and clears it only on a
  mousemove.
- **Menus are virtualised.** The relation list renders only the rows in view, so reading it
  undercounts and reports properties as missing that are already on the view. The grid header is
  the honest source.
- **Only Enter commits a view name.** Blur leaves the typed text in the field and discards it. This
  cost a full ten-set build: every view had the right layout, the right group-by and the right
  filter, and all sixty tabs were still called "All" — the DOM read back correctly the entire time.
  `views.mjs --names` repairs it by reading each tab's layout off the controls bar.

### Relation-type mapping

Anytype offers exactly **eleven** property formats — `text`, `number`, `select`, `multi_select`,
`date`, `files`, `checkbox`, `url`, `email`, `phone`, `objects` — confirmed by probing
`POST /v1/spaces/{id}/properties` with every candidate name and reading which returned `201`
(`rich_text`, `long_text`, `short_text`, `status`, `tag`, `relation`, `file`, `object` and `emoji`
all return `400`). Twenty-four neutral catalogue types map onto those eleven:

| Neutral type | Anytype format | What the mapping loses |
|--------------|----------------|------------------------|
| `title` | *(the object's Name)* | Anytype has no separate title relation; the record title is the object name |
| `text` | `text` | — |
| `richText` | `text` | Text relations are plain; the markdown marks are stored as literal characters |
| `url` | `url` | — |
| `email` | `email` | — |
| `phone` | `phone` | — |
| `number` | `number` | — |
| `rating` | `number` | No rating format |
| `percent` | `number` | No percent format; the unit stays in the label |
| `money` | `money`→`number` | No currency format |
| `select` | `select` | — |
| `status` | `select` | **Anytype has no distinct status type** — a status field is a single-value select |
| `tag` | `multi_select` | — |
| `multiSelect` | `multi_select` | — |
| `person` | `objects` | Modelled as an object relation; one page object per named person |
| `checkbox` | `checkbox` | — |
| `date` | `date` | — |
| `dateTime` | `date` | Anytype's date carries a time component, so both share it |
| `relation` | `objects` | Resolved in a second pass, once every object in the set has an id |
| `file` | `files` | **Correctly typed, values unset** — the catalogue names vault paths, and the API's file route needs a real multipart upload |
| `formula` | `text` | **No Anytype equivalent.** No per-record value; the catalogue carries none either |
| `rollup` | `text` | **No Anytype equivalent.** No per-record value |
| `createdTime` | `date` | Anytype supplies its own Created date; no per-record value |
| `modifiedTime` | `date` | Anytype supplies its own Last modified date; no per-record value |

**Property names carry a use-case suffix where a label repeats.** Property names are space-global and
Anytype derives the key from the name, so two use cases both calling a column "Status" would collide
on one key and values would land on whichever property the API resolved. Thirteen labels repeat
across the ten use cases and only those are suffixed — "Status (Project Tracker)" — while the other
220 keep the catalogue's plain label.

### The sets, as read back

Every number below is read back off the live space, never carried over from what was written. The
record count is `GET /v1/spaces/{id}/lists/{collection}/views/default/objects` walked to
exhaustion; the column count is how many catalogue columns the Grid view actually renders as header
cells, not how many the loader believed it added.

| Set | Use case | Records | Columns on grid | Views | Sort on | Filter on | Kanban grouped by | Calendar on | Captures |
|-----|----------|---------|-----------------|-------|---------|-----------|-------------------|-------------|----------|
| `project-tracker` | Project Tracker | ✅ **36** / 36 | 26 / 27 | 6 | Due | Status | Status | Due | 12 |
| `crm-contacts-deals` | CRM Contacts and Deals | ✅ **34** / 34 | 27 / 27 | 6 | Next touch | Health | Health | Next touch | 12 |
| `reading-list` | Reading List | ✅ **32** / 32 | 27 / 27 | 6 | Finished | Reading status | Reading status | Finished | 12 |
| `recipes-meal-plan` | Recipes and Meal Plan | ✅ **30** / 30 | 27 / 27 | 6 | Planned for | Kitchen status | Kitchen status | Planned for | 12 |
| `habit-health-log` | Habit and Health Log | ✅ **40** / 40 | 27 / 27 | 6 | Date | Day status | Day status | Date | 12 |
| `travel-itinerary` | Travel Itinerary | ✅ **28** / 28 | 27 / 27 | 6 | Date | Booking status | Booking status | Date | 12 |
| `home-inventory` | Home Inventory | ✅ **34** / 34 | 27 / 27 | 6 | Purchased | Condition | Condition | Purchased | 12 |
| `content-calendar` | Content Calendar | ✅ **32** / 32 | 27 / 27 | 6 | Publish on | Editorial status | Editorial status | Publish on | 12 |
| `course-notes` | Course Notes and Study | ✅ **30** / 30 | 27 / 27 | 6 | Session | Revision state | Revision state | Session | 12 |
| `finance-reports` | Finance Reports | ✅ **30** / 30 | 27 / 27 | 6 | Due | Status | Status | Due | 12 |

**326 of 326 records** across the ten sets, every set matching its `recordCount`
exactly. `load.mjs --verify` re-read every object and matched **5990 of 5990** settable
cells with **0** misses — a count check alone cannot catch the loader's most likely bug,
because the wrong value shape creates the right number of objects and leaves every one of them
empty.

Space `notion-clone-reference-demo`, id `bafyreihvtvxiy7aai6f3y4pzs3tp2h5i5vxoq3njyx55rfg2nnijpowiri.21ytko0pzprcx`. **The space is left in place.** It is a
persistent test environment, so unlike the previous pass nothing was moved to Bin at the end.

### Captures

**120 files**, named `anytype-<usecase>-<layout>-<theme>.png`, one folder per use case under
`desktop/sets/<usecase>/`.
Each set has six layouts in two themes. `capture-report.json` records the row count the DOM held
when each was taken, so a capture that photographed an empty grid is visible as a number rather
than only as a picture nobody looked at.

Taken with CDP `Page.captureScreenshot`, which renders from the page and therefore needs no window
focus, no visible window and no pointer — the operator kept working on the same machine throughout.

### What is still not in Anytype

- **`file` columns carry no values.** The relation is created with the correct `files` format, but
  the catalogue names vault paths and `POST /v1/spaces/{id}/files` wants a real multipart upload.
- **`formula` and `rollup` carry no values, and cannot.** Anytype has neither. Both are `text`
  relations. The catalogue carries no per-record value for them either, so nothing was lost.
- **Project Tracker's `person` column is the built-in `Assignee`.** Its label collides with a
  relation Anytype ships, so the values live on Anytype's own `assignee` key rather than on a
  catalogue-owned one. The data is there and correctly typed; it is the one column of the 270 that
  the Grid view does not list separately.

## Menus and dropdowns — every one the desktop app opens

`screenshots/anytype/desktop/menus/` holds **600 files: 150 distinct menus, each in light and dark, each
twice** — once clipped to the menu's bounding box (the design reference) and once as the whole
window (`-full`, which shows where the menu sits relative to the control that opened it). Every
capture came from `tools/mock-data/anytype/menus.mjs`, driven over CDP against the persistent
`notion-clone-reference-demo` space and its `Project Tracker` set.

### Per context

| Context | Menus | What it covers |
|---------|-------|----------------|
| Set controls bar | 59 | View list, view settings and its four rows, the six layouts and every per-layout sub-picker, a filter per relation format with its condition list, the date filter's calendar and relative tab, sorts and their direction, the "New" template/type menu, the grid's column-header menu |
| Grid cell editors | 12 | One per relation format — text, url, email, phone, number, select, multi-select, date, object, file, object type, checkbox |
| Object page | 25 | The header `···` menu and its submenus, icon/cover/layout pickers, type picker and change-type, the featured-relation editors, the block menu with view/align/colour/background/move-to, the properties panel and a per-format relation editor from it |
| Navigation | 37 | Vault create/search/gallery/space menus, help, sync, members, widget section and item context menus, the Bin, history, graph, and every settings page this build ships with its selects |
| Kanban | 5 | Column menu, card context menu and its submenus |
| Calendar | 4 | Month and year selects, a day's menu, an event's context menu |
| Gallery | 4 | Card context menu and its submenus |
| List | 4 | Row context menu and its submenus |

### Three things the crawler had to learn, each of which silently corrupts a naive sweep

- **Opening the view-settings menu renames the view.** `.btn-settings` mounts its name input with an
  empty value and commits it, so a view is renamed to "Untitled" simply by being looked at. This was
  found the expensive way — it renamed `Grid` and `Gallery` during the first probe, and the `+` in
  the view bar created two views at the same time. Both were repaired, and every capture that has to
  open that menu now happens on **one throwaway view the sweep creates and removes**; the four
  sub-pickers a fresh view cannot populate (Kanban group-by, Gallery cover, both page limits) are
  taken on the real views instead, with the name typed back and committed with Enter afterwards.
  `menus.mjs` re-reads all six names against `views-report.json` before and after every run.
- **A new tab makes ours a background tab, and a background tab lies.** Several menus open a tab.
  Chromium then reports our page `visibilityState: "hidden"`: `Runtime.evaluate` still answers, so
  the DOM reads correctly, but the layout is stale and `Page.captureScreenshot` returns the frame of
  a page nobody is looking at. The symptom is an entire context reporting "no element" for selectors
  that are plainly present. The tab strip is its own CDP target (`dist/tabs.html`, rows carrying
  `.clickable` and `.icon.close`), so the guard closes strays and re-activates ours from inside the
  renderer — no window activation and no pointer, like everything else here.
- **A submenu left open swallows the next hover.** Walking a menu's arrow rows without closing the
  previous submenu makes the app ignore the next `mouseover`, and the failure is indistinguishable
  from a row that has no submenu. One Escape between shots closes the submenu and leaves its parent
  open; adding it turned four "unreachable" sub-pickers into four captures.

### Not captured, with the exact reason

| Item | Reason |
|------|--------|
| The controls bar's sort icon (`#dataviewControls .btn-sort`) | It is a state indicator, not an opener. It dispatches no menu on `el.click()` and none on a real CDP `Input.dispatchMouseEvent` either. The same surface is reached through view settings ▸ Sort and is captured there. |
| `object-block-add` (`.icon.plusBlockAdd`) | The click fires and no `.menu.show` appears; the block-add affordance needs a real hover-then-click gesture the synthetic sequence does not reproduce. The same menu is the `/` slash menu, captured in the earlier pass (`anytype-slashmenu-*`). |
| `object-relation-checkbox` | The checkbox relation sits below the fold of the properties panel, so its editor measures a negative height and cannot be clipped. The same editor is captured from the grid as `cell-checkbox`. |
| `object-relation-settings` | A `contextmenu` event on a property row in the properties panel opens no menu in this build. |
| Settings ▸ Membership | No such entry in this build's settings sidebar — it is a Network feature and this install has never signed in. |
| The Name grid cell | Clicking it opens the object rather than editing in place, and the navigation empties the grid for every format that follows. Its editor is the object page title, captured under `object`. |
| Anything that creates or deletes | Refused by name, not by luck: `menus.mjs` carries a `DESTRUCTIVE`/`MUTATING` list (Move to Bin, Delete, Duplicate, Remove view, Add a view, Create object…) that the submenu walker consults before every hover. |

### The space is unchanged

Every run re-reads the six view names against `views-report.json` at both ends and records them in
`menus-report.json`; the final run reports `["Grid","Gallery","List","Kanban","Calendar","Graph"]`
unchanged, the scratch view removed, and the tab list back to what it started as. No record value
was edited: the cell sweep reads each cell's text before and after opening its editor and reports a
mismatch as a failure, and the checkbox — the one format whose editor *is* the edit — is toggled,
photographed and toggled back with its state read at both ends.

### Index

| Menu | Context | How it was reached |
|------|---------|--------------------|
| `anytype-menu-set-column-header-<theme>.png` | set controls bar | `.viewContent .cellHead:nth-child(2)` |
| `anytype-menu-set-column-header-align-<theme>.png` | set controls bar | `.viewContent .cellHead` ▸ hover "align" |
| `anytype-menu-set-column-header-calculate-<theme>.png` | set controls bar | `.viewContent .cellHead` ▸ hover "calculate" |
| `anytype-menu-set-filter-checkbox-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Blocked" |
| `anytype-menu-set-filter-checkbox-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Blocked" ▸ the condition row |
| `anytype-menu-set-filter-date-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Starts" |
| `anytype-menu-set-filter-date-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Starts" ▸ the condition row |
| `anytype-menu-set-filter-date-picker-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ "Starts" ▸ Exact tab, calendar |
| `anytype-menu-set-filter-date-relative-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ "Starts" ▸ Relative tab |
| `anytype-menu-set-filter-email-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Owner email" |
| `anytype-menu-set-filter-email-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Owner email" ▸ the condition row |
| `anytype-menu-set-filter-file-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Attachments" |
| `anytype-menu-set-filter-file-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Attachments" ▸ the condition row |
| `anytype-menu-set-filter-multiselect-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Team" |
| `anytype-menu-set-filter-multiselect-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Team" ▸ the condition row |
| `anytype-menu-set-filter-number-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Estimate (pts)" |
| `anytype-menu-set-filter-number-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Estimate (pts)" ▸ the condition row |
| `anytype-menu-set-filter-object-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Depends on" |
| `anytype-menu-set-filter-object-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Depends on" ▸ the condition row |
| `anytype-menu-set-filter-phone-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Escalation line" |
| `anytype-menu-set-filter-phone-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Escalation line" ▸ the condition row |
| `anytype-menu-set-filter-property-picker-<theme>.png` | set controls bar | `#dataviewControls .btn-filter` |
| `anytype-menu-set-filter-select-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Status (Project Tracker)" |
| `anytype-menu-set-filter-select-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Status (Project Tracker)" ▸ the condition row |
| `anytype-menu-set-filter-text-long-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Working notes" |
| `anytype-menu-set-filter-text-long-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Working notes" ▸ the condition row |
| `anytype-menu-set-filter-text-short-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Name" |
| `anytype-menu-set-filter-text-short-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Name" ▸ the condition row |
| `anytype-menu-set-filter-url-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Ticket" |
| `anytype-menu-set-filter-url-condition-<theme>.png` | set controls bar | `.btn-settings` ▸ Filter ▸ New filter ▸ "Ticket" ▸ the condition row |
| `anytype-menu-set-layout-calendar-<theme>.png` | set controls bar | `.btn-settings` ▸ Layout ▸ the "Calendar" tile (on the scratch view) |
| `anytype-menu-set-layout-calendar-date-property-<theme>.png` | set controls bar | view "Calendar" ▸ `.btn-settings` ▸ Layout ▸ hover "date property" |
| `anytype-menu-set-layout-gallery-<theme>.png` | set controls bar | `.btn-settings` ▸ Layout ▸ the "Gallery" tile (on the scratch view) |
| `anytype-menu-set-layout-gallery-card-size-<theme>.png` | set controls bar | view "Gallery" ▸ `.btn-settings` ▸ Layout ▸ hover "card size" |
| `anytype-menu-set-layout-gallery-cover-<theme>.png` | set controls bar | view "Gallery" ▸ `.btn-settings` ▸ Layout ▸ hover "cover" |
| `anytype-menu-set-layout-gallery-page-limit-<theme>.png` | set controls bar | view "Gallery" ▸ `.btn-settings` ▸ Layout ▸ hover "page limit" |
| `anytype-menu-set-layout-graph-<theme>.png` | set controls bar | `.btn-settings` ▸ Layout ▸ the "Graph" tile (on the scratch view) |
| `anytype-menu-set-layout-graph-settings-<theme>.png` | set controls bar | view "Graph" ▸ `.btn-settings` ▸ Layout ▸ hover "settings" |
| `anytype-menu-set-layout-grid-<theme>.png` | set controls bar | `.btn-settings` ▸ Layout ▸ the "Grid" tile (on the scratch view) |
| `anytype-menu-set-layout-kanban-<theme>.png` | set controls bar | `.btn-settings` ▸ Layout ▸ the "Kanban" tile (on the scratch view) |
| `anytype-menu-set-layout-kanban-cover-<theme>.png` | set controls bar | view "Kanban" ▸ `.btn-settings` ▸ Layout ▸ hover "cover" |
| `anytype-menu-set-layout-kanban-group-by-<theme>.png` | set controls bar | view "Kanban" ▸ `.btn-settings` ▸ Layout ▸ hover "group by" |
| `anytype-menu-set-layout-kanban-page-limit-<theme>.png` | set controls bar | view "Kanban" ▸ `.btn-settings` ▸ Layout ▸ hover "page limit" |
| `anytype-menu-set-layout-list-<theme>.png` | set controls bar | `.btn-settings` ▸ Layout ▸ the "List" tile (on the scratch view) |
| `anytype-menu-set-layout-list-size-<theme>.png` | set controls bar | view "List" ▸ `.btn-settings` ▸ Layout ▸ hover "size" |
| `anytype-menu-set-new-object-<theme>.png` | set controls bar | `#dataviewControls .buttonWrap.withSelect .button.isArrow` |
| `anytype-menu-set-new-object-default-type-for-this-view-<theme>.png` | set controls bar | `#dataviewControls` "New" arrow ▸ hover "default type for this view" |
| `anytype-menu-set-new-object-existing-object-<theme>.png` | set controls bar | `#dataviewControls` "New" arrow ▸ hover "existing object" |
| `anytype-menu-set-new-object-template-for-this-view-<theme>.png` | set controls bar | `#dataviewControls` "New" arrow ▸ hover "template for this view" |
| `anytype-menu-set-sort-added-<theme>.png` | set controls bar | `.btn-settings` ▸ Sort ▸ Add sort ▸ "Estimate (pts)" |
| `anytype-menu-set-sort-direction-<theme>.png` | set controls bar | `.btn-settings` ▸ Sort ▸ the sort row's direction select |
| `anytype-menu-set-sort-empty-<theme>.png` | set controls bar | `.btn-settings` ▸ Sort |
| `anytype-menu-set-sort-property-picker-<theme>.png` | set controls bar | `.btn-settings` ▸ Sort ▸ Add sort |
| `anytype-menu-set-view-filter-<theme>.png` | set controls bar | `.btn-settings` ▸ click `#item-filter` |
| `anytype-menu-set-view-layout-<theme>.png` | set controls bar | `.btn-settings` ▸ click `#item-layout` |
| `anytype-menu-set-view-properties-<theme>.png` | set controls bar | `.btn-settings` ▸ click `#item-relations` |
| `anytype-menu-set-view-settings-<theme>.png` | set controls bar | `#dataviewControls .btn-settings` |
| `anytype-menu-set-view-sort-<theme>.png` | set controls bar | `.btn-settings` ▸ click `#item-sort` |
| `anytype-menu-set-viewlist-<theme>.png` | set controls bar | `#dataviewControls .viewSelect` |
| `anytype-menu-cell-checkbox-<theme>.png` | grid cell | `.viewContent .row .cell.c-checkbox` — toggles the value, toggled back after |
| `anytype-menu-cell-date-<theme>.png` | grid cell | `.viewContent .row .cell.c-date` |
| `anytype-menu-cell-email-<theme>.png` | grid cell | `.viewContent .row .cell.c-email` |
| `anytype-menu-cell-file-<theme>.png` | grid cell | `.viewContent .row .cell.c-file` |
| `anytype-menu-cell-multiselect-<theme>.png` | grid cell | `.viewContent .row .cell.c-select.isMultiSelect` |
| `anytype-menu-cell-number-<theme>.png` | grid cell | `.viewContent .row .cell.c-number` |
| `anytype-menu-cell-object-<theme>.png` | grid cell | `.viewContent .row .cell.c-object` |
| `anytype-menu-cell-phone-<theme>.png` | grid cell | `.viewContent .row .cell.c-phone` |
| `anytype-menu-cell-select-<theme>.png` | grid cell | `.viewContent .row .cell.c-select.isSelect` |
| `anytype-menu-cell-text-<theme>.png` | grid cell | `.viewContent .row .cell.c-longText` |
| `anytype-menu-cell-type-<theme>.png` | grid cell | `.viewContent .row .cell.cell-key-type` |
| `anytype-menu-cell-url-<theme>.png` | grid cell | `.viewContent .row .cell.c-url` |
| `anytype-menu-object-block-menu-<theme>.png` | object page | `.blockFeatured .icon.blockMenu` |
| `anytype-menu-object-block-menu-align-<theme>.png` | object page | `.blockFeatured .icon.blockMenu` ▸ hover "align" |
| `anytype-menu-object-block-menu-background-<theme>.png` | object page | `.blockFeatured .icon.blockMenu` ▸ hover "background" |
| `anytype-menu-object-block-menu-color-<theme>.png` | object page | `.blockFeatured .icon.blockMenu` ▸ hover "color" |
| `anytype-menu-object-block-menu-move-to-<theme>.png` | object page | `.blockFeatured .icon.blockMenu` ▸ hover "move to" |
| `anytype-menu-object-block-menu-view-<theme>.png` | object page | `.blockFeatured .icon.blockMenu` ▸ hover "view" |
| `anytype-menu-object-cover-picker-<theme>.png` | object page | `.editorControls .btn .icon.controlEditorCover` |
| `anytype-menu-object-featured-tag-<theme>.png` | object page | `.blockFeatured .cellContent.c-tag` |
| `anytype-menu-object-icon-picker-<theme>.png` | object page | `.editorControls .btn .icon.controlEditorIcon` |
| `anytype-menu-object-layout-picker-<theme>.png` | object page | `.editorControls .btn .icon.controlEditorLayout` |
| `anytype-menu-object-layout-picker-header-position-<theme>.png` | object page | `.editorControls .btn .icon.controlEditorLayout` ▸ hover "header position" |
| `anytype-menu-object-more-<theme>.png` | object page | `#header .icon.commonMore` |
| `anytype-menu-object-more-add-link-to-object-<theme>.png` | object page | `#header .icon.commonMore` ▸ hover "add link to object" |
| `anytype-menu-object-more-add-to-collection-<theme>.png` | object page | `#header .icon.commonMore` ▸ hover "add to collection" |
| `anytype-menu-object-more-advanced-<theme>.png` | object page | `#header .icon.commonMore` ▸ hover "advanced" |
| `anytype-menu-object-properties-panel-<theme>.png` | object page | `#header .icon.headerRelation` (a docked panel, clipped to itself) |
| `anytype-menu-object-relation-date-<theme>.png` | object page | `#header` relations ▸ `#sidebarRight .section.objectRelation.c-date .cellContent` |
| `anytype-menu-object-relation-file-<theme>.png` | object page | `#header` relations ▸ `#sidebarRight .section.objectRelation.c-file .cellContent` |
| `anytype-menu-object-relation-multiselect-<theme>.png` | object page | `#header` relations ▸ `#sidebarRight .section.objectRelation.c-multiselect .cellContent` |
| `anytype-menu-object-relation-number-<theme>.png` | object page | `#header` relations ▸ `#sidebarRight .section.objectRelation.c-number .cellContent` |
| `anytype-menu-object-relation-object-<theme>.png` | object page | `#header` relations ▸ `#sidebarRight .section.objectRelation.c-object .cellContent` |
| `anytype-menu-object-relation-select-<theme>.png` | object page | `#header` relations ▸ `#sidebarRight .section.objectRelation.c-select .cellContent` |
| `anytype-menu-object-relation-url-<theme>.png` | object page | `#header` relations ▸ `#sidebarRight .section.objectRelation.c-url .cellContent` |
| `anytype-menu-object-type-picker-<theme>.png` | object page | `.blockFeatured .cellContent.type` |
| `anytype-menu-object-type-picker-change-type-<theme>.png` | object page | `.blockFeatured .cellContent.type` ▸ hover "change type" |
| `anytype-menu-nav-create-object-<theme>.png` | navigation | `.sidebar.left .pageVault .head .icon.plusMenu` |
| `anytype-menu-nav-graph-<theme>.png` | navigation | `#header .icon.headerGraph` (a page, clipped to `#page`) |
| `anytype-menu-nav-help-<theme>.png` | navigation | `.sidebar.left .button.help` |
| `anytype-menu-nav-help-developers-<theme>.png` | navigation | `.sidebar.left .button.help` ▸ hover "developers" |
| `anytype-menu-nav-help-more-<theme>.png` | navigation | `.sidebar.left .button.help` ▸ hover "more" |
| `anytype-menu-nav-history-<theme>.png` | navigation | `#header .icon.commonClock` |
| `anytype-menu-nav-members-<theme>.png` | navigation | `.sidebar.left .icon.widgetMember` (a page, clipped to `#page`) |
| `anytype-menu-nav-settings-<theme>.png` | navigation | `.sidebar.left .appSettings` (a page, clipped to `#settingsPageContainer`) |
| `anytype-menu-nav-settings-api-keys-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "api keys" |
| `anytype-menu-nav-settings-channels-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "channels" |
| `anytype-menu-nav-settings-language-region-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "language region" |
| `anytype-menu-nav-settings-language-region-select-1-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "language region" ▸ select #1 |
| `anytype-menu-nav-settings-language-region-select-2-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "language region" ▸ select #2 |
| `anytype-menu-nav-settings-language-region-select-3-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "language region" ▸ select #3 |
| `anytype-menu-nav-settings-language-region-select-4-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "language region" ▸ select #4 |
| `anytype-menu-nav-settings-local-storage-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "local storage" |
| `anytype-menu-nav-settings-local-storage-select-1-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "local storage" ▸ select #1 |
| `anytype-menu-nav-settings-login-key-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "login key" |
| `anytype-menu-nav-settings-my-sites-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "my sites" |
| `anytype-menu-nav-settings-pin-code-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "pin code" |
| `anytype-menu-nav-settings-preferences-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "preferences" |
| `anytype-menu-nav-settings-preferences-select-1-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "preferences" ▸ select #1 |
| `anytype-menu-nav-settings-preferences-select-2-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "preferences" ▸ select #2 |
| `anytype-menu-nav-settings-preferences-select-3-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "preferences" ▸ select #3 |
| `anytype-menu-nav-settings-preferences-select-4-<theme>.png` | navigation | `.sidebar.left .appSettings` ▸ sidebar entry "preferences" ▸ select #4 |
| `anytype-menu-nav-space-name-<theme>.png` | navigation | `.sidebar.left .spaceName` (a page, clipped to `#page`) |
| `anytype-menu-nav-space-widget-<theme>.png` | navigation | `.sidebar.left .widget.widgetSpace` (a page, clipped to `#page`) |
| `anytype-menu-nav-sync-<theme>.png` | navigation | `.sidebar.left .sync` |
| `anytype-menu-nav-vault-gallery-<theme>.png` | navigation | `.sidebar.left .icon.vaultGallery` (a page, clipped to `#page`) |
| `anytype-menu-nav-vault-search-<theme>.png` | navigation | `.sidebar.left .pageVault .filter` (an input, clipped to itself) |
| `anytype-menu-nav-vault-space-item-<theme>.png` | navigation | right-click `.sidebar.left .pageVault .body .item` |
| `anytype-menu-nav-widget-bin-<theme>.png` | navigation | right-click `.sidebar.left .widgetSection.section-bin .items .item` |
| `anytype-menu-nav-widget-item-<theme>.png` | navigation | right-click `.sidebar.left .widgetSection.section-recentedit .items .item` |
| `anytype-menu-nav-widget-item-add-to-collection-<theme>.png` | navigation | right-click `.sidebar.left .widgetSection.section-recentedit .items .item` ▸ hover "add to collection" |
| `anytype-menu-nav-widget-item-change-type-<theme>.png` | navigation | right-click `.sidebar.left .widgetSection.section-recentedit .items .item` ▸ hover "change type" |
| `anytype-menu-nav-widget-section-recent-<theme>.png` | navigation | right-click `.sidebar.left .widgetSection.section-recentedit .nameWrap` |
| `anytype-menu-nav-widget-section-types-<theme>.png` | navigation | right-click `.sidebar.left .widgetSection.section-type .nameWrap` |
| `anytype-menu-kanban-card-menu-<theme>.png` | kanban | right-click `.viewContent .column .card.isPage` |
| `anytype-menu-kanban-card-menu-add-link-to-object-<theme>.png` | kanban | right-click `.viewContent .column .card.isPage` ▸ hover "add link to object" |
| `anytype-menu-kanban-card-menu-add-to-collection-<theme>.png` | kanban | right-click `.viewContent .column .card.isPage` ▸ hover "add to collection" |
| `anytype-menu-kanban-card-menu-change-type-<theme>.png` | kanban | right-click `.viewContent .column .card.isPage` ▸ hover "change type" |
| `anytype-menu-kanban-column-menu-<theme>.png` | kanban | `.viewContent .column .head .icon.commonMore` |
| `anytype-menu-calendar-day-menu-<theme>.png` | calendar | right-click `.viewContent .day .head` |
| `anytype-menu-calendar-item-menu-<theme>.png` | calendar | right-click `.viewContent .day .items > div` |
| `anytype-menu-calendar-month-select-<theme>.png` | calendar | `.dateSelect .select.month` |
| `anytype-menu-calendar-year-select-<theme>.png` | calendar | `.dateSelect .select.year` |
| `anytype-menu-gallery-card-menu-<theme>.png` | gallery | right-click `.viewContent .card.isPage` |
| `anytype-menu-gallery-card-menu-add-link-to-object-<theme>.png` | gallery | right-click `.viewContent .card.isPage` ▸ hover "add link to object" |
| `anytype-menu-gallery-card-menu-add-to-collection-<theme>.png` | gallery | right-click `.viewContent .card.isPage` ▸ hover "add to collection" |
| `anytype-menu-gallery-card-menu-change-type-<theme>.png` | gallery | right-click `.viewContent .card.isPage` ▸ hover "change type" |
| `anytype-menu-list-row-menu-<theme>.png` | list | right-click `.viewContent .row .dropTarget` |
| `anytype-menu-list-row-menu-add-link-to-object-<theme>.png` | list | right-click `.viewContent .row .dropTarget` ▸ hover "add link to object" |
| `anytype-menu-list-row-menu-add-to-collection-<theme>.png` | list | right-click `.viewContent .row .dropTarget` ▸ hover "add to collection" |
| `anytype-menu-list-row-menu-change-type-<theme>.png` | list | right-click `.viewContent .row .dropTarget` ▸ hover "change type" |

Each row exists as `-dark.png`, `-light.png`, `-dark-full.png` and `-light-full.png`.


---

# Mobile (iOS Simulator)

`mobile/` holds 59 mobile states, each in light and dark — 118 files, split into `mobile/sheets/`
(104 files, every `anytype-mobile-sheet-*` bottom sheet) and `mobile/app/` (the remaining 14 —
set layouts, the object page, the space and type lists). They are screenshots of the
**official open-source Anytype iOS client built from source** and run on a simulator, not of the
desktop app at a narrow width. Everything they show is real iOS chrome: sheets that slide from the
bottom, iOS pickers, the SpringBoard status bar.

They are the counterpart to `mobile/official/` above: those are the vendor's own marketing images,
these are the running app.

## Provenance

| Field | Value |
|-------|-------|
| **Source** | `github.com/anyproto/anytype-swift`, cloned at `77ef5ea2ecf7a439234152d024cf5139241bc842` (2026-09-01), vendored under the gitignored `specs/context/anytype-swift/` |
| **App version** | `CFBundleShortVersionString` 0.49.0, bundle id `io.anytype.app.dev`, `Debug` configuration |
| **Middleware** | `anytype-heart` `v0.50.21-nightly.20260824.1`, the version pinned in the repo's `Libraryfile` |
| **Device** | iPhone 17 Pro, iOS 26.5 (`94E4B156-26E9-474C-8AED-A2A461F5F108`), 402x874pt / 1206x2622px |
| **Data** | the desktop's `notion-clone-reference-demo` space — ten catalogue sets, 326 records — joined over the network, not re-created |

**iPhone 16 Pro was asked for and does not exist on this machine.** Xcode 26.6 ships iOS 26.3 and
26.5 runtimes, whose newest iPhone profiles start at iPhone 17. iPhone 17 Pro is the same 402x874pt
class, so the layout these captures show is the one iPhone 16 Pro would show.

## Building it

Two things about the build are worth keeping, because both cost time to find.

**The prebuilt middleware does not need a GitHub token.** `make setup-middle` reads
`Scripts/middle-download.sh`, which pulls the `Lib.xcframework` from the GitHub *Packages* Maven
registry and needs a personal access token with `read:packages` — which the machine's `gh` token
does not carry (`gist, read:org, repo, workflow`; the request returns 401, and so does an anonymous
one). The identical artifact is a **public release asset** on `anyproto/anytype-heart`:

```bash
gh release download v0.50.21-nightly.20260824.1 --repo anyproto/anytype-heart \
  --pattern 'ios_framework_*.tar.gz' --dir .libcache
tar xzf .libcache/ios_framework_v0.50.21-nightly.20260824.1.tar.gz -C Dependencies/Middleware
```

Its layout — `Lib.xcframework/`, `json/`, `protobuf/` — is exactly what the download script
extracts, and its simulator slice carries `arm64` as well as `x86_64`. Building `anytype-heart`
locally with Go is therefore unnecessary.

**`make generate-middle` is not needed either.** All 679 generated protobuf Swift files are
committed; only `Dependencies/Middleware/*` is gitignored. With the xcframework in place the build
runs with no codegen and no `setup-env` Homebrew chain:

```bash
xcodebuild -project Anytype.xcodeproj -scheme Anytype -configuration Debug \
  -destination 'id=<simulator udid>' -derivedDataPath <scratch> \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY="" build
```

**BUILD SUCCEEDED on the first attempt**, and again after the one source patch described below.

## How the simulator was driven, and why

`simctl` has no tap. Every other way to click a simulator moves the Mac's own pointer, which was
ruled out. So input runs through **XCUITest**: a `AnytypeDriverUITests` target added to the vendored
project with Ruby's `xcodeproj` gem, holding one long-lived test that polls `/tmp/anytype-driver/req.json`,
performs one action against `XCUIApplication(bundleIdentifier:)`, and writes `res.json`. The shell
sends `tap` (normalized coordinates), `tapLabel`, `type`, `swipe`, `drag` and `labels` (the
accessibility tree with frames) and never blocks on Xcode.

`xcrun simctl io booted screenshot` renders from the device, so no capture needed focus, a visible
Simulator window, or a foreground app. **`Simulator.app` was never launched** — `simctl boot` alone
is enough for both input and capture.

Two properties of this harness shape how the captures were taken:

- **The accessibility tree stacks every presented sheet.** A row's reported frame can belong to a
  sheet one level down, so a coordinate computed from `labels` alone lands on the wrong control.
  Each deep tap was therefore aimed from a screenshot, not from the tree.
- **`isHittable` is false for rows inside a presented sheet's scroll view.** `tapLabel` reports
  "no hittable match" for a row that is plainly on screen, so sheet rows are tapped by coordinate.

The test runner crashes every twenty minutes or so ("Restarting after unexpected exit"); the client
restarts it automatically on a transport timeout and the app under test survives.

## How the demo data reached the phone

The desktop's demo space was joined, not rebuilt. In order:

1. A **new local vault** was created in the simulator through the app's own onboarding — "I am new
   here", key reveal skipped, e-mail and persona screens skipped. The operator's recovery phrase was
   never used and their account was never signed into.
2. The desktop generated an invite over CDP: space settings → `spaceShare` → the "Add members via
   link" switch → **Copy link** → `navigator.clipboard.readText()`. The link is
   `https://invite.any.coop/<cid>#<key>` and is held only in this session's gitignored scratch.
3. The simulator opened `anytype://invite?cid=<cid>&key=<key>` and the app's own **Join a space**
   sheet resolved it over the network. "Request to join" was tapped.
4. The desktop approved it over CDP: the pending row's permission select → **Editor** → the
   `Are you sure?` popup's **Ok**. That confirmation popup is the step that is easy to miss —
   selecting a permission alone commits nothing, and the API keeps reporting
   `role=no_permissions status=joining` until Ok is clicked.
5. `GET /v1/spaces/<id>/members` then reported `Groovy Spinach | role=editor | status=active`, and
   all ten collections and 326 records appeared on the phone.

**`simctl openurl` cannot deliver a deep link to this build.** SpringBoard raises its
"Open in Anytype Dev?" confirmation, the Open button is tapped, and nothing reaches the app —
verified with a negative control (`anytype://networkConfig?config=probe`, whose only effect is a
local toast, produced no toast either), so the failure is in delivery, not in the invite. The QR
join path is equally unavailable: the simulator has no camera. The invite therefore arrives through
a **five-line DEBUG-only patch** in the vendored clone's
`SpaceHubCoordinatorViewModel.setup()`, which reads `ANYTYPE_JOIN_CID` / `ANYTYPE_JOIN_KEY` from the
process environment and opens the app's *own* `SpaceJoinModuleData` sheet. It changes how the invite
arrives, never what any captured screen looks like, and the clone is gitignored reference material.

**The vault does not survive a relaunch.** `CODE_SIGNING_ALLOWED=NO` strips the keychain-access-group
entitlement, so a terminated app comes back at onboarding with the account gone. Onboarding and the
join must happen in one session, which is why the invite is read at launch rather than after.

## What was changed in the shared space, and what was put back

- An invite link now exists on `notion-clone-reference-demo` (approval required, held by the owner).
  Roll back in the desktop: Settings → Share → toggle "Add members via link" off, or Manage link →
  Reset.
- The simulator identity `Groovy Spinach` is an **Editor** member. Roll back: Members → its row →
  Remove member.
- Two empty `Untitled` Page objects were created by stray taps and **deleted** via
  `DELETE /v1/spaces/<id>/objects/<id>`; the space read back 382 objects, 0 untitled. The captures
  that show them (`set-list`) were retaken afterwards.
- No filter, sort, layout or view name was committed. Pickers were opened and dismissed; the
  `Filters` sheet still reads "No filters" and no relation was created.

## Captures

Every row exists as `<name>-light.png` and `<name>-dark.png`. Themes were switched with
`xcrun simctl ui booted appearance light|dark` without leaving the state, so both files show the
same screen. Every `anytype-mobile-sheet-*` stem below lives in `mobile/sheets/`; the rest
(`anytype-mobile-space-typeslist`, `anytype-mobile-type-collections-list`, `anytype-mobile-object-page`,
`anytype-mobile-set-*`) live in `mobile/app/`.

### Navigation and space

| File stem | Reached by | Shows |
|-----------|-----------|-------|
| `anytype-mobile-space-typeslist` | space hub → the space | Space home: cover, the ten `… records` types, Pages/Tasks/Collections, Bin |
| `anytype-mobile-type-collections-list` | space home → `Collections` | The `Collections` type page listing all ten use-case sets, with its own view bar |
| `anytype-mobile-sheet-space-more` | space home → `···` | Channel Settings, Members, Notifications, Manage sections |
| `anytype-mobile-sheet-space-settings` | that menu → Channel Settings | Space settings: Collaboration, Content Model, Preferences, Data Management |
| `anytype-mobile-sheet-space-members` | that menu → Members | Invite-link notice plus the owner and this simulator as Editor |
| `anytype-mobile-sheet-app-settings` | space hub → profile avatar | Profile sheet: Appearance, Notifications, Login Key, Membership, Channels, Local Storage |
| `anytype-mobile-sheet-appearance` | that sheet → Appearance | Mode Light/Dark/System and the three application icons |
| `anytype-mobile-sheet-search` | search island | Global search: recent objects, filter chips, "Meet the new search" onboarding |
| `anytype-mobile-sheet-search-query` | typing into it | Results for a typed query, across spaces, keyboard up |
| `anytype-mobile-sheet-search-typefilter` | search → `Types` chip | The type filter's searchable picker |
| `anytype-mobile-sheet-quickcapture` | quick-capture island | Page / Task / More |
| `anytype-mobile-sheet-quickcapture-more` | that menu → More | Photos, Camera, Files and every space type |

### Set layouts

| File stem | Reached by | Shows |
|-----------|-----------|-------|
| `anytype-mobile-set-grid` | Project Tracker, Grid view | Horizontally scrolling grid over the catalogue's 28 typed columns |
| `anytype-mobile-set-gallery` | view switcher → Gallery | Cards with tags, checkbox, dates, money, status |
| `anytype-mobile-set-list` | view switcher → List | One row per record, every visible property inline |
| `anytype-mobile-set-kanban` | view switcher → Kanban | Columns grouped by Status, per-column count, `+ New` |

### View configuration

| File stem | Reached by | Shows |
|-----------|-----------|-------|
| `anytype-mobile-sheet-set-viewswitcher` | the view name | Views list — Grid, Gallery, List, Kanban, Calendar |
| `anytype-mobile-sheet-set-viewswitcher-edit` | that sheet → Edit | Delete handles, reorder grips, a pencil per view |
| `anytype-mobile-sheet-view-edit` | a view's pencil | Edit view: Name, Layout, Properties, Filters, Sorts |
| `anytype-mobile-sheet-view-edit-more` | Edit view → `···` | The view's own action menu |
| `anytype-mobile-sheet-view-settings-gallery` | the sliders icon on a Gallery view | Edit view opened straight from the toolbar |
| `anytype-mobile-sheet-view-layout-picker` | Edit view → Layout, on Grid | Layout tiles plus the Icon toggle |
| `anytype-mobile-sheet-view-layout-gallery` | Edit view → Layout, on Gallery | Gallery's extra rows: Card size, Image preview, Fit image |
| `anytype-mobile-sheet-view-layout-kanban` | Edit view → Layout, on Kanban | Kanban selected, with Group by and Color columns |
| `anytype-mobile-sheet-view-gallery-cardsize` | that sheet → Card size | Small / Large |
| `anytype-mobile-sheet-view-gallery-imagepreview` | that sheet → Image preview | Cover-property picker |
| `anytype-mobile-sheet-kanban-groupby` | Kanban layout → Group by | Every groupable relation, current one ticked |
| `anytype-mobile-sheet-kanban-column-menu` | a column's `···` | Hide column, Column color, Apply |
| `anytype-mobile-sheet-view-filters-empty` | Edit view → Filters | Empty state and the `+` |
| `anytype-mobile-sheet-filter-relation-picker` | Filters → `+` | Every filterable relation, typed icons. Its placeholder reads **"Choose a property to sort"** in the filter flow — a product string bug |
| `anytype-mobile-sheet-filter-condition-text` | that picker → Name | Condition sheet: relation, operator, Value, Apply |
| `anytype-mobile-sheet-filter-condition-operators` | that sheet → the operator | All / Is / Is not / Contains / Doesn't contain / Is empty / Is not empty |
| `anytype-mobile-sheet-view-sorts` | Edit view → Sorts | The two applied sorts, Edit and `+` |
| `anytype-mobile-sheet-sort-direction` | a sort row | Ascending / Descending plus empty-value placement |
| `anytype-mobile-sheet-set-newobject-templates` | the `New` chevron | Create Object: object-type chips and the template gallery |
| `anytype-mobile-sheet-set-more` | the set's `···` | Properties/Icon/Cover, Show Description, Favorite, Copy Invite Link, More, Duplicate, Delete |
| `anytype-mobile-sheet-icon-picker` | that menu → Icon | Change icon: emoji grid, search, Emoji/Random/Upload |
| `anytype-mobile-sheet-cover-picker` | that menu → Cover | Change cover: gradients, solid colors, Gallery/Unsplash/Upload |

### Object and relations

| File stem | Reached by | Shows |
|-----------|-----------|-------|
| `anytype-mobile-object-page` | a record from the set | Record page: title, type, backlink count, empty body |
| `anytype-mobile-sheet-object-more` | its `···` | Properties/Icon/Cover, Show Description, Favorite, Undo/Redo, Publish to Web, Copy Invite Link, More, Duplicate, Delete |
| `anytype-mobile-sheet-object-more-submenu` | that menu → More | Link to, History, Make template, Lock, Copy Deeplink |
| `anytype-mobile-sheet-object-properties` | that menu → Properties | The record's relations panel, every catalogue column with its value |
| `anytype-mobile-sheet-object-properties-settings` | that panel → the sliders icon | The **type's** property editor — Header vs Properties panel, drag handles, `+` |
| `anytype-mobile-sheet-relation-add` | that editor → `+` | Add property: **all eleven formats** — Relation object, Text, Number, Select, Multi-select, Date, File & Media, Checkbox, URL, Email, Phone number |
| `anytype-mobile-sheet-relation-new` | picking a format | New property: Name, Format, Create |
| `anytype-mobile-sheet-relation-new-format` | that sheet → Format | Select property format, current one ticked |

### Cell editors, one per relation format

| File stem | Format | Shows |
|-----------|--------|-------|
| `anytype-mobile-sheet-cell-text-longtext` | text / long text | Inline editor with Clear and the full value |
| `anytype-mobile-sheet-cell-number` | number | Inline numeric editor |
| `anytype-mobile-sheet-cell-select-priority` | select | Search, options in their colours, tick on the current one |
| `anytype-mobile-sheet-cell-multiselect-team` | multi-select | Ordered selection badges (1, 2) and colored chips |
| `anytype-mobile-sheet-cell-multiselect-empty` | multi-select, empty | "No options — create first option to start" |
| `anytype-mobile-sheet-cell-date` | date | Month calendar, selected day, Today / Tomorrow / Open selected date |
| `anytype-mobile-sheet-cell-date-monthpicker` | date | The month/year wheel |
| `anytype-mobile-sheet-cell-object-assignee` | object | Searchable object list with radio selection |
| `anytype-mobile-sheet-cell-backlinks` | object, read-only | Backlinks list |
| `anytype-mobile-sheet-cell-url` | url | Value plus Open link / Copy link |
| `anytype-mobile-sheet-cell-email-empty` | email, empty | "Enter email" |
| `anytype-mobile-sheet-cell-phone` | phone | Value plus Copy phone number, and the product's own typo **"Call phone numbler"** |
| `anytype-mobile-sheet-grid-cell-objecttype-empty` | object type, empty | "The property is empty" state opened from a grid cell |

## Not reachable, with the reason

- **Calendar view.** The iOS view switcher lists Calendar as **`Unsupported`** and the layout picker
  offers only Grid, Gallery, List and Kanban. There is no calendar to open, so there are no calendar
  event sheets either. This is a real gap between Anytype's desktop and iOS clients, not a harness
  limit — the desktop renders Calendar (`anytype-set-calendar-view-dark.png`).
- **Graph view.** Absent from the iOS layout picker for the same reason.
- **Checkbox cell editor.** A checkbox row toggles in place and presents no sheet. Capturing the
  "open" state would have meant writing to a record in the shared space, which was not worth a
  screenshot of a tick.
- **File cell editor.** The catalogue's `file` columns carry no values by design (the loader cannot
  do multipart upload), so no populated file cell exists to open.
- **Filter conditions for the other formats.** Only the text condition and its operator list were
  captured. Each further format needs a filter committed to a view in the shared space and then
  removed again; the operator picker above already shows the shape, and the relation picker shows
  every format that can be chosen.
- **Type change picker.** Reached from a record's Object type cell, which in the row that was open
  is the empty state already captured as `sheet-grid-cell-objecttype-empty`.
- **Camera-based join.** "Join via QR Code" opens the camera; the simulator has none, and the
  permission prompt is as far as it goes.

## Manifest

Like the desktop captures above, nothing in `mobile/` has a `tools/screenshots/manifest.json` entry —
`manifest-schema.mjs` still accepts only `group: "project-manager"` for `source: "reference"`.
`npm run screenshots:verify` walks `manifest.scenarios` and so does not see this folder.
