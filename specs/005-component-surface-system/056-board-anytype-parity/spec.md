---
title: "Feature Specification: Board Anytype Parity"
description: "The board is a 1:1 Project Manager copy the operator has now replaced: it must read as Anytype's kanban, element by element against the captured screens."
trigger_phrases:
  - "056 spec"
  - "board anytype parity"
  - "kanban anatomy"
  - "board element migration table"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/056-board-anytype-parity"
    last_updated_at: "2026-09-05T23:40:00Z"
    last_updated_by: "design-leaf"
    recent_action: "trued the thirteen board elements against the kanban captures"
    next_safe_action: "Execute T002, the red-first measurement pass, then T003"
    blockers:
      - "T004 onward stay blocked on T002 and T003"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/board-card-fields.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Ungrouped column: No value or Uncategorized, one string for both surfaces"
    answered_questions:
      - "The gantt is out of scope and stays the Project Manager 1:1 port"
      - "The phone board is captured and carries its own geometry, not the desktop's"
      - "Desktop column headers carry no record count; the dots and plus are hover-only"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Board Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->


---

## EXECUTIVE SUMMARY

The board view is a faithful 1:1 copy of Project Manager's kanban, shipped in 0.0.16 through
0.0.20 under `038-board-kanban-port` on the operator's 2026-09-04 ruling. On 2026-09-05 ~22:45 the
operator replaced that direction for the board: *"Board UI/UX should almost be 1:1 Anytype."* This
packet rebuilds the board against Anytype's captured kanban — column header, card, cover, property
rows, the new-record affordance, column add, drag, grouping, option colours, the sticky horizontal
scrollbar and the empty column — and retires or folds the seven local extensions the 1:1 copy left
gated behind `boardExtensions = false`.

**Key Decisions**: the board half of the Project Manager ruling is superseded and the gantt half is
not (ADR-001); parity is the default and a deviation must be an accessibility one with its
measurement (goal D3, inheriting `051` ADR-007).

**Critical Dependencies**: T001, the capture true-up, gates every geometry value below; the parent's
serialized CSS lane gates every `styles.css` leg.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-05 |
| **Branch** | `worktrees/117-phases-056-057` |
| **Parent Spec** | ../spec.md |
| **Phase** | 56 of 57 |
| **Predecessor** | 055-states-feedback-and-motion |
| **Successor** | 057-calendar-anytype-parity |
| **Handoff Criteria** | The migration table in section 4 is complete with no `unknown` cell, and `acceptance-criteria.md` AC-001 through AC-008 are Met, Waived or Superseded |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 56** of the Component Surface System.

**Scope Boundary**: the board view only — `src/views/board-renderer.ts`, `board-card-fields.ts`,
`board-card-properties-panel.ts`, the board block of `styles.css`, and the board's own tests and
harness lanes. The calendar is `057`. The gantt is nobody's: `037`'s 1:1 Project Manager port
stands untouched.

**Dependencies**:
- `050-anytype-adoption/design-trueup.md` is the design read of record (`050` ADR-003).
- `045-board-card-properties` supplies the card-property mechanism this packet keeps and retargets.
- `044-phone-sheet-alignment`'s seven-element grammar and `048-stacked-sheets`'s stacking model are
  constraints every phone surface here must still satisfy.
- `053-toolbar-and-view-controls` owns the toolbar and the view-settings panel; a board leg that
  needs a settings row asks `053` for it rather than building a second one.

**Deliverables**:
- The per-element migration table in section 4, complete.
- An Anytype-shaped board renderer with the Project Manager vocabulary removed or dispositioned.
- The sticky horizontal scrollbar `050` REQ-003 measured and this repository does not have.
- A disposition for all seven local extensions: `retire` or `fold`, none left default-off.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The board renders Project Manager's kanban, not Anytype's: `src/views/board-renderer.ts` constructs
**39** distinct `pm-*` classes and `styles.css` carries **23** `pm-kanban-*` rules, and the default
layout is explicitly *"the one-to-one kanban copy"* (`board-renderer.ts:203-206`). The operator has
replaced that target for the board. Nothing in the tree points at an Anytype kanban screen, no
element is trued against one, and the sticky horizontal scrollbar the captures show on both the
kanban and the grid is absent from the renderer and from the stylesheet entirely.

### Purpose
The board reads as Anytype's kanban to an operator holding both products side by side, with every
adopted value traceable to a named capture file and every declined value carrying an accessibility
ground and its measurement.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The kanban anatomy in section 4, element by element, against the captures named there.
- The per-element migration table: PM element, Anytype element, capture filename, our file.
- The sticky horizontal scrollbar on the board.
- The disposition of all seven `boardExtensions` local extensions.
- `045`'s card-property rows retargeted to the captured card's row shape, mechanism unchanged.
- The board's phone presentation, under `044`'s grammar and `048`'s stacking.

### Out of Scope
- The gantt and the timeline — the operator's clarification is explicit, *"gantt stays PM"*, and
  Anytype ships no timeline layout to port from. `037`'s copy stands.
- The table view — it stays ours, with Anytype grid patterns adopted where the captures show them
  better; `050`, `053` and `054` already carry those and this packet does not duplicate them.
- The toolbar, the view switcher and the view-settings panel — `053`'s.
- The data model: no Objects, Types or Queries (goal D8, inheriting `050` D6).
- Deleting `045`'s card-property mechanism (goal D5).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/board-renderer.ts` | Modify | Replace the `pm-kanban-*` element vocabulary with the Anytype-shaped one; add the sticky scrollbar; disposition the seven extensions |
| `src/views/board-card-fields.ts` | Modify | Retarget the card property rows to the captured row shape |
| `src/views/board-card-properties-panel.ts` | Modify | Presentation only; the mechanism `045` built is unchanged |
| `styles.css` | Modify | The board block, under the parent's serialized CSS lane |
| `src/views/board-renderer-parity.test.ts` | Modify | Re-point the parity assertions from the Project Manager reference to the Anytype one |
| `src/views/board-renderer-hierarchy.test.ts` | Modify | Follow the element hierarchy as it changes |
| `src/views/board-card-fields.test.ts` | Modify | Follow the property row shape |
| `src/views/board-card-properties-panel.test.ts` | Verify | Must stay green unchanged — the mechanism is not touched |
| `specs/005-component-surface-system/056-board-anytype-parity/design-trueup.md` | Create | T001's capture read, the design record of this packet |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### The Anytype kanban anatomy this packet matches

Thirteen elements. **T001 landed 2026-09-05; `design-trueup.md` is its output and every cell below
is now either a measurement with its capture file or a labelled *design inferred* with its reason.**
Desktop figures are CSS pixels at 1x (the captures are 2168 x 1217 at one device pixel to one CSS
pixel, `design-trueup.md` section 2); phone figures are pt, divided by three from a 1206 x 2622
frame.

| # | Element | What the capture shows | Reference capture |
|---|---------|------------------------|-------------------|
| A1 | **Column header** | **Measured.** At rest, desktop: the option chip **alone** — 24px tall, 12px radius, 1px `#EBEBEB` light / `#292929` dark border, **no fill**, 8px in from the card's left edge, option-coloured text. **No record count exists on the desktop board.** On hover a **28 x 28px** `···` slot (fill `#232323` dark) and a bare **14 x 14px** `+` appear right-aligned, 8px from the card's right edge, 6px apart. On phone all three are permanent **and the count is present**, as plain text 10.3pt after the label | `anytype-<use-case>-kanban-{light,dark}.png` x20 at rest; `anytype-menu-kanban-column-menu-dark-full.png` on hover; `anytype-mobile-set-kanban-dark.png` |
| A2 | **Card shape and padding** | **Measured.** **246px** wide, content-driven height (104px observed at minimum), **8px** radius, **1px** border `#212121` dark / `#F2F2F2` light, fill `#191919` / `#FFFFFF`, **no shadow at rest**, **16px** padding, **8px** inter-card gap. Column gap **24px**, pitch **270px**, and **no column background panel at all** | `anytype-project-tracker-kanban-{light,dark}.png` |
| A3 | **Card cover** | **The control is measured; the rendered cover is design inferred.** `Cover  Select ›` opens `None` (selected) / `Object cover` / `Attachments`, with `Fit media` a separate toggle, off. The default is off, which is why no card in the twenty captures carries one | `anytype-menu-set-layout-kanban-cover-{light,dark}-full.png` |
| A4 | **Property rows on the card** | **Measured.** **Values only, no labels**, one per line on a **25px** pitch, in the view's property order, `#A3A3A3` dark / `#828282` light. The object type is the first line under the title. Select options are **20px filled chips, 6px radius, 8px gap**, tint fill plus darkened text; checkboxes a **14 x 14px** circle glyph plus the property name; relations a 16px icon plus the object title; dates plain text | `anytype-crm-contacts-deals-kanban-{light,dark}.png`, `anytype-project-tracker-kanban-dark.png` |
| A5 | **"+ New" affordance placement** | **Measured at rest: bottom, both clients.** Desktop is a **246 x 42px** bordered box **8px below the last card**, 8px radius, bare **14 x 14px** `+` centred, no label. Phone is a **labelled `+ New` row**, left-aligned, no box. `047` section 5's *"always the top drop target"* is a **drag-time** claim no capture holds and stays **design inferred** | `anytype-project-tracker-kanban-dark.png` y 417..458; `anytype-mobile-set-kanban-dark.png` y 1266..1313 |
| A6 | **Column add** | **No such control exists.** No add-a-column affordance appears on the strip in any of the twenty captures; the column menu offers `Hide Column`, not `Add Column`, because a column **is** a group option. The surface that adds one is the option editor, which is `054`'s | twenty set captures; `anytype-menu-kanban-column-menu-{light,dark}.png` |
| A7 | **Drag affordances** | **Not seen.** No capture in the 62-file set holds a card mid-drag, which `screenshots/anytype/README.md` already records. The design stays `047`'s source read — off-screen clone, cached-rect hit testing inside `requestAnimationFrame`, `isOver` plus edge classes, and one property write per cross-column drop | `047/research/research.md` section 5 (source-derived) — **design inferred from source code, not seen** |
| A8 | **Group-by and the ungrouped column** | **Measured.** The layout panel carries `Group by  <property> ›` between `Fit media` and `Color columns`, opening a handle-less anchored picker: one row per eligible property with its type icon, a **trailing ✓** on the selected one, a divider, then `+ Add Property`. The phone shows the same list as a handle-less stacked sheet. The ungrouped column is **first in the strip**, labelled **"No value"** on desktop and **"Uncategorized"** on phone — a copy divergence in the reference, recorded in `design-trueup.md` C3 | `anytype-menu-set-layout-kanban-group-by-{light,dark}-full.png`; `anytype-mobile-sheet-kanban-groupby-{light,dark}.png` |
| A9 | **Colours per option** | **Measured across all ten use cases: a ten-colour named palette** — Grey, Yellow, Amber, Red, Pink, Purple, Blue, Sky, Teal, Green — each with a 16px disc at a 28px pitch in the column menu. The disc carries the **tint**, which is the card chip's fill. The header chip uses the **text** variant on the page background; the card chip pairs the tint fill with a **darkened text**. `Color columns` is a toggle, **off by default**, which is why the column body is uncoloured. Full hex table: `design-trueup.md` section 3 | `anytype-menu-kanban-column-menu-{light,dark}.png`; all twenty set captures |
| A10 | **Horizontal scroll with the sticky scrollbar** | **Re-measured independently and confirmed**: 10px tall, 8px above the viewport bottom, spanning the scroller's width — y 1199..1208 of a 1217px viewport, thumb x 668..1707 on a track to x 2100, on the kanban and the grid alike. Thumb `#B6B6B6` on track `#EBEBEB` light, `#737373` on `#292929` dark; **colours stay ours**, from the theme's scrollbar tokens, because this is an Obsidian plugin and the reader's theme decides (`050/design-trueup.md` REQ-003). The declined pair also measures **1.70:1** | `anytype-project-tracker-kanban-light.png`, `anytype-project-tracker-grid-light.png` |
| A11 | **Empty column state** | **Not seen.** All six visible columns in all ten dark captures carry a card at y 305..330; no empty column exists in the sweep, and no board in the set has a deleted group relation. Both states stay `047` section 5's source read | twenty set captures — **design inferred from source code, not seen** |
| A12 | **Card menu** | **Measured.** A **256px** panel on **28px** rows, four sections separated by three dividers: `Open as Object` / `Change type ›` / `Edit Properties`; `Favorite` / `Pin to Channel` / `Add Link to Object ›` / `Add to Collection ›`; `Copy Link` / `Duplicate` / `Export` / `Unlink from Collection` / `Move to Bin`; `Open in New Tab` / `Open in New Window`. Icon-plus-label rows, chevron on submenu rows. **`Move to Bin` is not red** — `#E1E1E1` dark / `#252525` light, identical to every other row | `anytype-menu-kanban-card-menu-{light,dark}.png` and its three `-add-link-to-object`, `-add-to-collection`, `-change-type` variants |
| A13 | **Page limit** | **Confirmed: 10**, selected from `10 / 20 / 50 / 70 / 100` — `053` D4's per-layout figure, not `050`'s withdrawn flat 60. **What renders past the limit is not seen**; no captured column exceeds it | `anytype-menu-set-layout-kanban-page-limit-{light,dark}-full.png` |

**Capture inventory, counted rather than quoted.** The kanban set is **20** files —
`screenshots/anytype/desktop/sets/<use-case>/anytype-<use-case>-kanban-{light,dark}.png`, ten use
cases by two themes. The kanban menu crawl is **36** files, which is **9 menus** at light/dark by
clipped/`-full`: the card menu and its three sub-menus, the column menu, and the four
`set-layout-kanban` panels (base, cover, group-by, page-limit). The iOS set is **6** files, **3
sheets**: `anytype-mobile-sheet-kanban-groupby-*`, `anytype-mobile-sheet-kanban-column-menu-*` and
`anytype-mobile-sheet-view-layout-kanban-*`. *The opening brief for this packet said "kanban 5
menus"; the folder holds nine. The counted figure is used and the discrepancy is named rather than
carried forward.*

### The per-element migration table

Every `pm-*` class `board-renderer.ts` constructs, and where it goes. **T001 landed and filled the
Anytype element and capture columns; the three no-counterpart families keep `retire or fold, T003`
because that disposition is T003's, and `design-trueup.md` section 7 supplies the evidence it
needs.** A row reading `unknown` blocks closure; **no row reads `unknown`.** Line numbers are `9a0293a2`, re-read after the rebase rather than carried. The full per-element table, with our value beside Anytype's, is
`design-trueup.md` section 4.

| PM element | Anytype element | Capture filename | Our file | Disposition |
|---|---|---|---|---|
| `pm-kanban-view` | Set kanban root, no chrome of its own | `anytype-project-tracker-kanban-light.png` | `board-renderer.ts:330`, `styles.css:9213` | Rename; the shell already matches |
| `pm-kanban-board` | Column strip at a **270px** pitch + the sticky scrollbar (A10) | `anytype-project-tracker-kanban-light.png`, `-grid-light.png` | `board-renderer.ts:331`, `styles.css:9228` | Gap **14 → 24px**; add the scrollbar rail |
| `pm-kanban-col` | Group column, **246px**, **no background panel** (A9) | ten use cases, both themes | `board-renderer.ts:350`, `styles.css:9251` | Width **280 → 246px**; drop the background, radius and `overflow: hidden` |
| `pm-kanban-col-topbar` | **No counterpart** — the option colour lands on the chip's text, never on a bar | ten use cases | `board-renderer.ts:354`, `styles.css:9265` | `retire` |
| `pm-kanban-col-header`, `-col-title-row`, `-col-header-right` | Column header: chip at card-left **+8px**, `···` (28 x 28px) and `+` (14 x 14px) **hover-only**, 6px apart, 8px from the right edge (A1) | `anytype-menu-kanban-column-menu-dark-full.png` | `board-renderer.ts:351`, `:356`, `:363`, `styles.css:9262`, `:9269`, `:9286` | Re-shape; **9px** from the chip to the first card |
| `pm-kanban-col-badge` | The **24px outlined option chip**, 12px radius, no fill (A1) | ten use cases | `board-renderer.ts:357`, `styles.css:9275` | Becomes a bordered chip; the light-theme text colour is declined (ADR-004 E1) |
| `pm-kanban-col-badge-icon` | **No counterpart** — the column chip carries no icon | ten use cases | `board-renderer.ts:359-361`, `styles.css:9282` | `retire` |
| `pm-kanban-col-count` | **Desktop: does not exist.** Phone: plain text in the label's grey, 10.3pt after it, no pill (A1) | twenty desktop files; `anytype-mobile-set-kanban-dark.png` | `board-renderer.ts:364`, `styles.css:9291` | `retire` the pill; a phone-only plain-text count or nothing |
| `pm-kanban-cards` | The card list; **gap 8px**, no horizontal padding | ten use cases | `board-renderer.ts:366`, `styles.css:9300` | Padding **6px 10px → 0**; gap unchanged |
| `pm-kanban-drop-target` | **Not seen** — no capture holds a drag (A7) | README, "not specifically captured" | `board-renderer.ts:382`, `styles.css:9310` | Keep, **design inferred** |
| `pm-kanban-card`, `-card-body` | Card: **246px**, **8px** radius, 1px border, **no shadow at rest**, **16px** padding, rows on a **25px** pitch (A2) | `anytype-project-tracker-kanban-{light,dark}.png` | `board-renderer.ts:426`, `:473`, `styles.css:9314`, `:9347` | Drop `min-height: 112px`; padding **10/12 → 16px**; gap **7px → a 25px pitch** |
| `pm-kanban-card:hover`, `--dragging`, `pm-dragging` | **Not seen** — no capture holds a pointer or a drag | README | `board-renderer.ts:455-456`, `styles.css:9327`, `:9331`, `:9338` | Keep, **design inferred**; the hover shadow is our second signal for a 1.11:1 border |
| `pm-kanban-card-title-row`, `-card-title` | Title **≈15px** `#E1E1E1`/`#252525` after a **16 x 16px icon slot**, text starting 27px in. **No type chips** (A2) | ten use cases | `board-renderer.ts:480`, `styles.css:9357`, `:9575` | Size **13 → 15px**; add the icon slot; `retire` the M/Sub/R chips |
| `pm-kanban-card-description` | One property row among the rest, same pitch, same grey, **single-line truncated** (A2/A4) | `anytype-course-notes-kanban-dark.png` | `board-renderer.ts:516`, `styles.css:9363` | Fold into the property row; clamp **3 → 1** |
| `pm-kanban-card-tags`, `pm-chip` family (7 classes) | **20px tall, 6px radius, 8px gap**, tint fill plus darkened text, **no dot**; overflow `+3` (A4/A9) | `anytype-crm-contacts-deals-kanban-*.png` | `board-renderer.ts:528`, `styles.css:9374`, `:9480` | Pin 20px/6px; replace the 10%/20% colour-mix with the measured tint pair; `retire` the dot |
| `pm-kanban-card-footer` | **No counterpart** — every property is a row in one rhythm; nothing is pinned to the bottom (A4) | ten use cases | `board-renderer.ts:553`, `styles.css:9380` | `retire` |
| `pm-avatar` family (4 classes) | **No counterpart** — a person renders as a **16px icon plus the name** on its own row (A4) | `anytype-crm-contacts-deals-kanban-*.png`, `anytype-habit-health-log-kanban-dark.png` | `board-renderer.ts:558-569`, `styles.css:9408` | `retire`, T003 confirms |
| `pm-kanban-card-parent` | **The slot survives, its content changes**: the line there is the **object type name**, at the ordinary secondary size and colour, not a smaller breadcrumb | ten use cases, band y 349..361 | `board-renderer.ts:478`, `styles.css:9389` | `fold`, T003 confirms |
| `pm-kanban-card-priority-bar` | **No counterpart** — priority is an ordinary property row in the chip family | `anytype-project-tracker-kanban-dark.png` y 449..460 | `board-renderer.ts:469`, `styles.css:9342` | `retire`, T003 confirms |
| `pm-progress` family (4 classes) | **No counterpart** on the kanban card | ten use cases | `board-renderer.ts:546-548`, `styles.css:9453` | `retire`, T003 confirms |
| *(absent today)* | **Sticky horizontal scrollbar** — 10px tall, 8px above the bottom, scroller width (A10) | `anytype-project-tracker-kanban-light.png`, `-grid-light.png` | none — `050` REQ-003's gap | Add; geometry adopted, colours declined (ADR-002, ADR-004 X1) |
| *(absent today)* | **`+ New` control** — 246 x 42px bordered box on desktop, labelled row on phone (A5) | `anytype-project-tracker-kanban-dark.png`, `anytype-mobile-set-kanban-dark.png` | none | Add |

### The seven local extensions, and why they are not a separate question

`board-renderer.ts:203-206` gates seven affordances behind `boardExtensions = false` with the
comment *"the default layout is the one-to-one kanban copy, which has none of them"*: **swimlanes,
covers, WIP counts, summaries, batch order, touch menus, group controls**. The reason they are
dark is the target this packet replaces. Each is now re-asked against Anytype, and **T001 changed
the count**: **covers**, **group controls**, **touch menus** and **WIP counts** all have captured
counterparts (A3, A8, the phone's permanent `···` sheet, the phone's plain-text record count), so
four are `fold` candidates rather than two. **Swimlanes**, **summaries** and **batch order** have
no counterpart in any of the 62 files and are `retire` candidates. The evidence for each is
`design-trueup.md` section 7. **T004 executed the dispositions below; the table is T003's
verdict, filled in the same leg the code landed rather than ahead of it.**

| Extension | Disposition | What changed |
|---|---|---|
| Covers | `fold` | `renderCover` (unchanged method) now runs unconditionally in the rebuilt default card whenever `config.boardImageField` is set, rather than only under `boardExtensionsEnabled`. Off by default because no field is mapped by default — the same shape as Anytype's `Cover: Select › None` |
| Group controls | `fold` | The existing sort/hide/delete menu (`renderBoardGroupOptions`, unchanged) now opens from the rebuilt header's hover-revealed control, in place of a new component |
| Touch menus | `fold` | The same menu is permanently visible on touch (`.db-kanban-board.is-touch`), matching the phone's permanent `···`. The captured sheet's own chrome — a grab handle, a `Column color` disc row, an `Apply` pill — is not reproduced; the affordance and its visibility split are, and the gap is named rather than silently substituted |
| WIP counts | `fold` | The desktop pill is gone. A phone-only plain-text count (`db-kanban-col-count`) sits beside the chip, shown only when `this.touchMode` is true |
| Swimlanes | `retire` | No second grouping axis appears in any of the 62 files; `renderSwimlaneBoard` is untouched but was already unreachable from the default board before this leg and stays that way |
| Summaries | `retire` | No aggregate row, footer or total appears in any capture; the rebuilt default card never calls `renderGroupSummaries` |
| Batch order | `retire` | No multi-select or drag-held state is captured; the rebuilt default board's drag handlers move one card per gesture, the same as the port they replace |

**What this does not claim.** `boardExtensionsEnabled` and the `db-board-*` render path it gates
(`renderColumn`, `renderSubgroup`, `renderSwimlaneBoard`, and the rest) are not deleted in this
leg. Confirmed before relying on it: `rg -n "boardExtensionsEnabled" --type ts` matches its
declaration in `src/data/types.ts`, its one read in `board-renderer.ts`, and test/harness
scaffolding under `tools/live/` that opts a scenario in deliberately — no settings panel, menu or
config path in shipped app code ever sets it, so this path already renders to no real user. Goal D6's "none may stay default-off" is satisfied for the affordances themselves:
all four fold candidates are now unconditional in the DEFAULT board, and the three retire
candidates have no reachable path back into it. The literal code for the already-unreachable
extensions branch is a separate, larger cleanup this leg names rather than takes on — deleting it
touches `BoardRendererActions` and its two implementers (`database-view.ts`,
`embedded-database-renderer.ts`), which sit outside this packet's file list.

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Every one of the thirteen anatomy elements in this section is trued against a named capture file by an image-capable leaf reading it px by px, and the value is recorded in `design-trueup.md` with either a measurement or the **design inferred** label and its reason. **Satisfied 2026-09-05 by T001**: nine measured, five labelled *design inferred* with their reason (A3's rendered cover, A6, A7, A11 and the behaviour past A13's limit) |
| REQ-002 | The per-element migration table above is complete: no cell reads `unknown`, and every `pm-*` class is either replaced or carries a written reason for staying |
| REQ-003 | The board's Project Manager element vocabulary is gone or dispositioned: 39 constructed `pm-*` classes and 23 `pm-kanban-*` stylesheet rules reduced to zero undispositioned survivors |
| REQ-004 | The sticky horizontal scrollbar exists on the board at the captured geometry — 10px tall, 8px above the viewport bottom, full content width — with colours read from the theme's scrollbar tokens rather than Anytype's fixed light-theme pair |
| REQ-005 | All seven `boardExtensions` affordances carry a `retire` or `fold` disposition and none ships default-off |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-006 | `045`'s card-property mechanism is retained with its public surface unchanged, its presentation retargeted to the captured card's row shape, and `board-card-properties-panel.test.ts` green without modification |
| REQ-007 | The phone board satisfies `044`'s seven-element grammar and `048`'s stacking model after every leg — `tools/live/sheet-grammar.mjs` exit 0, 12 surfaces and 31 pairs |
| REQ-008 | The kanban page limit adopts the captured per-layout value of 10 rather than the withdrawn flat 60, or argues its own number rather than citing one |
| REQ-009 | The gantt is unmoved: the `pm-gantt-*` class count and the gantt capture hashes match their pre-leg baseline, or a move is explained by a named gap |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Constructed `pm-*` classes in `src/views/board-renderer.ts` fall from **39** to **0**
  undispositioned, and `pm-kanban-*` rules in `styles.css` from **23** to **0** undispositioned.
- **SC-002**: Thirteen of thirteen anatomy elements carry a measurement or a labelled inference in
  `design-trueup.md`, with a named capture file each.
- **SC-003**: The sticky horizontal scrollbar renders on the board and is absent today — an
  observable red before an observable green.
- **SC-004**: Board affordances shipping default-off fall from **7** to **0**.
- **SC-005**: `npm run gate` exit 0 read from `$?`, and `tools/live/sheet-grammar.mjs` still 12
  surfaces and 31 pairs green.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | T001's image-capable leaf | Every geometry value is owed to it; without it the packet designs from guesses | Goal D1 makes it a gate: no element is written before its capture is read. `054` ADR-005 already ruled that a measurement-only leg records "pixel read owed" rather than substituting a DOM reading |
| Dependency | The parent's serialized CSS lane | Two packets editing `styles.css` at once produce a conflict per leg | Take the lane per leg, as `053` did at `56e656ef` |
| Risk | The board and the gantt share `styles.css` and some chip primitives | A board leg silently moves a gantt pixel and breaks `037`'s 1:1 parity | REQ-009: baseline the `pm-gantt-*` count and the gantt capture hashes before the first leg and re-read them after the last |
| Risk | `045`'s card-property mechanism is retargeted rather than rewritten | A presentation change leaks into the mechanism and breaks a shipped feature | REQ-006 pins `board-card-properties-panel.test.ts` green *without modification* as the guard |
| Risk | Ten use cases x two themes is 20 captures, and a single-capture read generalises | The same error `050` made five times — reading one panel and calling it the product default | T001 reads across use cases before recording a value, and records the spread when they disagree |
| Risk | The reversal is read as reversing the gantt too | `037`'s shipped 1:1 port gets undone by a misreading | ADR-001 quotes the clarification verbatim; goal D7 and section 3's Out of Scope both state it; `../roadmap.md` section 7.12 records the split |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: Board render time for the 326-record mock catalogue (`049`) must not regress against
  the pre-leg baseline by more than 10%, measured on the same machine in the same session.

### Security
- **NFR-S01**: No new network reads. Cover images continue to route through
  `isCoverImageBlocked` / `resolveCoverImage` (`src/data/cover-image.ts`), which this packet does
  not weaken.

### Reliability
- **NFR-R01**: `npm run gate` exit 0 and `npm run replay` holding with a reversed 0, both read from
  `$?` rather than through a pipe, after every leg.

---

## 8. EDGE CASES

### Data Boundaries
- Empty input: a group column with no records renders the captured empty column state (A11), and a
  board whose group relation was deleted renders the dedicated empty state that points at view
  settings — two different states, not one.
- Maximum length: a group title longer than the column width, and a card title longer than the
  card, each truncate as the capture shows rather than wrapping the column open.
- Page limit: the captured kanban limit is 10 (A13); a column with more records than the limit
  renders whatever the capture shows past it, read by T001 rather than assumed.

### Error Scenarios
- A cover image that fails to load keeps `markCoverImageLoadError`'s placeholder path; the
  presentation changes, the failure handling does not.
- A group-by property whose option set changes under an open board re-renders from the new set
  without dropping the operator's scroll position.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 22/25 | Files: 9, LOC: ~1000, Systems: board renderer, card fields, stylesheet, harness |
| Risk | 12/25 | Auth: N, API: N, Breaking: Y — it reverses a shipped port and shares a stylesheet with the gantt |
| Research | 16/20 | Thirteen elements to true against 62 capture files before any code |
| Multi-Agent | 8/15 | Workstreams: 2 — an image-capable true-up leaf, then implementation legs |
| Coordination | 10/15 | Dependencies: 045, 044, 048, 050, 053, and the serialized CSS lane |
| **Total** | **68/100** | **Level 3** |

`recommend-level.sh --loc 1000 --files 12 --architectural` returns 68/100 at 82% confidence, which
is **Level 2** on the script's own thresholds (`level_2_max` 69), and a phase score of 20/50, below
the 25 threshold — a standard child, not a phased one. It is scaffolded at **Level 3** under the
go-higher rule and for consistency with every peer family packet (`050`-`055`). The script's own
figure is recorded here rather than replaced by the judgment that overrode it.

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | A geometry value is written from an unopened capture | H | M | Goal D1; the **design inferred** label; `054` ADR-005's "pixel read owed" precedent |
| R-002 | A board leg moves a gantt pixel | H | M | REQ-009 baseline and re-read |
| R-003 | The reversal is over-read as including the gantt | H | L | ADR-001, goal D7, section 3, roadmap section 7.12 |
| R-004 | `045`'s mechanism is broken by a presentation change | M | M | REQ-006's unchanged-test guard |
| R-005 | An extension is left default-off rather than dispositioned | M | M | REQ-005 counts them: 7 → 0 |
| R-006 | One capture is generalised into a product default | M | H | T001 reads across the ten use cases; `050`'s five corrections are the precedent |

---

## 11. USER STORIES

### US-001: The operator opens the board next to Anytype (Priority: P0)

**As an** operator holding both products open, **I want** our board to read as Anytype's kanban,
**so that** the side-by-side comparison that closes `047`'s rows shows a match rather than a
different product.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

### US-002: A future session finds the design record rather than a guess (Priority: P1)

**As a** later session working the board, **I want** every adopted value to name the capture it
came from and every inferred value to say so, **so that** I can tell a measurement from an
assumption without re-running the sweep.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

## 12. OPEN QUESTIONS

- ~~Does the phone board adopt the desktop column geometry?~~ **Closed by T001.** The premise was
  wrong: `anytype-mobile-set-kanban-{light,dark}.png` **is** the board body. The phone carries its
  own geometry — **254.7pt** columns at a **278pt** pitch with a **23.3pt** gap and a transparent
  card — alongside `044`'s grammar, and the desktop's numbers are not reused.
- ~~Do the five extensions with no captured counterpart retire?~~ **Narrowed to three by T001.**
  WIP counts and touch menus both have captured counterparts on the phone. Swimlanes, summaries and
  batch order have none in any of the 62 files. T003 still takes the disposition.
- **New, and the operator's:** the ungrouped column is labelled **"No value"** on desktop and
  **"Uncategorized"** on phone. Parity cannot be satisfied both ways; one string has to win
  (`design-trueup.md` C3).
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Decision Records**: See `decision-record.md`

---
