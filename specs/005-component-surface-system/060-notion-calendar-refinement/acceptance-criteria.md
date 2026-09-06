---
title: "Acceptance Criteria: Notion Calendar Refinement"
description: "The criteria this packet must satisfy before it may be closed, plus the four rows the calendar rebuild closed while the research loop ran and the four device checks the operator owns."
trigger_phrases:
  - "060 acceptance criteria"
  - "calendar refinement closure"
  - "calendar device checks"
  - "all-day strip criterion"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/060-notion-calendar-refinement"
    last_updated_at: "2026-09-06T16:45:00Z"
    last_updated_by: "opus-synthesis"
    recent_action: "Authored the acceptance criteria from the reconciled research findings"
    next_safe_action: "Prove AC-001 and AC-002 red on today's tree"
    blockers:
      - "AC-002's selector waits on device check D1"
    key_files:
      - "src/views/calendar-renderer.ts"
      - "styles.css"
      - "src/views/calendar-pinned-values.test.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-060-acceptance"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Which chrome does a phone date-edit popover take"
    answered_questions:
      - "Four of the loop's six ranked rows closed on main before this packet opened"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Notion Calendar Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/060-notion-calendar-refinement
**Level:** 2
**Status:** Implemented — AC-001 through AC-007 Met; D1-D4 operator-owned (section 4)
**Date:** 2026-09-06
**Baseline tree:** `3e1c3c65` - every observed red below was read on `origin/main` at it after the rebase, not carried from the research loop; the first read happened pre-rebase on the tree whose digest commit was then `fe6ee9de` and is now `38db667a`, and every anchor it cited is re-derived here. **Implementation tree:** `e5830232` (`3e1c3c65` plus unrelated commits already landed on `origin/main` by the time this packet's code legs started) - both observed-red values re-confirmed on it before either fix; line numbers moved, the values and the defects did not
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a week-scale render carrying one all-day event whose `endDateKey > startDateKey`, When the all-day strip paints its spanning bar, Then **0** `.db-calendar-month-dates` elements exist inside `.db-calendar-week-allday-cols`, on the desktop profile and the phone profile alike | Constructed render assertion plus a pin in `calendar-pinned-values.test.ts`, with the negative control that restoring the emitter turns red. **Observed red on `3e1c3c65`: 1**, emitted at `src/views/calendar-renderer.ts:862-864`; styled `styles.css:17361-17373`; no `is-mobile` rule exists against it, while the sibling `.db-calendar-month-time` is hidden on mobile at `styles.css:17791`. Notion prints no such string on any multi-day bar it draws: three frames of one entry observed across a drag, eleven weeks of bar between them (`057/notion-screens-digest.md:163-171` and `:226-231`; screens `23cdb6d5`, `1c3f11f8`, `132e14f0`) | Met | - |
| AC-002 | REQ-001 | Given the same event, When a user reads the chip's tooltip or opens the day or overflow popover, Then the full `start-end` range is still present | Assert `getSegmentTitle`'s output still carries the range after AC-001 lands; render `calendar-renderer.ts:628` and `:930` and read the span | Met | - |
| AC-003 | REQ-002 | Given the phone profile, When the toolbar mini calendar or the date-edit popover paints a day cell, Then every `.db-calendar-mini-day` hit target reads **>= 44 CSS px** | Computed-style read per profile, pinned with a negative control. **Observed red on `3e1c3c65`: 34px** (`styles.css:15938`) and **28px** in the date-edit variant (`styles.css:6942`, inside a `(hover: hover)` block a touch device never enters). No `mini-*` selector carries a touch floor anywhere in the stylesheet - swept across all eight `(pointer: coarse)` / `(hover: none)` blocks and every `.is-phone` / `body.is-mobile` calendar rule. The calendar's own touch floors sit at `styles.css:20733-20856`, `:18492-18511` and the `.is-phone` rule at `:18628-18630`, and none of the three reaches a `mini-*` selector | Met | - |
| AC-004 | REQ-002 | Given `(pointer: coarse)`, When either picker variant paints a day cell, Then the hit target reads **>= 28 CSS px**, and the hover-scoped desktop density at `styles.css:6942` is unchanged | Six-row matrix: {toolbar mini, date-edit} x {phone, coarse, hover desktop}, all six read from computed style | Met | - |
| AC-005 | REQ-003 | Given the four Notion-versus-Anytype conflicts the harvest named, When `decision-record.md` is read, Then each has an ADR citing the Notion screen id and our `file:line` for both readings, and none un-ticks a `Met` row in `057/acceptance-criteria.md` | ADR-001 (chip presentation), ADR-002 (week start), ADR-003 (drop target), ADR-004 (today hue); re-read `057/acceptance-criteria.md` and confirm it still reads 13 `Met` of 15 | Met | - |
| AC-006 | REQ-004 | Given the four research rows the calendar rebuild closed while the loop ran, When this packet is read, Then each is recorded as verification with its `main`-side evidence rather than proposed as work | Section 3 below | Met | - |
| AC-007 | REQ-005 | Given the device-only checks the loop consolidated, When this packet closes, Then D1-D4 are recorded as an operator checklist and none is ticked by any agent | Section 4 below; the rows stay unticked until the operator reports | Met | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`.
<!-- /ANCHOR:criteria -->

---

## 3. CLOSED ON MAIN BEFORE THIS PACKET OPENED

The research loop ranked six rows. Four of them closed on `main` between the loop's baseline and this
packet, in the calendar rebuild (`b00de6d2`, `093751d8`, `dcf025fc`). They are recorded here so the
child does not propose work that already shipped, and so a reader can see which of the loop's numbers
are stale rather than wrong.

| Loop row | What the research measured | What `3e1c3c65` reads | Owner row |
|---|---|---|---|
| `+N more` band reset | A 288x26 `#323232` filled band with centred text | `.db-calendar-more-events` carries `border: 0; border-radius: 0; background: none; box-shadow: none; text-align: left`, muted ink at a 10px inset, with `min-width: 0` and an ellipsis bounding it inside its own column (`styles.css:16677-16695`) | `057` G5 and G8, both `Met` |
| Toolbar segmented control | A bordered, filled segmented pill and a 34 CSS px title gap | `.db-calendar-scale-button` is `border: 0; border-radius: 0; background: none; box-shadow: none`, active and hover included (`styles.css:16393-16420`); four controls; `.db-calendar-title { gap: 12px }` | `057` G13, `Met` |
| Unscheduled chip touch floor | No 44px rule reached the chip | The chip is now `.db-calendar-nav-button.is-text.db-calendar-unscheduled-chip` (`styles.css:17880`) and inherits `.is-phone .db-calendar-nav-button { min-width: 44px; min-height: 44px }` (`styles.css:18628-18630`) | `044`'s phone floor |
| Week start | Sunday by default, against Anytype's 20-of-20 Monday | `getLocaleWeekStartsOn` returns `1` for any unset config, with the locale fallback removed and the operator's ruling in the comment (`src/data/calendar-date-time.ts:172-180`) | `057` G7, `Met`, under `057` ADR-007 |

One further row moved rather than closed. The loop ranked the multi-day range string as its highest-impact
finding and located it in the **month grid**. P0-3 had already rebuilt the month grid to one chip per covered
day with no inline range - the code says so in its own comment, *"No date-range text renders in the grid"*
(`src/views/calendar-renderer.ts:417-425`) - so the finding now lands on the one in-grid multi-day bar that
survives, the week and day all-day strip. The evidence is unchanged; the target moved. That is AC-001.

---

## 4. DEVICE-ONLY CHECKS (OPERATOR)

Consolidated from the research loop's D-register. **No agent ticks a row here.**

| # | Check | Red-first on `3e1c3c65` | What the operator confirms |
|---|---|---|---|
| D1 | Does a phone date-edit present as a popover, or as an `044` bottom sheet? | `styles.css:6941-6945` is the only date-edit-scoped block and it sits under `(hover: hover)` | Which chrome the phone actually takes, so AC-003's lift is scoped to the selector that carries it |
| D2 | Is the picker's day cell comfortably tappable after the lift? | 34px today | The target is reachable by thumb, not merely >= 44px on paper |
| D3 | Does the all-day strip read correctly without its range string on a phone? | The string renders on the phone today; no `is-mobile` rule against it | The bar still communicates its span through position and continuation markers alone |
| D4 | Does the phone week overlap stagger stay legible at 45px? | Carried from `057` T020's amendment | Legible on the device, not only >= the 16px paint floor |

---

<!-- ANCHOR:closure -->
## 5. CLOSURE STATEMENT

**Closeable:** Yes

AC-001 through AC-007 are `Met`. The device checklist (section 4, D1-D4) is operator-owned by design
(AC-007) and never gates this packet's own closure - it is handed off, not blocked on.
<!-- /ANCHOR:closure -->
