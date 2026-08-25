---
title: "Verification Checklist: Record Detail Panel / Hover-Open UX"
description: "Pending verification checklist for the display-only CSS-docked right side-peek record detail panel (src/views/TableRecordPeek.ts); covers synthesis edge cases plus display-only, mobile, i18n, calendar-coexistence, and iCloud-safety checks. Zero items verified yet."
trigger_phrases:
  - "record detail panel"
  - "checklist"
  - "hover open"
  - "verification"
  - "detail panel"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/014-record-detail-panel"
    last_updated_at: "2026-08-25T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Reconciled docs vs final-plan.md per-step acceptance (grep + view-switch); Planned"
    next_safe_action: "Build phase 014 per plan.md and tasks.md (8 ordered steps)"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Verification Checklist: Record Detail Panel / Hover-Open UX

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: spec.md]
  - **Evidence**: `spec.md` documents the display-only CSS-docked side-peek (`src/views/TableRecordPeek.ts`), the Name-cell OPEN affordance with title-hidden fallback, the Anytype two-group IA (header + hidden, `local` omitted) using `getColumnsInOrder` minus `getVisibleColumns`, the toolbar-restyle exclusion, the `openRow`/`Modal`/`DataSource`/calendar-panel/`.db-record-detail-*` exclusions, the i18n requirement, and REQ-001..REQ-007.
- [ ] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: plan.md]
  - **Evidence**: `plan.md` defines the locked design — `src/views/TableRecordPeek.ts` (sibling of the existing calendar `src/views/RecordDetailPanel.ts`, no `DataSource` import), the four exports (`attachTitleOpenAffordance`, `openTableRecordPeek`, `closeTableRecordPeek`, `syncTableRecordPeek`), the CSS-docked side-peek core algorithm, the three `DatabaseView.ts` hunks (`renderCell`, `handleDatabaseKeydown`, overlay lifecycle), the i18n data, the appended `styles.css` block, and the rollback.
- [ ] CHK-003 [P1] Toolbar-restyle, `openRow`/`Modal`/`DataSource`, calendar-panel-reuse, and `.db-record-detail-*`-reuse exclusions recorded [EVIDENCE: spec.md scope]
  - **Evidence**: `spec.md` scope and REQ-003 state the core Obsidian toolbar is not restyled; `openRow` / `dataSource.openNote`, Obsidian `Modal`, the calendar `openRecordDetailPanel`, `DataSource` imports, and `.db-record-detail-*` CSS reuse are excluded; `src/views/RecordDetailPanel.ts` stays untouched.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Fork typecheck passes with the phase diff [EVIDENCE: pending — T013 output]
  - **Evidence**: T013 typecheck output to be recorded here at verification time.
- [ ] CHK-011 [P0] No console errors or warnings in panel flows [EVIDENCE: pending — manual console check]
  - **Evidence**: T016 manual pass includes a console sweep across open/close, hidden-toggle, and grid-scroll dismiss.
- [ ] CHK-012 [P1] Zero core-toolbar style edits and zero `.db-record-detail-*` selectors in the diff [EVIDENCE: pending — T014 grep]
  - **Evidence**: T014 toolbar-selector and `.db-record-detail-*` grep output to be recorded here.
- [ ] CHK-013 [P1] Code follows fork patterns (one new file + few hunks) [EVIDENCE: pending — diff shape review]
  - **Evidence**: T012 diff-shape check: 1 new view module (`src/views/TableRecordPeek.ts`) + i18n data (`src/i18n.ts`) + 1 appended `styles.css` block + 1 host file (`DatabaseView.ts`) with three hunks; `setupRowInteractions` untouched; `src/views/RecordDetailPanel.ts` untouched.
- [ ] CHK-014 [P0] New module imports nothing from `DataSource` and references no `mutateFrontmatter` / `openNote` [EVIDENCE: pending — T014 import grep]
  - **Evidence**: T014 grep on `src/views/TableRecordPeek.ts` returns no matches for `DataSource`, `mutateFrontmatter`, or `openNote` (final-plan step 2 acceptance — display-only / no-navigation by construction, not just by `DataSource` import).

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: REQ-001 through REQ-007]
  - **Evidence**: `spec.md` REQ-001..REQ-007 mapped to T004-T016 outcomes.
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: pending — T016 notes]
  - **Evidence**: T016 covers hover-open, CSS-only persistent OPEN on phone, title-hidden fallback, hidden-group reveal, empty state, long-value wrap, Mod+Enter/Esc + focus return (document capture), inline-edit concurrency, grid-scroll dismiss, title click still opens the note, calendar event-card panel still edits, and zh-locale i18n.
- [ ] CHK-022 [P1] Edge cases tested [EVIDENCE: spec.md edge cases]
  - **Evidence**: `spec.md` §8 boundaries and error scenarios exercised in T016 (see the synthesis edge-case checks below).
- [ ] CHK-023 [P1] Regression sweep clean [EVIDENCE: pending — T015 notes]
  - **Evidence**: T015 confirms views, formula engines, filters, rollups (count|sum|avg|list, display-only), and templates behave as before, and the calendar event-card panel still edits in place.

### Synthesis edge cases (§"Must handle")

- [ ] CHK-060 [P0] Title column hidden: compact OPEN attaches to the row's first visible data column (`getVisibleColumns(...)[0]`) from the same `renderCell` hunk [EVIDENCE: pending — T016]
  - **Evidence**: `db-title-cell` is only added when `file.name` is visible (`CellRenderer.ts:117-118`); fallback verified in T016.
- [ ] CHK-061 [P0] OPEN vs title click vs Page Preview: button outside the `<a>`, no `data-note-database-hover-link`, click stopped; title click remains navigation [EVIDENCE: pending — T016]
  - **Evidence**: T005 implementation + T016 manual check; `markNoteHoverLink` stays on the title `<a>` (`CellRenderer.ts:124-129`).
- [ ] CHK-062 [P1] CSS-docked side-peek: panel docks `position: absolute; right:0; width: min(360px, 100%)` inside `.note-database-container` (`styles.css:63-125`); no `getVisiblePopoverBounds` / flip / `positionToolbarPopover`; dismisses on container `scroll` [EVIDENCE: pending — T016]
  - **Evidence**: T006/T008 implementation + T016 dock + scroll check.
- [ ] CHK-063 [P1] Zero properties: one muted `t("panel.noProperties")` row, not an empty hole [EVIDENCE: pending — T016]
  - **Evidence**: T011 implementation + T016 zero-property record check.
- [ ] CHK-064 [P1] Many hidden properties: hidden list scrolls inside the panel; reveal control omitted when the hidden set is empty [EVIDENCE: pending — T016]
  - **Evidence**: T007/T011 implementation + T016 many-hidden check; AppFlowy `numHiddenFields != 0` guard.
- [ ] CHK-065 [P1] Empty hidden values: empty readonly/derived hidden rows omitted (Anytype filter) [EVIDENCE: pending — T016]
  - **Evidence**: T007 implementation + T016 check; Anytype `relation.tsx:40-42`.
- [ ] CHK-066 [P1] Long values: wrap within the panel; no truncation; no horizontal scroll; no `.db-record-detail-*` reuse [EVIDENCE: pending — T016]
  - **Evidence**: T008/T011 implementation + T016 long-value check.
- [ ] CHK-067 [P1] Inline-edit on another row while panel open: both functional; panel keyed to `row.file.path` [EVIDENCE: pending — T016]
  - **Evidence**: T006 implementation + T016 concurrency check.
- [ ] CHK-068 [P1] Grid scroll while open: panel dismisses on container `scroll` (default) so it cannot detach inside the `overflow: auto` box [EVIDENCE: pending — T016]
  - **Evidence**: T006 implementation + T016 grid-scroll check.
- [ ] CHK-069 [P0] Re-render / refresh / view switch: `syncTableRecordPeek(this.rows)` rebuilds the same `row.file.path` or closes; `closeActiveOverlays` also calls `closeTableRecordPeek()`; a view switch (which fires `closeActiveOverlays`) dismisses the peek with no orphan DOM; no stale DOM after `renderTable` [EVIDENCE: pending — T016]
  - **Evidence**: T011b overlay-lifecycle hunk + T016 re-render and view-switch checks. (Ship blocker — promoted to P0; final-plan step 7 acceptance.)
- [ ] CHK-070 [P1] Keyboard conflict: bare Enter stays inline edit; only Mod+Enter opens; Esc while open closes the panel first via document capture (not a pushed `Scope`) [EVIDENCE: pending — T016]
  - **Evidence**: T010 implementation + T016 keyboard check (`DatabaseView.ts:1523-1526`).
- [ ] CHK-071 [P1] Roving tabindex: OPEN `tabIndex="-1"` so it is not an extra Tab stop between cells [EVIDENCE: pending — T016]
  - **Evidence**: T004 implementation + T016 Tab-cycle check (precedent: icon gutter `TableRenderer.ts:491-493`).
- [ ] CHK-072 [P0] Hidden-set math: hidden = `getColumnsInOrder(config)` (`ColumnConfig.ts:64`) minus `getVisibleColumns(config, rows, state, pendingShowColumns)` (`ColumnConfig.ts:77-101`), skipping `file.name`; not `config.columns` (which does not exist) [EVIDENCE: pending — T016]
  - **Evidence**: T007 implementation + T016 hidden-group check.
- [ ] CHK-073 [P0] Calendar module untouched: `src/views/RecordDetailPanel.ts` has zero edits in the diff and its event-card panel still edits in place [EVIDENCE: pending — T014/T016]
  - **Evidence**: T014 diff grep + T015/T016 calendar regression check.
- [ ] CHK-074 [P1] No `.db-record-detail-*` CSS reuse: new `.db-record-peek-*` classes only [EVIDENCE: pending — T014]
  - **Evidence**: T014 `.db-record-detail-*` grep on the diff returns no added/modified selectors.

### i18n

- [ ] CHK-085 [P0] i18n keys `panel.open`, `panel.noProperties`, `panel.hiddenProperties` present in `src/i18n.ts` for en / zh-CN / zh-TW [EVIDENCE: pending — T014]
  - **Evidence**: T011a implementation + T014 key grep.
- [ ] CHK-086 [P0] No raw English in zh locales: switching to zh-CN / zh-TW shows localized OPEN / "No properties" / hidden-group label [EVIDENCE: pending — T016]
  - **Evidence**: T016 locale-switch check.

### Mobile

- [ ] CHK-080 [P0] CSS-only persistent OPEN on `body.is-phone` (`body.is-phone .note-database-container .db-record-open-btn { opacity: 1 }`); no `isPhoneLayout()` JS [EVIDENCE: pending — T016]
  - **Evidence**: T009 implementation + T016 phone check.
- [ ] CHK-081 [P0] No hover-only or `MouseEvent`-only path [EVIDENCE: pending — T016]
  - **Evidence**: T009/T010 implementation + T016 phone check; AppFlowy full-page mobile route is NOT used.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-024 [P0] Detail-peek module, i18n keys, and appended `styles.css` block created [EVIDENCE: pending — T004/T008/T011a]
  - **Evidence**: `src/views/TableRecordPeek.ts` exists with the four exports (`attachTitleOpenAffordance`, `openTableRecordPeek`, `closeTableRecordPeek`, `syncTableRecordPeek`); `src/i18n.ts` has `panel.open` / `panel.noProperties` / `panel.hiddenProperties` × three locales; a delimited `.note-database-container …` block with new `.db-record-peek-*` classes is appended to plugin-root `styles.css`.
- [ ] CHK-025 [P1] No unrelated files touched [EVIDENCE: pending — T012 diff stat]
  - **Evidence**: T012 confirms 1 new view module + i18n data + 1 appended `styles.css` block + 1 host file (`DatabaseView.ts`) with three hunks, and no files outside the phase's planned surface; `setupRowInteractions` and `src/views/RecordDetailPanel.ts` untouched.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets or telemetry [EVIDENCE: pending — diff scan]
  - **Evidence**: Diff scan for credential-shaped values and telemetry calls to be recorded here.
- [ ] CHK-031 [P0] No new evaluation paths added [EVIDENCE: pending — diff scan]
  - **Evidence**: The existing sandboxed formula engines remain the only executors; the panel reuses `stringifyValue` (`src/data/Stringify.ts:1`) and adds no new formatters (NFR-S02).
- [ ] CHK-032 [P1] Panel is read-only (iCloud-safe) [EVIDENCE: pending — T014/T015 notes]
  - **Evidence**: T014 confirms no `DataSource` / `mutateFrontmatter` / `openNote` references; T015 regression confirms no writes; rollups remain display-only; the hidden-group toggle is in-memory CSS, not a vault or view-def write.

### iCloud / display-only

- [ ] CHK-090 [P0] Module imports nothing from `DataSource` and references no `mutateFrontmatter` / `openNote` (write surface is `mutateFrontmatter` `:288` etc.; navigation surface is `openNote` via `openRow`) [EVIDENCE: pending — T014]
  - **Evidence**: T014 grep on `src/views/TableRecordPeek.ts` returns no matches for `DataSource`, `mutateFrontmatter`, or `openNote`; reads `row.frontmatter` / `row.computed` only (final-plan step 2 acceptance).
- [ ] CHK-091 [P0] Hidden-group toggle is in-memory CSS, not a vault or view-def write [EVIDENCE: pending — T014/T016]
  - **Evidence**: T007 implementation; do not copy Anytype `Storage.setToggle` into note files or the view def.
- [ ] CHK-092 [P0] Rollups stay display-only; no new evaluation paths [EVIDENCE: pending — T015]
  - **Evidence**: T015 regression; `ColumnDef` comment at `types.ts:69-70`; NFR-S02.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: pending — final read-through]
  - **Evidence**: `spec.md`, `plan.md`, and `tasks.md` all describe the same display-only CSS-docked side-peek scope and diff shape (1 view module + i18n data + 1 `styles.css` block + 1 host file with three hunks; new `.db-record-peek-*` classes; `src/views/RecordDetailPanel.ts` untouched).
- [ ] CHK-041 [P1] Code comments carry durable WHY only [EVIDENCE: pending — comment review]
  - **Evidence**: Review of the new module's comments; no ephemeral artifact labels (spec paths, task/finding ids).
- [ ] CHK-042 [P2] Research baseline referenced [EVIDENCE: spec.md related docs]
  - **Evidence**: `spec.md` related docs cite this phase's `research/synthesis.md` and `research/research.md` (stale 008 pointer fixed).

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Only phase-folder docs and planned fork files touched [EVIDENCE: pending — git status]
  - **Evidence**: `git status` shows only the phase docs and the planned fork diff (`src/views/TableRecordPeek.ts`, `src/i18n.ts`, `src/views/DatabaseView.ts`, `styles.css`); `src/views/RecordDetailPanel.ts` is NOT in the diff.
- [ ] CHK-051 [P1] No scratch/ or temp files left [EVIDENCE: pending — folder inventory]
  - **Evidence**: Phase folder contains only the committed markdown files; no scratch residue in the fork diff; `implementation-summary.md` untouched.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 22 | 0/22 |
| P1 Items | 21 | 0/21 |
| P2 Items | 1 | 0/1 |

**Verification Date**: 2026-08-25
**Verified By**: Pending — phase not yet built

<!-- /ANCHOR:summary -->
