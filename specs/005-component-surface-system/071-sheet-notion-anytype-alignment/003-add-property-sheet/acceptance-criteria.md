---
title: "Acceptance Criteria: Add-Property Sheet Redesign"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "003-add-property-sheet acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Add-Property Sheet Redesign

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/003-add-property-sheet
**Level:** 3
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-002 | Given the property-type picker sheet with the keyboard open, When reproduced on the real renderer, Then the sheet covers the note header — a declared red before any fix | Harness/device reproduction, red observed | Unmet | - |
| AC-002 | REQ-002 | Given the fix, When the same reproduction is rerun, Then the sheet no longer covers the note header with the keyboard open | Harness/device reproduction, green observed | Unmet | - |
| AC-003 | REQ-002 | Given Phase 1's reference mapping, When the picker's list/grid layout is redesigned, Then it is captured against that reference | Before/after capture | Unmet | - |

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
