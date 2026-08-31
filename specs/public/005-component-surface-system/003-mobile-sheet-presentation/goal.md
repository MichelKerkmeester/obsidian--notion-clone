**Phase 003 — Mobile sheet presentation**

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
Repo `~/MEGA/Development/Obsidian Plugin`. **Runs sixth.** The riskiest change in the program — it moves surfaces to a different place in the document. Takes the `styles.css` lane at Phase 4, releases it at Phase 6.

**THE HEADLINE, IN THE OPERATOR'S WORDS.** Sheets must **overlay Obsidian's native bottom navigation bar**. Today they start above it, which they call extremely bad UX. This is the requirement the phase is judged on.

**IT IS A PORTAL, NOT A Z-INDEX.** Hit test: a sheet inside `.note-database-container` at `z-index: 9999` — `elementFromPoint` over the navbar returns `DIV.mobile-navbar`. The same node cloned to `document.body` returns the sheet. **No number fixes this.** And portalling strips the design tokens, which is why this phase is hard-coupled to `000`'s token boundary.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
**READ FIRST:** `../architecture-findings.md`, `../design-system.md`, `../adversarial-review.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**LANE.** Take at Phase 4, release at Phase 6, and only after all four in order: (1) full recapture **with a navbar present** — a condition no capture has ever had — `screenshots:verify` exit 0; (2) a **named human** opening every changed PNG and signing off in `checklist.md`. This matters more here than anywhere: `runtime-vars.css:43` pinned `--db-mobile-sheet-bottom` to `0px` for every capture ever taken, so no existing capture could have shown this defect and the reviewer has no prior image to compare against; (3) **`008`'s early replay re-asserting `000`, `004`, `005`, `001` and `002`** — you are moving surfaces to a different place in the document, which changes stacking and containment for everything mounted near them; (4) cascade re-confirmation for every duplicated selector you touched.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
**ACCEPTANCE.**

*Written as a checklist on 2026-09-01. It was prose, so this packet's figure was `0/0` — no
denominator at all, which reads as finished rather than as unmeasured. Nothing is ticked that this
folder does not carry evidence for, and the harness-dependence audit below is why several rows that
have a number are still open.*

- [ ] `elementFromPoint(centreX, navbarCentreY)` returns the sheet. **Today: returns
      `.mobile-navbar` even at 9999.** **The audit's objection is now half answered and half
      standing, so this stays open.** The gate below proves the harness navbar is load-bearing for
      the BOUNDS — the positioner reads its measured height and moves 22px without it. That is not
      the same claim as stacking: the hand-written div carries `z-index: 100` and no `app.css` rule,
      so what a hit test over it proves is that the plugin's declared z-index beats 100, not that it
      beats Obsidian's own navbar. Two different properties of one element, and only one of them is
      now evidenced.
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
- [ ] Scrim covers the full viewport including the navbar band. **Same exposure as the first row:**
      the navbar it must cover is the harness's own div.
- [x] Removing the navbar from the harness moves an asserted number. **Run 2026-09-01, and it is
      this packet's own gate rather than one of its tasks.** `plan.md` Phase 1 says it plainly:
      *"Until removing the navbar from the harness moves an asserted number by more than the 1.35px
      fallback artefact, no later claim in this spec means anything."*
      → *removing the navbar from the harness moves an asserted number*: `the harness navbar measures
      72px; the visible bounds end at 738 with it and 760 without, a move of 22px against the 1.35px
      fallback artefact the gate names` — sixteen times the artefact, and restored afterwards,
      because a gate that leaves the page in a different state has broken every check after it.
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
- [ ] Plus the five stateful dimensions. **No mapping exists** for this packet.
- [ ] The operator opens a sheet on their phone and it covers the nav bar. **Only the operator
      closes this.**
**HARNESS DEPENDENCE, 2026-08-31 — 9 sound / 5 dependent / 0 unknown.** The headline bullet is one of
the five. *"`elementFromPoint(centreX, navbarCentreY)` returns the sheet"* is measured against a
hand-written `<div class="mobile-navbar" ... height:72px>` (`verify-placement.mjs:409`) with no
`app.css` rule, no stacking context and no z-index — a stand-in for the element the operator's defect
is about, which a body portal beats almost by default. The scrim bullet and the every-popover
deletion bullet inherit the same stand-in, and the keyboard bullet is answered by an instrument that
**injects `--keyboard-height`** rather than driving `visualViewport`, which is the fragile half of
`keyboardInset()`. **Sound:** the anchor lease, the two-mechanism offset agreement, the transition
trace, and the host-isolation read — that last one is a differential on one document, so the missing
stylesheet cancels out of both sides. `--db-mobile-sheet-bottom` is no longer pinned, so that supply
is spent. Rows in `acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
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
