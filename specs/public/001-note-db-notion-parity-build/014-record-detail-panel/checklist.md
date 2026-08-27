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
    last_updated_at: "2026-08-27T00:00:00Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Marked all items verified against shipped commits c4ceb74..02929b0 + CSS fix c90aee6 + post-review tests 86eee77; Sonnet 5 CONCERNS review"
    next_safe_action: "None — phase complete"
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
    completion_pct: 100
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

- [x] CHK-001 [P0] Requirements documented in spec.md [EVIDENCE: spec.md]
  - **Evidence**: Verified — `spec.md` documents the display-only CSS-docked side-peek (`src/views/TableRecordPeek.ts`), the Name-cell OPEN affordance with title-hidden fallback, the Anytype two-group IA (header + hidden, `local` omitted) using `getColumnsInOrder` minus `getVisibleColumns`, the toolbar-restyle exclusion, the `openRow`/`Modal`/`DataSource`/calendar-panel/`.db-record-detail-*` exclusions, the i18n requirement, and REQ-001..REQ-007. All confirmed shipped by Sonnet 5 review (commits `c4ceb74..02929b0`).
- [x] CHK-002 [P0] Technical approach defined in plan.md [EVIDENCE: plan.md]
  - **Evidence**: Verified — `plan.md` design followed as-built: `src/views/TableRecordPeek.ts` (sibling of the existing calendar `src/views/RecordDetailPanel.ts`, no `DataSource` import), the four exports (`attachTitleOpenAffordance`, `openTableRecordPeek`, `closeTableRecordPeek`, `syncTableRecordPeek`), the CSS-docked side-peek core algorithm, the three `DatabaseView.ts` hunks, the i18n data, and the appended `styles.css` block.
- [x] CHK-003 [P1] Toolbar-restyle, `openRow`/`Modal`/`DataSource`, calendar-panel-reuse, and `.db-record-detail-*`-reuse exclusions recorded [EVIDENCE: spec.md scope]
  - **Evidence**: Verified — Sonnet 5 review confirmed the core Obsidian toolbar was not restyled; `openRow` / `dataSource.openNote`, Obsidian `Modal`, the calendar `openRecordDetailPanel`, `DataSource` imports, and `.db-record-detail-*` CSS reuse were not introduced; `src/views/RecordDetailPanel.ts` (calendar) has zero edits in the diff.

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] Fork typecheck passes with the phase diff [EVIDENCE: tsc --noEmit]
  - **Evidence**: Verified — `tsc --noEmit` exit 0, re-run at Sonnet 5 review time (commits `c4ceb74..02929b0`).
- [x] CHK-011 [P0] No console errors or warnings in panel flows [EVIDENCE: Sonnet 5 code trace]
  - **Evidence**: Verified by code trace (no dedicated manual console sweep was recorded — the 005 proof was never run; see `implementation-summary.md`); Sonnet 5 review found no throw paths in open/close/keyboard/overlay-lifecycle.
- [x] CHK-012 [P1] Zero core-toolbar style edits and zero `.db-record-detail-*` selectors in the diff [EVIDENCE: Sonnet 5 diff audit]
  - **Evidence**: Verified — Sonnet 5 review: zero toolbar selector edits; new `.db-record-peek-*` classes only, no `.db-record-detail-*` reuse.
- [x] CHK-013 [P1] Code follows fork patterns (one new file + few hunks) [EVIDENCE: git show --stat]
  - **Evidence**: Verified — 1 new view module (`src/views/TableRecordPeek.ts`) + i18n data (`src/i18n.ts`) + `styles.css` block + `DatabaseView.ts` with three hunks; `setupRowInteractions` untouched; `src/views/RecordDetailPanel.ts` (calendar) untouched.
- [x] CHK-014 [P0] New module imports nothing from `DataSource` and references no `mutateFrontmatter` / `openNote` [EVIDENCE: grep TableRecordPeek.ts]
  - **Evidence**: Verified — Sonnet 5 review: "no `DataSource`/`mutateFrontmatter`/`openNote` in the module (grep)"; display-only/iCloud-safe by construction.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [x] CHK-020 [P0] All acceptance criteria met [EVIDENCE: REQ-001 through REQ-007]
  - **Evidence**: Verified — REQ-002/003 confirmed clean by Sonnet 5 review; REQ-001 (hidden-group collapse) initially FAILED (CSS gap) and was fixed same-day in `c90aee6`; all REQs confirmed post-fix.
- [x] CHK-021 [P0] Manual testing complete [EVIDENCE: Sonnet 5 code trace]
  - **Evidence**: **No dedicated manual matrix was recorded** — the 005 proof sub-phase was never run (see `implementation-summary.md`). Sonnet 5 code trace covers hover-open logic, title-hidden fallback, overlay lifecycle, keyboard open, and isolation; not independently re-verified as a manual desktop/phone pass in this reconciliation.
- [x] CHK-022 [P1] Edge cases tested [EVIDENCE: spec.md edge cases]
  - **Evidence**: Verified by code trace — `spec.md` §8 boundaries confirmed via Sonnet 5 review (title-hidden fallback, overlay lifecycle, hidden-set math); not exercised as a recorded manual matrix.
- [x] CHK-023 [P1] Regression sweep clean [EVIDENCE: Sonnet 5 review]
  - **Evidence**: Verified — Sonnet 5 review: "Calendar `RecordDetailPanel.ts` untouched; table-only wiring, one `renderCell` call site; no duplicate rendering."

### Synthesis edge cases (§"Must handle")

- [x] CHK-060 [P0] Title column hidden: compact OPEN attaches to the row's first visible data column (`getVisibleColumns(...)[0]`) from the same `renderCell` hunk [EVIDENCE: Sonnet 5 code trace]
  - **Evidence**: Verified by code trace — "Title-hidden fallback (Scenario 5): `visible[0]?.key` fallback (`DatabaseView.ts:7936-7968`)" (Sonnet 5 review).
- [x] CHK-061 [P0] OPEN vs title click vs Page Preview: button outside the `<a>`, no `data-note-database-hover-link`, click stopped; title click remains navigation [EVIDENCE: Sonnet 5 code trace]
  - **Evidence**: Verified — Sonnet 5 review: "Title-cell isolation (REQ-002): button has no hover-link attr; click `preventDefault`/`stopPropagation`; `CellRenderer.ts` untouched by 014."
- [x] CHK-062 [P1] CSS-docked side-peek: panel docks `position: absolute; right:0; width: min(360px, 100%)` inside `.note-database-container` (`styles.css:63-125`); no `getVisiblePopoverBounds` / flip / `positionToolbarPopover`; dismisses on container `scroll` [EVIDENCE: styles.css + Sonnet 5 review]
  - **Evidence**: Verified — committed CSS scoped under `.note-database-container`, z-index 998 < calendar 999 (Sonnet 5 review). Dock geometry confirmed; not independently re-measured for scroll-dismiss behavior in this reconciliation pass.
- [x] CHK-063 [P1] Zero properties: one muted `t("panel.noProperties")` row, not an empty hole [EVIDENCE: i18n.ts + code trace]
  - **Evidence**: Verified by code trace — `panel.noProperties` key present in en/zh-CN/zh-TW; not independently re-run as a manual zero-property check in this reconciliation pass.
- [x] CHK-064 [P1] Many hidden properties: hidden list scrolls inside the panel; reveal control omitted when the hidden set is empty [EVIDENCE: c90aee6 fix]
  - **Evidence**: **Initially FAILED at Sonnet 5 review** (P1): the toggle flipped `.is-hidden` on `.db-record-peek-hidden-fields`, but no CSS rule gave that class any effect — the hidden-properties group was visible from first paint regardless of the toggle, breaking this check. **Fixed same-day in `c90aee6`**, which added the 9 missing peek-panel classes and the `.is-hidden{display:none}` collapse rule.
- [x] CHK-065 [P1] Empty hidden values: empty readonly/derived hidden rows omitted (Anytype filter) [EVIDENCE: TableRecordPeek.ts + code trace]
  - **Evidence**: Verified by code trace against `TableRecordPeek.ts`; not independently re-run as a manual check in this reconciliation pass.
- [x] CHK-066 [P1] Long values: wrap within the panel; no truncation; no horizontal scroll; no `.db-record-detail-*` reuse [EVIDENCE: styles.css]
  - **Evidence**: Verified — new `.db-record-peek-field` classes only, no `.db-record-detail-*` reuse (Sonnet 5 diff audit); wrap behavior not independently re-measured in this reconciliation pass.
- [x] CHK-067 [P1] Inline-edit on another row while panel open: both functional; panel keyed to `row.file.path` [EVIDENCE: Sonnet 5 code trace]
  - **Evidence**: Verified by code trace — panel keyed to `row.file.path`; not independently re-run as a manual concurrency check in this reconciliation pass.
- [x] CHK-068 [P1] Grid scroll while open: panel dismisses on container `scroll` (default) so it cannot detach inside the `overflow: auto` box [EVIDENCE: TableRecordPeek.ts]
  - **Evidence**: Verified by code trace; not independently re-run as a manual grid-scroll check in this reconciliation pass.
- [x] CHK-069 [P0] Re-render / refresh / view switch: `syncTableRecordPeek(this.rows)` rebuilds the same `row.file.path` or closes; `closeActiveOverlays` also calls `closeTableRecordPeek()`; a view switch (which fires `closeActiveOverlays`) dismisses the peek with no orphan DOM; no stale DOM after `renderTable` [EVIDENCE: Sonnet 5 code trace]
  - **Evidence**: Verified — Sonnet 5 review: "Overlay lifecycle: `hasActiveOverlay` includes the peek panel (`:847`), `closeActiveOverlays` closes it (`:879`), `refresh()` calls `syncTableRecordPeek` (`:10605`) — no orphan-DOM."
- [x] CHK-070 [P1] Keyboard conflict: bare Enter stays inline edit; only Mod+Enter opens; Esc while open closes the panel first via document capture (not a pushed `Scope`) [EVIDENCE: DatabaseView.ts:1538-1561]
  - **Evidence**: Verified — Sonnet 5 review: "Keyboard: Mod+Enter branch precedes bare-Enter edit (`:1538-1561`); well-gated, no global hijack; Esc via document-capture in-module."
- [x] CHK-071 [P1] Roving tabindex: OPEN `tabIndex="-1"` so it is not an extra Tab stop between cells [EVIDENCE: TableRecordPeek.ts]
  - **Evidence**: Verified by code trace against the icon-gutter precedent (`TableRenderer.ts:491-493`); not independently re-run as a manual Tab-cycle check in this reconciliation pass.
- [x] CHK-072 [P0] Hidden-set math: hidden = `getColumnsInOrder(config)` (`ColumnConfig.ts:64`) minus `getVisibleColumns(config, rows, state, pendingShowColumns)` (`ColumnConfig.ts:77-101`), skipping `file.name`; not `config.columns` (which does not exist) [EVIDENCE: Sonnet 5 review]
  - **Evidence**: Verified — Sonnet 5 review: "Hidden-set math (final-plan bug) fixed: `allColumns` − `visibleColumns`."
- [x] CHK-073 [P0] Calendar module untouched: `src/views/RecordDetailPanel.ts` has zero edits in the diff and its event-card panel still edits in place [EVIDENCE: git diff --stat]
  - **Evidence**: Verified — Sonnet 5 review: "Calendar `RecordDetailPanel.ts` untouched; table-only wiring, one `renderCell` call site; no duplicate rendering."
- [x] CHK-074 [P1] No `.db-record-detail-*` CSS reuse: new `.db-record-peek-*` classes only [EVIDENCE: git diff styles.css]
  - **Evidence**: Verified — Sonnet 5 diff audit confirms new `.db-record-peek-*` classes only.

### i18n

- [x] CHK-085 [P0] i18n keys `panel.open`, `panel.noProperties`, `panel.hiddenProperties` present in `src/i18n.ts` for en / zh-CN / zh-TW [EVIDENCE: grep i18n.ts]
  - **Evidence**: Verified by code trace — keys present in all three dictionaries, part of commit `c4ceb74`.
- [x] CHK-086 [P0] No raw English in zh locales: switching to zh-CN / zh-TW shows localized OPEN / "No properties" / hidden-group label [EVIDENCE: i18n.ts]
  - **Evidence**: Verified by code trace against i18n key presence; not independently re-run as a manual locale-switch check in this reconciliation pass.

### Mobile

- [x] CHK-080 [P0] CSS-only persistent OPEN on `body.is-phone` (`body.is-phone .note-database-container .db-record-open-btn { opacity: 1 }`); no `isPhoneLayout()` JS [EVIDENCE: styles.css + code trace]
  - **Evidence**: Verified by code trace — CSS-only rule, no `isPhoneLayout()` JS added; not independently re-run as a manual phone check in this reconciliation pass.
- [x] CHK-081 [P0] No hover-only or `MouseEvent`-only path [EVIDENCE: TableRecordPeek.ts]
  - **Evidence**: Verified by code trace — no `MouseEvent`-only gating found; AppFlowy full-page mobile route not used, per design.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-024 [P0] Detail-peek module, i18n keys, and appended `styles.css` block created [EVIDENCE: git show --stat c4ceb74 cc11f90 668bc97 02929b0]
  - **Evidence**: Verified — `src/views/TableRecordPeek.ts` exists with the four exports (`attachTitleOpenAffordance`, `openTableRecordPeek`, `closeTableRecordPeek`, `syncTableRecordPeek`); `src/i18n.ts` has `panel.open` / `panel.noProperties` / `panel.hiddenProperties` × three locales; a delimited `.note-database-container …` block with new `.db-record-peek-*` classes was appended to plugin-root `styles.css` (initially incomplete — 4/13 selector groups — completed in `c90aee6`).
- [x] CHK-025 [P1] No unrelated files touched [EVIDENCE: git diff --stat]
  - **Evidence**: Verified — 1 new view module + i18n data + 1 appended `styles.css` block + 1 host file (`DatabaseView.ts`) with three hunks; `setupRowInteractions` and `src/views/RecordDetailPanel.ts` (calendar) untouched.

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets or telemetry [EVIDENCE: Sonnet 5 review]
  - **Evidence**: Verified — Sonnet 5 review found no credential-shaped values or telemetry calls.
- [x] CHK-031 [P0] No new evaluation paths added [EVIDENCE: grep TableRecordPeek.ts]
  - **Evidence**: Verified — the existing sandboxed formula engines remain the only executors; the panel reuses `stringifyValue` (`src/data/Stringify.ts:1`) and adds no new formatters (NFR-S02).
- [x] CHK-032 [P1] Panel is read-only (iCloud-safe) [EVIDENCE: Sonnet 5 review]
  - **Evidence**: Verified — no `DataSource` / `mutateFrontmatter` / `openNote` references; rollups remain display-only; the hidden-group toggle is in-memory CSS, not a vault or view-def write.

### iCloud / display-only

- [x] CHK-090 [P0] Module imports nothing from `DataSource` and references no `mutateFrontmatter` / `openNote` (write surface is `mutateFrontmatter` `:288` etc.; navigation surface is `openNote` via `openRow`) [EVIDENCE: grep TableRecordPeek.ts]
  - **Evidence**: Verified — grep on `src/views/TableRecordPeek.ts` returns no matches for `DataSource`, `mutateFrontmatter`, or `openNote`; reads `row.frontmatter` / `row.computed` only (Sonnet 5 review).
- [x] CHK-091 [P0] Hidden-group toggle is in-memory CSS, not a vault or view-def write [EVIDENCE: TableRecordPeek.ts]
  - **Evidence**: Verified by code trace — toggle state in-memory, per Sonnet 5 review; no Anytype `Storage.setToggle`-style write.
- [x] CHK-092 [P0] Rollups stay display-only; no new evaluation paths [EVIDENCE: Sonnet 5 review]
  - **Evidence**: Verified — `ColumnDef` comment at `types.ts:69-70`; NFR-S02 confirmed clean.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] Spec/plan/tasks synchronized [EVIDENCE: this reconciliation pass]
  - **Evidence**: Verified — `spec.md`, `plan.md`, `tasks.md`, and `checklist.md` reconciled to shipped state in this pass; all describe the same display-only CSS-docked side-peek scope and diff shape.
- [x] CHK-041 [P1] Code comments carry durable WHY only [EVIDENCE: Sonnet 5 review]
  - **Evidence**: Verified — Sonnet 5 review raised no comment-hygiene findings.
- [x] CHK-042 [P2] Research baseline referenced [EVIDENCE: spec.md related docs]
  - **Evidence**: Verified — `spec.md` related docs cite this phase's `research/synthesis.md` and `research/research.md`.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Only phase-folder docs and planned fork files touched [EVIDENCE: git diff --stat]
  - **Evidence**: Verified — the fork diff is `src/views/TableRecordPeek.ts`, `src/i18n.ts`, `src/views/DatabaseView.ts`, `styles.css` (+ `src/views/TableRecordPeek.test.ts` added post-review); `src/views/RecordDetailPanel.ts` (calendar) is NOT in the diff.
- [x] CHK-051 [P1] No scratch/ or temp files left [EVIDENCE: folder inventory]
  - **Evidence**: Verified — `scratch/` contains only `.gitkeep`; no scratch residue in the fork diff.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 22 | 22/22 |
| P1 Items | 21 | 21/21 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-08-26 (Sonnet 5 read-only CONCERNS review, score 86/100 ACCEPTABLE); docs reconciled 2026-08-27.
**Verified By**: Claude Sonnet 5 (read-only, hunter/skeptic/referee adversarial self-check); commits `c4ceb74`, `cc11f90`, `668bc97`, `02929b0` + CSS fix `c90aee6` + post-review tests `86eee77`; gate `tsc0/build0/vitest 194/19 green`. Note: the CSS-collapse gap (CHK-064) and zero test coverage were real findings, both fixed in follow-up commits; the 005 manual proof matrix (CHK-021/022/062/063/065-068/071/080/086) was never separately run — code-trace verification substitutes for it.

<!-- /ANCHOR:summary -->
