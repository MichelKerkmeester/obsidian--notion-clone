---
title: "Capture Review: Surface Contract and Truthful Harness"
description: "Per-release record of which captures changed, who looked at them, and the verdict for each — the sign-off a lane release requires."
trigger_phrases:
  - "000 capture review"
  - "capture sign-off"
importance_tier: "high"
contextType: "verification"
---
# Capture Review — 000

> A lane release is not complete without a row here for every changed image.
> `screenshots:verify` compares source fingerprints and **never opens an image**, so it can confirm
> a capture was regenerated and cannot tell whether it shows the right thing. That gap is how a
> previous release regenerated its captures while they showed the wrong thing.

Verdicts: `correct` · `expected-change` · `regression` · `pre-existing-defect (<id>)`

---

## Release 1 — harness truthfulness

**Reviewer:** Claude Opus 5 (assistant), with the operator's device review still outstanding
**Date:** 2026-08-29
**Change:** four pinned variables removed from the capture harness
**Changed images:** 22

| Image | Verdict | Note |
|---|---|---|
| `views/timeline-view-desktop-light.png` | `expected-change` | Bands now resolve to their own grid rows. Previously `--db-timeline-row` was pinned to `34px` where the property is a grid **line index**, so `grid-row` was invalid and every band collapsed to `auto`. Inspected: rows sit under Business and Personal with correct date spans. |
| `views/timeline-view-desktop-dark.png` | `expected-change` | Same cause, same fix. |
| remaining 20 | `expected-change` | Header height, card field width and sheet bottom offset now resolve from the product rather than from a pinned harness value. |

## Release 2 — token boundary

**Reviewer:** Claude Opus 5 (assistant), with the operator's device review still outstanding
**Date:** 2026-08-29
**Change:** `.db-surface` added to the light and dark token roots; `createOwnedMenu` stamps it
**Changed images:** 19

| Image | Verdict | Note |
|---|---|---|
| `views/board-view-desktop-light.png` | `correct` | Inspected. Cards, column headers, counts and the long-title truncation case all render as before. No regression from widening the token root. |
| `views/board-view-mobile-{light,dark}.png`, `views/board-mobile-mobile-dark.png` | `expected-change` | Board surfaces pick up the token scale consistently. |
| `panels/panel-record-detail-sheet-desktop-light.png` | `expected-change` | Sheet surface now resolves tokens at its own root. |
| remaining 14 | `expected-change` | Calendar, gallery and popover surfaces, same cause. |

---

## Standing caveat

Every verdict above is the assistant's reading of a regenerated PNG. **None of it is device
confirmation.** The program's closing condition is the operator seeing these surfaces in the running
app on their own hardware, and no number of reviewed captures substitutes for it.
