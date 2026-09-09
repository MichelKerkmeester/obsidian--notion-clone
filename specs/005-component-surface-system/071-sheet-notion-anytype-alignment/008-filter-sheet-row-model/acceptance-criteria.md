---
title: "Acceptance Criteria: Filter Sheet Row Model"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "008-filter-sheet-row-model acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Filter Sheet Row Model

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/008-filter-sheet-row-model
**Level:** 3
**Status:** Implemented — AC-001 through AC-006, AC-008, AC-010 Met; AC-007 Waived (scope narrowed
to filter/sort, ADR); AC-009 Met; AC-011 the operator's own device read (D3), open
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per measured property, plus the operator's device row.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the audit's §0 ceiling, When any assertion is written, Then every numeric target is traceable to our own measurement and none to a 299x678 Notion asset | `spec.md` §13's Target column; `plan.md` §1 | Met | - |
| AC-002 | REQ-002 | Given a filter condition, When measured by the lane, Then it renders on 3 rows and no condition row carries more than 4 interactive controls | Lane RED→GREEN, T004 (RED: 6 per row; GREEN: every stacked row carries 1 control) | Met | - |
| AC-003 | REQ-003 | Given a property name of ≥12 characters at a 402px frame, When measured, Then the property control's text is not truncated | Lane RED→GREEN, T005 (RED: scrollWidth 119px > clientWidth 14px on a 24-char name; GREEN: fits) | Met | - |
| AC-004 | REQ-004 | Given the Filter sheet, When its first divider-owing row is measured, Then it sits 16.0px from the sheet edge | Lane RED→GREEN, T006 (RED: 25.0px; GREEN: 16.0px, matching sort and group) | Met | - |
| AC-005 | REQ-005 | Given a condition row, When its interactive descendants are inspected, Then 0 are icon-only buttons and the rule's actions render as labelled rows | Lane + capture, T009 (`createMenuRow`, Remove carries `is-warning`; screenshot-confirmed) | Met | - |
| AC-006 | REQ-006 | Given the stacked block, When `005`'s clauses rerun unchanged, Then they still pass on both engines | Regression check, T011 (`sheet-grammar.mjs` exit 0, both engines; `sheet-rebuild.mjs` tap-target regression found and fixed) | Met | - |
| AC-007 | REQ-007 | Given filter, sort and group, When their row spans are measured, Then all three agree within ±2px | Lane RED→GREEN, T007 (RED: 332/357/341px; GREEN: filter/sort 357/357px) | Waived | **ADR-001** (`decision-record.md`): group's 341px predates this phase (already sort's own mismatch in the RED baseline) and comes from group's own floating/flush content-height classifier, outside this phase's Files to Change. Also `../../roadmap.md` §7.17 |
| AC-008 | REQ-008 | Given a condition with no value, When rendered, Then it shows a labelled affordance and 0 bare `—` glyphs | Lane + capture, T008 (`t("panel.value")` placeholder; screenshot-confirmed on every presentation) | Met | - |
| AC-009 | REQ-009 | Given the redesign, When recaptured phone-only light and dark, Then a measured before/after is recorded against `spec.md` §13 | Capture diff, `implementation-summary.md`, T012 (`npm run screenshots` ×2, decoded-pixel reviewed) | Met | - |
| AC-010 | REQ-010 | Given ADR-B, When this phase closes, Then the AND/OR control is unchanged and the question is recorded as Proposed, not resolved | `../sheet-notion-audit.md` §6 ADR-B (untouched; confirmed still Proposed) | Met | - |
| AC-011 | SC-004 | Given the redesigned sheet, When the operator re-reads it on their own iPhone, Then they report the Filter sheet legible and Notion-shaped | Operator's own device read (D3) — **no agent ticks this row** | Unmet | - |

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

**Closeable:** Not fully — implementation is complete and lane-proven. AC-001 through AC-006 and
AC-008 through AC-010 are Met. AC-007 is Waived at the group boundary (filter/sort converge; group's
own gap predates this phase and is out of its Files to Change — Proposed ADR, `../../roadmap.md`
§7.17). AC-011 is the operator's own device read (D3) and stays open; no agent may tick it — that
row alone keeps this packet from a full close.
<!-- /ANCHOR:closure -->
