---
title: "Verification Checklist: Reports Remaining/Saved Computed Fields"
description: "Pending verification checklist for display-only Remaining and Saved computed columns on the Reports view."
trigger_phrases:
  - "reports remaining checklist"
  - "remaining saved verify"
  - "computed fields check"
  - "display-only remaining"
  - "rollup formula verify"
  - "reports computed columns"
  - "no write-back"
  - "native computedfield"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/003-reports-computed-fields"
    last_updated_at: "2026-08-24T00:00:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Reconciled planning docs with final-plan.md review; status Planned"
    next_safe_action: "Build phase 003 per reconciled plan.md/tasks.md once 001 and 002 ship SUM"
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
# Verification Checklist: Reports Remaining/Saved Computed Fields

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: checklist | v2.2 -->

---

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |

<!-- /ANCHOR:protocol -->
---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [ ] CHK-001 [P0] Requirements documented in spec.md and matching the synthesis [EVIDENCE: pending]
  - **Evidence**: Pending implementation. `spec.md` states the synthesis verdict (config-only build), Remaining with a null-guarded default-blank expression `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` (bare subtraction is the zero opt-in; `IFERROR` is a no-op here), Saved as a second `type: number` def that is **skipped by default** if it would duplicate Remaining, explicit display-only `computedSyncMode`, no engine changes, view-level `columnOrder`, `"-"` fail-closed glyph, and mobile/iCloud safety — per `research/synthesis.md` and `research/final-plan.md`.
- [ ] CHK-002 [P0] Technical approach defined in plan.md and matching the locked design [EVIDENCE: pending]
  - **Evidence**: Pending implementation. `plan.md` records the in-memory rollup → `context.derivedValues` → multi-pass evaluation path, the **flattened** on-disk payload shape (`computedFields` + `columns` next to `computedSyncMode`, NOT under `schema:`; `DataSource.ts:1041-1062`) with Formula-modal (`saveFormula`) preferred delivery, view-level `columnOrder` (`ColumnConfig.ts:64-74`), the null-guarded default-blank expression, the inherit-don't-clone EuroFormat call sites (`views/CellRenderer.ts:13`, `:198`, `:2576`; `views/SummaryRenderer.ts:7`, `:556`), and the locked verification set.
- [ ] CHK-003 [P1] Dependencies identified and available; live columns inspected before any formula is written [EVIDENCE: pending]
  - **Evidence**: Pending. Hard predecessors are `001-live-reports-rollups` (SUM rollups) and `002-rollup-aggregation-pack` (SUM aggregation — MAX not required). Exact `col.label`/`col.key` strings, Sales' meaning, the note path, and current `columns`/`computedFields`/`views[].columnOrder`/`views[].hiddenColumns` must be recorded in one inspect before T002 runs (`ComputedField.ts:563-564` matches label or key).

<!-- /ANCHOR:pre-impl -->
---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Config parses and uses native syntax only [EVIDENCE: pending]
  - **Evidence**: Pending. The Reports `db_view` payload must parse cleanly with **flattened** `computedFields` + `columns` next to `computedSyncMode` (NOT nested under `schema:`; `DataSource.ts:1041-1062`) — or be applied via the Formula modal (`saveFormula`, `DatabaseView.ts:5678-5705`). Two `computedFields` entries (`key: remaining`, `key: saved` unless Saved is skipped, both `type: number`) plus matching `type: computed` columns with `computedKey`. Expressions use native `[field]` refs — no `expressionSyntax: "base"`, no Bases chaining.
- [ ] CHK-011 [P0] No console errors or warnings on a valid row [EVIDENCE: pending]
  - **Evidence**: Pending. Reports view must evaluate Remaining and Saved without formula-engine warnings for rows whose live Income/Expenses rollups are numeric.
- [ ] CHK-012 [P1] Error handling stays fail-closed with zero engine patches [EVIDENCE: pending]
  - **Evidence**: Pending. A mistyped ref such as `[Incme] - [Expenses]` must produce the engine's localized error string and a `null` cell with no persistence (`ComputedField.ts:508-546`) — never a `SafeEval.ts` edit or a YAML fallback value.
- [ ] CHK-013 [P1] No new plugin module or call site; config-only pattern respected [EVIDENCE: pending]
  - **Evidence**: Pending. No `RemainingSaved.ts` or fourth formatting call site may appear. Remaining/Saved ride the existing CellRenderer/SummaryRenderer path via `row.computed[col.computedKey || col.key]`.

<!-- /ANCHOR:code-quality -->
---

<!-- ANCHOR:testing -->
## Testing

- [ ] CHK-020 [P0] All acceptance criteria met [EVIDENCE: pending]
  - **Evidence**: Pending. REQ-001 through REQ-007 in `spec.md` (Remaining arithmetic, display-only sync, untouched engine, Saved from live rollups, mobile/iCloud-safe, column order/labels, blank-fail-closed) are unverified.
- [ ] CHK-021 [P0] Manual testing complete against the known pair [EVIDENCE: pending]
  - **Evidence**: Pending. Desktop Reports view must show Remaining 600 for a row with Income=1000 and Expenses=400; Saved shows its inspected expression's expected value and survives a view refresh.
- [ ] CHK-022 [P1] Edge cases tested per the synthesis list [EVIDENCE: pending]
  - **Evidence**: Pending. Cover: missing/non-numeric Income or Expenses — bare `[Income] - [Expenses]` yields `0` because `Number(null) === 0` (`SafeEval.ts:962-1108`), so the null-guarded default `IF(OR(... == null), null, …)` is required to render the `"-"` glyph (`CellRenderer.ts:255-257`; `EuroFormat.ts:30-31`); currency strings `"1,000"`/`$400` still subtract (`coerceValue`, `ComputedField.ts:590-597`); definition order irrelevant (multi-pass convergence, `ComputedEvaluator.ts:48`); Sales unused by Remaining allowed and never rollup-of-rollup (rejected at `RelationRollup.ts:101`); Saved skipped if it would duplicate Remaining.
- [ ] CHK-023 [P1] Blank-vs-zero decision recorded and validated [EVIDENCE: pending]
  - **Evidence**: Pending. Default is native blank via the null-guarded `IF(OR([Income] == null, [Expenses] == null), null, [Income] - [Expenses])` (renders `"-"`). Numeric zero is the **bare** `[Income] - [Expenses]` opt-in (where `Number(null) === 0`). Do **not** use `IFERROR(..., 0)` — it is a no-op on a finite `0` (`ComputedField.ts:294-304`). The empty-month proof (T008) must show `"-"` under the default and `0` under the opt-in, with no YAML write either way. The decision must be recorded in this packet.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-024 [P0] Requested Remaining and Saved columns configured, ordered, and labeled [EVIDENCE: pending]
  - **Evidence**: Pending. Only the Reports `db_view` configuration changes; Remaining (and Saved, if not skipped) exist as computed fields/columns ordered Income → Expenses → Remaining → Saved on the **view** `columnOrder` (`ColumnConfig.ts:64-74` — not the `columns` array, since `normalizeColumnOrder` pushes unknown keys last), with the new keys kept out of `hiddenColumns` (`:100-101`), each with a human label (`types.ts:102-104`).
- [ ] CHK-025 [P1] Formula engine and rollup modules left unchanged [EVIDENCE: pending]
  - **Evidence**: Pending. `git diff` empty on `ComputedField.ts`, `SafeEval.ts`, `BaseExpression.ts`, and `RelationRollup.ts` under `specs/obsidian/001-notion-finance-migration/build/note-database-fork`.
- [ ] CHK-026 [P0] Desktop persistence + display-only proven; mobile parity operator-optional [EVIDENCE: pending]
  - **Evidence**: Pending. P0 proof: Report note byte-hash taken before and after open+scroll on **desktop** must be identical, and `computedSyncMode: display-only` must be explicit in the flattened payload (sole writer `syncComputedForFile` is inert while display-only — `DatabaseView.ts:10244`). Mobile/two-device hash is operator-optional, not a single-implementer blocker (no Platform gate exists on computed/rollup evaluation; the two `DatabaseView.ts` Platform checks concern icon editing and bulk-editor dismissal only).

<!-- /ANCHOR:fix-completeness -->
---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets or telemetry [EVIDENCE: pending]
  - **Evidence**: Pending. Formulas are arithmetic `[field]` expressions; no secrets, no telemetry, no network surface added by vault config.
- [ ] CHK-031 [P0] Evaluation stays inside the existing sandbox [EVIDENCE: pending]
  - **Evidence**: Pending. `SafeEval.ts` remains the evaluation surface (no arrows, no loops, no `eval`); this phase adds no new evaluation code path anywhere.
- [ ] CHK-032 [P2] Auth/authz working correctly [EVIDENCE: pending]
  - **Evidence**: Pending. Not applicable to local vault computed columns; confirm no auth surface was added.

<!-- /ANCHOR:security -->
---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks/checklist synchronized with the synthesis and final-plan review [EVIDENCE: pending]
  - **Evidence**: Pending implementation evidence. All four docs derive from `research/synthesis.md` and are reconciled with `research/final-plan.md`: the null-guarded default-blank expression (replacing the wrong `IFERROR` opt-in), the flattened on-disk payload / Formula-modal delivery, view-level `columnOrder`, Saved default-skip-on-duplicate, mobile/two-device as operator-optional, merged tasks (T001 inspect; T002 config transaction; T003–T006 deferred), and no stale research pointers (research references point to this phase's `research/synthesis.md`, `research/research.md`, and `research/final-plan.md`).
- [ ] CHK-041 [P1] Config comments adequate [EVIDENCE: pending]
  - **Evidence**: Pending. If any comment is added to the vault YAML, it must state the durable why (display-only remaining/savings from live rollups, iCloud safety) and must not embed spec paths, packet numbers, or requirement ids.
- [ ] CHK-042 [P2] README updated (if applicable)
  - **Evidence**: Pending. No README change is required for vault `db_view` config; defer unless a vault/plugin README already documents Reports columns.

<!-- /ANCHOR:docs -->
---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only [EVIDENCE: pending]
  - **Evidence**: Pending. Implementation must not leave scratch copies of Reports YAML outside the vault note and this packet.
- [ ] CHK-051 [P1] scratch/ cleaned before completion [EVIDENCE: pending]
  - **Evidence**: Pending. This packet directory must contain the five authored docs plus `research/` only; no leftover dumps of `db_view` config or hash logs.

<!-- /ANCHOR:file-org -->
---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 10 | 0/10 |
| P1 Items | 10 | 0/10 |
| P2 Items | 2 | 0/2 |

**Verification Date**: Pending (not yet implemented)
**Verified By**: Pending

<!-- /ANCHOR:summary -->
