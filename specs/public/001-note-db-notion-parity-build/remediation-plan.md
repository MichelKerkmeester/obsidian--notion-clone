# Remediation Plan — Notion-Parity Note Database build

- Date: 2026-08-26
- Scope: residual items after the build + verification + fix stage on branch `impl`
- Status of code defects: **already resolved** in the fix stage (see `synthesis.md` §5). No gate failed; the suite is green (tsc 0, build 0, vitest 232/24). This plan therefore covers what REMAINS — documentation, deferred sub-features, test gaps, and un-run proofs.
- **Do NOT auto-implement.** Each item is surfaced for the operator to schedule. Rankings are by user-facing/integrity impact.

## R1 — Packet-wide completion-doc reconciliation  [P1, documentation]

- **Defect:** every built phase's `spec.md` Status, `implementation-summary.md`, `checklist.md`, and `graph-metadata.json` still read "Planned / 0% / not built," despite shipped, gate-green, Sonnet-verified code. Flagged by all 13 verdicts.
- **Root cause:** the build's in-loop gate approved code per sub-phase but never wrote completion state back into the packet docs; the metadata is derived from those docs, so it stays "planned."
- **Proposed fix:** for phases 002–014 (parents + children), mark `checklist.md` items `[x]` with the real gate evidence (commit hash + tsc/vitest result), set each `implementation-summary.md` to the shipped state (module + call sites + tests, which `synthesis.md` §2 already enumerates), flip `spec.md` Status → Complete, then regenerate `graph-metadata.json` via `backfill-graph-metadata.js`.
- **Re-gate:** `validate.sh specs/public/001-note-db-notion-parity-build --recursive --strict` → Errors 0 Warnings 0.
- **Cost/risk:** large-mechanical (~13 phases × several files), zero code risk. Best done as one dedicated pass; deliberately NOT bundled into the code fix stage.

## R2 — Reports "Saved" field classification  [P2, deferred feature]

- **Defect:** the wired `configure-reports-computed-fields` command auto-detects Income/Expenses → Remaining, but never configures "Saved."
- **Root cause:** Saved requires an operator decision (what a "Sales" rollup means — outflow / income-side / unused) that the current hands-off command has no UI to collect; it safe-defaults to skipping Saved.
- **Proposed fix:** add a small settings/modal step to collect the Sales classification, then let `saveReportsComputedConfig` populate Saved. Until then, users configure Saved via the existing formula editor.
- **Re-gate:** unit test for the classification→config mapping; manual proof on the Reports view.

## R3 — Un-run manual proof sub-phases  [P2, verification artifact]

- **Defect:** the display/create-path proof sub-phases (e.g. 013/003, 014/005, and the other `*-proof` leaves) were never executed/committed; their `implementation-summary.md` still says "not run."
- **Root cause:** proofs are manual matrices; the automated build skipped them, and the Sonnet reviews substituted equivalent evidence (code-path tracing + real tsc/vitest + grep).
- **Proposed fix:** either run the manual matrices and record them, or formally mark them superseded by the Sonnet verification records. Note: 014's un-run proof is exactly what would have caught the (now-fixed) collapsible-CSS defect — worth actually running for 014.

## R4 — Test coverage gaps  [P2, test]

- **Defect:** the 014 record-peek module (`TableRecordPeek.ts`) has no tests; DOM view-renderer paths remain manually verified per house convention.
- **Root cause:** the phase's own tasks never scheduled a test; the repo has no renderer DOM-test convention.
- **Proposed fix:** add unit tests for the peek module's pure logic (open/close/state, hidden-field filtering). The fix stage already closed the two highest-risk gaps (012 cover-guard, 009 coherence).
- **Re-gate:** new tests green in the suite.

## R5 — Cosmetic / low-severity items  [P2/P3]

- Files-column no-op CSS hook classes (`db-file-link-type-*` etc.) have no rules — add file-type visual differentiation, or drop the unused hooks.
- `RowMenu.ts` inlines `{dom?}` instead of the `MenuItemWithDom` alias (style).
- 013's `confirmed`-string branch is currently unreachable (`confirmEnabled:false`) and untested — add a test if/when the optional-confirm path is enabled.
- Per-phase `sonnet-verification.md` files carry the full itemized P2 list.

## Not in scope here

- Merging `impl` → `v4`/`main`: an explicit operator ff-merge gate, not a remediation item.
- The already-fixed code defects (003, 006, 009, 010, 011, 012, 014): see `synthesis.md` §5 for their commits.
