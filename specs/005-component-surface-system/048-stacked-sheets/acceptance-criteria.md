---
title: "Acceptance Criteria: Stacked Sheets"
description: "The criteria this packet must satisfy before it may be closed, each one met, waived by a decision record, or superseded by one."
trigger_phrases:
  - "acceptance criteria"
  - "closure gate"
  - "ac traceability"
  - "048 acceptance criteria"
  - "stacking thresholds"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/048-stacked-sheets"
    last_updated_at: "2026-09-05T07:20:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the acceptance criteria with thresholds for this packet"
    next_safe_action: "Measure the failing numbers into checklist.md, then meet the criteria"
    blockers:
      - "AC-009 is operator-owned and nothing here can close it"
      - "AC-004's modal rows wait on D1"
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/overlay-stack.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-048-ac"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "D1: modals opened from a sheet present as sheets, or the phone flow uses a sheet"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Stacked Sheets

<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> This document decides whether the packet may close. A packet is closeable when
> every row below is `Met`, `Waived` or `Superseded`. A `Waived` or `Superseded`
> row MUST name an ADR that exists in `decision-record.md`.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 005-component-surface-system/048-stacked-sheets
**Level:** 2
**Status:** Draft
**Date:** 2026-09-05
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

One row per criterion. `AC-ID` is stable once written: supersede a criterion, never renumber it.

Every measurement is taken on the real renderer at the production mount point, on a 390×844 phone
profile with a navbar present, and every threshold carries a failing number observed before the fix
(parent D2). Exit statuses are read from `$?` and never through a pipe.

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | **Given** the surfaces under `src/views`, **When** the inventory is derived by reading every opener, **Then** every surface that can open while another sheet is open appears once, grouped parent → child → opener kind → current → target, each row citing the `file:line` that constructs the child, and the census in `../003-mobile-sheet-presentation/sheet-and-dropdown-inventory.md` is cross-referenced rather than restated | `stacked-surface-inventory.md` §3; every row's `file:line` resolves in the tree it was written against | Met | - |
| AC-002 | REQ-002 | **Given** a filter sheet open on a phone, **When** its operator dropdown opens over it, **Then** the filter sheet's bounding box is unchanged on all four edges, **\|Δ\| ≤ 1px**, while its opacity and scale change | `sheet-grammar` stacked row: parent `getBoundingClientRect()` captured before the push and after, per edge. Negative control: remove the parent treatment, require the row red | Unmet | - |
| AC-003 | REQ-003 | **Given** two sheets open, **When** the scrim is counted, **Then** `document.body.querySelectorAll(".db-mobile-sheet-scrim").length` is **exactly 1** and its DOM position is **between** the two sheets, not before both | `sheet-grammar` stacked row, asserting count and index. Today's failing number is recorded in `checklist.md` C3 | Unmet | - |
| AC-004 | REQ-004 | **Given** any stacked child in the inventory, **When** it is mounted, **Then** it carries a header with a title and a close control measuring **≥ 44×44**, a **16px** row inset and a **16px** title — `044`'s grammar unchanged | `sheet-grammar` per stacked pair, reusing `sheet-grammar.ts`'s `hasSheetHeader` and the touch-target ratchet. Today: **5** surfaces call `createSheetHeader` or its equivalent and **0** of them is a stacked child | Unmet | - |
| AC-005 | REQ-005 | **Given** a stacked pair with a declared keyboard of 336px, **When** the inset is published, **Then** the **topmost** sheet's `--db-mobile-sheet-bottom` is **336px** and the sheet beneath it is **0px**, and the lower sheet's top edge does not move | `sheet-grammar` stacked row reading both computed values. Negative control: publish to both, require red. Closes the divergence `popover-position.ts:447-461` records in prose | Unmet | - |
| AC-006 | REQ-006 | **Given** a parent sheet scrolled to a known offset with a draft value typed, **When** a child opens and is then dismissed by its close and again by a drag past the flick threshold, **Then** the parent's `scrollTop` and draft value are unchanged and the parent's transform returns to identity by both paths | `sheet-grammar` stacked row plus a Vitest unit on push/pop ordering in `OverlayStack` | Unmet | - |
| AC-007 | REQ-007 | **Given** a child whose content exceeds the viewport — the 14-property picker in `stacked-filter-property-picker.png` — **When** it is mounted, **Then** it scrolls inside its own sheet and a fade or scrollbar is present at the cut, so no row is bisected by the sheet's bottom edge with nothing to say the list continues | `sheet-grammar` stacked row: `scrollHeight > clientHeight` and a non-zero fade or a visible scrollbar. Today: clipped with no affordance, per the operator's capture | Unmet | - |
| AC-008 | REQ-008 | **Given** the gate, **When** `npm run gate` runs to completion and its status is read from `$?`, **Then** it exits **0** with one `sheet-grammar` row per registered stacked pair including at least one depth-3 chain, and the stacking negative control was observed **red then green** | `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0; `sheet-grammar` output naming each pair. Today: the registry holds 8 rows and every one is a first sheet | Unmet | - |
| AC-009 | REQ-002, REQ-004 | **Given** a released build on the operator's iPhone, **When** they open the Properties sheet, the filter sheet's operator dropdown and its property picker, **Then** they report each as one stack rather than two sheets | The operator's own words. **Only the operator closes this row; nothing in this repository can** | Unmet | - |

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

AC-001 is met on authoring: the inventory exists, it is code-derived, and every row cites its
opener. Everything else is open. AC-009 is the operator's and is the only row that closes the
defect (parent D3). D1 gates AC-004's modal rows alone — the dropdown, menu and picker rows, which
are the majority and both operator screenshots, do not wait on it.
<!-- /ANCHOR:closure -->
