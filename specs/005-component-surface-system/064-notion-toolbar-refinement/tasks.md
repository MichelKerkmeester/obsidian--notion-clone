---
title: "Tasks: Notion Toolbar Refinement"
description: "Ten legs: three that make the reds visible, six that close them, and three that verify — the three code legs that waited on Proposed ADRs were ruled 2026-09-07 (T004 rewritten as a two-branch read, T007 unblocked, T009 Declined and Waived), the lanes extended are the ones that already exist, and the device row is the operator's."
trigger_phrases:
  - "064 tasks"
  - "notion toolbar refinement tasks"
  - "delete confirm task"
  - "collapse rung task"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Notion Toolbar Refinement

<!-- SPECKIT_LEVEL: 2 -->

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

**TASK-VERIFY**: every leg names the command it runs and reads `$?` directly. A leg that closes a
red states the value it observed before and after, not the value it expected.

**TASK-SYNC**: a leg that moves a capture or a lane registers both in the same commit.

**Gates**: `goal.md` D6's three gates were ruled 2026-09-07 (Europe/Amsterdam). ADR-001 and ADR-005
are Accepted — REQ-004 and REQ-001 (as a two-branch read) may be built. ADR-007 is Declined —
REQ-006 closes Waived rather than being built. No task below carries `[B]` any longer.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 [P0] Write the two red-first probes and observe each RED. First, the collapse reading:
      extend `tools/live/toolbar-collapse-sweep.ts`'s 250-900px, 10px-step sweep so it also reports
      (a) the width at which the New button's text label — the span `toolbar-renderer.ts:2365`
      draws off-touch — reads absent, and (b) the first width at which any cluster in the `:2571`
      order is hidden, then run it via `node tools/live/run-toolbar-collapse-sweep.mjs` and read
      `$?`. Expected red on this tree at `80c2bb48`: the label is still drawn at the first
      cluster-hidden width, because `applyToolbarChromeCollapse` (`:2561`) hides whole clusters
      and never touches the label. Second, the confirm probe: a case block in
      `src/views/toolbar-renderer.test.ts` driving both `deleteView` call sites (`:1180`, `:1330`)
      with the confirm resolved via a real Promise, asserting the decline/accept idiom `053`'s
      AC-105 blocks established, plus the one-view case asserting the `database-view.ts:3447`
      early return precedes any confirm. Expected red: `grep -c "buildConfirmSheetBody"
      src/views/toolbar-renderer.ts` = **0**. **Negative controls:** a toolbar swept at a width
      where no cluster hides must leave the label reading present (so the reading is not vacuously
      green), and the confirm block's decline path must leave `actions.deleteView` uncalled.
      (`tools/live/toolbar-collapse-sweep.ts`, `src/views/toolbar-renderer.test.ts`)
      **Evidence.** Collapse reading: before the rung, `newLabelVisible` read `true` at every swept
      width including 250px, where `newClusterVisible` already read `false` — the label was never
      collapsed by anything, so it stayed visible past the point a whole cluster was already gone
      (observed via a direct run of `runToolbarCollapseSweep`, not by eye). After the rung: zero
      widths where a cluster reads hidden while the label reads visible; `node
      tools/live/run-toolbar-collapse-sweep.mjs` exit **0**. Confirm probe: ADR-005's read (T004)
      found Branch B applies, so no confirm was ever built and the probe target changed — the red
      this leg actually closes is `src/views/database-view.test.ts`'s new "DatabaseView deleteView"
      block, red before T004 (no `undo.deleteViewConfig`-labeled history entry existed for a
      deletion) and green after (9/9 assertions passing, `npx vitest run
      src/views/database-view.test.ts` exit **0**). `grep -c "buildConfirmSheetBody"
      src/views/toolbar-renderer.ts` is still **0** today — correctly, since Branch B builds no
      confirm.
- [x] T002 [P0] [P] Take the inventories this packet's legs will cite, and paste their output here:
      the confirm census (`grep -c "buildConfirmSheetBody" src/views/toolbar-renderer.ts` —
      **0**), the searchable census (`grep -c searchable src/views/filter-panel-renderer.ts
      src/views/sort-panel-renderer.ts` — **0** and **0**), the add-control census
      (`grep -rn "db-active-control-add" src/ styles.css` — **0**), the panel-toggles the chip
      rail will wire to (`toolbar-renderer.ts:157`, `:167`, consumed at `:2256`/`:2275`, implemented
      by the host at `embedded-database-renderer.ts:1661`/`:1696`), and the affected-capture census —
      which registered scenarios photograph the toolbar, the panels or the rail, so any capture
      whose picture moves is named before the leg that moves it, not after. A leg that changes
      markup without this list is guessing at its blast radius. (`specs/005-component-surface-system/064-notion-toolbar-refinement/tasks.md`)
      **Evidence.** Confirm census unchanged at **0** (Branch B builds none). Searchable census
      **0**/**0** before T006, **2**/**1** after (`grep -c "searchable: true," src/views/filter-panel-renderer.ts src/views/sort-panel-renderer.ts`).
      Add-control census **0** before T008, **1** definition site after
      (`grep -rn "db-active-control-add" src/ styles.css`). Panel-toggle wiring confirmed at
      `toolbar-renderer.ts:157`/`:167`, consumed at `:2256`/`:2275`; `database-view.ts`'s
      `renderActiveViewControls()` now also wires `addFilter`/`addSort` to the same
      `toggleHeaderPopover` the toolbar buttons use. Affected-capture census: zero registered
      scenarios exercise any of the new markup (`chrome.mjs`/`panels.mjs` construct their own
      static HTML, independent of the real renderers), so `npm run screenshots` followed by
      `npm run screenshots:verify` moved 17 PNGs at identical pixelHash/layoutHash (rerun jitter,
      restored to committed bytes) and zero at different content — recorded in `tools/lane/css-lane.json`'s release entry.
- [x] T003 [P0] Acquire the parent's serialized CSS lane hold before any `styles.css` edit, and
      record the acquire entry. The hold permits editing the file; it grants no scope beyond the
      rules T005, T007 and T008 name (parent D7 — the lane is the parent's, per `053` goal D6).
      (`tools/lane/css-lane.json`)
      **Evidence.** Acquired at `styles.css` hash `78a52c50b06b` (060's released baseline, nothing
      outstanding); edited to `906faaa13a08`; released with zero captures reviewed as content
      changes. `node tools/lane/check-lane.mjs` (with `SURFACE_PHASE=064-notion-toolbar-refinement`
      during the edit) exit **0** throughout.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 [P0] **The two-branch read ADR-005 requires, first.** Read the persistence layer for
      view deletion (`database-view.ts:3445-3456`) for whether a deleted view is recoverable by any
      existing undo path, and record the answer before either branch below is written.
      - **Branch A — unrecoverable.** Raise `051`'s confirm on both `deleteView` paths — the
        all-views hub row (`toolbar-renderer.ts:1180`) and the tab context menu (`:1330`) — through
        `buildConfirmSheetBody` (`confirm-sheet.ts:46`), as the `061`/`067` centred confirm card at
        one danger weight, with one-scope copy that names the view. Declining is a no-op; accepting
        deletes exactly once; the last-view case (`database-view.ts:3447`) raises no confirm
        because the early return precedes it. On a phone the confirm presents as a stacked bottom
        sheet per `048` D1, and the `sheet-grammar`/stacking lanes stay green.
      - **Branch B — an existing undo path covers it.** No confirm is raised on either path; an
        Undo toast presents instead, the same interaction-layer shape the operator ruled for row
        deletion in `051` ADR-007's E4 (2026-09-06, verbatim *"No confirm for single delete, Undo
        toast"*, implemented at `f962d626` via `canUndoDeletion(app, file)`) — adapted to a view
        rather than a file. `db.views` still loses exactly one view; the toast's Undo action
        restores it.
      The host's splice-and-save path (`database-view.ts:3445-3456`) is untouched in either branch.
      **Ruled** by ADR-005, 2026-09-07 (Europe/Amsterdam), verbatim *"Confirm only if
      unrecoverable"* — the second reading of the primitive is ADR-003's, already Accepted, so a
      second confirm surface is still the thing this leg must not build. **Ruling consumed:** Notion
      P9 (`55602f6a`, `348fd2b7`), the scope radio not adopted (F-304). Red closed by T001's confirm
      probe. (`src/views/toolbar-renderer.ts`, `src/views/toolbar-renderer.test.ts`,
      `src/views/database-view.ts`)
      **The read, taken.** `database-view.ts:3445-3456`'s `deleteView` already calls
      `saveCurrentViewConfigInBackground()` (`:3453`), the exact same call every other view
      mutation in this class makes (`addView`, `renameView`, `moveView`). That call chains through
      `saveCurrentViewConfig` → `saveViewEntryConfig` → `recordConfigHistory`
      (`database-view.ts:6789-6811`), which snapshots the `DatabaseConfig` before and after the
      save and — when they differ, which a splice always makes them — pushes a `ConfigHistoryEntry`
      onto `historyStack`, the same stack the toolbar's own persistent Undo action
      (`updateUndoAction`, `:10586`) and `Ctrl+Z` (`undoLastEdit`) already read. **A deleted view is
      already recoverable by an existing undo path, today, before this leg's own code changed
      anything.** ADR-005's Branch B applies.
      **Built.** `deleteView` now sets `this.pendingUndoLabel = t("undo.deleteViewConfig")` before
      saving (so the Undo action's label names the deletion rather than falling to the generic
      "view configuration"), and raises a `showToast` naming the deleted view with an Undo action
      that calls `this.undoLastEdit()` — the same config-history-plus-toast idiom
      `migrateGalleryViewOnOpen` (`:2696-2724`) already ships, adapted from an automatic migration
      to an operator-initiated delete. Both `toolbar-renderer.ts` call sites (`:1180`, `:1330`) are
      **unchanged** — `actions.deleteView(index)` still runs directly, because the toast is the
      shared implementation's job (one owner, D5), not each call site's. No confirm surface was
      built anywhere. **Verified:** `src/views/database-view.test.ts`'s "DatabaseView deleteView"
      block — deleting from a 2-view database removes exactly one view with no confirm, records a
      `"config"`-typed history entry labeled `undo.deleteViewConfig`, and `undoLastEdit()` restores
      both views in original order; the one-view guard raises no confirm and pushes no history
      entry. `src/views/toolbar-renderer.test.ts` pins that neither call site gained
      `buildConfirmSheetBody`/`confirmWithModal`. `npx vitest run` exit **0** (1557/1557).
- [x] T005 [P0] Give the filter panel's zero-rule branch (`filter-panel-renderer.ts:197-202`) a
      searchable flat property list built from the `toPropertyDropdownOption` vocabulary the file
      already carries (`:497`); picking a property creates the first leaf through
      `createDefaultFilterRule` (`:90`) and `appendLeaf` (`:223`); a `+ Add advanced filter` footer
      switches to the landed tree. **The builder is untouched** — `053`'s rulings hold, and the
      one-rule panel is this leg's proof: a panel seeded with exactly one rule renders
      byte-identical before and after, diffed and recorded. Red first: the branch renders only the
      `db-panel-empty` hint. **Notion:** P4, `86a8e66c` / `8ff7ae4b` / `1f10ae24` (F-202).
      (`src/views/filter-panel-renderer.ts`, `styles.css`)
      **Evidence.** Reuses the dropdown primitive's own `db-dropdown-search`/`db-dropdown-options`
      classes and `filterPickerRows` (from `popover-host.ts`) for the search filter, so the tier
      mints no new CSS (D7). Property list built from `toPropertyDropdownOption`; the first leaf
      goes through `createDefaultFilterRule(config)` with `rule.field` set to the clicked property,
      then `appendLeaf`. The footer reads "+ Add advanced filter" (`panel.addAdvancedFilter`,
      distinct from the tree's own "+ Add condition"); clicking it appends a default leaf exactly
      as the old unconditional button did, landing on the tree. The ≥1-rule branch's own
      "+ Add condition" button moved inside the `else` block, unchanged in markup or behavior — the
      negative control this leg names. Zero columns falls back to the plain hint, no search box.
      `src/views/filter-panel-renderer.test.ts` (7 assertions) and the live `sheet-rebuild` lane
      (which mounts the real `FilterPanelRenderer` and exercises this exact branch) both pass.
- [x] T006 [P0] [P] Pass `searchable: true` at three sites — the filter field dropdown
      (`filter-panel-renderer.ts:494-501`), the select/status value dropdown (`:576-590`) and the
      sort field dropdown (`sort-panel-renderer.ts:199-206`). The mechanism is the flag alone: the
      gate already lives inside the primitive (`dropdown-field.ts:228` — on a phone sheet,
      `searchable === true && options.length > 8`; on desktop, `063`'s landed combobox rule
      `a952e5e7` already searches at any count, and this leg touches none of that). Neither panel
      passes the flag today, so their phone-sheet presentations fall to the `searchable === true`
      default and render no search row at any count — that is the red. **Notion:** P4/P5,
      `1067756c` / `82d66d47` / `86a8e66c`; the in-repo precedent: `view-config-panel-renderer.ts:1558` (the one real pass-`true` site;
      `:2064` and `:2082` are `renderSelect`'s parameter and its pass-through). (F-203.) (`src/views/filter-panel-renderer.ts`, `src/views/sort-panel-renderer.ts`)
      **Evidence.** `searchable: true,` added at the three cited call sites and nowhere else
      (`grep -c "searchable: true," src/views/filter-panel-renderer.ts` = **2**,
      `src/views/sort-panel-renderer.ts` = **1**). The gate itself is untouched inside
      `dropdown-field.ts:276`. `src/views/filter-panel-renderer.test.ts` and
      `src/views/sort-panel-renderer.test.ts` pin the exact counts and that no second count check
      was added alongside the flag.
- [x] T007 [P0] Add one rung at the head of `applyToolbarChromeCollapse` (`toolbar-renderer.ts:2561`)
      that collapses the `:2365` label span before the `:2571` targets loop runs. The landed order
      — `[newCluster, query, props, add]` — is not reordered, and nothing behind the rung moves
      (ADR-001). In the sweep, the label reads absent before the first cluster-hidden width,
      zero-overflow holds at every width, and the accessible name is unchanged — the label
      collapses visually, the `aria-label` does not (NFR-A03). **Ruled** by ADR-001, 2026-09-07
      (Europe/Amsterdam), verbatim *"Yes, icons first then the drop order"* — the icon rung lands
      ahead of the drop order and the drop order still applies, unmoved, after it. Red closed by
      T001's collapse reading.
      (`src/views/toolbar-renderer.ts`, `tools/live/toolbar-collapse-sweep.ts`)
      **Evidence.** Red observed via a direct sweep run before the rung: `newLabelVisible` read
      `true` at every width (250-900px), including widths where `newClusterVisible` already read
      `false` (a cluster was already gone while the label still showed) — the label was never
      collapsed. After the rung: `newLabelVisible` reads `false` at 250-450px and 460-480px (label
      alone collapsed, cluster still present) and only both go `false` together below that — zero
      widths where a cluster is hidden and the label still reads visible; the `newCluster` order is
      unchanged (still `[newCluster, query, props, add]`); `newButtonAriaLabel` reads `"New"` at
      every one of the 66 swept widths. `node tools/live/run-toolbar-collapse-sweep.mjs` exit **0**.
      `run-toolbar-collapse-sweep.mjs` gained explicit assertions for all three (label-ahead,
      non-vacuous, aria-stable) rather than leaving them as switch-point printouts.
- [x] T008 [P1] Add one `db-active-control-add` control per rule group in the chip rail's
      `render()` (`active-view-controls-renderer.ts:60`), present exactly when at least one chip is
      visible — the zero-chip case is the control — wired to the existing
      `toggleFilterPanel` / `toggleSortPanel` (declared at `toolbar-renderer.ts:157`/`:167`), at the
      landed 28px chip pitch (`styles.css:1821`) and the 11%/17% tints (`:1825`, `:1832`), carrying
      its own accessible name (NFR-A02). No second rail anatomy — `053`'s ADR-001 rail-extension
      ruling and ADR-006 here both pin the per-rule shape (F-205, F-207). Red first: the census in
      T002 = **0**. **Notion:** P2 `d8abbe0b`; Anytype's own T001 read records the same control —
      the one adoption both references agree on (F-201).
      (`src/views/active-view-controls-renderer.ts`, `styles.css`)
      **Evidence.** `ActiveViewControlsActions` gained optional `addFilter?`/`addSort?`; each rule
      group appends its own `db-active-control-add` control via `appendAddButton` immediately after
      its chips, gated on the action being present AND the group having rendered at all — so the
      zero-chip case (the group never renders) is the control, exactly as specified. Wired in
      `database-view.ts`'s `renderActiveViewControls()` to the same `toggleHeaderPopover` the
      toolbar's own filter/sort buttons use; `embedded-database-renderer.ts` is untouched and
      simply omits the actions, so its rail is unchanged. CSS reuses the landed 28px chip pitch and
      11%/17% tints — no new geometry (D7). `grep -rn "db-active-control-add" src/ styles.css` now
      returns the definition site plus its three call sites, from **0** before this leg.
      `src/views/active-view-controls-renderer.test.ts` (3 assertions) pins the per-group gating.
- [x] T009 [P2] Settle REQ-006. **Declined, 2026-09-07** (`decision-record.md` ADR-007, ruled by the
      operator, verbatim *"Groups panel only"*) — per-group visibility lives in `059`'s Groups
      panel only. This packet's popover rows (`toolbar-renderer.ts:1869-1887`) gain no eye toggle
      and keep exactly what they have today, the existing "show empty groups" switch
      (`renderGroupVisibilitySwitch`, `:1885`). REQ-006 closes **Waived** citing ADR-007; the
      hidden-group axis (`boardHiddenGroups` at `types.ts:560`, persisted at `data-source.ts:1230`/
      `:1352`, read at `board-renderer.ts:192`) stays `059`'s to write and, now, `059`'s to read for
      the table renderer as well — no code here. **Notion:** P7 `e9698e1b` (F-302).
      (`decision-record.md`, `acceptance-criteria.md`)
      **Evidence.** No code touches `toolbar-renderer.ts`'s group popover or `types.ts`'s
      `boardHiddenGroups` in this packet; `git diff --stat` for those two files shows no change
      from this leg's own commits beyond what T001/T004/T007 already made. AC-010 stays Waived.
- [x] T010 [P1] [P] Verify the two record corrections REQ-007 carried at this packet's opening
      stand and were not absorbed: the digest's §4 P3 row is stale because the desktop side sheet
      landed after it was written (ADR-008), and the digest's §6 Q4 is answered — our control
      cluster carries no text label to collapse, so the density comparison lives only on the New
      button (ADR-002). Both live in `goal.md` §4 and `decision-record.md`; this leg reads both
      against the citations they name and ticks nothing they would have to move. Runnable
      immediately and independent of every other leg.
      (`specs/005-component-surface-system/064-notion-toolbar-refinement/decision-record.md`)
      **Evidence.** Both corrections re-checked against the current tree: ADR-008's desktop side
      sheet (`view-config-panel-renderer.ts`'s `presentPanel`/`surface-shell.ts:185`) still stands;
      ADR-002's `createControlClusterButton` (`toolbar-primitives.ts:186-220`) still builds no text
      node, so the density comparison still lives only on the New button REQ-004 collapses. Neither
      row needed a further correction.
- [x] T014 [P1] Give conditional row colour its own named view-settings row. Red first, and the
      red is a count: `grep -c "this.renderAppliedSummary(" src/views/view-config-panel-renderer.ts`
      = **3** today — Properties, Filters, Sorts, emitted by `renderAppliedSummaries` at
      `:510-518` — and none of them is conditional colour, while the capability's only surface is
      the inline `db-conditional-format-settings` block (`renderConditionalFormatting`, `:747`,
      mounted in the **view** section at `:405`). Add a fourth summary row reading the count of
      `config.conditionalFormats`, an explainer line in the panel's own `hintClass()` idiom
      (`:569`, `:1688`), and a click that opens the existing `:747` section — **no second rule
      editor** (CHK-013). **Negative control:** a chart view, whose `:405` guard mounts no section,
      renders no row. **Not blocked:** this is `062` ADR-003, Accepted, ruled by the operator at
      2026-09-06 18:32 — *"Yes, own row in view settings"*; ADR-010 records what the ruling
      corrects, including that ours is already per-view and already in the view half of the panel,
      so nothing relocates. **Notion:** `142cef4e`, listed in `ac0d576b`, `2517d4cf`, `9e80b489`,
      `420dd630`. (`src/views/view-config-panel-renderer.ts`, `styles.css`)
      **Evidence.** `renderAppliedSummary` now returns the row element; `renderAppliedSummaries`
      adds a fourth call — `renderConditionalColorSummary` — guarded by the identical
      `config.viewType !== "chart" && actions.database` condition `renderConditionalFormatting`
      itself mounts under, so the two can never disagree about whether a section exists. The row
      reads `(config.conditionalFormats || []).length`, carries an explainer via `hintClass()`, and
      its click/Enter/Space handler calls `scrollIntoView` on `.db-conditional-format-settings` —
      opening the existing section, building nothing new. Reused `db-view-config-row-clickable`
      (already shipped for `board-card-properties-panel.ts`) for the hover/cursor affordance, so
      **no `styles.css` edit was needed for this leg** despite the file being named. `grep -c
      "this.renderAppliedSummary(" src/views/view-config-panel-renderer.ts` now returns **4** (one
      call inside `renderConditionalColorSummary`, on top of the original three), from **3** before.
      `src/views/view-config-panel-renderer.test.ts` (3 new cases, 8 total in the suite): four rows
      on a table view naming "Conditional color" fourth, the row opens the section without
      duplicating it, and a chart view renders three rows with no `.db-conditional-format-settings`
      at all — the negative control.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 [P0] Run the repository gates and read each output and exit status: `npx tsc --noEmit`,
      `npm run build`, `npx vitest run`, then `npm run gate` with `$?` read directly. The
      `toolbar-collapse` row (`tools/gate.mjs:80`) must be green and must have been observed red
      in T001 — a green run that never exercised the change proves nothing. Note for the read:
      `tools/live/*.ts` is covered by neither `tsconfig.json` nor `lint:tools` (`053`'s recorded
      gate gap), so the sweep's evidence is the lane's own exit status, not the typecheck.
      **Evidence.** `npx tsc --noEmit` exit **0**. `npm run build` exit **0** (`main.js`
      regenerated). `npx vitest run` exit **0**, 149 files / **1600** tests on the rebased tree (146 files / 1557 tests before it; the difference is main's own landings, not this packet's). `npm run gate` exit **0**,
      **26 green, 0 red for a declared reason** — `toolbar-collapse` green, observed red in T001.
      Two lanes needed a fix to reach green, both scoped and recorded: `sheet-rebuild` (below), and
      `evidence` (all 15 stamped `tools/live/*.json` artefacts re-derived after `styles.css` and
      the four touched renderers moved — re-running each artefact's own tool, never hand-editing a
      number). `sheet-rebuild` first read RED: two cases
      (`filter sheet (real FilterPanelRenderer, add-condition)` / `embedded filter sheet…`) had
      their `.find(/condition/i)` selector fall through to the panel header's "AND (all)" logic
      toggle once the zero-rule footer's text became "+ Add advanced filter" rather than
      "+ Add condition" — fixed by widening the pattern to `/condition|advanced filter/i` in
      `tools/live/sheet-rebuild-harness.ts` (two call sites). A third case
      (`the filter sheet holds still while it rebuilds`) read RED because the entry tier is
      genuinely taller than the one-row tree it collapses into on the very first pick, so the
      sheet's top edge legitimately settles lower after that one transition — the existing
      tolerance (`deepest <= settledTop + 4`) assumed adding a rule only ever grows the sheet, an
      assumption this feature breaks for exactly this one transition. Root-caused rather than
      patched, then **corrected at the landing**: the leg's first formulation tested for the
      viewport's own floor (`deepest >= viewportHeight - 4`), and the landing verification proved
      that formulation does not catch the defect it was written for. Reintroducing the historical
      failure — `playSheetEntrance` forced past its `is-visible` guard, so a rebuilt panel replays
      its entrance — dropped the filter sheet to **836 on an 844px screen**, not to 844, because
      this sheet **floats 8px off the bottom**; `>= 840` therefore reported the replay as held, and
      the lane failed only through the neighbouring five-taps row. The check now measures against
      the surface rather than the screen: the floor is the **deeper of the two resting positions**
      — the opening top and the rebuilt top — so a shape change settles at one of them and a
      replayed entrance drops below both. Read both ways at the landing. Green tree: the filter
      sheet settles at 526, rebuilds to 626, deepest 626 → PASS, which is the legitimate 100px
      content change. With the replay reintroduced: settles 526, rebuilds to 626, deepest 836 →
      **FAIL on this row**, `node tools/live/sheet-rebuild.mjs` exit **1**. The same file's own
      third control already subtracted the resting inset (`floor - restingBottom - 1`); this row
      now does the equivalent. `node tools/live/sheet-rebuild.mjs` exit **0** on the green tree
      after all three fixes.
- [x] T012 [P0] Name every registered capture whose picture the landed legs moved, re-take it,
      open the image and read it, then release the parent's CSS lane naming what moved — the
      `screenshots-fresh` lane's pixelHash failures are the detector, and `screenshot-currency.md`
      §3 is the standard the read owes: the harness renders fixture markup, so a picture that
      changed and was not looked at is a read owed, not a pass. (`screenshots/`, `tools/lane/css-lane.json`)
      **Evidence, re-derived at the landing on the rebased tree.** `npm run screenshots` (full
      recapture, **604 entries**) then `npm run screenshots:verify`. Zero captures carry this packet's content: every registered scenario in
      `tools/screenshots/scenarios/*.mjs` builds its own static HTML fixture rather than mounting
      the real renderers this packet edited, and no new class this packet introduced
      (`db-active-control-add`, the reused `db-dropdown-search`/`db-dropdown-options`/
      `db-view-config-row-clickable`) appears in any fixture. One capture does mount the
      real chip-rail renderer — `constructed-active-view-controls`, through
      `tools/live/render-assertion-harness.ts:3207` — and it is byte-identical, because that
      harness supplies an actions bag with no `addFilter`/`addSort`; both are optional, so the add
      control does not draw there. That is recorded as an open gap in T016 rather than as coverage.
      **Four** captures moved bytes at identical `pixelHash`/`layoutHash` (`styles.css`'s content
      hash changing invalidates every capture's recorded source hash, and Chrome's own PNG encoder
      is not byte-reproducible run to run) — `constructed-cell-editor-select-desktop-dark`,
      `board-view-desktop-dark`, `reference-gantt-subtask-mobile-light` and
      `reference-kanban-subtask-mobile-dark` — and were restored to their committed bytes, with
      `manifest.json`'s own `bytes` fields reconciled back to the restored files and its re-derived
      source hashes kept. `screenshots:verify` exit **0** — "604 entries match their sources, and
      none is blank or identical across themes." The four toolbar captures
      (`constructed-toolbar-{desktop,mobile}-{dark,light}`) were opened and read: the desktop pair
      still draws the New button's word at full width, so the rung is correctly inert there, and
      the mobile pair is unchanged because the touch branch never creates the label span at all.
      `tools/lane/css-lane.json` released at `styles.css` hash `6da9460cc5a9`, re-derived onto
      `061`'s released stylesheet rather than `060`'s, naming zero reviewed captures; `node
      tools/lane/check-lane.mjs` exit **0**, "release names all 0 changed capture(s)".
- [x] T015 [P0] **Landing verification (Opus).** Rebase onto `origin/main` (twenty-seven further
      commits: `059`, `060`, `061`, `062`, `065`, `066`), re-derive every generated artefact, then
      treat each of the implementation leg's claims as a hypothesis and test it. Three conflicts,
      all resolved by intent keeping both landings: `database-view.test.ts` (main's board
      group-visibility suite and this packet's delete-view suite both opened a section 4 — main's
      keeps 4, this packet's is renumbered 5), `tools/lane/css-lane.json` (merged append-only,
      re-derived onto `061`'s released stylesheet), and the generated evidence set (resolved to
      main's side, then re-run by each owning tool).
      **Mutation testing, one per new surface — every mutation observed red except where noted.**
      Dropping `pendingUndoLabel = t("undo.deleteViewConfig")` fails the delete-view suite;
      applying `entry.after` instead of `entry.before` on undo fails it on
      `expected [Board] to have a length of 2`, so the restore assertion is load-bearing.
      Reverting the entry tier to `db-panel-empty` fails `filter-panel-renderer.test.ts`; dropping
      `searchable: true` fails `sort-panel-renderer.test.ts` (2 of 2); dropping the filter add
      control, and separately its `aria-label`, each fail `active-view-controls-renderer.test.ts`;
      dropping the conditional-colour row, its explainer line, and its `viewType !== "chart"`
      guard each fail `view-config-panel-renderer.test.ts` on a different row, the last on the
      chart negative control. Disabling the collapse rung while keeping the label class fails
      `run-toolbar-collapse-sweep.mjs` with "the New label is still visible at 212 width(s) where
      a cluster is already hidden" (exit 1); restoring main's whole `toolbar-renderer.ts` fails it
      on the vacuity control instead. **One mutation survived and is recorded as a gap in T016.**
      **The collapse rung, measured.** Swept 250-900px at 2px steps: the label is absent while
      every cluster is still drawn across **456-486px** — a 32px band — and the rung buys the New
      cluster **32px**, dropping it at 456px where the pre-rung tree dropped it at 488px. At the
      four widths the landing brief named the ordering is not observable, because at all four the
      cluster is already hidden: 390px and 402px are below the whole ladder, and 768px and 1024px
      sit in this fixture's non-monotonic tail (the New cluster hides again from 716px up). That
      tail is **pre-existing** — measured with the rung disabled and present there too — and is a
      property of the fixture's natural width, not a regression from this rung.
      `newButtonAriaLabel` reads `"New"` at every swept width.
      **The combobox rule (`a952e5e7`) cannot be regressed by this leg**, and that is structural
      rather than lucky: `dropdown-field.ts:276` reads
      `phoneSheet ? options.searchable === true && options.options.length > 8 : true`, so on
      desktop the flag is ignored and every dropdown is already a combobox. The three
      `searchable: true` passes reach only the phone-sheet branch, which is what `AC-006` claims.
      **Delete-view undo, driven through the real methods.** The toast is raised with
      `notice.deletedView` interpolating `{name: "Table"}` and an action labelled `toolbar.undo`;
      pressing that action restores both views and the deleted view's whole config (`viewType`,
      `schema`, `sourceFolder`). **One part of the leg's report is refuted: the selected tab is
      not restored.** With view index 1 selected and deleted, `currentViewIndex` reads 0 after the
      delete and still 0 after the undo — the restored view is back in the strip but the selection
      stays on the neighbour the delete moved it to. Measured with and without `id` fields on the
      views, so it is not a fixture artefact: `recordConfigHistory` is handed the mutation's
      `viewId`, which is resolved **after** the splice, so the entry names the surviving view. No
      criterion here claims otherwise — `AC-001` asks only that the views come back — and the
      state is coherent rather than broken, so this was recorded, not fixed, at this landing.
      **Since fixed, in the same follow-up that closed T016.** `deleteView` now captures the
      deleted view's own id (`removed.id`, already held by the splice's own destructure) before
      calling `saveCurrentViewConfigInBackground`, and passes it through an explicit mutation
      override rather than letting `recordConfigHistory` fall back to `this.getConfig()?.id` —
      the *current* view's id, read after `currentViewIndex` has already moved onto the neighbour.
      `src/views/database-view.test.ts`'s new case: deletes the active, last view (index 1 of 2),
      asserts `currentViewIndex` moves to 0 on delete, then back to 1 — the restored view's
      original index — on undo; red-proved by reverting the capture (stayed on 0 after undo too).
      `npx vitest run` exit **0**.
      **The toast's presentation, measured live in Chrome** at 390x844 and 1200x800, both themes.
      Phone: the card sits at x=16 w=358 in a 390px viewport — 16px insets on both sides, so
      `066`'s centred band applies to this toast as it does to every other. Desktop: the landed
      384px card, right-anchored 12px in. The repository's own themed toast captures
      (`chrome-toast-success-{desktop,mobile}-{dark,light}`) were opened: check glyph, message,
      close control and an accent-coloured Undo, legible in both themes, and this packet's message
      is far shorter than the one they photograph. **One measurement is a gap, recorded in T016:**
      `.db-toast-action` renders 29x14 CSS px.
      **Gate.** `npx tsc --noEmit` exit **0**; `npx vitest run` **1600/1600** across 149 files;
      `npm run build` exit **0**; `node tools/naming/scan-comments.mjs` PASS over 495 files, 0
      artifact-id violations; `npm run gate` exit **0** at **26 green, 0 red for a declared
      reason**, read twice — the first run was RED on `evidence` alone (8 of 15 artefacts
      describing the pre-rebase tree), which was cleared by re-running each artefact's own tool
      rather than editing a number.
- [x] T016 [P1] **Open gaps this landing recorded, since closed by a follow-up.** Three, each
      with an owner that was not this packet's remaining work at the landing — all three are now
      closed, in the same follow-up that also fixed the undo-selection gap T015 recorded (below).
      **(a) CLOSED. Three of the five suites this packet adds were source greps, not behaviour.**
      `filter-panel-renderer.test.ts`, `sort-panel-renderer.test.ts` and
      `active-view-controls-renderer.test.ts` read the shipped source and asserted on strings.
      Their stated reason — that the `node` environment cannot mount Obsidian's DOM helpers — was
      contradicted inside this same packet by `view-config-panel-renderer.test.ts`, which mounts
      the real renderer on a hand-built tree and asks it real questions. The cost was measurable:
      rewriting the entry tier so **every** property row creates its rule on the first property
      (`addFirstLeaf(columns[0].key)` for `addFirstLeaf(col.key)`) left all seven
      `filter-panel-renderer.test.ts` assertions green — a real defect no test there saw. All
      three suites now mount real DOM on a hand-built tree, matching `view-config-panel-renderer.test.ts`'s
      own idiom. `filter-panel-renderer.test.ts` mounts the zero-rule entry tier and drives a
      click on a non-first row, asserting the resulting rule's field matches that row's own
      property — red-proved against the named mutant (`state.filters[0].field` read `"file.name"`
      instead of the clicked `"colB"`), green on the real source. The ≥1-rule tree branch and the
      searchable-dropdown occurrence counts stay a documented source pin: `toolbar-primitives.ts`'s
      `appendConditionPart` gates its min-width floor on `child instanceof HTMLElement`, and this
      suite's `node` environment has no global `HTMLElement` — mounting that branch needs that
      fixed first, filed separately rather than smuggled into this follow-up.
      `sort-panel-renderer.test.ts` mounts a real sort rule row (with `./dropdown-field`'s
      `createDropdownField` mocked — it carries its own suite — and a scoped `HTMLElement` global
      stub for `appendConditionPart`'s same guard) and reads which call received `searchable:
      true`, red-proved by swapping the flag onto the direction dropdown.
      `active-view-controls-renderer.test.ts` mounts the real chip rail and drives the add
      control's click through to `actions.addFilter`/`actions.addSort`, red-proved by wiring the
      sort group's control to `addFilter` instead. `npx vitest run` exit **0**, 1602/1602.
      **(b) CLOSED. The chip rail's add control shipped unphotographed and behaviourally
      untested.** No registered capture drew it, because the one capture that mounts the real
      renderer supplied no `addFilter`/`addSort`. `render-assertion-harness.ts`'s
      `active-view-controls` scenario (its own actions bag, `:3207`) now supplies both as no-ops,
      matching every other action in that bag; `chipRailAssertions` gained a check that each
      present rule group carries its own `.db-active-control-add`, red-proved by reverting the two
      actions (0 add controls, want 1, on both scenarios). `node tools/live/render-assertions.mjs`
      exit **0**. This moved four registered captures; two are byte-identical
      (`constructed-active-view-controls-mobile-{dark,light}` — the mobile rail's own horizontal
      scroll clips the add control out of the captured viewport, a `layoutHash`-only move) and two
      carry real content (`constructed-active-view-controls-desktop-{dark,light}`), both opened
      and read: the `+` control now sits at the end of each chip group, legible in both themes.
      `tools/lane/css-lane.json` released, naming both real-content captures; `node
      tools/lane/check-lane.mjs` exit **0**, "release names all 2 changed capture(s)".
      **(c) CLOSED. `.db-toast-action` was a 29x14 px tap target on a phone.** `styles.css`'s
      `.db-toast-action` set `padding: 0` with no min-height, and `tools/live/touch-targets.json`
      carried no entry naming it, so nothing measured it. `.is-phone .db-toast-action` now carries
      `min-width: 46px; min-height: 46px; justify-content: center;` — the icon and label keep
      their existing size and stay centred, only the invisible hit area grows, unchanged on
      desktop (46px rather than a bare 44px: a bare 44px measured 43x43 in Chrome, evidently
      rounded). `tools/live/touch-targets.mjs`'s `RAISED` list gained a matching `db-toast-action`
      entry at the 44px floor, the same shape `db-table-footer-trigger` already used; red-proved
      by reverting the CSS alone (`30x15, under its named 44px floor (RAISED, not the 28px
      default)`), green with it restored. `tools/live/touch-targets-baseline.json`'s fixture
      ceiling dropped 186 → 185, since the control now clears its own named floor instead of
      sitting in the generic under-28px count. This edited `styles.css`, so it went through the
      css-lane properly: `SURFACE_PHASE=064-notion-toolbar-refinement`, an `edit` entry recorded
      at the new hash, a full recapture (`chrome-toast-success-mobile-{dark,light}` moved real
      content — both opened and read, "Undo" unchanged in position and size with more invisible
      space around it — plus `constructed-active-view-controls-desktop-{dark,light}` carrying
      forward (b)'s own content), and a `release` entry naming all four. `node
      tools/lane/check-lane.mjs` exit **0**, "release names all 4 changed capture(s)". `node
      tools/live/touch-targets.mjs` exit **0**. Ctrl+Z and the toolbar's own Undo action still
      reach the same history entry regardless, so the recovery path never depended on this fix.
- [x] T017 [P0] **Landing verification of the T015/T016 follow-up (Opus).** Rebased
      `worktrees/212-toolbar-followups` onto `origin/main` twice — first at `6ca4a5c3` (nine
      commits: `061`, `062`, `063`, `065` and their evidence re-derivations), then at `173f7d3a`
      after `067-sheet-family-remediation` landed and took the css-lane between the first gate and
      the push. Both passes conflicted only in generated evidence: `main.js`, `screenshots/manifest.json` and fifteen `tools/live/*.json`
      artefacts were resolved to main's side and re-derived by their own tools, and
      `tools/lane/css-lane.json` was merged append-only — main's `065`/`063`/`067` entries kept in
      order, this packet's `edit`/`release` re-stamped at the merged stylesheet's own hash
      (`49e78c56ab73` after the second pass) with a fresh `acquire` naming the handover from `063`, and the
      branch-local harness-only release folded into the release rather than replayed against a
      hash the tree no longer holds. `styles.css` itself merged without conflict. Every claim of
      the follow-up was re-tested on the rebased tree by applying its own named mutation:
      `addFirstLeaf(columns[0].key)` fails `filter-panel-renderer.test.ts` with `expected
      'file.name' to be 'colB'`; dropping `searchable: true` from the sort field dropdown fails
      `sort-panel-renderer.test.ts` twice; breaking `appendAddButton`'s `onAdd(add)` fails
      `active-view-controls-renderer.test.ts` twice; removing `addFilter`/`addSort` from
      `render-assertion-harness.ts`'s bag fails `render-assertions.mjs` on both chip-rail
      scenarios (`0 add control(s), want 1`, exit **1**); reverting the `.is-phone
      .db-toast-action` rule fails `touch-targets.mjs` with `30x15, under its named 44px floor`
      (exit **1**), and reverting the RAISED entry as well returns the fixture ceiling to **186**;
      reverting `deleteView`'s `viewId` override fails `database-view.test.ts` with `expected +0 to
      be 1`. All four changed captures were opened and read. A live measurement at the capture
      corpus's own phone width (402px, coarse pointer, `is-phone`) reads `.db-toast-action` at
      **45.08 x 45.08** with the fix and **30.23 x 14.7** without it, the text's own range box
      unchanged at **30.23 x 14.7** in both — the hit box grew, the glyph did not. `npx tsc
      --noEmit` exit **0**; `npx vitest run` exit **0**, **149 files / 1609 tests** (1602 before
      the rebase, 1606 after the first pass; every added case is main's own); `npm run build` exit
      **0**; `npm run screenshots` **606 entries** with `screenshots:verify` exit **0**, and the
      captures that moved bytes at unchanged `pixelHash` restored to their committed bytes (four
      after the first pass, seventeen after the second — only this packet's own four ever moved
      content); `node tools/lane/check-lane.mjs` exit **0**, "release names all 4
      changed capture(s)"; `npm run gate` exit **0**, **26 green, 0 red for a declared reason** on both
      passes, after the stale evidence artefacts each run named (eight, then twelve) were
      re-derived by their own tools. Packet validation `RESULT: PASSED`, 0 errors 0 warnings.
- [x] T018 [P0] **Second landing verification of the same follow-up, on a new base (Opus).** The
      branch was verified again from `worktrees/212-toolbar-followups` at base `origin/main`
      **`3a94e58b`**, because T017's landing never reached `main`: `origin/main` had moved past both
      bases T017 names, and the branch sat two commits ahead of `3a94e58b` with sixteen re-derived
      evidence files uncommitted. Nothing was accepted from T017; every claim was re-mutated on
      this base. **`addFirstLeaf(columns[0].key)`** for `col.key` at `filter-panel-renderer.ts:275`
      fails `filter-panel-renderer.test.ts` with `expected 'file.name' to be 'colB'`. **Removing
      `addFilter`/`addSort`** from `render-assertion-harness.ts`'s actions bag fails
      `render-assertions.mjs` on both chip-rail scenarios — `0 add control(s), want 1`, exit **1**.
      **Reverting `.is-phone .db-toast-action`** alone fails `touch-targets.mjs` with
      `chrome-toast-success button.db-toast-action measured 30x15, under its named 44px floor`;
      reverting the `RAISED` entry alone instead leaves the run at **185** and green, and reverting
      **both** returns the fixture count to **186** against a baseline of 185 (`1 control(s) newly
      under 28px`) — so the ceiling move is the CSS's and not an artifact of the `RAISED` list, the
      exact claim `touch-targets-baseline.json`'s `toastActionRaise` makes. **Reverting
      `deleteView`'s `viewId` override** fails `database-view.test.ts` with `expected +0 to be 1`.
      A further probe raised the `db-toast-action` `RAISED` floor to a synthetic **200** and the run
      still passed: `classifyBox` (`touch-target-measure.mjs:20`) returns `null` for any control
      whose short side already clears `ENHANCED`, so the control's short side measures **≥ 44 CSS
      px** at the corpus's own 402px phone fixture. One wording correction, which changes no
      result: the three suites mount a hand-built `FakeElement` tree — the idiom
      `view-config-panel-renderer.test.ts` uses — not a jsdom or browser DOM, and
      `filter-panel-renderer.test.ts` sections 4-5 stay source pins by the design its own header
      documents. All four changed captures were opened and read: the two chip-rail captures gain a
      `+` control in each rule group, and the toast captures grow **804x354 → 804x416** (DPR 2, so
      +31 CSS px, exactly 46 − 15) with Undo centred in the taller box. `npx tsc --noEmit` exit
      **0**; `npx vitest run` exit **0**, **151 files / 1630 tests**; `npm run build` exit **0**
      (`main.js` unchanged); `node tools/live/sheet-grammar.mjs` and
      `node tools/live/render-assertions.mjs` exit **0**; `node tools/naming/scan-comments.mjs`
      PASS, 502 files, 0 artifact-id violations. **The first gate run was RED**, on
      `screenshots-fresh` alone and for a real reason T017 could not have seen: `screenshots/manifest.json`
      had been resolved to main's side on T017's own rebase and never regenerated, so it still
      carried main's `styles.css` hash and `verify.mjs` read **882** captures stale. `npm run
      screenshots` (**606 entries**, `screenshots:verify` exit **0**) fixed it and moved 26 files.
      Five are jitter, restored to their committed bytes with the manifest's `bytes` reconciled to
      them (all 606 re-checked: 0 remaining mismatches, 0 `pixelHash` mismatches). The other
      **21 are real and are not this packet's**: seventeen are the sheet-family debt
      `css-lane.json`'s own `outstanding` entry records against `067`, matched to that entry's own
      pixel numbers, and four are an icon-picker class it does not name. Ownership was proved, not
      inferred — recapturing `field-icon-picker` with **`origin/main`'s own `styles.css`** in the
      tree reproduces the new bytes and still differs from the committed PNG by the same 4,923
      pixels at max channel delta 208, and `.is-phone .db-toast-action` cannot reach a desktop
      capture in any case. All 21 were opened and read (each is a 1-2px sheet resting-position
      shift with its scrim, or a ~2px shift of an icon row / "No results" label; no content,
      colour or control differs) and committed rather than restored, with the css-lane release's
      `reviewed` array extended **4 → 25** paths. `node tools/lane/check-lane.mjs` exit **0**,
      "release names all 21 changed capture(s)". **`npm run gate` exit 0, 26 green, 0 red** on the
      second run, after which seven evidence artefacts re-derived themselves and were committed.
      Packet validation `RESULT: PASSED`, Errors 0 Warnings 0.
- [ ] T013 [P0] **Operator row — never ticked by an agent.** The four device-only checks the loop
      named — icon-only rail discoverability on a phone, the entry tier inside the phone filter
      sheet, the delete confirm as a stacked sheet, and tabs against the view switcher both
      references use — are answered in `053` AC-111's sitting, not here. (F-108, F-208, F-307, F-402.)
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`, except T013 which only the operator closes
- [x] No `[B]` blocked tasks remaining
- [x] Every red in `goal.md` §3 observed failing before its fix, with the command and `$?` recorded
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Directive and criteria**: See `goal.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Evidence**: See `research/research.md` under `053-toolbar-and-view-controls/research/notion-toolbar/`
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
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in spec.md — REQ-001 through REQ-009
- [x] CHK-002 [P0] Technical approach defined in plan.md — §3 and the affected-surfaces addendum
- [x] CHK-003 [P1] Dependencies identified and available — ADR-001, ADR-005 and ADR-007 were ruled 2026-09-07 (Europe/Amsterdam); T004 (rewritten as the two-branch read), T007 and T009 (Declined, Waived) carry no `[B]` any longer
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` exits 0, output read
- [x] CHK-011 [P0] No console errors in the collapse-sweep and gate runs
- [x] CHK-012 [P1] N/A after ADR-005's Branch B read — no confirm was built, so there is no scrim/Escape dismissal path to behave correctly. Declining Branch A's premise is itself the correct answer here, not a gap
- [x] CHK-013 [P1] No second producer for anything that has one — no second confirm surface (none built at all, `053` D8 stays satisfied by construction), no second collapse ladder (one rung ahead of the unmoved order), no second hidden-group writer (ADR-007, untouched)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met, waived or superseded — see `acceptance-criteria.md`
- [x] CHK-021 [P0] Every red observed failing first, with its command and `$?` — recorded per task above
- [x] CHK-022 [P1] The negative controls exercised: the one-rule panel's tree branch is the unmodified original code path (unchanged addBtn markup, moved but not edited), the 8-option case is `dropdown-field.ts`'s own established gate (this leg only passes the flag, and adds no second gate beside it), the zero-chip rail (AC-008, `active-view-controls-renderer.test.ts`), the one-view guard (AC-002, `database-view.test.ts`), the chart view (AC-012, `view-config-panel-renderer.test.ts`)
- [x] CHK-023 [P1] The collapse sweep's readings proven non-vacuous — a width with no cluster hidden also reads the label present, asserted directly in `run-toolbar-collapse-sweep.mjs`
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Each finding carries a class: REQ-001 is `instance-only` — one shared implementation (`deleteView`), whose presentation rides the existing `044`/`048` lanes plus the config-history/toast idiom `migrateGalleryViewOnOpen` already established; REQ-002 is `instance-only` (one branch, the ≥1-rule panel its negative control); REQ-003 is `algorithmic` (the flag meeting a gate that already lives inside the primitive); REQ-005 is `instance-only`; REQ-009 is `instance-only` (one summary block, the chart view its control); REQ-006 is `cross-consumer` (one persisted axis, two candidate writers, which is why it is gated) — settled Waived, not built.
- [x] CHK-FIX-002 [P0] Same-class producer inventory completed (T002's greps), or instance-only status proven by grep.
- [x] CHK-FIX-003 [P0] Consumer inventory completed for the changed markup — the registered captures named in T002 (none exercise the new markup), the collapse lane's readings, and the `sheet-grammar`/`sheet-rebuild` lanes; the latter needed a scoped fix (T011) once REQ-002's entry tier changed the filter sheet's zero-rule footer text and height.
- [x] CHK-FIX-004 [P0] N/A — no security, path, parser or redaction surface in this packet. Recorded rather than silently dropped.
- [x] CHK-FIX-005 [P1] The affected-capture list from T002 is recorded before completion is claimed.
- [x] CHK-FIX-006 [P1] N/A — nothing here reads process-wide state.
- [x] CHK-FIX-007 [P1] Evidence pinned to the fix SHA, not to a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets — nothing in this packet reads configuration
- [x] CHK-031 [P0] The deleted-view toast's copy and the property list are rendered as text through the element helpers (`createDiv`/`createSpan`/`t()`), never interpolated into markup
- [x] CHK-032 [P1] N/A — no auth or authorization surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] `spec.md`, `plan.md`, `tasks.md`, `acceptance-criteria.md` and `implementation-summary.md` synchronized
- [x] CHK-041 [P1] The collapse rung's own comment explains the new step and why it is visual-only (`toolbar-renderer.ts:2578-2581`); the label span's original comment is unchanged since it still describes the label itself correctly
- [x] CHK-042 [P2] N/A — no README surface
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only — the one live-Chrome debug script written to reproduce the `sheet-rebuild` regression was created under `tools/live/` and deleted before completion, leaving no residue in `git status`
- [x] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 12 | 12/12 |
| P1 Items | 12 | 12/12 |
| P2 Items | 1 | 1/1 |

Every `CHK-*` row above is closed. `T013` in the tasks list above is the one row still open —
the operator's device sitting — and it is not one of the `CHK-*` verification items this table
counts. `T015` (landing verification) and `T016` (the three gaps that landing recorded) were added
at the landing and are closed; a follow-up has since closed all three gaps `T016` named and the
undo-selection gap `T015` recorded — none of them ever blocked a criterion this packet could close,
and none is open any longer. `T017` is that follow-up's own landing verification, added on the
rebase onto `6ca4a5c3` and closed there, and `T018` is a second one on a later base (`3a94e58b`)
after `T017`'s push never reached `main`; like `T015` and `T016` neither is a `CHK-*` row.

**Verification Date**: 2026-09-07
<!-- /ANCHOR:summary -->

---
