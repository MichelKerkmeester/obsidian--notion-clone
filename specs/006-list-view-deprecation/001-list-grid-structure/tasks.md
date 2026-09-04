---
title: "Task Breakdown: Phase 001 — List Grid Structure"
description: "SUPERSEDED 2026-09-04 (ClickUp direction, replaced by the list-view deprecation). Lane take, gutter decision, render dispatch, header, cells, the seven-guard conversion behind the tripwires, reading-behaviour removal, bench."
trigger_phrases:
  - "006 phase 001 tasks"
importance_tier: "critical"
contextType: "planning"
---

> **SUPERSEDED — 2026-09-04.** This phase belongs to the ClickUp direction, which the operator
> replaced: *"Also deprecate list view completely"*. Nothing here binds. It is kept in place, with
> its content intact, because it is the record of what the direction was and why it changed. The
> live direction is [`../spec.md`](../spec.md); the deprecation runs in children `005` through
> `008`.

# Task Breakdown: Phase 001 — List Grid Structure

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

- `[ ]` not started · `[~]` in progress · `[x]` closed with evidence
- **P0** blocks the phase · **P1** required for the phase to be complete · **P2** may defer, with the
  deferral recorded
- Every task names what it touches and the observable that closes it.
- Task ids continue the parent's `T2.x` series so cross-references in the packet stay valid.
- **T2.6 is the guard conversion and it is gated.** It may not start until phase 000's tripwires are
  armed and demonstrated failing against their deliberately converted guards.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [ ] **T2.1 · P0** — Take the `styles.css` lane.
      *Evidence:* `css-lane.json` records the acquire with this phase's name and a `baselineHash`.
- [ ] **T2.1a · P0** — Confirm phase 000's two tripwires run against this tree and its census is on
      record.
      *Evidence:* both checks execute; no "today" cell this phase owns is blank.
- [ ] **T2.1b · P0** — Record ADR-P1-01: is the leading gutter emitted as its own header cell or as
      padding on the first cell?
      *Evidence:* the decision written in `decision-record.md`, with the consequence for `AC-01`'s
      utility-column count stated. `AC-01` may not be measured before this.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Stage C — the structural swap

- [ ] **T2.2 · P0** — Introduce `data-db-row-style` on the grid and route the list render through the
      grid renderer at the render-dispatch site.
      *Evidence:* a list view renders grid DOM — a header container and cell elements — at the
      production mount point.

### Stage D — header, repetition, sort

- [ ] **T2.3 · P0** — Repeat the header row per group as the group's **first child**, keyed on the
      group's existence and **never on its row count**.
      *Evidence:* `AC-02` and `AC-30`, both against a fixture containing a **zero-row group**. A
      fixture of non-empty groups does not close either.
- [ ] **T2.4 · P0** — Clicking a header sorts; shift-click appends a rule; the same handler serves
      both views.
      *Evidence:* `AC-03` — the **order of rendered row paths** reverses on a click and returns on a
      second. Not the presence of a header, and not `aria-sort`.
- [ ] **T2.4a · P0** — Emit the direction-plus-ordinal indicator from the same header build path, so
      it appears on **every** repetition rather than only the first.
      *Evidence:* `AC-28` — the indicator count equals the group count and every instance carries the
      same ordinal.

### Stage E — cells and column controls

- [ ] **T2.5 · P0** — Route list cells through the shared cell pipeline.
      *Evidence:* `AC-05` — a `files` column and a `rollup` column both render non-empty in a list.
- [ ] **T2.5a · P1** — Wire the column menu, the resize handle and drag-to-reorder from the table's
      controller, on pointer devices.
      *Evidence:* `AC-04` — the rendered track width after a drag matches within 1px.
- [ ] **T2.5b · P1** — Close the header row with the trailing add-column affordance.
      *Evidence:* the affordance follows the **last column**, not the viewport edge.

### Stage F — the guard conversion

- [ ] **T2.6 · P0 · GATED** — Convert **seven** of the eleven guards to the grid predicate: G1, G2,
      G3, G4, G6, G7 and G9. One commit.
      *Four are excluded and for two different reasons.* G8 and G11 are view-semantic and are **never**
      converted. G5 and G10 are **deferred to phase 004** by the parent's `plan.md` §3 — they change
      behaviour under concurrent edits and neither is needed to make the list a grid.
      *Gate:* phase 000's tripwires armed and demonstrated failing. Do not start otherwise.
      *Evidence:* **both tripwires pass against this tree**, and the six-view regression is clean for
      board, gallery, calendar, timeline and chart.
- [ ] **T2.6a · P0** — Confirm the conversion commit is atomic and revertible whole.
      *Evidence:* a revert of that single commit restores table-only behaviour with no residue. Two
      of the seven change config-writing behaviour, so a partial revert is not safe.

### Stage G — what the guards unlock

- [ ] **T2.7 · P0** — Cell range selection, fill, clipboard copy/cut/paste in the list.
      *Evidence:* `AC-06` — the clipboard payload for a range equals the table's for the same range.
- [ ] **T2.7a · P0** — Keyboard grid navigation and tab-past-last-cell row creation.
      *Evidence:* `AC-07` — tabbing past the last cell of the last row creates exactly one row.
- [ ] **T2.8 · P1** — Per-column calculation footer, per group and for the view.
      *Evidence:* `AC-08` — the footer value equals the table's for the same data.
- [ ] **T2.8a · P1** — Multi-field grouping at the table's depth model.
      *Evidence:* `AC-09` — rendered group depth is 2 for a two-field grouping.

### Stage H — remove the reading behaviours

- [ ] **T2.9 · P0** — Remove row-click-opens-record; the list opens on a target cell as the table
      does.
      *Evidence:* the replaced `AC-10`.
- [ ] **T2.9a · P0** — Replace the roving-tabindex card keyboard model with cell-grid navigation. The
      two are mutually exclusive; do not ship both behind a flag.
      *Evidence:* the replaced `AC-10`.
- [ ] **T2.9b · P1** — Remove stacked file titles and the `max-content` wrapping default; cell text
      truncates.
      *Evidence:* no row occupies two text lines in the harness at the default width.
- [ ] **T2.9c · P0** — Confirm **no compatibility flag, fallback path or reading-mode toggle** was
      added to soften the removal.
      *Evidence:* the scoped diff contains no such branch. A parallel path recreates the
      two-implementations problem this packet exists to remove, and it was not asked for.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [ ] **T2.10 · P0** — Enumerate every site that references a list class by name **before** any
      rename lands: the selection-sync selector list, the screenshot scenarios, the Storybook
      stories, the surface-contract test.
      *Evidence:* the four sites listed, each with its updated reference.
- [ ] **T2.11 · P0** — Bench a 2,000-row list against the phase 000 table baseline.
      *Evidence:* `NFR-01` within 20 percent. **Do not release the lane on a regression.**
- [ ] **T2.12 · P0** — Confirm the minimum-CSS boundary held: this phase wrote only what stops the
      result being unreadable.
      *Evidence:* the `styles.css` diff, reviewed against 002's scope. Anything that could be called
      styling belongs to 002, where it is graded against numbers 000 recorded.
- [ ] **T2.13 · P1** — Confirm no code comment written by this phase carries a spec path, packet
      number, phase number, task id, ADR id or requirement id — especially at the two guards that
      must not be converted.
      *Evidence:* a grep of the scoped diff.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

1. A list view renders grid DOM at the production mount point.
2. Clicking a header reorders rendered rows; the indicator repeats per group with the same ordinal.
3. Seven guards converted in one revertible commit; **both tripwires pass**; the six-view regression
   is clean. G5 and G10 remain for 004; G8 and G11 remain untouched.
4. `files` and `rollup` render; cell selection, clipboard, keyboard and footer work in the list.
5. The four reading behaviours are removed, with no compatibility path.
6. `NFR-01` within 20 percent of the 000 baseline.
7. The lane is still held, for 002.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- [`spec.md`](spec.md) §4.1 — the FR-17 reversal and what is lost.
- [`plan.md`](plan.md) §3 — the two guards that do not convert, and why comment hygiene bites here.
- [`decision-record.md`](decision-record.md) — ADR-P1-01, the leading-gutter emission decision.
- [`../000-grid-contract-and-list-harness/acceptance-criteria.md`](../000-grid-contract-and-list-harness/acceptance-criteria.md)
  — the tripwires this phase is gated on.
- [`../acceptance-criteria.md`](../acceptance-criteria.md) — the criteria register.

<!-- /ANCHOR:cross-refs -->
