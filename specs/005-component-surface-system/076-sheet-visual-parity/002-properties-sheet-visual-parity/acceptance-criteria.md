---
title: "Acceptance Criteria: Properties Sheet Visual Parity"
description: "The criteria this phase must satisfy before it may be closed, including the rubric thresholds and the operator row."
trigger_phrases:
  - "acceptance criteria"
  - "002-properties-sheet-visual-parity acceptance criteria"
  - "002 rubric thresholds"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Properties Sheet Visual Parity

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/002-properties-sheet-visual-parity
**Level:** 2
**Status:** DEFINE, PLAN and CREATE complete — awaiting LAND/JUDGE
**Date:** 2026-09-11
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the 299×678 ceiling, When any target is written, Then every numeric cell in §13 is traceable to our own measurement or reads `TBD — needs operator capture` | `spec.md` §13; `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given the sheet's grammar, When the surfaces are enumerated, Then every production producer painting it is listed in `spec.md` §3 and covered by the lane | `spec.md` §3; lane output | Met | - |
| AC-003 | REQ-003 | Given each lane clause, When it is added, Then its failing number is recorded before the producer moves and its passing number after | `tasks.md` T003-T008; lane RED/GREEN pair | Met | - |
| AC-004 | REQ-004 | Given our phone capture and the reference, When a reviewer scores the eight-row rubric, Then the total is **≥ 14/16** with **no row at 0** | `verification.md`, score table #1 | Unmet | - |
| AC-005 | REQ-004 | Given an unchanged tree, When the reviewer scores it a second time, Then it passes again at the same thresholds | `verification.md`, score table #2 — **two consecutive passes** | Unmet | - |
| AC-006 | REQ-005 | Given the change, When recaptured at the phone viewport, Then light and dark are both current and both were opened and looked at | `npm run screenshots:verify` 0 stale; `tasks.md` T009 | Met | - |
| AC-007 | REQ-006 | Given the change, When the `071` clauses this sheet already carries re-run unchanged, Then they still pass | Lane exit 0, same run as AC-003 | Met | - |
| AC-008 | REQ-007 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report it aligned | Operator's own device read (D5) — **no agent ticks this row** | Unmet | - |

### The rubric AC-004 and AC-005 score

Eight rows, **0 / 1 / 2** each, maximum **16**. Defined in full in `../spec.md` §5.

| Row | What it scores |
|---|---|
| Frame | Canvas colour token, corner radius, handle, header layout |
| Sections | Which groups exist, in what order, separated how |
| Row anatomy | Leading icon, label, trailing element, and their order |
| Controls | Control kind and affordance — an input where the reference navigates scores 0 |
| Type | Scale and weight hierarchy |
| Spacing | Pitch, inset and gaps |
| Colour | Text, secondary, divider and accent |
| Both themes | Light and dark each internally consistent and structurally matched |

**Pass: total ≥ 14 AND no row at 0.** A 13 fails with seven 2s. Any 0 fails at any total.

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by another criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** not yet — nothing has started. When the eight rows above are reached, AC-008 is the one that stays open: the operator's own device read, which no agent ticks. AC-005 is the row that most often blocks closure, because it requires the judge to pass a **second** time on a tree nothing has touched since the first pass — a re-judge after a fix is a new iteration, not the second pass.
<!-- /ANCHOR:closure -->
