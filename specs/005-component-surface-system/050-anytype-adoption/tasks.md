---
title: "Task Breakdown: Anytype Adoption"
description: "T001 has read the capture sweep and trued up all fourteen designs, releasing every blocked task; each carries one threshold in its restated form, the red-first proof for it, and the Anytype capture it was designed against or a named gap."
trigger_phrases:
  - "task breakdown"
  - "050 tasks"
  - "adoption tasks"
  - "capture true-up"
importance_tier: "high"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Task Breakdown: Anytype Adoption

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`

Every implementation task below carries three things: the **threshold** it closes on, the
**red-first proof** that threshold was seen failing, and the **capture** its design was trued
against. A task missing any of the three is not ready to start.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 [P0] **Read the Anytype capture sweep and true up every item's design against the real
      screens.** Done, 2026-09-05. `design-trueup.md` carries one section per item: the capture
      files it is designed against, what that screen actually shows measured in pixels, what our
      tree does today with a `file:line`, the values that change, and the phone disposition against
      `044` and `048`.
      **Evidence:** 151 capture files read across `screenshots/anytype/` plus our own under
      `screenshots/notion-clone/`; icon state scanned across all 120 catalogue captures against
      `tools/mock-data/anytype/views-report.json`; every geometry figure taken with a per-pixel scan
      rather than by eye.
      **Outcome:** the sweep closed REQ-001's gap and half of REQ-004's and REQ-008's; it left
      REQ-006's and REQ-007's open; it turned REQ-010's from unphotographed into absent from the
      product. **Five items have no capture at all — REQ-005, REQ-006, REQ-007, REQ-011, REQ-013 —
      and are marked *design inferred from source code, not seen*.** Seven of `047`'s claims are
      contradicted (ADR-003) and six thresholds are restated (ADR-004).
      **This task gated every other task in this packet and has released them** (goal D1)
      (`design-trueup.md`, `decision-record.md`)
- [ ] T002 [P0] Run each threshold in `acceptance-criteria.md` against the current tree and write
      the observed failing figure into `checklist.md`. A threshold that cannot be made to fail is
      not a threshold and is sent back to T001 (goal D2). **Measure the restated form**: six
      thresholds — AC-001, AC-005, AC-008, AC-009, AC-013, AC-014 — asserted a failing value the
      tree does not have and were rewritten at T001 to the residue that is actually absent
      (ADR-004). Measuring the original wording will produce a red that no code change caused
      (`checklist.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

Ordered by leg, and legs ordered by their best fit rank. A leg opens its files once (goal D7).

### L1 — toolbar, filter and sort panels, sheet grammar, styles.css

- [ ] T003 [P0] **REQ-001 — the chip row and dual-mode trigger icons.** One row: leading
      direction-coloured sort chip, then filter chips, then add and clear-all; the row auto-hides
      when both are empty. The toolbar's filter and sort icons toggle the chips when chips exist and
      open the add-relation menu when none do.
      **Trued up at T001 — the premise was false.** The chip row ships
      (`active-view-controls-renderer.ts`, auto-hiding at `:93`, constructed in `database-view.ts:396`
      and `embedded-database-renderer.ts:309`) and both trigger buttons carry a numeric count badge
      (`toolbar-renderer.ts:2204-2227` → `setBadge` at `:2575`; `styles.css:2361-2376`). Anytype's
      dual-mode icons are **not adopted**: across all 120 catalogue captures the filter funnel
      measures `ink=52, blue=0` and the sort glyph `ink=80, blue=60` whether the view carries a
      filter, a sort or neither. Colour-only state also fails WCAG 1.4.11; our badge carries a number.
      **Threshold (restated):** the chip row is present whenever a filter or a sort is active and
      absent when neither is; each trigger button carries a count badge that appears at 1 and
      disappears at 0; and the view-settings panel's Filter and Sort rows carry an `N applied` value.
      **Red first:** the first two are negative controls on shipped behaviour — remove the auto-hide
      and remove `setBadge`, require red. The third is genuinely absent and reads `0 of 2 rows`.
      **Capture:** all 120 catalogue captures for the icon state; `anytype-view-settings-panel-dark.png`
      for the `Sort   1 applied ›` row; `anytype-collection-fullpage-onboarding-dark.png` for toolbar
      anatomy. **No chip row appears on any capture.** See `design-trueup.md` REQ-001, C1, C2
      (`src/views/toolbar-renderer.ts`, `src/views/filter-panel-renderer.ts`,
      `src/views/sort-panel-renderer.ts`, `styles.css`)
- [ ] T004 [P0] **REQ-013 — per-format filter and sort condition rows on phone sheets.** One
      condition row shape per property format we support, rendered inside a sheet that carries
      `044`'s grammar.
      **Trued up at T001 — the premise was false and the red-first instruction unexecutable.** The
      rows ship on both viewports (`screenshots/notion-clone/panels/constructed-filter-panel-desktop-light.png`
      and `-mobile-light.png`: select → value dropdown, money → numeric input, date → no value
      control, each with a leading format icon), and `filter-panel` and `sort-panel` are already
      registered in `tools/live/sheet-grammar.mjs` along with six stacked pickers off the filter panel
      and two off the sort panel.
      **Threshold (restated):** the filter and sort sheets pass **all seven** `044` elements —
      surface, handle, header and padded rows are already visible in our own capture, so the residue
      is segmented choices, keyboard avoidance and safe-area inset — and each of the eight registered
      stacked pairs conforms to `048`'s model.
      **Red first:** assert the three unproven elements on the current tree and record how many of
      seven each sheet passes today.
      **Capture:** none — **design inferred from source code, not seen.** No filter or sort sheet
      appears in any of the 151 files; the 20 mobile images are official App Store and Google Play
      marketing creative, not installed-app captures, and none shows a filter surface. The nearest
      evidence is the per-format icon vocabulary in `anytype-filter-property-picker-dark.png`.
      See `design-trueup.md` REQ-013
      (`src/views/filter-panel-renderer.ts`, `src/views/sort-panel-renderer.ts`,
      `src/views/sheet-grammar.ts`)

### L2 — database-view, view-config-panel-renderer

- [ ] T005 [P0] **REQ-002 — land in view settings after a view is created or duplicated.**
      **Threshold:** the view-settings surface is open within **100ms** of the create or duplicate
      completing (Anytype's own figure is ~50ms; 100ms is our budget).
      **Red first:** measure the current tree, where nothing opens at all, and record "never" as the
      failing value.
      **Capture:** `anytype-view-settings-panel-dark.png` and `anytype-set-kanban-view-dark.png` —
      **the gap is closed.** Measured: 360 × 316px, 8px radius, 1px `#292929` border on `#171717`,
      16px horizontal padding, 28px rows, a 328 × 56px View name field, dividers before `Filter` and
      before `Duplicate view`, labels `#E1E1E1` and values `#A3A3A3`. A board's panel inserts one
      `Groups` row and nothing else moves. Settings sub-pages **replace in place with a `‹` back
      header**; pickers open as a separate anchored popover. 360px is the top of our own `panel`
      role, so no new role. Anytype's ~50ms remains source-derived and unphotographed; our 100ms
      budget is unchanged. See `design-trueup.md` REQ-002
      (`src/views/database-view.ts`, `src/views/view-config-panel-renderer.ts`)
- [ ] T006 [P1] **REQ-010 — per-view new-row default presets.** The adopted slice of templates
      and only that slice (ADR-002, goal D6).
      **Trued up at T001 — the slice narrows again.** A per-view **status** preset already ships
      (`view-config-panel-renderer.ts:259, :265, :403-407`) and a per-database template with a path
      and an engine choice ships at `:558-612`. The residue is per-**field** default values, and
      only that.
      **Threshold:** a row created in a view carrying field defaults has every default applied at
      creation; a view with none produces a new row byte-identical to today's.
      **Red first:** assert the applied values on the current tree, where no field default can be
      stored.
      **Capture:** **design inferred from source code, not seen** — and the absence is now proved
      rather than assumed: the captured settings panel, in both its Grid and its Kanban form, has no
      default-template and no default-value row, contradicting `047` §8 (`design-trueup.md` C7).
      `anytype-newpage-created-dark.png` shows a per-**type** chooser at creation
      (`This type has 2 templates ⌄`), not a per-view default. The one captured per-view default of
      any kind is `Page limit  60 ›` in the gallery layout block, which is where a new default row
      belongs
      (`src/views/view-config-panel-renderer.ts`)

### L3 — board-renderer, table-renderer, styles.css

- [ ] T007 [P0] **REQ-003 — sticky horizontal board scrollbar with edge bleed.**
      **Trued up at T001 — rescoped from the board to every horizontally scrolling view surface.**
      The grid carries the identical treatment at the identical geometry, so this is a dataview
      affordance, not a board one (`design-trueup.md` C3). This closes `spec.md` §12's open question.
      **Threshold:** while the content is taller than the viewport, the horizontal scrollbar of the
      board **and of the table** is positioned at the viewport bottom and visible without scrolling
      to the content's end — 10px tall, bottom edge 8px above the viewport's, track spanning the
      container's full content width with no gutter inset.
      **Red first:** measure the scrollbar's position against the viewport on a board and on a table
      taller than the viewport, where today neither exists — `board-renderer.ts` has no sticky rail
      and `styles.css` no board-scrollbar rule.
      **Capture:** `anytype-project-tracker-kanban-light.png` and `anytype-project-tracker-grid-light.png`
      — measured y 1199..1208 in a 1217px viewport on both, track x 668→2099, thumb `#B6B6B6` on an
      `#EBEBEB` track. Colours are ours from the theme's scrollbar tokens, not Anytype's fixed pair.
      "Edge bleed via negative margins" is a source claim; what is observable is a full-width track
      with no gutter.
      **Constraint:** goal D5 — recapture `screenshots/project-manager/` board reference and prove
      `pixelHash` unchanged before this task closes
      (`src/views/board-renderer.ts`, `styles.css`)
- [ ] T008 [P0] **REQ-007 — sort-conflict confirmation on manual drag reorder.**
      **Threshold:** a drag reorder while a sort is active raises a confirmation; declining leaves
      the order and the sort untouched; accepting clears the sort and commits the drop.
      **Red first:** drag under an active sort on the current tree and record that the drop is
      accepted and then silently undone by the sort.
      **Capture:** none — **design inferred from source code, not seen.** No drag, no confirmation
      and no sort panel with a condition open exists anywhere in the sweep; the filter panel was
      reached only in its empty state. `047` §5's board drag vocabulary stands in, as source.
      **Design note:** gate on the existing `isExplicitlySorted(config)` predicate, which
      `row-menu.ts:104` and `:110` already use to disable Insert above and Insert below under a sort.
      A second predicate answering the same question is the anti-pattern `design-system.md` §10 names.
      **Confirm, not disable:** a drag is a direct manipulation the user has already committed to, so
      refusing it silently reads as a broken drag, where a menu row can carry a disabled state
      legibly
      (`src/views/board-renderer.ts`, `src/views/table-renderer.ts`)
- [ ] T009 [P1] **REQ-011 — `positionLock` while a name is being typed in a sorted view.**
      **Threshold:** the edited row's index does not change while typing, and repositions exactly
      once on commit or blur.
      **Red first:** type into a sorted view on the current tree and record the row index changing
      mid-keystroke.
      **Capture:** none needed, **confirmed at T001** — this is behaviour over time and no still can
      show it, which closes the second of `spec.md` §12's open questions. `047` §8 names the mechanism
      and the release point, both source-derived: **design inferred from source code, not seen**
      (`src/views/table-renderer.ts`)

### L4 — active-view-controls-renderer

- [ ] T010 [P0] **REQ-004 — duplicate view, and a view-tab context menu.**
      **Trued up at T001 — the actions were captured, the tab menu was not.**
      **Threshold:** duplicating a **view** yields a config equal to the source on every field except
      `id` and the name suffix, with a new id, and `Duplicate view` / `Remove view` appear as the
      last section of the view-settings panel, below a divider, each a 28px row with a 16px leading
      icon.
      **Red first:** assert a per-view duplicate exists at all on the current tree, where it does
      not — `duplicateCurrentDatabase` (`database-view.ts:3633-3650`) duplicates a whole database,
      and `db-add-view-duplicate` (`toolbar-renderer.ts:1433`) seeds a new view from the current
      one's rules, which is adjacent and deliberately named for what it does.
      **Capture:** `anytype-view-settings-panel-dark.png` for the actions and their placement. **The
      view-tab right-click menu was not captured** in either phase — absence of a capture is not
      evidence of absence, so it stays *design inferred from source code, not seen* and is built only
      if the operator wants it. `047` §5's "view-selector dropdown + sortable tab row with right-click
      copy/remove" is contradicted: the captured switcher is a tab row and a trailing `+`
      (`design-trueup.md` C4).
      **Placement note:** a right-click has no phone equivalent, so the settings-panel row works on
      both viewports without a second interaction vocabulary
      (`src/views/active-view-controls-renderer.ts`)

### L5 — view-state-store

- [ ] T011 [P1] **REQ-005 — per-view scroll-position restore.** Off the critical path; may start
      before T001 completes, since no capture is expected.
      **Threshold:** leaving a view at a known offset and returning restores it within **±2px**, per
      view and independently per view.
      **Red first:** record the current tree returning to 0 on every switch.
      **Trued up at T001:** the restore machinery already exists. `database-viewport.ts` carries a
      snapshot with four request kinds (`:37`), capturing `container.scrollTop` (`:67`) and a row
      anchor, restoring raw (`:76`) or anchor-relative (`:84`), with a scroller-level pair at `:122`
      and `:131`. A view switch merely asks for `reset-top`. **Wire the existing snapshot into
      per-view state; do not build a second one** — two mechanisms for one decision is the
      anti-pattern `design-system.md` §10 names.
      **Capture:** none needed, **confirmed at T001** — behaviour, not appearance, which closes the
      second of `spec.md` §12's open questions
      (`src/views/view-state-store.ts`)

### L6 — popover-position and the cell editors

- [ ] T012 [P0] **REQ-006 — cell-editor anti-clip flip near the right edge.**
      **Threshold:** an editor whose anchor is within **92px** of the viewport's right edge renders
      right-aligned, and no open editor's right edge exceeds the viewport's.
      **Red first:** open an editor in the rightmost column on the current tree and record the
      clipped width.
      **Capture:** none — **design inferred from source code, not seen.** No open cell editor near a
      viewport edge exists in the sweep. The 92px figure is `047` §5's, read from `anytype-ts`, and is
      kept as the trigger boundary because a borrowed number beats an invented one — but the criterion
      that decides the item is the second one, *no open editor's right edge exceeds the viewport's*,
      which is measurable on our own renderer and does not depend on Anytype's constant being right.
      Adjacent evidence only: `anytype-filter-property-picker-dark.png` places a 256px child picker to
      the left of and overlapping its parent rather than clipping, so a horizontal placement rule
      exists; no boundary is readable from it.
      **Today:** `popover-position.ts` has a vertical flip (`:912`) and no horizontal right-edge
      branch; the string `92` does not appear in the file.
      **Phone:** an editor presents as a sheet, where "flip" has no meaning — the phone expression is
      `048`'s stacking model, joining the seven pickers already registered as stacked pairs
      (`src/views/popover-position.ts`, the cell editors)

### L7 — row-menu, bulk-edit-field-menu

- [ ] T013 [P0] **REQ-008 — capability-gated menus with a never-empty fallback and selection
      caps.**
      **Trued up at T001 — the premise is true for one file of the two, and the caps have no
      referent.**
      **Threshold (restated):** menu item count is **≥ 1** in every capability state for both files.
      `row-menu.ts` already guarantees it — its first row, `menu.openNote`, is unconditional — so that
      half is **asserted** with a negative control rather than built. `bulk-edit-field-menu.ts:31-45`
      maps `getBulkEditableColumns(...)` straight into `options` with no floor, so a column set with
      nothing bulk-editable opens an empty dropdown; that is the fallback to build.
      **Selection caps not adopted:** our row menu operates on a single row, so ">1 disables open and
      link" and ">10 disables open-in-new-tab" have no referent. Recorded beside `047`'s four explicit
      non-adoptions rather than left to be silently retried.
      **Red first:** drive an empty bulk-editable column set and record the empty dropdown. For
      `row-menu.ts`, remove the unconditional first row and require red.
      **Capture:** `anytype-object-more-menu-dark.png` — measured 256px wide, y 52..555, 28px rows,
      8px vertical padding, 16px leading icons, right-aligned shortcuts, submenu chevrons, and
      **five** sections separated by four dividers at y 96, 337, 438 and 511. `047` §9 says four
      (`design-trueup.md` C5). The "No available actions" fallback and any multi-selection were
      **not captured**
      (`src/views/row-menu.ts`, `src/views/bulk-edit-field-menu.ts`)

### L8 — empty-state-renderer

- [ ] T014 [P0] **REQ-009 — two empty-state flavours plus the deleted-relation state.**
      **Trued up at T001 — the premise was false by a wide margin.** `empty-state-renderer.ts:24-36`
      declares **twelve** reasons with a copy catalogue at `:143-203` and a diagnosis function at
      `:209-216`. `no-database` is the "target" flavour; `no-matching-data`, `filter-empty`,
      `search-empty` and `filter-and-search-empty` are four refinements of the "view" flavour.
      **Threshold (restated):** the twelve-to-two mapping is asserted so it cannot regress, and the
      **one state that does not exist** is built: a board whose group relation was deleted, rendering
      its own state pointing at view settings. `empty-group` means "this group has no rows", which is
      a different thing.
      **Red first:** delete a board's group relation on the current tree and record which of the
      twelve renders. For the twelve, collapse two flavours into one and require red.
      **Capture:** `anytype-inlinecollection-empty-dark.png` and `anytype-page-with-inline-collection-dark.png`
      — and they show **no empty-state block at all**: a header row at y 346 and a `+ New Object` row
      at y 384, nothing else. Anytype's "view" flavour *is* the add affordance, which contradicts
      `047` §9's "two flavours, each with a per-layout add affordance" (`design-trueup.md` C6). The
      "target" flavour and the deleted-relation state were not captured. **Anytype's empty-state
      design is not adopted — there is none, and ours is better**
      (`src/views/empty-state-renderer.ts`)

### L9 — embedded-database-renderer

- [ ] T015 [P1] **REQ-012 — measured toolbar "small" collapse for embedded views.**
      **Threshold:** the collapse is driven by measured natural width against available width, not a
      fixed breakpoint, and no toolbar control overflows its container at any width from **250px**
      upward.
      **Red first:** sweep the widths on the current tree and record the first overflow.
      **Capture:** `anytype-page-with-inline-collection-dark.png` and
      `anytype-inlinecollection-empty-dark.png` — **the collapsed end state is captured after all.**
      At ~680px inline content width the controls row renders the **view-tab row only**: no search,
      filter, sort or settings icon and no `New` button, against the full-page collection in the same
      window rendering all five. The phone rung is in `anytype-mobile-official-ios-06-lists.png`:
      `All ⌄` as a dropdown rather than tabs, the settings icon alone, and the split `New ⌄`.
      So the collapse drops whole controls in an order — icon cluster before `New`, tab row to a
      dropdown before either — rather than shrinking proportionally.
      **What is not captured:** any intermediate width, so nothing in the sweep distinguishes a
      measured collapse from a fixed breakpoint; `047` §5's "measures its own natural width" stays
      source-derived. The inline icons may also be hover-revealed rather than absent — hover was
      never captured. And the phone image is **official App Store / Google Play marketing creative,
      not an installed-app capture**, so no number is taken from it.
      **Today:** `embedded-database-renderer.ts` has **no** `ResizeObserver`. The only one in
      `src/views` is `chart-renderer.ts:876`, which resolves the constructor off the owner window
      (`:98`) because a portalled surface may live in another document — that is the pattern to copy
      (`src/views/embedded-database-renderer.ts`)
- [ ] T016 [P2] **REQ-014 — inline "Load more" row instead of virtualization for embedded
      views.**
      **Trued up at T001 — the premise was false in the other direction: there is no virtualization
      to avoid.** No `virtualis*` match exists anywhere in `src/views`; the only one in `src` is
      `data/calendar-timeline-model.ts`, the timeline's own model.
      **Threshold (restated):** an embedded view honours a per-view page limit — **60 rows, Anytype's
      own captured default** — and renders an inline "Load more" row past it. The "never enters
      virtualization" clause becomes a regression guard rather than today's red.
      **Red first:** load an embedded view with more than 60 rows and record that all of them render
      with no page limit and no "Load more" row.
      **Capture:** `anytype-set-gallery-view-dark.png` for `Page limit  60 ›`, the last row of the
      layout settings block and the only per-view default value in the product that the sweep
      photographed. Row heights confirmed on screen: **48px full-page** (baselines 322 → 370 → 418 in
      `anytype-collection-grid-populated-dark.png`) against **≈40px inline** (header 346 →
      `+ New Object` 384), matching `047` §5's source-derived split. **A "Load more" row itself was
      not captured** — every collection in the sweep holds fewer rows than the page limit
      (`src/views/embedded-database-renderer.ts`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T017 [P0] One permanent lane row per item under `tools/live/`, each with its negative control
      observed **red** before green, and every other row staying green while it is red
- [ ] T018 [P0] `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0, status read from `$?` and never
      through a pipe; `npm run replay` holds with reversed 0
- [ ] T019 [P0] Recapture the `screenshots/project-manager/` board and gantt references and prove
      `pixelHash` unchanged against the pre-phase baseline, or take the difference to the operator
      (goal D5)
- [ ] T020 [P0] **The operator opens the board and a table on iOS and on desktop and reads the
      adopted surfaces.** Not tickable by an agent (goal D8)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`, or deferred with a recorded reason
- [ ] No `[B]` blocked tasks remaining — T001 has released them
- [ ] Every row in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`, and each waiver names
      an ADR that exists in this packet
- [ ] Every `checklist.md` criterion carries both its failing figure and its passing one
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Checklist**: See `checklist.md`
- **Goal**: See `goal.md`
- **Research source**: `../047-competitor-references-and-pm-alignment/research/research.md` §11
- **Capture index**: `../../../screenshots/anytype/README.md`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

Exit statuses are read from `$?`, never through a pipe. A criterion closes on a number that was
read, never on a command that was merely run.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] VER-001 [P0] T001 is complete and `design-trueup.md` carries a section for all fourteen items,
      with the five that have no capture named: REQ-005, REQ-006, REQ-007, REQ-011, REQ-013
- [ ] VER-002 [P0] Every threshold has been observed failing and its figure is in `checklist.md`
- [x] VER-003 [P0] The level is derived, not guessed — `recommend-level.sh --loc 1500 --files 16` →
      51/100, confidence 90%, Level 2, raised to Level 3 on judgment; phase score 20/50 against a
      threshold of 25, so a standard child
- [x] VER-004 [P0] What may not change is recorded: `044`'s grammar, `048`'s stacking model, `003`'s
      portal, and `038`/`037`'s reference parity (`spec.md` §3 Out of Scope, `goal.md` D4 and D5)
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] VER-010 [P0] Each leg is one commit touching one file group; no leg opens a file another leg
      owns, `styles.css` excepted and serialized by the parent's CSS lane
- [ ] VER-011 [P0] No item introduces a new architecture layer — every one lands in an existing
      renderer or store, as `047` verified before ranking them
- [ ] VER-012 [P1] The chip surface has one owner (`toolbar-renderer.ts`) rather than two panels
      writing competing rows (ADR-001)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] VER-020 [P0] Every item's threshold was observed red on the current tree before the item was
      written
- [ ] VER-021 [P0] Every item's negative control was observed red after it was green
- [ ] VER-022 [P1] Unit coverage for the pure behavior: duplicate-config equality, scroll-offset
      arithmetic, the capability predicate
- [ ] VER-023 [P1] Both viewports exercised per item, or the absence of a phone expression recorded
      with its reason (goal D3)
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] VER-030 [P0] All fourteen items are addressed — implemented, waived by an ADR, or deferred
      with the operator's agreement. Fourteen is the whole list `047` produced and a partial landing
      is a partial phase
- [x] VER-031 [P0] The items with no reference screen carry their gap in `design-trueup.md` rather
      than an invented design. **Five, not six**: REQ-005, REQ-006, REQ-007, REQ-011, REQ-013, each
      marked *design inferred from source code, not seen*. Two of the five (REQ-005, REQ-011) need no
      screen at all, confirmed at T001
- [ ] VER-032 [P1] The four non-adoptions stayed non-adopted (goal D6)
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] VER-040 [P0] No item adds a network call, a credential, or a read outside the vault
- [ ] VER-041 [P1] The per-view preset map stores no user content beyond the field defaults the
      operator typed into it
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] VER-050 [P1] `design-trueup.md` is complete and readable on its own
- [ ] VER-051 [P1] The changelog entry names the adopted slice of templates and says the rest was
      deliberately not built (ADR-002)
- [ ] VER-052 [P1] The parent's `roadmap.md` §5.A row and `goal.md` DONE table reflect this phase's
      state at close
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] VER-060 [P1] Every file changed appears in `spec.md` §3 Files to Change, and nothing outside it
      was touched
- [ ] VER-061 [P1] `design-trueup.md` lives in this packet, not in `047`, whose captures it reads
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 19 | 4/19 |
| P1 Items | 15 | 0/15 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-05 (T001 read, four P0 rows closed)
<!-- /ANCHOR:summary -->
