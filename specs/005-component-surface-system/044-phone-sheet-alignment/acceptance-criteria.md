---
title: "Acceptance Criteria: Phone Sheet Alignment"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "044 acceptance criteria"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/044-phone-sheet-alignment"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the acceptance criteria for this packet"
    next_safe_action: "Meet, waive or supersede the open criteria"
    blockers:
      - "AC-006 is operator-only; nothing in this repository can close it"
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-044-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Phone Sheet Alignment

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/044-phone-sheet-alignment
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
| AC-001 | REQ-001 | **Given** the shipped phone build, **When** every body-mounted surface that presents as a bottom sheet is enumerated, **Then** each one reached the screen through `applySheetChrome` and none built its own sheet-like container directly. **Failing value today: `db-mobile-column-width-panel` does not** — `src/views/database-view.ts:11412` calls `doc.body.createDiv` and `rg -n 'applySheetChrome' src/views/database-view.ts` returns nothing. | `tools/live/sheet-grammar.mjs` instance table, plus `rg -n 'body\.createDiv' src` showing no surface-class hit outside the sheet module | Unmet | - |
| AC-002 | REQ-002 | **Given** the column-width adjuster open on a 390x844 phone page, **When** its DOM is measured, **Then** it carries all seven grammar elements: rounded sheet surface, grab band, header with a close affordance over 44px, padded rows, the four width presets as one segmented control, keyboard inset, safe-area inset. **Failing value today: 0 of 7** — the operator's screenshot shows a bare strip with a title at x=0 and a slider bleeding off the left edge. | `sheet-grammar.mjs` row for `column-width`, plus a captured PNG read by hand at both themes | Unmet | - |
| AC-003 | REQ-003 | **Given** a sheet containing a text or numeric field, **When** the field takes focus and `visualViewport` height is reduced to emulate the keyboard, **Then** the sheet's bottom edge sits above the reduced viewport bottom and the focused field's rect is fully inside the visible area. **Negative control:** with the inset publisher disabled, the same measurement must place the field below the reduced bottom. | `sheet-grammar.mjs` keyboard leg, run red first against the current strip presentation, then green | Unmet | - |
| AC-004 | REQ-004 | **Given** the settings sheet open on a phone, **When** the grab band is dragged past the flick threshold, **Then** the sheet closes; **and When** its body is measured, **Then** no label wraps against its control and no description text is clipped at the right edge. **Failing value today: the drag does nothing, and the operator's screenshot shows "Leave empty to scan" cut at the right edge.** | `sheet-grammar.mjs` row for `settings`, plus `settings.test.ts` for the close path | Unmet | - |
| AC-005 | REQ-005, REQ-007, REQ-008 | **Given** every instance the inventory ranks, **When** `sheet-grammar` runs in the gate, **Then** it exits 0 with one row per instance per element; **and When** one element is removed from one conforming surface, **Then** the check goes red on that surface alone and green again once restored by hash. | `npm run gate` exit status with the `sheet-grammar` lane registered, plus the recorded red-then-green control run | Unmet | - |
| AC-006 | REQ-002, REQ-004, REQ-005 | **Given** a released build installed on the operator's iPhone, **When** the operator opens the column-width adjuster, the settings sheet and the Add view sheet, **Then** each reads as aligned with the other sheets and the settings sheet closes from its handle. Only the operator closes this row; a green gate has already been shown insufficient on this program. | Operator report against a named release, recorded on `../roadmap.md` §4 rows 40, 41 and 43 | Unmet | - |
| AC-007 | REQ-006 | **Given** `specs/006-list-view-deprecation/002-hide-and-migrate` has landed, **When** the Add view picker is enumerated, **Then** it carries no **List view** row. Stays open while `006` is unstarted; this phase owns the assertion, not the removal. | `sheet-grammar.mjs` add-view row list | Unmet | - |

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

Written at opening, not at closing. Seven criteria are open. Six can be closed inside this
repository; AC-006 cannot, and that asymmetry is the point of the phase — every previous sheet fix
on this program passed its own gate and still reached the operator broken.
<!-- /ANCHOR:closure -->
