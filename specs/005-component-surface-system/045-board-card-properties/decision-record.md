---
title: "Decision Record: Board Card Properties"
description: "The two operator questions this packet carried open — whether the gallery shares the card-properties mechanism, and whether hiding a card field also hides it in the table — answered on 2026-09-05."
trigger_phrases:
  - "045 decision record"
  - "board card properties adr"
  - "gallery shares card properties"
  - "hide card field in table"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/045-board-card-properties"
    last_updated_at: "2026-09-05T07:20:00Z"
    last_updated_by: "desktop-board-bugs"
    recent_action: "Recorded ADR-003 amending REQ-007 so the default board card shows its configured properties"
    next_safe_action: "Operator confirms roadmap row 49 on 0.0.25; AC-006 stays operator-only"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
      - "src/views/board-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-045-adr"
      parent_session_id: null
    completion_pct: 83
    open_questions: []
    answered_questions:
      - "Gallery does not share the mechanism: it is retired by specs/007 (ADR-001)"
      - "Should hiding a card field also hide it in the table? No — cards only"
---
# Decision Record: Board Card Properties

<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Both records below answer questions this packet raised in `spec.md` §10 and carried open through
> its whole implementation. Neither changes shipped code. They exist so the next agent does not
> reopen a question the operator has already closed.

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Does the gallery card share the card-properties mechanism?

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-001-context -->
### Context

`spec.md` §10 recorded that the gallery card has the same shape as the board card —
`gallery-renderer.ts:361` builds a `db-gallery-meta` grid from the same visible-column result
`board-renderer.ts:1439` read before this packet moved it onto a per-view list — so the mechanism
*could* generalise cheaply. The question was whether it should.

Asked on 2026-09-05, the operator answered the surface rather than the mechanism. Quoted:
*"should have been deprecated"*. The instruction that followed is to retire the gallery completely,
the same way the list view is being retired in `specs/006-list-view-deprecation`.

That turns a design question into a scoping one. Generalising a mechanism onto a renderer that is
being deleted is work with a negative expected life.

### Constraints

- The gallery is already **withdrawn but not removed** by `030-gallery-view-deprecation`: it is gone
  from the add-view menu, the view-type change menu and the view-config picker, and the renderer is
  untouched, so a database already configured as one still opens. Withdrawal is not deletion.
- `src/views/gallery-renderer.ts` is 787 lines and is still measured: it is pinned in
  `tools/live/renderer-coverage.json`'s `inputs`, carries a constructed screenshot scenario, and has
  its own bench (`tools/bench/gallery-render-bench.ts`).
- `card-field-renderer.ts` is shared by the board and the gallery. It is not the gallery's to delete.
<!-- /ANCHOR:adr-001-context -->

---

<!-- ANCHOR:adr-001-decision -->
### Decision

**We chose**: the gallery does **not** share this mechanism, because the gallery is being retired
outright rather than improved.

**How it works**: `045` stays board-only. The retirement itself is not this packet's — it is opened
as `specs/007-gallery-view-deprecation`, a sibling packet mirroring `006-list-view-deprecation`,
which finishes what `030-gallery-view-deprecation` started: migrate, then remove the renderer and
every measurement of it. Nothing in `045` is edited by this record.
<!-- /ANCHOR:adr-001-decision -->

---

<!-- ANCHOR:adr-001-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Gallery does not share; retire it** | No work spent on a renderer scheduled for deletion; the operator's own instruction | Two questions answered by one ruling, so a reader of `045` alone cannot see why | 9/10 |
| Generalise the resolver onto the gallery now | Cheap while the shapes still match; one mechanism, two renderers | Every line of it is deleted by the retirement, and it would add a fourth `gallery` call site the removal has to unpick | 2/10 |
| Leave the question open | Costs nothing today | It has already been open across a whole implementation and would be re-asked by the next agent | 3/10 |

**Why this one**: the operator retired the surface, and a mechanism does not outlive the renderer
that would consume it.
<!-- /ANCHOR:adr-001-alternatives -->

---

<!-- ANCHOR:adr-001-consequences -->
### Consequences

**What improves**:
- `045`'s scope is final: board only, no follow-on generalisation task.
- The gallery's half-finished state — withdrawn by `030`, still rendered, still measured — gets an
  owner instead of sitting as a precedent nobody is completing.

**What it costs**:
- A gallery-configured view in a live vault must migrate before the renderer can go. Mitigation:
  that migration is `007`'s first two children, and `030` already ships `src/data/gallery-migration.ts`
  as the starting point rather than a blank page.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A vault still holds a gallery view when the renderer is deleted | H | `007`'s audit child inventories vault usage before anything is removed, exactly as `006`'s `005-usage-and-migration-audit` did |
| `card-field-renderer.ts` is deleted with the gallery | M | Named out of scope here and in `007`'s `decision-record.md`: the board uses it |
<!-- /ANCHOR:adr-001-consequences -->

---

<!-- ANCHOR:adr-001-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The question was open in `spec.md` §10 and `goal.md`'s `open_questions` across the whole implementation |
| 2 | **Beyond Local Maxima?** | PASS | Three options weighed above; the cheap one was rejected on lifetime, not on effort |
| 3 | **Sufficient?** | PASS | It answers the question and creates no code |
| 4 | **Fits Goal?** | PASS | It closes `045`'s scope and hands the surface to a packet that owns it |
| 5 | **Open Horizons?** | PASS | Retiring a surface removes a renderer, a bench, a coverage pin and 85 CSS declarations rather than adding a second consumer |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-001-five-checks -->

---

<!-- ANCHOR:adr-001-impl -->
### Implementation

**What changes**:
- Nothing in `src/`. This record removes a question, not code.
- `spec.md` §10 and `goal.md`'s `open_questions` move the gallery question to answered.
- `specs/007-gallery-view-deprecation` is opened to carry the retirement.

**How to roll back**: delete this ADR and restore the bullet in `spec.md` §10. No code reverts,
because none was written for it.
<!-- /ANCHOR:adr-001-impl -->
<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: Does hiding a field on a card also hide it in the table?

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-002-context -->
### Context

`spec.md` §10 recorded the convenience and its cost in one sentence: offering "also hide in table"
from the card Properties panel is cheap, *and it reintroduces exactly the coupling this phase
removes*. Before `045`, `board-renderer.ts:1439` read the table's `getVisibleColumns` result, so one
`hiddenColumns` set decided both surfaces — which is the defect AC-001 was written against.

Asked on 2026-09-05, the operator answered: **No, cards only.**

### Constraints

- AC-001 is `Met` on evidence that asserts the opposite of this convenience:
  `src/views/board-card-fields.test.ts` proves two views over one database get different card fields
  *while both configs' `hiddenColumns` stay the array they started with*. A card-panel control that
  writes `hiddenColumns` would falsify that test's premise on the very surface it guards.
- The table's own column visibility control already exists and is where a table change belongs.
- A cross-surface write from a per-view panel has no per-view scope: `hiddenColumns` is database-wide
  in effect, so one board's tidy-up would silently reshape every table view of the same database.
<!-- /ANCHOR:adr-002-context -->

---

<!-- ANCHOR:adr-002-decision -->
### Decision

**We chose**: the card Properties panel writes card visibility only. It offers no path to the
table's column visibility.

**How it works**: unchanged. `boardCardFields` is per-view and is the only thing the panel writes;
`hiddenColumns` is untouched by it, which is what already ships and what AC-001's test already
asserts. This record freezes that as a decision rather than leaving it as an accident of scope.
<!-- /ANCHOR:adr-002-decision -->

---

<!-- ANCHOR:adr-002-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Cards only** | Keeps the decoupling the packet exists to create; AC-001 stays true | A reader who wants both must visit two controls | 9/10 |
| Offer an opt-in "also hide in table" checkbox | One trip for the common case | Database-wide effect from a per-view panel; re-couples the two surfaces the packet just separated | 3/10 |
| Mirror unconditionally | Simplest control | It is the pre-`045` behaviour, which is the reported defect | 1/10 |

**Why this one**: the operator asked for it, and it is the only option under which AC-001's evidence
stays honest.
<!-- /ANCHOR:adr-002-alternatives -->

---

<!-- ANCHOR:adr-002-consequences -->
### Consequences

**What improves**:
- The board/table decoupling is a decision now, not an unstated default, so a later convenience
  request has a record to argue against rather than an empty field.
- No new control, no new persisted field, no new migration.

**What it costs**:
- Hiding a field on both surfaces takes two controls. Mitigation: accepted explicitly by the
  operator; the table's control already exists and is discoverable.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A reader hides a field on a card and expects the table to follow | L | The panel is titled and scoped to the card; the behaviour matches Notion's per-view properties |
<!-- /ANCHOR:adr-002-consequences -->

---

<!-- ANCHOR:adr-002-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | Open in `spec.md` §10 since the packet was written |
| 2 | **Beyond Local Maxima?** | PASS | The opt-in middle option was considered and rejected on scope, not on cost |
| 3 | **Sufficient?** | PASS | Confirms shipped behaviour; adds nothing |
| 4 | **Fits Goal?** | PASS | REQ-001's whole point is that one view's card list does not decide another surface |
| 5 | **Open Horizons?** | PASS | Leaves the table's control free to change independently |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-002-five-checks -->

---

<!-- ANCHOR:adr-002-impl -->
### Implementation

**What changes**:
- Nothing in `src/`. The shipped behaviour already is this decision.
- `spec.md` §10 and `acceptance-criteria.md` record it as answered.

**How to roll back**: delete this ADR and restore the bullet in `spec.md` §10.
<!-- /ANCHOR:adr-002-impl -->
<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: Does the default board card show the properties the view is configured for?

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-05 |
| **Deciders** | Operator |

---

<!-- ANCHOR:adr-003-context -->
### Context

REQ-007 confined this packet's control behind `boardExtensionsEnabled`, so that the default board
stayed a one-to-one copy of the reference kanban and a stored list could never move its five fixed
slots. AC-004 measured that, and `board-renderer-parity.test.ts` asserted it directly: with `hours`
and `tags` stored hidden, the card still rendered the `2h` chip and the tag row.

**Two facts read from the tree turn that from a boundary into a defect.** `board-renderer.ts:230`
takes the reference path whenever `boardExtensionsEnabled` is not `true`, and **nothing in `src/`
ever writes that flag** — grep finds it in `types.ts` as a field, in the renderer as a read, and in
two test files. So the reference card is not the default board card, it is the *only* board card
that ships, and `resolveBoardCardFields` — the whole mechanism this packet built — sat behind a
branch no operator can take. The Properties panel wrote `boardCardFields`; no shipped renderer read
it.

On 2026-09-05 the operator reported exactly that, from the desktop, with a screenshot: every
property checked visible, and a card showing a title, one number and a date chip. Their words:
*"not all enabled properties are showing in cards of board"*.

### Constraints

- `038` REQ-007 and SC-004 own the reference parity this would move, and `038` spent four review
  rounds proving it. The amendment is theirs to inherit, not this packet's to ignore.
- The card must stay recognisable as the reference card. The five slots the reference authored —
  time, progress, due, tags, people — carry its look, and losing them would be a different card.
- A card that renders every column of a wide schema is unreadable; the panel has to be able to
  take fields off it, which is what this packet built the panel for.
<!-- /ANCHOR:adr-003-context -->

---

<!-- ANCHOR:adr-003-decision -->
### Decision

**We chose**: the default board card renders the properties the view is configured for. REQ-007's
`boardExtensionsEnabled` confinement is **amended**, and AC-004 is superseded by this record.

**How it works**: the reference card's five slots are resolved from the view's visible field list
in panel order rather than from every column, so hiding a property in the panel empties its slot.
Every configured field that takes no slot renders in a `db-board-card-meta` grid between the
progress bar and the footer, in the order the panel lists them. The reference tree is otherwise
untouched: the title row and its type chips, the time chip, the progress bar, and the footer's
avatar stack and due chip stay exactly where the reference put them, which is what "keeps its
look" means here. The grid renders display-only, because a click anywhere on a reference card
opens the record and an editable field would swallow that click.

**What this does not do**: it does not move a reference slot. A stored list can empty one, never
relocate one, and `board-renderer-parity.test.ts` now asserts that narrower contract in place of
the one it asserted before.
<!-- /ANCHOR:adr-003-decision -->

---

<!-- ANCHOR:adr-003-alternatives -->
### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Slots from the list, everything else in a grid** | The operator's ask, in the reference's own shell; a view whose fields all land in slots renders the reference card unchanged | Amends another packet's requirement, and a wide schema makes a tall card until the operator trims it | 9/10 |
| Ship a `boardExtensionsEnabled` toggle instead | REQ-007 survives untouched | It answers a question nobody asked. The operator wants properties on the card they have, not a second board behind a switch — and the extension card is a different layout, not the reference one they are looking at | 3/10 |
| Render every visible field in panel order, footer included | One rule, no slot concept at all | The footer is the card's one right-aligned row; dissolving it into the body is the look changing, which the operator did not ask for | 4/10 |
| Leave it, and document that the panel needs the flag | No code moves | The shipped panel would keep writing a field no shipped renderer reads. That is the defect, restated as a note | 1/10 |

**Why this one**: the operator's screenshot is the newer instruction, and it is about the card in
front of them. REQ-007 protected a parity that is worth keeping — this keeps all of it that can be
kept while the card does what the panel promises.
<!-- /ANCHOR:adr-003-alternatives -->

---

<!-- ANCHOR:adr-003-consequences -->
### Consequences

**What improves**:
- The Properties panel does something. Before this, every path through it wrote a field the shipped
  board could not read.
- Slot resolution moved from per-card to once per render, so a card no longer calls `getColumns`
  for itself.

**What it costs**:
- `038`'s reference parity is now "the reference tree, filled from the view's fields" rather than
  "the reference tree, filled from a fixed scan". Twelve constructed board captures moved and were
  read by hand; the parity fixtures for the tree itself did not.
- A schema wider than the card is tall renders a tall card until the operator hides fields. The
  panel is the answer and it now works.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A view with many columns renders an unreadably tall card on first open | M | The derived default already drops the title, the grouped field and every select/status column; the panel takes the rest off per view |
| A later reader restores REQ-007 from `spec.md` without seeing this | M | REQ-007 and AC-004 both point here, and the parity test's own name states the narrower contract |
<!-- /ANCHOR:adr-003-consequences -->

---

<!-- ANCHOR:adr-003-five-checks -->
### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The operator reported the symptom with a screenshot, and the mechanism is a branch no shipped code can take |
| 2 | **Beyond Local Maxima?** | PASS | Four options weighed; the two that preserved REQ-007 intact were rejected on what they leave the operator holding |
| 3 | **Sufficient?** | PASS | Red before green on three renderer assertions, plus twelve captures read by hand |
| 4 | **Fits Goal?** | PASS | REQ-002 already said the implicit exclusions become entries the operator can change; this is that requirement reaching the card that ships |
| 5 | **Open Horizons?** | PASS | The slot resolver now takes an ordered field list, so a later mapping control over the five slots has somewhere to plug in |

**Checks Summary**: 5/5 PASS
<!-- /ANCHOR:adr-003-five-checks -->

---

<!-- ANCHOR:adr-003-impl -->
### Implementation

**What changes**:
- `src/views/board-renderer.ts`: `getReferenceCardFields` resolves from the per-render field list
  and returns the leftovers; `renderReferenceCardMeta` renders them; `renderCardFieldContent` takes
  a display-only flag.
- `src/views/board-renderer-hierarchy.test.ts`: four assertions for the default card's properties.
- `src/views/board-renderer-parity.test.ts`: the slot-immovability test rewritten to the narrower
  contract this record sets.
- Twelve constructed board captures, and the lane history entry naming them.

**How to roll back**: restore the `getReferenceCardFields` scan over `this.actions.getColumns` and
drop the meta call, then re-capture. REQ-007 returns as written and the operator's report reopens.
<!-- /ANCHOR:adr-003-impl -->
<!-- /ANCHOR:adr-003 -->
