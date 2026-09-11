# Iteration 7 — DEPTH, second axis: both themes, states and the dark-side comparison object

**Gap class:** DEPTH (second pass, different axis). Iteration 2 asked whether the plan names thresholds,
clauses, capture ids and rubric rows. This asks the two depth requirements the packet's own rulings
make unavoidable and no child currently satisfies: **the dark theme has no Notion reference anywhere**,
and **states are neither targeted nor scored**.

---

## T-1 · The dark column has no Notion reference, but Anytype and ClickUp both do — and the packet's own statement of the gap is over-broad

**Evidence.**

- `001/spec.md:215` — *"**The whole dark-theme column has no reference at any rung.** All three
  view-options files and all 120 `database/` files were scanned by mean luma this session and every one
  is light. Every dark target is ours, and **OC-S2** — a dark-theme operator capture — is what would
  settle it."* The frontmatter blocker repeats it: *"No dark Notion reference at any rung: 123
  candidates scanned, all light. OC-S2 settles it."*
- Measured now, across the whole tree, not the two folders that scan covered:
  - `find screenshots/notion -name "*dark*"` → **23 files**, all under
    `screenshots/notion/web/flows/switching-to-dark-mode{,-2,-3}/`. They are **desktop-web** dark-mode
    flows, so the *claim* 001 needs (no dark **iOS sheet** reference) still holds — but the sentence as
    written ("no dark-theme Notion capture exists at any rung") is falsified by 23 files in the tree.
  - `screenshots/anytype/mobile/sheets/` holds **52 dark** assets, including
    `anytype-mobile-sheet-app-settings-dark.png`, `anytype-mobile-sheet-cell-date-dark.png`,
    `anytype-mobile-sheet-cell-multiselect-empty-dark.png`.
  - `find screenshots/clickup -name "*dark*"` → **49 files**.
- D9 makes the composition per element and per theme-agnostic source; the rubric scores `Both themes`
  as one of eight rows, and D7's own rubric impact is theme-dependent by construction (the card fill
  "reads per theme", retired by D7 precisely because light and dark encode elevation in opposite
  directions).
- `002`'s remediation is the worked case of what happens without a dark reference: its `Colour 0` was
  the **dark** leg (*"the dark card fill computes `rgb(57,57,57)` against a `rgb(46,46,46)` canvas,
  11/255, visually flat"*), and the fix was to invent a dark step — *"the dark theme declares its own
  85% mix instead of borrowing the 88% modal rung — 63.75 on the 45.75 canvas, 18/255"*.

**Finding.** Two facts combine badly. First, the dark column for every Notion-sourced element is
self-derived, and the packet says so honestly; the second dark finding in the packet (`002`'s Colour 0)
was a dark-mode contrast failure that no reference could have caught and no clause predicted. Second,
the claim that *no* dark Notion asset exists is stated more broadly than the scan supports, which is
the kind of over-broad negative that a later reader will either trust (and never look) or discover as
false (and distrust the rest). Meanwhile the composition rule D9 already licenses has an obvious and
unused answer: Anytype and ClickUp carry 101 dark references between them, and a dark element whose
Notion source is light-only is exactly the case D9's per-element mixing exists for.

**Proposed text** — a **theme-composition rule** for D9, and a correction in `001/spec.md:215`:

```markdown
**Dark elements compose from a reference that has a dark capture.** An element's Source is chosen per
theme where the references differ by theme:

- `Notion` may source an element in **light only** — no dark Notion iOS sheet capture exists at any rung
  (`001/spec.md:215`: 3/3 view-options and 120/120 `database/` files, all light by mean luma; the 23
  dark-named Notion assets in the tree are three desktop-web dark-mode flows and cannot answer a phone
  sheet).
- For the **dark** capture of that same element, the Source becomes the first of: **(a)** the operator's
  own dark capture (`OC-S2`) when it arrives; **(b)** Anytype's dark equivalent
  (`screenshots/anytype/mobile/sheets/*-dark.png`, 52 assets) or ClickUp's
  (`find screenshots/clickup -name "*dark*"`, 49 assets) where one carries the element; **(c)** `internal`,
  naming the token pair and the sibling capture, with the line "our own ladder direction; no reference
  carries this element in dark" recorded in the DEFINE table's Why column.
- A DEFINE table row whose Source reads `Notion` carries **two** Source cells where the element is
  theme-dependent — `Notion (light) / Anytype (dark)` — or it states which of (a)–(c) the dark half
  takes. A single `Notion` cell covering both themes is a dark target with no reference and is a DEFINE
  failure, not an oversight to be discovered by the judge.
```

Correction for `001/spec.md:215` (and the same wording wherever it was copied):

```markdown
- **The whole dark-theme column has no reference at any rung.** All three view-options files and all
  120 `database/` files were scanned by mean luma this session and every one is light; a re-scan for
  this correction found **23 dark-named Notion assets in the tree, all desktop-web
  (`screenshots/notion/web/flows/switching-to-dark-mode{,-2,-3}/`), none an iOS phone sheet**. So: no
  dark reference for a **phone sheet** at any rung. Every dark target is ours, **OC-S2** (a dark-theme
  operator capture) settles it, and where Anytype or ClickUp carries the element in dark, that asset is
  the dark half's source per D9's theme composition.
```

**Confidence:** high for the counts (measured) and for the worked case (`002`'s quoted dark leg); high
for the rule, which formalises what D9 already licenses; medium on whether Anytype's dark assets are
structurally usable per element — each child's DEFINE step must open them before naming one.

---

## T-2 · The both-themes clause tests a floor per theme and never tests agreement, so two themes can pass while diverging 41%

**Evidence.**

- The rubric's `Both themes` row, "2": *"Light and dark are each internally consistent **and match each
  other structurally**"* (`spec.md` §5).
- The lane's actual clause, `tools/live/sheet-grammar.mjs:4106-4115`: *"L8 — the card step, both themes:
  a grouped card reads as a bounded band only when its fill clears the canvas by a step the theme can
  actually show. Light's own reference delta is 13/255, so the floor is 12/255 in every channel, for
  every carded surface"*, and its assertion:
  ```js
  const CARD_STEP_FLOOR = 12;
  …
  const flatSteps = stepReads.filter((pair) => pair[1].some((step) => step < CARD_STEP_FLOOR));
  const l8Pass = stepReads.length === 2 && flatSteps.length === 0;
  ```
- `002`'s remediation table records the outcome: *"both-themes card-step clause: **dark 18/255**, light
  12.75/255"*. Both clear 12; they differ from each other by **41%**, and dark is **38% larger than the
  reference's own 13/255** that the floor was derived from.
- The rubric's own Frame row is theme-scored too, and D7's rationale is explicitly about theme
  direction: `roadmap.md` §4 row 88 records that the dark card fill *"computes **darker** than its own
  canvas … the exact 'invert the ramp mechanically' trap `sk-design-fundamentals/color-system.md` §7
  names, masked in light theme only because light and dark themes encode elevation in opposite lightness
  directions"*.

**Finding.** The packet has a both-themes *row* and a per-theme *floor*, and nothing in between. A
child can satisfy `Both themes` by making each theme clear a floor derived from light's reference,
which is how `002` closed a Colour 0 by widening dark's step to 18/255 and leaving light at 12.75/255 —
a structural mismatch in the very dimension the row names, scored as a pass by the clause and recorded
in the child's own table as a success. This is the "green lane over a wrong picture" pattern one level
down: the lane cannot see the divergence because it never compares the two reads to each other.

**Proposed text** — amend the rubric's `Both themes` cell and add the agreement clause:

```markdown
| Row | 0 | 1 | 2 |
|---|---|---|---|
| **Both themes** | Dark or light broken | Both work, but either (a) one is inconsistent within itself, or (b) **the two diverge on any measured property by more than the reference's own theme delta** — a card step, a divider ink, a row pitch, a label size | Light and dark are each internally consistent **and agree structurally**: every measured property is either equal across themes or differs by a margin the composed reference's own two themes show |
```

```markdown
**LC-6 — theme agreement.** For every property a child measures in both themes (card/canvas step,
divider ink, row pitch, label and value type size, control heights), the two reads must **agree** or
each must fall inside the reference's own theme delta where the composed reference has both themes. A
property with one read only (light-only reference, no dark source) is recorded as `light-only,
internal dark` in the DEFINE table and is **excluded from LC-6** rather than asserted from one side.
`002`'s 18/255 dark step against 12.75/255 light is the worked failure: both clear the 12 floor and the
41% divergence is the defect.
```

**Confidence:** high — the clause's code, the floor's provenance, both reads and the rubric's wording
are all quoted; the reference-delta tolerance is the mechanism `002`'s own floor already used (light's
13/255), applied symmetrically.

---

## T-3 · `002`'s L8 passes vacuously on a card-free tree — the exact failure `001`'s guard clause exists to prevent

**Evidence.**

- `sheet-grammar.mjs:4120-4134`:
  ```js
  const cardSteps = (frame) => {
    const canvas = paintChannels(frame.canvasBackground);
    if (!canvas) return null;
    const paints = frame.sectionBackgrounds.concat(frame.addRowBackground ? [frame.addRowBackground] : []);
    return paints.map((paint) => { … });
  };
  const stepReads = [["dark", cardSteps(propertiesParity.frameDark)], ["light", cardSteps(propertiesParity.frameLight)]].filter((pair) => pair[1]);
  const flatSteps = stepReads.filter((pair) => pair[1].some((step) => step < CARD_STEP_FLOOR));
  const l8Pass = stepReads.length === 2 && flatSteps.length === 0;
  ```
  With `sectionBackgrounds` and `addRowBackground` both absent — which is precisely what D7's
  remediation produces — `paints` is `[]`, `steps` is `[]`, and `[].some(step => step < 12)` is
  `false`, so `flatSteps` is empty and **`l8Pass` is `true`**.
- `002`'s clause set (recorded in its iteration table and remediation table) is L1–L8; the child has
  **no guard clause**. `001` does: its L9 is *"*(guard)* The landed stack-row width clause fails on an
  **empty** row set rather than passing vacuously"* (`001/spec.md:576`), with the rationale at `:579`:
  *"**L9 is not decoration.** `spec-tree-layout.md` §2 records the same failure class"*.
- `002/tasks.md`'s frame-ruling remediation removes the card from `002`'s own surface
  (*"T005 gave this sheet's two groups `076/001`'s `.obnotion-settings-card` treatment; the operator has
  since ruled the card container out entirely"*), and `002`'s L1 asserts *"**0** elements with a
  card-like background/radius under the sheet body"* — so after remediation L1 reads 0 (green) and L8
  reads `[]` (green) at the same time, from opposite mechanisms.

**Finding.** The child's own frame remediation will turn its card-step clause into a
self-satisfying clause: `L8` will print `card-vs-canvas step [], floor 12` and PASS, and the
`verdict` it feeds is indistinguishable from a real pass. This is the failure `001`'s guard was written
for, and `002` does not have the guard. Worse, the *same shape* exists wherever a clause measures a
property of an element the rulings are removing: L8 is not the only clause in the packet that asserts
something about a container D7 retires (iteration 3's R-1 lists six such sites in the lane's settings
grammar).

**Proposed text** — a guard clause in `002`'s `spec.md` §13's lane list, and a rule in the packet's
constraint set:

```markdown
| **L9** | *(guard)* **Every other clause in this child fails on an empty subject set rather than passing vacuously.** L8 specifically: if the frame carries **0** section backgrounds and **0** add-row background after D7's remediation, L8 reads `N/A — no carded surface remains` and is **removed from the green set**, not counted as a pass. The child's green count is reported as `n of m` with the removals named | today L8 passes on `[]`; after remediation it must read `N/A`, not `PASS` |
```

```markdown
**A clause whose subject the rulings remove is retired, not redefined.** When a ruling (D7 here)
removes the element a clause measures, the clause is either (a) deleted in the same commit and named in
the css-lane release, or (b) converted to a `N/A` read that reports the empty set explicitly and is
excluded from the green count. A clause that keeps passing because its subject is gone is the
"vacuous pass" class `001`'s L9 guard exists to catch, and it must not be left reading `PASS`.
```

**Confidence:** high — the pass-on-empty behaviour is read directly off the clause's code path, and
both the guard precedent and the remediation that triggers it are quoted.

---

## T-4 · States are template text in all 19 children and there is no rubric row that can score one

**Evidence.**

- All 19 children carry a `## 8. EDGE CASES` section, inherited from one template. Its content, measured:
  `001` has four substantive bullets including *"Both themes, each read on its own rather than assumed
  from the other"*; `013` has two — *"A board with zero optional properties configured (empty list
  state)"* and *"A board with more properties than fit one screen (scroll behaviour, sticky header)"* —
  and `013`'s file contains no mention of `dark` at all.
- `017/spec.md` contains **0** occurrences of `dark`, and its §8 edge cases do not name an empty, error
  or over-long state for any of its eighteen sheets.
- The rubric's eight rows are Frame, Sections, Row anatomy, Controls, Type, Spacing, Colour, Both
  themes. **None of them is a state row** — a sheet whose empty state renders a card container, or whose
  over-long content pushes the terminal action off-screen, can score 14/16 while the operator's first
  tap lands on it.
- The packet's own recorded history shows states mattering: `002`'s iteration-1 `Sections 1` was a
  *content-length* failure (*"the judged captures end mid-list"*), `071/008`'s landed work included an
  empty-value placeholder on every presentation (`roadmap.md` §5.A), and `010`'s landing named *"the
  filter's empty state"* as a corpus gap that left a criterion half-proven (*"the corpus has no scenario
  for the **filter's** empty state … the packet's AC-007 stays half-proven until someone adds it"*).
- `013/tasks.md`'s DEFINE phase (T001–T003) never asks for a state list, and its §13 table has four rows
  for a sheet whose states (empty, one property, requires-confirmation) are three of the things a
  visibility panel actually shows.

**Finding.** The loop's own evidence says content length and empty states have already cost a judge
iteration and left a prior criterion half-proven, and the packet's response was to add a fixture-large
fix (iteration 5, L-4) rather than a states requirement. Because the rubric has no state row, a child
can be judged twice at ≥14/16 without anyone having opened its empty state, its single-item state or
its over-long state, and the operator's first real tap is the first time those are seen. This is D1's
original failure mode (a gate that cannot see the thing the operator sees) reproduced on a different
axis.

**Proposed text** — a states requirement in `plan.md` §2's Definition of Done and a rubric row:

```markdown
### Definition of Done (per child) — addition

- [ ] The child's `spec.md` §8 names, for **each surface it renders**, the three states it will
      photograph and judge: its **empty** state, its **single-item / shortest** state, and its
      **longest** state (the one that hits the 90svH cap or the keyboard inset), in **both themes**.
      A state the surface cannot enter is recorded with the reason, not omitted
- [ ] The judged set contains those captures by id, and the `verification.md` score table carries one
      row per state per theme — so "judge twice" is twice per state, not twice per child
- [ ] Any state whose capture does not exist is registered as a scenario first (D2); a state judged
      from a lane number alone is not judged
```

```markdown
| Row | 0 | 1 | 2 |
|---|---|---|---|
| **States** (rubric row 9; pass becomes ≥ 16/18 with no row at 0) | A named state renders a different surface shape (a card container, a missing header, an action pushed off-screen), or the state was never photographed | Every named state renders, but one differs from its siblings in frame, control kind or pitch | Empty, shortest and longest states each render on the same grammar as the main state, in both themes; the longest keeps its terminal action reachable above the cap |
```

**Note for the packet owner.** Adding a ninth rubric row changes the pass arithmetic (≥ 14/16 → ≥ 16/18),
which interacts with L-3's declared deviations. If the row is not added, the states requirement above
still stands and the state captures are scored inside `Sections` and `Spacing` with a line in each row's
justification naming which state it scored.

**Confidence:** high for the gap (no state row in the rubric; `017` and `013`'s state coverage is
near-absent; the two prior incidents are quoted); medium on the ninth row, which is a packet-owner
decision with an arithmetic consequence that is flagged.

---

## Depth verdict for both themes and states

| Requirement | Children that satisfy it |
|---|---|
| Dark-theme Source named per element (T-1) | **0 of 19** — 001 records the gap honestly and names OC-S2 |
| A both-themes clause that tests agreement, not just a floor (T-2) | **0 of 19** — one clause exists, `002`'s L8, per-theme floor only |
| A guard against a vacuous pass once D7 removes the subject (T-3) | **1 of 19** (`001`'s L9); `002` needs one and its remediation triggers it |
| Named states photographed and judged (T-4) | **0 of 19** — `001` names "both themes, each read on its own" and empty/single states in §8 but no child's judged set carries a state capture |
| A rubric row that can score a state (T-4) | **none** — the rubric has eight rows and none is a state |

## What was tried and failed this iteration

- **Hypothesis: the packet's "no dark Notion reference" claim is simply true.** Half-disproved — 23
  dark-named Notion assets exist, all in three desktop-web dark-mode flows. 001's operand (`no iOS sheet
  dark reference`) is right; the sentence's scope is not. Recorded as T-1's correction rather than as a
  dispute with the finding, which stands.
- **Hypothesis: `002`'s L8 is the only clause that will go vacuous under D7.** Not exhaustively checked
  — iteration 3's R-1 lists six lane sites keyed to the card, of which two (`:1955`, `:4929`) are
  reporting paths rather than assertions. T-3 states the general rule and names the worked case, and a
  later pass can audit the remaining sites.
- **Hypothesis: `EDGE CASES` sections are empty boilerplate in every child.** Disproved for `001`, whose
  four bullets are substantive and name both themes; the finding is scoped to what the *judged set* and
  the *rubric* can see, not to the sections' prose.

## Open questions raised this iteration

1. Does the packet add T-4's ninth rubric row (pass becomes ≥ 16/18), or keep eight rows and score states
   inside Sections and Spacing? The arithmetic interacts with L-3's declared deviations.
2. Where a Notion-sourced element has no dark reference and Anytype's dark asset is structurally
   different (a mobile app screen, not a bottom sheet), is the dark half `internal` with our own ladder
   direction, or does the element's light target bend toward Anytype so both themes share one source?
