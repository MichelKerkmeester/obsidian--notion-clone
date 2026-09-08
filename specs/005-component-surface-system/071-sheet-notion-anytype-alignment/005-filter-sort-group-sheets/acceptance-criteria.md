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
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given Phase 1's inventory, When this phase starts, Then it cites the exact reference mapping rows for filter, sort and group sheets | `plan.md`, quoting the Phase 1 rows | Unmet | - |
| AC-002 | REQ-002 | Given the redesigned sheets, When captured against their reference, Then layout is measured as converged | Before/after capture | Unmet | - |
| AC-003 | REQ-003 | Given the redesign, When the freeze-regression check from `85ff504` is rerun, Then it still passes | Regression check, command output | Unmet | - |

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

**Closeable:** No

Not yet started.
<!-- /ANCHOR:closure -->
