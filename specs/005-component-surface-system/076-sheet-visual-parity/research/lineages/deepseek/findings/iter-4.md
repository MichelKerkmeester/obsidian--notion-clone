# Iteration 4 — DESIGN SYSTEM

**Gap class:** DESIGN SYSTEM — how the children connect to one token/component system; the shared
primitives they should extract rather than re-implement per sheet; the landing order that avoids
rework.

---

## DS-1 · "Sheet" is a class-name convention, not a component — and the two producers `003`/`004` must unify both bypass the shell

**Evidence.**

- `src/views/surface-shell.ts` exports the frame the ruling describes: `SHELL_RADIUS_PX = 8` (`:139`),
  `SHELL_PADDING_X_PX = 16` (`:140`), `SHELL_PHONE_CLOSE_PX = 44` (`:145`),
  `SHELL_PHONE_HANDLE_WIDTH_PT = 34` / `SHELL_PHONE_HANDLE_HEIGHT_PT = 5` (`:163-164`),
  `SHELL_PHONE_ROW_HEIGHT_PT = 50` (`:165`), `SHELL_PHONE_HEADER_HEIGHT_PT = 70` (`:166`),
  `SHELL_PHONE_DIVIDER_INSET_PT = 20` (`:167`), and `createSurfaceShell(options)` (`:469`).
- Users of `createSurfaceShell` across all of `src/`: **9 files** — `main.ts`,
  `confirm-sheet.ts`, `image-file-suggest-modal.ts`, `folder-suggest-modal.ts`,
  `markdown-file-suggest-modal.ts`, `modals/obnotion-modal.ts`, `modals/settings-sub-sheet-modal.ts`,
  `surface-shell.ts` itself and its test.
- `src/views/`: **187** `.ts` files. Files that emit a sheet row class
  (`obnotion-panel-row`, `obnotion-settings-nav-row`, `obnotion-column-manager-row`,
  `obnotion-list-row`): **29**.
- `src/views/filter-panel-renderer.ts:27` imports exactly one thing from the shell —
  `import { buildShellHeader } from "./surface-shell";` — and builds its own panel at `:178`
  (`panel = containerEl.createDiv({…})`). It never calls `createSurfaceShell` and its file contains no
  `obnotion-mobile-bottom-sheet` literal at all.
- `src/views/active-rule-popover-renderer.ts:121-122` — the surface the operator photographed —
  builds its container as
  `cls: \`obnotion-active-rule-popover obnotion-filter-panel${kind === "sort" ? " obnotion-sort-panel" : ""} is-${kind}\``,
  i.e. it **borrows the filter/sort panel's class names to look like the sheet** rather than mounting
  through any shell. It also contains no `obnotion-mobile-bottom-sheet` and no shell import.
- D2(a) requires `003`/`004` to bring both of their producers onto **one** grammar; D9's hard
  constraints (handle, 16pt inset, 44pt rows, no containers, stacking) are stated as sheet-level
  properties.

**Finding.** The packet's frame is enforced by a lane that finds `.obnotion-mobile-bottom-sheet` in the
DOM, while the components that produce sheets reach that class by three different routes (the shell,
a hand-built div, or a borrowed class list). Only 9 of the 187 view modules use the shell at all. That
makes D7/D9 unenforceable as *component* rules: `LC-3` (handle) and `LC-5` (stacking) would pass on a
surface that never went through `createSurfaceShell` only by coincidence, and `003`'s two producers
cannot be "brought onto the same grammar" by editing one of them — the grammar has no owner.

**Proposed text** — a new section in `spec.md` §3 (Architecture), and a task per affected child:

```markdown
### The frame is a component, not a class name

`createSurfaceShell` (`src/views/surface-shell.ts:469`) owns the phone frame: the handle, the 16pt
inset, the header, the close control, the scrim and the stacking parent. A surface that reaches
`.obnotion-mobile-bottom-sheet` by any other route — a hand-built panel div, or a borrowed class list
such as `active-rule-popover-renderer.ts:121`'s `obnotion-filter-panel … obnotion-sort-panel` — does
not inherit the frame and cannot be held to D7/D9 by a lane that queries the class.

**Rule.** Any child whose surface presents as a phone sheet mounts through `createSurfaceShell`.
Where a producer cannot (a modal owned by Obsidian, a popover that must position against a chip),
the child states the reason in `plan.md` §3 and the surface carries the frame's own tokens
(`SHELL_PHONE_HANDLE_WIDTH_PT`, `SHELL_CARD_INSET_PT`, `SHELL_PHONE_ROW_HEIGHT_PT`) rather than
literal numbers. `003` and `004` are the first children this binds: their two producers present the
same concept through two different routes today, which is why no `071` child could align both.
```

```markdown
- [ ] **T0xx Frame ownership.** Read `src/views/surface-shell.ts`'s exports and record, for this
      child's surface, which route it takes to `.obnotion-mobile-bottom-sheet`: `createSurfaceShell`,
      a hand-built panel div, a borrowed class list, or a host modal. If it is not the shell, either
      (a) route it through the shell in this child, or (b) record in `plan.md` §3 the reason it cannot
      and the list of frame tokens it duplicates. `003`/`004` must land on one route for both of their
      producers — a surface pair that presents identically by two different mechanisms will drift
      again at the next edit (`src/views/surface-shell.ts`, `plan.md` §3)
```

**Confidence:** high — the 9-user count, the borrowed class list and the missing sheet class are all
greps; the recommendation is a judgement call about where the frame should be owned.

---

## DS-2 · Five row heights and a type scale that cannot express the target

**Evidence.**

| Source | Value | Where |
|---|---|---|
| board card meta row | `min-height: 25px` | `012/spec.md:267`, quoting `styles.css:10190-10199` |
| shell panel row | `SHELL_ROW_HEIGHT_PX = 28` | `surface-shell.ts:143` |
| token default | `--obnotion-row-height-default: 34px` | `styles.css:173`; ADR-D records 34px as the Properties sheet's density |
| lane floor | `ROW_PITCH_FLOOR_PX = 44` | `sheet-grammar.mjs:280`, applied to `owned-menu` rows only |
| shell phone row | `SHELL_PHONE_ROW_HEIGHT_PT = 50` | `surface-shell.ts:165` |
| D9's hard constraint | *"Rows at 44pt or taller"* | `decision-record.md` D9 |
| D7's remediation register | *"row height 44-48pt"*, *"row label 17pt regular, row value 17pt secondary"* | `roadmap.md` §6A 2026-09-11 entry |
| the type scale | `--obnotion-font-xs 11 / -sm 12 / -md 13 / -base 14 / -lg 16` | `styles.css:59-75` |
| the lane's note on the host scale | *"`--font-ui-small` at the operator's 16px default (15px)"* | `sheet-grammar.mjs:359` |

Two further measurements: `SHELL_PHONE_DIVIDER_INSET_PT = 20` is **exported and read by nothing** —
`grep -rn SHELL_PHONE_DIVIDER_INSET_PT src/ tools/` returns only its declaration (`surface-shell.ts:167`)
— while the lane's own divider clause asserts *"a 1px hairline inset 16px from the sheet's left edge
and 0px from its right"* (`sheet-grammar.mjs:1723-1726`) and D9 mandates **16pt**. And the colour roles
the rubric scores are host-owned: the nine option swatches read the **host** tokens
`--status-color-fg-{gray,brown,orange,yellow,green,blue,purple,pink,red}` (`styles.css:6418-6426`),
not a `--obnotion-*` role set.

**Finding.** The children are each tuning rows against a different constant, and three of the constants
disagree with the rulings that bind them. `17pt` — the one number the operator's own remediation named
— cannot be expressed at all: the scale jumps 16px → nothing, and the lane's own comment shows the next
scale up is a *host* token. A child told to hit 44–48pt with a 17pt label has no token to reach for, so
it will hard-code pixels (as `styles.css` already does in 76 `border-bottom` sites — see DS-3), and the
next child will hard-code a different number. The 20-vs-16 inset and the host-colour dependency are the
same class of defect one level down.

**Proposed text** — a token-reconciliation block for the packet, to sit in `plan.md` as a new §3A:

```markdown
### 3A. The shared token register — one value per concept, and where it lands

Five row heights and two divider insets are in play across the packet today. This register settles
which value each concept has, and every child reads it rather than inventing a number. A row of this
table is changed by a Proposed ADR, never inside a child.

| Concept | Token / constant | Value | Owner | Notes |
|---|---|---|---|---|
| Phone sheet row pitch | `--obnotion-sheet-row-min-height` (new) | **44px** | `styles.css` `:root` | D9's floor. Every sheet row reads this; `ROW_PITCH_FLOOR_PX` = 44 becomes the clause, not a second constant |
| Settings / properties row height (D7 remediation register) | `--obnotion-sheet-row-height-tall` (new) | **48px** | `styles.css` `:root` | D7's 44–48pt band, top of band for the two sheets the operator flagged; provisional until the C-captures land |
| Board card meta row | `--obnotion-board-card-row-min-height` (new) | **25px → 44px at touch** | `012` | The card is a *card*, not a sheet: it keeps its own density on pointer devices and raises to the floor on coarse pointers. `012` decides the number; the *rule* (floor on touch) is D9's |
| Shell panel row | `SHELL_ROW_HEIGHT_PX` | 28 | `surface-shell.ts` | Unchanged — desktop popover density, out of the rubric's scope |
| Row label | `--obnotion-font-row-label` (new) | **17px / regular / 1.3** | `styles.css` `:root` | The constant the operator named. Proposed because the scale's top step is 16px and the next step up is a host token |
| Row value | `--obnotion-font-row-value` (new) | **17px / secondary colour / 1.3** | `styles.css` `:root` | Same size, secondary colour — the reference's hierarchy is colour, not scale |
| Divider | `--obnotion-divider-hairline` + `SHELL_PHONE_DIVIDER_INSET_PT` | **1px / 16pt** | `styles.css` + `surface-shell.ts:167` | `SHELL_PHONE_DIVIDER_INSET_PT` currently reads **20** and is used by nothing; correct it to 16 or delete it, and let the lane's own grammar (`sheet-grammar.mjs:1723`) be the single source |
| Status / priority colour role | `--obnotion-status-role-{neutral,info,positive,warning,danger}` (new) | mapped onto the host `--status-color-fg-*` | `styles.css` `:root` | Today nine swatches read the host tokens directly. A role layer lets `018`'s ClickUp status pill and the rubric's Colour row be asserted per theme; the host tokens stay the *implementation* |
```

**Confidence:** high for the measurements (each has a file:line); the specific token names and the
48px choice are proposals to be confirmed by `001`'s own DEFINE step against the operator capture.

---

## DS-3 · Two divider mechanisms, one of which cannot produce D7's geometry

**Evidence.**

- The geometry D7 requires: *"hairline dividers: inset from the leading edge to the label, full-bleed
  to the trailing edge"* — which means a rule that starts *inside* the row box.
- The lane reads divider geometry from a pseudo-element: `sheet-grammar.mjs:1751`
  `const dividerStyle = getComputedStyle(row, "::before")` and records `height`, `left`, `right`,
  `width`, `color` (`:1769-1774`).
- The stylesheet's dominant mechanism is `border-bottom`: **76** `border-bottom` declarations, most
  reading `--obnotion-border-subtle` (`styles.css:99`: a `color-mix` at **40%** of
  `--background-modifier-border`).
- Actual samples: `:7264`, `:8879`, `:10035` all use `border-top`/`border-bottom: 1px solid
  var(--obnotion-border-subtle)` on row-like selectors.
- `.obnotion-panel-row` — the closest thing to a shared row — carries **82** rules in the stylesheet.
- The lane's own comment (`:572-574`) notes a real cross-host hazard: *"the sheets' own
  `--obnotion-border-subtle` mixes this host token at 40%, and without it the section dividers
  computed to a 0px width here."*

**Finding.** A `border-bottom` on a row cannot be inset from the leading edge; the two mechanisms are
not interchangeable, and only the pseudo-element path is legible to the lane. So a child that hits its
target with `border-bottom` will look right to the eye and be invisible to `LC-2` — the precise
"green lane over a wrong picture" inversion D1 was written to prevent, running the other way. The
`color-mix` at 40% compounds it: the divider's *colour* depends on a host token, so a both-themes
clause that compares divider colour across themes can pass or fail on the host's dark theme rather
than on anything the child did.

**Proposed text** — for the shared token register (DS-2) plus one clause in `spec.md` §5's constraint
set:

```markdown
| **LC-2a** | The divider is a **pseudo-element or a dedicated divider node**, never a `border-*` on the row: a row whose divider is painted as its own `border-bottom` cannot carry the leading inset D7 requires | `getComputedStyle(row, "::before")` content ≠ `none`, or a sibling element with `height ≤ 1px` | the pseudo-element path, `left` = the row's leading inset, `right` = 0 relative to the sheet's trailing edge |
```

and one note for the children's plans:

```markdown
**Dividers are not row borders.** D7's divider is inset from the leading edge, so it cannot be a
`border-bottom` on the row box. The packet's mechanism is the row's `::before` (what the lane already
reads at `sheet-grammar.mjs:1751`) or a dedicated divider node. The 76 existing `border-bottom:
1px solid var(--obnotion-border-subtle)` rows in `styles.css` are the migration backlog; a child
converts the rows it owns and records the count it did not.
```

**Confidence:** high — mechanism counts and the lane's read are measured; the "most of the 76 are
sheet rows" claim is **not** verified line by line and is deliberately phrased as a backlog to be
counted by the children rather than as a number.

---

## DS-4 · Eleven row classes where there should be two primitives

**Evidence.** Row-shaped classes and their rule counts in `styles.css`:
`obnotion-panel-row` 82, `obnotion-column-manager-row` 22, `obnotion-group-order-row` 16,
`obnotion-settings-nav-row` 11, `obnotion-invalid-event-row` 11, `obnotion-table-row-drag-handle` 9,
`obnotion-database-popover-row` 8, `obnotion-formula-function-row` 8, `obnotion-status-option-row` 7,
`obnotion-sort-delete-row` 7, `obnotion-list-row` 7, `obnotion-status-preset-manager-row` 6. Files
emitting one of them: **29**.
`src/views/record-surface/` holds the only serious row *builder* set (`property-row.ts`,
`add-property-row.ts`, `hidden-properties.ts`, `cell-editor-*.ts`, `type-picker.ts`, plus five test
files) — and it builds record rows, not sheet rows.

**Finding.** The packet's rubric scores the same five things per row (leading icon, label, trailing
element, control kind, pitch) on eleven surfaces whose rows are built by eleven different class names
and, in most cases, inline in the producer. Each child will re-derive the row; D4's "one sheet at a
time" then means the *eleventh* sheet gets the row the first one settled by accident, not by design —
and the css-lane triplet serialises `styles.css` the *file*, not the *primitive*, so nothing prevents
`005` from re-declaring what `001` just settled.

**Proposed text** — the extraction table, for `spec.md` §3 or a new `design-system.md` at the packet
root:

```markdown
### The primitives to extract, and which child extracts each

Two primitives carry every sheet row in this packet. A child extracts the one it needs **before** it
dresses its own rows, so the eleventh sheet inherits a settled row rather than a local copy.

| Primitive | Shape | Extracted by | Consumers (re-run it rather than re-declare) |
|---|---|---|---|
| `obnotion-sheet-row` | `display: flex`, `min-height: var(--obnotion-sheet-row-min-height)`, `padding-inline: 16px`, a `::before` divider inset to the label, leading icon slot 20–22px, label `--obnotion-font-row-label`, trailing slot | **`001`** (the first child, and the sheet whose vocabulary the rest inherit — `spec.md`'s own phase-handoff criterion) | `002`–`011`, `013`–`017` |
| `obnotion-sheet-section` | heading (plain, small, secondary, `text-transform: none`) + rows + divider, **no container** | **`001`** | `002`–`011`, `013`–`017` |
| `obnotion-sheet-nav-row` | the `obnotion-sheet-row` variant with a trailing value + chevron and a tap target that opens a stacked sheet | `001` (settings) | `005`, `006`, `007`, `011`, `016` |
| `obnotion-sheet-toggle-row` | trailing switch, terminal | `001` | `002`, `005`, `008` |
| `obnotion-sheet-picker-row` | the row that opens a picker; the picker itself is `obnotion-sheet-row` inside a stacked sheet | `003` (filter's pickers are the most numerous) | `005`–`007`, `010`, `013`, `014`, `015`, `017` |

The shell's own constants (`src/views/surface-shell.ts:139-169`) are the second half of the system:
frame, handle, header, edge control. A primitive that needs a frame number reads the shell's export;
a primitive that needs a row number reads the token register (DS-2). Neither reads a literal.
```

**Confidence:** medium-high — the class inventory and the 29-file count are mechanical; the proposed
primitive set and its owners are a design judgement, and the "extract in `001`" ordering depends on
`001`'s judge passing first, which has not happened.

---

## DS-5 · The landing order the packet implies but does not state

**Evidence.**

- D4: *"The eleven children run sequentially in their numbered order"*, with the reason: *"the children
  share `styles.css` — which this repository serialises through a css-lane acquire/edit/release
  triplet, one holder at a time — and they share the row vocabulary `001` establishes."*
- The Phase Handoff Criteria: *"001 → 002 | The settings sheet's judge passes twice, and its DEFINE
  table's card/row/trailing-element vocabulary is the one every later child reuses"* (`spec.md`).
- `013`–`017` are explicitly independent: *"each holds the shared css-lane triplet in its own turn and
  does not gate or depend on `001`-`012`'s sequence"*.
- `styles.css` is 24,967 lines; `--obnotion-*` declarations: 191; per-sheet blocks still large
  (`.obnotion-icon-picker-popover` 71 rules, `.obnotion-view-config-panel` 58,
  `.obnotion-column-display-style-popover` 42, `.obnotion-cell-edit-popover` 35,
  `.obnotion-record-detail-panel` 27, `.obnotion-column-menu-subpopover` 24,
  `.obnotion-column-manager` 20, `.obnotion-color-picker-popup` 18).

**Finding.** The packet's order is optimised for *the operator's reading order* and its independence
rule lets five coverage-audit children edit the same shared stylesheet as `001` without inheriting
anything `001` settled. The declared handoff (*"its vocabulary is the one every later child reuses"*)
is a prose expectation with nothing enforcing it, and the five independent children are the ones with
the largest per-surface CSS blocks. So the packet will most likely produce: `001`'s primitive, then
`003`–`011` reusing it, then `013`–`017` building four more row variants because they were declared
independent — and a `018`/`019` board retarget that re-touches `styles.css` after all of it.

**Proposed text** — an insertion into `plan.md` §4 before the child table:

```markdown
### Landing order within the shared files

The child order above answers *what the operator reads next*. It does not answer *what lands in
`styles.css` next*, and two rules govern that:

1. **Primitives before consumers.** `001` lands `obnotion-sheet-row`, `obnotion-sheet-section` and
   the token register (DS-2) **before** any of `002`–`011` begins CREATE. Until then a later child may
   PLAN but not touch the stylesheet. This is the mechanical form of the handoff criterion already
   written in `spec.md` ("its DEFINE table's card/row/trailing-element vocabulary is the one every
   later child reuses").
2. **The independence clause is about gating, not about styling.** `013`–`017` may run in any order
   relative to `001`–`012`, but each re-runs the shared constraint clauses (`LC-1`–`LC-5`) and
   consumes `obnotion-sheet-row` rather than declaring a fourth row shape. If one of them genuinely
   needs a new primitive, it is added **once** in that child and registered in the table above, so the
   next child reads it instead of discovering it.

Board children (`012`, `018`, `019`) are the one deliberate exception: a board card is not a sheet
row, and `012`'s card grid keeps its own density on pointer devices (DS-2's register). `018`'s
column-header work lands **before** `019`'s drag work, per `019`'s own D3.
```

**Confidence:** medium — the defect classes are evidenced (two mechanisms, five heights, eleven row
classes, five independent children on one stylesheet); the ordering proposal is a process judgement
that trades a little latency for a large reduction in rework.

---

## Design-system connection map (iteration 4)

```
frames      surface-shell.ts  ──►  9 users of createSurfaceShell
   │                                  (main, confirm-sheet, 3 suggest modals,
   │                                   folder-suggest, DbModal, settings-sub-sheet)
   │            hand-built panels ──► filter-panel-renderer.ts:178
   │            borrowed classes ──► active-rule-popover-renderer.ts:121
   ├── tokens  styles.css :root  ──► 191 --obnotion-* declarations
   │             type scale  xs11 sm12 md13 base14 lg16   ← no 17px step (D7 names one)
   │             row heights 25 / 28 / 34 / 44 / 50       ← five values, no register
   │             divider      ::before (lane-read) vs 76 border-bottom sites
   │             colour roles host --status-color-fg-*    ← no --obnotion-* role layer
   ├── rows    obnotion-panel-row (82) + 10 sibling row classes, 29 emitting files
   │             record-surface/ owns real row builders, for record rows only
   └── lane    sheet-grammar.mjs: 3 frame shapes, 1 pitch surface, 1 handle negative control,
                                   6 card-premise sites D7 must invert
```

**Landing order that avoids rework (recommended):**
token register → `obnotion-sheet-row` / `obnotion-sheet-section` in `001` → `001` judge ×2 →
`002`–`011` consume → `012` independently (card, own register row) → `013`–`017` consume and, if
needed, add one primitive each → `018` then `019`.

## What was tried and failed this iteration

- **Hypothesis: the sheets all mount through `createSurfaceShell`, so the frame is already one
  component.** Disproved — 9 users in `src/`, and both of `003`/`004`'s producers bypass it, one by
  building its own panel and one by borrowing another sheet's class list.
- **Hypothesis: `SHELL_PHONE_DIVIDER_INSET_PT` is the packet's divider inset and the lane's 16px is
  the drift.** Disproved — the constant is read by nothing (`grep -rn` returns only its declaration),
  while the lane asserts 16px and D9 mandates 16pt. The dead constant is the drift, not the lane.
- **Hypothesis: `--obnotion-row-height-default: 34px` violates D9's 44pt floor outright.** Disproved as
  stated — `34px` is the *compact* table density ADR-D settled, not a phone sheet row, and D9's floor
  is written about sheets. The finding is retained in its narrower form: five row heights with no
  register saying which applies where.

## Open questions raised this iteration

1. Does `001` own the shared row primitive, or does the packet need a `000-primitives` child that lands
   the token register and the two row primitives before `001` begins? The current map gives `001` that
   role implicitly through the handoff criterion, with no task carrying it.
2. Is a `--obnotion-*` status/priority role layer wanted at all, or is the host's `--status-color-fg-*`
   the intended implementation (in which case the rubric's Colour row must say so, and the both-themes
   clause must compare against the host's own dark values)?
