---
title: "Feature Specification: Checkbox Ownership"
description: "One checkbox primitive with unconditional base appearance, so every checkbox the plugin creates is the plugin's, not the platform's — and the criteria doctrine gets validated cheaply before the overlay chain is bet on it."
trigger_phrases:
  - "checkbox ownership"
  - "round checkboxes"
  - "createCheckbox"
  - "checkbox census"
  - "004 checkbox"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/004-checkbox-ownership"
    last_updated_at: "2026-08-30T18:30:00Z"
    last_updated_by: "phase-author"
    recent_action: "State established from the tree: 211/211 own appearance, 0 ancestor-owned; roadmap 7.1 closed"
    next_safe_action: "Open the 16 changed PNGs and sign them off in checklist.md"
    blockers: []
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "checklist.md"
      - "../../../../src/views/checkbox-family-coverage.test.ts"
      - "../../../../src/views/checkbox-borrowed-ancestor.test.ts"
      - "../../../../tools/storybook/verify-placement.mjs"
      - "../../../../tools/screenshots/scenarios/shared.mjs"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-004"
      parent_session_id: null
    completion_pct: 85
    open_questions:
      - "Can the base rule win against a hostile theme without !important; three themes still untested"
    answered_questions:
      - "db-list-row-checkbox is routed through the factory rather than deleted"
---
# Feature Specification: Checkbox Ownership

> Phase chain: parent [`../spec.md`](../spec.md), predecessor
> `000-surface-contract-and-truthful-harness`, successor `005-content-row-rhythm`. Root causes and
> measurements live in [`../architecture-findings.md`](../architecture-findings.md).

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|---|---|
| **Spec Folder** | 004-checkbox-ownership |
| **Level** | 2 |
| **Blocked by** | `000` — the honest harness only. **Not** the factory |
| **Blocks** | nothing. It is deliberately off the overlay critical path |
| **CSS lane** | holds `styles.css` for the checkbox rules |
| **Priority** | P0 |
| **Status** | In progress |
| **Created** | 2026-08-29 |
| **Branch** | `main` |
| **Parent Spec** | `../spec.md` |
| **Predecessor** | `000-surface-contract-and-truthful-harness` |
| **Successor** | `005-content-row-rhythm` |

<!-- /ANCHOR:metadata -->
---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

**The operator sees round checkboxes everywhere, and the previous fix was real.** It styled
`.db-checkbox-cell input[type="checkbox"]` — the boolean *cell*, one family — and shipped. Board
card, board column, board subgroup, gallery card, gallery group, list row, list group, group divider
and selection-clear checkboxes were all untouched, which is every checkbox the operator actually
looks at while scanning a board or a gallery.

The measured census explains why one family was easy to find and eleven were not.

**Twelve checkbox classes exist in source; eleven exist in CSS.** The missing one,
`db-list-row-checkbox` (`src/views/list-renderer.ts:271`), **has no CSS rule anywhere.** It is
applied to an input and then styled by nothing.

**Ten checkbox inputs are created with no class at all.** Five of them are unstyled:
`src/views/column-manager-renderer.ts:150` and `:237`,
`src/views/view-config-panel-renderer.ts:2032`, `src/views/chart-toolbar-renderer.ts:985`, and
`src/views/toolbar-renderer.ts:1280` — whose only rule, `.db-add-view-duplicate input`
(`styles.css:18944-18947`), declares `flex` and `margin` and no appearance. The other five are
styled, but only because the call site adds a class to their **parent** immediately before creating
them.

**That is the mechanism.** Probed computed appearance: **1 of 12 families is owned by the plugin**,
and the ones that work are styled through an ancestor wrapper. Every selector in the stylesheet that
declares `appearance: none` on a plugin checkbox is ancestor-scoped:
`.note-database-container .db-checkbox-cell input[type="checkbox"]` (`styles.css:6628`),
`.note-database-container .db-table .db-select-col .db-select-inner input[type="checkbox"]`
(`:5428`), `.note-database-modal .db-modal-checkbox` (`:8252`), and
`.note-database-modal .db-csv-markdown-option-label input[type="checkbox"]` (`:11039`). Even
`db-modal-checkbox`, the one class that does sit on the input itself, only takes effect underneath
`.note-database-modal`.

So a checkbox's appearance depends on where it was mounted rather than on what it is. **A class on
the input is not enough to make it ours, and that is exactly why eleven of twelve were missed.**

---

### Why this is its own spec, and why it runs second

A checkbox is not a floating surface, so this work needs nothing from `openSurface()`. It needs the
honest harness and nothing else, which makes it the only substantial spec that can start the moment
`000` lands.

That independence is the point. This is the cheapest and most visible win in the program, and it
runs **early, right after `000`, specifically to validate the criteria doctrine before the overlay
chain is bet on it.** If checkboxes ship against criteria written this way and the operator still
sees circles, the method is wrong and the cost of finding out is a week rather than a quarter.

---

### Purpose

One checkbox primitive with unconditional base appearance, so every checkbox the plugin creates is
the plugin's rather than the platform's — and so the criteria doctrine is validated cheaply before
the overlay chain is bet on it.

<!-- /ANCHOR:problem -->
---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope

- `createCheckbox(parent, { role })` as the only code path producing an `input[type="checkbox"]`
- Unconditional base appearance with no ancestor in the selector
- A fixed role set that selects size and nothing else
- All twelve classed families, all ten classless creation sites, and `db-list-row-checkbox`
- Checked, indeterminate, disabled and focus states for every family
- Hit targets of at least 28x28 under a coarse pointer
- Deleting the checkbox rules the primitive supersedes

### Out of Scope

- Anything requiring `openSurface()`. A checkbox is not a floating surface; this spec deliberately
  stays off the overlay critical path and needs only the honest harness from `000`
- Content-row rhythm and the header rail — `005`
- What a checkbox *does* when toggled. This phase changes how one is created and how it looks, not
  the behaviour behind it
- Making the plugin win against every possible third-party theme. B5 sets the bar at three; a theme
  that defeats the base appearance anyway is recorded as a finding, not designed around

### Files to Change

The complete list is the output of the Stage-1 join — the source list and the CSS list are each
incomplete on their own. The files known before the join are:

| File Path | Change Type | Description |
|---|---|---|
| `styles.css` | Modify | Unconditional base appearance with no ancestor in the selector; delete the ancestor-scoped rules the primitive supersedes, including `styles.css:6628` and the appearance-free `styles.css:18944-18947` |
| `src/views/list-renderer.ts` | Modify | `db-list-row-checkbox` (`src/views/list-renderer.ts:271`) routed through the primitive, or the class deleted |
| `src/views/column-manager-renderer.ts` | Modify | The classless inputs at `src/views/column-manager-renderer.ts:150` and `:237` routed through the primitive |
| `src/views/view-config-panel-renderer.ts` | Modify | The classless input at `src/views/view-config-panel-renderer.ts:2032` |
| `src/views/chart-toolbar-renderer.ts` | Modify | The classless input at `src/views/chart-toolbar-renderer.ts:985` |
| `src/views/toolbar-renderer.ts` | Modify | The classless input at `src/views/toolbar-renderer.ts:1280` |
| Checkbox primitive module | Create | `createCheckbox(parent, { role })` with the role set enumerated in one place |
| `tools/storybook/verify-placement.mjs` | Modify | Computed-appearance assertions per family, the set-equality check, the mount-point comparison and the coarse-pointer hit target |

<!-- /ANCHOR:scope -->
---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

- **REQ-001 — One way to create a checkbox.** `createCheckbox(parent, { role })` is the only code path that
  produces an `input[type="checkbox"]` in the plugin. Every one of the creation sites the census finds
  routes through it.

- **REQ-002 — Base appearance is unconditional.** The primitive applies `appearance: none` and the plugin's
  own box, border, radius, background and check glyph to **every** checkbox it creates, with no
  ancestor in the selector and no condition on where the node is mounted. A checkbox rendered on
  `document.body` looks identical to one rendered inside a board card.

- **REQ-003 — The role chooses size only.** `role` selects from a fixed set of sizes and nothing else. It
  never selects a radius, a colour, a border or a glyph, and it is **never keyed to an ancestor**.
  Ancestor-keyed styling is the documented cause of this defect, not a shortcut around it.

- **REQ-004 — Every family reaches every state.** Checked, indeterminate, disabled and focus each render a
  measurably different box for every family, not only for the boolean cell.

- **REQ-005 — `db-list-row-checkbox` is resolved, and the resolution is proved by measurement.** It gets a rule through the primitive or the class is
  deleted. A class in source that no stylesheet mentions is not left standing. Resolve the class with
  `rg -n 'db-list-row-checkbox' styles.css src/` — the `styles.css` side returns no match.

  **Neither the routing nor the deletion is the acceptance condition** (review finding F8; "deleted
  with zero callers" is a call count, which `../architecture-findings.md` §9 bans). AC-007 closes on
  the rendered list-row checkbox's computed `appearance`, `border-radius` and box size being
  identical to its role-mate's — 0 differing properties — with a hit rect `>= 28x28` under a coarse
  pointer.

- **REQ-006 — The classless inputs are named, not swept, and each of the five dangerous ones is
  migrated on its own row.** All ten are migrated, including the five that
  currently work by accident because their parent happened to carry `.db-checkbox-cell` or
  `.db-select-inner`. Those five are the most dangerous, because they pass today and would break the
  moment their wrapper moved.

  **The five are enumerated individually** (review finding F13) — `table-renderer.ts:514` and `:785`,
  `cell-renderer.ts:489`, `card-field-renderer.ts:184`, `record-detail-panel.ts:339` — and carry one
  criterion each, AC-012a to AC-012e. "The five were migrated" is a population statement and is
  exactly the class-name-shaped claim this packet exists to stop.

  **Each carries a two-sided negative control.** *Before* migration, stripping the parent's class in
  the harness **must move** a computed value on that site — that is what proves the borrowed
  dependency is real and the check is connected. *After* migration, stripping the same class **must
  move nothing**. A site that passes the second half without the first half recorded is `Blocked`,
  not `Met`: it may never have depended on the wrapper, and nobody would know.

  This closes a real protection gap. `004` runs immediately after `000`, which fixes the harness and
  the token root and does not touch checkboxes — so between `000` Stage 1 and this migration, any
  wrapper change in those five files breaks them with no compiler warning and no failing test.

- **REQ-007 — Touch targets are real.** Every family presents at least a 28x28 hit target under a coarse
  pointer, independently of the visual box size the role selects.

---

### P1 - Required (complete OR user-approved deferral)

None. Every requirement above is a blocker: each one is load-bearing for a criterion in Section 5,
and the spec records no deferral for any of them.

<!-- /ANCHOR:requirements -->
---

## 4A. INVENTORY METHOD

**A join, not a grep.** Enumerate every `type: "checkbox"` creation site in source, enumerate every
CSS rule that could style a checkbox, and join the two sets. Neither half alone is an inventory:

- The source list alone hides that `db-list-row-checkbox` is styled by nothing.
- The CSS list alone hides the four unstyled classless inputs, because they have no name to match on.
- Only the join reveals the five classless inputs that work solely through a parent's class — the
  population that looks healthy and is structurally fragile.

For each creation site record: file and line, class or classlessness, the parent's class at creation
time, the selector that actually wins, and the **computed** `appearance`, `border-radius` and box
size at the production mount point. Computed, not declared — the whole defect is the gap between the
two.

The join's output is the requirement list. A family absent from it will be absent from the fix, which
is what happened last time.

---

---

## 4B. ARCHITECTURE

`createCheckbox(parent, { role })`.

**Unconditional base appearance, role chooses size only, never keyed to an ancestor.**

*Why not extend the working selector.* `.db-checkbox-cell input[type="checkbox"]` is what shipped
last time. It fixes one family and leaves the mechanism — appearance decided by ancestry — fully
intact, so the next checkbox added anywhere else is unstyled again by default.

*Why not one class per family.* Twelve classes already exist and eleven of them do not work. Adding a
thirteenth does not change what decides appearance; the census shows classes on inputs are not what
the cascade is keyed to today.

*Why not a role that also picks visual treatment.* The moment a role can choose a radius or a colour,
the families drift apart again and criterion B2 becomes unenforceable. Size is the only dimension
where the surfaces genuinely differ.

---

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

### Acceptance Criteria

Each is measured on the real renderer at the production mount point, and each currently fails.

| # | Criterion | Measured today |
|---|---|---|
| **B1** | Every `input[type="checkbox"]` the plugin creates computes `appearance: none` | **1 of 12 families** |
| **B2** | Radius and box size are identical within a role across board, gallery, list, table, modal and panel — the set of distinct values has cardinality 1 | families diverge; 11 of 12 fall back to the platform's box |
| **B3** | A checkbox's appearance is identical at all three mount points | appearance is decided by ancestry, so it differs by construction |
| **B4** | Checked, indeterminate, disabled and focus each produce a measurable difference for every family | only the ancestor-styled families have state rules at all |
| **B5** | Appearance is unchanged under three third-party themes, at least one of which restyles native checkboxes | untested; a theme that restyles native checkboxes reaches 11 of 12 families today |
| **B6** | Hit target is at least 28x28 under a coarse pointer for every family | not asserted anywhere |

**A criterion is not accepted until its failing number is recorded here from the current tree.** Class
names and call counts are banned: "twelve checkbox classes exist" was true before this work started
and the checkboxes were still round.

---

### Acceptance Scenarios

1. **Given** a checkbox created on `document.body` and one created inside a board card, **When**
   their computed appearance is compared, **Then** they are identical (B3).
2. **Given** every family the join found, **When** computed `appearance` is read, **Then** all twelve
   compute `none` (B1).
3. **Given** a coarse pointer, **When** any family's hit target is measured, **Then** it is at least
   28x28 (B6).


### What was measured, and what it measures now

Recorded 2026-08-30. Each line is a number taken from the tree before the fix, the fix, the number
after it, and the control that showed the check could fail.

| Finding | Before | After | Control |
|---|---|---|---|
| Families with a call site and no fixture | **5** of 15 (`db-board-subgroup-checkbox`, `db-gallery-group-checkbox`, `db-list-group-checkbox`, `db-selection-clear-checkbox`, `db-modal-checkbox`); the desktop `list-view` fixture rendered no checkbox at all while the renderer builds one at every width | **0**. Three scenarios added, `list-view` given its real row controls | Deleting one family from the fixture turns `checkbox-family-coverage.test.ts` red and names it |
| Fixture and factory agree | not checked | checked by running `createCheckbox` and comparing the class list it composes | Dropping `db-checkbox` from the fixture helper reports 127 mismatches |
| `checkbox-borrowed-ancestor.test.ts` is a control | **no** — re-keying the base rule to `.note-database-container .db-checkbox-cell input[type="checkbox"]`, the exact pre-fix defect, left it reporting **6 passed** | it now reads the stylesheet: every control must have an `appearance: none` rule whose subject is the control, and no unguarded ancestor may declare one | that same re-key now fails the self-owned assertion |
| Live ancestor-keyed appearance rules | **1** of 7 (`.db-column-display-style-popover .db-toggle-switch`, a full duplicate that had drifted to a weaker border and a knob taken from the surface fill) | **0** — deleted, the popover inherits the one definition | the assertion names the selector when it returns |
| Switches that lose a computed property when moved out of the container | **10 of 10** — `border-radius` 9999px inside, **0px** outside, so the pill became a square; `justify-self` lost on 6 of them | **0 of 10** | removing the `9999px` literal returns 10/10; re-scoping one alignment rule returns 2/10 |
| Switch target under a coarse pointer | painted 34x18, reachable **34x18** against this phase's 28px floor | reachable **34x28**, painted box unchanged so no desktop capture moves | `inset: -5px` reached 26 and failed the same check, which is how the padding-box arithmetic was caught |
| Reorder button against the row checkbox | desktop **-17px** gap in a 40px cell, phone **-14px** in a 49px cell — drawn on top of each other | desktop: no button rendered, matching a renderer that only creates it on touch; phone **+4px** in a 65px cell | the check reports the gap in pixels and goes negative the moment they touch |

**Superseded numbers.** The reported switch target of 37x24 could not be reproduced: every
measurement of the switch, settled and under a coarse pointer, reads 34x18. The control below the
floor is the same one, and its height is 18 rather than 24.

**Declined, with the shortfall stated.** The table's main-item cell measures 169x34 against WCAG
2.5.5 AAA's 44px, 40px at the loosest density. The operator chose density: row height stays at 34px
and no phone-only override is added, because raising it would override the reader's own density
setting. WCAG 2.5.8 AA's 24px floor is met. `verify-placement` reports the 33px reach on every run.

**Not closed.** No human has opened the sixteen changed PNGs. The operator's defect is visible
shape and a machine that never looks at an image cannot close it.

<!-- /ANCHOR:success-criteria -->
---

## 5A. VERIFICATION METHOD

- **Computed-appearance tests** — browser harness, every family, at the production mount point.
  `vitest` runs `environment: "node"` with no jsdom (`vitest.config.ts:16`), so every DOM assertion
  lives in `tools/storybook/verify-placement.mjs`.
- **Negative controls** — reverting the base rule must reproduce the 1-of-12 measurement; removing a
  wrapper class from the harness must not change any family's appearance once R2 holds.
- **Screenshots** — every family in every state: unchecked, checked, indeterminate, disabled, focus.
  Full recapture, with a human reviewing the changed PNGs.
- **Storybook** — a state matrix of family against state, mounted where production mounts them.
- **Third-party themes** — three, at least one that restyles native checkboxes. This is where B5 is
  decided and it cannot be inferred from the default theme.
### Line numbers are dated hints; the symbol is the address

Every `styles.css:NNNN` and `src/**/*.ts:NNNN` in this packet was confirmed correct on 2026-08-29 and
is kept as evidence about the tree on that date — **it is not an address.** `000` deletes dead blocks
before this phase starts. `acceptance-criteria.md` carries the resolution table: selector or symbol
plus the `rg` command that finds it. When the command and the number disagree, the command is right.
The five borrowed-ancestor sites in particular are found with `rg -n 'type: "checkbox"' src/views/`,
reading the two lines above each hit. Record moved numbers old to new.

### Every criterion here is a computed value, so the harness repair is a precondition

`tools/storybook/verify-placement.mjs:220` is the only `addStyleTag` call for `styles.css` and it
targets the **phone** page (review finding F3). Every criterion in this packet reads a value that
exists only because a stylesheet rule matched — `appearance`, `border-radius`, box size. **On a page
with no stylesheet all twelve families compute the platform default**, so the harness would report
them uniformly broken and the fix would appear to change nothing. That is not a false pass; it makes
the packet unmeasurable.

`.storybook/preview.ts:55` compounds it by wrapping every story in `.note-database-container` — the
ancestor four of these rules are scoped to — so a story measured in the wrapper cannot show the
ancestor dependency at all. Measure at the production mount point, on the repaired page, and
cross-check against `009`'s live probe. A harness number and a live number that disagree is a
blocking failure.

### The `styles.css` lane

This packet **takes the lane at the start of Phase 3** — building the primitive, the first stage that
writes CSS — and holds it through Phase 5. Phases 1 and 2 join and record against an unedited
stylesheet, and the pre-fix parent-class strips for AC-012a to AC-012e must be taken on the tree as
`000` released it.

`005` unblocks from `000` on the same edge as this packet and also edits `styles.css`; the two are
serialized by this rule and nothing else, so it is not a formality.

It **releases the lane** only after, in order: a full recapture of every family in every state; a
named human opening every changed PNG and signing off in `checklist.md` — the operator's defect is
*visible shape*, and a machine that never opens an image cannot close it; `008`'s early replay
re-asserting `000` against the released tree, which is the program's first lane handoff and therefore
the first real test of whether the replay works at all; and cascade re-confirmation, which matters
here because four ancestor-scoped rules are being replaced by one unconditional rule and the
specificity landscape moves with them.

- **Research gate** — standing, triggered when a criterion fails twice without a new hypothesis. Read
  AnyType and AppFlowy under `external/` (gitignored) for how they keep a control's appearance
  independent of theme. **Behaviour only** — both are AGPL/source-available against this plugin's
  MIT, so never copy code, CSS values or token scales. Notion is the visual target and is not a
  source.

---

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

**Low blast radius, high visibility.** Checkboxes have no layout dependents and no persisted state.
The realistic failure is incompleteness rather than breakage — a family missed, exactly as last time
— which is why the census is a join and why B2 is expressed as set equality over measured values
rather than as a per-family assertion that can be quietly under-enumerated.

**The five accidentally-working classless inputs are the trap.** They pass every check today. If the
migration skips them because they look correct, the fix ships with the fragile population intact and
the next wrapper change reintroduces the defect.

**Third-party themes are the one criterion this spec cannot fully control.** A theme with sufficient
specificity and `!important` can still win. B5 sets the bar at three themes including one that
restyles native checkboxes; a theme that defeats R2 anyway is recorded as a finding, not hidden.

**This spec holds the serialized `styles.css` lane** while it runs, and ends with a full recapture and
a human looking at the changed PNGs.

| Type | Item | Impact | Mitigation |
|---|---|---|---|
| Dependency | `000-surface-contract-and-truthful-harness` — the honest harness only, **not** the factory | Without it no measurement can distinguish an owned checkbox from a platform one | This spec starts the moment `000` lands and takes no `openSurface()` dependency (D3) |
| Dependency | Serialized `styles.css` lane | Checkbox rules cannot be edited concurrently with another phase | This spec holds the lane alone while it runs and ends with a full recapture and human review |
| Dependency | Three third-party themes, one restyling native checkboxes | B5 cannot be inferred from the default theme | Exercised explicitly in Stage 6; a theme that wins is recorded as a finding |

<!-- /ANCHOR:risks -->
---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance

- **NFR-P01**: The primitive adds no per-checkbox JavaScript beyond element creation; appearance stays
  a CSS declaration.

### Security

- **NFR-S01**: No network call, telemetry or remote dependency. Local Obsidian DOM APIs only.
- **NFR-S02**: AnyType and AppFlowy under `external/` are read for behaviour only — both are
  AGPL/source-available against this plugin's MIT, so no code, CSS value or token scale is copied.
  Notion is the visual target and is not a source.

### Reliability

- **NFR-R01**: The base rule wins on the merits of its selector rather than by escalating to
  `!important` across the board — that path re-creates the `!important` tail already documented in
  the stylesheet as a source of silent reversal.
- **NFR-R02**: Every deleted CSS rule is quoted verbatim in the Stage-1 join before removal.
- **NFR-R03**: No `openSurface()` dependency is introduced; this spec must stay off the overlay
  critical path.

<!-- /ANCHOR:nfr -->
---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries

- A checkbox mounted on `document.body` is the case ancestor-scoped styling cannot reach; B3 measures
  exactly that.
- The five classless inputs that work only through a parent's class pass every check today and are one
  wrapper change from joining the broken population. They are migrated first, not last.
- A hostile theme with sufficient specificity and `!important` can still win. B5 sets the bar at three
  themes including one that restyles native checkboxes.

### Error Scenarios

- A fix that trusts appearance rather than the join skips the five accidentally-working inputs — the
  recognisable description of what already happened.
- A per-family assertion can be quietly under-enumerated. B2 is set equality over measured values so
  an incomplete fix fails rather than passes.
- `db-list-row-checkbox` is a class in source that no stylesheet mentions; it is resolved, never left
  standing.

### State Transitions

- Checked, indeterminate, disabled and focus must each produce a measurable difference for every
  family, not only for the ancestor-styled ones.
- Removing a wrapper class from the harness must change no family's appearance once REQ-002 holds
  (N2, N3).

<!-- /ANCHOR:edge-cases -->
---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|---|---|---|
| Scope | 14/25 | One primitive, twelve classed families, ten classless creation sites, four states, six criteria |
| Risk | 9/25 | Low blast radius: no layout dependents, no persisted state. The realistic failure is incompleteness, not breakage |
| Research | 10/20 | Root causes measured in `../architecture-findings.md`; the open judgement is theme specificity |
| **Total** | **33/70** | **Level 2** |

<!-- /ANCHOR:complexity -->
---

<!-- ANCHOR:questions -->
## 7. OPEN QUESTIONS

**Does `db-list-row-checkbox` get a rule or get deleted?** REQ-005 permits either. `src/views/list-renderer.ts:271`
applies it to an input that nothing styles; whether the list row wants its own size role or should
simply use the default is a decision the Stage-1 join informs, not one to settle in advance.

**Can the base rule win against a hostile theme without `!important`?** REQ-002 requires no ancestor in
the selector, which also means low specificity. Escalating to `!important` across the board re-creates
the documented source of silent reversal in this stylesheet. B5 measures three themes; whether a
theme that still wins is acceptable, or triggers the research gate, is not decided here.

**Did the criteria doctrine hold?** This spec is the program's method test. `checklist.md` §6 records
the verdict explicitly: whether criteria written this way caught what 1.3.1's criteria missed,
whether any criterion passed while the operator still saw the defect, and if so what would have
caught it and whether that changes how `001`, `002` and `003` are written.

<!-- /ANCHOR:questions -->
---

## RELATED DOCUMENTS

- **Folder neighbours**: `003-mobile-sheet-presentation` and `005-content-row-rhythm`. Folder
  numbering is an identifier, not the execution order; this phase runs second, right after `000`,
  per [`../spec.md`](../spec.md) §3.
- **Parent Spec**: [`../spec.md`](../spec.md)
- **Findings**: [`../architecture-findings.md`](../architecture-findings.md)
- **Predecessor**: `000-surface-contract-and-truthful-harness`
- **Successor**: `005-content-row-rhythm`
- **Implementation Plan**: See [`plan.md`](plan.md)
- **Task Breakdown**: See [`tasks.md`](tasks.md)
- **Verification Checklist**: See [`checklist.md`](checklist.md)
- **Acceptance Criteria**: See [`acceptance-criteria.md`](acceptance-criteria.md)
