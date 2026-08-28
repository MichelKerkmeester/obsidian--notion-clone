# Research Iteration 06: Anytype UI/UX Patterns Worth Adopting (Object-Oriented UI, Sidebar, Blocks, Sets/Collections)

Track: `devin-gemini` (Gemini 3.7 Flash High)  
Focus Area: Anytype UI/UX patterns worth adopting (object-oriented UI, sidebar, blocks, sets/collections).  
Target Artifact: `specs/public/002-ui-improvement-research/research/devin-gemini/iteration-06.md`  

---

## Focus

Anytype represents the state-of-the-art in local-first, object-oriented personal knowledge management. Unlike traditional folder-bound spreadsheets, Anytype treats every document as a typed **Object** (e.g. *Task*, *Project*, *Bookmark*, *Contact*, *Note*, *Book*) possessing structured **Relations** (properties), customizable **Type Archetypes**, bidirectional **Linked Relations**, and modular **Block Embeds**. Crucially, Anytype rigorously differentiates between **Sets** (dynamic, query-driven smart views that automatically aggregate objects matching specific criteria) and **Collections** (manual, curated spaces or folders).

In this iteration, we evaluate the forked Note Database plugin through the lens of Anytype's object-oriented architecture. We examine:
1. **Object-Oriented UI & Object Detail / Peek Inspector**: How records are inspected, edited, and contextualized across views (`src/views/TableRecordPeek.ts`, `src/views/RecordDetailPanel.ts`, `src/views/CellRenderer.ts`).
2. **Sets vs. Collections Mental Model**: How database data sources (`sourceFolder` vs. `sourceRules` vs. `sourceRuleTree`) are represented, configured, and created (`src/views/modals/AddDatabaseModal.ts`, `src/data/SourceRules.ts`, `src/data/DataSource.ts`).
3. **Bidirectional Relations & Graph Rollups**: How inter-note links and reverse relations are computed and surfaced (`src/data/RelationInverse.ts`, `src/data/RelationRollup.ts`, `src/views/RelationValueRenderer.ts`).
4. **Block-Level Database Embedding**: How database codeblocks render inside markdown pages and whether they support compact inline headers and contextual dynamic filters (`src/views/EmbeddedDatabaseRenderer.ts`, `src/data/QueryEngine.ts`).
5. **Sidebar & Workspace Navigation**: How databases, sets, and views are discovered, organized, and navigated in Obsidian (`src/main.ts`, `src/views/DatabaseView.ts`, `src/views/ToolbarRenderer.ts`).
6. **Object Archetypes & Multi-Template Creation**: How new records are scaffolded with types, icons, and templates (`src/data/TemplateToolbarAction.ts`, `src/data/CreateEntryPlan.ts`, `src/views/RecordIconRenderer.ts`).

---

## Current-UI findings (file:line)

### 1. Fragmented Record Inspection: Plain-Text `TableRecordPeek` vs. Isolated `RecordDetailPanel`
- **Location**: `src/views/TableRecordPeek.ts:215-224`, `src/views/RecordDetailPanel.ts:153-196`, `styles.css:16317-16428`, `styles.css:7569-7645`
- **Issue**: The plugin has two completely disconnected record inspection architectures:
  1. `TableRecordPeek.ts:215-224` renders a right-docked panel (`.db-record-peek-panel`) for Table view rows, but renders property values using literal plain text `stringifyValue(getColumnValue(row, column))`. It lacks interactive editing, option badges, status colors, date formatting, rating stars, or relation links.
  2. `RecordDetailPanel.ts:153-196` renders an interactive floating popover with rich cell renderers and inline editing, but is strictly wired to Calendar and Timeline events (`DatabaseView.ts:358, 388`).
  3. Board, Gallery, and List views have **zero** peek drawer support—clicking a card or item immediately invokes `dataSource.openNote(row.file)` (`DatabaseView.ts:569, 615, 646`), destroying the database view context and navigating away from the board.
- **UX Impact**: Inconsistent mental model and high interaction friction. Users cannot smoothly peek or edit records side-by-side in Table, Board, Gallery, or List views without either staring at raw stringified text or leaving the database entirely.

### 2. Inbound Inverse Relations Computed in Memory but Completely Invisible in UI
- **Location**: `src/data/RelationInverse.ts:29-87`, `src/data/RelationRollup.ts:72-85`, `src/views/TableRecordPeek.ts:130-180`
- **Issue**: `RelationInverse.ts` contains an indexed engine (`buildRelationInverse`, lines 39–87) that traverses the vault metadata cache to calculate all incoming wikilink edges (`inboundByPath: Map<string, RelationInverseEdge[]>`). However, this rich graph data is strictly consumed by `RelationRollup.ts:72-85` for numeric rollups. It is **never** surfaced as a navigable "Linked Records / Incoming Relations" list in `TableRecordPeek.ts`, `RecordDetailPanel.ts`, or table cells.
- **UX Impact**: The plugin misses Anytype's most powerful object-oriented feature: automatic bidirectional navigation. For instance, looking at a "Project" note record in the database cannot show the list of "Tasks" linking to it, even though the data is already computed and indexed in memory.

### 3. Generic `file-text` Icon Hardcoded on All Relation Badges
- **Location**: `src/views/RelationValueRenderer.ts:24-25`, `styles.css:4870-4910`, `src/views/RecordIconRenderer.ts:18-51`
- **Issue**: When rendering relation links (`renderRelationValue`), the renderer explicitly hardcodes `setIcon(icon, "file-text")` (line 25). It never queries the target note's frontmatter icon (or target database icon) via `RecordIconRenderer.ts`.
- **UX Impact**: In rich relational databases (e.g. Linking a Task to a Project 🚀, a Person 👤, and a Book 📚), all relation pills look identical with a generic gray text file icon, eliminating visual scanning efficiency and feeling primitive compared to Anytype's rich object badges.

### 4. Dead-End Empty State in Relation Cell Search Picker
- **Location**: `src/views/CellRenderer.ts:760-788`, `styles.css:4580-4650`
- **Issue**: When searching for a target note inside `editRelationPopover` (`CellRenderer.ts:734-788`), if the typed search text does not match any existing record in `records`, the option list renders completely blank. There is no "+ Create '[query]' in [Target Database]" action button.
- **UX Impact**: To link a new record that does not yet exist, the user must abandon the relation picker, exit the current database, navigate to the target database or folder, create the note, return to the first database, reopen the relation cell, and select it. This creates immense friction for relational workflows.

### 5. Bloated Markdown Codeblock Embeds Lacking Compact Inline-Block Mode
- **Location**: `src/views/EmbeddedDatabaseRenderer.ts:1486-1514`, `src/views/EmbeddedDatabaseRenderer.ts:1965-1978`, `styles.css:15100-15180`
- **Issue**: When a database is embedded into a markdown document via ````note-database ... ````, it defaults to rendering the entire database hero header (title, description, switcher, search bar, 12 toolbar buttons), consuming over 140px of vertical space. While `.db-embed-header-toggle` allows hiding the header, doing so hides the entire `.db-header` wrapper, which **also strips the view switcher tabs**, making it impossible to switch views in the embedded block.
- **UX Impact**: Users cannot embed sleek, low-profile database widgets (like an inline 5-row task list or gallery strip with view tabs) inside daily notes or dashboard pages without either wasting huge vertical space or losing view tabs entirely.

### 6. Embedded Databases Lack Dynamic Contextual Variables (`$this` / `{{current_file}}`)
- **Location**: `src/data/SourceRules.ts:7-28`, `src/data/QueryEngine.ts:1-80`, `src/views/EmbeddedDatabaseRenderer.ts:1932-1947`
- **Issue**: When embedding a database in a note template (e.g. A "Project" template containing an embedded "Tasks" table), the query engine and source rules only accept static string values. There is no support for dynamic variables such as `$this.path`, `$this.name`, or `$this.file` to automatically filter records where `project == current_page`.
- **UX Impact**: Users cannot build modular, reusable Anytype-style page templates where an embedded database automatically displays only the children or related items of the enclosing note.

### 7. Ambiguous Database Creation Conflates Dynamic Sets and Static Folders
- **Location**: `src/views/modals/AddDatabaseModal.ts:29-82`, `src/data/SourceRules.ts:110-145`, `src/data/DataSource.ts:950-980`
- **Issue**: `AddDatabaseModal` presents a single uniform form where `sourceFolder` (folder scanning) and `sourceRules` (frontmatter queries) are mixed together. First-time users are confused about whether a database is a "Folder View" (Collection) or a "Smart Query Set" (Set). If a user configures a folder and later adds a tag rule, the relationship between file system location and query matching is opaque.
- **UX Impact**: Violates Anytype's clear mental separation between **Sets** (query-driven type aggregations across the entire vault) and **Collections** (folder/manual curated lists), leading to misconfigured databases and lost records.

### 8. Monolithic Single-Template Constraint Lacking Multi-Archetype Support
- **Location**: `src/data/TemplateToolbarAction.ts:6-32`, `src/data/CreateEntryPlan.ts:28-78`, `src/views/ToolbarRenderer.ts:1716-1739`
- **Issue**: A database only stores a single optional template path (`currentDb.newRecordTemplate.path`). In complex databases (such as a "Library" database storing "Book", "Article", and "Video", or a "CRM" storing "Client" and "Partner"), clicking `+ New` can only ever apply one hardcoded template.
- **UX Impact**: Users are forced to create separate databases for each sub-type or manually re-tag notes after creation, rather than selecting an object archetype directly from the `+ New` creation menu.

### 9. Database Navigation Buried in Title Popover Lacking Workspace Sidebar Leaf
- **Location**: `src/main.ts:270-315`, `src/views/DatabaseView.ts:760-800`, `src/views/ToolbarRenderer.ts:430-490`
- **Issue**: Switching between databases is locked inside the title button dropdown popover (`renderDatabasePopover`). The plugin registers only `DATABASE_VIEW_TYPE` (main tab view), providing no dedicated Obsidian workspace sidebar leaf view to organize, categorize, or pin databases, sets, collections, and views.
- **UX Impact**: In large vaults with 15+ databases, discovering and navigating databases requires opening a database tab, clicking the title, and scrolling through an un-nested popup list, rather than having a persistent Anytype-style Space/Set Navigator sidebar.

### 10. Missing "+ Add Property" Affordance in Record Detail / Peek Panels
- **Location**: `src/views/TableRecordPeek.ts:153-179`, `src/views/RecordDetailPanel.ts:187-195`
- **Issue**: When viewing a record in `TableRecordPeek` or `RecordDetailPanel`, there is no affordance to add a new property to the record or database. If the user realizes a field is missing (e.g. adding a "Priority" property while reviewing a task), they must dismiss the panel, open the table header or settings drawer, create the column, and re-open the record.
- **UX Impact**: Breaks the fluid, object-centric editing experience pioneered by Anytype and Notion, where properties can be created on the fly directly from the object inspector.

### 11. Static Fixed Property Ordering in Detail Inspector
- **Location**: `src/views/RecordDetailPanel.ts:187-195`, `src/views/TableRecordPeek.ts:146-156`, `styles.css:7604-7635`
- **Issue**: Properties in the detail inspector strictly render in table column order. Users cannot drag to reorder properties on the object card or promote "Featured Relations" to the top of the detail sheet without altering the table column layout.
- **UX Impact**: On wide tables with 25 columns, viewing a record in peek mode requires scrolling past low-priority fields to reach important relations.

### 12. Clunky Text/Popover Checkbox Fields in Record Details
- **Location**: `src/views/RecordDetailPanel.ts:231-255`, `src/views/CellRenderer.ts:220-245`, `styles.css:7613-7624`
- **Issue**: Boolean/checkbox properties in `RecordDetailPanel` render as small square icons or text values that require precise clicks. They lack the tactile, full-row toggle switch component standard in Anytype and mobile inspector panels.
- **UX Impact**: Toggling boolean properties on object sheets feels clumsy, especially on touchscreen tablets and mobile devices.

---

## Anytype/AppFlowy patterns

### 1. Anytype: Unified Object Inspector & Multi-Mode Peek (Side Peek / Center Modal / Full Page)
- **Pattern**: Anytype provides a single, universal Object Inspector across all views (Grid, Kanban, Gallery, List, Calendar). When clicking any object, it opens in one of three user-configurable Peek Modes:
  - **Side Peek**: Docked right sidebar panel allowing continuous browsing of the database on the left while editing properties and markdown body on the right.
  - **Center Modal**: Focused floating modal overlay with dimmed background scrim for deep property editing.
  - **Full Page**: Opens the note as a full workspace tab.
  - The inspector features: Object Icon & Type pill badge with inline rename, Interactive Relations list with instant pickers, "+ Add Relation" button, and Collapsible Empty Properties accordion.
- **Why it is better**: Eliminates view fragmentation. Users get identical, high-fidelity property editing and markdown preview regardless of whether they click a table row, kanban card, gallery tile, or calendar event.

### 2. Anytype: Automated Bidirectional Inbound Relations & Linked Record Explorer
- **Pattern**: Anytype automatically tracks bidirectional relations. When viewing an object (e.g., `Project Apollo`), the bottom of the Object Inspector or page displays a dedicated **Linked Relations / Backlinks** section showing all objects across the space that link to this object (e.g. `12 Tasks`, `3 Meeting Notes`, `2 Invoices`), complete with live status badges and 1-click navigation.
- **Why it is better**: Transforms static database rows into an interconnected knowledge graph without requiring manual backlink properties or complex rollup scripts.

### 3. Anytype: Explicit Sets (Dynamic Queries) vs. Collections (Manual Curations)
- **Pattern**: Anytype enforces a crystal-clear distinction between two container types:
  - **Set**: A dynamic query aggregating all objects in the space matching a Type and filter rules (e.g. `Type: Task` AND `Status != Done`). Any new or edited object matching the rule instantly appears.
  - **Collection**: A manual folder/scrapbook where objects are explicitly added or dragged into, allowing heterogeneous object types (e.g. A "Trip to Tokyo" collection containing bookmarks, notes, hotels, and task objects).
- **Why it is better**: Gives users a clear conceptual model. Users always understand whether adding a property/tag will cause a note to appear in a Set, or whether they must explicitly link it to a Collection.

### 4. Anytype: Rich Target Object Indicators in Relations (Custom Icon, Type Pill, Color)
- **Pattern**: In relation fields and relation pickers, target objects are rendered with their full visual identity: the target note's custom emoji or colored Lucide icon, title, and optional Type badge.
- **Why it is better**: Instantly conveys semantic meaning. A user immediately distinguishes between a linked Person, a linked Project, and a linked Document at a glance, rather than seeing monochrome text links.

### 5. Anytype & Notion: 1-Click Quick-Create in Relation Pickers
- **Pattern**: When typing in a relation field search box, if no matching object is found, the bottom of the popover dynamically generates a "+ Create '[query]' in [Target Database]" action button. Clicking it creates the record in the target database with default properties and immediately links it to the active cell.
- **Why it is better**: Reduces relational note creation from a 7-step context-switching ordeal down to a single keystroke and click.

### 6. Anytype: Compact Inline Block Embeds & Self-Referencing Dynamic Context (`$this`)
- **Pattern**: Embedded sets inside page documents feature a sleek, low-profile inline toolbar: only view tabs, compact filter pills, and `+ New` button, omitting the giant hero title/description banner. Furthermore, embedded sets support self-referencing filters (`where Relation == $this`), allowing page templates to automatically query their own sub-tasks or linked notes.
- **Why it is better**: Makes embedded databases clean, compact, and perfectly suited for structured note templates (e.g. Project hubs, Author pages, Client dossiers).

### 7. Anytype: Space & Set Navigator Sidebar Leaf
- **Pattern**: Anytype provides a persistent left sidebar containing:
  - **Types & Archetypes**: Quick access to all registered object types.
  - **Sets**: Smart query views grouped by category.
  - **Collections**: Curated manual workspaces.
  - **Pinned Favorites**: Quick shortcuts to frequently used database views.
- **Why it is better**: Solves vault-wide database discovery. Users do not have to hunt for database files in the file explorer or open multiple popovers.

---

## Recommendations

| # | Change | Target (file:line) | Inspired By | Effort | Constraint Check |
|---|---|---|---|:---:|---|
| 1 | **Universal Object Inspector & Multi-Mode Peek Drawer**: Unify `TableRecordPeek` and `RecordDetailPanel` into a universal `ObjectInspector` supporting Side Peek (docked panel), Center Modal, and Full Note modes across Table, Board, Gallery, List, Calendar, and Timeline views with full interactive cell editing. | `src/views/TableRecordPeek.ts:71-197`, `src/views/RecordDetailPanel.ts:104-220`, `src/views/DatabaseView.ts:521-674`, `styles.css:16317-16428` | Anytype Object Inspector / Notion Side Peek | **L** | Safe: display & metadata editing only; no note-body writes; mobile-safe; MIT-forkable. |
| 2 | **Inbound Linked Records Explorer in Object Inspector**: Surface `RelationInverse.inboundByPath` as an interactive "Linked Records / Inbound Relations" accordion at the bottom of the Object Inspector, showing all notes linking to the active record with live status badges. | `src/data/RelationInverse.ts:29-87`, `src/data/RelationRollup.ts:72-85`, `src/views/TableRecordPeek.ts:146-180`, `styles.css:16364-16410` | Anytype Bidirectional Links | **M** | Safe: reads in-memory relation cache; display-only; zero note writes; rebase-clean. |
| 3 | **Rich Target Record Icons in Relation Badges**: Update `RelationValueRenderer` to resolve the target note's frontmatter icon/emoji via `RecordIconRenderer.ts` (falling back to target database icon), replacing hardcoded `file-text` icons with rich visual badges. | `src/views/RelationValueRenderer.ts:24-25`, `src/views/RecordIconRenderer.ts:18-51`, `styles.css:4870-4910` | Anytype Relation Pills / Notion | **S** | Safe: pure DOM rendering enhancement using existing icon cache; iCloud-safe. |
| 4 | **1-Click Quick-Create in Relation Cell Picker**: Add an interactive "+ Create '[query]' in [Target Database]" item to `editRelationPopover` when search query has no exact match, creating and linking the note in one step. | `src/views/CellRenderer.ts:760-788`, `src/data/CreateEntryPlan.ts:28-78`, `styles.css:4580-4650` | Anytype Relation Creator / Notion | **M** | Safe: calls existing `dataSource.createNote` via approved plan; non-destructive. |
| 5 | **Explicit Set (Query) vs. Collection (Folder) Mode in Database Creation**: Add a clear "Database Type: Dynamic Query Set vs. Folder Collection" selector in `AddDatabaseModal`, setting default source rules and explaining how notes enter the view. | `src/views/modals/AddDatabaseModal.ts:29-82`, `src/data/SourceRules.ts:110-145` | Anytype Sets vs. Collections | **M** | Safe: in-memory configuration modal wizard; no schema corruption; clean rebase. |
| 6 | **Compact Inline Block Embed Mode for Markdown Notes**: Add `mode: inline-block` (or `compactHeader: true`) option to `EmbeddedDatabaseRenderer`, rendering a sleek toolbar with view tabs and quick-add while hiding the heavy 120px database title banner. | `src/views/EmbeddedDatabaseRenderer.ts:1486-1514`, `src/views/EmbeddedDatabaseRenderer.ts:1965-1978`, `styles.css:15100-15180` | Anytype Block Embeds / Notion Inline Tables | **M** | Safe: display-only CSS/DOM layout mode; preserves view switching; mobile-friendly. |
| 7 | **Dynamic Contextual Variable `$this` in Embedded Database Filters**: Support `$this.path`, `$this.name`, `$this.basename` dynamic variables in `SourceRules.ts` and `QueryEngine.ts`, enabling auto-filtering for notes related to the enclosing page in note templates. | `src/data/SourceRules.ts:7-28`, `src/data/QueryEngine.ts:1-80`, `src/views/EmbeddedDatabaseRenderer.ts:1932-1947` | Anytype Self-Referencing Sets / Notion | **M** | Safe: in-memory query evaluation resolution; display-only filtering; iCloud-safe. |
| 8 | **Dedicated Database & Set Navigator Sidebar Leaf**: Register an Obsidian workspace sidebar leaf view (`DATABASE_NAVIGATOR_VIEW_TYPE`) in `main.ts` that lists all vault databases, sets, collections, and views in a categorized tree with favorite pins and drag reordering. | `src/main.ts:270-315`, `src/views/DatabaseView.ts:760-800`, `src/views/ToolbarRenderer.ts:430-490` | Anytype Space Navigator / Obsidian Projects | **L** | Safe: workspace leaf UI component; reads existing DB configs; zero file mutations. |
| 9 | **Multi-Archetype Template Support in `+ New` Action**: Extend `DatabaseConfig.newRecordTemplate` to support multiple template archetypes (`templates: Array<{ name, icon, path, defaultFrontmatter }>`) accessible via the `+ New` split dropdown. | `src/data/TemplateToolbarAction.ts:6-32`, `src/data/CreateEntryPlan.ts:28-78`, `src/views/ToolbarRenderer.ts:1716-1739` | Anytype Object Archetypes / Notion | **M** | Safe: configuration schema extension; non-destructive note creation; backwards-compatible. |
| 10 | **Inline "+ Add Property" Trigger in Object Inspector**: Add an inline "+ Add Property" button at the bottom of the property list in `ObjectInspector` / `TableRecordPeek` that opens `CreatePropertyModal` and immediately appends the property to the active record. | `src/views/TableRecordPeek.ts:153-179`, `src/views/RecordDetailPanel.ts:187-195`, `src/views/modals/CreatePropertyModal.ts:9-70` | Anytype Inspector / Notion Property Creator | **S** | Safe: calls existing property creation flow; interactive UI shortcut only. |
| 11 | **Draggable Property Reordering in Object Detail Inspector**: Add 6-dot grip drag handles to property rows in the Object Inspector, allowing users to customize the vertical display order of properties on object sheets. | `src/views/RecordDetailPanel.ts:187-195`, `src/views/TableRecordPeek.ts:146-156`, `styles.css:7604-7635` | Anytype Featured Relations | **M** | Safe: stores display order in `ViewConfig.inspectorOrder`; display-only; rebase-clean. |
| 12 | **Tactile Switch Toggle for Boolean Properties in Object Inspector**: Replace clunky checkbox icons with smooth, 1-click iOS/macOS style switch toggles (`.db-switch-toggle`) for boolean properties in the Object Inspector drawer. | `src/views/RecordDetailPanel.ts:231-255`, `src/views/CellRenderer.ts:220-245`, `styles.css:7613-7624` | Anytype Switch Controls / iOS Human Interface | **S** | Safe: single-click frontmatter boolean mutation via existing `editCell`; touch-friendly. |

---

## Open threads for later iterations

- **Iteration 7 (AppFlowy UI/UX patterns deep dive)**: Deep dive into AppFlowy's field editor drawer, multi-column aggregation engine, formula builder syntax tree, and custom database theming architecture.
- **Iteration 8 (Views beyond table)**: Audit Kanban Board card drag physics, Gallery cover aspect ratios, Calendar multi-day event spans, and Timeline dependency arrows.
- **Iteration 9 (Micro-interactions & feedback)**: Refine cell drag-and-fill handles, column boundary reorder drop lines, optimistic mutation pulses, and tooltip delay curves.
- **Iteration 10 (Mobile / responsive / accessibility)**: Comprehensive audit of minimum 44×44px touch targets, mobile bottom sheets, WCAG AAA high-contrast modes, and WAI-ARIA landmark roles.
