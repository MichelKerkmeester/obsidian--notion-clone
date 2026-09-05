# Anytype — capture index

Everything in this folder is a reference capture for comparing our board and property surfaces
against Anytype. It is not tracked by `tools/screenshots/manifest.json` — see the packet note at
the bottom of this file for why. Two kinds of file live here: official product images (`*-official.*`,
documented in `sources.md`) and screenshots of the locally installed app (`*-dark.png`).

## Installed app

- **Version**: 0.56.5 (from the app's own `Anytype` menu → `?` Help is click-only and unreachable in
  this environment; the version is the Homebrew cask version at install time, `brew info --cask
  anytype`, cross-checked against the app's own About panel where reachable — see the input
  limitation note below).
- **Install source**: Homebrew cask (`brew install --cask anytype`), local-only, never signed in to
  an Anytype Network account or workspace.
- **Workspace**: the default local space created on first launch ("Get Started"), plus one page I
  created named `notion-clone-reference-demo` holding an inline Collection with 7 named demo rows
  (`Design onboarding flow`, `Fix login bug`, `Write release notes`, `Update pricing page`,
  `QA pass`, `Ship v2`, `Test Tab Row`) and 3 unnamed rows created by exploratory keystrokes. Every
  other object shown (`Welcome to Anytype`, `Playground Page`, the `Collections` type list) is the
  app's own shipped content, viewed but not edited.
- **Theme**: dark only. See the limitation note.

## A note on how these were captured, and why the list is shorter than asked

The operator asked for a full UI/UX tour: every set view type, the view switcher, filter/sort
panels with a condition open, the property/relation editor, context menus, hover states, and more.
**None of the mouse-driven surfaces in that list were reachable.** This environment has no working
path to a simulated mouse click:

- Raw `CGEvent` clicks (Quartz, from Python) post with no error and have no effect.
- `System Events`'s `click at {x, y}` fails outright: `osascript is not allowed assistive access`
  (-25211).
- Anytype's content area exposes no accessibility tree to click *through* either — the whole window
  body is one opaque `AXGroup`; only the native traffic-light buttons are real accessibility
  elements.

What **does** work: `System Events` `keystroke`/`key code` (sent to whatever is frontmost), and
clicking native macOS menu-bar items (`File`, `Edit`, the app menu) via the accessibility API's
menu-item action, which is a different, less-restricted code path than a coordinate click. Every
capture below was reached through some combination of: `Cmd+K` (search/quick-switcher), `Cmd+N`
(new object), `/` (slash menu), arrow keys + Return inside those overlays, and Escape. Anything that
required clicking a view tab, a toolbar icon, a cell, or a context menu in the canvas itself was not
reachable, including the theme toggle (it lives in Settings → Preferences, and that panel's sidebar
is not keyboard-navigable either) — **so no light-theme captures exist for the installed app.**

The demo page `notion-clone-reference-demo` (and the `New Collection` object inside it) could not be
deleted for the same reason — Anytype's own docs confirm deletion is click/checkbox-driven (Bin →
select → Delete), with no keyboard shortcut, and neither app exposes a "Delete" native menu item.
**The operator needs to delete it manually** — one right-click on the page in the sidebar, or open
it and use its `···` menu → Delete/Move to Bin. Nothing else in the vault was touched.

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
| `anytype-page-with-inline-collection-dark.png` | Installed, dark | The `notion-clone-reference-demo` page showing its embedded collection preview |
| `anytype-collection-fullpage-onboarding-dark.png` | Installed, dark | The collection opened as its own full page, with the "Change Types Easily" onboarding tooltip and its toolbar (search, filter, sort, view-settings, New) |
| `anytype-collection-grid-populated-dark.png` | Installed, dark | The same full-page Grid view with all 10 demo rows named/created |
| `anytype-type-collections-list-dark.png` | Installed, dark | The system `Collections` Type page — every Collection-type object in the space, with Templates/Edit Type actions |
| `anytype-object-page-empty-dark.png` | Installed, dark | A single demo row (`Fix login bug`) opened as its own object page |
| `anytype-settings-account-tooltip-dark.png` | Installed, dark | Settings → Account page, with the "Join the Anytype Network" membership tooltip |
| `anytype-settings-account-dark.png` | Installed, dark | Settings → Account page, tooltip dismissed — local profile name, local Anytype Identity key (not a login credential) |

**23 files total**: 5 official + 18 installed-app captures.

## Views not captured, and why

- **Kanban, Calendar, Gallery, List of the demo collection** — reaching them requires clicking a
  view tab in the collection's toolbar. Not reachable; see the limitation note above. The **official**
  Kanban/Calendar/Gallery images cover what these views look like.
- **Timeline/gantt** — Anytype has no timeline or gantt view (confirmed against the product's own
  view documentation and its community's open feature-request threads for one). Not applicable
  rather than uncaptured.
- **Property/relation editor opened on a cell, filter/sort panel with a condition, view switcher,
  type picker, context menus, hover states, graph view, widgets/home** — all require a click inside
  the canvas-rendered content area. Not reachable.
- **Light theme** — the toggle lives in a Settings panel whose sidebar is not keyboard-navigable.
  Not reachable.

## Manifest

`tools/screenshots/manifest-schema.mjs` accepts only `group: "project-manager"` for a `source:
"reference"` entry, and only `pm-kanban`/`pm-gantt` as reference renderers (`:52`, `:118`). Widening
that contract is explicitly a different leg of this packet (`047-competitor-references-and-pm-
alignment`'s contract-widening task), not this capture pass, so **no manifest entry exists for
anything in this folder** and `screenshots/manifest.json` is untouched. `npm run screenshots:verify`
does not see this folder — it only walks `manifest.scenarios` — so it is unaffected either way.
