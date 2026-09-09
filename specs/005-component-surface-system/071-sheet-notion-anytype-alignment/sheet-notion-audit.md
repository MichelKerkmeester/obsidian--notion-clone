---
title: "Audit: Every Phone Sheet Against Notion, at the Level of Inputs and Content"
description: "One section per shipped phone sheet: the Notion screen it corresponds to, a row-by-row delta table, the input and content gaps, a UI-improvement priority, and which findings need an operator capture because only a 299x678 thumbnail exists."
trigger_phrases:
  - "sheet notion audit"
  - "071 sheet audit"
  - "which sheets are still not notion"
  - "sheet input content delta"
importance_tier: "important"
contextType: "research"
---
<!-- SPECKIT_TEMPLATE_SOURCE: research-note | v2.2 -->
# Audit: Every Phone Sheet Against Notion, at the Level of Inputs and Content

**Opened by**, verbatim (operator, 2026-09-09 ~22:30): *"Check more sheets align closer to notion,
input, content, wise etc"* and *"Ui improvement is focus here"*.

---

## 0. THE RESOLUTION CEILING — READ THIS BEFORE QUOTING ANY NUMBER

**Every Notion iOS capture in this repository is 299x678 pixels.** Not most: every one checked.
Verified with `sips -g pixelWidth -g pixelHeight` over a 400-file sample of the 1,315 files under
`screenshots/notion/ios/` (400/400 at 299x678), and separately over all 171 files in the five
folders this audit leans on hardest — `ios/database`, `ios/sheets`, `ios/menus`,
`ios/flows/database-settings`, `ios/flows/adding-a-new-property` (171/171 at 299x678). These are
Mobbin marketing thumbnails. `screenshots/notion/ios/harvest.json` carries `image_url` and
`mobbin_url` per screen and **no width or height key**, so there is no metadata path to a native
figure either.

An iPhone's 393pt logical width rendered into 299px is roughly **0.76 px per pt**. A 44pt row is
~33px tall in the asset; 16pt body text is ~12px. Structure survives that; measurement does not.

**Three consequences, and they bind every child packet this audit opens:**

1. **No numeric threshold in any child may be derived from a Notion iOS asset.** Not a pitch, not
   an inset, not a radius, not a font size, not a gap. `007` already established this discipline
   (its D2, inherited from `002` D-005); this audit generalises it from one sheet to all of them.
2. **What a 299x678 asset does support is structure**: how many rows, in what order, each row's
   type (chevron / toggle / value / text input / segmented / destructive), whether rows group into
   cards, where a section header sits, what the header and footer carry, and the copy — where the
   copy is legible, which is often but not always.
3. **Every numeric target in a child packet therefore comes from one of exactly three places**, and
   each is labelled as such in the tables below: **(a)** our own measurement (`tools/live/sheet-grammar.mjs`
   or a direct `styles.css` read), **(b)** an internal-consistency target — one of our sheets
   already does it and the others do not, so the number is ours and the delta is between our own
   surfaces, or **(c)** `TBD — needs operator capture`, listed in §5.

Anytype's captures are **not** thumbnails (1024x716 / 1440x900 desktop, 1206x2622 mobile, `sips`-confirmed)
and are measurable. They are not the target here: the operator's ruling names Notion, and D15
(`roadmap.md:130`, §7.15) makes Anytype the default only for the board and the calendar.

---

## 1. THE PATTERN THIS AUDIT FOUND

`007` found that the Settings sheet passed every lane it had and still read as wrong, because
`002` had measured it against the wrong Notion surface and never compared the sheet's silhouette.
**That was not a one-sheet accident. It is the shape of nearly every finding below**, and it has
two distinct mechanisms:

**Mechanism A — the lane measures the shell, never the content.** `node tools/live/sheet-grammar.mjs`
passes (exit 0, confirmed this session) and its eight "grammar columns" are, read literally,
boolean presence checks: `surface`, `handle`, `header`, `rows`, `segmented`, `keyboard`, `safeArea`,
`dropdown` — each printed as `true`. They prove a sheet *has* chrome. They say nothing about which
rows exist, in what order, what each control is, or whether a label fits inside its own box. A
sheet can score 8/8, print a 44-52px pitch, mount 0 native selects, and still show the user a
property name truncated to two characters. §3.1 is exactly that sheet.

**Mechanism B — the contract's surface list omits the surface.** The title-centring assertion
covers **13** header-bearing surfaces and record-detail and record-peek are not among them, because
they build `.obnotion-record-detail-header` instead of the shared `.obnotion-shell-header` the
assertion queries (`sheet-grammar.mjs:3402`). The record sheet's title is consequently the one
phone-sheet title that does not centre — visible in our own capture, invisible to the gate. §3.5.

**A third, smaller mechanism recurs in the copy:** a string written for a desktop pointer reaches a
phone sheet unchanged. Four do, named in §3.9.

The practical reading for the implementation leg: **a child packet here is not "make the number
different." It is "assert a property the lane never asserted."** Most tasks below are RED-first
against a clause that does not exist yet, not a tightening of one that does.

---

## 2. METHOD AND EVIDENCE

| Source | What it gave | Status |
|---|---|---|
| `node tools/live/sheet-grammar.mjs` | Per-surface row numbers, pitches, insets, spans, and the coverage lists of each contract. Full output kept at `.audit-tmp/sheet-grammar.txt` (2,662 lines) | **PASS, exit 0** — every number below labelled "ours, measured" is from this run |
| `node tools/storybook/sheet-inventory.mjs` | The surface census: **87 surfaces (55 primary + 32 stacked)** | Regenerates `001/inventory.md` byte-identical (`git diff` clean). Note: `071/goal.md` and `roadmap.md` §5.A both say **86**; the generator says 87. Recorded, not fixed — `001` is outside this audit's write authority |
| `screenshots/notion-clone/**` (our captures) | 804x1748 (2x of 402x874), native quality. Opened and read directly, per `repo-rules/screenshot-currency.md` | Current |
| `screenshots/notion/ios/**` | Notion structure only, never numbers — see §0 | 299x678 ceiling |
| `src/views/*.ts`, `styles.css`, `src/i18n.ts` | Producer-side row lists, control types and copy | Read directly |
| Three Sonnet sub-readers | Independent reads of the Notion assets, each briefed with the §0 ceiling and instructed to write `not measurable at 299x678` rather than a number | Their file paths are carried inline below |

**On second readers.** The brief for this audit requires a second reader's confirmation for any
image-derived fact that becomes a threshold. Because of §0, **no image-derived fact becomes a
threshold** — the Notion column is structural throughout, and every number is ours. Where a
structural claim is nonetheless load-bearing for a task, the row says which capture carries it so
the implementation leg can re-open the same file rather than trusting this document.

**What this audit does not do.** It proposes no change that would overturn a landed ruling. Two
places where Notion and a landed decision disagree are recorded as Proposed ADRs in §6 and left
for the operator, per D15.

---
## 3. PER-SHEET SECTIONS

Priorities: **P1** visibly wrong (a user sees something broken, unreadable, or inconsistent with
the sheet beside it) · **P2** clearly different from Notion but not broken · **P3** polish.

---

### 3.1 Properties sheet (`column-manager`) — **P1**

**Ours**: `src/views/column-manager-renderer.ts`, opened at `database-view.ts:5137`. Capture read:
`screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png` (804x1748).
**Notion**: `screenshots/notion/ios/flows/hiding-properties/notion-ios-flow-hiding-properties-02-9867cb76-74ed-4ff0-9254-398aeff2265e.webp`
("Property visibility") and `screenshots/notion/ios/flows/adding-new-properties/notion-ios-flow-adding-new-properties-02-2f52d1bc-fcf7-4da5-8f96-6b1e31339dc4.webp`
("Properties"). Notion ships **two** variants of this surface; both are cited because they differ.

| Notion row | Ours | Delta | Threshold |
|---|---|---|---|
| Header "Property visibility" / "Properties", back-chevron or centered title + **Done** top-right | Header "Properties", centered title + an **"All" master checkbox** + close X | Notion commits with Done; we mutate live and offer a bulk toggle Notion puts in the section header instead | Structural. Move the bulk toggle to the section header (next row); no Done row — live mutation is a landed behaviour, not re-opened here |
| Search field, placeholder **"Search for a property..."** | Search field, placeholder **"Search properties"** | Copy | Copy target: match Notion's ellipsis-terminated form, or at minimum stop differing from our own `viewConfig.sourceRules.searchProperties` = "Search properties..." — **we ship both spellings today** |
| Section header **"Shown in table"** with a **"Hide all"** link on the header's own line | **No section headers at all** — one flat list | **P1.** Notion partitions shown from hidden; we do not. Our *record* sheet already has `panel.shownSection`/`panel.hiddenSection`/`hideAllProperties`/`showAllProperties` (`record-detail-panel.ts:222-226`) — **the strings exist, the properties sheet just does not use them** | ≥2 section headers when ≥1 property is hidden; each header carries its bulk action. Internal-consistency target: reuse the record sheet's own four keys |
| Section header **"Hidden in table"** with a **"Show all"** link | — | as above | as above |
| Row: drag handle + type icon + label + **eye icon** = **4 elements** | Row: **↑ + ↓ + checkbox + type icon + label + wrap + edit + trash = 8 elements**, six of them interactive (`column-manager-renderer.ts:355-410`) | **P1.** Six controls on one 402px row is why the label has no room | **≤4 interactive controls per row.** Ours, measured from the producer; the surplus (wrap/edit/delete) belongs behind a per-row menu or in the edit-property sheet, which is where Notion keeps "Wrap content" and "Delete property" (§3.2) |
| Label is the property's name only | Label is **`Name [file.name]`, `Field 1 [field1]`** — the internal key in brackets | **P1.** The raw storage key is shown to the user on every row | 0 rows render a bracketed key on the phone presentation |
| Row control is an eye (shown/hidden) | Row control is a checkbox | P2, and it is the *record* sheet that already uses the shown/hidden vocabulary | Structural; recorded, low priority |
| `+ New property` as a **row**, then a `Learn about properties` row | `+ Add property` and `+ File property` as **two buttons on one line** (`column-manager-renderer.ts:117-137`) | P2 — two adjacent `+` buttons read as one wrapped control | Add affordances render as full-width rows, not as a side-by-side button pair |
| — | Tooltip **"Double-click to edit"** on every row name (`panel.doubleClickEdit`, applied at `column-manager-renderer.ts:383`) | **P1 (content).** A phone has no double-click | 0 sheet-reachable strings name a pointer gesture — see §3.9 |

**Ours, measured**: the sheet's three between-section boundaries carry the edge-to-edge 1px hairline
(3/3, lane). Pitch and inset are converged and are **not** re-targeted here.

---

### 3.2 Add-property, edit-property and property-type picker — **P2**

**Ours**: `CreatePropertyModal` (`database-view.ts:731`) with the type-picker dropdown absorbed
under the depth cap (lane: "the real dropdown does not add a third sheet"). **Notion**:
`screenshots/notion/ios/flows/adding-a-new-property/notion-ios-flow-adding-a-new-property-03-1589e7c8-87af-4c7d-8b1a-a7ec6ec103f8.webp`
(new property) and `screenshots/notion/ios/database/notion-ios-database-properties-05-086606f1-d300-4d22-a236-46180752ed89.webp`
(edit property).

| Notion row | Ours | Delta | Threshold |
|---|---|---|---|
| **New property is ONE sheet**: name text input, then a `Type` section header, then the type list **inline in the same sheet** | A "Create property" panel that stacks, with the type picker absorbed into it by the depth cap | **Converged in substance** — both end at one sheet. Notion reaches it by never opening a second; we reach it by absorbing one. Recorded, no action | none |
| Name input placeholder **"Property name"** | Search-and-create field, placeholder **"Search or create new"** (`panel.addPropertySearchPlaceholder`), with `Create "{name}"` as a result row | P2. Notion names the field; we make it a search box that can also create | Copy + structural, Proposed — our search-to-create is a real affordance Notion lacks, so this is a trade, not a defect. Recorded for the operator |
| Type list grouped under a `Type` section header; visible order **Text, Number, Select, Multi-select, Status, Date, Person, Files & media** (list truncated by the viewport — the full set is **not** readable in any capture) | Type picker list | Order unverifiable past the eighth entry | **Needs operator capture** — §5 |
| **Edit property = 3 cards**: (1) name/type row, (2) **"Wrap content"** toggle *and* **"Delete property"** together, (3) a help row | Ours puts wrap and delete as **icon buttons on the properties-list row** (§3.1), not in an edit sheet | **P2, and it is the other half of §3.1's P1.** Notion's answer to "too many controls per row" is exactly this sheet | The two controls §3.1 removes from the row land here |
| Delete confirm: centred card, **"Delete this property from {db}? It will be removed from all views."**, stacked **Delete** (red) then **Cancel** | We ship a stacked confirm card (lane-measured) — but our action order is inverted, see §3.4 | see §3.4 | see §3.4 |

**Notion inconsistency, recorded not copied**: in `notion-ios-database-properties-05`, "Delete property"
renders in the **same tone as the row above it, not red**, while "Delete view", "Delete" and
"Delete color setting" are clearly red in three other captures from the same harvest. Our
`is-warning` treatment (`styles.css:813`, used by three producers) is the more consistent of the
two. **Do not copy Notion here.**

---

### 3.3 Record sheet (`record-detail`, `record-peek`) — **P1 header, P2 rows**

**Ours**: `src/views/record-detail-panel.ts:172`. Capture:
`screenshots/notion-clone/panels/constructed-record-detail-mobile-light.png`.
**Notion**: `screenshots/notion/ios/database/notion-ios-database-row-page-03-0cb59457-00da-4154-b7c0-5bb2a4831ba2.webp`.

| Notion | Ours | Delta | Threshold |
|---|---|---|---|
| Row opens as **side peek / center peek / full page**, a user setting (`screenshots/notion/ios/flows/database-detail/notion-ios-flow-database-detail-01-74da3d7a-b6b7-4ab8-ba38-9a17f04de3da.webp`) | Bottom sheet | **Out of scope.** `006-record-open-target` owns the open target. Recorded so a later reader does not re-open it here | none |
| Title is a large heading in the **body**, header bar carries only back / share / ··· | Title in the **sheet header**, `flex: 1`, **left-anchored** (`styles.css:10806-10825`) | **P1.** Every other phone sheet centres its title — the lane proves it for **13** surfaces — and the record sheet is not one of them, because it builds `.obnotion-record-detail-header` instead of the `.obnotion-shell-header` the assertion queries (`sheet-grammar.mjs:3402`). Our own capture shows "row-0" hard left while "Filter", "Sort" and "Properties" all centre | Record-detail and record-peek join the title-centring contract: title centre within **0.50px** of the frame centre. **Ours** — 13/13 covered surfaces already meet it, 12 of them at ≤0.50px |
| Each property row carries a **leading type icon** before the label | Our record rows carry **no** type icon (capture: `month`, `sort_key`, `Priority` all start at the label) | **P2**, and an internal inconsistency: our properties sheet and our filter sheet both show a type icon per property; the record sheet alone does not | Every property row renders its type icon. Internal-consistency target |
| `+ Add a property` row below the list | `+ Add property` row (`record-detail-panel.ts:445-447`) | Converged | none |
| `Add a comment...` row between properties and body | Note-body editor, placeholder `Write a note…` | Different product, not a defect | none |

**Ours, measured and converged — not re-targeted**: 21/21 rows label-beside-value at 44.0px, 20/20
hairlines, 16.0px inset, 1/1 section heading, 0 native selects. `006` closed these; this section
does not reopen them.

---

### 3.4 Destructive confirm — **P2**

**Ours**: `src/views/confirm-sheet.ts` (`buildConfirmSheetBody`). **Notion**: four stacked-confirm
patterns read across `screenshots/notion/ios/sheets/notion-ios-sheets-delete-confirm-{01,02,03,06,07,14,15}-*.webp`.

| Notion | Ours | Delta | Threshold |
|---|---|---|---|
| Centred card, dimmed on all sides | Centred card — lane-measured inset ≥16px all four edges, radius 16px all four corners | **Converged** | none |
| Actions **stacked full width** | Stacked full width (`flex-direction: column`), every action ≥44px (`[44,50]`) | **Converged** | none |
| **Destructive action FIRST, `Cancel` beneath it** — in all four patterns read (`-02` Delete/Cancel, `-14` Replace/Cancel, `-15` Delete view/Cancel, `deleting-a-page-02` Permanently delete/Cancel) | **Cancel is created first** (`confirm-sheet.ts:93`) and confirm last (`:107`), so under `flex-direction: column` **Cancel renders on top** | **P2, inverted.** One-line producer change, one lane assertion | In the stacked variant the destructive action is the **first** child of `.obnotion-modal-actions`; `Cancel` is the last. Structural, from Notion, 4/4 captures agree |
| Title + one body sentence | Title (`h3`) + message row | Converged | none |

**Not adopted**, recorded: Notion's type-to-confirm variant (a text field you must fill with the
object's name) and its radio-choice variant ("Delete view only" / "Delete view and data source").
Both are Notion features for objects we do not have. Do not build them.

---

### 3.5 Date picker — **P2 (input model)**

**Ours**: `src/views/date-value-picker.ts:81`. **Notion**:
`screenshots/notion/ios/sheets/notion-ios-sheets-date-picker-03-cb9d8cab-f85b-438f-bb06-4d1d07b90322.webp`.

| Notion, in order | Ours, in order | Delta | Threshold |
|---|---|---|---|
| 1. Tappable date \| time field row | 1. **Presets row**: Today / Tomorrow / Next week / **Clear** (`date-value-picker.ts:182-188`) | | |
| 2. **Calendar grid** (custom, not a native wheel) | 2. **Three numeric text inputs**: `YYYY` `-` `MM` `-` `DD` (+ `HH` `:` `mm`), each `maxlength`-capped, `inputmode: numeric` (`:189-231`) | **P2, the headline input delta.** Notion never asks a phone user to type a date into three boxes; it gives a tappable field and a calendar. Ours puts the least touch-friendly control in the middle of the sheet | The segment inputs are not the primary path: the calendar precedes them in DOM order. Structural, from Notion |
| 3. `End date` toggle | — | Feature we lack | Not proposed — out of scope for an alignment pass |
| 4. `Date format` value + chevron | — | as above | as above |
| 5. `Include time` toggle | (time segments appear conditionally) | Ours is implicit where Notion's is an explicit toggle | Recorded |
| 6. `Remind` value + chevron, opening a **stacked sheet** with a checkmark list | — | Feature we lack | Not proposed |
| 7. **`Clear` as a plain row at the bottom** | `Clear` is the **fourth preset button**, beside Today/Tomorrow/Next week | **P2.** A destructive-ish action sits inside a row of additive shortcuts | `Clear` is not a member of the presets group. Structural, from Notion |

---

### 3.6 Icon picker — **P3**

**Ours**: `src/views/icon-picker-popover.ts:61`. **Notion**:
`screenshots/notion/ios/sheets/notion-ios-sheets-icon-picker-01-0c4e7197-170b-44d6-adea-534219b9dd35.webp`.

| Notion | Ours | Delta | Threshold |
|---|---|---|---|
| Header: `Remove` top-left · `Page icon` centered · `Close` top-right | Centered title + close X; `Remove`, `Random` and a settings button all sit **inside the body header row beside the search field** (`icon-picker-popover.ts:141-151`) | P3 — Notion promotes Remove to the header; ours crowds three buttons next to a search input | Structural, low priority |
| Tabs `Emoji \| Icons \| Upload` | Tabs `Emoji \| Icons` | We have no upload; correct to omit | none |
| Search placeholder `Filter...` | `Search icons and emoji` (`iconPicker.search`) | P3 copy | none proposed — ours is clearer |
| `Recent` section, then category sections | `Recent` section, then category sections (`:211-220`) | **Converged** | none |
| Colour swatch popover + an `Ask every time` toggle | Colour dot row (`:161-166`) | Converged in substance | none |

---

### 3.7 Option colour picker — **P3, converged**

**Ours**: `src/views/option-color-picker.ts:76-89` — a single-column list of `button` rows, each
carrying a colour dot, a translated colour name, and a checkmark span for the current value.
**Notion**: `screenshots/notion/ios/flows/adding-a-conditional-color/notion-ios-flow-adding-a-conditional-color-06-fe308218-4a60-4b96-bbb5-212753e870a2.webp`
— a single-column list of rows, each a swatch + a colour name, current selection carrying a
trailing checkmark.

**These are the same control.** No delta worth a task. The only difference is naming — Notion's
entries read "Green background" because that picker sets a background; ours read "Green" because
ours sets an option colour. Correct as-is. Recorded so a later pass does not re-audit it.

---

### 3.8 Record / cell / column menus — **P3**

**Ours**: `owned-menu.ts:56`, `column-menu.ts:94`, `row-menu.ts`. **Notion**:
`screenshots/notion/ios/menus/notion-ios-menus-menu-13-6ecea6c7-4682-4c35-b649-412a0a240738.webp`
(page Actions), `notion-ios-menus-menu-10-0d1a034d-fbe8-4bbd-aecd-4fab8a778c2f.webp` (block Actions),
`screenshots/notion/ios/database/notion-ios-database-more-menu-15-56d9b984-7f99-4ae1-acae-833ee1c31eb2.webp`
(Data source actions).

| Notion | Ours | Delta | Threshold |
|---|---|---|---|
| Rows grouped into **several rounded cards** on a canvas, section headers above a card | Rows with separators and section headings (`createMenuSection` / `createMenuSeparator`) | **P3 here, deliberately.** This is `007`'s card-grouping finding in a second family. It should be decided once, on the settings sheet, and only then propagated — see §6 ADR-A | Deferred to `007`'s outcome. **No task in this audit's children.** |
| Destructive row in **red**, last in its card | `is-warning` rows in red (`styles.css:813`), used by three producers | **Converged** | none |
| Several menus commit with **`Done`** top-right | Close X | P3 — a menu that mutates live needs no Done | none proposed |
| Footer meta rows (`Word count`, `Last edited by …`) | — | Feature we lack | none |

---

### 3.9 Filter sheet — **P1, the worst sheet in the app**

**Ours**: `src/views/filter-panel-renderer.ts`, opened at `database-view.ts:5054`. Capture read:
`screenshots/notion-clone/panels/constructed-filter-panel-mobile-light.png` (804x1748).
**Notion**: `screenshots/notion/ios/database/notion-ios-database-filters-03-*.webp` and `-04-*.webp`
("Advanced filter"), `flows/filtering-a-database/notion-ios-flow-filtering-a-database-02..06-*.webp`.

**The finding in one sentence: Notion gives a filter rule three stacked rows; we give it one row
with six controls, and the property name truncates to two characters.**

Read directly off our own capture, the three condition rows render their property as
**`F…`**, **`gr…`** and **`is…`**, and a value as **`Backl…`**. The property dropdown, the operator
dropdown and the value field share one 48px row at 402px with three further icon buttons
(`folder-plus`, `circle-slash-2`, `×`) beside them (`filter-panel-renderer.ts:595-604`).

| Notion row | Ours | Delta | Threshold |
|---|---|---|---|
| Rule card, row 1: **property**, type icon + name, chevron, opening its own picker | Property dropdown, inline, ~1/4 of the row | **P1** | A condition's property, operator and value occupy **3 rows**, not 1. Structural, from Notion (4 captures agree) |
| Rule card, row 2: **operator**, indented, chevron, opening a "Comparator" sheet (Is / Is not / Contains / Does not contain / Starts with / Ends with) | Operator dropdown, inline | **P1** | as above |
| Rule card, row 3: **value**, indented, gray placeholder **"Value"** + an **"Edit"** link; once filled, the text plus a circular **×** clear | Value input inline; when absent, a bare **`—`** glyph (`filter-panel-renderer.ts:595`) | **P1.** `—` is not a control and reads as a dead cell | Empty value renders a labelled affordance, not a bare em dash |
| Actions card beneath the rule: **"Remove"** (red, trash), **"Duplicate"**, **"Turn into group"** | Three unlabelled icon buttons on the rule row: folder-plus, ∅, × | **P1.** `∅` (`circle-slash-2` = "Negate rule") and folder-plus ("Add rule group") are unlabelled glyphs with no text anywhere on the surface | Rule actions are **labelled rows**, not unlabelled glyphs on the rule row |
| Card: **"Add filter rule"**, **"Add filter group"** (subtitle "A group to nest more filters") | `+ Add condition` button, `+ Add advanced filter` footer button | P2 — ours is close; the copy and the subtitle differ | Copy alignment only |
| **No inline AND/OR control found in any capture** — nesting only, via "Add filter group" / "Wrap in group" | Header-adjacent **`AND (all)` / `OR (any)`** dropdown (`filter-panel-renderer.ts:328-330`) | **Divergence, not a defect.** We also ship nested groups (`obnotion-source-rule-group`). Notion's absence of an AND/OR toggle is a different model, not a better one | **Proposed only — §6 ADR-B.** Do not remove the conjunction control on this audit's authority |
| — | Rows sit **25.0px** from the sheet edge; sort's sit **16.0px** | **P1, ours, measured.** The lane prints `rowInsetFromSheet` at `sheet-grammar.mjs:3998` and **never asserts it**, so a 9px family inconsistency has been passing silently | Every panel sheet's divider-owing rows sit **16.0px** from the sheet edge, asserted. Internal-consistency target: sort already measures 16.0px |
| — | Row span **332px**; sort **357px**; group **341px** on the same 402px frame | **P1, ours, measured.** Three sheets in one family, three content widths | The three panel sheets share one row span, tolerance **±2px**. Internal-consistency target |
| — | Empty state: **"Click \"Add condition\" below to start filtering."** (`panel.emptyFilters`) | **P1 (content).** "Click" and "below" on a touch sheet | §3.16a |

---

### 3.10 Sort sheet — **P2**

**Ours**: `src/views/sort-panel-renderer.ts`. Capture: `constructed-sort-panel-mobile-light.png`.
**Notion**: `screenshots/notion/ios/database/notion-ios-database-sort-01-*.webp`, `-02-*.webp`,
`flows/sorting-a-database/notion-ios-flow-sorting-a-database-03..07-*.webp`.

Labels fit here — this sheet is *different*, not broken, which is why it is P2 and filter is P1.

| Notion row | Ours | Delta | Threshold |
|---|---|---|---|
| Rule card, row 1: **property**, type icon, chevron | Field dropdown, inline | P2 — same stacking delta as §3.9, one degree milder | A sort rule occupies **2 rows** (property, direction), not 1 |
| Rule card, row 2: **direction**, indented, chevron, opening a custom sheet with exactly **"Ascending"** / **"Descending"** + Done | Direction dropdown, inline, copy **`common.asc`/`common.desc`** | P2. Ours already uses the plugin's own picker, not a native select (lane: 0 native selects) — the control type is converged, the layout is not | as above |
| Rule card, row 3: **"Delete"**, red text, trash icon | **`×`** text glyph at the row's end (`sort-panel-renderer.ts:246`) | P2 | Per-rule delete is a labelled destructive row, not a `×` glyph. (The glyph's hit area is already expanded to ≥44px by `styles.css:13820`'s `::before` — this is a legibility delta, **not** a touch-target one) |
| Second card: **"Add sort"**, **"Delete sort"** | `+ Add sort` button | Converged enough | none |
| Reorder: not visible in any capture | **↑ and ↓ arrow buttons** leading every row (`sort-panel-renderer.ts:184-205`), plus a `⋮⋮` drag handle | P2 — two reorder mechanisms on one row. Notion's group sheet uses a 6-dot grip alone | **Needs operator capture** for Notion's sort reorder — §5 |
| — | Empty state **"Click \"Add sort\" below to add multi-sort rules."** | P1 (content) | §3.16a |
| — | `sortPanel.calendarHint`, a **150-character paragraph** rendered inside the sheet (`sort-panel-renderer.ts:124`) | P2. No Notion sheet in the harvest carries prose of that length | Sheet-body prose ≤ **80 characters**, or moves behind an info affordance. Ours |

---

### 3.11 Group sheet — **P2**

**Ours**: `toolbar-renderer.ts:1757`. **Notion**: `flows/grouping-a-database/notion-ios-flow-grouping-a-database-03-*.webp`,
`flows/group-2/notion-ios-flow-group-2-02..04-*.webp`, `database/notion-ios-database-group-by-13-*.webp`.

| Notion row | Ours | Delta | Threshold |
|---|---|---|---|
| `Group by` — value + chevron | present | Converged | none |
| `Text by` — value "Exact" + chevron | — | Feature we lack | Not proposed |
| `Sort` — value "Alphabetical" + chevron | present (`groupOrder.*`) | Converged | none |
| `Hide empty groups` — **toggle** | present (landed in `059`) | Converged | none |
| Section header **"Groups"** with a **"Hide all"** link on its own line | 1 section heading, no bulk action (lane: "group — 1 section heading(s)") | P2 | Section header carries its bulk action, matching §3.1's target |
| Per-group row: **6-dot drag grip + name + eye icon** | 17/17 rows at 44.0px | Converged on pitch; the control set needs the same ≤4 audit as §3.1 | ≤4 interactive controls per group row |
| Sub-group splits groups into **"Visible groups"** (+ Hide all) and **"Hidden groups"** (+ Show all) | — | P2, and the same shown/hidden partition §3.1 and the record sheet both want | Same target as §3.1 — one shown/hidden vocabulary across properties, groups and record |
| Empty state: `Group by` row with no value + `Learn about grouping` | — | P3 | none |

---

### 3.12 Add-view and layout — **P2, with a landed contradiction**

**Ours**: `toolbar-renderer.ts:1399-1510`. **Notion**: `flows/changing-layout/notion-ios-flow-changing-layout-02-*.webp`,
`flows/layout/notion-ios-flow-layout-02-*.webp`, `flows/changing-database-view/notion-ios-flow-changing-database-view-02-*.webp`.

| Notion | Ours | Delta | Threshold |
|---|---|---|---|
| **Create first, name later.** "N views" modal → **"New view"** row (blue `+`, title, subtitle "Table, chart, form and more") → layout grid → the view exists → rename via View options' "View name" input | **Name first, create last.** Four form rows — name input, view-key-field dropdown, view-icon input, "Copy current view settings" checkbox — then a `Create` section of type rows | **P2, the headline "input" delta on this sheet.** We ask for four decisions before the action; Notion asks for one after it | The creation affordance precedes the optional settings in DOM order. Structural, from Notion |
| Layout choice is a **grid of icon+label cards** (4x2 or 3x4), selected card gets a blue border | Layout choice is a **list of menu rows with chevrons** | **Contradiction with a landed decision.** `toolbar-renderer.ts:1494-1502` documents the choice against tiles by name: *"Rows, not tiles. The tiles carried a preview that was identical for all seven types…"* | **Proposed only — §6 ADR-C.** Do not convert rows to tiles on this audit's authority |
| Name input has a **placeholder ("View name")** | Name input has **no placeholder**, deliberately (`toolbar-renderer.ts:1428-1430`: *"a placeholder is not a label — it vanishes at the first keystroke"*) | Contradiction with a documented local decision | **Recorded, not proposed.** Our reasoning is sound and Notion's is not evidence against it |
| Layout sheet carries layout-specific rows after the grid (Table: "Show vertical lines", "Wrap all columns", "Open pages in", "Show page icon"; Board: "Card preview", "Card size", "Group by") | These live on our Settings sheet | Different placement, same content | none |

---

### 3.13 Column-width sheet — **P3**

**Ours**: `column-width.ts:347-424` — a title row, a slider + numeric input row, and a 4-button
preset group (`Narrow` / `Medium` / `Wide` / `Auto`). **Notion**: **no corresponding screen exists
in the harvest.** Notion's iOS app does not expose per-column width; the nearest relative is the
Table layout sheet's `Wrap all columns` toggle.

**No delta can be stated, because there is no reference.** Recorded so a later pass does not
re-search for one. The sheet is lane-green (floating frame, 8px insets, 16px radii, 44x44 close)
and is the only sheet in the app classified `floating` rather than `flush` — deliberate, and
proven by its own frame-shape assertion.

---

### 3.14 Toolbar overflow / "New record" popover — **P2**

**Ours**: `toolbar-renderer.ts:2470-2560`. **Notion**: nearest is `database/notion-ios-database-more-menu-15-*.webp`
("Data source actions") — three cards of plain action rows.

| Notion | Ours | Delta | Threshold |
|---|---|---|---|
| Plain action rows only | Placement segmented buttons, template rows, a blank-note row, a set-default action — **then a `Settings` section of per-column *text input rows*** with placeholder `toolbar.presetNone` (`toolbar-renderer.ts:2540-2556`) | **P2.** A menu that also contains free-text form fields is a shape no Notion menu in the harvest has | Text-input rows do not share a surface with action rows; the presets move to their own sheet or behind a row. Structural, from Notion |
| Disabled rows are omitted | `toolbar.configureTemplates` renders as a **disabled `div` with `role="note"`** when no template exists | P3 | Recorded |

---

### 3.15 Settings sheet — cross-reference only

Owned entirely by **`007-settings-sheet-strict-alignment`**, which **landed on 2026-09-09**
(`a56020f7`+`48dbd5d9`: 2/2 card groups, radius ≥8px, distinct card and canvas backgrounds, gap
≥8px, section labels above their cards) with its four card metrics **provisional** until its own
T001 operator capture retunes them. Not re-audited here and no child in this audit touches it. Two facts from this audit's reading are added to `007`'s record rather than
acted on:

1. **`007`'s card-grouping finding recurs in the menus** (§3.8) and in Notion's *Actions* sheets,
   which group into 5-6 cards. Decide it once on the settings sheet, then propagate — §6 ADR-A.
2. **Notion's Settings sheet is the router to Filter, Sort, Group, Property visibility and
   Conditional color** (`flows/adding-a-conditional-color/notion-ios-flow-adding-a-conditional-color-02-*.webp`),
   each a value+chevron row. **Ours reaches them from labelled toolbar buttons instead** — which is
   what the operator asked for in `roadmap.md` §4 **row 83** (*"Lets have these style of buttons for
   sort filter etc"*, landed as `075-toolbar-labelled-buttons`). **This audit therefore does not
   propose Notion's navigation model.** Recorded so the difference is not mistaken for a gap later.

---
### 3.16 Copy, across every sheet — **P1 for four strings, P3 for the rest**

Not a sheet, a cross-cutting content finding. All figures from `src/i18n.ts`, EN block (lines
23-1840), producers confirmed by grep.

**a) Four strings that name a pointer gesture reach a phone sheet renderer.** A phone has no
click, no double-click and no hover. Each producer was grep-confirmed:

| Key | String | Reaches |
|---|---|---|
| `panel.emptyFilters` | "Click \"Add condition\" below to start filtering." | `filter-panel-renderer.ts` |
| `panel.emptySorts` | "Click \"Add sort\" below to add multi-sort rules." | `sort-panel-renderer.ts` |
| `panel.doubleClickEdit` | "Double-click to edit" | `column-manager-renderer.ts:383` |
| `viewConfig.computedSync.manualHint` | "…until you click "Save formula results"." | `view-config-panel-renderer.ts` |

**Threshold: 0 sheet-reachable strings name a pointer gesture.** Ours, countable, and the count
is exactly 4 today. (Seven further such strings exist — `cell.doubleClickRename`, `cell.clickToEdit`
and five others — but they belong to cells and the desktop table, not to a sheet. **Out of scope:
do not touch them.**)

**b) Ellipsis is spelled two ways: 13 ASCII `...` and 10 U+2026 `…`** in the EN dictionary.
`viewConfig.sourceRules.searchProperties` = "Search properties..." and `panel.searchProperties` =
"Search properties" ship in the same app. **Threshold: one spelling, 23/23.** P3.

**c) One concept, two words.** `panel.field` = **"Field"** (the filter and sort sheets' own control
labels) and `filter.field` = **"Property"** live in the same dictionary. Notion says *property*
everywhere; so does the rest of our own UI (`panel.addColumn` = "Add property",
`panel.searchProperties` = "Search properties"). **Threshold: the sheet-facing label is "Property";
0 occurrences of "Field" as a user-facing property label.** P2.

**d) `panel.and` = "AND (all)" / `panel.or` = "OR (any)".** No Notion capture shows an inline
conjunction control at all (§3.9), so there is no reference form. The parenthetical gloss is ours.
**Recorded, not proposed** — it is tied to §6 ADR-B.

---

## 4. PRIORITY ROLL-UP

| Sheet family | P1 | P2 | P3 | Top delta |
|---|---|---|---|---|
| **Filter** (§3.9) | **6** | 2 | 0 | Property name truncates to two characters — six controls share one 48px row where Notion stacks three |
| **Properties** (§3.1) | **4** | 3 | 0 | Eight elements per row (six interactive) and the raw storage key printed in the label |
| **Record sheet** (§3.3) | **1** | 2 | 0 | The one phone-sheet title that does not centre, on the one surface the centring contract does not cover |
| **Copy** (§3.16) | **4** | 1 | 2 | Four sheet-reachable strings tell a phone user to click or double-click |
| **Sort** (§3.10) | 1 | **5** | 0 | One row carries field + direction + two reorder arrows + a `×`; Notion stacks two rows and a labelled Delete |
| **Add-view** (§3.12) | 0 | **3** | 1 | Four form decisions precede the create action; Notion creates first and names after |
| **Date picker** (§3.5) | 0 | **3** | 2 | Three numeric text boxes for a date, ahead of the calendar |
| **Group** (§3.11) | 0 | **3** | 1 | No shown/hidden partition and no bulk action on the section header |
| **Add/edit property** (§3.2) | 0 | **2** | 1 | "Wrap content" and "Delete property" belong in an edit sheet, not as icons on the list row |
| **Toolbar overflow** (§3.14) | 0 | **1** | 1 | Free-text preset inputs share a surface with action rows |
| **Confirm** (§3.4) | 0 | **1** | 0 | Cancel renders above the destructive action; Notion is the other way round in 4/4 captures |
| **Icon picker** (§3.6) | 0 | 0 | **3** | Remove/Random/settings crowd the search row |
| **Colour picker** (§3.7) | 0 | 0 | 0 | **Converged** — same control as Notion's |
| **Menus** (§3.8) | 0 | 0 | **2** | Card grouping, deferred to `007` |
| **Column width** (§3.13) | 0 | 0 | 0 | **No Notion reference exists** |
| **Settings** (§3.15) | — | — | — | Cross-reference to `007` |

**Totals: 16 P1, 26 P2, 13 P3.**

---

## 5. FINDINGS THAT NEED AN OPERATOR CAPTURE

Every row here is blocked on the §0 ceiling and **must not be guessed**. A child packet may ship
its structural requirements without these; only the numeric or ordinal cell stays `TBD`.

| # | What is needed | Why the harvest cannot answer it | Blocks |
|---|---|---|---|
| C-1 | A full-resolution Notion iOS **Advanced filter** sheet | Row heights, the indent applied to the operator and value rows, and the gap between the rule card and the actions card are all sub-pixel at 299x678 | §3.9's numeric targets. Its **structural** targets (3 rows, labelled actions) do not need it |
| C-2 | A full-resolution Notion iOS **Property visibility** sheet | Same, for the row's four-element layout | §3.1's numeric targets |
| C-3 | The **complete** Notion property-type list | The type list is cut off by the viewport after "Files & media" in every capture; entries past the eighth are not merely low-res, they are **absent** | §3.2's type ordering |
| C-4 | Notion's **sort-rule reorder** affordance | No capture shows a sort rule being reordered; the group sheet's 6-dot grip may or may not apply | §3.10's reorder-control decision |
| C-5 | A full-resolution Notion **record page** with **many** properties | Every captured row page has exactly 3 properties, so a "N properties / Show all" collapse never triggers and cannot be ruled in or out | Whether our record sheet needs a collapse affordance |
| C-6 | Confirmation of Notion's **destructive-row colour** on the edit-property sheet | `notion-ios-database-properties-05` renders "Delete property" in the same tone as the row above, while four other captures render destructive rows red. At 299x678 a subtle tint cannot be separated from compression | Nothing — §3.2 already rules **not to copy** Notion here |

**C-1 through C-5 are the same request `007` T001 already makes for the settings sheet.** If the
operator supplies a device capture pass, one pass answers all six.

---

## 6. CONTRADICTIONS — PROPOSED ADRs, NOT RESOLVED HERE

D15 (`roadmap.md:130`, §7.15) makes Notion refinement **additive**: it may add a criterion or a
task, and may not un-tick a measured row or overturn a landed ruling. Where a Notion reading
contradicts one, it becomes a Proposed ADR naming both readings. **Three do.**

**ADR-A — Card grouping, decided once or three times.** `007` **wrapped** the settings
sheet's rows in rounded cards on a canvas. Notion does the same in its *Actions* menus (5-6 cards,
§3.8) and its *Advanced filter* sheet (rule card / actions card / add card, §3.9). **Reading 1**:
adopt cards per sheet as each child reaches it, which risks three different card treatments.
**Reading 2**: hold every family until `007` lands, then propagate one treatment. *This audit takes
neither and opens no card-grouping task in any child*, because `007` owns the decision.
**Status at the time of writing: `007` LANDED on 2026-09-09** (`a56020f7`+`48dbd5d9`) with 2/2
cards, radius ≥8px, distinct card/canvas backgrounds and a ≥8px gap — but its four card metrics
are explicitly **provisional** until its own T001 operator capture retunes them. So the treatment
exists and its numbers do not yet. Propagating a provisional number to six more families would
multiply a value that is about to change. Routed to `007`: ADR-A is decided when `007`'s metrics
are final, not before.

**ADR-B — The AND/OR conjunction control.** No Notion capture shows an inline AND/OR toggle; Notion
expresses conjunction only through nested filter groups. Ours ships **both** a conjunction dropdown
(`AND (all)` / `OR (any)`) and nested groups. **Reading 1**: Notion's absence is a simplification
worth adopting. **Reading 2**: it is a capability we have and Notion does not, and removing a
working control to match a screenshot is a regression. **This audit takes Reading 2 by default and
proposes no removal**; the operator may overrule. Note the harvest cannot prove Notion lacks the
control app-wide — only that no captured screen has one.

**ADR-C — Layout choice: rows or tiles.** Notion presents layout as a **grid of icon+label cards**
with a blue selected border, in 6 captures across 3 flows. We present it as **rows with chevrons**,
and `toolbar-renderer.ts:1494-1502` documents that choice against tiles by name — the tiles carried
a preview identical for all seven types, so the grid's one advantage was never delivered.
**Reading 1**: Notion's grid is the reference and our rows are the drift. **Reading 2**: our comment
describes a real defect in *our* tiles, which Notion's grid may not share, since Notion's cards
carry distinct per-layout icons rather than an identical preview. **Unresolved. No task proposes
the conversion.**

---

## 7. WHAT THIS AUDIT DELIBERATELY DOES NOT PROPOSE

Named so a later reader does not read the omission as an oversight:

- **Notion's settings-as-router navigation model** — contradicted by operator row 83 (§3.15).
- **Removing the AND/OR control** — ADR-B.
- **Converting layout rows to tiles** — ADR-C.
- **Card grouping on any sheet** — ADR-A, owned by `007`.
- **The name-input placeholder on the add-view sheet** — our reasoning is documented and sound (§3.12).
- **Notion's type-to-confirm and radio-choice confirms** — features for objects we do not have (§3.4).
- **`End date`, `Include time`, `Remind`, `Date format`, `Timezone` rows on the date picker** —
  features we lack, not alignment gaps (§3.5).
- **The seven pointer-gesture strings that belong to cells and the desktop table** (§3.16a).
- **Any change to row pitch, divider inset, section inset or native-select count** — `002`-`006`
  converged these and the lane proves them; every child below regression-checks them instead.
