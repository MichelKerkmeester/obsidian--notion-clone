---
title: "Feature Specification: Gallery Deprecation Docs and Release"
description: "Tell a user whose gallery became a board what happened, what it cost and what a rollback does not undo; close 030's open rows against the retirement; ship the release."
trigger_phrases:
  - "gallery deprecation docs"
  - "gallery release notes"
  - "007 phase 4"
  - "gallery changelog"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/004-docs-and-release"
    last_updated_at: "2026-09-05T07:24:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Authored the docs and release phase"
    next_safe_action: "Blocked until 003 lands; the docs cannot describe a removal that has not happened"
    blockers:
      - "003 must land before the docs can describe what was removed"
    key_files:
      - "README.md"
      - "CHANGELOG.md"
      - "package.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-004-spec"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the in-app What's new modal carry this, or is README and CHANGELOG enough?"
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Gallery Deprecation Docs and Release

<!-- SPECKIT_LEVEL: 3 -->

> Phase chain: parent [`../spec.md`](../spec.md). Predecessor `003-remove-renderer-and-harness`.
> The last phase, and the one that carries the packet's only operator-closable row.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Not started |
| **Created** | 2026-09-05 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Phase** | 4 of 4 |
| **Predecessor** | `003-remove-renderer-and-harness` |
| **Successor** | None |
| **Handoff Criteria** | The release ships, and the operator opens a migrated vault |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is **Phase 4** of the gallery view deprecation.

**Scope Boundary**: user-facing text, the cross-packet reconciliation, and the release. No `src/`
behaviour changes.

**Dependencies**: `003` landed. The docs cannot describe a removal that has not happened.

**Deliverables**:
- `README.md`: the view count, the screenshot table, and the prose that names the gallery.
- `CHANGELOG.md`: an entry naming every `001`-declared loss individually, and stating plainly what a
  rollback does not undo.
- `030-gallery-view-deprecation`'s open rows closed **against this retirement**.
- `package.json`'s plugin `description`, which names the gallery.
- The release.

**Changelog**: when this phase closes, refresh the matching file in `../changelog/` using the parent
packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

A user whose gallery view became a board did not ask for that and will meet it without warning. The
plugin's own README still promises "Six database views" including the gallery at `:22`, shows a
gallery screenshot at `:43-45`, and describes gallery cover settings at `:120-123`. `package.json`'s
`description` names it too.

There is a second problem that is not user-facing and matters as much: `030-gallery-view-deprecation`
stays open at 4/6 against a view that no longer exists. `006-list-view-deprecation`'s REQ-007 made
the equivalent move for `033-list-virtualisation` and `024-list-view-freeze` — both `spec.md`s were
marked superseded, each keeping its own historical measurement as evidence rather than deleting it.

### Purpose

The retirement is legible from outside the repository, and no packet is left open against something
that is gone.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- `README.md`: view count at `:22`, the screenshot table at `:43-45`, page-preview prose at `:87`,
  cover-settings prose at `:120-123`.
- `CHANGELOG.md`: the retirement entry.
- `package.json`: the plugin `description`.
- `030-gallery-view-deprecation`'s open rows, closed against this retirement.
- The release cut, or the handoff of it to the orchestrator with the version recorded.

### Out of Scope
- Any `src/` or `tools/` change — `003` finished those.
- `assets/screenshots/gallery-view.png` itself. Removing the README reference is this phase's;
  whether the asset file is deleted is a repository-hygiene question, not a user-facing one.
- The in-app "What's new" modal, unless §10's question is answered yes. `006`'s `008` decided the
  same question out of scope for itself.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `README.md` | Modify | Four locations naming the gallery |
| `CHANGELOG.md` | Modify | The retirement entry, every loss named individually |
| `package.json` | Modify | The plugin `description` |
| `../../005-component-surface-system/030-gallery-view-deprecation/spec.md` | Modify | Marked superseded by this retirement, keeping its own measurements |
| `../../005-component-surface-system/roadmap.md` | Modify | The `030` row in §5.A, trued up |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | `README.md` no longer offers the gallery as a view a reader can choose |
| REQ-002 | `CHANGELOG.md` names **every** `001`-declared loss individually — not "some settings" |
| REQ-003 | `CHANGELOG.md` states what a rollback does not undo: a migrated view stays a board, and the only reversal is the per-view in-app undo |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-004 | `030-gallery-view-deprecation`'s open rows read as closed against this retirement, each keeping its own historical measurement |
| REQ-005 | `package.json`'s plugin `description` no longer names the gallery |
| REQ-006 | The release ships, or the cut is handed to the orchestrator with the target version recorded here |

> Acceptance criteria live in `acceptance-criteria.md`, which decides whether this phase may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: `rg -i gallery README.md package.json` returns nothing that offers the gallery as a
  current feature.
- **SC-002**: a reader of `CHANGELOG.md` can list what their migrated view lost without opening the
  repository.
- **SC-003**: `030` no longer reads as in-progress work on a live surface.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Risk | The CHANGELOG summarises losses instead of listing them | Medium — it is the difference between a declared loss and a discovered one | REQ-002 requires each one named; `001`'s list is the source and is quotable verbatim |
| Risk | The release is assumed rather than cut | High — `006`'s `008` prepared docs and left the cut owed | REQ-006 accepts a handoff **with the version recorded**, not an assumption |
| Risk | `030` is edited in a way that deletes its measurements | Medium | REQ-004 keeps them; `006`'s REQ-007 is the precedent — superseded, not erased |
| Dependency | `003` landed | Red until it does | The docs would describe a removal that has not happened |
| Dependency | `001`'s declared-loss list | Red until `001` lands | REQ-002 is unwritable without it |
| Dependency | The orchestrator's release cadence | Yellow | `006`'s `008` already owes a 0.0.23 cut; this is a candidate for a later one |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: not applicable. This phase changes documentation and a version number.

### Security
- **NFR-S01**: not applicable. No code path changes.

### Reliability
- **NFR-R01**: the released build must be the one `003` verified. A doc-only commit on top of it is
  fine; a rebase that moves the code underneath it is not.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A user who never had a gallery: the CHANGELOG entry must not read as though something was taken
  from them.
- A user on a very old build who upgrades past both releases at once: they meet the migration and
  the removal together, which is the case the CHANGELOG's rollback sentence is written for.

### Error Scenarios
- `CHANGELOG.md` did not exist before `006`'s `008` created it. It exists now, so this phase appends
  rather than creates.
- The release is cut without this phase's docs: the retirement ships undocumented. REQ-006 exists to
  stop that, and recording the target version is what makes it checkable.

### State Transitions
- `030` moves from in-progress to superseded, and its own evidence stays readable. The packet is
  closed against a decision, not deleted.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 8/25 | Three repository files plus two spec documents |
| Risk | 10/25 | Low technically; the risk is a loss that goes undeclared and is met as a surprise |
| Research | 4/20 | `001` supplies the loss list |
| **Total** | **22/70** | **Level 3 by inheritance from the parent** |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Does the in-app "What's new" modal carry this? `006`'s `008` decided the same question out of
  scope for itself. A user who never reads a CHANGELOG meets the migration in the app, which is an
  argument for yes; the counter-argument is that it is a separate surface with its own work.
- Is `assets/screenshots/gallery-view.png` deleted, or left as history? Removing the README
  reference is in scope. Deleting the asset is repository hygiene and can go either way, so long as
  the choice is recorded rather than left to whoever notices it next.
<!-- /ANCHOR:questions -->
