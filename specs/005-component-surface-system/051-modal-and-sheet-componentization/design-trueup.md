---
title: "Design True-Up: Every Modal and Sheet in the 051 Census Against the Captures"
description: "One row per census surface — the Anytype screen it was designed against or the named gap, the pixel and timing values read off that screen, what our tree does today, and the per-pair sub-page ruling ADR-002 asked for. This is T001's output and the packet's surface inventory of record."
trigger_phrases:
  - "051 design true-up"
  - "modal surface inventory"
  - "shell capture read"
  - "sub-page pair list"
  - "T001 capture read"
  - "sheet geometry true-up"
importance_tier: "high"
contextType: "research"
---
# Design True-Up: The 051 Census Against the Captures

> This is **T001's output** and goal D1's gate. It **is** the `modal-surface-inventory.md` the packet
> was drafted against; the filename changed and nothing else did, exactly as `050`'s
> `design-trueup.md` replaced its `capture-alignment.md`. Every value below was read off a file in
> `screenshots/anytype/`, `screenshots/anytype/menus/`, `screenshots/anytype/mobile/`, off a file in
> `screenshots/notion-clone/`, or off a line in `src/views/`. Nothing here is carried over from
> `050`'s true-up or `047`'s research unless it is labelled as such.

---

<!-- ANCHOR:headline -->
## 1. THE HEADLINE, BEFORE THE TABLE

`050`'s true-up was written before the iOS captures landed and could name only the desktop popover.
Reading all three sets — 151 desktop states, 600 desktop menu files, 118 iOS sheet files — changes
this packet in four places, and confirms it in one.

**The sub-page pattern is real, and its tolerance was written wrong.** `AC-003` and `NFR-P02` ask for
a parent bounding box that moves by `|Δ| ≤ 1px`. On the phone that is exactly right and now measured:
`anytype-mobile-sheet-view-edit-dark.png`, `anytype-mobile-sheet-view-layout-picker-dark.png` and
`anytype-mobile-sheet-view-gallery-imagepreview-dark.png` are three different sub-pages of one sheet,
and all three put the frame's top edge at device y **1261** and the grab handle at **1278** — the
same pixel, three times. On the **desktop** the same navigation changes the frame's height by up to
**300px**: the view-settings popover is 360 × **316**px, `‹ Layout` is 360 × **298**, `‹ Filter` is
360 × **90**, `‹ Sort` 360 × **166**, `‹ Properties` 360 × **390**. The width never moves. A rule
written as "the bounding box does not move" cannot be observed on the surface it was written for.

**There are three navigation moves, not two, and each carries its own affordance.** The packet
describes replace-in-place and stack-a-picker. The captures show a third — a stacked **sheet**, which
is a different thing from a stacked **menu** — and the phone marks all three unambiguously: a replace
keeps one grab handle at an unmoved edge, a stacked sheet shows a **second handle 10pt above the
child's**, and a stacked menu has **no handle at all**. §3 has the files.

**Anytype's phone client never stacks a third sheet.** Two independent chains prove it:
`anytype-mobile-sheet-relation-new-format-dark.png` shows the format picker **replacing** the
`New property` sheet rather than becoming a third layer over `Add property`, and
`anytype-mobile-sheet-filter-condition-operators-dark.png` shows the operator list replacing the
condition editor over the still-present `Filters` sheet. Three of `048`'s thirty-one registered pairs
declare `depth: 3` (`sheet-grammar.mjs:98`, `:113`, `:117`).

**`044`'s "header everywhere, 44px close" contradicts every phone capture — and wins anyway, for a
measured reason.** No Anytype iOS sheet has a close control. Dismissal is the grab handle, and the
handle measures `#555555` on `#1F1F1F` = **2.21:1**, below WCAG 1.4.11's 3:1 for a non-text element
that is the only thing identifying a control. The operator's ruling was preference; it is now a
number.

**Confirmed, not changed: the shell's geometry.** `anytype-menu-set-view-settings-dark.png` measures
the same 360 × 316px popover, the same 28px rows, the same 8px divider clearance, the same 16px
inset and the same `#171717`/`#292929`/`#E1E1E1`/`#A3A3A3` that `050` §2 recorded off a different
capture. Two capture sets, two crawlers, one answer. `REQ-006`'s values stand.
<!-- /ANCHOR:headline -->

---

<!-- ANCHOR:method -->
## 2. HOW THE CAPTURES WERE READ

**Scale, and why the two sets are not comparable without it.**

- **Desktop** — 1 device pixel to 1 CSS pixel. `anytype-menu-set-view-settings-dark-full.png` is
  2168 × 1217, the same window `050` measured, and the panel inside it measures 360px across in both
  the clipped and the full capture. Every desktop number below is a CSS pixel.
- **iOS** — every file in `mobile/` is **1206 × 2622**, which is 402 × 874 **pt at 3×**. Every phone
  number below is divided by three and stated in **pt**. A number taken off these files without that
  division is wrong by 3×, and the row heights would read as 150.

**Method.** Panel edges were found by scanning for the `#292929` border column, not by eye; row
pitch by ink-band grouping down a column strip; colours by per-pixel sampling; the scrim by dividing
the mean luminance of the same three bands with and without the sheet present. Contrast ratios are
computed from the sampled hex, not estimated.

**What a static capture cannot answer.** Motion, hover, focus, and any state needing a pointer. Every
timing figure in this document is `050` §4's reconciled band, labelled as such, never quoted as
measured.

### 2a. The desktop popover system, re-measured

Independent of `050`, off `menus/` rather than off the earlier panel captures.

| Property | Measured | Where |
|---|---|---|
| Panel width | **360px** (border box x 12..372) | `anytype-menu-set-view-settings-dark.png`; identical in `-view-layout-`, `-view-filter-`, `-view-sort-`, `-view-properties-` |
| Panel height | **content-driven, 90..390px** | 316 / 298 / 90 / 166 / 390 across the five sub-pages above |
| Menu width | **256px** (x 12..267) | `anytype-menu-object-more-dark.png`; `anytype-menu-set-filter-property-picker-dark.png` |
| Condition editor width | **288px**, background `#191919` | `anytype-menu-set-filter-select-condition-dark.png` x 12..299 |
| Operator dropdown width | **232px** | same file, x 13..244 at y 300 |
| Row pitch | **28px** | Filter→Sort centres 205.5→232.5; Duplicate→Remove 277.5→305 |
| Divider inset | **16px each side** (331px inside a 360px frame) | `anytype-menu-set-view-settings-dark.png` y 182, y 255 |
| Divider clearance | **8px each side** | row edge 175 → divider 182 → next row edge 191.5 |
| Sections per context menu | **5, separated by 4 dividers** | `anytype-menu-object-more-dark.png` y 56, 297, 398, 471 |
| Layout tile | **104 × 88px, 8px gutter, 3 across a 328px content box** | `anytype-menu-set-view-layout-dark.png` tile edges 28/140/244/356, rows 50..137 and 146..233 |
| Panel background / border | **`#171717` / 1px `#292929`** | every menu file scanned |
| Primary / secondary text | **`#E1E1E1` (13.71:1)** / **`#A3A3A3` (7.11:1)** | on `#171717` |

### 2b. The iOS sheet system, measured for the first time

`050` had no phone captures and said so. These are new.

| Property | Measured | Where |
|---|---|---|
| Sheet frame | **x 8..394pt of a 402pt screen** — an **8pt inset on both sides** | `anytype-mobile-sheet-view-edit-dark.png` device x 24..1181 |
| Sheet bottom | **865.7pt of an 874pt screen** — an **8pt inset at the bottom too** | same file, device y 2597 |
| Sheet corner radius | **≈16pt** | inset 13.7pt at 0.3pt depth, 6.7pt at 3pt depth — a 16pt arc |
| Sheet top edge | **content-driven: 420.3pt (a four-row list) to 62pt (a search-and-grid picker)** | `-view-edit-` 1261; `-icon-picker-`, `-cover-picker-`, `-cell-select-priority-` 186 |
| Grab handle | **34 × 5pt, `#555555`, centred, 6pt below the top edge** | `-view-edit-` device x 552..653, y 1279..1292 |
| Row pitch | **50pt** | dividers at 616.7 / 666.7 / 717.0pt |
| Text input row | **50pt tall, `#3A3A3A` fill, fully rounded** | device y 1515..1665 |
| Header, top edge to title centre | **39pt**; header block **≈70pt** to the first row | title ink 453.3..465.3pt |
| Title | **≈17px, `#F3F3F3` (14.85:1), centred, bold** | cap height 12pt |
| Row label | **≈16px, `#F3F3F3`** · Row value **`#909090` (5.16:1)** | `Layout … Grid ›` |
| Empty-value text | **`#7B7B7B` — 3.89:1. REJECTED** | `Filters … No filters ›` |
| Divider | **`#393834`, 1px, 20pt inset each side** | device y 1850, x 82..1123 |
| Sheet background | **`#1F1F1F`** (view config) · `#141415` (cell editors) · `#000000` (grid pickers) | three different materials, not one token |
| Scrim, page under the first sheet | content at **0.519** of undimmed luminance ≈ **48% black** | `-view-edit-` vs `anytype-mobile-set-grid-dark.png`, three bands, 0.519 / 0.520 / 0.505 |
| Scrim, parent sheet under a stacked child | **0.710** ≈ **29% black** | `-cell-url-` vs `anytype-mobile-sheet-object-properties-dark.png`, three bands, 0.710 / 0.710 / 0.710 |

**Three of these are rejected rather than adopted.**

1. **The `#7B7B7B` empty-value grey, at 3.89:1**, fails 4.5:1 for 16px body text. There is already a
   second grey on the same screen that clears it — `#909090` at 5.16:1 — so the fix costs nothing:
   **one secondary grey for both applied and empty values.**
2. **The `#555555` grab handle, at 2.21:1.** On a sheet with no close control it is the only thing
   identifying the dismissal affordance, which is exactly WCAG 1.4.11's 3:1 case. This is the measured
   reason `044`'s 44px close survives the contradiction in §6 C2.
3. **The divider inset**, because Anytype does not have one answer — §6 C8.
<!-- /ANCHOR:method -->

---

<!-- ANCHOR:moves -->
## 3. THE THREE NAVIGATION MOVES, AND HOW TO TELL THEM APART

The packet names two. The captures show three, and the phone marks each with a different affordance —
which is what makes the shell able to offer them without the caller having to describe them.

| Move | What the frame does | Affordance in the capture | Files |
|---|---|---|---|
| **Replace in place** | The frame's anchored edge does not move; the title and body swap; the height is free to change on desktop and does not change on phone | **One** grab handle, unmoved. Desktop: the header becomes `‹ Title` with a back chevron | `anytype-mobile-sheet-view-edit-dark.png` → `-view-layout-picker-dark.png` → `-view-gallery-imagepreview-dark.png`, all three at top edge 1261 / handle 1278 · `anytype-menu-set-view-settings-dark.png` → `-view-layout-`, `-view-filter-`, `-view-sort-`, `-view-properties-` |
| **Stack a sheet** | A second sheet rises over the first; the parent stays mounted and is dimmed to **0.710** | **Two** handles — the parent's peeking ~10pt above the child's | `anytype-mobile-sheet-cell-url-dark.png`, `-cell-select-priority-dark.png`, `-cell-date-dark.png`, `-relation-new-dark.png`, `-object-properties-settings-dark.png`, `-filter-condition-text-dark.png` |
| **Stack a menu or popover** | An anchored surface opens over the parent; on desktop the parent is **undimmed**, on phone it is dimmed but never moves | **No** handle on the child | `anytype-mobile-sheet-view-edit-more-dark.png`, `-view-gallery-cardsize-dark.png`, `-object-more-submenu-dark.png` · `anytype-menu-set-filter-property-picker-dark.png`, `anytype-menu-set-filter-select-condition-dark.png`, `anytype-menu-object-more-advanced-dark.png` |

**The depth cap.** No capture in the 118-file set shows three stacked sheets. Where a third level is
needed, Anytype **replaces at the deepest level**: `anytype-mobile-sheet-relation-new-format-dark.png`
carries the same doubled handle as `-relation-new-dark.png` and no trace of the `New property` body,
so the format picker took its place rather than sitting on top of it; and
`anytype-mobile-sheet-filter-condition-operators-dark.png` does the same to the condition editor over
the still-present `Filters` parent.

**The header shape, which our builder does not have.** Every Anytype sheet header is **three slots
with the title centred**: a leading text action, the title, a trailing control.
`Clear | Priority (Project Tracker) | +` (`-cell-select-priority-dark.png`), `Edit | Sorts | +`
(`-view-sorts-dark.png`), `Edit | Create Object` (`-set-newobject-templates-dark.png`),
`Filters | +` (`-view-filters-empty-dark.png`), `Edit view | ···` (`-view-edit-dark.png`).
`createSheetHeader` (`mobile-bottom-sheet.ts:160-176`) builds two slots — a **leading** title, then
`beforeClose` controls, then the close. §6 C6.
<!-- /ANCHOR:moves -->

---

<!-- ANCHOR:pairs -->
## 4. THE PER-PAIR SUB-PAGE RULING (ADR-002)

ADR-002 is *"yes, where the capture shows it"*, judged **per pair**. All thirty-one registered pairs
in `tools/live/sheet-grammar.mjs:89-122` are below. **Two convert. Twenty-nine keep `048`'s
stacking**, which is the default and is what the captures show for them.

The rule the captures actually draw, stated once so each row can be short: **a value chosen from a
chevron row inside a configuration surface replaces that surface's body; everything opened from a
row that is not a chevron row — a picker with a search field, a menu, a date, a colour, an icon, a
modal — stacks.** A stack never reaches three sheets; the third level replaces the second.

### Converts to an in-place sub-page

| Pair | Why the capture says so |
|---|---|
| **`properties property type picker`** (`sheet-grammar.mjs:98`, `depth: 3`) | Our chain is view-config → the `Create property` modal → the type dropdown, three deep. Anytype's identical chain is `Add property` → `New property` → the format picker, and the format picker **replaces** `New property` rather than becoming a third layer: `anytype-mobile-sheet-relation-new-format-dark.png` carries the same doubled handle as `anytype-mobile-sheet-relation-new-dark.png` and none of `New property`'s Name/Format/Create body. The row it is reached from is a chevron row — `Format  URL ›`. Convert, and the depth-3 assertion in the pair's lane row becomes a replace assertion, red-first. |
| **`add view property picker`** (`sheet-grammar.mjs:114`) | A property chosen from a chevron row inside a view-config sheet. Anytype's exact analogue is `Image preview ›` inside the Gallery layout sub-page, and it replaces in place: `anytype-mobile-sheet-view-gallery-imagepreview-dark.png` sits at frame top **1261** / handle **1278**, the same pixels as `anytype-mobile-sheet-view-edit-dark.png` and `-view-layout-picker-dark.png`, with one handle and a swapped title. Convert. |

### Keeps `048`'s stacking

| Pair | Anytype equivalent | Read |
|---|---|---|
| `filter property picker` | `anytype-mobile-sheet-filter-relation-picker` (index); `anytype-menu-set-filter-property-picker-dark.png` | A search-and-list picker over an undimmed parent. **Stacks.** |
| `filter operator picker` | `anytype-mobile-sheet-filter-condition-operators-dark.png` | Replaces the **condition editor**, not the panel — a same-level swap inside the child, which is `053`'s row shape, not this packet's frame. **Stacks** here; the swap is recorded for `053`. |
| `filter select value picker` | `anytype-menu-set-filter-select-dark.png` | Its own 288px surface over the parent. **Stacks.** |
| `filter checkbox value picker` | `anytype-menu-set-filter-checkbox-condition-<theme>.png` (index) | Same family as the select editor; not opened. **Stacks**, by family. |
| `filter conjunction picker` | none — `Add advanced filter` was never opened | **Not seen.** Keeps `048`. |
| `filter date value picker` | `anytype-mobile-sheet-cell-date-dark.png`; `anytype-menu-set-filter-date-picker-<theme>.png` | A calendar as its own surface. **Stacks.** |
| `sort field picker` | `anytype-menu-set-sort-property-picker-<theme>.png` (index) | A picker over the `‹ Sort` sub-page. **Stacks.** |
| `sort direction picker` | `anytype-mobile-sheet-sort-direction-dark.png` | A child sheet with its own handle over the `Sorts` sheet. **Stacks.** |
| `properties create property` | `anytype-mobile-sheet-relation-new-dark.png` | Doubled handle over `Add property`. **Stacks.** |
| `properties column overflow menu` | `anytype-mobile-sheet-kanban-column-menu` (index) | A menu from a row. **Stacks.** |
| `settings dropdown field` | `anytype-mobile-sheet-view-gallery-cardsize-dark.png` | A handle-less popover over an undimmed parent. **Stacks.** |
| `settings ad hoc dropdown` | same file | **Stacks.** |
| `settings icon picker` | `anytype-mobile-sheet-icon-picker-dark.png` | Anytype reaches it from a menu that dismisses, so the parent is gone — not our shape. **Not seen** as a pair; keeps `048`. |
| `settings template file picker` | `anytype-mobile-sheet-set-newobject-templates-dark.png` | Templates live in a `Create Object` sheet, not a child of view settings. **Not seen** as a pair. |
| `settings cover image picker` | `anytype-mobile-sheet-cover-picker-dark.png` | Same as the icon picker. **Not seen** as a pair. |
| `record select value menu` | `anytype-mobile-sheet-cell-select-priority-dark.png` | Our pair exactly, seen: a child sheet over the record's property list, parent dimmed to **0.710**. **Stacks.** |
| `record date editor` | `anytype-mobile-sheet-cell-date-dark.png` | **Stacks.** |
| `record relation editor` | `anytype-mobile-sheet-cell-object-assignee` (index) | **Stacks.** |
| `record option colour picker` | `anytype-mobile-sheet-kanban-column-menu`'s `Column color` was not opened | **Not seen.** Keeps `048`. |
| `record column context menu` | `anytype-mobile-sheet-object-more-dark.png` | An anchored menu over the record. **Stacks.** |
| `record column submenu` (`depth: 3`) | `anytype-mobile-sheet-object-more-submenu-dark.png` | Menu-from-menu, and Anytype stacks it — the child repeats the parent row's label with a **chevron-down** as its collapse-back affordance. **Stacks**; the depth-3 note is §6 C4's, and its owner is `054`. |
| `all views overflow menu` | `anytype-mobile-sheet-view-edit-more-dark.png` | `Duplicate` / `Delete view` in red, handle-less, over the dimmed Edit view sheet. **Stacks.** |
| `confirm over a sheet` | none — no destructive confirm in any of the 118 iOS states or the 600 menu files; the desktop crawler refuses destructive actions by name | **Not seen. Design inferred from source, not seen.** Keeps `048`. |
| `import confirm dropdown chain` (`depth: 3`) | none | **Not seen.** Keeps `048`; §6 C4 applies. |
| `chart option dropdown` | `anytype-mobile-sheet-view-gallery-cardsize-dark.png` as the nearest shape | **Stacks.** |
| `calendar option dropdown` | iOS ships **no Calendar layout at all** (README, "Not reachable") | **Not seen.** Keeps `048`. |
| `timeline option dropdown` | no Anytype equivalent — there is no timeline | **Not seen.** Keeps `048`. |
| `group by dropdown` | `anytype-mobile-sheet-kanban-groupby` (index) | A picker sheet. **Stacks.** |
| `timeline event menu` | no equivalent | **Not seen.** Keeps `048`. |

That is 2 converts, 29 held — of which **10 are held because nothing equivalent was captured**
(`filter conjunction picker`, `settings icon picker`, `settings template file picker`,
`settings cover image picker`, `record option colour picker`, `confirm over a sheet`,
`import confirm dropdown chain`, `calendar option dropdown`, `timeline option dropdown`,
`timeline event menu`), and each of those ten carries the label rather than a guess.
<!-- /ANCHOR:pairs -->

---

<!-- ANCHOR:rows -->
## 5. THE CENSUS, ONE ROW EACH

Thirty-five rows: the **20** `extends DbModal` subclasses, the **3** `FuzzySuggestModal` subclasses
outside `DbModal`, and the **12** independent `createSheetHeader` sites (`goal.md` §3). Six cells per
row — surface → shell role → presentation → changes → Anytype pattern with its capture or its named
gap → stays ours — with the substantive reads written out under their group. **Seen** means an
equivalent Anytype surface was opened and read; **not seen** means no capture in any of the three
sets shows it, and the design is inferred from source.

### 5a. The twenty `DbModal` subclasses

| # | Surface (file:line) | Shell role | Presentation | Changes | Anytype pattern · capture | Stays ours |
|---|---|---|---|---|---|---|
| 1 | `ConfirmModal` (`modals/confirm-modal.ts:35`, `:42`) | `dialog` | modal / sheet | Becomes the exported confirm primitive (REQ-005); declared title; three-slot header | **Not seen.** No destructive confirm in the 118 iOS states or the 600 menu files; the desktop crawler refuses destructive actions by name (README, "Not captured"). Anytype's own destructive rows — `Delete` in `anytype-mobile-sheet-object-more-dark.png`, `Empty Bin` in `anytype-menu-nav-widget-bin-dark.png` — raise **no** confirm at all, because deletion is reversible into a Bin | The confirm itself. Our deletions are not reversible, so **Anytype's no-confirm posture is refused**, not adopted |
| 2 | `AddDatabaseModal` (`modals/add-database-modal.ts:29`, `:41`) | `panel` | modal / sheet | Declared title; header; geometry from the shell | **Seen.** `anytype-mobile-sheet-set-newobject-templates-dark.png` — header `Edit \| Create Object`, a grey section label, a horizontally scrolling type-chip row, a second label and a template gallery with a trailing `+` card | Our folder/name fields; Anytype creates from a type, not from a path |
| 3 | `CreatePropertyModal` (`modals/create-property-modal.ts:64`, `:76`) | `panel` | modal / sheet | Declared title; **the type picker converts to an in-place sub-page** (§4) | **Seen.** `anytype-mobile-sheet-relation-new-dark.png` — `New property`, a `Name` label over an editable value, a hairline, `Format  URL ›` as a chevron row, and a **full-width pill action** (`Create`) disabled until valid | Our format list is longer; the eleven-format set in `anytype-mobile-sheet-relation-add-dark.png` is Anytype's |
| 4 | `ColumnRenameModal` (`modals/column-rename-modal.ts:36`, `:43`) | `panel` | modal / sheet | Declared title; header; single-field body | **Seen, partially.** The `Name` label-over-field pattern in `anytype-mobile-sheet-relation-new-dark.png` and the 50pt `#3A3A3A` rounded input in `anytype-mobile-sheet-view-edit-dark.png` (device y 1515..1665) | A dedicated rename surface — Anytype renames inline |
| 5 | `StatusOptionsModal` (`modals/status-options-modal.ts:109`, `:125`) | `panel` | modal / sheet | Declared title; three-slot header (`Clear` leading, `+` trailing) | **Seen.** `anytype-mobile-sheet-cell-select-priority-dark.png` — `Clear \| Priority (Project Tracker) \| +`, a search field, option rows in their own colours, and the current one marked by a **filled blue circle with a white tick**, not by colour | Our colour editor; Anytype has no per-option colour picker on the phone |
| 6 | `StatusPresetManagerModal` (`modals/status-preset-manager-modal.ts:32`, `:44`) | `panel` | modal / sheet | Declared title; header | **Not seen.** Anytype has no status presets | All of it |
| 7 | `DeleteDatabaseModal` (`modals/delete-database-modal.ts:33`, `:42`) | `dialog` | modal / sheet | Routes through the confirm primitive | **Not seen** — destructive, refused by the crawler. The only evidence is the *styling* of a destructive row: red label **plus a trash icon**, a second signal beside the colour (`anytype-mobile-sheet-object-more-dark.png`, `anytype-mobile-sheet-view-edit-more-dark.png`) | The confirm; adopt the icon-beside-red pairing |
| 8 | `CsvMarkdownExportModal` (`modals/csv-markdown-export-modal.ts:22`) | `panel` | modal / sheet | **Declares no presentation today** — takes the `sheet` default silently; declares both after the leg | **Not seen.** Anytype's `Export` row (`anytype-menu-object-more-dark.png`) opens a surface the crawler did not enter | All of it |
| 9 | `CsvMarkdownImportModal` (`main.ts:2883`, `super(app)` at `:2892`) | `panel` | modal / sheet | **Declares no presentation today**; declares both | **Not seen** | All of it |
| 10 | `BaseImportConfirmModal` (`modals/base-import-confirm-modal.ts:47`, `:67`) | `dialog` | modal / sheet | Declared title; routes its confirm through the primitive | **Not seen** | All of it |
| 11 | `RelationRollupConfigModal` (`modals/relation-rollup-config-modal.ts:32`, `:43`) | `panel` | modal / sheet | Declared title; header | **Not seen.** Anytype ships no rollups (`050` D6) | All of it |
| 12 | `CreateRecordIconFieldModal` (`modals/create-record-icon-field-modal.ts:23`, `:28`) | `panel` | modal / sheet | Declared title; header | **Seen.** `anytype-mobile-sheet-icon-picker-dark.png` — a near-full-height sheet (top edge **62pt**), centred title `Change icon`, a search field in a header block closed by a hairline, the grid, and a **bottom tab bar** `Emoji / Random / Upload` with the active tab in white. Desktop puts the same tabs at the **top**: `anytype-menu-object-icon-picker-dark.png` | Our field-creation step |
| 13 | `CreateLinkedViewModal` (`modals/create-linked-view-modal.ts:34`, `:46`) | `panel` | modal / sheet | Declared title; header | **Seen, partially.** `anytype-mobile-sheet-set-viewswitcher-edit` and `anytype-mobile-sheet-view-edit-dark.png` — a view is created from the view list and edited in a sheet whose rows are `Layout / Properties / Filters / Sorts`, each `label … value ›` | Linked views are ours |
| 14 | `ComputedFrontmatterCleanupModal` (`modals/computed-frontmatter-cleanup-modal.ts:25`, `:34`) | `dialog` | modal / sheet | Declared title; confirm through the primitive | **Not seen** | All of it |
| 15 | `TrashManagerModal` (`settings.ts:581`, `:587`) | `panel` | modal / sheet | Declared title; header | **Seen, partially.** `anytype-menu-nav-widget-bin-dark.png` — `Open`, `Empty Bin`, a divider, `Hide section`, `Manage Sections`. `Empty Bin` is destructive, **not red and not confirmed** | Our restore-per-item list |
| 16 | the anonymous restore modal (`settings.ts:670`) | `dialog` | modal / sheet | **Declares no presentation today**; gets a declared title and routes its buttons through the confirm primitive | **Not seen** | All of it |
| 17 | `FormulaModal` (`modals/formula-modal.ts:176`, `:217`) | `workbench` | **`fullscreen`, kept** | Declared title only. **ADR-004 (Accepted): fullscreen survives here and nowhere else** | **Not seen.** Anytype has no formulas, and iOS has no equivalent workbench of any kind | All of it, `fullscreen`, untouched — `spec.md` §3 |
| 18 | `ChartDrilldownModal` (`chart-renderer.ts:970`, `:972`) | `panel` | **`fullscreen` → modal / sheet** (ADR-004) | Presentation change; declared title; header | **Not seen.** No charts in Anytype | All of it |
| 19 | `InvalidTimeEventsModal` (`modals/invalid-time-events-modal.ts:66`, `:78`) | `panel` | **`fullscreen` → modal / sheet** (ADR-004) | Presentation change; declared title; header. Its footer action bar (`Cancel` / `Save changes`) is **ours** and has no Anytype analogue — Anytype commits with a single full-width row (`Apply` in `anytype-mobile-sheet-filter-condition-text-dark.png`, `Create` in `-relation-new-dark.png`) or with no commit control at all | **Not seen.** Our own render is `screenshots/notion-clone/components/panel-invalid-events-modal-mobile-dark.png` | The footer bar, the per-row Fix, the selection count |
| 20 | `PropertyTypeConflictModal` (`modals/property-type-conflict-modal.ts:78`, `:90`) | `dialog` | **`fullscreen` → modal / sheet** (ADR-004) | Presentation change; declared title; confirm through the primitive | **Seen, partially.** `anytype-mobile-sheet-relation-new-format-dark.png` is the format list with the current format ticked — the vocabulary, not the conflict. Anytype has no format-conflict surface | The conflict resolution |

**Where this group actually changes.** Sixteen of the twenty gain nothing but a declared title, a
declared role and the shell's header — which is the point of the packet, not a shortfall. The four
that change behaviour are 3 (its type picker converts to a sub-page), 17-20 (the ADR-004
dispositions), and 1/7/10/14/16/20 (every confirm path collapsing onto one primitive).

### 5b. The three `FuzzySuggestModal` subclasses outside `DbModal`

`spec.md` §11's second open question — join the shell or stay Obsidian-native behind a shim — is
**still open**, and the captures do not answer it, because Anytype has no Obsidian to be native to.
What they do answer is what the surface should look like once it is inside the shell.

| # | Surface | Shell role | Presentation | Changes | Anytype pattern · capture | Stays ours |
|---|---|---|---|---|---|---|
| 21 | `BaseFileSuggestModal` (`main.ts:3021`, chrome at `:3047`) | `panel` | modal / sheet | One chrome-deciding site removed or dispositioned; declared title | **Seen, and it disagrees with us.** `anytype-mobile-sheet-search-dark.png` is not a sheet at all: a **full-screen** surface with the search field docked at the **bottom** above the keyboard, a horizontally scrolling filter-chip row directly above it, results filling **upward**, and an `×` to clear. No header, no title | Obsidian's fuzzy matcher and its top-anchored field. Adopting a bottom-anchored field is a `053`-scale change and is **recorded, not taken**, here |
| 22 | `ImageFileSuggestModal` (`views/image-file-suggest-modal.ts:25`, chrome at `:40`) | `panel` | modal / sheet | Same | **Seen.** `anytype-mobile-sheet-cover-picker-dark.png` — `Change cover`, grey section labels (`Gradients`, `Solid colors`), a two-column tile grid, and a bottom tab bar `Gallery / Unsplash / Upload`. Desktop: `anytype-menu-object-cover-picker-<theme>.png` | Vault files as the source; we have no Unsplash and no gradients |
| 23 | `MarkdownFileSuggestModal` (`views/markdown-file-suggest-modal.ts:19`, chrome at `:34`) | `panel` | modal / sheet | Same | **Seen.** `anytype-mobile-sheet-set-newobject-templates-dark.png` — templates as a horizontally scrolling **card gallery** with a trailing `+`, under a `Template` section label, not as a list of file names | Markdown files as templates |

### 5c. The twelve independent `createSheetHeader` sites

| # | Site | Shell role | Presentation | Changes | Anytype pattern · capture | Stays ours |
|---|---|---|---|---|---|---|
| 24 | `cell-renderer.ts:952` | `panel` | sheet (phone only today) | Header from the shell; **three-slot** header with a leading `Clear` | **Seen, thirteen times.** One `anytype-mobile-sheet-cell-*` per format. Every one carries `Clear \| <property name> \| <optional action>`, its own grab handle, and stacks over the record's property sheet with the parent dimmed to **0.710**. `-cell-url-dark.png` adds action rows (`Open link`, `Copy link`) below a divider; `-cell-date-dark.png` is a month grid with a filled-blue selected day plus `Today` / `Tomorrow` / `Open selected date ›`; `-cell-text-longtext-dark.png` wraps its title onto two lines and grows the header | The editors themselves — `054`'s |
| 25 | `toolbar-renderer.ts:1384` | `panel` | modal / sheet | Header from the shell | **Seen.** `anytype-mobile-sheet-view-settings-gallery` and `anytype-mobile-sheet-set-more-dark.png` — the toolbar's sliders icon opens Edit view directly; the `···` opens an anchored menu, not a sheet | The toolbar itself — `053`'s |
| 26 | `owned-menu.ts:218` | `menu` | sheet | Header from the shell; **`044`'s 44px close added** — our own capture has none | **Seen, and it contradicts `044`.** `anytype-mobile-sheet-object-more-dark.png` is an **anchored menu**, not a bottom sheet: a rounded card hanging from the `···`, a top row of three icon-over-label tiles (`Properties` / `Icon` / `Cover`), then divided sections, `More ›`, and `Delete` in red with a trash icon. No header, no title, no close. Ours: `screenshots/notion-clone/components/chrome-owned-menu-sheet-mobile-dark.png` — a bottom sheet with a small leading grey `Column` title and **no close** | The bottom-sheet presentation and the 44px close — §6 C2 |
| 27 | `date-value-picker.ts:410` | `menu` | sheet | Header from the shell | **Seen.** `anytype-mobile-sheet-cell-date-dark.png`, `-cell-date-monthpicker` (the month/year wheel); desktop `anytype-menu-set-filter-date-picker-<theme>.png` and `-date-relative-` (an Exact/Relative tab pair we do not have) | Our relative-date vocabulary |
| 28 | `mobile-bottom-sheet.ts:241` | — (the engine) | — | **The expected survivor.** This is the shell's own call once `attachSheetChromeToModal` is reached only from the shell | n/a — engine code, not a surface | The engine, per ADR-001 |
| 29 | `sort-panel-renderer.ts:113` | `condition panel` | modal / sheet | Header from the shell; three-slot header | **Seen.** `anytype-mobile-sheet-view-sorts-dark.png` — `Edit \| Sorts \| +`; rows are an icon tile + two lines (property over direction) + a trailing chevron, and the divider **aligns to the text column** past the tile. Desktop `anytype-menu-set-view-sort-dark.png` is the `‹ Sort` sub-page with a drag grip, a property chip and a direction button per row | The 440-560px `condition panel` width — `design-system.md` §5 |
| 30 | `icon-picker-popover.ts:102` | `menu` | sheet | Header from the shell | **Seen.** `anytype-mobile-sheet-icon-picker-dark.png` (row 12) | Ours |
| 31 | `dropdown-field.ts:199` | `menu` | sheet | Header from the shell | **Seen.** `anytype-mobile-sheet-view-gallery-cardsize-dark.png` — a two-row popover (`Small` / `Large`) over an **undimmed** parent, with **no grab handle**, which is the affordance that distinguishes it from a stacked sheet (§3) | Ours — `052`'s rows |
| 32 | `option-color-picker.ts:67` | `menu` | sheet | Header from the shell | **Not seen.** `anytype-mobile-sheet-kanban-column-menu`'s `Column color` row exists in the index and was not opened; `anytype-menu-object-block-menu-color-<theme>.png` is a block colour menu, a different surface | Ours |
| 33 | `filter-panel-renderer.ts:259` | `condition panel` | modal / sheet | Header from the shell; three-slot header (`Filters \| +`); a **centred single-line empty slot** | **Seen.** `anytype-mobile-sheet-view-filters-empty-dark.png` — full-height sheet, centred title, a **circular `+` in the trailing slot**, and one centred grey sentence as the whole empty state. `-filter-condition-text-dark.png` is the condition editor: a rounded format tile, the property name over an operator control, a `Value` field with a blue caret, and a full-width `Apply` row, disabled while empty | The condition row shape and its 140/140/120px floors — `design-system.md` §5 |
| 34 | `view-config-panel-renderer.ts:351` | `panel` | modal / sheet | Header from the shell; **the sub-page host** — this is the surface REQ-003 is written for | **Seen, and this is the anchor row.** Desktop `anytype-menu-set-view-settings-dark.png` (360 × 316, `View name` box, `Layout / Properties` then a divider, `Filter / Sort` then a divider, `Duplicate view / Remove view`) with `‹ Layout`, `‹ Filter`, `‹ Sort`, `‹ Properties` as in-place sub-pages. Phone `anytype-mobile-sheet-view-edit-dark.png` (`Edit view \| ···`, `Layout Grid ›`, `Properties 27 applied ›`, `Filters No filters ›`, `Sorts 2 applied ›`) with `-view-layout-picker-dark.png` and `-view-gallery-imagepreview-dark.png` replacing in place at an unmoved edge | Our per-view options |
| 35 | `column-manager-renderer.ts:180` | `condition panel` | modal / sheet | Header from the shell | **Seen.** `anytype-mobile-sheet-object-properties-settings-dark.png` — a contextual notice bar under the header (`You're editing type … Project Tracker`), grey section labels (`Header`, `Properties panel` with a trailing `+`), rows of icon + label + **trailing drag grip**. Desktop `anytype-menu-set-view-properties-dark.png` is the same list as `‹ Properties` with a **toggle** per row and `+ Add Property` below a divider | The width; our column vocabulary |

**The `N applied` value column, confirmed on the phone.** `050` REQ-001 adopted it off the desktop
panel. `anytype-mobile-sheet-view-edit-dark.png` carries it on all four rows, including the empty
case (`No filters`) — so the pattern is "always a value, never a blank", which is what makes the
row's chevron worth tapping. Its empty-case grey is the one rejected in §2b.
<!-- /ANCHOR:rows -->

---

<!-- ANCHOR:contradictions -->
## 6. WHERE THE CAPTURE CONTRADICTS THE PACKET

Nine, each named with the file that shows it. The rule for this task is **capture wins**; two of the
nine are resolved against the capture, and each of those two says why in a number rather than a
preference.

| # | The packet says | The captures show | Resolution |
|---|---|---|---|
| **C1** | A sub-page replaces in place and the parent's bounding box moves by `\|Δ\| ≤ 1px` (`AC-003`, `NFR-P02`, `plan.md` §3) | **Phone: exact.** `anytype-mobile-sheet-view-edit-dark.png`, `-view-layout-picker-dark.png`, `-view-gallery-imagepreview-dark.png` all sit at frame top **1261** / handle **1278**. **Desktop: false.** `anytype-menu-set-view-settings-dark.png` 360 × **316** → `-view-layout-` 360 × **298** → `-view-filter-` 360 × **90** → `-view-sort-` 360 × **166** → `-view-properties-` 360 × **390** | **Capture wins.** The tolerance splits: **width and the anchored edge hold to `\|Δ\| ≤ 1px` on both platforms; the cross-axis extent is content-driven on desktop and fixed on phone.** `AC-003` and `NFR-P02` are rewritten to that shape — a threshold whose failing value is stated wrongly cannot be observed red (`SC-004`) |
| **C2** | `044` REQ-007, amended by the operator: *"header everywhere"* — every phone sheet gets a title row with a **44px close**, no title-less variant | **No Anytype iOS sheet has a close control.** `-view-edit-`, `-object-more-`, `-icon-picker-`, `-cover-picker-`, `-cell-url-`, `-view-sorts-`, `-view-filters-empty-`: title, sometimes a leading and a trailing action, never an `×`. Dismissal is the grab handle and the scrim | **Capture loses, on a measured accessibility reason.** The handle it substitutes measures `#555555` on `#1F1F1F` = **2.21:1**, below WCAG 1.4.11's 3:1 for the only non-text element identifying the dismissal control. `044`'s 44px close stands. This is a deliberate divergence with a number behind it, not unnoticed drift — and our own `chrome-owned-menu-sheet-mobile-dark.png` shows the close is **not landed yet** on `owned-menu`, so row 26 is a `044` conformance gap the shell closes |
| **C3** | `design-system.md` §7: *"There is no sheet scrim … A scrim is new construction"* | Two scrim levels, measured. Page under a first sheet: **0.519** of undimmed luminance (0.519 / 0.520 / 0.505 across three bands) ≈ **48% black**. Parent sheet under a stacked child: **0.710** (three bands, all 0.710) ≈ **29% black**. Files: `-view-edit-` vs `anytype-mobile-set-grid-dark.png`; `-cell-url-` vs `-object-properties-` | **Capture wins.** The design system is right that we have none; it now has the two values to build one with. Recorded here, owned by `048`'s model — this packet consumes it |
| **C4** | `048` registers three pairs at `depth: 3` — `properties property type picker` (`sheet-grammar.mjs:98`), `record column submenu` (`:113`), `import confirm dropdown chain` (`:117`) | **Anytype never stacks a third sheet.** `-relation-new-format-dark.png` replaces `New property`; `-filter-condition-operators-dark.png` replaces the condition editor. No file in the 118 shows three | **Capture wins for one, is routed for two.** `properties property type picker` converts (§4). `record column submenu` is menu-from-menu, which Anytype does stack, and `import confirm dropdown chain` has no equivalent — both keep `048` and the depth question goes to `054` rather than being answered here |
| **C5** | Our sheet docks flush: `chrome-owned-menu-sheet-mobile-dark.png` spans x 0..803 of an 804px capture, radius on the top corners only | Anytype's sheet **floats**: x **8..394pt** of a 402pt screen, bottom edge at **865.7pt** of 874 — an **8pt inset on three sides** — with a **≈16pt** radius | **Capture wins**, and it is the one geometry change with a real regression surface: every `sheet-grammar` selector that measures a sheet's rect moves by 8pt. It lands under REQ-006 as a named value, in the leg that updates the lane rows, never before |
| **C6** | `createSheetHeader` (`mobile-bottom-sheet.ts:160-176`) builds **two slots**: a leading title, `beforeClose` controls, then the close | Every Anytype sheet header is **three slots with the title centred** — `Clear \| Priority (Project Tracker) \| +`, `Edit \| Sorts \| +`, `Edit \| Create Object`, `Filters \| +`, `Edit view \| ···` | **Capture wins.** The header gains a **leading action slot** and centres the title; `044`'s close keeps the trailing edge, so a surface's own trailing control sits beside it. Files: `-cell-select-priority-`, `-view-sorts-`, `-set-newobject-templates-`, `-view-filters-empty-`, `-view-edit-` |
| **C7** | `050` C6, off the desktop: *"the add affordance alone; no message, no illustration, no card"* | The **iOS client does ship a message**: `anytype-mobile-sheet-view-filters-empty-dark.png` renders one centred grey sentence, `No filters here. You can add some`, with the `+` in the header and nothing else | **Both captures win, on their own platform.** The shell owns a **centred single-line empty slot**; whether it carries copy is `055`'s, and `050` C6 is not overturned — it was read off a different client |
| **C8** | — (no packet claim) | Anytype's divider inset has **three answers**: symmetric 20pt (`-view-edit-`, x 82..1123 of a 24..1181 sheet), aligned to the text column past the leading icon (`-view-sorts-`), and full-bleed (`-object-properties-settings-`) | **The capture does not win, because it has no single answer.** We keep ours — `chrome-owned-menu-sheet-mobile-dark.png` already aligns row dividers to the text column and section dividers full-bleed — and record the reference's drift so nobody re-reads it as a rule |
| **C9** | — (no packet claim) | The `N applied` value column `050` REQ-001 adopted is on the phone too, on all four rows including the empty one, and its empty-case grey `#7B7B7B` measures **3.89:1** while its applied-case grey `#909090` measures **5.16:1** (`-view-edit-`) | **Capture wins on the pattern, loses on the colour.** Adopt "always a value, never a blank"; use **one** secondary grey clearing 4.5:1 for both cases |
<!-- /ANCHOR:contradictions -->

---

<!-- ANCHOR:changes -->
## 7. WHAT THIS CHANGES IN THE PACKET

Six changes, each traceable to a row above. Nothing here alters scope: every one lands inside an
existing requirement.

| Where | Was | Is |
|---|---|---|
| `spec.md` REQ-003, `NFR-P02`, `AC-003` | "the parent's bounding box moves by `\|Δ\| ≤ 1px`" | Width and the anchored edge hold to `\|Δ\| ≤ 1px`; the cross-axis extent is content-driven on desktop and fixed on phone (C1) |
| `spec.md` REQ-003 | Two moves — replace in place, or a picker over an undimmed parent | **Three** moves, each with its own affordance: replace (one handle, unmoved edge), stack a sheet (two handles, parent dimmed to 0.710), stack a menu (no handle, parent undimmed on desktop) (§3) |
| `spec.md` REQ-006 | 8px radius, 16/8px padding, 8px divider clearance, 28px rows, 360px `panel`, 44px phone close | Unchanged, **and re-confirmed off a second capture set**; plus the phone frame: **8pt inset on three sides, ≈16pt radius, 34 × 5pt handle, 50pt rows, ≈70pt header** (C5, §2b) |
| `spec.md` REQ-001 / the shell's header | `createSheetHeader`'s two slots | Three slots, title centred, close on the trailing edge (C6) |
| `decision-record.md` ADR-002 | "per pair, where the capture shows it" — no list | The list: **2 convert, 29 keep `048`**, 10 of those held because nothing equivalent was captured (§4) |
| `tasks.md` T001 | Build `modal-surface-inventory.md` | **This document is that inventory.** The filename changed and nothing else did |

**What T001 does not close.** `spec.md` §11's second open question — whether the three
`FuzzySuggestModal` subclasses join the shell or stay Obsidian-native behind a shim — is untouched by
the captures, because Anytype has no host application to be native to. It stays open and T010 stays
blocked on it.

**Nine rows say "not seen" and mean it.** Rows 6, 8, 9, 10, 11, 14, 16, 18, 19 have no equivalent in
any of the three capture sets, and row 1 — the confirm, which is `AC-005`'s whole subject — has none
either: no destructive confirm appears in the 118 iOS states or the 600 menu files, and the desktop
crawler refuses destructive actions by name. `AC-009`'s label, **design inferred from source code,
not seen**, applies to all ten and is not softened anywhere in this document.
<!-- /ANCHOR:changes -->

---

## RELATED DOCUMENTS

- **Feature Specification**: See `spec.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md` (this is T001's output)
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decision Record**: See `decision-record.md` (ADR-002's per-pair list is §4)
- **The 050 design read**: See `../050-anytype-adoption/design-trueup.md`
- **Capture index**: See `screenshots/anytype/README.md`
- **Sheet grammar**: See `../044-phone-sheet-alignment/spec.md` §3
- **Stacking model**: See `../048-stacked-sheets/spec.md` §4
- **Surface contract**: See `../design-system.md` §5, §7
