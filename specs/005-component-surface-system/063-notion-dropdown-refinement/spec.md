---
title: "Feature Specification: Notion Dropdown, Menu and Picker Refinement"
description: "What 052's dropdown, menu and picker family still owes after the Notion screen digest was read against it: one landed ruling the code lags, four self-describing rows, three date presets without their dates, and a desktop dropdown with nowhere to escalate when the anchored popover is cramped."
trigger_phrases:
  - "notion dropdown refinement"
  - "063 spec"
  - "trailing selection check"
  - "submenu trailing value"
  - "dropdown sheet escalation"
  - "date preset subline"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: spec-core | v2.2 -->
# Feature Specification: Notion Dropdown, Menu and Picker Refinement

<!-- SPECKIT_LEVEL: 2 -->
---

<!-- ANCHOR:metadata -->
## 1. METADATA

| Field | Value |
|-------|-------|
| **Level** | 2 |
| **Priority** | P1 |
| **Status** | Draft |
| **Created** | 2026-09-06 |
| **Branch** | `worktrees/179-notion-dropdowns` |
| **Parent Spec** | ../spec.md |
| **Phase** | 63 of the `005` program |
| **Predecessor** | 052-dropdown-menu-and-picker-componentization |
| **Successor** | None |
| **Handoff Criteria** | The four measured reds in `goal.md` §3 go green with their assertions observed failing first, and `npm run gate` exits 0 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:phase-context -->
## Phase Context

This is the Notion refinement child of `052-dropdown-menu-and-picker-componentization`, opened
under the parent's **D15** pipeline: a Sonnet digest of the relevant Notion captures
(`052/notion-screens-digest.md`, 101 screens, patterns N1-N12), then a five-iteration
`/deep:research:auto` loop on GLM 5.3 flash max under `--stop-policy=max-iterations`
(`052/research/`), then this synthesis. `063` is the slot reserved for this surface in the
`059`-`066` block.

**Scope Boundary**: the dropdown primitive, the menu row grammar and the date picker —
`dropdown-field.ts`, `menu-row.ts`, `date-value-picker.ts`, `popover-host.ts` and the menu and
popover blocks of `styles.css`. The cell inline editors stay `054`'s under `052`'s D8; the toolbar
and column-menu callers stay `052`'s T008/T009 and are ridden, not forked.

**Dependencies**:
- `052`'s open T008 (toolbar action panels) and T009 (column-menu submenus) own the caller files
  that REQ-002's rows live in.
- The parent's serialized CSS lane holds `styles.css`.
- `044`'s sheet grammar and `048`'s stacking model constrain REQ-004 and are not re-specified here.

**Deliverables**:
- The trailing selection check in the dropdown popover, with the lane assertion that proves it.
- Current values on the four submenu parent rows that lack them.
- Resolved-date sublines under the three relative date presets.
- A measured escalation from a cramped anchored dropdown to a sheet with a dedicated button.
- Eight ADRs recording every Notion-versus-Anytype conflict the loop named.

**Changelog**:
- When this phase closes, refresh the matching file in ../changelog/ using the parent packet number plus this phase folder name.
<!-- /ANCHOR:phase-context -->

---

<!-- ANCHOR:problem -->
## 2. PROBLEM & PURPOSE

### Problem Statement
The dropdown, menu and picker family came out of `052` substantially aligned with both of its
references, and the Notion digest confirms that rather than disturbing it. What it exposes is
narrower and more awkward: a **landed ruling the code still lags** — the selection check is ruled
trailing by Anytype G14 and by Notion N2, two of the three row families already comply, and
`dropdown-field.ts` alone renders it leading with no pending task that opens the file. Beside it sit
three additive gaps the digest makes obvious — submenu parent rows that promise a child without
saying what is currently in it, date presets that name a relative day without resolving it, and a
desktop dropdown that has exactly one presentation and no way out of it when the anchored popover is
too small for its content.

### Purpose
Close the lag, make the menus self-describing, and give the desktop dropdown the second shape the
operator asked for — each on a threshold observed failing first, and none of it at the cost of a
landed ruling.
<!-- /ANCHOR:problem -->

---

<!-- ANCHOR:scope -->
## 3. SCOPE

### In Scope
- Flipping the dropdown popover's selection check to trailing, in the row builder and in the grid.
- Populating the `value` slot on the four submenu parent rows whose child carries a current value.
- Resolved-date sublines under the three relative date presets.
- A measured escalation path from an anchored desktop dropdown to a sheet with a dedicated button.
- Extending the existing `constructed-dropdown` lane marker and its fixture counterpart.
- Refreshing `052`'s two stale completion-criterion "Today:" texts against the landed tree.
- Eight ADRs: six restating landed rulings as named non-adoptions, two Proposed for the operator.

### Out of Scope
- The option editor's create-field-as-search, the relation subtitle rows and the status buckets —
  `054`'s files under `052`'s D8, recorded in `decision-record.md` rather than built here.
- The phone sheet's `> 8` search count gate — ADR-006 ruled it the phone's alone (ADR-001 here).
- Any change to the colour picker's grid — G15 kept it and its accessible-name clause has landed
  (ADR-004 here carries only the visible-label question).
- Notion's entity-selection filled circle and its radio grammar — refused under ADR-005 refusal 4
  and under N2's own never-mixed rule (ADR-002, ADR-003 here).
- A tile-grid row mode for a block-insert chooser (N8) — no caller names it, so the primitive is
  not extended for it.

### Files to Change

| File Path | Change Type | Description |
|-----------|-------------|-------------|
| `src/views/dropdown-field.ts` | Modify | Check created last in the row builder (`:349-359`); the escalation branch beside the phone-sheet branch (`:224`) and the placement call (`:421`) |
| `styles.css` | Modify | `.db-dropdown-option` grid tracks (`:3237-3241`) and its three variants (`:3258-3268`); the check's own rule (`:3289-3296`); the escalated surface's chrome |
| `src/views/date-value-picker.ts` | Modify | A resolved-literal subline under each relative preset (`:157-171`) |
| `src/views/column-menu.ts` | Modify | `value` on the Change type and Number display style rows (`:128`, `:144`, `:160`) — rides `052` T009 |
| `src/views/toolbar-renderer.ts` | Modify | `value` on the Change view type row (`:1312`) — rides `052` T008 |
| `src/views/dropdown-field.test.ts` | Modify | The DOM-order case and the escalation branch case |
| `tools/live/constructed-state-assertions.mjs` | Modify | Extend the `dropdownPopover` marker (`:123`) with the trailing-check assertion |
| `tools/screenshots/scenarios/core.mjs` | Modify | Move the `dropdown-field` fixture (`:251-256`) to match the real row order |
| `specs/.../052-.../goal.md` | Modify | Refresh the two stale criterion "Today:" texts; tick nothing |
<!-- /ANCHOR:scope -->

---

<!-- ANCHOR:requirements -->
## 4. REQUIREMENTS

### P0 - Blockers (MUST complete)

| ID | Requirement |
|----|-------------|
| REQ-001 | The dropdown popover's selection check is the row's last element child and occupies a trailing 16px track, in every context variant that re-specs `.db-dropdown-option`'s grid, with `aria-selected` and `aria-activedescendant` behaviour unchanged. |
| REQ-004 | A desktop dropdown whose anchored placement is measurably cramped presents instead as a sheet opened by a dedicated button, decided once in the dropdown primitive rather than per call site, with `044`'s sheet grammar and `048`'s stacking model held green. |
| REQ-006 | The `constructed-dropdown` lane marker asserts the trailing check, is observed failing on today's tree with its exit status read, and `npm run gate` exits 0 afterwards. |

### P1 - Required (complete OR user-approved deferral)

| ID | Requirement |
|----|-------------|
| REQ-002 | Each of the four submenu parent rows whose child carries a current value renders that value ahead of its chevron, through the existing `menu-row.ts` slot rather than a new one. |
| REQ-003 | Each of the three relative date presets carries the date it resolves to, in the secondary-text role, inside the picker's unchanged 252px width role. |
| REQ-005 | Every desktop dropdown, including any surface REQ-004 escalates to a sheet, opens with a search input active; the phone sheet's count gate is untouched. |
| REQ-007 | `052`'s two stale completion-criterion "Today:" texts are refreshed against the landed tree, un-ticking nothing. |

> Acceptance criteria for these requirements live in `acceptance-criteria.md`,
> which is the document that decides whether this packet may close.
<!-- /ANCHOR:requirements -->

---

<!-- ANCHOR:success-criteria -->
## 5. SUCCESS CRITERIA

- **SC-001**: The check is the last element child in the constructed dropdown popover — an
  assertion that fails on `c9966433` before it passes.
- **SC-002**: 6 of 6 submenu parent rows with a current value render it, against 2 of 6 today.
- **SC-003**: 3 of 3 relative date presets carry a resolved literal, against 0 of 3 today, with the
  picker still 252px wide and no tap target below 28px.
- **SC-004**: At least one desktop dropdown surface can present as a sheet, against 0 today, and the
  condition that triggers it is a measured one a reader can re-derive.
- **SC-005**: `npm run gate` exits 0, read from `$?`, with the extended lane row green and the
  `constructed-dropdown` capture re-taken and opened.
<!-- /ANCHOR:success-criteria -->

---

<!-- ANCHOR:risks -->
## 6. RISKS & DEPENDENCIES

| Type | Item | Impact | Mitigation |
|------|------|--------|------------|
| Dependency | `052` T008 / T009 | REQ-002's rows live in files those legs own | Ride them: this packet contributes the row change, it does not open the files alone (D4) |
| Dependency | The parent's serialized CSS lane | REQ-001 and REQ-004 both write `styles.css` | Acquire and release the lane in the same commit, naming the captures that moved |
| Dependency | ADR-004, ADR-005 | Two Proposed decisions are the operator's | Neither gates any P0; both are recorded and left open |
| Risk | The capture harness renders fixture markup, not the real renderers | A green capture can hide a real regression, and a red one can be a stand-in gap | D5: the fixture at `core.mjs:251-256` moves with the code, and the pixel read is owed to an image-capable leg |
| Risk | "Cramped" is a judgement unless it is measured | REQ-004 becomes unfalsifiable | The threshold is code-derived: the anchored placement cannot honour `preferredWidth: 280` and falls toward `minWidth: 180` (`dropdown-field.ts:421`), or the panel height reaches `owned-menu.ts:360`'s viewport cap |
| Risk | Line drift between the research and the tree | Citations point at the wrong code | Already hit once and corrected: the loop cited the pre-rebase `:240-253`; every citation here is re-derived on `c9966433` |
<!-- /ANCHOR:risks -->

---

<!-- ANCHOR:questions -->

---

<!-- ANCHOR:nfr -->
## L2: NON-FUNCTIONAL REQUIREMENTS

### Performance
- **NFR-P01**: The row builder's cost is unchanged — the check flip reorders creation, it does not
  add an element or a layout pass.
- **NFR-P02**: The escalation decision is made once per open, from values the placement code
  already computes; it introduces no measurement loop.

### Security
- **NFR-S01**: No new persistence, no new network surface, no new user input path. The date subline
  is derived from a value the picker already holds.
- **NFR-S02**: The subline is rendered as text through the existing element helpers; nothing is
  interpolated into markup.

### Reliability
- **NFR-R01**: Keyboard behaviour is invariant across the flip — `dropdown-field.ts:539` reads
  `.db-dropdown-option-check` by class, not by position, and that stays true.
- **NFR-R02**: Every changed surface keeps a lane row; no lane is skipped to go green.
<!-- /ANCHOR:nfr -->

---

<!-- ANCHOR:edge-cases -->
## L2: EDGE CASES

### Data Boundaries
- A row with no icon and no swatches: the grid has one content track plus the trailing check.
- A row with both an icon and swatches: `styles.css:3266-3268`'s four-track variant keeps the check
  last, not merely present.
- A submenu row whose child has no current value: it keeps the bare chevron; `menu-row.ts:116`
  already gives the chevron the `db-menu-item-current` class in that case so the spacing holds.
- A date preset whose resolved literal is longer than the 252px role allows: it ellipsises rather
  than widening the picker.

### Error Scenarios
- The escalation cannot find room for a sheet either: it falls back to today's anchored popover
  rather than pinning a surface to the viewport top — the failure `popover-position.ts:48-58`
  documents from the `dockTo` history.
- A caller passes `value` on a row that also carries a toggle: N1's own rule is one trailing slot
  per row, and `menu-row.ts` enforces it by construction.

### State Transitions
- Escalating mid-open: the dropdown is closed and re-presented rather than mutated in place, so the
  active-picker registry sees one surface at a time.
- The combobox input survives the escalation — REQ-005 is the criterion that says so.
<!-- /ANCHOR:edge-cases -->

---

<!-- ANCHOR:complexity -->
## L2: COMPLEXITY ASSESSMENT

| Dimension | Score | Notes |
|-----------|-------|-------|
| Scope | 19/25 | ~450 LOC across 8 files: two view modules, one picker, two callers, one test, two harness files |
| Risk | 8/25 | No auth, no API, no schema; the shared surfaces are `styles.css` and the row grammar |
| Research | 12/20 | The five-iteration loop is done; only `date-value-picker.ts` needs a first read |
| **Total** | **58/100** | **Level 2** — `recommend-level.sh --loc 450 --files 8 --architectural`, confidence 92%, phase score 10/50 against the 25 threshold |
<!-- /ANCHOR:complexity -->

---

## 10. OPEN QUESTIONS

- Which anchored dropdown surfaces does the operator actually read as cramped, and does the measured
  trigger in REQ-004 select those and not others? The threshold is falsifiable; the sample is not
  yet taken.
- Does a colour swatch carry a visible label (Notion `e5accf4d` is a one-column labelled list), or
  do the landed accessible name, hover title and check icon suffice? ADR-004, the operator's.
- Does E3's red-plus-trash rule take a carve-out for rows that remove structure without destroying
  content (`e9698e1b` "Remove grouping", `299e69bb` "Delete filter")? ADR-005, the operator's.
- Does `052` T008's layout panel produce a consumer for N1's fifth trailing slot, the toggle? If it
  does not, the slot is not built.
<!-- /ANCHOR:questions -->
