---
title: "Goal: Checkbox Ownership"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "004 goal"
  - "checkbox ownership goal"
  - "checkbox ownership directive"
  - "packet goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/004-checkbox-ownership"
    last_updated_at: "2026-09-04T21:10:00Z"
    last_updated_by: "phase-goal-backfill"
    recent_action: "Backfilled the house goal shape; criteria and evidence untouched"
    next_safe_action: "Operator opens a board on a phone and sees squares"
    blockers:
      - "Operator device confirmation is the only row left"
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
      - "../roadmap.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-004-goal"
      parent_session_id: null
    completion_pct: 88
    open_questions: []
    answered_questions: []
---
# Goal: Checkbox Ownership

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** One checkbox factory owns every checkbox's appearance, so a surface cannot acquire a round one by being mounted somewhere nobody styled.

Repo `~/MEGA/Development/Obsidian Plugin`. **Runs second, right after `000`.** Needs only the harness, not the factory. Takes the `styles.css` lane at Phase 3, releases it at Phase 6.

**THE DEFECT.** The operator still sees round checkboxes on board cards, board columns, board subgroups, gallery cards, gallery groups, list rows, list groups and the selection-clear box. The previous attempt styled `.db-checkbox-cell input[type="checkbox"]` — the boolean **cell** — and called it done.

**BUILD.** `createCheckbox(parent, { role })` with **unconditional base appearance**. The role chooses **size only**. Never keyed to an ancestor — ancestor-keyed styling is precisely why 11 of 12 were missed.

### Decisions

Frozen choices. Changing one is an amendment. Each is a restatement of this phase's own
directive above, not a new commitment.

| ID | Decision |
|----|----------|
| D1 | `createCheckbox(parent, { role })` carries an **unconditional base appearance**. The role chooses size only. |
| D2 | Appearance is never keyed to an ancestor. Ancestor-keyed styling is precisely why 11 of 12 checkbox families were missed by the previous attempt, which styled the boolean **cell** and called it done. |
| D3 | The defect is visible shape, so a named human opens every changed PNG and signs off in `checklist.md`. A machine that never opens an image cannot close this phase. |
| D4 | The lane is taken at Phase 3 and released at Phase 6, after a full recapture of every family in every state, that human sign-off, `008`'s early replay re-asserting `000` — the program's first lane handoff, and the first real test of whether the replay works at all — and cascade re-confirmation, because replacing four ancestor-scoped rules with one unconditional rule moves the specificity landscape. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**READ FIRST:** `../architecture-findings.md`, `../design-system.md`, `../adversarial-review.md`, then this folder's `spec.md` and `acceptance-criteria.md`.

**LANE.** Take at Phase 3, release at Phase 6, and only after all four in order: (1) full recapture of every family in every state, `screenshots:verify` exit 0; (2) a **named human** opening every changed PNG and signing off in `checklist.md` — the defect is *visible shape*, and a machine that never opens an image cannot close it; (3) **`008`'s early replay re-asserting `000`** against the tree you released. This is the program's first lane handoff and the first real test of whether the replay works at all — a failure here is a finding about the replay as much as about you; (4) cascade re-confirmation — you are replacing four ancestor-scoped rules with one unconditional rule, so the specificity landscape moves and a previously losing declaration can start winning.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

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
- [x] Radius and box size identical within a role across board, gallery, list, table, modal, panel —
      set equality. **Measured 2026-09-01: 4 groups, 0 split.**
      `(switch) @ fine 34x18 r=9999px across 4 fixtures` · `db-checkbox-field @ fine 18x18 r=4px
      across 5` · `db-checkbox-row @ fine 16x16 r=4px across 10` · `db-checkbox-row @ touch
      28x28 r=4px across 3`.
      **The pointer mode is an axis, not a violation, and leaving it out fails a correct
      stylesheet.** Grouped by role alone, `db-checkbox-row` reports two shapes — 16×16 and 28×28 —
      which reads as a role disagreeing with itself. It is the coarse pointer: the stylesheet raises
      the box under `@media (pointer: coarse)` and the phone fixtures render on the touch page. This
      is the shape the program keeps finding in criteria phrased as universals, and this one was
      found while building the check rather than after shipping it.
      **Watched failing** with one surface given a different radius for the same role: `16x16
      r=9999px / 16x16 r=4px … <-- one role, more than one box`, at both pointer modes.
      **The audit's exposure still stands and is not cured by this:** a harness without `app.css`
      cannot tell a plugin box from a host one. What this adds is that whatever the boxes are, the
      plugin gives one role one box.
- [x] Appearance identical at all three mount points. **Measured as the same set-equality question
      with the mount point as a third axis: 7 groups, 0 split.** The roots the census finds are
      `note-database-container`, `note-database-container db-width-default`, `note-database-modal`
      and `note-database-modal db-invalid-events-modal`, and no role changes shape across them.
      Red under the same control, which splits the mount groups as well as the role groups —
      the two claims share one measurement and one failure mode.
- [x] Checked, indeterminate, disabled and focus each produce a measurable difference, per family.
      **Built 2026-09-01, and it found one.** `checkbox-appearance` now drives all four states on one
      representative per SHAPE — the shape is what a family shares, so running all 223 would report
      the same four answers 223 times and hide which four they were — and reads a wide signature
      (background, border, image, shadow, opacity), because a state may be drawn any of those ways
      and the question is whether it is drawn at all.
      `16x16 checked yes indeterminate yes disabled yes focus yes` · `18x18` same · `28x28` same ·
      `34x18 checked yes indeterminate n/a disabled yes focus yes`.
      **The toggle switch had no focus indicator at all**, where the three checkbox families each get
      one from `.db-checkbox:focus-visible` — a keyboard user tabbing through a settings panel could
      not see which switch they were on. Fixed with the same outline and ring, because the two are
      the same control to a reader even though they are different shapes. Watched failing by renaming
      the selector: `focus NO`.
      **`indeterminate` is declared n/a for the switch**, named with its reason rather than filtered
      out by a predicate wide enough to hide the next real one: `indeterminate` is a checkbox's third
      value and a toggle is binary by construction.
      **The finding almost went the other way, and that is worth more than the fix.** The first run
      reported the switch with no checked, indeterminate OR focus state. The cause was the pass
      reading a signature in the same tick as the state change, while the switch's `0.15s`
      background transition was still running — the other three families change `background-image`,
      which has no transition, which is why exactly one family lied. A theme root, a `:checked` match
      and a pseudo-element read all had to be ruled out first. Recording it as written would have
      been a fabricated defect in a shipped control, and the mitigation is now in the tool: that pass
      disables transitions and says why.
- [x] Unchanged under three third-party themes, at least one that restyles native checkboxes.
      **Reachable after all, and it found a shipped defect on the way.**

      **Three profiles, and the first is not a model.** `tools/screenshots/host-checkbox.css` carries
      the `input[type=checkbox]` block transcribed from the *installed* application stylesheet with
      its own token defaults resolved from the same file. The other two are deliberate models,
      labelled as such: one moving only the host's variables, one handing the control back to the
      browser with `appearance: auto`, which is the declaration no inherited rule survives. All 250
      real fixture checkboxes are measured under each. **Every one holds its appearance.**

      **The premise is what makes that mean anything:** a bare unclassed checkbox riding in the same
      document moves under 3 of 3 profiles. A profile that reached nothing would report every family
      "unchanged" for the one reason that proves nothing.

      **The first run said all 250 moved, and that was the harness.** The component rule is
      `input[type="checkbox"].db-checkbox` and a profile selector is `.stress-x input[type="checkbox"]`
      — both 0-2-1, so the tie goes to source order, and the run was appending the host sheet *last*.
      Obsidian loads its own stylesheet and then injects plugin styles, so the plugin wins ties on a
      device. Loading them in that order is the difference between measuring the plugin and measuring
      an append sequence.

      **What survived that correction was one real defect.** With the order right, only `border-color`
      still moved — because the rule asked it to: `var(--checkbox-border-color, …)` put the host's
      token first, and the comment two lines above it says the border needs 3:1 because the inherited
      token measured 1.36:1. The host always defines that token. It resolves to `--text-faint`:
      **#ababab in the default light theme, 2.30:1**, and **#666666 in dark, 2.90:1** — both under
      WCAG 1.4.11's 3:1 non-text minimum, both on the shipped defaults.

      **No harness had ever seen it**, because none of them declared `--checkbox-border-color`, so
      every check and every capture had been reading a fallback the app never reaches. That is this
      packet's own stated exposure, arriving exactly where it said it would.

      **Fixed by preferring the plugin's own value and unifying on the switch's.** `#8a9099` cleared
      3:1 against white and nothing else the control sits on — 2.90:1 on the secondary surface,
      2.87:1 and 2.75:1 on the two mixed popover greys, **13 of 250 below the floor**. `#82878e`,
      which the toggle switch already draws with, clears every one at **3.09:1 or better** and holds
      4.18:1 in dark. `theme.css` now declares the host tokens too, so the harness renders what the
      app renders and a rule that defers to them shows it.

      **The contrast check took three wrong pairs before the right one, and each is recorded.**
      Border against the box's own background scored the *checked* switch at 1:1, which is correct
      design — a filled control identifies itself by fill. Track against the page scored the switch
      1.22:1 while saying nothing about the checkboxes. The rule asks for the boundary against the
      colour *outside* the control, which for an empty checkbox is the same thing and for a filled
      switch is not. A colour parser that read `color(srgb 0.95 0.95 0.95)` on the 0-255 scale
      reported a #dddddd track at **15.37:1** against a near-white page and the check passed on it —
      an absurd number nobody would have read.

      **Both failures now exit non-zero**, so a checkbox that moves under a host stylesheet or a
      border under 3:1 stops the tool. Neither is a threshold that has never been crossed: 13 borders
      sat between 2.75:1 and 2.90:1 when this was written.

      **What it still does not prove:** these are three profiles, not three community themes
      downloaded and installed. The first is the real host's own rules; the other two are adversarial
      models chosen to find the seam rather than to imitate a particular theme.
- [x] Hit target ≥ 28×28 on coarse pointer, per family. **Measured with the pointer mode that
      matters.** `checkbox-appearance` sends every phone scenario to a `hasTouch` page, and the
      stylesheet's `@media (pointer: coarse)` rule raises the box to 28×28; the touch-target census
      declares the checkbox because its hit area comes from a `::before` inset a bounding box does
      not include, and measures that surface directly.
- [x] Plus the five stateful dimensions: semantic identity, transition trace, action outcome,
      resource ownership, negative-control mutation. **Mapped and measured 2026-09-01**, in
      `acceptance-criteria.md` §2b.
      **This packet measures how a checkbox LOOKS to death and had never asked what one DOES.**
      Sizes, radii, per-state signatures, borrowed ancestors — none of it can see a box that toggles
      the wrong row.
      → *the checkbox in each row toggles the row it was drawn in*: 8 rows driven through the
      shipped `TableRenderer`, each box handed its own path. **Red** with every box wired to
      `rows[0]`: `drawn in note-1.md but toggled note-0.md` and six more. An index-keyed selection
      is invisible to every appearance check in this packet, which is why the check drives eight
      rows rather than one — one row cannot show a row toggling its neighbour.
      → *the checkbox factory subscribes to nothing*: `0 document or window subscription(s) while
      rendering 8 rows`. **The zero is asserted rather than assumed**, because a DOM factory that
      started subscribing would leak once per row — the worst place for it. Red with one listener
      added inside `createCheckbox`: `9 … document:click=9`, header included.
      **Transition trace and negative-control mutation were already measured** and now have a row
      naming them: the per-state appearance pass, and the borrowed-ancestor guard's five removals.

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
**2026-09-02 — that instruction was followed and its premise has moved, so the 1/16/1 count is left
standing as the reading of 2026-08-31 rather than restated.** AC-009 is built and stamped:
`tools/live/checkbox-inventory.json` records 10 sites, 2 classless, **0 unmentioned and 0 with no
appearance rule**. `styles.css:20319` now carries `input[type="checkbox"].db-checkbox` as a single
rule reached through the input's own class rather than through any ancestor, and
`checkbox-appearance.json` reads **258 checkboxes, 258 self-owned, 0 owned by an ancestor, 0
falling back to the platform box**. The "no `app.css`" exposure is answered in kind rather than
argued away: `tools/screenshots/host-checkbox.css` transcribes the installed application's
`input[type=checkbox]` block, `theme.css` declares the host tokens the rules defer to, and the
fifth row above is where that reading found and fixed a real contrast defect. What is **not** spent
is the device itself — three profiles are not three installed community themes, which the fifth row
says in its own words. Rows in `acceptance-criteria.md` § Harness-dependence audit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

**LINE NUMBERS ARE HINTS, NOT ADDRESSES.** Every `styles.css:NNNN` and `src/**/*.ts:NNNN` below was correct on 2026-08-29; `000` deletes dead blocks before you start. Find the four `appearance: none` selectors with `rg -n 'appearance: none' styles.css` and read each hit's selector; find the five dangerous sites with `rg -n 'type: "checkbox"' src/views/` and read the two lines above each hit. When the command and the number disagree, the command is right.

**YOUR HARNESS MUST HAVE THE STYLESHEET OR NOTHING HERE IS MEASURABLE.** `verify-placement.mjs:220` loads `styles.css` on the **phone** page only. Every criterion you have reads a **computed** value — `appearance`, `border-radius`, box size — and on a stylesheet-less page all twelve families compute the platform default. The harness would report them uniformly broken and your fix would look like it changed nothing. That is not a false pass, it makes the packet unmeasurable. `000` fixes this; no desktop number recorded before it is admissible. And `.storybook/preview.ts:55` wraps every story in `.note-database-container` — the very ancestor four of these rules are scoped to — so a story in the wrapper cannot show the ancestor dependency at all. Measure at the production mount, cross-check against `009`.

**WHY THIS RUNS EARLY.** It is small, highly visible, and it **tests the doctrine cheaply**. If checkboxes ship and the operator still sees circles, the method is wrong and the cost is a week rather than a quarter. Do not reorder it behind the overlay chain.

**MEASURED.** **1 of 12 families is actually owned.** All four selectors declaring `appearance: none` on a plugin checkbox are **ancestor-scoped** (`styles.css:5428, :6628, :8252, :11039`) — including `db-modal-checkbox`, which sits on the input but is still reached through `.note-database-modal`. `db-list-row-checkbox` (`list-renderer.ts:271`) has **no CSS rule anywhere**.
**Superseded 2026-09-02, and kept because it is the reading the phase was opened on.** The
unconditional class rule at `styles.css:20319` is the repair; `checkbox-appearance.json` now reads
258 of 258 self-owned with 0 owned by an ancestor, and `checkbox-inventory.json` reads 0 sites with
no appearance rule, so neither the "1 of 12" nor the rule-less class survives as a current fact.

**THE DANGEROUS POPULATION — NOW FIVE NAMED CRITERIA, NOT A GROUP.** There are **10 classless checkbox inputs**, not four. (**2026-09-02:** `checkbox-inventory.json` now reads 10 sites with **2** classless and 0 lacking an appearance rule; the ten below is the 2026-08-29 population, not today's.) Five are unstyled. The other five **work today only because the call site adds a class to their parent one line before creating the input** (`table-renderer.ts:514`, `:785`; `cell-renderer.ts:489`; `card-field-renderer.ts:184`; `record-detail-panel.ts:339`). They pass every check right now and are one wrapper refactor from silently reverting. **Migrate these first, not last.**

They are unprotected between `000` Stage 1 and your Phase 4: `000` fixes the harness and the token root and never touches checkboxes, so in that window any wrapper change in those five files breaks them with no compiler warning and no failing test. `000` is gaining a guard; **your job is to close the window for good** by removing the dependency, not by protecting it.

Each is now **AC-012a to AC-012e — one criterion per site, with its own failing value.** "The five were migrated" is a population statement and is exactly the class-name-shaped claim this packet exists to stop.

**THE CONTROL IS TWO-SIDED AND BOTH HALVES ARE REQUIRED.** *Before* you migrate a site, strip its parent's class in the harness: a computed value **must move**. That is what proves the borrowed dependency is real and your check is connected — a site where nothing moves has been measured wrong, not found safe. *After* migration, stripping the same class **must move nothing**. **You may not migrate a site whose pre-fix result is unrecorded**: without it, a site that never depended on the wrapper is indistinguishable from one you fixed.

**INVENTORY.** **Join** every `type: "checkbox"` creation site against every CSS rule that could style one. The join is what surfaces the rule-less class and the four bare inputs. A list of creation sites alone is not an inventory.

**TWO CRITERIA WERE REWRITTEN.** AC-007 closed on `db-list-row-checkbox` being *routed or deleted with zero callers*; AC-008 on a census showing *zero checkboxes created outside `createCheckbox`*. A deletion and a call count — and the doctrine bans call counts outright. They now close on computed appearance: the list-row checkbox matching its role-mate on every property, and **0 of the 10 classless sites falling back to the platform box**.

**SEVEN CRITERIA HAVE NO FAILING NUMBER YET.** AC-007 to AC-013, including AC-012a to AC-012e, are `Blocked`, not `Unmet`. `acceptance-criteria.md` names what produces each number and at which phase. **Do not invent one.** Phase 2 is where they get filled, and `plan.md` already says Stage 2 is a gate, not a task.

`005` unblocks from `000` on the same edge you do and also edits `styles.css`. **You are serialized by this rule and nothing else** — there is no lock file.

**TRAPS.** A pipe makes `$?` the pipe's status. Storybook wraps stories in the container that supplies tokens — measure at the production mount.
<!-- /ANCHOR:log -->
