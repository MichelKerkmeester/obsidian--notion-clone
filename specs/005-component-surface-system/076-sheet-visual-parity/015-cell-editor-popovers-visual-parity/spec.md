---
title: "Feature Specification: Phase 15: Inline Cell-Editor Popovers Visual Parity"
description: "cell-editor-text and cell-editor-select (cell-renderer.ts) are inline popovers that edit a table cell at the touch boundary, distinct from the record sheet's own property editors (008) and never targeted by any 076 child."
trigger_phrases:
  - "076 phase 15"
  - "cell editor popovers visual parity"
  - "015 define table"
  - "inline cell editor visual parity"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/015-cell-editor-popovers-visual-parity"
    last_updated_at: "2026-09-11T05:40:00Z"
    last_updated_by: "302-sheet-inventory-coverage"
    recent_action: "Scaffolded from the coverage audit; nothing started"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T003"
    blockers:
      - "No card container per the 076 frame ruling"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/cell-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "015-cell-editor-popovers-visual-parity-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Whether these inline popovers should adopt sheet-class chrome on the phone at all, or stay a lighter-weight overlay — T001 reads the current touch-boundary behaviour before a target is set"
    answered_questions:
      - "Distinct from 008 (record-detail sheet's own property editing): this child is the table view's own inline cell popovers, opened directly on a cell without opening the record sheet first"
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 15: Inline Cell-Editor Popovers Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

`src/views/cell-renderer.ts:601` opens an inline editor popover directly on a table cell — `cell-editor-text` and `cell-editor-select` in the coverage audit — without opening the record sheet. This is a different surface from `008-record-sheet-visual-parity`'s property rows, which edit the same properties but inside the record-detail sheet. Neither cell-editor variant has ever been read against a reference; the closest is Anytype's mobile cell sheets (email/multiselect), themselves full sheets rather than inline popovers, which this child's DEFINE table records as a form-factor mismatch rather than papering over.

**The gate that closes this child is an image judge, not a lane** (parent D1). Pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree.

**Critical dependencies**: `008-record-sheet-visual-parity` targets the same underlying properties inside the record sheet; a shared property-rendering primitive change there should be checked against this child too, and vice versa.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P2 |
| **Status** | Scaffolded — opened 2026-09-11 from the coverage audit, nothing started |
| **Created** | 2026-09-11 |
| **Branch** | `worktrees/302-sheet-inventory-coverage` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `076-sheet-visual-parity` |
| **Predecessor** | `../014-fuzzy-suggest-sheets-visual-parity/spec.md` |
| **Successor** | `../016-view-toolbar-options-visual-parity/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 15** opened from the coverage audit (`../coverage-audit.md`), which found `cell-editor-text` and `cell-editor-select` allowlisted for story coverage (exempt, needs the vault) but with no `076` visual target and no reference beyond one Anytype cell-sheet family for `cell-editor-select`.

**Scope boundary**: the inline popover chrome these two editor kinds present at the touch boundary — frame, control layout, dismiss affordance. Not the record sheet's own property rows (`008`), not the underlying value model.

**Deliverables**: a completed DEFINE table with a Source column, one lane clause per measurable row, producer/stylesheet changes, current captures, and `verification.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

Both inline cell-editor variants inherit `cell-renderer.ts:601`'s popover chrome, which has never been read against a reference or the 076 frame ruling. `071/001`'s inventory records `cell-editor-text` as `none / anytype/mobile/sheets` (four email-cell captures) and `cell-editor-select` as `none / anytype/mobile/sheets` (six multiselect-cell captures) — in both cases the reference is a full mobile sheet, while ours is an inline popover at the touch boundary, a structural mismatch this child's target must account for rather than assume away.

### Purpose

The inline cell editors present a small, sheet-consistent popover — plain background, no card container, a single control per editor kind — legible as belonging to the same visual family as the rest of the app even though its form factor is smaller than a full sheet.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

- `cell-editor-text` (overflow-only variant) — `src/views/cell-renderer.ts:601`, inline editor popover
- `cell-editor-select` (overflow-only variant) — `src/views/cell-renderer.ts:601`, inline editor popover

### Producers

- `src/views/cell-renderer.ts` — both editor kinds' shared mount point

### Out of Scope

- The record-detail sheet's own property rows (`008`)
- The underlying value model and persistence
- Any editor kind not named above (date/relation/etc. editors inside the record sheet stay `008`'s scope)
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 — Blockers (MUST complete)

- **REQ-001** No card container around the editor's control — dividers/plain background where applicable (076 frame ruling), scaled to the popover's smaller frame
- **REQ-002** The form-factor mismatch (inline popover vs. Anytype's full cell sheet) is recorded explicitly in §13, not resolved by inference
- **REQ-003** The image judge scores ≥ 14/16 with no row at 0, twice consecutively, against the chosen reference

### P1 — Required

- **REQ-004** Every DEFINE row names its Source reference and why
- **REQ-005** The operator's device row is present and unticked
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

| ID | Criterion | Measured by |
|----|-----------|-------------|
| SC-001 | No card container renders around the editor control | Lane clause, new |
| SC-002 | Form-factor mismatch recorded, not papered over | `spec.md` §13 |
| SC-003 | Judge ≥ 14/16, no row at 0, twice on an unchanged tree | `verification.md` |
| SC-004 | The operator reads a cell editor on their own iPhone and reports it aligned | Operator — no agent ticks this |
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Impact | Mitigation |
|------|--------|------------|
| Reference is a full sheet, ours is a small popover | A target copied 1:1 would misjudge scale | §13 records the mismatch; target is composed structurally (control kind, dismiss affordance), not by matching sheet-scale chrome |
| A fix here diverges from `008`'s property rows for the same underlying property type | Two editors of the same property look inconsistent | Cross-checked against `008`'s spec before this child's producer edit lands |
<!-- /ANCHOR:risks -->

---

## 7. NON-FUNCTIONAL REQUIREMENTS

Touch targets unaffected by a background-only change. No contrast regression in either theme.

---

## 8. EDGE CASES

- Empty/null cell value opening the editor
- A select editor with a very long option list (scroll behaviour inside the popover)

---

## 9. COMPLEXITY ASSESSMENT

Level 2. Two editor kinds sharing one mount point, presentational.

---

## 10. RISK MATRIX

| Area | Likelihood | Impact | Net |
|---|---|---|---|
| Target copied from a mismatched full-sheet reference | Medium | Medium | §13 records the mismatch explicitly before any target row is written |
| Divergence from `008`'s property rows | Low | Medium | Cross-checked in T001 against `008`'s current spec |

---

## 11. USER STORIES

As the operator, I tap a table cell and the inline editor that appears reads as a small, consistent piece of the same visual family as every sheet in the app.

---

## 12. OPEN QUESTIONS

- Whether these popovers should grow sheet-class chrome on the phone (matching the "four dropdown families the grammar presents as sheets" pattern used elsewhere) or stay a lighter inline overlay — T001 records current behaviour before a target is set

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

### References

- **Operator screenshot**: none on file naming either cell-editor variant (recorded as a gap)
- **Anytype** (`cell-editor-text`): `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-cell-email-empty-{dark,light}.png` +2 — a full mobile sheet, not an inline popover
- **Anytype** (`cell-editor-select`): `screenshots/anytype/mobile/sheets/anytype-mobile-sheet-cell-multiselect-empty-{dark,light}.png` +4 — same form-factor note
- **Notion / ClickUp**: none in this repository for an inline cell-editor popover (recorded as a gap)

### What the reference cannot answer

- Popover-scale chrome (frame radius, inset) — both references are full sheets, not popovers, so this row stays ours, marked `TBD — needs operator capture` where undetermined

### The table

| Element | Ours today | Reference (structural) | Target | Source |
|---|---|---|---|---|
| Frame | `TBD — T001` | n/a at this scale (076 frame ruling applies where it can) | No card container; plain background scaled to the popover's frame | Operator ruling (frame ruling) |
| Control kind | Text field / select list, per editor | Anytype's cell sheets: a full-width field per property type | Confirm control kind matches the property type exactly | Anytype (structural only) |
| Dismiss affordance | `TBD — T001` | n/a | Confirm tap-outside or explicit dismiss, consistent with other popovers | Internal (T001 finding) |
| Form-factor mismatch | n/a | Reference is a full sheet; ours is inline | Recorded explicitly, not resolved by 1:1 copying | Internal (this row is the record of the gap) |
<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`, `../decision-record.md`
- **Coverage source**: `../coverage-audit.md`
- **Related sibling**: `../008-record-sheet-visual-parity/spec.md` (same properties, different surface)
- **Frame ruling**: `scratchpad/loop/076-frame-ruling.md`
