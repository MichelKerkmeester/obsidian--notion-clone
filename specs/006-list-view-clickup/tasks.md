---
title: "Task Breakdown: List View as a ClickUp-Style Grid"
description: "Tasks grouped by the five planned phases, each naming the file it touches and the evidence that closes it."
trigger_phrases:
  - "006 list view tasks"
  - "list grid task breakdown"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "006-list-view-clickup"
    last_updated_at: "2026-08-30T12:00:00Z"
    last_updated_by: "desktop-screenshot-audit"
    recent_action: "T0.1 closed (Route B); T1.2a added for guard checks; T3.4 rewritten to the gutter"
    next_safe_action: "Start T1.1 and T1.2, then T1.2a before any guard is touched"
    blockers: []
    key_files:
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "list-view-clickup-006"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions: []
---
# Task Breakdown: List View as a ClickUp-Style Grid

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

- `[ ]` not started · `[~]` in progress · `[x]` closed with evidence
- **P0** blocks the phase · **P1** required for the phase to be complete · **P2** may defer to a
  follow-on packet, with the deferral recorded
- Every task names what it touches and the observable that closes it. A task closed without an
  observable is not closed.
- **T0.1 is closed.** ADR-001 is answered — Route B — so no task below is gated on it. The next
  gate is T1.2a: the two view-semantic guard checks must exist before T2.6 converts any guard.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

### Stage 0 — route decision (closed)

- [x] **T0.1 · P0** — Operator answers ADR-001: grid presentation mode or port.
      *Evidence:* **Route B.** Recorded in `decision-record.md` ADR-001, and re-judged against the
      four desktop captures with no change — no capability appeared that the grid renderer cannot
      express as a presentation option.
- [x] **T0.2 · P0** — If Route A is chosen, rewrite `plan.md` §3 and §4 and re-derive this file.
      *Evidence:* not applicable. Route B was chosen, so §3 and §4 stand as written.

### Stage 1 — grid contract

- [ ] **T1.1 · P0** — Add `isGridView(config)` in a shared module. No call sites yet.
      *Evidence:* a unit test covering all seven view types.
- [ ] **T1.2 · P0** — Confirm each of the eleven guard sites against `plan.md` §3, including the two
      marked *do not convert*.
      *Evidence:* a reviewed table; any disagreement resolved in §3, not silently.
- [ ] **T1.2a · P0** — Build the two view-semantic guard checks ADR-001 obliges, **before T2.6
      touches any guard**. Both failures pass `tsc` and the whole unit suite, so neither may be
      defended by a type check; each check drives the production render.
      *Evidence, G8:* with the guard converted, the check fails because the title column is absent —
      and it asserts more than the column's survival, because the four desktop captures show that
      column hosting the leading gutter, the collapse chevron, the record glyph and the row-action
      cluster. Assert the column **and** that those render inside it.
      *Evidence, G11:* with the guard converted, the check fails because a row created from a
      group's create affordance does not appear inside **that** group. Run it against a
      **multi-group** fixture; a single-group fixture passes it trivially.

### Stage 2 — a harness that can see the list

- [ ] **T1.3 · P0** — Make `tools/storybook/verify-placement.mjs` mount a real list view at the
      **production** mount point, not inside a helpful wrapper.
      *Evidence:* the harness renders a list with rows, groups and fields.
- [ ] **T1.4 · P0** — Prove the harness distinguishes: delete `.db-list-group-new` from the harness
      DOM and confirm an asserted number moves.
      *Evidence:* the number before and after.
- [ ] **T1.5 · P0** — Run the failing-number census; every criterion in `checklist.md` gets its
      "today" value.
      *Evidence:* no empty "today" cell remains.
- [ ] **T1.6 · P1** — Record the computed style of `db-list-group-new` and `db-list-row-checkbox` at
      the production mount point.
      *Evidence:* the measured values, expected to show no authored rules apply.
- [ ] **T1.7 · P1** — Capture the table bench baseline at 2,000 rows for NFR-01.
      *Evidence:* a bench number.
- [ ] **T1.8 · P1** — Confirm this phase changed nothing a user can see.
      *Evidence:* captures byte-identical, or every diff explained.

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

### Stage 3 — list grid structure

- [ ] **T2.1 · P0** — Take the `styles.css` lane.
      *Evidence:* `css-lane.json` records the acquire with this phase's name.
- [ ] **T2.2 · P0** — Introduce `data-db-row-style` on the grid and route the list render through the
      grid renderer.
      *Evidence:* a list view renders a `<thead>` and `<td>` elements.
- [ ] **T2.3 · P0** — Repeat the header row per group, as the group's first child, keyed on the
      group's existence and never on its row count (FR-02).
      *Evidence:* header count equals group count in a grouped list **whose fixture contains a
      zero-row group**, and that group also renders its create row. A fixture of non-empty groups
      passes an implementation that gets this wrong (AC-02, AC-30).
- [ ] **T2.4 · P0** — Wire `setupColumnHeader` so the list header sorts, resizes, reorders and opens
      the column menu (FR-03, FR-04).
      *Evidence:* rendered row-path order reverses on a header click and returns on a second.
- [ ] **T2.4a · P0** — Emit the direction-plus-ordinal sort indicator from the same header build path,
      so it appears on every repetition of the header row rather than the first (FR-03a).
      *Evidence:* indicator count equals group count, each carrying the same ordinal; removing the
      sort rule drops the count to 0.
- [ ] **T2.5 · P0** — Route list cells through `cell-renderer.ts` (FR-06), keeping `card-field-renderer`
      only where a list-specific mode needs it.
      *Evidence:* `files` and `rollup` columns render a non-empty cell in a list view.
- [ ] **T2.6 · P0** — Convert the nine convertible guards; leave G8 and G11 alone (FR-07).
      *Evidence:* fill, clipboard, keyboard grid navigation and tab-to-create work in a list, and the
      other five view types are unchanged.
- [ ] **T2.7 · P1** — Add the trailing add-column affordance (FR-05).
      *Evidence:* the button exists in the list header and creates a column.
- [ ] **T2.8 · P1** — Render the per-column calculation footer per group and for the view; flip G9
      (FR-08).
      *Evidence:* a footer value matches the table's for the same data.
- [ ] **T2.9 · P1** — Multi-field grouping in the list (FR-09).
      *Evidence:* a two-field grouped list renders nested groups with correct counts.
- [ ] **T2.10 · P0** — Preserve FR-17: row-click opens the detail panel, roving tabindex, stacked
      titles, wrapping fields.
      *Evidence:* each has a passing check; roving tabindex and cell-grid navigation are mutually
      exclusive and the switch is observable.
- [ ] **T2.11 · P0** — Build the row body detached and attach once (NFR-02).
      *Evidence:* bench at 2,000 rows within 20 percent of the T1.7 baseline.
- [ ] **T2.12 · P1** — Minimal CSS only; no chrome work in this stage.
      *Evidence:* diff review shows no colour, radius or shadow authored here.

### Stage 4 — ClickUp chrome

- [ ] **T3.1 · P0** — Row rhythm: flat, full-bleed, one hairline divider, no card border, no gap
      (FR-15).
      *Evidence:* measured row box and divider count per row.
- [ ] **T3.2 · P0** — Group header: the group value in the treatment its own field carries, with a
      count numeral beside it (FR-11).
      *Evidence:* for a group field carrying per-option colours, the pill background differs per
      group value; the numeral equals the row count. For a field with no per-option colours, two
      groups may legitimately share a neutral treatment and AC-15 does not apply — AC-27 is the row
      that must hold either way.
- [ ] **T3.2a · P1** — Give the group pill a signal that survives colour removal (FR-11a).
      *Evidence:* two groups differ in a rendered glyph or in pill text with colour excluded from the
      measurement; giving both groups the same value converges them.
- [ ] **T3.3 · P0** — Style `db-list-group-new`, the affordance with zero rules today (FR-12).
      *Evidence:* its computed style differs from the T1.6 baseline, and deleting it moves an
      asserted number.
- [ ] **T3.4 · P0** — Style the row checkbox and give the row a **leading gutter** that is reserved
      and empty at rest and holds the checkbox on hover, focus and selection. Do not swap it into the
      record-icon slot; the icon stays (FR-13, ADR-004).
      *Evidence:* the chevron, record icon and title sit at identical horizontal positions with the
      gutter empty and with it occupied, in all three states, and the checkbox box never intersects
      the record-icon box. Deleting the gutter collapses the two measurements into one.
      *Note:* the previous wording of this task asked for the swap and its evidence asserted the two
      elements share one box. Four desktop captures contradict both. Guard hover with
      `@media (hover: hover)` so a touch press leaves no stuck state, and make focus reveal the
      gutter too — a keyboard user must reach selection without a pointer.
- [ ] **T3.5 · P1** — Chip and pill treatments for multi-select, status and priority, with a `+N`
      overflow chip (C8, C11).
      *Evidence:* at a narrow width the overflow chip appears and the row height is unchanged.
- [ ] **T3.5a · P1** — Give a `select` or `status` cell an inline dropdown affordance visible at rest
      (FR-21). Colour keeps coming from the option, never from the value.
      *Evidence:* the affordance is present with nothing hovered, no popover open and no cell focused;
      deleting the node empties the measurement.
- [ ] **T3.5b · P2** — Split the chip treatments by field role: filled for a single-value select,
      outlined for multi-value reference columns (FR-22). Both today render through one filled
      `status-badge`.
      *Evidence:* the two treatments differ in a measured property other than hue, and a row with
      several values reads as one filled element plus outlined siblings.
- [ ] **T3.6 · P1** — Semantic date colouring, overdue and today distinguished (C9).
      *Evidence:* two colours measured, both at 4.5:1, and the distinction is not colour alone.
- [ ] **T3.7 · P2** — Faint placeholder in empty cells when `showEmptyFields` is on (FR-16).
      *Evidence:* placeholder present, contrast recorded.
- [ ] **T3.8 · P1** — Row density applies to the list and is offered in the config panel (FR-10).
      *Evidence:* three densities give three measured row heights.
- [ ] **T3.9 · P0** — Every value from the existing token scale (FR-18, NFR-07).
      *Evidence:* diff review, zero new literals.
- [ ] **T3.10 · P0** — Contrast and focus sweep across both themes (NFR-03, NFR-05).
      *Evidence:* computed-style probe output.
- [ ] **T3.11 · P0** — Full recapture, `screenshots:verify` exit 0, **human review signed off by name**.
      *Evidence:* the signature in `checklist.md`.
- [ ] **T3.12 · P0** — Release the `styles.css` lane against the four conditions in `plan.md` §2.
      *Evidence:* `css-lane.json` records the release with a note.

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

### Stage 5 — group affordances and selection

- [ ] **T4.1 · P0** — Fix F19: extend `syncGroupedSelectionInputs` past `.db-table` so list group and
      total checkboxes resync.
      *Evidence:* change the selection from the toolbar, then read the group checkbox — it reflects
      the change.
- [ ] **T4.2 · P1** — Per-group create row aligned under the first column, disabled for computed group
      fields.
      *Evidence:* offset measured; the disabled case still renders its explanatory row.
- [ ] **T4.3 · P1** — Bulk action bar behaviour matches the table's when list rows are selected.
      *Evidence:* same actions, same counts.
- [ ] **T4.4 · P2** — Group-level calculation numeral at the group's bottom-right (C15).
      *Evidence:* value matches the footer for that group's rows.

### Stage 6 — mobile and live verification

- [ ] **T5.1 · P0** — Phone layout: header, resize and reorder absent by the existing touch predicate;
      sorting still reachable.
      *Evidence:* harness at phone width.
- [ ] **T5.2 · P0** — Touch targets at least 44 by 44 CSS px, group toggle and checkbox included
      (NFR-04).
      *Evidence:* measured boxes.
- [ ] **T5.3 · P2** — Guards G5 and G10: external row patch and optimistic title updates for the list
      (FR-19).
      *Evidence:* patch applies without a full refresh; focus and scroll survive.
- [ ] **T5.4 · P0** — Live verification on device by the operator.
      *Evidence:* the operator confirms the screen changed. This is the only evidence that closes the
      packet.
- [ ] **T5.5 · P0** — Confirm no ephemeral marker reached a code comment.
      *Evidence:* a search for spec paths, packet and phase numbers, task and ADR ids across the diff
      returns nothing.
- [ ] **T5.6 · P0** — Confirm no AGPL or ClickUp material was copied.
      *Evidence:* diff review against the licence boundary in `plan.md` §2.

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## Completion Criteria

The packet is complete when:

1. Every P0 task is `[x]` with an observable recorded beside it.
2. Every criterion in `checklist.md` has a non-empty "today" cell, a target, and a passing result.
3. Every P1 task is either closed or explicitly deferred with a reason.
4. The `styles.css` lane is released and captures are signed off by name.
5. T5.4 is closed — the operator has looked at the running plugin and confirmed the change.
6. `validate.sh specs/006-list-view-clickup --strict` reports `RESULT: PASSED`.

A criterion that passes without its prior failure on record does not count toward 2.

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## Cross-References

- Requirements and the feature diff: [`spec.md`](spec.md) §4
- Phase order and the ordering argument: [`plan.md`](plan.md) §4
- Criteria and provenance: [`acceptance-criteria.md`](acceptance-criteria.md)
- Failing numbers: [`checklist.md`](checklist.md)
- The route: [`decision-record.md`](decision-record.md)
- Criteria doctrine: [`../005-component-surface-system/architecture-findings.md`](../005-component-surface-system/architecture-findings.md) §9

<!-- /ANCHOR:cross-refs -->
