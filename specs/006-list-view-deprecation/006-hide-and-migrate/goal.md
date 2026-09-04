---
title: "Goal: Hide and Migrate"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "006 006 goal"
  - "hide and migrate goal"
  - "list migration directive"
  - "withdraw list from pickers"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/006-hide-and-migrate"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Authored the durable directive from the parent's conversion"
    next_safe_action: "Blocked on 005's audit; the migration target is decided but the loss list is not"
    blockers:
      - "005-usage-and-migration-audit has not run"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-006-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Goal: Hide and Migrate

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Withdraw list from every picker while keeping it renderable, and migrate an existing list view to a table with the same columns, once, with a notice.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Withdraw, do not delete.** `viewType` is a persisted union written into vault files (`src/data/types.ts:317`), so a database already configured as a list must keep opening. This is `030-gallery-view-deprecation`'s pattern reused, with `table` as the target instead of `board`. |
| D2 | The migration runs **on open, once per view**, not per render, and it is idempotent: a view migrated twice is a view migrated once. |
| D3 | A migrated view keeps its column set. The list already derives its tracks from the table's column widths, so this is a preservation rather than a mapping. |
| D4 | The one-time notice ships in **three locales**, matching every other user-facing string in this plugin. |
| D5 | **This phase is reversible and `007` is not.** It reverts by deleting one filter and one module, and already-migrated views stay tables — a valid state, stated plainly in the release note rather than left to inference. The two do not ride the same release. |
| D6 | A view whose migration fails opens as it did before rather than as an error, and the failure is reported once rather than per render. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../spec.md`, `../goal.md`, then this folder's `spec.md` and `plan.md`.

**Blocked by `005`.** It does not start on a partly-written audit.

**It gates `007`.** The irreversible phase does not start before this one has shipped in a
release and is migrating real vaults.

`../../005-component-surface-system/044-phone-sheet-alignment` asserts that **List view**
has left the Add view picker. That assertion is `044`'s; the removal it asserts is this
phase's. Neither blocks the other's start.

**Precedence.** The parent's decisions outrank anything here; this document outranks any
summary of it. Name a conflict rather than resolving it silently.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

Each row is checkable without opening another file, and each records what is true today
so the check has a value to move from.

- [ ] No picker offers list to a database that is not already one: not the view picker, not the Add view sheet, not the view switcher, not any menu. **Today: `toolbar-renderer.ts:1297-1308` lists all seven types and filters only `gallery`.**
- [ ] A vault carrying a list-configured view opens it as a **table with the same columns**, on a released build. **Today: no list migration exists — `src/data/gallery-migration.ts` is the only one, and its target is `board`.**
- [ ] The migration notice appears **once per view** and reads correctly in all three locales. **Today: the string does not exist.**
- [ ] A view whose migration fails opens as it did before, and reports once rather than per render. Proven by a negative control that fails the write deliberately.
- [ ] The revert is one filter and one module, and the release note says plainly that already-migrated views stay tables.
- [ ] **The operator opens a vault that had a list view and reports it as migrated rather than broken.** Only the operator closes this row.
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
| Audit dependency | Blocked | `005-usage-and-migration-audit` |
| Picker withdrawal | Pending | `tasks.md` |
| Migration module | Pending | `tasks.md` |

### Deviations and findings

| Item | Note |
|------|------|
| The migration target was decided before the audit ran | The list derives its tracks from the table's column widths, which is the evidence. The audit still has to record what the target does **not** preserve. |
<!-- /ANCHOR:log -->
