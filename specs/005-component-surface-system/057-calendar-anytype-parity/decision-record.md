---
title: "Decision Record: Calendar Anytype Parity"
description: "The decisions this packet takes, and the one it deliberately leaves open for the operator."
trigger_phrases:
  - "057 decision record"
  - "calendar parity adr"
  - "calendar scale ruling adr-002"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/057-calendar-anytype-parity"
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "recorded adr-001 accepted and adr-002 proposed for the operator"
    next_safe_action: "Run T001, then put ADR-002's scale question to the operator"
    blockers:
      - "ADR-002 is Proposed and gates the first implementation leg"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "specs/005-component-surface-system/039-calendar-parity-port/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-057-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "ADR-002: do the week and day scales survive parity with a one-layout product"
    answered_questions:
      - "The calendar's thresholds are per-element because it carries zero pm-* classes"
      - "Parity by default is inherited from 051 ADR-007 without re-asking"
---
# Decision Record: Calendar Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:decisions -->
## ADR-001: The calendar's parity target moves to Anytype

**Status**: **Accepted** — 2026-09-05 ~22:45, operator.

**Context.** `039-calendar-parity-port` landed and shipped in 1.4.6 as a parity port of Project
Manager's calendar, and stands at 5 of 6 in `../roadmap.md` section 5.A. It was a **behavioural**
port: `src/views/calendar-renderer.ts` constructs 91 `db-calendar-*` classes and **zero** `pm-*`
classes.

Then the operator saw Anytype. On 2026-09-05 ~22:45, verbatim:

> *"Board UI/UX should almost be 1:1 Anytype"*

> *"Same for calendar etc."*

and, asked how far "etc." reached:

> *"Board + calendar to Anytype; gantt stays PM"*

> *"Make sure we have phases for that"*

**Decision.** The calendar is rebuilt against Anytype's captured calendar layout. The gantt is not:
`037`'s 1:1 Project Manager port stands, and rows 37/38's *"align closer"* now applies to it alone.

**Why the split is coherent.** Anytype ships six set layouts — Grid, Gallery, List, Kanban,
Calendar and Graph — and no timeline among them. There is no Anytype gantt to port to. The table is
a third case: it stays ours, with Anytype grid patterns adopted where the captures show them
better, which `050`, `053` and `054` already carry.

**Consequences.**
- `039`'s port is superseded rather than deleted; its record keeps its history and carries a note
  pointing here.
- Unlike `056`, there is no Project Manager markup to remove. The retarget is per-element, which
  costs more to verify and is the only observable form — see ADR-003.
- The phone half has no reference and cannot get one; goal D4 and AC-007 handle that explicitly.

**Alternatives rejected.**
- *Reopen `039`.* It shipped and verified a different target; reopening would make its record
  contradict itself, and the operator asked for phases explicitly.
- *Treat the calendar as covered by `056`.* Rejected: different renderer, different reference set,
  different phone situation, and a different kind of threshold. One packet would have hidden all
  four differences.

---

## ADR-002: Do the week and day scales survive?

**Status**: **Proposed** — awaiting the operator. Put at T003 with T001's finding attached.

**Context.** Ours has three scales: `updateCalendarScale?(scale: "month" | "week" | "day",
anchorDateKey, label?)` (`src/views/calendar-renderer.ts:82`). Around them sit seven scale-switch
classes (`db-calendar-scale-button`, `-control`, `-menu`, `-menu-chevron`, `-menu-label`,
`-popover`, `-segment`), a full week body of 22 more (`db-calendar-week-*`: all-day rows, hour
gutters, time columns, timed events, a current-time line), a day view, and
`calendar-keyboard-navigation.test.ts` exercising them. That is roughly a third of the calendar's
91-class vocabulary.

Anytype ships **one** calendar layout among six, and no scale switch appears anywhere in
`anytype-menu-set-layout-calendar-*`. T001 confirms that absence across all twenty set captures
before this question is put — an absence asserted from one screen is the mistake `050` made five
times and was corrected for five times.

**Decision.** Pending. This is an operator call because it is large, irreversible, operator-visible,
and not something *"almost 1:1 Anytype"* settles on its own: parity says remove them, and the
operator has never asked for a working feature to be deleted.

**Consequences of each answer.**
- *Remove:* the calendar becomes month-only; 29 or so classes, the week body, the day view and a
  keyboard test suite go with it. Parity is closer. The deletion lands as its own last, clearly
  labelled leg so reverting it does not unwind the retarget (`plan.md` section 7).
- *Keep:* a visible deviation from the stated target, recorded here as a deviation with its reason
  rather than left as drift. It is not an accessibility ground, so goal D3 does not cover it and
  this ADR is what authorises it.

**Alternatives rejected.**
- *Decide it in-repo.* Rejected under goal D6. Inferring a deletion of shipped, tested,
  operator-visible functionality from a capture absence is exactly the class of silent decision the
  program's D3 and section 7 exist to prevent.

---

## ADR-003: The calendar's thresholds are per-element, not a class count

**Status**: **Accepted** — orchestrator decision, and it is a correction rather than a preference.

**Context.** `056`'s headline criterion is a count: Project Manager classes in the board renderer,
39 → 0. The obvious move was to mirror it here. Measured on `3407dab0`,
`grep -o "pm-[a-z-]*" src/views/calendar-renderer.ts | sort -u | wc -l` returns **0**.

**Decision.** The calendar's criteria assert per-element parity against named captures instead.

**Consequences.**
- AC-002 costs more to verify: three elements measured on the production render path at two themes,
  rather than one `grep`.
- It is the only form that can be observed failing today, which is goal D2's whole point.
- The absence of the mirrored threshold is stated in `checklist.md` rather than left for a reader
  to notice, because a criterion that is missing for a good reason and one that was forgotten look
  identical afterwards.

**Alternatives rejected.**
- *Write the class-count criterion anyway.* It would have read **green on an untouched tree**.
  `050`'s true-up found six such false premises in its own criteria; this is the seventh, caught
  before it was written rather than after it was believed.

---

## ADR-004: Parity by default, with accessibility as the only ground for declining

**Status**: **Accepted** — inherited from `051` ADR-007 (operator: *"Yes, parity by default"*,
2026-09-05 ~18:30), applied here without re-asking.

**Decision.** Every captured value is adopted. The only permitted grounds for declining one are
WCAG 1.4.11 (non-text contrast), WCAG 1.4.3 (text contrast) and a 44px touch floor, each named with
its measured ratio or size.

**Consequences.**
- ADR-002's "keep" branch, if the operator takes it, is **not** covered by this rule — it is a
  deviation on product grounds, which is why it needs its own accepted ADR rather than a footnote.
- `050`'s two refusals carry over: the `#232323` row highlight at 1.14:1, and colour-only
  active-state signalling.
<!-- /ANCHOR:decisions -->
