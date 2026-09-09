---
title: "Acceptance Criteria: Sheet Input and Action Order"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "013-sheet-input-and-action-order acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sheet Input and Action Order

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/013-sheet-input-and-action-order
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
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any assertion is written, Then every ordering target is an ordinal structural fact and every pixel number is ours | `spec.md` §13's Target column; `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given the stacked confirm, When its actions row is read, Then the destructive action is the first child and Cancel is the last | Lane RED→GREEN (RED: Cancel first) | Unmet | - |
| AC-003 | REQ-003 | Given the confirm card, When `061`'s geometry clauses rerun unchanged, Then the inset, radii, stacking and 44/50px heights all still pass | Regression check, command output | Unmet | - |
| AC-004 | REQ-004 | Given the add-view sheet, When its DOM order is read, Then the create affordance precedes the optional settings | Lane RED→GREEN | Unmet | - |
| AC-005 | REQ-005 | Given the add-view name input, When this phase closes, Then it still carries no placeholder | `git diff`; `toolbar-renderer.ts:1428-1430` | Unmet | - |
| AC-006 | REQ-006 | Given the date picker, When its DOM order is read, Then the calendar precedes the numeric segment inputs | Lane RED→GREEN | Unmet | - |
| AC-007 | REQ-007 | Given the date picker's presets group, When its members are counted, Then Clear is not among them | Lane RED→GREEN (RED: Clear is the 4th preset) | Unmet | - |
| AC-008 | REQ-008 | Given the toolbar overflow menu, When its rows are inspected, Then 0 free-text inputs share the surface with its action rows | Lane RED→GREEN | Unmet | - |
| AC-009 | REQ-009 | Given ADR-C, When this phase closes, Then the layout choice still renders as rows and the question is recorded as Proposed, not resolved | `../sheet-notion-audit.md` §6 ADR-C | Unmet | - |
| AC-010 | REQ-010 | Given the four surfaces, When recaptured phone-only light and dark, Then a measured before/after is recorded for each | Capture diff, `implementation-summary.md` | Unmet | - |
| AC-011 | SC-004 | Given the reordered sheets, When the operator re-reads them on their own iPhone, Then they report the four aligned | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

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
