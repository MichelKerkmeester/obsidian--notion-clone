---
title: "Task Breakdown: Toolbar and View Controls"
description: "T001 reads the captures and trues the designs; every implementation task carries the threshold it closes, the red-first proof for it, and the leg that owns its file."
trigger_phrases:
  - "task breakdown"
  - "053 tasks"
  - "toolbar tasks"
importance_tier: "high"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Task Breakdown: Toolbar and View Controls

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

Every implementation task carries three things: the **threshold** it closes on, the **red-first
proof** that threshold was seen failing, and the **capture** its design was read against (or the
named gap). A task missing any of the three is not ready to start. Operator/device rows are marked
and stay unticked — an agent never ticks them.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Gate

- [ ] **T001 — Read the Anytype capture set and record the true-up per surface.**
      Open every PNG named in `toolbar-surface-inventory.md` §3 and §4 (the
      `anytype-view-settings-panel`, `anytype-set-kanban-view`, `anytype-set-calendar-view`,
      `anytype-filter-property-picker`, `anytype-filter-tag-value-picker`,
      `anytype-page-with-inline-collection`, `anytype-object-more-menu`,
      `anytype-newobject-type-picker` captures), and record one sentence per row: what the design
      takes, what the capture showed that the written description missed. **Threshold**: 24 of 24
      migration rows carry a capture-read record or a named gap. **Red-first proof**: today 0 of
      24 carry one (this document is the claim, not the evidence). **Proof**: the record appended
      to `toolbar-surface-inventory.md` §6, one line per row, with the file names actually opened.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Primitives (L1)

- [ ] **T002 — [P] Measure the red numbers for every threshold in `acceptance-criteria.md` and
      write them into `checklist.md`.** Includes: chip-state combination count (0 of 4 assertable
      today), settings-landing delay (never), confirm existence (absent on both renderers), preset
      storage (none), embed overflow width (sweep to find it), close-run count (17), dual-class
      count (2 sites), dead-method count (7). **Threshold**: one failing figure per criterion.
      **Red-first proof**: the figures themselves. **Proof**: `checklist.md`'s Today column, every
      cell filled from the tree.
- [ ] **T003 — Build `src/views/toolbar-primitives.ts` with all five constructors and unit tests.**
      `createPopoverShell` (sibling-close sequence, anchor lease, role sizing), `createConditionRow`
      (property/operator/value with the row floors), `createControlClusterButton` (badge, state),
      `createSettingsEntry` (per-view-type resolution, fallback classes), `createTabStrip` (drag,
      measured overflow, roving tabindex). **Threshold**: every constructor's unit test green, and
      no constructor imports from `toolbar-renderer.ts`. **Red-first proof**: the module does not
      exist. **Proof**: `npx vitest run` on the new test file, read from `$?`. **No capture** —
      this is internal structure; the surfaces it serves carry the capture obligation.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Toolbar row shells (L2)

- [ ] **T004 — Migrate the view-tab strip, its context menu, add-view, hub, title actions,
      utilities, group-by and export onto the primitives; delete the seven dead methods and the
      repeated close runs.** (src/views/toolbar-renderer.ts) **Threshold**: close-run grep count 17
      → 0 outside the shell; dead-method count 7 → 0; `db-view-tab-popover-row db-menu-item`
      dual class 2 sites → 0; dismissal order preserved (database → group → view-tab → export →
      title). **Red-first proof**: T002's counts. **Capture**: `anytype-view-settings-panel-dark.png`
      (context menu rows), `anytype-object-more-menu-dark.png` (utilities sections). **Proof**:
      lane row asserting the close sequence on the view-tab menu + the three grep counts + a
      negative control that re-adds one close run and reddens.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase 4: Clusters and chips (L3) — `050` item 1

- [ ] **T005 — Make the filter and sort triggers dual-mode and move the chip rail into the toolbar
      band with a direction-coloured leading sort chip.** (src/views/toolbar-renderer.ts,
      src/views/active-view-controls-renderer.ts, styles.css) **Threshold** (`050` AC-001, kept):
      chip row present iff a rule is active; trigger icons report `add` vs `active`; all four
      filter × sort combinations assertable. **Red-first proof**: today both triggers open the
      panel unconditionally (`toolbar-renderer.ts:2211`, `:2229`) and the leading chip carries no
      direction colour. **Capture**: `anytype-set-kanban-view-dark.png`,
      `anytype-set-calendar-view-dark.png`. **Proof**: lane row on the four combinations +
      negative control forcing the icon state constant, require red; header-height before/after
      measurement.
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## Phase 5: Rule panels and conflict confirm (L4) — `050` item 7

- [ ] **T006 — [P] Bind filter and sort condition rows onto `createConditionRow`.**
      (src/views/filter-panel-renderer.ts, src/views/sort-panel-renderer.ts) **Threshold**: one
      row implementation, both panels; the `condition panel` row floors hold at 552px (property
      140, operator 140, value 120-140, zero overflow). **Red-first proof**: T002's two-vocabulary
      count. **Capture**: `anytype-filter-property-picker-dark.png`,
      `anytype-filter-tag-value-picker-dark.png`. **Proof**: lane row measuring the row floors on
      both panels + unit test that the operator list per column type matches
      `getFilterOperatorsForColumn`.
- [ ] **T007 — Raise the sort-conflict confirm on manual drag reorder under an active sort, on
      board and table.** (src/views/board-renderer.ts, src/views/table-renderer.ts,
      src/views/database-view.ts) **Threshold** (`050` AC-007, kept): confirm raised; decline
      leaves order and sort unchanged; accept clears the sort and commits. **Red-first proof**:
      today the drop commits and the sort silently reorders it — no confirm on either renderer.
      **No capture — gap named** (`toolbar-surface-inventory.md` T18): designed from `047` §8.
      **Proof**: lane rows on both renderers, both branches + the board reference `pixelHash`
      unchanged (parent goal D5) + negative control that removes the confirm and reddens.
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## Phase 6: Settings, presets, embed collapse (L5) — `050` items 2, 10, 12

- [ ] **T008 — Land in view settings within 100ms of creating or duplicating a view, and collapse
      the embedded toolbar by measurement.** (src/views/database-view.ts,
      src/views/embedded-database-renderer.ts) **Thresholds** (`050` AC-002 and AC-012, kept):
      settings open ≤100ms after the create/duplicate callback; the embed sweep from 250px upward
      finds zero overflowing controls, measurement once per resize. **Red-first proof**: today
      nothing opens (`database-view.ts:3460-3462`, `:3941-3943`) and the sweep's first overflow
      width is recorded in T002. **Capture**: `anytype-view-settings-panel-dark.png` (landing),
      `anytype-page-with-inline-collection-dark.png` (collapse). **Proof**: lane timing assertion
      + the sweep lane + negative control that reverts to the boolean hide and reddens the sweep.
- [ ] **T009 — Add per-view new-row presets: settings section, config field, creation read.**
      (src/data/types.ts, src/views/view-config-panel-renderer.ts,
      src/views/toolbar-renderer.ts) **Threshold** (`050` AC-010, kept): every preset value
      applied at creation; a view with no presets produces creation calls byte-identical to
      today's. **Red-first proof**: today no preset can be stored (`types.ts:415-432` carries no
      map; `createEntry`'s `defaults` is never passed a value). **No capture — gap named**: the
      adopted slice is deliberately template-lite (`050` goal D6). **Proof**: unit test on the
      creation path + byte-comparison of the no-preset case against a pre-change baseline +
      negative control that applies presets to a preset-less view and reddens.
- [ ] **T010 — [P] Delete the dual classes, verify the anchor fallbacks, and re-derive the graph
      metadata.** (styles.css, src/views/*) **Threshold**: `db-view-tab-popover-row` dual class
      count 0; `db-view-config-btn`/`db-chart-options-toolbar-btn`/`db-calendar-timeline-options-toolbar-btn`
      still resolve as query targets on the live trigger. **Red-first proof**: T002's counts.
      **Proof**: grep counts + the two fallback query sites read + `npx tsc --noEmit`,
      `npm run build`, `npx vitest run`, all read from `$?`.
<!-- /ANCHOR:phase-6 -->

---

<!-- ANCHOR:phase-7 -->
## Phase 7: Verification

- [ ] **T011 — Register one permanent gate lane row per criterion, each observed red before
      green.** (tools/live/*) **Threshold**: `npm run gate` exits 0 read from `$?` with the rows
      green. **Red-first proof**: T002's figures. **Proof**: `npm run gate >/tmp/gate.log 2>&1;
      echo $?` → 0, and `npm run replay` holds with reversed 0.
- [ ] **T012 — Recapture the surfaces this phase changed and read every changed PNG.**
      (tools/screenshots/scenarios/*.mjs, screenshots/) **Threshold**: every new or changed
      surface registered in the same change (`screenshot-currency.md` §2), scenario `sources`
      lists accurate. **Red-first proof**: `npm run screenshots:verify` reddens on the changed
      sources before the recapture. **Proof**: `npm run screenshots:verify` exits 0, changed PNGs
      opened and read, stand-in gaps checked before filing defects. **Operator/device row — not
      tickable by an agent: the harness is not the device.**
- [ ] **T013 — Operator device pass.** The operator opens the rebuilt toolbar on iOS and desktop
      and reads it as the improvement asked for. **Operator/device row — stays unticked until the
      operator says so; nothing in this repository can close it.**
<!-- /ANCHOR:phase-7 -->
