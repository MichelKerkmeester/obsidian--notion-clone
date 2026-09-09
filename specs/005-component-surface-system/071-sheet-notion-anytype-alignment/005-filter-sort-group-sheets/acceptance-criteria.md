---
title: "Acceptance Criteria: Filter, Sort and Group Sheets Redesign"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "005-filter-sort-group-sheets acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Filter, Sort and Group Sheets Redesign

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 071-sheet-notion-anytype-alignment/005-filter-sort-group-sheets
**Level:** 3
**Status:** Implemented
**Date:** 2026-09-09
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given Phase 1's inventory, When this phase starts, Then it cites the exact reference mapping rows for filter, sort and group sheets | `spec.md:120` onward (filter-panel row 45, sort-panel row 44, group panel row 133 of `001/inventory.md`) | Met | - |
| AC-002 | REQ-002 | Given the redesigned sheets, When captured against their reference, Then layout is measured as converged | `tools/live/sheet-grammar.mjs:3294` (panel sheets row grammar: rows 44-52px, one 16px inset, one inset-to-inset span, 0 native selects, first-of-type 0px / later 1px painted dividers, no sideways scroll — all PASS for filter, sort and group) | Met | - |
| AC-003 | REQ-003 | Given the redesign, When the freeze-regression check from `85ff504` is rerun, Then it still passes | `tools/live/sheet-rebuild.mjs:978` (PASS — every rebuilt sheet still has the bar it opened with) | Met | - |
| AC-004 | REQ-003 | Given the operator's 0.0.36 device report ("Sort sheet doesnt fill full width like it should like others and has a bottom gap"), When the sort sheet mounts at a 390px phone viewport, Then it presents the flush frame — left 0, right 0, bottom 0 (no gap under it), the same numbers the sheets beside it on the toolbar reach | `tools/live/sheet-grammar.mjs:3474` ("frame role — the sort sheet presents the flush frame" clause) + `src/views/sort-panel-renderer.ts:150` (`heightRole: "flush"` via `src/views/popover-position.ts:74`'s pass-through): RED before the fix (sort-panel classified floating, left/right/bottom 8/8/8px — the mounted classifier answered its ~240px body with the floating card while taller panels crossed the flush cutoff on their own), GREEN after; capture movers: constructed-sort-panel-mobile-dark/light 117957px@192 and 136281px@209, calendar pair 85754@176 and 104017@196, moved in BOTH runs | Met | - |

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

**Closeable:** Yes, pending the operator's own device recheck

All three criteria are Met by evidence gathered from this worktree's own verification chain (see
`tasks.md` §Phase 3 and `decision-record.md` ADR-001). Per the parent packet's D3 decision, only the
operator's own device recheck may close a device-level row; nothing here substitutes for that.
<!-- /ANCHOR:closure -->
