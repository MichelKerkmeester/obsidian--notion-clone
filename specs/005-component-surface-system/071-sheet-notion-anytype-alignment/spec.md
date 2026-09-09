---
title: "Feature Specification: Sheet Family Alignment to Notion x Anytype"
description: "Audit every sheet, panel and popover the app can open, then bring each sheet family as close as possible to Notion and Anytype's own presentation, starting from the two the operator named as broken."
trigger_phrases:
  - "071 sheet notion anytype alignment"
  - "sheet family audit"
  - "settings sheet redesign"
  - "add property sheet redesign"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment"
    last_updated_at: "2026-09-09T20:45:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Scaffolded child 007 (0.0.36 device recheck)"
    next_safe_action: "Execute 007/tasks.md"
    blockers:
      - "No sheet may be redesigned against a reference claim that 001 has not confirmed"
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "071-sheet-notion-anytype-alignment-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Which sheets does story-coverage.mjs and the allowlist already cover, and which are blind?"
      - "Which sheets have a direct Notion or Anytype reference capture, and which need one captured first?"
    answered_questions:
      - "R5 (settings sheet) and R6 (add-property sheet) are this packet's first two rows, per the operator"
      - "R7 asked whether every sheet has screenshots and stories; the answer is the first phase's own deliverable, not assumed"
---

<!-- SPECKIT_TEMPLATE_SOURCE: phase-parent-spec | v2.2 -->
<!-- SPECKIT_LEVEL: phase -->
<!-- CONTENT DISCIPLINE: PHASE PARENT — no merge/migration narrative here; plan.md/tasks.md/decision-record.md live in the child phases only -->

# Feature Specification: Sheet Family Alignment to Notion x Anytype

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | phase |
| **Priority** | P1 |
| **Status** | Draft — opened 2026-09-08, nothing started |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` (005-component-surface-system) |
| **Parent Packet** | `005-component-surface-system` |
| **Predecessor** | `067-sheet-family-remediation`, `054-record-and-relation-surfaces`, `051-modal-and-sheet-componentization` |
| **Successor** | None |
| **Handoff Criteria** | Each child phase passes `validate.sh --strict` independently; 001's audit table is read before any later phase starts its own sheet |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The operator reports three separate sheet-family defects in the same batch — the settings sheet's UI/UX (R5), the add-property / property-type picker sheet rendering as a tall sheet that covers the note header while the keyboard is up (R6, screenshot evidence) — and asks a fourth, structural question: does the app actually have screenshot and story coverage for every sheet it can open, checked one by one against Notion and Anytype (R7)? Prior packets (`051`, `054`, `067`) fixed individual sheets against individual reports; none of them answered R7's audit question at the level of the whole sheet inventory.

### Purpose
Every sheet, panel and popover the app can open is enumerated once, checked against story/screenshot coverage and a Notion/Anytype reference, and then brought into alignment with that reference one sheet family at a time — starting with the settings sheet and the add-property sheet, the two the operator named directly.

> **Phase-parent note:** This spec.md is the only authored document at the parent level. All detailed planning, task breakdowns, and decisions live in the child phase folders listed in the Phase Documentation Map below.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- A full inventory of every sheet/panel/popover surface the app can open (settings, add-property/property-type picker, view-config, filter, sort, group, record detail, menu cards, and any surface found during the inventory that this list omits)
- Confirming or closing the coverage gap in `tools/storybook/story-coverage.mjs` / `story-coverage-allowlist.json` and `screenshots/manifest.json` for each surface
- Mapping each surface to its Notion and/or Anytype reference capture under `screenshots/notion/` and `screenshots/anytype/`, or recording that no reference capture exists yet
- Redesigning the settings sheet (R5) and the add-property / property-type picker sheet (R6) against their mapped references
- Redesigning the remaining sheet families (view-config, filter/sort/group, record, menu cards) against their mapped references, one child phase per family

### Out of Scope
- Any non-sheet surface (toolbars, boards, tables) — those are `053`/`056`/`059`-`066`'s territory
- Report R2 (linked views/drag) and R3 (checkbox size and radio removal) — tracked in `072` and `073`

### Files to Change
Per-phase detail lives in each child's `plan.md`; this row summarizes the audit trail only.

| File Path | Change Type | Phase | Description |
|-----------|-------------|-------|-------------|
| `tools/storybook/story-coverage.mjs`, `story-coverage-allowlist.json` | Modify | 001 | Close coverage gaps found by the inventory |
| `screenshots/manifest.json` | Modify | 001, then every later phase | Register each surface's capture and its Notion/Anytype reference mapping |
| Settings sheet view/panel source | Modify | 002 | Notion/Anytype-aligned redesign |
| Add-property / property-type picker sheet source | Modify | 003 | Fix keyboard-overlap layout; Notion/Anytype-aligned redesign |
| View-config, filter/sort/group, record and menu-card sheet sources | Modify | 004-006 | Notion/Anytype-aligned redesign, one family per phase |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | `001-sheet-story-coverage-audit/` | Enumerate every sheet/panel/popover; map each to story/screenshot coverage and a Notion/Anytype reference; this is R7's audit | active |
| 2 | `002-settings-sheet/` | Settings sheet UI/UX redesign against the mapped reference (R5) | draft |
| 3 | `003-add-property-sheet/` | Property-type picker sheet: fix the keyboard-overlap defect and redesign against the mapped reference (R6) | draft |
| 4 | `004-view-config-sheet/` | View-config sheet (title field/format, column settings, etc.) redesign | draft |
| 5 | `005-filter-sort-group-sheets/` | Filter, sort and group sheets redesign | draft |
| 6 | `006-record-and-menu-sheets/` | Record detail sheet and menu-card popovers redesign | draft |
| 7 | `007-settings-sheet-strict-alignment/` | Settings sheet card-grouping shell, opened after the operator's 0.0.36 device recheck found the redesigned sheet still bad | scaffolded |

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/spec_kit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001 | 002-006 | The audit table names, for every later phase's sheet family, its story/screenshot coverage state and its Notion/Anytype reference mapping (or the explicit absence of one) | `001/acceptance-criteria.md` AC rows Met |
| 002 | (parent) | Settings sheet redesign shipped and recaptured against its mapped reference | `002/acceptance-criteria.md` AC rows Met |
| 003 | (parent) | Property-type picker sheet's keyboard-overlap defect fixed and reproduced-then-fixed, redesign shipped | `003/acceptance-criteria.md` AC rows Met |
<!-- /ANCHOR:phase-map -->

---

<!-- ANCHOR:questions -->
## 4. OPEN QUESTIONS

- Does every sheet family converge on one shared sheet-shell component, or do some (e.g. the property-type picker) still mount independently of it — the 001 audit answers this
- Where Notion and Anytype disagree on a sheet's own presentation, which reference wins, or does the packet record both and let the operator choose per sheet
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Phase children**: See sub-folders `[0-9][0-9][0-9]-*/` for per-phase spec.md, plan.md, tasks.md
- **Parent Spec**: See `../spec.md` (005-component-surface-system)
- **Graph Metadata**: See `graph-metadata.json` for `derived.last_active_child_id` pointer
