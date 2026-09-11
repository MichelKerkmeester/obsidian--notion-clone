# Iteration 3 — REFERENCE COMPOSITION

**Gap class:** REFERENCE COMPOSITION — per-element Source columns, the ClickUp board lead, the D7
frame ruling's mechanical presence in every child, and contradictions that belong in `roadmap.md` §7
as Proposed ADRs.

---

## R-1 · The frame ruling is 19 prose mentions, 0 lane clauses and 0 stylesheet edits — and the lane still *requires* the card it retires

**Evidence.**

- D7 (`decision-record.md`): *"Sheet content sits on the **plain sheet background** … Rows are
  separated by **hairline dividers** … **No rounded or lighter container of any kind around a row or a
  value.**"* And its rubric clause: *"a card container around rows or values scores **0** on Frame
  regardless of how well it otherwise matches the reference."*
- The lane's card premise, verbatim in the comment above the code that reads it
  (`tools/live/sheet-grammar.mjs:1794-1797`): *"When the sheet groups its sections into cards the
  heading sits above its own card container — the card boundary is the separator the reference uses, so
  the heading's previous sibling being a card means no hairline is owed."*
- The clause that encodes it: `:1815` — `dividerExpected: titlePrev != null &&
  !titlePrev.classList.contains("obnotion-settings-card")`.
- The collectors that key on the card: `:1823` (`cards`, `.obnotion-view-config-body >
  .obnotion-settings-card`), `:1955` (`if (!grammar || grammar.cards.length === 0) return null` — the
  whole card-grammar report short-circuits), `:4871` (`settingsCardList`), `:4890` (`titlesInsideList`
  from `aboveCard` — the *inverse* of D7), `:4929` (`parityCardCount`).
- The producer still paints the card: `styles.css:114` and `:1044` still declare
  `--obnotion-settings-card-fill`; `:12384`–`:12534` still carry nine `.obnotion-settings-card` rules;
  `:13793` still documents the grouping as landed.
- The children: `001` and `002` have remediation blocks that remove the card; `003`–`011` carry a
  one-line pointer and no task; `013`–`019` inherit the frame entirely from the ruling text.
- Where the ruling's own constraints are asserted today: `FRAME_SHAPE_SURFACES` covers **3** surfaces
  (`tools/live/sheet-grammar.mjs:188`); the 44px pitch floor is asserted on **one** surface
  (`ROW_PITCH_SURFACE` = `owned-menu`, `:279-280`); the grab handle is asserted only as a negative
  control on `sort-panel` (`NEGATIVE_CONTROL`, `:457`).

**Finding.** D7 is the ruling with the largest blast radius in the packet (it retires a landed `071`
landing, a dark-theme ADR and the parent's own §4 reference reading), and it has reached the tree as
prose only. Three consequences, in order of cost:

1. **The lane actively fights the remediation.** `001`'s T015–T019 run the *rewritten* `spec.md`
   clauses RED and then remove the producer card — but the lane's own scaffolding still computes
   `dividerExpected` as *false* after a card and `aboveCard` as the desired state. A D7-compliant tree
   makes `cards` empty, which short-circuits `:1955`'s report entirely; any surviving assertion that
   reads `cards.length` (such as the landed "2/2 cards" clause) then fails on a correct tree, and the
   `titlesInsideList` clause reads the *opposite* of what D7 wants. The remediation task text names
   `sheet-grammar.mjs` but not the six sites to invert.
2. **No child can be judged green on a rule it does not assert.** The rubric's Frame row is worth 0
   on a card, but no lane clause anywhere says "0 card containers" except `001`'s rewritten L1. So a
   D7 violation introduced by a later child (or by a stylesheet edit landing after `001`) is invisible
   until an image judge happens to open the right capture.
3. **The hard constraints D9 states as always-true are asserted on three surfaces out of 87.** D9's
   list — *"No grouping containers … Stacked sheets for sub-menus and pickers … A grab handle on every
   phone sheet. 16pt inset. Rows at 44pt or taller"* — is a packet-wide contract with a three-surface
   lane.

**Proposed text.**

(a) A packet-wide clause set, appended to `spec.md` §5 after the rubric as the floor every child
re-runs:

```markdown
### The shared constraint clauses (every child re-runs these unchanged)

These five clauses are the mechanical half of D7 and D9. They are written once here and re-run by
every child in its own surface; a child that cannot run one says so in `verification.md` and names the
reason, rather than skipping it silently.

| # | Clause | Measure | Target |
|---|---|---|---|
| **LC-1** | **0** elements inside the sheet body paint a rounded or lighter container around a row or a value | every descendant of the sheet body whose `border-top-left-radius > 0` **and** whose computed background differs from the sheet's own canvas token | 0 in **both** themes |
| **LC-2** | Every adjacent row pair is separated by exactly **1** hairline divider: `::before` or a sibling element, `height ≤ 1px`, `left` inset equal to the row's own leading inset, `right` at the sheet's trailing edge | computed geometry per pair | 1 per pair, within 0.5px |
| **LC-3** | A grab handle exists and its rect is **34 × 5pt** at a **6pt** drop below the sheet's top edge | `getBoundingClientRect()` on `.obnotion-mobile-bottom-sheet-handle` | present, geometry within tolerance |
| **LC-4** | The sheet's leading inset computes **16px** and every row clears **44px** pitch | body `padding-inline-start`; per-row `getBoundingClientRect().height` | 16px / ≥ 44px |
| **LC-5** | Any picker or sub-menu opened from a row **stacks** — a second sheet mounts over the first, and the first stays mounted beneath it | count of `.obnotion-mobile-bottom-sheet` nodes before/after the tap | 1 → 2, parent retained |

LC-5 is the clause the family has never had: `048` landed the stacking model and the lane asserts the
*visual* result of stacking (scrim ratio, `.is-stack-parent`), never the *act* of replacing rather than
replacing-in-place — which is the defect `071/003` recorded when the property-type picker "traded its
whole form for a second replaced-in-place surface" (`roadmap.md` §4 row 75).
```

(b) The lane-inversion task, for `001` (and the identical block for `002`, and for every child that
later touches the settings grammar):

```markdown
- [ ] **T015a Lane inversion (D7).** Before running T015's RED numbers, invert the six sites in
      `tools/live/sheet-grammar.mjs` that encode the card premise, all of them in the settings-sheet
      grammar reader and its reporting:
      `:1815` `dividerExpected` — delete the `.obnotion-settings-card` exception; a heading always owes
      its hairline now.
      `:1816-1818` `aboveCard` — delete; the field has no meaning under D7.
      `:1823` `cards` — keep the collector but rename its meaning in the caller: it now counts
      **violations**, and every clause that read it as an achievement inverts (`:4871`
      `settingsCardList`, `:4929` `parityCardCount`).
      `:1955` — the early return on `cards.length === 0` now skips the *violation* report; replace it
      with the divider-geometry report so an empty card list is the passing state.
      `:4890` `titlesInsideList` — invert: a section title whose next sibling is a container is now the
      failure, not the achievement.
      `:4841` `sectionsDividers` — the filter is correct once `:1815` is inverted; confirm it reports
      ≥ 4 dividers rather than 0.
      Run the lane after the inversion against the **unchanged** tree and record that it fails on the
      new clauses and passes the old ones it did not touch — a lane that fails everywhere proves
      nothing (`tools/live/sheet-grammar.mjs`)
```

**Confidence:** high — every line number and its current behaviour is quoted from the file; the
inversion list is derived from the grep of `.obnotion-settings-card` in the lane.

---

## R-2 · D9 says boards lead with ClickUp; `roadmap.md` §7.21 carves `012` out to Anytype — the two texts disagree and neither wins by precedence

**Evidence.**

- D9: *"**For boards: ClickUp leads.** This is a **Proposed ADR** against `056-board-anytype-parity`'s
  landed Anytype board rulings … `076/012-board-card-fields` and any future board child read ClickUp
  first, Anytype and Notion as secondary references"* — naming `012` explicitly.
- `roadmap.md:2490-2493`: *"**This does not reopen `012`'s single-column field-layout rule**, which
  stays judged against Anytype exactly as ADR-008 (via §7.20) left it — `018`'s own spec explicitly
  does not re-target that rule."*
- `012/spec.md:261`: the DEFINE table's only reference column is `Anytype (structural)`, read from
  `anytype-mobile-set-kanban-light.png`; `012/spec.md:264` says of the value row *"Value keeps its
  existing 1-line clamp and left-align/word-break-normal rule (`056` ADR-008, unchanged)"*.
- `012` mentions ClickUp four times but never as a Source.
- `019/spec.md:246`: `| Element | Ours today | ClickUp (structural) | Target | Source |` — a full
  ClickUp composition. `018/spec.md:246` likewise.

**Finding.** Two binding texts give `012` different reference owners. D9 names `012` as a board child
that reads ClickUp first; §7.21 says `012` stays on Anytype. Both were written in the same session by
the same author (the 2026-09-11 05:36–05:38 window). §7.21's scoping is the *narrower* and therefore
more defensible reading — but it lives in the roadmap, while the decision record is what every child
cites, and D9's own text names `012` by number. An executor reading D9 alone would rewrite `012`'s
reference to ClickUp and reopen a settled `056` ruling; an executor reading §7.21 alone would leave
`012` non-compliant with D9's board clause. Because the dispute is between a decision record and a
roadmap section, no precedence ladder in the packet resolves it — which is exactly the class of
conflict §7 exists to record and `decision-record.md` D15 says must become a Proposed ADR rather than
an amendment.

**Proposed text** — append to `roadmap.md` §7 as **§7.22** (Proposed, awaiting the operator):

```markdown
### 7.22 `076` D9's board clause and §7.21's `012` carve-out disagree about `012`'s reference — Proposed

Opened 2026-09-11 by the `deepseek` research lineage's reference-composition audit.

| Fact A | Fact B | Who raises it |
|---|---|---|
| `076/decision-record.md` **D9**: *"**For boards: ClickUp leads.** … `076/012-board-card-fields` and any future board child read ClickUp first, Anytype and Notion as secondary references"* | `roadmap.md` **§7.21**: *"This does not reopen `012`'s single-column field-layout rule, which stays judged against Anytype exactly as ADR-008 (via §7.20) left it"* | `076`'s own decision record vs this roadmap's §7.21 |

**Both are the same session's rulings and neither is wrong on its own facts.** D9's board clause is
about a board's *presentation target*; §7.21's carve-out is about `012`'s **field-layout** rule, which
`056` ADR-008 and `045`'s field-names leg already settled and which §7.20 records as a conflict
`045` silently created. The resolution the operator is asked to confirm is one of two shapes:

- **(i) Narrow D9's board clause** — add one sentence to D9: *"`012`'s single-column field-layout rule
  is not a board-styling surface: it is the field grid, settled by `056` ADR-008 and §7.20, and stays
  judged against Anytype's own full-width row."* `012`'s DEFINE table then keeps `Anytype (structural)`
  as its reference column and adds a `Source` column naming Anytype for the layout rows with that reason.
- **(ii) Extend the ClickUp lead over `012`** — `012`'s DEFINE table gains `ClickUp (structural)`
  columns and its Target column is re-derived against `screenshots/clickup/ios/views/*`, accepting that
  this partially reopens `056` ADR-008's `word-break` settlement.

Until the operator answers, `012` proceeds under **(i)** — the narrower reading and the one §7.21
already states — and its `spec.md` §13 carries a line saying so.
```

**Confidence:** high that the contradiction is real and quotable; the recommendation of (i) is a
judgement call, marked as such.

---

## R-3 · With a Source column added, eleven children also need their reference *columns* renamed — the current headings hard-code one app

**Evidence.**

- `002/spec.md:321` — `| Element | Ours today | Notion (R-1/R-2, structural) | Target |`.
- `004/spec.md:237`, `005/spec.md:238`, `006/spec.md:235`, `007/spec.md:244`, `008/spec.md:238`,
  `009/spec.md:242`, `010/spec.md:247`, `011/spec.md:241` — all `| … | Notion (structural) | … |`.
- `012/spec.md:261` — `| … | Anytype (structural) | … |`.
- `001/spec.md:345` — `| # | Group | Leading icon | Label | Trailing element | Tap opens |` — no
  reference column at all; its references are prose and images.
- `005/spec.md:238-246` shows the honest consequence of the single-app column: three rows read
  *"`unreadable at 299×678`"* and end `TBD — needs operator capture`, because the only reference
  column available to them is the thumbnail that cannot answer.
- D9: composition is per element, *"frame/radius/handle, header (title plus its control), row anatomy,
  dividers, selection state, primary action, and pickers/stacking are each chosen independently"*.

**Finding.** Adding a Source column to a table whose reference column is titled `Notion (structural)`
produces a contradiction in the header itself: the Source cell may say `ClickUp` or `Anytype` while the
only reference column is Notion's, so the row's evidence and its claim have different owners. `005` is
the clearest case — three of its rows are unfillable from the single column it has, and they were left
`TBD` rather than re-sourced, because there was no second reference column to re-source them into.

**Proposed text** — the corrected header for the eleven, to be used together with C-1's Source column
(example for `005`, whose unfillable rows then fill):

```markdown
| Element | Ours today | Notion (structural) | Anytype (structural) | ClickUp (structural) | Target | Source | Why |
|---|---|---|---|---|---|---|---|
| Sheet frame | … | Grabber, centred title, back chevron top-left | Sheet with a large top radius, centred bold title | Large top radius, centred bold title, round `✕` | Handle + centred title (≤1px), 16pt inset | **Notion** (header) + **D7** (frame) | The header shape is Notion's; the frame is the operator's ruling and outranks all three |
| Entry sheet | … | Two rows: `Group by ›` and `? Learn about grouping` | — | 64pt rows with a coloured icon tile | Short table of contents, 001's vocabulary | **ClickUp** (row anatomy) + **001** (vocabulary) | ClickUp's rows carry the icon-tile + trailing control this entry row wants; the vocabulary is this packet's own |
| Per-group controls | … | `unreadable at 299×678` | `anytype-view-settings-panel-dark.png` shows a group visibility list | — | … | **Anytype** | The only reference that shows the control at all — recorded as the reason, replacing the bare `TBD` |
| Both themes | — | — | — | — | Card→divider, canvas and checkmark tokens distinct in light and dark | internal | No reference carries a phone dark sheet for this surface |
```

Note the one-column-per-reference shape is deliberate: it lets a row show *where* a value came from
and lets a later reader see at a glance which rows a reference cannot answer, instead of a `TBD` cell
with no owner.

**Confidence:** high for the header contradiction (mechanical); medium for the specific re-sourcings,
which each child's DEFINE step must confirm by opening the named asset.

---

## R-4 · No child has a reference index, so each DEFINE step re-derives the same reads

**Evidence.**

- `003/tasks.md:38` — *"T001 Open every reference in `spec.md` §13 and record, per file, whether it
  shows this sheet or something else. Mobbin family names are unreliable: three reference reads this
  session each found roughly a third of files mislabelled. Record every value that cannot be read at
  299×678 as a gap, never a guess."*
- The same work is re-ordered per child (`004`, `005`, …, `011` all carry a variant of T001), and each
  of the 19 children's §14 lists the reference assets as images without a resolution or a
  what-it-shows line: `013/spec.md:236-241` embeds four references with no caption beyond a title.
- The known ceiling is recorded once, in the parent: `spec.md` §4 — *"**Every Notion iOS capture in
  this repository is 299×678** … No numeric threshold in any child may be derived from one."* The
  D3 gap list is also parent-only: *"Notion's AND/OR conjunction control was never observed … Notion's
  sort-rule reorder affordance was never observed … Notion's grouped Shown/Hidden result screen was
  never captured."*
- The ClickUp assets are new and never indexed at all: `screenshots/clickup/ios/views/` exists (files
  on disk, e.g. `clickup-ios-views-home-00e1f356-…webp`), but no packet document enumerates what each
  one shows.

**Finding.** Reference reading is the one part of DEFINE that is measurably expensive and measurably
repeatable: four separate children's tasks instruct an agent to open the same families and re-decide
what each file is. The parent already holds both facts a shared index would need (the 299×678 ceiling
and the three D3 gaps), so the index costs one file and removes a per-child derivation — including the
"roughly a third of files mislabelled" trap, which is currently re-discovered by whoever runs T001
next.

**Proposed text** — a new packet-root document, `076-sheet-visual-parity/references.md`, whose rows are
filled by the first child to read each asset and reused by the rest:

```markdown
# Reference Index — what each asset can and cannot answer

One row per reference asset any `076` child opens. A DEFINE step reads this table **before** opening
the asset, and appends a row for any asset it opens that is not already listed. Three columns are
load-bearing: **resolution** (nothing at 299×678 may set a number), **what it shows** (the structural
read), and **what it cannot answer** (the gap, recorded so the next child does not re-derive it).

| Asset | Resolution | Shows | What it cannot answer | Children that use it |
|---|---|---|---|---|
| `screenshots/notion/ios/flows/view-options/*-02-*.webp`, `-03-*.webp` | 299×678 | The View options table of contents: drag handle, centred title, Done top-right, one bordered View name input, rows grouped by hairline dividers with plain section labels on the sheet's own background, each row leading icon + label + trailing value | Any numeric value: pitch, inset, type size, divider colour. **And the operator has overruled the inset-card reading of this asset (D7): the group structure is heading-plus-divider, not cards** | `001`, `005`, `006`, `011` |
| `screenshots/anytype/mobile/app/anytype-mobile-space-typeslist-{dark,light}.png` | full | A flat, borderless list of rows inside a sheet | Phone-sheet frame geometry — it is a mobile *app* screen, not a bottom sheet | `013` |
| `screenshots/clickup/ios/views/clickup-ios-views-home-*.webp` | read at T001 | Row anatomy: coloured rounded icon tile + label + trailing link/`···`; hairline divider between the pinned group and the rest; selected row carries a full-width rounded band (a selection state, not a grouping container) | Numeric pitch (the reference's own 64pt figure is quoted in D9 as approximate); whether the band is a selection state is an operator ruling, not a read | `018`, `019` |
| `screenshots/operator/0040-properties-card-container-rejected.png` | device | The **rejected** shape: rows inside a lighter rounded container on the sheet | n/a — it is evidence *against*, and D7 outranks every other asset on frame | all 19 (frame row) |
| … | | | | |

**Standing gaps inherited from D3, restated here so a child cannot reopen them as discoveries.**
Notion's AND/OR conjunction control was never observed (`003` may not claim a Notion position). Notion's
sort-rule reorder affordance was never observed (`004` may not claim one). Notion's grouped
Shown/Hidden result screen was never captured (`005` may not build a shown/hidden partition *against
Notion*).
```

**Confidence:** medium-high — the waste is evidenced by the four duplicated T001 tasks and the parent's
own "roughly a third mislabelled" note; the index's exact rows must be filled by the children that
open the assets.

---

## R-5 · Composition has no rule for a surface with zero readable references — which is 47 of the inventory's rows

**Evidence.**

- `071/001/inventory.md`'s own summary: **47 rows carry no reference of any kind**; `coverage-audit.md`
  §4 assigns 18 of them to `017`, 5 to `014`, both `015` rows to a structural mismatch, and 3 of `016`'s
  4 to `none/none`.
- `decision-record.md` D3: *"no numeric threshold in this packet may be derived from a reference asset"*
  and *"every number in a child's target table is measured from our own tree or marked `TBD — needs
  operator capture`"*.
- D9 requires every row to name *which reference it follows and why* — with no stated form for "none".
- The audit's own bundling rationale for `017`: *"all carry zero reference of any kind — splitting 18
  near-identical zero-reference surfaces into 18 phases would multiply paperwork without multiplying
  evidence"*.
- `005/spec.md:246` is the existing informal workaround: *"Retained or removed by **our own**
  consistency argument, recorded as such; **no Notion claim** (D3)"*.

**Finding.** A Source column that must name a reference has no legal value for a zero-reference
surface, so the largest single cluster in the programme (18 modals + 5 suggest sheets + 3 toolbar
options) would either be left blank — which reads as unfilled work rather than a decided target — or,
worse, get a reference invented from family resemblance. `005` already invented the correct local
answer ("our own consistency argument, recorded as such"); it needs to be the packet's stated rule so
`017` can use it 18 times.

**Proposed text** — add to `decision-record.md` as an amendment **inside D9** (not a new decision, since
it completes D9 rather than changing it):

```markdown
**The Source column's legal values, and the zero-reference case.** A Source cell reads exactly one of:
`Anytype`, `Notion`, `ClickUp`, `operator` (the operator's own words or capture — always the highest
rung where it speaks), `internal` (no reference carries the element; the target is derived from this
packet's own landed grammar, and the cell says which child's grammar), or a `+` composition of two of
those with the element split named (`Notion + ClickUp`). **`internal` is a decision, not a gap** — it
requires one line naming the child whose landed grammar is being followed and one line naming what
would overturn it (an operator capture, normally). A cell left blank, or reading `none`, fails the
DEFINE pass rule: the difference between "no reference exists" and "nobody decided" is the whole point
of the column, and 47 surfaces in this packet's inventory are in the first state.
```

**Confidence:** high for the gap (`005`'s own workaround proves the rule was needed and absent); high
for the proposed values, which are a formalisation of practice already in the packet.

---

## Reference-composition verdict

| Check | Result |
|---|---|
| A Source column exists in every child's DEFINE table | **7 of 19** (`013`–`019`); carried into iterations 1 (C-1) and 2 |
| Source naming a *reason* per element (not just an app) | **0 of 19** — `013`–`019`'s cells name an app (`Notion (base grammar) + ClickUp (icon-tile idea)`) with a partial reason; the eleven have no column at all |
| ClickUp leads board surfaces | **4 of 5 board children**: `018`, `019` yes; `012` no (Anytype, per §7.21 — see R-2); `013` composed; `045`/`056` untouched by design |
| Frame ruling applied (no containers, dividers, handle, 16pt, 44pt, stacking) | **0 of 19 as a lane clause**; 2 of 19 as a task (`001`, `002` remediation); 19 of 19 as prose |
| Contradictions raised as Proposed ADRs | 1 new this iteration (**R-2** → `roadmap.md` §7.22) |

## What was tried and failed this iteration

- **Hypothesis: `012`'s Anytype column is a straight D9 violation.** Disproved by `roadmap.md:2490-2493`
  — §7.21 deliberately carves `012`'s field-layout rule out of the ClickUp retarget. Recorded as R-2
  in its **narrower** form (a scoping disagreement between D9's text and §7.21, not a simple breach),
  and the hypothesis is not repeated in later iterations.
- **Hypothesis: `018`/`019` need a Proposed ADR because they contradict `056` ADR-001.** Disproved —
  §7.21 already carries it as *"settled, not left Proposed"* with the operator's words quoted. No new
  ADR needed; the only genuine gap is that D9 still calls its own board clause *"a Proposed ADR"* while
  §7.21 calls the same thing settled. That single-word disagreement (`Proposed` vs `settled`) is worth
  one line in R-2's proposed §7.22 and is recorded there rather than as its own finding.

## Open questions raised this iteration

1. R-2 (i) or (ii) — does the ClickUp board lead extend over `012`'s field grid, or does D9's board
   clause gain the carve-out sentence §7.21 already asserts?
2. D9 calls the board retarget a *Proposed* ADR; §7.21 calls the same ruling *settled*. Which word is
   the packet's own answer, given D15 says a contradiction with a landed ruling is Proposed rather than
   applied — while §7.21 says the operator already resolved the direction?
