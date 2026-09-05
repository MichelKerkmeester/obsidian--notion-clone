---
title: "Acceptance Criteria: Record and Relation Surfaces"
description: "The criteria this packet must satisfy before it may be closed: one threshold per primitive and per migration, each met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "054 acceptance criteria"
  - "record surface criteria"
  - "primitive thresholds"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/054-record-and-relation-surfaces"
    last_updated_at: "2026-09-05T12:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored one threshold per primitive and per migration"
    next_safe_action: "Execute T001, then measure every Today cell red"
    blockers:
      - "AC-010 is the capture gate for every design row"
      - "AC-011 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/record-detail-panel.ts"
      - "src/views/cell-renderer.ts"
      - "src/views/table-record-peek.ts"
      - "screenshots/anytype/README.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-054-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "The three spec open questions (desktop header DOM, quick-add placement, board-card add affordance) resolve at T001"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Record and Relation Surfaces

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/054-record-and-relation-surfaces
**Level:** 3
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.
AC rows align to REQ ids; AC-010 is the capture gate and AC-011 the operator's.

Counts are measured by the census lane (one page rendering the same column through every consumer),
not by grep — a count read from a grep can be defeated by renaming a class. Desktop measurements on
the real renderer at the production mount point; phone on a 390×844 profile with a navbar present.
Every threshold carries a failing number observed before the fix (parent D2, goal D2). Exit statuses
read from `$?`, never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the record sheet, the peek and the properties panel, **Then** each header is built by the P1 primitive, and the census reads **1** distinct header builder in the family (down from 4); the record sheet's desktop DOM matches its pre-phase geometry | Census lane counting header builders across the three surfaces. Negative control: bypass P1 in one consumer, require the count to go 2. Today: **4 builders** — `record-detail-panel.ts:348-386`, `table-record-peek.ts:233-235`, `column-manager-renderer.ts:180`'s phone/desktop branch, `db-modal.ts:83-88`'s scrape | Unmet | - |
| AC-002 | REQ-002 | **Given** one column rendered through the record sheet, a board card, the peek and the properties panel, **Then** all four consumers build the row through P2, and the census reads **1** property-row vocabulary (down from 3); the row's anatomy is **label, then value, value left-aligned**, with **no format icon on the row** | SC-001's four-consumer lane row; badge colour, rating/progress/ring and conditional-format rendering asserted identical across consumers, and the desktop value's left edge asserted common across rows. Negative control: reintroduce the peek's private `renderProperty` body, require red. Today: **3 vocabularies** — `card-field-renderer.ts:102`, `table-record-peek.ts:334`, `column-manager-renderer.ts:265`+`board-card-properties-panel.ts:48`; and the desktop record sheet **right-aligns** its values (`styles.css:10161`, inherited from the board card), measured on `constructed-record-detail-desktop-dark.png` as labels at x 59 on every row and values starting at 273, 311, 319, 343, 349 and 362. **Anatomy restated by ADR-004** — the draft's "type icon + label + value on the right" is contradicted on both halves by `design-trueup.md` C1 | Unmet | - |
| AC-003 | REQ-003 | **Given** a record whose view hides columns, **When** the record sheet opens, **Then** a hidden-properties group renders with a count, toggling it reveals the hidden rows, and the group's expanded state survives a field-commit refresh | Unit test on expanded-state survival across `renderContent` re-runs; lane row asserting the group's presence and count. Today: **no group on the record sheet** — empties are filtered wholesale by `showEmptyFields` (`record-detail-panel.ts:387-396`); the group exists only on the peek (`table-record-peek.ts:259-278`), where its label `t("panel.hiddenProperties")` (`src/i18n.ts:549`) carries **no count**. **Provenance corrected by ADR-004**: this criterion is **ours**, not adopted — Anytype has no hidden group and no count on either platform (`design-trueup.md` C3), so no capture may be cited for it and AC-010 does not gate it | Unmet | - |
| AC-004 | REQ-004 | **Given** an empty relation, select or multi-select property on the record sheet or a board card, **Then** the row renders an add affordance whose click opens the same editor an occupied row opens, and **no** surface renders the word "Empty" in place of that affordance where an editor exists | Lane row clicking the affordance and asserting the editor mount equals an occupied row's editor mount. Negative control: restore the "Empty" placeholder text, require red. Today: **the word "Empty" renders** (`getEmptyDisplayValue`, `record-detail-panel.ts:636`) | Unmet | - |
| AC-005 | REQ-005 | **Given** the five type-list sites (create-property modal, conflict modal's per-writer dropdowns, relation/rollup modal, formula modal's output dropdowns, column-menu type submenu), **Then** all five read the P7 picker, the census reads **1** type list, the picker is **search-first**, the current value is marked by a **checkmark** rather than a row fill, and a format that does not apply renders **disabled with its reason** rather than being omitted | Census over the five sites' rendered options, asserting every site offers the **same unfiltered set**. Negative control: inline a thirteenth-format list at one site, require red; second control: restore a filtered subset at the conflict modal, require red. Today: **1 list + 1 filtered subset + 1 submenu**, not 3 lists — `create-property-modal.ts:48-52` declares 13 types, `property-type-conflict-modal.ts:377-380` returns a **9-of-13 or 5-of-13 subset** of them, `column-menu.ts`'s type submenu is the third site. **Restated by ADR-004**: the draft's "3 lists" cannot be observed, because the middle site is a filter and its fix is a gate rather than a merge (`design-trueup.md` C7) | Unmet | - |
| AC-006 | REQ-006 | **Given** every column type, **Then** an exported editor primitive exists per type behind `CellRenderer.startEdit`, the pinned dispatch test passes, and a lane mounts the option and relation editors without constructing `CellRenderer`; the relation editor's phone header and virtualized list behave as today | The pinned dispatch unit test (red before L6: no exported editors) plus a lane mounting two editors standalone. Today: **0 exported editor primitives** — nine private methods on a 3,152-line class (`cell-renderer.ts:644` dispatch) | Unmet | - |
| AC-007 | REQ-007 | **Given** the properties panel and the board-card properties panel, **Then** their rows consume P2's checkbox variant and the add row consumes P3, and their mechanisms — drag reorder, shift range select, per-view card list — behave as `045`'s tests assert | `045`'s existing board-card tests and the panel's range-select tests pass unchanged; lane row on the add row. Today: the two files duplicate the row builder and the `shouldIgnoreDrag` helper (`column-manager-renderer.ts:378`, `board-card-properties-panel.ts:159`) | Unmet | - |
| AC-008 | REQ-008 | **Given** the migration table, **Then** it exists with one row per §5A surface (10) and one per §5B behaviour (7), each surface row naming its primitive, its changes, its Anytype capture filename and what stays ours, and each capture filename resolving under `screenshots/anytype/` | File check against §5A/§5B; every named capture resolved. **This row gates SC-001's design claims** | Unmet | - |
| AC-009 | REQ-009 | **Given** the note body on the record sheet, **Then** it is mounted through the P6-host region after the property rows, a draft survives a refresh mid-edit, and `note-body-region.test.ts` passes unchanged | The existing test run plus a lane row asserting mount order (body after rows). Today: already true in code (`record-detail-panel.ts:290-303`) — this row freezes it as the primitive's contract so a later surface refactor cannot quietly reorder it | Unmet | - |
| AC-010 | §5B | **Given** the Anytype capture set, **When** T001 has read the named images by hand, **Then** every §5B behaviour row carries its image-true-up (adopted / adapted / rejected-with-reason) or its named gap, and **no** §5B design row was implemented before its image was read | **`design-trueup.md`** is T001's record, as it is in `050` and `055`; `migration-table.md` (T003) consumes it and is gated by AC-008 instead. Evidence: §3 carries all seven behaviour rows against 31 named captures, §4 the S9 editor taxonomy, §6 the seen/not-seen roll-up. **A4 is the one row with no reference screen** and is named as such rather than guessed; `menus/anytype-menu-cell-type-dark.png` is the one file that could not be read (its menu fell outside the crop) and the row does not depend on it. Zero §5B design rows have been implemented. **This row gates every design row** (goal D1) | **Met** | - |
| AC-011 | All | **Given** the gate, **When** `npm run gate` runs to completion and its status is read from `$?`, **Then** it exits **0** with one permanent lane row per primitive, each negative control observed **red then green**; `npm run replay` holds with reversed 0; and the board-card reference captures are unchanged after L3 or the difference is operator-ruled | `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0; the replay's reversed count; the reference recapture diff | Unmet | - |
| AC-012 | All | **Given** a released build, **When** the operator opens a record on iOS and on desktop, **Then** they read the sheet as one object page — header, properties, add affordance, hidden group, note body — and report it against the Anytype object page the directive named | The operator's own words. **Only the operator closes this row; nothing in this repository can** | Unmet | - |

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
`decision-record.md`. A waiver naming an ADR that is not there fails validation.

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

**AC-010 is Met.** T001 read 31 named captures — the 25 `anytype-menu-object-*` object-page menus,
the 12 `anytype-menu-cell-*` grid-cell editors, the iOS relations panel with its per-format editors
and its property-management sheet, and the catalogue grids — and recorded every §5B row's disposition
in `design-trueup.md`. That was the row that had to move first, because the captures are the evidence
the design rows claim to copy and a design adopted from a prose summary is the exact guess D1 exists
to prevent. It earned its keep: **nine contradictions**, three of them structural — A2's stated
anatomy is wrong on both halves, A4's hidden group does not exist in the product, and A5 reverts from
code-derived to captured.

**Three rows were restated rather than measured, and could not have been observed red as written**:
AC-002 (the anatomy the census is meant to converge on), AC-003 (its provenance — the criterion is
ours, not adopted) and AC-005 (the "3 lists" figure, which is 1 list plus 1 filter plus 1 submenu).
ADR-004 carries all three. The remaining rows' Today cells were checked against the tree and stand.

AC-012 is the operator's and is the only row that closes the ask behind the phase (parent D3).

<!-- /ANCHOR:closure -->
