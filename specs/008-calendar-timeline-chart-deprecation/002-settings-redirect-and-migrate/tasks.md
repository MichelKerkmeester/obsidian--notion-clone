---
title: "Tasks: Phase 2: settings-redirect-and-migrate"
description: "Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "task breakdown"
  - "implementation tasks"
  - "verification checklist"
  - "task dependencies"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Phase 2: settings-redirect-and-migrate

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 Read `001`'s inventory §1.2/§5/§6 (redirect targets, migration charter, archive plan) and the parent goal's D1-D4; confirmed REQ set against them
- [x] T002 [P] Read 007-002's `decision-record.md` ADR-001/ADR-002 and `gallery-migration.ts`/`list-migration.ts` as the shipped mechanism to mirror
- [x] T003 Read `types.ts`'s calendar/timeline/board/table `ViewConfig` fields to decide what each migration carries: `calendarStartDateField`→table `sortColumn`, `timelineGroupField`→board `boardGroupField`; chart carries nothing (all fields are declared losses)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 Wrote `src/views/calendar-timeline-chart-hide-and-migrate.test.ts` against the pre-edit tree and ran it first: 12 failed / 3 passed (the 3 passes were the "renderers stay" negatives, already true). Mirrors `gallery-hide-and-migrate.test.ts`/`list-hide-and-migrate.test.ts`'s source-pin shape
- [x] T005 Created `src/data/chart-migration.ts` and `src/data/calendar-migration.ts` — plain type-string rewrites to `table`, mirroring `list-migration.ts`'s shape (target equals the unknown-type fallback). Calendar additionally carries `calendarStartDateField` onto the table's own `sortColumn`, an existing `sortColumn` winning over it
- [x] T006 Created `src/data/timeline-migration.ts` — carries `timelineGroupField` onto `boardGroupField` mirroring `gallery-migration.ts`'s `imageField`→`boardImageField` carry (an existing `boardGroupField` wins); `timelineTitleField`/`timelineColorField` have no board equivalent and stay on the view, undeleted, matching `galleryCardSize`'s precedent
- [x] T007 [P] Withdrew chart/calendar/timeline from the two view-type pickers' filter predicates (`toolbar-renderer.ts`'s `getViewTypeOptions`, `view-config-panel-renderer.ts`'s `renderViewType`), each keeping its own current-type escape hatch beside gallery's and list's
- [x] T008 Removed chart/calendar/timeline from `settings.ts`'s `DEFAULT_VIEW_TYPES` (was `["table","board","chart","calendar","timeline"]`, now `["table","board"]`)
- [x] T009 `main.ts`'s settings-load sanitizer (both sites: the legacy `views[]`→`databases[]` migration and the per-load `databases[]` sanitize pass): gallery and timeline now route through their real migration in place; chart's `!== "chart"` exemption is deleted outright (closes for free, its target already equals the bare fallback — calendar was never exempted and needed no change)
- [x] T010 Added `migrateChartViewOnOpen`/`migrateCalendarViewOnOpen`/`migrateTimelineViewOnOpen` to both `database-view.ts` (wired into `refresh()`'s head) and `embedded-database-renderer.ts` (wired into `render()`'s head), beside the existing gallery/list calls. Chart and calendar use a plain `Notice`, matching list's shape (target equals the fallback); timeline uses an undo-carrying toast, matching gallery's shape (target differs from the fallback)
- [x] T011 Added `chartMigrationNotices`/`calendarMigrationNotices`/`timelineMigrationNotices` to `PluginSettings` (`types.ts`) and `notice.chartMigrated`/`notice.calendarMigrated`/`notice.timelineMigrated`/`undo.timelineMigration` to `i18n.ts` in all three shipped locales (en, zh-CN, zh-TW)
- [x] T012 Recorded the fallback-rule ADR in `decision-record.md`
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T013 Green: full suite 1707/1707 passing (`npx vitest run`), up from the 1702 baseline before this phase's test files existed. Mutation check: dropped the toolbar's chart filter clause, re-ran `calendar-timeline-chart-hide-and-migrate.test.ts` (2 failures, as expected), restored, back to 15/15
- [x] T014 Fixed two pre-existing suites this phase's edits legitimately invalidated: `gallery-hide-and-migrate.test.ts` (its sanitizer-line pin assumed chart's `!== "chart"` fragment would still exist) and `settings.test.ts` (`DEFAULT_VIEW_TYPES`/default-view dropdown options, now `["table","board"]`); added a new "keeps chart, calendar and timeline out" case matching the existing gallery/list ones
- [x] T015 Fixed three pre-existing `tools/storybook/verify-placement.mjs` floors invalidated by three more picker rows leaving the add-view menu: the row-grammar count floor (6→3, `docs said it already steps down for each legitimate withdrawal`), the distinct-type-row floor (`>2`→`>1`, since only 2 type rows remain), and the owned bare-`Notice`-census ceiling (239→243, the four new owned `new Notice(` sites in the chart/calendar migrations)
- [x] T016 Comment hygiene: caught and rewrote two `0NN's`-shaped packet-number labels introduced mid-work via `node tools/naming/scan-comments.mjs` (0 violations after)
- [x] T017 Verification battery: `npx tsc --noEmit` 0; `npx vitest run` 1707/1707; `npm run build` 0; `node tools/live/render-assertions.mjs` 0; `node tools/live/sheet-grammar.mjs` 0; `node tools/storybook/verify-placement.mjs` 0 (413/415, 2 declared-reason reds); `node tools/naming/scan-comments.mjs` / `scan-failing-values.mjs` 0
- [x] T018 `npm run screenshots` twice (616 captures each, exit 0). Ten movers judged jitter by decoded pixel delta (`pixel-hash.mjs`): every one's `pixelHash`/`layoutHash` was byte-identical to the last commit's manifest entry (stronger than the ≤12-max-channel-delta bar), so each was `git checkout --`'d back and its manifest entry patched to the committed bytes. Four movers (`constructed-toolbar-add-view-{desktop,mobile}-{dark,light}.png`) are the real, deterministic content change from the picker withdrawal (identical `pixelHash` across both runs, different from the committed baseline) and are named in `tools/lane/css-lane.json`'s current release's `reviewed` array — `styles.css` itself never moved, so no new acquire/edit/release triplet was needed, only the review-debt append the lane's own check enforces regardless of who is holding it
- [x] T019 `node tools/live/evidence.mjs --check-all` 15/15 fresh after re-running the two stale lanes (`sheet-rebuild.mjs` for the picker source-hash bump, `capture-device-parity.mjs` for the manifest bump)
- [x] T020 `npm run gate` (foreground, `</dev/null`, exit read from `$?` without a pipe): 27 green / 0 red
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]`
- [x] No `[B]` blocked tasks remaining
- [x] Every acceptance criterion in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded` — AC-007 (a released version) discharged 2026-09-09: 0.0.34 shipped the redirect at `e75a979c` before 003's removal landed; recorded by the 008/004 docs leg
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Predecessor**: See `../001-usage-and-migration-audit/`
- **Mechanism precedent**: See `../../007-gallery-view-deprecation/002-settings-redirect-and-migrate/`
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

Read exit codes without a pipe — `cmd >/tmp/out.log 2>&1; echo $?`. A pipe makes `$?` the pipe's
status.
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Requirements documented in spec.md, drawn from `001`'s audit
- [x] CHK-002 [P0] Technical approach mirrors 007-002's shipped mechanism (plan/apply modules, sanitizer routing, on-open hooks in both hosts)
- [x] CHK-003 [P1] `001`'s declared-loss list read before writing any migration, so each carries exactly what the audit named and nothing it didn't
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` clean (exit 0)
- [x] CHK-011 [P0] No console errors on the normal migration path — the only `console.error` calls added are inside the existing `catch` rollback branches, firing only on a thrown write
- [x] CHK-012 [P1] All three migrations stay pure: they take a view and a plan, no `App`/vault/DOM access
- [x] CHK-013 [P1] Comment hygiene: no spec paths, packet numbers or artifact ids in any new/edited code comment (`scan-comments.mjs` 0 violations)
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] AC-001 through AC-007 `Met` — AC-007 discharged 2026-09-09 (0.0.34 = `e75a979c` carries the redirect; recorded by the 008/004 docs leg)
- [x] CHK-021 [P0] Every closed surface observed RED before green: `calendar-timeline-chart-hide-and-migrate.test.ts` ran against the pre-edit source first (12/15 failing), then green after the edit (15/15)
- [x] CHK-022 [P1] Migrate-twice-is-a-no-op asserted at the pure-function level for all three migrations (`refuses to apply a second time` cases); the on-open persisted-notice guard mirrors gallery/list's already-tested shape in both hosts
- [x] CHK-023 [P1] A view with no field to carry (no `calendarStartDateField`/`timelineGroupField`) migrates without error — asserted directly in each unit suite
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Each surface classed: chart/calendar close for free at the sanitizer (target equals fallback); timeline routes through the real migration (target differs); the embedded host gains the call for all three (mirrors 007 ADR-001)
- [x] CHK-FIX-002 [P0] Same-class producer inventory: `001`'s minting/accepting surface list confirmed current against the tree during implementation
- [x] CHK-FIX-003 [P0] Consumer inventory for `plan*Migration`/`apply*Migration`: `main.ts` (new, timeline+gallery only), `database-view.ts` (new, all three), `embedded-database-renderer.ts` (new, all three) — `rg -n "planChartMigration|planCalendarMigration|planTimelineMigration" src` confirms all three call sites per module
- [x] CHK-FIX-004 [P0] Not applicable — no security/path/parser/redaction surface touched
- [x] CHK-FIX-005 [P1] Matrix axes: type (chart, calendar, timeline) × host (standalone, embedded) × entry (settings-load sanitizer, frontmatter on-open) — all cells covered across the unit suites and the wiring suite
- [ ] CHK-FIX-006 [P1] Not applicable — no process-wide state is read
- [x] CHK-FIX-007 [P1] Evidence pinned to this dispatch's own commits in this worktree, not to a moving branch range
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets
- [x] CHK-031 [P0] No new input-validation surface (frontmatter parsing unchanged; `parseViewType()` stays open on purpose)
- [x] CHK-032 [P1] Not applicable — no auth/authz surface
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] spec.md/plan.md/tasks.md/acceptance-criteria.md/decision-record.md/implementation-summary.md synchronized
- [x] CHK-041 [P1] Code comments explain the durable why (target-vs-fallback reasoning, what carries and why), never an artifact id
- [x] CHK-042 [P2] Not applicable — no README-facing surface in this phase (phase 4 strips the README mentions)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] No temp files left outside `/tmp`
- [x] CHK-051 [P1] No scratch artifacts committed
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 9 | 9/9 |
| P1 Items | 13 | 12/13 (1 not applicable) |
| P2 Items | 2 | 2/2 |

**Verification Date**: 2026-09-08
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [x] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [x] CHK-101 [P1] The ADR carries a status (Accepted)
- [x] CHK-102 [P1] Alternatives documented with rejection rationale
- [x] CHK-103 [P2] Migration path documented (per-type target, carried fields, declared losses)
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [x] CHK-110 [P1] Not applicable — no performance-sensitive surface touched
- [x] CHK-111 [P1] Not applicable
- [x] CHK-112 [P2] Not applicable
- [x] CHK-113 [P2] Not applicable
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [x] CHK-120 [P0] Rollback: the three migrations are additive and reversible in place (`git revert` restores the withdrawn picker rows and the on-open hooks; the migrated views' own fields are left on disk for the in-app undo)
- [x] CHK-121 [P0] Not applicable — no feature flag in this codebase
- [x] CHK-122 [P1] Not applicable
- [x] CHK-123 [P1] Not applicable
- [x] CHK-124 [P2] Not applicable
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [x] CHK-130 [P1] Not applicable — no security-review surface
- [x] CHK-131 [P1] No new dependency added
- [x] CHK-132 [P2] Not applicable
- [x] CHK-133 [P2] Not applicable
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [x] CHK-140 [P1] All spec documents synchronized
- [x] CHK-141 [P1] Not applicable — no public API
- [x] CHK-142 [P2] Not applicable — no user-facing documentation until phase 4's README strip
- [x] CHK-143 [P2] Knowledge transfer documented in `.handover.md` and this packet's docs
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Implementation (this dispatch) | Technical | [x] Verified per the battery above | 2026-09-08 |
| Operator | Product Owner | [ ] Pending | |
<!-- /ANCHOR:sign-off -->
