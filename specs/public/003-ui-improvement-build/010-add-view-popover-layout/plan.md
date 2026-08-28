---
title: "Implementation Plan: Add-View Popover Layout Defects"
description: "Plan for giving the Add view popover an explicit box model: type-scoped form sizing so the duplicate checkbox keeps its native box, a self-contained tile for each view-type card that resets the pinned button height and releases the inherited nowrap, a caption rule so every tile shows its label, and a border-box popover frame so nothing overflows horizontally."
trigger_phrases:
  - "add view popover layout plan"
  - "db-add-view-card height reset"
  - "add view checkbox stretch root cause"
  - "add view tile grid plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/010-add-view-popover-layout"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored implementation plan for the add-view popover layout fix"
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
# Implementation Plan: Add-View Popover Layout Defects

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | TypeScript, Obsidian View Component Engine, CSS Grid and Flexbox |
| **Framework** | Native Obsidian DOM APIs (`createEl`, `createDiv`, `createSpan`, `setIcon`, `t`) |
| **Storage** | None — strictly display-only; zero note frontmatter or markdown body writes on render (iCloud-safe) |
| **Testing** | Vitest (`npx vitest run`), TypeScript compiler (`npx tsc --noEmit`), plugin bundle build (`npm run build`) |

### Overview
The reported defect — "the view selector is completely broken ui wise" — is two independent box-model failures in the same popover, each of which comes from a rule that says less than it needs to.

**The checkbox.** `.note-database-container .db-add-view-form input` is a descendant selector. It was written for the name and icon text fields, which are direct children of the form; it also reaches the duplicate checkbox nested one level deeper inside its `<label>`. `width: 100%; min-height: 32px` on an `appearance: none` checkbox produces a form-wide outlined pill and squeezes the caption beside it out of view. The fix narrows the selector by input type rather than pinning a counter-width on the checkbox — the rule's real intent is "text fields and the select", and saying so is both the fix and the documentation.

**The tiles.** `.db-add-view-card` declared `display: grid` and `gap` but never declared a height. The host app pins a bare `<button>` to its single-line input height and to `white-space: nowrap`. Those two defaults produced every remaining symptom: the tile stayed one line tall while its 48px preview and its caption needed roughly 80px, so — because a button does not clip — the preview and caption painted outside the tile over the next row; captions that could not wrap ran past the ~150px column, overflowed the popover's `overflow: auto` box into a horizontal scrollbar, and painted over the duplicate-view row underneath.

Three things made the collapse hard to see in the stylesheet:

1. `.db-menu-item`'s `min-height: 30px` is the same value as the pinned button height, so the cascade looked consistent. That class was the initial suspect for imposing a *horizontal row* layout; reading it (`styles.css:226-231`) disproved that — it declares no `display` at all.
2. The rule that actually wins is not in this repository. It was identified from two existing in-repo compensations for the same defaults: `.db-calendar-search-result` (`styles.css:3325-3347`), a button used as a two-row tile, carries `height: auto !important` and `box-shadow: none !important`; `button.db-icon-only-button` (`styles.css:661-675`) pins an explicit `height` and `box-shadow: none`.
3. `.db-add-view-card-label` had no rule at all, so nothing in the stylesheet described what a caption was supposed to do.

The plan therefore declares the tile's own box model explicitly — height, width, box-sizing, wrapping, shadow — rather than adding `!important` to out-declare a rule it cannot see. That is robust whichever of the app's button defaults was responsible. It also stops the tile from claiming to be a menu row, so a future edit to the shared row rule cannot collapse it again.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Every occurrence of `db-menu-item` in `styles.css` read before editing, and the horizontal-row hypothesis tested against the actual declarations rather than assumed.
- [x] Every occurrence of `db-add-view` in `styles.css` read, and the rule stretching the checkbox identified as the descendant `input` selector rather than as a rule on the checkbox itself.
- [x] Confirmed the popover is created inside `.note-database-container` (`ToolbarRenderer.ts:1234`) and is not reparented by `positionToolbarPopover`, so every container-scoped rule really does apply and the defect is not a portal-scoping failure.
- [x] Confirmed `db-menu-item` is a style-only hook: `grep -rn "db-menu-item" src/` shows it only ever written into class strings, never queried, so removing it from the tiles changes no behaviour.
- [x] Confirmed `installMenuKeyboardNavigation` (`ToolbarRenderer.ts:1971-1974`) selects `button[role=menuitem]`, so keyboard navigation survives the class removal.
- [x] Confirmed no existing test references `db-add-view` or `db-menu-item`, so no suite is invalidated.
- [x] In-repo precedent for the button-height reset located (`styles.css:3325-3347`, `styles.css:661-675`).
- [x] Existing stylesheet-assertion test pattern located in `AccessibilityDefects.test.ts` and `LayerScaleAndTimelineWidth.test.ts`, including the eslint-disable header the latter uses for reading files from disk.

### Definition of Done
- [x] The form's full-bleed sizing is scoped by input type and the duplicate checkbox keeps its native box.
- [x] Each view-type card declares its own height, width, box-sizing, track layout and wrapping.
- [x] Hover, focus ring and transition are restated on the tile after it stops carrying the shared menu-row class.
- [x] Every tile has a caption rule that keeps the text inside the tile.
- [x] The tile grid keeps uniform row heights.
- [x] The duplicate action is a separate footer row with its own top rule, added without editing the shared toolbar-row declaration list.
- [x] The popover's frame counts toward its own viewport clamp.
- [x] The shared `.db-menu-item` rule is unedited and still applies to every genuine menu row.
- [x] No `!important` is added anywhere in the diff.
- [x] `src/views/AddViewPopoverLayout.test.ts` exists and every assertion fails against the pre-fix tree.
- [ ] Full quality gate passed cleanly: `npx tsc --noEmit`, `npm run build`, and `npx vitest run` — **not run in this session; the orchestrator verifies these gates.**
- [ ] Visual confirmation in the running plugin, in light and dark themes and at the narrow clamp — **not possible in this session; needs the running app.**

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
**Say what the box is, instead of inheriting it.** The popover has three kinds of child and each now declares its own box:

- **Form fields** — full-bleed text inputs and the select, matched by a selector that names the types it means.
- **Toggles** — the duplicate checkbox, which declares only that it must not shrink; its size stays the platform's, because the platform's checkbox metrics are already correct and any width we declare would fight an `appearance: none` control.
- **Tiles** — the view-type cards: a two-row grid (preview, caption) in a box that grows to fit them, in a two-column outer grid with equal row heights.

The footer action stays a menu row, because it genuinely is one; it keeps `.db-menu-item` and gains only a separator and a height reset, in a rule of its own so the shared row list is untouched.

### Key Components

| Component | Role |
|---|---|
| `.db-add-view-form input:not([type="checkbox"]):not([type="radio"])` (`styles.css`) | Full-bleed sizing for the text fields and, via its own selector, the key-field select |
| `.db-add-view-duplicate input` (`styles.css`) | Declares only `flex: 0 0 auto` and `margin: 0`, so the native checkbox box survives |
| `.db-add-view-cards` (`styles.css`) | Two-column grid with `minmax(0, 1fr)` tracks and `grid-auto-rows: 1fr` for uniform tiles |
| `.db-add-view-card` (`styles.css`) | The tile box: `height: auto`, `width: 100%`, `box-sizing: border-box`, single-column two-row grid, `white-space: normal`, `box-shadow: none` |
| `.db-add-view-card:hover` / `:focus-visible` (`styles.css`) | The states the tile used to get from `.db-menu-item`, restated on itself |
| `.db-add-view-card-label` (`styles.css`) | Previously unstyled; the caption's own rule |
| `.db-add-view-preview` / `-icon` / `-lines` (`styles.css`) | Contained preview: `min-width: 0`, explicit 18px icon, `max-width: 100%` on the fixed-width glyph |
| `.db-add-view-duplicate-action` (`styles.css`) | Footer row: `height: auto`, top margin, hairline top rule, square corners |
| `.db-add-view-popover` (`styles.css`) | `box-sizing: border-box`, so the existing viewport clamp is measured on the outer box |
| `ToolbarRenderer.showAddViewMenu` | Creates the tile without the menu-row class, keeping `role="menuitem"` |

### Data Flow
`ToolbarRenderer.showAddViewMenu` builds `.db-view-tab-popover.db-add-view-popover` inside `.note-database-container` → `.db-panel-header` → `.db-add-view-form` (name input, key-field select, duplicate label with its checkbox, icon input) → `.db-add-view-cards` (one `button.db-add-view-card` per view type, each holding `.db-add-view-preview` with an icon span and a lines span, then `.db-add-view-card-label`) → optional `button.db-add-view-duplicate-action`. `positionToolbarPopover` then places the panel; it does not reparent it, so every `.note-database-container`-scoped rule applies. `installMenuKeyboardNavigation` collects `button[role=menuitem]` inside the panel, which still returns every tile and the footer action.

### Mobile/iCloud Safety Notes
Display-only throughout: no write path, no network call, no persisted state, no new listener. The narrow-width path is covered by `minmax(0, 1fr)` tracks, a wrappable caption, a capped preview glyph and the border-box popover frame. Both the coarse-pointer and reduced-motion behaviours are inherited from existing container-wide rules rather than re-declared.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Cascade Audit
Read every `db-menu-item` and `db-add-view` rule, test the horizontal-row hypothesis against the actual declarations, confirm the popover is not reparented, confirm the class is never queried in TypeScript, and locate the in-repo precedent for the button-height reset.

### Phase 2: Form Region
Narrow the full-bleed sizing selector by input type and give the duplicate checkbox a rule that pins nothing but its flex behaviour.

### Phase 3: Tile Region
Give `.db-add-view-card` its own box model and states, add the caption rule, contain the preview and its glyph, and set uniform rows on the grid. Drop the menu-row class from the tile in `ToolbarRenderer`.

### Phase 4: Frame and Footer
Add `box-sizing: border-box` to the popover and a separate footer rule for the duplicate action.

### Phase 5: Regression Suite
Add `src/views/AddViewPopoverLayout.test.ts` asserting the tile layout, the unstretched checkbox, the caption rule, the uniform grid, the standalone footer row and the untouched shared rule.

### Phase 6: Verification
`npx tsc --noEmit`, `npm run build`, `npx vitest run`. Not runnable in this session; the orchestrator executes them.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

The defect lives entirely in the shipped stylesheet and in one class string, so the regression suite follows the existing stylesheet-assertion pattern rather than mounting a DOM. `AddViewPopoverLayout.test.ts` parses `styles.css` into selector/body pairs — stripping comments first so prose commas cannot masquerade as selector separators — and asserts declarations by exact selector, unioning the blocks when a selector appears in more than one rule.

Each assertion is chosen to fail against the pre-fix tree:

| Assertion | Pre-fix state |
|---|---|
| Every selector matching `.db-add-view-form input` carries `:not([type="checkbox"])` | The selector was a bare `.db-add-view-form input`, which stretched the checkbox |
| `.db-add-view-duplicate input` declares `flex: 0 0 auto` and no `width` | The rule did not exist |
| `.db-add-view-card` declares `height: auto` | No height was declared, so the pinned button height won |
| `.db-add-view-card` declares `grid-template-columns: minmax(0, 1fr)` | Only `display: grid` and `gap` were declared |
| `.db-add-view-card` declares `white-space: normal` | The inherited `nowrap` was never released |
| `ToolbarRenderer` creates the card with `cls: "db-add-view-card"` | It was `cls: "db-add-view-card db-menu-item"` |
| `.db-add-view-card-label` declares `min-width: 0` and `overflow-wrap: anywhere` | The class had no CSS at all |
| `.db-add-view-cards` declares `grid-auto-rows: 1fr` | Rows were content-sized, so tile heights could differ |
| `.db-add-view-popover` declares `box-sizing: border-box` | The clamp was measured on a content box |
| `.db-add-view-duplicate-action` declares `height: auto` and `border-top: 1px solid` | Neither was declared; the row had no separator and inherited the pinned height |
| `.db-menu-item` still declares `min-height: 30px`, and the footer action still carries the class | Guard: passes before and after, so a regression that guts the shared rule fails here |

Two behaviours are deliberately *not* asserted, because a text assertion on them would be theatre: that the rendered tile is actually 80px tall, and that no horizontal scrollbar appears. Both need a real layout engine. The suite catches the class of regression that caused this defect — a box that never declared its own size — and a visual check remains the complement.

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Notes |
|---|---|---|
| Host app `button` defaults | External | Not in this repository; the pinned height and `nowrap` were inferred from two in-repo compensations and neutralised by declaring the tile's own box explicitly |
| `.db-menu-item` (`styles.css:226-264`) | Internal | Unedited; the tile stops using it, every genuine row keeps it |
| Shared toolbar-row block (`styles.css:18719-18740`) | Internal | Unedited; the footer action's new declarations live in a later rule naming only that class |
| Container-wide reduced-motion rule (`styles.css:18840-18852`) | Internal | Already suppresses the tile's transition, so no new reduced-motion rule was added |
| Container-wide focus-visible rule (`styles.css:18866-18875`) | Internal | Second source of the focus ring the tile no longer inherits from `.db-menu-item` |
| `installMenuKeyboardNavigation` (`ToolbarRenderer.ts:1971`) | Internal | Selects `button[role=menuitem]`; the role is retained so navigation is unchanged |
| Concurrent column-header work | Coordination | `.db-column-menu-trigger`, `.db-board-column-options` and the table and board header rules deliberately untouched |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Every change is confined to the `.db-add-view-*` region of `styles.css`, one class string in `src/views/ToolbarRenderer.ts` and one new test file. Reverting the phase diff restores the prior rendering exactly; there is no migration, persisted state or config shape to unwind. A partial rollback is possible in one direction only: reverting the CSS while keeping the renderer change would leave the tiles with neither the menu-row styling nor their own, which is worse than either end state — so the two must be reverted together.

<!-- /ANCHOR:rollback -->
