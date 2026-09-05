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
