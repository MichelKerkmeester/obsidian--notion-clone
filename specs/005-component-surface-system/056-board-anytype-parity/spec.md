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
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "authored the kanban anatomy and the per-element migration table"
    next_safe_action: "Execute T001, the kanban capture true-up, by an image-capable leaf"
    blockers:
      - "Every geometry value in section 4 is owed to T001 and labelled so"
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
      - "Does the phone board adopt the desktop column geometry or only 044's sheet grammar"
    answered_questions:
      - "The gantt is out of scope and stays the Project Manager 1:1 port"
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
layout is explicitly *"the one-to-one kanban copy"* (`board-renderer.ts:202-205`). The operator has
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

Thirteen elements. Every geometry cell below is **owed to T001** unless it cites a measurement
already taken; a value labelled *design inferred* was never read off a screen and says so.

| # | Element | What the capture shows | Reference capture |
|---|---------|------------------------|-------------------|
| A1 | **Column header** | Group title, record count, a `···` menu and an add affordance on one row | `anytype-<use-case>-kanban-{light,dark}.png`; `anytype-menu-kanban-column-menu-{light,dark}-full.png` |
| A2 | **Card shape and padding** | Radius, border or shadow treatment, internal padding, inter-card gap — all owed to T001 | `anytype-project-tracker-kanban-{light,dark}.png` |
| A3 | **Card cover** | An optional image region on the card, configured by a layout setting rather than always on | `anytype-menu-set-layout-kanban-cover-{light,dark}-full.png` |
| A4 | **Property rows on the card** | Which properties render, in what order, and the row shape they render in | `anytype-crm-contacts-deals-kanban-{light,dark}.png` |
| A5 | **"+ New" affordance placement** | Where the new-record control sits relative to the column's cards — `047` section 5 records it as *always the top drop target* during a drag | `anytype-<use-case>-kanban-{light,dark}.png` |
| A6 | **Column add** | The control that adds a group column, and where it sits on the strip | `anytype-<use-case>-kanban-{light,dark}.png` |
| A7 | **Drag affordances** | Off-screen clone as drag image, cached-rect hit testing inside `requestAnimationFrame`, `isOver` plus left/right/top/bottom edge classes; cross-column drag carries the whole multi-select and commits as **one** property write, not one per card | `047/research/research.md` section 5 "Board / Kanban" (source-derived; the drag-held state is not captured — `screenshots/anytype/README.md` records drag-only states as not specifically captured) |
| A8 | **Group-by and the ungrouped column** | The `Groups ›` row the kanban settings panel inserts between Layout and the rest, the group-by property picker, and how records with no value present | `anytype-menu-set-layout-kanban-group-by-{light,dark}-full.png`; `anytype-mobile-sheet-kanban-groupby-{light,dark}.png`; `050/design-trueup.md` line 243 |
| A9 | **Colours per option** | The select option's own colour driving the column header and the card chip | `anytype-<use-case>-kanban-{light,dark}.png`, both themes |
| A10 | **Horizontal scroll with the sticky scrollbar** | **Measured**: 10px tall, 8px above the viewport bottom, full content width — y 1199..1208 of a 1217px viewport, on the kanban and the grid alike. Thumb `#B6B6B6`, track `#EBEBEB`; **colours stay ours**, from the theme's scrollbar tokens, because this is an Obsidian plugin and the reader's theme decides (`050/design-trueup.md` REQ-003) | `anytype-project-tracker-kanban-light.png`, `anytype-project-tracker-grid-light.png` |
| A11 | **Empty column state** | What an empty group column renders; and the dedicated empty state a **deleted group relation** produces, which points at view settings (`047` section 5) | `anytype-<use-case>-kanban-{light,dark}.png` across the ten use cases |
| A12 | **Card menu** | The card's own `···` menu and its three captured sub-menus — add link to object, add to collection, change type | `anytype-menu-kanban-card-menu-{light,dark}-full.png` and its `-add-link-to-object`, `-add-to-collection`, `-change-type` variants |
| A13 | **Page limit** | The kanban layout's captured page limit is **10** — not the flat 60 `050` first read, which `053` D4 corrected to per-layout (Gallery 60, Kanban 10, absent elsewhere) | `anytype-menu-set-layout-kanban-page-limit-{light,dark}-full.png` |

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

Every `pm-*` class `board-renderer.ts` constructs, and where it goes. **T001 fills the Anytype
element and capture columns; T003 fills the disposition.** A row reading `unknown` blocks closure.

| PM element | Anytype element | Capture filename | Our file | Disposition |
|---|---|---|---|---|
| `pm-kanban-view` | Set kanban root | `anytype-project-tracker-kanban-light.png` | `board-renderer.ts` | Owed to T001 |
| `pm-kanban-board` | Column strip + sticky scrollbar (A10) | `anytype-project-tracker-kanban-light.png` | `board-renderer.ts`, `styles.css` | Owed to T001 |
| `pm-kanban-col` | Group column (A9) | `anytype-<use-case>-kanban-*.png` | `board-renderer.ts` | Owed to T001 |
| `pm-kanban-col-topbar`, `-col-header`, `-col-header-right`, `-col-title-row`, `-col-badge`, `-col-count` | Column header: title, count, `···`, add (A1) | `anytype-menu-kanban-column-menu-light-full.png` | `board-renderer.ts` | Owed to T001 |
| `pm-kanban-cards` | Card list within the column | `anytype-<use-case>-kanban-*.png` | `board-renderer.ts` | Owed to T001 |
| `pm-kanban-card`, `-card-body`, `-card-title-row`, `-card-title` | Card shape and title (A2) | `anytype-project-tracker-kanban-*.png` | `board-renderer.ts` | Owed to T001 |
| `pm-kanban-card-description` | Card body text region (A2/A4) | `anytype-course-notes-kanban-*.png` | `board-renderer.ts` | Owed to T001 |
| `pm-kanban-card-tags`, `pm-chip` family (7 classes) | Select-option chip on the card (A4/A9) | `anytype-crm-contacts-deals-kanban-*.png` | `board-renderer.ts`, `board-card-fields.ts` | Owed to T001 |
| `pm-kanban-card-footer` | Card footer or its absence (A4) | `anytype-<use-case>-kanban-*.png` | `board-renderer.ts` | Owed to T001 |
| `pm-avatar` family (4 classes) | Person-property presentation on the card (A4) | `anytype-crm-contacts-deals-kanban-*.png` | `board-renderer.ts` | Owed to T001 |
| `pm-kanban-card--dragging`, `pm-dragging`, `pm-kanban-drop-target` | Drag clone, `isOver` and edge classes (A7) | Not captured — source-derived from `047` section 5 | `board-renderer.ts` | Owed to T001, **design inferred** unless a capture is found |
| `pm-kanban-card-parent` | **No Anytype counterpart** — Project Manager's subtask breadcrumb | none | `board-renderer.ts` | `retire` or `fold`, T003 |
| `pm-kanban-card-priority-bar` | **No Anytype counterpart** — Project Manager's priority accent | none | `board-renderer.ts`, `styles.css` | `retire` or `fold`, T003 |
| `pm-progress` family (4 classes) | **No Anytype counterpart** on the kanban card | none | `board-renderer.ts` | `retire` or `fold`, T003 |

### The seven local extensions, and why they are not a separate question

`board-renderer.ts:202-205` gates seven affordances behind `boardExtensions = false` with the
comment *"the default layout is the one-to-one kanban copy, which has none of them"*: **swimlanes,
covers, WIP counts, summaries, batch order, touch menus, group controls**. The reason they are
dark is the target this packet replaces. Each is now re-asked against Anytype: **covers** and
**group controls** have captured counterparts (A3, A8) and `fold`; the other five have none read so
far and are `retire` unless T001 finds one. None may stay default-off (goal D6).

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Every one of the thirteen anatomy elements in this section is trued against a named capture file by an image-capable leaf reading it px by px, and the value is recorded in `design-trueup.md` with either a measurement or the **design inferred** label and its reason |
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

- Does the phone board adopt the desktop column geometry, or is `044`'s sheet grammar its only
  constraint? The three iOS kanban sheets cover the group-by and column menus, not the board body.
- Do the five extensions with no captured counterpart — swimlanes, WIP counts, summaries, batch
  order, touch menus — retire outright, or does one of them fold into an Anytype element T001 has
  yet to read? T003 answers this from T001's output, not before.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Decision Records**: See `decision-record.md`

---
