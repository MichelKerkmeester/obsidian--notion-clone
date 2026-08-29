---
title: "Roadmap: UI improvement programme"
description: "Sequenced plan across desktop dropdowns, mobile sheets, performance, toolbar chrome and a Storybook component harness, with what has already shipped and what each stage is gated on."
trigger_phrases:
  - "ui improvement roadmap"
  - "desktop dropdown roadmap"
  - "storybook component harness"
importance_tier: "high"
contextType: "planning"
---
# Roadmap: UI improvement programme

<!-- SPECKIT_TEMPLATE_SOURCE: roadmap addon | v2.2 -->

## 1. WHERE THINGS STAND

Research is complete and recorded. `013-mobile-ux-research/` holds the authoritative device
inventory, a per-item decision matrix and a ten-iteration synthesis. `022-desktop-popover-research/`
and `023-performance-research/` each ran ten iterations and are synthesised.

**Shipped, gates green, uncommitted:** the TS2440 duplicate that blocked every release; ten missing
i18n keys across three locales plus a guard that walks all 1,281 literal `t()` keys; the FAB text
label on touch; the table peek routing to the editable detail panel on touch; and the split-button
radius asymmetry.

**The largest single win so far:** table rendering was quadratic because rows were appended to an
already-attached table. Building the body off-document and attaching once took a 2,000-row,
16-column render from **31.9 s to 0.17 s** — 186×, measured before and after on the same bench. It
also settles the windowing question: windowing would have reduced N against a curve, while removing
the curve was four lines. See `023-performance-research/baseline-finding.md`.

**Two claims corrected by inspection.** The New button's washed look is not a duplicate-selector
conflict — `styles.css:1608` is a shared toolbar base rule and `:3361` is a legitimate override; the
real defect was an 8px/6px radius mismatch between the two halves. And the round checkbox is not
caused by the four `.db-checkbox-cell input` rules; none of them set a radius. The plugin does not
own checkbox shape at all, so making it square deterministically means taking ownership.

## 2. STAGES

| # | Stage | Gated on |
|---|---|---|
| 1 | Acquire references: clone AnyType and AppFlowy into a gitignored `external/` | Gitignore entry lands first |
| 2 | Storybook harness | Decide what can render without a live Obsidian `App` |
| 3 | Popover contracts: width policy, bounds ownership, coordinate ownership | Storybook makes the result reviewable |
| 4 | Row vocabulary generalised from the column menu | Stage 3 contracts |
| 5 | Mobile sheet presentation split from placement | Stage 3 |
| 6 | Menu migration, one consumer at a time | Stage 4 vocabulary exists |
| 7 | Performance baseline, then one candidate | The decision gate in the perf synthesis |
| 8 | Toolbar chrome, column width input, checkbox ownership | Stage 4 |

## 3. WHY STORYBOOK COMES EARLY

The current screenshot harness renders hand-written fixture markup against the shipped stylesheet.
It cannot render the real renderers, which need a live Obsidian `App`, vault and metadata cache, so a
capture can pass while the renderer is broken. It also fingerprints `styles.css` on all 196 entries,
so any CSS edit stales every one and forces a full re-capture.

A component harness addresses the problem the popover research actually found: there is no shared
row vocabulary, and no way to see every popover side by side to notice that. It also gives the reuse
enforcement the operator asked for — a catalogue an agent can be pointed at before inventing a
fourth menu-row implementation.

**Open question, honestly.** How much of this plugin can render outside Obsidian is unknown. The
presentational layer — rows, sections, chips, checkboxes, the popover shell — plausibly can; anything
touching the vault cannot. Scope that boundary before building, and decide whether the harness
replaces the fixture screenshots or sits beside them.

## 4. CONSTRAINTS THAT SHAPE THE ORDER

`styles.css` is one 19,102-line file that must not be split, and every CSS edit invalidates all 196
captures, so CSS work is a single serialized lane. Desktop must not regress. BRAT overwrites local
installs from the GitHub release, so only a release reaches a device.
