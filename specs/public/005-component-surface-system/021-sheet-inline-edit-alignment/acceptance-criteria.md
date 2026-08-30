---
title: "Acceptance Criteria: Sheet Inline Edit Alignment"
description: "Five criteria met on the value editor, each with its failing number and its file:line. A sixth, added by a fresh review, is open: the title's rename editor is 2.4px off its own centre line."
trigger_phrases:
  - "021 acceptance criteria"
  - "inline editor centre line closure"
  - "title editor open criterion"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/021-sheet-inline-edit-alignment"
    last_updated_at: "2026-08-30T16:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Five criteria met and traced; criterion 6 added by a fresh review and open"
    next_safe_action: "Give the harness a path to the title editor, then derive its own offset"
    blockers:
      - "The harness stubs the rename entry point and triggers on click"
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-021"
      parent_session_id: null
    completion_pct: 85
    open_questions: []
    answered_questions: []
---
# Acceptance Criteria: Sheet Inline Edit Alignment

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> Each criterion is measured through the **real** open-and-edit path: the shipped
> `openRecordDetailPanel` with its `editCell` wired to the shipped `CellRenderer`, and a click on the
> value element. Nothing here builds an editor by hand.
>
> Failing numbers are from the tree as received.
>
> **This packet is `Partial`.** Criterion 6 was added by a fresh review after shipping and is open.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 021-sheet-inline-edit-alignment
**Level:** 3
**Status:** Partial
**Date:** 2026-08-30
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Measurement | Threshold | Before | After | Verification | Status |
|---|---|---|---|---|---|---|---|
| AC-001 | REQ-001 | Distance between the inline editor's centre line and its label's, through the shipped open-and-edit path | <= 1px | **7.6px** | 1.0px | `tools/storybook/verify-placement.mjs:4244` | Met |
| AC-002 | REQ-002 | Editor overhang past the bottom of the row that contains it | <= 1px | **2.5px below the row** | 0.5px | `tools/storybook/verify-placement.mjs:4234` | Met |
| AC-003 | REQ-003 | Inline editor height against the thumb floor the sheet's textarea editor already holds | >= 44px | **34.8px** | 44px | `styles.css:9391` | Met |
| AC-004 | REQ-004 | AC-001 and AC-002 re-measured with a host stylesheet inflating every input | <= 1px each | **15.2px / 17.7px** | 1.0px / 0.5px | `styles.css:9399` | Met |
| AC-005 | REQ-005 | Desktop panel editor rectangle, frozen against a leak from the two new selectors | exact, ±0.5px | 34.8px / 8px / 12px | 34.8px / 8px / 12px | `tools/storybook/verify-placement.mjs:4172` | Met |
| AC-006 | REQ-007 | **The title's rename editor** — the second inline editor — on its own centre line. It receives both new declarations and inherits an offset derived from the **value's** 21.6px line box; its own is 18.85px, so the correct offset is −12.6px rather than −11.2px | <= 1px | **9.0px** | **2.4px** | `styles.css:9393` | Unmet |

### Why AC-006 exists and why this harness could not have produced it

The offset expression at `styles.css:9393` is written in terms of `--db-font-lg`'s line height, which
is the **value's** metric. Every anchor that is not a value inherits a correction computed for a box
it does not have.

The harness cannot reach the title editor for two independent reasons: it stubs the rename entry
point as a no-op, and the trigger is a double-click rather than a click. **Either alone would have
hidden it.** AC-006 was found by an independent probe, and closing it requires first giving the
harness a path to that editor — otherwise the criterion is unverifiable here.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No. Five of six criteria are `Met`; **AC-006 is `Unmet`** and the packet is `Partial`
rather than complete.

The five met criteria all concern the number and currency editor and were each shown red on the tree
as received. AC-005 deserves a note of its own: **its first version passed the mistake it existed to
catch.** It asserted the desktop editor's `margin-top` was still `0px`, and unscoping both new
selectors left `margin-top` reading `0px` anyway — `--db-sheet-row-min-height` is declared only on the
sheet, so off it the declaration is invalid at computed-value time and falls back to the initial
value. Meanwhile the input rule **did** leak and shrank the desktop editor from 34.8px to 31px. The
rewritten check measures the rectangle and, under the same control, reports `31/6.1/8.2` against the
frozen `34.8/8/12` and exits 1.

AC-006 is a genuine open criterion, not a deferred nicety. Two inline editors sit on one surface and
disagree by 1.4px, and the phase's own declarations are what put the second one where it is. It is
also **an improvement** on the 9.0px it started at, so reverting would give up ground.

Two shapes are available and neither has been chosen — a second literal for the title, or deriving
the offset from whichever anchor the popover was placed on. `plan.md` ADR-002 holds the trade-off.

### Named, measured, not criteria of this packet

`spec.md` §12 records five findings this phase measured and did not fix: the `setPosition`
border-box/padding-box conversion (**sheet-only**; desktop measures 0.00 displacement in both axes),
the desktop record panel's identical alignment defect, the date editor reaching y=1001 against a sheet
bottom of 848.8, the type shrinking two steps at the moment of tap, and the 13px input against the
16px iOS zoom floor. Each carries its number and none is counted here.
<!-- /ANCHOR:closure -->
