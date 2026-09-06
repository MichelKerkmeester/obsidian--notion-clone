---
title: "Acceptance Criteria: Card Title and Title Formats"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "058 acceptance criteria"
  - "closure gate"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/058-card-title-and-title-formats"
    last_updated_at: "2026-09-06T09:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the acceptance criteria from goal.md's completion criteria"
    next_safe_action: "T003 measures the red; T004/T005 close AC-001/AC-002"
    blockers: []
    key_files:
      - "src/data/title-field-display.ts"
      - "src/views/board-card-properties-panel.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-058-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Card Title and Title Formats

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/058-card-title-and-title-formats
**Level:** 2
**Status:** Draft
**Date:** 2026-09-06
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a board view with a currency column set as `titleField`, When the card renders, Then its main name reads that column's formatted value (e.g. `€ 3.537,32`), not the raw stored number | `title-field-display.test.ts`, a currency-titled fixture asserting the formatted string; red before green per T003/T004 | Unmet | - |
| AC-002 | REQ-001 | Given the same view opened as a record sheet on desktop, When the header renders, Then it reads the identical formatted title | `record-detail-panel` header test against the same fixture | Unmet | - |
| AC-003 | REQ-001 | Given the same view opened as the phone record sheet, When the header renders, Then it reads the identical formatted title | Same fixture, phone-sheet presentation | Unmet | - |
| AC-004 | REQ-002 | Given the board's Properties sheet is open, When the operator taps the Title row, Then the `titleField` picker opens | `board-card-properties-panel` test asserting a click handler on the Title row and none on the Cover row (negative control) | Unmet | - |
| AC-005 | REQ-003 | Given a date column set as `titleField`, When a title renders, Then it reads the plugin's existing date format, not an ISO string | `title-field-display.test.ts`, a date-titled fixture | Unmet | - |
| AC-006 | REQ-004 | Given any view but calendar/timeline, When its `titleField` is set, Then the board card, the desktop record header and the phone record sheet all read the identical value | New regression test against `getRecordEventTitleField` and the board's own title getter | Unmet | - |
| AC-007 | — | Given the packet is closed, When `npm run gate` runs, Then it exits 0 with the new lane row observed red before green, and `npm run replay` holds with reversed 0 | `npm run gate`, `npm run replay`, `$?` read directly | Unmet | - |
| AC-008 | — | Given a released build, When the operator sets a currency column as a board's card title on their phone, Then they report it formatted correctly and report being able to change which property is the card's name | Operator confirmation only | Unmet | - |

### Status values

| Value | Meaning |
|-------|-------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

This packet is at its opening documentation leg: `goal.md`'s decisions and `spec.md`'s scope are
written from reading the existing `titleField`/`resolveTitleFieldDisplay` mechanism, but no code
has changed yet (T003 onward in `tasks.md`). AC-001 through AC-007 stay `Unmet` until that work
lands and is verified; AC-008 is the operator's alone, per D3 in the parent `goal.md`.
<!-- /ANCHOR:closure -->
