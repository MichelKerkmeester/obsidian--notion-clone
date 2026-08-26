# Sonnet 5 Verification — 008-derived-inverse-relations

- Reviewer: Claude Sonnet 5 (read-only; hunter/skeptic/referee adversarial self-check)
- Date: 2026-08-26
- Scope: shipped implementation on branch `impl` vs `spec.md` + `research/synthesis.md`
- Gate re-run at review time: `tsc --noEmit` exit 0; `vitest` 160/160 (incl. `RelationInverse.test.ts` 12/12)

## Verdict

**CONCERNS** — code is correct, safe, and well-tested; the only real gap is completion-metadata reconciliation.

## Findings

### Correctness — PASS
- Fan-in index (`src/data/RelationInverse.ts:39-87`) reuses the same resolver/dedupe/membership shape as `buildRelationRollups` (`getFirstLinkpathDest` → per-record `seenPaths` → target `recordsByPath`), keyed by `targetDatabaseId`.
- `sourceDatabaseIds` handoff is single-owned: produced in `RelationInverse.ts:42,80` → re-aggregated onto `RelationRollupResult.sourceDatabaseIds` in `RelationRollup.ts:31,85` → merged into the view's **fresh** local `targetIds` Set at `DatabaseView.ts:3377-3384` / `EmbeddedDatabaseRenderer.ts:3235-3242`.
- Self-relation resolves once via `seenPaths` (`RelationInverse.test.ts:193-207`); local-relation-precedence and empty-inbound cases tested (`:283-311, 313-334`).

### Read-only / no dual-write — PASS
- `RelationInverse.ts` imports only types + `parseRelationValues`; grep for `writeQueues`/`enqueueWrite`/`processFrontmatter` in the module returns nothing.
- `enqueueWrite` (`DataSource.ts:105`) stays private, never called from the new module or its call sites.
- `SYNC_WRITES_DEFAULT = false` tripwire present (`RelationInverse.ts:14`), asserted by test (`:248-250`).

### Coverage — correctly scoped
Synthesis items 1 (fan-in index), 2 (rollup-over-inverse), 7 (refresh scoping without a second walker), 8 (self-relation) shipped + tested. Items 3/5/6/9/10 (chip helper, bounded chip window, record-page section, badge, stored two-way) explicitly deferred in `spec.md` §3, matching the locked 2-hunk budget (SC-005).

### No-regression — PASS
- `vitest` 160/160; scoped diff for the three commits (`f371a06^..fdaf730`): `RelationInverse.ts` (new), `RelationInverse.test.ts` (new), `RelationRollup.ts` (+44/-6), `DatabaseView.ts` (+9), `EmbeddedDatabaseRenderer.ts` (+9); `src/data/types.ts` untouched (matches REQ-007/SC-005).
- `buildRelationInverse` lazily memoized once per `buildRelationRollups` call (`RelationRollup.ts:43,71`) — no second vault walk; forward-relation path byte-identical.

### Tests — meaningful
12 cases: empty, cardinality-1, many-to-one union, dangling/cross-db skip, multi-DB fan-in, self-relation dedup, alias/subpath stripping, membership-merge idempotency, `SYNC_WRITES_DEFAULT`, local-relation-precedence, empty-when-no-match.

## Remediation candidates
- **P1 (packet-wide) — completion metadata:** parent + 3 sub-phase `implementation-summary.md`/`tasks.md`/`graph-metadata.json` still read "Planned / 0%" despite three shipped, verified commits. Reconcile per Completion Verification Rule.
- **P2 — clarity nit:** `mergeRelationInverseMembership`'s `sourcePaths` arg is a self-merge no-op at both view call sites (the real work — folding `sourceDatabaseIds` into a distinct `targetIds` Set — is correct and load-bearing). No behavior lost.
- **P2 — verification-plan deviation:** no spy-based test proves the single-`writeQueues`-path claim (SC-001/SC-004); covered structurally instead (no write import in the module — a stronger guarantee than a spy test).

## Note on dispatch framing
The verification prompt characterized this phase as shipping "read-only chips"; the phase's actual locked scope renders inverse values as ordinary rollup cells via `row.computed`, with chips deferred. The agent verified against the real spec — no execution gap; the prompt wording was slightly off.
