---
title: "Feature Specification: Phase 14: Fuzzy File-Suggest Sheets Visual Parity"
description: "base-file-suggest, image-file-suggest, markdown-file-suggest and the settings sheet's stacked template/cover-image pickers are all FuzzySuggestModal instances routed through createSurfaceShell with no 076 child; bundled here as one renderer family."
trigger_phrases:
  - "076 phase 14"
  - "fuzzy suggest sheets visual parity"
  - "014 define table"
  - "file suggest modal visual parity"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/014-fuzzy-suggest-sheets-visual-parity"
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
      - "src/main.ts"
      - "src/views/image-file-suggest-modal.ts"
      - "src/views/markdown-file-suggest-modal.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "014-fuzzy-suggest-sheets-visual-parity-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Whether all three FuzzySuggestModal instances plus the two view-config stacked pickers truly share one createSurfaceShell chrome, or diverge per call site — T001 confirms before a single target is written"
    answered_questions:
      - "Bundled as one child because all five surfaces share the same renderer family (Obsidian's FuzzySuggestModal through createSurfaceShell) and the same reference family (Anytype search-palette), per the operator's split-when-different-renderer-or-reference rule"
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 14: Fuzzy File-Suggest Sheets Visual Parity

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

Five surfaces in the coverage audit share one mechanism — Obsidian's `FuzzySuggestModal`, routed through `createSurfaceShell` so it gets sheet chrome on the phone — and none has a `076` child: `base-file-suggest` (`src/main.ts:3061`), `image-file-suggest` (`src/views/image-file-suggest-modal.ts:23`), `markdown-file-suggest` (`src/views/markdown-file-suggest-modal.ts:17`), and two stacked children of the settings sheet, "settings template file picker" and "settings cover image picker" (both `view-config` + fuzzy child per the sheet-grammar pair registry). They are bundled into one child because they share a renderer and a reference family — splitting them would multiply DEFINE tables without multiplying evidence.

**The gate that closes this child is an image judge, not a lane** (parent D1). Pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree, judged on the base-file-suggest capture as the representative surface (the others share its chrome per T001's confirmation).

**Critical dependencies**: `001-settings-sheet-visual-parity` owns the settings sheet itself; the two stacked file/cover pickers are this child's concern only for their own list-row chrome, not the settings sheet's frame.

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
| **Predecessor** | `../013-board-card-properties-visual-parity/spec.md` |
| **Successor** | `../015-cell-editor-popovers-visual-parity/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 14** opened from the coverage audit (`../coverage-audit.md`), which found three primary `FuzzySuggestModal` surfaces and two of their stacked settings-sheet pickers with a `none` story and a `none`/`none` reference in `071/001`'s inventory — no reference of any kind maps to any of the five.

**Scope boundary**: the shared `createSurfaceShell` chrome these five surfaces present on the phone — frame, search field, result-row anatomy. Not the fuzzy-match ranking logic, not the settings sheet's own frame (`001`).

**Deliverables**: a completed DEFINE table with a Source column, one lane clause per measurable row, producer/stylesheet changes, current captures, and `verification.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

None of the five FuzzySuggestModal-family surfaces has ever been read against a reference. `071/001`'s inventory records `none / anytype/desktop/app` for the three primary surfaces (`anytype-search-palette-query-dark.png`, `anytype-search-palette-recent-dark.png`) and `none / none` for the two stacked settings pickers — the closest available reference is a desktop palette, not a phone sheet, so this child's DEFINE table records that mismatch rather than pretending a 1:1 mapping exists.

### Purpose

Every file/image/markdown suggest surface presents the same sheet chrome — search field, result rows with a leading file icon and a trailing path hint — reading as one family whether it opens standalone or stacked over the settings sheet.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

- `base-file-suggest` — `src/main.ts:3061`, modal (FuzzySuggestModal; sheet chrome on phone)
- `image-file-suggest` — `src/views/image-file-suggest-modal.ts:23`
- `markdown-file-suggest` — `src/views/markdown-file-suggest-modal.ts:17`
- "settings template file picker" (stacked over view-config, fuzzy child)
- "settings cover image picker" (stacked over view-config, fuzzy child)

### Producers

- `src/main.ts` — base-file-suggest's call site
- `src/views/image-file-suggest-modal.ts`
- `src/views/markdown-file-suggest-modal.ts`
- The shared `createSurfaceShell` chrome (T001 names the exact file)

### Out of Scope

- Fuzzy-match ranking/scoring logic
- The settings sheet's own frame and header (`001`)
- The record sheet's own file/icon pickers if they use a different mechanism (confirmed out by T001, not assumed)
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 — Blockers (MUST complete)

- **REQ-001** No card container around the result list — dividers on the plain sheet background (076 frame ruling)
- **REQ-002** T001 confirms all five surfaces share `createSurfaceShell`'s chrome; any surface found to diverge is named and either folded in with a matched fix or split into its own follow-up child, recorded here
- **REQ-003** The image judge scores ≥ 14/16 with no row at 0, twice consecutively, on the representative capture

### P1 — Required

- **REQ-004** Every DEFINE row names its Source reference and why
- **REQ-005** The operator's device row is present and unticked
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

| ID | Criterion | Measured by |
|----|-----------|-------------|
| SC-001 | No card container renders around the result list | Lane clause, new |
| SC-002 | Shared-chrome confirmation recorded for all five surfaces | `spec.md` §13, T001 |
| SC-003 | Judge ≥ 14/16, no row at 0, twice on an unchanged tree | `verification.md` |
| SC-004 | The operator reads the sheet on their own iPhone and reports it aligned | Operator — no agent ticks this |
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Impact | Mitigation |
|------|--------|------------|
| The closest reference (Anytype desktop search palette) is not a phone sheet | Target composed from a mismatched form factor | Recorded explicitly in §13 as structural-only guidance (row anatomy, not frame), never a 1:1 mapping |
| Five surfaces assumed to share chrome but one diverges | A fix applied to four surfaces misses the fifth | T001 confirms sharing before any producer edit; a divergent surface is named and tracked, not silently skipped |
<!-- /ANCHOR:risks -->

---

## 7. NON-FUNCTIONAL REQUIREMENTS

Touch targets unaffected by a background-only change. No contrast regression in either theme.

---

## 8. EDGE CASES

- Empty result list (no matching files)
- A very long file path that must truncate without breaking the row's fixed height

---

## 9. COMPLEXITY ASSESSMENT

Level 2. One shared chrome, five call sites, contingent on confirming true sharing before any edit.

---

## 10. RISK MATRIX

| Area | Likelihood | Impact | Net |
|---|---|---|---|
| One of the five surfaces has bespoke styling | Medium | Medium | T001 diffs all five call sites before any shared-chrome edit |
| No phone-form-factor reference exists | High | Low | Row anatomy taken from the desktop palette structurally; frame taken from the 076 frame ruling directly |

---

## 11. USER STORIES

As the operator, I open any file/image/markdown picker — standalone or from inside settings — and see the same plain-background, divider-separated result-row family every other sheet uses.

---

## 12. OPEN QUESTIONS

- Whether the settings-sheet-stacked pickers should visually nest differently than the standalone ones, since they open from within another sheet rather than from the toolbar — T001 records current behaviour; no target assumes a difference until observed

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

### References

- **Operator screenshot**: none on file naming any of these five surfaces (recorded as a gap)
- **Anytype**: `screenshots/anytype/desktop/app/anytype-search-palette-query-dark.png`, `anytype-search-palette-recent-dark.png` — desktop palette, read structurally for row anatomy only (leading icon, label, no trailing chrome)
- **Notion**: none in this repository for a file-suggest surface (recorded as a gap)
- **ClickUp**: not consulted — this is not a board surface and no ClickUp file-picker capture exists under `screenshots/clickup/**` at time of audit

### What the reference cannot answer

- Row height and search-field placement on a phone form factor — the only reference is a desktop palette; both kept as ours (`TBD — needs operator capture` where undetermined) rather than sampled from a mismatched form factor

### The table

| Element | Ours today | Reference (structural) | Target | Source |
|---|---|---|---|---|
| Frame | `TBD — T001` | n/a (076 frame ruling applies directly) | Plain sheet background, dividers between rows, grab handle | Operator ruling (frame ruling) |
| Search field | `TBD — T001` | Anytype: recessed field at top | Recessed search field, per frame ruling | Anytype |
| Result row | `TBD — T001` | Anytype: leading icon + label, flat list | Leading file-type icon + label + optional path hint, divider-separated | Anytype |
| Shared-chrome confirmation | `TBD — T001` | n/a | All five surfaces confirmed sharing `createSurfaceShell`, or divergence named | Internal (T001 finding) |
<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`, `../decision-record.md`
- **Coverage source**: `../coverage-audit.md`
- **Related sibling**: `../001-settings-sheet-visual-parity/spec.md` (owns the settings sheet's own frame)
- **Frame ruling**: `scratchpad/loop/076-frame-ruling.md`
