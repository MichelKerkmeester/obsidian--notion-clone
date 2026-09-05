# AppFlowy — capture index

Everything in this folder is a reference capture for comparing our board and property surfaces
against AppFlowy. It is not tracked by `tools/screenshots/manifest.json` — see the packet note at
the bottom of this file for why. Two kinds of file live here: official product images (`*-official.*`,
documented in `sources.md`) and screenshots of the locally installed app (`*-dark.png`).

## Installed app

- **Version**: 0.14.1 (0.14.1) — read directly from the app's own About dialog
  (`AppFlowy` menu → `About AppFlowy`), matching `brew info --cask appflowy`.
- **Install source**: Homebrew cask (`brew install --cask appflowy`), local-only ("My Workspace"),
  never signed in to an AppFlowy Cloud account.
- **Workspace**: the default local workspace created on first launch (`General` space: `Untitled`,
  `Getting started`, `To-dos`) — all shipped template content, viewed but not edited or deleted.
  No demo page was created in AppFlowy; the shipped `To-dos` board already exercises the Kanban
  surface with real cards, so a duplicate demo database was not built on top of it.
- **Theme**: dark only. See the limitation note.

## A note on how these were captured

Same input constraint as the Anytype folder in this packet: no simulated mouse click works in this
environment (`CGEvent` posts silently, `System Events`'s `click at` is refused outright with
"osascript is not allowed assistive access", and AppFlowy's own content area is one opaque
accessibility group, same as Anytype's — confirmed by walking its AX tree). What worked: `Cmd+P`
(AppFlowy's search/quick-switcher — its `Cmd+K` did not open anything, `Cmd+P` did), arrow keys +
Return inside that palette, and — this one only reachable through the **native macOS menu bar**,
not the in-app canvas — `About AppFlowy` and `Settings…` under the `AppFlowy` application menu,
clicked via the accessibility API's menu-item action rather than a coordinate click. `Settings…`
did not visibly open anything when invoked this way, so no settings/appearance capture exists and
no theme toggle was reachable.

The `To-dos` board's Kanban view was reached by searching for it by name and pressing Return — a
genuine, populated Board view, but it belongs to the app's shipped starter content, not a page I
built. Its Grid/Calendar counterparts (if the database has alternate views registered) sit behind a
tab-bar `+` in the canvas, which needed a click, so they were not reached.

## Mock-data catalogue and CSV import — skipped by operator decision 2026-09-05

Later in this capture pass the operator asked for a richer, multi-use-case demo dataset in both
apps, loaded from a shared `tools/mock-data/catalogue.json` (plus one CSV per use case) that a
parallel packet-049 leaf was generating. That file had not landed on `origin/main` after 30 minutes
of polling (`git fetch` + `git ls-tree`, three checks, 10 minutes apart), and in any case AppFlowy's
CSV import is entirely click-driven (a toolbar button, a file picker, a column-mapping dialog) with
no DOM to script — AppFlowy is Flutter, rendered to a single GPU-backed canvas, so it has no CDP
target and no accessibility tree at all (confirmed: the AX tree under its window is one opaque
`AXGroup`, same as Anytype's before CDP, but AppFlowy has no equivalent remote-debugging escape
hatch since it isn't Chromium). **2026-09-05, ~11:15: the operator decided to skip the AppFlowy
CSV import outright** — "Skip AppFlowy installed captures" — rather than spend the roughly 10
minutes of real mouse clicks it would take on their own Mac. See
`specs/005-component-surface-system/047-competitor-references-and-pm-alignment/decision-record.md`
ADR-002 and the `049-test-environments-and-mock-data/decision-record.md` ADR-001 mirror. The CSVs
and the exact steps are **retained rather than discarded**, for whenever a future operator window
opens: **Sidebar → the target space → `+` next to the space name → "Import" → CSV →
pick the use-case file → map each catalogue column to a database property (matching its typed
column, e.g. a `status` column to a Select property, a `due_date` column to a Date property) →
confirm.** Repeated once per use-case CSV once the catalogue path is known — the ten CSVs live in
`tools/mock-data/csv/`. Nothing was imported in this pass; the capture below is the same `To-dos`
board already documented, re-confirmed unchanged.

## Captures

| File | Origin | Shows |
|------|--------|-------|
| `appflowy-board-official.webp` | Official — appflowy.com homepage | Kanban/board view, "Project Tracker" marketing render |
| `appflowy-table-official.webp` | Official — appflowy.com homepage | Grid/table view, "Core Engineering Tasks" marketing render |
| `appflowy-calendar-official.png` | Official — appflowy.com blog (2023) | Calendar view, month grid, "Book List" demo |
| `appflowy-properties-official.png` | Official — appflowy.com blog (2023) | Record-detail / property-editing popup |
| `appflowy-sidebar-default-dark.png` | Installed, dark | Fresh local workspace: sidebar (General space: Untitled, Getting started, To-dos) |
| `appflowy-search-palette-dark.png` | Installed, dark | `Cmd+P` search palette, empty query — "Ask AI anything" prompt |
| `appflowy-search-results-dark.png` | Installed, dark | Search palette with a typed query, showing the AI-overview answer plus "Best matches" |
| `appflowy-board-installed-dark.png` | Installed, dark | The shipped `To-dos` database's Board view — No Status / To Do / Doing / Done columns, real cards including a subtask checklist at 50% |
| `appflowy-about-dialog.png` | Installed | Native `About AppFlowy` dialog — version 0.14.1 (0.14.1) |

**9 files total**: 4 official + 5 installed-app captures (4 screenshots + 1 About dialog).

## Views not captured, and why

- **Grid/table, Calendar, Gallery of an AppFlowy database** — reaching an alternate view of the
  `To-dos` database (or building one) requires clicking a view tab or the tab bar's `+`. Not
  reachable. The **official** Grid and Calendar images cover what those views look like.
- **Timeline/gantt** — not among the database view types AppFlowy documents anywhere checked
  (homepage, `appflowy.com/terms` structured data, docs, GitHub README: "Grid, Kanban, Calendar,
  Gallery, List, Feed, Chart" — no gantt/timeline). Not applicable rather than uncaptured.
- **Gallery** — the product has one per its own terms-page structured data, but no gallery view was
  reachable in the installed app (same click limitation) and no official gallery screenshot was
  found on an approved domain; see `sources.md`.
- **Property-editing sheet on an installed card** — opening a card's detail view needs a click; the
  search palette can navigate to a database but not into a row's own expanded card. The **official**
  properties image covers this view.
- **Light theme, Settings/Appearance panel** — `Settings…` did not visibly respond to a native-menu
  click, and no other path to it was found without clicking the in-app gear icon.

## Manifest

`tools/screenshots/manifest-schema.mjs` accepts only `group: "project-manager"` for a `source:
"reference"` entry, and only `pm-kanban`/`pm-gantt` as reference renderers (`:52`, `:118`). Widening
that contract is explicitly a different leg of this packet, not this capture pass, so **no manifest
entry exists for anything in this folder** and `screenshots/manifest.json` is untouched. `npm run
screenshots:verify` does not see this folder — it only walks `manifest.scenarios` — so it is
unaffected either way.
