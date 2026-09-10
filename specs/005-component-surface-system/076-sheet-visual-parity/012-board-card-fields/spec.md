---
title: "Feature Specification: Phase 12: Board Card Fields Never Wrap Side by Side"
description: "The board card's meta grid lays two fields per row above 360px, truncating labels to a few characters and clipping values; every field must render on its own full-width line, as it did before 045's field-names leg silently reversed the landed Anytype ruling."
trigger_phrases:
  - "076 phase 12"
  - "board card fields visual parity"
  - "012 define table"
  - "board card meta grid single column"
  - "fields never wrap"
importance_tier: "important"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/012-board-card-fields"
    last_updated_at: "2026-09-10T22:00:00Z"
    last_updated_by: "board-card-fields-create"
    recent_action: "CREATE: single-column meta grid landed; lane, captures and 28-lane gate green"
    next_safe_action: "Run LAND, then the image judge; two consecutive passes on an unchanged tree close the child"
    blockers:
      - "This child's own reference is Anytype, not Notion — the board's parity target per 056 ADR-001 — because no Notion iOS capture in this repository shows a board card carrying more than a title (D3 rung 3 returns a structural gap, not a card grammar)"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "styles.css"
      - "tools/live/render-assertions.mjs"
      - "src/views/card-field-renderer.ts"
      - "src/views/board-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "012-board-card-fields-scaffold"
      parent_session_id: "076-sheet-visual-parity-scaffold"
    completion_pct: 70
    open_questions:
      - "Every value in the Anytype reference is structural. No pixel size, no hex and no font size may be taken from a screenshot"
    answered_questions:
      - "The label stays visible (045's later argument — a value without its name does not say which property it belongs to; the operator's ruling names wrapping, not naming): the landed clause proves 0 of 306 painted property names clipped at the card's full width, the value keeping its own 1-line clamp"
      - "045-board-card-properties's mechanism (which properties appear, and the panel that configures them) is unaffected; only the meta grid's column count and the label/value truncation rules move (056 ADR-003's guard applies here too: `board-card-properties-panel.test.ts` stays green unmodified)"
      - "The board card is already photographed through the production mount path (`constructedScenario(\"board\", …)`); no scenario work is owed"
      - "The two-column grid is not merely undocumented — it is asserted and PASSING in `tools/live/render-assertions.mjs`'s own 'meta grid' clause today, which is the same green-lane-over-a-wrong-picture failure mode D1 was written to catch (§13 records where)"
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 12: Board Card Fields Never Wrap Side by Side

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

The board card's property grid (`.obnotion-kanban-card-meta`) lays two fields side by side at any viewport 360px or wider, so a card with typical field names truncates its labels to a few characters ("D…", "Relat…", "L…", "Margi…", "Sum…") and clips its values ("June 30,…", "https://examp…"), while a chip row — which already spans the full card width — wraps cleanly. This is not a fixture gap: the two-column layout is a deliberate, working rule, asserted and passing in `tools/live/render-assertions.mjs`'s own "meta grid" clause, and it directly reverses `056-board-anytype-parity`'s own landed **ADR-008**, which put the kanban card's values at `text-align: left; word-break: normal` specifically so a value would wrap or ellipsise on its own line rather than break mid-word — a rule that only means something in a single-column card.

**The gate that closes this child is an image judge, not a lane** (parent D1). Our capture is opened beside Anytype's mobile kanban card — the board's own landed parity target (`056` ADR-001), not Notion, because no Notion iOS capture in this repository shows a board card carrying more than a title — and scored on the eight-row rubric in `../spec.md` §5; pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree. The lane clauses in §13 are the floor that stops a landed value drifting, and they are never sufficient on their own.

**Critical dependencies**: none on the other ten sheet children — this child touches the board's card renderer and its own share of `styles.css`, not a sheet — but it holds the same shared css-lane triplet every other `076` child holds, so it runs its own turn rather than in parallel with one (parent D4's rationale, extended to a twelfth holder).

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | In progress — CREATE and SCREENSHOT landed; the judge (twice, unchanged tree) and the operator's read remain |
| **Created** | 2026-09-10 |
| **Branch** | `worktrees/293-board-card-fields-plan` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `076-sheet-visual-parity` |
| **Predecessor** | `../011-toolbar-overflow-and-column-width/spec.md` (last of the eleven sheets in run order) |
| **Successor** | None — twelfth and, at scaffold, final child |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 12** of the Sheet Visual Parity programme, opened by the operator's 2026-09-10 ~21:43 ruling, made while reading the same 0.0.38 build the programme's own opening ruling (§2, `../spec.md`) was made against:

> *"Btw fields in board cards should never wrap always under each other add phase for that too"*

Evidence: the operator's iPhone screenshot (0.0.38, board view, `By Status`), read this session. Two cards are visible: one shows a two-column grid of label/value pairs where the labels have truncated to "D…", "Relat…", "L…", "Margi…", "Sum…" and values clip mid-string ("June 30,…", "https://examp"); the other shows the same grid alongside a relation-chip row, which wraps onto its own line without truncating anything, because the chip row already spans the full card width (`styles.css:10259-10261`, `:has(.has-badges) { grid-column: 1 / -1; }`) while every other field row does not.

**Scope boundary**: the board card's meta grid — every phone and desktop presentation of it — and nothing else on the board. Presentational only; `045-board-card-properties`'s mechanism (which properties show, and the panel that configures them) is unaffected, per `056` ADR-003's guard, extended here.

**Deliverables**: a completed DEFINE table (§13), one lane clause per measurable row (extending, not replacing, `render-assertions.mjs`'s existing board-geometry pass), the producer/stylesheet changes that reach them, a current capture set (board view, phone + desktop, light + dark), and a `verification.md` carrying the judge's score table once per iteration.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The board card's property rows (`.obnotion-kanban-card-meta .obnotion-board-card-field`) render in a two-column CSS grid at any viewport 360px or wider (`styles.css:10178-10188`), which the shared per-field renderer's label span (`card-field-renderer.ts:105`) was never built to fit inside: at half the card's width, an ordinary property label — `Due date`, `Related tasks`, `Link`, `Margin %`, `Summary` — has nowhere near enough room, and `.obnotion-board-card-field-label`'s own `text-overflow: ellipsis; white-space: nowrap` (`styles.css:10202-10209`) truncates it exactly as far as the operator's screenshot shows. The value beside it fares no better: `-webkit-line-clamp: 1` on `.obnotion-board-card-value` (`styles.css` ~10795-10805) leaves a date or a URL clipped at the same half-width. The one row type that does not truncate — a chip/relation row — is the one row type `:has(.has-badges) { grid-column: 1 / -1; }` already exempts from the two-column track.

**This is not an oversight the lane failed to catch. It is a rule the lane actively defends.** `tools/live/render-assertions.mjs`'s own "meta grid" clause (`window.__cardFieldLabels`, ~L431-475; the assertion at ~L1237-1249) measures `getComputedStyle(meta).gridTemplateColumns` at 1440px and at 340px and **passes** when it reads **two** tracks at the wide width and **one** at the narrow width — the exact shape the operator is reporting as wrong. This is the same failure class `../decision-record.md` D1 was written to capture: a green check defending a picture the operator does not want. The only difference is that D1's case (`071/009`) was a lane that never asked the right question; this one is a lane that asks the right question and is satisfied by the wrong answer.

**The two-column grid also reverses a landed ruling this repository already made once.** `056-board-anytype-parity`'s **ADR-008** (2026-09-06, operator ruling, `056/decision-record.md` lines 336-450) put `.obnotion-kanban-card-meta .obnotion-board-card-value` at `text-align: left; word-break: normal; overflow-wrap: normal` specifically so a card value would wrap onto a second line or ellipsise at its own edge, never break mid-word — a rule against the gallery card's inherited `text-align: right; word-break: break-word`. At the time ADR-008 landed, `.obnotion-kanban-card-meta` was `display: flex; flex-direction: column` — one field per line, full card width, label hidden (`../045-board-card-properties`'s own comment on the rule it replaced: *"the label span... used to be hidden here so the card read values only"*). `045-board-card-properties`'s later field-names leg (`f055e340` and its siblings) changed two things in the same edit: it made the label visible again (a real improvement — *"a value without its name does not say which property it belongs to"*) and it changed the container to a two-column grid, `-webkit-line-clamp` from 2 to 1, without opening or amending an ADR for the second change. **No `076` child before this one has ever contradicted a landed Anytype ruling** — every prior contradiction recorded in `../decision-record.md` D15 and `../roadmap.md` §7.19 has been a Notion finding against a `071` ruling. This one is different in kind: it is a later, undocumented change against the board's own prior Anytype-sourced ruling, on the same surface, and the operator's 2026-09-10 ~21:43 words are read here as **settling** that conflict rather than merely proposing a resolution to it — recorded as its own entry in `../../roadmap.md` §7 per §2's instruction below.

### Purpose

Every field the board card draws — text, number, date, currency, a single select chip, a relation chip, a checkbox — renders on its own full-width row, at every viewport the board card mounts at, so a label is never truncated below its full word and a value ellipsises (or wraps, per its own type's existing rule) at the edge of the whole card rather than at half of it.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

Per parent D2(a), a target binds **every** producer painting this grammar, not only the renderer the card is named after:

- `constructed-board` — `constructedScenario("board", { renderer: "board" })` in `tools/screenshots/constructed-scenarios.mjs:763-770`, mounted by `mountConstructed` → `window.__mountConstructed` → `runRenderAssertions`, harness branch `scenario.renderer === "board"`. Its own comment already names the split: *"The card's field values are drawn by the shared property renderer, not by board-renderer itself, so both are depicted here"* — `sources` lists `src/views/board-renderer.ts`, `tools/bench/board-render-bench.ts`, `src/views/card-field-renderer.ts` and `src/views/record-surface/property-row.ts`. Captures `screenshots/notion-clone/views/constructed-board-{mobile,desktop}-{light,dark}.png`
- `constructed-board-subtask` — the same renderer, subtask-tree variant; the field grid is unaffected by the variant and inherits this child's fix without its own DEFINE row
- The fixture `views/board-mobile` (`tools/screenshots/scenarios/core.mjs:464-476`) declares `fixtureOf: "constructed-board"`, so the constructed capture is already the authority and no scenario work is owed
- `card-field-renderer.ts`'s `renderCardField` is also shared by the Gallery and List cards (`gallery`/`list` renderers). **Only the board's own scoped CSS** (`.obnotion-kanban-card-meta …`) sets the two-column grid — Gallery and List each carry their own field-container rule and are unaffected. Confirmed by reading `styles.css` for every `-card-meta`/`-card-fields`-shaped selector before naming a file (D2a); if a sibling selector is found sharing the two-column rule, it becomes this child's first task rather than an assumption

### Producers

- `styles.css` — `.obnotion-kanban-card-meta`'s grid declaration and its 359.9px media query (`:10178-10188`); the label's ellipsis rule (`:10202-10209`); the value's line-clamp rule (`~10795-10805`)
- `src/views/card-field-renderer.ts` — unaffected in mechanism; read to confirm the label/value DOM shape before the stylesheet changes, since a CSS-only fix that assumes a DOM shape it does not have is the wrong kind of confidence
- `tools/live/render-assertions.mjs` — the "meta grid" clause (`__cardFieldLabels`, the assertion using `wideTwoCol`/`narrowOneCol`) asserts the defect and must invert with the producer, in the same commit, not after

### Out of Scope

- `045-board-card-properties`'s mechanism: which properties are visible, their order, and the panel that configures them. `board-card-properties-panel.test.ts` stays green **without modification** — the same guard `056` ADR-003 already wrote for a different presentation change to this same surface
- The Gallery and List cards' own field containers, unless T001 finds they share the two-column rule
- Behaviour, persistence, data shape and semantics
- Reopening `056`'s other board ADRs (scrollbar, header position, geometry pins) — this child's Files to Change do not touch any of them, and its lane additions extend `render-assertions.mjs` rather than replacing its existing `GEOMETRY_PINS`
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 — Blockers (MUST complete)

- **REQ-001** No card row ever lays two field cells side by side, at any viewport the board mounts at — the two-column track and its 359.9px collapse are both replaced by a single always-on track
- **REQ-002** Every visible field label's `scrollWidth` is `≤` its `clientWidth` at the card's own full width — a label is never truncated below its full word once it has the whole row
- **REQ-003** Every production surface rendering this grammar is enumerated before any file is named (D2a), and `045`'s mechanism guard (`board-card-properties-panel.test.ts`) stays green unmodified
- **REQ-004** The image judge scores ≥ 14/16 with no row at 0, **twice consecutively on an unchanged tree** (parent D1), against the Anytype mobile kanban reference named in §13
- **REQ-005** `tools/live/render-assertions.mjs`'s "meta grid" clause is corrected in the same commit as the producer change — an assertion that certifies the defect does not survive the fix that removes it

### P1 — Required

- **REQ-006** Every field row's height stays within the card's existing 25px pitch (`styles.css:10190-10199`'s `min-height: 25px`); a full-width label does not by itself grow the row unless the value's own wrap rule does
- **REQ-007** Board captures (phone + desktop, light + dark) are current, and both were opened and looked at
- **REQ-008** Every `056`/`045` clause this card already carries (`GEOMETRY_PINS`, checkbox size, value align/wrap, header label size) re-runs unchanged and green
- **REQ-009** The operator's device row is present and unticked (D5)
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

| ID | Criterion | Measured by |
|----|-----------|-------------|
| SC-001 | No two field cells ever share a row, at any board viewport | `render-assertions.mjs` "meta grid" clause, inverted |
| SC-002 | Every visible label's `scrollWidth ≤ clientWidth` | New `render-assertions.mjs` clause (§13 L2) |
| SC-003 | Judge ≥ 14/16, no row at 0, twice on an unchanged tree, against the Anytype reference | `verification.md` |
| SC-004 | `045`'s mechanism guard stays green unmodified | `board-card-properties-panel.test.ts` |
| SC-005 | The operator reads the board on their own iPhone and reports fields no longer wrapping | Operator — **no agent ticks this** |
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Impact | Mitigation |
|------|--------|------------|
| The lane's own assertion defends the defect, so a producer-only fix leaves a red lane that looks like a regression | Correct behaviour reads as a broken check | REQ-005: the lane clause is corrected in the same commit, RED (old clause) → removed/inverted → GREEN (new clause), never left both-red |
| A single-column card grows taller, pushing more cards below the fold | Longer scroll per column | Measured, not assumed: T009-T010 record the row-count delta on the bench's own card shapes before and after; if the pitch (REQ-006) holds, the height delta is exactly the removed second track's worth, not a compounding one |
| `card-field-renderer.ts` is shared with Gallery/List | A board-scoped fix could leak if the wrong selector is touched | Every change stays under `.obnotion-kanban-card-meta …`; T001 confirms no sibling selector shares the rule before any edit |
| Contradicts `056` ADR-008's later reversal without an ADR | A silent second reversal in the same file | `../../roadmap.md` §7 gains a dated entry naming both readings and the operator's ruling that settles it (this spec's §2) |
<!-- /ANCHOR:risks -->

---

## 7. NON-FUNCTIONAL REQUIREMENTS

Touch targets unaffected — the meta grid is display-only. No contrast regression in either theme. No new dependency, no new runtime pattern; the fix is a stylesheet + lane change.

---

## 8. EDGE CASES

- A card with exactly one field (no truncation was ever possible; must stay unchanged)
- A card with ten-plus fields (Properties sheet's own configurable ceiling) — the taller single-column card, both themes
- A relation/chip field beside ordinary fields — its existing full-width exemption must still read correctly once every row is full width
- The narrowest supported phone width and the widest desktop board column, both re-measured — the 359.9px media query this child removes must not leave a gap at any width in between

---

## 9. COMPLEXITY ASSESSMENT

Level 2. One shared surface, presentational, a single stylesheet region and one lane clause family. The complexity is in correcting a passing assertion alongside the producer, not in the visual change itself.

---

## 10. RISK MATRIX

| Area | Likelihood | Impact | Net |
|---|---|---|---|
| Visual regression on Gallery/List cards sharing the field renderer | Low | Medium | T001 enumerates every consumer of `renderCardField` and confirms selector scoping before any stylesheet edit |
| The lane clause correction is skipped or deferred | Medium | High | REQ-005 makes it P0, in the same commit, not a follow-up |
| The target itself is wrong | Low | High | Three failed judge iterations on one rubric row re-opens DEFINE rather than patching CREATE (parent D1 pattern) |

---

## 11. USER STORIES

As the operator, I glance at a board card on my iPhone and read every field's full label and its value without anything trailing off mid-word, because each one has the whole card's width to itself.

---

## 12. OPEN QUESTIONS

- Does the label stay visible (045's own later argument) or return to hidden (056 ADR-008's original shape)? T001 records both readings structurally; this spec's target keeps the label visible and full-width, since the operator's words name wrapping, not naming, and deleting the label would re-open a question 045 already closed on its own stated evidence
- Whether the row-count delta from going single-column changes the board's own scroll-reachability pins in `GEOMETRY_PINS` — re-measured, not assumed, in T009

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

### References

- **Operator capture** (rung 1 of D3, populated for this child specifically): `/private/tmp/claude-501/-Users-michelkerkmeester-MEGA-Development-Obsidian-Plugin/e80c6d75-9d5c-4af2-af70-05fb120371b4/scratchpad/operator-references/0038-board-card-fields-two-column.png` — 0.0.38, iPhone, board view, `By Status`. Shows two cards: one with a two-column grid of label/value pairs truncated to "D…", "Relat…", "L…", "Margi…", "Sum…" (labels) and "June 30,…", "https://examp" (values); one with the same grid beside a relation-chip row that wraps cleanly because it already spans the full card width
- **Anytype mobile kanban** (the board's own landed parity target, `056` ADR-001, not Notion): `screenshots/anytype/mobile/app/anytype-mobile-set-kanban-{light,dark}.png` — a "Project Tracker" kanban card shows title, then a subtitle line, then every property on its own full-width row in this order: a checkbox row (glyph + name), a tag/chip row (wraps to a second line as `+1` when it does not fit), then plain value rows each on their own line (dates, a number). No two properties ever share a row at any width the capture shows
- **Notion iOS**: no usable reference exists. `screenshots/notion/ios/views/notion-ios-views-{board,kanban}-*.webp` and `screenshots/notion/ios/database/notion-ios-database-board-03-*.webp` were opened this session; every board/kanban capture in this repository shows a title-only "New page" placeholder card or the Layout settings screen, never a card carrying a configured property. This is recorded as a gap, not filled by inference (parent D3)
- `056/decision-record.md` ADR-008 (lines 336-450) — the landed ruling this child's target reinstates for the grid's column count, on the same value-alignment reasoning already in force

### What the reference cannot answer

- Whether Anytype ever truncates a very long label on a narrow phone — the captured card's five property names are all short enough that the full-width row never needed to prove it. This child's target (REQ-002, `scrollWidth ≤ clientWidth`) is stricter than what the reference demonstrates and is justified by our own longer property names (`Related tasks`, `Summary`), not by the reference
- Exact row height and inter-row gap in Anytype's card — not legible at capture resolution. `styles.css:10190`'s existing `min-height: 25px` pitch is kept as ours (REQ-006), not re-derived from the image

### The table

The Anytype column below is structural, read this session from `anytype-mobile-set-kanban-light.png`. **Every number in the Target column is ours** — the existing `styles.css` values already in force for a single field row — or is a structural requirement (never two cells per row) rather than a pixel figure.

| Element | Ours today | Anytype (structural) | Target |
|---|---|---|---|
| Meta grid | `display: grid; grid-template-columns: 1fr 1fr` at ≥360px, `1fr` below (`styles.css:10178-10188`) — **2 tracks measured at 1440px, 1 at 340px, by `render-assertions.mjs`'s own passing clause** | Every property on its own full-width row, at the one width captured | **1 track at every width** — the grid becomes a single always-on column; the 359.9px media query is removed as unreachable |
| Field label | `text-overflow: ellipsis; white-space: nowrap` inside a `flex: 0 1 auto` box sharing the row with the value (`styles.css:10202-10209`) — truncates to a few characters at half-width | Full property name, never observed truncated in the reference | Label keeps its ellipsis rule as a safety floor, but the row width it ellipsises against is the **whole card**, not half of it; `scrollWidth ≤ clientWidth` for every property name this schema carries today (REQ-002) |
| Field value | `-webkit-line-clamp: 1` on `.obnotion-board-card-value` inside the shared half-width cell (`styles.css` ~10795-10805) | Full value on its own line; a long value (a date, a URL) reads uncut in the capture | Value keeps its existing 1-line clamp and left-align/word-break-normal rule (`056` ADR-008, unchanged) — now ellipsising at the full card width instead of half of it |
| Chip / relation row | `:has(.has-badges) { grid-column: 1 / -1 }` (`styles.css:10259-10261`) — already full-width, wraps correctly today | A tag row wraps to a second line as `+1` when it overflows | **Unchanged** — this rule already matches the target and is the row type the operator's own screenshot shows working correctly |
| Checkbox row | Full label + circular glyph, own row (`styles.css:10211-10225`) | Glyph + name, own full-width row | Unchanged — already single-cell per row since a checkbox field is excluded from the 2-column collapse concern (its own row was never the truncating one) |
| Row pitch | `min-height: 25px` (`styles.css:10190-10199`) | Not legible at capture resolution | Unchanged — kept as ours (open question, §12) |

### The lane clauses these rows become

Extending `tools/live/render-assertions.mjs`'s existing board-geometry pass (`GEOMETRY_SCENARIO`, `__boardGeometry`, `__cardFieldLabels`) rather than adding a new pass:

- **L1** `__cardFieldLabels`'s "meta grid" assertion (~L1237-1249) inverts from `wideTwoCol && narrowOneCol` to `wide.metaColumns === 1 && narrow.metaColumns === 1` — RED today because the current producer computes 2 at 1440px (the clause is currently written to expect and reward that number)
- **L2** a new clause reading, for every visible field label on the mounted board card, `label.scrollWidth <= label.clientWidth`, at the wide viewport — RED today at the two-column width for any label longer than the half-width column affords (reproducible today with the bench's own longer property names)
- **L3** every `.obnotion-board-card-field` row's height stays within `[25, 25 + one line of wrapped value]`px — extends the existing `rowHeights` measurement in `__boardGeometry` into an asserted range rather than a printed-only array
- **L4** the visible field count on the mounted card equals `045`'s own configured-visible-property count for that view — a parity guard that the presentation change did not drop or duplicate a row, read from `board-card-properties-panel.test.ts`'s existing fixture rather than a new one

### Contradiction with a landed Anytype ruling

Recorded as its own entry in `../../roadmap.md` §7, per `../decision-record.md` D15's instruction to raise a contradiction with a landed ruling there rather than amend it locally — except that here the operator's own 2026-09-10 ~21:43 words are read as directly settling the contradiction (see §2), so the roadmap entry records the conflict and its resolution together rather than leaving it Proposed and open.

- `056/decision-record.md` **ADR-008** put the kanban card's value at `text-align: left; word-break: normal` so it would wrap or ellipsise on its own full-width line. `045-board-card-properties`'s field-names leg (`f055e340` and siblings) changed the container to a two-column grid in the same edit that made labels visible, without opening or amending an ADR for the column-count change. This child's target reinstates ADR-008's single-column shape while keeping 045's visible-label improvement — the two are independent and only one of them was ever ruled against.

<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md` (the loop and the rubric), `../decision-record.md` (D1-D4, D15)
- **Verification**: `verification.md` — created at the VERIFY step, one score table per iteration
- **Contradicted-then-settled ruling**: `../../056-board-anytype-parity/decision-record.md` ADR-008, ADR-003
- **Mechanism this child does not touch**: `../../045-board-card-properties/`
