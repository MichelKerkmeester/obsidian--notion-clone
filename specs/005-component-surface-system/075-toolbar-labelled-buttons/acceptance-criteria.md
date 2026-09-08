---
title: "Acceptance Criteria: Phone Toolbar Labelled Buttons"
description: "The criteria this packet must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "075 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Phone Toolbar Labelled Buttons

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 075-toolbar-labelled-buttons
**Level:** 2
**Status:** Draft
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the operator's reference screenshot, When its label size and spacing are measured, Then the implemented toolbar buttons match within a documented tolerance | Measurement table in `plan.md` §MEASUREMENT | Met | - |
| AC-002 | REQ-002 | Given the implemented buttons, When measured with `tools/live/touch-targets.mjs`, Then every touch target is ≥44×44px | `node tools/live/touch-targets.mjs` exit 0; six `RAISED` entries added (obnotion-filter-btn, obnotion-sort-btn, obnotion-group-btn, obnotion-col-manager-btn, obnotion-toolbar-settings-btn, obnotion-toolbar-more-btn) locking the 44px floor | Met | - |
| AC-003 | REQ-003 | Given the toolbar at a 402px viewport with every control enabled, When rendered, Then row height equals one button row, `scrollWidth > clientWidth`, and the last control is reachable by scroll — a declared red before the fix, green after | New lane `tools/live/run-phone-toolbar-scroll.mjs`: red before the fix (labels missing, controls 28px, no overflow at 398/398), green after (52px row, 44px controls, 532/398 scrollWidth/clientWidth, last control reachable); a one-line CSS revert (`height: 44px` → `28px`) reproduced red and was restored | Met | - |
| AC-004 | REQ-004 | Given the existing `009`/`044` toolbar-collapse and sheet-grammar lanes, When rerun against the new scroll behavior, Then they are updated and pass (no stale collapse-behavior assertion left green by accident) | `node tools/live/run-toolbar-collapse-sweep.mjs` and `node tools/live/sheet-grammar.mjs`: both PASS, identical switch points before and after. No behavioural update was needed — both lanes mount the embedded/desktop shape, which ADR-001 leaves untouched; D1's scroll ruling only applies to the full phone view neither lane exercises | Met | - |
| AC-005 | REQ-005 | Given the desktop toolbar, When a same-labels-or-unchanged decision is made, Then it is recorded as an ADR citing Notion/Anytype/Bases references | `decision-record.md` ADR-001: desktop and the embedded/codeblock toolbar stay icon-only, citing `screenshots/notion/web/`, `screenshots/anytype/desktop/` and the operator's own phone-scoped reference | Met | - |
| AC-006 | REQ-001 | Given the shipped fix, the operator confirms on their own phone that the toolbar reads and scrolls as expected | Operator device check — **operator-owned, never ticked by an agent** | Unmet | - |

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

**Closeable:** No

Every agent-owned criterion (AC-001 through AC-005) is Met. AC-006 is operator-owned by design and
stays Unmet until the operator confirms on their own device — that is the closing condition this
packet cannot self-certify, not an open implementation gap.
<!-- /ANCHOR:closure -->
