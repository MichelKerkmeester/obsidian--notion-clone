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
    last_updated_at: "2026-09-05T04:30:00Z"
    last_updated_by: "phase-008-docs"
    recent_action: "README and CHANGELOG.md written; 033/024 closed; modal decision recorded"
    next_safe_action: "Release owed to the orchestrator's next cut (0.0.23); operator install confirmation follows"
    blockers:
      - "The release itself is not cut in this session; it is the orchestrator's next release"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "README.md"
      - "CHANGELOG.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-008-goal"
      parent_session_id: null
    completion_pct: 70
    open_questions: []
    answered_questions:
      - "Does the in-app changelog modal carry the notice? No — the repository CHANGELOG.md and the already-shipped notice.listMigrated toast carry it; the What's new modal is release-cut curation, out of this phase's scope."
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

- [x] A user whose list view became a table can find out why by reading the changelog, including the rollback sentence. **Done: `CHANGELOG.md` `## 0.0.23 (unreleased)` names all four `005`-declared losses individually and states the rollback sentence explicitly.**
- [x] The README's view list matches what the plugin ships. **Done: `README.md`'s "Seven views" and the Gallery/List screenshot pairing both dropped list; verified no remaining view-list mention.**
- [x] Nothing in `specs/` is still planning work on the list view. **Done: `033-list-virtualisation` and `024-list-view-freeze` both read Superseded (closed by commit `3818298f` during the `007` landing); a broader sweep found only stale checkboxes in unrelated, already-Complete packets, flagged rather than edited (out of this phase's scope).**
- [ ] The release is cut, installable, and carries the removal. **Deferred — cut by the orchestrator as part of the next release (0.0.23); this session made no version-file changes.**
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
| Removal dependency | Done | `007-remove-renderer-and-harness` landed on `main`, `6dec09b9`/`3313f8c0` |
| Rollback sentence | Used | D1 above; carried into `CHANGELOG.md` unchanged |
| README updated | Done | `README.md`: view count and screenshot table both drop list |
| Changelog entry | Done | `CHANGELOG.md` created (did not previously exist), `## 0.0.23 (unreleased)` |
| `033`/`024` closure confirmed | Done | Already closed on `main` by `3818298f`; this phase verified rather than re-closed |
| In-app "What's new" modal | Decided: not touched this phase | Release-cut curation; the shipped one-time notice already covers the affected-user case |
| Release | Owed | Deferred to the orchestrator's next release cut (0.0.23) |

### Deviations and findings

| Item | Note |
|------|------|
| The rollback sentence was written at open time | It is a property of the migration, not of the release, so writing it early costs nothing and stops it being reconstructed under time pressure. |
| `033` and `024` were already closed before this phase ran | A prior session's `007`-landing docs commit (`3818298f`) closed both against the retirement as part of reconciling `007` onto `main`. This phase verified the closures rather than repeating them. |
| `CHANGELOG.md` did not exist at repo root | Created fresh rather than modifying an existing file; no prior convention to preserve. |
<!-- /ANCHOR:log -->
