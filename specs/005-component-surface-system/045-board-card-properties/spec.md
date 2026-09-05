---
title: "Feature Specification: Board Card Properties"
description: "A Notion-style Properties control for the board: per view, choose which fields render on a card, in what order, and whether each shows. Today a card's fields are whatever the table is not hiding, minus three hard-coded exclusions."
trigger_phrases:
  - "board card properties"
  - "045 spec"
  - "card field visibility"
  - "notion properties control"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/045-board-card-properties"
    last_updated_at: "2026-09-05T07:20:00Z"
    last_updated_by: "desktop-board-bugs"
    recent_action: "Amended REQ-007 per ADR-003 after the operator's desktop report"
    next_safe_action: "Operator confirms roadmap row 49 on 0.0.25"
    blockers:
      - "AC-006 is operator-only"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/data/types.ts"
      - "src/views/toolbar-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-045-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Gallery does not share the mechanism: retired by specs/007 (ADR-001)"
      - "Hiding a card field does not hide it in the table: cards only (ADR-002)"
      - "The control reaches the reference card's five slots: it fills them, never moves them (ADR-003)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Board Card Properties

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 (`recommend-level.sh --loc 450 --files 10 --db` → 46/100, phase score 0/50, phases NO) |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-04 |
| **Branch** | Not yet dispatched |
| **Parent Spec** | ../spec.md |
| **Phase** | 45 of 46 |
| **Predecessor** | 044-phone-sheet-alignment |
| **Successor** | 046-linked-views-notion-parity |
| **Handoff Criteria** | None — operator-directive-driven, not blocked on `044` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 45** of the Component Surface System.

**Scope Boundary**: which fields a board card renders, in what order, and whether each shows —
persisted per view. Not what a field looks like once rendered (`019-card-field-value-formatting`
owns value formatting) and not the card's structural layout (`038-board-kanban-port` owns the 1:1
copy).

**Dependencies**:
- `038-board-kanban-port` REQ-007 and SC-004 — the default board is a one-to-one obsidian-pm kanban
  copy. This control was scoped as a local extension inheriting the default-off rule; **ADR-003
  amends that on 2026-09-05**, because the flag is never set and the rule therefore withheld the
  control from every board that ships.
- `030-gallery-view-deprecation` — gallery is retired, so "gallery cards may share the mechanism" is
  a question about the surviving card renderers, not a commitment.
- `044-phone-sheet-alignment` — the options popover on the phone is a sheet, and it must use the
  grammar `044` defines rather than inventing a third dropdown language.

**Deliverables**:
- A persisted per-view field list with order and visibility.
- A Properties control in the board's options surface, on desktop and phone.
- A card renderer that honours it. **Amended 2026-09-05 (ADR-003):** it honours the list on the
  default board too, which is the only board that ships; what stays faithful to the reference is the
  card's tree and vocabulary, not a fixed slot scan.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The operator asked, verbatim: *"Also make it possible to adjust visible properties in board card
like notion"*. Today there is no such control, and the fields a card shows are decided three
implicit ways at once.

Read from the tree at `c6b5f11`, not inferred. `board-renderer.ts:1439` calls
`this.actions.getColumns(config)`, which every view binds to the same
`getVisibleColumns(config, this.rows, this.vs(), this.pendingShowColumns)`
(`database-view.ts:477`, `:808`, `:833`, `:865`). So a board card's field set is **the table's**
visible-column set: hiding a column to tidy the table silently strips it from every card, and there
is no way to show a field on cards while keeping it out of the table. On top of that,
`board-renderer.ts:1478-1483` removes three more things by rule rather than by choice — the title
field, the grouped field, and every `select` or `status` column, the last because
`renderCardTitleChips` (`:1475`) renders those beside the title instead. Order is whatever
`columnOrder` says, which is the table's order.

The result is that a board card has no properties model of its own. Notion's does: per view, a
Properties panel lists every field with a visibility toggle and a drag handle, and the card renders
exactly that list in exactly that order.

### Purpose

A board view carries its own ordered, per-field visibility list, and the card renders that list —
so the operator arranges a card without touching the table, and the table's tidy-up stops editing
the board.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- A persisted per-view ordered field list with per-field visibility, on `ViewConfig`.
- A **Properties** control in the board's options popover on desktop and its sheet on the phone,
  using the shared dropdown/toggle row grammar.
- Cover and title as the two always-present slots: cover is `boardImageField`, title is
  `titleField`; both stay outside the reorderable list because a card with neither is not a card.
- Chips, dates, people, progress and custom fields as reorderable, toggleable entries.
- The board renderer honouring the list, with the three implicit exclusions replaced by explicit
  entries the operator can see and change.
- Migration: an existing view with no list gets one derived from today's behaviour, so no card
  changes appearance on upgrade.

### Out of Scope
- How a value is formatted once shown — `019-card-field-value-formatting` owns that.
- The card's structural layout and CSS — `038-board-kanban-port` owns the 1:1 copy.
- The table's own column visibility — `hiddenColumns` keeps its current meaning for the table; this
  phase stops the board from borrowing it, it does not change it.
- Gallery. The mechanism may generalise and the question is recorded in §10; committing gallery here
  would widen the packet without an operator ask.
- Timeline, calendar and chart cards.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/data/types.ts` | Modify | The persisted field-list shape on `ViewConfig`, beside `boardImageField`/`titleField`/`columnOrder` |
| `src/views/board-renderer.ts` | Modify | `renderCard`'s field selection reads the list instead of `getColumns` minus three rules; `renderReferenceCard` gated so the reference stays faithful |
| `src/views/toolbar-renderer.ts` | Modify | The Properties entry in the board's options surface |
| `src/views/view-config-panel` path (`database-view.ts` `renderViewConfigPanel` consumers) | Modify | The panel body: a row per field with a toggle and a drag handle |
| `src/views/database-view.ts` | Modify | Persisting the list through the existing view-config mutation path |
| `src/views/embedded-database-renderer.ts` | Modify | The same control in an embed, read-only where the embed is read-only |
| `src/i18n.ts` | Modify | Labels in three locales |
| `styles.css` | Modify | The Properties rows (serialized lane — see `../spec.md` §4) |
| `src/views/board-renderer-hierarchy.test.ts` (or a new sibling) | Modify | Field-selection coverage |
| `tools/live/render-assertion-harness.ts` | Modify | A constructed scenario with a non-default properties list |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | A board view persists its own ordered field list with per-field visibility, in the view config. It is not `hiddenColumns` and not `columnOrder`: hiding a column from the table must stop changing what a card shows, and reordering table columns must stop reordering card fields. |
| REQ-002 | The board card renders exactly the visible entries of that list, in that order. The three implicit exclusions at `board-renderer.ts:1478-1483` — title field, grouped field, and every `select`/`status` column — become visible entries the operator can see and change, so the rule that a status chip renders beside the title is a default rather than a law. |
| REQ-003 | Cover and title are always present and are not list entries. Cover resolves from `boardImageField`, title from `titleField`. A view with an empty list still renders a recognisable card. |
| REQ-004 | Existing views migrate silently: a view with no stored list behaves exactly as it does today, derived once from the current rules and then owned by the operator. No card changes appearance on upgrade, proven by a before/after capture pair. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | The Properties control lives in the board's options popover on desktop and its sheet on the phone, built from the shared dropdown/toggle row grammar `044` defines. It does not introduce a third menu language. |
| REQ-006 | Order is changeable by drag on desktop and by an explicit move affordance on touch, because a drag handle inside a scrolling sheet is not reachable with a thumb. |
| REQ-007 | **AMENDED 2026-09-05 by `decision-record.md` ADR-003 — read that before this row.** As written, this required the control to render only where `boardExtensionsEnabled` is on, so the default board stayed a one-to-one obsidian-pm kanban copy whose card renders a *fixed* set of slots — `time`, `progress`, `due`, `tags`, `people`, matching `KanbanCardProps` (`specs/context/obsidian-pm-main/src/ui/composites/KanbanCard.ts:10`). **Nothing in `src/` ever sets that flag**, so the confinement did not protect the reference card, it withheld the control from the only board card that ships, and the operator reported the symptom on 2026-09-05. **The amended requirement:** the card's five reference slots are filled from the view's visible field list rather than from a fixed scan, and every configured field taking no slot renders beside them in panel order. A stored list may empty a reference slot; it may never move one, and the reference tree — title row, type chips, time chip, progress bar, footer avatar stack and due chip — is otherwise unchanged. |
| REQ-008 | No spec path, phase number, task id or requirement id appears in any code comment this phase writes. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: two board views over one database show different card fields in different orders, and
  neither one's table column visibility changed.
- ~~**SC-002**: with `boardExtensionsEnabled` off, the rendered card DOM is identical to the pre-change
  tree — measured, not asserted, against `038`'s parity fixtures.~~ **Superseded 2026-09-05 by
  ADR-003:** the default card renders the view's configured fields. What is measured instead is that
  its tree and vocabulary are unchanged and no reference slot moved.
- **SC-003**: an upgraded view with no stored list renders a byte-identical card to the one it
  rendered before the change.
- **SC-004**: the operator arranges a board card's properties on the phone and reports it as close to
  Notion's.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `038` REQ-007's 1:1 copy | High — a properties list reaching the reference path breaks parity `038` spent four review rounds proving | REQ-007 confines the control behind `boardExtensionsEnabled`; SC-002 measures it |
| Dependency | `044`'s sheet grammar | Med — the phone control needs a row language that is still being written | Build against the grammar's contract, not its implementation; the desktop popover is unblocked either way |
| Risk | A fourth per-view field list beside `hiddenColumns`, `columnOrder` and `showEmptyFields` | Med — four overlapping visibility concepts is how the current confusion started | The migration derives the new list from the old three once, and the board stops reading `hiddenColumns` in the same change |
| Risk | Silent migration is invisible until it is wrong | High — a wrong derivation changes every existing board card at once | REQ-004's proof is a capture pair, not a unit test |
| Risk | Touch reordering | Med — drag handles in a scrolling sheet fight the scroll | REQ-006 asks for an explicit move affordance on touch rather than porting the desktop drag |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: card field selection stays O(fields) per card. The list is resolved once per render,
  not per card — `028-remaining-freezes` removed a per-row scan for exactly this reason.
- **NFR-P02**: no additional layout read is introduced on the board's render path.

### Security
- **NFR-S01**: N/A. No auth surface.
- **NFR-S02**: the stored list is field keys only, never values, so nothing about a note's content
  enters the view config.

### Reliability
- **NFR-R01**: a list naming a field that no longer exists in the schema is ignored for that field
  and does not blank the card.
- **NFR-R02**: two views editing the same database's configs concurrently do not clobber each
  other's lists — the existing `ViewConfigMutation` path is reused rather than a new writer added.

<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- Empty input: every field hidden — the card renders cover and title only, which REQ-003 makes a
  valid state rather than a broken one.
- Maximum length: a schema with more fields than fit the panel scrolls; the panel does not clip.
- Invalid format: a stored key that is not in the schema is skipped, and skipping is silent because
  a deleted property is a normal event, not an error.

### Error Scenarios
- External service failure: N/A.
- Network timeout: N/A.
- Concurrent access: two open views on one database — the last writer wins per view, and views do
  not share a list.

### State Transitions
- Partial completion: a reorder interrupted mid-drag leaves the previous order; the list is written
  on drop, not on move.
- Session expiry: N/A. A schema change between renders re-resolves the list against the new schema.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 12/25 | ~10 files, ~450 LOC, one renderer and one config surface |
| Risk | 15/25 | No auth or API; the persisted-shape change and the `038` parity boundary carry it |
| Research | 6/20 | The reference's fixed slot set and the current selection rules are both already read |
| **Total** | **33/70** | **Level 2** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

**Two of the three below were answered by the operator on 2026-09-05 and are recorded in
`decision-record.md`. They are kept here, struck through, because a question that vanishes reads as
one that was never asked.**

- ~~Does the gallery card share this mechanism? Its renderer has the same shape
  (`gallery-renderer.ts:361` builds a `db-gallery-meta` grid from the same visible columns), so it
  probably can. Recorded, not scoped — the operator asked for the board.~~ **Answered 2026-09-05,
  ADR-001: no.** The operator's words on the gallery were *"should have been deprecated"*, and the
  instruction is to retire it completely, the same way the list view is being retired in
  `specs/006-list-view-deprecation`. The retirement is `specs/007-gallery-view-deprecation`;
  `045` stays board-only.
- ~~Does the Properties control also reach the reference card's five semantic slots (`time`,
  `progress`, `due`, `tags`, `people`), or only the local extension card? REQ-007 says the reference
  path must not diverge; whether a *mapping* control over those five slots is a divergence is a
  judgment the operator should make.~~ **Answered 2026-09-05, ADR-003: it reaches them.** The
  operator's desktop report settled it, because the question turned out to rest on a false premise —
  there is no "local extension card" in a shipping build, since nothing in `src/` sets
  `boardExtensionsEnabled`. The list fills the five slots and may empty one; it may never move one.
- ~~Should hiding a field on cards also offer to hide it in the table, as a convenience? Cheap, and it
  reintroduces exactly the coupling this phase removes. Left open deliberately.~~ **Answered
  2026-09-05, ADR-002: no, cards only.** The panel writes `boardCardFields` and never
  `hiddenColumns`, which is what already ships and what AC-001's test already asserts.
<!-- /ANCHOR:questions -->

---
