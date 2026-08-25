---
title: "Implementation Summary: Formula Modal i18n Discovery"
description: "Planned FormulaModal FUNCTIONS concat and 24 i18n strings. Not yet implemented in the fork."
trigger_phrases:
  - "formula modal summary"
  - "FUNCTIONS concat"
  - "i18n formula"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/004-formula-ifs-switch-math/002-formula-modal-i18n-discovery"
    last_updated_at: "2026-08-25T19:15:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored discovery child from synthesis rank 5 and final-plan steps 4-5"
    next_safe_action: "Concat help rows at FUNCTIONS init and append eight i18n keys per locale"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-002-formula-modal-i18n-discovery"
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
| **Spec Folder** | 002-formula-modal-i18n-discovery |
| **Completed** | Not yet (Planned) |
| **Level** | 1 |
| **Actual Effort** | Not started |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing in the fork yet. This child is Planned: editor discovery so engine names from child 001 are not invisible.

Planned work concats `formulaIfsSwitchMathHelp` at `FormulaModal.ts:60-105` and appends eight `formula.fn.*.desc` keys in three locales.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Authored | Discovery scope and concat-at-init lock |
| `plan.md` | Authored | FUNCTIONS / i18n call sites |
| `tasks.md` | Authored | Rank-5 / steps 4–5 task list |
| `implementation-summary.md` | Authored | Honest pre-build record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Starts only after `001-formula-ifs-switch-math-module` has `formulaIfsSwitchMathHelp` on disk.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Concat at `FUNCTIONS` declaration, never push later | `FUNCTION_NAMES` is built at load (`FormulaModal.ts:110`) |
| Eight i18n keys, including LOG and SWITCH | Final-plan: T010-style “IFS…CBRT” can drop LOG/SWITCH; the help table needs all eight |
| LOG copy is log10 with optional base | Must not clone LN; unary LOG is `Math.log10` |
| Do not defer this child | Engine-only shipping leaves `IFS(` unhighlighted (REQ-008 lock-in) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| FormulaModal autocomplete lists eight names | Not run (Planned) |
| Three locales × eight keys | Not run (Planned) |
| `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh` on this folder `--strict` | Pending after authoring |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Does not add `LOG2`.** Outside the six-name freeze.
2. **Does not test wrappers.** Child 003 owns vitest; this child is editor registry plus i18n.
3. **24 strings are the long pole.** Match existing `formula.fn.*` sentence style rather than inventing a new help voice.
<!-- /ANCHOR:limitations -->
