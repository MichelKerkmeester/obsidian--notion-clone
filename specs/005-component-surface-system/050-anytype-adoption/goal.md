---
title: "Goal: Anytype Adoption"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "050 goal"
  - "anytype adoption goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/050-anytype-adoption"
    last_updated_at: "2026-09-05T08:10:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the directive from 047's ranked adoption items"
    next_safe_action: "Execute T001, the capture read and design true-up"
    blockers:
      - "The Anytype capture sweep is still running; no item may be implemented before T001 reads it"
      - "The first capture pass reached no mouse-driven surface, so five items have no reference screen yet"
    key_files:
      - "specs/005-component-surface-system/047-competitor-references-and-pm-alignment/research/research.md"
      - "screenshots/anytype/README.md"
      - "src/views/toolbar-renderer.ts"
      - "src/views/board-renderer.ts"
      - "src/views/view-config-panel-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-050-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the running capture sweep reach the filter/sort panel, a context menu, an open cell editor and view settings — the five items with no reference screen today?"
      - "Do items 5 and 11 need a capture at all, or are they code-derived only?"
    answered_questions:
      - "The operator ruled Anytype a design source on 2026-09-05: 'I find Anytype to have amazing UI/UX'"
      - "Implementation waits for the capture sweep; the phase opens now so the design work can be sequenced"
---
# Goal: Anytype Adoption

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Land the fourteen Anytype adoption items `047`'s research ranked, each one designed
against a real Anytype screen before it is written and each one closed on a threshold that was
observed failing first — on desktop and on the phone both.

**Why.** The operator read the research and ruled: *"I find Anytype to have amazing UI/UX."* `047`
produced 89 findings and ranked 14 file-scoped items against `src/views/*`, none of which needs new
architecture. What `047` did not produce is a design: its ranking is derived from Anytype's source
and docs, and the first capture pass reached **no mouse-driven surface at all** — no filter panel
with a condition open, no context menu, no open cell editor, no view settings. So this packet does
not start with code. It starts by reading the capture sweep and truing every item's design against
the screen it claims to copy.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Captures first, and this is a gate rather than a preference.** T001 reads the Anytype capture sweep and trues up all fourteen designs before any item is implemented. An item whose reference surface the sweep did not reach is designed from `047`'s code-derived findings **with that gap named in its task**, never from a guess about what the screen looks like. |
| D2 | **Red first, per item, on a threshold.** Every item carries one number or one boolean stated in `acceptance-criteria.md`, and that check is observed **failing on the current tree** before the item is written. An item that arrives green has not been proven and does not close. |
| D3 | **Desktop and phone, both, per item.** An item that lands on desktop only is half done. Where an item has no phone expression, the task says so and says why — silence is not a disposition. |
| D4 | **`044`'s sheet grammar and `048`'s stacking model are constraints, not deliverables.** Any surface this packet adds or changes on the phone carries `044`'s seven elements, and any surface that can open over another obeys `048`'s stacking model. This packet consumes both unchanged and may not regress either. |
| D5 | **The Project Manager 1:1 board and gantt fidelity does not move.** `038` and `037` hold reference parity against `screenshots/project-manager/`. An item that changes a pixel of that path is wrong until the parity captures are re-read and shown unchanged, or the operator rules otherwise. |
| D6 | **Anytype is a design source, not a data model.** The four explicit non-adoptions `047` recorded stay non-adopted: cross-view drag that writes a property, sidebar widgets and live lenses, the full template system, and This-Object / Current-User dynamic filter values. Item 10 is the adopted slice of templates and is not a doorway to the rest. |
| D7 | **One leg touches one file.** The implementation order groups items by the file they land in, so `toolbar-renderer.ts`, `board-renderer.ts` and the rest are opened once rather than once per item. `styles.css` is the exception every leg may reach and is serialized by the parent's CSS lane. |
| D8 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **The capture sweep has been read and every one of the fourteen items carries a design trued
      against a real screen or a named gap.** **Today: no such document exists**, and
      `screenshots/anytype/README.md` records that the first pass reached no view switcher, no
      filter or sort panel with a condition open, no property editor, no context menu and no hover
      state — every mouse-driven surface was unreachable in that environment.
- [ ] **The filter/sort chip row exists and its trigger icons are state-dependent.** **Today: 0
      chips and one fixed icon state** — `filter-panel-renderer.ts` and `sort-panel-renderer.ts`
      render panels with no chip surface, and the toolbar's filter and sort icons do the same thing
      whether or not a filter is active.
- [ ] **Creating or duplicating a view lands in that view's settings within 100ms.** **Today: it
      lands nowhere** — `database-view.ts` creates the view and returns to the board.
- [ ] **The board's horizontal scrollbar is sticky at the viewport bottom while the board is taller
      than the viewport.** **Today: it sits at the bottom of the board**, which on a tall board is
      off-screen until you scroll to it.
- [ ] **A view can be duplicated and the duplicate is config-identical with a new id**, and the
      view tab carries a context menu. **Today: neither exists** in
      `active-view-controls-renderer.ts`.
- [ ] **Scroll position is restored per view within ±2px**, a cell editor near the right edge flips
      instead of clipping at **92px**, a drag reorder under an active sort asks first, no context
      menu is ever empty, the empty state has its two flavours, and a per-view new-row preset is
      applied at creation. **Today: every one of these six is absent**, and each carries its own
      failing number in `checklist.md`.
- [ ] **`npm run gate` exits 0 with one permanent lane row per item, each observed red before
      green**, and `npm run replay` holds with reversed 0.
- [ ] **The operator opens the board and a table on iOS and on desktop and reads the adopted
      surfaces as the improvement they asked for.** Only the operator closes this row; nothing in
      this repository can.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Everything below is VOLATILE. It is not part of the directive, it is not copied
into the objective, and it is expected to grow.

### Progress

| Item | State | Evidence |
|------|-------|----------|
| Phase opened from the operator's Anytype ruling | Done | Operator 2026-09-05, *"I find Anytype to have amazing UI/UX"*, on reading `047`'s research |
| Level chosen | Done | `recommend-level.sh --loc 1500 --files 16` → Level 2, 51/100, confidence 90%; raised to **Level 3** on judgment (fourteen independent requirements, a hard sequencing gate, two viewports). Phase score **20/50** against a threshold of 25, so a standard child rather than a phase parent |
| The fourteen items ranked and file-scoped | Done | `../047-competitor-references-and-pm-alignment/research/research.md` §11 |
| Capture sweep read and designs trued up | Pending | T001; the table lands in `capture-alignment.md` |
| The nine implementation legs | Pending | T002-T015, one leg per file group, ordered by best rank |
| A lane row per item, red first | Pending | T016-T017 |

### Deviations and findings

| Item | Note |
|------|------|
| The research ranked items it could not see | `047`'s §11 is derived from `anytype-ts` source and the official docs, not from screens. `screenshots/anytype/README.md` is explicit that clicks were impossible in that environment — raw `CGEvent` posts had no effect, `System Events` was refused assistive access, and the canvas exposes one opaque `AXGroup`. Items 1, 4, 6, 7, 8 and 10 therefore have **no reference screen today**, which is exactly why D1 is a gate. |
| The level score and the phase score disagree with each other, and that is expected | They are different scales. `recommend-level.sh --loc 1500 --files 16 --architectural` would return Level 3 **and** a phase score of 30, which qualifies for decomposition; without `--architectural` it returns Level 2 and 20, which does not. The honest reading is `047`'s: *"none require new architecture, all slot into renderers or state stores we already have"* — so the run without `--architectural` is the true one, the phase score is 20, and this is a standard child. The level is raised to 3 on judgment over that same run, per the rule that a divergence goes higher. |
| Mobile has the thinnest evidence of any leg | Item 13 is ranked High (mobile) and the capture set is desktop-only and dark-only. The Android findings in `047` §10 came from `anytype-kotlin` source, and iOS was never reached. Item 13's design is code-derived until the sweep says otherwise. |
<!-- /ANCHOR:log -->
