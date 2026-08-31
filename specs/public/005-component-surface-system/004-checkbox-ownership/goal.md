**Phase 004 — Checkbox ownership**

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
Repo `~/MEGA/Development/Obsidian Plugin`. **Runs second, right after `000`.** Needs only the harness, not the factory. Takes the `styles.css` lane at Phase 3, releases it at Phase 6.

**THE DEFECT.** The operator still sees round checkboxes on board cards, board columns, board subgroups, gallery cards, gallery groups, list rows, list groups and the selection-clear box. The previous attempt styled `.db-checkbox-cell input[type="checkbox"]` — the boolean **cell** — and called it done.

**BUILD.** `createCheckbox(parent, { role })` with **unconditional base appearance**. The role chooses **size only**. Never keyed to an ancestor — ancestor-keyed styling is precisely why 11 of 12 were missed.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
**READ FIRST:** `../architecture-findings.md`, `../design-system.md`, `../adversarial-review.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**LANE.** Take at Phase 3, release at Phase 6, and only after all four in order: (1) full recapture of every family in every state, `screenshots:verify` exit 0; (2) a **named human** opening every changed PNG and signing off in `checklist.md` — the defect is *visible shape*, and a machine that never opens an image cannot close it; (3) **`008`'s early replay re-asserting `000`** against the tree you released. This is the program's first lane handoff and the first real test of whether the replay works at all — a failure here is a finding about the replay as much as about you; (4) cascade re-confirmation — you are replacing four ancestor-scoped rules with one unconditional rule, so the specificity landscape moves and a previously losing declaration can start winning.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
**ACCEPTANCE — every one measured, thresholded, failing value recorded, negative control named.**

*Written as a checklist on 2026-09-01. It was prose, so this packet's figure was `0/0` — not zero
progress but no denominator, which is worse: a phase with nothing to divide reports nothing and
reads as finished. A tick here needs evidence in this folder or in a lane, and the audit below is
why most of them are still open even where a number looks green.*

- [x] Every `input[type=checkbox]` the plugin creates computes `appearance: none`. **Today: 1 of 12.**
      **Measured 0 of 12 failing, and held.** `replay` carries it as *no checkbox falls back to the
      platform box*: was 23, recorded 0, now 0.
      **The audit's objection stands and is recorded rather than dismissed:** `appearance: none`
      discriminates in the harness and stops discriminating on a device, because a checkbox the
      plugin never touched reads the host's `none` too. What makes the tick defensible is the second
      claim beside it — *no checkbox or switch borrows its appearance from an ancestor*, was 10,
      recorded 0, now 0 — which is a statement about ownership rather than about a computed value,
      and a host cannot satisfy it on the plugin's behalf.
- [ ] Radius and box size identical within a role across board, gallery, list, table, modal, panel —
      set equality. **Exposed the same way as the row above and without its companion claim.**
      `checkbox-inventory` reports the families; nothing asserts set equality of radius and box size
      per role, and a harness without `app.css` cannot tell a plugin box from a host one.
- [ ] Appearance identical at all three mount points. **No check.**
- [ ] Checked, indeterminate, disabled and focus each produce a measurable difference, per family.
      **No check.** This is the "states with no visible difference" class, and it is the one a
      capture can show but no capture asserts.
- [ ] Unchanged under three third-party themes, at least one that restyles native checkboxes.
      **Unreachable here.** No harness in this repository loads a third-party theme.
- [x] Hit target ≥ 28×28 on coarse pointer, per family. **Measured with the pointer mode that
      matters.** `checkbox-appearance` sends every phone scenario to a `hasTouch` page, and the
      stylesheet's `@media (pointer: coarse)` rule raises the box to 28×28; the touch-target census
      declares the checkbox because its hit area comes from a `::before` inset a bounding box does
      not include, and measures that surface directly.
- [ ] Plus the five stateful dimensions: semantic identity, transition trace, action outcome,
      resource ownership, negative-control mutation. **No mapping exists.** `010` and `011` each
      built one; this packet has not.
- [ ] The operator opens a board on a phone and sees squares. **Only the operator closes this.**
      Gate passage has already proven insufficient here.
**HARNESS DEPENDENCE, 2026-08-31 — 1 sound / 16 dependent / 1 unknown. This packet is the most
exposed in the program.** `styles.css` contains **no unconditional `input[type="checkbox"]` rule**:
every appearance the plugin gives a checkbox is reached through an ancestor or through a class the
input carries. So a checkbox the plugin misses falls back to whatever stylesheet is in the document —
the Chromium default here, **Obsidian's own checkbox in the app**. `checkbox-appearance.mjs:86-88`
loads `styles.css`, `theme.css` and `runtime-vars.css` and nothing else; the tool says so itself.
**The consequence is exact: `appearance: none` discriminates in the harness and stops discriminating
on a device**, because a checkbox the plugin never touched reads the host's `none` too. *"Every
`input[type=checkbox]` the plugin creates computes `appearance: none`"* is therefore satisfiable **by
Obsidian, with all twelve families still round** — the `justify-content` failure applied to the one
property this phase is judged on. Radius, box size, per-state difference, theme survival and the
28x28 hit target are exposed the same way; the harness itself records at `verify-placement.mjs:5044`
that `app.css` gives every input its own height. **The source facts are untouched and remain the
better evidence**: no unconditional rule, twelve families across four ancestors, ten classless
creation sites, five borrowed parents. **AC-009 is the one sound row** — it joins node to creation
site to declared role and asks no cascade anything. Build it first and re-derive the rest from it.
Rows in `acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
**LINE NUMBERS ARE HINTS, NOT ADDRESSES.** Every `styles.css:NNNN` and `src/**/*.ts:NNNN` below was correct on 2026-08-29; `000` deletes dead blocks before you start. Find the four `appearance: none` selectors with `rg -n 'appearance: none' styles.css` and read each hit's selector; find the five dangerous sites with `rg -n 'type: "checkbox"' src/views/` and read the two lines above each hit. When the command and the number disagree, the command is right.

**YOUR HARNESS MUST HAVE THE STYLESHEET OR NOTHING HERE IS MEASURABLE.** `verify-placement.mjs:220` loads `styles.css` on the **phone** page only. Every criterion you have reads a **computed** value — `appearance`, `border-radius`, box size — and on a stylesheet-less page all twelve families compute the platform default. The harness would report them uniformly broken and your fix would look like it changed nothing. That is not a false pass, it makes the packet unmeasurable. `000` fixes this; no desktop number recorded before it is admissible. And `.storybook/preview.ts:55` wraps every story in `.note-database-container` — the very ancestor four of these rules are scoped to — so a story in the wrapper cannot show the ancestor dependency at all. Measure at the production mount, cross-check against `009`.

**WHY THIS RUNS EARLY.** It is small, highly visible, and it **tests the doctrine cheaply**. If checkboxes ship and the operator still sees circles, the method is wrong and the cost is a week rather than a quarter. Do not reorder it behind the overlay chain.

**MEASURED.** **1 of 12 families is actually owned.** All four selectors declaring `appearance: none` on a plugin checkbox are **ancestor-scoped** (`styles.css:5428, :6628, :8252, :11039`) — including `db-modal-checkbox`, which sits on the input but is still reached through `.note-database-modal`. `db-list-row-checkbox` (`list-renderer.ts:271`) has **no CSS rule anywhere**.

**THE DANGEROUS POPULATION — NOW FIVE NAMED CRITERIA, NOT A GROUP.** There are **10 classless checkbox inputs**, not four. Five are unstyled. The other five **work today only because the call site adds a class to their parent one line before creating the input** (`table-renderer.ts:514`, `:785`; `cell-renderer.ts:489`; `card-field-renderer.ts:184`; `record-detail-panel.ts:339`). They pass every check right now and are one wrapper refactor from silently reverting. **Migrate these first, not last.**

They are unprotected between `000` Stage 1 and your Phase 4: `000` fixes the harness and the token root and never touches checkboxes, so in that window any wrapper change in those five files breaks them with no compiler warning and no failing test. `000` is gaining a guard; **your job is to close the window for good** by removing the dependency, not by protecting it.

Each is now **AC-012a to AC-012e — one criterion per site, with its own failing value.** "The five were migrated" is a population statement and is exactly the class-name-shaped claim this packet exists to stop.

**THE CONTROL IS TWO-SIDED AND BOTH HALVES ARE REQUIRED.** *Before* you migrate a site, strip its parent's class in the harness: a computed value **must move**. That is what proves the borrowed dependency is real and your check is connected — a site where nothing moves has been measured wrong, not found safe. *After* migration, stripping the same class **must move nothing**. **You may not migrate a site whose pre-fix result is unrecorded**: without it, a site that never depended on the wrapper is indistinguishable from one you fixed.

**INVENTORY.** **Join** every `type: "checkbox"` creation site against every CSS rule that could style one. The join is what surfaces the rule-less class and the four bare inputs. A list of creation sites alone is not an inventory.

**TWO CRITERIA WERE REWRITTEN.** AC-007 closed on `db-list-row-checkbox` being *routed or deleted with zero callers*; AC-008 on a census showing *zero checkboxes created outside `createCheckbox`*. A deletion and a call count — and the doctrine bans call counts outright. They now close on computed appearance: the list-row checkbox matching its role-mate on every property, and **0 of the 10 classless sites falling back to the platform box**.

**SEVEN CRITERIA HAVE NO FAILING NUMBER YET.** AC-007 to AC-013, including AC-012a to AC-012e, are `Blocked`, not `Unmet`. `acceptance-criteria.md` names what produces each number and at which phase. **Do not invent one.** Phase 2 is where they get filled, and `plan.md` already says Stage 2 is a gate, not a task.

`005` unblocks from `000` on the same edge you do and also edits `styles.css`. **You are serialized by this rule and nothing else** — there is no lock file.

**TRAPS.** A pipe makes `$?` the pipe's status. Storybook wraps stories in the container that supplies tokens — measure at the production mount.
<!-- /ANCHOR:log -->
