---
title: "Implementation Summary: Anytype Adoption"
description: "What this packet has produced so far — the packet itself, opened from 047's research — and what remains unbuilt behind the capture gate."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
  - "050 implementation summary"
importance_tier: "normal"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/050-anytype-adoption"
    last_updated_at: "2026-09-05T08:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Read the capture sweep at T001 and trued up all fourteen item designs"
    next_safe_action: "Execute T002 against the thresholds ADR-004 restated"
    blockers:
      - "No code has changed; every criterion except AC-015 is Unmet"
    key_files:
      - "specs/005-component-surface-system/047-competitor-references-and-pm-alignment/research/research.md"
      - "screenshots/anytype/README.md"
      - "src/views/toolbar-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-050-impl"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the running capture sweep reach the six surfaces the first pass could not?"
    answered_questions:
      - "Level 3, standard child: recommend-level.sh 51/100 raised on judgment, phase score 20/50 against a 25 threshold"
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 050-anytype-adoption |
| **Status** | Draft |
| **Completed** | Not complete — opened 2026-09-05 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**No product code has changed.** What exists is the packet: `047`'s fourteen ranked adoption items
turned into fourteen requirements, each with a target file that was checked to exist, a threshold
stated as a number or a boolean, and a red-first proof named before the work starts.

### The fourteen items, made executable

`../047-competitor-references-and-pm-alignment/research/research.md` §11 ranks fourteen items by fit
and names the file each lands in. This packet does three things to that table. It confirms every
named file resolves in this tree — all sixteen do, from `src/views/toolbar-renderer.ts` at 2,626
lines to `src/views/bulk-edit-field-menu.ts` at 49. It attaches a threshold to each item in
`acceptance-criteria.md`, and the failing side of that threshold to `checklist.md`. And it groups
the items by file into nine legs in `plan.md`, so a file is opened once rather than once per item.

### The finding that shaped the packet

The research ranked fourteen surfaces it could not see. `screenshots/anytype/README.md` is explicit:
raw `CGEvent` clicks posted with no effect, `System Events` was refused assistive access (-25211),
and Anytype's canvas exposes one opaque `AXGroup`, so **no mouse-driven surface was reachable** —
no view switcher, no filter or sort panel with a condition open, no property editor, no context
menu, no hover state. Six of the fourteen items therefore had no reference screen at that point.

**Corrected 2026-09-05.** Two later passes closed most of that. The CDP catalogue pass reached the
panels and, in doing so, photographed **37 hovered menu rows** without anyone noticing (`052` C1),
and `053`'s T001 opened the chip rail, the `New ⌄` menu's per-view defaults and twelve filter formats
this packet's read never opened. **Four items now have no reference screen: REQ-005, REQ-006,
REQ-007, REQ-011** — and two of those need none.

That is why T001 is a gate rather than a first step, and why the operator's instruction to wait for
the capture sweep is written into `goal.md` as D1 rather than left as scheduling advice.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `specs/005-component-surface-system/050-anytype-adoption/` | Created | The packet: goal, spec, plan, tasks, checklist, acceptance criteria |
| `specs/005-component-surface-system/spec.md` | Modified | Phase Documentation Map row 50 and its handoff row |
| `specs/005-component-surface-system/roadmap.md` | Modified | §5.A row for `050` |
| `specs/005-component-surface-system/goal.md` | Modified | DONE table subgoal row for `050` |
| `specs/005-component-surface-system/goal-prompt.md` | Modified | ORDER OF WORK |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

By reading `047`'s research against this tree rather than restating it. Every file the research
names was checked to exist and its size read, so the effort estimate in `plan.md` is scaled to real
files. Every threshold is written so it can be run **today** and fail — that is the point of D2, and
a threshold nobody can make fail goes back to T001 rather than into a leg.

Nothing here has been verified on a device or through a lane, because nothing here is code yet.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Captures gate the work, as a decision rather than a schedule | The research is code-derived and the first capture pass reached no interactive surface. Designing six items from source alone and calling it "adopting Anytype's UI" would be a claim nobody could check. |
| Requirement ids match the research's item numbers | Fourteen items, three documents. A mapping table between them is one more thing to go stale. |
| One leg per file group, ordered by best rank | `toolbar-renderer.ts` is 2,626 lines and three items reach it. Opening it once is cheaper and produces one reviewable diff instead of three overlapping ones. |
| Level 3 over the script's Level 2 | `recommend-level.sh --loc 1500 --files 16` returns 51/100 and Level 2. Fourteen independent requirements across two viewports with a hard sequencing gate is Level 3 work, and the rule on divergence is to go higher. |
| Standard child, not a phase parent | The phase score is 20/50 against a threshold of 25. Adding `--architectural` would return 30 and Level 3 both, but `047` verified the opposite — no item needs new architecture — so the honest run is the one without it. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `recommend-level.sh --loc 1500 --files 16` | Level 2, 51/100, confidence 90%; phase score 20/50 below the 25 threshold, so a standard child. Level raised to 3 on judgment |
| Every target file the research names exists | Checked by direct read: 16 of 16 resolve, sizes recorded in `plan.md`'s effort table |
| `validate.sh <this folder> --strict` | Run on landing; the first `RESULT:` line is this folder's own verdict |
| `npm run gate` | Not run — no code has changed |
| Operator confirmation | Open. AC-017, and nothing in this repository can close it |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Five items have no reference screen**, settled at T001: REQ-005, REQ-006, REQ-007, REQ-011 and
   REQ-013. Each ships on `047`'s code-derived findings with the gap named in `design-trueup.md` §4,
   and each is marked *design inferred from source code, not seen*. Two of the five need no screen
   at all — REQ-005 and REQ-011 are behaviour over time.
2. **The mobile leg still has the thinnest evidence of all.** REQ-013 is ranked High (mobile) and
   **no filter or sort sheet appears anywhere in the 151-file sweep**. The 20 mobile images are
   official App Store and Google Play marketing creative, not installed-app captures, so no pixel
   value is taken from them. `047`'s Android findings came from `anytype-kotlin` source and iOS was
   never reached.
3. **Two legs touch `styles.css`.** It is 22,692 lines and shared with every other phase in this
   program. The parent's serialized CSS lane owns that collision; this packet obeys it rather than
   inventing its own protocol.
4. **The thresholds are stated but not yet measured.** Seven `Today` cells in `checklist.md` carry a
   mechanism rather than a figure, deliberately: T002 measures them on the tree that produced them,
   because a failing number written after the fix proves nothing.
5. **Six `Today` cells are wrong, and T001 is why we know.** C1, C5, C8, C9, C13 and C14 assert a
   failing value this tree does not have — the chip row, the count badge, the per-format phone rows,
   twelve empty-state reasons, a viewport snapshot and the absence of any virtualization path all
   already ship. `decision-record.md` ADR-004 restates the matching thresholds, and T002 measures the
   restated form. Measuring the original wording produces a red that no code change caused.
<!-- /ANCHOR:limitations -->

---
