---
title: "Decision Record: Record and Relation Surfaces"
description: "ADR-001: primitives live in a new record-surface module family beside the consumers, not inside any one of them. ADR-002: the per-type editor extraction is mechanical — method bodies move, the startEdit dispatch contract is pinned first."
trigger_phrases:
  - "054 decision record"
  - "record-surface module family"
  - "editor extraction"
  - "where do primitives live"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/054-record-and-relation-surfaces"
    last_updated_at: "2026-09-05T12:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Recorded the two structural decisions this phase is shaped by"
    next_safe_action: "Execute T001, the capture-image read and design true-up"
    blockers: []
    key_files:
      - "src/views/record-detail-panel.ts"
      - "src/views/cell-renderer.ts"
      - "src/views/card-field-renderer.ts"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-054-author"
      parent_session_id: null
    completion_pct: 0
    open_questions: []
    answered_questions:
      - "The operator's 2026-09-05 directive names componentization and Anytype adoption together; formulas/rollups/calculations and the PM 1:1 board and gantt stay ours"
---

# Decision Record: Record and Relation Surfaces

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: decision-record | v2.2 -->

---

<!-- ANCHOR:adr-001 -->
## ADR-001: The primitives live in a new `src/views/record-surface/` module family, not inside any one consumer

**Status: DECIDED — 2026-09-05 (authored with the packet).**

### Context

The property row exists three times today: `renderCardField` (`card-field-renderer.ts:102`) for the
record sheet and board cards, `renderProperty` (`table-record-peek.ts:334`) for the peek, and the
hand-duplicated checkbox/icon/name row in `column-manager-renderer.ts:265` and
`board-card-properties-panel.ts:48`. Any of those files could have become "the" home of the
primitive — and whichever one did would have owned the other four. The peek's own badge-fix comment
(`table-record-peek.ts:330-332`) records how that goes: the fix was to copy the cell's rendering
across, because there was nowhere to put it that both files already looked at.

### Decision

New modules under `src/views/record-surface/`, one per primitive, with `index.ts` as the documented
contract. Consumers import; none of them hosts. Where an existing helper's anatomy *is* the
primitive (`renderCardField`), the helper becomes a re-export shim over the primitive so its four
callers beyond this family keep working unchanged.

### Alternatives

| Option | For | Against |
|---|---|---|
| Host the primitive in `card-field-renderer.ts` (chosen by some other programs) | No new directory; the file already exists | That file's callers are board and card surfaces; the properties panel and the peek would then depend on a file whose name says neither — the same mis-ownership that made the peek copy instead of share |
| Host in `record-detail-panel.ts` | The record sheet is the biggest consumer | It is a 675-line module-scoped singleton; hosting shared primitives inside one consumer is how the 14 row vocabularies `design-system.md` §6 records came to exist |
| One mega-module (`record-surface.ts`) | Fewer files to review | Re-introduces the 3,152-line-class shape the editor extraction is pulling apart; per-primitive modules keep the lane's imports minimal |

### Consequences

- Positive: the next property-row defect gets one fix and four surfaces inherit it; the lane can
  import the primitives directly to render the same column through all four consumers (SC-001).
- Negative: a new directory in `src/views/`, which the story-coverage and surface-census lanes scan;
  both need a registration entry, not a bypass.
- Neutral: `card-field-renderer.ts` keeps its name and exports; its internal call becomes the
  primitive's.

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — the operator's directive is explicit ("componentize stuff as much as possible") and the three-vocabulary census is the defect |
| **Is there a simpler existing thing?** | Considered: hosting in an existing file. Rejected above — every existing home is one consumer's file, which is the defect's own shape |
| **What does it touch?** | Six new modules, one re-export shim, and imports in five consumer files |
| **What is the real caller that must not break?** | `renderCardField`'s four callers outside this family (board renderer and card paths) — covered by the shim, verified by the lane re-run |
| **What contract must not break?** | `CellRenderer.startEdit`'s public dispatch and `renderCardField`'s options interface — both pinned by tests before extraction |

<!-- /ANCHOR:adr-001 -->

---

<!-- ANCHOR:adr-002 -->
## ADR-002: The per-type editor extraction is mechanical — method bodies move, and the dispatch contract is pinned red-first

**Status: DECIDED — 2026-09-05 (authored with the packet).**

### Context

Every editor in the plugin is a **private** method of `CellRenderer` (`cell-renderer.ts:644`
`startEdit` dispatching to `editOptionPopover` `:1106`, `editRelationPopover` `:899`,
`editDatePopover` `:1787`, `editText` `:2294`/`:2353`, `editSingleLinePopover` `:2658`,
`editNumber` `:1596`). The record sheet and board cards reach editing only through that class's
public method (`cell-renderer.ts:203`'s constructor wiring; `database-view.ts:11678`). That is
one entry point — good — but it means the record surface cannot be tested, captured or reused
without constructing a 3,152-line class, which is why no lane renders a record-sheet editor today.

The risk is that "extract an editor primitive" becomes "rewrite the editor": the option popover is
350 lines of keyboard, IME, session, bulk-edit and color-picker funnels whose behaviour is correct
today.

### Decision

Extraction, not rewrite. Each editor method's body moves into an exported module under
`src/views/record-surface/` (for example `cell-editor-option.ts`, `cell-editor-relation.ts`,
`cell-editor-date.ts`, `cell-editor-text.ts`, `cell-editor-number.ts`) as a function taking an
options object carrying the same dependencies the method reads today. `CellRenderer`'s private
methods become one-line wrappers. Before any body moves, a unit test pins `startEdit`'s public
dispatch (type → editor) and is observed failing against the un-extracted tree (no exported editor
modules exist); after each move, the same test must pass with the wrapper delegating.

### Alternatives

| Option | For | Against |
|---|---|---|
| Rewrite each editor as a clean component | Idiomatic modules, smaller code | Every editor carries accumulated defect fixes (the Escape funnels at `:1119-1132`, the IME guards, the session close routing) that a rewrite would have to re-earn, one operator report at a time |
| Leave editors private, share only display primitives | Zero risk | Leaves the second half of the operator's ask ("one component, many callers") undone for the exact surfaces editors are; the record sheet stays untestable |
| Extract only the simple editors (text, number) | Quick win | The hard editors (option, relation) are where the duplicate-funnel risk is highest; half-extraction creates two shapes again |

### Consequences

- Positive: the lane can mount an option editor without a `CellRenderer`; the record sheet's
  editor paths become unit-testable; `startEdit`'s contract is enforced rather than inherited.
- Negative: a large mechanical diff in the family's biggest file. Mitigation: one editor per
  commit-sized leg, the dispatch test green before and after each, and no behavioural edit inside
  a moved body — a move and a change never land in the same leg.
- The relation editor's phone-side `createSheetHeader` (`cell-renderer.ts:941`) and virtualized
  list (`:963-965`) move with the body unchanged.

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — REQ-006 names it, and the record sheet's editors are unreachable by any check today |
| **Is there a simpler existing thing?** | Considered: exporting the methods as statics. Rejected — they read six instance fields; an options object is the honest seam |
| **What does it touch?** | `cell-renderer.ts` (bodies out, wrappers in) and one new module per editor type |
| **What is the real caller that must not break?** | Table double-click, record sheet field taps and board card taps — all through `startEdit`, which the pinned test binds |
| **What contract must not break?** | `startEdit`'s dispatch table and each editor's close/session protocol (`session.onClose`, the `activeOptionPopoverClose`/`activeTextEditClose` funnels) |

<!-- /ANCHOR:adr-002 -->

---

<!-- ANCHOR:adr-003 -->
## ADR-003: Formulas, rollups and calculations are named out of adoption, not merely untouched

**Status: DECIDED — 2026-09-05 (operator standing ruling, restated here so the next agent does not relitigate it).**

### Context

The Anytype captures prove the point directly: `screenshots/anytype/README.md` records that Anytype
has no formula or rollup format — "formula and rollup carry no values, and cannot. Anytype has
neither" — so there is no reference screen to adopt from. The operator's keep-list names them
anyway: these stay ours regardless of what a competitor shows.

### Decision

The formula workbench (`formula-modal.ts`), the rollup configuration
(`relation-rollup-config-modal.ts`'s aggregation filtering), computed columns and the
output-number-format editor are out of scope for Anytype adoption. The only change any of them
takes from this phase is consuming the shared type picker for their existing type dropdowns
(REQ-005) — a wiring change, not a design change.

### Consequences

- Positive: the plugin keeps the capability that is genuinely ours; `050`'s D6 non-adoptions carry
  over consistently.
- Negative: none recorded. A future operator ruling can reopen it; this ADR is the record of today's.

<!-- /ANCHOR:adr-003 -->

---

<!-- ANCHOR:adr-004 -->
## ADR-004: Where the captures and this packet's own draft disagree, the capture is the fact

**Status: DECIDED — 2026-09-05 (T001, `design-trueup.md`).**

### Context

`spec.md` §5B was drafted from `screenshots/anytype/README.md`'s written descriptions, because the
authoring pass could not open image files — recorded honestly in `goal.md`'s log rather than hidden.
The landing pass corrected one row (A5) from `050`'s view-surface true-up and left the rest standing.
T001 has now opened 31 captures by hand: the 25 `anytype-menu-object-*` object-page menus, the 12
`anytype-menu-cell-*` grid-cell editors, the iOS relations panel with its per-format editors and its
property-management sheet, and the catalogue grids.

Nine of §5B's claims did not survive the reading. Three of them are structural: they describe the
shape of a primitive this phase exists to build, so leaving them uncorrected would have built the
wrong thing and passed its own lane.

### Decision

**The capture is the fact; the draft and `047`'s research are source readings.** This is `050`
ADR-003's rule, applied to the record surfaces, and `design-trueup.md` §1 carries all nine
contradictions with their measurements. The three that change work:

1. **A2's anatomy is wrong on both halves.** No format icon belongs on a value row — neither
   platform draws one, and the icons `050` found live in pickers and in the type's property editor.
   And nothing is right-aligned: desktop flows the value 12px after its own label, iOS pins the
   value's **left** edge at 174pt. P2's anatomy is **label, then value, value left-aligned**. Our own
   desktop record sheet right-aligns (`styles.css:10161`, inherited from the board card), which is
   the defect this row now names.
2. **A4's hidden-properties group is absent from the product.** The surface that would carry it —
   `mobile/anytype-mobile-sheet-object-properties-settings-dark.png` — splits properties into
   `Header` and `Properties panel`, both always expanded, nothing counted, membership changed by
   drag. REQ-003 is **ours**, and its provenance is corrected rather than the criterion dropped.
   Anytype's model is a type-level authoring decision and goal D6 puts a type system out of scope.
3. **A5 reverts from code-derived to captured.** `mobile/anytype-mobile-sheet-relation-add-dark.png`
   is a search-first picker whose placeholder reads **"Search or create new"**, offering
   `Properties formats` first and `Existing properties` second — the opposite order to the row's.
   Three further pickers corroborate that search-first is the product's grammar, not one surface's
   habit.

Two further rulings follow from the same reading and bind the same way:

- **Two platforms, two designs.** The desktop properties panel is a card-per-property flow; the iOS
  panel is a fixed two-column list with dividers. Neither is a narrowing of the other, and §5D's
  "S1's exact analogue" is corrected. Where they disagree, **the platform's own answer wins for that
  platform** — which is `055` ADR-005's destructive-treatment ruling applied to layout.
- **Four measured refusals.** Anytype's desktop placeholder grey (`#5C5C5C`, **2.49:1**), its iOS
  placeholder grey (`#646464`, **2.88:1**), its iOS `Create` pill (border **2.08:1**, box **36pt**
  against the 44pt floor — confirming `055`'s refusal with a second measurement) and its property
  card as an affordance (**1.08:1** against its own panel). Geometry is adopted where it is sound;
  contrast is never adopted below the floor.

### Alternatives

| Option | For | Against |
|---|---|---|
| Keep §5B as drafted and note the differences in `migration-table.md` | No spec churn; the table is T003's job anyway | AC-010 gates every design row on the true-up, and a spec whose §5B still says "type icon on the left, value on the right" is what a leg author reads. The correction has to be where the requirement is |
| Treat the desktop panel as authoritative and the iOS panel as its narrowing | One design to build; fewer variants | Measurably false — a card flow and a fixed-column list are not one design. It would also aim P2 at the platform our record sheet is *least* like, since our phone sheet already ships the iOS model |
| Drop REQ-003 because Anytype has no hidden group | Fewer requirements; strictly capture-driven | The peek already ships the group and it works. "Anytype does not do it" is not a reason to remove something of ours — goal D6 already says Anytype is a design source, not a data model. Correcting the provenance is the honest fix |

### Consequences

- Positive: P2 is built to the anatomy the captures show rather than to a prose summary, and three
  acceptance criteria that could never have been observed red are restated before any leg starts.
- Positive: A5 gains real evidence, so P3 is designed from a screen rather than from `047` §9.
- Negative: the desktop value-alignment fix needs an override rather than a fix at
  `styles.css:10161`, because that rule is the **board card's** and `renderCardField`'s four external
  callers depend on it. A second declaration for one decision is an anti-pattern
  (`design-system.md` §10), taken deliberately to protect the `038` PM 1:1 parity (goal D5, D7), and
  it retires when P2 lands and `card-field-renderer.ts` becomes a shim — L2's job.
- Neutral: REQ-003 keeps its threshold and loses its citation. AC-010 is Met.

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — goal D1 makes the capture read a gate on every design row, and three of those rows describe a primitive's shape incorrectly |
| **Is there a simpler existing thing?** | `050` ADR-003 already states the capture-wins rule. This ADR applies it and records what it decided here; it does not restate the rule |
| **What does it touch?** | `spec.md` §2, §5B, §5D and §10; `acceptance-criteria.md` AC-002, AC-003, AC-005, AC-010. No code |
| **What is the real caller that must not break?** | The leg author reading `spec.md` §5B to build P2 and P3 — the reason the correction lands in the spec rather than only in the true-up |
| **What contract must not break?** | Goal D5's keep-list (the board card's rendering, the `038` parity) and goal D6's Anytype-is-not-a-data-model boundary. The A4 ruling is where D6 does the work |

<!-- /ANCHOR:adr-004 -->

---

<!-- ANCHOR:adr-005 -->
## ADR-005 (Proposed): AC-002's Today figure restates from a captured pixel position to a DOM box reading

**Status: PROPOSED — 2026-09-05 (T002 re-measurement). Not decided; the operator rules.**

### Context

AC-002's Today cell was originally measured on a screenshot: "measured on `constructed-record-detail-desktop-dark.png` as labels at x 59 on every row and values starting at 273, 311, 319, 343, 349 and 362." T002's brief for this pass forbids opening PNGs — the re-measurement runs through `rg`, `node -e`, `npx vitest run` and headless Chrome against the live renderer instead.

Re-mounting `panel-record-detail/file-view` through `tools/live/render-assertion-bundle.mjs` and reading `.db-record-detail-field-label`/`.db-board-card-value` with `getBoundingClientRect()` gives every row the same numbers — label left edge x 42, value box spanning x 122-364, `text-align: right` computed — because `getBoundingClientRect()` returns the value `<div>`'s own box, which is a fixed-width flex/grid cell, not the glyph run's start pixel. The PNG measurement was reading where the *text* started inside that box, which varies by string length; the DOM box position does not vary, by construction. The two measurements are not the same observable and one cannot be produced from the other without reading rendered glyph positions off a bitmap — the exact operation this leg was told not to do.

### Decision (proposed)

Restate AC-002's Verification cell to the DOM-observable form for every future "Today" and closing measurement: the value element's `getBoundingClientRect()` box and its computed `text-align`, not a per-row glyph-start pixel read off a capture. The defect the criterion protects (desktop right-alignment must become left-alignment per `design-trueup.md`'s A2 correction) is fully decidable from `text-align` alone — `right` today, `left` once P2 lands — so the box reading does not weaken the criterion, it just names an observable the gate can run headlessly instead of one that needs a person to open an image.

The existing PNG-based numbers stay in the row's history as what was true of that capture; they are not being called wrong, only unreproducible under a no-image-read measurement pass.

### Alternatives

| Option | For | Against |
|---|---|---|
| Open the PNG and re-measure the glyph pixel positions | Keeps the exact same observable across passes | Directly contradicts this leg's constraint, and the underlying box measurement already decides the pass/fail question (right vs. left) without it |
| Leave AC-002's Today cell as the stale PNG figures, unremeasured | No document churn | T002 exists specifically to re-measure every red number now; leaving a citation nobody can currently reproduce is the drift this task was dispatched to catch |
| Compute glyph start via a `Range`/`TextMetrics` read in the same headless pass | Closer to the original figure's intent | More code for a number the criterion does not need — the box's `text-align` already answers "aligned right or left," and a glyph-accurate x is not part of any threshold this packet defines |

### Consequences

- Positive: every future re-measurement of AC-002 can run unattended in the gate; no step requires a person to look at an image first.
- Negative: the exact numbers 59/273/311/319/343/349/362 are retired from being the row's live evidence; a reader who wants that specific historical reading finds it in this ADR and the row's own prior-citation note rather than in a re-run command.
- Neutral: the row's Unmet status and its underlying defect (right-aligned today, must become left-aligned) are unchanged by this restatement.

### Five checks

| Check | Answer |
|---|---|
| **Does this need to exist at all?** | Yes — T002 could not observe the row's own citation red as written, and evidence-and-proof.md requires marking that rather than leaving it silently unreproduced |
| **Is there a simpler existing thing?** | The box/`text-align` reading already exists as a byproduct of mounting the scenario for the census; no new measurement code beyond the throwaway script this pass wrote |
| **What does it touch?** | `acceptance-criteria.md` AC-002's Verification cell only; no code, no other AC row |
| **What is the real caller that must not break?** | Whoever next re-measures AC-002 to close it — they need a command that runs without opening an image |
| **What contract must not break?** | ADR-004's ruling that P2's anatomy is "label, then value, value left-aligned" — this ADR does not touch that, only how the current-state number is taken |

<!-- /ANCHOR:adr-005 -->
