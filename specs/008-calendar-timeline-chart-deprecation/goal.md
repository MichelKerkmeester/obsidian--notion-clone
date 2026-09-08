---
title: "Goal: Calendar, Timeline and Chart View Deprecation"
description: "The durable directive this phase parent executes against and the criteria that decide when the whole packet is done."
trigger_phrases:
  - "packet goal"
  - "008 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation"
    last_updated_at: "2026-09-08T22:29:00Z"
    last_updated_by: "246-goal-refresh-evening"
    recent_action: "001+002 LANDED (7a6d4cc6, b5f4ccd4/9ffa7ed2); 003 waits on the 0.0.34 release cut"
    next_safe_action: "Cut 0.0.34 (discharges AC-007), then start 003-remove-renderers-and-harness"
    blockers:
      - "002's own AC-007 (a released version) is Unmet; 003 waits for it"
    key_files:
      - "spec.md"
      - "001-usage-and-migration-audit/inventory.md"
      - "002-settings-redirect-and-migrate/decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "008-calendar-timeline-chart-deprecation-scaffold"
      parent_session_id: null
    completion_pct: 50
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Calendar, Timeline and Chart View Deprecation

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Calendar, timeline and chart views cannot be created or configured from any surface, every existing view of those types opens through a settings redirect, the renderers and their harness lanes are removed from the shipped bundle, the removed code is archived with a documented restore path, and the root README no longer mentions calendar, timeline, gallery or chart views.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Nothing is removed before 001's audit says what a live vault actually holds |
| D2 | The removed code is archived under `archive/deprecated-views/<view>/`, not deleted, with a README naming the last-live SHA and the restore procedure, recorded as an ADR |
| D3 | Combined into one phase parent rather than three top-level packets, since all three renderers share one teardown mechanism and one archive/README decision |
| D4 | `037-timeline-gantt-port`'s recent landing stays documented as superseded once this packet's removal phase lands, not deleted from history |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the child goal before working a phase.** Each is authoritative for its
phase and binds as if written here.

| Phase | Goal document |
|-------|---------------|
| 001-usage-and-migration-audit | `001-usage-and-migration-audit/goal.md` |
| 002-settings-redirect-and-migrate | `002-settings-redirect-and-migrate/goal.md` |
| 003-remove-renderers-and-harness | `003-remove-renderers-and-harness/goal.md` |
| 004-archive-docs-and-release | `004-archive-docs-and-release/goal.md` |

**Precedence.** Decisions above outrank child detail. Child detail outranks any
summary of it. Name a conflict rather than resolving it silently.

**Stop.** Only the criteria below decide done. An evaluator sees the objective
string, not these files.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] 001's audit inventories every live calendar/timeline/chart view and names each one's settings-redirect target — 33 views named with targets, landed `7a6d4cc6`
- [x] 002 ships the settings redirect; no picker/switcher/settings surface can create or select the three types — landed `b5f4ccd4`/`9ffa7ed2`, 2/2 criteria, gate 27/0; AC-007 (a release carrying the redirect) stays Unmet until 0.0.34 cuts
- [ ] 003 removes the three renderers and harness lanes from the bundle and archives the code with a restore-path README and an ADR
- [ ] 004 strips calendar/timeline/gallery/chart mentions from the root README and community-plugin description, and documents 037's timeline landing as superseded
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened, four child phases scaffolded | Done | This scaffold, 2026-09-08 |
| 001-usage-and-migration-audit | Done | `001-usage-and-migration-audit/inventory.md`, landing-verified 7a6d4cc6 |
| 002-settings-redirect-and-migrate | Done | Landed `b5f4ccd4`/`9ffa7ed2`; `002-settings-redirect-and-migrate/implementation-summary.md`, gate 27/0; AC-007 (release) pending 0.0.34 |

### Deviations and findings

| Item | Note |
|------|------|
| Combined into one phase parent | Both phase-qualification thresholds are met independently (`recommend-level.sh --loc 1000 --files 20 --architectural`); one packet avoids three separate top-level packets re-deciding the same archive location and README strip |
| 002's three types split into two fallback shapes | Chart/calendar's redirect target equals the settings-load sanitizer's bare unknown-type fallback and closes for free; timeline's does not and routes through a real migration — `002/decision-record.md` ADR-001 |
<!-- /ANCHOR:log -->
