---
title: "Goal: ClickUp Chrome (Superseded)"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "006 002 goal"
  - "clickup chrome superseded"
  - "list chrome history"
importance_tier: "informational"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/002-clickup-chrome"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Marked superseded when the operator retired the list view"
    next_safe_action: "Leave closed"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "../superseded-clickup-direction.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-002-goal"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Goal: ClickUp Chrome (Superseded)

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Superseded. This phase was opened to: Give the rebuilt list ClickUp's own chrome: its row grammar, its group headers and its density. The operator retired the list view on 2026-09-04, so it is kept as history and executes nothing.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Superseded 2026-09-04.** The operator said *"Also deprecate list view completely"*, which replaced the ClickUp direction outright rather than amending it. Nothing in this folder binds. |
| D2 | It is **marked, not deleted**. The ClickUp interaction study and the decision records here are the record of why the direction changed, and that is real work. |
| D3 | It is **not validated as part of the deprecation's progress**, and its criteria are not counted into any figure. They describe a direction that no longer exists. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../spec.md`, `../goal.md`, then this folder's `spec.md` and `plan.md`.

**Nothing here gates anything.** The live deprecation is `005` -> `006` -> `007` -> `008`;
the direction this folder belongs to is recorded in `../superseded-clickup-direction.md`
and `../decision-record.md`.

**Precedence.** The parent's decisions outrank anything here; this document outranks any
summary of it. Name a conflict rather than resolving it silently.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

**This phase is superseded and has no open work.** The row below is the only one, and it is
already met: the folder is marked, kept and readable. Nothing here is scheduled, and the
deprecation's progress is not measured against it.

- [x] The folder is marked superseded in place, keeps its content, and stays readable to anything that cites it by path. **Met 2026-09-04**: `spec.md`'s Status row reads **Superseded 2026-09-04**, and no file was deleted.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Direction superseded | Done | Operator 2026-09-04; `../spec.md` PHASE DOCUMENTATION MAP |

### Deviations and findings

| Item | Note |
|------|------|
| Kept rather than deleted | `../goal.md` D6. Deleting it would remove the only record of why the direction changed. |
<!-- /ANCHOR:log -->
