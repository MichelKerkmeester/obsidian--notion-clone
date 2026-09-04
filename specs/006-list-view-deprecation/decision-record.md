---
title: "Decision Record: List View as a ClickUp-Style Grid"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). ADR-001 port versus presentation mode, ADR-002 the sort indicator re-decided on the operator screenshot, ADR-003 how a select cell advertises that it is editable, ADR-004 the reserved leading gutter that replaces the checkbox-swap reading."
trigger_phrases:
  - "006 list view adr"
  - "list grid presentation mode decision"
  - "port versus converge list view"
  - "sort indicator ordinal decision"
  - "select cell dropdown affordance decision"
  - "row checkbox leading gutter decision"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation"
    last_updated_at: "2026-08-30T12:00:00Z"
    last_updated_by: "desktop-screenshot-audit"
    recent_action: "ADR-004 added; ADR-001 re-judged on four desktop captures; ADR-002/003 re-sourced"
    next_safe_action: "Scaffold the five phase children and build the two guard checks first"
    blockers: []
    key_files:
      - "decision-record.md"
      - "reference-clickup-list-operator.png"
      - "specs/context/clickup/list-view/clickup-desktop-list-view-3.png"
      - "specs/context/clickup/list-view/clickup-desktop-list-view-4.png"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Route: B, the list becomes a presentation mode of the grid renderer. Operator decided."
      - "The row checkbox sits in a reserved leading gutter, not in the record-icon slot. ADR-004."
---

> **SUPERSEDED — 2026-09-04.** This document belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds, and it is kept rather than
> deleted because it records what was decided and why. The live direction is
> [`spec.md`](spec.md) and [`plan.md`](plan.md).

# Decision Record: List View as a ClickUp-Style Grid

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: How the list view acquires the table's feature surface

**Status: Decided — Route B. Unblocks every phase in this packet.**

<!-- ANCHOR:adr-001-context -->
### Context

The operator asked for two things that turn out to be one: the list view should have every feature
the table has, and it should look the way ClickUp's list looks. Twenty ClickUp reference screens show
that ClickUp's list *is* a table — grouped rows under a column header row that repeats per group,
aligned columns, in-place cell editing, a trailing add-column affordance. What differs from a
spreadsheet is chrome, not structure.

Three measured facts frame the decision:

- The list renders cells through `card-field-renderer.ts` (348 lines, 11 handled types). The table
  renders through `cell-renderer.ts` (3,107 lines, 13 handled types including `files` and `rollup`).
- Eleven sites in `database-view.ts` gate features behind `viewType === "table"`.
- The two renderers already share the same column-width model (`column-width.ts`), the same group
  label renderer, the same drag-feedback state, the same empty-state renderer, the same checkbox
  factory and the same owned-menu factory. They have converged on everything except the row itself.

The list also has four behaviours the table does not, and they are why the list exists: row-click
opens the record detail panel, a roving-tabindex keyboard model, stacked file titles, and wrapping
fields sized `max-content`.

<!-- /ANCHOR:adr-001-context -->

<!-- ANCHOR:adr-001-decision -->
### Decision

**Recommended: Route B — the list becomes a presentation mode of the grid renderer.**

One renderer emits the grid DOM. A `data-db-row-style` attribute on the grid selects chrome. The
list's four distinctive behaviours become grid options that are on in list mode. Every
`viewType === "table"` guard becomes a grid predicate, except the two that are correctly
view-semantic (G8, G11 in `plan.md` §3).

The consequence that decides it: under Route B, "the list has all the features of the table" stops
being a list of things to build and becomes true by construction. Under Route A it is a checklist
that is complete on the day it ships and incomplete by the next table feature.

**Decided by the operator: Route B.** The reasoning they were given, and accepted, is the one
above — Route A is complete on the day it ships and incomplete by the next table feature, so it is
the reading of "all the features from table" that cannot stay true. They were shown both costs:
roughly 900 lines under B against roughly 2,200 near-duplicate lines under A, and B's wider blast
radius across the nine view guards.

What this obliges the phases to do, since the cost of B is concentrated where it is easy to get
wrong: the two view-semantic guards must survive the conversion, and both would pass `tsc` and the
full unit suite if broken, so neither can be defended by a type check. Each needs a check that
drives the production render and fails when the guard is converted. That is the first thing the
implementation phase should build, before any guard is touched.

<!-- /ANCHOR:adr-001-decision -->

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives

**Route A — port the features into `list-renderer.ts`.**

Re-implement the header row, sort wiring, resize handle, column reorder, add-column, footer,
multi-group depth model and cell-selection addressing inside the list renderer, and add a list branch
to each of the eleven guards.

- *For*: it is the literal reading of "refactor the list view so it has all the features from table".
  It touches `database-view.ts` less. The list keeps a renderer it fully owns.
- *Against*: roughly 2,200 LOC in the list renderer against 900 under Route B, most of it a near-copy
  of `table-renderer.ts`. Every guard grows a second branch that can disagree with the first. The two
  cell pipelines stay separate, so `files` and `rollup` need a third implementation. And the parity
  claim decays: the next table feature lands in one renderer and the list silently falls behind again,
  which is exactly the state this packet was opened to fix.

**Route C — leave the list alone, add a new view type.**

- *For*: zero regression risk to the existing list.
- *Against*: it answers a question nobody asked. The operator wants *this* view fixed, and a second
  list-shaped view doubles the surface the next person has to keep in sync.

**Route D — chrome only, no feature work.**

Restyle the existing card rows to look ClickUp-like without acquiring any table feature.

- *For*: small, one lane take, quick.
- *Against*: it fails half the request outright. It also cannot produce the thing the reference screens
  actually show, because per-group column headers and aligned columns are not chrome — they are
  structure. This route is the one most likely to ship, pass every gate, and leave the operator
  looking at a screen that is prettier and still cannot sort.

<!-- /ANCHOR:adr-001-alternatives -->

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**If Route B is accepted:**

- Positive: one cell pipeline, one header controller, one footer, one group model. `files` and
  `rollup` appear in the list with no new code. Future table features reach the list for free.
- Positive: the eleven guards collapse to one predicate, which is testable in isolation.
- Negative: a wider blast radius in `database-view.ts`. Nine guards change behaviour for the list and
  must not change it for the five other views. This is the packet's largest risk and is mitigated by
  enumerating every guard with its intended predicate before any edit.
- Negative: `.db-list-row` and its siblings may change or disappear. Four other places reference them
  — the selection-sync selector list at `database-view.ts:7554`, the screenshot scenarios, the
  Storybook stories, and the surface-contract test. Each is enumerated before a rename lands.
- Negative: the list could quietly become the table. FR-17 is P0 and AC-10 exists to catch it.

**If Route A is accepted:**

- Positive: a smaller diff in the shared controller, and the list renderer stays self-contained.
- Negative: a permanent second implementation. The drift that created this packet is re-created on
  the day it closes, and the next parity request costs the same again.
- Negative: `plan.md` §3 and §4, `tasks.md` and the effort estimates are all rewritten first.

<!-- /ANCHOR:adr-001-consequences -->

<!-- ANCHOR:adr-001-five-checks -->
### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes. The operator named a specific view and a specific gap, and the gap is measured, not asserted |
| **Is there a simpler existing thing?** | Route D is simpler and answers half the request. It is rejected for that reason, not for being small |
| **What does it touch?** | `database-view.ts` owns the eleven guards; `list-renderer.ts` and `table-renderer.ts` own the rows; `styles.css` is a serialized lane; four call sites reference list classes by name |
| **What is the real caller that must not break?** | The five non-list view types passing through the same guards, and the surface-contract test at `database-view.ts:7554` |
| **What contract must not break?** | Saved view configs. Both routes add optional fields only; an older build ignores them |

<!-- /ANCHOR:adr-001-five-checks -->

<!-- ANCHOR:adr-001-impl -->
### Implementation note

Whichever route is chosen, three constraints hold unchanged:

1. **No AGPL or ClickUp material is copied.** `external/anytype` and `external/appflowy` are read for
   behaviour only. ClickUp is matched at the interaction-model level; no asset, CSS value or token
   scale is reproduced, and no Mobbin image is vendored.
2. **`styles.css` is not split.** Its header states why: the test suite and the capture harness both
   load it in source order. One lane take, one release.
3. **Criteria follow the four rules** in `architecture-findings.md` §9. A criterion asserting that an
   element exists is rejected.

<!-- /ANCHOR:adr-001-impl -->

### Re-judged against the four desktop captures

The decision was made before `../context/clickup/list-view/clickup-desktop-list-view-{1,2,3,4}.png`
arrived. Re-tested against them, **Route B is unchanged and no capability appeared that the grid
renderer cannot express as a presentation option.** Every new finding in `spec.md` §4.2 is either
chrome or slot allocation, and `data-db-row-style` selects both:

| New finding | Route B cost |
|---|---|
| C22 — a leading gutter, reserved at rest, holding a drag grip and the checkbox without shifting the row | A leading utility slot on the first cell. No new track, no reflow. Cheaper than the swap C13 described, which would have needed the icon and the checkbox to share one box |
| C23 — an action cluster right-aligned inside the Name column, and a `…` sharing the trailing add-column track | A trailing utility cell per row, opposite the header's trailing `+`. The grid already emits that track |
| C24 — the header row is the group's first child and renders for a group with **zero rows** | **The one place the evidence tightens an implementation constraint.** Header emission must key off the group's existence, never its row count. A grid renderer that emits a group header only when the group has rows — a natural optimisation — fails this and would pass a fixture built only from non-empty groups. AC-30 exists to catch it |
| C26 — the group value's treatment follows the grouped field | A renderer choice inside the group header, not a structural one |
| C29, C30, C31 — uniform-width pills, content-width grid, truncation | All chrome, all selected by `data-db-row-style` |

**What the evidence does change is the two guard checks.** ADR-001 obliges each view-semantic guard
to have a check that drives the production render and fails when the guard is converted, built before
any guard is touched. The captures sharpen what each must assert:

- **G8** (`database-view.ts:5496`, required column keys). The Name column is not merely "required".
  C22 and C23 show it hosting the leading gutter, the collapse chevron, the record glyph, the inline
  row-action cluster and — on D2 — inline tags. Converting G8 to `isGridView` would return empty for
  the list and let the title column be dropped, taking every row-level affordance with it. The check
  must assert that the title column is present **and** that the leading gutter and the row actions
  render inside it, not merely that a column survives.
- **G11** (`database-view.ts:7856`, new-row reveal). C5 and C24 confirm the create affordance is
  **per group**, present even in a zero-row group. So the reveal target is group-scoped. The check
  must assert the new row appears **inside the group whose create affordance was used**, not merely
  somewhere in the view — an assertion that passes trivially on a single-group fixture and must
  therefore run against a multi-group one.

<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: Where the sort indicator lives

**Status: Decided. Supersedes the first draft of this ADR, which was wrong.**

### What the first draft said, and why it was not a finding

It recommended keeping our arrow-plus-ordinal indicator and **dropping the ClickUp attribution**, on
the grounds that no ClickUp list header in twenty Mobbin screens carries an arrow and that sorting
surfaces as a toolbar chip reading `2 Sorts`.

That reasoning was absence of evidence. Twenty screens are a sample, not an enumeration, and the
sample was assembled without a sort applied — a header cannot show a sort indicator when nothing is
sorted, so the set could never have falsified the claim it was used to reject. **The recommendation
to strip the attribution is withdrawn.** It is recorded here rather than deleted because the failure
mode is worth keeping: the draft was confident, cited its evidence, and was still backwards.

### What the evidence shows

`reference-clickup-list-operator.png` shows three of ten column headers carrying a small filled badge
with a direction arrow and an ordinal — `Name ↑3`, `Priority ↓2`, `#  ↑1` — the three positions of a
single three-rule sort. The badge repeats in each of the five per-group header rows.

**Four further desktop captures repeat it**, which retires any remaining doubt about the form. D1 and
D4 sort on the same three columns; D2 sorts on `Name`, `Priority` and `Date created`, so the badge is
not bound to particular columns. D4 alone paints fifteen instances across five per-group header rows.
The badge-repeats-per-group behaviour that FR-03a exists to protect is now observed on four
independent screens rather than one.

Two further readings, both narrower than they first appear:

- **No sort chip appears in any toolbar on any of the five primary screens**, while every one of
  them carries a filters chip and three active sort rules. So the header indicator is not a fallback
  for a missing chip; on all five it is the only place the sort state is legible. What they prove
  coexisting is a *filter* chip and a *sort* header indicator, which are different controls. Whether
  a `2 Sorts` chip and a header badge ever appear together is **still unobserved** — the Mobbin set
  has the chip, the primary set has the badge, and no capture has both. Five screens without a sort
  chip make the reading likelier; calling it confirmed would be the C18 error run in the other
  direction, so C18a stays "not confirmed".
- **ClickUp's behaviour at a single sort rule is still unobserved.** Every badge on all five primary
  screens belongs to a three-rule sort, so nothing can be said about whether the ordinal is
  suppressed at one rule.

### Decision

**Keep our indicator, and keep the ClickUp attribution.** The form the operator asked for is the form
ClickUp ships and the form we already build. The requirement is C18 in `spec.md` §4.2 and FR-03a in
§4.3.

Two differences survive, and neither is a defect to fix on this evidence:

| | Ours | ClickUp |
|---|---|---|
| Container | bare text, no background or padding, accent colour, 11px/700 (`styles.css:4969-4978`) | a filled rounded badge, separated from the label |
| Glyph | a filled triangle | an arrow with a stem |
| Ordinal at one sort rule | suppressed — `sort.total > 1` (`table-renderer.ts:541`) | unobserved |

The badge container is the one change worth considering, and it is chrome-phase work, not a
correction: a badge separates the indicator from the label at a glance, which matters more here than
in the table because FR-02 repeats the header once per group and a five-group view therefore paints
fifteen indicators. Any value it needs comes from the token scale, per FR-18. Deferred to phase 002
as an option, not required.

### The consequence that mattered

The first draft's own argument for stripping the attribution was that *"a future reviewer checking
the requirement against ClickUp would find it absent and remove a working feature."* The risk was
real and the direction was inverted: a reviewer checking against ClickUp would have found the
indicator **present**, and the note telling them it was not ClickUp's would have been the wrong fact
in the file. Attribution is now correct, so the check the draft feared now passes on its own terms.

<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: How a select cell advertises that it is editable

**Status: Decided for the model, one option open for phase 002.**

### Context

The operator described "effort as a coloured pill with a chevron". The first draft could not match it
to any ClickUp field across twenty screens and recorded it as unconfirmed, guessing it was really the
`Save ⌄` split button from a row-edit screen.

`reference-clickup-list-operator.png` settles it. An `Effort` column renders five filled coloured
pills, each with a chevron inside the pill's right edge, over rows that are **at rest** — nothing
hovered, no popover open, no edit affordance anywhere else on the row. It is a single-select cell
whose resting state advertises its own dropdown. Unset cells render a dash.

Our nearest existing analogue is the `status-badge` that `select` and `status` both route to
(`cell-renderer.ts:311-313`, `:430-446`). Four differences are measurable:

| | Ours | ClickUp's Effort cell |
|---|---|---|
| Dropdown affordance at rest | none — the cell looks static | a chevron inside the pill |
| Width | hugs its text (`display: inline-flex`, no width — `styles.css:6980-6990`) | spans the column track; all five pills are the same width |
| Corner | capsule (`--db-radius-full`) | a rounded rectangle |
| Colour source | the option's configured colour, via `--db-status-bg` / `--db-status-fg` | the same — per-option, author-picked |

The fourth row is the one that already agrees, and it is the one the reading of the screenshot got
wrong. The buckets ascend `6 - 12h`, `12 - 24h`, `24 - 40h`, `40 - 80h`, `80h +` while their colours
run brown, blue, purple, orange, pink — five unrelated hues with no monotonic lightness or hue
progression. The mapping is categorical, not ordinal. **Do not build a magnitude ramp from it.**
Encoding an ordered quantity as unordered hue is a defect: hue has no perceptual order, so a reader
cannot tell which of two colours means "more" without the text, and a colourblind reader loses the
grouping entirely. If an ordered ramp is ever wanted here it is a separate decision, built from
lightness within one hue, and it is not this one.

### Decision

**Adopt the affordance, adopt the colour source, and do not adopt the geometry by default.**

- **FR-21**: a `select` or `status` cell carries an inline dropdown affordance at rest. This is the
  substantive change — a cell that cannot be told apart from static text is the reason people open
  the record panel to change one value.
- **Colour stays per-option**, which is what we already do. Nothing changes and nothing should.
- **Width and corner stay ours.** A filled block spanning a whole column track in every row is a
  large amount of colour competing with the row title, which is the thing being scanned. Hugging the
  text keeps the pill proportional to its content and leaves the title primary. This is a deliberate
  divergence from the reference, not an oversight.
- **FR-22**: adopt the split the screenshot shows between a *filled* single-value pill and *outlined*
  multi-value chips. We render both through one filled badge today, so a row with several tags is a
  wall of colour with no rank in it. Outlining the multi-value chips lets them recede and leaves one
  filled element per row carrying the categorical signal.

### Open for phase 002 — now with the evidence it was missing

Whether the pill spans the column track after all. It is the one place the reference and the
hierarchy argument disagree, it is cheap to try both under the same token, and a capture review is a
better judge than either argument.

The reference half of that disagreement is no longer an inference. C29 records the behaviour on three
further desktop captures: every `Effort` pill occupies the **same horizontal extent regardless of
label length**, inset from both column edges, with the unset dash sitting at the pill's left edge
rather than centred. So the reference is not merely "wider than ours" — it is *uniform-width*, which
is a different thing from spanning the track and a different thing again from hugging the text.

That sharpens the choice rather than settling it. Uniform width buys a scannable left edge down the
column; it spends a large, constant area of saturated colour on every row, competing with the title,
which is the argument this ADR already made for hugging. **The decision stays open and stays with the
capture review.** What has changed is that both options are now measured shapes rather than one
measured and one imagined, and whichever wins, the value comes from the token scale per FR-18.

<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: Where the row's selection checkbox lives

**Status: Decided. Contradicts C13, which was a finding drawn from too little evidence.**

### What the packet believed, and why it was not safe

C13 read two Mobbin screens as showing the selection checkbox **replacing** the leading row icon in
the same slot, and called it confirmed. FR-13 was written from that, AC-16 asserted it as a
measurable equality — *"the checkbox and the record icon occupy the same box, within 1px"* — and
T3.4 instructed the chrome phase to build the swap.

The reading was not absurd; it was under-evidenced. A screen showing a checkbox where an icon usually
sits is equally consistent with a swap and with a second element revealed nearby, and neither Mobbin
screen showed the same row in both states. Nothing in the packet distinguished the two, and the
criterion built on it would have driven the implementation toward the wrong one.

### What the evidence shows

`clickup-desktop-list-view-3.png` and `-4.png` each capture one row in a transient revealed state
alongside its unaffected neighbours, which is exactly the comparison the earlier sources could not
provide. On both:

- A six-dot drag grip and an **unchecked** checkbox appear in a band to the **left** of the row's
  expand chevron.
- The record glyph is **still present**, in its usual place. Nothing is replaced or hidden.
- The expand chevron, the record glyph and the title sit at **the same horizontal positions on the
  revealed row as on unaffected rows**. The band is therefore allocated at rest and empty, and
  painting into it causes no reflow.
- The group's own collapse chevron sits in that same band, so one gutter serves the group toggle and
  the row's selection chrome.

Two further facts fix what state this is. Every revealed checkbox is **empty**, and no bulk action
bar is docked on either screen — so this is a pre-selection reveal, not a selection. Whether the
trigger is hover or keyboard focus is **not resolvable from a static capture**, and the requirement
below therefore covers both rather than guessing.

### Decision

**Adopt the reserved gutter. Do not build the swap.**

- **FR-13** is rewritten: the row reserves a leading gutter, empty at rest, holding the selection
  checkbox on hover, focus or selection. It does not replace or move the record icon, and revealing
  it must not shift the row's chevron, icon or title.
- **AC-16 is replaced, not amended.** Its threshold was provably wrong: it asserted an equality the
  primary evidence contradicts, so an implementation that matched the reference would have **failed**
  it. The replacement asserts the property that actually carries the design — the chevron, icon and
  title occupy identical positions with the gutter empty and with it occupied — which is a hit test
  with a threshold, fails on the current tree, and moves when the subject is deleted.
- **The drag grip is out of scope.** The list already has drag-reorder (F23) with its own affordance;
  relocating it into this gutter is a separate change nobody asked for. Recorded so a later reader
  does not read its absence as an oversight.

### Why the replacement is not the same trap

The banned phrasing in `acceptance-criteria.md` §2 is a criterion that asserts chrome already present
at rest, so it passes before anything is built. AC-16's replacement asserts a **relation between two
states of the same row**, which cannot be satisfied by a tree that has no second state: the list
emits `db-list-row-checkbox` with zero CSS rules today and has no gutter to reveal, so the
measurement has nothing to compare and fails. Deleting the gutter after it exists collapses the
comparison again, which is the negative control.

### The consequence that mattered

Left alone, this would have produced the packet's own worst outcome in a new form: a criterion that
is precise, measurable, negative-controlled, honestly green — and pointed at the wrong behaviour. The
four screens did not make the old criterion harder to pass. They made it wrong to pass.

<!-- /ANCHOR:adr-004 -->
