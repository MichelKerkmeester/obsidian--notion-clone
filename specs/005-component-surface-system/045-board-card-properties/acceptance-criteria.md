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
    last_updated_at: "2026-09-05T05:20:00Z"
    last_updated_by: "code-grammar-registration-pass"
    recent_action: "Registered board-card-properties in sheet-grammar.mjs (7/7); closed AC-005"
    next_safe_action: "AC-006 is the only remaining open row; only the operator closes it"
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
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Board Card Properties

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

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
| AC-004 | REQ-007 | **Given** `boardExtensionsEnabled` is off — the default — **When** a properties list is stored on the view anyway, **Then** the rendered card is byte-identical to `038-board-kanban-port`'s parity fixtures and the list has no effect. The reference card resolves a fixed five-slot map (`board-renderer.ts:552`); a properties list must never move it. | `038`'s board parity fixtures unchanged, run with a stored list present | Met | - |
| AC-005 | REQ-003, REQ-005, REQ-006 | **Given** the Properties control open, **When** every field is toggled off, **Then** the card still renders cover and title; **and When** the control is opened on a phone, **Then** it uses `044`'s sheet row grammar and offers an explicit move affordance rather than a desktop drag handle. | Rendered DOM plus `044`'s `sheet-grammar` lane row for this surface | Met | - |
| AC-006 | REQ-001, REQ-005 | **Given** a released build on the operator's iPhone, **When** the operator arranges a board card's properties, **Then** they report it as close to Notion's. Only the operator closes this row. | Operator report against a named release, recorded on `../roadmap.md` §4 | Unmet | - |

**AC-001 evidence:** `src/views/board-card-fields.test.ts` "gives two views over the same database different card fields without touching either's hiddenColumns" — two `ViewConfig`s sharing one `hiddenColumns` array and one schema, each with its own `boardCardFields`, resolve to different field sequences (`["hours"]` vs `["tags", "notes"]`) while both configs' `hiddenColumns` stay the array they started with.

**AC-002 evidence:** `src/views/board-renderer-hierarchy.test.ts` "renders a status column in the meta grid when the stored list makes it visible" — a stored list naming `status` visible renders it under `[data-note-database-column-key='status']` inside `.db-board-card-meta`, not only as a title chip.

**AC-003 evidence:** `src/views/board-card-fields.test.ts`'s `it.each(SCHEMA_SHAPES)` differential (T010, five schema shapes including the new title-only one) plus the capture pair in `tasks.md` T011 — `npm run screenshots` moved 0 board captures by pixelHash/layoutHash with no stored list on any of them.

**AC-004 evidence:** `src/views/board-renderer-parity.test.ts` "does not let a stored card field list move the reference card's fixed slots" (a `boardCardFields` list stored on a reference-mode config; the fixed time/tags slots are unmoved) plus `tasks.md` T012's DOM-assertion and capture evidence.

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
<!-- /ANCHOR:closure -->
