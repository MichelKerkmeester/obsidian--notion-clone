---
title: "Design True-Up: The Thirteen Board Elements Against the Anytype Kanban Captures"
description: "One row per anatomy element — the Anytype kanban screen it was measured on or the named gap, the pixel values read off that screen, what our Project Manager port does today at file and line, and the per-element migration ruling. This is T001's output and the packet's design record."
trigger_phrases:
  - "056 design true-up"
  - "board anytype parity trueup"
  - "kanban capture read"
  - "kanban element migration table"
  - "T001 capture read"
  - "board geometry true-up"
importance_tier: "high"
contextType: "research"
---
# Design True-Up: The Thirteen Board Elements Against the Captures

> This is **T001's output** and goal D1's gate. It is the `design-trueup.md` `spec.md` section 4
> names, and it replaces every cell in that section reading *"owed to T001"*. Every value below was
> read off a file in `screenshots/anytype/desktop/sets/`, `screenshots/anytype/desktop/menus/`,
> `screenshots/anytype/mobile/app/`, `screenshots/anytype/mobile/sheets/`, or off a line in
> `src/views/board-renderer.ts` and `styles.css`. Nothing here is carried over from `050`'s or
> `051`'s true-up unless it is labelled as such.

---

<!-- ANCHOR:headline -->
## 1. THE HEADLINE, BEFORE THE TABLE

Reading the sweep changed the packet in five places, and confirmed it in two.

**The column header the packet describes does not exist.** `spec.md` A1 asks for *"group title,
record count, a `···` menu and an add affordance on one row"*. On the desktop, at rest, the column
header carries **one element only**: a 24px outlined chip holding the option name. There is **no
record count anywhere on the desktop board**, in any of the twenty capture files. The `···` and the
`+` exist, and they are **hover-only** — `anytype-menu-kanban-column-menu-dark-full.png` catches
them, at a 28 × 28px hover slot and a bare 14 × 14px glyph, and every one of the ten resting
captures shows the header band with nothing in it but the chip. §5 C1.

**The phone board *is* captured, and the packet says it is not.** `spec.md` section 12 records as an
open question that *"the three iOS kanban sheets cover the group-by and column menus, not the board
body"*. `screenshots/anytype/mobile/app/anytype-mobile-set-kanban-{light,dark}.png` is the board
body, and it disagrees with the desktop on four elements: it **carries the record count** the
desktop does not, it shows the `···` **always** rather than on hover, it labels the ungrouped column
**"Uncategorized"** where the desktop says **"No value"**, and its new-record control is a labelled
**`+ New`** row where the desktop's is a bordered box with a bare `+`. Section 12's question is
answered by measurement rather than inference. §5 C2.

**Anytype's own light theme fails WCAG 1.4.3 on the board, systematically.** Not one value, a
family. Every column-header option colour is the raw option hue on the page background: amber
**`#B97C37` = 3.50:1**, yellow **`#C09B26` = 2.64:1**, grey **`#888888` = 3.54:1**, and the ungrouped
grey **`#828282` = 3.84:1** — which is also the colour of **every property value on every card**.
The phone is worse: the column label reads **`#949494` = 3.03:1** and the `···` glyph
**`#A7A7A7` = 2.41:1**, below even 1.4.11's 3:1 bar for a non-text control. The dark theme passes
everywhere, 4.96:1 to 13.71:1. This is the packet's refusal list and it is §6.

**The filled card chip is the one place Anytype solved it, and it is the pattern to copy.** The
same amber that fails at 3.50:1 as bare text passes at **6.11:1** inside a chip, because the chip
pairs a **tint fill** with a **darkened text of the same hue**: `#75461C` on `#F9DEBA` light,
`#F7D080` on `#572E0B` dark. The fix for the header is not a new colour — it is Anytype's own chip
treatment applied to a place Anytype left bare.

**Five elements have no capture at all and are labelled, not guessed.** The empty column, the
deleted-relation empty state, the card cover, every drag-held state, and the behaviour past the page
limit. §9 counts them.

**Confirmed, not changed: the sticky scrollbar and the page limit.** `050` REQ-003's geometry
re-measured to the pixel off a different file — thumb `#B6B6B6` at **y 1199..1208** of a 1217px
viewport, **10px tall, 8px above the bottom**, identical on the kanban and on the grid. And
`anytype-menu-set-layout-kanban-page-limit-dark.png` shows **10** selected out of `10 / 20 / 50 /
70 / 100`, which is `053` D4's per-layout figure and not `050`'s withdrawn flat 60. `spec.md` A10
and A13 stand as written.
<!-- /ANCHOR:headline -->

---

<!-- ANCHOR:method -->
## 2. HOW THE CAPTURES WERE READ

**Scale, established before anything was measured, because the dispatch and the reference documents
disagreed.** The brief for this leg said the captures are 2× and must be divided. They are not, and
the two documents this leg was told to follow as method — `050/design-trueup.md` §2 and
`051/design-trueup.md` §2 — both say so already. The check was run rather than assumed:

- **Desktop — 1 device pixel to 1 CSS pixel.** Every set and menu file is 2168 × 1217. The card
  title's ascender-to-baseline band measures **11px** (`anytype-project-tracker-kanban-dark.png`,
  y 326..336), which is a ~15px font. At 2× it would be a 7.5px card title, which no product ships.
  The independent confirmation is `050` REQ-003's scrollbar: this read finds it at y **1199..1208**
  of a 1217px frame, **10px** tall, the same number `050` recorded as CSS pixels off a different
  file. Every desktop figure below is a CSS pixel and is **not divided**.
- **iOS — 3×, not 2×.** Every mobile file is **1206 × 2622**, which is 402 × 874 **pt at 3×**, the
  same frame `051` §2b measured. Every phone figure below is divided by **three** and stated in
  **pt**. A number taken off these files without that division is wrong by 3×.

**Method.** Card and column edges were found by scanning for the border colour down a fill-run
rather than by eye; row pitch by ink-band grouping across the card's full content width; colours by
per-pixel sampling of the extreme pixel within a band, so an antialiased glyph reports its core
rather than its blend; contrast ratios computed from the sampled hex with the WCAG relative-luminance
formula, never estimated. Every option colour was read across **all ten use cases** before it was
recorded, because `050` generalised a single panel five times and was corrected five times.

**What a static capture cannot answer.** Motion, focus, and any state needing a pointer *held*. The
hover state is an exception and is captured — the `-full` menu files caught the column header
mid-hover. Every timing figure in this document is `050` §4's reconciled band, labelled as such,
never quoted as measured. Drag-held states are not captured and `screenshots/anytype/README.md`
already records them as such.

### 2a. The desktop kanban system, measured

All figures from `anytype-project-tracker-kanban-{light,dark}.png` unless noted, and cross-checked
against the other nine use cases where the element repeats.

| Property | Measured | Where |
|---|---|---|
| Column width | **246px** (border box) | card edges x 674..919, 944..1189, 1214..1459, 1484..1729, 1754..1999 |
| Column gap | **24px** | 1189 → 1214, four times, identically |
| Column pitch | **270px** | 944 → 1214 → 1484 → 1754 |
| Column background | **none** — the page shows through between cards | `#171717` dark / `#FFFFFF` light sampled at x 930, every row |
| Header chip | **24px tall**, x from card-left **+8px**, width content-driven 48..76px | ink band y 272..295, left edge 682 / 952 / 1222 / 1492 / 1762 |
| Header chip fill | **none** — page background inside the border | y 284, x 1013..1015 = `#FFFFFF`; dark `#171717` |
| Header chip border | **1px, `#EBEBEB` light (1.19:1) / `#292929` dark (1.23:1)** | y 272 top row, x 959..1007 solid |
| Header chip radius | **12px — fully rounded** | inset 8px at the top row of a 24px band |
| Header chip text | **the option colour**, per theme (table in A9) | |
| Header → first card | **9px** | chip bottom 295, card top border 305 |
| Card box | **246 × content-driven**; 104px, 317px, 342px, 554px and 579px observed | No-value 305..408, Blocked 305..883, In Review 867..1208 |
| Card fill | **`#191919` dark / `#FFFFFF` light** (light = page, so the border is the only edge) | x 1000, y 452 |
| Card border | **1px, `#212121` dark (1.11:1) / `#F2F2F2` light (1.12:1)** | x 944 and x 1189 |
| Card radius | **≈8px** | top-left arc: inset 4px at y 305, closed by y 309 |
| Card shadow | **none at rest** | no gradient band outside the border in either theme |
| Inter-card gap | **8px** | 883 → 892, 858 → 867, 408 → 417 — four columns, one number |
| Card padding | **16px** | content ink at x offset 17..18 from a 1px border |
| Card title | **≈15px**, `#E1E1E1` dark (13.44:1) / `#252525` light (15.33:1) | ascender 326, baseline 336 |
| Card title icon | **16 × 16px slot at the content's left edge**, glyph ink 12px wide, text starts 27px in | icon bbox y 324..339, x offset 21..32 |
| Type line | **`#A3A3A3` dark (6.97:1) / `#828282` light (3.84:1)** | band y 349..361 |
| Property row pitch | **25px**, uniform | 374 → 398 → 423 → 449 → 473 → 498 → 524, and 598 → 623 → 648 → 673 → 698 |
| Property value text | **same secondary pair** — `#A3A3A3` / `#828282`. **No labels: values only** | every non-chip band |
| Card tag chip | **20px tall, 6px radius, 8px gap**, fill = the option tint, text = the option's dark variant | band y 545..564, x offsets 17..66 and 75..177 |
| Checkbox glyph | **14 × 14px** at the content's left edge, label 8px to its right | band y 573..586, x 962..975 |
| New-record control | **246 × 42px** box, 8px below the last card, 1px border, **8px radius**, bare **14 × 14px** `+` centred | No-value column y 417..458 |
| `+` glyph colour | **`#9B9B9B` light (2.78:1) / `#A09F93` dark (6.72:1)** | glyph centre y 437, x 796 |
| Sticky scrollbar | **10px tall, y 1199..1208, 8px above the 1217px viewport bottom** | light and dark, kanban and grid |
| Scrollbar thumb / track | **`#B6B6B6` / `#EBEBEB` light**, `#737373` / `#292929` dark; thumb x 668..1707, track to x 2100 | y 1203 |
| Menu panel width | **256px** card menu, **224px** column menu | `-card-menu-dark.png` x 12..267; `-column-menu-light.png` x 12..235 |
| Menu row pitch | **28px** | column-menu swatches at y 71 / 99 / 127 / 155 / 183 / 211 |
| Menu hover row fill | **`#232323` dark / `#F2F2F2` light** | both menu files |
| Menu icon glyph | **`#9B9B9B` light (2.78:1) / `#A09F93` dark (6.72:1)** | x 36, every row |

### 2b. The iOS kanban board, measured for the first time

`spec.md` treated the phone board as uncaptured. It is not. All figures from
`anytype-mobile-set-kanban-{light,dark}.png`, divided by three.

| Property | Measured | Where |
|---|---|---|
| Column width | **254.7pt** | card box device x 83..846 |
| Column gap | **23.3pt** | card 1 right 846 → card 2 left 917 |
| Column pitch | **278pt** | 83 → 917 |
| Card fill | **none — the page shows through** | `#000000` dark / `#FFFFFF` light inside the border |
| Card border | **hairline ≈0.7pt**, `#2B2B28` dark (1.48:1) / `#EAEAEA` light (1.20:1) | 2 device px at x 83..84 |
| Card height, one-property card | **74.7pt** | device y 956..1179 |
| Column header | **label + count + `···`, all three always visible** | ink groups at device x 117..377, 408..418, 757..802 |
| Header label | **≈14pt**, `#909090` dark (6.58:1) / `#949494` light (**3.03:1**) | cap band 10.0pt |
| Header count | **the same grey as the label**, 10.3pt to its right | device x 408..418 |
| Header option colour | amber `#E6BF70` dark (12.05:1) / `#C38400` light (**3.17:1**) | column 2, device x 954..1091 |
| Header `···` | **15.3pt wide**, `#7B7B7B` dark (4.96:1) / `#A7A7A7` light (**2.41:1**) | device y 835..844 |
| Header → first card | **31.3pt** | label band bottom 862 → card top 956 |
| New-record control | **a labelled `+ New` row**, left-aligned below the last card, no box, no border | device y 1266..1313, x 126..285 |
| `+ New` colour | `#909090` dark (6.58:1) / `#949494` light (**3.03:1**) | same band |
| Ungrouped column label | **"Uncategorized"** — not the desktop's "No value" | device x 117..377 |
| Overflow chip | a **grey filled `+1` chip** rather than the desktop's bare `+3` text | column 2 chip row |
| Date format | `11 Feb 2026` where the desktop renders `February 11, 2026` | column 2 |

**The three iOS sheets, read.** `anytype-mobile-sheet-kanban-column-menu-dark.png` is a bottom sheet
**with a grab handle**, carrying `Hide column` as a **toggle**, a `Column color` section label, a
horizontal row of colour discs, and a **full-width blue `Apply` pill**. The desktop column menu has
none of those three — no toggle, no section label, no commit button, and it applies immediately.
`anytype-mobile-sheet-kanban-groupby-dark.png` is a **handle-less** stacked menu — `051` §3's third
navigation move — with a centred `Group by` title, one row per property carrying its type icon, a
divider between every row, and a **trailing ✓** on the selected row.
`anytype-mobile-sheet-view-layout-kanban-dark.png` carries a handle, a centred `Layout` title, the
3-across tile grid with Kanban selected in blue, and **three rows only**: `Icon` (toggle, on),
`Group by  Status (Project Tracker) ›`, `Color columns` (toggle, off). The desktop panel carries
**six**. The phone drops Cover, Fit media and Page limit entirely.
<!-- /ANCHOR:method -->

---

<!-- ANCHOR:anatomy -->
## 3. THE THIRTEEN ANATOMY ELEMENTS

One row each, in `spec.md` section 4's order. **Seen** means an Anytype surface was opened and read.
**Not seen** means no capture in the 62-file set shows it and the design is inferred, with its
reason.

| # | Element | Read | Value |
|---|---|---|---|
| **A1** | Column header | **Seen — and the packet's description is wrong.** `anytype-*-kanban-{light,dark}.png` ×20 at rest; `anytype-menu-kanban-column-menu-dark-full.png` on hover | Desktop, at rest: **the option chip alone**. 24px tall, 12px radius, 1px `#EBEBEB`/`#292929` border, no fill, 8px in from the card's left edge, option-coloured text. **No record count exists on desktop.** On hover a **28 × 28px** `···` slot (fill `#232323` dark) appears at x 850..877 and a bare **14 × 14px** `+` at x 891..904, i.e. 8px in from the card's right edge with a 6px gap between them. On phone all three are **permanent** and the count **is present** — §5 C1, C2 |
| **A2** | Card shape and padding | **Seen** | **246 × content-driven**, min observed 104px. 1px border `#212121` dark / `#F2F2F2` light, fill `#191919` / `#FFFFFF`, **8px radius**, **no shadow at rest**, **16px padding**, **8px inter-card gap**. Title **≈15px** `#E1E1E1`/`#252525` on a **25px** line rhythm |
| **A3** | Card cover | **Not seen on a card.** The control is seen: `anytype-menu-set-layout-kanban-cover-dark.png` | The layout panel's `Cover` row reads **`Select ›`** and its picker offers **`None` (selected) / `Object cover` / `Attachments`**, with `Fit media` a separate toggle, **off**. The default is off, which is why no card in twenty captures carries one. **The rendered cover is design inferred** — no capture shows a kanban card with a cover applied |
| **A4** | Property rows on the card | **Seen**, ten use cases | **Values only, no labels, one per line, 25px pitch**, in the view's property order. Text `#A3A3A3` dark / `#828282` light. Select options render as **filled 20px chips, 6px radius, 8px gap**, overflowing to a bare **`+3`** on desktop and a **grey filled `+1` chip** on phone. Checkboxes render as a **14 × 14px** circle glyph plus the property name, filled blue when true. Relations render as a **16px icon plus the object title**. Dates render as plain text. The type name is the **first** line under the title, in the same secondary grey |
| **A5** | "+ New" placement | **Seen — and `047`'s source read is contradicted at rest.** | Desktop: a **246 × 42px bordered box, 8px below the last card**, 8px radius, a bare **14 × 14px `+`** centred, no label. Phone: a **labelled `+ New` row**, left-aligned, no box. `047` section 5 records it as *"always the top drop target"* during a drag; at rest it is **bottom**, in both clients. The two are compatible only if the position changes under drag, which no capture shows — §5 C4 |
| **A6** | Column add | **Not seen as a strip-level control.** | No add-a-column affordance exists anywhere on the strip in any of the twenty captures. The only column-level `+` is the per-column hover `+` in A1, which adds a **record**, not a column. Columns are the group property's options, so a column is added by adding an option — `anytype-menu-kanban-column-menu-*` offers `Hide Column`, not `Add Column`. **Design inferred: there is no such control to port** |
| **A7** | Drag affordances | **Not seen.** `screenshots/anytype/README.md` records drag-held states as not captured, and this read confirms it: no capture in the 62-file set holds a card mid-drag | The design stays `047` section 5's source-derived read — off-screen clone as drag image, cached-rect hit testing inside `requestAnimationFrame`, `isOver` plus edge classes, and a cross-column drag that carries the whole multi-select and commits as **one** property write. **Design inferred from source code, not seen** |
| **A8** | Group-by and the ungrouped column | **Seen** on both clients | Desktop `anytype-menu-set-layout-kanban-group-by-dark.png`: the layout panel carries `Group by  Status (Project Tra… ›` between `Fit media` and `Color columns`, opening a **handle-less anchored picker** listing every eligible property with its type icon, a **trailing ✓** on the selected one, a divider, then `+ Add Property`. Phone `anytype-mobile-sheet-kanban-groupby-dark.png` is the same list as a **stacked, handle-less sheet** with a centred title and a divider between every row. The ungrouped column is **first in the strip** and is labelled **"No value"** on desktop, **"Uncategorized"** on phone — §5 C3 |
| **A9** | Colours per option | **Seen**, and it is a **ten-colour named palette**, not a hash | `anytype-menu-kanban-column-menu-{light,dark}.png` names them in order — **Grey, Yellow, Amber, Red, Pink, Purple, Blue, Sky, Teal, Green** — each with a 16px disc at a 28px pitch. The disc carries the **tint**, which is the same value as the card chip's fill. Full table below this one. The header chip uses the **text** variant on the page background; the card chip uses the **tint fill** plus a **darkened text**. `Color columns` is a **toggle, off by default**, which is why the column body is uncoloured |
| **A10** | Sticky horizontal scrollbar | **Seen, and `050` REQ-003 re-confirmed to the pixel** | **10px tall**, **y 1199..1208 of a 1217px viewport** = 8px above the bottom, spanning the scroller's width (track x 668..2100, thumb x 668..1707 at scroll 0). Thumb `#B6B6B6` on track `#EBEBEB` light, `#737373` on `#292929` dark. **Identical on `anytype-project-tracker-grid-light.png`** — same rows, same hex. Thumb-on-track contrast **1.70:1**; this is why `050`'s colour decline stands |
| **A11** | Empty column state | **Not seen.** Checked programmatically: all six visible columns in all ten dark captures carry a card at y 305..330. **No empty column exists anywhere in the twenty files** | And no board in the set has a deleted group relation, so its dedicated empty state is not seen either. `047` section 5's source read is the only source, and both states are **design inferred from source code, not seen** |
| **A12** | Card menu | **Seen**, with its three sub-menus | `anytype-menu-kanban-card-menu-dark.png`: a **256px** panel, **28px** rows, **four sections separated by three dividers** — `Open as Object` / `Change type ›` / `Edit Properties`; `Favorite` / `Pin to Channel` / `Add Link to Object ›` / `Add to Collection ›`; `Copy Link` / `Duplicate` / `Export` / `Unlink from Collection` / `Move to Bin`; `Open in New Tab` / `Open in New Window`. Every row is icon-plus-label; submenu rows carry a trailing chevron. **`Move to Bin` is not red**: `#E1E1E1` dark / `#252525` light, identical to every other row — §6 E3 |
| **A13** | Page limit | **Seen. 10, confirmed** | `anytype-menu-set-layout-kanban-page-limit-dark.png` shows **10** selected from `10 / 20 / 50 / 70 / 100`. This is `053` D4's per-layout figure, and `050`'s withdrawn flat 60 does not appear. **What renders past the limit is not seen** — no captured column exceeds it |

### A9 in full — the ten option colours, both themes

Tint from `anytype-menu-kanban-column-menu-{light,dark}.png` disc centres; text from the header
chips across all ten use cases; chip pair from `anytype-project-tracker-kanban-*` card chips.

| Option | Tint, light | Tint, dark | Header text, light | on `#FFFFFF` | Header text, dark | on `#171717` |
|---|---|---|---|---|---|---|
| Grey | `#E3E3E3` | `#414141` | `#888888` | **3.54:1** | `#A8A8A8` | 7.54:1 |
| Yellow | `#FCEFB4` | `#6C621A` | `#C09B26` | **2.64:1** | `#EBD739` | 12.22:1 |
| Amber | `#F9DEBA` | `#74390D` | `#B97C37` | **3.50:1** | `#E9AB34` | 8.83:1 |
| Red | `#F8DFD2` | `#7A271C` | `#C45426` | **4.52:1** | `#E46244` | 5.23:1 |
| Pink | `#F6D2E7` | `#7D2543` | `#C64479` | 4.66:1 | `#E15A9E` | 5.26:1 |
| Purple | `#E6D7FE` | `#512789` | `#8F53DC` | 4.73:1 | `#BD7DE5` | 6.17:1 |
| Blue | `#DDE3FB` | `#20347C` | not in use | — | not in use | — |
| Sky | `#C9E6F9` | `#174A6F` | not in use | — | not in use | — |
| Teal | `#CFEEED` | `#204D4A` | not in use | — | not in use | — |
| Green | `#DEF2C1` | `#3C5115` | not in use | — | not in use | — |
| *(ungrouped)* | — | — | `#828282` | **3.84:1** | `#A3A3A3` | 7.11:1 |

**The card chip, by contrast, passes in both themes.** The amber chip measures `#75461C` on
`#F9DEBA` = **6.11:1** light and `#F7D080` on `#572E0B` = **7.93:1** dark. The dark chip fill
`#572E0B` is *darker* than the dark menu swatch `#74390D`; both are recorded rather than averaged.
Four of the ten colours were never rendered in the sweep and their header-text variants are
**not seen** rather than extrapolated from the tint.
<!-- /ANCHOR:anatomy -->

---

<!-- ANCHOR:migration -->
## 4. THE PER-ELEMENT MIGRATION TABLE

Every `pm-*` class `board-renderer.ts` constructs, with the value that replaces it. This fills
`spec.md` section 4's table; the **Disposition** column for the three no-counterpart families and
the seven extensions stays **T003's** and is marked so. Line numbers are `styles.css` and
`src/views/board-renderer.ts` at `9a0293a2`, re-read after the rebase rather than carried.

| PM element | Our value today | Anytype value | Capture | Our file:line | What changes |
|---|---|---|---|---|---|
| `pm-kanban-view` | `overflow: hidden`, column flex, `line-height: normal` | Set kanban root; no view-level chrome of its own | `anytype-project-tracker-kanban-light.png` | `styles.css:9213`, `board-renderer.ts:330` | Rename only; the shell is already right |
| `pm-kanban-board` | `gap: 14px`, `padding: 16px`, `overflow-x: auto`, container-padding cancel | Column pitch **270px** = **246px** column + **24px** gap; **sticky scrollbar 10px tall, 8px above the bottom**, absent here | `anytype-project-tracker-kanban-{light,dark}.png`, `-grid-light.png` | `styles.css:9228`, `board-renderer.ts:331` | Gap **14 → 24px**; add the scrollbar rail |
| `pm-kanban-col` | `width: 280px`, `background: var(--background-secondary)`, `border-radius: var(--radius-m)`, `overflow: hidden` | **246px**, **no background panel at all** — the page shows through between cards | ten use cases, both themes | `styles.css:9251`, `board-renderer.ts:350` | Width **280 → 246px**; **drop the column background and radius**; drop `overflow: hidden` so the header can hover-reveal |
| `pm-kanban-col-topbar` | 3px coloured bar at `opacity: .5` | **No counterpart.** The option colour lands on the chip's *text*, never on a bar | ten use cases | `styles.css:9265`, `board-renderer.ts:354` | **Retire** |
| `pm-kanban-col-header`, `-col-title-row` | `padding: 10px 12px 8px`, `space-between` | One row: chip at card-left **+8px**, **24px** tall; `···` and `+` right-aligned, **8px** from the card's right edge, **hover-only** on desktop, permanent on phone | `-kanban-column-menu-dark-full.png` | `styles.css:9262`, `:9269`, `board-renderer.ts:351`, `:356` | Re-shape to chip + hover controls; **9px** below the chip to the first card |
| `pm-kanban-col-badge` | `font-size: 13px`, `font-weight: 600`, option colour as text | **24px outlined chip, 12px radius**, 1px `#EBEBEB`/`#292929`, **no fill**, option-coloured text | ten use cases | `styles.css:9275`, `board-renderer.ts:357` | Becomes a bordered chip; **the option-colour text is the §6 E1 refusal** |
| `pm-kanban-col-badge-icon` | `--icon-size: 14px`, only when the option carries an icon | **No counterpart** — Anytype's column chip carries no icon | ten use cases | `styles.css:9282`, `board-renderer.ts:359-361` | **Retire** |
| `pm-kanban-col-header-right` | `gap: 6px` | The `···`/`+` pair, gap **6px** | `-kanban-column-menu-dark-full.png` | `styles.css:9286`, `board-renderer.ts:363` | Gap already matches; contents change |
| `pm-kanban-col-count` | pill, `background: var(--background-modifier-hover)`, `radius: 99px`, `padding: 1px 8px`, `12px/700`, `--text-muted` | **Desktop: does not exist.** Phone: **plain text in the label's own grey**, 10.3pt after the label, no pill, no background | twenty desktop files; `anytype-mobile-set-kanban-dark.png` | `styles.css:9291`, `board-renderer.ts:364` | **Retire the pill.** Keep a phone-only plain-text count, or retire outright — §5 C1's ruling |
| `pm-kanban-cards` | `padding: 6px 10px`, `gap: 8px`, `overflow-y: auto`, drop-target tint | **Gap 8px ✓.** No horizontal padding: the card is the column's full width | ten use cases | `styles.css:9300`, `board-renderer.ts:366` | Padding **6px 10px → 0**; gap unchanged |
| `pm-kanban-drop-target` | accent tint at 10% on the cards container | **Not seen** — no capture holds a drag | README, "not specifically captured" | `styles.css:9310`, `board-renderer.ts:382` | **Keep. Design inferred from source code, not seen** |
| `pm-kanban-card` | `min-height: 112px`, `border: 1px var(--pm-ghost-border)`, `radius: var(--radius-m)`, `transition: all .15s` | **No min-height** — 104px observed on a one-property card. 1px border, **8px radius**, **no shadow at rest** | ten use cases | `styles.css:9314`, `board-renderer.ts:426` | Drop `min-height`; pin the radius at 8px; keep the border |
| `pm-kanban-card:hover` | `box-shadow: 0 2px 12px`, border-colour shift | **Not seen** — no capture holds a card under a pointer | — | `styles.css:9327` | **Keep. Design inferred**; the shadow is our own affordance for a card whose border is 1.11:1 |
| `pm-kanban-card--dragging`, `pm-dragging` | raised shadow, accent border, `z-index: 100`, then `opacity: .5` | **Not seen** | README | `styles.css:9331`, `:9338`, `board-renderer.ts:455-456` | **Keep. Design inferred from source code, not seen** |
| `pm-kanban-card-priority-bar` | 3px coloured strip at the card's top, `opacity: .5` | **No counterpart.** Priority renders as an ordinary property row, in the chip family | `anytype-project-tracker-kanban-dark.png` band y 449..460 (`High`) | `styles.css:9342`, `board-renderer.ts:469` | **`retire` — T003 confirms** |
| `pm-kanban-card-body` | `padding: 10px 12px`, `gap: 7px` | **Padding 16px**; rows on a **25px pitch** rather than a flex gap | ten use cases | `styles.css:9347`, `board-renderer.ts:473` | Padding **10/12 → 16px**; gap **7px → a 25px row pitch** |
| `pm-kanban-card-title-row`, `-card-title` | `13px/500`, `line-height: 1.45`; type chips `M`/`Sub`/`R` appended | **≈15px**, `#E1E1E1`/`#252525`, preceded by a **16 × 16px icon slot**, text starting **27px** from the content's left edge. **No type chips of any kind** | ten use cases | `styles.css:9357`, `:9575`, `board-renderer.ts:480` | Size **13 → 15px**; add the icon slot; **retire the M/Sub/R chips** — no counterpart |
| `pm-kanban-card-description` | `12px`, `line-height: 1.4`, `--text-muted`, 3-line clamp | The body snippet is **one property row among the rest**, same 25px pitch, same secondary grey, **single-line truncated** | `anytype-course-notes-kanban-dark.png` | `styles.css:9363`, `board-renderer.ts:516` | Fold into the property-row shape; clamp **3 → 1** |
| `pm-kanban-card-tags`, `pm-chip` family (7) | `radius: var(--radius-s)`, `padding: 2px 9px`, `--font-ui-smaller`; `--tag` variant 11px with a 5px dot; `--solid` at 10%/20% colour-mix | **20px tall, 6px radius, 8px gap**, fill = the option **tint**, text = the option's **dark variant**. **No dot.** Overflow is a bare `+3` on desktop, a grey filled chip on phone | `anytype-crm-contacts-deals-kanban-*`, `-project-tracker-kanban-*` | `styles.css:9374`, `:9480`, `board-renderer.ts:528` | Pin height 20px and radius 6px; **replace the 10%/20% colour-mix with the measured tint pair**; **retire the dot** |
| `pm-kanban-card-footer` | `space-between`, `margin-top: auto`, `padding-top: 2px` | **No counterpart** — every property is a row in the same rhythm; nothing is pinned to the card's bottom | ten use cases | `styles.css:9380`, `board-renderer.ts:553` | **Retire** |
| `pm-avatar` family (4) | 26px circle, `border: 2px solid`, initials, overlapping stack | **No counterpart.** A person property renders as a **16px icon plus the name**, on its own row, like any relation | `anytype-crm-contacts-deals-kanban-dark.png`; `-habit-health-log-kanban-dark.png` (`Júlia Santos`) | `styles.css:9408`, `board-renderer.ts:558-569` | **`retire` — T003 confirms**; person becomes an icon-plus-name row |
| `pm-progress` family (4) | 6px track (3px `--sm`), 99px radius, accent fill | **No counterpart** on the kanban card | ten use cases | `styles.css:9453`, `board-renderer.ts:546-548` | **`retire` — T003 confirms** |
| `pm-kanban-card-parent` | `10px`, `--text-muted`, ellipsis breadcrumb | **No counterpart.** The line in that slot is the **object type name**, in the ordinary secondary grey at the ordinary size — not a smaller breadcrumb | ten use cases, band y 349..361 | `styles.css:9389`, `board-renderer.ts:478` | **`fold`, not `retire`**: the slot survives, its content becomes the type name and its size joins the secondary scale |
| *(absent)* | — | **Sticky horizontal scrollbar**, 10px / 8px / scroller width | `-kanban-light.png`, `-grid-light.png` | none — the gap `050` REQ-003 named | **Add**, geometry adopted, colours declined (§6 X1) |
| *(absent)* | — | **`+ New` control**: 246 × 42px bordered box on desktop, labelled row on phone | `-project-tracker-kanban-dark.png` y 417..458; `anytype-mobile-set-kanban-dark.png` y 1266..1313 | none | **Add** |

**Count check.** The table above accounts for all **39** constructed `pm-*` classes: 17 `pm-kanban-*`
plus the `pm-chip` family (7), `pm-avatar` (4), `pm-progress` (4), `pm-dragging`, and the
`view`/`board`/`col`/`cards`/`card` roots already counted among the 17. Twelve are **retired**, three
are **kept as design inferred** (the two drag states and the hover shadow), one is **folded**
(`-card-parent`), and the rest are **re-shaped to a measured value**. Zero rows read `unknown`.
<!-- /ANCHOR:migration -->

---

<!-- ANCHOR:contradictions -->
## 5. WHERE THE CAPTURE CONTRADICTS THE PACKET

Capture wins in every row below. Each names the file that settles it.

**C1 — A1's record count does not exist on the desktop, and the `···`/`+` are hover-only.**
`spec.md` A1 asks for four things on one row. The twenty resting captures show **one**: the chip.
The header band x-scan finds a single ink group per column in every file, 48..76px wide, which is
the chip's own width with nothing beside it. `anytype-menu-kanban-column-menu-dark-full.png` catches
the same column mid-hover and adds a 28 × 28px `···` slot and a 14 × 14px `+`. **Resolution: A1 is
rewritten to chip-plus-hover-controls, and `pm-kanban-col-count`'s pill is retired.** The count
survives only on the phone, where it is plain text.

**C2 — the phone board is captured and `spec.md` section 12 says it is not.** Section 12 asks
whether the phone board adopts the desktop column geometry. It does not have to be inferred:
`anytype-mobile-set-kanban-{light,dark}.png` measures **254.7pt** columns at a **278pt** pitch with
a **23.3pt** gap — proportionally close to the desktop's 246/270/24 but not the same numbers, and
with a **transparent card** where the desktop has a filled one. **Resolution: the open question is
closed by measurement. The phone board takes the phone's own values, and only the rows §9 lists as
uncaptured on phone are inferred from the desktop.**

**C3 — the ungrouped column has two names.** Desktop: **"No value"**. Phone:
**"Uncategorized"**. Same column, same product, same week, two strings. **Resolution: this is a
copy divergence in the reference, not a design one. Take one string and use it on both surfaces;
name the divergence rather than shipping two.** Recorded for the operator; it is not an
accessibility question and parity cannot be satisfied both ways at once.

**C4 — `047` puts the new-record control at the top during a drag; both clients put it at the
bottom at rest.** `spec.md` A5 quotes `047` section 5's source read — *"always the top drop
target"*. Measured: desktop **8px below the last card** (y 417..458 under a card ending at 408),
phone **below the last card** (y 1266 under a card ending at 1179). **Resolution: the resting
position is bottom, measured. The drag-time position stays `047`'s source read, labelled design
inferred, because no capture holds a drag.**

**C5 — A6's column add has no referent.** The packet asks for *"the control that adds a group
column, and where it sits on the strip"*. No such control appears in any of the twenty captures,
and the column menu offers `Hide Column` rather than `Add Column`, because a column **is** a group
option. **Resolution: A6 is not an element to port. It becomes a pointer to the group property's
option editor, which is `054`'s surface, not this packet's.**

**C6 — A3's cover is a setting, not a card element, and its rendered form is uncaptured.**
`anytype-menu-set-layout-kanban-cover-dark.png` shows `None` selected out of `None / Object cover /
Attachments`, with `Fit media` off. **Resolution: the *control* is adopted as measured; the
*rendered cover* is labelled design inferred, and the `covers` extension folds to the control rather
than to a card treatment nobody has seen.**

**C7 — `050`'s scrollbar colours are confirmed unusable, with a number.** Thumb `#B6B6B6` on track
`#EBEBEB` is **1.70:1**, and on the page white **2.03:1**. Even as a non-text control the thumb
fails 1.4.11's 3:1 in Anytype's own light theme. **Resolution: `050` REQ-003's colour decline was a
platform argument; it now also has an accessibility number behind it.** The geometry is adopted
unchanged.
<!-- /ANCHOR:contradictions -->

---

<!-- ANCHOR:refusals -->
## 6. THE ACCESSIBILITY REFUSALS, WITH THEIR MEASUREMENTS

`decision-record.md` ADR-002 is parity by default, inheriting `051` ADR-007: every captured value is
adopted, and a decline names WCAG and a number. Taste is not a ground. Four declines survive that
test, one platform decline carries over, and two values that *look* declinable are **adopted** with
the reason they are not.

**E1 — the light-theme option colour as bare text. WCAG 1.4.3.** The column-header chip puts the raw
option hue on the page background at ~13px. Measured across all ten use cases: yellow
**`#C09B26` = 2.64:1**, amber **`#B97C37` = 3.50:1**, grey **`#888888` = 3.54:1**, ungrouped
**`#828282` = 3.84:1**, red **`#C45426` = 4.52:1**. Five of the seven rendered colours are below
4.5:1. **The replacement is Anytype's own answer, taken from the card chip**: the tint fill plus the
darkened text of the same hue, which measures **6.11:1** for the same amber. The chip shape, the
24px height, the 12px radius and the 8px inset are all adopted; only the *unfilled* treatment in
light theme is declined. Dark theme is adopted verbatim — it measures 7.11:1 to 12.22:1.

**E2 — the light-theme secondary text on the card. WCAG 1.4.3.** `#828282` on `#FFFFFF` = **3.84:1**
carries the type line and **every property value on every card**. Anytype's own dark-theme
equivalent `#A3A3A3` on `#191919` = **6.97:1** passes, so the ramp exists and only the light end is
short. **Adopt the role and the rhythm; take the lightest theme grey that clears 4.5:1** rather than
this hex. This is `051` E2's exact shape — an empty-value grey replaced by a passing one from the
same product — applied to a different surface.

**E3 — the destructive row carries colour alone, or nothing at all. WCAG 1.4.1.** The desktop card
menu's `Move to Bin` measures `#E1E1E1` dark / `#252525` light, **identical to every other row**;
only the trash icon distinguishes it. `051` ADR-007's E3 already ruled on this family — Anytype
gives two answers and the minority one carries destructiveness on nothing. **Our destructive row
keeps red plus the icon.** Unchanged from `051`; recorded here because A12 is where it lands on the
board.

**E4 — the phone `···` glyph. WCAG 1.4.11.** `#A7A7A7` on `#FFFFFF` = **2.41:1**. It is the only
element identifying the column's menu affordance on a touch surface where there is no hover to
reveal an alternative, which is 1.4.11's case exactly. The desktop equivalent fails the same bar at
**2.78:1** (`#9B9B9B` on `#FFFFFF`), and so does the desktop `+` glyph, at the same hex.
**Adopt the geometry — 28 × 28px slot, 14 × 14px glyph, 15.3pt on phone — and take a glyph colour
that clears 3:1.** Dark theme is adopted verbatim at 6.72:1.

**X1 — the scrollbar colours. Platform, now with a number.** `050` REQ-003 declined
`#B6B6B6`/`#EBEBEB` because an Obsidian plugin lets the reader's theme own scrollbar chrome. That
argument stands and is `decision-record.md` ADR-002's recorded decline. §5 C7 adds the measurement:
the pair is **1.70:1**. Filed as platform rather than WCAG, exactly as ADR-002 asks.

**Adopted, and here is why they are not refusals.**

- **The 1px card border at 1.11:1 / 1.12:1.** A card is a control, so 1.4.11 looks like it applies.
  It does not: the card is identified by its title, its icon and its content, and the border is a
  divider between adjacent cards rather than the only thing identifying the control. `sk-design`
  §4 ALWAYS-3 draws that line explicitly — *a hairline that merely divides content does not*
  need 3:1. **Adopted verbatim, both themes.** The hover shadow we already ship stays as a second,
  stronger signal and is labelled design inferred, since no capture holds a pointer.
- **The 20px chip and the 25px property row.** Neither is a touch target on desktop, and on the
  phone the whole **card** is the target at 74.7pt. Nothing in the adopted set asks a finger to hit
  a 20px box. The only phone control below the 44px floor is the `···`, at **15.3pt** of ink — and
  a static capture cannot measure its hit area, so **our own 44px floor applies to it**. That is a
  floor added on top of parity, not a deviation from a measured value, and it is recorded so a later
  reader does not mistake it for one. `051` §8d made the same distinction.
<!-- /ANCHOR:refusals -->

---

<!-- ANCHOR:extensions -->
## 7. THE SEVEN EXTENSIONS — THE EVIDENCE T003 NEEDS

`board-renderer.ts:203-206` gates seven affordances behind `boardExtensions = false` — the packet's
own `:202-205` was stale by one line before the rebase and is corrected here and in every row that
cites it. **The
disposition is T003's and is not taken here**; what this section supplies is the captured
counterpart or the named absence each one needs.

| Extension | Captured counterpart | Evidence |
|---|---|---|
| Swimlanes | **None.** Anytype's kanban is a flat strip of columns; no second grouping axis appears in any of the twenty files, and the layout panel offers one `Group by` row, not two | ten use cases; `anytype-menu-set-layout-kanban-dark.png` |
| Covers | **The control, yes; the rendered cover, no.** `Cover  Select ›` → `None / Object cover / Attachments`, plus a `Fit media` toggle | `anytype-menu-set-layout-kanban-cover-dark.png`. §5 C6 |
| WIP counts | **None on desktop.** The desktop column header has no count at all. The **phone** carries a plain-text record count, which is a count of records, not a work-in-progress limit | twenty desktop files; `anytype-mobile-set-kanban-dark.png` |
| Summaries | **None.** No aggregate row, footer or total appears on any column in any file | ten use cases |
| Batch order | **Not seen.** No multi-select or drag state is captured | README, "drag-only states not specifically captured" |
| Touch menus | **Yes, and measured.** The phone shows a permanent `···` per column opening a bottom sheet with a handle, a `Hide column` toggle, a `Column color` disc row and a full-width `Apply` pill | `anytype-mobile-sheet-kanban-column-menu-{light,dark}.png` |
| Group controls | **Yes, and measured.** `Group by` on both clients, plus the `Color columns` toggle (off) which is the real control behind A9 | `anytype-menu-set-layout-kanban-group-by-dark.png`; `anytype-mobile-sheet-kanban-groupby-dark.png`; `anytype-mobile-sheet-view-layout-kanban-dark.png` |

Two of the seven the packet expected to `retire` — **WIP counts** and **touch menus** — have a
captured counterpart after all, which is why T003 is a separate task and this section stops at the
evidence.
<!-- /ANCHOR:extensions -->

---

<!-- ANCHOR:changes -->
## 8. WHAT THIS CHANGES IN THE PACKET

| Where | Was | Is |
|---|---|---|
| `spec.md` A1 | title + count + `···` + add, one row | The option chip alone at rest; `···` and `+` on hover; **no count on desktop** |
| `spec.md` A2..A5, A8..A10, A12, A13 | *"owed to T001"* | Measured, §2a and §3 |
| `spec.md` A3 | *"an optional image region on the card"* | The **control** is measured; the **rendered cover** is design inferred |
| `spec.md` A6 | *"the control that adds a group column"* | **No such control exists.** A column is a group option; the surface is `054`'s |
| `spec.md` A11 | *"what an empty group column renders"* | **Not seen** in any of the twenty files. Design inferred from `047` |
| `spec.md` section 12 Q1 | open — does the phone adopt the desktop geometry | **Closed.** The phone board is captured and carries its own values |
| `spec.md` section 12 Q2 | open — do the five uncaptured extensions retire | **Narrowed to three.** WIP counts and touch menus have counterparts; §7 |
| `spec.md` §4 migration table | 11 rows *"owed to T001"*, 3 *"retire or fold, T003"* | **Filled**, §4. Zero `unknown`; the three `retire or fold` rows carry their evidence and stay T003's |
| `checklist.md` C1 | 0 of 13 | **13 of 13**, each with a capture filename and a measurement or a labelled inference |
| `checklist.md` C2 | no table exists | The table exists, §4, 24 rows, 0 `unknown` |
| `checklist.md` C4 | scrollbar absent, geometry quoted from `050` | Geometry **re-measured independently** and confirmed; the colour decline gains **1.70:1** |
| `checklist.md` C8 | page limit *"T002 records"* | The Anytype side is **10**, confirmed off the capture with its full option set |
| `decision-record.md` | ADR-002's one known decline | **Four accessibility declines and one platform decline**, each with its ratio — ADR-004 |
| `acceptance-criteria.md` AC-001 | Unmet | **Met.** AC-002 stays Unmet: §4 fills `spec.md`'s table, and the spec edit lands with it, but AC-002's own threshold is the spec document, not this one |

**The three counts stay red and are not touched by this leg.** 39 constructed `pm-*` classes, 23
`pm-kanban-*` stylesheet rules and 7 default-off affordances are all still true at `3cf8aa2c`; this
document changes what they will be replaced *with*, not how many there are. T002 owns the rest of
the red-first pass.
<!-- /ANCHOR:changes -->

---

<!-- ANCHOR:rollup -->
## 9. ROLL-UP: SEEN, NOT SEEN, AND THE FIVE WITH NO CAPTURE

**Files opened: 33 of the 62.** All 20 set captures (ten use cases × two themes, every one scanned
programmatically for the option palette and the empty-column check, four opened as images); 7 menu
files (column menu light/dark/`-full` ×2, card menu dark, layout base/group-by/cover/page-limit
dark); 6 mobile files (board light/dark, three sheets dark, column-menu sheet dark). The 29 not
opened are the `-light` twins of menus whose light values were sampled programmatically from their
clipped pair, and the three card sub-menus (`-add-link-to-object`, `-add-to-collection`,
`-change-type`), which A12 records by name from the parent menu's chevron rows and which no element
in §4 depends on.

**Eight elements are seen and measured:** A1, A2, A4, A5, A8, A9, A10, A12, A13 — nine, counting
A13's page-limit panel.

**Five carry *design inferred from source code, not seen*, and are not softened anywhere in this
document:**

1. **A3's rendered cover** — the setting is captured, the result is not.
2. **A6's column add** — there is no such control to see; §5 C5.
3. **A7's drag affordances** — no capture in the 62-file set holds a drag; the README says so and
   this read confirms it.
4. **A11's empty column and its deleted-relation twin** — all six visible columns in all ten dark
   captures carry a card; neither state exists in the sweep.
5. **What renders past the page limit** — no captured column exceeds 10 records in a way the
   viewport shows.

**Nothing in this document is a DOM reading.** `054` ADR-005 allows a measurement-only leg to record
*"pixel read owed"* instead of substituting one; no row needed it, because every measured value came
off a PNG.

**Motion is `050` §4's reconciled band, unchanged and labelled.** No static capture carries timing,
and that has not changed for the board.
<!-- /ANCHOR:rollup -->

---

## RELATED DOCUMENTS

- **Feature Specification**: See `spec.md` (section 4's anatomy and migration table are this document's output)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md` (this is T001's output; T002 and T003 remain open)
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decision Record**: See `decision-record.md` (ADR-004 is this read's refusal list)
- **The 050 design read**: See `../050-anytype-adoption/design-trueup.md` (REQ-003 is the scrollbar)
- **The 051 design read**: See `../051-modal-and-sheet-componentization/design-trueup.md` (ADR-007 is the parity posture; §2 is the scale)
- **Capture index**: See `screenshots/anytype/README.md`
- **Sheet grammar**: See `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: See `../048-stacked-sheets/spec.md` §4
- **Card properties**: See `../045-board-card-properties/spec.md`
