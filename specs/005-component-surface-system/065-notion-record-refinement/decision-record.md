---
title: "Decision Record: Notion Record Refinement"
description: "Eight decisions: the four Notion-versus-Anytype conflicts a landed ruling already settles, and the four extensions the operator ruled on 2026-09-06 19:05, quoted verbatim below."
trigger_phrases:
  - "065 adr"
  - "notion versus anytype record"
  - "empty prompt ruling"
  - "hidden group eye ruling"
importance_tier: "important"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/065-notion-record-refinement"
    last_updated_at: "2026-09-07T01:30:00Z"
    last_updated_by: "implementation-session"
    recent_action: "T012's population and T013's grammar both landed; ADR-005/006/008 fully implemented"
    next_safe_action: "ADR-007's cover/icon strip stays Deferred; no further action here"
    blockers: []
    key_files:
      - "specs/005-component-surface-system/054-record-and-relation-surfaces/design-trueup.md"
      - "specs/005-component-surface-system/054-record-and-relation-surfaces/notion-screens-digest.md"
      - "src/views/record-surface/hidden-properties.ts"
      - "src/views/record-surface/record-header.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-065-adr"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions:
      - "The empty-fields home is the existing showEmptyFields switch, resolved in the implementing leg"
      - "ADR-001 to ADR-004 are settled by landed Anytype rulings; Notion loses each"
      - "The hidden group adopts Notion's full row grammar (operator 19:05, 'Mimic notion also regarding other features we might be missing')"
      - "The group holds view-hidden columns, like Notion and the peek (operator 19:05)"
      - "The record-level cover question is Deferred (operator 19:05)"
      - "The add-property entry is Notion's trailing row (operator 19:05)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Notion Record Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> **How to read the statuses.** Anytype parity is the default for these surfaces (`051` ADR-007,
> `056`, `057`, `054` D6) and the parent's D15 makes Notion refinements additive. So a Notion
> pattern that contradicts a **landed** ruling is settled by that ruling and is recorded `Accepted`
> here — ADR-001 to ADR-004. The four extensions past any ruling — ADR-005 to ADR-008 — were put to
> the operator with their thresholds written and were **ruled on 2026-09-06 19:05**: three
> `Accepted`, one `Deferred`, each quoted verbatim below. ADR-005's ruling also asked for a sweep of
> everything else Notion's record surface carries that ours does not; that sweep is the last section
> of this document, and it found **one** gap rather than the seven the digest's prose implies.
>
> All Notion evidence cites a screen id in `../054-record-and-relation-surfaces/notion-screens-digest.md`,
> the only permitted source of Notion facts. No image was opened by the loop or by this packet.

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The empty-value word stays format-specific; Notion's universal "Empty" is refused

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Settled by A3, a landed ruling; recorded here, not taken here |

---

<!-- ANCHOR:adr-001-context -->
### Context

Notion renders the literal word "Empty" on every empty property row, every type, grey [screens
`16ddd22c`, `bf2171ff`]. That is exactly the state this program was in before A3, and A3 went the
other way on Anytype evidence: a format-specific prompt naming the action — "Select options", "Enter
number", "Add email" — with Anytype's own placeholder *colours* refused below 4.5:1
(`../054-record-and-relation-surfaces/design-trueup.md` §A3).

The research loop's job was to say whether a second product agreeing with our pre-fix state is
grounds to revert. It is not, and the digest reaches the same conclusion unprompted at §5(1).

What the loop did find is that A3's rollout is half-landed. `054/goal.md` §3 criterion 2 reads "on
the record sheet **and board cards**, with the word 'Empty' gone where an editor exists". The record
sheet consumes the prompt (`src/views/record-detail-panel.ts:515`); the board card carries its own
`getEmptyDisplayValue` that never imports it and returns `t("common.empty")` for every non-checkbox
format, the three ruled formats included (`src/views/board-renderer.ts:754-757`).

### Constraints

- A3 is landed and this packet is additive; it may not reopen the ruling.
- `getPropertyEmptyPrompt` covers three formats today (`src/views/record-surface/property-row.ts:286-291`).
  A3's captured Anytype copy prompts non-option formats too, "Enter number" among them.
- No capture in the bounded sources shows an Anytype **date**, **text**, **currency**, **datetime**
  or **files** empty row. The copy for those five is ours to mint.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: keep A3's format-specific prompts, finish the rollout on the board card, and extend the
prompt to every format that has an editor.

**How it works**: `getEmptyDisplayValue` becomes a delegation to `getPropertyEmptyPrompt`, preserving
the `multi-select → [prompt]` array shape and the `checkbox → false` case exactly as
`record-detail-panel.ts:514-519` already does. `getPropertyEmptyPrompt` gains `number`, `date`,
`datetime`, `currency`, `text` and `files` in A3's verb+noun shape, with keys in both locales.

**The five minted strings are an inference and are marked as one.** A3's shape is captured; the exact
words for the five formats it never captured are not. They are cheap to re-word — one i18n key each,
no mechanism change — and the operator may do so without touching anything else.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Keep A3, finish the rollout, extend the formats** | Closes a criterion `054` already wrote; one word disappears from the two surfaces users edit most; the copy names the action | Five strings have no reference capture behind them | 9/10 |
| Adopt Notion's universal "Empty" | One string, no per-format copy to mint, a second product agrees | Reverts a landed ruling on the strength of the state that ruling replaced; the digest itself refuses this at §5(1) | 2/10 |
| Finish the board card only, leave the un-ruled formats | Strictly inside A3's captured evidence | Leaves "Empty" on the surface for six of ten formats, which is the defect stated in different words | 5/10 |

**Why this one**: the board half is a criterion `054` already owes, and stopping at the three ruled
formats would leave the word this ruling exists to remove on most of the surface.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- The string "Empty" disappears from every record-sheet and board-card field that has an editor.
- One producer of empty-value copy instead of two; the board card stops being a second source of
  truth for a behaviour the record surface already owns.

**What it costs**:
- Five user-visible strings with no capture behind them. Mitigation: marked as an inference here and
  in `spec.md` REQ-002; re-wording is one key each.
- Two locale tables to keep in step. Mitigation: both are edited in the same change, and a missing
  key renders as a raw key, which is loud.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The delegation loses the `multi-select` array shape | M | Mirror `record-detail-panel.ts:514-519`; assert the shape in a unit test |
| The delegation loses `checkbox → false` and renders a stray word | M | Same test; the `checkbox` row is an explicit matrix axis in `plan.md` |
| A minted string reads wrong in Chinese | L | Both tables are authored together; the operator can re-word either side |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | `054/goal.md` §3 criterion 2 names board cards and the board card renders "Empty" today |
| 2 | **Beyond Local Maxima?** | PASS | Notion's universal word was the alternative, examined against the ruling that replaced it |
| 3 | **Sufficient?** | PASS | A delegation and six i18n keys; no new primitive |
| 4 | **Fits Goal?** | PASS | It is the last visible trace of the pre-ruling state on the two most-edited surfaces |
| 5 | **Open Horizons?** | PASS | One producer of empty copy is what a future format inherits |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- `src/views/board-renderer.ts:754-757` — the body becomes a delegation.
- `src/views/record-surface/property-row.ts:286-291` — six formats added.
- `src/i18n.ts` — six keys per locale.

**How to roll back**: `git revert` Leg A's commit. The change is render-time; nothing is persisted,
so the previous strings return exactly.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The phone label column stays at A2's fixed 96px; Notion's free-flowing rows are refused

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Settled by A2, a landed ruling |

---

<!-- ANCHOR:adr-002-context -->
### Context

Notion's record pages carry no cross-row column alignment — each row's label and value flow at their
own widths [digest §3 P1]. Our phone record sheet uses a fixed `flex: 0 0 96px` label column
(`styles.css:10459-10461`), which A2 took from the Anytype iOS model and ruled to keep:
*"an established value beats a neighbouring measurement of a different population"*
(`../054-record-and-relation-surfaces/design-trueup.md` §A2, "Mobile label column").

A2 is landed, and the same section explicitly declines to reopen the phone label **size**, which is
pinned at `--db-font-base` under the iOS 16px input-zoom floor (`styles.css:10462-10468`).

### Constraints

- Changing the phone arm's `font-size` would breach the input-zoom floor, which is a platform
  constraint rather than a taste one.
- C3's desktop change must be scoped to the desktop selector and must not reach `:10459-10468`.
<!-- /ANCHOR:adr-002-context -->

---

<!-- ANCHOR:adr-002-decision -->
### Decision

**We chose**: keep the 96px fixed label column and the phone label size exactly as A2 ruled them.
Notion's free-flowing rows are a named divergence with no action.

**How it works**: nothing changes. This ADR exists so that C3's desktop edit carries an explicit
guard — the phone arm's computed `font-size` is read in the same lane run and asserted unchanged —
rather than relying on a selector staying scoped by accident.
<!-- /ANCHOR:adr-002-decision -->

---

<!-- ANCHOR:adr-002-consequences -->
### Consequences

**What improves**:
- The one real risk in Leg A — a CSS change leaking to the phone arm — becomes an asserted guard
  instead of a hope.

**What it costs**:
- Nothing. This is a refusal, recorded.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future leg equalises the phone label too, reading A2's desktop rule as universal | M | The guard assertion fails; this ADR names the reason |
<!-- /ANCHOR:adr-002-consequences -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: The add-property picker stays search-first; Notion's name-first order and AI chips are refused, its name-carrying insight is adopted

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Settled by A5 and `054` D6, both landed |

---

<!-- ANCHOR:adr-003-context -->
### Context

Notion's add-property flow puts a **name field** and **AI Autofill** suggestion chips above the
searched format list, so a property is named and typed in one pass [digest screen `1589e7c8`, §3 P4].
Anytype's pickers open with one search-or-create field, which is A5's ruled grammar
(`../054-record-and-relation-surfaces/design-trueup.md` §A5) and what we already ship
(`src/views/record-surface/add-property-row.ts:54-116`).

The digest's own ruling applies verbatim: there is no landed picker on the record sheet to protect,
so Anytype's ordering stays on record until an operator says otherwise [digest §5(3)]. The AI half is
excluded regardless by `054/goal.md` D6.

But the loop found a real defect underneath the stylistic question. Selecting a format calls
`createProperty(type)` with **no label** (`src/views/column-manager-renderer.ts:200`), and only the
create fall-through uses the typed query — and it forces the new column to be `text`
(`:201`). So typing "Due Date" and picking **Date** yields an unnamed Date column, and a *named* Date
column is impossible in one pass. Every layer below already forwards the label
(`column-manager-renderer.ts:180-181` → `src/views/database-view.ts:5088`), and the create row's own
`Create "${query}"` label (`add-property-row.ts:91-95`) already promises the name is wanted.

### Constraints

- A5's order is landed and this packet is additive.
- `054` D6 excludes AI-generated anything.
- The handle exposes `searchInput` (`add-property-row.ts:43`, `:108`), so the query is readable at
  selection time without changing the picker's shape.
<!-- /ANCHOR:adr-003-context -->

---

<!-- ANCHOR:adr-003-decision -->
### Decision

**We chose**: keep the search-first order, exclude the AI chips, and adopt only P4's insight that the
typed name should survive into the created property.

**How it works**: `onSelect` reads the query from the handle's `searchInput` at selection time and
passes it as `createProperty(type, query)`. `onCreateNew` is untouched. No field is added, no order
is changed, and the picker looks identical.
<!-- /ANCHOR:adr-003-decision -->

---

<!-- ANCHOR:adr-003-consequences -->
### Consequences

**What improves**:
- A named column of a chosen format becomes possible in one pass, which it is not today.
- The create row's existing promise stops being conditional on picking no format.

**What it costs**:
- Nothing structural. Two lines and a unit test.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A user typing a filter term rather than a name gets it as the column label | M | The same is already true of the create fall-through; the modal shows the label before saving |
| `searchInput` is renamed or removed | L | Compile-time failure, which is the intended mode |
<!-- /ANCHOR:adr-003-consequences -->
<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: The featured line's content model is A1's featured relations, not Notion's freeform mention

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted for the content model; the **landing** is unscheduled and operator-gated |
| **Date** | 2026-09-06 |
| **Deciders** | Settled by A1, a landed design ruling |

---

<!-- ANCHOR:adr-004-context -->
### Context

A1 rules that the object page reads as a page because of a **featured line**: one inline row of
middot-separated relations directly under the title, secondary colour, one line
(`../054-record-and-relation-surfaces/design-trueup.md` §A1). The ruling is landed in the design
record and **not in code** — `buildDesktopRecordHeader` renders icon → title → trailing buttons
(`src/views/record-surface/record-header.ts:58-78`), and a grep for `featured` across the record
surface returns zero hits.

Notion corroborates the **placement** and not the content model: a metadata line sits directly under
the title [screen `d2b6da49`] and a caption/link row sits between cover and body [screen `62fe716c`].
Notion's content there is a freeform mention; A1's is featured relations.

This is not a real conflict — both put a secondary line under the title — and A1 wins on content
because Anytype parity is the default. What Notion adds is a second citation for the placement.

### Constraints

- The peek's title-only header (`record-header.ts:91-98`, consumed at
  `src/views/table-record-peek.ts:213-221`) and the properties panel's select-all header must stay
  unaffected by any slot added for this.
- Landing it changes an exported primitive's options, which is why this packet carries
  `--architectural` in its level scoring.
<!-- /ANCHOR:adr-004-context -->

---

<!-- ANCHOR:adr-004-decision -->
### Decision

**We chose**: A1's featured relations as the content model, with the placement corroborated by Notion
and the design otherwise unchanged.

**How it works, when it lands**: `buildDesktopRecordHeader` gains an optional
`renderFeatured?: (header: HTMLElement) => void` slot rendered between the title
(`record-header.ts:62-75`) and `renderTrailing` (`:77`); the caller
(`src/views/record-detail-panel.ts`) supplies the middot row from the view's featured relations.
Threshold: one line, `--text-muted`, single-line clamp, under the title and above the field list.
Red today: zero `featured` tokens in any record-surface file.

**It is not scheduled by this packet.** A1's landing is `054`'s or a later leg's, and this packet's
scope is the refinement the Notion loop justified — not the Anytype ruling's implementation.
<!-- /ANCHOR:adr-004-decision -->

---

<!-- ANCHOR:adr-004-consequences -->
### Consequences

**What improves**:
- The slot's shape and threshold are written, so whoever lands A1 does not re-derive them.

**What it costs**:
- A ranked candidate stays unlanded. That is the honest state: it is Anytype's ruling, not Notion's
  finding, and this packet does not schedule other packets' work.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A later leg adopts Notion's freeform-mention content because the placement matched | M | This ADR names the content model and the reason A1 wins |
<!-- /ANCHOR:adr-004-consequences -->
<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005: The hidden-properties group adopts Notion's full hidden-row grammar

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted 2026-09-06 19:05** — and widened past what it asked |
| **Date** | 2026-09-06 (opened) · 2026-09-06 19:05 (ruled) |
| **Deciders** | The operator |

---

<!-- ANCHOR:adr-005-context -->
### Context

Notion's hidden-properties grammar gives **every row** a drag handle, type icon, name, eye toggle and
chevron, with per-section bulk links, the Hidden section rendered only when non-empty, and the count
on the entry-point row [screens `2f52d1bc`, `406e67e2`, `9867cb76`, `cc8b241a`, `01cde7f6`,
`52348672`, `794591f5`].

Ours is a disclosure only: a toggle with a count and a fields container
(`src/views/record-surface/hidden-properties.ts:44-73`). Rows come from the caller's callback with no
per-row affordance host, so re-showing a hidden field means leaving the sheet and re-editing the
view's column config.

**A4 stands and never covered this.** A4 ruled the group's *shape* — take the peek's disclosure, add
the count (`../054-record-and-relation-surfaces/design-trueup.md` §A4) — and said nothing about
per-row affordances. The digest files this correctly as new evidence against a closed ruling that
needs an operator call rather than an inference [digest §6, first bullet].

Two things already exist that would make it cheap: `buildCheckboxPropertyRow`
(`src/views/record-surface/property-row.ts:330-395`) already carries the handle/eye/chevron anatomy,
and the column manager already owns the visibility persist path
(`src/views/column-manager-renderer.ts:245-252`, `:333`).

### Constraints

- ADR-006 comes first: an eye that toggles *view* visibility is meaningless in a group that holds
  *empty fields*. The population question is upstream of the affordance question.
- `HiddenPropertiesGroupHandle.render`'s signature changes if this lands, which touches the table
  peek as well as the record sheet.
<!-- /ANCHOR:adr-005-context -->

---

<!-- ANCHOR:adr-005-decision -->
### Decision

**Accepted, and widened.** Operator, 2026-09-06 19:05, verbatim: *"Mimic notion also regarding other
features we might be missing"*. The question put was the per-row eye and a bulk link; the answer
adopts **Notion's whole hidden-row grammar** (P3 in the digest), not just its two cheapest rows:

- every row carries a **drag handle**, the property's **type icon**, its **name**, an **eye toggle**
  and a **chevron** — the anatomy `buildCheckboxPropertyRow`
  (`src/views/record-surface/property-row.ts:330-395`) already has and this group's rows lack;
- the group splits into **"Shown" and "Hidden" sections**, each with its **bulk link** ("Hide all" /
  "Show all"), and the Hidden section renders **only when non-empty**;
- the **count stays on the entry row**, exactly as A4 already ruled; Notion's own title row keeps its
  eye disabled — the title cannot be hidden — and ours does the same for whatever occupies that slot.

**Threshold, extended:** toggling the eye shows or hides the field in place without leaving the
sheet; the group count updates; each section's bulk link acts on its own section; the Hidden section
is absent while nothing is hidden.
**Red today:** zero eye controls inside `db-record-detail-hidden-group`.

The ruling's second half — *"also regarding other features we might be missing"* — is the sweep
recorded in its own section below.

**Not written**: any of the code. The gated legs now convert to task rows (T012, T013) in ruling
order: the population first (ADR-006), the grammar on it.
<!-- /ANCHOR:adr-005-decision -->

---

<!-- ANCHOR:adr-005-consequences -->
### Consequences

**What improves**:
- A hidden field becomes recoverable from the surface that reports it hidden, with the full row
  anatomy to do it precisely.
- One bulk control per section instead of one that only reaches the column manager's list.

**What it costs**:
- An exported primitive's contract changes, and both its consumers move together.
- The sheet's group becomes a two-section surface rather than a single disclosure — more DOM on the
  phone sheet, mitigated by the collapsed-by-default group.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The grammar lands before ADR-006's population, giving the eye an ambiguous meaning | H | Ruling order: population first (T012), grammar on it (T013) |
| The peek's group inherits an affordance nobody asked for there | M | The host is optional; the peek opts in or does not |
| A section header row or bulk link renders while empty | L | The threshold asserts the Hidden section is absent while nothing is hidden |
<!-- /ANCHOR:adr-005-consequences -->
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: What the record sheet's hidden-properties group actually holds

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted 2026-09-06 19:05** |
| **Date** | 2026-09-06 (opened) · 2026-09-06 19:05 (ruled) |
| **Deciders** | The operator |

---

<!-- ANCHOR:adr-006-context -->
### Context

One label names two different populations, and neither is Notion's.

- The **record sheet's** group holds **empty fields** — columns filtered in because
  `config.showEmptyFields !== true` (`src/views/record-detail-panel.ts:384-393`). View-hidden columns
  never reach the sheet at all: the caller passes visible columns only.
- The **table peek's** group holds **view-hidden columns** — the complement of `visibleKeys`
  (`src/views/table-record-peek.ts:246-248`).
- **Notion's** "Hidden in `<surface>`" section holds view-hidden columns [screens `cc8b241a`,
  `7ffa073f`].

Both render under `t("panel.hiddenProperties")` = "Hidden properties ({count})" (`src/i18n.ts:569`).

The user-visible consequence: hide a column in view config and it vanishes from the record sheet
entirely, while an unrelated "Hidden properties (3)" sits there counting empty fields.

**Neither the digest nor the true-up carries this.** It came from reading the two consumers'
populations side by side, and it is the reason ADR-005 cannot be taken first.

### Constraints

- A4's landed shape — one conditional group, one count — is not reopened by any answer here. This is
  about what goes *in* the group, not what the group looks like.
- The peek already receives both the full column list and the visible set (`table-record-peek.ts`
  options), so the data is available on both surfaces either way.
<!-- /ANCHOR:adr-006-context -->

---

<!-- ANCHOR:adr-006-decision -->
### Decision

**Accepted — view-hidden columns, like Notion and the peek.** Operator, 2026-09-06 19:05, verbatim:
*"View-hidden columns, like Notion and the peek"*.

Of the three ways offered, the ruling names the population: the record sheet's hidden-properties
group holds **view-hidden columns** — the same population Notion's "Hidden in `<surface>`" section
(`cc8b241a`, `7ffa073f`) and our table peek (`table-record-peek.ts:246-248`) hold, and neither of
which carries an empty-fields population. The mechanism is the one option 1 already wrote: the
caller passes the full column list plus the hidden-keys set, as the peek already receives both, and
the count covers the population it names.
*Threshold:* a column hidden in view config appears inside the sheet's group and is counted.
*Red today:* it does not appear at all.

**Resolved in the implementing leg.** The sheet's group held **empty fields** before this leg
(`record-detail-panel.ts:384-393`), and the ruling does not put them in the group. The operator's own
fold of this ruling settled the home directly: an empty field stays visible inline, or behind the
existing `showEmptyFields` switch — the same rule the board card already applies
(`board-renderer.ts`'s `shouldShowEmptyField`), rather than a second population folded into the
grammar's Shown section. T012 implements exactly this: an empty visible field with the switch off is
skipped from the field list rather than parked anywhere, and the hidden group holds only view-hidden
columns.
<!-- /ANCHOR:adr-006-decision -->

---

<!-- ANCHOR:adr-006-consequences -->
### Consequences

**What improves**:
- One label means one thing across two surfaces — the exact divergence this ADR was opened to name.
- ADR-005's eye acquires an unambiguous meaning before the grammar lands.

**What it costs**:
- The sheet's group holds the view's hidden columns, which on heavily-configured views is most of
  them — mitigated by the collapsed-by-default group and the only-when-non-empty Hidden section.
- The caller's signature changes on one surface.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Merging makes the group the largest thing on the sheet | M | The group is collapsed by default and stays conditional |
| An empty field disappears with no home named | Resolved | The operator's fold names the home: visible inline, or behind `showEmptyFields`, matching the board card's own rule |
<!-- /ANCHOR:adr-006-consequences -->
<!-- /ANCHOR:adr-006 -->

---

<!-- ANCHOR:adr-007 -->
## ADR-007: Who owns a record-level cover and icon, and whether one is wanted

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Deferred 2026-09-06 19:05** (operator) |
| **Date** | 2026-09-06 (opened) · 2026-09-06 19:05 (ruled) |
| **Deciders** | The operator |

---

<!-- ANCHOR:adr-007-context -->
### Context

Notion's cover system is large: a six-tab picker (Gallery / Upload / Link / Unsplash / AI / Remove)
[screen `18d621d0`], a separate Reposition drag mode with Save and Cancel [screen `bfddb457`], an ALT
badge opening an alt-text dialog [screens `9d90280d` → `3ebe4893`], an upload-in-progress state on
the cover itself [screen `b5352c94`], hover ghost buttons on an unset header [screen `56e2ae1a`], and
the icon overlapping the cover's bottom-left corner [screen `ab313e42`]. Cover height is ≈29% of page
height, eyeballed by the digest's analyst.

We have **no cover on any record file**. The digest records the ownership question as `051`'s
shell-ownership question (`054` D8) before it is a content question, and the true-up's A1 names no
cover: Anytype-parity evidence for a record-level cover is **absent** from the bounded sources.

No operator ruling is overridden either way. This is unowned, not contested.

### Constraints

- The AI tab is excluded by `054` D6 regardless of any answer here.
- Reposition is a touch gesture and the icon-over-cover overlap is a phone-layout claim, so both are
  **operator-device-only** checks if a cover is ever adopted — this packet's only device-only items
  beyond the standing rows.
<!-- /ANCHOR:adr-007-context -->

---

<!-- ANCHOR:adr-007-decision -->
### Decision

**Deferred.** Operator, 2026-09-06 19:05, verbatim: *"Deferred"*. Neither wanted-now nor refused:
the ownership question and the feature are parked together, and the packet ships without a cover.
The recommendation this ADR carried — decline for now, route the ownership question rather than open
a task — is the state the ruling makes permanent for this packet, with the difference that it is now
the operator's deliberate disposition rather than this packet's inference.

What the deferral preserves: the sizing argument (a feature sized like the icon picker multiplied by
upload, reposition and alt-text states), the AI tab's standing exclusion (`054` D6), the absence of
Anytype evidence in the bounded sources, and the digest's named gaps — the six-tab picker, the
Reposition mode, the ALT badge and dialog, the upload-in-progress state — all stay written here so
reopening the question does not re-derive them.
<!-- /ANCHOR:adr-007-decision -->

---

<!-- ANCHOR:adr-007-consequences -->
### Consequences

**What improves**:
- The largest Notion pattern in the harvest carries the operator's own disposition instead of an
  unanswered gap in a digest nobody re-reads.

**What it costs**:
- The record surface stays without the most visually obvious Notion feature — deliberately, by
  ruling, and revisitable without re-litigating the reasoning.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The deferral is read as a refusal and the pattern is never re-examined | M | This ADR keeps the evidence, the sizing and the ownership question written for whoever reopens it |
<!-- /ANCHOR:adr-007-consequences -->
<!-- /ANCHOR:adr-007 -->

---

<!-- ANCHOR:adr-008 -->
## ADR-008: Where the record sheet's add-property entry sits

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Accepted 2026-09-06 19:05** — C6 / AC-009 / T007 unblocked |
| **Date** | 2026-09-06 (opened) · 2026-09-06 19:05 (ruled) |
| **Deciders** | The operator |

---

<!-- ANCHOR:adr-008-context -->
### Context

Notion ends its record property list with a plain-text "+ Add a property" row, and puts "Add a
comment…" below a hairline as its own zone [screens `16ddd22c`, `bf2171ff`].

Anytype puts a `+` on the **section header row** instead
(`../054-record-and-relation-surfaces/design-trueup.md` §A4).

Our record sheet has **no add-property entry at all** — `src/views/record-detail-panel.ts` imports
nothing from `add-property-row.ts` — even though the search-first picker exists
(`src/views/record-surface/add-property-row.ts:54-116`) and the column manager renders its own
"+ New property" row.

**Neither placement is ruled for this surface.** A4's ruling covers the hidden group, not the add
entry, so this is a genuine Notion-versus-Anytype divergence with no landed answer — which is why it
is Proposed rather than Accepted, and why C6 is the one criterion in this packet that an agent may
not start.

### Constraints

- The row consumes `052`'s picker host per `054` D8, so `052`'s host must exist before it lands.
- Whatever the placement, the row measures at or above the 44px touch floor on the phone sheet.
- T001's answered question seats the picker *beside* S3's quick-add row (`054/goal.md`
  `_memory.answered_questions`), which constrains the picker's host and not the entry's placement.
<!-- /ANCHOR:adr-008-context -->

---

<!-- ANCHOR:adr-008-decision -->
### Decision

**Accepted — Notion's trailing row.** Operator, 2026-09-06 19:05, verbatim: *"Trailing '+ Add a
property' row"*.

The question put was a straight two-way: Notion's plain-text row under the last property [screens
`16ddd22c`, `bf2171ff`] against Anytype's `+` on the section header
(`../054-record-and-relation-surfaces/design-trueup.md` §A4). The operator named the first, and it is
the placement the recommendation carried — so this row is an accepted proposal, not a reversed one.

The reasoning the recommendation gave survives the ruling and is worth keeping, because it is what
the implementer needs: the placement matches an idiom the sheet already has — the hidden-group toggle
is the same muted-text row language (`styles.css:10319-10346`) — so it costs no new visual
vocabulary, and the record sheet has **no section header** for Anytype's `+` to sit on. Adopting
Anytype's placement here would have meant inventing a section header first.

**One thing the ruling does not settle, and it is not a block**: whether the row sits above or below
the hidden-properties group once ADR-006 moves that group's population to view-hidden columns. The
threshold below fixes it above the group, matching Notion's own order [`16ddd22c`], and a later
ruling can move one line.

**Threshold**: the row renders below the last field and above the hidden group; activating it opens
the search-first picker; it measures at or above 44px on the phone sheet.
**Red today**: zero add affordances on the record sheet —
`src/views/record-detail-panel.ts` imports nothing from `add-property-row.ts`.

**Not written**: any of the code. The gate that made this `[B]` is lifted; T007 is schedulable and
carries `052`'s picker-host dependency as its only remaining precondition.
<!-- /ANCHOR:adr-008-decision -->

---

<!-- ANCHOR:adr-008-consequences -->
### Consequences

**What improves**:
- A property becomes addable from the surface where its absence is noticed, on the most-used surface
  in the plugin.
- The existing picker gets a second consumer rather than a second implementation.

**What it costs**:
- New DOM on the record sheet, which means a constructed scenario and a capture entry.
- One more row between the fields and the hidden group on a phone sheet that is already dense.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The row lands before ADR-006 moves the group's population, so "above the hidden group" means one thing now and another later | M | T007 is sequenced after T012; the threshold names the position rather than a line number |
| `052`'s picker host is not ready | M | The dependency is Yellow in `plan.md` §6 and checked before scheduling |
| A trailing row on a phone sheet pushes the hidden group below the fold | L | The group is collapsed by default; the row is one 44px line |
<!-- /ANCHOR:adr-008-consequences -->
<!-- /ANCHOR:adr-008 -->

---

<!-- ANCHOR:sweep -->
## The 19:05 sweep — every other Notion record-surface feature, checked against the tree

ADR-005's ruling has two halves. The first adopted Notion's hidden-row grammar. The second —
*"also regarding other features we might be missing"* — asked for a sweep, and this is it: every
pattern and divergence in `../054-record-and-relation-surfaces/notion-screens-digest.md` that no ADR
above already carries, read against `src/` rather than against the digest's own prose.

**The sweep's honest result is one gap, not seven.** Three of the candidates dissolve when the code
is actually read, and that is worth more than a longer list would be — a sweep that reports
capabilities we already have as gaps is how a packet grows work nobody needs. Each row below says
which it is.

### Adopted — carries a threshold

| # | Notion feature | What we have | Threshold | Red today |
|---|---|---|---|---|
| **S1** | The property-visibility list opens with a **search field** above its rows [screens `9867cb76`, `2f52d1bc`, `01cde7f6`; digest P2] | Nothing. The column manager's header carries a select-all toggle (`src/views/column-manager-renderer.ts:222-235`) and no filter input; the *add-property* picker has one (`src/views/record-surface/add-property-row.ts:58-60`, `:105`), so the primitive exists one file away | Typing in the visibility list's search field filters the rows to name matches, leaves every row's eye state untouched, and clearing it restores the full list | Zero `input` elements inside the column manager's list |

### Deferred with ADR-007, because it is the same strip

| # | Notion feature | What we have | Threshold, if ADR-007 is ever taken |
|---|---|---|---|
| **S2** | On an unset header, desktop reveals three hover ghost buttons: **"+ Add icon / + Add cover / + Add description"** [screen `56e2ae1a`; digest P5] | ADR-007 defers the first two. The **third** is neither cover nor icon and no ADR above reaches it: we carry no record-level description line at all | The three ghost buttons appear together or not at all — a description entry that ships without the cover it sits beside is a strip with one button, which is not the pattern being adopted |

### Read and **not** adopted — the divergence is real, the gap is not

| # | Notion feature | Why it is not a gap |
|---|---|---|
| **S3** | Two "Properties" destinations from one label: a **visibility** sheet and a separate **management** sheet whose chevron opens the property's own type/format editor [screen `8bb9115f`; digest P2] | We merge the two onto one row rather than splitting them across two sheets. `buildCheckboxPropertyRow` draws the handle, type icon and name, and the same row then carries a wrap toggle, an **edit** button that opens the property's editor and a **delete** button (`src/views/column-manager-renderer.ts:354-374`), with a double-click on the name doing the same (`:346`). Notion needs a second destination because its rows have only a chevron; ours do not. Adopting the split would **remove** affordances |
| **S4** | A desktop-only third tier under a divider, **"Deleted properties › 11"** [screens `01cde7f6`, `7ffa073f`; digest P3] — a soft-delete list a property can be restored from | Our delete is not the irreversible action the tier exists to soften. It goes through a confirm with a keep-the-note-data branch (`src/views/column-operations.ts:363-373`) and registers an undo entry (`:428`, `t("undo.deleteColumnConfig")`). Confirm-plus-undo and a persistent trash solve the same problem two ways; we have one. The digest's own §6 asks whether the tier collides with `045`'s card hiding, and nothing here answers that — it stays an open program question, not a row in this packet |
| **S5** | **AI Autofill suggestion chips** above the format search in the add-property flow [screen `1589e7c8`; digest P4] | Excluded by `054` D6 before any of this. Recorded so a future reader does not re-derive the exclusion from the digest and take it for an oversight |

### Named, owned elsewhere — a pointer, not a row

| # | Notion feature | Owner |
|---|---|---|
| **S6** | An **"Add a comment…"** zone below a hairline under the last property [screens `16ddd22c`, `bf2171ff`, `8bb9115f`; digest P1] — and, behind it, three separate comment surfaces rather than one: a page-level thread, an inline-anchored composer and a discussions panel [digest P6] | `023` owns the note body and `051` the shell (`goal.md` D5/D8). The pointer carried forward is the digest's own warning: whichever packet specs comments must name **which of the three** it means before it scopes anything |
| **S7** | Row-open display mode as a **named three-way user setting** — Side peek / Center peek / Full page, with a stated per-view default [screen `0cb59457`; digest P7] | This packet already borrows the **vocabulary** (REQ-007, `tasks.md` T008). The **setting** is a placement decision and stays `006`'s per the landed ruling. Naming the shells is not offering the choice, and the two should not be confused |
| **S8** | The page **"···" menu**: 17 rows mixing page actions, display toggles, page management and AI [screen `9484e185`; digest P8] | `051`/`052` per `goal.md` D8. Out of this packet's file group |

**What the sweep changes here**: one criterion, one requirement and one task, for S1. S2 rides on
ADR-007's deferral and builds nothing. S3, S4 and S5 build nothing and are recorded so they are not
re-found. S6, S7 and S8 build nothing here and name their owner.
<!-- /ANCHOR:sweep -->

---
