---
title: "Verification Checklist: Calendar Anytype Parity"
description: "The thresholds with the failing measurement recorded first, so a pass means the calendar actually changed rather than a check being added."
trigger_phrases:
  - "057 checklist"
  - "calendar anytype thresholds"
  - "calendar parity verification"
importance_tier: "critical"
contextType: "planning"
---
# Verification Checklist: Calendar Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## VERIFICATION PROTOCOL

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status. A criterion closes on a number that was read, never on a command that was merely run.

### Criteria

One row per acceptance criterion, numbered to match `AC-0NN`. Desktop measurements are taken on the
real renderer at the production mount point; phone measurements on a 390x844 profile with a navbar
present — **and against no reference, which is why C7 counts labels rather than matches.** **T002
fills every `Today` cell that carries a mechanism rather than a figure.**

**Priority:** C1 through C4 and C8 are P0. C6, C7 and C9 are P1. C5 and C10 are the operator's.

| # | Criterion | Today | Target | Evidence |
|---|---|---|---|---|
| C1 | Nine anatomy elements trued (AC-001) | **0 of 9.** `ls specs/005-component-surface-system/057-calendar-anytype-parity/design-trueup.md` → No such file or directory. The capture set is on disk and unread: 20 calendar set files (10 use cases x 2 themes) and 24 calendar menu files (6 menus x light/dark x clipped/full) | 9 of 9, each with a capture filename and a measurement or a labelled inference; A4 and A6's absences established across all twenty set captures | [ ] |
| C2 | Month grid, day cell, event chip match (AC-002) | **91 classes, 133 rules, none trued.** Measured 2026-09-05 on `3407dab0`: `grep -o 'db-calendar[a-z-]*' src/views/calendar-renderer.ts \| sort -u \| wc -l` → **91**; `grep -o 'db-calendar[a-z-]*' styles.css \| sort -u \| wc -l` → **133**. And `grep -o "pm-[a-z-]*" src/views/calendar-renderer.ts \| sort -u \| wc -l` → **0**: `039` ported behaviour, not markup, so there is no Project Manager vocabulary here to count down | Each of the three matched to a measured value or deviating on a named accessibility ground | [ ] |
| C3 | Navigation matches (AC-003) | **T002 records what our toolbar carries today.** `src/views/calendar-toolbar-renderer.ts` is 578 lines and was written against Project Manager's model, not Anytype's. Anytype's, per `047` section 5: month and year selects spanning years 0-3000, arrows, a Today button, and a "today scroll" placing the current week at the viewport bottom | Matched, or each declined part carrying a written reason | [ ] |
| C4 | Date-property picker matches (AC-004) | **unread.** `anytype-menu-set-layout-calendar-date-property-{light,dark}-full.png` exists on disk and has not been opened by this packet | Matched to the capture | [ ] |
| C5 | **OPERATOR** — the scale ruling (AC-005) | **3 scales shipped, 1 layout captured.** `updateCalendarScale?(scale: "month" \| "week" \| "day", anchorDateKey, label?)` at `src/views/calendar-renderer.ts:82`, with `db-calendar-scale-{button,control,menu,menu-chevron,menu-label,popover,segment}` — seven classes for the switch alone — plus a full week body (`db-calendar-week-*`, 22 classes) and `calendar-keyboard-navigation.test.ts`. Anytype's six set layouts are Grid, Gallery, List, Kanban, Calendar and Graph; no scale switch appears in `anytype-menu-set-layout-calendar-*` | ADR-002 status is not **Proposed**; the implementation follows whichever way it goes | [ ] |
| C6 | Unscheduled area dispositioned (AC-006) | **ours, and unmatched.** A collapsible backlog drawer: `db-calendar-backlog`, `-header`, `-toggle`, `-list`, `-item`, `-empty` (`calendar-renderer.ts:160-163`, `backlogCollapsed` at `:123`). Neither `047` section 5 nor `050`'s true-up names an Anytype counterpart, and neither read the calendar closely | Matched, or kept as ours with a written argument, after all twenty set captures are read | [ ] |
| C7 | Phone values labelled (AC-007) | **no reference exists, and no labelling convention is in force yet.** `screenshots/anytype/mobile/` contains **0** calendar captures of any kind; the iOS view-layout sheets are picker, gallery and kanban (`anytype-mobile-sheet-view-layout-{picker,gallery,kanban}-{light,dark}.png`), and none of the 104 `mobile/sheets/` captures is a calendar surface. iOS Anytype does not ship a calendar layout | Unlabelled phone-calendar values → **0**. Each carries **"design inferred from desktop"** and names its source capture | [ ] |
| C8 | `044` grammar + `048` stacking hold (AC-008) | **conforming today — T002 records the figure.** The registered set is 12 surfaces and 31 stacked pairs (`051/checklist.md` C8, measured 2026-09-05) | 12 and 31 still green, `node tools/live/sheet-grammar.mjs` exit 0 read from `$?`, after every leg | [ ] |
| C9 | Gantt unmoved, guard tests unedited (AC-009) | **T002 records the baseline before the first leg**: `grep -o "pm-gantt[a-z-]*" src/views/calendar-timeline-renderer.ts styles.css \| sort -u \| wc -l`, the gantt capture hashes, and the pass counts of `calendar-keyboard-navigation.test.ts` and `calendar-search-placement.test.ts`. `037`'s in-repo parity was verified at `30c4b746` — 60 of 60 `pm-gantt-*` classes, zero divergence — and `calendar-timeline-renderer.ts` is 4317 lines sitting next door | Baseline unchanged; both guard tests green with `git diff --stat` → **0** lines | [ ] |
| C10 | **OPERATOR** — the calendar reads as Anytype on device (AC-010) | not asked; the packet was opened 2026-09-05 ~22:45 and nothing has shipped | The operator's own read, desktop and phone, knowing the phone half was inferred | [ ] |
<!-- /ANCHOR:protocol -->

---

## The check that the rest are not theatre

C2, C5, C6 and C7 already carry figures read off `3407dab0` or off the capture folder; C1 and C4
carry the absence of a read. C3, C8 and C9 carry a mechanism and are T002's to turn into numbers
before the first leg.

**One threshold was deliberately not written.** The obvious mirror of `056`'s headline —
"Project Manager classes 39 → 0" — is unavailable here: this renderer carries **zero** of them, so
the criterion would have read green on an untouched tree and certified nothing. `050`'s true-up
found **six** such false premises in its own criteria. Naming why a threshold is absent is cheaper
than discovering later that a green one was empty.
