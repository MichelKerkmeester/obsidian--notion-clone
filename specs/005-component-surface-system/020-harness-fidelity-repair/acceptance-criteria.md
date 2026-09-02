---
title: "Acceptance Criteria: Harness Fidelity Repair"
description: "Ten criteria, each carrying the failing value measured before the work, the value after, and the file:line that verifies it. All met."
trigger_phrases:
  - "020 acceptance criteria"
  - "harness fidelity closure"
  - "band floor traceability"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/020-harness-fidelity-repair"
    last_updated_at: "2026-09-02T18:20:00Z"
    last_updated_by: "host-silent-check-verified"
    recent_action: "Host-silent check at :4097 observed red; three older checks red too"
    next_safe_action: "Decide whether the duplicate host-silent check at :4097 earns its place"
    blockers: []
    key_files:
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-020"
      parent_session_id: null
    completion_pct: 95
    open_questions:
      - "Which of the 63 lifted checks still measure a value the harness supplies"
    answered_questions:
      - "No AC-001..AC-012 row is false as worded; the overclaim was closure at 100"
---
# Acceptance Criteria: Harness Fidelity Repair

<!-- SPECKIT_TEMPLATE_SOURCE: acceptance-criteria | v2.2 -->

> Every row records the value measured on the tree **before** the work, the value after, and a
> `file:line` that verifies it.
>
> **A repair closes on its negative control, not on a green result.** Every instrument in this phase
> was already green before it started; green was the symptom. A row whose only evidence is that the
> check now passes would repeat the defect it claims to have fixed.

---

<!-- ANCHOR:metadata -->
## 1. METADATA

**Packet:** 020-harness-fidelity-repair
**Level:** 3
**Status:** Shipped + verified, awaiting device — 12 of 13 criteria
**Date:** 2026-08-30
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:criteria -->
## 2. CRITERIA

| AC-ID | REQ | Measurement | Threshold | Before | After | Verification | Status |
|---|---|---|---|---|---|---|---|
| AC-001 | REQ-001, REQ-002 | Add-view sheet grab band height, computed as `up + down + 1` | >= 44px | **42px true, reported 45px** by the double-counting form | **48px** | `tools/storybook/verify-placement.mjs:838` | Met |
| AC-002 | REQ-001, REQ-002 | Owned-menu sheet grab band height | >= 44px | **38px true; no check existed**, only a 41px figure in a comment | **44px** | `tools/storybook/verify-placement.mjs:829` | Met |
| AC-003 | REQ-001 | Record sheet grab band height, unchanged by this phase | >= 30px | 32px true, reported 35px | 32px | `styles.css:275` | Met |
| AC-004 | REQ-001 | Band steals no control and no row, asserted at **both** ends on both sheet surfaces | 0 rows answered by the band | unasserted — only the height was checked | 0 stolen | `tools/storybook/verify-placement.mjs:839` | Met |
| AC-005 | REQ-003, REQ-004 | Evidence artefacts dated against the inputs they were measured from, discovered by content and run as a gate lane | 8 of 8 fresh, lane present | **1 of 8**; the checker existed and nothing called it | 8 of 8; gate lanes 13 -> 14 | `tools/gate.mjs:52` | Met |
| AC-006 | REQ-003 | `checkbox-appearance.json` describes the tree it is committed against | equal to a re-run on the same tree | **171 checkboxes / 51 fixtures** against a re-run's 211 / 56, and the roadmap quoted the stale figure | 211 / 56 | `tools/live/checkbox-appearance.json:1` | Met |
| AC-007 | REQ-005 | A capture that is a single flat colour, or byte-identical across light and dark, is rejected | 0 accepted, 0 false positives across the set | **4 blank 80x64 transparent PNGs and 2 theme-identical pairs accepted** | 0 of 224, 0 false positives | `tools/screenshots/verify.mjs:186` | Met |
| AC-008 | REQ-006 | Checkbox families visible to the coverage collector, whose regex could not match a two-class `cls` value | 12 of 12 | **10 of 12**; `db-invalid-event-select` and `base-import-include-checkbox` dropped out and "0 uncovered" described ten families | 12 of 12, both with fixtures from the modals' real markup | `tools/screenshots/scenarios/panels.mjs:574`, `tools/screenshots/scenarios/panels.mjs:617` | Met |
| AC-009 | REQ-007 | The role-agreement check takes its expectation from the call site, proven by swapping a modal fixture's role from field to row | the swapped fixture fails | **passed 3/3** — the expectation was derived from the fixture being checked, so a fixture at the wrong role agreed with itself | fails, naming the source file and the role it asks for | `tools/live/checkbox-appearance.mjs:1` | Met |
| AC-010 | REQ-008 | `setCssProps` matches the shipped runtime, which calls `setProperty` and silently drops a camelCase key | 0 camelCase keys reaching it | **23 across 6 files**, all working in the harness and vanishing on a phone | 0; correcting the shim surfaced `inline=NaNpx` on the inline-cap check | `tools/storybook/obsidian-dom-shim.mjs:137` | Met |
| AC-011 | REQ-009 | Orphaned probe checks running inside the shared harness, with none weakened on the way in | all 63 | **0 of 63**; they lived in five files nothing re-ran | 63; placement 114 -> 177 checks | `tools/storybook/verify-placement.mjs:1888` | Met, **arrival only** — see §4 |
| AC-012 | REQ-010 | Every product defect the repaired instruments revealed is fixed here or recorded with its number and its owner | 0 dropped | n/a — the instruments could not reveal them | 1 handed to `022` with its number; 3 declared in `KNOWN` | `specs/005-component-surface-system/022-selection-bar-keyboard-docking/spec.md:1` | Met, **of what was revealed** — see §4 |

<!-- /ANCHOR:criteria -->

---

<!-- ANCHOR:closure -->
## 3. CLOSURE STATEMENT

**Closeable:** Not at 100. Twelve of twelve criteria are `Met` and none is withdrawn — every row is
true as worded, and §4 records why that is not the same as a harness this phase left truthful.

The criterion that carries the phase is AC-001. The add-view sheet reported 45px against its own 44px
floor and passed; corrected, it read 42px and went red **before any stylesheet edit**. Every other
repair follows the same pattern — an instrument that was green for a reason unrelated to what it was
named for — and each closes on a negative control rather than on the green result that followed.

### Decisions carried, not criteria

Two shortfalls are recorded here so they are not mistaken for unmet criteria. **Neither is a failure
of this phase and neither belongs in the table above**, because neither was a criterion this phase
had to meet.

| Item | Ask | Delivered | Disposition |
|---|---|---|---|
| Record sheet grab band | 48px | 32px | **Accepted** by the operator, with the constraint measured: the sheet has 33px of chrome above its header, so a taller band has nowhere to go without moving content |
| Table main-item cell | 44px (WCAG 2.5.5 AAA; 40px at the loosest density) | 169x34 | **Declined** by the operator on density grounds — raising it would override the reader's own density setting, which is a deliberate preference. The AA 24px floor is met |

Both remain visible rather than closed by silence: `verify-placement` reports the 33px reach of the
main-item cell on every run, and the record sheet's band is pinned at its current value so a change
would fail rather than drift.

### Handed on, not closed

`.db-selection-status-bar` clips its own content at 402px — 36px in a 28px box. Measured identically
with `position: fixed` and forced into flow, so it is shipped layout rather than a capture artefact.
It is `022`'s subject, recorded with its number.

The coverage repair in AC-008 closed the two-class regex and **not** the `create|render` name filter,
which leaves thirteen further modules invisible. That is `025`'s subject, and `000`'s AC-006 had
already flagged the same matcher.

### Outstanding for the operator

The two new modal fixtures have not had per-image sign-off.
<!-- /ANCHOR:closure -->

---

## 4. THE SUPPLY THIS PHASE DID NOT AUDIT

Asked of every row: *if this value came from the device instead of the harness, would the check still
pass — and could it still fail?* Twelve rows answer it. **None is withdrawn.** Nine of them
(AC-005 to AC-012) are properties of the repository and its tooling — an artefact's freshness, a
regex's reach, a shim's key casing, a check's presence. No device value enters, so no device value
can falsify them. Three (AC-001 to AC-004) are the grab band, and the band is geometry this
stylesheet declares outright: `top: -40px`, `bottom: -28px`, `--db-space-6: 16px`, clipped by the
sheet's own top edge. Nothing in `tools/screenshots/runtime-vars.css` pins a variable the band reads.
That is the class the question is not meant to catch.

**The finding is not a false row. It is what was never a row at all.**

This phase is named for the harness's truthfulness and reached `completion_pct: 95` (92 when this
sentence was written; re-derived 2026-09-02 as 21 of `goal.md`'s 22 criteria rows). In the same
harness, at three sites, `verify-placement.mjs` sets `--keyboard-height` on the document element and
then measures what moved:

| Site | What it drives |
|---|---|
| `:819` | the phone sheet and its selection bar |
| `:4724` | the record sheet, iOS-shaped signal (`visualViewport`) |
| `:4753` | the record sheet, Android-shaped signal (window resize) |

Nothing in `src/` publishes that variable. `popover-position.ts:530` documents it as the *host's*, and
`:551` only reads it; `styles.css:2424` consumes it in a `max()`. So all three checks prove arithmetic
*given* the variable and say nothing about whether it arrives on a phone. `022` withdrew its AC-1 on
exactly this and went from 90 to 55.

**Two of those three sites are inside the 63 checks AC-011 counted.** `:4724` and `:4753` are ASK-4
of the lifted record-sheet audit. So this phase counted, as fidelity gained, two checks carrying the
precise defect shape it existed to eliminate — and `C10`'s "placement 114 -> 177" reads as 63 units of
new truth when two of them are the old failure wearing the new harness's badge.

That is why AC-011 now reads **arrival only**. Its threshold — *all 63 running, none weakened* — is a
transport guarantee, and it is met: a dropped or loosened check would fail it. It cannot fail because
a lifted check was unsound to begin with, and nothing in this phase asked it to.

AC-012 is qualified for the matching reason. "Every product defect the repaired instruments
**revealed**" is true and narrow. The docking defect was not among them, and could not have been: the
instrument supplies the value the defect lives in, so there was nothing for it to reveal. `0 dropped`
is honest about the set it ranges over and reads as completeness at 100.

**What is owed.** A check that does **not** set `--keyboard-height`, so it can only pass if the
plugin's own fallback works — the same negative-control discipline this phase applied to six other
instruments and did not apply here. `022` names the product half: publish the computed inset as a
plugin-owned document variable and have the bar consume it.

### Re-derived against the tree, and two items had gone stale

The instruction attached to this section is to re-derive it rather than cite it. Done; both stale
items are in the same direction — **this inventory now understates the repair.**

**Stale 1 — "What is owed" is owed no longer.** The check described below as missing exists, at
`verify-placement.mjs` in the block commented *"the same keyboard, with the host silent"*. It does
exactly what this section asked for and did not assume it would get: it **shrinks
`visualViewport.height`** to model the platform rather than writing `--keyboard-height` to do the
host's job, it asserts *"no host variable is in play while the fallback is measured"* (passing only
when the variable is unset or zero), and it carries a named negative control —
`SELECTION_BAR_CONTROL=revert` restores the shipped declaration and the fallback check must go red
under it, with the comment stating that a check staying green there *"should be deleted rather than
believed"*. The block's own note records why this mattered: both earlier blocks set the variable and
dispatched a synthetic resize at full viewport height, so the observed term computed zero in every
run ever captured and **the branch protecting these surfaces on a silent host had never once run.**

**Stale 2 — the `--keyboard-height` channel is narrowed after all.** The closing claim below says it
is not, and that it is "the one still costing withdrawn ticks". The plugin now publishes its own
`--db-keyboard-inset` on the container (`popover-position.ts`), computed by `keyboardInset()`, which
combines the host's report with the visual viewport's own shrink *so whichever notices first wins*.
The literal sentence "nothing in `src/` publishes that variable" remains true — `src/` still only
**reads** `--keyboard-height` — but the conclusion drawn from it does not: a surface reading the
plugin-owned inset no longer depends on the host channel at all. The reason it is a container
variable rather than a document one is recorded there too: `--keyboard-height` is the host's
namespace, and a plugin writing beside it would put one view's measurement in front of every other
view and of the host's own chrome.

**Line references drifted** and should be re-derived rather than cited: the two record-sheet sites
have moved, and the `popover-position.ts` pair has moved. Cite the block comments, which are stable,
rather than the numbers.

**Stale 3 — a fourth host-silent check landed 2026-09-02, and it is narrower than it reads.**
`verify-placement.mjs:4097` adds *"the phone sheet follows `--db-keyboard-inset` without a host
variable"*: it shrinks `visualViewport.height` by 336px on the phone fixture, asserts that
`--keyboard-height` is unset, then reads the container's published `--db-keyboard-inset` and the
record sheet's own bottom edge. It is falsifiable, which is the bar this phase set. Dropping the
visual-viewport term from `keyboardInset()` in `popover-position.ts` turned it red at
**`--db-keyboard-inset=0px` and a sheet bottom of 844px on an 844px window**, against **336px and
508px** green with the term restored.

Two limits are recorded rather than left to be rediscovered. First, **it was not the only check the
edit reddened.** The same one-line change also reddened *"the sheet clears a keyboard no host
reported"*, *"the selection bar clears a keyboard no host reported"* and *"the keyboard inset falls
back to the visual viewport when the host declares nothing"* — 4 reds, not 1, and all three of the
others predate it. The coverage it adds is a duplicate of the block Stale 1 already found, which
additionally owns a named negative control (`SELECTION_BAR_CONTROL=revert`) that this one does not.
Second, **its geometry half cannot fail.** `expectedBottom` is derived from the inset the same run
just measured, so `sheetBottom === expectedBottom` and `observedInset === inset` are two spellings
of one identity, and both stayed green throughout the red run. The published value is the only
load-bearing assertion, and `:6761` already carries it.

**The four host-supplied sites now name their own provenance.** `verify-placement.mjs:968`, `:3433`,
`:3539` and `:6819` each state, in the detail string the run prints, the figure the harness wrote and
the name of the check that covers a host publishing nothing. That is a legibility repair and not a
supply repair: all four still prove arithmetic *given* the variable, exactly as before.

### The same question, asked of the instruments added since

Three new checks now supply values. Asked of each: *if this came from the device, would it still
pass — and could it still fail?*

| Instrument | What it supplies | Can a device value falsify it? |
|---|---|---|
| Calendar and timeline benches | Fixture rows, column count, fill rate, and the pinned window anchors | **Yes.** The measured quantity is the **slope across row counts**, which no fixture sets. The same fixture read ×1.95 before the fix and ×0.98 after |
| Timeline and calendar gate scenarios | The action bags and the fixture | **Yes.** The layout-read count is produced by the renderer: 964 before the fix, 5 after, same fixture |
| Board and gallery gate scenarios | The action bags and the fixture | **Partly.** Both read 1 and have no observed red on this tree; they inherit a control from the board's earlier hoist rather than owning one |

**The anchors are this family's `--keyboard-height`,** and they had already cost a false green before
anyone looked: with an unpinned anchor both date views draw an empty window very fast, and the first
timeline run reported a clean LINEAR ×0.61 over **zero** event bars. The fixture, not the renderer,
supplied that verdict. Guarded now by asserting a non-zero drawn-item count *ahead* of every
per-item bound — an empty window satisfies a per-item bound trivially, which is D6 with a specific
instrument.

**What the timeline arm has that satisfies D12.** The defect was measured by **two independent
producers in different currencies**: the bench timed it (8,547.9ms blocked, fitted ×1.95) and the
gate check counted it (964 layout reads against a bound of 8). One edit moved both, together, in
proportion. A harness faking that would have to supply the same wrong answer twice, in milliseconds
and in read counts, across two separately-written instruments. That is the parity property D12
prefers, arrived at by accident rather than by design — and it is the strongest evidence in this
packet that the timeline finding is real rather than instrumental.

**What none of them prove, stated because the lens demands it.** No Obsidian host is constructed, no
vault or metadata cache exists, and `App` is undefined, so vault-resolving fields render unresolved —
a real database pays more per field, never less. The 6x CPU throttle **models** a slow device and is
not one. And the pinned bag censuses are derived from the same reading of the construction sites that
built the harness bags, so a mis-reading of a site is invisible to the comparison: it catches future
drift, not a present mistake.

**One correction to the standing inventory.** `runtime-vars.css` no longer pins the five values
recorded as divergent (`--db-layer-sticky`, `--db-status-bg`, `--db-number-color`,
`--db-calendar-row-height`, `--db-week-grid-height`); the file documents removing them, plus
`--db-header-height`, `--db-card-field-width`, `--db-mobile-sheet-bottom` and `--db-timeline-row`,
under the rule *never assign a property the runtime also assigns*. That channel is narrowed. The
`--keyboard-height` channel is not, and it is the one still costing withdrawn ticks.
