---
title: "Acceptance Criteria: Board Card Fields Never Wrap Side by Side"
description: "The criteria this phase must satisfy before it may be closed, including the rubric thresholds and the operator row."
trigger_phrases:
  - "acceptance criteria"
  - "012-board-card-fields acceptance criteria"
  - "012 rubric thresholds"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Board Card Fields Never Wrap Side by Side

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 076-sheet-visual-parity/012-board-card-fields
**Level:** 2
**Status:** CREATE+SCREENSHOT landed — the lane, capture and gate receipts are in `tasks.md`'s receipts section; AC-004/005 (the judge, twice) and AC-010 (the operator's own read) remain open
**Date:** 2026-09-10
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the board's meta grid, When measured at any viewport, Then it computes exactly **1** column, never 2 | `render-assertions.mjs` "meta grid" clause | Met | - |
| AC-002 | REQ-002 | Given a card's longest configured property labels, When measured at full card width, Then every visible label's `scrollWidth ≤ clientWidth` | `render-assertions.mjs` L2 clause | Met | - |
| AC-003 | REQ-003 | Given the presentation change, When `board-card-properties-panel.test.ts` is run, Then it passes **without modification** | Vitest, unmodified test file | Met | - |
| AC-004 | REQ-004 | Given the board capture and the Anytype mobile kanban reference, When a reviewer scores the eight-row rubric, Then the total is **≥ 14/16** with **no row at 0** | `verification.md`, score table #1 | Unmet | - |
| AC-005 | REQ-004 | Given an unchanged tree, When the reviewer scores it a second time, Then it passes again at the same thresholds | `verification.md`, score table #2 — **two consecutive passes** | Unmet | - |
| AC-006 | REQ-005 | Given the producer change, When the lane's own pre-existing "meta grid" assertion is read, Then it has been corrected in the same commit — never left certifying the two-column shape the producer no longer draws | `tools/live/render-assertions.mjs`, single commit diff | Met | - |
| AC-007 | REQ-006 | Given the single-column card, When its field rows are measured, Then each stays within the existing 25px pitch's asserted range | `render-assertions.mjs` L3 clause | Met | - |
| AC-008 | REQ-007 | Given the change, When recaptured at phone and desktop, Then light and dark are both current and both were opened and looked at | `npm run screenshots:verify` 0 stale; `tasks.md` T008 | Met | - |
| AC-009 | REQ-008 | Given the change, When every existing `056`/`045` board clause re-runs, Then all pass unchanged | Lane exit 0, same run as AC-006 | Met | - |
| AC-010 | REQ-009 | Given the redesigned card, When the operator re-reads it on their own iPhone, Then they report fields no longer wrapping side by side | Operator's own device read (D5) — **no agent ticks this row** | Unmet | - |

### The rubric AC-004 and AC-005 score

Eight rows, **0 / 1 / 2** each, maximum **16**. Defined in full in `../spec.md` §5; scored here against the Anytype mobile kanban reference (`screenshots/anytype/mobile/app/anytype-mobile-set-kanban-light.png`), the board's own landed parity target (`056` ADR-001), not Notion.

| Row | What it scores |
|---|---|
| Frame | Card shape, radius, cover placement — unaffected by this child, scored for regression |
| Sections | Whether the card's rows read as one continuous stack, matching the reference |
| Row anatomy | Label + value (or glyph + name for checkbox, or chip row) on one full-width line each |
| Controls | Display-only rows; scores whether any row still reads as truncated content rather than a control kind mismatch |
| Type | Label/value scale and weight hierarchy, unchanged by this child |
| Spacing | Row pitch and inter-row gap read as the reference's rhythm |
| Colour | Label muted-token vs value normal-token contrast, unchanged by this child |
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

**Closeable:** not yet — nothing has started. When the nine rows above are reached, AC-010 is the one that stays open: the operator's own device read, which no agent ticks. AC-005 is the row that most often blocks closure, because it requires the judge to pass a **second** time on a tree nothing has touched since the first pass.
<!-- /ANCHOR:closure -->
