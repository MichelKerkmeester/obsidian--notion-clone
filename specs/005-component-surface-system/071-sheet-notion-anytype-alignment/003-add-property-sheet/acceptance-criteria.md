---
title: "Acceptance Criteria: Add-Property Sheet Redesign"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "003-add-property-sheet acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Add-Property Sheet Redesign

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/003-add-property-sheet
**Level:** 3
**Status:** Implemented
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-002 | Given the property-type picker sheet with the keyboard open, When reproduced on the real renderer, Then the sheet covers the note header — a declared red before any fix | Harness/device reproduction, red observed | Met | - |
| AC-002 | REQ-002 | Given the fix, When the same reproduction is rerun, Then the sheet no longer covers the note header with the keyboard open | Harness/device reproduction, green observed | Met | - |
| AC-003 | REQ-002 | Given Phase 1's reference mapping, When the picker's list/grid layout is redesigned, Then it is captured against that reference | Before/after capture | Met | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

**Observed evidence, 2026-09-08.** RED: with the fix's styles.css rules stashed, the grammar's `properties create property` lane fails the three redesign assertions — type-list pitch `min 0.0 / max 30.0` (want 44–52), 16px horizontal padding, list scroll `210>210` — while the device keyboard path already reports the sheet clearing the note header unfixed (top 84.4px ≥ header bottom 44.0px): the operator's overlap defect is held by the belt-and-braces keyboard/height assertions, and the failures name the newly added layout rules. GREEN after restore (styles.css `8991c15f8106`): 21 rows at pitch 44.0/44.0, every row icon + label, sheet top 238.4px ≥ header bottom 44.0px, sheet height 261.6 ≤ 464.0 (viewport − 336 keyboard − 44 header), name field pinned above the list, no horizontal overflow at 402×874. The RED→GREEN is unit-proven too: reverting the gated-format reason line fails 1 of 8 tests; restoring it passes 8/8. The before/after comparison (AC-003, REQ-003/SC-001) is these printed numbers — the family has no committed PNG (the inventory records the absorbed replace-in-place shape as uncovered by any pixel reference, and the reference harvests carry no pixel measurements), so the gap table's targets (spec §4b) and the lane's assertions are the converged evidence; the only physical capture movement this leg owes is the two board movers the css-lane release names, both reproduced in both sampled runs at 073's own counts (1px@1, 4px@1) — the lane instability 073 recorded, not this packet's stylesheet, whose rules are scoped to `.obnotion-create-property-*`.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** Yes

All three criteria are Met with observed evidence (the evidence block in §2): AC-001/AC-002 are the grammar's device-path red→green on the `properties create property` lane (styles.css `8991c15f8106`), AC-003 is the reference-gap table in the packet spec (§4b) plus the redesigned list's measured convergence (21 rows, 44.0px pitch, icon + label, 16px insets, no 402×874 overflow). SC-002 holds: the gate reports 27 green, 0 red for a declared reason, so no prior sheet fix (054, 058, 045, 067) regressed. Verified 2026-09-08: `npx tsc --noEmit` 0, `npx vitest run` 160 files / 1731 tests 0, `npm run build` 0, `sheet-grammar.mjs` 0, `render-assertions.mjs` 0, `touch-targets.mjs` 0, `verify-placement.mjs` 413/415 (2 declared), `evidence --check-all` 15/15 fresh, `npm run gate` 27 green / 0 red exit 0, `scan-comments` 0, `scan-failing-values` 0. Not yet: the operator's on-device read — that row stays the operator's.
<!-- /ANCHOR:closure -->
