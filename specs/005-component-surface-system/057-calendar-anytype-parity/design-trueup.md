---
title: "Design True-Up: The Nine Calendar Anatomy Elements Against the Anytype Captures"
description: "One row per anatomy element — the Anytype calendar screen it was measured on, the pixel values read off that screen, what our renderer and stylesheet do today, and what changes. This is T001's output and the packet's design record."
trigger_phrases:
  - "057 design true-up"
  - "calendar capture read"
  - "calendar anatomy measurements"
  - "anytype calendar month grid"
  - "T001 capture read"
  - "calendar migration table"
importance_tier: "high"
contextType: "research"
---
# Design True-Up: The 057 Calendar Anatomy Against the Captures

> This is **T001's output** and goal D1's gate. Every value below was read off a file in
> `screenshots/anytype/desktop/sets/*/` or `screenshots/anytype/desktop/menus/`, or off a line in
> `styles.css` or `src/views/calendar-renderer.ts`. Nothing is carried over from `050`'s or `051`'s
> true-up unless it is labelled as such. Where a value could not be read off a screen it says
> **pixel read owed** or **design inferred** and names why.

---

<!-- ANCHOR:headline -->
## 1. THE HEADLINE, BEFORE THE TABLE

**Anytype's calendar is a plain seven-column month grid with no chrome at all, and almost every
decoration ours carries is one Anytype does not have.** The month grid is 1492px wide in a 1524px
content pane, seven equal 213.1px columns and five 136px week rows, ruled by 1px `#EBEBEB` lines.
A day is a number in the **top-right corner** and a stack of **20px-pitch rows**, each an icon
plus a label on **no background whatsoever**: no fill, no tint, no border, no radius, no left
accent bar. Ours is a 20px-tall pill with a 3px accent border-left, a 7% accent tint, a 6px radius
and a hover lift (`styles.css:17345`, `:17437`). That is the single largest delta in this packet.

**The two absences the packet asked to be established are established, across all twenty set
captures and both themes.** There is **no unscheduled or backlog region** — zero non-background
pixels below the grid's bottom rule in 10 light and 10 dark captures. There is **no month/week/day
scale switch** — zero ink in the header band between the month title and the `‹ Today ›` cluster
in the same twenty, and the layout panel's only two settings are `Date Property` and `Show icon`
(`anytype-menu-set-layout-calendar-light.png`). A4 and A6 are absences by measurement, not by
inference from one screen.

**The today marker is the one place Anytype uses an accent, and it is the one place it fails
WCAG.** A 26 × 24px fully-rounded `#3C7FFB` disc carrying a white numeral: white on that blue is
**3.74:1** against a 4.5:1 requirement for 16px text. Separately, the today cell **drops the
weekend tint** and reverts to the plain surface — measured on `anytype-menu-calendar-day-menu-
light-full.png`, where Sat 5 September is `#FFFFFF` while the four Saturdays below it are
`#F7F7F7`. Ours already does that (`styles.css:16882`), which is the only element that needed no
change at all.

**Three values in this packet's own brief were wrong and the captures overrule them.** The
captures are **1:1, not 2×** — halving them would have produced a calendar at half scale. The
"6 calendar menus" are **5 distinct surfaces**: the day-menu and item-menu files are byte-identical
(same MD5, all four pairs). And the `047`-sourced claim that the month and year selects "span years
0-3000" is not observable in a static list; what is captured is a 12-row month list and a
scrollable year list. §5 has all three with their evidence.

**ADR-002 is ruled, and it changes how half this document reads.** Operator, 2026-09-05 ~23:20:
*"Keep week and day, styled to the month grid."* The month view becomes Anytype 1:1; the week and
day scales survive as **ours, restyled to the month grid's measured values** — same tokens, same
chip grammar, same header. They are not inferred from Anytype, because Anytype has nothing to infer
them from. §7 carries the wording and the consequence for each affected row.

**Retarget posture, unchanged.** ADR-004 is in force: every captured value is adopted, and the only
permitted ground for declining one is a measured WCAG failure. Four refusals survive that test and
are in §6. Everything else in §4's `What changes` column is an adoption.
<!-- /ANCHOR:headline -->

---

<!-- ANCHOR:method -->
## 2. HOW THE CAPTURES WERE READ

### 2a. Scale, and the brief's premise that is false

**These captures are 1 device pixel to 1 CSS pixel. The dispatch brief's instruction to divide by
two is wrong for this set and was not applied.** Three independent checks:

1. **Grid lines are 1 device pixel wide.** The vertical column separators in
   `anytype-project-tracker-calendar-light.png` occupy exactly one column each at x = 848, 1062,
   1275, 1488, 1701, 1915. A 1px CSS border at DPR 2 renders as two device pixels.
2. **The capture is 2168 × 1217, an odd height.** A 2× capture of an integer CSS viewport cannot
   have an odd pixel dimension.
3. **`051`'s true-up reached the same answer independently** on the same 2168 × 1217 window,
   measuring the view-settings popover at 360px and its rows at a 28px pitch
   (`051/design-trueup.md` §2). This document re-measures that panel at **358 × 298px with a 28px
   row pitch** off a different file, and the two agree.

Halving would have put the day cell at 68px, the chip pitch at 10px and the body text at 6px. Every
number below is a CSS pixel as captured.

### 2b. Method

Grid lines were found by scanning for columns and rows that are uniform across the grid body, not
by eye. Text sizes are derived from **cap height at 50% coverage** — the glyph extent after
resolving each pixel's alpha against the known background — divided by 0.727, the cap-height ratio
of the interface face. A size stated as `≈16px` means a measured 12px cap; the cap height is given
alongside so the derivation is auditable. Colours are per-pixel samples of glyph cores, never eyedropped
from a scaled view. Contrast ratios are computed from the sampled hex.

**What a static capture cannot answer.** Hover, focus, press, drag, the overflow affordance, and
what a six-week month does to the row height. Each of those is marked **pixel read owed** in §4
rather than filled with a plausible number.

### 2c. The measured Anytype calendar system, as one table

Read off `anytype-project-tracker-calendar-{light,dark}.png` unless another file is named. Every
row was cross-checked on at least one second use case.

| Property | Light | Dark | Where |
|---|---|---|---|
| Page surface | `#FFFFFF` | `#171717` | every set capture |
| Grid rule, 1px | `#EBEBEB` | `#292929` | 6 vertical + 6 horizontal, all 1px |
| Grid box | **x 636..2128 = 1492px wide**, inset 16px each side of the 1524px content pane | same | rule y=324 spans x 636..2128 |
| Columns | **7 equal, 213.1px pitch** (848, 1062, 1275, 1488, 1701, 1915) | same | column scan at y 620..730 |
| Week rows | **136px** (rules at 324, 461, 597, 733, 869, 1005) | same | uniform-row scan |
| Rows per month | **5 in every captured month** (May, June, September 2026) | same | a 6-row month is not captured — **pixel read owed** |
| Weekday header row | **22px**, y 302..324, above the first rule | same | column lines begin at y=302 |
| Weekday label | `#252525`, **9px cap ⇒ ≈12px**, right-aligned **11px** inside the column | `#E1E1E1` | `Mo` ink x 821..837, line at 848 |
| Week start | **Monday** (`Mo Tu We Th Fr Sa Su`) | same | all 20 captures |
| Weekend column tint | `#F7F7F7` (1.07:1) | `#1E1E1E` (1.08:1) | Sa and Su columns, x 1701..2128 |
| Day number | `#252525`, **12px cap ⇒ ≈16px**, weight 400 | `#E1E1E1` | ink 337..348 in a cell topped at 325 |
| Day number placement | **top-right**: 12px below the cell top, ink 5px inside the right rule | same | single- and two-digit alike (`1`, `7`, `25`, `31`) |
| Outside-month day number | `#BFBFBF`–`#C8C8C8` (**1.67–1.84:1**) | `#525252`–`#5C5C5C` (**2.29–2.68:1**) | leading Apr 28 and trailing Jul 1 |
| Outside-month cell background | **unchanged `#FFFFFF`** | **unchanged `#171717`** | Apr 28 cell census, 7220 px of `#FFFFFF` |
| Outside-month events | **full strength, not dimmed** | same | `Zephyr Cloud` on Apr 28, text `#282828` |
| Today cell background | **`#FFFFFF` — drops the weekend tint** | **`#171717`** | Sat 5 Sep vs the 4 Saturdays below it |
| Today marker | **26 × 24px fully-rounded `#3C7FFB` disc, white numeral** | identical `#3C7FFB` | pure-fill span 1885..1910 × 331..354 |
| Today disc placement | right edge **5px** inside the right rule, top **7px** below the cell top | same | centre (1897.5, 342.5) in a cell at 1701..1915 / 324..461 |
| Event chip background | **none — the cell surface shows through** | **none** | chip band census: 4201/5040 px are the cell background |
| Event chip pitch | **20px** | same | 3-chip cell: ink at 630, 650, 670 |
| First chip offset | **32px below the cell top** | same | rows 1, 2, 3 and the 3-chip cell all agree |
| Chip ink height | **14px** (icon and text share the band) | same | 357..370 |
| Chip leading icon | **≈14 × 12px ink**, `#E3E3E3` (1.28:1) | `#303030` (1.36:1) | x 646..657; toggled by `Show icon` |
| Chip icon inset | **10px** from the cell's left rule | same | icon left 646, rule 636 |
| Icon-to-text gap | **≈8px** | same | icon ends 657, text starts 665 |
| Chip label | `#292929` (14.55:1), **9px cap ⇒ ≈12px** | `#DDDDDD` (13.20:1) | `Design token migration` |
| Overflow `+N` | **not captured** — max 3 chips observed in a cell that fits 5 | — | **pixel read owed** |
| Unscheduled / backlog area | **absent** | **absent** | §3 |
| Scale switch (month/week/day) | **absent** | **absent** | §3 |
| Month title | `#252525`, **12px cap ⇒ ≈16px**, at x 682 | `#E1E1E1` | `June` 682..718 |
| Year, a second control | 12px gap after the month, `2026` at 730..768 | same | two controls, not one string |
| `‹` `Today` `›` cluster | `‹` at 2005, `Today` `#252525` 10px cap ⇒ **≈14px** at 2027..2066, `›` at 2082 | `Today` `#DFDFDF` | identical x in all 20 captures |
| Chevron glyphs | `#9B9B9B` (**2.78:1**) | `#A09F93` (6.72:1) | 6 × 11px ink |
| Header vertical rhythm | tab row ink ends 242 → title ink 269 (**27px**) → title ends 282 → weekday row 302 (**20px**) | same | — |

### 2d. The five distinct calendar menus, measured

All five sit on a `#FFFFFF` / `#171717` surface with a 12px shadow bleed, and every clip in this set
is `boundingBox + 12px` — so panel size is `clip − 24`.

| Menu | Panel | Rows | Notes | File |
|---|---|---|---|---|
| Day / item menu | **224 × 72px** | 2 × 28px, 8px panel padding | `Open as Object`, `New Object`; hover row fill `#F2F2F2` | `anytype-menu-calendar-day-menu-light.png` |
| Month select | **224 × 352px** | 12 × 28px, 8px panel padding | row fill inset **8px** each side (x 8..215), label at **16px**, checkmark right | `anytype-menu-calendar-month-select-light.png` |
| Year select | **225 × 368px** | 28px, scrollable with a visible thumb | `2026` checked; the year *range* is not observable | `anytype-menu-calendar-year-select-light.png` |
| Layout panel | **358 × 298px** | header ink 13..26; tiles 38..125 and 134..221 | **104 × 88px tiles, 8px gutter, 3 across a 328px content box, 16px panel padding** — identical to `051` §2a | `anytype-menu-set-layout-calendar-light.png` |
| Date-property list | **224px wide**, 28px rows | 9 properties + `#EBEBEB` divider + `+ Add Property` | selected row fill `#F2F2F2` at x 20..227 | `anytype-menu-set-layout-calendar-date-property-light.png` |

The layout panel's selected `Calendar` tile carries a **`#3C7FFB` 1px border and a `#3C7FFB`
label**; the other five tiles carry no border. Below the tiles sit exactly two settings:
`Date Property ›` with its current value right-aligned, and `Show icon` with a **26 × 16px
`#6E9EFC` toggle** (2.64:1 against white).
<!-- /ANCHOR:method -->

---

<!-- ANCHOR:absences -->
## 3. THE TWO ABSENCES, ESTABLISHED ACROSS ALL TWENTY

`050` generalised a single panel five times and was corrected five times. Neither absence below is
asserted from one screen.

**A4 — no unscheduled or backlog region.** The grid's bottom rule is at y = 1005. The content pane
runs to y ≈ 1208. Across **all 10 light and all 10 dark** set captures, the count of pixels between
y 1010 and 1210 (x 625..2140) that differ from the page surface is **0**. The same is true of both
`-full` menu captures. There is no drawer, no collapsed strip, no header for one, and no toggle
that could open one. `047` §5 names none and `050`'s true-up names none; the captures now agree.

**A6 — no month/week/day scale switch.** Across the same twenty, the count of pixels in the header
band between the month title and the `‹ Today ›` cluster (y 262..296, x 800..1990) is **0**. The
only variation is `anytype-menu-calendar-day-menu-light-full.png`, whose longer `September` title
extends to x 814 — a wider word, not a control. The layout panel confirms it from the other side:
Anytype's six set layouts are Grid, Gallery, List, Kanban, Calendar and Graph, Calendar is one
layout rather than three scales, and the panel's whole settings surface is `Date Property` and
`Show icon`.

Both absences are now measurements. AC-001's condition — *established across all twenty set
captures rather than one* — is met for both.
<!-- /ANCHOR:absences -->

---

<!-- ANCHOR:migration -->
## 4. THE PER-ELEMENT MIGRATION TABLE

One block per anatomy element from `spec.md` §4. **Ours** is the shipped value with its
`file:line`. **Anytype** is the measured value with its capture. **What changes** is the ruling
under ADR-004: adopt unless a measured accessibility ground says otherwise.

### A1 — Month grid

| Sub-element | Ours | Anytype | Capture | Our file:line | What changes |
|---|---|---|---|---|---|
| Column model | `repeat(7, minmax(0,1fr))` CSS grid | 7 equal, **213.1px** at this width | `anytype-project-tracker-calendar-light.png` | `styles.css:17305` | **No change.** Both are seven equal fluid columns |
| Week start | configurable `weekStartsOn` | **Monday** in every capture | all 20 | `calendar-renderer.ts:2069` | **No change.** Ours already supports Monday; Anytype shows no control, so ours is a superset |
| Week row height | `min-height: 112px` | **136px** | rule pitch 324→461→597 | `styles.css:17305`, `:17329` | **112px → 136px** |
| Grid rules | 1px `--background-modifier-border`, right + bottom per cell, top on row 1, left on col 1 | 1px `#EBEBEB` / `#292929`, full box | column and row scans | `styles.css:17325`–`:17341` | **Adopt the colour pair.** The per-cell border construction already draws the same box; keep it |
| Grid inset | none declared; fills its flex parent | **16px each side** of the content pane | grid x 636..2128 in a pane 620..2144 | `styles.css:16210` | **Add a 16px horizontal inset** |
| Weekday header | `.db-calendar-weekdays`, `margin-bottom: -7pt` | a **22px** band above the first rule | y 302..324 | `styles.css:16734` | **Replace `-7pt` with an explicit 22px band.** `-7pt` is off every scale in the project and is a negative margin standing in for a height |
| Weekday label align | `text-align: left`, `padding: 4px` | **right-aligned, 11px inside the column** | `Mo` ink ends 837, rule 848 | `styles.css:16741` | **left → right, 11px inset** |
| Weekday label type | 13px / 500 / `--text-normal` | **≈12px** (9px cap) / `#252525` | `M` of `Mo` | `styles.css:16741` | **13px → 12px.** Weight not derivable from a static capture — **pixel read owed**; keep 500 |
| Weekday weekend cell | `--db-calendar-weekend-header-bg` + `--text-muted` | the header band carries **no** weekend tint; only the grid columns do | y 302..324 across Sa/Su | `styles.css:17945` | **Drop the weekend tint and the muted colour from the header row.** The tint belongs to the column body only |
| Six-week months | rows grow; `min-height` floors each | **not captured** | — | `styles.css:17310` | **Pixel read owed.** Keep our growth behaviour; do not infer a fixed 5-row grid from three 5-row months |

### A2 — Day cells

| Sub-element | Ours | Anytype | Capture | Our file:line | What changes |
|---|---|---|---|---|---|
| Cell height | `min-height: 112px` | **136px** | week rule pitch | `styles.css:17329` | **112 → 136px** |
| Day-number placement | `justify-content: space-between`, number **first** ⇒ top-left | **top-right** | ink 5px inside the right rule | `styles.css:16857`, `calendar-renderer.ts:2082` | **left → right.** The `+` add button, currently the right-hand slot, moves to the left |
| Day-number offset | `padding: 4px 6px 2px` on the heading | **12px** below the cell top, ink **5px** inside the right rule | rows 337..348, cell top 325 | `styles.css:16857` | **Adopt 12px top / ~6px right** |
| Day-number type | 13px / 400 / `--text-normal` | **≈16px** (12px cap) / 400 / `#252525` | `1`, `25`, `31` | `styles.css:16868` | **13px → 16px** |
| Outside-month number | `--text-faint` | `#BFBFBF`–`#C8C8C8` light, `#525252`–`#5C5C5C` dark | Apr 28, Jul 1 | `styles.css:16874` | **Refused on contrast** — §6 R1 |
| Outside-month cell fill | `background: var(--background-secondary)` | **no fill; identical to an in-month cell** | Apr 28 census: 7220 px `#FFFFFF` | `styles.css:16878` | **Remove the fill.** Only the number dims |
| Outside-month + weekend | a 78% mix of secondary and weekend | **plain weekend tint**, no second mix | Sa/Su in the trailing week | `styles.css:17957` | **Delete the mix rule** |
| Weekend cell fill | `--db-calendar-weekend-bg` = `--background-modifier-hover` | `#F7F7F7` / `#1E1E1E` | Sa+Su columns, all 20 | `styles.css:17951` | **Adopt the measured pair.** Reusing the hover token means a weekend cell and a hovered cell are the same colour — a real defect the capture exposes |
| Today cell fill | `--background-primary`, weekend excluded via `:not(.is-today)` | **plain surface, weekend tint dropped** | Sat 5 Sep `#FFFFFF` vs `#F7F7F7` | `styles.css:16882`, `:17951` | **No change.** The only element already correct |
| Cell hover | `.db-calendar-day:hover .db-calendar-events { overflow: visible }` | **not captured** | — | `styles.css:16930` | **Pixel read owed.** Keep ours |
| Self-loading per cell | not implemented | `047` §5 records it, source-derived | — | — | Out of this document's scope: behaviour, not presentation |

### A3 — Event chips

The largest delta in the packet.

| Sub-element | Ours | Anytype | Capture | Our file:line | What changes |
|---|---|---|---|---|---|
| Background | `background-color: var(--background-primary)` + a 7% accent gradient | **none** — the cell surface shows through | chip band: 4201/5040 px are the cell background | `styles.css:17362`–`:17363` | **Remove both layers** |
| Left accent bar | `border-left: 3px solid var(--db-calendar-event-accent)` | **none** | chip ink starts at the icon, x 646 | `styles.css:17358` | **Remove** |
| Radius | `var(--db-radius-md)` = 6px | **none** — no box to round | — | `styles.css:17359` | **Remove** |
| Height / pitch | `height: 20px` + `row-gap: 2px` ⇒ **22px pitch** | **20px pitch**, 14px ink band | 3-chip cell at 630, 650, 670 | `styles.css:17354`, `:17309` | **22 → 20px pitch** |
| First chip offset | heading padding + `.db-calendar-events` `padding: 4px 6px 6px` | **32px** below the cell top | four independent cells agree | `styles.css:16921` | **Adopt 32px** |
| Horizontal inset | `margin: 0 2px` + `padding: 0 6px` ⇒ 8px | **10px** to the icon's ink | icon left 646, rule 636 | `styles.css:17355`–`:17356` | **Adopt 10px** |
| Leading icon | `renderRecordIcon(..., true)` | **≈14 × 12px**, `#E3E3E3` / `#303030`, gated by `Show icon` | `anytype-menu-set-layout-calendar-light.png` | `calendar-renderer.ts:405` | **Adopt the icon and add the `Show icon` toggle.** Contrast declined — §6 R3 |
| Icon-to-label gap | `gap: 4px` | **≈8px** | icon ends 657, text starts 665 | `styles.css:17353` | **4 → 8px** |
| Label type | 12px, `line-height: 20px`, `--text-normal` | **≈12px** (9px cap), `#292929` / `#DDDDDD` | `Design token migration` | `styles.css:17365`–`:17366` | **Size confirmed; adopt the colour pair** |
| Truncation | `text-overflow: ellipsis`, `flex: 1 0 min(8ch,100%)` | **not captured** — no chip truncates in 20 captures | — | `styles.css:17514` | **Pixel read owed.** Keep ours |
| Colour source | per-event accent via `applyEventColor` | **no per-event colour anywhere in 20 captures** | every chip is one grey pair | `calendar-renderer.ts:404` | **Chip colour carries nothing in Anytype.** Under ADR-004 the accent goes with the background it painted; keep the API, drop the visual |
| Timed dot / time text | `.db-calendar-month-timed-dot`, `.db-calendar-month-time` | **absent** — no timed presentation in the calendar layout | — | `calendar-renderer.ts:400`–`:402` | **Not captured.** Retain: Anytype's calendar reads a single date property, ours reads timed events. Labelled a retained extension, not a parity gap |
| Multi-day span | grid-column span, continuation fades, `continues-after` padding | **not captured** — no multi-day event in 20 captures | — | `styles.css:17383`–`:17432` | **Pixel read owed.** Keep ours |
| Hover | `box-shadow: var(--db-elevation-1)`, `translateY(-1px)` | **not captured** | — | `styles.css:17437` | **Pixel read owed.** With no chip box left to lift, the lift has nothing to act on; re-derive against the new flat chip when hover is captured or specified |
| Completed | `opacity: .82`, line-through in `--db-calendar-done-accent` | **not captured** | — | `styles.css:17973` | **Pixel read owed.** Keep ours |

### A4 — Unscheduled area

| Sub-element | Ours | Anytype | Capture | Our file:line | What changes |
|---|---|---|---|---|---|
| The drawer | a bordered, collapsible panel: `-backlog`, `-header`, `-toggle`, `-list`, `-item`, `-empty` | **absent**, established across all 20 | §3 | `styles.css:17981`–`:18070`, `calendar-renderer.ts:160`–`:185` | **Kept as ours, with the argument below.** REQ-006 is satisfied by disposition, not by deletion |

**The argument for keeping it.** Anytype has nowhere for an undated object to go because a set's
calendar layout simply omits objects without a value in the date property; the object is still
reachable in the Grid, List or Gallery layout of the same set. Our calendar is a *view of a folder
of notes*, and a note whose date frontmatter is missing or unparseable has no other surface in this
plugin that surfaces it as "needs a date". Deleting the drawer to match a product whose data model
routes those objects elsewhere would remove the only place they appear. It stays, and it is
**restyled to the month grid's measured values** — the same `#EBEBEB` rule, the same 28px row
pitch as Anytype's own menu rows, and chips with no fill — so it reads as part of the same surface
rather than as a leftover.

### A5 — Navigation

| Sub-element | Ours | Anytype | Capture | Our file:line | What changes |
|---|---|---|---|---|---|
| Title composition | one string split into `-title-main` + `-title-year`, static text | **two controls**: a month select and a year select, 12px apart | `June` 682..718, `2026` 730..768 | `calendar-renderer.ts:2386`–`:2390` | **Make both selects.** Month opens a 12-row list, year a scrollable list; both checkmark the current value |
| Month title type | 22px / 700, `--db-title-font-family`, `letter-spacing: .01em` | **≈16px** (12px cap), `#252525` | `June`, `2026` | `styles.css:16548` | **22px → 16px, and drop the letter-spacing.** Ours is 6 steps up the type scale from the captured value |
| Year type | 13px / 500 / `--text-muted`, `letter-spacing: .04em` | **≈16px**, `#252525` — same size and colour as the month | `2026` cap 12px, core `#252525` | `styles.css:16558` | **Match the month exactly.** Anytype does not de-emphasise the year |
| Control order | scale control, `‹`, `Today`, `›`, mini-calendar, invalid toggle | **`‹` `Today` `›`, nothing else** | x 2005 / 2027..2066 / 2082 | `calendar-renderer.ts:2300`–`:2305` | **Adopt the three-control cluster.** The mini-calendar and invalid-events buttons are ours; see below |
| `Today` type | 13px, `--text-muted` | **≈14px** (10px cap), `#252525` / `#DFDFDF` | `T` of `Today` | `styles.css:16575` | **13px → 14px, muted → normal** |
| Nav button box | `height: 20px`, `min-width: 20px`, `is-text` `min-width: 52px`, radius 6px | box not observable; the **glyph** is 6 × 11px and gaps are 18px / 16px | ink extents | `styles.css:16575`–`:16593` | **Pixel read owed** for the box. Adopt the measured gaps |
| Chevron colour | `--text-muted` | `#9B9B9B` (**2.78:1**) / `#A09F93` (6.72:1) | 6 × 11px ink | `styles.css:16575` | **Refused on contrast** — §6 R2 |
| Nav icon size | 16 × 16 | glyph 6 × 11 in an unobservable box | — | `styles.css:16606` | **No change.** A 16px box holding a 6 × 11 chevron glyph is consistent with the capture |
| Header padding | `padding: 25px 0 12px`, `align-items: flex-end` | tab row → title **27px**, title → weekday row **20px** | header band scan | `styles.css:16218` | **Adopt 27px above / 20px below.** `25px` is off the spacing scale; 24 or 32 would be on it, and 27 is what the capture shows |
| Mini-calendar button | ours, `renderMiniCalendarButton` | **absent** | header cluster is 3 controls | `calendar-renderer.ts:2306` | **Kept as ours.** It is the jump-to-date affordance the month/year selects give Anytype for free; once both selects land it is redundant and should be reconsidered in a later leg, named here rather than silently deleted |
| Invalid-events toggle | ours, warning-coloured | **absent** | — | `calendar-renderer.ts:2307` | **Kept as ours.** It reports unparseable frontmatter dates, a failure mode Anytype's typed date property cannot have |
| Today scroll | not implemented | `047` §5, source-derived; **not observable** in a static capture | — | — | **Design inferred from `047` §5, not from a capture.** Implement per `047`; do not claim a measurement |

### A6 — Day/week/month switch

| Sub-element | Ours | Anytype | Capture | Our file:line | What changes |
|---|---|---|---|---|---|
| The switch | `db-calendar-scale-{control,segment,button,menu,menu-label,menu-chevron,popover}`, 22px segment / 18px buttons / 11px labels | **absent**, established across all 20 | §3 | `styles.css:16645`–`:16716`, `calendar-renderer.ts:2257` | **Kept — ADR-002 Accepted, "keep week and day, styled to the month grid".** §7 |
| Week / day bodies | `db-calendar-week-*`, 22 classes: all-day rows, hour gutters, time columns, timed events, a current-time line | **no counterpart of any kind** | — | `styles.css:17119`, `:17129`, `:17257` | **Kept and restyled to §2c's measured values** — same rules, same tints, same chip grammar, same header. Labelled *ours, restyled to the month grid's measured values*, never *inferred from Anytype* |

### A7 — Today marker

| Sub-element | Ours | Anytype | Capture | Our file:line | What changes |
|---|---|---|---|---|---|
| Shape | 20 × 20px circle, `border-radius: 50%` | **26 × 24px**, fully rounded | pure-fill span 1885..1910 × 331..354 | `styles.css:16886` | **20 × 20 → 26 × 24** |
| Fill | `var(--db-current-time-color)`, an HSL accent | **`#3C7FFB`, identical in both themes** | day-menu `-full`, both themes | `styles.css:16893` | **Adopt, darkened** — §6 R4 |
| Numeral | 11px / 600 / `--text-on-accent` | white, same **≈16px** as an ordinary day number | glyph inside the disc | `styles.css:16894`–`:16895` | **11px/600 → 16px/400 white.** Ours shrinks and bolds the numeral on the one day it most wants to stay legible |
| Placement | inline in the heading flex row | right edge **5px** inside the right rule, top **7px** below the cell top | centre (1897.5, 342.5) | `styles.css:16886` | **Adopt** |
| Cell background | `--background-primary`, beats the weekend tint | **plain surface, weekend tint dropped** | Sat 5 Sep | `styles.css:16882` | **No change** |
| Two-digit today | not exercised | **not captured** — only a single-digit today exists in the set | — | — | **Pixel read owed.** Whether the disc grows or the numeral tightens is unobservable |

### A8 — Date-property picker

| Sub-element | Ours | Anytype | Capture | Our file:line | What changes |
|---|---|---|---|---|---|
| The control | none in the calendar; the date field is chosen in the view config | a **`Date Property ›` row** in the layout panel, value right-aligned | `anytype-menu-set-layout-calendar-light.png` | — | **Add the row to the calendar's own settings surface** |
| The submenu | none | **224px wide, 28px rows**, 9 date properties each with a leading icon, current one checkmarked | `anytype-menu-set-layout-calendar-date-property-light.png` | — | **Adopt** |
| Divider + Add | none | `#EBEBEB` divider, then `+ Add Property` | y 372 in the clip | — | **Adopt the divider; `+ Add Property` has no counterpart here** — frontmatter keys are not a property registry. Declined on product grounds, recorded not silent |
| Selected row | none | fill `#F2F2F2`, x 20..227 (8px inset), 28px | same | — | **Adopt** |
| `Show icon` toggle | no equivalent; the record icon always renders | **26 × 16px `#6E9EFC` toggle**, default on | layout panel | `calendar-renderer.ts:405` | **Add the toggle.** Track colour refused — §6 R5 |
| Layout tiles | our view switcher lives in the toolbar (`053`'s) | **104 × 88px, 8px gutter, 3 across a 328px box**, selected tile `#3C7FFB` border + label | layout panel | — | **Out of scope: `053` owns the view switcher.** Recorded so the boundary is named, per `spec.md` §Phase Context |

### A9 — Day menu

| Sub-element | Ours | Anytype | Capture | Our file:line | What changes |
|---|---|---|---|---|---|
| Trigger | day double-click → `createEntryForDate`; a `+` add button on hover | click a day → menu | `anytype-menu-calendar-day-menu-light.png` | `calendar-renderer.ts:2096`, `:2085` | **Replace the double-click with a menu** |
| Panel | none — no menu exists | **224 × 72px**, 2 rows × 28px, 8px panel padding | same | — | **Adopt** |
| Items | — | `Open as Object`, `New Object` | same | — | **Adopt, renamed to this plugin's vocabulary**: open the note, create a note on that date |
| Row hover | — | `#F2F2F2` fill | `Open as Object` row | — | **Adopt** |
| Item (chip) menu | none | **the same file** — see §5 C2 | — | — | **One menu serves both.** Do not build two from a capture that is one |
| `+` add button | 18 × 18, `opacity: 0` until hover; 28px floor and `opacity: 1` on coarse pointers | **absent** — no per-cell add affordance | all 20 | `styles.css:16900`, `:20934` | **Kept as ours.** It is the keyboard- and touch-reachable path to the same action the menu gives; removing it on parity grounds would cost an affordance the captures replace with a pointer gesture |
<!-- /ANCHOR:migration -->

---

<!-- ANCHOR:contradictions -->
## 5. WHERE THE CAPTURE CONTRADICTS THE PACKET

Six. In each the capture wins, and the packet row is corrected rather than carried forward.

**C1 — The dispatch brief says the captures are 2× and to divide. They are 1:1.** Evidence in §2a:
1-device-pixel grid rules, an odd 1217px height, and `051`'s independent agreement on the same
window. Dividing would have produced a 68px day cell, a 10px chip pitch and 6px body text. **No
value in this document is divided.** This is the one contradiction that would have invalidated
every other row.

**C2 — `spec.md` §4 and `tasks.md` T001 say six calendar menus. There are five.** The day-menu and
item-menu captures are byte-identical:
`anytype-menu-calendar-day-menu-light-full.png` and `-item-menu-light-full.png` share MD5
`28d38b3a11620d04ef06e7e86c65b5c5`; the dark pair shares `6e9f31e1629cbffad9a1183148a8f963`; the
clipped light pair shares `9c74340bc6bdd972363f80706305a4b5`. The 24-file count is right and the
6-menu count is not: it is **5 distinct surfaces in 24 files**. A4 of the spec's inventory note
already flagged that the opening brief said four and the folder held six; the true figure is five.
**Consequence:** A9 must not be built as two menus.

**C3 — `spec.md` A5 says the month and year selects span years 0–3000. That is not observable.**
The claim is `047`-sourced and source-derived. What the captures show is a 12-row month list and a
year list with a scrollbar thumb roughly a third of the track — consistent with a long range,
consistent with dozens of other ranges. **The range stays labelled `047`-sourced, never measured.**

**C4 — `spec.md` A3 says the chip's colour source is to be determined. There is no chip colour.**
Twenty captures, ten use cases, and every chip in all of them is the same grey pair on no
background. Anytype's calendar chip carries no per-event colour at all. Ours carries a 3px accent
bar and a 7% tint driven by `applyEventColor` (`calendar-renderer.ts:404`). Under ADR-004 the
visual goes; the API stays for the week and day scales ADR-002 kept.

**C5 — `spec.md` A2 asks what the overflow affordance is. No capture shows one.** The busiest cell
in the set holds three chips (`anytype-crm-contacts-deals-calendar-light.png`, 15 May) in a cell
that fits five at a 20px pitch starting 32px down a 136px row. Anytype's overflow behaviour is
**not captured and cannot be inferred from an absence** — an absence of overflow is not evidence of
an overflow style. Our `+N` row (`styles.css:16935`) is retained unchanged and marked **pixel read
owed**, not adopted and not refused.

**C6 — `checklist.md` C6 says our unscheduled drawer is "unmatched".** It is not merely unmatched,
it is **unmatchable**: §3 establishes there is no counterpart to match to. The row's `Today` cell is
accurate; its framing implies a comparison that cannot be made. A6 of `acceptance-criteria.md`
already permits "kept as ours with a written argument", which is the disposition A4 takes.
<!-- /ANCHOR:contradictions -->

---

<!-- ANCHOR:refusals -->
## 6. THE ACCESSIBILITY REFUSALS, WITH THEIR MEASUREMENTS

ADR-004 permits declining a captured value only on WCAG 1.4.3, WCAG 1.4.11 or the 44px touch floor,
each with a measured number. Five values are declined. Two further low-contrast values are
**adopted** because the criterion does not bite, and they are recorded here so a later reader does
not re-open them.

**R1 — The outside-month day number, at 1.67:1 light and 2.29:1 dark. DECLINED.**
Measured `#C8C8C8` on `#FFFFFF` (1.67:1) and `#BFBFBF` (1.84:1) at the leading edge; `#525252` on
`#171717` (2.29:1) and `#5C5C5C` (2.68:1). WCAG 1.4.3 wants **4.5:1** for a 16px numeral, and this
numeral is informational text, not a disabled control — it names which date the cell holds, and a
user who cannot read it cannot tell 1 July from 1 June. **Adopt the treatment, not the value**: keep
the number dimmed relative to an in-month number and float it to the lightest grey that clears
4.5:1 — **`#767676`** on `#FFFFFF` and **`#808080`** on `#171717` (4.54:1). The hierarchy Anytype
draws survives; the illegibility does not.

**R2 — The prev/next chevrons, at 2.78:1 in light. DECLINED for light only.**
`#9B9B9B` on `#FFFFFF` = **2.78:1**. These are icon-only controls with no text label, so the glyph
is the only thing identifying them and WCAG 1.4.11 wants **3:1**. It misses by 0.22. The dark pair
measures `#A09F93` on `#171717` = 6.72:1 and is **adopted unchanged**. Light takes the nearest grey
that clears the bar: **`#949494`** (3.03:1). This is a 7-value move and no reader will see it as a
different design.

**R3 — The chip leading icon, at 1.28:1 light and 1.36:1 dark. ADOPTED, and here is why it is not a
refusal.** `#E3E3E3` on `#FFFFFF` and `#303030` on `#171717` are far under 3:1. WCAG 1.4.11 applies
to a non-text element that is *the only* thing identifying a control or conveying information. This
icon sits 8px left of a full text label at 14.55:1 and identifies nothing the label does not; it is
decorative redundancy, and 1.4.11 exempts it. It is adopted at the measured value. If a later leg
ever renders the chip icon-only, this exemption lapses and the icon needs 3:1.

**R4 — The today marker's white numeral on `#3C7FFB`, at 3.74:1. DECLINED.**
White on `#3C7FFB` = **3.74:1**. The numeral is ≈16px regular, so WCAG 1.4.3's large-text allowance
(24px regular / 18.66px bold) does not reach it and the bar is **4.5:1**. Two escape hatches were
computed; the second is taken.

- *Dark text on the same fill*: black on `#3C7FFB` is 5.62:1 and passes, but it inverts the marker's
  read from "filled accent" to "outlined" and breaks the pairing with the toggle and the selected
  layout tile, which use the same blue.
- *Darken the fill, same hue and saturation*: `hsl(219 96% 55.6%)` = **`#216DFA`** gives white
  **4.53:1** and still reads as the same blue. It measures 4.53:1 against the light surface and
  3.95:1 against the dark one, so the disc itself clears 1.4.11's 3:1 in both themes. **Adopted.**

Note what is *not* a refusal here: the marker carries a **shape** change (a filled disc) as well as
a colour change, so today is not signalled by colour alone and `sk-design`'s second-signal rule is
satisfied by the capture as it stands.

**R5 — The `Show icon` toggle track, at 2.64:1. DECLINED.**
`#6E9EFC` on `#FFFFFF` = **2.64:1**. A toggle's on-state track is the only thing distinguishing on
from off, which is WCAG 1.4.11's 3:1 case. It measures 6.79:1 against `#171717` and is **adopted
unchanged in dark**. Light takes the lightest same-hue blue that clears 3:1: **`#5A92FC`**
(3.02:1).

**R6 — The weekend column tint, at 1.07:1 light and 1.08:1 dark. ADOPTED.**
`#F7F7F7` on `#FFFFFF` and `#1E1E1E` on `#171717` are barely-there tints, and that is correct: they
carry no information the `Sa` / `Su` header labels do not already carry in text. A background tint
that is redundant to a text label has no contrast requirement. Adopted at the measured values — and
adopting them fixes a real defect, because ours currently paints the weekend with
`--background-modifier-hover` (`styles.css:17939`), making a weekend cell indistinguishable from a
hovered one.

**R7 — The nav button box, at 20px. DECLINED on the touch floor, on phone only.**
`.db-calendar-nav-button` is `height: 20px; min-width: 20px` (`styles.css:16575`), which is under
the 44px floor `044` sets and under the 28px coarse-pointer floor this stylesheet already applies
at `styles.css:20925`–`:20930`. Anytype's box is not observable — only its 6 × 11px glyph is — so
this is not a captured value being declined; it is **ours failing a floor the capture cannot
excuse**. The coarse-pointer rule already lifts it to 28px; `044`'s 44px is the governing figure for
the phone and the gap between 28 and 44 is named here rather than left for a later leg to find.
<!-- /ANCHOR:refusals -->

---

<!-- ANCHOR:adr002 -->
## 7. ADR-002, AS RULED

**Operator, 2026-09-05 ~23:20: *"Keep week and day, styled to the month grid."*** ADR-002 moves from
Proposed to **Accepted** on that wording. `decision-record.md` carries it; this section carries what
it does to the rows above.

**What the ruling settles.** The **month view becomes Anytype 1:1** — every §4 row marked *adopt*
applies to it without qualification. The **week and day scales survive as our extension**, and they
take the month grid's measured vocabulary: the same `#EBEBEB` / `#292929` 1px rules, the same
`#F7F7F7` / `#1E1E1E` weekend tint, the same `#216DFA` today marker, the same flat 20px-pitch chip
with a 10px inset and an 8px icon gap, and the same three-control `‹ Today ›` header beside the
month and year selects.

**How those rows must be labelled.** Not *inferred from Anytype* — there is nothing in twenty
captures to infer a week or day scale from, and calling it an inference would be the same
fabrication `spec.md` §"The phone gap" exists to prevent. Every week and day value is
**"ours, restyled to the month grid's measured values"**, and names the §2c row it took its value
from. That phrasing is the week/day analogue of AC-007's phone label, and it is exact for the same
reason: it says where the number came from and does not claim a source that does not exist.

**What each branch would have cost, recorded because the ADR asked for both.**

- *Remove* would have deleted seven scale-switch classes, twenty-two `db-calendar-week-*` classes, a
  full timed-event body with hour gutters and a current-time line, a day view, and
  `calendar-keyboard-navigation.test.ts`'s coverage of all of it — roughly a third of the 91-class
  vocabulary. It buys closer parity and costs shipped, tested, operator-visible function.
- *Keep*, the ruling, leaves a visible deviation from *"1:1 Anytype"*. ADR-004 does not authorise it,
  because it is not an accessibility ground; **ADR-002 itself is the authorisation**, which is
  precisely why the question needed an accepted ADR rather than a footnote.

**One consequence worth stating.** With the scales kept, the scale control stays in the header — so
our header carries four controls where Anytype's carries three. That is a deviation this ruling
creates, it is inside the ruling's scope, and it is recorded here rather than presented as a
measured value.
<!-- /ANCHOR:adr002 -->

---

<!-- ANCHOR:phone -->
## 8. THE PHONE, WHICH HAS NO REFERENCE

`spec.md` states the gap and this document confirms it from the same folder: `screenshots/anytype/mobile/`
holds no calendar capture, the iOS view-layout sheets are picker, gallery and kanban, and none of
the 104 `mobile/sheets/` captures is a calendar surface. **iOS Anytype ships no calendar layout, so
there is no phone reference and there will not be one.**

Every phone-calendar value this packet writes therefore carries **"design inferred from desktop"**
and names the §2c row it came from. That label is AC-007's subject and is counted, not decorative.

**Two constraints outrank the desktop inference on the phone**, and neither is negotiable by a
capture:

- **`044`'s seven-element sheet grammar and 44px touch floor.** A desktop chip is a 20px-pitch row
  with no box; a phone row that inherits that pitch is a 20px touch target and fails. The phone chip
  keeps the desktop's *appearance* — no fill, no bar, no radius, the same 12px label and 8px icon
  gap — and takes its *height* from the 44px floor, which is a deviation from the measured value
  with a number behind it, exactly as §6 R7 records for the nav buttons.
- **`048`'s stacking model.** The day menu (A9) is a sheet on the phone, and it registers as one:
  `tools/live/sheet-grammar.mjs` must still report 12 surfaces and 31 pairs at exit 0 after the leg
  that adds it (AC-008). Adding a twelfth surface is not this document's call to make silently — if
  the day menu registers as a new surface, the registered counts change and AC-008's threshold
  changes with them. **Named here as an open row for the implementation leg**, not resolved.

The mobile chip today is `height: 18px; padding: 0 4px; font-size: 11px` (`styles.css:17926`) and
the coarse-pointer floor is 28px (`styles.css:20925`). Both are below 44 and both are the phone
leg's to fix.
<!-- /ANCHOR:phone -->

---

<!-- ANCHOR:changes -->
## 9. WHAT THIS CHANGES IN THE PACKET

| Document | Row | Change |
|---|---|---|
| `spec.md` §4 | A4 | *"Owed to T001, and possibly absent"* → **absent, established across all twenty** |
| `spec.md` §4 | A6 | *"T001 confirms the absence"* → **absence confirmed**; and the scale switch is kept per ADR-002 |
| `spec.md` §4 | Capture inventory | *"6 menus"* → **5 distinct menus in 24 files**; the day and item menus are one capture |
| `spec.md` §4 | A5 | the years 0–3000 range is `047`-sourced and **not observable**; the month/year selects are two controls |
| `spec.md` §4 | A3 | colour source resolved: **Anytype's chip carries no colour** |
| `spec.md` §12 | open questions | the unscheduled-drawer question is answered (absent, ours kept); the scale question is answered by ADR-002 |
| `decision-record.md` | ADR-002 | Proposed → **Accepted**, *"keep week and day, styled to the month grid"* |
| `acceptance-criteria.md` | AC-001 | **Met** — nine elements, each with a capture filename and a measurement or a labelled gap; both absences established across twenty |
| `acceptance-criteria.md` | AC-005 | **Met** — ADR-002 is Accepted |
| `acceptance-criteria.md` | AC-006 | **Met** — dispositioned as ours, with the §A4 argument, after all twenty were read |
| `acceptance-criteria.md` | AC-002/003/004 | still **Unmet** — they assert the retargeted render, which is T005–T007's |
| `checklist.md` | C1 | 0 of 9 → **9 of 9** |
| `checklist.md` | C4 | *unread* → **read and measured** (`358 × 298` panel, `224px` submenu, 28px rows) |
| `checklist.md` | C5 | operator ruling recorded |
| `checklist.md` | C6 | dispositioned |
| `tasks.md` | T001 | **[x]** — every row covered |
| `tasks.md` | T003 | narrowed: the ruling is in, so T003 is the recording, not the asking |

**Nine of nine elements carry a value.** Twenty-eight sub-rows carry a measurement with a capture
filename; nine carry **pixel read owed** with the reason a static capture cannot answer them (hover,
focus, press, drag, overflow, truncation, multi-day spans, a two-digit today, a six-week month); two
carry a `047`-sourced label that is explicitly not a measurement. **No row is blank and no row
carries a number nobody read.**
<!-- /ANCHOR:changes -->

---

## RELATED DOCUMENTS

- **Specification**: `spec.md` — the nine anatomy elements this document fills in
- **Decision Records**: `decision-record.md` — ADR-002 as ruled, ADR-003's per-element thresholds, ADR-004's parity posture
- **Acceptance Criteria**: `acceptance-criteria.md` — AC-001, AC-005 and AC-006 close on this document
- **Verification Checklist**: `checklist.md` — C1, C4, C5 and C6
- **Predecessor reads**: `../050-anytype-adoption/design-trueup.md`, `../051-modal-and-sheet-componentization/design-trueup.md`
- **Phone constraints**: `../044-phone-sheet-alignment/`, `../048-stacked-sheets/`

---
