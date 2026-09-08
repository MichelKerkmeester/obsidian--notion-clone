---
title: "Implementation Plan: Linked/embedded database views and mobile drag parity with Notion"
description: "The surface determination behind the fix, the defect table it produced, and the shared-drop-path technical approach for making the linked-view drag handle work on a phone."
trigger_phrases:
  - "implementation plan"
  - "technical approach"
  - "architecture decisions"
  - "testing strategy"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "072-linked-view-blocks-ux"
    last_updated_at: "2026-09-08T16:45:00Z"
    last_updated_by: "implementation-continuation"
    recent_action: "Recorded the investigation notes, the defect table and the fix approach"
    next_safe_action: "None — implementation is complete and the gate is green"
    blockers: []
    key_files:
      - "src/views/embedded-database-renderer.ts"
      - "tools/live/embedded-linked-view-ux.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "072-linked-view-blocks-ux-scaffold"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Linked/embedded database views and mobile drag parity with Notion

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript (strict), Obsidian plugin, no framework |
| **Storage** | Markdown notes + frontmatter (the database's own rows) |
| **Testing** | Vitest (unit, DOM-fake harness) + headless-Chrome/Puppeteer live proofs (`tools/live/*.mjs`) |
| **Build** | esbuild, `npm run build`; `npm run gate` is the 27-lane program gate |

### Overview

The operator's one-line report resolved into a named surface before anything was fixed: "the
separate views from database" reads (a), the linked-view fence that embeds another note's database
view (`embedded-database-renderer.ts`), and "dragging doesn't work on mobile" reads the fence's own
drag handle, which shipped as HTML5 `draggable`-only with no click action and therefore does nothing
at all under a coarse pointer. The fix gives that handle the phone gesture grammar the board drag
already shipped — long-press lift, short tap to the established move picker — and routes its release
through the exact resolution+notice+move sequence the desktop drag drop already runs, so both paths
stay one behavior. The full determination, with the file:line evidence and the readings recorded but
not fixed, is in `spec.md` §2; the defect table it produced is §3 here.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Problem statement clear and scope documented — the report's ambiguity was itself the first risk, and `spec.md` §2 resolves it before any fix
- [x] Success criteria measurable — lift/ghost/drop numbers at a fixed 402×874 phone viewport, not "feels right"
- [x] Dependencies identified — the gesture grammar and its headless proof machinery come from 069; nothing new is invented

### Definition of Done
- [x] All acceptance criteria Met, except AC-004, which is the operator's device row and stays unticked by design
- [x] Tests passing — 1676/1676, the 4 new ones proven red first and re-proven by 4 single-diff mutations
- [x] Docs updated (spec/plan/tasks/acceptance-criteria/decision-record/implementation-summary)
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:investigation -->
## 3. INVESTIGATION NOTES (AC-001 evidence)

The determination lives in `spec.md` §2 and is not duplicated here; these are the investigation
notes behind it, in the order they were established:

1. **The fence is its own rendered surface, not an alias.** A linked view is created by the
   `create-linked-view` command (`src/main.ts:454`) through a modal whose own copy says "A linked
   view is a new view on an existing database plus a fenced block"
   (`src/views/modals/create-linked-view-modal.ts:6`); the fence languages
   (`obnotion` / `database-view` / `note-database`) are registered at `src/main.ts:477,498`
   (`src/views/modals/linked-view-block.ts:26`), and the block renders through
   `embedded-database-renderer.ts` (`EMBED_LINKED_CLASS` at `:38`). This is the feature literally
   named *linked views*, which the report's plural "separate views from database" matches.
2. **The other two readings are routes, not features.** A database file opened as its own view/tab
   (`database-view.ts` under the registered view type, `src/main.ts:22`) and a view switched via the
   view picker (`toolbar-renderer.ts:669`) reach the same UI; they are recorded in the
   determination so the report is not half-answered, but neither is a distinct broken surface.
3. **The drag handle was born inert on touch.** `toolbar-renderer.ts:2663-2676` renders the linked
   view's drag handle with `draggable: "true"` — the desktop HTML5 gesture — and
   `embedded-database-renderer.ts:3946-3952` wires only `dragstart`/`dragend` on it. A coarse
   pointer fires neither. The handle's button has no click action either, so on a phone the control
   does nothing, while the note-header route to the same operation (the toolbar tab-menu's
   "move to page" → `actions.moveLinkedView` → `openMoveLinkedViewPicker`, the established
   `MarkdownFileSuggestModal` at `:3989`) stays reachable.
4. **The other "doesn't work on mobile" readings are enumerated, not fixed.** Table row reorder
   (`table-renderer.ts:1101`) and view-tab / database-switcher reorder
   (`toolbar-renderer.ts:718-719,1005-1006,2668`) are likewise HTML5-only. They are the same
   *class* of defect as the handle, but they are different producers; this packet fixes the
   confirmed surface's own handle and records the siblings for their own packets rather than
   widening the diff.

### Defect table (AC-002)

| # | Surface | Defect | Evidence | Disposition this packet |
|---|---------|--------|----------|-------------------------|
| 1 | Linked-view fence, phone | The drag handle does nothing under a coarse pointer: HTML5-only wiring, no click, no gesture | `toolbar-renderer.ts:2663-2676` (`draggable: "true"`); `embedded-database-renderer.ts:3946-3952` (dragstart/dragend only); the handle's own 44×44 target has `touch-action: none` yet no pointer listeners | **Fixed** — see §4; the 4 red→green unit tests in `embedded-database-renderer.test.ts` are the defect's proof |
| 2 | Linked-view fence, phone | Before the fix, the phone's only route to the operation was the note-header "move to page" menu — the handle the whole feature points at was decorative | Defect 1's corollary; the established picker (`openMoveLinkedViewPicker`, `:3989`) was reachable only through the tab menu (`toolbar-renderer.ts:533`) | **Fixed** — the short tap now opens that same picker, so the control finally does what it looks like it does |
| 3 | Linked-view fence, phone | Whether the *embedded* host's board lifts on long-press like the file view's was assumed, never measured — 069's proof drove the file view's action bag, which has the cross-group primary method the embedded bag lacks | The two bags differ by construction: the file view passes `moveRowWithGroupUpdatesAndPosition` (`database-view.ts` bag), the embed passes the `:537-558` set without it, so a cross-group drop resolves through the `updateGroup` + `moveRowToPosition` fallback (`board-renderer.ts:765-783`) | **Measured, not assumed** — lane A of `tools/live/embedded-linked-view-ux.mjs` drives the identical 069 gesture through both bags and records lift/ghost/highlight/landing/position parity, `exit 0` |
| 4 | Table row reorder, phone | HTML5-only, mouse-only on phones | `table-renderer.ts:1101` (`handle.draggable = ...`, no pointer path in the file) | Enumerated; its own packet's work |
| 5 | View-tab / database-switcher reorder, phone | HTML5-only, mouse-only on phones | `toolbar-renderer.ts:718-719,1005-1006,2668` | Enumerated; its own packet's work |
| 6 | Column reorder (table), phone | No column-drag affordance found in the table renderer — absent, not broken, on the current reading | No draggable in `table-renderer.ts` beyond the row handle | Recorded as absent; nothing to fix until the feature exists |

Chrome numbers for the fence's phone chrome, against the file view's, all under `.is-phone` at
402×874 (lane B): toolbar row 87 px in all three mounts (file view / codeblock-embed /
frontmatter-embed, delta 0), the header stack differing exactly where the mounts differ by
construction (file view 160 px with heading+description; codeblock-embed 99 px, toolbar only;
frontmatter-embed 168 px), drag handle 44×44 with `touch-action: none`, horizontal toolbar overflow
0 px in all three, no delimiter-crossing discrepancies — the chrome is already parity where the
mounts intend parity, so nothing there needed a stylesheet edit.

### Affected-surfaces inventories

- Same-class producers (HTML5-drag-only controls): the handle, the table row handle, the view-tab
  rows, the database-switcher rows, the third `draggable: "true"` — all named above with
  file:line; one of the five is fixed, four are recorded.
- Consumers of the changed symbols: `bindLinkedViewMoveAffordance` and the new
  `completeLinkedViewDropAt`/`bindLinkedViewTouchMove` are private to
  `embedded-database-renderer.ts`; `completeLinkedViewDrop`'s resolution+notice+move sequence is the
  shared seam — its existing unit tests (the desktop drop path) still pass untouched, which is the
  proof the refactor did not move the desktop behavior.
- Matrix axes: pointer type (touch/mouse) × gesture (long-press/short-tap/wander-cancel) × drop
  target (note/none) × host (file view's fence logic vs the embedded fence — same file, two mounts)
  × read-only. The unit tests and the live lane both cover the matrix; the read-only column is
  asserted by lane A's fourth gesture.
<!-- /ANCHOR:investigation -->

---

<!-- ANCHOR:architecture -->
## 4. ARCHITECTURE

### Pattern

Not applicable — this is a scoped behavior fix inside the existing renderer, not a new module.

### Key Components

- **`bindLinkedViewMoveAffordance`** (`embedded-database-renderer.ts`): the handle's listener home.
  Now binds, in addition to the desktop `dragstart`/`dragend` pair, the touch gesture —
  `pointerType` `"touch"` only, so the mouse path keeps the native drag it already had.
- **The touch gesture** (same file): long-press 450 ms, 10 px pre-lift cancel, `navigator.vibrate?.(20)`
  — 069's board grammar, deliberately hand-rolled there and copied rather than abstracted. Short tap
  opens `openMoveLinkedViewPicker()`, the established note-picker. A completed hold lifts the handle
  (the `is-touch-lifted` class), tracks it, and on release resolves the note under the finger through
  `ownerDocument.elementFromPoint`.
- **`completeLinkedViewDropAt`** (same file, new): the resolution+notice+move sequence refactored
  out of `completeLinkedViewDrop` so the HTML5 drop and the touch release share one write path —
  the same notice on failure, the same history push on success, no second implementation to drift.

### Data Flow

pointerdown on the handle → (450 ms, ≤10 px) → lifted class + haptic → pointermove tracks →
pointerup: `elementFromPoint` → `completeLinkedViewDropAt(pointed)` → the same resolution, failure
notice and history write the desktop drop ran → the host's `moveLinkedView` action moves the fence.
A short tap instead skips the gesture and opens the move picker directly.
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Current Role | Action | Verification |
|---------|--------------|--------|--------------|
| `bindLinkedViewMoveAffordance` | owns the handle's listeners | update — adds the touch gesture | 4 new unit tests, red before, green after |
| `completeLinkedViewDrop` → `completeLinkedViewDropAt` | the drop's resolution+notice+move | refactor — the touch release calls the extracted sequence | the existing desktop-drop tests pass unchanged |
| `toolbar-renderer.ts` handle markup | renders the handle, `touch-action: none` | unchanged | lane B measures it 44×44 / `touchAction: none` |
| board card touch drag (069) | the gesture grammar's precedent | unchanged | `board-cross-group-drag.mjs` exit 0, its own regression check |
| the 4 HTML5-drag-only siblings | same defect class, other producers | unchanged, enumerated | defect table rows 4–6 |
| `styles.css` | the lifted treatment | one new `.is-touch-lifted` rule | css-lane acquire/edit/release; the resting handle byte-identical |

Required inventories are in §3 (affected-surfaces inventories); the matrix axes are
pointer × gesture × target × host × read-only, and each column is covered by a unit test or a lane
assertion.
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 5. IMPLEMENTATION PHASES

1. **Determine** — the surface determination, evidence first (`spec.md` §2) — done.
2. **Prove the defect** — 4 unit tests, watched red against the unfixed tree; plus the lane's
   first runs, whose findings (the keep-in-place expectation and the harness box-sizing artifact)
   are recorded in `implementation-summary.md` — done.
3. **Fix** — the gesture + the shared drop sequence, one stylesheet rule — done.
4. **Verify** — the full battery, gate exit 0 — done; every number in `implementation-summary.md`.

Follow the ordered tasks in `tasks.md`. It owns the task checkboxes and their state.
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 6. TESTING STRATEGY

| Test Type | Scope | Tools |
|-----------|-------|-------|
| Unit | the handle's gesture matrix: lift→release→move, short tap→picker, mouse→untouched, wander→cancel; 4 mutations of 1 diff each | Vitest, the file's existing DOM-fake harness |
| Live/headless | the board's lift/ghost/drop parity across both action bags at 402×874; the three mounts' phone chrome; regression: 069's own proof, render-assertions, sheet-grammar | Puppeteer; `tools/live/embedded-linked-view-ux.mjs` + the standing tools |
| Program | the 27-lane gate, screenshot ×2 + decoded pixel-delta, evidence freshness, comment grammar, failing-values ratchet | `npm run gate` |
| Manual | the operator's own phone | AC-004, deliberately unticked |
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 7. DEPENDENCIES

| Dependency | Type | Status | Impact if Blocked |
|------------|------|--------|-------------------|
| 069's gesture grammar + `board-cross-group-drag.mjs` | Internal (shipped) | Green | The gesture parameters would have to be invented; they were not |
| The established move picker (`openMoveLinkedViewPicker`) | Internal (shipped) | Green | A second picker would have been a second behavior to keep in parity; none was added |
| The 075-released styles.css (css-lane handover) | Internal (lane) | Released at `ebf39eefa348` | One-rule additions are safe; the lane's own 4-capture review is recorded |
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 8. ROLLBACK PLAN

- **Trigger**: a defect found on the fence's touch behavior after landing.
- **Procedure**: the whole change is one commit; `git revert <commit>` restores it. The stylesheet
  rule is independent of the gesture wiring — reverting either alone leaves the other harmless, so
  a partial revert is also a valid, smaller rollback. No data, schema or persistence surface is
  touched; the fence's move continues to write through the same frontmatter edit the desktop drop
  always made.
<!-- /ANCHOR:rollback -->

---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Determine ──► Prove (red) ──► Fix ──► Verify (green + gate)
```

| Phase | Depends On | Blocks |
|-------|------------|--------|
| Determine | None | Prove, Fix |
| Prove (red) | Determine | Fix |
| Fix | Prove | Verify |
| Verify | Fix | None |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Phase | Complexity | Estimated Effort |
|-------|------------|------------------|
| Determine | Med | ~1.5 h |
| Prove (red) | Low | ~1 h |
| Fix | Med | ~2 h |
| Verification | Med | ~2.5 h (the battery, twice where the lane demands) |
| **Total** | | **~7 h** |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [x] No data changes — the move writes the same frontmatter field the desktop drop wrote
- [x] No feature flag — the gesture replaces a control that did nothing
- [x] Evidence recorded — the lane, the mutations, the screenshots' pixel deltas

### Rollback Procedure
1. `git revert` the commit (or revert only the gesture, if the defect is in the stylesheet rule).
2. `npx tsc --noEmit && npx vitest run` to confirm the reverted tree is green.
3. `npm run gate` once, read the 27 lanes.
4. Note the defect in the packet's handover so the next pass does not re-derive it.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A.
<!-- /ANCHOR:enhanced-rollback -->

---
