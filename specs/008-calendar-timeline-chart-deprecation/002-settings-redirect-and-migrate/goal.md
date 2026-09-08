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
    last_updated_at: "2026-09-08T16:10:00Z"
    last_updated_by: "240-deprecation-redirect-verify"
    recent_action: "Landed: 2/2 criteria, redirect+migration verified, gate 27/0; AC-007 awaits release"
    next_safe_action: "Cut the release carrying 002's redirect (AC-007), then 003-remove-renderers-and-harness"
    blockers:
      - "AC-007 (a released version carrying the redirect) is Unmet until the next release cut"
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

### Deviations and findings

| Item | Note |
|------|------|
| None yet | Work has not started |
<!-- /ANCHOR:log -->
