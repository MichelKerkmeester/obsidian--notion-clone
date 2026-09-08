---
title: "Acceptance Criteria: Linked View Blocks UX and Mobile Drag Parity"
description: "The criteria this packet must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "072 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Linked View Blocks UX and Mobile Drag Parity

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 072-linked-view-blocks-ux
**Level:** 2
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the 0.0.32 build, When embedded/linked views and table row/column drag are both checked, Then the finding names which surface(s) R2 describes with file:line evidence | Investigation notes in `plan.md` | Unmet | - |
| AC-002 | REQ-002 | Given the confirmed surface(s), When inspected, Then every UI/UX defect is enumerated in a table | `spec.md` or `plan.md` defect table | Unmet | - |
| AC-003 | REQ-003 | Given a Notion reference capture of the equivalent drag interaction, When the fix lands, Then a side-by-side measurement shows the mobile drag matching it | Before/after capture with measurement | Unmet | - |
| AC-004 | REQ-003 | Given the fix, the operator confirms on their own phone that dragging feels right | Operator device check — **operator-owned, never ticked by an agent** | Unmet | - |

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
