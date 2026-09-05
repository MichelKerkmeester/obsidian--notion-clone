---
title: "Implementation Summary: Linked Views Notion Parity"
description: "Nothing is built yet. This records the opening state — the three mechanisms that produce the reported shape, and the two questions that must be answered before any of them is touched."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "046 implementation summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/046-linked-views-notion-parity"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the opening state; no code has changed"
    next_safe_action: "Answer the host-layout question (tasks.md T002)"
    blockers:
      - "Nothing implemented; this document is the pre-work baseline"
    key_files:
      - "src/views/embedded-database-renderer.ts"
      - "src/main.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-046-summary"
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
| **Spec Folder** | 046-linked-views-notion-parity |
| **Completed** | Not complete — opened 2026-09-04 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This records the state the packet opened against, read from the tree at `c6b5f11`.

### Opening measurements

- `src/main.ts:387` and `:401` register two code-block processors, `note-database` and
  `database-view`, both constructing `EmbeddedDatabaseRenderer` with `persistMode: "codeblock"`.
- `src/views/embedded-database-renderer.ts:153` — the renderer is a `MarkdownRenderChild`, 4,173
  lines, and it is the same renderer stack the standalone view uses.
- `:600-611` `markEmbedCodeBlockHost` walks up to eight ancestors adding
  `note-database-embed-codeblock-host` until it hits `markdown-rendered` or
  `markdown-preview-view`. That chain is the width and border mechanism.
- `:1409` `renderToolbar` builds the real toolbar with real view tabs — which is why the operator's
  capture shows "All" and "2026" tabs inside the block. The gap is chrome and capability, not a
  second renderer.
- `:1724-1745` `renderHeaderChromeToggle` adds a `db-embed-header-toggle` chevron whose only job is
  to hide the `db-header` the toolbar built, persisted as `hideHeader: true` in the fence.
- Read-only is decided in four places on one string: `createEntry` no-ops when `isCodeBlock`
  (`:421`, `:433`, `:463`), `isReadOnly` (`:1592`), `showChartOptions` (`:1593`),
  `syncComputedFields` (`:1575`). None carries a recorded intent.
- `:3555` `serializeCodeBlockReference` and `src/views/database-view.ts:3912` `copyCurrentViewCode`
  both write the same fence — `dbId` or `dbPath`, optional `viewId`, optional `hideHeader` — to the
  clipboard. That is the only path to placing a linked view today.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| (none) | — | No source file has changed. The documents in this folder are the only artifacts so far. |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Two questions come first and neither is a coding question: whether a full-bleed embed
survives Obsidian's reading-view layout (T002), and whether an embed may write to the vault
(ADR-001). The chrome and width legs proceed on the first; the capability leg does not start until
the second has a status. After that the three legs — chrome, move, create — barely touch, because
the block format does not change.

ADR-001 was decided 2026-09-05 — Accepted, full parity — and the capability leg (T006) is now
running on `worktrees/054-linked-views` (external lane: devin first, Grok fallback).
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Keep the block format unchanged | Every existing fence in every vault keeps resolving, and the create flow becomes "write the string we already build" rather than a new serialiser. |
| Make ADR-001 a precondition rather than an outcome | Four read-only gates key on one string with no recorded intent. Chasing parity would relax them one at a time and end with an embed that edits some things and not others, which nobody could then describe. |
| Split presentation from capability (ADR-002) | Without the split, "may an embed write?" has no single place to be answered, so the ADR could not be written at all. |
| Let the host win on width | Full-bleed inside a markdown reading view is Obsidian's territory. If it refuses, that is a recorded constraint and a waiver, not a criterion quietly narrowed until it passes. |
| Write the move's destination before removing the source | An interruption then leaves a duplicate, which the operator can see and fix. The other ordering loses the block. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh 046-linked-views-notion-parity --strict` | Run at authoring time; see the packet commit |
| `npm run gate` | Not run — no source change to gate |
| 16-row block round trip | Does not exist yet (tasks.md T010) |
| Constructed embed scenario | Does not exist yet (tasks.md T011) |
| Operator device confirmation | Not sought; nothing is built |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The chrome census is a read of a screenshot, not a measurement.** Three block-furniture
   elements were counted from the operator's PNG. T001 writes the census; until then the number is
   an observation, and `checklist.md` says so rather than dressing it up.
2. **ADR-001 is resolved.** The operator ruled 2026-09-05 ~05:30 CEST, verbatim: "Allow db writing
   from linked views" — Accepted, full parity, the capability leg now running on
   `worktrees/054-linked-views` (external lane: devin first, Grok fallback).
3. **The phone flows wait on `044`.** The move action and the create flow are sheets, and inventing
   a third sheet language while `044` is defining the first would be the exact mistake `044` exists
   to stop.
4. **`hideHeader` probably becomes vacuous.** Once the default header is gone, the option has little
   left to do. A no-op option left in a format is a trap for the next reader, and its fate is
   recorded as an open question rather than settled by omission.
<!-- /ANCHOR:limitations -->

---
