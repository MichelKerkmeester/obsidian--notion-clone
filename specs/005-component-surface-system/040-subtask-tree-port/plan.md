---
title: "Implementation Plan: Subtask Tree Port"
description: "Ordered port steps for the normalized subtask relation, hydrate/serialize, atomic move, depth/expand UI, inline add and progress display, following the catalog's gate order."
trigger_phrases: ["040 plan", "subtask tree port plan", "parentId subtaskIds plan"]
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/040-subtask-tree-port"
    last_updated_at: "2026-09-02T23:59:00Z"
    last_updated_by: "markdown-agent"
    recent_action: "Plan authored from adoption-plan row 4's gate order"
    next_safe_action: "Step 1: write the relation fixture check that fails on the current renderer"
    blockers: []
    key_files: ["plan.md", "spec.md"]
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-040-plan"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Subtask Tree Port

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, Obsidian plugin API |
| **Framework** | None (plugin views + custom renderers) |
| **Storage** | Per-note frontmatter (`TFile` + YAML), no external DB |
| **Testing** | Vitest (`npm run test` / `vitest run`) |

### Overview

Port `obsidian-pm-main`'s recursive subtask model into a normalized, DOM-free relation/index over
`RowData[]`, hydrated from and serialized to per-note frontmatter, consumed by the board and timeline
renderers through their existing action-contract seams. `recommend-level.sh --loc 850 --files 8` was
run for the level decision and returned:

```
Recommended Level: 1 (Baseline)
Score: 43/100 | Confidence: 80%
Breakdown:
- LOC (850): +33 points
- Files (8): +10 points
- API changes: +0 points
- Auth changes: +0 points
- DB changes: +0 points
- Architectural: +0 points
Phase Recommendation:
- Phase Score: 10/50 (threshold: 25)
- Recommended: NO
- Factors: 850 LOC
```

`spec.md` §1 records why this packet declares Level 3 against that Level 1 recommendation: the
adoption plan's own 700-1,000 LOC estimate sits inside folder-structure.md §3's Level 3 bucket, and the
work adds an architectural seam (a new relation/index consumed atomically by three renderers), which
the scorer's LOC/file heuristic does not detect.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented (`spec.md`)
- [x] Success criteria measurable (`spec.md` §5)
- [x] Dependencies identified (`spec.md` §6)

### Definition of Done
- [ ] All acceptance criteria in `acceptance-criteria.md` are `Met`, `Waived` or `Superseded`
- [ ] `npm run test` (Vitest) passes for the new relation/hydrate/serialize/transaction tests
- [ ] `npm run gate` prints `gate: PASS` and exits 0
- [ ] `styles.css` lane released with a recapture read, naming changed captures in a `reviewed` array
- [ ] Docs updated (spec/plan/tasks/acceptance-criteria/goal)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
Pure-function derivation layer (relation/index) over an existing flat data model (`RowData[]`), with a
single atomic write path (transaction helper) feeding the existing per-note frontmatter persistence.

### Key Components
- **`src/data/subtask-relation.ts`**: pure derivation — builds `parentId`/`subtaskIds`/depth/ancestors/
  visibility/cycle diagnostics from `RowData[]`. No mutation, no I/O.
- **`src/data/subtask-hydrate.ts`**: reads a note's frontmatter into relation-shaped fields, adapted
  from `YamlHydrator.ts:80-113`, `:127-138`.
- **`src/data/subtask-serialize.ts`**: the single write path — atomic move/reorder transaction plus
  frontmatter serialization, adapted from `YamlSerializer.ts:80-105`, `:126-141` and
  `TaskTreeOps.ts:38-68`, `:108-121`.
- **Board/timeline adapters**: read-only consumers of the relation through the existing action
  contracts (`board-renderer.ts:90-99`, `:750-789`; `calendar-timeline-renderer.ts:391-445`,
  `:704-738`).

### Data Flow
Frontmatter (per note) -> hydrate -> relation/index (derived, in-memory, rebuilt on row-pipeline
change) -> renderers read depth/visibility/progress -> user action (move/reorder/add) -> transaction
helper validates (cycle check) -> writes frontmatter on affected notes -> row-pipeline rebuild ->
relation re-derived. No renderer ever writes `parentId`/`subtaskIds` directly.
<!-- /ANCHOR:architecture -->

---

## FIX ADDENDUM: AFFECTED SURFACES

Applies here because the change touches persistence (frontmatter), shared policy (row-pipeline
diagnostics), and two renderer contracts.

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|---------------|
| `src/data/types.ts` (`RowData`) | Flat per-note record, no relation field | Unchanged shape; relation stays external | `rg -n "subtasks:" src/data/types.ts` returns nothing after the port |
| `src/data/row-pipeline.ts` | Builds rows through search/filter/sort/limit | Add optional relation/index stage after build | `RowPipelineDiagnostics` shape unchanged; new stage tested in isolation |
| `src/data/manual-order.ts` | File-path-keyed base62 ranks | Reused/scoped per parent for sibling order | Existing manual-order tests still pass; new parent-scoped case added |
| `src/views/board-renderer.ts` | Card move/order action contract (`:90-99`) | Extended to carry parent updates | Card move test asserts both parents' `subtaskIds` updated |
| `src/views/calendar-timeline-renderer.ts` | Lane/visible-event flattening (`:391-445`), own group collapse (`:704-738`) | Depth/visibility adapted; collapse state kept separate | Timeline fixture test asserts subtask depth does not toggle timeline group collapse |
| `styles.css` | `.note-database-container` / surface selectors, `--db-*` tokens | Depth-indentation and expand affordance added | css-lane recapture read before release |

Required inventories:
- Same-class producers: `rg -n "parentId|subtaskIds" src/data/` (expect zero hits before this phase's
  first commit; used as the pre-change baseline).
- Consumers of changed symbols: `rg -n "RowPipelineOutput|RowPipelineDiagnostics" . --glob '*.ts'` to
  confirm no consumer assumes the diagnostics shape is exhaustive before adding a stage.
- Matrix axes: relation depth (0/1/2+), cycle (none/direct/indirect), progress (explicit-only/
  derived-only/both-present), move (same-parent reorder/cross-parent move/no-op).
- Algorithm invariant: a move either fully commits (both parents, child, ranks) or fully rejects
  (cycle detected); no partial write. Adversarial case: moving a node under its own grandchild.

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

Follow the ordered tasks in `tasks.md`. It owns the Setup, Implementation and Verification phase
checkboxes and task state. The gate order, matching
`../036-obsidian-pm-ui-harvest/research/research.md:401` ("relation fixtures -> atomic parent move ->
row/timeline/board adapters -> editor/mobile -> `npm run gate`"):

1. **A check that fails on the current renderer (D3: observed red before green).** Before writing the
   relation module, add a Vitest fixture — a 3-level task tree in frontmatter — and a test asserting
   the relation can hydrate it with correct depth/ancestors. Run it first: it fails because
   `src/data/subtask-relation.ts` does not exist yet. Record the failing value (e.g. "module not
   found" or a stub returning `undefined`) before implementing.
2. Implement `subtask-relation.ts` (pure derivation) until step 1's test goes green.
3. Implement `subtask-hydrate.ts` and a hydrate round-trip test against the same fixture.
4. Implement `subtask-serialize.ts`'s atomic move/reorder transaction, with SC-002 (atomic
   cross-parent move) and SC-003 (cycle rejection leaves state unchanged) as the tests that must fail
   red first, then pass.
5. Wire the relation/index stage into `src/data/row-pipeline.ts`, keeping
   `RowPipelineDiagnostics`'s existing shape intact.
6. Adapt `board-renderer.ts` and `calendar-timeline-renderer.ts` read paths (depth, visibility,
   progress) through their existing action-contract seams; add the inline-add-on-Enter path
   (`SubtasksPanel.ts:75-89` adapted) and the explicit-vs-derived progress display (SC-004).
7. `styles.css`: acquire the lane (`tools/lane/css-lane.json`), add depth-indentation and
   expand/collapse styling, capture screenshots via `npm run screenshots`, read the recaptures, then
   release the lane with a `reviewed` array naming the changed captures.
8. `npm run test` (Vitest) for the full new-test set; `npm run gate`.

### External lane order (per parent `goal.md` D14)

1. **Initial pass**: `cli-devin` on `deepseek-v4-flash-max` under `--permission-mode dangerous`
   (operator-approved for this repo's worktree) for the relation/hydrate/serialize/transaction
   implementation (steps 2-4 above).
2. **Second pass**: `gpt-5.6-luna` at `model_reasoning_effort=xhigh` or `max`, `service_tier=fast`,
   through `cli-codex` or `cli-opencode`, for the renderer adapters and UI (steps 5-7).
3. **In-runtime verification (unchanged)**: a fresh Sonnet 5 agent (xhigh; Opus only where genuinely
   better) runs `npm run test`, `npm run gate` and reads the `styles.css` recaptures itself — a
   delegate's report is a claim, not a result. No browser number from a sandboxed or cloud lane is
   evidence.

Before dispatching to `cli-devin`, read
`.opencode/skills/cli-external-orchestration/cli-devin/SKILL.md`; before `cli-codex`, read the
equivalent `cli-codex/SKILL.md` contract, per the CLI dispatch rule.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | `subtask-relation.ts` derivation, `subtask-hydrate.ts`/`subtask-serialize.ts` round-trip | Vitest |
| Integration | Row-pipeline relation stage, board/timeline adapters, atomic move/cycle rejection | Vitest |
| Manual | Depth/expand UI, inline add, progress display on phone and desktop frames | `npm run screenshots`, read by a person |

Comment hygiene reminder for every file touched this phase: no spec path, phase number, task id, or
requirement id in a product code comment. Write the durable why (e.g. why the relation is a derivation
rather than a nested field), never a packet reference. If any substantial reference code/CSS is copied
verbatim rather than rewritten, the MIT notice from
`specs/context/obsidian-pm-main/LICENSE:1-21` goes at the landing point instead of a spec-path comment.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|--------------------|
| `src/data/types.ts` (`RowData`, `ViewConfig`) | Internal | Green | Relation cannot resolve row identity |
| `src/data/row-pipeline.ts` | Internal | Green | No seam to add the relation/index stage |
| `src/data/manual-order.ts` | Internal | Green | No existing rank scheme to reuse for sibling order |
| `037`-`039` port packets (predecessor renderer shapes) | Internal | Yellow (may not be open yet) | Renderer seam line ranges must be re-verified before editing if not yet landed |
| `tools/lane/css-lane.json` | Internal | Green | `styles.css` edits blocked without acquiring the lane |
| `specs/context/obsidian-pm-main` (read-only reference) | Internal | Green | Cited lines must be re-verified if moved |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: `npm run gate` fails after the relation/adapter changes land, or a data-loss bug is
  found in the atomic move transaction (a note's `parentId`/`subtaskIds` diverge from what its
  siblings/parent record).
- **Procedure**: revert the new `src/data/subtask-*.ts` files and the renderer adapter diffs; frontmatter
  already written by the transaction helper during testing is scoped to fixture notes only, never
  product notes, so no frontmatter rollback is needed on real vaults.
<!-- /ANCHOR:rollback -->

---

## L3: DEPENDENCY GRAPH

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌──────────────┐
│  Relation    │────►│ Hydrate/Serialize │────►│  Row-pipeline │────►│  Renderer     │
│  fixtures    │     │  atomic transaction│     │  relation stage│     │  adapters     │
└─────────────┘     └──────────────────┘     └─────────────┘     └──────┬───────┘
                                                                          │
                                                                    ┌─────▼─────┐
                                                                    │ Editor/    │
                                                                    │ mobile UI  │
                                                                    └─────┬─────┘
                                                                          │
                                                                    ┌─────▼─────┐
                                                                    │ npm run    │
                                                                    │ gate       │
                                                                    └───────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| Relation fixtures/tests | None | Failing-red baseline | Relation module |
| `subtask-relation.ts` | Fixtures | Derived depth/ancestors/visibility | Hydrate/serialize |
| `subtask-hydrate.ts` / `subtask-serialize.ts` | Relation module | Atomic move transaction, cycle rejection | Row-pipeline stage |
| Row-pipeline relation stage | Hydrate/serialize | Relation available to renderers | Renderer adapters |
| Board/timeline adapters | Row-pipeline stage | Depth/visibility/progress rendered | Editor/mobile UI |
| Editor/mobile UI (inline add, expand) | Adapters | User-facing subtask interactions | `npm run gate` |

## L3: CRITICAL PATH

1. **Relation fixtures and failing-red test** - short - CRITICAL
2. **`subtask-relation.ts` + hydrate/serialize atomic transaction** - largest single block of the
   700-1,000 LOC estimate - CRITICAL
3. **Row-pipeline stage + renderer adapters** - CRITICAL
4. **Editor/mobile UI + `styles.css` lane + `npm run gate`** - CRITICAL

**Parallel opportunities**: board and timeline adapter work (step 6) can proceed in parallel once the
row-pipeline relation stage (step 5) is stable, since each renderer only reads the relation.

## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|-------------------|--------|
| M1 | Relation + hydrate/serialize | SC-001, SC-002, SC-003 pass | End of steps 1-4 |
| M2 | Renderer adapters + UI | SC-004 passes; board/timeline read the relation | End of steps 5-6 |
| M3 | Verified and gated | `npm run gate` PASS; css-lane released with recapture read | End of step 8 |

---

## L3: ARCHITECTURE DECISION RECORD

See `decision-record.md` for ADR-001 (relation as derivation, not a nested `RowData` field) and
ADR-002 (single atomic transaction helper as the only write path).
