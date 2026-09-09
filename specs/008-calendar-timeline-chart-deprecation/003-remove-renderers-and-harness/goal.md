---
title: "Goal: Remove Renderers and Harness"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "003-remove-renderers-and-harness goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "008-calendar-timeline-chart-deprecation/003-remove-renderers-and-harness"
    last_updated_at: "2026-09-09T08:05:00Z"
    last_updated_by: "250-deprecation-removal"
    recent_action: "Landed: 4/4 criteria, bundle grep 0, gate 27/0"
    next_safe_action: "Start 004-archive-docs-and-release (root-README strip, then the release cut)"
    blockers: []
    key_files:
      - "decision-record.md"
      - "../../../archive/deprecated-views/README.md"
      - "../../../src/views/database-view.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "003-remove-renderers-and-harness-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions:
      - "Ten sources archived under proven-restore paths (last-live SHA proven by git show); the bundle grep 0 (was 5); 136 retired capture rows, 138 PNGs deleted; five retired-view tokens recorded, not stood in"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Remove Renderers and Harness

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The three renderers and their harness lanes are removed from the shipped bundle, and the removed code is archived with a documented restore path.

### Decisions

| ID | Decision |
|----|----------|
| D1 | This phase does not start until Phase 2's redirect ships |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Renderer source files moved to `archive/deprecated-views/<view>/` — ten sources (renderers, tests, benches) via `git mv`, history-preserving renames; they still type-check through their surviving importers (`tsconfig` rootDir widened, the one deliberate config touch)
- [x] Harness lanes removed; `npm run gate` still exits 0 — registries trimmed (13+8 rows), 136 retired capture rows (616→480 captures), nine replay claims retired and two narrowed; the gate's final run exit 0, 27/27. Lane count 27→27: the harness's dormant machinery kept its lanes' inputs, see the decision record
- [x] archive README names the last-live SHA and the restore procedure — the root README and all three view READMEs name `e75a979c9a21f6f93967a40e24b2a58f474fa9d5` (the commit 0.0.34 was cut from) and the exact `git checkout <sha> -- <paths>` procedure; all ten restored paths proven reachable at that SHA by `git show`
- [x] Archival decision recorded as an ADR — `decision-record.md` ADR-001 (archive-then-exclude), ADR-002 (dormant machinery), ADR-003 (recorded-not-stood-in tokens), all Accepted with rejected alternatives
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| Removal + archival | Done | Ten sources archived, the two hosts' surgeries, the retired registrations; bundle grep 0 (was 5); the gate 27/0 — 2026-09-09 |
| Documentation + validation | Done | Three ADRs, the four READMEs, the acceptance criteria all `Met`; the strict validation orchestrator PASSED |

### Deviations and findings

| Item | Note |
|------|------|
| Dormant harness machinery kept | The retired views' harness branches, tags and bags stay uncalled-but-compiling so no gate lane lost its inputs (27→27); their fate is recorded, not memorized — ADR-002 |
| Five retired-view tokens turned unsupplied | Their setters were style-assignments inside the archived renderers; the pinned-values baseline now records all five (caught by the gate's first run) — ADR-003 |
| One replay claim hid a consumer | The final tick-label claim imported the temporal fixture helpers; the replay run caught it and the claim retired with the fixture it exercised |
| The phase context's `../changelog/` does not exist | The previous phase's closure shipped without one either; the next phase (docs-and-release) owns the first |
<!-- /ANCHOR:log -->
