---
title: "Acceptance Criteria: View Config Sheet Redesign"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "004-view-config-sheet acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: View Config Sheet Redesign

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/004-view-config-sheet
**Level:** 3
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given Phase 1's inventory, When this phase starts, Then it cites the exact reference mapping row for the view-config sheet | `plan.md` §1 quotes inventory row 42 verbatim (producer `src/views/database-view.ts:5299`; notion/ios/settings 24 + notion/web/settings 51 vs anytype/mobile/sheets 4 + anytype/desktop/app 3, flagged "filename read only") | Met | - |
| AC-002 | REQ-002 | Given the redesigned sheet, When captured against its reference, Then layout is measured as converged | The reference-gap table (`spec.md` §4) carries the before numbers; the lane measures the after: 13/13 rows label-left/control-right, 6/6 pitches 48.0px, 18/18 inset hairlines, 16px heading insets, 0 native selects, no overflow — and the recapture (twice, 616/616, exit 0 both) moved exactly the redesigned surface: constructed-view-config and panel-view-config-sheet, dark and light, 342–345k pixels, maxDelta 176–196; constructed-board-card-properties, dark and light, 440k, 194–209 | Met | - |
| AC-003 | REQ-003 | Given the redesign, When 058's title field/format controls and 045's column-visibility controls are rerun, Then they still function correctly | `npx vitest run` 1729/1729 (their suites included), `render-assertions`/`touch-targets`/`verify-placement`/`sheet-grammar` all 0, gate 27/27 — the controls' producer markup is untouched; only their row's presentation moved | Met | - |

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

**Closeable:** Yes — this leg's own work. The operator's device recheck stays the operator's row
(071 D3) and is not ticked here; the reference side is measured by number, not by eye (see
`implementation-summary.md` → Known Limitations).
<!-- /ANCHOR:closure -->
