---
title: "Decision Record: Notion Dropdown, Menu and Picker Refinement"
description: "Eight decisions from the Notion research loop: six naming a conflict and leaving the landed Anytype ruling standing, one the operator has now ruled against the Fibery, Anytype and Notion captures, and one still open."
trigger_phrases:
  - "063 decision record"
  - "notion dropdown adr"
  - "sheet escalation adr"
  - "colour label adr"
  - "destructive carve-out adr"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/063-notion-dropdown-refinement"
    last_updated_at: "2026-09-06T19:40:00Z"
    last_updated_by: "option-colour-picker-research-session"
    recent_action: "Amended ADR-004 to Accepted from the Fibery, Anytype and Notion capture sweep"
    next_safe_action: "Put ADR-005 to the operator"
    blockers:
      - "ADR-005 is Proposed and operator-owned"
    key_files:
      - "specs/005-component-surface-system/052-dropdown-menu-and-picker-componentization/decision-record.md"
      - "specs/005-component-surface-system/roadmap.md"
      - "src/views/option-color-picker.ts"
      - "src/views/popover-host.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-063-decisions"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "A structure-removal carve-out to E3, or E3 whole"
    answered_questions:
      - "Six Notion-versus-Anytype conflicts already have a landed ruling and it stands"
      - "The option colour picker becomes a one-column labelled list, on both platforms"
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Notion Dropdown, Menu and Picker Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Under the parent's **D15**, a Notion finding never silently overrides a landed Anytype ruling.
> Where the two disagree, the record names both readings. Six of the eight decisions below do exactly
> that and change nothing; two are the operator's, and ADR-004 was ruled on 2026-09-06 ~19:08
> against the Fibery, Anytype and Notion captures, leaving ADR-005 the only open question.

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The phone sheet's search count gate stays the phone's alone

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator (via `052` ADR-006); recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-001-context -->
### Context

Notion shows a search field on its iOS pickers regardless of option count — `8ff7ae4b` puts one over
a three-option list, `86a8e66c` opens the Add-filter sheet with search first. Our phone sheet gates
the search row behind `options.searchable === true && options.options.length > 8`
(`dropdown-field.ts:228`). Read on its own, the digest looks like evidence for removing the gate.

It is not, because the gate was ruled on the same day the combobox landed. `052` ADR-006 ¶1: *"The
count gate is the phone's alone… On a phone sheet the old condition is untouched, so `044`'s sheet
grammar and its registered pairs are unchanged."* The research loop opened this as a candidate
improvement in iteration 1 and closed it in iteration 2 on that text.

### Constraints

- `044`'s registered sheet pairs assume the current phone grammar; changing what the sheet contains
  at low option counts moves them.
- The desktop half of the same line is already unconditional and is not in question.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: keep the phone sheet's `> 8` count gate exactly as it is, and record Notion's iOS
evidence as a named non-adoption rather than acting on it.

**How it works**: `dropdown-field.ts:228` is not edited by this packet. If the operator ever wants
the phone gate re-opened, the check is a phone sheet-space measurement, not a desktop one — that is
the only work this decision defers.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- The phone grammar and `044`'s registered pairs stay untouched, so nothing this packet does can
  move them.

**What it costs**:
- A phone user with four options still has no filter. Mitigation: the operator can re-open it, and
  the measurement they would need is named above.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The digest is read later as an unactioned gap | L | This ADR is the record that it was read and dispositioned |
<!-- /ANCHOR:adr-001-consequences -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: One checkmark grammar — Notion's entity-selection filled circle is refused

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator (via `052` ADR-005 refusal 4); recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-002-context -->
### Context

Notion's N2 carries three selection indicators, not one: a plain trailing checkmark, a **blue filled
circular check** on person and entity pickers (`7174b226`), and a radio control in one sort-order
list (`aeb6d373`). All three are trailing; they differ in shape by picker kind.

`052` ADR-005 refusal 4 already refused exactly this shape when Anytype's iOS offered it: *"iOS's two
checkmark grammars… One product, two ticks for one affordance, is the exact defect G14 exists to
close."* Notion's circle is that second grammar arriving from a second product.

### Constraints

- G14 is landed and this packet's REQ-001 is the leg that finishes honouring it. Adopting a second
  indicator in the same release would undo the reason for the first.
<!-- /ANCHOR:adr-002-context -->

---

<!-- ANCHOR:adr-002-decision -->
### Decision

**We chose**: one trailing checkmark for every selection in the family, in the dropdown, the relation
picker, the option editor and the colour picker alike.

**How it works**: no code change. The refusal is recorded so a later reader who finds `7174b226` in
the digest can see it was considered rather than missed.
<!-- /ANCHOR:adr-002-decision -->

---

<!-- ANCHOR:adr-002-consequences -->
### Consequences

**What improves**:
- The family reads as one product. A person learning the tick in one picker knows it everywhere.

**What it costs**:
- Entity pickers lose a visual cue Notion uses to say "this row is a person, and it is selected".
  Mitigation: the relation picker's own row already carries a record icon, which does that work.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future picker kind wants its own indicator | L | It would be a new ADR against G14, not a silent addition |
<!-- /ANCHOR:adr-002-consequences -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: Notion's radio grammar is not adopted

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | The Notion synthesis, under G14 and N2's own rule |

---

<!-- ANCHOR:adr-003-context -->
### Context

`aeb6d373` shows a radio-button column in one Notion surface: a search-results sort-order list. It is
the third of N2's three indicators, and the digest's own observation is that the three are **never
mixed within one list**.

We have no surface that matches. Our single-select lists are dropdowns and pickers, all of which
already carry the trailing tick that G14 rules and that REQ-001 finishes landing.

### Constraints

- Adding a radio to any of our lists would put two indicators in one product, which is the same
  defect ADR-002 refuses, and it would break N2's own never-mixed rule at the same time.
<!-- /ANCHOR:adr-003-context -->

---

<!-- ANCHOR:adr-003-decision -->
### Decision

**We chose**: no radio grammar. The trailing tick carries every single-select in the family.

**How it works**: no code change; a ruled-out direction recorded so it is not re-proposed.
<!-- /ANCHOR:adr-003-decision -->

---

<!-- ANCHOR:adr-003-consequences -->
### Consequences

**What improves**:
- One fewer indicator to keep consistent across four pickers and a menu grammar.

**What it costs**:
- Nothing measurable: no current surface asked for it.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future exclusive-choice surface reads ambiguously with only a tick | L | Revisit against a real caller, not against a screenshot |
<!-- /ANCHOR:adr-003-consequences -->
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: The option colour picker becomes a one-column labelled list

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — ruled directly, 2026-09-06 ~19:08 |

---

<!-- ANCHOR:adr-004-context -->
### Context

The operator's instruction, verbatim, 2026-09-06 ~19:08: *"Check fibery, anytype and notion and
suggest best ui ux"*. Three products were read capture by capture before this ADR was rewritten,
and the reading changed the answer: the prior revision of this ADR recommended keeping the grid,
and that recommendation is withdrawn here rather than edited quietly.

**Three facts this ADR previously stated are wrong, and the corrections are the reason the answer
flips.**

1. **The palette is sixteen colours, not twelve.** `status-colors.ts:13-16` lists `gray brown
   orange yellow green blue purple pink red slate cyan teal lime indigo violet rose`, and
   `column-types.ts:173` re-exports it unchanged as `OPTION_COLORS`. `052`'s
   `componentization-plan.md:84` and this file's own prior text both said twelve; the shipped
   surface has been sixteen for the whole of this program's history (`status-colors.ts` carries one
   commit, `2d10e6fc`).
2. **The rendered picker is 96px wide, not 124.** `SWATCH_PICKER_POPOVER` still declares
   `minWidth/preferredWidth/maxWidth: 124` (`popover-host.ts:236-240`), but
   `.db-color-picker-popup` pins `width: 96px` (`styles.css:7277-7294`) with the arithmetic in its
   own comment — four 18px swatches, three 4px gaps, two 6px pads. The stylesheet wins, so the
   "hard 124 width role" this ADR called a constraint is not what the user sees.
3. **A sixteen-hue grid cannot be read by hue.** Measured over the palette's own light and dark
   swatch fills (`styles.css:163-193` and `:878-914`) in CIE76 ΔE: light theme puts `gray` and
   `slate` **2.8** apart and `blue` and `indigo` **8.2** apart; dark theme puts five pairs under
   ΔE 10 — `purple`/`violet` **4.6**, `indigo`/`violet` **6.7**, `gray`/`slate` **7.4**,
   `cyan`/`teal` **7.5**, `blue`/`indigo` **7.8** — and sixteen of the 120 pairs under ΔE 15.
   Two 18px patches that far apart are not reliably told apart by a viewer with normal colour
   vision, let alone one without it.

Point 3 is the ground. `051` ADR-007 **E3** rules on WCAG 1.4.1 — information is never carried by
colour alone — and an unlabelled swatch grid asks the user to identify sixteen persisted values by
hue and nothing else. The `aria-label`, the `title` and the selected swatch's check icon
(`option-color-picker.ts:79-88`) each answer a different half of that rule: the screen-reader name,
the hover name, and the shape of the *selected* state. None of them tells a sighted user looking at
the open picker which of two near-identical squares is `gray` and which is `slate`. So the visible
name is not a preference. It is the missing non-colour signal for the choice itself.

**What the three references actually do — and they agree on a rule none of them states.** The shape
follows the *persistence* of the colour, not the product:

- **A colour that names a persistent attribute gets a labelled row.** Anytype's colour picker is a
  one-column list of eleven named rows — `Default Grey Yellow Amber Red Pink Purple Blue Sky Teal
  Green` — with a leading round dot and a trailing tick on the current one, measured at a **28px**
  row pitch and a **16px** dot in
  `screenshots/anytype/desktop/menus/anytype-menu-object-block-menu-color-dark.png`, identical in
  light. `052`'s G15 measured the same panel at **224px** wide and recorded *"there is no swatch
  grid"*. Notion does the same for option colours on **both** platforms: the multi-select option's
  `Colors` submenu is ten named rows with a leading swatch and a trailing check
  (`screenshots/notion/web/flows/editing-an-option/notion-web-flow-editing-an-option-03-61c3069b-8707-4f9a-8a13-95ba6d22e44f.webp`,
  and the status-option twin at
  `screenshots/notion/web/database/notion-web-database-table-04-74fe28d3-82c4-4fe8-b982-5c04e708b27c.webp`),
  measured at a **~28-30 CSS px** row and a **~20-22 CSS px** swatch; on iOS the same choice is a
  full-height `Select color` sheet of ten named rows at a **44.8pt** pitch with a **22pt** swatch
  (`screenshots/notion/ios/flows/adding-a-conditional-color/notion-ios-flow-adding-a-conditional-color-07-7e1fda1e-b5df-4801-9a04-676cbead7612.webp`).
- **A colour that is transient inline formatting gets an unlabelled grid.** Notion's text and
  background colour picker on web is two 2x5 grids of ~26px swatches with a *Recently used* row
  (`screenshots/notion/web/editors/notion-web-editors-page-23-e9553f06-46ea-4a12-ae98-a7da3dae7a57.webp`,
  `screenshots/notion/web/editors/notion-web-editors-wiki-07-1f0fc9bc-fb0c-4787-8c9b-f6a3be5dbe4b.webp`).
  Fibery's only colour picker is a 2x10 grid of ~32px circles with a ring on the selected one, and
  it colours a **view-level rule**, not an option
  (`worktrees/150-harvest-fibery` `3b3ac633`,
  `screenshots/fibery/web/flows/editing-chart-color/fibery-web-flow-editing-chart-color-02-c64ab346-0e3b-4a58-a9fd-1b7905bfadb5.webp`).
- **Fibery is the control that proves the rule.** Its multi-select options carry no colour at all —
  the option editor's leading slot is an icon, not a swatch
  (`screenshots/fibery/web/flows/reordering-field-options/fibery-web-flow-reordering-field-options-03-a7c1f3a8-dcd9-4c64-8b97-7257a0e53dc3.webp`),
  and the value picker renders them as plain grey chips
  (`screenshots/fibery/web/flows/selecting-from-multi-select/fibery-web-flow-selecting-from-multi-select-03-f90065f2-ed2f-48c8-be8f-3c399c04633d.webp`).
  Fibery has a swatch grid **and** persistent option colours, and it never points the first at the
  second.

Our picker is the persistent-attribute case: the chosen colour is written to `StatusOptionDef.color`
and rendered on every chip in every view. Every reference gives that case a labelled row. We give it
the shape all three reserve for transient formatting.

**One more correction, on the captures rather than the code.** `048`'s registered pair for the phone
picker does not photograph the phone grammar:
`screenshots/notion-clone/fields/field-option-color-picker-mobile-light.png` is pixel-identical in
shape to its desktop twin — a 4x4 anchored grid, no sheet, no header. The phone anatomy is only
visible in the constructed pair
(`screenshots/notion-clone/fields/constructed-option-color-picker-mobile-light.png`), which shows the
real sheet: sixteen 44px swatches wrapping seven, seven, two, with a two-orphan last row. Under
`screenshot-currency.md` §3 that is a fixture gap in the `field-` scenario rather than a defect in
the plugin, and it is named here because the pair has to be re-registered anyway.

### Constraints

- **ADR-002 above already promised this shape.** *"One trailing checkmark for every selection in the
  family, in the dropdown, the relation picker, the option editor and the colour picker alike."* A
  check drawn *inside* a swatch is not a trailing check in a row; the grid is the one surface in the
  family that cannot honour ADR-002 without becoming a list.
- **The row already exists.** `.db-dropdown-option` is a `16px | 1fr` grid at `min-height: 30px`
  desktop and `44px` phone, with a `has-swatches` variant that adds a trailing `auto` track
  (`styles.css:3237-3268`, `:3187-3190`). This ADR needs no new layout, which is why it is a row
  change and not a redesign.
- **The palette is persisted data.** Sixteen values are written into vault files. Trimming the
  palette to Notion's ten or Anytype's eleven would need a migration and is explicitly **not** in
  this ADR; visible names make sixteen workable without one.
- **`048` holds a registered capture pair for the current grid**, and both halves move.
- Anytype's measured 28px row is **declined** in favour of the family's own 30px
  (`styles.css:3243`). Adopting 28 would move every dropdown in the family and every capture of one,
  for a 2px parity gain — a blast radius this packet has no mandate for. The deviation is recorded
  rather than absorbed.
<!-- /ANCHOR:adr-004-context -->

---

<!-- ANCHOR:adr-004-decision -->
### Decision

**We chose**: the option colour picker becomes a **one-column labelled list** — a leading colour
dot, the colour's visible name, a trailing tick on the current one — on desktop and on the phone
alike, built from the family's existing `.db-dropdown-option` row rather than a new layout.

**How it works**: `option-color-picker.ts` stops emitting `db-color-picker-swatch` buttons into a
wrapping flex box and emits `.db-dropdown-option.has-swatches` rows instead: the 16px leading track
takes the colour dot, the label track takes the translated colour name, the trailing track takes the
same `db-dropdown-option-check` element ADR-002 and REQ-001 rule everywhere else in the family.
`SWATCH_PICKER_POPOVER` widens from 124 to Anytype's measured **224**, and
`.db-color-picker-popup`'s `width: 96px` and its swatch-grid rules go with the grid they sized. On
the phone the list is the same list inside the existing sheet, which already caps itself at `90svh`
(`styles.css:245`), so sixteen 44px rows scroll inside the cap rather than needing a new number.

**The colour names become visible text, which means they become translated strings.** Today `color`
is used raw as both `title` and `aria-label` (`option-color-picker.ts:79-82`); the visible label
goes through `t()` like every other string in the family, and the accessible name comes from the
visible text rather than from an attribute duplicating it.
<!-- /ANCHOR:adr-004-decision -->

---

<!-- ANCHOR:adr-004-alternatives -->
### Alternatives Considered

Every row's evidence was read as an image, not inferred from a filename. Measurements are in CSS px
on desktop and points on iOS; the iOS scale is fixed by the capture's own 648x299 screen area
against the 852x393 device it photographs.

| Option | What the references say | Pros | Cons | Score |
|--------|-------------------------|------|------|-------|
| **One-column labelled list (chosen)** | Anytype's only colour picker (11 rows, 28px pitch, 16px dot, 224px wide, trailing tick); Notion's option colours on web (10 rows, ~28-30px, ~20-22px swatch) and on iOS (10 rows, 44.8pt, 22pt swatch) | The name is the non-colour signal WCAG 1.4.1 and `051` E3 ask for; it is the Anytype parity default under D15 **and** Notion's own answer for this exact surface, so the two references agree for once; ADR-002's trailing tick finally applies here; reuses `.db-dropdown-option` so no new layout ships | Tallest shape: 16 rows x 30px desktop, 16 x 44px phone, so the phone sheet scrolls; a new 224px width role and a re-registered `048` pair | 9/10 |
| Two-column labelled grid, Notion iOS's `011e1303` shape | Notion's **inline text-background** picker on iOS: 10 labelled cells, 2 columns, ~52pt pitch, ~20pt swatch | Halves the phone height against the list; keeps the name visible | It is Notion's transient-formatting shape, and Notion does **not** use it for option colours — its own option colour picker on the same OS is the one-column sheet; adopting it would deviate from Anytype parity *and* from Notion's answer for this surface, to save scrolling in a sheet that already scrolls | 6/10 |
| Keep the 16-swatch grid (the prior recommendation) | Nobody's shape for a persistent option colour. Closest match is Fibery's view-rule grid and Notion's inline formatting grid, both transient | Zero work; the `048` pair stands | `gray`/`slate` at ΔE 2.8 and four more dark pairs under ΔE 10 mean the surface cannot be operated by hue; contradicts ADR-002's trailing-tick rule; matches no reference for this case | 2/10 |
| Fibery's unlabelled circle grid, 2x10 at ~32px | `editing-chart-color`, `adding-a-color-coding` — and Fibery attaches it to a view rule, never to an option | Larger targets than our 18px desktop swatch | Same colour-alone defect as ours, at a bigger size; and Fibery is the product that deliberately gives options **no** colour, so it is the weakest possible authority for how an option colour should be picked | 2/10 |
| Labelled grid — name under each swatch | No reference does this | Compact in principle | Sixteen wrapped labels read as noise at any width that still looks like a grid; needs a wider role than the list anyway | 3/10 |

**Why this one**: two of the three products give this exact surface a labelled one-column list, the
third gives it no colour at all, and the measured ΔE says our grid is unreadable by hue whatever the
references do. The parity argument and the accessibility argument point the same way, which is rare
enough to be worth acting on.
<!-- /ANCHOR:adr-004-alternatives -->

---

<!-- ANCHOR:adr-004-consequences -->
### Consequences

**What improves**:
- A colour's name is readable at rest, so `gray` and `slate` stop being one choice with two entries.
- The colour picker joins the rest of the family: one row grammar, one trailing tick, one keyboard
  model, which is what `052` D6 exists to produce.
- The phone sheet stops shipping a ragged two-orphan last row.

**What it costs**:
- A taller surface: 16 rows against a 4x4 block. Mitigation: the sheet's existing `90svh` cap and
  the list's own scroll, plus scrolling the selected row into view on open.
- A new 224px width role and a re-registered `048` capture pair, both halves of which move.
- Sixteen colour names become translated strings rather than raw enum values.
- Grid arrow-key navigation (`getGridNavigationTarget`) is replaced by the family's list navigation.
  Mitigation: the list model is the one every other picker in the family already uses.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The phone sheet is 16 rows tall and hides the parent it was opened from | M | The `90svh` cap is already in the sheet grammar and is asserted by AC-014; the selected row is scrolled into view so the list never opens at an arbitrary offset |
| A colour name is untranslated and leaks an English enum value | M | AC-015 asserts every one of the sixteen resolves through `t()`, and a missing key is a visible failure rather than a silent fallback |
| The width change moves surfaces that share the swatch role | M | `SWATCH_PICKER_POPOVER` has one consumer (`option-color-picker.ts:124`); T014's inventory reads it back before the constant moves |
| The 30px-versus-28px deviation is later read as an unnoticed parity gap | L | Recorded in Constraints above with its reason and its blast radius |
<!-- /ANCHOR:adr-004-consequences -->

---

<!-- ANCHOR:adr-004-five-checks -->
### Five Checks Evaluation

The prior revision scored this 3/5 and called it a preference. That reading rested on the twelve-
swatch figure and on treating `aria-label` as satisfying the colour-alone rule for a sighted user.
Both are corrected above, and the score moves with them.

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Sixteen hues with `gray`/`slate` at ΔE 2.8 and five dark pairs under ΔE 10 cannot be told apart; the visible name is the non-colour signal `051` E3's own WCAG 1.4.1 ground requires |
| 2 | **Beyond Local Maxima?** | PASS | Five shapes weighed against three products' captures, including the two this ADR previously preferred |
| 3 | **Sufficient?** | PASS | One row builder swap, one width constant, one stylesheet block removed; `.db-dropdown-option` already provides the layout |
| 4 | **Fits Goal?** | PASS | REQ-008, and it is the only place ADR-002's trailing-tick rule is still unhonoured |
| 5 | **Open Horizons?** | PASS | A labelled list makes a palette trim optional rather than urgent, and the row is the family's own, so a later change to it reaches here for free |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-004-five-checks -->

---

<!-- ANCHOR:adr-004-impl -->
### Implementation

**What changes**:
- `src/views/option-color-picker.ts` — the swatch loop becomes a `.db-dropdown-option.has-swatches`
  row loop with a leading dot, a translated name and the family's trailing check; list navigation
  replaces `getGridNavigationTarget`.
- `src/views/popover-host.ts` — `SWATCH_PICKER_POPOVER` 124 -> 224.
- `styles.css` — `.db-color-picker-popup`'s `width: 96px` and its swatch rules
  (`:7277-7322`, `:12895-12920`) give way to the dropdown row's own. The leading dot is sized in its
  own rule at Anytype's measured 16px; `.db-option-color-dot` is 12px (`styles.css:7268-7275`) and
  is left alone, because it is the chip dot every view already paints.
- `src/i18n/` — sixteen colour-name keys.
- `tools/screenshots/scenarios.mjs` and the `048` pair — re-registered, and the `field-` phone
  scenario fixed so it photographs the sheet rather than the desktop popover.

**How to roll back**: one commit against one file group. `git revert` restores the grid, its width
role and its capture pair together; no caller of `openOptionColorPicker` changes signature, so
nothing outside the picker moves.
<!-- /ANCHOR:adr-004-impl -->
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: Whether E3 takes a carve-out for structure-removing rows

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Proposed |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — open |

---

<!-- ANCHOR:adr-005-context -->
### Context

Notion is inconsistent about destructive rows, and the inconsistency looks deliberate: red **with** an
icon for content-destroying rows; red **without** an icon on `Remove` rows (`5f81b365`, `ca4fd83f`);
and **plain text, no red at all** for rows that remove structure without destroying content —
`Remove grouping` (`e9698e1b`), `Delete filter` (`299e69bb`).

The research loop proposed a carve-out on that reading in iteration 1, then withdrew it in iteration
4 against the authority documents. `051` ADR-007 exception **E3**, recorded in `roadmap.md` §6A on
2026-09-05 ~18:30, rules red-plus-trash-icon on **every** destructive row, with the stated reason that
*"Anytype's own minority answer carries no non-colour signal"*. E3 is universal by construction, so
the carve-out is not a recommendation this packet can make.

### Constraints

- E3 is an operator ruling. D1 forbids overturning it here.
- The distinction Notion draws — content versus structure — is real and would need a definition
  before any code could implement it. "Removes a filter" and "deletes an option and its values" are
  genuinely different acts.
<!-- /ANCHOR:adr-005-context -->

---

<!-- ANCHOR:adr-005-decision -->
### Decision

**We chose**: E3 stands whole. The carve-out is recorded as an operator question and nothing else.

**How it works**: no code change. If the operator wants the carve-out, it needs a definition of
"removes structure without destroying content" that a reviewer can apply to a row without asking,
and that definition belongs in `051`'s record, not this packet's.
<!-- /ANCHOR:adr-005-decision -->

---

<!-- ANCHOR:adr-005-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **E3 whole (recommended)** | One rule, no judgement call at any call site; every destructive row carries a non-colour signal | A `Remove grouping` row looks as grave as deleting an option | 8/10 |
| Notion's three-way split | Matches the digest exactly; visual weight matches actual consequence | Three rules, each needing a per-row judgement; two of the three carry no non-colour signal, which is what E3 exists to prevent | 4/10 |
| A named two-way carve-out: red+icon for destroying, plain for structure removal | Only one boundary to define; keeps a non-colour signal where it matters most | Still needs the boundary defined; re-opens a ruling that closed a day earlier | 6/10 |

**Why this one**: E3 is landed, and the case for re-opening it is a visual-weight argument with no
accessibility ground behind it. That is precisely the kind of call the operator takes, not us.
<!-- /ANCHOR:adr-005-alternatives -->

---

<!-- ANCHOR:adr-005-consequences -->
### Consequences

**What improves**:
- One rule for every destructive row, and no reviewer ever has to classify one.

**What it costs**:
- Low-consequence rows read as heavily as high-consequence ones.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Red fatigue: everything red means nothing is | M | Recorded here; the operator has the data to decide |
<!-- /ANCHOR:adr-005-consequences -->

---

<!-- ANCHOR:adr-005-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | FAIL | No defect is open against E3; this is a visual-weight preference |
| 2 | **Beyond Local Maxima?** | PASS | Three dispositions weighed above |
| 3 | **Sufficient?** | FAIL | The two-way carve-out needs a boundary definition that does not exist yet |
| 4 | **Fits Goal?** | FAIL | Outside this packet's scope; `051` owns the rule |
| 5 | **Open Horizons?** | PASS | Recording the question costs nothing and keeps it findable |

**Checks Summary**: 2/5 PASS — Proposed, and recommended against.
<!-- /ANCHOR:adr-005-five-checks -->
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: The popover-versus-docked-panel split is already ruled

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator (via `051` ADR-008); recorded here by the Notion synthesis |

---

<!-- ANCHOR:adr-006-context -->
### Context

Notion's N12 records an inconsistency in Notion itself: the same "Edit property" content appears once
as a floating popover and once as a **right-docked side panel** (`1d99acb0`), and the full view
settings appear as a panel too (`50d73158`). Read cold, that is an open question about which host our
family should use.

It is not open. `051` ADR-008, ruled 2026-09-06 ~08:15 and recorded in `roadmap.md` §6A, converts the
database settings panel to a 420px right-docked side sheet while menus and pickers stay anchored
surfaces. Both shapes exist here already, each on its ruled surface.

### Constraints

- ADR-007 below adds a *third* presentation for one specific measured condition. It does not reopen
  this split; it adds an escape hatch inside the anchored half.
<!-- /ANCHOR:adr-006-context -->

---

<!-- ANCHOR:adr-006-decision -->
### Decision

**We chose**: no host change from N12. Settings are a right side sheet; menus and pickers are
anchored surfaces.

**How it works**: no code change. Notion's own inconsistency needs no decision from us because our
split is already ruled per surface.
<!-- /ANCHOR:adr-006-decision -->

---

<!-- ANCHOR:adr-006-consequences -->
### Consequences

**What improves**:
- The digest's most structural-looking finding is closed without touching a host.

**What it costs**:
- Nothing. Both shapes were already built.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| ADR-007's escalation is read as reopening this | M | ADR-007 states its condition in measured terms and applies only to dropdowns |
<!-- /ANCHOR:adr-006-consequences -->
<!-- /ANCHOR:adr-006 -->

---

<!-- ANCHOR:adr-007 -->
## ADR-007: A cramped desktop dropdown escalates to a sheet with a dedicated button

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — ruled directly |

---

<!-- ANCHOR:adr-007-context -->
### Context

The operator's ruling: **where the anchored popover is cramped, a desktop dropdown should become a
sheet with a dedicated button.**

Today the desktop dropdown has exactly one presentation. `dropdown-field.ts:421` places every one of
them with `{ preferredWidth: 280, maxWidth: 360, minWidth: 180, gap: 6, align: "left" }`, and the
sheet branch at `:224` is guarded by `isMobileBottomSheet`, so it is unreachable on desktop. When the
anchored arithmetic cannot find room, the surface shrinks toward 180px or its list scrolls under
`owned-menu.ts:360`'s `max(120, bounds.height - margin * 2)` cap. Neither is a failure the code
reports; both are just a smaller surface.

Notion carries the same escalation in three forms: a sheet with a `Done` header (`9acbba50`), a
docked panel where a floating popover would be cramped (`1d99acb0`, `50d73158`), and an explicit
escalation row into a fuller picker (`cfca14fb`, "Choose date ›"). None of them is our shape exactly,
and per D3 none of them supplies a value — they establish that the move is a real pattern, and our
own placement code supplies the trigger.

### Constraints

- "Cramped" must be measured or the criterion is unfalsifiable and the escalation will fire on the
  wrong surfaces.
- `048`'s stacking model and `044`'s sheet grammar govern anything that presents as a sheet.
- `052`'s D6: the decision belongs in the primitive, not at 29 `createDropdownField` call sites.
<!-- /ANCHOR:adr-007-context -->

---

<!-- ANCHOR:adr-007-decision -->
### Decision

**We chose**: the dropdown primitive gains a third presentation — a desktop sheet, opened by a
dedicated button — chosen on a measured condition rather than a per-call-site flag.

**How it works**: at open, the primitive asks the placement code what it could actually give the
anchored popover. The surface is cramped when **either** the anchored placement cannot honour
`preferredWidth: 280` and falls toward `minWidth: 180`, **or** the panel's height reaches
`owned-menu.ts:360`'s viewport cap so the list scrolls. Either condition escalates: the popover is
not opened, and the dedicated button presents the sheet instead. When a sheet has no room either, the
primitive falls back to today's anchored popover rather than pinning a surface to the viewport top —
the failure `popover-position.ts:48-58` already documents from the `dockTo` history.
<!-- /ANCHOR:adr-007-decision -->

---

<!-- ANCHOR:adr-007-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Measured escalation in the primitive (chosen)** | One decision point; the trigger is re-derivable by any reader; no call site learns a new flag | Needs the placement code to report what it gave, which it does not do today | 8/10 |
| A per-call-site `presentAsSheet` flag | Trivial to implement; the author of each surface decides | 29 call sites each holding a judgement; drifts the moment a layout changes; exactly the pattern `052` exists to remove | 3/10 |
| Always a sheet on desktop | No condition to get wrong | Turns every two-option dropdown into a sheet; contradicts `051` ADR-008's anchored-menus half | 2/10 |
| A docked side panel, Notion's `1d99acb0` shape | Matches the digest most literally | `051` ADR-008 already assigns the docked panel to settings; a second docked host would blur the split ADR-006 just recorded | 4/10 |

**Why this one**: the operator's ruling names a condition ("where the popover is cramped"), and the
only way to honour a conditional ruling without guessing is to make the condition something the code
computes and a reader can check.
<!-- /ANCHOR:adr-007-alternatives -->

---

<!-- ANCHOR:adr-007-consequences -->
### Consequences

**What improves**:
- A long or wide option list stops being squeezed into a 180px column beside its trigger.
- The escalation is one rule, so a new dropdown inherits it without its author knowing it exists.

**What it costs**:
- A third presentation to keep green in the lanes. Mitigation: it reuses `044`'s sheet grammar and
  `048`'s stacking rather than inventing chrome.
- The placement code must report its outcome. Mitigation: it already computes both numbers; the
  change is returning them, not deriving them.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The measured condition selects surfaces the operator does not consider cramped | H | AC-011 is the operator's read; the threshold is one line and tunable without touching call sites |
| A dropdown escalates mid-interaction and loses the typed query | M | The surface is re-presented rather than mutated; ADR-008 requires the search input to survive |
| Two open surfaces at once if the registry is bypassed | M | The escalated sheet goes through `popover-host.ts`'s one-per-document active-picker registry like every other picker |
<!-- /ANCHOR:adr-007-consequences -->

---

<!-- ANCHOR:adr-007-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The operator reported cramped popovers; today there is no second presentation at all |
| 2 | **Beyond Local Maxima?** | PASS | Four options weighed, including the two the digest suggests |
| 3 | **Sufficient?** | PASS | One branch in one primitive, on numbers the placement code already has |
| 4 | **Fits Goal?** | PASS | REQ-004, a P0 of this packet |
| 5 | **Open Horizons?** | PASS | The threshold is a single condition, tunable without touching any caller |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-007-five-checks -->

---

<!-- ANCHOR:adr-007-impl -->
### Implementation

**What changes**:
- `src/views/dropdown-field.ts` — the escalation branch beside the phone-sheet branch at `:224`, and
  the placement call at `:421` reporting what it could give.
- `styles.css` — the escalated surface's chrome, reusing `044`'s sheet grammar rather than new rules.
- `src/views/dropdown-field.test.ts` — the branch's condition, both ways.

**How to roll back**: the branch is one commit against one file group. `git revert` it and the
primitive is back to a single desktop presentation; no caller changed, so nothing else moves.
<!-- /ANCHOR:adr-007-impl -->
<!-- /ANCHOR:adr-007 -->

---

<!-- ANCHOR:adr-008 -->
## ADR-008: Search is unconditional on desktop, and the escalation must preserve it

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Operator — ruled, and landed at `a952e5e7` via `052` ADR-006 |

---

<!-- ANCHOR:adr-008-context -->
### Context

Every desktop dropdown opens with a search input active. That is a landed operator ruling, not a
proposal: `052` ADR-006 was rewritten from a refusal into the ruling it should have been, and
`dropdown-field.ts:228` now reads `searchable = phoneSheet ? options.searchable === true &&
options.options.length > 8 : true`, with the comment *"Every desktop dropdown is a combobox: the list
filters as you type, whatever its length."* Notion's own evidence agrees at any count (**N3**,
`8ff7ae4b` over a three-option list).

ADR-007 adds a second desktop presentation. A new presentation is exactly where a landed rule quietly
stops applying, because nobody wrote it down for the shape that did not exist yet.

### Constraints

- The phone sheet's count gate is out of scope here — ADR-001 above.
- `a952e5e7`'s census recorded 52 call sites, none of which changed. The escalation must not become
  the 53rd exception.
<!-- /ANCHOR:adr-008-context -->

---

<!-- ANCHOR:adr-008-decision -->
### Decision

**We chose**: the combobox rule binds every desktop presentation of a dropdown, including the sheet
ADR-007 introduces. The escalated surface opens with a search input present and focused.

**How it works**: REQ-005 and AC-006 carry it as a criterion, and T007 carries the assertion. The
rule is restated here rather than assumed, because a rule that lives only in a branch nobody has
written yet is not a rule.
<!-- /ANCHOR:adr-008-decision -->

---

<!-- ANCHOR:adr-008-consequences -->
### Consequences

**What improves**:
- The escalation cannot silently become a place where typing stops working.

**What it costs**:
- The escalated sheet must find room for a search row before its list. Mitigation: it is a sheet;
  room is the reason it exists.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Focus lands on the sheet rather than its input | M | AC-006 asserts the input is focused, not merely present |
| The typed query is lost when a popover escalates | M | ADR-007's consequences carry the re-presentation rule; the query is carried across |
<!-- /ANCHOR:adr-008-consequences -->
<!-- /ANCHOR:adr-008 -->
