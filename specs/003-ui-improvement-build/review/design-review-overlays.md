# Design review — overlays lane

> Sonnet 5 (xhigh), read-only, judged against `sk-design` references. Findings are the reviewer's; line citations were spot-checked, not exhaustively verified.

## Verdict

The overlay system has real engineering behind it — a genuine z-index token scale, a centralized dismissal stack, and viewport-aware collision handling — but the elevation layer has drifted out of sync with itself. The standout defect is a documented-but-false z-index assumption that puts a parent panel visually and interactively *above* the child editors it's supposed to host, breaking desktop field-editing inside the calendar/timeline record panel. Beyond that, several "finishing" details (disabled-option hover, backdrop click-through, motion symmetry, dead backdrop-filter) show the same pattern: a correct fix was applied once, in one place, and never generalized. This lane is functional but not yet coherent.

## Findings

### [P0] Record-detail-panel outranks its own child editors, hiding them
- **What**: `.note-database-container .db-record-detail-panel` is hardcoded to `z-index: 999` (`styles.css:8783`), with a comment claiming child popovers sit at "1000 / 1001 / 1002" and therefore render above it (`RecordDetailPanel.ts:38-40`). That's no longer true: every desktop cell editor it hosts — `.db-cell-edit-popover`, `.db-cell-option-popover`, `.db-color-picker-popup`, `.db-dropdown-popover` — resolves to `z-index: var(--db-layer-popover, 100)` (`styles.css:346, 2336, 6135, 6386, 6526`). `CellRenderer.ts:1715` appends the desktop date popover to the same `.note-database-container` the panel lives in (`host = container || window.activeDocument.body`), so they share one stacking context with no intervening transform (the panel deliberately avoids one, per its own comment).
- **Where**: `styles.css:8779-8783`, `RecordDetailPanel.ts:38-40`, `CellRenderer.ts:1715`
- **Why it's wrong**: motion-principles.md Section 4 ("Animated elements need explicit z-index... without one it breaks the layering") and review-checklist.md's "z-index conflicts" check. The bug is corroborated by the codebase itself: the *mobile* inline variant of this same date popover hardcodes `zIndex: "1000"` (`CellRenderer.ts:1747`) — specifically high enough to clear 999 — but that fix was never carried to the desktop path or the shared `.db-cell-edit-popover` class.
- **Fix**: give `.db-record-detail-panel` a layer token below its children (e.g. reuse `--db-layer-panel: 50`) instead of an ad hoc 999, or raise the shared popover token above it; either way, stop hardcoding raw numbers next to a named scale that already exists.

### [P1] Backdrop-filter blur is inert on every popover — always painted over an opaque surface
- **What**: `.db-dropdown-popover` and siblings get `backdrop-filter: blur(var(--db-overlay-blur, 12px))` in three separate places (`styles.css:340-349`, `:2321-2336`, and a later "win" rule at `:18011-18040`), but every one of those rules also sets a fully opaque `background` (`var(--background-primary)` or `var(--db-surface-overlay)`, both solid `color-mix` results with no alpha). A blur behind an opaque layer has no visible effect.
- **Where**: `styles.css:340-349`, `:2321-2336`, `:18011-18040`
- **Why it's wrong**: interaction-craft.md Section 7: "Large `blur()` values on `filter` and `backdrop-filter` are slow" — here it's paid on every open popover for zero visual result, and the rule is duplicated three times rather than fixed once.
- **Fix**: drop `backdrop-filter` from opaque surfaces, or make the surface genuinely translucent if a blur is wanted.

### [P1] Disabled dropdown options still show the hover highlight
- **What**: `.db-dropdown-option.is-disabled` only touches `opacity`/`cursor` (`styles.css:2427-2432`, mirrored at `:2667` for the modal context); the earlier `.db-dropdown-option:hover { background: var(--background-modifier-hover) }` (`styles.css:2416`) is never suppressed for it. This specifically hits the rows that carry a `disabledReason` tooltip, since `DropdownField.ts:231-238` deliberately keeps those rows *not* natively `disabled` (a Chromium hover-tooltip workaround), so `:hover` fires normally.
- **Where**: `styles.css:2416`, `:2427-2432`
- **Why it's wrong**: review-checklist.md Section 5, "Missing form field states... disabled" — a disabled row that highlights on hover reads as clickable. The project already knows the fix elsewhere: `.db-chart-options-row.is-disabled:hover` (`:4079`) and `.db-group-popover-row.is-disabled:hover` (`:9747`) both null the hover background; dropdown options were just missed.
- **Fix**: add the same `:hover` override for `.db-dropdown-option.is-disabled`/`:disabled`.

### [P1] Searchable dropdown auto-focuses a 12px input, defeating the mobile bottom sheet
- **What**: `DropdownField.ts:287` unconditionally does `window.setTimeout(() => searchInput?.focus(), 0)` whenever a dropdown has >8 options, regardless of device. The input's font-size is inherited from `.db-dropdown-popover`'s `font-size: 12px` (`styles.css:2321`) via `font: inherit` (`:2366-2376`) — no touch override.
- **Where**: `DropdownField.ts:287`, `styles.css:2321`, `:2366-2376`
- **Why it's wrong**: interaction-craft.md Section 3 breaks two rules at once — "Input font size must be at least 16px, or iOS zooms the page on focus" and "Do not autofocus inputs on touch devices." `PopoverPosition.ts:245-251` already has a touch-detection helper (`isMobileBottomSheet`) that isn't reused here.
- **Fix**: gate the autofocus on non-touch, and set the search input to 16px unconditionally.

### [P1] Mobile bottom-sheet backdrop is click-through
- **What**: `.db-mobile-bottom-sheet::before` renders the dimming scrim but sets `pointer-events: none` (`styles.css:199-206`); there is no override anywhere restoring `pointer-events: auto`.
- **Where**: `styles.css:199-206`
- **Why it's wrong**: motion-principles.md Section 4: "Dim modal and dialog backgrounds... a transparent scrim does not isolate anything" — here the scrim is visually opaque but behaviorally transparent, so a tap meant to dismiss the sheet also reaches whatever table row/card sits underneath it.
- **Fix**: give the scrim `pointer-events: auto` and let `OverlayStack`'s existing outside-pointerdown handling do the dismissal (it already ignores clicks inside the panel/anchor).

### [P2] Enter animates, exit doesn't
- **What**: `.db-overlay-enter`/`.is-visible` gives every anchored popover a 120ms fade+scale entrance (`styles.css:171-181`), but every close path (`DropdownField.ts` cleanup, `TableRecordPeek.ts:closePanel`, `RecordDetailPanel.ts:close`) calls `panel.remove()` synchronously with no exit transition.
- **Where**: `styles.css:171-181`
- **Why it's wrong**: motion-principles.md's entrance/exit pairing (`ease-out` in, `ease-in` out) and its consistency rule are both about symmetry; a hard cut on close reads as unfinished next to the fade-in.
- **Fix**: add a short exit class swapped before `remove()`, matching the 120ms band already in use.

### [P2] `TableRecordPeek` and `RecordDetailPanel` are visually unrelated despite the same job
- **What**: `.db-record-peek-panel` (`styles.css:17896-17910`) has no `box-shadow`, no `.db-overlay-enter`, and `background: var(--background-primary)` — identical to the canvas, separated only by a 1px `border-left`. `RecordDetailPanel` gets `--db-elevation-2` and fade/scale motion via `positionToolbarPopover`.
- **Where**: `styles.css:17896-17910` vs `:8782-8790`
- **Why it's wrong**: depth-and-detail.md's light-source consistency — two overlays doing the same "peek at a row" job should share one elevation treatment.
- **Fix**: route `TableRecordPeek` through the same surface/elevation tokens, or document why the docked variant is intentionally flat.

## What's genuinely good

- **Theme-adaptive elevation tokens**: `--db-surface-raised/overlay/modal` are derived via `color-mix(..., black/white)` against `--background-primary` with a mirrored dark-theme block (`styles.css:105-118`, `:394-400`), not hardcoded hex — correctly theme-agnostic and exactly what depth-and-detail.md asks for.
- **`PopoverPosition.ts` collision handling** is thorough: it recomputes on resize/scroll/visualViewport, flips above/below by measured space (`:92-95`), clamps horizontally (`resolvePopoverHorizontalLeft`), and accounts for the mobile nav bar safe area (`:234-239`).
- **`OverlayStack.ts`** centralizes Escape/outside-pointerdown dismissal and focus restoration per-document rather than each popover reinventing it, and correctly scopes "top surface" per document for popouts.
- **Submenu layering is correct**: `.db-column-menu-subpopover` sits at `--db-layer-submenu: 110`, one step above its parent `--db-layer-popover: 100` (`styles.css:351`).
- **`prefers-reduced-motion`** strips the enter transition and the mobile-sheet variant in one shared rule (`styles.css:372-381`) rather than needing per-component opt-outs.

## Needs visual confirmation

- Whether the record-detail-panel/child-editor z-index conflict is as visually total as the code implies — rendering would confirm the editor is fully occluded, not just partially.
- Real-device behavior of the bottom-sheet backdrop tap: does the underlying row's own click handler actually fire alongside dismissal, and how disruptive is it in practice.
- Whether any Obsidian theme ships a non-opaque `--background-primary`, which would make the backdrop-filter finding theme-dependent rather than universal.
