---
title: "Feature Specification: Gallery Settings Redirect and Migration"
description: "Close the two surfaces that still mint a gallery after 030's withdrawal, and migrate every gallery-configured view to a board with its cover intact, in both render hosts."
trigger_phrases:
  - "gallery settings redirect"
  - "gallery migration to board"
  - "007 phase 2"
  - "gallery importer sanitizer"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/002-settings-redirect-and-migrate"
    last_updated_at: "2026-09-05T07:05:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the redirect and migration phase"
    next_safe_action: "Wait for 001's surface list; it decides this phase's requirement set"
    blockers:
      - "001's audit must land first: this phase's REQ set is written from its surface list"
    key_files:
      - "src/main.ts"
      - "src/data/gallery-migration.ts"
      - "src/views/embedded-database-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-002-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the embedded codeblock host migrate too, or ship 030's partial state knowingly?"
    answered_questions:
      - "The migration target is board, not table: it is the other cover-drawing surface"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Gallery Settings Redirect and Migration

<!-- SPECKIT_LEVEL: 3 -->

> Phase chain: parent [`../spec.md`](../spec.md). Predecessor `001-usage-and-migration-audit`.
> **This phase must SHIP in a release before `003` starts** — parent D8.

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
| **Phase** | 2 of 4 |
| **Predecessor** | `001-usage-and-migration-audit` |
| **Successor** | `003-remove-renderer-and-harness` |
| **Handoff Criteria** | The migration is shipped in a released build, not merely merged |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 2** of the gallery view deprecation.

**Scope Boundary**: the entry points and the migration. No renderer deletion, no CSS, no capture
changes — those are `003`.

**Dependencies**: `001`'s surface list. This phase's requirement set is written from it rather than
from a guess.

**Deliverables**:
- The settings-load sanitizer and the `.base` importer stop accepting or minting `gallery`.
- The migration runs on open in both render hosts, once per view, with a notice.
- A test asserting each closed surface refuses `gallery`, observed red before green.

**Changelog**: when this phase closes, refresh the matching file in `../changelog/` using the parent
packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

`030` withdrew the gallery from two pickers and stopped. `src/main.ts:146` and `:182` coerce an
unrecognised `viewType` to `table` but explicitly exempt `gallery`, so a settings load re-blesses the
value.

**The `.base` importer was the second candidate and it has already been fixed upstream.**
`main.ts:1577` reads `const viewType = bv.type === "cards" ? "board" : "table"`, and the comment
above it at `:1571-1576` states the reasoning this packet would otherwise have had to make:
withdrawing a type from the pickers did nothing about a path that kept minting it, and board is the
landing the gallery migration makes anyway. What is left there is naming — the locals are still
`galleryImageField` (`:1578`, `:1580`, `:1583`) and they land on `view.boardImageField` (`:1641`).
So this phase has **one** live minting surface to close, not two.

The migration itself is asymmetric. `applyGalleryMigration` is called from
`database-view.ts:11678` and nowhere else, so a gallery-configured **codeblock** embed renders
through `EmbeddedDatabaseRenderer` unmigrated. `006-list-view-deprecation` recorded this exact gap
as inherited from `030` and left the decision to a child; the decision is now this phase's.

### Purpose

After this phase, nothing can create a gallery and nothing still is one — in either host — and the
build that proves it has shipped.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `src/main.ts` settings-load sanitizer: `gallery` stops being exempt from the coercion.
- `src/main.ts` `.base` importer: verify it still lands a `cards` view on `board` (it does, `:1577`), and decide whether the gallery-named locals are renamed or left.
- `src/data/gallery-migration.ts`: whatever `001`'s declared-loss list says it is missing.
- `src/views/embedded-database-renderer.ts`: the migration call it has never had, or a recorded
  decision not to add it.
- The notice: `notice.galleryMigrated` already exists at `i18n.ts:1456` in three locales and is
  reused rather than rewritten.
- Tests: one per closed surface, each observed red before green.

### Out of Scope
- Deleting `gallery-renderer.ts` — `003`. It must keep working while unmigrated views still exist.
- `styles.css`, the manifest, the coverage pins, the bench — all `003`.
- `card-field-renderer.ts` — parent D5, shared with the board.
- Removing `gallery` from `DatabaseViewType` — `003`'s ADR, and doing it here would strand exactly
  the views this phase is migrating.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/main.ts` | Modify | The settings-load sanitizer at `:146`, `:182`. The `.base` importer at `:1571-1641` already lands on `board`; only its gallery-named locals remain, and renaming them is optional |
| `src/data/gallery-migration.ts` | Modify | Whatever `001`'s loss list requires |
| `src/views/embedded-database-renderer.ts` | Modify | The migration call, or a recorded decision against |
| `src/data/gallery-migration.test.ts` | Modify | Cases for each closed surface |
| `src/views/gallery-hide-and-migrate.test.ts` | Create | Mirrors `006`'s `list-hide-and-migrate.test.ts` |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | Every surface `001` enumerated refuses to accept or mint `viewType: "gallery"` — the settings-load sanitizer at minimum, plus anything the audit finds that this spec did not |
| REQ-002 | A gallery-configured view opens as a **board with the same cover image**, once, with a notice, in the standalone host |
| REQ-003 | Each closed surface has a test that was observed **red before green** |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | The embedded codeblock host either migrates too, or ships `030`'s partial state with the decision recorded in `decision-record.md` — knowingly, not by omission |
| REQ-005 | The migration runs once per view, not on every open. A notice on every refresh is a defect |
| REQ-006 | `npm run gate` exits 0 read from `$?` on the migration build |

> Acceptance criteria live in `acceptance-criteria.md`, which decides whether this phase may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: no code path in the plugin produces a `ViewConfig` with `viewType: "gallery"`.
- **SC-002**: a vault whose file declares a gallery view opens it as a board and says so once.
- **SC-003**: the build carrying both is released, which is what unblocks `003`.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | The notice fires on every refresh | Medium | The migration writes the new `viewType`, so the second open is not a gallery. Assert it with a two-open test |
| Risk | A cover is lost because `galleryImageField` is empty | Low | `030`'s migration already reads the field; an empty one means the gallery had no cover either |
| Risk | The embedded host is forgotten again | High — it has been forgotten twice | REQ-004 forces a recorded decision either way |
| Dependency | `001`'s surface list | Red until `001` lands | This phase does not start without it |
| Dependency | A release cut | Yellow | The cut is the orchestrator's; `003` waits for it, which is D8 |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: the migration runs on open and must not add a measurable frame to it. It is a pure
  function over one `ViewConfig`, so the budget is a formality rather than a risk.

### Security
- **NFR-S01**: the migration writes vault settings. It must not write outside the view it migrates.

### Reliability
- **NFR-R01**: migrating twice is a no-op. The second call sees a board and does nothing.
- **NFR-R02**: an undo restores the gallery `viewType`, and `undo.galleryMigration` already exists at
  `i18n.ts:392` in three locales.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A gallery view with no `galleryImageField`: migrates, carries no cover, and that is not a loss.
- A `.base` `cards` view naming an image field the schema does not have: `main.ts:1580` already
  guards it against the schema's column keys, and it already feeds the board path.
- A view carrying both `galleryImageField` and `boardImageField`: the migration must decide which
  wins, and record it.

### Error Scenarios
- The settings write fails: the view stays a gallery and renders as one, because the renderer is
  still present in this phase. That is the reason `003` comes after a release.
- The notice locale is missing: three locales carry `notice.galleryMigrated` today; a fourth would
  fall back rather than throw.

### State Transitions
- Gallery to board to undo: the undo restores `viewType` and the cover field together, or it is not
  an undo.
- A codeblock embed of a view migrated in the standalone host: reads the migrated config, so it
  needs no second migration — which is part of why REQ-004 is a P1 rather than a P0.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 12/25 | Five files, two of them small |
| Risk | 18/25 | It writes persisted vault data, and it is the phase that must be right before anything is deleted |
| Research | 6/20 | `001` did the research; this phase implements from its list |
| **Total** | **36/70** | **Level 3 by inheritance from the parent** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Does the embedded codeblock host migrate? Adding the call is small; the risk is that an embed
  writes to a source database from a reading view, which is the same class of question
  `046-linked-views-notion-parity`'s ADR-001 answered for linked views (the operator allowed the
  write). That precedent is worth reading before deciding.
- Should the `.base` importer's gallery-shaped settings be carried onto the board's equivalents, or
  dropped? `main.ts:1639`'s own comment says the gallery-shaped settings beside the image field have
  no board equivalent and are dropped today. Whether that stays true is `001`'s loss list to answer.
- Are the importer's gallery-named locals renamed? They already land on `boardImageField`, so this
  is legibility rather than behaviour — worth doing in this phase's commit, not worth a requirement.
<!-- /ANCHOR:questions -->
