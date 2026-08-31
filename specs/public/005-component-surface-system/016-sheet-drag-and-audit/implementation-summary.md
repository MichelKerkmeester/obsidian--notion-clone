---
title: "Implementation Summary: The Sheet Drag, and the Whole Feedback Set Audited Together"
description: "The most-reported defect in the program is root-caused and fixed: the panel's own render was destroying the grab bar. All eight sheet asks re-measured on one build, 19 of 22 passing."
trigger_phrases:
  - "016 sheet drag summary"
  - "grab bar re-render root cause"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/016-sheet-drag-and-audit"
    last_updated_at: "2026-08-30T10:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "Third drag report root-caused and fixed; eight asks measured, 19 of 22 pass"
    next_safe_action: "Operator decides the 13px row label and the sheet resize behaviour"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "probe"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-016"
      parent_session_id: null
    completion_pct: 50
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
| **Spec Folder** | 016-sheet-drag-and-audit |
| **Shipped** | 2026-08-30 |
| **Level** | 1 |
| **State** | Root cause fixed and verified. Three declared failures, two of them operator decisions. Not operator-confirmed |

<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Dragging the record sheet down now works after the view has re-rendered, which is to say it now works
at all in normal use. The grab bar was being destroyed on every metadata resolve, computed sync,
filter, sort and field edit — so the gesture worked on a freshly opened sheet and died the moment
anything happened. That is why the operator reported it three times and why two correct-looking
fixes did not hold.

The phase also re-measured all eight of the operator's bottom-sheet asks together, on one build,
through the surfaces' real entry points. They had been answered by different phases at different
times and had never been checked as a set.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `src/views/record-detail-panel.ts` | Modified | The content render re-asserts the sheet chrome it just destroyed |
| `src/views/mobile-bottom-sheet.ts` | Modified | The gesture binds to the panel and resolves the handle at pointerdown; pointer capture moves to the panel |
| `probe/sheet-audit.mjs` | Created | Drives all eight asks through the shipped entry points with real touch events |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The third report differed from the first two in one word. *"Barely works"* describes a gesture that
is dying rather than one that is dead, and that word is what redirected the investigation away from
the drag function — which two earlier rounds had read and found correct, because it is correct.

Two harness facts had to be established before any measurement was worth taking. Obsidian's own
property setter takes hyphenated CSS names and silently discards anything else, while the
repository's shim accepts camelCase — so the shim is more permissive than the phone, and a check
written against it can pass on declarations the device never receives. And nothing in the repository
had ever driven this gesture: the placement harness imports the chrome helper and not the drag
attachment, and every capture renders hand-written markup.

With the probe driving real touch events through the browser's input pipeline, the cause was visible
in one table: the grab bar is in the DOM when the sheet opens and absent after a single refresh, and
a 60px drag moves 60.0px and then 0.0px.

Both halves of the fix were then reverted individually against the same probe, which is how the phase
knows both are needed rather than believing it.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|---|---|
| Treat "barely" as the finding rather than as vagueness | A gesture that works when you are quick and not otherwise is a race, not a broken handler. That reading is what moved the search out of the drag function |
| Bind the gesture to the panel and resolve the handle at pointerdown | The panel survives every rebuild and the bar does not. A handle captured at install time is a detached node after the first refresh, which no press can match |
| Re-assert the chrome from the render as well | The bar is a visible affordance. A sheet with a working gesture and nothing to aim at is still broken, so the two halves fix different things |
| Revert each half alone before believing either | Restoring the bar alone leaves the drag dead while making the sheet look repaired. A fix stopping there would have shipped, looked right in every capture, and produced a fourth report |
| Install the host's real property setter in every probe | The repository's shim is more permissive than the device. Measuring against the shim is how a harness ends up agreeing with the phone for the wrong reason |
| Drive the gesture with real touch events rather than synthesised pointer events | A synthesised event skips hit-testing and `touch-action`, so it would prove only that the handler is callable |
| Measure and discard the transition theory | A live transition on a dragged property would produce this exact symptom, so it had to be excluded by measurement rather than by argument |
| Re-measure the seven asks this phase did not build | They were answered piecemeal across several phases and never checked together on one build. Citing the phase that built something is not the same as measuring it |
| Leave the camelCase declarations unfixed | Correcting them would activate `overscroll-behavior: contain` for the first time on every sheet, which is a behavioural change requiring a recapture |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

Nineteen of twenty-two checks pass. Every number comes from one probe run on one build.

| Ask | Verdict | The number |
|---|---|---|
| 1 — the drag | **Fixed here** | 60px drag moves **60.0px** fresh and after a re-render. Before: 60.0px fresh, **0.0px** after, bar absent from the DOM |
| 2 — header actions aligned | **Holds** | Both **44×44**, centre lines differing by **0.00px** |
| 3 — Notion-like row rhythm | **2 of 3 hold** | Row gap **0px**, divider **1px at 40% alpha**, value text **16px**. Label **13px, off the type scale** |
| 4 — keyboard avoidance | **Mechanism proven; one host shape unreachable** | Bottom moves 844 to **508** with a 336px keyboard, top stays on screen at **y=275**, returns to 844. **A window resize closes the sheet outright** |
| 5 — the grab band | **Holds, record corrected** | Answers presses over **y=1..32**, so **32px**, full width at **386 of 390**. The written record said 35px; the stylesheet's arithmetic gives 32 |
| 6 — one sheet fill | **Holds** | All **9** sheet-capable surfaces at `color(srgb 0.95 0.95 0.95)` |
| 7 — the scrim | **Holds; last clause a non-issue** | `rgba(0,0,0,0.25)`, `pointer-events: auto`. A press 120px above resolves to the scrim; a press on the band resolves to the grab handle |
| 8 — reusable sheet rows | **Holds** | `min-height 44px`, `padding 8px 16px`, height **44px** in both an owned-menu sheet and a panel sheet |

**Both halves proved necessary**, by reverting each alone: both halves give bar-survives and 60.0px;
reverting the chrome re-assert gives no bar and 0.0px; reverting the panel binding gives **bar
survives and still 0.0px**.

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **A row label sits at 13px, off the type scale.** The scale is 12/14/16/18/20/24 and 13 falls
   between two steps, which is the defect a scale exists to prevent — it reads as "not quite 14"
   rather than as a decision. The value beside it is 16px and on the scale. **A one-token operator
   decision, not a bug.**

2. **The record sheet closes on a window resize.** A software keyboard announces itself two ways: iOS
   shrinks the visual viewport and leaves the window alone, where the keyboard inset works perfectly;
   a host that resizes the window destroys the sheet before any inset can apply. **This is the one ask
   whose outcome genuinely depends on which phone the operator holds.**

3. **Five sheet declarations are written in a form the phone discards.** They are camelCase into a
   setter that takes hyphenated names only. Nothing is visibly wrong today, because the stylesheet
   declares the load-bearing ones important independently — but the declarations are dead, and the
   harness has been agreeing with the device for the wrong reason. Fixing the names would make
   `overscroll-behavior: contain` real for the first time on every sheet, so it belongs to a phase
   that can recapture.

4. **Three things are inferred rather than confirmed.** Whether Obsidian mobile publishes a non-zero
   keyboard height at the moment the keyboard opens on the operator's device; which resize signal
   their phone sends; and whether a real thumb landing at an angle on a moving list behaves like the
   one clean finger the probe dispatches.

5. **The grab band's height is disputed across the program.** Four values are on record — 35px in the
   originating spec, 48px in a lane entry, 35/41px in the lane's outstanding list, and **32px measured
   here on the shipped build**. This phase is the only one of the four that measured the shipped build
   rather than describing an intention. The operator's accepted trade-off does not depend on which is
   right: all four clear WCAG 2.5.8's 24px and fall short of 2.5.5's 44px.

6. **Nine sheet surfaces were found where the record says seven.** Every surface measured carries the
   identical fill, so the stakes are low, but the census number is quoted in three documents and only
   one of them counted.

<!-- /ANCHOR:limitations -->
