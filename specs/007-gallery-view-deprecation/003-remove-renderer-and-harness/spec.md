---
title: "Feature Specification: Remove the Gallery Renderer and Its Harness"
description: "Delete gallery-renderer.ts and every measurement of it in one change — bench, coverage pins, constructed scenario, capture entries, placement checks, unit specs and 81 dead CSS selectors."
trigger_phrases:
  - "remove gallery renderer"
  - "gallery harness removal"
  - "007 phase 3"
  - "gallery dead css"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/003-remove-renderer-and-harness"
    last_updated_at: "2026-09-05T07:16:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the removal phase"
    next_safe_action: "Blocked until 002 ships in a release; do not start on a merge"
    blockers:
      - "002 must be SHIPPED in a release, not merely merged (parent D8)"
    key_files:
      - "src/views/gallery-renderer.ts"
      - "tools/live/renderer-coverage.json"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-003-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does gallery leave DatabaseViewType, or stay accepted-but-redirected as list did?"
      - "Do the six gallery* ViewConfig fields go, or stay for the same reason the union value does?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Remove the Gallery Renderer and Its Harness

<!-- SPECKIT_LEVEL: 3 -->

> Phase chain: parent [`../spec.md`](../spec.md). Predecessor `002-settings-redirect-and-migrate`.
> **Do not start on a merge. Parent D8 requires `002` to have shipped in a release.**

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
| **Phase** | 3 of 4 |
| **Predecessor** | `002-settings-redirect-and-migrate` (must be released) |
| **Successor** | `004-docs-and-release` |
| **Handoff Criteria** | `gallery-renderer.ts` absent, gate exits 0 read from `$?`, coverage floor carries its reason |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 3** of the gallery view deprecation, and it is the only phase that deletes anything.

**Scope Boundary**: the renderer and everything that measures it. Not the docs, not the release —
those are `004`.

**Dependencies**: `002` shipped in a release. Not merged. Released.

**Deliverables**:
- `src/views/gallery-renderer.ts` deleted, 787 lines.
- Its bench, driver, coverage pins, constructed scenario, capture entries, placement checks and unit
  specs deleted in the same change.
- 81 `db-gallery-*` selectors gone from `styles.css`.
- ADR-001: does `gallery` leave `DatabaseViewType`?
- `npm run gate` exits 0 with the lanes **removed, not skipped**.

**Changelog**: when this phase closes, refresh the matching file in `../changelog/` using the parent
packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The renderer and its measurements are one unit, and taking them apart in two changes is how a gate
ends up asserting a file that no longer exists — or, worse, quietly skipping a lane and still
reporting green. `006-list-view-deprecation`'s `007` removed the list's renderer and its whole
measurement surface together for exactly this reason, and its `renderer-coverage.json` note reads
`"was 7/22; list renderer retired"` — the number moved *and said why beside itself*.

Two things make this phase harder than `006`'s equivalent. **Four of the six gallery capture ids
also mount the board**, so a blanket delete removes board coverage. And the persisted surface is
larger: `gallery` sits in `DatabaseViewType` alongside six `gallery*` `ViewConfig` fields, all of
them written into vault files.

### Purpose

The gallery stops existing in the plugin, and the gate gets smaller in a way that a reader can
audit.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `src/views/gallery-renderer.ts` — deleted.
- `tools/bench/gallery-render-bench.ts` and `tools/bench/run-gallery.mjs` — deleted.
- `tools/live/renderer-coverage.json` — the two `inputs` pins removed, `constructed`/`total` lowered
  with the reason beside the number.
- `tools/screenshots/constructed-scenarios.mjs:237` — the `constructed-gallery` scenario removed;
  the two shared card scenarios that cite the renderer edited rather than deleted.
- `tools/screenshots/scenarios/core.mjs` and `shared.mjs` — the gallery arms.
- `screenshots/manifest.json` — the gallery-only entries removed, the board-shared ones edited, per
  `001`'s classification.
- `tools/live/render-assertion-harness.ts`, `tools/storybook/verify-placement.mjs` — the gallery
  paths.
- `styles.css` — 81 `db-gallery-*` selectors.
- The gallery render branches in `database-view.ts` and `embedded-database-renderer.ts`.
- `src/i18n.ts` — the gallery keys whose surfaces are gone.
- ADR-001 on the union and the six config fields.

### Out of Scope
- `src/data/card-field-renderer.ts` — parent D5. The board uses it.
- The board's own cover settings in `view-config-panel-renderer.ts:1843-1845` — the shared renderer
  keeps its board half.
- `src/data/gallery-migration.ts` — it survives this phase, because it is what a vault still needs
  when it meets an old view. Its removal is a later question, not this packet's.
- README and CHANGELOG — `004`.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/gallery-renderer.ts` | Delete | 787 lines |
| `tools/bench/gallery-render-bench.ts` | Delete | 225 lines |
| `tools/bench/run-gallery.mjs` | Delete | 30 lines |
| `tools/live/renderer-coverage.json` | Modify | Two pins out; floor lowered with its reason |
| `tools/screenshots/constructed-scenarios.mjs` | Modify | `:237` scenario out; two shared ones edited |
| `tools/screenshots/scenarios/core.mjs`, `shared.mjs` | Modify | Gallery arms out |
| `screenshots/manifest.json` | Modify | Per `001`'s gallery-only vs board-shared classification |
| `tools/live/render-assertion-harness.ts` | Modify | Gallery construction path out |
| `tools/storybook/verify-placement.mjs` | Modify | Gallery placement checks out |
| `styles.css` | Modify | 81 selectors |
| `src/views/database-view.ts`, `src/views/embedded-database-renderer.ts` | Modify | Render branches |
| `src/data/types.ts` | Modify | Subject to ADR-001 |
| `src/i18n.ts` | Modify | Keys whose surfaces are gone |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | `src/views/gallery-renderer.ts` is deleted |
| REQ-002 | Every measurement `001` enumerated is removed in the **same change** as the renderer |
| REQ-003 | Lanes are **removed, not skipped**, and `npm run gate` exits 0 read from `$?` |
| REQ-004 | Board coverage is unchanged: every board-shared capture scenario still asserts what it asserted before |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-005 | `renderer-coverage.json` carries the new floor with the reason beside the number |
| REQ-006 | `styles.css` carries no `db-gallery-*` rule — **not deferred**, parent D6 |
| REQ-007 | ADR-001 decides whether `gallery` leaves `DatabaseViewType` and what happens to the six `gallery*` config fields |

> Acceptance criteria live in `acceptance-criteria.md`, which decides whether this phase may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `rg -l gallery-renderer` returns nothing outside spec documents.
- **SC-002**: the gate's lane list is shorter by the gallery's lanes and `$?` is 0.
- **SC-003**: board captures are byte-identical to their pre-change baselines.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | A board-shared capture scenario is deleted with its gallery arm | High — this is the phase's most likely failure | `001`'s classification is read first, and REQ-004 asserts board captures unchanged by hash |
| Risk | A lane is skipped rather than removed, so the gate still reads green | High | The lane list is compared by name before and after, and the count difference is explained rather than assumed |
| Risk | Removing `gallery` from the union strands an unmigrated view | High | ADR-001 takes the decision explicitly; `006`'s `007` ADR-001 kept `list` on the union for this reason |
| Risk | A harness regression appears that only the full capture run catches | Medium | `006`'s `007` hit exactly this — re-pointing shared builders at a different bench blanked several constructed scenarios, and only the full screenshot capture caught it. Run the full capture, not just the gate's `render-assertions` lane |
| Dependency | `002` shipped in a release | Red until it is | Parent D8. This phase does not start on a merge |
| Dependency | `001`'s capture classification | Red until `001` lands | REQ-004 is unimplementable without it |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: the gate gets shorter, not slower. Record the lane count and the wall time before and
  after, so "smaller" is a measurement rather than an impression.

### Security
- **NFR-S01**: no security surface changes. Recorded rather than skipped.

### Reliability
- **NFR-R01**: an unmigrated gallery view must still open after this phase. What it opens as is
  ADR-001's subject, and "whatever unknown-type coercion does" is not an acceptable answer.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A vault that skipped the `002` release and upgrades straight into this build: the reason ADR-001
  matters, and the reason `gallery-migration.ts` survives this phase.
- A capture scenario whose gallery arm exists in only one theme: classified per arm by `001`.

### Error Scenarios
- The gate's lane count drops by more than the gallery's lanes: something else was removed. Compare
  by name, not by count — `006`'s `007` saw its count land back at 25 by coincidence of timing, and
  said so rather than reporting "unchanged".
- A `db-gallery-*` selector is shared with a board rule through a comma-joined selector list:
  `styles.css:1188` and `:1411` are exactly this shape. Split, do not delete the line.

### State Transitions
- Renderer deleted while `gallery-migration.ts` remains: intentional, and it is what lets an old
  vault land somewhere chosen rather than somewhere accidental.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 22/25 | 13 files plus a manifest and a stylesheet; 1,042 lines deleted outright |
| Risk | 20/25 | It removes measurement. A mistake here makes the gate lie rather than fail |
| Research | 8/20 | `001` did most of it; ADR-001 is the remaining judgment |
| **Total** | **50/70** | **Level 3** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- **Does `gallery` leave `DatabaseViewType`?** `006`'s `007` ADR-001 decided the parallel question
  for the list: it stays, accepted-but-redirected, migrated permanently, because the value is
  written into vault files. The same reasoning applies and the same answer is likely, but it is a
  decision to take rather than a precedent to copy silently.
- **What happens to the six `gallery*` `ViewConfig` fields?** `galleryImageField` in particular is
  the input `gallery-migration.ts` reads. If the migration survives this phase — it does — then at
  least that field survives with it.
- **Does the plugin `description` in `package.json` change here or in `004`?** It names the gallery.
  Argument for here: it is part of the removal. Argument for `004`: it is user-facing text.
<!-- /ANCHOR:questions -->
