# Sonnet 5 Verification — 003-reports-computed-fields

- Reviewer: Claude Sonnet 5 (read-only; hunter/skeptic/referee adversarial self-check)
- Date: 2026-08-26
- Scope: shipped implementation on branch `impl` vs `spec.md` + `research/{synthesis,final-plan}.md`
- Gate re-run at review time: new-module unit tests pass (`ReportsInspector`/`ReportsComputedConfig`/`ReportsDisplay` → 18/18)

## Verdict

**CONCERNS (severe)** — the shipped code violates this phase's explicit config-only architecture, the actual Remaining/Saved feature is unreachable from any command/UI (dead code), and an out-of-scope global CellRenderer regression ships untested. **Top remediation item for the packet.**

## Findings

### P0 — Config-only mandate violated
Spec is unambiguous that this phase adds **zero new `src/` files and zero call-site edits** (`spec.md:87-88` Out of Scope; `research/synthesis.md:67`; `research/final-plan.md:25`; `checklist.md:78-79` CHK-013). Yet `impl` adds:
- `src/data/ReportsInspector.ts` (243 lines, commit `6639789`)
- `src/data/ReportsComputedConfig.ts` (196 lines, commit `0baacde`)
- `src/data/ReportsDisplay.ts` (11 lines, commit `6cb5331`)
- New methods `DataSource.ts:513` (`inspectDatabaseView`), `:526` (`saveReportsComputedConfig`)
- `src/views/CellRenderer.ts:14` (import), `:182`, `:2577` (`formatEuroNumber`→`formatReportsNumber`)

A "config-only" phase was reimplemented as a code feature with **no deviation record** anywhere in the packet.

### P0 — Feature is dead code (unwired)
`grep -rn "inspectDatabaseView\|saveReportsComputedConfig" src/` returns only the `DataSource.ts` definitions — no `addCommand`, settings entry, ribbon, or modal invokes either method. REQ-001/SC-001 (Remaining = 600 for Income 1000 / Expenses 400) cannot be exercised through the shipped code. Consistent with every `implementation-summary.md` in the packet still reading "Not yet (Planned)" / "Nothing in the vault or fork yet."

### P1 — Untested global regression in CellRenderer
`CellRenderer.ts:182` changed `if (this.isEmptyValue(value))` → `if (this.isEmptyValue(value) && displayType !== "number")`. `getColumnDisplayType` (`ColumnDisplay.ts:15-27`) returns `"number"` for **every numeric column in every database view** (plain frontmatter numbers, numeric-aggregation rollups, computed-number columns) — not just Reports. Empty numeric cells now skip the `db-empty-value` placeholder and render bare `"-"`. **No `CellRenderer.test.ts` exists** — this app-wide change ships with zero coverage.

### P1 — Documentation dishonesty vs shipped commits
Tasks required the inspect record + formula/Saved decisions recorded "in this packet, not only in chat" (`001-live-reports-inspect/tasks.md:75` T005) and evidence in `checklist.md`/`implementation-summary.md` (`003-reports-display-proof/tasks.md:79` T007). None exists; Open Questions 1–3 unanswered, despite three "tsc0/build0/vitest green" commits.

### P2 — Dead export
`ReportsDisplay.ts:3` exports `toReportsDisplayNumber`; its only production call site was reverted in fix commit `202635d`; now referenced only by its own test.

### Correct in isolation
- REQ-003's narrow criterion (empty `git diff` on `ComputedField.ts`/`SafeEval.ts`/`BaseExpression.ts`/`RelationRollup.ts`) is genuinely satisfied.
- Null-guard formula logic in `ReportsInspector.ts:126-154` correctly implements REQ-007's `IF(OR(...==null), null, ...)` pattern and the Saved skip-on-duplicate rule — but is unreachable.
- New-module unit tests pass (18/18).

## Root cause (for remediation)
The Stage-4 driver's `CODE_PHASES` filter (`/^(00[2-9]|01[0-4])-/`) treated 003 as a code phase and dispatched "implement these tasks into `src/`," overriding the phase's config-only mandate. The compile/test gate cannot detect an architecture violation, so it passed. **Recommended fix path:** revert the three modules + CellRenderer edit; re-scope 003 to its intended config-only deliverable (or record an approved deviation if the code approach is now preferred), and add coverage for the empty-numeric-cell behavior if any part is kept.
