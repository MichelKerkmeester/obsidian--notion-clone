---
title: "Implementation Summary: Reports Remaining/Saved Computed Fields"
description: "Honest unbuilt summary for the Reports Remaining and Saved computed-column phase; design decisions are recorded, implementation is Planned."
trigger_phrases:
  - "reports remaining summary"
  - "remaining saved fields"
  - "computed columns unbuilt"
  - "reports formula config"
  - "display-only computed"
  - "remaining income minus expenses"
  - "savings rollup formula"
  - "planned computed fields"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/003-reports-computed-fields"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "swarm"
    recent_action: "Scaffolded phase 003 docs; status Planned"
    next_safe_action: "Build phase 003 per plan.md and tasks.md"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "note-db-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Summary: Reports Remaining/Saved Computed Fields

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 003-reports-computed-fields |
| **Completed** | Not yet implemented (Planned) |
| **Level** | 2 |
| **Actual Effort** | Not yet implemented (estimated: 2 hours / effort S; see `plan.md`) |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

This phase is **not built yet**. Status is Planned. Scaffold docs exist so Wave 2 can execute after `001-live-reports-rollups` and `002-rollup-aggregation-pack`. Follow `plan.md` and `tasks.md` for the build. The intended result is Reports `db_view` computed columns only: Remaining = `[Income] - [Expenses]`, Saved/savings from live rollup inputs, `computedSyncMode` display-only, native `ComputedField.ts` engine unchanged.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| Reports database note `db_view` computed-column configuration (vault; exact path UNKNOWN until inspect) | Not yet modified (Planned) | Remaining and Saved display-only formulas |
| `ComputedField.ts` (`specs/obsidian/001-notion-finance-migration/build/note-database-fork`) | Unchanged (required) | Existing Excel-style `[field]` multi-pass engine |
| `SafeEval.ts` (same fork) | Unchanged (required) | Existing sandbox; no new `eval` surface |
| `plan.md` / `tasks.md` in this packet | Scaffold only | Build instructions for the unbuilt phase |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not yet delivered. When implementation starts, delivery is vault-config only: edit the Reports `db_view` computed columns, keep `computedSyncMode` display-only, and leave the note-database fork TypeScript untouched. Sequence and checks are in `plan.md` and `tasks.md`.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Use the native Excel-style engine (`ComputedField.ts`), not the Bases `BaseExpression.ts` dialect | The engine already supports `[field]` refs and multi-pass evaluation so a formula can read a rollup; Remaining is ordinary arithmetic |
| Remaining = `[Income] - [Expenses]` | Direct Reports parity for leftover funds from live Income and Expenses rollups |
| Saved/savings is a second display-only computed column fed by live rollup inputs | Same live Income/Expenses/Sales inputs; exact formula string UNKNOWN until `db_view` inspect |
| `computedSyncMode` stays display-only | Avoids Report YAML write-back, iCloud churn, and conflict with display-only rollups |
| No engine changes | Multi-pass rollup references already work; this phase must not expand `SafeEval.ts` or add loops/arrows/`eval` |
| Config-only: Reports `db_view` computed columns | Effort S; no new `src/data/` module; the `EuroFormat.ts` isolated-diff model is N/A because there is no plugin code |
| `LET` / 1M/3M/1Y projections out of this phase | Those formulas depend on later LET support and must not gate Remaining or Saved |
| Depends on `001-live-reports-rollups` and `002-rollup-aggregation-pack` | Formulas need live rollup inputs and the MAX/SUM aggregation pack |
| Mobile-safe, MIT-forkable, no telemetry/secrets | Personal finance vault + MIT plugin fork; config must not call desktop-only APIs |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

| Test Type | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| Remaining arithmetic on known rollups | Pending | Reports view | `[Income] - [Expenses]`; spec Scenario 1 uses 1000 − 400 = 600 |
| Saved/savings from live rollups | Pending | Reports view | Expression UNKNOWN until `db_view` inspect |
| Display-only persistence check | Pending | Report note file compare after render | YAML must not gain formula results |
| Engine diff empty | Pending | Fork TypeScript | `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts` |
| Mobile render | Pending | Mobile Reports view | Same values as desktop; no desktop-only APIs |

### Test Coverage Summary

| File | Statements | Branches | Functions |
|------|------------|----------|-----------|
| Reports `db_view` config | Pending | Pending | Pending |
| `ComputedField.ts` / `SafeEval.ts` | Not in scope (must remain unmodified) | Not in scope | Not in scope |

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| NFR ID | Target | Actual | Status |
|--------|--------|--------|--------|
| NFR-P01 | No extra note I/O; use existing computed-column path | Not yet measured | Pending |
| NFR-S01 | `SafeEval.ts` sandbox only; no secrets/telemetry | Not yet measured | Pending |
| NFR-R01 | Deterministic display-only values; no YAML mutation | Not yet measured | Pending |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

1. The phase is unbuilt; no Remaining or Saved column exists on Reports yet.
2. Exact Saved/savings formula string is UNKNOWN until the current Reports `db_view` is inspected.
3. 1M/3M/1Y projection formulas that want `LET` are out of scope and wait for later LET support.
4. Live rollup correctness is owned by `001-live-reports-rollups` and `002-rollup-aggregation-pack`; this phase only references those columns.
5. IFS/SWITCH and further math expansion belong to successor `004-formula-ifs-switch-math`.

<!-- /ANCHOR:limitations -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

| Planned | Actual | Reason |
|---------|--------|--------|
| Config-only Remaining and Saved on Reports `db_view` | Not yet implemented | Scaffold / Planned; nothing has been built |
| Empty engine diff | Not yet verified | Implementation has not started |

<!-- /ANCHOR:deviations -->
