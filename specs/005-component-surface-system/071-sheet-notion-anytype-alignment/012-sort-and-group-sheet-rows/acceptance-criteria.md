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
**Status:** Draft — scaffolded, not implemented
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per measured property, plus the operator's device row.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any assertion is written, Then every numeric target is traceable to our own measurement and none to a 299x678 Notion asset | `spec.md` §13's Target column; `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given a sort rule, When measured by the lane, Then its property and direction render on 2 rows and the row carries at most 4 interactive controls | Lane RED→GREEN (RED: 1 row, 5 controls) | Unmet | - |
| AC-003 | REQ-003 | Given a sort rule, When its delete affordance is read, Then it is a labelled destructive row and 0 `×` glyphs remain on the rule row | Lane + capture | Unmet | - |
| AC-004 | REQ-004 | Given the sort sheet, When its reorder controls are counted, Then exactly one affordance is present, and the choice is recorded with its evidence | Lane RED→GREEN (RED: 2) + `decision-record.md` | Unmet | - |
| AC-005 | REQ-005 | Given at least one hidden group, When the group sheet renders, Then it shows a Shown section and a Hidden section, each header carrying its bulk action | Lane + capture | Unmet | - |
| AC-006 | REQ-006 | Given a group row, When its interactive descendants are counted, Then there are at most 4 | Lane RED→GREEN | Unmet | - |
| AC-007 | REQ-007 | Given the sort sheet body, When its prose is measured, Then no run exceeds 80 characters or it sits behind an info affordance | Lane clause (RED: 150 characters) | Unmet | - |
| AC-008 | REQ-008 | Given the changes, When `005`'s sort and group clauses rerun unchanged on both engines, Then they still pass | Regression check, command output | Unmet | - |
| AC-009 | REQ-009 | Given the redesign, When recaptured phone-only light and dark, Then a measured before/after is recorded against `spec.md` §13 | Capture diff, `implementation-summary.md` | Unmet | - |
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

**Closeable:** No — scaffold only. AC-001 is Met (the audit completed the reference and
current-state reading, and every numeric target in `spec.md` §13 is traceable to our own
measurement rather than to a 299x678 Notion asset). The remaining criteria require implementation,
deferred to a GLM 5.3 flash leg executing `tasks.md`. The final row requires the operator's own
device read (D3) and no agent may tick it.
<!-- /ANCHOR:closure -->
