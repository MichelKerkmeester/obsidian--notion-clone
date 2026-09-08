---
title: "Goal: Sheet Family Alignment to Notion x Anytype"
description: "The durable directive this phase parent executes against and the criteria that decide when the whole packet is done."
trigger_phrases:
  - "packet goal"
  - "071 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment"
    last_updated_at: "2026-09-08T21:40:24Z"
    last_updated_by: "242-landing-verify-continuation"
    recent_action: "002-settings-sheet LANDED+verified 8b213929: goal 2/3, gate 27/0"
    next_safe_action: "003/004 finish+land, then 005/006; 008/003-004 wait on the next release"
    blockers:
      - "002's landing is complete (`8b213929`, continuation-verified); the .worktrees/242 worktree can be retired once the 005-handover entry lands"
      - "003 (`.worktrees/244-add-property-sheet`) and 004 (`.worktrees/245-view-config-sheet`) are in progress, uncommitted; do not touch those worktrees either"
    key_files:
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "071-sheet-notion-anytype-alignment-scaffold"
      parent_session_id: null
    completion_pct: 25
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Family Alignment to Notion x Anytype

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Every sheet, panel and popover the app can open is inventoried once (R7), then brought as close as possible to Notion x Anytype's own presentation, one sheet family per child phase, starting with the settings sheet (R5) and the add-property sheet (R6).

### Decisions

| ID | Decision |
|----|----------|
| D1 | No child phase after 001 may redesign a sheet without first citing 001's reference-mapping row for it |
| D2 | The settings sheet (002) and add-property sheet (003) are the first two rows, per the operator |
| D3 | Only the operator's own device recheck may close a device row; no agent ticks it |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the child goal before working a phase.** Each is authoritative for its
phase and binds as if written here.

| Phase | Goal document |
|-------|---------------|
| 001-sheet-story-coverage-audit | `001-sheet-story-coverage-audit/goal.md` |
| 002-settings-sheet | `002-settings-sheet/goal.md` |
| 003-add-property-sheet | `003-add-property-sheet/goal.md` |
| 004-view-config-sheet | `004-view-config-sheet/goal.md` |
| 005-filter-sort-group-sheets | `005-filter-sort-group-sheets/goal.md` |
| 006-record-and-menu-sheets | `006-record-and-menu-sheets/goal.md` |

**Precedence.** Decisions above outrank child detail. Child detail outranks any
summary of it. Name a conflict rather than resolving it silently.

**Stop.** Only the criteria below decide done. An evaluator sees the objective
string, not these files.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] 001's inventory table exists and names every sheet-capable surface with its coverage and reference state — `001/inventory.md` holds 86 rows (54 primary + 32 stacked) with 0 blank cells, 68 rows carrying captures, 46 recording "none" references by name; the parent figure was 0/4 when the packet landed 2026-09-08 (`527e8455`), the packet's own 3/3 criteria are all ticked, its 9-test count suite and the 27/0 gate are green; the three redesign criteria stay open, so the parent's figure is 1/4
- [ ] 002 (settings sheet) and 003 (add-property sheet) both redesigned, recaptured and matched against their mapped reference — 002 LANDED+verified post-rebase at `8b213929` (goal 2/3: the reference columns stay `TBD`, D-005); 003 in progress, uncommitted
- [ ] 004, 005 and 006 (view-config, filter/sort/group, record/menu) each redesigned, recaptured and matched against their mapped reference — 004 in progress, uncommitted; 005/006 not started
- [ ] No prior sheet fix (054, 058, 045, 067) regresses as a result of any redesign in this packet
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened, six child phases scaffolded | Done | This scaffold, 2026-09-08 |
| 001-sheet-story-coverage-audit | Done | Landed `31f712c3`/`16547b92`; `001/inventory.md` 86-row coverage table |
| 002-settings-sheet | LANDED, landing-verified | `f0ffadc7`+`70ee0b95` rebased+landed as `5aa0ffd4`+`8b213929` on `origin/main`; continuation verification: gate 27/0, evidence re-derived, goal 2/3 (D-005) |
| 003-add-property-sheet | In progress | `.worktrees/244-add-property-sheet`, uncommitted |
| 004-view-config-sheet | In progress | `.worktrees/245-view-config-sheet`, uncommitted |
| 005-filter-sort-group-sheets, 006-record-and-menu-sheets | Not started | — |

### Deviations and findings

| Item | Note |
|------|------|
| Combined into one phase parent | Both phase-qualification thresholds (architectural cross-cutting change across every sheet family, plus file/LOC scores) are met independently, per `recommend-level.sh --loc 1200 --files 25 --architectural`; one coordinated packet avoids re-litigating the audit per sheet family |
<!-- /ANCHOR:log -->
