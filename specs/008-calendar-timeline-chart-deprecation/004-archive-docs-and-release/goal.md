---
title: "Goal: Archive Docs and Release"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "004-archive-docs-and-release goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/004-archive-docs-and-release"
    last_updated_at: "2026-09-08T08:30:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive"
    next_safe_action: "Execute against the completion criteria"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "004-archive-docs-and-release-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Archive Docs and Release

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The root README and community-plugin description contain zero calendar/timeline/gallery/chart mentions, and 037's timeline landing is documented as superseded.

### Decisions

| ID | Decision |
|----|----------|
| D1 | This phase does not start until Phase 3's removal lands |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] README.md and community-plugin description stripped of all four view mentions
- [ ] 037-timeline-gantt-port documented as superseded without deleting its history
- [ ] Release notes describe the removal and the archive/restore path
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
