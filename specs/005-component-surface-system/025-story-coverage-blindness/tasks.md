---
title: "Task Breakdown: The Story Coverage Gate Runs a Different Script"
description: "One task per requirement. Nothing is started; every box is open."
trigger_phrases:
  - "025 story coverage tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: The Story Coverage Gate Runs a Different Script

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

**Reconciled against evidence on 2026-09-02: 16 ticked with citations (T10 was already ticked),
5 left open (0 not done by decision, 1 operator-owned, rest unfound).**

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**Nothing in this phase has started.** Every box below is open, and none should be closed before the
work behind it is done — a checked box here would make this packet owe an implementation summary for
work nobody did.

**No task closes on "the file was edited".** Each task's evidence names a command whose output and
exit status were read, without a pipe.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP

- [ ] **T1** Get the lane-naming decision from the operator — `spec.md` §12.
      *Evidence to close:* a recorded answer to whether `story-coverage` is renamed to
      `shim-coverage` with a new lane taking its name, or a second lane is added and the old name
      left alone. Both are defensible; proceeding without one means picking silently.
- [x] **T2** Re-run the blind-set inventory on the current tree — REQ-005.
      *Evidence to close:* the module list and its count, produced by `plan.md` §3's command, read
      from output rather than from `spec.md`'s table. If it no longer reads 13, `spec.md` §3 is
      corrected before anything is built on it.
      **Evidence:** re-run and read from output, not from a table — `goal.md`'s ticked control row
      carries the matcher comparison on the tree as received: narrow **18 renderable / 1 missing**,
      widened **31 renderable / 14 missing**, difference **13**, *"C7's thirteen with nothing left
      over"*. Re-read 2026-09-02 from the current tree:
      `node tools/storybook/story-coverage.mjs --json` reports
      `covered: 13, exempt: 19, missing: 0, stale: 0, unreasoned: 0` over **32** renderable
      modules, exit 0 read directly.
- [x] **T3** Read the story check's current exit code — REQ-001.
      *Evidence to close:* `node tools/storybook/story-coverage.mjs; echo $?` reports 1, and the
      named module is `src/views/checkbox.ts`. This is the baseline every later claim is measured
      against.
      **Evidence:** the baseline is recorded on `goal.md`'s ticked rows — the script *"exited 1"*,
      and the narrow matcher on that tree *"names exactly one blind module, `checkbox`"*. That 1 is
      named there as **the failing value this phase moved**. Today the same command exits **0**
      (re-run 2026-09-02, read without a pipe).
- [ ] **T4** Grep both script names across the repository before renaming either — REQ-003, R-003.
      *Evidence to close:* `rg -n 'story:coverage|storybook:coverage'` over the tree, with every hit
      accounted for. The gate is the only expected consumer; an unexpected one changes the plan.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Wiring

- [x] **T5** Add a gate lane that runs `story-coverage.mjs` — REQ-001.
      *Evidence to close:* `npm run gate` shows the lane, and it is **red**, naming `checkbox.ts`.
      A first run that is green means the lane is not running what it claims.
      **Evidence:** `tools/gate.mjs:62` `{ name: "story-coverage", cmd: ["npm", "run",
      "story:coverage"] }`, resolving to `tools/storybook/story-coverage.mjs`
      (`package.json:20`). The red-first condition is the baseline above: the script exited **1**
      naming `checkbox.ts` before the module was discharged. `npm run gate` re-run 2026-09-02
      lists the lane green, `gate: PASS — 25 green`, **exit 0** read directly.
- [x] **T6** Give the shim check a lane name that describes it — REQ-002.
      *Evidence to close:* the lane running `verify-coverage.mjs` no longer carries a name containing
      "story", and it still exits 0.
      **Evidence:** `tools/gate.mjs:61` `{ name: "shim-coverage", cmd: ["npm", "run",
      "shim:coverage"] }` -> `tools/storybook/verify-coverage.mjs` (`package.json:22`). The name
      carries no "story", and the lane reported green in the 2026-09-02 gate run.
- [ ] **T7** Disambiguate the two `package.json` script names — REQ-003.
      *Evidence to close:* the two names can no longer be confused by a reader who is not looking
      carefully, and T4's hit list has been updated at every site.
      **2026-09-02 — half done, and the half that is missing is a live defect.** The rename landed:
      `package.json:20` `"story:coverage"` and `:22` `"shim:coverage"`, with the local consumers
      updated at `tools/gate.mjs:61-62`, `tools/live/design-conformance.mjs:243` and
      `STORYBOOK.md:52`/`:66`. **But one site was missed:**
      `.github/workflows/gates.yml:64` still runs `npm run storybook:coverage`, a script
      `package.json` no longer defines — so the CI step named *"Shim and stub cover the source"*
      invokes a name that does not exist. `npm run gate` cannot see it, because the gate calls the
      new names directly. This row stays open until that site is updated; the fix is outside this
      packet's tasks.md scope and is reported rather than made.
- [x] **T8** Resolve `src/views/checkbox.ts` — REQ-004.
      *Evidence to close:* either a `checkbox.stories.ts` that renders under the catalogue stub, or
      an allowlist entry naming the specific dependency that prevents one. It is the control at the
      centre of `004`'s checkbox-ownership work, so an exemption here needs a stronger reason than
      most. Whether it renders standalone under the stub has not been checked; check before deciding.
      **Evidence:** resolved the harder way — `src/views/checkbox.stories.ts` exists, and
      `story-coverage --json` lists `checkbox.ts` under `covered`, not under `exempt`. Ticked on
      `goal.md`: *"The checkbox module — another phase's central control — has a story, not an
      exemption."*

### Widening

- [x] **T9** Replace the name-and-parameter test with the parameter test alone — REQ-005.
      *Evidence to close:* the `EXPORTED` regex matches any `export function`, and the existing
      `HTMLElement` / `parent`-options logic is unchanged beneath it.
      **Evidence:** `tools/storybook/story-coverage.mjs:47`
      `const EXPORTED = /^export function (\w+)\s*\(([^)]*)/gms` — no name pattern — with the
      parameter test unchanged beneath at `:50-57` (`params.includes("HTMLElement")`, then the
      `\w+Options` interface carrying `parent`). The reason the name test went is recorded in the
      comment above it at `:43-45`.
- [x] **T10** **Run the negative control** — REQ-007. The task this phase can most easily skip.
      *Closed by running it literally.* The tree as received was reconstructed with `git archive`
      from the commit before this phase opened, and both matchers were run against it. The narrow one
      names 1 missing module; the widened one names 14, and the 13 it adds are C7's thirteen exactly.
      The widened matcher therefore reports thirteen modules the narrow one could not see on the same
      tree, which is the thing the requirement asked to be shown rather than asserted.
- [x] **T11** Confirm the exclusion the old comment protected still holds — REQ-008.
      *Evidence to close:* `createStarterViewConfig` and its kind are absent from the renderable set,
      excluded by the parameter test rather than by their names. The original comment names this case
      specifically; a widening that reintroduces it has traded one defect for another.
      **Evidence:** `story-coverage --json` (2026-09-02) lists 32 renderable modules across
      `covered` and `exempt`, and **no view-config module is among them** — the exclusion now
      comes from `isRenderable`'s parameter test (`story-coverage.mjs:49-58`), which asks what a
      function takes rather than what it is called. Ticked on `goal.md`: *"A config-returning
      function stays out: no view-config module is among the 31."*
- [ ] **T12** Confirm the stale and unreasoned allowlist checks still fire — REQ-009.
      *Evidence to close:* seed a stale entry, read exit 1, remove it. Both checks are the reason the
      allowlist is trustworthy at all, and a widened matcher changes the set they run over.

### Discharge

Each of the following closes with a story or with a reasoned exemption, argued on its own merits.
Batching them is how the allowlist becomes the document instead of the exception.

- [x] **T13** `mobile-bottom-sheet.ts` — REQ-006. Resist exemption hardest here.
      *Evidence to close:* it exports `applySheetChrome` and `attachSheetDragToDismiss`, and its
      private `setScrim` builds the scrim that `003` made modal. Phases `003`, `012`, `016`, `020`
      and `021` all edited this surface and the catalogue has never held a frame of it.
      **Evidence:** discharged with a story, not an exemption —
      `src/views/mobile-bottom-sheet.stories.ts` exists and `story-coverage --json` lists
      `mobile-bottom-sheet.ts` under `covered`.
- [x] **T14** `popover-position.ts` — REQ-006. Resist exemption hardest here too.
      *Evidence to close:* it exports `setPosition`, whose border-box/padding-box conversion defect
      `021` measured and left open. A story is how that defect becomes visible to someone who has not
      read `021`.
      **Evidence:** discharged with a story, not an exemption —
      `src/views/popover-position.stories.ts` exists and `story-coverage --json` lists
      `popover-position.ts` under `covered`.
- [x] **T15** The remaining painting modules — REQ-006: `bulk-edit-field-menu.ts`,
      `option-color-picker.ts`, `field-tooltip.ts`, `drag-drop-feedback.ts`, `hover-link-preview.ts`.
      *Evidence to close:* a story each, or a reason each naming the specific dependency that blocks
      one.
      **Evidence:** all five carry a reasoned exemption in
      `tools/storybook/story-coverage-allowlist.json`, each naming the dependency rather than the
      difficulty — `bulk-edit-field-menu` *"DatabaseView's active schema and bulk-edit
      transaction"*, `option-color-picker` *"the live popover positioner … Obsidian's
      document-level auto-close events"*, `field-tooltip` *"the browser's native title tooltip,
      which has no standalone painted surface"*, `drag-drop-feedback` *"a live DragEvent, target
      geometry and transaction state"*, `hover-link-preview` *"no workspace, vault or hover-popover
      lifecycle"*. All five appear under `exempt` in `story-coverage --json`, and `unreasoned: 0`.
- [x] **T16** The behaviour-attaching modules — REQ-006, and `spec.md` §12's second open question:
      `interaction-scope.ts`, `card-roving-tabindex.ts`, `table-cell-gesture.ts`,
      `calendar-keyboard-navigation.ts`, `table-record-peek.ts`, `database-viewport.ts`.
      *Evidence to close:* the open question answered first, then the answer applied uniformly. These
      attach behaviour to an element that already exists, so a story would demonstrate an interaction
      rather than an appearance. Both answers are defensible; applying different answers to different
      modules in this group is not.
      **Evidence:** the answer was *exempt*, and it is applied to all six without exception — each
      appears under `exempt` in `story-coverage --json`, and each entry in
      `tools/storybook/story-coverage-allowlist.json` gives the same shape of reason: the live
      owner a static story cannot supply (`interaction-scope` *"the modal ownership and focus
      lifecycle"*, `card-roving-tabindex` *"the board, gallery or list roving group"*,
      `table-cell-gesture` *"the table selection model those handlers mutate"*,
      `calendar-keyboard-navigation` *"the grid and focus model it is meant to exercise"*,
      `table-record-peek` *"the live record-peek lifecycle"*, `database-viewport` *"no host
      viewport lifecycle to exercise"*). No module in the group was given a story instead.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [x] **T17** Run `node tools/storybook/story-coverage.mjs` from the final state and read its exit
      code without a pipe — C3.
      **Evidence:** run 2026-09-02, redirected to a file rather than piped, exit read from `$?`:
      **exit 0**, output `story coverage: 13/32 renderable modules · with stories 13 · exempt 19`.
- [x] **T18** Run `npm run gate` from the final state; confirm exit 0 with both coverage lanes
      present and distinctly named — C1, C2, C4.
      **Evidence:** `npm run gate` re-run 2026-09-02: `gate: PASS — 25 green, 0 red for a declared
      reason`, **exit 0** read directly from `$?`. Both lanes are present and distinct in that
      output — `shim-coverage green` and `story-coverage green`. Ticked on `goal.md`, which records
      the figure on the day (**16 lanes, exit 0**) and notes the count moved to 25 because later
      phases added lanes.
- [x] **T19** Record the renderable count and the discharged count — C5, C6.
      *Evidence to close:* `--json` output showing at least 31 modules considered, and zero with
      neither a story nor an allowlist entry.
      **Evidence:** `node tools/storybook/story-coverage.mjs --json` (2026-09-02, exit 0):
      **32 modules considered** — `covered: 13`, `exempt: 19` — with **`missing: 0`**, plus
      `stale: 0` and `unreasoned: 0`. Ticked on `goal.md` criteria *"Modules the matcher considers
      renderable: 31, from 18"* and *"…with neither a story nor an exemption: 0, from 13"*; the
      renderable count has since moved 31 -> 32.
- [x] **T20** Read back every allowlist entry added by this phase against the seven that were already
      there — TASK-EXEMPT.
      *Evidence to close:* each new reason names a specific dependency, in the manner of "resolves
      notes through the vault" or "delegates to `MarkdownRenderer`, which has no standalone build".
      An entry that would survive being pasted into any other module's row has not been argued.
      **Evidence:** all 19 entries in `tools/storybook/story-coverage-allowlist.json` read back
      2026-09-02, and each names a dependency specific to its own module — not one would survive
      being pasted into another row. The two the row quotes as the standard are still there
      (`file-field-renderer`, `inline-markdown-renderer`), and the twelve added by this phase match
      them: a named caller state, a named host lifecycle, or a named Obsidian API with no
      standalone build. `story-coverage --json` reports `unreasoned: 0` and `stale: 0`.
- [ ] **T21** Confirm the working tree carries no stray files and no tracker ids reached `tools/` or
      `src/` — TASK-HYGIENE.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- A gate lane runs `story-coverage.mjs` and its exit code is read.
- A gate lane runs `verify-coverage.mjs` under a name that describes it.
- The two `package.json` script names cannot be read as each other.
- `story-coverage.mjs` exits 0, and it did so by the modules being discharged rather than by the
  check being narrowed.
- **The widened matcher was shown naming all 13 blind modules before any was discharged.**
- At least 31 modules are in the renderable set; none has neither a story nor a reasoned exemption.
- Every allowlist entry added names a specific dependency, held to the standard of the seven that
  were already there.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md)
- [`../spec.md`](../spec.md)
- [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md)
- [`../021-sheet-inline-edit-alignment/spec.md`](../021-sheet-inline-edit-alignment/spec.md)

<!-- /ANCHOR:cross-refs -->
