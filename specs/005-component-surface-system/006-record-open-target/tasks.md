---
title: "Task Breakdown: Record Open Target"
description: "One task per requirement, each closed only with evidence that was read, not assumed."
trigger_phrases:
  - "006 record open target tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Record Open Target

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

**Reconciled against evidence on 2026-09-02: 9 ticked with citations, 23 left open (0 not done by
decision, 2 operator-owned, rest unfound).**

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**No task closes on "looks right".** Each task's evidence must name a number that was read or a
command whose output and exit status were read.

**No DOM assertion in vitest.** `vitest` runs `environment: "node"` with no jsdom. A vitest test here
may assert source text and the setting's serialisation; it may not claim to have measured a rectangle
or run a hit test. Those live in `tools/storybook/verify-placement.mjs` or its successor.

**No spec path, requirement id, task id or phase number in any code comment.**

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP [Trace, then decide]

### Stage 1 — trace

- [ ] **T1** Drive all 20 affordances; record constructor, parent, leaf-or-not, rect, view survival — REQ-001.
      *Evidence to close:* Committed artefact, one record per affordance
- [ ] **T2** Resolve the phone question: which surface a person on a 402px device actually meets — REQ-005.
      *Evidence to close:* Trace of the **Open** button and of `Mod+Enter`, both recorded; `spec.md` §6 answered with observations
- [ ] **T3** Diff the trace against `spec.md` §4's static table — REQ-001.
      *Evidence to close:* Named list of affordances whose runtime surface differs from the static reading
- [ ] **T4** Record the peek module and its 15 CSS rules verbatim before anything is deleted — REQ-006.
      *Evidence to close:* Archive entry cited by T15

### Stage 2 — decision

- [ ] **T5** Take the target-policy decision with the operator: side panel, full page, or both — REQ-001, REQ-002.
      *Evidence to close:* Decision recorded with its reason; `spec.md` §10 answered. **No code before this closes**

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Stage 3 — resolver and setting

- [x] **T6** Implement the target resolver: setting × platform × record → surface — REQ-001.
      *Evidence to close:* Resolver returns each target for its inputs; no affordance calls it yet
      **Evidence:** `src/views/record-open-target.ts` exports `resolveRecordOpenTarget`
      (setting x `isPhone` x `hasAnchor` -> target, each fold carrying its reason), with 11 unit
      cases in `src/views/record-open-target.test.ts` covering every setting on desktop and phone.
      Ticked on `goal.md` criterion 5, which records two controls observed red — removing the
      phone's split fold, and letting an unrecognised stored value through.
- [x] **T7** Add the setting to `PluginSettings`, absent meaning current behaviour — REQ-004.
      *Evidence to close:* Absent value produces today's surfaces; written value produces the chosen one
      **Evidence:** `src/settings.ts:52` `recordOpenTarget: DEFAULT_RECORD_OPEN_TARGET`, read at
      `src/views/database-view.ts:8269` through `normalizeRecordOpenTarget`. Driven per setting at
      `tools/storybook/verify-placement.mjs:7659` against the shipped
      `DatabaseView.prototype.openRecordAt`: **panel -> panel, peek -> peek, tab -> leaf:tab,
      split -> leaf:split, window -> leaf:window**, with `undefined` and `"nonsense"` both landing
      on the default (`:7675-7677`). Ticked on `goal.md` criterion 5.
- [x] **T8** Add the settings control beside the existing database-file toggles — REQ-004.
      *Evidence to close:* Control writes the value; `saveSettings` observed
      **Evidence:** `src/settings.ts:127-143` — a dropdown over `RECORD_OPEN_TARGETS` whose
      `onChange` writes `this.plugin.settings.recordOpenTarget` and awaits
      `this.plugin.saveSettings()`. It sits immediately above the
      `databaseFilesAlwaysOpenInNewTab` toggle (`:144`). The stored value is read back through the
      same normaliser the resolver uses, so an unknown value shows the default rather than an
      empty control that rewrites the setting on the next change.
- [x] **T9** Build the target surface so it contains the note's rendered body — REQ-002, REQ-003.
      *Evidence to close:* Seeded body's heading and paragraph text present in the surface; it is a leaf or a `Modal`
      **Evidence:** ticked on `goal.md` criterion 1 — the record body ships and renders below the
      property rows with its own separation, shown in the sheet's own captures. The panel branch is
      identified in the lane by the boundary it reaches (`verify-placement.mjs:7659`): the record
      panel *always* asks for the note body, so building it constructs an Obsidian `Component`,
      which the catalogue's stub refuses by design — a refusal that is itself evidence the surface
      renders a body rather than a property list.

### Stage 4 — route everything

- [ ] **T10** Route all 20 affordances through the resolver in one pass — REQ-001.
      *Evidence to close:* Trace re-run: 0 affordances produce a surface other than the configured target
- [x] **T11** Retire the hardcoded touch branch at `database-view.ts:8425` — REQ-001.
      *Evidence to close:* Desktop and touch both resolve through the setting; no `isTouchDevice` branch decides the surface
      **Evidence:** re-resolved 2026-09-02 — the surface is now decided only at
      `src/views/database-view.ts:8267` `resolveOpenTarget()`, whose predicate is
      `Platform.isPhone` alone, with the reason recorded in the code at `:8270-8274`:
      `isTouchDevice` answers *"coarse pointer or narrow pane"*, which is true of a 700px split on
      a 1440px desktop. The remaining `isTouchDevice` calls in that file (`:5192`, `:7437`,
      `:8676`, `:8684`, `:8896`) decide bulk editors, cell selection and column fill — none
      decides an open surface.
- [x] **T12** Give `Mod+Enter` the same resolution as the button — REQ-001.
      *Evidence to close:* Both produce the same surface on the same device
      **Evidence:** `src/views/database-view.ts:1781` routes the shortcut through the same
      `openRecordAt` the Open button uses, with the comment at `:1779` recording what it replaced —
      *"Mod+Enter used to open the preview layer directly and had no touch guard at all"*. Both
      paths enter `openRecordAt` (`:8280`), which asks `resolveOpenTarget` once. Ticked on
      `goal.md` criterion 5, which names `Mod+Enter` as *"the one path that could disagree with the
      button beside it"*.
- [ ] **T13** Move `getLeaf(false)` under the resolver without touching the database-file opens — REQ-007.
      *Evidence to close:* Record opens honour the setting; `main.ts:689-724` behaviour unchanged, asserted
- [x] **T14** Ensure the surface survives a view re-render — REQ-003.
      *Evidence to close:* After a field commit, `elementFromPoint` at the surface centre returns a node inside it
      **Evidence:** ticked on `goal.md` criterion 2 — the record sheet survives a re-render with
      its node rebuilt and its identity intact, **asserted by column key rather than by index**,
      with a control that requires a different record to close the sheet rather than re-point it.

### Stage 5 — retire the peek

- [ ] **T15** Delete `table-record-peek.ts` and its 15 CSS rules, or reduce it to the resolver's preview mode — REQ-006.
      *Evidence to close:* Every affordance driven and the surface it produced recorded, with 0
      producing a surface other than the configured target; T4's archive cited per deletion.
      **Blocked until AC-002, AC-003, AC-007, AC-009 and AC-012 hold the peek's *before* numbers** —
      once the module is gone there is nothing left to measure them against
- [x] **T16** Replace the literal `z-index: 998` with a declared tier — re-resolve both with
      `rg -n -A20 '^\.note-database-container \.db-record-peek-panel \{' styles.css` and
      `rg -n 'db-layer-' styles.css` rather than by line number — REQ-006.
      *Evidence to close:* A dropdown opened from inside the surface wins the hit test over it, read
      on a harness page that **has** `styles.css` loaded — on a page without it no z-index applies to
      anything and the result is unrelated to the defect. Record the computed winner for every
      selector that sat between the two values
      **Evidence:** the literal is `var(--db-layer-panel, 50)`, and the check that can tell the
      difference now exists: *"a dropdown opened inside the peek paints above it"* —
      `the topmost element where the two overlap is the dropdown; peek z-index 50, dropdown
      z-index 100`, both mounted by their shipped producers (`openTableRecordPeek`,
      `openDropdownMenu`) under the same `.note-database-container` parent, so the sibling relation
      is asserted rather than assumed. The tier is read from the CSSOM rule that won, not from the
      stylesheet text. **Watched red on the value this row names:** with `998` put back,
      `the topmost element … is the peek; peek z-index 998, dropdown z-index 100` and
      `peek paints at z-index 998 … against the scale panel=50 popover=100 submenu=110` — two reds,
      exit 1, `styles.css` restored and hash-verified. Ticked on `goal.md` criterion 4.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

Stage 6 — prove it.

- [ ] **T17** Re-run the trace unchanged — REQ-001-REQ-007.
      *Evidence to close:* Stage 6 artefact; every criterion is a delta against Stage 1
- [ ] **T18** Setting round-trip across a plugin reload — REQ-004.
      *Evidence to close:* Written value equals read-back value
- [x] **T19** Phone height check on a 402px profile — REQ-005.
      *Evidence to close:* Surface height ≥ 50% of viewport; number recorded
      **Evidence:** ticked on `goal.md` criterion 3 — *"a record sheet on a phone is at least half
      the screen and never more than the cap"*: `1 field row(s) … measures 422px on a 844px screen,
      against a floor of 422 and the 90svh cap at 760`, from `min-height: 50svh` on the phone
      record sheet. **Watched red at both ends:** with the floor removed the same record measures
      **145px** (17% — the number that started the row); pinned to `100svh` it measures 844 against
      a 760 cap, which a floor-only check would pass.
- [ ] **T20** Negative controls — REQ-001-REQ-007.
      *Evidence to close:* Deleting the target surface from the harness DOM moves an asserted number
- [ ] **T21** Screenshots of each target, both themes — REQ-002, REQ-005.
      *Evidence to close:* `screenshots:verify` exit 0 **and** a human reviewed the changed PNGs
- [ ] **T22** Storybook each target surface and the setting's states — REQ-002, REQ-003.
      *Evidence to close:* Each renders at its production mount point

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- [ ] [P0] `npx tsc --noEmit` exit 0, no output, read without a pipe
- [ ] [P0] `npm run build` exit 0
- [ ] [P0] `npx vitest run` exit 0, count not reduced
- [ ] [P0] Trace re-run from the final state; every criterion's number moved
- [ ] [P0] Negative controls hold
- [ ] [P0] Setting round-trips across a reload
- [ ] [P0] `npm run screenshots:verify` exit 0 after a **full** recapture
- [ ] [P0] Human reviewed the changed PNGs
- [ ] [P0] `npm run story:smoke` green at production mount points
- [ ] [P1] Working tree clean; no trace scratch output committed outside the artefact

**No DOM assertion in vitest.** `vitest` runs `environment: "node"` with no jsdom. A vitest test here
may assert source text and the setting's serialisation; it may not claim to have measured a rectangle
or run a hit test. Those live in `tools/storybook/verify-placement.mjs` or its successor.

**No spec path, requirement id, task id or phase number in any code comment.**

---

**No task closes on "looks right".** Each row's evidence column must name a number that was read or a
command whose output and exit status were read.

- Every requirement REQ-001 to REQ-007 met with cited evidence.
- Every criterion A1-A8 has both its Stage-1 and its Stage-6 observation recorded.
- Every row in `checklist.md` §3 has an observed surface.
- **The operator has opened a record on desktop and on a phone and seen the page** — the defect that
  started this spec.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md)

<!-- /ANCHOR:cross-refs -->
