---
title: "Goal: Settings Sheet Redesign"
description: "The durable directive this phase executes against and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "002-settings-sheet goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/071-sheet-notion-anytype-alignment/002-settings-sheet"
    last_updated_at: "2026-09-08T08:20:00Z"
    last_updated_by: "markdown-scaffold"
    recent_action: "Authored the directive"
    next_safe_action: "Execute against the completion criteria"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "002-settings-sheet-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Settings Sheet Redesign

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The Settings sheet's layout, spacing and row grammar match its Phase-1-mapped reference, closing R5.

### Decisions

| ID | Decision |
|----|----------|
| D1 | This phase does not start until Phase 1 names the Settings sheet's reference |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [x] Phase 1's reference mapping read before redesign starts
- [x] Settings sheet redesigned and recaptured against its mapped reference
- [x] No regression on 054 T072's row-grammar and overflow fixes
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Packet opened | Done | This scaffold, 2026-09-08 |
| Phase 1 mapping read | Done | Inventory row 1 quoted in `plan.md` §1; producer `src/views/database-view.ts:5169` |
| Gap table | Done | `spec.md` §13 — current numbers measured by the lane; reference columns honest `TBD` (D-005) |
| RED | Done | 0/12 compact one-line, 3/12 pitch, headings 12px/0px, 4 failures, exit 1 (`tools/live/sheet-grammar.mjs`) |
| Implemented | Done | `styles.css` only; producer untouched (decision-record D-001) |
| GREEN | Done | 12/12 compact @ 48.0px, 9/9 editors, headings 16px + 1px, extent 401 == 401 @ 402px, exit 0 |
| Unit-test revert proof | Done | 6/6 → 1 failed / 5 passed on revert → 6/6 (`src/views/view-config-sheet-row-grammar.test.ts`) |
| Captures + evidence + gate | Done | 616/616 ×2 + pixel-delta/jitter policy; evidence 15/15 fresh; gate 27/27, exit 0, css-lane ledger signed (`368631d8cd1f`) |
| Docs + validation | Done | Orchestrator `--strict` → `RESULT: PASSED`; graph metadata backfilled |
| Built, landing pending | Done | The GLM leg landed `f0ffadc7` (settings rows red-first) + `70ee0b95` in `.worktrees/242-settings-sheet-notion`; its lander was paused mid-rebase (rebase conflicts) by the operator before reaching `origin/main` |

### Deviations and findings

| Item | Note |
|------|------|
| Reference measurements TBD | Third-party captures carry no readable numbers; directives asserted instead (decision-record D-005) |
| 1px left border, none right | Side-sheet grammar asymmetry, shipped; flagged for 071 legs 004/005/006 |
| Divider token fallback | 0px dividers where the host border token is missing; #333333 fallback (D-004) |
| engine-parity exits 1 | INFORMATIONAL by design: 50→53 disagreements, +10/−7, all panel-base-import-modal checkbox-tint notes, 0 settings fixtures; committed = 50 |
| Built at `70ee0b95`, landing paused mid-rebase | The three criteria below read `Unmet` in `acceptance-criteria.md` and stay that way until the paused lander resumes its rebase and verifies the landed evidence against `origin/main` itself |
<!-- /ANCHOR:log -->
