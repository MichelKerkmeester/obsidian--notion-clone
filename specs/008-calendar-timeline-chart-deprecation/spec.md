---
title: "Feature Specification: Calendar, Timeline and Chart View Deprecation"
description: "Retire the calendar, timeline and chart views together: hide them from every picker and settings surface, migrate existing views to a settings redirect, remove the renderers and their harness lanes from the shipped bundle, archive the removed code with a restore path, and strip every mention from the root README."
trigger_phrases:
  - "008 calendar timeline chart deprecation"
  - "deprecate calendar view"
  - "deprecate timeline view"
  - "deprecate chart view"
  - "archive deprecated views"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation"
    last_updated_at: "2026-09-08T08:30:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Opened the phase parent from the operator's R8/R9/R11 rulings"
    next_safe_action: "Run 001-usage-and-migration-audit before anything is removed"
    blockers:
      - "Nothing is removable until 001's audit says what a live vault actually holds"
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "008-calendar-timeline-chart-deprecation-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Do calendar/timeline/chart leave DatabaseViewType, or stay accepted-but-redirected, as list (006) and gallery (007) did?"
      - "Does the embedded codeblock host migrate too, or inherit any partial state the way 030/046 did for gallery?"
    answered_questions:
      - "The operator retired all three views together (08:25, 08:38): 'deprecate calendar and timeline view completely' / 'Also deprecate chart view'"
      - "Combined into one phase parent rather than three top-level packets: the three renderers already share one teardown mechanism (`teardownOutgoingViewRenderer` in `src/views/database-view.ts`, closed by 037's fix), so a shared audit, shared settings-redirect mechanism, and one archive location is less duplicative than three separate top-level packets making the same decisions independently; phase-qualification thresholds (architectural cross-cutting change, >15 files across three renderers plus README plus archive, >800 LOC) are both met, which is this packet's own reason for being a phase parent rather than a standard packet"
      - "The removed code is archived, not deleted: archive/deprecated-views/<view>/ at repo root, excluded from the build, with a README naming the last-live SHA and the restore procedure, recorded as an ADR in the removal phase's decision-record.md"
---

<!-- SPECKIT_TEMPLATE_SOURCE: phase-parent-spec | v2.2 -->
<!-- SPECKIT_LEVEL: phase -->
<!-- CONTENT DISCIPLINE: PHASE PARENT — no merge/migration narrative here; plan.md/tasks.md/decision-record.md live in the child phases only -->

# Feature Specification: Calendar, Timeline and Chart View Deprecation

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | phase |
| **Priority** | P1 |
| **Status** | Draft — opened 2026-09-08, nothing started |
| **Created** | 2026-09-08 |
| **Branch** | `main` |
| **Parent Spec** | None — top-level packet, sibling to `006-list-view-deprecation` and `007-gallery-view-deprecation` |
| **Parent Packet** | None |
| **Predecessor** | `037-timeline-gantt-port` (superseded by this packet's archival), `039-calendar-parity-port`, `057-calendar-anytype-parity`, `060-notion-calendar-refinement` |
| **Successor** | None |
| **Handoff Criteria** | Each child phase passes `validate.sh --strict` independently; nothing is removed before 001's audit is Met |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The operator has decided to retire the calendar, timeline and chart views: "deprecate calendar and timeline view completely" (08:25), and separately, "Also deprecate chart view" (08:38), naming the same deprecation scope, archive folder and README strip. All three renderers already share one outgoing-view teardown mechanism (`teardownOutgoingViewRenderer`, closed for the calendar/timeline leak by `037`'s 0.0.31 fix), so removing them independently across three top-level packets would re-litigate the same audit, the same settings-redirect mechanism and the same archive decision three times.

### Purpose
None of the three views can be created, opened from a picker, or configured from settings; every existing view of those three types opens through a settings redirect (as `006` did for list and `007` did for gallery); the renderers and their harness lanes are removed from the shipped bundle; the removed code is preserved under a tracked archive location with a documented restore path; and the root README and community-plugin description no longer mention calendar, timeline, gallery or chart views.

> **Phase-parent note:** This spec.md is the only authored document at the parent level. All detailed planning, task breakdowns, and decisions live in the child phase folders listed in the Phase Documentation Map below.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Auditing every live usage of calendar, timeline and chart views (in the operator's own vault and any fixture/test vault) before anything is removed
- Hiding all three view types from every picker, switcher and settings surface
- A settings redirect for every existing view of those types, matching `006`/`007`'s migration pattern
- Removing the three renderers and their harness lanes (`tools/live/*` calendar/timeline/chart scenarios, `render-assertions.mjs` lanes) from the shipped bundle
- Archiving the removed code under `archive/deprecated-views/<view>/` at repo root, excluded from the build, with a README naming the last-live SHA and the restore procedure, recorded as an ADR
- Stripping every calendar, timeline, gallery and chart mention from the root `README.md` and the community-plugin description
- Coherently removing the calendar/timeline/chart branches of `teardownOutgoingViewRenderer` in `src/views/database-view.ts` once no renderer needs tearing down

### Out of Scope
- The gallery view's own removal — already complete under `007-gallery-view-deprecation`; this packet only touches the README's remaining gallery mentions (R9)
- The list view's own removal — already tracked under `006-list-view-deprecation`
- Board and table views — explicitly kept

### Files to Change
Per-phase detail lives in each child's `plan.md`; this row summarizes the audit trail only.

| File Path | Change Type | Phase | Description |
|-----------|-------------|-------|-------------|
| `src/views/calendar-renderer.ts`, `calendar-timeline-renderer.ts`, `timeline`/gantt renderer files, chart renderer file(s) | Move (archive) | 003 | Removed from the bundle, preserved under `archive/deprecated-views/` |
| `src/views/database-view.ts`, `embedded-database-renderer.ts` | Modify | 002, 003 | Settings redirect for existing views; `teardownOutgoingViewRenderer`'s calendar/timeline/chart branches removed once unreachable |
| `tools/live/*` calendar/timeline/chart scenarios, `render-assertions.mjs` | Remove | 003 | Harness lanes for removed renderers |
| `README.md`, community-plugin description | Modify | 004 | Strip calendar/timeline/gallery/chart mentions |
| `archive/deprecated-views/<view>/README.md` | Create | 003 | Last-live SHA and restore procedure per view |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> This spec uses phased decomposition. Each phase is an independently executable child spec folder. All implementation details (plan, tasks, checklist, decisions, continuity) live inside the phase children.

| Phase | Folder | Focus | Status |
|-------|--------|-------|--------|
| 1 | `001-usage-and-migration-audit/` | Inventory every live calendar/timeline/chart view (operator vault + fixtures); decide the settings-redirect target per view type | active |
| 2 | `002-settings-redirect-and-migrate/` | Hide the three types from pickers/switchers/settings; ship the settings redirect for existing views | draft |
| 3 | `003-remove-renderers-and-harness/` | Remove the three renderers and their harness lanes from the shipped bundle; archive the code under `archive/deprecated-views/<view>/` with an ADR | draft |
| 4 | `004-archive-docs-and-release/` | Strip README/community-plugin mentions; release notes; confirm `037`'s timeline work is documented as superseded | draft |

### Phase Transition Rules

- Each phase MUST pass `validate.sh` independently before the next phase begins
- Parent spec tracks aggregate progress via this map
- Use `/spec_kit:resume [parent-folder]/[NNN-phase]/` to resume a specific phase
- Run `validate.sh --recursive` on parent to validate all phases as integrated unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001 | 002 | Every live view of the three types is inventoried with its redirect target decided | `001/acceptance-criteria.md` AC rows Met |
| 002 | 003 | No picker/switcher/settings surface can create or select the three types; every existing view redirects | `002/acceptance-criteria.md` AC rows Met |
| 003 | 004 | Renderers and harness lanes removed from the bundle; code archived with a restore-path README and an ADR | `003/acceptance-criteria.md` AC rows Met |
<!-- /ANCHOR:phase-map -->

---

<!-- ANCHOR:questions -->
## 4. OPEN QUESTIONS

- Do the three view types leave `DatabaseViewType` entirely, or stay accepted-but-redirected the way list did in `006` — decided in 001
- Does the embedded codeblock host need its own migration pass distinct from the main view host, as it did for gallery (`046`) — decided in 001
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Sibling packets**: `../006-list-view-deprecation/`, `../007-gallery-view-deprecation/`
- **Phase children**: See sub-folders `[0-9][0-9][0-9]-*/` for per-phase spec.md, plan.md, tasks.md
- **Graph Metadata**: See `graph-metadata.json` for `derived.last_active_child_id` pointer
