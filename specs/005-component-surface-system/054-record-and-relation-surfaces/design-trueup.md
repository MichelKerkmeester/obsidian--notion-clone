---
title: "Design True-Up: The Seven Record and Relation Behaviours Against the Object-Page Menus, the iOS Panel and the Grid Captures"
description: "One row per §5B behaviour plus the S9 editor taxonomy: the Anytype screen it was designed against or the named gap, the pixel and point values read off that screen, what our tree does today with file:line, and where the capture contradicts the packet's own draft."
trigger_phrases:
  - "054 true-up"
  - "record surface true-up"
  - "relation row design"
  - "property row anatomy"
  - "capture alignment"
  - "T001 capture read"
importance_tier: "high"
contextType: "research"
---
# Design True-Up: The Seven Record and Relation Behaviours

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This is T001's output and goal D1's gate. Method is `../050-anytype-adoption/design-trueup.md`'s
> and `../055-states-feedback-and-motion/design-trueup.md`'s, unchanged: **measure, then decide.**
> Every value below was read off a file in `screenshots/anytype/`, off a file in
> `screenshots/notion-clone/`, or off a line in `src/` or `styles.css`. Nothing is carried over from
> `047`'s research unless it is labelled as such, and `050`'s restated thresholds for items 6, 9 and
> 11 bind here rather than `050`'s originals.

---

<!-- ANCHOR:headline -->
## 1. THE HEADLINE, BEFORE THE TABLE

Three things changed, and the first one invalidates the sentence A2 is built on.

**There is no "type icon on the left, value on the right" relation row, on either platform.** A
per-pixel scan of the desktop properties panel returns labels beginning at **x 50, every row**, and
values beginning at **x 84, 121, 122, 135, 143, 146, 149 and 153** — each one starting 12px after
its own label ends, none of them aligned to anything. The iOS panel does hold a column, but it holds
it on the **left edge of the value** (x 522px → **174pt**, identical on all fourteen rows), not on
the right. And **neither platform draws a format icon on a property row at all.** The format icons
`050` found in the filter picker belong to pickers and to the type's *property editor*; they have
never been part of a value row.

Meanwhile our own desktop record sheet **right-aligns** every value (`styles.css:10161`,
`text-align: right`), which no captured Anytype surface does on either platform. Measured on our own
capture: labels at x 59 on every row, values ending at x 379 on every row and *starting* at 273,
311, 319, 343, 349 and 362. A ragged left edge down the one column a reader scans.

**The desktop and the phone are two different designs, not one design at two widths.** Desktop is a
**card per property** — `#1E1E1E` fill, 288px wide, 46px for one line and 70px for two, 8px apart,
no dividers — in which the value **flows inline after the label and wraps underneath it** when it
does not fit. iOS is a **fixed two-column list** — no card, no fill, a 1px divider every 48.33pt, the
label truncated with an ellipsis rather than allowed to wrap. This is the same platform-split shape
`055` recorded for destructive treatment (its C3), and the packet's §5D called the iOS panel "S1's
exact analogue" while treating the desktop panel as the same thing.

**A4's premise is absent from the product.** `anytype-mobile-sheet-object-properties-settings-dark.png`
shows the split §5D warned about: **Header** (Object type, Tag, Backlinks) versus **Properties
panel** (everything else), a `+` on the second section header, a drag handle on every row, and **no
count, no collapse and no toggle anywhere.** Membership is changed by dragging a row between
sections. There is no hidden-properties group to adopt, on either platform.

And one finding that is ours, not Anytype's: the packet asserts a **type-list census of 3** while
the third list is not a list at all but a filter — `property-type-conflict-modal.ts:377-380` returns
9 of our 13 types for a normal writer and 5 for a computed one. Fixed below, measured.

### Where the evidence wins, in one list

Nine contradictions, each resolved in the evidence's favour per this task's rule, each expanded in
its row and each carried into `decision-record.md` ADR-004.

| # | The draft or `047` says | The captures or the source show | Row |
|---|---|---|---|
| C1 | A2: **type icon + name on the left, value on the right** | No format icon on a property row on either platform. Desktop flows the value 12px after the label; iOS holds a fixed **left** edge at 174pt. Nothing is right-aligned | A2 |
| C2 | A2: **the label never wraps under the value** | True on iOS, where the label truncates to hold its column. **False on desktop**, where a long value wraps to a second line *below* the label inside the same card (46px → 70px) | A2 |
| C3 | A4: **hidden relations collapse into a labelled group with a count** | No group, no count, no collapse. The split is **Header vs Properties panel**, both always open, membership changed by drag | A4 |
| C4 | A5, at landing: **design inferred from source code, not seen** | **Seen**, on the phone. `Add property` opens a search field placeholded **"Search or create new"**, then `Properties formats` (11), then `Existing properties` — formats **first**, which is the opposite of the row's order | A5 |
| C5 | A3: an empty relation shows **an add affordance** | **Three answers, one per surface density.** Grid cell: nothing at all. Property list: a format-specific action prompt. Opened editor: a full empty state with illustration, title, body and a `Create` button | A3 |
| C6 | §5D: the iOS panel is **S1's exact analogue** and the desktop panel is the same design | Two designs. Card-flow versus fixed-column-with-dividers. Neither is a narrowing of the other | A1, A2 |
| C7 | REQ-005 / AC-005: the type list exists **3 times** | Twice, plus a **filter**. `create-property-modal.ts:48-52` is 13 types; `property-type-conflict-modal.ts:377-380` returns a 9-of-13 or 5-of-13 subset. Anytype ships **one unfiltered list** in both its picker surfaces | A6 |
| C8 | A6: the picker **offers every format** | Confirmed, and it is **search-first** on both platforms — `Filter Types…` on desktop, the same 11-row list with the current format **ticked** on the phone. The row did not say search | A6 |
| C9 | Our tree renders select and multi-select values **the same way** (filled pill) | Anytype separates them on **both** platforms: single-select is **coloured text, no chip**; multi-select is a **filled tinted chip**. Selection is a check for one and an **ordinal number** for the other | A2, S9 |
<!-- /ANCHOR:headline -->

---

<!-- ANCHOR:method -->
## 2. HOW THE EVIDENCE WAS READ

**Three evidence classes, and they answer different questions.** The 25 `anytype-menu-object-*`
captures answer *what does the desktop object page do*; the 12 `anytype-menu-cell-*` captures answer
*what does a grid cell editor do*; the iOS set answers *what does this look like on the form factor
the record sheet actually ships on*. A desktop still cannot answer a phone question and the reverse
is equally false — §5D's own caveat, and C6 is what happens when it is ignored.

**Scale.** The desktop menu captures are 1 device pixel to 1 CSS pixel, per `050` §2's proof, and
they are **clipped to the menu itself** (the properties panel is a 356 × 1217 file, not a window).
The iOS captures are **1206 × 2622 at 3×**, so every phone figure is stated in **points** (pixels ÷
3) with the raw band beside it, per `055` §2. Our own `constructed-record-detail-mobile-dark.png` is
**804 × 1748 at 2× — 402 × 874 CSS**, the same 402pt width as the iOS simulator, so the two are
directly comparable without conversion. That coincidence is what makes the label-column comparison
below quotable rather than approximate.

**Colour and contrast.** Sampled with a per-pixel scan, never by eye, and every ratio recomputed
from the sampled RGB. The scan is what turned "the select options are coloured pills" into a
measured **transparent** fill — the pill interior samples `#171717`, the popover's own background,
63 to 75 times out of 95 columns. Reading that as a chip would have carried a false badge treatment
into P2.

**What no capture in the sweep contains.** No hidden-properties group and no property count, on
either platform. No board card with an add-property affordance. No record sheet rename in progress.
No desktop deleted-source state. And no formula, rollup or aggregation anywhere in 869 files, which
is A7's evidence by omission and is exactly what `screenshots/anytype/README.md` predicted.

### The measured desktop property row, as one table

Read from `menus/anytype-menu-object-properties-panel-dark.png` (356 × 1217, dark).

| Property | Measured value | Where |
|---|---|---|
| Panel background | **`#171717`** | rgb(23,23,23), matching `050`'s popover background exactly |
| Panel border | **1px `#292929`** | x 20, matching `050` |
| Property card fill | **`#1E1E1E`** | rgb(30,30,30) |
| Card contrast against the panel | **1.08:1** | The card is a grouping device, not a state indicator |
| Card box | **288px wide**, x 35..322 in a 356px frame | 14px inset from the panel's content edge |
| Card height, one line | **46px** | y 52..97 |
| Card height, two lines | **70px** | y 214..283 (`Summary`) — +24px for the wrapped value line |
| Gap between cards | **8px** | card bottom 97 → next card top 106 |
| Label x | **50, every row** | 15px into the card |
| Label → value gap | **12px**, every row | 123→135, 72→84, 141→153, 136→149, 110→122, 108→121 |
| Value x | **varies: 84, 121, 122, 135, 143, 146, 149, 153** | There is no value column |
| Value icon → text gap | **7px** | Assignee 173→180 |
| Label colour | **`#A3A3A3`**, **6.61:1** on the card | The secondary grey `050` measured |
| Value colour | **`#E1E1E1`**, **12.75:1** on the card | The primary `050` measured |
| Empty-value placeholder | **`#5C5C5C`**, **2.49:1** on the card | Refused below |
| Label and value type size | **identical**, 14px cap-to-descender extent for both | Hierarchy is colour, not size |
| Format icon on a property row | **none** | Scanned all 20 rows |

### The measured iOS relations panel, as one table

Read from `mobile/anytype-mobile-sheet-object-properties-dark.png` (1206 × 2622 at 3×).

| Property | Measured value (points) | Raw | Where |
|---|---|---|---|
| Sheet background | **`#1C1C1E`** | rgb(28,28,30) | iOS system dark secondary |
| Sheet top | **62pt** | y 186 | |
| Grab handle | **36 × 4.7pt**, 6pt below the sheet top | x 549..656, y 204..218 | |
| Title | centred, bold, **16.7pt** cap extent | y 288..337 | `044`'s header |
| Row pitch | **48.33pt** | 145px, constant across 13 dividers | Above the 44pt iOS floor |
| Divider | 1px `#3A3935`, **1.47:1**, inset **20pt each side** | x 60..1145 | A separator owes no contrast floor |
| Label x | **20.7pt** | 62 | |
| Label column clip | **154pt** | 462 | Labels truncate with `…`; they never wrap |
| Value x | **174pt, every row** | 522..527 | A real fixed column |
| Label → value gutter | **20pt** | | |
| Label colour | **`#909090`**, **5.33:1** | | |
| Value colour | **`#F3F3F3`**, **15.33:1** | | |
| Empty-value placeholder | **`#646464`**, **2.88:1** | | Refused below |
| Single-select value | **coloured text, no chip** — `High` at `#E6BF70`, **9.76:1** | y 2415..2485 | |
| Multi-select value | **filled tinted chips** | `Labels` row | |
| Format icon on a property row | **none** | | |

### The measured option-colour system

Anytype's option palette is the one thing in this sweep that passes every contrast check, and it
passes because of *how* it is built rather than by luck.

| Surface | Treatment | Sampled pairs | Ratio |
|---|---|---|---|
| **Single-select**, desktop editor | Neutral **transparent** pill, 1px `#272727` border, **the text carries the colour** | `#EBD739` · `#A8A8A8` · `#E9AB34` · `#E46244` on `#171717` | **12.22 · 7.54 · 8.83 · 5.23** |
| **Single-select**, iOS editor | Coloured text on the sheet, no pill at all | `#FF9D7D` · `#E6BF70` · `#9A9A9A` · `#E0D56C` on `#1F1F1F` | **8.14 · 9.46 · 5.86 · 10.91** |
| **Multi-select**, both | **Dark tinted fill + light tinted text of the same hue** | `#EFA8C7`/`#451328` · `#FBF1A0`/`#6C621A` · `#EBA591`/`#451209` · `#C8C8C8`/`#414141` · `#F7D080`/`#572E0B` | **8.06 · 5.35 · 7.68 · 6.10 · 7.93** |

**Every pair clears 4.5:1.** The mechanism is the pairing rule — a fill and a text tint drawn from
the same hue at opposite ends of its ramp — not the hues themselves. That rule is adoptable in a
themed host where the hues are not.

### The measured editing signal

| Property | Measured value | Where |
|---|---|---|
| Edited-cell ring | **2px `#6E9EFC`**, **6.79:1** on the cell | `menus/anytype-menu-cell-text-dark.png` x 34..35, y 34..35 |
| Editor placement | Hangs directly off the ringed cell, **no gap** | All 12 `menu-cell-*` captures |

`050` refused Anytype's **selection** signal at 1.14:1. Its **editing** signal measures 6.79:1 and
carries a shape (a ring) as well as a hue. One product, two answers again, and this is the half
worth taking.
<!-- /ANCHOR:method -->

---

<!-- ANCHOR:behaviours -->
## 3. THE SEVEN BEHAVIOURS, ROW BY ROW

Each row carries the same six things: whether the surface was **seen**, the files, what the real
screen does, what our tree does today, the values that change, and the phone disposition.

---

### A1 — Object-page header block: icon, title, featured relations under the title

**Seen, on both platforms, and they agree.**

**Captures.** `anytype-object-page-empty-dark.png` (desktop, 1440 × 900);
`mobile/anytype-mobile-object-page-dark.png`; `menus/anytype-menu-object-featured-tag-dark.png`
(the featured block opened).

**What the real screen does.** A large title — measured **34px** cap height on desktop, bold — and
directly beneath it a single line of **featured relations rendered as inline text separated by
middot**: `Page · Tag` on desktop, `Project Tracker · Tag · 1 backlink` on the phone. Not rows, not
chips, not a grid. Unset featured relations render their **label** in the secondary grey (`Tag` is
the property's name, not its value), and clicking one opens an editor in place —
`menu-object-featured-tag-dark.png` shows the `Tag` card opening with a `Filter or create options…`
search field and a `Type to create a new option` hint below it.

The body region below carries **no properties at all**. On desktop the properties live in a docked
right-hand panel reached from `#header .icon.headerRelation`; on the phone they live in a sheet
reached from the `···` menu. The object page itself is title, featured line, body.

**What we do today.** `record-detail-panel.ts:348-386` builds a header of record icon + title +
open-note + close, then `:390` opens `db-record-detail-fields` and renders **every** property as a
row. There is no featured line and no distinction between a property that belongs above the fold and
one that does not.

**Values that change.**

| Was | Is |
|---|---|
| "S1's header becomes P1 with the property list reading as the page under the header" | Confirmed as the direction, and **narrowed**: what makes it read as a page is the **featured line**, one inline row of middot-separated relations directly under the title, not the property list's own styling |
| Featured-relation treatment unspecified | **Inline text, middot-separated, secondary colour, one line, immediately under the title.** An unset featured relation shows its **label**, and clicking it opens the same editor an occupied one opens |
| Title size unspecified | **Ours.** Anytype's 34px desktop title is a full-page object title; S1 is a panel and a sheet, and `design-system.md` §5 already owns panel type. No number is taken |
| — | **Adopt** the placement rule the captures make plain: properties are **not** on the object page. Ours are, and that is a deliberate divergence — S1 *is* the properties surface — so P1 keeps them. Recorded so the divergence is a decision rather than an oversight |

**Phone.** Relevant. The iOS object page carries the featured line at the same place and adds
`1 backlink` to it, which is a count in text — the second signal `050` praised in our filter badge.
No sheet opens from the header itself, so neither `044` nor `048` binds to this row.

---

### A2 — Relation row layout: label, value, one row per relation, in-place editing

**Seen, on both platforms, and it contradicts the row on both halves. This is the packet's most
consequential row.**

**Captures.** `menus/anytype-menu-object-properties-panel-dark.png`;
`mobile/anytype-mobile-sheet-object-properties-dark.png`; the seven
`menus/anytype-menu-object-relation-*-dark.png` editors; all 120 catalogue grid captures.

**What the real screens do.** §2's two tables carry the numbers. The design, in one sentence per
platform: **desktop is a card per property in which the value flows 12px after the label and wraps
underneath it**; **iOS is a fixed two-column list with a 48.33pt row, a full-width hairline between
rows, a value column pinned at 174pt and a label that truncates rather than wraps.**

**The three contradictions (C1, C2, C9).**

- **No format icon on a value row.** Scanned all 20 desktop rows and all 14 iOS rows. The icons in
  `anytype-mobile-sheet-object-properties-settings-dark.png` — `≡` for text, `#` for number, an
  envelope for email, a phone glyph, a link glyph, a calendar — are on the **type's property
  editor**, which manages properties. The picker rows carry them too. The value row never does.
- **Nothing is right-aligned.** Desktop has no value column at all; iOS pins the value's **left**
  edge.
- **Single-select and multi-select are drawn differently.** iOS `Priority` renders `High` as
  **coloured text**; iOS `Labels` and the desktop `Labels` card render **filled tinted chips**. The
  desktop select *editor* uses a transparent outlined pill and the multi-select editor a filled
  chip. Two formats, two treatments, consistently, on both platforms.

**In-place editing, which is the half the row got right.** All seven desktop relation editors open
against the property card itself. Their shapes are in §4's taxonomy; the point for A2 is that the
card is the anchor and the editor hangs off it with a 2px `#6E9EFC` ring on the anchor.

**What we do today.**

- Desktop: `styles.css:10317-10332` — `display:flex; align-items:baseline; gap:8px; padding:4px 6px`,
  label `min-width:72px; flex-shrink:0; color:var(--text-muted); font-size:var(--font-smaller)`,
  value `flex:1`. The value's `text-align:right` is **inherited from the board card**
  (`styles.css:10161`, `.db-board-card-value { text-align: right }`), and badges are pushed to the
  right by `justify-content: flex-end` at `:10177`. Measured on
  `constructed-record-detail-desktop-dark.png`: labels at x 59 on every row, values ending at x 379
  on every row, starting anywhere from 273 to 362.
- Mobile: `styles.css:10462-10474` — label **`flex: 0 0 96px`** with `overflow:hidden;
  text-overflow:ellipsis; white-space:nowrap`, and `:10477-10481` sets the value `text-align:left` at
  `--db-font-lg` (16px). Measured on `constructed-record-detail-mobile-dark.png` (402 CSS px wide,
  the same width as the simulator): label at 25.5px, **value at 130px on every row**.

So **our phone already ships Anytype's iOS model** — a hard fixed column, truncation over wrapping,
left-aligned values, a `--db-border-subtle` hairline between rows (`styles.css:10475`). The defect is
on the desktop, and it was never a record-sheet decision: it is a board-card rule reaching a surface
that is not a board card.

**Values that change.**

| Was | Is |
|---|---|
| "P2's anatomy is exactly this: type icon + name on the left, value on the right" | **Both halves wrong.** No type icon on a value row on either platform; nothing right-aligned on either platform. P2's anatomy is **label, then value, value left-aligned** |
| Desktop value alignment | **Left.** Scope the change to the record sheet: add a `text-align: left` override beside the existing mobile one at `styles.css:10477`, and **do not touch `styles.css:10161`** — the board card keeps right-alignment, because a 2-line-clamped card summary is the one place it reads correctly, and `board-renderer.ts` carries the `038` PM 1:1 parity (goal D5, D7) |
| Desktop label size | **Equalise with the value.** Anytype draws both at one size on both platforms and separates them by colour alone. Our desktop label is `var(--font-smaller)` against an inherited value size — two signals where the measurement uses one, and the label column is fixed-width anyway so the smaller size buys no space |
| Mobile label size | **Unchanged, and the reason is a platform constraint, not a preference.** `styles.css:10479` sets the value to `--db-font-lg` (16px) because below 16px iOS zooms the page when the cell becomes an input; the label at `--db-font-base` (14px) is the consequence. A measurement does not outrank a hard platform floor |
| Mobile label column | **Keep `flex: 0 0 96px`.** Anytype's is **154pt** on the same 402pt width, but its label population carries a parenthesised type suffix (`Confidence (Project Tracker)`) that ours does not, and 96px is an established project value with its reason written above it. `055`'s precedent for `--db-motion-fast` governs: an established value beats a neighbouring measurement of a different population |
| Row pitch | **Ours.** Anytype's 48.33pt clears our `--db-sheet-row-min-height: 44px` (`styles.css:10415`), so there is no conflict to resolve — 44px is `044`'s floor and stays the floor |
| Option badge treatment | **Split it, per C9.** Single-select renders as coloured text; multi-select renders as a filled chip. Today `renderBadge` (`record-detail-panel.ts:642`) gives both a `status-badge`. What we keep is our **palette**; what we adopt is the **format distinction** and the pairing rule that makes it legible |
| "Option badge colours stay ours" | Unchanged as ownership, **with a floor attached**: every option pair must clear **4.5:1**, which Anytype's do (5.23–12.22 single, 5.35–8.06 multi) by pairing a dark tinted fill with a light tint of the same hue |

**Phone.** This row is largely already satisfied on the phone and largely unsatisfied on the desktop
— the inverse of the packet's assumption. Nothing opens from a row itself, so `044` does not bind
here; the editors a row opens are S9's and are `048`'s stacked pairs.

---

### A3 — Empty value affordance

**Seen, three times, and the answer is not one affordance (C5).**

**Captures.** `mobile/anytype-mobile-sheet-cell-multiselect-empty-dark.png`;
`mobile/anytype-mobile-sheet-cell-email-empty-dark.png`;
`mobile/anytype-mobile-sheet-grid-cell-objecttype-empty-dark.png` (read by `055` as
`empty.no-source`); `menus/anytype-menu-object-properties-panel-dark.png`;
`menus/anytype-menu-object-relation-file-dark.png`; the 120 catalogue grids.

**What the real screens do — a three-rung ladder keyed to surface density.**

| Surface | Empty treatment | Evidence |
|---|---|---|
| **Grid cell** | **Nothing.** No placeholder, no glyph, no affordance | Bellwether Capital's `Call notes`, Highfield Sports's whole row, in `anytype-crm-contacts-deals-grid-dark.png` |
| **Property list** (desktop card and iOS row) | A **format-specific prompt naming the action**, in the placeholder grey | `Select options`, `Select option`, `Enter number` (desktop); `Select options`, `Add email` (iOS) |
| **Opened editor** | A **full empty state**: illustration, title, body, action button | `No options` / `Nothing found. Create first option to start.` / `Create` |

The third rung's measurements: illustration `#3F3F3F` at 1.57:1 (decorative), title `#F3F3F3` at
**14.85:1**, body `#909090` at **5.16:1**, `Create` label `#F3F3F3` at 14.85:1. And the file
relation's version of the same rung is leaner and better — `No Objects found` over a divider over a
`+ Add` row, which is the **default-row** answer `055` recorded rather than a card.

**The copy distinction worth stealing.** The empty email *row* reads **"Add email"**; the editor it
opens has the placeholder **"Enter email"**. The row prompts the action, the input prompts the
entry. Two strings, deliberately different.

**What we do today.** `getEmptyDisplayValue` (`record-detail-panel.ts:636`) returns
`t("common.empty")` for everything except checkbox, and `src/i18n.ts:77` defines that as the literal
word **"Empty"** — one word for eleven formats, naming the absence rather than the action. Confirmed
rendered on `constructed-record-detail-desktop-dark.png` and `-mobile-dark.png` (the `date` row).
This is AC-004's red and it is observable exactly as written.

**Values that change.**

| Was | Is |
|---|---|
| "empty rows render the affordance instead of the word 'Empty'" | Right about the word, **wrong about the affordance**. What replaces it is a **format-specific prompt naming the action** — the second rung — not a `+` button. `Select options`, `Add email`, `Enter number`, one string per format |
| One empty treatment | **Three, by surface density.** REQ-004 scopes to the record sheet and board cards, which is the second rung, and the grid keeps rendering nothing. Recorded so nobody carries the prompt into a table cell, where the captures show blank is correct |
| The affordance's contrast | **Anytype's placeholder greys are refused**, both of them — desktop `#5C5C5C` at **2.49:1**, iOS `#646464` at **2.88:1**. A prompt that names the only way to fill a field is normal text and owes 4.5:1. Ours uses `db-card-empty-placeholder` (`card-field-renderer.ts:119`) and must be measured against that floor, not against Anytype's |
| The editor's own empty state | **`050` item 9's vocabulary, not a fourth grammar.** `055` already adopted the three-tier ladder into `empty-state-renderer.ts`; the file relation's `No Objects found` + `+ Add` is the **default-row** form `055` recorded and is what an editor with a create path should use |
| Board cards gain the affordance? | **Yes for the prompt, no for a button.** A card field already renders through `renderCardField` with `is-empty-field`; giving it the format prompt costs one string lookup and keeps SC-001's "identical on every surface" true. See §5 |

**Phone.** Relevant, and it is where all three rungs were captured. The prompt renders inline in the
row, so neither `044` nor `048` binds; the editor it opens is S9's and is a registered stacked pair.

---

### A4 — Hidden relations group with a count

**Not seen. The surface exists and does something else entirely (C3).**

**Captures.** `mobile/anytype-mobile-sheet-object-properties-settings-dark.png`.
**Not captured, because it does not exist:** any collapsed property group, any property count, any
disclosure toggle, on either platform.

**What the real screen does.** A sheet titled `Properties` with a banner reading `You're editing type
🧩 Project Tracker`, then two labelled sections: **`Header`** holding Object type, Tag and Backlinks,
and **`Properties panel`** holding the remaining fourteen, with a `+` on that section's header row.
Every row is `format icon · label · drag handle`. Both sections are always expanded. Nothing is
counted and nothing collapses.

So Anytype's axis is **where a property appears** (header versus panel), changed by dragging a row
across a section boundary. Ours is **whether it appears** (`showEmptyFields`, and the view's hidden
columns). These are different models, and §5D was right to flag it.

**What we do today.** The peek has the group — `table-record-peek.ts:259-278` builds
`db-record-peek-hidden-group` with an `aria-expanded` toggle whose label is
`t("panel.hiddenProperties")`, defined at `src/i18n.ts:549` as **"Hidden properties"** with **no
count**. The record sheet has nothing: `record-detail-panel.ts:387-396` filters empties wholesale on
`config.showEmptyFields`.

**Values that change.**

| Was | Is |
|---|---|
| "REQ-003: P5 on the record sheet, fed by the columns the view hides" — adopted from `anytype-properties-official.jpg` | **Not adopted from anything.** There is no Anytype hidden group to copy. REQ-003 is **ours**, and it should say so; the marketing JPEG the row cited is not evidence of a shipped surface |
| The count | **Ours too, and worth keeping** for the reason `050` gave the filter badge: a number is a text second signal, and `panel.hiddenProperties` carries none today. Adding it to the peek's existing string is the smallest form of the change |
| The primitive's shape | **Take the peek's**, unchanged. `table-record-peek.ts:259-278` is a working disclosure with correct ARIA; P5 is that code moved, not redesigned. `045`'s mechanism-preservation posture applies |
| — | **Record the model difference** rather than resolve it. Anytype's Header/Properties-panel split is a *type-level* authoring decision; ours is a *view-level* visibility decision. Adopting Anytype's would mean a type system, which goal D6 and `050`'s D6 both put out of scope |

**Phone.** Relevant. The group renders inline in the sheet body, so `044` does not bind. Its rows are
`44px` minimum by `--db-sheet-row-min-height`, inherited.

---

### A5 — Add-relation search-first picker

**Seen, on the phone, and it flips the row's landing correction back (C4). It is also better
evidence than the source read it replaced.**

**Captures.** `mobile/anytype-mobile-sheet-relation-add-dark.png`;
`mobile/anytype-mobile-sheet-relation-new-dark.png`;
`mobile/anytype-mobile-sheet-relation-new-format-dark.png`;
`menus/anytype-menu-object-featured-tag-dark.png`;
`menus/anytype-menu-object-relation-multiselect-dark.png`;
`menus/anytype-menu-object-type-picker-change-type-dark.png`.

**What the real screen does.** `Add property`, centred and bold. Then a filled search field whose
placeholder is literally **"Search or create new"** — one control carrying both jobs, which is the
whole of A5 in one string. Then a section header `Properties formats` and **eleven format rows**, and
below them a second section header `Existing properties`. Rows are `format icon · label`, pitch
**52.33pt**, icon column at 23pt and **18pt** wide with a **14pt** glyph, label at 54.7pt, dividers
inset 20pt each side.

**Search-first is not one surface's habit; it is the product's picker grammar.** Four independent
captures: `Search or create new` (add property), `Filter or create options…` (featured tag),
`Type to create a new option` (multi-select relation), `Filter Types…` (change type). Every picker
opens with a text field and every one of them folds create-new into it.

**The ordering correction.** The row says the picker offers "existing properties and create new".
The capture puts **formats first and existing properties second**. That is the right order for the
question the control answers — you are adding a property, so what kind matters before which one —
and it is the opposite of what the row assumed.

**What we do today.** `column-manager-renderer.ts:164-198` renders an add row; `create-property-modal.ts`
is a form with a label field, a key field and a type dropdown. There is no search, and `create` is a
separate destination rather than a fall-through from a query.

**Values that change.**

| Was | Is |
|---|---|
| "**design inferred from source code, not seen**" (landing correction, 2026-09-05) | **Reverted. Seen**, on the phone, in three captures. The landing note was right about the desktop filter panel and wrong to generalise from it |
| "a search-first picker offering existing properties and 'create new'" | **Order inverted**: search field (carrying create) → **formats** → existing properties |
| The create affordance | **In the search field's placeholder**, not a separate row. `Search or create new` — typing a name that matches nothing *is* the create path |
| Picker row geometry | **52.33pt row, 18pt icon box with a 14pt glyph, icon at 23pt, label at 54.7pt, dividers inset 20pt.** Ours are `--db-sheet-row-min-height` 44px minimum, which clears it |
| "the format-icon vocabulary is adopted and is the part the captures actually support" | Still true and now **placed**: format icons belong to **pickers and the property-management surface**, never to a value row (C1). We already have `property-type-icon.ts`; this row decides where it may be used |
| S3's `QUICK_ADD_FILE_FIELDS` quick-add row | **Stays, beside the picker** — the packet's proposed answer, now with a reason from the captures: Anytype's picker leads with **formats**, and a quick-add row for a fixed set of file fields is a shortcut past the format question, not a competitor to it. See §5 |

**Phone.** This row *is* the phone row. The picker is a sheet over the properties sheet, so `048`
binds — and see the stacking note in §6, which is `048`'s to resolve and not this packet's.

---

### A6 — Type change flow, and the one type list

**Seen, on both platforms. Confirmed, extended by search, and it exposes a census error of ours (C7,
C8).**

**Captures.** `menus/anytype-menu-object-type-picker-dark.png`;
`menus/anytype-menu-object-type-picker-change-type-dark.png`;
`mobile/anytype-mobile-sheet-relation-new-format-dark.png`; `menus/anytype-menu-cell-type-dark.png`
(clipped off-frame — the one capture in this row that could not be read, and the `-full` variant
shows the same menu the object-page capture does).

**What the real screens do.** On desktop the type opens a two-row menu — `Open type` and
`Change type ›` — and the submenu is a **search-first picker**: `Filter Types…` over a `My Types`
section over the type list, each row `icon · name`, with the preselected row on a lighter fill. On
the phone, `Select property format` lists the **same eleven formats in the same order** as the
add-property picker, with the current one carrying a **right-aligned checkmark**.

**One list, twice, unfiltered.** Relation object · Text · Number · Select · Multi-select · Date ·
File & Media · Checkbox · URL · Email · Phone number. Identical content, identical order, in the
add-property picker and in the change-format picker.

**What we do today, and the census correction.** `create-property-modal.ts:48-52` declares
`PROPERTY_TYPES` — **13**: text, number, date, datetime, currency, checkbox, select, multi-select,
status, computed, relation, rollup, files. `property-type-conflict-modal.ts:377-380`'s
`getTypeOptions` is **not a second list**: it returns a **filtered subset** of ours — 9 for a normal
writer, 5 for a computed one. And `column-menu.ts`'s type submenu is the third site.

So AC-005's "3 lists" is one list, one filter and one submenu. The distinction matters because the
fix differs: two lists get merged, whereas **a filter gets replaced by a gate**.

**Values that change.**

| Was | Is |
|---|---|
| "P7 is the one list behind the column-menu type submenu and every modal's type dropdown" | Unchanged as the goal |
| AC-005: "the census reads **1** type list (down from **3**)" | **Restated.** Today is **1 list + 1 filtered subset + 1 submenu**, not 3 lists. The threshold is observable as written only if the Today cell says what is actually there |
| The conflict modal's shortened list | **Replaced by a gate, not preserved.** Anytype shows every format in every picker and never hides one. Our own precedent agrees: `row-menu.ts` disables rather than removes, and its comment says why — *"disabled documents that the action exists but doesn't apply here"* (`050` REQ-008). A format missing from a dropdown is unexplainable; a disabled format carrying its reason is not |
| Picker interaction | **Search-first**, on both platforms and in all four picker captures. P7 carries a filter field |
| Current-value indicator | **A right-aligned checkmark** on the phone, a lighter row fill on desktop. Ours should carry the tick — a mark is a shape, a fill is a colour, and `050` refused a colour-only state at 1.14:1 |
| List order | **Ours.** Anytype's order is relation-first then scalars then contact formats, over a format set that has no currency, computed, rollup, status or files and has URL, email and phone that we lack. Half the list does not correspond; no order is taken |

**Phone.** Relevant. The picker is a sheet and `sheet-grammar` already registers
`settings dropdown field` as a stacked pair, so the mechanism exists.

---

### A7 — Formulas, rollups and aggregations stay ours

**Not seen, and the absence is the evidence.**

**Captures.** None, and the scan is the finding: across the 156 root captures, the 600 menu captures
and the 118 iOS captures there is **no formula, no rollup and no aggregation surface**. The 12
`menu-cell-*` editors cover checkbox, date, email, file, multi-select, number, object, phone, select,
text, type and url — eleven formats plus type, and none of them computed.
`screenshots/anytype/README.md` states the reason directly: *"formula and rollup carry no values, and
cannot. Anytype has neither."*

**What we do today.** `formula-modal.ts` (1,664 lines, fullscreen workbench),
`relation-rollup-config-modal.ts`'s 12 aggregations, the output-number-format editor.

**Values that change.** None. ADR-003 stands exactly as written, and this row is its confirmation
rather than its re-litigation. The only change any of these files takes from this phase is consuming
P7 for their existing type dropdowns (REQ-005) — a wiring change, and `formula-modal.ts` appears in
L5's file group for that reason alone.

**Phone.** Not applicable.
<!-- /ANCHOR:behaviours -->

---

<!-- ANCHOR:editors -->
## 4. S9 — THE EDITOR TAXONOMY THE PACKET DID NOT HAVE

§5D promised "one captured Anytype counterpart per format" and listed twelve phone screens. Reading
those plus the twelve desktop `menu-cell-*` and seven `menu-object-relation-*` captures collapses
them into **three shells**, which is the shape ADR-002's extraction should be read against.

| Shell | Formats | Desktop | iOS |
|---|---|---|---|
| **Value list** | select, multi-select, object/relation, file | Popover anchored to the ringed cell. Draggable option rows (`⋮⋮` handle). Object rows are `icon · name · trailing type label`. Empty → `No Objects found` + `+ Add` | Sheet: `Clear · title · +`, then `Search…`, then rows at **50pt** pitch. Object rows are **two-line** (`icon · name over type`) with a trailing radio |
| **Calendar** | date | Popover: `‹ Month Year ›`, Mo–Su heads, weekend columns on a lighter fill, selected day a **solid blue square**, footer `Today · Tomorrow · Clear` | Sheet: `Clear · title`, `May 2026 ›` opening a month picker, MON–SUN heads, selected day a **blue-tinted circle with blue text**, then three rows `Today` / `Tomorrow` / `Open selected date ›` |
| **Inline input** | text, number, url, email, phone | The card **becomes** the input: label on line 1, caret on line 2, 2px `#6E9EFC` ring. A URL relation instead opens an action menu — `Open in browser` / `Copy` | A short bottom sheet sized to its content: `[Clear ·] title` then the input. Email empty placeholds `Enter email` |
| **No editor** | checkbox | Toggles in place; the sweep's own script toggles and toggles back (`README.md:475`) | — |

**Three findings inside this that change work rather than describe it.**

1. **The selection indicator is format-dependent.** Single-select gets a **check**; multi-select gets
   an **ordinal number badge** — `mobile/anytype-mobile-sheet-cell-multiselect-team-dark.png` shows
   blue `1` and `2` on the chosen chips and empty outline circles on the rest. The ordinal preserves
   and displays selection *order*, and it is a text signal, which is the property `050` valued in our
   count badge. Adopted as a pattern for the multi-select editor.
2. **A checkbox needs no editor primitive.** ADR-002 counts ten extractions;
   `cell-renderer.ts:657-666` already handles checkbox by toggling (or by
   `openBulkCheckboxEditor` under a session) and never opens an editor. The extraction inventory
   should say nine editors and one toggle rather than ten editors.
3. **A URL is an action, not always an edit.** The desktop URL relation opens
   `Open in browser` / `Copy` rather than an input. We funnel URL through the text editor and open
   links from the value's anchor. Not adopted — our anchor already gives the reader both actions
   without a menu step — but recorded, because a future "why can't I copy this link" report has an
   answer here.

**What does not change.** ADR-002's rule is untouched: method bodies move unchanged behind
`CellRenderer.startEdit`'s pinned contract, one editor per leg, no behavioural edit inside a move.
Everything in this section is **target grammar to know before the move**, exactly as §5D said, and
none of it may be folded into an extraction leg.
<!-- /ANCHOR:editors -->

---

<!-- ANCHOR:inherited -->
## 5. THE THREE INHERITED 050 ITEMS, AND THE THREE OPEN QUESTIONS

### The 050 overlaps, at their restated thresholds

`050`'s `design-trueup.md` restated items 6, 9 and 11 against the tree, and those restatements — not
`050`'s originals — bind here, as §5C already says.

| Item | `050`'s restated threshold, binding | Confirmed on this tree | What this sweep adds |
|---|---|---|---|
| **6** — cell-editor anti-clip flip | **Design inferred from source code, not seen.** The 92px boundary is `047` §5's; the criterion that decides it is *no open editor's right edge exceeds the viewport's*, measurable on our own renderer | Unchanged. `popover-position.ts` still has the vertical flip and no horizontal branch | **A placement rule is now visible, and it is the anchor rather than the edge.** All 12 `menu-cell-*` captures show the editor hanging directly off the ringed cell with no gap, and the pickers in `050` §REQ-006 overlap their parent rather than clip. Still no boundary and no threshold: **the 92px figure keeps its source-derived label** |
| **9** — empty-state flavours | Twelve reasons already ship; **adopting Anytype's empty-state design is rejected — there is nothing to adopt**, narrowed by `055` to *desktop-scoped* | Confirmed: `empty-state-renderer.ts:24-36` | **A3's three-rung ladder is the value-level layer under `055`'s view-level one, and it must not become a third grammar** (§5C's constraint, honoured). The file relation's `No Objects found` + `+ Add` is `055`'s **default-row** form and is what an editor with a create path uses |
| **11** — `positionLock` | **Not seen, none possible.** The lock releases on commit or blur and repositions once; source-derived | Unchanged. No `positionLock` in `src/views` | Nothing. No capture shows a rename in progress on either platform, and none can. S1's title rename still goes through `editFileName` (`cell-renderer.ts` `startEdit`'s `file.name` branch) and inherits the lock when `050` lands it |

### The three open questions, answered

`spec.md` §10 and `goal.md` record three questions that resolve at T001. Each is answered from the
captures where the captures reach, and from our own tree where they do not.

**1. Does the record sheet's desktop anchored panel keep its current DOM under P1?**

**Yes — and the question is now partly out of this packet's hands.** The proposed answer stands
(desktop keeps today's DOM, asserted by the lane), with one addition: **the placement of that panel
is `006-record-open-target`'s, not P1's.** That packet's in-flight work in worktree
`085-record-open-dock` adds AC-014 and AC-015, whose measured red is a record panel drawn **72px tall
against a 900px viewport at `top 12 · bottom 84`** when the affordance carries no anchor, and whose
new threshold is `height >= 0.6 × pane.height`, a right edge within one 13px gutter of the pane's,
and `panel.top >= pane.top`, with the resolver returning a stated `anchored` or `docked` on every
path. **P1 changes the header's DOM and nothing about where the panel lands.** Any placement
assertion this packet's lane makes must read `006`'s field rather than measure a box, or the two
packets will assert different answers about one surface.

**2. Does P3's search-first picker replace S3's quick-add file-field row, or sit beside it?**

**Beside**, as proposed, and the captures give the reason rather than leaving it to preference.
Anytype's add-property picker leads with **`Properties formats`** — the format question comes first
and the existing-property list second. `QUICK_ADD_FILE_FIELDS` is a shortcut *past* the format
question for a fixed, known set, so it does not compete with the picker; it skips it. Two controls,
two jobs.

**3. Should the board card gain the add-property affordance (A3)?**

**No button; yes the prompt.** The captures separate these cleanly. A grid cell — the densest
surface — renders **nothing** for an empty value, and a board card is nearer a grid cell than a
property list. But the second rung, a format-specific prompt in the empty row, costs one string and
is what keeps SC-001's claim (*"a property reads identically on the record sheet, a board card, the
peek and the properties panel"*) true rather than aspirational. So: `renderCardField`'s
`is-empty-field` path gains the format prompt on both consumers, and **no add button lands on a
card**. This also keeps the change inside `card-field-renderer.ts`'s shim rather than reaching into
`board-renderer.ts`, whose `038` parity captures goal D5 protects.
<!-- /ANCHOR:inherited -->

---

<!-- ANCHOR:rollup -->
## 6. ROLL-UP

### Seen, not seen, and the one row with no capture at all

| Row | Surface seen? | Evidence | Phone-relevant |
|---|---|---|---|
| A1 object-page header block | **Seen**, both platforms | `object-page-empty`, `mobile-object-page`, `menu-object-featured-tag` | Yes |
| A2 relation row layout | **Seen**, both platforms, **contradicts on three points** | `menu-object-properties-panel`, `mobile-sheet-object-properties`, 7 × `menu-object-relation-*`, 120 grids | Yes — and already largely satisfied there |
| A3 empty value affordance | **Seen**, three rungs | `mobile-sheet-cell-multiselect-empty`, `-email-empty`, `-grid-cell-objecttype-empty`, `menu-object-relation-file`, the grids | Yes |
| A4 hidden relations group | **Not seen — proved absent** | `mobile-sheet-object-properties-settings` (a different model) | Yes |
| A5 add-relation search-first | **Seen**, on the phone; landing correction reverted | `mobile-sheet-relation-add`, `-new`, `-new-format`, + 3 corroborating pickers | Yes — this row *is* the phone row |
| A6 type change flow | **Seen**, both platforms | `menu-object-type-picker`, `-change-type`, `mobile-sheet-relation-new-format` | Yes |
| A7 formulas / rollups | **Not seen, and none can be** | Absence across 874 captures | No |
| S9 editor taxonomy | **Seen**, 31 captures, three shells | 12 × `menu-cell-*`, 7 × `menu-object-relation-*`, 12 iOS editors | Yes |

**Design inferred from source code, not seen: A4 alone**, and only in the sense that REQ-003's
hidden group has no reference screen — the surface that would have carried one was captured and does
something else. Every other §5B row was read off at least two images. The one capture that could not
be read is `menus/anytype-menu-cell-type-dark.png`, whose menu fell outside its crop; the same menu
is legible in `menu-object-type-picker-dark.png` and the row does not depend on it.

`spec.md` §5B's four originally-named filenames all resolve, as the landing pass recorded. Two of
them — `anytype-properties-official.jpg` and `anytype-relation-editor-tag-dark.png` — are **superseded
as evidence** by the panel and editor captures above, and A4's citation of a marketing JPEG for a
surface that does not exist is the reason to say so.

### The premises that are false, and what that does to D2

Three thresholds assert a value the tree does not have. None can be observed red as written until its
row in `acceptance-criteria.md` is restated.

| AC | Asserts | Actually |
|---|---|---|
| AC-002 | P2's anatomy is "type icon + label + value on every surface" | The anatomy is wrong in the source document: no format icon belongs on a value row (C1). The census figure of 3 vocabularies is correct; the **anatomy** the census is supposed to converge on is not |
| AC-003 | The hidden group is adopted from Anytype | It is ours. The threshold is sound; its **provenance** is wrong, and a design row citing a capture that shows a different model fails AC-010's own gate |
| AC-005 | The census reads 3 type lists | 1 list + 1 filtered subset + 1 submenu. "3 lists" cannot be observed because the third thing is a filter |

AC-001, AC-004, AC-006, AC-007, AC-008 and AC-009 were checked against the tree and their Today cells
are accurate as written.

### The values we adopt, and the four we refuse

**Adopted from measurement**, because a measurement outranks a default for the surface it covers:
a **left-aligned value** on the record sheet's desktop variant; **equal type size** for label and
value on desktop, with the colour split carrying the hierarchy; the **format-specific action prompt**
in place of the word "Empty"; the **format-icon placement rule** (pickers and property management
only, never a value row); **search-first pickers** with create folded into the search field;
**formats before existing properties** in the add-property picker; **one unfiltered format list** in
every picker, gated by a disabled row carrying its reason; a **checkmark** rather than a fill as the
current-value indicator; the **single-select-as-text / multi-select-as-chip** split; the
**ordinal-number badge** for multi-select selection order; and a **4.5:1 floor on every option
colour pair**, met by pairing a dark tinted fill with a light tint of the same hue.

**Adopted as behaviour**: copy that names the action rather than the absence (`Add email`, not
`Empty`), and the row-versus-input copy split (`Add email` on the row, `Enter email` in the input);
the featured-relation line as inline middot-separated text under the title; a 2px ring on the
element being edited, with the editor hanging directly off it.

**Refused, and each with its measurement.**

1. **The desktop placeholder grey.** `#5C5C5C` on the `#1E1E1E` card measures **2.49:1**. A prompt
   that names the only way to fill a field is normal text and owes 4.5:1.
2. **The iOS placeholder grey.** `#646464` on `#1C1C1E` measures **2.88:1** — the same failure from
   the other platform, which is why it is listed separately rather than folded in.
3. **The iOS `Create` pill**, on both counts and confirming `055`'s refusal with a second
   measurement: its border is `#515151` on `#1F1F1F` at **2.08:1**, below the 3:1 WCAG 1.4.11 asks of
   a border that is the only thing identifying a control; and its box measures **36pt** tall against
   the 44pt iOS floor and `044`'s 44px close.
4. **The desktop property card as an affordance.** `#1E1E1E` on `#171717` measures **1.08:1**. Its
   geometry is quotable and its boundary carries no information; if P2 ever draws a card, the card
   may not be the only thing marking a row as interactive.

**Not adopted, with reasons**: Anytype's hues are fixed values in a themed host — this is an Obsidian
plugin and the user's theme owns `#6E9EFC`, `#1B9FEB` and the option palette, so `--db-*` roles and
`resolveOptionDisplay` stand. Its **154pt label column** loses to our established, documented 96px
over a label population that carries no type suffix. Its **48.33pt row** does not displace our 44px
`--db-sheet-row-min-height`, which is `044`'s floor and which its row clears anyway. Its **URL action
menu** loses to our value anchor, which offers the same two actions without a menu step. And its
**Header/Properties-panel** property model is a type system, which goal D6 puts out of scope.

**One deviation, named rather than absorbed.** The desktop record sheet's value alignment changes
from right to left, which means adding an override rather than fixing `styles.css:10161` at source —
and a second declaration for one decision is the anti-pattern `design-system.md` §10 records. It is
taken anyway because the shared rule is the **board card's**, `renderCardField`'s four external
callers depend on it, and `board-renderer.ts` carries the `038` PM 1:1 parity that goal D5 protects.
The honest form is the override plus this note; the alternative is a card-parity regression to buy a
tidier cascade. When P2 lands and `card-field-renderer.ts` becomes a shim, the alignment becomes a
variant of the primitive and the override retires — L2's job, recorded here so it is not forgotten.

### One observation for 048, not a decision here

Every stacked pair in this sweep shows the **parent sheet undimmed and unscaled**:
`mobile-sheet-cell-select-priority`, `-multiselect-team`, `-date` and `-object-assignee` all render
the `Properties` sheet above the editor at full brightness, and `-multiselect-empty` shows two grab
handles stacked with no scrim between them. `055` recorded the same absence of dimming but read its
case as a *first* sheet over a page, which does not contradict `048`. These are **second sheets over
a first sheet**, which is `048`'s exact subject. Goal D8 makes the stacking model `048`'s and says
this phase does not re-specify it, so this is filed as evidence for that packet and decided nowhere
here.
<!-- /ANCHOR:rollup -->

---

<!-- ANCHOR:cross-refs -->
## 7. CROSS-REFERENCES

- **Requirements**: `spec.md` §4, §5A, §5B, §5D
- **Thresholds**: `acceptance-criteria.md` — AC-002, AC-003 and AC-005 are restated by this document
- **Tasks**: `tasks.md` — T001 is this document; T003's `migration-table.md` consumes §3 and §4
- **Rulings**: `decision-record.md` — ADR-004 carries this document's contradictions
- **Method, and the binding restatements**: `../050-anytype-adoption/design-trueup.md`,
  `../055-states-feedback-and-motion/design-trueup.md`
- **050 overlaps**: `spec.md` §5C — items 6, 9 and 11 at their restated thresholds
- **Record-panel placement**: `../006-record-open-target/acceptance-criteria.md` AC-014, AC-015
  (in flight, worktree `085-record-open-dock`)
- **Research source**: `../047-competitor-references-and-pm-alignment/research/research.md` §7, §9
- **Capture index**: `../../../screenshots/anytype/README.md`
- **Our own captures**: `../../../screenshots/notion-clone/panels/`, `.../fields/`
- **Token and role authority**: `../design-system.md` §5, §6, §9, §10
- **Phone grammar**: `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: `../048-stacked-sheets/spec.md` §4
- **Confirm primitive owner**: `../051-modal-and-sheet-componentization/decision-record.md` ADR-003
- **Inline editors: this packet owns them.** One exported editor primitive per column type, extracted
  from behind `CellRenderer.startEdit` into `src/views/record-surface/` under ADR-001/ADR-002 —
  bodies moved unchanged, one editor per leg. `052`'s pickers host their popovers and `051`'s sheets
  host them on the phone; neither re-specifies them. *Written down 2026-09-05 during the cross-family
  reconciliation (`../roadmap.md` §7.10)*
- **Condition row owner**: `../053-toolbar-and-view-controls/design-trueup.md` §5
- **Menu primitive owner**: `../052-dropdown-menu-and-picker-componentization/spec.md` §5
- **Cross-family reconciliation**: `../roadmap.md` §7.10
<!-- /ANCHOR:cross-refs -->
