---
title: "Implementation Summary: Remaining Saved Config"
description: "Planned one-transaction Remaining/Saved config child. Not yet written to the Reports db_view."
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
    recent_action: "Authored remaining-saved config child from synthesis and final-plan"
    next_safe_action: "Apply the one config transaction after the 001 inspect record exists"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-remaining-saved-config"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
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
| **Completed** | Not yet (Planned) |
| **Level** | 1 |
| **Actual Effort** | Not started |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing in the vault or fork yet. This child is Planned: Remaining and Saved are specified as one config transaction so `columnOrder` and display-only cannot ship without the formulas they belong to.

Planned mutation is the Reports `db_view` only, via `saveFormula` (`DatabaseView.ts:5678-5705`) or flattened YAML (`DataSource.ts:1041-1062`).

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

Not delivered. Implementation follows `tasks.md` against the live Reports note named in the 001 inspect record. No fork TypeScript.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Keep Remaining, Saved-decision, `columnOrder`, and display-only in one child | Final-plan: one config transaction after inspect; `normalizeColumnOrder` would otherwise append keys last (`ColumnConfig.ts:58-60`) |
| Prefer Formula modal over hand YAML | `saveFormula` writes defs + `type: computed` + `computedKey` together (`DatabaseView.ts:5678-5705`) and still no-ops persistence under display-only |
| Flattened payload, not `schema:` | `toDatabasePayload` writes `computedFields` next to `computedSyncMode` (`DataSource.ts:1041-1062`); `schema.computedFields` is ignored |
| Inherit EuroFormat; no `RemainingSaved.ts` | Spec forbids a new module; cells already format via `ColumnDisplay.ts:63-65` |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Remaining/Saved defs present | Not run (Planned) |
| View `columnOrder` | Not run (Planned) |
| `computedSyncMode: display-only` explicit | Not run (Planned) |
| Engine `git diff` empty | Not run (Planned) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Arithmetic proofs are not this child.** Known-pair 1000-400=600, empty-month `"-"`, mistype, and desktop hash live in `003-reports-display-proof`.
2. **Saved may be absent on purpose.** If inspect skipped Saved, two columns are not a defect.
3. **Fail-closed glyph is `"-"`.** A truly empty cell is out of scope (`CellRenderer.ts:255-257`; `EuroFormat.ts:30-31`).
<!-- /ANCHOR:limitations -->
