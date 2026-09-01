---
title: "Feature Specification: Nowrite Proof Runbook"
description: "Prove live SUM/COUNT accuracy and Report-file byte-equality after a child edit, cover edges, remove diagnostic lists, and lock fork src unchanged."
trigger_phrases:
  - "nowrite proof"
  - "sc-002 byte equality"
  - "benign write runbook"
  - "remove diagnostic list"
  - "scope lock fork"
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
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Feature Specification: Nowrite Proof Runbook

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P0 |
| **Status** | Planned |
| **Created** | 2026-08-25 |
| **Branch** | `001-live-reports-rollups` |
| **Parent Spec** | ../spec.md |
| **Phase** | 6 of 6 |
| **Predecessor** | 005-snapshot-audit-columns |
| **Successor** | None |
| **Handoff Criteria** | SC-001 and SC-002 pass; diagnostic lists removed; fork `src/` unchanged; two-sided maintenance rule written |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
> **Phase 6 of 6** — Parent: [`../spec.md`](../spec.md) · Predecessor: `005-snapshot-audit-columns`. Synthesis rank 7; final-plan steps 10–14. Keep diagnostic `list` columns until accuracy and no-write proof both pass; do not remove them at the same moment SUM is added. Successor `002-rollup-aggregation-pack` locked `src/data/Aggregate.ts` — this child must not pre-create that file.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
Notion rollups are not page storage. Parent SC-002 needs byte-equality of the Report file after a child amount edit, plus a written distinction from startup migrations and user-initiated `updateViewDefFile` (column move/resize) (`DataSource.ts:989-992`). Rollups never write frontmatter (`types.ts:69`). Refresh after a child save coalesces on an 80ms timer (`DataSource.ts:1938-1998`). Bidirectional drift after go-live will silently rot SUMs unless every new child is added on both sides.

### Purpose
Prove SC-001 accuracy against the `list`/`file.name` inventory, prove SC-002 Report-file byte-equality after a child amount edit, cover edge cases, write the benign-write and two-sided-maintenance runbook, then remove diagnostic `list` columns while SUM/COUNT remain. Confirm fork `src/` has no this-phase diffs. Mobile smoke: same vault, same figures (`Platform.isMobile` is UI-only; sole `require("electron")` is export).
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- SC-001: on-screen Income/Expenses/Sales SUM plus COUNT match a manual sum and the `list`/`file.name` inventory (`CellRenderer.ts:656`; `DatabaseView.ts:3388-3399`; `EmbeddedDatabaseRenderer.ts:3198-3209`). Zero-child Report is not deleted.
- SC-002: snapshot Report bytes; edit one related child amount; rollup updates (≤80ms coalesce, `DataSource.ts:1938-1998`); Report bytes identical.
- Document benign writes: startup migrations and user-initiated `updateViewDefFile` (`DataSource.ts:989-992`), not rollup recompute.
- Edges: empty Month omitted; duplicate `[[wikilink]]` counted once (`seenPaths`, `RelationRollup.ts:69-75`); two relation columns over the same children count independently; nested rollup target stays empty (`RelationRollup.ts:101`); Saved still static; COUNT `0` / SUM empty placeholder (do not read SUM empty as `0`).
- Remove diagnostic `list` columns after those proofs; SUM/COUNT remain.
- Ongoing two-sided maintenance rule: new child → Month **and** Report relation, both `[[wikilink]]`, until derived inverses.
- Scope lock: fork `src/` unchanged (parent SC-003).

### Out of Scope
- Pre-creating `src/data/Aggregate.ts` / `RollupAggPack.ts` (successor pack).
- Binding footer SUM as the monthly figure (optional YTD bar only after SC-001, not this child's default).
- Fork `src/` edits.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| Live finance vault Reports `db_view` note `database:` YAML | Modify | Remove diagnostic `list` columns after proofs; SUM/COUNT stay |
| This child's runbook notes (vault or packet scratch when written at build time) | Create | Benign-write distinction plus two-sided maintenance rule |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | SC-001 accuracy | Three on-screen figures match manual SUM and `list`/`file.name`; zero-child Report not deleted (`CellRenderer.ts:656`). |
| REQ-002 | SC-002 no-write proof | After one related child amount edit, the rollup updates on screen and Report file bytes are identical (`types.ts:69`; `DataSource.ts:1938-1998`). |
| REQ-003 | Diagnostic lists removed only after REQ-001 and REQ-002 | SUM/COUNT remain; lists gone. |
| REQ-004 | Fork `src/` unchanged | No this-phase plugin diff (parent SC-003). |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-005 | Benign-write and pairing runbook | Residual Report-file writes are documented as startup migrations and user-initiated `updateViewDefFile` (`DataSource.ts:989-992`), not rollup recompute. New child requires Month **and** Report relation `[[wikilink]]`. |
| REQ-006 | Edges covered | Empty Month omitted; duplicates counted once (`RelationRollup.ts:69-75`); independent relation columns; nested rollup empty (`RelationRollup.ts:101`); Saved static; SUM empty is not `0`. |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: Accuracy proof passed; lists then removed with SUM/COUNT remaining.
- **SC-002**: Report bytes identical after a child amount edit; runbook written.
- **SC-003**: Fork `src/` clean; mobile smoke uses the same vault figures.

### Acceptance Scenarios

- **Given** display-only and bound SUM, **when** a related child amount is edited, **then** the Report rollup updates and Report file bytes stay identical.
- **Given** SC-001 and SC-002 passed, **when** diagnostic `list` columns are removed, **then** SUM/COUNT remain.
- **Given** a nested rollup as target, **when** the cell renders, **then** it stays empty (`RelationRollup.ts:101`).
- **Given** duplicate `[[wikilink]]` to one file, **when** COUNT runs, **then** that path is counted once (`RelationRollup.ts:69-75`).
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | Removing lists when SUM is added | Silent-empty SUM has no inventory | Remove only after SC-001 and SC-002 |
| Risk | Treating view-config saves as rollup writes | False SC-002 failure | Runbook names `updateViewDefFile` (`DataSource.ts:989-992`) |
| Risk | One-sided new children after go-live | Live SUMs silently rot | Two-sided `[[wikilink]]` rule until inverses |
| Dependency | Children 002 display-only and 004 SUM | Cannot prove no-write without both | Deps: display-only pin + bound SUM |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

None blocking this child. Optional YTD footer bar after SC-001 is allowed and is not the monthly figure (`../research/synthesis.md` Q8). Euro-sign vs grouping stays accept-grouping (`ColumnDisplay.ts:18-23`).
<!-- /ANCHOR:questions -->
