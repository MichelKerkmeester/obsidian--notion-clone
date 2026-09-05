---
title: "Design True-Up: The Fourteen Anytype Adoption Items Against the Capture Sweep"
description: "One row per adoption item: the Anytype screen it was designed against or the named gap, the pixel and timing values read off that screen, what our tree already does, and where the capture contradicts 047's code-derived research."
trigger_phrases:
  - "design true-up"
  - "capture alignment"
  - "anytype capture true-up"
  - "050 true-up"
  - "adoption item design"
  - "T001 capture read"
importance_tier: "high"
contextType: "research"
---
# Design True-Up: The Fourteen Adoption Items Against the Captures

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This is T001's output and goal D1's gate. It replaces the `capture-alignment.md` the packet was
> drafted against; the filename changed and nothing else did. Every value below was read off a file
> in `screenshots/anytype/`, off a file in `screenshots/notion-clone/`, or off a line in `src/views/`.
> Nothing here is carried over from `047`'s research unless it is labelled as such.

---

<!-- ANCHOR:headline -->
## 1. THE HEADLINE, BEFORE THE TABLE

Reading the sweep changed the packet more than it confirmed it, in two directions at once.

**Anytype ships less than the research described.** `047` read `anytype-ts` source and reported a
filter/sort chip row with dual-mode trigger icons, a per-view template override and two empty-state
flavours. The trigger icons are pixel-identical whether or not a view is filtered or sorted, and an
empty collection renders no empty state at all. **Two of the three "it does not exist" findings were
wrong, and `053`'s T001 proved them wrong by opening captures this read never opened** — see the
correction block below. What survives unamended is C1 (the icons), C3, C4, C5 and C6.

**We ship more than the packet claimed we did.** Six of the fourteen "today" premises are false
against the current tree. The chip row exists and is wired into both the full-page and the embedded
renderer. The filter and sort buttons already carry a numeric count badge. The phone filter sheet
already renders per-format condition rows and is already registered in the `sheet-grammar` lane. The
empty state has twelve reasons, not one. There is no virtualization path for an embedded view to
avoid. A viewport snapshot-and-restore mechanism already exists.

The consequence for the work is not "do less". It is that **the thresholds have to be rewritten
before D2 can be satisfied at all**: a threshold whose failing value is asserted wrongly cannot be
observed red, and six of them are in that state today.

### Corrected 2026-09-05 by `053`'s true-up — four claims in this document are wrong

`053-toolbar-and-view-controls/design-trueup.md` read the catalogue List views, the menu sweep and
the per-layout settings blocks that this read did not open, and it overturns four claims below. The
same rule that made a capture beat `047` (ADR-003) makes a capture that was **read** beat a capture
that was **not**. Each is corrected at its own site; they are gathered here so a reader meets them
before the tables that used to be wrong.

| This document said | `053` T001 shows | Corrected at |
|---|---|---|
| **C2**: no chip row on any capture, including the view that carries a filter | The chip rail is on **eleven** captures — `anytype-project-tracker-list-light.png` and its dark pair, `anytype-crm-contacts-deals-list-light.png`, `anytype-reading-list-list-light.png`, `anytype-course-notes-list-light.png`, `anytype-content-calendar-list-light.png` and `anytype-menu-set-viewlist-dark-full.png` — and it is **conditional**: present on 5 of 5 List views (each carrying a filter), absent on Grid, Gallery, Kanban, Calendar and Graph in the same sets. Measured: 28px chip, r≈14, ~12px horizontal padding, 99px wide, fill `#E2ECFE` light / `#1D2739` dark, on a rail band at y 274..301 under a 1px divider at y 261 (`053` design-trueup D1, T14) | C2, REQ-001 |
| **C7**: no per-view default exists in the shipped product | It exists, one surface over from the panel this read searched: the `New ⌄` split button's menu carries a `Settings` section with `Default Type for this View   Page ›` and `Template for this View   Blank ›`, each opening its own anchored picker. `anytype-menu-set-new-object-light.png`, with `-default-type-for-this-view-` and `-template-for-this-view-` pairs (`053` D2, T10) | C7, REQ-010 |
| **REQ-013**: Anytype's filter panel "is a 360px frame whose entire body is one `+ New filter` row" | That is the **empty state**. The populated panel is captured across **twelve relation formats** — checkbox, date, email, file, multiselect, number, object, phone, select, text-long, text-short, url — as `menus/anytype-menu-set-filter-{format}-light.png` each with a `-condition-` pair, plus the date picker, the relative-date picker and four mobile filter sheets (`053` D3, T15/T16) | REQ-013 |
| **60** is "Anytype's own captured default page limit", adopted flat | The page limit is **per-layout**: Gallery **60**, Kanban **10**, and Grid, List, Calendar and Graph carry **no page-limit row at all**. A flat 60 is not the captured behaviour (`053` D4, T19/T24) | Measured table, REQ-010, REQ-014 |

**A fifth correction, from `052`'s true-up**: this document's §2 says hover states were never
captured. They were, 37 times — see §2.

### Where the capture wins, in one list

Seven contradictions, each resolved in the capture's favour per this task's rule. Each is expanded in
its item's row and each is carried into `decision-record.md`.

| # | `047` says | The captures show | Item |
|---|---|---|---|
| C1 | Filter and sort toolbar icons are **dual-mode / state-dependent** | Pixel-identical in every state, on every capture | REQ-001 |
| C2 | One chip surface serves sorts and filters, auto-hiding when empty | ~~No chip row on any capture, including a view carrying a filter~~ **Withdrawn 2026-09-05.** `047` was right and this read was wrong: the rail is on eleven captures and is conditional — present on 5 of 5 List views carrying a filter, absent on the five other layouts (`053` D1) | REQ-001 |
| C3 | The sticky horizontal scrollbar is a **board** affordance | The grid carries it at identical geometry | REQ-003 |
| C4 | A sortable tab row with right-click copy/remove, plus a view-selector dropdown | A tab row and a trailing `+`; duplicate and remove live in the settings panel | REQ-004 |
| C5 | `objectContext` is organized into **four** fixed sections | Five sections, separated by four dividers | REQ-008 |
| C6 | Two empty-state flavours, each with a per-layout add affordance | The add affordance alone; no message, no illustration, no card | REQ-009 |
| C7 | A type's default template can be overridden **per view** | ~~No default-template row in either the Grid or the Kanban settings panel~~ **Narrowed 2026-09-05 to the panel alone.** The settings panel indeed has no such row; the control is in the `New ⌄` menu's `Settings` section — `Default Type for this View` and `Template for this View` (`053` D2). `047` was right that it exists | REQ-010 |
<!-- /ANCHOR:headline -->

---

<!-- ANCHOR:method -->
## 2. HOW THE CAPTURES WERE READ

**Scale.** Every capture in this folder is 1 device pixel to 1 CSS pixel, which is what makes the
numbers below quotable. Proof: the toolbar icon pitch measures 32-33px in `anytype-collection-grid-
populated-dark.png` (1440×900), in `anytype-view-settings-panel-dark.png` (1024×716) **and** in the
catalogue captures (2168×1217). A 2× capture would have halved to 16 in the CSS reading. The
catalogue set is a large window, not a retina render.

**Cross-check.** The full-page grid row pitch measures 48px in `anytype-collection-grid-populated-
dark.png` (row baselines 322 → 370 → 418) and again in the catalogue grids, matching `047` §5's
source-derived "48px rows" exactly. Two independent methods agreeing on one number is what licenses
using the source-derived numbers that no capture can show.

**Colour.** Sampled with a per-pixel scan, not by eye. The first pass of this read called the filter
funnel blue at 2× zoom; the pixel scan showed 0 saturated pixels in its bounding box and 60 in the
sort glyph's. That is exactly the error a "looks blue to me" reading produces, and it would have
carried a false confirmation of C1 into the design.

**What a static capture cannot answer.** Motion, focus, and any state that needs a held pointer.
Every timing figure in this document is `047`'s source read, labelled as such, and reconciled against
our own motion band rather than quoted as measured.

**Hover is not on that list, and this document used to say it was.** The sentence "the README
records that hover states were never captured" stood here until 2026-09-05 and four other documents
inherited it. `052`'s T001 disproved it: **37 of the 150 menus under `menus/` were reached by
hovering a row of their parent**, and each of those files photographs that parent row in its hovered
state — the capture index's own "How it was reached" column reads `▸ hover "align"`,
`▸ hover "advanced"`, `▸ hover "change type"`. Measured on
`menus/anytype-menu-object-more-add-link-to-object-dark.png`: the hovered row is `#232323`, **28px
tall**, inset ~10px inside a 16px content inset, **1.14:1** against its own panel. What a still
genuinely cannot show is a **drag** state. `screenshots/anytype/README.md` is corrected to match.

### The measured Anytype system, as one table

These recur across every item, so they are stated once. Dark theme, since only the catalogue set has
both themes and the panels were all captured dark.

| Property | Measured value | Where |
|---|---|---|
| Menu popover width | **256px** | `anytype-object-more-menu-dark.png` x 756..1011; `anytype-filter-property-picker-dark.png` x 654..909 |
| Panel popover width | **360px** | `anytype-view-settings-panel-dark.png` x 654..1013 |
| Row height, every list and menu | **28px** | Settings rows, menu items, picker items and layout-setting rows all measure a 28px pitch |
| Popover corner radius | **8px** | Corner arc spans 7-8px from the top edge to the full-width left edge |
| Popover border | **1px `#292929`** | rgb(41,41,41) on every panel edge and every divider |
| Popover background | **`#171717`** | rgb(23,23,23) |
| Popover padding | **16px** horizontal, **8px** vertical | Dividers inset to x 671..998 inside a 654..1013 frame; first row box 8px below the top edge |
| Section divider clearance | **8px** each side | Menu item box 328.5 → divider 337 → next box 345.5 |
| Primary text | **`#E1E1E1`**, 13.7:1 on the panel | Header, labels, action rows |
| Secondary text | **`#A3A3A3`**, **7.11:1** on the panel | Right-hand values, field labels. *Corrected 2026-09-05 from 7.95:1 — `052` C10 recomputed the ratio from the sampled RGB rather than quoting it, and 7.11 is what the WCAG formula returns for `#A3A3A3` on `#171717`. Immaterial to any decision, both clear 4.5:1, but it is a quoted number* |
| Accent | **`#3C7FFB`** | New button fill, selected-tile ring, sort glyph |
| Selected-tile ring | **2px accent** | Layout picker, `anytype-set-gallery-view-dark.png` x 782 and x 884 |
| Row highlight / hover | **`#232323`**, **1.14:1** on the panel | Preselected "Name" row, hovered "+ New filter" row |
| Layout tile | **104 × 88px, 8px gutter** | Three columns inside a 328px content box |
| Toggle | **26 × 16px track, 12px knob** | `Fit media` off, `Show icon` on |
| Horizontal scrollbar | **10px tall, 8px above the viewport bottom, full content width** | y 1199..1208 of a 1217px viewport, on both the grid and the kanban |
| Full-page row | **48px** · Inline row | **≈40px** |
| Default page limit | **Per-layout: Gallery 60, Kanban 10, absent elsewhere** | `Page limit  60 ›` in the gallery layout panel, `Page limit  10 ›` in the kanban's; Grid, List, Calendar and Graph carry no such row. *Corrected 2026-09-05 — this read saw the gallery panel only and generalised it to a product default (`053` D4)* |

**Two of these are rejected rather than adopted, and both for the same reason.** The `#232323` row
highlight is **1.14:1** against its own panel — a selection indicator effectively invisible to a
low-vision reader, and far below the 3:1 that WCAG 1.4.11 asks of a non-text element that is the only
thing identifying state. Anytype's colour-only active-state signalling fails the same test from the
other side: there is no second signal because there is no signal at all. We take the geometry and
leave the contrast.
<!-- /ANCHOR:method -->

---

<!-- ANCHOR:items -->
## 3. THE FOURTEEN ITEMS

Each row carries the same six things: whether the surface was **seen**, the capture files, what the
real screen does, what our tree does today, the values that change, and the phone disposition against
`044`'s grammar and `048`'s stacking model.

---

### REQ-001 — Filter/sort chip row with state-dependent trigger icons

**Seen — and it contradicts the research on both halves.**

**Captures.** All 120 catalogue captures; `anytype-view-settings-panel-dark.png`;
`anytype-set-kanban-view-dark.png`; `anytype-collection-grid-populated-dark.png`.

**What the real screen does.** Nothing, is the honest answer. `tools/mock-data/anytype/views-report.json`
records that each set's **Grid** view carries a sort and its **List** view carries a filter. Scanning
the four toolbar icons' bounding boxes across all 120 captures returns one result, 120 times: search
grey, filter grey, sort blue, settings grey. The filter funnel measures `ink=52, blue=0` on
`anytype-project-tracker-list-light.png` (filter: Status) and `ink=52, blue=0` on
`anytype-project-tracker-grid-light.png` (no filter) — identical to the pixel. The sort glyph measures
`ink=80, blue=60` on both, and again on `anytype-collection-grid-populated-dark.png`, whose default
"All" view carries neither a sort nor a filter. **The sort icon's blue is a static two-tone glyph, not
a state.**

~~And no chip row renders anywhere, on any capture, in either theme.~~ **Corrected 2026-09-05 by
`053` T001 (D1): the chip rail is photographed eleven times and it is conditional.** It is present on
**5 of 5 List views** in the catalogue — each of which carries a filter — and absent on Grid,
Gallery, Kanban, Calendar and Graph in the same sets; scanned at x 705 and x 760, y 288.
`anytype-project-tracker-list-light.png` and its dark pair, `anytype-crm-contacts-deals-list-light.png`,
`anytype-reading-list-list-light.png`, `anytype-course-notes-list-light.png`,
`anytype-content-calendar-list-light.png`, and `anytype-menu-set-viewlist-dark-full.png` from the menu
sweep. Measured there: a **28px** chip at r≈14 with ~12px horizontal padding, 99px wide, filled
`#E2ECFE` in light and `#1D2739` in dark, sitting on a rail band at y 274..301 beneath a 1px
full-content-width divider at y 261, under a tab row at y 219..246. This read scanned the four toolbar
icons' bounding boxes and never scanned the band below them, which is the whole error: **an
absence claimed from a region that was never examined.** `047`'s chip-surface finding stands, and its
"auto-hides when empty" half is confirmed on screen — five layouts with no rule show no rail.

The one place Anytype does surface the state is the view-settings panel's value column:
`Sort   1 applied ›` beside a bare `Filter   ›`. A count, as text, one level in.

**What we do today.** Both halves, already, and better than the captured build.

- `src/views/active-view-controls-renderer.ts` renders the chip row: sort chips first, each with a
  direction arrow and an ordinal index, then a conjunction chip, then filter chips, each with a
  format icon and an `×`, then `Clear all`. It **auto-hides when empty** (`:93`,
  `if (filters.length === 0 && sorts.length === 0) return;`) and preserves `scrollLeft` across
  re-renders (`:67`), so the row scrolls horizontally rather than wrapping. It is constructed in
  `database-view.ts:396` and `embedded-database-renderer.ts:309` — both surfaces, production path.
  `screenshots/notion-clone/components/chrome-active-view-controls-desktop-light.png` is the render.
- `src/views/toolbar-renderer.ts:2204-2209` and `:2223-2227` compute an effective rule count and call
  `setBadge` (`:2575-2579`), which appends `.db-toolbar-badge` only when the count exceeds zero.
  `styles.css:2361-2376`: 16px min-width, full radius, `--interactive-accent` background,
  `--text-on-accent` text, weight 700, positioned `-5px/-5px`.

**Values that change.** The requirement, not the design.

| Was | Is |
|---|---|
| "Today: 0 chips and one fixed icon state" | The chip row and the count badge both ship; the premise is false and AC-001 cannot be observed red as written |
| Adopt Anytype's dual-mode icons | Rejected. There is no dual-mode behaviour to adopt — the captures show one mode, and the source-derived description of a second is unverifiable |
| "No chip row exists to compare ours against" | **Corrected 2026-09-05 (`053` D1).** There is one, measured, and it is conditional in exactly the way ours is. Adopt its **geometry** — a 28px fully-rounded chip on its own rail band under a 1px divider — and refuse its **contrast**: `053` measures the chip label `#3C7FFB` on `#E2ECFE` at **3.14:1** and the fill on the bar at **1.19:1**, so the rail signals with hue alone at both levels |
| Adopt Anytype's active-state signalling | Rejected on contrast. Colour-only fails WCAG 1.4.11; our count badge already carries a text second signal, which is strictly better |
| — | **Adopt**: the `N applied` count label in the view-settings panel's value column. It is the one thing the captures do that we do not, it costs one string per row, and it puts the state where someone configuring the view will read it |

**Phone.** Relevant. The chip row already renders on phone through the same renderer and scrolls
horizontally; the badge is re-offset to `-3px/-3px` at `styles.css:19979-19982`. The `N applied` label
lands inside the settings sheet, which is already a registered `sheet-grammar` surface, so `044`'s
seven elements are inherited rather than re-satisfied. Nothing here opens a surface over another, so
`048` does not bind.

---

### REQ-002 — Land in view settings after creating or duplicating a view

**Seen. The gap the packet expected here is closed.**

**Captures.** `anytype-view-settings-panel-dark.png` (Grid), `anytype-set-kanban-view-dark.png`
(Kanban), `anytype-set-gallery-view-dark.png` (the Layout sub-page).

**What the real screen does.** A 360 × 316px popover anchored under the settings icon and
right-aligned to it. 8px radius, 1px `#292929` border, `#171717` fill, 16px horizontal padding.
Header "View settings" at ~15px `#E1E1E1`, 13px below the top edge. Then a boxed **View name** field,
328 × 56px with ~6px radius, carrying a 12px `#A3A3A3` label over a 14px value. Then 28px rows:
`Layout   Grid ›`, `Properties   Name, Object type ›`, a full-inset 1px divider, `Filter ›`,
`Sort   1 applied ›`, a second divider, then `Duplicate view` and `Remove view`, each with a 16px
leading icon. Labels `#E1E1E1`, values `#A3A3A3`, both clearing 4.5:1 comfortably.

The panel is **layout-adaptive**: the Kanban capture inserts one extra row, `Groups ›`, between Layout
and Properties, and nothing else moves.

**How it navigates, which is the more useful finding.** Two distinct patterns, both captured:
- **Settings sub-pages replace in place.** Tapping `Layout` swaps the panel's body for the layout
  picker inside the same 360px frame, and the header becomes `‹ Layout`. Same for `‹ Filter`. One
  frame, a back affordance, no second surface.
- **Pickers open as a separate anchored popover.** `+ New filter` opens a 256px property picker that
  overlaps its parent, and the parent stays fully visible and undimmed.

**What we do today.** `database-view.ts` has a `showViewConfigPanel` flag and a
`ViewConfigPanelRenderer` (`:394`, `:5090`), so the surface exists; nothing opens it after a create.
`duplicateCurrentDatabase` (`:3633`) ends with `refresh({ viewport: "reset-top" })` and returns to the
board.

**Values that change.**

| Was | Is |
|---|---|
| "the settings panel itself was **not captured**" | Captured, measured, and quoted above |
| Anytype's ~50ms, our 100ms budget | Unchanged as a budget, but relabelled: ~50ms is `047`'s source read and **is not observable in any capture**. 100ms stays ours |
| Panel width unspecified | **360px** — the measured Anytype value and the top of our own `panel` role range (`design-system.md` §5, 292-360px). No new role, no bespoke number |
| Row height unspecified | **28px**, adopted (see the deviation note in §4) |
| Radius unspecified | **8px** — the measured value and the number our own design already asks for (`design-system.md` §10, "the design says 8px radius") |
| — | **Adopt** the layout-adaptive row: a board view's settings gains one `Groups` row and nothing else moves |

**Phone.** Relevant. `view-config` is already a registered `sheet-grammar` surface, and `settings
dropdown field` / `settings icon picker` / `settings template file picker` / `settings cover image
picker` are already registered stacked pairs (`tools/live/sheet-grammar.mjs`). The in-place
replace-with-back pattern is the phone-correct one and should be preferred over stacking a second
sheet for a settings sub-page — which is also what `048` REQ-002 asks for, since a parent that does
not move is cheaper than a parent that dims and scales back.

---

### REQ-003 — Sticky horizontal scrollbar with edge bleed

**Seen, on two surfaces, and it answers an open question in `spec.md` §12.**

**Captures.** `anytype-project-tracker-kanban-light.png`, `anytype-project-tracker-grid-light.png`,
and the same pair across the other nine sets.

**What the real screen does.** In a 1217px-tall window, the horizontal scrollbar occupies
**y 1199..1208** — 10px tall, its bottom edge 8px above the viewport's — while the content continues
far below the fold (37 rows × 48px on the grid; cards cut mid-card on the kanban, with a page-level
vertical scrollbar present at x 2145..2159 proving the page scrolls). Track `#EBEBEB` running the full
content width, x 668 → 2099. Thumb `#B6B6B6`: 371px of a 1431px track on the grid, 1037px on the
kanban.

**The contradiction (C3).** `047` §5 places the sticky scrollbar under "Board / Kanban" and our
`spec.md` §12 asks whether it belongs to the board only or to every horizontally scrolling surface.
The grid's scrollbar sits at the **same y, the same 10px height, the same colours and the same
full-width track** as the board's. It is not a board affordance. It is the dataview's.

**"Edge bleed" is not what the capture shows.** The research describes edge bleed via negative
margins. What is observable is a track that runs the container's full content width with no gutter
inset on either side. Whether that is achieved with a negative margin is a source claim and stays one.

**What we do today.** `src/views/board-renderer.ts` contains no sticky scrollbar and no
`position: sticky` on a scroll rail; `styles.css` has no board-scrollbar rule. This one is a real gap
and its threshold is observable red as written.

**Values that change.**

| Was | Is |
|---|---|
| Scoped to the board (REQ-003, ADR-free) | **Scoped to every horizontally scrolling view surface** — board and table both. `spec.md` §12's open question is closed by the capture |
| Geometry unspecified | **10px tall, bottom edge 8px above the viewport bottom, track spanning the container's full content width with no gutter inset** |
| Colours | Ours, from the theme's scrollbar tokens. Anytype's `#B6B6B6`/`#EBEBEB` are a fixed light-theme pair and this is an Obsidian plugin — the user's theme decides |

**Phone.** No expression, and this is the reason rather than silence (goal D3): a touch surface has no
persistent scrollbar chrome to make sticky, and our phone board already scrolls by touch with
`edge-auto-scroller.ts` handling the drag-to-edge case. A sticky scrollbar on the phone would add
chrome the platform hides.

**Constraint.** Goal D5 stands unchanged: this lands in `board-renderer.ts`, which carries the
Project Manager 1:1 parity, so the parity capture is re-read and proved `pixelHash`-identical before
the leg closes.

---

### REQ-004 — Duplicate view, and a view-tab context menu

**Half seen. The duplicate action is captured; the tab context menu is not.**

**Captures.** `anytype-view-settings-panel-dark.png`, `anytype-set-kanban-view-dark.png`.
**Not captured:** any right-click on a view tab. Neither capture phase drove a right-click, and the
README's account of what was and was not reachable does not claim one.

**What the real screen does.** `Duplicate view` and `Remove view` are the last section of the
view-settings panel, below a divider, each a 28px row with a 16px leading icon — a copy glyph and a
trash glyph. Above the panel, the view switcher is a **tab row with a trailing `+`**: `All  Kanban  +`,
the active tab bright and the inactive one dimmed.

**The contradiction (C4).** `047` §5 describes "a view-selector dropdown + a sortable tab row
(right-click copy/remove, drag-and-drop reorder) + an add-view icon". The captures show the tab row
and the `+`. There is no separate view-selector dropdown at this width, and the copy/remove actions
are in the settings panel, not in a tab menu. Whether a tab context menu also exists is unknown —
absence of a capture is not evidence of absence — but the packet may not design one from a screen
nobody saw.

**What we do today.** `duplicateCurrentDatabase` (`database-view.ts:3633-3650`) duplicates a whole
**database**: new database id, deep-cloned schema, and every view re-idded via `generateId()`. A
per-**view** duplicate does not exist. Separately, `toolbar-renderer.ts:1433`'s
`db-add-view-duplicate` row seeds a new view from the current one's filters, sorts and column order —
adjacent, deliberately named for what it does rather than what it resembles, and not a duplicate.

**Values that change.**

| Was | Is |
|---|---|
| "the view tab row and its right-click menu were **not captured**" | Still true for the menu; **false for the actions**, which are captured in the settings panel |
| Duplicate belongs on the tab's context menu | **Duplicate and Remove go in the view-settings panel**, last section, below a divider, matching the capture. That also lands them where REQ-002 has just put the user |
| The tab context menu | **Design inferred from source code, not seen.** Build it if it is wanted, but its content and placement come from `047` §5, not from a screen |
| Duplicate semantics | Unchanged and already correct in `createDuplicatedDatabaseConfig`: config-equal except `id` and the name suffix, with a fresh id |

**Phone.** Relevant, and the placement decision matters more there: a right-click has no phone
equivalent, so a tab context menu would need a long-press, while a settings-panel row works on both
without a second interaction vocabulary. That is a second reason to prefer the captured placement.
The settings sheet is already `sheet-grammar`-registered.

---

### REQ-005 — Per-view scroll-position restore

**Not seen, and none was expected. This closes the second of `spec.md` §12's open questions.**

**Captures.** None, and none is possible: scroll restoration is a transition, and every capture is a
still. `spec.md` §12 asked whether REQ-005 and REQ-011 need a visual reference. Confirmed at T001:
**they do not**, and their tasks should stop carrying a capture field.

**What we do today.** More than the packet credits. `src/views/database-viewport.ts` already
implements a snapshot-and-restore with four request kinds — `auto`, `preserve-anchor`, `preserve-raw`,
`reset-top` (`:37`) — capturing `container.scrollTop` (`:67`) and a row anchor with an offset, and
restoring either the raw offset (`:76`) or the anchor-relative one (`:84`). A scroller-level pair
exists too (`:122`, `:131`).

**Values that change.**

| Was | Is |
|---|---|
| "Today's failing value: **0** — every switch returns to the top" | Accurate as a symptom, wrong as a diagnosis. The restore machinery exists; view switching asks for `reset-top` |
| Build scroll restore in `view-state-store.ts` | **Wire the existing `database-viewport` snapshot into per-view state and stop requesting `reset-top` on a view switch.** Do not build a second snapshot mechanism — `design-system.md` §10 lists "two mechanisms for one decision" as an anti-pattern with its own scar |
| ±2px tolerance | Unchanged. `preserve-raw` restores an integer `scrollTop`, so ±2px is generous and will hold |

**Phone.** Relevant, same store, no separate expression. Neither `044` nor `048` binds: nothing opens.

---

### REQ-006 — Cell-editor anti-clip flip near the right edge

**Not seen. The 92px figure has no capture behind it and is labelled accordingly.**

**Captures.** None showing an open cell editor near a viewport edge. The nearest evidence is
`anytype-filter-property-picker-dark.png` and `anytype-filter-tag-value-picker-dark.png`, where a
child picker is placed to the left of and overlapping its parent rather than clipping — so a
horizontal placement rule demonstrably exists, but no boundary and no threshold can be read from it.

**What the real screen does, so far as it can be read.** The property picker's 256px frame sits at
x 654..909 inside a 1024px viewport, with 115px of clearance to the right edge. That is consistent
with a right-edge guard and proves nothing about where the guard trips.

**What we do today.** `src/views/popover-position.ts` has a vertical flip — "prefer below anchor;
flip above only when below can't" (`:912`) — and no horizontal right-edge branch. No `92` appears in
the file.

**Values that change.**

| Was | Is |
|---|---|
| "the 92px figure is `047` §5's, read from `anytype-ts`" | Unchanged and now confirmed as the only provenance: **design inferred from source code, not seen** |
| Threshold is the 92px boundary | **Two criteria, not one.** The 92px boundary stays as the trigger, since a borrowed number is better than an invented one — but the criterion that actually decides the item is *no open editor's right edge exceeds the viewport's*, which is measurable on our own renderer and does not depend on Anytype's constant being right |

**Phone.** Relevant, and it is the harder half: on the phone a cell editor presents as a sheet, so
"flip" has no meaning and the correct expression is `048`'s stacking model with the editor as a child
of whatever is beneath it. Six filter pickers and a date picker are already registered as stacked
pairs in `sheet-grammar.mjs`; the cell editors join that list rather than inventing a second
mechanism.

---

### REQ-007 — Sort-conflict confirmation on manual drag reorder

**Not seen. No drag, no confirmation dialog and no sort panel with a condition open exists in the
sweep.**

**Captures.** None. No **drag** state was captured — that gap is real and the README still records
it — and the sort panel was reached only in its empty state. *(Corrected 2026-09-05: this paragraph
used to say "no hover-only or drag state", and hover was captured 37 times (`052` C1). It also said
the filter panel was reached only empty; `053` D3 opened it populated across twelve relation
formats. Neither correction gives this item a screen: a drag under an active sort and its
confirmation dialog remain unphotographed.)*

**What the real screen does.** Unknown. `047` §5's board drag vocabulary — off-screen clone as drag
image, cached-rect hit-testing inside `requestAnimationFrame`, `isOver` plus edge classes — stands in,
and stands in as source, not as a screen.

**What we do today.** No sort-conflict confirmation exists in either `board-renderer.ts` or
`table-renderer.ts`. But a **prevention** vocabulary for the same conflict already ships elsewhere:
`row-menu.ts:104` and `:110` set `disabled: sorted` on Insert above and Insert below, where `sorted`
is `isExplicitlySorted(config)`, and the file's own header comment explains the choice —
*"disabled documents that the action exists but doesn't apply here"*.

**Values that change.**

| Was | Is |
|---|---|
| Capture: none, `047` §5 stands in | Unchanged, and stated plainly: **design inferred from source code, not seen** |
| Build a new "is this view sorted" test | **Reuse `isExplicitlySorted(config)`.** It is already the predicate the row menu gates on, and a second predicate answering the same question is the anti-pattern `design-system.md` §10 names |
| Confirm-or-prevent left open | **Confirm, not disable** — the drag is a direct manipulation the user has already committed muscle to, and silently refusing it reads as a broken drag. The row menu disables because a menu row can carry a disabled state legibly; a drag cannot |

**Phone.** Relevant. Drag reorder on the phone runs through `db-mobile-reorder-controls` rather than a
drag, so the confirmation fires from the arrow controls. It presents as a sheet carrying `044`'s
seven elements and stacks per `048` over whatever is beneath — the `confirm over a sheet` pair is
already registered in `sheet-grammar.mjs`, so the pattern exists.

---

### REQ-008 — Capability-gated menus, selection caps, never-empty fallback

**Half seen. The menu is captured and measured; the fallback and the caps are not.**

**Captures.** `anytype-object-more-menu-dark.png`.
**Not captured:** the "No available actions" state, and any multi-selection.

**What the real screen does.** A 256px menu, x 756..1011, y 52..555, 8px vertical padding, 28px rows,
16px leading icons, right-aligned shortcut text in the secondary grey, chevrons on submenu rows.
Dividers at y 96, 337, 438 and 511 — **four dividers, five sections**:

1. `Type settings`
2. `Copy Link`, `Favorite`, `Pin to Channel`, `Add Link to Object ›`, `Add to Collection ›`,
   `Use as Template`, `Duplicate`, `Move to Bin`
3. `Lock Object` (⌃⇧L), `Search in Object` (⌘F), `Version History` (⌘⌥H)
4. `Print` (⌘P), `Export`
5. `Advanced ›`

**The contradiction (C5).** `047` §9 says `objectContext` is organized into four fixed sections. The
capture shows five. Minor, but it is the kind of number that gets copied into a layout without being
checked, so it is recorded.

**What we do today.** `row-menu.ts` already gates: `isReadOnly` hides the whole mutation block;
`viewType !== "calendar" && viewType !== "timeline"` gates the insert rows; `hasRecordTemplate` gates
the template row; `canToggleRecordIcon?.() === true` gates the icon row; and the insert rows disable
rather than disappear under a sort. Its **first** row — `menu.openNote` — is unconditional, so
`row-menu` **cannot render empty**. The premise "a fully-restricted selection renders an empty menu"
is false for that file.

It is true for one file. `bulk-edit-field-menu.ts:31-45` builds
`options: editable.map(...)` straight from `getBulkEditableColumns(options.columns)` with no floor
and no fallback. A column set with nothing bulk-editable opens an empty dropdown.

**Values that change.**

| Was | Is |
|---|---|
| "Today: a fully-restricted selection renders an empty menu" | False for `row-menu.ts`, whose first row is unconditional. **True, and only true, for `bulk-edit-field-menu.ts:31-45`** |
| Threshold: item count ≥ 1 in every capability state, both files | Narrowed to the one file that can violate it. The row menu's guarantee should be **asserted** so it cannot regress, not built |
| Selection caps: >1 disables open/link, >10 disables open-in-new-tab | **Not adopted, with a reason.** Our row menu operates on a single row; the caps have no referent in a surface that has no multi-select. Recording this beside `047`'s four explicit non-adoptions rather than leaving it to be silently retried |
| Four sections | Five. Immaterial to us — we build sections from what is gated in, not from a fixed count — but the number is corrected so nobody copies four |

**Phone.** Relevant. `owned-menu` is already a registered `sheet-grammar` surface and `044` REQ-007's
amendment gives it a title row with a 44px close, so a phone context menu already carries the grammar.
`record column context menu` and `record column submenu` are registered stacked pairs, so `048`
governs a menu opened over a sheet.

---

### REQ-009 — Two empty-state flavours plus the deleted-relation state

**Half seen, and the half that was seen is weaker than what we already ship.**

**Captures.** `anytype-inlinecollection-empty-dark.png`, `anytype-page-with-inline-collection-dark.png`,
`anytype-object-more-menu-dark.png` (the inline collection behind the menu).
**Not captured:** the "target" flavour, and the deleted-group-relation state.

**What the real screen does.** An empty inline collection renders **no empty-state block at all**.
The header row (`Name │ Object type │ +`) sits at y 346 and a `+ New Object` row at y 384 — a ~40px
inline row pitch — and below that, nothing. No message, no illustration, no card, no border.

**The contradiction (C6).** `047` §9 describes two flavours, "each with a per-layout add affordance".
What the capture shows is the add affordance **as** the empty state. Whatever the source contains,
the shipped surface communicates emptiness by having one row that says `+ New Object`.

**What we do today.** Substantially more. `src/views/empty-state-renderer.ts:24-36` declares **twelve**
reasons — `no-database`, `no-columns`, `no-matching-data`, `search-empty`, `filter-empty`,
`filter-and-search-empty`, `limit-empty`, `no-date-field`, `no-events`, `no-events-in-range`,
`read-failed`, `empty-group` — each with its own title, body and Lucide icon in the copy catalogue at
`:143-203`, selected by `getEmptyStateReason(diagnostics)` at `:209-216`, which reads source count,
active search, active filters and active limit. `screenshots/notion-clone/states/constructed-empty-
state-desktop-light.png` shows the rendered card: a tinted icon tile, a bold title, a body line, and a
primary plus a secondary action.

Mapped onto the requirement: our `no-database` **is** the "target" flavour, and `no-matching-data`,
`filter-empty`, `search-empty` and `filter-and-search-empty` are four refinements of the "view"
flavour where Anytype's source describes one.

**Values that change.**

| Was | Is |
|---|---|
| "Today: all conditions render the same state" | False by a wide margin — twelve reasons, twelve copy entries, and a diagnosis function that distinguishes them |
| Build two flavours | **Nothing to build.** Assert the existing mapping so it cannot regress, and record which existing reason answers which flavour |
| The deleted-relation state | **The one real gap.** `empty-group` means "this group has no rows", not "the relation this board groups by no longer exists". That state, and its pointer at view settings, does not exist |
| Adopt Anytype's empty-state design | Rejected. There is nothing to adopt; the captured state is the absence of one, and ours is better |

**Phone.** Relevant. The empty state renders inline in the view body, not in a sheet, so `044` does
not bind and `048` does not bind. The `compact` option (`:45`) is the phone expression and already
exists.

---

### REQ-010 — Per-view new-row default presets

**Not seen, and the research's own claim is contradicted by the panel it describes.**

**Captures.** `anytype-view-settings-panel-dark.png`, `anytype-set-kanban-view-dark.png`,
`anytype-set-gallery-view-dark.png`, `anytype-newpage-created-dark.png`.

**The contradiction (C7), and its correction.** `047` §8 says "a type's default template can be
overridden per-view". The captured view-settings panel — in both its Grid form and its Kanban form —
contains exactly these rows: View name, Layout, [Groups], Properties, Filter, Sort, Duplicate view,
Remove view. There is no default-template row and no default-value row **in that panel**.

**That much survives; the conclusion drawn from it does not.** This read went on to say the control
is "absent from the product", and **`053` T001 (D2) found it one surface over**: the `New ⌄` split
button's menu carries a `Settings` section with `Default Type for this View   Page ›` and
`Template for this View   Blank ›`, each opening its own anchored picker — a 288px menu on a 28px row
pitch with its divider at y 56. `anytype-menu-set-new-object-light.png`,
`anytype-menu-set-new-object-default-type-for-this-view-light.png`,
`anytype-menu-set-new-object-template-for-this-view-light.png`, and on the phone
`anytype-mobile-sheet-set-newobject-templates-light.png`. **`047` was right that a per-view default
exists; it was wrong only about where.** The lesson is ADR-003's corollary read the other way:
absence in one surface is not absence in the product, and this document asserted the second from the
first.

**What the captures do show, adjacent to it.** Two things worth having.
- `anytype-newpage-created-dark.png`: a freshly created object carries a top-bar pill reading
  `This type has 2 templates ⌄`, with an onboarding tooltip. That is a **per-type** chooser offered at
  creation time, not a per-view default.
- `anytype-set-gallery-view-dark.png`: the layout panel's settings block ends with `Page limit  60 ›`
  — proof that per-view numeric settings live in this panel, and the only captured default value in
  the product.

**What we do today.** A per-view default already exists in one dimension.
`view-config-panel-renderer.ts:259` and `:265` expose `onDefaultStatusPresetChange` and
`onDefaultViewStatusPresetChange`, fed by `actions.viewStatusPresets` at `:403-407`. And `:558-612`
renders a template setting with a path picker and an engine choice (markdown / core / templater).

**Values that change.**

| Was | Is |
|---|---|
| "the per-view default control itself was **not captured**" | **Superseded 2026-09-05 (`053` D2).** It is captured, in the `New ⌄` menu, twice over — a default **type** and a default **template**, per view. The "design inferred from source code, not seen" marking is **removed**: this item now has a reference screen |
| "absent from the shipped panel, therefore absent from the product" | **Withdrawn.** Absent from the panel, present in the New menu. The surface, not the product |
| ADR-002: REQ-010 is the preset map and nothing else | Narrows again. A per-view status preset and a per-database template already ship; the residue is **per-field default values for a new row**, and only that |
| No captured precedent for a per-view default | Two, now. The `New ⌄` menu's `Settings` section is the **direct** precedent and is where our per-view default row belongs — beside the create affordance, not buried in view settings. The per-layout `Page limit` row is the second, and it is **per-layout**, not a flat default (`053` D4) |

**Phone.** Relevant. The control lands in the settings sheet, already `sheet-grammar`-registered, and
its value editors are dropdowns that already stack per `048` (`settings dropdown field` is a
registered pair). Nothing new to satisfy.

---

### REQ-011 — `positionLock` while a name is being typed in a sorted view

**Not seen, and none needed. Confirmed at T001, per `spec.md` §12.**

**Captures.** None, and none is possible: the defect is a row index changing between keystrokes.

**What we do today.** Nothing. No `positionLock`, no equivalent hold, in any file under `src/views`.
This is a clean gap and its threshold is observable red as written.

**Values that change.** One, and it is a boundary rather than a value: the lock releases on **commit
or blur**, and repositions exactly once. `047` §8 names the mechanism and the release point, and both
are source-derived. **Design inferred from source code, not seen.**

**Phone.** Relevant — inline rename exists on the phone and the same mid-keystroke jump applies, with
a keyboard open over the row, which makes it worse rather than equivalent. No sheet opens, so neither
`044` nor `048` binds.

---

### REQ-012 — Measured toolbar collapse for embedded views

**Half seen. The collapsed end state is captured twice; the collapse *mechanism* is not.**

**Captures.** `anytype-inlinecollection-empty-dark.png` and `anytype-page-with-inline-collection-
dark.png` (inline, ~680px content width); `anytype-collection-grid-populated-dark.png` (full page,
same window); `anytype-mobile-official-ios-06-lists.png` (phone).

**What the real screens show — a three-rung ladder.**

| Context | Controls rendered |
|---|---|
| Full page, 1440px window | View tabs · search · filter · sort · settings · split `New ⌄` |
| Inline block, ~680px content | **View tab row only.** No icon cluster, no `New` button |
| Phone (official creative) | `All ⌄` as a **dropdown**, not tabs · settings icon only · split `New ⌄` |

So the collapse is not a proportional shrink; it drops whole controls, and on the phone it also swaps
the tab row for a dropdown.

**What cannot be read.** Only one inline width exists in the sweep, so nothing distinguishes a
measured collapse from a fixed breakpoint — `047` §5's "measures its own natural width against
available space" stays a source claim. And the inline icons may be hover-revealed rather than
absent. *(Corrected 2026-09-05: the reason given here — "hover was never captured, which the README
states" — was wrong; 37 menu captures show a hovered row (`052` C1). The hover captures are all
**menu rows**, though, and none is an inline collection's toolbar, so this item's gap survives its
stated reason.)*

**What we do today.** `embedded-database-renderer.ts` contains **no** `ResizeObserver` — the only one
in `src/views` is `chart-renderer.ts:876`, which resolves the constructor off the owner window
(`:98`, `:876`) precisely because a portalled surface may live in another document. That is the
pattern to copy, not to reinvent.

**Values that change.**

| Was | Is |
|---|---|
| "the collapsed state itself was **not captured**" | Captured, twice, and described above |
| Collapse behaviour unspecified | **Drop controls, in a stated order**, matching the ladder: the icon cluster goes before the `New` button, and the tab row becomes a dropdown before anything else is dropped |
| "measured, not a fixed breakpoint" | Kept as the requirement but relabelled **source-derived**; the captures cannot distinguish the two. What they *can* decide is the end state, which is what the threshold should assert |
| 250px sweep floor | Unchanged, and it is ours: `047` §8's `isNarrow` at ≤250px and `isVertical` at ≤50% width are source-derived |

**Phone.** Relevant, and it is the rung with the most evidence. Note the honesty caveat: the phone
image is **official marketing creative from the App Store and Google Play, not an installed-app
capture** — Anytype's mobile clients were never installed for this sweep. It is good evidence of
intent and weak evidence of pixels, so no number is taken from it.

---

### REQ-013 — Per-format filter and sort condition rows on phone sheets

**Seen after all, and it is also the item where our tree is furthest ahead of the packet's
description of it.**

**Captures — restated 2026-09-05, twice over.** This section originally read *"None. No filter or
sort sheet appears in any of the 151 files."* Both halves of that gap have since closed: the iOS
simulator set (`964a0b2a`) landed four phone filter and sort sheets, and **`053` T001 (D3) opened the
populated desktop panel across twelve relation formats** —
`menus/anytype-menu-set-filter-{checkbox,date,email,file,multiselect,number,object,phone,select,text-long,text-short,url}-light.png`,
each with a `-condition-` pair, plus `-filter-date-picker-`, `-filter-date-relative-`, the property
picker, and the mobile `-view-filters-empty-`, `-filter-relation-picker-`, `-filter-condition-text-`
and `-filter-condition-operators-` sheets. The 20 mobile images are official marketing creative and
none shows a filter surface. The desktop evidence this read did reach was one level up:
`anytype-filter-property-picker-dark.png` renders a per-format **icon** on each property row — `Aa`
for text, a page glyph for object type, a calendar for the three date properties, a list glyph for
Tag, an `ⓘ` for Description — which is the format vocabulary, not the condition row.

**What we do today.** The rows exist, on both viewports, and they are richer than anything captured.

- `screenshots/notion-clone/panels/constructed-filter-panel-desktop-light.png`: a compound condition
  builder with an `AND (all)` conjunction control, three condition rows each shaped by its property's
  format — a select field with `equals` and a value dropdown, a money field with `greater than` and a
  numeric input, a date field with `is not empty` and a `—` where the value control would be — each
  with a leading format icon, a group button, a negate button and a remove `×`, plus `+ Add
  condition` and a nested-group variant.
- `screenshots/notion-clone/panels/constructed-filter-panel-mobile-light.png`: the same rows as a
  phone sheet, reflowed to two lines per condition, with a scrim, a grab handle, a `Filter` title and
  a close `×`, and padded rows.
- `tools/live/sheet-grammar.mjs` already registers `filter-panel` and `sort-panel` as surfaces, plus
  six stacked pairs off the filter panel — property picker, operator picker, select value picker,
  checkbox value picker, conjunction picker and date value picker — and two off the sort panel.

~~Anytype's captured filter panel, for comparison, is a 360px frame whose entire body is one `+ New
filter` row.~~ **Corrected 2026-09-05 (`053` D3): that is the panel's *empty state*, not the panel.**
The populated form carries per-format condition rows and is captured across twelve formats — checkbox,
date, email, file, multiselect, number, object, phone, select, text-long, text-short and url — each
with its own condition picker, plus a date picker and a relative-date picker. Both screens are real;
the empty one is not "the filter panel", and describing a surface from its empty state is the same
error C7 made from the settings panel. **What this changes for us is the comparison, not the work**:
our own compound builder is still ahead of Anytype's — Anytype has no conjunction control, no group
button and no negate — but the claim that Anytype has "no per-format rows to adopt" is withdrawn. It
has twelve of them, and the **format-icon vocabulary** we adopt is confirmed rather than inferred.

**Values that change.**

| Was | Is |
|---|---|
| "Today: **0** of the phone filter surfaces render per-format rows" | False. They render, on desktop and on phone, with per-format value controls and format icons |
| "No Anytype filter surface exists in the sweep" | **False as of 2026-09-05.** Twelve desktop formats (`053` D3) and four iOS sheets (`964a0b2a`). This item is **no longer** one of the five with no reference screen |
| "Red first: register the sheet in the `sheet-grammar` lane before the rows exist and observe the row red" | **Unexecutable.** Both surfaces are already registered and the rows already exist. The threshold has to be rewritten before D2 can be satisfied |
| Build per-format condition rows | Nothing to build. **The residue is the three grammar elements a still capture cannot show** — segmented choices, keyboard avoidance, safe-area inset — asserted on the filter and sort sheets, plus `048` conformance for the eight already-registered stacked pairs |
| Adopt Anytype's per-format rows | **Restated 2026-09-05.** There *are* twelve to compare against, and the comparison still favours ours: Anytype's row is property + condition + value with no conjunction, group or negate control. **Adopt the format-icon vocabulary and the twelve-format condition coverage as the completeness bar**; adopt nothing structural |

**Phone.** This item *is* the phone item. `044`: surface, handle, header and padded rows are visible in
our own capture; the other three are the work. `048`: eight registered pairs, each of which must show
the parent dimmed and pushed back with one scrim between, per `048` REQ-002 and REQ-003.

---

### REQ-014 — Inline "Load more" row instead of virtualized paging

**Half seen, and the premise is false in the other direction: there is no virtualization to avoid.**

**Captures.** `anytype-set-gallery-view-dark.png` (the `Page limit  60 ›` row),
`anytype-collection-grid-populated-dark.png` (full-page rows), `anytype-inlinecollection-empty-
dark.png` and `anytype-page-with-inline-collection-dark.png` (inline rows).
**Not captured:** a `Load more` row. Every collection in the sweep holds fewer rows than the page
limit, so none was ever reached.

**What the real screens show.**
- **`Page limit  60 ›`** — the last row of the **gallery** layout block. A per-view page size.
  **Corrected 2026-09-05 (`053` D4): it is per-layout, not a product default.** The kanban block
  carries `Page limit  10 ›`, and Grid, List, Calendar and Graph carry no page-limit row at all
  (`anytype-menu-set-layout-{grid,gallery,list,kanban,calendar,graph}-light.png`). This read saw one
  layout's panel and generalised its value to the product — the same single-surface generalisation
  C7 made.
- **48px full-page rows against ≈40px inline rows.** Measured: full-page baselines 322 → 370 → 418 in
  `anytype-collection-grid-populated-dark.png`; inline header 346 → `+ New Object` 384. `047` §5's
  source-derived 48/40 split, confirmed on screen.

**What we do today.** There is **no virtualization anywhere in `src/views`** — the only `virtualis*`
match in `src` is `data/calendar-timeline-model.ts`, which is the timeline's own model. An embedded
view cannot enter a virtualization path because none exists.

**Values that change.**

| Was | Is |
|---|---|
| "Today: **the virtualization path is entered**" | False. No virtualization path exists for an embedded view, so this threshold cannot be observed red as written |
| Threshold: renders a page plus a `Load more` row and never enters virtualization | Restated to something observable: **an embedded view honours a per-view page limit and renders a `Load more` row past it**. The "never virtualizes" clause becomes a guard against a future regression, not today's red |
| Page size unspecified | ~~**60**, Anytype's own captured default, adopted as ours~~ **Corrected 2026-09-05 (`053` D4).** There is no product default to adopt. The captured behaviour is **per layout**: Gallery 60, Kanban 10, no limit row on Grid, List, Calendar or Graph. What we adopt is the **shape** — a per-view page-limit setting living in the layout block, defaulting per layout — and the two captured numbers where a layout matches. An embedded table or list inherits **no** captured number, so its page size is ours to choose and must be argued rather than cited |
| Inline row height unspecified | **≈40px inline against 48px full-page** — measured, and matching the source read |

**Phone.** Relevant. An embedded view on the phone is the case where paging matters most, and a
`Load more` row is a 28px row in a list that already scrolls, so nothing opens and neither `044` nor
`048` binds.
<!-- /ANCHOR:items -->

---

<!-- ANCHOR:rollup -->
## 4. ROLL-UP

### Seen, not seen, and the five with no capture at all

| Item | Surface seen? | Capture(s) | Phone-relevant |
|---|---|---|---|
| REQ-001 chip row + trigger icons | **Seen**; icons contradict, **rail confirmed 2026-09-05** | 120 catalogue captures, view-settings panel, populated grid, plus the 11 rail captures `053` found | Yes |
| REQ-002 land in view settings | **Seen** | `anytype-view-settings-panel-dark.png`, `anytype-set-kanban-view-dark.png` | Yes |
| REQ-003 sticky scrollbar | **Seen**, contradicts scope | kanban + grid catalogue captures | No — reason recorded |
| REQ-004 duplicate + tab menu | **Half** — action seen, menu not | `anytype-view-settings-panel-dark.png` | Yes |
| REQ-005 scroll restore | **Not seen**, none needed | — | Yes |
| REQ-006 editor flip at 92px | **Not seen** | — | Yes |
| REQ-007 sort-conflict confirm | **Not seen** | — | Yes |
| REQ-008 menu gating + fallback | **Half** — menu seen, fallback not | `anytype-object-more-menu-dark.png` | Yes |
| REQ-009 empty-state flavours | **Half** — "view" seen, "target" not | `anytype-inlinecollection-empty-dark.png` | Yes |
| REQ-010 new-row presets | **Seen as of 2026-09-05** — in the `New ⌄` menu, not the settings panel | `anytype-menu-set-new-object-light.png` + its two sub-pickers; `anytype-mobile-sheet-set-newobject-templates-light.png` | Yes |
| REQ-011 `positionLock` | **Not seen**, none needed | — | Yes |
| REQ-012 measured collapse | **Half** — end state seen, mechanism not | inline + full-page + phone creative | Yes |
| REQ-013 phone condition rows | **Seen as of 2026-09-05** — twelve desktop formats and four iOS sheets | `menus/anytype-menu-set-filter-{12 formats}-light.png` + `-condition-` pairs; the iOS filter/sort sheets | Yes — this item *is* the phone item |
| REQ-014 inline `Load more` | **Half** — page limit seen (**per-layout**, not flat), row not | `anytype-set-gallery-view-dark.png` (60), `anytype-menu-set-layout-kanban-*` (10), four layouts with no row | Yes |

**The list with no capture at all, named as goal D1's second clause requires — design inferred from
source code, not seen. Reduced from five to four on 2026-09-05: REQ-005, REQ-006, REQ-007,
REQ-011.** Two of them (REQ-005, REQ-011) need none and should stop carrying a capture field. Two
(REQ-006, REQ-007) are designed from `047`'s source reading and say so in their tasks. **REQ-013
leaves this list**: `053` T001 opened twelve desktop filter formats and the iOS set landed four phone
sheets, so the item that "*is* the phone item" now has phone reference screens. REQ-010 was never on
this list as an unseen item but was carried as *absent from the product*; that marking is also
withdrawn (`053` D2).

The packet predicted gaps for REQ-001, REQ-004, REQ-006, REQ-007, REQ-008 and REQ-010. The sweep
closed REQ-001's and half of REQ-004's and REQ-008's; it left REQ-006's and REQ-007's open; and it
turned REQ-010's from "unphotographed" into "absent from the product".

### The premises that are false, and what that does to D2

Six thresholds assert a failing value the tree does not have. None can be observed red as written, so
none may enter Phase 2 until its row in `acceptance-criteria.md` is restated.

| AC | Asserts | Actually |
|---|---|---|
| AC-001 | No chip row exists and each icon has one state | The chip row ships (`active-view-controls-renderer.ts`) and the icons carry a count badge (`toolbar-renderer.ts:2575`) |
| AC-005 | Every switch returns to the top | True as a symptom; the restore machinery exists in `database-viewport.ts` |
| AC-008 | A fully-restricted selection renders an empty menu | False for `row-menu.ts`; true only for `bulk-edit-field-menu.ts:31-45` |
| AC-009 | All conditions render the same state | False — twelve reasons in `empty-state-renderer.ts:24-36` |
| AC-013 | 0 of the phone filter surfaces render per-format rows | False — they render, and both sheets are `sheet-grammar`-registered |
| AC-014 | The virtualization path is entered | False — no virtualization exists in `src/views` |

**A seventh, found 2026-09-05 and different in kind.** AC-014's restated form adopts *"more than
**60** rows — Anytype's own captured default page limit"*. That number is not a product default
(`053` D4): the limit is per-layout, Gallery 60 and Kanban 10, with four layouts carrying none. The
threshold stays observable — an embedded view honours a page limit and renders a `Load more` row past
it — but **60 becomes our own chosen number for an embedded table, argued rather than cited**, and
the row is restated to say so. The first six were premises about *our* tree; this one is a premise
about *Anytype's*, which is the failure mode ADR-003 was written to catch and this document
nonetheless committed twice (C7 and the page limit), both times by generalising from a single
surface.

### The values we adopt, and the two we refuse

**Adopted from the captures**, because a measurement outranks a default for the surface it covers:
360px panel width (also the top of our own `panel` role), 8px popover radius (also what
`design-system.md` §10 already asks for), 28px row height, 16px horizontal and 8px vertical popover
padding, 8px divider clearance, 104 × 88px layout tiles on an 8px gutter, a 10px horizontal scrollbar
sitting 8px above the viewport bottom across the container's full content width, **a per-layout page
limit — Gallery 60, Kanban 10, and no limit row on Grid, List, Calendar or Graph — rather than a flat
60** (corrected 2026-09-05, `053` D4), the 48px / 40px full-page-versus-inline row split, and, added
2026-09-05 from `053`'s rail measurement, **the chip rail's geometry**: a 28px fully-rounded chip with
~12px horizontal padding on its own band beneath a 1px full-content-width divider.

**Adopted as behaviour**: the `N applied` count in the settings panel's value column; the
replace-in-place-with-back pattern for settings sub-pages against a separate anchored popover for
pickers; Duplicate and Remove living in the settings panel; a layout-adaptive settings panel that
inserts one `Groups` row for a board. **Added 2026-09-05**: the chip rail is present exactly when the
view carries a rule and absent otherwise — confirmed on screen at 5 of 5 List views against five
ruleless layouts, which is what our `:93` auto-hide already does; and the per-view default lives
**beside the create affordance** (`New ⌄` → `Settings` → `Default Type for this View` /
`Template for this View`), not in the view-settings panel.

**Refused, on contrast.**
1. **The `#232323` row highlight**, which measures **1.14:1** against its own `#171717` panel. A
   selection indicator that is the only thing marking state has to clear 3:1 (WCAG 1.4.11), and this
   misses by a factor of three. Our hover and selection tokens stay ours and stay above 3:1.
2. **Colour-only active-state signalling.** ~~Anytype does not signal an active filter at all~~ —
   **corrected 2026-09-05: it does, with the chip rail (`053` D1) — and it signals with hue alone at
   every level.** `053` measures the chip label `#3C7FFB` on its `#E2ECFE` fill at **3.14:1** (a
   ~13px label needing 4.5:1), the fill against the bar at **1.19:1**, the inactive view tab
   `#B6B6B6` on white at **2.03:1** and the `New` button's white label at **3.74:1**. The refusal is
   unchanged and now has four more measurements behind it. Our count badge carries a number, which is
   a text signal, and it stays.

**Not adopted, with reasons**: Anytype's `#3C7FFB` accent and its `#B6B6B6` / `#EBEBEB` scrollbar pair
are fixed values in a themed host; this is an Obsidian plugin and the user's theme owns those tokens.
Its 256px menu width loses to our own documented 292px `menu` role. Its 14px menu type loses to our
13px.

**One deviation, named rather than absorbed.** 28px is not on the 4/8/12/16/24/32 spacing scale a
greenfield design would use. It is adopted anyway because it is simultaneously the measured Anytype
row height **and** the coarse-pointer touch floor our own `design-system.md` §9 already sets ("at
least 28×28"). A measurement and an established project value agree; the scale default loses to both.
On the phone the floor is `044`'s 44px close, unchanged.

### Motion

Nothing about motion is readable from a still. `047` §10's 0.2s enter / 0.1s exit is a source read of
one centralized `animationProps` helper. The 200ms enter sits inside the 180-260ms band for a small
state change; the 100ms exit sits below the 120ms floor for direct feedback and would read as a cut
rather than a dismissal. **Enter 200ms `ease-out`, exit 150ms `ease-in`** — with the deviation from
`047`'s reported exit figure recorded here rather than silently rounded.

**Corrected 2026-09-05 by `055`'s true-up.** `047`'s "0.1s exit" is not what the source says:
`055` read `notification/common.scss` and `_mixins.scss` directly and found the toast's **enter and
exit are one 0.2s transition**, with the common transition `0.15s cubic-bezier(0.22, 1, 0.36, 1)` and
menus, popups and the sidebar at `0.2s`. So there was never a 100ms exit to be below the floor. Our
**150ms `ease-in` exit stands unchanged** — it was chosen against our own band, not against Anytype's
number — but the sentence justifying it by "the source reports 100ms" is withdrawn, and `055`'s
`--db-motion-surface` at **200ms ease-out** is the token that carries the enter half.
<!-- /ANCHOR:rollup -->

---

<!-- ANCHOR:cross-refs -->
## 5. CROSS-REFERENCES

- **Requirements**: `spec.md` §4
- **Thresholds**: `acceptance-criteria.md`
- **Tasks**: `tasks.md` — T001 is this document
- **Rulings**: `decision-record.md`
- **Research source**: `../047-competitor-references-and-pm-alignment/research/research.md` §5-§11
- **Capture index**: `../../../screenshots/anytype/README.md`
- **Corrections to this document**: `../053-toolbar-and-view-controls/design-trueup.md` (D1-D4 — the
  chip rail, the per-view default, the twelve filter formats, the per-layout page limit),
  `../052-dropdown-menu-and-picker-componentization/design-trueup.md` (C1 hover, C10 the 7.11:1
  secondary-text ratio), `../055-states-feedback-and-motion/design-trueup.md` (the 0.2s exit)
- **Load and view reports**: `tools/mock-data/anytype/views-report.json`, `capture-report.json`
- **Our own captures**: `../../../screenshots/notion-clone/`
- **Token and role authority**: `../design-system.md`
- **Phone grammar**: `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: `../048-stacked-sheets/spec.md` §4
<!-- /ANCHOR:cross-refs -->
