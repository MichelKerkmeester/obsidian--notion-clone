---
title: "Implementation Summary: Sheet Family Remediation"
description: "Nothing has been implemented. This records the packet opening, the level and phase arithmetic behind it, and what the first leg will have to show."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/067-sheet-family-remediation"
    last_updated_at: "2026-09-06T15:02:10Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Opened the packet from the sheet family research synthesis; no code touched"
    next_safe_action: "Run Leg 1 — settle ADR-002 parent clause, record the scrim baseline and the handle contrast"
    blockers:
      - "T008 and ADR-004 are the operator's, carried from 051 T010"
      - "T023 is the operator's device read"
    key_files:
      - "specs/005-component-surface-system/067-sheet-family-remediation/goal.md"
      - "specs/005-component-surface-system/051-modal-and-sheet-componentization/research/research.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-067-impl"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Dimmed or undimmed parent under a stacked menu"
      - "The FuzzySuggest disposition"
    answered_questions:
      - "The commit-id discrepancy the research flagged is not one: be578988, 772b24d2 and e632a1e1 are three commits with three roles"
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
| **Spec Folder** | 067-sheet-family-remediation |
| **Completed** | Not completed — opened 2026-09-06 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing has been implemented.** This packet was opened by the Opus synthesis of the sheet family's
deep-research loop and no source file has been touched. The summary exists because Level 3 owes one
from the packet's creation onward, and writing it as though work had happened is how a document
starts certifying work nobody did.

### What was produced at opening

The synthesis read the loop's 1,057-line report, verified every P0 and P1 red-first claim against the
tree at `6b16b87a` rather than carrying the loop's word for it, and turned the survivors into eleven
thresholds with `file:line` anchors. Three of the loop's own claims did not survive that check and
were corrected rather than absorbed — they are in `goal.md` §4 and in `decision-record.md` ADR-002
and ADR-003.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `goal.md` | Created | The durable directive, eight decisions, seven thresholds with their reds |
| `spec.md` | Created | Eleven requirements, the scope boundary, the level and phase arithmetic |
| `plan.md` | Created | Four legs grouped by file, the affected-surface inventory, the three rules every new assertion inherits |
| `tasks.md` | Created | Sixteen rows, each with a threshold and a red-first anchor |
| `acceptance-criteria.md` | Created | Eleven thresholds, every one observed red |
| `decision-record.md` | Created | Four ADRs — one per P0 |
| `implementation-summary.md` | Created | This file |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. The route it will take is `plan.md` §4's four legs, and the two with a wide blast
radius are named there: the scrim, which moves every mobile capture, and the menu card, which moves
every `menu`-role surface at once. Both revert as a unit including their recapture.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| One coordinated child rather than rows scattered across `044`, `048` and `051` | Both `phase-definitions.md` §2 thresholds are met independently — `recommend-level.sh --loc 1100 --files 20 --architectural` reads **72/100, Level 3** and a phase score of **30/50** against the 25 bar. Scattering would also reopen two packets that are one operator read from closing, at 86% and 88% |
| Numbered `067`, not `059` | `059` through `066` are reserved for the Notion refinements. `create.sh` allocated `059`; it was renamed and the parent's phase map corrected in the same pass |
| Every P0/P1 claim re-verified against the tree before it became a threshold | A finding is a hypothesis. Three of the loop's claims were wrong: P0-2's threshold contradicted the true-up row it cited, the commit-id "discrepancy" was three commits with three roles, and `051` AC-011's *"no scrim exists"* was stale |
| Three findings corrected against landings on `main`, not shipped stale | Rebasing found them. `ae4fff81` closed `048` T025's depth-3 captures, so T020 keeps only the replace-pair capture. `311f957a` landed the motion timing band row, and the real defect is sharper than the reported one — the row pins the current 260ms, so correcting the value takes it red. `93205d4d` measured the stacked-parent dim at 0.717, inside the true-up's band, so AC-003 raises the page dim and *holds* the parent rather than treating both as red |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh <folder> --strict` | Recorded at the opening commit; see the parent roadmap's landing note |
| Red-first anchors verified against the tree at `6b16b87a` | PASS — every P0 and P1 threshold confirmed failing by direct read, `file:line` in `acceptance-criteria.md` |
| `npx tsc --noEmit` / `npm run build` / `npx vitest run` | Not run for this packet — **no source file was touched**, so a green run would be evidence for nothing |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Nothing here is device-confirmed.** The loop's own precondition — `044`, `048` and `051` done
   *and verified as planned* — measured NOT MET, and the operator waived it at 2026-09-06 ~15:50
   with *"Run it now on the current state."* So this packet is built on a repository read, not on a
   device read, and AC-011 is a criterion rather than a closed row.
2. **Two ADOPT rows disagree about the same move.** `design-trueup.md` row 26 says the menu card
   sits over a **dimmed** parent, row 31 over an **undimmed** one. T001 settles it by re-reading the
   captures. Until it does, ADR-002's parent clause stays `Proposed` and T006 lands the handle
   clause only.
3. **`design-system.md` §7 is stale on the scrim**, stating *"There is no sheet scrim … A scrim is
   new construction"* when one has shipped since `048`. Named here rather than fixed: the design
   system is the parent's document and this packet does not own it.
4. **The frontier the loop did not reach**, carried so a later pass does not re-derive it: the
   divider insets (T021 opens them), the seventeen unread `DbModal` subclass bodies, the lane's
   `kind: "fuzzy"` handler, the FuzzySuggest surface bodies, and everything device-observable.
5. **A ten-iteration loop's report goes stale in hours on a moving tree.** Three of its findings
   were overtaken by landings on `main` between the run and this packet's first commit. They were
   caught by rebasing and reading, not by the loop, and the general lesson is in `goal.md` D1: the
   tree wins over the report, and a correction is dated rather than absorbed.
<!-- /ANCHOR:limitations -->

---


