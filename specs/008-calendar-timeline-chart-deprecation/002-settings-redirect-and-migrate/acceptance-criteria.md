---
title: "Acceptance Criteria: Settings Redirect and Migrate"
description: "The criteria this phase must satisfy before it may be closed."
trigger_phrases:
  - "acceptance criteria"
  - "002-settings-redirect-and-migrate acceptance criteria"
importance_tier: "important"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->
# Acceptance Criteria: Settings Redirect and Migrate

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 008-calendar-timeline-chart-deprecation/002-settings-redirect-and-migrate
**Level:** 3
**Status:** Implemented, pending release cut
**Date:** 2026-09-08
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Given / When / Then | Verification | Status | Waiver |
|-------|-----|---------------------|--------------|--------|--------|
| AC-001 | REQ-001 | Given the add-view/view-type toolbar menu, the view-config panel's type picker, and the plugin-settings default-view dropdown, When inspected, Then none offers calendar, timeline or chart (each keeps only its own current-type escape hatch, matching the gallery/list precedent) | `calendar-timeline-chart-hide-and-migrate.test.ts` §2, all three pickers; `settings.test.ts` "keeps chart, calendar and timeline out of the offered default views" | Met | - |
| AC-002 | REQ-002 | Given a settings-json view persisted as `chart` or `calendar`, When settings load, Then it coerces to `table` through the bare unknown-type fallback (target equals the fallback, closes for free); given one persisted as `timeline`, When settings load, Then it routes through `planTimelineMigration`/`applyTimelineMigration` (target `board` differs from the fallback, so a bare coercion would strand the lane grouping before any render sees it) | `calendar-timeline-chart-hide-and-migrate.test.ts` §3 (sanitizer no longer exempts chart; timeline calls the real migration); `timeline-migration.test.ts` | Met | - |
| AC-003 | REQ-002 | Given a vault-frontmatter view of one of the three types, When it is opened in the standalone file view, Then it renders as its decided redirect target (chart/calendar → table, timeline → board) with the declared-loss fields left on the view for undo, and a notice names the change once per database | `chart-migration.test.ts`, `calendar-migration.test.ts`, `timeline-migration.test.ts` (plan/apply); `calendar-timeline-chart-hide-and-migrate.test.ts` §6 (hooks wired into `database-view.ts`'s `refresh()` head, keyed by the three `*MigrationNotices` settings fields) | Met | - |
| AC-004 | REQ-003 | Given a chart/calendar/timeline-configured codeblock embed, When it renders, Then it is migrated the same way the standalone host is (mirrors 007's ADR-001: the embedded host gains the call rather than staying inert) | `calendar-timeline-chart-hide-and-migrate.test.ts` §6, `embedded-database-renderer.ts` carries all three `plan*Migration`/`migrate*ViewOnOpen` pairs, called from `render()`'s head | Met | - |
| AC-005 | REQ-002 | Given `data-source.ts`'s `parseViewType()`, When a db_view file's frontmatter is read, Then it still accepts all three ids — closing it would coerce a persisted view to its fallback before any host's on-open migration ever ran, the same reasoning `gallery`/`list` stay open for | `calendar-timeline-chart-hide-and-migrate.test.ts` §4 | Met | - |
| AC-006 | REQ-001, REQ-002 | Given the finished phase, When `npm run gate` runs, Then it exits 0 read from `$?`, and every closed surface has a test that was observed failing first | `npm run gate` exit 0 (27/27 lanes green); red-first record in `tasks.md` T004 (12 failed/3 passed against the pre-edit source) | Met | - |
| AC-007 | REQ-002 | Given this phase's work is merged, When `003` (remove renderers) is considered, Then a **released** version number carries the migration — merged is not shipped | The release tag and the version in `manifest.json` — not this dispatch's to cut | Unmet | - |

### Status values

| Value | Meaning |
|-------|---------|
| `Met` | Verified. The Verification cell names evidence that was actually observed. |
| `Unmet` | Not yet satisfied. Blocks closure. |
| `Waived` | Deliberately not pursued. Requires an ADR in the Waiver cell. |
| `Superseded` | Replaced by a different criterion or decision. Requires an ADR in the Waiver cell. |
<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** No

AC-001 through AC-006 are `Met` with observed evidence. AC-007 is the one row that most wants to be
waived and must not be: `003` cannot delete the three renderers until a released version has carried
this redirect to users, matching the same gate 007-002 left open for gallery's release cut.
<!-- /ANCHOR:closure -->
