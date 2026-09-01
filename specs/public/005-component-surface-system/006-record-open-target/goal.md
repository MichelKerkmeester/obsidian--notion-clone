**Phase 006 — Record open target**

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
Repo `~/MEGA/Development/Obsidian Plugin`. **Runs seventh**, last of the feature phases. Depends on `003` — the phone answer needs the portal. Takes the `styles.css` lane at Stage 5, releases it at Stage 7.

**THE DEFECT.** On desktop, "Open" in the table shows a small card listing properties. The operator wants **the actual page** — a side panel or a full-page modal.

**THIS IS A PRODUCT DECISION, NOT A STYLING FIX.** It needs a policy and a setting, which is why it is its own phase rather than a bullet inside `001`.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
**READ FIRST:** `../architecture-findings.md`, `../design-system.md`, `../adversarial-review.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**RESEARCH GATE.** If a criterion fails twice without a new hypothesis, read AnyType and AppFlowy under `external/` for how a side-peek and a full-page open differ in behaviour. Behaviour only — never copy code, CSS values or token scales. Notion is the visual target, not a source.

**LANE.** Take at Stage 5, release at Stage 7, and only after all four in order: (1) full recapture, one per target — side panel, full page, phone — both themes, `screenshots:verify` exit 0; (2) a **named human** opening every changed PNG and signing off in `checklist.md` — `screenshots:verify` never opens an image; (3) **`008`'s early replay re-asserting `000`, `004`, `005`, `001`, `002` and `003`** against the tree you released. This is the last handoff before `008`'s full release gate and therefore the last cheap chance to catch a cascade reversal introduced anywhere in the program; (4) cascade re-confirmation — replacing the literal `998` with a declared tier changes stacking for anything that sat between the two values, so this is a real check, not a formality.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
**ACCEPTANCE.**

*Written as a checklist on 2026-09-01. It was prose, so this packet's figure was `0/0` — no
denominator at all, which reads as finished rather than as unmeasured. Nothing is ticked that this
folder does not carry evidence for, and the harness-dependence audit below is why several rows that
have a number are still open.*

- [x] Activating Open produces a surface containing the note's **rendered body**, not a property
      list. **Today the peek shows properties only.** **Met** — `023` shipped the record body, and
      the sheet's own captures show it rendered below the property rows with its own separation.
- [x] The target is a real leaf or modal that **survives the database view re-rendering**. **Met** —
      the record sheet survives a re-render with its node rebuilt and its identity intact, asserted
      by column key rather than by index, with a control that requires a different record to close
      the sheet rather than re-point it.
- [x] On phone the action never produces a sub-half-height panel. **Today: a 360px dock on a 402px
      screen, and a 50vh detail panel.** **Floor declared and asserted 2026-09-01.**
      **The measurement that started it:** the emptiest record the panel builds measured **145px on
      an 844px screen — 17%** — and a two-field one 189px. A sliver a thumb has to aim at, with the
      grab bar at the very bottom edge of the screen.
      **`min-height: 50svh` on the phone record sheet.** A minimum rather than a fixed height, so a
      record with more in it still grows to its content and still stops at the 90svh cap beside it;
      `svh` because that is the unit the cap already uses and the two differ by the mobile browser
      chrome.
      → *a record sheet on a phone is at least half the screen and never more than the cap*: `1 field
      row(s) … measures 422px on a 844px screen, against a floor of 422 and the 90svh cap at 760`.
      **Both ends in one check, and watched failing at both.** With the floor removed the same record
      measures 145px; pinned to `100svh` it measures 844 against a 760 cap. A floor-only check passes
      the second, which is the opposite defect and the one `003`'s cap exists to prevent.
      **The trade is visible rather than argued.** A short record now carries empty space below its
      fields, where the note editor grows. The capture was recaptured and read.
- [x] The peek's layer sits inside the token scale; a dropdown opened inside it paints **above** it.
      **Today `998` beats popover and submenu.** **Checked 2026-09-01.**
      The literal had already been replaced with `var(--db-layer-panel, 50)`; what was missing was
      anything that could tell the difference. Nothing in this repository read a stacking order, so
      the fix and the defect looked identical to every check that existed.
      → *a dropdown opened inside the peek paints above it*: `the topmost element where the two
      overlap is the dropdown; peek z-index 50, dropdown z-index 100`. **Both surfaces are the
      shipped producers** — `openTableRecordPeek` mounts the panel, `openDropdownMenu` mounts the
      dropdown and resolves its own host to `.note-database-container`, the peek's parent. That
      shared parent is the mechanism: a hand-built dropdown appended elsewhere sits in a different
      stacking context and paints above a peek at any z-index, which is a check that cannot fail. So
      the sibling relation is asserted as its own row rather than assumed.
      **Watched failing on the value the row names.** With the shipped rule put back to `998`:
      `the topmost element where the two overlap is the peek; peek z-index 998, dropdown z-index 100`,
      and the tier row `peek paints at z-index 998 from the declaration \`998\`, against the scale
      panel=50 popover=100 submenu=110`. Two reds, exit 1, styles.css restored and hash-verified.
      **Painting at 50 and declaring the tier are separate claims**, so both are asserted: a
      hand-written `50` paints identically today and drifts the moment the scale moves. The
      declaration is read from the CSSOM rule that won, not from the stylesheet's text.
      **And the check carries its own ablation**: it forces `998` back onto the shipped panel and
      requires the hit test to flip. A check that answers "dropdown" both ways is measuring DOM
      order, not the cascade.
- [ ] The setting round-trips and **every** affordance honours it — no path bypasses the policy.
      **The exposure is the stubs:** this has to drive `openRow`, which is `() => undefined` in the
      harness — the shape `012` repaired for the title-cell tap by driving the real opener instead.
- [x] Plus the five stateful dimensions. **No mapping exists** for this packet. **Mapped 2026-09-01**,
      in `acceptance-criteria.md` §2b. Three dimensions already had evidence; **resource ownership
      had none, and the peek is the surface where it is worth measuring rather than reasoning.**
      It takes four things — a capturing `keydown`, a container `scroll`, a window `resize`, and a
      `setTimeout` that later adds a capturing `mousedown` — and it is a module singleton, so
      opening a second peek tears the first down through a *different line* than the explicit close.
      → `0 before, 3 on open, 4 once the tick has passed, 0 after close`. Replacement does not
      stack: `4 → 4 → 0`. Red with the resize release removed: `1 after one open-and-close`, and the
      replacement case reports `5 → 6 → 3`, which is the stacking it exists to catch.
      **A count taken at open would have missed the deferred listener entirely** — 3 on open, 4 a
      tick later — so a balanced total from the wrong moment proves nothing.
      **The tick case needed BOTH defences removed to go red, and that is recorded.** A peek closed
      inside the tick must never add the outside-click listener, and that is defended twice: the
      close clears the timer, and the callback re-checks `closed`. Removing either alone left the
      check green; only removing both gave `1 outstanding`. The check proves the property holds
      while at least one mechanism does — not that either works. **A control that had stopped at
      the first green would have recorded a discriminating check that is not one.**
- [ ] The operator clicks Open and reads the note. **Only the operator closes this.**
**HARNESS DEPENDENCE, 2026-08-31 — 9 sound / 4 dependent / 0 unknown. The least style-exposed packet
of the seven**, because its bullets ask what was produced, which record is displayed and where the
write landed — content and identity, not computed geometry. The rendered-body bullet, the phone
height bullet and the layering bullet are all sound: every bound and every z-index in play is
plugin-declared. **The exposure is the stubs.** *"Every affordance honours the setting — no path
bypasses the policy"* has to drive `openRow`, which is `() => undefined` in the harness
(`verify-placement.mjs:2329`, `:3398`, `:4523`): a no-op produces no surface, so a threshold of *"0
produced a surface other than the configured target"* is satisfied vacuously — the `editFileName`
false green exactly. The write-attribution row needs a vault the harness does not have, and it is the
packet's highest-value criterion because a misattributed write is silent and permanent. One further
row, *the view is still rendered in its own leaf*, cannot be answered here at all: leaf lifetime is
`009`'s live probe or nothing. Rows in `acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
**LINE NUMBERS ARE HINTS, NOT ADDRESSES.** Every `styles.css:NNNN` and `src/**/*.ts:NNNN` below was correct on 2026-08-29; five phases edit `styles.css` before you start. `acceptance-criteria.md` carries the resolution table. **The `998` is the exception worth stating: its *value* is the evidence, not its address** — it is the literal that beats two declared tiers.

**A6 CANNOT BE EVALUATED WITHOUT THE CASCADE.** `verify-placement.mjs:220` loads `styles.css` on the **phone** page only. Your entire A6 finding is that `z-index: 998` beats `--db-layer-popover: 100` and `--db-layer-submenu: 110` — and **on a page with no stylesheet no z-index applies to anything**, so the hit test returns whatever DOM order gives and tells you nothing. A3's phone half is safe; its desktop comparison is not, and AC-002's `elementFromPoint` is subject to the same rule. `000` fixes the load; no desktop number recorded before it is admissible.

**THE REAL SHAPE.** **20 affordances → 6 call paths → 4 surfaces**, and they disagree. Sharpest evidence: `db-record-open-btn`, `db-list-row-open`, `db-board-card-open` and `db-gallery-card-open` share the **same icon and the same label** — the table's opens a preview surface, the other three open a real leaf.

**THE PEEK.** `table-record-peek.ts` is explicitly display-only, right-docked at `position: absolute; width: min(360px, 100%)`, with a hand-numbered **`z-index: 998`** outside the token scale. That number **beats `--db-layer-popover: 100` and `--db-layer-submenu: 110`**, so a dropdown opened inside the peek paints *underneath* it. The sibling detail panel documents having fixed exactly this and uses `var(--db-layer-panel, 50)`.

**TWO CORRECTIONS TO THE ORIGINAL REPORT.** The peek has **no `.is-phone` CSS at all**, but `database-view.ts:8419-8437` routes touch to the detail panel — so the 360px dock is reachable on a phone **only via `Mod+Enter`** (`:1717`), which has no touch guard. And the sub-half-height panel the operator saw is the **detail panel** (clamped to `50vh` on phone), not the peek, which is full container height. The desktop complaint stands unchanged.

**AND EVERY REAL-LEAF OPEN NAVIGATES AWAY.** `getLeaf(false)` (`data-source.ts:425`) replaces the current tab, taking the database view with it. Neither existing behaviour is what was asked for.

**INVENTORY.** Trace every affordance that can open a record — title click, Open button, card click, calendar event, keyboard Enter — and record which of the paths it takes today.

**A5'S THRESHOLD WAS EXTENDED.** It closed on the setting round-tripping — but a persisted string that nothing acts on satisfies that while the user still gets whatever surface the affordance always produced. It now also requires a **driven open per target value after the reload**: the affordance must produce the surface the setting names, 0 mismatches.

**NINE CRITERIA HAVE NO FAILING NUMBER YET.** AC-002, AC-003, AC-005, AC-007 and AC-009 to AC-013 are `Blocked`, not `Unmet`. `acceptance-criteria.md` names what produces each number and at which stage. **Do not invent one.** Two orderings follow: **Stage 2 may not take the target-policy decision before Stage 1 has recorded what the twenty affordances actually do**, and **Stage 5 may not retire the peek before AC-002, AC-003, AC-007, AC-009 and AC-012 hold its *before* numbers** — delete the module and there is nothing left to measure them against. Watch AC-011 in particular: **no write has ever been attributed to a record id in any harness**, and yours is the only aliasing failure in the program that *writes*.
<!-- /ANCHOR:log -->
