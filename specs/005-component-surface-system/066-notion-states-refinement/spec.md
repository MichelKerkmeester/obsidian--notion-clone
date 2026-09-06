---
title: "Feature Specification: Notion States Refinement"
description: "The Notion refinement of 055's state, feedback and motion surfaces: an action-carrying toast with a window a reader can act inside, owned operation failures routed through the toast, the one error shape Notion has that we do not, and 055's tracking documents taken back to what the tree says."
trigger_phrases:
  - "066 spec"
  - "notion states refinement spec"
  - "action toast dwell"
  - "owned failure toast"
  - "inline stale reference chip"
  - "fast band census"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Notion States Refinement

<!-- SPECKIT_LEVEL: 3 -->

---

## EXECUTIVE SUMMARY

`055` built the state, feedback and motion vocabulary. A five-iteration Notion research loop read the
Mobbin harvest against it and found that the vocabulary mostly holds — in three places it is richer
than Notion's — and that the gaps share one shape: **a surface that works right up to the moment it
has to carry an action.** An action-carrying toast dismisses on the plain-success budget, owned
operation failures escape to bare host notices, and a stale reference has no inline shape at all.
A fourth item is bookkeeping: five load-bearing rows in `055`'s own tracking documents misstate a
phase whose implementation has largely landed.

**Key Decisions**: no Notion number is adopted — shapes and behaviours only, because the digest states
no device-pixel ratio; two Notion-versus-Anytype conflicts are held as Proposed ADRs rather than
applied.

**Critical Dependencies**: `055`'s toast component, empty-state vocabulary and motion token set are
constraints, not deliverables. `styles.css` is serialized by the parent's CSS lane.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-06 |
| **Branch** | `worktrees/182-notion-states` |
| **Parent Spec** | ../spec.md |
| **Phase** | 66 of 68 |
| **Predecessor** | 055-states-feedback-and-motion |
| **Successor** | None |
| **Handoff Criteria** | Every criterion in `goal.md` §3 met or waived by an ADR, and `acceptance-criteria.md` closeable |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is the **states, feedback and motion** entry in the eight reserved Notion-refinement children
(`059`-`066`, parent `goal.md` D15). Its owner surface is `055-states-feedback-and-motion`.

**Scope Boundary**: the toast's dismissal contract, the owned operation-failure paths, one new
inline error shape, `055`'s tracking documents, and the fast motion band's residual literals. The
seven-state vocabulary, the confirm/undo split and the motion token values themselves are `055`'s
and are not re-specified.

**Dependencies**:
- `055-states-feedback-and-motion` — the toast component (`src/views/toast.ts`), the empty-state
  vocabulary (`src/views/empty-state-renderer.ts`) and ADR-005's motion token set.
- `051-modal-and-sheet-componentization` ADR-007 — Anytype parity is the default for these surfaces.
- The parent's CSS lane, which serializes every `styles.css` edit.

**Deliverables**:
- A split dismissal budget in the toast, with a lane row that reads both computed values.
- Owned operation-failure paths reporting through the toast, with a moving census.
- `renderInlineChip` plus a `.db-inline-chip` block, themed, with no hex literals.
- `055`'s `goal.md` §3 and `tasks.md` reconciled against the tree.
- Fast-band duration literals at zero, with the curve choice recorded.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

An Undo the reader cannot reach is not an Undo. `toast.ts` clears every success toast after 2200ms
(`:62`, `:137`) — a budget inherited from the operation-result rail and never measured for undo —
and the delete-then-Undo flow raises its toast as a success with an Undo attached, so the affordance
vanishes while the reader is still registering what was deleted. Two lines below that toast,
`deleteRow`'s failure path raises a bare `new Notice` with no severity, no action and no wait. And a
stale reference — a deleted board-group relation, a missing source — can only render as a full card,
so a compact context has to choose between a card that does not fit and no signal at all.

### Purpose

Every surface that has to carry an action can carry it: long enough to act on, in the shape the
context allows, with the failure path reporting through the same component as the success path.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Split the toast's dismissal budget so an action-carrying toast outlives a plain success.
- Route the owned `errors.*` operation-failure paths in `database-view.ts` through the toast.
- Add an inline, permanent, actionable chip for stale references in compact contexts.
- Reconcile `055`'s `goal.md` §3 Today column and its two lagging `tasks.md` checkboxes.
- Take the fast motion band's raw duration literals to zero and record the curve choice.
- Record the two Notion-versus-Anytype conflicts as Proposed ADRs.

### Out of Scope
- The radio-choice consequence picker (`screen:348fd2b7`) — no consumer: our views are configs over
  vault notes and nothing here destroys a data source.
- A second destructive red weight — conflicts with a landed ruling; see ADR-001.
- Re-placing the toast stack — conflicts with a landed ruling; see ADR-002.
- The in-trash persistent banner (`screen:15f3126a`) — belongs to a future trash/restore phase and
  inherits a Bin-shaped design question from E4's own logic.
- Two-tier loading (`screen:a483c1af`) — conditional on a multi-step async surface that does not exist.
- An onboarding-hint component (`screen:56bedefe`) — no criterion in `055` scopes onboarding UI.
- Offline handling (`screen:a335360d`) — connectivity is Obsidian's domain; no surface here owns sync state.
- Migrating all 242 bare-notice sites — `055` D5 makes the toast the pattern for the rest; this
  packet moves the owned operation failures and leaves the lane open.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/toast.ts` | Modify | Second dismissal constant, selected on the presence of an action |
| `src/views/database-view.ts` | Modify | Owned `errors.*` catches route through `showToast` |
| `src/views/empty-state-renderer.ts` | Modify | `renderInlineChip` beside `renderCard` |
| `styles.css` | Modify | `.db-inline-chip` block; fast-band literals resolved |
| `src/views/toast.test.ts` | Create | Dwell assertions, both budgets, both negative controls |
| `src/views/empty-state-renderer.test.ts` | Modify | Chip render, `aria-live`, no auto-dismiss |
| `tools/live/*.json` | Modify | Existing lane rows extended with the new computed assertions |
| `specs/.../055-states-feedback-and-motion/goal.md` | Modify | Five Today rows restated against the tree |
| `specs/.../055-states-feedback-and-motion/tasks.md` | Modify | T003 and the T019 amendment ticked with evidence |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | A toast carrying an action stays connected for at least 5000ms; a plain success still clears at 2200ms; an `error` still waits for the reader. One constant per budget, selected on `options.action`. |
| REQ-002 | Every `errors.*` catch in `database-view.ts` that reports an owned operation renders `.db-toast.is-error` rather than a bare `new Notice`, and `is-error` never auto-dismisses. The bare-notice census for owned operations moves from 242 and the new figure is recorded. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-003 | `renderInlineChip` renders a stale reference in a compact context as a permanent inline chip: warning icon, label, chevron action, `aria-live="polite"`, no dismiss control, host-token background composed with `color-mix`, zero hex literals, tap target at the host's interactive floor. |
| REQ-004 | The five stale rows in `055`'s `goal.md` §3 and the two lagging `tasks.md` checkboxes state what the tree states, each restatement carrying a same-day `file:line` verification. |
| REQ-005 | Raw fast-band duration literals in `styles.css` reach zero with comments excluded, and the ease-versus-ease-out choice is recorded as an ADR rather than absorbed. |
| REQ-006 | The two Notion-versus-Anytype conflicts are recorded as Proposed ADRs naming both readings, and neither is applied before the operator rules. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: An action-carrying toast is connected at 3000ms and a plain success is gone by 2500ms, both asserted from the production module.
- **SC-002**: A forced delete failure renders `.db-toast.is-error`, and the owned-operation notice census reads below 242 with the figure in the lane row.
- **SC-003**: A compact-context stale reference renders `.db-inline-chip` with `aria-live="polite"` and no hex literal in its declarations.
- **SC-004**: Each of the five restated `055` rows reproduces its old claim as false against the tree before its replacement lands.
- **SC-005**: The comment-excluded fast-band literal census reads 0, down from 4.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | Parent CSS lane | `styles.css` edits serialize; two legs cannot land together | Sequence T005 and T008 behind whichever lane holder is open |
| Dependency | Operator ruling on ADR-001 / ADR-002 | Neither conflict can be applied or dismissed without it | Both are Proposed; the packet closes on the operator row either way |
| Risk | The 5000ms dwell is an inference | A number nobody measured becomes a landed value | ADR-003 marks it as an inference; D-2 on the device pass is the check that would move it |
| Risk | Migrating a literal to `--db-transition-fast` changes `ease-out` to `ease` | A silent curve change across four surfaces | ADR-004 forces the choice to be recorded; the lane row counts declarations, not grep hits |
| Risk | The census threshold rewards deleting notices rather than routing them | A green lane over a worse surface | The lane row asserts `.db-toast.is-error` renders, not only that the census moved |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The dwell change adds no timer beyond the one already scheduled per toast; the toast stack's frontmost-only render is unchanged.

### Security
- **NFR-S01**: No new external input is parsed. Error messages already stringify a caught value and are rendered as text, never as HTML.

### Reliability
- **NFR-R01**: An `error` toast never auto-dismisses, before or after this packet. The dwell split touches the `success` branch only.

---

## 8. EDGE CASES

### Data Boundaries
- A toast with an action whose severity is `error`: waits for the reader, unchanged — the dwell split does not reach the error branch.
- A stale reference in a full-width context: keeps the card. The chip is the compact-context shape, not a replacement.

### Error Scenarios
- A delete failure while the container has already been torn down: the toast falls back to the document the rail resolves, matching `showOperationResult`'s own handling.
- Reduced motion active: the chip inherits the container reset like every other owned surface; it has no entrance animation of its own to suppress.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 15/25 | Files: 14, LOC: ~500, Systems: 1 |
| Risk | 12/25 | Auth: N, API: N, Breaking: N — one shared component contract widened |
| Research | 14/20 | Five-iteration loop already run; the open items are rulings, not investigations |
| Multi-Agent | 5/15 | Workstreams: 1 |
| Coordination | 8/15 | Dependencies: the CSS lane, and two operator rulings |
| **Total** | **54/100** | **Level 3** |

`recommend-level.sh --loc 500 --files 14 --architectural` reads **64/100, confidence 82%** (Level 2 by
the script's thresholds) with a phase score of **10/50** against the 25 bar — so this is a standard
child, never a phase parent. Level 3 is taken on the go-higher rule: the packet turns on four
decisions and holds two operator rulings, which is what the architecture addendum exists for.

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | The 5000ms dwell lands as a measured value when it is an inference | M | M | ADR-003 states it; D-2 is the device check |
| R-002 | The fast-band migration silently changes four surfaces' easing | M | M | ADR-004; the census counts declarations |
| R-003 | The notice census is met by deleting rather than routing | H | L | The lane row asserts the toast renders |
| R-004 | `055`'s restated rows are copied from this packet rather than re-read | M | M | Each restatement carries a same-day `file:line` |
| R-005 | An operator ruling reverses ADR-001 and the confirm surface needs a 17-site severity pass | M | L | The ADR names the threshold that would apply, so the pass is scoped before it starts |

---

## 11. USER STORIES

### US-001: Undo a delete (Priority: P0)

**As a** reader who just deleted the wrong row, **I want** the Undo to still be there when I reach for
it, **so that** the recovery does not depend on how fast I read.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

### US-002: See why an operation failed (Priority: P0)

**As a** reader whose delete failed, **I want** the failure to look like a failure and stay until I
dismiss it, **so that** I do not act on a stale view believing the delete worked.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

### US-003: Fix a stale reference where it is (Priority: P1)

**As a** reader looking at a board group whose relation was deleted, **I want** the problem named
inline with a way into the settings that caused it, **so that** I do not have to guess why the group
is empty.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

## 12. OPEN QUESTIONS

- Does a second destructive red weight enter the confirm primitive, or does the single `danger`
  boolean hold? ADR-001, the operator's.
- Does the toast stack stay in the Anytype-measured bottom-right corner? ADR-002, the operator's.
- Is 5000ms the right dwell, or does the device pass move it? ADR-003 and D-2.
- Does the fast band get an explicit `ease-out` token, or does `ease` become the one fast-band curve?
  ADR-004.
- Does iOS `Reduce Motion` stop the shimmer inside the plugin's WKWebView? D-1, device-only.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Goal**: See `goal.md`
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decision Records**: See `decision-record.md`
- **Research**: See `../055-states-feedback-and-motion/research/research.md`

---
