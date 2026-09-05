---
title: "Design True-Up: The Twenty-Four Toolbar Surfaces Against the Menu, Catalogue and iOS Captures"
description: "One row per toolbar surface: the capture its design was read against or the named gap, the pixel values measured off that screen, what our tree does today, and the eight places the captures contradict 050's design-trueup and this packet's inventory."
trigger_phrases:
  - "toolbar design true-up"
  - "053 true-up"
  - "toolbar capture read"
  - "T001 capture record"
  - "chip rail capture"
  - "toolbar surface measurements"
importance_tier: "high"
contextType: "research"
---
# Design True-Up: The Twenty-Four Toolbar Surfaces Against the Captures

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This is T001's output and goal D1's gate. Every value below was measured off a file in
> `screenshots/anytype/`, read off a file in `screenshots/notion-clone/`, or read off a line in
> `src/views/`. Where a row cites `047`'s research or `050`'s `design-trueup.md`, it says so.
> Rows with no capture say **design inferred from source, not seen** and stop there.

---

<!-- ANCHOR:headline -->
## 1. THE HEADLINE, BEFORE THE TABLE

The 600-file menu sweep and the 118-file iOS set landed **after** `050`'s `design-trueup.md` was
written. Reading them changes that document in eight places, and six of the eight are cases where
`050` concluded a surface does not exist in the product because it was not in the 151 files it had.

**The two that matter most.**

**The chip rail exists, and it is photographed.** `050` C2 recorded "no chip row on any capture,
including the one whose view demonstrably carries a filter". It is on every List view in the
catalogue — five sets, both themes — and on the Grid view in the menu sweep. It carries a leading
accent-tinted `↓ 2 sorts ⌄` pill, a 1px rule, one unfilled chip per filter reading
`⊙ Status (Project Tracker) ⌄`, a `+ Filter` add control, and a right-aligned `Clear`. That is the
layout `spec.md` §6 B2 asked for, and it is now measured rather than inferred.

**The per-view default exists, and it is in the New menu.** `050` C7 recorded that a per-view
template override is "absent from the product", having looked in the view-settings panel and found
no row. It is one surface over: the `New ⌄` split button's menu carries a `Settings` section with
`Default Type for this View   Page ›` and `Template for this View   Blank ›`, each opening its own
anchored picker. `047` §8 was right and `050` was looking in the wrong place.

Neither finding is a criticism of `050`. Both are the predictable result of a capture set growing,
and both are exactly what a capture-read gate exists to catch.

### Where the capture wins, in one list

Eight contradictions, each resolved in the capture's favour per `050` ADR-003. Each is expanded in
its row and each is carried into `decision-record.md`.

| # | The prior document says | The captures show | Rows |
|---|---|---|---|
| D1 | `050` C2: no chip row on any capture | The rail, on 10 catalogue captures and 1 menu capture, fully measurable | T14, T11, T12 |
| D2 | `050` C7: no per-view default exists in the shipped product | `Default Type for this View` and `Template for this View`, in the New menu | T10, T19 |
| D3 | `050` REQ-013: Anytype's filter panel "is a 360px frame whose entire body is one `+ New filter` row" | That is the empty state. The populated panel is captured across twelve relation formats | T15, T16 |
| D4 | `050`: "**60**, Anytype's own captured default, adopted as ours" | Page limit is **per-layout**: Gallery 60, Kanban 10, and Grid/List/Calendar/Graph carry no page-limit row at all | T19, T24 |
| D5 | This inventory §4: formulas, rollups **and calculations** have "no Anytype equivalent" | True of formula and rollup. **False of calculations** — `Calculate ›` is a column-header submenu | T13 |
| D6 | This inventory T17: the sort panel is `no capture` | Captured, twice. But `anytype-menu-set-sort-direction-*` is **byte-identical** to `-added`, so the direction *chooser* is still unseen | T17, T12 |
| D7 | `050` REQ-012: the inline rung is "view tab row only" | Correct, and narrower: the inline tab row also drops the trailing `+` | T24 |
| D8 | This inventory T2: the view-tab context menu is unseen on every form factor | Unseen on desktop, and the desktop view list has no per-row action at all. **Seen on iOS**, as an explicit Edit mode | T1, T2 |

One prior finding is **confirmed rather than contradicted**, and it was worth checking: `050` said
the Kanban settings panel inserts one `Groups ›` row between Layout and Properties. It does —
`anytype-set-kanban-view-dark.png`, read directly. What `050` could not see is that the Layout
sub-page *also* carries a `Group by` row, so Anytype reaches grouping through two entry points.
<!-- /ANCHOR:headline -->

---

<!-- ANCHOR:method -->
## 2. HOW THE CAPTURES WERE READ

**Three sets, three scales, and only one of them is 1:1.**

| Set | Files | Geometry |
|---|---|---|
| Catalogue (`screenshots/anytype/*.png`) | 120 + 15 named | 2168×1217, **1 device px = 1 CSS px** |
| Menus (`screenshots/anytype/desktop/menus/`) | 600 — 150 menus × 2 themes × (clipped + `-full`) | `-full` is the same 2168×1217 window; the clipped file is the menu **plus its drop shadow** |
| iOS (`screenshots/anytype/mobile/`) | 118 — 59 states × 2 themes | 1206×2622 px at 402×874 pt — **3× — every phone number below is the measured pixel ÷ 3** |

**The 1:1 claim is re-proved, not inherited.** The toolbar icon pitch measures **32px** in
`anytype-project-tracker-list-light.png` and again in `anytype-menu-set-viewlist-dark-full.png`,
matching `050`'s independently measured 32-33px. The settings panel's body measures **x 12..373 =
360px** in the clipped dark file, matching `050`'s 360px read off a different capture in a different
folder. Two folders, two methods, one number.

**Clipped menus are measured from their border, not their frame.** The clip includes ~11px of
shadow on each side, so `anytype-menu-set-view-settings-dark.png` is 382px wide and its panel is
360px. Every width below is the `#292929` (dark) border-to-border distance, read with a per-pixel
scan.

**Colour is sampled, never eyeballed**, for the reason `050` records: the first pass of *that*
read called a grey funnel blue. Every hex here comes from a per-pixel run-length scan and every
contrast figure from the WCAG relative-luminance formula.

### The measured Anytype system, extended

`050`'s system table stands. These are the values this sweep adds or corrects.

| Property | Measured value | Where |
|---|---|---|
| Panel width | **360px** (body, border to border) | View settings, every settings sub-page, every filter panel — `-dark` clipped, x 12..373 |
| Menu width | **not one number**: 288px New menu, 280px column header, ~259px property picker | `set-new-object-dark` x 12..299; `set-column-header-dark` x 0..279; `set-filter-property-picker` 281px frame |
| Row height, menus and settings | **28px pitch** | View settings rows y 126→154→(divider)→199→227; New menu rows y 99→127 |
| Sort rule row | **36px tall, 48px pitch** | `set-sort-added-dark` y 56..91 and 104..139 |
| Section divider | 1px, `#292929` dark / `#EBEBEB` light, **~8px clearance** each side of the row box | View settings y 182 and 255 |
| Toolbar icon | **28×28px box on a 32px pitch** | Icon centres x 1906 · 1938.5 · 1970.5 · 2002.5 |
| Open-trigger state | **28×28px rounded fill, `#232323`** | `anytype-view-settings-panel-dark.png` x 845..872, y 219..247 |
| Toolbar band | tab row y 219..246, **1px full-content-width divider at y 261**, rail y 274..301 | `anytype-project-tracker-list-light.png` |
| Rail chip | **28px tall, fully rounded (r≈14), ~12px horizontal padding, 99px wide at "2 sorts"** | Same file, x 682..780, y 274..301 |
| Rail chip fill | `#E2ECFE` light · `#1D2739` dark | x 706, y 288 |
| Accent | `#3C7FFB` desktop · **`#377AFF` iOS** | Chip glyph; phone New button |
| `New` button | **70×28px, fully rounded, `#3C7FFB` fill, white label, one pill — no split** | x 2027..2096, y 219..246 |
| `New` button, phone | **73×28pt, split by a 1pt `#699BFF` rule** at 47pt / 27pt | `anytype-mobile-sheet-set-viewswitcher-light.png` ÷3 |
| Sheet row, phone | **~53pt pitch** | View switcher dividers at y 1816/1974/2132/2290/2448 ÷3 |
| Grab handle, phone | **36×5pt** | x 549..656 ÷3 |
| Layout tiles | 2 columns × 3 rows desktop, 3+1 on iOS; selected carries a **2px accent ring and an accent label** | `set-layout-*` |

### The four contrast readings, and what they cost Anytype

Every one of these is a **refusal**, and three of them are the same defect in three places.

| Pair | Ratio | Verdict |
|---|---|---|
| Open-trigger fill `#232323` on panel `#171717` | **1.20:1** | Fails WCAG 1.4.11's 3:1. This is `050`'s `#232323` row highlight a third time: hover, selection **and** expanded state are all signalled at ~1.2:1 |
| Chip label `#3C7FFB` on chip fill `#E2ECFE` | **3.14:1** | Fails 4.5:1 for a ~13px label |
| Chip fill `#E2ECFE` on the bar `#FFFFFF` | **1.19:1** | The chip's own boundary is not a 3:1 indicator either, so the fill cannot carry the state alone |
| Inactive view tab `#B6B6B6` on `#FFFFFF` | **2.03:1** | An unread tab label at a third of the required ratio |
| `New` label white on `#3C7FFB` | **3.74:1** | Fails 4.5:1 for its label |

**We take the geometry and leave the colour, exactly as `050` ruled.** Every number in §3's *Take*
column is spatial or structural. No Anytype hex enters our tree: this is an Obsidian plugin and the
user's theme owns `--interactive-accent`, `--text-accent` and the background ramp.
<!-- /ANCHOR:method -->

---

<!-- ANCHOR:rows -->
## 3. THE TWENTY-FOUR ROWS

Row ids are `toolbar-surface-inventory.md` §3's. Each carries: **seen or not**, the capture files,
what the screen does, what our tree does, and what changes.

---

### 3.1 The toolbar row and its clusters

#### T1 — View tabs and the add button · `050` item 4

**Seen.** `anytype-project-tracker-{grid,list,gallery,kanban,calendar,graph}-light.png` and their
dark pairs; `anytype-menu-set-viewlist-{light,dark}.png` and `-dark-full`;
`anytype-set-kanban-view-dark.png`; `anytype-mobile-sheet-set-viewswitcher-light.png`.

**What the screen does.** A text tab row with a trailing `+`. Tabs are separated by **18px** of
whitespace, edge of glyph to edge of glyph, measured five times across six tabs
(`Grid`→`Gallery`→`List`→`Kanban`→`Calendar`→`Graph`: 18, 18, 18, 18, 18). Active `#252525` bold,
inactive `#B6B6B6` regular; **cap height 13px, so ~18px type** — the tab row is the largest text in
the chrome, not the smallest. A **1px full-content-width divider at y 261** separates the tab row
from everything below it.

Overflow is **not** a `+N` collapse. The view list opens as a separate 360px popover
(`set-viewlist`) titled `Views`, listing every view as a **28px row with a leading drag grip**, a
divider, then `+ Add a view`. There is **no per-row action affordance** — no `···`, no chevron.

**What we do today.** `renderViewTabs` (`toolbar-renderer.ts:840-931`) with roving tabindex, drag
reorder (`:978-1021`), a measured `ResizeObserver` overflow collapse (`:895-917`) and a hub fallback
(`:1022-1085`). We already do more here than the capture shows.

**Values that change.**

| Was | Is |
|---|---|
| Tab gap unspecified | **18px**, measured. Off our 4/6/8/12 spacing tokens; the nearest is `--db-space-8` territory. **Adopt 16px** (`--db-space-6`), the on-scale neighbour, and record the 2px deviation rather than adding an 18px token |
| Tab type unspecified | ~18px, and **not adopted**. Our tab row lives inside a plugin's note chrome, not a full-window app; the `design-system.md` type scale governs |
| Inactive tab colour | **Rejected at 2.03:1.** Our inactive tab keeps `--text-muted`, which the theme guarantees against its own background |
| The hub is a fallback | Confirmed as the right shape: Anytype's view list **is** a hub, always, with drag grips. Our hub already carries rename-in-place, which theirs does not |

**Phone.** The tab row becomes a **`Grid ⌄` dropdown** — confirmed on real iOS chrome, not on
marketing creative. That is `050` REQ-012's phone rung with pixels behind it for the first time.

---

#### T2 — View-tab context menu · `050` item 4

**Half seen, and the half that is seen is on the phone.**

**Captures.** `anytype-menu-set-viewlist-light.png` (desktop, and it has no per-row action);
`anytype-mobile-sheet-set-viewswitcher-edit-light.png`; `anytype-mobile-sheet-view-edit-more-light.png`.
**Not captured:** any right-click on a desktop view tab. The README's `menus.mjs` account confirms
the sweep never drove one, and its `DESTRUCTIVE`/`MUTATING` refusal list names "Remove view" and
"Add a view" explicitly.

**What the screen does.** On desktop, **nothing** — `Duplicate view` and `Remove view` are in the
settings panel and the view list offers only reorder and switch. `050` C4 stands.

On iOS the surface exists and is captured (**D8**). The view switcher's header is
`[Edit] [Views] [+]`; pressing `Edit` turns the left slot into a **blue circular ✓** and gives every
row three affordances: a **red ⊖ delete handle on the left**, a **✎ pencil on the right**, and a
**≡ reorder grip at the far right**. Separately, the Edit-view sheet's `···` opens a **dark floating
menu** with `Duplicate` (white) and `Delete view` (**red**).

**What we do today.** `showViewTabMenu` (`toolbar-renderer.ts:1229-1284`) with rename,
copy-current-view, copy-view-code, change type, move-to-first/last and delete, on a
`db-view-tab-popover-row db-menu-item` dual class.

**Values that change.**

| Was | Is |
|---|---|
| "design inferred from source, not seen" on both form factors | **Desktop: still true, and now with a stronger negative** — the view list was captured and has no per-row action, so a desktop tab menu is ours, not Anytype's. **Phone: seen**, and it is an explicit Edit mode, not a long-press |
| The phone equivalent is a long-press | **Rejected.** A long-press is undiscoverable and has no affordance; Anytype's `Edit` button is a visible control that reveals three affordances at once. If this phase gives the tab strip a phone action surface, it is an Edit toggle |
| Destructive styling unspecified | Anytype is **inconsistent**: `Remove view` is neutral on desktop, `Delete view` is red on iOS. We pick one and it is ours — `sk-design` hierarchy rule 4 says destructive is styled by hierarchy, and our `confirm-modal` already carries the destructive treatment |

**Phone.** `044`'s grammar holds: the switcher sheet has a handle, a title row and padded rows. The
`···` menu is a **dark platform menu, not a sheet** — a divergence recorded, not adopted, since
`owned-menu` is a registered `sheet-grammar` surface and D5 makes that a constraint.

---

#### T3 — Add-view popover

**Seen, indirectly.** `anytype-menu-set-viewlist-light.png` (`+ Add a view` as the list's footer
row); `anytype-menu-set-new-object-default-type-for-this-view-light.png` (the type-picker pattern).
**Not captured:** what `+ Add a view` opens — `menus.mjs` refuses it by name as a mutating action.

**What the screen does.** `+ Add a view` is a **28px row with a leading `+`, below a divider, at the
foot of the view list** — the same footer-add shape as `+ New filter`, `+ Add sort` and
`+ Add Property`. Anytype uses one add-affordance vocabulary across four surfaces.

**Values that change.** The form stays bespoke and the 15-view cap stays ours. **Adopt the footer-add
row shape**: `+` icon, 28px row, below a divider, last in the surface — because we already use four
different add affordances and this is one line of consistency at no cost.

**Phone.** The `+` sits in the sheet header's right slot, not as a footer row. Both shapes are
Anytype's; the header `+` is the phone one.

---

#### T4 — All-views hub

**Seen.** `anytype-menu-set-viewlist-{light,dark}.png` — this *is* Anytype's all-views hub.

**What the screen does.** 360px popover, `Views` header in the secondary grey, six 28px rows each
with a **leading 6-dot drag grip**, a divider, `+ Add a view`. Row labels are primary text at the
same weight whether or not the view is active — **the hub does not mark the current view**.

**Values that change.**

| Was | Is |
|---|---|
| "overflow list pattern", cited from `anytype-view-settings-panel-dark.png` | Wrong file. The pattern is `set-viewlist`, measured above |
| Hub width unspecified | **360px** measured — but ours is a `menu`, and `design-system.md` §5 puts `menu` at 292px. **Keep 292px.** A measurement outranks a default *for the surface it covers*; this one covers a 360px panel-role surface, and our hub is not that |
| No current-view marker | **Not adopted.** A hub that does not say which view you are in fails the same "second signal" test as colour-only state. Ours keeps its marker |
| Drag grips | **Adopt.** Our hub reorders by drag on the row itself; a visible grip is the affordance the capture shows and the phone Edit mode shows again |

**Phone.** The view switcher sheet is this surface. Its rows are ~53pt, well above `044`'s 44px
floor.

---

#### T5 — Database switcher

**Not seen, and none is possible.** `no capture` — Anytype has no multi-database switcher; a set
is an object, and switching means navigating. **Design inferred from source, not seen**; the whole
surface stays ours, and shell migration stays optional as the inventory already says.

---

#### T6 — Title actions menu

**Not seen.** The set's title `···` was captured as `anytype-menu-object-more-*`, which is the
*object* menu, not a database-title menu; the two are different surfaces and the packet may not
borrow across them. **Design inferred from source, not seen.** Action set stays ours; the shell
migrates.

---

#### T7 — Utilities overflow

**Half seen.** `anytype-menu-object-more-light.png` (the desktop capability menu — pattern
reference, five sections, already measured by `050`); `anytype-mobile-sheet-set-more-light.png`
(the phone form).

**What the screen does.** The phone overflow is a **dark floating menu**, not a sheet:
`··· More ›`, a divider, `Duplicate`, `Delete` in red. Rounded ~16pt, no handle, no title.

**Values that change.** The desktop section grammar is `050`'s and unchanged. The phone shape is
**recorded and not adopted** — `044` REQ-007's amendment gives `owned-menu` a title row and a 44px
close, and D5 makes that a constraint this phase consumes rather than renegotiates.

---

#### T8 — Group-by popover

**Seen, and it is far smaller than ours.** `anytype-menu-set-layout-kanban-light.png`;
`anytype-mobile-sheet-kanban-groupby-light.png`; `anytype-set-kanban-view-dark.png`.

**What the screen does.** Grouping has **two desktop entry points**, which is the finding:
`Groups ›` in the settings panel root (board only — confirmed, `050`'s claim holds), and
`Group by   Priority (Project Tr… ›` inside the **Layout sub-page's Kanban block**, alongside
`Color columns` as a toggle. On iOS it is one sheet listing every groupable relation with the
current one ticked.

**Values that change.**

| Was | Is |
|---|---|
| `no capture` | Captured on three surfaces |
| — | **Two entry points for one decision is not adopted.** `design-system.md` §10 names "two mechanisms for one decision" as an anti-pattern with its own scar. Our group-by keeps one trigger |
| Our control set is unjustified breadth | **Confirmed as ours and justified**: Anytype offers group-property and column-colour; our switch, date-mode, row-limit and subgroup rows have no Anytype referent and D4 already rules them ours |

---

#### T9 — Export popover

**Not seen.** No export menu appears in the 600-file sweep; `menus.mjs` reached the object `···`
menu's `Export` row but not its dialog. **Design inferred from source, not seen.** Rows stay ours;
`renderExportButton` (`:2290`, dead) is deleted with the other six under ADR-002.

---

#### T10 — New button and template menu · `050` item 10

**Seen, and it overturns `050` C7 (D2).**

**Captures.** `anytype-menu-set-new-object-light.png`;
`anytype-menu-set-new-object-default-type-for-this-view-light.png`;
`anytype-menu-set-new-object-template-for-this-view-light.png`;
`anytype-menu-set-new-object-existing-object-light.png`;
`anytype-mobile-sheet-set-newobject-templates-light.png`.

**What the screen does.** The `New ⌄` chevron opens a **288px menu**:

```
→ Existing object                        ›
─────────────────────────────────────────
Settings
Default Type for this View        Page   ›
Template for this View           Blank   ›
```

Rows at a **28px pitch**, divider at y 56 (`#EBEBEB`), section label `Settings` in secondary grey.
`Default Type for this View` opens a **separate anchored popover to the left**, overlapping and with
the parent **undimmed and its invoking row highlighted**: a `Filter Types…` search field, a
`My Types` section label, then a scrolling type list with per-type icons. `Template for this View`
opens a **card grid** — two columns of template preview cards plus a `+` tile.

**The button itself is one pill on desktop** — 70×28px, `#3C7FFB`, no internal divider — and a
**true split button on phone**, 73×28pt divided by a 1pt `#699BFF` rule at the 47pt mark.

**What we do today.** `renderNewButton` (`toolbar-renderer.ts:2346-2407`) is already a split
`db-new-button-group` with a primary and a chevron, plus a touch FAB. `createEntry` accepts a
`defaults` record (`:157-159`) that no caller passes.

**Values that change.**

| Was | Is |
|---|---|
| `no capture` — "Anytype's template picker was not captured; the adopted slice is deliberately template-lite" | **Captured, three surfaces deep.** The slice stays template-lite, but now as a *choice against a seen alternative* rather than as a gap |
| `050` C7: no per-view default exists | **False.** `Default Type for this View` and `Template for this View` are per-view defaults, in this menu (**D2**) |
| Item 10 narrows to per-field defaults *because the product has none* | The **narrowing stands, the reason changes.** We have no type system and no template system to default; per-field values are the only per-view default our data model can carry. That is a scope fact, not an absence in Anytype |
| The presets section's placement was undecided | **The New menu's `Settings` section is the captured home for a per-view creation default**, not the view-config panel. REQ-106's section is better placed on the New menu's dropdown, where the reader already is when they create a row |
| Our split button is "ours, not Anytype's" | Half right. Desktop's is **not** split; **the phone's is**, at a 1pt divider. Our split shape matches the phone and diverges from the desktop — record it, keep ours |

**Phone.** `anytype-mobile-sheet-set-newobject-templates` is the phone form of the template picker,
as a sheet. Our presets section lands in the settings sheet, already `sheet-grammar`-registered.

---

### 3.2 The control clusters — triggers and chips

#### T11 — Filter trigger · `050` item 1

**Seen, on 122 captures, and `050` C1 is confirmed to the pixel.**

**Captures.** All 120 catalogue captures; `anytype-menu-set-viewlist-dark-full.png`;
`anytype-view-settings-panel-dark.png`; `anytype-set-kanban-view-dark.png`.

**What the screen does.** The funnel measures **`ink=52, sat=0`** on `…-list-light.png` (filter:
Status — a filtered view), on `…-grid-light.png` (sort only), and on `…-gallery-light.png` (neither).
Identical to the pixel, three views, cross-checked against `tools/mock-data/anytype/views-report.json`
for which view carries which rule. **There is no second mode.** `050` C1 stands, re-derived
independently on light theme where `050` measured dark.

**What the trigger *does* signal**, and this is new: while its popover is open it carries a
**28×28px rounded `#232323` fill** (`anytype-view-settings-panel-dark.png`, x 845..872). That is the
expanded state, expressed as a background — at **1.20:1**.

**Values that change.**

| Was | Is |
|---|---|
| Dual-mode rejected on `050`'s dark-theme read | **Rejected on two independent reads.** Light theme, three views, same numbers |
| No captured expanded state | **Captured: a 28×28px rounded fill.** The geometry is adopted — it is also our own coarse-pointer floor. The **1.20:1 tint is refused**; our open-state background clears 3:1 or the state rides `aria-expanded` plus a second visible signal |
| Trigger box unspecified | **28×28px on a 32px pitch**, measured. `createControlClusterButton` sizes from this |

**Phone.** There is **no filter trigger on the phone toolbar at all** —
`anytype-mobile-sheet-set-viewswitcher-light.png` shows `[Grid ⌄] … [settings] [New|⌄]` and nothing
else. The phone control set is different, not narrowed, which is a second reason the dual-mode
rejection holds: there is no phone trigger for a second mode to live on.

---

#### T12 — Sort trigger · `050` item 1

**Seen, same 122 captures, same verdict — with one caveat `050` could not have known.**

**What the screen does.** The sort glyph measures **`ink=80, sat=80`** — fully saturated — on the
sorted Grid, the filtered List **and** the unsorted Gallery. It is a **static two-tone glyph**, not a
state. `050` C1's second half confirmed.

**The caveat.** The README's *Not captured* table records why the sort icon has no menu: *"It is a
state indicator, not an opener. It dispatches no menu on `el.click()` and none on a real CDP
`Input.dispatchMouseEvent` either."* Anytype's own crawler author read it as a state indicator; the
pixels say it does not change with state. **Both can be true** — it may indicate state through a
tooltip or a hover treatment neither the capture nor the crawler reached. Recorded as a genuine
ambiguity rather than resolved, because a still cannot resolve it.

**What that costs the design: nothing.** Either reading rejects a *dual-mode* trigger, because the
one thing measured is that the icon does not change. And our count badge
(`toolbar-renderer.ts:2575-2579`) already carries a text signal, which beats both readings.

**Values that change.**

| Was | Is |
|---|---|
| Static glyph, from `050`'s read | Confirmed independently, plus the README's contrary interpretation recorded as unresolved |
| Sort trigger opens the panel | **Anytype's does not open anything** — the sort surface is reached through settings ▸ Sort. Ours opens a panel and **stays ours**: a direct trigger is one fewer step, and our panel is a first-class surface |

**Phone.** No sort trigger on the phone toolbar either. Sorts are reached through Edit view ▸ Sorts.

---

#### T13 — Properties trigger

**Seen, on two surfaces `050` never had.** `anytype-menu-set-view-properties-light.png`;
`anytype-menu-set-column-header-{light,dark}.png`; `-calculate-`; `-align-`.

**What the screen does.** The Properties sub-page is a 360px scrolling list, one **28px row per
property**: `⠿ grip · format icon · label · toggle`. `Name` is **greyed and carries no toggle** — it
cannot be hidden, and the row says so by staying visible rather than disappearing. A `+ Add Property`
footer row sits below a divider.

The **column-header menu** is a 280px, five-section menu:

1. `Property name` label + the editable name row
2. `Property Type` label + `📄 Object`
3. `Open as Object` · `Duplicate` · `Remove from Collection`
4. `Add filter` · `↓ Sort ascending` · `↑ Sort descending` · `Insert left` · `Insert right` · `Hide Property`
5. `Align ›` · **`Calculate ›`**

`Calculate ›` opens a submenu (`None`, `Count ›`) to the right, overlapping, parent undimmed, the
invoking row highlighted.

**Values that change.**

| Was | Is |
|---|---|
| `no capture`; "state plumbing only" | Captured on two surfaces. State plumbing is still all this row does, but the design now has a reference |
| This inventory §4: calculations have "no Anytype equivalent" | **False for calculations** (**D5**). `Calculate ›` exists. The **ruling still stands** — D4 makes it program-ruled and our calculations are far richer — but the *reason* is corrected, because "no equivalent exists" is now a claim the captures refute |
| The undisableable `Name` row | **Adopt the vocabulary**: a property that cannot be hidden renders greyed with no control rather than being omitted. That is `row-menu.ts`'s own documented reasoning — *"disabled documents that the action exists but doesn't apply here"* — reached independently by Anytype |

**Phone.** `Properties  27 applied ›` in the Edit-view sheet — see T19.

---

#### T14 — Active-rule chip rail · `050` item 1 · **the row that changes most**

**Seen. Ten catalogue captures and one menu capture. `050` C2 is wrong (D1).**

**Captures.** `anytype-project-tracker-list-light.png` and its dark pair;
`anytype-crm-contacts-deals-list-light.png`; `anytype-reading-list-list-light.png`;
`anytype-course-notes-list-light.png`; `anytype-content-calendar-list-light.png`;
`anytype-menu-set-viewlist-dark-full.png`.

**What the screen does**, measured on `anytype-project-tracker-list-light.png`:

```
[↓ 2 sorts ⌄]  │  ⊙ Status (Project Tracker) ⌄     + Filter  ………………  Clear
 x682..780        x789   x809………………………………x995        x1024..1075        x2054..2088
```

| Element | Measured |
|---|---|
| Rail band | **y 274..301**, below a 1px full-content-width divider at y 261 |
| Sorts chip | **99×28px**, fully rounded (left edge reaches full width 14px down from the top), fill `#E2ECFE` light / `#1D2739` dark |
| Sorts chip contents | leading **`↓` direction arrow** in accent, the aggregate label `2 sorts`, a trailing `⌄` |
| Chip padding | ~13px leading to the arrow, ~11px trailing from the chevron |
| Group separator | **1px `#EBEBEB` at x 789**, 9px after the chip, 20px before the next |
| Filter chip | **unfilled** — format icon (14px) at x 809, 9px gap, label `Status (Project Tracker)`, trailing `⌄`. One chip per filter |
| Add control | `+ Filter`, 29px after the last chip |
| Clear-all | `Clear`, **right-aligned** at the content edge |

**And it is conditional.** Scanning x 705 and x 760 at y 288 across sets: the rail is present on
**5 of 5 List views** (each carrying a filter) and absent on **Grid, Gallery, Kanban, Calendar and
Graph** in the same sets. The dark Grid in the menu sweep *does* carry it, reading `2 sorts` where
`views-report.json` records one — the sweep's own interaction added a second. **So: the rail
auto-hides, and the exact predicate is not decidable from stills.** What is decidable is that it
hides, which is the behaviour the requirement needs.

**What we do today.** `active-view-controls-renderer.ts` renders **one chip per sort** with an arrow
icon and an ordinal, then a `1px × 16px` group separator (`styles.css:1761-1768`), then filter chips
with an AND/OR logic toggle, then a clear-all; auto-hides at `:97`; preserves `scrollLeft` at `:67`;
masks the overflow edges at `styles.css:22523`. Chip: **26px tall**, `--db-radius-md` (6px),
`color-mix(accent 11%)` fill, `--text-accent` label.

**Values that change.**

| Was | Is |
|---|---|
| "the rail sits below the toolbar rather than in it" | **The capture puts it below the toolbar too** — below a full-width divider, in its own band. Our placement is already the captured one. **The `spec.md` §4 REQ-102 clause "the rail moves into the toolbar band under the clusters" is withdrawn**, and with it `spec.md` §8's risk row 2 and `goal.md`'s open question about `.db-header` height — there is no move, so there is no sticky-offset risk |
| Chip height unspecified | **26px → 28px.** The measurement and our own `design-system.md` §9 coarse-pointer floor agree, which is the same justification `050` used for its 28px row |
| Chip radius unspecified | Measured **fully rounded (r≈14)**. **Not adopted — keep `--db-radius-lg`, 8px.** 14px is off our radius scale (4/6/8) and `sk-design`'s border-radius rule is explicit that mixing pill and square corners in one interface reads worse. Our popovers are 8px; the chip matches them |
| Group separator unspecified | **1px, ~9px before and ~20px after.** Ours is 1px × 16px tall with `--db-space-2` (4px) margins. **Adopt the asymmetry loosely: 8px before, 12px after** — on-scale neighbours of the measured 9 and 20 |
| One chip per sort | **Anytype aggregates (`2 sorts`); we do not, and we should not.** An aggregate chip cannot be individually removed or edited, which is what our per-chip edit popover and `×` exist for. Recorded as a deliberate divergence |
| "the leading sort chip is direction-coloured" | **Amended, and this is the substantive design change.** The phone Sorts sheet carries direction as the **word** `Ascending` on a second line; the desktop chip carries it as the **`↓` glyph**. Anytype never carries direction by colour alone. Our chip already has the arrow and an ordinal. **Direction colour is permitted only as a redundant third signal and may never be the only one** — `sk-design` ALWAYS-5 and WCAG 1.4.11 both bind, and the accent-on-tint pair measures 3.14:1 |
| Chip fill as the state indicator | **Refused at 1.19:1 against its own bar.** Our fill is `color-mix(accent 11%)` against a theme background and carries accent-coloured text plus an icon, so the state has two signals before the fill is counted |

**Phone.** The rail already renders on phone through the same renderer and scrolls horizontally.
Anytype's phone toolbar has no rail at all, so there is nothing to take.

---

#### T15 — Active-rule edit popover

**Seen, and richer than the cited reference.** `anytype-menu-set-filter-select-light.png`;
`-select-condition-`; `-text-short-condition-`; `-date-`; `-date-relative-`; `-checkbox-`.

**What the screen does.** Editing one rule is a **three-level stack**, each level a separate
anchored popover over an undimmed parent:

1. the filter panel, listing properties and applied filters;
2. the **condition popover** — the property name, an operator control, a `···` overflow, then the
   format's value control;
3. the **operator list**, with the current operator marked by a **`✓` at the right**.

The value control is per format: a searchable `Filter or create options…` field over coloured tag
chips for select; a plain text input for short text; a two-item `Checked`/`Unchecked` list for
checkbox; and for date, a **segmented `Exact | Relative` control** over either a full month calendar
(`‹ September 2026 ›`, `Mo…Su`, 6×7 grid, today in accent, out-of-month dimmed) or a five-item
relative list (`Today ✓`, `Tomorrow`, `Yesterday`, `Number of days ago`, `Number of days from now`).

**Values that change.**

| Was | Is |
|---|---|
| `anytype-filter-tag-value-picker-dark.png` as the value-picker pattern | Superseded by twelve per-format captures |
| — | **Adopt the `✓` on the current choice** in every operator and direction list. We mark selection by highlight; a check is a shape, not a colour |
| — | **Adopt the searchable picker.** Every long picker in the sweep opens with a filter field: `Filter Types…`, `Click to filter…`, `Filter or create options…`. Our property picker has none |
| — | **Adopt the segmented `Exact | Relative`.** `050` REQ-013 listed "segmented choices" as one of three grammar elements no still could show. A still shows it |
| — | **`create` inside the picker** (`Filter or create options…`) is **recorded, not adopted** — creating a select option from inside a filter is a data mutation from a read surface, and nothing in this phase's scope asks for it |

---

### 3.3 The rule panels

#### T16 — Filter panel · `050` item 1 consumer

**Seen, twelve formats deep, and `050` REQ-013's account of it is superseded (D3).**

**Captures.** `anytype-menu-set-filter-property-picker-light.png` and, per format,
`anytype-menu-set-filter-{checkbox,date,email,file,multiselect,number,object,phone,select,text-long,text-short,url}-light.png`
each with a `-condition-` pair; `anytype-menu-set-filter-date-picker-`; `-date-relative-`;
`anytype-mobile-sheet-view-filters-empty-`; `-filter-relation-picker-`; `-filter-condition-text-`;
`-filter-condition-operators-`.

**What the screen does.** The panel is **360px wide with a content-driven height** — 192px for short
text, 256 for number, 366 for checkbox, 498 for select, 576 for date, 824 for object. Its body is
`‹ Filter` header, then **applied filters at the top as accent-tinted pills reading the whole
condition as a phrase** — `📅 Starts is today`, `☑ Blocked is unchecked` — each with a `···`; then
the remaining properties as plain rows; then a divider; then `+ New filter` and `🗑 Clear`.

`050` saw only the empty state, where the body is the `+ New filter` row alone. Both are real; the
empty one is not the panel.

**What we do today.** A compound builder at `condition panel` width (440-560px) with an
`AND (all)` conjunction control, per-row group and negate buttons, nested AND/OR/NOT trees
(`filter-panel-renderer.ts:302-380`) and a debounced value commit (`:640-690`) —
`screenshots/notion-clone/panels/constructed-filter-panel-desktop-light.png`.

**Values that change.**

| Was | Is |
|---|---|
| Anytype's filter panel is one add row | **Its populated form is captured across twelve formats** (**D3**) |
| The 360px measurement threatens our 440-560px `condition panel` role | **It does not, and the reason matters.** Anytype fits 360px because it **splits one condition across three stacked popovers**; our row carries property, operator, value, group, NOT and remove **on one line**. The measurement covers a different row, so it does not outrank our role. `design-system.md` §5's 440-560px stands |
| — | **Adopt the condition-as-a-phrase chip.** `Starts is today` reads as a sentence; our chips read as a field plus a symbol. This is the one place Anytype's information design beats ours outright, and it costs a label format |
| Nested trees, conjunction, negate | **Ours, with no Anytype referent.** Recorded as a non-adoption so nobody trims them to match |

**Phone.** Three sheets, stacked, with the parent **visibly dimmed and pushed back** — `048`'s
model, confirmed in the reference product. `Filters` (header `[ ] [Filters] [+]`, empty state
**`No filters here. You can add some`** as centred body copy) → the condition sheet (icon tile,
property over a `Is ⌄` operator, a `Value` input, a **disabled `Apply` pill**) → the operator sheet
(`All`, `Is ✓`, `Is not`, `Contains`, `Doesn't contain`, `Is empty`, `Is not empty`).

The **explicit `Apply` commit** is **recorded, not adopted**: we commit on a debounce and changing
that is neither in scope nor obviously better. The phone empty-state sentence **is** adopted — our
filter sheet's empty state is currently silent.

---

#### T17 — Sort panel

**Seen — the row that was `no capture` (D6).** `anytype-menu-set-view-sort-light.png`;
`anytype-menu-set-sort-empty-light.png`; `anytype-menu-set-sort-added-light.png`;
`anytype-menu-set-sort-property-picker-light.png`; `anytype-mobile-sheet-view-sorts-light.png`.
**Still not captured:** the direction chooser — `anytype-menu-set-sort-direction-{light,dark}.png`
is **byte-identical** (md5 `909659cd…`) to its `-added-` pair, so that interaction never landed. It
is the only duplicate in all 59 set-controls menus, checked by hash.

**What the screen does.** `‹ Sort` header, then one rule row per sort at **36px tall on a 48px
pitch**: `⠿ grip · [outlined pill: format icon + property name] · [outlined square: ↑ or ↓]`. Then a
divider, `+ Add sort`, `🗑 Delete sort`. The property pill opens the same searchable flat picker the
type picker uses. **Remove is a footer row, not a per-row `×`.**

**What we do today.** `renderRule` (`sort-panel-renderer.ts:223-289`) with field, direction, remove
and drag, plus drop indicators (`:291-337`), mobile move controls (`:238-270`) and a calendar hint
(`:143-145`).

**Values that change.**

| Was | Is |
|---|---|
| `no capture` — "the sort moment was never reached" | **Captured.** The row is measurable and the direction control's shape is known; only the chooser behind it is not |
| Row height unspecified | **36px, 48px pitch** — 12px between rows. On our scale: **36px row, `--db-space-5` (12px) gap**. 36 is not on `sk-design`'s 4/8/12/16 spacing scale but it is a measured row height for a row containing a 28px control plus padding, and a measurement outranks a default for the surface it covers |
| Direction control unspecified | **A separate square button showing the current direction as an arrow.** Adopt the shape; it is one control with one job and it is keyboard-reachable |
| Remove per row | **Ours stays.** A footer `Delete sort` is ambiguous about which sort it deletes — the capture cannot say, and an ambiguous destructive action is not worth copying |
| Direction as colour | **Never seen.** Direction is a glyph on desktop and a **word** (`Ascending`) on the phone's two-line row. This is the evidence behind T14's amendment |

**Phone.** A near-full-height sheet: header `[Edit] [Sorts] [+]`, then rows of
`[icon tile] [property / direction-as-a-word] [›]` at ~53pt, dividers inset to the label. Adopt the
**direction-as-a-word** on any surface with room for a second line.

---

#### T18 — Sort-conflict confirm · `050` item 7

**Not seen, and none was possible.** No drag, no drop and no confirmation appears in any of the 838
files. `menus.mjs` refuses mutating actions by name; the catalogue sweep photographs stills; the iOS
sweep drove no drag. **Design inferred from source, not seen** — `047` §8's sorted-subscription
repositioning, exactly as the inventory already records.

**What this read adds is one adjacent fact.** Anytype's own vocabulary for "this action exists but
does not apply here" is captured twice — the greyed, control-less `Name` row in the Properties
sub-page, and the `Calendar … Unsupported` row in the phone view switcher. Both **keep the row and
say why** rather than hiding it. That corroborates `row-menu.ts`'s existing comment and it
corroborates ADR-003's ruling from the other side: Anytype disables where a row can carry the state
legibly, which is precisely why a **drag** — which cannot — gets a confirm instead.

ADR-003 (Accepted: *"On drop"*) is unaffected by anything in this sweep.

---

### 3.4 The option panels and the settings entry

#### T19 — View-config panel · `050` items 2, 1, 4, 10

**Seen, on both form factors, and it corrects `050` on the page limit (D4).**

**Captures.** `anytype-menu-set-view-settings-{light,dark}.png` and `-dark-full`;
`anytype-view-settings-panel-dark.png`; `anytype-set-kanban-view-dark.png`;
`anytype-menu-set-view-{layout,properties,filter,sort}-light.png`;
`anytype-menu-set-layout-{grid,gallery,list,kanban,calendar,graph}-light.png`;
`anytype-mobile-sheet-view-edit-light.png`; `-view-edit-more-`; `-view-layout-picker-`;
`-view-settings-gallery-`.

**What the screen does — desktop.** A **360×315px** popover, right-aligned under the settings
trigger, 8px radius, 1px `#292929` border. Header `View settings`. A boxed **View name** field,
**y 50..105 = 56px**, carrying a focused accent ring. Then 28px rows:

```
Layout        Grid ›                    ← y 126..139
Properties    Name, Object type,… ›     ← y 154..167
─────────────────────────────────────   ← y 182
Filter        ›                         ← y 199..210
Sort          1 applied ›               ← y 227..240
─────────────────────────────────────   ← y 255
⧉ Duplicate view                        ← y 270..285
🗑 Remove view                           ← y 297..313
```

A board inserts **`Groups ›`** between Layout and Properties and nothing else moves —
`050`'s claim, confirmed by direct read.

**Two navigation moves, each confirmed four times.** A settings row **replaces the panel body in
place** with a `‹ Back` header — seen on Layout, Properties, Filter and Sort. A picker **opens as a
separate anchored popover over an undimmed parent, with the invoking row highlighted** — seen on the
type picker, the template picker, the sort property picker and the `Calculate ›` submenu.

**The Layout sub-page is where the real adaptivity lives.** A constant 2×3 tile grid (selected tile:
2px accent ring, accent glyph, accent label) over a **variable settings block of one to six rows**:

| Layout | Block |
|---|---|
| Grid | `Wrap content` ⊙ · `Show icon` ⊙ |
| List | `Size  Compact ›` · `Show icon` ⊙ |
| Calendar | `Date Property  Creation date ›` · `Show icon` ⊙ |
| Gallery | `Card size  Medium ›` · `Cover  Select ›` · `Fit media` ⊙ · `Show icon` ⊙ · **`Page limit  60 ›`** |
| Kanban | `Cover  Select ›` · `Fit media` ⊙ · `Group by  … ›` · `Color columns` ⊙ · `Show icon` ⊙ · **`Page limit  10 ›`** |
| Graph | `Settings ›` |

**What the screen does — phone.** `Edit view` sheet: handle, centred bold title, `···` at the right;
a `Name` label over a filled input; then **four rows, every one carrying a value summary**:

```
Layout        Grid        ›
Properties    27 applied  ›
Filters       No filters  ›
Sorts         2 applied   ›
```

`Duplicate` and `Delete view` move into the `···` dark menu.

**What we do today.** `ViewConfigPanelRenderer` (`view-config-panel-renderer.ts:329-460`) exists;
nothing opens it after a create (`database-view.ts:3460-3462`, `:3941-3943`).

**Values that change.**

| Was | Is |
|---|---|
| `N applied` on the Filter and Sort rows | **Widened.** The phone puts a summary on **Properties, Filters and Sorts**, and renders the empty case as the word **`No filters`** rather than a blank. Every value column carries a summary, and empty is a word |
| Panel width, radius, rows, name field | **360px · 8px · 28px · 56px** — all four re-measured and unchanged from `050` |
| "the panel is layout-adaptive: a board gains one `Groups ›` row" | **True, and it is the smaller half.** The Layout sub-page's block varies from one row to six. Our per-view-type branches (`:418-460`) are the equivalent and are already correct in shape |
| Page limit default **60** | **Wrong as a single number (D4).** It is per-layout — Gallery 60, Kanban 10, and Grid, List, Calendar and Graph have no page-limit row at all. Any adoption is per-layout or it is not the captured behaviour |
| Item 10's section belongs in this panel | **Moved to T10.** The captured home for a per-view creation default is the New menu's `Settings` section |
| The 100ms landing budget | **Unchanged and still ours.** No capture can time a transition; Anytype's ~50ms remains `047`'s source read |

**Phone.** `view-config` is already `sheet-grammar`-registered. The in-place replace-with-back
pattern is confirmed on both form factors and is the phone-correct choice over stacking a second
sheet for a sub-page — which is also `048` REQ-002's preference.

---

#### T20 — Chart options popover

**Not seen.** Anytype ships no chart layout; its six layouts are Grid, Gallery, List, Kanban,
Calendar and Graph, and Graph is a relation graph, not a chart. **Design inferred from source, not
seen.** Two-level structure and PM chart parity untouched; only the shell migrates.

---

#### T21 — Calendar options popover

**Seen.** `anytype-menu-set-layout-calendar-light.png`; `anytype-content-calendar-calendar-light.png`.

**What the screen does.** The calendar's entire option set is **two rows** —
`Date Property  Creation date ›` and `Show icon` — inside the Layout sub-page. There is no separate
calendar options popover; the settings trigger is the only entry.

**Values that change.** The cited reference (`anytype-set-calendar-view-dark.png`, "Date Property
setting") is confirmed and located precisely: it is in the Layout sub-page's block, not in a
popover of its own. Our month/week/day section rebuild (`calendar-toolbar-renderer.ts:138-149`) has
**no Anytype referent** and stays ours per D4. `spec.md` §11's open question — *merge the calendar
and timeline option popovers into the settings entry, or keep their own trigger?* — now has capture
evidence for **merging**: Anytype has exactly one settings entry per view and reaches every
per-layout option through it. The default in `spec.md` §11 ("own trigger, shared shell") is
preserved on PM-parity grounds, and the evidence against it is recorded here rather than lost.

---

#### T22 — Timeline options popover

**Not seen.** Anytype ships no timeline or gantt layout. **Design inferred from source, not seen.**
Scale-section rebuild stays ours.

---

#### T23 — Settings entry point

**Seen.** `anytype-view-settings-panel-dark.png`; `anytype-set-kanban-view-dark.png`;
`anytype-mobile-sheet-set-viewswitcher-light.png`.

**What the screen does.** **One** settings trigger — the sliders glyph — for every view type, on
both form factors. It resolves to the view-settings panel, whose Layout sub-page then branches by
layout. On the phone it is the **only** icon in the toolbar. And it carries the expanded state as a
28×28px rounded fill while its panel is open.

**Values that change.**

| Was | Is |
|---|---|
| "one settings surface per view type" | **Sharper: one settings *trigger*, one settings *surface*, and the branching happens one level in.** That is a stronger argument for `createSettingsEntry` than the inventory made — the phone proves a single trigger can carry every view type, because it does |
| Trigger geometry unspecified | **28×28px on a 32px pitch**, with the expanded state as a fill whose **1.20:1 tint is refused** |
| ADR-002's seven dead methods | Unaffected. The capture argues for one entry; ADR-002 is how we get there |

---

#### T24 — Embedded view toolbar · `050` item 12

**Half seen, and the inline rung narrows (D7).**

**Captures.** `anytype-page-with-inline-collection-dark.png` and
`anytype-inlinecollection-empty-dark.png` (inline, ~680px);
`anytype-collection-grid-populated-dark.png` and the 120 catalogue captures (full page);
`anytype-mobile-set-{grid,list,gallery,kanban}-light.png` and
`anytype-mobile-sheet-set-viewswitcher-light.png` (**real iOS, replacing the marketing creative**).

**What the screens show.**

| Context | Controls |
|---|---|
| Full page, 1440-2168px | tabs · `+` · search · filter · sort · settings · `New ⌄` (one pill) |
| Inline, ~680px | **`All` alone.** No `+`, no icon cluster, no `New` button |
| Phone, 402pt | `Grid ⌄` dropdown · settings · `New | ⌄` (split) |

**The inline rung drops the `+` too**, which `050`'s "view tab row only" did not distinguish. So the
drop order the threshold asserts is: **`New` and the icon cluster and the add-view `+` all go
before the tab row does; the tab row becomes a dropdown before it is dropped.**

**What cannot be read, still.** Only one inline width exists in the sweep, so a measured collapse
and a fixed breakpoint remain indistinguishable — `047` §5's "measures its own natural width" stays
**source-derived**. Hover was never captured, so the inline icons may be hover-revealed rather than
absent. Both caveats survive this sweep unchanged.

**One caveat retires.** The phone rung was read from App Store creative; it is now read from a real
iOS client, and the reading is the same. The `mobile/official/` images are no longer load-bearing
for this row.

**What we do today.** `shouldHideHeaderChrome()` (`embedded-database-renderer.ts:2410-2416`) is a
boolean over three codeblock options. No `ResizeObserver` in the file; `chart-renderer.ts:876`'s
owner-window resolution is the pattern to copy.

**Values that change.**

| Was | Is |
|---|---|
| Inline = "view tab row only" | **And no trailing `+`** (**D7**) |
| Phone rung from marketing creative | **From a real client.** Same three controls, now quotable |
| Page limit 60 as the embed's paging default | **Per-layout** (**D4**) — and item 14 is `050`'s, not this phase's, so this row only records the correction |
| 250px sweep floor | **Unchanged and ours.** `047` §8's `isNarrow` ≤250px is source-derived |

---

### 3.5 What no capture reached

Five rows carry no capture and say so. **Design inferred from source, not seen: T5, T6, T9, T18,
T20, T22.** Of those, T5, T20 and T22 have no possible capture — Anytype ships no multi-database
switcher, no chart layout and no timeline layout. T6 and T9 were reachable and were not reached.
T18 is unreachable by a still sweep by construction.

One further gap is inside a captured row: **the sort direction chooser** (T17), whose file is a
byte-identical duplicate of its parent state.
<!-- /ANCHOR:rows -->

---

<!-- ANCHOR:rollup -->
## 4. ROLL-UP

### Seen, not seen

| Row | Surface | Seen? | Phone capture? |
|---|---|---|---|
| T1 | View tabs + add | **Seen** | Yes — dropdown |
| T2 | View-tab context menu | **Half** — desktop absent, phone seen | Yes — Edit mode |
| T3 | Add-view popover | **Half** — the entry row, not the form | Yes — header `+` |
| T4 | All-views hub | **Seen** | Yes |
| T5 | Database switcher | **Not seen**, impossible | — |
| T6 | Title actions menu | **Not seen** | — |
| T7 | Utilities overflow | **Seen** both form factors | Yes |
| T8 | Group-by | **Seen**, two entry points | Yes |
| T9 | Export popover | **Not seen** | — |
| T10 | New button + template menu | **Seen** — overturns C7 | Yes |
| T11 | Filter trigger | **Seen** ×122 | Yes — absent by design |
| T12 | Sort trigger | **Seen** ×122 | Yes — absent by design |
| T13 | Properties trigger | **Seen**, two surfaces | Yes |
| T14 | Chip rail | **Seen** ×11 — overturns C2 | No rail on phone |
| T15 | Rule edit popover | **Seen**, twelve formats | Yes, three sheets |
| T16 | Filter panel | **Seen**, populated | Yes |
| T17 | Sort panel | **Seen** — direction chooser still not | Yes |
| T18 | Sort-conflict confirm | **Not seen** | — |
| T19 | View-config panel | **Seen** both form factors | Yes |
| T20 | Chart options | **Not seen**, impossible | — |
| T21 | Calendar options | **Seen** | Yes |
| T22 | Timeline options | **Not seen**, impossible | — |
| T23 | Settings entry | **Seen** both form factors | Yes |
| T24 | Embedded toolbar | **Half** — end states seen, mechanism not | Yes, real client |

**24 of 24 rows carry a capture-read record or a named gap.** T001's threshold is met.

### What this phase adopts

**Geometry and structure, all measured:** the 28px chip pill and its 1px group separator; the
36px/48px sort rule row; the 28×28px trigger box on a 32px pitch; the 28px menu and settings row;
the 360px panel; the 56px name field; the full-content-width divider under the tab row; the
constant-tiles-plus-variable-block shape of the Layout sub-page.

**Behaviour:** the value-column summary on **every** settings row, with the empty case as a word;
the `‹ Back` replace-in-place sub-page against an anchored picker over an undimmed parent; the
searchable field at the head of every long picker; the `✓` marking a current choice; the segmented
`Exact | Relative`; the footer add-row vocabulary; the condition-as-a-phrase chip label;
direction as a glyph and, where there is room, as a word; the greyed-with-a-reason row for an option
that exists but does not apply; a phone Edit mode instead of a long-press.

### What this phase refuses, and why

| Refused | Measured | Reason |
|---|---|---|
| Open-trigger `#232323` fill | **1.20:1** | WCAG 1.4.11 asks 3:1 of a non-text element that is the only state signal. Third instance of the same defect after `050`'s two |
| Chip accent on chip tint | **3.14:1** | Below 4.5:1 for a ~13px label |
| Chip fill as the state | **1.19:1** on its own bar | Not a 3:1 indicator; cannot carry state alone |
| Inactive tab `#B6B6B6` | **2.03:1** | Less than half the required ratio |
| White on the `New` accent | **3.74:1** | Below 4.5:1 for its label |
| Phone `New` at 28pt tall | 28pt | `044`'s 44px touch floor is a constraint this phase consumes (D5) |
| Direction by colour alone | — | Never seen in the product either; `sk-design` ALWAYS-5 |
| The fully-rounded chip | r≈14 | Off our 4/6/8 radius scale; mixing pill and square corners degrades both |
| Two grouping entry points | — | `design-system.md` §10's "two mechanisms for one decision" |
| An aggregate `N sorts` chip | — | Not individually removable or editable; ours are |
| A footer `Delete sort` | — | Ambiguous destructive scope |
| Anytype's hexes wholesale | — | Obsidian plugin; the user's theme owns the ramp |

### The `050` item thresholds, after this read

| Item | Threshold | State after the read |
|---|---|---|
| 1 (AC-102) | Chip row present iff a rule is active; declared trigger state; `N applied` label | **Two clauses change.** The rail does **not** move into the toolbar band — the capture puts it where ours already is. The direction **colour** is demoted to a redundant signal. The `N applied` clause **widens** to every value column with a worded empty state |
| 2 (AC-103) | Settings open ≤100ms after create/duplicate | **Unchanged.** No capture can time it; 100ms is ours |
| 4 (AC-104) | Duplicate config-identical, new id; menu offers rename/duplicate/remove | **Unchanged on desktop.** The phone half gains a captured reference (Edit mode) it did not have |
| 7 (AC-105) | Confirm on drop; decline no-ops; accept clears the sort | **Unchanged.** Still `no capture`; ADR-003 stands, corroborated from the side |
| 10 (AC-106) | Presets applied at creation; no-preset rows byte-identical | **Placement changes** to the New menu's `Settings` section. The narrowing to per-field values survives, on a corrected reason |
| 12 (AC-107) | No control overflows from 250px up; measured, once per resize | **The end state sharpens**: the inline rung drops the `+` as well. "Measured, not a breakpoint" stays source-derived |

### Motion

Nothing about motion is readable from a still, and this sweep adds nothing to `050`'s finding.
`050`'s ruling holds unchanged: **enter 200ms `ease-out`, exit 150ms `ease-in`**, the 150ms being
the closest in-band value to `047`'s source-read 100ms exit, which sits below the 120ms floor for
direct feedback.
<!-- /ANCHOR:rollup -->

---

<!-- ANCHOR:cross-refs -->
## 5. CROSS-REFERENCES

- **Migration rows**: `toolbar-surface-inventory.md` §3, whose §6 carries the per-row record
- **Requirements**: `spec.md` §4 and §6
- **Thresholds**: `acceptance-criteria.md`
- **Tasks**: `tasks.md` — T001 is this document
- **Rulings**: `decision-record.md`
- **Predecessor read**: `../050-anytype-adoption/design-trueup.md`
- **Research source**: `../047-competitor-references-and-pm-alignment/research/research.md` §5-§11
- **Capture index and methodology**: `../../../screenshots/anytype/README.md`
- **View rule ground truth**: `tools/mock-data/anytype/views-report.json`
- **Our own captures**: `../../../screenshots/notion-clone/`
- **Token and role authority**: `../design-system.md`
- **Phone grammar**: `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: `../048-stacked-sheets/spec.md` §4
<!-- /ANCHOR:cross-refs -->
