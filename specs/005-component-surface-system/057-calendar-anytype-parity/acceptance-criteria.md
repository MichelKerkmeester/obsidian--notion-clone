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
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "authored ten closure criteria with thresholds"
    next_safe_action: "T002 records each row's failing figure before any leg is written"
    blockers:
      - "AC-001 gates every other row: no value may be adopted before its capture is read"
      - "AC-005 is the operator's ADR-002 ruling and nothing here can decide it"
      - "AC-010 is operator-owned and nothing in this repository can close it"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "src/views/calendar-toolbar-renderer.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "A class-count threshold would be unobservable here: the calendar carries zero pm-* classes"
      - "The phone calendar has no Anytype reference, so AC-007 counts labels rather than matches"
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
**Status:** Draft
**Date:** 2026-09-05
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
| AC-001 | REQ-001 | **Given** the 44 calendar capture files on disk, **When** an image-capable leaf reads them px by px, **Then** all 9 anatomy elements are recorded in `design-trueup.md` with a capture filename and either a measurement or the **design inferred** label, and A4's and A6's absences are established across all twenty set captures rather than one | T001's read. A measurement-only leg records "pixel read owed" (`054` ADR-005) | Unmet | - |
| AC-002 | REQ-002 | **Given** a month grid, a day cell and an event chip built from 91 untrued `db-calendar-*` classes, **When** each is retargeted, **Then** each matches a measured captured value or deviates on a named accessibility ground with its ratio or size | Measured on the production render path at both themes. **Deliberately not a class count**: the calendar carries 0 `pm-*` classes, so a count-to-zero threshold would read green on an untouched tree (ADR-003) | Unmet | - |
| AC-003 | REQ-003 | **Given** a toolbar written against Project Manager's navigation model, **When** it is retargeted, **Then** month and year selects, arrows and a Today button are present and matching, and the today-scroll positions the current week at the viewport bottom — or each declined part carries a written reason | `anytype-menu-calendar-month-select-*` and `-year-select-*`, plus `047` section 5's source-derived read | Unmet | - |
| AC-004 | REQ-004 | **Given** the captured calendar settings menu, **When** the date-property picker is retargeted, **Then** it matches `anytype-menu-set-layout-calendar-date-property-{light,dark}-full.png` | The capture, read at T001; the picker, read on the production path | Unmet | - |
| AC-005 | REQ-005 / OPERATOR | **Given** three shipped scales against one captured calendar layout, **When** the operator rules, **Then** `decision-record.md` ADR-002 carries a status other than **Proposed** and the implementation follows it | The operator's ruling, put at T003 with T001's absence finding attached. Nothing in this repository decides it | Unmet | - |
| AC-006 | REQ-006 | **Given** our collapsible unscheduled backlog drawer (`calendar-renderer.ts:160-163`), **When** all twenty set captures have been read, **Then** it is matched to a captured Anytype counterpart or kept as ours with a written argument | The captures, plus `047` section 5 and `050`'s true-up, neither of which names a counterpart | Unmet | - |
| AC-007 | REQ-007 | **Given** that iOS Anytype ships no calendar layout and `screenshots/anytype/mobile/` holds no calendar capture, **When** the phone calendar is written, **Then** the count of phone-calendar values presented without **"design inferred from desktop"** and a named source capture is 0 | The iOS view-layout sheets are picker, gallery and kanban only; none of the 104 `mobile/sheets/` captures is a calendar surface. There is no reference and there will not be one | Unmet | - |
| AC-008 | REQ-008 | **Given** 12 registered sheet surfaces and 31 registered stacked pairs, **When** the last leg lands, **Then** `sheet-grammar.mjs` still reports 12 and 31 green at exit 0 | `node tools/live/sheet-grammar.mjs`, exit read from `$?` | Unmet | - |
| AC-009 | REQ-009 / REQ-010 | **Given** T002's pre-leg `pm-gantt-*` count, gantt capture hashes and guard-test pass counts, **When** every calendar leg has landed, **Then** the gantt baseline is identical and `calendar-keyboard-navigation.test.ts` and `calendar-search-placement.test.ts` are green with 0 lines changed | `037`'s in-repo parity was 60 of 60 classes with zero divergence at `30c4b746`; `calendar-timeline-renderer.ts` is 4317 lines next door and a stylesheet co-tenant | Unmet | - |
| AC-010 | OPERATOR | **Given** a release carrying the retargeted calendar, **When** the operator opens it on iOS and on desktop beside Anytype, **Then** they report it as Anytype-shaped, knowing the phone half was inferred | The operator's own words. Nothing in this repository can close this row, and an agent never ticks it | Unmet | - |

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

**Not closeable.** Ten rows, ten Unmet. The packet was authored 2026-09-05 ~22:45 on the operator's
calendar ruling and no task has run: T001's capture true-up is owed to an image-capable leaf and
gates AC-001 through AC-004 and AC-006; T002's red-first pass is owed and gates every figure;
AC-005 is the operator's scale ruling and AC-010 is the operator's device read, and neither is
closed by anybody here.

**One row is worth flagging as different in kind.** AC-007 does not assert a match, because there
is nothing to match against — it asserts that every phone value **says** it was inferred. That is
the honest form of a criterion for a surface with no reference, and it is written this way
deliberately rather than left as a silent gap.

Shipped, verified and operator-confirmed are three states and only the third closes (parent D3).
<!-- /ANCHOR:closure -->
