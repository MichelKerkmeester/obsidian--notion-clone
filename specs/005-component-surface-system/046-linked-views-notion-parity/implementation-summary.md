---
title: "Implementation Summary: Linked Views Notion Parity"
description: "What landed: linked views now share the database surface, move between pages through a dedicated handle, and own the reading-host width, measured against a constructed reading host at both device widths."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "046 implementation summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/046-linked-views-notion-parity"
    last_updated_at: "2026-09-05T04:55:00Z"
    last_updated_by: "implementation-verifier"
    recent_action: "Verified the external pass, fixed the scroll-host measurement, read the captures"
    next_safe_action: "Operator reads the released build on device to close AC-007"
    blockers:
      - "AC-002's not-clipped half and AC-005 need a device pass; the constructed host cannot reproduce the code-block clipping"
    key_files:
      - "src/views/embedded-database-renderer.ts"
      - "src/main.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-046-summary"
      parent_session_id: null
    completion_pct: 78
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
| **Completed** | Partial — behaviour and stylesheet leg are in the worktree; commit metadata is blocked by the linked worktree's external Git permissions |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

An embedded linked view now behaves like the database it points at, can be placed and moved without
the clipboard, and uses the reading host as its own surface. The visual proof is registered as a
constructed scenario, rendered at both device widths and themes, and read by hand against a red
control taken with the linked rule neutralised.

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

### Width and surface chrome

The eight-ancestor host walk and the renderer's inline width release are gone. A linked-only
stylesheet rule now sets `width: 100%`, clears the card border, radius and padding, and cancels the
old header bleed so the block follows its containing `.markdown-preview-sizer`. The normal
`hideHeader` option remains intact. A constructed host mirrors `--file-line-width`, places prose
above and below the pair, and records the embed/prose delta, table viewport, table width and page
overflow at desktop and phone widths. The result is inferred from the constructed host until an
operator reads it on device; no runtime measurement is claimed here.

The linked header now has a six-dot grab handle at its left edge. Only that handle is draggable; the
rest of the header and its toolbar controls are not. The phone rule gives the handle a 44px square
touch target.

### Move and create

`applyLinkedViewMove` writes the destination before removing the source, so an interruption between
the two leaves a duplicate rather than a loss — asserted, not just intended. The move is reachable
by dragging the dedicated handle on desktop and by a **Move to page…** row in its menu, and it is
undoable. The create flow picks a source database, a view type and a name, then inserts the fence at
the cursor, appending to the active file when no editor holds the caret. Its view-type picker is the
same list Add view uses rather than a second copy of it.

The block format did not change, which is what keeps this small: the create and move flows write the
fence `copyCurrentViewCode` already wrote.

### What remains open

The constructed scenario now has its run, two themes at both device widths,
hand-read PNGs, manifest entries and a CSS-lane release. The host answer is therefore explicitly
inferred rather than confirmed. The required operator device report remains open.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/embedded-database-renderer.ts` | Modify | The capability seam, chrome withdrawal, handle-scoped move binding, move, and embed undo history |
| `src/views/modals/linked-view-block.ts` | Modify | Fence parse/serialise, the two-file move and its undo, and the vault adapter |
| `src/views/modals/create-linked-view-modal.ts` | Create | Source database, view type and name, then insert |
| `src/views/toolbar-renderer.ts` | Modify | `hideDatabaseTitle`, the six-dot move handle, move/create rows, and one shared view-type option list |
| `src/views/database-view.ts` | Modify | The create action from the standalone toolbar |
| `src/main.ts` | Modify | The create command, and undo routing to a focused embed |
| `src/i18n.ts` | Modify | Labels and notices in three locales |
| `src/views/embedded-database-renderer.test.ts` | Modify | Chrome, width, capability, move, create and round-trip coverage |
| `src/views/add-view-popover-layout.test.ts` | Modify | Follows the view-type list to module scope |
| `src/views/toolbar-renderer.test.ts` | Modify | Six-dot linked-view handle markup contract |
| `styles.css` | Modify | Linked full-bleed surface, handle geometry and retired orphaned chrome rules |
| `tools/live/render-assertion-harness.ts` | Modify | Configurable table column count for the width scenario |
| `tools/screenshots/constructed-scenarios.mjs` | Modify | Constructed reading-host comparison and width/overflow measurement |
| `tools/screenshots/constructed-capture.test.mjs` | Modify | Registry coverage for the new scenario |
| `tools/screenshots/scenarios/shared.test.mjs` | Modify | Linked surface stylesheet contract |
| `tools/lane/css-lane.json` | Modify | Records the acquire, the edit and the release naming all 5 reviewed captures |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

This pass completed the linked-view stylesheet and interaction leg after the operator's ADR-001
ruling. The old host-width mutation and unreachable header toggle were removed, the linked surface
now owns its full-bleed presentation, and the move listener is scoped to a dedicated handle. The
constructed capture then ran at both device widths and themes, and its four images were read beside
a red control taken with the linked rule neutralised.

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

The move coverage now also re-reads two vault-shaped files after the move and checks the database
path, view id, option and one-block invariant. A focused handle test proves a drag from the handle
reaches the move path while a toolbar-button press/drag does not.

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
| Use a dedicated six-dot grab handle (ADR-004) | A linked block needs a discoverable left-edge move affordance, while the rest of the header must remain safe for toolbar taps; the phone target is 44px square. |
| Roll back by reverting the release (ADR-003) | The write capability ships without a feature flag; an ordinary plugin release is the complete rollback boundary, and created notes survive the revert. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npm run gate` | exit 0 — `gate: PASS — 25 green, 0 red for a declared reason`, read without a pipe |
| `npm test` | exit 0 — 1145 passed, 108 files |
| `node tools/lane/check-lane.mjs` | exit 0 — `release names all 5 changed capture(s)` |
| `npx tsc --noEmit` | exit 0 |
| `npm run build` | exit 0 — production bundle generated successfully; generated `main.js` restored to committed bytes after verification |
| `node tools/screenshots/capture.mjs --only constructed-linked-view-host` | exit 0 — 4 captures, both device widths and themes, each measurement `ok:true` |
| `node tools/screenshots/verify.mjs` | exit 0 — 550 entries match their sources after a full recapture |
| `validate.sh 046-linked-views-notion-parity --strict` | exit 0 — first `RESULT:` line was `PASSED` after metadata backfill |
| 16-row block round trip + 3 adversarial | Green (`embedded-database-renderer.test.ts:653`) |
| Create flow's fence read by the rendering path's parser | Green (`:630`) |
| Interrupted move leaves a duplicate, never a loss | Green (`:592`) |
| Two-file move re-read | Green — both vault-shaped pages re-read; same database path, view id, option and one block |
| Capability gate count | `persistMode === "codeblock"` 10 → 3, all presentation |
| Constructed embed scenario | Captured and read: embed content box 900/900 desktop and 402/402 phone against prose, delta 0px; card furniture 0 for border, radius and padding |
| Host-layout measurement against the constructed reading host | Observed. With the linked rule neutralised the same fixture measures 874/900 and 376/402 (a 26px deficit: 1px border + 12px padding per side) and 34 units of furniture, so the change is what moves the numbers. Real Obsidian is still inferred, not confirmed |
| Operator device confirmation | Not sought |

<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **The constructed host cannot reproduce the reported clipping.** With the linked rule
   neutralised the columns stay reachable by scrolling in this fixture, because the fixture gives the
   embed its own `overflow-x: auto`. The clip in the operator's report came from the code-block host
   ancestors, which the fixture does not model. So the width half of the criterion is measured and
   the not-clipped half is not — it rides on the device pass.

2. **Two harness artefacts are visible in the capture and are not this change's.** The linked
   section draws taller rows than the standalone one and its first row sits under the sticky header.
   Both appear identically with the linked rule neutralised, and `runtime-vars.css` documents the
   sticky-header offset as a stand-in for a toolbar height a screenshot has no way to supply.

3. **Device confirmation remains open.** The source and stylesheet tests prove the handle binding,
   but the operator still needs to read the phone target and the released page. The constructed
   fixture does not render the toolbar, so no capture shows the six-dot handle.

4. **Writes ship without a flag.** ADR-003 settles it: reverting the release is the rollback, and
   created notes remain ordinary vault notes after the revert.

5. **`npm run lint` does not pass, and did not before.** Measured now: 173 problems, 163 errors and
   10 warnings, exit 1, repository-wide and not a gate lane. The pre-packet baseline was not
   re-measured in this pass, so no delta is claimed. What was checked directly is narrower and holds:
   `no-static-styles-assignment` no longer appears in `embedded-database-renderer.ts` or
   `linked-view-block.ts`, the two files the removed inline width release put it in. The changed tool
   files pass `npm run lint:tools`.

6. **The phone flows were not measured against `044`.** The create sheet reuses that packet's header
   and dropdown rows in code; nobody has seen the result on a phone.

7. **`hideHeader` is now nearly vacuous.** It still hides the whole header chrome, which also
   removes the move affordance and the full-view row with it. Its fate stays an open question rather
   than being settled by omission.

<!-- /ANCHOR:limitations -->

---
