---
title: "Goal: Record and Relation Surfaces"
description: "The durable directive this packet executes against, and the criteria that decide when it is done."
trigger_phrases:
  - "packet goal"
  - "durable directive"
  - "completion criteria"
  - "054 goal"
  - "record surface goal"
importance_tier: "important"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/054-record-and-relation-surfaces"
    last_updated_at: "2026-09-05T12:00:00Z"
    last_updated_by: "phase-author"
    recent_action: "Authored the packet from the operator's componentization directive"
    next_safe_action: "Execute T001, the capture-image read and design true-up"
    blockers:
      - "T001's image true-up gates every design row (D1)"
      - "OPS-001..003 are the operator's; nothing here can close them"
    key_files:
      - "src/views/record-detail-panel.ts"
      - "src/views/cell-renderer.ts"
      - "src/views/table-record-peek.ts"
      - "screenshots/anytype/README.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-054-goal"
      parent_session_id: null
    completion_pct: 0
    open_questions:
      - "Does the record sheet's desktop anchored panel keep its current DOM under the P1 primitive?"
      - "Does P3's search-first picker sit beside or replace S3's quick-add file-field row?"
      - "Does a board card gain the add-property affordance, or is a card summary the wrong place?"
    answered_questions:
      - "The operator's 2026-09-05 directive names componentization and Anytype adoption together"
      - "Formulas, rollups and calculations stay ours (ADR-003); the PM 1:1 board and gantt stay ours"
---
# Goal: Record and Relation Surfaces

<!-- SPECKIT_TEMPLATE_SOURCE: goal | v2.2 -->

> Everything above the log is DURABLE: it is what an operator sets as the session
> objective, and it must stay true for the life of the packet. Keep it short —
> the runtime goal surfaces cap what they will hold, and a truncated objective
> loses its tail, which is where the completion criteria live.

---

<!-- ANCHOR:directive -->
## 1. DURABLE DIRECTIVE

**Objective:** Reduce the record/object surfaces and property editing to one set of shared
primitives — header, property row, add affordance, hidden-properties group, type picker, note-body
region, and one inline-editor primitive per column type — consumed by the record sheet, the table
record peek, the properties panel, the board-card properties panel, the property modals and every
cell editor; and take the Anytype object-page and relation-panel behaviours the captures show are
better.

**Why.** The operator's 2026-09-05 directive: *"research recommendations and how to tackle / update
/ improve every modal, sheet and general ui ux to take the best from AnyType and componentize stuff
as much as possible."* `050` lands the view-level half of that sentence; this packet is the
record/object half. Today one property is built three ways, one header four ways, one type list
three ways, and every editor is a private method of a 3,152-line class no check can mount.

### Decisions

Frozen choices. Changing one is an amendment.

| ID | Decision |
|----|----------|
| D1 | **Captures before design rows.** Every §5B behaviour is trued against its named Anytype capture — opened and read by hand — before the primitive that adopts it is written. A capture that cannot be opened is a named gap, never a guess. |
| D2 | **Red first, per threshold.** Every AC carries one number measured failing on the current tree (the 4/3/3 vocabularies, the missing group, the "Empty" word, zero exported editors) and recorded in `checklist.md` before the fix. An item that arrives green has not been proven. |
| D3 | **Componentize is the deliverable, not a side effect.** The census must read 1/1/1 — one header builder, one property-row vocabulary, one type list — by the census lane, with bypass negative controls seen red. A "shared" primitive one consumer imports through a shim while another keeps its copy is not done. |
| D4 | **Editors are extracted, never rewritten.** ADR-002: method bodies move unchanged behind `CellRenderer.startEdit`'s pinned contract, one editor per leg, no behavioural edit inside a move. The accumulated defect fixes in those bodies (Escape funnels, IME guards, session close routing) are re-earned one operator report at a time and are not thrown away. |
| D5 | **What stays ours stays ours.** Formulas, rollups and calculations (ADR-003); the table; the bottom sheets' ownership (`003`/`016`/`031`); the Project Manager 1:1 board and gantt (`037`/`038` parity); `023`'s editable note body; `045`'s card-hiding mechanism; `006`'s open-target resolver. A change to any of them is outside this packet. |
| D6 | **Anytype is a design source, not a data model.** `050`'s D6 non-adoptions carry over: no Objects/Types/Queries, no sidebar widgets, no full template system, no dynamic filter values. |
| D7 | **One leg, one file group.** The switching legs each touch one consumer group; `styles.css` is the exception, serialized by the parent's CSS lane. The board reference captures are re-read after any leg that changes what a card draws. |
| D8 | **One owner per surface, across the five family phases.** **Cell inline editors are this phase's** — one per column type, extracted behind `CellRenderer.startEdit` (ADR-002). The **confirm primitive is `051`'s** and every destructive path here consumes it. The **shell** a record sheet or a property modal presents in is `051`'s; this phase changes the *body*, never the chrome decision. The **condition row is `053`'s**. The **menu row builder and picker host are `052`'s**; P3's picker consumes them. `048`'s stacking model is a constraint and is not re-specified here — this phase changes *which code builds an editor*, never *how it stacks*. |
| D9 | Shipped, verified and operator-confirmed are three states (parent D3). A green lane does not close this phase; OPS-001..003 are the operator's. |

<!-- /ANCHOR:directive -->

---

<!-- ANCHOR:binding -->
## 2. BINDING

**Read the phase's own documents before acting:** `spec.md` §5A (the ten-surface inventory) and
§5B (the seven Anytype behaviours) are the inventory this packet exists to change;
`migration-table.md` (created by T003) is the per-surface plan of record.

`roadmap.md` §5.A maps the program's phases; `spec.md` §5C maps the 050 overlaps.

**Precedence.** The parent's decisions outrank this packet's, which outrank any summary. Name
conflicts; never resolve them silently.

**Stop.** Only the criteria below decide done.

<!-- /ANCHOR:binding -->

---

<!-- ANCHOR:completion -->
## 3. COMPLETION CRITERIA

- [ ] The census reads **1** header builder, **1** property-row vocabulary and **1** property-type
      list across the family, read by the census lane — one page rendering the same column through
      every consumer — never by grep. Red first: the counts today are **4 / 3 / 3**, measured by
      T002 and recorded in `checklist.md` C1-C3. The lane's negative controls (bypass the primitive
      in one consumer; reintroduce a second builder) were observed red before the counts closed.
- [ ] The record sheet renders a hidden-properties group with a count whose expanded state survives
      a field-commit refresh, and empty relation/select/multi-select rows render an add affordance
      opening the occupied row's editor — on the record sheet and board cards, with the word
      "Empty" gone where an editor exists. Red first: no group exists today
      (`record-detail-panel.ts:387-396` filters empties wholesale) and `getEmptyDisplayValue`
      (`record-detail-panel.ts:636`) renders the placeholder word. The negative control (restore the word, remove the
      group) was observed red.
- [ ] One exported editor primitive per column type exists behind `CellRenderer.startEdit`, the
      pinned dispatch test is green, and the option and relation editors mount standalone in a lane
      — the first check in this family that can hold an editor without constructing the 3,152-line
      class. Red first: **0** exported primitives exist today; the pinned test fails on their
      absence before the extraction starts (ADR-002's designed red).
- [ ] `migration-table.md` exists with one row per §5A surface (10) and one per §5B behaviour (7),
      every named capture filename resolving under `screenshots/anytype/`, every behaviour row
      carrying T001's image-true-up disposition (adopted / adapted / rejected-with-reason), and
      every surface row marking what stays ours. Red first: the file does not exist.
- [ ] `npx tsc --noEmit`, `npm run build` and `npx vitest run` all pass with exit statuses read
      (the repo's three verification gates); `npm run gate >/tmp/gate.log 2>&1; echo $?` → 0 with
      one permanent lane row per primitive, each negative control observed red then green; `npm run
      replay` holds with reversed 0; `npm run screenshots:verify` exits 0 with every changed capture
      opened and read by a person.
- [ ] The board-card reference captures are `pixelHash`-identical to their pre-L3 baseline, or the
      difference carries an operator ruling — read before any L3 close (D7).
- [ ] **The operator opens a record on iOS and desktop and reads it as one object page against the
      Anytype object page; reports no surface where a property looks or edits differently from the
      same property elsewhere; and confirms formulas, rollups and aggregations behave exactly as
      before.** Only the operator closes this. Nothing in this repository can.

<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:log -->
## 4. LOG

Volatile. Not part of the directive.

- **2026-09-05 — landed in-runtime.** Reviewed against the parent's D1-D14, `050`'s
  `design-trueup.md` and the current tree, then copied from
  `worktrees/083-phase-record-relation-surfaces` into `worktrees/086-land-phases-051-055`.
  **Raised to Level 3** on judgment over the script's Level 2 — the same call the four sibling
  packets made, and the tie-breaker is ADR-002's extraction out of a 3,152-line class no check can
  mount. `tasks.md`'s seven legs are grouped under four phases so the level's own content metric is
  satisfied; the `L1`-`L7` leg vocabulary the packet is written in is unchanged. **Corrected:** §5B's
  evidence preamble and row A5 against the true-up, plus five drifted `file:line` citations —
  `getEmptyDisplayValue` (`:424-427` → `record-detail-panel.ts:636`), the record sheet's empty filter
  (`:393-396` → `:387-396`), `column-manager-renderer.ts`'s header branch (`:214-224` → `:180`),
  `getSheetTitle` (`db-modal.ts:90-94` → `:83-88`) and `editOptionPopover` (`:1123` → `:1106`).
  **Spot-checked and confirmed exact:** `cell-renderer.ts:644` `startEdit`, its 3,152 lines,
  `editRelationPopover :899`, `editDatePopover :1787`, `editTextPopover :2353`, `renderCardField :455`,
  `db-record-detail-fields :390`, `mountNoteBodyRegion` mounted at `record-detail-panel.ts:295`, and
  all four cited Anytype capture filenames. D8 was added to record the one-owner split.
- **2026-09-05 — packet authored.** Level 2 (script: 50/100, confidence 90%, at `--loc 1800 --files
  14`; phase score 10/50 → standard child). Inventory read from source at authoring time; the three
  spec open questions are recorded in `spec.md` §10 and resolve at T001. `create.sh --phase` was
  tried and produced three wrongly-named placeholder folders plus a parent `spec.md` edit outside
  this packet's write scope; both were reverted and the 050-structure fallback documented in the
  dispatch was used instead. The image reader available to the authoring pass could not open PNG
  files, so §5B stands on the capture index's descriptions pending T001 — recorded here and in
  `checklist.md`'s protocol rather than hidden.

<!-- /ANCHOR:log -->
