---
title: "Acceptance Criteria: Sheet Polish"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "014-sheet-polish acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sheet Polish

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/014-sheet-polish
**Level:** 3
**Status:** Implemented — landed, awaiting the operator's device read (D3)
**Date:** 2026-09-10
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per measured property, plus the operator's device row.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any target is written, Then every number is ours and none is derived from a 299x678 Notion asset | `spec.md` §13's Target column | Met | - |
| AC-002 | REQ-002 | Given the icon picker, When its search row is inspected, Then Remove, Random and the settings button are not among its siblings | Lane RED→GREEN: RED 3 of the three on the search row (row: tabs, search, remove, random, settings) → GREEN 0 (row: tabs, search); `tools/live/sheet-grammar.mjs` exit 1 → 0 | Met | - |
| AC-003 | REQ-003 | Given the icon picker's Remove, When promoting it to the header would require changing the shared `createSheetHeader`, Then the item is recorded Proposed and the builder is left untouched | `decision-record.md` (Proposed, with the ruling's reasoning); `git diff --numstat` over `mobile-bottom-sheet.ts` = 0 changed lines — and `surface-shell.ts` / `popover-host.ts` equally untouched | Met | - |
| AC-004 | REQ-004 | Given the properties and record sheets, When their add affordances render, Then each is a full-width row rather than one of a side-by-side pair | Lane + capture: RED 17% / 23% / 22% of their rows → GREEN 100% / 92% / 92%; the properties and record-sheet phone light+dark movers among the 21 (mover classes in `implementation-summary.md`) | Met | - |
| AC-005 | REQ-005 | Given the changes, When every landed sheet clause reruns unchanged, Then all still pass on both engines | Regression check, command output: `tools/live/sheet-grammar.mjs` exit 0 on the untouched clauses, both engines; 0.49px centring, 44.0x44.0 close, 0.390 parent dim, 8/8 grammar columns; gate 28/28 | Met | - |
| AC-006 | REQ-006 | Given each changed surface, When recaptured phone-only light and dark, Then a before/after is recorded | Capture diff, `implementation-summary.md`: `npm run screenshots` ×2, 21 movers all reproduced in both runs, none jitter; the icon picker (184818-211045px at maxDelta 209-241) and properties (219295/237887px at 196/209) moved in mobile light and dark; the record sheet's phone captures sit below the fold — the lane's 100% clause and the docked-desktop pair (3810px at 128/145, the newly rendered add footer) carry it, the framing trait recorded as the 067 outstanding row's trait | Met | - |
| AC-007 | SC-004 | Given the polished surfaces, When the operator re-reads them on their own iPhone, Then they report the items closed | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

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

**Closeable:** Implementation complete 2026-09-10 — AC-001 through AC-006 are Met on measured
numbers (the lane's RED→GREEN, the decoded-pixel capture diff, the 28-lane gate). What remains is
AC-007, the operator's own device read (D3), which no agent ticks: the packet closes when the
operator re-reads the two polished surfaces on their own iPhone. The audit's §5 operator captures
(C-1..C-6) stay outstanding; none gates this packet's criteria, which are all measured against our
own numbers, and the colour picker's convergence and the column-width sheet's missing reference
are carried forward in `implementation-summary.md` so the next audit does not re-derive them.
<!-- /ANCHOR:closure -->
