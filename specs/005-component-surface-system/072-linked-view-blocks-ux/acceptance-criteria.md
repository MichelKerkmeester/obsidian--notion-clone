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
**Status:** Implemented — 2026-09-08
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the 0.0.32 build, When embedded/linked views and table row/column drag are both checked, Then the finding names which surface(s) R2 describes with file:line evidence | Investigation notes in `plan.md` §3; the determination with the fence-vs-view/tab/picker evidence is `spec.md` §2 | Met | - |
| AC-002 | REQ-002 | Given the confirmed surface(s), When inspected, Then every UI/UX defect is enumerated in a table | `plan.md` §3 defect table — 6 rows: the fence's inert handle (fixed), the decorative control before it (fixed), the unmeasured embedded-board lift (measured, parity), and the 3 HTML5-only siblings (enumerated, other packets') | Met | - |
| AC-003 | REQ-003 | Given a Notion reference capture of the equivalent drag interaction, When the fix lands, Then a side-by-side measurement shows the mobile drag matching it | Red→green: the 4 gesture tests failed 2\|28 against the unfixed tree, 30/30 after; side-by-side: lane A (`tools/live/embedded-linked-view-ux.mjs`) drives 069's Notion-derived gesture through both action bags at 402×874 — lift, ghost delta 0.0 px, highlight, landing, release position, reverse, read-only all identical, exit 0 twice — and 069's own Notion-grammar proof still exits 0. Visual judgment of the *feel* remains AC-004's | Met | - |
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

**Closeable:** No — not while AC-004 stands, by design

AC-001/002/003 Met with the evidence in their Verification cells; AC-004 is the operator's device
pass, recorded unticked. Closing this packet is the operator's, once the gesture feels right on
their own phone.
<!-- /ANCHOR:closure -->
