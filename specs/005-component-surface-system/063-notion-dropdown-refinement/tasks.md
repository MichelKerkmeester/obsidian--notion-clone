---
title: "Tasks: Notion Dropdown, Menu and Picker Refinement"
description: "Seventeen legs: four that make the reds visible, nine that close them, and four that verify — each naming its command and reading its exit status."
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

- [ ] T001 [P0] Write the trailing-check assertion and observe it RED. Extend the `dropdownPopover`
      marker (`tools/live/constructed-state-assertions.mjs:123`) so it also reports whether
      `.db-dropdown-option-check` is the option row's **last element child**, then run the
      `constructed-dropdown` scenario (`:417-420`) and read `$?`. Expected red on `c9966433`, where
      `dropdown-field.ts:349` creates the check first. **Negative control:** a row built without a
      check must still pass the marker's other assertions, so a green result cannot come from the
      new assertion matching nothing. (`tools/live/constructed-state-assertions.mjs`)
- [ ] T002 [P0] [P] Take the three inventories `plan.md`'s affected-surfaces section names and paste
      their output here: same-class producers
      (`rg -n 'db-dropdown-option-check|db-menu-item-check' src/views styles.css`), consumers of the
      row order (`rg -n 'db-dropdown-option' src tools styles.css`), and the eight-row variant
      matrix {no icon, icon} × {no swatches, swatches} × {selected, unselected}. A leg that changes
      DOM order without this list is guessing at its blast radius. (`specs/.../063-.../tasks.md`)
- [ ] T003 [P0] Acquire the parent's serialized CSS lane hold before any `styles.css` edit, and
      record the acquire entry. The hold permits editing the file; it grants no scope beyond the
      rules T005 and T006 name (parent D7). (`tools/lane/css-lane.json`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T004 [P0] Create the selection check **last** in the dropdown row builder — icon, then label,
      then swatches, then check — leaving `aria-selected` and `aria-activedescendant` untouched.
      `dropdown-field.ts:539` reads the check by class rather than by position and must keep
      working unchanged. Red closed by T001's assertion. **Rulings consumed:** G14, ADR-005, Notion
      N2 (`ac33be32`, `cf573f99`, `53858386`). (`src/views/dropdown-field.ts:349-359`)
- [ ] T005 [P0] Move the check's grid track to the trailing edge in all four variants —
      `.db-dropdown-option` (`styles.css:3237-3241`), `.has-icon` (`:3258-3260`), `.has-swatches`
      (`:3262-3264`), `.has-icon.has-swatches` (`:3266-3268`) — at G14's 16px right inset, and move
      the `dropdown-field` fixture (`tools/screenshots/scenarios/core.mjs:251-256`) with them,
      including the comment that currently explains the leading-check arithmetic. A fixture left
      describing the old order is exactly the stand-in gap `screenshot-currency.md` §3 warns about.
      (`styles.css`, `tools/screenshots/scenarios/core.mjs`)
- [ ] T006 [P0] Add the sheet escalation branch to the dropdown primitive, beside the phone-sheet
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
- [ ] T007 [P0] Keep the desktop search unconditional through the escalation: `dropdown-field.ts:228`
      already reads `searchable = phoneSheet ? … : true` (landed at `a952e5e7`, ADR-006), and the
      escalated sheet opens with that input active and focused. The phone sheet's `> 8` count gate
      is not touched — ADR-006 ruled it the phone's alone, and this packet's ADR-001 records the
      non-adoption. **Red first:** an assertion that the escalated surface carries a focused search
      input, red until T006 exists. (`src/views/dropdown-field.ts`, `src/views/dropdown-field.test.ts`)
- [ ] T008 [P1] [B] Pass `value` on the four submenu parent rows whose child carries a current
      value: `column-menu.ts:128` (Change type), `:144` and `:160` (Number display style), and
      `toolbar-renderer.ts:1312` (Change view type). **`menu-row.ts` is not changed** — the slot is
      already there at `:107-119`, and the two rows that use it today
      (`column-menu.ts:197`, `embedded-database-renderer.ts:2594`) are the in-repo precedent.
      **Blocked on** `052`'s T009 and T008, which own those files: this leg contributes the row
      change to them rather than opening the files alone (D4). **Red first:** an assertion that a
      submenu row whose child carries a current value renders `.db-menu-item-current` before
      `.db-menu-item-chevron` — 2 of 6 today. **Notion:** N1 `213bed5`, `52348672`; N9 count badges;
      our own `052/design-trueup.md` §4 M7. (`src/views/column-menu.ts`, `src/views/toolbar-renderer.ts`)
- [ ] T009 [P1] Give each relative date preset the date it resolves to. **Read
      `src/views/date-value-picker.ts` first** — this packet's research never opened it, and its
      pointer arrived second-hand through `design-trueup.md` G13 before being re-derived at
      `:157-171`. Add one subline element per preset in the secondary-text role, inside the picker's
      unchanged 252px role (`popover-host.ts:229-233`); measure the presets block's height before
      and after; keep every tap target at or above 28px desktop and 44px phone
      (`design-system.md` §9). **Red first:** 0 of 3 presets carry a subline today. **Notion:**
      `cfca14fb`. (`src/views/date-value-picker.ts`, `styles.css`)
- [ ] T010 [P1] [P] Refresh `052`'s two stale completion-criterion "Today:" texts against the landed
      tree — the combobox criterion, which describes a separate in-popover search input that
      `dropdown-field.ts:160-166` no longer builds, and the picker-host criterion, which describes
      three separate `activePickers` WeakMaps that `popover-host.ts` has replaced. **This ticks
      nothing and un-ticks nothing** (D1); it corrects prose that describes a pre-landing tree.
      Runnable immediately and independent of every other leg.
      (`specs/005-component-surface-system/052-dropdown-menu-and-picker-componentization/goal.md`)
- [ ] T014 [P0] Take the colour-picker inventory before touching it, and paste the output here:
      `rg -n 'SWATCH_PICKER_POPOVER|db-color-picker-swatch|db-color-picker-popup|db-color-picker-body' src tools styles.css`
      and `rg -n 'openOptionColorPicker' src`. Known today and to be confirmed, not assumed: the
      width role has exactly one consumer (`option-color-picker.ts:124`), and the stylesheet pins
      `width: 96px` (`styles.css:7277-7294`) over that role's declared 124
      (`popover-host.ts:236-240`), so the rendered panel is 96 and the role is dead weight. A leg
      that widens the role without this list is guessing which surfaces move. (`specs/.../063-.../tasks.md`)
- [ ] T015 [P0] Rebuild the picker as a labelled list (ADR-004, REQ-008). `option-color-picker.ts`
      emits `.db-dropdown-option.has-swatches` rows — 16px leading dot, translated colour name,
      `.db-dropdown-option-check` trailing on the current one — instead of
      `db-color-picker-swatch` buttons, and list navigation replaces `getGridNavigationTarget`
      (`:118`). `SWATCH_PICKER_POPOVER` goes 124 -> **224**, Anytype's measured panel width
      (`052/anytype-menu-grammar.md` G15). Sixteen colour-name keys join `src/i18n/`, and
      `title: color` (`:79`) goes with the swatch it labelled. **Red first:** a new
      `src/views/option-color-picker.test.ts` asserting 16 rows and 0 swatches, observed failing
      with `$?` read against today's 16 swatches and 0 rows. Requires T003's CSS lane hold.
      (`src/views/option-color-picker.ts`, `src/views/popover-host.ts`, `src/i18n/`, `styles.css`)
- [ ] T016 [P0] Delete the grid's own stylesheet block rather than leaving it inert:
      `.db-color-picker-popup`'s `width: 96px` and swatch rules (`styles.css:7277-7322`) and the
      phone sheet's 44px swatch rules (`:12895-12920`). The list takes the family's
      `.db-dropdown-option` geometry, so the phone row's 44px floor comes from `:3188` rather than
      from a rule of its own. Assert afterwards that `rg -n 'db-color-picker-swatch' src styles.css`
      returns 0. Same CSS lane hold as T015. (`styles.css`)
- [ ] T017 [P0] Re-register and re-take the `048` pair, and fix the phone scenario while doing it.
      `field-option-color-picker-mobile-light.png` is currently shape-identical to its desktop twin
      — a 4x4 anchored grid with no sheet and no header — so the registered phone capture has never
      photographed the phone grammar; only the `constructed-` pair does. Update the scenario's
      `sources` to name `option-color-picker.ts`, `popover-host.ts` and `styles.css`, run
      `npm run screenshots`, then `npm run screenshots:verify` and read `$?`, then **open all four
      PNGs and look at them** (`screenshot-currency.md` §1 and §5).
      (`tools/screenshots/scenarios.mjs`, `screenshots/notion-clone/fields/`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T011 [P0] Run the three repository gates and read each output and exit status:
      `npx tsc --noEmit`, `npm run build`, `npx vitest run`. Then `npm run gate` and read `$?`. The
      extended `constructed-dropdown` row must be green **and** must have been observed red in T001
      — a green run that never exercised the change proves nothing.
- [ ] T012 [P0] Re-take the `constructed-dropdown` capture, open the image and read it, then release
      the CSS lane naming every capture whose picture moved. The harness renders fixture markup
      rather than the real renderers (`screenshot-currency.md` §3), so this leg records a **pixel
      read owed** to an image-capable leg for the 16px trailing inset (D5, the `~18:20` ruling in
      `roadmap.md` §6A). (`tools/lane/css-lane.json`, `screenshots/`)
- [ ] T013 [P0] **Operator row — never ticked by an agent.** The operator opens dropdowns, menus and
      pickers on iOS and on desktop and reads them as refined: the check trailing under their own
      theme, the submenu rows saying what is currently chosen, the date presets resolved, the
      escalated sheet appearing on the surfaces they called cramped rather than on others, and the
      colour picker reading as a named list rather than a block of hues.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`, except T013 which only the operator closes
- [ ] No `[B]` blocked tasks remaining
- [ ] Every red in `goal.md` §3 observed failing before its fix, with the command and `$?` recorded
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
- [ ] CHK-003 [P1] Dependencies identified and available — `052` T008/T009 are open, so T008 here is `[B]`
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npx tsc --noEmit` exits 0, output read
- [ ] CHK-011 [P0] No console errors in the constructed lane run
- [ ] CHK-012 [P1] The escalation's no-room case falls back rather than pinning a surface to the viewport top
- [ ] CHK-013 [P1] No new row builder, no new width literal, no second producer for anything that has one
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met, waived or superseded
- [ ] CHK-021 [P0] Every red observed failing first, with its command and `$?`
- [ ] CHK-022 [P1] The eight-row variant matrix from T002 exercised, not just the default row
- [ ] CHK-023 [P1] The negative control in T001 passes, so the assertion cannot go green on nothing
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each finding carries a class: REQ-001 is `cross-consumer` (DOM order read by a fixture, a lane and a selection sync), REQ-002 is `instance-only` × 4 callers, REQ-003 is `instance-only`, REQ-004 is `algorithmic` (a placement condition).
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed (T002), or instance-only status proven by grep.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for the row order — fixture, lane marker, selection sync, and the three context-variant stylesheet blocks.
- [ ] CHK-FIX-004 [P0] N/A — no security, path, parser or redaction surface in this packet. Recorded rather than silently dropped.
- [ ] CHK-FIX-005 [P1] The eight-row matrix and its axes are listed in T002 before completion is claimed.
- [ ] CHK-FIX-006 [P1] N/A — nothing here reads process-wide state.
- [ ] CHK-FIX-007 [P1] Evidence pinned to the fix SHA, not to a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets — nothing in this packet reads configuration
- [ ] CHK-031 [P0] The date subline is rendered as text through the element helpers, never interpolated into markup
- [ ] CHK-032 [P1] N/A — no auth or authorization surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] `spec.md`, `plan.md`, `tasks.md` and `acceptance-criteria.md` synchronized
- [ ] CHK-041 [P1] The comment in `core.mjs:251-256` explains the new arithmetic, not the old
- [ ] CHK-042 [P2] `052`'s two stale criterion texts refreshed (T010)
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
| P0 Items | 13 | 2/13 |
| P1 Items | 12 | 0/12 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-09-06
<!-- /ANCHOR:summary -->

---
