---
title: "Implementation Plan: Card Title and Title Formats"
description: "Route the shared title resolver through the chosen column's own formatter, and give the board's Title fixed slot a way to open the existing picker."
trigger_phrases:
  - "implementation plan"
  - "058 plan"
  - "title field formatting plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Card Title and Title Formats

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin runtime |
| **Framework** | None (direct DOM renderers) |
| **Storage** | Vault frontmatter, via `RowData`/`ViewConfig` |
| **Testing** | Vitest, plus `tools/live/*` browser-driven lane checks |

### Overview
`resolveTitleFieldDisplay` is the one function every title-drawing surface calls. Its non-file
branch is widened to look up the chosen column's `type`/`numberDisplayStyle` and call the same
formatter the cell renderer already calls for that column, instead of `stringifyValue()`. Separately,
`board-card-properties-panel.ts`'s Title fixed slot gains a click handler that opens the existing
`titleField` picker in `view-config-panel-renderer.ts`, closing the discoverability gap that produced
the operator's report.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented (`spec.md`)
- [x] Success criteria measurable (`spec.md` §5)
- [x] Dependencies identified (`045`, `054`, `056` all read the shared resolver; none is edited)

### Definition of Done
- [ ] All acceptance criteria in `acceptance-criteria.md` are `Met`, `Waived` or `Superseded`
- [ ] `npx tsc --noEmit`, `npm run build`, `npx vitest run` all exit 0
- [ ] `npm run screenshots:verify` exits 0 with the new currency-titled scenario opened and read
- [ ] Docs (spec/plan/tasks/goal/acceptance-criteria/decision-record) agree
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Single shared resolver, read by three renderers (board card, record header, calendar/timeline
title path unaffected). No new component; an existing function's branch is widened.

### Key Components
- **`resolveTitleFieldDisplay`** (`src/data/title-field-display.ts`): the one place a title's
  display text is computed. Gains a lookup of the chosen column's `ColumnDef` and a call to its
  typed formatter for the `number`/`currency`/`date` cases, mirroring the cell renderer's own
  `switch (displayType)` branches (`cell-renderer.ts:301-325`) rather than reimplementing them.
- **`board-card-properties-panel.ts`'s Title row**: gains a click handler that opens the same
  picker `view-config-panel-renderer.ts:1902-1920` already builds, rather than a second picker.

### Data Flow
`RowData` + `ViewConfig.titleField` → `resolveTitleFieldDisplay` (looks up the column, resolves its
raw value, now also its type/format) → `TitleFieldDisplay.text` → consumed unchanged by
`board-renderer.ts`, `record-detail-panel.ts`, and left alone for calendar/timeline's own
`calendarTitleField`/`timelineTitleField` path.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|---------------|
| `title-field-display.ts` (`resolveTitleFieldDisplay`) | Computes title text via `stringifyValue()` | Update — route number/currency/date through the column's own formatter; 2026-09-07: also route the file-title branch through a new `titleFormat` | New unit test, red before green |
| `board-renderer.ts` (title consumers) | Reads `TitleFieldDisplay.text` | **This premise was wrong, corrected 2026-09-07 rather than left standing.** `getReferenceRowTitle` special-cased `title.isFileTitle` to read `row.file.basename` directly instead of `title.text` — harmless while the two were always identical (the case this plan was written against), silently wrong the instant `titleFormat` made them diverge. Found only by driving the production renderer, not by `grep`/`git diff --name-only`, which is exactly what a consumer bug with no source-level signature looks like. Fixed: reads `title.text` unconditionally (ADR-006) | Live harness scenario mounting the real `BoardRenderer`, red against the reverted file, green restored |
| `record-detail-panel.ts` (title consumers) | Reads the same `TitleFieldDisplay.text` via `getRecordEventTitleField` | Unchanged — confirmed still true 2026-09-07: it already read `title.text` unconditionally, so it never had `board-renderer.ts`'s defect | grep confirms no edit |
| `board-card-properties-panel.ts` | Title row is a read-only fixed slot | Update — add a jump-to-picker click handler | New test asserting the handler exists and the Cover row's negative control still has none |
| `data-source.ts` (2026-09-07, `titleFormat`'s save/load round trip) | `titleField` is read/written at four sites (`parseDatabaseConfig`'s current and legacy-flat branches, `parseViewConfig`, `toViewPayload`); `titleFormat` existed at none of them | Update — one `parseTitleFormat` helper wired into all four sites | New round-trip test in `data-source.test.ts`, red before green, covering both formats plus an unrecognized value |

Required inventories:
- Same-class producers: `rg -n "stringifyValue" src/data src/views` — confirms which other call
  sites of the raw stringifier exist and that none of them is a second title-formatting surface.
- Consumers of changed symbols: `rg -n "resolveTitleFieldDisplay|TitleFieldDisplay" src` — every
  reader is named in this plan; none outside `board-renderer.ts`, `record-detail-panel.ts`,
  `calendar-timeline-model.ts` and `data-source.ts` (search-result title) as of this writing.
- Matrix axes: title-column type (`text`/`number`/`currency`/`date`/`file.*`) × surface
  (board card / record header desktop / record header phone) — 5 × 3 = 15 rows, most already
  covered by `text` and `file.*` behaving identically to today.
- Algorithm invariant: the resolver's output for a `text`-typed or `file.*` title is byte-identical
  to today's output — only `number`/`currency`/`date` branches change.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase
checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `resolveTitleFieldDisplay`'s number/currency/date branches; the byte-identical `text`/`file.*` branches | Vitest |
| Integration | Board card, desktop record header and phone record sheet agree on the same formatted title | Vitest against a constructed `RowData`/`ViewConfig` fixture |
| Manual/lane | A currency-titled card capture, both themes | `tools/screenshots`, `npm run gate` |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `045-board-card-properties` | Internal | Shipped 0.0.22 | None — this packet reads, not edits, the Properties sheet the Title row lives in |
| `054-record-and-relation-surfaces` | Internal | Implementation pending | None — this packet's resolver change reaches the record header without editing `054`'s files |
| `047`'s Notion Mobbin harvest | Internal | Queued, not landed | ADR-002 stays designed-from-code rather than designed-from-capture until it lands |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the formatted title regresses a surface that read `stringifyValue()` output as plain
  text somewhere this plan did not anticipate.
- **Procedure**: revert the `title-field-display.ts` and `board-card-properties-panel.ts` commits;
  both are additive branches inside one function and one row handler, so the revert is a single
  `git revert` with no data migration to undo.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
T001 (read the mechanism, done) ──► T002 (measure the red) ──► T003 (resolver format routing)
                                                              ──► T004 (Title-slot affordance)
T003, T004 ──► T005 (regression test) ──► T006 (screenshot scenario) ──► T007 (gate/replay)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| T002 | T001 | T003, T004 |
| T003 | T002 | T005 |
| T004 | T002 | T005 |
| T005 | T003, T004 | T006 |
| T006 | T005 | T007 |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup (T001-T002) | Low | Done / 1 hour |
| Core Implementation (T003-T004) | Low-Med | 2-4 hours |
| Verification (T005-T007) | Low | 2-3 hours |
| **Total** | | **~6-8 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] No data migration — this change is presentation-only, the stored `titleField` value is untouched
- [ ] No feature flag — the fix corrects a shared resolver's output; there is no partial-rollout shape
- [ ] No monitoring change needed

### Rollback Procedure
1. `git revert` the resolver and Title-slot commits.
2. Re-run `npm run gate` to confirm the reverted tree is green.
3. No stakeholder notice needed — a presentation-only revert with no stored-data effect.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A.
<!-- /ANCHOR:enhanced-rollback -->

---
