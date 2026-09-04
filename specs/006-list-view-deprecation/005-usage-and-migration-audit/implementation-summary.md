---
title: "Implementation Summary: List Usage and Migration Audit"
description: "Nothing is audited yet. This records the opening state and the three enumeration directions the audit will run, so its own coverage can be checked rather than trusted."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "list audit summary"
  - "006 phase 005 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/005-usage-and-migration-audit"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the opening state; no audit has run"
    next_safe_action: "Run the three enumerations (tasks.md T003-T005)"
    blockers:
      - "Nothing audited; this document is the pre-work baseline"
    key_files:
      - "src/views/list-renderer.ts"
      - "tools/gate.mjs"
      - "src/data/gallery-migration.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-005-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 1 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 005-usage-and-migration-audit |
| **Completed** | Not complete — opened 2026-09-04 |
| **Level** | 1 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This phase is read-only and it has not run. What follows is the state it opens
against, so its coverage can be checked against a starting point rather than trusted.

### Opening measurements

Read from the tree at `c6b5f11`:

- `src/views/list-renderer.ts` is 1,173 lines and renders through `src/views/card-field-renderer.ts`
  (349 lines), which the board and gallery cards also use.
- `src/data/types.ts:317` declares `list` in `DatabaseViewType`, a persisted union written into
  vault files.
- `tools/gate.mjs:89` runs `tools/live/list-window.mjs`, ratcheted by `tools/live/list-window.json`
  and backed by `src/views/list-window-harness.ts`.
- `tools/live/renderer-coverage.json` pins `src/views/list-renderer.ts` and
  `tools/bench/list-render-bench.ts` by content hash.
- `tools/screenshots/constructed-scenarios.mjs` carries `list` and `list-sparse`.
- `src/views/list-reservation.test.ts` and `src/views/list-row-contracts.test.ts` are list-specific.
- `src/views/toolbar-renderer.ts:1297-1308` offers all seven view types and filters only `gallery`.

The known data-loss candidates, to be confirmed or dismissed individually rather than as a group:
the stacked-title reading mode, `listCompactFields` (`src/data/types.ts:568`), and the per-group
create button emitted at `list-renderer.ts:172`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| (none) | — | Read-only phase. The audit's own output lands in this document. |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. `plan.md` §3 sets the method: enumerate from three directions that fail differently —
source grep, the gate's lane list, and the capture manifest — and report the three counts separately
rather than merging them, so a disagreement between them is visible instead of averaged away.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Enumerate from three directions instead of one | A source grep misses harness code that names the view by string; the lane list misses source; the manifest misses both. Three partial views that fail differently beat one that looks complete. |
| Report the counts separately | Merging them hides the disagreement, and the disagreement is the interesting part. |
| Name every declared loss individually | A count is not actionable. A user meeting a dropped affordance needs it to have been a decision, and a decision needs a name. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh 005-usage-and-migration-audit --strict` | Run at authoring time; see the packet commit |
| Three enumerations | Not run (tasks.md T003-T005) |
| Read-only claim | Not yet checkable — no commits to diff (tasks.md T010) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Vault usage cannot be enumerated from here.** The audit can list code paths exhaustively and
   cannot see how many real vaults carry a list view. That limit is why REQ-005 asks for a "what
   this did not establish" section rather than letting silence read as zero.
2. **The migration target is a working assumption until T006.** `table` is the lean, because the
   list already derives its tracks from the table's column widths. The gallery chose `board` for its
   own reasons and those reasons do not transfer automatically.
<!-- /ANCHOR:limitations -->

---


