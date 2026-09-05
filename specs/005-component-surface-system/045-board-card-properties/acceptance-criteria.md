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
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the acceptance criteria for this packet"
    next_safe_action: "Meet, waive or supersede the open criteria"
    blockers:
      - "AC-006 is operator-only"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/data/types.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-045-ac"
      parent_session_id: null
    completion_pct: 0
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
| AC-005 | REQ-003, REQ-005, REQ-006 | **Given** the Properties control open, **When** every field is toggled off, **Then** the card still renders cover and title; **and When** the control is opened on a phone, **Then** it uses `044`'s sheet row grammar and offers an explicit move affordance rather than a desktop drag handle. | Rendered DOM plus `044`'s `sheet-grammar` lane row for this surface | Unmet | - |
| AC-006 | REQ-001, REQ-005 | **Given** a released build on the operator's iPhone, **When** the operator arranges a board card's properties, **Then** they report it as close to Notion's. Only the operator closes this row. | Operator report against a named release, recorded on `../roadmap.md` §4 | Unmet | - |

**AC-001 evidence:** `src/views/board-card-fields.test.ts` "gives two views over the same database different card fields without touching either's hiddenColumns" — two `ViewConfig`s sharing one `hiddenColumns` array and one schema, each with its own `boardCardFields`, resolve to different field sequences (`["hours"]` vs `["tags", "notes"]`) while both configs' `hiddenColumns` stay the array they started with.

**AC-002 evidence:** `src/views/board-renderer-hierarchy.test.ts` "renders a status column in the meta grid when the stored list makes it visible" — a stored list naming `status` visible renders it under `[data-note-database-column-key='status']` inside `.db-board-card-meta`, not only as a title chip.

**AC-003 evidence:** `src/views/board-card-fields.test.ts`'s `it.each(SCHEMA_SHAPES)` differential (T010, five schema shapes including the new title-only one) plus the capture pair in `tasks.md` T011 — `npm run screenshots` moved 0 board captures by pixelHash/layoutHash with no stored list on any of them.

**AC-004 evidence:** `src/views/board-renderer-parity.test.ts` "does not let a stored card field list move the reference card's fixed slots" (a `boardCardFields` list stored on a reference-mode config; the fixed time/tags slots are unmoved) plus `tasks.md` T012's DOM-assertion and capture evidence.

**AC-005 evidence, partial:** `src/views/board-renderer-hierarchy.test.ts` "still renders a title with every stored field toggled off" proves the cover/title half. The phone half is now backed by a photograph rather than only code identity: `tasks.md` T013's `constructed-board-card-properties-mobile-dark.png` (and its light/desktop siblings) show the desktop popover's drag handle replaced by `.db-mobile-reorder-controls` under `.is-phone`, matching `board-card-properties-panel.stories.ts`'s own state, plus `board-card-properties-panel.test.ts`'s read-only/reorder unit cases.

**True-up, T013's landing:** `sheet-grammar.mjs` (`tools/live/sheet-grammar.mjs`) measured the mounted board Properties sheet directly, not hypothetically. `surface`, `handle`, `header`, `dropdown` and `keyboard` all measure green; `dropdown` is green specifically because this section draws no `<select>` anywhere. `rows` and `segmented` measure red — but for the same reason the already-registered-red settings sheet is red: sibling `.db-view-config-row` rows and `.db-toggle-switch` checkboxes elsewhere in the SAME mounted sheet (the subgroup dropdown, cover-image settings, "source rules" and "show empty fields" toggles), not this section's own `.db-column-manager-row` / `db-checkbox db-checkbox-field` markup, which already matches the shape `column-width` conforms with. `describeSheetGrammar` reads the whole mounted sheet with no way to scope to one section, and the Properties section never mounts except inside that shared body, so there is no real (non-fabricated) way to register it apart from the settings sheet as a whole — recorded in `sheet-grammar.mjs`'s own `REGISTERED_SURFACES` comment rather than claimed as a passing row, since registering it there would either fail the gate on a defect this section does not own or require a harness-only "Properties as its own sheet" surface the operator never sees. AC-005 stays `Unmet`: the named verification method (a registered, all-green `sheet-grammar` row) still does not exist for this surface, and closing that gap needs the settings body's own rows carried onto the shared row grammar first — the same blocker `044`'s landing left open for the settings sheet itself.

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

AC-001 through AC-004 are `Met` with observed evidence (cited above), including the two that mattered
most — AC-003 and AC-004 pull in opposite directions (nothing changes for an existing view; nothing
changes for the reference card even when a list exists) and both are DOM/capture comparisons rather
than opinions. AC-005 is partially met and its evidence is stronger than before but still not the
named check: the cover/title guarantee is proven, the phone row grammar is now backed by a photograph
(`tasks.md` T013) in addition to code identity with the already-shipped column manager, and
`sheet-grammar.mjs` measured this surface directly for the first time — five of seven elements green,
the other two (`rows`, `segmented`) red for the pre-existing settings-body reason the lane's own
comment already names for the settings sheet, not for anything this section's own markup does. The
row stays `Unmet` because the lane still carries no all-green registered row for this surface, and
`describeSheetGrammar`'s whole-sheet scope means one cannot exist here before the settings body
itself carries the shared row grammar — a blocker owned by a different lane, named precisely rather
than left as "the lane has no row here." AC-006 is operator-only and untouched. Not closeable until
AC-005 has a real passing check to point at (or the operator waives the lane requirement) and AC-006
is answered.
<!-- /ANCHOR:closure -->
