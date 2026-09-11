---
title: "Acceptance Criteria: Board Card Properties Sheet Visual Parity"
description: "The criteria this phase must satisfy before it may be closed, including the rubric thresholds and the operator row."
trigger_phrases:
  - "acceptance criteria"
  - "013-board-card-properties-visual-parity acceptance criteria"
  - "013 rubric thresholds"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Board Card Properties Sheet Visual Parity

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/013-board-card-properties-visual-parity
**Level:** 2
**Status:** Scaffolded — nothing started
**Date:** 2026-09-11
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the sheet's rows, When rendered, Then no card container or tinted background surrounds any row group | `tools/live/sheet-grammar.mjs`, new clause | Unmet | - |
| AC-002 | REQ-002 | Given `002`'s row shell, When T001 checks sharing, Then the finding is recorded in `spec.md` §13 before any producer edit | `spec.md` §13 | Unmet | - |
| AC-003 | REQ-003 | Given our phone capture and the DEFINE table's references, When a reviewer scores the eight-row rubric, Then the total is ≥ 14/16 with no row at 0 | `verification.md`, score table #1 | Unmet | - |
| AC-004 | REQ-003 | Given an unchanged tree, When scored a second time, Then it passes again | `verification.md`, score table #2 | Unmet | - |
| AC-005 | REQ-004 | Given every DEFINE row, When read, Then each names a Source reference and why | `spec.md` §13 | Unmet | - |
| AC-006 | REQ-005 | Given the change, When `board-card-properties-panel.test.ts` runs, Then it passes without modification | Vitest | Unmet | - |
| AC-007 | REQ-006 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report it aligned | Operator's own device read — no agent ticks this row | Unmet | - |

### The rubric AC-003 and AC-004 score

Eight rows, 0/1/2 each, maximum 16, per `../spec.md` §5, scored against this child's chosen Notion/Anytype/ClickUp references (`spec.md` §13).

| Row | What it scores |
|---|---|
| Frame | No card container; plain sheet background |
| Sections | Row groups separated by dividers, not containers |
| Row anatomy | Drag handle, checkbox, label, icon in the agreed order |
| Controls | Checkbox and drag affordance read correctly |
| Type | Label scale/weight matches the sheet family |
| Spacing | Row pitch matches the divider grammar |
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

**Closeable:** not yet — nothing has started. AC-007 (the operator's own device read) stays open until the operator reads it; no agent ticks that row.
<!-- /ANCHOR:closure -->
