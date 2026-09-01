---
title: "Task Breakdown: Mobile Sheet Presentation"
description: "One task per requirement, each closed only with evidence that was read, not assumed."
trigger_phrases:
  - "003 mobile sheet tasks"
importance_tier: "critical"
contextType: "planning"
---
# Task Breakdown: Mobile Sheet Presentation

<!-- SPECKIT_LEVEL: 3 -->
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->

---

<!-- ANCHOR:notation -->
## TASK NOTATION

`[x]` complete · `[~]` in progress · `[ ]` not started · `[B]` blocked.

**No task closes on "looks right".** Each task's evidence must name a number that was read or a
command whose output and exit status were read. The research gate is standing: if a criterion fails
twice without a new hypothesis, read AnyType and AppFlowy under `external/` for behaviour only —
never code, CSS values or token scales.

<!-- /ANCHOR:notation -->
---

<!-- ANCHOR:phase-1 -->
## PHASE 1: SETUP [Honest phone harness]

Stage 1 is a gate, not a task. Until removing the navbar from the harness moves an asserted number by
more than the 1.35px fallback artefact, no later claim in this spec means anything.

- [ ] **T1** Add `.mobile-navbar` and a real `--safe-area-inset-bottom` to the browser harness — REQ-008.
      *Evidence to close:* Removing the navbar moves an asserted number by more than the 1.35px fallback artefact
- [ ] **T2** Delete the hardcoded `--db-mobile-sheet-bottom: 0px` from `tools/screenshots/runtime-vars.css:43` — REQ-008.
      *Evidence to close:* Captures reflect the computed offset; the pre-deletion capture and the post-deletion capture differ
- [ ] **T3** Drive the real positioner in the phone checks instead of `applySheetChrome` alone — REQ-008.
      *Evidence to close:* Editing the bounds branch changes an assertion; today it changes nothing
- [ ] **T4** Prove each phone check can fail — REQ-008.
      *Evidence to close:* Per check: subject deleted from the harness DOM, asserted number moved

<!-- /ANCHOR:phase-1 -->
---

<!-- ANCHOR:phase-2 -->
## PHASE 2: IMPLEMENTATION

### Stage 2 — runtime census

- [ ] **T5** Open every positioner sheet on a phone profile; log portal parent, computed `bottom`, rect — REQ-007.
      *Evidence to close:* Row per sheet, each with a measured `bottom`
- [ ] **T6** Open all 20 `DbModal` subclasses on a phone profile and record which actually present as sheets — REQ-007.
      *Evidence to close:* Row per subclass; the 2 that inherit `"sheet"` from the constructor default at `db-modal.ts:56` named explicitly alongside the 18 that pass one
- [ ] **T7** Record what the 3 `FuzzySuggestModal` subclasses do — REQ-007.
      *Evidence to close:* `main.ts:2947`, `image-file-suggest-modal.ts:22`, `markdown-file-suggest-modal.ts:16` each classified: sheet, not-a-sheet, or out of scope with a reason
- [ ] **T8** For every surface, record whether the node **and its anchor** survive a field commit — REQ-005.
      *Evidence to close:* Two booleans per surface; the calendar and timeline rows must show node alive, anchor dead
- [ ] **T9** Record the current bottom bound of non-sheet anchored popovers on a phone — REQ-002.
      *Evidence to close:* Blast radius of deleting the `is-phone` branch expressed as a number per popover
- [ ] **T10** Diff the runtime log against the static list — REQ-007.
      *Evidence to close:* Named list of sheet-capable surfaces static analysis missed

### Stage 3 — one predicate

- [ ] **T11** Replace `isTouchDevice()` and `isMobileBottomSheet()` with one exported predicate — REQ-003.
      *Evidence to close:* Both old symbols have zero callers; the new one has one threshold
- [ ] **T12** Record which surfaces change classification between 601px and 760px — REQ-003.
      *Evidence to close:* Named list with the before and after answer at each width

### Stage 4 — contract, portal, scrim

- [ ] **T13** Define the presentation contract: portal target, scrim, safe-area padding, keyboard behaviour — REQ-004.
      *Evidence to close:* A surface declaring `sheet` that does not reach the contract fails at build, not silently at `0px`
- [ ] **T14** Route `DbModal` and the positioner through the one contract — REQ-004.
      *Evidence to close:* `--db-mobile-sheet-bottom` has exactly one writer; today it is `popover-position.ts:115` and `DbModal` never writes it
- [ ] **T15** Portal phone sheets to `document.body` — REQ-001.
      *Evidence to close:* `elementFromPoint(centreX, navbarCentreY)` returns the sheet; today it returns `DIV.mobile-navbar` at `z-index: 9999`
- [ ] **T16** Delete the `is-phone` branch at `popover-position.ts:289-294`, and the `50` fallback at `:291` with it — REQ-002.
      *Evidence to close:* Branch absent from source; sheet bottom offset reads `0px`, not 49px
- [ ] **T17** Build the sheet scrim — REQ-006.
      *Evidence to close:* Scrim rect covers the full viewport including the navbar band; none exists today
- [ ] **T18** Confirm the portalled sheet is tokened — REQ-001.
      *Evidence to close:* `--db-radius-lg` resolves non-empty on the body-mounted node — this is `000`'s token root, verified here rather than assumed

### Stage 5 — anchor lifetime

- [ ] **T19** Decide between surgical `updateCellDOM` cases and identity-based anchor re-resolution — REQ-005.
      *Evidence to close:* Decision recorded with the census rows that justify it, **before** code is written
- [ ] **T20** Implement the chosen design — REQ-005.
      *Evidence to close:* After a field commit: node identity unchanged, top edge moved `0px`, a subsequent viewport resize still repositions
- [ ] **T21** Confirm the fix covers the keyboard on the *next* field, not only the first — REQ-005.
      *Evidence to close:* Two consecutive field commits, then a `visualViewport` reduction, still repositions

<!-- /ANCHOR:phase-2 -->
---

<!-- ANCHOR:phase-3 -->
## PHASE 3: VERIFICATION

Stage 6 — prove it where the user stands.

- [ ] **T22** Navbar hit test in `tools/storybook/verify-placement.mjs` — REQ-001.
      *Evidence to close:* `vitest` is `environment: "node"` with no jsdom, so the assertion lives here, not in a unit test
- [ ] **T23** Geometry assertion for both mechanisms — REQ-004.
      *Evidence to close:* One asserted number covering modal and anchored sheets; today they read 0px and 49px
- [ ] **T24** Keyboard assertion via a reduced `visualViewport` — REQ-004.
      *Evidence to close:* Focused field rect inside the visible rect
- [ ] **T25** Phone captures **with a navbar present** — REQ-008.
      *Evidence to close:* Capture set regenerated with the navbar in frame, and a human reviewed the changed PNGs
- [ ] **T26** Storybook sheet states at the production mount point — REQ-007.
      *Evidence to close:* Blocked on `000` unblocking `Platform` (`obsidian-stub.mjs:52-57`), `Modal` (`:90`) and `FuzzySuggestModal` (`:80`); a container-wrapped approximation does not close this
- [ ] **T27** Confirm on device that the sheet covers the navbar — REQ-001.
      *Evidence to close:* Operator observation. Gate passage alone does not close this spec

<!-- /ANCHOR:phase-3 -->
---

<!-- ANCHOR:completion -->
## COMPLETION CRITERIA

- Every requirement REQ-001 to REQ-008 met with cited evidence.
- Every criterion C1-C6 has both its failing and its passing number recorded.
- The negative controls N1-N6 in `checklist.md` hold.
- The anchor-lifetime fix in REQ-005 has landed in one of its two forms.
- Gates green from the final state, each exit status read without a pipe.
- **The operator has confirmed on a phone that the sheet covers the bottom navigation bar.**

<!-- /ANCHOR:completion -->
---

<!-- ANCHOR:cross-refs -->
## CROSS-REFERENCES

- [`spec.md`](spec.md) · [`plan.md`](plan.md) · [`checklist.md`](checklist.md) · [`acceptance-criteria.md`](acceptance-criteria.md)
- [`../spec.md`](../spec.md) · [`../architecture-findings.md`](../architecture-findings.md)

<!-- /ANCHOR:cross-refs -->
