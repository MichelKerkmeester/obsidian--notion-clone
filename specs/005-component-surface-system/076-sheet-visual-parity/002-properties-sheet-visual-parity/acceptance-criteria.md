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
**Status:** CREATE landed, first judge pass 11/16 — frame-ruling remediation (D7) queued before re-judge
**Date:** 2026-09-11, remediation queued 2026-09-11
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the 299×678 ceiling, When any target is written, Then every numeric cell in §13 is traceable to our own measurement or reads `TBD — needs operator capture` | `spec.md` §13; `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given the sheet's grammar, When the surfaces are enumerated, Then every production producer painting it is listed in `spec.md` §3 and covered by the lane | `spec.md` §3; lane output | Met | - |
| AC-003 | REQ-003 | Given each lane clause, When it is added, Then its failing number is recorded before the producer moves and its passing number after | `tasks.md` T003-T008; lane RED/GREEN pair | Met for L1-L3/L5; **L4/L6 superseded (D7)** | D7 |
| AC-004 | REQ-004 | Given our phone capture and the reference, When a reviewer scores the eight-row rubric, Then the total is **≥ 14/16** with **no row at 0** | First pass scored **11/16** against the shipped two-container shape (D7, `../decision-record.md`); the rubric has since been rewritten (`../spec.md` §5) to score a card container at 0 on Frame, so this pass is superseded by the frame-ruling remediation, not re-attempted as-is | Unmet | - |
| AC-005 | REQ-004 | Given an unchanged tree, When the reviewer scores it a second time, Then it passes again at the same thresholds | `verification.md`, score table #2 — **two consecutive passes**, counted from the remediation pass onward | Unmet | - |
| AC-006 | REQ-005 | Given the change, When recaptured at the phone viewport, Then light and dark are both current and both were opened and looked at | `npm run screenshots:verify` 0 stale; `tasks.md` T009 | Met | - |
| AC-007 | REQ-006 | Given the change, When the `071` clauses this sheet already carries re-run unchanged, Then they still pass | Lane exit 0, same run as AC-003 | Met | - |
| AC-008 | REQ-007 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report it aligned | Operator's own device read (D5) — **no agent ticks this row** | Unmet | - |
| AC-009 | REQ-003 | **L4 (D7 target)** — 0 containers; dividers present. 0 card-like containers in either grouping state; 1 hairline divider when ≥1 column is hidden | 2 section containers, 0 dividers | Lane clause L4, rewritten (`tasks.md` T014-T016) | Unmet | - |
| AC-010 | REQ-003 | **L6 (D7 target)** — 0 containers; dividers present. The add-property row's background matches the sheet canvas | 1 container with a background distinct from canvas | Lane clause L6, rewritten (`tasks.md` T014-T016) | Unmet | - |
| AC-011 | REQ-003 | Row height widens to the **44-48pt** provisional range, alongside `076/001`'s own retune | 44px min, landed | Lane clause L5, retuned | Unmet | - |

### The rubric AC-004 and AC-005 score

Eight rows, **0 / 1 / 2** each, maximum **16**. Defined in full in `../spec.md` §5.

| Row | What it scores |
|---|---|
| Frame | Rows on the plain sheet background with dividers, no card container (D7); canvas colour token, corner radius, handle, header layout. A card container anywhere scores this row **0** regardless of everything else |
| Sections | Same sections, same order, same heading-plus-divider separation — no card boundary (D7) |
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

**Closeable:** no — AC-004, AC-005, AC-008, AC-009, AC-010 and AC-011 remain Unmet, and AC-003's L4/L6
half is superseded, not Met (D7, `../decision-record.md`). CREATE landed a two-container shape that
scored 11/16 on its first judge pass; the operator then ruled the card container out entirely (D7)
in the same session `076/001` was ruled on. `spec.md` §13 is rewritten to the divider target and
`tasks.md`'s `### Frame-ruling remediation (2026-09-11)` block (T014-T018) is what carries the
shipped tree there — none of it has run yet. AC-001, AC-002, AC-006 and AC-007 remain Met — the
frame-ruling remediation does not touch the eye-icon, contrast, capture-freshness or `071`-regression
clauses. What remains before AC-004/AC-005 can even be re-attempted is the remediation block; what
remains after that is unchanged: the image judge (twice consecutively) and the operator's own device
read (AC-008), neither of which this leg ticks.
<!-- /ANCHOR:closure -->
