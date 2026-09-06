---
title: "Decision Record: Notion Record Refinement"
description: "Eight decisions: the four Notion-versus-Anytype conflicts a landed ruling already settles, and the four extensions no ruling covers, each Proposed pending the operator."
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
    last_updated_at: "2026-09-06T18:10:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Recorded the eight decisions the Notion record research loop produced"
    next_safe_action: "Put ADR-005 through ADR-008 in front of the operator"
    blockers:
      - "ADR-005, ADR-006, ADR-007 and ADR-008 are Proposed and the operator's to take"
    key_files:
      - "specs/005-component-surface-system/054-record-and-relation-surfaces/design-trueup.md"
      - "specs/005-component-surface-system/054-record-and-relation-surfaces/notion-screens-digest.md"
      - "src/views/record-surface/hidden-properties.ts"
      - "src/views/record-surface/record-header.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-065-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "ADR-005: does the hidden group grow a per-row eye and a bulk link"
      - "ADR-006: which population does the record sheet's hidden group hold"
      - "ADR-007: which packet owns a record-level cover and icon"
      - "ADR-008: trailing row or section-header plus for the record sheet's add entry"
    answered_questions:
      - "ADR-001 to ADR-004 are settled by landed Anytype rulings; Notion loses each"
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Notion Record Refinement

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> **How to read the statuses.** Anytype parity is the default for these surfaces (`051` ADR-007,
> `056`, `057`, `054` D6) and the parent's D15 makes Notion refinements additive. So a Notion
> pattern that contradicts a **landed** ruling is settled by that ruling and is recorded `Accepted`
> here — ADR-001 to ADR-004. A Notion pattern that extends past what any ruling covers is not a
> contradiction and cannot be settled by inference; it is `Proposed` and the operator's — ADR-005 to
> ADR-008.
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
## ADR-005: A per-row eye and a bulk link in the hidden-properties group

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Proposed** — pending the operator |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

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

**Proposed**: extend `HiddenPropertiesGroupOptions` with a per-row affordance host, wire the eye to
the same column-visibility persist path the column manager's checkbox uses, and add a "Show all" link
in the group header as part of the same task rather than as a second one.

**Threshold, already written**: toggling the eye shows or hides the field in place without leaving
the sheet, and the group count updates.
**Red today**: zero eye controls inside `db-record-detail-hidden-group`.

**Not written**: any of the code. D4 forbids it until this is Accepted.
<!-- /ANCHOR:adr-005-decision -->

---

<!-- ANCHOR:adr-005-consequences -->
### Consequences

**What improves**, if accepted:
- A hidden field becomes recoverable from the surface that reports it hidden.
- One bulk control instead of one that only reaches the column manager's list.

**What it costs**:
- An exported primitive's contract changes, and both its consumers move together.
- It is an extension past a closed ruling, so it needs the ruling this ADR asks for.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Accepted before ADR-006, giving the eye an ambiguous meaning | H | Sequence: ADR-006 first, and this ADR says so |
| The peek's group inherits an affordance nobody asked for there | M | The host is optional; the peek opts in or does not |
<!-- /ANCHOR:adr-005-consequences -->
<!-- /ANCHOR:adr-005 -->

---

<!-- ANCHOR:adr-006 -->
## ADR-006: What the record sheet's hidden-properties group actually holds

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Proposed** — pending the operator |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

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

**Proposed**, three ways to answer it:

1. **Merge on the sheet.** The record sheet's group holds empty fields *and* view-hidden columns; the
   caller passes `allColumns` plus a hidden-keys set, as the peek already receives both. The count
   covers both. *Threshold:* a column hidden in view config appears inside the sheet's group and is
   counted. *Red today:* it does not appear at all.
2. **Split the label.** Two names for two populations, leaving both surfaces as they are. Cheapest,
   and it makes the divergence explicit rather than removing it.
3. **Leave it.** Record the divergence and close the question. Defensible if the sheet is understood
   as a record view rather than a column-config view.

**Recommendation (inference, and marked as one): option 1.** It is the reading a user brings to the
words "hidden properties", it matches Notion and the peek, and the data is already in the caller's
hands. But it changes what the sheet shows, so it is a ruling and not an inference to act on.
<!-- /ANCHOR:adr-006-decision -->

---

<!-- ANCHOR:adr-006-consequences -->
### Consequences

**What improves**, under option 1:
- One label means one thing across two surfaces.
- ADR-005's eye acquires an unambiguous meaning.

**What it costs**:
- The sheet's group grows, sometimes considerably, on views that hide many columns.
- The caller's signature changes on one surface.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| Merging makes the group the largest thing on the sheet | M | The group is collapsed by default and stays conditional |
| An answer is inferred rather than ruled, and the sheet quietly changes what it shows | H | This ADR stays Proposed until the operator answers |
<!-- /ANCHOR:adr-006-consequences -->
<!-- /ANCHOR:adr-006 -->

---

<!-- ANCHOR:adr-007 -->
## ADR-007: Who owns a record-level cover and icon, and whether one is wanted

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Proposed** — pending the operator |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

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

**Proposed, and the recommendation is to decline for now (inference, marked as one).** Do not fold a
cover into this refinement phase. It is a new feature sized like the entire icon picker multiplied by
upload, reposition and alt-text states; its AI half is already excluded; and no Anytype evidence
supports it in the bounded sources. Route the ownership question — which packet owns record-level
cover and icon placement — rather than opening a task.

What this ADR asks the operator for is one of: *not wanted*, *wanted and owned by `051`*, or *wanted
and owned by a new packet*. It does not ask for a design.
<!-- /ANCHOR:adr-007-decision -->

---

<!-- ANCHOR:adr-007-consequences -->
### Consequences

**What improves**:
- The largest Notion pattern in the harvest gets a disposition instead of sitting as an unanswered
  gap in a digest nobody re-reads.

**What it costs**:
- The record surface stays without the most visually obvious Notion feature. That is a deliberate
  ranking: it would delay the higher-impact property-row work for a feature with low certainty of
  being wanted.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The question is read as answered because the recommendation is written | M | Status is Proposed; no code and no task row exists |
<!-- /ANCHOR:adr-007-consequences -->
<!-- /ANCHOR:adr-007 -->

---

<!-- ANCHOR:adr-008 -->
## ADR-008: Where the record sheet's add-property entry sits

### Metadata

| Field | Value |
|-------|-------|
| **Status** | **Proposed** — pending the operator. Gates C6 / AC-009 / T007 |
| **Date** | 2026-09-06 |
| **Deciders** | Operator |

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

**Proposed**: adopt Notion's trailing row.

**Rationale (inference, marked as one)**: it matches an idiom the sheet already has — the
hidden-group toggle is the same muted-text row language (`styles.css:10319-10346`) — so it costs no
new visual vocabulary, and the record sheet has no section header for Anytype's `+` to sit on.

**Threshold, already written**: the row renders below the last field and above the hidden group;
activating it opens the search-first picker; it measures at or above 44px on the phone sheet.
**Red today**: zero add affordances on the record sheet.

**Not written**: any of the code. If the operator prefers Anytype's placement, the threshold moves to
a section-header `+` and the rest of the task is unchanged.
<!-- /ANCHOR:adr-008-decision -->

---

<!-- ANCHOR:adr-008-consequences -->
### Consequences

**What improves**, if accepted:
- A property becomes addable from the surface where its absence is noticed, on the most-used surface
  in the plugin.
- The existing picker gets a second consumer rather than a second implementation.

**What it costs**:
- New DOM on the record sheet, which means a constructed scenario and a capture entry.
- One more row between the fields and the hidden group on a phone sheet that is already dense.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The row is built before the ruling and presented as done | H | D4; T007 is `[B]` and stays blocked |
| `052`'s picker host is not ready | M | The dependency is Yellow in `plan.md` §6 and checked before scheduling |
| A trailing row on a phone sheet pushes the hidden group below the fold | L | The group is collapsed by default; the row is one 44px line |
<!-- /ANCHOR:adr-008-consequences -->
<!-- /ANCHOR:adr-008 -->

---
