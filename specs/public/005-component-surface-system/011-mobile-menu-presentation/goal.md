---
title: "Goal: Mobile Menu Presentation"
description: "What would make phase 011 worth having done, and the criteria that decide it."
trigger_phrases:
  - "011 goal"
  - "mobile menu presentation goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/011-mobile-menu-presentation"
    last_updated_at: "2026-08-30T17:45:00Z"
    last_updated_by: "goal-authoring"
    recent_action: "Harness-dependency audit: 7 ticks hold; menu-sheet placement not re-run on keyboard"
    next_safe_action: "Subscribe owned-menu sheets to visualViewport, as the panel path already is"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "findings.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-011-goal"
      parent_session_id: null
    completion_pct: 66
    open_questions:
      - "The re-key moves add-view and calendar captures; design question, not a defect"
      - "Should the menu sheet's 44px band and the record sheet's 32px band be one constant"
      - "Does a menu sheet ever coexist with a keyboard, given showAt places it once and never again"
    answered_questions: []
---
# Goal: Mobile Menu Presentation

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** On a phone an owned menu presents the way the record sheet already does — docked to
the floor, full width, above the navigation bar, dismissible by the scrim and by dragging the handle
— and every sheet menu row is the same component in a different container.

Neither was true. The column menu opened as a desktop dropdown with its first row behind the status
bar and its last row past the bottom of the screen, and the "More tools" sheet centred its rows so
their left edges were ragged across 227px.

**The cause was a path, not a style.** Two mount-and-place paths exist and only one knows about
phones: panels call `positionToolbarPopover`, which takes the sheet branch; menus called
`createOwnedMenu().showAt({x, y})`, which calls `setPosition` directly and never consults a phone
predicate. Not a styling gap — a fork that was never wired.

### Decisions

| ID | Decision |
|----|----------|
| D1 | Before-numbers come from running the same harness against `HEAD` source in a **detached worktree** with the working tree's `styles.css` copied in, so only the code under test differs. A phase that measures its own tree twice has measured nothing. |
| D2 | Dismissal has exactly one owner. The backdrop is a rectangle, not a handler, so a press on it arrives where any other outside press arrives. |
| D3 | The gesture is driven by the browser's real pointer stream. A hand-made `PointerEvent` carries a pointerId the browser never issued, so a synthetic version measures the harness throwing. |
| D4 | The row grammar is keyed to the row, not to the owned menu's shell — doubled-class form, same specificity, nothing in-container moves. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

A ticked criterion carries the harness check that closed it and that check's measured number, quoted
from the single run captured against a clean tree at `f64dd87` — `verify-placement: 220/224 geometry
checks passed, 4 red for a declared reason`. An unticked criterion carries the check that would
settle it and **no number**, because none ran.

- [x] A phone menu docks to the floor: `|bottom − innerHeight| ≤ 1`. Was 876 against an 844 viewport.
      → *a phone menu docks to the bottom of the screen instead of opening at the point*: `menu
      bottom=844 viewport=844; opened at y=90 with 19 rows`.
- [x] A phone menu spans the full width. Was 220 against 390.
      → *a phone menu spans the full width instead of the menu's own 220-320px*: `width=390
      viewport=390 (the anchored menu is 220..320)`.
- [x] A 19-row menu is capped and **scrolls** rather than grows: height ≤ 0.9 × innerHeight,
      `top ≥ −1`, `scrollHeight > clientHeight`. Was 872 tall against a 760 cap, content 870 visible
      870 — it grew.
      → *a 19-row phone menu is capped at the sheet ceiling and scrolls inside it*: `height=760
      cap=760 top=84 content=898 visible=759 (unclamped these rows measure 836px, past a 844px
      screen)`. All three clauses: capped at the ceiling, `top=84`, and content 898 against a visible
      759 — it scrolls.
- [x] The backdrop takes the tap, read from `document.elementFromPoint` rather than from the element.
      An inert backdrop is present in the tree and absent from the hit test, and only the hit test is
      the behaviour.
      → *the backdrop over a menu sheet takes the tap rather than passing it to the table*:
      `backdrop=present pointer-events=auto; the document paints db-mobile-sheet-scrim above the
      sheet`. The second clause is the one that matters and it is the one measured: the reading is
      what the *document* resolves at the point, not what the element declares about itself.
- [x] The backdrop arrives with the menu **and** leaves with it. Asserting only the second passes
      trivially on a build that never draws one.
      → *the backdrop arrives with the menu and leaves with it*: `while open=true after close=false
      menu still mounted=false`. Both directions in one check, which is what closes the trivial pass.
- [ ] The handle dismisses past the shipped 96px threshold and springs back below it, and its hit
      band matches the record sheet's 32px. The band clause is owed.
      **Two clauses met.** → *dragging a menu sheet's handle down past the threshold dismisses it*:
      `dragged 140px (threshold 96): menu still mounted=false backdrop=gone`. → *a short drag on the
      handle springs back instead of dismissing*: `dragged 40px (threshold 96): menu still
      mounted=true backdrop=present`.
      **Finding — the band clause, as worded here, would fail a correct implementation.** The band is
      no longer unmeasured. *A menu sheet's grab band is a thumb-sized target and takes no row with
      it* reports `band 44px (14 above the bar + 29 below + the centre pixel; want >= 44), reaching
      120px sideways=true; the band ends 44px from the sheet's top edge and the first row starts at
      47px, 0 of 19 rows answered by the band`. The record sheet's own band measures 32px — *the grab
      band takes all the chrome above the header*: `band answers presses over y=1..32 of the sheet =
      32px`. 44 is not 32, so "matches the record sheet's 32px" is red on a menu sheet that correctly
      clears the 44px thumb floor `010` D3 cites. `acceptance-criteria.md` §AC-4 never said "matches":
      it asks for a band "at least as tall as the record sheet's own — measured 32px there", which
      44px satisfies. **The goal line is the defective artefact here, not the implementation** — the
      same shape `010` D5 names, and the second time this program has found it.
      **The check to build.** Restate the clause at AC-4's real threshold (menu-sheet band ≥
      record-sheet band, both read by walking `document.elementFromPoint` down the sheet's top edge
      until the hit stops being the handle), then add the check that is genuinely absent: assert both
      surfaces' bands against **one shared constant** rather than two independent literals, so that
      changing either surface's chrome either moves both or goes red. Pair it with a control that
      shrinks the menu sheet's band below the record sheet's and requires red.
- [x] Every sheet menu row is built by `createMenuRow` and lays out identically outside the owned
      menu's shell. Label left edges were `[25, 125, 252, 25]`, a 227px spread; and `[16, 101, 16]`,
      an 85px spread, in a panel sheet.
      → *rows in a sheet menu share one left edge, icon or no icon*: `label left edges=[45, 45, 45]
      spread=0px`. → *a shared menu row lays itself out in any sheet, not only inside the owned menu*:
      `display=flex text-align=left label left edges=[32, 32, 32] spread=0px`. → *a menu row lays out
      identically in any sheet*: `owned-menu sheet: min-height 44px, padding 8px 16px 8px 16px, height
      44px | panel sheet: min-height 44px, padding 8px 16px 8px 16px, height 44px` — identical box
      metrics across the two containers, which is the "outside the shell" half stated as a number.
      The control is folded into *utilities rows keep their container's row layout after moving to the
      shared component*: `a row that lost the class renders inline-block, centred`.
- [ ] **New, and open: a menu sheet is placed once and never re-placed.** `showAt` calls
      `placeSheet(el)` at `owned-menu.ts:173` and registers no reposition loop — `owned-menu.ts`
      contains no `visualViewport` listener, no `resize` listener and no `requestAnimationFrame` at
      all. The panel path has all three (`popover-position.ts:284-285`, scheduling `place()` which
      reaches `placeSheet` at `:201`), which is why `010` can argue its sheet lifts on a silent host.
      A menu sheet cannot make that argument: whatever `keyboardInset()` returned at open time is the
      number it keeps. Every ticked criterion above is measured on a sheet at rest, so none of them
      sees this and none of them is wrong — the gap is that no criterion covers the state at all.
      **Whether it matters is a real question rather than a rhetorical one**, and it is now in the
      frontmatter: menu rows are buttons, not text inputs, so a keyboard under an open menu needs
      some other surface to have raised it first. If the answer is that the state is reachable, the
      fix is one subscription; if it is not, the criterion closes as not-applicable with that reason
      recorded.
      **The check to build.** Open a menu sheet, drive one `--keyboard-height` open/close cycle
      through the same lever `010`'s checks use, and assert `--db-mobile-sheet-bottom` on the menu
      element tracks it — which today it will not. Pair it with the panel sheet under the identical
      cycle, requiring the two to agree, so the criterion states the invariant (*every sheet answers
      the keyboard the same way*) rather than one surface's behaviour.
- [x] Desktop opens at its point, ≤ 320px, no sheet class, no handle, no backdrop anywhere in the
      document.
      → *a desktop menu still opens at its point and is not a sheet*: `menu=[400,200] asked for
      [400,200] width=220 bottom=388 viewport=900; sheet class=false backdrop=absent position=fixed`.
      That covers the point, the 220 ≤ 320 width, the class and the backdrop. It does **not** report
      the handle, so that clause is settled by reading instead, and it is settled beyond doubt:
      `src/views/owned-menu.ts:167` gates `applySheetChrome(el, true, …)` behind
      `isMobileBottomSheet(doc)`, and `src/views/mobile-bottom-sheet.ts:60-68` is the only site in
      `src/` that *creates* a `.db-mobile-bottom-sheet-handle` — every other occurrence is a
      `querySelector`. The desktop branch cannot reach the only creator, and `applySheetChrome`
      removes an existing handle when `isSheet` is false. No handle can exist there.
- [ ] The five stateful dimensions are covered.
      **No check exists, and no mapping exists either.** This phase's `acceptance-criteria.md` never
      names the five dimensions, so not one of its fourteen ACs is assigned to one — unlike `002`,
      `005` and `008`, whose acceptance documents carry the mapping. Action outcome is incidentally
      evidenced (*the backdrop arrives with the menu and leaves with it*: `while open=true after
      close=false menu still mounted=false`); the other four are not. This phase also registers **no
      standalone negative control at all**: the only one it has is folded into the detail line of
      *utilities rows keep their container's row layout after moving to the shared component* as `a
      row that lost the class renders inline-block, centred`, which is not separately reported and so
      cannot go red on its own.
      **The check to build.** First the mapping, in `acceptance-criteria.md`: a criterion → dimension
      table covering all five. Then the three with no measurement on this surface. *Semantic
      identity*: open the column menu on a named column, re-render the header so its nodes are
      rebuilt, and assert the menu's rows still act on the original column key rather than on
      whichever column now occupies that coordinate. *Resource ownership*: open and dismiss a menu
      sheet ten times, then assert exactly one `.db-mobile-sheet-scrim` in the document while open,
      zero after the last close, and zero surviving capture-phase `pointerdown` listeners — dismissal
      has one owner by D2, and a leaked listener is a second one. *Negative-control mutation*: promote
      the folded control to its own reported line and add one per presentation clause — remove the
      `isMobileBottomSheet` branch in `showAt` and require the dock, width and cap checks to go red
      together, which also proves those three are reading the fork and not the stylesheet.
- [ ] The operator opens the column menu on their phone and gets a sheet, and every sheet's rows
      start on one edge.
      **Operator criterion. Stays open regardless of the numbers, per D3.** No harness check can close
      it. The icon defect in the log is the reason to keep it open rather than infer it: `Display
      width` drew no glyph on a real host and the harness could not see it, because the harness's icon
      stub draws a placeholder for any id at all.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**7 of 10 criteria closed against the captured `f64dd87` run; not operator-confirmed. The owed band
clause is now measured at 44px and that measurement contradicts the clause rather than closing it.**

### The re-key's blast radius is measured, not assumed

Keying the row grammar to the row rather than to the owned menu's shell changes computed layout for
**14 of 17** menu-row shapes on desktop and **15 of 17** on a phone. `npm run replay` holds all 8
recorded results; 15 of 204 captures moved against a **measured churn floor of 7**, and the eight
beyond the floor are concentrated in `add-view-popover` (4/4) and `calendar-month-view` (4/4), both
of which render a `db-menu-item` row. That is a measurement carrying an open design question, not a
defect.

### One icon id the host does not ship

`Display width` asked for `arrows-left-right`, which occurs **0** times in the installed host bundle
against **5** for `arrow-left-right`. It was the only `arrows-`-prefixed id in `src/` against twelve
singular siblings. The row therefore drew no glyph, and with no glyph its label sat left of every
sibling's — the report's "Display width carries no icon and floats". Not observable in the harness,
whose icon stub draws a placeholder for any id at all; verified against the bundle instead.

### Harness-dependency classification, 2026-08-31

Every criterion re-asked as: *if this value came from the device instead of the harness, would the
check still pass — and could it still fail?* This phase's exposure was expected to be its computed
style, read with Obsidian's `app.css` absent. It is markedly lower than expected, and the reason is
worth recording rather than assuming.

| Criterion | Class | Rests on |
|---|---|---|
| Menu docks to the floor, 844/844 | SOUND | `bottom: var(--db-mobile-sheet-bottom, 0px) !important` at `styles.css:185`, written by `placeSheet` |
| Full width 390/390 | SOUND | `left`, `right`, `width`, `max-width`, all `!important` on the plugin's own sheet class |
| 19 rows capped at 760, content 898 | SOUND | the cap is `calc(90svh - …) !important` (`:198`); the content floor is `min-height: 44px` (`:461`) |
| Backdrop takes the tap | SOUND | scrim `inset: 0`, `pointer-events: auto`, `z-index: calc(var(--db-layer-modal, 1000) - 1)` — and `--db-layer-modal: 1000` is declared at `styles.css:87`, not pinned by `runtime-vars.css` |
| Backdrop arrives and leaves | SOUND | node presence in both directions; no computed style involved |
| Grab band | open already | unchanged — the goal line is the defective artefact, per the entry above |
| Row grammar, spread 0px | SOUND — **and this is the repaired instance** | see below |
| Desktop opens at its point | SOUND | position and width are the plugin's; the handle clause is settled by reading, as recorded |
| Menu sheet re-placement | **UNKNOWN — no check, new** | `owned-menu.ts` registers no reposition loop at all |

**The row-grammar criterion is the one the harness inventory says should have failed, and it no
longer can.** The inventory's fifth item records that `app.css` declares `button {
justify-content: center }`, that the plugin's menu row never declared `justify-content`, and that
five checks passed for months while sheet buttons were centred on device. A menu row *is* a
`<button>` (`menu-row.ts:92`), so this criterion sat directly on that defect. The plugin now declares
it: `justify-content: flex-start` at `styles.css:530`, in a rule whose comment names the host
declaration, the type-selector specificity that let it through, and why the two chevron rows escaped.
The same repair was made for the fill — `background: transparent` at `styles.css:453`, keyed to the
row rather than to the owned menu, because "a host stylesheet gives every bare button a fill".

So the tick stands, and it stands for a reason that can be pointed at rather than assumed. Every
property this criterion measures — `display`, `gap`, `align-items`, `justify-content`, `width`,
`padding`, `font-size`, `text-align`, `min-height` — is named by the plugin's own rule, and a
declared property outranks the host's type selector.

**Where it is still thin.** The rule does *not* name `line-height`, `font-family` or `color` (the
last is declared only inside `.db-owned-menu`, `styles.css:444`). No ticked clause measures those, so
nothing here is withdrawn — but "a shared row is only shared down to the last property it actually
states", as `styles.css:526` puts it, and that list is the current edge.

**A supply the inventory does not list: fallback readings.** The phone padding measured as
`8px 16px` is `var(--size-4-2, 8px) var(--size-4-4, 16px)` (`styles.css:462`). `--size-4-2` and
`--size-4-4` are **Obsidian's** tokens, absent with `app.css`, so every run takes the fallback. The
*relative* clause — identical box metrics in a menu sheet and a panel sheet — is unaffected, since
both sides take the same fallback either way. The *absolute* figures quoted above are fallback
values, not device values. They are very likely right, because Obsidian's scale puts `--size-4-N` at
`N × 4px` and the fallbacks were written to match, but they are corroborated rather than measured.
This applies to every `var(host-token, fallback)` reading in the packet and is worth carrying to
`000` as an inventory addition.

---

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phone sheet presentation | Shipped, verified | Docks 844/844, spans 390/390, capped 760 with content 898 |
| Dismissal ownership | Shipped, verified | Dismiss at 140px, spring back at 40px, against a 96px threshold |
| Shared row component | Shipped, verified | Spread 0px in both containers; identical 44px/8px 16px box metrics |
| Handle hit band | **Measured, and the criterion is wrong** | Band is 44px against a record sheet's 32px; AC-4 asks ≥, the goal line says "matches" |
| Five stateful dimensions | **Claimed, unmapped** | No dimension mapping in `acceptance-criteria.md`; no standalone control on this surface |
| Gate | Not re-run | The captured run is `verify-placement` alone; a shared-gate number against a four-writer tree describes no tree |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| The green gate is a reading of one moment | Three phases wrote to this tree during the work and the CSS lane changed hands twice. What is durable is the attribution: no capture cites any `src/` file this phase touched |
| The owed band clause resolved backwards | It was owed because nobody had measured it. Measuring it did not close it — it showed the threshold was the wrong one. A clause that demands parity at 32px forbids the 44px thumb floor the rest of the program asserts, so meeting it would have been the regression |
| Desktop has no handle for a structural reason, not a measured one | The desktop check never reports the handle. `owned-menu.ts:167` is what settles it: `applySheetChrome` is the sole creator of the handle and the desktop branch never calls it. Worth keeping as a reading, because a check here would only ever confirm an unreachable branch |
<!-- /ANCHOR:log -->
