---
title: "Implementation Summary [template:level-3/implementation-summary.md]"
description: "Leg a lands the data layer — a derived relation, sanitized hydrate and the single atomic write path — leg b puts the tree on the board and the timeline, and leg c closes the same-parent drag's rank-only gap and adds the host-binding test harness leg b's close-out left open."
trigger_phrases:
  - "040 implementation summary"
  - "subtask tree port leg a"
  - "subtask tree port leg b"
  - "subtask tree port leg c"
  - "subtask relation hydrate serialize"
  - "subtask board timeline display"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/040-subtask-tree-port"
    last_updated_at: "2026-09-03T23:35:00Z"
    last_updated_by: "in-runtime-verifier"
    recent_action: "Closed both leg-b gaps in-runtime: drag routes through moveSubtask, harness added"
    next_safe_action: "Operator device confirmation of the tree UI is the packet's only open item"
    blockers:
      - "Not operator-confirmed: no device or installed-build confirmation of the tree UI has occurred"
    key_files:
      - "src/data/subtask-relation.ts"
      - "src/data/subtask-serialize.ts"
      - "src/views/board-renderer.ts"
      - "src/views/calendar-timeline-renderer.ts"
      - "src/views/database-view.ts"
      - "src/views/embedded-database-renderer.ts"
      - "src/views/database-view.test.ts"
      - "src/views/embedded-database-renderer.test.ts"
      - "tools/screenshots/scenarios/temporal.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "040-subtask-tree-port-leg-c"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions:
      - "The subtask relation is a pure derivation over RowData[], never a nested field (ADR-001, Accepted, decision-record.md)"
      - "parentId/subtaskIds/subtaskRank have exactly one write path, the atomic transaction helper in subtask-serialize.ts, reached by every mover including the same-parent drag (ADR-002, Accepted, decision-record.md)"
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
| **Completed** | Both legs landed and verified 2026-09-03; leg b's two open rows closed and in-runtime verified the same day; not operator-confirmed |
| **Level** | 3 |
| **LOC Added (leg a)** | ~545 production (472 new files + 73 in `row-pipeline.ts`/`types.ts`), ~801 test |
| **LOC Added (leg b)** | ~530 production across `src/data/*` and the four view files, ~130 CSS, ~180 test and fixture |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

### Leg A — The Data Layer

Leg a ports the normalized parent/child relation `obsidian-pm-main` keeps as a recursive in-memory
tree into this repo's flat, per-note `RowData` model as a pure derivation, plus the one write path
allowed to touch `parentId`/`subtaskIds` in frontmatter. Nothing in it touches a renderer: it is the
data layer the consuming surfaces read from, and the Leg B section below is where they start doing so.

### Subtask Relation, Hydrate and Serialize

`src/data/subtask-relation.ts` derives the relation from `RowData[]` — `buildSubtaskRelation`
(`subtask-relation.ts:37-230`) reads each row's sanitized relation fields and returns depth, ancestor
chains, visibility and cycle diagnostics without mutating any row. `parentId` is authoritative for
membership; a parent's own `subtaskIds` only supplies sibling order. Orphaned parents become roots and
an unresolved child is dropped from its listed parent rather than thrown; a cycle is cut at its
lexicographically smallest member so depth stays finite. `src/data/subtask-hydrate.ts` reads the four
frontmatter fields with sanitizing defaults (`readRelationFields`, `subtask-hydrate.ts:28-35`): a
non-string `parentId` or empty string becomes `null`, non-string/duplicate child ids are dropped
keeping first-occurrence order, and `collapsed` is only ever exactly `true`.

`src/data/subtask-serialize.ts` is the single write path. `writeRelationFields` omits default-valued
keys instead of writing them and never mutates its input. `planSubtaskMove`
(`subtask-serialize.ts:88-207`) is the only function that plans a `parentId`/`subtaskIds` write: it
validates the request, rejects a move that would create a cycle via a visited-set walk up the ancestor
chain (`createsCycle`, `subtask-serialize.ts:209-223`) with zero writes on rejection, and otherwise
returns the full write set — the moved child, both affected parents' `subtaskIds`, and a
parent-scoped sibling rank from the existing base62 manual-order helpers (`generateRanks`/
`rankBetween`), rebalancing the whole sibling scope in the same write set when ranks run dense.

`src/data/types.ts` gains `SubtaskRelationFields`, `SubtaskNode`, `SubtaskDiagnostics`,
`SubtaskRelation`, `SubtaskWrite`, `SubtaskMoveRequest`, `SubtaskMovePlan` and
`SubtaskMoveErrorCode` (`types.ts:172-249`) — `RowData` itself is untouched (ADR-001).
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
| ADR-001 | The subtask relation is a derivation over `RowData`, never a nested field | Accepted | `RowData` stays the single persistence authority; the relation is rebuilt from `RowData[]` on every pipeline change, so it can never drift from frontmatter |
| ADR-002 | A single atomic transaction helper is the only write path for `parentId`/`subtaskIds` | Accepted | `planSubtaskMove` is the only function that plans a relation-affecting write, and `moveSubtask` is now the only function every mover (drag, mobile menu, timeline) calls to apply one; a rejected cycle check leaves zero writes, so a move can never partially commit |

See `decision-record.md` for full ADR documentation, alternatives considered and the Five Checks
evaluation. Both moved from `Proposed` to `Accepted` on 2026-09-03: the same-parent drag was the last
caller outside the single write path (Known Limitation 1 below), and closing it is what made ADR-002's
"only write path" claim true of the whole codebase rather than of `subtask-serialize.ts` alone.
<!-- /ANCHOR:arch-decisions -->

---

<!-- ANCHOR:how-delivered -->
## How Leg A Was Delivered

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
## Verification Results (Leg A)

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

<!-- ANCHOR:leg-b -->
## Leg B — The Tree on the Board and the Timeline

Leg a stopped at the data layer and said so; this leg is the display half. Both renderers build the
relation from the rows they already hold and read it — they never write it, and the only write they
can reach is `planSubtaskMove`'s plan handed to a host action, so ADR-002's single path survives the
crossing into `src/views/`.

`buildSubtaskRelation` gains one option: `isCollapsed(row)`, a per-view override that layers over a
note's own `collapsed` frontmatter default (`subtask-relation.ts:30-46`). That is what lets a
collapse toggle work inside a read-only embed, where a frontmatter write is not available, and it is
why expand state persists in view config (`ViewConfig.subtaskCollapsed`, `types.ts:538-545`;
round-trip at `data-source.ts:827-829,1019-1021,1227-1229`) rather than in a note. Progress is
derived in the same pass (`subtask-relation.ts:233-258`), and it keeps the author's number and the
count from children as separate fields on one record — `explicit` never loses to `derived`, and
`source` names which one `value` came from.

The board indents by the card's own outline (`margin-inline-start`, `styles.css:9413-9415`), not by
padding inside it, so a child card reads as nested rather than as a card with a wide gutter. The
toggle and the inline add row appear only where a real relation exists: a relation node is built for
every row, so node presence alone would have put an "Add subtask…" input under every leaf card on the
board, and the gate is children-count rather than node-presence (`board-renderer.ts:1019-1023`). The
timeline gates its own styling class the same way and says so in place
(`calendar-timeline-renderer.ts:939-945`). The mobile move menu is bounded to the current group and
capped at 20 with a trailing count row (`board-renderer.ts:67,1317-1344`); an unbounded sweep of
`rowByPath` had been putting every other row on the whole board into one phone menu.

`toFrontmatterUpdates` (`subtask-serialize.ts:63-83`) is the one addition to the write path: a
planned write carries a whole-note frontmatter snapshot, and applying it verbatim would re-set every
unrelated field on that note, turning a scoped relation write into one that can race a concurrent
edit elsewhere in the same file. It narrows the write back to the four relation keys, mapping an
omitted key to `null` so the host's own writer deletes it.

### Fixtures

Each surface gets the tree in its own scenario rather than folded into the ordinary ones. On the
board that is forced — five columns overflow the widest capture device — and on the timeline it is a
choice: `TL_LANES` feeds all five scale captures on both devices, and marking its bars would have put
an indent, a toggle and a progress label into every one of them, when an un-related bar is exactly
what those captures exist to show. `TL_SUBTASK_LANES` (`temporal.mjs:675-695`) re-reads the same two
lanes with the same geometry, so no date or width is invented, and a parity test refuses a `subtask`
field on `TL_LANES` itself (`shared.test.mjs:181-193`).

### Leg B Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | PASS — exit 0 |
| `npm run test` | PASS — 87 files, 864 tests |
| Red-first, relation options + progress | `src/data/subtask-relation.ts` at `HEAD`: 2 of 18 red, `expected { explicit: 25, … } to be undefined` |
| Red-first, collapse round-trip | `src/data/data-source.ts` at `HEAD`: red, `expected undefined to deeply equal { 'Tasks/Parent.md': true }` |
| Red-first, board fixture parity | one span deleted from the fixture: red, `db-subtask-progress-fill is in its fixture` |
| Red-first, ordinary-lane guard | a `subtask` field put back on `TL_LANES`: red, `business/Figma carries no subtask state` |
| `npm run lint` | 169 problems (156 errors, 13 warnings) — identical to `HEAD`; the logs differ only in line numbers of pre-existing findings |
| `npm run lint:tools` | PASS — exit 0 |
| `node tools/naming/scan-comments.mjs` | PASS — 374 files, 0 commented-out lines, 0 missing banners |
| `node tools/naming/scan-failing-values.mjs` | PASS — exit 0 |
| `node tools/lane/check-lane.mjs` | PASS — `release names all 21 changed capture(s)`, exit 0 bare and phased |
| `node tools/live/engine-parity.mjs` | 51 differences, the same count as `HEAD`; fixtures 66 -> 68 for the two new scenarios; none names a subtask class |
| `npm run screenshots` | 268 captured, 0 errors; all 21 changed captures opened and read |
| `npm run gate` | PASS — 25/25 green, exit 0, bare and with `SURFACE_PHASE` |

Two of those were red before they were green, for reasons worth keeping: the first capture read
truncated the board progress label to `1/2 subtasks complete · Explicit…`, hiding the author-set half
of the pair REQ-004 exists to separate, and the `evidence` lane found 11 of 16 artefacts describing a
stylesheet that no longer existed. The first was a stylesheet fix and a re-read; the second was
re-measured by the eight census and audit tools the gate does not re-stamp on its own.
<!-- /ANCHOR:leg-b -->

---

<!-- ANCHOR:leg-c -->
## Leg C — Closing the Two Open Rows

Leg b's own close-out left two rows open: the board's same-parent drag reordered the manual rank but
never wrote `subtaskRank`, and `moveSubtask`/`toggleSubtaskCollapsed` had no test harness. Both are
now closed (Known Limitations 1-2 above), each red first against this worktree's actual code before
either fix landed. `git stash push` on only `database-view.ts`/`embedded-database-renderer.ts` (the
two test files kept) reproduced the claimed failure verbatim, then popped clean.

### Leg C Verification

| Check | Result |
|-------|--------|
| Red-first (stashed fix) | `expected "vi.fn()" to be called 2 times, but got 0 times` at `database-view.test.ts:241` and `embedded-database-renderer.test.ts:307` |
| `npx tsc --noEmit` | PASS — exit 0 |
| `npx vitest run` | PASS — 89 files, 875 tests |
| `npm run lint` | 169 problems, identical to `HEAD`; 0 new findings in the four touched files (the four existing findings inside `database-view.ts`/`embedded-database-renderer.ts` predate this leg, confirmed against a stashed `HEAD` copy) |
| `node tools/naming/scan-comments.mjs` | PASS — 376 files, 0 commented-out lines |
| `node tools/live/sheet-rebuild.mjs` | PASS — every rebuilt sheet kept its bar |
| `node tools/live/render-assertions.mjs` | PASS — all renderer/bag-shape checks |
| `node tools/screenshots/verify.mjs` (before recapture) | STALE — 4 `chrome-selection-status-bar` captures, `embedded-database-renderer.ts` sourceHash moved |
| `npm run screenshots` | 276 captured; the 4 stale captures are byte-identical to `HEAD` (only the sourceHash needed refreshing); 10 unrelated timeline/chrome-menu captures moved 6-560 bytes, the same encoder non-determinism this lane's history already records |
| `node tools/lane/check-lane.mjs` | PASS — `release names all 10 changed capture(s)`, no stylesheet edit |
| `npm run gate` | PASS — 25/25 green, exit 0 |

The worktree was also rebased onto `main` (moved to `7e36671` in the interim) before this
verification: `tools/live/*.json` conflicted on the merge and were resolved by taking `main`'s
committed versions, then regenerating them fresh from the rebased tree via the two live tools above,
per this program's documented resolution rule for that file class.
<!-- /ANCHOR:leg-c -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. ~~Drag-reorder inside one parent routed rank-only.~~ **Closed 2026-09-03.** `getSubtaskMoveContext`
   (`board-renderer.ts:1458-1474`) plans a same-parent move and hands it to `moveRowToPosition`/
   `moveRowWithGroupUpdatesAndPosition` as `subtaskMove`; the host bindings now forward that argument
   (`database-view.ts:780-786`, `embedded-database-renderer.ts:427-428`) and the handlers apply the
   plan through `moveSubtask`'s `updateFrontmatter` loop before the rank change, aborting the whole
   move if that write fails (`database-view.ts:10727-10755,11054-11072`,
   `embedded-database-renderer.ts:2684-2704`). The board and the timeline's own reorder path
   (`applyTimelineSubtaskOrder`, `calendar-timeline-renderer.ts:2687-2708`) now agree. Red first:
   `database-view.test.ts:241` and `embedded-database-renderer.test.ts:307`,
   `expected "vi.fn()" to be called 2 times, but got 0 times`.
2. ~~The host handler bodies had no test harness.~~ **Closed 2026-09-03.**
   `src/views/database-view.test.ts` and `src/views/embedded-database-renderer.test.ts` drive the
   real constructor-bound action bags of `DatabaseView` and `EmbeddedDatabaseRenderer` through a fake
   data source and window stub (no live Obsidian `App` is constructed) and assert
   `moveRowToPosition`/`moveSubtask`/`toggleSubtaskCollapsed` reach `dataSource.updateFrontmatter`
   and `dataSource.updateViewDefFile` with the exact planned payloads, not just call counts (6 tests).
3. **Not operator-confirmed.** No device or installed-build confirmation of the tree UI has occurred,
   and `acceptance-criteria.md`'s rows are not signed off. The captures are headless Chrome against
   hand-written fixtures, which is evidence about markup and stylesheet, not about Obsidian.
<!-- /ANCHOR:limitations -->

---
