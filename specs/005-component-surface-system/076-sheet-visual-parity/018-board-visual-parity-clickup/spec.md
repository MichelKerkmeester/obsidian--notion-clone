---
title: "Feature Specification: Phase 18: Board Visual Parity (ClickUp)"
description: "The phone board's column headers, column body chrome and card anatomy retarget from Anytype/Notion to ClickUp, per the operator's explicit 2026-09-11 ruling that ClickUp outranks both for board surfaces specifically."
trigger_phrases:
  - "076 phase 18"
  - "board visual parity clickup"
  - "018 define table"
  - "clickup board column headers"
  - "board column tint outline"
importance_tier: "critical"
contextType: "implementation"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/076-sheet-visual-parity/018-board-visual-parity-clickup"
    last_updated_at: "2026-09-11T05:40:00Z"
    last_updated_by: "302-sheet-inventory-coverage"
    recent_action: "Scaffolded from the operator's ClickUp board ruling; nothing started"
    next_safe_action: "Execute tasks.md Step 1 (DEFINE), T001-T004"
    blockers:
      - "This is a Proposed ADR against 056's Anytype board rulings — for BOARD surfaces specifically, ClickUp now outranks Anytype/Notion, per the operator's own words. Recorded in ../../roadmap.md §7"
      - "012-board-card-fields is DONE against Anytype (single-column fields); this child re-judges the card's overall anatomy under ClickUp WITHOUT reopening 012's single-column ruling, which stands"
      - "The child does not close until the image judge passes twice on an unchanged tree (parent D1)"
    key_files:
      - "spec.md"
      - "plan.md"
      - "tasks.md"
      - "acceptance-criteria.md"
      - "goal.md"
      - "src/views/board-renderer.ts"
      - "src/views/card-field-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "018-board-visual-parity-clickup-scaffold"
      parent_session_id: "302-sheet-inventory-coverage"
    completion_pct: 0
    open_questions:
      - "Whether the column-tint colour token should come from the status option's own configured colour or a fixed palette — read ClickUp's reference again at CREATE time; the operator's note names 'the status option colour' explicitly"
    answered_questions:
      - "This does not reopen 012 (fields never wrap, single column) — that ruling stands; this child re-judges card anatomy (title row, meta row, section label) around it, per the operator's own instruction not to reopen 012"
      - "For BOARD surfaces, ClickUp leads over Anytype/Notion — a directed departure from 056 ADR-001's board-parity-is-Anytype premise, ruled by the operator directly, not inferred"
---

<!-- SPECKIT_TEMPLATE_SOURCE: spec-core + level2-verify | v2.2 -->
# Feature Specification: Phase 18: Board Visual Parity (ClickUp)

<!-- SPECKIT_LEVEL: 2 -->

---

## EXECUTIVE SUMMARY

The operator, 2026-09-11 ~05:36-05:38, verbatim: *"Board card dragging should look and work like this like in clickup"*; *"In general for board styling lets mimic clickup"*; *"For board clickup column headers are great, button to collapse or add new one and just good ui styling"*. This directly amends `056-board-anytype-parity`'s ADR-001 (the board's parity target is Anytype) **for board surfaces specifically**: ClickUp now leads. This child targets the board's column header (status-coloured pill, count, collapse/add controls, collapsed vertical pill), column body chrome (tinted wash + outline), and card anatomy (section label, title row with icons, meta row of assignee/priority/date) against ClickUp's iOS board reference — **not** `012`'s single-column field-layout ruling, which this child explicitly does not reopen.

**The gate that closes this child is an image judge, not a lane** (parent D1). Pass is **≥ 14/16 with no row at 0**, twice consecutively on an unchanged tree, against `scratchpad/operator-references/clickup-board-column-headers-reference.png`.

**Critical dependencies**: `012-board-card-fields` (single-column field layout — stands, not reopened, extended by this child's card-anatomy target); `013-board-card-properties-visual-parity` (which properties show — mechanism, unaffected); `019-board-card-drag-feel-clickup` (the drag interaction, a separate child sharing the same ClickUp reference family).

---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Scaffolded — opened 2026-09-11 from the operator's ClickUp board ruling, nothing started |
| **Created** | 2026-09-11 |
| **Branch** | `worktrees/302-sheet-inventory-coverage` |
| **Parent Spec** | `../spec.md` |
| **Parent Packet** | `076-sheet-visual-parity` |
| **Predecessor** | `../017-utility-modal-sheets-visual-parity/spec.md` |
| **Successor** | `../019-board-card-drag-feel-clickup/spec.md` |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

**Phase 18** opened directly from the operator's 2026-09-11 ~05:36-05:38 rulings (verbatim above), delivered mid-session while this coverage audit was running. Evidence: `scratchpad/operator-references/clickup-board-column-headers-reference.png` (board, IN PROGRESS column expanded, RDY -> REVIEW collapsed) and the operator's own words in `scratchpad/loop/board-visual-parity-clickup/operator-notes.md`.

**Scope boundary**: the board's column header, column body chrome (tint/outline), and card anatomy (section label, title row, meta row) — every phone and desktop presentation. Not the card's meta-grid single-column rule (`012`, stands unmodified), not which properties are configured visible (`013`/`045`), not the drag interaction (`019`).

**Deliverables**: a completed DEFINE table with a Source column naming ClickUp for every board-specific row (per the operator's explicit board-leads ruling), one lane clause per measurable row, producer/stylesheet changes, current captures (phone + desktop, light + dark), a Proposed ADR entry in `../../roadmap.md` §7 recording the departure from `056` ADR-001 for board surfaces, and `verification.md`.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement

The board's column headers today carry a plain label and count with no status-colour pill, no collapse control beyond the existing overflow affordance, and no visible tinted column body — read against the operator's own words and their ClickUp reference, the board reads flatter and less structured than the target. `056-board-anytype-parity`'s ADR-001 named Anytype as the board's parity target; the operator's 2026-09-11 words directly supersede that **for board surfaces only** (sheets still mix Anytype/Notion/ClickUp per the frame ruling's own rule) — this is recorded as a Proposed ADR against ADR-001 in `../../roadmap.md` §7, resolved by the operator's own words rather than left open.

### Purpose

The board's column headers, column body and card anatomy read as ClickUp's own board grammar: a status-coloured pill header carrying the count, collapse and add controls, a tinted-and-outlined column body, and cards with a section label, an icon-and-title row, and a meta row of assignee, priority and date — while `012`'s single-column field rule and `013`'s property-visibility mechanism both stay exactly as they landed.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### The production surfaces this child binds

- `constructed-board` — `constructedScenario("board", { renderer: "board" })`, the same mount path `012` already uses
- The board's column header producer (T001 names the exact function in `board-renderer.ts`)
- The board's column body/tint producer (T001 names the exact selector)
- The card's title row and meta row anatomy (`card-field-renderer.ts`, `board-renderer.ts`) — **not** the meta grid's single-column rule itself (`012`, untouched)

### Producers

- `src/views/board-renderer.ts` — column header, column body, collapse/add controls
- `src/views/card-field-renderer.ts` — card title row, meta row (icons, avatar, priority, date), read to confirm before any stylesheet change (a CSS-only fix assuming a DOM shape it does not have is the wrong kind of confidence, per `012`'s own precedent)
- `styles.css` — column tint/outline tokens, header pill styling, collapsed-column vertical pill

### Out of Scope

- `012`'s single-column meta-grid rule — stands, not reopened
- `013`'s field-visibility sheet and `045`'s mechanism (which properties are configured visible)
- `019`'s drag interaction (own child, sharing this reference family)
- Behaviour, persistence, data shape and semantics
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 — Blockers (MUST complete)

- **REQ-001** Column header carries a status-coloured pill (icon + uppercase status name in the status colour), the count beside it in the same colour, and trailing collapse (double-chevron) + add (+) controls, all on the column's tinted background
- **REQ-002** Collapsed column renders as a narrow vertical pill with the rotated status name + count; tapping expands it
- **REQ-003** Column body carries a low-alpha wash of the status colour and a 1px outline in that colour, radius ~12pt
- **REQ-004** Card anatomy: optional section/parent label above the title; title row = status icon (colour) + relation glyph when linked + title (2 lines max, ellipsis); meta row = assignee avatar(s) + divider + priority flag with colour + label + divider + date with calendar icon — fields beyond that, one per line (unchanged from `012`)
- **REQ-005** `012`'s single-column field rule and `board-card-properties-panel.test.ts`'s mechanism guard both re-run unchanged and green
- **REQ-006** A Proposed ADR against `056` ADR-001 is recorded in `../../roadmap.md` §7, naming the operator's ruling as the resolution
- **REQ-007** The image judge scores ≥ 14/16 with no row at 0, twice consecutively, against the ClickUp reference

### P1 — Required

- **REQ-008** Every DEFINE row names ClickUp as its Source for board-specific rows, per the operator's explicit board-leads ruling
- **REQ-009** Board captures (phone + desktop, light + dark) are current and both opened and looked at
- **REQ-010** The operator's device row is present and unticked
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

| ID | Criterion | Measured by |
|----|-----------|-------------|
| SC-001 | Column header carries a status-coloured pill, count, collapse and add controls | Lane clause, new |
| SC-002 | Collapsed column renders as a rotated vertical pill | Lane clause, new |
| SC-003 | Column body carries a tint wash and outline in the status colour | Lane clause, new |
| SC-004 | Card anatomy (section label, title row, meta row) matches the ClickUp reference structurally | `verification.md` |
| SC-005 | `012`'s single-column rule and `045`'s mechanism guard re-run unchanged and green | `render-assertions.mjs`, `board-card-properties-panel.test.ts` |
| SC-006 | Judge ≥ 14/16, no row at 0, twice on an unchanged tree, against the ClickUp reference | `verification.md` |
| SC-007 | The operator reads the board on their own iPhone and reports it matching ClickUp's styling | Operator — no agent ticks this |
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Risk | Impact | Mitigation |
|------|--------|------------|
| Column-colour tint reopens `056`'s scrollbar/geometry ADRs unintentionally | Regression in an area this child does not intend to touch | Files to Change stay inside the header/body/card-anatomy producers named in §3; `056`'s `GEOMETRY_PINS` re-run unchanged in the same commit |
| Status colour token source (option colour vs. fixed palette) is ambiguous | Wrong colour source implemented | T001 reads the ClickUp reference again at CREATE and the existing status-option colour model before choosing; recorded in §13 |
| This child and `019` (drag feel) touch the same `board-renderer.ts` file | Merge conflict between siblings | Each names its own function/selector in §3; the css-lane triplet is acquired per child's own turn, sequentially |
<!-- /ANCHOR:risks -->

---

## 7. NON-FUNCTIONAL REQUIREMENTS

Touch targets for collapse/add controls meet the existing 44pt+ floor. No contrast regression in either theme — status colours are checked against both theme backgrounds at low-alpha tint.

---

## 8. EDGE CASES

- A status colour with no configured value (fallback token)
- All columns collapsed simultaneously (horizontal scroll behaviour)
- A column with zero cards (empty tinted body, header still carries count = 0)

---

## 9. COMPLEXITY ASSESSMENT

Level 2. One renderer family (board-renderer.ts, card-field-renderer.ts), presentational, contingent on not disturbing `012`'s or `056`'s existing landed rules.

---

## 10. RISK MATRIX

| Area | Likelihood | Impact | Net |
|---|---|---|---|
| Regression in `056`'s scrollbar/geometry pins | Low | High | `GEOMETRY_PINS` re-run unchanged in the same commit as any header/body edit |
| Card-anatomy change reopens `012`'s single-column rule | Low | High | `012`'s own lane clauses re-run unchanged; T001 confirms no shared selector before editing |
| ClickUp reference misread (single screenshot, limited states) | Medium | Medium | Cross-checked against the ClickUp harvest under `screenshots/clickup/**` for additional board states before CREATE |

---

## 11. USER STORIES

As the operator, I open the board on my iPhone and see status-coloured column headers with counts and collapse/add controls, tinted column bodies, and cards with a clear title/meta anatomy — matching ClickUp's own board styling.

---

## 12. OPEN QUESTIONS

- Exact column-tint alpha and outline width — read again from the reference at CREATE time and recorded numerically, not assumed
- Whether the ClickUp harvest (`screenshots/clickup/**`) contains additional board states (empty column, many-cards scroll) beyond the operator's single screenshot — checked at DEFINE (T002)

---

<!-- ANCHOR:gap-table -->
## 13. THE DEFINE TABLE — reference, current state, target

### References

![ClickUp board column headers reference](file:///private/tmp/claude-501/-Users-michelkerkmeester-MEGA-Development-Obsidian-Plugin/e80c6d75-9d5c-4af2-af70-05fb120371b4/scratchpad/operator-references/clickup-board-column-headers-reference.png)

*(Session-scoped scratchpad path; not a repo-relative asset. Copied into this child's `operator-notes.md` under the loop scratchpad for durability — see Related Documents.)*

- **Operator screenshot** (primary reference, board leads per operator ruling): `scratchpad/operator-references/clickup-board-column-headers-reference.png` — IN PROGRESS column expanded, RDY -> REVIEW collapsed
- **Operator words** (verbatim, 2026-09-11): *"In general for board styling lets mimic clickup"*; *"For board clickup column headers are great, button to collapse or add new one and just good ui styling"*
- **ClickUp harvest** (secondary, for additional states): `screenshots/clickup/ios/views/**` — checked at T002 for empty-column and many-card states not shown in the operator's single screenshot
- **Anytype** (`056` ADR-001, superseded for board surfaces): `screenshots/anytype/mobile/app/anytype-mobile-set-kanban-{light,dark}.png` — kept as `012`'s own reference for the field-layout rule, which stands; not used for header/body/anatomy in this child
- **Notion**: not used for board surfaces per the operator's ruling (ClickUp leads)

### What the reference cannot answer

- Exact tint alpha percentage and outline width in points — not derivable from a screenshot at capture resolution; recorded as `TBD — needs operator capture` or measured against our own token scale, never sampled as a pixel value from the image
- Desktop board column-header equivalent — the operator's reference is phone-only; desktop board styling continues under the existing precedent until a desktop-specific ruling arrives

### The table

| Element | Ours today | ClickUp (structural) | Target | Source |
|---|---|---|---|---|
| Column header | `TBD — T001` | Rounded pill: status icon + uppercase name in status colour; count beside in same colour; trailing collapse (chevron) + add (+) | Status-coloured pill header with count, collapse and add controls | ClickUp (operator ruling: board leads) |
| Collapsed column | `TBD — T001` | Narrow vertical pill, rotated status name + count | Vertical pill, tap to expand | ClickUp |
| Column body | `TBD — T001` | Low-alpha status-colour wash, 1px outline in that colour, radius ~12pt | Tinted + outlined column body | ClickUp |
| Card section label | `TBD — T001` | Optional grey label above title | Section/parent label above title when present | ClickUp |
| Card title row | `TBD — T001` | Status icon (colour) + relation glyph + title, 2-line ellipsis | Icon + title row as described | ClickUp |
| Card meta row | `TBD — T001` | Assignee avatar(s) + divider + priority flag (colour+label) + divider + date+icon | Meta row as described, one line | ClickUp |
| Card fields beyond meta row | Single column, one per line (`012`, unchanged) | n/a — `012` already settled this | Unchanged — `012` stands | Internal (012's own landed ruling) |
<!-- /ANCHOR:gap-table -->

---

## RELATED DOCUMENTS

- **Parent**: `../spec.md`, `../decision-record.md`
- **Operator ruling source**: `scratchpad/loop/board-visual-parity-clickup/operator-notes.md`, `scratchpad/loop/076-frame-ruling.md`
- **Related sibling (stands, not reopened)**: `../012-board-card-fields/spec.md`
- **Related sibling (mechanism, unaffected)**: `../013-board-card-properties-visual-parity/spec.md`
- **Related child (drag interaction, same reference family)**: `../019-board-card-drag-feel-clickup/spec.md`
- **Superseded-for-board-surfaces ADR**: `../../056-board-anytype-parity/decision-record.md` ADR-001 — Proposed ADR raised in `../../roadmap.md` §7
