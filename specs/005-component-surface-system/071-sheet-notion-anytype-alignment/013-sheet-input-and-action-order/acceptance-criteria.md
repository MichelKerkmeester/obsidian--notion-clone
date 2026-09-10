---
title: "Acceptance Criteria: Sheet Input and Action Order"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "013-sheet-input-and-action-order acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Sheet Input and Action Order

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/013-sheet-input-and-action-order
**Level:** 3
**Status:** Implemented — 2026-09-10, awaiting the operator's device read (D3)
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per measured property, plus the operator's device row.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any assertion is written, Then every ordering target is an ordinal structural fact and every pixel number is ours | `spec.md` §13's Target column; `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given the stacked confirm, When its actions row is read, Then the destructive action is the first child and Cancel is the last | Lane RED→GREEN (RED: Cancel first): `{"first":{"text":"Cancel"},…}` → `{"first":{"text":"Delete","cls":"mod-warning"},"last":{"text":"Cancel"}}`; unit-held (`confirm-sheet.test.ts`, 2F/1P→3/3) | Met | - |
| AC-003 | REQ-003 | Given the confirm card, When `061`'s geometry clauses rerun unchanged, Then the inset, radii, stacking and 44/50px heights all still pass | Regression check, command output: inset 275.3/35/35/275.3px, radius 16px ×4, `flex-direction: column`, action heights 50/44px (the pre-reorder row printed 44/50 — the same two heights, new order), negative control still red-then-green | Met | - |
| AC-004 | REQ-004 | Given the add-view sheet, When its DOM order is read, Then the create affordance precedes the optional settings | Lane RED→GREEN (`choicesBeforeForm: false` → `true`; `namePlaceholder: ""` throughout) | Met | - |
| AC-005 | REQ-005 | Given the add-view name input, When this phase closes, Then it still carries no placeholder | `git diff` — the name-input lines are absent from the producer diff; the lane clause prints `""` | Met | - |
| AC-006 | REQ-006 | Given the date picker, When its DOM order is read, Then the calendar precedes the numeric segment inputs | Lane RED→GREEN (`calendarBeforeSegments: false` → `true`) | Met | - |
| AC-007 | REQ-007 | Given the date picker's presets group, When its members are counted, Then Clear is not among them | Lane RED→GREEN (RED: 4 presets, Clear the fourth; GREEN: 3 presets, `clearOutsideGroup: true`) | Met | - |
| AC-008 | REQ-008 | Given the toolbar overflow menu, When its rows are inspected, Then 0 free-text inputs share the surface with its action rows | Lane RED→GREEN, destination-before-source: the row+popover proven first (15 inputs answering there, 15 still on the record surface), then the record surface at 0 | Met | - |
| AC-009 | REQ-009 | Given ADR-C, When this phase closes, Then the layout choice still renders as rows and the question is recorded as Proposed, not resolved | The rows-and-chevron loop is byte-unchanged (the unit clause `add-view-popover-layout.test.ts` holds it, 1606/1606); the question stays Proposed (`goal.md` D4, the audit's §6 ADR-C) | Met | - |
| AC-010 | REQ-010 | Given the four surfaces, When recaptured phone-only light and dark, Then a measured before/after is recorded for each | 24 deterministic two-run movers recorded in the css-lane triplet (`implementation-summary.md`); the record popover's half is the lane's printed 15→0 + the destination's 15 — no constructed scenario, named gap. Provisional until the device read | Met | - |
| AC-011 | SC-004 | Given the reordered sheets, When the operator re-reads them on their own iPhone, Then they report the four aligned | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

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

**Closeable:** Implementation-complete — 2026-09-10, worktree `279-sheet-action-order`. AC-001-AC-010 are
Met, each with its evidence recorded in `implementation-summary.md` (the lane's RED→GREEN numbers,
the unit proof, the css-lane triplet, the 28/0 gate) and the visual numbers marked provisional
pending the device read. AC-011, the operator's own device read (D3), stays open — no agent may
tick it — and until it comes back the packet stands: **landed, awaiting device.**
<!-- /ANCHOR:closure -->
