---
title: "Goal: Usage and Migration Audit"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "001-usage-and-migration-audit goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/001-usage-and-migration-audit"
    last_updated_at: "2026-09-08T11:30:00Z"
    last_updated_by: "234-calendar-timeline-chart-audit"
    recent_action: "Landed: 3/3 criteria, 33 views named with targets; verifier-confirmed"
    next_safe_action: "002-settings-redirect-and-migrate starts from inventory.md"
    blockers: []
    key_files:
      - "specs/008-calendar-timeline-chart-deprecation/001-usage-and-migration-audit/inventory.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "001-usage-and-migration-audit-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Usage and Migration Audit

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every live calendar/timeline/chart view (operator vault and fixtures) is named with its redirect target before Phase 2 ships anything.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Nothing is removed before this audit closes |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Inventory table produced naming every live view of the three types — `inventory.md` §2.1: 33 views (11 databases × one calendar, one timeline, one chart), each with its file:line in the operator's vault; §2.2 records 0 shipped fixture-vault views and names the programmatic harness fixtures instead
- [x] Redirect target decided and reasoned for every view found — `inventory.md` §1.2: calendar→table, timeline→board, chart→table, each with the code-grounded reason; applied uniformly to all 33 rows via the referenced column
- [x] DatabaseViewType retention-vs-redirect decision recorded — `inventory.md` §1.1: the three ids stay, accepted-but-redirected, with the 007-001/006 mechanism reason; the embedded-host question (REQ-003) answered in §1.3
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| Operator-vault scan | Done | Fresh read-only grep, 2026-09-08: 15 `db_view` files, 76 views, 33 of the three types (`inventory.md` §2.1) — supersedes 007-001's 1-file/`b240a8d5` read |
| Retention + targets decided | Done | `inventory.md` §1.1-§1.2 |
| REQ-003 embedded host decided | Done | `inventory.md` §1.3: yes, prophylactic, transplant shape at `embedded-database-renderer.ts:746,782,825` |

### Deviations and findings

| Item | Note |
|------|------|
| Vault grew 15× since 007-001 | 1 `db_view` file at `b240a8d5`, 15 at this audit's read; phase 2 must re-grep before writing migrations |
| Spec's phase-context names a changelog | No `changelog/` directory exists under the parent packet; limitation recorded in `implementation-summary.md` |
<!-- /ANCHOR:log -->
