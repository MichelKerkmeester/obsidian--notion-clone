---
title: "Acceptance Criteria: Checkbox Controls (Size and Radio Removal)"
description: "The criteria this packet must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "073 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Checkbox Controls (Size and Radio Removal)

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 073-checkbox-controls
**Level:** 2
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the app's full source tree, When grepped for radio-shaped controls (`type="radio"`, circular-toggle classes), Then the inventory table's row count matches | Inventory table cross-checked against grep count | Unmet | - |
| AC-002 | REQ-002 | Given each inventoried boolean radio-style control, When converted, Then it renders and behaves as a checkbox | Before/after capture per control | Unmet | - |
| AC-003 | REQ-003 | Given the Notion/Anytype reference, When phone checkbox size is measured, Then the implemented size matches within a documented tolerance | Measurement table, before/after capture | Unmet | - |
| AC-004 | REQ-004 | Given the Database Testbed board's "Pinned" control (R3 evidence), When `070` restores property reads and this packet lands, Then the control renders as a checkbox showing its real value | Board recapture | Unmet | - |
| AC-005 | REQ-003 | Given the shipped fix, the operator confirms on their own phone that checkboxes are the right size and no radio inputs remain | Operator device check — **operator-owned, never ticked by an agent** | Unmet | - |

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
