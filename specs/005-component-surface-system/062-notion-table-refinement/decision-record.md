---
title: "Decision Record: Notion Table Refinement"
description: "The seven decisions the table refinement turns on: the title-column menu convention, the superseded wrap phase and its corrected rule, the conditional-colour naming question, the binding colour guardrail, freeze's scope and divider, the add-row noun source, and whether a type row ships before its data type."
trigger_phrases:
  - "062 decision record"
  - "column freeze adr"
  - "wrap supersession adr"
  - "add row noun adr"
  - "type set adr"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/062-notion-table-refinement"
    last_updated_at: "2026-09-06T16:32:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Folded the 18:32 rulings; all seven ADRs now Accepted"
    next_safe_action: "Start T021 at twenty-one types; the type set, the divider and the noun source are all named"
    blockers: []
    key_files:
      - "src/views/column-menu.ts"
      - "src/data/column-types.ts"
      - "src/data/conditional-formatting.ts"
      - "src/views/property-type-icon.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-062-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Person's vault value source — wikilink or plain text — owed an ADR before its renderer"
    answered_questions:
      - "No candidate in this packet contradicts a landed Anytype ruling; ten were checked"
      - "The wrap control is closed on main and is not reopened here"
      - "The frozen divider is a soft right-edge shadow shown only once content scrolls under it"
      - "The add-row noun is a per-view configured string with 'New' as its fallback"
      - "All eight missing Notion types ship as real data types; the count is 13 to 21"
      - "Conditional colour gets its own view-settings row, and the work is 064's"
---
# Decision Record: Notion Table Refinement

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

> **The headline finding this record exists to carry: none of the ten landed rulings checked is
> contradicted by any candidate in this packet.** `053` ADR-001 to ADR-006 and `050` ADR-003,
> ADR-005, ADR-006 and ADR-007 were each read against each Notion item. The reason is structural
> rather than lucky: `050` ADR-006 and `../roadmap.md` §6A (2026-09-05 ~22:45) moved the **board and
> the calendar** to Anytype 1:1 and kept the **table** under item-wise adoption, so there is no
> parity target here for a Notion pattern to contradict. `051` ADR-007's parity-by-default binds the
> sheets and modals these features present *in*, not the table's cells.
>
> Four **tensions** were named by the research and are dispositioned below rather than silently
> resolved (ADR-001 to ADR-004). Three further decisions are new ground and are **Proposed pending
> the operator** (ADR-005 to ADR-007). Per parent D15, an agent does not move a Proposed ADR to
> Accepted.

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The title column keeps our disabled-row menu convention

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | This synthesis, against a landed convention |
| **Criterion** | None — this ADR decides that nothing changes |

<!-- ANCHOR:adr-001-context -->
### Context

Notion's title-column menu omits Hide and Delete entirely and adds a *Show page icon* row
(`039351aa`). Ours shows Hide on every column (`src/views/column-menu.ts:193`) and **disables**
Delete for the title (`:241`).

This looks like a divergence worth closing and is not. The digest's own divergence table already
ruled the two equivalent — "ours via a disabled row, Notion's via a shorter menu" — and this
repository has a written convention for exactly this case: `row-menu.ts:10` records that a disabled
row documents an action that exists but does not apply here. The same reasoning produced the
thirteen-format type picker, where `type-picker.ts:6-12` states it outright: *a format missing from
a dropdown is unexplainable; a disabled format carrying its reason is not.*

### Constraints

- Parent D15: this packet may not rewrite a landed convention.
- `053` owns the column menu.
<!-- /ANCHOR:adr-001-context -->

<!-- ANCHOR:adr-001-decision -->
### Decision

**Keep ours.** The child phase must **not** shorten the title-column menu to Notion's shape. It is
recorded as Accepted rather than Proposed because it decides that nothing changes, and because
adopting Notion's shape would overturn a convention already written down in two places — which D15
forbids this packet from doing on its own.
<!-- /ANCHOR:adr-001-decision -->

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Why not |
|--------|---------|
| Shorten the menu to Notion's shape | Trades a documented convention for a shorter menu at zero user gain; the digest already ruled the two equivalent |
| Adopt Notion's row **order** as well | Ordering is not measurable as user gain and would move captures for nothing |
| Add Notion's *Show page icon* row | We have a view-level record-icon toggle already (`src/views/table-renderer.ts:575-577`); a second control for the same thing is worse than one |
<!-- /ANCHOR:adr-001-alternatives -->

<!-- ANCHOR:adr-001-consequences -->
### Consequences

Our menu stays one row longer than Notion's on the title column, and that row is greyed. A reader
comparing the two products side by side sees a difference; a reader trying to delete the title
column learns why they cannot. The second is worth more than the first.
<!-- /ANCHOR:adr-001-consequences -->

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| Check | Reading |
|-------|---------|
| Simplicity | Nothing changes; no code moves |
| Performance | No effect |
| Maintainability | The convention stays in one place and keeps applying elsewhere |
| Scope | Explicitly excludes a change the research could have been read as proposing |
| Reversibility | Trivially reversible — it is a decision not to act |
<!-- /ANCHOR:adr-001-five-checks -->

<!-- ANCHOR:adr-001-impl -->
### Implementation

None. Recorded so a later reader does not "fix" the difference.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The wrap phase is superseded, and the resolution rule the research quoted is stale

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Landed on `main`; recorded here |
| **Criterion** | None — the work is done elsewhere |

<!-- ANCHOR:adr-002-context -->
### Context

The research ranked the wrap-off row-height defect **second** by user impact and built its whole
Phase B around landing `worktrees/160-fix-053-wrap-off-rows`. It also read Notion's two-level wrap
control — per-column (`74fe28d3`, `039351aa`) and view-level (`d3acf726`) — as *confirming* the shape
we had already landed in `053` ADR-004.

Both halves need correcting against `main`.

**The defect is closed.** `41513bd3` made the view's Wrap text switch the **gate** rather than a
default a column could outvote, and fixed the phone stylesheet that had been out-specifying the
wrapping class so that switching wrap on stacked chips but left every sentence on one line.
`1a2c7e00` closed the narrower producer: `renderInlineMarkdown` turned a value's literal newlines
into real `<br>` elements, and a `<br>` forces its break under any `white-space` value, so a clipped
cell with its own line breaks kept growing the row. The measured red was 58px against a 36px floor;
after, 36px. Two screenshot scenarios — `table-wrap-off` and `table-wrap-on`
(`tools/screenshots/scenarios/core.mjs:31`) — photograph the same column clipped and wrapped.

**The rule is not what the research says it is.** The research quotes ADR-004 as
`col.wrap ?? config.wrapText` — "a column's own choice always wins". The tree now reads:

```ts
export function resolvesToWrappedCell(colWrap: boolean | undefined, viewWrapText: boolean | undefined): boolean {
  return Boolean(viewWrapText) && colWrap !== false;
}
```

`src/data/column-types.ts:425-427`. The view switch off clips **everything**; on, a column's Clip
mode can still opt out. That is a different rule, and any later reader who takes the research's
version will write the wrong assertion.

### Constraints

- Parent D15: this packet may not rewrite a landed ruling. It may record that one moved.
- `053` owns the wrap control and its ADR-004.
<!-- /ANCHOR:adr-002-context -->

<!-- ANCHOR:adr-002-decision -->
### Decision

**The research's Phase B is superseded and is not carried into this packet as a task or a
criterion.** `053`'s own wrap criterion and its ADR-004 addendum are `053`'s to reconcile, not this
child's — D8 forbids un-ticking or re-ticking a row there. What this packet owns is the correction
of record: **the resolution rule is `Boolean(viewWrapText) && colWrap !== false`**, the view switch
is the gate, and the phone honours it.

Notion's two-level control is recorded as **confirmatory, not directive**: it agrees with the shape
we shipped, which is a reason not to revisit ADR-004 rather than a reason to.
<!-- /ANCHOR:adr-002-decision -->

<!-- ANCHOR:adr-002-consequences -->
### Consequences

The packet loses its second-ranked item and is smaller for it. That is the correct outcome: a
synthesis that opens a phase around a defect fixed while the loop was running claims evidence it
does not have. The general lesson is recorded in `goal.md` D2 — a finding is a hypothesis until it
is re-read against the tree, and the tree moves under a five-iteration loop.
<!-- /ANCHOR:adr-002-consequences -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: Conditional row colour ships; only its naming could move

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 (opened) · 2026-09-06 18:32 (ruled) |
| **Deciders** | The operator |
| **Criterion** | None here — the work lands in `064`, not in this packet |

<!-- ANCHOR:adr-003-context -->
### Context

The digest's divergence table read conditional row colour as having **no match** here, and its
Anytype cross-read escalated that to a "disagreement in existence". Both are wrong, and the research
caught it on two targeted reads: `applyConditionalFormat` sets `--db-conditional-format-bg` on the
`tr` (`src/data/conditional-formatting.ts:168-206`), it is wired at `src/views/table-renderer.ts:85`,
`:866` and `:911`, and `tr.db-conditional-format > td` paints it (`styles.css:1317-1319`) over the
base rule at `:1299-1303`. The digest's grep pattern — `conditional.color|rowColor|rowBackground` —
could not match the symbol names in use.

What is genuinely different is **presentation**. Notion gives it a first-class *Conditional color*
row in the view settings with an explainer (`142cef4e`, listed in `a0d1e399` and `794591f5`). Ours
lives in database settings. That is a discoverability question, not a capability gap.

### Constraints

- Nothing here is a defect, so nothing here is a task.
- Moving the control's home touches `053`'s settings entry.
<!-- /ANCHOR:adr-003-context -->

<!-- ANCHOR:adr-003-decision -->
### Decision

**Accepted — the control gets its own view-settings row.** Operator, 2026-09-06 18:32, verbatim:
*"Yes, own row in view settings"*.

The question put to them was narrow: *do you want the conditional-colour rules surfaced as their own
named view-settings row with an explainer, the way Notion presents them, rather than living in
database settings?* The answer is yes, and it lands where the earlier text said it would: **it is a
`053` toolbar item and belongs to `064`, not to this packet.** No criterion and no task opens here.

**`064` did not exist on `main` at the time of this ruling**, so the pointer was carried here until
it did. **It landed 2026-09-07** and carries the ruling as its criterion 8, `REQ-009` / `AC-012` /
`T014`, recorded in `064` ADR-010 — which also corrects one sentence below against the tree: ours
does **not** live in database settings. `renderConditionalFormatting` is mounted in the view half of
the panel (`view-config-panel-renderer.ts:405`, after the `viewConfig.viewSection` title at `:387`)
and the rules are already per-view (`ViewConfig.conditionalFormats`, `data/types.ts:593`; the
database-level field is deprecated at `:427` and migrated into views on read,
`data-source.ts:893-899`). So the work is the named summary row and its explainer, not a
relocation. What `064` inherits, stated so nothing has to be re-derived: a first-class *Conditional
color* row in the view-settings list with an explainer line, presenting the rules
`applyConditionalFormat` already evaluates (`src/data/conditional-formatting.ts:168-206`, wired at
`src/views/table-renderer.ts:85`, `:866`, `:911`, painted at `styles.css:1317-1319`). The capability
does not move; only its home does. Notion's own presentation is `142cef4e`, listed in `a0d1e399` and
`794591f5`.
<!-- /ANCHOR:adr-003-decision -->

<!-- ANCHOR:adr-003-consequences -->
### Consequences

The ruling leaves the capability exactly as it is and moves only where it is found. The value of
writing it down is that the next
person to grep for conditional colour finds the correction rather than repeating the digest's
mistake — which is the same failure mode `goal.md` D2 names generally: **an absence grep is a claim,
not evidence.**
<!-- /ANCHOR:adr-003-consequences -->
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: Every new colour derives from our tokens and clears the contrast bar in both themes

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Restates `050` ADR-005 and `../design-system.md` §12 |
| **Criterion** | Binds AC-001, AC-005, AC-006 and AC-009 |

<!-- ANCHOR:adr-004-context -->
### Context

Three items in this packet introduce a colour: the frozen-column divider, the resize-handle line and
the vertical-lines border gate. There is a temptation, on a packet whose whole premise is "read
Notion and adopt", to sample the colour from the capture.

**That is impossible here and the reason is worth stating precisely: zero of the 102 opened screens
are dark theme** (digest preamble, §6 Q6). Notion contributes no colour values to this packet at
all — not because we chose not to take them, but because there is nothing to take that would survive
our dark theme.

### Constraints

- `../design-system.md` §12: *"Notion is the visual target and is not a source at all."*
- `050` ADR-005: 3:1 non-text under WCAG 1.4.11, 4.5:1 text under 1.4.3.
<!-- /ANCHOR:adr-004-context -->

<!-- ANCHOR:adr-004-decision -->
### Decision

**Every new tint, line, grip or divider colour derives from our own token scale and is measured in
both themes before its criterion can be `Met`.** The dark-theme half of that measurement belongs to
the operator's device pass (AC-009), because the harness stands in for host theme variables rather
than supplying them.
<!-- /ANCHOR:adr-004-decision -->

<!-- ANCHOR:adr-004-consequences -->
### Consequences

The three colour rows cannot close on a harness read alone. That is a real cost and it is the right
one: a divider that clears 3:1 in light and vanishes in dark is worse than no divider, and only a
device read finds that.
<!-- /ANCHOR:adr-004-consequences -->
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: Freeze is desktop-only, and its divider treatment is undecided

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 (opened) · 2026-09-06 18:32 (ruled) |
| **Deciders** | The operator |
| **Criterion** | AC-001, no longer split — the divider has its value |

<!-- ANCHOR:adr-005-context -->
### Context

Two separate questions arrive together and should not be answered together.

**The scope question has an argument.** The phone stylesheet switches the table to content-driven
auto layout with `width: auto !important` and every data cell capped at 60vw
(`styles.css:21021-21035`), so a phone table has no horizontal overflow for a frozen column to hold
against. Freezing there would be a control with no observable effect. `050` D3 forbids a **silent**
no-phone, which is why this is written down rather than simply skipped.

**The divider question has no argument available.** The digest is explicit that Notion's frozen
state is *inferred from the menu action and never seen as a rendered state* (P7, §6 Q3). No capture
in the 98-screen read shows what a frozen boundary looks like — no shadow, no line, no width, no
colour. Whatever we draw is **ours**, and under ADR-004 it has to work in a theme none of the
captures cover.

### Constraints

- ADR-004 binds the colour.
- `050` D3 requires the phone exclusion to carry its reason in the code, not only here.
- AC-009 owes an iOS read of WebKit's sticky-inside-table behaviour regardless of the answer.
<!-- /ANCHOR:adr-005-context -->

<!-- ANCHOR:adr-005-decision -->
### Decision

**Accepted, in two parts, both now settled.** Part one stands as proposed: freeze ships
**desktop-only**, with the phone reason stated in the code comment. Part two is the operator's,
2026-09-06 18:32, verbatim: *"Subtle shadow when scrolled past"*.

That resolves to a threshold rather than a taste: **nothing at rest, and a soft shadow off the
frozen column's right edge once content scrolls under it.** At `scrollLeft === 0` the frozen
boundary is indistinguishable from any other column boundary — no shadow, no extra line, no width
change. Once the table is scrolled sideways, the last frozen column paints a soft right-edge shadow
so the reader can see that the content is passing *under* it rather than beside it. The shadow is a
token-derived value under ADR-004 and is measured in both themes; nothing is sampled from a Notion
capture, because none shows a frozen state (digest P7, §6 Q3).

The mechanism does not wait on the shadow. T010 to T013 can land with the offsets working and the
shadow added as one rule; the difference is that the rule now has a specified behaviour instead of
an open question.
<!-- /ANCHOR:adr-005-decision -->

<!-- ANCHOR:adr-005-consequences -->
### Consequences

The scroll-conditional shadow costs a scroll listener or a CSS-only equivalent that the plain
always-on line would not have needed, and it buys the property the operator asked for: the frozen
column is invisible until it is doing something. The desktop-only scoping was not declined; had it
been, the phone half needs a different mechanism
entirely — the auto layout would have to go, which reopens a landed phone decision and is a much
larger change than this packet. That is the reason the scoping is proposed explicitly rather than
assumed.
<!-- /ANCHOR:adr-005-consequences -->
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: Where the add-row noun comes from

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 (opened) · 2026-09-06 18:32 (ruled) |
| **Deciders** | The operator |
| **Criterion** | AC-008, unblocked — the source is named |

<!-- ANCHOR:adr-006-context -->
### Context

Notion's add-row affordance names what it adds, and the noun varies with the data source: `+ New
page` on one capture (`19745d87`), `+ New task` on another (`e33466b4`). Ours is a fixed string —
`` `+ ${t("toolbar.new")}` `` at `src/views/table-renderer.ts:982`.

The implementation is trivial. The **product decision is not**, and it is the only reason this row
is not simply scheduled: an Obsidian vault has no "data source" in Notion's sense. The candidate
sources are the view's own name, the folder the notes live in, a per-view configured noun, or a
fixed improvement on "New". Each produces a different string, and one of them — the view name —
produces a bad one for a view called *All* or *Board*.

### Constraints

- Three locales; a derived noun has to be translatable or the feature is English-only.
- `053` owns the toolbar strings.
<!-- /ANCHOR:adr-006-context -->

<!-- ANCHOR:adr-006-decision -->
### Decision

**Accepted — the noun is a per-view setting.** Operator, 2026-09-06 18:32, verbatim: *"Per-view
configured noun, fallback 'New'"*.

Of the four candidate sources — the view's own name, the folder the notes live in, a per-view
configured noun, and a fixed improvement on "New" — the operator took the third, with the fourth as
its fallback. That eliminates the failure mode the alternatives carried: a derived noun cannot
produce `+ New All` or `+ New Board`, because nothing is derived. The reader types the noun for the
view, or types nothing and keeps today's string.

Three consequences follow from the shape and are part of the decision rather than notes on it. The
noun is **view-scoped**, so it belongs to `ViewConfig` and survives serialise → parse like any other
view field. It is **reader-authored text**, so it is not a translation key — but the *fallback* and
the surrounding `+ New` framing are, and the key has to exist in **all three locales** so the
unconfigured button reads correctly in each. And an **empty or whitespace-only** configured noun is
the unconfigured case, not a button that reads `+ New ` with a trailing space.

A related idea is **already eliminated and should not come back with this one**: restyling our open
affordance as Notion's *OPEN* pill. Ours is a button with an `aria-label`, not a pill label, and
Notion varies the word per source anyway (`19745d87`, `e33466b4`) — the noun idea is where that
energy belongs, and it is here.
<!-- /ANCHOR:adr-006-decision -->

<!-- ANCHOR:adr-006-consequences -->
### Consequences

A view that nobody configures is exactly as good as it is today, which is the property that made
this safe to accept. A view that is configured gains a button that names what it adds. The cost is
one more field in `ViewConfig` and one more row in whatever surface edits a view's settings — small,
and paid once.
<!-- /ANCHOR:adr-006-consequences -->
<!-- /ANCHOR:adr-006 -->

---

<!-- ANCHOR:adr-007 -->
## ADR-007: Whether a type-picker row ships before the data type behind it

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted — option 1, widened |
| **Date** | 2026-09-06 (opened) · 2026-09-06 18:32 (ruled) |
| **Deciders** | The operator |
| **Criterion** | AC-004, unblocked — the type set is named and counted |

<!-- ANCHOR:adr-007-context -->
### Context

Notion offers Person, URL, Email and Phone plus a set of audit types
(`af7a18b0`, `7f2dbda0`, `3b3c3c26`) that our thirteen do not carry. The research proposed shipping
**icons and labels first** and deferring the data types — five more rows in the type popover, with
`row.computed` carrying the audit values.

Reconciling that against the tree turned up two facts the research did not have.

**A type is four registries, not one.** The union (`src/data/types.ts:82`), `PROPERTY_TYPES`
(`src/views/record-surface/type-picker.ts:28-32`), `PROPERTY_TYPE_ICON_NAMES`
(`src/views/property-type-icon.ts:32-46`) and `COLUMN_TYPE_LABELS`
(`src/data/column-types.ts:135-151`) all enumerate thirteen members, and the grouped submenu slices
`PROPERTY_TYPES` at 6 and 9 (`src/views/column-menu.ts:262-264`), so an appended type silently lands
in Advanced whatever it is. The research's threshold — "13 → 18 rows, one glyph each" — is right
about the count and understates the change by three files.

**A row with nothing behind it is a promise the product cannot keep.** `type-picker.ts:6-12` records
this repository's own view of the adjacent case: a format missing from a dropdown is unexplainable, a
**disabled** format carrying its reason is not. A row that is enabled and produces a column nothing
can render or edit is neither.

### Constraints

- Person in particular has no obvious value source: a person is not a note, and an Obsidian vault
  has no user directory. Recorded as an inference, not a finding.
- `054` owns `type-picker.ts` and `property-type-icon.ts`.
<!-- /ANCHOR:adr-007-context -->

<!-- ANCHOR:adr-007-decision -->
### Decision

**Accepted: option 1, and widened past what option 1 asked for.** Operator, 2026-09-06 18:32,
verbatim: *"All types or add more as needed"*.

That is the largest of the three options below and it is taken deliberately: the rows ship
**enabled, with a real data type behind each**, and the set is not capped at the four the research
named. Concretely, this packet ships **Person, URL, Email and Phone** *and* the four audit types —
**created time, created by, last edited time, last edited by** — as real types across **all four
registries**, plus any further Notion property type the digest shows we lack.

Reading `af7a18b0`'s canonical list (digest §P2 and the type-list row at digest `:203-204`) against
our union, the set of types we lack is exactly eight: Person, URL, Email, Phone, Created time,
Created by, Last edited time, Last edited by. Notion's Formula and Rollup are already ours as
`computed` and `rollup`; Files & media is `files`; Multi-select, Status, Date and Checkbox are all
present. So **the type count moves 13 → 21**, not 13 → 18 as the research estimated, and that
correction is the operative half of this ruling for anyone reading AC-004.

The four audit types are read-only and computed from the note, which makes them the cheapest half of
the work: `row.computed` already carries values of that shape.

**One implementation decision stays open and is recorded here rather than blocking the row.**
**Person has no vault value source.** An Obsidian vault has no user directory, so a Person value is
either a wikilink to a person note or plain text, and the two produce different storage, different
rendering and a different editor. That choice is **owed an ADR in the implementing packet, written
before the Person renderer** — it is an open implementation decision, not a block on this one, and
the other seven types do not wait on it.

The three options originally put, kept for the record:

1. **Ship the rows enabled**, with a minimal text-backed renderer behind each, so a URL column is a
   text column that knows it is a URL. Largest, and the only option where the row is honest.
2. **Ship the rows disabled**, each carrying its reason, following `type-picker.ts`'s own convention.
   Cheapest, and it makes the gap explainable rather than invisible.
3. **Defer the whole item** until a data type earns its way in on its own. Zero cost, and the type
   set stays at thirteen.

The one option that was **not** on the table is shipping enabled rows with nothing behind them, and
the ruling does not put it back: option 1 is chosen precisely because it is the one where every row
is honest. The four-registry agreement check lands with it — that guard is the durable part of this
row and did not depend on the answer.
<!-- /ANCHOR:adr-007-decision -->

<!-- ANCHOR:adr-007-consequences -->
### Consequences

The packet grows by roughly the size of everything else in it combined — eight types, each with a
glyph, a label, a renderer and, for the four editable ones, an editor, across four registries plus
the grouped submenu's slice boundaries. That was named as the honest reason option 1 was not the
default, and the operator took it anyway. The two consequences that need watching: the submenu slices
`PROPERTY_TYPES` at 6 and 9 (`src/views/column-menu.ts:262-264`), so eight appended types land in
Advanced unless the boundaries move with them; and Person's value source is an open decision that
must be settled in writing before its renderer exists, or the type ships with a storage shape nobody
chose.
<!-- /ANCHOR:adr-007-consequences -->
<!-- /ANCHOR:adr-007 -->

---

<!-- ANCHOR:adr-008 -->
## ADR-008: Person's vault value source, and the two audit types with the same gap

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-07 |
| **Deciders** | This implementation, per ADR-007's T021a carve-out |
| **Criterion** | Unblocks the Person, created-by and last-edited-by renderers under AC-004 |

<!-- ANCHOR:adr-008-context -->
### Context

ADR-007 shipped eight types and named one open implementation decision: Person has no vault-native
value source, because a person is not a note and an Obsidian vault has no user directory. Writing
the renderer surfaced a second instance of the identical gap in the same batch — created-by and
last-edited-by are read-only "who" audit types, and a single-user local-first vault has no author
metadata to read either. Created-time and last-edited-time have no such problem: `file.stat.ctime`
and `file.stat.mtime` are exact, already-shipped Obsidian data (`src/data/file-fields.ts` reads them
for `file.ctime`/`file.mtime` today).

Two existing renderers already answer the "what does a value with no vault-native source look like"
question, in opposite ways worth choosing between deliberately rather than by accident:

- A **link-mode text column** (`col.textRenderMode === "link"`) accepts a wikilink or a URL, and
  `renderTextLink`/`parseTextLink` already parse `[[Person Name]]` alongside a plain string. Nothing
  new to build; a Person value is exactly this shape one step removed.
- A **relation column** requires a target database and a real note per value, which a "person" has
  no natural analogue for — there is no "people database" concept anywhere else in this schema.
<!-- /ANCHOR:adr-008-context -->

<!-- ANCHOR:adr-008-decision -->
### Decision

**Person stores a wikilink or plain text, reusing the existing link-mode text renderer/editor
verbatim** — not a new value shape, not a relation. `renderTextLink` and `parseTextLink` already do
exactly what a Person value needs: `[[Person Name]]` renders as an internal link to that note when
one exists, and plain text (a name with no corresponding note) renders as text. The cell editor is
the same plain-text single-line editor every other text-shaped column already uses; there is no
Person-specific input widget. This is the "vault links/text" framing the operator's own review of
this packet named, made concrete: both are already one renderer, not two.

**Created-by and last-edited-by are a frontmatter passthrough, not a computed value.** Unlike the
two time-based audit types, nothing in Obsidian tracks who created or last touched a note, so these
two types read `row.frontmatter[col.key]` exactly like an ordinary text column — a reader (or a
template) fills the field in by hand, same as they would today with a plain text column named
"Author". What the type actually changes is that the cell renders **read-only**: no inline editor
opens on it, matching the other two audit types' framing as attribution someone else established
rather than something to type into this cell. A vault that never populates the field simply shows
the empty placeholder, same as any other unset property.
<!-- /ANCHOR:adr-008-decision -->

<!-- ANCHOR:adr-008-alternatives -->
### Alternatives Considered

| Option | Why not |
|--------|---------|
| A dedicated Person value shape (`{name, notePath}`) with its own editor | Duplicates what the link-mode text renderer already does correctly, for a value that is a string either way |
| Person as a `relation` to a manually-maintained "People" database | Invents a database concept this schema has no other use for, and gates the type behind a setup step Person's own row in the picker does not ask for |
| Created-by/last-edited-by computed from the note's own frontmatter history | There is no history to compute from — a single-user local-first vault keeps no revision author log |
| Leave created-by/last-edited-by editable like a plain text column | Contradicts their own "audit type" framing (ADR-007) and the disabled-Advanced-group placement next to the two time types they ship beside |
<!-- /ANCHOR:adr-008-alternatives -->

<!-- ANCHOR:adr-008-consequences -->
### Consequences

Person, URL, Email and Phone are now four renderers built from two existing primitives
(`renderTextLink`'s scheme-link path, generalized by type instead of by column flag) rather than
four bespoke ones. Created-by and last-edited-by carry no auto-population — a vault that wants them
filled writes to that frontmatter key the same way it writes any other property, most likely from a
template. That is a real limitation worth stating plainly: these two audit types describe an
intent (attribution) that this plugin cannot verify or enforce, unlike the two time-based ones next
to them in the menu, which are exact.
<!-- /ANCHOR:adr-008-consequences -->
<!-- /ANCHOR:adr-008 -->
