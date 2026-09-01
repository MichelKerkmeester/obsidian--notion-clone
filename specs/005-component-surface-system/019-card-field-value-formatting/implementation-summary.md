---
title: "Implementation Summary: Card Field Value Formatting"
description: "What landed in the card field renderer, and the verification layer that does not exist."
trigger_phrases:
  - "019 implementation summary"
  - "card field formatting summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/019-card-field-value-formatting"
    last_updated_at: "2026-08-30T11:00:00Z"
    last_updated_by: "roadmap-reconciliation"
    recent_action: "Opened for code that landed before this folder existed"
    next_safe_action: "Run the listed verification"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-019"
      parent_session_id: null
    completion_pct: 71
    open_questions: []
    answered_questions: []
---
# Implementation Summary: Card Field Value Formatting

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Status** | In Progress — code landed, no verification of any kind |
| **Completed** | Not complete |
| **Level** | 1 |
| **Landed** | 2026-08-30, no lane required |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Eleven lines in `src/views/card-field-renderer.ts`. The finite-numeric branch of
`renderCardFieldValue` now routes through the shared formatters — `formatEuroCurrency` for a currency
column, `formatEuroNumber` otherwise — instead of falling through to the default string conversion.

Nothing was created. `src/data/euro-format.ts` already existed and four surfaces already called it:
`cell-renderer.ts`, `table-footer-renderer.ts`, `summary-renderer.ts` and `reports-display.ts`. The
card renderer was the one number surface not wired to it, which is why the record sheet showed a
figure one way and the table showed the same figure another.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Directly, with no spec, no acceptance criteria and no check. This folder was opened afterwards.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| Place the branch after the bar and ring returns | Those display styles render their own way and must not be given text. |
| Guard on `Number.isFinite` even though the formatters guard too | The placeholder path stays reachable without depending on the formatter's behaviour for a non-finite input. |
| Assert parity rather than a literal string | A criterion pinning `€ 1.000,24` passes while the table drifts. The operator's report was a comparison, so the criterion measures disagreement. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

**None.** No test references the three formatters anywhere in the repository, and no harness compares
a card's rendered text to a cell's. Every criterion in `acceptance-criteria.md` is unmet, including
the ones whose code has shipped.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

- Three formatters with five calling surfaces have no test. A locale or rounding change would alter
  every number in the plugin and break no check.
- The change crosses a written scope exclusion in the parent spec. Unresolved; `spec.md` §7.
- A longer formatted string can move a text rectangle that `010`'s phone criteria measure. Those
  criteria have not been re-run.
<!-- /ANCHOR:limitations -->
