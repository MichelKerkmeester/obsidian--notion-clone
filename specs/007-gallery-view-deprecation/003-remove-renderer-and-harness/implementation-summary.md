---
title: "Implementation Summary: Remove the Gallery Renderer and Its Harness"
description: "Nothing has run yet, and this phase must not start on a merge. This records the state it opens against."
trigger_phrases:
  - "implementation summary"
  - "gallery removal summary"
  - "007 phase 3 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "007-gallery-view-deprecation/003-remove-renderer-and-harness"
    last_updated_at: "2026-09-05T07:22:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Recorded the opening measurements the removal will move from"
    next_safe_action: "Do not start. Wait for the 002 release, then record the baseline"
    blockers:
      - "002 must ship in a release first (parent D8)"
    key_files:
      - "src/views/gallery-renderer.ts"
      - "tools/live/renderer-coverage.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "gallery-007-003-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
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
| **Spec Folder** | 003-remove-renderer-and-harness |
| **Completed** | Not complete — opened 2026-09-05 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet, and nothing may be.** Parent D8 blocks this phase until `002` has shipped in a
release. What follows is the state it opens against, read from the working tree at `2a7db8cf`.

### Opening measurements

- `src/views/gallery-renderer.ts`: **787 lines**, 75 gallery mentions.
- `tools/bench/gallery-render-bench.ts`: **225 lines**. `tools/bench/run-gallery.mjs`: **30**.
  Deleting all three removes **1,042 lines** outright.
- `tools/live/renderer-coverage.json`: `"constructed": 6, "total": 21`,
  `"note": "was 7/22; list renderer retired"`. It pins `src/views/gallery-renderer.ts` at
  `c7d6e9216f39` and `tools/bench/gallery-render-bench.ts` at `97b52377f347`.
- `screenshots/manifest.json`: 546 scenario entries, **24** touching the gallery across six ids at
  four theme/device arms. Gallery-only: `gallery-view`, `constructed-gallery`. Board-shared:
  `card-cover-states`, `constructed-card-covers`, `chrome-group-selection-controls`,
  `constructed-group-selection-controls`.
- `styles.css`: **84** gallery lines, **81** of them `db-gallery-*` selectors. At least two
  (`:1188`, `:1411`) sit inside comma-joined lists shared with other views.
- `tools/gate.mjs`: **25** lanes today.
- `src/data/types.ts:317` — `DatabaseViewType` carries `"gallery"`; `:562-574` — six `gallery*`
  `ViewConfig` fields.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| None yet | — | Blocked on the `002` release by design |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. When it is, the lane list before and after appears here **by name**, and the board
capture hash comparison appears beside it — not a re-run, a comparison.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| One change, not two | A gate asserting a deleted file, or skipping a lane and still reporting green, are both worse than the removal being slower |
| Split the board-shared scenarios | Four of six ids mount the board; a blanket delete removes coverage the gallery never owned |
| Run the FULL capture, not just `render-assertions` | `006`'s equivalent phase caused a harness regression that only the full capture caught |
| `gallery-migration.ts` survives | It is what a vault that skipped the `002` release still needs |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `002` shipped in a release | Not yet — and this phase is blocked on it |
| `validate.sh --strict` on this folder | Not yet run |
| `npm run gate`, exit read from `$?` | Not yet run |
| Full capture and board hash comparison | Not yet run |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **A vault that skips the `002` release meets this build with an unmigrated gallery.**
   `gallery-migration.ts` survives precisely so that view lands somewhere chosen. ADR-001 decides
   whether the union value survives with it.
2. **Board coverage can only be proven unmoved against a baseline that does not exist yet.**
   Recording it is T003, and doing the work before recording the baseline makes the proof
   impossible rather than merely harder.
<!-- /ANCHOR:limitations -->

---
