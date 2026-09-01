---
title: "Implementation Plan: Add View Surface Redesign"
description: "The approach that was taken: adjudicate each reported defect against production before designing anything, then rebuild the surface on the shared row grammar rather than author a seventh control idiom."
trigger_phrases:
  - "013 add view plan"
  - "add view row grammar"
  - "fixture artifact adjudication"
importance_tier: "critical"
contextType: "planning"
---
# Implementation Plan: Add View Surface Redesign

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

**This document is a record, not a forecast.** The work shipped before the plan was written.

The operator's report was a judgement — *"real bad… needs fresh design agent review"* — rather than a
list of defects, and the spec that opened the phase listed six things that looked wrong in a
screenshot with an explicit instruction to confirm each before designing anything.

**That instruction was the whole plan, and it paid.** Of the six, four were real, one was half real,
and one was an artifact of the screenshot fixture rather than of the product. A seventh defect nobody
reported was found by the same measurement pass. Designing from the screenshot would have produced a
fix for a defect that does not ship and missed one that does.

The surface was then rebuilt on the row grammar the sibling phase had just unified, rather than given
a seventh set of control shapes.

<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

| Gate | Observed |
|---|---|
| Phase gate | `SURFACE_PHASE=013-add-view-sheet npm run gate` **exits 0** |
| Placement, within it | **69/70**, the single red pre-existing and declared |
| Capture stability | the four add-view captures are the only attributable churn, and are **byte-stable on an identical rerun** |
| Shared-surface safety | no owned-menu, menu or panel capture moved across **two** recaptures |
| Control boundary, verifier follow-up | **1.21:1 raised to 3.23:1**, with a zoom-safe 16px control |

**The gate's exit status is read from `$?` of the gate itself, never through a pipe.** A pipe reports
the pipe's status, which is how three checks were misread earlier in this program.

Every criterion drives `showAddViewMenu`. The harness bundles the real module with esbuild rather
than reimplementing it, because `positionToolbarPopover` is the only placement path this surface uses
and `applySheetChrome` is reached *through* it, never directly.

<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

**The controlling decision was to delete an idiom rather than add one.** The surface carried six
distinct control boxes and five type sizes inside 292px. The repair replaces the tile grid — cards,
card labels, previews, preview icons and preview lines — with a container that stacks nothing but
shared menu rows.

The duplicate action was the interesting case. It sat in a legacy toolbar-menu-row family *and*
carried its own override block, so its box was decided in two places. Dropping it out of both leaves
the row rule as the single authority, which is what makes the surface's rows the same objects as
every other sheet's.

**One shared rule was touched, and it is named because shared rules are how this program breaks
things.** The resting-row background reset moved from the owned-menu descendant selector to a
doubled-class form on the row itself — same weight, same computed value inside the owned menu — because
a row rendered *outside* an owned menu was picking up the host's bare-button fill. The blast radius
was then measured rather than argued: no owned-menu, menu or panel capture moved across two
recaptures.

**The fixture was treated as a defect surface in its own right.** Four divergences between it and
production were what made two of the six reports wrong, and one of them is structural: the capture
CSS forces `position: static !important`, so **no capture of this scenario can ever show sheet
presentation**. Report 6 was read off an image incapable of showing the answer.

<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

**Step 1 — establish the production path.** `showAddViewMenu()` builds the panel and hands it to
`positionToolbarPopover`. A check earns its result only if it drives that function.

**Step 2 — adjudicate all six reports against production**, at desktop 1440×900 and phone 390×844,
before changing anything.

**Step 3 — audit the fixture against production** and record every divergence, because the fixture is
what the committed captures show and two reports had already been distorted by it.

**Step 4 — rebuild on the row grammar**: delete the tile grid, stack shared rows, give the form a
labelled-field vocabulary, and group the surface so the thing being made is separated from the
options that shape it.

**Step 5 — take the verifier's follow-ups**, which raised the form controls' boundary contrast and
made them zoom-safe.

<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

Checks live in `src/views/add-view-popover-layout.test.ts` and read `core.mjs` and
`toolbar-renderer.ts` directly, so a divergence between the fixture and production is itself
assertable.

**AC-8 exists to stop the fixture lying again.** It freezes the tile count, the accessible names and
the modifier emission against production. Without it the surface can be made green by a fixture that
drifts, which is the failure mode that produced two wrong reports in the first place.

**AC-7 exists because a report was wrong.** It asserts the phone presentation that *already* passed,
so the thing report 6 claimed was broken is now pinned. A criterion that guards a non-defect is
worth having when the non-defect was once believed.

<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

`011-mobile-menu-presentation` is the hard dependency: it unified the row grammar and established
sheet presentation for this family. This phase consumes both and authors neither.

The stylesheet lane was acquired clean and released twice — once for the rebuild and once for the
verifier follow-up.

**Two things this phase depends on are known to be imperfect and were left alone**: the muted text
token, and the disagreement between the two phone predicates. Both are named in §7 below.

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Reverting restores the tile grid and the duplicate action's override block. The four add-view
captures are the only attributable churn and are byte-stable on an identical rerun, so a revert's
visual footprint is known in advance.

**The shared rule is the part a revert must be careful with.** The resting-row reset now serves rows
outside the owned menu; reverting it re-breaks those rows rather than restoring a neutral state.

Three items were deliberately not done and are not rollback candidates:

- **The tile border cannot reach 3:1 and was not forced to.** Measured against the panel, no border
  or surface token in this system clears it — `--db-border-regular` 1.15, `--db-border-emphasis`
  1.21, `--db-border-subtle` 1.08, `--background-secondary` 1.01 in the light theme. Inventing one
  would fork the palette. It does not need to: the tiles became rows whose text identifies them, so
  no boundary is load-bearing for identification, and the focus ring that *is* load-bearing uses
  `--interactive-accent` at 4.3 light and 3.36 dark.
- **`--text-muted` at 12px measures 4.1:1 in the light capture theme**, below the 4.5:1 body-text
  floor. It is the token every muted label in the plugin already shares, so changing it is a
  program-wide decision. **Escalated, not fixed.**
- **The two phone predicates still disagree** — a 760px container test against a 600px window test.
  On a 700px tablet this surface is "touch" to every renderer and not a sheet to the positioner.
  Pre-existing and out of scope here.

<!-- /ANCHOR:rollback -->

---

## 8. CROSS-REFERENCES

- [`spec.md`](spec.md) · [`tasks.md`](tasks.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../roadmap.md`](../roadmap.md) · [`../design-system.md`](../design-system.md)
- [`../011-mobile-menu-presentation/spec.md`](../011-mobile-menu-presentation/spec.md) — the row grammar this consumes
