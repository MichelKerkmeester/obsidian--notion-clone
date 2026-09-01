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

- [ ] **T6** Implement the target resolver: setting × platform × record → surface — REQ-001.
      *Evidence to close:* Resolver returns each target for its inputs; no affordance calls it yet
- [ ] **T7** Add the setting to `PluginSettings`, absent meaning current behaviour — REQ-004.
      *Evidence to close:* Absent value produces today's surfaces; written value produces the chosen one
- [ ] **T8** Add the settings control beside the existing database-file toggles — REQ-004.
      *Evidence to close:* Control writes the value; `saveSettings` observed
- [ ] **T9** Build the target surface so it contains the note's rendered body — REQ-002, REQ-003.
      *Evidence to close:* Seeded body's heading and paragraph text present in the surface; it is a leaf or a `Modal`

### Stage 4 — route everything

- [ ] **T10** Route all 20 affordances through the resolver in one pass — REQ-001.
      *Evidence to close:* Trace re-run: 0 affordances produce a surface other than the configured target
- [ ] **T11** Retire the hardcoded touch branch at `database-view.ts:8425` — REQ-001.
      *Evidence to close:* Desktop and touch both resolve through the setting; no `isTouchDevice` branch decides the surface
- [ ] **T12** Give `Mod+Enter` the same resolution as the button — REQ-001.
      *Evidence to close:* Both produce the same surface on the same device
- [ ] **T13** Move `getLeaf(false)` under the resolver without touching the database-file opens — REQ-007.
      *Evidence to close:* Record opens honour the setting; `main.ts:689-724` behaviour unchanged, asserted
- [ ] **T14** Ensure the surface survives a view re-render — REQ-003.
      *Evidence to close:* After a field commit, `elementFromPoint` at the surface centre returns a node inside it

### Stage 5 — retire the peek

- [ ] **T15** Delete `table-record-peek.ts` and its 15 CSS rules, or reduce it to the resolver's preview mode — REQ-006.
      *Evidence to close:* Every affordance driven and the surface it produced recorded, with 0
      producing a surface other than the configured target; T4's archive cited per deletion.
      **Blocked until AC-002, AC-003, AC-007, AC-009 and AC-012 hold the peek's *before* numbers** —
      once the module is gone there is nothing left to measure them against
- [ ] **T16** Replace the literal `z-index: 998` with a declared tier — re-resolve both with
      `rg -n -A20 '^\.note-database-container \.db-record-peek-panel \{' styles.css` and
      `rg -n 'db-layer-' styles.css` rather than by line number — REQ-006.
      *Evidence to close:* A dropdown opened from inside the surface wins the hit test over it, read
      on a harness page that **has** `styles.css` loaded — on a page without it no z-index applies to
      anything and the result is unrelated to the defect. Record the computed winner for every
      selector that sat between the two values

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

Stage 6 — prove it.

- [ ] **T17** Re-run the trace unchanged — REQ-001-REQ-007.
      *Evidence to close:* Stage 6 artefact; every criterion is a delta against Stage 1
- [ ] **T18** Setting round-trip across a plugin reload — REQ-004.
      *Evidence to close:* Written value equals read-back value
- [ ] **T19** Phone height check on a 402px profile — REQ-005.
      *Evidence to close:* Surface height ≥ 50% of viewport; number recorded
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
