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
    packet_pointer: "005-component-surface-system/022-selection-bar-keyboard-docking"
    last_updated_at: "2026-08-31T00:00:00Z"
    last_updated_by: "keyboard-inset-publisher"
    recent_action: "Bar moved onto a plugin-published inset; fallback-only checks added and green"
    next_safe_action: "Regenerate the three staled fingerprint artefacts, then operator opens a keyboard on a device"
    blockers:
      - "css-lane, evidence and screenshots-fresh red on the stylesheet fingerprint; remedies write outside this phase's scope"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "src/views/popover-position.ts"
      - "src/views/database-view.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-022"
      parent_session_id: null
    completion_pct: 75
    open_questions:
      - "Which host shape is the operator's phone"
    answered_questions:
      - "Both reported defects are fixed and measured"
      - "The sheet's visual-viewport fallback works: it lifts with no host variable set"
---
# Implementation Summary: Dock the Selection Bar to the Keyboard

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **State** | Shipped and verified against a host that publishes nothing. Not operator-confirmed, so not closed |
| **Surface** | `.db-selection-status-bar`, phone, standalone only |
| **Evidence** | 15 checks in `tools/storybook/verify-placement.mjs`, all passing; two negative controls |
| **Written** | After the fact, from the shipped rule — this phase's documents lagged its code |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## 2. WHAT WAS BUILT

One rule keyed to a phone and guarded against the embed, and one publisher that feeds it:

```css
.is-phone .note-database-container:not(.note-database-embed) .db-selection-status-bar {
  bottom: max(16px, env(safe-area-inset-bottom), var(--db-keyboard-inset, 0px));
  height: auto;
  min-height: 48px;
  max-width: calc(100vw - 32px);
  flex-wrap: wrap;
  overflow-x: hidden;
  row-gap: var(--db-space-4);
}
```

**Superseded 2026-09-02:** the block above showed `height: 48px; overflow-x: auto; scrollbar-width:
thin` — the scroll lane. The `035` packet replaced it with the wrapping rule shown here, at
`styles.css:2511-2527`; the 44px action floor is unchanged. See `goal.md` D2 and log.

It answers both halves of the operator's report.

**The bar now rides the keyboard, on a number the plugin measures.** The rule first shipped reading
`--keyboard-height`, which is Obsidian's variable and which nothing in this plugin sets. On a host
that publishes it the bar moved; on one that does not, the `var()` missed, the `max()` fell to its
safe floor and the bar never moved at all — silently, because a missing custom property is not an
error. `publishKeyboardInset` in `src/views/popover-position.ts` now writes `keyboardInset()` to
`--db-keyboard-inset` on the view's container, and the bar reads that. `keyboardInset()` takes the
larger of the host's report and the visual viewport's own shrink, so the host's number still reaches
the bar and a silent host no longer strands it.

**The sheet was checked the same way, and its fallback is real.** With no `--keyboard-height` set and
the visual viewport shrunk instead, the sheet lifts to 513px on an 844px screen. That branch had
never executed in any captured run — both keyboard blocks in the harness set the variable and
dispatched a synthetic resize while the viewport stayed at full height, so the observed term computed
zero every time. It works; it had simply never been asked.

**The bar's content now fits.** The box was 30px with `box-sizing: border-box` and a 1px border on
each edge, leaving 28px for 36px of content, so labels wrapped and were cut. It is 48px now. Actions
carry a 44px minimum height, and the bar wraps its actions onto additional rows — ~~scrolls
horizontally with a visible thin scrollbar~~ **superseded 2026-09-02** — rather than running its
right-hand actions silently off the screen.
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
| ~~Consume `--keyboard-height` rather than observe `visualViewport` here~~ **Reversed.** Consume a plugin-published `--db-keyboard-inset` | The original reasoning assumed the host always publishes. It does not, and "degrades correctly to the safe floor" describes the defect rather than a graceful fallback: the bar sat on the floor under an open keyboard. The teardown this decision was avoiding is nine lines and is now asserted by a check with its own control |
| Write the container, not `documentElement` | `--keyboard-height` is the host's namespace and a plugin has no business writing beside it, where one view's measurement would sit in front of every other view and the host's own chrome. Custom properties inherit through the DOM rather than through layout, so the `position: fixed` bar still reads a value set on its container |
| Scope the subscription to the bar, not the view | The variable is only needed while a bar exists. Taken when one is created and released when the selection clears, the common case holds no viewport listener at all — strictly better than one per open view, and it is the path the harness can drive end to end |
| Reuse `keyboardInset()` rather than write a second measurement | Two answers to "how much is the keyboard covering" would drift, and the sheet and the bar would disagree for the length of the keyboard animation. One function, two consumers |
| ~~Scroll the bar rather than shorten its labels~~ **Superseded 2026-09-02: wrap instead of scroll** | Copy TSV and Copy Markdown are the only route to those actions. A truncated label is a control the user cannot identify; a scrollable lane kept every action reachable and said so with a visible scrollbar. The `035` packet replaced it with wrapping — every action's right edge stays inside the bar's client box instead |
| Raise the box to 48px rather than reduce the content | The content was already the minimum that names each action, and 44px is the thumb floor the rest of this phone surface holds |
| Leave the desktop bar alone | It has room and there is no keyboard. The rule is keyed to `.is-phone` for exactly that reason |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## 5. VERIFICATION

Fifteen checks, each a number a browser produced against the shipped rule. The first three are the
ones that matter: they set **no** `--keyboard-height` and shrink the visual viewport instead, so they
cannot pass on a value the harness supplied.

| What | Number |
|---|---|
| **Bar clears a keyboard no host reported** | **bottom 513px, want 513px; bar reads 331px from the bottom** |
| **Sheet clears a keyboard no host reported** | **bottom 513px, want 513px; lever var 331px** |
| **Publisher's listener does not survive its bar** | **`0px` while up, unset after clear, unset after a shrink that would have republished it** |
| Embedded bar unmoved when only the visual viewport moves | 828px before and after |
| Bar and sheet return to the floor when the viewport comes back | 828px and 844px |
| No host variable in play while the fallback is measured | `--keyboard-height` reads unset |
| Bar clears the keyboard the host reports | bottom 513px, keyboard covers 513..844 |
| Bar returns to its floor when the keyboard closes | 828px, matching its resting position |
| Content fits its border box | 46px in 46px |
| Overflow is deliberate and visible | ~~scrollWidth 558px, clientWidth 356px, `overflow-x: auto`~~ **Superseded 2026-09-02:** wraps instead; maxActionRight 567px past a 373px port (red), 341px inside 373px (green) |
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

**Nothing here has been seen on a device.** Fifteen browser measurements are not a person looking at
their phone, and this packet exists because a release passed every gate and changed nothing anyone
could see.

**Three gate checks are red, and this phase cannot clear them.** `css-lane`, `evidence` and
`screenshots-fresh` are content fingerprints over `styles.css` and `src/views/popover-position.ts`,
and no fix for this defect leaves either file untouched — the bar's declaration is in one and the
publisher is in the other. Every stale entry names those two files and nothing else. The remedies
write to `tools/lane/css-lane.json`, the eight `tools/live/*.json` artefacts and `screenshots/`, which
are outside this phase's write scope, so they are reported rather than performed:

| Red | Remedy | Owner |
|---|---|---|
| `css-lane` | Take the lane: set `holder` and `baselineHash`, append to `history` | whoever holds the stylesheet next |
| `evidence` | Re-run the eight tools that wrote the stale artefacts; do not edit the numbers | same |
| `screenshots-fresh` | `npm run screenshots`, then per-image sign-off | the operator |

**The captures on disk predate this edit.** Any screenshot fingerprinted against the stylesheet or
the positioner now describes a tree that no longer exists.
<!-- /ANCHOR:limitations -->
