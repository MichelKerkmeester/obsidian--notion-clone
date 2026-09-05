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
    last_updated_at: "2026-09-05T06:00:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Recorded ADR-001 (gallery retired, does not share) and ADR-002 (cards only)"
    next_safe_action: "AC-006 stays the only open row and only the operator closes it"
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
