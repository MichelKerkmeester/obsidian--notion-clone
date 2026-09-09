---
title: "Acceptance Criteria: Sheet Polish"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "014-sheet-polish acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sheet Polish

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/014-sheet-polish
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
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any target is written, Then every number is ours and none is derived from a 299x678 Notion asset | `spec.md` §13's Target column | Met | - |
| AC-002 | REQ-002 | Given the icon picker, When its search row is inspected, Then Remove, Random and the settings button are not among its siblings | Lane RED→GREEN (RED: 3 buttons share the row) | Unmet | - |
| AC-003 | REQ-003 | Given the icon picker's Remove, When promoting it to the header would require changing the shared `createSheetHeader`, Then the item is recorded Proposed and the builder is left untouched | `decision-record.md`; `git diff` over `mobile-bottom-sheet.ts` | Unmet | - |
| AC-004 | REQ-004 | Given the properties and record sheets, When their add affordances render, Then each is a full-width row rather than one of a side-by-side pair | Lane + capture | Unmet | - |
| AC-005 | REQ-005 | Given the changes, When every landed sheet clause reruns unchanged, Then all still pass on both engines | Regression check, command output | Unmet | - |
| AC-006 | REQ-006 | Given each changed surface, When recaptured phone-only light and dark, Then a before/after is recorded | Capture diff, `implementation-summary.md` | Unmet | - |
| AC-007 | SC-004 | Given the polished surfaces, When the operator re-reads them on their own iPhone, Then they report the items closed | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

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
