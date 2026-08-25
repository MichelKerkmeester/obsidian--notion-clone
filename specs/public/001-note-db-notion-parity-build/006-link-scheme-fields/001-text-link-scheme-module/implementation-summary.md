---
title: "Implementation Summary: Text Link Scheme Module"
description: "Planned same-diff table slice for textLinkScheme.ts. Not yet implemented in the fork."
trigger_phrases:
  - "text link scheme summary"
  - "assembleSchemeLinkTarget"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "obsidian/002-note-db-notion-parity-build/006-link-scheme-fields/001-text-link-scheme-module"
    last_updated_at: "2026-08-25T19:40:00Z"
    last_updated_by: "phase-architect"
    recent_action: "Authored table same-diff child from synthesis ranks 1, 2, 6 and final-plan steps 1–9"
    next_safe_action: "Implement textLinkScheme.ts plus the same-diff types.ts and CellRenderer call sites"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "decompose-001-text-link-scheme-module"
      parent_session_id: null
    completion_pct: 0
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
| **Spec Folder** | 001-text-link-scheme-module |
| **Completed** | Not yet (Planned) |
| **Level** | 1 |
| **Actual Effort** | Not started |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Nothing in the fork yet. This child is Planned: the table same-diff slice is specified so URL / email / phone clicks can ship without a 13th column type and without splitting tel-strip or the family gate into a later pass.

Planned first artifact is `src/data/textLinkScheme.ts` with `assembleSchemeLinkTarget`, plus `types.ts:62` `textLinkScheme?`, the CellRenderer default-branch case, and `src/data/__tests__/textLinkScheme.test.ts`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `spec.md` | Authored | Table same-diff scope and requirements |
| `plan.md` | Authored | EuroFormat module + two call sites + shared opener |
| `tasks.md` | Authored | T003–T007 atomic unit |
| `implementation-summary.md` | Authored | Honest pre-build record |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Implementation follows `tasks.md` as one diff against the live fork at `Obsidian Plugin/src`.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Keep module, tests, types, CellRenderer, shared opener, and round-trip in one child | Final-plan steps 1–5; synthesis items 1+2 are the same PR; tel-strip (item 6) is not a second pass |
| Zero-import assemble; do not call `normalizeExternalUrlTarget` | That helper returns `null` for every non-`http(s)` scheme (`TextLink.ts:37-41`) |
| Family allowlist, not blind concat | Blind concat emits `mailto:https://…` and would pass `javascript:` |
| Strip tel separators on every `tel:` target | As-is family match would otherwise keep `tel:+31 20 123` spaced |
| Extract the delayed opener in this file now | Copy-paste of the 280 ms timer is how Board/Gallery later become four copies |
| No CSS / no menu / no layouts in this diff | EuroFormat 1–3 call-site budget (REQ-005) |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx vitest run` on `src/data/__tests__/textLinkScheme.test.ts` | Not run (Planned) |
| `npm run build` / `npm run lint` | Not run (Planned) |
| `bash .opencode/skills/system-spec-kit/scripts/spec/validate.sh` on this folder `--strict` | Pending after authoring |
| Desktop click / dblclick | Not run (Planned) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Layouts, menu, and width are not this child.** Board / Gallery / List / record-detail, ColumnMenu, and ColumnWidth land in later children; this file must still export the delayed opener.
2. **`mailto:` / `tel:` on iOS/Android `window.open` is UNKNOWN.** Do not block merge; fallback later inside the shared helper.
3. **Power users set the hint in schema JSON.** There is no menu setter until child 003.
<!-- /ANCHOR:limitations -->
