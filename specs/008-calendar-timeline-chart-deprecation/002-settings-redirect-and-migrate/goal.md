---
title: "Goal: Settings Redirect and Migrate"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "002-settings-redirect-and-migrate goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/002-settings-redirect-and-migrate"
    last_updated_at: "2026-09-09T08:55:00Z"
    last_updated_by: "252-deprecation-readme-strip"
    recent_action: "Closed: 7/7 criteria; AC-007 discharged, 0.0.34 = e75a979c"
    next_safe_action: "None; 003 landed 7fb9fb28, the 0.0.35 cut awaits 004's notes"
    blockers: []
    key_files:
      - "decision-record.md"
      - "implementation-summary.md"
      - "../../../src/data/timeline-migration.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "002-settings-redirect-and-migrate-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Settings Redirect and Migrate

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** No surface can create or select a calendar, timeline or chart view, and every existing view opens through its decided redirect.

### Decisions

| ID | Decision |
|----|----------|
| D1 | This phase does not start until Phase 1's audit closes |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Picker/switcher/settings surfaces confirmed to offer none of the three types — `src/views/toolbar-renderer.ts` and `view-config-panel-renderer.ts` filters withdrawn from every picker with the current-type escape hatch kept, `settings.ts` `DEFAULT_VIEW_TYPES` = `["table","board"]`; proven by `src/views/calendar-timeline-chart-hide-and-migrate.test.ts` 15/15
- [x] Every view Phase 1 found opens through its redirect — the mechanism is type-generic: the settings-load sanitizer in `main.ts` plus on-open `migrate{Chart,Calendar,Timeline}ViewOnOpen` in both `database-view.ts` and `embedded-database-renderer.ts` route calendar→table, timeline→board (carrying `timelineGroupField→boardGroupField`), chart→table (`002/decision-record.md` ADR-001), each applied to every vault view of that type; proven by the hide-and-migrate tests 15/15 and the three migration modules' own tests
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| LANDED on `origin/main` | Done | Leg `bd09bd30` (Sonnet) rebased onto `14bcaf10` (11 conflicts, main's side taken) → `e6445bb7`, plus the verifier's reconciliation `b5f4ccd4` (`14bcaf10..b5f4ccd4`); full vitest 1716/1716; build 0, tsc 0; gate 27 green, 0 red; `validate --strict` PASSED for 002 and the 008 parent |

### Deviations and findings

| Item | Note |
|------|------|
| The rebase exposed one real casualty | 071/001's committed `inventory.md` went stale on the code's new `database-view.ts`/`toolbar-renderer.ts` line numbers; regenerated via `tools/storybook/sheet-inventory.mjs` (86 surfaces, 9/9 tests green) |
| Both mutations re-observed, not trusted | Chart's toolbar filter clause dropped → 2 failed/13 passed, restored 15/15; the on-open timeline hook deleted from `database-view.ts` → 1 failed/14 passed, restored 15/15 |
| Screenshots judged by decoded pixel delta, not pixelHash | 5 movers kept REAL (the redirect's withdrawn picker rows), 2 single-run ≤12-delta movers restored; `styles.css` never moved, so the existing 009 `reviewed` entry absorbed the 3 new mover names |
| AC-007 stays Unmet on purpose | It requires a released version carrying the redirect; 003-remove-renderers-and-harness waits for that cut |
| AC-007 discharged, 2026-09-09 | 0.0.34 shipped the redirect at `e75a979c` before 003's removal landed; the criteria row now reads `Met` and the closure statement `Closeable: Yes` — recorded by the 008/004 docs leg, evidence pinned to `git rev-parse 0.0.34^{commit}` |
<!-- /ANCHOR:log -->
