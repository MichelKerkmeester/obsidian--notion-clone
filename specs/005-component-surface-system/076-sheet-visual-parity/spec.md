---
title: "Feature Specification: Sheet Visual Parity, One Sheet at a Time"
description: "Eleven phone sheets, one child each, taken to Notion's own presentation through a six-step loop — define, plan, create, screenshot, verify, remediate — where an image-judged side-by-side, not a DOM lane, is what closes a sheet."
trigger_phrases:
  - "076 sheet visual parity"
  - "sheet visual parity programme"
  - "image judged sheet verification"
  - "sheet parity rubric"
  - "settings sheet visual parity"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity"
    last_updated_at: "2026-09-10T22:10:00Z"
    last_updated_by: "290-sheet-parity-program"
    recent_action: "Scaffolded 076 and its eleven per-sheet children"
    next_safe_action: "Execute 001-settings-sheet-visual-parity, step DEFINE (T001-T004)"
    blockers:
      - "No sheet may be closed on DOM-lane evidence alone; the image judge is a required gate (D1)"
      - "Sheets run in order, 001 first — the operator named the settings sheet"
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
      - "Do the six operator captures C-1..C-6 and the settings-sheet capture arrive before 001's DEFINE closes, or does 001 target the Mobbin thumbnail and re-open on arrival?"
    answered_questions:
      - "Every one of the eleven sheets already has a constructed capture that mounts the production renderer; the photographs are of production, so the gap is not a fixture gap"
      - "071/008 landed on the filter sheet and never touched the active-rule popover, which is why one filter surface stacks and the other does not"
---

<!-- SPECKIT_TEMPLATE_SOURCE: phase-parent-spec | v2.2 -->
<!-- SPECKIT_LEVEL: phase -->
<!-- CONTENT DISCIPLINE: PHASE PARENT — no merge/migration narrative here; plan.md/tasks.md/decision-record.md detail lives in the phase children -->

# Feature Specification: Sheet Visual Parity, One Sheet at a Time

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | phase |
| **Priority** | P1 |
| **Status** | Scaffolded — opened 2026-09-10, nothing started |
| **Created** | 2026-09-10 |
| **Branch** | `worktrees/290-sheet-parity-program` |
| **Parent Spec** | `../spec.md` (005-component-surface-system) |
| **Parent Packet** | `005-component-surface-system` |
| **Predecessor** | `071-sheet-notion-anytype-alignment` (row grammar; landed, and the reason this exists) |
| **Successor** | None |
| **Handoff Criteria** | Each child passes its own image-judge gate twice in a row on an unchanged tree, then `validate.sh --strict`; the operator's own phone read is the third gate and no agent ticks it |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### The rulings that opened this

The operator, 2026-09-10 ~21:40, verbatim, both in the same breath:

> *"Btw 0.038 still has same old badish ui in most sheets nothing like notion"*

> *"Really needs to go step by step multiple ohases per sheet to define, plan, create, screenshot & verify and remediate as needed based on anytype or notion or similar screens untill perfect"*

Standing alongside them: *"Ui improvement is focus here"* (2026-09-09 ~22:30).

### Problem Statement

`071/002`-`071/015` aligned the phone sheets to Notion **at the row-grammar level** — pitch, inset,
divider grammar, controls-per-row, native-select counts — and verified each one with DOM lane
assertions. Every lane went green. The operator judges by eye, on a phone, and sees the same old UI.

Both are true at once, and the mechanism is not a mystery. It was read off the tree at `da8af8ee`,
by opening the captures and then confirming the producer that painted them:

**The Properties sheet.** `071/009` targeted *"**≤4** interactive controls per row"* and its lane
measured **3** (its own `goal.md` Progress table). `screenshots/notion-clone/panels/constructed-column-manager-mobile-light.png`
— rewritten by `8f11b642`, **after** the `4f345718` row rebuild landed, so the capture is current —
still shows every row as **↑ ↓ · filled blue checkbox · type icon · label**. The producer agrees:
`src/views/record-surface/property-row.ts:405-411` still calls `setIcon(upBtn, "arrow-up")` and
`setIcon(downBtn, "arrow-down")`, and `:417` still calls `createCheckbox(row, …)`. `071/009`'s own
§13 recorded Notion's row as *"drag handle, type icon, label, eye icon"* — and then encoded the
**count** of controls as the target, never their **identity**. A green lane and an unchanged
picture are both honest readings of that target.

**The Settings sheet.** `screenshots/notion-clone/panels/constructed-view-config-mobile-light.png`
is one large white card wrapped around a form: bordered text inputs for Name, Description, Source
folder and New note folder, helper paragraphs under several of them, and a row of three bare icons
(`+`, folder-plus, `>_`) under "Source rules". `src/views/view-config-panel-renderer.ts` carries
fourteen input/textarea constructions and `settings.*.desc` helper strings to match. Notion's
equivalent surface — its **View options** sheet — is a table of contents, not a form: see §4.

**The Filter sheet.** `screenshots/notion-clone/components/constructed-active-rule-filter-mobile-light.png`
still renders a condition as **one row of three dropdowns** (`Field 3` · `equals` · `Backlog`).
This is a real defect and the operator is right to point at it, but the mechanism is **not** the one
it looks like. `071/008` (`64af87ee`) did land stacked condition rows, and
`constructed-filter-panel-mobile-light.png` shows them. `64af87ee` touched the
`constructed-filter-panel*` captures and no others: the active-rule popover is a **second
production surface** rendering the same concept from a different producer
(`src/views/active-rule-popover-renderer.ts`), and no `071` child ever named it. The same split
exists for sort.

### What this is NOT

**It is not a fixture-versus-production gap.** That was the suspected mechanism and it was checked
and disproved: all fifty-nine `CONSTRUCTED_SCENARIOS` mount the shipped renderers through
`runRenderAssertions`, every one of the eleven sheets below has one, and every hand-written
`panel-*` / `chrome-*` / `field-*` fixture that duplicates a sheet already declares `fixtureOf`
pointing at an existing constructed scenario. Nine fixtures carry no constructed counterpart —
`panel-record-detail-title-currency`, `panel-record-detail-sheet-title-currency`,
`panel-computed-cleanup-modal`, `panel-invalid-events-modal`, `panel-base-import-modal`,
`chrome-selection-status-bar`, `chrome-toast-success`, `chrome-toast-error`,
`chrome-table-load-more` — and **none of them is one of the eleven sheets**. The photographs were
always of production. What was missing was an eye on them.

### Purpose

Each of the eleven sheets is taken, one at a time and in the order the operator meets them, through
the same six-step loop — **define, plan, create, screenshot, verify, remediate** — where the gate
that closes a sheet is an **image-judged side-by-side against the reference**, scored on a fixed
rubric, and the DOM lane is the floor beneath it rather than the ceiling above it.

> **Phase-parent note:** the per-sheet target specs, task breakdowns, criteria and iteration
> records live in the eleven children. This spec carries the loop, the rubric and the order.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:qualification -->
## 3. PHASE QUALIFICATION

`phase-definitions.md` §2 requires **both** thresholds independently. Measured, not asserted:

```
recommend-level.sh --loc 2400 --files 30 --architectural
  Recommended Level: 3 (Full) — Score: 75/100 | Confidence: 92%
  Phase Score: 40/50 (threshold: 25) — Recommended: YES
  Reason: Architectural change + 30 files + 2400 LOC + extreme scale
```

| Threshold | Required | This packet | Why |
|---|---|---|---|
| Phase complexity score | ≥ 25 / 50 | **40 / 50** | Architectural (renderers, stylesheet, capture harness and lane all move together, and a new verification gate is introduced across every child) + file count > 15 (eleven renderers, `styles.css`, the constructed-scenario registry, the lane) + LOC > 800 + extreme scale (eleven children × six steps, with a remediation loop that may run a step more than once) |
| Documentation level | ≥ 3 | **3 (Full), 75 / 100** | Multi-session, multi-surface, with decisions that bind every child |

Both are met independently, so the phased-packet preference in §2 applies and this is one
coordinated phase parent rather than eleven sibling packets.

**It is a new parent rather than a `071` child** because `071`'s documented purpose is row-grammar
alignment verified by lanes, and this packet's purpose is visual parity verified by an image judge.
`071` is not reopened: its landings stand as the floor every child here regression-checks.
<!-- /ANCHOR:qualification -->

---

<!-- ANCHOR:scope -->
## 4. SCOPE

### The reference, and what it can answer

**Every Notion iOS capture in this repository is 299×678** — a Mobbin thumbnail, re-verified with
`sips` for this packet. **No numeric threshold in any child may be derived from one.** The Notion
column in every child's DEFINE table is **structural**: which rows exist, in what order, grouped
how, with which leading icon and which trailing element. Every number is ours — measured from our
own tree — or marked `TBD — needs operator capture`.

The operator has been asked for full-resolution device captures **C-1..C-6** plus one settings-sheet
capture. When they arrive they become the preferred reference and any child targeting a thumbnail
re-opens its DEFINE step against them. Precedence is D3 in `decision-record.md`.

Notion's **View options** sheet (`screenshots/notion/ios/flows/view-options/…-02-*.webp`, `-03-*.webp`)
is the single most load-bearing reference in this packet, because it is what our Settings sheet
should have been. Read structurally it is: a drag handle; a centred title; **Done** top-right and
nothing top-left; one bordered **View name** input; then three separate inset cards with visible
gaps between them and hairline dividers only *within* a card. Its rows are `Layout` → `Table ›`,
`Properties` → `2 shown ›`, `Filter` → `None ›`, `Sort` → `None ›`, `Group` → `None ›`,
`Automations` → `None ›`, each with a leading icon; then a card of one-tap actions with no chevron
at all. Bordered inputs appear **only** for naming and searching, never for choosing. No row carries
an explanatory paragraph.

### In Scope

- The eleven phone sheets in the Phase Documentation Map, one child each, in that order
- Per sheet: a written visual target spec, the renderer and stylesheet changes that reach it, DOM
  lane assertions that encode it numerically, a phone light + dark capture set, and an image-judged
  score table recorded in the child's `verification.md`
- **Every production surface that renders the sheet's row grammar**, not only the one renderer the
  sheet is named after — the active-rule popovers are inside `003` and `004` for this reason (D2)
- Registering any surface that turns out to have no constructed capture, in the same child

### Out of Scope

- Behaviour, persistence, data shape and semantics — every child here is presentational
- Desktop presentations, except where a change would regress one (regression-checked, not redesigned)
- The nine fixtures with no constructed counterpart listed in §2; they are recorded there and are
  not sheets
- Reopening any `071` landing. Where a visual target contradicts a landed `071` ruling, it becomes a
  **Proposed ADR** in `roadmap.md` §7 under D15, not an amendment made here

### Files to Change

Per-child detail lives in each child's `plan.md`. The shape is the same everywhere:

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/<sheet>-renderer.ts` (per child) | Modify | The producer that paints the sheet's rows |
| `styles.css` | Modify | Section, card, row and control tokens — one css-lane triplet per child |
| `tools/live/sheet-grammar.mjs` | Modify | The numeric clauses that encode each child's target spec |
| `tools/screenshots/constructed-scenarios.mjs` | Modify (only where a surface is unregistered) | Register a missing production surface |
| `<child>/verification.md` | Create | The image judge's score table, one section per iteration |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:loop -->
## 5. THE SIX-STEP LOOP

Every child carries these six steps as its `plan.md` phases and its `tasks.md` groups. Each step
has one artefact and one pass rule. A child may not enter a step before the previous step's pass
rule holds.

| # | Step | Artefact | Pass rule |
|---|------|----------|-----------|
| 1 | **DEFINE** | `spec.md` §13, a row-by-row target table | Every row of the sheet has a target row naming section, label, leading icon, trailing element and control type, in both themes; every reference is a real path; every number is ours or `TBD` |
| 2 | **PLAN** | `plan.md` §3 | The producer file, the stylesheet region, the scenario id **and its mount function**, and one lane clause per measurable row of the DEFINE table are all named |
| 3 | **CREATE** | Commits | Write-first order: each lane clause runs RED with its failing number recorded, then the producer changes, then GREEN with its number recorded. Legs sized for one GLM 5.3 flash or Sonnet pass |
| 4 | **SCREENSHOT** | The child's capture set | `npm run screenshots` exits 0; the sheet's phone light **and** dark captures are current per `npm run screenshots:verify`; the real-app WebKit path (`tools/live/sheet-rebuild.mjs`) runs for any child whose sheet it covers |
| 5 | **VERIFY** | `verification.md` | Gate (a) every lane clause green, with numbers. Gate (b) the image judge: **≥ 14/16, no row scoring 0**. Gate (c) the operator's own phone read — an operator row, never ticked by an agent |
| 6 | **REMEDIATE** | `verification.md` iteration sections | Any rubric row < 2 opens a remediation task, run RED → fix → GREEN → re-screenshot → re-judge. **The child is not done until the judge passes twice in a row on an unchanged tree** |

### The rubric

A Sonnet or Opus reviewer opens our capture and the reference side by side and scores eight rows,
**0, 1 or 2** each, for a maximum of **16**:

| Row | 0 | 1 | 2 |
|---|---|---|---|
| **Frame** | Different surface shape | Right shape, wrong canvas/radius/handle | Canvas colour token, corner radius, handle and header layout all match |
| **Sections** | No grouping where the reference groups | Grouped, wrong boundaries or order | Same sections, same order, same visual separation |
| **Row anatomy** | Different elements per row | Same elements, wrong order or edge | Leading icon, label and trailing element as the reference has them |
| **Controls** | Wrong control kind (an input where the reference navigates) | Right kind, wrong affordance | Same control kind and same affordance throughout |
| **Type** | Different scale or weight hierarchy | Hierarchy right, one level off | Scale and weights read as the reference's |
| **Spacing** | Visibly different rhythm | Rhythm right, one region off | Pitch, inset and gaps read as the reference's |
| **Colour** | Wrong hierarchy or a contrast failure | Right hierarchy, one token off | Text, secondary, divider and accent all read correctly |
| **Both themes** | Dark or light broken | Both work, one inconsistent | Light and dark are each internally consistent and match each other structurally |

**Pass is ≥ 14/16 with no row at 0.** A 13 is a fail even with seven 2s, and any 0 is a fail at any
total. The reviewer writes the score table, with a one-line justification per row, into the child's
`verification.md`, and repeats it after every remediation iteration.
<!-- /ANCHOR:loop -->

---

<!-- ANCHOR:phase-map -->
## PHASE DOCUMENTATION MAP

> Eleven children, numbered in the order the operator meets the sheets. **They run in that order,
> one at a time** (D4). `001` is first because the operator named the settings sheet.

| Phase | Folder | Sheet | Primary producer | Status |
|-------|--------|-------|------------------|--------|
| 1 | `001-settings-sheet-visual-parity/` | Settings | `src/views/view-config-panel-renderer.ts` | scaffolded |
| 2 | `002-properties-sheet-visual-parity/` | Properties | `src/views/column-manager-renderer.ts`, `src/views/record-surface/property-row.ts` | scaffolded |
| 3 | `003-filter-sheet-visual-parity/` | Filter (+ the active-rule filter popover) | `src/views/filter-panel-renderer.ts`, `src/views/active-rule-popover-renderer.ts` | scaffolded |
| 4 | `004-sort-sheet-visual-parity/` | Sort (+ the active-rule sort popover) | `src/views/sort-panel-renderer.ts`, `src/views/active-rule-popover-renderer.ts` | scaffolded |
| 5 | `005-group-sheet-visual-parity/` | Group | `src/views/toolbar-renderer.ts`, `src/views/board-groups-panel.ts` | scaffolded |
| 6 | `006-add-view-sheet-visual-parity/` | Add view | `src/views/toolbar-renderer.ts` | scaffolded |
| 7 | `007-property-editor-sheet-visual-parity/` | Add / edit property | `src/views/modals/create-property-modal.ts`, `src/views/record-surface/type-picker.ts` | scaffolded |
| 8 | `008-record-sheet-visual-parity/` | Record | `src/views/record-detail-panel.ts`, `src/views/record-surface/*` | scaffolded |
| 9 | `009-menu-and-confirm-visual-parity/` | Record menu, cell menu, destructive confirm | `src/views/owned-menu.ts`, `src/views/row-menu.ts`, `src/views/column-menu.ts`, `src/views/confirm-sheet.ts` | scaffolded |
| 10 | `010-picker-sheets-visual-parity/` | Date, icon, colour and property-type pickers | `src/views/date-value-picker.ts`, `src/views/icon-picker-popover.ts`, `src/views/option-color-picker.ts`, `src/views/record-surface/type-picker.ts` | scaffolded |
| 11 | `011-toolbar-overflow-and-column-width/` | Toolbar overflow, column width | `src/views/toolbar-renderer.ts`, `src/views/column-width.ts` | scaffolded |
| 12 | `012-board-card-fields/` | Board card meta grid (not one of the eleven sheets — added 2026-09-10 ~21:43 by a separate operator ruling on the same build) | `styles.css` (`.obnotion-kanban-card-meta`), `tools/live/render-assertions.mjs` | scaffolded |

### Phase Transition Rules

- Each child MUST pass `validate.sh --strict` independently before the next begins
- Each child MUST have its image judge pass **twice consecutively on an unchanged tree** before it
  is called done in-repo; the operator's device row stays open past that and no agent ticks it
- A child that regresses a landed `071` clause closes the regression inside itself or stops
- `012` is not one of the eleven sheets and does not gate or depend on their sequence; it holds the
  shared css-lane triplet in its own turn (D4's rationale, extended to a twelfth holder) and is
  judged against Anytype rather than Notion, per its own `spec.md` §13
- Run `validate.sh --recursive` on this parent to validate all twelve as one unit

### Phase Handoff Criteria

| From | To | Criteria | Verification |
|------|-----|----------|--------------|
| 001 | 002 | The settings sheet's judge passes twice, and its DEFINE table's card/row/trailing-element vocabulary is the one every later child reuses | `001/verification.md`, `001/acceptance-criteria.md` |
| any child | the next | The previous child's lane clauses are in the shared regression set and green | `tools/live/sheet-grammar.mjs` exit 0 |
| 011 | 012 | The eleven sheets' judge passes are recorded; `012` proceeds independently of them since it targets the board card, not a sheet | This spec's map, rows 1-11 `complete` |
| 012 | (parent) | Twelve judge passes recorded; the operator's twelve device rows are the only open criteria | This spec's map, all rows `complete` |
<!-- /ANCHOR:phase-map -->

---

<!-- ANCHOR:questions -->
## 6. OPEN QUESTIONS

- Do the operator's C-1..C-6 and settings-sheet captures arrive before `001`'s DEFINE closes? If
  not, `001` targets the 299×678 thumbnail structurally and re-opens DEFINE when they land (D3)
- Where Notion and Anytype disagree on a sheet, D15 holds: the Notion refinement is additive, and a
  contradiction with a landed Anytype ruling becomes a Proposed ADR rather than an amendment
- Does the image judge ever disagree with the operator's own read, and if it does, what changes —
  the rubric, or the reference? Unanswerable until a child has been through both gates
<!-- /ANCHOR:questions -->

---

## RELATED DOCUMENTS

- **Phase children**: the eleven `[0-9][0-9][0-9]-*/` sub-folders, each with spec, plan, tasks, acceptance-criteria and goal
- **Decisions**: `decision-record.md` — D1 the image judge, D2 every surface of a grammar, D3 reference precedence, D4 one sheet at a time
- **Parent Spec**: `../spec.md` (005-component-surface-system)
- **Predecessor**: `../071-sheet-notion-anytype-alignment/spec.md`, and its `sheet-notion-audit.md` §0 on the 299×678 ceiling
- **Graph Metadata**: `graph-metadata.json`
