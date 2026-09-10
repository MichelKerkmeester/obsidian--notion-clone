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
| 8 | `008-filter-sheet-row-model/` | Filter sheet: a condition's property/operator/value stack across three rows instead of sharing one with three icon buttons — the sheet renders property names as two characters today | scaffolded |
| 9 | `009-properties-sheet-row-model/` | Properties sheet: cut the row from eight elements to four, drop the printed storage key, add the Shown/Hidden partition, and move wrap and delete into an edit-property sheet | scaffolded |
| 10 | `010-sheet-copy-touch-idiom/` | Copy: the four strings that tell a phone user to click or double-click, one ellipsis spelling, one word for a property | scaffolded |
| 11 | `011-record-sheet-header-and-icons/` | Record sheet: the one phone-sheet title that does not centre, and the title-centring contract that covers thirteen surfaces and misses this family's two | scaffolded |
| 12 | `012-sort-and-group-sheet-rows/` | Sort: a two-row rule with a labelled delete and one reorder affordance rather than two. Group: the Shown/Hidden partition and header-level bulk actions | scaffolded |
| 13 | `013-sheet-input-and-action-order/` | Four sheets whose controls are ordered against the action they serve — the confirm card puts Cancel above the destructive action, Notion puts it below in 4/4 captures | scaffolded |
| 14 | `014-sheet-polish/` | The audit's P3 residue in one packet: the icon picker's crowded search row, the side-by-side add affordances, and the convergence findings recorded so they are not re-audited | scaffolded |
| 15 | `015-sheet-design-fundamentals/` | The two cross-sheet findings from `sheet-design-review.md` (the operator's 2026-09-10 `sk-design-fundamentals` double-check) that no single child owns: the calendar mini-nav's 24px touch target and the missing group-sheet screenshot scenario | scaffolded |

### The 2026-09-09 audit wave (phases 8-14)

Phases 8 through 14 were opened together by one artefact, `sheet-notion-audit.md`, written in this
packet under the operator's 2026-09-09 ~22:30 ruling — *"Check more sheets align closer to notion,
input, content, wise etc"* and *"Ui improvement is focus here"*. The audit covers every shipped
phone sheet at the level of inputs and content, and counts **16 P1, 26 P2 and 13 P3** deltas
across sixteen surfaces.

**Read `sheet-notion-audit.md` §0 before working any of the seven.** Every Notion iOS capture in
this repository is 299x678 — a Mobbin thumbnail, verified with `sips` across the tree — so no
numeric threshold in any of these phases may be derived from a Notion asset. Each phase's Notion
column is structural; each numeric target is our own measurement, an internal-consistency target,
or `TBD` pending one of the six operator captures the audit lists in its §5.

**Implementation order** is `010` → `008` → `009` → `011` → `012` → `013` → `014`: copy first
because it is the smallest and touches no layout, then the two P1 row models, then the record
header, then the P2 wave, then polish last.

**Three contradictions are held Proposed, not resolved** (audit §6): card grouping is `007`'s to
decide, the AND/OR conjunction control is retained by default, and the layout choice stays as rows.

### The 2026-09-10 design-fundamentals double-check (phase 15)

Opened by the operator's 2026-09-10 ruling — *"double check all sheet work, use sonnet 5xhigh
through claude2 and give them the sk-design-fundamentals skill and check it based on those design
fundamentals"* — `sheet-design-review.md` reads the nine landed 2026-09-09/10 commits (`005`,
`007`-`014`) through `sk-design-fundamentals` rather than Notion-parity: hierarchy, spacing, color
and contrast in both themes, depth, interaction craft, motion and the UX laws. It found **2 P1 and
4 P2** findings the Notion-audit lens did not surface — a dark-mode elevation inversion on `007`'s
settings card, a filter-sheet action-row inconsistency `008` left unfixed one level above the
condition rows it did fix, a label/icon spacing bug on `011`'s new type icons, a CSS-specificity
leak on `013`'s reordered date picker, an under-floor touch target on a shared calendar control,
and a missing screenshot scenario for the group sheet. Four findings were appended as
`### Design-review follow-ups (2026-09-10)` to the owning child's own `tasks.md`
(`007`, `008`, `011`, `013`); the two cross-sheet findings opened phase 15. One further finding —
the Properties sheet's 34px row density, already a landed, named decision in `009` — was recorded
as Proposed ADR-D in `roadmap.md` §7 rather than reopened as a task. Eight of the nine landings read
as unambiguous improvements against the fundamentals lens, not merely against Notion's screenshots;
`007` is the one exception, its card-grouping *mechanism* sound but its provisional fill token
producing no perceptible result in either theme.

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
