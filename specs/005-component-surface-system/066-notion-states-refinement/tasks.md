---
title: "Tasks: Notion States Refinement"
description: "Eighteen legs: two decisions, six builds, one reconciliation, the lane rows, the device read, and a landing-verification capture-pipeline fix. Task Format: T### [P?] Description (file path)"
trigger_phrases:
  - "066 tasks"
  - "notion states refinement tasks"
  - "toast dwell task"
  - "inline chip task"
  - "fast band census task"
importance_tier: "important"
contextType: "general"
---
<!-- SPECKIT_TEMPLATE_SOURCE: tasks-core | v2.2 -->
# Tasks: Notion States Refinement

<!-- SPECKIT_LEVEL: 3 -->

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

Every build leg carries a **red-first proof**: the exact check, and the value it reads on the tree at
`38bba1e3` before the fix exists. Every lane row extends an existing `tools/live/` lane; this packet
creates no new lane file and never ticks an operator device row.
<!-- /ANCHOR:notation -->

---

<!-- ANCHOR:phase-1 -->
## Phase 1: Setup — record the decisions before the code reads them

- [x] T001 [P0] **Record ADR-003, the action-toast dwell.** The 5000ms figure is an inference: no
      capture can show a Notion duration, and the 2200ms it splits from is an unmeasured inheritance
      from the operation-result rail (`../055-states-feedback-and-motion/design-trueup.md:350`;
      ADR-005's toast row at `decision-record.md:452-460` measures only the 0.2s Anytype transition).
      The ADR states the inference, names D-2 as the check that would move it, and fixes the
      matrix the tests assert. Already fully recorded as `Proposed` (correct, pending the device
      pass); T004's matrix matches it exactly. (`decision-record.md`)
- [x] T002 [P] [P0] **Record ADR-004, the fast-band curve.** Decided: **option 1** — a dedicated
      `--db-motion-fast-out: 120ms ease-out` token (`styles.css:146`) joins the block and the four
      literals alias it, so the migration changes no surface's curve. Status moved to Accepted with
      the reasoning. (`decision-record.md`)
- [x] T003 [P] [P1] **Record ADR-001 and ADR-002.** Both were ruled by the operator on
      **2026-09-06 18:50**: *"Keep one weight"* (ADR-001 — the single `danger` boolean holds, zero
      code) and *"Centre on phone, keep corner on desktop"* (ADR-002 — the phone half is T017, the
      desktop corner stays). Both quotes are verbatim in `decision-record.md`, each with its date and
      time. (`decision-record.md`)
<!-- /ANCHOR:phase-1 -->

---

<!-- ANCHOR:phase-2 -->
## Phase 2: Implementation

- [x] T004 [P0] **Split the toast's dismissal budget.** Added `ACTION_DISMISS_MS = 5000` beside
      `AUTO_DISMISS_MS = 2200` (`src/views/toast.ts:62-68`) and selected on `options.action` at the
      single `setTimeout` (now `:143-145`). The `error` branch is untouched, asserted so by a
      negative-match source test.
      **Red-first proof (observed):** stashed the fix and reran `toast.test.ts` — 2 of 15 failed:
      the source-text assertion for the two constants, and the dwell-matrix test asserting a
      success-with-action toast is still connected at 3000ms (it read 0 children, removed at
      2200ms). **Green:** restored the fix, same run — 15/15 pass, including a plain success still
      clearing at 2500ms (the negative control) and an error toast never auto-dismissing with or
      without an action. (`src/views/toast.ts`, `src/views/toast.test.ts`)
- [x] T005 [P0] **Route `deleteRow`'s failure through the toast.** Replaced the bare
      `new Notice(t("errors.deleteFailed", …))` at `src/views/database-view.ts:8378` with a
      `showToast` carrying `severity: "error"`, guarded by the same `if (this.containerEl_)` the
      success branch already uses.
      **Red-first proof (observed):** added an integration test to `deletion-undo.test.ts` (the
      existing `Object.create(DatabaseView.prototype)` harness with `showToast` mocked) that forces
      `trashNote` to reject; stashed the fix and ran it — failed, `raisedToasts` held nothing
      (severity read `undefined`). **Green:** restored the fix — the same test asserts
      `severity: "error"`, no action, and zero bare `Notice` calls; full file 18/18 pass.
      (`src/views/database-view.ts`, `src/views/deletion-undo.test.ts`)
- [x] T006 [P0] **Route the two remaining owned `errors.deleteFailed` catches.** `duplicateRow`'s
      catch (`src/views/database-view.ts:8468`) and the third site (now `:3684`, the whole-database
      delete) route through the same `showToast` pattern as T005's, each behind its own
      `containerEl_` guard.
      **Red-first proof (observed):** `rg -n "new Notice\(" src --glob '!*.test.ts' | wc -l` read
      **242** before this pass. **Green:** the same command now reads **239** — three owned sites
      moved, and each renders `.db-toast.is-error` per T005's proof (the same `showToast` call
      shape). The remaining 239 are the open lane D5 leaves for a future pass.
      (`src/views/database-view.ts`)
- [x] T007 [P1] **Add `renderInlineChip` beside `renderCard`.** A warning icon (`alert-triangle`,
      fixed regardless of reason), a label, a chevron action, `role="status"` +
      `aria-live="polite"`, no dismiss control. Additive: the fourteen-member `EmptyStateReason`
      union (`empty-state-renderer.ts:25-39`) is unchanged, and no existing call site was rewired to
      call it. **Red-first proof (observed):** stashed the method and reran
      `empty-state-renderer.test.ts` — 4 new tests failed with `renderInlineChip is not a function`.
      **Green:** restored — 35/35 pass, covering both `source-missing` and `group-relation-deleted`,
      the wired chevron action, and the no-action/no-button case.
      **Amended at landing:** additive was not enough. AC-004's `When` is a board rendering, and no
      board rendered the chip, so the criterion was proven by a method nothing called.
      `BoardRenderer.render` already receives an `EmptyStateOptions` from both call sites
      (`database-view.ts:10659-10665`, `embedded-database-renderer.ts:1287`) and dropped it on the
      floor, so a board whose group relation was deleted rendered a blank strip. Four lines in
      `render` now hand a stale reference to `renderInlineChip`; an ordinary empty result is
      untouched and still belongs to the per-column card, gated by `STALE_REFERENCE_REASONS`
      exported beside the reason union. **Red-first proof (observed):** removed the four lines and
      reran — 2 of the 4 new `board-renderer-hierarchy.test.ts` cases failed; restored — 9/9 pass.
      (`src/views/empty-state-renderer.ts`, `src/views/empty-state-renderer.test.ts`,
      `src/views/board-renderer.ts`, `src/views/board-renderer-hierarchy.test.ts`)
- [x] T008 [P1] **Add the `.db-inline-chip` block.** Beside `.db-empty-card.is-compact`: background
      `color-mix(in srgb, var(--text-error) 10%, var(--background-primary))`, icon on
      `var(--text-error)`, **zero hex literals**, action tap target `30px` matching `.db-menu-item`'s
      established floor (the §6A 44px rule governs table rows, not this chip).
      **Red-first proof (observed):** `grep -c "db-inline-chip" styles.css` read **0** before this
      task. **Green:** now reads **8** (container, icon, icon-svg, label, action, action-hover,
      action-svg, plus the comment). (`styles.css`)
- [x] T009 [P1] **Take the fast band to zero literals, per ADR-004 option 1.** The four
      declarations were re-located by grep at their current lines (`styles.css:204`, `:477`,
      `:7435`, `:22853` — drifted from the packet's `:200`/`:473`/`:7431`/`:22745` by commits landed
      since this packet opened; the token definition at `:122` and the comment at `:434` were
      confirmed not targets) and now read `var(--db-motion-fast-out)`, the token added at `:146`.
      The five residual `var(--db-transition-fast)` uses (re-located at `:2041`, `:5465`, `:5682`,
      `:20322`, `:21962`) now read `var(--db-motion-fast)`.
      **Red-first proof (observed):** `grep -c "120ms ease-out" styles.css` read **4** and
      `grep -c "var(--db-transition-fast)" styles.css` read **6** (5 call sites + 1 alias
      definition) before this task; a pre-existing permanent guard, `motion-tokens.test.ts`,
      pinned exactly those two counts and had to be updated in the same pass — its own two
      assertions are this task's second red/green pair (stashed `styles.css`, both failed; restored,
      both pass). **Green:** `grep -c "120ms ease-out"` now reads **1** (the new token's own
      definition, not a declaration) and `grep -c "var(--db-transition-fast)"` reads **1** (the
      `--db-motion-fast` alias only); `motion-tokens.test.ts` 7/7 pass. (`styles.css`,
      `src/views/motion-tokens.test.ts`)
- [x] T017 [P1] **Centre the shared placement on phone; keep the desktop corner, per ADR-002.**
      The toast stack (`styles.css:2724-2736`, unmoved) and the operation-result rail host
      (`:2714-2719`, unmoved) are unchanged outside the band; inside it (`@media (pointer: coarse),
      (max-width: 760px)`, re-located at `:21053`, drifted from `:20945`) both now carry
      `left`/`right: var(--db-space-6)` with `width: auto`, and `.db-toast.is-inline` fills its
      now-symmetric parent at `width: 100%`.
      **Red-first proof (by CSS arithmetic against the cited constants, not a browser
      measurement):** at 390px the stack's unclamped 384px at `right: 12px` computes a left margin
      of `390 - 384 - 12 = -6px`; at 430px the rail's `min(384px, calc(100vw - 32px))` clamp
      resolves to 384px, giving a left margin of `430 - 16 - 384 = 30px` against a right margin of
      16px. **Green (by the same arithmetic on the new rule):** both anchors now read
      `left = right = var(--db-space-6)` (16px) at both viewports, symmetric by construction rather
      than by accident.
      **Measured at landing, and the arithmetic was half wrong.** Mounting the DOM `showToast`
      actually builds against the shipped stylesheet in Chrome at 390px, 402px and 430px: the stack
      centred exactly as claimed (left 16px, right 16px, 0px difference), but the rail's card read
      left 16px against right **−16px** — 32px too wide, hanging off the edge the centring exists to
      square up. `.db-toast` is `box-sizing: content-box`, so the band's `width: 100%` added the
      card's own 32px of padding to its host's width instead of counting it inside. The arithmetic
      could not see this: it reasoned about the declared values, and the defect is in how the box
      model resolves them. Fixed with one declaration beside that `width: 100%`; re-measured, both
      cards now read 16px/16px at all three widths, and desktop at 1280px is unchanged (stack
      `right: 12px` at 384px, rail `right: 16px`). (`styles.css`)
- [x] T010 [P1] **Reconcile `055`'s stale rows and lagging checkboxes.** In
      `../055-states-feedback-and-motion/goal.md`: the toast row now reads **239** (re-derived
      2026-09-07, after T006 landed — not the 242 this packet opened with) with
      `notice.galleryMigrated` (`src/i18n.ts:1473`) confirmed delivered by `showToast` with an Undo
      (`database-view.ts:2718-2723`); the item-9 row now reads **14** reasons
      (`empty-state-renderer.ts:25-39`), `group-relation-deleted` and `source-missing` both
      included — ticked; the E4 row confirmed GREEN — `row-menu.ts:163-171` calls `deleteRow`
      directly with no `confirmWithModal`, `deleteRow` (`database-view.ts:8349-8390`) confirms only
      its own unreadable-snapshot case — ticked; the motion row now reads **0** raw fast-band
      declarations (down from the 42 it claimed, via an interim 4 this same packet's T009 just
      closed), tokens at `styles.css:122` and `:146`. In `../055-states-feedback-and-motion/tasks.md`:
      T019's amendment ticked with the same row-menu.ts evidence; T020 ticked, since this row is
      exactly what it names as closed by this task. **T003 stays `[ ]`, on purpose** — its own
      unclosed gap (the `nothingToUndo` branch needs a live `App`/vault/metadata cache) is untouched
      by anything in this packet's scope, so reconciling it means confirming it correctly stays
      open, not ticking it on a sibling packet's unrelated fixes.
      **Red-first proof:** each old claim (0 of 247, 12 reasons, RED, 42 declarations) was
      independently re-confirmed false against the current tree before its replacement was written,
      per the file:line citations in the row itself.
      (`../055-states-feedback-and-motion/goal.md`, `../055-states-feedback-and-motion/tasks.md`)
- [x] T011 [P2] **Record R6 and R7 as future and conditional, and do not build them.** Already
      fully recorded in `decision-record.md`'s "Recorded, not built" table (both patterns, their
      dispositions and their red-first checks) as part of this packet's opening — confirmed present
      and unbuilt; no code changes made. (`decision-record.md`)
<!-- /ANCHOR:phase-2 -->

---

<!-- ANCHOR:phase-3 -->
## Phase 3: Verification

- [x] T012 [P0] **Extend the existing lanes with the computed rows.** Built into
      `tools/storybook/verify-placement.mjs` — the file that already drives the production
      `showToast` for AC-001/AC-002's own geometry rows, so this is a new section in an owning lane
      rather than a 27th one. `npm run storybook:placement` is the gate's `placement` check, one of
      the 26.
      Five permanent rows: the toast stack centred within 1px at 390/402/430px; the
      operation-result rail centred within 1px at the same three widths, built by mounting
      `showToast(document, { severity, message, container })` against a `db-operation-result-rail
      db-surface` host constructed exactly as `showOperationResult` (`database-view.ts:11336`)
      builds it, not a fixture copy of the CSS; the stack's desktop corner unmoved by the phone band
      (384px wide, `right: 12px`); the rail's desktop corner unmoved (`right: 16px`); and the owned
      bare-notice census, read fresh every run by walking `src/**/*.ts` (test files excluded) and
      ratcheting a ceiling of 239 rather than trusting a number written into a document.
      Each of the first four carries its own negative control, watched red then restored: forcing
      `.db-toast.is-inline`'s phone-band rule to `box-sizing: content-box` reproduced T017's own
      landing reading exactly — left 16px against right **−16px**, a 32px difference, at all three
      phone widths — then `git checkout -- styles.css` restored it and the same run read 16px/16px
      again; reverting the phone-band `.db-toast-stack` rule to its pre-fix `right`-only form
      reproduced the pre-fix arithmetic (−6px left margin equivalent at 390px, a 30px-vs-16px split
      at 430px), then restored; widening the desktop stack's `width` and moving the desktop rail's
      `right` each turned only their own row red, then restored. The census row's control added one
      temporary `new Notice(` call to `database-view.ts` (240, one over the ceiling, row red), then
      `git checkout -- src/views/database-view.ts` restored it (239, green).
      A geometry read taken directly off the animated `.db-toast` card during the entrance keyframe
      is not a layout — even under `reducedMotion: "reduce"`, which shortens the duration but does
      not skip the keyframes — so the harness settles 60ms before reading, matching how the
      pre-existing toast section in this same file avoids the same trap with `offsetWidth`. Margins
      are read against each card's own containing block rather than uniformly against
      `window.innerWidth`: the body-mounted stack resolves `position: fixed` against the true
      viewport, but the rail mounts inside `.note-database-container`, and the reproduced
      `contain: strict` on `.workspace-leaf` makes the leaf — not the window — the containing block
      for everything positioned inside it, exactly as it does in the shipped app.
      **What stays at the level below this lane, deliberately:** the dwell budget. `goal.md`'s own
      completion criterion asks for a lane row reading the two computed budgets apart, and that
      criterion stays unticked — see `goal.md` for why a millisecond-scale timer is the wrong shape
      for a browser-driven row and the fake-timer Vitest matrix (T004) is the right strength.
      (`tools/storybook/verify-placement.mjs`)
- [x] T013 [P0] **Run the three gates and read each exit status.** `npx tsc --noEmit` → exit 0,
      no output. `npm run build` → exit 0. `npx vitest run` → exit 0, 1530/1530 across 142 files
      (up from 1520 before this packet's new tests: +6 in `toast.test.ts`, +3 in
      `empty-state-renderer.test.ts`, +1 in `deletion-undo.test.ts`). None is a run that exercised
      nothing: the
      dwell matrix and the chip tests are new production-module coverage this same task pair added.
- [B] T014 [P1] **Re-derive the captures for the chip.** BLOCKED — nothing to capture yet.
      `renderInlineChip` (T007) is additive and, per its own frozen file scope, not wired into any
      board/table/embed call site in this pass — no context in the shipped product renders it, so a
      screenshot of "a compact context carrying the chip" does not exist to re-derive; the chip's
      shape is proven instead by the direct render tests in `empty-state-renderer.test.ts`. Wiring a
      real caller onto it is follow-on work outside `spec.md`'s Files to Change table.
      (`screenshots/`)
- [ ] T015 [B] [P1] **The operator device read, D-1, D-2 and the centred placement.** D-1: iOS
      `Reduce Motion` stops the skeleton shimmer and snaps entrances inside the plugin's WKWebView —
      unverifiable from source or captures, because media-query behaviour in a webview is exactly the
      class of fact the device pass owns. D-2: the Undo target is one-hand reachable at the rail's
      clamped phone width `min(384px, calc(100vw - 32px))` (`styles.css:2756-2767`), without which
      the 5000ms window is a number and not an affordance. A third read joins them, owed by ADR-002's
      18:50 ruling: the centred stack reads as placed for the thumb on the same handset (AC-008's
      third clause). All ride `055` `tasks.md` T017 rather than opening a new pass. Blocked on the
      operator.
- [x] T016 [P1] **The operator rules ADR-001 and ADR-002.** **Ruled 2026-09-06 18:50** — *"Keep one
      weight"* and *"Centre on phone, keep corner on desktop"*, both quoted verbatim in
      `decision-record.md`. This row records the operator's own completed act; the packet's device
      rows are the ones still waiting on them.
<!-- /ANCHOR:phase-3 -->

---

<!-- ANCHOR:phase-4 -->
## Phase 4: Landing-Verification Evidence Closure

Two capture-pipeline defects surfaced while re-reading the corpus this packet's own toast work
sits beside, neither a new criterion against `goal.md` §3 and both closed at their root rather than
worked around.

- [x] T018 [P0] **The eight `chrome-toast-*` captures' nondeterministic `layoutHash` at a stable
      `pixelHash`, and the `dropdownDesktopSheet` render-assertion's unreachable query bug.**
      Since the toast landing `af0e8796`, `chrome-toast-success` and `chrome-toast-error`
      (`tools/screenshots/scenarios/chrome.mjs`) each carry `layoutHash` that flips between two
      values across repeated capture runs at an unchanged `pixelHash` — two prior landers observed
      it and each restored the flip to whatever value happened to be committed rather than fixing
      it (`065-notion-record-refinement`'s and `063-notion-dropdown-refinement`'s own
      `tools/lane/css-lane.json` release notes both name it). Root cause: `.db-toast` carries an
      entrance keyframe (`animation: db-toast-in`, `styles.css:2902`) scaling from
      `--db-motion-scale-from` to 1; `reducedMotion: "reduce"` shortens its duration to 0.01ms
      rather than removing it, and `capture.mjs` reads the layout hash via
      `getBoundingClientRect()` — which reflects the live transform — before the screenshot call's
      own `animations: "disabled"` fast-forwards anything. Whether the read landed before or after
      that sub-millisecond keyframe finished was a scheduling race.
      **Red observed, re-run on the merged tree at landing:** with the fix backed out,
      `node tools/screenshots/capture.mjs --only chrome-toast-success` four times —
      `chrome-toast-success-desktop-*` read `ec7335c12b6a` on runs 1 and 2 and `7425a6d0cd70` on
      runs 3 and 4, and the mobile pair flipped between `ffd9d0f9aefb` and `5ac877430f1c`. Run 1
      disagreed with itself: its dark and light passes photograph one layout and must share one
      hash, and they did not. `pixelHash` identical on every run. `--only chrome-toast-error` did
      **not** reproduce a live flip in ten backed-out runs on this machine; its race is evidenced
      instead by the committed manifest, where `chrome-toast-error-desktop-dark` carried
      `5d4e87a8263a` and its light pair `02d0836ee6f6` — one device, one layout, two hashes, which
      only a past flip explains. The error scenario's share of the fix is therefore prophylactic
      against the identical latent keyframe rather than a live-reproduced red, and this row says so
      rather than claiming eight reproductions.
      **Fix:** `animation: none !important;` added to `.db-toast` in both scenarios' `captureCss`
      (`tools/screenshots/scenarios/chrome.mjs`) — removes the race instead of narrowing it.
      **Green:** three repeated runs of each scenario with the fix in — all eight captures stable,
      `pixelHash` unchanged, and the settled value is the post-animation rect rather than whichever
      member of the racy pair a run happened to catch. Three opened and read
      (`chrome-toast-success-desktop-dark`, `chrome-toast-success-mobile-dark`,
      `chrome-toast-error-mobile-light`) — full opacity, no clipped or mid-transform artifact, and
      the phone capture shows the taller `Undo` box `064-notion-toolbar-refinement`'s own 46px
      floor gives it.
      A second, unrelated defect shares this leg because fixing either forces the same full
      recapture: `render-assertion-harness.ts`'s `dropdownDesktopSheet` branch (added by
      `063-notion-dropdown-refinement`, see that packet's `tasks.md` T018 addendum) queried
      `container.querySelector(".db-dropdown-popover.db-dropdown-popover-desktop-sheet")` against
      a sheet `openDropdownPopover` portals to `document.body`, and no scenario ever set
      `dropdownDesktopSheet: true` in `render-assertion-bundle.mjs`'s `STATE_SCENARIOS` or in
      `render-assertions.mjs`'s `rulesScenarios` filter — the assertion could not have passed and
      had never run in any gate lane. Fixed to `container.ownerDocument.querySelector(...)`
      (matching the icon- and colour-picker branches beside it), wired `core-dropdown-desktop-
      sheet/file-view` into `STATE_SCENARIOS` and `scenario.dropdownDesktopSheet === true` into the
      `rulesScenarios` filter. **Red, wired, before the query fix:** `node
      tools/live/render-assertions.mjs` → `core-dropdown-desktop-sheet/file-view: a cramped
      anchored placement escalated to a titled sheet with its own search row — no
      .db-dropdown-popover-desktop-sheet — the anchored branch fired instead` (false negative — the
      sheet was present). **Negative control (with the query fix applied):** the scenario's option
      count dropped from thirty to three so the anchored branch genuinely fires — the same
      assertion correctly fails with the same detail line, proving it is not vacuously true.
      **Green:** option count restored to thirty — `PASS core-dropdown-desktop-sheet/file-view  a
      cramped anchored placement escalated to a titled sheet with its own search row`; full
      `render-assertions.mjs` run, 0 failures.
      Both edits (`render-assertion-harness.ts`, a `tools/screenshots/scenarios/` module) sit in
      `CAPTURE_INPUTS`/`SHARED_CONSTRUCTED_SOURCES`, so every one of the 606 manifest entries'
      `sourceHashes` moves regardless of which scenario it belongs to — this leg's own full
      recapture (`npm run screenshots`, 606 entries, `screenshots:verify` exit 0) is that forced
      run, not a separate one, and it was run three times over this landing. Zero of the 606 moved
      a pixel that reproduced. Exactly three `layoutHash` values moved against the merged base, the
      same three on all three runs — `chrome-toast-error-desktop-light` `02d0836ee6f6` →
      `5d4e87a8263a`, `chrome-toast-success-desktop-light` `ec7335c12b6a` → `7425a6d0cd70`,
      `chrome-toast-success-mobile-dark` `ffd9d0f9aefb` → `5ac877430f1c`. Not eight: the other five
      already carried the settled value on the merged base, two of them because
      `064-notion-toolbar-refinement` recaptured `chrome-toast-success-mobile-*` when it landed its
      `.is-phone .db-toast-action` 46px floor. Between eleven and sixteen captures moved PNG bytes
      on each run, but each run's set was largely disjoint from the others', and every one measured
      against its committed PNG came back sub-visual (max channel delta 12, mean ≈1) — capture
      jitter, judged by decoded pixel delta rather than by `pixelHash`, which is blind to a small
      real change. One capture per run also moved `pixelHash` — `timeline-view-desktop-light` on
      run 1, `timeline-subtask-tree-desktop-light` on run 3 — and each came back to its committed
      value on the next run. All were restored to their committed bytes with `manifest.json`'s
      `bytes` and `pixelHash` fields patched back to match. `tools/lane/css-lane.json` acquired from
      `064-notion-toolbar-refinement` at its own released hash (`acd49f23b031`, unmoved — no
      `styles.css` edit here) and released naming all eight `chrome-toast-*` captures.
      (`tools/screenshots/scenarios/chrome.mjs`, `tools/live/render-assertion-harness.ts`,
      `tools/live/render-assertion-bundle.mjs`, `tools/live/render-assertions.mjs`,
      `screenshots/manifest.json`, `tools/lane/css-lane.json`,
      `../063-notion-dropdown-refinement/tasks.md`)
<!-- /ANCHOR:phase-4 -->

---

<!-- ANCHOR:ai-protocol -->
## AI Execution Protocol

### Pre-Task Checklist

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | Read the task and every file it names before the first edit | [ ] | The `file:line` citations in the task's own row |
| 2 | Confirm the task's threshold was observed red, with the failing figure recorded | [ ] | The Verification cell in `acceptance-criteria.md` |
| 3 | Confirm the leg touches no file another leg owns (`styles.css` excepted, CSS lane serialized) | [ ] | `plan.md`'s affected-surfaces table |
| 4 | Confirm what may not change: `055`'s vocabulary, its motion token values, and both landed Anytype rulings | [ ] | `goal.md` D4, D7 |

### Execution Rules

| Rule | Detail |
|------|--------|
| One leg, one file group | A leg opens its files once; `styles.css` goes through the parent's serialized CSS lane |
| Red first | A task whose threshold has no recorded failing figure does not start |
| No Notion number | Shapes and behaviours only; every value comes from the tree or from an ADR that calls it an inference |
| Exit statuses from `$?` | `cmd >/tmp/out.log 2>&1; echo $?` — never through a pipe |
| Captures read by a person | A changed PNG is opened and read; a capture that succeeds is not a capture that is right |
| Scope lock | Nothing outside `spec.md`'s Files to Change table; adjacent findings are named, not fixed |

### Status Reporting Format

| Status | Meaning |
|--------|---------|
| `OK` | The task's threshold passed and its negative control was seen red before green |
| `OK (residual)` | Threshold passed; the named residual is recorded in the task row, not silent |
| `BLOCKED <reason>` | Forward progress stopped; the blocker and the needed decision are named |

### Blocked Task Protocol

1. Stop at the first failed check; do not retry the same command twice without new evidence.
2. Restate the problem one level up — the interface, the data flow, or the module boundary.
3. If the block is a landed ruling this packet holds (ADR-001, ADR-002), name the conflict in the
   task row and stop; parent `goal.md` D15 forbids resolving it silently. Both of this packet's
   conflicts were ruled on 2026-09-06 18:50 and the ruling path is the one this rule names.
4. Operator-owned rows (T015, AC-008) are never unblocked by an agent. T016 was closed by the
   operator's own ruling, recorded above; AC-007 closed with it.
<!-- /ANCHOR:ai-protocol -->

---

<!-- ANCHOR:completion -->
## Completion Criteria

- [ ] All tasks marked `[x]`, or `[B]` with the blocker named and owned
- [ ] No `[B]` blocked tasks remaining that are this packet's to unblock
- [ ] Every row in `acceptance-criteria.md` is `Met`, `Waived` or `Superseded`
<!-- /ANCHOR:completion -->

---

<!-- ANCHOR:cross-refs -->
## Cross-References

- **Goal**: See `goal.md`
- **Specification**: See `spec.md`
- **Plan**: See `plan.md`
- **Acceptance Criteria**: See `acceptance-criteria.md`
- **Decisions**: See `decision-record.md`
- **Research**: See `../055-states-feedback-and-motion/research/research.md`
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

- [ ] CHK-001 [P0] Requirements documented in spec.md
- [ ] CHK-002 [P0] Technical approach defined in plan.md
- [ ] CHK-003 [P1] Dependencies identified and available
<!-- /ANCHOR:pre-impl -->

---

<!-- ANCHOR:code-quality -->
## Code Quality

- [ ] CHK-010 [P0] Code passes lint/format checks
- [ ] CHK-011 [P0] No console errors or warnings
- [ ] CHK-012 [P1] Error handling implemented
- [ ] CHK-013 [P1] Code follows project patterns
<!-- /ANCHOR:code-quality -->

---

<!-- ANCHOR:testing -->
## Testing Checklist

- [ ] CHK-020 [P0] All acceptance criteria met
- [ ] CHK-021 [P0] Manual testing complete
- [ ] CHK-022 [P1] Edge cases tested
- [ ] CHK-023 [P1] Error scenarios validated
<!-- /ANCHOR:testing -->

---

<!-- ANCHOR:fix-completeness -->
## Fix Completeness

- [ ] CHK-FIX-001 [P0] Each actionable finding has a finding class: `instance-only`, `class-of-bug`, `cross-consumer`, `algorithmic`, `matrix/evidence`, or `test-isolation`.
- [ ] CHK-FIX-002 [P0] Same-class producer inventory completed, or instance-only status proven by grep.
- [ ] CHK-FIX-003 [P0] Consumer inventory completed for changed helpers, policies, schema fields, response fields, docs, and tests.
- [ ] CHK-FIX-004 [P0] Security/path/parser/redaction fixes include adversarial table tests for delimiter, joined-input, outside-root, no-op, and fallback cases.
- [ ] CHK-FIX-005 [P1] Matrix axes and row count are listed before completion is claimed.
- [ ] CHK-FIX-006 [P1] Hostile env/global-state variant executed when tests or code read process-wide state.
- [ ] CHK-FIX-007 [P1] Evidence is pinned to a fix SHA or explicit diff range, not a moving branch-relative range.
<!-- /ANCHOR:fix-completeness -->

---

<!-- ANCHOR:security -->
## Security

- [ ] CHK-030 [P0] No hardcoded secrets
- [ ] CHK-031 [P0] Input validation implemented
- [ ] CHK-032 [P1] Auth/authz working correctly
<!-- /ANCHOR:security -->

---

<!-- ANCHOR:docs -->
## Documentation

- [ ] CHK-040 [P1] Spec/plan/tasks synchronized
- [ ] CHK-041 [P1] Code comments adequate
- [ ] CHK-042 [P2] README updated (if applicable)
<!-- /ANCHOR:docs -->

---

<!-- ANCHOR:file-org -->
## File Organization

- [ ] CHK-050 [P1] Temp files in scratch/ only
- [ ] CHK-051 [P1] scratch/ cleaned before completion
<!-- /ANCHOR:file-org -->

---

<!-- ANCHOR:summary -->
## Verification Summary

| Category | Total | Verified |
|----------|-------|----------|
| P0 Items | 8 | 0/8 |
| P1 Items | 12 | 0/12 |
| P2 Items | 5 | 0/5 |

**Verification Date**: 2026-09-06
<!-- /ANCHOR:summary -->

---

<!-- ANCHOR:arch-verify -->
## L3+: Architecture Verification

- [ ] CHK-100 [P0] Architecture decisions documented in decision-record.md
- [ ] CHK-101 [P1] All ADRs have status (Proposed/Accepted)
- [ ] CHK-102 [P1] Alternatives documented with rejection rationale
- [ ] CHK-103 [P2] Migration path documented (if applicable)
<!-- /ANCHOR:arch-verify -->

---

<!-- ANCHOR:perf-verify -->
## L3+: Performance Verification

- [ ] CHK-110 [P1] Response time targets met (NFR-P01)
- [ ] CHK-111 [P1] Throughput targets met (NFR-P02)
- [ ] CHK-112 [P2] Load testing completed
- [ ] CHK-113 [P2] Performance benchmarks documented
<!-- /ANCHOR:perf-verify -->

---

<!-- ANCHOR:deploy-ready -->
## L3+: Deployment Readiness

- [ ] CHK-120 [P0] Rollback procedure documented and tested
- [ ] CHK-121 [P0] Feature flag configured (if applicable)
- [ ] CHK-122 [P1] Monitoring/alerting configured
- [ ] CHK-123 [P1] Runbook created
- [ ] CHK-124 [P2] Deployment runbook reviewed
<!-- /ANCHOR:deploy-ready -->

---

<!-- ANCHOR:compliance-verify -->
## L3+: Compliance Verification

- [ ] CHK-130 [P1] Security review completed
- [ ] CHK-131 [P1] Dependency licenses compatible
- [ ] CHK-132 [P2] OWASP Top 10 checklist completed
- [ ] CHK-133 [P2] Data handling compliant with requirements
<!-- /ANCHOR:compliance-verify -->

---

<!-- ANCHOR:docs-verify -->
## L3+: Documentation Verification

- [ ] CHK-140 [P1] All spec documents synchronized
- [ ] CHK-141 [P1] API documentation complete (if applicable)
- [ ] CHK-142 [P2] User-facing documentation updated
- [ ] CHK-143 [P2] Knowledge transfer documented
<!-- /ANCHOR:docs-verify -->

---

<!-- ANCHOR:sign-off -->
## L3+: Sign-Off

| Approver | Role | Status | Date |
|----------|------|--------|------|
| Operator | Technical Lead | [ ] Approved | |
| Operator | Product Owner | [ ] Approved | |
| Operator | QA Lead | [ ] Approved | |
<!-- /ANCHOR:sign-off -->
