---
title: "Goal: Board Anytype Parity"
description: "The durable directive for rebuilding the board to Anytype's kanban, and the criteria that decide when it is done."
trigger_phrases:
  - "056 goal"
  - "board anytype parity goal"
  - "kanban parity goal"
  - "board reversal goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/056-board-anytype-parity"
    last_updated_at: "2026-09-05T22:45:00Z"
    last_updated_by: "markdown-leaf"
    recent_action: "authored the packet from the operator's board/calendar anytype ruling"
    next_safe_action: "Execute T001, the kanban capture true-up, by an image-capable leaf reading the captures px by px"
    blockers:
      - "Every geometry value in spec.md section 4 is owed to T001; nothing here is designed from an unopened capture"
      - "styles.css edits are serialized by the parent's CSS lane"
    key_files:
      - "src/views/board-renderer.ts"
      - "src/views/board-card-fields.ts"
      - "screenshots/anytype/desktop/sets"
      - "screenshots/anytype/desktop/menus"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-056-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the phone board adopt the desktop column geometry, or keep 044's sheet grammar as its only constraint"
      - "Do the local board extensions default-off retire outright, or fold into an Anytype-shaped equivalent"
    answered_questions:
      - "The board half of the 2026-09-04 Project Manager 1:1 ruling is superseded; the gantt half is not"
      - "045's board card properties are kept — the mechanism stays, its presentation is retargeted"
      - "048's stacking model and 044's sheet grammar are constraints, not deliverables"
---
# Goal: Board Anytype Parity

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Rebuild the board view so its UI and UX read as Anytype's kanban rather than
Project Manager's, element by element against the captured screens — column header, card, cover,
card properties, the new-record affordance, column add, drag, grouping, option colours, the sticky
horizontal scrollbar and the empty column — and retire or fold the local extensions that have no
Anytype counterpart.

**Why.** The operator's instruction of 2026-09-05 ~22:45, verbatim: *"Board UI/UX should almost be
1:1 Anytype"*, with the clarification the same minute: *"Board + calendar to Anytype; gantt stays
PM"*, and *"Make sure we have phases for that"*. This packet is the board half. `057` is the
calendar half. The gantt is untouched and stays the Project Manager 1:1 port, because Anytype has
no timeline layout to port from.

**What it reverses.** On 2026-09-04 the operator ruled *"copy their board view 1:1 from Project
Manager"*, and `038-board-kanban-port` shipped exactly that in 0.0.16 through 0.0.20. Today
`src/views/board-renderer.ts` constructs **39** distinct `pm-*` classes and `styles.css` carries
**23** `pm-kanban-*` rules. The newer instruction supersedes the board half of that ruling. It is
recorded as a conflict resolved by the newer instruction in `../roadmap.md` §7.12 and as this
packet's ADR-001 — never silently.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Captures first, and this is a gate rather than a preference.** Every element this packet adopts is trued against a real Anytype kanban screen before it is written. The reference set is `screenshots/anytype/desktop/sets/<use-case>/anytype-<use-case>-kanban-{light,dark}.png` (10 use cases x 2 themes), the nine `anytype-menu-kanban-*` and `anytype-menu-set-layout-kanban-*` menu crawls, the three iOS `anytype-mobile-sheet-kanban-*` / `-view-layout-kanban-*` sheets, and `047/research/research.md` section 5 "Board / Kanban". A value nobody read off a screen is labelled **design inferred**, in its own task, and never presented as measured. |
| D2 | **Red first, per criterion, on a threshold.** Every row in `acceptance-criteria.md` carries one number or one boolean observed failing on the current tree before the work is written, with the failing figure recorded in `checklist.md` by T002. A threshold that cannot be made to fail is not a threshold — `050`'s six false premises are the scar this decision exists to avoid repeating. |
| D3 | **Parity by default, and a deviation must be an accessibility one, named with its measurement.** This is `051` ADR-007's posture applied to the board: every value the kanban captures show is adopted, and the only permitted grounds for declining one are WCAG **1.4.11** (non-text contrast), WCAG **1.4.3** (text contrast) and a **44px** touch floor. A declined value names its ground and its measured ratio or size. Taste is not a ground. |
| D4 | **`048`'s stacking model and `044`'s seven-element sheet grammar are constraints, not deliverables.** Every phone surface this packet produces or moves must still pass `tools/live/sheet-grammar.mjs` — twelve registered surfaces and thirty-one registered stacked pairs — after every leg. Neither is re-specified here. |
| D5 | **`045`'s board card properties are kept.** The mechanism `045` built — which properties appear on a card, and the panel that configures them — survives. What changes is the presentation: the property rows adopt the captured card's own row shape. A leg that deletes `045`'s mechanism is out of scope and wrong. |
| D6 | **Local extensions default-off are retired or folded, never left dark.** A board affordance with no Anytype counterpart is either removed with its CSS and its tests, or folded into the Anytype-shaped element that subsumes it. "Shipped but defaulted off" is not a disposition; every one is named in the migration table with `retire` or `fold`. |
| D7 | **The gantt is not touched.** `037-timeline-gantt-port`'s 1:1 Project Manager copy stands, and `047`'s rows 37/38 align-closer pass now applies to the gantt alone. A board leg that moves a `pm-gantt-*` pixel is wrong until the gantt parity captures are re-read and shown unchanged. |
| D8 | **Anytype is a design source, not a data model.** `050`'s D6 non-adoptions carry over: no Objects/Types/Queries, no sidebar widgets, no full template system, no dynamic filter values. The two values `050` refused stay refused — the `#232323` row highlight at 1.14:1, and colour-only active-state signalling. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase. |
<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the parent's `goal.md` first** (`../goal.md`) — D1-D14 bind here as written there.
`../roadmap.md` section 4 maps report to phase (rows 37/38 are now the gantt's alone), section 5.A
places this phase, section 6A holds the operator decisions this packet consumes, and section 7.12
records the conflict this packet's ADR-001 resolves.

**The design read of record is `../050-anytype-adoption/design-trueup.md`,** not `047`'s research.
Where the two disagree the true-up wins — `050` ADR-003, Accepted 2026-09-05 — and it binds every
packet that designs against an Anytype screen. Where the true-up is silent on a kanban element,
T001 reads the capture and records the value here rather than inferring it from the grid.

**Precedence.** Parent decisions outrank this file, which outranks any summary. Name conflicts;
never resolve them silently.

**Stop.** Only the criteria below decide done.
<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] **The board's element vocabulary is Anytype's, and the Project Manager one is gone or
      dispositioned.** **Today: 39** distinct `pm-*` classes constructed by
      `src/views/board-renderer.ts` (`grep -o "pm-[a-z-]*" src/views/board-renderer.ts | sort -u |
      wc -l`), of which **23** `pm-kanban-*` rules in `styles.css`. Done is **0** undispositioned
      survivors: each class either replaced by its Anytype-shaped equivalent or named in the
      migration table with a written reason for staying.
- [ ] **Every element in `spec.md` section 4's anatomy is trued against a named capture file,
      measured, and matched.** **Today: no such table exists.** Done is the per-element migration
      table complete — PM element, Anytype element, capture filename, our file — with no cell
      reading `unknown` and every geometry value carrying either a measurement or the **design
      inferred** label with its reason.
- [ ] **The sticky horizontal scrollbar exists on the board.** **Today: absent** —
      `src/views/board-renderer.ts` contains no sticky scrollbar and `styles.css` has no
      board-scrollbar rule (`050/design-trueup.md` REQ-003). Anytype's is **10px tall, 8px above
      the viewport bottom, full content width**, measured at y 1199..1208 of a 1217px viewport on
      both the kanban and the grid. Colours stay ours, from the theme's scrollbar tokens.
- [ ] **`045`'s card properties survive the retarget.** Done is the property-row presentation
      changed and `board-card-properties-panel.test.ts` plus `board-card-fields.test.ts` still
      green, with the mechanism's public surface unchanged.
- [ ] **`044`'s grammar and `048`'s stacking still hold.** Done is `node
      tools/live/sheet-grammar.mjs` exit 0 with 12 surfaces and 31 stacked pairs green after the
      last leg, read from `$?`.
- [ ] **Every local extension with no Anytype counterpart is retired or folded, none left
      default-off.** Done is a count of board affordances shipped behind a default-off flag → 0,
      each row in the migration table carrying `retire` or `fold`.
- [ ] **The gantt did not move.** Done is the `pm-gantt-*` class count and the gantt capture hashes
      unchanged against their pre-leg baseline, or any move explained by a named gap.
- [ ] **OPERATOR:** the operator reads the rebuilt board on iOS and on desktop and reports it as
      Anytype-shaped. Nothing in this repository can close this row.
<!-- /ANCHOR:completion -->

---

## 4. LOG

### Opened 2026-09-05 ~22:45, on the operator's board ruling

The operator, using 0.0.27: *"Board UI/UX should almost be 1:1 Anytype"*, then *"Same for calendar
etc."*, then the clarification *"Board + calendar to Anytype; gantt stays PM"*, and *"Make sure we
have phases for that"*. Two phases were opened: this one and `057-calendar-anytype-parity`.

Level 3. `recommend-level.sh --loc 1000 --files 12 --architectural` returns **68/100**, confidence
82%, which is Level 2 by the script's own thresholds (level_2_max 69); phase score **20/50**, below
the 25 threshold, so a standard child rather than a phased one. It is scaffolded at **Level 3** on
the go-higher rule, and because every peer family packet (`050`-`055`) is Level 3 and this one
reverses a shipped port rather than extending it. The script's figure is recorded rather than
hidden.

Nothing is measured yet. T001 is the true-up and it is owed to an image-capable leaf; T002 is the
red-first measurement pass. No code has been written and no criterion is met.
