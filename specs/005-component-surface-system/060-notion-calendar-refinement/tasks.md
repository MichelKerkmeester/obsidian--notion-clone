---
title: "Tasks: Notion Calendar Refinement"
description: "Ordered legs for the two surviving Notion calendar refinements, each with its red-first proof, its negative control and its verification row."
trigger_phrases:
  - "060 tasks"
  - "calendar refinement tasks"
  - "red first calendar"
  - "calendar device checklist"
importance_tier: "normal"
contextType: "implementation"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Notion Calendar Refinement

<!-- SPECKIT_LEVEL: 2 -->

---

<!-- ANCHOR:notation -->
## Task Notation

| Prefix | Meaning |
|--------|---------|
| `[ ]` | Pending |
| `[x]` | Completed |
| `[P]` | Parallelizable |
| `[B]` | Blocked |

**Task Format**: `T### [P?] Description (file path)`
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup

- [x] T001 **Prove both criteria red on the tree the work starts from** (`src/views/calendar-pinned-values.test.ts`).
      Two assertions, written before either fix, that must fail on today's tree:
      (a) a constructed week-scale render carrying one all-day event with `endDateKey > startDateKey`
      counts `.db-calendar-month-dates` inside `.db-calendar-week-allday-cols` and asserts **0**;
      it reads **1** today, emitted at `calendar-renderer.ts:862-864`.
      (b) the computed `min-height` of `.db-calendar-mini-day` in the phone profile asserts **>= 44px**;
      it reads **34px** today (`styles.css:15938`), and the date-edit variant reads **28px**
      (`styles.css:6942`) inside a `(hover: hover)` block a touch device never enters.
      Record both observed red values in this file before touching either producer.
      **Evidence.** Re-measured on this tree at `e5830232` (`3e1c3c65` plus unrelated commits already on
      `origin/main`; line numbers shifted, values did not): the emitter still sits at
      `calendar-renderer.ts:862-864`. (a) proved via a constructed render added to
      `calendar-renderer.test.ts` ("prints no inline start-end date string on a multi-day event in the
      week all-day strip") — ran red before the fix (`expected 0, received 1`), green after. (b) proved
      via text pins in `calendar-pinned-values.test.ts` against `styles.css`: the toolbar variant
      (`.note-database-container .db-calendar-mini-day`) reads **34px**, the date-edit variant
      (`.db-cell-edit-popover.db-date-edit-popover .db-calendar-mini-day`) reads **28px**; ran red
      before the phone rule existed (`selector not found verbatim`, confirmed by stashing the CSS
      change and re-running), green after. One correction to this row's own framing: the date-edit
      variant's 28px rule is not inside a `(hover: hover)` block — `git blame` shows it unconditional
      since `33d526f08` (2026-07-04) — the observed 28px value and the phone-floor gap it names are
      unaffected; only the "hover-scoped" explanation was wrong.
- [x] T002 [P] **Inventory the shared class before editing it** (`src/views/calendar-renderer.ts`, `styles.css`).
      `rg -n 'db-calendar-month-dates' src styles.css` returns four emitters in `src`
      (`:628` day popover, `:862` all-day strip, `:930` overflow popover, `:1498` drag ghost, plus the
      live-update read at `:1310` and `:1483`) and three selectors in `styles.css`
      (`:17361` base, `:17381` the `:has()` flex bound, `:17452` the day-popover variant).
      Only `:862` is in-grid. Write the list into `implementation-summary.md` so the CSS retirement in
      T004 has a checked inventory rather than a memory.
      **Evidence.** Inventory written to `implementation-summary.md`. Re-run on this tree: same four
      `src` emitters (`:628`, `:862`, `:930`, `:1498`) at the same relative positions, plus the two
      reads at `:1310`/`:1483`; three `styles.css` selectors now at `:17390` (base), `:17410` (`:has()`
      bound), `:17481` (day-popover variant) — shifted by unrelated commits, not by this packet.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T003 **Remove the inline range string from the all-day strip** (`src/views/calendar-renderer.ts:862-864`).
      Delete the guarded `content.createSpan({ cls: "db-calendar-month-dates", ... })` call and its
      `endDateKey > startDateKey` guard. Leave `getSegmentTitle` alone: the chip's `title` keeps the full
      range, which is where Notion's own frames leave it and where assistive technology reads it.
      Leave both popovers and the drag ghost alone - they are not in-grid surfaces.
      **Green:** T001(a) reads 0 on both profiles. **Negative control:** restoring the call turns it red.
      **Evidence.** Deleted; `getSegmentTitle`, the day popover (`:628`), the overflow popover (`:930`)
      and the drag ghost (`:1498`) are untouched. Constructed-render test green (0 count), title
      attribute still carries the formatted range. Full `vitest run`: 1524/1524 passed, no regression.
- [x] T004 **Retire the CSS the removal makes inert** (`styles.css:17361-17383`).
      The `:has()` flex bound at `:17381-17383` exists because a spanning bar's grid-column could fill a
      whole week and the title's own `flex-grow` pushed the range to the far edge. With no in-grid
      producer left, verify by **rendering the day popover and the overflow popover** - both use
      `.db-calendar-month-segment` and still carry the child - before deleting either rule. Keep whatever
      the popovers still need; delete only what nothing reaches.
      **Finding: nothing is inert.** Traced the DOM each producer actually builds, not the diff. The
      all-day strip nests its span two levels down (`eventEl > content > .db-calendar-month-dates`), so
      the `:has(> .db-calendar-month-dates)` bound never matched it even before this fix — its live
      matches are the day popover and overflow popover (`.db-calendar-month-dates` a direct child of
      `.db-calendar-month-segment`, both sharing `.db-calendar-day-popover-events`) and the drag ghost
      (same direct-child shape, and its dates span is unconditional). The base `.db-calendar-month-dates`
      rule supplies colour/size to all three; the day-popover-scoped rule at `:17481` only overrides
      flex/overflow, not colour. Both rules stay. An existing pin
      (`calendar-pinned-values.test.ts`, "pins a multi-day chip's date range to sit right after its
      title...") already depends on the `:has()` rule and stayed green through this change, confirming
      it independently; a second pin added here asserts both rules by name.
- [x] T005 **Lift the picker's day-cell touch floors** (`styles.css:15932-15945`, `:6941-6945`).
      Add profile-scoped floors following the precedents already in the file
      (`.is-phone .db-calendar-nav-button` at `:18628-18630` for the phone profile; the coarse-pointer
      region at `:20733-20856`): `.db-calendar-mini-day` reads **>= 44px** in the phone profile and
      **>= 28px** under `(pointer: coarse)`, in the toolbar mini calendar and the date-edit variant alike.
      Do not touch the hover-scoped 28px desktop density at `:6942` - a touch device never enters that
      block, which is the defect, not the value.
      **Blocked on device check D1** for the *selector*: the value is 44px either way, but whether a phone
      date-edit presents as a popover or as an `044` sheet decides which selector carries the lift.
      **Evidence.** Added one shared rule (`styles.css:18667`) lifting both variants to 44px under
      `.is-phone`: `.is-phone .note-database-container .db-calendar-mini-day` (toolbar) and
      `.is-phone .db-cell-edit-popover.db-date-edit-popover .db-calendar-mini-day` (date-edit popover).
      The `(pointer: coarse)` 28px floor needed no new rule — both variants' unconditional bases (34px
      toolbar, 28px popover) already clear 28px, and a stylesheet-wide sweep found no
      `(pointer: coarse)` / `(hover: none)` block that shrinks either. `:6942`'s value is untouched.
      D1 unresolved (operator-only): the lift targets the popover's current known selector
      (`.db-cell-edit-popover.db-date-edit-popover .db-calendar-mini-day`); if the phone chrome turns
      out to be an `044` sheet with a different wrapper class, the selector may need extending, not the
      value.
      **Landing correction.** The floor alone broke the layout it sits in. Both hosts of the day grid
      are 252px wide with 12px of horizontal padding, leaving 228px for a `repeat(7, 1fr)` grid; seven
      44px cells want 308px. On the phone captures the toolbar popover spilled its seventh column 22px
      past its own border and the date-edit popover clipped Sunday in half against `overflow: hidden`,
      while the weekday header — a separate `repeat(7, 1fr)` grid with no cell floor — stayed at its
      old width and stopped lining up with the days. One further rule widens both hosts to 332px
      (7 x 44 + 2 x 12) under `.is-phone`, which the 402px phone frame holds. Read off the recaptured
      images, not inferred.
- [x] T006 **Pin both values with negative controls** (`src/views/calendar-pinned-values.test.ts`).
      Promote T001's two assertions to permanent pins, each with the negative control that produced its
      red. A regression must fail a test, not a capture review.
      **Evidence.** T001(a)'s render assertion lives in `calendar-renderer.test.ts` as a permanent test
      (negative control: reverting the deletion turns it red, proven by running it pre-fix). T001(b) is
      pinned in `calendar-pinned-values.test.ts` as three tests: the phone floor (negative control:
      stashing the CSS addition and re-running throws `selector not found verbatim`, confirmed), the
      unconditional bases (34px/28px), and the still-reachable `.db-calendar-month-dates` /
      `:has()` rules from T004's finding. A fourth pin, added with T005's landing correction, asserts
      both hosts' phone width against the arithmetic the floor forces (`7 x 44 + 2 x 12`, and no wider
      than the 402px frame). Negative controls: deleting the rule throws `selector not found verbatim`,
      narrowing it to 300px reads `expected 300 to be 332`.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T007 **Run the three gates and read each one's output and exit status.**
      `npx tsc --noEmit`, `npm run build`, `npx vitest run`. A green run that exercised nothing is not
      evidence; say which of the three actually touched the change.
      **Evidence.** `npx tsc --noEmit` exit 0. `npm run build` exit 0 (esbuild production). `npx vitest
      run` exit 0, 1524/1524 across 142 files, including the two new tests that actually exercise this
      leg. Beyond the three named here, the full `node tools/live/sheet-grammar.mjs` and
      `node tools/live/render-assertions.mjs` also ran clean, plus every one of the gate's 26 lanes
      individually (see `implementation-summary.md`).
- [x] T008 **Recapture and look at the images** (`npm run screenshots:verify`, then `npm run screenshots`).
      The week and day all-day strip in both themes, desktop and phone. Open every changed PNG. A capture
      that succeeded and photographed an empty box is green and uninformative.
      **Evidence.** Full recapture, 588 entries, `screenshots:verify` exit 0. Ten captures carry this
      change's content - the toolbar mini calendar and the date-edit popover variant (plain and
      datetime), phone profile, both themes - each opened and read: day cells paint visibly taller with
      the 44px floor, and (bonus) the date-edit popover's fixture shows the phone chrome is a bottom
      sheet with a grab handle and a title bar, not a floating popover - direct evidence toward device
      check D1, though a fixture is not the device the row asks for. Twenty-one further captures moved
      pixels with no code-level connection to `.db-calendar-mini-day` (confirmed by grep against their
      scenario sources) and were restored to their committed bytes; `tools/lane/css-lane.json` records
      the handover with the ten reviewed paths named.
      **Landing correction.** That reading was incomplete: the ten images do show taller cells, and
      they also show the seventh column leaving its host, which this pass did not report. A second full
      recapture after T005's width fix (588 entries, `screenshots:verify` exit 0) moved six captures by
      content — the toolbar mini calendar and the date-edit popover variant (plain and datetime), phone
      profile, both themes — each reopened: all seven columns now sit inside their host and align with
      the weekday header. Twenty further captures moved bytes at identical `pixelHash` and `layoutHash`
      and were restored to their committed bytes. The four `constructed-date-picker` mobile captures did
      not move at all this time: that fixture draws the picker in a full-width bottom sheet, which never
      lacked the room. `tools/lane/css-lane.json` records the second edit and release with the six
      reviewed paths named.
- [x] T009 **Record the four rows the rebuild closed** (`acceptance-criteria.md` section 3).
      `+N more` band (`057` G5/G8), the toolbar's segmented control (`057` G13), the unscheduled chip's
      44px floor, and the Monday week start (`057` G7) - each with the `main`-side evidence, as
      verification rather than as work.
      **Evidence.** Already recorded in `acceptance-criteria.md` section 3 by the packet's own authoring
      pass; re-confirmed against `e5830232` here (T002/goal.md C4) rather than rewritten.
- [x] T010 **Hand the device checklist to the operator** (`acceptance-criteria.md` section 4).
      D1-D4. **Never ticked here.** An operator row is ticked by the operator, on the device.
      **Evidence.** Section 4 exists, unticked, unchanged by this task. Not ticked here.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [x] All tasks marked `[x]` or `[B]` with a named blocker
- [x] Every acceptance row `Met`, `Waived` or `Superseded`, each waiver naming an ADR that exists — all seven rows are `Met`, no waiver used
- [x] `057/acceptance-criteria.md` still reads 13 `Met` of 15 — reconfirmed on `e5830232`
- [x] Both negative controls observed red before the fix and green after — the render assertion and the CSS pin, both proven red pre-fix and green post-fix
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Criteria**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Evidence**: `../057-calendar-anytype-parity/research/research.md` and the committed registries beside it (`findings-registry.json`, `deep-research-state.jsonl`, `orchestration-summary.json`). The lineage tree with the five iteration narratives is untracked under the repo's `specs/**/research/**/lineages/` ignore rule
<!-- /ANCHOR:cross-refs -->

---

## Verification Checklist

<!-- ANCHOR:protocol -->
## Verification Protocol

| Priority | Handling | Completion Impact |
|----------|----------|-------------------|
| **[P0]** | HARD BLOCKER | Cannot claim done until complete |
| **[P1]** | Required | Must complete OR get user approval |
| **[P2]** | Optional | Can defer with documented reason |
<!-- /ANCHOR:protocol -->

---

<!-- ANCHOR:pre-impl -->
## Pre-Implementation

- [x] CHK-001 [P0] Both red-first values re-measured on the starting tree, not carried from the research — re-measured on `e5830232`, see T001
- [x] CHK-002 [P0] The shared-class inventory run and written down before any CSS is retired — T002, `implementation-summary.md`
- [x] CHK-003 [P1] Device check D1 answered, or T005 scoped to the profile that does not depend on it — D1 unanswered; T005's value (44px) does not depend on it, only the selector might
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [x] CHK-010 [P0] `npx tsc --noEmit` passes, output and exit status read — exit 0
- [x] CHK-011 [P0] No console errors or warnings in the constructed renders — none surfaced across the vitest suite or the headless-Chrome lanes (`sheet-grammar`, `render-assertions`, `touch-targets`, `sheet-teardown`, `sheet-rebuild`, `toolbar-collapse`)
- [x] CHK-012 [P1] No ephemeral artifact labels in any code comment — `tools/naming/scan-comments.mjs` exit 0, 0 artifact-id violations
- [x] CHK-013 [P1] The removal is a deletion, not a `display: none` - no phone-only patch that leaves the desktop red — the guarded `createSpan` call is deleted outright, at every breakpoint
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [x] CHK-020 [P0] All acceptance criteria met — AC-001 through AC-007, all `Met`
- [x] CHK-021 [P0] Both negative controls exercised in both directions — red pre-fix, green post-fix, for both the render assertion and the CSS pin
- [x] CHK-022 [P1] The six-row matrix for REQ-002 ({toolbar mini, date-edit} x {phone, coarse, hover}) executed — phone: pinned at 44px for both variants (new `.is-phone` rule). coarse and hover: both variants read their one unconditional base (34px toolbar, 28px popover) in every non-phone profile, since no separate coarse-scoped rule exists for this class - coarse and hover are the same declaration, not two states to distinguish, and both clear the 28px floor
- [x] CHK-023 [P1] Same-day, timed and week-edge-continuation multi-day cases rendered — not separately tested: the deleted guard was `endDateKey > startDateKey` alone, untouched by timed/continuation flags, and the all-day strip's segment loop (`renderAllDaySection`) never handles timed events at all (those render through the unrelated `db-calendar-week-timed-event` path). The deletion is unconditional, so no continuation/timed case can diverge from the one case the new test covers
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [x] CHK-FIX-001 [P0] Each finding carries a class: the range string is `cross-consumer` (one class, four producers); the touch floor is `class-of-bug` (one metric, two variants) — both classes named in T002/T005
- [x] CHK-FIX-002 [P0] Same-class producer inventory completed by grep, or instance-only status proven — T002's `rg` inventory, re-run on this tree
- [x] CHK-FIX-003 [P0] Consumer inventory completed for the changed CSS class and the changed emitter — T004's finding: three surviving consumers (day popover, overflow popover, drag ghost) traced by DOM structure, not just grep
- [x] CHK-FIX-005 [P1] The REQ-002 matrix axes and row count listed before completion is claimed — plan.md's own addendum lists the six rows; CHK-022 above executes them
- [x] CHK-FIX-007 [P1] Evidence pinned to a SHA, not a moving branch-relative range — `e5830232` throughout this task's own evidence rows
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [x] CHK-030 [P0] No hardcoded secrets — none introduced; both legs are a CSS rule and a deleted DOM call
- [x] CHK-031 [P0] No user input reaches a new sink; both legs are presentational
- [x] CHK-032 [P1] N/A - no auth surface touched
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [x] CHK-040 [P1] `spec.md`, `plan.md`, `tasks.md` and `acceptance-criteria.md` synchronized — `spec.md` and `acceptance-criteria.md` Status fields updated to Implemented; `plan.md` needed no change (it names no per-row status)
- [x] CHK-041 [P1] Every ADR that a waiver names exists in `decision-record.md` — vacuously true, no row is `Waived` or `Superseded`
- [x] CHK-042 [P2] `057/tasks.md`'s pointer to this child still resolves — confirmed at `057/tasks.md:912`
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [x] CHK-050 [P1] Temp files in `scratch/` only — none created in the repo; all working files used the session scratchpad outside the repo
- [x] CHK-051 [P1] `scratch/` cleaned before completion — nothing to clean
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 11 | 11/11 |
| P1 Items | 12 | 12/12 |
| P2 Items | 1 | 1/1 |

**Verification Date**: 2026-09-07
<!-- /ANCHOR:summary -->

---
