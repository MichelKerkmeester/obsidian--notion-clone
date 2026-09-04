---
title: "Goal: Docs and Release"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "006 008 goal"
  - "list deprecation release goal"
  - "deprecation changelog"
  - "rollback statement"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/008-docs-and-release"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Authored the durable directive from the parent's conversion"
    next_safe_action: "Blocked on 007; the rollback sentence is already written and does not change"
    blockers:
      - "007-remove-renderer-and-harness has not run"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-008-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Goal: Docs and Release

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Document the removal where a user whose list became a table will actually read it, and ship the release that carries it.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **The rollback sentence is stated, never inferred.** Reverting the removal brings back the renderer; it does **not** turn migrated views back into lists. Those are tables permanently, and a release note that leaves that to inference is one that gets quoted back later. |
| D2 | A removed view nobody documented is a bug report waiting to be filed. The changelog is where a user finds out why, and the README's view list has to be true rather than aspirational. |
| D3 | Nothing in `specs/` is still planning work on the list view when this phase closes — `033-list-virtualisation` and `024-list-view-freeze` included. |
| D4 | The release is not done when it is cut. It is done when the operator installs it, which is the only row here nothing in this repository can close. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../spec.md`, `../goal.md`, then this folder's `spec.md` and `plan.md`.

**Blocked by `007`.** This phase documents a removal that has happened, not one that is planned.

**Precedence.** The parent's decisions outrank anything here; this document outranks any
summary of it. Name a conflict rather than resolving it silently.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Each row is checkable without opening another file, and each records what is true today
so the check has a value to move from.

- [ ] A user whose list view became a table can find out why by reading the changelog, including the rollback sentence. **Today: the changelog has no entry.**
- [ ] The README's view list matches what the plugin ships. **Today: it still offers list.**
- [ ] Nothing in `specs/` is still planning work on the list view. **Today: `033-list-virtualisation` and `024-list-view-freeze` are both open against it.**
- [ ] The release is cut, installable, and carries the removal.
- [ ] **The operator installs it and reports the migrated vault as working.** Only the operator closes this row.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Parent conversion 2026-09-04 |
| Removal dependency | Blocked | `007-remove-renderer-and-harness` |
| Rollback sentence | Drafted | D1 above; it does not change with the release number |

### Deviations and findings

| Item | Note |
|------|------|
| The rollback sentence was written at open time | It is a property of the migration, not of the release, so writing it early costs nothing and stops it being reconstructed under time pressure. |
<!-- /ANCHOR:log -->
