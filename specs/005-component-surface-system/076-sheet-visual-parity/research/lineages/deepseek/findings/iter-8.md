# Iteration 8 — DESIGN SYSTEM, second axis: the colour-role layer, the typography migration, and the stacking engine

**Gap class:** DESIGN SYSTEM (second pass, different axis). Iteration 4 mapped the frame, the row
primitives and the token zoo. This pass opens the three parts of the system the rulings name and no
token carries: **colour roles for status/priority**, **the typography scale against D7's 17pt**, and
**the stacking model**.

---

## Y-1 · The colour-role layer exists, is theme-paired — and is named outside the token system the packet audits

**Evidence.**

- The roles' data source: `src/data/column-types.ts:205` — `export const OPTION_COLORS: StatusColor[] = [...STATUS_COLORS];`, consumed by the picker at `src/views/option-color-picker.ts:73-88`
  (`OPTION_COLORS.forEach((color, index) => { … t(\`optionColor.${color}\`) })`).
- The values are **the plugin's own**, defined twice in `styles.css` — light at `:183-202` and dark at
  `:1050`:
  ```css
  --status-color-bg-gray:   color-mix(in srgb, #6b7280 16%, transparent);
  --status-color-fg-gray:   #374151;
  … --status-color-fg-red:  #991b1b;
  ```
  (dark override: `styles.css:1050 --status-color-fg-gray: #e2e8f0;`)
- They are **not** in the `--obnotion-*` namespace, which is what the packet's token work and its audits
  read (191 `--obnotion-*` declarations; D9's register, iteration 4's DS-2, all keyed on that prefix).
- A collision is documented in place, `styles.css:178-182`: *"The GRAY ramp, not the slate one. Both
  entries were built on `#64748b` with a `#334155` foreground, so a reader who picked 'slate' got a chip
  indistinguishable from 'gray' — the picker offered a choice it could not express. Measured before this
  change: `gray ≡ slate (rgb(51, 65, 85))` in the light theme, on both the chip and the swatch."*
- The consumer classes are spread across the stylesheet: `.obnotion-option-color-gray` (`:7777`),
  `.obnotion-num-color-gray` (`:6262`), `.obnotion-displayopt-swatch.obnotion-option-color-gray`
  (`:6418`), `.obnotion-modal .status-color-gray` (`:8104`).
- Assertion coverage: `tools/live/sheet-grammar.mjs` mentions `option-color`/`status-color` **3 times** —
  a registry entry (`:128`), a menu-role name list (`:255`) and an import (`:549`) — and none is a
  colour assertion. `tools/live/render-assertions.mjs` has **1** mention.

**Finding.** The colour-role layer is real, theme-paired and data-driven — and it sits entirely outside
the system the packet audits and the lane asserts. Two consequences. First, the rubric's `Colour` row
(*"Text, secondary, divider and accent all read correctly"*) and `018`'s ClickUp status-coloured pill
have no measurement behind them: a status chip that is the wrong hue, or a dark theme where a chip's
foreground fails contrast, is invisible to every gate. Second, the one defect the layer has already been
caught for — `gray ≡ slate` in light — was caught by a human read of the swatch grid, which is the class
of evidence D1 demotes to a floor. And the `slate` role's existence means the role count is not nine;
`OPTION_COLORS` is the authority and the packet's documents never name it.

**Proposed text** — a colour-role register for the packet, and a lane clause:

```markdown
### The colour-role register (`plan.md` §3B)

Status and option colours are roles, not literals. The system today is
`STATUS_COLORS` (`src/data/column-types.ts`) → `OPTION_COLORS` → `.obnotion-option-color-<role>` /
`.obnotion-num-color-<role>` / `.status-color-<role>` → the token pair
`--status-color-fg-<role>` / `--status-color-bg-<role>` defined per theme in `styles.css` (light
`~:183`, dark `~:1050`).

Two changes make it part of this packet's system rather than beside it:

1. **Alias the roles into the namespace the packet audits.** Each role gains a `--obnotion-status-role-<role>`
   alias whose value is the existing pair, so a `--obnotion-*` audit can see the layer and the D9 source
   column can name a role (`Source: ClickUp (status pill) → --obnotion-status-role-*`).
2. **Assign each role a contrast floor and a both-theme assertion.** For every role: the chip's
   foreground clears **4.5:1** against its own background in both themes, and the swatch grid's roles are
   **pairwise distinguishable** — the `gray ≡ slate` collision is the worked failure, and the clause
   that catches it is a pairwise distance check between `--status-color-fg-*` values in each theme.
```

```markdown
| **LC-7** | Every option/status role used by a surface mounted in this child resolves to a token pair in **both** themes, and the chip's foreground clears **4.5:1** against its background. Swatch grids additionally pass a **pairwise distinguishability** check — no two role foregrounds within 6/255 per channel in either theme | computed foreground/background per role per theme; pairwise distance across the role set | all roles ≥ 4.5:1; 0 role pairs within 6/255 |
```

**Correction to iteration 4.** DS-2 said the nine swatches read the **host** `--status-color-fg-*` tokens.
Measured now: those tokens are defined **inside this plugin's stylesheet** (`styles.css:183-202` light,
`:1050` dark), not inherited from Obsidian. The finding survives in a sharper form — the layer is the
plugin's own and it is *unnamespaced*, which is why no `--obnotion-*` audit sees it — and the "host
dependency" half of DS-2 is withdrawn.

**Confidence:** high (values and their two definitions are quoted; the lane's non-coverage is counted);
the 4.5:1 and 6/255 numbers are proposals, the first being the standard floor and the second chosen to
catch the recorded `gray ≡ slate` case, whose measured separation was 0/255.

---

## Y-2 · Typography is literal-driven: ~275 hard-coded sizes against 102 token uses, and no step for D7's 17pt

**Evidence.**

- Literal `font-size: <n>px` declarations in `styles.css`, by value: **12px ×117, 11px ×66, 13px ×48,
  16px ×15, 10px ×6, 14px ×4**, then 22px ×3, 26px, 18px, 15px — **≈275 in total**.
- Token-driven: `font-size: var(--obnotion-font-…)` **102** uses; `font-size: var(--font-ui-…)` **45**.
- The scale itself: `--obnotion-font-xs: 11px`, `-sm: 12px`, `-md: 13px`, `-base: 14px`, `-lg: 16px`
  (`styles.css:59-75`), with `-lg-weight: 600` and per-step line heights and one `-xs-weight`.
- D7's remediation register (`roadmap.md` §6A, 2026-09-11) names *"row label 17pt regular, row value
  17pt secondary"* — **17px is not a step**, and the only 17-ish literal is a single `15px`.
- The lane's own comment records the nearest host step (`sheet-grammar.mjs:359`): *"`--font-ui-small` at
  the operator's 16px default (15px) and at a size proven to overflow…"*.

**Finding.** D7 asked for a typography change on the one sheet whose rows were measured, and the
stylesheet has no step to express it: 102 rules read the token scale, ~275 read literals, and 45 read the
host's UI tokens — three sources for one property. A child told to hit "17pt regular" will either add a
sixth literal or add a host token; either way the next child re-invents it, and the rubric's `Type` row
(*"Scale and weights read as the reference's"*) has no scale to read against. The literal counts also show
*where* the packet's typographic mass is: 12px and 11px together are 183 declarations, i.e. most of the
sheet chrome is set below the D7 target and below the 17pt reference read.

**Proposed text** — the type half of the token register, plus a migration rule:

```markdown
### The type scale, extended once

| Token | Value | Who reads it | Notes |
|---|---|---|---|
| `--obnotion-font-xs` | 11px | existing | unchanged |
| `--obnotion-font-sm` | 12px | existing | the single most-used literal (117) — a child converting a 12px literal to this token changes no picture and should say so |
| `--obnotion-font-md` | 13px | existing | section labels |
| `--obnotion-font-base` | 14px | existing | |
| `--obnotion-font-lg` | 16px | existing | |
| **`--obnotion-font-row-label`** | **17px / 400 / 1.3** | sheet rows — D7's target | new; the reference's own row type |
| **`--obnotion-font-row-value`** | **17px / 400 / 1.3**, secondary ink | sheet rows — D7's target | new; same size as its label, distinguished by colour, not scale |
| `--font-ui-*` | host | 45 rules | **quarantined**: no sheet row may read a host type token (the host's size is a user setting and would make a judged capture depend on it) |

**Migration rule.** A child that touches a row converts that row's literal `font-size` to a token in
the same commit and records the count it converted and the count it left. The packet's first published
number for this is the ~275 literals; a child that converts none says so rather than leaving the count
unknown.
```

**Confidence:** high — the counts and the scale are measured; the two new tokens implement a value the
operator's own ruling already named (`roadmap.md` §6A, 2026-09-11).

---

## Y-3 · The stacking engine exists and no child re-runs it

**Evidence.**

- `tools/live/sheet-grammar.mjs` carries a stacked-pair registry: `REGISTERED_STACKED_PAIRS` with named
  pairs (*"filter property picker"*, *"filter operator picker"*, *"filter select value picker"*,
  *"filter checkbox value picker"*, *"filter conjunction picker"*, *"filter date value picker"*, *"sort
  field picker"*, *"sort direction picker"*, …), each naming its parent renderer and the child's
  selector or kind.
- It also carries the scrim and transition machinery: the parent-marking toggle
  (`is-stack-parent`, `:1492`), the transition-aware wait (`waitStackParentTransition`, *"two frames
  (`waitForStackSettle`) is long enough for the class toggle itself to commit but not for a 200ms
  transition to finish, so this waits out the transition's own declared duration instead"*), the
  scrim-ratio band (*"`.is-stack-parent`'s own bare `opacity` cannot reach 0.710 ± 0.02 for light theme
  alone"*), and a filter override for the test environment (`:1514`).
- `coverage-audit.md` §2's stacked table lists **32 paired surfaces**, each assigned to a child.
- D9's hard-constraint list: *"Stacked sheets for sub-menus and pickers, per the family's existing
  stacking model (`048`)."*
- No child's `tasks.md` names the stacked-pair registry or a stacking clause; the children that own the
  most pairs (`003` with six, `004` with two, `007`, `008`, `010`) re-run *"the `071` clauses"*
  generically.

**Finding.** Iteration 3 proposed `LC-5` as if the stacking rule had no mechanism; it has one, and it is
the richest single piece of harness machinery in the packet. The real gap is that it is the *engine*
rather than a per-child *clause*: a child can pass its own six filter-pair checks by accident because
the engine runs over the registry, and nothing tells the child which pairs are its own or what a failure
means for its DEFINE table. `003`'s own DEFINE table has no row for "condition detail opened as a
stacked sheet" even though five of its six registered pairs are exactly that.

**Proposed text** — correcting iteration 3's `LC-5` and adding a per-child task:

```markdown
| **LC-5** | Every picker or sub-menu this child's rows open **stacks**: the parent sheet stays mounted and gains `is-stack-parent`, the scrim reaches **0.710 ± 0.02** on the parent, and the child sheet mounts above it. The pairs this child owns are the `REGISTERED_STACKED_PAIRS` entries whose `parent.renderer` is one of this child's producers — the child names them in its DEFINE table and re-runs the registry unchanged | registry run over `REGISTERED_STACKED_PAIRS`; per-pair: parent count 1 → 2, parent marked, scrim in band | all owned pairs present and passing; 0 pairs silently absent from the registry |
```

```markdown
- [ ] **T0xx** List the stacked pairs this child owns: read `tools/live/sheet-grammar.mjs`'s
      `REGISTERED_STACKED_PAIRS` and filter by `parent.renderer`. Record the count in `spec.md` §13 as a
      row (*"Condition detail opens as a stacked sheet — pair registered"*), and add a clause for every
      picker this child's DEFINE table names that the registry does **not** carry — an unregistered pair
      is a picker that opens as a replace-in-place surface, which is the `071/003` recorded defect
      (`tools/live/sheet-grammar.mjs`, `spec.md` §13)
```

**Confidence:** high — the registry, the scrim band and the 32-row audit table are all in the tree; the
per-child task is the same inventory discipline the packet already applies to producers.

---

## Y-4 · The elevation ladder after D7: three surfaces, one of which is being retired

**Evidence.**

- `styles.css:106` — `--obnotion-surface-overlay: color-mix(in srgb, var(--background-primary) 95%, black);` — the sheet's canvas.
- `styles.css:108-114` — *"The grouped settings card's fill, one step lighter than the `--obnotion-surface-overlay` canvas"*, and `--obnotion-settings-card-fill: var(--background-primary);` with a dark re-declaration at `:1044` (*"`--obnotion-settings-card-fill: color-mix(in srgb, var(--background-primary) 85%, white);`"*).
- D7 retires the card: *"one canvas token, no second 'card' surface painted on top of it"*, and the
  packet's own rubric gives a card container a **0 on Frame**.
- The lane still measures the card in both directions — `sheet-grammar.mjs:1943-1946` (*"Card-vs-canvas
  relative luminance under both themes. A grouped card reads lifted only when it …"*) and `:1946`'s probe
  (*"measures the paint itself, not a token comparison, under both themes in one evaluate"*), with the
  pass rule at `:4896` (*"every card on the sheet's canvas computes lighter than the canvas it sits on,
  in both themes' own ladder direction (a darker card reads as a recessed well, not a raised group)"*).
- The recessed field that D7 keeps: *"Search fields keep their own recessed-field treatment — that is a
  control, not a grouping device"* (D7).

**Finding.** After D7 the ladder is three surfaces deep — canvas, sheet body, recessed field — and one of
those three (the card) is scheduled for removal while the lane asserts it in both themes and in both
directions. There is no document that says what remains: which token is the canvas, which is the
recessed control fill, and what the *minimum* separation between them is. `002`'s remediation shows the
cost of that absence, having tuned a step to clear a floor derived from light's reference while dark
drifted 41% (iteration 7, T-2). With the card retired, the same question reappears for the field.

**Proposed text** — an elevation section for the token register:

```markdown
### The elevation ladder (post-D7)

Three surfaces, and no fourth:

| Depth | Token | Light | Dark | Separation rule |
|---|---|---|---|---|
| Page behind the sheet | the host's own canvas + the sheet scrim | scrim ratio in `sheet-grammar.mjs`'s band | same | D6's scrim check; unchanged |
| The sheet itself | `--obnotion-surface-overlay` | `color-mix(background-primary 95%, black)` | per theme, unchanged | this is the only grouping surface. **No child paints a container on top of it** (D7) |
| Recessed control (search field, inline input) | a single `--obnotion-field-recessed` token (new), aliasing today's field treatment | one step **below** the canvas's lightness | one step **above** in dark | the control's own separation floor, asserted once, in both themes |
| ~~Grouped card~~ | ~~`--obnotion-settings-card-fill`~~ | **retired by D7** | **retired** | the token's two declarations (`styles.css:114`, `:1044`) and the lane's three card clauses are removed in the same commit as `001`'s producer change, and the css-lane release names them |
```

**Confidence:** high for the token values and the lane's card assertions; medium for the new
`--obnotion-field-recessed` token, which the recessed fields may already express well enough — the child
that owns them should confirm before a token is added.

---

## Design-system second-axis verdict

| Question | Answer |
|---|---|
| Is the colour-role layer part of the packet's token system? | **No** — `--status-color-*` is plugin-defined outside the `--obnotion-*` namespace, has one recorded collision (`gray ≡ slate`) and no lane assertion |
| Can the type scale express D7's target? | **No** — no 17px step; ~275 literals vs 102 token uses vs 45 host-token uses |
| Does stacking have a mechanism? | **Yes** — `REGISTERED_STACKED_PAIRS` + scrim band + transition-aware waits; the gap is that no child *owns* its pairs |
| Is the post-D7 elevation ladder documented? | **No** — the retired card is still asserted in both themes; the surviving recessed field has no named token |
| Corrections issued | iteration 4's DS-2 "host tokens" claim (they are the plugin's own); iteration 3's `LC-5` (the engine exists) |

## What was tried and failed this iteration

- **Hypothesis: priority is a colour role the packet must define.** Disproved — `priority` appears **0
  times in `styles.css`** and is not a board-renderer concept; the colour roles are the *option* roles
  (`OPTION_COLORS = [...STATUS_COLORS]`, `src/data/column-types.ts:205`), user-named and data-driven.
- **Hypothesis: `--status-color-fg-*` are Obsidian host tokens.** Disproved — they are defined in this
  plugin's own stylesheet for both themes. Iteration 4's DS-2 is corrected and the finding is sharpened
  to "unnamespaced" rather than withdrawn.
- **Hypothesis: the stacked-pair registry is small.** Disproved — the visible slice alone carries eight
  named pairs, and the coverage audit's stacked table has 32 rows.

## Open questions raised this iteration

1. Does the packet want the colour roles aliased into `--obnotion-*` (Y-1), or does it accept an
   unnamespaced role layer with a dedicated lane clause — i.e. is the namespace a rule or a convention?
2. `--obnotion-font-row-label` at 17px: does it apply to **every** sheet row (making 12px and 11px rows
   an exception to be justified) or only to the settings/properties sheets the operator flagged, with the
   dense sheets keeping their own step?
