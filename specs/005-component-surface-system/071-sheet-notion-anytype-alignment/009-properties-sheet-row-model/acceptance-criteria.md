---
title: "Acceptance Criteria: Properties Sheet Row Model"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "009-properties-sheet-row-model acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Properties Sheet Row Model

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/009-properties-sheet-row-model
**Level:** 3
**Status:** Implemented — landed, awaiting the operator's device read (D3)
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per measured property, plus the operator's device row.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any assertion is written, Then every numeric target is traceable to our own measurement and none to a 299x678 Notion asset | `spec.md` §13's Target column; `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given a properties row, When its interactive descendants are counted by the lane, Then there are at most 4 | Lane RED→GREEN (RED: 6 per row → GREEN: 3 on all 16 rows) | Met | - |
| AC-003 | REQ-003 | Given any property, When its row label is read on the phone presentation, Then it contains no bracketed internal key | Lane RED→GREEN (RED: 0/16 key-free → GREEN: 16/16) | Met | - |
| AC-004 | REQ-004 | Given at least one hidden property, When the sheet renders, Then it shows a Shown section and a Hidden section, each header carrying its own bulk action | Lane RED→GREEN (RED: 0 section headers → GREEN: 2, `Shown`/`Hide all` + `Hidden`/`Show all`, compared against the four i18n keys, not literals) | Met | - |
| AC-005 | REQ-005 | Given the wrap and delete controls, When removed from the list row, Then both are reachable from an edit-property sheet and neither behaviour is lost | Reach proven: a click on the row's name reaches `editColumn` with the row's own column (verify-placement 418/420, name-tap clause; unit red→green). Neither behaviour lost: wrap still travels the modal's own `wrapContent` → `result.wrap` path; delete closes the modal then hands the edited column to `deleteColumn`, whose confirmation pipeline keeps its own unit suite. The DbModal subclass itself is proven by read, this suite's stated convention — its fakes cannot mount a live Modal | Met | - |
| AC-006 | REQ-006 | Given the change, When the sheet's landed clauses rerun unchanged, Then the 3/3 section-boundary hairlines, the row pitch and the 0 native-select count all still pass | Lane rerun exit 0, clauses unchanged: 3/3 hairlines, 0.49px title centring, 0 native selects, 34px row heights; the record sheet's own clauses rerun green (shared builder), WebKit long-name extent 401 ≤ 401 | Met | - |
| AC-007 | REQ-007 | Given the redesign, When recaptured phone-only light and dark, Then a measured before/after is recorded against `spec.md` §13 | Recaptured 480×5 runs exit 0; decoded-pixel judgment: the redesigned surface's own captures move 321990–361711px at maxDelta 196–225 (4 constructed pairs), its dependent stacks (property editor, confirm card, depth-3 type picker) and the panel fixtures follow; every mover reproduced identically across runs, none under the 12-delta one-run-only jitter rule, 2 byte-only movers pixelHash-identical. Recorded in `goal.md`'s log | Met | - |
| AC-008 | SC-004 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report the Properties sheet aligned | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

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

**Closeable:** Not yet — implemented and self-verified (AC-001 through AC-007 Met on measured
numbers: 3 interactive controls on all 16 rows, 16/16 key-free labels, the 2-header shown/hidden
partition, the regression clauses unchanged, the recapture judged by decoded pixels), but the
closing criterion is the operator's own device read (D3), which no agent ticks. The audit's C-2
(full-resolution Notion Property-visibility capture) is still outstanding, so §13's Notion column
stays structural and every number stays ours.
<!-- /ANCHOR:closure -->
