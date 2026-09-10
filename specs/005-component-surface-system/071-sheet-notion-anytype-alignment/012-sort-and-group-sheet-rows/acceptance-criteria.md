---
title: "Acceptance Criteria: Sort and Group Sheet Rows"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "012-sort-and-group-sheet-rows acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sort and Group Sheet Rows

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/012-sort-and-group-sheet-rows
**Level:** 3
**Status:** Implemented — the operator's device read (AC-010) outstanding
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per measured property, plus the operator's device row.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any assertion is written, Then every numeric target is traceable to our own measurement and none to a 299x678 Notion asset | `spec.md` §13's Target column; `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given a sort rule, When measured by the lane, Then its property and direction render on 2 rows and the row carries at most 4 interactive controls | Lane RED→GREEN (RED: 1 row, 5 controls; GREEN: 6/6 rows 44–52px — 48, 44, 44, 48, 44, 44 — heaviest 3 controls, property rows 2 / direction rows 2 / 0 shared) | Met | - |
| AC-003 | REQ-003 | Given a sort rule, When its delete affordance is read, Then it is a labelled destructive row and 0 `×` glyphs remain on the rule row | Lane GREEN: 0 × glyphs, 2 labelled `is-warning` rows; the pre-change glyph's own box measured 28.0×28.0, painted hit box 40.0×40.0 (lane INFO line — 4px under the 44 floor, so the legibility-not-touch-target ruling is stronger than scaffolded; ADR-002) | Met | - |
| AC-004 | REQ-004 | Given the sort sheet, When its reorder controls are counted, Then exactly one affordance is present, and the choice is recorded with its evidence | Lane RED→GREEN (RED: 2, GREEN: 1 — the arrow pair, the one that carries the keyboard) + `decision-record.md` ADR-001, the Notion half PROVISIONAL pending the C-4 capture | Met | - |
| AC-005 | REQ-005 | Given at least one hidden group, When the group sheet renders, Then it shows a Shown section and a Hidden section, each header carrying its bulk action | Lane RED→GREEN (RED: 1 heading, 0 bulk actions; GREEN: 3 headings on the 16px inset, dividers 0/1/1 painted, 2 bulk actions on their own line); the constructed + hand captures both show the partition | Met | - |
| AC-006 | REQ-006 | Given a group row, When its interactive descendants are counted, Then there are at most 4 | Lane: heaviest group row 1 (clause ≤ 4, green both runs) | Met | - |
| AC-007 | REQ-007 | Given the sort sheet body, When its prose is measured, Then no run exceeds 80 characters or it sits behind an info affordance | Lane clause RED→GREEN (RED: 126 characters, GREEN: 74 — the shortened hint, both locales) | Met | - |
| AC-008 | REQ-008 | Given the changes, When `005`'s sort and group clauses rerun unchanged on both engines, Then they still pass | The 005 clauses (44–52px, 16px/16px, 1px divider, 0 native selects, one row span 357px, extent == clientWidth) ran unchanged and green on both engines in the same GREEN run; the whole lane exit 0 | Met | - |
| AC-009 | REQ-009 | Given the redesign, When recaptured phone-only light and dark, Then a measured before/after is recorded against `spec.md` §13 | Four `npm run screenshots` runs exit 0; 16 content-changed captures judged by decoded pixel delta and kept (579014–623107px the sort desktop pair, 10690–159338px the calendar pair, deltas 112–212); 2 one-run jitters restored; the numbers in `decision-record.md` §Evidence and the css-lane release (fcaf3fec28cf → 6e10b42f6324) | Met | - |
| AC-010 | SC-004 | Given the redesigned sheets, When the operator re-reads them on their own iPhone, Then they report both aligned | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** In-repo, yes — the implementation, the lane clauses, the unit contract and the full battery are landed and evidenced (`decision-record.md` §Evidence); the packet stays open on **AC-010 only**, the operator's own device read (D3), which no agent ticks. The reorder clause carries its Notion half as PROVISIONAL (ADR-001) until the audit's C-4 capture: no repository capture shows a Notion sort rule being reordered, so nothing here can decide it. One record correction: the glyph's expanded hit box measures 40.0×40.0 against the 44px floor, not the “already clears” the scaffold assumed (ADR-002) — the labelled row is what owns the 44px box now.
<!-- /ANCHOR:closure -->
