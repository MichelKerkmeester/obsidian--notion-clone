---
title: "Tasks: Calendar Anytype Parity"
description: "The ordered legs that retarget the calendar to Anytype, true-up first, the operator's scale ruling second, red-first third."
trigger_phrases:
  - "057 tasks"
  - "calendar anytype parity tasks"
  - "calendar true-up task"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-06T20:30:00Z"
    last_updated_by: "land-057-rebuild-leg-p1"
    recent_action: "T022 landed: phone chip title shrinks, ellipsis inside the cell"
    next_safe_action: "Add a third theme profile for G12, then take G15"
    blockers:
      - "AC-010 is the operator's own device read and nothing in this repository can close it"
      - "Five AC-002 sub-rows stay pixel read owed — a static capture cannot answer hover/focus/press/drag/overflow"
      - "AC-004's layout-tile panel has no measured value in design-trueup.md and is named out of scope"
      - "G12 needs a second-theme capture; G15 is the review's P2-1"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/views/calendar-toolbar-renderer.ts"
      - "src/views/calendar-timeline-toolbar-renderer.ts"
      - "src/data/calendar-date-time.ts"
      - "styles.css"
      - "tools/live/render-assertion-harness.ts"
      - "tools/screenshots/constructed-scenarios.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-tasks"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "T004-T007 landed: the month grid retargeted, AC-003 Met, the gantt confirmed unmoved"
      - "T015 R1-R7, T016, T008, T009 all landed: gate 26 green, gantt confirmed unmoved throughout"
      - "ADR-002 colour question answered by the operator: flatten the timed blocks to chip ink"
      - "T017 landed: 0 device px of the former per-event fills and accent bar across the four recaptured files"
      - "The operator read 0.0.29 beside Anytype and reopened the phase on a gestalt judgement"
      - "T022 (2026-09-06 ~17:12): operator ruled 'Ellipsis inside the cell', superseding the earlier 8ch-floor trade-off; the phone month chip title now shrinks to the segment's own width"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Calendar Anytype Parity

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
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 **The calendar capture true-up, by an image-capable leaf reading the captures px by px.**
      Read all 20 `screenshots/anytype/desktop/sets/<use-case>/anytype-<use-case>-calendar-{light,dark}.png`
      and the 24 `screenshots/anytype/desktop/menus/anytype-menu-calendar-*` and
      `anytype-menu-set-layout-calendar-*` files. Record every value for `spec.md` section 4's nine
      anatomy elements in `design-trueup.md`, each with its capture filename. A value not read off a
      screen is labelled **design inferred**; a leg with no image capability records **"pixel read
      owed"** rather than substituting a DOM reading (`054` ADR-005). **Two absences must be
      established rather than assumed**: A4's unscheduled area and A6's scale switch, each read
      across all twenty set captures before absence is recorded. `050` generalised a single panel
      five times and was corrected five times. (`design-trueup.md`)
      **Done 2026-09-05.** 9 of 9 elements; 28 sub-rows measured with a capture filename, 9 **pixel
      read owed**, 2 labelled `047`-sourced. Both absences established across 10 light + 10 dark.
      Six contradictions recorded (`design-trueup.md` §5), including that the captures are **1:1,
      not 2x**, and that the 24 menu files are **5 distinct menus**, not 6. Five accessibility
      refusals with their ratios (§6).
- [x] T002 **The red-first measurement pass.** Fill every `Today` cell in `checklist.md` with a
      figure read off the current tree, before any code is written. At minimum:
      `grep -o 'db-calendar[a-z-]*' src/views/calendar-renderer.ts | sort -u | wc -l`;
      `grep -o 'db-calendar[a-z-]*' styles.css | sort -u | wc -l`;
      `grep -o "pm-gantt[a-z-]*" src/views/calendar-timeline-renderer.ts styles.css | sort -u | wc -l`
      as REQ-009's baseline; and the pass counts of `calendar-keyboard-navigation.test.ts` and
      `calendar-search-placement.test.ts` as REQ-010's. A `Today` cell written after the fix is a
      cell nobody can check. (`checklist.md`)
      **Done 2026-09-06 on `cc5a7ff2`.** C1, C2, C4, C5, C6 and C7 already carried a figure from
      T001; C3, C8 and C9 carried a mechanism and now carry one: C3 the toolbar's 6-control header
      against Anytype's 3, with the title, nav-button and header CSS read off `styles.css`; C8
      `sheet-grammar.mjs` at exit 0 with 12 surfaces and 31 stacked pairs; C9 the three mandated
      greps (**91**, **133**, **119** raw / **117** real `pm-gantt-*` tokens after excluding two
      comment-prose matches), the 8 `reference-gantt-*.png` MD5s, and `calendar-keyboard-
      navigation.test.ts` + `calendar-search-placement.test.ts` at **16 of 16** passing. Every
      `checklist.md` row now carries a measured figure or a labelled non-measurement (C10 is the
      operator's).
- [ ] T003 **Put the scale question to the operator as ADR-002.** Present what T001 found — one
      Anytype calendar layout, no captured scale switch — against what we ship: three scales
      (`calendar-renderer.ts:82`), a scale control/menu/popover/segment class family, a week body
      with all-day rows, hour gutters and timed events, and `calendar-keyboard-navigation.test.ts`.
      Record the ruling. Never infer it. (`decision-record.md`)
      **The ruling arrived 2026-09-05 ~23:20 during T001** — operator: *"Keep week and day, styled
      to the month grid"* — and is recorded in `decision-record.md` ADR-002 (**Accepted**) and in
      `design-trueup.md` §7 with both branches' consequences. The row stays unticked because the
      tick is the operator's to give, not this leg's.
- [x] T004 [P] **Disposition the unscheduled backlog drawer** (`db-calendar-backlog*`,
      `calendar-renderer.ts:160-163`) against T001's output: matched to a captured Anytype
      counterpart, or kept as ours with a written argument. (`spec.md`)
      **Done 2026-09-06.** The written argument was already carried in `design-trueup.md` §A4;
      this leg landed the restyle it promised — `#EBEBEB`/`#292929` border colour and the plain
      surface background instead of a tinted card — so the disposition is a matched fact, not
      just a written intent.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T005 **Leg A — the renderer.** Retarget the month grid (A1), the day cells (A2), the event
      chips (A3), the today marker (A7) and the day menu (A9) to T001's recorded values. Implement
      ADR-002's scale ruling — if it removes the week and day scales, that deletion is its own
      clearly-labelled leg landed last, so reverting it does not unwind the retarget.
      (`src/views/calendar-renderer.ts`)
      **Done 2026-09-06.** ADR-002 kept both scales (no deletion leg needed). Day number reads
      top-right via a row-reversed heading; today marker is a 26x24 `#216DFA` disc; event chips
      are flat at a 20px pitch; the day/chip menu opens on right-click ("Open note" / "New note"),
      additive beside the existing dblclick-create and `+` button. Month/year title selects and
      the "today scroll" also landed here (the header they belong to is built in this file, not
      `calendar-toolbar-renderer.ts` — see T006's note). `npx vitest run` 1334/1334;
      `calendar-keyboard-navigation.test.ts` and `calendar-search-placement.test.ts` 16/16 with
      `git diff --stat` → 0.
- [x] T006 **Leg B — navigation.** The captured toolbar (A5): month and year selects, arrows, a
      Today button, and the "today scroll" that positions the current week at the bottom of the
      viewport. Where our toolbar and `053`'s view toolbar overlap, name the boundary before
      editing either. (`src/views/calendar-toolbar-renderer.ts`)
      **Done 2026-09-06, split across two files rather than the one named.** The header — title,
      nav buttons, the today scroll — is built in `calendar-renderer.ts`'s `render*Header` methods,
      not `calendar-toolbar-renderer.ts` (which is the settings *popover*, a different surface);
      that half of this task landed with T005. `calendar-toolbar-renderer.ts` itself gained the
      `Show icon` toggle's measured size and colour (A8). The date-property row is not a new
      control: the existing "Event start date field" dropdown in the same popover already serves
      that role, extended to a start/end pair `053`'s view-switcher boundary is unaffected by
      either change.
- [x] T007 **Leg C — the stylesheet, under the parent's serialized CSS lane.** The 133-rule
      calendar block. (`styles.css`)
      **Done 2026-09-06.** Lane taken over from `003-remove-renderer-and-harness` (already
      released, same hash) and released again naming all 38 real-content-changed captures across
      both edits (`tools/lane/css-lane.json`). Every shared `.db-timeline-*`/`.db-calendar-*` base
      rule (title, nav-button, scale control) was left untouched; the retarget lands as separate
      `.db-calendar-*`-only override rules added after it, so the gantt never moves — confirmed
      by its unchanged `pm-gantt-*` count and capture hashes (T012's checks, re-run here).
      `npm run gate` surfaced two of its own findings the first pass missed: the new month/year
      title buttons needed the 28px coarse-pointer floor other calendar nav controls already
      carry (touch-targets), and the `Show icon` toggle's 26x16px size broke this app's own
      "one switch, one shape" rule (design-conformance/placement) — its colour fix stayed, the
      resize was reverted. The month grid's already-undersized 20px chip now renders more of
      itself per cell at the tighter pitch, so `touch-targets-constructed-baseline.json`'s ratchet
      was raised 1213 -> 1320 with its own per-class verification, matching this repository's own
      convention for a measured, cited raise rather than a silent one. `npm run gate`: 26 green.
- [x] T008 **Leg D — the phone calendar, every value labelled.** There is no iOS Anytype calendar
      reference and there will not be one. Each phone value carries **"design inferred from
      desktop"** and names the desktop capture it came from. `044`'s seven-element grammar binds
      every sheet this leg opens. (`src/views/calendar-renderer.ts`, `styles.css`)
      **Done 2026-09-06.** The 44px nav-button floor (`.is-phone .db-calendar-nav-button`) was
      already landed by the earlier stylesheet leg and is confirmed unchanged. What remained,
      **design inferred from the desktop chip row measured in `design-trueup.md` §2c/§A3**: the
      flat 20px-pitch chip's mobile override was still the pre-retarget `height: 18px; padding: 0
      4px; font-size: 11px` (`styles.css`), below the 44px touch floor — the same class of
      deviation `design-trueup.md` §8 names for this exact row, and named again here rather than
      inferred silently. `.is-phone .db-calendar-month-segment` now sets `height: 44px` only,
      keeping the desktop's 12px label and 8px icon gap (the pre-existing `padding`/`font-size`
      shrink is removed rather than kept alongside the new height). Scoped to `.is-phone` rather
      than `body.is-mobile` — a real phone carries both classes together (`capture.mjs`'s own
      mobile profile does too), but a tablet (`.is-mobile` without `.is-phone`) keeps the desktop
      pitch on both the CSS and the JS side, which is the reason this needed a JS-side fix too:
      `calendar-renderer.ts` hardcoded the 20px lane pitch as a literal in three places (the month
      grid's `gridTemplateRows`, its `neededHeight` sum, and `getMonthVisibleLaneLimit`'s
      by-row-height division) and a fourth for the week/day all-day row's own lane pitch, none of
      which read the CSS value — a 44px-tall phone chip inside a CSS-grid track still sized to
      20px would have overlapped the next lane. Added `isPhoneLayout()`/`getMonthChipPitch()`
      (mirroring `calendar-timeline-renderer.ts`'s own `isGanttPhone()` idiom independently, not
      shared with it) and read the same 20/44 value at all four sites. The day/chip context menu
      (`showDayEntryMenu`) is built on `createOwnedMenuForEvent`, the same shared primitive
      `tools/live/sheet-grammar.mjs` already registers as `owned-menu` — it does **not** register
      as a new, twelfth surface, closing `design-trueup.md` §8's open row the other way: nothing to
      add. `node tools/live/sheet-grammar.mjs` still reports 12 surfaces and 31 pairs at exit 0.
      Recaptured every calendar mobile scenario; desktop captures confirmed pixel-identical
      (untouched — the `.is-phone` scoping and the `isPhoneLayout()` check both leave a desktop
      render's code path unchanged). `npm test` 1419/1419, `npx tsc --noEmit` exit 0, gantt
      confirmed unmoved by MD5 and a zero-line diff.
- [x] T009 **The date-property picker** against
      `anytype-menu-set-layout-calendar-date-property-{light,dark}-full.png` (A8). If it changes
      which date property a calendar reads by default, that is a data-visible change and the leg
      names its reversal. (`src/views/calendar-renderer.ts`)
      **Done 2026-09-06, bounded to what is measurable and calendar-owned.** `design-trueup.md`
      §A8 already carries per-option icons and a selected checkmark as **Adopt**, and both already
      existed unmodified: `getDateFieldOptions` already attaches
      `icon: getPropertyDropdownIcon(type)` per row, and the shared dropdown-menu component
      (`dropdown-field.ts`) already renders `.db-dropdown-option-check` with `setIcon(check,
      "check")` on the selected value. What was actually missing was the measured **geometry**:
      the submenu is a **224px** panel of **28px** rows in the capture, against the shared
      component's un-set width and 30px `min-height`. Rather than resize the shared dropdown-menu
      for every consumer in the app — a change this packet does not own, the same boundary
      `design-trueup.md` §A8 already draws for the layout-tile panel ("**out of scope: `053` owns
      the view switcher**") — a new class, `db-calendar-date-field-dropdown`, scopes the 224px
      width and 28px row height to the start/end date-field dropdowns only, leaving every other
      dropdown in the app (including the calendar's own title-field and scale rows, which share
      the same generic `db-calendar-options-dropdown` popover class) at its existing size. The
      divider and `+ Add Property` stay declined exactly as recorded (frontmatter keys are not a
      property registry) — a divider with nothing below it to divide from is not added just to
      claim the row. **No data-visible change**: no default date field moved; this changes only
      the geometry of the picker that chooses one. A new `calendar-toolbar-renderer.test.ts` pins
      the scoping — the geometry class reaches the start/end rows and not the title row — against
      a spy on `createDropdownField`'s call arguments rather than the open popover's own DOM,
      because `createDropdownField`'s real open path needs a real `ownerDocument`
      (`getDropdownPopoverHost`) the test harness's DOM shim does not provide. `npm test`
      1420/1420, `npx tsc --noEmit` exit 0; the closed-row capture is confirmed pixel-identical
      (the geometry only exists once the dropdown opens) and the gantt/timeline toolbar files carry
      a zero-line diff.
      **Corrected 2026-09-06 at the landing, after opening the dropdown in the capture harness's
      own Chrome at DPR 2 and reading the panel's box: neither measured value had actually
      landed.** The width read **280px**, not 224 — `positionToolbarPopover`, which every dropdown
      in the app is placed by, writes a flat `preferredWidth: 280` as an *inline* style
      (`dropdown-field.ts`), and an inline declaration outranks a stylesheet rule, so the scoped
      `width: 224px` was dead the moment it was written. The row height read **29.39px**, not 28:
      `min-height` cannot shrink a row whose content already measures 29.39, so the floor never
      bound. The scoping half was correct and is what the test pins, which is exactly why the test
      stayed green — it asserted the class reached the right two rows, and the class reaching a row
      is not the geometry applying to it. Fixed by carrying `!important` on the width, and only on
      the width, in preference to teaching the shared positioner a per-caller width (a component
      this packet does not own, the same boundary the row already draws), and by tightening the
      row's block padding so the 28px floor binds. Re-measured live: the two date-field rows render
      **224 x 28** and every other dropdown in the same popover stays **280 x 30**, which is the
      scoping assertion and its own negative control in one read.
- [x] T010 **Follow the tests.** `calendar-renderer.test.ts` follows the retargeted shape.
      `calendar-keyboard-navigation.test.ts` and `calendar-search-placement.test.ts` must stay green
      **without modification** — REQ-010's guard. (`src/views/calendar-renderer.test.ts`)
      **Done, held throughout every leg above.** `calendar-renderer.test.ts` gained the two backlog
      tests T015 R7 rewrote and stays otherwise aligned with the retargeted shape (16/16 at every
      check). `git diff --stat 793ab9b4..HEAD -- src/views/calendar-keyboard-navigation.test.ts
      src/views/calendar-search-placement.test.ts` is empty — neither file has a single line
      changed across the whole packet — and both pass at 32/32 combined with `calendar-
      renderer.test.ts` as of the final read.
- [x] T015 **Close the seven residuals a post-landing capture read measured.** Legs A and C landed
      and were then read back against the references by an independent pass; seven differences
      survive, each measured on a named capture rather than noticed. None is a reason to unwind the
      retarget and none is silently accepted. **R1** and **R2** are one defect seen from two sides
      and are P0: the month grid's border box spans device x 112..2815 on
      `screenshots/notion-clone/views/calendar-month-view-desktop-light.png` while its container
      spans 80..2783, so the new 16px inset lands on the **left edge only** and the grid overruns
      its container by 16px on the right (R2); and because the weekday row did take the inset on
      both sides, the two no longer share a column pitch — 377.3 device px against the grid's
      386.2 — so each weekday label's inset from its own day column's right rule drifts **15.5px
      at Monday to 43.5px at Sunday** where the reference holds a constant 11px (R1).
      **R1/R2 done 2026-09-06.** Root cause: `.db-calendar-month-grid` carries both the
      `db-calendar-grid` class (which sets `width: 100%`, content-box) and its own
      `padding: 0 16px`, with no `box-sizing` override — the padding added on top of an
      already-100%-wide content box, so the rendered content stayed a full container-width wide
      and merely shifted 16px right, landing the inset on the left only and pushing the right edge
      16px past the container. Fix: `box-sizing: border-box;` added to `.db-calendar-month-grid`
      (`styles.css:17397`), one line, no other rule touched. **Recaptured and read pixel-by-pixel
      on `screenshots/notion-clone/views/calendar-month-view-desktop-{light,dark}.png`** (both
      themes, identical columns): the grid's 8 vertical rules now sit at device x
      112/489/865/1243/1619/1997/2373/2751, i.e. a 16px CSS inset on **both** edges of the 80..2783
      container, matching the weekday row's own box (which was never the bug — it uses `width:
      auto` and always computed the inset correctly on both sides). Column pitch is now
      **377.0 device px**, matching the weekday row's own 377.3 (previously 386.2, the give-away
      that the grid alone was 100%-of-container wide). The weekday label insets, re-measured off
      their own column's right rule in the same recapture: Sun 12.0px, Mon 11.5px, Tue 11.5px,
      Wed 11.5px, Thu 12.0px, Fri 11.0px, Sat 11.5px CSS — a constant ~11-12px, not the prior
      15.5-43.5px drift. **R3**: the
      week and day scales did not take the month grid's rule colour or today marker, both of which
      the scale ruling names explicitly — the week body's slot lines measure `#F1F1F1`/`#E1E1E1`
      (`styles.css:16922`, `:16931`, untouched) and the today marker measures `#5E33EB` off
      `--db-current-time-color` (`styles.css:18879`, `:18892`, `:18905`), with **zero** `#216DFA`
      pixels anywhere in
      `screenshots/notion-clone/views/calendar-week-time-grid-desktop-light.png`. The weekend
      tint and the nav cluster did land, so this is an unfinished half rather than a reversal.
      **R3 done 2026-09-06, geometry/rule colour only — the open colour question stays open.**
      `.db-calendar-week-slot-line` (base and `.is-hour`) now mix off the literal `#EBEBEB`/
      `#292929` the month grid's day-cell borders use, with a `.theme-dark` pair added, instead of
      the theme's `--background-modifier-border`. The current-time line
      (`.db-calendar-timed-current-line` and its `::before`), the week/day today-number disc
      (`.db-calendar-week-day-num.is-today`, `.db-calendar-week-allday-date.is-today`) and the
      current-time hour-label tick (`.db-calendar-week-hour-label.is-current-time-tick`) now read
      the literal `#216DFA` (white on it) instead of `--db-current-time-color`. That variable is
      untouched at `styles.css:882` and so is every `.db-timeline-*` rule that also reads it — the
      previously-grouped selectors sharing it with `.db-timeline-tick`/`.db-timeline-today-line`
      were split into their own rules rather than repointed, so the gantt's declarations are
      byte-for-byte what they were. **`db-calendar-week-timed-event`'s own per-event colour is
      deliberately untouched** — that is ADR-002's still-open question, not this residual's.
      Recaptured `calendar-week-time-grid-{desktop,mobile}-{light,dark}.png`: **2165** `#216DFA`
      pixels now present in the desktop-light capture (was 0); all eight `reference-gantt-*.png`
      MD5s and a zero-line `git diff --stat -- src/views/calendar-timeline-renderer.ts` confirm
      the gantt did not move.
      **R4**: the week and day headers still build the one-string static title
      (`calendar-renderer.ts:1731`, `:1748`) while only the month header takes the two selects, so
      "the same header grammar" is half true.
      **R4 done 2026-09-06.** `renderCalendarTitle` (the shared static-title renderer week/day both
      called) is replaced by `renderScaleTitleSelects`, the same two-button
      `db-calendar-title-select` component the month header uses, opening the same shared
      dropdown-menu listbox — button text stays each scale's own range/day text
      (`parts.main`/`parts.year`, week and day have no single "current month" a month view has),
      and choosing an option calls a new `navigateCalendarTitleTo`, which jumps that scale's anchor
      into the picked month/year, clamping the existing day-of-month to the target month's last day
      rather than always resetting to day 1. `calendar-renderer.test.ts` (15/15) and the two guard
      tests (16/16) stay green with no modification; `npx tsc --noEmit` exit 0. **R5**: the day number's ink sits **18px** below the
      cell top and **7-8px** inside the right rule against the reference's 12px and 5px — the
      12px heading padding is applied above a flex row that then centres a 16px line, so the
      padding and the ink offset are not the same number.
      **R5 done 2026-09-06.** `.db-calendar-day-heading` switched from `align-items: center` to
      `flex-start`: centring let the row's height — set by the `+` add button, taller than the
      number's own line box — push the number down past its padding, so the two numbers were
      never the same. Flex-start makes the padding the offset directly. The number also took
      `line-height: 1` to remove the font's own half-leading slack. Padding tuned by measurement
      (`calendar-month-view-desktop-light.png`, a non-weekend, non-today cell) from
      `12px 6px 2px` to `9px 3px 2px`: ink top offset measured **12px CSS** exactly (was 18px, a
      6px miss) and right inset **5px CSS** exactly (was 6px, a 1px miss) — both now match the
      reference. The today-state disc (7px top padding override, unchanged) still reads clean at
      the same read-back. `npm test` 1418/1418, `npx tsc --noEmit` exit 0, gantt confirmed
      unmoved by MD5 and a zero-line diff. **R6**: the weekday labels read `Sun`
      `Mon` on a Sunday-start week against the reference's two-letter Monday-start `Mo` `Tu`; the
      design read trued the *week start* as configurable and ours a superset, and never trued the
      **label form**, so this is an unmeasured element rather than a declined one.
      **R6 done 2026-09-06, label form only — week-start configurability is untouched.**
      `getWeekdayLabels` (`src/data/calendar-date-time.ts`) now slices its `Intl.DateTimeFormat`
      `weekday: "short"` result to two characters — a no-op for any locale whose own short form is
      already two characters or fewer — matching the reference's `Su` `Mo` `Tu` `We` `Th` `Fr` `Sa`
      form. Which day starts the week is unchanged (still locale/`calendarFirstDayOfWeek`-driven);
      only the label's character count moved. `getWeekdayLabels` is shared with the date-field
      picker's own mini calendar, so its captures moved too — read back
      (`constructed-date-picker-desktop-light.png`), the picker already renders its weekday row
      upper-cased by its own CSS, so the two-letter form reads as `SU MO TU WE TH FR SA`, unchanged
      in kind. `npm test` 1418/1418, all eight `reference-gantt-*.png` MD5-unchanged. **R7**: the
      unscheduled drawer renders its header and its `Nothing unscheduled.` empty line at full
      height above the grid even at zero items — 85 CSS px on desktop, more on the phone — above a
      surface the reference does not have at all; the drawer was kept as ours with an argument,
      but its **empty state and its placement** were never dispositioned.
      **R7 done 2026-09-06 — the placement question closes with it: an empty drawer renders
      nothing.** `renderUnscheduledBacklog` (`calendar-renderer.ts`) now returns before creating
      any element when `collectUnscheduledTimelineRows` is empty, so the drawer, its header and
      its empty line are all absent rather than present at zero items — the reference's own
      "no surface here at all" for this case. The now-unreachable `.db-calendar-backlog-empty`
      rule is removed from `styles.css`; `db-calendar-week-timed-event`'s gantt counterpart
      (`calendar-timeline-renderer.ts`'s own `renderUnscheduledBacklog`, `db-timeline-backlog-*`)
      already returned early on empty and is untouched. `calendar-renderer.test.ts`'s backlog test
      is rewritten (the old one asserted the now-removed empty-line markup) into two: one proving
      no `.db-calendar-backlog` renders with zero unscheduled rows, one proving it still renders
      with one. The `calendar-month-view`/`calendar-week-time-grid` hand-mock fixtures
      (`tools/screenshots/scenarios/temporal.mjs`) drop `calendarBacklogEmptyMarkup` and its two
      call sites, since both fixtures carry zero unscheduled rows and depicting the drawer there
      would now depict removed behaviour; `temporal-tick-parity.test.mjs`'s two assertions against
      that helper are dropped with it. `tools/live/replay.mjs`'s held claim for `039` is updated
      in place — the calm-empty marker it pinned is superseded by this fix, recorded as such rather
      than silently broken, and its probe now checks the drawer's absence instead. `npm test`
      1419/1419 (net +1), `npx tsc --noEmit` exit 0, gantt confirmed unmoved by MD5 and a zero-line
      diff. (`styles.css`, `src/views/calendar-renderer.ts`)
- [x] T016 **Verify the chip's leading icon on a capture that carries one.** The design read adopts
      the chip's leading icon and the `Show icon` toggle that gates it. The toggle landed and is
      sized and coloured, but **no chip in any of the 28 recaptured calendar images renders an
      icon**, so the icon half of that row is currently unverified rather than confirmed — the
      fixtures and constructed scenarios may simply carry no icon data. Either give one scenario a
      record icon or record the icon row as unverifiable from this corpus. (`tools/screenshots/scenarios/temporal.mjs`)
      **Done 2026-09-06.** The gap was upstream of any fixture: every calendar scenario's harness
      bag (`tools/live/render-assertion-harness.ts`'s `fileViewCalendarBag`/`embedCalendarBag`)
      stubs `renderRecordIcon: () => null`, so no calendar capture could ever have exercised the
      real icon path regardless of what data a fixture carried. Added a new opt-in `ScenarioSpec`
      option, `calendarRecordIcon`, mirroring the table's own `recordIconColumn` wiring: when set,
      the config takes `showRecordIcon: true` plus a `recordIconField` pointed at a text column,
      one bench row's frontmatter carries an emoji token, and the bag's `renderRecordIcon` calls
      the real `renderRecordIcon` helper instead of the stub.
      `constructed-calendar-month` (`tools/screenshots/constructed-scenarios.mjs`) now sets this
      option; its note is corrected at the same time ("with its unscheduled backlog" was already
      stale — every bench row carries an event date, so the drawer was always empty and T015 R7
      now omits it entirely). Recaptured: every chip in
      `constructed-calendar-month-desktop-light.png` carries a leading icon, one the real emoji
      variant and the rest the default file-icon fallback. `npm test` 1419/1419,
      `npx tsc --noEmit` exit 0, gantt confirmed unmoved by MD5.

**Ancillary, not a numbered task: the two calendar toolbar headers `051` could not reach.**
`051`'s own header-componentization leg named `calendar-toolbar-renderer.ts:89` and
`calendar-timeline-toolbar-renderer.ts:69` as blocked-on-057 in its `tasks.md`. Both settings
popovers' hand-built `db-panel-header`/`db-panel-title` pairs are replaced with
`buildShellHeader(panel, { title, onClose })`, the same call every other migrated site in that
packet uses — `calendar-timeline-renderer.ts` (the gantt itself, a different file from its own
toolbar) is untouched, a zero-line diff. Recorded with file:line in `051`'s own `tasks.md` as its
addendum. `node tools/live/sheet-grammar.mjs` still 12/31 at exit 0; `npm test` 1420/1420;
`npx tsc --noEmit` exit 0; both popovers recaptured and read back showing the grab handle, centred
title and 44x44 close on phone.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T011 **Leg E — the gate.** `npm run gate`, exit status read from `$?` and never through a
      pipe. Then `node tools/live/sheet-grammar.mjs`: 12 surfaces and 31 stacked pairs green.
      **Done 2026-09-06.** Foreground, isolated: `npm run gate </dev/null > "./.gate-$$.log" 2>&1;
      echo $? > "./.gate-exit"` → **0**, read from the file, never through a pipe. **26 green, 0
      red** — the first attempt (before the css-lane release and the evidence refresh below)
      surfaced three real gaps this leg then closed: `css-lane` (the held lane had never been
      released), `screenshots-fresh` (the manifest had drifted across several capture rounds), and
      `evidence` (8 of 15 live artefacts were measured against an earlier `styles.css` hash). All
      three are green on the re-run. `node tools/live/sheet-grammar.mjs` separately: exit 0, 12
      surfaces, 31 stacked pairs, unchanged throughout every leg.
- [x] T012 **The gantt did not move.** Re-read T002's `pm-gantt-*` baseline and the gantt capture
      hashes. `037`'s in-repo parity was 60 of 60 classes with zero divergence at `30c4b746` and
      must stay so. Any move is explained by a named gap, never rebaselined silently. (REQ-009)
      **Re-verified 2026-09-06 on the fully-landed tree.** `grep -o "pm-gantt[a-z-]*"
      src/views/calendar-timeline-renderer.ts styles.css | sort -u | wc -l` → **119**, unchanged;
      `calendar-timeline-renderer.ts` is still **4317** lines; `git diff --stat
      793ab9b4..HEAD -- src/views/calendar-timeline-renderer.ts` is empty, zero lines touched
      across every leg of this packet; all eight `reference-gantt-*.png` MD5s unchanged from T002's
      recorded values, re-checked after every capture run this packet made.
- [x] T013 **Count the unlabelled phone values.** Every phone-calendar value must carry **"design
      inferred from desktop"** with its source capture. The count of unlabelled ones must be **0**.
      (REQ-007)
      **Done 2026-09-06.** AC-007's scope is values *this packet writes*, not every pre-existing
      `.is-phone`/`body.is-mobile` calendar rule (several predate this packet, e.g. the scale
      segment→menu swap and the week timed-event's compact phone type sizes, which are `039`'s and
      untouched here). This packet's own phone-specific calendar values are exactly two: the
      `.is-phone .db-calendar-nav-button` 44px floor (T007, landed before this session, labelled in
      its own `tasks.md` entry against the measured 20px desktop button and the 28px coarse-pointer
      rule it closes the gap on) and the `.is-phone .db-calendar-month-segment` 44px chip height
      (T008 above, labelled against the measured 20px desktop pitch). `git diff 793ab9b4..HEAD --
      styles.css` shows exactly one new phone-scoped calendar selector added this session
      (`.is-phone .db-calendar-month-segment`), and it carries its label. Unlabelled count: **0**.
- [x] T014 **Capture and document.** Recapture the calendar, run `npm run screenshots:verify`, and
      write `implementation-summary.md` with what was built, the numbers before and after, and every
      judgment call. Refresh `../changelog/` for this phase.
      **Done 2026-09-06, with one row named rather than filled.** `node tools/screenshots/capture.mjs`
      run in full twice at the close of this leg; `node tools/screenshots/verify.mjs` exit 0, 558
      fresh. `implementation-summary.md` is rewritten in full for every leg this document covers,
      with the before/after value for each residual and the judgment calls named in its own Key
      Decisions table. **`../changelog/` does not exist anywhere under `specs/` in this repository**
      — checked (`find specs -iname "changelog*"`, no match) rather than assumed. The repository's
      actual changelog is the root `CHANGELOG.md`, gated by a version bump rather than a phase
      landing, and this phase has not shipped in that sense (AC-010 is still open, goal D9: shipped,
      verified and operator-confirmed are three states). Writing a root-changelog entry for
      unshipped, operator-unconfirmed work would overstate status, so this row is recorded as a
      named gap against a path that is not this repository's convention, not filled with an
      invented entry.
- [x] T017 **The week and day timed blocks take the month chip's flat ink.** The operator answered
      ADR-002's open colour question on 2026-09-06 ~04:45, verbatim *"Flatten to chip ink"*, after
      this packet's stylesheet legs had already landed and been captured. Repainting every timed
      block is a visible change to a shipped surface and owes its own recapture and read-back, so it
      is carried here with a threshold rather than folded in unmeasured.
      (`styles.css`, `src/views/calendar-renderer.ts`)
      **Red today, measured on `screenshots/notion-clone/views/calendar-week-time-grid-desktop-light.png`
      at DPR 2**: `.db-calendar-week-timed-event` (`styles.css`) carries a
      `3px solid var(--db-calendar-event-accent, var(--interactive-accent))` left bar and a
      `linear-gradient` of `var(--db-calendar-event-bg, ...)` over `--background-primary`, so the
      body of the time grid holds **138,411** device px of `#DEEAF1`, **9,873** of `#E6EFEA` and
      **8,336** of `#F9E9D8` — three distinct per-event fills — with a `#1E3A8A` accent bar at each
      block's left edge.
      **Green when**: the same read of the same capture returns **0** device px of any per-event
      fill and **0** of any per-event accent bar inside the time-grid body, with the block reading
      the month chip's own flat ink (`.db-calendar-month-segment`: `background: none`, `border: 0`,
      `border-radius: 0`, `color: #292929`) and the per-event distinction carried in the title text
      exactly as the month chip carries it. The block's **height stays duration-proportional** —
      ADR-002's geometry half is settled and this ruling does not reach it — and
      `db-calendar-timed-current-line`, the today disc and the slot lines keep the `#216DFA` /
      `#EBEBEB` pair T015 R3 already landed. The gantt's own `db-timeline-*` colours are not this
      row's to touch: `git diff --stat -- src/views/calendar-timeline-renderer.ts` must stay empty
      and all eight `reference-gantt-*.png` MD5s identical, the same guard every leg here held.
      **Done 2026-09-06.** `.db-calendar-week-timed-event` (`styles.css`) dropped its
      `border-left`, `background-color`/`background-image` and `box-shadow`, taking
      `background: none`, `border: 0`, `border-radius: 0` and the literal `#292929` /
      `#DDDDDD` ink pair `.db-calendar-month-segment` already carries; `.db-calendar-
      week-event-title`'s own explicit colour is removed so it inherits that ink the same
      way `.db-calendar-month-title` does from its own parent. A duplicate, fully-subsumed
      declaration of the same selector eleven rules above (position/z-index/padding, all
      three already repeated in the rule this leg rewrote) is deleted rather than edited
      twice, a zero-behaviour-change cleanup that also makes the selector unique for the
      pinned-values test below. No separator rule was added between adjacent blocks: with
      the fill gone, the week grid's own slot lines (`.db-calendar-week-slot-line`, T015
      R3's `#EBEBEB`/`#292929` pair) show through in its place, the same "cell surface
      shows through" reasoning the month chip already reads under — recorded as the
      chosen disposition rather than left silent. **Green, recaptured and read at DPR 2**:
      `calendar-week-time-grid-{desktop,mobile}-{light,dark}.png` (4 files, the hand-mock
      fixture the red value was measured on) each return **0** device px of `#DEEAF1`,
      `#E6EFEA`, `#F9E9D8` and `#1E3A8A` inside the time-grid body — a full per-pixel scan
      of every file, not a sampled region. `constructed-calendar-week-*` and `constructed-
      calendar-day-*` (real renderer, both scales, both themes, both devices — 8 more
      files) return the same **0** and stayed pixelHash-identical to their pre-leg
      manifest entries, because the bench data behind those two scenarios carries no
      timed event inside the captured viewport; a full `node tools/screenshots/capture.mjs`
      run confirms the constructed pair moved no pixel while `calendar-week-time-grid-*`
      did. `src/views/calendar-pinned-values.test.ts` gained a sixth pin asserting
      `background: none`, no `border-left`, `border-radius: 0` and the light/dark ink pair
      on this exact selector; the negative control (reintroducing the old `border-left` +
      `background-color` declarations) turned it red, then the restore turned it green
      again. `npx tsc --noEmit` exit 0; `npm test` 1437/1437 (net +1); `npm run build`
      exit 0 with `main.js` unmoved (a stylesheet-only and test-only change bundles
      nothing). `git diff --stat -- src/views/calendar-timeline-renderer.ts` stays empty
      and all eight `reference-gantt-*.png` MD5s are byte-identical to T002/T012's
      recorded values; `pm-gantt-*` stays **119**. `screenshots/project-manager/` carries
      no diff at all. The css-lane (`tools/lane/css-lane.json`) gained a new release entry
      naming the four captures this leg actually moved, `baselineHash` advanced to the new
      `sha256(styles.css)` slice, and `node tools/lane/check-lane.mjs` under
      `SURFACE_PHASE=057-calendar-anytype-parity` reads exit 0. `node
      tools/screenshots/verify.mjs` exit 0, 562 fresh (three unrelated captures the same
      full run re-encoded byte-for-byte with no pixelHash change —
      `constructed-option-color-picker-desktop-{dark,light}` and `board-view-desktop-dark`
      — were restored to their committed bytes rather than carried as unreviewed noise,
      with the manifest's own `bytes` and `sourceHashes.styles.css` fields reconciled to
      match).

      **Independently re-verified 2026-09-06 by a second reader that decoded the PNGs with
      its own inflate/un-filter pass rather than reusing `pixel-hash.mjs`.** Every claim
      above reproduced. Full-image colour histograms of the four recaptured files return
      **0** px of `#DEEAF1`, `#E6EFEA`, `#F9E9D8` and `#1E3A8A` — and **0** of the dark
      theme's own former tints `#253652`, `#1E3E2A`, `#53331C` and its `#BFDBFE` bar,
      which the green value above did not name and which had never been zero either. The
      red values are the desktop-light file's alone and are restated here with their file:
      **138,411 / 9,873 / 8,336** with a **3,496** px bar on
      `calendar-week-time-grid-desktop-light.png`, and **21,708 / 2,572 / 1,059** with the
      same 3,496 px bar on `-mobile-light.png`. The pinned ink now appears at an identical
      count in both themes — 1,611 px of `#292929` light against 1,611 of `#DDDDDD` dark on
      desktop, 225 against 225 on phone — which is what a title that inherits one ink pair
      looks like. The negative control was re-run from the merged tree: restoring a
      `background` fill on the selector turns the new pin red and the other five green,
      then the restore turns all six green. The constructed pair was checked for the
      stronger claim rather than the byte one: `constructed-calendar-week-desktop-light.png`
      held **0** fill px *before* this leg as well, so its byte-identity is the bench data
      carrying no timed event in frame, not a capture that failed to refresh.

- [x] T018 **A phone-width timed block in an overlap column now renders as nothing.**
      Found by the T017 verification read, recorded rather than fixed because the remedy is
      a width decision the *"Flatten to chip ink"* ruling does not reach — ADR-002 puts a
      gap between blocks outside its own colour ruling and calls it geometry.
      (`styles.css`, `src/views/calendar-renderer.ts`)
      **Red today, measured on `screenshots/notion-clone/views/calendar-week-time-grid-mobile-{light,dark}.png`
      at DPR 2**: with no `--db-calendar-col-width` set (the default fit-to-width mode), a
      phone's seven week columns are ~41px each. An overlapping pair splits that in half —
      `left: calc(0% + 4px); width: calc(50% - 8px)` from `renderWeekTimedEvent` — leaving
      about 12px of block and, after `.is-phone .db-calendar-week-event-content`'s own
      padding, no room for a title at all. The two blocks at 14:00-15:30 and 14:30-15:00
      used to read as an orange and a blue bar; they now decode as **one clipped glyph and
      zero ink** respectively. This is a loss the flatten caused: the fill was carrying
      "an event is here" on its own, and the title cannot.
      **Green when**: an overlap-column block at a phone's default column width is
      distinguishable from empty grid in the decoded capture — a non-zero ink or rule count
      inside its own rect — without reintroducing a per-event fill. The candidate remedies
      are a minimum column width, a wrapped rather than clipped phone title, and the 1px
      shared hairline ADR-002 declined; **which one is the operator's call**, because each
      changes a value the ruling settled or a geometry the ADR froze. Nothing else about
      T017 is affected: desktop reads correctly at both themes, and the block's
      duration-proportional height is untouched.

      **Landed 2026-09-06 ~08:55, operator, verbatim option: *"Phone week scrolls horizontally
      with a minimum column width."*** Recorded as `decision-record.md` ADR-005 and
      `roadmap.md` §6A. `.is-phone` week/day time grid columns now read
      `minmax(var(--db-calendar-phone-week-col-min, 80px), 1fr)` (`styles.css`) instead of
      `minmax(0, 1fr)`. Below that width the grid overflows inside its own scroll boxes rather
      than shrinking further: three synchronised tracks (header day-names, all-day segments,
      timed-event columns), each independently `overflow-x: auto` since the header/all-day pair
      sits inside the vertically `position: sticky` wrap and a single new scrolling ancestor
      there would swallow that stickiness. `syncPhoneWeekHorizontalScroll`
      (`calendar-renderer.ts`) mirrors `scrollLeft` across the three and scrolls today's column
      into view on open. The hour gutter is a separate, un-scrolled 52px grid column in each
      row, so it never leaves the viewport. Desktop is untouched — every rule is
      `.is-phone`-scoped, added beside the shared defaults rather than edited into them.

      **The minimum is 80px, and it is not the month grid's cell.** The first pass took the
      ruling's parenthetical literally and landed 45px. Measured at DPR 2 on the recaptured
      files, the phone month grid's cell is a 87.4 device px pitch (43.7 CSS px) with 84-86
      device px of content, so 45px is faithful to the wording — and fails the sentence beside
      it. A day carrying two events in the same hour splits its column, and the halved block
      pays the block inset and the content padding out of that half: at 45px its title paint box
      is **4.5px and 0.5px**, zero glyphs, and the recaptured 45px files decode **8 and 2 device
      px** of title ink for the pair against **4 and 0** before the fix — a partial "D" and a
      sliver of "1" either way. Swept on the same fixture, the split block's paint box goes 14px
      at 64px (one glyph), 18px at 72px (two), and **22px at 80px — three glyphs plus the
      ellipsis**, the legibility an UNSPLIT block already has at the month cell's own width. A
      literal first word would need 114px. 80px is also the floor
      `getCalendarColumnWidthRange` already clamps a dragged desktop week column to; the two
      figures arrived independently and agree.

      **Read on the landed captures, at DPR 2.** `calendar-week-time-grid-mobile-light.png`'s
      day column pitch is exactly **160 device px = 80 CSS**, and its unsplit titles are whole
      rather than clipped: "Figma sync" goes from 5 glyph runs over a 33 device px extent
      ("Fig…") at 45px to **9 runs over 118 device px** — the entire title. Sunday through
      Wednesday sit in frame and the rest pans, which is the trade the ruling chose.

      **Red confirmed, then green, through the real renderer.** The DOM proxy in
      `render-assertions.mjs` (`calendarOverlapTimed`, a two-row fixture with genuinely
      overlapping `datetime` events) measures the overlap pair's visible title ink at a 286px
      container: **3px and 1px with the token forced to `0px`** (this fixture's own pre-ruling
      geometry, block 8px) against **27px and 25px as landed** (block 32px), past a 16px floor
      (`PHONE_OVERLAP_INK_FLOOR`) that sits clear of both. `calendar-pinned-values.test.ts` pins
      the token and the two synchronised tracks' `minmax()` + `overflow-x` declarations.

      **The pan was confirmed on the engine a phone actually runs.** In WebKit and Chromium
      alike the seven columns resolve at 80px and the three tracks report `scrollWidth` 560
      against `clientWidth` 286/294; driving the body track to `scrollLeft` 200 moves the other
      two to 200; today's column scrolls itself into the body's box on open (0 → 137 Chromium,
      0 → 133 WebKit). `document.documentElement` and `document.body` stay 402/402 with
      `scrollLeft` 0, so nothing scrolls the page sideways.

      **What moved and what did not.** Four PNGs moved by `pixelHash`:
      `calendar-week-time-grid-mobile-{light,dark}.png` and
      `constructed-calendar-week-mobile-{light,dark}.png` (the real renderer, bench data).
      Twelve further files the same full run re-encoded byte-for-byte with no `pixelHash`
      change were restored to their committed bytes, `constructed-calendar-day-mobile-*` among
      them — the day scale has one column, so the minimum never binds there.
      `screenshots/project-manager/` carries no diff, all eight `reference-gantt-*.png` MD5s and
      the `pm-gantt-*` count (119) are unchanged, and
      `git diff --stat -- src/views/calendar-timeline-renderer.ts` stays empty.

      **Named, not taken.** The halving is the producer, and the column width is the symptom's
      lever. Staggering overlapping blocks the way a phone calendar usually does — each later
      block inset a fixed amount, keeping the column's remaining width — would give every block
      a readable title at 45px and cost no extra panning at all. It changes the renderer's
      overlap layout rather than a width, a different mechanism from the one the ruling named,
      so it is recorded for the operator rather than folded into this landing.

- [ ] T019 **Rebuild to the review's P0/P1 rows, and add G1-G15 as acceptance rows.**
      The operator read 0.0.29 on desktop beside Anytype on 2026-09-06 ~10:40 and said,
      verbatim, *"in general our calendar looks nothing like anytype yet"* — after eight of
      ten `acceptance-criteria.md` rows had closed. `review-ui-calendar-2026-09-06.md`
      measures why both are true at once: parity was read per element, on the harness's
      default theme, and never as a whole surface on the operator's. **That review is this
      task's specification.** Its §4 table carries every visible difference with the
      `file:line` that produces it and the fix it takes; its §6 orders the work L1-L6 by
      visual weight; its §7 is the G1-G15 row set, now carried in `acceptance-criteria.md`.
      (`styles.css`, `src/views/calendar-renderer.ts`, `src/views/calendar-toolbar-renderer.ts`)

      **Observed red today, 2026-09-06**, measured per pixel on the operator's 2000x967 dark
      capture (`≈0.82` CSS px per screen px, deleted after the review) and on the committed
      corpus at DPR 2 — six P0 rows, each red before any of this lands:
      **P0-1** the operator's page is `#262626` against a `#282828` rule (**+2 levels,
      invisible**) and a `#1E1E1E` weekend tint that is *darker* than the page, where
      Anytype's is lighter; on the harness's own dark page the tint **equals** the page and
      does not exist. **P0-2** the week starts Sunday and the tint splits to columns 1 and 7,
      against Monday and one `Sa Su` block in **all twenty** Anytype captures. **P0-3** a
      spanning event reserves a lane in every cell it crosses, so row 1's first single-day
      chip sits at **≈98 CSS px** below the cell top against Anytype's **32px** in every cell.
      **P0-4** `+N more` renders as a **288 x 26** filled band with centred text, against one
      line of `#848484` text at the chip inset. **P0-5** the grid measures **2031px** in a
      2000px screen, so the seventh column's rule, labels and numbers are off-screen.
      **P0-6** **0 of 40** chips on the operator's screen carry an icon, where every Anytype
      chip carries a 12x14 document glyph and nothing else.

      **Green when** every one of `acceptance-criteria.md`'s G1-G15 passes, each re-measured
      per pixel on a corpus recaptured on HEAD **and** on a second-theme capture whose
      `--background-primary` is neither `#1E1E1E` nor `#FFFFFF` (G12) — the operator's is
      `#262626`. **No row closes on the theme it was written against.** P1-8 recaptures the
      corpus at every leg, because the committed captures already drifted: they show
      three-letter weekday labels where the build ships two.

      **P0-2 ruled and landed.** `decision-record.md`'s ADR-007 takes the Monday-start default
      with the setting kept as an override; `getLocaleWeekStartsOn` no longer consults the host
      locale at all. G7 no longer waits on the operator.

      **Code-landed 2026-09-06, all six P0 rows.** `--db-calendar-rule`/`--db-calendar-weekend-bg`
      derive from `--background-primary` via `color-mix` toward `--text-normal` (P0-1); the week
      defaults Monday (P0-2, ADR-007); the month grid draws one chip per covered day, ranked by a
      new per-day local-lane compaction rather than the week-global lane, with no date-range string
      in the grid (P0-3); `+N more` resets Obsidian's button chrome on both the month grid's and the
      week all-day strip's overflow buttons (P0-4); the month scale no longer reads
      `--db-calendar-col-width` at all (P0-5); every chip defaults its icon on, the coloured dot is
      removed, and a timed chip's time reads as a muted suffix after the title (P0-6).
      `calendar-pinned-values.test.ts` pins every value above with a negative control against its
      prior behaviour; `npx tsc --noEmit`, `npm test` and `npm run build` are all green on the
      landing. **Not yet done, and this is what keeps the row open**: the corpus has not been
      recaptured on HEAD, no second-theme capture exists (G12), and none of G1-G15 has been
      re-measured per pixel against a live render — the pins above guard the CSS/TS source text,
      which is necessary but is not the same evidence the row's own "Green when" clause asks for.

      **One landed rule turned out not to be this task's to delete.** T021 bounded a spanning
      segment's title with `.db-calendar-month-segment:has(> .db-calendar-month-dates) >
      .db-calendar-month-title { flex-grow: 0; }` so the date range stopped being stranded at the
      segment's far edge. The rebuild's per-day chips do stop emitting `.db-calendar-month-dates`
      as a direct child of a real month-grid chip, so the rule is inert there — but it is still a
      live fix for the day popover's expanded list and the drag-preview ghost, both still a flex
      row exactly as wide as the original bug needed. Verified by reading the rule's `>` combinator
      against both remaining call sites rather than assumed. G3 and G5 stay Unmet on the row until
      the corpus recapture confirms the per-day chips read as intended.

      **Code-landed 2026-09-06, the P1 rows the review's §6 orders after P0 (L3-L5 of its own leg
      plan).** **P1-1**: the mini-calendar button is removed outright from the calendar's own header
      (month, week and day), not merely restyled — `design-trueup.md` A5 already named it redundant
      once the month/year title selects exist, and G13's own four-control ceiling has no room for a
      fifth once the header is otherwise plain. The removal is scoped to `calendar-renderer.ts`'s own
      call sites and now-dead private state/methods; the shared `calendar-mini-calendar-renderer.ts`
      component is untouched because `calendar-timeline-renderer.ts`'s own mini-calendar button and
      `date-value-picker.ts`'s field editor both still call it — grepped, not assumed, before either
      was touched. The `constructed-calendar-mini` scenario (the harness's only reachability path to
      the calendar's own button) is removed along with its four PNGs and its state-assertion pair;
      the hand-built `calendar-mini-calendar` fixture in `temporal.mjs` stays, re-scoped to document
      the popover's own markup (still reachable through the date-value-picker) rather than a button
      that no longer exists. The scale switcher itself is restyled as plain tabs — no border, no
      fill even on the active tab, 14px words — split into its own `.db-calendar-scale-*` class
      family so `.db-timeline-scale-*`'s bordered segmented pill (the gantt, Project Manager 1:1) is
      never touched; confirmed by grepping calendar-timeline-renderer.ts's own class names before the
      split, not by assuming the shared selector was safe to edit in place. **P1-2**: the title's
      `gap` moves from the shared 8px to a calendar-only 12px override (the pattern this file's own
      comment already established for font-size), both selects' `font-weight` drops from 700 to 500,
      and `padding: 0` on `.db-calendar-title-select` removes the native `<button>` padding that was
      most of the measured 34px gap. **P1-3**: the week/day grid's one remaining rogue rule
      (`.db-calendar-week-body`'s own bottom edge, `--background-modifier-border` at 90%) now reads
      `--db-calendar-rule` like every other rule in the view; a vertical `border-right` in the same
      token is added to the time columns, the header day cells and the all-day columns — none of the
      three carried one before (the header/all-day rules were commented out, unused). **P1-4**: the
      all-day column's 2px accent-underline `::before` and the header day name's accent recolour are
      both removed outright; so is the current-hour label's `#216DFA`/700-weight recolour — the disc
      and the now-line, both already ours, are what's left. **P1-6**: the shared chip title's 8ch
      flex-basis floor (128px at 16px) is wider than a phone week/day column (measured 87px) with
      shrink disabled, so the title's own box crossed the next column's rule; a phone-scoped override
      drops the basis to 0 with shrink enabled, scoped to `.db-calendar-week-timed-event` specifically
      — **not** the month grid's own chip, whose identical-looking 8ch/shrink-disabled rule is a
      different, already-swept fix (T018-adjacent: relaxing it there previously regressed more titles
      to truncation than it fixed, per this file's own in-CSS comment, which is why this leg leaves it
      alone). `.db-calendar-month-segment` (phone) gains `overflow: hidden` so any future overflow
      clips at the column instead of crossing it — the timed-event's own segment already had it.
      **P1-7**: the phone add-button's coarse-pointer override changes from forcing it always-visible
      to `display: none` — `044`'s long-press/day-sheet is the add path on a touch device, and no
      reference capture shows a per-day glyph. `calendar-pinned-values.test.ts` gains one pin per row
      above, each with a negative control against the prior rule; `npx tsc --noEmit`, `npm test`
      (1465/1465) and `npm run build` are all green on the landing (`main.js` reverted after, per this
      leg's own rule). **Not landed in this pass, named rather than silently dropped**: P1-3's own
      slot-line/day-column width alignment (the review's "one column in, one column short" reading) —
      the custom-column-width CSS this leg found already in the tree appears purpose-built to solve
      exactly that alignment, and a static read cannot tell whether it already does; P1-5 (the
      unscheduled drawer's own chip grammar — already superseded once by ADR-006's header-chip move,
      unclear whether anything remains).

      **Corpus recaptured, G1-G15 re-measured 2026-09-06, same day.** `temporal.mjs`'s hand-built
      month/week fixtures were rebuilt to Monday-first per-day chips (P1-8), a full `npm run
      screenshots` recapture ran (556 entries; `tools/lane/css-lane.json` carries the release),
      and `acceptance-criteria.md`'s G-row table was re-measured against the recaptured corpus and
      the declaring CSS rather than re-asserted from the code change alone. **Twelve of fifteen
      close: G1-G5, G7-G11, G13, G14.** Three stay open, each for a reason recorded on its own row,
      not folded into this one: **G6** needs a live pane-width sweep on a custom-column-width view;
      **G12** needs a second-theme capture the harness does not have yet; **G15** is the review's
      own P2-1, ranked after this leg's P0/P1 scope. This row stays unticked on that basis — its own
      "Green when" clause asks for all fifteen.

      **Independently re-verified 2026-09-06, and the re-verification was not a formality.** Every
      G row was re-read from the committed captures at DPR 2 and, where a capture cannot answer the
      question, from a live headless-Chromium mount of the shipped renderer. Four rows did not
      survive that read as written:
      **G14** claimed the slot lines and the day columns were "identical in extent by construction";
      measured, the hour lines ran device x 184 -> 2041 against columns running 184 -> 2783, so the
      whole weekend pair carried no horizontal ruling. Cause: `.db-calendar-time-columns` is a
      `z-index: 1` layer above the slot lines and its opaque weekend tint covered them. Fixed by
      splitting the tint into a flat form for the month cell and a wash for the time grid, with a
      negative control run both ways.
      **G6** was closed by a live sweep at 1000 / 1200 / 1440 on a config carrying
      `calendarColumnSizeMode: "custom"` — and the sweep found the month weekday header still
      attaching a column-resize handle whose drag set `--db-calendar-col-width` on the month wrap,
      the operator's own clipped-seventh-column red, reachable mid-drag. The handle is removed from
      the month header; week and day keep theirs.
      **G5** was overrunning its own column on the phone: the `+N more` line is a grid item, its
      min-width was auto, and it ran 13 CSS px past its column's rule. Bounded and re-measured.
      **G2**'s evidence claimed the week-grid scan lands on the identical `(45,45,45)`; it lands on
      `(44,44,44)` for the hour lines and `(36,36,36)` for the half-hour lines — one token at two
      declared opacity tiers, which the review's own P1-3 fix allows. The row is corrected rather
      than re-asserted.
      **Thirteen of fifteen now close: G1-G11, G13, G14.** This row still stays unticked, because
      its "Green when" clause asks for all fifteen and **G12** (a second-theme *capture* in the
      corpus — the relationship it tests is confirmed live on the operator's `#262626`, but a live
      read is not a capture) and **G15** (the review's own P2-1) remain.
- [x] T020 (2026-09-06 ~10:47 amendment) **Stagger overlapping phone-week blocks; put the minimum
      column back to 45px.** Operator ruling, verbatim *"Stagger overlaps at 45px"* — this
      **supersedes T018's landed 80px minimum**. Each later overlapping block is inset
      a fixed step and keeps the column's remaining width, so a split block regains a readable
      title at the month cell's own width. **Red first**: at 45px under the pre-fix halving layout
      the split block's title paint box measured 4.5px and 0.5px — zero glyphs, confirmed by T018's
      own 45px recapture at 8 and 2 device px of ink. **Landed 2026-09-06**:
      `renderWeekTimedEvent` insets each overlapping block by a fixed
      `CALENDAR_TIMED_STAGGER_STEP` (10px) and keeps the column's own remaining width to the right,
      rather than splitting the column N ways; `--db-calendar-phone-week-col-min` is back to 45px.
      `calendar-pinned-values.test.ts` pins the reverted token and the stagger constant, with a
      negative control against the removed equal-split formula.

      **Re-measured on the rendered pixels 2026-09-06, closing the "not yet re-run" clause.** On
      `calendar-week-time-grid-mobile-dark.png` the phone week columns measure 90 device px pitch =
      **45 CSS px exactly**, the ruled operator value. The overlapping pair on Friday: the first
      block's glyph sits at device x 540-566 with its title painting 540 -> 565, **12.5 CSS px of
      ink**; the staggered block's glyph sits at 569-590 with **4 device px = 2 CSS px** of title
      ink. So the honest reading is that at a 45px column the stagger keeps both blocks separately
      visible, hit-testable and identified by their icons, and it does **not** give the second block
      a readable title — the ~27px the code comment claimed is box, not title, once the block's own
      padding and 12px leading glyph are taken out. That is still strictly more than the equal
      N-way split it replaced, which left neither block a title (4.5px and 0.5px paint boxes), and
      45px is the operator's own ruling; a readable second title needs a wider column, not a smaller
      inset. The comment on `CALENDAR_TIMED_STAGGER_STEP` is corrected to say that rather than the
      claim it carried. `decision-record.md`'s ADR-005 amendment carries the ruling and its landing
      note; T018 stays closed as the record of what landed first
- [x] T021 (2026-09-06 ~10:33 amendment) **Make the unscheduled affordance subtle and integrated.**
      Operator, verbatim: *"For calendar the unscheduled pinned stuff needs to be done better. Like
      more subtlely integrated, check how anytype or other would do that."* (`../roadmap.md` §4 row
      62; capture `operator-calendar-unscheduled-20260906.png`, the operator's own). **Red first**:
      an *"Unscheduled (1)"* band of roughly 80 CSS px sits above the grid holding one centred item.
      **This is not T004's question re-asked** — T004 established that the reference has no
      counterpart (0 non-background px below the grid rule in twenty set captures) and kept ours
      with the argument written; the operator is asking what ours should be instead. Write the
      alternatives as an ADR first — a header-row *"Unscheduled · N"* chip opening a popover on
      desktop and a sheet on phone is the proposal, with Anytype's captures, the Notion harvest and
      Project Manager's sidebar as references — then build it. Green is 0 px of dedicated band
      above the grid with the items still reachable and still droppable onto a day. Leg
      `worktrees/161-impl-057-unscheduled`. The same capture's centred multi-day range text and
      per-column chip drift are **not** carried here: G5 and G3 already own them

      **Closed 2026-09-06 on leg `worktrees/161-impl-057-unscheduled`.** `decision-record.md`'s
      **ADR-006** compares four integrations — keep the band restyled, drop the surface, a
      persistent sidebar list, and the header chip — and takes the chip.
      `renderUnscheduledBacklog` is retired for `renderUnscheduledChip`, which appends
      `"Unscheduled · N"` into the title element that `renderMonthHeader` /
      `renderWeekHeader` / `renderDayHeader` now return, and returns before creating anything at
      N = 0; `openUnscheduledMenu` builds the list through `createOwnedMenuForEvent`, the same
      owned-menu primitive `showDayEntryMenu` already uses, so `sheet-grammar.mjs` gains no
      surface (its `owned-menu` row already covers the phone sheet). Each listed record keeps
      `draggable = true` and the same `UNSCHEDULED_MIME` + `text/plain` `dragstart` payload the
      drawer item carried. Pinned three ways rather than one: `calendar-pinned-values.test.ts`
      greps the raw stylesheet for any surviving `.db-calendar-backlog` rule,
      `calendar-renderer.test.ts` asserts the chip's presence and absence against the row data,
      and `render-assertion-harness.ts` adds two `calendarAssertions` rows that measure the
      shipped renderer's own output on every calendar scenario. New capture
      `constructed-calendar-month-unscheduled` (both themes, both device profiles) carries the
      only two states the bench shape never drew — one undated row and one 5-day span.
      **The multi-day range fix carried alongside it is interim, and is T019's to supersede.**
      `.db-calendar-month-segment:has(> .db-calendar-month-dates) > .db-calendar-month-title {
      flex-grow: 0; }` stops a spanning segment's title box from filling the whole span and
      stranding its date range at the far edge (measured at 784px of separation inside a 977px
      five-column segment before, an 8px gap after). It does **not** conflict with T019: the
      review's P0-3 rebuild draws a span as one chip per covered day with **no date string at
      all**, at which point `.db-calendar-month-dates` stops being emitted and this rule becomes
      dead code to delete with it. Until then the range is legible where it was not, and G3 and
      G5 — which own the span's real shape — stay Unmet
- [x] T022 (2026-09-06 ~17:12 amendment) **Move the phone month chip's ellipsis inside the cell,
      superseding G10's month-scale trade-off.** Operator ruling, verbatim: *"Ellipsis inside the
      cell."* G10 (`acceptance-criteria.md`) had already measured both sides of this and left the
      choice open — the row's own text called it "the operator's to rule on" — so this closes that
      open clause rather than reopening the row's Met status.

      **Red first**, `calendar-month-view` at a 402px phone, live-measured through the shipped
      stylesheet against the real fixture markup (not inferred): `.db-calendar-month-title`'s
      `flex: 1 0 min(8ch, 100%)` floors the title at a fixed 40px box with shrink disabled, while
      the segment sits 18px narrower. `titleClientWidth 40`, `titleScrollWidth 89`-`108` depending
      on the chip's own text, title right edge 18px past the cell's own right edge — the exact
      number G10 already recorded. Because the box itself is too wide, no ellipsis ever computes
      inside it; the segment's own `.is-phone` `overflow: hidden` then hard-clips the box at the
      cell edge, cutting text with no ellipsis glyph rather than truncating it, e.g. `Adobe CC
      audit` runs `Ado` with no trailing mark at 4x recapture DPR. Recaptured
      `calendar-month-view-mobile-dark.png` / `-mobile-light.png` and
      `constructed-calendar-month-mobile-dark.png` / `-mobile-light.png` (real `CalendarRenderer`
      mount) show the same run-on ink pre-fix.

      **Fix**: `.is-phone .note-database-container .db-calendar-month-week > .db-calendar-month-segment
      > .db-calendar-month-title { flex: 1 1 0; min-width: 0; overflow: hidden; text-overflow:
      ellipsis; white-space: nowrap; }` — scoped to the flat per-day month chip specifically
      (`renderMonthSegments`, `calendar-renderer.ts`), not the week/day timed-event title T020's
      sibling rule already covers and not the desktop rule, which is untouched. Letting the title
      shrink (basis 0, not the 8ch floor) means it fills only the space actually left after the
      icon and padding, so its own box never exceeds the segment, and its `text-overflow: ellipsis`
      now has room to paint.

      **Green, same live measurement, same fixture, after the fix**: title right edge sits 2px
      *inside* the cell's own right edge on every phone chip measured (`iCloud`, `Adobe CC audit`,
      `Q1 renewals sweep`), `titleClientWidth` down to 20px, `titleScrollWidth` unchanged (89-108px)
      — the box shrank, the text still needs truncating, and the ellipsis now has a box to paint
      into. Recaptured `calendar-month-view-mobile-{dark,light}.png` and
      `constructed-calendar-month-mobile-{dark,light}.png` show every chip title ending in a visible
      `…` inside its own column, none crossing a rule. **Desktop unaffected, measured, not assumed**:
      the same fixture at 1440px keeps `titleClientWidth === titleScrollWidth` on every chip (no
      truncation needed at that width) both before and after, and no desktop capture changed.

      **Negative control**: `calendar-renderer.test.ts`'s three new cases in the "phone month-chip
      title ellipsis" suite read the shipped `styles.css` directly (this suite's `environment:
      "node"` carries no layout engine, matching `cell-popover-coordinate-space.test.ts`'s own
      reasoning) — stashing the CSS change reproduces two failures (`expected null not to be null`
      on the phone rule's absence, `expected +0 to be 1` on the selector-occurrence count), and
      restoring it turns both green again.

      G10 (`acceptance-criteria.md`) is updated to record the resolved state rather than the open
      trade-off; `decision-record.md` carries the ruling as an ADR row

<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`
- [ ] No `[B]` blocked tasks remaining
- [ ] ADR-002 carries a status other than Proposed
- [ ] Every `acceptance-criteria.md` row is Met, Waived by a named ADR, or Superseded by one
- [ ] The operator's row (AC-010) is the only one that may stay open, and an agent never ticks it
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Thresholds with their failing values**: See `checklist.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Sibling**: `../056-board-anytype-parity/` — the board half of the same operator ruling
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

- [ ] CHK-001 [P0] Requirements documented in spec.md — nine anatomy elements, ten REQ rows
- [ ] CHK-002 [P0] Technical approach defined in plan.md — five legs, gated twice
- [ ] CHK-003 [P1] Dependencies identified and available — `047` section 5 written, the grammar lane
      green; T001's image-capable leaf and the operator's ADR-002 ruling are the two still Red
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] `npm run lint` and the TypeScript build pass, exit read from `$?`
- [ ] CHK-011 [P0] No console errors on a calendar render with the `049` mock catalogue loaded
- [ ] CHK-012 [P1] The invalid-event repair path (`getCalendarInvalidEventCount` /
      `openCalendarInvalidEvents`) survives the retarget unchanged
- [ ] CHK-013 [P1] The renderer keeps its scale-split structure unless ADR-002 removes two scales
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] Every `acceptance-criteria.md` row is Met, Waived or Superseded
- [ ] CHK-021 [P0] Manual read of the retargeted calendar against the captures, desktop
- [ ] CHK-022 [P1] Edge cases from `spec.md` section 8: empty month, overflowing day, month-edge
      span, DST boundary, unparseable date
- [ ] CHK-023 [P1] A record still lands in exactly one day cell, and the same one it did before
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep — `rg -n 'db-calendar' src/views/ styles.css`
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests — `rg -n 'updateCalendarScale|calendarScale|db-calendar-backlog'` is the inventory ADR-002's answer acts on
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases. **Partially applicable and recorded as such**: the parser case is real here — date parsing at a DST and month-edge boundary — and is CHK-022's; there is no path or redaction surface
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed — `plan.md` FIX ADDENDUM lists four axes, one of which (phone) has no capture at all
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state — the system clock is the one here, and the today marker reads it
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation: date parsing keeps its existing invalid-event handling; this
      packet does not widen what it accepts
- [ ] CHK-032 [P1] Auth/authz working correctly. **N/A**: an Obsidian plugin reading a local vault
      has no auth surface. Recorded rather than ticked
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments carry the durable why, not the packet number
- [ ] CHK-042 [P2] `screenshots/anytype/README.md` gains the iOS-calendar absence under "Views not
      captured, and why", if it does not already name it
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
| P1 Items | 13 | 0/13 |
| P2 Items | 6 | 0/6 |

**Verification Date**: not yet verified — the packet was authored 2026-09-05 and no task has run.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] All ADRs have status — ADR-002 must not stay Proposed at closure
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] Migration path documented — `spec.md` section 4's anatomy table is it
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] NFR-P01: calendar render over the `049` 326-record catalogue within 10% of the
      pre-leg baseline, same machine, same session
- [ ] CHK-111 [P1] If A2's per-cell self-loading is adopted, its cost is measured rather than
      assumed cheap
- [ ] CHK-112 [P2] Load testing beyond the 326-record catalogue. Deferred: the catalogue is the
      program's declared test environment (`049`)
- [ ] CHK-113 [P2] Benchmarks recorded in `implementation-summary.md`
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented — `plan.md` section 7 and L2, including the one
      irreversible leg
- [ ] CHK-121 [P0] Feature flag configured. **N/A and deliberately so**: `056` goal D6 forbids
      shipping board affordances default-off and the same posture applies here. A scale removal is
      landed as its own revertible leg instead of hidden behind a flag
- [ ] CHK-122 [P1] Monitoring: the gate's 25 lanes and the grammar lane
- [ ] CHK-123 [P1] Runbook: `plan.md` L2 Enhanced Rollback
- [ ] CHK-124 [P2] Release cadence row added to `../roadmap.md` section 5.3 when this ships
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Accessibility review: every declined parity value names WCAG 1.4.11, WCAG 1.4.3
      or the 44px touch floor, with its measured ratio or size (goal D3)
- [ ] CHK-131 [P1] Dependency licenses compatible. **N/A**: no dependency is added
- [ ] CHK-132 [P2] OWASP Top 10. **N/A**: no network or auth surface
- [ ] CHK-133 [P2] Data handling: the calendar reads and writes an existing date property
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] API documentation. **N/A**: no public API changes
- [ ] CHK-142 [P2] User-facing documentation updated if the scales change, which is operator-visible
- [ ] CHK-143 [P2] `design-trueup.md` is the knowledge transfer, and it carries the phone gap so a
      later session does not go looking for a capture that does not exist
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | The ADR-002 scale ruling | [ ] Open — asked at T003 | |
| Operator | Device confirmation, desktop and phone | [ ] Open — the phone half is read knowing it was inferred | |
| Fresh reviewer | In-repo verification | [ ] Open — never self-certified (parent D4) | |
<!-- /ANCHOR:sign-off -->
