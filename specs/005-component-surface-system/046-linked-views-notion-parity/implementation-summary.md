---
title: "Implementation Summary: Linked Views Notion Parity"
description: "What landed: an embed that writes to its source database, moves between pages and is created from a picker — and the stylesheet leg that did not, which is why the card border is still there."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "046 implementation summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/046-linked-views-notion-parity"
    last_updated_at: "2026-09-05T04:20:00Z"
    last_updated_by: "implementation-verifier"
    recent_action: "Verified the implementation pass in-runtime, fixed what it got wrong, and landed it"
    next_safe_action: "Answer the host-layout question (tasks.md T002), then take the styles.css lane for T015"
    blockers:
      - "The card border and the embed padding are styles.css rules; no stylesheet edit was made"
      - "T002 is unanswered, so nothing has measured the released width against a real reading view"
    key_files:
      - "src/views/embedded-database-renderer.ts"
      - "src/main.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-046-summary"
      parent_session_id: null
    completion_pct: 60
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
| **Completed** | Partial — behaviour landed 2026-09-05 (`c2e0cb5`); the stylesheet leg is open |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

An embedded linked view now behaves like the database it points at, and can be placed and moved
without the clipboard. What it still looks like is a card, because the border is a stylesheet rule
and no stylesheet was edited.

### Capability: one seam instead of four gates

ADR-001 was decided first — an embed writes to its source database — and then all four gates moved
together. `createEntry`, `isReadOnly`, `showChartOptions` and `syncComputedFields` now resolve
through `isViewReadOnly()`, which is true only when the source database cannot be resolved. Cell
edits, new rows, board column moves, row deletion and view-config edits all persist to the source
and record the same `undo.*` labels the standalone view records, plus `undo.moveLinkedView` for a
move. The global undo command routes to the embed the caret is inside, and only that one.

The producer count AC-003 asks for: `rg -c 'persistMode === "codeblock"' src/views/embedded-database-renderer.ts`
returned **10** before and returns **3** after. All three survivors are presentation — the
linked-embed class, `hideDatabaseTitle`, and whether the move action exists. `isViewReadOnly()` is
read from 24 sites.

### Chrome: the DOM half

The duplicate database title and the collapse chevron both hung off the toolbar's title row, so the
embed now asks for `hideDatabaseTitle` and the row is not built. The chevron builder is deleted
outright rather than left as a no-op, and the open-full-view button the title row used to carry
moves into the utilities menu for that surface only, so no other surface gains a second copy of a
button it already draws.

### Width: the ancestor walk is gone

`markEmbedCodeBlockHost`'s eight-ancestor class walk is replaced by `releaseEmbedWidthToHost`, which
walks up to the reading-view sizer clearing `max-width` and `overflow-x` in percentages — never a
measured pixel — and restores every element it touched on unload. Whether that reaches the content
width in a real preview is unmeasured; T002 is still open.

### Move and create

`applyLinkedViewMove` writes the destination before removing the source, so an interruption between
the two leaves a duplicate rather than a loss — asserted, not just intended. The move is reachable
by dragging the embed's header on desktop and by a **Move to page…** row in its menu, and it is
undoable. The create flow picks a source database, a view type and a name, then inserts the fence at
the cursor, appending to the active file when no editor holds the caret. Its view-type picker is the
same list Add view uses rather than a second copy of it.

The block format did not change, which is what keeps this small: the create and move flows write the
fence `copyCurrentViewCode` already wrote.

### What did not land

The card border, the corner radius and the 12px horizontal padding are `styles.css:15652` on
`.note-database-embed`, and this packet never took the serialized lane. `note-database-embed-linked`
is on the container waiting for that rule. Three stylesheet blocks now match nothing —
`.note-database-embed-codeblock-host` (`:15857`) and the two header-toggle blocks (`:15879`,
`:15908`) — along with the `toggleHeaderChrome` action and `renderHeaderChromeButton` that no longer
have a reachable caller. Retiring them together is T015, and it waits on T002 rather than being done
blind.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/embedded-database-renderer.ts` | Modify | The capability seam, the chrome withdrawal, the width release, the move, and the embed's own undo history |
| `src/views/modals/linked-view-block.ts` | Create | Fence parse/serialise, the two-file move and its undo, the width release, and the vault adapter |
| `src/views/modals/create-linked-view-modal.ts` | Create | Source database, view type and name, then insert |
| `src/views/toolbar-renderer.ts` | Modify | `hideDatabaseTitle`, the move and create rows, and one shared view-type option list |
| `src/views/database-view.ts` | Modify | The create action from the standalone toolbar |
| `src/main.ts` | Modify | The create command, and undo routing to a focused embed |
| `src/i18n.ts` | Modify | Labels and notices in three locales |
| `src/views/embedded-database-renderer.test.ts` | Modify | Chrome, width, capability, move, create and round-trip coverage |
| `src/views/add-view-popover-layout.test.ts` | Modify | Follows the view-type list to module scope |
| `styles.css` | **Unchanged** | The stylesheet leg is T015 |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

An external implementation pass built it after the operator's ADR-001 ruling; this session verified
that pass in-runtime rather than trusting it, and the difference is most of what this document
records. Two of its task ticks were false — T004 and T005 claimed the card border removed and the
width fixed, when the stylesheet was never opened — and both are back to unticked with the exact
rule that still draws the border.

Five defects were found by reading the diff against the requirements rather than by a failing check.
The global undo command would have been answered by any embed on screen, not the focused one, so a
file view could silently lose its own undo. The view-type option list was copied rather than shared,
leaving two lists that must agree. An open-full-view row was added to every surface with that action
rather than the one that lost the button. The create command carried both an `editorCallback` and a
`callback`, one of which can never run. And the picker announced "Open a note to insert the linked
view" when the real problem was that the vault has no database to link.

Two pieces of code existed only to be tested: a no-op method that removed an element nothing creates
any more, and a copy of the old ancestor walk kept so a tripwire could assert on it. Both are gone,
and the tests that pointed at them now drive the real render path instead — the chrome test captures
the actions bag the embed hands the toolbar. Two tests were added for things the packet asked for and
the pass had not proven: an interrupted move, and the create flow's fence read back by
`parseEmbeddedReference`, the parser the rendering path actually uses. The round trip on its own only
proved the new writer agrees with itself.

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
| `npm run gate` | **PASS — 25 green, 0 red.** One lane (`screenshots-fresh`) went red on the first run because the changed sources aged 56 captures; recaptured, and the 23 PNGs git reported were all pixel- and layout-hash identical to HEAD, so they were restored to HEAD bytes and only the manifest's source hashes carried forward |
| `npm test` | 1142 passed, 108 files |
| `npx tsc --noEmit` | exit 0 |
| `validate.sh 046-linked-views-notion-parity --strict` | `RESULT: PASSED` |
| 16-row block round trip + 3 adversarial | Green (`embedded-database-renderer.test.ts:653`) |
| Create flow's fence read by the rendering path's parser | Green (`:630`) |
| Interrupted move leaves a duplicate, never a loss | Green (`:592`) |
| Capability gate count | `persistMode === "codeblock"` 10 → 3, all presentation |
| Constructed embed scenario | Still absent (T011) — nothing in the capture set can show this change |
| Host-layout measurement against real Obsidian | Not taken (T002) |
| Operator device confirmation | Not sought |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The embed is still a card.** The border, the radius and the horizontal padding are stylesheet
   rules this packet did not touch, so the operator's first complaint is two thirds addressed. The
   fix is three declarations; what it needs is T002's measurement and a free lane, and writing it
   blind is the mistake the plan opened by naming.

2. **Nothing here has been seen.** No capture in this repository renders an embed, so the chrome
   change moved zero pixels in the capture set, and every visual claim rests on reading code.

3. **The drag handle is the whole header.** Dragging a linked view starts anywhere on its header,
   including over toolbar controls. That reads as a plausible affordance and may read as a trap;
   only a device answers it.

4. **Writes shipped without a flag.** `checklist.md` CHK-121 asks for one and ADR-001's rollback
   assumes it. A plugin ships as one bundle with no in-flight server edits, so reverting the release
   may be the whole rollback — but that is a call, not an oversight to leave unstated (T016).

5. **`npm run lint` does not pass, and did not before.** 175 errors repository-wide, none of them a
   gate lane. Six of them are new: the inline width release assigns styles directly, which the
   stylesheet leg would remove.

6. **The phone flows were not measured against `044`.** The create sheet reuses that packet's header
   and dropdown rows in code; nobody has seen the result on a phone.

7. **`hideHeader` is now nearly vacuous.** It still hides the whole header chrome, which also
   removes the move affordance and the full-view row with it. Its fate stays an open question rather
   than being settled by omission.

<!-- /ANCHOR:limitations -->

---
