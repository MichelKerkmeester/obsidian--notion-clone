---
title: "Acceptance Criteria: Phone Toolbar Labelled Buttons"
description: "The criteria this packet must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "075 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Phone Toolbar Labelled Buttons

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 075-toolbar-labelled-buttons
**Level:** 2
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the operator's reference screenshot, When its label size and spacing are measured, Then the implemented toolbar buttons match within a documented tolerance | Measurement table in `plan.md`, before/after capture | Unmet | - |
| AC-002 | REQ-002 | Given the implemented buttons, When measured with `tools/live/touch-targets.mjs`, Then every touch target is ≥44×44px | Command output | Unmet | - |
| AC-003 | REQ-003 | Given the toolbar at a 402px viewport with every control enabled, When rendered, Then row height equals one button row, `scrollWidth > clientWidth`, and the last control is reachable by scroll — a declared red before the fix, green after | New lane, red-then-green output | Unmet | - |
| AC-004 | REQ-004 | Given the existing `009`/`044` toolbar-collapse and sheet-grammar lanes, When rerun against the new scroll behavior, Then they are updated and pass (no stale collapse-behavior assertion left green by accident) | Lane output | Unmet | - |
| AC-005 | REQ-005 | Given the desktop toolbar, When a same-labels-or-unchanged decision is made, Then it is recorded as an ADR citing Notion/Anytype/Bases references | `decision-record.md` | Unmet | - |
| AC-006 | REQ-001 | Given the shipped fix, the operator confirms on their own phone that the toolbar reads and scrolls as expected | Operator device check — **operator-owned, never ticked by an agent** | Unmet | - |

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
