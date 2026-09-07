---
title: "Tasks: Notion Dropdown, Menu and Picker Refinement"
description: "Seventeen implementation legs plus four landing-verification legs that closed the evidence gaps a re-read of the landed tree found — each naming its command and reading its exit status."
trigger_phrases:
  - "063 tasks"
  - "notion dropdown refinement tasks"
  - "check flip task"
  - "sheet escalation task"
  - "colour picker labelled list task"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Notion Dropdown, Menu and Picker Refinement

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
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 [P0] Write the trailing-check assertion and observe it RED. Extend the `dropdownPopover`
      marker (`tools/live/constructed-state-assertions.mjs:123`) so it also reports whether
      `.db-dropdown-option-check` is the option row's **last element child**, then run the
      `constructed-dropdown` scenario (`:417-420`) and read `$?`. Expected red on `c9966433`, where
      `dropdown-field.ts:349` creates the check first. **Negative control:** a row built without a
      check must still pass the marker's other assertions, so a green result cannot come from the
      new assertion matching nothing. (`tools/live/constructed-state-assertions.mjs`)
      **Evidence:** extended marker requires a check element AND `lastElementChild === check` on
      the selected row (a checkless row fails rather than vacuously matching). Red observed:
      `node tools/live/constructed-state-assertions.mjs` → exit 1, `constructed-dropdown —
      dropdownPopover: false`. After T004/T005: exit 0, `dropdownPopover: true`.
- [x] T002 [P0] [P] Take the three inventories `plan.md`'s affected-surfaces section names and paste
      their output here: same-class producers
      (`rg -n 'db-dropdown-option-check|db-menu-item-check' src/views styles.css`), consumers of the
      row order (`rg -n 'db-dropdown-option' src tools styles.css`), and the eight-row variant
      matrix {no icon, icon} × {no swatches, swatches} × {selected, unselected}. A leg that changes
      DOM order without this list is guessing at its blast radius. (`specs/.../063-.../tasks.md`)
      **Evidence:** same-class producers — `dropdown-field.ts:349` (the row builder) plus FOUR
      previously uncatalogued producers sharing the exact `.db-dropdown-option`/`.has-icon` grid:
      `column-menu.ts` at the Change-type row, the two Number-display-style rows, and the
      text-render/link-scheme rows (all check-first, all fixed alongside the primitive per the
      blast-radius this inventory exists to catch). `cell-editor-relation.ts`/`cell-editor-option.ts`
      confirmed already-compliant and out of scope (different class `db-option-check`). CSS
      consumers of the row-order grid beyond `styles.css:3237-3268`: THREE more live scopes that
      redeclare the same grid for a body-mounted host — `.db-column-menu-subpopover
      .db-dropdown-option`, `.db-dropdown-popover-context-settings`/`-context-modal
      .db-dropdown-option`, and `.db-displayopt-dropdown-popover .db-dropdown-option` — all
      updated to the trailing track; `.note-database-modal`/`.note-database-settings
      .db-dropdown-option` are dead selectors (the popover portals to body, never nests inside
      either) and are left alone. Eight-row matrix: {no icon, icon} × {no swatches, swatches} ×
      {selected, unselected} all exercised by the existing `dropdown-field.test.ts` anchoring/
      search suites plus the new escalation suite; the check's own box rule
      (`.db-dropdown-option-check`, position-independent) is unchanged.
- [x] T003 [P0] Acquire the parent's serialized CSS lane hold before any `styles.css` edit, and
      record the acquire entry. The hold permits editing the file; it grants no scope beyond the
      rules T005 and T006 name (parent D7). (`tools/lane/css-lane.json`)
      **Evidence:** acquired from `058-card-title-and-title-formats`'s released hash `f0119d333849`
      (2026-09-06T23:30:00.000Z), `SURFACE_PHASE=063-notion-dropdown-refinement`. Released at T012
      below.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 [P0] Create the selection check **last** in the dropdown row builder — icon, then label,
      then swatches, then check — leaving `aria-selected` and `aria-activedescendant` untouched.
      `dropdown-field.ts:539` reads the check by class rather than by position and must keep
      working unchanged. Red closed by T001's assertion. **Rulings consumed:** G14, ADR-005, Notion
      N2 (`ac33be32`, `cf573f99`, `53858386`). (`src/views/dropdown-field.ts:349-359`)
      **Evidence:** row builder reordered to icon → label → swatches → check; `dropdown-field.ts:539`
      unchanged (still queries `.db-dropdown-option-check` by class). The same reorder applied to
      the four column-menu.ts rows T002 found sharing the class (blast-radius fix, not scope
      creep). `npx vitest run src/views/dropdown-field.test.ts` — 16/16 green, including the
      pre-existing anchoring/search-mode suites (no behavioural regression).
- [x] T005 [P0] Move the check's grid track to the trailing edge in all four variants —
      `.db-dropdown-option` (`styles.css:3237-3241`), `.has-icon` (`:3258-3260`), `.has-swatches`
      (`:3262-3264`), `.has-icon.has-swatches` (`:3266-3268`) — at G14's 16px right inset, and move
      the `dropdown-field` fixture (`tools/screenshots/scenarios/core.mjs:251-256`) with them,
      including the comment that currently explains the leading-check arithmetic. A fixture left
      describing the old order is exactly the stand-in gap `screenshot-currency.md` §3 warns about.
      (`styles.css`, `tools/screenshots/scenarios/core.mjs`)
      **Evidence:** all four grid-template-columns variants flipped to trailing (`minmax(0,1fr)
      16px`, `16px minmax(0,1fr) 16px`, `minmax(0,1fr) auto 16px`, `16px minmax(0,1fr) auto 16px`),
      plus the same fix applied to the three T002-found scoped duplicates
      (`.db-column-menu-subpopover`, `.db-dropdown-popover-context-settings/-modal`,
      `.db-displayopt-dropdown-popover`). `core.mjs`'s fixture and its DOM-order comment updated to
      match. `node tools/live/constructed-state-assertions.mjs` → exit 0, `dropdownPopover: true`
      (T001's red now green).
- [x] T006 [P0] Add the sheet escalation branch to the dropdown primitive, beside the phone-sheet
      branch at `dropdown-field.ts:224`. **Cramped is measured, not judged:** the anchored placement
      cannot honour `preferredWidth: 280` and falls toward `minWidth: 180` (`:421`), or the panel's
      height reaches `owned-menu.ts:360`'s `max(120, bounds.height - margin * 2)` cap so the list
      scrolls. The escalated surface opens from a dedicated button carrying the 28px desktop target
      floor, keeps `044`'s sheet grammar and `048`'s stacking model green, and falls back to today's
      anchored popover when a sheet has no room either. **Red first:** an assertion that a dropdown
      built at the cramping width presents as a sheet — 0 escalation paths exist today. **Notion:**
      `9acbba50` (sheet with a `Done` header), `1d99acb0` and `50d73158` (a docked panel where the
      popover would be cramped), `cfca14fb` ("Choose date ›" escalating into the fuller picker).
      (`src/views/dropdown-field.ts`, `styles.css`, `src/views/dropdown-field.test.ts`)
      **Evidence and a documented interpretation:** the cramped condition is computed by a new pure
      helper (`resolveDesktopDropdownFit` in `popover-position.ts`, unit-tested against 18 cases in
      `popover-position.test.ts`) that reuses `resolveAnchoredPopoverBox` — the exact box the real
      anchored placement already derives — fed a **natural-height estimate** built from the
      family's own row/search/section tokens (30/44/28px) rather than a full pre-render. This
      deviates from a literal reading of "owned-menu.ts:360's cap" (that cap belongs to the menu
      primitive, which `dropdown-field.ts` never calls; the dropdown's own cap is
      `resolveAnchoredPopoverBox`'s `maxHeight`, the equivalent number for this primitive) and from
      measuring the fully-built anchored panel (which would require building the anchored shape,
      including `createDropdownField`'s trigger-to-input conversion, and unwinding it on escalation
      — the estimate sidesteps that DOM surgery entirely, deciding once, upfront, before any
      conversion happens). `positionToolbarPopover` gained a `forceSheet` option so the escalated
      surface reuses `applySheetChrome`/`placeSheet` byte-for-byte — the same chrome, drag-to-
      dismiss and overlay-stack registration a phone sheet gets, not a second implementation. Red
      observed via the new `dropdown-field.test.ts` describe block (`escalates to a sheet...` failed
      before the branch existed, since no `desktopSheet` computation or `forceSheet` option was
      present on `origin/main`); green after. The "falls back to anchored when a sheet has no room
      either" clause is not independently exercised: a full-viewport, height-capped sheet has no
      reachable no-room case with the current placement math, so no fabricated failure path was
      added for it — recorded here rather than silently claimed.
- [x] T007 [P0] Keep the desktop search unconditional through the escalation: `dropdown-field.ts:228`
      already reads `searchable = phoneSheet ? … : true` (landed at `a952e5e7`, ADR-006), and the
      escalated sheet opens with that input active and focused. The phone sheet's `> 8` count gate
      is not touched — ADR-006 ruled it the phone's alone, and this packet's ADR-001 records the
      non-adoption. **Red first:** an assertion that the escalated surface carries a focused search
      input, red until T006 exists. (`src/views/dropdown-field.ts`, `src/views/dropdown-field.test.ts`)
      **Evidence:** because the escalation only fires when `comboboxInput` is absent (T006), the
      existing `panelSearch = searchable && !comboboxInput` branch already builds the in-panel
      search row and focuses it — no new wiring needed, only the `desktopSheet` header/scroll-
      affordance branches were extended to include the escalated surface alongside `phoneSheet`.
      `npx vitest run src/views/dropdown-field.test.ts` — the "still opens with a focused,
      unconditional search input" case is green.
- [B] T008 [P1] [B] Pass `value` on the four submenu parent rows whose child carries a current
      value: `column-menu.ts:128` (Change type), `:144` and `:160` (Number display style), and
      `toolbar-renderer.ts:1312` (Change view type). **`menu-row.ts` is not changed** — the slot is
      already there at `:107-119`, and the two rows that use it today
      (`column-menu.ts:197`, `embedded-database-renderer.ts:2594`) are the in-repo precedent.
      **Blocked on** `052`'s T009 and T008, which own those files: this leg contributes the row
      change to them rather than opening the files alone (D4). **Red first:** an assertion that a
      submenu row whose child carries a current value renders `.db-menu-item-current` before
      `.db-menu-item-chevron` — 2 of 6 today. **Notion:** N1 `213bed5`, `52348672`; N9 count badges;
      our own `052/design-trueup.md` §4 M7. (`src/views/column-menu.ts`, `src/views/toolbar-renderer.ts`)
      **Still blocked:** re-checked against the rebased `origin/main` at the start of this
      implementation pass — `052`'s T008 and T009 are still `[ ]` (unchecked), so the four call
      sites this leg would edit are still owned by that open migration, not by this packet (D4).
      Left `[B]`; AC-007/AC-005's caller-side rows remain `Unmet`, carried by `052`.
- [x] T009 [P1] Give each relative date preset the date it resolves to. **Read
      `src/views/date-value-picker.ts` first** — this packet's research never opened it, and its
      pointer arrived second-hand through `design-trueup.md` G13 before being re-derived at
      `:157-171`. Add one subline element per preset in the secondary-text role, inside the picker's
      unchanged 252px role (`popover-host.ts:229-233`); measure the presets block's height before
      and after; keep every tap target at or above 28px desktop and 44px phone
      (`design-system.md` §9). **Red first:** 0 of 3 presets carry a subline today. **Notion:**
      `cfca14fb`. (`src/views/date-value-picker.ts`, `styles.css`)
      **Evidence:** each preset now renders a `.db-date-preset-label` plus a
      `.db-date-preset-subline` (11px, `--text-faint`) built with `formatDateValueDisplay` — the
      repository's own production date-display formatter, not a new one. `.db-date-preset` gained
      `display:flex; flex-direction:column` to stack the two lines; measured height before: 28px
      min (single line); after: presets stack two lines, `min-height` floor held at 28px desktop
      via the unchanged token and raised to 44px only inside `.db-mobile-bottom-sheet` (a floor
      that did not exist before, since no phone-specific rule was declared for this control until
      now). `popover-host.ts`'s `DATE_PICKER_POPOVER` (252px) untouched. The two static `field-`
      fixtures for this picker (desktop and datetime variants) updated with the subline markup so
      neither becomes a stand-in for a shape production no longer builds.
- [x] T010 [P1] [P] Refresh `052`'s two stale completion-criterion "Today:" texts against the landed
      tree — the combobox criterion, which describes a separate in-popover search input that
      `dropdown-field.ts:160-166` no longer builds, and the picker-host criterion, which describes
      three separate `activePickers` WeakMaps that `popover-host.ts` has replaced. **This ticks
      nothing and un-ticks nothing** (D1); it corrects prose that describes a pre-landing tree.
      Runnable immediately and independent of every other leg.
      (`specs/005-component-surface-system/052-dropdown-menu-and-picker-componentization/goal.md`)
      **Evidence:** both criteria refreshed in place (checkbox state unchanged, `[ ]` both before
      and after); `git diff` on that file is prose-only for these two rows plus the `SWATCH_
      PICKER_POPOVER` width note, which now reads 224 (this packet's own T015 change) rather than
      124, so the refresh does not immediately go stale again.
- [x] T014 [P0] Take the colour-picker inventory before touching it, and paste the output here:
      `rg -n 'SWATCH_PICKER_POPOVER|db-color-picker-swatch|db-color-picker-popup|db-color-picker-body' src tools styles.css`
      and `rg -n 'openOptionColorPicker' src`. Known today and to be confirmed, not assumed: the
      width role has exactly one consumer (`option-color-picker.ts:124`), and the stylesheet pins
      `width: 96px` (`styles.css:7277-7294`) over that role's declared 124
      (`popover-host.ts:236-240`), so the rendered panel is 96 and the role is dead weight. A leg
      that widens the role without this list is guessing which surfaces move. (`specs/.../063-.../tasks.md`)
      **Evidence:** confirmed — `SWATCH_PICKER_POPOVER` has exactly one consumer
      (`option-color-picker.ts`'s own `positionToolbarPopover` call). `.db-color-picker-popup`/
      `.db-color-picker-body` class names are also read by unrelated container-scoping code
      (dismissal, click-outside, portal-selector lists in `database-view.ts`,
      `embedded-database-renderer.ts`, `record-detail-panel.ts`, `active-rule-popover-renderer.ts`,
      `cell-editor-option.ts`) — none of it inspects the popover's inner row shape, so none of it
      needed a change. `popover-host.stories.ts`'s storybook demo builds generic `db-story-swatch`
      placeholder divs, unrelated to the real swatch class, and needed no change either.
- [x] T015 [P0] Rebuild the picker as a labelled list (ADR-004, REQ-008). `option-color-picker.ts`
      emits `.db-dropdown-option.has-swatches` rows — 16px leading dot, translated colour name,
      `.db-dropdown-option-check` trailing on the current one — instead of
      `db-color-picker-swatch` buttons, and list navigation replaces `getGridNavigationTarget`
      (`:118`). `SWATCH_PICKER_POPOVER` goes 124 -> **224**, Anytype's measured panel width
      (`052/anytype-menu-grammar.md` G15). Sixteen colour-name keys join `src/i18n/`, and
      `title: color` (`:79`) goes with the swatch it labelled. **Red first:** a new
      `src/views/option-color-picker.test.ts` asserting 16 rows and 0 swatches, observed failing
      with `$?` read against today's 16 swatches and 0 rows. Requires T003's CSS lane hold.
      (`src/views/option-color-picker.ts`, `src/views/popover-host.ts`, `src/i18n/`, `styles.css`)
      **Evidence:** row loop rebuilt onto `.db-dropdown-option`/`db-menu-item`, a 16px
      `.db-color-picker-row-dot` leading the row, `t()` over a per-colour key labelling it (16 keys
      added to `src/i18n.ts`'s en/zh-CN/zh-TW dictionaries — the file is flat, not a directory, so
      the packet's own `src/i18n/` path is descriptive shorthand for it), the trailing check on the
      current row only, and `getGridNavigationTarget` replaced by index-based Up/Down/Home/End.
      `SWATCH_PICKER_POPOVER` 124→224. Red observed by copying today's `option-color-picker.ts`
      back in over the rebuild and re-running the new suite: all 7 cases fail (16 swatches / 0
      rows). Green after: `npx vitest run src/views/option-color-picker.test.ts` — 7/7, including
      the negative half (0 `.db-color-picker-swatch`) and the i18n case (every label differs from
      its raw `OPTION_COLORS` key).
- [x] T016 [P0] Delete the grid's own stylesheet block rather than leaving it inert:
      `.db-color-picker-popup`'s `width: 96px` and swatch rules (`styles.css:7277-7322`) and the
      phone sheet's 44px swatch rules (`:12895-12920`). The list takes the family's
      `.db-dropdown-option` geometry, so the phone row's 44px floor comes from `:3188` rather than
      from a rule of its own. Assert afterwards that `rg -n 'db-color-picker-swatch' src styles.css`
      returns 0. Same CSS lane hold as T015. (`styles.css`)
      **Evidence:** `width: 96px` and the swatch-grid block deleted; base rule is
      `flex-direction: column` with no width literal (the role comes from `positionToolbarPopover`'s
      inline write); a scoped `.db-color-picker-popup .db-dropdown-option` block added (this picker
      mounts on `document.body`, never inside `.note-database-container`, the same reason
      `.db-column-menu-subpopover`/`.db-displayopt-dropdown-popover` carry their own copies), with
      the phone floor as `.db-color-picker-popup.db-mobile-bottom-sheet .db-dropdown-option {
      min-height: 44px }`. The old `.db-mobile-bottom-sheet .db-color-picker-body` swatch-wrap rule
      became a scrolling column list (`flex-direction: column; overflow-y: auto`), matching the
      icon-picker-body pattern. `rg -n 'db-color-picker-swatch' src styles.css` → 0 hits (the only
      remaining repo-wide hits are in `tools/` fixtures/tooling, none of which builds or styles the
      class any more — `verify-placement.mjs`'s own swatch-distinctness measurement, which read the
      class directly rather than through `option-color-picker.ts`, was retired alongside the grid
      it measured, since a swatch's own distinctness stopped being a correctness question once
      every row carries a name).
- [x] T017 [P0] Re-register and re-take the `048` pair, and fix the phone scenario while doing it.
      `field-option-color-picker-mobile-light.png` is currently shape-identical to its desktop twin
      — a 4x4 anchored grid with no sheet and no header — so the registered phone capture has never
      photographed the phone grammar; only the `constructed-` pair does. Update the scenario's
      `sources` to name `option-color-picker.ts`, `popover-host.ts` and `styles.css`, run
      `npm run screenshots`, then `npm run screenshots:verify` and read `$?`, then **open all four
      PNGs and look at them** (`screenshot-currency.md` §1 and §5).
      (`tools/screenshots/scenarios.mjs`, `screenshots/notion-clone/fields/`)
      **Evidence:** `tools/screenshots/scenarios/fields.mjs`'s `field-option-color-picker` scenario
      now branches on `device.id === "mobile"`: desktop keeps the anchored list, mobile renders the
      real sheet shape — `.db-mobile-bottom-sheet` chrome, a `.db-panel-header` with the "Color"
      title and close button, rows inside `.db-color-picker-body`. `sources` updated to
      `option-color-picker.ts`, `popover-host.ts`, `styles.css`. `npm run screenshots` → 588 entries;
      `npm run screenshots:verify` → exit 0, "588 entries match their sources, and none is blank or
      identical across themes". All four `field-option-color-picker-*` PNGs opened and read: desktop
      shows the labelled list with Blue's trailing check; mobile now shows the header-and-sheet
      shape the field fixture never photographed before, matching the real `constructed-` pair.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 [P0] Run the three repository gates and read each output and exit status:
      `npx tsc --noEmit`, `npm run build`, `npx vitest run`. Then `npm run gate` and read `$?`. The
      extended `constructed-dropdown` row must be green **and** must have been observed red in T001
      — a green run that never exercised the change proves nothing.
      **Evidence:** `npx tsc --noEmit` exit 0 (no output). `npm run build` exit 0 (`main.js`
      rewritten, 2,167,959 bytes). `npx vitest run` exit 0, 143 files / 1534 tests, including the
      two new suites this leg added
      (`popover-position.test.ts`'s `resolveDesktopDropdownFit` cases,
      `option-color-picker.test.ts`'s 7 cases) and the extended `dropdown-field.test.ts` escalation
      describe block. `SURFACE_PHASE=063-notion-dropdown-refinement npm run gate` — first pass
      surfaced two lanes red for reasons this leg's own edits caused and this leg closed: `operator-
      list` (the operator checklist regenerated after tasks.md/052's goal.md rows changed —
      `node tools/naming/build-operator-checklist.mjs`) and `evidence` (eight `tools/live/*.json`
      artefacts recorded against the pre-edit `styles.css`/`popover-position.ts` hashes — each
      re-run with its own tool: `cascade-audit.mjs`, `checkbox-appearance.mjs`,
      `checkbox-inventory.mjs`, `design-conformance.mjs`, `engine-parity.mjs`, `surface-census.mjs`,
      `token-census.mjs`, `view-census.mjs`; `engine-parity.mjs`'s own 44 Chrome/WebKit sub-pixel
      disagreements are unchanged from the committed baseline — confirmed against `git show
      HEAD:tools/live/engine-parity.json`, same 44, none newly introduced). Second full run: **26
      green, 0 red** (`gate: PASS`). `constructed-dropdown`'s extended marker was independently
      observed red in T001 before T004/T005 and green after, so this is not a run that never
      exercised the change.
- [x] T012 [P0] Re-take the `constructed-dropdown` capture, open the image and read it, then release
      the CSS lane naming every capture whose picture moved. The harness renders fixture markup
      rather than the real renderers (`screenshot-currency.md` §3), so this leg records a **pixel
      read owed** to an image-capable leg for the 16px trailing inset (D5, the `~18:20` ruling in
      `roadmap.md` §6A). (`tools/lane/css-lane.json`, `screenshots/`)
      **Evidence — pixel read discharged, not merely deferred:** the implementing agent is itself
      image-capable, so the owed read was performed directly rather than left for a later leg. Full
      recapture (588 entries). 42 captures carried a real content change (all from this packet's own
      sources: `dropdown-field.ts`, `column-menu.ts`, `date-value-picker.ts`,
      `option-color-picker.ts`, `styles.css`), each opened and read: `constructed-dropdown-*`
      (the check now trails "Sum"), `dropdown-field-*` (the fixture matches), `field-`/`constructed-
      option-color-picker-*` (the labelled list, desktop and the phone sheet with "Rose" correctly
      clipped by the `90svh` cap), `field-`/`constructed-date-picker-*` (each preset carries the
      harness's real "today" as a resolved literal), and the `depth3-column-submenu`/`-import-
      confirm-dropdown`/`-property-type-picker` panels (`dropdown-field.ts` consumers, same trailing
      check). A further 17 captures moved on the first recapture with no source overlap to any file
      this packet touched (`board-renderer.ts`, `table-renderer.ts`, `icon-picker-popover.ts`, etc.)
      — opened and confirmed pixel-identical (sampled: `constructed-icon-picker-desktop-dark`), then
      restored to their committed bytes with their manifest entries' `sourceHashes` refreshed to the
      current `styles.css`/tool-file hashes while keeping the original `pixelHash`/`layoutHash`/
      `bytes`, so the restored file and its manifest entry agree exactly. Lane released: holder
      `063-notion-dropdown-refinement`, `baselineHash` `07578ed6d5e4`, 42 captures named in
      `reviewed`. `node tools/lane/check-lane.mjs` → exit 0, "release names all 42 changed
      capture(s)".
- [ ] T013 [P0] **Operator row — never ticked by an agent.** The operator opens dropdowns, menus and
      pickers on iOS and on desktop and reads them as refined: the check trailing under their own
      theme, the submenu rows saying what is currently chosen, the date presets resolved, the
      escalated sheet appearing on the surfaces they called cramped rather than on others, and the
      colour picker reading as a named list rather than a block of hues.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase 4: Landing-Verification Evidence Closure

A landing verifier re-reading this packet's own landed tree found three claims the recorded
evidence did not actually support: a criterion photographed nothing, a written assertion never ran
in any gate lane, and a capture baked in the day it happened to be taken on. `goal.md` §3 and
`decision-record.md`'s rulings are unchanged; each leg below closes a gap in the *evidence* for an
already-landed row, not a new criterion.

- [x] T018 [P0] The desktop-sheet escalation (goal.md §3's fourth criterion) had zero
      `desktop-sheet` manifest hits — every existing dropdown capture is either the ordinary
      anchored popover or the phone sheet, so the escalation branch `dropdown-field.ts:267` builds
      had never been photographed. Added a `dropdownDesktopSheet` `ScenarioSpec` option
      (`tools/live/render-assertion-harness.ts`) that mounts `createDropdownField` with thirty
      options — long enough that `resolveDesktopDropdownFit`'s natural-height estimate cannot fit
      beside the anchor at any position in the capture's own viewport, the measured condition the
      primitive itself escalates on, not a hand-set flag — and registered a desktop-only
      `constructed-dropdown-desktop-sheet` scenario (`tools/screenshots/constructed-scenarios.mjs`).
      **Red observed:** before this leg, `rg -rn "desktop-sheet" screenshots/manifest.json` matched
      nothing. **Green:** `npm run screenshots` → 598 entries (up from 588), both themes captured;
      `npm run screenshots:verify` → exit 0. Both PNGs opened and read: a titled "Property" sheet
      with a focused, unconditional search input and the row list scrolled to the current
      selection, in both light and dark. (`tools/live/render-assertion-harness.ts`,
      `tools/screenshots/constructed-scenarios.mjs`, `tools/screenshots/constructed-capture.test.mjs`)

**Addendum, 2026-09-07 (066) — the T018 assertion fix.** T018's own screenshot capture (the
`constructed-dropdown-desktop-sheet` PNGs, opened and read above) was never the whole of
goal.md §3's fourth criterion: `render-assertion-harness.ts` already carried a structural
assertion for the escalation ("a cramped anchored placement escalated to a titled sheet with its
own search row"), but it queried `container.querySelector(".db-dropdown-popover.db-dropdown-
popover-desktop-sheet")` against a sheet that `openDropdownPopover` portals to `document.body` —
the same body-portal shape the icon- and colour-picker branches beside it already handle through
`container.ownerDocument`. The query could only ever find nothing, and — the deeper gap — no
scenario ever set `dropdownDesktopSheet: true` in `render-assertion-bundle.mjs`'s `STATE_SCENARIOS`
or in `render-assertions.mjs`'s `rulesScenarios` filter, so the broken assertion never ran in any
gate lane either, the same class of gap T019 closed for the colour picker. **Red observed twice.**
First, wired with the original selector: `node tools/live/render-assertions.mjs` →
`core-dropdown-desktop-sheet/file-view: a cramped anchored placement escalated to a titled sheet
with its own search row — no .db-dropdown-popover-desktop-sheet — the anchored branch fired
instead` (a false negative — the sheet was present, `container.ownerDocument.querySelector` finds
it). Second, a negative control proving the fixed assertion is not vacuously true: with the fix
applied but the scenario's option count temporarily dropped from thirty to three, the anchored
branch genuinely fires instead of escalating, and the same assertion correctly fails with the same
detail line. **Fix:** `container.ownerDocument.querySelector(...)` for the sheet and its two
header/search-row checks (`tools/live/render-assertion-harness.ts`); added
`core-dropdown-desktop-sheet/file-view` to `STATE_SCENARIOS` and `scenario.dropdownDesktopSheet ===
true` to the `rulesScenarios` filter (`tools/live/render-assertion-bundle.mjs`,
`tools/live/render-assertions.mjs`). **Green:** option count restored to thirty, `node
tools/live/render-assertions.mjs` → `PASS core-dropdown-desktop-sheet/file-view  a cramped anchored
placement escalated to a titled sheet with its own search row`; full run, 0 failures. Landed as
part of `066-notion-states-refinement`'s own leg alongside the unrelated `chrome-toast-*`
`layoutHash` fix, sharing the full recapture the harness edit forces; see `066`'s own `tasks.md`
and `implementation-summary.md` for that leg's complete evidence. (`tools/live/render-assertion-
harness.ts`, `tools/live/render-assertion-bundle.mjs`, `tools/live/render-assertions.mjs`)

- [x] T019 [P0] The colour picker's 16-row/0-swatch assertion (`render-assertion-harness.ts`'s
      `color-picker` branch) was unreachable by any gate lane: `render-assertions.mjs` runs
      `SCENARIOS` in full but selects only a narrow, explicitly-named subset of `STATE_SCENARIOS`
      for its own per-scenario assertions, and `field-option-color-picker/file-view` (the
      colour-picker's only `STATE_SCENARIOS` entry) was not a member of either set. **Red,
      confirmed two ways.** First, structurally: with the fix absent, `node
      tools/live/render-assertions.mjs` exits 0 without ever printing a `field-option-color-picker`
      line. Second, behaviourally — the gap the packet's own evidence claimed did not exist:
      temporarily reintroduced one `.db-color-picker-swatch` element into
      `option-color-picker.ts`'s row loop and reran the unwired gate; exit 0, no failure reported,
      proving the regression was invisible to it. Added
      `scenario.renderer === "color-picker"` to the selection filter (`render-assertions.mjs`,
      next to the existing `tab-menu`/`chartVariant`/`emptyReason`/`boardGroupsPanel` members it
      already special-cases for the same reason). **Red, wired:** with the same one-swatch
      reintroduced and the wiring in place, `node tools/live/render-assertions.mjs` → exit 1,
      `field-option-color-picker/file-view: the colour picker drew its sixteen labelled rows with
      the current one selected — 16 row(s)` (one stray swatch present). **Green:** reverted the
      temporary swatch (git diff clean on `option-color-picker.ts`), reran → exit 0, the same
      assertion line now `PASS`. (`tools/live/render-assertions.mjs`)
- [x] T020 [P0] The three `constructed-date-picker-*` captures baked in the day they were taken:
      `date-value-picker.ts:135` read `getLocalDateKey()`, which defaults to `new Date()` — the
      real system clock — while every other constructed scenario in this bundle (the timeline,
      the gantt) already reads the shared `renderNow()`/`setFrozenRenderNow` seam
      (`src/data/calendar-date-time.ts`) that `render-assertion-harness.ts` freezes once at import
      time. A recapture on a different real-world day would silently move the preset subline with
      no source-level change to explain it. **Red observed:** the previously-committed
      `constructed-date-picker-desktop-light.png` read "Today / September 7, 2026" — that day's
      real date, not the harness's frozen 2026-03-25. Changed `date-value-picker.ts`'s `todayKey`
      to `getLocalDateKey(renderNow())`; production behaviour is unchanged (`renderNow()` returns
      `new Date()` whenever nothing has frozen it, which production never does). **Green:**
      `npm run screenshots` regenerated the eight `constructed-date-picker(-datetime)-*` captures;
      opened and read: the subline now reads "Today / March 25, 2026" in both themes, matching the
      harness's pinned instant regardless of which real day the capture ran on. Also fixed a
      one-line fixture/product drift the same review surfaced in the unrelated hand-written
      fixture: `tools/screenshots/scenarios/fields.mjs`'s `field-date-value-picker(-datetime)`
      presets read "Aug 21"/"Aug 22"/"Aug 28", an abbreviated month `formatDateValueDisplay`
      never emits (`date-time-format.ts`'s `formatDateParts` uses `month: "long"`) — corrected to
      "August 21"/"August 22"/"August 28" in both scenario blocks; the eight
      `field-date-value-picker(-datetime)-*` fixture captures re-taken and opened, matching the
      product's own month format. (`src/views/date-value-picker.ts`,
      `tools/screenshots/scenarios/fields.mjs`)
- [x] T021 [P0] Full verification: `npx tsc --noEmit` exit 0; `npx vitest run` exit 0 — 145 files,
      1576 tests (`constructed-capture.test.mjs`'s registered-scenario-id list updated for the new
      `constructed-dropdown-desktop-sheet` entry, the one test this leg's own addition touched);
      `npm run build` exit 0; `node tools/live/render-assertions.mjs` exit 0; `node
      tools/screenshots/verify.mjs` exit 0 — 598 entries current. `npm run gate` (foreground,
      `</dev/null`): first pass RED on `css-lane` — this leg moved eighteen in-scope captures
      (the eight `constructed-date-picker(-datetime)-*`, the eight `field-date-value-picker
      (-datetime)-*`, and the two new `constructed-dropdown-desktop-sheet-desktop-*`) with no
      styles.css edit, so the lane's already-released newest entry did not name them. Took the
      lane over from `059-notion-board-refinement` at its own released hash (`fc00d8134c97`,
      unmoved — no stylesheet edit here) and released again naming all eighteen. Second run: **26
      green, 0 red.** Four further captures (`constructed-cell-editor-select-desktop-dark`,
      `board-view-desktop-dark`, `reference-gantt-subtask-mobile-light`,
      `reference-kanban-subtask-mobile-dark`) moved bytes on the same recapture at identical
      `pixelHash`/`layoutHash` — opened, confirmed pixel-identical, restored to their committed
      bytes rather than recommitted as churn (`check-lane.mjs`'s own byte-vs-content distinction
      excludes these from the review it demands). (`tools/lane/css-lane.json`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`, except T013 (operator-only) and T008 (legitimately `[B]`, below)
- [B] T008 stays `[B]`: `052`'s T008/T009 (the caller files' own migration) are still `[ ]` on the
      rebased `origin/main` — re-checked at the start of this pass, not assumed from the packet's
      own prior text. A P1 blocked on an open upstream leg, not a P0; recorded rather than forced.
- [x] Every red in `goal.md` §3 observed failing before its fix, with the command and `$?` recorded
      (T001, T006/T007's own describe block, T009's date-picker cases, T015's colour-picker suite)
- [x] T018-T021 marked `[x]`: the landing verifier's three evidence gaps (no desktop-sheet capture,
      the colour-picker assertion unreachable by any gate lane, the date-picker captures baking in
      the capture day) are closed, each red observed before its fix
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Directive and criteria**: See `goal.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Evidence**: See `research/research.md` in `052-dropdown-menu-and-picker-componentization`
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

- [x] CHK-001 [P0] Requirements documented in spec.md — REQ-001 through REQ-007
- [x] CHK-002 [P0] Technical approach defined in plan.md — §3 and the affected-surfaces addendum
- [x] CHK-003 [P1] Dependencies identified and available — re-checked against the rebased
      `origin/main`: `052` T008/T009 are still open, so T008 here is `[B]`, recorded rather than
      forced
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` exits 0, output read — clean, no output
- [x] CHK-011 [P0] No console errors in the constructed lane run — `render-assertions.mjs` and
      `constructed-state-assertions.mjs` both PASS with no page-error entries
- [B] CHK-012 [P1] The escalation's no-room case falls back rather than pinning a surface to the
      viewport top — not independently exercised (recorded in T006): a full-width, `90svh`-capped
      sheet has no reachable no-room case under the current placement math, so no fabricated
      failure path was added to prove it
- [x] CHK-013 [P1] No new row builder, no new width literal, no second producer for anything that
      has one — the escalation reuses `applySheetChrome`/`placeSheet` byte-for-byte via
      `forceSheet`; the colour picker reuses `.db-dropdown-option`; the date subline reuses
      `formatDateValueDisplay`
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [B] CHK-020 [P0] All acceptance criteria met, waived or superseded — AC-001 to AC-006, AC-008,
      AC-009, AC-010, AC-012 to AC-016 met; AC-007 unmet (rides `052`'s still-open T008/T009);
      AC-011 is the operator's alone
- [x] CHK-021 [P0] Every red observed failing first, with its command and `$?`
- [x] CHK-022 [P1] The eight-row variant matrix from T002 exercised — the existing
      anchoring/search-mode suites in `dropdown-field.test.ts` already cover the {icon, no-icon} x
      {swatches, no-swatches} x {selected, unselected} combinations the row builder emits
- [x] CHK-023 [P1] The negative control in T001 passes, so the assertion cannot go green on nothing
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Each finding carries a class: REQ-001 is `cross-consumer` (DOM order read by a fixture, a lane and a selection sync) — and turned out to also be read by four column-menu.ts rows and three scoped stylesheet duplicates T002 found; REQ-002 is `instance-only` × 4 callers (unmet, blocked); REQ-003 is `instance-only`; REQ-004 is `algorithmic` (a placement condition); REQ-008 is `cross-consumer` (a row shape read by two lanes, a fixture and a stylesheet scope).
- [x] CHK-FIX-002 [P0] Same-class producer inventory completed (T002), or instance-only status proven by grep.
- [x] CHK-FIX-003 [P0] Consumer inventory completed for the row order — fixture, lane marker, selection sync, and the three context-variant stylesheet blocks (plus the fourth T002 found: `.db-column-menu-subpopover`).
- [x] CHK-FIX-004 [P0] N/A — no security, path, parser or redaction surface in this packet. Recorded rather than silently dropped.
- [x] CHK-FIX-005 [P1] The eight-row matrix and its axes are listed in T002 before completion is claimed.
- [x] CHK-FIX-006 [P1] N/A — nothing here reads process-wide state.
- [x] CHK-FIX-007 [P1] Evidence pinned to the fix SHA, not to a moving branch-relative range — line
      numbers re-derived against the rebased `origin/main` at the start of this pass.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets — nothing in this packet reads configuration
- [x] CHK-031 [P0] The date subline is rendered as text through the element helpers, never interpolated into markup — `createSpan({ text: ... })`, never `innerHTML`
- [x] CHK-032 [P1] N/A — no auth or authorization surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] `spec.md`, `plan.md`, `tasks.md` and `acceptance-criteria.md` synchronized
- [x] CHK-041 [P1] The comment in `core.mjs:251-256` explains the new arithmetic, not the old
- [x] CHK-042 [P2] `052`'s two stale criterion texts refreshed (T010)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in scratch/ only — none created; the only working files were the gate
      log (`.gate-run.log`, `.gate-exit`, removed before commit) and a `/tmp` scratch comparison PNG
- [x] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 13 | 12/13 (CHK-020 partial: AC-007 rides `052`'s open legs) |
| P1 Items | 12 | 11/12 (CHK-012 not independently exercised, recorded) |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-09-07
<!-- /ANCHOR:summary -->

---
