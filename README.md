# Obnotion

Obnotion adds database views to [Obsidian](https://obsidian.md). Each database is an ordinary Markdown file with `db_view: true` in its frontmatter; its records are notes in your vault, and their property values live in frontmatter. Table, board, chart, calendar, and timeline views read and write those same files, and each view's configuration is saved in the database file beside the data. Records, properties, and relations stay in the vault as plain Markdown.

## Project status

This plugin is in early alpha. It is currently built and verified by AI agents, with no human designer in the loop yet. Expect rough edges and breaking changes between releases. Once the plugin is stabilised and stress-tested, a human designer will create custom designs so it feels like a native Notion-like experience inside Obsidian.

Obnotion is a fork of pangy9's [Note Database](https://github.com/pangy9/obsidian-note-database).

Source: [MichelKerkmeester/obsidian_notion-clone](https://github.com/MichelKerkmeester/obsidian_notion-clone)

## Views

A database can hold several saved views over the same notes, each with its own filters, sorting, grouping, visible properties, and layout. Five view types are available:

- **Table** — editable cells, column resize and reorder, range selection with copy, cut, paste, and fill, keyboard navigation, bulk editing, and single-step undo.
- **Board** — cards grouped by a select or status property, with optional subgroups, card covers (property, fit mode, and aspect ratio), a configurable card field list, hidden groups, and manual card order.
- **Chart** — bar, horizontal bar, line, area, pie, donut, number, stacked, grouped, percent-stacked, and mixed charts, with count, sum, average, and other aggregations, date and numeric bucketing, color palettes, reference lines, and drilldown into the records behind a value.
- **Calendar** — month, week, and day grids. Records are placed by date or datetime properties, with an optional end date for multi-day events and optional title and color properties.
- **Timeline** — day, week, month, quarter, and year scales, with optional grouping lanes, title, color, and end-date properties.

Databases configured as gallery or list views in older versions are migrated on first open: a gallery becomes a board, a list becomes a table, and each conversion shows a one-time notice. The gallery notice offers an Undo action.

A database view can be embedded in any note as a code block; the **Create linked view** command inserts one.

## Properties

Records expose frontmatter as typed properties:

- Text, number, currency, date, datetime, checkbox
- Select, multi-select, and status, with colored options and reusable status presets
- Files

## Formulas and relations

- **Formulas** — computed properties defined by an expression, producing number, text, date, datetime, or checkbox values. A formula can stay display-only or write its result back to frontmatter.
- **Relations** — connect a record to records of another database. Relation values are stored as Obsidian wikilinks in frontmatter.
- **Rollups** — derive a value over a relation property: count, sum, average, median, min, max, range, earliest, latest, percent empty, percent filled, or a list of values. Rollups are display-only and are never written to frontmatter.

## Filters, sorts, groups

- **Filters** — per-property rules (equals, contains, has tag, greater/less than, empty, not empty), combined with AND/OR logic, nested NOT groups, or a raw expression.
- **Source rules** — choose which notes a view collects by folder, tag, property, link, or expression, with the same AND/OR/NOT logic.
- **Sorts** — an ordered list of sort rules per view, drag-reordered, each ascending or descending.
- **Groups** — group by one or more properties, reorder groups, hide or collapse empty groups, group date properties by exact value or by day, and attach per-group summaries such as count, sum, average, median, min/max, checked, or earliest/latest.

## Mobile sheets

On a phone, most panels, menus, and dialogs present as bottom sheets rather than desktop popovers. A sheet has a grab handle that closes it when dragged down, a titled header with a close button, padded rows, segmented choices, keyboard-aware repositioning, and safe-area padding for notched devices. Record detail panels and the table row peek are bottom sheets with drag-to-dismiss. Wide surfaces such as the formula editor open full-screen; some short prompts stay centred dialogs on every device.

The plugin runs on both desktop and mobile. The **Trace sheet lifecycle** setting records what happens to a phone sheet — taps, rebuilds, dismissals, viewport changes, element tags and classes only, never note content — and the **Copy sheet trace** command puts that log on the clipboard for reporting a phone-only defect.

## Commands

A ribbon icon opens the dashboard. The command palette offers:

- Open dashboard
- Show database files
- Create linked view
- Undo last database edit
- Convert .base file to database
- Import CSV + Markdown files
- Export current database view as CSV + Markdown ZIP
- Copy sheet trace
- Configure Reports computed fields

## Settings

- **Language** — System, English, Simplified Chinese, or Traditional Chinese.
- **Default output folder** — the vault path for generated database files and for new notes when a database has no folder of its own.
- **Where a record opens** — Record panel, Preview layer, Current tab, Split pane, or New window.
- **Default view for new databases** — table, board, chart, calendar, or timeline.
- **Always open database files in new tab** and **Prevent duplicate database file tabs**.
- **Show database icon** — the icon slot in the database header.
- **Trace sheet lifecycle** — phone sheet diagnostics.
- **CSV + Markdown import/export** — import a CSV with Markdown files, or export the current view as a ZIP of CSV, Markdown, and metadata.
- **Plugin trash** — deleted databases are kept in a plugin trash and can be restored or permanently deleted.
- **Global status presets** — reusable option lists for status properties, with a global default.
- **File-type databases** — the list of database files, with reordering, open, delete, and a **New database file** button.

## Installation

Requires Obsidian 1.7.2 or later.

**BRAT** — install the BRAT community plugin, then add `MichelKerkmeester/obsidian_notion-clone` as a beta plugin.

**Manual** — download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/MichelKerkmeester/obsidian_notion-clone/releases/latest) into `<vault>/.obsidian/plugins/obnotion/`, reload Obsidian, and enable Obnotion under Community plugins.

## Releases

Every milestone is published as a [GitHub release](https://github.com/MichelKerkmeester/obsidian_notion-clone/releases). Publishing a release is what makes the build installable through BRAT and on mobile.

## Credits

Obnotion is a fork of [Note Database](https://github.com/pangy9/obsidian-note-database) by pangy9. The original plugin, its design, and its implementation are upstream's work.

## License

[MIT](LICENSE), inherited from the upstream project.
