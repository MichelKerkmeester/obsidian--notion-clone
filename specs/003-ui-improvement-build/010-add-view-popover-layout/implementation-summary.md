---
title: "Implementation Summary: Add-View Popover Layout Defects"
description: "What was delivered for the Add view popover layout fix: type-scoped form sizing so the duplicate checkbox keeps its native box, a self-contained tile for each view-type card with an explicit height and released wrapping, a caption rule so every tile shows its label, uniform tile rows, a footer row for the duplicate action, a border-box popover frame and a regression suite."
trigger_phrases:
  - "add view popover implementation summary"
  - "view selector broken ui fix"
importance_tier: "medium"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "003-ui-improvement-build/010-add-view-popover-layout"
    last_updated_at: "2026-08-28T16:54:48.875Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded delivered scope and the gates left to the orchestrator"
    next_safe_action: "Await orchestrator compiler, build and test gates"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "implementation-summary.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "ui-build-010"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Implementation Summary: Add-View Popover Layout Defects

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Metric | Value |
|---|---|
| **Phase Name** | 010-add-view-popover-layout |
| **Theme** | Add view popover: checkbox sizing, view-type tile layout, caption containment, footer row and popover frame |
| **Status** | Complete pending orchestrator gates |
| **Completion Pct** | 100% of implementation; 0 of 3 verification gates run in-session |
| **Requirements** | 9 defined (5 P0, 4 P1) |
| **Tasks** | 23 planned (19 completed, 4 deferred to the orchestrator or to a visual check) |
| **Target Deliverables** | Type-scoped form sizing, native checkbox box, self-contained tiles with restated states, caption rule, contained preview, uniform tile rows, footer action row, border-box popover frame, menu-row class removal, regression suite |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:what-built -->
## What Was Built

1. **The suspected cause was tested and disproved before anything was changed.** `.db-menu-item` was expected to impose a horizontal flex row on the cards. Reading it (`styles.css:226-231`) showed it declares only `min-height: 30px`, `border: 0`, `border-radius` and `transition` — no `display` at all. A portal-scoping explanation was ruled out too: the popover is created inside `.note-database-container` (`ToolbarRenderer.ts:1222, 1234`) and `positionToolbarPopover` does not reparent it, so the container-scoped rules really do apply. Both dead ends are recorded so the next reader does not repeat them.
2. **The checkbox stretch fixed at the selector.** `.note-database-container .db-add-view-form input` is a descendant selector written for the two text fields; it also reached the duplicate checkbox nested inside its `<label>` and forced it to `width: 100%; min-height: 32px`. The selector is now `input:not([type="checkbox"]):not([type="radio"])` (`styles.css:18548-18557`), and the checkbox gained a rule that pins nothing but its flex behaviour — `flex: 0 0 auto; margin: 0` — so the platform's own checkbox metrics survive (`styles.css:18615-18620`).
3. **The tile given the height it actually needs.** `.db-add-view-card` declared `display: grid` but never a height, so the host app's pinned single-line button height won and the tile stayed one line tall while its 48px preview and caption needed roughly 80px. Because buttons do not clip, that content painted outside the tile over the next row. The card now declares its own box: `height: auto`, `width: 100%`, `box-sizing: border-box`, `grid-template-columns: minmax(0, 1fr)`, `grid-template-rows: auto auto`, `align-content: start`, `white-space: normal` and `box-shadow: none` (`styles.css:18631-18653`).
4. **The tile stopped calling itself a menu row.** `ToolbarRenderer` created it as `cls: "db-add-view-card db-menu-item"`; the class is now dropped (`src/views/ToolbarRenderer.ts:1261-1267`), because a stacked tile is not a single-line row and the shared class's `min-height: 30px` happened to match the pinned button height exactly, which is part of why the collapse was invisible in the cascade. `role="menuitem"` is retained: `installMenuKeyboardNavigation` selects `button[role=menuitem]` (`ToolbarRenderer.ts:1972-1974`), so arrow-key navigation is untouched.
5. **The states the tile used to borrow are now its own.** Hover gains the accent border plus the hover background, `:focus-visible` gains the accent border plus `var(--db-accent-focus-ring)`, and the tile carries its own transition (`styles.css:18652-18664`). Reduced motion needed no new rule: the container-wide `transition: none !important` at `styles.css:18840-18852` already reaches the tile.
6. **Every caption now has a rule.** `.db-add-view-card-label` appeared nowhere in the stylesheet, so captions inherited the button's `nowrap` and ran past the ~150px column. It now declares `min-width: 0`, `overflow-wrap: anywhere`, the extra-small type size and the normal text colour (`styles.css:18666-18672`).
7. **The preview contained.** `.db-add-view-preview` gained `min-width: 0`, the previously unstyled `.db-add-view-preview-icon` gained an explicit 18px icon size, and the fixed 42px `.db-add-view-preview-lines` glyph gained `max-width: 100%` so it cannot force a column wider than its track (`styles.css:18674-18701`).
8. **Uniform tiles.** `.db-add-view-cards` gained `grid-auto-rows: 1fr`, so a caption that wraps in one tile raises the whole row rather than leaving the grid ragged (`styles.css:18622-18629`).
9. **The duplicate action made an explicit footer row.** It was already `display: flex; width: 100%` — it read as crammed because the overflowing tiles above painted over it. It now also declares `height: auto`, a top margin, a `--db-border-subtle` top rule and square corners, in a rule of its own so the shared toolbar-row declaration list at `styles.css:18719-18733` is untouched (`styles.css:18742-18750`).
10. **The popover frame made honest.** `.db-add-view-popover` inherits `width: min(360px, calc(100vw - 24px))` but not `box-sizing`, so its 8px padding and 1px border added ~18px beyond the clamp. `box-sizing: border-box` was added in a rule naming that class alone, leaving the three sibling popovers in the shared width rule unaffected (`styles.css:18535-18540`).
11. **Regression suite**: `src/views/AddViewPopoverLayout.test.ts` parses the shipped stylesheet into selector/body pairs — stripping comments first, and unioning blocks when a selector appears in more than one rule — and asserts the tile's own height and track layout, the released wrapping, the type-scoped form selector, the unstretched checkbox, the caption rule, the uniform rows, the border-box frame and the standalone footer row, plus a guard that the shared `.db-menu-item` rule is still intact and still worn by the footer action.

<!-- /ANCHOR:what-built -->
---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

- **Phase 1**: Cascade audit — the menu-row hypothesis tested and disproved, the portal-scoping explanation ruled out, the real stretching selector identified, the in-repo precedent for the button-height reset located.
- **Phase 2**: Form region — type-scoped sizing and the native checkbox box.
- **Phase 3**: Tile region — box model, states, caption rule, preview containment, uniform rows, and the class removal in `ToolbarRenderer`.
- **Phase 4**: Frame and footer — border-box popover, footer action row.
- **Phase 5**: Regression suite.
- **Phase 6**: Verification — left to the orchestrator; no compiler, bundler or test command was run in this session.

<!-- /ANCHOR:how-delivered -->
---

<!-- ANCHOR:decisions -->
## Key Decisions

- **Narrow the selector rather than counter-pin the checkbox.** `.db-add-view-form input` was always meant to say "the text fields". Saying so is both the fix and the documentation; adding `width: auto` to the checkbox would have been worse than a no-op, because an `appearance: none` checkbox sized by the platform would collapse.
- **Declare the tile's box instead of out-declaring the app's.** The rule that pinned the button height is not in this repository, so it could not be quoted — only inferred, from `.db-calendar-search-result` (`styles.css:3325-3347`) and `button.db-icon-only-button` (`styles.css:661-675`), both of which already compensate for the same defaults. Declaring `height`, `width`, `box-sizing`, `white-space` and `box-shadow` on the tile is correct whichever default was responsible, and needs no `!important`; specificity alone carries it.
- **Remove the class from the tile, do not scope the shared rule.** Every other user of `.db-menu-item` is a genuine single-line row, so narrowing the shared rule would have been a change with no beneficiary. Removing it from the one element that is not a row is the smaller and more durable edit — and it means a future `display: flex` added to the menu-row rule cannot collapse these tiles again.
- **Keep `role="menuitem"` while dropping the class.** The two were doing different jobs; only the class was styling. Dropping the role would have silently broken arrow-key navigation for this popover.
- **Restate the states rather than accept the loss.** Dropping the class costs the hover background, the focus ring and the transition. All three are restated on the tile; the focus ring in particular has a second, independent source in the container-wide `:focus-visible` rule, so a mistake there would not have left the tile unfocusable — but relying on that silently would have been the kind of hidden coupling this phase set out to remove.
- **`grid-auto-rows: 1fr` over a fixed tile height.** A fixed height would break the moment a translated caption needs two lines. Equal rows sized to the tallest tile satisfies "all cards the same height" without hard-coding what that height is.
- **Centre the caption.** The preview is centred by `place-items: center`, so a left-aligned caption under it read as off-balance. This is the one purely aesthetic change in the diff and it is recorded as an open question rather than presented as part of the defect fix.
- **Display-only invariant**: the change adds no write path, no listener, no timer and no persisted state.

<!-- /ANCHOR:decisions -->
---

<!-- ANCHOR:deviations -->
## Deviations from Plan

- **The premise the work started from was wrong, and the record says so.** The investigation was directed at a shared `.db-menu-item` rule imposing a horizontal flex row. That rule declares no `display`. Rather than fixing the symptom and leaving the stated cause standing, the disproof is recorded in the spec, the plan and the task list.
- **Two fixes were added that the report did not name.** `box-sizing: border-box` on the popover and `max-width: 100%` on the preview glyph are additional contributors to the reported horizontal scrollbar. Fixing only the caption wrapping would have left the frame overflowing the viewport clamp at narrow widths. Recorded as REQ-004 rather than shipped silently.
- **The duplicate action was already a full-width row.** The report described it as crammed onto a caption's line; it was in fact `display: flex; width: 100%` and was being painted over by the overflowing tiles above. The cause is fixed upstream; the separator and height reset added here are a reinforcement, not the fix, and the checklist says so.

<!-- /ANCHOR:deviations -->
---

<!-- ANCHOR:verification -->
## Verification

The following gates verify delivery. **None of them were run in this session — no compiler, bundler or test command was executed. The orchestrator runs all three.** Read-only inspection (`grep`, `git diff`) was used and its output is quoted in `checklist.md`.

```bash
# 1. TypeScript compilation check
npx tsc --noEmit

# 2. Production build verification
npm run build

# 3. Unit test suite
npx vitest run
```

### Verification Checklist
- [x] The form's full-bleed sizing no longer reaches the checkbox (`styles.css:18551-18557`).
- [x] The checkbox rule declares no width or height, so its native box survives (`styles.css:18617-18620`).
- [x] The tile declares `height: auto` and its own track layout, so its contents stay inside it (`styles.css:18635-18653`).
- [x] The tile declares `white-space: normal`, releasing the wrapping a bare button inherits (`styles.css:18651`).
- [x] Every caption has a rule that keeps it inside the tile (`styles.css:18666-18672`).
- [x] The grid declares uniform rows (`styles.css:18626`).
- [x] The popover frame counts toward its own viewport clamp (`styles.css:18538-18540`).
- [x] The duplicate action is a separate footer row with its own rule (`styles.css:18744-18750`).
- [x] The card is created without the menu-row class and keeps `role="menuitem"` (`src/views/ToolbarRenderer.ts:1261-1267`).
- [x] The shared `.db-menu-item` rule and the shared toolbar-row block are unedited (`git diff` shows the only `db-menu-item` change is the card's class string).
- [x] No `!important` anywhere in the diff (`git diff | grep -c '^+.*!important'` = 0).
- [x] The regression suite exists and every assertion fails against the pre-fix tree (`src/views/AddViewPopoverLayout.test.ts:26-89`).
- [ ] `npx tsc --noEmit` exit code 0 — orchestrator verifies.
- [ ] `npm run build` exit code 0 — orchestrator verifies. `main.js` is a build artefact, so the renderer change takes effect only after this gate.
- [ ] `npx vitest run` passes with the new suite included — orchestrator verifies.
- [ ] The rendered popover contains its tiles, shows no horizontal scrollbar and reads correctly in light and dark themes and at the narrow clamp — needs a visual check in the running plugin.

<!-- /ANCHOR:verification -->
---

<!-- ANCHOR:nfr-verify -->
## NFR Verification

| Requirement | Target | Verification Method | Status |
|---|---|---|---|
| **Rendering Cost** | No new listeners, timers, layout reads or DOM nodes | Source inspection of the diff | Verified by source inspection |
| **Display-Only Safety** | 0 note-body writes | Source inspection of `showAddViewMenu` | Verified by source inspection |
| **Theme Safety** | No literal colours; every value a token or theme variable | Stylesheet review of the diff | Verified by stylesheet review; the dark-theme token block at `styles.css:383-399` redefines all of them |
| **Narrow-Width Safety** | Two-column grid fits the `calc(100vw - 24px)` clamp with no horizontal overflow | Stylesheet review (`minmax(0, 1fr)` tracks, wrappable caption, capped glyph, border-box frame) | Declarations verified; the rendered result needs a visual check |
| **Cascade Robustness** | The tile's height and wrapping are declared by the tile itself, not inherited | Asserted by the regression suite | Asserted in test; suite not executed in-session |
| **Compilation & Bundle** | Clean `tsc` and `esbuild` | `npx tsc --noEmit`, `npm run build` | **Not run — orchestrator verifies** |

<!-- /ANCHOR:nfr-verify -->
---

<!-- ANCHOR:limitations -->
## Known Limitations

- **The pinned button height was inferred, not read.** The host app's `button` rule is not in this repository. The reading is corroborated by two in-repo compensations for the same defaults and by the symptom itself — content painting outside a box that declared no height — but it was not quoted from source. The fix does not depend on the diagnosis being exactly right: the tile now declares its own height, width, box-sizing, wrapping and shadow, which neutralises any of those defaults.
- **The regression suite asserts declarations, not computed layout.** It runs against `styles.css` text in a Node environment. It catches the class of regression that caused this defect — a box that never declared its own size — but it cannot measure a rendered tile or detect a scrollbar. A visual check remains the complement, and is the only thing that can confirm the reported symptoms are actually gone on screen.
- **The `.is-<viewtype>` preview modifiers still have no rules.** `ToolbarRenderer.ts:1267` writes `db-add-view-preview is-${value}`, but no `.is-table` / `.is-board` / `.is-gallery` … rule exists anywhere. All seven tiles therefore show the same generic two-line glyph beside their type icon; they are distinguished by icon and caption, not by preview. That is a pre-existing gap rather than part of the reported defect, and designing per-type previews is a separate change.
- **The popover's ARIA shape is unchanged and still irregular.** The tiles and the footer action declare `role="menuitem"` without an ancestor `menu` or `menubar`, inside a `role="dialog"`. `installMenuKeyboardNavigation` selects on that role and is shared by six other popovers, so correcting it here would change the navigation contract for all of them.
- **`graph-metadata.json` is absent from this phase folder.** Sibling phases carry one, but its `derived` block holds extracted entities, a `source_fingerprint` and per-document hashes produced by the Spec Kit indexer. Hand-writing those would fabricate an indexing run that never happened, so the file is left for the indexer to generate.

<!-- /ANCHOR:limitations -->
