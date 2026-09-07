---
title: "Implementation Summary: Notion Toolbar Refinement"
description: "Placeholder. The packet was opened by a research synthesis on 2026-09-06 and no code has changed yet; this document is filled in when the first leg lands."
trigger_phrases:
  - "064 implementation summary"
  - "notion toolbar refinement summary"
  - "what shipped"
  - "validation evidence"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/064-notion-toolbar-refinement"
    last_updated_at: "2026-09-06T19:00:00Z"
    last_updated_by: "opus-synthesis-session"
    recent_action: "Created the placeholder at packet open; no implementation yet"
    next_safe_action: "Run T001 and record its red exit statuses here"
    blockers:
      - "Nothing has been implemented, so there is nothing to summarize"
    key_files:
      - "src/views/toolbar-renderer.ts"
      - "src/views/filter-panel-renderer.ts"
      - "tools/live/toolbar-collapse-sweep.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-064-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "None yet — the packet has not started implementing"
    answered_questions: []
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
| **Spec Folder** | 064-notion-toolbar-refinement |
| **Completed** | Not completed — placeholder |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This packet was opened on 2026-09-06 by the Opus synthesis of the toolbar's
five-iteration Notion research loop, and landed on 2026-09-07 after a verification pass. It carries
a directive, eight completion criteria, twelve acceptance rows and ten decisions; it carries no
code.

This document is a placeholder so the packet's shape is complete. It is filled in when the first leg
lands, and it records what was observed rather than what was expected — a red read before the fix and
a green read after, each with the command that produced it.

The artifacts that exist today are documents and evidence, not code: `goal.md` (the directive and
eight criteria), `spec.md` (REQ-001 through REQ-009), `plan.md`, `tasks.md` (T001-T014),
`acceptance-criteria.md` (AC-001 through AC-012), `decision-record.md` (ADR-001 through ADR-010, plus
the seven corrections), and the loop that produced them at
`specs/005-component-surface-system/053-toolbar-and-view-controls/research/notion-toolbar/research.md`.
The first code the packet will touch is `src/views/toolbar-renderer.ts:1180`/`:1330` — or nothing at
all, if the operator routes REQ-006's writer to `059`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| None | — | No source file has been touched by this packet |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. The intended route is in `plan.md` §4 and `tasks.md`: two probes and an inventory that
make the reds visible, seven code legs of which three wait on the operator's ADR answers, and three
verification legs — the last of which is the operator's, riding `053` AC-111, and is never ticked by
an agent.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Nine ADRs written at packet open rather than at landing | Six record dispositions the research named against landed rulings or the tree's own state; recording them late would mean the loop's negative knowledge lived only in a research folder |
| ADR-010 inherited at landing rather than re-proposed | `062` ADR-003 carried a pointer to this packet because `064` did not exist on `main` when the operator ruled the conditional-colour row at 18:32. An agent may carry a ruling it may not make, so the row landed here as Accepted and not as a fourth gate |
| The landing corrected three more citations rather than reporting them | Two had drifted under the twenty-seven commits this packet rebased onto, and one repeated a digest error `062` had already fixed. D1 puts the correction in the packet, dated, not in a hand-back note |
| Three of them gate their legs, and the proofs still ran | `goal.md` D6 bars REQ-001, REQ-004 and REQ-006's code, not their red-first proofs — T001 observes the collapse and the unconfirmed-delete reds while the operator is asked |
| The confirm is consumed, not built | `053` goal D8: the confirm primitive is `051`'s; a second confirm surface here is the failure the five family phases were split to avoid |
| The hidden-group axis is settled, not duplicated | `boardHiddenGroups` exists, is persisted and is read (`types.ts:560`, `data-source.ts:1230`/`:1352`, `board-renderer.ts:192`); the loop's account that the set would be new was the packet's one substantive correction, routed in ADR-007 |
| The only lane touched is one that already runs | The `toolbar-collapse` gate row (`tools/gate.mjs:80`) gains its readings; no new lane, no new capture scenario invented for markup the existing ones already photograph |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Not run — no code changed by this packet |
| `npm run build` | Not run — no code changed by this packet |
| `npx vitest run` | Not run — no code changed by this packet |
| `npm run gate` | Not run — no code changed by this packet |
| `validate.sh 064-notion-toolbar-refinement --strict` | Run at packet open; see the opening commit |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Nothing is implemented.** Every criterion in `goal.md` §3 is red, and each carries a measured
   value read at `80c2bb48` rather than an estimate.
2. **Three decisions are the operator's and are open.** ADR-001 (the rung ahead of the landed
   ladder), ADR-005 (whether the confirm exists) and ADR-007 (whose writer the hidden-group axis
   gets) are Proposed, and `goal.md` D6 bars the gated code until they are answered.
3. **One read is owed before any REQ-006 criterion goes green.** The board's consumption of the
   hidden-group axis is verified; the table's is not — the loop deliberately did not read the table
   renderer, and the read is REQ-006's first task, not a assumption.
4. **The harness cannot answer four of the criteria.** The capture harness renders fixture markup, not
   the real renderers, so the four device-only checks ride `053` AC-111 and are device reads, not
   lane reads.
5. **One digest row is known stale.** The `-toolbar` digest's §4 P3 row predates the desktop side
   sheet's landing; ADR-008 records the correction rather than rewriting the digest.
<!-- /ANCHOR:limitations -->

---
