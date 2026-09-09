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
    last_updated_at: "2026-09-09T09:56:00Z"
    last_updated_by: "255-pkg-description"
    recent_action: "0.0.35 published (97395196); 4/4 closed; the package.json residual 3 → 0"
    next_safe_action: "Packet closed, the package.json residual discharged; push 0.0.35 — a fresh verifier lands it"
    blockers: []
    key_files:
      - "spec.md"
      - "001-usage-and-migration-audit/inventory.md"
      - "002-settings-redirect-and-migrate/decision-record.md"
      - "003-remove-renderers-and-harness/decision-record.md"
      - "004-archive-docs-and-release/implementation-summary.md"
      - "changelog/008-004-archive-docs-and-release.md"
      - "../../../archive/deprecated-views/README.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "008-calendar-timeline-chart-deprecation-scaffold"
      parent_session_id: null
    completion_pct: 100
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
- [x] 002 ships the settings redirect; no picker/switcher/settings surface can create or select the three types — landed `b5f4ccd4`/`9ffa7ed2`, 2/2 criteria, gate 27/0; AC-007 (a release carrying the redirect) discharged — the 0.0.34 tag exists
- [x] 003 removes the three renderers and harness lanes from the bundle and archives the code with a restore-path README and an ADR — landed this leg (worktree `250-deprecation-removal`; the closing SHA in the dispatch report): 4/4 criteria, the bundle grep 0 (was 5), the gate 27/0, ten sources archived with proven-restore READMEs
- [x] 004 strips calendar/timeline/gallery/chart mentions from the root README and community-plugin description, and documents 037's timeline landing as superseded — landed this leg (worktree `252-deprecation-readme-strip`): the root README's enforced mentions 13 → 0 outside the mandated "Deprecated views" note (7 inside — the note is the operator-mandated pointer to the archive), the description in `manifest.json` 3 → 0, 037's supersession recorded in its own goal.md; the new mention lane 10/10, the gate 27/0; the drafted release notes (`changelog/008-004-archive-docs-and-release.md`) **published 2026-09-09** in the 0.0.35 GitHub release (tag `0.0.35`, commit `97395196`) — `gh release view 0.0.35` confirms the published body names the removal, the archive location and the restore procedure
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened, four child phases scaffolded | Done | This scaffold, 2026-09-08 |
| 001-usage-and-migration-audit | Done | `001-usage-and-migration-audit/inventory.md`, landing-verified 7a6d4cc6 |
| 002-settings-redirect-and-migrate | Done | Landed `b5f4ccd4`/`9ffa7ed2`; `002-settings-redirect-and-migrate/implementation-summary.md`, gate 27/0; AC-007 (release) discharged by the 0.0.34 cut |
| 003-remove-renderers-and-harness | Done | `003-remove-renderers-and-harness/implementation-summary.md`; 4/4 criteria, the bundle grep 0, the gate 27/0, ten sources archived; validated strict-PASSED — 2026-09-09 |
| 004-archive-docs-and-release | Done | `004-archive-docs-and-release/implementation-summary.md`; 2/2 acceptance criteria Met, the note-exemption ruling recorded in the phase goal's LOG, the gate 27/0; the release notes drafted and published — 2026-09-09 |
| 0.0.35 cut and published | Done | Tag `0.0.35` at `97395196`; GitHub release published (`gh release view 0.0.35`), the drafted removal/archive/restore copy is the published body. ALL FOUR CHILDREN CLOSED — parent 4/4 |
| 255 residual: `package.json`'s description | Done | Retired mentions 3 → 0 (chart 1, calendar 1, timeline 1); the mention lane extended to read the description field, RED/GREEN recorded; the gate 27/0 — 2026-09-09 |

### Deviations and findings

| Item | Note |
|------|------|
| Combined into one phase parent | Both phase-qualification thresholds are met independently (`recommend-level.sh --loc 1000 --files 20 --architectural`); one packet avoids three separate top-level packets re-deciding the same archive location and README strip |
| 002's three types split into two fallback shapes | Chart/calendar's redirect target equals the settings-load sanitizer's bare unknown-type fallback and closes for free; timeline's does not and routes through a real migration — `002/decision-record.md` ADR-001 |
| 003's removal kept the harness's retired-view machinery dormant | The gate's lane count held 27→27 and the 002-pinned clauses survived untouched; five turned-unsupplied retired-view tokens recorded, not stood in — `003-remove-renderers-and-harness/decision-record.md` ADR-002/003 |
| `package.json`'s `description` field still names the retired views | Read 2026-09-09: `"Database views for notes with table, board, list, chart, calendar, timeline, inline markdown, formulas, and source rules."` — 004's AC-001 scoped "the community-plugin description" to `manifest.json` (already 0 mentions), not `package.json`; this field was never in that criterion's scope, so it stays open as a residual, not a broken tick. Discharged 2026-09-09 by the residual leg (worktree `255-pkg-description`): the description now reads `Database views for notes with table, board, inline markdown, formulas, and source rules.` — 3 → 0 — and the lane reads `package.json`'s `description` field alone (its dependency and keyword lists are code identifiers, not prose copy); RED/GREEN recorded in 004's implementation summary, the gate 27/0 |
<!-- /ANCHOR:log -->
