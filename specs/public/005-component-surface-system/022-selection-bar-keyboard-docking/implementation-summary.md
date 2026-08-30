---
title: "Implementation Summary: Dock the Selection Bar to the Keyboard"
description: "What shipped for the selection bar, the numbers behind it, and the one question a harness cannot answer."
trigger_phrases:
  - "022 implementation summary"
  - "selection bar docking shipped"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/022-selection-bar-keyboard-docking"
    last_updated_at: "2026-08-30T20:12:00Z"
    last_updated_by: "phase-reconciliation"
    recent_action: "Docking rule recorded; box 30px to 48px; 8 harness checks cited"
    next_safe_action: "Operator opens a keyboard with cells selected and reports what the bar does"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-022"
      parent_session_id: null
    completion_pct: 90
    open_questions:
      - "Which host shape is the operator's phone"
    answered_questions:
      - "Both reported defects are fixed and measured"
---
# Implementation Summary: Dock the Selection Bar to the Keyboard

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **State** | Shipped and verified. Not operator-confirmed, so not closed |
| **Surface** | `.db-selection-status-bar`, phone, standalone only |
| **Evidence** | 8 checks in `tools/storybook/verify-placement.mjs`, all passing |
| **Written** | After the fact, from the shipped rule — this phase's documents lagged its code |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 2. WHAT WAS BUILT

One rule, at `styles.css:2423`, keyed to a phone and guarded against the embed:

```css
.is-phone .note-database-container:not(.note-database-embed) .db-selection-status-bar {
  bottom: max(16px, env(safe-area-inset-bottom), var(--keyboard-height, 0px));
  height: 48px;
  max-width: calc(100vw - 32px);
  overflow-x: auto;
  scrollbar-width: thin;
}
```

It answers both halves of the operator's report.

**The bar now rides the keyboard.** `--keyboard-height` is Obsidian's own variable. Adding it to the
`max()` means the bar sits above the keyboard when one is open and returns to the safe-area floor
when it is not, because the variable is `0px` in that state and the other two terms win.

**The bar's content now fits.** The box was 30px with `box-sizing: border-box` and a 1px border on
each edge, leaving 28px for 36px of content, so labels wrapped and were cut. It is 48px now. Actions
carry a 44px minimum height, and the bar scrolls horizontally with a visible thin scrollbar rather
than running its right-hand actions silently off the screen.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## 3. HOW IT WAS DELIVERED

Through the shared stylesheet lane, and it consumes a mechanism another phase had already proven
rather than inventing one. The keyboard inset was measured earlier in this program: with
`--keyboard-height: 336px` a fixed element's bottom edge moved as the host reported, and returned
when the keyboard closed.

The `:not(.note-database-embed)` guard is the whole reason the embedded renderer is unaffected. An
embedded database has no keyboard of its own to clear, and inheriting the docking would have moved a
bar that had no reason to move.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## 4. DECISIONS

| Decision | Why |
|---|---|
| Consume `--keyboard-height` rather than observe `visualViewport` here | The host already publishes the number, and a `max()` degrades correctly to the safe floor when it is absent. A JavaScript observer would need its own teardown and would duplicate a mechanism that already exists |
| Scroll the bar rather than shorten its labels | Copy TSV and Copy Markdown are the only route to those actions. A truncated label is a control the user cannot identify; a scrollable lane keeps every action reachable and says so with a visible scrollbar |
| Raise the box to 48px rather than reduce the content | The content was already the minimum that names each action, and 44px is the thumb floor the rest of this phone surface holds |
| Leave the desktop bar alone | It has room and there is no keyboard. The rule is keyed to `.is-phone` for exactly that reason |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## 5. VERIFICATION

Eight checks, each a number a browser produced against the shipped rule:

| What | Number |
|---|---|
| Bar clears the keyboard the host reports | bottom 513px, keyboard covers 513..844 |
| Bar returns to its floor when the keyboard closes | 828px, matching its resting position |
| Content fits its border box | 46px in 46px |
| Overflow is deliberate and visible | scrollWidth 558px, clientWidth 356px, `overflow-x: auto` |
| Action hit height | 44px minimum |
| Bar fully visible above the keyboard | occupies 465..513px |
| Embedded bar keeps the viewport floor | 828px standalone and embedded |
| Embedded bar does not inherit docking | 828px before and after a keyboard opens |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## 6. LIMITATIONS

**The content fits with nothing to spare.** 46px inside 46px passes within a 1px tolerance. Any
padding, font or label change tips it red — which is the check doing its job, but it means this
surface has no margin for an unrelated edit.

**One requirement is unmet and cannot be met here.** Which host shape the operator's phone is —
`visualViewport` shrink or window resize — is a fact about their hardware. The harness confirms the
WebView exposes `visualViewport`, which is a different question. The docking works under either
shape because of the `max()` fallback, so this is unresolved rather than blocking.

**Nothing here has been seen on a device.** Eight browser measurements are not a person looking at
their phone, and this packet exists because a release passed every gate and changed nothing anyone
could see.
<!-- /ANCHOR:limitations -->
