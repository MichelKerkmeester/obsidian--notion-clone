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
    last_updated_at: "2026-09-09T08:55:00Z"
    last_updated_by: "252-deprecation-readme-strip"
    recent_action: "Landed: the strip, the note, the description, the mention lane; 3/3 criteria"
    next_safe_action: "Cut 0.0.35 publishing the drafted notes, then push"
    blockers:
      - "The 0.0.35 cut that publishes the drafted notes (and the push) — a later leg, not this dispatch"
    key_files:
      - "../../../README.md"
      - "../../../manifest.json"
      - "../../../tools/naming/scan-deprecated-views.mjs"
      - "../../../archive/deprecated-views/README.md"
      - "../changelog/008-004-archive-docs-and-release.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "004-archive-docs-and-release-scaffold"
      parent_session_id: null
    completion_pct: 90
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

- [x] README.md and community-plugin description stripped of all four view mentions — the root README's enforced mentions 13 → 0 (7 remain, all inside the sanctioned "Deprecated views" note, which the operator's R9 copy mandates as the pointer to the archive); the description in `manifest.json` 3 → 0; enforced by the new `tools/naming/scan-deprecated-views.mjs` lane, 10/10 tests, worktree `252-deprecation-readme-strip`
- [x] 037-timeline-gantt-port documented as superseded without deleting its history — the 2026-09-09 note in 037's own goal.md LOG names the archival, the last-live SHA and the restore procedure, and states that every prior row stands; nothing deleted
- [x] Release notes describe the removal and the archive/restore path — drafted at `../changelog/008-004-archive-docs-and-release.md`; **published 2026-09-09** in the 0.0.35 GitHub release (tag `0.0.35`, commit `97395196`): the published body names the removed renderers, the `archive/deprecated-views/` location, the restore READMEs and the `git checkout <sha> -- <paths>` procedure, and confirms the 0.0.34 redirects (calendar→table, timeline→board, chart→table) stay in place
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| 004 docs leg (worktree `252-deprecation-readme-strip`) | Done | This leg, 2026-09-09: the README strip, the note, the manifest description, the mention lane (red 13+3 → green 0+7/0), the verification battery, the drafted release notes |
| Release notes published | Done | 0.0.35 cut at `97395196`, GitHub release published 2026-09-09; the release body carries the drafted removal/archive/restore copy (`gh release view 0.0.35`) |

### Deviations and findings

| Item | Note |
|------|------|
| Note exemption | The directive's "zero mentions" objective and the operator's note mandate (R9) meet in the enforced rule "zero outside the note": the note's 7 mentions ARE the pointer the operator asked for, so the lane counts them without failing on them |
| Counts, two rulers | The leg's recon grep (5 keywords, substring match) read the root README 13 → 6; the lane (6 keyword shapes, adding "list views", word-bounded) reads 13 → 0 outside the note + 7 inside. Same 13 before, different composition after; the lane's numbers are the enforced ones. Both recorded in the implementation summary |
<!-- /ANCHOR:log -->
