---
title: "Goal: Sheet Visual Parity"
description: "The durable directive this programme executes against: eleven sheets, one at a time, each closed by an image-judged side-by-side rather than a DOM lane."
trigger_phrases:
  - "packet goal"
  - "076 goal"
  - "sheet visual parity goal"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Opened the goal with eleven unticked sheet rows and the operator row"
    next_safe_action: "Execute 001 CREATE: T001 transcribes ADR-I/J/K, T002 lands L1-L9 RED"
    blockers:
      - "Rungs 1 and 2 of D3's reference precedence are empty; every child works structurally from a 299x678 thumbnail"
    key_files:
      - "spec.md"
      - "goal.md"
      - "decision-record.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "076-sheet-visual-parity-scaffold"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the image judge ever disagree with the operator's own read, and if so what changes"
    answered_questions:
      - "Pass is 14/16 with no row at 0, judged twice consecutively on an unchanged tree"
      - "071 is not reopened; its landings are the regression floor each child re-runs"
---
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
# Goal: Sheet Visual Parity

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Each of eleven phone sheets, taken one at a time and in the operator's own order,
reads as Notion's own sheet does — frame, sections, row anatomy, controls, type, spacing, colour,
both themes — judged by opening our capture beside the reference and scoring it, not by a lane
going green.

### The rulings this executes

The operator, 2026-09-10 ~21:40, verbatim:

> *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"*

> *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*

Standing: *"Ui improvement is focus here"*.

### Decisions

| ID | Decision |
|----|----------|
| D1 | The image judge is a required gate. A sheet closes at **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. Lanes are the floor beneath it, never the ceiling above it |
| D2 | A sheet's target binds **every** production surface that renders its grammar, not just the renderer it is named after; and every parity capture must come from a scenario that mounts production — audited true for all eleven, recorded so it stays true |
| D3 | Reference precedence: operator capture > Notion iOS full-res > Mobbin 299×678 thumbnail > Anytype. Rungs 1 and 2 are empty, so **no numeric threshold may be derived from a reference asset**. D15 preserved: a contradiction with a landed Anytype ruling becomes a Proposed ADR |
| D4 | One sheet at a time, in order. `001` — the settings sheet — is first, because the operator named it and because its card vocabulary is what the other ten inherit |
| D5 | Only the operator's own device read closes the alignment judgement. **No agent ticks an operator row** |

### Operator copy

The operator holds this directive as the session objective, and that copy is
what judges completion, not this file. Whenever anything above the log changes,
resend the full text of this file in chat so the operator can update their copy.
A child goal change that alters a parent decision or criterion is an amendment
to the parent: apply it there first, then resend the parent.
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

Each child's own `goal.md` mirrors this file's thresholds — the 14/16 rubric floor, the no-zero
rule, the twice-consecutive requirement and the unticked operator row — and adds only the rows its
own sheet owes.

| Child | What it must reach |
|---|---|
| `001-settings-sheet-visual-parity` | The Settings sheet reads as Notion's **View options**: several inset cards, navigation rows with a leading icon and a trailing value + chevron, bordered inputs only for naming, no helper paragraphs |
| `002-properties-sheet-visual-parity` | The Properties row reads **handle · type icon · label · eye**, in `Shown` / `Hidden` cards with an inline bulk link on each header |
| `003-filter-sheet-visual-parity` | The filter sheet **and** the active-rule filter popover both read as one grouped condition card, not three bordered pills |
| `004-sort-sheet-visual-parity` | The sort sheet **and** the active-rule sort popover read as one merged property+direction card with a labelled delete |
| `005-group-sheet-visual-parity` | The group sheet reads as its reference, with any shown/hidden partition justified by our own consistency rather than an unobserved Notion screen |
| `006-add-view-sheet-visual-parity` | The Add view sheet reads as Notion's Layout screen: a selection grid plus one card of settings rows |
| `007-property-editor-sheet-visual-parity` | Name field plus an inline type list in the same sheet, with the delete row's styling settled by evidence rather than assumption |
| `008-record-sheet-visual-parity` | The record sheet's property rows and header read as the reference's |
| `009-menu-and-confirm-visual-parity` | Record menu, cell menu and destructive confirm read as the reference's, with the confirm's action order settled |
| `010-picker-sheets-visual-parity` | Date, icon, colour and property-type pickers each read as their reference |
| `011-toolbar-overflow-and-column-width` | Toolbar overflow and the column-width sheet read as their references |
| `012-board-card-fields` | Not one of the eleven sheets — the board card's meta grid renders one field per full-width row, never two side by side, judged against Anytype (the board's own landed parity target) rather than Notion |
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

**This table is the outer loop graph's DONE WHEN (`decision-record.md` D6, `plan.md` §6A).** The
outer graph itself terminates once every child's inner state log reports `DONE:pass` — two
consecutive JUDGE passes on an unchanged tree per child. That is necessary, not sufficient: the rows
below only tick when the operator has *also* independently confirmed each sheet on their own device
(D1, D5). `program-loop.sh` reads `DONE:pass` off `$S/loop/<child>.jsonl`; the final row below reads
the operator's own confirmation, and no agent ticks it.

- [ ] `001-settings-sheet-visual-parity` — judge ≥ 14/16, no 0, twice consecutively; lane green
- [ ] `002-properties-sheet-visual-parity` — judge ≥ 14/16, no 0, twice consecutively; lane green
- [ ] `003-filter-sheet-visual-parity` — judge ≥ 14/16, no 0, twice consecutively, **both** filter surfaces; lane green
- [ ] `004-sort-sheet-visual-parity` — judge ≥ 14/16, no 0, twice consecutively, **both** sort surfaces; lane green
- [ ] `005-group-sheet-visual-parity` — judge ≥ 14/16, no 0, twice consecutively; lane green
- [ ] `006-add-view-sheet-visual-parity` — judge ≥ 14/16, no 0, twice consecutively; lane green
- [ ] `007-property-editor-sheet-visual-parity` — judge ≥ 14/16, no 0, twice consecutively; lane green
- [ ] `008-record-sheet-visual-parity` — judge ≥ 14/16, no 0, twice consecutively; lane green
- [ ] `009-menu-and-confirm-visual-parity` — judge ≥ 14/16, no 0, twice consecutively; lane green
- [ ] `010-picker-sheets-visual-parity` — judge ≥ 14/16, no 0, twice consecutively; lane green
- [ ] `011-toolbar-overflow-and-column-width` — judge ≥ 14/16, no 0, twice consecutively; lane green
- [ ] `012-board-card-fields` — judge ≥ 14/16, no 0, twice consecutively against Anytype; lane green (not one of the eleven sheets; does not gate or depend on their sequence)
- [x] No `071` clause regressed: `node tools/live/sheet-grammar.mjs` exit 0 across all eleven sheet landings
- [x] No `056`/`045` board clause regressed: `render-assertions.mjs` exit 0 for `012`'s own landing
- [ ] The operator re-reads the sheets and the board on their own iPhone and reports them aligned — **no agent ticks this row**
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

### 2026-09-10 — opened

Scaffolded from the operator's ~21:40 ruling. Before anything was written, the three captures the
operator cited were opened and their producers confirmed: the Properties row still emits
`arrow-up`/`arrow-down` and a checkbox (`record-surface/property-row.ts:405-417`) under a lane that
reads 3 controls and passes; the Settings sheet still builds from fourteen input/textarea
constructions plus `settings.*.desc` helper strings; and the filter three-in-a-row the operator
saw is the **active-rule popover**, a second production surface `071/008` never touched, not the
filter sheet, which did get its stacked rows.

The suspected fixture-versus-production gap was checked and **disproved** — all eleven sheets are
photographed through the production mount path already. Recorded as D2(b) so it stays true rather
than being re-derived.

Three reference reads were taken against `screenshots/notion/ios/**` and each returned explicit
gaps rather than guesses: Notion's AND/OR conjunction control, its sort-rule reorder affordance and
its grouped shown/hidden screen are **not present in any capture here**. Those gaps bind `003`,
`004` and `005` under D3.
<!-- /ANCHOR:log -->
