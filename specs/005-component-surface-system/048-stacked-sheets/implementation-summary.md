---
title: "Implementation Summary: Stacked Sheets"
description: "What this packet has produced so far — the packet itself and its code-derived stacked-surface inventory — and what remains unbuilt."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
  - "048 implementation summary"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/048-stacked-sheets"
    last_updated_at: "2026-09-05T07:20:00Z"
    last_updated_by: "phase-author"
    recent_action: "Opened the packet and derived the stacked-surface inventory from the openers"
    next_safe_action: "T002 and T003 — identify the capture's layers and measure the failing numbers"
    blockers:
      - "D1 is operator-owned and gates the modal migration rows"
      - "No code has changed; every criterion but AC-001 is Unmet"
    key_files:
      - "stacked-surface-inventory.md"
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/overlay-stack.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-048-impl"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "D1: modals opened from a sheet present as sheets, or the phone flow uses a sheet"
    answered_questions:
      - "Level 2, standard child: recommend-level.sh 64/100, phase score 10/50 against a 25 threshold"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 048-stacked-sheets |
| **Completed** | Not complete — opened 2026-09-05 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**No product code has changed.** What exists is the packet and one document that did not exist
before: a census of every surface that can open while another sheet is already open. That is the
whole of the progress, and saying so plainly is the point — a packet that reads as further along
than it is costs more than an empty one.

### The stacked-surface inventory

`stacked-surface-inventory.md` groups every child surface under the parent sheet it opens over, with
the opener's `file:line`, the behaviour the code produces today, and the behaviour the stacking
model requires. It found the mechanism behind all three operator reports rather than three separate
causes: nothing in the plugin models depth. One `z-index` for every sheet, one scrim behind all of
them, no parent read when a child mounts, and a keyboard inset each sheet computes for itself.

It also found the cheapest available fix already half-present. `overlay-stack.ts:47` declares
`parentId` on every registered surface and `:54` stores it; `rg -n "parentId" src/views` returns no
reader. The stack has the shape a depth model needs and no consumer for it.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `specs/005-component-surface-system/048-stacked-sheets/` | Created | The packet: goal, spec, plan, tasks, checklist, acceptance criteria |
| `specs/005-component-surface-system/048-stacked-sheets/stacked-surface-inventory.md` | Created | The code-derived census, T001 |
| `specs/005-component-surface-system/scratch/device-2026-09-05/` | Created | The operator's three iPhone captures from the 0.0.23 pass |
| `specs/005-component-surface-system/roadmap.md` | Modified | §4 rows 44-46, the tap-inside-sheet confirmation, §5.A, §6A |
| `specs/005-component-surface-system/spec.md` | Modified | Phase Documentation Map row 48 |
| `specs/005-component-surface-system/goal.md` | Modified | DONE table subgoal row for 048 |
| `specs/005-component-surface-system/goal-prompt.md` | Modified | STATE and ORDER OF WORK |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

By reading openers, not by opening the app. Every row in the inventory cites the line that
constructs the child, so a reader can check it against the tree rather than trusting the table. The
three things static reading cannot settle are named in the inventory's §5 as tasks with what would
refute each, rather than asserted and quietly carried forward.

Nothing here has been verified on a device or through a lane, because nothing here is code yet.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Extend `003`'s inventory by reference rather than editing it | This packet's write authority is its own folder. Two documents that restate each other drift; one that cites the other does not. |
| Put the inventory before every migration task | `044`'s instance ranking sat `[B]` on an inventory for the same reason. Migrating by guess produces a list nobody can audit afterwards. |
| Make D1 operator-owned rather than deciding it | It changes twenty modal subclasses and both a phone and a desktop flow. The recommendation is recorded in `spec.md` §3; the ruling is not an agent's. |
| Record the parent-scale figure as an open question | 8% of a 390pt screen is 31pt of visible movement. Copying iOS's number without measuring it here would be a pattern imported without checking fit. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `recommend-level.sh --loc 600 --files 13 --architectural` | Level 2, 64/100, confidence 82%; phase score 10/50 below the 25 threshold, so a standard child |
| `validate.sh <this folder> --strict` | Recorded in the parent's roadmap on landing; the first `RESULT:` line is the folder's own verdict |
| Every inventory `file:line` resolves | Derived by direct read against `d3979cf5` (0.0.23) |
| `npm run gate` | Not run — no code has changed |
| Operator confirmation | Open. AC-009, and nothing in this repository can close it |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The inventory is static.** It says what the code constructs, not what a phone shows. T003 is
   the runtime diff, and three items in `stacked-surface-inventory.md` §5 are explicitly unsettled
   until it runs.
2. **The middle layer in `stacked-properties-create-property.png` is not identified.** Read as three
   sheets it is Properties → an unnamed sheet → the modal; read against `db-modal.ts:70` it is the
   modal's own chrome band and there are two surfaces. Either reading leaves the row's finding
   unchanged — the parent is undimmed and unmoved — so it is recorded rather than guessed.
3. **The modal rows cannot move until D1 is answered.** Six inventory rows and part of AC-004. The
   dropdown, menu and picker rows, which are the majority and both operator screenshots, do not
   wait on it.
<!-- /ANCHOR:limitations -->

---
