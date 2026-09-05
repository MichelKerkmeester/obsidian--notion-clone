---
title: "Feature Specification: Gallery Usage and Migration Audit"
description: "Before anything is removed: what a live vault holds, every surface that accepts or mints a gallery, what a board migration loses, and every check that measures the gallery today."
trigger_phrases:
  - "gallery usage audit"
  - "gallery migration audit"
  - "007 phase 1"
  - "what mints a gallery"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/001-usage-and-migration-audit"
    last_updated_at: "2026-09-05T06:50:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the audit phase from the parent inventory"
    next_safe_action: "Run T001: enumerate every surface that accepts or mints viewType gallery"
    blockers: []
    key_files:
      - "src/main.ts"
      - "src/data/gallery-migration.ts"
      - "screenshots/manifest.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-001-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "How many gallery views does the operator's vault actually hold?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Gallery Usage and Migration Audit

<!-- SPECKIT_LEVEL: 3 -->

> Phase chain: parent [`../spec.md`](../spec.md). This phase writes no production code. It exists so
> the three phases after it are removing things whose cost is known.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P0 |
| **Status** | Not started |
| **Created** | 2026-09-05 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Phase** | 1 of 4 |
| **Predecessor** | `../../005-component-surface-system/030-gallery-view-deprecation` (withdrawal) |
| **Successor** | `002-settings-redirect-and-migrate` |
| **Handoff Criteria** | Every accepting or minting surface enumerated; every declared loss named individually |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 1** of the gallery view deprecation.

**Scope Boundary**: reading and measuring only. No `src/` change, no `tools/` change, no deletion.

**Dependencies**: none. `030`'s withdrawal already shipped, so this phase can start immediately.

**Deliverables**:
- An enumeration of every surface that accepts, mints or renders `viewType: "gallery"`.
- A per-scenario reading of the 24 gallery-touching capture entries, splitting gallery-only from
  board-shared.
- A declared-loss list: what a gallery-to-board migration cannot carry, named loss by loss.
- A measurement surface inventory: every lane, bench, pin, fixture and unit spec that reads the
  gallery.

**Changelog**: when this phase closes, refresh the matching file in `../changelog/` using the parent
packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

`030-gallery-view-deprecation` withdrew the gallery from two pickers and stopped. It did not
enumerate what else accepts the value, and two surfaces survived it: the settings-load sanitizer at
`main.ts:146`/`:182`. A second candidate this packet's first draft also named — the `.base` importer
— turned out to have been fixed upstream already (`main.ts:1577` lands `cards` on `board`), which is
itself the argument for this phase: an inherited list is not an audit. `006-list-view-deprecation`
hit exactly this class — its own `005-usage-and-migration-audit` found two list-minting surfaces its
parent spec had never named, and recorded that its REQ-002 needed to account for all three rather
than just the picker.

Removing a renderer without that enumeration is how a deprecation ships a vault that can still mint
the thing it deleted.

### Purpose

Produce the three lists the next three phases consume, each derived from the tree rather than from
this packet's own prose.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Every surface that accepts, mints, coerces or renders `viewType: "gallery"`.
- The six persisted `gallery*` `ViewConfig` fields and who reads each one.
- What a gallery-to-board migration carries and what it drops.
- Every measurement of the gallery: lanes, benches, coverage pins, capture scenarios, placement
  checks, fixtures and unit specs.
- Actual vault usage, insofar as the operator's vault can be read.

### Out of Scope
- Any change to `src/`, `tools/`, `styles.css` or the manifest — that is `002` and `003`.
- The union decision (`does gallery leave DatabaseViewType`) — that is `003`'s ADR, informed by this
  audit rather than taken in it.
- `card-field-renderer.ts` — shared with the board, out of scope for the whole packet (parent D5).

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `implementation-summary.md` | Modify | The three lists this phase exists to produce |
| `scratch/` | Create | Raw grep and script output backing each list |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Every surface that accepts, mints or coerces `viewType: "gallery"` is enumerated with `file:line`, including the two `030` left open |
| REQ-002 | Each of the 24 gallery-touching capture entries is classified gallery-only or board-shared, with the board contribution named for every shared one |
| REQ-003 | Every declared loss of a gallery-to-board migration is named individually, not as "some settings" |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | Every check that measures the gallery is listed: lane, bench, coverage pin, constructed scenario, placement check, fixture, unit spec |
| REQ-005 | Actual vault usage is reported — how many gallery-configured views exist — or its unavailability is stated rather than glossed |

> Acceptance criteria live in `acceptance-criteria.md`, which decides whether this phase may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `002` can write its requirement set directly from this phase's surface list, with no
  surface discovered afterwards.
- **SC-002**: `003` can delete capture entries without removing board coverage, because every shared
  scenario is already classified.
- **SC-003**: `004` can name every loss in the CHANGELOG individually, because this phase named them.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | The audit is done by grep alone and misses a dynamic construction | High — this is exactly how `030` missed the importer | Grep for the string, then read every call site of `viewType` assignment and of `DatabaseViewType`, not only literal `"gallery"` |
| Risk | The vault cannot be read from this session | Medium | State it as unavailable rather than reporting zero; `006`'s audit could read one and reported one list view found |
| Dependency | `030`'s own documents | Green | Its `spec.md` §7 already asks the union question and is worth reading before re-deriving it |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: not applicable. This phase runs greps and reads files; nothing it produces runs at
  runtime.

### Security
- **NFR-S01**: vault reads are read-only. No vault file is written by this phase.

### Reliability
- **NFR-R01**: every list carries the command that produced it, so a later reader can re-derive it
  rather than trust it.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A view with `viewType: "gallery"` and no `galleryImageField`: the migration has no cover to carry.
- A `.base` import whose `cards` view names an image field absent from the schema — `main.ts:1580`
  already guards this against the schema's column keys, and the guard is part of the surface list.

### Error Scenarios
- The operator's vault is unavailable: report unavailable, do not infer.
- A capture scenario mounts the gallery only in one theme or device arm: classify per arm, not per id.

### State Transitions
- A view already migrated by `030`'s on-open path is no longer a gallery and must not be counted as
  one.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | Reading only; 72 files carry the string |
| Risk | 4/25 | No production change; the risk is a miss, not a break |
| Research | 18/20 | The whole phase is research |
| **Total** | **30/70** | **Level 3 by inheritance from the parent, not by its own score** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- How many gallery-configured views does the operator's vault actually hold? `006`'s audit could
  answer the same question for the list — it found one — and this phase should try the same route
  before declaring it unanswerable.
- Do any of the six `gallery*` `ViewConfig` fields have a reader outside the gallery renderer and the
  config panel? `data-source.ts` parses them in two places; whether anything else consumes them
  decides whether `003` can drop them.
<!-- /ANCHOR:questions -->
