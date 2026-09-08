---
title: "Acceptance Criteria: Settings Sheet Redesign"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "002-settings-sheet acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Settings Sheet Redesign

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/002-settings-sheet
**Level:** 3
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given Phase 1's inventory, When this phase starts, Then it cites the exact reference mapping row for the Settings sheet | `plan.md`, quoting the Phase 1 row | Met | - |
| AC-002 | REQ-002 | Given the redesigned sheet, When captured against its reference, Then spacing/layout/row-grammar are measured as converged, not merely eyeballed | Before/after capture with measurements | Met | - |
| AC-003 | REQ-003 | Given the redesign, When `054` T072's row-grammar and overflow checks are rerun, Then they still pass | Regression check, command output | Met | - |

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

- AC-001: `plan.md` §1 quotes the inventory row (producer `src/views/database-view.ts:5169`, captures `panel-view-config` / `panel-view-config-sheet`, references `notion/ios/settings` 24 / `notion/web/settings` 51 / `anytype/mobile/sheets` 4 / `anytype/desktop/app` 3).
- AC-002: measured, not eyeballed — RED 0/12 compact one-line, 3/12 pitch, headings 12px/0px, exit 1 → GREEN 12/12 compact @ 48.0px, 9/9 editors, headings 16px + 1px divider, extent 401 == 401 @ 402px, exit 0 (`tools/live/sheet-grammar.mjs`); unit revert-proof 6/6 → 1 failed → 6/6 (`src/views/view-config-sheet-row-grammar.test.ts`); gap table `spec.md` §13; reference columns honestly `TBD` (third-party captures carry no readable measurements — D-005).
- AC-003: 054 T072 regression — sheet-grammar exit 0 (eight grammar columns, all registered surfaces, both engines, extent within clientWidth); guard/stacking rows unchanged and green; touch-targets 0; gate 27/27, exit 0.
<!-- /ANCHOR:closure -->
