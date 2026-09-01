---
title: "Task Breakdown: Add View Surface Redesign"
description: "The work as it was actually done: six reports adjudicated against production, a seventh defect found by measuring, and the surface rebuilt on the shared row grammar."
trigger_phrases:
  - "013 add view tasks"
  - "add view adjudication evidence"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Add View Surface Redesign

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**Written after the work was done.** Each task closes on a number that was read.

**An adjudication task can close by disproving its own premise.** T5 and T6 closed by establishing
that two reported defects were not product defects, which is a result rather than a non-result.

**A criterion is met only when its check runs inside the phase gate and that gate exits 0**, read
from `$?` of the gate itself and never through a pipe.

<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP — adjudicate before designing

- [x] **T1** Establish the production placement path.
      *Closed on:* `showAddViewMenu()` at `toolbar-renderer.ts:1251` builds the panel and hands it to
      `positionToolbarPopover(panel, anchorEl, COMPACT_MENU_POPOVER)` at `:1334`. That is the only
      placement path; `applySheetChrome` is reached through it, never directly by this surface. A
      check earns its result only if it drives `showAddViewMenu`.
- [x] **T2** Adjudicate report 1 — the duplicated action. **REAL.**
      *Closed on:* 2 elements own the exact text `Duplicate current view`, on both viewports, and
      they do different things.
- [x] **T3** Adjudicate report 2 — the unlabelled dropdown. **HALF REAL.**
      *Closed on:* the accessible name **is** present in production — `aria-label="Title property"`.
      The visible label is absent. So the WCAG 4.1.2 half is a fixture artifact and the 3.3.2 half is
      real. Splitting this mattered: fixing the reported version would have addressed a failure that
      does not ship.
- [x] **T4** Adjudicate reports 3, 4 and 5 — idioms, skeletons, grouping. **ALL REAL.**
      *Closed on:* **6 distinct control boxes and 5 distinct type sizes** (11/12/13/13/14px) inside a
      292px surface; **7** `db-add-view-preview-lines` spans, each an empty 42×18 box carrying
      `border-block: 2px solid currentColor` at **1.54:1** in light; **0 sections, 0 separators, 0
      fieldsets**, with a between-group gap of 0px against a within-group gap of 4px.
- [x] **T5** Adjudicate report 6 — popover instead of a sheet. **FIXTURE ARTIFACT.**
      *Closed on:* production on a 390×844 phone already has the sheet class, `bottom: 0px`, a scrim,
      a grab handle, width 390 at full bleed and a rect bottom of 844 on the viewport floor. **It was
      already a sheet.**
- [x] **T6** Audit the fixture against production and record every divergence.
      *Closed on:* four divergences in `tools/screenshots/scenarios/core.mjs:104-146` — 4 tiles
      against production's 7; no `aria-label` on the select or the two inputs where production has
      all three; a preview element with no `is-*` modifier, which hid that the modifier is matched by
      **no CSS rule at all**; and `captureCss` forcing `position: static !important`, which means
      **no capture of this scenario can ever show sheet presentation.** Report 6 was read off an
      image structurally incapable of showing the answer.
- [x] **T7** Report the seventh defect, which nobody reported.
      *Closed on:* production renders **7** view-type tiles and the fixture renders **4**. Every
      committed capture of this surface understates it by three tiles. Found by the same measurement
      pass, not by the report.

<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION — rebuild on the row grammar

- [x] **T8** Give the two actions distinct names — AC-1.
      *Closed on:* no two controls in the surface carry the same accessible name. They do different
      things, so they are named differently rather than merged.
- [x] **T9** Give every control a visible label — AC-2.
      *Closed on:* was **0 of 3**. The select displayed `Cost` and was named `Title property` only to
      a screen reader. A labelled-field vocabulary was added: `db-add-view-field` and
      `db-add-view-field-label`.
- [x] **T10** Delete the tile grid and stack shared rows — AC-3.
      *Closed on:* the duplicate row measured **36px tall with 6px/12px padding and a 36px
      min-height**. It was dropped out of the legacy toolbar-menu-row family **and** out of its own
      override block, so the row rule alone decides its box: **30px with 0/8px padding on desktop,
      44px on a phone**.
- [x] **T11** Remove everything that reads as a loading skeleton — AC-4.
      *Closed on:* threshold is 0 elements whose only content is horizontal rules; was 7.
- [x] **T12** Group the surface and name the groups — AC-5, AC-6.
      *Closed on:* between-group gap now at least twice the within-group gap, both on the
      `--db-space-*` scale — a 16px trailing group gap against an 8px item gap. Group headings use
      `db-menu-section`, the vocabulary the owned menu already has.
- [x] **T13** Give the surface one left edge — AC-9, added during implementation.
      *Closed on:* **3 distinct content edges — 9 / 15 / 21 desktop and 9 / 15 / 29 phone** — across
      the group heading, field caption, checkbox caption and row icon. Now one.
- [x] **T14** Stop a resting row painting a fill — AC-10, added during implementation.
      *Closed on:* a resting row computed `rgb(242,243,245)` against a `rgb(242,242,242)` panel.
      **One shared rule was touched to fix it**: the resting-row background reset moved from the
      owned-menu descendant selector to a doubled-class form on the row itself — same weight, same
      computed value inside the owned menu — because a row outside an owned menu was picking up the
      host's bare-button fill.
- [x] **T15** Take the verifier's follow-up on the form controls.
      *Closed on:* control boundary raised from **1.21:1 to 3.23:1**, and the controls made zoom-safe
      at 16px.

<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T16** Assert the phone presentation that was wrongly reported broken — AC-7.
      *Closed on:* every clause already passed before the change and passes after. The criterion
      exists **because** report 6 was wrong; pinning a non-defect is worth doing once it has been
      believed.
- [x] **T17** Freeze the fixture against production — AC-8.
      *Closed on:* the fixture now emits the same tile count, the same accessible names and the same
      modifiers as production. Without this the surface can be made green by a fixture that drifts,
      which is what produced two wrong reports.
- [x] **T18** Measure the shared rule's blast radius rather than assert it.
      *Closed on:* **no owned-menu, menu or panel capture moved across two recaptures.** The four
      add-view captures are the only attributable churn and are **byte-stable on an identical
      rerun**.
- [x] **T19** Run the phase gate and read its own exit status.
      *Closed on:* `SURFACE_PHASE=013-add-view-sheet npm run gate` **exits 0**, placement **69/70**
      with only the pre-existing declared red. Status read from `$?` of the gate, not through a pipe
      — a pipe reports the pipe's status, which is how three checks were misread earlier in this
      program.
- [ ] **T20** Confirm on the operator's device.
      *Not done.* The report was a judgement about how the surface looks, and no human has opened a
      picture of the rebuilt version.

<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- All six reports adjudicated against production with a measurement each: 4 real, 1 half real, 1
  fixture artifact.
- The seventh, unreported defect recorded.
- The fixture's four divergences recorded and frozen by a criterion.
- AC-1 through AC-10 each carry a before-number and a check that drives `showAddViewMenu`.
- The one shared rule touched is named, and its blast radius measured across two recaptures.
- The gate exits 0 with its status read directly.

**Deliberately not done, and named rather than omitted:** the tile border cannot reach 3:1 with any
token in this system and was not forced to; `--text-muted` at 4.1:1 is escalated as a program-wide
decision; the two phone predicates still disagree. No operator confirmation.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md) · [`../design-system.md`](../design-system.md)
- [`../011-mobile-menu-presentation/spec.md`](../011-mobile-menu-presentation/spec.md)

<!-- /ANCHOR:cross-refs -->
