---
title: "Acceptance Criteria: Record Detail Sheet and Menu Cards Redesign"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "006-record-and-menu-sheets acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Record Detail Sheet and Menu Cards Redesign

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/006-record-and-menu-sheets
**Level:** 3
**Status:** Implemented — criteria below read `Met`
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given Phase 1's inventory, When this phase starts, Then it cites the exact reference mapping rows for the record sheet and menu cards | `plan.md`, quoting the Phase 1 rows | Met | - |
| AC-002 | REQ-002 | Given the redesigned surfaces, When captured against their reference, Then layout is measured as converged | Before/after capture | Met | - |
| AC-003 | REQ-003 | Given the redesign, When every surface in this family is recaptured, Then a before/after comparison is recorded, mover by mover, with the jitter policy applied | 21 content movers judged by decoded pixel delta; css-lane release `reviewed[21]`; 9 jitter restores; 3 one-run variances above the 12 floor kept (002's precedent) | Met | - |

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

**Closeable:** Yes

- AC-001: `plan.md` §1 quotes the mapping rows — the record detail sheet (`../001-sheet-story-coverage-audit/inventory.md:47`, producer `src/views/record-detail-panel.ts:172`, references Notion `notion/ios/database` 18 / Anytype `anytype/mobile/sheets` 14), the record peek (line 48, Notion `row-page-03/-04` 3 / none), the record sheet's six menu-card children (lines 120–125, Anytype's cell sheets; the column context menu and submenu: none, recorded) and the column-menu popover they ride (line 94, Notion `notion/ios/database` block-menu 2).
- AC-002: measured, not eyeballed — RED 21/21 property rows one-line but all 21 at 61.0px (last 60.0), labels 25.0px deep, headings 13.0px/0px, 4 failures, exit 1 → GREEN 21/21 at 44.0px, inset 16.0px, heading 16.0px/1px, 0 native selects, extent 401 ≤ 401 at 402px, exit 0 (`tools/live/sheet-grammar.mjs`); the pitch's negative control went red (inset 6.0px, 21/21 rows under the floor) and restored; unit revert-proof 5/5 → 1 failed / 4 passed → 5/5 (`src/views/record-sheet-row-grammar.test.ts`); gap table `spec.md` §13; reference columns honestly `TBD` (D-005, inherited) — the convergence is our own measured before/after against the operator's Notion-shape directives, which is what this criterion asks for.
- AC-003: 616/616 recaptured twice, exit 0 both; 30 captures moved bytes — 21 content movers, this packet's own record-detail family (96–62,773 changed pixels at channel deltas 127–221), judged and named in the css-lane release; 9 jitter (≤12, one run) restored to HEAD bytes with their manifest hashes; 9 byte-only (6 recurring one-bit movers at delta 1, both runs — the 002/073 precedent — plus the 3 one-run variances above the 12 floor, kept); the lane names all 21 it owes (`check-lane` exit 0). No regression: every pre-existing record-family assertion stayed green (surface, handle, header, rows, segmented, keyboard, safeArea, dropdown, close 44×44, no right-edge overflow, the owned-menu parent-dim 0.390, all 34 stacked pairs), sheet-grammar 2166 PASS / 0 FAIL, gate 27/27 exit 0.
<!-- /ANCHOR:closure -->
