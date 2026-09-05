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
    last_updated_at: "2026-09-05T12:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the packet from the source inventory of the eight toolbar-family renderers"
    next_safe_action: "Execute T002, the red-first threshold measurements, then the primitive legs in plan order"
    blockers:
      - "The implementing agent must open every Anytype capture named in toolbar-surface-inventory.md before writing the surface it designs"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/views/active-view-controls-renderer.ts"
      - "src/views/filter-panel-renderer.ts"
      - "src/views/sort-panel-renderer.ts"
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/toolbar-surface-inventory.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-053-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the direction-coloured sort chip keep the Project Manager board reference pixelHash-identical, given the chip rail sits inside .db-header?"
    answered_questions:
      - "050's Today cells for items 1 and 4 were corrected against the current tree: a chip rail and a duplicate-view action already exist; the thresholds are kept, the states are re-measured"
      - "Seven settings-button methods in toolbar-renderer.ts have zero call sites; the live settings entry is the utilities row"
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
| D1 | **Every design is read against a capture before the surface is written.** The implementing agent opens each PNG named in `toolbar-surface-inventory.md` §3 and §4 before touching the surface that row designs. Where no capture exists — the per-view preset control, the measured collapse, the sort-conflict moment — the design is built from `047`'s code-derived findings **with the gap named in the task**, never guessed. (This session's runtime could not render images; the capture-open obligation therefore transfers verbatim to the implementer, and T001 asserts it was done.) |
| D2 | **Red first, per criterion, on a threshold.** Every criterion carries one number or boolean stated in `acceptance-criteria.md`, observed failing on the current tree before the work is written, with the failing figure recorded in `checklist.md`. |
| D3 | **The composed primitives replace, not accompany.** A surface that migrates onto a primitive stops carrying its own vocabulary. The `db-view-tab-popover-row db-menu-item` dual-classing (`toolbar-renderer.ts:1249`, `:1341`) and the per-surface close runs are deleted at their surface's migration, not left beside the primitive that replaced them. |
| D4 | **What stays ours stays.** The table view, formulas/rollups/calculations (no Anytype equivalent — `screenshots/anytype/README.md` mapping), the Project Manager 1:1 board and gantt parity (`037`/`038`), the bottom sheets' ownership (`044`/`048` grammar, `003` portal), and the utilities overflow's own action set are not redesigned here. |
| D5 | **`044`'s sheet grammar and `048`'s stacking model are constraints.** Every toolbar surface that presents as a phone sheet carries the seven grammar elements, and every surface that can open over another obeys the stacking model. Both are consumed unchanged. |
| D6 | **One leg touches one file.** Legs are grouped by file (`plan.md` §4); `styles.css` is the exception and is serialized by the parent's CSS lane. |
| D7 | **This phase implements `050` items 1, 2, 4, 7, 10 and 12**, at the thresholds `050`'s `design-trueup.md` **restated** — not the ones its first draft carried. Item 1 is now the `N applied` count label and the trigger's state reporting, **not** dual-mode icons (rejected: the captures show one icon state, and the colour-only signalling Anytype does carry fails WCAG 1.4.11 where our count badge already carries a text signal). Item 2 keeps the 100ms landing budget as ours. Item 4's duplicate and remove go in the **view-settings panel**, matching the capture; the tab context menu was never photographed and stays *design inferred from source code, not seen*. Item 7 is **confirm, not disable**, reusing `isExplicitlySorted(config)`. Item 10 narrows to **per-field default values for a new row**, since the shipped panel has no default-template row at all. Item 12's end state is captured and its *mechanism* is not, so the threshold asserts the end state. Items 3, 5, 6, 8, 9, 11, 13, 14 stay `050`'s. |
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
      **What is adopted:** the `N applied` count label in the view-settings panel's value column —
      the one thing the captures do that we do not, one string per row, put where someone
      configuring the view will read it. **Today: 0 settings rows carry it**, and the sort chip
      carries an arrow icon and an order number but no direction colour
      (`active-view-controls-renderer.ts:122-135`).
- [ ] **Creating or duplicating a view lands in that view's settings within 100ms.** **Today:
      neither does** — `addView` ends at `refresh({ viewport: "reset-top" })`
      (`database-view.ts:3460-3462`) and `duplicateView` at the same call
      (`database-view.ts:3941-3943`); no settings surface opens. `050` item 2's threshold, kept.
- [ ] **A manual drag reorder under an active sort asks before it commits.** **Today: no
      confirmation exists** in `board-renderer.ts` or `table-renderer.ts` (grep for
      sort-conflict handling returns nothing); the drop commits and the sort silently reorders it.
      `050` item 7's threshold, kept: confirm raised; decline is a no-op; accept clears the sort.
- [ ] **A view can carry per-view new-row presets, applied at creation.** **Today: no preset can
      be stored** — `createEntry` already accepts a `defaults` record
      (`toolbar-renderer.ts:157-159`) but every caller passes `undefined`, and `ViewConfig`
      carries no preset map (`types.ts:415-432`). `050` item 10's threshold, kept.
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
| Primitive legs | Pending | T003-T010, one leg per file group |
| Lane rows, red first | Pending | T011-T012 |
| Device pass | Pending | T013, operator-owned, stays unticked |

### Deviations and findings

| Item | Note |
|------|------|
| **Landed in-runtime 2026-09-05** | Reviewed against the parent's D1-D14, `050`'s `design-trueup.md` and the current tree, then copied from `worktrees/082-phase-toolbar-view-controls` into `worktrees/086-land-phases-051-055`. **Corrected:** the dual-mode adoption in D7, completion criterion 2, `spec.md` §5 B1 / REQ-102 / the risk row, AC-102, C2, and inventory rows T1, T2, T11, T12, T14, T19 and T24 — seven inventory rows against seven capture contradictions, logged in `toolbar-surface-inventory.md` §6. D8 was added to record the one-owner split against the sibling phases. **Spot-checked and confirmed exact** at HEAD: all seven dead-method line numbers (`:512`, `:519`, `:551`, `:1594`, `:2239`, `:2252`, `:2290`), `renderFilterButton :2203`, `renderSortButton :2221`, `renderColumnButton :2273`, `showViewTabMenu :1229`, `renderViewTabs :840`, `showAllViewsHub :1087`, `showAddViewMenu :1360`, `setBadge :2575`. **One drift fixed**: the chip rail's auto-hide is at `active-view-controls-renderer.ts:97`, not `:99`. This packet's citations were the most accurate of the four external drafts. |
| The create script misparsed in this worktree | `create.sh --phase --parent specs/005-component-surface-system 053-toolbar-and-view-controls` produced three generic-slugged folders (`051-phase-51-PROVIDE-DESCRIPTIVE-SLUG` through `053-...`) and edited the parent `spec.md`. All residue was deleted and the parent spec restored; the packet was built by copying `050`'s structure instead, per the packet rules' fallback. Recorded so the next phase author does not trust the script's arg parsing here. |
| This session could not look at the captures | The runtime reported "Current model does not support images" on `anytype-view-settings-panel-dark.png` and `anytype-set-kanban-view-dark.png`. D1 therefore makes capture-reading the implementer's gate (T001), not this author's claim. The design rows below cite the README's written descriptions and `047`'s findings, and say so. |
| `050`'s item 1 and item 4 Today cells were written against a tree that no longer matches | Both corrections are in §2. The thresholds are `050`'s and are kept; only the red values are re-measured. This is the same honesty the parent demands for every "Today" cell: written from the tree, not from the prior document. |
| Seven dead button methods are scope, not cleanup | `renderViewConfigButton`, `renderChartOptionsButton`, `renderCalendarTimelineOptionsButton`, `renderComputedSyncButton`, `renderDatabaseRefreshButton`, `renderExportButton` and `renderWidthSelect` have zero `this.` call sites at HEAD. Deleting them is part of the settings-entry primitive (D3), because their continued existence is what makes "one settings entry" unreadable. Their CSS hooks are still queried as anchor fallbacks (`database-view.ts:3129`, `embedded-database-renderer.ts:1921`) — the primitive keeps the classes, removes the dead methods. |
<!-- /ANCHOR:log -->
