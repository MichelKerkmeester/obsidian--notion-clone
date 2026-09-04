---
title: "Feature Specification: Remove the List Renderer and Its Harness"
description: "The irreversible phase: delete the list renderer together with every measurement of it — the list-window gate lane, the fixtures and constructed scenarios, the bench entry, the replay claims and the unit specs — and lower the coverage ratchet deliberately with the reason beside the number."
trigger_phrases:
  - "remove list renderer"
  - "list-window lane removal"
  - "renderer coverage ratchet floor"
  - "006 phase 007"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->
# Feature Specification: Remove the List Renderer and Its Harness

<!-- SPECKIT_LEVEL: 3 -->


---

## EXECUTIVE SUMMARY

This is the irreversible phase. `006` withdrew the list from every picker and migrated existing
views; this one deletes the renderer and, in the same change, everything that measures it.

The "same change" is the whole requirement. `src/views/list-renderer.ts` is 1,173 lines, and around
it sit a gate lane of its own (`tools/gate.mjs:89` → `tools/live/list-window.mjs`), a ratchet
(`tools/live/list-window.json`), a bench pinned by hash in `renderer-coverage.json`, `list` and
`list-sparse` constructed scenarios, replay claims, list fixtures, and two unit specs. Removing the
renderer and leaving any of those produces the worst available outcome: a gate that keeps reporting
green for a view nobody can open.

**Key Decisions**: whether `list` leaves `DatabaseViewType` or stays as an accepted-but-redirected
value the way `gallery` currently does; and the renderer-coverage ratchet's new floor, lowered
deliberately with the reason beside the number rather than as a side effect.

**Critical Dependencies**: `006` must have shipped in a release and be migrating real vaults.
`card-field-renderer.ts` is shared with the board and gallery cards and is not this phase's to
delete.

---
<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-04 |
| **Branch** | Not yet dispatched |
| **Parent Spec** | ../spec.md |
| **Phase** | 3 of 4 in the deprecation (folder `007` of `008`) |
| **Predecessor** | 006-hide-and-migrate |
| **Successor** | 008-docs-and-release |
| **Handoff Criteria** | The renderer and every measurement of it are gone together, and `npm run gate` exits 0 with the `list-window` lane removed rather than skipped |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is the **third deprecation phase** of `006-list-view-deprecation`, and the only irreversible
one.

**Scope Boundary**: the list's own code and the list's own measurement surface. Shared code is not
in scope: `card-field-renderer.ts` is used by the board and gallery cards, and only the list's use
of it is removed.

**Dependencies**:
- `005-usage-and-migration-audit` — the enumeration. This phase removes what the audit named; a
  surface found here that the audit missed is a finding recorded against `005`, not a silent fix.
- `006-hide-and-migrate` — must have shipped in a release and be migrating real vaults. This is the
  step that cannot be undone, and it does not go first.
- The `styles.css` serialized lane — taken once, released once.

**Deliverables**:
- `src/views/list-renderer.ts` deleted, with the list's share of `card-field-renderer.ts` separated
  rather than the module removed.
- The `list-window` gate lane removed from `tools/gate.mjs`, not skipped.
- Fixtures, constructed scenarios, bench entry, replay claims and unit specs removed together.
- The renderer-coverage ratchet at its new floor, with the reason recorded beside the number.
- A decision on whether `list` leaves `DatabaseViewType`.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

After `006` nobody can reach the list, but the code and everything that measures it are still there.
That is a stable state and it is not the end state: the renderer is 1,173 lines of dead code, and
the gate spends a lane on it.

The failure mode here is specific and it has a name in this program already. `042` and `043` spent
several audits on the difference between a check that measures the product and a check that measures
a fixture. A gate lane still running against a removed view is that failure in its purest form — it
would pass forever, on a harness, for a thing that no longer ships. Removing the renderer and
leaving the lane is worse than removing neither.

### Purpose

The list view and every measurement of it leave the tree together, and the gate's green afterwards
means what it says.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `src/views/list-renderer.ts` and `src/views/list-window-harness.ts`.
- The list's use of `src/views/card-field-renderer.ts`, separated from the board's and gallery's.
- `tools/live/list-window.mjs`, `tools/live/list-window.json`, and the lane entry at
  `tools/gate.mjs:89`.
- The `list-render-bench` entry and the `src/views/list-renderer.ts` pin in
  `tools/live/renderer-coverage.json`, plus the ratchet's new floor and the reason beside it.
- `list` and `list-sparse` in `tools/screenshots/constructed-scenarios.mjs`, the list fixtures in
  `tools/screenshots/scenarios.mjs`, and the captures they produced.
- The list claims in `tools/live/replay.mjs`.
- `src/views/list-reservation.test.ts`, `src/views/list-row-contracts.test.ts`, and list assertions
  inside shared specs.
- The decision on `DatabaseViewType`.

### Out of Scope
- `card-field-renderer.ts` as a module — the board and gallery cards use it.
- The migration. `006` owns it and it must already have shipped.
- The gallery's own removal. `030` owns it and it is at a different stage; bundling them makes one
  rollback undo both.
- Any table change to compensate for a declared loss. `005` named the losses; they are declared, not
  closed.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/list-renderer.ts` | Delete | 1,173 lines |
| `src/views/list-window-harness.ts` | Delete | The lane's harness |
| `src/views/list-reservation.test.ts` | Delete | List-specific |
| `src/views/list-row-contracts.test.ts` | Delete | List-specific |
| `src/views/card-field-renderer.ts` | Modify | The list's use separated; the module stays for board and gallery |
| `src/views/database-view.ts` | Modify | The list branch in the renderer switch |
| `src/data/types.ts` | Modify | Only if the union decision says so |
| `tools/gate.mjs` | Modify | The `list-window` lane entry removed, not skipped |
| `tools/live/list-window.mjs` | Delete | The lane |
| `tools/live/list-window.json` | Delete | The lane's ratchet |
| `tools/live/renderer-coverage.json` | Modify | The pin removed, the floor lowered, the reason recorded beside the number |
| `tools/live/replay.mjs` | Modify | The list claims removed |
| `tools/screenshots/scenarios.mjs` | Modify | List fixtures removed |
| `tools/screenshots/constructed-scenarios.mjs` | Modify | `list` and `list-sparse` removed |
| `screenshots/manifest.json` | Modify | The list captures pruned |
| `styles.css` | Modify | List rules removed under a held lane |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | The renderer, the lane, the harness, the ratchet, the bench entry, the fixtures, the constructed scenarios, the replay claims and the unit specs are removed in one change. A gate lane still running against a removed view would pass forever on a harness for something that no longer ships. |
| REQ-002 | The `list-window` lane is **removed** from `tools/gate.mjs`, not skipped. A skipped lane reads green in perpetuity and nobody looks at it again. |
| REQ-003 | The renderer-coverage ratchet is lowered to its new floor deliberately, with the reason recorded beside the number in the same commit. The ratchet fails closed on a decrease, which is exactly what makes an accidental drop visible and a deliberate one a decision. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | `card-field-renderer.ts` survives with the board and gallery cards rendering identically before and after, proven rather than assumed. |
| REQ-005 | Whether `list` leaves `DatabaseViewType` is decided and recorded, against the same evidence the gallery had. Either answer is acceptable; leaving it undecided is not. |
| REQ-006 | The list captures are pruned from `screenshots/manifest.json` rather than orphaned, so `screenshots-fresh` does not go red on a source file that no longer exists. |
| REQ-007 | No spec path, phase number, task id or requirement id appears in any code comment this phase writes. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `npm run gate` exits 0 from the final state, read from `$?` rather than through a pipe,
  with the `list-window` lane absent from the lane list rather than present and skipped.
- **SC-002**: `rg -n 'list-renderer' src tools` returns nothing.
- **SC-003**: `renderer-coverage.json` carries the new floor and the reason beside it.
- **SC-004**: the board and gallery cards render identically before and after, measured on captures.
- **SC-005**: the `DatabaseViewType` decision is recorded with its reasoning.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `006` shipped and migrating | Blocks — removing before migration strands vaults | The parent's transition rules make it a precondition |
| Dependency | `005`'s enumeration | Blocks — removal without it is a discovery process run against a red gate | `005` is read-only and short |
| Dependency | `styles.css` serialized lane | Med | Take once, release once, recapture on release |
| Risk | `card-field-renderer.ts` is deleted with the list | High — the board and gallery cards break | Named out of scope; REQ-004 proves the two cards unchanged |
| Risk | The lane is skipped instead of removed | Med — a skipped lane reads green forever | REQ-002 and SC-001 both say removed, and the lane list is the evidence |
| Risk | The ratchet drops silently | Med | REQ-003, taken from `030`'s REQ-004, which exists because this already happened once |
| Risk | Captures orphan and `screenshots-fresh` goes red on a missing source | Med | REQ-006 prunes rather than orphans |
| Risk | A surface the audit missed surfaces as a red lane mid-removal | Med | Record it against `005` rather than fixing it silently; a missed surface is evidence about the audit |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: removing the list must not change the table's render cost. The table is where
  migrated views live, and a regression there turns a deprecation into a defect.
- **NFR-P02**: `npm run gate` runs no slower after the removal than before, minus the removed lane.

### Security
- **NFR-S01**: N/A. No auth surface.
- **NFR-S02**: N/A. This phase deletes code and touches no user data — `006` owns the only write.

### Reliability
- **NFR-R01**: a vault whose view still carries `viewType: "list"` after this phase behaves per the
  `DatabaseViewType` decision, and that behaviour is stated rather than emergent.
- **NFR-R02**: the board and gallery cards are unchanged, measured on captures rather than asserted.

---

## 8. EDGE CASES

### Data Boundaries
- Empty input: a database with no views is unaffected; nothing in this phase reads view content.
- Maximum length: N/A. Nothing here scales with data.

### Error Scenarios
- External service failure: N/A.
- Network timeout: N/A.
- **A vault that never opened during `006`**: its view still says `list`. What happens is the
  `DatabaseViewType` decision, and REQ-005 requires that decision to exist before this ships.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|-----------|-------|----------|
| Scope | 20/25 | Files: ~20, LOC: ~1,200 removed, Systems: renderer, gate lanes, fixtures, benches, captures |
| Risk | 18/25 | Auth: N, API: N, Breaking: Y — an irreversible deletion behind a persisted union |
| Research | 8/20 | `005` did the investigation; this phase executes it |
| Multi-Agent | 12/15 | Source, harness and captures are three separable workstreams |
| Coordination | 14/15 | The CSS lane, the ratchet, the capture manifest, and `006` having shipped |
| **Total** | **72/100** | **Level 3** (`recommend-level.sh --loc 1200 --files 20 --architectural`) |

---

## 10. RISK MATRIX

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---------|-------------|--------|------------|------------|
| R-001 | `card-field-renderer.ts` is deleted with the list and the board and gallery cards break | H | M | Named out of scope; REQ-004 proves both cards unchanged on captures |
| R-002 | The `list-window` lane is skipped rather than removed and reads green forever | M | M | REQ-002 and SC-001 both require removal; the lane list is the evidence |
| R-003 | The coverage ratchet drops as a side effect rather than a decision | M | M | REQ-003, taken from the gallery deprecation, where this already happened once |
| R-004 | List captures orphan and `screenshots-fresh` goes red on a missing source | M | M | REQ-006 prunes the manifest in the same change |
| R-005 | A surface `005` missed appears as a red lane mid-removal | M | M | Record it against `005` rather than fixing it silently — a missed surface is evidence about the audit method |
| R-006 | This ships in the same release as `006` and a rollback has to undo both | M | L | The parent transition rules forbid it, and this phase is the reason they exist |

---

## 11. USER STORIES

### US-001: The gate stops measuring a view that is gone (Priority: P0)

**As a** maintainer, **I want** the list's lane, fixtures, bench and claims removed with the renderer,
**so that** a green gate means the shipped product passed rather than that a removed view still has
a passing test.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

### US-002: The board and gallery cards survive (Priority: P1)

**As a** user of the board, **I want** my cards to render exactly as they did, **so that** retiring a
view I did not use does not change one I do.

**Acceptance criteria:** see `acceptance-criteria.md` (rows referencing this story).

---

## 12. OPEN QUESTIONS

- Does `list` leave `DatabaseViewType`, or stay as an accepted-but-redirected value the way
  `gallery` currently does? REQ-005 requires an answer; the gallery chose to stay, and its reasoning
  — that a vault might carry the value for a long time after the UI stopped offering it — applies
  here identically.
- Do the list captures get pruned or archived? Pruning keeps `screenshots-fresh` honest; archiving
  keeps the visual record of a view that existed. Recorded, not decided.
- What happens to `033-list-virtualisation`'s measured work? It shipped real improvements to a view
  being removed. Closing the phase is right; deleting the measurements would lose the evidence that
  the freeze it fixed was real.
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `tasks.md`
- **Closure gate**: See `acceptance-criteria.md`
- **Audit input**: `../005-usage-and-migration-audit/`
- **Precondition**: `../006-hide-and-migrate/` shipped in a release
- **Precedent**: `../../005-component-surface-system/030-gallery-view-deprecation/` REQ-003 and REQ-004

---



<!-- SCAFFOLD_VALIDATION_COUNTS:
REQUIREMENT_PLACEHOLDER
REQUIREMENT_PLACEHOLDER
REQUIREMENT_PLACEHOLDER
REQUIREMENT_PLACEHOLDER
REQUIREMENT_PLACEHOLDER
REQUIREMENT_PLACEHOLDER
**Given**
**Given**
**Given**
**Given**
**Given**
**Given**
-->
