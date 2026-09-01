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

## Release 3 — the visual pass, 2026-09-01

**Reviewer:** Claude Opus 5 (assistant), with the operator's device review still outstanding
**Change:** captures read surface by surface rather than only where an edit was expected to land
**Changed images:** the record-detail set (sheet floor), the temporal set (header wrap), the mobile
control set (two classes raised to the touch floor), and the sparse-list set (fixture repaired)

| Image | Verdict | Note |
|---|---|---|
| `views/list-sparse-fields-mobile-light.png` | `regression (fixed)` | Showed blank lines where a missing property would be — a surface the renderer does not draw at that width, because `shouldReserveColumns` reserves only where two properties can share a line. Chasing it found the fixture's placeholder carrying children the renderer never builds, and the row missing its controls cell, which made every card content-width. |
| `views/timeline-view-mobile-light.png` | `regression (fixed)` | The title read **`M…`** — one character and an ellipsis. `Mar 23 – Apr 5` wants 153px and the header gave it 61. |
| `views/calendar-week-time-grid-mobile-light.png` | `regression (fixed)` | Same clipping: `Mar 22 – 28` wants 124px, given 81. |
| `panels/panel-record-detail-sheet-body-empty-mobile-light.png` | `expected-change` | The sparse record sheet now fills half the screen instead of sitting as a 145px strip with its grab bar at the bottom edge. The empty space below the fields is the trade, and it is where the note editor grows. |
| `panels/panel-filter-conditions-mobile-light.png` | `expected-change` | The rule icon buttons are 28px rather than 26px; the rows are otherwise unchanged. |
| `panels/panel-record-detail-desktop-dark.png` | `correct` | Title and expand action share one line; the desktop panel was not in the header-alignment fix's scope and improved with it, because the rule is written for both hosts. |
| `views/board-view-desktop-light.png` | `pre-existing-defect (card-title-wrap)` | The row named *"A deliberately long service name that has to truncate"* **wraps** on a card and truncates in a table cell. Both are correct for their surface — a card title that truncated would hide the distinguishing part of a name — so the FIXTURE's name is the wrong artefact, not the CSS. Renamed. |

### Two findings this pass produced that are decisions rather than repairs

**The week grid's timed events are unreadable, and not only on a phone.** Measured: **7 of 7** event
titles clipped at 402px, with title boxes between **0 and 19px**; at 1440px **2 of 7** still clip,
widest box 41px. The capture shows one character per line — `F…` `s…` `0…`. Seven columns on a
402px screen give each event ~50px, and the time and its dot are laid out before the title.

*Not taken here, because the three fixes are three different products.* Scroll the grid horizontally
with a minimum column width, the way the timeline already does. Show fewer days on a phone, the way
the platform calendars do. Or drop the time from a narrow segment and keep the title. The first is
smallest, the second is what a reader expects, the third changes what the block means. **The decision
is which.**

**The toolbar's utilities cluster overhangs the header by 10px at 320px.** Nothing spills at 402,
768 or 1440. The cluster is `flex: 0 0 auto` with fixed-size icon children and `overflow: visible`,
so letting it shrink moves the overflow rather than removing it; removing it properly means the
toolbar wraps and every chrome capture changes. **The decision is the narrowest supported width** —
320 is below the narrowest common handset, and this program's own list sweep starts at 360.

---

## Standing caveat

Every verdict above is the assistant's reading of a regenerated PNG. **None of it is device
confirmation.** The program's closing condition is the operator seeing these surfaces in the running
app on their own hardware, and no number of reviewed captures substitutes for it.
