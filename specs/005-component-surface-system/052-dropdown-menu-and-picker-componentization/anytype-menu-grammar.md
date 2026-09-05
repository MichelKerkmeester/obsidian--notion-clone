---
title: "Anytype Menu Grammar: What Our Menus Take, and Why"
description: "The menu and picker grammar Anytype ships, extracted for this phase from the captures under screenshots/anytype/ and 047's research §9, with each pattern dispositioned adopt/decline and the capture that shows it or the gap where the captures do not reach."
trigger_phrases:
  - "anytype menu grammar"
  - "menu grammar document"
  - "052 grammar"
  - "create option row"
  - "submenu arrows anytype"
importance_tier: "high"
contextType: "research"
---
# Anytype menu grammar — what our menus take, and why

The input for this document is `screenshots/anytype/` (index: its `README.md`) and
`../047-competitor-references-and-pm-alignment/research/research.md` §9 (context menus), §6 (chip
row and value pickers), §5 (toolbar anatomy). **This document does not restate `047`'s 89 findings;
it extracts only what a menu, dropdown or picker phase needs, and disposes each pattern.**

**An evidence note, stated once and applying to every row below — rewritten 2026-09-05 at T001.**
This document was drafted from the capture index's written descriptions, because the authoring
session could not open image files. `050`'s `design-trueup.md` then read the pixels of three menu
captures with a per-pixel scan. **This packet's own `design-trueup.md` is now the read of record**:
T001 opened the 150 clipped menus under `screenshots/anytype/menus/` and the 59 iOS states under
`screenshots/anytype/mobile/`, measured them, and corrected every row the pixels disagree with.
`050` ADR-003 still governs the precedence (where a capture and `047`'s research disagree, the
capture is the fact and the research is a source reading). Rows corrected at landing are marked
**[trued 2026-09-05]**; rows corrected by T001's read are marked **[trued 2026-09-05 · T001]**, and
§5 lists every T001 correction. A pattern the captures still do not reach is marked **code-derived**
and treated as a proposal with a named gap, not as an observed fact — and absence of a capture is not
evidence of absence (`050` ADR-003, corollary 1).

**The caveat that has to go first, because five documents repeat it.** The capture README's "no
hover state was captured" sentence is **false for menus**. **37 of the 150 menus were reached by
hovering a row of their parent**, and each photographs that row hovered — `#232323`, 28px tall, inset
~10px, **1.14:1** on its own panel. Every G-row below that leaned on "hover was never captured" is
corrected here, and G8's hover-open question is closed by the sweep's own procedure rather than left
open.

---

## 1. The grammar Anytype's menus share

From `anytype-object-more-menu-dark.png` (an object header `···` context menu: Type settings, Copy
Link, Favorite, Pin to Channel, Add Link/Add to Collection, Duplicate, Move to Bin, Lock, Search in
Object, Version History, Print, Export, Advanced) and the research §9:

| # | Pattern | What Anytype does | Disposition | Evidence |
|---|---------|-------------------|-------------|----------|
| G1 | **Fixed sections** [trued 2026-09-05 · T001] | Five sections separated by four dividers, re-measured on this packet's own capture (`menus/anytype-menu-object-more-dark.png`, dividers y 56/297/398/471, each inset **16px** each side, section boundary costing **44-48px** of pitch against a 28px row). **And a second section grammar the earlier read missed**: a **text caption** above a section's first row — `Property name` / `Property Type` (`set-column-header`), `Views` (`set-viewlist`), `Settings` (`set-new-object`), `Text` (`object-block-menu`) — at **`#A3A3A3`, ~12px cap-height, 16px inset**. Anytype captions a section when its rows configure rather than act | **Adopt both.** `menu-row.ts:180` `createMenuSection` and `column-menu.ts:181-186` already build them; the migration's job is that every menu reaches them, and that the caption is used for configuration sections rather than sprinkled | `design-trueup.md` G1 |
| G2 | **Capability-gated items** | Every menu item is gated per the selected object — restrictions, layout rules, permissions — and disabled-with-reason beats hidden where the reason teaches | **Adopt.** Our `row-menu.ts:57-59` already disables insert with an implicit reason (sorted view); `dropdown-field.ts` carries `disabledReason` end to end (`:40-41`, `:224-232`). `050` item 8 owns the full predicate; this phase gives it one place to render | `design-trueup.md` REQ-008 (the menu measured: 256px frame, 28px rows, 16px leading icons, right-aligned shortcut text, chevrons on submenu rows); research §9 for the gating predicate |
| G3 | **Never-empty fallback** [trued 2026-09-05 · T001] | **Three shapes, tiered by whether the user can act**, not one row. A **default row** where a sensible default exists (`set-sort-empty` still renders `Last modified date` with its direction button, then `＋ Add sort` / `🗑 Delete sort`). A **one-line instruction** where the search field on screen is the fix (`object-featured-tag`: *"Type to create a new option"*). An **illustration + two lines + a `Create` button** only where neither is true (`sheet-cell-multiselect-empty`: *"No options" / "Nothing found. Create first option to start."*). Both captured strings **name the action**, not the absence | **Adopt the tiering.** `050` REQ-008's narrowing binds unchanged: `row-menu.ts` **cannot** render empty (`menu.openNote` unconditional), so its guarantee is **asserted, not built**; the one violator is `bulk-edit-field-menu.ts:31-45`, and it takes the **instruction** shape because its emptiness is not actionable from that menu | Picker half **captured** (`object-featured-tag`, `sheet-cell-multiselect-empty`, `set-sort-empty`). The fully-gated **action menu** appears on no capture, so the "No available actions" wording stays **code-derived** |
| G4 | **Selection caps** [trued 2026-09-05] | More than 1 object disables open/link/pin; more than 10 disables open-in-new-tab — numeric, per action | **Decline, with a reason.** `design-trueup.md` REQ-008 records this as **not adopted**: our row menu operates on a single row, so the caps have no referent in a surface that has no multi-select. Recorded beside `047`'s four explicit non-adoptions rather than left to be silently retried. The primitive still renders a uniform disabled state, which is G2's job, not this row's | **Not captured** — the object menu was photographed on a page, not on a multi-row selection, so the caps have no capture either way (`design-trueup.md` ADR-003 consequences) |
| G5 | **Item density** [trued 2026-09-05 · T001] | Compact single-line rows, re-measured across all 150 clipped menus. **28px row pitch · 16px content inset · 8px radius · 1px `#292929` border on `#171717` · dividers inset 16px · 16px icon box with a 14px glyph, optional per row · 4 × 8px chevron at the 16px right inset · highlight inset ~8-10px**. Anytype ships **five width tiers**, not one: **224** compact menu and plain select · **256** object/row/card context menu · **288-300** cell and relation editor · **360** view/filter/sort/layout panel · **408** grid picker (`design-trueup.md` §2) | **Adopt the geometry, keep our widths.** 28px and 8px stay adopted — 28px is simultaneously Anytype's measured row and our own `design-system.md` §9 coarse-pointer floor, which is why the deviation from the 4/8/12/16/24/32 scale is named rather than absorbed. **360px is adopted by agreement**: it is the top of our own `panel` role, so nothing moves. Anytype's **224px and 256px** menu tiers and its **408px** grid picker are **declined** against our 292px `menu` role and our 318px content floor | `design-trueup.md` §2 (all 150 clipped dark menus) |
| G6 | **Destructive tone at the end** [trued 2026-09-05 · T001] | **Platform-split, and the desktop half has no tone at all.** `Move to Bin` is the same `#E1E1E1` as `Copy Link`; `Empty Bin` — the most destructive action in the product — is uncoloured **and not even last** in its 224px menu. On iOS, `Delete` is red text **beside a red trash glyph**, last, below a divider. So position is the product's convention and tone is the platform's (`055` C3, confirmed here on a third capture) | **Adopt position; adopt the iOS *pairing*, not the hue.** `row-menu.ts:146-160` already places delete last with `warning: true` and `menu-row.ts:64` renders the error colour — which stays because `mod-warning` is Obsidian's theme-owned destructive class, i.e. *host convention*, not adoption. Wherever a destructive row is coloured it carries a matching icon; colour never alone | `menus/anytype-menu-object-more-dark.png`, `menus/anytype-menu-nav-widget-bin-dark.png`, `mobile/anytype-mobile-sheet-object-more-dark.png` |
| G7 | **Toggle labels derive from state** | A toggle item's label names the state it will switch to, not the state it is in | **Decline.** Our menus already do this where it matters (`column-menu.ts:174-175` enable/disable wrap) and our checkboxes carry `aria-checked` (`menu-row.ts:135-140`); Anytype's approach and ours agree without adoption | Research §9 |
| G8 | **Submenus open on hover, pre-filtered** [trued 2026-09-05 · T001] | **Hover-open is proved, and so is the Escape order.** The sweep could only open each of the 37 submenus by dispatching a hover on its parent row, and `README.md` records that a submenu left open "swallows the next hover" and that **one Escape closes the child and leaves the parent open**. Measured placement: child **flush beside the parent with a 2px gap**, its top aligned to the opening row, **flipping to the parent's left at the viewport edge** (`object-more-advanced`). Child widths **224 / 256 / ≈360** by content. Every captured chain is **depth 2**. The parent row stays hovered while the child is open. On iOS the child **overlays and dims** the parent and the parent row's chevron rotates **`›` → `⌄`** | **Adopt the submenu and the hover.** Real submenus through the factory are REQ-001. **`spec.md` §11's hover question is closed**: hover-open on desktop behind `@media (hover: hover)`, with click and `ArrowRight` retained for keyboard and touch. Escape closes the innermost only — ADR-001's clause, now observed rather than argued. The left-flip shares one implementation with `050` item 6. **Depth 3 stays ours to satisfy, not a parity target** | 37 hover captures, measured in `design-trueup.md` G8; `mobile/anytype-mobile-sheet-object-more-submenu-dark.png` |
| G9 | **Submenu arrows** [trued 2026-09-05 · T001] | A **4 × 8px chevron glyph at the 16px right inset**, in the secondary grey, on exactly the rows that open a child. And a **second chevron meaning**: `Layout   Grid ›` / `Sort   1 applied ›` in `set-view-settings` navigate the panel in place under a `‹` back header rather than opening a child | **Adopt (already ours, make true).** `menu-row.ts:112-122` draws it and `:119-121` already distinguishes `submenu` from a plain `chevron` in ARIA — which is exactly the distinction the captures show, so that option is **validated rather than merged away** during the migration. REQ-001 makes the submenu promise real | `menus/anytype-menu-object-more-dark.png`, `menus/anytype-menu-set-view-settings-dark.png` |
| G10 | **Search-first pickers** [trued 2026-09-05 · T001] | The search field is **the first thing in the panel, always**: **28px tall, `#232323` fill, 16px inset, full content width, 12px below the frame's top edge**, with a leading magnifier on the phone and none on the desktop. Placeholders name the **verb of their surface** — `Click to filter…`, `Filter Objects…`, `Filter actions…`, `Filter or create options…`, `Search or create new` | **Adopt.** This is REQ-003/REQ-006: one shared search, measured. **Do not copy Anytype's placeholder strings**: `mobile/anytype-mobile-sheet-filter-relation-picker` reads `Choose a property to sort` inside the *filter* flow, a shipped product bug confirmed by pixel | 8 captures across both platforms, listed in `design-trueup.md` G10 |
| G11 | **Create-option row** [trued 2026-09-05 · T001] | **Four shapes, and the drafted placement is contradicted.** The captured desktop create row — `＋ Create Object` — sits **first, directly under the search field and above the list** (`object-more-add-link-to-object`), with the `＋` in the 16px icon slot. The other three: the **search placeholder** (`Filter or create options…`), the iOS **header `＋`**, and a **`Create` button inside the empty state**. The counter-example that fixes the rule: `Add advanced filter` sits **last, below a divider**, because it is an *escalation*, not a creation | **Adopt for the dropdown primitive, at the captured position.** The mechanic stays `preserveValueOnSelect` (`dropdown-field.ts:42-43`) — **ADR-002 is unaffected as a mechanism and amended as placement** (ADR-004): creation first, escalation last. The affordance **stays reachable when the list is empty**, which all three phone shapes do and which AC-006 asks for. `spec.md` §11's rollout-breadth question stays the operator's | `menus/anytype-menu-object-more-add-link-to-object-dark.png` + three phone shapes |
| G12 | **Section headers in pickers** [trued 2026-09-05 · T001] | **The landing narrowing was right about the wrong picker.** The filter property picker is genuinely **flat** — 34 rows, each a **per-format leading icon** (`Aa`, page, calendar, list, `ⓘ`, `#`, ticked circle, envelope, phone, link, paperclip) with cross-set properties disambiguated by a text suffix rather than a group — and the phone's relation picker is flat the same way. But **typed group headers are captured twice**: `Properties formats` / `Existing properties` (`mobile/anytype-mobile-sheet-relation-add`) and `Smileys & People` (`object-icon-picker`). The rule is **grouped when the list mixes kinds, flat when it is one kind** | **Adopt (already ours), as a rule rather than an order.** `DropdownOption.section` renders group titles (`dropdown-field.ts:220-223`). Our filter property picker is one kind and **stays flat**; the bulk-edit and add-property pickers mix and **group**. The **format-icon vocabulary is adopted**, confirmed on four captures — it is what keeps a flat 34-row list readable | `design-trueup.md` G12 |
| G13 | **Relative condition values** [trued 2026-09-05 · T001] | The date picker is a 288 × 271 panel: `May 2026` with `‹ ›` nav, a `Mo…Su` header, a 7-column grid with tinted weekend columns, the selected day a **filled `#4686FB` rounded square**, then a divider, then a **footer row** carrying `Today` `Tomorrow` left and `Clear` right. The filter surface adds an `Exact` / `Relative` tab pair | **Decline for chips (still `050` item 1's surface); confirm for the picker.** Our presets (`date-value-picker.ts:164-166`) are Anytype's exact footer set plus `Next week`, in Anytype's exact placement. Our **252px** stays against Anytype's 288px — the difference is a font stack, not a design | `menus/anytype-menu-cell-date-dark.png`, `…-set-filter-date-relative-dark.png` |
| G14 | **Checkmarks on the current value** [trued 2026-09-05 · T001] | The tick is **trailing**, at the **16px right inset**, in the primary text colour (`object-block-menu-color` `Default ✓`, `set-column-header-align` `Left ✓`). iOS ships **two** ticks — a **blue filled circular tick** for a *value* selection and a **plain tick** for a *single choice among conditions* | **Adopt, and fix the side.** Ours are two grammars for one affordance and **both are leading**: `dropdown-field.ts:240-243`'s icon and `cell-renderer.ts:1420`'s `✓` text node. The primitive's check wins **and it is trailing** — which is also what frees the leading slot for the format icon G12 and G15 both need. The `✓` text node is **deleted, not restyled**: a text glyph cannot carry the `menuitemcheckbox` semantics `menu-row.ts` already gives us. iOS's two-tick split is **refused** — a second check grammar is the exact defect this row closes | `menus/anytype-menu-object-block-menu-color-dark.png`, `…-set-column-header-align-dark.png`, 2 phone captures |
| G15 | **Icons per option** [trued 2026-09-05 · T001] | Two leading-slot vocabularies. **A dot plus a label** — Anytype's colour picker is a **224px labelled list of ten named colours**, each with a leading dot and a trailing tick on the current one. **There is no swatch grid.** And **a tinted chip**, where the option *is* the value: `cell-select` renders each option as a **24px fully-rounded pill, tinted fill and tinted text, on a 32px row pitch**, with a **2 × 3-dot drag handle at the 16px inset** and the chip starting 34px in | **Adopt (already ours), with the colour picker's shape declined.** Property-type icons already reach the dropdown (`bulk-edit-field-menu.ts:36-38`) and the option editor's colour dots (`cell-renderer.ts:1367`) are the same idea in a second grammar — kept, rendered through the shared row slot. Our **124px 12-swatch grid stays**: swapping it for a 224px labelled list is a redesign no requirement here asks for. What **is** adopted from it is the **trailing tick** (G14) and **named colours as accessible names**, since a swatch identified by hue alone is colour-only signalling | `menus/anytype-menu-object-block-menu-color-dark.png`, `…-cell-select-dark.png` |
| G16 | **Hover/active row states** [trued 2026-09-05 · T001] | **Captured, 37 times.** The hovered row is **`#232323`, 28px tall, inset ~10px** inside a 16px content inset — measured x 383..617 in a panel at x 372..627. Contrast against its own `#171717` panel: **1.14:1**. The same `#232323` is also the search field's fill and the preselected row's background: one colour, three jobs | **Adopt the geometry, refuse the colour.** The row's old conclusion — target our own hover grammar — survives, and now for a measured reason rather than for want of evidence: **1.14:1** is far below the 3:1 WCAG 1.4.11 asks of a non-text element that is the only thing marking state. Take the **~8-10px highlight inset at full row height**; keep our tokens. And adopt the **parent-row state signal** from G8: the row owning an open child stays highlighted **and** rotates its chevron — two signals, neither colour alone | 37 hover captures, measured in `design-trueup.md` G16 |

## 2. What stays ours

Per the operator's ruling and `050` D6:

- **The table view's surface** — Anytype's grid is close to ours; nothing in the menu grammar above
  asks us to change the table's own presentation.
- **Formulas, rollups and calculations** — Anytype has neither (the catalogue load proved it:
  `screenshots/anytype/README.md`'s mapping table, `formula`→text with no per-record value). Our
  computed-field menus stay ours.
- **The Project Manager 1:1 board and gantt** — `037`/`038` parity; the gantt row context menu's
  migration onto the primitive does not alter its rendered surface, and the reference captures are
  re-read if a leg moves one.
- **Anytype's three-tier window model** — `S.Menu` → `S.Popup` → OS windows does not map onto our
  `overlay-stack` + sheet world, and `048` already occupies the same tier Anytype's `S.Menu` does
  (research §11's stacking insight). Declined as architecture; the *behaviours* Anytype's tiers
  enable (replace-without-animation, closeAll-by-family) are noted as future overlay-stack work and
  are not this phase's.

## 3. What the captures do not settle — **rewritten 2026-09-05 · T001**

Two of the three items that stood here are now settled by the pixels; the list below is what
survives.

- **A fully-gated action menu** (G3's "No available actions" state). No capture shows a menu whose
  eligible-row set is empty, and `menus.mjs` never drove one. The row **wording** stays
  code-derived — though the *shape* of a never-empty answer is now captured three ways for pickers.
- **The state-naming toggle label** (G7). The toggle *control* is captured (`set-layout-grid`); the
  label that names the state it will switch to is `047` §9's and appears on no screen.
- **A right-click on a desktop view tab** (M7). None was driven. `050` C4 already marks it
  *design inferred from source, not seen*, and the iOS **edit mode**
  (`mobile/anytype-mobile-sheet-set-viewswitcher-edit`) is the only captured answer to the same need.
- **Submenu nesting deeper than depth 2.** Every captured chain is depth 2. Our depth-3 chains
  (`tools/live/sheet-grammar.mjs:97-98, 110-112`) remain **our own constraint to satisfy, not an
  Anytype parity target** — unchanged.

**Settled, and removed from this list.** *Hover-open specifics* (G8): settled by the sweep's own
procedure — 37 submenus were reachable only by hovering, and one Escape closes the child while
keeping the parent. *Item spacing and type-scale numbers* (G5): measured across all 150 clipped
menus, §2 of `design-trueup.md`.

## 4. Corrections made at landing, 2026-09-05

`050`'s `design-trueup.md` landed after this document was drafted. Under `050` ADR-003 the capture
is the fact and `047`'s research is a source reading, so the rows below were corrected rather than
left standing. Each is marked **[trued 2026-09-05]** in §1.

| Row | Was | Is | Source |
|---|---|---|---|
| G1 | Four fixed sections | **Five** sections, four dividers | `design-trueup.md` REQ-008 (contradiction C5) |
| G3 | "Today an empty menu renders" | False for `row-menu.ts`, whose first row is unconditional; **true only for `bulk-edit-field-menu.ts:31-45`**. The row-menu guarantee is asserted, not built | `design-trueup.md` REQ-008, §4 |
| G4 | Adopt selection caps via `050` item 8 | **Not adopted, with a reason** — our row menu has no multi-select, so the caps have no referent | `design-trueup.md` REQ-008 |
| G5 | Density judged from our own 292px grammar | Geometry **measured**: 256px menu, 28px rows, 8px radius, 16px/8px padding, 8px divider clearance. 28px and 8px adopted; Anytype's 256px width and 14px type declined in favour of our 292px role and 13px type | `design-trueup.md` §2, §4 |
| G12 | The property picker groups properties under typed headers | What the pixels show is a **per-format leading icon** per row. The grouping claim is **code-derived** | `design-trueup.md` REQ-013 |
| Evidence caveat | "T001 re-reads the PNGs" | The pixels have been read; `design-trueup.md` is the read of record and this document consumes it | `050` ADR-003 |

**Two values `050` refused, repeated here so this phase does not re-adopt them.** The `#232323` row
highlight measures **1.14:1** against its own `#171717` panel — a selection indicator that is the
only thing marking state has to clear 3:1 (WCAG 1.4.11), and this misses by a factor of three. And
colour-only active-state signalling: Anytype does not signal an active filter at all, and where it
does signal state it signals with hue alone. Our hover and selection tokens stay ours.

**What still has no capture, after the true-up.** Superseded by §3 above, which T001 rewrote: two of
the three items listed here — hover-open specifics and the density numbers — were settled by the
pixel read, and the survivors are named there.

---

## 5. Corrections made at T001, 2026-09-05

T001 opened the 150 clipped menus in `screenshots/anytype/menus/` and the 59 iOS states in
`screenshots/anytype/mobile/`, and measured them. `design-trueup.md` is the read of record and
carries every number; the table below is the index of what changed here. Rows are marked
**[trued 2026-09-05 · T001]** in §1.

| Row | Was | Is | Where measured |
|---|---|---|---|
| Evidence note | "no hover state was captured" (README, inherited by `050` §2, G8, G16, `spec.md` §6) | **False for menus.** 37 of 150 were reached by hovering a parent row and each photographs it hovered: `#232323`, 28px, ~10px inset, **1.14:1** | `design-trueup.md` §1 C1, G16 |
| G1 | Sections are dividers only | **Two grammars**: bare divider, and divider plus a `#A3A3A3` ~12px **caption** where the section configures rather than acts | `design-trueup.md` G1 (C3) |
| G3 | One fallback row, "No available actions" | **Three shapes tiered by actionability**; two captured strings that **name the action**. The action-menu wording stays code-derived | `design-trueup.md` G3 |
| G5 | One measured width (256) | **Five width tiers** — 224 / 256 / 288-300 / 360 / 408 — plus the full geometry set, measured across all 150 | `design-trueup.md` §2 |
| G6 | "destructive last, tonally distinct" | **Platform-split**: desktop has no tone and `Empty Bin` is not even last; iOS pairs red text with a red glyph | `design-trueup.md` G6 |
| G8 | Hover-open is code-derived; Escape order is argued | **Both observed**, from the sweep's procedure. Plus placement, flip, three child widths, depth 2, and the iOS overlay-and-dim with a rotating chevron | `design-trueup.md` G8 (C1, C2) |
| G9 | "adopt, make true" | **4 × 8px chevron at the 16px right inset**, and the **two chevron meanings** confirmed, which validates `menu-row.ts:59`'s existing `chevron` option | `design-trueup.md` G9 |
| G10 | The create affordance is the placeholder | The placeholder is **one of four shapes**; the search field is measured; **do not copy Anytype's placeholder strings** | `design-trueup.md` G10 |
| G11 | The create row sits **last in its section** | **First, under the search, above the list.** Last-in-section is where Anytype puts an *escalation* | `design-trueup.md` G11 (C5), ADR-004 |
| G12 | Typed group headers are code-derived | **Captured twice.** The rule is grouped-when-mixed, flat-when-single-kind | `design-trueup.md` G12 (C4) |
| G13 | Presets "already match" | **Confirmed captured**: `Today` `Tomorrow` left, `Clear` right, in a footer below a divider | `design-trueup.md` G13 |
| G14 | "the primitive's check wins", side unstated | **Trailing**, at the 16px right inset. Ours are both leading. iOS's second tick refused | `design-trueup.md` G14 (C7) |
| G15 | Colour dots are a second grammar of the same idea | Anytype's colour picker is a **224px labelled list, not a grid**. Our grid stays; the trailing tick and named colours are adopted | `design-trueup.md` G15 (C6) |
| G16 | "the captures show no hover states" | **37 show it**, measured. Geometry adopted, `#232323` refused at 1.14:1 | `design-trueup.md` G16 (C1) |
| §3 | Three unsettled items | **Rewritten.** Two settled; four survive, each named | `design-trueup.md` §7 |

---

## RECONCILIATION, 2026-09-05 (later the same day): the iOS simulator captures landed

`964a0b2a` landed **118 files — 59 states in light and dark — of Anytype's official open-source iOS
client, built from source and run on a simulator**, under `screenshots/anytype/mobile/`, against the
same 326-record demo space the desktop captures used. They are real iOS chrome: sheets sliding from
the bottom, iOS pickers, the SpringBoard status bar — not the desktop app at a narrow width. They
are indexed with a per-file written description in `screenshots/anytype/README.md`.

**This closes the evidence gap this packet's phone rows were written against**, and it supersedes
one caveat that appears throughout the 050 true-up: `design-trueup.md` was written before these
existed, so wherever it says a phone surface has no capture, or takes its phone reading from the
twenty **App Store and Google Play marketing images** in `mobile-official/`, that gap is now closed
by a real screen. The marketing images stay what they were — good evidence of intent, weak evidence
of pixels — and no number is taken from them.

**What this document claims, and what it does not — settled at T001.** The rows below named the
capture each phone design should be read against, and said plainly that naming a file is not reading
it. **T001 has since read them.** `design-trueup.md` carries the measurements; the four rows below
stand as written except where §5's table records a change, and the one that changed is G12 — its
narrowing survives for the filter property picker and is **overturned as a claim of no evidence**,
because `sheet-relation-add` groups under `Properties formats` and `Existing properties`.

**Four of this document's gaps close on the phone side.**

| Row | Was | The capture that now answers it |
|---|---|---|
| **G8 submenu** | "Real submenus through the factory are REQ-001; hover-open is desktop-only ergonomics the captures cannot show" | `anytype-mobile-sheet-object-more` → `anytype-mobile-sheet-object-more-submenu`. On iOS the submenu is **a second sheet**, reached by tapping a `More` row — which is the phone expression this document proposed on reasoning alone. **The hover question stays desktop-only and stays code-derived**; a phone has no hover |
| **G3 never-empty fallback** | "The 'No available actions' state appears on no capture; the row wording is code-derived" | Still true for *that* state. But `anytype-mobile-sheet-cell-multiselect-empty` shows a picker's empty state reading **"No options — create first option to start"** — a fallback row that names the create action rather than the absence, which is a better model than "No available actions" and is now a real screen rather than a proposal |
| **G10/G11 search-first pickers and the create-option row** | Rested on `anytype-filter-tag-value-picker-dark.png`'s placeholder alone | `anytype-mobile-sheet-filter-relation-picker` (every filterable relation with typed icons), `anytype-mobile-sheet-search-typefilter` (a searchable type picker), `anytype-mobile-sheet-relation-add` (**all eleven formats**) and `anytype-mobile-sheet-cell-select-priority` (search, options in their colours, tick on the current one). The search-first pattern is now captured four ways |
| **G12 section headers in pickers** | Narrowed to "a per-format leading icon per row; typed group headers are code-derived" | `anytype-mobile-sheet-filter-relation-picker` is indexed as "every filterable relation, **typed icons**" — which corroborates the icon vocabulary and still does not evidence group headers. **G12's narrowing stands** |

**And one product-string bug the index records, worth knowing before copying a placeholder.** The
mobile filter-relation picker's placeholder reads **"Choose a property to sort"** inside the *filter*
flow. Anytype ships it; we should not copy it.
