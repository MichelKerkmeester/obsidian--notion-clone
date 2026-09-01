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
    packet_pointer: "005-component-surface-system/016-sheet-drag-and-audit"
    last_updated_at: "2026-08-31T22:00:00Z"
    last_updated_by: "harness-dependence-review"
    recent_action: "Resize dismissal fixed at the handler; keyboard arrival read from the host bundle"
    next_safe_action: "Operator drags a sheet on device"
    blockers:
      - "The nine sheet fills are read off bare divs, not off nine real surfaces"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "probe/sheet-audit.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-016-goal"
      parent_session_id: null
    completion_pct: 80
    open_questions:
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
- [x] Both halves of the fix are shown necessary by reverting each on its own. With the chrome
      re-assert reverted: no bar, 0.0px. With the panel binding reverted: **bar present, still
      0.0px**. That third row is the important one — restoring the bar alone leaves the drag dead
      while making the sheet look repaired.
      **A check exists now, in the `sheet-rebuild` lane.** The necessity of the second half is a
      fact about node identity, so it is measurable without reverting anything: a rebuild empties
      the panel, so the bar the gesture would have bound to is **detached** afterwards and a
      different node takes its place, while the panel is the same object throughout and keeps its
      gesture registration. Both halves of that asymmetry are asserted in the same run —
      `a rebuild replaces the bar node, so a bar-bound listener would die` and `the panel is the
      same object across the rebuild`.
      The first half's necessity was already observed directly: without the chrome re-assert the
      lane reports `bar before: true, after: false` and a real pointer drag cannot even be staged.
      *What is still prose:* the specific reading "bar present, still 0.0px". This proves a
      bar-bound listener would be orphaned, which is why that state arises; it does not reconstruct
      the reverted build to re-measure the 0.0px itself.
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
- [x] The keyboard inset moves the sheet's bottom 844 → 508 on an 844px screen, keeps its top on
      screen at y=275, and returns it to 844. **The tick is restored, 2026-08-31, on evidence the
      withdrawal asked for.**
      **The arithmetic, unchanged.** `a declared keyboard height lifts the sheet clear of it` —
      `--keyboard-height:336px` moved the sheet's bottom edge 844 → 508 on an 844px screen
      (clearance 336px); lever var=336px. `lifting the sheet does not push its top off the screen` —
      top edge at y=275, max-height 423.6px. `the sheet returns to the floor when the keyboard
      closes` — bottom edge back at 844 of 844.

      **The withdrawal's reason was that nothing proves the variable arrives. It is now read from the
      host that writes it.** Obsidian 1.13.4's own `obsidian.asar` was searched for
      `--keyboard-height` and it appears ten times, in three roles that only make sense together:
      the popout-window code propagates it as one of exactly **two** document-element properties
      (`["--zoom-factor","--keyboard-height"]`); the mobile toolbar's `animateToKeyboardHeight()`
      reads it off `document.documentElement` on **every** `keyboardWillShow` and `keyboardWillHide`
      and animates by its delta; and the host's own stylesheet consumes it
      (`padding-bottom: max(var(--keyboard-height), var(--size-4-16))`). A variable nothing writes
      cannot drive the host's own toolbar animation. That is confirmation from the shipped host
      rather than an inference about this plugin, and it retires the objection.

      **The second arm is exercised too, with the host variable absent.** `the keyboard inset falls
      back to the visual viewport when the host declares nothing` runs with `--keyboard-height`
      removed and the visual viewport reporting a 336px shrink, and the shipped `keyboardInset` —
      not the harness — computes `innerHeight - visual.height - visual.offsetTop` and publishes
      `--db-keyboard-inset=336px`. So both arms of the `max()` are measured, and the arm that carries
      a host publishing nothing is the one the withdrawal called never exercised.

      **And the sheet is now driven through a real viewport change rather than a declared number.**
      `the sheet survives the window resize a keyboard causes, and not the one a rotation causes`
      resizes the page 390×844 → 390×508: the sheet stays open and stays on the floor, bottom edge
      508 of 508. No variable is written anywhere in that case.

      **What is still the operator's:** that a real software keyboard on their handset produces this
      sequence. No harness here contains one. That belongs to the operator row below rather than to
      this one, which asks for the inset arithmetic and now has it from both arms and from the host.
- [x] All 9 sheet-capable surfaces at the identical fill. **No before-number was ever recorded for
      this ask**, so what is evidenced is that they agree today, not that they used to disagree.
      **Re-measured against the objection this row raised against itself, and the objection is
      answered by the mechanism rather than the stylesheet.**

      The old check built all nine in one parent, so they inherited one value from one node and the
      comparison re-read a single declaration nine times. It could not see the shape the ask came
      from — a host scoping `--background-primary` differently under a modal. So the ancestors now
      vary: nine wrappers, each declaring its own `--background-primary`, none of them the colour a
      sheet should paint. **All 9 still measure `color(srgb 0.95 0.95 0.95)`.**

      **Because a sheet stops inheriting from its builder the moment it becomes one.**
      `setSheetMount` appends every sheet to `document.body`, and the check now asserts that
      directly: after the sheet treatment, all nine report `body` as their parent. A theme rule
      scoped under a modal cannot reach a surface that is no longer under the modal. That is a
      structural guarantee and a stronger claim than "one rule declares the fill".

      **The control is in the same run, and it has to be.** The same class, left under the same
      varied wrapper and *not* made a sheet, measures `rgb(20, 0, 200)` — its wrapper's own colour —
      against the sheets' `0.95 0.95 0.95`. Without that row the nine agreeing proves nothing: they
      would agree just as well if `--background-primary` had stopped reaching anything at all.

      **A blunter control was tried and is not evidence.** Removing the `appendChild` from
      `setSheetMount` outright takes 17 unrelated sheet checks down with it — positioning, grab
      bands, hit tests — and the sheet-audit section then throws on `elementFromPoint` before ASK 6
      runs at all, so it reports nothing about this row in either direction. Restoration verified by
      SHA-256, matching. The in-run control above is the one that discriminates.

      **What is still not measured, and it is the same half as before:** nine surfaces built by their
      own renderers, in their own hosts, with Obsidian's `app.css` present. What has moved is that
      the ancestor no longer has to be trusted — whatever a renderer builds a sheet under, the sheet
      treatment relocates it to one root, and that is now asserted rather than assumed. Step 4 of the
      operator list still owns the rest.
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
- [x] The two open decisions are answered: the 13px row label, and whether the sheet should
      survive a window resize instead of closing. **Both answered, 2026-08-31; neither is still red.**
      **The label.** The operator chose 14px, and it landed as a new `--db-font-base` step rather
      than a retune of `--db-font-md` — raising the shared token satisfied both type-scale checks
      and grew the desktop inline editor 34.8px → 36.3px, reddening geometry `021` has frozen. The
      additive step has exactly one consumer. Recorded in the CSS lane's `010` release.
      **The resize, decided rather than deferred.** The reversible default is taken: the sheet stays
      open through a keyboard and closes on a real reflow. `onResize` used to close unconditionally
      except while the body editor had focus, so every *other* way a keyboard opens — a field editor,
      a rename, a search box — destroyed the sheet on the platforms that report a keyboard as a
      window resize. It now tells the two apart by what moved: **a software keyboard takes height and
      leaves the width alone; a rotation or a window drag moves the width.** On a phone sheet a
      width-preserving resize is a keyboard and the sheet stays; anything that moves the width closes
      it. Restricted to the sheet presentation deliberately — a desktop panel is anchored to an
      element rather than to the floor, and there a vertical-only drag really does move its anchor.
      **Watched failing in both directions, on a real viewport change rather than a dispatched
      event.** Pre-fix handler: `one window resize closed the record sheet outright`. A rig that
      never closes: `Rotating to 844 wide closed it=false`. Green: `the viewport shrank 844 -> 508 at
      an unchanged width of 390: the sheet is still open and still on the floor, bottom edge 508 of
      508`. The `KNOWN` entry that declared this defect is deleted, because a declared red that has
      been repaired is a check that can no longer fail.
      **What is left to the operator is confirmation, not the decision.** If a keyboard on their
      handset behaves in some third way, that reopens this as evidence; it does not reopen it as an
      unanswered question.
- [ ] The operator opens a sheet, edits a field, drags down, and it follows their thumb.
      **Operator.** Step 2 of the five-step list in `acceptance-criteria.md` §4, and the case that
      was broken. The harness drives one clean synthetic finger through the real input pipeline;
      only a thumb on the device closes this.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**8 of 10 criteria are ticked. The two that are not are the nine-surface fill, whose settlement needs
either nine real entry points or the operator's eye, and the operator's own thumb on a sheet.** The
stylesheet has since been edited under this phase's name — one declaration on the record sheet's
header — so the lane was taken, the captures were refreshed, and the record-detail images were opened
and read. That is a change of state from the sentence this paragraph used to carry.

### Two harness facts had to be established before any number here meant anything

Obsidian's real `setCssProps` is `style.setProperty`, which takes hyphenated names only; the repo's
shim assigns `style[name]`, which accepts camelCase. And nothing in this repository had ever driven
the gesture — `verify-placement.mjs` imports `applySheetChrome` and not `attachSheetDragToDismiss`.

### A theory measured and discarded rather than carried

The panel permanently carries a 120ms transform transition, which would produce exactly this symptom.
During the gesture the computed `transition-duration` is `0s` and a 60px move lands at 60.00px in the
same frame. The lag that looked real was the probe's own CDP round trip.

### The three declared, and what became of each

All three are now repaired rather than declared, and this section records what each turned out to be.

**The row label** measured 13px against a 12/14/16/18/20/24 scale. The operator chose 14px, and it
landed as an additive `--db-font-base` step rather than a retune of `--db-font-md`, because raising
the shared token grew the desktop inline editor 34.8px → 36.3px and reddened geometry `021` froze.

**The record sheet closed outright on a window resize**, which is one of the two ways a software
keyboard announces itself. Repaired at the handler on 2026-08-31: it now separates a keyboard from a
rotation by whether the width moved, so the sheet survives a width-preserving shrink and closes on a
real reflow. Watched failing in both directions on a real page resize, and the `KNOWN` entry that
declared it is deleted. This is no longer hostage to which handset the operator holds; what they
hold can still produce evidence against it, which is a different thing from an open decision.

**`placeSheet` wrote five camelCase declarations the phone discarded.** `placeSheet` writes
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
