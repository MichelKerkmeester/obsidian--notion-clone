# Iteration 6 — COVERAGE, second axis: reachability, and what the judge compares against

**Gap class:** COVERAGE (second pass, different axis). Iteration 1 asked *does every request have a
child*; this asks **can the surface the child judges ever be seen** — by the operator's phone (D1's
gate c) or by a judge with a comparison object (the rubric's own wording).

---

## Z-1 · Three of `016`'s four primary surfaces cannot be reached by the operator at all

**Evidence.**

- `src/settings.ts:81` — `export const DEFAULT_VIEW_TYPES: DatabaseViewType[] = ["table", "board"];`
  and `src/settings.test.ts:370` asserts it — *"`expect(DEFAULT_VIEW_TYPES).toEqual(["table", "board"])`"*.
- `src/views/toolbar-renderer.ts:109-111` — the picker offers no new calendar, timeline or chart view:
  ```js
  (option.value !== "chart" || current === "chart") &&
  (option.value !== "calendar" || current === "calendar") &&
  (option.value !== "timeline" || current === "timeline")
  ```
- `archive/deprecated-views/chart/README.md` — *"A persisted chart view now opens as a table (the
  records themselves, sorted) through the redirect shipped in 0.0.34; every `chart*` configuration
  field — aggregation, bucketing, palette, reference lines — is the declared loss."*
- `roadmap.md` §4 rows 77–80 record the deprecation, and §7.14's 2026-09-09 entry records the deferral
  consequence: *"The ruling (rows 77-78, 80; 008 landed `69308192`/`7fb9fb28`, shipped 0.0.35) removes
  the calendar, timeline and chart views, so every §4 row whose report is about one of those views as a
  view — its rendering, its stacking, its look — loses the device read it waited on."*
- `coverage-audit.md` §5 and `016/spec.md` §13 nevertheless scope `016` over
  `src/views/calendar-toolbar-renderer.ts`, `src/views/calendar-timeline-toolbar-renderer.ts`,
  `src/views/chart-toolbar-renderer.ts` and `src/views/calendar-mini-calendar-renderer.ts`, and
  `goal.md` §3 adds the criterion *"`016` … judge ≥ 14/16, no 0, twice consecutively **on the
  calendar/mini-calendar anchor surface**"*.
- The renderers are constructed but not reachable: `CalendarToolbarRenderer` is instantiated in
  `src/views/database-view.ts:413` and `src/views/embedded-database-renderer.ts:266`;
  `ChartToolbarRenderer` at `:411` and `:267`. Construction is not presentation.
- The fourth surface **is** reachable, through a different child: `renderMiniCalendar` is imported by
  `src/views/date-value-picker.ts:28` and `src/views/record-surface/cell-editor-date.ts:25` — i.e. the
  mini-calendar is mounted by `010`'s date picker and `015`'s date cell editor, not by a calendar view.

**Finding.** `016` bundles four surfaces and three of them are unreachable in any released build: a
user cannot create a calendar, timeline or chart view, and a persisted one is redirected on open to
table/board. `goal.md` §3 nonetheless requires `016` to pass the judge twice *"on the
calendar/mini-calendar anchor surface"* — the anchor is the single reachable one, and it belongs to
`010`/`015`. So `016` as scoped cannot be closed by either of its two gates: gate (b) has no
reachable calendar surface to judge beyond the anchor, and gate (c) can never be ticked because the
operator cannot open the sheet the child names. `017` carries the same defect one row over:
`ChartDrilldownModal` is defined only at `archive/deprecated-views/chart/chart-renderer.ts:1009`, which
is exactly the *"live/archived status to be confirmed at `017`'s T002"* its own audit row flags.

**Proposed text** — a **reachability gate** added to the parent's Phase Transition Rules, and a scoped
rewrite of `016`:

```markdown
### Phase Transition Rules (addition, 2026-09-11)

- A child may not be opened against a surface the operator cannot reach in a released build. Before
  DEFINE closes, the child records for each surface it names: **the user action that opens it** (the
  menu path, the setting, the view type that must already exist), and **whether a released build can
  reach that action**. A surface reachable only through a view type the picker no longer offers
  (`DEFAULT_VIEW_TYPES = ["table", "board"]`) or whose renderer has been archived is **deferred, not
  covered** — recorded in `coverage-audit.md` with the reason, and removed from the child's scope
  rather than judged twice by nobody. A child whose every surface is deferred closes as `deferred`
  rather than running the loop.
```

```markdown
### 016 — scope correction (2026-09-11)

Three of this child's four primary surfaces are unreachable: the calendar, timeline and chart views
were deprecated by `008` (rows 77–80) and a persisted view redirects to table/board on open
(`archive/deprecated-views/chart/README.md`). Their toolbar option popovers are constructed in
`database-view.ts` but no shipped path presents them, so neither the image judge nor the operator can
see them.

- **Retained:** `calendar-mini-calendar-renderer.ts` — reachable, but **through another child's
  surface**: `date-value-picker.ts:28` (`010`) and `record-surface/cell-editor-date.ts:25` (`015`).
  `016`'s judged anchor is therefore a **mini-calendar inside the date picker**, and its rubric must
  judge *that* surface. `016` names `010`'s date-picker scenario as the judged capture (D2) and
  coordinates with `010` so the two children do not judge the same picture twice with different
  targets.
- **Deferred:** the calendar, timeline and chart option popovers. Recorded in `coverage-audit.md` as
  `deferred — view deprecated by 008`, with the note that their renderers stay live code and would
  re-enter scope if the views were ever restored from `archive/`.
- **`goal.md` §3's criterion** for `016` is rewritten to name the mini-calendar-in-date-picker surface
  and drops the "calendar" anchor.
```

**Confidence:** high on the reachability facts (the picker filter, `DEFAULT_VIEW_TYPES`, the archive
README's redirect, and the import graph are all mechanical); medium on the recommendation to defer
rather than judge — the alternative is to judge the constructed scenario anyway and accept that gate
(c) can never close.

---

## Z-2 · The rubric is written entirely in comparatives, so the zero-reference children have no scorable rows

**Evidence.** The rubric's own definitions (`spec.md` §5), Row 2 column:

| Row | "2" reads |
|---|---|
| Frame | *"canvas colour token, corner radius, handle and header layout all match **the child's composed reference** (D9)"* |
| Sections | *"**Same** sections, **same** order, same heading-plus-divider separation"* |
| Row anatomy | *"Leading icon, label and trailing element **as the reference has them**"* |
| Controls | *"**Same** control kind and **same** affordance throughout"* |
| Type | *"Scale and weights **read as the reference's**"* |
| Spacing | *"Pitch, inset and gaps **read as the reference's**"* |
| Colour | *"Text, secondary, divider and accent all read correctly"* |
| Both themes | *"Light and dark are each internally consistent"* |

And the children's own position on the zero-reference surfaces:

- `017/spec.md:222` — *"**Internal reference**: the sheet-chrome grammar already landed by `001`-`016`
  (plain background, dividers, grab handle, 16pt inset, 44pt+ rows) — the only 'reference' available,
  and named as such rather than presented as an external source"*; its risk matrix:
  *"No external reference to anchor the rubric | High (certain) | Low | Judged for internal family
  consistency instead; recorded as the explicit basis, not hidden"*.
- `017/spec.md:248` — the Source cells read `Internal (076 frame ruling + landed 001-016 grammar)`,
  `Internal (frame ruling)`, `Internal (DbModal's own existing structure)`.
- `016/spec.md:236` — `Internal (no reference exists)`.
- `014/spec.md:225` — *"Anytype: … desktop palette, read structurally for row anatomy only"*, and
  *"Row height and search-field placement on a phone form factor — the only reference is a desktop
  palette; both kept as ours (`TBD — needs operator capture` where undetermined) rather than sampled
  from a mismatched form factor"*.
- `015/spec.md`'s own framing (coverage audit §3): *"a full-sheet family against an inline-popover
  surface — a structural mismatch, not a true zero"*.

**Finding.** Six of the eight rubric rows are unscoreable without a comparison object, and for 47 of
the inventory's rows no external object exists. The children have done the honest thing — naming the
landed grammar as the internal reference — but the rubric has no row that says what "2" means when the
comparison object is *our own earlier landing*, and the inherited instruction to the judge
(*"give a Sonnet or Opus reviewer the phone capture and the DEFINE table's chosen references"*) would
hand it a reference column reading `Internal (...)` and a frame ruling. A judge facing that will either
invent a reference from family resemblance — the failure D3's "a reader that cannot read a value says
so" exists to prevent — or score everything 2 by deferring to the frame ruling. Both outcomes make the
gate meaningless on the largest cluster in the programme.

**Proposed text** — an amendment to the rubric in `spec.md` §5 and a new column in every DEFINE table:

```markdown
### The comparison object, per child (D9's Source values, made scoreable)

Six of the eight rubric rows are comparatives. Every child therefore names, before DEFINE closes, the
**image the judge compares against** — and for a zero-reference surface that image is a real file, not
a ruling:

| Source value | The comparison object the judge is given | What "2" means |
|---|---|---|
| `Anytype` / `Notion` / `ClickUp` | the named reference asset, beside our capture | the rubric's existing wording, unchanged |
| `operator` | the operator's own capture or the ruling's own quoted geometry | the capture as a picture; the ruling's numbers as numbers |
| `internal` | **a named sibling capture** from a child that has already passed its judge — e.g. `017` compares against `001`'s judged `constructed-view-config-sheet-mobile-{light,dark}.png` and `009`'s `constructed-owned-menu-sheet-mobile-*` | **parity with the named sibling capture**: same divider geometry, same row pitch, same header, same section-label treatment. Not "looks like a sheet" — the same measured grammar, read off a picture both children can open |
| `internal + operator` | both of the above | the sibling for grammar, the operator's words for the frame |

**A DEFINE table cell reading `internal` without naming the sibling capture fails the DEFINE pass
rule.** "Internal" is not a licence to skip the comparison; it is a pointer to the picture that
replaces the reference app.
```

and, for `017` specifically, the concrete comparison set:

```markdown
**`017`'s judge is given two named sibling captures** (`001`'s settings sheet and `009`'s owned-menu
sheet, both judged and both on the plain-background divider grammar) rather than the phrase "internal
consistency". The judge's per-surface expectation is then: *this sheet's chrome measures the same as
the named sibling's chrome* — handle present, 16pt inset, ≥44pt rows, hairline dividers inset to the
label, 0 card containers. A row scoring 1 records which measurement differed from the sibling; a row
scoring 0 records a card container or a missing handle.
```

**Confidence:** high on the gap (the rubric's own wording and the children's own `Internal` cells are
quoted); high on the `internal → named sibling capture` mechanism, which is the only form of the rule
that a judge can actually execute.

---

## Z-3 · The zero-reference cluster is 47 surfaces and one child carries 18 of them; its judge has no per-surface row

**Evidence.** `coverage-audit.md` §4: *"47 rows carry no reference of any kind. Of those, this audit's
new children account for the concentrated majority: **017** … 18 of the 47 — the single largest share,
every row `none/none`; **014** … 5 rows `none/none`; **015** … both rows have an Anytype reference, but
it is a full-sheet family against an inline-popover surface; **016** … 3 of 4 primary rows plus all 4 of
their stacked children"*.
`017/spec.md` §10's risk row accepts the consequence: *"No external reference to anchor the rubric |
High (certain)"*.
`017/tasks.md` carries **13** tasks for **18 primary surfaces + 2 non-modal + 1 stacked**, and its single
judge task (`T011`) reads *"give a Sonnet or Opus reviewer the phone capture and the DEFINE table's
chosen references; score the eight-row rubric"* — one score table for the whole bundle.

**Finding.** `017` is the packet's largest surface cluster and the one with the least judgeable
evidence: one rubric score table for eighteen sheets, with no per-surface row and no named comparison
object. Even with Z-2's sibling-capture rule, a single 8-row score table cannot say *which* of the
eighteen sheets failed a row — so REMEDIATE's trigger (*"any rubric row < 2 opens a remediation task"*)
would open one task for eighteen unknown surfaces, and DONE's "two consecutive passes on an unchanged
tree" would pass on the eight the judge happened to open.

**Proposed text** — a sampling rule for bundled children, added to `spec.md` §5 and to `017`'s and
`014`'s and `016`'s VERIFY phases:

```markdown
### Bundled children: the judged sample is named, and it is not "the bundle"

A child that bundles more than three surfaces cannot judge them all in one score table. It judges a
**named sample** and lane-checks the rest:

- The sample is **one surface per structural family**, named in the child's `tasks.md` before CREATE —
  not chosen by the judge. For `017`: one form-style modal (`FormulaModal`), one list-style modal
  (`StatusPresetManagerModal`), one import/export modal (`CsvMarkdownImportModal`), one destructive
  modal (`DeleteDatabaseModal`), plus the toast and the bulk-edit field menu. Six judged surfaces for
  `017`, not one and not eighteen.
- The score table gets **one row per sampled surface per theme**, not one row per iteration.
- Every non-sampled surface is **lane-checked** against the sampled surface's grammar with a clause
  that names it (e.g. *"every `DbModal` sheet carries 0 card containers and its rows carry the sibling
  divider geometry"*, run over all eighteen), and the clause's printed surface list is the evidence
  that the eighteen were reached rather than assumed.
- `goal.md`'s criterion for a bundled child names the sample, so "judge twice" has a subject.
```

**Confidence:** high for the gap (one judge task, eighteen surfaces, one score table);
medium for the specific sample — `017`'s own T001 should confirm which surfaces are structurally
distinct before the sample is frozen.

---

## Z-4 · `deferred` is not a state the packet can express, so unreachable surfaces will be "covered" on paper forever

**Evidence.** The packet's status vocabulary is three-valued for phases (`roadmap.md` §3.1) and
child-level states are `scaffolded | planned | created, awaiting judge | complete`; the coverage
audit's own legend is *"**Child** = the `076` phase claiming this surface's producer. **NONE** = no
`076` child claims it before this audit."* — no deferred value.
`roadmap.md` §4A is the programme's only deferral mechanism and it is scoped to *reports*, not
surfaces: *"confirmed on the operator's device, or deferred by the operator with the deferral
recorded"*.
`roadmap.md` §7.14 already records the exact situation for reports — *"every §4 row whose report is
about one of those views as a view … loses the device read it waited on"* — which is the same fact Z-1
raises one level up, for surfaces.

**Finding.** Without a `deferred` state, `016`'s three unreachable surfaces and `017`'s archived
`ChartDrilldownModal` must either be silently dropped (losing the traceability the coverage audit was
built for) or run to a judge verdict no human can confirm. Both outcomes corrupt the programme's
headline count ("nineteen children, nineteen judge passes"), and the second is worse: it manufactures
green evidence for a surface the operator cannot open.

**Proposed text** — a fourth child state, for `coverage-audit.md` and `goal.md` §3:

```markdown
### The four child states

| State | Means | Who sets it |
|---|---|---|
| `scaffolded` | documents exist, nothing run | the scaffolder |
| `running` | at least one node has a verdict file | the driver |
| `complete` | two consecutive JUDGE passes on an unchanged tree, operator row open until the device read | the driver, per D1/D6 |
| **`deferred`** | the child's surfaces are unreachable in a released build, or every reference is absent and the operator has chosen not to supply one; the reason and the reversal condition are recorded | **the operator, on a Proposed ADR** — never an agent |

`deferred` is a first-class outcome, not a failure: `016`'s three unreachable toolbars and `017`'s
`ChartDrilldownModal` are `deferred — view deprecated by 008; re-enters scope if the view is restored
from archive/`. `goal.md` §3 separates the three kinds of criterion it currently mixes: `judged`
(nineteen rows), `no-regression` (the two rows already ticked) and `deferred` (a counted, named list).
The programme's headline reads **"19 children: N judged, M deferred"**, so a deferred surface can never
be mistaken for a passed one.
```

**Confidence:** high for the vocabulary gap; medium for the process (whether the operator wants a
deferral or a judged-anyway verdict on unreachable surfaces is their call, and the ADR route is what
D15/§7 exist for).

---

## Second-axis coverage verdict

| Question | Answer |
|---|---|
| Can the operator reach every surface a child judges? | **No** — `016`'s three toolbar surfaces and `017`'s `ChartDrilldownModal` are unreachable; `016`'s fourth is reachable only through `010`/`015` |
| Does every child name a comparison object a judge can open? | **No** — 47 surfaces are zero-reference and their DEFINE cells read `Internal (...)` without naming a capture |
| Is the zero-reference cluster judgeable as scored? | **No** — one score table for `017`'s eighteen sheets |
| Can the packet express "deferred"? | **No** — three-valued phase status, no deferred child state |
| Net | 1 scope correction (`016`), 1 sample rule (`017`/`014`/`016`), 1 vocabulary addition (`deferred`), 1 rubric amendment (comparison objects) |

## What was tried and failed this iteration

- **Re-checked: is the calendar/timeline/chart toolbar renderer dead code?** No — all four renderers are
  live modules with tests, and three are instantiated by `database-view.ts`/`embedded-database-renderer.ts`.
  Only their *presentation path* is gone. This distinction is why Z-1 proposes deferral rather than
  deletion, and it corrects iteration 1's "ruled out" note (which said only that the files are live;
  reachability is the sharper test).
- **Hypothesis: `015`'s cell editors are unreachable too.** Disproved — `cell-editor-date.ts:25` imports
  `renderMiniCalendar`, and `cell-renderer.ts:601` is the recorded mount for the text/select editors.
- **Hypothesis: the toast is unreachable.** Not proven either way — `src/views/toast.ts` is live and the
  operator reported toast behaviour in `roadmap.md` rows 81–82 (*"the undo toast stay too long on
  screen"*, 2026-09-08), so toasts are reachable; the gap there remains the missing constructed capture
  (iteration 2, D-2), not reachability.

## Open questions raised this iteration

1. Reaching a verdict for `016`'s three unreachable toolbars: defer them (Z-4), or judge the
   constructed scenario anyway and record that gate (c) can never close? The packet's own §7.14
   precedent is deferral for reports; this would extend it to surfaces.
2. Does the operator want `017` judged on a **six-surface sample** (Z-3) or on all eighteen with six
   score tables? The lane can hold all eighteen; the judge's attention cannot.
3. Is `020-control-primitives-visual-parity` (iteration 1, C-4) still wanted once the shared row and
   section primitives land inside `001` (iteration 4, DS-4)? If `001` owns `obnotion-sheet-row`, `020`
   may shrink to the checkbox/listbox geometry and lose its reason to exist as a phase.
