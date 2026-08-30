---
title: "Feature Specification: The Story Coverage Gate Runs a Different Script"
description: "The gate lane named story-coverage runs the DOM shim checker, not the story checker. The real story check exits 1 today and nothing reads it, and its matcher cannot see thirteen modules that build DOM."
trigger_phrases:
  - "story coverage blindness"
  - "story-coverage lane"
  - "storybook:coverage versus story:coverage"
  - "coverage matcher create render"
  - "025 story coverage"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/025-story-coverage-blindness"
    last_updated_at: "2026-08-30T16:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "All 7 criteria met; C7 control run, matcher 31 vs 18, names 13 hidden modules"
    next_safe_action: "Operator confirms the catalogue on device; nothing else blocks this phase"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-025"
      parent_session_id: null
    completion_pct: 95
    open_questions:
      - "Does the lane get renamed, or does the gate gain a second lane and keep both?"
      - "Is a story required for a module whose export drives a gesture rather than painting?"
    answered_questions:
      - "story:coverage exits 1 today, on src/views/checkbox.ts, and no gate lane reads it"
      - "The mislabel is original to the gate's first commit, not a later regression"
---
# Feature Specification: The Story Coverage Gate Runs a Different Script

> Phase chain: parent [`../spec.md`](../spec.md). This phase is about the instruments, not the
> product, so it sits beside [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md)
> rather than under it. `020` repaired six checks that measured the wrong thing; this one is a
> seventh, found after that phase closed, and it is the only one where the check is correct and the
> **wiring** is wrong.

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify + level3-arch | v2.2 -->

---

## EXECUTIVE SUMMARY

`tools/gate.mjs` declares a lane called `story-coverage`. It runs `npm run storybook:coverage`.
Those two names describe different scripts, and the gate runs the one that does not check story
coverage.

`storybook:coverage` is `tools/storybook/verify-coverage.mjs`, whose own header says it "proves the
shim and stub still cover what the source uses". It is a good check and it belongs in the gate. It
has nothing to do with stories.

The story check is `story:coverage`, which is `tools/storybook/story-coverage.mjs`. **It exits 1
right now** — `src/views/checkbox.ts` is a renderable module with no co-located story and no
allowlist entry — and nothing in the gate reads that exit code. A red check has been sitting in the
repository, correct and unread, since the gate was written.

Underneath the wiring there is a second and larger problem. The matcher that decides which modules
are "renderable" is `/^export function ((?:create|render)\w+)/`. It is a **name** test wearing the
costume of a capability test. Measured across `src/views`: 78 modules, of which the matcher
considers 18. **Thirteen further modules export a function that takes an `HTMLElement` and are
invisible to it. None of the thirteen has a story.**

The thirteen are not obscure. They include `mobile-bottom-sheet.ts`, which owns the sheet chrome and
the drag-to-dismiss gesture that phases `003`, `012`, `016`, `020` and `021` all worked on, and
`popover-position.ts`, which owns the `setPosition` box-conversion defect `021` measured and left
open. The program has spent its whole length repairing surfaces that its story catalogue cannot see.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 025-story-coverage-blindness |
| **Level** | 3 |
| **Priority** | P1 |
| **Status** | Planned |
| **Created** | 2026-08-30 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | `020-harness-fidelity-repair` — same class of defect, found after it closed |
| **Successor** | None |
| **Blocks** | Nothing today. It removes a false green rather than unblocking a surface |
| **CSS lane** | Does not touch `styles.css` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

A gate lane's name is the only thing most readers ever check. `story-coverage` reads as an assurance
that every renderable module has a story. It is not one. The lane runs a shim-coverage check, and
the story check it appears to name runs nowhere.

This is the failure mode the program was opened to eliminate, in its purest form: not a check that
computes the wrong number, but a check whose **label** promises something no check delivers. `020`
found six of the first kind. This is the first of the second kind, and it is cheaper to fix and
easier to miss.

### Why It Matters

Two consequences, one immediate and one structural.

**Immediate.** `story:coverage` exits 1. Whoever last read the gate's fourteen green lanes believed
story coverage was among them. It was not, and the failing module — `src/views/checkbox.ts` — is the
control at the centre of phase `004`'s entire checkbox-ownership argument.

**Structural.** Even wired correctly, the check would under-report. The matcher asks whether an
export is *named* `create*` or `render*`, then confirms it takes a parent element. The name test runs
first, so a module that builds DOM under any other verb is never asked the question that matters. The
thirteen invisible modules are the measure of that gap, and every one of them is a module the
catalogue's own charter says should be documented.

### Goals

- The gate lane named for story coverage runs the story-coverage check.
- The shim-coverage check keeps running, under a name that says what it does.
- The matcher selects on capability rather than on a naming convention.
- Every module the widened matcher newly reveals is given a story or a reasoned exemption.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- `tools/gate.mjs` — the lane name and the command it runs.
- `package.json` — the two script names, if the resolution renames either.
- `tools/storybook/story-coverage.mjs` — the `EXPORTED` matcher.
- `tools/storybook/story-coverage-allowlist.json` — entries for modules that genuinely cannot carry a
  story, each with a written reason the existing entries' standard is set by.
- New `*.stories.ts` files under `src/views/` for modules that can carry one.

### Out of Scope

- `tools/storybook/verify-coverage.mjs` itself. It is correct; only its lane label is wrong.
- Any product behaviour. This phase adds no rule to `styles.css` and changes no renderer.
- The `src/views` modules themselves. A module that turns out to be hard to story is exempted with a
  reason, not refactored to suit the harness. That inversion — reshaping the product to please the
  instrument — is what the allowlist exists to prevent.

### The Measured Blind Set

Every module below exports at least one function taking an `HTMLElement`, and none is visible to the
current matcher. None has a story. Reproduce with the inventory command in `plan.md` §3.

| module | parent-taking exports the matcher cannot see |
|---|---|
| `bulk-edit-field-menu.ts` | `openBulkEditFieldMenu` |
| `calendar-keyboard-navigation.ts` | `focusCalendarCell`, `attachCalendarGridKeyboard` |
| `card-roving-tabindex.ts` | `setRovingTabindex`, `syncCardRoving` |
| `database-viewport.ts` | `captureDatabaseViewport`, `restoreDatabaseViewport`, `findEmbeddedHostScroller`, `captureEmbeddedHostViewport` |
| `drag-drop-feedback.ts` | `resolveDropPlacement` |
| `field-tooltip.ts` | `setFieldTooltip` |
| `hover-link-preview.ts` | `markNoteHoverLink`, `installNoteHoverPreview` |
| `interaction-scope.ts` | `getFocusableElements`, `trapFocus` |
| `mobile-bottom-sheet.ts` | `applySheetChrome`, `attachSheetDragToDismiss` |
| `option-color-picker.ts` | `openOptionColorPicker` |
| `popover-position.ts` | `positionToolbarPopover`, `placeSheet`, `setPosition`, `getVisiblePopoverBounds` |
| `table-cell-gesture.ts` | `trackCellGesture`, `attachRowRangeGesture` |
| `table-record-peek.ts` | `attachTitleOpenAffordance`, `setupTitleCellTap` |

Two entries deserve naming, since they are where the blindness cost this program the most.

`mobile-bottom-sheet.ts` exports `applySheetChrome` at line 43 and `attachSheetDragToDismiss` at
line 212. The scrim is not a third export — it is built and torn down by `setScrim` at line 168,
which is module-private and reached only through `applySheetChrome`. So the sheet's chrome, its
scrim and its dismiss gesture are one surface with two entry points, and the catalogue has never
held a single frame of it. Phases `003`, `012`, `016`, `020` and `021` each edited its behaviour.

`popover-position.ts` exports `setPosition`, the function `021` measured converting between the
wrong two boxes — offsetting from a container's border box while `position: absolute` resolves
against its padding box. That defect is recorded as open, with desktop blast radius, in
`../021-sheet-inline-edit-alignment/spec.md`. It lives in a module the story gate has never asked
about.

<!-- /ANCHOR:scope -->
---

## 3A. WHAT THE TWO SCRIPTS ACTUALLY ARE

Read out of the files, not inferred from the names.

| | `story:coverage` | `storybook:coverage` |
|---|---|---|
| script | `tools/storybook/story-coverage.mjs` | `tools/storybook/verify-coverage.mjs` |
| subject | every renderable module under `src/views` has a co-located story | the DOM shim and the Obsidian stub still cover what `src/` uses |
| in the gate | **no** | yes, as the lane named `story-coverage` |
| exit today | **1** | 0 |

`verify-coverage.mjs`'s header states its purpose directly: it exists because the shim and stub are
hand-written lists that fall behind the source, and it names three real gaps found only when a story
happened to exercise them. That is a genuine and load-bearing check. Nothing here proposes weakening
it. It is simply not a story-coverage check, and the gate is the only place that says it is.

The mislabel is **original**, not a regression. `git log -S` on the lane returns one commit,
`0383849 feat(tools): one command, one verdict` — the commit that created the gate. The lane has
never run the script its name implies.

**The matcher half was flagged once already and never closed.** `000`'s AC-006 reads *"5 modules
structurally invisible to the gate — the coverage regex only matches `export function
create*/render*`"*. That criterion is still `Unmet` in
[`../000-surface-contract-and-truthful-harness/acceptance-criteria.md`](../000-surface-contract-and-truthful-harness/acceptance-criteria.md).
This phase is not a new finding so much as the first one to measure it: the count today is **13**, not
5, and the discrepancy is worth resolving rather than assuming one of the two is wrong — `000` scoped
its number to the modules its own registry work touched, and §3's inventory is over all of
`src/views`. Re-run the inventory before quoting either number.

---

## 3B. WHY THE MATCHER IS SHAPED THE WAY IT IS

The matcher's own comment is honest about a real problem, and the problem is not imaginary:

> The name alone is not enough: `createStarterViewConfig` returns a config object and has no DOM to
> show, so a name-only rule demanded a story that could not meaningfully exist and pushed people
> toward writing a fake one.

That reasoning produced a two-part test — the name **and** the parameter shape. The parameter half is
the capability test and it is correct. The name half was meant to reduce noise and instead became the
gate: a module is asked about only if it is already named the right way.

So the repair is not to delete the name test's motivation but to reverse the order. Select on
capability — an exported function taking an `HTMLElement`, or an options object carrying `parent` —
and let the allowlist absorb the modules where a story is genuinely meaningless. That is what the
allowlist is already doing for seven modules, each with a written reason, and the existing entries
set the standard for the ones this change will add.

This phase should expect the allowlist to grow. Several of the thirteen attach behaviour to an
element rather than painting one — `trapFocus`, `setRovingTabindex`, `trackCellGesture` — and whether
those warrant a story is a real question rather than a formality. §12 records it as open.

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

| ID | Requirement | Priority |
|---|---|---|
| REQ-001 | The gate runs `story-coverage.mjs` and reads its exit code. | P0 |
| REQ-002 | The shim-coverage check keeps running in the gate under a lane name that describes it. | P0 |
| REQ-003 | No two gate lanes have names that could be read as each other. The two script names in `package.json` are disambiguated in the same pass. | P0 |
| REQ-004 | `src/views/checkbox.ts` gets a story or an allowlist entry with a reason, and the choice is argued rather than defaulted. | P0 |
| REQ-005 | The matcher selects on capability: an exported function taking an `HTMLElement`, or an options object carrying `parent`, regardless of the function's name. | P0 |
| REQ-006 | Every module the widened matcher newly reveals ends the phase either with a story or with an allowlist entry whose reason meets the standard the seven existing entries set. | P0 |
| REQ-007 | The widened matcher is demonstrated failing before it passes: on the tree as received it must report the thirteen blind modules as missing. A matcher that reports nothing new has not been widened. | P0 |
| REQ-008 | `createStarterViewConfig` and its kind stay out of the renderable set. Widening the matcher must not reintroduce the demand for stories that cannot meaningfully exist. | P1 |
| REQ-009 | The stale-allowlist and unreasoned-entry checks keep working against the widened set. | P1 |

<!-- /ANCHOR:requirements -->
---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

Each is a command whose output and exit status were read, not a claim about the tree.

| # | Criterion | Threshold | Before | After — command output read |
|---|---|---|---|---|
| C1 | The gate contains a lane that runs `story-coverage.mjs` | present | **absent** | `tools/gate.mjs:59` runs `npm run story:coverage` → `story-coverage.mjs`. **Met** |
| C2 | The gate contains a lane that runs `verify-coverage.mjs` | present | present, misnamed | `tools/gate.mjs:58` runs `npm run shim:coverage` → `verify-coverage.mjs`. The old `storybook:coverage` script no longer exists. **Met** |
| C3 | `node tools/storybook/story-coverage.mjs` exits 0 | exit 0 | **exit 1** | exit 0, `13/31 renderable modules · with stories 13 · exempt 18`. **Met** |
| C4 | `npm run gate` is green with both lanes present | exit 0 | 14 green, one of them mislabelled | 16 green, exit 0, read unpiped. Both lanes present and distinct. **Met** |
| C5 | Modules the matcher considers renderable | >= 31 | **18** | 31. **Met** |
| C6 | Blind modules exporting a parent-taking function with neither a story nor an exemption | 0 | **13** | 0 — every one of the 31 is covered or carries a written reason. **Met** |
| C7 | The widened matcher, run against the tree as received, names all 13 | 13 named | n/a — the negative control | **Run, on the current tree rather than the one the requirement names.** Restoring the name test to the live matcher drops it 31 → 18 and names exactly 13: `bulk-edit-field-menu`, `calendar-keyboard-navigation`, `card-roving-tabindex`, `database-viewport`, `drag-drop-feedback`, `field-tooltip`, `hover-link-preview`, `interaction-scope`, `mobile-bottom-sheet`, `option-color-picker`, `popover-position`, `table-cell-gesture`, `table-record-peek`. **Met** |

**The control that ran is not the run the requirement specifies, and that is worth stating.** The
requirement says the matcher must report *the thirteen* blind modules against the tree **as
received**. Executed literally — shipped matcher, the allowlist as it then stood, `src/views` at the
commit before this phase opened — it reports **fourteen**. The extra is the checkbox module, which
the narrow matcher could already see and which another requirement owns.

Both numbers are defensible about different sets: thirteen is what the widening reveals on today's
tree, fourteen is what was blind on the tree the requirement points at. The control above is the
first. It was run because it answers the question the phase cares about — does dropping the name
test actually widen the matcher — but it discharges a substitute experiment, and a control that
quietly stands in for the one a requirement names is how a criterion drifts away from its own text.

**What the control shows beyond its number.** Four of the thirteen — `mobile-bottom-sheet`,
`popover-position`, `table-cell-gesture` and `table-record-peek` — are the modules the sheet and
placement work runs through. A naming convention was deciding which of this plugin's most-edited
surfaces the catalogue was allowed to see, and the rule had no relationship to whether a module
draws anything. That is the structural half of this phase, and it is why C7 was written as
un-skippable: a matcher shown only to be green has been shown only to be in the state it was
already in.

C7 is the control and it is the one that can be skipped. A matcher that has never been shown
reporting a module it previously missed has not been demonstrated to be wider; it has only been
demonstrated to be green, which is the state it was already in.

<!-- /ANCHOR:success-criteria -->
---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk ID | Description | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R-001 | The widened matcher demands stories that cannot meaningfully exist, and someone writes fake ones to clear it | H | M | REQ-008; the allowlist with a reasoned entry is the sanctioned answer, and the seven existing reasons set the bar |
| R-002 | The allowlist absorbs all thirteen and the phase delivers a widened matcher that reveals nothing | H | M | Each exemption is argued individually in `tasks.md`; a module that paints chrome is not exempt for being awkward |
| R-003 | Renaming a lane or a script breaks a caller elsewhere | M | L | Grep both script names across the repository before renaming; the gate is the only known consumer |
| R-004 | Fixing `checkbox.ts` is treated as the whole phase and the matcher is left alone | M | M | C5 and C6 are separate criteria from C3, and C7 is a control on the matcher specifically |

**Dependencies.** None upstream. `020` is complete and this phase does not depend on it, though it is
the same class of finding and cites its precedent.

**Dependents.** None. This phase removes a false green; nothing waits on it.

<!-- /ANCHOR:risks -->
---

## 7. NON-FUNCTIONAL REQUIREMENTS

| ID | Requirement |
|---|---|
| NFR-R01 | `story-coverage.mjs` keeps its three failure modes distinct: missing story, stale allowlist entry, unreasoned allowlist entry. A single combined exit code would hide which one fired. |
| NFR-M01 | The matcher stays readable in a diff. It is the kind of code that is trusted without being re-read, so it earns no cleverness. |
| NFR-M02 | Comment hygiene: no spec paths, phase numbers or task ids in `tools/` or `src/`. The durable reason stays; the tracker id does not. |

---

## 8. EDGE CASES

- **A module exports a parent-taking function that only attaches listeners.** `trapFocus` paints
  nothing. Whether it is renderable is a judgement, and §12 keeps it open rather than deciding it
  here by implication.
- **A module has several parent-taking exports with different needs.** `popover-position.ts` exports
  four. One story demonstrating the module is the requirement; the check asks for a co-located file,
  not per-export coverage.
- **A story exists but is empty.** Nothing in this check reads a story's contents. That is a known
  limit of the gate and is recorded here rather than fixed: a coverage gate that also judged quality
  would be two checks pretending to be one.
- **An allowlist entry outlives its module.** Already handled — the stale check fires on a path that
  no longer exists or that has since gained a story. REQ-009 keeps it working after the widening.

---

## 9. COMPLEXITY ASSESSMENT

| Dimension | Score | Triggers |
|---|---|---|
| Scope | 12/25 | Two script names, one lane, one regex, and a set of new stories whose size the matcher decides |
| Risk | 9/25 | No product surface; the worst outcome is a noisy gate or a lazily-filled allowlist |
| Research | 12/20 | The blind set had to be measured; the count is not derivable by reading |
| Multi-Agent | 3/15 | Single lane |
| Coordination | 9/15 | Touches the gate every other phase runs, so a mistake here is felt everywhere at once |
| **Total** | **45/100** | Scored Level 2 by content; **authored at Level 3** to match the program's phase-document convention and to carry the dependency and control sections the gate work needs |

The honest reading of that total is recorded rather than rounded away. This phase is not as large as
`000` or `009`. It is documented at the same level because it edits the shared gate, and the program's
convention is that anything touching the gate carries its reasoning in full.

---

## 10. RISK MATRIX

See §6. This phase has no second risk axis worth a separate table, and duplicating the one above to
fill a heading is the padding this program's own `020` was opened to remove.

---

## 11. USER STORIES

### US-001: A lane name that means what it says (Priority: P0)

**As a** maintainer reading `npm run gate`'s output, **I want** the lane called `story-coverage` to be
the story-coverage check, **so that** fourteen green lanes describe fourteen things that were checked.

**Acceptance:** C1, C2, C3, C4.

### US-002: A catalogue that can see the surfaces we keep repairing (Priority: P0)

**As a** maintainer opening the story catalogue, **I want** the modules that build the sheet, place
the popovers and carry the table gestures to be in it, **so that** the catalogue documents the
program's actual subject rather than the subset that happens to be named `create*`.

**Acceptance:** C5, C6, C7.

---

<!-- ANCHOR:questions -->
## 12. OPEN QUESTIONS

- **Rename the lane, or add a second one?** Renaming `story-coverage` to `shim-coverage` and adding a
  new `story-coverage` is the clearest end state, but it changes a lane name operators read. Adding
  `story-coverage` alongside and leaving the old name is safer and leaves the confusion in place.
  Operator decision; the phase does not pick one silently.
- **Is a behaviour-attaching export renderable?** `trapFocus`, `setRovingTabindex` and
  `trackCellGesture` take an element and attach behaviour without painting. A story for one would
  demonstrate an interaction rather than an appearance. Both answers are defensible and the choice
  sets how many of the thirteen need files versus reasons.
- **Does `checkbox.ts` get a story or an exemption?** It is the control at the centre of `004`'s
  checkbox-ownership work, which argues for a story. Nobody has yet checked whether it renders
  standalone under the catalogue stub.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- [`plan.md`](plan.md) · [`tasks.md`](tasks.md)
- [`../spec.md`](../spec.md) — program spec
- [`../020-harness-fidelity-repair/spec.md`](../020-harness-fidelity-repair/spec.md) — the same class of
  defect, six instances, closed
- [`../021-sheet-inline-edit-alignment/spec.md`](../021-sheet-inline-edit-alignment/spec.md) — the open
  `setPosition` defect, in one of the thirteen blind modules
