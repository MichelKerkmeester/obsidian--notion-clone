---
title: "UI Review: The Calendar Beside Anytype, Side by Side, 2026-09-06"
description: "A gestalt review of the 0.0.29 calendar against every Anytype calendar capture, dark and light, desktop and phone. Every visible difference is measured, given its CSS/TS cause, and given a fix, so the next rebuild leg can work from this document rather than from the closed value-level rows."
date: 2026-09-06
trigger_phrases:
  - "057 ui review"
  - "calendar looks nothing like anytype"
  - "calendar gestalt review"
  - "calendar side by side"
  - "calendar rebuild leg plan"
importance_tier: "high"
contextType: "research"
---
# UI Review: The Calendar Beside Anytype, Side by Side

> **The operator, 2026-09-06 ~10:40, on 0.0.29 desktop, verbatim:**
> *"in general our calendar looks nothing like anytype yet"*
>
> This was said after `acceptance-criteria.md` had closed eight of ten rows: 136px rows, the
> `#EBEBEB`/`#292929` rules, flat 20px chips, the today marker, the two-control title. The
> operator's judgement outranks those rows. This document explains why both are true at once,
> and names every difference a reader sees before they see a single value.

---

## 1. THE HEADLINE

**The Met rows are each true of one element on one theme, and the calendar still reads as a
different product because parity was measured per element on the harness's default theme and
never as a whole surface on the operator's.** Six things carry almost all of the visual weight,
and none of them is a value the packet had a row for:

1. **The colour system is literal Anytype hex painted onto an Obsidian theme surface.** On the
   operator's theme the page is `#262626`; our rules are `#282828`/`#292929` and vanish, and the
   weekend tint `#1E1E1E` is *darker* than the page where Anytype's is lighter. On the harness's
   default dark theme the page is `#1E1E1E`, so the weekend tint is the page and disappears. The
   rules only read correctly on `#171717`, which is Anytype's surface and nobody else's.
2. **The week starts on Sunday and the weekend tint is split to the two outer edges.** Every one
   of the twenty Anytype captures starts on Monday with `Sa Su` as one tinted block on the right.
3. **A multi-day event is drawn as a title in its first cell and a muted date string in its last,
   two thousand pixels apart, and it reserves an empty lane across every cell in between.** On the
   operator's screen five such spans push the first single-day chip in row 1 down to 80px below
   the cell top; Anytype's is at 32px in every cell.
4. **The `+N more` affordance is a filled button band the width of the cell with centred text.**
   Anytype's is one grey text line at the chip inset.
5. **The seventh column is clipped off the operator's screen.** The grid is wider than its pane.
6. **Chips carry no icon, and timed chips carry a coloured dot and a time prefix.** Every Anytype
   chip is a grey document glyph, 8px, then the title. Nothing else.

Fix those six and the calendar is Anytype-shaped. The remaining rows in §4 are refinements.

---

## 2. HOW THIS WAS MEASURED

Three sources, three scales, all read per pixel with PIL rather than by eye, following `056`'s
`design-trueup.md` §2 method (device-pixel reads, cap height at 50% coverage, glyph-core colour
samples).

| Source | File(s) | Scale | Note |
|---|---|---|---|
| Operator's screen, dark | `.operator-calendar-desktop.png` (2000 × 967, deleted after this review) | **≈0.82 CSS px per screen px** | Chip pitch reads 16.5 screen px against the landed 20px, cell rows 112 against 136, both at 0.82. Geometry below is quoted in screen px with the CSS equivalent where it matters. Colours are unaffected by scale |
| Our harness corpus | `screenshots/notion-clone/views/calendar-*.png`, `constructed-calendar-*.png` | DPR 2 (2880 × 1800 desktop, 804 × 1748 phone) | Committed at `2446a10a`; **stale on one point**: it shows three-letter weekday labels (`Sun`) where the operator's build shows two-letter (`Su`) |
| Anytype | `screenshots/anytype/desktop/sets/*/…-calendar-{light,dark}.png`, `desktop/menus/anytype-menu-calendar-*`, `official/anytype-calendar-official.jpg` | 1:1 (per `design-trueup.md` §2a) | The official docs illustration is the **only capture of Anytype's overflow affordance** (`+2 more objects`); the twenty set captures never overflow. There is no Anytype phone calendar; iOS ships none |

The operator's theme is not the harness's theme. That single fact is behind the biggest finding.

---

## 3. THE SURFACES, MEASURED, BOTH THEMES, BOTH PRODUCTS

| Surface | Ours, operator (dark) | Ours, harness dark | Ours, harness light | Anytype dark | Anytype light |
|---|---|---|---|---|---|
| Page / cell | `#262626` | `#1E1E1E` | `#FFFFFF` | `#171717` | `#FFFFFF` |
| Grid rule | `#282828` (2 screen px, blended) | `#292929` | `#EBEBEB` | `#292929` | `#EBEBEB` |
| Rule vs page | **+2 levels, invisible** | +11 | −20 | +18 | −20 |
| Weekend tint | `#1E1E1E` (**darker** than page) | `#1E1E1E` (**= page, invisible**) | `#F7F7F7` | `#1E1E1E` (lighter) | `#F7F7F7` |
| `+N more` band | `#323232` fill, `#535353` text | `#2A2A2A` fill, `#6C6F74` text | `#F2F3F5` fill, `#999DA3` text | — | text only, `#848484` (official capture) |
| Chip title | `#DDDDDD` | `#DDDDDD` | `#292929` | `#E1E1E1` | `#292929` |
| Chip icon | none rendered | none rendered | none rendered | `#303030` 12 × 14 glyph | `#E3E3E3` |
| Timed dot / time | — | `#BBF7D0` dot, `#9A9B9E` time | dot, `#6E7681` time | absent | absent |
| Date-range text | `#808080` | `#87888B` | `#848B94` | absent | absent |
| Day number | `#D0D1D0` | `#DCDDDE` | `#2E3338` | `#E1E1E1` | `#252525` |
| Outside-month number | `#787878` | `#808080` | `#767676` | `#525252` (refused, R1) | `#C8C8C8` (refused, R1) |
| Weekday label | `#CFCFCF`–`#D8D8D8` | `#DCDDDE` | `#2E3338` | `#E1E1E1` | `#252525` |
| Today disc | not in view | `#216DFA` 26 × 24 | `#216DFA` | `#3C7FFB` | `#3C7FFB` |
| Title month / year | `#E0E0E0` 700 | `#DCDDDE` 700 | `#2E3338` 700 | `#E1E1E1` ~500 | `#252525` ~500 |
| Chevrons | `#868686` | `#9A9B9E` | `#949494` | `#A09F93` | `#9B9B9B` |
| Scale switcher | `#212121` track, `#DEDEDE` selected fill | `#252525` track, `#DCDDDE` selected fill | `#F2F3F5` track, `#FFFFFF` selected fill | absent | absent |
| Week header rule | — | `#3A3A3A` | — | — | — |
| Week hour / half-hour line | — | `#282828` / `#222222` | `#EBEBEB` 90% / 40% | — | — |

**Four rule colours exist in our calendar** (`#3A3A3A`, `#292929`, `#282828`, `#222222`). Anytype
has one.

---

## 4. EVERY VISIBLE DIFFERENCE, RANKED

`Ours` is measured on the operator's screen unless marked `(harness)`. `Cause` is the file:line
that produces it. `Fix` is what the rebuild leg does.

### P0 — the calendar reads as a different product until these land

| ID | Element | Ours, measured | Anytype, measured | Cause | Fix |
|---|---|---|---|---|---|
| P0-1 | **Surface / rule / tint relationship** | Page `#262626`; rule `#282828`, 2 levels above the page, not visible at arm's length; weekend `#1E1E1E`, 8 levels *below* the page, so `Su` and the seventh column read as two dark panels on a lighter sheet. Harness dark: page `#1E1E1E` and weekend `#1E1E1E` identical, so the tint does not exist there. Light harness reads correctly only because Obsidian's light page happens to be `#FFFFFF` | Page `#171717`; rule `#292929` (+18); weekend `#1E1E1E` (+7, lighter). Light `#FFFFFF` / `#EBEBEB` / `#F7F7F7`. One flat sheet with hairlines; the weekend a whisper lighter or darker in the *same direction* as the rule | `styles.css:17709`–`17734` literal `#EBEBEB`/`#292929` borders; `:18347`–`18354` literal `--db-calendar-weekend-bg`; `:17677` `background: var(--background-primary)`; `:18400`, `:18411` literal drawer rules; `:17431`–`17446` literal slot lines | **Derive every rule and tint from the page surface instead of from Anytype's page.** Rule = surface mixed 7% toward `--text-normal` in dark, 8% in light (`color-mix(in srgb, var(--background-primary) 92%, var(--text-normal))` reproduces `#292929` on `#171717` and `#EBEBEB` on `#FFFFFF`); weekend = surface mixed 3% the same way. One `--db-calendar-rule` and one `--db-calendar-weekend` token, used by month, week, day, drawer and slot lines. Alternative if the operator prefers literal parity: paint the calendar's own surface `#171717`/`#FFFFFF` on `.db-calendar` and keep the literals; that costs a visible seam against the rest of the pane and is not recommended |
| P0-2 | **Week start and weekend placement** | `Su Mo Tu We Th Fr Sa`; weekend tint on column 1 and column 7, the two outer edges | `Mo Tu We Th Fr Sa Su` in all 20 captures; `Sa Su` one tinted block at the right | `src/views/calendar-renderer.ts:2696` `getLocaleWeekStartsOn` (en-US → Sunday); tint per `is-weekend` cell `styles.css:18360` | Default the calendar's week start to Monday regardless of locale, keep the setting as an override. The tint then falls on the right pair by itself. AC-002's *"which day starts the week stays locale-driven and is not a measured value"* is the wrong call: it is measured, twenty times |
| P0-3 | **Multi-day event** | A span is one `button` across N columns: icon-less title flush left in the first cell, then `flex: 1` pushes a muted `February 22, 2026 - March 14, 2…` string to the far right cell (operator: right-clipped in the seventh column; harness: `Figma` on Tue 3 with `Mar 3 – 5` alone in Thu 5). Nothing joins them: no fill, no bar, no rule. **And the lane is reserved across every cell it crosses**: row 1 of the operator's screen has 5 spans, so `28 — Brightwater Farms` on Tu sits 80 screen px (≈98 CSS) below the cell top and Mo/We/Th/Fr rows 1–3 are blank space | No spanning event in 20 captures or the official illustration. An object with a date appears once, as one chip, in one cell, at 32px. A cell's chips are packed from 32px with nothing above them | `calendar-renderer.ts:405`–`407` (`--db-calendar-segment-start/span/lane`), `:421`–`423` (`db-calendar-month-dates`), `:337`–`339` (lane rows shared by the whole week); `styles.css:17900` `flex: 1 0 min(8ch,100%)` on the title, `:17919`–`17931` dates span, `:17774`–`17813` continuation masks | **In the month scale, draw a spanning event as one chip per day it covers, packed per cell.** Same title and icon each day, no date string in the grid (it goes to the chip `title` tooltip and the day popover), no continuation masks, no lane reserved in cells the event does not need. Every cell's first chip then lands at 32px. Keep the week scale's all-day span as ours (ADR-002) |
| P0-4 | **`+N more`** | A filled band: operator `#323232` 288 × 26 screen px across the whole cell with `#535353` text centred; harness `#2A2A2A` / `#F2F3F5` bands 260 CSS px wide, text `#6C6F74` / `#999DA3` centred | `+2 more objects`: one line of `#848484` text, left edge at the chip icon's 10px inset, no fill, no border, 12px (official capture; the twenty set captures never overflow, `design-trueup.md` C5) | `styles.css:17226`–`17231` never resets Obsidian's `button` (`background: var(--interactive-normal)`, box-shadow, padding, centred text); `:17933`–`17937` adds `align-self: end` and padding but no reset | `background: none; border: 0; box-shadow: none; padding: 0 0 0 10px; text-align: left; height: 20px; font-size: 12px; color: <outside-month grey>`; place it in the next lane like a chip. Wording `+N more` is fine |
| P0-5 | **Grid wider than the pane** | Column pitch 288.5 screen px; grid 12 → 2031 in a 2000px screen; `Sa` label and the seventh column's right rule and day numbers are off-screen. Rows 4–5 are 112 screen px (≈136 CSS) but rows 1–3 grew to 133 (≈162 CSS) under 6 lane rows | Seven equal fluid columns inside a 16px inset, right rule 16px inside the pane, every capture | Column pitch 288.5 / 0.82 ≈ 352 CSS px is not `1fr` of a ≈2440 CSS pane (≈345); it is consistent with `calendarColumnSizeMode: "custom"` — `calendar-renderer.ts:2349` sets `--db-calendar-col-width`, `styles.css:17047`–`17048` switches the week row to `repeat(7, var(--db-calendar-col-width))` and `:17113`–`17114` widens the header to `7 × col`. The `min-width: 0` flex parent at `:16432` then clips | **The month scale ignores custom column width**: seven `minmax(0, 1fr)` columns always, the column-size row hidden on month in the view options. If a fixed width is kept for week/day, the grid must scroll inside the pane, never clip. Verify on the operator's vault config, not only a fresh view |
| P0-6 | **Chip anatomy** | Title only: `25 — Yellowstone Outfitters` (40 chips on the operator's screen, 0 icons). Harness timed chips: 7px `#BBF7D0` dot + `09:00` in `#9A9B9E` + title; three ink colours in one 12px line | Every chip: a 12 × 14 `#303030` / `#E3E3E3` document glyph at 10px, 8px gap, title in one colour. Nothing else, ever. `Show icon` on by default | `calendar-renderer.ts:416` renders `renderRecordIcon` only when the note has an icon; `:398`–`402` the dot and time; `styles.css:17879`–`17898` | Render a default document glyph when the record has none (gated by `Show icon`), at the measured size and the measured 1.3:1 grey (R3 exempts it). Remove the dot. The time stays as ours (a retained extension, `design-trueup.md` A3) but as a muted suffix after the title, not a coloured prefix, so the line starts with icon + title in every chip |

### P1 — the calendar reads as ours once P0 lands, until these land

| ID | Element | Ours, measured | Anytype, measured | Cause | Fix |
|---|---|---|---|---|---|
| P1-1 | **Header control cluster** | Five controls: `Day│Week│Month` segmented pill (22px, 1px border, `#252525`/`#F2F3F5` track, selected segment filled `#DCDDDE`/`#FFFFFF`), `‹`, `Today`, `›`, mini-calendar icon. On the operator's screen the `›` is off-screen with the seventh column | Three: `‹` `Today` `›`, 18px / 16px gaps, no box, no fill | `styles.css:16916`–`16935` scale segment; `calendar-renderer.ts:2306` mini-calendar button | ADR-002 keeps the scales, not the pill. **Restyle the switcher as Anytype's own tab grammar** (plain 14px words, current `--text-normal`, others `#9B9B9B`/`#A09F93`, no track, no border), placed left of the nav cluster. **Remove the mini-calendar button**: `design-trueup.md` A5 already names it redundant once the month and year selects exist, and they exist |
| P1-2 | **Title gap and weight** | `March` → `2026` gap 34 CSS px (harness ink 199 → 267 device); weight 700; the two selects show a hover fill | 12px gap; ~500 weight; `June  2026` reads as one phrase | `styles.css:16753` `gap: 8px` plus the select's own padding; `:16787`–`16797` weight 700 | Gap 12px between ink edges, weight 500, hover fill only on the word itself |
| P1-3 | **Week scale rules** | Slot lines span 278 → 1205 CSS px (device 556 → 2411) against day columns at 105 → 1392: **they start one column in and stop one column short.** No vertical rule between day columns. Header rule `#3A3A3A`, hour `#282828`, half-hour `#222222`: three rule colours in one view | (no week scale) ADR-002: *styled to the month grid* — one rule colour, ruled columns | `styles.css:17431`–`17446` `left: 0; right: 0` on a layer whose containing block is not the seven columns; `:18080` commented-out column border; `:18052` header rule | Slot lines positioned against the day-column stage; a 1px `--db-calendar-rule` on every day column's right edge; header rule, hour and half-hour all the same token (half-hour may drop, not recolour) |
| P1-4 | **Week/day today treatment** | 2px accent underline under `Wed` (`#DCDDDE` ink on a `#262626`–`#3A3A3A` band) *and* a `#216DFA` disc *and* a `#216DFA` now-line *and* the `13` hour label recoloured `#216DFA` | One disc. No underline, no recoloured label | `styles.css:18085`–`18096` `is-today::before` underline; `:17470`+ hour label recolour | Keep the disc and the now-line (ours); drop the underline and the label recolour |
| P1-5 | **Unscheduled drawer** | `Unscheduled (1)` in `#9B9B9B` 600 weight, then `34 — Highfield Sports` **centred** in the 2000px pane (ink 966 → 1077), inside a radius-6 box whose `#292929` border is invisible on `#262626` | No drawer. Undated objects simply do not appear (`design-trueup.md` §3) | `styles.css:18397`–`18470`; the item is a `button` centred by Obsidian's default | Kept as ours (AC-006), but at the chip grammar: 12px label at the weekday-label size, rows at 20px pitch with icon + title flush left at 10px, one rule below, no radius, no box. Or collapse it to `1 unscheduled` beside `Today` opening a popover, which removes the only non-grid surface from the page |
| P1-6 | **Phone chips overflow their column** (harness) | Columns 87 CSS px; `iCloud` ink 180 → 274 in a column ending at 260; `Adobe CC audit` ink 180 → 355 crosses two rules; `Noti…` truncates only where the next chip forces it | No phone reference; the month grid's own rule: nothing crosses a rule | `styles.css:17900` `flex: 1 0 min(8ch, 100%)` (8ch at the phone's 16px is 128px > 87px); the segment has no `overflow: hidden` | `flex: 1 1 0; min-width: 0` on the title, `overflow: hidden` on the segment, ellipsis; **labelled "design inferred from desktop"** per AC-007 |
| P1-7 | **Phone add buttons and overflow pill** (harness) | A `+` glyph beside every one of 35 day numbers (coarse-pointer `opacity: 1`); `+2 more` wraps to two lines inside a `#2A2A2A` pill | Nothing beside the number; one text line | `styles.css:17206`–`17209`, `:20934` coarse-pointer rule; P0-4's missing reset | Hide the `+` on phone (long-press / day sheet is the add path, `044`); P0-4's reset with `white-space: nowrap` |
| P1-8 | **Weekday label corpus drift** | Harness `Sun Mon Tue` (3 letters, 14px); operator `Su Mo Tu` (2 letters) | `Mo Tu We` 12px right-aligned 11px inside the column | Harness captures at `2446a10a` predate the label change | Recapture the corpus on HEAD before the next leg measures anything; the review corpus must match the operator's build |

### P2 — polish, after P0 and P1

| ID | Element | Ours, measured | Anytype, measured | Cause | Fix |
|---|---|---|---|---|---|
| P2-1 | Done chips | Strikethrough in `--text-success` green, 1px, plus `opacity: .82`; on the operator's screen 14 of 40 chips are green-struck | Not captured; Anytype's checked Task shows a checked icon in the chip's icon slot | `styles.css:18370`–`18382` | Strikethrough in the text colour, no green; when the record is a checkbox row, the icon slot shows a checked glyph |
| P2-2 | Chip hover | `box-shadow: var(--db-elevation-1)` + `translateY(-1px)` on a chip that has no box | Not captured | `styles.css:17823`–`17826` | Hover = text colour to `--text-normal` or a 3% surface tint the width of the chip; no lift, no shadow |
| P2-3 | Day number colour, light | `#2E3338` (theme's blue-black) | `#252525` | `styles.css:17148` `var(--text-normal)` | Fine as a theme value; note only |
| P2-4 | Day scale header | `Mon` / `16` / `row-15` stacked top-left with 13px labels and no rule between the name and the all-day row | (no day scale) | `styles.css:17456`–`17469` | Take the week header's grammar: name and number on one line, the today disc, one rule |
| P2-5 | Empty state | A bordered card `No date property` with a violet 40px button on the page | An empty grid; a set with no dated objects still shows the month | `055`'s shared empty card | Keep the card for the *no property* state; when a property is set and no object has a value, render the empty grid, not a card |
| P2-6 | Chevron colour, operator theme | `#868686` on `#262626` = 3.1:1 | `#A09F93` on `#171717` | `--text-muted` on the operator's theme | Fine; note that R2's light value `#949494` was tested on `#FFFFFF` only |
| P2-7 | Title strip above the calendar | `Title Ascending ×  Clear all` filter strip pushes the header 27px below itself | Anytype's month title sits 27px below the view tabs | `053` toolbar | Not this packet's; noted so the vertical rhythm is measured from the strip when present |

---

## 5. WHAT THE MET ROWS MISSED, PLAINLY

- **AC-002 measured elements, not relationships.** It read `#292929` at the rule and `#1E1E1E` at
  the weekend on a page it never sampled. The page was `#1E1E1E`, which made the tint invisible in
  its own capture, and the operator's page is `#262626`, which makes the rule invisible and the tint
  inverted. A parity value that only holds on Anytype's own page colour is not a parity value.
- **AC-002 measured a chip in a cell no span had touched.** *"32px below the cell top"* is true of a
  cell whose first lane is free. On the operator's screen five spans consume the first five lanes of
  every cell in row 1, so the value the row certifies is not what the operator sees.
- **AC-002 called the week start "not a measured value".** Twenty captures start on Monday. It is
  the most-measured value in the corpus.
- **AC-003 counted controls and never looked at their shape.** A bordered, filled segmented pill and
  a fifth icon button were "declined deletions, named rather than silent"; naming a deviation does
  not make it read as Anytype.
- **The `+N more` row was marked *pixel read owed* and left alone**, but the official docs
  illustration in `screenshots/anytype/official/` has been in the repo the whole time and shows it:
  grey text, no fill. The row's `Today` cell (a filled button band) was never described.
- **No row exercised a multi-day event, a custom-column view config, or the operator's theme.** All
  three are on the operator's screen, and between them they are most of what they saw.
- **The corpus was stale when AC-002 closed** (three-letter weekday labels in the captures, two-letter
  in the build).

---

## 6. PROPOSED LEG PLAN, ORDERED BY VISUAL WEIGHT

Each leg is one commit set, recaptured on HEAD **and** on a second theme whose `--background-primary`
is not `#1E1E1E` (the operator's is `#262626`), before its rows are ticked.

| Leg | Lands | Rows closed | Why this order |
|---|---|---|---|
| **L1 — one sheet, one rule** | P0-1 surface-relative tokens for rule, weekend, drawer and slot lines; P0-2 Monday default; P0-4 `+N more` reset; P0-5 month grid ignores custom column width | G1, G2, G6, G7, G8, G11, G12 | Pure CSS plus two one-line renderer changes; removes the panels, restores the hairlines, puts the weekend on the right, stops the clipping. This alone changes the operator's read the most |
| **L2 — one chip** | P0-6 default document glyph, dot removed, time as suffix; P0-3 spans drawn per day in the month grid, no date string, no reserved lanes, no continuation masks | G3, G4, G5, G9 | Renderer work with a layout change; second-largest visual delta; depends on L1 only for recapture |
| **L3 — one header** | P1-1 switcher as plain tabs, mini-calendar removed; P1-2 12px gap, weight 500; P1-4 week/day today reduced to the disc | G13 | Small; visible on every scale |
| **L4 — week and day take the sheet** | P1-3 slot lines spanning the stage, vertical column rules, one rule token; P2-4 day header | G2 (week/day), G14 | Depends on L1's token |
| **L5 — phone** | P1-6 overflow, P1-7 hidden `+` and one-line more, labelled per AC-007 | G10 | Depends on L2's chip |
| **L6 — the rest** | P1-5 drawer at the chip grammar or collapsed to a header count; P2-1 done treatment; P2-2 hover; P2-5 empty grid; P1-8 corpus recapture (also done at every leg) | G15 | Lowest weight |

---

## 7. ACCEPTANCE ROWS THE REBUILD MUST ADD

Gestalt checks, each a pixel measurement on the recaptured corpus at DPR 2 and on the operator-theme
capture, with the failing value from this review recorded as the red value.

| ID | Check | Red value today |
|---|---|---|
| G1 | **No cell background differs from the page surface** except the two right-most columns' weekend tint; the tint is lighter than the page in dark and darker in light, by 2–4% | Operator: weekend 8 levels *darker* on col 1 and col 7; harness dark: tint = page |
| G2 | **Exactly one rule colour** across the month grid, the week grid, the day grid and the drawer (scan a line crossing every rule; distinct non-surface, non-ink colours = 1), and its luminance delta from the page ≥ 6% | Four (`#3A3A3A`, `#292929`, `#282828`, `#222222`); operator delta 0.8% |
| G3 | **Chip left ink at 10 ± 1px inside the left rule in every column of every row**, single-day and spanning alike | Spans: title at 10px in the first cell, date string right-aligned in the last, nothing between |
| G4 | **Every cell's first chip ink at 32 ± 1px below the cell top**, including cells inside a spanning event's range | Operator row 1: first single-day chip at ≈98 CSS px |
| G5 | **No centred text inside a cell or the drawer**: every ink run other than the day number starts within 12px of the left rule | `+1 more` centred in 20 cells; drawer item centred in the pane |
| G6 | **The seventh column's right rule is inside the pane at every pane width from 900px up, on a view whose config carries a custom column width** | Right rule off-screen on the operator's view |
| G7 | **Week starts Monday by default**; the tinted pair is columns 6 and 7 | Sunday; columns 1 and 7 |
| G8 | **`+N more` has zero non-surface pixels outside its glyphs** and sits at the chip inset at 20px pitch | 288 × 26 filled band |
| G9 | **Every chip carries an icon glyph 10px from the rule when `Show icon` is on**, whether or not the note has an icon of its own; no chip carries a coloured dot | 0 of 40 chips on the operator's screen |
| G10 | **Phone: no chip ink crosses a column rule** | `Adobe CC audit` crosses two |
| G11 | **The calendar block of `styles.css` contains no literal surface, rule or tint hex**; the `#216DFA` disc, `#767676`/`#808080` numerals and chip ink pair are the only literals permitted, each with its ADR-004 or R-number comment | 10 literal rule/tint declarations |
| G12 | **A second-theme capture is in the corpus** (`--background-primary` ≠ `#1E1E1E`, ≠ `#FFFFFF`) and G1, G2 hold on it | None exists |
| G13 | **The header carries no bordered or filled control**: switcher words, `‹`, `Today`, `›`; month-to-year ink gap 12 ± 1px; four controls at most | Pill + five controls; 34px gap |
| G14 | **Week and day slot lines span from the first day column's left rule to the last's right rule**; a vertical rule on every day column | 278 → 1205 of 105 → 1392 |
| G15 | **Done chips carry no colour other than the chip ink**; a checkbox record shows the checked glyph in the icon slot | Green strikethrough |

AC-010 stays the operator's. A leg that ticks G1–G15 has earned a second look, not the row.

---

## RELATED DOCUMENTS

- `design-trueup.md` — the value-level measurements this review sits on top of; §2c's table is still correct, it was the *relationships* that went unmeasured
- `acceptance-criteria.md` — AC-002, AC-003 and AC-007 are the rows §5 reopens in substance
- `decision-record.md` — ADR-002 (week/day kept), ADR-004 (parity by default), both unchanged by this review
- `../056-board-anytype-parity/design-trueup.md` §2 — the per-pixel method used here
- `screenshots/anytype/official/anytype-calendar-official.jpg` — the only capture of Anytype's overflow affordance
