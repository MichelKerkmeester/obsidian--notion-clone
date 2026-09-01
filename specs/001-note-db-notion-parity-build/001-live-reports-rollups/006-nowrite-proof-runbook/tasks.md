---
title: "Tasks: Nowrite Proof Runbook"
description: "Go-live tasks: SC-001, SC-002, edges, list removal, runbook, fork src scope lock."
trigger_phrases:
  - "nowrite proof tasks"
  - "go-live verification"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/001-live-reports-rollups/006-nowrite-proof-runbook"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored go-live proof child from synthesis rank 7 and final-plan steps 10-14"
    next_safe_action: "Run SC-001 and SC-002 after SUM is bound; then remove diagnostic lists"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-006-nowrite-proof-runbook"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Tasks: Nowrite Proof Runbook

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (target — fork file:line or vault config)`

Do not remove diagnostic `list` columns until T002 and T003 pass.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] T001 Confirm child 002 YAML pin is `display-only`, child 004 SUM is bound (or UNKNOWN halt already recorded), and child 003 `list`/`file.name` columns are still present (Reports `db_view`) [S]
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [ ] T002 SC-001 accuracy: compare on-screen Report Income/Expenses/Sales rollups to a manual SUM of related children and cross-check against the temporary `list`/`file.name` inventories (`CellRenderer.ts:656`; consumers `DatabaseView.ts:3388-3399`, `EmbeddedDatabaseRenderer.ts:3198-3209`). Three figures must match; a zero-child Report is not deleted (Reports view) [S]
- [ ] T003 No-write proof and benign-write runbook (deps: display-only + SUM): snapshot the Report note's bytes, edit one related child amount, confirm the rollup updates on screen (≤80ms coalesce, `DataSource.ts:1938-1998`) and Report bytes are unchanged; document that residual Report-file writes are one-time startup migrations and user-initiated view-config saves only (`Obsidian Plugin/src/data/types.ts:69`, `DataSource.ts:989-992`). Record the two-sided maintenance rule: new child → Month **and** Report relation, both `[[wikilink]]` (live vault + runbook — fork files: none) [S]
- [ ] T004 Confirm edge behavior: empty Month link omitted from SUM/COUNT (SUM empty placeholder, COUNT `0` — do not read SUM-empty as `0`), duplicate `[[wikilink]]` counted once via `seenPaths` (`RelationRollup.ts:69-75`), two relation columns over the same children counted independently, nested rollup target stays empty (`RelationRollup.ts:101`), Saved still static or `Snapshot*` (Reports view) [S]
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] T005 Remove the diagnostic `list` columns after T002–T004 pass (do not remove them at the same moment SUM is added) and confirm SUM/COUNT remain. Confirm the fork working tree has no this-phase source diffs. Successor handoff (one line, not an executable checkbox): successor `002-rollup-aggregation-pack` locked `src/data/Aggregate.ts` — not `RollupAggPack.ts`; this phase must not pre-create that file (Reports `db_view` + fork tree — fork files: none) [S]
- [ ] T006 Mobile smoke: same vault, same figures (`Platform.isMobile` is UI-only; sole `require("electron")` is export) [S]
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All executable tasks marked `[x]`
- [ ] No executable successor-pack task remains
- [ ] Lists gone; SUM/COUNT remain
- [ ] Fork `src/` clean
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Parent synthesis**: `../research/synthesis.md` rank 7
- **Parent final-plan**: `../research/final-plan.md` steps 10–14
<!-- /ANCHOR:cross-refs -->
