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

### What a capture cannot show, and the defect it nearly invented

`components/panel-invalid-events-modal-mobile-light.png` reads as broken: the Start inputs run to
the modal's edge and the End column is not in the picture at all, on a modal whose own subtitle says
*"Adjust the start or end time of each event"*. A probe agreed — **21 elements past the modal's right
edge, the worst by 314px**, with `overflow-x: hidden` on the modal.

**It is not broken.** The grid inside it measures `width 370, scrollWidth 684, overflow-x auto`: the
End column is one horizontal scroll away and always was. The probe compared each element against the
MODAL rather than walking up for a scroller — the same naive comparison `view-census` avoids on
purpose, reproduced here while chasing a capture.

**A still image cannot show a scroll affordance**, so every horizontally scrolling surface reads as
truncated in review. That is a standing property of this method, not of these surfaces, and it is
worth stating beside the verdicts: a capture is evidence about what is drawn, never about what is
reachable. A speculative `min-width: 0` was tried on the grid, changed nothing measurable, and was
reverted rather than kept as a tidy-looking no-op.

### Two findings this pass produced that are decisions rather than repairs

**The week grid's timed events are unreadable, and not only on a phone.** Measured: **7 of 7** event
titles clipped at 402px, with title boxes between **0 and 19px**; at 1440px **2 of 7** still clip,
widest box 41px. The capture shows one character per line — `F…` `s…` `0…`. Seven columns on a
402px screen give each event ~50px, and the time and its dot are laid out before the title.

**One of the three candidate fixes is already shipped and is not enough, which narrows the decision
to two.** `body.is-mobile .db-calendar-month-time { display: none }` already hides the time in a
narrow segment — and the title still measures 19px at its widest, because a ~50px column minus 4px
of margin, 12px of padding, a 3px accent border, the timed dot and its gap leaves about twenty
pixels. **The contents are not what is squeezing it; the column is.**

So the remaining two are: scroll the grid horizontally with a minimum column width, the way the
timeline already does, or show fewer days on a phone, the way the platform calendars do.

*Not taken here, and this is a limit rather than a preference.* Neither is a one-line reversible
default. The week view already sizes three rows from `--db-calendar-col-width` — the day header
(`.db-calendar-time-header-days`), the all-day band (`.db-calendar-week-allday-cols`) and the body
(`.db-calendar-week-body`) — and they sit in **different parents**, so a scroller has to synchronise
three horizontal offsets while keeping the 52px time gutter fixed. The stylesheet carries four
comments explaining how those widths were made to agree; a scroll container is where that agreement
would break, and breaking it would trade an unreadable title for a misaligned grid. **The decision is
which of the two, and it comes with a layout task rather than a declaration.**

**The toolbar's utilities cluster overhung the header by 10px at 320px — repaired the same day, and
the reasoning that deferred it was wrong.** This entry first called the two fixes opposite
directions. They are not: `flex-wrap: wrap` is **additive** — inert at any width where the row
already fits, so 402 and up are untouched by construction. `header descendants past the header's
content box` goes **1 → 0**, and back to 1 without the declaration. Letting the cluster shrink is
the alternative and genuinely does not work, which is what made it look like a fork: it is
`flex: 0 0 auto` with fixed-size icon children and `overflow: visible`, so shrinking moves the
overflow into the cluster instead of removing it. **What is still the operator's call is the
narrowest supported width**, and the surface is now correct at either answer.

---

## Release 4 — the full sweep, 2026-09-01

**All 60 scenarios opened, across five parallel reviewers**, one per capture group, each reading both
a phone-dark and a desktop-light variant. Reviewers were told to report only what is visible, to mark
a confidence, and to say what would settle an ambiguous case.

### Two capture fixtures were photographing tables the plugin does not build

Both are the same bug — a header and its rows disagreeing about how many columns there are — and both
survived because the picture still looks like a table.

**`panel-record-peek`** hand-rolled its body rows and omitted the select cell its own header declares.
Every row therefore sat one column LEFT of its header: the record name rendered inside the 76px
checkbox column and truncated to two characters (`Fi…`, `A…`, `S…`), the cost sat under **Name**, the
billing pill under **Cost**, the category under **Next Renewal**. The peek panel beside it showed the
true values all along, which is what made the mismatch legible once someone looked.

**`table-mobile`** drew its own select and record-icon headers and *then* called `tableHeader()`,
which emits a select header of its own — **nine header cells against eight body cells**. Every column
was labelled with its neighbour's name, and on the phone the labels were pushed off-screen entirely,
so that capture had no visible headers at all. `tableHeader()` now takes `{ selectColumn }` so a
caller that has already drawn the gutter can say so.

**The class is now checked mechanically.** A placement-lane case renders every scenario and compares
each table's header span against every body row's, counting `colSpan` rather than elements so a
footer or group row that legitimately spans still passes. Red on the tree as received:
`table-mobile: header spans 9, a body row spans 8`. It also refuses to pass vacuously — a run that
found no table says so.

### One product defect, found the same way

The phone table's select column read as **65px of cell around a single 28px checkbox**. The stylesheet
pins it to 64 under `.is-phone` with an arithmetic comment for a cell holding *two* controls, but the
row only draws the reorder button when a reorder is possible — and it is not the moment a view is
explicitly sorted, which is where a reader lands as soon as they tap a column header. **36px of dead
width on every row of a 402px screen, in the ordinary sorted state.** Now 40px when the button is
absent, 64px when it is drawn.

*Two things that pass will not survive a rewrite of this note.* The JS width in `table-renderer.ts`
cannot reach the phone at all — the phone table is auto-layout and the `.is-phone` rule pins all three
of `width`/`min-width`/`max-width`, so the `<colgroup>` value never decides it. The JS change went in
anyway because it also feeds the grouped table's `min-width`, which was 24px too wide for the same
reason. And the CSS is keyed to the **table**, not the cell: a `:has()` on the cell would narrow the
header alone, because a `th` never holds a move button.

### What the reviewers found that is not yet acted on

The five reports carry roughly sixty further observations. They are **not** treated as findings here,
for a reason the reviewers surfaced themselves: several captures are transparent PNGs, and one
reviewer reported two scenarios as badly broken on first read, then withdrew both after compositing
them over the app's own background. A contrast or visibility verdict taken against a viewer's white
matte is a verdict about the viewer.

So the reports are kept as a **triage queue, not a defect list**. The clusters worth taking first,
each still needing its own measurement before anything changes:

| Cluster | Where | Why it is first |
|---|---|---|
| Option-palette collisions — `gray` ≡ `slate`, `brown` ≡ `orange` in dark | status colours, icon picker, colour picker | One palette fix clears three surfaces' worth of reports |
| The selected day in the date picker is 1.10:1 against its own panel | date-value-picker, both themes | The one piece of state the picker exists to show |
| Unstyled `#0000EE` link colour in dark theme | file fields | No dark token at all; 1.78:1 |
| Truncation where the row still has slack | sort direction chips, dropdown options, base-import labels | Width is going to the control that does not need it |
| Several `-mobile-*` captures are byte-identical to their desktop counterparts | date pickers, colour picker | If real, those mobile shots prove nothing about mobile |

**Nothing above is claimed as verified.** Each is a reviewer's reading that has to be reproduced by
measurement before it becomes a row anywhere.

---

## Standing caveat

Every verdict above is the assistant's reading of a regenerated PNG. **None of it is device
confirmation.** The program's closing condition is the operator seeing these surfaces in the running
app on their own hardware, and no number of reviewed captures substitutes for it.
