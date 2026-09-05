---
title: "Implementation Plan: Gallery Deprecation Docs and Release"
description: "Write the user-facing account from 001's declared-loss list, close 030 against the retirement the way 006 closed 033 and 024, and get the release cut rather than assumed."
trigger_phrases:
  - "implementation plan"
  - "gallery docs plan"
  - "007 phase 4 plan"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Gallery Deprecation Docs and Release

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | Markdown, JSON manifests |
| **Framework** | None |
| **Storage** | None — no runtime data changes |
| **Testing** | `npm run gate`'s `folder-docs` and `naming` lanes; a read of the rendered README |

### Overview

Three repository files carry the gallery as a current feature: `README.md` in four places,
`package.json`'s plugin `description`, and — after the migration — nothing else. The CHANGELOG entry
is written from `001`'s declared-loss list verbatim rather than summarised. Separately, `030` is
closed against the retirement the way `006`'s REQ-007 closed `033` and `024`: marked superseded,
keeping its own measurements as evidence.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [ ] `003` has landed — the docs describe a removal that happened
- [ ] `001`'s declared-loss list is available to quote verbatim
- [ ] `006`'s `008-docs-and-release` read, including the release it prepared and did not cut

### Definition of Done
- [ ] All acceptance criteria met
- [ ] `rg -i gallery README.md package.json` returns nothing offering it as a current feature
- [ ] Every declared loss appears individually in `CHANGELOG.md`
- [ ] The release is cut, or handed off **with the target version recorded here**
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Documentation follows implementation. Nothing here is written before `003` lands, because a
CHANGELOG that describes an unshipped removal is the same class of untruth as a gate that measures a
deleted file.

### Key Components

- **`README.md`**: `:22` ("Six database views"), `:43-45` (the screenshot table row), `:87` (page
  preview surfaces), `:120-123` (cover settings prose naming board and gallery).
- **`CHANGELOG.md`**: created by `006`'s `008`; this phase appends.
- **`package.json`**: `description` names the gallery among the view types.
- **`030-gallery-view-deprecation`**: closed against this retirement, measurements kept.

### Data Flow

None. This phase moves text.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `README.md:22` | Promises six views including the gallery | update | `rg -n -i gallery README.md` |
| `README.md:43-45` | Screenshot table row | update | The rendered table has no gallery column |
| `README.md:87`, `:120-123` | Page-preview and cover-settings prose | update | The board half survives; the gallery half goes |
| `package.json` `description` | Names the gallery | update | `rg -n gallery package.json` |
| `CHANGELOG.md` | Created by `006`'s `008` | update — append | The new entry names each loss individually |
| `030/spec.md` | Open at 4/6 against a removed view | update — superseded, measurements kept | Its Status line, and its measurements still present |
| `../../005-component-surface-system/roadmap.md` §5.A `030` row | Says "withdrawn, not removed" | update | The row reads as closed against this packet |

Required inventories:
- Same-class producers: `rg -rn -i gallery README.md package.json CHANGELOG.md`.
- Consumers of changed symbols: none — no symbol changes.
- Matrix axes: not applicable; this phase has no runtime behaviour.
- Algorithm invariant: **a loss named individually is a declared loss; a loss summarised is a
  discovered one.** That distinction is the phase's whole point.
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
| Unit | None — no code changes | n/a |
| Integration | `npm run gate`'s `folder-docs` and `naming` lanes still pass | `npm run gate` |
| Manual | Read the rendered README and the CHANGELOG entry as a user who lost a gallery would | Reading them |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| `003` landed | Internal | Red until it does | The docs would describe an unshipped removal |
| `001`'s declared-loss list | Internal | Red until `001` lands | REQ-002 is unwritable |
| The orchestrator's release cadence | External | Yellow | REQ-006 accepts a recorded handoff rather than an assumption |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

- **Trigger**: the release is pulled, or `003` is reverted.
- **Procedure**: revert the docs commit. It touches no code, so the revert is clean — but if a
  release already shipped, the CHANGELOG entry stays true for the users who took it.
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
| Setup | Low | Read `001`'s loss list and `006`'s `008`; under an hour |
| Core Implementation | Low | Four README locations, one CHANGELOG entry, one description, two spec edits. 2-3 hours |
| Verification | Low | Gate plus a read. Under an hour |
| **Total** | | **3-5 hours plus a release cut** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] The version being released is the one `003` verified
- [ ] `manifest.json`, `package.json` and `versions.json` agree
- [ ] `npm run gate` green on the release commit, read from `$?`

### Rollback Procedure
1. Revert the docs commit.
2. If a release shipped, do not rewrite its notes — publish a correction instead.
3. Confirm the gate still passes.
4. Tell the operator, because a released build is already in the iCloud vault.

### Data Reversal
- **Has data migrations?** No. `002` owned the data change.
- **Reversal procedure**: N/A.
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  README +    │────►│  Close 030   │────►│   Release    │
│  CHANGELOG   │     │  against it  │     │   cut        │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                 │
                                          ┌──────▼───────┐
                                          │  Operator    │
                                          │  confirms    │
                                          └──────────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| README + CHANGELOG | `001` loss list, `003` landed | The user-facing account | The release |
| Closing `030` | `003` landed | No packet open against a removed view | Nothing |
| Release | Both above | A shipped build | The operator row |
| Operator confirmation | The release | The packet closes | Nothing |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **`003` landed** - blocking - CRITICAL
2. **README, CHANGELOG, description** - 2-3 hours - CRITICAL
3. **Release cut** - orchestrator's - CRITICAL
4. **Operator opens a migrated vault** - not schedulable - CRITICAL

**Total Critical Path**: 3-5 hours plus a release boundary plus an operator pass

**Parallel Opportunities**:
- Closing `030` is independent of the README work.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | The repository stops offering the gallery | `rg -i gallery README.md package.json` returns nothing current | Phase 4 |
| M2 | Every loss is declared | Each `001` loss appears individually in `CHANGELOG.md` | Phase 4 |
| M3 | No packet open against a removed view | `030` reads superseded, measurements intact | Phase 4 |
| M4 | Shipped | A version number carries the removal | Phase 4 |
| M5 | Confirmed | The operator opens a migrated vault and reports it as migrated | Operator only |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

### ADR-001: The in-app "What's new" surface

**Status**: Proposed

**Context**: a user who never reads a CHANGELOG meets the migration inside the app. `006`'s `008`
faced the same question and put the in-app modal out of scope for itself.

**Decision**: to be taken in this phase.

**Consequences**:
- In scope: the people most affected are told where they are. It is a separate surface with its own
  work, and it would widen a documentation phase into a feature one.
- Out of scope: consistent with `006`, and the migration already shows a per-view notice
  (`notice.galleryMigrated`), which is not nothing.

**Alternatives Rejected**:
- **Silently relying on the per-view notice alone**: it explains what happened to one view, not what
  happened to the plugin.

---


<!-- SCAFFOLD_AI_PROTOCOL_MARKERS:
AI EXECUTION
Pre-Task Checklist
Execution Rules
Status Reporting Format
Blocked Task Protocol
-->
