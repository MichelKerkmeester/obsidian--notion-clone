---
title: "Implementation Summary: Sheet Reading Rhythm and Keyboard Avoidance"
description: "The phone record sheet reads as label-and-value pairs and lifts clear of a reported keyboard. Both halves are harness-verified; neither is device-confirmed."
trigger_phrases:
  - "010 sheet reading summary"
  - "keyboard inset shipped"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/010-sheet-reading-and-keyboard"
    last_updated_at: "2026-08-30T06:48:00Z"
    last_updated_by: "phase-author"
    recent_action: "Pinch guard, desktop four values and both missing state dimensions now measured"
    next_safe_action: "Operator reads a record on the phone and taps a field"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-010"
      parent_session_id: null
    completion_pct: 91
    open_questions: []
    answered_questions:
      - "The visual-viewport fallback fires: the shipped resolveKeyboardInset is called at two scales"
      - "The desktop four values are measured on the shipped panel: 26.84px, 2px, 0px none, right"
      - "The reposition loop released only on the next viewport event; close now releases it"
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 010-sheet-reading-and-keyboard |
| **Shipped** | 2026-08-30 |
| **Level** | 1 |
| **State** | Shipped and harness-verified. The keyboard half is mechanism-verified only. Not operator-confirmed |

<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

A record opened on a phone now reads as a list of label-and-value pairs. Each value starts on a fixed
column immediately after its label instead of being flung to the right edge, rows are separated by a
hairline instead of a gap, and a row is a thumb-sized target rather than a line of text.

When the host reports a software keyboard, the sheet now lifts to sit on top of it and shrinks its
own cap by the same amount, so the field being edited stays visible and the top of the sheet stays on
screen. When the keyboard goes away the sheet returns to the floor.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `styles.css` | Modified | Re-rules the phone sheet's rows: fixed label column, left-aligned values, hairline dividers, thumb-height rows, scale-based type |
| `src/views/popover-position.ts` | Modified | Writes the measured keyboard inset into the sheet's bottom variable and subtracts it from the height cap; guards against pinch-zoom |
| `tools/storybook/verify-placement.mjs` | Modified | Adds the phone-section criteria, including two rewritten checks |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Both halves were measured before either was designed.

The two screenshots were luminance-thresholded per row band and decomposed into ink runs, which
turned an aesthetic complaint into a shape: the reference's value column starts at a fixed 154.7px
and ends ragged, while the plugin's values ended at a fixed 382.7px and started ragged across 51.0px.
That is the signature of right-alignment against a fixed column, and it named the defect precisely
enough to fix.

The keyboard mechanism was read out of Obsidian's own shipped bundle rather than inferred. The host
declares `--keyboard-height` on `:root`, writes it from the native keyboard events, and shrinks
`.app-container` with it. The sheet is portalled to `document.body`, a sibling of that container, so
it inherits none of the shrink. The lever to fix it already existed and was simply always being
written zero.

The stylesheet edit was taken under the serialized lane. The lane was acquired while the stylesheet
had already drifted with no phase claiming the edit, so the lane check was red before this phase
touched anything; that drift was attributed to the overlay phase and recorded rather than absorbed,
which is what keeps this phase's own diff measurable.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|---|---|
| Take the value off right-alignment inside the phone sheet only | The inherited rule reaches the sheet because the portal adds the container class to the sheet itself. Board cards still want right-aligned values, so the override is scoped rather than the rule deleted |
| Give the label a fixed 96px basis rather than a minimum width | A minimum is a floor: a longer label still shoves the value column sideways, which is the defect. The reference's own label column measures 103.4px; 96px is the nearest scale step that still fits the longest label present |
| Set row padding to put natural height at 37.6px | Within 0.4px of the reference's measured 38.0. The neighbouring scale steps land at 33.6, which misses, and 53.6, which leaves only five rows on screen |
| Allow one deliberately off-scale value | `min-height: 44px` is not a step on the space scale. It is WCAG 2.5.5 target size, cited as such, and it is the operator's "make more clickable" expressed as a number |
| Move the label onto a pixel token at the same rendered size | The old token was `0.875em`, and `em` compounds through nesting and drifts with the reader's text-size setting, so the scale silently stopped existing. A units fix, not a size change |
| Raise the value to 16px | The project scale's neighbours are 13 and 22. 16 is also the size below which iOS zooms the page on focus, so one value satisfies "a bit bigger" and removes a functional defect |
| Make the host variable primary and the visual viewport a fallback | Anything else would put the sheet on a different number from the toolbar riding beside it. Combined with `max()` so whichever observes the keyboard first wins |
| Subtract the inset from the height cap as well as raising the bottom | Raising the bottom edge alone pushes the top off screen. With the inset at zero the expression reduces to the predecessor's cap exactly, so that cap is preserved by construction rather than by retest |
| Rewrite two criteria rather than satisfy them | One could not fail; the other was wrong. Both are recorded in the criteria document with the control that now proves the check can go red |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

Sixteen criteria, each with a red baseline where one was obtainable.

| Check | Result |
|---|---|
| 1 — value text starts on one column | **PASS.** Left-edge spread was 42.3px across 36 rows against a ≤ 2px threshold |
| 2 — value column begins early enough | **PASS.** Was 84% of sheet width against a ≤ 40% threshold; the reference measures 38.5% |
| 3 — row pitch | **PASS.** Was 28.8px against a ≥ 38px threshold |
| 4 — thumb-sized row | **PASS.** Was 26.8px against the 44px WCAG 2.5.5 threshold |
| 5 — no dead space between targets | **PASS.** Was a 2.0px gap against a ≤ 0.5px threshold |
| 6 — a visible divider | **PASS.** Was `0px none`, no divider at all |
| 7 — value text at the iOS zoom floor | **PASS.** Was 13px against a ≥ 16px threshold |
| 8 — label on the type scale and ranked below the value | **PASS.** Was 13px against 13px, so the pair had no size rank at all |
| 9 — a long label truncates instead of shoving | **PASS.** The value box moved 115px against a ≤ 1px threshold. Check rewritten first; see limitations |
| 10 — sheet still reaches the floor with no keyboard | **PASS.** 844 against an innerHeight of 844, green before and after |
| 11 — sheet lifts onto a reported keyboard | **PASS.** Was 844 where 513 was wanted; the sheet had not moved at all |
| 12 — a lifted sheet is not pushed off the top | **PASS.** Was top 84 with height 760 against 513 of available space |
| 13 — sheet returns when the keyboard closes | **PASS**, green before and after |
| 14 — pinch-zoom is not mistaken for a keyboard | **PASS.** Not previously observable |
| 15 — the fallback works alone | **PASS.** Not previously observable |
| 16 — desktop keeps its geometry | **PASS.** Row 26.84px, value right-aligned, gap 2px, no divider — identical before and after |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No software keyboard was ever opened.** No harness in this repository contains one. Criteria 11
   through 15 drive the host's reporting mechanism at 331px, a value measured off the operator's
   screenshot. They prove the sheet responds correctly to the signal; they do not prove iOS emits
   that signal at that moment with that number. Only the device closes this.

2. **The panel still closes on a window resize.** `record-detail-panel.ts` registers
   `onResize = () => close()`. On iOS this never fires for the keyboard, which is why the reported
   screenshot shows the sheet still open — so it is outside the reported defect and was left alone.
   On a host that announces the keyboard by resizing the window, the sheet is destroyed before any
   inset can apply. Which of the two the operator's phone does decides whether the keyboard half is
   finished or blocked.

3. **Two criteria were defective before they were met.** One measured an edge that right-alignment
   pins by construction, so it passed against the defect and could never have gone red. The other
   set a threshold that forbade the layout being copied. Both are corrected and both carry controls,
   but they are evidence that a criterion's own falsifiability needs checking.

4. **The label sits at 13px, which is off the type scale.** This was a deliberate application of the
   rule that the project's scale outranks the design skill's default. A later audit measured it and
   raised it as an open operator decision — one token, not a defect.

5. **The continuity contradiction is resolved.** The block read `completion_pct: 64` and "not
   started" while the lane journal, the working tree and this document all said otherwise. The
   figure is now derived the way every other packet's is — ticked criteria over its own `goal.md`
   checklist — and the "not started" string is gone. Ten of eleven are ticked; the eleventh is the
   operator's, and no harness closes it.

<!-- /ANCHOR:limitations -->
