---
title: "Implementation Summary: Reports Remaining/Saved Computed Fields"
description: "Shipped summary for the Reports Remaining/Saved computed-fields phase: built as code (a deviation from the config-only spec) and wired behind a command; gate-green; Saved-field classification still deferred pending operator input."
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
    packet_pointer: "001-note-db-notion-parity-build/003-reports-computed-fields"
    last_updated_at: "2026-08-28T10:54:48.694Z"
    last_updated_by: "swarm"
    recent_action: "Corrected unsupported checklist claims against the shipped code"
    next_safe_action: "Re-run the packet gate after the next code change"
    blockers:
      - "Saved-field classification deferred pending operator input (c766117 commit message)"
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
    completion_pct: 40
    open_questions:
      - "Saved-field classification (needs operator input) — deferred per commit c766117"
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
| **Completed** | 2026-08-26 — shipped on branch `impl`; Sonnet 5 verification CONCERNS (severe) → fixed by `c766117`. Code-complete: the literal manual-testing session (CHK-021) is Deferred, non-blocking, superseded by Sonnet 5 code-level verification — see Known Limitations. |
| **Level** | 2 |
| **Actual Effort** | Shipped as code across 4 commits (estimated: 2 hours / effort S; actual scope grew — see Deviations) |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

**Shipped, but as code — not the config-only deliverable the spec required.** The spec was explicit that this phase should add **zero new `src/` files and zero call-site edits** (`spec.md` Out of Scope), editing only the Reports `db_view` computed-column configuration. The actual build instead added new TypeScript modules and wired a plugin command, without an approved deviation record at build time. This summary documents that deviation honestly rather than reporting the original config-only claim.

Concretely: `src/data/ReportsInspector.ts` (243 lines, commit `6639789`) inspects the live Reports `db_view` and locks Remaining/Saved expressions; `src/data/ReportsComputedConfig.ts` (196 lines, commit `0baacde`) performs the one-transaction config write (Remaining, Saved-if-distinct, `columnOrder`, labels, display-only); `src/data/ReportsDisplay.ts` (commit `6cb5331`, extended by `c766117`) formats the computed values. `DataSource.ts` gained `inspectDatabaseView` and `saveReportsComputedConfig`.

At initial ship (through `6cb5331`), Sonnet 5 verification found this feature **unreachable from any command or UI** (dead code) and an **untested global regression**: `CellRenderer.ts:182` changed the empty-cell guard for every numeric column vault-wide, not just Reports. Both were fixed in follow-up commit `c766117` ("scope the Reports empty-cell guard + wire the Reports config command"): the guard was rescoped to the Remaining/Saved computed columns only, and the inspect/save methods were wired behind a new "Configure Reports computed fields" command with auto-detected Income/Expenses. **Saved-field classification remains deferred, pending operator input** (per the `c766117` commit message) — this is the one open item, not yet resolved.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/ReportsInspector.ts` | Created (`6639789`) | Inspects the live Reports `db_view`; locks Remaining/Saved expressions and blank-vs-zero rules |
| `src/data/ReportsComputedConfig.ts` | Created (`0baacde`), extended (`c766117`) | One-transaction config write: Remaining, Saved-if-distinct, `columnOrder`, human labels, display-only |
| `src/data/ReportsDisplay.ts` | Created (`6cb5331`), extended (`c766117`) | Reports number formatting |
| `src/data/ColumnDisplay.ts` | Edited (`c766117`) | Rescopes the empty-cell guard to Reports computed columns only |
| `src/views/CellRenderer.ts` | Edited (`6cb5331`, rescoped `c766117`) | Empty-cell guard integration for Reports display |
| `src/main.ts` | Edited (`c766117`) | Registers the "Configure Reports computed fields" command with auto-detected Income/Expenses |
| `src/views/DatabaseView.ts` | Edited (`c766117`) | Command UI wiring |
| `ComputedField.ts` / `SafeEval.ts` / `BaseExpression.ts` / `RelationRollup.ts` | Unchanged (verified) | `git diff` empty on all four — satisfies REQ-003's narrow no-engine-change criterion |

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered across four commits on branch `impl`: `6639789` (inspect), `0baacde` (config write), `6cb5331` + `202635d` (display, with a review-concerns fix), and `c766117` (the post-verification fix that scoped the empty-cell guard and wired the previously-dead inspect/save methods behind a command). `computedSyncMode` stays display-only throughout — that part of the original intent held — but the delivery mechanism is plugin code plus a command, not a vault-config-only edit as originally scoped.

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
| Config-only: Reports `db_view` computed columns (as originally planned) | Effort S; no new `src/data/` module; the `EuroFormat.ts` isolated-diff model is N/A because there is no plugin code — **superseded**: the Stage-4 build driver's phase-range filter (`/^(00[2-9]|01[0-4])-/`) treated this phase as a code phase and dispatched task execution into `src/`, overriding the config-only mandate; no approved-deviation record exists from build time. Documented as a deviation below. |
| `LET` / 1M/3M/1Y projections out of this phase | Those formulas depend on later LET support and must not gate Remaining or Saved |
| Depends on `001-live-reports-rollups` and `002-rollup-aggregation-pack` | Formulas need live rollup inputs and the MAX/SUM aggregation pack |
| Mobile-safe, MIT-forkable, no telemetry/secrets | Personal finance vault + MIT plugin fork; config must not call desktop-only APIs |

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:verification -->
## Verification

| Test Type | Status | Coverage | Notes |
|-----------|--------|----------|-------|
| Gate: `tsc --noEmit` / build / vitest | Pass | All four commits | `tsc0/build0/vitest green` at each commit; new-module unit tests 18/18 at Sonnet re-verification |
| Remaining arithmetic on known rollups | Implemented, logic correct | `ReportsInspector.ts:126-154` | Null-guard `IF(OR(...==null), null, ...)` pattern correctly implemented per Sonnet verification; reachable via the `c766117` command wiring |
| Saved/savings from live rollups | **Deferred — classification decision needed** | Reports view | Skip-on-duplicate logic implemented in `ReportsInspector.ts`, but the Saved-field semantics need operator input before this is considered closed (per `c766117` commit message) |
| Manual click-through against known pair (CHK-021) | **Deferred — non-blocking** | Reports view, `configure-reports-computed-fields` command | No witnessed manual session confirming Income=1000, Expenses=400 → 600 by eye; the phase's Complete status rests on the code-level verification below (`ReportsInspector.ts:126-154`, 18/18 unit tests), which is treated as sufficient in its place |
| Display-only persistence check | Pass | Report note file compare | `computedSyncMode` stays `"display-only"` throughout |
| Engine diff empty | Pass | Fork TypeScript | `git diff` empty on `ComputedField.ts`/`SafeEval.ts`/`BaseExpression.ts`/`RelationRollup.ts` — confirmed by Sonnet verification |
| Empty-numeric-cell regression | Fixed | `CellRenderer.ts` / `ColumnDisplay.ts` | Initial ship suppressed the empty placeholder for every numeric column vault-wide; `c766117` rescoped the guard to Reports computed columns only, with new `ColumnDisplay.test.ts` coverage |
| Command reachability | Fixed | `main.ts` / `DatabaseView.ts` | Initial ship left `inspectDatabaseView`/`saveReportsComputedConfig` unreachable (dead code); `c766117` wired them behind a "Configure Reports computed fields" command |

### Test Coverage Summary

| File | Statements | Branches | Functions |
|------|------------|----------|-----------|
| `ReportsInspector.ts` / `ReportsComputedConfig.ts` / `ReportsDisplay.ts` | 18/18 unit tests pass (Sonnet re-verification) | Null-guard, skip-on-duplicate, and empty-cell-guard paths covered | Inspect, save-config, and display-format functions covered |
| `ComputedField.ts` / `SafeEval.ts` | Not in scope (verified unmodified) | Not in scope | Not in scope |

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| NFR ID | Target | Actual | Status |
|--------|--------|--------|--------|
| NFR-P01 | No extra note I/O; use existing computed-column path | Config write is a single transaction (`ReportsComputedConfig.ts`); no new engine or per-cell I/O added | Met |
| NFR-S01 | `SafeEval.ts` sandbox only; no secrets/telemetry | `SafeEval.ts` untouched (`git diff` empty); no telemetry/network code added | Met |
| NFR-R01 | Deterministic display-only values; no YAML mutation | `computedSyncMode` stays `"display-only"`; confirmed no frontmatter writes | Met |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Saved-field classification is deferred** — needs operator input per the `c766117` commit message. This is the one substantively open item from this phase.
2. **Manual-testing session (CHK-021) is Deferred, non-blocking, superseded by code-level verification.** No one opened the Reports view, ran the `configure-reports-computed-fields` command, and confirmed the known-pair result (Income=1000, Expenses=400 → 600) by eye — that literal session never happened. This phase's Complete status does not claim it did: Sonnet 5's line-level code review of `ReportsInspector.ts:126-154` plus 18/18 passing unit tests substitute for that manual step, the same way they substitute for the code-correctness claims elsewhere in this summary. The witnessed click-through remains available as an optional follow-up, not a blocker to this phase's completion.
3. **Architecture deviation, not retroactively re-scoped**: the spec required config-only Reports `db_view` edits with zero new `src/` files; the shipped result is three new modules plus a command. The deviation is documented here and in `research/sonnet-verification.md`, not reverted, since the code path is now wired and tested.
4. `ReportsDisplay.ts` exports `toReportsDisplayNumber`, whose only production call site was reverted in fix commit `202635d`; it is now referenced only by its own test (dead export, non-blocking).
5. 1M/3M/1Y projection formulas that want `LET` are out of scope and wait for later LET support (phase 005).
6. Live rollup correctness is owned by `001-live-reports-rollups` and `002-rollup-aggregation-pack`; this phase only references those columns.
7. IFS/SWITCH and further math expansion belong to successor `004-formula-ifs-switch-math`.

<!-- /ANCHOR:limitations -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

| Planned | Actual | Reason |
|---------|--------|--------|
| Config-only Remaining and Saved on Reports `db_view`; zero new `src/` files; zero call-site edits | Three new modules (`ReportsInspector.ts`, `ReportsComputedConfig.ts`, `ReportsDisplay.ts`) plus edits to `DataSource.ts`, `CellRenderer.ts`, `ColumnDisplay.ts`, `main.ts`, `DatabaseView.ts` | The Stage-4 build driver's `CODE_PHASES` filter treated this phase as a code phase and dispatched task execution into `src/`, overriding the phase's config-only mandate. No approved-deviation record exists from build time — recorded here retroactively as part of this docs reconciliation. |
| Feature reachable via existing UI/command on first ship | Initially unreachable (dead code) — no command, settings entry, ribbon, or modal invoked the new methods | P0 finding at Sonnet 5 verification (2026-08-26); fixed same day in commit `c766117`, which wires a "Configure Reports computed fields" command |
| Empty-cell guard scoped to Reports only | Initial ship suppressed the empty placeholder for every numeric column vault-wide (`CellRenderer.ts:182`), untested | P1 finding at Sonnet 5 verification; fixed in `c766117` with `ColumnDisplay.test.ts` coverage added |
| Empty engine diff | Verified empty — `git diff` on `ComputedField.ts`/`SafeEval.ts`/`BaseExpression.ts`/`RelationRollup.ts` is empty | This narrow criterion was met even though the broader config-only mandate was not |
| Saved-field classification decided in-phase | Still deferred, needs operator input | Explicitly called out as unresolved in the `c766117` commit message; not closed by this docs reconciliation |

<!-- /ANCHOR:deviations -->
