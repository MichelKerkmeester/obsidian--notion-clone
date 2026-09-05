---
title: "Design True-Up: The Sixteen Menu-Grammar Rows and the Twenty-Five Family Surfaces Against the Captures"
description: "One row per grammar pattern and per family surface: the Anytype menu, dropdown or picker it was designed against or the named gap, the pixel values read off that screen, what our tree does today, and where the capture contradicts 047's research, 050's true-up or this packet's own draft."
trigger_phrases:
  - "052 true-up"
  - "menu grammar true-up"
  - "picker capture alignment"
  - "menu geometry table"
  - "T001 capture read"
  - "anytype menu measurements"
importance_tier: "high"
contextType: "research"
---
# Design True-Up: The Sixteen Grammar Rows and the Family Surfaces

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This is T001's output and the gate on every leg in `plan.md`. Method is
> `../050-anytype-adoption/design-trueup.md`'s, unchanged: **measure, then decide**. Every value
> below was read off a file in `screenshots/anytype/desktop/menus/`, off a file in
> `screenshots/anytype/mobile/`, or off a line in `src/views/`. Nothing is carried over from `047`'s
> research unless it is labelled as such, and `050`'s restated thresholds for items 1, 4, 6 and 8
> bind here rather than `050`'s originals.

---

<!-- ANCHOR:headline -->
## 1. THE HEADLINE, BEFORE THE TABLE

Three things changed, and the first one invalidates a caveat every prior document in this program
repeated.

**Hover states were captured, 37 times, and nobody noticed.** `screenshots/anytype/README.md` says
under "Still not reachable" that no hover state was captured, and `050` §2, this packet's G8 and
G16, and `spec.md` §6's risk row all inherit that sentence. It is false for menus. **37 of the 150
menus in `menus/` were reached by hovering a row of their parent** — the index's own "How it was
reached" column says `▸ hover "align"`, `▸ hover "advanced"`, `▸ hover "change type"` — and each of
those captures photographs the parent row *in its hover state*. Measured on
`menus/anytype-menu-object-more-add-link-to-object-dark.png`: the `Add Link to Object` row is
`#232323`, y 149..176, **28px tall, inset ~10px inside a 16px content inset**, 1.14:1 against its own
panel. The hover grammar was on disk the whole time.

**The same 37 captures answer both of this packet's open questions about submenus, from the
crawler's procedure rather than from a pixel.** The sweep could only open a submenu by hovering its
parent row, so **Anytype's desktop submenus are hover-opened** — that is no longer code-derived. And
`README.md`'s third "thing the crawler had to learn" records that **one Escape closes the submenu and
leaves its parent open**, which is exactly ADR-001's innermost-only dismissal, observed rather than
argued.

**The create affordance is not one shape, it is four, and the one this packet drafted sits in the
wrong place.** ADR-002 says the action row "sits last in its section". The captured desktop row —
`＋ Create Object` in `menus/anytype-menu-object-more-add-link-to-object-dark.png` — sits **first,
directly under the search field and above the list**, which is the only position where a create
affordance is reachable while the query that would create the thing is still on screen.

### Where the evidence wins, in one list

Eleven contradictions, each resolved in the evidence's favour per this task's rule, each expanded in
its row and each carried into `decision-record.md` ADR-004 and ADR-005.

| # | The draft, `047` or `050` says | The captures or the tree show | Row |
|---|---|---|---|
| C1 | README, `050` §2, G8, G16, `spec.md` §6: **no hover state was captured** | **37 menus** were reached by hovering a parent row and each photographs that row hovered: `#232323`, 28px, ~10px inset, **1.14:1** | G8, G16 |
| C2 | G8, `spec.md` §11, ADR-001: hover-open and Escape-order are **code-derived** | Both are **procedural evidence**: the sweep can only open a submenu by hovering, and needs exactly one Escape to close the child and keep the parent (`README.md` "A submenu left open swallows the next hover") | G8, ADR-001 |
| C3 | G1: sections are **five sections separated by four dividers** | True of `object-more`. But **captioned sections also ship**: `Property name` / `Property Type` (`set-column-header`), `Views` (`set-viewlist`), `Settings` (`set-new-object`), `Text` (`object-block-menu`) — a caption at `#A3A3A3`, ~12px, above the section's first row | G1 |
| C4 | G12 [narrowed at landing]: typed group headers are **code-derived** | The narrowing was right about the *filter property picker*, which is flat. Group headers are **captured elsewhere**: `Properties formats` / `Existing properties` (`mobile/anytype-mobile-sheet-relation-add`) and `Smileys & People` (`object-icon-picker`). The rule is **grouped when the list mixes kinds, flat when it is one kind** | G12 |
| C5 | ADR-002 / G11: the create row **sits last in its section** | The captured row sits **first, under the search field, above the list** (`object-more-add-link-to-object`). Four shapes ship in total: search placeholder, first-row action, iOS header `＋`, and a `Create` button inside the empty state | G10, G11 |
| C6 | P5 / ADR-003: the colour picker is a **swatch grid** needing a geometric navigator | Anytype's colour picker is a **labelled list** — ten named colours, leading dot, trailing tick, 224px, 28px rows (`object-block-menu-color`). No grid, no geometric navigation | G14, G15 |
| C7 | G14: "the primitive's check wins", side unstated | Checkmarks are **trailing**, at the 16px right inset (`object-block-menu-color`, `set-column-header-align`). Ours is **leading** (`cell-renderer.ts:1420`). iOS ships **two** ticks: a blue filled circle for a value, a plain tick for a single choice | G14 |
| C8 | AC-002, REQ-002, SC-003, `componentization-plan.md`: **71** hand-built sites, `toolbar-renderer.ts` **45** | **70** outside `menu-row.ts` — `toolbar-renderer.ts` **44**, `column-menu.ts` 19, `dropdown-field.ts` 4, `cell-renderer.ts` 3; **76** including `menu-row.ts`'s own 6. `checklist.md` C2 already carries the right number; four other documents carry the wrong one | AC-002 |
| C9 | AC-007 / `componentization-plan.md` §3 / `checklist.md` C7: **9 distinct** bespoke widths including **240** | **8 distinct** literals — 124, 252, 280, 292, 318, 360, 420, 520 — at **14** production call sites. `240` is not one of them: `chart-toolbar-renderer.ts:927` passes `preferredWidth: 280`, and the only 240 in the tree is `popover-position.stories.ts:40`, a story | REQ-007 |
| C10 | `050` §2: secondary text `#A3A3A3` measures **7.95:1** on the panel | **7.11:1**, recomputed from the sampled RGB. Immaterial to any decision — both clear 4.5:1 — but it is a quoted number | geometry |
| C11 | `050` REQ-010 / C7: **no per-view default row exists** in the shipped product | It exists, in a menu `050` never opened: `menus/anytype-menu-set-new-object-dark.png` carries a `Settings` section with **`Default Type for this View  Page ›`** and **`Template for this View  Blank ›`** | inherited item |
<!-- /ANCHOR:headline -->

---

<!-- ANCHOR:method -->
## 2. HOW THE CAPTURES WERE READ

**Two capture sets, and they answer different questions.** `menus/` is the desktop app at 1 device
pixel to 1 CSS pixel — `050` §2 proves the scale and this read reproduces it, measuring the
`object-more` menu at 256 × 504 where `050` measured 256 from a different capture of the same menu.
`mobile/` is the iOS client at **1206 × 2622, 3×**, so every phone figure below is stated in **points**
(pixels ÷ 3) with the raw band beside it.

**The clip carries a 12px shadow margin.** Every file in `menus/` is the menu's bounding box plus
12px of shadow on each side, so the panel frame is at x = 12 and the panel width is the clip width
minus 24. This is why a naive read of the file dimensions reports a 280px menu where the panel is
256px, and it is the single fact that makes the width table below quotable.

**Colour and contrast sampled per pixel, never by eye**, and every ratio recomputed from the sampled
RGB rather than quoted — which is how C10 was found.

**What no capture in the sweep contains.** A menu with **zero eligible rows**; a **multi-row
selection**; a submenu **deeper than depth 2**; and any **destructive confirmation**, which
`menus.mjs` refuses by name (`README.md:401`). Those four stay code-derived, and absence of a capture
is not evidence of absence (`050` ADR-003, corollary 1).

### The measured Anytype menu system, as one table

Dark theme, read off `menus/`. These recur on every surface, so they are stated once.

| Property | Measured value | Where |
|---|---|---|
| Panel background | **`#171717`** | every panel interior |
| Panel border | **1px `#292929`** | every frame edge and every divider |
| Corner radius | **8px** | `object-more`, corner arc spans 8-9px from the top edge to the full-width left edge |
| Row pitch, every menu and list | **28px** | modal pitch on 9 of 11 measured classes; `object-more` bands at 27/27/29/29/27/28/27 |
| Content inset | **16px** each side | icon box x 28..43 in a panel at x 12; chevron right inset 16px; search field x 28..251 |
| Row highlight inset | **8-10px** each side | hover band x 383..617 in a panel x 372..627 |
| Divider inset | **16px** each side | `object-more` dividers x 28..251 inside a 12..267 frame, all four identical |
| Section gap across a divider | **44-48px** pitch against a 28px row | `object-more` 44, 46, 45, 48 |
| Leading icon | **16px box, 14px glyph** | `object-more` `Copy Link`, glyph x 31..44 in a 28..43 box |
| Trailing chevron | **4 × 8px glyph at the 16px right inset** | `object-more` `Add Link to Object` |
| Search field | **28px tall, `#232323` fill, 16px inset, 224px wide in a 256px panel** | `set-filter-property-picker`, y 24..51 |
| Hover / preselect highlight | **`#232323`, 28px, 1.14:1 on the panel** | 37 hover captures; `set-filter-property-picker`'s preselected `Name` row |
| Primary text | **`#E1E1E1`**, **13.71:1** | labels, headers |
| Secondary text | **`#A3A3A3`**, **7.11:1** | shortcuts, right-hand values, section captions |
| Section caption | **`#A3A3A3`, ~12px cap-height**, above the section's first row | `set-column-header` `Property name` |
| Accent | **`#3C7FFB`** ring, **`#4686FB`** fill | layout selected tile; date selected day |
| Option chip | **24px tall, fully rounded, tinted fill + tinted text**, 32px row pitch | `cell-select`, chip y 24..47, next chip y 56 |
| Drag handle | **2 × 3 dots at the 16px inset**, chip starts 34px in | `cell-select`, `cell-multiselect`, `set-viewlist`, `set-sort-empty` |
| Submenu gap | **2px** between the parent's right border and the child's left | `object-block-menu-color`, parent x13..266, child x269..492 |

### The measured width tiers — the table this packet asked for

Panel width by menu class, taken as clip minus the 24px shadow margin and confirmed against the
detected border columns. **Anytype ships five width tiers; our role vocabulary has three.**

| Class | Measured panel | Members read |
|---|---|---|
| **Compact context menu / plain select** | **224px** | `kanban-column-menu` 224×341 · `calendar-day-menu` 224×72 · `calendar-item-menu` 224×72 · `nav-widget-bin` 224×144 · `nav-widget-section-recent` 224×172 · `nav-vault-space-item` 224×188 · `nav-create-object` 224×100 · `calendar-month-select` 224×352 · `nav-settings-*-select-*` 225 · `object-type-picker` 225 · `object-layout-picker` 225 |
| **Object / row / card context menu** | **256px** | `object-more` 256×504 · `list-row-menu` 256×459 · `kanban-card-menu` 256×459 · `gallery-card-menu` 256×459 · `nav-widget-item` 256×319 · `nav-help` 256×272 · `object-block-menu` 257×527 · `set-column-header` 256×500 · `set-filter-property-picker` 257×1130 |
| **Cell and relation editor** | **288-300px** | `cell-select` 300×144 · `cell-multiselect` 300×176 · `cell-object` 300×300 · `cell-file` 300×84 · `cell-date` 288×271 · `set-new-object` 288×143 · `object-relation-select` 298×144 · `object-relation-object` 298×72 · `object-relation-date` 286×269 |
| **View / settings / filter / sort / layout panel** | **360px** | `set-view-settings` 360×316 · `set-view-filter` 360×90 · `set-view-sort` 360×166 · `set-view-layout` 360×298 · `set-view-properties` 360×390 · `set-sort-empty` 360×166 · `set-sort-added` 360×214 · `set-layout-grid` 360×298 · `set-filter-select` 360×474 · `set-filter-date` 360×552 · `set-viewlist` 360×255 · `set-sort-property-picker` 360×1086 |
| **Grid picker** | **408px** | `object-icon-picker` 408×412 · `object-cover-picker` 408×408 |
| **Submenu** | **224 / 256 / 360px by content** | `object-block-menu-color` child 224 · `set-column-header-align` child ≈224 · `list-row-menu-change-type` child 256 · `object-more-add-link-to-object` child ≈360 (search + list) |

**Two of these are adopted and three are declined, each with a reason.** The **360px panel** is
adopted: it is the top of our own `panel` role's 292-360px range (`design-system.md` §5) and the
measurement agrees with the established value, so nothing moves. The **28px row and 8px radius** stay
adopted from `050`. Anytype's **224px and 256px menu tiers are declined** — `050` already declined
256 in favour of our documented 292px `menu` role, and 224 is narrower still; a themed host with a
user's own font stack has no business at 224. The **408px grid picker** is declined against our 318px
icon picker for the same reason it was chosen: 318 is the content-driven floor of *our* emoji grid,
not of Anytype's.

**One width that looks like a contradiction and is not.** Anytype's filter panel is **360px** where
our `condition panel` role is **440-560px** (`design-system.md` §5, 552px shipped). The reason is
visible in `menus/anytype-menu-set-filter-select-dark.png`: Anytype stacks the condition — property
on the panel, operator and value in a **second popover** — where our row carries property, operator,
value, group, NOT and remove on **one line**. Different row shape, different floor. Nobody should
"correct" our 552 to Anytype's 360 on the strength of this table.
<!-- /ANCHOR:method -->

---

<!-- ANCHOR:rows -->
## 3. THE SIXTEEN GRAMMAR ROWS

Each row carries the same six things: whether the surface was **seen**, the files, what the real
screen does, what our tree does today, the values that change, and the phone disposition.

---

### G1 — Fixed sections

**Seen, and the row is incomplete rather than wrong.**

**Captures.** `menus/anytype-menu-object-more-dark.png`, `menus/anytype-menu-set-column-header-dark.png`,
`menus/anytype-menu-set-viewlist-dark.png`, `menus/anytype-menu-set-new-object-dark.png`,
`menus/anytype-menu-object-block-menu-color-dark.png`.

**What the real screen does.** `object-more` confirms `050` C5 exactly: dividers at y 56, 297, 398
and 471 inside a 12..515 frame — **four dividers, five sections**, each divider inset 16px each side,
each section boundary costing 44-48px of pitch against a 28px row.

But three other menus carry something `object-more` does not: a **text caption** above a section's
first row. `set-column-header` has `Property name` and `Property Type`; `set-viewlist` has `Views`;
`set-new-object` has `Settings`; `object-block-menu` has `Text`. Measured on `set-column-header`: the
caption band is y 27..38 — **~12px cap-height** against a label's 14-16px — at **`#A3A3A3`**, the same
secondary grey as a shortcut, at the same 16px inset as the rows below it (C3).

So Anytype has **two** section grammars, not one: a bare divider, and a captioned divider. The
caption appears where the section's rows would otherwise be ambiguous — `Property name` above a value
that could be mistaken for an action, `Settings` above two rows that configure rather than act.

**What we do today.** `menu-row.ts:180` `createMenuSection` and the column menu's grouped layout
(`column-menu.ts:181-186`) already build both. The migration's job is that every menu reaches them.

**Values that change.**

| Was | Is |
|---|---|
| "five sections, four dividers ... immaterial to us" | Unchanged and confirmed by a second, independent capture of the same menu |
| One section grammar | **Two.** Bare divider, and divider-plus-caption at `#A3A3A3`, ~12px, 16px inset. Adopted: the caption is used where a section's rows are configuration rather than action, which is exactly `set-new-object`'s `Settings` and our own toolbar panels' problem |
| Section boundary cost unspecified | **44-48px pitch across a divider against a 28px row** — i.e. 8px clearance each side plus the 1px rule, which is `050` §2's figure confirmed |

**Phone.** Relevant. `mobile/anytype-mobile-sheet-relation-add-dark.png` uses the same caption
grammar (`Properties formats`, `Existing properties`) with a hairline under the caption, so the two
platforms agree and `044`'s sheet grammar inherits it unchanged.

---

### G2 — Capability-gated items

**Seen, and the gating is observable rather than inferred.**

**Captures.** `menus/anytype-menu-object-more-dark.png` against
`mobile/anytype-mobile-sheet-object-more-dark.png` and `mobile/anytype-mobile-sheet-set-more-dark.png`.

**What the real screen does.** The desktop `···` menu measures 256 × 504, 28px rows, 16px leading
icons, right-aligned shortcut text at `#A3A3A3` (`^ + ⇧ + L`, `⌘ + F`, `⌘ + ⌥ + H`, `⌘ + P`), chevrons
on the two submenu rows. `055`'s proof that gating is real holds and is not re-derived here: the same
iOS `···` menu carries `Undo/Redo` and `Publish to Web` on an object and omits both on a set.

One detail worth recording because it will otherwise be copied wrong: **the leading icon is not
universal within a menu**. `menus/anytype-menu-nav-widget-bin-dark.png` renders `Open` and `Empty Bin`
with no icon and `Hide section` / `Manage Sections` with one, in the same 224px menu. Anytype gates
the icon slot per row, not per menu.

**What we do today.** `row-menu.ts:57-59` already disables insert with an implicit reason;
`dropdown-field.ts:40-41`, `:224-232` carries `disabledReason` end to end. `050` item 8 owns the
predicate.

**Values that change.** None to the disposition. One addition: **the icon slot is optional per row**,
which the shared row builder must express rather than forcing a blank 16px gutter on an icon-less
menu.

**Phone.** Relevant, and it is where the gating proof lives. `owned-menu` is a registered
`sheet-grammar` surface and `044` REQ-007 gives it a title row with a 44px close.

---

### G3 — Never-empty fallback

**Half seen. The "No available actions" wording is still code-derived; the *shape* of a never-empty
answer is now captured three ways.**

**Captures.** `menus/anytype-menu-set-sort-empty-dark.png`,
`mobile/anytype-mobile-sheet-cell-multiselect-empty-dark.png`,
`menus/anytype-menu-object-featured-tag-dark.png`.
**Not captured:** a menu of actions whose eligible-row set is empty.

**What the real screen does.** Three answers, tiered by whether the user can act:

- **A default row.** `set-sort-empty` — a Sort panel with no user sort still renders a sort row
  (drag handle, a boxed `Last modified date` chip, a square direction button carrying `↑`), then a
  divider, then `＋ Add sort` and `🗑 Delete sort`. `055` recorded this; it is confirmed at 360px.
- **A one-line instruction.** `object-featured-tag` — header `Tag`, the search field, and where the
  list would be, one secondary-grey line: *"Type to create a new option"*. No illustration, no
  button. This is the desktop's picker-empty answer and it is **new evidence** — no prior document in
  this program cites this capture.
- **An illustration, two lines and a button.** `mobile/…-sheet-cell-multiselect-empty` — a coffee-cup
  glyph, **"No options"** at primary, *"Nothing found. Create first option to start."* at secondary,
  and a pill **`Create`** button. Measured in points: illustration centred, button ~35pt tall.

**What we do today.** `050` REQ-008's narrowing binds: `row-menu.ts` **cannot** render empty because
`menu.openNote` is unconditional, so its guarantee is asserted rather than built; the only file that
can violate the threshold is `bulk-edit-field-menu.ts:31-45`, which maps `options` straight from
`getBulkEditableColumns` with no floor.

**Values that change.**

| Was | Is |
|---|---|
| One fallback row, wording "No available actions" | **Three shapes, chosen by actionability.** A *default row* where a sensible default exists (sort, group-by); a *one-line instruction* where the user can act through the search field already on screen; an *illustration + line + button* only where neither is true |
| The wording is code-derived | Still true for a fully-gated **action menu** — no capture shows one. **False for a picker**: `Type to create a new option` and `Nothing found. Create first option to start.` are both captured strings, and both **name the action** rather than the absence |
| `bulk-edit-field-menu.ts` gets the fallback | Unchanged, and it gets the **instruction** shape, not the "No available actions" shape — its empty state is "nothing here is bulk-editable", which is not actionable from that menu, so it is the one place the flat message is right |

**Phone.** Relevant, and the richest shape is the phone's. The pill `Create` button's **~35pt height
is refused** — it is below the 44pt iOS floor and below `044`'s 44px close, and `055` refused the same
pill for the same reason on the states phase. Take the shape, not the height.

---

### G4 — Selection caps

**Not seen, and nothing changed.**

**Captures.** None. The object menu was photographed on a page, never on a multi-row selection.

**What we do today.** `050` REQ-008 records the caps as **not adopted, with a reason**: our row menu
operates on a single row, so a cap on "more than 1 object" has no referent.

**Values that change.** None. The row stands as trued at landing. **Design inferred from source code,
not seen.**

**Phone.** No expression, for the same reason.

---

### G5 — Item density

**Seen, and every number in the row is now measured on this packet's own evidence rather than
inherited.**

**Captures.** All 150 clipped dark menus; `menus/anytype-menu-object-more-dark.png` for the detail.

**What the real screen does.** §2's tables carry it: 28px rows, 16px content inset, 8px radius, 1px
`#292929` border on `#171717`, dividers inset 16px, 16px icon box with a 14px glyph, 4 × 8px chevron
at the 16px right inset. The width tiers are 224 / 256 / 288-300 / 360 / 408.

**What we do today.** `design-system.md` §5 fixes the `menu` role at 292px and the `panel` role at
292-360px; §9 sets the coarse-pointer floor at 28 × 28.

**Values that change.**

| Was | Is |
|---|---|
| "menu popover 256px, row 28px, radius 8px, padding 16/8, divider clearance 8px" | **Confirmed**, on a second capture set, with the 12px shadow-margin correction that makes the 256 reproducible from the file dimensions |
| Anytype's width is one number | **Five tiers**, listed in §2. 256 is the context-menu tier only |
| 256 and 14px type declined | **Unchanged.** Our 292px `menu` role and 13px type win, and 224 is declined a fortiori |
| Radius unmeasured on this set | **8px**, corner arc 8-9px on `object-more` — the same number `design-system.md` §10 already asks for |
| Icon slot unspecified | **16px box, 14px glyph, optional per row** (G2) |

**Phone.** Not applicable — the phone expression is `044`'s row grammar, and a 28px desktop row does
not travel to a 44px touch target.

---

### G6 — Destructive tone at the end

**Seen, and it is platform-split. `055` C3 holds and this read confirms it on a third capture.**

**Captures.** `menus/anytype-menu-object-more-dark.png` (`Move to Bin`),
`menus/anytype-menu-nav-widget-bin-dark.png` (`Empty Bin`),
`mobile/anytype-mobile-sheet-object-more-dark.png` (`Delete`).

**What the real screen does.** On the desktop, `Move to Bin` is the last row of its section and is the
**same `#E1E1E1` as `Copy Link`** — position carries the meaning, colour does not. `Empty Bin`, the
most destructive action in the product, is likewise uncoloured and sits *second* in its menu, not
last. On iOS, `Delete` is **red text beside a red trash glyph**, last, below a divider, under
`Duplicate`.

**What we do today.** `row-menu.ts:146-160` places delete last with `warning: true`; `menu-row.ts:64`
renders the error colour.

**Values that change.**

| Was | Is |
|---|---|
| "destructive last, tonally distinct" | **Half wrong on the desktop.** Position is the convention; tone is the platform's. `Empty Bin` is not even last |
| Adopt Anytype's tone | **Nothing to adopt.** `mod-warning` stays because it is Obsidian's theme-owned destructive class — *host convention*, not adoption (`055` ADR-004's ruling, consumed here) |
| — | **Adopt the iOS pairing**: wherever a destructive row is coloured, it carries a matching icon. Colour never alone |
| The position rule is enforced on `row-menu.ts` only | Unchanged as the requirement, and the migration makes it checkable on every menu |

**Phone.** Relevant. Our phone menus are sheets; the destructive row keeps position **and** icon.

---

### G7 — Toggle labels derive from state

**Not seen as a label, but the toggle control itself is captured, and that is the more useful half.**

**Captures.** `menus/anytype-menu-set-layout-grid-dark.png` — `Wrap content` off, `Show icon` on.

**What the real screen does.** The layout panel's setting rows carry a **right-aligned pill toggle**,
blue when on, neutral when off, at the 16px right inset — not a label that names the next state. So on
the panel surfaces Anytype uses a control, and the state-naming label of `047` §9 belongs to menus we
did not photograph.

**What we do today.** `column-menu.ts:174-175` wraps enable/disable; `menu-row.ts:135-140` sets
`aria-checked`.

**Values that change.** The disposition stays **Decline**. One addition: where a menu row is a
binary setting rather than an action, **the captured answer is a toggle control in the trailing slot**,
which our row builder already has a slot for. The label-naming-the-next-state pattern stays
`047`-derived and unseen.

**Phone.** Relevant, unchanged — the toggle is the same control at touch size.

---

### G8 — Submenus open on hover, pre-filtered

**Seen — and this is the row the true-up changes most, in the packet's favour.**

**Captures.** The 37 hover-reached menus, of which
`menus/anytype-menu-object-more-add-link-to-object-dark.png`,
`menus/anytype-menu-set-column-header-align-dark.png`,
`menus/anytype-menu-object-block-menu-color-dark.png` and
`menus/anytype-menu-list-row-menu-change-type-dark.png` were measured;
`mobile/anytype-mobile-sheet-object-more-submenu-dark.png` for the phone.

**What the real screen does.**

*Opening.* Hover, and it is proved by procedure rather than argued: every one of the 37 was reached
by dispatching a hover on the parent row, and `README.md` records that leaving a previous submenu open
makes the app swallow the next hover — behaviour only a hover-driven opener has (C2).

*Dismissal.* One Escape closes the child and leaves the parent open (`README.md`, same paragraph).
That is innermost-only LIFO, observed.

*Placement.* The child sits **flush beside the parent with a 2px gap** — `object-block-menu-color`,
parent x 13..266, child x 269..492 — and **flips to the parent's left when there is no room right**:
`object-more-advanced` puts the parent at x 236..491 and the child to its left. The child's top aligns
to the row that opened it, not to the parent's top.

*Width.* Three child widths by content: **224px** for a compact list (`align`, `color`), **256px** for
a longer one (`change-type`), **≈360px** when the child carries a search field and a list
(`add-link-to-object`, `add-to-collection`).

*Parent state.* The opening row stays **hovered** for as long as the child is open — `#232323`, 28px,
~10px inset, and the chevron stays `›`.

*Depth.* Every captured chain is **depth 2**. Nothing in the sweep goes deeper.

**What the phone does.** `sheet-object-more-submenu` is **not a fresh sheet**. Tapping `More ›` opens
a second panel that **overlays the parent from the More row down**, the parent **dims** without
scaling back, and the parent row's chevron **rotates `›` → `⌄`**. That is `048`'s stacking model's
dimming, with a state change on the row that opened it.

**What we do today.** `owned-menu.ts:175` reads `submenu` exactly once, to suppress auto-close
(`if (!rowOptions.submenu) close();`). The handle has no child-menu method. The only real submenus are
hand-built at `column-menu.ts:568` with three consumers (`:225`, `:258`, `:387`).

**Values that change.**

| Was | Is |
|---|---|
| "hover-open is desktop-only ergonomics the captures cannot show" | **False.** Hover-open is proved by the sweep's own procedure (C2). `spec.md` §11's third open question is **closed**: adopt hover-open on desktop, guarded by `@media (hover: hover)`, with click and `ArrowRight` retained |
| Escape order argued from `overlayStack`'s LIFO rule | **Observed.** One Escape closes the child and keeps the parent. ADR-001's dismissal clause is now evidence-backed, not design-backed |
| Placement unspecified | **Flush beside the parent, 2px gap, child top aligned to the opening row, flipping to the left at the viewport edge.** The flip is the same horizontal guard `050` REQ-006 leaves open, so the two rows now want one implementation |
| Submenu width unspecified | **By content, from the role vocabulary**: our `menu` role for a list child, our `panel` role when the child carries a search field. Anytype's 224/256/360 are the tiers, not the numbers we take |
| "the phone path is the stacked sheet `048` registers" | **Narrowed, not overturned.** iOS overlays and dims the parent rather than presenting a fresh sheet, and it changes the parent row's chevron. `048`'s dimming already covers the first half; the **chevron rotation is adopted** as the parent-side state signal, which is also the second signal G16 otherwise lacks |
| Depth unspecified | **Depth 2 is all Anytype ships.** Our depth-3 chains (`sheet-grammar.mjs:97-98`, `:110-112`) remain **ours to satisfy, not a parity target** — unchanged from §3 of the grammar doc |

**Phone.** This row *is* the phone row for the menu half. `record column submenu` is a registered
depth-3 pair and stays one.

---

### G9 — Submenu arrows

**Seen and measured.**

**Captures.** `menus/anytype-menu-object-more-dark.png` (`Add Link to Object`, `Add to Collection`,
`Advanced`), `menus/anytype-menu-set-column-header-dark.png` (`Align`, `Calculate`).

**What the real screen does.** A **4 × 8px chevron glyph at the 16px right inset**, in the secondary
grey, on exactly the rows that open a child. `object-more` carries three and every other row's right
inset is either a shortcut string or nothing.

Two rows in the sweep carry a chevron that is *not* a submenu: `Layout   Grid ›` and
`Sort   1 applied ›` in `set-view-settings` navigate the panel in place with a `‹` back header
(`050` REQ-002). So a chevron means "leads somewhere", and whether it opens a child surface or
replaces the body is a second decision.

**What we do today.** `menu-row.ts:112-122` draws the chevron for `submenu: true` **and** for a plain
`chevron: true` — and `:119-121` already distinguishes them in ARIA, which is exactly the distinction
the captures show. That is a correct piece of the builder that predates this read.

**Values that change.**

| Was | Is |
|---|---|
| "adopt (already ours, make true)" | Unchanged, and the geometry is now fixed: **4 × 8px glyph, 16px right inset, secondary grey** |
| — | **The two chevron meanings are confirmed captured**, so `menu-row.ts:59`'s existing `chevron` option is validated rather than merged away during the migration |

**Phone.** Relevant. iOS rotates the chevron `›` → `⌄` when the child is open (G8); ours should too.

---

### G10 — Search-first pickers

**Seen, four ways on desktop and four on the phone.**

**Captures.** `menus/anytype-menu-set-filter-property-picker-dark.png`,
`menus/anytype-menu-set-sort-property-picker-dark.png`,
`menus/anytype-menu-object-more-add-link-to-object-dark.png`,
`menus/anytype-menu-object-block-menu-dark.png`, `menus/anytype-menu-object-icon-picker-dark.png`;
`mobile/anytype-mobile-sheet-cell-select-priority-dark.png`,
`mobile/anytype-mobile-sheet-relation-add-dark.png`,
`mobile/anytype-mobile-sheet-filter-relation-picker-dark.png`.

**What the real screen does.** The search field is **the first thing in the panel, always**: 28px
tall, `#232323` fill, 16px inset, full content width, sitting 12px below the frame's top edge, with a
leading magnifier on the phone and none on the desktop. Placeholders are per-surface and per-verb —
`Click to filter…`, `Filter Objects…`, `Filter actions…`, `Filter or create options…`,
`Search or create new`.

Below it, one of two things: the list directly (`set-filter-property-picker`), or **a create row and
then the list** (`object-more-add-link-to-object`) — see G11.

**What we do today.** Four separate implementations (`checklist.md` C6): `dropdown-field.ts:407`
`filterDropdownOptions`, `cell-renderer.ts:968`, `icon-picker-popover.ts:156`,
`toolbar-renderer.ts:1180`.

**Values that change.**

| Was | Is |
|---|---|
| "one shared picker component" | Confirmed, and the **field is measured**: 28px tall, `#232323`, 16px inset, first in the panel, 12px below the frame |
| The placeholder is where the create affordance lives | **One of four places.** See G11; the placeholder alone was the drafted premise and it is the weakest of the four |
| — | **Placeholder names the verb of its surface.** `Filter actions…` in an action menu, `Filter or create options…` in a value picker. Not one string reused |
| — | **Do not copy Anytype's placeholder text.** `mobile/anytype-mobile-sheet-filter-relation-picker` reads `Choose a property to sort` inside the *filter* flow — a shipped product bug, confirmed by pixel, already flagged in the grammar doc's reconciliation |

**Phone.** Relevant. The field gains a magnifier and sits under the sheet title; `048`'s registered
pairs already carry the surfaces.

---

### G11 — Create-option row

**Seen — and the drafted placement is contradicted.**

**Captures.** `menus/anytype-menu-object-more-add-link-to-object-dark.png` (the row),
`menus/anytype-menu-set-filter-property-picker-dark.png` (a *trailing* action row, for contrast),
`menus/anytype-menu-object-featured-tag-dark.png` (the empty-state instruction),
`mobile/anytype-mobile-sheet-cell-select-priority-dark.png` and
`mobile/anytype-mobile-sheet-cell-multiselect-empty-dark.png` (the two phone shapes).

**What the real screen does.** Four shapes, and they are not interchangeable:

| Shape | Where | What it is |
|---|---|---|
| **Search placeholder** | `Filter or create options…` (`set-filter-select`'s value picker) | The affordance is the field itself; typing a novel string creates |
| **First row, under the search, above the list** | `＋ Create Object` (`object-more-add-link-to-object`) | A real row, before the results, with the `＋` in the 16px icon slot |
| **Header `＋` button** | iOS `sheet-cell-select-priority`, `sheet-relation-add`, `sheet-cell-multiselect-empty` | A trailing header affordance, present whether or not the list is empty |
| **Empty-state button** | `Create` pill (`sheet-cell-multiselect-empty`) | Only when there is nothing to list |

And the counter-example that fixes the rule: `set-filter-property-picker`'s `Add advanced filter` sits
**last, below a divider** — because it is an *escalation*, not a creation. Anytype puts creation first
and escalation last.

**What we do today.** `dropdown-field.ts:42-43`'s `preserveValueOnSelect` is the mechanic, used at
four call sites for create-field actions; `cell-renderer.ts:1508-1516` is the option editor's add row.

**Values that change.**

| Was | Is |
|---|---|
| ADR-002: "the action row sits **last in its section**" | **Contradicted (C5).** The captured create row sits **first, directly under the search field and above the list**. Last-in-section is where Anytype puts an *escalation* (`Add advanced filter`). ADR-002's mechanism (`preserveValueOnSelect`) is unaffected and stands; only its placement clause changes |
| One create shape | **Four, chosen by surface**: placeholder where typing creates; first row where creation is a distinct act; header `＋` on the phone; a button in the empty state |
| The affordance may be absent when the list is empty | **Refused by the captures.** All three phone shapes keep it reachable with an empty list, which is AC-006's clause and is now evidence-backed |

**Phone.** Relevant, and it is the strongest evidence. The header `＋` is the phone expression and
lands in `044`'s header, which already exists on every registered picker sheet.

---

### G12 — Section headers in pickers

**Seen — and the landing narrowing was right about the wrong picker.**

**Captures.** `menus/anytype-menu-set-filter-property-picker-dark.png` (flat),
`menus/anytype-menu-object-icon-picker-dark.png` (`Smileys & People`),
`mobile/anytype-mobile-sheet-relation-add-dark.png` (`Properties formats`, `Existing properties`),
`mobile/anytype-mobile-sheet-filter-relation-picker-dark.png` (flat).

**What the real screen does.** The filter property picker is **flat**: 34 rows, each a **per-format
leading icon** (`Aa` text, page glyph, calendar, list glyph, `ⓘ`, `#`, ticked circle, envelope, phone,
link, paperclip) plus a label, with cross-set properties disambiguated by a text suffix
`(Project Tracker)` rather than by a group. The phone's relation picker is flat the same way. The
landing narrowing is confirmed on both platforms.

But two other pickers **do** group under typed headers, and both mix kinds: `sheet-relation-add`
separates `Properties formats` from `Existing properties`, and the emoji grid separates
`Smileys & People` from the categories below it (C4).

**What we do today.** `DropdownOption.section` renders group titles (`dropdown-field.ts:220-223`).

**Values that change.**

| Was | Is |
|---|---|
| "typed group headers are **code-derived**" | **False.** Captured twice. The narrowing's *conclusion* about the property picker survives; its *claim of no evidence* does not |
| Adopt grouping order from Anytype | **Adopt the rule, not an order**: group when the list mixes kinds, stay flat when it is one kind. Our filter property picker is one kind and stays flat; our bulk-edit and add-property pickers mix and group |
| Format icons | **Adopt, confirmed on four captures.** They are the vocabulary the flat list depends on to stay readable at 34 rows |

**Phone.** Relevant, and both shapes are captured there.

---

### G13 — Relative condition values

**Seen, and the picker half is closer to ours than the row claimed.**

**Captures.** `menus/anytype-menu-set-filter-date-relative-dark.png`,
`menus/anytype-menu-set-filter-date-picker-dark.png`, `menus/anytype-menu-cell-date-dark.png`.

**What the real screen does.** `cell-date` is a 288 × 271 panel: `May 2026` with `‹ ›` month nav, a
`Mo…Su` weekday header, a 7-column grid with weekend columns tinted, the selected day a **filled
`#4686FB` rounded square**, then a divider, then a footer row carrying **`Today`  `Tomorrow`** on the
left and **`Clear`** on the right. The filter date surface adds an `Exact` / `Relative` tab pair.

**What we do today.** `date-value-picker.ts:164-166` renders Today / Tomorrow / Next week / Clear at
252px.

**Values that change.**

| Was | Is |
|---|---|
| "Decline here; chips are `050` item 1's" | Unchanged for chips |
| "the presets already match Anytype-style relative affordances" | **Confirmed, captured.** Today / Tomorrow / Clear are Anytype's exact footer set; our Next week is an addition, not a divergence |
| Preset placement unspecified | **A footer row below a divider**, presets left, `Clear` right — which is what ours already does |
| Width | Ours **252px** against Anytype's **288px**. Kept: 252 is our content floor and the difference is a font stack, not a design |

**Phone.** Relevant. `filter date value picker` is a registered stacked pair and
`mobile/anytype-mobile-sheet-cell-date` is its counterpart.

---

### G14 — Checkmarks on the current value

**Seen, and the row was right about the affordance and silent about the side that matters.**

**Captures.** `menus/anytype-menu-object-block-menu-color-dark.png`,
`menus/anytype-menu-set-column-header-align-dark.png`;
`mobile/anytype-mobile-sheet-cell-select-priority-dark.png`,
`mobile/anytype-mobile-sheet-filter-condition-operators-dark.png`.

**What the real screen does.** On the desktop the tick is **trailing**, at the 16px right inset, in the
primary text colour — `Default ✓` in the colour list, `Left ✓` in the align submenu. On iOS there are
**two** ticks: a **blue filled circular tick** for a *value* selection (`High` in the priority picker)
and a **plain tick** for a *single choice among conditions* (`Is` in the operator list) (C7).

**What we do today.** Two grammars for one affordance, which is what the row exists to fix — and both
are **leading**: `dropdown-field.ts:240-243`'s check icon and `cell-renderer.ts:1420`'s `✓` text node
(`item.createSpan({ text: selected.has(...) ? "✓" : "" })`, re-set at `:1478` and `:1483`).

**Values that change.**

| Was | Is |
|---|---|
| "the primitive's check wins", side unstated | **The primitive's check wins and it is trailing**, at the 16px right inset. That also frees the leading slot for the format icon G12 and G15 both need, which is why Anytype put it there |
| One tick | **One tick for us.** iOS's two-tick split is a platform idiom; introducing a second check grammar to mirror it would be the "two systems of the same kind" `sk-design` §4 forbids, and it is the exact defect this row is closing |
| The `✓` text node | **Deleted, not restyled.** A text glyph cannot carry `aria-checked` semantics the way `menu-row.ts`'s `menuitemcheckbox` already does |

**Phone.** Relevant. `record relation editor` and `record option colour picker` are registered pairs
and the tick moves inside them, so their selectors are updated in the same leg (TASK-SYNC).

---

### G15 — Icons per option

**Seen, and it settles the colour picker's shape.**

**Captures.** `menus/anytype-menu-object-block-menu-color-dark.png`,
`menus/anytype-menu-cell-select-dark.png`, `menus/anytype-menu-cell-multiselect-dark.png`,
`menus/anytype-menu-set-filter-property-picker-dark.png`.

**What the real screen does.** Two option vocabularies, both leading-slot:

- **A leading dot plus a label**, in a 28px row at 224px — Anytype's colour picker is a **labelled
  list of ten named colours** (`Default`, `Grey`, `Yellow`, `Amber`, `Red`, `Pink`, `Purple`, `Blue`,
  `Sky`, `Teal`, `Green`), each with a trailing tick on the current one. **There is no swatch grid**
  (C6).
- **A tinted chip**, where the option *is* the value — `cell-select` renders each option as a **24px
  fully-rounded pill with a tinted fill and tinted text**, on a **32px row pitch**, with a **2 × 3-dot
  drag handle** at the 16px inset and the chip starting 34px in.

**What we do today.** `option-color-picker.ts` is a **124px 12-swatch grid** with its own geometric
navigator (`getColorNavigationTarget`, `:138`). `cell-renderer.ts:1367` renders colour dots in the
option editor. Property-type icons already reach the dropdown (`bulk-edit-field-menu.ts:36-38`).

**Values that change.**

| Was | Is |
|---|---|
| "colour dots are the same idea in a second grammar — kept" | Unchanged for the option editor's dots |
| The colour picker is a swatch grid | **Anytype's is a labelled list.** Recorded as a measured alternative and **not adopted**: our 12-swatch grid at 124px is a shipped surface with a registered `048` pair, and swapping it for a 224px labelled list is a redesign this packet has no requirement for. What *is* adopted is the **trailing tick** (G14) and the **named-colour labels as accessible names**, since a swatch identified by hue alone is colour-only signalling |
| ADR-003's premise — "two near-identical grid navigators" | **Unaffected as stated** (both are ours, both are grids, `:138` and `:284`), but the line numbers it cites have drifted: `option-color-picker.ts:130-173` is now `:138`, and `icon-picker-popover.ts:281-306` is now `:284` |
| Option row geometry | **32px pitch, 24px chip, drag handle at the 16px inset, chip at 34px** — measured, and it is what our option editor already approximates |

**Phone.** Relevant. iOS drops the chip and renders the option as **coloured text** on a plain row
with a hairline divider (`sheet-cell-select-priority`). Ours may keep the chip; the finding is
recorded so nobody reads the phone capture as a demand.

---

### G16 — Hover / active row states

**Seen — the row's own premise is the one this true-up overturns.**

**Captures.** The 37 hover-reached menus. Measured on
`menus/anytype-menu-object-more-add-link-to-object-dark.png`.

**What the real screen does.** The hovered row is **`#232323`, 28px tall, x 383..617 in a panel at
x 372..627** — inset ~10px each side, i.e. a highlight narrower than the panel and wider than the
16px content inset. Measured contrast against its own `#171717` panel: **1.14:1**.

The same `#232323` is also the **search field's fill** and the **preselected row's** background in
`set-filter-property-picker`. One colour, three jobs.

**What we do today.** `.db-menu-item` styling is shared; the hand-built rows are where hover drifts.

**Values that change.**

| Was | Is |
|---|---|
| "the captures show no hover states ... the target is our own existing hover grammar" | **The premise is false (C1)** — 37 captures show it. The **conclusion survives**, and now for a measured reason rather than for want of evidence |
| — | **`#232323` at 1.14:1 is refused**, exactly as `050` §4 refused it. A hover that is the only thing marking a row's state has to clear 3:1 (WCAG 1.4.11) and this misses by a factor of three. Our hover and selection tokens stay ours |
| — | **Adopt the geometry, not the colour**: a highlight inset ~8-10px inside a 16px content inset, 28px tall, full row height. That is the part of Anytype's hover that is right |
| — | **Adopt the parent-row state signal** from G8: the row that owns an open child stays highlighted, and its chevron rotates. Two signals, neither of them colour alone |

**Phone.** Relevant only as dimming: `048`'s parent-dim is the phone's version of "this row owns what
is open", and `sheet-object-more-submenu` confirms it.
<!-- /ANCHOR:rows -->

---

<!-- ANCHOR:surfaces -->
## 4. THE FAMILY SURFACES, RE-EVIDENCED

`componentization-plan.md`'s census rows each name an Anytype pattern; AC-004 requires the cited
capture to resolve. Every row below now names a capture in `menus/` or `mobile/`, or says it has none.

| Row | Surface | Seen? | Capture now cited |
|---|---|---|---|
| M1 | Row context menu | **Seen** | `menus/anytype-menu-list-row-menu-dark.png` (256×459, 3 dividers), `…-kanban-card-menu`, `…-gallery-card-menu` — all three identical in geometry |
| M2 | Column header context menu | **Seen** | `menus/anytype-menu-set-column-header-dark.png` (256×500, 4 dividers, **two captioned sections**) |
| M3 | Column type submenu | **Seen** | `menus/anytype-menu-set-column-header-dark.png` `Property Type` section; `menus/anytype-menu-object-type-picker-change-type-dark.png` |
| M4 | Number display style submenu | **Not seen** | Anytype has no number-display styles (no rating/progress/ring). Stays ours, as the plan says |
| M5 | Text render mode submenu | **Not seen** | No text-render submenu in the sweep. **Design inferred from source, not seen** |
| M6 | All-views hub "more" menu | **Seen (analogue)** | `menus/anytype-menu-set-viewlist-dark.png` — caption `Views`, drag handles, trailing `＋ Add a view` |
| M7 | View-tab context menu | **Half** — desktop not captured; the **phone answer is** | `mobile/anytype-mobile-sheet-set-viewswitcher-edit-dark.png`: an iOS **edit mode** — red `⊖` per row, pencil, drag handle, blue ✓ done in the header. Not a context menu |
| M8 | View-type change menu | **Seen** | `menus/anytype-menu-set-view-layout-dark.png` / `…-set-layout-grid-dark.png` — a **tile grid with a 2px accent ring**, not a list |
| M9 | Record icon context menu | **Seen** | `menus/anytype-menu-object-icon-picker-dark.png` (408×412, tabs + search + category headers + footer bar) |
| M10 | Board group / card menus | **Seen** | `menus/anytype-menu-kanban-column-menu-dark.png` (224×341), `menus/anytype-menu-kanban-card-menu-dark.png` (256×459) |
| M11 | Calendar day / event menu | **Seen** | `menus/anytype-menu-calendar-day-menu-dark.png`, `…-calendar-item-menu-dark.png` — both **224×72, two rows** |
| M12 | Timeline / gantt row menu | **Not seen** | Anytype ships no timeline view. Stays ours; `037` parity unchanged |
| M13 | Gallery card menu | **Seen** | `menus/anytype-menu-gallery-card-menu-dark.png` (256×459) |
| M14 | Toolbar panels (utilities, title, switcher, export, new-template, group-by) | **Half** | `menus/anytype-menu-set-new-object-dark.png` (288×143, caption `Settings`, two trailing-value rows), `menus/anytype-menu-set-view-settings-dark.png` (360×316). **No export and no utilities analogue** |
| M15 | Active-rule chip edit popover | **Not seen** | Anytype has no chip row (`050` C2). **Design inferred from source, not seen** |
| P1 | Select / multi-select dropdown | **Seen** | `menus/anytype-menu-cell-select-dark.png` (300×144, 32px pitch, 24px chips), `menus/anytype-menu-nav-settings-preferences-select-1-dark.png` (225, plain) |
| P2 | Cell option editor | **Seen** | `menus/anytype-menu-cell-multiselect-dark.png` — chips + drag handles; `menus/anytype-menu-object-featured-tag-dark.png` — search + create-instruction empty state |
| P3 | Relation / object picker | **Seen** | `menus/anytype-menu-cell-object-dark.png` (300×300), `menus/anytype-menu-object-more-add-link-to-object-dark.png` (≈360 child: search, create row, list, right-aligned source label) |
| P4 | Date / time picker | **Seen** | `menus/anytype-menu-cell-date-dark.png` (288×271), `menus/anytype-menu-set-filter-date-picker-dark.png`, `…-date-relative` |
| P5 | Colour picker | **Seen, and it is a different shape** | `menus/anytype-menu-object-block-menu-color-dark.png` — a 224px **labelled list**, not a grid |
| P6 | Icon / emoji picker | **Seen** | `menus/anytype-menu-object-icon-picker-dark.png` (408×412) |
| P7 | Bulk-edit property picker | **Seen (analogue)** | `mobile/anytype-mobile-sheet-relation-add-dark.png` — search + **two typed group headers** |
| P8 | Summary / footer pickers | **Seen (analogue)** | `menus/anytype-menu-set-column-header-calculate-dark.png` — the calculate submenu |
| P9 | Calendar / timeline scale menus | **Seen (half)** | `menus/anytype-menu-calendar-month-select-dark.png`, `…-calendar-year-select-dark.png` (224/225, 28px rows). No timeline analogue |
| P10 | Record-icon field picker | **Seen** | `menus/anytype-menu-object-icon-picker-dark.png` |

**Five rows have no Anytype capture and now say so: M4, M5, M12, M15 and the desktop half of M7.**
Four of them are surfaces Anytype does not ship at all (number styles, text render modes, a timeline,
a chip row) and one is a right-click nobody drove. None may be designed from a screen.
<!-- /ANCHOR:surfaces -->

---

<!-- ANCHOR:widths -->
## 5. THE WIDTH DISPOSITION, RE-COUNTED

`componentization-plan.md` §3 and AC-007 both say **nine** bespoke widths. The command they name
returns **eight distinct literals at fourteen production call sites** (C9).

| Literal | Production call sites | Disposition against §2's measured tiers |
|---|---|---|
| **292** | `column-menu.ts:353`, `:426` | Already the named `COMPACT_MENU_POPOVER`. Anytype's context-menu tier is 256 and its compact tier 224; **ours stays 292** per `050` §4 |
| **420** | `cell-renderer.ts:1096` (min 360 / max 520), `calendar-toolbar-renderer.ts:98`, `calendar-timeline-toolbar-renderer.ts:74` | One **wider picker role** on the host. Anytype's counterpart is 288-300, far narrower; our relation row carries a title plus a source label plus a tick, so the role is derived from our row, not from theirs |
| **520** | `chart-toolbar-renderer.ts:347` | Outside the family. Left where it is, named here so the count reconciles |
| **318** | `icon-picker-popover.ts:244` | Picker-host role `grid`. Anytype's is **408**; ours is the content floor of our own emoji grid and stays |
| **124** | `option-color-picker.ts:119` | Picker-host role `swatches`. Anytype's colour picker is a **224px labelled list** — a different surface, not a wider one (G15) |
| **280** | `dropdown-field.ts:335` (min 180 / max 360), `chart-toolbar-renderer.ts:927` (min 220 / max 320) | Select-picker role on the host. `chart-toolbar-renderer.ts:927` is the compact preset's shape written out by hand and should take the preset |
| **252** | `date-value-picker.ts:420` | Picker-host role `date`. Anytype's is **288**; ours is a content floor and stays (G13) |
| **360** | `database-view.ts:3182`, `embedded-database-renderer.ts:2975`, `record-detail-panel.ts:408` (min 240 / max 420) | The `panel` role's top, and **the exact tier Anytype's panels measure**. Adopted by agreement, not by change |
| ~~240~~ | **none** | **Removed.** `chart-toolbar-renderer.ts:927` passes 280; the only 240 in the tree is `popover-position.stories.ts:40`, a story |
| *(widthless)* | `filter-panel-renderer.ts`, `sort-panel-renderer.ts`, `column-manager-renderer.ts` | Already `condition panel` at 552 per `001`; not this phase's, and **not to be narrowed to Anytype's 360** (§2's closing note) |
<!-- /ANCHOR:widths -->

---

<!-- ANCHOR:inherited -->
## 6. THE FOUR INHERITED 050 ITEMS, AT THEIR RESTATED THRESHOLDS

`050`'s `design-trueup.md` restated items 1, 4, 6 and 8 against the tree, and those restatements —
not `050`'s originals — bind here.

| Item | `050`'s restated threshold, binding | Confirmed on this tree | What this sweep adds |
|---|---|---|---|
| **1** — filter/sort trigger state (AC-001) | The chip row and the count badge both ship; Anytype's dual-mode icons are **rejected** (pixel-identical across 120 captures) and its colour-only signalling fails WCAG 1.4.11. Adopt the **`N applied` count label** only | Unchanged. `set-view-settings` renders `Sort   1 applied ›` beside a bare `Filter ›`, measured at 360px | **A procedural proof the icon is not an opener.** `README.md`'s "Not captured" table records that `#dataviewControls .btn-sort` "**is a state indicator, not an opener** — it dispatches no menu on `el.click()` and none on a real CDP mouse event". `050` inferred one mode from pixels; the sweep independently found the control has no menu at all. This phase's role is unchanged: the trigger menu opens through the primitive |
| **4** — duplicate view + tab context menu (AC-004 of `050`) | Duplicate and Remove live in the **view-settings panel**, last section below a divider. **No right-click on a view tab was captured**; a tab menu stays *design inferred from source, not seen* | Confirmed at 360px: `Duplicate view` and `Remove view` are the last section of `set-view-settings`, each a 28px row with a 16px leading icon below the second divider | **The phone answer, which `050` could not have.** `mobile/…-sheet-set-viewswitcher-edit` shows iOS's expression is an **edit mode on the view list** — a red `⊖` per row, a pencil, a drag handle, and a blue done tick in the header — not a per-tab context menu. That is a second, independent reason not to design a tab context menu, and it is the shape our phone move-rows (`toolbar-renderer.ts:1263-1273`) already approximate. **The desktop tab menu stays unseen** |
| **6** — cell-editor flip at the right edge | The 92px boundary is **source-derived**; the criterion that decides the item is *no open editor's right edge exceeds the viewport's* | Unchanged. `popover-position.ts` still has the vertical flip and no horizontal branch | **A captured horizontal flip, for the first time.** `menus/anytype-menu-object-more-advanced-dark.png` puts the parent at x 236..491 and the child **to its left**, where `…-add-link-to-object` puts the child to the right — the same menu family flipping side by available room. It still gives no boundary, so **the 92px stays source-derived**; what it gives is proof the guard exists and that G8's submenu placement and `050` item 6 want **one** implementation, not two |
| **8** — capability-gated menus, never empty (AC-009 of `050`) | `row-menu.ts` **cannot** render empty; the only violator is `bulk-edit-field-menu.ts:31-45`. Selection caps **not adopted**. The "No available actions" wording is **code-derived** | Confirmed: `bulk-edit-field-menu.ts` still maps `options` from `getBulkEditableColumns` with no floor | **Two captured empty-state strings, both of which name the action.** `object-featured-tag`'s *"Type to create a new option"* and `sheet-cell-multiselect-empty`'s *"Nothing found. Create first option to start."* — see G3. The **"No available actions" wording stays code-derived**, because no capture shows a fully-gated action menu; what changes is that the *picker* half of the fallback now has a real screen behind it |
<!-- /ANCHOR:inherited -->

---

<!-- ANCHOR:rollup -->
## 7. ROLL-UP

### Seen, not seen, and the four with no evidence at all

| Row | Surface seen? | Evidence | Phone-relevant |
|---|---|---|---|
| G1 fixed sections | **Seen**, incomplete | `object-more`, `set-column-header`, `set-viewlist`, `set-new-object` | Yes |
| G2 capability gating | **Seen** | `object-more`; `sheet-object-more` vs `sheet-set-more` | Yes |
| G3 never-empty fallback | **Half** — picker yes, action menu no | `set-sort-empty`, `object-featured-tag`, `sheet-cell-multiselect-empty` | Yes |
| G4 selection caps | **Not seen** | — | No referent |
| G5 item density | **Seen** | all 150 clipped menus | No |
| G6 destructive tone | **Seen**, platform-split | `object-more`, `nav-widget-bin`, `sheet-object-more` | Yes |
| G7 toggle labels | **Half** — control yes, label no | `set-layout-grid` | Yes |
| G8 submenus | **Seen**, contradicts | 37 hover captures; `sheet-object-more-submenu` | Yes |
| G9 submenu arrows | **Seen** | `object-more`, `set-column-header`, `set-view-settings` | Yes |
| G10 search-first pickers | **Seen** | 8 captures, both platforms | Yes |
| G11 create-option row | **Seen**, contradicts | `object-more-add-link-to-object` + 3 phone shapes | Yes |
| G12 section headers | **Seen**, contradicts | `sheet-relation-add`, `object-icon-picker` | Yes |
| G13 relative values | **Seen** | `cell-date`, `set-filter-date-relative` | Yes |
| G14 checkmarks | **Seen**, contradicts | `block-menu-color`, `column-header-align`, 2 phone | Yes |
| G15 icons per option | **Seen**, contradicts | `block-menu-color`, `cell-select` | Yes |
| G16 hover states | **Seen**, overturns its own premise | 37 hover captures | Yes, as dimming |

**Design inferred from source code, not seen: G4 (selection caps), the action-menu half of G3, the
label half of G7, and the desktop view-tab menu of M7.** Two of those (G4, M7's desktop half) need no
capture and their rows should stop implying one; two (G3's wording, G7's label) are `047`-derived and
say so.

### The values we adopt, and the four we refuse

**Adopted from measurement**, because a measurement outranks a default for the surface it covers:
the **28px row**, **16px content inset**, **8px radius**, **1px `#292929` border**, **16px divider
inset**, **44-48px section pitch**, **16px icon box with a 14px glyph and an optional icon slot**, the
**4 × 8px chevron at the 16px right inset**, the **28px `#232323`-shaped search field first in the
panel**, the **~8-10px highlight inset**, the **360px panel tier** (which our `panel` role already
tops), the **32px option-row pitch with a 24px chip and a drag handle at the 16px inset**, and the
**2px submenu gap with the child's top aligned to its opening row**.

**Adopted as behaviour**: **hover-open submenus on desktop**, guarded by `@media (hover: hover)`, with
click and `ArrowRight` retained; **Escape closes the innermost only**, now observed; **the submenu
flips to the parent's left at the viewport edge**, sharing one implementation with `050` item 6;
**the create affordance sits first, under the search and above the list**, with escalation actions
last; **the create affordance stays reachable when the list is empty**; **the tick is trailing**;
**pickers group only when they mix kinds**; **the parent row of an open child keeps its highlight and
rotates its chevron**; and **captioned sections** where a section configures rather than acts.

**Refused, and each with its measurement.**

1. **The `#232323` hover and preselect fill**, which measures **1.14:1** against its own `#171717`
   panel. A row highlight that is the only thing marking state has to clear 3:1 (WCAG 1.4.11). This is
   `050` §4's refusal, and this read is the first to measure it on a **hover** rather than on a
   preselect — which is what makes it this packet's refusal too, not an inherited one.
2. **The `Create` pill's height** in `sheet-cell-multiselect-empty`, ~35pt against the 44pt iOS floor
   and `044`'s 44px close. `055` refused the same pill on the states phase; the shape is adopted and
   the height is not.
3. **Anytype's 224px and 256px menu tiers**, against our documented 292px `menu` role.
4. **iOS's two checkmark grammars.** One product, two ticks, is the exact "two vocabularies for one
   affordance" defect G14 exists to close; we take one.

**Not adopted, with reasons**: `#E1E1E1`, `#A3A3A3`, `#3C7FFB` and `#4686FB` are fixed values in a
themed host — this is an Obsidian plugin and the user's theme owns them, so the `--db-text-*` roles and
`--interactive-accent` stand. Anytype's **408px grid picker** loses to our 318px content floor, its
**288px date picker** to our 252px one, and its **224px labelled colour list** to our shipped 12-swatch
grid, which has a registered `048` pair and no requirement to change.

**One deviation, named rather than absorbed.** The **28px row** is not on the 4/8/12/16/24/32 spacing
scale a greenfield design would use. It is adopted anyway, for the reason `050` §4 already recorded:
it is simultaneously Anytype's measured row height **and** our own `design-system.md` §9 coarse-pointer
floor. A measurement and an established project value agree; the scale default loses to both. On the
phone the floor is `044`'s 44px, unchanged.

### The census figures that were wrong

Three documents in this packet assert a baseline the tree does not have. None can be observed red as
written, and `checklist.md` already carries the right figure for the first of them.

| Where | Asserts | Measured 2026-09-05 |
|---|---|---|
| AC-002, REQ-002, SC-003, `componentization-plan.md` M14 | **71** hand-built sites; `toolbar-renderer.ts` **45** | **70** outside `menu-row.ts`; `toolbar-renderer.ts` **44**; **76** including `menu-row.ts`'s 6 |
| AC-007, `componentization-plan.md` §3 | **9 distinct** widths, including **240** | **8 distinct** at **14** production sites; 240 is a story value only |
| ADR-003 | navigators at `option-color-picker.ts:130-173`, `icon-picker-popover.ts:281-306` | `:138` and `:284`; the count of **2** is unchanged and correct |

`checklist.md` C2 is already right and C7 is not; C7's evidence cell is **T003's to correct**, and this
document does not edit it.
<!-- /ANCHOR:rollup -->

---

<!-- ANCHOR:cross-refs -->
## 8. CROSS-REFERENCES

- **Requirements**: `spec.md` §4, §7, §11
- **Thresholds**: `acceptance-criteria.md`
- **Tasks**: `tasks.md` — T001 is this document
- **Rulings**: `decision-record.md` — ADR-004 and ADR-005 carry this document's contradictions
- **Grammar**: `anytype-menu-grammar.md` — G1-G16, trued against this read
- **Migration table**: `componentization-plan.md` §1-§3
- **Method and the binding restatements**: `../050-anytype-adoption/design-trueup.md`
- **Sibling method**: `../055-states-feedback-and-motion/design-trueup.md`
- **Research source**: `../047-competitor-references-and-pm-alignment/research/research.md` §5, §6, §9
- **Capture index**: `../../../screenshots/anytype/README.md` — "Menus and dropdowns", and "Mobile (iOS Simulator)"
- **Token and role authority**: `../design-system.md` §5, §6, §9
- **Phone grammar**: `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: `../048-stacked-sheets/spec.md` §4
<!-- /ANCHOR:cross-refs -->
