---
title: "Implementation Plan: Column Header Menu Affordance Defects"
description: "Plan for rebuilding the table and board column headers as single flex rows with a non-shrinking menu trigger, removing the blanket touch-target rule that overrode the trigger's positioning, switching to the vertical ellipsis icon, and scoping the drag cursor to the header background."
trigger_phrases:
  - "column header flex row plan"
  - "db-column-menu-trigger cascade override"
  - "board column options button styling"
  - "header cursor scoping plan"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/009-header-affordance-defects"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored implementation plan for the header affordance defect fix"
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
      session_id: "ui-build-009"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Implementation Plan: Column Header Menu Affordance Defects

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|---|---|
| **Language/Stack** | TypeScript, Obsidian View Component Engine, CSS Flexbox |
| **Framework** | Native Obsidian DOM APIs (`createEl`, `setIcon`, `t`) |
| **Storage** | None — strictly display-only; zero note frontmatter or markdown body writes on render (iCloud-safe) |
| **Testing** | Vitest (`npx vitest run`), TypeScript compiler (`npx tsc --noEmit`), plugin bundle build (`npm run build`) |

### Overview
The reported defect — "the 3 dots now always sit underneath the name" — is a cascade conflict, not a missing rule. `.note-database-container .db-column-menu-trigger` declared `position: absolute; top: 5px; right: 5px` at `styles.css:4658`, and a later touch-target block declared `position: relative` on the same selector at equal specificity. The later rule won, the button entered normal flow, and `.db-th-content` — a block-level flex container that fills the cell — pushed it onto the next line.

Patching the absolute rule with `!important` or a higher-specificity selector would restore the visual but preserve the fragility. The plan instead removes the absolute/override pairing altogether:

1. **One flex row per header.** The trigger becomes a sibling of the label inside `.db-th-content` (table) and inside `.db-board-header-text` (board). The name is the only child with a non-zero shrink factor; the button is `flex: 0 0 auto`. A button that is a sibling in a `nowrap` flex row cannot wrap below the name regardless of what any later rule declares about `position`.
2. **One positioning declaration.** The trigger's `position: relative` moves into its own rule and comes out of the shared touch-target list, so a specificity tie in that list can no longer decide its layout.
3. **A halo that respects its neighbour.** With the button now 2px from the name, its `::before` tap-target expansion becomes asymmetric so it grows into the cell padding rather than back over the label.
4. **Honest affordances.** `more-vertical` replaces `more-horizontal`; `cursor: grab` is scoped to the draggable property cells and the pointer is returned over the name and the button on both surfaces.

<!-- /ANCHOR:summary -->
---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- [x] Every occurrence of `db-column-menu-trigger` in `styles.css` read before editing, and the winning declaration identified by cascade order and specificity rather than assumed.
- [x] Board equivalent audited: `button.db-board-column-options` confirmed to have zero CSS rules in `styles.css`, and `.db-board-header-text` confirmed to be `flex: 1 1 auto`.
- [x] `more-vertical` confirmed as a valid Obsidian icon name for `minAppVersion` 1.7.2; `IconName` confirmed to be `string`, so no compiler check exists.
- [x] Table column widths confirmed to come from `table-layout: fixed` plus explicit widths, so adding an in-flow child cannot silently reflow columns.
- [x] Existing stylesheet-assertion test pattern located in `AccessibilityDefects.test.ts` and `LayerScaleAndTimelineWidth.test.ts`.

### Definition of Done
- [x] The trigger is an in-flow, non-shrinking flex sibling of the label with 2px separation.
- [x] `.db-th-label` is the only shrinking child and truncates with an ellipsis.
- [x] The trigger's `position` is declared exactly once across the whole stylesheet.
- [x] The trigger's `::before` halo is declared exactly once and does not extend leftwards.
- [x] The board options button has an inline layout, hover/focus reveal, icon sizing and a coarse-pointer minimum size.
- [x] Both triggers use `more-vertical`.
- [x] `cursor: grab` is scoped to `th[data-note-database-column-key]` and to `.db-board-column-header`; the pointer is returned over the name and the button on both surfaces.
- [x] `estimateAutoColumnWidth` reserves the trigger's inline width.
- [x] `src/views/ColumnHeaderMenuAffordance.test.ts` exists and asserts all four broken behaviours.
- [ ] Full quality gate passed cleanly: `npx tsc --noEmit`, `npm run build`, and `npx vitest run` — **not run in this session; the orchestrator verifies these gates.**

<!-- /ANCHOR:quality-gates -->
---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern
**Single-row header with one flexible child.** Both headers become a flex row whose children divide into exactly two classes:

- **The name group** — type icon, label, sort indicator (table); title, count, summaries (board). Only the label/title carries shrink, with `min-width: 0` so it can actually shrink below its content width, plus `overflow: hidden` and `text-overflow: ellipsis` so shrinking reads as truncation.
- **The action** — the menu trigger, `flex: 0 0 auto`, so it is the last thing the layout will compromise.

Spacing is declared per child rather than as a row `gap`, because the trigger hugs the name at 2px while the icon and sort arrow sit at 6px. A single `gap` cannot express both, and a negative margin to claw one back would reintroduce exactly the kind of hidden coupling this phase is removing.

### Key Components

| Component | Role |
|---|---|
| `.db-th-content` (`styles.css`) | The table header's flex row; `width: 100%`, no `gap`, per-child margins |
| `.db-th-label` (`styles.css`) | The only shrinking child of the table row; truncates |
| `.db-column-menu-trigger` (`styles.css`) | Fixed 22px in-flow action; sole site of its `position` and `::before` inset declarations |
| `.db-board-header-text` (`styles.css`) | The board header's flex row; hugs its content so the button can sit beside the name |
| `.db-board-column-options` (`styles.css`) | Previously unstyled; now mirrors the table trigger |
| `ColumnHeaderController.setupMenuTrigger` | Mounts the trigger into the flex row, falling back to the cell |
| `BoardRenderer.renderBoardGroupOptions` | Receives the name row rather than the header, at both call sites |
| `estimateAutoColumnWidth` (`ColumnWidth.ts`) | Reserves header chrome including the now in-flow trigger |

### Data Flow
`TableRenderer.renderHeader` builds `<th>` → `.db-th-content` → type icon, label, optional sort indicator → calls `setupColumnHeader(th, col)` → `ColumnHeaderController.setup` → `setupMenuTrigger` queries `.db-th-content` on that same `<th>` and appends the button there. The lookup runs after the row exists, so it always resolves; the `|| th` fallback preserves the previous behaviour if the row is ever absent.

`BoardRenderer.renderColumn` and `renderSwimlaneBoard` each build `.db-board-column-header` → toggle, optional checkbox, `.db-board-header-text` → title, count, optional summaries → then call `renderBoardGroupOptions` with the name row instead of the header.

### Mobile/iCloud Safety Notes
Display-only throughout: the change adds no write path, no network call and no persisted state. The coarse-pointer minimum sizes are retained for the table trigger and extended to the board options button. The trigger's enlarged tap halo is narrowed on its left edge specifically so touch taps near the name still reach the sort target.

<!-- /ANCHOR:architecture -->
---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

### Phase 1: Root Cause Removal & Table Header Row
Identify the winning `position` declaration, remove `.db-column-menu-trigger` from the shared touch-target list, move `position: relative` into the trigger's own rule, convert `.db-th-content` to a per-child-spaced full-width row, make `.db-th-label` the single shrinking child, and narrow the `::before` halo.

### Phase 2: Table Renderer & Cursor Scoping
Mount the trigger inside `.db-th-content` from `ColumnHeaderController`, switch to `more-vertical`, scope `cursor: grab` to `th[data-note-database-column-key]`, and return the pointer over the label, type icon and sort indicator.

### Phase 3: Board Header Parity
Convert `.db-board-header-text` to a content-hugging flex row, truncate the titles inside it, pin the count and summaries, add the full `.db-board-column-options` rule set with a coarse-pointer minimum size, mount the button into the name row at both call sites, switch to `more-vertical`, and give the name row the pointer.

### Phase 4: Auto-Fit Allowance & Regression Suite
Raise the header chrome constant in `estimateAutoColumnWidth`, then add `ColumnHeaderMenuAffordance.test.ts` asserting the in-flow trigger, the single positioning declaration, name truncation, the vertical icon, the board parity and the cursor scoping.

### Phase 5: Verification
`npx tsc --noEmit`, `npm run build`, `npx vitest run`. Not runnable in this session; the orchestrator executes them.

<!-- /ANCHOR:phases -->
---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

The defect lives entirely in the shipped stylesheet and in two renderer call sites, so the regression suite follows the existing stylesheet-assertion pattern rather than mounting a DOM. `ColumnHeaderMenuAffordance.test.ts` parses `styles.css` into selector/body pairs — stripping comments first so prose commas cannot masquerade as selector separators — and asserts on declarations by selector.

Each assertion is chosen to fail against the pre-fix tree:

| Assertion | Pre-fix state |
|---|---|
| Exactly one rule declares the trigger's `position`, and it is `relative` | Two rules declared it: `absolute` at `:4658` and `relative` in the touch-target list |
| The trigger declares `display: inline-flex` and `flex: 0 0 auto` | Declared neither |
| `.db-th-label` declares `flex: 0 1 auto` and `white-space: nowrap` | Declared neither |
| Exactly one rule declares the `::before` inset, as `-8px -8px -8px 0` | Two rules declared it, both symmetric |
| Both renderers call `setIcon(button, "more-vertical")` | Both called `more-horizontal` |
| `.db-board-column-options` declares an inline, non-shrinking box | The class had no CSS at all |
| `th[data-note-database-column-key]` declares `cursor: grab` | No such rule existed |
| `.db-board-column-header .db-board-header-text` declares `cursor: pointer` | No such rule existed |

<!-- /ANCHOR:testing -->
---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

| Dependency | Type | Notes |
|---|---|---|
| `styles.css` touch-target block (`:17365-17408`) | Internal | Two list entries removed; the remaining entries and the coarse-pointer minimum sizes are untouched |
| `styles.css` record-icon column override (`:5331`, `:13727`) | Internal | Overrides `.db-th-content` width with a more specific selector; the new `width: 100%` base is consistent with it |
| `src/views/ColumnWidth.ts` | Internal | No test asserts the chrome constant |
| `obsidian` `setIcon` / `IconName` | External | `IconName` is `string`, so an unresolved icon name is a runtime blank rather than a compile error |
| Concurrent add-view popover work | Coordination | `.db-add-view-*` and `.db-view-tab-popover` deliberately untouched |

<!-- /ANCHOR:dependencies -->
---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Every change is confined to `styles.css` and four files under `src/views/`. Reverting the phase diff restores the prior header rendering exactly; there is no migration, persisted state or config shape to unwind. A partial rollback is not advisable: reverting the CSS while keeping the renderer changes would leave the button mounted inside a gap-spaced row with no width reservation.

<!-- /ANCHOR:rollback -->
