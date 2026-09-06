---
title: "Acceptance Criteria: Calendar Anytype Parity"
description: "The criteria this packet must satisfy before it may be closed, one threshold per requirement, each met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "057 acceptance criteria"
  - "calendar anytype closure gate"
  - "calendar parity ac"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-06T19:00:00Z"
    last_updated_by: "verify-and-land"
    recent_action: "landed t017; eight met, ac-004 and ac-010 open"
    next_safe_action: "The operator AC-010 device read; AC-004's layout-tile panel stays a named gap"
    blockers:
      - "AC-010 is operator-owned and nothing in this repository can close it"
      - "AC-004 needs the layout-tile panel, which design-trueup.md names out of scope rather than owed"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/views/calendar-toolbar-renderer.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-ac"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions:
      - "T001 established A4 and A6 as absences across all twenty set captures"
      - "ADR-002 is Accepted: keep week and day, styled to the month grid"
      - "A class-count threshold would be unobservable here: the calendar carries zero pm-* classes"
      - "The phone calendar has no Anytype reference, so AC-007 counts labels rather than matches"
      - "AC-003 Met on T005-T007's retarget; the gantt confirmed unmoved, by hash and by a zero-line diff"
      - "AC-002 is Met: T015 R1-R7 landed and every sub-row was re-measured at the landing"
      - "AC-008's premise moved from 12 surfaces to 13, for 055's confirm registration and not for anything 057 added"
      - "T009's 224x28 submenu geometry had not landed and was repaired at the landing"
      - "AC-005 is Met: T017 flattened the week/day timed block to the month chip's ink, measured at 0 fill/bar px"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Calendar Anytype Parity

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/057-calendar-anytype-parity
**Level:** 3
**Status:** In progress — eight of ten rows Met; AC-004's layout-tile panel and AC-010's operator read stay open
**Date:** 2026-09-06 (T017 landing)
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
AC-001 through AC-009 align to REQ-001 through REQ-010; AC-005 and AC-010 are the operator's.

Desktop measurements are taken on the real renderer at the production mount point; phone
measurements on a 390x844 profile with a navbar present, **and against no reference** — which is
why AC-007 counts labels rather than matches. Every threshold carries a failing value observed on
HEAD before the fix (goal D2), recorded in `checklist.md`. Exit statuses are read from `$?`.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the 44 calendar capture files on disk, **When** an image-capable leaf reads them px by px, **Then** all 9 anatomy elements are recorded in `design-trueup.md` with a capture filename and either a measurement or the **design inferred** label, and A4's and A6's absences are established across all twenty set captures rather than one | **Met 2026-09-05.** `design-trueup.md` §4 carries 9 of 9 elements: 28 sub-rows with a measurement and a capture filename, 9 marked **pixel read owed** with the reason a static capture cannot answer them, 2 labelled `047`-sourced rather than measured. A4 and A6 established across 10 light + 10 dark (§3): 0 non-background px below the grid rule, 0 ink in the header band between the title and the `‹ Today ›` cluster | Met | - |
| AC-002 | REQ-002 | **Given** a month grid, a day cell and an event chip built from 91 untrued `db-calendar-*` classes, **When** each is retargeted, **Then** each matches a measured captured value or deviates on a named accessibility ground with its ratio or size | **Reopened 2026-09-06 after an independent capture read; was claimed Met the same day.** Most of the row holds and is measured on the landed corpus at DPR 2: 137px row pitch (rules at device y 477/751/1025/1299/1573), `#EBEBEB` light and `#292929` dark rules at the same eight column positions, `#F7F7F7`/`#1E1E1E` weekend columns, a 52x48 device (26x24 CSS) `#216DFA` today disc, and flat chips with no fill, bar or radius at a 20px pitch 32px below the cell top. **R1-R2 closed 2026-09-06**: `box-sizing: border-box` added to `.db-calendar-month-grid` (`styles.css:17397`) so its `width: 100%` (from the shared `db-calendar-grid` class) and its own `padding: 0 16px` no longer stack into an overrun; recaptured and read pixel-by-pixel, the grid's vertical rules now land at device x 112/489/865/1243/1619/1997/2373/2751 — a 16px CSS inset on both edges — with a 377.0 device px column pitch matching the weekday row's 377.3, and each weekday label's inset from its own column reads a constant 11.0-12.0px CSS. Four further residuals remain open in `tasks.md` T015 R3-R7. **Deliberately not a class count**: the calendar carries 0 `pm-*` classes, so a count-to-zero threshold would read green on an untouched tree (ADR-003) | Unmet **Met 2026-09-06 at the landing, on an independent device-pixel read of the recaptured corpus and a live `getBoundingClientRect` in the capture harness's own Chrome.** R3-R7 landed alongside R1/R2 and each was re-measured rather than accepted: the grid's border box is CSS 40..1392 with its content inset 16px on **both** edges; the weekday cells and the day cells share the pitch **exactly** (both at 56 / 244.56 / 433.14 / 621.70 / 810.28 / 998.84 / 1187.42, width 188.57, delta 0.00), each label a constant 20-24 device px inside its own column's right rule; the day number's ink measures 12.5px CSS below the cell top at all seven columns; the chip renders flat (`background: none`, radius 0, 12px) at a 20px desktop pitch and a 44px phone one; the leading icon renders; and the empty unscheduled drawer produces no element at all. The weekday labels take the reference's two-letter form; **which day starts the week stays locale-driven and is not a measured value** — the harness's `en-US` locale renders a Sunday-start week where the reference capture is Monday-start, and R6 deliberately moved the label's character count only | Met | - |
| AC-003 | REQ-003 | **Given** a toolbar written against Project Manager's navigation model, **When** it is retargeted, **Then** month and year selects, arrows and a Today button are present and matching, and the today-scroll positions the current week at the viewport bottom — or each declined part carries a written reason | **Met 2026-09-06.** Month and year are now buttons opening the shared dropdown-menu listbox (`checklist.md` C3); header padding, title size and the today-scroll all match. The scale control, mini-calendar button and invalid-events toggle are declined deletions, named rather than silent (ADR-002's ruling and two affordances with no reference counterpart); the nav-button box stays pixel read owed on desktop and now floors at 44px on phone | Met | - |
| AC-004 | REQ-004 | **Given** the captured calendar settings menu, **When** the date-property picker is retargeted, **Then** it matches `anytype-menu-set-layout-calendar-date-property-{light,dark}-full.png` | **Partially addressed, recorded honestly as still Unmet** (`checklist.md` C4): the `Show icon` toggle is sized and coloured to the measured control and wired to the chip icon; the date field is chosen through the existing start/end date dropdowns rather than a new single-field row. **Corrected 2026-09-06: the icon/checkmark submenu is no longer an unbuilt item** — `tasks.md` T009 closed its measured 224x28 geometry, and the per-option icons and selected checkmark already existed, unmodified, in the shared dropdown-menu component (`checklist.md` C4). The one item still unbuilt is the 358x298px layout-tile panel, and `design-trueup.md` §A8 gives it no measured value for this packet to build against — it names the panel **out of scope** (`053` owns the view switcher), so there is nothing here to implement, only the boundary to keep naming. `+ Add Property` stays declined on product grounds | Unmet | - |
| AC-005 | REQ-005 / OPERATOR | **Given** three shipped scales against one captured calendar layout, **When** the operator rules, **Then** `decision-record.md` ADR-002 carries a status other than **Proposed** and the implementation follows it | **Met 2026-09-05 ~23:20**, operator: *"Keep week and day, styled to the month grid."* ADR-002 is **Accepted**. The *implementation follows it* half stays open and is now measured rather than assumed: of the five shared values the ruling names, the weekend tint and the nav cluster landed on week and day, the rule colour and the today marker did **not** (`#F1F1F1`/`#E1E1E1` slot lines, a `#5E33EB` marker, zero `#216DFA` pixels in `calendar-week-time-grid-desktop-light.png`), and the header title is still the one-string form on those two scales. `tasks.md` T015 R3-R4 carry the gap; ADR-002's open question carries the one part that is the operator's. The week and day scales stay labelled **"ours, restyled to the month grid's measured values"**, never *inferred from Anytype* | **Met 2026-09-06, closed by `tasks.md` T017.** The *ruling* half has been Met since ~23:20 and was never in question. The *implementation follows it* half reopened on 2026-09-06 ~04:45 when the operator answered ADR-002's remaining colour question with *"Flatten to chip ink"*, and now closes: `.db-calendar-week-timed-event` carries `background: none`, `border: 0`, `border-radius: 0` and the literal `#292929`/`#DDDDDD` ink pair `.db-calendar-month-segment` already carries, with the per-event distinction left to the title text. Recaptured and read pixel-by-pixel, `calendar-week-time-grid-{desktop,mobile}-{light,dark}.png` each hold **0** device px of the three former per-event fills (`#DEEAF1`, `#E6EFEA`, `#F9E9D8`) and **0** of the former `#1E3A8A` accent bar. **The red values belong to named files rather than to all four**, because the two dark captures never held those light-theme colours: 138,411 / 9,873 / 8,336 with a 3,496 px bar on `-desktop-light`, 21,708 / 2,572 / 1,059 with the same 3,496 px bar on `-mobile-light`, and the dark pair's own tints `#253652` / `#1E3E2A` / `#53331C` under a `#BFDBFE` bar — all eight colours now 0 across all four files, re-read by a second decoder written independently of `pixel-hash.mjs`. The pinned ink lands at an identical count in both themes (1,611 px desktop, 225 px phone), which is the signature of a title inheriting one ink pair. `constructed-calendar-week-*`/`constructed-calendar-day-*` (real renderer, both scales) confirm the same and stayed pixelHash-identical since their bench data carries no timed event in the captured viewport. Every other value the ruling names was already re-measured at the earlier landing and stands unchanged: the `#EBEBEB`/`#292929` slot lines, the `#216DFA` today disc and current-time line, the weekend tint, the nav cluster and the two-select header on all three scales. `src/views/calendar-pinned-values.test.ts` now pins the flat block's background/border-left/radius/colour with a negative control proving it fails on the old fill; `git diff --stat -- src/views/calendar-timeline-renderer.ts` stayed empty and all eight `reference-gantt-*.png` MD5s and the `pm-gantt-*` count (119) are unchanged. **One consequence of the ruling is recorded against this row without reopening it**: at a phone's default column width an overlap-column block has no room for its title, so with the fill gone it decodes as nothing — a width question ADR-002 puts outside its own colour ruling, carried as `tasks.md` T018 for the operator | Met | - |
| AC-006 | REQ-006 | **Given** our collapsible unscheduled backlog drawer (`calendar-renderer.ts:160-163`), **When** all twenty set captures have been read, **Then** it is matched to a captured Anytype counterpart or kept as ours with a written argument | **Met 2026-09-05.** All twenty read; there is no counterpart to match to (`design-trueup.md` §3). Kept as ours with the argument in §A4: a set omits objects with no date value and they stay reachable in its other layouts, while a note with unparseable date frontmatter has no other surface here. Restyled to the month grid's measured values | Met | - |
| AC-007 | REQ-007 | **Given** that iOS Anytype ships no calendar layout and `screenshots/anytype/mobile/` holds no calendar capture, **When** the phone calendar is written, **Then** the count of phone-calendar values presented without **"design inferred from desktop"** and a named source capture is 0 | The iOS view-layout sheets are picker, gallery and kanban only; none of the 104 `mobile/sheets/` captures is a calendar surface. There is no reference and there will not be one | Unmet **Met 2026-09-06 by T008 and T013.** The one phone value this packet writes is the flat chip's height, and it is the 44px touch floor, carried as a named accessibility deviation from the measured 20px desktop pitch rather than as an inferred reference value. Verified at the landing by the diff rather than by a lane: `git diff origin/main -- styles.css | grep '^+' | grep is-phone` returns exactly one new phone-scoped calendar selector, `.is-phone .db-calendar-month-segment`, and T008's own entry carries its label and its source. Unlabelled count: **0** | Met | - |
| AC-008 | REQ-008 | **Given** 12 registered sheet surfaces and 31 registered stacked pairs, **When** the last leg lands, **Then** `sheet-grammar.mjs` still reports 12 and 31 green at exit 0 | `node tools/live/sheet-grammar.mjs`, exit read from `$?` | Unmet **Met 2026-09-06**, with the premise corrected rather than the check waived: the registry now holds **13** surfaces, not 12 — the thirteenth is `confirm`, registered by `055-states-feedback-and-motion` while this packet was open. **057 registered none**: the day and chip context menu is built on `createOwnedMenuForEvent`, the already-registered `owned-menu` primitive, so there was nothing to add. `node tools/live/sheet-grammar.mjs` at the landing: 13 surfaces, **31** stacked pairs, all eight grammar columns green, 0 FAIL, **exit 0** read from `$?` | Met | - |
| AC-009 | REQ-009 / REQ-010 | **Given** T002's pre-leg `pm-gantt-*` count, gantt capture hashes and guard-test pass counts, **When** every calendar leg has landed, **Then** the gantt baseline is identical and `calendar-keyboard-navigation.test.ts` and `calendar-search-placement.test.ts` are green with 0 lines changed | `037`'s in-repo parity was 60 of 60 classes with zero divergence at `30c4b746`; `calendar-timeline-renderer.ts` is 4317 lines next door and a stylesheet co-tenant | Unmet **Met 2026-09-06 at the landing.** `pm-gantt-*` is **119**, all eight `reference-gantt-*.png` MD5s are identical to the values T002 recorded, `git diff --stat origin/main -- src/views/calendar-timeline-renderer.ts` is empty, and `git diff --stat` on both guard tests is empty — neither file has one line changed across the whole packet. Both guards plus `calendar-renderer.test.ts` run **32/32** green | Met | - |
| AC-010 | OPERATOR | **Given** a release carrying the retargeted calendar, **When** the operator opens it on iOS and on desktop beside Anytype, **Then** they report it as Anytype-shaped, knowing the phone half was inferred | The operator's own words. Nothing in this repository can close this row, and an agent never ticks it | Unmet | - |

#### AC-009's gantt baseline

*This block belongs to AC-009 and is written below the table rather than inside it, so the criterion rows stay contiguous and machine-readable.*

**Re-baselined 2026-09-06 by `047-competitor-references-and-pm-alignment` (`tasks.md` T013/T014) — AC-009's "identical" pins against the values below from here on, not against any earlier figure.** `047` is the one leg this program names as allowed to move the gantt (the parent's D-rulings and `../roadmap.md` §4 row 38 keep the gantt on Project Manager and give its fidelity pass to `047` alone); every *other* calendar leg's "the gantt is unmoved" claim, including this criterion's own, must read against the numbers `047` measured, not a number from before it ran. **What `047` actually did: measured, found nothing to close, changed no code.** Its full comparison (`047/scratch/gantt-comparison.md`) read the vendored reference source against `calendar-timeline-renderer.ts`/`styles.css` line by line — zero code or CSS divergence — and dispositioned the two visible differences a capture read shows (bar/label-dot colour, phone label column width) with a measured reason rather than closing them, so `styles.css`'s `.pm-gantt-*` surface and `calendar-timeline-renderer.ts`'s `renderGantt*` family are byte-for-byte what they were before `047` ran. The baseline this row should pin against, measured directly rather than assumed:

  - **The `pm-gantt-*` token count, with its method stated so the figure is unambiguous.** The **119** discrepancy recorded here on 2026-09-06 is **resolved 2026-09-06 by the verification leg: 119 reproduces exactly, and the method was already written down.** It is `checklist.md` C9's own command, carried identically by `../056-board-anytype-parity/checklist.md` C9. Four figures have been quoted for this baseline; each answers a different question, so each is written below with the command that produces it.
  - **119** — `grep -o "pm-gantt[a-z-]*" src/views/calendar-timeline-renderer.ts styles.css | sort -u | wc -l`. Two files at once, so `grep` prefixes every match with its filename and `sort -u` cannot collapse a token that appears in both: **62** unique in the renderer plus **57** unique in the stylesheet. Two are comment prose rather than classes (`pm-gantt` at `calendar-timeline-renderer.ts:2206`, `pm-gantt-` at `styles.css:18742`), so **117** are real tokens.
  - **61** — `grep -hoE 'pm-gantt-[a-zA-Z0-9_-]+' src/views/calendar-timeline-renderer.ts styles.css | sort -u | wc -l`. The same two files with `-h`, so the filename prefix is dropped and a token used in both collapses to one.
  - **56** — `grep -oE '\.pm-gantt-[a-zA-Z0-9_-]+' styles.css | sort -u | wc -l`. Distinct selector tokens in the stylesheet alone, leading dot required. This is the figure the comparison leg reported as irreconcilable with 119; it is a narrower question, not a contradiction.
  - **96 / 97** — class-token and raw-substring occurrences. Occurrences, not distinct tokens: they move when a rule is repeated and say nothing about coverage.
  - **The ratchet is the 119 command, and only that one**, because it is what `056` and `057` both already pin against and it is the only figure that sees both files — a class deleted from the renderer and left in the stylesheet moves it and moves none of the others. A future leg quotes it with its command attached; the other three sit here so nobody mistakes one of them for it.
  - **`reference-gantt-*.png` sha256 (all 8 files, unchanged by `047` and required to stay pixelHash-identical — they render vendored code, not ours)**: `047/scratch/baseline.md` carries the full table (`reference-gantt-desktop-{dark,light}`, `-mobile-{dark,light}`, `-subtask-desktop-{dark,light}`, `-subtask-mobile-{dark,light}`).
  - **Our own gantt/timeline capture hashes** (`screenshots/notion-clone/views/*timeline*`, 56 files as of `047`): `047/scratch/baseline.md`.

  A future calendar leg diffing against this row diffs against these values, quoting the 119 command above with the figure, never a bare number.

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is `Waived` or
`Superseded`, naming a decision record that exists in `decision-record.md`. An unbacked waiver is
treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Not closeable, and for one reason rather than six.** Ten rows: **eight Met, two Unmet**.

**AC-002 is Met, closed at the landing on 2026-09-06 by a verification pass that measured rather
than read the implementing pass's report.** It had been reopened the same day on two sub-rows; all
seven of `tasks.md` T015's residuals then landed, and each was re-measured at DPR 2 on the
recaptured corpus and again live through `getBoundingClientRect` in the capture harness's own
Chrome. The numbers are on the row above. AC-003 and AC-006 stand from the earlier legs.
AC-007, AC-008 and AC-009 were post-leg reads that could not close until T008-T017 had landed, and
they close here: one labelled phone value and no unlabelled ones, `sheet-grammar.mjs` green at exit
0 with the count corrected from 12 to 13 for a sibling packet's own registration, and a gantt
baseline identical by MD5, by class count and by a zero-line diff.

**AC-005 closes here too.** It went back open at ~04:45 on its *implementation* half only, when
the operator answered ADR-002's last question, *"Flatten to chip ink."* `tasks.md` **T017** landed
it: the week and day timed blocks read the month chip's own flat ink, measured at **0** device px
of the three former per-event fills and the former accent bar across all four recaptured
`calendar-week-time-grid-*` files, against a red value of 138,411 / 9,873 / 8,336 recorded before
the fix. Reopening it in the first place, rather than leaving it Met on a ruling nobody had
implemented yet, was the same call this packet made on AC-002 that morning — closing it now on a
measurement is the other half of that same discipline.

**Two rows stay open.**

- **AC-004** is a recorded partial and stays **Unmet**: the layout-tile panel is the one item still
  unbuilt, and `design-trueup.md` §A8 carries no measured value for it — it is named out of scope
  (`053` owns the view switcher) rather than owed. The icon/checkmark submenu is no longer part of
  this row's gap: `tasks.md` T009 closed its measured geometry. `+ Add Property` stays declined on
  product grounds.
- **AC-010** is the operator's own device read. Nothing here closes it and an agent never ticks it.

<!-- /ANCHOR:closure -->
