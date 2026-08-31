---
title: "Implementation Summary: Add View Surface Redesign"
description: "The Add View surface is rebuilt on the shared row grammar. Six reported defects were adjudicated against production first: four real, one half real, one an artifact of the screenshot fixture."
trigger_phrases:
  - "013 add view summary"
  - "add view rebuilt row grammar"
importance_tier: "critical"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/013-add-view-sheet"
    last_updated_at: "2026-08-30T07:57:00Z"
    last_updated_by: "phase-author"
    recent_action: "Tile grid deleted and rebuilt on the row grammar; six reports adjudicated"
    next_safe_action: "Operator opens the Add View surface on both platforms and reports"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-013"
      parent_session_id: null
    completion_pct: 67
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
| **Spec Folder** | 013-add-view-sheet |
| **Shipped** | 2026-08-30 |
| **Level** | 1 |
| **State** | Shipped and harness-verified. Not operator-confirmed |

<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The Add View surface is now built from the same rows as every other menu and sheet in the plugin. The
tile grid is gone — with it the four picker cards, their preview boxes and the paired horizontal rules
that read as loading skeletons. What remains is a stack of shared rows, a form whose fields carry
visible labels rather than screen-reader-only names, and a real grouping that separates the thing
being created from the options that shape it.

The duplicate action, which had appeared twice under one name, now has one name per action.

**The more useful output is the adjudication.** Six defects were reported off a screenshot. Four were
real, one was half real, and one was not a product defect at all — the surface was already a sheet on
a phone, and the screenshot could not have shown that. A seventh defect nobody reported was found
while measuring.

### Files Changed

| File | Action | Purpose |
|---|---|---|
| `src/views/toolbar-renderer.ts` | Modified | Rebuilds the surface on shared rows; adds the labelled-field vocabulary and group headings |
| `styles.css` | Modified | Deletes the tile-grid rules; moves the resting-row background reset onto the row itself |
| `tools/screenshots/scenarios/core.mjs` | Modified | Brings the fixture into line with production on tile count, accessible names and modifiers |
| `src/views/add-view-popover-layout.test.ts` | Created | The criteria, read against both the fixture and the renderer |

<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The spec that opened the phase listed the six visible problems and instructed that each be confirmed
before anything was designed, because a previous phase in this program had spent hours on a defect
that existed only in hand-written fixture markup. That instruction is what produced most of this
phase's value.

Every report was measured against production at 1440×900 and 390×844 before a line changed. The
dropdown's missing label turned out to be two separate claims with different answers: the accessible
name ships and the visible label does not. The phone-presentation report turned out to be an artifact
of the capture pipeline, which forces static positioning and therefore cannot render a sheet at all.

The fixture was then audited in its own right and four divergences from production were recorded. One
of them had been hiding a genuine finding: the preview element was emitted without its state
modifier, which concealed that the modifier is matched by no rule anywhere in the stylesheet.

The rebuild followed, taken under the stylesheet lane and released, with a second lane hold for the
verifier's follow-up on control contrast. Capture churn was attributed rather than assumed: the four
add-view captures are the only files that moved, and they are byte-stable across an identical rerun.

<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|---|---|
| Adjudicate all six reports against production before designing | Two of the six were wrong. Designing from the screenshot would have fixed an accessibility failure that does not ship and a presentation that was already correct |
| Split the unlabelled-control report into two claims | The accessible name and the visible label are different requirements with different answers. Treating them as one would have closed the wrong half |
| Delete the tile grid rather than restyle it | The surface carried six control idioms and five type sizes in 292px. Restyling would have produced a seventh idiom; the sibling phase had just made one row grammar available |
| Drop the duplicate action out of both its families | Its box was decided in a legacy row family and again in its own override block. Removing both leaves the shared row rule as the single authority |
| Move the resting-row reset onto the row itself | A row rendered outside an owned menu was picking up the host's bare-button fill. The doubled-class form keeps the same weight and the same computed value inside the owned menu, so the change is additive rather than a re-specification |
| Freeze the fixture against production with a criterion | The fixture is what every committed capture shows. Without a check it drifts again, and a drifted fixture is what made two reports wrong |
| Add a criterion for the presentation that was never broken | Report 6 claimed a defect that did not exist. Once a non-defect has been believed, pinning it is cheap insurance |
| Do not force the tile border to 3:1 | No border or surface token in this system clears it, so meeting it would fork the palette. The tiles became rows whose text identifies them, so no boundary is load-bearing for identification |

<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

### The six reports, adjudicated

| # | Reported | Verdict | What decided it |
|---|---|---|---|
| 1 | The duplicate action appears twice | **REAL** | 2 elements own that exact text on both viewports, and they do different things |
| 2 | Unlabelled dropdown | **HALF REAL** | `aria-label="Title property"` ships; the visible label does not |
| 3 | Six control idioms | **REAL** | 6 distinct boxes, 5 distinct type sizes, inside 292px |
| 4 | Rules under each icon read as skeletons | **REAL** | 7 empty 42×18 spans with a 2px border-block at 1.54:1 in light |
| 5 | No grouping | **REAL** | 0 sections, 0 separators, 0 fieldsets; between-group gap 0px against a within-group gap of 4px |
| 6 | A popover on a phone, not a sheet | **FIXTURE ARTIFACT** | Production already has the sheet class, `bottom: 0px`, scrim, handle, full width and its rect on the viewport floor |
| 7 | *Not reported; found by measuring* | **REAL** | Production renders 7 view-type tiles; the fixture renders 4 |

### The criteria

| Check | Result |
|---|---|
| AC-1 one affordance per action | **PASS.** Was 2 controls sharing one accessible name |
| AC-2 visible labels | **PASS.** Was 0 of 3 |
| AC-3 one row grammar | **PASS.** The duplicate row was 36px with 6px/12px padding; it is now decided by the row rule alone — 30px desktop, 44px phone |
| AC-4 nothing reads as a skeleton | **PASS.** Was 7 rule-only elements |
| AC-5 groups separated | **PASS.** Was within-group 4px against between-group 0px |
| AC-6 groups named | **PASS.** Was 0 sections |
| AC-7 phone presentation | **PASS**, and passed before — the point of the criterion |
| AC-8 the fixture stops lying | **PASS.** Was 4 divergences |
| AC-9 one left edge | **PASS.** Was 3 distinct edges, 9/15/21 desktop and 9/15/29 phone |
| AC-10 a resting row paints no fill | **PASS.** Was `rgb(242,243,245)` on a `rgb(242,242,242)` panel |
| Verifier follow-up | Control boundary raised from 1.21:1 to 3.23:1; controls zoom-safe at 16px |
| Phase gate | **exits 0**, placement 69/70 with only the pre-existing declared red |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **No human has opened a picture of the result.** The report was a judgement about how the surface
   looks, and it is closed here entirely by measurement.

2. **The tile border was never brought to 3:1, deliberately.** Measured against the panel, no token
   in the system clears it: the regular border reads 1.15, emphasis 1.21, subtle 1.08 and the
   secondary background 1.01 in light. Inventing one would fork the palette, and it is not needed —
   identification now rests on the row's text, and the focus ring that is load-bearing uses the
   accent token at 4.3 light and 3.36 dark.

3. **`--text-muted` at 12px measures 4.1:1 in the light capture theme**, under the 4.5:1 floor for
   body text. It is shared by every muted label in the plugin, so it is escalated as a program-wide
   decision rather than changed here.

4. **The two phone predicates still disagree** — one keys off a 760px container, the other off a
   600px window. On a 700px tablet this surface is "touch" to every renderer and not a sheet to the
   positioner. Pre-existing and out of scope.

5. **This phase's `spec.md` continuity block still reads `completion_pct: 67` and "not started".** The
   lane journal records this phase acquiring, editing and releasing the lane twice. The conflict is
   recorded in the parent roadmap rather than silently corrected here.

<!-- /ANCHOR:limitations -->
