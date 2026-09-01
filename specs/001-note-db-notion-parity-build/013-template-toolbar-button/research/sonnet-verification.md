# Sonnet 5 Verification — 013-template-toolbar-button

- Reviewer: Claude Sonnet 5 (read-only; hunter/skeptic/referee adversarial self-check)
- Date: 2026-08-26
- Note: built on Luna-via-cursor (the codex OpenAI quota died mid-run; this phase was rebuilt after the executor swap)
- Scope: shipped implementation on branch `impl` (commits `e158b0f`, `f5ed81a`) vs `spec.md` + `research/{synthesis,final-plan}.md`
- Gate re-run at review time: `tsc --noEmit` exit 0; `vitest` 19 files / 194 tests pass

## Verdict

**CONCERNS** — code is correct, composes properly with the 007 unique-ID path, passes a real gate. Only non-code gaps: completion docs still say "Planned," and the `003-create-path-proof` artifact was never recorded.

## Findings

### Correctness — PASS
- Adaptive control (`ToolbarRenderer.ts:1716-1738`): `hasTemplate` toggles `file-plus-2`/"New from template" vs `plus`/"New"; control stays rendered/reachable with zero templates (REQ-001/SC-005).
- Phone density: icon-only only when a template is set on phone; `aria-label`/`title` keep the full string. Matches Scenario 7.
- `TemplateToolbarAction.ts:20-31` (`executeNewFromTemplate`): single `createEntry()` call; confirm branch uses `confirmed !== true` (treats a secondary-button string as non-success).
- Row-menu twin (`RowMenu.ts:83-101`) inside existing `!isReadOnly` + non-calendar/timeline guards, gated on `hasRecordTemplate`; wired at `DatabaseView.ts:569`. No double-create in either host.

### 007 unique-ID composition — CONFIRMED REUSED (not bypassed)
Both hosts' `createEntry` callbacks resolve to `guardedCreateEntry`/`guardedCalendarCreate` → `createBlankEntry` (`DatabaseView.ts:3597-3719`), the single shared create function, which 013's commits never modify (`git show --stat`). So new-from-template entries get 007's stamp (`:3626,:3754`), the core-template rebuild guard, and rollback/trash-on-failure identically. No parallel/bypass engine.

### Coverage / styles.css / Safety
- Synthesis items 1,2,4,5 implemented; item 3 (optional confirm, REQ-004) explicitly deferred (`confirmEnabled:false` at both call sites) per a documented override; items 6–10 correctly excluded (`RecordTemplate.ts`/`CreateEntryPlan.ts` absent from diffs).
- **styles.css: nothing new needed or missing** — reuses pre-existing `db-new-button`/`db-new-button-icon` (committed `styles.css:1323,2904,2914,2919,2924`). The driver CSS-omission root cause does not recur (zero new class names).
- Safety grep (`fetch`/`setInterval`/`setTimeout`/`webhook`) in `TemplateToolbarAction.ts` clean; additive to 3 named seams only; mobile-safe APIs; rollback/trash inherited unmodified.

### Tests
`TemplateToolbarAction.test.ts` covers `hasRecordTemplate`, label/tooltip, create-once/no-create-on-cancel. View-host classes untested per pre-existing house convention.

## Remediation candidates
- **P1 (packet pattern) — docs unreconciled:** `spec.md:53` Status "Planned"; parent + children `implementation-summary.md`/`checklist.md`/`graph-metadata.json` all pre-build, despite gate-green commits. Reconcile.
- **P1 — 003-create-path-proof never executed/committed:** only 2 of 3 sub-phases committed (`003` is a manual-proof step; its matrix was never recorded, `003/scratch/` has only `.gitkeep`). The code substance was independently re-verified here (call-chain trace + real tsc/vitest + safety grep), so this is an artifact gap, not a code defect.
- **P2:** no test for a string-typed confirm result (branch currently unreachable, `confirmEnabled:false`); `RowMenu.ts:97` inlines `{dom?}` instead of the `MenuItemWithDom` alias (cosmetic, pre-existing pattern).
