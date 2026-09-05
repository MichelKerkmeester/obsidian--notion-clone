# Anytype — capture index

Everything in this folder is a reference capture for comparing our board and property surfaces
against Anytype. It is not tracked by `tools/screenshots/manifest.json` — see the packet note at
the bottom of this file for why. Two kinds of file live here: official product images (`*-official.*`,
documented in `sources.md`) and screenshots of the locally installed app (`*-dark.png`).

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
- **A worked view-switcher "+" popover appearing as a menu vs. a submenu** and a **few hover-only
  states** (e.g. a row's inline "⋮⋮" drag handle) were not specifically captured — the settings
  panel and layout picker capture the same underlying controls in their open state, which is the
  higher-value shot.
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
- **Light theme** — see "Still not reachable" above: the Settings shortcut is a main-process menu
  accelerator, unreachable from the CDP renderer target without a native-menu click.
- Everything else in the operator's expanded brief — every set layout, view switcher, view settings,
  filter, property/relation editor, type picker, new-object flow, object context menu — **was**
  reached via CDP; see the table above.

## Mock-data catalogue — landed, not yet loaded

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

## Manifest

`tools/screenshots/manifest-schema.mjs` accepts only `group: "project-manager"` for a `source:
"reference"` entry, and only `pm-kanban`/`pm-gantt` as reference renderers (`:52`, `:118`). Widening
that contract is explicitly a different leg of this packet (`047-competitor-references-and-pm-
alignment`'s contract-widening task), not this capture pass, so **no manifest entry exists for
anything in this folder** and `screenshots/manifest.json` is untouched. `npm run screenshots:verify`
does not see this folder — it only walks `manifest.scenarios` — so it is unaffected either way.

## Mobile — official (`mobile-official/`)

A later, separate pass added `screenshots/anytype/mobile-official/`: 20 official Anytype **mobile**
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
`screenshots/anytype/mobile-official/sources.md`.
