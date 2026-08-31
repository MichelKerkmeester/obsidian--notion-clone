---
title: "Goal: The Sheet Drag and the Eight Operator Asks"
description: "What would make phase 016 worth having done, and the criteria that decide it."
trigger_phrases:
  - "016 goal"
  - "sheet drag goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/016-sheet-drag-and-audit"
    last_updated_at: "2026-08-31T09:00:00Z"
    last_updated_by: "harness-dependence-review"
    recent_action: "Keyboard-inset and sheet-fill ticks withdrawn: both read values the harness sets"
    next_safe_action: "Operator answers keyboard step 3 and sheet-colour step 4 of the five-step list"
    blockers:
      - "The keyboard lever is proven; that Obsidian publishes --keyboard-height is not"
      - "Two operator decisions open: the 13px row label and the window-resize close"
      - "No ablation check: the two-revert necessity claim rests on prose"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "probe/sheet-audit.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-016-goal"
      parent_session_id: null
    completion_pct: 78
    open_questions:
      - "Row label 13px is off the type scale; move to 14px or accept"
      - "Should the record sheet survive a window resize instead of closing"
      - "Do the nine sheet surfaces agree in situ, with a theme and the host stylesheet present"
    answered_questions:
      - "The drag kept dying: listeners bound to a node the panel's own render destroys"
---
# Goal: The Sheet Drag and the Eight Operator Asks

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The sheet drag is root-caused rather than fixed again, and the whole bottom-sheet
feedback set is audited together on the shipped build with a number for each ask.

This phase owns the program's most-reported defect. Two earlier fixes were correct —
`touch-action: none` on the handle, a full-width band instead of a 36×4px target — and the report
came back both times. The third report was different in kind: *"still barely works … should
guaranteed move down on initial drag."* **"Barely" is the word that mattered.** The gesture was not
dead. It was dying.

**The root cause, and why reading the function could never have found it.**
`attachSheetDragToDismiss` is correct: 1:1 tracking, no movement threshold, a transform on every
move. Two rounds of reading it found nothing because what is wrong is not in it. `applySheetChrome`
prepends the grab bar as a **child of the panel**; `openRecordDetailPanel`'s own `renderContent`
begins `panel.empty()`. Two owners, one child list, and the render wins because it runs last and runs
on **every view re-render** — every metadata resolve, every computed sync, every filter, every sort,
**every single field edit.**

### Decisions

| ID | Decision |
|----|----------|
| D1 | The gesture binds to the panel, not to the bar, and the handle is resolved at pointerdown from the panel's current children. The panel survives every rebuild; the bar does not. |
| D2 | The render re-asserts the chrome it just destroyed. Not redundant with D1: the bar is a visible affordance, and a sheet with a working gesture and nothing to aim at is still broken. |
| D3 | Probes install Obsidian's **shipped** `setCssProps`. The repo's DOM shim is more permissive than the phone, so a check written against it can pass on declarations the device never receives. |
| D4 | Gestures are driven through the browser's real input pipeline. A synthesised `PointerEvent` skips hit-testing and `touch-action` and proves only that the handler is callable. |
| D5 | The grab band is **closed as an accepted shortfall**, not as a pass. The record needs correcting; the decision does not. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

Evidence below is the `verify-placement` run captured on a clean tree at `f64dd87`: **220/224
geometry checks passed, 4 red for a declared reason**, exit 0. A met criterion carries the check's
own name and its measured number. An operator criterion is never ticked here, however green the
measurement around it reads.

**Two ticks were withdrawn on review, against the question "if this value came from the device
instead of the harness, would the check still pass — and could it still fail?"** The keyboard inset
is measured on a `--keyboard-height` the harness writes and no line of `src/` ever sets, so it proves
the lever and not the signal. The nine-surface fill is 95% of a `--background-primary` the harness
pins inline, read off nine bare divs that all resolve one declaration — so it proves the rule exists
and not that nine real surfaces agree.

**The drag survives that question, and it is the strongest evidence in this packet.** Ask 1 is driven
through Chrome DevTools `Input.dispatchTouchEvent` — the browser's own input pipeline, subject to
hit-testing and `touch-action` — against the shipped `openRecordDetailPanel` and the shipped
`refreshRecordDetailPanel`. The stubs it is handed (`editCell`, `openRow`, `editFileName`) take no
part in producing the transform it measures. The 44×44 header, the scrim and the menu-row metrics
also survive, because each is a literal the plugin's own stylesheet declares rather than a value the
host or the harness contributes.

- [x] A 60px drag moves the sheet 60.0px both on a fresh sheet and **after a view re-render**. Was
      60.0px fresh and **0.0px** after a re-render, with the grab bar absent from the DOM.
      **Met.** `a fresh sheet follows the finger 1:1` — 60px drag on a just-opened sheet moved it
      60.0px. `a re-rendered sheet still follows the finger 1:1` — 60px drag after a re-render moved
      it 60.0px. `the grab bar survives a view re-render` — after one refresh the sheet's first
      child is `db-mobile-bottom-sheet-handle`; grab bar present=true.
- [ ] Both halves of the fix are shown necessary by reverting each on its own. With the chrome
      re-assert reverted: no bar, 0.0px. With the panel binding reverted: **bar present, still
      0.0px**. That third row is the important one — restoring the bar alone leaves the drag dead
      while making the sheet look repaired.
      **No check exists.** Neither `verify-placement.mjs` nor `probe/sheet-audit.mjs` carries an
      ablation arm; both measure the shipped tree only, so the necessity claim rests on prose.
      **The check:** on the record sheet at 390×844, open through `openRecordDetailPanel`, call
      `refreshRecordDetailPanel` once, then drive a 60px drag on the handle with real touch events
      through the browser's input pipeline — three times, over three trees. Tree 1, shipped. Tree 2,
      the chrome re-assert removed from the panel's `renderContent`. Tree 3, the re-assert kept and
      `attachSheetDragToDismiss` bound to the bar node captured at attach time instead of to the
      panel. Assert translateY 60.0 ±1px with the handle present, 0.0 ±1px with the handle absent,
      and 0.0 ±1px with the handle **present**. The third row is the whole claim: a run reporting
      only the first two has shown that the bar matters and nothing about the binding.
- [x] Header actions both 44×44 with centre lines 0.00px apart.
      **Met.** `expand and close are both 44x44 on the record sheet` — expand 44x44, close 44x44.
      `expand and close share one centre line` — centres differ by 0.00px (expand cy=666, close
      cy=666).
- [x] Row gap 0px, divider 1px at 40% alpha, value text 16px.
      **Met.** `no gap between rows` — measured gap between adjacent rows = 0px (row-gap token 0px).
      `a light divider separates each row` — border-bottom 1px color(srgb 0.2 0.2 0.2 / 0.4).
      `the row's value text is larger than the caption default` — value 16px, row height 44px.

      **Tick held; one number in it is the harness's own.** The 0px gap, the 1px width, the 40% alpha
      and the 16px are all declared outright in `styles.css` — `--db-border-subtle` is
      `color-mix(in srgb, var(--background-modifier-border) 40%, transparent)` at `:71`, applied at
      `:9481` — so they reproduce on any host. The **colour** does not: `srgb 0.2 0.2 0.2` is
      `#333333`, which `probe/sheet-audit.mjs:105` sets inline as `--background-modifier-border`. On
      a device the theme supplies it. Read the row as "1px at 40% of whatever the host's border
      colour is", which is what the stylesheet says and what the operator asked for; the specific
      grey is a reading of the harness.
- [ ] The keyboard inset moves the sheet's bottom 844 → 508 on an 844px screen, keeps its top on
      screen at y=275, and returns it to 844.
      **Measured, and the tick withdrawn.** `a declared keyboard height lifts the sheet clear of it`
      — `--keyboard-height:336px` moved the sheet's bottom edge 844 → 508 on an 844px screen
      (clearance 336px); lever var=336px. `lifting the sheet does not push its top off the screen` —
      top edge at y=275, max-height 423.6px. `the sheet returns to the floor when the keyboard
      closes` — bottom edge back at 844 of 844.

      **The harness writes the variable the defect would live in.** `probe/sheet-audit.mjs:349` calls
      `document.documentElement.style.setProperty("--keyboard-height", "336px")`, and **nothing in
      `src/` ever sets it** — the two source mentions are a comment and a read. So the three numbers
      prove the arithmetic *given* the variable and say nothing about whether it arrives. That is the
      whole open question here, and `acceptance-criteria.md` §3 already states it as inferred rather
      than confirmed; the tick contradicted its own document.

      **What is proven, and it is not nothing.** The lever moves the sheet, the direction is right,
      the magnitude is exact, and it reverses. `keyboardInset()` also takes
      `max(host variable, visual-viewport shrink)` behind a pinch-zoom guard, so the host variable is
      the *first* of two arms — but the probe exercises only that arm, because a headless page cannot
      shrink its own visual viewport, and the second arm is the one that would carry an iOS host that
      publishes nothing.

      **What would settle it:** the operator reporting which of three things happens when the
      keyboard opens (step 3 of `acceptance-criteria.md` §4). No harness in this repository contains
      a software keyboard, so nothing here can take this criterion.
- [ ] All 9 sheet-capable surfaces at the identical fill. **No before-number was ever recorded for
      this ask**, so what is evidenced is that they agree today, not that they used to disagree.
      **Measured, and the tick withdrawn.** `every sheet surface paints the same fill` — all 9
      surfaces measure color(srgb 0.95 0.95 0.95).

      **Both halves of that sentence come from the harness rather than the product.** The *value* is
      95% of a white the harness declares: `probe/sheet-audit.mjs:105` sets
      `--background-primary: #ffffff` inline on the body, and `styles.css:78` computes
      `--db-surface-overlay: color-mix(in srgb, var(--background-primary) 95%, black)`. On a device
      that variable comes from the theme, and 0.95/0.95/0.95 is not a number the product has. The
      *agreement* is read off nine bare `<div>`s built in one parent and handed one class:
      `styles.css:19996` declares `.db-mobile-bottom-sheet.db-mobile-bottom-sheet { background:
      var(--db-surface-overlay) }`, which every surface then resolves through, so the comparison
      re-reads one declaration nine times.

      **What survives: one rule declares the fill for all nine classes, and that is checked.** What
      is not measured is nine real surfaces agreeing *in situ* — each is built by its own renderer,
      in its own host, and a custom-property like `--background-primary` inherits from the nearest
      ancestor that sets it. Obsidian's own `app.css` is absent here, so a theme scoping that
      variable differently under a modal is exactly the shape this check cannot see, and it is how
      the ask arose in the first place.

      **What would settle it:** build the nine through their own entry points rather than as bare
      divs, and read the fill with the host stylesheet present — or step 4 of the operator list,
      swiping between a record sheet and a menu sheet and saying whether they match.
- [x] The scrim is `rgba(0,0,0,0.25)` and captures; a press 120px above the sheet resolves to it and
      a press on the band resolves to the grab handle.
      **Met.** `the scrim is a 25% black modal layer` — background rgba(0, 0, 0, 0.25),
      pointer-events auto. `the scrim blocks the app behind the sheet` — a press 120px above the
      sheet lands on `db-mobile-sheet-scrim`. `the scrim does not steal the grab band` — a press on
      the band lands on the grab handle; sheet z=1000, scrim z=999.
- [x] A `createMenuRow` row measures min-height 44px and padding 8px 16px identically in an
      owned-menu sheet and a panel sheet.
      **Met.** `a menu row lays out identically in any sheet` — owned-menu sheet: min-height 44px,
      padding 8px 16px 8px 16px, height 44px | panel sheet: min-height 44px, padding
      8px 16px 8px 16px, height 44px.

      **Tick held for the three properties it names, and it should not be read as more than that.**
      Those are declared literals in `styles.css`, measured on rows built by the shipped
      `createMenuRow`, so they hold wherever the plugin's stylesheet does. But this is the component
      whose one known device defect was invisible to checks of exactly this shape: Obsidian's
      `app.css` declares `button { justify-content: center }`, the menu row declared no
      `justify-content` of its own, and five checks passed for months while sheet buttons sat centred
      on device. Box metrics are not the whole of "proper reusable sheet menu item components". The
      harness now appends a partial reproduction of the host's `button` rule
      (`verify-placement.mjs:68`, `HOST_BARE_CONTROLS`), which closes that one hole and no other —
      it leaves `--input-height` and the `--size-4-*` scale undefined, so any property the host
      contributes through those still resolves differently here than on a device.
- [ ] The two open operator decisions are answered: the 13px row label, and whether the sheet should
      survive a window resize instead of closing.
      **Operator.** Both are measured, and both stand red by declaration in the captured run:
      `the row's label size is on the type scale` — label 13px, nearest scale steps 12px and 14px;
      `the sheet survives the window resize a keyboard causes` — one window resize closed the record
      sheet outright. The measuring is finished. Neither is a defect a check can close: one is a
      one-token type-scale decision, the other decides whether ask 4 is finished or blocked on the
      handset the operator holds.
- [ ] The operator opens a sheet, edits a field, drags down, and it follows their thumb.
      **Operator.** Step 2 of the five-step list in `acceptance-criteria.md` §4, and the case that
      was broken. The harness drives one clean synthetic finger through the real input pipeline;
      only a thumb on the device closes this.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**19 of 22 checks pass; the three that do not are each declared.** No stylesheet edit, so no capture
moves and no lane was taken.

### Two harness facts had to be established before any number here meant anything

Obsidian's real `setCssProps` is `style.setProperty`, which takes hyphenated names only; the repo's
shim assigns `style[name]`, which accepts camelCase. And nothing in this repository had ever driven
the gesture — `verify-placement.mjs` imports `applySheetChrome` and not `attachSheetDragToDismiss`.

### A theory measured and discarded rather than carried

The panel permanently carries a 120ms transform transition, which would produce exactly this symptom.
During the gesture the computed `transition-duration` is `0s` and a 60px move lands at 60.00px in the
same frame. The lag that looked real was the probe's own CDP round trip.

### The three declared, and what kind of thing each is

The row label measures 13px against a 12/14/16/18/20/24 scale — **a one-token operator decision**.
The record sheet **closes outright on a window resize**, which is one of the two ways a software
keyboard announces itself, so which handset the operator holds decides whether the keyboard ask is
finished or blocked. And `placeSheet` writes five camelCase declarations the phone discards;
correcting the names would activate `overscroll-behavior: contain` for the first time on every sheet,
which needs a recapture — **deferred with a reason, not forgotten.**

**One of the three has since closed, and the record has not caught up.** `placeSheet` writes
hyphenated names today — `box-sizing`, `overflow-y`, `overscroll-behavior`, `max-width`,
`max-height` at `src/views/popover-position.ts:336-350` — and the captured run measures them
arriving: `every declaration placeSheet writes reaches the sheet` and `every declaration the
positioner writes actually lands on the sheet` both pass, the second through a shim that now carries
the device's `setProperty` semantics, so a camelCase key there would read `(unset)`. The rename
happened; whether the screenshot capture was refreshed beside it is not visible from the harness.
`acceptance-criteria.md` §2 still lists this as an open declared failure and wants correcting.

### The grab band: closed, and the record is what needs correcting

The operator accepted 35px against a 48px ask. This phase measured the shipped band answering presses
over y=1..32 — **32px, full width at 386 of 390** — and derives it from the stylesheet's own
arithmetic. Four heights are now on record. All four clear WCAG 2.5.8's 24px AA target and fall short
of 2.5.5's 44px, which is exactly the trade-off that was accepted, so **none of them changes the
decision.**

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Report 1 root cause | Found, fixed, measured | 60.0px after a re-render, was 0.0px |
| Both halves necessary | Proven by two reverts | The bar-present-still-0.0px row |
| The other seven asks | Audited on the shipped build | 19 of 22 checks |
| Operator confirmation | Open | The five-step list is in `acceptance-criteria.md` §4 |

### Deviations and findings

| Item | Note |
|------|------|
| It worked unspecced for hours | This phase owned the most-reported defect in the program and had no `spec.md` and no `acceptance-criteria.md` at the start of the pass. Both arrived before it finished |
| Ask 6 has no before-number | Recorded rather than counted green |
<!-- /ANCHOR:log -->
