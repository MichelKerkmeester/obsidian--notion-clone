---
title: "Goal: Gallery Deprecation Docs and Release"
description: "The durable directive this phase executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "gallery docs goal"
  - "007 phase 4 goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/004-docs-and-release"
    last_updated_at: "2026-09-06T00:30:00Z"
    last_updated_by: "gallery-007-004-docs-and-release"
    recent_action: "README/CHANGELOG/package.json rewritten; 030 closed against retirement; 0.0.28 recorded"
    next_safe_action: "None here — the final row is the operator's and an agent never ticks it"
    blockers:
      - "The final row is the operator's and an agent never ticks it"
    key_files:
      - "spec.md"
      - "README.md"
      - "CHANGELOG.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-004-goal"
      parent_session_id: null
    completion_pct: 86
    open_questions: []
    answered_questions:
      - "The in-app What's new modal stays out of scope, same as 006's 008 — README plus CHANGELOG plus the already-shipped per-view notice carry it"
---
# Goal: Gallery Deprecation Docs and Release

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Tell a user whose gallery became a board exactly what happened, what it cost and what
a rollback does not undo; leave no packet open against a view that no longer exists; ship it.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Every loss is named individually.** "Some gallery settings were dropped" is a discovered loss wearing the clothes of a declared one. `001`'s list is quoted, not summarised. |
| D2 | **The rollback sentence is mandatory.** A migrated view stays a board after a revert; the only reversal is the per-view in-app undo. A user who is not told this will assume otherwise. |
| D3 | **`030` closes against this retirement, keeping its measurements.** `006`'s REQ-007 marked `033` and `024` superseded while keeping their historical numbers as evidence. Same move here. |
| D4 | **The release is cut or the handoff records the target version.** `006`'s `008` prepared its docs and left the cut owed — honest, and the reason this phase makes the target version a written artefact rather than an intention. |
| D5 | **The docs are written after `003` lands, never before.** A CHANGELOG describing an unshipped removal is the same class of untruth as a gate measuring a deleted file. |
| D6 | **The final row is the operator's.** An agent never ticks it. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../spec.md`, `../goal.md`, `../001-usage-and-migration-audit/implementation-summary.md`
for the loss list, `../003-remove-renderer-and-harness/implementation-summary.md` for what was
actually removed, then this folder's `spec.md` and `plan.md`.

**It closes the packet.** Everything above it is machinery; this is the part a user meets.

**Precedence.** The parent's decisions outrank anything here; this document outranks any summary of
it. Name a conflict rather than resolving it silently.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Each row is checkable without opening another file, and each records what is true today so the check
has a value to move from.

- [x] `README.md` no longer offers the gallery as a view a reader can choose. **Was 7 references,
      including "Six database views" at `:22` and a screenshot row at `:43-45`; now "Five database
      views", the Gallery screenshot row removed, and `rg -n -i gallery README.md` returns nothing.**
- [x] `CHANGELOG.md` names every `001`-declared loss **individually**. **`## 0.0.28`'s entry names all
      six `gallery*` fields by name: three fully carried, one softened to a numeric value, two
      genuine losses.**
- [x] `CHANGELOG.md` states that a migrated view stays a board after a rollback, and that the only
      reversal is the per-view in-app undo. **Stated in the `## 0.0.28` Removed section.**
- [x] `package.json`'s plugin `description` no longer names the gallery. **Also dropped from its
      `keywords` array, since `rg -i gallery README.md package.json` checks the whole file, not only
      the `description` field.**
- [x] `030-gallery-view-deprecation` reads as closed against this retirement, its own measurements
      intact. **Was 4/6 and open; now Superseded, 5/6, with its renderer-coverage and gate rows
      resolved by `007`'s child `003` and cited to `fb27ba5b`/`932fa3a9`.**
- [x] A release carries the removal, or the cut is handed off with the target version written down.
      **Release 0.0.28 (`d3433d81`) already carries children `001`-`003`** — it was cut before this
      doc phase started, since the orchestrator's release cadence does not wait on documentation.
- [ ] **The operator opens a vault that had a gallery view and reports it as migrated rather than
      broken.** Only the operator closes this row.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Parent packet opened 2026-09-05; `../spec.md` PHASE DOCUMENTATION MAP |
| `003` landed | Done | `fb27ba5b`, re-stamped `932fa3a9`; `tasks.md` T001 |
| README updated | Done | Four locations; `rg -n -i gallery README.md` returns nothing; `tasks.md` T004, T005 |
| CHANGELOG entry | Done | `## 0.0.28`, every `001`-declared loss named individually; `tasks.md` T007 |
| `030` closed against the retirement | Done | `030/spec.md` Superseded, `030/goal.md` and `tasks.md` rows moved; `tasks.md` T008, T009 |
| Release | Done | **0.0.28** (`d3433d81`) already carries `001`-`003`; `tasks.md` T014 |
| Operator confirmation | Not started | Operator only; `tasks.md` T015 says so explicitly |

### Deviations and findings

| Item | Note |
|------|------|
| `CHANGELOG.md` already exists | It did not before `006`'s `008` created it, so this phase appends rather than creates. That is a change from `006`'s own experience of the same phase. |
| The README's gallery references are not all deletions | `:87` and `:120-123` name the board and the gallery in the same sentence. The board half survives; a careless delete takes it with the gallery. |
| `006`'s equivalent phase left its release owed | It prepared docs and deferred the cut to the orchestrator's next release (0.0.23), with `manifest.json`/`package.json`/`versions.json` still reading `0.0.22`. That is honest and it is also why D4 requires the target version to be written down rather than assumed. |
| The in-app "What's new" question is inherited | `006`'s `008` put it out of scope for itself. ADR-001 in `plan.md` takes it either way rather than inheriting the answer silently. **Decided 2026-09-06: out of scope, matching `006`.** README plus CHANGELOG plus the already-shipped `notice.galleryMigrated` toast carry it; a modal is a separate feature surface this doc phase does not widen into. |
| `manifest.json`'s own `description` also names the gallery, and is outside this phase's named scope | Neither `spec.md`'s Files to Change table nor REQ-005 names `manifest.json`, only `package.json` — and it is the file Obsidian's Community Plugins browser actually reads. Named here rather than silently fixed, since touching it would exceed this phase's granted scope. |
| `package.json`'s `description` and `keywords` still name `list`, which 006 never fixed either | Out of scope for a gallery-only retirement; named rather than fixed, matching scope discipline. |
<!-- /ANCHOR:log -->
