---
title: "Implementation Plan: Notion Table Refinement"
description: "How the table refinement lands: guards before features, the three operator decisions before the rows that depend on them, the four type registries in one commit, and one recapture rather than four."
trigger_phrases:
  - "062 plan"
  - "notion table refinement plan"
  - "freeze leg"
  - "table guard leg"
importance_tier: "normal"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: plan-core | v2.2 -->
# Implementation Plan: Notion Table Refinement

<!-- SPECKIT_LEVEL: 3 -->

---

<!-- ANCHOR:summary -->
## 1. SUMMARY

### Technical Context

| Aspect | Value |
|--------|-------|
| **Language/Stack** | TypeScript, an Obsidian plugin; one bundled `styles.css` |
| **Framework** | None. The table is our own renderer over a plain `<table>` with a JS-driven colgroup |
| **Storage** | `ViewConfig` in the vault's plugin data — this packet adds two fields to it |
| **Testing** | Vitest for units; `tools/live/render-assertions.mjs` for the render harness; `tools/screenshots/` for the permanent capture corpus; `npm run gate` as the authority |

### Overview

Four legs. **Guards first**, because `050` ADR-004 says so and because five behaviours that are
already right have nothing holding them there — a leg that ships Freeze onto an unguarded table has
moved risk rather than reduced it. Then the **freeze adoption**, the only structural item. Then the
**quality-of-life batch**, whose rows are independent of each other and mostly one file each. Then
the **harness, captures and the operator's read**.

Three rows are gated on an operator decision and do not start until it lands: C4 on ADR-007, C8 on
ADR-006, and C1's divider treatment on ADR-005. The freeze mechanism itself does not wait — only
what the divider looks like in dark theme does.
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:quality-gates -->
## 2. QUALITY GATES

### Definition of Ready
- The criterion's red value is **observed** on the tree, not quoted from the research.
- The negative control is named before the fix is written.
- Where the row is gated on an ADR, the ADR is Accepted.

### Definition of Done
- `npx tsc --noEmit`, `npm run build` and `npx vitest run` each exit 0, output read.
- `npm run gate` exits 0, `$?` read directly rather than through a pipe.
- `npm run screenshots:verify` exits 0 and every changed PNG has been opened and looked at.
- The row's assertion is green on the tree and red under its own control, both observed.
<!-- /ANCHOR:quality-gates -->

---

<!-- ANCHOR:architecture -->
## 3. ARCHITECTURE

### Pattern

Additive, at the seams that already exist. Nothing here introduces a layer: the freeze state is a
`ViewConfig` array beside `columnWidths`, the menu row goes through `ColumnMenuActions` like the
twenty-five actions already there, and the offsets ride the colgroup widths the renderer already
computes.

### Key Components

| Component | Responsibility | Today |
|-----------|----------------|-------|
| `ViewConfig` (`src/data/types.ts:527-531`) | Holds `wrapText` and `columnWidths` | Gains `frozenColumnKeys` and the vertical-lines switch |
| `ColumnMenuActions` (`src/views/column-menu.ts:38-63`) | Twenty-five column actions | Gains `freezeColumn` |
| `TableRenderer.renderHeader` (`src/views/table-renderer.ts:606-667`) | Type icon, label, sort ordinal, add-column cell | Computes and applies the frozen offsets |
| `resolvesToWrappedCell` (`src/data/column-types.ts:425-427`) | The one place the wrap rule lives | Untouched — ADR-002 |
| The four type registries | The union, the list, the glyphs, the labels | Must move together |
| `tools/live/render-assertions.mjs` | The render harness the wrap fix was proved on | Gains the guards and the freeze offset row |

### Data Flow

```
ViewConfig.frozenColumnKeys ──► renderHeader ──► per-column left offset
                                     │              (Σ preceding frozen widths)
                                     ▼
                            th/td position: sticky
                                     │
                       .is-scrolled-x ──► divider
```
<!-- /ANCHOR:architecture -->

---

<!-- ANCHOR:affected-surfaces -->
## FIX ADDENDUM: AFFECTED SURFACES

| Surface | Reached by | Effect |
|---------|-----------|--------|
| Desktop table | C1, C5, C6 | Frozen columns, a visible handle, an optional border |
| Phone table | C2 (footer floor), C9 | No freeze by design (`styles.css:21021-21035`); the footer floor is guarded |
| Docked record peek | C7 | An empty property reads as empty |
| Column type popover | C4 | Five more rows, one glyph each |
| Date cell and its editor | C3 | A range renders; the picker gains a row |
| Every table capture | C6's border gate | One recapture, read by scenario rather than by count |
<!-- /ANCHOR:affected-surfaces -->

---

<!-- ANCHOR:phases -->
## 4. IMPLEMENTATION PHASES

| Leg | Content | Gate |
|-----|---------|------|
| **Leg 1 — Guards** | T001-T005: the five permanent assertions on behaviours already right | Each green on the tree and red under its own control |
| **Leg 2 — Freeze** | T010-T013: the config field, the action and row, the sticky CSS, the round-trip test | The offset arithmetic within ±1px; unfreeze collapses it |
| **Leg 3 — Quality of life** | T020-T025: date end, type registries, handle, border switch, peek placeholder, add-row noun | One threshold each, each red first |
| **Leg 4 — Harness, captures, device** | T030-T033: two new scenarios, the recapture, the gate, the operator's read | `npm run gate` 0; the operator's own words |
<!-- /ANCHOR:phases -->

---

<!-- ANCHOR:testing -->
## 5. TESTING STRATEGY

**The lanes this packet extends already exist.** No new lane is created:
`tools/live/render-assertions.mjs` carries the wrap-toggle passes the row-height fix was proved on
and is where the guards and the freeze offset row go. `tools/screenshots/scenarios/core.mjs` carries
`table-wrap-off` and `table-wrap-on` and is where the two new visual states register.

**Every guard carries the negative control that makes it mean something.** In order:

| Guard | Control that must go red |
|-------|--------------------------|
| Footer zero-row skip and 44px phone floor | Remove the `rows.length === 0` return; drop the `min-height` rule |
| Header composition | Drop the `renderPropertyTypeIcon` call |
| Inline chips and the 560px measurer cap | Stack the chips in a block container; remove the cap |
| Per-option pill colour | Force one colour for the whole column |
| Conditional row tint | Delete the `tr.db-conditional-format > td` paint rule |

**Unit coverage** is the round-trip on `frozenColumnKeys`, the date range's display form including
the malformed cases in `spec.md` §8, and the four-registry agreement check.

**Capture coverage**: two scenarios, `table-frozen-column` and `table-vertical-lines-off`, each in
dark and light, registered in the same change that creates the state — a registered-but-uncaptured
scenario is reported as a failure, which is the property that keeps this honest. Their `sources`
lists must name every file the capture actually depicts.

**What no harness here can do**: the render harness draws fixture markup against the shipped
stylesheet, not the real renderers, and it stands in for what Obsidian supplies. It cannot answer
WebKit's sticky-inside-table behaviour, dark-theme colour on a real panel, or a 390px title cell's
hit areas. Those are C9 and they are the operator's.
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:dependencies -->
## 6. DEPENDENCIES

- **ADR-005, ADR-006, ADR-007** — operator decisions gating C1's divider, C8 and C4.
- **`053` and `052` file groups** — one leg holds one group (D7); `styles.css` is serialized by the
  parent's CSS lane.
- **`050` ADR-005 and `../design-system.md` §12** — bind every new colour, in both themes.
- **The capture corpus must be current before Leg 3's border row lands**, so the diff after it is
  readable.
<!-- /ANCHOR:dependencies -->

---

<!-- ANCHOR:rollback -->
## 7. ROLLBACK PLAN

Every leg is one revertible commit range including its recapture. `frozenColumnKeys` is additive and
optional, so a revert leaves stored configs carrying a field nothing reads — inert by NFR-R01, not
corrupt. No migration runs, so nothing needs reversing.
<!-- /ANCHOR:rollback -->

---


---

<!-- ANCHOR:phase-deps -->
## L2: PHASE DEPENDENCIES

```
Leg 1 (guards) ──► Leg 2 (freeze) ──► Leg 4 (harness, captures, device)
                          ▲                        ▲
                          └── Leg 3 (QoL) ─────────┘
```

| Leg | Depends On | Blocks |
|-----|------------|--------|
| Leg 1 — guards | None | Nothing; it runs first by rule, not by dependency |
| Leg 2 — freeze | Leg 1 (so a regression is visible), ADR-005 for the divider only | Leg 4's capture |
| Leg 3 — quality of life | ADR-006 for C8, ADR-007 for C4; the rest are independent | Leg 4's recapture |
| Leg 4 — harness and read | Legs 2 and 3 | Closure |
<!-- /ANCHOR:phase-deps -->

---

<!-- ANCHOR:effort -->
## L2: EFFORT ESTIMATION

| Leg | Complexity | Estimated Effort |
|-----|------------|------------------|
| Leg 1 — guards | Low | Five assertions and five controls, no production change |
| Leg 2 — freeze | High | A config field, a menu row, sticky CSS with computed offsets, a round-trip test |
| Leg 3 — quality of life | Medium | Six independent rows; the type set is four files in one commit |
| Leg 4 — harness and read | Medium | Two scenarios, one recapture, the gate, then the operator's sitting |
| **Total** | | **~950 LOC across ~15 files**, per the level scoring in `spec.md` §9 |
<!-- /ANCHOR:effort -->

---

<!-- ANCHOR:enhanced-rollback -->
## L2: ENHANCED ROLLBACK

### Pre-deployment Checklist
- [ ] N/A — no data migration, so no backup
- [ ] N/A — this repository ships no feature flags; a leg is reverted, not disabled
- [ ] The capture corpus is current before the border row lands

### Rollback Procedure
1. Revert the leg's commit range, code and recapture together.
2. Re-run `npm run gate` and read `$?` without a pipe.
3. Re-run `node tools/screenshots/verify.mjs` and confirm the corpus is current again.
4. Record the revert in `tasks.md` on the row it undoes, with the failing figure.

### Data Reversal
- **Has data migrations?** No.
- **Reversal procedure**: N/A. `frozenColumnKeys` and the vertical-lines switch are optional fields;
  a reverted build ignores them and NFR-R01 requires that to be inert.
<!-- /ANCHOR:enhanced-rollback -->

---


---

<!-- ANCHOR:dependency-graph -->
## L3: DEPENDENCY GRAPH

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Leg 1     │────►│   Leg 2     │────►│   Leg 4     │
│   Guards    │     │   Freeze    │     │   Verify    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                          │
                    ┌─────▼─────┐
                    │   Leg 3   │
                    │  Parallel │
                    └───────────┘
```

### Dependency Matrix

| Component | Depends On | Produces | Blocks |
|-----------|------------|----------|--------|
| Guards (T001-T005) | None | Five permanent assertions | Nothing, by design — they protect everything after |
| `frozenColumnKeys` (T010) | None | The config field | T011, T012, T013 |
| Freeze action and row (T011) | T010 | A menu row with checked state | T012 |
| Sticky CSS (T012) | T010, T011 | The offsets and the divider | T030's capture |
| Type registries (T021) | ADR-007 | Eighteen agreeing rows | T031's recapture |
| Border switch (T023) | None | A gated `td` border | T031's recapture |
| Captures (T030) | T012, T023 | Two new visual states, dark and light | T032 |
| Device read (T033) | Everything | AC-009 | Closure |
<!-- /ANCHOR:dependency-graph -->

---

<!-- ANCHOR:critical-path -->
## L3: CRITICAL PATH

1. **T001-T005** the guards — first by rule (`050` ADR-004), and they are what makes every later
   leg's regression visible rather than silent.
2. **T010 → T011 → T012** the config field, the action, the sticky CSS — the only structural
   adoption in the packet and the one item Notion genuinely has that we do not.
3. **T030 → T031** the two new capture scenarios and the recapture, read by scenario rather than by
   count.
4. **T032 → T033** the gate, then the operator's device read — and the second is the operator's.

**Total Critical Path**: Leg 1 → Leg 2 → Leg 4 → the operator's sitting.

**Parallel Opportunities**:
- Every row in Leg 3 is independent of every other, except that they share `styles.css` and
  serialize through the CSS lane.
- T020 (date end) touches `052`'s files and does not contend with Leg 2 at all.
- T024 (peek placeholder) is a single-line change in a file nothing else here touches.
<!-- /ANCHOR:critical-path -->

---

<!-- ANCHOR:milestones -->
## L3: MILESTONES

| Milestone | Description | Success Criteria | Target |
|-----------|-------------|------------------|--------|
| M1 | Nothing right can break silently | AC-002 `Met`; five controls each observed red | Leg 1 |
| M2 | The gap is closed | AC-001 `Met`; offset within ±1px, round-trip green, unfreeze collapses | Leg 2 |
| M3 | The small items land | AC-003 to AC-008 `Met` or explicitly deferred with the ADR named | Leg 3 |
| M4 | The corpus tells the truth | Two new scenarios captured and looked at; `npm run gate` 0 | Leg 4 |
| M5 | Read on a device | AC-009, in both themes, against one build | The operator |
<!-- /ANCHOR:milestones -->

---

## L3: ARCHITECTURE DECISION RECORD

The decisions live in `decision-record.md` in full. In short: **ADR-001** keeps our title-column
menu convention against Notion's shorter one; **ADR-002** records that the wrap defect landed on
`main` and corrects the resolution rule the research quoted; **ADR-003** puts the *Conditional
color* naming question to the operator; **ADR-004** restates the colour guardrail as binding on
every new tint; **ADR-005** scopes freeze to desktop and asks what its divider does in dark theme;
**ADR-006** asks where the add-row noun comes from; **ADR-007** asks whether a type-picker row ships
before the data type behind it. ADR-001, ADR-002 and ADR-004 are Accepted because a landed ruling or
a landed commit already decides them. The other four are **Proposed** and the operator moves them.

---

## L3: AI EXECUTION PROTOCOL

Written as instructions rather than as a form, because the failure this packet is most exposed to is
an agent quoting a research finding that the tree has already overtaken — which happened once
before this packet opened.

### Pre-Task Checklist

- Re-read the row's red value **against the tree**, not against `acceptance-criteria.md`. Every red
  here was true at `94f03c88` and this repository moves daily.
- Confirm the row is not blocked on an ADR that is still Proposed. Three are.
- Name the negative control before writing the fix.
- Confirm no other leg is holding the same file group (D7).

### Execution Rules

| Rule | Why it is here |
|------|----------------|
| An absence is proven by grepping **symbols**, never phrases | The digest's `conditional.color\|rowColor` grep read a shipping feature as absent |
| A guard asserts a **computed** style or a measured rect | A guard that asserts presence goes green over the divergence it exists to catch |
| No colour comes from a Notion capture | All 102 screens are light theme; there is nothing there to take |
| A Proposed ADR is not moved to Accepted by an agent | Parent D15 |
| One leg, one file group; `styles.css` serializes through the CSS lane | `053` D6, carried as D7 |

### Status Reporting Format

Report per row: the threshold, the red value **observed** with its `file:line`, the green value
observed after, and the negative control seen red. A row reported without its control is reported
as incomplete, not as done.

### Blocked Task Protocol

A row blocked on an operator decision (T021, T025, T033) stops and says so, naming the ADR and what
the operator has to choose between. It does not pick the likely answer and proceed — ADR-007's three
options exist because the likely answer was the wrong one.
