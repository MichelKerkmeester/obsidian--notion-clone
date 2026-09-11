---
title: "Acceptance Criteria: Utility DbModal Sheets Visual Parity"
description: "The criteria this phase must satisfy before it may be closed, including the rubric thresholds and the operator row."
trigger_phrases:
  - "acceptance criteria"
  - "017-utility-modal-sheets-visual-parity acceptance criteria"
  - "017 rubric thresholds"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Utility DbModal Sheets Visual Parity

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/017-utility-modal-sheets-visual-parity
**Level:** 2
**Status:** Scaffolded — nothing started
**Date:** 2026-09-11
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given any of the 18 surfaces, When rendered, Then no nested card container renders beyond the single DbModal sheet frame | `tools/live/sheet-grammar.mjs`, new clause | Unmet | - |
| AC-002 | REQ-002 | Given all 18 surfaces, When T001 diffs them, Then shared-chrome status is recorded for each, with any divergence named | `spec.md` §13 | Unmet | - |
| AC-003 | REQ-003 | Given `ChartDrilldownModal`, When its construction sites are checked, Then its live/archived status is recorded before inclusion or exclusion | `spec.md` §13 | Unmet | - |
| AC-004 | REQ-004 | Given the representative sample capture, When a reviewer scores the eight-row rubric, Then the total is ≥ 14/16 with no row at 0 | `verification.md`, score table #1 | Unmet | - |
| AC-005 | REQ-004 | Given an unchanged tree, When scored a second time, Then it passes again | `verification.md`, score table #2 | Unmet | - |
| AC-006 | REQ-005 | Given every DEFINE row, When read, Then the reference cell reads `none` explicitly rather than a fabricated value | `spec.md` §13 | Unmet | - |
| AC-007 | REQ-006 | Given the redesigned modals, When the operator re-reads one on their own iPhone, Then they report it aligned | Operator's own device read — no agent ticks this row | Unmet | - |

### The rubric AC-004 and AC-005 score

Eight rows, 0/1/2 each, maximum 16, per `../spec.md` §5, scored on the representative sample (import confirm, formula modal, status options) for internal consistency with the `001`-`016` sheet-chrome grammar — no external reference exists for this child.

| Row | What it scores |
|---|---|
| Frame | Single sheet frame, no nested card container |
| Sections | Form sections separated by dividers, not containers |
| Row anatomy | Label + control per form row, consistent with other sheets |
| Controls | Each modal's own controls unaffected in kind, only in chrome |
| Type | Label scale/weight matches the sheet family |
| Spacing | Section spacing matches the divider grammar |
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

**Closeable:** not yet — nothing has started. AC-007 stays open until the operator reads it. AC-002's exhaustive 18-surface diff is the row most likely to surface follow-up work.
<!-- /ANCHOR:closure -->
