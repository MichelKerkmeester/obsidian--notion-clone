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
- `elementFromPoint(centreX, navbarCentreY)` returns the sheet. **Today: returns `.mobile-navbar` even at 9999.**
- Sheet bottom equals viewport bottom, offset 0px, for **both** mechanisms. **Today 49px vs 0px.**
- After a field commit: node identity unchanged, top edge moved 0px, and a later resize still repositions. **Today repositioning is dead after the first commit.**
- With `visualViewport` reduced for the keyboard, the focused field stays visible.
- Scrim covers the full viewport including the navbar band.
- Removing the navbar from the harness moves an asserted number.
- Plus the five stateful dimensions.

**DONE MEANS** the operator opens a sheet on their phone and it covers the nav bar.
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
