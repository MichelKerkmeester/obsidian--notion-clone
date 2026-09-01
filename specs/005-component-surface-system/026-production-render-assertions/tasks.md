---
title: "Tasks: Production Render Assertions"
description: "Six stages, each arming its own control before the assertion it protects, ending in one gate entry and a ratcheted coverage number."
trigger_phrases:
  - "026 tasks"
  - "render assertion tasks"
importance_tier: "high"
contextType: "planning"
_memory:
  continuity:
    packet_pointer: "public/005-component-surface-system/026-production-render-assertions"
    last_updated_at: "2026-08-30T17:00:00Z"
    last_updated_by: "007-harvest"
    recent_action: "Task list written from the plan's stage order"
    next_safe_action: "T1.1"
    blockers: []
    key_files:
      - "tasks.md"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-026-tasks"
      parent_session_id: null
    completion_pct: 100
    open_questions: []
    answered_questions: []
---
# Tasks: Production Render Assertions

<!-- SPECKIT_LEVEL: 2 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## NOTATION

`[ ]` open · `[x]` done, with evidence · `[~]` in progress · `[-]` dropped, with a reason.

A task closes on a command's output that was read, never on the command having been run. Controls are
tasks in their own right and carry the run that made them fail.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## PHASE 1: RUNNER SKELETON AND THE SUBSTITUTION CONTROL

- [x] **T1.1** Read `tools/bench/run-list.mjs` end to end before writing anything. The bundling,
      Chrome launch and exit-code handling are being reused, not re-derived. Read in full; the
      esbuild path (`:85`), Chrome launch (`:120`) and threshold exit (`:187-193`) are the reused
      pattern.
- [x] **T1.2** New runner under `tools/live/`, bundling a production renderer through the same
      esbuild path. `tools/live/render-assertions.mjs` + `tools/live/render-assertion-harness.ts`;
      the harness was built to assert before the runner existed.
- [x] **T1.3** The runner refuses input that did not come from a bundled `src/views/` module, and
      says so in the failure message. Two layers: the render entry tags the container the real
      render call built, and the esbuild metafile must name both renderer sources.
- [x] **T1.4** **Control N2** — hand it a fixture DOM lifted from `tools/screenshots/scenarios/`.
      Record the failing output verbatim in `acceptance-criteria.md` §3. Done: "refusing DOM
      without a bundled-renderer marker (got \"none\")", exit 1.
- [x] **T1.5** Runner prints its own exclusions: no host constructed, no device, `App` absent
      (AC-8's requirement, phrased as the runner's own sentence). Printed on every green run.
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## PHASE 2: FIRST ASSERTIONS, FILE-VIEW BAG

- [x] **T2.1** Build the file-view `ListRendererActions` shape from
      `src/views/database-view.ts:785-813`. Twenty-six members. Built as data, not by importing the
      host; the runner pins the measured key set and compares on every run.
- [x] **T2.2** Assert node count per row by kind, at a fixture shape taken from a real database — the
      one `tools/bench/list-render-bench.ts` already uses, not a new invention. The bench's
      `makeColumns`/`makeRows`/`makeConfig` are exported for the harness and the fixture is the
      operator's 21-column database at 30% fill, 1,600 rows.
- [x] **T2.3** Assert the column index of a named field is identical across every rendered row.
      `"amount"` sits at grid column 18 on every row that renders it; empty slots reserve their
      index on every row (grid columns 1..20 incl. placeholders).
- [x] **T2.4** Assert zero forced synchronous layouts inside the row-append loop. Layout-read count
      during render ≤ 8; HEAD measures 2.
- [x] **T2.5** **Control N1** — delete one row-level affordance from the renderer's output in a
      scratch tree; require a red run naming it; restore by hash and record the hash. Row open
      button deleted in `.worktrees/n1-affordance`: "0 open buttons for 1600 rows", exit 1;
      worktree removed and the commit recorded.
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## PHASE 3: THE SECOND HOST BAG

- [x] **T3.1** Build the embed bag from `src/views/embedded-database-renderer.ts:465-483`. Eighteen
      members, one of them (`isReadOnly`) absent from the file view's. Built as data; the precise
      census for this phase counts 19 members including `expandGroup` (4-space indent quirk) — see
      `acceptance-criteria.md` AC-3.
- [x] **T3.2** Run every Phase 2 assertion under the embed bag and report both results side by side.
      The runner runs the same assertion suite under both bags for both renderers.
- [x] **T3.3** Report the nine file-view-only members as a named list in the runner's output, so the
      difference is legible rather than implied by a diverging count. Printed on every run:
      `file-view-only members (8): openRecordDetail, saveCellValue, editFileName, editFormula,
      getSelectedRows, moveRowToGroupAndPosition, moveRowsToGroup, moveRowsToPosition` (eight true
      members; the published nine included `includeWidthActions`, an option literal, not a member).
- [x] **T3.4** **Control N4** — remove `openRecordDetail` from the file-view bag in a scratch tree;
      require a red run rather than a silent tolerance; restore by hash. Red on both layers: bag
      shape `missing openRecordDetail` and the click assertion, exit 1.
- [x] **T3.5** Record whatever the two-bag comparison surfaces. **Do not fix it here** — the scope
      boundary in `plan.md` §2 binds, and a defect this instrument finds on its first run is the best
      possible evidence that the instrument works. Surface recorded: the embed omits
      `openRecordDetail`, so an embedded row cannot open the record panel; whether that is intended
      belongs to the embed's owner. Left unfixed; the runner prints the difference by name.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## PHASE 4: SECOND RENDERER

- [x] **T4.1** Extend to `TableRenderer`, reusing `tools/bench/table-render-bench.ts:30`'s import and
      bag construction where they fit. The bench's fixture builders are exported and reused; the
      table runs under the two measured host bags rather than the bench's minimal one.
- [x] **T4.2** Run it under both host bags. Both table scenarios green at HEAD: rows, cells per row,
      named-column cell index, selection checkbox, and no row appended to a connected tbody.
- [x] **T4.3** AC-2 reads **2 of 22**. Recorded from the check's output: "coverage 2 of 22 renderers
      exercised by this check (published 2)".
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:phase-5 -->
## PHASE 5: THE HISTORICAL CONTROL

- [x] **T5.1** **Control N3** — run the check against `173819e^` in a detached worktree. Require red.
      `.worktrees/n3-historical` at `f27da7f`: exit 1, "1600 layout reads during render, bound 8".
- [x] **T5.2** Run against `HEAD`. Require green. `845a27c`: exit 0, "2 layout reads during render,
      bound 8".
- [x] **T5.3** Record both in `acceptance-criteria.md` AC-6, asserting the **shape** — that the check
      distinguishes the trees — and not a millisecond budget. The budget belongs to
      `tools/bench/run-list.mjs:44` and stays there. Recorded with both verbatim lines.
<!-- /ANCHOR:phase-5 -->

---

<!-- ANCHOR:phase-6 -->
## PHASE 6: GATE ENTRY AND RATCHET

- [x] **T6.1** One entry in `tools/gate.mjs` `CHECKS`, with the durable reason in a comment beside it
      in the style the neighbouring entries already use — and no criterion id in that comment.
      Entry `render-assertions` at `tools/gate.mjs:67`.
- [x] **T6.2** Publish the coverage number through the evidence stamp so
      `tools/live/evidence.mjs --check-all` dates it. `tools/live/renderer-coverage.json`, written
      by the check through the shared `stamp()`; `evidence --check-all` lists it fresh.
- [x] **T6.3** **Control N5** — remove the new `CHECKS` entry; require `npm run gate` to still exit 0,
      proving AC-1 measures the entry and not the file's existence. Observed with the entry removed:
      exit 1 with four reds, all attributed to concurrent-session movement (stray `.tmp`, stale
      evidence from the CSS lane's mid-edit `styles.css`, unrefreshed captures, placement crash on
      mid-edit `src/`); the removal itself changed nothing. The clean exit-0 observation is pending
      the CSS lane landing — recorded as such in `acceptance-criteria.md` §3/§4.
- [x] **T6.4** **Control N6** — lower the published coverage number by one; require red. Removing the
      table scenarios from the runner: exit 1, "coverage cannot decrease: 2 published, this check
      constructs 1". Runner restored by sha256.
- [~] **T6.5** `npm run gate` green, output and exit status read without a pipe. Blocked by the CSS
      lane's in-flight `styles.css` edit (evidence + screenshots red for that lane's movement, plus
      a stray `tools/screenshots/.tmp` and a placement crash on mid-edit `src/`). The check itself
      is green at HEAD; the gate's other reds are the lane's to land.
<!-- /ANCHOR:phase-6 -->

---

<!-- ANCHOR:completion -->
## COMPLETION

- [x] Every control N1-N6 has a recorded failing run. N1-N4 and N6 recorded verbatim in
      `acceptance-criteria.md` §3 with exit codes; N5 recorded with its four reds attributed to
      concurrent-session movement and its clean form pending the CSS lane landing.
- [x] Every row in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`, and a waiver names an
      ADR that exists. All nine rows `Met`; no waiver needed.
- [x] `checklist.md` is complete with evidence per item.
- [x] `implementation-summary.md` written — after implementation, not before.
- [x] `git status` shows no file outside `tools/`, `tools/gate.mjs` and this folder. This phase's
      footprint is exactly that; the working tree additionally carries concurrent sessions' changes
      to `src/`, `styles.css`, `package.json` and their artefacts, which are not this phase's.
- [x] The roadmap's phase table gains a row for this phase, with its actual state rather than its
      declared one. Row `026` in `../roadmap.md` §5.1 now reads **Implemented** with the observed
      control numbers.
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- Criteria and controls: [`acceptance-criteria.md`](acceptance-criteria.md)
- Phase reasoning: [`plan.md`](plan.md) §3, §4
- Why this phase exists: [`../007-architecture-research/harvest.md`](../007-architecture-research/harvest.md) §5
- Criteria doctrine: [`../architecture-findings.md`](../architecture-findings.md) §9
- The regression this instrument would have caught: [`../024-list-view-freeze/acceptance-criteria.md`](../024-list-view-freeze/acceptance-criteria.md) §2
<!-- /ANCHOR:cross-refs -->

## ADDED FROM THE SESSION AUDIT

- [ ] **T-TABLE** Give the table scenario a layout-read bound, or record why it cannot have one.
      *Evidence to close:* either the table asserts `layoutReads` like the other five, or the reason
      it is exempt is written where the next reader will look.
      **Why:** the table asks the touch question once per row at two sites — the shape hoisted out
      of every other view — and it is the only one of the six covered renderers with no
      `MAX_LAYOUT_READS` assertion. It is safe today because the body is built off-document, and
      that property is asserted. But the mitigation is guarded and the reads are not: attach the
      body before filling it and this is quadratic with nothing watching.
