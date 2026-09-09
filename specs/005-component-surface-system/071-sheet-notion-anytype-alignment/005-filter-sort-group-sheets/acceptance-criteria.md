---
title: "Acceptance Criteria: Filter, Sort and Group Sheets Redesign"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "005-filter-sort-group-sheets acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Filter, Sort and Group Sheets Redesign

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/005-filter-sort-group-sheets
**Level:** 3
**Status:** Implemented
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given Phase 1's inventory, When this phase starts, Then it cites the exact reference mapping rows for filter, sort and group sheets | `spec.md:120` onward (filter-panel row 45, sort-panel row 44, group panel row 133 of `001/inventory.md`) | Met | - |
| AC-002 | REQ-002 | Given the redesigned sheets, When captured against their reference, Then layout is measured as converged | `tools/live/sheet-grammar.mjs:3294` (panel sheets row grammar: rows 44-52px, one 16px inset, one inset-to-inset span, 0 native selects, first-of-type 0px / later 1px painted dividers, no sideways scroll — all PASS for filter, sort and group) | Met | - |
| AC-003 | REQ-003 | Given the redesign, When the freeze-regression check from `85ff504` is rerun, Then it still passes | `tools/live/sheet-rebuild.mjs:978` (PASS — every rebuilt sheet still has the bar it opened with) | Met | - |

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

**Closeable:** Yes, pending the operator's own device recheck

All three criteria are Met by evidence gathered from this worktree's own verification chain (see
`tasks.md` §Phase 3 and `decision-record.md` ADR-001). Per the parent packet's D3 decision, only the
operator's own device recheck may close a device-level row; nothing here substitutes for that.
<!-- /ANCHOR:closure -->
