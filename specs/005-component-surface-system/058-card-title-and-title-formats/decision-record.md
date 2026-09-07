---
title: "Decision Record: Card Title and Title Formats"
description: "Default title and precedence, where the picker lives in view settings, and whether the title carries its own format or inherits the chosen column's."
trigger_phrases:
  - "decision"
  - "058 decision record"
  - "card title adr"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/058-card-title-and-title-formats"
    last_updated_at: "2026-09-06T09:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded four ADRs at packet opening"
    next_safe_action: "Revisit ADR-002 once 047's Notion harvest lands"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-058-adr"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Card Title and Title Formats

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Default title and precedence

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Phase author, formalizing shipped behavior |

---

<!-- ANCHOR:adr-001-context -->
### Context

The operator's report asks for a title picker "ideally we can change which value becomes the card
name." Reading the tree found that picker already shipped: `ViewConfig.titleField` (`types.ts:570`)
already lets any column become a view's title. This ADR records the precedence that behavior
already has, so this packet's work builds on a stated contract rather than an implicit one.

### Constraints

- `NO_TITLE_FIELD` (`types.ts:354`) must keep meaning "hide the title", distinct from "unset"
- Calendar and timeline have their own dedicated title fields and must not be folded into this one
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: `titleField` unset means `file.name` (the note title); `titleField` set to any column
key means that column; `titleField === NO_TITLE_FIELD` means no title at all. Calendar and timeline
read their own `calendarTitleField`/`timelineTitleField` instead, never `titleField`.

**How it works**: `getTitleField()`/`getRecordEventTitleField()` already implement this precedence
exactly; this ADR states it as a decision so a later edit cannot narrow it without being read as an
amendment.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: keep the shipped precedence, state it as a contract** | No behavior change; formalizes what three packets already depend on | None found | 9/10 |
| Add a fourth precedence level (a per-database default distinct from per-view) | Would let every view of one database share a default | Not asked for; widens scope past the operator's report | 3/10 |

**Why this one**: The shipped precedence already matches the operator's own words once its format
half is fixed; inventing a new precedence level answers a question nobody asked.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- A later reader has one written statement of the precedence instead of reverse-engineering it from
  three call sites

**What it costs**:
- None — no behavior changes

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| None identified | — | — |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The operator's report implies the picker does not exist; stating what does exist prevents this packet from rebuilding it |
| 2 | **Beyond Local Maxima?** | PASS | Read from source across board, record and calendar/timeline paths, not assumed from one file |
| 3 | **Sufficient?** | PASS | States the precedence without adding a new axis |
| 4 | **Fits Goal?** | PASS | Directly grounds D1 in `goal.md` |
| 5 | **Open Horizons?** | PASS | Leaves calendar/timeline's own fields untouched for `057` |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**: Nothing — this ADR formalizes existing behavior in `types.ts`, `title-field-display.ts`
and `record-detail-panel.ts`.

**How to roll back**: N/A — no code change.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

## ADR-002: Where the picker lives in view settings

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Phase author |

---

### Context

The board's own Properties sheet (`board-card-properties-panel.ts`) shows the current title choice
as a read-only fixed slot, with the actual editable picker living one level up, in
`view-config-panel-renderer.ts`'s general section. The operator's screenshot was taken from the
board's Properties surface, where there is nothing to click — a plausible reason the report reads
as "there is no way to change this" rather than "the control is somewhere else."

### Constraints

- `053-toolbar-and-view-controls` owns the toolbar's composed primitives and row grammar; this
  packet does not build a new primitive, it wires an existing row to an existing picker
- The picker itself must not be duplicated — one canonical control, reachable from two entry points

---

### Decision

**We chose**: Keep `view-config-panel-renderer.ts`'s general section as the one canonical
`titleField` picker. Give `board-card-properties-panel.ts`'s Title fixed slot a jump-to-picker
affordance (opens the same picker, does not draw a second one), following `053`'s row grammar once
that packet's composed primitives land.

**How it works**: The Title row's click handler calls the same open-picker path
`view-config-panel-renderer.ts:1902-1920` already exposes, rather than re-implementing a column
reference picker inside the board's Properties sheet.

---

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: one picker, two entry points** | No duplicated control; smaller diff; consistent with the design-system rule against a second vocabulary for one job | The Title row's affordance reads as "jump" rather than "edit in place", a minor interaction difference from the Cover row beside it | 8/10 |
| Build a second, board-scoped title picker inline in the Properties sheet | Edits stay on the surface the operator was looking at, no navigation | Duplicates the column-reference picker `view-config-panel-renderer.ts` already has — exactly the "fourteen ways to build the same thing" pattern `design-system.md` §6 warns against | 4/10 |

**Why this one**: `design-system.md`'s row-grammar rule is to build every row once and reuse it; a
second picker for the same setting is the anti-pattern that rule exists to prevent.

---

### Consequences

**What improves**:
- The operator reaches the picker from the board surface they were looking at, without a second
  control to keep in sync with the first

**What it costs**:
- One extra tap (jump to the general section) instead of an inline change. Mitigation: the jump
  affordance is a real fix for "there is nothing to click here today," which is the actual defect

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The jump navigates away from the Properties sheet the operator was mid-edit on | Low — a context switch, not data loss | The picker's own commit path is unchanged; returning to Properties shows the updated Title label |

---

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The Title row currently has no way to change the setting from that surface |
| 2 | **Beyond Local Maxima?** | PASS | Considered and rejected a second inline picker |
| 3 | **Sufficient?** | PASS | One affordance closes the discoverability gap without new components |
| 4 | **Fits Goal?** | PASS | Directly grounds D4 in `goal.md` |
| 5 | **Open Horizons?** | PASS — with an open item | Marked Proposed-to-revisit once `047`'s Notion harvest lands (`goal.md` open question); Notion's own any-property-as-title UI may suggest an inline pattern this ADR does not yet have evidence for |

**Checks Summary**: 5/5 PASS, one item flagged for revisit

---

### Implementation

**What changes**: `board-card-properties-panel.ts`'s Title row (`:43`) gains a click handler.

**How to roll back**: Remove the handler; the row returns to its current read-only state.

---

## ADR-003: Format applied to the title column vs. the chosen property

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Phase author |

---

### Context

The operator's ask has two halves that could be read as two separate settings: "change that number
displayed to different number formats like euro" (a format for the title) and "we can change which
value becomes the card name" (a picker). Building the first as an independent setting would let a
title disagree with its own source column's format — the title in `€ 34,21`, the column itself, if
ever shown elsewhere as a plain field, in `34.21`.

### Constraints

- `ColumnDef.type`/`numberDisplayStyle` (`types.ts:99-101`) already carry a column's own format
- The cell renderer and the card-field renderer already read those fields to format a cell

---

### Decision

**We chose**: A title has no independent format setting. It always renders through the chosen
column's own `type`/`numberDisplayStyle`, via the same formatter the cell renderer calls
(`formatEuroCurrency`/`formatEuroNumber`, the existing date formatter). "Change the number format"
is answered by changing the source column's own format — already possible today — not by adding a
second, title-only format control.

**How it works**: `resolveTitleFieldDisplay` looks up the chosen column's `ColumnDef` and calls the
formatter that column's own `type` selects, exactly as `cell-renderer.ts`'s `switch (displayType)`
does for an ordinary cell.

---

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: title inherits the column's own format** | One format per value, everywhere it appears; zero new settings surface | None found | 9/10 |
| A separate "title number format" setting | Matches a literal reading of "change that number displayed to different number formats" | Lets the same stored value read differently as a title than as a field — a value's format becoming context-dependent is the kind of drift `design-system.md` warns against for every other surface in this plugin | 3/10 |

**Why this one**: The operator's example, "like euro", is a currency format that `ColumnDef.type
=== "currency"` already provides; there is no evidence the operator wants two independent format
settings for one value.

---

### Consequences

**What improves**:
- A currency-titled card and a currency-titled cell always agree, because they are the same value
  read through the same formatter

**What it costs**:
- If an operator wants the title to show a different format than the same column shows elsewhere,
  this ADR does not provide it. Mitigation: no report has asked for that; if one does, it is a new
  ADR that supersedes this one, not a silent addition

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future report wants a title-specific format independent of the column | Low | Named here as the alternative explicitly rejected, so a future session reads this as a decision to revisit, not an oversight |

---

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Directly answers the operator's "change that number displayed to different number formats" |
| 2 | **Beyond Local Maxima?** | PASS | Considered and rejected a second format surface |
| 3 | **Sufficient?** | PASS | Reuses existing formatting machinery entirely |
| 4 | **Fits Goal?** | PASS | Directly grounds D2/D3 in `goal.md` |
| 5 | **Open Horizons?** | PASS | Does not foreclose a future title-specific format ADR if one is ever asked for |

**Checks Summary**: 5/5 PASS

---

### Implementation

**What changes**: `title-field-display.ts`'s non-file branch.

**How to roll back**: Revert to the prior `stringifyValue()`-only branch.

---

## ADR-004: Reach to the record surface and phone sheet

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-06 |
| **Deciders** | Phase author |

---

### Context

The operator's ask names the record surface header (`054`) and the phone record sheet as places the
same title choice should drive. Reading `record-detail-panel.ts:485-488` found this already true
for every view but calendar/timeline — `getRecordEventTitleField()` falls through to
`config.titleField`, the same value the board reads.

### Constraints

- No fourth, independent title source may be introduced for the record surface
- Calendar/timeline's own title fields stay untouched (ADR-001, D5)

---

### Decision

**We chose**: Keep the existing shared-plumbing agreement as-is, and add a regression test that
asserts it, rather than introducing new wiring to "make" the surfaces agree — they already do.

**How it works**: A new test constructs one `RowData`/`ViewConfig` fixture with a non-file
`titleField`, renders the board card, the desktop record header and the phone record sheet from it,
and asserts all three read the identical text.

---

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: test the existing agreement** | Zero new code paths; catches a future regression | Does not "build" anything the operator can point to as new | 8/10 |
| Introduce a new explicit `RecordTitleSource` type threaded through all three renderers | Makes the agreement's shape more explicit in the type system | Replaces working code with an equivalent abstraction for no behavior change — the exact kind of unrequested generalization `prevent-overengineering.md` warns against | 3/10 |

**Why this one**: The agreement already holds; the risk is losing it silently in a future edit, which
a regression test addresses directly.

---

### Consequences

**What improves**:
- A future edit to `getRecordEventTitleField` or the board's own title getter that would fork the
  three surfaces fails a test instead of shipping silently

**What it costs**:
- None — no behavior change

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| None identified | — | — |

---

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Directly answers "same picker should reach the record surface header and the phone record sheet" |
| 2 | **Beyond Local Maxima?** | PASS | Verified from source across all three surfaces before deciding nothing needed building |
| 3 | **Sufficient?** | PASS | A test is the smallest thing that locks in an already-correct behavior |
| 4 | **Fits Goal?** | PASS | Directly grounds the third completion criterion in `goal.md` |
| 5 | **Open Horizons?** | PASS | Does not block `054`'s own record-primitive extraction work |

**Checks Summary**: 5/5 PASS

---

### Implementation

**What changes**: A new test file/case; no production code.

**How to roll back**: Delete the test.

---

## ADR-005: A `titleFormat` field scoped to the file-name pseudo-field

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-07 |
| **Deciders** | Production-verification session, on a fresh operator report |

---

### Context

A 2026-09-07 operator report on 0.0.31 iOS showed board cards titled by their raw file names —
`3537.32`, `4736.32` — the same defect class ADR-003 already closed for a real column, but on the
one title source ADR-003's own routing cannot reach: the unset `titleField` default (`file.name`)
has no `ColumnDef`/`type` to look up a formatter from. ADR-003's decision — "a title has no
independent format setting, it inherits the chosen column's own" — is unchanged and still correct
for every titled column; it was never written to cover a title source that is not a column at all.

### Constraints

- ADR-003 must not be reopened or weakened for the column-based case — a title drawn from a real
  column keeps inheriting that column's own format, no exceptions
- The new setting must not appear when it cannot take effect (once a real column is `titleField`)

---

### Decision

**We chose**: A `titleFormat` field on `ViewConfig` (`TitleFileFormat`: `text` / `number` /
`currency-eur` / `currency-usd` / `currency-gbp` / `date`), read only while `resolveTitleFieldDisplay`
is in its file-title branch (`titleField` unset, or explicitly `file.name`/`file.basename`).
`text` (the default) is a no-op, so today's plain file-name behavior is unchanged for every
existing view. Its picker row in `view-config-panel-renderer.ts` renders directly beneath the
existing Title field row and only while that row's own value resolves to the file name.

**How it works**: `formatFileTitleText` (`title-field-display.ts`) parses the file-name text as a
number when the format calls for one, using the same fallback-to-raw-text posture the column-based
branch already uses for a non-numeric value in a numeric column (never a thrown error). USD/GBP use
local `Intl.NumberFormat` instances kept in this one module rather than widening `euro-format.ts`'s
own euro-only scope.

---

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: a file-name-scoped format field** | Answers the operator's literal report; leaves ADR-003's column-based contract untouched | A second, small format vocabulary exists alongside the column-typed one | 8/10 |
| Ask the operator to rename the note so the file name reads as a date/number naturally | Zero code | Not what was asked, and file names carrying vault-meaningful identifiers (dates, ids) are not always safe to rename | 2/10 |
| Widen ADR-003 to let ANY title carry an independent format, column or not | One format concept instead of two | Directly reopens ADR-003, which a prior session weighed and rejected for a real column; the operator's report never asked for that case | 3/10 |

**Why this one**: The operator's own words ("we would see the month for example") describe
*picking a different column* (D1, already shipped) — the number-format half of the same report is
about the file name specifically, since that is what their board's cards were titled by.

---

### Consequences

**What improves**: The operator's literal defect (a numeric file name as a card's main name) has a
direct fix that does not touch column-based titling at all.

**What it costs**: A second format vocabulary (file-name-only) exists beside the column-typed one;
mitigated by scoping it strictly to the one pseudo-field with no format of its own.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future report asks for the same file-name format options on a *real* column title | Low | Named here as the boundary; would be a new ADR, not a silent widening of this one |

---

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Directly answers the operator's board screenshot: raw numeric file names as card titles |
| 2 | **Beyond Local Maxima?** | PASS | Read `resolveTitleFieldDisplay`'s file-title branch and ADR-003 before deciding the gap was real, not a duplicate |
| 3 | **Sufficient?** | PASS | One field, one picker row, scoped to the one pseudo-field that needed it |
| 4 | **Fits Goal?** | PASS | Grounds D7/D8 in `goal.md` |
| 5 | **Open Horizons?** | PASS | Explicitly declines to reopen ADR-003 |

**Checks Summary**: 5/5 PASS

---

### Implementation

**What changes**: `types.ts` (`TitleFileFormat`, `ViewConfig.titleFormat`), `title-field-display.ts`
(`formatFileTitleText`), `view-config-panel-renderer.ts` (`renderTitleFormat`), `i18n.ts`.

**How to roll back**: Remove the field, the formatter call and the picker row; `resolveTitleFieldDisplay`'s
file-title branch returns to its unconditional `getFileTitleText(row)`.

---

## ADR-006: `board-renderer.ts`'s file-title consumer read the wrong value

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-07 |
| **Deciders** | Production-verification session |

---

### Context

ADR-005's `titleFormat` landed and passed every unit and panel test — all of which call
`resolveTitleFieldDisplay` directly. Driving the actual `BoardRenderer` in headless Chrome (the one
proof this packet's earlier evidence never did — D1) found the board card still showed the raw file
name regardless of `titleFormat`. `board-renderer.ts`'s `getReferenceRowTitle` special-cased
`title.isFileTitle`:

```ts
return title.isFileTitle ? row.file.basename : title.text;
```

This shortcut was harmless the day it was written — the resolver's file-title branch always
computed `getFileTitleText(row)` verbatim, identical to `row.file.basename` in every real case — and
became silently wrong the moment `titleFormat` made the two diverge, discarding the formatted text
for the raw one on every file-name-drawn card.

### Constraints

- The record surface (`record-detail-panel.ts`) already reads `title.text` unconditionally and
  needed no change — confirmed by reading it, not assumed
- Fixing this must not touch `NO_TITLE_FIELD`'s hidden-title path or any column-based title path,
  both already correct

---

### Decision

**We chose**: `getReferenceRowTitle` reads `title.text` unconditionally once the title is not
hidden, dropping the `title.isFileTitle` branch entirely. `resolveTitleFieldDisplay`'s file-title
branch already produces the same output the old shortcut did for every existing view
(`titleFormat` unset/`"text"`), so this is a behavior-preserving simplification for every caller
except the one that now has a `titleFormat` to read.

**How it works**: One conditional collapses to a single return path; no new state, no new branch.

---

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: read `title.text` unconditionally** | Matches what `record-detail-panel.ts` already does; removes a shortcut that has no reason to exist post-ADR-005 | None found | 9/10 |
| Special-case `titleFormat` inside `getReferenceRowTitle` (keep the shortcut, add an override) | Smaller diff at this one call site | Reintroduces a second place the file-title text is computed, exactly the "one formatter" rule D2 exists to prevent | 3/10 |

**Why this one**: The shortcut's entire justification (the two values were always identical) no
longer holds; there is no remaining reason for `board-renderer.ts` to compute the file title any
differently than `record-detail-panel.ts` already does.

---

### Consequences

**What improves**: The board card and the record header now provably read the identical text for
a file-name-drawn title, matching D5/AC-006's cross-surface contract — this was previously true by
coincidence (`title.text` and `row.file.basename` happened to match) rather than by the code
actually reading the same value.

**What it costs**: Nothing — no behavior changes for any existing view.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future edit reintroduces a shortcut like this for a different title branch | Low | `board-title-format-numeric-filename` (the live harness) now asserts the formatted text reaches the drawn card, not only the resolver's return value |

---

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Without this fix, `titleFormat` has no visible effect on the one surface the operator's report showed |
| 2 | **Beyond Local Maxima?** | PASS | Found by driving the real renderer, not by re-reading the resolver alone |
| 3 | **Sufficient?** | PASS | The unconditional return is the entire fix |
| 4 | **Fits Goal?** | PASS | Grounds D8 in `goal.md` |
| 5 | **Open Horizons?** | PASS | Does not touch the record surface's already-correct path |

**Checks Summary**: 5/5 PASS

---

### Implementation

**What changes**: `board-renderer.ts`'s `getReferenceRowTitle`, one conditional removed.

**How to roll back**: Reintroduce the `title.isFileTitle ? row.file.basename : title.text` branch —
not recommended; it silently drops any file-name titleFormat.
