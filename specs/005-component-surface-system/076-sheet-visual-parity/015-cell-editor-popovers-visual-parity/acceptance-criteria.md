---
title: "Acceptance Criteria: Inline Cell-Editor Popovers Visual Parity"
description: "The criteria this phase must satisfy before it may be closed, including the rubric thresholds and the operator row."
trigger_phrases:
  - "acceptance criteria"
  - "015-cell-editor-popovers-visual-parity acceptance criteria"
  - "015 rubric thresholds"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Inline Cell-Editor Popovers Visual Parity

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/015-cell-editor-popovers-visual-parity
**Level:** 2
**Status:** Scaffolded — nothing started
**Date:** 2026-09-11
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given either editor's popover, When rendered, Then no card container surrounds the control | `tools/live/sheet-grammar.mjs`, new clause | Unmet | - |
| AC-002 | REQ-002 | Given the Anytype reference, When compared, Then the form-factor mismatch (full sheet vs. inline popover) is recorded in `spec.md` §13 | `spec.md` §13 | Unmet | - |
| AC-003 | REQ-003 | Given the capture and the chosen reference, When a reviewer scores the eight-row rubric, Then the total is ≥ 14/16 with no row at 0 | `verification.md`, score table #1 | Unmet | - |
| AC-004 | REQ-003 | Given an unchanged tree, When scored a second time, Then it passes again | `verification.md`, score table #2 | Unmet | - |
| AC-005 | REQ-004 | Given every DEFINE row, When read, Then each names a Source reference and why | `spec.md` §13 | Unmet | - |
| AC-006 | REQ-005 | Given the redesigned popovers, When the operator re-reads a cell editor on their own iPhone, Then they report it aligned | Operator's own device read — no agent ticks this row | Unmet | - |

### The rubric AC-003 and AC-004 score

Eight rows, 0/1/2 each, maximum 16, per `../spec.md` §5, scored against Anytype's cell-sheet reference read structurally.

| Row | What it scores |
|---|---|
| Frame | No card container at the popover's own scale |
| Sections | n/a for a single-control popover, scored as pass unless a container is present |
| Row anatomy | Control kind matches the property type |
| Controls | Text/select affordance reads correctly |
| Type | Label/value scale matches the sheet family |
| Spacing | Popover inset matches the divider grammar's spirit |
| Colour | Token contrast in both themes |
| Both themes | Light and dark structurally matched |

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

**Closeable:** not yet — nothing has started. AC-006 stays open until the operator reads it.
<!-- /ANCHOR:closure -->
