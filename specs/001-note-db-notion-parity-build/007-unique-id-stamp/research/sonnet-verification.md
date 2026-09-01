# Sonnet 5 Verification — 007-unique-id-stamp

- Reviewer: Claude Sonnet 5 (read-only; hunter/skeptic/referee adversarial self-check)
- Date: 2026-08-26
- Scope: shipped implementation on branch `impl` (commits `3566ccc`, `576240b`, `e43f5c1`) vs `spec.md` + `research/synthesis.md`
- Gate re-run at review time: `tsc --noEmit` 0; `vitest` 160/160 (incl. new 10-case `UniqueIdStamp.test.ts`); `esbuild production` exit 0

## Verdict

**PASS** — code is correct, complete, and safe. One P1 process finding: packet docs falsely claim the phase is unbuilt.

## Findings

- **Synchronous increment:** `stampUniqueId()` mutates the live `UniqueIdConfig` in place (`src/data/CreateEntryPlan.ts:182-199`); `nextUniqueId` is pure synchronous (`src/data/UniqueIdStamp.ts:29-44`). Verified `entry.config === getActiveDb()` (`DatabaseView.ts:786-788,802-803`), so the mutation lands on the persisted object.
- **Allocate-once across template rebuild:** `DatabaseView.ts:3572-3583`. The guard (`stampUniqueId: template?.engine !== "core"`) is inverted from the literal final-plan wording but provably equivalent — exactly one of the two `buildCreateEntryPlan` calls receives a live `uniqueId`, so one allocation per create (both branches traced).
- **Create-failure rollback:** outer catch restores config when `uniqueIdChanged || registeredGroupOption` and persist hasn't happened (`DatabaseView.ts:3658-3662`); detection via `JSON.stringify` diff against a real deep clone (`cloneDatabaseConfig` at `:933-935`).
- **Persist-failure pairing:** inner catch restores config **and** trashes the created note (`DatabaseView.ts:3642-3650`) — SC-005.
- **Undo does not reissue IDs (adversarially disproven risk):** a combined `registeredGroupOption + uniqueId` create pushes a "config" undo entry that carries `createdFiles` (`DatabaseView.ts:3637`); undo removes the file **before** restoring config (`:9455-9468`) — no duplicate/orphan. The pure `uniqueId`-only path pushes a `type:"created"` entry that never touches config on undo (`:3640, :9397-9399`) — correctly leaves a sequence hole rather than reissuing.
- **Bulk/paste inherit:** paste path (`DatabaseView.ts:8791-8802`) calls `buildCreateEntryPlan(config, defaults)` with no options → stamps by default; each `.map()` iteration mutates the same live object synchronously → sequential IDs. Pre-existing clone/persist/rollback already generalizes over the new field (untouched, correct).
- **Coverage:** synthesis ranks 1–8 implemented; deferred 9–11 + 13th column type correctly absent from the diff.
- **No-regression:** `ColumnTypes.ts`, `EuroFormat.ts` untouched (`git show --stat` all 3 commits); `text` storage reused, no new `ColumnDef.type`.
- **Safety:** `UniqueIdStamp.ts` has zero imports (stricter than "type-only allowed") — mobile-safe; stamp fires only inside `planCreateEntry`; no backfill/scan/sidecar.
- **Tests:** 10 cases — prefix trim/defaults, missing-field defaults, non-object → `undefined` (5 via `it.each`), trailing-hyphen de-dup, invalid counter/padding fallback. Map to spec Scenarios 1/5.

## Remediation candidates
- **P1 (process) — docs falsely "Planned":** `spec.md:53` Status "Planned"; `checklist.md` 0/16 P0, 0/14 P1, "Not yet verified"; parent + 3 children `implementation-summary.md` "not built yet." Contradicts 3 shipped, gate-green, independently-reproduced commits. Reconcile per Completion Verification Rule.
- **P2 (style) — harmless:** `DataSource.ts:828` `parseUniqueIdConfig(source["uniqueId"] ?? database["uniqueId"])` is redundant (`source` already spreads `database` with priority at `:671`). No defect.

## Note on concurrent build
The working tree showed unrelated dirty files (`types.ts`, `ConditionalFormatting.ts`, `styles.css`, `package.json`) from the concurrent phase-010 implementation — not part of this phase's 3 commits, not touched by this read-only review (beyond a harmless `main.js` rebuild during gate verification).
