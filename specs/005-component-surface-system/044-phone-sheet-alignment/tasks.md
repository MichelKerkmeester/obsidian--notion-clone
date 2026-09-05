---
title: "Tasks: Phone Sheet Alignment"
description: "Ordered tasks: read the contracts and the inventory, land the shared chrome, then one leg per reported sheet and one per ranked non-conforming instance, held by a conformance check with a negative control."
trigger_phrases:
  - "phone sheet alignment tasks"
  - "044 tasks"
  - "sheet grammar tasks"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phone Sheet Alignment

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
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Read the two contracts this phase consumes and record what may not change: `003`'s portal and phone predicate, `016`'s drag, flick thresholds and the operator-accepted 35px grab band (`../003-mobile-sheet-presentation/spec.md`, `../016-sheet-drag-and-audit/acceptance-criteria.md`, `src/views/mobile-bottom-sheet.ts`)
- [ ] T002 [B] Read `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md` and turn its ranking into T007's per-instance subtask list. Blocked on the inventory landing; do not wait for it to start T003 (`044/tasks.md`)
- [x] T003 [P] Define the seven grammar elements as one checkable contract, with the class names and the DOM shape each one requires, so `sheet-grammar.mjs` and the consumer legs read the same list (`src/views/sheet-grammar.ts`) — written as `src/views/sheet-grammar.ts` (the contract module the plan left the location open for): `SHEET_GRAMMAR_ELEMENTS` (seven predicates: surface, handle with drag-to-close, header with title and close, padded rows, dropdowns via the shared dropdown, segmented/toggle rows, keyboard avoidance) and `describeSheetGrammar(panel): SheetGrammarReport`. Red first, run against the unchanged tree with the new lane (T011): `add-view — rows: false`, `add-view — dropdown: false`, `sort-panel — header: false`, `record-detail — keyboard: false` — 14 failures, exit 1, full output recorded at the T011 tick. The record sheet's own header/row classes are the two accepted legacy synonyms, documented in the module; the ≥44px close floor and safe-area inset are geometry, owned by the measurement lanes rather than the structural predicates
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Land the shared chrome in the sheet module: a header builder carrying title plus a close affordance over 44px, a `visualViewport` listener publishing `022`'s `--db-keyboard-inset` while a sheet is open, the padded-row and segmented-control class contract, and the bottom safe-area inset. `applySheetChrome`'s existing signature, `attachSheetDragToDismiss` and the flick constants stay byte-identical so `016`'s measurements remain valid (`src/views/mobile-bottom-sheet.ts`) — `createSheetHeader` (`mobile-bottom-sheet.ts:136`): title slot, optional right-side controls via `beforeClose`, close button `db-sheet-close` dismissing through `overlayStack.dismissPanel` with an `onClose` fallback for unregistered mounts; `SHEET_KEYBOARD_INSET_VAR` (`mobile-bottom-sheet.ts:166`) is written by `placeSheet` (`popover-position.ts:382`) from the same per-placement figure as `--db-mobile-sheet-bottom`, so the placement loop stays the sheet's one viewport subscription and publishes the value rather than adding a second listener set. Adopted in sort and filter (`sort-panel-renderer.ts:98`, `filter-panel-renderer.ts:254`, the filter's AND/OR control built through `beforeClose`). Red first: `sort-panel — header: false`, `filter-panel — header: false`, both `keyboard: false`, against the unchanged tree. The 44px close target is a stylesheet fact the touch-target ratchet enforces after the CSS lane styles `.db-sheet-close`.

      **Resolved against `worktrees/040-settings-sheet` at rebase**: that leg landed its own
      `view-config-panel-renderer.ts` header (`renderSheetClose`, `db-view-config-close`) plus the
      `.db-view-config-body` scroll-host fix for report 41 before this task's `createSheetHeader`
      swap could land there — a straight swap would have discarded working, already-captured
      scroll-host behaviour `createSheetHeader` does not provide. Kept `040`'s header/body
      structure as shipped and added the shared `db-sheet-close` class alongside its own
      `db-view-config-close` (`view-config-panel-renderer.ts:331`) so the grammar lane's `header`
      predicate is satisfied without re-deriving the scroll fix. `openColumnWidthAdjuster`
      (`040`/`039`'s own T005/T006, below) already used the record sheet's `db-cell-edit-close`
      synonym and needed no change here.
- [x] T005 Report 40 — the column-width adjuster. Replace the two bespoke `doc.body.createDiv` surfaces at `database-view.ts:11411-11412` with a sheet body: surface, grab band, header carrying the column name and a close, the slider and typed value as padded rows, the Auto/Narrow/Medium/Wide presets as a segmented control, safe-area inset. Keep the `activeElement` guard that stops the clamp eating keystrokes. Leg: `worktrees/039-column-width-sheet` (`src/views/database-view.ts`, `styles.css`)
- [x] T006 Report 40b — keyboard avoidance. While the width field holds focus, the sheet's bottom edge stays above the reduced `visualViewport` bottom and the field stays inside the visible area. Red first against the strip presentation (`src/views/mobile-bottom-sheet.ts`, `tools/live/sheet-grammar.mjs`)

      **Evidence (moved from `../003-mobile-sheet-presentation/tasks.md` T33/T34 — renumbered from
      an original T28/T29 there to avoid colliding with that packet's own Stage 7 (report 41)
      numbers once both landed on `main` — this phase's correct home; landed onto `main` in this
      entry):**

      *Root cause, measured not inferred:* `database-view.ts:11411-11412` built
      `db-mobile-column-width-backdrop`/`-panel` with `doc.body.createDiv` and never called
      `applySheetChrome`, so the adjuster carried none of the seven grammar elements — no sheet
      surface, no grab band, no header or close, no row padding, no safe-area inset, no keyboard
      avoidance. Operator captures `report-40-column-width-sheet.png` (title at x=0, slider clipped
      by the left edge) and `report-40b-column-width-keyboard.png` (the numeric keyboard covering
      the whole strip while typing) are the red state.

      *Fix:* `column-width.ts:366` `openColumnWidthAdjuster` now builds the shared body (header
      `:376` `db-panel-header` + `:379` `db-cell-edit-close`, range `:388` `db-view-config-range`,
      presets `:413`/`:419` `db-new-placement`/`-option`) and the phone branch calls the same
      shared host the owned menus use (`applySheetChrome`, `placeSheet`, `keepSheetPlaced`,
      `playSheetEntrance`, `attachSheetDragToDismiss`, `installPopoverAutoClose`).
      `database-view.ts:11398` delegates to it; the old bespoke classes are gone
      (`column-width.test.ts:155-159`). The CSS lane removed six now-orphaned rules
      (`db-mobile-column-width-title`/`-value-row`/`-slider`/`-value`/`-presets`/`-preset`) and
      added `db-cell-edit-close` visibility for this surface, plus a fill rule so
      `.db-view-config-range`/`.db-new-placement` and their presets span their `.db-panel-row`
      instead of shrinking to content.

      *The two landing defects found while closing report 40:* (1) the panel is created on
      `doc.body` directly and never takes the portal branch that would otherwise add
      `.note-database-container`, so the new shared-class body matched no rule at all and would
      have shipped a different, more silent unstyled surface than the strip it replaced — fixed by
      adding the class explicitly (`column-width.ts:382`). (2) that alone then regressed the
      desktop presentation: `.note-database-container`'s own `position: relative` was beating the
      panel's `position: fixed` at equal specificity — confirmed with a live Playwright DOM dump
      (computed `position: relative`, panel laid out at `y=900` on a 900px desktop viewport, fully
      below the fold) — fixed with `position: fixed !important`, mirroring how
      `.db-mobile-bottom-sheet` already forces the same property for every phone sheet carrying
      this class combination.

      *Keyboard proof, red then green:* `tools/storybook/verify-placement.mjs` mounts the real
      `openColumnWidthAdjuster` on a 390×844 hasTouch/isMobile/is-phone page, focuses the width
      field, and drives both a host-declared `--keyboard-height` and a host-silent
      `visualViewport.height` shrink, asserting the panel's bottom edge and the focused field both
      clear a 331px keyboard (measured off report-40b) and return to the floor once it closes. A
      negative control drives the pre-fix panel's own rectangle (`position: fixed; bottom: 0` and
      nothing else) through the identical simulation and confirms it stays parked at the screen
      bottom instead of clearing the keyboard.

      *Capture reads beside the sort sheet:* the adjuster is now a proper card — rounded top
      corners, grab handle, header row, and (phone captures) a 44×44 close button matching the
      record-detail sheet's chrome — not the flat strip report-40 showed. The slider spans the row
      with the "150" value in a fixed 64px box; the four presets span the row as one segmented
      group with Auto highlighted. `constructed-column-width-adjuster-desktop-{dark,light}.png`
      confirm the desktop fixed-panel presentation is correctly bottom-docked (root-cause fix
      above); `panel-column-width-sheet-mobile-{dark,light}.png` and
      `constructed-column-width-adjuster-mobile-{dark,light}.png` show the phone sheet with the
      same header/handle/close chrome as `constructed-sort-panel-mobile-dark.png`, read side by
      side directly in this session.

      **Landing this entry adds — reconciling `worktrees/039-column-width-sheet`
      (6ab72419/8c67100d) onto `main` across three rebase rounds** (main moved with the WebKit
      sheet fix, `9ecb5fff`, and the reference-capture landing, `04814e24`, then again with the
      settings sheet fix, `60e73216`): `styles.css` auto-merged clean all three rounds (the
      adjuster's scoped rules touched no line any later landing moved), the merged hash moving
      `cc25021e2703` -> `719ba0fca8e1` once the settings sheet's own CSS landed in round 3;
      `screenshots/manifest.json` merged per entry by owner each round (main's entries plus this
      phase's own 6 adjuster entries throughout, 528→550); `tools/lane/css-lane.json` merged as
      main's history plus this phase's own acquire+release pair. Four full detached recaptures
      surfaced 8, 7, 9 and 4 byte-different files against `HEAD` across the three rounds, every one
      pixelHash-identical except the two `field-icon-picker` desktop captures (round 1 only, the
      same documented Chrome/OS antialiasing drift every prior reconciliation already names) — all
      restored to `HEAD` bytes with manifest bytes/pixelHash/layoutHash reset while `sourceHashes`
      carry the current fingerprint. All 6 of this phase's own adjuster captures reproduced
      byte-identical to the pre-rebase committed PNGs across every recapture. 13 of 16
      `tools/live/*.json` evidence artefacts went stale at rounds 1 and 3 (round 2 needed none) and
      were re-run individually rather than hand-edited. A task-number collision surfaced at round 3
      — `003-mobile-sheet-presentation`'s original T28/T29 for this same report collided with the
      settings-sheet branch's independently-numbered T28-T32 once both landed on `main` — resolved
      by renumbering this phase's rows there to T33/T34 (see that packet's own tasks.md). Full-suite
      re-verify on the final landed tree: `npx tsc --noEmit` 0; `npx vitest run` 1073/1073 (103
      files); `npm run lint` 172 (unchanged baseline); `npm run lint:tools` clean; `scan-comments`
      PASS; `node tools/live/sheet-rebuild.mjs` PASS (18 cases, incl. the WebKit anchor-death case);
      `node tools/storybook/verify-placement.mjs` 402/403 (1 declared red, unchanged); `npm run
      screenshots:verify` 0 stale; `npm run gate` 25/25 green.
- [x] T007 Report 41 — the settings sheet. Make the grab handle close it, and replace the desktop two-column `Setting` grid on phone with padded rows so no label wraps against a narrow control and no description clips at the right edge. Restyle through our own host wrapper class, never by patching `Setting` internals. Leg: `worktrees/040-settings-sheet` (`src/settings.ts`, `src/views/modals/db-modal.ts`, `styles.css`)
  - **Root cause**: `render()` made the whole `.db-view-config-panel` the scroller. On phone the panel is the sheet itself, so the grab band and title header — ordinary in-flow children — scrolled off the top edge with the settings content: 1461px of content in a 760px sheet measured the band shrinking to 0px after 200px of scroll, at which point no press anywhere could start the drag-to-close gesture.
  - **Red**: `node tools/live/sheet-rebuild.mjs` case "settings sheet chrome survives its own scroll" observed red pre-fix — grab band 48px -> 0px after a 200px scroll.
  - **Fix**: `dbdec603` split the panel into a fixed header (title + `renderSheetClose`, a 44px close button routed through `overlayStack.dismissPanel`) and a `.db-view-config-body` scroll region that carries the content; `getScrollHost()` reads whichever element is actually scrolling so save/restore-scroll keeps working on both the anchored desktop panel and the phone sheet.
  - **Captures**: `screenshots/panels/constructed-view-config-{desktop,mobile}-{dark,light}.png` and `screenshots/panels/panel-view-config-{desktop,mobile}-{dark,light}.png` (8 total) opened and read — the phone pair shows the grab bar, header with close button, and padded full-width rows; the desktop pair is unchanged in appearance.
- [x] T008 Report 43 — the Add view sheet. Header with a close affordance; the three loose inputs grouped into padded rows; **Title property** as a dropdown row rather than the plain text input it renders as today; **Copy settings from current view** as a toggle row rather than a bare checkbox; the view-type list as chromed rows with chevrons instead of a flat icon list (`src/views/toolbar-renderer.ts`) — `showAddViewMenu` (`toolbar-renderer.ts:1354`): header via `createSheetHeader` (close through the overlay stack, `closeViewTabPopover` fallback); `createAddViewField` wraps each field in `db-panel-row` (`:1274`); the key-field native `select` replaced by `createDropdownField` with the value tracked in a closure (`:1376-1391`); the duplicate control is a `db-checkbox` on a `db-panel-row` (`:1400`); the Create rows gained `chevron: true` via the shared row builder's new non-submenu chevron option (`menu-row.ts:59,112`); the picker filters `list` out of the offered types (`:1415`). Red first: `add-view — header: false`, `add-view — rows: false`, `add-view — dropdown: false`, `add-view — no List view row: false` (the row was offered). The `add-view-popover` screenshot fixture still draws the withdrawn List row and the native select; recapture and fixture update are the CSS lane's
- [x] T009 One subtask per non-conforming instance the inventory ranks, after the three reported ones — the four ranked instances this leg owns: (a) table record peek → on touch, `openTableRecordPeek` routes to the record sheet via the new `openRecordDetail` option (`table-record-peek.ts:50,177`; `database-view.ts:8329`; the harness's `record-peek` branch passes the same hand-off, `render-assertion-harness.ts:3126-3138`), desktop rail unchanged. Red first: `record-peek — mounted without a sheet surface on the body`. (b) the Gantt depends-elsewhere chip's `new Menu()` replaced with `createOwnedMenuForEvent` (`calendar-timeline-renderer.ts:993-1006`; the `Menu` import dropped; the gantt test's assertion updated to the owned menu's row API). (c) the three `FuzzySuggestModal` subclasses keep Obsidian's suggest behaviour and wear the sheet chrome on touch via the new `attachSheetChromeToModal` (`mobile-bottom-sheet.ts:183`), adopted in `main.ts:2982`, `image-file-suggest-modal.ts:40`, `markdown-file-suggest-modal.ts:34` — the same modal-portal move the plugin's modal base already makes for its own subclasses. (d) `GroupOrderModal` deleted (`src/views/modals/group-order-modal.ts`): `rg -n "GroupOrderModal|group-order-modal"` across the repo returns only its own definition, proven dead before removal. The `icon-picker-popover.ts:57` / `option-color-picker.ts:43` / `column-menu.ts:576` popovers named in the original task text are positioner-hosted surfaces the inventory ranks conforming — they stay, and the sheet grammar lane's registry is where any future non-conformance would surface

      **Regression found and fixed verifying (c) at rebase**: `attachSheetChromeToModal`'s returned
      teardown was `attachSheetDragToDismiss`'s release alone, which unbinds the drag listeners but
      never calls `applySheetChrome(modalEl, false)` — the exact freeze `98da630d` (2026-09-02) fixed
      for `DbModal.onClose`, reintroduced for the three `FuzzySuggestModal` hosts: the host's own
      `close()` detaches its `containerEl`, which no longer holds the portalled `modalEl`, orphaning
      it on `document.body` with the backdrop pinned behind it for the rest of the session. Proved
      red by reverting the fix and running `node tools/live/sheet-teardown.mjs`: `FAIL —
      attachSheetChromeToModal with a detached host wrapper — 1 backdrop(s) and 1 sheet(s) left after
      the host wrapper was removed`. Fixed in `mobile-bottom-sheet.ts:183` — the teardown now mirrors
      `DbModal.onClose`'s order (release drag, then `applySheetChrome(modalEl, false)`). Added a
      permanent regression case, `runAttachSheetChromeToModalDetachedHostCase`
      (`tools/live/sheet-teardown-harness.ts`), registered in `runSheetTeardownParity` and in
      `sheet-teardown.mjs`'s `PRE_FIX_FAILURES` map. Green after: 12 producers, 0 leaking.
- [x] T010 [P] Assert that the Add view picker carries no **List view** row. The removal is `specs/006-list-view-deprecation/002-hide-and-migrate`'s; this task owns only the assertion (`tools/live/sheet-grammar.mjs`) — the lane asserts the mounted picker's rows contain no label matching `t("common.listView")`. Red first: `add-view — no List view row: false` (the row was offered, verified against the unchanged tree); green after the picker filter, and the assertion is locale-proofed by reading the label through the bundled `t`
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 Build `tools/live/sheet-grammar.mjs` on `043`'s constructed mount seam: one row per registered surface per grammar element, exit non-zero on any missing element. Register it in `tools/gate.mjs` (`tools/live/sheet-grammar.mjs`, `tools/gate.mjs`) — lane built on `buildRenderAssertionBundle` + `runRenderAssertions`'s `onMounted` hook, phone page (`is-phone`, 390x844, coarse pointer). Registry of five surfaces this leg guarantees: sort-panel, filter-panel, add-view (real toolbar popover), record-detail, record-peek (which routes to the record sheet on the touch page). Red first (unchanged tree, all changes stashed except the contract module and the lane): 14 failures — `header: false` on sort/filter/add-view, `rows: false` and `dropdown: false` on add-view, `keyboard: false` on all four mounted sheets, `add-view — no List view row: false`, `record-peek — mounted without a sheet surface on the body`, plus the negative control's three pre-conditions failing on the non-conforming tree — exit 1, output at `/tmp/sheet-grammar-red.txt` (also quoted in the T003/T008/T009/T010 ticks). Green after the fixes: 35/35 rows PASS, List-view absence PASS, negative control PASS (handle removed from sort-panel → red on that row alone, every other row green, clean re-mount green again) — exit 0. Registered in `tools/gate.mjs:87` (check count comment updated 21→22)
- [x] T012 Run the negative control: remove one grammar element from one conforming surface, observe the check go red on that surface alone, restore by hash. A check that has never been observed red is not evidence (`tools/live/sheet-grammar.mjs`) — the control is built into the lane and self-checking on every run: it mounts the sort-panel, removes its `.db-mobile-bottom-sheet-handle`, and requires `handle` to go red on that surface alone with every other row green, then re-mounts clean and requires green again (`sheet-grammar.mjs` NEGATIVE_CONTROL + `__sheetGrammarNegativeControl`). Observed red: on the unchanged tree the control surface was not green before the removal and the control failed (recorded in the T011 red run); on the fixed tree: `PASS sort-panel green before the removal`, `PASS handle red on sort-panel after the removal`, `PASS every other row still green`, `PASS re-mount clean — handle green again`. The re-mount is the restore; no source hash is needed because the removal is a DOM mutation of the mounted surface, never a source edit
- [x] T013 Recapture, read the changed PNGs by hand, re-baseline the `touch-targets` ratchet with the raise attributed per class, and release the `styles.css` lane (`screenshots/`, `tools/live/touch-targets-constructed-baseline.json`) — CSS lane held (`044-phone-sheet-alignment`, base `cdc0217ad1d7`) across four rebases as `037`/`038`/`039`/`040`/`042`/`006-list-view-deprecation` landed on `main`; final styles.css `0d0d87c3b427`. Two real CSS gaps found only by re-running `verify-placement.mjs`, not by inspection: (1) `.db-add-view-form > .db-panel-row`'s own `margin-bottom`/`padding` double-counted the form's own grid `gap`/`padding`, failing the 2x group-gap ratio (22px vs 14px, wanted ≥28) and the shared-left-edge check (2px drift from the row's own padding) — zeroed both in that context. (2) `.db-panel-header:has(.db-sheet-close)` sits 25px below the grab handle, inside the shared drag band's already-tuned 40px reach for the owned menu; a real hit-test found the band answering a press on add-view's close button as a press on the handle (`1 of 11 controls answered by the band: db-sheet-close`) — given the header 20px more top margin rather than shrinking the band (which would have detuned it for the owned menu it was calibrated against). `verify-placement.mjs`: 395/403 → 402/403 (the same 1 declared red every release carries). The header-margin fix also reaches the settings sheet (`db-sheet-close` shared for grammar conformance, T004's note); `constructed-view-config-mobile-{dark,light}.png` moved a few px of top spacing as a result — read directly, unbroken, extending the same swallow protection rather than regressing it. 30 real content-changed captures opened and read across three full recaptures (552 entries, final pass 0 stale): add-view/toolbar-add-view (header-close, dropdown-not-select, chevron rows, List withdrawn), filter/filter-nested and sort/sort-calendar (title-left close-right, AND/OR grouping unregressed), record-peek (phone photographs the record sheet now, desktop rail unchanged), view-config mobile (header margin side effect). 66 further files across three recaptures confirmed pixelHash+layoutHash-identical to HEAD or, for the largest cluster (timeline/gantt), confirmed by direct visual read (`reference-gantt-desktop-dark`: pixel-identical apart from a documented sub-pixel label-jitter) — restored to HEAD bytes each time. `touch-targets` ratchet: found stale at the packet's own branch base (recorded fixture baseline 279, measured 199 at base `62e7e5c1`, unchanged through the rebase tip and this session's own edits) and corrected to what every measurement agrees on rather than attributed as a raise 044 made; constructed baseline corrected 1223 → 1220, isolated to two `db-icon-only-button` controls the settings-sheet leg (040) resized between the packet's base and the rebase tip — not this release. Lane released with all 30 changed captures named in the release note.
- [x] T014 Update `../roadmap.md` §4 rows 40, 41 and 43 with the measured after-numbers, and this phase's row in `../spec.md`'s Phase Documentation Map (`../roadmap.md`, `../spec.md`) — done after landing on main as `dcff742e`: rows 40/41 got the phase-closing verification line (`npm run gate` 26/26, `sheet-grammar` 6x7 green, `verify-placement.mjs` 402/403); row 43 rewritten from "Open, not started" to Fixed with T008's evidence; `../roadmap.md` §5.A's `044` row and its "Three phases opened"/"Legs in flight" prose updated to Landed; `../spec.md`'s two Phase Documentation Map rows (the hand-authored one and the anchored scaffold-appended one) both updated to Landed.       `045`'s `tasks.md` T013 and `acceptance-criteria.md` AC-005 noted that the `sheet-grammar` lane now exists on main, so the board-card-properties scenario this phase's own T013 needs can now be attempted — left open rather than added here, since registering that scenario is `045`'s own work
- [x] T015 Settings sheet BODY onto the shared row grammar on phone, then register `settings`. Red first after registering `settings` in `tools/live/sheet-grammar.mjs` (body still the two-column grid): `FAIL  settings — rows: false`, `PASS  settings — dropdown: true`, `FAIL  settings — segmented: false` (2 failures, exit 1). Phone `render()` sets `asSheet` (`view-config-panel-renderer.ts:385`); every settings row goes through `rowClass()` (`:310`) → `db-panel-row`; helper text through `hintClass()` (`:315`) → `db-panel-hint`; computed-sync radios become `db-new-placement` (`:1694-1713`); switches become `createCheckbox` (`:2221-2222`). Desktop path untouched: `rowClass()` still emits `db-view-config-row` (`:311`), the native radio cards stay in the `else` (`:1726-1742`), `db-toggle-switch` stays on the desktop switch (`:2223`). Lane after: 7 surfaces × 7 elements PASS, negative control PASS, exit 0. Phone-tree suite `src/views/view-config-panel-renderer.test.ts` asserts `describeSheetGrammar` rows/dropdown/segmented and the desktop grid/radio/switch residue.
  - **Verified and extended in a follow-up pass**: `tsc --noEmit` 0, `vitest` 1145 (110 files, +2 over the conversion's own count), `lint` 172=172 against the pre-existing baseline (no regression), `lint:tools` 0, `scan-comments` 0. Board Cover/Title fixed rows (`board-card-properties-panel.ts`'s `renderFixedSlot`) carried onto the same grammar: an optional `asSheet` on `BoardCardPropertiesActions`, threaded from the renderer's own `this.asSheet` at the one call site (`renderBoardSettings`), picks `db-panel-row` over `db-view-config-row` — desktop callers (stories, existing tests) omit the field and keep the grid. Two new tests (`board-card-properties-panel.test.ts`) pin both branches. `sheet-grammar.mjs`: 7 surfaces × 7 elements PASS, negative control PASS, exit 0.
  - **CSS lane** (`044-phone-sheet-alignment`, re-acquired at `0785e72944dd`, released at `ad1dea7437ad`): retired the phone-only `.db-view-config-row`/`.db-view-config-row + .db-view-config-row`/`.db-view-config-help` overrides the conversion made dead, rather than duplicating their declarations onto `.db-panel-row`/`.db-panel-hint` — those two classes now read the same unscoped §21 PANEL ROWS rules every other phone sheet's rows already read. Reading the recapture (not just the class-presence lane) found two real gaps the retirement alone left open, both fixed as additions to already-shared selectors: (1) a stacked field's own `width: 100%` child pulled the row's flex-basis math toward itself with no floor on the label, so "Source folder", "Source rules" and "New note folder" wrapped to two or three lines — regressing AC-004/C5 ("no label wraps"), already met once by the rule just retired. Fixed with `flex-shrink: 0` on `.db-view-config-panel.db-mobile-bottom-sheet .db-view-config-label`, mirroring `.db-record-detail-field-label`'s own fix for the identical shape. (2) the computed-sync segmented group is the first `.db-new-placement` consumer whose option text is a full sentence rather than one or two words; column-width's own row-filling `min-width: 0` (`.note-database-container .db-panel-row .db-new-placement`) does not reach a word two levels down, so "(recommended)" and "Automatically" bled past their own button into the next one. Fixed with `min-width: 0` plus `overflow-wrap: anywhere` on `.db-new-placement-option` (`anywhere` rather than `break-word` because only `anywhere` counts toward the item's own automatic minimum size) — global, so toolbar's and column-width's own short-label options are unaffected. A new `devices: ["mobile"]` hand fixture, `panel-view-config-sheet` (`tools/screenshots/scenarios/panels.mjs`, `fixtureOf: "constructed-view-config"`), was added because the real capture's own viewport crop never reaches the computed-sync row to photograph it; its registration was red-first against `constructed-capture.test.mjs`'s fixture-declaration snapshot, then added. 4 real content-changed captures read by hand across two recaptures: `constructed-view-config-mobile-{dark,light}.png` (the real renderer, both themes — no label wraps, no description clipped, row density matches the sort sheet) and the two new `panel-view-config-sheet-mobile-{dark,light}.png`. Everything else both recaptures moved (owned-menu, date-picker, filter-panel-nested, record-detail-desktop-dark, board-view/board-subtask-tree, and the full timeline/gantt/reference-gantt family) was pixelHash-identical to HEAD or real-clock date drift unrelated to this change, restored to HEAD bytes with only the styles.css/renderer sourceHash fields carried forward as current. `npm run screenshots:verify`: 0 stale. `touch-targets` ratchet: constructed `under` 1220 → 1214 (an improvement from the checkbox/segmented conversions, not a raise — no re-baseline needed), fixture `under` unchanged at 199 across the new fixture's own added controls. `npm run gate`: 26/26 green, including `evidence` after re-running the 8 artefacts `styles.css`'s hash moved past (`cascade-audit`, `checkbox-appearance`, `checkbox-inventory`, `design-conformance`, `engine-parity`, `surface-census`, `token-census`, `view-census`) — `engine-parity`'s own tracked fixture/renderer geometry gap count moved 49 → 50 (one new entry, the `panel-view-config-sheet` fixture's Source-folder input measuring 193px against the real renderer's 215.31px), left as the same kind of tracked, non-blocking drift the other 49 already are rather than hand-tuned to match. Supersedes `implementation-summary.md`'s "known, unregistered gap" limitation (below).
- [x] T016 Closing leg (in-runtime): register REQ-007's four dropdown families, make three vacuous predicates measure, and keep the settings sheet's body inside its own surface. A fresh review at 07be64fe filed four P1s and a P2 batch against the lane this phase shipped; this task answers all of them.
  - **Predicates, red first.** Rewrote `src/views/sheet-grammar.ts`: `hasPaddedRows` now reads `getComputedStyle` on every `.db-panel-row`/`.db-record-detail-field`/`.db-menu-item` match and requires all four padding sides ≥ 2px (the value `.db-panel-row` itself declares), not just one match's existence; `hasSharedDropdownRows` now fails on a native `<select>` AND on any element naming itself a dropdown without carrying the shared `db-dropdown-` prefix (checked per element, not per class token — `createDropdownField` callers stack extra scoping classes like `db-panel-dropdown`/`db-filter-field-dropdown` onto the same node, which is not a second grammar); `hasSegmentedToggleRows` now recognises `.db-new-placement` (the primitive every surface on this program actually ships) alongside `.db-segmented` (which nothing has ever used, which is exactly why the old check could never go red). Added `hasSafeAreaInset` as the true seventh spec.md column — restoring it in place of the lane's own quietly-substituted "shared dropdown" — measuring `padding-bottom` against the 16px floor `.db-mobile-bottom-sheet`'s own `calc(16px + env(safe-area-inset-bottom))` rule declares (a headless run resolves `env()` to 0, so the floor is what a browser without a device notch can observe). Dropdown stays as an eighth reported column. Red first against the unfixed predicates plus the four newly-registered families: `dropdown` false on sort-panel/filter-panel/settings/board-card-properties (the per-class-token bug), `rows`/`close target` false on icon-picker/option-color-picker, `close target` 30x23 on owned-menu/icon-picker/option-color-picker, `settings` overflowing its own right edge by 2px on `.db-new-placement` — 15 failures, exit 1. Green after: `tools/live/sheet-grammar.mjs` 13 surfaces × 8 columns PASS, every close target 44x44, no surface overflows its own right edge, negative control PASS both directions, exit 0.
  - **Dropdown families, header everywhere.** Registered `owned-menu`, `date-picker`, `icon-picker`, `option-color-picker` in `REGISTERED_SURFACES`, reusing the exact constructed specs `render-assertion-harness.ts` already builds. Operator decision (2026-09-05), superseding REQ-007's original no-title menu-variant draft: every phone sheet gets a header with a title and 44px close, the owned context menu included. `createOwnedMenu`/`createOwnedMenuForEvent` (`owned-menu.ts`) take an optional `title`; `showAt`'s sheet branch builds it via `createSheetHeader` once `close` exists, then moves it to sit under the grab handle (the header would otherwise land after every row, since the caller's own `addRow` calls already ran). Title resolution: the explicit `title` if the caller passed one (`row-menu.ts`'s `row.file.name`, `column-menu.ts`'s `col.label` — both already computed at the call site), else the active view's own tab title read from `.workspace-tab-header.is-active .workspace-tab-header-inner-title` (no `App` reference needed — the menu portals into the same document the tab bar renders in), else a new `menu.title` i18n key ("Menu", 3 locales). `icon-picker-popover.ts`, `option-color-picker.ts`, `date-value-picker.ts` each gained a `label`/`title`/`fieldLabel` option and build the header once, ahead of any re-render, wrapping their existing content in a `.db-panel-row`-carrying body div so the padded-row grammar has something structural and correctly-padded to measure (`display: contents` on the desktop popover, a real flex/block box only under `.db-mobile-bottom-sheet`). Wired real subjects at four production call sites with one already in hand (`database.name`/`view.icon`/`opt.value`/`col.label` via existing i18n strings — `toolbar.toggleDatabaseIcon`, `toolbar.setViewIcon`, `recordIcon.changeRecord`, `conditionalFormat.icon`, `board.groupColor`); left the remaining call sites (table's mobile move menu, board/gallery/calendar/timeline/embedded-database/toolbar "more" menus) on the documented view-name fallback rather than threading a per-call subject through nine more files.
  - **Two real bugs found only by measuring, not by reading the diff.** (1) `setSheetMount`'s early-return branch (a surface already mounted on `document.body`, e.g. the owned menu) never added `note-database-container`, so `.note-database-container .db-sheet-close`'s 44px sizing rule never reached it — measured 30x23 until this branch also carries the class (`mobile-bottom-sheet.ts`). (2) `.db-color-picker-popup`'s own `display: flex` (no `flex-direction`, a row — correct for the small anchored swatch grid it was written for) put the new handle and header on the same row as the grid; the handle's `margin: 8px auto 4px` — an axis-agnostic centring trick that reads as "centre me in my column" on every other sheet's `flex-direction: column` — read as "claim the row's free space on both sides of me" here instead, measuring the header ~247px off the left edge. Fixed with `flex-direction: column` scoped to the sheet presentation (`styles.css`). A third, narrower one: the new `.db-icon-picker-body` wrapper put the search field inside a `.db-panel-row`, and `.db-panel-row input`'s pre-existing 28px-bordered-box rule (written for filter/sort dropdowns) outranked the narrow-viewport media query's full-width-wrap rule by one class, truncating "Search icons and emoji" to "Searc" — restored at three classes' specificity.
  - **A regression this leg's own close-target fix produced, declared rather than patched around.** Once `note-database-container` sits beside the owned menu's own `db-surface` (both in the same shared token-root selector list), removing either alone stops changing anything measurable on that one body-mounted presentation — `db-surface` still does real work on the untouched desktop presentation this specific check never mounts. `verify-placement.mjs`'s own class-ablation check caught this; declared in its `KNOWN` map with the reasoning above, alongside the pre-existing, `016`-owned 41px grab-band shortfall (spec.md's own "out of scope" line for that mechanism) that the same run surfaces. `verify-placement.mjs`: 370/373, 3 declared reds (was 402/403 at this phase's last landing, 373 the current total after 006/list-renderer retirement and other main legs removed superseded checks; genuinely new failures caught and fixed before landing: a 5px sheet-overflow the `.note-database-container`-inherited `scrollbar-gutter: stable` produced on a phone that never draws a persistent scrollbar, fixed by resetting it to `auto` on `.db-mobile-bottom-sheet.note-database-container`).
  - **Settings overflow (report 41's fresh finding, P1-2).** `.db-new-placement-option`'s `overflow-wrap: anywhere` broke "Automatically" and "(recommended)" mid-word without actually keeping the group inside the surface — it still ran 2px past the settings sheet's own right edge at 390/402px. Removed; the group now stacks vertically on a phone sheet (`flex-direction: column`, each option full width, left-aligned) instead of forcing three sentence-length options across one row, so no word needs breaking in the first place. Row/header inset and title size, operator decisions (2026-09-05): one shared `--db-sheet-inset` (16px, `var(--db-space-6)`) replacing the settings header's own 12px/4px asymmetric padding, sort/filter's inherited 8px, and the four new families' inherited zero; the sheet title is `var(--db-font-lg)` (16px) everywhere, retiring the settings-only override that already used the same value. Add view's "Copy settings from current view" toggle reordered to caption-then-control, matching every other toggle on the phone (`toolbar-renderer.ts`).
  - **Captures.** Full recapture (546 entries); 50 content-changed on the first pass, all read: the four new families plus every surface the shared title/inset rules touch (sort/filter/add-view/settings/column-width/toolbar-utilities/column-manager/active-rule popovers/calendar-chart-timeline toolbar options), each confirmed clean — no clipping, no misalignment, the icon-picker "No results" state (report 41-adjacent, review-found) now clear of the category bar with the search field's own fix. `tools/lane/css-lane.json` released at `a40befd29807` naming all 50 — then two more real CSS fixes (the `scrollbar-gutter` overflow and the color-picker's missing `flex-direction`, both found chasing `verify-placement.mjs`'s own failures) moved `styles.css` a second time, caught by `check-lane.mjs` refusing the next gate run rather than by re-checking after every edit. A second full recapture against the corrected stylesheet found 52 content-changed against HEAD: the same 50 plus `constructed-record-detail`/`constructed-record-peek`'s own title-size landing (both confirmed clean) — the lane re-released at `8ed9f0c8f1c5` naming all 52. 26 further captures were pixelHash-identical to HEAD (styles.css's own `sourceHashes` fingerprint touches every manifest entry regardless of layout) and restored to HEAD bytes. `npm run screenshots:verify`: 0 stale. `touch-targets`: PASS, nothing newly under 28px.
  - **Gate.** `npx tsc --noEmit` 0; `npx vitest run` 1129/1129 (108 files — `view-config-panel-renderer.test.ts`'s `describeSheetGrammar` row-measurement assertions retired in favour of the structural half a hand-built no-CSS-engine tree can still answer honestly, the measured half now proven by the real-browser lane); `node tools/naming/scan-comments.mjs` PASS (fixed two wrap-boundary false positives of its own — a prose line starting with "class"/"for," inside a `//` comment, indistinguishable from a keyword-led statement to the heuristic, reworded rather than suppressed); `npm run gate` — **25 green, 0 red for a declared reason** on the corrected tree (an earlier attempt hung at `screenshots-fresh` for environmental reasons — every lane verified individually during that stall, then the orchestrated run itself completed cleanly once the two post-release CSS fixes and the corrected lane landed). `bash validate.sh 044-phone-sheet-alignment --strict` (via the realpath of `.opencode` — the symlinked path silently returns empty output for this script): **RESULT: PASSED**, 0 errors, 0 warnings, after shortening two frontmatter `recent_action` fields to compact form and re-running `backfill-graph-metadata.js` (also via realpath — the symlinked path silently no-ops for this script specifically, distinct from the general save-path rule).
  - **Left open, named rather than silently dropped.** The column-menu sub-popover (REQ-007's fourth named instance) still has no header; its own back-navigation affordance was never evaluated against the "header everywhere" contract. Table/board/gallery/calendar/timeline/embedded-database/toolbar owned-menu call sites still resolve their title through the view-name fallback rather than a threaded per-call subject. AC-006 remains operator-only.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] Manual verification passed — the operator opens all three reported sheets on iOS and reports each as aligned
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Instance source**: `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md`
- **Operator rows**: `../roadmap.md` §4 rows 40, 41, 43
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

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete
- [ ] CHK-022 [P1] Edge cases tested
- [ ] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`. Reports 40, 41 and 43 are provisionally `class-of-bug`, which is why this phase exists rather than three fixes.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep. `rg -n 'body\.createDiv' src` is the producer scan.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests. `applySheetChrome` has six consumers today; the count after must be stated.
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases. N/A here — no path, parser or redaction surface is touched; record that rather than ticking it blank.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed.
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state. Applies: `visualViewport` and `document.body` are process-wide.
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation implemented — the width field's numeric clamp
- [ ] CHK-032 [P1] Auth/authz working correctly — N/A, no auth surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments adequate
- [ ] CHK-042 [P2] README updated (if applicable)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 11 | 0/11 |
| P1 Items | 12 | 0/12 |
| P2 Items | 2 | 0/2 |

**Verification Date**: 2026-09-04
<!-- /ANCHOR:summary -->

---
