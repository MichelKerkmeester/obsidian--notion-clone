---
title: "Acceptance Criteria: Record Sheet Header and Property Icons"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "011-record-sheet-header-and-icons acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Record Sheet Header and Property Icons

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/011-record-sheet-header-and-icons
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
| AC-002 | REQ-002 | Given the title-centring clause, When its surface list is read, Then record-detail and record-peek are members | Lane source diff | Unmet | - |
| AC-003 | REQ-003 | Given record-detail and record-peek, When their titles are measured, Then each centre sits within 0.50px of the frame centre | Lane RED→GREEN (RED: left-anchored) | Unmet | - |
| AC-004 | REQ-004 | Given a record property row, When rendered, Then it carries its property's type icon | Lane RED→GREEN (RED: 0 of 21 rows carry one) | Unmet | - |
| AC-005 | REQ-005 | Given the header change, When `006`'s record clauses rerun unchanged, Then 21/21 rows at 44.0px, 20/20 hairlines, the 16.0px inset and 0 native selects all still pass | Regression check, command output | Unmet | - |
| AC-006 | REQ-006 | Given the record's open target, When this phase closes, Then it is unchanged and still owned by `006-record-open-target` | `git diff`; scope statement | Unmet | - |
| AC-007 | REQ-007 | Given the redesign, When recaptured phone-only light and dark, Then a measured before/after is recorded against `spec.md` §13 | Capture diff, `implementation-summary.md` | Unmet | - |
| AC-008 | SC-004 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report the record sheet aligned | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

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
