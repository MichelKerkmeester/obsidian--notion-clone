---
title: "Feature Specification: Document and Release the List Removal"
description: "Say plainly, where users read it, that the list view is gone, what their views became, and what a rollback does not undo — then ship it. Also close the two 005 phases that were fixing a view that no longer exists."
trigger_phrases:
  - "list removal release"
  - "list deprecation changelog"
  - "006 phase 008"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Document and Release the List Removal

<!-- SPECKIT_LEVEL: 1 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 1 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-04 |
| **Branch** | Not yet dispatched |
| **Parent Spec** | ../spec.md |
| **Phase** | 4 of 4 in the deprecation (folder `008` of `008`) |
| **Predecessor** | 007-remove-renderer-and-harness |
| **Successor** | None |
| **Handoff Criteria** | None — this is the last phase |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is the **last deprecation phase** of `006-list-view-deprecation`.

**Scope Boundary**: what users read, and the release that carries the removal. Plus one piece of
housekeeping the packet owns and nobody else will do: closing the two `005` phases that were fixing
the list.

**Dependencies**:
- `007-remove-renderer-and-harness` — this documents what that removed.
- `../../005-component-surface-system/033-list-virtualisation/` and
  `.../024-list-view-freeze/` — both open against a view that no longer exists.

**Deliverables**:
- README and changelog entries saying what happened and what it cost.
- The release.
- `033` and `024` closed against this decision, with the reason in each.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

A removed view that nobody documented is a bug report waiting to be filed. Users whose list views
became tables need to read why, and users considering the plugin need the view list to be true.

There is also a rollback statement that has to be made explicitly, because the intuitive reading is
wrong: reverting the removal brings back the renderer, and it does **not** turn migrated views back
into lists. Those are tables now, permanently, and a release note that leaves that to inference is a
release note that will be quoted back later.

Two `005` phases also need closing. `033-list-virtualisation` and `024-list-view-freeze` were opened
against list-specific defects and shipped real work; `024`'s own AC-6 already reads NOT MET. Leaving
them open against a removed view is how a roadmap starts lying.

### Purpose

Anyone who had a list view can find out what happened to it, and nothing in the tree is still
planning to fix the view that was removed.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- The README's view list.
- The changelog entry: the removal, the migration, the declared losses `005` named, and what a
  rollback does not undo.
- The release.
- Closing `033-list-virtualisation` and `024-list-view-freeze` against this decision, with the
  reason recorded in each rather than in a commit message.

### Out of Scope
- Any code change. `007` finished the code; this phase writes and ships.
- The gallery's documentation. `030` owns it and is at a different stage.
- Re-litigating a declared loss. `005` named them; the changelog reports them.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `README.md` | Modify | The view list |
| `src/i18n.ts` | Modify | Only if the changelog modal string needs the release note, in three locales |
| `manifest.json`, `package.json`, `versions.json` | Modify | The release version |
| `../../005-component-surface-system/033-list-virtualisation/` | Modify | Closed against this decision, reason recorded |
| `../../005-component-surface-system/024-list-view-freeze/` | Modify | Same |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-001 | The README's view list no longer names the list view. | The rendered list read |
| REQ-002 | The changelog says what was removed, what existing views became, and — explicitly — that a rollback restores the renderer but does not turn migrated views back into lists. | The entry read against `007`'s rollback section |
| REQ-003 | Every loss `005` declared is named in the changelog. A loss recorded only in a spec folder is a loss the user meets without warning. | The changelog checked against `005`'s data-loss list, item by item |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|----|-------------|---------------------|
| REQ-004 | `033-list-virtualisation` and `024-list-view-freeze` are closed against this decision, with the reason in each document rather than in a commit message. | Both packets read |
| REQ-005 | The release ships and is installable, following this repository's release cadence. | The release exists and the operator can install it |
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: a user whose list view became a table can find out why by reading the changelog.
- **SC-002**: nothing in `specs/` is still planning work on the list view.
- **SC-003**: the release is installable and the operator installs it.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `007` complete | Blocks — there is nothing to document until the removal lands | Sequential by design |
| Dependency | `005`'s data-loss list | Blocks REQ-003 | It is the audit's deliverable |
| Risk | The rollback statement is left to inference | Med — it is the sentence most likely to be quoted back | REQ-002 names it explicitly |
| Risk | A declared loss is summarised rather than listed | Med | REQ-003 asks for item-by-item, checked against `005` |
| Risk | `033` and `024` are closed in a commit message instead of in their own documents | Low, and it is how a roadmap starts lying | REQ-004 requires the reason in each document |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

- Does the removal ride an existing release or get its own? The operator's cadence publishes each
  milestone; a removal is arguably a milestone. Recorded, not decided.
- Does the in-app changelog modal carry the notice, or only the repository changelog? The modal is
  what a phone user actually sees, and it is i18n'd, which makes it the more expensive option and
  probably the right one.
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
