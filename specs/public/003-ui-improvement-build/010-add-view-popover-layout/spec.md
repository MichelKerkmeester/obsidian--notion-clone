---
title: "Feature Specification: Add-View Popover Layout Defects"
description: "User-reported regression fix for the Add view popover: the duplicate checkbox was stretched to the form width by a bare descendant `input` selector, and the view-type cards collapsed to one input-height because a button used as a tile never reset the host app's pinned button height, so previews and captions painted outside their own tiles and overflowed the popover horizontally."
trigger_phrases:
  - "view selector is completely broken"
  - "add view popover layout"
  - "db-add-view-card collapsed tile"
  - "duplicate checkbox stretched full width"
  - "add view cards horizontal scrollbar"
  - "db-add-view-preview outside card"
  - "view type card labels missing"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/003-ui-improvement-build/010-add-view-popover-layout"
    last_updated_at: "2026-08-28T00:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored add-view popover layout specification from the user report and a cascade audit"
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
# Feature Specification: Add-View Popover Layout Defects

> Phase chain: parent [`../spec.md`](../spec.md), predecessor `009-header-affordance-defects`, successor none (latest defect phase).

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Level** | 1 |
| **Priority** | P0 |
| **Status** | Complete pending orchestrator gates |
| **Created** | 2026-08-28 |
| **Branch** | `impl` |
| **Wave** | 1 |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
A user reported that "the view selector is completely broken ui wise". The surface is the **Add view** popover built in `src/views/ToolbarRenderer.ts:1234-1296`. Seven symptoms were reported; they resolve to four defects.

1. **A bare descendant `input` selector stretched the checkbox (`styles.css:18541-18547` pre-fix).** `.note-database-container .db-add-view-form input` declared `width: 100%; min-height: 32px`. The rule exists for the two free-text fields, which are direct children of the form, but it is a descendant selector, so it also matched the duplicate checkbox nested inside `label.db-add-view-duplicate` (`ToolbarRenderer.ts:1251-1253`). An `appearance: none` checkbox forced to the full form width and 32px tall renders as a form-wide outlined pill; its caption, a flex sibling with no width floor, was squeezed out of sight. That is the reported "enormous flattened ellipse".

2. **A button used as a tile never reset the pinned button height (`styles.css:18612-18621` pre-fix).** `.db-add-view-card` declared `display: grid` and `gap`, but no `height`. The host app pins a bare `<button>` to its single-line input height and to `white-space: nowrap`; the tile therefore stayed one line tall while its contents — a 48px `.db-add-view-preview` plus a caption — needed roughly 80px. Buttons do not clip, so the preview and caption painted *outside* the tile, over the neighbouring row. That is the reported "icon floats above and outside its own bar" and "label sits below its bar, colliding with the next row".

   The height conflict was invisible in the stylesheet because `.db-menu-item` (`styles.css:226-231`) declares `min-height: 30px`, the same value, so nothing in the cascade looked wrong. The class was suspected as the cause of a competing *horizontal row* layout; that was checked and disproved — `.db-menu-item` declares only `min-height`, `border`, `border-radius` and `transition`, and no `display` at all. The real conflict was with the host app's own `button` rule, which is not in this repository. Two in-repo compensations for it already exist and confirm the shape of the problem: `.db-calendar-search-result` (`styles.css:3325-3347`), a button used as a two-row tile, carries `height: auto !important` and `box-shadow: none !important`; `button.db-icon-only-button` (`styles.css:661-675`) pins an explicit `height` and `box-shadow: none`.

3. **The caption had no rule at all.** `.db-add-view-card-label` appeared nowhere in the stylesheet, so captions inherited the button's `nowrap` and ran past the ~150px grid column. Longer captions overflowed the popover's `overflow: auto` box, producing the reported horizontal scrollbar, and painted over the "Duplicate current view" row beneath the grid — which is why that action read as "crammed onto the same line as a stray card label" when it was in fact already a full-width row of its own.

4. **The popover's viewport clamp was measured on a content box.** `.db-add-view-popover` inherits `width: min(360px, calc(100vw - 24px))` (`styles.css:18526-18533`) but not `box-sizing: border-box`, so the popover's own 8px padding and 1px border added roughly 18px beyond the width it was allowed to occupy.

### Purpose
Give the popover's two broken regions an explicit, self-describing box model instead of one that depends on what the host app happens to declare for bare elements:
- Size the form's full-bleed rule **by input type**, so the checkbox keeps its native box and its caption stays beside it.
- Make each view-type card a **self-contained tile** with its own height, wrapping and spacing, and stop labelling it as a menu row so a future change to the shared row rule cannot collapse it again.
- Give the caption a rule so **every** card shows its label inside its own bounds.
- Make the popover frame honour its own viewport clamp.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- **Type-scoped form sizing**: narrow `.db-add-view-form input` to `input:not([type="checkbox"]):not([type="radio"])` so the full-bleed rule reaches the text fields and the select only.
- **Native checkbox box**: add `.db-add-view-duplicate input { flex: 0 0 auto; margin: 0 }` — no width or height, so the platform's own checkbox metrics apply and the row's `gap` owns the spacing.
- **Tile box model**: give `.db-add-view-card` an explicit `height: auto`, `width: 100%`, `box-sizing: border-box`, single-column `grid-template-columns: minmax(0, 1fr)`, `grid-template-rows: auto auto`, `align-content: start`, `white-space: normal` and `box-shadow: none`.
- **Tile state styling**: because the card stops carrying `db-menu-item`, restate hover (accent border plus hover background) and `:focus-visible` (accent border plus the shared focus ring) on the card itself, and give it its own transition.
- **Uniform tiles**: `grid-auto-rows: 1fr` on `.db-add-view-cards` so a wrapped caption in one tile does not make its row taller than the others.
- **Caption rule**: add `.db-add-view-card-label` with `min-width: 0`, `overflow-wrap: anywhere`, the extra-small type size and the normal text colour.
- **Preview containment**: `min-width: 0` on `.db-add-view-preview`, explicit 18px icon sizing via a new `.db-add-view-preview-icon` rule, and `max-width: 100%` on the fixed-width `.db-add-view-preview-lines` glyph.
- **Duplicate action row**: a dedicated `.db-add-view-duplicate-action` rule adding `height: auto`, a top margin, a `--db-border-subtle` top rule and square corners, so it reads as a footer action under the grid rather than as a stray caption.
- **Popover frame**: `box-sizing: border-box` on `.db-add-view-popover` alone, so its padding and border count toward the existing viewport clamp.
- **Renderer**: drop `db-menu-item` from the view-type card's class list in `ToolbarRenderer.showAddViewMenu`, keeping `role="menuitem"` because keyboard navigation keys off the role.
- **Regression suite**: `src/views/AddViewPopoverLayout.test.ts` asserting the shipped stylesheet and the renderer source.

### Out of Scope
- Table and board column headers, `.db-column-menu-trigger` and `.db-board-column-options` — owned by the concurrent `009-header-affordance-defects` change.
- The shared `.db-menu-item` rule itself (`styles.css:226-264`) and every other menu row that uses it: the class is left exactly as it is, because every remaining user of it is a genuine single-line row.
- The shared `.db-toolbar-menu-row` / `.db-new-template-row` / `.db-new-template-default-action` declaration block: the duplicate action's new declarations are added in a separate, later rule rather than by editing that list.
- The `.db-add-view-preview.is-<viewtype>` modifier classes, which have never had any rules; every tile shows the same generic two-line glyph beside its icon.
- The popover's ARIA shape (`role="menuitem"` children inside a `role="dialog"`), which the keyboard navigation depends on.
- Writing note frontmatter or markdown bodies, telemetry, and desktop-only APIs (strictly excluded).

### Files to Change

| File Path (fork-relative) | Change Type | Description |
|---|---|---|
| `styles.css` | Modify | Type-scoped form sizing, native checkbox box, tile box model with hover/focus states, uniform tile rows, caption rule, preview containment, duplicate-action footer row, popover border-box frame |
| `src/views/ToolbarRenderer.ts` | Modify | Drop the menu-row class from the view-type cards and record why the tile is not a menu item |
| `src/views/AddViewPopoverLayout.test.ts` | Create | Regression suite asserting the tile layout, the unstretched checkbox and the standalone duplicate row against the shipped stylesheet and the renderer source |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-001 | The duplicate checkbox renders at its native size with its caption beside it on one line | Every selector in the stylesheet matching `.db-add-view-form input` carries `:not([type="checkbox"])`; `.note-database-container .db-add-view-duplicate input` declares `flex: 0 0 auto` and declares no `width`. |
| REQ-002 | Each view-type card is a self-contained tile whose contents stay inside its own bounds | `.note-database-container .db-add-view-card` declares `height: auto`, `display: grid`, `grid-template-columns: minmax(0, 1fr)`, `grid-template-rows: auto auto` and `box-sizing: border-box`, so the preview and caption stack inside a box that grows to fit them. |
| REQ-003 | Every card shows its caption | `.note-database-container .db-add-view-card-label` exists and declares `min-width: 0` and `overflow-wrap: anywhere`; the card declares `white-space: normal`, releasing the `nowrap` a bare button inherits. |
| REQ-004 | Nothing overflows the popover horizontally | `.db-add-view-cards` declares `grid-template-columns: repeat(2, minmax(0, 1fr))`; `.db-add-view-preview` declares `min-width: 0`; `.db-add-view-preview-lines` declares `max-width: 100%`; `.db-add-view-popover` declares `box-sizing: border-box` so its frame counts toward the existing `min(360px, calc(100vw - 24px))` clamp. |
| REQ-005 | "Duplicate current view" occupies its own full-width row beneath the grid | The declarations for `.note-database-container .db-add-view-duplicate-action` include `width: 100%`, `height: auto` and `border-top: 1px solid`, and the rule adding them is a separate block that leaves the shared toolbar-row declaration list untouched. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| REQ-006 | The tile stops being labelled a menu row, so the shared row rule cannot collapse it again | `ToolbarRenderer.showAddViewMenu` creates the card with `cls: "db-add-view-card"`; the string `db-add-view-card db-menu-item` appears nowhere in the source; `role="menuitem"` is retained because `installMenuKeyboardNavigation` selects on `button[role=menuitem]`, not on the class. |
| REQ-007 | The shared menu-row rule keeps working for the menus that really are rows | `.db-menu-item` still declares `min-height: 30px` and is not edited; `.db-add-view-duplicate-action` still carries the class, because it is a genuine single-line row. |
| REQ-008 | Tiles are visually uniform and keep hover and focus feedback after losing the shared class | `.db-add-view-cards` declares `grid-auto-rows: 1fr`; `.db-add-view-card:hover` declares an accent border and a hover background; `.db-add-view-card:focus-visible` declares the accent border and `box-shadow: var(--db-accent-focus-ring)`. |
| REQ-009 | A regression suite fails against the broken layout | `src/views/AddViewPopoverLayout.test.ts` asserts, against the shipped `styles.css` and `ToolbarRenderer.ts`, that the cards are vertical tiles rather than inheriting the menu-row box, that the checkbox is not stretched, and that the duplicate action is its own row. |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The duplicate toggle renders as a normal checkbox at its platform size, with "Duplicate current view" on the same line beside it.
- **SC-002**: Each view-type card is a bordered tile containing its preview and, under it, its caption; nothing paints over a neighbouring tile.
- **SC-003**: All seven tiles show their caption, and all tiles in the grid are the same height.
- **SC-004**: "Duplicate current view" sits on its own full-width row beneath the grid, separated by a hairline rule.
- **SC-005**: The popover has no horizontal scrollbar; the grid stays inside the popover at 360px and at the narrow `calc(100vw - 24px)` clamp.
- **SC-006**: The fix uses no `!important` and edits no shared rule that other surfaces depend on; the form's sizing rule is *narrowed* by input type rather than overridden.
- **SC-007**: Display-only rendering verified: the change touches presentation and one class string only; zero writes to note frontmatter or markdown bodies, no telemetry, no new external dependencies.

### Acceptance Scenarios

- **Scenario 1**: **Given** the Add view popover is open, **when** it renders, **then** the duplicate checkbox is a small square with its caption beside it, not a form-wide outlined pill.
- **Scenario 2**: **Given** the popover at its default 360px width, **when** the view-type grid renders, **then** each of the seven tiles shows a preview and a caption inside its own border, and no tile's content overlaps the row above or below.
- **Scenario 3**: **Given** a caption long enough to wrap in a narrow column, **when** the grid renders, **then** the caption wraps inside its tile and every tile in the grid keeps the same height.
- **Scenario 4**: **Given** the popover on a narrow window where the clamp is `calc(100vw - 24px)`, **when** it renders, **then** no horizontal scrollbar appears and the two-column grid still fits.
- **Scenario 5**: **Given** keyboard focus moved through the popover with the arrow keys, **when** a tile takes focus, **then** it shows the accent focus ring and Enter creates that view type — unchanged behaviour, because navigation keys off `role="menuitem"` rather than the class that was removed.
- **Scenario 6**: **Given** any other menu that uses `.db-menu-item` — the toolbar overflow menu, the view tab menu, the database picker — **when** it renders, **then** it is unchanged, because the shared rule was not edited.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Risk | The host app's `button` rule is not in this repository, so the exact declaration that pinned the tile height could not be read directly | The stated root cause is inferred rather than quoted | The fix declares the tile's own box model explicitly — `height`, `width`, `box-sizing`, `white-space`, `box-shadow` — so it holds whichever of the app's button defaults was responsible; two in-repo compensations for the same defaults (`styles.css:3325-3347`, `styles.css:661-675`) corroborate the reading |
| Risk | Dropping `db-menu-item` from the tile also drops the hover background, the focus ring and the transition it supplied | Silent loss of focus visibility | All three are restated on the card itself (`styles.css:18655-18664`); the blanket `.note-database-container :is(button, …):focus-visible` rule at `styles.css:18866-18875` is a second, independent source of the same ring |
| Risk | Dropping the class also drops the tile from the `.db-menu-item` entry in the reduced-motion list at `styles.css:377` | Transition would still run under reduced motion | Already covered: `styles.css:18840-18852` declares `transition: none !important` for `.note-database-container *` under `prefers-reduced-motion: reduce`, which reaches the tile regardless of its classes |
| Risk | `grid-auto-rows: 1fr` equalises every row to the tallest tile | Slightly taller grid when one caption wraps | Intended: uniform tile height was an explicit requirement of the fix, and the popover already scrolls vertically at `max-height: min(420px, calc(100vh - 140px))` |
| Risk | `box-sizing: border-box` on the popover reduces its content width by ~18px | Grid columns narrow by ~9px each | Deliberate: the clamp was always meant to be the popover's outer size; the columns still fit the longest caption, and the alternative is exceeding the viewport allowance the clamp was written for |
| Dependency | Shared `.db-menu-item` rule (`styles.css:226-264`) | Styles every other menu row | Not edited; the tile stops using it instead |
| Dependency | Shared toolbar-row declaration block (`styles.css:18719-18740`) | Also styles `.db-toolbar-menu-row`, `.db-new-template-row`, `.db-new-template-default-action` | Not edited; the duplicate action's new declarations live in a separate later rule that names only that one class |
| Dependency | Concurrent column-header work | Same stylesheet | `.db-column-menu-trigger`, `.db-board-column-options` and the table and board header rules are untouched here |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## 7. NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The fix is declarative CSS plus one shortened class string; no new listeners, timers, observers, layout reads or DOM nodes are introduced.

### Security
- **NFR-S01**: Zero external network requests, CDNs, telemetry, or remote dependencies; pure local Obsidian DOM APIs; MIT-forkable.

### Reliability & Compatibility
- **NFR-R01**: Display-only and iCloud-safe: opening the popover, hovering a tile and focusing a tile produce 0 writes to note frontmatter or bodies. The popover's existing write path — `actions.addView(...)` on click — is unchanged.
- **NFR-R02**: Theme-safe in light and dark: every colour is a token or a theme variable (`--db-border-regular`, `--db-border-subtle`, `--db-hover-bg`, `--db-accent-focus-ring`, `--background-primary`, `--background-secondary`, `--text-normal`), all of which are re-declared for dark themes in the block at `styles.css:383-399`. No literal colour is added.
- **NFR-R03**: Narrow-width-safe: the two-column grid uses `minmax(0, 1fr)` tracks, the caption may wrap, the fixed-width preview glyph is capped at `max-width: 100%`, and the popover frame now counts toward its own viewport clamp.
- **NFR-R04**: No optional API is called unguarded; the change calls no API at all beyond the `createEl` / `setIcon` calls that were already there.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## 8. EDGE CASES

### Data Boundaries
- **Longest caption ("Calendar view", "Timeline view") in the narrow clamp**: the caption wraps inside its tile via `overflow-wrap: anywhere`; `grid-auto-rows: 1fr` raises the whole grid rather than letting one tile stand taller.
- **A database whose schema has no non-`file.name` columns**: the key-field `<select>` renders with no options. Unchanged by this phase; the select keeps its full-bleed sizing because it is matched by its own selector, not by the narrowed `input` selector.
- **No current view (`db.views[currentViewIndex]` undefined)**: the duplicate action is not created at all, so the grid is the last element in the popover and the new top-border rule never renders.
- **Seven view types in a two-column grid**: the last row holds a single tile, which stretches to the column width like every other tile because the card declares `width: 100%`.
- **Reduced motion**: the tile's own transition is suppressed by the existing container-wide `transition: none !important` rule rather than by a new declaration.

### Error Scenarios
- **Icon name unresolved by `setIcon`**: the preview span stays empty; the tile keeps its height because `.db-add-view-preview` declares `min-height: 48px`, and the caption still renders.
- **`--db-hover-bg` unset by a theme**: the hover background falls back to `var(--background-modifier-hover)` through the declared fallback.

### Concurrent Operations
- **Another toolbar popover open**: unchanged — `showAddViewMenu` still closes the database, group, export and title-action popovers and calls `actions.closeToolbarPopovers?.()` behind an optional-call guard before opening.
- **Concurrent column-header edits to the same stylesheet**: disjoint regions; this phase touches only `.db-add-view-*` and one `box-sizing` declaration on `.db-add-view-popover`.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:questions -->
## 9. OPEN QUESTIONS

- **The `.is-<viewtype>` preview modifiers have never been styled.** `ToolbarRenderer.ts:1267` writes `db-add-view-preview is-${value}`, but no `.db-add-view-preview.is-table`, `.is-board`, `.is-gallery` … rule exists anywhere in the stylesheet. Every tile therefore shows the same generic two-line glyph beside its type icon. That is a pre-existing gap rather than part of the reported defect, so the structure is left intact and the tiles are now distinguished by icon and caption. Per-type previews would be a separate design change.
- **Caption alignment.** The preview is centred by `place-items: center`, so the caption was centred under it rather than left-aligned as the pre-fix rule declared. This is a judgement call made to keep the tile reading as one centred unit; it is trivially reversible to `text-align: start` if the parent phase prefers left alignment.
- **`role="menuitem"` inside `role="dialog"`.** The tiles and the duplicate action declare `role="menuitem"` without an ancestor `menu` or `menubar`. `installMenuKeyboardNavigation` selects on that role, so it was left alone; correcting the ARIA shape would mean changing the navigation contract for six other popovers that share the helper.

<!-- /ANCHOR:questions -->
---

<!-- ANCHOR:related-docs -->
## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Predecessor Spec**: [`../009-header-affordance-defects/spec.md`](../009-header-affordance-defects/spec.md)
- **Implementation Plan**: See `plan.md`
- **Task Breakdown**: See `tasks.md`
- **Verification Checklist**: See `checklist.md`
- **Implementation Summary**: See `implementation-summary.md`

<!-- /ANCHOR:related-docs -->
