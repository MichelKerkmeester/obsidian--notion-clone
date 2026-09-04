---
title: "Feature Specification: List Usage and Migration Audit"
description: "Read-only first phase of the list-view deprecation: find every view configured as a list, decide what the table migration must preserve, and enumerate every list-only affordance that has no table equivalent so a loss is declared rather than discovered."
trigger_phrases:
  - "list usage audit"
  - "list migration target"
  - "list data loss check"
  - "006 phase 005"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: List Usage and Migration Audit

<!-- SPECKIT_LEVEL: 1 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P0 |
| **Status** | Draft |
| **Created** | 2026-09-04 |
| **Branch** | Not yet dispatched |
| **Parent Spec** | ../spec.md |
| **Phase** | 1 of 4 in the deprecation (folder `005` of `008`) |
| **Predecessor** | None — `000`-`004` are superseded and gate nothing |
| **Successor** | 006-hide-and-migrate |
| **Handoff Criteria** | The migration target is decided and the data-loss list is written, so `006` migrates knowing what it drops |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is the **first deprecation phase** of `006-list-view-deprecation`, in folder `005` because
`000`-`004` are taken by the superseded ClickUp children.

**Scope Boundary**: reading and deciding. This phase changes no product behaviour and writes no
source file. Its output is evidence and one decision.

**Dependencies**:
- `../005-component-surface-system/030-gallery-view-deprecation/` — the precedent, including
  `src/data/gallery-migration.ts`, whose target was `board` and whose reasoning is worth reading
  before choosing `table` here.
- `src/views/list-renderer.ts`, `src/views/card-field-renderer.ts`, `src/data/types.ts` — the
  surfaces being audited.

**Deliverables**:
- The list-usage inventory: every code path, config field and fixture that assumes `viewType === "list"`.
- The migration target decision, with its reasoning.
- The data-loss list: every list-only affordance with no table equivalent, named individually.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The deprecation cannot start by deleting, because `viewType: "list"` is written into vault files and
nobody has counted what depends on it. `030-gallery-view-deprecation` hit the same wall and answered
it with a migration; that migration targeted `board`, and the reasoning behind that choice does not
transfer automatically to the list.

There is also a specific way this goes wrong quietly. The list has affordances the table does not —
the stacked-title reading mode, `listCompactFields`, the per-group create button at
`list-renderer.ts:172` — and a migration that simply rewrites `viewType` drops them without saying
so. A dropped affordance discovered by a user is a defect; a dropped affordance named in advance is
a decision.

### Purpose

Know exactly what uses the list, what the migration preserves, and what it costs, before anything
is withdrawn or removed.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Every source path that branches on `viewType === "list"` or renders through the list renderer.
- Every `ViewConfig` field that only the list reads.
- Every fixture, constructed scenario, bench, replay claim, gate lane and unit spec that names the
  list.
- The migration target decision and its reasoning.
- The data-loss list.

### Out of Scope
- Changing any of them — this phase is read-only, and that is what makes its output trustworthy as
  input to the two phases that do change things.
- The gallery's audit. `030` owns it, and it is at a different stage.
- Deciding whether `list` leaves `DatabaseViewType`. That belongs to `007`, after `006` has shipped
  and migrated real vaults.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `005-usage-and-migration-audit/implementation-summary.md` | Modify | The inventory, the target decision and the data-loss list land here |
| (no source file) | — | This phase is read-only by design |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | Every source path that assumes `viewType === "list"` is enumerated, with file and line. A path found later by a failing build is a path this phase missed. | `rg -n '"list"' src` plus a read of `list-renderer.ts`'s callers, both recorded with counts |
| REQ-002 | The migration target is decided and its reasoning recorded, including why it differs from the gallery's `board`. | The decision written in this phase's `implementation-summary.md`, cited by `006` |
| REQ-003 | Every list-only affordance with no table equivalent is named individually. A summary count is not the deliverable; the list is. | The enumerated list, each entry with the file and line that implements it |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | Every fixture, constructed scenario, bench entry, replay claim, gate lane and unit spec that names the list is enumerated, so `007` removes them together rather than discovering them one failing lane at a time. | The enumeration, checked against `tools/gate.mjs`'s lane list |
| REQ-005 | The audit states what it did **not** establish, so a later phase does not mistake its silence for a finding. | A named section in this phase's summary |
| REQ-006 | No source file is modified by this phase. | `git diff --stat src/ tools/` is empty on the phase's own commits |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `006` can implement the migration without reading any source file this audit did not
  name.
- **SC-002**: `007` can remove the measurement surface without discovering a lane, fixture or claim
  the audit missed.
- **SC-003**: every declared loss is a decision on record before a user could meet it.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `030-gallery-view-deprecation` | None — it is a precedent, already in the tree | Read it, including `src/data/gallery-migration.ts`'s comment on why the target was `board` |
| Risk | The audit misses a path and `007` finds it as a failing lane | High — a half-removed view is worse than an un-removed one | Enumerate from three directions: source grep, the gate's lane list, and the capture manifest |
| Risk | A list-only affordance is judged "close enough" to a table one and quietly mapped | Med | REQ-003 asks for individual entries; "close enough" is a declared loss with a note, not an omission |
| Risk | The audit runs long and the deprecation stalls | Low | It is read-only and bounded by the enumeration; nothing downstream needs it to be exhaustive about the ClickUp history |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

- Does the migration target the table, or the board the way the gallery did? The table is the
  working assumption because the list already derives its tracks from the table's column widths, so
  the column set carries over rather than being re-derived. The audit confirms or overturns it
  against evidence rather than inheriting it.
- Is `listCompactFields` used anywhere outside the list? If it is, it survives the removal; if it is
  not, it goes with the renderer and that is a schema field leaving a persisted union's neighbour.
- How many vaults can this repository actually see? The audit can enumerate code paths exhaustively
  and vault usage not at all. That limit is the reason REQ-005 exists.
<!-- /ANCHOR:questions -->

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
