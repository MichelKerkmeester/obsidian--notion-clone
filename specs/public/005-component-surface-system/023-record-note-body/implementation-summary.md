---
title: "Implementation Summary: Record Note Body"
description: "What shipped when the record sheet learned to show and edit a note's body, the write path that decided whether editable was viable, and the two tasks still open."
trigger_phrases:
  - "023 implementation summary"
  - "note body summary"
  - "record note body shipped"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/023-record-note-body"
    last_updated_at: "2026-08-31T09:55:00Z"
    last_updated_by: "note-body-discharge"
    recent_action: "Tasks discharged 15 of 19; the write path was already inside the per-file queue"
    next_safe_action: "Put the layout question to the operator (T2) and verify self-transclusion (T9)"
    blockers:
      - "T2: the body's home was never decided as its own question, only shipped"
      - "T9: a note transcluding itself is expected to work and has not been verified"
    key_files:
      - "goal.md"
      - "tasks.md"
      - "spec.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-023-impl"
      parent_session_id: null
    completion_pct: 80
    open_questions:
      - "Does the empty-body placeholder read as an affordance or as clutter on device?"
    answered_questions:
      - "Editable is viable: the body write goes through the same per-file queue as frontmatter"
      - "The display-only criterion for an empty body cannot survive a typeable one"
---
# Implementation Summary: Record Note Body

<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|---|---|
| **Spec Folder** | 023-record-note-body |
| **Level** | 3 |
| **Status** | Implemented — editable in place, chosen by the operator; 15 of 19 tasks discharged, 2 open, 1 void, 1 superseded |
| **State** | Committed `fb38e4b`, released in `1.3.9`. Not confirmed on the operator's device |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 1. WHAT SHIPPED

The record sheet shows the note's markdown body beneath its properties, and lets it be edited in
place. The properties the plugin renders are that note's frontmatter; the body was never shown at
all before this.

- `note-body.ts` splits a note into frontmatter, the gap beneath it, and the body, and puts them
  back together. The frontmatter is carried as an **opaque run of characters** rather than parsed
  and re-serialized, so comments, key order and quoting style survive — they belong to whoever wrote
  the note, not to this plugin. `frontmatter + gap + body` reproduces the input exactly, for every
  input, including one with no frontmatter and one that only looks like it has some.
- `note-body-region.ts` owns the rendered/editing swap, focus, debounce and flush.
- `DataSource.readNoteBody` / `updateNoteBody` are the read and write.
- The body renders through Obsidian's own `MarkdownRenderer`, so links, embeds, task checkboxes and
  transclusions work because they are the host's, not reimplementations.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## 2. THE WRITE PATH, WHICH IS WHAT DECIDED THE SHAPE

The operator's condition on choosing editable was that the write path be correct first. It is, and
the reason is structural rather than careful.

The plugin already serializes frontmatter writes per file, because concurrent `processFrontMatter`
calls into one file corrupt each other. A body writer rewrites the **whole file**, frontmatter
included — the same hazard approached from a direction that queue cannot see: a property edit and a
body save landing together, each having read the file before the other wrote it, and the second
overwriting the first.

So `updateNoteBody` runs inside `enqueueWrite`, and **the read happens inside the queued operation
rather than before it.** That is the part that matters. Reading first and writing second would carry
a snapshot taken before the preceding write into a file that no longer matches it, which is the same
race with an extra step. Queueing also credits the path as plugin-owned, so the write does not come
back as an external edit.

An edit that settles back on what is already there writes nothing, so an open editor does not touch
mtime on every debounce tick.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:verification -->
## 3. VERIFICATION

| Property | Evidence |
|---|---|
| Concurrent property and body writes lose neither | "loses neither write when both land together" |
| Writes do not interleave | "does not interleave a body write with a property write" |
| **The interleaving detector can fail** | "reports an overlap when the same writes bypass the queue" — the negative control, without which the other five prove nothing |
| Hand-authored frontmatter survives a body write | "keeps the hand-written frontmatter comment a property write would drop" |
| An unchanged body writes nothing | "writes nothing when the body has not changed" |
| Two body writes serialize | "serializes two body writes against each other" |
| The body reaches only the opened record | `readNoteBody` has exactly one caller; no list or card path reaches it |
| The sheet did not regress | `verify-placement` 234/236, exit 0; floor, navigation bar, backdrop and grab band green |
| Whole gate from the final state | `npm run gate` 16 green, exit 0; `npx vitest run` 531 passing — both read from `$?`, not through a pipe |

The tasks table in `tasks.md` carries the per-task discharge, including the three it corrected.
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 4. WHAT THIS DOES NOT PROVE, AND WHAT IS STILL OPEN

**Nothing here is confirmed on the operator's device.** The tests drive a fake vault; the captures
are the fixture harness rendering hand-written markup against the shipped stylesheet. Neither is
Obsidian.

**Two tasks are open and are listed rather than rounded up.**

- **T2, the layout decision.** The body shipped below the properties, and that is where the captures
  show it. But the task asks for the home to be *decided* — below the properties, a collapsed
  section, or its own tab — in the same conversation as the shape. It never was. Shipped is not
  decided, and the sheet already carries 13+ properties and a keyboard inset, so a body of arbitrary
  length is exactly the case where a discovered home goes wrong.
- **T9, self-transclusion.** A note whose body transcludes itself is expected to render without
  recursion because Obsidian's renderer handles it. The task's own words are "expected is not
  verified", and it is still expected.

**One task is void and one superseded**, both by decisions rather than by neglect. The tap-through
belongs to the display-only proposal, so under the editable shape there is nothing to wire. And the
empty-body criterion — "no empty container, no reserved space" — cannot be satisfied by a body you
can type into, which must offer somewhere to type; it is rewritten in `goal.md` against the
placeholder line rather than failed or dropped.
<!-- /ANCHOR:limitations -->

---

<!-- ANCHOR:decisions -->
## 5. DEVIATIONS

| Item | Note |
|---|---|
| This document arrived after the work, not with it | The phase shipped, its tasks were left unchecked, and the validator only asked for a summary once they were discharged. Recorded rather than backdated |
| The write-path hazard was predicted correctly and then not hit | `goal.md`'s log predicted a body writer using `vault.modify` from outside the queue. That is not what was built, and the prediction is left standing because it is why the correct thing was built |
| T3 corrected the record it was asked to re-read | Nine `vault.read`/`cachedRead` sites are now **11**, one `vault.modify` is now **two**, and one `MarkdownRenderer.render` site is now **two**. This phase moved all three, and the recorded `:3436` drifted to `:3442` |
<!-- /ANCHOR:decisions -->
