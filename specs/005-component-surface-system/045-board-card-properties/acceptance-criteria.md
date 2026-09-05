---
title: "Acceptance Criteria: Board Card Properties"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "045 acceptance criteria"
  - "card field list criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/045-board-card-properties"
    last_updated_at: "2026-09-05T07:20:00Z"
    last_updated_by: "desktop-board-bugs"
    recent_action: "AC-004 superseded by ADR-003 and replaced by AC-007, which is Met"
    next_safe_action: "Operator confirms roadmap row 49 on 0.0.25; AC-006 stays operator-only"
    blockers:
      - "AC-006 is operator-only"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/data/types.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-045-ac"
      parent_session_id: null
    completion_pct: 83
    open_questions: []
    answered_questions:
      - "Gallery does not share it (ADR-001); hiding a card field is cards only (ADR-002)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Board Card Properties

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

> **2026-09-05, later: the operator's desktop report moved one.** Every property checked visible,
> and the board card showing a title, one number and a date chip
> (`../scratch/device-2026-09-05/desktop-board-card-properties-not-rendered.png`). The cause was
> AC-004's own subject: the control was confined behind `boardExtensionsEnabled`, which nothing in
> `src/` sets, so no shipping board card read `boardCardFields` at all. AC-004 is **Superseded** by
> ADR-003 and replaced by **AC-007**, which is `Met`. AC-006 is still open and still operator-only.

> **2026-09-05, the two open operator questions were answered and no criterion moved.** ADR-001
> (the gallery does not share the mechanism; it is retired by `specs/007-gallery-view-deprecation`)
> and ADR-002 (hiding a card field does not hide it in the table — cards only) are now recorded in
> `decision-record.md`. Both confirm shipped behaviour rather than waiving a criterion, so every
> Waiver cell stays `-`. AC-006 is unchanged, `Unmet`, and operator-only.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/045-board-card-properties
**Level:** 2
**Status:** Draft
**Date:** 2026-09-04
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** two board views over one database, **When** each is given a different visible field list and order, **Then** their cards differ accordingly **and** neither database's table column visibility changed. **Failing value today: not expressible** — `board-renderer.ts:1439` reads the same `getVisibleColumns` result the table reads, so one `hiddenColumns` set decides both, and `columnOrder` decides both orders. | A test constructing two views over one config, asserting distinct card field sequences and an unchanged `hiddenColumns` | Met | - |
| AC-002 | REQ-002 | **Given** a view whose list makes a `status` column visible on the card body, **When** the card renders, **Then** that column appears in the meta grid rather than only as a title chip. **Failing value today: impossible** — `board-renderer.ts:1481-1482` removes every `select` and `status` column from the grid unconditionally. | Rendered DOM of a constructed board scenario with that list | Met | - |
| AC-003 | REQ-004 | **Given** an existing view saved before this change and carrying no stored list, **When** it renders after the change, **Then** the card DOM is byte-identical to the pre-change render. | A before/after capture pair over the board scenarios, `pixelHash` and `layoutHash` unchanged; plus the differential unit test in `tasks.md` T010 | Met | - |
| AC-004 | REQ-007 | ~~**Given** `boardExtensionsEnabled` is off — the default — **When** a properties list is stored on the view anyway, **Then** the rendered card is byte-identical to `038-board-kanban-port`'s parity fixtures and the list has no effect.~~ **Superseded 2026-09-05 by ADR-003.** The criterion held, and holding it was the defect: nothing in `src/` sets `boardExtensionsEnabled`, so "the list has no effect" described every board that ships. Replaced by AC-007. | — | Superseded | ADR-003 |
| AC-005 | REQ-003, REQ-005, REQ-006 | **Given** the Properties control open, **When** every field is toggled off, **Then** the card still renders cover and title; **and When** the control is opened on a phone, **Then** it uses `044`'s sheet row grammar and offers an explicit move affordance rather than a desktop drag handle. | Rendered DOM plus `044`'s `sheet-grammar` lane row for this surface | Met | - |
| AC-006 | REQ-001, REQ-005 | **Given** a released build on the operator's iPhone, **When** the operator arranges a board card's properties, **Then** they report it as close to Notion's. Only the operator closes this row. | Operator report against a named release, recorded on `../roadmap.md` §4 | Unmet | - |
| AC-007 | REQ-007 | **Given** the default board — the only one that ships — **When** the view's Properties list makes a field visible, **Then** the card renders it: in its reference slot if it fills one, otherwise in the card's property grid in panel order; **and When** the list hides a field, **Then** its slot is empty. A stored list may empty a reference slot and may never move one. | `board-renderer-hierarchy.test.ts` "default board card properties" (four assertions) and `board-renderer-parity.test.ts` "empties a reference slot whose column the stored list hides, and moves none of them" | Met | - |

**AC-001 evidence:** `src/views/board-card-fields.test.ts` "gives two views over the same database different card fields without touching either's hiddenColumns" — two `ViewConfig`s sharing one `hiddenColumns` array and one schema, each with its own `boardCardFields`, resolve to different field sequences (`["hours"]` vs `["tags", "notes"]`) while both configs' `hiddenColumns` stay the array they started with.

**AC-002 evidence:** `src/views/board-renderer-hierarchy.test.ts` "renders a status column in the meta grid when the stored list makes it visible" — a stored list naming `status` visible renders it under `[data-note-database-column-key='status']` inside `.db-board-card-meta`, not only as a title chip.

**AC-003 evidence:** `src/views/board-card-fields.test.ts`'s `it.each(SCHEMA_SHAPES)` differential (T010, five schema shapes including the new title-only one) plus the capture pair in `tasks.md` T011 — `npm run screenshots` moved 0 board captures by pixelHash/layoutHash with no stored list on any of them.

**AC-004 evidence, and why it was superseded:** the row was `Met` on `board-renderer-parity.test.ts` "does not let a stored card field list move the reference card's fixed slots" — a list storing `hours` and `tags` hidden, and the card still rendering the `2h` chip and the tag row. That test passed for the reason the operator reported on 2026-09-05: `board-renderer.ts:230` returns into the reference board whenever `boardExtensionsEnabled` is not `true`, nothing in `src/` writes that flag, and so the resolver this packet built never ran on any shipping board. The criterion measured the confinement faithfully and the confinement was wrong. ADR-003 carries the reasoning; AC-007 carries the replacement.

**AC-007 evidence:** `src/views/board-renderer-hierarchy.test.ts` "default board card properties" — a configured property that fills no reference slot renders (`notes`), a stored order renders in that order (`["notes", "priority"]`), a stored list hiding `hours` empties the reference time chip while the tag row stays, and a list hiding everything still renders the card title with an empty grid. Three of the four failed before the change (`expected [] to include 'notes'`). Plus `src/views/board-renderer-parity.test.ts` "empties a reference slot whose column the stored list hides, and moves none of them", and the twelve constructed board captures read by hand and named in `tools/lane/css-lane.json`'s release entry.

**AC-005 evidence:** `src/views/board-renderer-hierarchy.test.ts` "still renders a title with every stored field toggled off" proves the cover/title half. The phone half is now backed by a registered, all-green `sheet-grammar` lane row rather than a photograph or code identity alone: `tools/live/sheet-grammar.mjs`'s `REGISTERED_SURFACES` carries `board-card-properties` (`{ renderer: "view-config", bag: "file-view", captureData: true, viewConfigVariant: "board" }`), and `node tools/live/sheet-grammar.mjs` measures all seven elements — `surface`, `handle`, `header`, `rows`, `dropdown`, `segmented`, `keyboard` — green for it, alongside the lane's negative control (`npm run gate` 25/25).

**True-up, the registration landed:** measured 5 of 7 at `7b976e28` — `rows` and `segmented` red for the same reason the settings sheet itself was red: sibling `.db-view-config-row` rows and `.db-toggle-switch` checkboxes elsewhere in the SAME mounted sheet (the subgroup dropdown, cover-image settings, "source rules" and "show empty fields" toggles), not this section's own `.db-column-manager-row` / `db-checkbox db-checkbox-field` markup. `050-settings-body-grammar`'s landing (`4f090d2e`, `07be64fe`) carried that shared body — plus this section's own fixed Cover/Title rows via the `asSheet` flag it threaded into `board-card-properties-panel.ts` — onto the shared row/segmented grammar, which is exactly the blocker this row named. Registering `board-card-properties` against that tree measured 7/7 with no change to this section's own markup required. AC-005 is now `Met`.

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |

### Waiver cell

Write `-` when the row is `Met` or `Unmet`. Write `ADR-NNN` when the row is
`Waived` or `Superseded`, naming a decision record that exists in
`decision-record.md`. A waiver naming an ADR that is not there fails validation:
the point of a waiver is that someone recorded the reasoning, so an unbacked
waiver is treated as an unmet criterion rather than as a pass.
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

AC-001 through AC-005 are `Met` with observed evidence (cited above), including the two that mattered
most for the migration claim — AC-003 and AC-004 pull in opposite directions (nothing changes for an
existing view; nothing changes for the reference card even when a list exists) and both are DOM/
capture comparisons rather than opinions. AC-005 closed once the registration blocker it named
resolved: `050-settings-body-grammar` carried the shared `.db-view-config-body` (and this section's
own fixed Cover/Title rows) onto the row/segmented grammar, and `tools/live/sheet-grammar.mjs` now
carries a registered, all-green `board-card-properties` row (measured 5/7 at `7b976e28`, 7/7 now,
`npm run gate` 25/25) rather than the photograph-plus-code-identity evidence it stood on before. AC-006
is operator-only and untouched — the packet's only remaining open row. Not closeable until the
operator reports arranging a board card's properties on a released build as close to Notion's.

**2026-09-05 true-up.** The two design questions the packet carried open are now decided (ADR-001,
ADR-002) and neither moved a row: ADR-002 confirms the behaviour AC-001's test already asserts, and
ADR-001 hands the gallery to a different packet entirely. AC-006 is still the single thing between
this packet and closure, and it is deferred rather than confirmed — the operator's 2026-09-05 device
check of 0.0.22 could not exercise sheets at all (*"pressing any action in a sheet doesn't work and
instantly closes it"*), which is `031`'s open class, so the Properties sheet could not be reached to
be judged. Recorded on `../roadmap.md` §4 as a deferral, not as a pass.
<!-- /ANCHOR:closure -->
