---
title: "Implementation Summary: Record and Relation Surfaces"
description: "T001 is landed and nothing else is. The design true-up measured the object-page menus, the grid-cell editors and the iOS relations panel against the packet's seven behaviour rows, and nine of them turned out to be wrong — including the anatomy P2 was going to be built to."
trigger_phrases:
  - "054 implementation summary"
  - "record surface what shipped"
  - "design true-up result"
  - "054 validation evidence"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/054-record-and-relation-surfaces"
    last_updated_at: "2026-09-05T16:10:00Z"
    last_updated_by: "design-trueup"
    recent_action: "Read 31 captures at T001 and trued up every behaviour row and the editor taxonomy"
    next_safe_action: "Execute T002, the red-number census, against the thresholds ADR-004 restated"
    blockers:
      - "AC-012 is operator-owned and nothing in this repository can close it"
      - "checklist.md's Today cells still carry the pre-true-up figures and were outside this change's write scope"
    key_files:
      - "specs/005-component-surface-system/054-record-and-relation-surfaces/design-trueup.md"
      - "src/views/record-detail-panel.ts"
      - "src/views/cell-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-054-trueup"
      parent_session_id: null
    completion_pct: 8
    open_questions: []
    answered_questions:
      - "Is the Anytype relation row 'type icon left, value right'? No — no format icon on a value row, and nothing right-aligned, on either platform."
      - "Does Anytype have a hidden-properties group with a count? No. Its axis is Header versus Properties panel, decided at the type level."
      - "Is A5's search-first picker real? Yes, on the phone, placeholded 'Search or create new'."
---
# Implementation Summary

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 054-record-and-relation-surfaces |
| **Status** | Draft |
| **Completed** | Not complete — T001 only, 2026-09-05 |
| **Level** | 3 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

No code. One document — `design-trueup.md` — and it changed the packet more than it confirmed it.

T001 opened **31 captures** by hand: the 25 `anytype-menu-object-*` object-page menus, the 12
`anytype-menu-cell-*` grid-cell editors, the iOS relations panel with its per-format editors and its
property-management sheet, and the catalogue grids. Every value in the document was read off a pixel
scan, off our own `screenshots/notion-clone/` captures, or off a line in `src/` or `styles.css`.

**Nine contradictions, three of them structural.** The three that change what gets built:

- **P2 was going to be built to an anatomy that exists on neither platform.** §5B's A2 said "type
  icon + name on the left, value on the right". Scanned across 20 desktop rows and 14 iOS rows:
  **no format icon on a value row anywhere**, and **nothing right-aligned anywhere**. Desktop flows
  the value 12px after its own label with no column at all (values begin at x 84, 121, 122, 135, 143,
  146, 149 and 153); iOS pins the value's **left** edge at 174pt on every row. The format icons `050`
  found belong to pickers and to the type's property editor.
- **REQ-003's hidden-properties group does not exist in the product.**
  `mobile/anytype-mobile-sheet-object-properties-settings-dark.png` shows the surface that would
  carry one doing something else: a `Header` section and a `Properties panel` section, both always
  expanded, nothing counted, membership changed by dragging a row across the boundary. The
  requirement stays; its provenance is corrected to **ours**, because Anytype's model is a type-level
  authoring decision and goal D6 puts a type system out of scope.
- **A5 reverts from code-derived to captured.** The landing pass marked it "design inferred from
  source code, not seen" after `050` read the desktop filter panel. The phone has it:
  `Add property` over a search field placeholded **"Search or create new"**, then `Properties
  formats` (eleven) and then `Existing properties` — formats **first**, inverting the row's order.

**And one defect of ours the comparison surfaced.** Our desktop record sheet right-aligns every
value, inherited from `.db-board-card-value { text-align: right }` (`styles.css:10161`). Measured on
`constructed-record-detail-desktop-dark.png`: labels at x 59 on every row, values ending at x 379 on
every row and starting at 273, 311, 319, 343, 349 and 362 — a ragged left edge down the one column a
reader scans. Our **phone** sheet, by contrast, already ships Anytype's iOS model exactly: a hard
`flex: 0 0 96px` label column that truncates rather than wraps, left-aligned values, a hairline
between rows.

`design-trueup.md` §4 also collapses the twelve captured per-format editors into **three shells** —
value list, calendar, inline input — over eleven formats plus one toggle, which is the grammar
ADR-002's extraction should be read against.
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

One worktree, one commit, docs only.

| File | Change |
|---|---|
| `design-trueup.md` | **New.** T001's record: method and the measured tables (§2), the seven behaviour rows (§3), the S9 editor taxonomy (§4), the 050 overlaps and the three answered open questions (§5), the roll-up with the four contrast refusals (§6) |
| `spec.md` | §2's three falsified premises corrected; §5B's preamble and all seven behaviour rows rewritten against the captures; §5D annotated with what its predictions got right and wrong; §10's three open questions answered |
| `acceptance-criteria.md` | AC-002, AC-003 and AC-005 restated — none could have been observed red as written. AC-010 marked **Met**, with `design-trueup.md` named as T001's record. Closure statement rewritten |
| `decision-record.md` | **ADR-004** added: where the captures and the draft disagree, the capture is the fact. Carries the three structural rulings, the two-platforms-two-designs ruling and the four measured refusals |
| `tasks.md` | T001 ticked with its evidence and its two named gaps; its deliverable corrected from `migration-table.md` (T003's, a circular dependency in the draft) to `design-trueup.md`. T003 now consumes it |
| `plan.md` | The T1 leg row, the phase preamble, the effort row and the M1 milestone updated to the corrected deliverable, plus a note that L3 carries one CSS override L2 retires |
| `implementation-summary.md` | **New** — this file. Level 3 requires it once a task is ticked |

**Method** is `050`'s and `055`'s, unchanged: measure, then decide. Colour was sampled with a
per-pixel scan rather than by eye, which is what turned "the select options are coloured pills" into
a measured **transparent** fill — the pill interior samples the popover's own `#171717` in 63 to 75
of 95 columns. Reading it as a chip would have carried a false badge treatment into P2.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Rationale |
|---|---|
| **ADR-004: the capture is the fact** | `050` ADR-003's rule applied to the record surfaces. The corrections land in `spec.md` §5B rather than only in the true-up, because §5B is what a leg author reads to build P2 |
| **REQ-003 keeps its threshold and loses its citation** | "Anytype does not do it" is not a reason to remove something of ours; the peek already ships a working disclosure. Correcting the provenance is the honest fix, and goal D6 already says Anytype is a design source, not a data model |
| **The conflict modal's filtered type list becomes a gate, not a merge** | It is not a second list — `property-type-conflict-modal.ts:377-380` returns a 9-of-13 or 5-of-13 **subset** of `PROPERTY_TYPES`. Anytype hides no format in any picker, and `row-menu.ts` already sets our precedent: disable with a reason rather than remove |
| **The desktop alignment fix is an override, not a fix at source** | `styles.css:10161` is the **board card's** rule and `renderCardField` has four callers beyond this family. A second declaration for one decision is an anti-pattern (`design-system.md` §10), taken deliberately to protect the `038` PM 1:1 parity, and it retires when P2 lands and `card-field-renderer.ts` becomes a shim |
| **Four contrast refusals** | Anytype's desktop placeholder (**2.49:1**), its iOS placeholder (**2.88:1**), its iOS `Create` pill (border **2.08:1**, box **36pt** against the 44pt floor — a second measurement confirming `055`'s refusal) and its property card as an affordance (**1.08:1**). Geometry is adopted where sound; contrast never below the floor |
| **The stacking observation is filed, not decided** | Four captures show a **second** sheet over a first with the parent undimmed and unscaled — `048`'s exact subject. Goal D8 makes the stacking model `048`'s, so it is evidence for that packet and decided nowhere here |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

Documentation only; no code changed, so the repository's three code gates do not apply to this
change and were not run.

| Check | Result |
|---|---|
| `orchestrator.js <folder> --strict`, run from the primary checkout | **RESULT: PASSED** — first `RESULT:` line for this folder |
| Every capture filename cited in `design-trueup.md` and `spec.md` §5B resolves under `screenshots/anytype/` | Confirmed by directory listing before each was opened |
| Every `file:line` citation added to the packet | Read from the working tree at the time of writing: `styles.css:10161`, `:10317-10332`, `:10415`, `:10462-10474`, `:10477-10481`; `record-detail-panel.ts:348-386`, `:387-396`, `:636`; `table-record-peek.ts:259-278`, `:334`; `create-property-modal.ts:48-52`; `property-type-conflict-modal.ts:377-380`; `src/i18n.ts:77`, `:549` |
| Contrast ratios | Recomputed from sampled RGB with the WCAG relative-luminance formula, never quoted |
| `006-record-open-target`'s in-flight AC-014/AC-015 | Read from the uncommitted diff in worktree `085-record-open-dock` before being cited |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

- **Two named gaps, and they are named rather than guessed.** A4 has no reference screen on either
  platform — the surface that would carry one shows a different model — so REQ-003 is designed from
  our own peek. And `menus/anytype-menu-cell-type-dark.png` could not be read: its menu fell outside
  the crop. The same menu is legible in `menu-object-type-picker-dark.png` and the A6 row does not
  depend on the unreadable file.
- **`checklist.md`'s Today cells still carry the pre-true-up figures**, including the "3 type lists"
  count that AC-005 now restates. It was outside this change's write scope; **T002 must reconcile it
  against the restated thresholds before any leg starts**, or a leg will be measured against a
  number that was never there.
- **`migration-table.md` does not exist yet.** It is T003's, and AC-008 gates it. This change
  corrected the circular dependency that had T001 writing into T003's file, but it did not do T003's
  work.
- **No code changed**, so every threshold in `acceptance-criteria.md` except AC-010 remains `Unmet`,
  which is correct — T002's red-number census runs next.
- **Still-photograph limits apply throughout.** Nothing about motion, hover or focus is readable from
  these captures, and no such claim is made; `055` owns the motion set and read it from `anytype-ts`
  source rather than from images.
<!-- /ANCHOR:limitations -->
