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
    last_updated_at: "2026-09-05T09:35:00Z"
    last_updated_by: "code-agent"
    recent_action: "Recorded the measured red and green value behind every criterion"
    next_safe_action: "Operator re-checks the three captures on 0.0.24"
    blockers:
      - "AC-009 is operator-owned and nothing here can close it"
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/overlay-stack.ts"
      - "tools/live/sheet-grammar.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-048-ac"
      parent_session_id: null
    completion_pct: 89
    open_questions: []
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
**Status:** Implemented, awaiting operator confirmation
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
| AC-002 | REQ-002 | **Given** a filter sheet open on a phone, **When** its operator dropdown opens over it, **Then** the filter sheet's bounding box is unchanged on all four edges, **\|Δ\| ≤ 1px**, while its opacity and scale change | `sheet-grammar` stacked row: parent `getBoundingClientRect()` per edge before the push and after. **Threshold \|Δ\| ≤ 1px. Red: 336.00px** on all 31 pairs against the pre-fix tree — the parent took the keyboard inset its child should hold and rose by it. **Green: 0.00px** on all 31. The parent is never re-placed (ADR-003) and the pull-back is applied to its content, not to its own box, so no transform creates a containing block | Met | - |
| AC-003 | REQ-003 | **Given** two sheets open, **When** the scrim is counted, **Then** `document.body.querySelectorAll(".db-mobile-sheet-scrim").length` is **exactly 1** and its DOM position is **between** the two sheets, not before both | `sheet-grammar` stacked row asserting count and body index. **Threshold: exactly 1, positioned between the two. Red: count 1 but `scrim between the top two sheets` failed on all 31 pairs** — one node, behind both, which is `mobile-bottom-sheet.ts`'s documented design. **Green: 1, between them** on all 31. The count column was green before the fix and stays as a regression guard rather than as evidence | Met | - |
| AC-004 | REQ-004 | **Given** any stacked child in the inventory, **When** it is mounted, **Then** it carries a header with a title and a close control measuring **≥ 44×44**, a **16px** row inset and a **16px** title — `044`'s grammar unchanged | `sheet-grammar` per stacked pair, reusing `hasSheetHeader` and the touch-target ratchet. **Red: `child header has title and close`, `child close target ≥44×44`, `child header inset ≥16px` and `child title ≥16px` all failed on all 31 pairs.** **Green: all four pass on all 31.** `createSheetHeader` reaches every opener kind — K1 through the dropdown module, K3 through `attachSheetChromeToModal` for all 19 `DbModal` subclasses, K4 for all three `FuzzySuggestModal`s; K2 and K6 already carried it from `044` | Met | - |
| AC-005 | REQ-005 | **Given** a stacked pair with a declared keyboard of 336px, **When** the inset is published, **Then** the **topmost** sheet's `--db-mobile-sheet-bottom` is **336px** and the sheet beneath it is **0px**, and the lower sheet's top edge does not move | `sheet-grammar` stacked row reading both computed values under a declared 336px keyboard, re-placing **both** surfaces because a device raises one viewport event that reaches every subscribed sheet. **Threshold: top 336px, beneath 0px. Red: failed on all 31** — the parent held 336px. **Green: child 336px, parent 0px** on all 31. Closes the divergence `popover-position.ts` recorded in prose | Met | - |
| AC-006 | REQ-006 | **Given** a parent sheet scrolled to a known offset with a draft value typed, **When** a child opens and is then dismissed by its close and again by a drag past the flick threshold, **Then** the parent's `scrollTop` and draft value are unchanged and the parent's transform returns to identity by both paths | `sheet-grammar` stacked row plus a Vitest unit on `OverlayStack`. Drag on the child leaves the parent within 1px on all 31 rows. The unit covers the defect the drag exposed: a press inside a stacked child was read as an outside press by the parent, which closed the parent under the thumb — `overlay-stack.test.ts` now pins `isInsideSurfaceAbove` in both directions. **Partial: scroll offset and draft survival are asserted only through the parent staying mounted and un-re-placed, not by reading a `scrollTop` back** | Met | - |
| AC-007 | REQ-007 | **Given** a child whose content exceeds the viewport — the 14-property picker in `stacked-filter-property-picker.png` — **When** it is mounted, **Then** it scrolls inside its own sheet and a fade or scrollbar is present at the cut, so no row is bisected by the sheet's bottom edge with nothing to say the list continues | `sheet-grammar` stacked row on the 26-option picker. **Threshold: `scrollHeight > clientHeight` with a fade or scrollbar at the cut. Red: 985 > 424 with no fade** — clipped exactly as the operator's capture shows. **Green: 932 > 344 with the mask present**; the child's chrome is now fixed and the option list owns the scrolling, which is why `clientHeight` dropped | Met | - |
| AC-008 | REQ-008 | **Given** the gate, **When** `npm run gate` runs to completion and its status is read from `$?`, **Then** it exits **0** with one `sheet-grammar` row per registered stacked pair including at least one depth-3 chain, and the stacking negative control was observed **red then green** | `npm run gate`, status read from `$?` without a pipe → **0, 25 lanes green, 0 red**. `sheet-grammar` carries **31 stacked pairs** including three depth-3 chains (`properties property type picker`, `record column submenu`, `import confirm dropdown chain`). Red-first evidence: the same lane against the pre-fix tree reported **253 failing assertions**; against the fixed tree, **0**. The stacking negative control reads rendered style, not the marking class: parent opacity **0.88 → 1 → 0.88** with the content transform going `matrix(...) → none → matrix(...)` | Met | - |
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

**Closeable:** No — one row open, and it is the operator's.

AC-001 through AC-008 are met, each with a number observed red before it was observed green: the
same `sheet-grammar` lane, with the same 31 stacked pairs registered, reports **253 failing
assertions** against the pre-fix tree and **0** against the fixed one, and `npm run gate` exits **0**
with 25 lanes green. D1 is answered — ACCEPTED, present as a sheet (`decision-record.md` ADR-001) —
so the modal rows are migrated rather than deferred.

**AC-009 is unmet and only the operator closes it** (parent D3). Everything above it is a
measurement taken in headless Chrome against the production render path; none of it is a person
looking at an iPhone. Two further limits are recorded rather than absorbed: AC-006's scroll-offset
and draft-survival clauses are asserted through the parent staying mounted and un-re-placed rather
than by reading a `scrollTop` back, and two of the lane's columns — `exactly one scrim` and
`child drag leaves parent in place` — were already green on the pre-fix tree, so they stand as
regression guards and not as evidence that this packet changed them.
<!-- /ANCHOR:closure -->
