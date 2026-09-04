---
title: "Phase 000: Grid Contract and a Harness That Can See the List"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Deliver the isGridView predicate, re-derive the guard table off a stable anchor, build the two view-semantic guard tripwires before any guard is converted, make verify-placement.mjs render a real list, and record every failing number this packet will later claim to fix."
trigger_phrases:
  - "006 phase 000"
  - "grid contract predicate"
  - "list harness census"
  - "guard tripwire g8 g11"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/000-grid-contract-and-list-harness"
    last_updated_at: "2026-08-30T00:00:00Z"
    last_updated_by: "phase-scaffold"
    recent_action: "Scaffolded phase 000 from the parent plan; AC-31 and AC-32 defined as guard tripwires"
    next_safe_action: "Build isGridView and the two guard tripwires; nothing else in this packet may start first"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "checklist.md"
      - "decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006-p000"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "Guard tripwires fail first against a deliberately mutated tree, not against HEAD. ADR-P0-01 in this folder."
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Phase 000: Grid Contract and a Harness That Can See the List

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | `specs/006-list-view-deprecation/000-grid-contract-and-list-harness/` |
| **Parent Spec** | [`../spec.md`](../spec.md) |
| **Predecessor** | None — this is the first phase |
| **Successor** | [`../001-list-grid-structure/spec.md`](../001-list-grid-structure/spec.md) |
| **Level** | 2 (Verification) — `recommend-level.sh --loc 350 --files 4 --architectural` returned 52/100, confidence 92% |
| **Status** | **Superseded 2026-09-04** — was: Planned |
| **Lane** | `tools/lane/css-lane.json` **not held**. This phase reads `styles.css` and never writes it |
| **User-visible change** | **None.** Captures before and after are byte-identical or every diff is explained |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

**Nothing in this packet can be measured yet, and two of its guards can be broken without any gate
noticing.**

Three facts, all measured, fix this phase's scope:

1. **`verify-placement.mjs` renders no view at all.** Every criterion in the parent's
   `acceptance-criteria.md` is measured there. Until it mounts a list, no number in this packet
   exists, and a phase claiming a pass would be asserting rather than verifying.
2. **Two guards are correctly view-keyed and must survive the conversion.** G8 keeps the list's
   title field; G11 keys new-row reveal to the list. Both would pass `npx tsc --noEmit` and the whole
   `vitest` suite if broken, because neither failure is a type error and neither is reachable from a
   `node`-environment unit test.
3. **The two affordances the operator pointed at carry no CSS.** `db-list-group-new` and
   `db-list-row-checkbox` each match zero selectors in `styles.css`, while `.db-list-row` matches 18.
   A later phase asked to "style the list" will assert on the row and be honestly green while both
   affordances stay exactly as invisible as they are today.

**Purpose.** Produce the measuring instrument, the two tripwires, and the failing numbers — before
any phase exists that would benefit from them being generous.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In scope

- `isGridView(config)` in a shared module, with no call sites converted.
- Re-deriving the eleven-guard table against the current tree and re-anchoring it off enclosing
  symbol names rather than line numbers.
- The two view-semantic guard tripwires (AC-31, AC-32).
- `tools/storybook/verify-placement.mjs`: mount a real list view at the production mount point.
- The failing-number census that fills every "today" cell in this packet.
- The table bench baseline for NFR-01.

### Out of scope

- **Converting any guard.** Not one. That is phase 001's work and it is gated on this phase's
  tripwires existing and having been demonstrated to fail.
- Any write to `styles.css`. This phase reads it.
- Any user-visible change.

### Frozen boundary

`SCOPE LOCK` applies. A defect found outside this list — including in the table — is recorded in the
parent and not fixed here.

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

Inherited from the parent's [`../spec.md`](../spec.md) §4.3. This phase owns no `FR-` of its own; it
owns the instruments that make the others measurable.

| ID | Requirement | Owner |
|---|---|---|
| P0-01 | `isGridView(config)` exists and is unit-tested across every view type the plugin supports | this phase |
| P0-02 | Each guard site in the parent's `plan.md` §3 is re-confirmed against the current tree, and the table is re-anchored off the enclosing method name | this phase |
| P0-03 | A tripwire exists for G8 that drives the production render and fails when the guard is converted | this phase, AC-31 |
| P0-04 | A tripwire exists for G11 that drives the production render, runs against a multi-group fixture including a zero-row group, and fails when the guard is converted | this phase, AC-32 |
| P0-05 | `verify-placement.mjs` mounts a list view at the production mount point, without a token-supplying wrapper | this phase |
| P0-06 | Every "today" cell in this packet carries a measured number | this phase |

### 4.1 The guard table is re-derived, not copied

The parent's `plan.md` §3 records eleven guard sites by file and line. **Every one of those line
numbers has drifted**, and another workstream is editing `src/` concurrently, so they will drift
again. Re-confirming them is P0-02 and it is not bookkeeping: the guard table is the artefact that
stops a sweep from converting G8 and G11, and a table whose anchors are stale invites the reader to
resolve the mismatch by guessing.

Re-anchor each row off the **enclosing method name**, which survives an edit above it, and record the
line number as a convenience that is expected to rot.

### 4.2 What the census must not do

The census reads. It does not fix. A number recorded as failing is the deliverable; a number that
improved because the census author could not resist a one-line repair is contamination, and the
criterion it belonged to loses its prior failure.

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Criteria live in [`acceptance-criteria.md`](acceptance-criteria.md) and close in
[`checklist.md`](checklist.md). The parent's criteria doctrine
([`../acceptance-criteria.md`](../acceptance-criteria.md) §2) is binding here in full, including both
banned shapes and the undecided-target check.

This phase adds one category the parent's doctrine did not have — the **guard tripwire** — and
[`decision-record.md`](decision-record.md) ADR-P0-01 records why it needs a different failing-first
rule and why that rule is not a loophole.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Why it bites | Mitigation |
|---|---|---|
| A tripwire that does not trip | A check written against a guard that is currently correct passes trivially. That is the failure ADR-001 built the tripwires to prevent, reproduced inside the mitigation | Each tripwire is demonstrated against a **deliberately converted** guard in a scratch tree, and the before/after numbers are recorded. A tripwire without that record is not accepted |
| The census author fixes what they measure | A criterion loses its prior failure and the phase that fixes it inherits a pass it did not earn | The census is read-only by construction; any repair is a separate task in a later phase |
| The harness renders inside a helpful wrapper | The existing harnesses wrap everything in `.note-database-container`, which supplies the tokens, so they are structurally unable to show a token-reach defect | Mount at the production mount point and prove it: delete `.db-list-group-new` and confirm an asserted number moves |
| Guard line numbers drift mid-phase | Another workstream is editing `src/` now | Re-anchor off the enclosing method name (P0-02) and re-confirm at the end of the phase |

### Dependencies

- **ADR-001** — answered, Route B. Blocks nothing; it is what obliges P0-03 and P0-04.
- **`playwright-core` plus system Chrome** — already used by the harness.
- **No lane.** This phase does not take `tools/lane/css-lane.json`.

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement | Threshold | How measured |
|---|---|---|---|
| NFR-P0-01 | The table bench baseline for NFR-01 is recorded at 2,000 rows | a number exists | `npm run bench` |
| NFR-P0-02 | This phase changes nothing a user can see | captures byte-identical, or every diff explained | `npm run screenshots` then human review |
| NFR-P0-03 | The unit test count does not fall | at or above the current count | `npx vitest run` |

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

| Case | Expected |
|---|---|
| A guard site has moved since the parent recorded it | Re-anchor and record both the old and new location; do not silently overwrite |
| A guard site no longer exists | Record it as removed with the commit that removed it. Do not renumber the table — the ids are cited across the packet |
| A `viewType === "list"` site exists that the parent's table does not list | Add it. The parent's table is complete over `"table"`-keyed sites and was never audited for `"list"`-keyed ones |
| The harness cannot reach a criterion's subject | The criterion is *blocked*, not failed. Record it as blocked with the reason |
| A census number comes out passing | Record it passing and flag it: a criterion that passes before the work starts is banned shape 1 and goes back to the parent for rewriting |

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## 9. COMPLEXITY ASSESSMENT

| Dimension | Value |
|---|---|
| Estimated LOC | ~350 |
| Files touched | ~4 — a shared predicate module, its test, `verify-placement.mjs`, and the census artefact |
| Architectural | yes — `isGridView` is the single predicate every later guard reads |
| Risk | medium. Nothing ships to the user, but every later measurement inherits this phase's honesty |
| Level score | 52/100, confidence 92% |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 10. OPEN QUESTIONS

None blocking. The one design question this phase must **record without answering** is whether the
leading gutter is emitted as its own header cell or as padding on the first cell — that is phase
001's decision (parent `AC-01`), and AC-31 is deliberately written so that either answer passes it.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- [`../spec.md`](../spec.md) — the packet's vision, the ClickUp interaction model and its UNKNOWN list.
- [`../plan.md`](../plan.md) — the eleven guards, the ordering argument, the lane protocol.
- [`../acceptance-criteria.md`](../acceptance-criteria.md) — the criteria register and the doctrine.
- [`../decision-record.md`](../decision-record.md) — ADR-001 through ADR-006.
- [`decision-record.md`](decision-record.md) — ADR-P0-01, the guard-tripwire failing-first rule.
