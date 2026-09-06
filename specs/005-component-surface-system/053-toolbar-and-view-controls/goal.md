---
title: "Goal: Toolbar and View Controls"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "toolbar phase goal"
  - "053 goal"
  - "view controls directive"
  - "toolbar componentization goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/053-toolbar-and-view-controls"
    last_updated_at: "2026-09-05T23:40:00Z"
    last_updated_by: "verify-and-land-053"
    recent_action: "Landed T014 and AC-113: the permanent settings gear sits before the overflow menu"
    next_safe_action: "AC-110 lane clause (AC-103/105) and AC-111, the operator device pass"
    blockers:
      - "AC-111 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/views/database-view.ts"
      - "src/views/board-renderer-hierarchy.test.ts"
      - "src/views/table-renderer-sort-conflict.test.ts"
      - "src/views/database-view-settings-landing.test.ts"
      - "tools/live/toolbar-collapse-sweep.ts"
      - "tools/live/run-toolbar-collapse-sweep.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-053-goal"
      parent_session_id: null
    completion_pct: 92
    open_questions: []
    answered_questions:
      - "050's Today cells for items 1 and 4 were corrected against the current tree: a chip rail and a duplicate-view action already exist; the thresholds are kept, the states are re-measured"
      - "Seven settings-button methods in toolbar-renderer.ts have zero call sites; the live settings entry is the utilities row"
      - "T001: the rail does not move, so the sticky-offset and pixelHash question is void"
      - "T001: 050 C2 overturned; the chip rail is captured on 11 files"
      - "T001: 050 C7 overturned; per-view defaults live in the New menu"
      - "T001: the settings landing applies on phone"
---
# Goal: Toolbar and View Controls

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Rebuild the database toolbar and its view controls as a composed set of shared
primitives — view tab strip, control cluster, active-rule chip row, shared condition row, view
settings entry — take the Anytype behaviours the captures show are better, and keep every surface
the program has ruled stays ours.

**Why.** The toolbar is the plugin's most-touched chrome and its least-shared code: eight
renderers each build their own popover shells, their own row vocabularies and their own
close-others sequences (`toolbar-renderer.ts` alone repeats the same five-close run at 17 call
sites, read by grep on the current tree). The operator's instruction of 2026-09-05 — *"research
recommendations and how to tackle / update / improve every modal, sheet and general ui ux to take
the best from AnyType and componentize stuff as much as possible"* — names both halves. This phase
is the toolbar's half.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Every design is read against a capture before the surface is written.** The implementing agent opens each PNG named in `toolbar-surface-inventory.md` §3 and §4 before touching the surface that row designs. Where no capture exists — the per-view preset control, the measured collapse, the sort-conflict moment — the design is built from `047`'s code-derived findings **with the gap named in the task**, never guessed. (The drafting runtime could not render images, so the obligation transferred to T001 — **discharged 2026-09-05**: `design-trueup.md` is the measured read and `toolbar-surface-inventory.md` §8.1 the per-row record, 24 of 24.) |
| D2 | **Red first, per criterion, on a threshold.** Every criterion carries one number or boolean stated in `acceptance-criteria.md`, observed failing on the current tree before the work is written, with the failing figure recorded in `checklist.md`. |
| D3 | **The composed primitives replace, not accompany.** A surface that migrates onto a primitive stops carrying its own vocabulary. The `db-view-tab-popover-row db-menu-item` dual-classing (`toolbar-renderer.ts:1249`, `:1341`) and the per-surface close runs are deleted at their surface's migration, not left beside the primitive that replaced them. |
| D4 | **What stays ours stays.** The table view, formulas/rollups/calculations (no Anytype equivalent — `screenshots/anytype/README.md` mapping), the Project Manager 1:1 board and gantt parity (`037`/`038`), the bottom sheets' ownership (`044`/`048` grammar, `003` portal), and the utilities overflow's own action set are not redesigned here. |
| D5 | **`044`'s sheet grammar and `048`'s stacking model are constraints.** Every toolbar surface that presents as a phone sheet carries the seven grammar elements, and every surface that can open over another obeys the stacking model. Both are consumed unchanged. |
| D6 | **One leg touches one file.** Legs are grouped by file (`plan.md` §4); `styles.css` is the exception and is serialized by the parent's CSS lane. |
| D7 | **This phase implements `050` items 1, 2, 4, 7, 10 and 12**, at the thresholds `050`'s `design-trueup.md` **restated** — not the ones its first draft carried. Item 1 is now the `N applied` count label and the trigger's state reporting, **not** dual-mode icons (rejected: the captures show one icon state, and the colour-only signalling Anytype does carry fails WCAG 1.4.11 where our count badge already carries a text signal). Item 2 keeps the 100ms landing budget as ours. Item 4's duplicate and remove go in the **view-settings panel**, matching the capture; the desktop tab context menu was never photographed and stays *design inferred from source, not seen*, though T001 found its **phone** equivalent — an explicit Edit mode, not a long-press. Item 7 is **confirm, not disable**, reusing `isExplicitlySorted(config)`. Item 10 narrows to **per-field default values for a new row**, and **T001 corrected the reason**: `050` C7 said no per-view default exists in the product, but `anytype-menu-set-new-object-light.png` carries `Default Type for this View` and `Template for this View` — so we narrow because we have no type or template system to default, and the section lands in the **New menu**, not the settings panel. Item 12's end state is captured and its *mechanism* is not, so the threshold asserts the end state — sharpened at T001, since the inline rung drops the add-view `+` as well. Item 1 lost two clauses at T001: the rail's band move (it is already where the capture puts it) and the direction colour (3.14:1 / 1.19:1). Items 3, 5, 6, 8, 9, 11, 13, 14 stay `050`'s. |
| D8 | **One owner per surface, across the five family phases.** The **condition row is this phase's** — `052` does not build it. The **confirm primitive is `051`'s**; ADR-003's sort-conflict confirm *consumes* it and does not create a second. The **shell** a toolbar popover presents in on the phone is `051`'s; `createPopoverShell` composes it rather than declaring a second. **Cell inline editors are `054`'s**. `048`'s stacking model is a constraint and is not re-specified here. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the parent's `goal.md` first** (`../../goal.md`) — D1-D14 bind here as written there, and
`050`'s `goal.md` D1-D8 bind for every item this phase implements.

**Two corrections this packet records against `050`'s checklist**, measured on the current tree,
thresholds unchanged:

1. **Item 1's "Today" is not zero chips.** A chip rail exists — `active-view-controls-renderer.ts`
   renders sort-then-filter chips with a logic toggle, a clear-all and auto-hide-when-empty into
   `.db-header` (its `render()`, lines 66-189; auto-hide at line 99). What is missing is the
   Anytype half: the toolbar's filter and sort triggers are not dual-mode (they always open the
   panel — `toolbar-renderer.ts:2211`, `:2229`), the leading sort chip is not
   direction-coloured, and the row sits below the toolbar rather than in it.
2. **Item 4's "Today" is not no duplicate and no menu.** `duplicateView` exists
   (`database-view.ts:3925-3947`, new id at `:3930`, unique-name suffix at `:3949-3956`) and the
   view-tab context menu exists (`toolbar-renderer.ts:1229-1284`) with rename, copy-current-view,
   copy-view-code, change type, move and delete. The item's remaining work is its componentization
   (the menu is hand-rolled rows on a dual class) plus the item-2 landing behaviour, not creation
   from nothing.

**Precedence.** Parent decisions outrank this file, which outranks any summary. Name conflicts;
never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **The toolbar renders from composed primitives, and the replaced vocabularies are gone.**
      **Today: eight renderers own their own shells** — 17 repeated close runs in
      `toolbar-renderer.ts` (grep count), 11 hand-rolled row vocabularies across 17 root sites
      (`design-system.md` §6), and seven dead settings-button methods with zero call sites
      (`toolbar-renderer.ts:512, :519, :551, :1594, :2239, :2252, :2290`, grep-verified at HEAD).
      Done is: one view tab strip, one control cluster, one chip row, one condition row shared by
      filter and sort, one settings entry — and the dual classes, the repeated close runs and the
      dead methods deleted, with the migration rows of `toolbar-surface-inventory.md` §3 all
      showing their target state.
- [ ] **The filter and sort state is legible where the reader configures the view, and the leading
      sort chip is direction-coloured.** **Restated 2026-09-05 against `design-trueup.md` REQ-001**,
      because the threshold this criterion used to carry could not be observed red. **What was
      false:** "0 chips and one fixed icon state" — our chip rail ships
      (`active-view-controls-renderer.ts`, auto-hiding at `:97`, on both the full-page and embedded
      renderers) and both triggers already carry a numeric count badge
      (`toolbar-renderer.ts:2575-2579`). **What is rejected:** Anytype's dual-mode icons. Scanning
      the four toolbar icons across all 120 catalogue captures returns one result 120 times, and the
      filter funnel measures `ink=52, blue=0` on a filtered view and on an unfiltered one —
      identical to the pixel. The sort glyph's blue is a static two-tone glyph, not a state.
      **What is adopted:** a state summary in **every** value column of the view-settings surface,
      with the empty case rendered as a **word** rather than a blank — widened at T001 from the
      desktop's `Sort  1 applied` to the phone's `Properties  27 applied` / `Filters  No filters` /
      `Sorts  2 applied` (`anytype-mobile-sheet-view-edit-light.png`). Plus the measured chip
      anatomy: **28px** (from 26), an 8px/12px group separator, and the condition-as-a-phrase
      label. **Today: 0 settings rows carry a summary** and the chip is 26px
      (`styles.css:1776`) with no direction word (`active-view-controls-renderer.ts:122-135`).
      **Two further clauses were struck at T001, on measurement.** The rail does **not** move into
      the toolbar band: `anytype-project-tracker-list-light.png` places Anytype's rail below a 1px
      full-content-width divider in its own band, which is where ours already renders — `050` C2's
      "no chip row on any capture" is overturned, and the sticky-offset risk retires with the move.
      And the leading sort chip's direction is **not** carried by colour: Anytype uses the `↓`
      glyph on desktop and the word `Ascending` on the phone, and its own chip pair measures
      **3.14:1** accent-on-tint with a **1.19:1** fill against its bar. Direction rides the glyph
      and the word; colour is permitted only as a redundant third signal.
- [ ] **Creating or duplicating a view lands in that view's settings within 100ms.** **Today:
      neither does** — `addView` ends at `refresh({ viewport: "reset-top" })`
      (`database-view.ts:3460-3462`) and `duplicateView` at the same call
      (`database-view.ts:3941-3943`); no settings surface opens. `050` item 2's threshold, kept.
- [ ] **A manual drag reorder under an active sort asks before it commits.** **Today: no
      confirmation exists** in `board-renderer.ts` or `table-renderer.ts` (grep for
      sort-conflict handling returns nothing); the drop commits and the sort silently reorders it.
      `050` item 7's threshold, kept: confirm raised; decline is a no-op; accept clears the sort.
- [ ] **A view can carry per-view new-row presets, applied at creation, reachable from the New
      button's dropdown.** **Today: no preset can be stored** — `createEntry` already accepts a
      `defaults` record (`toolbar-renderer.ts:157-159`) but every caller passes `undefined`, and
      `ViewConfig` carries no preset map (`types.ts:415-432`); **and the New menu has no
      `Settings` section**. `050` item 10's threshold, kept; its **placement amended at T001**.
      `050` C7 ruled that no per-view default exists in the shipped product, having looked in the
      view-settings panel. It is one surface over: `anytype-menu-set-new-object-light.png` carries
      a `Settings` section with `Default Type for this View  Page ›` and `Template for this View
      Blank ›`. The narrowing to per-field values stands — we have no type or template system to
      default — but as a scope choice against a seen alternative, not as a gap.
- [ ] **An embedded view's toolbar collapses by measurement.** **Today: the embed's only chrome
      control is a boolean** — `shouldHideHeaderChrome()` reads three codeblock options and hides
      everything or nothing (`embedded-database-renderer.ts:2410-2416`); the tab strip's
      ResizeObserver overflow collapse (`toolbar-renderer.ts:895-917`) is the only measured
      behaviour, and it covers tabs only. `050` item 12's threshold, kept: no control overflows at
      any width in the sweep, collapse driven by measured natural width, read once per resize.
- [ ] **`npm run gate` exits 0 with one permanent lane row per criterion, each observed red before
      green**, and `npm run replay` holds with reversed 0. `050` item thresholds ride the same
      lane rows.
- [ ] **The operator reads the rebuilt toolbar on device** and names it the improvement they asked
      for. Only the operator closes this row; nothing in this repository can.
- [x] **A gear icon opens the database Settings surface (`051`'s side sheet), in the toolbar rail,
      before the `···` overflow button.** **Added 2026-09-06** from the operator's ruling
      (`goal.md` §4 amendment below). **Observed red first**: no such button existed — a query for
      `.db-toolbar-settings-btn` returned nothing and the collapse sweep's new
      `settingsButtonVisible` reading was **false at every width** in its 250-900px sweep, with
      Settings reachable only through `renderUtilitiesOverflowButton`'s `···` menu, one level deep.
      **Green the same day**: `renderSettingsButton` draws it before `···` in
      `db-toolbar-utilities-cluster` (measured on the shipped toolbar at x 832 against `···` at
      864 on desktop, 144 against 176 on a phone body), the `···` row and its `toolbar.viewSettings`
      key are deleted in all three locales, and the sweep now fails if the control is missing at any
      width. ADR-006 Accepted.
- [x] **The table footer hides at zero rows, and is 44px otherwise.** **Added 2026-09-06, from an
      operator ruling on the phone empty-state read. Observed red first** — the footer rendered
      unconditionally regardless of row count, drawing **173** `+ Calculate` triggers at **26px** on
      an empty phone table, under the 44px touch floor. **Green on main the same day**
      (`81f7637c`, `a45afe17`, `0814accd`, `2588095b`): the guard is `table-renderer.ts`'s own
      private `renderFooter` (`:801-804`), not `table-footer-renderer.ts`, and the floor is
      `.is-phone .note-database-container .db-table-footer-trigger { min-height: 44px }`
      (`styles.css:8553-8555`). ADR-005 Accepted.
- [ ] **With wrap off, no column makes a table row taller than the row rhythm.** **Added
      2026-09-06** from the operator's ~10:25 desktop report on 0.0.29 (`../roadmap.md` §4 row 60).
      **Today: red on the operator's own screen** — with the view's Wrap text switch off and no
      column override set, the long-text Journal column still lays out over **6** lines while every
      other column in the same row clips to one, so the row stands about six times the rhythm. The
      wrap toggle this packet shipped (row 53, ADR-004) is therefore not the whole control: it
      writes `db-cell-wrap` on and off correctly, and something inside a long-text cell escapes the
      `white-space: nowrap` / `overflow: hidden` / `text-overflow: ellipsis` the base `td` rule
      carries (`styles.css:5723-5731`), taking the row with it because a `td`'s `height` is a
      minimum (`styles.css:5466-5471`). **The producer is not yet named** — that is the fix leg's
      first job, not a claim made here. Done is a measured read of a table with wrap off in which
      every row's height equals `--db-row-height` for its density, with the long-text column
      ellipsised, and a negative control that goes red when the clip is removed. Leg
      `worktrees/160-fix-053-wrap-off-rows`.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened from the operator's componentization instruction | Done | Operator 2026-09-05, verbatim in the packet brief |
| Level chosen | Done | `recommend-level.sh --loc 1200 --files 13` → Level 2, 49/100, confidence 80%; raised to **Level 3** on judgment (six independent `050` item thresholds, a capture-read gate, two viewports, an eight-file deduplication). Phase score **10/50** against a threshold of 25, so a standard child rather than a phase parent |
| Source inventory of the eight toolbar-family renderers | Done | `toolbar-surface-inventory.md`, every row cited `file:line` from the current tree |
| The `050` corrections recorded | Done | This file §2, both measured, thresholds kept |
| **Capture read (T001, goal D1's gate)** | **Done, 2026-09-05** | `design-trueup.md` — the pixels of the 120-file catalogue, the 600-file menu sweep and the 118-file iOS set, measured per-pixel. `toolbar-surface-inventory.md` §8.1 carries the per-row record, **24 of 24**; §8.2 the eight contradictions resolved. **AC-112 Met.** Six rows stay *design inferred from source, not seen* (T5, T6, T9, T18, T20, T22), three of them uncapturable in principle |
| Primitive legs | Pending | T003-T010, one leg per file group |
| Lane rows, red first | Pending | T011-T012 |
| Device pass | Pending | T013, operator-owned, stays unticked |

### Deviations and findings

| Item | Note |
|------|------|
| **Landed in-runtime 2026-09-05** | Reviewed against the parent's D1-D14, `050`'s `design-trueup.md` and the current tree, then copied from `worktrees/082-phase-toolbar-view-controls` into `worktrees/086-land-phases-051-055`. **Corrected:** the dual-mode adoption in D7, completion criterion 2, `spec.md` §5 B1 / REQ-102 / the risk row, AC-102, C2, and inventory rows T1, T2, T11, T12, T14, T19 and T24 — seven inventory rows against seven capture contradictions, logged in `toolbar-surface-inventory.md` §6. D8 was added to record the one-owner split against the sibling phases. **Spot-checked and confirmed exact** at HEAD: all seven dead-method line numbers (`:512`, `:519`, `:551`, `:1594`, `:2239`, `:2252`, `:2290`), `renderFilterButton :2203`, `renderSortButton :2221`, `renderColumnButton :2273`, `showViewTabMenu :1229`, `renderViewTabs :840`, `showAllViewsHub :1087`, `showAddViewMenu :1360`, `setBadge :2575`. **One drift fixed**: the chip rail's auto-hide is at `active-view-controls-renderer.ts:97`, not `:99`. This packet's citations were the most accurate of the four external drafts. |
| The create script misparsed in this worktree | `create.sh --phase --parent specs/005-component-surface-system 053-toolbar-and-view-controls` produced three generic-slugged folders (`051-phase-51-PROVIDE-DESCRIPTIVE-SLUG` through `053-...`) and edited the parent `spec.md`. All residue was deleted and the parent spec restored; the packet was built by copying `050`'s structure instead, per the packet rules' fallback. Recorded so the next phase author does not trust the script's arg parsing here. |
| ~~This session could not look at the captures~~ **Closed 2026-09-05 by T001** | The drafting runtime reported "Current model does not support images", so D1 made capture-reading the implementer's gate rather than the author's claim. **T001 has now done it** — `design-trueup.md`, with per-pixel measurement rather than description. The gate held and it earned its keep: the read overturned two of `050`'s seven contradictions, corrected one of its adopted values, closed three `no capture` rows and disproved one clause in this file's own completion criteria. Every design row that once cited the README's written index now cites a file and a measurement. |
| **What the read cost the packet, honestly** | Three of the four changes ADR-001 scoped for the chip rail are struck on evidence (dual-mode triggers at landing; the band move and the direction colour at T001), one risk row retires, and two of `spec.md` §11's three open questions close. The packet got smaller and better-evidenced in the same pass — which is the outcome a capture gate exists to produce, and the reason D1 was worth carrying through three sessions that could not satisfy it. |
| `050`'s item 1 and item 4 Today cells were written against a tree that no longer matches | Both corrections are in §2. The thresholds are `050`'s and are kept; only the red values are re-measured. This is the same honesty the parent demands for every "Today" cell: written from the tree, not from the prior document. |
| Seven dead button methods are scope, not cleanup | `renderViewConfigButton`, `renderChartOptionsButton`, `renderCalendarTimelineOptionsButton`, `renderComputedSyncButton`, `renderDatabaseRefreshButton`, `renderExportButton` and `renderWidthSelect` have zero `this.` call sites at HEAD. Deleting them is part of the settings-entry primitive (D3), because their continued existence is what makes "one settings entry" unreadable. Their CSS hooks are still queried as anchor fallbacks (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`) — the primitive keeps the classes, removes the dead methods. |
| **T007/T008 closed 2026-09-05 (this session)** | AC-103, AC-105 and AC-107 were the three rows the prior landing left honestly Unmet for lacking a live-driven or timed proof, not for a missing implementation — `confirmSortConflict` and `openViewSettingsAfterMutation` already shipped. This session added the missing proofs: a `performance.now()` reading on a constructed `DatabaseView` mount for AC-103 (create 4.7ms, duplicate 0.8ms); live decline/accept branches with the confirm resolved async on both renderers for AC-105, on the local-extension board layout rather than the Project Manager 1:1 reference kanban; and, for AC-107, the missing tab-row-to-dropdown rung itself (`collapseTabStripToDropdown`) plus a 250px-900px headless-Chrome sweep reading zero overflow throughout. Zero production edits to `board-renderer.ts` or `table-renderer.ts`; the only shipped-behaviour change is the new collapse rung in `toolbar-renderer.ts`. Each proof carries a negative control, run and reverted. |

### 2026-09-06 amendment: the gear button, the table footer ruling, and the wrap toggle confirmed shipped

**Row 53, the wrap toggle, is confirmed shipped and this is where it is recorded against this
packet's own criteria** (`roadmap.md` §4 row 53 carries the operator-facing account). Commits:
`d647e5cd` (a tri-state wrap resolution in the data layer), `793d3b95` (the per-column wrap override
in the column menu), `3e22afdb` (the per-view Wrap text table-settings switch), `f17d4c12` (i18n
strings, all three locales), `edfb2927` (red-first live proof against the row floor), `865ef04c`
(the decision record and the roadmap ship), `bfef2989` (persistence/precedence unit tests, red
first), `a36d9332` (a stale-doc correction plus the wrap verification write-up), and `a7db5035` (the
post-rebase gate rebuild that re-derived the evidence artefacts this row's own proof cites — not a
behaviour commit itself, corrected here after this amendment's first pass named it as one). ADR-004
(`decision-record.md`) records the resolution rule: `col.wrap ?? config.wrapText`, a column's own
choice always wins. **Status stays "Shipped, awaiting device read"** — not operator-confirmed.

**Gear button.** Operator, ~08:15: *"btw this dropdown on desktop is horrible … should probably
become a sheet, on desktop at least, and get dedicated button."* `051`'s amendment owns the side-sheet
shape; this packet owns the second half — a gear icon in the toolbar rail, placed in the
`db-toolbar-utilities-cluster` **before** `renderUtilitiesOverflowButton`'s `···` trigger
(`toolbar-renderer.ts:412`), so Settings is a first-class rail button rather than one level deep in
the overflow menu. It calls the same `createSettingsEntry` primitive (D3) the `···` button already
uses, and opens `051`'s new `side sheet` role rather than the current `PANEL_POPOVER` anchored
dropdown.

**Table footer ruling.** Operator, ~08:10: *"Hide the footer at zero rows, 44px otherwise."*
Answers the batch question this program recorded the same night — an empty phone table draws its
`+ Calculate` triggers at 26px, under the 44px touch floor, 173 instances observed. It was new work,
not a resize of an existing rule, and it **landed on main the same day** — the zero-row guard went
into `table-renderer.ts`'s own private `renderFooter` rather than into `table-footer-renderer.ts` as
this paragraph first predicted, because that is the wrapper holding the row list. ADR-005 records
it.

**Owner:** both are this packet's — the gear button is a toolbar-rail addition consuming `051`'s
side-sheet role, and the footer rule is this packet's own `TableFooterRenderer`. Recorded in
`roadmap.md` §4 (new rows) and §6A.

### 2026-09-06 amendment: wrap off still draws huge rows

**Operator, ~10:25, desktop, 0.0.29**, verbatim: *"with wrap disabled you still have these huge
table rows with too large height"*. The screenshot shows the Journal column — a long-text column —
laid out over six lines with the view's Wrap text switch off, while every other column in the same
row clips to a single line.

**This does not withdraw row 53's landing.** The switch works: `renderCell` adds `db-cell-wrap`
only when `col.wrap ?? viewWrapDefault` is truthy (`cell-renderer.ts:206-208`), and
`cell-renderer-wrap.test.ts` pins the resolution rule ADR-004 records. What the report shows is a
**second** path to a tall row that the toggle never governed — the same class of defect the
2026-09-05 `flex-wrap` finding already named for option chips, where the cause was never the cell
being looked at. There the producer was four flex containers opting back out of the row's clip;
here it is a long-text cell, and which element escapes is **UNKNOWN until the leg measures it**.
Writing a guess into the criterion would be the mistake that finding was written to prevent.

**Scope.** This packet owns the wrap control and its default, so it owns the report. `052` owns the
cell editor and is cited rather than co-assigned: if the escape turns out to be an editor-owned
element, ownership moves and this amendment says so. `005-content-row-rhythm` holds the row-height
contract both must satisfy. Recorded in `../roadmap.md` §4 row 60.
### 2026-09-06 amendment: a reserved Notion-refinement child, `064-notion-toolbar-refinement`

The operator, ~16:10, verbatim: *"Based on notion screenshots add phases to all ui improvement phases
to further refine based on notion ui screenshots. But do 5 iters of deep research with glm 5.3 flash
max on those screens per relevant phase."* This packet's surface is **the toolbar and view controls**, and its reserved
child is **`064-notion-toolbar-refinement`** — reserved, not created. **Wave 2: queued behind wave 1.** This packet is also a co-owner of `062-notion-table-refinement` — the table view has no packet of its own, and the toolbar, the wrap switch and the column menu it is made of are held here and in `052`. `062`'s wave-1 research is running in `worktrees/177`; if it finds enough to justify a table packet, opening one is the synthesis's recommendation and the operator's call. The pipeline is three stages and the first exists for one reason: a **Sonnet digest** of the relevant Notion captures is written to ``053-toolbar-and-view-controls/notion-screens-digest.md``, because **GLM 5.3 flash cannot read images** and a capture reaches the loop as measured prose or not at all. Then `/deep:research:auto`, **5 iterations**, `--stop-policy=max-iterations`, on **GLM 5.3 flash max** — `openrouter/z-ai/glm-5.3-flash` first and `llmgateway` (DevPass) as the fallback, on the operator's ~16:25 ruling *"use openrouter untill usage is 0 then devpass"*. Then an **Opus synthesis** opens the child; a fresh Opus verifier lands it (D4). **Do not create the child by hand** — a folder without the loop behind it claims evidence it does not have. **The refinement is additive.** The child may add a criterion, a task, an ADR or a measurement. It may not un-tick a measured row here, rewrite a landed ruling, or change this packet's parity target. Where a Notion finding contradicts a landed Anytype ruling, the child writes a **Proposed** ADR carrying both readings and stops; only the operator moves it to Accepted. Parent `goal.md` **D15** and `../roadmap.md` **§7.15** carry the rule, §5.A the reservation, §6A the instruction verbatim.

<!-- /ANCHOR:log -->
