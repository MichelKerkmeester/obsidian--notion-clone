---
title: "Goal: Add View Surface Redesign"
description: "What would make phase 013 worth having done, and the criteria that decide it."
trigger_phrases:
  - "013 goal"
  - "add view sheet goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/013-add-view-sheet"
    last_updated_at: "2026-08-30T21:15:00Z"
    last_updated_by: "criteria-adjudication"
    recent_action: "Harness-dependency audit: no tick withdrawn; two absolutes are var() fallbacks"
    next_safe_action: "Run AC-6 heading controls and vitest add-view-popover-layout.test.ts, read $?"
    blockers: []
    key_files:
      - "spec.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-013-goal"
      parent_session_id: null
    completion_pct: 85
    open_questions:
      - "--text-muted at 12px measures 4.1:1; program-wide token decision, escalated"
      - "Is the Add View sheet subscribed to visualViewport, or placed once like an owned menu"
    answered_questions:
      - "It was already a sheet on a phone; defect 6 was a fixture artifact"
---
# Goal: Add View Surface Redesign

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** The Add View surface is one row grammar shared with the record sheet and the owned
menu, one control per job, groups that read as groups, and the same phone presentation as every other
sheet.

It was six control idioms and five type sizes in one 292px panel, with the same action offered twice,
no visible labels, no sections, and empty spans that read as loading skeletons.

**The first deliverable was adjudicating the report against production, not against the capture.**
Six defects were reported off a committed screenshot. Measured by opening the real `showAddViewMenu`
in a browser: **4 REAL, 1 HALF REAL** — the accessible name ships, the visible label does not — and
**1 FIXTURE ARTIFACT**: it already was a sheet on a phone. A seventh nobody reported was found the
same way: production renders **7** view-type tiles and the fixture renders **4**, so every committed
capture understates the surface by three tiles.

**And the capture could never have answered the question it was used for.** The scenario's
`captureCss` forces `position: static !important`, so **no capture of this surface can ever show
sheet presentation.** Defect 6 was read off an image structurally incapable of showing the answer.

### Decisions

| ID | Decision |
|----|----------|
| D1 | A check earns its result only if it drives `showAddViewMenu`. The screenshot fixture is hand-written markup and diverges from production in four places. |
| D2 | Neither duplicate action is removed. They do different things; renaming is the smaller change that removes the ambiguity, and deleting either would delete behaviour. |
| D3 | Alignment is measured at the **content** edge. A padded block starts its text a padding in, and comparing that to an unpadded label reports a misalignment that is not there. |
| D4 | Three shortfalls are declined with numbers rather than forced: the tile border, `--text-muted`, and the two disagreeing phone predicates. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 2. COMPLETION CRITERIA

Ticked criteria carry the check name and the number from the captured `verify-placement` run taken
from a clean tree at `f64dd87` — `220/224 geometry checks passed, 4 red for a declared reason`,
exit 0. Unticked criteria carry the check that would settle them, written to be implementable from
the sentence alone.

- [x] No two controls carry the same accessible name. Was 2 named `Duplicate current view`.
      `add view: no two controls share an accessible name` — **12 controls, 12 distinct names, no
      repeats**, measured on the desktop page and again on the phone page.
- [x] Every input, select and checkbox has a **visible** label, not only an accessible one. Was 0 of
      3. `add view: every field carries a visible label` — **4 fields, 4 visibly labelled**, desktop
      and phone.
- [x] Every action row computes the same box as a live `createMenuRow` row in the same document. Was
      36px / 6px 12px against 30px / 0 8px, because a legacy family sits 19,000 lines later at equal
      specificity and source order decides. `add view: every action row is the shared row grammar` —
      **8 rows, 0 off-grammar**, against a live reference of `30px|0px/8px/0px/8px|13px` on desktop
      and `44px|8px/16px/8px/16px|13px` on the phone. The reference `min-height` is also pinned
      absolutely at **30px**, so a regression that moved both sides together cannot hide in the
      difference.
- [x] Nothing reads as a loading skeleton: 0 elements whose only content is horizontal rules. Was 7
      empty 42×18 spans at 1.54:1. `add view: no element is drawn as bare horizontal rules` — **0
      empty top-and-bottom-ruled boxes**, desktop and phone.
- [x] Between-group gap ≥ 2× the within-group gap, measured as rectangle deltas rather than declared
      values. Was 4px within and 0px between — the groups closer together than the items inside
      them. `add view: groups are further apart than the items inside them` — **group trailing space
      16px against a within-group item gap of 8px**, with 36px of separator and heading between the
      two groups.
- [ ] At least 2 group headings, each carrying non-empty text and each load-bearing for the gap
      above. The element count alone is a class-name criterion and is banned as one.

      **Half measured.** `add view: the groups carry headings` reads **2 headings [Options, Create],
      1 separator**, which settles the count and the non-empty text. Nothing measures the
      load-bearing clause, and `acceptance-criteria.md` AC-6 records its control as *not yet run*.

      **The check that would settle it:** two mutations of the Add View panel inside
      `verify-placement`, each observed red on its own. (a) Empty one heading's text while leaving
      the element in place — the heading check must fail on its text clause while the gap check
      stays green, which is what proves the text clause does work of its own. (b) Remove one heading
      element outright — `add view: groups are further apart than the items inside them` must fall
      from 16px to the 8px within-group value, below its 2× threshold, which is what proves the
      heading is the element producing the gap rather than a sibling margin that happens to sit
      there.
- [x] The group heading, field caption, checkbox caption and row icon share one content left edge.
      Was 3 distinct edges: 9 / 15 / 21 desktop and 9 / 15 / 29 phone. `add view: headings, captions
      and rows share one left edge` — **1 distinct edge**, at 16px on desktop and 25px on the phone,
      with heading, field label, checkbox and row icon all on it. `add view: every create row starts
      at the same x` adds **1 distinct label x-position across 8 rows, at 49px**.
- [x] A resting row paints no fill. Was rgb(242,243,245) on a rgb(242,242,242) panel. `add view: a
      resting row paints no fill of its own` — **row background `rgba(0, 0, 0, 0)`**, desktop and
      phone.
- [x] The phone presentation does not regress, and the desktop page runs the same assertions
      **inverted**, so a change that made everything a sheet fails on the desktop side. `add view:
      on a phone the surface is a sheet on the viewport floor` — **sheet=true, bottom 0px, rect
      bottom 844 against an 844 viewport, width 390/390, scrim and handle present** — with the grab
      band measured at **48px** by `add view: the sheet's grab band is a thumb-sized target`. The
      inverted arm, `add view: on a desktop the surface is still an anchored popover, not a sheet`,
      reads **sheet=false, scrim=false, handle=false, position fixed, width 292** against the
      menu-role ceiling of 320.
- [ ] The fixture stops lying: same tile count, accessible names and class list as production,
      asserted by a test that reads both. Was 4 divergences.

      **The test exists and reads both** — `src/views/add-view-popover-layout.test.ts:139-189`
      compares `rendererViewTypes()` against the `add-view-popover` scenario in
      `tools/screenshots/scenarios/core.mjs` — but no run of it is recorded in this folder, and
      `verify-placement` does not carry it, so nothing here says it passes.

      **The check that would settle it:** `npx vitest run
      src/views/add-view-popover-layout.test.ts`, its exit status read from `$?` rather than through
      a pipe, with the passing count recorded here. It must also gain the one clause of the three
      the file does not assert: accessible-name equality. Today the fixture arm asserts `for`/`id`
      association and counts `for` attributes ≥ 3 (`:170-174`), which a fixture whose label text has
      drifted from the renderer's `aria-label` still satisfies. The added assertion is set equality
      between the accessible names the fixture markup resolves to and the names `showAddViewMenu`
      emits, 0 differing.
- [ ] The five stateful dimensions are covered.

      Named in `000/goal.md` as semantic identity, transition trace, action outcome, resource
      ownership and negative-control mutation. Every Add View check in the captured run measures one
      static frame of an already-open panel, with a single exception: `add view: the sheet follows a
      drag on its grab bar and dismisses past the threshold` is a real transition trace and action
      outcome for the dismissal gesture — **a 40px drag moved the sheet to
      `matrix(1, 0, 0, 1, 0, 40)`, and releasing 140px down left it dismissed**. That gesture is
      covered and should not be rewritten.

      **The checks that would settle the rest**, all in `verify-placement` driving
      `showAddViewMenu`:

      1. **Semantic identity.** Assert each of the 8 measured rows is the row whose handler creates
         the view type its label names: row *i* creates entry *i* of `getViewTypeOptions()`, 8 of 8,
         resolved through the handler rather than through position or class. A row identified by
         class is a row that can be the wrong one, which is the failure mode this dimension exists
         for.
      2. **Transition trace.** Sample the phone entrance at open, one frame in, and at the end of
         the shared sheet duration, with the three assertions the shared entrance already uses: the
         sheet starts a full sheet-height below the screen, is still travelling one frame in, and
         has settled by the end — on `transform` alone. This surface's sheet measures 711px, so the
         start offset is its own height, not a borrowed number. A stalled entrance reads 0 at every
         sample, which is what a single static frame cannot distinguish from a correct one.
      3. **Action outcome.** In one panel, press the `Duplicate current view` row and separately set
         the `Copy settings from current view` checkbox, and assert two different outcomes: the row
         creates one view of the same type in one press, the checkbox changes only what the *next*
         created view inherits. This is the pair AC-1 disambiguated by name, measured by what each
         one does.
      4. **Resource ownership.** Open the panel, close it, and assert the surface releases what it
         took: 0 `pointerdown` and 0 `keydown` listeners left on the document, no reposition loop
         still running, and the panel node disconnected. Count listeners through the shim, not by
         reading source, or the check measures the code rather than the behaviour.
      5. **Negative-control mutation.** The two mutations named under the headings criterion above,
         each observed red.
- [ ] The operator opens Add View on a phone and it looks like the rest of the plugin.

      Operator-confirmed is the only state that closes this, per D3. No harness can answer it, and
      shipped and verified are not substitutes for it.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 3. LOG

Volatile. Not part of the directive.

**Shipped and verified; not operator-confirmed.** Lane entries 50-53; the tile grid was deleted and
rebuilt on the row grammar, and a verifier follow-up took the control boundary 1.21:1 → 3.23:1.

### Three things are declined with numbers, which closes them

No border or surface token in this system clears 3:1 against the panel — measured 1.15 / 1.21 / 1.08
/ 1.01 in light — and inventing one would fork the palette. It does not need to: the tiles are
replaced by rows whose text identifies them, so no boundary is load-bearing for identification, and
the focus ring that *is* load-bearing measures 4.3 light / 3.36 dark.

`--text-muted` at 12px measures 4.1:1 against a 4.5:1 floor for body text. It is the token every
muted label in the plugin already uses, so changing it is a program-wide decision. **Escalated, not
fixed.**

The two phone predicates still disagree — `isTouchDevice` at a 760px container against
`isMobileBottomSheet` at a 600px window — so on a 700px tablet this surface is "touch" to every
renderer and not a sheet to the positioner. Pre-existing, named in `design-system.md` §7, out of
scope here.

### Harness-dependency classification, 2026-08-31

Every criterion re-asked as: *if this value came from the device instead of the harness, would the
check still pass — and could it still fail?* **No tick is withdrawn here, and the reason is specific
rather than lucky:** every property these criteria measure is named by this plugin's own rules, so
the host's declaration is outranked rather than absent.

| Criterion | Class | Rests on |
|---|---|---|
| 12 controls, 12 distinct names | SOUND | accessible-name computation is DOM and ARIA; no stylesheet, no host chrome |
| 4 fields, 4 visibly labelled | SOUND | structural — element presence and association |
| Every action row is the shared grammar | SOUND, with two absolutes narrowed | see below |
| 0 elements drawn as bare rules | SOUND | a structural count of content shape, not a colour reading |
| Group gap 16px against item gap 8px | SOUND | both derive from `--db-space-*`, which is this plugin's token namespace and not the host's |
| Headings load-bearing | open already | unchanged; the control is still unrun |
| One content left edge | SOUND | see below |
| A resting row paints no fill | SOUND — **and this is a repaired instance** | `background: transparent` at `styles.css:453` |
| Phone sheet, desktop inverted | SOUND | every sheet property is `!important` on the plugin's own class (`styles.css:177-198`); the 48px band comes from the plugin's `::before` |

**Two of these sit directly on the inventory's fifth item and survive it by declaration.** The row is
a `<button>` (`menu-row.ts:92`), so *a resting row paints no fill* was measuring a property `app.css`
declares — `button` gets a fill from the host — and the plugin now declares
`background: transparent` keyed to the row rather than to the owned menu, in a rule whose comment
states exactly that ("a host stylesheet gives every bare button a fill; scoped to the owned menu,
this reset only reached the rows that happened to be inside one"). Likewise the left-edge criterion
depends on `justify-content`, which `app.css` sets to `center` on every button and which the plugin
now sets to `flex-start` at `styles.css:530`. Both were live exposures. Both are closed in the
stylesheet, not in the harness.

**The checkbox contributor, checked rather than assumed.** The left-edge criterion counts the
checkbox among the four things on one edge, and `input` is the element `app.css` chromes most
heavily. `.note-database-container .db-add-view-duplicate input` declares `margin: 0`
(`styles.css:19660-19663`) at a specificity the host's type selector cannot reach, so the box sits on
its flex container's content edge and that edge comes from `--db-space-*`. The rule deliberately
declines to set width and height — "the native checkbox metrics are correct" — but neither is on this
criterion's measure. SOUND.

**What is narrowed rather than withdrawn: two absolutes are `var()` fallbacks.** The phone row
padding quoted as `8px/16px/8px/16px` is `var(--size-4-2, 8px) var(--size-4-4, 16px)`
(`styles.css:462`), and `--size-4-2` / `--size-4-4` are **Obsidian's** tokens, absent whenever
`app.css` is. Every harness run therefore reads the fallback. The criterion's load-bearing clause is
relative — each row against a live `createMenuRow` reference in the same document — and a relative
clause is unaffected, because both sides take the same fallback. The absolute figures are
corroborated by Obsidian's `N × 4px` scale, which is what the fallbacks were written to match, but
they are not device measurements. The desktop `30px` pin is different and is safe: it is a literal in
the plugin's own rule (`styles.css:346`).

**One question this audit opened rather than closed**, now in the frontmatter: `011` establishes that
`owned-menu.ts` places a sheet once and subscribes to nothing, while the panel path re-places on
every visual-viewport event. Which of the two this surface uses decides whether its floor reading
survives a keyboard, and no criterion here asks.

---

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Six reported defects adjudicated | Done | 4 real, 1 half real, 1 fixture artifact |
| Redesign | Shipped, verified | AC-1 to AC-7, each with a before-number |
| Two criteria found during implementation | Shipped, verified | AC-9 left edges, AC-10 resting fill |
| Fixture parity test | Shipped, never run | `add-view-popover-layout.test.ts`; no run recorded here |
| Operator confirmation | Open | — |

### Deviations and findings

| Item | Note |
|------|------|
| The `captureCss` position override stays | Without it the popover leaves the flow and the capture box collapses. Now recorded as the reason no capture can answer a placement question |
| Production renders 7 tiles, the fixture 4 | Found by measuring, not reported. Every committed capture understates the surface |
<!-- /ANCHOR:log -->
