---
title: "Design Review: The 0.0.38 Sheet Wave Against sk-design-fundamentals"
description: "A fundamentals-lens second read of the nine 2026-09-09/10 sheet landings (071/005, /007-/014) — hierarchy, spacing, color/contrast, depth, interaction craft, motion and the UX laws, cited by file and reference, not by taste."
trigger_phrases:
  - "sheet design review"
  - "071 design fundamentals review"
  - "sk-design-fundamentals sheet audit"
importance_tier: "important"
contextType: "research"
---
<!-- SPECKIT_TEMPLATE_SOURCE: research-note | v2.2 -->
# Design Review: The 0.0.38 Sheet Wave Against sk-design-fundamentals

**Opened by**, verbatim (operator, 2026-09-10): *"double check all sheet work, use sonnet 5xhigh
through claude2 and give them the sk-design-fundamentals skill and check it based on those design
fundamentals"*.

**Lens.** `.opencode/skills/sk-design/sk-design-fundamentals/SKILL.md`, loaded fully, plus every
reference it routes to: `hierarchy.md`, `color-system.md`, `depth-and-detail.md`,
`interaction-craft.md`, `motion-principles.md`, `ux-laws.md`, `review-checklist.md`,
`diagnosis-table.md`. Every finding below names the file and the principle it violates, plus the
evidence — a capture path opened and looked at, a measured CSS/token value, or a source line — never
taste alone, per `review-checklist.md` §7.1.

**What this review is not.** It does not re-litigate `sheet-notion-audit.md`'s own P1-P3 findings —
those seven children (`008`-`014`) closed them and the lane proves the numbers. This review reads
the *result* of that work through a different, general-purpose lens (weight/color hierarchy, the
color-ramp math, touch-target floors, motion bands, Fitts/Hick/Miller) that the Notion-parity audit
never applied, and reports what it finds — new defects, confirmed-good convergences, and the places
the two lenses agree.

---

## 0. METHOD AND SCOPE

| Source | Use |
|---|---|
| `node tools/live/sheet-grammar.mjs` (rerun this session, exit 0, full output kept at `/tmp/sheet-grammar-out.txt`) | Row counts, pitches, insets, spans, order facts — the numbers this review cites are read from this run, not assumed |
| `node tools/live/touch-targets.mjs` (rerun this session, exit 0) | The fixture/constructed touch-target census: 28px floor enforced, 44px band reported not enforced |
| `screenshots/notion-clone/**/*mobile*.png` | Opened and looked at, light and dark, per `repo-rules/screenshot-currency.md` — the specific paths are cited per finding |
| `src/views/*.ts`, `styles.css` | Read directly for every finding below; no finding is filed from a screenshot alone without a source-level check of the mechanism |
| Nine landed SHAs | Verified with `git log -1` before this review opened: `e9f62e41`, `8bd38d77`, `64af87ee`, `4f345718`, `41b9619f`, `6b6f6418`, `5afe61e2`, `b7fa33aa`, `8f11b642` — all confirmed present on `main` at the stated dates |

**Coverage gap, stated up front.** The toolbar's Group-by sheet (`toolbar-renderer.ts:1829`,
redesigned by `012`) has **no dedicated screenshot scenario** — `tools/screenshots/scenarios*.mjs`
defines none, and `001/inventory.md` line 46 records its own capture list as borrowed from
unrelated toolbar surfaces (`add-view-popover`, `chrome-toolbar`, `+5 more`), none of which is the
group sheet itself. The lane's live numbers for it (17/17 rows 44.0px, 3 section headings, 2 bulk
actions) are trusted; **its visual read is not attempted here** and is recorded as §5's F-7 rather
than guessed, per `screenshot-currency.md` and `repo-rules/uncertainty-and-honesty.md`.

Priorities follow the audit's own scale: **P1** visibly wrong / breaks a named fundamental, **P2**
clearly weaker than the fundamental asks, **P3** polish.

---

## 1. SETTINGS / VIEW-CONFIG SHEET (`007`, `view-config-panel-renderer.ts`)

**Captures reviewed**: `screenshots/notion-clone/panels/panel-view-config-sheet-mobile-light.png`,
`panel-view-config-sheet-mobile-dark.png`.

### Checklist verdict

| Fundamental | Verdict | Note |
|---|---|---|
| Hierarchy | Pass | `CURRENT DATABASE` / `CURRENT VIEW` all-caps section labels, body text at the base step, one accent color (blue) for the active segmented choice — three tiers hold |
| Spacing rhythm | Pass | Rows read at the lane's declared 44-52px pitch; group spacing (between sections) exceeds within-group spacing |
| Type scale | Pass | No off-scale sizes found in the capture |
| Depth and detail (card grouping) | **P1** | See F-1 below |
| Color and contrast, both themes | **P1** | See F-1 below (same root cause) |
| Interaction craft / touch targets | Pass | Text inputs, segmented buttons and the dropdown row all read ≥44px in the lane |
| Motion | Not assessable from a static capture; the sheet's own entrance/exit tokens are covered once in §7 (shared by every sheet) | — |
| UX laws | Pass | Progressive disclosure (formula-storage sub-choice), Hick's Law (one active database vs. one active view, not both flattened into one list) |

### F-1 — P1 — The 007 card-grouping fill is darker than its own canvas in dark mode, inverting the dark-mode elevation rule, and is only a ~5% step in light mode with no border

**Fundamental**: `color-system.md` §7, Dark Mode — *"Never use pure black as the surface. Use
something around `grey-900`, and build elevation by getting **lighter**, not darker... Surfaces
stack upward in lightness... Do not invert the ramp mechanically."* Also `ux-laws.md` §5, Common
Region — *"A shared boundary... groups whatever is inside it"* — which requires the boundary to be
perceptible.

**Evidence.** `styles.css:12363-12367` sets the settings card's fill to `--background-primary` on
the sheet's own `--obnotion-surface-overlay` canvas (comment at `12356-12362` confirms this is
deliberate, "provisional pending the operator's reference capture"). The two tokens compute as
follows, read directly from the definitions:

- **Light theme** (`styles.css:102-106`, default block; `tools/screenshots/theme.css:11`
  `--background-primary: #ffffff`): canvas = `color-mix(in srgb, #ffffff 95%, black)` ≈
  `rgb(242,242,242)`; card = `#ffffff`. Gap: **13/255 (~5%)**, card lighter — this is the correct
  *direction* (a lighter card pops forward on a greyer canvas, per `depth-and-detail.md` §4,
  "Color: lighter feels closer"), but with no border and only a 5% step it is a weak cue: the
  capture (`panel-view-config-sheet-mobile-light.png`) shows no perceptible boundary between the
  `CURRENT DATABASE` block and the `CURRENT VIEW` block — the two read as one flat surface.
- **Dark theme** (`styles.css:1014-1029`, the `.theme-dark :is(...)` override;
  `tools/screenshots/theme.css:129` `--background-primary: #1e1e1e`): canvas =
  `color-mix(in srgb, #1e1e1e 93%, white)` ≈ `rgb(46,46,46)` (0.180 normalized — matches the lane's
  own printed card-grouping measurement, `color(srgb 0.179412 0.179412 0.179412)`, confirming this
  is the live-rendered canvas value); card = `#1e1e1e` ≈ `rgb(30,30,30)` (0.118 normalized). **The
  card is darker than its own canvas by 16/255 (~6%), the wrong direction** — it reads as a
  recessed well, not a raised card, in a theme whose own convention (stated in the stylesheet's own
  comment two lines above the rule that gets it backwards) is "elevation = lighter."
- The app's own elevation ladder confirms the token choice, not just the arithmetic: in dark theme
  `--obnotion-surface-raised` ≈ 36.75/255, `--obnotion-surface-overlay` ≈ 45.75/255,
  `--obnotion-surface-modal` ≈ 57/255 — an ascending ladder where `--background-primary` (30/255,
  the *page*, the floor of the ladder) sits **below every rung**, including the "raised" one. Using
  it for a card that needs to read as lifted *above* the sheet's own overlay canvas is a token
  category error, not a tuning choice.

**Why one theme masked the other.** The same substitution (`--background-primary` for the card)
happens to work in light mode only because light and dark themes encode "more elevated" in opposite
lightness directions (`color-system.md` §7's warning, verified in production code). A reviewer or a
lane check that samples only one theme's card/canvas delta — which is what the `007` lane clause
does, per its own printed single value — cannot see this; it needs both.

**Fix**: use a token that sits *above* `--obnotion-surface-overlay` in **both** themes' own ladders
— `--obnotion-surface-modal` is already lighter than overlay in dark mode (57 > 46) and only 5
points darker than overlay in light mode (237 vs 242, the same order of magnitude as the current
gap), or add a dedicated `--obnotion-settings-card-fill` token defined per-theme so the direction is
chosen explicitly rather than inherited from a token named for an unrelated role. Either way, the
choice should be re-verified against a live dark-mode render (not just the arithmetic here) before
locking in a number, because `007`'s own metrics are already flagged provisional.

**GLM task**: appended to `007-settings-sheet-strict-alignment/tasks.md`.

---

## 2. ADD-PROPERTY / EDIT-PROPERTY / PROPERTY-TYPE PICKER (`003`, `database-view.ts`, `property-type-icon.ts`)

**Captures reviewed**: `screenshots/notion-clone/panels/constructed-depth3-property-type-picker-mobile-{light,dark}.png`.

| Fundamental | Verdict |
|---|---|
| Hierarchy | Pass — focus ring + checkmark on the current option is a clean single-signal-plus-redundancy pairing (`SKILL.md` §4 ALWAYS-5) |
| Spacing/type/depth | Pass — hairline dividers, consistent 44px pitch, no off-scale type |
| Interaction craft | Pass — visible focus ring is `box-shadow`-shaped (rounded, matches the row), not a squared-off `outline` |
| Motion, UX laws | Not assessable statically / Pass (Hick's Law: one column of options, not a grid forcing a two-axis scan) |

No P1/P2 found here. This surface converges cleanly.

---

## 3. PROPERTIES SHEET (`009`, `column-manager-renderer.ts`)

**Captures reviewed**: `screenshots/notion-clone/panels/constructed-column-manager-mobile-{light,dark}.png`.

### Checklist verdict

| Fundamental | Verdict |
|---|---|
| Hierarchy | Pass — `SHOWN`/`HIDDEN` labels, right-aligned bulk actions, one accent (blue) for the checkbox state |
| Spacing rhythm | Pass at the section level; **P2 at the row level**, see F-2 |
| Type scale | Pass |
| Color/contrast | Pass — checkbox blue on both themes reads well above 3:1 non-text minimum by eye; not independently re-measured this pass |
| Interaction craft / touch targets | **P2**, see F-2 |
| UX laws | Pass — Miller's Law: a 16-row list stays scannable because every row shares one format (icon, label), not because it is short |

### F-2 — P2 — Row pitch stays 34px, below the 44px thumb floor every sibling panel sheet now meets

**Fundamental**: `interaction-craft.md` §3 — *"Minimum target size... Use 44px for anything a thumb
operates."* WCAG 2.5.5 (cited in `review-checklist.md` §3).

**Evidence.** The lane's own printed row heights for this surface: `34, 34, 34, 34, 34, 34, 34, 34,
34, 34, 34, 34, 34, 34, 34, 34` (16/16 rows), each carrying 3 interactive controls (↑, ↓, checkbox).
Every other panel sheet this wave touched — filter (48px), sort (44-48px), group (44px), record
(44px) — now converges on the 44-52px band the audit's own row-grammar clause asserts. The
Properties sheet is the one family left outside it.

**Status**: this is a known, already-recorded deviation, not a new discovery — `009`'s own
`implementation-summary.md` §Known Limitations states *"The row heights stay 34px... recorded, not
changed: the density is the reader's own preference (the lane's standing ruling)."* Re-flagging it
here because the operator's ruling asks specifically for a fundamentals check, and 34px against a
5-control-dense row (3 interactive) is exactly the case `interaction-craft.md` names, not a
borderline one. **Not filed as a new task** — reopening a row height the project has already ruled
on by name would contradict a landed decision rather than add to it. Recorded as a Proposed ADR in
`roadmap.md` §7 instead (ADR-D, below), so the operator can affirm or reverse the standing ruling
with this fundamental in view.

No P1 found on this sheet. The Shown/Hidden partition, the key-free labels and the two-button add
row read as clean, converged work — a genuine improvement over the pre-009 flat, six-control,
bracket-suffixed list (`git show 4f345718^:screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png`
is the "before" — not opened byte-for-byte this pass, but the row-count/control-count deltas in
`009`'s own RED→GREEN numbers, 6→3 controls and 0→16 key-free labels, are independently confirmed
live by this session's lane rerun).

---

## 4. RECORD SHEET, RECORD PEEK (`011`, `record-detail-panel.ts`, `card-field-renderer.ts`, `property-type-icon.ts`)

**Captures reviewed**: `screenshots/notion-clone/panels/constructed-record-detail-mobile-{light,dark}.png`.

### Checklist verdict

| Fundamental | Verdict |
|---|---|
| Hierarchy | Pass — title now centres (0.49px off-center, lane-confirmed); label/value two-color tier holds |
| Spacing rhythm | Pass — 44.0px pitch, 20/20 hairlines |
| Type scale | **P2**, see F-3 |
| Depth/detail | **P2**, see F-3 (typography detail, not depth) |
| Interaction craft | Pass — 44px rows, no native selects |
| UX laws | Pass — type icons are the redundant-signal `SKILL.md` §4 ALWAYS-5 asks for, alongside the label text |

### F-3 — P2 — The per-row type icon renders glued to the label with no gap, reading as a stray character rather than an icon

**Fundamental**: `depth-and-detail.md` §5, Typography Detail (letter-spacing / legibility); the
general spacing discipline in `SKILL.md` §4 ALWAYS-2 ("more space around a group than within it"
extends to any two adjacent glyphs that are supposed to read as separate).

**Evidence, mechanism confirmed at the source, not guessed from the pixel.**

1. `card-field-renderer.ts:109-110`:
   ```ts
   const label = field.createSpan({ cls: labelClass, text: col.label });
   options.renderLabelTypeIcon?.(label);
   ```
   The label's text is set first (`text: col.label`, a single text node), then the icon callback
   runs **against the same element**.
2. `record-detail-panel.ts:589`: `renderLabelTypeIcon: (label) => renderPropertyTypeIcon(label, col, "obnotion-record-detail-field-type-icon")`.
3. `property-type-icon.ts:241`: `const icon = parent.createSpan({ cls });` — Obsidian's `createSpan`
   **appends**, so the icon span lands *after* the existing text node, with nothing between them.
4. `styles.css:11329-11344` gives the icon `margin-right: 4px` — spacing on the icon's *trailing*
   edge, which is now the row's dead space (nothing sits to the icon's right inside the label box).
   There is no `margin-left`, so the leading edge — the one actually touching the label text — has
   zero gap.

**Result, visible in both captures**: `month` + a `123` glyph read as one run ("month¹²³"),
`sort_key` glued to a calendar glyph, `Priority` to a circle glyph, and so on for all 21 rows.

**Cross-sheet inconsistency**: the Properties sheet does not have this problem, because it renders
the icon into its **own** sibling element ahead of the label (`column-manager-renderer.ts:401`,
`renderTypeIcon: (iconParent) => renderPropertyTypeIcon(iconParent, col, "obnotion-column-type-icon")`,
a dedicated `iconParent` distinct from the name text element) — a real flex gap separates them, and
`constructed-column-manager-mobile-light.png` shows "Aa Name", "123 Field 1" reading cleanly. Two
sheets in the same family now use opposite icon-to-label ordering and opposite gap mechanics for
the same information.

**Fix**: swap the icon to `margin-right: 4px` → `margin-left: 4px` if the after-text placement is
kept intentionally (a trailing type-marker, consistent with the desktop's own
`obnotion-record-detail-hidden-type-icon` precedent this rule's comment cites), or insert the icon
**before** the text node (matching the Properties sheet's reading order) if leading placement is
preferred. Either is a one-line change; the current state (zero gap, wrong-side margin) is neither.

**GLM task**: appended to `011-record-sheet-header-and-icons/tasks.md`.

---

## 5. DESTRUCTIVE CONFIRM (`013`, `confirm-sheet.ts`)

**Captures reviewed**: `screenshots/notion-clone/panels/constructed-modal-sheet-confirm-stacked-mobile-{light,dark}.png`.

| Fundamental | Verdict |
|---|---|
| Hierarchy | Pass — destructive action first and red, Cancel last and neutral, matching `hierarchy.md` §4's "destructive gets primary treatment inside the confirmation dialog, where it genuinely is the primary action" |
| Spacing/type/depth | Pass — centred card, dimmed scrim, consistent radius |
| Interaction craft | Pass — both actions ≥44px tall, stacked full width |
| Motion | Pass (token-verified, §7) |
| UX laws | Pass — Von Restorff (the one red action is the only saturated color on the card) |

No findings. `013`'s reorder is a clean, fully-converged fix — the strongest single improvement in
this wave when measured against the fundamentals, not just against Notion.

---

## 6. DATE / ICON / COLOUR / PROPERTY-TYPE PICKERS

**Captures reviewed**: `screenshots/notion-clone/fields/constructed-date-picker-mobile-{light,dark}.png`,
`screenshots/notion-clone/fields/constructed-icon-picker-mobile-{light,dark}.png`
(`components/constructed-icon-picker-mobile-*.png`), option-colour picker (converged per the audit,
not re-opened here).

### F-4 — P2 — The date picker's typed segments (YYYY/MM/DD) unintentionally inherit the filter/sort dropdown's bordered-box treatment via a documented CSS-specificity leak

**Fundamental**: `depth-and-detail.md` §7, component shape — an input that is supposed to read as a
plain, borderless typed field (the segment's own rule, `styles.css:7171-7182`,
`border: 0; background: transparent`) instead renders with the visual weight of a bordered dropdown,
because a *different* rule wins the cascade. `SKILL.md` §4 NEVER-8 (parallel systems must not mix)
applies at the component level here: one input family is unintentionally wearing another's skin.

**Evidence.** `date-value-picker.ts:163` gives the date picker's whole body the class
`obnotion-panel-row` (`bodyCls: "obnotion-date-picker-body obnotion-panel-row"`), purely so the
row-grammar lane has something structural to measure — the comment at `styles.css:14240-14247`
states this explicitly. But `.obnotion-container .obnotion-panel-row input`
(`styles.css:13836-13846`, specificity `(0,2,1)`) then applies to **every** `<input>` nested
anywhere inside that body, including the segment inputs the date picker builds at
`date-value-picker.ts:197-228` (`cls: "obnotion-date-seg"`, specificity `(0,2,0)` on its own
`border:0/background:transparent` rule) — a lower-specificity selector loses regardless of source
order. **This exact leak already broke a sibling surface once**: the codebase's own comment at
`styles.css:14266-14273` documents that the same `.obnotion-panel-row input` rule truncated the
icon-picker's search field to "Searc" before it was patched with a targeted override
(`styles.css:14274-14277`). No equivalent override exists for `.obnotion-date-seg`.

**Visible effect**: `constructed-date-picker-mobile-light.png` shows the three preset buttons
(Today/Tomorrow/Next week) as three crisp, bordered, consistently-sized cards, and the typed-segment
row directly beneath them reading with a visibly different, less-composed treatment — the family
mixes two input systems in adjacent rows of the same sheet, which is exactly what `SKILL.md` §4
NEVER-8 exists to prevent, produced here by inheritance rather than intent.

**Fix**: add a targeted override the same way the icon-picker search field got one —
`.obnotion-mobile-bottom-sheet .obnotion-date-picker-body .obnotion-date-seg { border: 0; background: transparent; }`
(three classes beats the two-class-plus-type rule, the same resolution `styles.css:14272-14273`'s
comment already explains) — or exclude `.obnotion-date-seg` from `.obnotion-panel-row input` with a
`:not()`.

**GLM task**: appended to `013-sheet-input-and-action-order/tasks.md` (closest owner: this leg
reordered the date picker's body and is the most recent toucher of `date-value-picker.ts`).

### F-5 — P2 — The mini-calendar's month-navigation chevrons are a fixed 24×24px target, below even the lane's own lenient dense-pointer floor, on a surface a thumb operates

**Fundamental**: `interaction-craft.md` §3, Fitts's Law (`ux-laws.md` §2) — targets must be "large
and closer to where the pointer already is"; the reconciled floor is 44px for anything a thumb
operates, 28px absolute minimum for a dense pointer-driven UI.

**Evidence.** `styles.css:17396-17409`, `.obnotion-calendar-mini-nav { width: 24px; height: 24px; }`,
with no coarse-pointer override. Three sibling icon-only controls in the same stylesheet region —
`.obnotion-source-rule-icon-button`, `.obnotion-row-insert-button`, `.obnotion-timeline-mobile-menu-button`
— all get bumped to a **28px** floor inside the same `@media (pointer: coarse)` block
(`styles.css:24462-24486`); `.obnotion-calendar-mini-nav` is not in that list. This tool's own
rerun of `node tools/live/touch-targets.mjs` this session prints it by name among the sub-28px
classes: `obnotion-calendar-mini-nav  smallest 24x24`. The control is used by the date-picker sheet
(`constructed-date-picker-mobile-*.png`, the `‹ August 2026 ›` row) and by every other mini-calendar
surface in the app (the sort sheet's calendar-empty state, the filter's date-value picker).

**Fix**: add `.obnotion-calendar-mini-nav` to the same coarse-pointer floor-raise block, at minimum
to 28px (matching its siblings) or to 44px given it sits on a full-bleed phone sheet with no other
control competing for the space.

**GLM task**: cross-sheet (the control is shared by ≥3 sheet families) — appended to the new child
`015-sheet-design-fundamentals`.

No findings on the icon picker or the property-type picker beyond what §2/§6 already covers; both
read as converged (confirmed against the audit's own §3.6/§3.7 convergence calls, which this
fundamentals pass does not contradict).

---

## 7. FILTER, SORT, GROUP SHEETS (`008`, `012`, `filter-panel-renderer.ts`, `sort-panel-renderer.ts`, `toolbar-renderer.ts`)

**Captures reviewed**: `screenshots/notion-clone/panels/constructed-filter-panel-mobile-{light,dark}.png`,
`constructed-sort-panel-mobile-{light,dark}.png`. Group sheet: **not visually reviewed**, see §0's
coverage gap (F-7).

### Checklist verdict

| Fundamental | Filter | Sort |
|---|---|---|
| Hierarchy | Pass — property/operator/value now stack as three full rows, each legible | Pass — property, then an indented direction picker, then a labelled red Delete |
| Spacing rhythm | Pass — 48px rows, 16px shared inset (lane-confirmed, converged with sort) | Pass — 44-48px rows |
| Interaction craft (condition-level actions) | Pass — "Add rule group" / "Negate rule" / "Remove rule" are now labelled 44px rows (`createMenuRow`), matching the audit's own §3.9 target | Pass — labelled red "Delete" row, one reorder affordance |
| Interaction craft (group-header actions) | **P1**, see F-6 | n/a |
| UX laws | Pass — Similarity holds *within* the condition-row action set (labelled rows read alike) | Pass |

### F-6 — P1 — The filter sheet's root-group action row (Add rule / Add rule group / Negate rule / Remove rule) is still four unlabelled 28px icon buttons — the same defect class `008` just fixed one level down

**Fundamental**: `ux-laws.md` §5, Similarity — *"Elements that behave alike should look alike."*
`hierarchy.md` §4 and the audit's own §3.9 P1 finding ("Rule actions are labelled rows, not
unlabelled glyphs on the rule row") — applied here to the group header rather than the condition
row it was written for. `interaction-craft.md` §3 (44px thumb floor).

**Evidence.** `filter-panel-renderer.ts:437-449` builds the root/group header's four actions
(`+`, `folder-plus`, `circle-slash-2`, `trash-2`) via `createFilterTreeIconButton`
(`:506-514`), which renders a bare icon button with `aria-label` and a hover tooltip but **no
visible text** — structurally the exact pattern the audit called out and `008` replaced with
labelled `createMenuRow` rows for the *condition*-level actions three rows below it
(`renderStackedConditionRow`, `:678-702`). `styles.css:13249-13262` sizes
`.obnotion-source-rule-icon-button` at 26×26px base; the phone coarse-pointer override
(`styles.css:24471-24474`) raises it only to **28×28px** — the same lenient floor `touch-targets.mjs`
treats as "reported, not enforced," not the 44px floor a thumb-operated row should meet, and well
under the 44px rows the condition-level fix directly beneath it now uses.

**Visible in the capture**: `constructed-filter-panel-mobile-{light,dark}.png` shows the four small
icons beside the `AND (all)` dropdown at the top of the sheet, then three fully-labelled red/black
text rows ("Add rule group", "Negate rule", "Remove rule") a few rows further down for the exact
same action set applied to a leaf condition. The same sheet now teaches the user two different
visual languages for "these four things do the same kind of thing to a rule."

**Fix**: apply the same `createMenuRow` treatment `008` already wrote and already imports in this
file to the group header's actions, or at minimum raise `.obnotion-source-rule-icon-button`'s phone
floor to 44px and add visible labels via `setTooltip`'s sibling — a persistent text span, not a
hover-only tooltip a touch device cannot trigger before the tap lands.

**GLM task**: appended to `008-filter-sheet-row-model/tasks.md` (same file, same sheet, same
producer function family the leg already modified).

---

## 8. ADD-VIEW, COLUMN WIDTH, TOOLBAR OVERFLOW

**Captures reviewed**: `screenshots/notion-clone/components/constructed-toolbar-add-view-mobile-light.png`.
Column width and toolbar overflow: numeric lane pass only this session (both green, no new visual
read beyond what the audit already recorded for them — column-width has no Notion reference per
§3.13, toolbar overflow was reordered by `013`'s record-popover work and is described in §4).

Add-view: order confirmed correct (Create rows precede Options, lane-verified this session:
`add view — the create rows precede the optional settings (choices: true, form: true)`). No P1/P2
found. One P3 observation, not filed as a task: the "View name (optional)" and "Icon (optional)"
fields are visually identical blank text boxes — a user cannot tell from the row alone that the
second one wants an emoji/icon rather than a name, until they tap it. Recorded for awareness only;
not enough evidence (no in-app affordance comparison run) to file as a confirmed defect.

---

## 9. CROSS-SHEET CONSISTENCY — DOES THE FAMILY READ AS ONE SYSTEM?

| Check | Verdict |
|---|---|
| Row pitch band (44-52px) | **Inconsistent.** Filter/sort/group/record converge at 44-52px; Properties stays at 34px (F-2, already recorded, Proposed ADR below) |
| Icon-to-label ordering and gap | **Inconsistent.** Properties: icon-then-gap-then-label. Record: label-then-icon, zero gap (F-3) |
| Action-row treatment (labelled row vs. bare icon button) | **Inconsistent within one sheet.** Filter's condition rows: labelled 44px rows. Filter's own group header, one screen scroll away: bare 28px icons (F-6) |
| Card/canvas contrast for grouped content | **Present but too subtle to read, and inverted in dark mode** (F-1) — the only sheet using this pattern so far, so "consistency" here means internal correctness, not cross-sheet comparison |
| Destructive-first action order | **Consistent** — confirm sheet (`013`), sort's Delete row (`012`), filter's Remove rule (`008`) all read destructive-last-in-tab-order-but-visually-marked, matching Notion's 4/4-capture reading |
| Border radius | Consistent — `--obnotion-radius-lg` (8px) is the shared value across the settings card, the filter/sort dropdown pills and the confirm card; verified from source (styles.css:80-87, 12364, 13842, 13855), not from eyeballing capture curvature, which reads deceptively rounder at small pixel scale than the 8px value implies |
| Motion tokens (scrim enter/exit, edge-control size) | Consistent — `--obnotion-sheet-enter` 200ms, `--obnotion-sheet-exit` 150ms, scrim alpha 0.48, close target 44×44 — all lane-confirmed shared across every registered sheet this session, with a working negative control proving the assertion is load-bearing |

### F-7 — P2 (process) — The Group sheet has no screenshot scenario; a design review of it is a numbers-only exercise

**Fundamental**: `screenshot-currency.md` — *"A surface is not done until a current capture of it
exists and you have looked at the image."* Not a visual-design fundamental, but binding on this
review's own ability to do its job for one of the sixteen named surfaces.

**Evidence.** No entry for a `group` scenario exists in `tools/screenshots/scenarios.mjs` or
`tools/screenshots/scenarios/*.mjs` (confirmed by grep, zero hits). `001/inventory.md` line 46
records the surface's own capture list as five toolbar-adjacent screenshots that do not depict it.
The lane's live numbers for the group sheet (17/17 rows at 44.0px, 3 section headings, 2 bulk
actions on their own line) are real and green, but nobody — this review included — has looked at a
picture of the Shown/Hidden partition `012` shipped for it.

**Fix**: register a `group` scenario (light + dark, mobile) depicting the toolbar Group-by sheet
with at least one hidden group, so the partition and its bulk actions are visible in the same
capture corpus every other panel sheet already has.

**GLM task**: cross-sheet coverage gap — appended to `015-sheet-design-fundamentals`.

---

## 10. IMPROVED OR REGRESSED — VERDICT PER LANDING, AGAINST THE PRE-LANDING STATE

Method: `git log --diff-filter=M --name-only <sha>^..<sha> -- screenshots` names each landing's
moved captures; `git show <parent-sha>:<path>` is the "before" reference. Verdicts below combine
that diff list with each leg's own RED→GREEN numbers (already re-verified live this session via
the two tool reruns) and this review's fresh screenshot read.

| Landing | SHA | Verdict | Basis |
|---|---|---|---|
| `071/005` sort flush frame | `e9f62e41` | **Improved.** | Sort now spans full width like its siblings (frame-role clause, lane-confirmed); no fundamental regressed |
| `071/007` settings cards | `8bd38d77` | **Mixed — structurally improved, perceptually not yet delivered, one direction inverted.** | The card *mechanism* (radius, gap, heading-above-card) is real and lane-green; but F-1 shows the light-mode contrast is too subtle to read as grouped and the dark-mode direction is backwards. The sheet is not visibly worse than the pre-card flat list, but it has not yet delivered the "reads as Notion's grouped shell" goal `007` was opened for — see F-1 |
| `071/008` filter row model | `64af87ee` | **Improved, with one inconsistency introduced.** | The headline defect (2-character property names, six controls on one row) is decisively fixed and reads well in both themes. F-6 is a *pre-existing* pattern (the group-header icon buttons predate this leg) that the leg's own condition-row fix now makes visible by contrast, one screen-scroll away, inside the same sheet |
| `071/009` properties row model | `4f345718` | **Improved.** | Six→three controls, key-free labels, Shown/Hidden partition all read cleanly in the capture. F-2 (34px rows) is a known, already-recorded trade-off, not a regression this landing introduced |
| `071/010` copy/touch idiom | `41b9619f` | **Improved.** | Not independently re-verified against a rendered capture this pass (copy-only change, no layout diff) — the lane's own 0-of-237-gesture-keys number is trusted |
| `071/011` record header + icons | `6b6f6418` | **Improved on the header; a new legibility defect on the icons.** | Title centring is a clean, confirmed fix (0.49px, matching all 13 other header-bearing surfaces). The type-icon addition is well-intentioned (redundant signal, `SKILL.md` §4 ALWAYS-5) but ships with the spacing bug in F-3 — net positive (information gained) with a legibility cost that was not there before this landing, since no icon existed on this row previously |
| `071/012` sort/group rows | `5afe61e2` | **Improved.** | Sort's three-row rule and single reorder affordance, group's Shown/Hidden partition, both read as intended in the numbers; the sort capture confirms it visually. Group's own capture does not exist (F-7) so its visual claim is unverified, not disproven |
| `071/013` input/action order | `b7fa33aa` | **Improved.** | Confirm, date-picker order and add-view order all read correctly in capture and lane. F-4 (the date-segment CSS leak) is a **pre-existing** condition of the segments' markup gaining the `obnotion-panel-row` ancestor class, not something this leg's reordering itself introduced — the segments occupied the same DOM position and the same leaked style before the reorder, just later in reading order |
| `071/014` sheet polish | `8f11b642` | **Improved.** | Icon-picker action row and the two full-width add affordances both read cleanly; no fundamental regressed |

**Net read**: eight of nine landings are unambiguous improvements against the fundamentals, not just
against Notion's screenshots. `007` is the exception — its mechanism is sound but its two provisional
numbers (already flagged provisional in its own docs) do not yet deliver a perceptible result in
either theme, and one of the two directions is backwards rather than merely subtle. None of the five
new findings in this review (F-1, F-3, F-4, F-5, F-6) were introduced by sloppiness *within* the
landing that shipped them — F-4, F-5 and F-6's root causes predate the wave; F-1 and F-3 are the
wave's own new code hitting an existing token/DOM-order gap the audit's Notion-parity lens was not
built to see, because it measures structural convergence with Notion, not the fundamentals lens's
weight/color/contrast math.

---

## 11. PROPOSED ADRs — CONTRADICTIONS WITH A LANDED RULING

Per D15 (`roadmap.md` §7.15) and the audit's own precedent (§6 ADR-A/B/C), a fundamentals finding
that would reopen an explicit, already-recorded decision becomes a Proposed ADR here rather than a
task.

**ADR-D — Properties sheet row density (34px) versus the 44px thumb floor.** `009`'s own
`implementation-summary.md` records the 34px row height as a deliberate reader-preference decision,
not an oversight. `interaction-craft.md`'s 44px floor is unambiguous for "anything a thumb
operates," and this row carries three interactive controls (↑, ↓, checkbox) at 34px — the single
sheet in the reviewed family that still sits below the band every sibling panel sheet converged on
this wave. **Reading 1**: the density preference stands; a dense list of properties is read more
than tapped-into per-row, so the interaction-craft floor is the wrong lens for it. **Reading 2**:
every control on the row (drag-order buttons, the visibility checkbox) is exactly the kind of
thumb-operated control the floor exists for, and 34px is a genuine miss-risk on a real device.
**This review takes neither reading and proposes no change** — the operator's own device read (D3,
already the standing gate on every child in this wave) is positioned to answer whether the density
reads fine on an actual phone. Recorded so a later pass does not re-discover this without knowing
it was already decided once.

---

## 12. SUMMARY TABLE

| Sheet | P1 | P2 | P3 | Worst finding |
|---|---|---|---|---|
| Settings / view-config | **1** | 0 | 0 | F-1 — card fill inverted in dark mode, imperceptible in light |
| Add/edit property, type picker | 0 | 0 | 0 | Converged |
| Properties | 0 | 1 | 0 | F-2 — 34px rows (already known, Proposed ADR-D, not a new task) |
| Record / record-peek | 0 | 1 | 0 | F-3 — type icon glued to label |
| Destructive confirm | 0 | 0 | 0 | Converged |
| Date / icon / colour pickers | 0 | 2 | 0 | F-4 — segment CSS leak; F-5 — 24px calendar nav |
| Filter | **1** | 0 | 0 | F-6 — group-header icon buttons unlabelled, 28px |
| Sort | 0 | 0 | 0 | Converged |
| Group | — | — | — | Not visually reviewable (F-7, process gap) |
| Add-view, column width, toolbar overflow | 0 | 0 | 1 | Add-view's two identical-looking optional fields (not filed) |
| **Totals** | **2** | **4** | **1** | — |

Two P1, four P2, one unfiled P3 observation, plus one process gap (F-7) and one Proposed ADR
(ADR-D) that intentionally opens no task.

---

## RELATED DOCUMENTS

- `sheet-notion-audit.md` — the Notion-parity audit this review does not re-litigate
- `007-settings-sheet-strict-alignment/tasks.md`, `008-filter-sheet-row-model/tasks.md`,
  `011-record-sheet-header-and-icons/tasks.md`, `013-sheet-input-and-action-order/tasks.md` — each
  gained a `### Design-review follow-ups (2026-09-10)` section from this review
- `015-sheet-design-fundamentals/` — the new child carrying the two cross-sheet findings (F-5, F-7)
- `../roadmap.md` §4 (new row), §5.A `071` row, §7 (ADR-D)
- `../handover.md` — dated entry recording this review's landing
