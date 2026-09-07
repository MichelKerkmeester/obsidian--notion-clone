---
title: "Before/After Record: Board Cross-Group Drag"
description: "Level-agnostic record of what changed, why it changed and the resulting effect."
trigger_phrases:
  - "069 before after"
  - "board touch drag comparison"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: before-after | v2.2 -->
# Before/After Record: Board Cross-Group Drag

> Compares the board's cross-group drag before and after this packet, because the operator's
> report and the pre-packet tree disagreed about which platform the feature already reached.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Subject:** Board cross-group drag input
**Status:** Accepted
**Date:** 2026-09-07
**Owner:** Implementation session
**Related packet:** 005-component-surface-system/069-board-cross-group-drag
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:summary -->
## 2. SUMMARY

**What changed:** A board card can now be lifted and dragged between columns with a long-press on a
coarse pointer, on both hosts, with an Undo toast on the host that lacked one.

**Why it changed:** The operator's report, verbatim: *"board view needs to support dragging to
other groups and thus updating that property to match grouped field. Like clickup for example."*
The desktop mouse path already did this; touch never could.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:comparison -->
## 3. COMPARISON

**Touch input**
Before: `card.draggable = !this.actions.isReadOnly && !this.touchMode` — a card was never
draggable on a coarse pointer, so a phone reader had no way to move a card between columns at all.
After: a long-press (450ms, the same threshold `attachLongPress` uses elsewhere on this surface)
lifts the card behind a ghost that tracks the finger, highlights the column underneath it, and a
drop rewrites the grouped property through the same write path the mouse drag already used.

**Embedded host's cross-group Undo**
Before: `embedded-database-renderer.ts`'s `updateBoardGroup` wrote the frontmatter and pushed
history silently — no toast, so the only way back was the toolbar's own Undo button, with no
prompt telling the reader one existed.
After: the same success toast with an Undo action the embed's own delete-row already raises, wired
to `undoLastEdit`.

**`resolveBoardColumnByPoint`**
Before: defined, unit-tested, and called by nothing in `src/` — built for a mouse empty-space
fallback that was never finished.
After: the touch-drag column hit-test, on every `pointermove` and at drop.
<!-- /ANCHOR:comparison -->

---

<!-- ANCHOR:net-effect -->
## 4. NET EFFECT

**Behavior:** A phone reader moves a task between board columns the same way a ClickUp reader
would — hold, drag, drop — instead of not at all.
**Operational impact:** None — no new persisted key, no new `BoardRendererActions` member, no
change to the desktop mouse path's own behaviour.
**Follow-up:** The constructed capture (item 6) is not yet registered in
`screenshots/manifest.json`'s tracked pipeline — see `decision-record.md` ADR-005 for the reasoning
and the concrete next step.
<!-- /ANCHOR:net-effect -->

---

<!-- ANCHOR:notes-caveats -->
## 5. NOTES & CAVEATS

No real Obsidian vault exists in any headless-Chrome harness this repository owns, so the live
proof's "frontmatter write" is the action bag's own recorded call, not a real file read back — the
real file write is proven separately through the vitest host-binding suites, which do construct a
real `DatabaseView`/`EmbeddedDatabaseRenderer` against a fake (but call-faithful) data source.
<!-- /ANCHOR:notes-caveats -->
