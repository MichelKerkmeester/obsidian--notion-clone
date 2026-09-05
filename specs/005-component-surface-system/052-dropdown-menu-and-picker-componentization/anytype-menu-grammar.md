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

**An evidence note, stated once and applying to every row below — rewritten 2026-09-05 at
landing.** This document was drafted from the capture index's written descriptions, because the
authoring session could not open image files. `050`'s `design-trueup.md` has since read the pixels
of the three menu captures this document leans on — `anytype-object-more-menu-dark.png`,
`anytype-filter-property-picker-dark.png` and `anytype-filter-tag-value-picker-dark.png` — with a
per-pixel scan rather than by eye. **That document is now the read of record** (`050` ADR-003,
Accepted 2026-09-05: where a capture and `047`'s research disagree, the capture is the fact and the
research is a source reading). Rows corrected against it are marked **[trued 2026-09-05]** and §4
lists every correction. A pattern the captures still do not reach is marked **code-derived** and
treated as a proposal with a named gap, not as an observed fact — and absence of a capture is not
evidence of absence (`050` ADR-003, corollary 1).

---

## 1. The grammar Anytype's menus share

From `anytype-object-more-menu-dark.png` (an object header `···` context menu: Type settings, Copy
Link, Favorite, Pin to Channel, Add Link/Add to Collection, Duplicate, Move to Bin, Lock, Search in
Object, Version History, Print, Export, Advanced) and the research §9:

| # | Pattern | What Anytype does | Disposition | Evidence |
|---|---------|-------------------|-------------|----------|
| G1 | **Fixed sections** [trued 2026-09-05] | The object context menu is organized into **five** sections separated by **four** dividers (`design-trueup.md` REQ-008, dividers measured at y 96, 337, 438, 511), not the four `047` §9 describes and not an ad-hoc row soup. Immaterial to us — we build sections from what is gated in, not from a fixed count — but the number is corrected so nobody copies four | **Adopt (already ours, keep).** `menu-row.ts:180` `createMenuSection` and the column menu's grouped layout (`column-menu.ts:181-186`) already do this; the migration's job is that every menu reaches it, not that it is invented | Capture; research §9 |
| G2 | **Capability-gated items** | Every menu item is gated per the selected object — restrictions, layout rules, permissions — and disabled-with-reason beats hidden where the reason teaches | **Adopt.** Our `row-menu.ts:57-59` already disables insert with an implicit reason (sorted view); `dropdown-field.ts` carries `disabledReason` end to end (`:40-41`, `:224-232`). `050` item 8 owns the full predicate; this phase gives it one place to render | `design-trueup.md` REQ-008 (the menu measured: 256px frame, 28px rows, 16px leading icons, right-aligned shortcut text, chevrons on submenu rows); research §9 for the gating predicate |
| G3 | **Never-empty fallback** [trued 2026-09-05] | A "No available actions" row for the fully-restricted case — never a blank menu | **Adopt, narrowed.** `design-trueup.md` REQ-008 read the tree: `row-menu.ts` **cannot** render empty, because its first row (`menu.openNote`) is unconditional — so the premise "a fully-restricted selection renders an empty menu" is false for that file and the guarantee should be **asserted so it cannot regress, not built**. It is true for exactly one file: `bulk-edit-field-menu.ts:31-45` builds `options: editable.map(...)` from `getBulkEditableColumns` with no floor and no fallback. The primitive gives that one file somewhere to render the fallback | **Not captured** — the "No available actions" state appears on no capture. `design-trueup.md` REQ-008 marks it so; the row wording is **code-derived** |
| G4 | **Selection caps** [trued 2026-09-05] | More than 1 object disables open/link/pin; more than 10 disables open-in-new-tab — numeric, per action | **Decline, with a reason.** `design-trueup.md` REQ-008 records this as **not adopted**: our row menu operates on a single row, so the caps have no referent in a surface that has no multi-select. Recorded beside `047`'s four explicit non-adoptions rather than left to be silently retried. The primitive still renders a uniform disabled state, which is G2's job, not this row's | **Not captured** — the object menu was photographed on a page, not on a multi-row selection, so the caps have no capture either way (`design-trueup.md` ADR-003 consequences) |
| G5 | **Item density** | Anytype's menus are compact single-line rows: icon + label, short, no per-row padding variety | **Adopt the geometry, keep our width.** Measured: menu popover **256px**, row height **28px**, popover radius **8px**, padding **16px** horizontal / **8px** vertical, divider clearance **8px** each side (`design-trueup.md` §2). The **28px** row and the **8px** radius are adopted — 28px is simultaneously Anytype's measured row and our own `design-system.md` §9 coarse-pointer floor, which is why the deviation from the 4/8/12/16/24/32 scale is named rather than absorbed. Anytype's **256px** width and its 14px menu type are **declined**: our documented 292px `menu` role and 13px type win (`design-trueup.md` §4, "Not adopted, with reasons") | `anytype-object-more-menu-dark.png` via `design-trueup.md` §2 |
| G6 | **Destructive tone at the end** | Destructive actions (Move to Bin) sit last, tonally distinct from safe actions | **Adopt (already ours).** `row-menu.ts:146-160` places delete last with `warning: true`; `menu-row.ts:64` `warning` renders the error colour. The migration enforces the *position* convention on every menu, which today is true of `row-menu.ts` and not checked anywhere else | Capture; code-derived for the position rule |
| G7 | **Toggle labels derive from state** | A toggle item's label names the state it will switch to, not the state it is in | **Decline.** Our menus already do this where it matters (`column-menu.ts:174-175` enable/disable wrap) and our checkboxes carry `aria-checked` (`menu-row.ts:135-140`); Anytype's approach and ours agree without adoption | Research §9 |
| G8 | **Submenus open on hover, pre-filtered** | Submenus are hover-opened and pre-filtered, and still carry their own "create" entries | **Adopt the submenu, defer the hover.** Real submenus through the factory are REQ-001; hover-open is desktop-only ergonomics the captures cannot show (no hover states captured — README "Still not reachable"), so the phone and keyboard paths open on click/`ArrowRight` as ours do today (`column-menu.ts:150-160`) and hover is an open question (spec §11) | Research §9; gap for hover specifics |
| G9 | **Submenu arrows** | Rows that open submenus carry a trailing chevron | **Adopt (already ours, make true).** `menu-row.ts:112-122` draws it; REQ-001 makes the promise real | Research §9 |
| G10 | **Search-first pickers** | The three search surfaces (quick search, in-view search, relation picker search) share one underlying picker component, and each adds its own "create new" entries | **Adopt.** This is REQ-003/REQ-006: one shared search + one create affordance. Anytype's capture `anytype-filter-tag-value-picker-dark.png` shows the value picker's "Filter or create options…" — the create affordance lives *in the search field's placeholder row*, not as a separate button | Research §9; capture |
| G11 | **Create-option row** | Select-type pickers surface a create affordance inside the picker, not in a separate editor | **Adopt for the dropdown primitive.** Our dropdown already supports action rows (`preserveValueOnSelect`, `dropdown-field.ts:42-43`, used at `database-view.ts:5323-5325` for create-field actions); what is missing is the *convention* that every select-value picker gains one when its source can create. The cell option editor already has an add row (`cell-renderer.ts:1508-1516`). Open question in spec §11 decides how far the convention reaches | Capture `anytype-filter-tag-value-picker-dark.png` |
| G12 | **Section headers in pickers** [trued 2026-09-05 — narrowed] | What the pixels show on `anytype-filter-property-picker-dark.png` is a **per-format leading icon** on each property row — `Aa` for text, a page glyph for object type, a calendar for the three date properties, a list glyph for Tag, an `ⓘ` for Description (`design-trueup.md` REQ-013). **Typed group headers are not confirmed by that read** and this row's grouping claim is therefore **code-derived**, not observed | **Adopt (already ours).** `DropdownOption.section` renders group titles (`dropdown-field.ts:220-223`); the filter property picker is where ours should mirror Anytype's **format-icon vocabulary**, which is the part the capture actually shows. Mirroring its grouping *order* stays a proposal with the gap named | `anytype-filter-property-picker-dark.png` via `design-trueup.md` REQ-013 |
| G13 | **Relative condition values** | Date conditions render relative ("N days ago") in chips and values | **Decline here.** Chip rendering is `050` item 1's surface; the date picker's presets (Today/Tomorrow/Next week, `date-value-picker.ts:164-166`) already cover the picker side. Noted so the overlap is visible, not silently dropped | Research §6 |
| G14 | **Checkmarks on the current value** | Pickers mark the active option | **Adopt (already ours).** `dropdown-field.ts:240-243` check icon; `menu-row.ts` `selected` → `menuitemcheckbox`. The migration's job is uniformity: the relation editor's `✓` text node (`cell-renderer.ts:1420`) and the dropdown's icon are two grammars for one affordance — the primitive's check wins | Capture `anytype-relation-editor-tag-dark.png` |
| G15 | **Icons per option** | Menu and picker options carry leading icons keyed to type/meaning | **Adopt (already ours).** `renderIcon` + property-type icons reach the dropdown everywhere (`bulk-edit-field-menu.ts:36-38`); the option editor's colour dots (`cell-renderer.ts:1367`) are the same idea in a second grammar — kept, because a colour swatch is not an icon, but rendered through the shared row slot | Research §9 |
| G16 | **Hover/active row states** | Rows show a visible hover/active state | **Adopt (already ours, verify per surface).** `.db-menu-item` styling is shared; the hand-built rows are where hover states drift. Migration closes the drift; the captures show no hover states (README "Still not reachable") so the target is our own existing hover grammar, not Anytype's pixels | Gap named; our grammar is the source |

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

## 3. What the captures do not settle

- Hover-open specifics (G8): no hover state was captured (README, "Still not reachable"). The
  desktop hover decision is code-derived.
- Exact submenu nesting depth Anytype permits: the layout submenu (`anytype-layout-picker-dark.png`)
  is depth 2; deeper chains were not captured. Our depth-3 chains (registered in
  `tools/live/sheet-grammar.mjs:97-98, 110-112`) are our own constraint to satisfy, not an Anytype
  parity target.
- Item spacing/type-scale numbers: not measurable from the index's prose. Density (G5) is judged
  from our own 292px grammar, which the capture's proportions do not contradict.

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

**What still has no capture, after the true-up.** Hover-open submenu specifics (G8) — the capture
README records that no hover state was ever captured. Submenu nesting deeper than depth 2. And the
"No available actions" state (G3). All three stay **code-derived**, and absence of a capture is not
evidence of absence.

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

**What this document claims, and what it does not.** The rows below name the capture each phone
design should now be read against. **The pixels are unread here** — this landing pass could not open
image files, exactly as the original drafting pass could not. Naming the file is not reading it.
T001 opens each one and trues the design; that obligation is unchanged and is now answerable.

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
