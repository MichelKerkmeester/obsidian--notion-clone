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
- [ ] **T2** Re-run the blind-set inventory on the current tree — REQ-005.
      *Evidence to close:* the module list and its count, produced by `plan.md` §3's command, read
      from output rather than from `spec.md`'s table. If it no longer reads 13, `spec.md` §3 is
      corrected before anything is built on it.
- [ ] **T3** Read the story check's current exit code — REQ-001.
      *Evidence to close:* `node tools/storybook/story-coverage.mjs; echo $?` reports 1, and the
      named module is `src/views/checkbox.ts`. This is the baseline every later claim is measured
      against.
- [ ] **T4** Grep both script names across the repository before renaming either — REQ-003, R-003.
      *Evidence to close:* `rg -n 'story:coverage|storybook:coverage'` over the tree, with every hit
      accounted for. The gate is the only expected consumer; an unexpected one changes the plan.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Wiring

- [ ] **T5** Add a gate lane that runs `story-coverage.mjs` — REQ-001.
      *Evidence to close:* `npm run gate` shows the lane, and it is **red**, naming `checkbox.ts`.
      A first run that is green means the lane is not running what it claims.
- [ ] **T6** Give the shim check a lane name that describes it — REQ-002.
      *Evidence to close:* the lane running `verify-coverage.mjs` no longer carries a name containing
      "story", and it still exits 0.
- [ ] **T7** Disambiguate the two `package.json` script names — REQ-003.
      *Evidence to close:* the two names can no longer be confused by a reader who is not looking
      carefully, and T4's hit list has been updated at every site.
- [ ] **T8** Resolve `src/views/checkbox.ts` — REQ-004.
      *Evidence to close:* either a `checkbox.stories.ts` that renders under the catalogue stub, or
      an allowlist entry naming the specific dependency that prevents one. It is the control at the
      centre of `004`'s checkbox-ownership work, so an exemption here needs a stronger reason than
      most. Whether it renders standalone under the stub has not been checked; check before deciding.

### Widening

- [ ] **T9** Replace the name-and-parameter test with the parameter test alone — REQ-005.
      *Evidence to close:* the `EXPORTED` regex matches any `export function`, and the existing
      `HTMLElement` / `parent`-options logic is unchanged beneath it.
- [x] **T10** **Run the negative control** — REQ-007. The task this phase can most easily skip.
      *Closed by running it literally.* The tree as received was reconstructed with `git archive`
      from the commit before this phase opened, and both matchers were run against it. The narrow one
      names 1 missing module; the widened one names 14, and the 13 it adds are C7's thirteen exactly.
      The widened matcher therefore reports thirteen modules the narrow one could not see on the same
      tree, which is the thing the requirement asked to be shown rather than asserted.
- [ ] **T11** Confirm the exclusion the old comment protected still holds — REQ-008.
      *Evidence to close:* `createStarterViewConfig` and its kind are absent from the renderable set,
      excluded by the parameter test rather than by their names. The original comment names this case
      specifically; a widening that reintroduces it has traded one defect for another.
- [ ] **T12** Confirm the stale and unreasoned allowlist checks still fire — REQ-009.
      *Evidence to close:* seed a stale entry, read exit 1, remove it. Both checks are the reason the
      allowlist is trustworthy at all, and a widened matcher changes the set they run over.

### Discharge

Each of the following closes with a story or with a reasoned exemption, argued on its own merits.
Batching them is how the allowlist becomes the document instead of the exception.

- [ ] **T13** `mobile-bottom-sheet.ts` — REQ-006. Resist exemption hardest here.
      *Evidence to close:* it exports `applySheetChrome` and `attachSheetDragToDismiss`, and its
      private `setScrim` builds the scrim that `003` made modal. Phases `003`, `012`, `016`, `020`
      and `021` all edited this surface and the catalogue has never held a frame of it.
- [ ] **T14** `popover-position.ts` — REQ-006. Resist exemption hardest here too.
      *Evidence to close:* it exports `setPosition`, whose border-box/padding-box conversion defect
      `021` measured and left open. A story is how that defect becomes visible to someone who has not
      read `021`.
- [ ] **T15** The remaining painting modules — REQ-006: `bulk-edit-field-menu.ts`,
      `option-color-picker.ts`, `field-tooltip.ts`, `drag-drop-feedback.ts`, `hover-link-preview.ts`.
      *Evidence to close:* a story each, or a reason each naming the specific dependency that blocks
      one.
- [ ] **T16** The behaviour-attaching modules — REQ-006, and `spec.md` §12's second open question:
      `interaction-scope.ts`, `card-roving-tabindex.ts`, `table-cell-gesture.ts`,
      `calendar-keyboard-navigation.ts`, `table-record-peek.ts`, `database-viewport.ts`.
      *Evidence to close:* the open question answered first, then the answer applied uniformly. These
      attach behaviour to an element that already exists, so a story would demonstrate an interaction
      rather than an appearance. Both answers are defensible; applying different answers to different
      modules in this group is not.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

- [ ] **T17** Run `node tools/storybook/story-coverage.mjs` from the final state and read its exit
      code without a pipe — C3.
- [ ] **T18** Run `npm run gate` from the final state; confirm exit 0 with both coverage lanes
      present and distinctly named — C1, C2, C4.
- [ ] **T19** Record the renderable count and the discharged count — C5, C6.
      *Evidence to close:* `--json` output showing at least 31 modules considered, and zero with
      neither a story nor an allowlist entry.
- [ ] **T20** Read back every allowlist entry added by this phase against the seven that were already
      there — TASK-EXEMPT.
      *Evidence to close:* each new reason names a specific dependency, in the manner of "resolves
      notes through the vault" or "delegates to `MarkdownRenderer`, which has no standalone build".
      An entry that would survive being pasted into any other module's row has not been argued.
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
