---
title: "Acceptance Criteria: Properties Sheet Row Model"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "009-properties-sheet-row-model acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Properties Sheet Row Model

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/009-properties-sheet-row-model
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
| AC-002 | REQ-002 | Given a properties row, When its interactive descendants are counted by the lane, Then there are at most 4 | Lane RED→GREEN (RED: 6 per row) | Unmet | - |
| AC-003 | REQ-003 | Given any property, When its row label is read on the phone presentation, Then it contains no bracketed internal key | Lane RED→GREEN (RED: every row, e.g. `Name [file.name]`) | Unmet | - |
| AC-004 | REQ-004 | Given at least one hidden property, When the sheet renders, Then it shows a Shown section and a Hidden section, each header carrying its own bulk action | Lane + capture | Unmet | - |
| AC-005 | REQ-005 | Given the wrap and delete controls, When removed from the list row, Then both are reachable from an edit-property sheet and neither behaviour is lost | Unit test + manual path check | Unmet | - |
| AC-006 | REQ-006 | Given the change, When the sheet's landed clauses rerun unchanged, Then the 3/3 section-boundary hairlines, the row pitch and the 0 native-select count all still pass | Regression check, command output | Unmet | - |
| AC-007 | REQ-007 | Given the redesign, When recaptured phone-only light and dark, Then a measured before/after is recorded against `spec.md` §13 | Capture diff, `implementation-summary.md` | Unmet | - |
| AC-008 | SC-004 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report the Properties sheet aligned | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

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
