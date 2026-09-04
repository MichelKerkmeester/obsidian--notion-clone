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
| AC-001 | REQ-001 | **Given** two board views over one database, **When** each is given a different visible field list and order, **Then** their cards differ accordingly **and** neither database's table column visibility changed. **Failing value today: not expressible** — `board-renderer.ts:1439` reads the same `getVisibleColumns` result the table reads, so one `hiddenColumns` set decides both, and `columnOrder` decides both orders. | A test constructing two views over one config, asserting distinct card field sequences and an unchanged `hiddenColumns` | Unmet | - |
| AC-002 | REQ-002 | **Given** a view whose list makes a `status` column visible on the card body, **When** the card renders, **Then** that column appears in the meta grid rather than only as a title chip. **Failing value today: impossible** — `board-renderer.ts:1481-1482` removes every `select` and `status` column from the grid unconditionally. | Rendered DOM of a constructed board scenario with that list | Unmet | - |
| AC-003 | REQ-004 | **Given** an existing view saved before this change and carrying no stored list, **When** it renders after the change, **Then** the card DOM is byte-identical to the pre-change render. | A before/after capture pair over the board scenarios, `pixelHash` and `layoutHash` unchanged; plus the differential unit test in `tasks.md` T010 | Unmet | - |
| AC-004 | REQ-007 | **Given** `boardExtensionsEnabled` is off — the default — **When** a properties list is stored on the view anyway, **Then** the rendered card is byte-identical to `038-board-kanban-port`'s parity fixtures and the list has no effect. The reference card resolves a fixed five-slot map (`board-renderer.ts:552`); a properties list must never move it. | `038`'s board parity fixtures unchanged, run with a stored list present | Unmet | - |
| AC-005 | REQ-003, REQ-005, REQ-006 | **Given** the Properties control open, **When** every field is toggled off, **Then** the card still renders cover and title; **and When** the control is opened on a phone, **Then** it uses `044`'s sheet row grammar and offers an explicit move affordance rather than a desktop drag handle. | Rendered DOM plus `044`'s `sheet-grammar` lane row for this surface | Unmet | - |
| AC-006 | REQ-001, REQ-005 | **Given** a released build on the operator's iPhone, **When** the operator arranges a board card's properties, **Then** they report it as close to Notion's. Only the operator closes this row. | Operator report against a named release, recorded on `../roadmap.md` §4 | Unmet | - |

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

Written at opening. Six criteria are open. AC-003 and AC-004 are the two that matter most and they
pull in opposite directions: one demands that nothing visible changes for existing views, the other
that nothing changes for the reference card even when a list exists. Both are DOM comparisons rather
than opinions, which is deliberate — a field quietly dropped from a card is invisible to every unit
test that would otherwise be written for this feature.
<!-- /ANCHOR:closure -->
