---
title: "Implementation Summary: Competitor References and Closer PM Alignment"
description: "Nothing has run yet. This records the state the packet opens against, including the contract that currently blocks it."
trigger_phrases:
  - "implementation summary"
  - "047 summary"
  - "competitor reference summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/047-competitor-references-and-pm-alignment"
    last_updated_at: "2026-09-05T07:45:00Z"
    last_updated_by: "decisions-and-phases-pass"
    recent_action: "Recorded the opening measurements and the schema blocker"
    next_safe_action: "Write the negative control red-first against the current schema"
    blockers:
      - "manifest-schema.mjs rejects any reference group but project-manager"
    key_files:
      - "tools/screenshots/manifest-schema.mjs"
      - "screenshots/manifest.json"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-047-summary"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
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
| **Spec Folder** | 047-competitor-references-and-pm-alignment |
| **Completed** | Not complete — opened 2026-09-05 |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This records the state the packet opens against, read from the working tree at
`464cd7e3` and from `brew` on 2026-09-05.

### Opening measurements

- `screenshots/` has two roots today: `notion-clone/` (our own captures) and `project-manager/`
  (16 reference PNGs — gantt and kanban, subtask variants, desktop and mobile, light and dark).
- `screenshots/manifest.json` carries **546** scenario entries. **16** are references, under four
  ids: `reference-gantt`, `reference-gantt-subtask`, `reference-kanban`, `reference-kanban-subtask`.
- Those reference entries are **rendered from vendored source**. `reference-gantt`'s `sources` array
  names `specs/context/obsidian-pm-main/src/views/gantt/GanttView.ts` and a dozen more real files,
  which is what `verify.mjs` hashes for freshness.
- **`tools/screenshots/manifest-schema.mjs:118` rejects any reference entry whose `group` is not
  `"project-manager"`**, and `:52` limits `REFERENCE_RENDERERS` to `pm-kanban` and `pm-gantt`. A
  capture under `screenshots/anytype/` cannot enter the manifest today.
- `:108-126` also requires a `referenceOf` naming the constructed scenario the entry mirrors. An
  Anytype capture has no constructed counterpart.
- `brew info --cask anytype` → **0.56.5**, `auto_updates`, **Not installed**.
  `brew info --cask appflowy` → **0.14.1**, **Not installed**.
- Prior fidelity measurements, both green and both preceding the operator's verdict: `037`'s AC-007
  matched **60 of 60** `pm-gantt-*` classes with zero divergence at `30c4b746`; `038`'s T12 matched
  **14** carried-forward elements to the pixel at `c563f08`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| None yet | — | The first change is a negative control, written red-first |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. When it is, the comparison tables appear here element by element, and every closed
gap carries a before and an after number rather than a description.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Contract first, captures second | Nothing can enter the manifest until the reference contract widens, and widening it after the captures exist creates pressure to widen it too far |
| A negative control before the widening | "Still rejects" is a comparison, and a control that only ever ran against the old schema proves nothing about the new one |
| Both image sources | The operator asked for official product images and the installed apps. Marketing renders and real app screenshots show different things and neither substitutes |
| Uncaptured rows are recorded as uncaptured | An absent capture reported as zero gaps is this program's founding failure in miniature |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh --strict` on this folder | Not yet run |
| `npm run gate` | Not yet run |
| `npm run screenshots:verify` | Not yet run against an enlarged manifest |
| Negative control on the widened schema | Not yet written |
| Operator reads the board and timeline | Not yet — and only the operator closes AC-007 |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The freshness model has no answer for an external screenshot.** Every reference today is
   rendered from vendored source and hashed. A competitor screenshot has no source at all, and
   `vendor-unavailable` means an unavailable source rather than no source. Widening the lane
   honestly is in scope; inventing a fake `sources` entry to satisfy it is not.
2. **"Align closer" may not resolve to a measurement.** Both prior comparisons found zero
   divergence on what they carried. If the second pass finds zero too, the gap is in the scope of
   what was ported rather than in its fidelity — and that is a conversation with the operator, not
   a fix this packet can make.
3. **`anytype` auto-updates.** A capture drifts from the app silently. Recording the version in the
   entry is the mitigation, not a fix.
<!-- /ANCHOR:limitations -->

---
