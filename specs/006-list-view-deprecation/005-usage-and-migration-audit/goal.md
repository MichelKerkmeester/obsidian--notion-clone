---
title: "Goal: Usage and Migration Audit"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "006 005 goal"
  - "list usage audit goal"
  - "list migration audit directive"
  - "data loss check"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/005-usage-and-migration-audit"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Authored the durable directive from the parent's conversion"
    next_safe_action: "Enumerate every list surface, every measurement of it, and every affordance the table lacks"
    blockers:
      - "The data-loss check has not run, so no migration knows yet what it drops"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-005-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Goal: Usage and Migration Audit

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Name everything the list touches — surfaces, measurements, and the affordances the table does not have — before anything is withdrawn or deleted.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | This phase is **read-only**. It changes no source file. A deprecation that starts by deleting is how a persisted union value becomes a data loss. |
| D2 | The output is an **enumeration, not an opinion**. Every list affordance without a table equivalent is named here, so a user meets a declared loss rather than discovers an undeclared one. |
| D3 | The audit names the measurement surface too: the `list-window` lane and its ratchet, the fixtures and constructed scenarios, the bench entry, the replay claims and the unit specs. `007` must be able to remove them without discovering one this audit missed. |
| D4 | `030-gallery-view-deprecation`'s migration targeted `board`, and that reasoning does **not** transfer. The list derives its tracks from the table's column widths, which is the evidence for `table`, and it is recorded rather than assumed. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../spec.md`, `../goal.md`, then this folder's `spec.md` and `plan.md`.

**It gates `006`.** The migration cannot know what it preserves until this has run, so
`006` does not start on an audit that is partly written.

**Precedence.** The parent's decisions outrank anything here; this document outranks any
summary of it. Name a conflict rather than resolving it silently.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Each row is checkable without opening another file, and each records what is true today
so the check has a value to move from.

- [ ] Every surface that offers `list` as a choice is enumerated with its file and line. **Today: `toolbar-renderer.ts:1297-1308` is the one known site, and nobody has counted the rest.**
- [ ] Every measurement of the list is enumerated: the lane, the ratchet, the fixtures, the constructed scenarios, the bench entry, the replay claims and the unit specs. **Today: `tools/gate.mjs:89` and `tools/live/list-window.json` are named in the parent spec; the full set is not.**
- [ ] Every list affordance with no table equivalent is named and dispositioned as a preserved feature or a declared loss. **Today: three are known — the stacked-title reading mode, `listCompactFields`, and the per-group create button at `list-renderer.ts:172` — and none is dispositioned.**
- [ ] The data-loss check has run against a real list-configured view and its result is recorded. **Today: it has not run.**
- [ ] `006` can implement the migration without reading a source file this audit did not name, and `007` can remove the measurement surface without finding one it missed.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened | Done | Parent conversion 2026-09-04; `../spec.md` PHASE DOCUMENTATION MAP |
| Surface enumeration | Pending | `tasks.md` |
| Measurement enumeration | Pending | `tasks.md` |
| Data-loss check | Pending | Blocked on a real list-configured view to run against |

### Deviations and findings

| Item | Note |
|------|------|
| Numbered `005`, not `001` | The lower numbers belong to superseded children that inbound references cite by path. Reusing them would silently repoint those citations. |
<!-- /ANCHOR:log -->
