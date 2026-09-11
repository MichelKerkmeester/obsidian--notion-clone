---
title: "Acceptance Criteria: Board Card Drag Feel (ClickUp)"
description: "The criteria this phase must satisfy before it may be closed, including the rubric thresholds and the operator row."
trigger_phrases:
  - "acceptance criteria"
  - "019-board-card-drag-feel-clickup acceptance criteria"
  - "019 rubric thresholds"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Board Card Drag Feel (ClickUp)

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/019-board-card-drag-feel-clickup
**Level:** 2
**Status:** Scaffolded — nothing started
**Date:** 2026-09-11
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given a long-press drag, When the ghost mounts, Then it is compact (title + one key field), rotated ~3°, with a soft shadow | DOM-state lane clause, new | Unmet | - |
| AC-002 | REQ-002 | Given an active drag, When the source column is inspected, Then a dimmed placeholder occupies the card's original slot | DOM-state lane clause, new | Unmet | - |
| AC-003 | REQ-003 | Given the finger over a column, When inspected, Then that column shows an accent outline, its header stays visible, and neighbours dim | DOM-state lane clause, new | Unmet | - |
| AC-004 | REQ-004 | Given a drag near the board's edge, When held there, Then the board auto-scrolls | DOM-state lane clause, new | Unmet | - |
| AC-005 | REQ-005 | Given the change, When `069`'s existing clauses run, Then they pass unchanged | Lane exit 0 | Unmet | - |
| AC-006 | REQ-006 | Given the mid-drag capture and the ClickUp reference, When a reviewer scores the eight-row rubric, Then the total is ≥ 14/16 with no row at 0 | `verification.md`, score table #1 | Unmet | - |
| AC-007 | REQ-006 | Given an unchanged tree, When scored a second time, Then it passes again | `verification.md`, score table #2 | Unmet | - |
| AC-008 | REQ-010 | Given every DEFINE row, When read, Then each names ClickUp or `069`'s mechanism as its Source | `spec.md` §13 | Unmet | - |
| AC-009 | REQ-011 | Given the redesigned drag, When the operator drags a card on their own iPhone, Then they report it feeling like ClickUp | Operator's own device read — no agent ticks this row | Unmet | - |

### The rubric AC-006 and AC-007 score

Eight rows, 0/1/2 each, maximum 16, per `../spec.md` §5, scored on a mid-drag capture against `clickup-board-card-drag-reference.png`.

| Row | What it scores |
|---|---|
| Frame | Ghost shape, radius, shadow vs. the reference |
| Sections | Source placeholder vs. target column vs. neighbouring columns, correctly distinguished |
| Row anatomy | Ghost's compact title + key-field content |
| Controls | The drag itself reads as an active manipulation, not a static state |
| Type | Ghost's type scale matches the board card's own |
| Spacing | Ghost offset from the finger, placeholder sizing |
| Colour | Target-column outline/dim colours vs. the reference |
| Both themes | Light and dark each internally consistent and structurally matched |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR. |
| `Superseded` | Replaced by another criterion or decision. Requires an ADR. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** not yet — nothing has started. AC-009 stays open until the operator reads it. AC-005 is the row most at risk, since this is the first `076` child to modify an already-working interaction rather than a static-only surface.
<!-- /ANCHOR:closure -->
