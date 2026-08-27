---
title: "Implementation Summary: Remaining Saved Config"
description: "Shipped as ReportsComputedConfig.ts, a code module performing the one-transaction Remaining/Saved config write (deviation from the no-new-module plan), gate-green."
trigger_phrases:
  - "remaining saved config summary"
  - "saveFormula"
  - "display-only pin"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/001-note-db-notion-parity-build/003-reports-computed-fields/002-remaining-saved-config"
    last_updated_at: "2026-08-25T19:30:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Shipped commit 0baacde (feat(impl): 002-remaining-saved-config) as ReportsComputedConfig.ts, extended by c766117; tsc0/build0/vitest green"
    next_safe_action: "None — sub-phase complete. Saved-field classification (REQ-004) still deferred pending operator input"
    blockers:
      - "Saved-field classification deferred pending operator input (c766117 commit message)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-remaining-saved-config"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Saved-field classification (needs operator input)"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Summary

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 002-remaining-saved-config |
| **Completed** | 2026-08-26 — commit `0baacde` on branch `impl`, extended by `c766117` |
| **Level** | 1 |
| **Actual Effort** | Shipped as one commit plus a follow-up fix (delivered as a code module, not a hand-YAML/Formula-modal edit — see Deviations in the parent `implementation-summary.md`) |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped in commit `0baacde` on branch `impl`, extended by `c766117`. **Delivered as `src/data/ReportsComputedConfig.ts` (196 lines) — a code module, not a hand `saveFormula`/YAML transaction as originally planned.** This is a deviation from the phase's config-only intent (see parent `implementation-summary.md` Deviations). The module performs Remaining, Saved-if-distinct, view `columnOrder`, and human labels as one transaction, with `computedSyncMode` explicit display-only. The initial ship (`0baacde`) left this unreachable from any command; `c766117` wired it behind a "Configure Reports computed fields" command with auto-detected Income/Expenses.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Authored | Config-transaction scope and requirements |
| `plan.md` | Authored | Flattened payload + EuroFormat inherit |
| `tasks.md` | Authored | T002–T005 atomic unit |
| `implementation-summary.md` | Authored | Honest pre-build record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered as commit `0baacde` on branch `impl`, against the live Reports note identified by the `001-live-reports-inspect` module, then extended by `c766117`. Delivery used new fork TypeScript (`ReportsComputedConfig.ts`), not the originally planned no-new-code path.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Keep Remaining, Saved-decision, `columnOrder`, and display-only in one child | Final-plan: one config transaction after inspect; `normalizeColumnOrder` would otherwise append keys last (`ColumnConfig.ts:58-60`) |
| Prefer Formula modal over hand YAML | `saveFormula` writes defs + `type: computed` + `computedKey` together (`DatabaseView.ts:5678-5705`) and still no-ops persistence under display-only |
| Flattened payload, not `schema:` | `toDatabasePayload` writes `computedFields` next to `computedSyncMode` (`DataSource.ts:1041-1062`); `schema.computedFields` is ignored |
| Inherit EuroFormat; no `RemainingSaved.ts` | Spec forbids a new module — **superseded**: the build shipped `ReportsComputedConfig.ts`/`ReportsInspector.ts`/`ReportsDisplay.ts` instead, per the Stage-4 driver's phase-range treatment (see parent `implementation-summary.md` Deviations); display formatting still inherits `ColumnDisplay.ts:63-65` |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Remaining/Saved defs present | Pass — `ReportsComputedConfig.ts`; confirmed by Sonnet 5 verification (2026-08-26) |
| View `columnOrder` | Pass — Income → Expenses → Remaining → Saved ordering implemented |
| `computedSyncMode: display-only` explicit | Pass — confirmed explicit in the config transaction |
| Engine `git diff` empty | Pass — `ComputedField.ts`/`SafeEval.ts`/`BaseExpression.ts`/`RelationRollup.ts` unchanged |
| Gate: `tsc --noEmit` / build / vitest | Pass — tsc0/build0/vitest green (commits `0baacde`, `c766117`) |
| Reachable from UI/command | Initially dead code (P0 finding); fixed in `c766117` via a new command |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Arithmetic proofs are not this child.** Known-pair 1000-400=600, empty-month `"-"`, mistype, and desktop hash live in `003-reports-display-proof`.
2. **Saved-field classification remains open.** Skip-on-duplicate logic is implemented, but whether Saved should exist as a distinct column (vs. skipped) is deferred pending operator input, per the `c766117` commit message.
3. **Fail-closed glyph is `"-"`.** A truly empty cell is out of scope (`CellRenderer.ts:255-257`; `EuroFormat.ts:30-31`).
<!-- /ANCHOR:limitations -->
