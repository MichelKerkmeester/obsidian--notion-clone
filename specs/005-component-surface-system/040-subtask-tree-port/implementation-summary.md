---
title: "Implementation Summary [template:level-3/implementation-summary.md]"
description: "Leg a of the subtask tree port lands the data layer — a derived relation, sanitized hydrate, and the single atomic write path — verified green but not yet committed or operator-confirmed."
trigger_phrases:
  - "040 implementation summary"
  - "subtask tree port leg a"
  - "subtask relation hydrate serialize"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/040-subtask-tree-port"
    last_updated_at: "2026-09-03T13:20:00Z"
    last_updated_by: "leg-a-verified"
    recent_action: "Recorded leg a: relation/hydrate/serialize verified green, 47/47"
    next_safe_action: "Implement T008 progress distinction, then T009-T013 renderer affordances"
    blockers:
      - "Not committed: leg a's data-layer modules sit uncommitted in this worktree"
      - "Not operator-confirmed: progress display, renderer affordances and styles (T008-T013) remain unbuilt"
    key_files:
      - "src/data/subtask-relation.ts"
      - "src/data/subtask-hydrate.ts"
      - "src/data/subtask-serialize.ts"
      - "src/data/row-pipeline.ts"
      - "src/data/types.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "040-subtask-tree-port-leg-a"
      parent_session_id: null
    completion_pct: 39
    open_questions: []
    answered_questions:
      - "The subtask relation is a pure derivation over RowData[], never a nested field (ADR-001, decision-record.md)"
      - "parentId/subtaskIds have exactly one write path, the atomic transaction helper in subtask-serialize.ts (ADR-002, decision-record.md)"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core + level3-arch | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 040-subtask-tree-port |
| **Completed** | Not completed — leg a (data layer) only, verified 2026-09-03 |
| **Level** | 3 |
| **LOC Added (leg a)** | ~545 production (472 new files + 73 in `row-pipeline.ts`/`types.ts`), ~801 test |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

This leg ports the normalized parent/child relation `obsidian-pm-main` keeps as a recursive in-memory
tree into this repo's flat, per-note `RowData` model as a pure derivation, plus the one write path
allowed to touch `parentId`/`subtaskIds` in frontmatter. Nothing in this leg touches a renderer: it is
the data layer three consuming surfaces (board, timeline, table/tree) will read from in later legs.

### Subtask Relation, Hydrate and Serialize

`src/data/subtask-relation.ts` derives the relation from `RowData[]` — `buildSubtaskRelation`
(`subtask-relation.ts:30-195`) reads each row's sanitized relation fields and returns depth, ancestor
chains, visibility and cycle diagnostics without mutating any row. `parentId` is authoritative for
membership; a parent's own `subtaskIds` only supplies sibling order. Orphaned parents become roots and
an unresolved child is dropped from its listed parent rather than thrown; a cycle is cut at its
lexicographically smallest member so depth stays finite. `src/data/subtask-hydrate.ts` reads the four
frontmatter fields with sanitizing defaults (`readRelationFields`, `subtask-hydrate.ts:28-35`): a
non-string `parentId` or empty string becomes `null`, non-string/duplicate child ids are dropped
keeping first-occurrence order, and `collapsed` is only ever exactly `true`.

`src/data/subtask-serialize.ts` is the single write path. `writeRelationFields` omits default-valued
keys instead of writing them and never mutates its input. `planSubtaskMove`
(`subtask-serialize.ts:67-186`) is the only function that plans a `parentId`/`subtaskIds` write: it
validates the request, rejects a move that would create a cycle via a visited-set walk up the ancestor
chain (`createsCycle`, `subtask-serialize.ts:188-202`) with zero writes on rejection, and otherwise
returns the full write set — the moved child, both affected parents' `subtaskIds`, and a
parent-scoped sibling rank from the existing base62 manual-order helpers (`generateRanks`/
`rankBetween`), rebalancing the whole sibling scope in the same write set when ranks run dense.

`src/data/types.ts` gains `SubtaskRelationFields`, `SubtaskNode`, `SubtaskDiagnostics`,
`SubtaskRelation`, `SubtaskWrite`, `SubtaskMoveRequest`, `SubtaskMovePlan` and
`SubtaskMoveErrorCode` (`types.ts:172-230`) — `RowData` itself is untouched (ADR-001).
`src/data/row-pipeline.ts` gains one optional stage: `buildWithDiagnostics` takes an
`options.includeRelation` flag (`row-pipeline.ts:89-96`) and attaches `output.relation` only when set
(`row-pipeline.ts:185-201`); `RowPipelineDiagnostics`'s own shape (`row-pipeline.ts:44-53`) is
untouched either way, asserted byte-identical on and off by
`subtask-relation.test.ts`'s `RowPipeline relation stage` suite.

All four modules are rewritten against the reference's architecture (`TaskIndex.ts`, `YamlHydrator.ts`,
`YamlSerializer.ts`, `TaskTreeOps.ts`), not copied — no verbatim block, no code comment carries a spec
path, phase number, task id or requirement id (`rg` scan of the five changed files: no hits).

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/subtask-relation.ts` | Created | Pure derivation: `buildSubtaskRelation` — depth, ancestors, visibility, cycle diagnostics |
| `src/data/subtask-hydrate.ts` | Created | `readRelationFields` — sanitized frontmatter read with safe defaults |
| `src/data/subtask-serialize.ts` | Created | `writeRelationFields` (omit-on-default) and `planSubtaskMove`, the sole atomic write path |
| `src/data/types.ts` | Modified | Added relation types; `RowData`'s own shape unchanged |
| `src/data/row-pipeline.ts` | Modified | Added optional `includeRelation` stage; diagnostics shape unchanged |
| `src/data/subtask-relation.test.ts` | Created | Relation build, cycle, orphan and pipeline-stage tests |
| `src/data/subtask-hydrate.test.ts` | Created | Sanitized-read and round-trip tests |
| `src/data/subtask-serialize.test.ts` | Created | Move/reorder, cycle-rejection and rank-rebalance tests |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:arch-decisions -->
## Architecture Decisions Summary

| ADR | Decision | Status | Impact |
|-----|----------|--------|--------|
| ADR-001 | The subtask relation is a derivation over `RowData`, never a nested field | Proposed | `RowData` stays the single persistence authority; the relation is rebuilt from `RowData[]` on every pipeline change, so it can never drift from frontmatter |
| ADR-002 | A single atomic transaction helper is the only write path for `parentId`/`subtaskIds` | Proposed | `planSubtaskMove` is the only function this leg exposes for a relation-affecting write; a rejected cycle check leaves zero writes, so a cross-parent move can never partially commit |

See `decision-record.md` for full ADR documentation, alternatives considered and the Five Checks
evaluation. Both remain `Proposed`; this leg's green verification is the evidence they were scaffolded
against, not yet the acceptance event itself.
<!-- /ANCHOR:arch-decisions -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Red-first: before the three modules existed, the suite failed with `Cannot find module` against
`subtask-relation.ts`/`subtask-hydrate.ts`/`subtask-serialize.ts` across three suites, no tests run
(`tasks.md` T001, T006). After implementation, a fresh in-runtime reviewer (not the authoring devin
lane) re-ran the full check set from this worktree's actual state rather than trusting the prior
report: `npx vitest run` on the three new suites read 47/47 passed; the project-wide suite read
824/824 passed across 84 files; `npx tsc --noEmit` read 0 errors; `npm run lint` read 169
problems, identical to `HEAD` (`b9e2321`) with none inside any file this leg touched;
`node tools/naming/scan-failing-values.mjs` exited 0 (`PASS — no newly ticked criterion arrived
without its failing value`); `npm run gate` printed all 25 lanes green including `comments` and
`render-assertions`. The cycle guard's rejection behavior was independently exercised, not just
read: `subtask-serialize.test.ts:199-220` parameterizes four cycle shapes (direct descendant,
indirect descendant, own child, self-parent) and asserts the relation and frontmatter are unchanged
after each rejected call. `src/views/*` was confirmed untouched (`git status`/`git diff` both empty
for that tree) — this leg is data-layer only.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:impl-decisions -->
## Key Decisions (Implementation)

| Decision | Rationale |
|----------|-----------|
| `parentId` authoritative for membership; `subtaskIds` only for sibling order | Two sources of truth for the same edge would let a stale `subtaskIds` list disagree with a note's own `parentId`; treating one as authoritative and the other as order-only removes that ambiguity (ADR-001) |
| Orphans become roots; unknown listed children are dropped from diagnostics, not thrown | Frontmatter is untrusted note data; a malformed reference should degrade to a visible root or a diagnostic entry rather than crash the relation build |
| Cycle rejection uses a visited-set walk up the ancestor chain with zero writes | Matches ADR-002's all-or-nothing guarantee: `createsCycle` returns before any write is planned, so a rejected move never partially commits |
| Sibling rank rebalances the whole scope when dense | Reuses the existing base62 manual-order helpers rather than inventing a second ranking scheme for subtasks |
<!-- /ANCHOR:impl-decisions -->

---

<!-- ANCHOR:verification -->
## Verification Results

| Check | Result |
|-------|--------|
| New suites (`subtask-relation\|hydrate\|serialize.test.ts`) | PASS — 47/47, observed fresh 2026-09-03 |
| Full suite (`npx vitest run`) | PASS — 824/824 across 84 files |
| `npx tsc --noEmit` | PASS — 0 errors |
| `npm run lint` | 169 problems, identical to `HEAD`; none in the five changed files |
| `node tools/naming/scan-failing-values.mjs` | PASS, exit 0 |
| `npm run gate` | PASS — 25/25 lanes green, including `comments` and `render-assertions` |
| Cycle-guard behavioral red | 4/4 rejected shapes proved via parameterized test, zero writes on each |
| `src/views/*` scope check | Untouched — confirmed via `git status`/`git diff` |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Progress distinction is not built (T008/SC-004).** Explicit vs. derived progress, and the rule
   that derived never overwrites explicit, is unimplemented; goal.md completion criterion 5 stays
   unticked.
2. **No renderer reads the relation yet (T009-T013).** `board-renderer.ts` and
   `calendar-timeline-renderer.ts` do not yet adapt their move/reorder contracts or lane flattening to
   the relation; depth/expand-collapse UI and inline add are unbuilt.
3. **No `styles.css` change landed.** Depth indentation and the expand/collapse affordance (T013-T015)
   are not yet in the `css-lane` protocol.
4. **Uncommitted and not operator-confirmed.** This leg's five changed files sit uncommitted in this
   worktree; no device or installed-build confirmation has occurred, and `acceptance-criteria.md`'s
   rows remain `Unmet` pending the next leg's work.
<!-- /ANCHOR:limitations -->

---
