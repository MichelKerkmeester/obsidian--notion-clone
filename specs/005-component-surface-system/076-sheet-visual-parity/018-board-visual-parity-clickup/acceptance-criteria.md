---
title: "Acceptance Criteria: Board Visual Parity (ClickUp)"
description: "The criteria this phase must satisfy before it may be closed, including the rubric thresholds and the operator row."
trigger_phrases:
  - "acceptance criteria"
  - "018-board-visual-parity-clickup acceptance criteria"
  - "018 rubric thresholds"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Board Visual Parity (ClickUp)

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/018-board-visual-parity-clickup
**Level:** 2
**Status:** Scaffolded — nothing started
**Date:** 2026-09-11
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the column header, When rendered, Then it carries a status-coloured pill, count, and trailing collapse + add controls | Lane clause, new | Unmet | - |
| AC-002 | REQ-002 | Given a collapsed column, When rendered, Then it shows a narrow vertical pill with rotated status name + count | Lane clause, new | Unmet | - |
| AC-003 | REQ-003 | Given the column body, When rendered, Then it carries a low-alpha status-colour wash and a matching outline | Lane clause, new | Unmet | - |
| AC-004 | REQ-004 | Given the card, When rendered, Then it shows a section label (if configured), a title row with status/relation icons, and a meta row with assignee, priority and date | `verification.md` | Unmet | - |
| AC-005 | REQ-005 | Given the change, When `012`'s lane clauses and `board-card-properties-panel.test.ts` run, Then both pass unchanged | Lane exit 0, Vitest | Unmet | - |
| AC-006 | REQ-006 | Given the departure from `056` ADR-001, When recorded, Then a Proposed ADR exists in `../../roadmap.md` §7 naming the operator's ruling as its resolution | `../../roadmap.md` §7 | Unmet | - |
| AC-007 | REQ-007 | Given the board capture and the ClickUp reference, When a reviewer scores the eight-row rubric, Then the total is ≥ 14/16 with no row at 0 | `verification.md`, score table #1 | Unmet | - |
| AC-008 | REQ-007 | Given an unchanged tree, When scored a second time, Then it passes again | `verification.md`, score table #2 | Unmet | - |
| AC-009 | REQ-008 | Given every DEFINE row, When read, Then board-specific rows name ClickUp as their Source | `spec.md` §13 | Unmet | - |
| AC-010 | REQ-010 | Given the redesigned board, When the operator re-reads it on their own iPhone, Then they report it matching ClickUp's styling | Operator's own device read — no agent ticks this row | Unmet | - |

### The rubric AC-007 and AC-008 score

Eight rows, 0/1/2 each, maximum 16, per `../spec.md` §5, scored against `clickup-board-column-headers-reference.png`.

| Row | What it scores |
|---|---|
| Frame | Column shape, radius, tint/outline vs. the reference |
| Sections | Header / body / card as distinct, correctly bounded regions |
| Row anatomy | Card's section label, title row, meta row order and content |
| Controls | Collapse and add controls read as controls, not decoration |
| Type | Header and card type scale/weight vs. the reference |
| Spacing | Column padding, inter-card gap vs. the reference |
| Colour | Status colour applied consistently to pill, count, tint and outline |
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

**Closeable:** not yet — nothing has started. AC-010 stays open until the operator reads it. AC-006's roadmap ADR entry is a documentation prerequisite, not a code gate, and should land at DEFINE rather than at close-out.
<!-- /ANCHOR:closure -->
