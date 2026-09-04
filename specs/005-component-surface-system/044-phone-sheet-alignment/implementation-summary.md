---
title: "Implementation Summary: Phone Sheet Alignment"
description: "Every phone sheet and dropdown instance this phase owns now shares one bottom-sheet grammar, proved by a lane with a working negative control. AC-006 (the operator's own device report) is the one row this repository cannot close."
trigger_phrases:
  - "implementation summary"
  - "what shipped"
  - "validation evidence"
  - "044 implementation summary"
importance_tier: "normal"
contextType: "general"
_memory:
  continuity:
    packet_pointer: "005-component-surface-system/044-phone-sheet-alignment"
    last_updated_at: "2026-09-05T01:35:00Z"
    last_updated_by: "code-agent"
    recent_action: "Landed the shared sheet grammar and its gate lane"
    next_safe_action: "Seek the operator's device report for AC-006"
    blockers:
      - "AC-006 is operator-only; nothing in this repository can close it"
      - "tasks.md T014 (roadmap.md/spec.md after-numbers) is out of this leg's dispatched scope"
    key_files:
      - "src/views/mobile-bottom-sheet.ts"
      - "src/views/sheet-grammar.ts"
      - "tools/live/sheet-grammar.mjs"
      - "src/views/toolbar-renderer.ts"
      - "src/views/view-config-panel-renderer.ts"
      - "styles.css"
    session_dedup:
      fingerprint: "sha256:0000000000000000000000000000000000000000000000000000000000000000"
      session_id: "surface-system-044-summary"
      parent_session_id: null
    completion_pct: 90
    open_questions: []
    answered_questions: []
---
<!-- SPECKIT_TEMPLATE_SOURCE: impl-summary-core | v2.2 -->
# Implementation Summary

<!-- SPECKIT_LEVEL: 2 -->
<!-- HVR_REFERENCE: .opencode/skills/sk-doc/sk-create-with-human-voice/references/hvr-rules.md -->

---

<!-- ANCHOR:metadata -->
## Metadata

| Field | Value |
|-------|-------|
| **Spec Folder** | 044-phone-sheet-alignment |
| **Completed** | Not complete — AC-006 (operator device report) and tasks.md T014 remain open |
| **Level** | 2 |
<!-- /ANCHOR:metadata -->

---

<!-- ANCHOR:what-built -->
## What Was Built

Every phone sheet this phase owns now speaks one grammar — surface, handle with drag-to-close,
header with title and a shared 44px close, padded rows, dropdowns via the shared dropdown, segmented
choices, keyboard avoidance — checked structurally by `src/views/sheet-grammar.ts`'s seven predicates
and proved live by `tools/live/sheet-grammar.mjs`, registered in `npm run gate`.

The three operator reports (40, 41, 43) landed across four legs that converged onto this shared
contract rather than three independent fixes: `worktrees/039-column-width-sheet` (report 40/40b),
`worktrees/040-settings-sheet` (report 41), and this leg's own work on the Add view sheet (report
43), the shared header/close builder, and the lane itself. A fourth, unrelated leg
(`specs/006-list-view-deprecation`) closed AC-007 by withdrawing List from the picker while this
phase landed; the two withdrawals (List, in `006`; the shared grammar, here) were rebased onto each
other and reconciled as identical fixes to the same two files (the add-view fixture, verify-placement's
row-count floor), not a conflict.

### Grammar registry

`tools/live/sheet-grammar.mjs`'s `REGISTERED_SURFACES`: **sort-panel, filter-panel, add-view,
record-detail, record-peek, column-width** — 6 surfaces × 7 elements, all green, plus the Add view
picker's List-row absence and a negative control (remove the grab handle from sort-panel, require
that row alone to go red, require a clean re-mount to restore green). **settings/view-config is not
registered**: its header and close conform (measured green), but its body still draws rows through
its own long-standing `.db-view-config-row` class rather than `.db-panel-row`, and its computed-field
sync control is a native `input[type="radio"]` group rather than a segmented control — both pre-date
this phase and are not this leg's rows/segmented gap to close. Measured red on `rows` and `segmented`
when tested; left unregistered rather than papered over.

### A real regression found and fixed

Verifying `attachSheetChromeToModal` (the new helper wearing sheet chrome on the three
`FuzzySuggestModal` hosts) reproduced the exact freeze `98da630d` fixed on 2026-09-02 for
`DbModal.onClose`: its returned teardown only unbound the drag listeners and never called
`applySheetChrome(modalEl, false)`, so the host's own `close()` detached a container that no longer
held the portalled modal element, orphaning it with the backdrop pinned over the whole app for the
rest of the session. Proved red by reverting the fix and running `tools/live/sheet-teardown.mjs`
(`FAIL — 1 backdrop(s) and 1 sheet(s) left after the host wrapper was removed`), fixed by mirroring
`DbModal.onClose`'s own order, and locked in with a permanent regression case,
`runAttachSheetChromeToModalDetachedHostCase`.

### Two CSS gaps `verify-placement.mjs` caught, not inspection

1. `.db-add-view-form > .db-panel-row`'s own `margin-bottom`/`padding` double-counted the form's own
   grid `gap`/`padding` — failing the 2x group-gap ratio (22px vs 14px, wanted ≥28) and the
   shared-left-edge check (2px drift). Zeroed both in that context.
2. `.db-panel-header:has(.db-sheet-close)` sits 25px below the grab handle, inside the shared drag
   band's 40px reach (tuned for the owned menu). A real hit-test found the band answering a press on
   add-view's close button as a press on the handle. Given the header 20px more top margin rather
   than shrinking the band, which would have detuned it for the surface it was calibrated against.
   The margin also reaches the settings sheet (same `db-sheet-close` class, for grammar conformance)
   — its mobile capture moved a few px of top spacing as a result, read directly and unbroken.

### A pre-existing bug found and fixed in an unrelated leg's landing

`tools/screenshots/manifest-schema.mjs`'s `captureRootFor()` checked `scenario.source` instead of
`scenario.kind` — `source` is a field `capture.mjs` only attaches to the *finished* manifest entry,
so the raw-scenario check always read `undefined` and nested every capture, including the sixteen
`project-manager` reference screenshots, under `notion-clone/`. Caught when a full capture run's own
manifest-schema validation refused to write the wrong path; fixed, with regression coverage added in
`constructed-capture.test.mjs`.

### Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `src/views/mobile-bottom-sheet.ts` | Modified | `createSheetHeader` (title + shared `db-sheet-close`), `SHEET_KEYBOARD_INSET_VAR`, `attachSheetChromeToModal` (fixed to take chrome down on close) |
| `src/views/sheet-grammar.ts` | Added | The seven grammar predicates, `describeSheetGrammar` |
| `tools/live/sheet-grammar.mjs` | Added | The gate lane: 6 surfaces × 7 elements, List-row absence, negative control |
| `src/views/sort-panel-renderer.ts`, `filter-panel-renderer.ts` | Modified | Adopted `createSheetHeader` |
| `src/views/toolbar-renderer.ts` | Modified | Add view sheet rebuilt onto the shared grammar: `createSheetHeader`, `db-panel-row` fields, `createDropdownField` replacing the native select, `db-checkbox` toggle row, `createMenuRow` chevrons; the now-redundant call-site List filter removed once `006-list-view-deprecation` moved the withdrawal into `getViewTypeOptions()` itself |
| `src/views/view-config-panel-renderer.ts` | Modified | `db-sheet-close` added alongside the settings leg's own `db-view-config-close`, additively, for grammar conformance — its own header/body/scroll-host architecture (040's T007) kept as shipped |
| `src/views/table-record-peek.ts`, `database-view.ts` | Modified | `openRecordDetail` hand-off: touch routes the peek to the record sheet instead of the desktop rail |
| `src/views/calendar-timeline-renderer.ts`, `menu-row.ts` | Modified | Gantt "depends elsewhere" chip moved to the owned menu (sheet chrome on phone); `createMenuRow`'s non-submenu `chevron` option |
| `src/main.ts`, `image-file-suggest-modal.ts`, `markdown-file-suggest-modal.ts` | Modified | `attachSheetChromeToModal` adopted on the three `FuzzySuggestModal` hosts |
| `src/views/modals/group-order-modal.ts` | Deleted | Dead code — zero callers even before this phase, confirmed by `rg` before removal |
| `styles.css` | Modified | `.db-sheet-close` (44×44), `.db-add-view-key-field`, `.db-panel-header-actions` grouping (scoped to a direct child of `.db-panel-header` after an unscoped first pass broke the cell-editor's unrelated "Clear" row), the add-view group-spacing fix, the grab-band header-margin fix |
| `tools/screenshots/scenarios/core.mjs`, `panels.mjs` | Modified | Add-view fixture rebuilt to match the real renderer; `panel-record-peek` scoped to desktop only (mobile now shows the record sheet, a different scenario) |
| `tools/screenshots/manifest-schema.mjs` | Modified | Fixed `captureRootFor`'s `source`/`kind` bug |
| `src/views/add-view-popover-layout.test.ts`, `tools/screenshots/constructed-capture.test.mjs` | Modified | Fixture-contract coverage (List row, dropdown-not-select, header-close) and `captureRootFor` regression coverage |
| `tools/gate.mjs` | Modified | `sheet-grammar` registered (21 → 26 checks) |
| `tools/live/touch-targets-baseline.json`, `touch-targets-constructed-baseline.json` | Modified | Corrected to the measured 199/1220 (see Verification) |
| `tools/lane/css-lane.json` | Modified | Acquired, edited, released with all 30 changed captures named |
<!-- /ANCHOR:what-built -->

---

<!-- ANCHOR:how-delivered -->
## How It Was Delivered

The shared chrome landed in `src/views/mobile-bottom-sheet.ts` first (`createSheetHeader`,
`SHEET_KEYBOARD_INSET_VAR`), then sort, filter and add-view adopted it directly; the two
already-running legs (column-width, settings) converged onto the same seven-element contract from
their own worktrees, rebased onto this one three times as `037`/`038`/`039`/`040`/`042` and
`006-list-view-deprecation` landed on `main` in between. `tools/live/sheet-grammar.mjs` is the
verification the plan named: it mounts every registered surface through the same constructed seam
the other renderer lanes use, on a phone page, and its negative control (remove the grab handle from
one conforming surface, require that row alone to go red, require a clean re-mount to restore green)
was observed both ways before this phase called itself proven.
<!-- /ANCHOR:how-delivered -->

---

<!-- ANCHOR:decisions -->
## Key Decisions

| Decision | Why |
|----------|-----|
| Open one phase rather than fix three sheets | The three reports share a cause: `applySheetChrome` supplies mount, scrim and drag, while header, rows, segmented choices, keyboard inset and safe area are per-instance or absent. Three fixes would leave the fourth instance to be found by the operator. |
| Consume `016`'s drag and `003`'s portal unchanged | Both are shipped and measured. Confirmed zero diff against every base this phase rebased onto (`touch-environment.ts`, `sheet-flick.test.ts`, the flick/drag constants). |
| Do not register `settings`/view-config in the sheet-grammar lane | Its header and close conform; its body's `.db-view-config-row` grammar and native radio group do not, and re-deriving that row grammar is a larger, separate change this leg was not dispatched to make. Measured red on `rows`/`segmented`, left unregistered rather than silently exempted. |
| Keep `040-settings-sheet`'s own header/scroll-host architecture rather than swapping to `createSheetHeader` | The swap is not trivial: the settings leg's `.db-view-config-body` scroll-host split fixes a real, separately-verified bug (`sheet-rebuild.mjs`'s scroll-survival case) that `createSheetHeader` alone does not provide. Added `db-sheet-close` alongside its own class instead — additive, not a rewrite. |
| Fix `attachSheetChromeToModal`'s teardown rather than gate around it | The regression it reproduced (`98da630d`) is a real freeze, not a theoretical one, and the fix is a two-line mirror of the already-shipped `DbModal.onClose` pattern. |
| Fix `captureRootFor`'s `source`/`kind` bug rather than work around it | It blocked every full capture run for every future session until fixed, was a one-line property-name correction, and already had every other call site in the same file using the correct field. |
<!-- /ANCHOR:decisions -->

---

<!-- ANCHOR:verification -->
## Verification

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | Exit 0 |
| `npx vitest run` | 1113/1113 (107 files) |
| `npm run lint` | 172 problems, unchanged from the branch base |
| `npm run lint:tools` | Clean |
| `node tools/naming/scan-comments.mjs` | PASS |
| `node tools/live/sheet-grammar.mjs` | PASS — 6 surfaces × 7 elements, List-row absence, negative control both directions |
| `node tools/live/sheet-teardown.mjs` | PASS — 12 producers, 0 leaking (includes the `attachSheetChromeToModal` regression case) |
| `npm run storybook:placement` | 402/403 geometry checks, 1 declared red (unrelated, pre-existing) |
| `npm run screenshots:verify` | 0 stale, 552 entries |
| `node tools/live/touch-targets.mjs` | PASS — fixture 199 (corrected from a stale 279; already 199 at this phase's own branch base, unmoved through the rebase and every edit), constructed 1220 (corrected from 1223; the 3-control drop isolated to `db-icon-only-button` the settings-sheet leg resized between base and rebase tip — not this release) |
| `npm run gate` | PASS — 26/26 green (`sheet-grammar` newly registered, 21 → 26) |
| `validate.sh 044-phone-sheet-alignment --strict` | Run at commit time; see the packet commit |
| Operator device confirmation | Not sought this session (AC-006) |
<!-- /ANCHOR:verification -->

---

<!-- ANCHOR:limitations -->
## Known Limitations

1. **AC-006 cannot close here.** Device confirmation is the operator's, and it is the row that
   actually closes the phase — every previous sheet fix on this program passed its own gate and
   still reached the operator broken.
2. **tasks.md T014 is not done.** `../roadmap.md` §4 rows 40/41/43 and `../spec.md`'s Phase
   Documentation Map row still carry their pre-work text; explicitly out of this leg's dispatched
   scope, left for a follow-up pass.
3. **The settings sheet's body grammar is a known, unregistered gap.** `.db-view-config-row` and a
   native `input[type="radio"]` group are pre-existing, not introduced here; closing them is a larger
   change to a file this leg did not otherwise need to restructure.
4. **CHK-043 (README naming the grammar module) is open.** `src/views/README.md`/`CODE.md` name no
   individual file today; adding one entry for `sheet-grammar.ts` alone would invent a convention the
   folder doc doesn't otherwise use.
<!-- /ANCHOR:limitations -->

---
