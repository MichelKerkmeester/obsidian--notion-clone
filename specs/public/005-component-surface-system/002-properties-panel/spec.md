---
title: "Feature Specification: Properties Panel"
description: "One row template with named grid areas, and an information architecture that decides what a property row shows — replacing a positional track list that two stylesheet rules already disagree about."
trigger_phrases:
  - "properties panel"
  - "column manager row"
  - "property row grid"
  - "named grid areas"
  - "002 properties panel"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/002-properties-panel"
    last_updated_at: "2026-08-29T14:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Phase cut from measured architecture findings; not started"
    next_safe_action: "Run the row-grid audit matrix"
    blockers:
      - "001-overlay-placement-and-menu-language must land first — until it does this panel is still fighting placement as well as its row grid"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-002"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Feature Specification: Properties Panel

> Phase chain: parent [`../spec.md`](../spec.md), predecessor
> `001-overlay-placement-and-menu-language`, successor `003-mobile-sheet-presentation`. Root causes
> and measurements live in [`../architecture-findings.md`](../architecture-findings.md) and are
> cited here, never restated.

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 002-properties-panel |
| **Level** | 2 |
| **Priority** | P0 |
| **Status** | Planned |
| **Created** | 2026-08-29 |
| **Blocked by** | `001-overlay-placement-and-menu-language` |
| **Blocks** | `003-mobile-sheet-presentation` |
| **CSS lane** | holds `styles.css` for the whole phase |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The properties panel's row is a positional grid contract: it says "the third track is 96px wide"
when it means "the checkbox is 96px wide". The child set changes with breakpoint and condition, the
ordinals stop meaning what the rules assumed, and the panel clips, wraps and runs full height. The
subsections below record the measured evidence.

### Why this is its own spec

After `001`, the placement half is solved: the properties panel goes through the factory like every
other surface, and where it lands stops being its problem. What remains is a different skill with a
different failure mode — information architecture and a row grid. It is also the highest-visibility
single screen in the plugin, which is why it is worth isolating rather than folding into the
overlay work where it would be the last item on a long list.

### The row emits more children than the grid has tracks

`styles.css:2036` hides `.db-mobile-reorder-controls`. `styles.css:18776` — the same selector, same
specificity, 16,740 lines later — sets `display: inline-flex`. The later block wins, so the
mobile-only reorder arrows render on the desktop.

The row declares seven tracks (`styles.css:11159`):

```
grid-template-columns: 18px 20px 18px minmax(120px, 1fr) auto auto auto;
```

and `renderColumnRow` (`column-manager-renderer.ts:176-296`) emits eight children in the normal
read-write case: the drag handle, the reorder controls, a classless checkbox input, the type icon,
the name wrapper, the wrap toggle, the edit button and the delete button. **Eight children into
seven tracks**, so the eighth wraps onto an implicit second row. Measured: **row height 52px against
a declared `min-height: 30px`, with the trash button on a row of its own.**

### On the phone, two rules disagree about which child is which

Both phone rules match `.is-phone .note-database-container .db-column-manager-row` at identical
specificity. `styles.css:16879` declares:

```
18px auto 20px 18px minmax(120px, 1fr) auto auto auto
```

and `styles.css:16995` — later, and therefore the winner — declares:

```
auto 20px minmax(96px, 1fr) auto auto auto auto auto
```

Both list eight tracks. The disagreement is not the count; it is **which child each ordinal means.**
The first rule reserves position 1 for the 18px drag handle and position 3 for the 20px checkbox.
The second gives position 1 to `auto` and hands the `minmax(96px, 1fr)` flexible track to whatever
lands third.

What lands third has also changed, because `styles.css:16966-16976` sets `.db-column-drag` to
`display: none` on the phone. The drag handle is emitted but not laid out, so **seven children fall
into eight tracks** and every child shifts one position left of where either rule expected it. The
measured outcome recorded in [`../architecture-findings.md`](../architecture-findings.md) §4 is that
the checkbox occupies a 96px track and **the property name gets 22px.**

### What the operator sees

The screenshot shows labels right-aligned and clipped past the panel edge, a trash icon on its own
row beneath every property, and the panel running the full height of the screen. Three symptoms,
and all three fall out of the two facts above plus one more: the stylesheet's
`max-height: min(560px, calc(100vh - 140px))` at `styles.css:9847` is overwritten inline by the
positioner (`popover-position.ts:126`, `160`, `177`), so the panel takes whatever the bounds allow.

### The common cause

A positional track list is a contract written in a language that cannot express what it means. It
says "the third track is 96px wide" when it means "the checkbox is 96px wide", and those two
statements stop agreeing the moment a child is added, hidden, or conditionally omitted. That is
exactly what happened three times over: once when the reorder controls started rendering on
desktop, once when the drag handle stopped rendering on phone, and once when a second phone rule
was appended with a different ordering in mind.

### Purpose

One row template addressed by named grid areas, and an information architecture decided rather than
inherited, so the properties panel stops being laid out by whichever child happened to be emitted
third.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- The `.db-column-manager-row` grid: named areas replacing the positional track list
- Resolving the two duplicate rule pairs — `styles.css:2036`/`18776` and `16879`/`16995`
- What the row shows in its primary line and what hides behind an overflow affordance
- The property name's minimum widths and containment
- The panel's own height cap
- Where the delete affordance lives and what confirms it

### Out of Scope

- Where the panel opens and how wide it is — `001` owns placement, and this phase is sequenced after
  it for that reason
- The property editing flows behind the row's affordances. This phase changes which controls are
  resident, not what they do once invoked
- Property type rendering itself. The type cell's content varies by field kind and that variation is
  an input to the census, not a target of the work
- Every other panel that uses a row grid. The finding generalises; the fix here does not

### Files to Change

| File Path | Change Type | Description |
|---|---|---|
| `styles.css` | Modify | Replace the positional track list at `styles.css:11159` with named grid areas; resolve the duplicate pairs `styles.css:2036`/`styles.css:18776` and `styles.css:16879`/`styles.css:16995` to one declaration each; reconcile `styles.css:16966-16976` (`.db-column-drag` hidden on phone) with the template; cap the panel height independently of the inline `maxHeight` the positioner writes over `styles.css:9847` |
| `column-manager-renderer.ts` | Modify | `renderColumnRow` (`column-manager-renderer.ts:176-296`) claims each region by name; the classless checkbox input gains an addressable area; the delete affordance stops being a bare one-click target in the primary line |
| `tools/storybook/verify-placement.mjs` | Modify | Assert B1-B6 at the production mount point — the panel is created by `column-manager-renderer.ts:134`, one of the three call sites passing the positioner no options |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001 — One row template, addressed by named grid areas.** Every child is placed by `grid-area`, not
  by its ordinal position among siblings. **This is the load-bearing decision of the phase**:
  positional tracks are precisely what let `styles.css:16879` and `styles.css:16995` disagree about
  which child is which, and named areas make that class of disagreement unrepresentable.

- **REQ-002 — Every laid-out child resolves to grid row 1.** No child wraps to an implicit second row under
  any condition. A property row is one line.

- **REQ-003 — The information architecture is decided, not inherited, and the decision is proved by
  measurement.** What the row shows, and what hides
  behind an overflow affordance, is chosen deliberately rather than being whatever eight controls the
  renderer happens to emit. The panel is read far more often than it is edited, so the primary line
  serves reading — name, type, visibility — and the editing actions are reachable without being
  resident.

  **The written decision is not the acceptance condition** (review finding F8). AC-007 closes on the
  primary line measured at 402px and 1440px: 0 controls extending past the panel content box, 0
  controls needing horizontal scroll, the name at its AC-003 width floor, and every overflowed
  control reachable in at most one additional interaction. A document that argues for reading over
  editing and still clips the name has not satisfied this requirement.

- **REQ-004 — The name is legible.** The property name is the reason the row exists. It gets a real
  minimum width at both breakpoints and its right edge stays inside the panel's content box.

- **REQ-005 — The panel is bounded.** Its height is capped independently of what the positioner computes
  for the available space. A property list is scrollable content, not a full-height column.

- **REQ-006 — Delete is not a bare one-click target in the primary line.** A single mis-tap currently
  destroys a property. The affordance moves behind the overflow, or gains a confirmation, or both —
  but it stops being a naked icon adjacent to the row's other icons.

- **REQ-007 — The declared layout and the emitted DOM agree under every condition.** Read-only, required,
  file field, computed, phone and desktop each produce a child set the template accounts for. A
  condition that changes the child set changes the template's declared areas, not its track count by
  accident.

### P1 - Required (complete OR user-approved deferral)

None. Every requirement above is a blocker: each one is load-bearing for a criterion in Section 5,
and the spec records no deferral for any of them.

<!-- /ANCHOR:requirements -->
---

## 4A. INVENTORY METHOD

**Enumerate every emitted child of `.db-column-manager-row`, under each condition, and diff the
count against the declared track count for that breakpoint. That diff is the bug** — not a symptom
of it, and not a proxy for it. It is the defect stated as a number.

Conditions to enumerate, at both breakpoints:

| Condition | Why it changes the child set |
|---|---|
| **read-write** | emits the edit and delete buttons |
| **read-only** | `actions.isReadOnly` suppresses both, dropping two children |
| **required** | `requiredReason` adds a hint element inside the name wrapper and disables the checkbox |
| **file field** | property-type rendering differs in the type cell |
| **computed** | property-type rendering differs in the type cell |
| **phone** | `.db-column-drag` is `display: none`; the reorder controls become visible by design |
| **desktop** | the reorder controls are visible by accident |

For each cell of that matrix record: the emitted child count, the **laid-out** child count — the
two differ whenever something is `display: none` — the declared track count, and the resolved grid
row of every child. A child on row 2 is a failure; a laid-out count that does not equal the
declared track count is a failure; and the two failures have different fixes, which is why they are
counted separately.

The census is complete when every cell of the matrix has all four numbers.

---

## 4B. VARIANT ARCHITECTURE

**One row template with named grid areas.** A single `grid-template-areas` declaration names each
region; each child claims its region by name. Conditions that remove a child remove its area from
the template rather than shifting every subsequent child one position left.

**Why not a positional track list, fixed.** Correcting the track counts leaves the mechanism that
produced the defect intact. The counts were correct once; they stopped being correct when the child
set changed, and the child set will change again — that is what a read-only mode, a required field
and a phone breakpoint are. A positional contract has no way to notice.

**Why not one rule per condition.** That is the present state on phone, where two rules for the
same selector encode two different mental models of the same row and only the later one runs.
Adding conditions multiplies the pairs that can silently disagree.

**Why not flex.** Flex would remove the count mismatch by removing the concept of a track, but it
also removes column alignment between rows — and a property list whose type icons and checkboxes do
not line up down the panel is a different, quieter defect. The grid is the right mechanism; the
addressing was wrong.

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

### Acceptance Criteria

Each is measured on the real renderer at the production mount point, expressed as a number with a
threshold, and recorded here with its failing value from the current tree before it is trusted.
**A criterion with no recorded failing number is not accepted.** Class names and rule counts are
banned as criteria.

| # | Criterion | Threshold | Measured today |
|---|---|---|---|
| **B1** | Every laid-out child of a property row resolves to grid row 1 | computed `grid-row-start` = 1 for all children, and row `height <= 36px`, both viewports | **fails: 8 children into 7 tracks on desktop; measured height 52px against a declared `min-height: 30px`, trash on an implicit second row** |
| **B2** | Declared track count equals laid-out child count | equality at every breakpoint x every condition in §4's matrix | **fails: desktop 7 declared vs 8 laid out; phone 8 declared vs 7 laid out** (`.db-column-drag` is `display: none` on phone) |
| **B3** | The property name is legible | computed content width `>= 120px` desktop, `>= 96px` phone, and `nameEl.getBoundingClientRect().right <= panelContentBox.right` | **fails: the phone name track measures 22px** |
| **B4** | The panel is bounded | measured `height <= min(560px, 0.7 * visibleBounds.height)` with 40 properties, both viewports | **fails: the inline `maxHeight` written by the positioner takes the full available bounds** |
| **B5** | Delete is not a bare one-click target in the primary line | no element in the row's primary line both invokes `deleteColumn` on a single click and has no confirmation | **fails: `db-column-delete-btn` deletes on one click from the row itself** |
| **B6** | Removing a condition's child changes the declared areas, not the ordinal meaning of the others | for each condition in §4, the grid area resolved by each surviving child is unchanged from the read-write case | **fails: hiding the drag handle on phone shifts every subsequent child one track left** |

**B2 and B6 are the phase's negative controls.** B2 fails today in both directions at once — an
over-fill on desktop and an under-fill on phone — so a harness that reports it passing has been
measured wrong rather than fixed. B6 is a deletion test by construction: it asserts that removing a
child cannot change what the remaining children mean, which is the one property a positional track
list cannot have.

<!-- /ANCHOR:success-criteria -->
---

## 5A. PHASE PLAN

| # | Phase | Exit condition |
|---|---|---|
| 1 | **Row-grid audit** | §4's matrix complete: emitted count, laid-out count, declared track count and resolved grid row, per condition per breakpoint |
| 2 | **Information architecture** | what the row shows and what hides behind overflow is decided and written down, with the reading-over-editing argument recorded |
| 3 | **Implement** | named grid areas replace the positional list; the duplicate rules at `2036`/`18776` and `16879`/`16995` are resolved to one declaration each |
| 4 | **Grid invariants** | B1-B6 asserted in the browser harness, each demonstrated to fail first |
| 5 | **Screenshots** | both viewports at 3, 12 and 40 properties, full recapture, human review of every changed PNG |
| 6 | **Storybook row states** | one story per condition in §4's matrix, at the production mount point |
| 7 | **Research gate** | standing; see §9 |

---

## 5B. VERIFICATION METHOD

**Measured tests live in the browser.** `vitest` runs `environment: "node"` with no jsdom
(`vitest.config.ts`), so no DOM assertion can live in a unit test and no test that string-matches
`styles.css` proves a rule applies. Every criterion in §6 is asserted in
`tools/storybook/verify-placement.mjs` or its successor.

**The panel must be measured at the production mount point.** The properties panel is created by
`column-manager-renderer.ts:134` — one of the three call sites that passes the positioner no
options at all. Measuring it inside a fixture wrapper is exactly the blindness
[`../architecture-findings.md`](../architecture-findings.md) §3 documents.

**Negative controls.** Each check fails on the current tree before the fix lands, with the failing
number written into §6.

**Screenshots.** Both viewports at 3, 12 and 40 properties — three counts because the defects
separate: 3 properties shows the row grid without scroll, 12 shows the ordinary case, 40 shows the
height cap. Full recapture, **and a human opening the changed PNGs.**

**Storybook.** One story per condition in §4's matrix, mounted where production mounts the panel.

### Line numbers are dated hints; the selector is the address

Every `styles.css:NNNN` in this packet was confirmed correct on 2026-08-29 and is kept as evidence
about the tree on that date — **it is not an address.** `000` deletes dead blocks and `001` edits the
file before this phase starts. `acceptance-criteria.md` carries the resolution table: selector plus
the `rg` command that finds it. When the command and the number disagree, the command is right.

This matters more here than anywhere else in the program. The whole desktop argument is *which of
two identical `.db-mobile-reorder-controls` declarations comes later*, and the phone argument is the
same shape for `.db-column-manager-row`. A stale line number would silently invert the reading, so
resolve both pairs with `rg -n` and read the hits **in order** before relying on either.

### No desktop number recorded before `000` repairs the desktop page

`tools/storybook/verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it
targets the **phone** page. The desktop checks therefore run against a document with no plugin
cascade — and this packet's desktop defect *is* a cascade defect: 8 children land in 7 tracks only
because one selector hides the reorder controls and a later, identical one shows them. **On a page
with no stylesheet the defect cannot appear at all**, so a green desktop result there means nothing.

B1, B2 and B6 are desktop reads. `000` repairs the load; until it has, no desktop failing number and
no desktop passing number is admissible here, and a number recorded before the repair is discarded
rather than re-used. A harness number that disagrees with the `009` live probe is a blocking failure.

### The `styles.css` lane

This packet **takes the lane at the start of Phase 3** and holds it through Phase 4. Phases 1 and 2
audit and decide against an unedited stylesheet.

It **releases the lane** only after, in order: a full recapture at both viewports and 3, 12 and 40
properties; a named human opening every changed PNG and signing off in `checklist.md`; `008`'s early
replay re-asserting `000`, `004`, `005` and `001` against the released tree; and the cascade
re-confirmation, which for this packet means recording the computed winner of both collapsed
duplicate pairs before and after. `screenshots:verify` never opens an image, so it can never be the
sign-off. A phase that closed earlier and fails to re-close at this handoff blocks the release.

---

## 5C. RESEARCH GATE

Standing, and triggered by a rule rather than a schedule: **when a criterion fails twice without a
new hypothesis.**

The comparison target is Notion's property panel — how it orders name, type and visibility, what it
keeps resident and what it hides behind an overflow, and how it treats destructive actions.
**Notion is the visual target and is not a source**: describe what it looks like, then derive
values from our own token scale.

AnyType and AppFlowy under `external/` (gitignored) are read for **behaviour only** — how a property
row degrades at 320px, what happens to a long property name, where a delete affordance lives. Both
are AGPL or source-available and this plugin is MIT: **never copy code, CSS values or token
scales.**

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

This phase holds `styles.css`, and its central edit is the deletion of duplicate declarations —
`2036` against `18776`, and `16879` against `16995`. The stylesheet has a documented history of
silent reversal, and both of these pairs are that history. Resolving each pair to one declaration is
the fix, but the fix is invisible to the compiler and to every string-matching test, which is why
B2 and B6 are written as measurements of the rendered grid rather than as assertions about rules.

The information-architecture phase carries the risk of scope creep, because a panel that is being
measured invites redesign. R3 is bounded to what the row shows and what hides; the property editing
flows behind those affordances are out of scope.

Delete-affordance changes are behavioural, not cosmetic. R6 changes what a single click does, and
that change needs the operator's confirmation on device rather than a capture.

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance

- **NFR-P01**: Named grid areas add no per-row JavaScript; placement stays a single CSS declaration
  rather than a measured layout pass.
- **NFR-P02**: The height cap keeps a 40-property panel scrollable content rather than a full-height
  column, so the panel does not grow with the property count.

### Security

- **NFR-S01**: No network call, telemetry or remote dependency. Local Obsidian DOM APIs only.
- **NFR-S02**: AnyType and AppFlowy under `external/` are read for behaviour only — both are AGPL or
  source-available against this plugin's MIT, so no code, CSS value or token scale is copied. Notion
  is the visual target and is not a source.

### Reliability

- **NFR-R01**: Removing a child under any condition removes its named area; it never shifts the
  meaning of the remaining children. This is what B6 asserts.
- **NFR-R02**: Desktop and phone are one template with declared area differences, not two rule sets
  encoding two mental models of the same row.
- **NFR-R03**: Deleting a property is a behavioural change; it closes on operator device
  confirmation, never on a capture.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries

- 3, 12 and 40 properties are the three capture counts because the defects separate: 3 shows the row
  grid without scroll, 12 the ordinary case, 40 the height cap.
- A long property name must stay inside the panel's content box; B3 asserts
  `nameEl.getBoundingClientRect().right <= panelContentBox.right`.
- A required field appends a second line inside `.db-column-name-wrap`, the one child that must not
  grow. Whether the hint stays there is an open question in Section 10, not an assumption.

### Error Scenarios

- A child that is emitted but `display: none` is counted in the emitted set and not in the laid-out
  set. The two counts differ, and the two failures they produce have different fixes, which is why
  the census records both.
- A string-matching test on `styles.css` cannot prove a rule applies. Every criterion is a
  measurement of the rendered grid.

### State Transitions

- Read-only suppresses the edit and delete buttons, dropping two children; the template's declared
  areas change with it rather than its track count changing by accident.
- Switching breakpoint changes which children are laid out; every surviving child must resolve to the
  same named area it had in the read-write desktop case.

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|---|---|---|
| Scope | 15/25 | One row template, two duplicate rule pairs, one renderer, one height cap, a 7x2 condition matrix |
| Risk | 17/25 | Holds the serialized `styles.css` lane; the central edit deletes duplicate declarations in a stylesheet with a documented history of silent reversal; the delete affordance changes behaviour |
| Research | 12/20 | Root causes measured in `../architecture-findings.md` §4; the open judgement is the information architecture |
| **Total** | **44/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 10. OPEN QUESTIONS

**Should the reorder controls render on desktop at all?** Resolving `styles.css:2036` against
`18776` requires deciding which rule was right. The class is named `db-mobile-reorder-controls` and
the phone rule at `16873` makes them visible deliberately, which argues the desktop appearance is
the accident. But desktop currently has no other keyboard-free way to reorder a property, since
`.db-column-drag` requires a pointer drag. Deleting the arrows may remove an affordance somebody
uses. **This is settled in the information-architecture phase, on the evidence, not during
implementation.**

**Does the required-field hint stay inside the name area?** `requiredReason` currently appends a
second line inside `.db-column-name-wrap`, which is the one child that must not grow. If the hint
stays, the name area is a two-line region and B1's `<= 36px` row height needs a stated exception; if
it moves, it needs somewhere to go.

**What confirms a delete?** R6 permits moving the affordance behind an overflow, adding a
confirmation, or both. A confirmation dialog on a panel that is itself a popover raises the nesting
question `001` answers for submenus, and the answer should be the same one.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- **Parent Spec**: [`../spec.md`](../spec.md)
- **Findings**: [`../architecture-findings.md`](../architecture-findings.md) — §4 for the measured row
- **Predecessor**: [`../001-overlay-placement-and-menu-language/spec.md`](../001-overlay-placement-and-menu-language/spec.md)
- **Implementation Plan**: See [`plan.md`](plan.md)
- **Task Breakdown**: See [`tasks.md`](tasks.md)
- **Verification**: See [`checklist.md`](checklist.md)
