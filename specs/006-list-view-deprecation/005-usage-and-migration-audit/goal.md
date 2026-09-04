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
    last_updated_at: "2026-09-04T20:35:23Z"
    last_updated_by: "phase-author"
    recent_action: "Ran the three-direction enumeration and wrote the data-loss list"
    next_safe_action: "006-hide-and-migrate implements the migration against this audit's findings"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-005-goal"
      parent_session_id: null
    completion_pct: 100
    open_questions:
      - "Does list leave DatabaseViewType, or stay accepted-but-redirected like gallery? Recommend: stay accepted-but-redirected, decided by 007."
      - "Are stacked titles and listCompactFields declared losses? Recommend: yes for both, dispositioned in implementation-summary.md §6."
    answered_questions:
      - "The per-group create button is not a declared loss — table's version calls the same createEntryNearEnd and carries real CSS where the list's carries none"
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

- [x] Every surface that offers `list` as a choice is enumerated with its file and line. **Done: the picker (`toolbar-renderer.ts:1297-1308`), the settings-load sanitizer (`main.ts:142,178`), and the `.base` importer (`main.ts:1544,1551,1585`) — three surfaces, not one.**
- [x] Every measurement of the list is enumerated: the lane, the ratchet, the fixtures, the constructed scenarios, the bench entry, the replay claims and the unit specs. **Done: `implementation-summary.md` §2 — 1 gate lane (16 checks, pins both list and table renderers), 1 bench, 1 coverage pin (7/22), 2 replay claims, 2 constructed scenarios, 3 screenshot fixture ids, 2 list-only unit specs plus 2 shared specs carrying list assertions.**
- [x] Every list affordance with no table equivalent is named and dispositioned as a preserved feature or a declared loss. **Done: `implementation-summary.md` §6 — 4 declared losses (`listCompactFields`, stacked title, roving-tabindex keyboard model, `col.wrap`); the per-group create button confirmed NOT a loss on inspection.**
- [x] The data-loss check has run against a real list-configured view and its result is recorded. **Done against the operator's own `Database Testbed/Testbed.md` (viewType: list, "Punch List") — 1 of 244 files in that vault; result recorded in `implementation-summary.md` §4 and §6.**
- [x] `006` can implement the migration without reading a source file this audit did not name, and `007` can remove the measurement surface without finding one it missed.
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
| Surface enumeration | Done | `implementation-summary.md` §1 — 8 `viewType === "list"` branches, 3 view-minting surfaces |
| Measurement enumeration | Done | `implementation-summary.md` §2 |
| Data-loss check | Done | `implementation-summary.md` §6, run against the operator's own list-configured view |

### Deviations and findings

| Item | Note |
|------|------|
| Numbered `005`, not `001` | The lower numbers belong to superseded children that inbound references cite by path. Reusing them would silently repoint those citations. |
| Two more list-minting surfaces than the spec named | `spec.md` and the parent named only the view picker. The settings-load sanitizer (`main.ts:142,178`) and the `.base` file importer (`main.ts:1544-1585`) also mint or preserve `list` views; `006` needs to touch both, not only the picker |
| The embedded-codeblock gap is inherited, not new | `gallery-migration.ts` is only ever called from `database-view.ts`'s `refresh()` — never from `embedded-database-renderer.ts`. A list migration built the same way inherits the identical gap the gallery's own deprecation log already records as unfinished |
| One of three opening data-loss candidates was wrong | The per-group create button (`list-renderer.ts:172`) has zero CSS rules for its own class; the table's equivalent calls the same method and is fully styled. Migrating fixes it rather than losing it — checked, not assumed |
<!-- /ANCHOR:log -->
