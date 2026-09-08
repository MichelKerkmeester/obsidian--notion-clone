---
title: "Implementation Plan: Consolidate test/fixture data into one testbed database plus the restored Finance databases"
description: "Collapse the ten generated fixture databases into one Testbed database, repoint every harness mount, keep the 070 Finance fixture as the second dataset, and hold the result in place with a registry suite."
trigger_phrases:
  - "implementation plan"
  - "technical approach"
  - "architecture decisions"
  - "testing strategy"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Consolidate test/fixture data into one testbed database plus the restored Finance databases

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (the plugin, esbuild) + plain-ESM tooling under `tools/` run by node directly |
| **Framework** | No application framework changes — this packet touches fixture data and the harnesses' mounts, not shipped code |
| **Storage** | The fixture catalogue (`tools/mock-data/`), its committed outputs (`catalogue.json`, the CSV export), and the note/record shape the plugin reads from a vault |
| **Testing** | vitest (unit), the headless-Chrome harness lanes, the capture pipeline, and the one gate that runs them all |

### Overview
The ten domain-flavoured vocabularies in `tools/mock-data/use-cases.ts` collapse to one `testbed`
vocabulary; the catalogue machinery that guaranteed their shared column coverage stays as the
guarantee. Every harness mount that names a use case (`tools/live/render-assertions.mjs`,
`render-assertion-bundle.mjs`) repoints to the one; the note the vault emitter writes gains a
deliberately sorted-and-filtered second table so the consolidated database exercises filters and
sorts, not only columns and view types; the 070 packet's Finance cold-cache fixture stands
untouched as the second, kept dataset; a new registry suite runs red against the old tree first and
holds the one-dataset rule afterwards.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented (spec.md; the operator's directive recorded in goal.md)
- [x] Success criteria measurable (SC-001's before/after counts; SC-002's harnesses-green-with-no-fixture-left)
- [x] Dependencies identified (070's fix, landed at `a75a1ae2`; the vendored reference plugin, already present or documented-absent by the freshness gate)

### Definition of Done
- [x] All acceptance criteria met (`acceptance-criteria.md`, all four Met with observed evidence)
- [x] Tests passing — 154 files / 1678, including the new registry suite 6/6
- [x] Docs updated (spec/plan/tasks, acceptance criteria, decision record, implementation summary, the operator's proposal note, the 005 handover)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Data-source → schema builder → emitters, with the harness mounts as a fourth consumer. The point of
the topology is that nobody but the catalogue decides shape, so consolidation means changing the
vocabulary, not the topology.

### Key Components
- **`use-cases.ts`**: the one vocabulary — titles, option colours, value pools, the deliberately
  full and sparse record positions named in the titles themselves.
- **`catalogue.ts`**: untouched facet list (all 13 plugin column types + the 5 display variants),
  the shared date anchor, the seeded record builder (record 0 now fills every written facet, the
  chances still roll), the view builder (five surviving types + the second, narrowed table).
- **`emit-obsidian.ts` / `emit-portable.ts`**: the note and portable outputs; the note's view block
  now carries a view's own sort and filter where it declares them.
- **`tools/live/render-assertions.mjs` + `render-assertion-bundle.mjs`**: the mount registries;
  every `catalogueUseCase` now reads `testbed`, the rhythm lane collapsed from two populations to
  one, the empty-state probes keep their names.
- **`tools/mock-data/consolidation.test.mjs`**: the registry suite — one database, every mount on
  it, survivors only, Finance second dataset present, full and sparse records guaranteed.

### Data Flow
`use-cases.ts` → `catalogue.ts` → { `emit-obsidian.ts` → the note/record shape the plugin reads;
`emit-portable.ts` → `catalogue.json` + the CSV; `catalogue-scenario.ts` → the harness mounts } →
the registries' scenarios → the render-assertion lanes, the bench/reference inputs, the capture
corpus's fingerprints. Anything the consolidated dataset changes re-measures by its own tool; no
artefact's numbers are edited by hand.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

This packet is a consolidation, not a bug fix, but the consumer inventory this section demands is
the heart of the work, so it is recorded here rather than skipped.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `tools/mock-data/use-cases.ts` | The vocabulary each generated database is dressed in | update (ten → one) | `catalogue.test.mjs` + `consolidation.test.mjs` |
| `tools/mock-data/catalogue.ts` | The only shape-decider: facets, records, views | update (record-0 always-fill, forced relation, optional view sort/filter, the sixth view) | both suites; the generator's coverage report: 13 column types, 24 neutral types, 6 views |
| `tools/mock-data/emit-obsidian.ts` | The note the plugin reads | update (sort/filter written through, both representations agreeing) | the note assertions in `catalogue.test.mjs`; the vault-containment and one-line-YAML guards |
| `tools/live/render-assertions.mjs`, `render-assertion-bundle.mjs` | The mount registries | update (every mount reads `testbed`; lane names follow) | the registry suite's mount assertion; the lanes' own structural checks, all PASS |
| `tools/mock-data/catalogue.json`, `tools/mock-data/csv/*.csv` | The portable outputs | regenerate; ten retired CSVs deleted | the generator's determinism tests; `consolidation.test.mjs`'s one-database assertion |
| `tools/mock-data/anytype/*` | The Anytype loaders and their reports | loaders unchanged (they iterate the catalogue); reports untouched | the loaders' report-reading is guarded by their own run; the reports' staleness documented in `anytype/README.md` |
| `tools/screenshots/`, story files, the bench, the smoke lanes | Lanes whose inline bodies mount no use case | unchanged | verified by reading every mount and import; recorded as ADR-0003 |
| `src/**`, `styles.css`, `main.js` | The shipped plugin | unchanged | the worktree diff contains no `src/` path; `npm run build` reproduces `main.js` byte-for-byte |

Required inventories:
- Same-class producers: every producer of catalogue data — the catalogue, its three emitters, the
  two registries, the Anytype loaders — read and recorded in the tasks' inventory (rows 1–8).
- Consumers of changed symbols: every `catalogueUseCase:` reference and every use-case id in code
  (the nine retired ids) — the ones that remained are the two registries, now repointed and
  enforced; the prose-only mentions were rewritten where they would otherwise lie.
- Matrix axes: dataset × consumer × fate, the eight inventory rows; the consolidation's own matrix
  is 36 records × 28 columns × 6 views.
- Algorithm invariant: determinism — same seed, byte-identical outputs; different seed, same
  record identities. Both were existing assertions and both still pass.

<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase checkboxes and task state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | The catalogue's shape, counts, coverage, determinism, vault containment; the consolidation registry | vitest (`catalogue.test.mjs`, `consolidation.test.mjs`) |
| Harness | The shipped renderers over the consolidated mounts — rhythm, wrap, board geometry, calendar ink, frozen columns | `tools/live/render-assertions.mjs` |
| Visual | The whole capture corpus, swept twice, deltas decoded | `npm run screenshots` ×2, the scratchpad pixel-delta, `screenshots:verify` |
| Evidence | Every recorded artefact against the tree it claims to describe | `node tools/live/evidence.mjs --check-all` |
| Gate | Everything, once | `npm run gate` |

The one manual lane that remains is the operator's: their own device, their own Finance databases,
their own adoption of `testbed-proposal.md`. This packet deliberately leaves those rows theirs.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| 070-ios-view-data-regression's fix | Internal packet, this packet's AC-004 precondition | Green — landed at `a75a1ae2`; main head `f91370f1` carries it | AC-004's "restored" premise would be unproven; the cold-cache lane and the Finance fixture documentation would wait |
| The vendored reference plugin (`specs/context/…`, gitignored by design) | External, reference lane only | Either present (measured) or documented-absent (the freshness gate's documented shape of a fresh checkout) | Reference captures would re-derive, not compare; no part of the consolidation depends on it |
| Playwright-core + the system Chrome | Harness | Green — every lane in this packet's ladder ran | The headless lanes cannot run; the unit suites and the registry would still hold the consolidation, but the fixture-changing discipline's sweep could not |

<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: a harness lane's pass/fail criteria failing against the consolidated mounts in a way
  the numbers themselves cannot explain (i.e. the lanes were silently measuring a different thing,
  not merely different values), or the gate going red after landing.
- **Procedure**: the consolidation is one worktree commit on top of `f91370f1` — `git revert` of
  that commit restores the ten-vocabulary tree, the retired CSVs, the registries and the docs in
  one step; the regenerated evidence artefacts (`renderer-coverage`, `touch-targets`,
  `unstyled-links`, `capture-device-parity`, the gate's timestamp-only stamps) then re-measure
  against the restored inputs by their own tools, never by editing their numbers.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Phase 1 (Inventory) ──► Phase 2 (Design + implement) ──► Phase 3 (Verify + document)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Inventory (T001) | None | Design, Implement |
| Design + implement (T002–T007) | Inventory; 070's landing for the second-dataset premise | Verify |
| Verify + document (T008–T010) | Implement | Closure (the fresh verifier's; then the operator's on-device rows) |

<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Inventory | Medium — every mount and import read, not grepped-and-trusted | as recorded: the largest single piece of reading in the packet |
| Implement | Medium — one vocabulary, the always-fill and narrowed-view mechanics, the registries | as recorded |
| Verification | High — the ladder, two full capture sweeps, the evidence re-measures, the gate | as recorded: two capture sweeps dominate the wall-clock |
| **Total** | | landed in one session, 2026-09-08; the honest unit is the checks, and they are all exit 0 |

<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [x] Backup — the baseline is the commit this worktree branched from (`f91370f1`); nothing outside the repository was written
- [x] Feature flag — n/a: fixture data, no shipped code, no flag to flip
- [x] Monitoring — the gate is the monitor, and it ran once, green, 27/0

### Rollback Procedure
1. `git revert` the consolidation commit (one commit; see §7).
2. Re-run the evidence writers whose inputs the revert restores.
3. Re-run `npm run screenshots` once — the corpus returns to the pre-consolidation pixels, which are the committed ones.
4. Nothing user-facing changes: the plugin's shipped surface never moved.

### Data Reversal
- **Has data migrations?** No — the only generated artefacts are repository files, replaced wholesale by the revert; the operator's vault folder was never written, so there is nothing in the vault to reverse.

<!-- /ANCHOR:enhanced-rollback -->

---

