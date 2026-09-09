---
title: "Acceptance Criteria: Settings Sheet Strict Notion Alignment"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "007-settings-sheet-strict-alignment acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Settings Sheet Strict Notion Alignment

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/007-settings-sheet-strict-alignment
**Level:** 3
**Status:** Implemented — card shell landed 2026-09-09 on provisional metrics; AC-002 through AC-006 Met, AC-007 the operator's own
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the reference inventory this scaffold built, When implementation starts, Then it cites the exact reference captures and their resolution limits before writing any lane assertion | `spec.md` §13, `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given the redesigned sheet, When measured by the sheet-grammar lane, Then rows render inside ≥2 rounded card groups on a canvas background distinct from the card background, with a visible inter-card gap | Lane RED-then-GREEN count (`tools/live/sheet-grammar.mjs`) **Met 2026-09-09** — RED: 0 card containers (lane exit 1); GREEN: 2/2 cards, radius ≥8px, backgrounds distinct, 1/1 gap ≥8px, lane exit 0. The four numbers are provisional pending T001 | Unmet→Met | - |
| AC-003 | REQ-003 | Given the card wrapper, When `002`'s row-grammar and overflow assertions rerun unchanged, Then they still pass | Regression check, command output **Met 2026-09-09** — 002's assertions rerun unchanged: 2336 PASS / 0 FAIL lane-wide, exit 0 (pitch, inset, hairline, 0 native selects, overflow all green inside the cards); `npx vitest run` 1586/1586 | Unmet→Met | - |
| AC-004 | REQ-004 | Given the redesigned sheet, When a section has rows, Then its label renders above its own card rather than as an inline hairline-prefixed label inside a continuous list | Lane assertion + visual capture **Met 2026-09-09** — 2/2 section headings measured above their own card; the heading's opening hairline is retired where a card follows it | Unmet→Met | - |
| AC-005 | REQ-005 | Given the sheet's current row set, When checked for sheet-level action rows, Then either they render in their own trailing card or the requirement is recorded N/A because no such rows exist | `tasks.md` T004's vacuous-pass record **Met 2026-09-09** — vacuous pass recorded: 0 rows carry the sheet-action marker; REQ-005 stays N/A as spec.md records | Unmet→Met | - |
| AC-006 | REQ-007 | Given the redesign, When recaptured phone-only light and dark, Then a measured before/after is recorded against `spec.md` §13 | Capture diff, `implementation-summary.md` **Met 2026-09-09 (provisional metrics)** — recaptured ×3, both themes; 4 two-run content movers (view-config 716882/716962px@Δ192/209, board-card-properties 785113/785159px@Δ194/209); before/after in `implementation-summary.md` against §13 with the four provisional numbers named | Unmet→Met | - |
| AC-007 | SC-003 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report it aligned with Notion's own settings sheet | Operator's own device read (D3) — no agent ticks this row | Unmet | - |

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

**Closeable:** Partially — implementation landed 2026-09-09 and AC-002 through AC-006 are Met with
lane numbers and capture diffs recorded; two things stay open before closure: T001's operator
reference capture (the four card metrics — radius 8px, inset 16px, gap 12px, the two surface
tokens — are provisional and recorded as such) and AC-007, the operator's own device read (D3),
which no agent may tick.
<!-- /ANCHOR:closure -->
