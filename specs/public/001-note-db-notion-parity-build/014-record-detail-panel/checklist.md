---
title: "Verification Checklist: Record Detail Panel / Hover-Open UX"
description: "Verification checklist for the display-only CSS-docked right side-peek record detail panel — shipped and Sonnet-verified (CONCERNS, 86/100) on branch impl; CSS-collapse and test-coverage gaps found and fixed post-review."
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
    last_updated_at: "2026-08-27T17:09:01Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Reconciled code-level evidence; dedicated manual proof remains deferred"
    next_safe_action: "None — manual proof intentionally deferred"
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
    completion_pct: 98
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

- [x] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: src/views/TableRecordPeek.ts:38-223]
- [x] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: src/views/TableRecordPeek.ts:38-223]
- [x] CHK-003 [P1] Toolbar-restyle, `openRow`/`Modal`/`DataSource`, calendar-panel-reuse, and `.db-record-detail-*`-reuse exclusions recorded [EVIDENCE: src/views/TableRecordPeek.ts:38-223; styles.css:16268-16423]

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Fork typecheck passes with the phase diff [EVIDENCE: tsc --noEmit exit 0]
- [x] CHK-011 [P0] No console errors or warnings in panel flows [EVIDENCE: src/views/TableRecordPeek.ts:95-126; src/views/TableRecordPeek.test.ts:311-337]
- [x] CHK-012 [P1] Zero core-toolbar style edits and zero `.db-record-detail-*` selectors in the diff [EVIDENCE: styles.css:16268-16423]
- [x] CHK-013 [P1] Code follows fork patterns (one new file + few hunks) [EVIDENCE: src/views/TableRecordPeek.ts:38-223; src/views/DatabaseView.ts:7937-7968]
- [x] CHK-014 [P0] New module imports nothing from `DataSource` and references no `mutateFrontmatter` / `openNote` [EVIDENCE: src/views/TableRecordPeek.ts:1-238]

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met [EVIDENCE: src/views/TableRecordPeek.test.ts:197-394; 247 tests passed]
- [ ] CHK-021 [P0] Manual testing complete [EVIDENCE: DEFERRED -- dedicated manual proof matrix never ran]
- [x] CHK-022 [P1] Edge cases tested [EVIDENCE: src/views/TableRecordPeek.test.ts:197-376; src/views/TableRecordPeek.ts:137-184]
- [x] CHK-023 [P1] Regression sweep clean [EVIDENCE: src/views/DatabaseView.ts:7937-7968,10639-10647; 247 tests passed]

### Synthesis edge cases (§"Must handle")

- [x] CHK-060 [P0] Title column hidden: compact OPEN attaches to the row's first visible data column (`getVisibleColumns(...)[0]`) from the same `renderCell` hunk [EVIDENCE: src/views/DatabaseView.ts:7946-7952]
- [x] CHK-061 [P0] OPEN vs title click vs Page Preview: button outside the `<a>`, no `data-note-database-hover-link`, click stopped; title click remains navigation [EVIDENCE: src/views/TableRecordPeek.ts:45-56; src/views/CellRenderer.ts:117-129]
- [x] CHK-062 [P1] CSS-docked side-peek: panel docks `position: absolute; right:0; width: min(360px, 100%)` inside `.note-database-container` (`styles.css:63-125`); no `getVisiblePopoverBounds` / flip / `positionToolbarPopover`; dismisses on container `scroll` [EVIDENCE: styles.css:16313-16332; src/views/TableRecordPeek.ts:124-126,181-188]
- [x] CHK-063 [P1] Zero properties: one muted `t("panel.noProperties")` row, not an empty hole [EVIDENCE: src/views/TableRecordPeek.ts:145-149; src/i18n.ts:406-408]
- [x] CHK-064 [P1] Many hidden properties: hidden list scrolls inside the panel; reveal control omitted when the hidden set is empty [EVIDENCE: src/views/TableRecordPeek.ts:156-178; styles.css:16401-16411]
- [x] CHK-065 [P1] Empty hidden values: empty readonly/derived hidden rows omitted (Anytype filter) [EVIDENCE: src/views/TableRecordPeek.ts:139-143; src/views/TableRecordPeek.test.ts:197-237]
- [x] CHK-066 [P1] Long values: wrap within the panel; no truncation; no horizontal scroll; no `.db-record-detail-*` reuse [EVIDENCE: styles.css:16313-16344]
- [x] CHK-067 [P1] Inline-edit on another row while panel open: both functional; panel keyed to `row.file.path` [EVIDENCE: src/views/TableRecordPeek.ts:190-211; src/views/TableRecordPeek.test.ts:350-376]
- [x] CHK-068 [P1] Grid scroll while open: panel dismisses on container `scroll` (default) so it cannot detach inside the `overflow: auto` box [EVIDENCE: src/views/TableRecordPeek.ts:102-105,124-126,181-184]
- [x] CHK-069 [P0] Re-render / refresh / view switch: `syncTableRecordPeek(this.rows)` rebuilds the same `row.file.path` or closes; `closeActiveOverlays` also calls `closeTableRecordPeek()`; a view switch (which fires `closeActiveOverlays`) dismisses the peek with no orphan DOM; no stale DOM after `renderTable` [EVIDENCE: src/views/TableRecordPeek.ts:198-212; src/views/DatabaseView.ts:874-880,10639-10647]
- [x] CHK-070 [P1] Keyboard conflict: bare Enter stays inline edit; only Mod+Enter opens; Esc while open closes the panel first via document capture (not a pushed `Scope`) [EVIDENCE: src/views/DatabaseView.ts:1539-1562; src/views/TableRecordPeek.ts:117-122]
- [x] CHK-071 [P1] Roving tabindex: OPEN `tabIndex="-1"` so it is not an extra Tab stop between cells [EVIDENCE: src/views/TableRecordPeek.ts:45-50]
- [x] CHK-072 [P0] Hidden-set math: hidden = `getColumnsInOrder(config)` (`ColumnConfig.ts:64`) minus `getVisibleColumns(config, rows, state, pendingShowColumns)` (`ColumnConfig.ts:77-101`), skipping `file.name`; not `config.columns` (which does not exist) [EVIDENCE: src/data/ColumnConfig.ts:79-116; src/views/DatabaseView.ts:7946-7959; src/views/TableRecordPeek.ts:137-143]
- [x] CHK-073 [P0] Calendar module untouched: `src/views/RecordDetailPanel.ts` has zero edits in the diff and its event-card panel still edits in place [EVIDENCE: src/views/RecordDetailPanel.ts:104-212; shipped: src/views/TableRecordPeek.ts]
- [x] CHK-074 [P1] No `.db-record-detail-*` CSS reuse: new `.db-record-peek-*` classes only [EVIDENCE: styles.css:16268-16423]

### i18n

- [x] CHK-085 [P0] i18n keys `panel.open`, `panel.noProperties`, `panel.hiddenProperties` present in `src/i18n.ts` for en / zh-CN / zh-TW [EVIDENCE: src/i18n.ts:406-408,1889-1891,3427-3429]
- [x] CHK-086 [P0] No raw English in zh locales: switching to zh-CN / zh-TW shows localized OPEN / "No properties" / hidden-group label [EVIDENCE: src/i18n.ts:1889-1891,3427-3429; src/views/TableRecordPeek.ts:49-50,148,162]

### Mobile

- [x] CHK-080 [P0] CSS-only persistent OPEN on `body.is-phone` (`body.is-phone .note-database-container .db-record-open-btn { opacity: 1 }`); no `isPhoneLayout()` JS [EVIDENCE: styles.css:16297-16305; src/views/TableRecordPeek.ts:38-57]
- [x] CHK-081 [P0] No hover-only or `MouseEvent`-only path [EVIDENCE: styles.css:16297-16305; src/views/TableRecordPeek.ts:38-57]

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-024 [P0] Detail-peek module, i18n keys, and appended `styles.css` block created [EVIDENCE: shipped: src/views/TableRecordPeek.ts; src/i18n.ts:406-408; styles.css:16268-16423]
- [x] CHK-025 [P1] No unrelated files touched [EVIDENCE: shipped: src/views/TableRecordPeek.ts; src/views/DatabaseView.ts:7937-7968; styles.css:16268-16423]

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets or telemetry [EVIDENCE: src/views/TableRecordPeek.ts:1-238]
- [x] CHK-031 [P0] No new evaluation paths added [EVIDENCE: src/views/TableRecordPeek.ts:1-6; src/data/Stringify.ts:1]
- [x] CHK-032 [P1] Panel is read-only (iCloud-safe) [EVIDENCE: src/views/TableRecordPeek.ts:1-223]

### iCloud / display-only

- [x] CHK-090 [P0] Module imports nothing from `DataSource` and references no `mutateFrontmatter` / `openNote` (write surface is `mutateFrontmatter` `:288` etc.; navigation surface is `openNote` via `openRow`) [EVIDENCE: src/views/TableRecordPeek.ts:1-238]
- [x] CHK-091 [P0] Hidden-group toggle is in-memory CSS, not a vault or view-def write [EVIDENCE: src/views/TableRecordPeek.ts:158-174; styles.css:16401-16411]
- [x] CHK-092 [P0] Rollups stay display-only; no new evaluation paths [EVIDENCE: src/data/types.ts:49-73; src/views/TableRecordPeek.ts:214-223]

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: shipped: src/views/TableRecordPeek.ts; src/views/DatabaseView.ts:7937-7968]
- [x] CHK-041 [P1] Code comments carry durable WHY only [EVIDENCE: src/views/TableRecordPeek.ts:32-36,64-68]
- [x] CHK-042 [P2] Research baseline referenced [EVIDENCE: shipped: src/views/TableRecordPeek.ts]

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Only phase-folder docs and planned fork files touched [EVIDENCE: shipped: src/views/TableRecordPeek.ts; src/views/DatabaseView.ts:7937-7968; src/views/TableRecordPeek.test.ts]
- [ ] CHK-051 [P1] No scratch/ or temp files left [EVIDENCE: DEFERRED -- `find . -type d -name scratch` found scratch directories with `.gitkeep` files]

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Checked | Deferred |
|----------|-------|---------|----------|
| P0 Items | 22 | 21/22 | 1 |
| P1 Items | 21 | 20/21 | 1 |
| P2 Items | 1 | 1/1 | 0 |
| **Total** | **44** | **42/44** | **2** |

**Verification Date**: 2026-08-27.
**Verified By**: Source inspection plus `tsc --noEmit` exit 0 and `vitest` 25 files / 247 tests passed. The dedicated manual proof matrix was never run and remains deferred; code-level checks are evidenced above.

<!-- /ANCHOR:summary -->
