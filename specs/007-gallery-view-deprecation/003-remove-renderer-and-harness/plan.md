---
title: "Implementation Plan: Remove the Gallery Renderer and Its Harness"
description: "Delete the renderer and its whole measurement surface in one change, splitting shared capture scenarios rather than deleting them, and prove board coverage did not move."
trigger_phrases:
  - "implementation plan"
  - "gallery removal plan"
  - "007 phase 3 plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Remove the Gallery Renderer and Its Harness

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Node tooling under `tools/` |
| **Framework** | None — esbuild bundle; headless Chrome for the live lanes |
| **Storage** | `viewType` and six `gallery*` fields are persisted vault data |
| **Testing** | Vitest, `npm run gate` (25 lanes), `npm run screenshots`, `npm run replay` |

### Overview

One change removes the renderer and everything that measures it. The order inside that change
matters: classify first (from `001`), split the four board-shared capture scenarios, then delete,
then re-run the **full** capture rather than only the gate's `render-assertions` lane — because
`006`'s equivalent phase found a harness regression that only the full capture caught.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] `002` has **shipped in a release**, and the version number is recorded in `002`'s
      `implementation-summary.md` (parent D8)
- [ ] `001`'s capture classification has landed, so board-shared scenarios are known before anything
      is deleted
- [ ] `006`'s `007-remove-renderer-and-harness/implementation-summary.md` read, including the
      harness regression it caused itself

### Definition of Done
- [ ] All acceptance criteria met
- [ ] `npm run gate` exits 0 read from `$?`, with lanes removed rather than skipped
- [ ] Board captures byte-identical to their pre-change baselines
- [ ] `renderer-coverage.json`'s new floor carries its reason beside the number
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Delete the producer and its observers together. A gate still measuring a removed view is a false
green, which is worse than no measurement — parent D4.

### Key Components

- **The renderer**: `src/views/gallery-renderer.ts`, 787 lines, and its two render branches in
  `database-view.ts` and `embedded-database-renderer.ts`.
- **The bench**: `tools/bench/gallery-render-bench.ts` (225) and `run-gallery.mjs` (30).
- **The coverage ratchet**: `tools/live/renderer-coverage.json`, pinning the renderer and the bench,
  and reading `constructed: 6, total: 21` today.
- **The capture set**: six ids at four theme/device arms. Two gallery-only, four board-shared.
- **The stylesheet**: 81 `db-gallery-*` selectors, some of them inside comma-joined lists shared
  with other views (`styles.css:1188`, `:1411`).
- **The persisted surface**: `DatabaseViewType` and six `gallery*` `ViewConfig` fields, ADR-001's
  subject.

### Data Flow

Nothing new flows. What changes is what observes: the coverage ratchet reads the renderer's hash,
the constructed scenarios mount it, the placement checks measure its DOM. All three stop.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `gallery-renderer.ts` | The producer | delete | `git log --diff-filter=D` |
| `render-assertion-harness.ts` | Constructs the gallery for assertions | update | The harness builds without it; the full capture run passes |
| `renderer-coverage.json` | Ratchets constructed/total | update | The floor moves and carries its reason |
| `constructed-scenarios.mjs` | `constructed-gallery` at `:237`, plus two shared card scenarios citing the renderer | update — delete one, edit two | The two shared scenarios still assert their board half |
| `scenarios/core.mjs`, `scenarios/shared.mjs` | The `gallery-view` and shared card/group scenarios | update | Board arms unchanged by hash |
| `screenshots/manifest.json` | 24 gallery-touching entries | update per `001`'s classification | Board entry hashes unchanged |
| `verify-placement.mjs` | Gallery placement checks | update | Its remaining check count explained, not merely reported |
| `styles.css` | 81 `db-gallery-*` selectors | update | `rg -c 'db-gallery' styles.css` returns 0 |
| `types.ts` | The union and six config fields | update per ADR-001 | The ADR, and a test for whatever it decides |
| `card-field-renderer.ts` | Shared with the board | **unchanged** — parent D5 | `rg -n gallery src/views/card-field-renderer.ts` after the change |
| `gallery-migration.ts` | Still needed by an old vault | **unchanged** in this phase | Its spec still passes |

Required inventories:
- Same-class producers: `rg -ril gallery src tools styles.css` before and after; the delta is the change.
- Consumers of changed symbols: `rg -n 'GalleryRenderer|gallery-render-bench|constructed-gallery' . --glob '*.ts' --glob '*.mjs' --glob '*.json'`.
- Matrix axes: capture id × theme × device — 24 rows, and the four board-shared ids are the ones
  that must survive.
- Algorithm invariant: **a removed lane changes the lane list by name.** Comparing counts is not
  enough; `006`'s `007` saw its count land back at 25 by coincidence and said so.
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
| Unit | Whatever ADR-001 decides about the union; gallery-only specs deleted, shared specs edited | Vitest |
| Integration | The full capture run, not just `render-assertions` — the lane that missed `006`'s regression | `npm run screenshots`, `npm run screenshots:verify` |
| Manual | Board captures read by hand at both themes, because a hash match is not a look | Reading the PNGs |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `002` released | Internal | Red until the cut | This phase does not start. Parent D8 |
| `001`'s capture classification | Internal | Red until `001` lands | REQ-004 is unimplementable |
| Headless Chrome for the live lanes | External | Green locally | A sandboxed lane cannot run them and must not report on them |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: board coverage moved, or the gate went green on a skipped lane.
- **Procedure**: revert the removal commit. The renderer returns with its measurements, because they
  left together. That is the practical argument for one change rather than two.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
001 Audit ──► 002 Redirect+Migrate ──► [release] ──► 003 Remove ──► 004 Docs+Release
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| 001 Audit | None | 002, 003, 004 |
| 002 Redirect+Migrate | 001 | 003 |
| 003 Remove | 002 released | 004 |
| 004 Docs+Release | 003 | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Setup | Low | Read `001`'s classification and `006`'s `007`; under an hour |
| Core Implementation | High | Splitting four shared scenarios is most of it; the deletions themselves are fast. 6-10 hours |
| Verification | High | The full capture run plus the gate plus a by-hand board read. 2-4 hours |
| **Total** | | **9-15 hours** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] Board capture hashes recorded **before** the change, so "unchanged" is a comparison
- [ ] The gate's lane list captured by name before the change
- [ ] No feature flag — a deletion cannot hide behind one

### Rollback Procedure
1. Revert the removal commit; the renderer and its measurements return together.
2. Re-run `npm run gate` and confirm the lane list matches the pre-change names.
3. Re-run `npm run screenshots:verify` and confirm the capture count returns.
4. Tell the operator if a release already carried the removal.

### Data Reversal
- **Has data migrations?** No. `002` owns the data change; this phase deletes code.
- **Reversal procedure**: N/A for data. Code reverts as above.
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Classify    │────►│   Split      │────►│   Delete     │
│  (from 001)  │     │  shared      │     │  renderer +  │
└──────────────┘     │  scenarios   │     │  harness     │
                     └──────────────┘     └──────┬───────┘
                                                 │
                                          ┌──────▼───────┐
                                          │ Full capture │
                                          │ + gate + ADR │
                                          └──────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| Classification | `001` | Which entries are board-shared | The split |
| Split | Classification | Board-only scenarios that still assert their half | The deletion |
| Deletion | Split, `002` released | No renderer, no measurement of it | Verification |
| Verification | Deletion | A gate that is smaller and honest | `004` |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **`002` released** - blocking - CRITICAL
2. **Split the four board-shared scenarios** - 3-5 hours - CRITICAL
3. **Delete renderer, bench, pins, scenarios, CSS, specs** - 2-3 hours - CRITICAL
4. **Full capture run and gate** - 2-4 hours - CRITICAL

**Total Critical Path**: 9-15 hours after the release boundary

**Parallel Opportunities**:
- The CSS sweep is independent of the capture work.
- ADR-001 can be drafted while the scenarios are being split.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | Shared scenarios split | Four board-shared ids assert their board half with no gallery mount | Phase 3 |
| M2 | Renderer and harness gone | `git log --diff-filter=D` names all three deleted files; gate exits 0 | Phase 3 |
| M3 | Coverage floor honest | The new number carries its reason beside it, as `006`'s does | Phase 3 |
| M4 | Board coverage proven unmoved | Board capture hashes identical to the pre-change baseline | Phase 3 |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

### ADR-001: Does `gallery` leave `DatabaseViewType`?

**Status**: Proposed

**Context**: `gallery` sits in the union at `types.ts:317` alongside six `gallery*` `ViewConfig`
fields at `:562-574`. All of it is persisted vault data. `006`'s `007` faced the identical question
for `list` and decided it stays: accepted-but-redirected, migrated permanently.

**Decision**: to be taken in this phase, informed by `001`'s vault count rather than by the
precedent alone.

**Consequences**:
- Keeping it: an unmigrated view lands where the migration chooses rather than where unknown-type
  coercion drops it. `gallery-migration.ts` survives, which is why the scope excludes it.
- Removing it: a smaller type, and a vault that skipped the `002` release gets a card grid coerced
  into a table with no notice — the exact outcome the whole order exists to prevent.

**Alternatives Rejected**:
- **Removing the union value and keeping the config fields**: the worst of both. The fields become
  unreachable and the value becomes unrecognised in the same change.

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
