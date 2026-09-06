---
title: "Implementation Summary: Notion Table Refinement"
description: "Nothing has been implemented. This records the packet opening, the level and phase arithmetic behind it, the three findings that were corrected against main, and what the first leg will have to show."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "continuation notes"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/062-notion-table-refinement"
    last_updated_at: "2026-09-06T16:32:00Z"
    last_updated_by: "ruling-fold-session"
    recent_action: "Folded the 18:32 rulings; no criterion gated on a decision"
    next_safe_action: "Run Leg 1 — the five guards, each observed red under its own control"
    blockers:
      - "T033 is the operator's device read"
    key_files:
      - "specs/005-component-surface-system/062-notion-table-refinement/goal.md"
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/research/research.md"
      - "specs/005-component-surface-system/053-toolbar-and-view-controls/notion-screens-digest.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-062-impl"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "The frozen divider in dark theme"
      - "The add-row noun source"
      - "A type-picker row ahead of its data type"
    answered_questions:
      - "The research's second-ranked item landed on main at 41513bd3 and 1a2c7e00 and is not carried"
      - "The digest's two second-hand line citations are exact; a third and fourth registry exist"
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
| **Packet** | `005-component-surface-system/062-notion-table-refinement` |
| **Level** | 3 |
| **Status** | Opened, not started |
| **Tree at opening** | `94f03c88` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** No file under `src/`, `styles.css` or `tools/` was created or modified by this
packet, exactly as none was by the research loop that produced it.

### What was produced at opening

- Nine binding criteria in `goal.md` §3, each carrying a Notion screen id, our `file:line`, a
  threshold and a value **observed red** on the tree at `94f03c88`.
- Eighteen task rows across four legs, guards first.
- Nine acceptance criteria in measurable form.
- Seven ADRs: three Accepted because a landed ruling or a landed commit already decides them, four
  Proposed pending the operator.
- Three amendments to the parent: the `roadmap.md` §5.A row, the `goal.md` reserved-children row,
  and a pointer from `053`'s `tasks.md`.

### Files Changed

| File | Change |
|------|--------|
| `062-notion-table-refinement/goal.md` | Created |
| `062-notion-table-refinement/spec.md` | Created |
| `062-notion-table-refinement/plan.md` | Created |
| `062-notion-table-refinement/tasks.md` | Created |
| `062-notion-table-refinement/acceptance-criteria.md` | Created |
| `062-notion-table-refinement/decision-record.md` | Created |
| `062-notion-table-refinement/implementation-summary.md` | Created |
| `../goal.md` | Amended — the reserved-children row and the phase table entry |
| `../roadmap.md` | Amended — the §5.A row |
| `../053-toolbar-and-view-controls/tasks.md` | Amended — a pointer to this child |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

A three-stage pipeline the parent's D15 defines. A **Sonnet digest** of the Notion table captures
was written to `../053-toolbar-and-view-controls/notion-screens-digest.md` — 98 screen ids, twelve
patterns, a divergence table and an Anytype cross-read — because GLM 5.3 flash cannot read images
and a capture reaches the loop as measured prose or not at all. Then `/deep:research:auto`, **five
iterations**, `--stop-policy=max-iterations`, lineage `glm-devpass-table` on
`llmgateway/glm-5.3-flash` at `reasoningEffort: max`, producing 26 merged findings. Then this Opus
synthesis, which re-verified every red against the tree rather than carrying the loop's report.

**The kit's `create.sh --phase --parent` form could not be used and the reason is recorded** rather
than worked around silently: it allocates the next child number after the highest existing one,
which is `067`, so it would have produced `068`. `062` is reserved and may not be renumbered. The
packet was therefore built from the contract-backed templates directly, which is the fallback `053`
recorded when the same script misparsed in a worktree.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| ADR | Decision | Status |
|-----|----------|--------|
| ADR-001 | The title column keeps our disabled-row menu convention | Accepted |
| ADR-002 | The wrap phase is superseded; the resolution rule the research quoted is stale | Accepted |
| ADR-003 | Conditional row colour gets its own view-settings row; the work is `064`'s | **Accepted 2026-09-06 18:32** |
| ADR-004 | Every new colour derives from our tokens and clears the bar in both themes | Accepted |
| ADR-005 | Freeze is desktop-only; the divider is a soft right-edge shadow once scrolled past | **Accepted 2026-09-06 18:32** |
| ADR-006 | The add-row noun is a per-view configured string, fallback today's "New" | **Accepted 2026-09-06 18:32** |
| ADR-007 | All eight missing Notion types ship as real types; the count is 13 to 21 | **Accepted 2026-09-06 18:32** |

The four operator ADRs were ruled in one pass on **2026-09-06 18:32**, quoted verbatim in
`decision-record.md`. What each supplies: *"Yes, own row in view settings"* (ADR-003), *"Subtle
shadow when scrolled past"* (ADR-005), *"Per-view configured noun, fallback 'New'"* (ADR-006) and
*"All types or add more as needed"* (ADR-007). One question survives them and is an implementation
decision rather than a block: **Person's vault value source**, owed its own ADR before the Person
renderer (T021a).
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh <packet> --strict` | Run at opening; the first `RESULT:` line read directly |
| `node tools/naming/scan-failing-values.mjs` | Exit 0 — no new ticked rows, so no new bare row |
| `node tools/naming/scan-comments.mjs` | Exit 0 |
| Build gates (`tsc`, `build`, `vitest`) | Not applicable at opening — no code changed |
| Screenshot gate | Not applicable at opening — no surface changed |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

- **The research is a five-iteration read, not a ten.** `newInfoRatio` fell 0.90 → 0.30 across the
  five passes without reaching the 0.05 convergence threshold, which never bound because the stop
  policy was `max-iterations`. The loop widened by plan rather than by pivot. Two areas are named as
  frontier rather than closed: create-on-type inside a table cell, and the column manager's
  title-eye disabled state.
- **No image was opened at any point in the loop, by construction.** Every Notion claim in this
  packet traces to a screen id in the digest, and the digest's own limits carry through: captures
  are thumbnail-scale so ratios beat absolute pixels, hover state is structurally unobservable, and
  all 102 screens are light theme.
- **The freeze design is inference.** Notion's frozen state appears in no capture; the sticky offset
  and the shadow are ours, and ADR-005 says so rather than citing Notion for them — the operator
  chose the shadow's behaviour on 2026-09-06 18:32, and its colour still derives from our tokens
  under ADR-004 because no capture could supply one.
- **One loose end is recorded and not scheduled.** `.db-numeric-value` is stamped
  (`src/views/cell-renderer.ts:318-321`, `:419`) and no stylesheet rule matches it, so numbers are
  left-aligned by inheritance and at parity by accident. A `text-align: left` assertion would pass
  today for the wrong reason. It belongs to whoever next opens that block.
- **The loop's own environment gap.** `resource-map.md` emission was skipped: `reduce-state.cjs`
  refused the path because `.opencode/` is a symlink into a different repository, so `REPO_ROOT`
  resolved there and this worktree was absent from that repo's worktree list. Non-blocking by
  contract, and an environment issue rather than a research finding — recorded because the same
  symlink is what made the create script unusable above.
<!-- /ANCHOR:limitations -->
