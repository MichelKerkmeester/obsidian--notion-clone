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
- Activating Open produces a surface containing the note's **rendered body**, not a property list. **Today the peek shows properties only.**
- The target is a real leaf or modal that **survives the database view re-rendering**.
- On phone the action never produces a sub-half-height panel. **Today: a 360px dock on a 402px screen, and a 50vh detail panel.**
- The peek's layer sits inside the token scale; a dropdown opened inside it paints **above** it. **Today `998` beats popover and submenu.**
- The setting round-trips and **every** affordance honours it — no path bypasses the policy.
- Plus the five stateful dimensions.

**DONE MEANS** the operator clicks Open and reads the note.
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
