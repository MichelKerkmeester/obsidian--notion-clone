---
title: "Implementation Summary: Touch Row Range Selection"
description: "A tap on a row checkbox selects one row again, and touch keeps the ability to select a range through a hold. Twelve checks, six negative controls restored by hash."
trigger_phrases:
  - "017 row range summary"
  - "hold to extend rows shipped"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/017-touch-row-range-selection"
    last_updated_at: "2026-08-30T10:20:00Z"
    last_updated_by: "phase-author"
    recent_action: "Predicate removed from both views; hold gesture added; 12 checks, 6 controls"
    next_safe_action: "Decide whether the hold gesture gets an affordance"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-017"
      parent_session_id: null
    completion_pct: 73
    open_questions: []
    answered_questions: []
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 017-touch-row-range-selection |
| **Shipped** | 2026-08-30 |
| **Level** | 1 |
| **State** | Shipped and verified with six negative controls. One open design decision. Not operator-confirmed |

<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

A tap on a row checkbox selects that row. Before this it selected everything between that row and the
last one touched — every time, on every touch device, and also on any mouse-driven pane narrower than
760px. The range predicate read "shift key **or** touch device", which is shift held down with no way
to let go.

Touch keeps the ability to select a range, because taking it away would have removed the only way to
act on many rows at once. It moves behind a held press on the row checkbox, which is a second gesture
rather than a second meaning for the first one.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `src/views/table-cell-gesture.ts` | Modified | Holds `shouldExtendRowRange` beside the cell rule it contradicted; adds the row-range gesture on the existing long press |
| `src/views/database-view.ts` | Modified | Calls the shared entry point; no longer mentions the device predicate near row selection |
| `src/views/embedded-database-renderer.ts` | Modified | The same, plus screening its long-press target before the timer rather than after it |
| `tools/storybook/verify-placement.mjs` | Modified | Twelve checks, six on each of two pages |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The defect was reproduced on both surfaces first, including the half that was never a phone defect: a
1440px desktop window with a 700px leaf makes the device predicate true, so a plain mouse click
selected the same seven rows there.

The more useful finding is why it survived the repair immediately next to it. The predecessor phase
fixed this exact branch for cell selection, in these same two files, and introduced a shared module so
the decision would live in one place — but the row checkbox's copy was not moved with it. From that
point the table obeyed two contradictory rules at once, and nothing could observe the disagreement
because each rule was correct on its own terms in its own file.

That reframed the work. The predicate is the symptom; the defect is that one decision had two homes.
So the rule moved next to the rule it contradicted, and both views now call one entry point.

The gesture was built on the existing long press rather than beside it, so its threshold, tolerance,
guard and haptic are inherited rather than restated. Every criterion was then attacked with a
negative control aimed at one specific rule, and each control was restored with the restoration
verified by hash rather than by reading the file.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|---|---|
| Put the rule beside the rule it contradicted | The predicate was the symptom. One decision living in two files is what let a cell press and a row press disagree while each looked correct locally |
| Replace the predicate with two named grammars, not a narrower predicate | A modifier key needs a keyboard and a held press needs a finger. Neither can be mistaken for a device, so there is no threshold left to get wrong |
| Give touch a second gesture rather than reinterpret the tap | Deleting the predicate alone would have left touch unable to select a range at all. Touch has no shift, so it needs another gesture, not another meaning for the one it has |
| Build on the existing long press instead of beside it | Timing, tolerance, guard and haptic are inherited by omission, so the two holds are one vocabulary because they are one implementation. No new timing constant was introduced |
| Separate the two holds by target rather than by timing | The row menu ignores presses on a control and the range gesture ignores presses that miss the checkbox, so they cannot both fire. Timing-based separation would have made them race |
| Apply the extension when the hold fires, then swallow the release's click | The haptic and the painted rows arrive together. The release would otherwise toggle the last row straight back off |
| Move the embedded renderer's target screening before the timer | It screened after, so a hold on a checkbox already buzzed and swallowed the press before declining to open anything. Left alone, the new gesture would have produced two haptics for one hold |
| Count haptics as well as selections | The haptic is the gesture's only outward signal. A hold that buzzes twice is two gestures wearing one costume, and no selection assertion can see it |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

Twelve checks, six on each of two pages, driving the shipped gesture module with real pointer events.
The second page is a 1440px window with a 700px leaf, so the device predicate reads true while the
pointer says mouse; every check on it asserts that predicate first, or it would be passing for a
reason it is not testing.

| Check | Result |
|---|---|
| AC-1 a tap selects one row | **PASS.** Was 7 rows; now 2, with 0 extensions fired |
| AC-2 a mouse click selects one row on a narrow pane | **PASS.** Was 7 rows at a 1440px window with the predicate true; now 2 |
| AC-3 a held press extends | **PASS.** Was 1 row, 0 extensions, 0 haptics; now 7 rows, 1 extension, 1 haptic |
| AC-4 the release does not undo the range | **PASS.** Was 6 rows — the range painted then lost its own last row; now 7 |
| AC-5 a slow mouse click still toggles | **PASS.** 2 rows. Opposite right answer to AC-4 for the same release |
| AC-6 a press below the threshold does not extend | **PASS.** 0 extensions at 300ms against a 450ms threshold, both pages |
| AC-7 a held mouse press never extends | **PASS.** Was 7 rows, 1 extension, 1 haptic; now 1 row, 0, 0 |
| AC-8 shift-click still extends | **PASS.** Was 2 rows; now 7, on both pages |
| AC-9 two holds, two answers, one gesture | **PASS.** Checkbox 1/0/1, row body 0/1/1, mouse page 0/0/0. Was **2 haptics for one hold** |

**Six negative controls, each on a distinct rule.** NC1 restores the old predicate; NC2 stops the
pointer-type screening; NC3 unswallows the post-hold click; NC4 restores the late target screening;
NC5 stops the gesture arming; NC6 drops the shift term. **No control turned every check red**, which
is what makes them discriminating rather than a global switch — NC1 and NC6 left the hold checks
green, and NC5 left the desktop checks green. Each was applied, run, observed red, restored, and the
restoration verified by SHA-256.

**Harness totals across the session:** 87/88 at baseline, 99/100 with this phase applied, and 108/109
at best on the current tree. The twelve checks added here were green in every run taken after the
change, including runs where the whole harness exited 1.

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The gesture has no affordance.** There is no painted hint and no announcement anywhere that a
   hold extends the selection. The selection status bar renders as soon as one row is selected, which
   is exactly when a range becomes possible, so the slot exists — but whether to use it is an operator
   decision and it was not taken unilaterally.

2. **Three harness reds are present and are not this phase's.** They arrived mid-session with arrays
   added by the concurrent stylesheet lane and measure painted CSS geometry only — a 34×18 switch
   against a 28px floor, and a −17px/−14px gap between two controls in the select cell. **They fail
   identically with this phase's code fully restored**, which is the measurement that separates them.
   Two runs minutes apart on the same tree differ only in those three.

3. **The select column's geometry is disclaimed here.** The overlap checks belong to the phase that
   owns the column's fit, not to this one.

4. **Not operator-confirmed.** Every result is a browser measurement driving the shipped module. A
   real thumb on a real device has not been reported on.

<!-- /ANCHOR:limitations -->
