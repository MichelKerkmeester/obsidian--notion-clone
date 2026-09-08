---
title: "Implementation Summary: Usage and Migration Audit"
description: "The audit ran read-only against bf694181: 33 live views found (11 databases × calendar/timeline/chart), all with decided redirect targets (calendar→table, timeline→board, chart→table), the three DatabaseViewType ids recorded as stay-accepted-but-redirected, and the embedded-host question answered by precedent."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/001-usage-and-migration-audit"
    last_updated_at: "2026-09-08T10:30:00Z"
    last_updated_by: "234-calendar-timeline-chart-audit"
    recent_action: "Ran the usage-and-migration audit; inventory.md is the entire output"
    next_safe_action: "002-settings-redirect-and-migrate starts from inventory.md §1.2-§1.3 and §5"
    blockers: []
    key_files:
      - "specs/008-calendar-timeline-chart-deprecation/001-usage-and-migration-audit/inventory.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "234-calendar-timeline-chart-audit"
      parent_session_id: "001-usage-and-migration-audit-scaffold"
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "The operator holds calendar AND chart views today (11 of each), not only timeline — the child spec's §12 question"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary: Usage and Migration Audit

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 001-usage-and-migration-audit |
| **Completed** | 2026-09-08 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

The audit that gates every removal (parent D1) ran, read-only, against the tree at **`bf694181`**. `inventory.md` is its entire output: 33 live views of the three types found in the operator's vault — 11 databases, one calendar, one timeline and one chart view each — every one carrying a decided, reasoned redirect target, plus the retention decision the removal phases were guessing at.

The vault grew since 007-001's read of `b240a8d5`: one `db_view` file then, fifteen now (76 views total). The audit's counts supersede that earlier one; anyone planning phase 2/3 blast radius from the 007-era numbers would have underestimated the vault 15×.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `inventory.md` | Created | The audit: storage decision (§1.1), per-type redirect targets with reasons (§1.2), embedded-host decision (§1.3), the 33-view table with file:line (§2.1), every code-reference class with file:line (§3), counts per view (§4), the migration plan phase 2 must mirror (§5), the archive plan (§6) |
| `goal.md` | Modified | Completion criteria ticked with evidence pointers; deviations/finding rows recorded |
| `acceptance-criteria.md` | Modified | AC-001/AC-002 → Met; closure statement updated |
| `tasks.md` | Modified | Phase tasks resolved for this docs-only leg, with evidence |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

No `src/`, `tools/` or `styles.css` file changed — per goal D1 nothing is removed before this audit closes, and the read-only nature meant the styles/renderer-gated capture verification (screenshots twice, pixel-delta, live-lane refreshes) had nothing to bite on. The proof work was measurement: a fresh read-only vault scan, occurrence counts pinned to the start SHA, and the whole 007/006 precedent chain read before the retention decision was written.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| The three ids stay in `DatabaseViewType` — accepted-but-redirected (inventory §1.1) | 007-001's mechanism finding: closing `parseViewType()`'s exemption is free only when the target equals the unknown-type fallback. Two of the three targets do; one (timeline→board) does not, so the union cannot shrink cleanly until its redirect routes through a real migration |
| Targets: calendar→table, timeline→board, chart→table (§1.2) | Calendar and chart lose their essence (date arrangement, aggregation) in any surviving type, and table is the fallback, so their exemptions close free like 006's list. Timeline is the only one whose config already carries a grouping dimension (`timelineGroupField` → board's `boardGroupField`), so board preserves what board can |
| The embedded codeblock host gets its own migration pass (§1.3, REQ-003) | 007-002's ADR-001 precedent, even though 0 fence-configured views of the three exist today — the host resolves the referenced view's config itself, and the transplant shape (`migrateListViewOnOpen`, called at `embedded-database-renderer.ts:746`, defined at `:825`; 007-002's gallery copy at `:745`/`:782`) already ships |
| Timeline's redirect must route through the real migration, not the bare fallback | 007-002's ADR-002 is the shipped pattern for a target ≠ fallback; the charter for phase 2 is written into inventory §5 |
| Packet 037's gantt port: no further documentation owed | 008's parent spec.md:55,117 already records `037-timeline-gantt-port` as superseded by this packet; inventory §3.6 locates the port's code (765 `gantt` occurrences, centered on `src/views/calendar-timeline-renderer.ts`) and capture surface for phase 3's archive |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS, exit 0 |
| `npx vitest run` | PASS, exit 0 — 1671 tests across 153 files |
| `npm run build` | PASS, exit 0 |
| `node tools/naming/scan-comments.mjs` | PASS, exit 0 (507 files, 0 violations) |
| `node tools/naming/scan-failing-values.mjs` | PASS, exit 0 (ratchet: 275/423 record their number, baseline 148 unchanged) |
| `node tools/naming/build-operator-checklist.mjs` then `--check` | PASS, exit 0 (207 rows across 69 phases, current) |
| Spec-folder validation | PASS — backfill refreshed the metadata pair (1 refreshed, 0 created), then the strict orchestrator: `Errors: 0, Warnings: 2`, `RESULT: PASSED` |
| Screenshots / pixel-delta / live-lane refreshes | NOT RUN — docs-only change, no `styles.css` or renderer touched (the gate condition "if you changed" is false) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Vault numbers are a point-in-time read.** The vault grew 1→15 db_view files between 007-001's read and this one; phase 2 must re-grep before writing its migrations (inventory §3's counts are pinned to `bf694181` for exactly this reason).
2. **Capture-id → definition-file attribution is two-sourced.** The constructed-ids resolve in both `constructed-scenarios.mjs` and `scenarios/temporal.mjs` (plus their tests); inventory §3.6 records both rather than guessing, and phase 3 re-verifies at removal time.
3. **No changelog directory exists** under the parent packet, so the spec's phase-context changelog instruction has no target yet; this limitation is recorded rather than silently dropped.
<!-- /ANCHOR:limitations -->
