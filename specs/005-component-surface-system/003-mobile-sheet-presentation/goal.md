---
title: "Goal: Mobile Sheet Presentation"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "003 goal"
  - "mobile sheet presentation goal"
  - "mobile sheet presentation directive"
  - "packet goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/003-mobile-sheet-presentation"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Backfilled the house goal shape; criteria and evidence untouched"
    next_safe_action: "Operator opens a sheet on their phone and it covers the nav bar"
    blockers:
      - "Operator device confirmation is the only row left"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "sheet-and-dropdown-inventory.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-003-goal"
      parent_session_id: null
    completion_pct: 88
    open_questions: []
    answered_questions: []
---
# Goal: Mobile Sheet Presentation

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Sheets on the phone overlay Obsidian's own bottom navigation bar, through a portal and a lease rather than through a number.

Repo `~/MEGA/Development/Obsidian Plugin`. **Runs sixth.** The riskiest change in the program — it moves surfaces to a different place in the document. Takes the `styles.css` lane at Phase 4, releases it at Phase 6.

**THE HEADLINE, IN THE OPERATOR'S WORDS.** Sheets must **overlay Obsidian's native bottom navigation bar**. Today they start above it, which they call extremely bad UX. This is the requirement the phase is judged on.

**IT IS A PORTAL, NOT A Z-INDEX.** Hit test: a sheet inside `.note-database-container` at `z-index: 9999` — `elementFromPoint` over the navbar returns `DIV.mobile-navbar`. The same node cloned to `document.body` returns the sheet. **No number fixes this.** And portalling strips the design tokens, which is why this phase is hard-coupled to `000`'s token boundary.

### Decisions

Frozen choices. Changing one is an amendment. Each is a restatement of this phase's own
directive above, not a new commitment.

| ID | Decision |
|----|----------|
| D1 | Sheets **overlay** the host's bottom navigation bar. Today they start above it, which the operator calls extremely bad UX, and that is the requirement this phase is judged on. |
| D2 | It is a portal, not a z-index: a sheet inside `.note-database-container` loses the hit test at 9999 and wins it cloned to `document.body`. **No number fixes this.** Portalling strips the design tokens, which is what hard-couples this phase to `000`'s token boundary. |
| D3 | Delete the `is-phone` bounds branch rather than adjusting it — but measure the blast radius first, because every anchored popover shares it, not only sheets. |
| D4 | A sheet must survive its anchor being destroyed, through `000`'s logical `AnchorRef` lease: resolve by identity at each renderer commit, hold a bounded pending state, then close or fall back. Never retain the last rectangle indefinitely. |
| D5 | The lane is taken at Phase 4 and released at Phase 6, after a full recapture **with a navbar present** — a condition no capture had ever had — a named human sign-off, `008`'s replay re-asserting `000`, `004`, `005`, `001` and `002`, and cascade re-confirmation. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../architecture-findings.md`, `../design-system.md`, `../adversarial-review.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**LANE.** Take at Phase 4, release at Phase 6, and only after all four in order: (1) full recapture **with a navbar present** — a condition no capture has ever had — `screenshots:verify` exit 0; (2) a **named human** opening every changed PNG and signing off in `checklist.md`. This matters more here than anywhere: `runtime-vars.css:43` pinned `--db-mobile-sheet-bottom` to `0px` for every capture ever taken, so no existing capture could have shown this defect and the reviewer has no prior image to compare against; (3) **`008`'s early replay re-asserting `000`, `004`, `005`, `001` and `002`** — you are moving surfaces to a different place in the document, which changes stacking and containment for everything mounted near them; (4) cascade re-confirmation for every duplicated selector you touched.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

**ACCEPTANCE.**

*Written as a checklist on 2026-09-01. It was prose, so this packet's figure was `0/0` — no
denominator at all, which reads as finished rather than as unmeasured. Nothing is ticked that this
folder does not carry evidence for, and the harness-dependence audit below is why several rows that
have a number are still open.*

- [x] `elementFromPoint(centreX, navbarCentreY)` returns the sheet. **Today: returns
      `.mobile-navbar` even at 9999.**
      **The audit's objection was right about the harness, and it is now answered by removing the
      invention rather than by arguing with it.** The div being hit-tested carried `height: 72px` and
      `z-index: 100`, neither of which the host declares. Read out of the installed application
      stylesheet, `.mobile-navbar` is `position: fixed`, `height: 80px`, full width, and **carries no
      z-index at all**. The harness had invented a stacking context, and every check reading through
      it inherited the invention.

      **With the host's own rule in the page, a press at the navbar's centre lands on the sheet** —
      `div.db-record-detail-panel…db-mobile-bottom-sheet`, navbar at `z-index auto`, sheet at 1000.
      Hit-tested rather than compared by declared layer, because what a thumb reaches is what
      `elementFromPoint` returns, and a sheet that declares a higher number while something else
      takes the press is the defect this row is about.

      **The recorded "even at 9999" was the harness stacking the navbar, not the sheet losing.**
      Restoring 9999 is the control, and this row was **observed red** under it: the press lands on
      `div.mobile-navbar`. The failing value is that one — the whole check reports the element a
      thumb reaches, so the value it moved from is `div.mobile-navbar` and the value it moved to is
      the sheet.
      Restoring only the old invented `z-index: 100` does **not** fail it, because 1000 beats 100 —
      that control ran first, did not discriminate, and is recorded because it is the one a reader
      would reach for. Modelling the real navbar also moved this packet's own gate number: bounds
      end at **730** rather than 810 and the removal delta is **30px** rather than 50px, so the
      repair is visible in a figure the phase already asserts.
- [x] Sheet bottom equals viewport bottom, offset 0px, for **both** mechanisms. **Today 49px vs
      0px.** **Met on both** — the panel path and the menu path are asserted in one check that
      compares them against each other, so a surface that docks correctly alone cannot pass while
      its sibling does not.
- [x] After a field commit: node identity unchanged, top edge moved 0px, and a later resize still
      repositions. **Today repositioning is dead after the first commit.** **Met** — the rebuild is
      driven through the real renderer and the drag survives it, which is what `016` root-caused and
      `031` made unrepresentable by construction.
- [x] With `visualViewport` reduced for the keyboard, the focused field stays visible. **Met on both
      arms** — the host variable and the visual-viewport shrink, the second driven with the host
      silent, and both families of sheet now answer one keyboard identically.
- [x] Scrim covers the full viewport including the navbar band. **Same exposure as the first row,
      and it lifts with it.** Measured against the host's own navbar rule rather than the harness's
      div: the scrim boxes **0,0 390x844** against a 390x844 viewport, covering the navbar band
      rather than stopping above it. A scrim short of the navbar leaves a live strip of the
      application under a surface that is supposed to be modal.
- [x] Removing the navbar from the harness moves an asserted number. **Run 2026-09-01, and it is
      this packet's own gate rather than one of its tasks.** `plan.md` Phase 1 says it plainly:
      *"Until removing the navbar from the harness moves an asserted number by more than the 1.35px
      fallback artefact, no later claim in this spec means anything."*
      → *removing the navbar from the harness moves an asserted number*: `the harness navbar measures
      72px; the visible bounds end at 738 with it and 760 without, a move of 22px against the 1.35px
      fallback artefact the gate names` — sixteen times the artefact, and restored afterwards,
      because a gate that leaves the page in a different state has broken every check after it.
      **2026-09-02: those three figures are the reading taken before the navbar was remodelled, and
      are kept as history rather than as the current number.** The harness now declares the host's
      own `--navbar-height: 80px` (`verify-placement.mjs:519`), and the row above records the
      re-measured pair for the same page — bounds ending at 730 and a removal delta of 30px against
      the positioner's 50px fallback. The detail string is composed at run time and no artefact on
      disk stores it, so the current pair is read from this packet's own gate rather than quoted
      from a stored run. The tick is unaffected: the check passes on `navbarHeight > 0` and a move
      over 1.35px, and 30px clears that by the same margin 22px did.
      **The sign is the one intuition gets backwards.** Removing the navbar does not hand the surface
      the screen: `getVisiblePopoverBounds` falls back to a hardcoded 50px of guessed chrome instead
      of 72px of measured chrome. A check written against "no navbar means no inset" would pass on a
      positioner that ignored the element entirely.
      **Watched failing** with the positioner's `navbarHeight` pinned to the fallback: `a move of
      0px`.
      **Kept alongside the check that transcribes the arithmetic, deliberately.** Its neighbour
      asserts `bounds.bottom === viewport - navbar - inset`, and this packet's plan says a later
      phase deletes that subtraction outright so the sheet COVERS the navbar. On that day the
      transcription reddens for an intended change and the obvious repair is to copy the new formula
      across — after which it stops discriminating. The ablation asks only whether the element is
      read, which is the right question on both sides of that change.
- [x] Plus the five stateful dimensions. **No mapping exists** for this packet. **Mapped 2026-09-01**,
      in `acceptance-criteria.md` §2b, and **action outcome was the bare one.**
      **Everything previously measured about the backdrop established that it can RECEIVE a press** —
      it arrives with the sheet, leaves with it, is modal by default, and takes a press aimed at a
      cell. None of it established that receiving one does anything. **A backdrop that swallows
      every tap and dismisses nothing is the freeze this program opened for**, and it passes every
      one of those checks.
      → *a press on the backdrop dismisses the sheet and takes the backdrop with it*: `sheet still
      mounted after the press=false, backdrop still present=false`. **Red with the outside handler
      removed: both `true`** — the dimmed, tap-swallowing surface exactly.
      **The press goes where a thumb reaching past the sheet lands** — above the sheet's top edge,
      not at the backdrop's centre, which would land on the sheet and measure a different gesture.
      **One observation is recorded rather than asserted.** With two owned menus open, one press
      closes **both** — `top dismissed=true, beneath survived=false`. That follows from the
      factory's design: `createOwnedMenu` adds a capturing `pointerdown` per menu and treats any
      press outside ITSELF as dismissal, which its own comment states. Whether the plugin ever
      stacks two independent owned menus is **not established** — a submenu portals a
      `db-column-menu-subpopover` instead — so the check asserts the decidable mechanism (`1
      handler with one menu open, 2 with two`) and the consequence is a question with its number,
      not a defect nobody has shown a reader can reach.
- [ ] The operator opens a sheet on their phone and it covers the nav bar. **Only the operator
      closes this.**
**HARNESS DEPENDENCE, 2026-08-31 — 9 sound / 5 dependent / 0 unknown.** The headline bullet is one of
the five. *"`elementFromPoint(centreX, navbarCentreY)` returns the sheet"* is measured against a
hand-written `<div class="mobile-navbar" ... height:72px>` (`verify-placement.mjs:409`; the markup is
now at `:540` and its rule at `:519`) with no
`app.css` rule, no stacking context and no z-index — a stand-in for the element the operator's defect
is about, which a body portal beats almost by default. The scrim bullet and the every-popover
deletion bullet inherit the same stand-in, and the keyboard bullet is answered by an instrument that
**injects `--keyboard-height`** rather than driving `visualViewport`, which is the fragile half of
`keyboardInset()`. **Sound:** the anchor lease, the two-mechanism offset agreement, the transition
trace, and the host-isolation read — that last one is a differential on one document, so the missing
stylesheet cancels out of both sides. `--db-mobile-sheet-bottom` is no longer pinned, so that supply
is spent.
**2026-09-02 — three more of those five are spent, and the count above is left standing as the reading
of 2026-08-31 rather than restated.** The hand-written div is gone: `verify-placement.mjs:519`
declares `.mobile-navbar` from the installed application stylesheet — `position: fixed`,
`height: 80px`, full width, **no z-index at all** — so the headline hit test and the scrim bullet no
longer read an invented stacking context, which is what the first and fifth rows above record. The
keyboard bullet has gained a second arm that shrinks `visualViewport.height` and dispatches its
`resize` with `--keyboard-height` unset (`:1029-1085`), so it is no longer answered only by writing
the host's variable. What is **not** spent is the every-popover deletion bullet: that is
`acceptance-criteria.md`'s AC-007 and it is not a row in this checklist. Rows in
`acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

**LINE NUMBERS ARE HINTS, NOT ADDRESSES.** Every `styles.css:NNNN` and `src/**/*.ts:NNNN` below was correct on 2026-08-29; three phases edit `styles.css` before you start. `acceptance-criteria.md` carries the resolution table — symbol plus the `rg` command. When the command and the number disagree, the command is right. Record moved numbers old to new.

**DELETE, DON'T ADJUST.** `getVisiblePopoverBounds` has an `is-phone` branch that **subtracts** navbar height and safe-area inset from the bottom bound. It exists to avoid the navbar; the operator wants to cover it. **But it is shared by every anchored popover, not just sheets** — measure that blast radius before the deletion, not after.

**TWO MECHANISMS, TWO BEHAVIOURS.** `--db-mobile-sheet-bottom` is written only by `positionToolbarPopover:115`, in the anchored branch. **`applySheetChrome` never writes it.** That is the mechanical cause of "49px anchored, 0px modal". And two independently-thresholded phone predicates disagree — `isTouchDevice()` at 760px drives `DbModal` sheets, `isMobileBottomSheet()` at 600px drives positioner sheets, and the latter is **module-private**, so no caller can even ask how it will present. `Platform.isPhone` is used zero times.

**THE GLITCH, TRACED.** `updateCellDOM` (`database-view.ts:8597-8620`) has surgical cases for table, board, gallery and list. **Calendar, timeline and chart fall through to `default: this.refresh()`** (`:8615-8616`), rebuilding the view wholesale. The sheet's node survives; **its `anchorEl` does not**. From the first field commit onward `anchorEl.isConnected` is false and `place()` no-ops **permanently** — including for the keyboard on the next field.

**ANCHOR LIFETIME IS NON-NEGOTIABLE.** A sheet must survive its anchor being destroyed. Use `000`'s logical `AnchorRef` lease — resolve by identity at each renderer commit, hold a bounded pending state, then close or fall back. **Never retain the last rectangle indefinitely**: an actionable-looking surface detached from its target is worse than a closed one.

**THERE IS NO SCRIM AT ALL.** `applySheetChrome` handles only the sheet class and grab handle. The plugin's sole backdrop anywhere is for the column-width drag. A scrim is **new construction**, not a fix.

**CENSUS AT RUNTIME.** Static grep misses the modals. Open every sheet-capable surface on a phone profile — positioner sheets, all 20 `DbModal` subclasses (18 explicit, 2 inheriting the default, one anonymous class at `settings.ts:601`), and the 3 `FuzzySuggestModal` classes that bypass presentation entirely — and record portal parent, computed bottom, rect, and **whether node and anchor survive a field commit**.

**THREE CRITERIA WERE REWRITTEN.** AC-007 closed on the `is-phone` branch being *deleted*; AC-008 on both predicates reaching *zero callers*; AC-009 on an *inventory* being complete. A deletion, a call count and a classification — none is an outcome, and the doctrine bans call counts outright. They now close on measurements: **every anchored popover inside the visual viewport and clear of the navbar across the deletion** (the branch is shared, so measure the blast radius before you cut, not after); **the modal and anchored paths returning an identical presentation at all six widths of the 601-760px band**; and **0 surfaces whose measured presentation differs from its declared role.**

**EIGHT CRITERIA HAVE NO FAILING NUMBER YET.** AC-007 to AC-014 are `Blocked`, not `Unmet`. `acceptance-criteria.md` names what produces each number and at which phase. **Do not invent one.** Two of them gate irreversible work: **Phase 4 may not delete the shared `is-phone` bounds branch until every affected popover has a recorded *before* bound**, and **Phase 3 may not collapse the predicates until the band has been swept at 600, 620, 660, 700, 720 and 760.**
<!-- /ANCHOR:log -->
