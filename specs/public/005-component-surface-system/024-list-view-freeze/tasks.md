---
title: "Tasks: List View Freeze"
description: "Retroactive task record for a shipped fix, closed only where implementation-summary.md and the code support it; operator device confirmation stays open."
trigger_phrases:
  - "024 tasks"
  - "list view freeze tasks"
importance_tier: "critical"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/024-list-view-freeze"
    last_updated_at: "2026-08-30T18:45:00Z"
    last_updated_by: "docs-remediation"
    recent_action: "Authored tasks.md retroactively; AC-6 kept open, not marked done"
    next_safe_action: "Operator confirms on device that the list view opens"
    blockers: []
    key_files:
      - "tasks.md"
      - "acceptance-criteria.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-024-tasks"
      parent_session_id: null
    completion_pct: 95
    open_questions: []
    answered_questions: []
---
# Tasks: List View Freeze

<!-- SPECKIT_LEVEL: 1 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete, with evidence · `[ ]` open · `[~]` in progress.

This is a retroactive record: the fix shipped in commit `31dce9aa` before
`plan.md`/`tasks.md` existed. A task below is closed only where
`implementation-summary.md` or the code itself is the evidence — nothing
here was re-run to produce a fresh number. Where a task cannot be
established from either source it is marked open and says so.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: MEASURE THE ROOT CAUSE

- [x] **T1.1** Build `tools/bench/list-render-bench.ts` + `tools/bench/run-list.mjs`,
      driving the real `ListRenderer` in headless Chrome, varied by row
      count, column count, fill rate and column type at desktop and phone
      widths. *Evidence:* both files listed as `Add` in `spec.md` Files to
      Change; present in commit `31dce9aa` diff (`list-render-bench.ts`
      +13/-x, `run-list.mjs` +49/-x).
- [x] **T1.2** Measure BEFORE / SHIPPED / FIXED trees at 400, 800 and 1,600
      rows. *Evidence:* `acceptance-criteria.md` AC-1 table — desktop 1,600
      rows: 6,777.0ms / 7,173.5ms / 84.5ms.
- [x] **T1.3** Identify the root cause: `isTouchDevice(container)` called
      per row via `getBoundingClientRect()`, forcing layout inside the
      row-append loop. *Evidence:* `spec.md` §2 "Root Cause".
- [x] **T1.4** Exonerate `c31acf5` as the freeze's cause; confirm it as a
      6%/28% amplifier via the field-element count (2,400 -> 8,000).
      *Evidence:* `spec.md` §2 "What The Suspected Commit Actually Did";
      `implementation-summary.md` §4 (wrapped under its `how-delivered`
      anchor).
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: HOIST THE TOUCH-MODE READ

- [x] **T2.1** Replace the per-row `isTouchDevice(this.container)` call with
      a `touchMode` field set once at the top of `render()` and
      `renderGrouped()`. *Evidence:* `src/views/list-renderer.ts:161` and
      `:184` — `this.touchMode = isTouchDevice(container);` — read directly
      from the current file.
- [x] **T2.2** Measure the isolated effect before the second change landed.
      *Evidence:* `implementation-summary.md` §1: "7,173.5ms -> 185.1ms at
      1,600 rows" desktop.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: SURFACE-CONDITIONAL PLACEHOLDER

- [x] **T3.1** `renderRowFieldPlaceholder` returns a bare
      `div.db-list-field.is-placeholder` instead of a fully rendered hidden
      field. *Evidence:* `implementation-summary.md` §1, second change;
      `acceptance-criteria.md` AC-4 — 3 DOM nodes per reservation down to 1,
      120,007 -> 75,207 total nodes at 1,600 rows.
- [x] **T3.2** Reservation predicate reads the field area's computed
      `display`, `column-gap` and measured width off the element, not
      `touchMode` or a `body.is-phone` class. Decided once, on the first
      built row. *Evidence:* `spec.md` frontmatter `answered_questions`;
      `src/views/list-renderer.ts` `reservesColumns` / `reservationDecided`
      fields confirmed present in the current file.
- [x] **T3.3** First attempt (keying on `body.is-phone`) measured breaking
      alignment in landscape; replaced with the element-based predicate.
      *Evidence:* `acceptance-criteria.md` AC-7 sweep table — `is-phone`
      reserves the worst property in up to 3 columns across twelve cards;
      the final predicate holds it at 1.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## PHASE 4: RENDERER-DRIVEN ALIGNMENT CHECK

- [x] **T4.1** Add `tools/storybook/verify-placement.mjs` section 5k,
      asserting against `ListRenderer`'s own output rather than the
      hand-written screenshot fixture. *Evidence:* `spec.md` Files to
      Change; commit `31dce9aa` diff includes `verify-placement.mjs`;
      `implementation-summary.md` §3.
- [x] **T4.2** Retire `column-width.test.ts`'s source-text pin on
      `field.addClass("is-placeholder")`; the renderer-driven check
      replaces it. *Evidence:* `implementation-summary.md` §3.
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## PHASE 5: REVIEW REMEDIATION

- [x] **T5.1** Budget asserts blocked main thread (render + forced layout),
      not render alone. *Evidence:* `implementation-summary.md` §5 — shown
      failing first with 5,000ms of injected layout (`PASS` before the
      fix, `FAIL` after); `acceptance-criteria.md` AC-8.
- [x] **T5.2** Scaling verdict refuses a single-row-count sample.
      *Evidence:* `implementation-summary.md` §5; `acceptance-criteria.md`
      AC-9 — "NO VERDICT — a slope needs two row counts and this run
      measured 1".
- [x] **T5.3** `spec.md` SC-001 restated on the blocked-main-thread number
      rather than render alone. *Evidence:* current `spec.md` §5 SC-001
      text, which records the correction explicitly. This edit is part of
      `spec.md`'s own uncommitted review-remediation pass, layered on top
      of commit `31dce9aa`.
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## PHASE 6: OPERATOR DEVICE CONFIRMATION — OPEN

- [ ] **T6.1** Operator confirms on device that the list view opens
      (REQ-006 / AC-6). *Status:* **NOT MET.** `acceptance-criteria.md`:
      "the report was a person unable to use the application." Not marked
      done — no evidence exists that this has happened, and
      `../028-remaining-freezes/` is investigating whether a second freeze
      cause remains on non-table views. This task cannot be closed by this
      documentation pass.
<!-- /ANCHOR:phase-6 -->

---

<!-- ANCHOR:completion -->
## COMPLETION

- [x] AC-1 through AC-5, AC-7, AC-8, AC-9 recorded `PASS` in
      `acceptance-criteria.md` (8 of 9 criteria).
- [ ] AC-6 recorded `NOT MET` in `acceptance-criteria.md`. This packet does
      **not** close while AC-6 is open; the fix to the row-loop freeze is
      shipped, but "the list view opens on device" is not yet confirmed.
- [x] `implementation-summary.md` written (already existed; this pass added
      its template marker, six anchors and a `_memory` continuity block —
      the prose is unchanged).
- [x] `plan.md` and `tasks.md` written — the two files `validate.sh
      --strict` reported missing (this pass).
- [x] No regression, re-run from the final state per
      `acceptance-criteria.md` §3: `npx vitest run` 444 passed unchanged;
      `verify-placement` 186/190 unchanged; `npm run gate` 14 green
      unchanged.
- [x] `git status` scoped to this phase's files
      (`src/views/list-renderer.ts`, `tools/bench/*`,
      `tools/storybook/verify-placement.mjs`, `package.json`) shows no
      pending change — the fix is committed at `31dce9aa`. `spec.md`
      itself carries a separate, uncommitted review-remediation edit on
      top of that commit.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- Criteria: [`acceptance-criteria.md`](acceptance-criteria.md)
- Phase reasoning: [`plan.md`](plan.md) §3, §4
- What shipped and why: [`implementation-summary.md`](implementation-summary.md)
- Durable goal and open items: [`goal.md`](goal.md)
- The remaining freeze this phase does not fix: `../028-remaining-freezes/`
<!-- /ANCHOR:cross-refs -->
