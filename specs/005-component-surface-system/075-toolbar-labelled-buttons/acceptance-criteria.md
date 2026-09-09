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
| AC-003 | REQ-003 | Given the toolbar at a 402px viewport with every control enabled, When rendered, Then row height equals one button row, `scrollWidth > clientWidth`, and the last control is reachable by scroll — a declared red before the fix, green after | New lane `tools/live/run-phone-toolbar-scroll.mjs`: red before the fix (labels missing, controls 28px, no overflow at 398/398), green after (52px row, 44px controls, 532/398 scrollWidth/clientWidth, last control reachable); a one-line CSS revert (`height: 44px` → `28px`) reproduced red and was restored. Row height later grew 52 → 58px when AC-007's halo padding landed on the same strip — the lane's current numbers are the ones AC-007 records | Met | - |
| AC-004 | REQ-004 | Given the existing `009`/`044` toolbar-collapse and sheet-grammar lanes, When rerun against the new scroll behavior, Then they are updated and pass (no stale collapse-behavior assertion left green by accident) | `node tools/live/run-toolbar-collapse-sweep.mjs` and `node tools/live/sheet-grammar.mjs`: both PASS, identical switch points before and after. No behavioural update was needed — both lanes mount the embedded/desktop shape, which ADR-001 leaves untouched; D1's scroll ruling only applies to the full phone view neither lane exercises | Met | - |
| AC-005 | REQ-005 | Given the desktop toolbar, When a same-labels-or-unchanged decision is made, Then it is recorded as an ADR citing Notion/Anytype/Bases references | `decision-record.md` ADR-001: desktop and the embedded/codeblock toolbar stay icon-only, citing `screenshots/notion/web/`, `screenshots/anytype/desktop/` and the operator's own phone-scoped reference | Met | - |
| AC-006 | REQ-001 | Given the shipped fix, the operator confirms on their own phone that the toolbar reads and scrolls as expected | Operator device check — **operator-owned, never ticked by an agent** | Unmet | - |
| AC-007 | REQ-003 | Given the phone strip at a 402px viewport with labelled buttons, When measured, Then `scrollHeight - clientHeight` reads 0, computed `overflow-y` is `hidden`, computed `touch-action` contains `pan-x` and not `pan-y`, computed `overscroll-behavior-x` is `contain`, a programmatic `scrollTop = 40` on the strip reads back 0, and every control's bounding box lies inside the strip's box — a declared red before the fix, green after | Same lane, extended: red before the fix (vertical overflow 6px — scrollHeight 58 / clientHeight 52, the 8px touch halo every control paints past its own box overhanging a 6px-shorter content box — `overflow-y` computed `auto` because `visible` computes to `auto` beside the `auto` x-axis, `touch-action` `auto`, `overscroll-behavior-x` `auto`, forced `scrollTop` read back 6); green after (`overflow-y: hidden` + `touch-action: pan-x` + `overscroll-behavior-x: contain` on the strip, padding-bottom 2 → 8px parking the halo inside the strip's box: vertical overflow 0px, forced `scrollTop` 0, row 58px, every control inside the strip, horizontal overflow and reachability unchanged at 532/398); `npm run screenshots` ×2 reproduced all 12 toolbar-capture movers identically in both runs (deterministic, 0 jitter); touch-targets lane unchanged (169/785 baselines, exit 0) | Met | - |

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

Every agent-owned criterion (AC-001 through AC-005, AC-007) is Met. AC-006 is operator-owned by design and
stays Unmet until the operator confirms on their own device — that is the closing condition this
packet cannot self-certify, not an open implementation gap. The vertical-scroll report that opened
AC-007 shares that device read: the strip's new numbers (58px row, `pan-x`, 0 vertical travel) are
lane-proven, the operator's own re-read of the strip on their iPhone is not yet recorded.
<!-- /ANCHOR:closure -->
