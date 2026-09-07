---
title: "Decision Record: Board Cross-Group Drag"
description: "The design choices behind touch drag on the board: reusing the existing write path, the long-press grammar, the hit-test primitive, and the headless-Chrome proof split."
trigger_phrases:
  - "069 decision record"
  - "board touch drag adr"
  - "board cross-group drag design decisions"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/069-board-cross-group-drag"
    last_updated_at: "2026-09-07T20:41:49Z"
    last_updated_by: "board-touch-drag-groups-session"
    recent_action: "Recorded the five design decisions"
    next_safe_action: "None — this document does not gate closure"
    blockers: []
    key_files: []
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "board-touch-drag-groups-session"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->
# Decision Record: Board Cross-Group Drag

---

<!-- ANCHOR:adr-001 -->
## ADR-001: Touch drag reuses the desktop's cross-group write path exactly

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-07 |
| **Deciders** | Implementation session |

---

### Context

The desktop mouse drag already resolved a cross-group drop through `resolveBoardContainerDropOrder`
and committed it through the private `moveCardAndOrder`, which in turn calls
`actions.moveRowWithGroupUpdatesAndPosition` when a host supplies it, or falls back to
`actions.updateGroup` + `actions.moveRowToPosition`. Touch input needed a way to reach the same
decision from a long-press gesture instead of `dragstart`/`dragover`/`drop`.

### Constraints

- `BoardRendererActions` is a contract two hosts implement; adding a member to it is a breaking
  change to both, and `goal.md` D4 rules it out unless something cannot be expressed otherwise.
- The operator's report described the *outcome* ("drag the card, the property updates"), not a new
  mechanism — ClickUp's touch board reaches the same write a ClickUp mouse drag does.

### Decision

**We chose**: Touch drag calls the exact same private `moveCardAndOrder` method the desktop `drop`
handler calls, with the same arguments shape (`row`, `groupField`, `groupKey`, `fromGroup`,
`draggedPath`, `order`).

**How it works**: The touch-drag pointer handlers, once a drop is resolved to a target column,
build the identical `resolveBoardContainerDropOrder` call the desktop `drop` handler makes and pass
its result to `moveCardAndOrder`. Both input devices are two DOM event sources feeding one decision
function.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: share `moveCardAndOrder`** | Zero new interface surface; one code path to test and reason about | None material | 9/10 |
| A parallel touch-only move method | Would let touch and mouse diverge if a future requirement needed it | No such requirement exists; two paths for one behaviour is the exact duplication `goal.md` D4 forbids | 3/10 |

**Why this one**: The two input devices produce the same user-visible outcome and there is no
requirement that would make them differ — sharing the function is strictly simpler and cannot drift.

### Consequences

**What improves**:
- Touch drag inherits every existing guarantee of the mouse path (subtask-move integration, manual
  rank handling, the same-column no-op) for free.

**What it costs**:
- None identified.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future desktop-only change to `moveCardAndOrder` silently changes touch behaviour too | Low | Intended — the two devices sharing behaviour is the point |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | **Necessary?** | PASS | The operator's report needs the write to happen from a touch gesture; it does not need a second write mechanism |
| 2 | **Beyond Local Maxima?** | PASS | A parallel touch-only path was considered and rejected |
| 3 | **Sufficient?** | PASS | `board-renderer-parity.test.ts`'s touch tests assert the same call shape the desktop tests already assert |
| 4 | **Fits Goal?** | PASS | Directly on the critical path — the report's whole ask is this write, reached from touch |
| 5 | **Open Horizons?** | PASS | Nothing forecloses a future divergence if one is ever genuinely needed; it simply is not needed now |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**:
- `src/views/board-renderer.ts` — new private touch-drag methods calling the existing
  `moveCardAndOrder`; no change to that method's own signature or body.

**How to roll back**: Remove the touch-drag pointer listeners and the `card.draggable` branch that
gates them; the desktop path is untouched and continues to work standalone.
<!-- /ANCHOR:adr-001 -->

---

## ADR-002: Column hit-testing reuses `resolveBoardColumnByPoint`, not `elementFromPoint`

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-07 |

### Context

Touch drag needs to know which column the finger is over during a move and at drop. Two approaches
exist: `document.elementFromPoint(x, y)` walked up with `.closest()`, or geometric point-in-rect
testing against each column's own `getBoundingClientRect()`. `src/data/board-container-drop.ts`
already exported `resolveBoardColumnByPoint`, built for a mouse empty-space drop fallback that was
never wired up — `grep -rn resolveBoardColumnByPoint src` returned only its definition and its own
test before this packet.

### Decision

**We chose**: `resolveBoardColumnByPoint(candidates, x, y)`, called with each rendered column's
`cardsEl` rect.

**How it works**: On every `pointermove` and at drop, the touch-drag code builds a candidate list
from `this.touchDragColumns` (collected once per render) and asks the pure function which key the
point resolves to — `null` if it lands outside every column.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: `resolveBoardColumnByPoint`** | Already existed, already unit-tested, pure and DOM-independent — trivially testable with a hand-rolled `MockElement` | None | 9/10 |
| `document.elementFromPoint` + `.closest()` | Standard DOM idiom | Needs a real `document` and real layout to test at all (unusable against `MockElement`), and can resolve to a card, a header, or empty space depending on exact hit, needing extra normalization | 5/10 |

**Why this one**: It is the more testable, already-proven primitive, and using it retires the "built
but never wired" state the mouse path left it in.

### Consequences

**What improves**: One geometric decision function serves both a future mouse empty-space fallback
and the touch path, if the former is ever built.

**What it costs**: None identified.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The function's "y outside all columns falls to the nearest one" branch behaving unexpectedly for touch | Low | `board-container-drop.test.ts` already covers that branch; touch drag's own tests exercise the common in-column case |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Necessary? | PASS | Touch drag needs *some* hit-test |
| 2 | Beyond Local Maxima? | PASS | `elementFromPoint` was considered and is strictly worse for testability here |
| 3 | Sufficient? | PASS | Live proof measured a 0.0px ghost/highlight match |
| 4 | Fits Goal? | PASS | Directly enables the drop decision |
| 5 | Open Horizons? | PASS | Reusable by a future mouse fallback |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `src/views/board-renderer.ts` imports and calls `resolveBoardColumnByPoint`; no
change to `src/data/board-container-drop.ts` itself.

**How to roll back**: Remove the import and the two call sites (`updateTouchDragHit`,
`endCardTouchDrag`); the function remains available for its existing test.

---

## ADR-003: The embedded host's cross-group move raises an Undo toast; the desktop host's is untouched

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-07 |

### Context

`database-view.ts`'s `moveRowWithGroupUpdatesAndPosition` already called `showOperationResult`,
which raises a toast with an Undo action — pre-existing, unrelated to this packet. Its
`updateBoardGroup` (also pre-existing) is unreachable from the board drag path since it implements
`moveRowWithGroupUpdatesAndPosition`. `embedded-database-renderer.ts` has no
`moveRowWithGroupUpdatesAndPosition` at all, so every embed cross-group move takes the `updateGroup`
fallback — and that method wrote the frontmatter and pushed history silently, with no toast.
`grep -rn "\.updateGroup(\|updateGroup:" src` confirmed `updateGroup` is called from exactly one
place: `board-renderer.ts`'s cross-group fallback — so any toast added there fires only for a real
cross-group move, never for an unrelated field edit.

### Decision

**We chose**: Add a `showToast` call to `embedded-database-renderer.ts`'s `updateBoardGroup`,
matching the shape its own `deleteRow`'s Undo toast already uses (`showToast` + `pushHistory` +
`undoLastEdit`).

**How it works**: After the frontmatter write and history push succeed, `updateBoardGroup` raises a
success toast with an Undo action wired to `this.undoLastEdit()`.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: toast in `updateBoardGroup`** | One call site, matches the exact class of move this method serves | None | 9/10 |
| A toast at the `BoardRenderer` level, host-agnostic | Would give both hosts the toast from one place | `BoardRenderer` has no access to `showToast`'s `Document` or to either host's own undo path; would need a new `BoardRendererActions` member, which ADR-001 rules against | 3/10 |

**Why this one**: The toast belongs to whichever host wrote the frontmatter and owns the undo
stack, and `goal.md` D5 states this directly.

### Consequences

**What improves**: 0 silent cross-group writes remain on either host.

**What it costs**: None identified — the call site is proven to fire only for a cross-group move
(the caller's own grep-confirmed exclusivity), so no unrelated edit gains an unwanted toast.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| A future second caller of `updateGroup` for a non-drag edit inherits an unwanted toast | Low | The method's own doc comment now states the exclusivity explicitly, for the next reader who adds a caller |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Necessary? | PASS | The operator's report implies undo matters as much on phone as on desktop, where it already existed |
| 2 | Beyond Local Maxima? | PASS | A host-agnostic alternative was considered and correctly rejected by ADR-001's own constraint |
| 3 | Sufficient? | PASS | `embedded-database-renderer.test.ts`'s new test proves the toast and its Undo wiring |
| 4 | Fits Goal? | PASS | Closes the one asymmetry between the two hosts |
| 5 | Open Horizons? | PASS | Nothing forecloses a future shared toast helper if a third host is ever added |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `src/views/embedded-database-renderer.ts`'s `updateBoardGroup`.

**How to roll back**: Remove the `showToast` call; the frontmatter write and undo path are
unaffected.

---

## ADR-004: Headless-Chrome proof lives in a standalone script, not inside `render-assertions.mjs`

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-07 |

### Context

`render-assertions.mjs`'s scenario runner (`runRenderAssertions`) is synchronous: it mounts a
scenario, hands the container to a callback, and removes it the instant that callback returns. A
touch-drag proof needs a real 450ms wall-clock wait between `pointerdown` and the lift, which cannot
happen inside that synchronous callback without the container being torn down first. The brief
named `tools/live/render-assertions.mjs` specifically for this proof.

### Decision

**We chose**: A standalone script, `tools/live/board-cross-group-drag.mjs`, using the same shared
`buildRenderAssertionBundle` esbuild step and the same headless-Chrome (`playwright-core`) launch
convention, but with its own async page-evaluate flow rather than `runRenderAssertions`'s
synchronous callback.

**How it works**: The script bundles `BoardRenderer` directly (not the full five-renderer bundle
`render-assertions.mjs` builds), mounts a small fixture with a self-refreshing action bag, and
drives real `DataTransfer`/`PointerEvent` dispatch with real `page.waitForTimeout` waits.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: standalone script** | No change to a 4,300-line shared harness's synchronous contract; reuses the same bundle infrastructure and Chrome-launch convention | Not literally inside the file the brief named | 7/10 |
| Add `scenario.boardCrossGroupDrag`/`boardTouchDrag` to `render-assertion-harness.ts`, restructuring `runRenderAssertions` to support an async `onMounted` | Would satisfy the brief's literal file reference | Substantial restructuring of a shared harness every other check depends on, for one caller's async need; real risk of destabilizing the fourteen other checks that harness serves | 4/10 |

**Why this one**: The smaller, isolated change carries the real proof (real Chrome, real events,
real geometry) without touching a shared harness's execution model for one caller's async
requirement. This is a deliberate, named deviation from the brief's literal file reference — see
`goal.md`'s log.

### Consequences

**What improves**: The proof exists, is real, and is repeatable (`node
tools/live/board-cross-group-drag.mjs`), without risk to the other fourteen checks
`render-assertion-harness.ts` serves.

**What it costs**: The proof is not wired into `npm run gate`, and does not benefit from
`render-assertions.mjs`'s existing scenario-list infrastructure (shared bag-shape assertions, the
coverage stamp, etc.) — it duplicates a small, purpose-built fixture instead.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The script drifts from `render-assertion-harness.ts`'s conventions over time, with nobody noticing | Low | It reuses the same `buildRenderAssertionBundle` and Chrome-launch code as every other check, so a shared-infrastructure change reaches it too |
| Nobody runs it, since it is not gate-wired | Medium | Named explicitly in `goal.md`'s completion criteria and in this packet's `plan.md`/`tasks.md` as the required desktop/phone proof |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Necessary? | PASS | A real `DataTransfer` and real `PointerEvent` timing cannot be proven any other way in this repository's tooling |
| 2 | Beyond Local Maxima? | PASS | Restructuring the shared harness was considered and rejected as disproportionate |
| 3 | Sufficient? | PASS | `RESULT: PASSED` — desktop, phone, reverse, same-column, read-only all green |
| 4 | Fits Goal? | PASS | Directly proves the two completion criteria that name headless Chrome |
| 5 | Open Horizons? | PASS | A future packet can still add `boardCrossGroupDrag` to the shared harness properly, using this script as the reference for what it needs to do |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: New file, `tools/live/board-cross-group-drag.mjs`. No change to
`render-assertion-harness.ts` or `render-assertions.mjs`.

**How to roll back**: Delete the new file. No other file depends on it.

---

## ADR-005: The constructed capture is not registered in `screenshots/manifest.json`

### Metadata

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-07 |

### Context

`screenshots/manifest.json` entries carry per-source-file content hashes (`sourceHashes`),
generated and verified by `tools/screenshots/capture.mjs` and `constructed-scenarios.mjs`. Adding a
new tracked "lifted mid-drag" scenario properly means adding a synchronously-reachable
`boardTouchDragLifted`-style state to `render-assertion-harness.ts` (the touch lift itself needs a
real 450ms wait, which that harness's callback-based mounting cannot give it — the same constraint
ADR-004 names), registering it in `constructed-scenarios.mjs`, and running `npm run screenshots` to
generate real hashes.

### Decision

**We chose**: Produce the two captures (light/dark, lifted mid-drag, 402x874) directly from
`tools/live/board-cross-group-drag.mjs`'s own Playwright page, saved under this packet's
`scratch/captures/`, without a manifest entry.

### Alternatives Considered

| Option | Pros | Cons | Score |
|--------|------|------|-------|
| **Chosen: script-produced PNGs in `scratch/`** | Real evidence from the real bundled renderer in real Chrome, available now | Not part of the tracked, hash-verified pipeline; `screenshots:verify` never checks these files | 6/10 |
| Hand-write a manifest entry with placeholder/copied hashes | Satisfies the letter of "registered in the manifest" | Would fabricate provenance the pipeline did not actually verify — worse than no entry, since a hash claiming to describe a source it never measured is the exact failure `evidence.mjs`'s own header describes | 1/10 |
| Build the full `boardTouchDragLifted` harness support now | Fully correct, tracked, hash-verified | Real additional engineering (harness restructuring per ADR-004, plus `constructed-scenarios.mjs` registration and a full `npm run screenshots` pass) beyond this packet's scope | 5/10 |

**Why this one**: Real, honestly-labelled evidence beats either a fabricated manifest entry or
leaving the deliverable undone. The proper integration is named as a concrete follow-up rather than
silently absorbed.

### Consequences

**What improves**: The deliverable (a lifted-card capture in both themes) exists and was reviewed
in this session.

**What it costs**: The two PNGs are not covered by `screenshots:verify`'s freshness/hash checks and
will not be regenerated automatically if the board's CSS changes later.

**Risks**:

| Risk | Impact | Mitigation |
|------|--------|------------|
| The captures silently go stale | Low | They live in `scratch/`, which this packet's own docs mark as working files, not a tracked artifact a reader would mistake for gate-verified |

### Five Checks Evaluation

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Necessary? | PASS | The completion criteria ask for the capture |
| 2 | Beyond Local Maxima? | PASS | The fabricated-hash alternative was considered and correctly rejected |
| 3 | Sufficient? | PASS | Both PNGs exist and were visually reviewed |
| 4 | Fits Goal? | PASS | Serves the same objective without the disproportionate cost |
| 5 | Open Horizons? | PASS | The proper integration path is named for whoever picks it up |

**Checks Summary**: 5/5 PASS

### Implementation

**What changes**: `tools/live/board-cross-group-drag.mjs` writes to
`specs/005-component-surface-system/069-board-cross-group-drag/scratch/captures/`.

**How to roll back**: Delete the two PNGs; nothing else references them.
