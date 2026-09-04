---
title: "Implementation Summary: Document and Release the List Removal"
description: "Nothing is written yet. This records what must be said and the two 005 phases that need closing, so the last phase is not the one that quietly forgets the housekeeping."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "list removal release summary"
  - "006 phase 008 summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "006-list-view-deprecation/008-docs-and-release"
    last_updated_at: "2026-09-04T18:47:26Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the opening state; nothing written"
    next_safe_action: "Wait for 007; read 005's declared-loss list"
    blockers:
      - "Blocked on 007; nothing to document until the removal lands"
    key_files:
      - "README.md"
      - "specs/005-component-surface-system/033-list-virtualisation"
      - "specs/005-component-surface-system/024-list-view-freeze"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-deprecation-008-summary"
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
| **Spec Folder** | 008-docs-and-release |
| **Completed** | Not complete — opened 2026-09-04 |
| **Level** | 1 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

**Nothing yet.** This phase runs last and it is blocked on `007`. What follows is what it will have
to say, recorded now so it is not reconstructed from memory later.

### What must be said

Three things, and the third is the one most likely to be left to inference:

1. The list view is removed. The README's view list still names it.
2. Views configured as a list became tables with the same columns, once, on open. Every loss `005`
   declared is named individually, not summarised.
3. **A revert restores the renderer and does not turn migrated views back into lists.** Those are
   tables now, permanently. `007`'s rollback section says this; the changelog has to say it too,
   because a user reading "reverted" will otherwise assume their layout comes back.

And one piece of housekeeping this packet owns because nobody else will:
`../../005-component-surface-system/033-list-virtualisation/` and `.../024-list-view-freeze/` are
open against a view that no longer exists. `024`'s own AC-6 already reads NOT MET and its exit
signal was reassigned to `028-remaining-freezes` once already; both facts get recorded rather than
overwritten.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| (none) | — | Nothing written. The documents in this folder are the only artifacts so far. |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

Not delivered. Blocked on `007`; there is nothing to document until the removal lands. The
verification that matters is not a test — it is the item-by-item check of the changelog against
`005`'s declared-loss list, with the count recorded.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Check the changelog against the loss list item by item | A summary reads well and lets exactly one loss through unnamed, which is the one a user meets. |
| State the rollback consequence explicitly | It is counter-intuitive and it is the sentence that gets quoted back. Leaving it to inference is a choice, and the wrong one. |
| Close `033` and `024` in their own documents | A closure recorded only in a commit message is a closure nobody reading the roadmap will find. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `validate.sh 008-docs-and-release --strict` | Run at authoring time; see the packet commit |
| Changelog checked against the loss list | Not run — the list does not exist yet |
| `033` / `024` closed | Not done |
| Release | Not cut |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **Blocked on `007`.** There is nothing to document until the removal lands, and drafting against
   a plan rather than a diff is how a changelog ends up describing work that changed shape.
2. **Whether the in-app changelog modal carries the notice is undecided.** It is what a phone user
   actually sees and it is localised, which makes it the more expensive option and probably the
   right one.
3. **Whether the removal rides an existing release or gets its own is undecided.** The operator's
   cadence publishes each milestone, and a removal is arguably one.
<!-- /ANCHOR:limitations -->

---


