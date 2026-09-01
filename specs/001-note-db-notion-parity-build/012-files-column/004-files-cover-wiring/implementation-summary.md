---
title: "Implementation Summary: Files Cover Wiring"
description: "Shipped gallery/board files cover guards, onerror, and auto-prefer, on branch impl; a dead unwired helper in the first commit was caught and fixed same-phase."
trigger_phrases:
  - "files cover wiring summary"
  - "gallery cover guard"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "001-note-db-notion-parity-build/012-files-column/004-files-cover-wiring"
    last_updated_at: "2026-08-27T12:27:53Z"
    last_updated_by: "docs-reconciliation"
    recent_action: "Completion docs reconciled to shipped state; gate green; Sonnet-verified"
    next_safe_action: "None — sub-phase complete"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-004-files-cover-wiring"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
<!-- SPECKIT_LEVEL: 1 -->
# Implementation Summary

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 004-files-cover-wiring |
| **Completed** | 2026-08-26 (branch `impl`, commit `d2fbc5b`; fix `f84a193`) |
| **Level** | 1 |
| **Actual Effort** | Matches plan (plus one same-day fix pass) |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Shipped in commit `d2fbc5b`, fixed in `f84a193`: `GalleryRenderer.ts:445-446` and `BoardRenderer.ts:664-665` both block `coverColumn?.type==="files" && image.external`, so a hand-edited raw-frontmatter `https://` URL cannot become a network `<img>`; `onerror` placeholders added on both cover `<img>` elements; `DatabaseView.ts` auto-prefers `col.type === "files"` for the default gallery image field. `CoverImage.ts` stayed untouched, as locked.

**Honest note on the build:** the first commit (`d2fbc5b`) shipped a dead, unwired cover-guard helper — the safety-critical conditional existed but wasn't actually called at either `renderCover` site. This was caught by the in-loop DeepSeek review during the build (not left to the later Sonnet review), and the real guard was wired in the same-phase fix commit `f84a193` before the phase was marked done.

Gate: `tsc --noEmit` exit 0; `vitest` 19 files / 194 tests pass (re-run at Sonnet 5 review time). Sonnet 5 review independently re-traced the fixed guard at `f84a193` HEAD and confirmed it wired at both call sites — "no unguarded path."

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/data/CoverWiring.ts` | Added | Cover-guard predicate |
| `src/views/GalleryRenderer.ts`, `src/views/BoardRenderer.ts` | Modified | External-image guard wired at both cover call sites; `onerror` placeholder |
| `src/views/DatabaseView.ts` | Modified | Auto-prefer `col.type === "files"` |
| `spec.md` / `implementation-summary.md` | Reconciled | Docs updated to reflect shipped state (this pass) |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Delivered against the live fork at `Obsidian Plugin/src` after children 001-003 shipped, gated on `tsc --noEmit` + `npm run build` + `vitest` before commit. The in-loop DeepSeek review caught the dead-helper defect in the first commit; the fix landed same-phase (`f84a193`) before the phase was marked done. Independently re-verified read-only by Claude Sonnet 5 as part of the phase 012 review (PASS).
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Guard at `renderCover` call sites, not inside CoverImage | `CoverImage.ts` is locked; `parseCoverImage` happily sets `external: true` (`:41-44`) |
| `onerror` this phase | Cheap HEIC degrade without widening `IMAGE_TARGET_RE` (`CoverImage.ts:13`) |
| Auto-prefer `col.type === "files"` | Picker already lists every column (`ViewConfigPanelRenderer.ts:1456,1468-1471`) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| Offline gallery cover | Verified by code trace — Sonnet 5 review, `f84a193` HEAD |
| Stale URL not a network `<img>` | Pass — guard wired at both call sites after the `f84a193` fix; no dedicated regression test at phase completion (closed post-phase by `bd8e467`, see parent implementation-summary.md) |
| `CoverImage.ts` clean | Pass — no diff in either commit |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Count badge is not this child.** Gallery "N attachments" stays deferred.
2. **Card-body stringify remains.** Do not pre-open `GalleryRenderer.renderValue` / `ListRenderer.renderValue`.
3. **WebKit mobile may still paint HEIC.** Chromium desktop must not hang; `onerror` covers that.
4. **First commit shipped a dead, unwired guard helper**, fixed same-phase in `f84a193` — see What Was Built. The guard had no dedicated automated test until the post-phase follow-up `bd8e467`.
<!-- /ANCHOR:limitations -->
